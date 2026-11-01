import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The compound-interest simulator (asked by the client on 2026-11-01), through
// the real API: it reuses the client's formulas F020 and F029 to F031 — and no
// other — and every figure of it says which one produced it.

let t;
const run = (json) => t.request('POST', '/tools/simulations/interet-compose', { json });

before(async () => {
  t = await boot();
});
after(() => t.close());

describe('the compound-interest simulator', () => {
  test('a lump sum at 12 % capitalised monthly for one year: 1 000 000 × 1,01^12', async () => {
    const res = await run({ currency: 'DZD', capital: 1000000, periodicContribution: 0, annualRate: 0.12, years: 1, compoundingsPerYear: 12 });
    assert.equal(res.status, 200, JSON.stringify(res.body).slice(0, 200));
    const r = res.body.resultats;
    assert.equal(r.tauxPeriodique.resultat, 0.01);
    assert.equal(r.valeurFutureCapital.resultat, 1126825);
    assert.equal(r.valeurFutureVersements.resultat, 0);
    assert.equal(r.valeurFutureTotale.resultat, 1126825);
    assert.deepEqual(Object.values(r).map((answer) => answer.formule_id), ['F020', 'F029', 'F030', 'F031']);
  });

  test('regular payments at the end of each period (F030) add to the capital’s growth (F029)', async () => {
    const res = await run({ currency: 'DZD', capital: 1000000, periodicContribution: 100000, annualRate: 0.12, years: 1, compoundingsPerYear: 12 });
    const r = res.body.resultats;
    assert.equal(r.valeurFutureVersements.resultat, Math.round(100000 * ((1.01 ** 12 - 1) / 0.01)));
    assert.equal(r.valeurFutureTotale.resultat, r.valeurFutureCapital.resultat + r.valeurFutureVersements.resultat);
  });

  test('the year-by-year series: one row per year, the last one equal to the total, what was paid in alongside', async () => {
    const res = await run({ currency: 'DZD', capital: 1000000, periodicContribution: 50000, annualRate: 0.06, years: 5, compoundingsPerYear: 12 });
    const { serie, resultats } = res.body;
    assert.deepEqual(serie.map((row) => row.annee), [1, 2, 3, 4, 5]);
    assert.equal(serie[4].valeur.resultat, resultats.valeurFutureTotale.resultat);
    assert.equal(serie[4].valeur.formule_id, 'F031');
    assert.equal(serie[0].verse, 1000000 + 50000 * 12);
    for (let i = 1; i < serie.length; i += 1) assert.ok(serie[i].valeur.resultat > serie[i - 1].valeur.resultat, 'it grows');
  });

  test('the frequency matters: capitalised monthly beats yearly at the same nominal rate', async () => {
    const monthly = (await run({ currency: 'DZD', capital: 1000000, annualRate: 0.06, years: 10, compoundingsPerYear: 12 })).body.resultats.valeurFutureTotale.resultat;
    const yearly = (await run({ currency: 'DZD', capital: 1000000, annualRate: 0.06, years: 10, compoundingsPerYear: 1 })).body.resultats.valeurFutureTotale.resultat;
    assert.ok(monthly > yearly);
    assert.equal(yearly, Math.round(1000000 * 1.06 ** 10));
  });

  test('the assumptions are stated, a missing rate or horizon is refused, and a zero rate is a straight line', async () => {
    const ok = await run({ currency: 'DZD', capital: 1000000, annualRate: 0, years: 3, compoundingsPerYear: 12, periodicContribution: 10000 });
    assert.deepEqual(ok.body.hypotheses, { taux_annuel: 0, horizon_annees: 3, capitalisation_par_an: 12 });
    assert.equal(ok.body.resultats.valeurFutureTotale.resultat, 1000000 + 10000 * 36);
    assert.equal((await run({ currency: 'DZD', capital: 1000000, years: 3 })).status, 400, 'no rate');
    assert.equal((await run({ currency: 'DZD', capital: 1000000, annualRate: 0.05 })).status, 400, 'no horizon');
    assert.equal((await run({ currency: 'DZD', capital: 1000000, annualRate: 0.05, years: 61 })).status, 400, 'beyond 60 years');
  });

  test('it is in the catalogue of the tools and in the list of simulators, with its form', async () => {
    const list = (await t.request('GET', '/tools/simulations')).body.simulators;
    const sim = list.find((row) => row.key === 'interet-compose');
    assert.equal(sim.calculator, 'CAL-IC');
    assert.deepEqual(sim.fields.map((field) => field.key), ['capital', 'periodicContribution', 'annualRate', 'years', 'compoundingsPerYear']);
    assert.deepEqual(sim.formulas.map((formula) => formula.id), ['F020', 'F029', 'F030', 'F031']);
  });
});

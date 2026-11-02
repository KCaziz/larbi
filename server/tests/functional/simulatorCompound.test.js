import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The simple and compound interest simulator (asked by the client on 2026-11-01,
// rules given by him on 2026-11-02), through the real API. The worked examples
// below are HIS OWN figures; every figure of the answer says which formula
// produced it.

let t;
const run = (json) => t.request('POST', '/tools/simulations/interet-compose', { json: { currency: 'DZD', ...json } });
const total = (res) => res.body.resultats.valeurFutureTotale.resultat;
const da = (units) => units * 100;

before(async () => {
  t = await boot();
});
after(() => t.close());

describe('the client worked examples', () => {
  test('100 000 DA at 1 % a month for 12 months: simple 112 000, compound about 112 682,50', async () => {
    const base = { capital: da(100000), rate: 0.01, ratePeriod: 'monthly', duration: 12, durationUnit: 'months' };
    const simple = await run({ ...base, interestKind: 'simple' });
    assert.equal(simple.status, 200, JSON.stringify(simple.body).slice(0, 300));
    assert.equal(total(simple), da(112000));
    const compound = await run({ ...base, interestKind: 'compound' });
    assert.equal(total(compound), 11268250);
    assert.equal(compound.body.resultats.tauxPeriode.resultat, 0.01, 'a monthly rate is never divided by 12');
    assert.ok(Math.abs(compound.body.resultats.tauxAnnuelEffectif.resultat - 0.1268) < 0.0001, 'about 12,68 %');
  });

  test('100 000 DA at 3 % a quarter for one year: simple 112 000, compound about 112 550,88', async () => {
    const base = { capital: da(100000), rate: 0.03, ratePeriod: 'quarterly', duration: 1, durationUnit: 'years' };
    assert.equal(total(await run({ ...base, interestKind: 'simple' })), da(112000));
    const compound = await run({ ...base, interestKind: 'compound' });
    assert.equal(total(compound), 11255088);
    assert.equal(compound.body.hypotheses.nombre_periodes, 4);
    assert.ok(Math.abs(compound.body.resultats.tauxAnnuelEffectif.resultat - 0.1255) < 0.0001, 'about 12,55 %');
  });

  test('12 % a year NOMINAL, capitalised quarterly: 3 % a quarter; the effective one is not divided', async () => {
    const nominal = await run({ capital: da(100000), rate: 0.12, ratePeriod: 'annual', annualRateKind: 'nominal', compounding: 'quarterly', duration: 1, durationUnit: 'years' });
    assert.equal(nominal.body.resultats.tauxPeriode.resultat, 0.03);
    assert.equal(total(nominal), 11255088);
    const effective = await run({ capital: da(100000), rate: 0.12, ratePeriod: 'annual', annualRateKind: 'effective', compounding: 'monthly', duration: 1, durationUnit: 'years' });
    assert.ok(Math.abs(effective.body.resultats.tauxPeriode.resultat - (1.12 ** (1 / 12) - 1)) < 1e-12, '(1 + TAE)^(1/12) - 1');
    assert.equal(total(effective), da(112000), 'a year of an effective 12 % is exactly 12 %');
  });

  test('100 000 DA at 10 % a year, three years: 133 100 (his year-by-year example)', async () => {
    const res = await run({ capital: da(100000), rate: 0.1, ratePeriod: 'annual', compounding: 'annual', duration: 3, durationUnit: 'years' });
    assert.equal(total(res), da(133100));
  });
});

describe('payments', () => {
  test('compound, end of period: capital x (1 + r) + V, his F029 + F030', async () => {
    const res = await run({ capital: da(100000), rate: 0.01, ratePeriod: 'monthly', duration: 12, durationUnit: 'months', periodicContribution: da(10000), contributionFrequency: 'monthly' });
    const expected = Math.round(da(100000) * 1.01 ** 12 + da(10000) * ((1.01 ** 12 - 1) / 0.01));
    assert.equal(total(res), expected);
    assert.equal(res.body.resultats.valeurFutureVersements.resultat, Math.round(da(10000) * ((1.01 ** 12 - 1) / 0.01)));
  });

  test('compound, start of period: (capital + V) x (1 + r), so each payment earns one more period', async () => {
    const args = { capital: 0, rate: 0.01, ratePeriod: 'monthly', duration: 12, durationUnit: 'months', periodicContribution: da(10000) };
    const end = await run({ ...args, contributionTiming: 'end' });
    const start = await run({ ...args, contributionTiming: 'start' });
    assert.ok(Math.abs(total(start) - total(end) * 1.01) <= 1);
  });

  test('simple, end of period: C0 (1 + r n) + V [n + r n (n - 1) / 2]; at the start n (n + 1) / 2', async () => {
    const C0 = da(100000);
    const V = da(10000);
    const r = 0.01;
    const n = 12;
    const args = { capital: C0, rate: r, ratePeriod: 'monthly', interestKind: 'simple', duration: n, durationUnit: 'months', periodicContribution: V };
    const end = await run({ ...args, contributionTiming: 'end' });
    assert.equal(total(end), Math.round(C0 * (1 + r * n) + V * (n + (r * n * (n - 1)) / 2)));
    const start = await run({ ...args, contributionTiming: 'start' });
    assert.equal(total(start), Math.round(C0 * (1 + r * n) + V * (n + (r * n * (n + 1)) / 2)));
  });

  test('a payment every quarter on a monthly calculation, and none that falls between two periods', async () => {
    const quarterly = await run({ capital: 0, rate: 0.01, ratePeriod: 'monthly', duration: 12, durationUnit: 'months', periodicContribution: da(30000), contributionFrequency: 'quarterly' });
    assert.equal(quarterly.status, 200);
    assert.equal(quarterly.body.serie.at(-1).verse, da(120000), 'four payments in the year');
    const tooOften = await run({ capital: 0, rate: 0.03, ratePeriod: 'quarterly', duration: 1, durationUnit: 'years', periodicContribution: da(1000), contributionFrequency: 'monthly' });
    assert.equal(tooOften.status, 400, 'monthly payments on a quarterly rate would fall between two periods');
  });
});

describe('the answer', () => {
  test('every figure names its formula, the assumptions are stated, the series ends on the total', async () => {
    const res = await run({ capital: da(100000), rate: 0.06, ratePeriod: 'annual', compounding: 'monthly', duration: 5, durationUnit: 'years', periodicContribution: da(5000) });
    const r = res.body.resultats;
    assert.deepEqual(Object.values(r).map((answer) => answer.formule_id), ['INT-F01', 'INT-F02', 'INT-F03', 'INT-F04', 'INT-F05']);
    assert.equal(res.body.hypotheses.type_interet, 'compound');
    assert.equal(res.body.hypotheses.type_taux_annuel, 'nominal');
    const { serie } = res.body;
    assert.deepEqual(serie.filter((row) => row.annee).map((row) => row.annee), [1, 2, 3, 4, 5]);
    assert.equal(serie.at(-1).valeur.resultat, total(res));
    for (let i = 1; i < serie.length; i += 1) assert.ok(serie[i].valeur.resultat > serie[i - 1].valeur.resultat, 'it grows');
  });

  test('simple interest has no effective annual rate; a duration that cuts a period is refused', async () => {
    const simple = await run({ capital: da(1000), rate: 0.01, ratePeriod: 'monthly', interestKind: 'simple', duration: 6, durationUnit: 'months' });
    assert.ok(!('tauxAnnuelEffectif' in simple.body.resultats));
    const cut = await run({ capital: da(1000), rate: 0.03, ratePeriod: 'quarterly', duration: 5, durationUnit: 'months' });
    assert.equal(cut.status, 400, '5 months is not a whole number of quarters');
  });

  test('a missing rate or duration is refused, a zero rate is a straight line, and it is in the catalogue', async () => {
    assert.equal((await run({ capital: da(1000), duration: 3 })).status, 400, 'no rate');
    assert.equal((await run({ capital: da(1000), rate: 0.05 })).status, 400, 'no duration');
    const flat = await run({ capital: da(1000), rate: 0, ratePeriod: 'monthly', duration: 3, durationUnit: 'months', periodicContribution: da(10) });
    assert.equal(total(flat), da(1000) + da(10) * 3);
    const sim = (await t.request('GET', '/tools/simulations')).body.simulators.find((row) => row.key === 'interet-compose');
    assert.equal(sim.calculator, 'CAL-IC');
    assert.deepEqual(sim.fields.find((field) => field.key === 'ratePeriod').options, ['monthly', 'quarterly', 'annual']);
    assert.deepEqual(sim.formulas.map((formula) => formula.id), ['INT-F01', 'INT-F02', 'INT-F03', 'INT-F04', 'INT-F05']);
  });
});

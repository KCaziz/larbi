import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { SIMULATORS } from '../../src/constants/simulators.js';
import { FORMULA_IDS } from '../../src/constants/finance.js';

// FINCLUDIA simulators (P4-10) through the real API. They compute and nothing
// else: no session, no database read, no row written — so these tests are about
// the contract of the answers, the refusals, and the promise that a figure can
// always say which formula produced it.

let t;
const get = (path) => t.request('GET', path);
const post = (key, json) => t.request('POST', `/tools/simulations/${key}`, { json });

// 1 000,00 in the smallest unit: amounts are integers of centimes everywhere.
const DA = (units) => units * 100;

before(async () => {
  t = await boot();
});
after(() => t.close());

// A minimal body accepted by a given simulator, built from the registry itself.
function minimalBody(simulator) {
  const body = { currency: 'DZD' };
  for (const field of simulator.fields) {
    if (!field.required) continue;
    if (field.type === 'money') body[field.key] = DA(1_000);
    else if (field.type === 'count') body[field.key] = 12;
    else body[field.key] = 0.01;
  }
  return body;
}

describe('catalogue', () => {
  test('the tools catalogue announces the simulators in free access', async () => {
    const res = await get('/tools');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.tools, [
      { key: 'comparateur-bancaire', status: 'available', access: 'public' },
      { key: 'simulateurs', status: 'available', access: 'public' },
      { key: 'simulateur-credit', status: 'planned', access: 'authenticated' },
      { key: 'generateur-facture', status: 'planned', access: 'authenticated' },
    ]);
  });

  test('lists the 13 simulators of lot 1 with the form the interface must draw', async () => {
    const res = await get('/tools/simulations');
    assert.equal(res.status, 200);
    assert.equal(res.body.simulators.length, 13);
    const budget = res.body.simulators.find((s) => s.key === 'budget-mensuel');
    assert.equal(budget.calculator, 'CAL-01');
    assert.deepEqual(
      budget.fields.map((f) => [f.key, f.type, f.required]),
      [
        ['plannedIncome', 'money', true],
        ['fixedExpenses', 'money', true],
        ['variableExpenses', 'money', true],
        ['debtInstalments', 'money', false],
        ['plannedSavings', 'money', false],
      ],
    );
  });

  test("every formula is described in the client's own wording, so a result can explain itself", async () => {
    const { body } = await get('/tools/simulations');
    for (const simulator of body.simulators) {
      assert.ok(simulator.formulas.length > 0, simulator.key);
      for (const formula of simulator.formulas) {
        assert.ok(FORMULA_IDS.includes(formula.id), `${simulator.key}: ${formula.id}`);
        for (const field of ['label', 'rule', 'condition']) assert.ok(formula[field]?.length > 0, `${formula.id}.${field}`);
        assert.ok(Number.isInteger(formula.version));
      }
    }
    const savings = body.simulators.find((s) => s.key === 'budget-mensuel').formulas.find((f) => f.id === 'F008');
    assert.equal(savings.rule, 'épargne nette / revenus nets × 100');
    assert.equal(savings.condition, 'Si revenus > 0');
  });

  test('one simulator alone, and 404 for an unknown one', async () => {
    const res = await get('/tools/simulations/inflation');
    assert.equal(res.status, 200);
    assert.equal(res.body.simulator.calculator, 'CAL-08');
    assert.equal((await get('/tools/simulations/inexistant')).status, 404);
    assert.equal((await post('inexistant', { currency: 'DZD' })).status, 404);
  });
});

describe('running a simulation', () => {
  test('CAL-01: every figure carries its formula, its version and its inputs', async () => {
    const res = await post('budget-mensuel', {
      currency: 'DZD',
      plannedIncome: DA(100_000),
      fixedExpenses: DA(40_000),
      variableExpenses: DA(20_000),
      debtInstalments: DA(15_000),
      plannedSavings: DA(10_000),
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(res.body.simulator, 'budget-mensuel');
    assert.equal(res.body.calculator, 'CAL-01');

    const r = res.body.resultats;
    assert.equal(r.revenus.resultat, DA(100_000));
    assert.equal(r.depenses.resultat, DA(75_000), 'fixed + variable + instalments');
    assert.equal(r.chargesObligatoires.resultat, DA(55_000));
    assert.equal(r.fluxNet.resultat, DA(25_000));
    assert.equal(r.resteAVivre.resultat, DA(45_000), 'not the same number as the net flow');
    assert.equal(r.epargneNette.resultat, DA(10_000));
    assert.equal(r.tauxEpargne.resultat, 0.1);
    assert.equal(r.resteAAffecter.resultat, DA(15_000));

    assert.equal(r.resteAVivre.formule_id, 'F006');
    assert.equal(r.resteAVivre.unite, 'DZD');
    assert.equal(r.tauxEpargne.unite, 'ratio', 'a decimal, displayed as a percentage');
    assert.equal(r.fluxNet.formule_version, 1);
    assert.deepEqual(r.fluxNet.entrees_snapshot, { revenus: DA(100_000), depenses: DA(75_000) });
    assert.ok(r.fluxNet.calcule_le.endsWith('Z'));
    assert.ok(!('hypotheses' in res.body), 'a monthly total is not a projection');
  });

  test('an optional amount left out counts as nothing, a required one is refused', async () => {
    const res = await post('budget-mensuel', { currency: 'DZD', plannedIncome: DA(50_000), fixedExpenses: DA(20_000), variableExpenses: DA(10_000) });
    assert.equal(res.status, 200);
    assert.equal(res.body.resultats.depenses.resultat, DA(30_000));
    assert.equal(res.body.resultats.epargneNette.resultat, 0);

    const missing = await post('budget-mensuel', { currency: 'DZD', plannedIncome: DA(50_000) });
    assert.equal(missing.status, 400);
    assert.match(missing.body.error.message, /fixedExpenses/);
    assert.match(missing.body.error.message, /variableExpenses/);
  });

  test('a simulation that projects shows its hypotheses', async () => {
    const res = await post('objectif-avec-rendement', { currency: 'DZD', target: DA(2_000_000), capital: DA(500_000), contribution: DA(20_000), months: 36, monthlyRate: 0.004 });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.hypotheses, { rendement_mensuel: 0.004, horizon_mois: 36 });
    const r = res.body.resultats;
    assert.equal(r.valeurFutureTotale.resultat, r.valeurFutureCapital.resultat + r.valeurFutureVersements.resultat);
    assert.ok(r.versementRequis.resultat > 0);
    for (const value of Object.values(r)) assert.deepEqual(value.hypotheses, undefined, 'the hypotheses belong to the simulation, not to each figure');
  });

  test('what cannot be computed answers null and says why, never 0', async () => {
    // Essential expenses of zero: the client's own condition on F014.
    const res = await post('reserve-securite', { currency: 'DZD', liquidSavings: DA(300_000), essentialMonthlyExpenses: 0, targetMonths: 6 });
    assert.equal(res.status, 200);
    assert.equal(res.body.resultats.moisCouverts.resultat, null);
    assert.deepEqual(res.body.resultats.moisCouverts.avertissements, ['Exclure fictif/illiquide']);
    assert.equal(res.body.resultats.montantCible.resultat, 0, 'a target of 6 × 0 really is 0: that is an answer, not a refusal');

    // No contribution: no number of months can be given.
    const stuck = await post('reserve-securite', { currency: 'DZD', liquidSavings: 0, essentialMonthlyExpenses: DA(100_000), targetMonths: 6 });
    assert.equal(stuck.body.resultats.moisPourAtteindre.resultat, null);
    assert.deepEqual(stuck.body.resultats.moisPourAtteindre.avertissements, ['Si contribution > 0']);
  });

  test('a negative balance and a negative result are shown, not clamped', async () => {
    const res = await post('budget-fin-de-mois', { currency: 'DZD', currentBalance: -DA(5_000), remainingDays: 10, remainingBills: DA(3_000), dailySpendingReference: DA(500) });
    assert.equal(res.status, 200);
    assert.equal(res.body.resultats.budgetJournalier.resultat, -DA(800));
    assert.ok(res.body.resultats.couvertureJours.resultat < 0);
  });

  test('the loss of purchasing power: the real value falls below the nominal one', async () => {
    const res = await post('inflation', { currency: 'DZD', nominalValue: DA(1_000_000), inflation: 0.05, years: 10, nominalReturn: 0.03 });
    assert.equal(res.status, 200);
    assert.ok(res.body.resultats.valeurReelle.resultat < DA(1_000_000));
    assert.ok(res.body.resultats.rendementReel.resultat < 0, 'inflation above the return loses purchasing power');
    assert.deepEqual(res.body.hypotheses, { inflation: 0.05, horizon_annees: 10, rendement_nominal: 0.03 });
  });

  test('LY09: the complementary need appears as a negative net flow', async () => {
    const res = await post('budget-etudiant', { currency: 'DZD', housing: DA(25_000), transport: DA(4_000), food: DA(15_000), tuition: DA(3_000), telecom: DA(2_000), leisure: DA(5_000), familySupport: DA(30_000), ownResources: DA(10_000) });
    assert.equal(res.body.resultats.depensesProjetees.resultat, DA(54_000));
    assert.equal(res.body.resultats.ressourcesProjetees.resultat, DA(40_000));
    assert.equal(res.body.resultats.fluxNet.resultat, -DA(14_000));
  });
});

describe('refusals', () => {
  test('amounts are integers of centimes: a decimal is refused, not rounded', async () => {
    const res = await post('autonomie-etudiant', { currency: 'DZD', ownIncome: 1234.56, totalExpenses: DA(2_000) });
    assert.equal(res.status, 400);
    assert.match(res.body.error.message, /ownIncome/);
  });

  test('an unknown field is refused instead of being quietly ignored', async () => {
    const accepted = { currency: 'DZD', ownIncome: DA(1_000), totalExpenses: DA(2_000) };
    // The same body plus one field the simulator does not declare: refused. A
    // silently ignored input is worse than a refusal — the user would believe a
    // figure was taken into account when it was dropped.
    assert.equal((await post('autonomie-etudiant', { ...accepted, bonus: DA(500) })).status, 400);
    assert.equal((await post('autonomie-etudiant', accepted)).status, 200);
  });

  test('the currency is required and must be a three-letter code', async () => {
    assert.equal((await post('autonomie-etudiant', { ownIncome: DA(1_000), totalExpenses: DA(2_000) })).status, 400);
    assert.equal((await post('autonomie-etudiant', { currency: 'dinars', ownIncome: DA(1_000), totalExpenses: DA(2_000) })).status, 400);
    assert.equal((await post('autonomie-etudiant', { currency: 'EUR', ownIncome: DA(1_000), totalExpenses: DA(2_000) })).status, 200);
  });

  test('a required bound of the client is enforced (a month with zero days left)', async () => {
    const res = await post('enveloppe', { currency: 'DZD', categoryBudget: DA(20_000), consumed: DA(5_000), daysElapsed: 0, daysInPeriod: 30 });
    assert.equal(res.status, 400);
    assert.match(res.body.error.message, /daysElapsed/);
  });

  test('an amount beyond what integers can hold is refused, not silently wrong', async () => {
    const res = await post('autonomie-etudiant', { currency: 'DZD', ownIncome: Number.MAX_SAFE_INTEGER + 1000, totalExpenses: DA(2_000) });
    assert.equal(res.status, 400);
  });
});

describe('every simulator of lot 1', () => {
  test('answers, in its own currency, and only with formulas it declares', async () => {
    for (const simulator of SIMULATORS) {
      const res = await post(simulator.key, minimalBody(simulator));
      assert.equal(res.status, 200, `${simulator.key}: ${JSON.stringify(res.body)}`);
      const results = Object.values(res.body.resultats);
      assert.ok(results.length > 0, simulator.key);

      const used = [...new Set(results.map((r) => r.formule_id))].sort();
      assert.deepEqual(used, [...simulator.formulas].sort(), `${simulator.key} uses formulas it does not declare, or declares some it never uses`);

      for (const [name, value] of Object.entries(res.body.resultats)) {
        const where = `${simulator.key}.${name}`;
        for (const field of ['resultat', 'unite', 'formule_id', 'formule_version', 'entrees_snapshot', 'calcule_le']) {
          assert.ok(field in value, `${where}: missing ${field}`);
        }
        assert.ok(value.unite.length > 0, where);
        if (value.resultat === null) assert.ok(value.avertissements?.length > 0, `${where}: null without saying why`);
      }
    }
  });

  test('a money figure is labelled with the currency that was asked for', async () => {
    for (const simulator of SIMULATORS) {
      const body = { ...minimalBody(simulator), currency: 'EUR' };
      const res = await post(simulator.key, body);
      assert.equal(res.status, 200, simulator.key);
      const units = new Set(Object.values(res.body.resultats).map((r) => r.unite));
      for (const unit of units) assert.ok(['EUR', 'ratio', 'mois', 'jours', 'points'].includes(unit), `${simulator.key}: ${unit}`);
    }
  });
});

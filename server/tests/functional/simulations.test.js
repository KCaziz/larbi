import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { SIMULATORS } from '../../src/constants/simulators.js';
import { ALGORITHM_IDS, FORMULA_IDS } from '../../src/constants/finance.js';

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
function minimalValue(field) {
  if (field.type === 'money') return DA(1_000);
  if (field.type === 'count') return 12;
  if (field.type === 'text') return 'x';
  // A repeated field (P4-11): one row, each of its own required parts filled.
  if (field.type === 'list') return [Object.fromEntries(field.item.filter((sub) => sub.required).map((sub) => [sub.key, minimalValue(sub)]))];
  return 0.01;
}

function minimalBody(simulator) {
  const body = { currency: 'DZD' };
  for (const field of simulator.fields) {
    if (field.required) body[field.key] = minimalValue(field);
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
      { key: 'comparaisons', status: 'available', access: 'public' },
      { key: 'simulateur-credit', status: 'planned', access: 'authenticated' },
      { key: 'generateur-facture', status: 'planned', access: 'authenticated' },
    ]);
  });

  test('lists the 18 simulators with the form the interface must draw', async () => {
    const res = await get('/tools/simulations');
    assert.equal(res.status, 200);
    assert.equal(res.body.simulators.length, SIMULATORS.length);
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

    // A repeated field carries the description of its own rows (P4-11), so the
    // form has a single source of truth for them too.
    const debts = res.body.simulators.find((s) => s.key === 'strategies-dettes').fields.find((f) => f.key === 'debts');
    assert.equal(debts.type, 'list');
    assert.deepEqual(
      debts.item.map((f) => [f.key, f.type, f.required]),
      [
        ['label', 'text', true],
        ['balance', 'money', true],
        ['annualRate', 'rate', true],
        ['minimumPayment', 'money', true],
      ],
    );
  });

  test("every formula is described in the client's own wording, so a result can explain itself", async () => {
    const { body } = await get('/tools/simulations');
    for (const simulator of body.simulators) {
      assert.ok(simulator.formulas.length > 0, simulator.key);
      for (const formula of simulator.formulas) {
        assert.ok([...FORMULA_IDS, ...ALGORITHM_IDS].includes(formula.id), `${simulator.key}: ${formula.id}`);
        for (const field of ['label', 'rule']) assert.ok(formula[field]?.length > 0, `${formula.id}.${field}`);
        // Only a formula has a condition column in the client's workbook; an
        // algorithm answers null rather than an invented sentence.
        if (FORMULA_IDS.includes(formula.id)) assert.ok(formula.condition?.length > 0, `${formula.id}.condition`);
        else assert.equal(formula.condition, null, `${formula.id}.condition`);
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

describe('every simulator', () => {
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
      for (const unit of units) assert.ok(['EUR', 'ratio', 'mois', 'jours', 'points', 'composite'].includes(unit), `${simulator.key}: ${unit}`);
    }
  });
});

// Lot 2 (P4-11): debt and credit. The arithmetic itself is covered on the engine
// (unit/finance.test.js); what matters here is that the API composes it from the
// user's own figures, and refuses rather than answers something absurd.
describe('debt and credit (lot 2)', () => {
  test('an effort rate before and after a new debt, from a list of instalments', async () => {
    const res = await post('effort-dette', {
      currency: 'DZD',
      instalments: [{ instalment: DA(15_000), label: 'Voiture' }, { instalment: DA(5_000) }],
      netIncome: DA(100_000),
      newInstalment: DA(10_000),
      outstandingPrincipal: DA(600_000),
    });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const r = res.body.resultats;
    assert.equal(r.serviceMensuel.resultat, DA(20_000));
    assert.equal(r.tauxEffort.resultat, 0.2);
    // The same formula applied to the situation being considered: the figures
    // must differ, or the screen would show the new debt as free.
    assert.equal(r.tauxEffortApres.resultat, 0.3);
    assert.equal(r.tauxEffortApres.formule_id, 'F018');
    assert.equal(r.revenuAnnuel.resultat, DA(1_200_000));
    assert.equal(r.detteSurRevenuAnnuel.resultat, 0.5);
  });

  test('an optional name is not required to add an instalment', async () => {
    const res = await post('effort-dette', { currency: 'DZD', instalments: [{ instalment: DA(1_000) }], netIncome: DA(50_000) });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    // An empty list is not a simulation: the client's input is "liste dettes".
    assert.equal((await post('effort-dette', { currency: 'DZD', instalments: [], netIncome: DA(50_000) })).status, 400);
  });

  test('a financing instalment really amortises the amount borrowed', async () => {
    const body = {
      currency: 'DZD',
      creditAmount: DA(2_000_000),
      downPayment: DA(200_000),
      annualRate: 0.06,
      durationMonths: 60,
      fees: DA(1_000),
      insurance: DA(500),
      netIncome: DA(120_000),
      currentLivingAllowance: DA(60_000),
      currentDebtService: DA(10_000),
    };
    const res = await post('mensualite-financement', body);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const r = res.body.resultats;
    assert.equal(r.tauxPeriodique.resultat, 0.005);

    // The property, not a magic number: paying that instalment 60 times on the
    // financed principal at that rate leaves nothing owed.
    let balance = body.creditAmount - body.downPayment;
    for (let month = 0; month < body.durationMonths; month += 1) {
      balance = balance + balance * r.tauxPeriodique.resultat - r.mensualite.resultat;
    }
    assert.ok(Math.abs(balance) < DA(1), `balance left after the last instalment: ${balance}`);

    // F022 includes the fees and the insurance; F023 is the cost above capital.
    assert.equal(r.totalPaiements.resultat, r.mensualite.resultat * 60 + DA(1_500));
    assert.equal(r.coutTotal.resultat, r.totalPaiements.resultat - (body.creditAmount - body.downPayment));

    // F056 answers two things at once, as the client's own row does.
    assert.equal(r.impact.unite, 'composite');
    assert.equal(r.impact.resultat.livingAllowance, DA(60_000) - r.mensualite.resultat);
    assert.ok(r.impact.resultat.effortRate > 0);
  });

  test('a down payment above the price is refused, not answered with a negative instalment', async () => {
    const body = {
      currency: 'DZD',
      price: DA(1_000_000),
      downPayment: DA(1_200_000),
      annualRate: 0.05,
      durationMonths: 120,
      netIncome: DA(100_000),
      currentLivingAllowance: DA(50_000),
    };
    const res = await post('simulation-logement', body);
    assert.equal(res.status, 400);
    assert.match(res.body.error.message, /downPayment/);
    assert.equal((await post('simulation-logement', { ...body, downPayment: DA(200_000) })).status, 200);
  });

  test('housing: the reserve left after the down payment', async () => {
    const res = await post('simulation-logement', {
      currency: 'DZD',
      price: DA(9_000_000),
      downPayment: DA(1_500_000),
      annualRate: 0.055,
      durationMonths: 240,
      netIncome: DA(180_000),
      currentLivingAllowance: DA(90_000),
      liquidSavings: DA(2_000_000),
    });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.resultats.reserveApresApport.resultat, DA(500_000));
    assert.equal(res.body.resultats.reserveApresApport.formule_id, 'F009');
  });

  test('an early repayment shortens the plan and the saving is the interest avoided', async () => {
    const body = {
      currency: 'DZD',
      balance: DA(1_000_000),
      annualRate: 0.07,
      remainingMonths: 48,
      extraPayment: DA(5_000),
      earlyRepaymentFees: DA(2_000),
    };
    const res = await post('remboursement-anticipe', body);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const r = res.body.resultats;
    assert.equal(r.planActuel.formule_id, 'ALG-01');
    assert.ok(r.planAnticipe.resultat.months < r.planActuel.resultat.months, 'paying more cannot take longer');
    assert.ok(r.planAnticipe.resultat.totalInterest < r.planActuel.resultat.totalInterest);
    assert.equal(
      r.interetsEconomises.resultat,
      r.planActuel.resultat.totalInterest - r.planAnticipe.resultat.totalInterest - body.earlyRepaymentFees,
      'the fee the user gave is deducted from the saving',
    );
  });

  test('an unknown early-repayment fee is said, not assumed to be zero', async () => {
    const body = { currency: 'DZD', balance: DA(1_000_000), annualRate: 0.07, remainingMonths: 48, extraPayment: DA(5_000) };
    const withoutFee = await post('remboursement-anticipe', body);
    assert.equal(withoutFee.status, 200);
    // The client's own condition for F024 ("Frais si renseignés") is what the
    // screen shows, so the figure is never read as "no fee to pay".
    assert.ok(withoutFee.body.resultats.interetsEconomises.avertissements?.length > 0);

    const withFee = await post('remboursement-anticipe', { ...body, earlyRepaymentFees: DA(2_000) });
    assert.equal(withFee.body.resultats.interetsEconomises.avertissements, undefined);
  });

  test('two repayment orders on the same debts: avalanche never costs more interest', async () => {
    const debts = [
      { label: 'Carte', balance: DA(300_000), annualRate: 0.18, minimumPayment: DA(10_000) },
      { label: 'Auto', balance: DA(800_000), annualRate: 0.06, minimumPayment: DA(20_000) },
    ];
    const res = await post('strategies-dettes', { currency: 'DZD', debts, extraPayment: DA(15_000) });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const r = res.body.resultats;
    assert.equal(r.serviceMensuel.resultat, DA(30_000));
    assert.equal(r.avalanche.resultat.strategy, 'avalanche');
    assert.equal(r.bouleDeNeige.resultat.strategy, 'snowball');
    assert.ok(r.avalanche.resultat.completed && r.bouleDeNeige.resultat.completed);
    assert.ok(r.avalanche.resultat.totalInterest <= r.bouleDeNeige.resultat.totalInterest);
    // The name the user typed travels with the answer, so the payoff order can
    // be read back as names rather than row numbers.
    assert.deepEqual(r.avalanche.entrees_snapshot.labels, { d1: 'Carte', d2: 'Auto' });
    assert.equal(r.avalanche.resultat.payoff.length, 2);
  });

  test('two debts may carry the same name without being merged', async () => {
    const debt = { label: 'Prêt', balance: DA(100_000), annualRate: 0.1, minimumPayment: DA(20_000) };
    const res = await post('strategies-dettes', { currency: 'DZD', debts: [debt, debt] });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.resultats.avalanche.resultat.payoff.length, 2);
  });

  test('a plan that the instalments never repay says so instead of returning a number', async () => {
    // A minimum below the monthly interest: no order of payment clears it.
    const res = await post('strategies-dettes', {
      currency: 'DZD',
      debts: [{ label: 'Découvert', balance: DA(1_000_000), annualRate: 2.4, minimumPayment: DA(100) }],
    });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const plan = res.body.resultats.avalanche.resultat;
    assert.equal(plan.completed, false);
    assert.equal(plan.months, null);
    assert.ok(plan.remaining.length === 1, 'what is still owed is shown');
  });

  test('a list longer than the registry allows is refused', async () => {
    const debt = { label: 'x', balance: DA(1_000), annualRate: 0.01, minimumPayment: DA(100) };
    const res = await post('strategies-dettes', { currency: 'DZD', debts: Array.from({ length: 21 }, () => debt) });
    assert.equal(res.status, 400);
    assert.match(res.body.error.message, /debts/);
  });

  test('an unknown field inside a row is refused too', async () => {
    const row = { label: 'x', balance: DA(1_000), annualRate: 0.01, minimumPayment: DA(100) };
    assert.equal((await post('strategies-dettes', { currency: 'DZD', debts: [{ ...row, taeg: 0.2 }] })).status, 400);
    assert.equal((await post('strategies-dettes', { currency: 'DZD', debts: [row] })).status, 200);
  });

  test('the convention of the credit is an input, not a hidden constant', async () => {
    const simulator = (await get('/tools/simulations/mensualite-financement')).body.simulator;
    const field = simulator.fields.find((f) => f.key === 'periodsPerYear');
    assert.equal(field.default, 12, 'the form can show the convention F020 requires to be stated');
    assert.equal(field.required, false);

    // And it can be changed: a quarterly schedule is a different instalment.
    const body = { currency: 'DZD', creditAmount: DA(1_000_000), annualRate: 0.08, durationMonths: 20, netIncome: DA(100_000), currentLivingAllowance: DA(50_000) };
    const monthly = await post('mensualite-financement', body);
    const quarterly = await post('mensualite-financement', { ...body, periodsPerYear: 4 });
    assert.equal(monthly.status, 200);
    assert.equal(quarterly.status, 200);
    assert.notEqual(monthly.body.resultats.mensualite.resultat, quarterly.body.resultats.mensualite.resultat);
  });

  test('an algorithm explains itself with the client\'s own wording', async () => {
    const res = await get('/tools/simulations/strategies-dettes');
    assert.equal(res.status, 200);
    const algorithm = res.body.simulator.formulas.find((f) => f.id === 'ALG-01');
    assert.equal(algorithm.label, 'Dette coûteuse / petite dette');
    assert.match(algorithm.rule, /réallouer la mensualité libérée/);
    // The client's workbook gives no "condition" column for an algorithm, and
    // nothing is invented to fill it.
    assert.equal(algorithm.condition, null);
  });
});

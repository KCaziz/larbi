import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import * as f from '../../src/services/finance/formulas.js';
import { FORMULAS } from '../../src/constants/finance.js';
import { sumAmounts } from '../../src/services/finance/money.js';
import { computed, isNotComputed } from '../../src/services/finance/contract.js';
import { totalsByReality } from '../../src/services/finance/dataModel.js';

// The client's own QA grid for the calculations (onglet `16_QA_Tests`,
// section « Test calcul »), applied to the engine — one describe per case, in
// the client's own order and with the client's own expected outcome:
//
//   1. Cas nominal          → résultat exact à tolérance définie
//   2. Dénominateur nul     → non calculable ; pas d'exception serveur
//   3. Valeur manquante     → avertissement + champ requis
//   4. Valeur extrême       → pas de débordement ; hypothèse visible
//   5. Devise différente    → conversion uniquement avec taux daté
//   6. Donnée ancienne      → badge / blocage selon criticité
//   7. Réel / fictif        → aucun impact sur le patrimoine réel
//   8. Permissions          → aucune fuite de donnée
//
// These are CROSS-CUTTING rules, not one formula's business, which is why they
// have their own file: each individual formula already has its own test, and
// what nobody was checking is that the whole catalogue obeys the grid.
//
// Case 8 (permissions) is a data-access rule rather than an arithmetic one; it
// is proved by the dedicated security suites and the pointer is in that
// describe, so the grid has no hole that looks like an omission.

const DZD = 'DZD';

describe("grille QA du client — 1. cas nominal : résultat exact", () => {
  test('the figures of a coherent month are exact, not approximate', () => {
    // Integer centimes throughout: the "tolérance définie" of the client is
    // zero here, because nothing is a float.
    const income = f.totalIncome([{ amount: 6_000_00, currency: DZD }], { currency: DZD });
    const expenses = f.totalExpenses([{ amount: 4_500_00, currency: DZD }], { currency: DZD });
    assert.equal(income, 600000);
    assert.equal(expenses, 450000);
    assert.equal(f.netFlow(income, expenses), 150000);
    assert.equal(f.savingsRate(150000, 600000), 0.25);
  });

  test('a split places every centime, so the parts equal the whole exactly', () => {
    // The client states it as a rule for shared expenses; it holds for every
    // split the engine does.
    for (const [total, count] of [
      [100, 3],
      [1000, 7],
      [999999, 11],
    ]) {
      const parts = f.equalShare(total, count);
      assert.equal(parts.reduce((sum, part) => sum + part, 0), total, `${total} over ${count}`);
    }
    const weighted = f.incomeProportionalShare(10000, [3333, 3333, 3334]);
    assert.equal(weighted.reduce((sum, part) => sum + part, 0), 10000);
  });

  test('every formula of the catalogue is implemented and callable', () => {
    // The grid applies to the catalogue, so the catalogue has to be complete:
    // a row with no function would be a rule nobody could check.
    const missing = FORMULAS.filter((row) => typeof f[row.fn] !== 'function').map((row) => `${row.id} (${row.fn})`);
    assert.deepEqual(missing, []);
  });
});

describe("grille QA du client — 2. dénominateur nul : non calculable, pas d'exception", () => {
  // The client's wording is precise and demanding: "non calculable ; PAS
  // D'EXCEPTION SERVEUR". So each of these must return null without throwing.
  const zeroDenominator = [
    ['F008 taux d’épargne (revenus = 0)', () => f.savingsRate(50000, 0)],
    ['F010 taux de consommation (budget = 0)', () => f.envelopeUsageRate(50000, 0)],
    ['F014 réserve en mois (dépenses essentielles = 0)', () => f.safetyFundMonths(500000, 0)],
    ['F018 taux d’effort (revenus = 0)', () => f.debtEffortRate(200000, 0)],
    ['F019 dette / revenu annuel (revenus = 0)', () => f.debtToAnnualIncome(1000000, 0)],
    ['F025 progression objectif (cible = 0)', () => f.goalProgress(1000, 0)],
    ['F036 allocation (total actifs = 0)', () => f.assetAllocation(1000, 0)],
    ['F040 rendement fictif (coût = 0)', () => f.paperReturn(1000, 0)],
    ['F047 autonomie (dépenses = 0)', () => f.studentAutonomy(100000, 0)],
    ['F012 budget journalier (jours restants = 0)', () => f.dailyBudget({ balance: 100000, remainingObligations: 0, remainingDays: 0 })],
    ['F027 mois nécessaires (contribution = 0)', () => f.monthsWithoutReturn(1000000, 0, 0)],
    ['F028 versement (mois restants = 0)', () => f.paymentWithoutReturn({ target: 1000000, capital: 0, monthsLeft: 0 })],
    ['F045 provision mensuelle (mois restants = 0)', () => f.monthlyProvision({ plannedAmount: 100000, alreadyProvisioned: 0, monthsLeft: 0 })],
    ['F050 couverture choc (déficit = 0)', () => f.shockCoverage(500000, 0)],
  ];

  for (const [label, run] of zeroDenominator) {
    test(`${label} → null, sans lever`, () => {
      let result;
      assert.doesNotThrow(() => {
        result = run();
      }, `${label} threw instead of answering`);
      assert.equal(result, null, `${label} must answer null, never 0`);
    });
  }

  test('and null is never dressed up as zero on the way out', () => {
    // The project's own rule, and the client's: « non calculé plutôt que 0 ».
    const answer = computed('F008', f.savingsRate(50000, 0), { currency: DZD });
    assert.equal(answer.resultat, null);
    assert.ok(isNotComputed(answer));
    // And the contract carries the formula's own condition, so a screen can say
    // WHY rather than show a blank.
    assert.ok(answer.avertissements?.length > 0);
  });
});

describe('grille QA du client — 3. valeur manquante : avertissement + champ requis', () => {
  const missingInput = [
    ['F004 flux net sans dépenses', () => f.netFlow(600000, null)],
    ['F006 reste à vivre sans charges', () => f.livingAllowance({ netIncome: 600000, fixedCharges: null, mandatoryInstalments: 0 })],
    ['F009 budget restant sans prévu', () => f.remainingBudget(null, 50000)],
    ['F011 projection sans jours écoulés', () => f.envelopeProjection({ consumed: 50000, daysElapsed: null, daysInPeriod: 30 })],
    ['F015 cible de réserve sans dépenses essentielles', () => f.safetyFundTarget(6, null)],
    ['F035 patrimoine net sans actifs', () => f.netWorth({ assets: null, liabilities: [], currency: DZD })],
    ['F055 âge donnée sans date', () => f.dataAgeDays(null, new Date())],
  ];

  for (const [label, run] of missingInput) {
    test(`${label} → null, sans lever`, () => {
      let result;
      assert.doesNotThrow(() => {
        result = run();
      });
      assert.equal(result, null);
    });
  }

  test('the answer names the condition that was not met, which is the "champ requis"', () => {
    const answer = computed('F014', f.safetyFundMonths(500000, null), { currency: DZD, inputs: { epargne_liquide: 500000, depenses_essentielles: null } });
    assert.equal(answer.resultat, null);
    // The client's own condition text travels with the refusal.
    assert.ok(answer.avertissements.some((text) => text.length > 0));
    // And the snapshot shows which input was missing.
    assert.equal(answer.entrees_snapshot.depenses_essentielles, null);
  });
});

describe('grille QA du client — 4. valeur extrême : pas de débordement, hypothèse visible', () => {
  test('a very large amount does not overflow into an unusable number', () => {
    // Number.MAX_SAFE_INTEGER in centimes is far beyond any real amount; what
    // matters is that the engine refuses rather than returns Infinity or a
    // silently rounded value.
    const huge = Number.MAX_SAFE_INTEGER;
    const total = sumAmounts([{ amount: huge, currency: DZD }, { amount: huge, currency: DZD }], { currency: DZD });
    assert.ok(total === null || Number.isSafeInteger(total), 'a total is either refused or still exact');
    assert.notEqual(total, Infinity);
  });

  test('a negative rate in a simulation is handled, never turned into Infinity', () => {
    const payment = f.annuityPayment({ principal: 1_000_000_00, rate: -0.01, periods: 60 });
    assert.ok(payment === null || Number.isFinite(payment), 'a negative rate answers a finite number or nothing');
  });

  test('an unreachable goal says so instead of iterating for ever', () => {
    // The engine's own horizon (MAX_ITERATION_MONTHS). A contribution smaller
    // than the interest never reaches the target, and that is an answer.
    const months = f.monthsWithoutReturn(1_000_000_00, 0, 1);
    assert.ok(months === null || Number.isFinite(months));
  });

  test('a simulation carries its hypotheses where it has any', () => {
    // The client asks for the hypothesis to be VISIBLE on an extreme value.
    const answer = computed('F029', f.futureValueLumpSum(100000, 0.5, 40), {
      currency: DZD,
      hypotheses: { rendement_periodique: 0.5, periodes: 40 },
    });
    assert.ok(answer.hypotheses, 'a simulation without its hypotheses cannot be judged');
    assert.equal(answer.hypotheses.rendement_periodique, 0.5);
  });
});

describe('grille QA du client — 5. devise différente : conversion seulement avec taux daté', () => {
  test('a mixed-currency total is refused, never converted at an invented rate', () => {
    const mixed = sumAmounts([{ amount: 100000, currency: 'DZD' }, { amount: 100000, currency: 'EUR' }], { currency: 'DZD' });
    assert.equal(mixed, null, 'there is no dated rate anywhere in the engine, so there is no conversion');
  });

  test('a total in one currency is computed normally', () => {
    assert.equal(sumAmounts([{ amount: 100000, currency: 'EUR' }, { amount: 50000, currency: 'EUR' }], { currency: 'EUR' }), 150000);
  });

  test('the engine holds no exchange rate at all', async () => {
    // The strongest form of the rule: there is nothing to convert WITH, so no
    // code path can convert by accident.
    const money = await import('../../src/services/finance/money.js');
    const suspicious = Object.keys(money).filter((name) => /convert|exchange|rate(s)?To|fx/i.test(name));
    assert.deepEqual(suspicious, [], 'no conversion helper exists, and none should until the client supplies dated rates');
  });
});

describe('grille QA du client — 6. donnée ancienne : badge selon criticité', () => {
  test('the age of a value is measured, in whole days', () => {
    const now = new Date('2026-10-14T00:00:00.000Z');
    assert.equal(f.dataAgeDays(new Date('2026-07-16T00:00:00.000Z'), now), 90);
    assert.equal(f.dataAgeDays(new Date('2026-10-13T00:00:00.000Z'), now), 1);
  });

  test('each threshold is the caller’s, and is published rather than hidden', async () => {
    // The client says « seuil par type », so the engine holds none: every
    // caller declares its own, and the two that exist are constants a screen
    // can read.
    const wealth = await import('../../src/constants/finWealth.js');
    const dashboard = await import('../../src/constants/finDashboard.js');
    // The 90-day rule on a valuation is the client's own figure.
    assert.equal(wealth.VALUATION_STALE_DAYS, 90);
    assert.ok(dashboard.DATA_AGE_WARNING_DAYS > 0);
  });

  test('no data at all is the empty state, not stale data', () => {
    assert.equal(f.dataAgeDays(null, new Date()), null);
  });
});

describe('grille QA du client — 7. réel / fictif : aucun impact sur le patrimoine réel', () => {
  test('a fictional row is never added to a real total', () => {
    const rows = [
      { value: 100000, currency: DZD, status: 'real' },
      { value: 900000, currency: DZD, status: 'fictional' },
    ];
    const totals = totalsByReality(rows, { currency: DZD });
    assert.equal(totals.real, 100000, 'the real total ignores the fictional row entirely');
    assert.equal(totals.fictional, 900000, 'and the fictional one is reported apart');
    assert.equal(totals.counts.real, 1);
    assert.equal(totals.counts.fictional, 1);
  });

  test('there is no function that returns the two added together', () => {
    // The phase rule, enforced by absence: a caller that wants both numbers
    // shows both numbers.
    const totals = totalsByReality([{ value: 1, currency: DZD, status: 'real' }], { currency: DZD });
    assert.deepEqual(Object.keys(totals).sort(), ['counts', 'fictional', 'real']);
    assert.equal(totals.fictional, null, 'nothing fictional is not "zero fictional"');
  });

  test('a row whose status cannot be read lands in neither total', () => {
    const totals = totalsByReality([{ value: 5000, currency: DZD, status: 'inventé' }], { currency: DZD });
    assert.equal(totals.counts.unknown, 1);
    assert.equal(totals.real, null, 'an unreadable status is never treated as real');
  });

  test('the paper portfolio and real patrimony use different formulas, on purpose', () => {
    // F038/F039/F040 for the fictional, F035 for the real: the client's own
    // separation, visible in the catalogue rather than in a convention.
    const paper = FORMULAS.filter((row) => ['F038', 'F039', 'F040'].includes(row.id));
    assert.equal(paper.length, 3);
    assert.ok(paper.every((row) => /fictif/i.test(row.label) || /fictif/i.test(row.rule) || /simulation/i.test(row.condition)));
  });
});

describe('grille QA du client — 8. permissions : aucune fuite de donnée', () => {
  test('the arithmetic layer holds no data access at all, which is why it cannot leak', async () => {
    // This case of the grid is a data-access rule, not an arithmetic one. It is
    // proved by the dedicated security suites — tests/security/finSpace.test.js
    // (24 tests on the sharing matrix), finWealth, finDebt, finJourney,
    // authorization.test.js (the route audit) — and the pointer is here so the
    // grid has no hole that looks like an omission.
    //
    // What IS checked here: the engine is pure. It receives numbers and returns
    // numbers, and has no access to a database, so no formula can read a row
    // belonging to somebody else.
    const formulas = await import('../../src/services/finance/formulas.js');
    const source = await import('node:fs').then((fs) => fs.readFileSync('src/services/finance/formulas.js', 'utf8'));
    assert.ok(!/prisma|findMany|findFirst|\$queryRaw/.test(source), 'the engine must never touch the database');
    assert.equal(typeof formulas.netWorth, 'function');
  });
});

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { breakdown, buildSynthesis, currentMonth, debtRatioIncome, previousMonth } from '../../src/services/finSynthesis.service.js';
import { foldTotals, historyWhere } from '../../src/services/finMoney.service.js';

// "Mon argent" (P6-04): the synthesis of screen C05 and the filtered totals of
// screen C08, as pure functions.

const now = new Date('2026-10-12T10:00:00Z');
const period = currentMonth(now);

const income = (over = {}) => ({ id: 'i', label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', status: 'real', ...over });
const movement = (over = {}) => ({ id: 'm', kind: 'expense', value: 100000, currency: 'DZD', categoryId: null, planned: false, status: 'real', ...over });
const build = (args) => buildSynthesis({ fallbackCurrency: 'DZD', period, now, ...args });

describe('the period', () => {
  test('the current month runs from its first instant to its last', () => {
    assert.equal(period.start.toISOString(), '2026-10-01T00:00:00.000Z');
    assert.equal(period.end.toISOString(), '2026-10-31T23:59:59.999Z');
  });

  test('the previous month is the one before, across a year boundary too', () => {
    assert.equal(previousMonth(new Date('2026-01-15T00:00:00Z')).start.toISOString(), '2025-12-01T00:00:00.000Z');
  });
});

describe('the three figures of screen C05 (PB-F004 to PB-F006)', () => {
  // Diagnostic n°2, C1 (P8-04). The synthesis used to ADD the declared
  // resources to the income actually received: a salary declared once and
  // recorded on arrival counted twice. The client's final rule is
  // « Σ transactions type=Revenu et statut=Réalisé ».
  test('a salary declared AND recorded on arrival is counted once', () => {
    const synthesis = build({
      incomes: [income({ value: 6000000 })],
      movements: [movement({ kind: 'income', value: 6000000 })],
    });
    assert.equal(synthesis.revenus.resultat, 6000000);
    assert.equal(synthesis.revenus.formule_id, 'PB-F004');
  });

  test('a salary declared but not yet received is expected, not received', () => {
    const synthesis = build({ incomes: [income()], movements: [] });
    assert.equal(synthesis.revenus.resultat, null, 'nothing has arrived yet');
    assert.equal(synthesis.revenusPrevus.resultat, 6000000, 'it is shown beside, as expected');
    assert.equal(synthesis.depenses.resultat, null, 'nothing recorded is not zero spent');
  });

  test('the expected resources are normalised to the month (F001)', () => {
    const synthesis = build({ incomes: [income({ value: 1200000, frequency: 'trimestriel' })] });
    assert.equal(synthesis.revenusPrevus.resultat, 400000);
    assert.equal(synthesis.revenusPrevus.formule_id, 'F001');
  });

  test('a resource with an unusable frequency is REPORTED, not guessed', () => {
    const synthesis = build({ incomes: [income({ frequency: 'quand-je-peux' })] });
    assert.ok(synthesis.revenusPrevus.avertissements.some((warning) => warning.includes('fréquence inutilisable')));
    // Declared but unusable is NOT zero: showing 0 would tell someone who
    // declared a resource that they have none.
    assert.equal(synthesis.revenusPrevus.resultat, null);
  });

  test('the usable resources still total when one of them is unusable', () => {
    const synthesis = build({ incomes: [income({ value: 600000 }), income({ id: 'j', frequency: 'quand-je-peux' })] });
    assert.equal(synthesis.revenusPrevus.resultat, 600000);
    assert.equal(synthesis.revenusPrevus.avertissements.length, 1, 'and the dropped one is named');
  });

  test('the net flow is REALISED income minus REALISED expenses (PB-F006)', () => {
    const synthesis = build({
      incomes: [income({ value: 9000000 })],
      movements: [
        movement({ kind: 'income', value: 6000000 }),
        movement({ value: 2000000 }),
        movement({ id: 'p', value: 9999999, planned: true }),
      ],
    });
    assert.equal(synthesis.depenses.resultat, 2000000, 'a planned expense is not a realised one');
    assert.equal(synthesis.depenses.formule_id, 'PB-F005');
    assert.equal(synthesis.fluxNet.resultat, 4000000, 'the declared resource is not part of it');
    assert.equal(synthesis.fluxNet.formule_id, 'PB-F006');
  });

  test('nothing at all is "not computed", never zero', () => {
    const synthesis = build({ incomes: [], movements: [] });
    assert.equal(synthesis.revenus.resultat, null);
    assert.equal(synthesis.revenusPrevus.resultat, null);
    assert.equal(synthesis.fluxNet.resultat, null);
  });
});

describe('money set aside is neither income nor spending (PB-F004, PB-F005)', () => {
  // Diagnostic n°2, C2: a deposit into savings was counted as an expense, a
  // withdrawal as income. Both move money between the person's own pockets.
  const savings = (over = {}) => movement({ category: { family: 'goal' }, categoryId: 'goal-cat', ...over });

  test('a deposit into savings is not an expense', () => {
    const synthesis = build({ movements: [movement({ value: 300000 }), savings({ id: 's', value: 1000000 })] });
    assert.equal(synthesis.depenses.resultat, 300000);
    assert.deepEqual(
      synthesis.repartition.map((row) => row.categoryId),
      [null],
      'and it is not in the breakdown either',
    );
  });

  test('a withdrawal from savings is not income', () => {
    const synthesis = build({ movements: [movement({ kind: 'income', value: 500000 }), savings({ id: 's', kind: 'income', value: 200000 })] });
    assert.equal(synthesis.revenus.resultat, 500000);
  });

  test('a month with savings movements only has no income and no spending', () => {
    const synthesis = build({ movements: [savings()] });
    assert.equal(synthesis.depenses.resultat, null);
    assert.equal(synthesis.revenus.resultat, null);
  });
});

describe('the income a debt ratio is divided by (PB-F020)', () => {
  test('the declared resources, when there are some: a ratio of effort is structural', () => {
    const synthesis = build({ incomes: [income({ value: 6000000 })], movements: [] });
    assert.equal(debtRatioIncome(synthesis), 6000000, 'the salary not yet arrived still counts');
  });

  test('otherwise the income actually received', () => {
    const synthesis = build({ movements: [movement({ kind: 'income', value: 2500000 })] });
    assert.equal(debtRatioIncome(synthesis), 2500000);
  });

  test('without either, it is unknown', () => {
    assert.equal(debtRatioIncome(build({})), null);
  });
});

describe('real and fictional are never added together', () => {
  test('the fictional side is its own block, with its own badge', () => {
    const synthesis = build({
      incomes: [income()],
      movements: [movement({ value: 100000 }), movement({ id: 'f', value: 5000000, status: 'fictional' })],
    });
    assert.equal(synthesis.depenses.resultat, 100000, 'the fictional expense is not in the real total');
    assert.equal(synthesis.simulation.badge, 'SIMULATION');
    assert.equal(synthesis.simulation.depenses, 5000000);
  });

  test('a fictional resource is never part of the real « prévu », nor of the debt ratio', () => {
    const synthesis = build({ incomes: [income(), income({ id: 'p', value: 100000, status: 'fictional' })] });
    assert.equal(synthesis.revenusPrevus.resultat, 6000000);
    assert.equal(debtRatioIncome(synthesis), 6000000);
    assert.equal(synthesis.simulation.revenusPrevus, 100000, 'shown apart, as a simulation');
  });

  test('no fictional movement at all means no simulation block, not an empty one', () => {
    assert.equal(build({ movements: [movement()] }).simulation, null);
  });

  test('a movement whose status is unreadable is counted in NEITHER, and said so', () => {
    const synthesis = build({ movements: [movement(), movement({ id: 'x', value: 777, status: 'peut-être' })] });
    assert.equal(synthesis.depenses.resultat, 100000);
    assert.ok(synthesis.depenses.avertissements.some((warning) => warning.includes('illisible')));
  });
});

describe('currencies are never converted', () => {
  test('two currencies in one period compute no total, and say why', () => {
    const synthesis = build({ incomes: [income()], movements: [movement({ currency: 'EUR' })] });
    assert.equal(synthesis.mixedCurrencies, true);
    assert.equal(synthesis.revenus.resultat, null);
    assert.equal(synthesis.depenses.resultat, null);
    assert.deepEqual(synthesis.repartition, []);
    assert.ok(synthesis.revenus.avertissements.some((warning) => warning.includes('taux daté')));
  });

  test('one currency is used as the unit of every figure', () => {
    const synthesis = build({ incomes: [income({ currency: 'EUR' })], movements: [movement({ currency: 'EUR' })] });
    assert.equal(synthesis.currency, 'EUR');
    assert.equal(synthesis.revenus.unite, 'EUR');
  });

  test('no row at all falls back to the account currency', () => {
    assert.equal(build({}).currency, 'DZD');
  });
});

describe('planned versus real, and the trend', () => {
  test('planned and realised are reported side by side', () => {
    const synthesis = build({ movements: [movement({ value: 300000 }), movement({ id: 'p', value: 800000, planned: true })] });
    assert.equal(synthesis.prevuReel.reel, 300000);
    assert.equal(synthesis.prevuReel.prevu, 800000);
  });

  test('the trend is a difference, not a percentage of a month that may be empty', () => {
    const synthesis = build({ movements: [movement({ value: 300000 })], previous: [movement({ value: 500000 })] });
    assert.equal(synthesis.tendance.moisPrecedent, 500000);
    assert.equal(synthesis.tendance.variation, -200000);
  });

  test('no previous month to compare with gives null, not 0', () => {
    const synthesis = build({ movements: [movement()], previous: [] });
    assert.equal(synthesis.tendance.moisPrecedent, null, 'no row recorded is not "spent nothing"');
    assert.equal(synthesis.tendance.variation, null);
  });

  test('no planned expense gives null, not a forecast of zero', () => {
    assert.equal(build({ movements: [movement()] }).prevuReel.prevu, null);
  });

});

describe('the breakdown', () => {
  test('expenses are grouped by category, biggest first', () => {
    const rows = [
      movement({ categoryId: 'a', value: 100 }),
      movement({ categoryId: 'b', value: 900 }),
      movement({ categoryId: 'a', value: 300 }),
    ];
    assert.deepEqual(breakdown(rows), [
      { categoryId: 'b', total: 900 },
      { categoryId: 'a', total: 400 },
    ]);
  });

  test('uncategorised expenses are a group of their own, and counted', () => {
    const synthesis = build({ movements: [movement({ categoryId: null }), movement({ categoryId: 'a' })] });
    assert.equal(synthesis.nonCategorisees, 1);
    assert.ok(synthesis.repartition.some((row) => row.categoryId === null));
  });
});

describe('the filtered totals of the history', () => {
  const group = (kind, status, sum, { currency = 'DZD', planned = false, count = 1 } = {}) => ({
    kind,
    currency,
    status,
    planned,
    _sum: { value: sum },
    _count: { _all: count },
  });

  test('what happened, what is planned and what is fictional are three totals, never one', () => {
    const totals = foldTotals([
      group('expense', 'real', 500),
      group('expense', 'declared', 700, { planned: true }),
      group('expense', 'fictional', 90000),
    ]);
    assert.equal(totals.real.expense, 500);
    assert.equal(totals.planned.expense, 700, 'a planned expense has not happened');
    assert.equal(totals.fictional.expense, 90000);
    assert.deepEqual(totals.counts, { real: 1, planned: 1, fictional: 1 });
  });

  test('several currencies in the filtered set compute no total', () => {
    const totals = foldTotals([group('expense', 'real', 500), group('expense', 'real', 700, { currency: 'EUR' })]);
    assert.equal(totals.mixedCurrencies, true);
    assert.equal(totals.currency, null);
    assert.equal(totals.real.expense, null);
  });

  test('nothing planned or fictional gives null rather than a block of zeros', () => {
    const totals = foldTotals([group('income', 'real', 100)]);
    assert.equal(totals.fictional, null);
    assert.equal(totals.planned, null);
  });

  test('savings movements stay in the counts but leave the sums (PB-F004, PB-F005)', () => {
    const totals = foldTotals(
      [group('expense', 'real', 1500, { count: 2 }), group('income', 'real', 800, { count: 2 })],
      [group('expense', 'real', 1000), group('income', 'real', 300)],
    );
    assert.equal(totals.real.expense, 500);
    assert.equal(totals.real.income, 500);
    assert.equal(totals.counts.real, 4, 'the rows are still listed');
  });

  test('an empty set has no currency and no total to show', () => {
    const totals = foldTotals([]);
    assert.equal(totals.currency, null);
    assert.deepEqual(totals.counts, { real: 0, planned: 0, fictional: 0 });
  });
});

describe('the history filters', () => {
  test('the account is always part of the filter, with the logical deletion', () => {
    const where = historyWhere('u1', {});
    assert.equal(where.userId, 'u1');
    assert.equal(where.deletedAt, null);
  });

  test('"uncategorised" wins over a category filter instead of combining into nothing', () => {
    const where = historyWhere('u1', { uncategorised: true, categoryId: 'c1' });
    assert.equal(where.categoryId, null);
  });

  test('the text search looks at the note and the sub-category, not at the amount', () => {
    const where = historyWhere('u1', { text: '100' });
    assert.deepEqual(where.OR, [{ note: { contains: '100' } }, { subcategory: { contains: '100' } }]);
    assert.equal(where.value, undefined);
  });

  test('dates and amounts become bounds', () => {
    const from = new Date('2026-10-01T00:00:00Z');
    const where = historyWhere('u1', { from, minAmount: 500, maxAmount: 900 });
    assert.deepEqual(where.occurredAt, { gte: from });
    assert.deepEqual(where.value, { gte: 500, lte: 900 });
  });
});

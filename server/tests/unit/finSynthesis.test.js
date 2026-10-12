import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { breakdown, buildSynthesis, currentMonth, previousMonth } from '../../src/services/finSynthesis.service.js';
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

describe('the three figures of screen C05', () => {
  test('resources are normalised to the month and added to the income movements', () => {
    const synthesis = build({
      incomes: [income({ value: 1200000, frequency: 'trimestriel' })],
      movements: [movement({ kind: 'income', value: 50000 })],
    });
    assert.equal(synthesis.revenus.resultat, 400000 + 50000);
    assert.equal(synthesis.revenus.formule_id, 'F002');
  });

  test('a resource with an unusable frequency is REPORTED, not guessed', () => {
    const synthesis = build({ incomes: [income({ frequency: 'quand-je-peux' })] });
    assert.ok(synthesis.revenus.avertissements.some((warning) => warning.includes('fréquence inutilisable')));
    // Declared but unusable is NOT zero: showing 0 would tell someone who
    // declared a resource that they have none.
    assert.equal(synthesis.revenus.resultat, null);
  });

  test('the usable resources still total when one of them is unusable', () => {
    const synthesis = build({ incomes: [income({ value: 600000 }), income({ id: 'j', frequency: 'quand-je-peux' })] });
    assert.equal(synthesis.revenus.resultat, 600000);
    assert.equal(synthesis.revenus.avertissements.length, 1, 'and the dropped one is named');
  });

  test('the net flow is resources minus REALISED expenses (F004)', () => {
    const synthesis = build({
      incomes: [income()],
      movements: [movement({ value: 2000000 }), movement({ id: 'p', value: 9999999, planned: true })],
    });
    assert.equal(synthesis.depenses.resultat, 2000000, 'a planned expense is not a realised one');
    assert.equal(synthesis.fluxNet.resultat, 4000000);
  });

  test('nothing at all is "not computed", never zero', () => {
    const synthesis = build({ incomes: [], movements: [] });
    assert.equal(synthesis.revenus.resultat, null);
    assert.equal(synthesis.fluxNet.resultat, null);
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

  test('a resource with no one-off income is still a known total', () => {
    const synthesis = build({ incomes: [income()], movements: [] });
    assert.equal(synthesis.revenus.resultat, 6000000);
    assert.equal(synthesis.depenses.resultat, null, 'nothing recorded is not zero spent');
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

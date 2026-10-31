import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLLECTIVE_ALGORITHMS, COLLECTIVE_FORMULAS } from '../../src/constants/finCollectiveFormulas.js';
import { computed } from '../../src/services/finance/contract.js';
import { describeFormula } from '../../src/services/finance/describe.js';
import {
  attachToBudget,
  collectiveBudgetUsage,
  memberTaskLoad,
  percentShares,
  remainingCollectiveBudget,
  requiredContribution,
  taskCompletionRate,
  weightedShares,
} from '../../src/services/finance/collective.js';

// P9-11: the collective catalogue is read from the client's workbook, the
// formulas already written are mapped rather than rewritten, and the new ones
// answer null — never 0 — when they cannot be computed.

test('the collective catalogue holds the 13 formulas and 4 algorithms of the workbook', () => {
  assert.equal(COLLECTIVE_FORMULAS.length, 13);
  assert.equal(COLLECTIVE_ALGORITHMS.length, 4);
});

test('the published correspondences point at the formulas already written', () => {
  const equivalent = (id) => describeFormula(id).equivalent;
  assert.equal(equivalent('COL-F01'), 'F041');
  assert.equal(equivalent('COL-F04'), 'F042');
  assert.equal(equivalent('COL-F05'), 'F043');
  assert.equal(equivalent('COL-F09'), 'F045');
  assert.equal(equivalent('COL-F10'), 'F025 / F026');
  assert.equal(describeFormula('ALG-C01').label.length > 0, true);
  assert.equal(describeFormula('COL-F06').equivalent, undefined);
});

test('the contract answers under a collective identifier', () => {
  const answer = computed('COL-F06', 1500, { inputs: {}, currency: 'DZD' });
  assert.equal(answer.formule_id, 'COL-F06');
  assert.equal(answer.unite, 'DZD');
  assert.equal(computed('COL-F07', 0.5, { inputs: {} }).unite, 'ratio');
  assert.equal(computed('ALG-C02', null, { inputs: {} }).unite, 'composite');
});

test('COL-F02: percentages must add up to 100 and the shares add up to the amount', () => {
  assert.deepEqual(percentShares(1000, [50, 30, 20]), [500, 300, 200]);
  const shares = percentShares(100, [33.33, 33.33, 33.34]);
  assert.equal(shares.reduce((a, b) => a + b, 0), 100);
  assert.equal(percentShares(1000, [50, 30]), null);
});

test('COL-F03: weights are positive', () => {
  assert.deepEqual(weightedShares(900, [1, 2]), [300, 600]);
  assert.equal(weightedShares(900, [1, 0]), null);
});

test('COL-F06 / F07: remaining budget may be negative; usage needs a positive budget', () => {
  assert.equal(remainingCollectiveBudget(10000, [4000, 3000]), 3000);
  assert.equal(remainingCollectiveBudget(10000, [8000, 5000]), -3000);
  assert.equal(collectiveBudgetUsage(10000, 5000), 0.5);
  assert.equal(collectiveBudgetUsage(0, 5000), null);
});

test('COL-F08: the contribution is shared by the active rule and asks nothing when covered', () => {
  assert.deepEqual(requiredContribution(10000, 4000, [1, 1, 1]), { required: 6000, shares: [2000, 2000, 2000] });
  assert.deepEqual(requiredContribution(3000, 4000, [1, 1]), { required: 0, shares: [0, 0] });
  assert.equal(requiredContribution(3000, 1000, []), null);
});

test('COL-F11 / F12: task rates are null without tasks', () => {
  assert.equal(taskCompletionRate(3, 4), 0.75);
  assert.equal(taskCompletionRate(0, 0), null);
  assert.equal(memberTaskLoad([2, 1], [2, 1, 3, 4]), 0.3);
  assert.equal(memberTaskLoad([], []), null);
});

test('ALG-C02: the most specific budget of the same space, period and category wins', () => {
  const budgets = [
    { id: 'a', spaceId: 's', period: '2026-10', categoryId: 'c' },
    { id: 'b', spaceId: 's', period: '2026-10', categoryId: 'c', subCategoryId: 'sc' },
    { id: 'x', spaceId: 'other', period: '2026-10', categoryId: 'c' },
  ];
  const expense = { spaceId: 's', period: '2026-10', categoryId: 'c', subCategoryId: 'sc' };
  assert.equal(attachToBudget(expense, budgets).id, 'b');
  assert.equal(attachToBudget({ ...expense, subCategoryId: 'zz' }, budgets).id, 'a');
  assert.equal(attachToBudget({ ...expense, period: '2026-11' }, budgets), null);
});

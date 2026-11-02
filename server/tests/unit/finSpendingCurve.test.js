import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spendingCurve } from '../../src/services/finBudgetView.service.js';

// G-04: the spending of a budget period day by day against an even pace.
const at = (text) => new Date(`${text}T00:00:00Z`);
const period = { start: new Date('2026-06-01T00:00:00Z'), end: new Date('2026-06-10T00:00:00Z') };
const envelopes = [{ id: 'e1', categoryId: 'c1', categoryGroup: null, value: 100000 }];
const spend = (day, value, extra = {}) => ({ kind: 'expense', value, currency: 'DZD', categoryId: 'c1', planned: false, status: 'real', occurredAt: at(day), ...extra });
const curve = (movements, now) => spendingCurve({ period, envelopes, movements, currency: 'DZD', now });

describe('the spending curve', () => {
  test('cumulates the real spending of the envelopes, against a pace that spreads the plan evenly', () => {
    const points = curve([spend('2026-06-02', 30000), spend('2026-06-04', 20000), spend('2026-06-04', 5000, { categoryId: 'other' })], at('2026-06-05'));
    assert.equal(points.length, 10);
    assert.deepEqual(points.slice(0, 5).map((p) => p.reel), [0, 30000, 30000, 50000, 50000], 'a movement outside the envelopes is not counted');
    assert.deepEqual(points.slice(0, 3).map((p) => p.rythme), [10000, 20000, 30000]);
    assert.equal(points.at(-1).rythme, 100000, 'the pace ends on the whole plan');
  });
  test('the real curve stops today: later days are null, never zero', () => {
    const points = curve([spend('2026-06-02', 30000)], at('2026-06-05'));
    assert.ok(points.slice(5).every((p) => p.reel === null));
  });
  test('planned and fictive movements are not spending; no envelope, no curve', () => {
    const points = curve([spend('2026-06-02', 30000, { planned: true }), spend('2026-06-02', 7000, { status: 'fictional' })], at('2026-06-05'));
    assert.equal(points[4].reel, 0);
    assert.deepEqual(spendingCurve({ period, envelopes: [], movements: [], currency: 'DZD', now: at('2026-06-05') }), []);
  });
  test('a long period is thinned to every seventh day, keeping today and the last day', () => {
    const long = { start: new Date('2026-01-01T00:00:00Z'), end: new Date('2026-12-31T00:00:00Z') };
    const points = spendingCurve({ period: long, envelopes, movements: [], currency: 'DZD', now: at('2026-03-10') });
    assert.ok(points.length < 70);
    assert.equal(points.at(-1).jour, '2026-12-31');
    assert.ok(points.some((p) => p.jour === '2026-03-10'));
  });
});

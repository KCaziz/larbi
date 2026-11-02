import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { dueDates, memberGap } from '../../src/services/finSpaceGoalGap.service.js';

// P9-17: the client's rules on the delay of a member on a common goal.
const da = (units) => units * 100;
const day = (text) => new Date(`${text}T12:00:00Z`);
// A share of 10 000 DA each month, first due on 2026-01-10.
const base = { share: da(10000), firstDueAt: day('2026-01-10'), everyMonths: 1, currency: 'DZD' };

describe('the due dates and what is expected', () => {
  test('a due date every period from the first one, never past the goal date; a month-end date is clamped', () => {
    assert.equal(dueDates({ firstDueAt: day('2026-01-31'), everyMonths: 1 }, day('2026-03-31')).map((d) => d.toISOString().slice(0, 10)).join(), '2026-01-31,2026-02-28,2026-03-31');
    assert.equal(dueDates({ firstDueAt: day('2026-01-10'), everyMonths: 1, targetDate: day('2026-02-15') }, day('2026-06-01')).length, 2);
    assert.equal(dueDates(base, day('2026-01-09')).length, 0, 'nothing is due before the first date');
  });
});

describe('the first alert: 3 days after, gap >= max(500 DA; 10 % of expected)', () => {
  // Two due dates: expected 20 000 DA, so the threshold is 2 000 DA (his example).
  const two = { ...base, now: day('2026-02-13') };
  test('1 999 DA short: nothing; 2 000 DA short: the first alert', () => {
    assert.equal(memberGap({ ...two, paid: da(20000) - da(1999) + 0 }).level, null);
    assert.equal(memberGap({ ...two, paid: da(20000) - da(2000) }).level, 'late');
  });
  test('before the third day, no alert, whatever the gap', () => {
    assert.equal(memberGap({ ...base, now: day('2026-02-12'), paid: da(10000) }).level, null);
  });
  test('the 500 DA floor wins on a small expected amount', () => {
    const small = { share: da(1000), firstDueAt: day('2026-01-10'), everyMonths: 1, currency: 'DZD', now: day('2026-01-14') };
    assert.equal(memberGap({ ...small, paid: da(600) }).level, null, '400 DA short is under the floor, though 40 %');
    assert.equal(memberGap({ ...small, paid: da(400) }).level, 'late', '600 DA short: over the 500 DA floor, under the 1 000 DA of the reinforced level');
  });
  test('nobody is late when they paid their share, or more', () => {
    assert.equal(memberGap({ ...two, paid: da(20000) }).gap, 0);
    assert.equal(memberGap({ ...two, paid: da(99999) }).level, null);
  });
});

describe('the reinforced level and the reminder', () => {
  test('gap >= max(1 000 DA; 25 %) is reinforced', () => {
    const state = memberGap({ ...base, now: day('2026-02-13'), paid: da(20000) - da(5000) });
    assert.equal(state.level, 'reinforced');
  });
  test('a whole period unpaid 7 days after its due date is reinforced even under the percentage', () => {
    // 12 dues: expected 120 000; one whole period (10 000) = 8 %, under 10 %.
    const twelve = { ...base, now: day('2026-12-17') };
    const paid = da(110000);
    assert.equal(memberGap({ ...twelve, now: day('2026-12-12'), paid }).level, null, 'day 2: too soon');
    assert.equal(memberGap({ ...twelve, now: day('2026-12-13'), paid }).level, null, 'day 3: 8 % is under 10 %');
    const week = memberGap({ ...twelve, paid });
    assert.equal(week.level, 'reinforced');
    assert.equal(week.reminder, true);
  });
  test('the reminder only comes 7 days after the due date', () => {
    assert.equal(memberGap({ ...base, now: day('2026-01-14'), paid: 0 }).reminder, false);
    assert.equal(memberGap({ ...base, now: day('2026-01-17'), paid: 0 }).reminder, true);
  });
  test('in another currency only the percentages apply', () => {
    const eur = { share: 1000, firstDueAt: day('2026-01-10'), everyMonths: 1, currency: 'EUR', now: day('2026-01-14') };
    assert.equal(memberGap({ ...eur, paid: 800 }).level, 'late', '20 % of a small amount, no dinar floor');
  });
});

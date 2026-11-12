import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { convertRate, yearlyFraction } from '../../../client/src/lib/ratePeriods.js';

// Recette R11-14: a rate typed per month, quarter, half-year or year, brought to
// the period the engine reads — as a nominal rate, the way banks quote one.
describe('rate periods', () => {
  test('a rate per period, per year', () => {
    assert.equal(convertRate(1, 'mensuel', 'annuel'), 12);
    assert.equal(convertRate(3, 'trimestriel', 'annuel'), 12);
    assert.equal(convertRate(6, 'semestriel', 'annuel'), 12);
    assert.equal(convertRate(12, 'annuel', 'annuel'), 12);
    assert.equal(convertRate(12, 'annuel', 'mensuel'), 1);
  });

  test('what the server stores: a yearly fraction, or nothing', () => {
    assert.equal(yearlyFraction('6', 'annuel'), 0.06);
    assert.equal(yearlyFraction('0,5', 'mensuel'), 0.06);
    assert.equal(yearlyFraction('', 'mensuel'), null);
    assert.equal(yearlyFraction('abc', 'annuel'), null);
  });
});

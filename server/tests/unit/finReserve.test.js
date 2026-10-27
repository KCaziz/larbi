import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { coveredMonths } from '../../src/services/finReserve.service.js';

// Diagnostic n°2, C4 (P8-04): the essential expenses used to be divided by 3
// whatever the history, so two weeks of rent and groceries became a third of
// themselves per month — and the months of reserve were over-estimated. They
// are now averaged over the WHOLE months the history really covers.

const D = (text) => new Date(`${text}T00:00:00.000Z`);
const now = D('2026-10-27');

describe('P8-04 — the months of history the essential expenses are averaged over', () => {
  test('no history covers no month', () => {
    assert.equal(coveredMonths(null, now), 0);
  });

  test('two weeks of history is not a month: never divided by 3', () => {
    assert.equal(coveredMonths(D('2026-10-13'), now), 0);
  });

  test('a history that started a month ago, to the day, covers one month', () => {
    assert.equal(coveredMonths(D('2026-09-27'), now), 1);
    assert.equal(coveredMonths(D('2026-09-28'), now), 0, 'one day short');
  });

  test('two and a half months cover two whole months', () => {
    assert.equal(coveredMonths(D('2026-08-10'), now), 2);
  });

  test('a long history is capped at the three-month window', () => {
    assert.equal(coveredMonths(D('2024-01-01'), now), 3);
  });
});

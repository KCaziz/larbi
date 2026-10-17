import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { requireAdult } from '../../src/middleware/auth.js';

// The 18+ gate (P3-18, rule 18): refused server-side, whatever the API is
// called with directly — never only a hidden button. Exercised on the
// middleware itself: no route is reserved to adults yet (that is Phase 6), so
// this is what proves it refuses correctly before anything is built on it.

function run(user) {
  let result;
  requireAdult({ user }, {}, (err) => {
    result = err ?? 'next';
  });
  return result;
}

describe('requireAdult: deny by default', () => {
  test('a minor (under18) is refused, whatever else is on the account', () => {
    const err = run({ finAgeRange: '13-18', role: 'admin', accessLevel: 'premium' });
    assert.equal(err?.statusCode, 403);
  });

  test('an account with no age bracket yet is refused too — unknown is not adult', () => {
    assert.equal(run({ finAgeRange: null })?.statusCode, 403);
    assert.equal(run({})?.statusCode, 403);
  });

  test('every adult bracket passes', () => {
    for (const range of ['19-24', '25-34', '35-49', '50-64', '65plus']) {
      assert.equal(run({ finAgeRange: range }), 'next');
    }
  });

  test('the check cannot be satisfied by any other field (role, accessLevel, accountType)', () => {
    assert.equal(run({ finAgeRange: '13-18', role: 'admin' })?.statusCode, 403);
    assert.equal(run({ finAgeRange: '13-18', accessLevel: 'premium' })?.statusCode, 403);
  });
});

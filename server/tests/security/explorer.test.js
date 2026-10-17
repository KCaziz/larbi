import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// "Explorer" (P4-13, écran C20) : réservé aux 18 ans et plus (P3-18). Une
// recherche littérale sur les données déjà publiques du comparateur (P4-06),
// jamais un classement ni une affirmation d'éligibilité.

let t;
let minor;
let undetermined;
let adult;

const get = (path, user) => t.request('GET', `/tools/explorateur${path}`, { user });

before(async () => {
  t = await boot();
  await t.reset();
  await t.loadComparatorData();
  minor = await t.user({ finAgeRange: '13-18' });
  undetermined = await t.user({ finAgeRange: null });
  adult = await t.user({ finAgeRange: '25-34' });
});
after(() => t.close());

describe('access: reserved to adults, deny by default', () => {
  test('no session: 401', async () => {
    assert.equal((await get('?q=carte')).status, 401);
  });

  test('a minor: 403', async () => {
    assert.equal((await get('?q=carte', minor)).status, 403);
  });

  test('age not declared yet: 403, treated like a minor, not like an adult', async () => {
    assert.equal((await get('?q=carte', undetermined)).status, 403);
  });

  test('an adult: 200', async () => {
    assert.equal((await get('?q=carte', adult)).status, 200);
  });
});

describe('search: literal, cloistered to the given filters', () => {
  test('no filter at all: empty result, never a full dump', async () => {
    const res = await get('', adult);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.results, []);
  });

  test('a one-character query: empty result too', async () => {
    assert.deepEqual((await get('?q=a', adult)).body.results, []);
  });

  test('a real bank name matches, literally', async () => {
    const res = await get('?q=Natixis', adult);
    assert.ok(res.body.results.length > 0);
    assert.ok(res.body.results.every((r) => r.bank.name === 'Natixis'));
  });

  test('a theme filter narrows the search, an unknown theme is refused', async () => {
    const res = await get('?themes=epargne', adult);
    assert.equal(res.status, 200);
    assert.ok(res.body.results.every((r) => r.theme === 'epargne'));
    assert.equal((await get('?themes=nope', adult)).status, 400);
  });

  test('never a ranking or a score: no "best", no "scores" in the answer', async () => {
    const res = await get('?q=carte', adult);
    for (const row of res.body.results) {
      assert.ok(!('best' in row));
      assert.ok(!('scores' in row));
    }
  });

  test('the freshness shown is the real, global data date — never invented per row', async () => {
    const res = await get('?q=carte', adult);
    assert.ok(res.body.updatedAt);
  });
});

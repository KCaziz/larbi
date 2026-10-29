import '../helpers/setup-env.js';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The favourites of the single tools catalogue (P8-15, OUT-01): the person's
// own, idempotent both ways, only codes of the catalogue.

let t;
let user;
const as = (who, method, path) => t.request(method, path, { user: who });

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ finPublic: 'SAL' });
});
after(() => t.close());

describe('P8-15 — the favourite tools', () => {
  test('added, kept in order, added twice without a double, removed', async () => {
    assert.deepEqual((await as(user, 'GET', '/fin/outils/favoris')).body.favoris, []);
    assert.deepEqual((await as(user, 'PUT', '/fin/outils/favoris/CAL-05')).body.favoris, ['CAL-05']);
    assert.deepEqual((await as(user, 'PUT', '/fin/outils/favoris/OUT-PAIE')).body.favoris, ['CAL-05', 'OUT-PAIE']);
    assert.deepEqual((await as(user, 'PUT', '/fin/outils/favoris/CAL-05')).body.favoris, ['CAL-05', 'OUT-PAIE'], 'no double');
    assert.deepEqual((await as(user, 'DELETE', '/fin/outils/favoris/CAL-05')).body.favoris, ['OUT-PAIE']);
    assert.deepEqual((await as(user, 'DELETE', '/fin/outils/favoris/CAL-05')).body.favoris, ['OUT-PAIE'], 'removing twice is harmless');
  });

  test('a code outside the catalogue is refused, including the excluded collective one', async () => {
    assert.equal((await as(user, 'PUT', '/fin/outils/favoris/CAL-99')).status, 404);
    assert.equal((await as(user, 'PUT', '/fin/outils/favoris/CAL-21')).status, 404);
    assert.equal(await t.prisma.toolFavorite.count(), 0);
  });

  test('the favourites are the person’s own, and leave with the account', async () => {
    await as(user, 'PUT', '/fin/outils/favoris/CAL-05');
    const other = await t.adult({ finPublic: 'SAL' });
    assert.deepEqual((await as(other, 'GET', '/fin/outils/favoris')).body.favoris, []);
    await as(other, 'DELETE', '/fin/outils/favoris/CAL-05');
    assert.deepEqual((await as(user, 'GET', '/fin/outils/favoris')).body.favoris, ['CAL-05'], 'another account cannot remove it');

    await t.prisma.user.delete({ where: { id: user.id } });
    assert.equal(await t.prisma.toolFavorite.count(), 0);
  });

  test('a session is needed', async () => {
    assert.equal((await t.request('GET', '/fin/outils/favoris')).status, 401);
    assert.equal((await t.request('PUT', '/fin/outils/favoris/CAL-05')).status, 401);
  });
});

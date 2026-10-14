import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Real patrimony (P6-11) is the most private figure in the platform: what
// somebody owns, where it is held, and what it is worth. One account must not
// read, change or even learn the existence of another's — and no administrator
// has a screen onto it either.

let t;
let owner;
let intruder;
let admin;
let asset;

const iso = (date) => date.toISOString();
const ago = (days) => new Date(Date.now() - days * 24 * 3600 * 1000);

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.adult();
  intruder = await t.adult();
  // Adult on purpose: otherwise `requireAdult` (P6-17) refuses before the
  // ownership check, and this test would stop proving what it is about.
  admin = await t.adult({ name: 'Test Admin', role: 'admin' });
  const res = await t.request('POST', '/fin/actifs', {
    user: owner,
    json: { label: 'Appartement', kind: 'property', value: 90000000, currency: 'DZD', valuedAt: iso(ago(10)), holder: 'Alger' },
  });
  asset = res.body.asset;
});
after(() => t.close());

describe('the whole of real patrimony needs a session', () => {
  test('every route refuses an anonymous caller', async () => {
    for (const [method, path, json] of [
      ['GET', '/fin/patrimoine', undefined],
      ['GET', '/fin/patrimoine/references', undefined],
      ['GET', '/fin/actifs', undefined],
      ['POST', '/fin/actifs', { label: 'X', kind: 'gold', value: 1, currency: 'DZD', valuedAt: iso(ago(1)) }],
      ['GET', `/fin/actifs/${asset.id}/historique`, undefined],
      ['GET', `/fin/actifs/${asset.id}/valeurs`, undefined],
    ]) {
      const res = await t.request(method, path, { json });
      assert.equal(res.status, 401, `${method} ${path}`);
    }
  });
});

describe("another account's patrimony", () => {
  test('is not in their list, and their net worth is not built from it', async () => {
    const list = await t.request('GET', '/fin/actifs', { user: intruder });
    assert.deepEqual(list.body.assets, []);
    const view = await t.request('GET', '/fin/patrimoine', { user: intruder });
    assert.equal(view.body.patrimoine.patrimoineNet.resultat, null);
    assert.equal(view.body.patrimoine.totalActifs, null);
  });

  test('cannot be read, corrected, archived or deleted — and the answer is 404, not 403', async () => {
    // 404 and not 403: distinguishing "not yours" from "does not exist" would
    // confirm the row exists, which for a patrimony row is itself the leak.
    for (const [method, path, json] of [
      ['GET', `/fin/actifs/${asset.id}/historique`, undefined],
      ['GET', `/fin/actifs/${asset.id}/valeurs`, undefined],
      ['PATCH', `/fin/actifs/${asset.id}`, { value: 1, valuedAt: iso(ago(1)) }],
      ['PUT', `/fin/actifs/${asset.id}/archive`, { archived: true }],
      ['DELETE', `/fin/actifs/${asset.id}`, {}],
    ]) {
      const res = await t.request(method, path, { user: intruder, json });
      assert.equal(res.status, 404, `${method} ${path}`);
    }
    const untouched = await t.prisma.finAsset.findUnique({
      where: { id: asset.id },
      select: { value: true, deletedAt: true, archivedAt: true, holder: true },
    });
    assert.deepEqual(untouched, { value: 90000000, deletedAt: null, archivedAt: null, holder: 'Alger' });
  });

  test('is not visible to an administrator either', async () => {
    const list = await t.request('GET', '/fin/actifs', { user: admin });
    assert.deepEqual(list.body.assets, []);
    const history = await t.request('GET', `/fin/actifs/${asset.id}/historique`, { user: admin });
    assert.equal(history.status, 404, 'there is no administration side to what somebody owns');
  });

  test('the valuation history never leaks through the journal', async () => {
    await t.request('PATCH', `/fin/actifs/${asset.id}`, { user: owner, json: { value: 95000000, valuedAt: iso(ago(1)), reason: 'estimation agence' } });
    const mine = await t.request('GET', `/fin/actifs/${asset.id}/valeurs`, { user: owner });
    assert.ok(mine.body.valuations.length >= 1);
    const theirs = await t.request('GET', `/fin/actifs/${asset.id}/valeurs`, { user: intruder });
    assert.equal(theirs.status, 404, 'a typed reason is as private as the amount');
  });
});

describe('what the server decides, a caller cannot', () => {
  test('the metadata socle is not driven from the body', async () => {
    const res = await t.request('POST', '/fin/actifs', {
      user: owner,
      json: {
        label: 'Forgé',
        kind: 'gold',
        value: 1000,
        currency: 'DZD',
        valuedAt: iso(ago(1)),
        // All of these are the server's to decide.
        source: 'official',
        version: 42,
        effectiveAt: iso(ago(1)),
        sourceRef: 'inventé',
      },
    });
    assert.equal(res.status, 400);
  });

  test('a category of another account cannot be pointed at', async () => {
    const theirs = await t.request('POST', '/fin/categories', { user: intruder, json: { family: 'asset', label: 'Coffre' } });
    const res = await t.request('POST', '/fin/actifs', {
      user: owner,
      json: { label: 'Or', kind: 'gold', value: 1000, currency: 'DZD', valuedAt: iso(ago(1)), categoryId: theirs.body.category.id },
    });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'unknownCategory', "someone else's category is not found, not forbidden");
  });
});

describe('erasing an account takes its patrimony with it', () => {
  test('the assets go with the account that owns them', async () => {
    assert.equal(await t.prisma.finAsset.count({ where: { userId: owner.id } }), 1);
    // The complete deletion the privacy text promises (P6-01 point 9). It must
    // not be refused by a foreign key — the defect P6-04 had to fix.
    await t.prisma.user.delete({ where: { id: owner.id } });
    assert.equal(await t.prisma.finAsset.count({ where: { userId: owner.id } }), 0);
    assert.equal(await t.prisma.finChange.count({ where: { userId: owner.id } }), 0);
  });

  test('a category used by an asset does not block that erasure', async () => {
    const cat = await t.request('POST', '/fin/categories', { user: owner, json: { family: 'asset', label: 'Coffre' } });
    await t.request('POST', '/fin/actifs', {
      user: owner,
      json: { label: 'Or', kind: 'gold', value: 1000000, currency: 'DZD', valuedAt: iso(ago(1)), categoryId: cat.body.category.id },
    });
    await t.prisma.user.delete({ where: { id: owner.id } });
    assert.equal(await t.prisma.finCategory.count({ where: { userId: owner.id } }), 0);
  });
});

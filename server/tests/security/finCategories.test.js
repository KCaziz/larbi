import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P6-02 is where financial data starts existing, so this is where the rule
// "données privées par défaut" is checked: one account must not read, change or
// even learn the existence of another account's categories and corrections.

let t;
let owner;
let intruder;
let admin;
let mine;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  intruder = await t.user();
  admin = await t.admin();
  const res = await t.request('POST', '/fin/categories', { user: owner, json: { family: 'variable', label: 'Café du matin' } });
  mine = res.body.category;
});
after(() => t.close());

describe("another account's category", () => {
  test('is not in their catalogue', async () => {
    const res = await t.request('GET', '/fin/categories?includeArchived=true', { user: intruder });
    const all = res.body.groups.flatMap((g) => g.categories);
    assert.ok(!all.some((c) => c.id === mine.id), "the owner's category is not listed");
    assert.ok(!all.some((c) => c.label === 'Café du matin'));
  });

  test('cannot be read, corrected, archived or deleted — and answers 404, not 403', async () => {
    // 404 on purpose: a 403 would confirm that this id exists and belongs to
    // someone, which is itself information about another account.
    for (const [method, path, json] of [
      ['GET', `/fin/categories/${mine.id}/historique`, undefined],
      ['PATCH', `/fin/categories/${mine.id}`, { label: 'Volé' }],
      ['PUT', `/fin/categories/${mine.id}/archive`, { archived: true }],
      ['DELETE', `/fin/categories/${mine.id}`, {}],
    ]) {
      const res = await t.request(method, path, { user: intruder, ...(json === undefined ? {} : { json }) });
      assert.equal(res.status, 404, `${method} ${path}`);
    }
    const unchanged = await t.prisma.finCategory.findUnique({ where: { id: mine.id } });
    assert.equal(unchanged.label, 'Café du matin');
    assert.equal(unchanged.deletedAt, null);
  });

  test('is not reachable by an administrator either: there is no admin side to money', async () => {
    const res = await t.request('PATCH', `/fin/categories/${mine.id}`, { user: admin, json: { label: 'Volé' } });
    assert.equal(res.status, 404, 'an admin session is just another account here');
    assert.equal((await t.request('GET', `/fin/categories/${mine.id}/historique`, { user: admin })).status, 404);
  });
});

describe('the correction trail', () => {
  test('only ever returns the asking account\'s own entries', async () => {
    await t.request('PATCH', `/fin/categories/${mine.id}`, { user: owner, json: { label: 'Café', reason: 'accent' } });

    const theirs = await t.request('GET', `/fin/categories/${mine.id}/historique`, { user: intruder });
    assert.equal(theirs.status, 404, 'not found, like every other verb on a foreign row');

    const ours = await t.request('GET', `/fin/categories/${mine.id}/historique`, { user: owner });
    assert.equal(ours.body.changes.length, 2);
  });

  test('a reason someone typed is never shown to another account', async () => {
    await t.request('PATCH', `/fin/categories/${mine.id}`, { user: owner, json: { label: 'Café', reason: 'je bois moins' } });
    const theirs = await t.request('GET', `/fin/categories/${mine.id}/historique`, { user: intruder });
    assert.equal(theirs.status, 404);
    assert.ok(!JSON.stringify(theirs.body).includes('je bois moins'));
  });
});

describe('what an account may not decide about its own rows', () => {
  test('the metadata the server owns cannot be set from the body', async () => {
    for (const json of [
      { family: 'goal', label: 'X', status: 'official' },
      { family: 'goal', label: 'X', source: 'partner' },
      { family: 'goal', label: 'X', version: 99 },
      { family: 'goal', label: 'X', key: 'goal.retraite' },
      { family: 'goal', label: 'X', userId: 'someone-else' },
      { family: 'goal', label: 'X', baseKey: 'goal.retraite' },
    ]) {
      const res = await t.request('POST', '/fin/categories', { user: owner, json });
      assert.equal(res.status, 400, JSON.stringify(json));
    }
  });

  test('a correction cannot smuggle in a change of family or of owner', async () => {
    for (const json of [{ family: 'goal' }, { userId: 'someone-else' }, { key: 'goal.retraite' }, { status: 'real' }]) {
      const res = await t.request('PATCH', `/fin/categories/${mine.id}`, { user: owner, json });
      assert.equal(res.status, 400, JSON.stringify(json));
    }
    const unchanged = await t.prisma.finCategory.findUnique({ where: { id: mine.id } });
    assert.equal(unchanged.family, 'variable');
    assert.equal(unchanged.userId, owner.id);
  });

  test('the client\'s reference is read-only for every account, including an administrator', async () => {
    const before = await t.prisma.finCategory.findMany({ where: { userId: null }, select: { key: true, label: true, status: true } });
    for (const user of [owner, intruder, admin]) {
      await t.request('PATCH', '/fin/categories/standard/goal.retraite', { user, json: { label: `Vu par ${user.id}` } });
    }
    const after = await t.prisma.finCategory.findMany({ where: { userId: null }, select: { key: true, label: true, status: true } });
    assert.deepEqual(after, before, 'the reference rows are byte-for-byte what they were');
  });
});

describe('erasing an account erases its financial data', () => {
  // The privacy text promises a complete and immediate deletion (P6-01 point 9,
  // decided 2026-10-11): the categories AND their correction trail go with it,
  // while the client's reference stays.
  test('categories and correction trail go, the reference stays', async () => {
    await t.request('PATCH', `/fin/categories/${mine.id}`, { user: owner, json: { label: 'Café' } });
    await t.request('PATCH', '/fin/categories/standard/goal.retraite', { user: owner, json: { hidden: true } });
    assert.ok((await t.prisma.finChange.count({ where: { userId: owner.id } })) > 0);

    await t.prisma.user.delete({ where: { id: owner.id } });

    assert.equal(await t.prisma.finCategory.count({ where: { userId: owner.id } }), 0);
    assert.equal(await t.prisma.finChange.count({ where: { userId: owner.id } }), 0);
    assert.equal(await t.prisma.finCategory.count({ where: { userId: null } }), 91 + 98, 'the reference is untouched (91 rows of P6-02, 98 of P8-08)');
  });
});

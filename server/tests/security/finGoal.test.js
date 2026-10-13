import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Financial goals (P6-08) are private financial data, exactly like budgets
// (P6-05): one account must not read, change or even learn the existence of
// another account's goals.

let t;
let owner;
let intruder;
let admin;
let goal;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  intruder = await t.user();
  admin = await t.admin();
  const res = await t.request('POST', '/fin/goals', { user: owner, json: { label: 'Voiture', target: 100_000_00, currency: 'DZD', status: 'fictional', allocated: 10_000_00 } });
  goal = res.body.goal;
});
after(() => t.close());

describe("another account's goal", () => {
  test('is not in their list', async () => {
    const res = await t.request('GET', '/fin/goals', { user: intruder });
    assert.ok(!res.body.goals.some((g) => g.id === goal.id));
  });

  test('cannot be read, corrected, archived or deleted — and answers 404, not 403', async () => {
    for (const [method, path, json] of [
      ['GET', `/fin/goals/${goal.id}`, undefined],
      ['GET', `/fin/goals/${goal.id}/historique`, undefined],
      ['PATCH', `/fin/goals/${goal.id}`, { label: 'Volé' }],
      ['PUT', `/fin/goals/${goal.id}/archive`, { archived: true }],
      ['DELETE', `/fin/goals/${goal.id}`, {}],
    ]) {
      const res = await t.request(method, path, { user: intruder, ...(json === undefined ? {} : { json }) });
      assert.equal(res.status, 404, `${method} ${path}`);
    }
    const unchanged = await t.prisma.finGoal.findUnique({ where: { id: goal.id } });
    assert.equal(unchanged.label, 'Voiture');
  });

  test('is not reachable by an administrator either', async () => {
    const res = await t.request('PATCH', `/fin/goals/${goal.id}`, { user: admin, json: { label: 'Volé' } });
    assert.equal(res.status, 404);
  });
});

describe('what an account may not decide about its own rows', () => {
  test('the metadata the server owns cannot be set from the body', async () => {
    for (const json of [
      { label: 'X', target: 1000, currency: 'DZD', status: 'official' },
      { label: 'X', target: 1000, currency: 'DZD', version: 99 },
      { label: 'X', target: 1000, currency: 'DZD', userId: 'someone-else' },
      { label: 'X', target: 1000, currency: 'DZD', source: 'partner' },
    ]) {
      const res = await t.request('POST', '/fin/goals', { user: owner, json });
      assert.equal(res.status, 400, JSON.stringify(json));
    }
  });

  test('a REAL goal cannot claim more than this account has actually set aside', async () => {
    const res = await t.request('POST', '/fin/goals', { user: owner, json: { label: 'Logement', target: 500_000_00, currency: 'DZD', allocated: 999_999_00 } });
    assert.equal(res.status, 422);
  });
});

describe('erasing an account erases its goals', () => {
  test('goals and their correction trail go; another account is untouched', async () => {
    await t.request('PATCH', `/fin/goals/${goal.id}`, { user: owner, json: { label: 'Voiture neuve' } });
    await t.prisma.user.delete({ where: { id: owner.id } });
    assert.equal(await t.prisma.finGoal.count({ where: { userId: owner.id } }), 0);
    assert.equal(await t.prisma.finChange.count({ where: { userId: owner.id, entity: 'goal' } }), 0);
  });
});

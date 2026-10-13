import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Budgets and envelopes (P6-05) are private financial data, exactly like the
// categories they budget (P6-02) and the movements they compare against
// (P6-04): one account must not read, change or even learn the existence of
// another account's plan.

let t;
let owner;
let intruder;
let admin;
let budget;
let category;
let envelope;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  intruder = await t.user();
  admin = await t.admin();

  const cat = await t.request('POST', '/fin/categories', { user: owner, json: { family: 'variable', label: 'Loisirs' } });
  category = cat.body.category;

  const res = await t.request('POST', '/fin/budgets', {
    user: owner,
    json: { label: 'Octobre', periodStart: '2026-10-01', periodEnd: '2026-10-31', currency: 'DZD' },
  });
  budget = res.body.budget;

  const env = await t.request('POST', `/fin/budgets/${budget.id}/enveloppes`, {
    user: owner,
    json: { categoryId: category.id, kind: 'variable', value: 500000 },
  });
  envelope = env.body.envelope;
});
after(() => t.close());

describe("another account's budget", () => {
  test('is not in their list', async () => {
    const res = await t.request('GET', '/fin/budgets', { user: intruder });
    assert.ok(!res.body.budgets.some((b) => b.id === budget.id));
  });

  test('cannot be read, corrected, archived, duplicated or deleted — and answers 404, not 403', async () => {
    for (const [method, path, json] of [
      ['GET', `/fin/budgets/${budget.id}`, undefined],
      ['GET', `/fin/budgets/${budget.id}/historique`, undefined],
      ['PATCH', `/fin/budgets/${budget.id}`, { label: 'Volé' }],
      ['PUT', `/fin/budgets/${budget.id}/archive`, { archived: true }],
      ['POST', `/fin/budgets/${budget.id}/dupliquer`, {}],
      ['DELETE', `/fin/budgets/${budget.id}`, {}],
    ]) {
      const res = await t.request(method, path, { user: intruder, ...(json === undefined ? {} : { json }) });
      assert.equal(res.status, 404, `${method} ${path}`);
    }
    const unchanged = await t.prisma.finBudget.findUnique({ where: { id: budget.id } });
    assert.equal(unchanged.label, 'Octobre');
    assert.equal(unchanged.deletedAt, null);
    assert.equal(unchanged.archivedAt, null);
  });

  test('is not reachable by an administrator either: there is no admin side to money', async () => {
    const res = await t.request('PATCH', `/fin/budgets/${budget.id}`, { user: admin, json: { label: 'Volé' } });
    assert.equal(res.status, 404, 'an admin session is just another account here');
  });
});

describe("another account's envelope", () => {
  test('cannot be read, corrected or deleted on a budget that is not theirs', async () => {
    for (const [method, path, json] of [
      ['GET', `/fin/budgets/${budget.id}/enveloppes/${envelope.id}/historique`, undefined],
      ['PATCH', `/fin/budgets/${budget.id}/enveloppes/${envelope.id}`, { value: 1 }],
      ['DELETE', `/fin/budgets/${budget.id}/enveloppes/${envelope.id}`, {}],
      ['POST', `/fin/budgets/${budget.id}/enveloppes`, { categoryId: category.id, kind: 'variable', value: 1 }],
    ]) {
      const res = await t.request(method, path, { user: intruder, ...(json === undefined ? {} : { json }) });
      assert.equal(res.status, 404, `${method} ${path}`);
    }
    const unchanged = await t.prisma.finEnvelope.findUnique({ where: { id: envelope.id } });
    assert.equal(unchanged.value, 500000);
    assert.equal(unchanged.deletedAt, null);
  });
});

describe('the correction trail', () => {
  test("only ever returns the asking account's own entries, and never leaks a typed reason", async () => {
    await t.request('PATCH', `/fin/budgets/${budget.id}`, { user: owner, json: { label: 'Octobre révisé', reason: 'ajustement loyer' } });

    const theirs = await t.request('GET', `/fin/budgets/${budget.id}/historique`, { user: intruder });
    assert.equal(theirs.status, 404);

    const ours = await t.request('GET', `/fin/budgets/${budget.id}/historique`, { user: owner });
    assert.ok(ours.body.changes.length >= 2);
    assert.ok(!JSON.stringify(theirs.body).includes('ajustement loyer'));
  });
});

describe('what an account may not decide about its own rows', () => {
  test('the metadata the server owns cannot be set on a budget from the body', async () => {
    for (const json of [
      { label: 'X', periodStart: '2027-01-01', periodEnd: '2027-01-31', currency: 'DZD', status: 'official' },
      { label: 'X', periodStart: '2027-01-01', periodEnd: '2027-01-31', currency: 'DZD', source: 'partner' },
      { label: 'X', periodStart: '2027-01-01', periodEnd: '2027-01-31', currency: 'DZD', version: 99 },
      { label: 'X', periodStart: '2027-01-01', periodEnd: '2027-01-31', currency: 'DZD', userId: 'someone-else' },
    ]) {
      const res = await t.request('POST', '/fin/budgets', { user: owner, json });
      assert.equal(res.status, 400, JSON.stringify(json));
    }
  });

  test('a correction cannot smuggle in a change of owner or of version', async () => {
    for (const json of [{ userId: 'someone-else' }, { version: 99 }, { source: 'partner' }]) {
      const res = await t.request('PATCH', `/fin/budgets/${budget.id}`, { user: owner, json });
      assert.equal(res.status, 400, JSON.stringify(json));
    }
    const unchanged = await t.prisma.finBudget.findUnique({ where: { id: budget.id } });
    assert.equal(unchanged.userId, owner.id);
    assert.equal(unchanged.version, 1);
  });

  test('an envelope may not point at another account\'s own category', async () => {
    const theirCategory = await t.request('POST', '/fin/categories', { user: intruder, json: { family: 'variable', label: 'Perso intrus' } });
    const res = await t.request('POST', `/fin/budgets/${budget.id}/enveloppes`, {
      user: owner,
      json: { categoryId: theirCategory.body.category.id, kind: 'variable', value: 100 },
    });
    assert.equal(res.status, 422, "another account's category does not exist from this one's point of view");
  });
});

describe('erasing an account erases its financial plans', () => {
  test('budgets, envelopes and their correction trail go; another account is untouched', async () => {
    await t.request('PATCH', `/fin/budgets/${budget.id}`, { user: owner, json: { label: 'Octobre révisé' } });
    assert.ok((await t.prisma.finChange.count({ where: { userId: owner.id, entity: 'budget' } })) > 0);

    await t.prisma.user.delete({ where: { id: owner.id } });

    assert.equal(await t.prisma.finBudget.count({ where: { userId: owner.id } }), 0);
    assert.equal(await t.prisma.finEnvelope.count({ where: { userId: owner.id } }), 0);
    assert.equal(await t.prisma.finChange.count({ where: { userId: owner.id, entity: { in: ['budget', 'envelope'] } } }), 0);
  });
});

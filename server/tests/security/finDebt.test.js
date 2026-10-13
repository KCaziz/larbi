import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Debts (P6-10) are private financial data, exactly like budgets and goals.

let t;
let owner;
let intruder;
let admin;
let debt;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  intruder = await t.user();
  admin = await t.admin();
  const res = await t.request('POST', '/fin/debts', {
    user: owner,
    json: { label: 'Prêt auto', outstandingPrincipal: 500_000_00, monthlyInstalment: 20_000_00, currency: 'DZD', rate: 0.06 },
  });
  debt = res.body.debt;
});
after(() => t.close());

describe("another account's debt", () => {
  test('is not in their list', async () => {
    const res = await t.request('GET', '/fin/debts', { user: intruder });
    assert.ok(!res.body.debts.some((d) => d.id === debt.id));
  });

  test('cannot be read, corrected, archived, deleted, or paid against — and answers 404', async () => {
    for (const [method, path, json] of [
      ['GET', `/fin/debts/${debt.id}`, undefined],
      ['GET', `/fin/debts/${debt.id}/historique`, undefined],
      ['PATCH', `/fin/debts/${debt.id}`, { label: 'Volé' }],
      ['PUT', `/fin/debts/${debt.id}/archive`, { archived: true }],
      ['DELETE', `/fin/debts/${debt.id}`, {}],
      ['POST', `/fin/debts/${debt.id}/paiements`, { amount: 100, currency: 'DZD', paidAt: new Date().toISOString() }],
    ]) {
      const res = await t.request(method, path, { user: intruder, ...(json === undefined ? {} : { json }) });
      assert.equal(res.status, 404, `${method} ${path}`);
    }
    const unchanged = await t.prisma.finDebt.findUnique({ where: { id: debt.id } });
    assert.equal(unchanged.label, 'Prêt auto');
    assert.equal(unchanged.outstandingPrincipal, 500_000_00);
  });

  test('is not reachable by an administrator either', async () => {
    const res = await t.request('PATCH', `/fin/debts/${debt.id}`, { user: admin, json: { label: 'Volé' } });
    assert.equal(res.status, 404);
  });
});

describe('what an account may not decide about its own rows', () => {
  test('the metadata the server owns cannot be set from the body', async () => {
    for (const json of [
      { label: 'X', outstandingPrincipal: 1, monthlyInstalment: 1, currency: 'DZD', status: 'official' },
      { label: 'X', outstandingPrincipal: 1, monthlyInstalment: 1, currency: 'DZD', version: 99 },
      { label: 'X', outstandingPrincipal: 1, monthlyInstalment: 1, currency: 'DZD', userId: 'someone-else' },
    ]) {
      const res = await t.request('POST', '/fin/debts', { user: owner, json });
      assert.equal(res.status, 400, JSON.stringify(json));
    }
  });
});

describe('a payment', () => {
  test('pays the principal down, is journalled, and never below zero', async () => {
    const res = await t.request('POST', `/fin/debts/${debt.id}/paiements`, { user: owner, json: { amount: 600_000_00, currency: 'DZD', paidAt: new Date().toISOString() } });
    assert.equal(res.status, 201);
    assert.equal(res.body.debt.outstandingPrincipal, 0, 'an overpayment never goes negative');
  });
});

describe('erasing an account erases its debts', () => {
  test('debts, payments and their correction trail go; another account is untouched', async () => {
    await t.request('POST', `/fin/debts/${debt.id}/paiements`, { user: owner, json: { amount: 1000, currency: 'DZD', paidAt: new Date().toISOString() } });
    await t.prisma.user.delete({ where: { id: owner.id } });
    assert.equal(await t.prisma.finDebt.count({ where: { userId: owner.id } }), 0);
    assert.equal(await t.prisma.finDebtPayment.count({ where: { userId: owner.id } }), 0);
  });
});

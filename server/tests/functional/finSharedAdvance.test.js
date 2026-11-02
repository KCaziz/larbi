import '../helpers/setup-env.js';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P9-15 (client's answer G of 2026-11-02): a shared expense paid with one's own
// money debits the ACCOUNT of the whole amount, weighs on the BUDGET for the
// payer's share only, and leaves an advance to recover. Reimbursed, the
// account rises but it is not an income. The client's own example: A pays
// 9 000 DA of groceries for A, B and C in equal parts.

let t;
let a;
let b;
let c;
let space;
let ids;
let current;

const iso = (date) => date.toISOString();
const yesterday = () => new Date(Date.now() - 86400000);
const OPENING = 5000000;
const TOTAL = 900000;

async function memberId(user) {
  const res = await t.request('GET', `/fin/espaces/${space.id}/membres`, { user });
  return res.body.membres.find((m) => m.isMe).id;
}
async function join(user) {
  const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: a, json: { role: 'member' } });
  assert.equal((await t.request('POST', '/fin/espaces/rejoindre', { user, json: { token: invite.body.token } })).status, 201);
}
const accounts = async () => (await t.request('GET', '/fin/comptes', { user: a })).body.accounts;
const balanceOf = async (id) => (await accounts()).find((row) => row.id === id).solde.resultat;
const receivable = async () => (await accounts()).find((row) => row.type === 'AC-09');
const spend = (json) =>
  t.request('POST', `/fin/espaces/${space.id}/depenses`, {
    user: a,
    json: { label: 'Courses', value: TOTAL, occurredAt: iso(yesterday()), splitMode: 'equal', payerId: ids.a, participants: [{ memberId: ids.a }, { memberId: ids.b }, { memberId: ids.c }], personalLink: { accountId: current.id }, ...json },
  });
const reimburse = (json, user = a) =>
  t.request('POST', `/fin/espaces/${space.id}/reglements`, { user, json: { fromId: ids.b, toId: ids.a, value: 300000, settledAt: iso(new Date()), ...json } });

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  a = await t.user();
  b = await t.user();
  c = await t.user();
  space = (await t.request('POST', '/fin/espaces', { user: a, json: { kind: 'flatshare', label: 'Coloc', currency: 'DZD' } })).body.space;
  await join(b);
  await join(c);
  ids = { a: await memberId(a), b: await memberId(b), c: await memberId(c) };
  const made = await t.request('POST', '/fin/comptes', { user: a, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: OPENING, openingDate: iso(new Date(Date.now() - 60 * 86400000)) } });
  assert.equal(made.status, 201, JSON.stringify(made.body).slice(0, 200));
  current = made.body.account;
});
after(() => t.close());

describe('the client example', () => {
  test('the account is debited of 9 000, the budget bears 3 000, 6 000 are an advance to recover', async () => {
    const res = await spend({});
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 300));
    assert.equal(await balanceOf(current.id), OPENING - TOTAL, 'account: -9 000 DA');
    const expenses = await t.prisma.finTransaction.findMany({ where: { userId: a.id, kind: 'expense', deletedAt: null } });
    assert.deepEqual(expenses.map((row) => row.value), [300000], 'personal expense: 3 000 DA');
    const advance = await receivable();
    assert.equal(advance.solde.resultat, 600000, 'advance: 6 000 DA');
    assert.equal(res.body.expense.advanced, true);
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: a.id, kind: 'income' } }), 0);
  });

  test('B pays back 3 000: the account rises, it is not an income, the advance falls from 6 000 to 3 000', async () => {
    await spend({});
    const res = await reimburse({ accountId: current.id });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 300));
    assert.equal(res.body.settlement.advanceApplied, 300000);
    assert.equal(await balanceOf(current.id), OPENING - TOTAL + 300000);
    assert.equal((await receivable()).solde.resultat, 300000);
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: a.id, kind: 'income' } }), 0, 'a transfer back, never an income');
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: a.id, kind: 'expense', deletedAt: null } }), 1);
  });

  test('a repayment is capped at what is still to recover; removing it puts the advance back', async () => {
    await spend({});
    const big = await reimburse({ accountId: current.id, value: 900000 });
    assert.equal(big.body.settlement.advanceApplied, 600000);
    assert.equal((await receivable()).solde.resultat, 0);
    const gone = await t.request('DELETE', `/fin/espaces/${space.id}/reglements/${big.body.settlement.id}`, { user: a, json: {} });
    assert.equal(gone.status, 200);
    assert.equal((await receivable()).solde.resultat, 600000);
    assert.equal(await balanceOf(current.id), OPENING - TOTAL);
  });
});

describe('who says where the money arrived, and what stays declarative', () => {
  test('only the one who was paid can name the account; without one the settlement is declarative as before', async () => {
    await spend({});
    assert.equal((await reimburse({ accountId: current.id }, b)).status, 422, 'B cannot say which account of A received it');
    const plain = await reimburse({});
    assert.equal(plain.status, 201);
    assert.equal(plain.body.settlement.advanceApplied, 0);
    assert.equal((await receivable()).solde.resultat, 600000, 'nothing moved');
  });

  test('the other members see neither the advance nor the transfer behind a settlement', async () => {
    await spend({});
    await reimburse({ accountId: current.id });
    const seen = await t.request('GET', `/fin/espaces/${space.id}/depenses`, { user: b });
    const row = seen.body.expenses[0];
    for (const key of ['advanceTransferId', 'advanceOriginalValue', 'personalCreated', 'advanced', 'linkedToPersonal']) assert.equal(row[key], undefined, key);
    const settlements = await t.request('GET', `/fin/espaces/${space.id}/reglements`, { user: b });
    assert.equal(settlements.body.settlements[0].transferId, undefined);
    assert.equal(settlements.body.settlements[0].accountLinked, true);
  });
});

describe('a payer who takes no part, a cancelled expense', () => {
  test('nothing of it weighs on the budget: the whole amount is an advance', async () => {
    const res = await spend({ participants: [{ memberId: ids.b }, { memberId: ids.c }] });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 300));
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: a.id, kind: 'expense', deletedAt: null } }), 0);
    assert.equal(await balanceOf(current.id), OPENING - TOTAL);
    assert.equal((await receivable()).solde.resultat, TOTAL);
  });

  test('cancelling gives everything back; once reimbursed in part, the settlements go first', async () => {
    const res = await spend({});
    const settled = await reimburse({ accountId: current.id });
    const refused = await t.request('POST', `/fin/espaces/${space.id}/depenses/${res.body.expense.id}/annuler`, { user: a, json: {} });
    assert.equal(refused.status, 409);
    assert.equal(refused.body.error.details.reason, 'advanceReimbursed');
    await t.request('DELETE', `/fin/espaces/${space.id}/reglements/${settled.body.settlement.id}`, { user: a, json: {} });
    const ok = await t.request('POST', `/fin/espaces/${space.id}/depenses/${res.body.expense.id}/annuler`, { user: a, json: {} });
    assert.equal(ok.status, 200, JSON.stringify(ok.body).slice(0, 200));
    assert.equal(await balanceOf(current.id), OPENING);
    assert.equal((await receivable()).solde.resultat, 0);
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: a.id, kind: 'expense', deletedAt: null } }), 0);
  });

  test('an existing entry of the same amount is cut to the share; one of another amount, or of a payer who takes no part, is refused', async () => {
    const entry = (value) => t.request('POST', '/fin/transactions', { user: a, json: { kind: 'expense', value, currency: 'DZD', occurredAt: iso(yesterday()), accountId: current.id } });
    const wrong = (await entry(500000)).body.transaction;
    const refusedAmount = await spend({ personalLink: { transactionId: wrong.id } });
    assert.equal(refusedAmount.status, 422);
    const right = (await entry(TOTAL)).body.transaction;
    const absent = await spend({ participants: [{ memberId: ids.b }, { memberId: ids.c }], personalLink: { transactionId: right.id } });
    assert.equal(absent.status, 422);
    const ok = await spend({ personalLink: { transactionId: right.id } });
    assert.equal(ok.status, 201, JSON.stringify(ok.body).slice(0, 200));
    assert.equal((await t.prisma.finTransaction.findUnique({ where: { id: right.id } })).value, 300000);
    assert.equal((await receivable()).solde.resultat, 600000);
  });
});

describe('P9-16: the 19 common categories and the 125', () => {
  const category = (key) => t.prisma.finCategory.findFirst({ where: { key, userId: null }, select: { id: true } });
  const stored = (id) => t.prisma.finSharedExpense.findUnique({ where: { id }, select: { categoryId: true, collectiveCategory: true } });

  test('a common category alone fills the reference category it is mapped to', async () => {
    const res = await spend({ personalLink: undefined, collectiveCategory: 'COLC-03' });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));
    const row = await stored(res.body.expense.id);
    assert.equal(row.categoryId, (await category('fixed.electricite')).id);
    assert.equal(row.collectiveCategory, 'COLC-03');
  });

  test('a reference category alone finds its group; another one is kept and the group stays the one chosen', async () => {
    const found = await spend({ personalLink: undefined, categoryId: (await category('variable.sorties')).id });
    assert.equal((await stored(found.body.expense.id)).collectiveCategory, 'COLC-14');
    const free = await spend({ personalLink: undefined, categoryId: (await category('variable.cafe_snack')).id });
    assert.equal((await stored(free.body.expense.id)).collectiveCategory, null, 'no group is guessed');
    const both = await spend({ personalLink: undefined, collectiveCategory: 'COLC-02', categoryId: (await category('variable.boulangerie_proximite')).id });
    const row = await stored(both.body.expense.id);
    assert.equal(row.collectiveCategory, 'COLC-02', 'budgets keep grouping by the 19');
    assert.equal(row.categoryId, (await category('variable.boulangerie_proximite')).id);
  });
});

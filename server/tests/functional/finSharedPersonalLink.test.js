import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P9-08: a collective expense paid with personal money is linked to ONE personal
// transaction (COL-F13, QC-04, B5): created on the chosen account OR designated
// among those already entered, never both; the account stays its owner's.
// Since P9-15 that transaction is the payer's SHARE only (the rest is an
// advance, see finSharedAdvance.test.js); the account is still lowered of all.

let t;
let owner;
let flatmate;
let space;
let ownerId;
let flatmateId;
let current;

const iso = (date) => date.toISOString();
const yesterday = () => new Date(Date.now() - 86400000);

async function memberId(user) {
  const res = await t.request('GET', `/fin/espaces/${space.id}/membres`, { user });
  return res.body.membres.find((m) => m.isMe).id;
}
const balance = async () => (await t.request('GET', '/fin/comptes', { user: owner })).body.accounts.find((a) => a.id === current.id).solde.resultat;
const personalExpenses = () => t.prisma.finTransaction.count({ where: { userId: owner.id, kind: 'expense', deletedAt: null } });
const spend = (json, user = owner) =>
  t.request('POST', `/fin/espaces/${space.id}/depenses`, {
    user,
    json: { label: 'Courses', value: 900000, occurredAt: iso(yesterday()), splitMode: 'equal', payerId: ownerId, participants: [{ memberId: ownerId }, { memberId: flatmateId }], ...json },
  });

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  flatmate = await t.user();
  space = (await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'flatshare', label: 'Coloc', currency: 'DZD' } })).body.space;
  const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
  assert.equal((await t.request('POST', '/fin/espaces/rejoindre', { user: flatmate, json: { token: invite.body.token } })).status, 201);
  ownerId = await memberId(owner);
  flatmateId = await memberId(flatmate);
  const made = await t.request('POST', '/fin/comptes', { user: owner, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 5000000, openingDate: iso(new Date(Date.now() - 60 * 86400000)) } });
  assert.equal(made.status, 201, JSON.stringify(made.body).slice(0, 200));
  current = made.body.account;
});
after(() => t.close());

describe('a collective expense paid from a personal account', () => {
  test('QC-04: ONE personal transaction is created on the chosen account, and the collective side keeps the reference', async () => {
    const res = await spend({ personalLink: { accountId: current.id } });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 300));
    assert.equal(await personalExpenses(), 1);
    assert.equal(await balance(), 5000000 - 900000, 'the account is lowered once');
    assert.equal(res.body.expense.linkedToPersonal, true);
    const stored = await t.prisma.finSharedExpense.findUnique({ where: { id: res.body.expense.id }, select: { personalTransactionId: true } });
    const transaction = await t.prisma.finTransaction.findUnique({ where: { id: stored.personalTransactionId } });
    assert.equal(transaction.shared, true);
    assert.equal(transaction.accountId, current.id);
    assert.equal(transaction.value, 450000, 'only his half weighs on his budget');
  });

  test('an already-entered expense can be designated instead — and nothing is created twice', async () => {
    const entered = await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value: 900000, currency: 'DZD', occurredAt: iso(yesterday()), accountId: current.id } });
    assert.equal(entered.status, 201);
    const res = await spend({ personalLink: { transactionId: entered.body.transaction.id } });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 300));
    assert.equal(await personalExpenses(), 1, 'the designated one is the only one');
    assert.equal(await balance(), 5000000 - 900000, 'the account still left of the whole amount');
    assert.equal((await t.prisma.finTransaction.findUnique({ where: { id: entered.body.transaction.id } })).value, 450000, 'cut down to his share');
  });

  test('both an account and a transaction is refused: it would count the money twice', async () => {
    const res = await spend({ personalLink: { accountId: current.id, transactionId: '4f9a2d3e-2c1b-4d5e-8a7f-1b2c3d4e5f60' } });
    assert.equal(res.status, 400);
    assert.equal(await personalExpenses(), 0);
  });

  test('COL-F13: one personal transaction cannot be the source of two collective expenses', async () => {
    const entered = await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value: 900000, currency: 'DZD', occurredAt: iso(yesterday()), accountId: current.id } });
    const id = entered.body.transaction.id;
    assert.equal((await spend({ personalLink: { transactionId: id } })).status, 201);
    assert.equal((await spend({ label: 'Autre', personalLink: { transactionId: id } })).status, 409);
    assert.equal(await t.prisma.finSharedExpense.count({ where: { personalTransactionId: id } }), 1);
  });

  test('only the payer can link their own money; a planned expense cannot be linked', async () => {
    const other = await spend({ payerId: flatmateId, personalLink: { accountId: current.id } });
    assert.equal(other.status, 422);
    const planned = await spend({ planned: true, occurredAt: iso(new Date(Date.now() + 5 * 86400000)), personalLink: { accountId: current.id } });
    assert.equal(planned.status, 422);
    assert.equal(await personalExpenses(), 0);
  });

  test('a later link applies the same rule; an expense that moved the money is undone by cancelling it, not by cutting the link', async () => {
    const expense = (await spend({})).body.expense;
    const entered = (await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value: 900000, currency: 'DZD', occurredAt: iso(yesterday()), accountId: current.id } })).body.transaction;
    const linked = await t.request('PUT', `/fin/espaces/${space.id}/depenses/${expense.id}/lien-personnel`, { user: owner, json: { transactionId: entered.id } });
    assert.equal(linked.status, 200, JSON.stringify(linked.body).slice(0, 200));
    assert.equal((await t.request('PUT', `/fin/espaces/${space.id}/depenses/${expense.id}/lien-personnel`, { user: owner, json: { transactionId: entered.id } })).status, 409);
    assert.equal((await t.request('DELETE', `/fin/espaces/${space.id}/depenses/${expense.id}/lien-personnel`, { user: owner })).status, 409);
    await t.request('POST', `/fin/espaces/${space.id}/depenses/${expense.id}/annuler`, { user: owner, json: {} });
    assert.equal((await t.prisma.finTransaction.findUnique({ where: { id: entered.id } })).value, 900000, 'his own entry is given back as he made it');
    assert.ok(await t.prisma.finSharedExpense.findUnique({ where: { id: expense.id } }));
  });
});

describe('who sees the personal side (QC-05)', () => {
  test('the other members never see the link, nor which account it is', async () => {
    await spend({ personalLink: { accountId: current.id } });
    const asFlatmate = await t.request('GET', `/fin/espaces/${space.id}/depenses`, { user: flatmate });
    const row = asFlatmate.body.expenses[0];
    assert.equal(row.personalTransactionId, undefined);
    assert.equal(row.linkedToPersonal, undefined);
    assert.ok(!JSON.stringify(asFlatmate.body).includes(current.id));
    const asOwner = await t.request('GET', `/fin/espaces/${space.id}/depenses`, { user: owner });
    assert.equal(asOwner.body.expenses[0].linkedToPersonal, true);
  });

  test('cancelling the collective expense takes back what it made on the payer side', async () => {
    const res = await spend({ personalLink: { accountId: current.id } });
    await t.request('POST', `/fin/espaces/${space.id}/depenses/${res.body.expense.id}/annuler`, { user: owner, json: {} });
    assert.equal(await personalExpenses(), 0);
    assert.equal(await balance(), 5000000, 'the money is back on the account');
  });
});

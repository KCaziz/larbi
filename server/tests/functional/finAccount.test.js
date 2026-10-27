import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Accounts and transfers (P8-03): the essentials the client's QA asks for.

let t;
let user;

const DAY = 24 * 3600 * 1000;
const daysAgo = (days) => new Date(Date.now() - days * DAY).toISOString();
const accounts = async (who = user) => (await t.request('GET', '/fin/comptes', { user: who })).body;
const createAccount = async (json) => (await t.request('POST', '/fin/comptes', { user, json: { currency: 'DZD', ...json } })).body.account;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ name: 'Comptes P8-03' });
});
after(() => t.close());

describe('P8-03 — every movement is on an account', () => {
  test('a movement entered without an account goes on an « Espèces » account, created once', async () => {
    for (const value of [100000, 50000]) {
      const res = await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value, currency: 'DZD', occurredAt: daysAgo(1) } });
      assert.equal(res.status, 201);
    }
    const list = await accounts();
    assert.equal(list.accounts.length, 1, 'one default account, not one per movement');
    assert.equal(list.accounts[0].type, 'AC-01');
    // PB-F001: 0 − 150 000.
    assert.equal(list.accounts[0].solde.resultat, -150000);
    assert.equal(list.accounts[0].solde.formule_id, 'PB-F001');
  });

  test('the balance is the opening balance plus realised movements only', async () => {
    const current = await createAccount({ label: 'Compte courant', type: 'AC-02', openingBalance: 1000000, openingDate: daysAgo(30) });
    const add = (json) => t.request('POST', '/fin/transactions', { user, json: { currency: 'DZD', accountId: current.id, occurredAt: daysAgo(2), ...json } });
    await add({ kind: 'income', value: 500000 });
    await add({ kind: 'expense', value: 200000 });
    await add({ kind: 'expense', value: 999999, planned: true, occurredAt: new Date(Date.now() + 5 * DAY).toISOString() });
    const row = (await accounts()).accounts.find((account) => account.id === current.id);
    assert.equal(row.solde.resultat, 1000000 + 500000 - 200000, 'a planned movement touches no balance');
  });

  test('a movement in another currency than its account is refused', async () => {
    const current = await createAccount({ label: 'Compte courant', type: 'AC-02' });
    const res = await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value: 100, currency: 'EUR', accountId: current.id, occurredAt: daysAgo(1) } });
    assert.equal(res.status, 422);
  });
});

describe('P8-03 — a transfer is two linked movements, neither income nor spending', () => {
  test('both sides are written, the total does not move, the synthesis ignores it', async () => {
    const current = await createAccount({ label: 'Compte courant', type: 'AC-02', openingBalance: 1000000, openingDate: daysAgo(30) });
    const savings = await createAccount({ label: 'Épargne', type: 'AC-04', openingDate: daysAgo(30) });
    const res = await t.request('POST', '/fin/transferts', {
      user,
      json: { fromAccountId: current.id, toAccountId: savings.id, value: 300000, occurredAt: daysAgo(1) },
    });
    assert.equal(res.status, 201);

    const list = await accounts();
    const balance = (id) => list.accounts.find((account) => account.id === id).solde.resultat;
    assert.equal(balance(current.id), 700000);
    assert.equal(balance(savings.id), 300000);
    // PB-F025: both accounts are in the total, so the total is unchanged.
    assert.equal(list.totals[0].soldeTotal.resultat, 1000000);

    const synthesis = (await t.request('GET', '/fin/argent/synthese', { user })).body.synthese;
    assert.equal(synthesis.depenses.resultat, null, 'setting money aside is not spending');
    assert.equal(synthesis.revenus.resultat, null);
  });

  test('deleting a transfer removes both sides', async () => {
    const current = await createAccount({ label: 'Compte courant', type: 'AC-02', openingBalance: 1000000, openingDate: daysAgo(30) });
    const savings = await createAccount({ label: 'Épargne', type: 'AC-04', openingDate: daysAgo(30) });
    const { transfer } = (
      await t.request('POST', '/fin/transferts', { user, json: { fromAccountId: current.id, toAccountId: savings.id, value: 300000, occurredAt: daysAgo(1) } })
    ).body;
    assert.equal((await t.request('DELETE', `/fin/transferts/${transfer.transferId}`, { user, json: {} })).status, 200);
    const list = await accounts();
    assert.deepEqual(
      list.accounts.map((account) => account.solde.resultat),
      [1000000, 0],
    );
  });

  test('two accounts in different currencies cannot be linked by a transfer', async () => {
    const dzd = await createAccount({ label: 'DZD', type: 'AC-02' });
    const eur = await createAccount({ label: 'EUR', type: 'AC-02', currency: 'EUR' });
    const res = await t.request('POST', '/fin/transferts', { user, json: { fromAccountId: dzd.id, toAccountId: eur.id, value: 100, occurredAt: daysAgo(1) } });
    assert.equal(res.status, 422);
  });
});

describe('P8-03 — an account is only ever its owner’s', () => {
  test('another person sees none of it and cannot write on it', async () => {
    const mine = await createAccount({ label: 'Compte secret', type: 'AC-02' });
    const other = await t.adult({ name: 'Curieux' });
    assert.deepEqual((await accounts(other)).accounts, []);
    assert.equal((await t.request('PATCH', `/fin/comptes/${mine.id}`, { user: other, json: { label: 'Volé' } })).status, 404);
    const res = await t.request('POST', '/fin/transactions', { user: other, json: { kind: 'expense', value: 100, currency: 'DZD', accountId: mine.id, occurredAt: daysAgo(1) } });
    assert.equal(res.status, 404);
  });
});

describe('P8-05 — alerts, fees and the balance over time', () => {
  test('an account in the red, or under its threshold, says so', async () => {
    const current = await createAccount({ label: 'Courant', type: 'AC-02', openingBalance: 100000, openingDate: daysAgo(30), minBalanceAlert: 500000, overdraftAllowed: 50000 });
    await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value: 200000, currency: 'DZD', accountId: current.id, occurredAt: daysAgo(1) } });
    const row = (await accounts()).accounts.find((account) => account.id === current.id);
    // −100 000: in the red, beyond the 50 000 overdraft, under 500 000.
    assert.deepEqual(row.alertes, ['overdraftExceeded', 'belowMinimum']);
  });

  test('a transfer’s fees are an expense of the source account, the transfer is not', async () => {
    const current = await createAccount({ label: 'Courant', type: 'AC-02', openingBalance: 1000000, openingDate: daysAgo(30) });
    const ccp = await createAccount({ label: 'CCP', type: 'AC-03', openingDate: daysAgo(30) });
    const res = await t.request('POST', '/fin/transferts', { user, json: { fromAccountId: current.id, toAccountId: ccp.id, value: 300000, fee: 2000, occurredAt: daysAgo(1) } });
    assert.equal(res.status, 201);
    const balance = (id) => accounts().then((list) => list.accounts.find((account) => account.id === id).solde.resultat);
    assert.equal(await balance(current.id), 1000000 - 300000 - 2000);
    const synthesis = (await t.request('GET', '/fin/argent/synthese', { user })).body.synthese;
    assert.equal(synthesis.depenses.resultat, 2000, 'only the fees are spending');
  });

  test('the balance month by month ends on today’s balance', async () => {
    const current = await createAccount({ label: 'Courant', type: 'AC-02', openingBalance: 1000000, openingDate: daysAgo(400) });
    await t.request('POST', '/fin/transactions', { user, json: { kind: 'income', value: 50000, currency: 'DZD', accountId: current.id, occurredAt: daysAgo(1) } });
    const history = (await t.request('GET', `/fin/comptes/${current.id}/historique`, { user })).body;
    assert.equal(history.points.length, 6);
    assert.equal(history.points.at(-1).solde, 1050000);
  });
});

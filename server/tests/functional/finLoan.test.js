import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Dettes et créances (P8-13): a simple loan moves real money between the
// person's account and the loan's own account; receivables stay apart from
// debts; repaying is a transfer; nothing of it is income or spending.

let t;
let user;
const ago = (days) => new Date(Date.now() - days * 86_400_000).toISOString();

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ name: 'Dettes P8-13' });
});
after(() => t.close());

const account = async () => (await t.request('POST', '/fin/comptes', { user, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 5000000, openingDate: ago(30) } })).body.account;
const balance = async (id) => (await t.request('GET', '/fin/comptes', { user })).body.accounts.find((row) => row.id === id).solde.resultat;

describe('P8-13 — « J’ai prêté » and « On m’a prêté »', () => {
  test('lending moves the money out, keeps the receivable apart, and its repayment comes back', async () => {
    const current = await account();
    const res = await t.request('POST', '/fin/debts/pret', { user, json: { direction: 'lent', counterparty: 'Karim', accountId: current.id, value: 1000000, occurredAt: ago(5) } });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));
    assert.equal(await balance(current.id), 4000000);

    const list = (await t.request('GET', '/fin/debts', { user })).body;
    assert.equal(list.synthese.encours, 0, 'a receivable is not a debt');
    assert.equal(list.synthese.creances.encours, 1000000);
    const synthesis = (await t.request('GET', '/fin/argent/synthese', { user })).body.synthese;
    assert.equal(synthesis.depenses.resultat, null, 'lending is not spending');

    await t.request('POST', `/fin/debts/${res.body.debt.id}/paiements`, { user, json: { amount: 400000, currency: 'DZD', paidAt: ago(1), accountId: current.id } });
    assert.equal(await balance(current.id), 4400000);
    const after = (await t.request('GET', '/fin/debts', { user })).body;
    assert.equal(after.synthese.creances.encours, 600000);
  });

  test('borrowing brings the money in, and the debt is followed apart', async () => {
    const current = await account();
    const res = await t.request('POST', '/fin/debts/pret', { user, json: { direction: 'borrowed', counterparty: 'Ma tante', accountId: current.id, value: 2000000, occurredAt: ago(5), monthlyInstalment: 200000 } });
    assert.equal(res.status, 201);
    assert.equal(await balance(current.id), 7000000);
    const list = (await t.request('GET', '/fin/debts', { user })).body;
    assert.equal(list.synthese.encours, 2000000);
    const synthesis = (await t.request('GET', '/fin/argent/synthese', { user })).body.synthese;
    assert.equal(synthesis.revenus.resultat, null, 'a loan received is not income');
  });
});

describe('DET-05 — the repayment strategies', () => {
  test('compared in the currency asked for, which the screen sends (found by P8-25)', async () => {
    await t.request('POST', '/fin/debts', { user, json: { label: 'Carte', outstandingPrincipal: 300000, monthlyInstalment: 50000, currency: 'DZD', rate: 0.2 } });
    await t.request('POST', '/fin/debts', { user, json: { label: 'Voiture', outstandingPrincipal: 900000, monthlyInstalment: 60000, currency: 'DZD', rate: 0.08 } });
    const res = await t.request('GET', '/fin/debts/comparaison?currency=DZD', { user });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.ok(res.body.avalanche && res.body.bouleDeNeige, 'both orders');
    assert.equal((await t.request('GET', '/fin/debts/comparaison?inconnu=1', { user })).status, 400, 'an unknown parameter is still refused');
  });
});

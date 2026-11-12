import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Patrimoine réel (P8-14): liquidities come from the accounts, liabilities
// from debts and liability accounts, a receivable is an asset, and nothing is
// counted twice (PB-F024).

let t;
let user;
const ago = (days) => new Date(Date.now() - days * 86_400_000).toISOString();

before(async () => {
  t = await boot({ subscribers: true });
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ name: 'Patrimoine P8-14' });
});
after(() => t.close());

describe('P8-14 — the patrimony reads the accounts', () => {
  test('accounts are assets, a card is a liability, a declared cash balance is not counted twice', async () => {
    const post = (url, json) => t.request('POST', url, { user, json });
    await post('/fin/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 5000000, openingDate: ago(30) });
    await post('/fin/comptes', { label: 'Carte', type: 'AC-07', currency: 'DZD', openingBalance: 800000, openingDate: ago(30) });
    await post('/fin/actifs', { label: 'Compte déclaré', kind: 'account', value: 9999999, currency: 'DZD', valuedAt: ago(10) });
    await post('/fin/actifs', { label: 'Or', kind: 'gold', value: 2000000, currency: 'DZD', valuedAt: ago(10) });

    const view = (await t.request('GET', '/fin/patrimoine', { user })).body.patrimoine;
    assert.equal(view.totalActifs, 5000000 + 2000000, 'the account and the gold, not the declared bank balance the account holds');
    assert.deepEqual(view.nonComptes, [{ label: 'Compte déclaré', reason: 'heldByAccount' }], 'and the screen says why');
    assert.equal(view.totalDettes, 800000, 'the card is owed');
    assert.equal(view.patrimoineNet.resultat, 7000000 - 800000);
    assert.equal(view.patrimoineNet.formule_id, 'PB-F024');
  });

  // Recette R9-19: the patrimony did not include every asset.
  test('a declared CCP or cash balance stays counted when no account of that kind holds it', async () => {
    const post = (url, json) => t.request('POST', url, { user, json });
    await post('/fin/actifs', { label: 'CCP', kind: 'ccp', value: 4000000, currency: 'DZD', valuedAt: ago(10) });
    await post('/fin/actifs', { label: 'Espèces à la maison', kind: 'cash', value: 500000, currency: 'DZD', valuedAt: ago(10) });
    // A first expense with no account opens « Espèces » on its own.
    await post('/fin/transactions', { kind: 'expense', value: 100000, currency: 'DZD', occurredAt: ago(1) });
    const view = (await t.request('GET', '/fin/patrimoine', { user })).body.patrimoine;
    assert.equal(view.totalActifs, 4000000 + 500000, 'the automatic cash account hides nothing');
    assert.equal(view.totalDettes, 100000, 'and its overdraft is owed');
  });

  test('an overdrawn account is a debt, so the net worth matches the net position', async () => {
    const post = (url, json) => t.request('POST', url, { user, json });
    await post('/fin/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: -300000, openingDate: ago(30) });
    await post('/fin/comptes', { label: 'Épargne', type: 'AC-04', currency: 'DZD', openingBalance: 1000000, openingDate: ago(30) });
    const view = (await t.request('GET', '/fin/patrimoine', { user })).body.patrimoine;
    const position = (await t.request('GET', '/fin/comptes', { user })).body.totals[0].positionNette.resultat;
    assert.equal(view.totalDettes, 300000);
    assert.equal(view.patrimoineNet.resultat, 700000);
    assert.equal(view.patrimoineNet.resultat, position);
  });

  test('a receivable is an asset, never a debt', async () => {
    const current = (await t.request('POST', '/fin/comptes', { user, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 5000000, openingDate: ago(30) } })).body.account;
    await t.request('POST', '/fin/debts/pret', { user, json: { direction: 'lent', counterparty: 'Karim', accountId: current.id, value: 1000000, occurredAt: ago(5) } });
    const view = (await t.request('GET', '/fin/patrimoine', { user })).body.patrimoine;
    assert.equal(view.totalActifs, 5000000, '4 000 000 on the account + 1 000 000 owed to me');
    assert.equal(view.totalDettes, null);
  });
});

describe('P8-24 — the net worth history reads the accounts', () => {
  test('an account opened this month contributes from this month, not before', async () => {
    await t.request('POST', '/fin/comptes', { user, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 5000000, openingDate: ago(2) } });
    const points = (await t.request('GET', '/fin/patrimoine/historique', { user })).body.points;
    assert.equal(points.length, 12);
    assert.equal(points.at(-1).net, 5000000);
    assert.equal(points[0].net, 0, 'the account did not exist a year ago');
  });
});

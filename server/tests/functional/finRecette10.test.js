import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Fourth pass of the user acceptance (recette R10, 2026-11-10): one account's
// money in and out, deleting an account, a declared income that always comes
// with its recurrence, the net flow, the emergency fund that can be deleted.

let t;
let user;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ name: 'Recette R10', finCurrency: 'DZD' });
});
after(() => t.close());

const ago = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString();
const post = (url, json) => t.request('POST', url, { user, json });
const account = async (label, openingBalance = 0) => (await post('/fin/comptes', { label, type: 'AC-02', currency: 'DZD', openingBalance })).body.account.id;
const balance = async (id) => (await t.request('GET', '/fin/comptes', { user })).body.accounts.find((row) => row.id === id).solde.resultat;

describe('R10-09 / R10-10 — one account, money in and out', () => {
  test('transfers count for the account, the net flow is in minus out, and the curve has a point a day', async () => {
    const main = await account('Courant', 5000000);
    const other = await account('Épargne');
    await post('/fin/transactions', { kind: 'income', value: 800000, currency: 'DZD', occurredAt: ago(30), accountId: main });
    await post('/fin/transactions', { kind: 'expense', value: 150000, currency: 'DZD', occurredAt: ago(20), accountId: main });
    assert.equal((await post('/fin/transferts', { fromAccountId: main, toAccountId: other, value: 200000, occurredAt: ago(10) })).status, 201);

    const flow = (await t.request('GET', `/fin/comptes/${main}/flux`, { user })).body;
    assert.deepEqual(flow.entrees, { revenus: 800000, virementsRecus: 0, total: 800000 });
    assert.deepEqual(flow.sorties, { depenses: 150000, virementsEnvoyes: 200000, total: 350000 });
    assert.equal(flow.fluxNet, 450000);
    assert.equal(flow.derniers.length, 3);

    const history = (await t.request('GET', `/fin/comptes/${main}/historique?jours=10`, { user })).body.points;
    assert.equal(history.length, 10);
    assert.equal(history.at(-1).solde, 5000000 + 800000 - 150000 - 200000);
    assert.match(history.at(-1).month, /^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('R10-08 — deleting an account', () => {
  test('needs a confirmation, takes its movements, and cancels its transfers on both sides', async () => {
    const main = await account('Courant', 1000000);
    const gone = await account('À supprimer');
    await post('/fin/transferts', { fromAccountId: main, toAccountId: gone, value: 300000, occurredAt: ago(5) });
    assert.equal(await balance(main), 700000);

    assert.equal((await t.request('DELETE', `/fin/comptes/${gone}`, { user, json: {} })).status, 400, 'not without saying so');
    const res = await t.request('DELETE', `/fin/comptes/${gone}`, { user, json: { confirm: true } });
    assert.equal(res.status, 200);
    assert.equal(res.body.transfers, 1);
    assert.equal(await balance(main), 1000000, 'the transfer is cancelled on the other side too');
    const accounts = (await t.request('GET', '/fin/comptes', { user })).body.accounts.map((row) => row.label);
    assert.deepEqual(accounts, ['Courant']);
  });
});

describe('R10-05 — a declared income always comes with its recurrence', () => {
  test('declared on an account, it is offered to confirm, follows corrections, and goes with deletion', async () => {
    const main = await account('Courant');
    const created = await post('/fin/revenus', { label: 'Prime', value: 1500000, currency: 'DZD', frequency: 'mensuel', startDate: ago(1), nextDate: ago(1), accountId: main });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.recurrence.incomeId, created.body.income.id);
    assert.equal(created.body.recurrence.accountId, main);

    let today = (await t.request('GET', '/fin/aujourdhui', { user })).body.aujourdhui.aFaire;
    assert.deepEqual(today.revenusAConfirmer.map((event) => [event.label, event.value]), [['Prime', 1500000]]);

    await t.request('PATCH', `/fin/revenus/${created.body.income.id}`, { user, json: { value: 1600000 } });
    today = (await t.request('GET', '/fin/aujourdhui', { user })).body.aujourdhui.aFaire;
    assert.equal(today.revenusAConfirmer[0].value, 1600000, 'the recurrence follows the income');

    const listed = (await t.request('GET', '/fin/revenus', { user })).body.incomes[0];
    assert.equal(listed.versement.accountId, main);

    await t.request('DELETE', `/fin/revenus/${created.body.income.id}`, { user, json: {} });
    today = (await t.request('GET', '/fin/aujourdhui', { user })).body.aujourdhui.aFaire;
    assert.deepEqual(today.revenusAConfirmer, [], 'deleted with its income');
  });

  test('« déjà reçu » credits it once, and the Accueil says what is still expected', async () => {
    const main = await account('Courant');
    await post('/fin/revenus', { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: ago(1), nextDate: ago(1), accountId: main, received: true });
    assert.equal(await balance(main), 6000000);
    const home = (await t.request('GET', '/fin/accueil', { user })).body.synthese;
    assert.equal(home.revenus.resultat, 6000000);
    assert.equal(home.revenusAttendus.count, 0, 'received: nothing more is expected this month');
  });
});

describe('R10-12 — the net flow is money in minus money out', () => {
  test('spending and no income yet is a negative flow, not « non calculé »', async () => {
    await post('/fin/transactions', { kind: 'expense', value: 250000, currency: 'DZD', occurredAt: ago(5) });
    const synthesis = (await t.request('GET', '/fin/argent/synthese', { user })).body.synthese;
    assert.equal(synthesis.revenus.resultat, null);
    assert.equal(synthesis.fluxNet.resultat, -250000);
  });
});

describe('R10-07 — the emergency fund can be found and deleted', () => {
  test('the reserve names its fund goal, and deleting it ends the measure', async () => {
    const goal = await post('/fin/goals', { label: 'Fonds d’urgence', templateKey: 'emergency', target: 3000000, currency: 'DZD' });
    assert.equal(goal.status, 201, JSON.stringify(goal.body));
    let reserve = (await t.request('GET', '/fin/reserve?currency=DZD', { user })).body;
    assert.deepEqual(reserve.fonds.map((row) => row.id), [goal.body.goal.id]);
    assert.equal((await t.request('DELETE', `/fin/goals/${goal.body.goal.id}`, { user, json: {} })).status, 200);
    reserve = (await t.request('GET', '/fin/reserve?currency=DZD', { user })).body;
    assert.deepEqual(reserve.fonds, []);
    assert.equal(reserve.epargneLiquide, null);
  });
});

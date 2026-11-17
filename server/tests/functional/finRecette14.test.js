import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Recette R14 (2026-11-14): the Accueil follows the chosen account (budget,
// goals, safety reserve), a budget is tied to one account or to the total
// balance, and the reserve is a card of its own.

let t;
before(async () => {
  t = await boot({ subscribers: true });
  await t.reset();
});
after(() => t.close());

const DAY = 86400000;
const monthStart = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
const monthEnd = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 0));
const iso = (date) => date.toISOString();

async function setup() {
  const who = await t.adult({ name: 'Quatorze', finCurrency: 'DZD', finPublic: 'SAL' });
  const post = (path, json) => t.request('POST', `/fin${path}`, { user: who, json });
  const get = (path) => t.request('GET', `/fin${path}`, { user: who });
  const opened = iso(new Date(monthStart().getTime() - 40 * DAY));
  const courant = (await post('/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 15000000, openingDate: opened })).body.account;
  const epargne = (await post('/comptes', { label: 'Livret', type: 'AC-02', currency: 'DZD', openingBalance: 2000000, openingDate: opened })).body.account;
  const food = await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null }, select: { id: true } });
  return { who, post, get, courant, epargne, food: food.id };
}

describe('R14 — the Accueil on one account', () => {
  test('the budget shown is the one tied to the account, or to the total balance', async () => {
    const s = await setup();
    const period = { periodStart: iso(monthStart()), periodEnd: iso(monthEnd()), currency: 'DZD', envelopes: [{ categoryId: s.food, kind: 'variable', value: 1000000 }] };
    const total = (await s.post('/budgets', { label: 'Total', ...period })).body.budget;
    const livret = (await s.post('/budgets', { label: 'Livret', accountId: s.epargne.id, ...period })).body.budget;
    const onTotal = (await s.get('/accueil')).body;
    assert.equal(onTotal.budget.id, total.id);
    assert.equal(onTotal.budget.accountId, null);
    const onAccount = (await s.get(`/accueil?accountId=${s.epargne.id}`)).body;
    assert.equal(onAccount.budget.id, livret.id);
    const none = (await s.get(`/accueil?accountId=${s.courant.id}`)).body;
    assert.equal(none.budget, null, 'no budget tied to the current account');
  });

  test('the goals and the reserve are those of the chosen account', async () => {
    const s = await setup();
    const fund = (
      await s.post('/goals', { label: 'Fonds d’urgence', templateKey: 'emergency', currency: 'DZD', target: 6000000, accountId: s.epargne.id })
    );
    assert.equal(fund.status, 201, JSON.stringify(fund.body));
    const on = (await s.get(`/accueil?accountId=${s.epargne.id}`)).body;
    assert.equal(on.reserve.hasFund, true);
    assert.equal(on.objectifs.length, 1);
    const off = (await s.get(`/accueil?accountId=${s.courant.id}`)).body;
    assert.equal(off.reserve.hasFund, false, 'the current account carries no reserve');
    assert.equal(off.objectifs.length, 0);
    const all = (await s.get('/accueil')).body;
    assert.equal(all.reserve.hasFund, true);
  });
});

describe('R14 (2026-11-15) — an expense and an envelope are on an account or in cash', () => {
  // R16 (2026-11-17, the client): the category decides — an expense of the envelope's
  // category is deducted from it whatever account (or cash) paid it.
  test('spending from another account than the budget’s is deducted from its envelope; cash can be chosen', async () => {
    const who = await t.adult({ name: 'Liquide', finCurrency: 'DZD', finPublic: 'SAL' });
    const post = (path, json) => t.request('POST', `/fin${path}`, { user: who, json });
    const get = (path) => t.request('GET', `/fin${path}`, { user: who });
    const food = (await get('/categories')).body.groups.flatMap((g) => g.categories).find((c) => c.key === 'variable.alimentation_boissons');
    const account = (await post('/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 10000000 })).body.account.id;
    const budget = (await post('/budgets', { label: 'Mois', periodStart: iso(monthStart()).slice(0, 10), periodEnd: iso(monthEnd()).slice(0, 10), currency: 'DZD', accountId: account, envelopes: [{ categoryId: food.id, kind: 'variable', value: 3000000 }] })).body.budget;
    const day = iso(new Date(monthStart().getTime() + 12 * 3600000));
    await post('/transactions', { kind: 'expense', value: 500000, currency: 'DZD', occurredAt: day, categoryId: food.id, accountId: account });
    // No account chosen: « Espèces », which this budget does not follow.
    await post('/transactions', { kind: 'expense', value: 200000, currency: 'DZD', occurredAt: day, categoryId: food.id });

    const view = (await get(`/budgets/${budget.id}`)).body.vue;
    assert.equal(view.enveloppes[0].reel, 700000, 'the cash expense too');
    assert.equal(view.autreCompte, null);

    // « cash » as the account of a budget and of an envelope.
    const cashBudget = await post('/budgets', { label: 'Liquide', periodStart: iso(monthStart()).slice(0, 10), periodEnd: iso(monthEnd()).slice(0, 10), currency: 'DZD', accountId: 'cash', envelopes: [{ categoryId: food.id, kind: 'variable', value: 1000000, accountId: 'cash' }] });
    assert.equal(cashBudget.status, 201, JSON.stringify(cashBudget.body));
    const cash = (await get('/comptes')).body.accounts.find((row) => row.type === 'AC-01');
    assert.equal(cashBudget.body.budget.accountId, cash.id);
    const cashView = (await get(`/budgets/${cashBudget.body.budget.id}`)).body.vue;
    assert.equal(cashView.enveloppes[0].reel, 700000, 'and the other way round');
  });

  test('« cash » opens the Espèces account when there is none yet', async () => {
    const who = await t.adult({ name: 'Sans espèces', finCurrency: 'DZD', finPublic: 'SAL' });
    const res = await t.request('POST', '/fin/budgets', { user: who, json: { label: 'Liquide', periodStart: iso(monthStart()).slice(0, 10), periodEnd: iso(monthEnd()).slice(0, 10), currency: 'DZD', accountId: 'cash' } });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    const accounts = (await t.request('GET', '/fin/comptes', { user: who })).body.accounts;
    assert.equal(accounts.length, 1);
    assert.equal(accounts[0].type, 'AC-01');
    assert.equal(res.body.budget.accountId, accounts[0].id);
  });
});

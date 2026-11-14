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

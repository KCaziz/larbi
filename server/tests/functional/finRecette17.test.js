import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Recette R17 (2026-11-18): « le flux, ce sont les ressources moins les
// dépenses », on the budget too — its resources are the balance at the start,
// the income received and the declared income still expected, so the budget
// moves with every income (it looked frozen) — and an account can be deleted,
// leaving nothing tied to it.

let t;
before(async () => {
  t = await boot({ subscribers: true });
  await t.reset();
});
after(() => t.close());

const now = new Date();
const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
const day = (date) => date.toISOString().slice(0, 10);
const soon = () => new Date(Date.now() - 3600_000).toISOString();

async function setup() {
  const who = await t.adult({ name: 'Dix-sept', finCurrency: 'DZD', finPublic: 'SAL' });
  const call = (method, path, json) => t.request(method, `/fin${path}`, { user: who, json });
  const account = (await call('POST', '/comptes', { label: 'CCP', type: 'AC-02', currency: 'DZD', openingBalance: 15000000 })).body.account;
  const food = (await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null }, select: { id: true } })).id;
  const budget = (
    await call('POST', '/budgets', { label: 'Mois', periodStart: day(monthStart), periodEnd: day(monthEnd), currency: 'DZD', accountId: account.id, envelopes: [{ categoryId: food, kind: 'variable', value: 3000000 }] })
  ).body.budget;
  return { who, call, account, food, budget };
}

describe('R17 — the budget: resources = balance + income received + income still expected', () => {
  test('flux = total resources − expenses, and an income received moves the budget', async () => {
    const s = await setup();
    await s.call('POST', '/transactions', { kind: 'expense', value: 700000, currency: 'DZD', occurredAt: soon(), accountId: s.account.id, categoryId: s.food });
    let vue = (await s.call('GET', `/budgets/${s.budget.id}`)).body.vue;
    assert.equal(vue.soldeDebut.resultat, 15000000);
    assert.equal(vue.ressourcesTotales.resultat, 15000000, 'nothing received or expected yet: the balance alone');
    assert.equal(vue.fluxNet.resultat, 15000000 - 700000, 'resources − expenses, never « non calculé »');

    // An income received, never declared: the budget moves (it looked frozen).
    await s.call('POST', '/transactions', { kind: 'income', value: 2000000, currency: 'DZD', occurredAt: soon(), accountId: s.account.id });
    vue = (await s.call('GET', `/budgets/${s.budget.id}`)).body.vue;
    assert.equal(vue.revenusRecus.resultat, 2000000);
    assert.equal(vue.ressources.resultat, 2000000);
    assert.equal(vue.ressourcesTotales.resultat, 17000000);
    assert.equal(vue.fluxNet.resultat, 17000000 - 700000);
    assert.equal(vue.resteAAffecter.resultat, 17000000 - 3000000);
  });

  test('a declared salary not received yet is expected: counted once', async () => {
    const s = await setup();
    const declared = await s.call('POST', '/revenus', { label: 'Salaire', value: 8000000, currency: 'DZD', frequency: 'mensuel', startDate: monthStart.toISOString(), accountId: s.account.id });
    assert.ok([200, 201].includes(declared.status), JSON.stringify(declared.body).slice(0, 200));
    const vue = (await s.call('GET', `/budgets/${s.budget.id}`)).body.vue;
    const home = (await s.call('GET', `/accueil?accountId=${s.account.id}`)).body.synthese;
    // The budget expects what the Accueil says is « encore attendu ».
    assert.equal(vue.revenusAttendus.resultat, home.revenusAttendus.total);
    assert.equal(vue.ressources.resultat, (vue.revenusRecus.resultat ?? 0) + vue.revenusAttendus.resultat);
    assert.equal(vue.ressourcesTotales.resultat, 15000000 + vue.ressources.resultat);
  });
});

describe('R17 — deleting an account', () => {
  test('confirmed in the body, it is deleted; what was tied to it is detached', async () => {
    const s = await setup();
    const refused = await s.call('DELETE', `/comptes/${s.account.id}`);
    assert.equal(refused.status, 400, 'never without the confirmation');
    const res = await t.request('DELETE', `/fin/comptes/${s.account.id}`, { user: s.who, json: { confirm: true } });
    assert.equal(res.status, 200, JSON.stringify(res.body).slice(0, 200));
    const budget = await t.prisma.finBudget.findUnique({ where: { id: s.budget.id } });
    assert.equal(budget.accountId, null, 'the budget goes back to the total balance');
    const accounts = (await s.call('GET', '/comptes')).body;
    assert.ok(!JSON.stringify(accounts).includes(s.account.id), 'no longer listed');
  });
});

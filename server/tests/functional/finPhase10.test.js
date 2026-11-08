import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Phase 10 (recette du 2026-11-08): the main categories one can choose on their
// own (P10-01), colours chosen by the person (P10-02), and compound interest in
// the paper portfolio (P10-03).

let t;
let user;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ name: 'Phase 10', finCurrency: 'DZD' });
});
after(() => t.close());

const justNow = () => new Date(Date.now() - 60_000).toISOString();
const monthBounds = () => {
  const now = new Date();
  return {
    start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString(),
    end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59)).toISOString(),
  };
};

describe('P10-01 — a main category can be chosen on its own', () => {
  test('« Logement » is offered as a category, and an expense in it counts in the « Logement » envelope', async () => {
    const list = (await t.request('GET', '/fin/categories', { user })).body.groups.flatMap((group) => group.categories);
    const main = list.find((category) => category.main && category.group === 'Logement');
    assert.ok(main, 'the main category is listed');
    assert.equal(main.label, 'Logement');
    assert.ok(list.filter((category) => category.group === 'Logement' && !category.main).length > 1, 'the sub-categories stay');

    const { start, end } = monthBounds();
    const budget = await t.request('POST', '/fin/budgets', { user, json: { label: 'Mois', periodStart: start, periodEnd: end, currency: 'DZD', envelopes: [{ categoryGroup: 'Logement', kind: 'fixed', value: 3000000 }] } });
    assert.equal(budget.status, 201, JSON.stringify(budget.body));
    const spent = await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value: 1200000, currency: 'DZD', occurredAt: justNow(), categoryId: main.id } });
    assert.equal(spent.status, 201, JSON.stringify(spent.body));

    const view = (await t.request('GET', `/fin/budgets/${budget.body.budget.id}`, { user })).body.vue;
    assert.equal(view.enveloppes[0].reel, 1200000, 'the whole group counts it');
  });
});

describe('P10-02 — colours chosen by the person', () => {
  test('a standard category, a budget and an account keep the colour chosen, and null gives the default back', async () => {
    const custom = await t.request('PATCH', '/fin/categories/standard/fixed.loyer', { user, json: { color: '#BE185D' } });
    assert.equal(custom.status, 200, JSON.stringify(custom.body));
    const rent = () => t.request('GET', '/fin/categories', { user }).then((res) => res.body.groups.flatMap((group) => group.categories).find((category) => category.key === 'fixed.loyer'));
    assert.equal((await rent()).color, '#BE185D');
    await t.request('PATCH', '/fin/categories/standard/fixed.loyer', { user, json: { color: null } });
    assert.notEqual((await rent()).color, '#BE185D', 'back to the reference colour');

    const { start, end } = monthBounds();
    const budget = await t.request('POST', '/fin/budgets', { user, json: { label: 'Mois', color: '#0F766E', periodStart: start, periodEnd: end, currency: 'DZD' } });
    assert.equal(budget.body.budget.color, '#0F766E');

    const account = await t.request('POST', '/fin/comptes', { user, json: { label: 'Banque', type: 'AC-02', currency: 'DZD', openingBalance: 0, color: '#4338CA' } });
    assert.equal(account.status, 201, JSON.stringify(account.body));
    const row = (await t.request('GET', '/fin/comptes', { user })).body.accounts.find((item) => item.label === 'Banque');
    assert.equal(row.color, '#4338CA');
    assert.equal(row.customColor, '#4338CA');
  });

  test('a colour is a colour', async () => {
    const res = await t.request('PATCH', '/fin/categories/standard/fixed.loyer', { user, json: { color: 'red' } });
    assert.equal(res.status, 400);
  });
});

describe('P10-03 — compound interest in the paper portfolio', () => {
  test('a savings support shows the part due to compounding', async () => {
    const res = await t.request('GET', '/fin/portefeuille/marche/livret/interets?montant=10000000&mois=24', { user });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.interets.interest, 512164);
    assert.equal(res.body.interets.onInterest, 12164);
  });

  test('a support that pays no interest says so', async () => {
    const res = await t.request('GET', '/fin/portefeuille/marche/or/interets?montant=10000000&mois=24', { user });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'noInterest');
  });

  test('a position says since when it is held', async () => {
    const created = await t.request('POST', '/fin/portefeuille/instruments', { user, json: { label: 'Livret', markPrice: 100000, markedAt: justNow() } });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    await t.request('POST', '/fin/portefeuille/operations', { user, json: { instrumentId: created.body.instrument.id, kind: 'buy', quantity: 2, unitPrice: 100000, decidedAt: justNow() } });
    const position = (await t.request('GET', '/fin/portefeuille', { user })).body.portefeuille.positions[0];
    assert.ok(position.firstBoughtAt, 'the first purchase date');
  });
});

describe('P10-05 — foreign currencies, at the official rate', () => {
  test('a euro account stays in euros, and counts in the patrimony at the official rate of its reference date', async () => {
    const created = await t.request('POST', '/fin/comptes', { user, json: { label: 'Compte devises', type: 'AC-02', currency: 'EUR', openingBalance: 100000 } });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    const accounts = (await t.request('GET', '/fin/comptes', { user })).body;
    const euro = accounts.accounts.find((row) => row.currency === 'EUR');
    assert.equal(euro.solde.resultat, 100000, 'its balance stays in euros');
    assert.equal(euro.contreValeur.value, 15207000, '1 000 EUR × 152,07 DA');
    assert.ok(euro.contreValeur.referenceDate, 'the date of the rate is said');
    assert.equal(accounts.totals.find((row) => row.currency === 'DZD'), undefined, 'not in the dinar balance');

    const wealth = (await t.request('GET', '/fin/patrimoine', { user })).body.patrimoine;
    assert.equal(wealth.totalActifs, 15207000);
    assert.equal(wealth.actifs[0].devise.currency, 'EUR');
  });

  test('only the five currencies are accepted', async () => {
    const res = await t.request('POST', '/fin/comptes', { user, json: { label: 'Yen', type: 'AC-02', currency: 'JPY', openingBalance: 0 } });
    assert.equal(res.status, 400);
    const list = (await t.request('GET', '/fin/devises', { user })).body;
    assert.deepEqual(list.devises, ['DZD', 'EUR', 'USD', 'GBP', 'CAD']);
    assert.equal(list.cours.length, 4);
  });

  test('an administrator records an official rate, and the latest applies', async () => {
    const admin = await t.adult({ name: 'Admin', role: 'admin' });
    const rate = await t.request('POST', '/admin/fin/cours', { user: admin, json: { currency: 'EUR', rate: 150, referenceDate: new Date().toISOString(), source: 'Banque d’Algérie' } });
    assert.equal(rate.status, 201, JSON.stringify(rate.body));
    const forbidden = await t.request('POST', '/admin/fin/cours', { user, json: { currency: 'EUR', rate: 1, referenceDate: new Date().toISOString(), source: 'x' } });
    assert.equal(forbidden.status, 403);
    await t.request('POST', '/fin/comptes', { user, json: { label: 'Compte devises', type: 'AC-02', currency: 'EUR', openingBalance: 100000 } });
    const euro = (await t.request('GET', '/fin/comptes', { user })).body.accounts.find((row) => row.currency === 'EUR');
    assert.equal(euro.contreValeur.value, 15000000);
  });
});

describe('P10-06 — without a subscription', () => {
  test('no invitation into a shared space', async () => {
    const space = await t.request('POST', '/fin/espaces', { user, json: { label: 'Coloc', kind: 'flatshare', currency: 'DZD' } });
    if (space.status !== 201) return assert.fail(`space not created: ${JSON.stringify(space.body).slice(0, 200)}`);
    const id = space.body.space?.id ?? space.body.espace?.id;
    const refused = await t.request('POST', `/fin/espaces/${id}/invitations`, { user, json: { role: 'member' } });
    assert.equal(refused.status, 403);
    assert.equal(refused.body.error.details.reason, 'subscriptionRequired');

    const subscriber = await t.adult({ name: 'Abonné', accessLevel: 'premium' });
    const own = await t.request('POST', '/fin/espaces', { user: subscriber, json: { label: 'Coloc', kind: 'flatshare', currency: 'DZD' } });
    const ownId = own.body.space?.id ?? own.body.espace?.id;
    const invited = await t.request('POST', `/fin/espaces/${ownId}/invitations`, { user: subscriber, json: { role: 'member' } });
    assert.equal(invited.status, 201, JSON.stringify(invited.body).slice(0, 200));
  });
});

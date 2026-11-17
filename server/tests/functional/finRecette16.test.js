import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Recette R16 (2026-11-17): the opening balance of an account is its « revenu
// initial » — counted in the income, the flux, the savings rate and the reste à
// vivre — then adjusted by the incomes declared after it; the account page
// shows the budgets it pays and the envelope each expense is counted in.

let t;
before(async () => {
  t = await boot({ subscribers: true });
  await t.reset();
});
after(() => t.close());

const monthStart = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
const monthEnd = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 0));
const iso = (date) => date.toISOString();
const soon = () => iso(new Date(Date.now() - 3600_000));

async function setup() {
  const who = await t.adult({ name: 'Seize', finCurrency: 'DZD', finPublic: 'SAL' });
  const post = (path, json) => t.request('POST', `/fin${path}`, { user: who, json });
  const get = (path) => t.request('GET', `/fin${path}`, { user: who });
  // A new account, opened today with 150 000 DA, and nothing declared.
  const account = (await post('/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 15000000 })).body.account;
  const food = await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null }, select: { id: true } });
  return { who, post, get, account, food: food.id };
}

describe('R16 — the opening balance is the « revenu initial »', () => {
  test('a new account: its balance is the income of its month, the flux and the account page follow', async () => {
    const s = await setup();
    await s.post('/transactions', { kind: 'expense', value: 3000000, currency: 'DZD', occurredAt: soon(), accountId: s.account.id, categoryId: s.food });

    const home = (await s.get('/accueil')).body.synthese;
    assert.equal(home.revenus.resultat, 15000000, 'revenus = the revenu initial');
    assert.equal(home.revenuInitial.montant, 15000000);
    assert.equal(home.fluxNet.resultat, 12000000, '150 000 − 30 000');
    assert.ok(home.revenusParCategorie.some((row) => row.initial && row.total === 15000000), 'a slice of the income ring');

    const onAccount = (await s.get(`/accueil?accountId=${s.account.id}`)).body.synthese;
    assert.equal(onAccount.revenus.resultat, 15000000, 'the same on the account chosen');

    const flow = (await s.get(`/comptes/${s.account.id}/flux`)).body;
    assert.equal(flow.entrees.soldeInitial, 15000000);
    assert.equal(flow.entrees.total, 15000000);
    assert.equal(flow.fluxNet, 12000000);
  });

  test('an income declared after is added, never in place of it; « déjà dans le solde » is never twice', async () => {
    const s = await setup();
    await s.post('/transactions', { kind: 'income', value: 8000000, currency: 'DZD', occurredAt: soon(), accountId: s.account.id });
    const home = (await s.get('/accueil')).body.synthese;
    assert.equal(home.revenus.resultat, 23000000, '150 000 + 80 000');
    assert.equal(home.revenuInitial.montant, 15000000);
  });

  test('the reste à vivre starts from the revenu initial, then from the declared incomes', async () => {
    const s = await setup();
    const before = (await s.get('/reserve')).body.resteAVivre;
    assert.equal(before.netIncome, 15000000);
    assert.equal(before.incomeSource, 'initial');
    await s.post('/revenus', { label: 'Salaire', value: 8000000, currency: 'DZD', frequency: 'mensuel', startDate: iso(monthStart()) });
    const after = (await s.get('/reserve')).body.resteAVivre;
    assert.equal(after.netIncome, 8000000, 'adjusted by the declared income');
    assert.equal(after.incomeSource, 'declared');
  });

  test('the monthly report keeps « solde début + flux net = solde fin »', async () => {
    const s = await setup();
    await s.post('/transactions', { kind: 'expense', value: 1000000, currency: 'DZD', occurredAt: soon(), accountId: s.account.id, categoryId: s.food });
    const month = iso(monthStart()).slice(0, 7);
    const res = await s.get(`/rapport?mois=${month}`);
    assert.equal(res.status, 200, JSON.stringify(res.body).slice(0, 300));
    const r01 = res.body.rapport?.sections?.R01 ?? res.body.sections?.R01 ?? res.body.R01;
    assert.ok(r01, Object.keys(res.body).join(','));
    assert.equal(r01.soldeDebut.resultat + r01.fluxNet.resultat, r01.soldeFin.resultat);
  });
});

describe('R16 — the account page shows its budgets and reconciles its expenses', () => {
  test('a budget tied to the account, its envelope, and the envelope of each expense', async () => {
    const s = await setup();
    const budget = (
      await s.post('/budgets', {
        label: 'Novembre',
        periodStart: iso(monthStart()).slice(0, 10),
        periodEnd: iso(monthEnd()).slice(0, 10),
        currency: 'DZD',
        accountId: s.account.id,
        envelopes: [{ categoryId: s.food, kind: 'variable', value: 5000000 }],
      })
    ).body.budget;
    const spent = (await s.post('/transactions', { kind: 'expense', value: 1200000, currency: 'DZD', occurredAt: soon(), accountId: s.account.id, categoryId: s.food })).body;
    const other = await t.prisma.finCategory.findFirst({ where: { key: 'variable.transport_public', userId: null }, select: { id: true } });
    await s.post('/transactions', { kind: 'expense', value: 300000, currency: 'DZD', occurredAt: soon(), accountId: s.account.id, categoryId: other.id });

    const flow = (await s.get(`/comptes/${s.account.id}/flux`)).body;
    assert.equal(flow.budgets.length, 1);
    assert.equal(flow.budgets[0].id, budget.id);
    assert.equal(flow.budgets[0].enveloppes[0].reel, 1200000);
    const spentId = spent.transaction?.id ?? spent.id;
    const reconciled = flow.derniers.find((row) => row.id === spentId);
    assert.equal(reconciled.rapprochement.statut, 'envelope');
    assert.equal(reconciled.rapprochement.budgetId, budget.id);
    const outside = flow.derniers.find((row) => row.value === 300000);
    assert.equal(outside.rapprochement.statut, 'outside', 'said « hors budget »');
  });
});

describe('R16 (suite, 2026-11-17) — the client’s answers', () => {
  test('a negative starting balance is a negative revenu initial', async () => {
    const who = await t.adult({ name: 'Découvert', finCurrency: 'DZD', finPublic: 'SAL' });
    const get = (path) => t.request('GET', `/fin${path}`, { user: who });
    const account = (await t.request('POST', '/fin/comptes', { user: who, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: -2000000 } })).body.account;
    const home = (await get('/accueil')).body.synthese;
    assert.equal(home.revenus.resultat, -2000000);
    assert.equal(home.fluxNet.resultat, -2000000);
    assert.equal((await get(`/comptes/${account.id}/flux`)).body.entrees.soldeInitial, -2000000);
    assert.equal((await get('/reserve')).body.resteAVivre.netIncome, -2000000, 'every calculation starts from the starting balance');
  });

  test('an expense of the envelope’s category is deducted from it, whatever account paid it', async () => {
    const s = await setup();
    const other = (await s.post('/comptes', { label: 'Carte', type: 'AC-02', currency: 'DZD', openingBalance: 1000000 })).body.account;
    const budget = (await s.post('/budgets', { label: 'Mois', periodStart: iso(monthStart()).slice(0, 10), periodEnd: iso(monthEnd()).slice(0, 10), currency: 'DZD', accountId: s.account.id, envelopes: [{ categoryId: s.food, kind: 'variable', value: 5000000 }] })).body.budget;
    await s.post('/transactions', { kind: 'expense', value: 100000, currency: 'DZD', occurredAt: soon(), accountId: s.account.id, categoryId: s.food });
    await s.post('/transactions', { kind: 'expense', value: 200000, currency: 'DZD', occurredAt: soon(), accountId: other.id, categoryId: s.food });
    const view = (await s.get(`/budgets/${budget.id}`)).body.vue;
    assert.equal(view.enveloppes[0].reel, 300000, 'both, deducted from the envelope');
    assert.equal(view.totalReel.resultat, 300000);
    assert.equal(view.autreCompte, null);
  });

  test('an expense on the main category reaches the only envelope of its group', async () => {
    const s = await setup();
    const main = await t.prisma.finCategory.findFirst({ where: { key: 'main.alimentation', userId: null }, select: { id: true } });
    const budget = (await s.post('/budgets', { label: 'Mois', periodStart: iso(monthStart()).slice(0, 10), periodEnd: iso(monthEnd()).slice(0, 10), currency: 'DZD', envelopes: [{ categoryId: s.food, kind: 'variable', value: 5000000 }] })).body.budget;
    await s.post('/transactions', { kind: 'expense', value: 150000, currency: 'DZD', occurredAt: soon(), accountId: s.account.id, categoryId: main.id });
    const view = (await s.get(`/budgets/${budget.id}`)).body.vue;
    assert.equal(view.enveloppes[0].reel, 150000);
  });

  test('the balance curve of an account opened today starts from its starting balance', async () => {
    const s = await setup();
    await s.post('/transactions', { kind: 'expense', value: 1000000, currency: 'DZD', occurredAt: soon(), accountId: s.account.id, categoryId: s.food });
    const points = (await s.get(`/comptes/${s.account.id}/historique?jours=10`)).body.points;
    const known = points.filter((point) => point.solde !== null);
    assert.ok(known.length >= 2, JSON.stringify(points.slice(-3)));
    assert.deepEqual(known[0], { month: known[0].month, solde: 15000000, depart: true });
    assert.equal(known.at(-1).solde, 14000000);
  });
});

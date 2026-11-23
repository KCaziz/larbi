import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P13-05, lot C (2026-11-23): expenses by family, stock by lot (CNV-16),
// budgets, the 13-week cash plan — through the API, with the rights of
// 22_AUTORISATIONS (DRT-007: the storekeeper moves stock, never sees values).

let t;
before(async () => {
  t = await boot();
});
beforeEach(() => t.reset());
after(() => t.close());

const DA = (n) => n * 100;
const today = () => new Date().toISOString().slice(0, 10);
const day = (iso) => `${iso}T00:00:00.000Z`;

async function setUp() {
  const owner = await t.adult();
  const created = await t.request('POST', '/fin/entreprise', { user: owner, json: { name: 'Épicerie Amel', currency: 'DZD', publicKey: 'PUB-05' } });
  const as = { 'X-Organisation': created.body.entreprise.id };
  const call = (method, path, json, user = owner) => t.request(method, `/fin/entreprise${path}`, { user, headers: as, json });
  return { owner, as, call };
}

async function member(ctx, role) {
  const person = await t.adult();
  const invited = await ctx.call('POST', '/membres', { email: person.email, role });
  await t.request('POST', `/fin/entreprise/invitations/${invited.body.membre.id}/accepter`, { user: person });
  return person;
}

describe('expenses', () => {
  test('a cash expense is recorded and paid in one go, with its family and default nature', async () => {
    const { call } = await setUp();
    const res = await call('POST', '/documents', { kind: 'purchase', number: 'T-12', label: 'Loyer juin', category: 'loyer', issuedAt: day('2026-06-01'), amountExcl: DA(50000), currency: 'DZD', reglement: { receivedAt: day('2026-06-01'), method: 'especes' } });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    assert.equal(res.body.document.costNature, 'fixed');
    const doc = (await call('GET', '/documents')).body.documents[0];
    assert.equal(doc.reglement.state, 'paid');
  });

  test('a sale has no expense family', async () => {
    const { call } = await setUp();
    const res = await call('POST', '/documents', { kind: 'sale', label: 'Vente', category: 'loyer', issuedAt: day('2026-06-01'), amountExcl: 100, currency: 'DZD' });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'categoryForPurchases');
  });
});

describe('stock by lot', () => {
  test('a lot, a loss and an exit: what is left and what it is worth; never more than what is left', async () => {
    const { call } = await setUp();
    const item = (await call('POST', '/stock/articles', { name: 'Huile 5 L', unit: 'bidon' })).body.article;
    const lot = await call('POST', '/stock/mouvements', { itemId: item.id, kind: 'in', quantity: 400, totalCost: DA(1_280_000) / 100, lotRef: 'L-0601', movedAt: day('2026-06-01') });
    assert.equal(lot.status, 201, JSON.stringify(lot.body));
    const out = await call('POST', '/stock/mouvements', { itemId: item.id, kind: 'out', lotId: lot.body.mouvement.id, quantity: 280, movedAt: day('2026-06-10') });
    assert.equal(out.status, 201);
    const tooMuch = await call('POST', '/stock/mouvements', { itemId: item.id, kind: 'out', lotId: lot.body.mouvement.id, quantity: 121, movedAt: day('2026-06-11') });
    assert.equal(tooMuch.status, 422);
    assert.equal(tooMuch.body.error.details.reason, 'notEnoughStock');
    assert.equal(tooMuch.body.error.details.remaining, 120);

    const stock = (await call('GET', '/stock')).body.articles[0];
    assert.equal(stock.quantite, 120);
    assert.equal(stock.lots[0].unitCost, 3200);
    assert.equal(stock.valeur, 384_000);
    const board = (await call('GET', '/tableau-de-bord')).body;
    assert.equal(board.pilotage.stock.resultat, 384_000);
  });

  test('an exit needs its lot, an entry its cost', async () => {
    const { call } = await setUp();
    const item = (await call('POST', '/stock/articles', { name: 'Sucre', unit: 'kg' })).body.article;
    assert.equal((await call('POST', '/stock/mouvements', { itemId: item.id, kind: 'in', quantity: 10, movedAt: day('2026-06-01') })).body.error.details.reason, 'lotCostRequired');
    assert.equal((await call('POST', '/stock/mouvements', { itemId: item.id, kind: 'out', quantity: 1, movedAt: day('2026-06-01') })).body.error.details.reason, 'lotRequired');
  });

  test('the storekeeper moves stock and sees quantities, never values nor figures (DRT-007)', async () => {
    const ctx = await setUp();
    const keeper = await member(ctx, 'storekeeper');
    const item = (await ctx.call('POST', '/stock/articles', { name: 'Farine', unit: 'sac' }, keeper)).body.article;
    assert.ok(item, 'the storekeeper creates an item');
    const lot = await ctx.call('POST', '/stock/mouvements', { itemId: item.id, kind: 'in', quantity: 50, totalCost: 250_000, movedAt: day('2026-06-01') }, keeper);
    assert.equal(lot.status, 201);
    const seen = (await ctx.call('GET', '/stock', undefined, keeper)).body.articles[0];
    assert.equal(seen.quantite, 50);
    assert.equal(seen.valeur, undefined);
    assert.equal(seen.lots[0].unitCost, undefined);
    assert.equal(seen.lots[0].totalCost, undefined);
    assert.equal((await ctx.call('GET', '/tableau-de-bord', undefined, keeper)).status, 403);
    assert.equal((await ctx.call('PUT', '/budgets', { category: 'loyer', month: '2026-06', amount: 1 }, keeper)).status, 403);
  });
});

describe('budgets and the 13-week plan', () => {
  test('a budget is set, replaced, and compared with the real expenses of its month', async () => {
    const { call } = await setUp();
    const month = today().slice(0, 7);
    await call('PUT', '/budgets', { category: 'loyer', month, amount: DA(1000) });
    const replaced = await call('PUT', '/budgets', { category: 'loyer', month, amount: DA(100_000) });
    assert.equal(replaced.body.budget.version, 2);
    await call('POST', '/documents', { kind: 'purchase', number: 'B-1', label: 'Loyer', category: 'loyer', issuedAt: new Date().toISOString(), amountExcl: DA(120_000), currency: 'DZD' });
    const board = (await call('GET', '/tableau-de-bord')).body;
    assert.equal(board.pilotage.budget.resultat, DA(20_000));
    assert.equal((await call('GET', `/budgets?mois=${month}`)).body.budgets.length, 1);
  });

  test('without an observed balance the plan is empty; with one it runs 13 weeks', async () => {
    const { call } = await setUp();
    const empty = (await call('GET', '/tresorerie')).body;
    assert.equal(empty.depart, null);
    assert.equal(empty.semaines.length, 0);

    const future = await call('POST', '/tresorerie/soldes', { observedAt: day('2099-01-01'), amount: 1 });
    assert.equal(future.body.error.details.reason, 'futureBalance');
    const saved = await call('POST', '/tresorerie/soldes', { observedAt: new Date().toISOString(), amount: -DA(5000), note: 'découvert' });
    assert.equal(saved.status, 201);

    const plan = (await call('GET', '/tresorerie?retardClients=30')).body;
    assert.equal(plan.semaines.length, 13);
    assert.equal(plan.depart.montant, -DA(5000));
    assert.equal(plan.premiereTension, 1);
    assert.equal(plan.besoin.resultat, DA(5000));
    const board = (await call('GET', '/tableau-de-bord')).body;
    assert.equal(board.pilotage.tresorerieDisponible.resultat, -DA(5000));
  });

  test('another organisation’s lot is not found', async () => {
    const one = await setUp();
    const two = await setUp();
    const item = (await one.call('POST', '/stock/articles', { name: 'Riz', unit: 'kg' })).body.article;
    const lot = (await one.call('POST', '/stock/mouvements', { itemId: item.id, kind: 'in', quantity: 5, totalCost: 100, movedAt: day('2026-06-01') })).body.mouvement;
    const other = (await two.call('POST', '/stock/articles', { name: 'Riz', unit: 'kg' })).body.article;
    const res = await two.call('POST', '/stock/mouvements', { itemId: other.id, kind: 'out', lotId: lot.id, quantity: 1, movedAt: day('2026-06-02') });
    assert.equal(res.status, 404);
    assert.equal((await two.call('POST', '/stock/mouvements', { itemId: item.id, kind: 'in', quantity: 1, totalCost: 1, movedAt: day('2026-06-02') })).status, 404);
  });
});

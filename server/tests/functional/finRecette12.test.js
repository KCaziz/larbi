import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Recette R12 (2026-11-12): the reserve estimate of a salaried person (R12-01),
// the reste à vivre of a new account (R12-02), a salary already in the starting
// balance counted in its month (R12-03), and one account without subscription
// (P12-03).

let t;
before(async () => {
  t = await boot({ subscribers: true });
  await t.reset();
});
after(() => t.close());

const salaried = (data = {}) => t.adult({ name: 'Salarié', finCurrency: 'DZD', finPublic: 'SAL', ...data });

describe('R12-01 — the reserve estimate is accepted whatever the profile', () => {
  test('a salaried person corrects the estimate of essential expenses', async () => {
    const who = await salaried();
    // What the reserve screen used to send: refused for this profile.
    const old = await t.request('PUT', '/fin/onboarding', { user: who, json: { answers: { essentialExpenses: { amount: 4500000, frequency: 'mensuel' } }, currency: 'DZD' } });
    assert.equal(old.status, 422, 'the onboarding keeps its own questions per profile');
    const res = await t.request('PUT', '/fin/reserve/estimation', { user: who, json: { amount: 4500000, currency: 'DZD' } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.depensesEssentielles, 4500000);
    assert.equal(res.body.sourceDepensesEssentielles, 'declared');
  });

  test('the corrected total replaces the detail given at sign-up', async () => {
    const who = await t.adult({ name: 'Étudiant', finCurrency: 'DZD', finPublic: 'ETU', finAgeRange: '19-24' });
    const signUp = await t.request('PUT', '/fin/onboarding', { user: who, json: { answers: { housing: { amount: 2000000, frequency: 'mensuel' }, food: { amount: 1500000, frequency: 'mensuel' } }, currency: 'DZD' } });
    assert.equal(signUp.status, 200, JSON.stringify(signUp.body));
    assert.equal((await t.request('GET', '/fin/reserve?currency=DZD', { user: who })).body.depensesEssentielles, 3500000);
    const res = await t.request('PUT', '/fin/reserve/estimation', { user: who, json: { amount: 3000000, currency: 'DZD' } });
    assert.equal(res.body.depensesEssentielles, 3000000, 'the total typed on the reserve screen, not added to the detail');
  });
});

describe('R12-02 — the reste à vivre of a new account', () => {
  test('without a month of history, the fixed charges come from the estimate', async () => {
    const who = await salaried({ name: 'Nouveau' });
    const account = (await t.request('POST', '/fin/comptes', { user: who, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 10000000 } })).body.account.id;
    await t.request('POST', '/fin/revenus', { user: who, json: { label: 'Salaire net', value: 8000000, currency: 'DZD', frequency: 'mensuel', startDate: new Date().toISOString(), accountId: account } });
    const before = (await t.request('GET', '/fin/reserve?currency=DZD', { user: who })).body.resteAVivre;
    assert.equal(before.answer.resultat, null, 'nothing to know the fixed charges from yet');
    await t.request('PUT', '/fin/reserve/estimation', { user: who, json: { amount: 4500000, currency: 'DZD' } });
    const after = (await t.request('GET', '/fin/reserve?currency=DZD', { user: who })).body.resteAVivre;
    assert.equal(after.fixedSource, 'declared');
    assert.equal(after.answer.resultat, 3500000, '80 000 − 45 000');
  });
});

describe('R12-03 — a payment already in the starting balance counts in its month', () => {
  test('« déjà dans le solde de départ » on an occurrence: a real income, the balance unchanged', async () => {
    const who = await salaried({ name: 'Aujourd’hui' });
    const account = (await t.request('POST', '/fin/comptes', { user: who, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 15000000 } })).body.account.id;
    const now = new Date().toISOString();
    const recurrence = (await t.request('POST', '/fin/revenus', { user: who, json: { label: 'Salaire net', value: 8000000, currency: 'DZD', frequency: 'mensuel', startDate: now, accountId: account, nextDate: now } })).body.recurrence;
    const [event] = (await t.request('GET', '/fin/aujourdhui', { user: who })).body.aujourdhui.aFaire.revenusAConfirmer;
    const res = await t.request('POST', '/fin/calendrier/occurrences', { user: who, json: { recurrenceId: recurrence.id, dueDate: new Date(`${event.dueDate}T00:00:00.000Z`).toISOString(), action: 'included' } });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    assert.ok(res.body.occurrence.transactionId, 'a real movement');

    const row = (await t.request('GET', '/fin/comptes', { user: who })).body.accounts[0];
    assert.equal(row.solde.resultat, 15000000, 'the balance does not move');
    assert.equal(row.openingBalance, 7000000, 'the starting balance is what it was before the salary');
    const kpis = (await t.request('GET', '/fin/aujourdhui', { user: who })).body.aujourdhui.kpis;
    assert.equal(kpis.find((k) => k.key === 'netFlow').answer.resultat, 8000000, 'the salary counts in the month');
    const again = await t.request('POST', '/fin/calendrier/occurrences', { user: who, json: { recurrenceId: recurrence.id, dueDate: new Date(`${event.dueDate}T00:00:00.000Z`).toISOString(), action: 'included' } });
    assert.equal(again.status, 409, 'never twice');
  });
});

describe('R12-04 — every real expense reaches its envelope', () => {
  test('an envelope on a main category takes its sub-categories, and the last day of the period counts', async () => {
    const who = await salaried({ name: 'Budget' });
    const cats = (await t.request('GET', '/fin/categories', { user: who })).body.groups.flatMap((g) => g.categories);
    const main = cats.find((c) => c.key === 'main.alimentation');
    const sub = cats.find((c) => c.key === 'variable.alimentation_boissons');
    const budget = await t.request('POST', '/fin/budgets', { user: who, json: { label: 'Octobre', periodStart: '2026-10-01', periodEnd: '2026-10-31', currency: 'DZD', envelopes: [{ categoryId: main.id, kind: 'variable', value: 3000000 }] } });
    assert.equal(budget.status, 201, JSON.stringify(budget.body));
    const spend = (value, occurredAt, categoryId) => t.request('POST', '/fin/transactions', { user: who, json: { kind: 'expense', value, currency: 'DZD', occurredAt, categoryId } });
    await spend(100000, '2026-10-08T10:00:00.000Z', sub.id);
    await spend(200000, '2026-10-09T10:00:00.000Z', main.id);
    await spend(400000, '2026-10-31T15:00:00.000Z', main.id);
    await spend(800000, '2026-11-01T09:00:00.000Z', main.id);

    const view = (await t.request('GET', `/fin/budgets/${budget.body.budget.id}`, { user: who })).body.vue;
    assert.equal(view.enveloppes[0].reel, 700000, 'the sub-category and the 31st, not November');

    const listed = await t.request('GET', '/fin/transactions?categoryGroup=Alimentation&from=2026-10-01&to=2026-10-31', { user: who });
    assert.equal(listed.body.transactions.length, 3, '« au 31 » includes the 31st');
  });
});

describe('P12-03 — one account of one’s own without a subscription', () => {
  test('a second account needs a subscription; automatic accounts do not count', async () => {
    const who = await salaried({ name: 'Gratuit', accessLevel: 'standard' });
    const first = await t.request('POST', '/fin/comptes', { user: who, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 1000000 } });
    assert.equal(first.status, 201);
    // A movement with no account opens « Espèces » by itself: allowed, not counted.
    const cash = await t.request('POST', '/fin/transactions', { user: who, json: { kind: 'expense', value: 10000, currency: 'DZD', occurredAt: new Date().toISOString() } });
    assert.equal(cash.status, 201, JSON.stringify(cash.body));
    const second = await t.request('POST', '/fin/comptes', { user: who, json: { label: 'Épargne', type: 'AC-04', currency: 'DZD' } });
    assert.equal(second.status, 403);
    assert.equal(second.body.error.details.reason, 'subscriptionRequired');
    assert.equal(second.body.error.details.feature, 'accounts');

    // Archived, the first one frees the place; bringing it back is refused then.
    await t.request('PUT', `/fin/comptes/${first.body.account.id}/archive`, { user: who, json: { archived: true } });
    const other = await t.request('POST', '/fin/comptes', { user: who, json: { label: 'Épargne', type: 'AC-04', currency: 'DZD' } });
    assert.equal(other.status, 201);
    const back = await t.request('PUT', `/fin/comptes/${first.body.account.id}/archive`, { user: who, json: { archived: false } });
    assert.equal(back.status, 403);
  });

  test('a subscriber opens as many as needed', async () => {
    const who = await salaried({ name: 'Abonné' });
    for (const label of ['Un', 'Deux', 'Trois']) {
      assert.equal((await t.request('POST', '/fin/comptes', { user: who, json: { label, type: 'AC-02', currency: 'DZD' } })).status, 201);
    }
  });
});

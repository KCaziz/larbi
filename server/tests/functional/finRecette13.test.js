import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Recette R13 (2026-11-12, 7th pass): the account a budget and its envelopes
// are spent from (R13-01), a weekly budget (R13-02), the balance counted as a
// resource (R13-03), the shares and the committed amount of an envelope (R13-04).

let t;
before(async () => {
  t = await boot({ subscribers: true });
  await t.reset();
});
after(() => t.close());

const DAY = 86400000;
const monthStart = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 0, 0, 0));
const monthEnd = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 0, 0, 0, 0));
const iso = (date) => date.toISOString();
const spendDate = () => iso(new Date(Date.now() - 3600_000));

async function setup(extra = {}) {
  const who = await t.adult({ name: 'Septième', finCurrency: 'DZD', finPublic: 'SAL', ...extra });
  const post = (path, json) => t.request('POST', `/fin${path}`, { user: who, json });
  const get = (path) => t.request('GET', `/fin${path}`, { user: who });
  const opened = iso(new Date(monthStart().getTime() - 40 * DAY));
  const courant = (await post('/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 15000000, openingDate: opened })).body.account;
  const second = (await post('/comptes', { label: 'Carte pro', type: 'AC-02', currency: 'DZD', openingBalance: 2000000, openingDate: opened })).body.account;
  const food = await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null }, select: { id: true } });
  const transport = await t.prisma.finCategory.findFirst({ where: { key: 'variable.transport_public', userId: null }, select: { id: true } });
  return { who, post, get, courant, second, food: food.id, transport: transport.id };
}

describe('R13-01 — the account a budget is spent from', () => {
  test('a budget on one account counts only what that account paid, in its envelopes and its total', async () => {
    const s = await setup();
    const budget = (
      await s.post('/budgets', {
        label: 'Ce mois',
        periodStart: iso(monthStart()),
        periodEnd: iso(monthEnd()),
        currency: 'DZD',
        accountId: s.second.id,
        envelopes: [{ categoryId: s.food, kind: 'variable', value: 1000000 }],
      })
    ).body.budget;
    assert.equal(budget.accountId, s.second.id);
    // 3 000 DA on the current account, 1 000 DA on the card of the budget.
    await s.post('/transactions', { kind: 'expense', value: 300000, currency: 'DZD', occurredAt: spendDate(), accountId: s.courant.id, categoryId: s.food });
    await s.post('/transactions', { kind: 'expense', value: 100000, currency: 'DZD', occurredAt: spendDate(), accountId: s.second.id, categoryId: s.food });
    const view = (await s.get(`/budgets/${budget.id}`)).body.vue;
    assert.equal(view.enveloppes[0].reel, 100000, 'only the card’s spending is in the envelope');
    assert.equal(view.totalReel.resultat, 100000, 'and in the budget’s total');
  });

  test('« tous » (no account) counts the accounts of the total balance, as before', async () => {
    const s = await setup();
    const budget = (await s.post('/budgets', { label: 'Tous', periodStart: iso(monthStart()), periodEnd: iso(monthEnd()), currency: 'DZD', envelopes: [{ categoryId: s.food, kind: 'variable', value: 1000000 }] })).body.budget;
    assert.equal(budget.accountId, null);
    await s.post('/transactions', { kind: 'expense', value: 300000, currency: 'DZD', occurredAt: spendDate(), accountId: s.courant.id, categoryId: s.food });
    await s.post('/transactions', { kind: 'expense', value: 100000, currency: 'DZD', occurredAt: spendDate(), accountId: s.second.id, categoryId: s.food });
    assert.equal((await s.get(`/budgets/${budget.id}`)).body.vue.enveloppes[0].reel, 400000);
  });

  test('an envelope may have its own account, different from the budget’s', async () => {
    const s = await setup();
    const budget = (
      await s.post('/budgets', {
        label: 'Mixte',
        periodStart: iso(monthStart()),
        periodEnd: iso(monthEnd()),
        currency: 'DZD',
        accountId: s.courant.id,
        envelopes: [
          { categoryId: s.food, kind: 'variable', value: 1000000 },
          { categoryId: s.transport, kind: 'variable', value: 500000, accountId: s.second.id },
        ],
      })
    ).body.budget;
    await s.post('/transactions', { kind: 'expense', value: 300000, currency: 'DZD', occurredAt: spendDate(), accountId: s.courant.id, categoryId: s.food });
    await s.post('/transactions', { kind: 'expense', value: 70000, currency: 'DZD', occurredAt: spendDate(), accountId: s.courant.id, categoryId: s.transport });
    await s.post('/transactions', { kind: 'expense', value: 90000, currency: 'DZD', occurredAt: spendDate(), accountId: s.second.id, categoryId: s.transport });
    const lines = (await s.get(`/budgets/${budget.id}`)).body.vue.enveloppes;
    const byCategory = (id) => lines.find((line) => line.categoryId === id);
    assert.equal(byCategory(s.food).reel, 300000);
    assert.equal(byCategory(s.transport).reel, 90000, 'the transport envelope reads its own account, not the budget’s');
    assert.equal(byCategory(s.transport).accountId, s.second.id);
  });

  test('an account that is not the person’s, archived or in another currency is refused', async () => {
    const s = await setup();
    const other = await t.adult({ name: 'Autre', finCurrency: 'DZD' });
    const theirs = (await t.request('POST', '/fin/comptes', { user: other, json: { label: 'À eux', type: 'AC-02', currency: 'DZD', openingBalance: 100 } })).body.account;
    const body = { label: 'X', periodStart: iso(monthStart()), periodEnd: iso(monthEnd()), currency: 'DZD' };
    assert.equal((await s.post('/budgets', { ...body, accountId: theirs.id })).status, 404, 'not theirs: not found');
    const euro = (await s.post('/comptes', { label: 'Euro', type: 'AC-02', currency: 'EUR', openingBalance: 100 })).body.account;
    assert.equal((await s.post('/budgets', { ...body, accountId: euro.id })).status, 422, 'another currency');
  });

  test('duplicating a budget keeps its account', async () => {
    const s = await setup();
    const budget = (await s.post('/budgets', { label: 'Mois', periodStart: iso(monthStart()), periodEnd: iso(monthEnd()), currency: 'DZD', accountId: s.second.id, envelopes: [{ categoryId: s.food, kind: 'variable', value: 100000, accountId: s.courant.id }] })).body.budget;
    const next = await s.post(`/budgets/${budget.id}/dupliquer`, {});
    assert.equal(next.status, 201, JSON.stringify(next.body).slice(0, 200));
    assert.equal(next.body.budget.accountId, s.second.id);
    const lines = (await s.get(`/budgets/${next.body.budget.id}`)).body.vue.enveloppes;
    assert.equal(lines[0].accountId, s.courant.id);
  });
});

describe('R13-02 — a weekly budget', () => {
  test('a weekly budget is accepted and its next period is seven days later', async () => {
    const s = await setup();
    const start = new Date(Date.UTC(2026, 5, 1));
    const end = new Date(Date.UTC(2026, 5, 7, 23, 59, 59));
    const made = await s.post('/budgets', { label: 'Semaine', periodStart: iso(start), periodEnd: iso(end), currency: 'DZD', recurrence: 'weekly', envelopes: [{ categoryId: s.food, kind: 'variable', value: 50000 }] });
    assert.equal(made.status, 201, JSON.stringify(made.body).slice(0, 200));
    const next = (await s.post(`/budgets/${made.body.budget.id}/dupliquer`, {})).body.budget;
    assert.equal(new Date(next.periodStart).getTime() - start.getTime(), 7 * DAY);
    assert.equal(new Date(next.periodEnd).getTime() - end.getTime(), 7 * DAY);
  });
});

describe('R13-03 — the balance counts as a resource', () => {
  test('the starting balance of the accounts is added to the declared incomes; switched off, it is not', async () => {
    const s = await setup();
    await s.post('/revenus', { label: 'Salaire', value: 8000000, currency: 'DZD', frequency: 'mensuel', startDate: iso(new Date(monthStart().getTime() - 60 * DAY)), accountId: s.courant.id });
    const budget = (await s.post('/budgets', { label: 'Mois', periodStart: iso(monthStart()), periodEnd: iso(monthEnd()), currency: 'DZD', envelopes: [{ categoryId: s.food, kind: 'variable', value: 1000000 }] })).body.budget;
    const view = (await s.get(`/budgets/${budget.id}`)).body.vue;
    assert.equal(view.soldeDebut.resultat, 17000000, '150 000 + 20 000 DA on the two accounts');
    assert.equal(view.ressources.resultat, 8000000, 'the declared incomes alone');
    assert.equal(view.ressourcesTotales.resultat, 25000000, 'incomes + balance');
    assert.equal(view.resteAAffecter.resultat, 25000000 - 1000000);

    const off = await t.request('PATCH', `/fin/budgets/${budget.id}`, { user: s.who, json: { countBalance: false } });
    assert.equal(off.status, 200);
    const again = (await s.get(`/budgets/${budget.id}`)).body.vue;
    assert.equal(again.ressourcesTotales.resultat, 8000000);
    assert.equal(again.resteAAffecter.resultat, 7000000);
  });

  test('a budget on one account counts only that account’s balance', async () => {
    const s = await setup();
    await s.post('/revenus', { label: 'Salaire', value: 1000000, currency: 'DZD', frequency: 'mensuel', startDate: iso(new Date(monthStart().getTime() - 60 * DAY)), accountId: s.courant.id });
    const budget = (await s.post('/budgets', { label: 'Carte', periodStart: iso(monthStart()), periodEnd: iso(monthEnd()), currency: 'DZD', accountId: s.second.id, envelopes: [{ categoryId: s.food, kind: 'variable', value: 100000 }] })).body.budget;
    assert.equal((await s.get(`/budgets/${budget.id}`)).body.vue.soldeDebut.resultat, 2000000);
  });
});

describe('R13-04 — what an envelope weighs and how much is committed', () => {
  test('its share of the budget, its share of the spending, and the committed amount with what is still to come', async () => {
    const s = await setup();
    const budget = (
      await s.post('/budgets', {
        label: 'Parts',
        periodStart: iso(monthStart()),
        periodEnd: iso(monthEnd()),
        currency: 'DZD',
        envelopes: [
          { categoryId: s.food, kind: 'variable', value: 600000 },
          { categoryId: s.transport, kind: 'variable', value: 200000 },
        ],
      })
    ).body.budget;
    await s.post('/transactions', { kind: 'expense', value: 150000, currency: 'DZD', occurredAt: spendDate(), accountId: s.courant.id, categoryId: s.food });
    await s.post('/transactions', { kind: 'expense', value: 50000, currency: 'DZD', occurredAt: spendDate(), accountId: s.courant.id, categoryId: s.transport });
    // A planned expense in the month, still to come: committed, not spent.
    await s.post('/transactions', { kind: 'expense', value: 150000, currency: 'DZD', occurredAt: iso(new Date(Date.now() + 2 * DAY)), planned: true, accountId: s.courant.id, categoryId: s.food });
    const lines = (await s.get(`/budgets/${budget.id}`)).body.vue.enveloppes;
    const foodLine = lines.find((line) => line.categoryId === s.food);
    assert.equal(foodLine.partDuBudget, 0.75, '600 of 800');
    assert.equal(foodLine.partDesDepenses, 0.75, '150 of 200 spent');
    assert.equal(foodLine.reel, 150000);
    assert.equal(foodLine.aVenir, 150000);
    assert.equal(foodLine.engage, 300000);
    assert.equal(foodLine.tauxEngage, 0.5, '300 of 600');
    const transportLine = lines.find((line) => line.categoryId === s.transport);
    assert.equal(transportLine.aVenir, 0);
    assert.equal(transportLine.tauxEngage, 0.25);
  });
});

describe('R13-05 — a recurrence recognised by its category, identical lines merged', () => {
  test('three monthly expenses of one category and one amount, with no note, are proposed as one recurrence', async () => {
    const s = await setup();
    const loyer = await t.prisma.finCategory.findFirst({ where: { key: 'fixed.loyer', userId: null }, select: { id: true, label: true } });
    for (const days of [5, 35, 65]) {
      await s.post('/transactions', { kind: 'expense', value: 1500000, currency: 'DZD', occurredAt: iso(new Date(Date.now() - days * DAY)), accountId: s.courant.id, categoryId: loyer.id });
    }
    const candidates = (await s.get('/recurrences/detection')).body.candidats;
    assert.equal(candidates.length, 1, 'recognised without a single note');
    assert.equal(candidates[0].categoryId, loyer.id);
    assert.equal(candidates[0].amount, 1500000);
    assert.equal(candidates[0].frequency, 'mensuel');
  });

  test('confirming it merges the identical past lines: they become its occurrences, none is deleted', async () => {
    const s = await setup();
    const loyer = await t.prisma.finCategory.findFirst({ where: { key: 'fixed.loyer', userId: null }, select: { id: true } });
    const ids = [];
    for (const days of [5, 35, 65]) {
      const made = await s.post('/transactions', { kind: 'expense', value: 1500000, currency: 'DZD', occurredAt: iso(new Date(Date.now() - days * DAY)), accountId: s.courant.id, categoryId: loyer.id });
      ids.push(made.body.transaction.id);
    }
    const candidate = (await s.get('/recurrences/detection')).body.candidats[0];
    const confirmed = await s.post('/recurrences/confirmer', {
      label: candidate.label,
      categoryId: loyer.id,
      kind: 'expense',
      value: candidate.amount,
      currency: 'DZD',
      frequency: 'mensuel',
      nextDate: iso(new Date(Date.now() + 25 * DAY)),
      accountId: s.courant.id,
    });
    assert.equal(confirmed.status, 201, JSON.stringify(confirmed.body).slice(0, 200));
    assert.equal(confirmed.body.recurrence.merged, 3);
    const linked = await t.prisma.finOccurrence.findMany({ where: { recurrenceId: confirmed.body.recurrence.id } });
    assert.deepEqual(linked.map((row) => row.transactionId).sort(), [...ids].sort());
    assert.ok(linked.every((row) => row.outcome === 'confirmed'));
    assert.equal(await t.prisma.finTransaction.count({ where: { id: { in: ids }, deletedAt: null } }), 3, 'the lines are linked, not removed');
    assert.equal((await s.get('/recurrences/detection')).body.candidats.length, 0, 'and it is not proposed again');
  });
});

describe('R13-06 — one operation, not two', () => {
  const setupRent = async () => {
    const s = await setup();
    const loyer = await t.prisma.finCategory.findFirst({ where: { key: 'fixed.loyer', userId: null }, select: { id: true } });
    const due = new Date(Date.now() - 2 * DAY);
    const recurrence = (
      await s.post('/recurrences', { label: 'Loyer', categoryId: loyer.id, kind: 'expense', value: 1500000, currency: 'DZD', frequency: 'mensuel', nextDate: iso(due), accountId: s.courant.id })
    ).body.recurrence;
    return { ...s, loyer: loyer.id, recurrence, due };
  };

  test('entering that payment is recognised BEFORE it is saved, and saved once as the payment', async () => {
    const s = await setupRent();
    const check = await s.post('/transactions/doublons', { kind: 'expense', value: 1500000, currency: 'DZD', occurredAt: spendDate(), categoryId: s.loyer });
    assert.equal(check.status, 200);
    assert.equal(check.body.recurrenceMatches.length, 1, 'the declared rent is offered');
    const match = check.body.recurrenceMatches[0];
    assert.equal(match.recurrenceId, s.recurrence.id);

    const made = await s.post('/transactions', {
      kind: 'expense',
      value: 1500000,
      currency: 'DZD',
      occurredAt: spendDate(),
      accountId: s.courant.id,
      categoryId: s.loyer,
      occurrence: { recurrenceId: match.recurrenceId, dueDate: match.dueDate },
    });
    assert.equal(made.status, 201, JSON.stringify(made.body).slice(0, 200));
    const occurrence = await t.prisma.finOccurrence.findFirst({ where: { recurrenceId: s.recurrence.id } });
    assert.equal(occurrence.transactionId, made.body.transaction.id, 'the payment IS the occurrence');
    assert.equal(occurrence.outcome, 'confirmed');
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: s.who.id, kind: 'expense', deletedAt: null, categoryId: s.loyer } }), 1, 'one operation');

    // The calendar no longer expects it: confirming it again is refused, never a second expense.
    const again = await t.request('POST', '/fin/calendrier/occurrences', { user: s.who, json: { recurrenceId: s.recurrence.id, dueDate: match.dueDate, action: 'confirm' } });
    assert.equal(again.status, 409);
    // And a second movement cannot claim the same payment.
    const twice = await s.post('/transactions', { kind: 'expense', value: 1500000, currency: 'DZD', occurredAt: spendDate(), accountId: s.courant.id, categoryId: s.loyer, occurrence: { recurrenceId: match.recurrenceId, dueDate: match.dueDate } });
    assert.equal(twice.status, 409);
  });

  test('another amount, another category, or a far date is not that payment', async () => {
    const s = await setupRent();
    const none = async (extra) => (await s.post('/transactions/doublons', { kind: 'expense', value: 1500000, currency: 'DZD', occurredAt: spendDate(), categoryId: s.loyer, ...extra })).body.recurrenceMatches;
    assert.deepEqual(await none({ value: 1400000 }), []);
    assert.deepEqual(await none({ categoryId: s.food }), []);
    assert.deepEqual(await none({ occurredAt: iso(new Date(Date.now() + 13 * DAY)) }), [], 'between two monthly dates, more than ten days from each');
  });

  test('a payment settled already is not offered again', async () => {
    const s = await setupRent();
    await t.request('POST', '/fin/calendrier/occurrences', { user: s.who, json: { recurrenceId: s.recurrence.id, dueDate: iso(s.due), action: 'confirm' } });
    const check = await s.post('/transactions/doublons', { kind: 'expense', value: 1500000, currency: 'DZD', occurredAt: spendDate(), categoryId: s.loyer });
    assert.deepEqual(check.body.recurrenceMatches, []);
  });
});

describe('R13-03 — the report reads the flux with the balance', () => {
  test('the month’s report gives the balance at its start and at its end, beside the net flow', async () => {
    const s = await setup();
    await s.post('/transactions', { kind: 'income', value: 8000000, currency: 'DZD', occurredAt: spendDate(), accountId: s.courant.id });
    await s.post('/transactions', { kind: 'expense', value: 3000000, currency: 'DZD', occurredAt: spendDate(), accountId: s.courant.id });
    const month = new Date().toISOString().slice(0, 7);
    const r01 = (await s.get(`/rapport?mois=${month}`)).body.rapport.sections.R01;
    assert.equal(r01.fluxNet.resultat, 5000000);
    assert.equal(r01.soldeDebut.resultat, 17000000, '150 000 + 20 000 DA before the month');
    assert.equal(r01.soldeFin.resultat, 22000000, 'the start plus the flux');
  });
});

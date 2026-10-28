import '../helpers/setup-env.js';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The client's twelve alerts (P8-18, consolidated tab 25, AL-P01 to AL-P12),
// raised by one generator with the referential's thresholds, and settable by
// family (the client's answer D7).

let t;
let user;
let generateAlerts;

const DAY = 86_400_000;
const iso = (date) => new Date(date).toISOString();
const dayStart = (offset = 0) => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + offset * DAY);
};
const as = (method, path, json) => t.request(method, path, { user, ...(json === undefined ? {} : { json }) });
const types = async () => {
  await generateAlerts(t.prisma, await t.prisma.user.findUnique({ where: { id: user.id } }), { force: true });
  return (await as('GET', '/fin/notifications')).body.notifications.map((n) => `${n.type}${n.params?.niveau ? `:${n.params.niveau}` : ''}`);
};

before(async () => {
  t = await boot();
  ({ generateAlerts } = await import('../../src/services/finAlerts.service.js'));
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ finPublic: 'SAL', finCurrency: 'DZD' });
});
after(() => t.close());

describe('P8-18 — the client’s alerts', () => {
  test('AL-P02 / AL-P03 — an account in the red', async () => {
    const account = (await as('POST', '/fin/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 100000, openingDate: iso(dayStart(-30)) })).body.account;
    await as('POST', '/fin/transactions', { kind: 'expense', value: 300000, currency: 'DZD', accountId: account.id, occurredAt: iso(dayStart(-1)) });
    assert.ok((await types()).includes('account_alert:overdrawn'));
  });

  test('AL-P01 — an expected income whose date has come asks to be confirmed; confirmed, it is not asked again', async () => {
    let due = dayStart(-2);
    while ([5, 6].includes(due.getUTCDay())) due = new Date(due.getTime() - DAY);
    const recurrence = (await as('POST', '/fin/recurrences', { label: 'Salaire', kind: 'income', value: 6000000, currency: 'DZD', frequency: 'mensuel', nextDate: iso(due) })).body.recurrence;
    assert.ok((await types()).includes('income_to_confirm'));
    await as('POST', '/fin/calendrier/occurrences', { recurrenceId: recurrence.id, dueDate: iso(due), action: 'confirm' });
    await t.prisma.finNotification.deleteMany({ where: { userId: user.id } });
    assert.ok(!(await types()).includes('income_to_confirm'));
  });

  test('AL-P04 / AL-P05 — an envelope past its 100 %, without opening the budget', async () => {
    const food = await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null } });
    const start = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0, 23, 59, 59));
    await as('POST', '/fin/budgets', { label: 'Mois', periodStart: iso(start), periodEnd: iso(end), currency: 'DZD', envelopes: [{ categoryId: food.id, kind: 'variable', value: 100000 }] });
    await as('POST', '/fin/transactions', { kind: 'expense', value: 150000, currency: 'DZD', categoryId: food.id, occurredAt: iso(Math.max(start.getTime(), Date.now() - DAY)) });
    assert.ok((await types()).includes('budget_alert:exceeded'));
  });

  test('AL-P07 — a planned payment whose date has passed, not confirmed', async () => {
    await as('POST', '/fin/transactions', { kind: 'expense', value: 50000, currency: 'DZD', planned: true, occurredAt: iso(dayStart(1)) });
    // Make it a past planned payment, as time would.
    await t.prisma.finTransaction.updateMany({ where: { userId: user.id, planned: true }, data: { occurredAt: dayStart(-1) } });
    assert.ok((await types()).includes('payment_to_confirm'));
  });

  test('AL-P10 — a debt due in two days, and one past its date; the share of income at the referential’s levels', async () => {
    await as('POST', '/fin/debts', { label: 'Téléphone', outstandingPrincipal: 2000000, monthlyInstalment: 200000, currency: 'DZD', dueDate: iso(dayStart(2)) });
    await as('POST', '/fin/debts', { label: 'Voiture', outstandingPrincipal: 9000000, monthlyInstalment: 2000000, currency: 'DZD', dueDate: iso(dayStart(-3)) });
    await as('POST', '/fin/transactions', { kind: 'income', value: 5000000, currency: 'DZD', occurredAt: iso(dayStart(-1)) });
    const raised = await types();
    assert.ok(raised.includes('debt_due:soon'), raised.join(','));
    assert.ok(raised.includes('debt_due:overdue'), raised.join(','));
    // 2 200 000 of instalments for 5 000 000 received: 44 %, above 40 %.
    assert.ok(raised.includes('debt_ratio:high'), raised.join(','));
  });

  test('AL-P08 — a goal at half of its target is a milestone', async () => {
    const current = (await as('POST', '/fin/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 5000000, openingDate: iso(dayStart(-30)) })).body.account;
    const goal = (await as('POST', '/fin/goals', { label: 'Voyage', target: 2000000, currency: 'DZD', targetDate: iso(dayStart(200)) })).body.goal;
    const paid = await as('POST', `/fin/goals/${goal.id}/contributions`, { fromAccountId: current.id, value: 1000000, occurredAt: iso(dayStart(-1)) });
    assert.equal(paid.status, 201, JSON.stringify(paid.body).slice(0, 200));
    assert.ok((await types()).includes('goal_milestone:0.5'));
  });

  test('a family turned off raises nothing of it (answer D7)', async () => {
    const references = (await as('GET', '/fin/notifications/references')).body;
    assert.deepEqual(references.families, ['budgets', 'revenus', 'echeances', 'dettes', 'objectifs', 'formation', 'securite']);
    const debtTypes = references.types.filter((type) => type.family === 'dettes').map((type) => type.key);
    await as('PUT', '/fin/notifications/parametres', Object.fromEntries(debtTypes.map((key) => [key, { enabled: false }])));
    await as('POST', '/fin/debts', { label: 'Téléphone', outstandingPrincipal: 2000000, monthlyInstalment: 200000, currency: 'DZD', dueDate: iso(dayStart(2)) });
    assert.ok(!(await types()).some((type) => type.startsWith('debt_')));
  });

  test('a declared minor is not told about debts nor about an emergency fund', async () => {
    user = await t.minor({ finPublic: 'LYC', finCurrency: 'DZD' });
    await t.prisma.finDebt.create({ data: { userId: user.id, label: 'X', outstandingPrincipal: 1000, monthlyInstalment: 100, currency: 'DZD', dueDate: dayStart(1), source: 'manual', status: 'declared' } });
    assert.ok(!(await types()).some((type) => type.startsWith('debt_') || type.startsWith('emergency')));
  });
});

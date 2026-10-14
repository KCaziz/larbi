import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Notifications and alerts (P6-18). The rules under test: isolation between
// accounts, per-type disable, opt-in-only reminders, anti-repetition, the
// client's own priority order, and that the three wired triggers (budget,
// goal, sharing) actually produce a row.

let t;
let owner;
let other;

const iso = (date) => date.toISOString();
const ago = (days) => new Date(Date.now() - days * 24 * 3600 * 1000);
const future = (days) => new Date(Date.now() + days * 24 * 3600 * 1000);

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  other = await t.user();
});
after(() => t.close());

describe('the notification centre', () => {
  test('requires a session', async () => {
    const res = await t.request('GET', '/fin/notifications');
    assert.equal(res.status, 401);
  });

  test("one account never sees another's notifications", async () => {
    await t.request('POST', '/fin/goals', { user: owner, json: { label: 'Voiture', target: 100000, currency: 'DZD', targetDate: iso(ago(1)) } });
    await t.request('GET', '/fin/goals', { user: owner });
    const res = await t.request('GET', '/fin/notifications', { user: other });
    assert.equal(res.body.notifications.length, 0);
  });

  test('sorts by the client\'s own priority (sécurité > échéance > budget > apprentissage), then recency', async () => {
    await t.request('POST', '/fin/goals', { user: owner, json: { label: 'Voiture', target: 100000, currency: 'DZD', targetDate: iso(ago(1)) } });
    await t.request('GET', '/fin/goals', { user: owner }); // goal_overdue: priority "echeance"

    const cat = await t.request('POST', '/fin/categories', { user: owner, json: { family: 'variable', label: 'Loisirs' } });
    await t.request('POST', '/fin/budgets', { user: owner, json: { label: 'Mois', periodStart: iso(ago(5)), periodEnd: iso(future(5)), currency: 'DZD' } });
    const budgets = await t.request('GET', '/fin/budgets', { user: owner });
    await t.request('POST', `/fin/budgets/${budgets.body.budgets[0].id}/enveloppes`, { user: owner, json: { categoryId: cat.body.category.id, kind: 'variable', value: 1000 } });
    await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value: 900, currency: 'DZD', occurredAt: iso(ago(1)), categoryId: cat.body.category.id } });
    await t.request('GET', `/fin/budgets/${budgets.body.budgets[0].id}`, { user: owner }); // budget_alert: priority "budget"

    const res = await t.request('GET', '/fin/notifications', { user: owner });
    const priorities = res.body.notifications.map((n) => n.priority);
    assert.deepEqual(priorities, ['echeance', 'budget'], 'échéance (goal_overdue) sorts before budget (budget_alert)');
  });
});

describe('budget_alert (P6-05)', () => {
  test('a crossed threshold creates one notification; reading again at the same level does not duplicate it', async () => {
    const cat = await t.request('POST', '/fin/categories', { user: owner, json: { family: 'variable', label: 'Loisirs' } });
    const budget = await t.request('POST', '/fin/budgets', { user: owner, json: { label: 'Mois', periodStart: iso(ago(5)), periodEnd: iso(future(5)), currency: 'DZD' } });
    await t.request('POST', `/fin/budgets/${budget.body.budget.id}/enveloppes`, { user: owner, json: { categoryId: cat.body.category.id, kind: 'variable', value: 1000 } });
    await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value: 900, currency: 'DZD', occurredAt: iso(ago(1)), categoryId: cat.body.category.id } });

    await t.request('GET', `/fin/budgets/${budget.body.budget.id}`, { user: owner });
    await t.request('GET', `/fin/budgets/${budget.body.budget.id}`, { user: owner });
    const res = await t.request('GET', '/fin/notifications', { user: owner });
    assert.equal(res.body.notifications.filter((n) => n.type === 'budget_alert').length, 1);
  });
});

describe('goal_overdue (P6-08)', () => {
  test('a goal past its target date, not reached, creates exactly one notification even after several reads', async () => {
    await t.request('POST', '/fin/goals', { user: owner, json: { label: 'Voiture', target: 100000, currency: 'DZD', targetDate: iso(ago(2)) } });
    await t.request('GET', '/fin/goals', { user: owner });
    await t.request('GET', '/fin/goals', { user: owner });
    const res = await t.request('GET', '/fin/notifications', { user: owner });
    assert.equal(res.body.notifications.filter((n) => n.type === 'goal_overdue').length, 1);
  });
});

describe('sharing_changed (P6-13)', () => {
  test('notifies the OTHER members, never the one who changed their own sharing', async () => {
    const space = await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'flatshare', label: 'Coloc', currency: 'DZD' } });
    const invite = await t.request('POST', `/fin/espaces/${space.body.space.id}/invitations`, { user: owner, json: { role: 'member' } });
    await t.request('POST', '/fin/espaces/rejoindre', { user: other, json: { token: invite.body.token } });

    await t.request('PUT', `/fin/espaces/${space.body.space.id}/mon-partage`, { user: owner, json: { incomes: 'totals' } });

    const mine = await t.request('GET', '/fin/notifications', { user: owner });
    assert.equal(mine.body.notifications.filter((n) => n.type === 'sharing_changed').length, 0, 'the actor is not notified of their own change');
    const theirs = await t.request('GET', '/fin/notifications', { user: other });
    assert.equal(theirs.body.notifications.filter((n) => n.type === 'sharing_changed').length, 1);
  });
});

describe('settings: disable by type, opt-in for reminders', () => {
  test('a disabled type produces no notification even when the signal fires', async () => {
    await t.request('PUT', '/fin/notifications/parametres', { user: owner, json: { goal_overdue: { enabled: false } } });
    await t.request('POST', '/fin/goals', { user: owner, json: { label: 'Voiture', target: 100000, currency: 'DZD', targetDate: iso(ago(2)) } });
    await t.request('GET', '/fin/goals', { user: owner });
    const res = await t.request('GET', '/fin/notifications', { user: owner });
    assert.equal(res.body.notifications.filter((n) => n.type === 'goal_overdue').length, 0);
  });

  test('reminder_upcoming never fires without explicit opt-in, and fires once opted in', async () => {
    await t.request('POST', '/fin/transactions', {
      user: owner,
      json: { kind: 'expense', value: 5000, currency: 'DZD', occurredAt: iso(future(2)), planned: true },
    });

    const before1 = await t.request('GET', '/fin/notifications', { user: owner });
    assert.equal(before1.body.notifications.filter((n) => n.type === 'reminder_upcoming').length, 0);

    await t.request('PUT', '/fin/notifications/parametres', { user: owner, json: { reminder_upcoming: { optedIn: true } } });
    const after1 = await t.request('GET', '/fin/notifications', { user: owner });
    assert.equal(after1.body.notifications.filter((n) => n.type === 'reminder_upcoming').length, 1);
  });

  test('settings for an unknown type are refused', async () => {
    const res = await t.request('PUT', '/fin/notifications/parametres', { user: owner, json: { not_a_real_type: { enabled: false } } });
    assert.equal(res.status, 400);
  });
});

describe('marking read', () => {
  test('mark one read, then mark all read', async () => {
    await t.request('POST', '/fin/goals', { user: owner, json: { label: 'Voiture', target: 100000, currency: 'DZD', targetDate: iso(ago(2)) } });
    await t.request('GET', '/fin/goals', { user: owner });
    const list = await t.request('GET', '/fin/notifications', { user: owner });
    const id = list.body.notifications[0].id;

    const marked = await t.request('PUT', `/fin/notifications/${id}/lu`, { user: owner, json: { read: true } });
    assert.equal(marked.status, 200);
    assert.equal(marked.body.notification.read, true);

    const allRead = await t.request('POST', '/fin/notifications/tout-lire', { user: owner });
    assert.equal(allRead.status, 200);
    const after1 = await t.request('GET', '/fin/notifications', { user: owner });
    assert.ok(after1.body.notifications.every((n) => n.read));
  });

  test('marking another account\'s notification read is refused with a 404', async () => {
    await t.request('POST', '/fin/goals', { user: owner, json: { label: 'Voiture', target: 100000, currency: 'DZD', targetDate: iso(ago(2)) } });
    await t.request('GET', '/fin/goals', { user: owner });
    const list = await t.request('GET', '/fin/notifications', { user: owner });
    const id = list.body.notifications[0].id;

    const res = await t.request('PUT', `/fin/notifications/${id}/lu`, { user: other, json: { read: true } });
    assert.equal(res.status, 404);
  });
});

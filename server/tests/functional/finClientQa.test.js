import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// The client's own controls (P8-21): consolidated specification, tab
// 28_QA_Backlog, QA-P01 to QA-P10 and QA-V7-01 to QA-V7-06, one test each, in
// the client's order and with the client's figures (1 000 DZD = 100 000
// centimes). « Les tests ciblent en priorité l'absence de double
// comptabilisation et l'unicité du moteur financier. »
//
// The screens part of QA-V7-01, QA-V7-03 and QA-V7-05 is checked in a real
// browser, from the menu (tests/e2e/fin-client-qa-journey.test.js).

let t;
let user;

// The application's menu, read as text: the client file imports icons the
// server does not install. Every entry is « { key: '…', to: '…', labelKey: '…' ».
const navigation = readFileSync(path.resolve(SERVER_DIR, '../client/src/config/appNavigation.js'), 'utf8');
const menuEntries = [...navigation.slice(0, navigation.indexOf('LEGACY_REDIRECTS')).matchAll(/\{[^{}]*\bto: '([^']+)'[^{}]*labelKey: '([^']+)'[^{}]*\}/g)].map((m) => ({
  to: m[1],
  labelKey: m[2],
  text: m[0],
}));

const DAY = 86_400_000;
const daysAgo = (days) => new Date(Date.now() - days * DAY).toISOString();
const monthStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};
const monthEnd = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
};
// Inside the current month, never in the future: a realised movement.
const thisMonth = () => new Date(Math.max(monthStart().getTime(), Date.now() - DAY)).toISOString();

const as = (method, path, json) => t.request(method, path, { user, ...(json === undefined ? {} : { json }) });
const categoryId = async (key) => (await t.prisma.finCategory.findFirst({ where: { key, userId: null }, select: { id: true } })).id;
const account = async (json) => {
  const res = await as('POST', '/fin/comptes', { currency: 'DZD', openingDate: daysAgo(60), ...json });
  assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));
  return res.body.account;
};
const accounts = async () => (await as('GET', '/fin/comptes')).body;
const balance = async (id) => (await accounts()).accounts.find((row) => row.id === id).solde.resultat;
const total = async () => (await accounts()).totals[0]?.soldeTotal.resultat ?? null;
const synthesis = async () => (await as('GET', '/fin/argent/synthese')).body.synthese;
const spend = (json) => as('POST', '/fin/transactions', { kind: 'expense', currency: 'DZD', occurredAt: thisMonth(), ...json });
const budget = async (categoryKey, value) => {
  const res = await as('POST', '/fin/budgets', {
    label: 'Ce mois',
    periodStart: monthStart().toISOString(),
    periodEnd: monthEnd().toISOString(),
    currency: 'DZD',
    envelopes: [{ categoryId: await categoryId(categoryKey), kind: 'variable', value }],
  });
  assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));
  return res.body.budget;
};
const envelope = async (budgetId) => (await as('GET', `/fin/budgets/${budgetId}`)).body.vue.enveloppes[0];

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ name: 'Contrôles du client', finPublic: 'SAL' });
});
after(() => t.close());

describe('the client’s controls on money (QA-P01 to QA-P10)', () => {
  test('QA-P01 — an expense on an account lowers that account, the total only if it is included, the budget once', async () => {
    const a = await account({ label: 'Compte A', type: 'AC-02', openingBalance: 1000000 });
    const excluded = await account({ label: 'Compte B', type: 'AC-02', openingBalance: 1000000, includeInTotal: false });
    const food = await budget('variable.alimentation_boissons', 1000000);
    const totalBefore = await total();

    assert.equal((await spend({ value: 100000, accountId: a.id, categoryId: await categoryId('variable.alimentation_boissons') })).status, 201);
    assert.equal(await balance(a.id), 900000);
    assert.equal(await total(), totalBefore - 100000, 'A is included: the total goes down');
    assert.equal((await envelope(food.id)).reel, 100000, 'the budget is consumed once');

    await spend({ value: 100000, accountId: excluded.id });
    assert.equal(await balance(excluded.id), 900000);
    assert.equal(await total(), totalBefore - 100000, 'B is excluded: the total does not move');
  });

  test('QA-P02 — an expense entered before its budget consumes it once the budget exists, with no new entry', async () => {
    const a = await account({ label: 'Compte A', type: 'AC-02', openingBalance: 1000000 });
    await spend({ value: 100000, accountId: a.id, categoryId: await categoryId('variable.alimentation_boissons') });
    const entries = await t.prisma.finTransaction.count({ where: { userId: user.id } });

    const food = await budget('variable.alimentation_boissons', 1000000);
    assert.equal((await envelope(food.id)).reel, 100000);
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: user.id } }), entries, 'no new movement written');
    assert.equal(await balance(a.id), 900000, 'the account is debited once');
  });

  test('QA-P03 — a transfer between two included accounts: A −5 000, B +5 000, total, income and expenses unchanged', async () => {
    const a = await account({ label: 'A', type: 'AC-02', openingBalance: 1000000 });
    const b = await account({ label: 'B', type: 'AC-04' });
    const totalBefore = await total();
    assert.equal((await as('POST', '/fin/transferts', { fromAccountId: a.id, toAccountId: b.id, value: 500000, occurredAt: thisMonth() })).status, 201);
    assert.equal(await balance(a.id), 500000);
    assert.equal(await balance(b.id), 500000);
    assert.equal(await total(), totalBefore);
    const s = await synthesis();
    assert.equal(s.revenus.resultat, null);
    assert.equal(s.depenses.resultat, null);
  });

  test('QA-P04 — a transfer from an included to an excluded account lowers the total by 5 000, the net flow does not move', async () => {
    const a = await account({ label: 'A', type: 'AC-02', openingBalance: 1000000 });
    const excluded = await account({ label: 'Hors total', type: 'AC-04', includeInTotal: false });
    await spend({ value: 100000, accountId: a.id });
    const flowBefore = (await synthesis()).fluxNet.resultat;
    const totalBefore = await total();
    await as('POST', '/fin/transferts', { fromAccountId: a.id, toAccountId: excluded.id, value: 500000, occurredAt: thisMonth() });
    assert.equal(await total(), totalBefore - 500000);
    assert.equal((await synthesis()).fluxNet.resultat, flowBefore);
  });

  test('QA-P05 — a recurring salary: a reminder, no credit before confirmation, one credit after', async () => {
    const current = await account({ label: 'Courant', type: 'AC-02' });
    let due = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
    // The weekend rule would move a Friday or a Saturday (PB-F021).
    while ([5, 6].includes(due.getUTCDay())) due = new Date(due.getTime() - DAY);
    const created = await as('POST', '/fin/recurrences', {
      label: 'Salaire',
      kind: 'income',
      value: 6000000,
      currency: 'DZD',
      frequency: 'mensuel',
      nextDate: due.toISOString(),
      accountId: current.id,
      reminderDays: [0, -1, 1, 2],
    });
    assert.equal(created.status, 201, JSON.stringify(created.body).slice(0, 200));
    await as('PUT', '/fin/notifications/parametres', { reminder_upcoming: { enabled: true, optedIn: true } });

    const listed = await as('GET', '/fin/notifications');
    const notifications = listed.body.notifications;
    assert.ok(notifications.some((n) => n.type === 'reminder_upcoming' && n.params?.kind === 'recurrence'), 'the person is reminded');
    assert.equal(await balance(current.id), 0, 'nothing is credited before confirmation');

    const confirm = () => as('POST', '/fin/calendrier/occurrences', { recurrenceId: created.body.recurrence.id, dueDate: due.toISOString(), action: 'confirm' });
    assert.equal((await confirm()).status, 201);
    assert.equal((await confirm()).status, 409);
    assert.equal(await balance(current.id), 6000000, 'credited once');
  });

  test('QA-P06 — deleting a realised expense is logical: account and budget recomputed, trail kept', async () => {
    const a = await account({ label: 'A', type: 'AC-02', openingBalance: 1000000 });
    const food = await budget('variable.alimentation_boissons', 1000000);
    const spent = (await spend({ value: 100000, accountId: a.id, categoryId: await categoryId('variable.alimentation_boissons') })).body.transaction;
    assert.equal((await t.request('DELETE', `/fin/transactions/${spent.id}`, { user, json: { reason: 'saisie en double' } })).status, 200);

    assert.equal(await balance(a.id), 1000000);
    assert.equal((await envelope(food.id)).reel, 0);
    assert.ok((await t.prisma.finTransaction.findUnique({ where: { id: spent.id } })).deletedAt, 'the row stays, marked deleted');
    const trail = await t.prisma.finChange.findMany({ where: { entityId: spent.id }, orderBy: { createdAt: 'asc' } });
    assert.deepEqual(trail.map((row) => row.action), ['create', 'delete'], 'the journal keeps the creation and the deletion');
  });

  test('QA-P07 — a budget of 10 000 with 12 000 spent: −2 000 left, the overspend shown, the account on real movements', async () => {
    const a = await account({ label: 'A', type: 'AC-02', openingBalance: 5000000 });
    const food = await budget('variable.alimentation_boissons', 1000000);
    await spend({ value: 1200000, accountId: a.id, categoryId: await categoryId('variable.alimentation_boissons') });
    const line = await envelope(food.id);
    assert.equal(line.ecart.resultat, -200000);
    assert.equal(line.alerte.niveau, 'exceeded');
    assert.equal(await balance(a.id), 5000000 - 1200000, 'the account follows the movements, not the budget');
  });

  test('QA-P08 — a purchase of 5 000 by credit card: the card’s debt +5 000, the current account untouched until repayment', async () => {
    const current = await account({ label: 'Courant', type: 'AC-02', openingBalance: 1000000 });
    const card = await account({ label: 'Carte', type: 'AC-07' });
    await spend({ value: 500000, accountId: card.id });
    assert.equal(await balance(card.id), 500000, 'what is owed on the card');
    assert.equal(await balance(current.id), 1000000);
    const row = (await accounts()).accounts.find((r) => r.id === card.id);
    assert.equal(row.liability, true, 'shown apart, as a liability');

    // The repayment is a transfer: the card's debt goes down, the account too.
    await as('POST', '/fin/transferts', { fromAccountId: current.id, toAccountId: card.id, value: 500000, occurredAt: thisMonth() });
    assert.equal(await balance(current.id), 500000);
    assert.equal(await balance(card.id), 0);
  });

  test('QA-P09 — 10 000 moved to the emergency fund: cash unchanged, the fund +10 000, no spending', async () => {
    const current = await account({ label: 'Courant', type: 'AC-02', openingBalance: 5000000 });
    const created = await as('POST', '/fin/goals', { label: 'Fonds d’urgence', templateKey: 'emergency', target: 18000000, currency: 'DZD', targetDate: '2027-12-01T00:00:00.000Z' });
    assert.equal(created.status, 201, JSON.stringify(created.body).slice(0, 200));
    const goal = created.body.goal;
    const totalBefore = await total();
    const res = await as('POST', `/fin/goals/${goal.id}/contributions`, { fromAccountId: current.id, value: 1000000, occurredAt: thisMonth() });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));

    assert.equal(await total(), totalBefore, 'the fund’s account is in the total');
    assert.equal((await as('GET', `/fin/goals/${goal.id}`)).body.goal.allocated, 1000000);
    assert.equal((await synthesis()).depenses.resultat, null, 'setting money aside is not consumption');
  });

  test('QA-P10 — an expense that takes an account to −2 000: in the red, alerted, and the total shows it', async () => {
    const a = await account({ label: 'A', type: 'AC-02', openingBalance: 100000, minBalanceAlert: 0 });
    await spend({ value: 300000, accountId: a.id });
    const row = (await accounts()).accounts.find((r) => r.id === a.id);
    assert.equal(row.solde.resultat, -200000);
    assert.ok(row.alertes.includes('overdrawn'), row.alertes.join(','));
    assert.ok(row.alertes.includes('belowMinimum'));
    assert.equal(await total(), -200000, 'the included account’s negative balance is in the total');
  });
});

describe('the client’s controls on the single engine (QA-V7-01 to QA-V7-06)', () => {
  test('QA-V7-01 — a lycéen and a salarié get the same financial figures from the same engine', async () => {
    // The menu is checked in the browser; here, the engine: the same entries
    // give the same answers whatever the profile.
    const answers = [];
    for (const finPublic of ['LYC', 'SAL']) {
      user = await t.adult({ name: `Profil ${finPublic}`, finPublic });
      const a = await account({ label: 'A', type: 'AC-02', openingBalance: 1000000 });
      await spend({ value: 100000, accountId: a.id, categoryId: await categoryId('variable.alimentation_boissons') });
      const s = await synthesis();
      answers.push({ total: await total(), depenses: s.depenses.resultat, formule: s.depenses.formule_id });
    }
    assert.deepEqual(answers[0], answers[1]);
  });

  test('QA-V7-02 — 50/30/20: the shares are computed, the mapping is visible, no movement is modified', async () => {
    const a = await account({ label: 'A', type: 'AC-02', openingBalance: 5000000 });
    const created = await budget('variable.alimentation_boissons', 1000000);
    await spend({ value: 300000, accountId: a.id, categoryId: await categoryId('variable.alimentation_boissons') });
    await spend({ value: 200000, accountId: a.id, categoryId: await categoryId('fixed.loyer') });
    const before = await t.prisma.finTransaction.findMany({ where: { userId: user.id }, orderBy: { id: 'asc' } });

    const method = await as('GET', `/fin/budgets/${created.id}/methode?methode=M-01`);
    assert.equal(method.status, 200);
    assert.deepEqual(
      method.body.poches.map((poche) => [poche.cle, poche.part.formule_id]),
      [
        ['needs', 'AN-F005'],
        ['wants', 'AN-F006'],
        ['savings', 'AN-F007'],
      ],
    );
    assert.ok(method.body.rattachement.length > 0, 'the mapping is visible');
    assert.deepEqual(await t.prisma.finTransaction.findMany({ where: { userId: user.id }, orderBy: { id: 'asc' } }), before, 'a method only reads');
  });

  test('QA-V7-03 — the monthly report gives the clearing rate and how many movements are still to clear', async () => {
    const a = await account({ label: 'A', type: 'AC-02', openingBalance: 1000000 });
    const first = (await spend({ value: 100000, accountId: a.id })).body.transaction;
    await spend({ value: 100000, accountId: a.id });
    await as('PUT', `/fin/transactions/${first.id}/pointage`, { clearing: 'checked' });
    const month = new Date().toISOString().slice(0, 7);
    const r11 = (await as('GET', `/fin/rapport?mois=${month}`)).body.rapport.sections.R11;
    assert.equal(r11.tauxPointage.formule_id, 'AN-F004');
    assert.equal(r11.tauxPointage.resultat, 0.5);
    assert.equal(r11.nonPointees, 1, 'the quality warning the screen shows');
  });

  test('QA-V7-04 — +1 M DZD in the fictional portfolio: total, real patrimony and real health unchanged', async () => {
    await account({ label: 'A', type: 'AC-02', openingBalance: 1000000 });
    const read = async () => ({
      total: await total(),
      patrimoine: (await as('GET', '/fin/patrimoine')).body.patrimoine.patrimoineNet.resultat,
      sante: (await as('GET', '/fin/aujourdhui')).body.aujourdhui.santeFinanciere?.answer?.resultat ?? null,
    });
    const before = await read();
    await as('GET', '/fin/portefeuille');
    const res = await as('PATCH', '/fin/portefeuille', { capital: 10000000 + 100000000 });
    assert.equal(res.status, 200);
    const portfolio = (await as('GET', '/fin/portefeuille')).body.portefeuille;
    assert.equal(portfolio.badge, 'SIMULATION');
    assert.equal(portfolio.cash, 110000000, '1 M DZD more, fictional');
    assert.deepEqual(await read(), before);
  });

  test('QA-V7-05 — the phone layout (checked in the browser)', () => {
    // Below 768 px: bottom bar, « Plus » sheet, no horizontal scroll —
    // tests/e2e/app-shell.test.js. Nothing of it can be checked without a page.
    assert.equal(menuEntries.filter((entry) => /mobile: true/.test(entry.text)).length, 4, 'four entries in the bottom bar, plus « Plus »');
  });

  test('QA-V7-06 — nothing collective in the personal navigation or in the personal figures', async () => {
    const collective = /espace|coloc|couple|famil|partag/i;
    assert.ok(menuEntries.length >= 20, `${menuEntries.length} menu entries read`);
    const offending = menuEntries.filter((entry) => collective.test(entry.to) || collective.test(entry.labelKey)).map((entry) => entry.to);
    assert.deepEqual(offending, [], 'no collective entry in the menu of the budget management');

    // A shared space and its expense never reach the personal figures.
    const a = await account({ label: 'A', type: 'AC-02', openingBalance: 1000000 });
    const space = await as('POST', '/fin/espaces', { kind: 'flatshare', label: 'Coloc', currency: 'DZD' });
    assert.equal(space.status, 201, JSON.stringify(space.body).slice(0, 200));
    const totalBefore = await total();
    const before = await synthesis();
    const members = (await as('GET', `/fin/espaces/${space.body.space.id}/membres`)).body.membres;
    const expense = await as('POST', `/fin/espaces/${space.body.space.id}/depenses`, {
      label: 'Courses',
      value: 300000,
      occurredAt: thisMonth(),
      splitMode: 'equal',
      payerId: members[0].id,
      participants: members.map((m) => ({ memberId: m.id })),
    });
    assert.equal(expense.status, 201, JSON.stringify(expense.body).slice(0, 200));
    assert.equal(await total(), totalBefore);
    assert.equal((await synthesis()).depenses.resultat, before.depenses.resultat);
    assert.equal(await balance(a.id), 1000000);
  });
});

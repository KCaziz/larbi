import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Budgets and envelopes (P6-05) through the real API and database: the period
// rules, the envelopes, the figures of screen C06, the proposed distribution of
// JA03 / JA04, the alerts and the correction trail.

let t;
let user;
let rent;
let food;
let salary;

const DAY = 24 * 3600 * 1000;
// The current month, which is what the screen looks at by default. Computed
// from now, never hard-coded: a suite with fixed 2026 dates starts failing the
// month it is left behind.
const monthStart = (shift = 0) => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + shift, 1));
const monthEnd = (shift = 0) => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + shift + 1, 0));
const iso = (date) => date.toISOString();
const ago = (days) => new Date(Date.now() - days * DAY).toISOString();

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.user();
  const byKey = async (key) => (await t.prisma.finCategory.findFirst({ where: { key, userId: null }, select: { id: true } })).id;
  rent = await byKey('fixed.loyer');
  food = await byKey('variable.alimentation_boissons');
  salary = await byKey('income.salaire_net');
});
after(() => t.close());

const createBudget = (json = {}) =>
  t.request('POST', '/fin/budgets', {
    user,
    json: {
      label: 'Budget du mois',
      periodStart: iso(monthStart()),
      periodEnd: iso(monthEnd()),
      currency: 'DZD',
      ...json,
    },
  });

const addMovement = (json) =>
  t.request('POST', '/fin/transactions', {
    user,
    json: { kind: 'expense', value: 100000, currency: 'DZD', occurredAt: ago(1), ...json },
  });

describe('P6-05 — budgets: the period', () => {
  test('a budget is created with its first envelopes in one call', async () => {
    const res = await createBudget({
      envelopes: [
        { categoryId: rent, kind: 'fixed', value: 3000000 },
        { categoryId: food, kind: 'variable', value: 2000000, cap: 2500000 },
      ],
    });
    assert.equal(res.status, 201);
    const view = await t.request('GET', `/fin/budgets/${res.body.budget.id}`, { user });
    assert.equal(view.status, 200);
    assert.equal(view.body.vue.enveloppes.length, 2);
    // The envelopes take the currency of their budget: they are added together.
    assert.ok(view.body.vue.enveloppes.every((line) => line.prevu > 0));
    assert.equal(view.body.vue.totalPrevu.resultat, 5000000);
  });

  test('an overlapping period is refused, an adjacent one is accepted', async () => {
    const first = await createBudget();
    assert.equal(first.status, 201);

    const overlap = await createBudget({ label: 'Encore ce mois', periodStart: iso(new Date(monthStart().getTime() + 5 * DAY)) });
    assert.equal(overlap.status, 422);
    assert.equal(overlap.body.error.details.reason, 'overlappingPeriod');
    assert.equal(overlap.body.error.details.budgetId, first.body.budget.id);

    const next = await createBudget({ label: 'Mois suivant', periodStart: iso(monthStart(1)), periodEnd: iso(monthEnd(1)) });
    assert.equal(next.status, 201);
  });

  test('an archived budget no longer blocks its period, and restoring it checks again', async () => {
    const first = await createBudget();
    const archive = await t.request('PUT', `/fin/budgets/${first.body.budget.id}/archive`, { user, json: { archived: true } });
    assert.equal(archive.status, 200);

    const again = await createBudget({ label: 'Nouvelle version' });
    assert.equal(again.status, 201, 'a withdrawn period must not forbid planning that month again');

    const restore = await t.request('PUT', `/fin/budgets/${first.body.budget.id}/archive`, { user, json: { archived: false } });
    assert.equal(restore.status, 422, 'restoring must not be a way round the overlap rule');
    assert.equal(restore.body.error.details.reason, 'overlappingPeriod');
  });

  test('a period that ends before it starts is refused', async () => {
    const res = await createBudget({ periodStart: iso(monthEnd()), periodEnd: iso(monthStart()) });
    assert.equal(res.status, 400);
  });

  test('the next period is announced, and duplicating carries only the recurring envelopes', async () => {
    const created = await createBudget({
      recurrence: 'monthly',
      envelopes: [
        { categoryId: rent, kind: 'fixed', value: 3000000, recurring: true },
        { categoryId: food, kind: 'variable', value: 2000000, recurring: false },
      ],
    });
    const list = await t.request('GET', '/fin/budgets', { user });
    assert.equal(list.body.budgets[0].enveloppes, 2);
    assert.ok(list.body.budgets[0].prochainePeriode, 'the interface must be able to say which period it offers');

    const copy = await t.request('POST', `/fin/budgets/${created.body.budget.id}/dupliquer`, { user, json: {} });
    assert.equal(copy.status, 201);
    const view = await t.request('GET', `/fin/budgets/${copy.body.budget.id}`, { user });
    assert.equal(view.body.vue.enveloppes.length, 1, 'a one-off envelope must not silently reappear');
    assert.equal(view.body.vue.enveloppes[0].categoryId, rent);
  });

  test('a one-off budget has no next period and says so', async () => {
    const created = await createBudget({ recurrence: 'none' });
    const copy = await t.request('POST', `/fin/budgets/${created.body.budget.id}/dupliquer`, { user, json: {} });
    assert.equal(copy.status, 422);
    assert.equal(copy.body.error.details.reason, 'noRecurrence');
  });
});

describe('P6-05 — envelopes', () => {
  let budget;
  beforeEach(async () => {
    budget = (await createBudget()).body.budget;
  });

  test('two envelopes on the same category are refused', async () => {
    const first = await t.request('POST', `/fin/budgets/${budget.id}/enveloppes`, { user, json: { categoryId: food, kind: 'variable', value: 1000000 } });
    assert.equal(first.status, 201);
    const second = await t.request('POST', `/fin/budgets/${budget.id}/enveloppes`, { user, json: { categoryId: food, kind: 'variable', value: 500000 } });
    assert.equal(second.status, 422);
    assert.equal(second.body.error.details.reason, 'duplicateEnvelope');
  });

  test('an income category can never be budgeted', async () => {
    const res = await t.request('POST', `/fin/budgets/${budget.id}/enveloppes`, { user, json: { categoryId: salary, kind: 'fixed', value: 1000000 } });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'notBudgetable');
  });

  test('a cap below the planned amount is refused', async () => {
    const res = await t.request('POST', `/fin/budgets/${budget.id}/enveloppes`, {
      user,
      json: { categoryId: food, kind: 'variable', value: 2000000, cap: 1000000 },
    });
    assert.equal(res.status, 400);
  });

  test('an archived category cannot be chosen anew', async () => {
    const own = await t.request('POST', '/fin/categories', { user, json: { family: 'variable', label: 'Sorties du jeudi' } });
    await t.request('PUT', `/fin/categories/${own.body.category.id}/archive`, { user, json: { archived: true } });
    const res = await t.request('POST', `/fin/budgets/${budget.id}/enveloppes`, {
      user,
      json: { categoryId: own.body.category.id, kind: 'variable', value: 100000 },
    });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'archivedCategory');
  });

  test('an envelope is corrected and the journal keeps what it was', async () => {
    const created = await t.request('POST', `/fin/budgets/${budget.id}/enveloppes`, { user, json: { categoryId: food, kind: 'variable', value: 2000000 } });
    const patched = await t.request('PATCH', `/fin/budgets/${budget.id}/enveloppes/${created.body.envelope.id}`, {
      user,
      json: { value: 2500000, reason: 'les prix ont monté' },
    });
    assert.equal(patched.status, 200);
    assert.equal(patched.body.envelope.value, 2500000);
    assert.equal(patched.body.envelope.version, 2);

    const history = await t.request('GET', `/fin/budgets/${budget.id}/enveloppes/${created.body.envelope.id}/historique`, { user });
    const change = history.body.changes.find((row) => row.field === 'value');
    assert.ok(change, 'a corrected amount is journalled');
    assert.equal(change.before, 2000000);
    assert.equal(change.after, 2500000);
    assert.equal(change.reason, 'les prix ont monté');
  });

  test('deleting a budget deletes its envelopes, logically and traceably', async () => {
    const created = await t.request('POST', `/fin/budgets/${budget.id}/enveloppes`, { user, json: { categoryId: food, kind: 'variable', value: 2000000 } });
    const removed = await t.request('DELETE', `/fin/budgets/${budget.id}`, { user, json: {} });
    assert.equal(removed.status, 200);

    const row = await t.prisma.finEnvelope.findUnique({ where: { id: created.body.envelope.id }, select: { deletedAt: true } });
    assert.ok(row.deletedAt, 'nothing is erased: the row is logically deleted');
    const changes = await t.prisma.finChange.findMany({ where: { entityId: created.body.envelope.id, action: 'delete' } });
    assert.equal(changes.length, 1, 'the deletion is in the journal');
  });
});

describe('P6-05 — the figures of screen C06', () => {
  let budget;
  beforeEach(async () => {
    budget = (
      await createBudget({
        envelopes: [
          { categoryId: rent, kind: 'fixed', value: 3000000 },
          { categoryId: food, kind: 'variable', value: 2000000, cap: 2200000 },
        ],
      })
    ).body.budget;
  });

  const view = async () => (await t.request('GET', `/fin/budgets/${budget.id}`, { user })).body.vue;

  test('every figure carries its formula, its version and its inputs', async () => {
    const vue = await view();
    for (const key of ['totalPrevu', 'totalReel', 'ressources', 'resteAAffecter', 'ecart', 'budgetJournalier', 'fluxNet']) {
      assert.ok(vue[key].formule_id, `${key} says which formula produced it`);
      assert.ok(vue[key].formule_version >= 1, `${key} says which version`);
      assert.ok(vue[key].calcule_le, `${key} says when`);
      assert.ok(vue[key].entrees_snapshot, `${key} says from what`);
      assert.equal(vue[key].unite, 'DZD');
    }
    assert.equal(vue.enveloppes[0].tauxConsommation.unite, 'ratio', 'a rate is a decimal, shown as a percentage');
  });

  test('an empty budget is not a budget of zero', async () => {
    const empty = (await createBudget({ label: 'Rien encore', periodStart: iso(monthStart(1)), periodEnd: iso(monthEnd(1)) })).body.budget;
    const res = await t.request('GET', `/fin/budgets/${empty.id}`, { user });
    assert.equal(res.body.vue.totalPrevu.resultat, null, 'nothing planned is not zero planned');
    assert.ok(res.body.vue.totalPrevu.avertissements, 'the formula says why it is not computable');
  });

  test('only real, realised expenses are consumed', async () => {
    await addMovement({ value: 1000000, categoryId: food });
    // Planned: declared, not realised — F009 reads « dépenses réelles ».
    await addMovement({ value: 500000, categoryId: food, planned: true, occurredAt: new Date(Date.now() + 2 * DAY).toISOString() });
    // Fictional: never added to a real total (the phase rule).
    await addMovement({ value: 700000, categoryId: food, status: 'fictional' });
    // An income is not a consumed expense.
    await addMovement({ value: 400000, categoryId: null, kind: 'income' });

    const vue = await view();
    const line = vue.enveloppes.find((row) => row.categoryId === food);
    assert.equal(line.reel, 1000000);
    assert.equal(line.ecart.resultat, 1000000);
    assert.equal(line.tauxConsommation.resultat, 0.5);
  });

  test('the alerts fire at the declared thresholds, and an overspend is shown, not refused', async () => {
    await addMovement({ value: 1700000, categoryId: food });
    let vue = await view();
    assert.equal(vue.enveloppes.find((row) => row.categoryId === food).alerte.niveau, 'warning', '85 % crosses the 80 % threshold');

    await addMovement({ value: 600000, categoryId: food });
    vue = await view();
    const line = vue.enveloppes.find((row) => row.categoryId === food);
    assert.equal(line.alerte.niveau, 'exceeded');
    assert.equal(line.ecart.resultat, -300000, 'an overspend is a negative remainder, not an error');
    assert.equal(line.plafondDepasse, true, 'the optional ceiling is reported too');
    assert.deepEqual(vue.alertes.map((alert) => alert.niveau), ['exceeded']);
  });

  test('a budget above the resources is allowed and signalled', async () => {
    await t.request('POST', '/fin/revenus', {
      user,
      json: { label: 'Salaire', value: 4000000, currency: 'DZD', frequency: 'mensuel', startDate: ago(60), categoryId: salary },
    });
    const vue = await view();
    assert.equal(vue.ressources.resultat, 4000000);
    assert.equal(vue.resteAAffecter.resultat, -1000000, 'what is left to allocate goes negative rather than being hidden');
    assert.equal(vue.depassementRessources, true);
    assert.ok(vue.avertissements.some((text) => text.includes('autorisé')), 'allowed, only signalled');
  });

  test('a period that is not a whole number of months computes no remainder to allocate', async () => {
    const odd = (
      await createBudget({
        label: 'Quinze jours',
        periodStart: iso(monthStart(2)),
        periodEnd: iso(new Date(monthStart(2).getTime() + 14 * DAY)),
      })
    ).body.budget;
    await t.request('POST', '/fin/revenus', {
      user,
      json: { label: 'Salaire', value: 4000000, currency: 'DZD', frequency: 'mensuel', startDate: ago(60), categoryId: salary },
    });
    const res = await t.request('GET', `/fin/budgets/${odd.id}`, { user });
    assert.equal(res.body.vue.periode.mois, null);
    assert.equal(res.body.vue.ressources.resultat, null, 'stretching a monthly income over 15 days would be an invented figure');
    assert.ok(res.body.vue.avertissements.some((text) => text.includes('nombre entier de mois')));
  });

  test('spending no envelope covers is shown apart', async () => {
    const other = await t.request('POST', '/fin/categories', { user, json: { family: 'variable', label: 'Sorties du jeudi' } });
    await addMovement({ value: 300000, categoryId: other.body.category.id });
    const vue = await view();
    assert.equal(vue.horsEnveloppe.resultat, 300000);
  });

  test('a movement in another currency is not converted and is reported', async () => {
    await addMovement({ value: 100000, currency: 'EUR', categoryId: food });
    const vue = await view();
    assert.equal(vue.enveloppes.find((row) => row.categoryId === food).reel, 0);
    assert.ok(vue.avertissements.some((text) => text.includes('autre devise')));
  });
});

describe('P6-05 — the proposed distribution', () => {
  test('history proposes a monthly average per category, and writes nothing', async () => {
    // Three months of groceries, one month of rent.
    for (const days of [10, 40, 70]) await addMovement({ value: 900000, categoryId: food, occurredAt: ago(days) });
    await addMovement({ value: 3000000, categoryId: rent, occurredAt: ago(20) });

    const res = await t.request('GET', '/fin/budgets/proposition?months=3', { user });
    assert.equal(res.status, 200);
    const groceries = res.body.proposition.find((line) => line.categoryId === food);
    assert.equal(groceries.propose, 900000, '2 700 000 over three months');
    assert.equal(groceries.moisObserves, 3);
    assert.equal(groceries.kind, 'variable');
    assert.equal(groceries.observe.formule_id, 'F003', 'the observed total goes through the engine');
    assert.equal(res.body.proposition.find((line) => line.categoryId === rent).kind, 'fixed');

    assert.equal(await t.prisma.finBudget.count(), 0, 'proposed, never imposed: nothing is written');
    assert.equal(await t.prisma.finEnvelope.count(), 0);
  });

  test("the onboarding's declared expenses become proposals — the table they were waiting for", async () => {
    await t.prisma.user.update({ where: { id: user.id }, data: { finPublic: 'SAL', finAgeRange: '25-34' } });
    const start = await t.request('PUT', '/fin/onboarding', {
      user,
      json: { answers: { fixedCharges: { amount: 2400000, frequency: 'mensuel' } } },
    });
    assert.equal(start.status, 200);

    const res = await t.request('GET', '/fin/budgets/proposition', { user });
    const declared = res.body.declare;
    assert.ok(declared.length >= 1, 'a declared essential expense proposes an envelope');
    assert.equal(declared[0].source, 'onboarding');
    assert.equal(declared[0].propose, 2400000);
    assert.equal(declared[0].observe.formule_id, 'F001', 'normalised to the month through the engine');
  });

  test('what was really spent wins over what was estimated at sign-up', async () => {
    await t.prisma.user.update({ where: { id: user.id }, data: { finPublic: 'SAL', finAgeRange: '25-34' } });
    await t.request('PUT', '/fin/onboarding', { user, json: { answers: { fixedCharges: { amount: 2400000, frequency: 'mensuel' } } } });
    const charges = await t.prisma.finCategory.findFirst({ where: { key: 'fixed.autre_charge_fixe', userId: null }, select: { id: true } });
    await addMovement({ value: 3000000, categoryId: charges.id, occurredAt: ago(10) });

    const res = await t.request('GET', '/fin/budgets/proposition?months=1', { user });
    const line = res.body.proposition.find((row) => row.categoryId === charges.id);
    assert.equal(line.source, 'history');
    assert.equal(line.propose, 3000000, 'a measurement beats a guess');
  });
});

describe('P8-09 — one allocation, attached to the most specific envelope', () => {
  const daysAgo = (days) => new Date(Date.now() - days * 86_400_000).toISOString();
  const monthStart = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
  const monthEnd = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 0));
  const category = async (key) => (await t.prisma.finCategory.findFirst({ where: { key, userId: null }, select: { id: true } })).id;

  test('an expense goes to its sub-category’s envelope, else to its group’s, never both', async () => {
    const owner = await t.adult({ name: 'Budget P8-09' });
    const courses = await category('variable.alimentation_boissons');
    const restaurant = await category('variable.restaurant');
    const created = await t.request('POST', '/fin/budgets', {
      user: owner,
      json: {
        label: 'Mois',
        periodStart: monthStart().toISOString(),
        periodEnd: monthEnd().toISOString(),
        currency: 'DZD',
        envelopes: [
          { categoryId: courses, kind: 'variable', value: 2000000 },
          { categoryGroup: 'Alimentation', kind: 'variable', value: 1000000 },
        ],
      },
    });
    assert.equal(created.status, 201, JSON.stringify(created.body).slice(0, 200));
    const occurredAt = new Date(Math.min(Date.now(), monthStart().getTime() + 86_400_000)).toISOString();
    await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value: 300000, currency: 'DZD', occurredAt, categoryId: courses } });
    await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value: 80000, currency: 'DZD', occurredAt, categoryId: restaurant } });
    const view = (await t.request('GET', `/fin/budgets/${created.body.budget.id}`, { user: owner })).body.vue;
    const line = (match) => view.enveloppes.find(match);
    assert.equal(line((l) => l.categoryId === courses).reel, 300000);
    assert.equal(line((l) => l.categoryGroup === 'Alimentation').reel, 80000, 'the restaurant falls back on the group');
    assert.equal(line((l) => l.categoryGroup === 'Alimentation').label, 'Alimentation');
    assert.equal(view.moyenneJournaliere.formule_id, 'PB-F011');

    const method = await t.request('GET', `/fin/budgets/${created.body.budget.id}/methode?methode=M-01`, { user: owner });
    assert.equal(method.status, 200);
    assert.equal(method.body.poches[0].part.formule_id, 'AN-F005');
    assert.ok(method.body.rattachement.some((row) => row.groupe === 'Logement' && row.parDefaut === 'needs'), 'the mapping is visible');
  });

  test('an envelope needs a category or a group, not both, and the group must be the client’s', async () => {
    const owner = await t.adult({ name: 'Budget P8-09 bis' });
    const budget = (await t.request('POST', '/fin/budgets', { user: owner, json: { label: 'Mois', periodStart: monthStart().toISOString(), periodEnd: monthEnd().toISOString(), currency: 'DZD' } })).body.budget;
    const add = (json) => t.request('POST', `/fin/budgets/${budget.id}/enveloppes`, { user: owner, json: { kind: 'variable', value: 1000, ...json } });
    assert.equal((await add({})).status, 422);
    assert.equal((await add({ categoryGroup: 'Inventé' })).status, 422);
    assert.equal((await add({ categoryGroup: 'Logement' })).status, 201);
  });
});

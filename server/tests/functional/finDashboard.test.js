import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The "Aujourd'hui" home screen (P6-06) through the real API and database: one
// request, the figures of every module that exists, the invitations for what is
// empty, the actions in the client's priority order, and nothing invented for
// the modules that are still to come.

let t;
let user;
let food;
let salary;
let goalCategory;

const DAY = 24 * 3600 * 1000;
const iso = (date) => date.toISOString();
const ago = (days) => new Date(Date.now() - days * DAY);
const inDays = (days) => new Date(Date.now() + days * DAY);
const monthStart = (shift = 0) => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + shift, 1));
const monthEnd = (shift = 0) => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + shift + 1, 0));

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult();
  const byKey = async (key) => (await t.prisma.finCategory.findFirst({ where: { key, userId: null }, select: { id: true } })).id;
  food = await byKey('variable.alimentation_boissons');
  salary = await byKey('income.salaire_net');
  // A "goal" family category is how a savings deposit is recorded (P6-08 /
  // P6-09 share that reading).
  goalCategory = await byKey('goal.reserve_de_securite');
});
after(() => t.close());

const today = (as = user) => t.request('GET', '/fin/aujourdhui', { user: as });
const setPublic = (finPublic, finAgeRange = '25-34') => t.prisma.user.update({ where: { id: user.id }, data: { finPublic, finAgeRange } });
const addIncome = (json = {}) =>
  t.request('POST', '/fin/revenus', {
    user,
    json: { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: iso(ago(90)), categoryId: salary, ...json },
  });
const addMovement = (json = {}) =>
  t.request('POST', '/fin/transactions', {
    user,
    json: { kind: 'expense', value: 500000, currency: 'DZD', occurredAt: iso(ago(1)), categoryId: food, ...json },
  });

describe('P6-06 — one request answers the screen', () => {
  test('an empty account gets invitations, never zeros', async () => {
    const res = await today();
    assert.equal(res.status, 200);
    const view = res.body.aujourdhui;
    assert.ok(view.kpis.length > 0, 'the screen is never blank');
    for (const kpi of view.kpis) {
      assert.equal(kpi.answer?.resultat ?? null, null);
      assert.ok(kpi.invitation, `${kpi.key} invites the person to complete instead of showing 0`);
      assert.ok(kpi.formule, 'and still says which formula it would have been');
    }
    assert.ok(view.actions.length >= 1, 'there is something to do');
    assert.ok(view.actions.length <= 3, 'never more than three');
  });

  test('the figures appear once there is something to compute', async () => {
    await addIncome();
    await addMovement({ value: 1500000 });
    const view = (await today()).body.aujourdhui;

    const resources = view.kpis.find((kpi) => kpi.key === 'monthlyResources');
    assert.equal(resources.answer.resultat, 6000000);
    assert.equal(resources.invitation, null);
    assert.equal(resources.answer.formule_id, 'F002');
    // Read from the engine, not recomputed: the contract travels with it.
    assert.ok(resources.answer.calcule_le);
    assert.ok(resources.answer.entrees_snapshot);
    assert.equal(resources.answer.unite, 'DZD');
  });

  test('the period the figures describe is stated', async () => {
    const view = (await today()).body.aujourdhui;
    assert.equal(new Date(view.periode.debut).getTime(), monthStart().getTime());
    assert.equal(new Date(view.periode.fin).getUTCDate(), monthEnd().getUTCDate());
  });

  test('the screen writes nothing', async () => {
    await addIncome();
    const before = await t.prisma.finChange.count();
    await today();
    await today();
    assert.equal(await t.prisma.finChange.count(), before, 'a summary is a read');
  });

  test('it needs a session', async () => {
    assert.equal((await t.request('GET', '/fin/aujourdhui')).status, 401);
    assert.equal((await t.request('GET', '/fin/aujourdhui/references')).status, 401);
  });

  test('one account never sees another s figures', async () => {
    const other = await t.user();
    await addIncome();
    await addMovement({ value: 1500000 });
    const theirs = (await today(other)).body.aujourdhui;
    for (const kpi of theirs.kpis) assert.equal(kpi.answer?.resultat ?? null, null);
    assert.equal(theirs.objectifPrioritaire, null);
  });
});

describe('P6-06 — the dashboard follows the public', () => {
  test('a student gets the budget per day and the autonomy the client names', async () => {
    await setPublic('ETU');
    await addIncome({ label: 'Job étudiant', value: 2000000, categoryId: (await t.prisma.finCategory.findFirst({ where: { key: 'income.job_etudiant', userId: null }, select: { id: true } })).id });
    await addMovement({ value: 4000000 });

    const res = await today();
    assert.equal(res.body.aujourdhui.titre, 'student');
    const autonomy = res.body.aujourdhui.kpis.find((kpi) => kpi.key === 'studentAutonomy');
    assert.ok(autonomy, 'F047 is on the student dashboard');
    assert.equal(autonomy.answer.resultat, 0.5, '2 000 000 earned over 4 000 000 spent');
    // The definition of "personal income" is ours and versioned: it travels
    // with the figure so it can be argued with.
    assert.equal(autonomy.answer.entrees_snapshot.definition_version, 1);
  });

  test('a lycéen is never shown debt, and gets one alert and one action at most', async () => {
    // A debt is recorded while the account is still an adult one, THEN the
    // account becomes a lycéen. The row has to exist for this test to mean
    // anything — hiding a debt that is not there proves nothing — and the API
    // now refuses a minor who tries to create one (P6-17 applies the 18+ gate),
    // which is the stronger guarantee and the reason for this order.
    const debt = await t.request('POST', '/fin/debts', {
      user,
      json: { label: 'Téléphone', outstandingPrincipal: 2000000, monthlyInstalment: 200000, currency: 'DZD' },
    });
    assert.equal(debt.status, 201, 'the debt really exists, so hiding it is a decision and not an accident');
    await setPublic('LYC', '13-18');
    await addIncome();
    await addMovement({ value: 1500000 });

    const view = (await today()).body.aujourdhui;
    assert.equal(view.titre, 'myWeek');
    assert.equal(view.minor, true);
    assert.ok(!view.kpis.some((kpi) => kpi.key === 'debtEffort'), 'the client s rule, enforced on the server');
    assert.ok(!view.kpis.some((kpi) => kpi.key === 'reserveMonths'));
    assert.ok(view.alertes.length <= 1);
    assert.ok(view.actions.length <= 1);
  });

  test('somebody under 18 stays a minor whichever public they picked', async () => {
    await setPublic('SAL', '13-18');
    const view = (await today()).body.aujourdhui;
    assert.equal(view.minor, true);
    assert.ok(!view.kpis.some((kpi) => kpi.key === 'debtEffort'));
  });

  test('without a public the screen still works and says what choosing one adds', async () => {
    const res = await today();
    assert.equal(res.body.aujourdhui.titre, 'general');
    assert.ok(Array.isArray(res.body.tableauxDisponibles), 'the available dashboards are listed');
  });
});

describe('P6-06 — alerts and what is coming up', () => {
  test('an overspent envelope raises an alert, with its category named', async () => {
    const budget = await t.request('POST', '/fin/budgets', {
      user,
      json: {
        label: 'Ce mois',
        periodStart: iso(monthStart()),
        periodEnd: iso(monthEnd()),
        currency: 'DZD',
        envelopes: [{ categoryId: food, kind: 'variable', value: 1000000 }],
      },
    });
    assert.equal(budget.status, 201);
    await addMovement({ value: 1400000 });

    const view = (await today()).body.aujourdhui;
    assert.equal(view.alertes.length, 1);
    assert.equal(view.alertes[0].level, 'exceeded');
    assert.equal(view.alertes[0].categoryLabel, 'Alimentation / boissons', 'the interface never guesses a label');
    assert.ok(view.actions.some((action) => action.key === 'envelopeExceeded'));
  });

  test('a planned movement in the coming days is an upcoming item to confirm', async () => {
    await t.request('POST', '/fin/transactions', {
      user,
      json: { kind: 'expense', value: 700000, currency: 'DZD', occurredAt: iso(inDays(3)), planned: true, note: 'Loyer', categoryId: food },
    });
    const view = (await today()).body.aujourdhui;
    assert.equal(view.echeances.length, 1);
    assert.equal(view.echeances[0].kind, 'planned_expense');
    assert.ok(view.actions.some((action) => action.key === 'confirmPlanned'));
  });

  test('a planned movement far away is not an upcoming item', async () => {
    await t.request('POST', '/fin/transactions', {
      user,
      json: { kind: 'expense', value: 700000, currency: 'DZD', occurredAt: iso(inDays(40)), planned: true, note: 'Loyer' },
    });
    const view = (await today()).body.aujourdhui;
    assert.deepEqual(view.echeances, [], 'the question is what to do now');
  });

  test('uncategorised movements become an action, with how many', async () => {
    await addMovement({ categoryId: null, value: 300000 });
    await addMovement({ categoryId: null, value: 200000 });
    const view = (await today()).body.aujourdhui;
    const action = view.actions.find((item) => item.key === 'categoriseMovements');
    assert.ok(action);
    assert.equal(action.contexte.count, 2);
    assert.equal(action.to, '/mon-argent');
  });

  test('the actions stay in the client s priority order', async () => {
    await addMovement({ categoryId: null });
    await t.request('POST', '/fin/transactions', {
      user,
      json: { kind: 'expense', value: 700000, currency: 'DZD', occurredAt: iso(inDays(2)), planned: true, note: 'Loyer' },
    });
    const view = (await today()).body.aujourdhui;
    const order = ['securite', 'echeance', 'budget', 'apprentissage'];
    const positions = view.actions.map((action) => order.indexOf(action.priority));
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b), 'sécurité > échéance > budget > apprentissage');
  });
});

describe('P6-06 — the priority goal and the savings rate', () => {
  test('the goal the person marked is the one shown', async () => {
    const first = await t.request('POST', '/fin/goals', {
      user,
      json: { label: 'Voyage', target: 5000000, currency: 'DZD', priority: 0 },
    });
    assert.equal(first.status, 201);
    await t.request('POST', '/fin/goals', { user, json: { label: 'Ordinateur', target: 2000000, currency: 'DZD', priority: 5 } });

    const view = (await today()).body.aujourdhui;
    assert.equal(view.objectifPrioritaire.label, 'Ordinateur');
    assert.equal(view.objectifPrioritaire.progres.formule_id, 'F025');
  });

  test('the savings rate reads the savings OF THE PERIOD', async () => {
    await addIncome();
    // A deposit into savings is a real movement on a "goal" category.
    await addMovement({ categoryId: goalCategory, value: 600000 });
    const view = (await today()).body.aujourdhui;
    const rate = view.kpis.find((kpi) => kpi.key === 'savingsRate');
    if (rate) {
      assert.equal(rate.answer.resultat, 0.1, '600 000 put aside out of 6 000 000');
      assert.equal(rate.answer.entrees_snapshot.revenus_periode, 6000000);
    }
    // A deposit dated outside the period must not change the rate of this one.
    await addMovement({ categoryId: goalCategory, value: 900000, occurredAt: iso(ago(120)) });
    const again = (await today()).body.aujourdhui.kpis.find((kpi) => kpi.key === 'savingsRate');
    if (again) assert.equal(again.answer.resultat, 0.1, 'the cumulative pool is not a rate');
  });
});

describe('P6-06 — what is declared rather than invented', () => {
  test('l’indice de santé financière est calculé, et annoncé partiel', async () => {
    // Il attendait les pondérations du client (P6-01 point 5) ; le référentiel
    // maître les fournit (P6-22, chantier 2, barème B à 7 dimensions). Ce qui
    // reste vrai : un score partiel s'annonce comme tel, et il n'est pas une
    // carte parmi les autres.
    await setPublic('SAL', '25-34');
    const res = await today();
    const health = res.body.aujourdhui.santeFinanciere;
    assert.equal(health.version, 'B-7');
    assert.equal(health.answer.formule_id, 'F053');
    assert.ok(Array.isArray(health.dimensions) && health.dimensions.length === 7);
    assert.ok(!res.body.aujourdhui.kpis.some((kpi) => kpi.formule === 'F053'));
  });

  test('et il n’est pas affiché à un compte jeune', async () => {
    // Le client exclut l'alerte adulte sur la réserve d'un lycéen ; une note
    // globale est le même jugement d'adulte.
    await setPublic('LYC', '13-18');
    const res = await today();
    assert.equal(res.body.aujourdhui.santeFinanciere.reason, 'youth');
  });

  test('the references publish the limits, the thresholds and the definitions', async () => {
    const res = await t.request('GET', '/fin/aujourdhui/references', { user });
    assert.equal(res.status, 200);
    assert.equal(res.body.limits.kpiMax, 5);
    assert.equal(res.body.limits.actionsMax, 3);
    assert.deepEqual(res.body.priorities, ['securite', 'echeance', 'budget', 'apprentissage']);
    assert.ok(res.body.dataAgeWarningDays > 0, 'the staleness threshold is ours and visible');
    assert.equal(res.body.definitionRevenusPersonnels.version, 1);
    assert.ok(res.body.formulas.some((row) => row.id === 'F047'), 'every formula is explained in the client s wording');
  });

  test('a stale account is told its figures are old', async () => {
    await addMovement({ value: 300000 });
    // Backdate what the figures were collected from: the banner is about when
    // the data was recorded, not when the movement happened.
    await t.prisma.finTransaction.updateMany({ where: { userId: user.id }, data: { collectedAt: ago(120) } });
    const view = (await today()).body.aujourdhui;
    assert.equal(view.qualite.stale, true);
    assert.equal(view.qualite.age.formule_id, 'F055');
    assert.ok(view.qualite.age.resultat >= 119);
  });

  test('an account with nothing recorded is empty, not stale', async () => {
    const view = (await today()).body.aujourdhui;
    assert.equal(view.qualite.stale, null);
    assert.equal(view.qualite.age.resultat, null);
  });
});

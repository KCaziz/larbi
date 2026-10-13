import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Calendar, recurrences and provisions (P6-07) through the real API and
// database: the calendar of a period, « Marquer payé », the plan of the month,
// ALG-04's detection proposed then confirmed, the cost of the subscriptions and
// the provisions.

let t;
let user;
let rent;
let food;

const DAY = 24 * 3600 * 1000;
// Relative to now, never fixed: a suite with hard-coded 2026 dates starts
// failing the month it is left behind.
const now = () => new Date();
const inDays = (days) => new Date(Date.now() + days * DAY);
const ago = (days) => new Date(Date.now() - days * DAY);
const iso = (date) => date.toISOString();
const monthStart = (shift = 0) => new Date(Date.UTC(now().getUTCFullYear(), now().getUTCMonth() + shift, 1));

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.user();
  const byKey = async (key) => (await t.prisma.finCategory.findFirst({ where: { key, userId: null }, select: { id: true } })).id;
  rent = await byKey('fixed.loyer');
  food = await byKey('variable.alimentation_boissons');
});
after(() => t.close());

const addRecurrence = (json = {}) =>
  t.request('POST', '/fin/recurrences', {
    user,
    json: { label: 'Abonnement', kind: 'expense', value: 120000, currency: 'DZD', frequency: 'mensuel', nextDate: iso(inDays(3)), categoryId: food, ...json },
  });

const addProvision = (json = {}) =>
  t.request('POST', '/fin/provisions', {
    user,
    json: { label: 'Scolarité', value: 3000000, currency: 'DZD', targetDate: iso(inDays(90)), categoryId: rent, ...json },
  });

const addMovement = (json = {}) =>
  t.request('POST', '/fin/transactions', {
    user,
    json: { kind: 'expense', value: 500000, currency: 'DZD', occurredAt: iso(ago(1)), categoryId: food, ...json },
  });

describe('P6-07 — recurrences', () => {
  test('a recurrence is created, corrected and journalled', async () => {
    const created = await addRecurrence();
    assert.equal(created.status, 201);
    assert.equal(created.body.recurrence.detected, false, 'a typed recurrence is not a detected one');

    const patched = await t.request('PATCH', `/fin/recurrences/${created.body.recurrence.id}`, {
      user,
      json: { value: 150000, reason: 'le tarif a changé' },
    });
    assert.equal(patched.status, 200);
    assert.equal(patched.body.recurrence.version, 2);

    const history = await t.request('GET', `/fin/recurrences/${created.body.recurrence.id}/historique`, { user });
    const change = history.body.changes.find((row) => row.field === 'value');
    assert.equal(change.before, 120000);
    assert.equal(change.after, 150000);
    assert.equal(change.reason, 'le tarif a changé');
  });

  test('a frequency the engine cannot normalise is refused', async () => {
    const res = await addRecurrence({ frequency: 'quand-ça-vient' });
    assert.equal(res.status, 400, 'the closed list is validation, not a guess');
  });

  test('an end date before the next date is refused', async () => {
    const res = await addRecurrence({ nextDate: iso(inDays(30)), endDate: iso(inDays(10)) });
    assert.equal(res.status, 400);
  });

  test('a caller cannot claim its recurrence was detected', async () => {
    // `detected` is the trace of where the row came from. A client that could
    // set it would make that trace worthless.
    const res = await addRecurrence({ detected: true });
    assert.equal(res.status, 400, 'the field is not part of the accepted body');
  });

  test('deleting a recurrence is logical, and cancels nothing', async () => {
    const created = await addRecurrence();
    const removed = await t.request('DELETE', `/fin/recurrences/${created.body.recurrence.id}`, { user, json: {} });
    assert.equal(removed.status, 200);
    const row = await t.prisma.finRecurrence.findUnique({ where: { id: created.body.recurrence.id }, select: { deletedAt: true } });
    assert.ok(row.deletedAt, 'nothing is erased');
    const changes = await t.prisma.finChange.findMany({ where: { entityId: created.body.recurrence.id, action: 'delete' } });
    assert.equal(changes.length, 1);
  });

  test('the subscriptions cost per month and per year', async () => {
    await addRecurrence({ value: 120000, frequency: 'mensuel' });
    await addRecurrence({ label: 'Assurance', value: 1200000, frequency: 'annuel' });
    // A salary is a recurrence too, and must not be counted as a subscription.
    await addRecurrence({ label: 'Salaire', kind: 'income', value: 6000000, categoryId: null });

    const res = await t.request('GET', '/fin/recurrences/abonnements', { user });
    assert.equal(res.status, 200);
    assert.equal(res.body.abonnements.coutMensuel.resultat, 220000);
    assert.equal(res.body.abonnements.coutAnnuel.resultat, 2640000);
    assert.equal(res.body.abonnements.lignes.length, 2);
    assert.equal(res.body.abonnements.lignes[0].mensuel.formule_id, 'F049');
  });
});

describe('P6-07 — detection (ALG-04), proposed then confirmed', () => {
  // Three monthly movements with the same note and the same amount: the
  // pattern ALG-04 looks for.
  const seedPattern = async (note = 'Netflix') => {
    for (const days of [5, 35, 65]) await addMovement({ value: 120000, note, occurredAt: iso(ago(days)) });
  };

  test('a pattern is proposed, never created', async () => {
    await seedPattern();
    const res = await t.request('GET', '/fin/recurrences/detection', { user });
    assert.equal(res.status, 200);
    assert.equal(res.body.candidats.length, 1);
    const candidate = res.body.candidats[0];
    assert.equal(candidate.confirmed, false, 'the client requires a confirmation');
    assert.equal(candidate.amount, 120000);
    assert.equal(candidate.occurrences, 3);
    assert.equal(candidate.frequency, 'mensuel', 'the interval suggests a frequency');
    assert.equal(candidate.kind, 'expense');
    assert.equal(candidate.categoryId, food, 'the category of the movements behind it is offered');
    assert.ok(candidate.parametres.amountTolerance >= 0, 'the parameters used are visible: no black box');

    assert.equal(await t.prisma.finRecurrence.count(), 0, 'detection writes nothing');
  });

  test('two movements are not a pattern', async () => {
    for (const days of [5, 35]) await addMovement({ value: 120000, note: 'Netflix', occurredAt: iso(ago(days)) });
    const res = await t.request('GET', '/fin/recurrences/detection', { user });
    assert.deepEqual(res.body.candidats, [], "ALG-04's own minimum is three occurrences");
  });

  test('irregular amounts are not a pattern', async () => {
    for (const [days, value] of [[5, 120000], [35, 400000], [65, 90000]]) {
      await addMovement({ value, note: 'Courses', occurredAt: iso(ago(days)) });
    }
    const res = await t.request('GET', '/fin/recurrences/detection', { user });
    assert.deepEqual(res.body.candidats, []);
  });

  test('the parameters can be widened, and the answer says which were used', async () => {
    for (const [days, value] of [[5, 120000], [35, 150000], [65, 100000]]) {
      await addMovement({ value, note: 'Variable', occurredAt: iso(ago(days)) });
    }
    const strict = await t.request('GET', '/fin/recurrences/detection', { user });
    assert.deepEqual(strict.body.candidats, []);
    const loose = await t.request('GET', '/fin/recurrences/detection?amountTolerance=0.6', { user });
    assert.equal(loose.body.candidats.length, 1);
    assert.equal(loose.body.candidats[0].parametres.amountTolerance, 0.6);
  });

  test('confirming a candidate is what creates the recurrence, and it says so', async () => {
    await seedPattern();
    const detected = await t.request('GET', '/fin/recurrences/detection', { user });
    const candidate = detected.body.candidats[0];

    const confirmed = await t.request('POST', '/fin/recurrences/confirmer', {
      user,
      json: {
        label: candidate.label,
        kind: candidate.kind,
        value: candidate.amount,
        currency: 'DZD',
        frequency: candidate.frequency,
        nextDate: candidate.nextExpected,
        categoryId: candidate.categoryId,
      },
    });
    assert.equal(confirmed.status, 201);
    assert.equal(confirmed.body.recurrence.detected, true);
    assert.equal(confirmed.body.recurrence.sourceRef, 'detection:ALG-04', 'the trace of where it came from');

    // Already tracked: not proposed again every time the page is opened.
    const again = await t.request('GET', '/fin/recurrences/detection', { user });
    assert.deepEqual(again.body.candidats, []);
  });
});

describe('P6-07 — the calendar', () => {
  test('the month is the default period, and the three sources appear on their day', async () => {
    await addRecurrence({ nextDate: iso(inDays(2)) });
    await addMovement({ planned: true, occurredAt: iso(inDays(5)), note: 'Loyer', categoryId: rent });
    await addProvision({ targetDate: iso(inDays(6)) });

    const res = await t.request('GET', '/fin/calendrier', { user });
    assert.equal(res.status, 200);
    const kinds = res.body.calendrier.jours.flatMap((day) => day.evenements.map((event) => event.kind));
    assert.ok(kinds.includes('recurrence'));
    assert.ok(kinds.includes('planned_expense'));
    assert.ok(kinds.includes('provision'));
    // The labels are joined server-side: the interface never guesses what a
    // category is called.
    const planned = res.body.calendrier.jours.flatMap((day) => day.evenements).find((event) => event.kind === 'planned_expense');
    assert.equal(planned.categoryLabel, 'Loyer');
  });

  test('without a declared balance the projection says so instead of starting at zero', async () => {
    await addMovement({ planned: true, occurredAt: iso(inDays(3)) });
    const res = await t.request('GET', '/fin/calendrier', { user });
    assert.equal(res.body.calendrier.cashFinProjete, null);
    assert.equal(res.body.calendrier.premierJourTension, null);
    assert.ok(res.body.calendrier.avertissements.some((text) => text.includes('solde de départ')));
  });

  test('a declared balance gives the projected cash and the days of tension', async () => {
    await addMovement({ value: 500000, planned: true, occurredAt: iso(inDays(2)) });
    const res = await t.request('GET', '/fin/calendrier?solde=300000', { user });
    assert.equal(res.body.calendrier.cashFinProjete, -200000);
    assert.ok(res.body.calendrier.premierJourTension, 'the day the money runs out is named');
  });

  test('a negative declared balance is accepted: somebody may be in the red', async () => {
    const res = await t.request('GET', '/fin/calendrier?solde=-50000', { user });
    assert.equal(res.status, 200);
    assert.equal(res.body.calendrier.cashFinProjete, -50000);
  });

  test('a period longer than the limit is refused rather than projected day by day', async () => {
    const res = await t.request('GET', `/fin/calendrier?from=${iso(monthStart())}&to=${iso(inDays(500))}`, { user });
    assert.equal(res.status, 400);
  });

  test('the week view is a week', async () => {
    const res = await t.request('GET', '/fin/calendrier?vue=week', { user });
    assert.equal(res.body.calendrier.periode.jours, 7);
  });
});

describe('P6-07 — « Marquer payé »', () => {
  test('the same row becomes real: there is never a second one to count', async () => {
    const planned = await addMovement({ value: 500000, planned: true, occurredAt: iso(inDays(3)) });
    assert.equal(planned.body.transaction.planned, true);
    assert.equal(planned.body.transaction.status, 'declared');

    const paid = await t.request('POST', `/fin/transactions/${planned.body.transaction.id}/payer`, { user, json: {} });
    assert.equal(paid.status, 200);
    assert.equal(paid.body.transaction.planned, false);
    assert.equal(paid.body.transaction.status, 'real');
    assert.equal(await t.prisma.finTransaction.count({ where: { deletedAt: null } }), 1, 'no duplicate row was created');

    // The history says it was planned before it was real.
    const history = await t.request('GET', `/fin/transactions/${planned.body.transaction.id}/historique`, { user });
    const change = history.body.changes.find((row) => row.field === 'planned');
    assert.equal(change.before, true);
    assert.equal(change.after, false);
  });

  test('the amount actually paid may differ from the amount planned', async () => {
    const planned = await addMovement({ value: 500000, planned: true, occurredAt: iso(inDays(3)) });
    const paid = await t.request('POST', `/fin/transactions/${planned.body.transaction.id}/payer`, { user, json: { value: 540000 } });
    assert.equal(paid.body.transaction.value, 540000, 'what was really paid is what counts');
  });

  test('a movement that was never planned cannot be marked paid', async () => {
    const real = await addMovement();
    const res = await t.request('POST', `/fin/transactions/${real.body.transaction.id}/payer`, { user, json: {} });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'notPlanned');
  });

  test('a payment cannot be confirmed in the future', async () => {
    const planned = await addMovement({ planned: true, occurredAt: iso(inDays(10)) });
    const res = await t.request('POST', `/fin/transactions/${planned.body.transaction.id}/payer`, { user, json: { occurredAt: iso(inDays(5)) } });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'futureDate');
  });

  test('a planned movement is excluded from what was really spent, and counted once it is paid', async () => {
    const planned = await addMovement({ value: 500000, planned: true, occurredAt: iso(inDays(2)) });
    const before = await t.request('GET', '/fin/argent/synthese', { user });
    assert.equal(before.body.synthese.depenses.resultat, null, 'a plan is not a fact');

    await t.request('POST', `/fin/transactions/${planned.body.transaction.id}/payer`, { user, json: {} });
    const after = await t.request('GET', '/fin/argent/synthese', { user });
    assert.equal(after.body.synthese.depenses.resultat, 500000, 'counted exactly once, after confirmation');
  });
});

describe('P6-07 — the plan of the month (SA03)', () => {
  test('only the planned movements are copied, shifted by one month', async () => {
    // One planned and one realised movement last month.
    const lastMonth = new Date(Date.UTC(monthStart(-1).getUTCFullYear(), monthStart(-1).getUTCMonth(), 10, 12));
    await addMovement({ value: 700000, planned: true, occurredAt: iso(lastMonth), note: 'Loyer', categoryId: rent });
    await addMovement({ value: 300000, occurredAt: iso(lastMonth), note: 'Courses' });

    const res = await t.request('POST', '/fin/calendrier/plan', { user, json: { month: iso(monthStart()) } });
    assert.equal(res.status, 201);
    assert.equal(res.body.created.length, 1, 'a realised movement is a fact about the past: copying it would invent a payment');
    assert.equal(res.body.created[0].value, 700000);
    assert.equal(res.body.created[0].planned, true);
    assert.equal(res.body.created[0].status, 'declared', 'copying a plan creates no fact');
    assert.equal(new Date(res.body.created[0].occurredAt).getUTCMonth(), monthStart().getUTCMonth());
  });

  test('running it twice does not double the plan', async () => {
    const lastMonth = new Date(Date.UTC(monthStart(-1).getUTCFullYear(), monthStart(-1).getUTCMonth(), 10, 12));
    await addMovement({ value: 700000, planned: true, occurredAt: iso(lastMonth), note: 'Loyer', categoryId: rent });

    await t.request('POST', '/fin/calendrier/plan', { user, json: { month: iso(monthStart()) } });
    const again = await t.request('POST', '/fin/calendrier/plan', { user, json: { month: iso(monthStart()) } });
    assert.equal(again.body.created.length, 0);
    assert.equal(again.body.skipped, 1, 'what is already planned is left alone and reported');
  });
});

describe('P6-07 — provisions', () => {
  test('a provision is computed, and creates no realised expense', async () => {
    const created = await addProvision({ provisioned: 1000000 });
    assert.equal(created.status, 201);
    assert.equal(created.body.provision.status, 'declared');

    const list = await t.request('GET', '/fin/provisions', { user });
    assert.equal(list.body.provisions[0].provisionMensuelle.formule_id, 'F045');
    assert.equal(list.body.provisions[0].reste, 2000000);
    assert.equal(list.body.provisions[0].etat, 'active');

    // The client's rule: a provision is not a movement, so nothing was spent.
    const synthesis = await t.request('GET', '/fin/argent/synthese', { user });
    assert.equal(synthesis.body.synthese.depenses.resultat, null);
  });

  test('more set aside than the expense itself is refused', async () => {
    const res = await addProvision({ value: 1000000, provisioned: 2000000 });
    assert.equal(res.status, 400);
  });

  test('a provision whose amount is covered is reached', async () => {
    const created = await addProvision({ value: 1000000, provisioned: 1000000 });
    const list = await t.request('GET', '/fin/provisions', { user });
    const view = list.body.provisions.find((row) => row.id === created.body.provision.id);
    assert.equal(view.etat, 'reached');
    assert.equal(view.reste, 0);
  });
});

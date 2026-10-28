import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCalendar,
  buildProvisionView,
  collectEvents,
  dayKey,
  eachDay,
  occurrencesOf,
  recurringCost,
} from '../../src/services/finCalendarView.service.js';
import { frequencyForInterval } from '../../src/services/finCalendar.service.js';

// The pure side of P6-07: occurrences of a recurrence, the day-by-day
// calendar, the projected cash, the days of tension, the cost of the
// subscriptions and the monthly provision. No database, no clock — `now` is
// always an argument.

const D = (text) => new Date(`${text}T00:00:00.000Z`);

const recurrence = (extra = {}) => ({
  id: 'r1',
  label: 'Abonnement',
  kind: 'expense',
  value: 120000,
  currency: 'DZD',
  frequency: 'mensuel',
  nextDate: D('2026-10-05'),
  endDate: null,
  categoryId: 'c1',
  ...extra,
});

describe('P6-07 — occurrences of a recurrence', () => {
  test('a monthly recurrence falls on the same day of each month', () => {
    const dates = occurrencesOf(recurrence(), D('2026-10-01'), D('2026-12-31'));
    assert.deepEqual(dates.map(dayKey), ['2026-10-05', '2026-11-05', '2026-12-05']);
  });

  test('the day is clamped to the month, and does not drift', () => {
    // Date arithmetic overflows on its own: 31 January plus one month gives
    // 3 March. Each occurrence is computed from the base date, so the day comes
    // back to 31 wherever the month allows it instead of drifting earlier.
    const dates = occurrencesOf(recurrence({ nextDate: D('2026-01-31') }), D('2026-01-01'), D('2026-04-30'));
    assert.deepEqual(dates.map(dayKey), ['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30']);
  });

  test('a weekly recurrence advances in days, not in months', () => {
    const dates = occurrencesOf(recurrence({ frequency: 'hebdomadaire', nextDate: D('2026-10-01') }), D('2026-10-01'), D('2026-10-22'));
    assert.deepEqual(dates.map(dayKey), ['2026-10-01', '2026-10-08', '2026-10-15', '2026-10-22']);
  });

  test('nothing is produced after the end date', () => {
    const dates = occurrencesOf(recurrence({ endDate: D('2026-11-30') }), D('2026-10-01'), D('2026-12-31'));
    assert.deepEqual(dates.map(dayKey), ['2026-10-05', '2026-11-05'], 'a subscription that ends in November is not in December');
  });

  test('a frequency the engine does not know produces nothing rather than a guess', () => {
    assert.deepEqual(occurrencesOf(recurrence({ frequency: 'quand-ça-vient' }), D('2026-10-01'), D('2026-12-31')), []);
  });

  test('a recurrence whose next date is long past still terminates', () => {
    const dates = occurrencesOf(recurrence({ nextDate: D('2000-01-15') }), D('2026-10-01'), D('2026-10-31'));
    assert.deepEqual(dates.map(dayKey), ['2026-10-15'], 'the occurrences before the window are skipped, not returned');
  });
});

describe('P6-07 — collecting the events of a period', () => {
  const planned = [{ id: 't1', kind: 'expense', value: 500000, currency: 'DZD', occurredAt: D('2026-10-20'), categoryId: 'c2', note: 'Loyer' }];
  const provisions = [{ id: 'p1', label: 'Scolarité', value: 3000000, provisioned: 1000000, currency: 'DZD', targetDate: D('2026-10-25'), categoryId: 'c3' }];

  test('the three sources come back in date order, each saying what it is', () => {
    const events = collectEvents({ planned, recurrences: [recurrence()], provisions, from: D('2026-10-01'), to: D('2026-10-31'), currency: 'DZD' });
    assert.deepEqual(
      events.map((event) => [event.kind, dayKey(event.date)]),
      [
        ['recurrence', '2026-10-05'],
        ['planned_expense', '2026-10-20'],
        ['provision', '2026-10-25'],
      ],
    );
  });

  test('a planned movement and a recurrence to confirm are confirmable (P8-11)', () => {
    const events = collectEvents({ planned, recurrences: [recurrence()], provisions, from: D('2026-10-01'), to: D('2026-10-31'), currency: 'DZD' });
    assert.equal(events.find((event) => event.kind === 'planned_expense').confirmable, true, '« Marquer payé » applies to a plan the person wrote');
    assert.equal(events.find((event) => event.kind === 'recurrence').confirmable, true, '« Confirmer, Pas reçu, Reporter » the day it falls (P8-11)');
    const auto = collectEvents({ planned: [], recurrences: [recurrence({ creationMode: 'auto_real' })], provisions: [], from: D('2026-10-01'), to: D('2026-10-31'), currency: 'DZD' });
    assert.equal(auto[0].confirmable, false, 'one recorded on its own is not asked about');
  });

  test('a row in another currency is left out rather than converted', () => {
    const events = collectEvents({
      planned: [{ ...planned[0], currency: 'EUR' }],
      recurrences: [recurrence({ currency: 'EUR' })],
      provisions: [{ ...provisions[0], currency: 'EUR' }],
      from: D('2026-10-01'),
      to: D('2026-10-31'),
      currency: 'DZD',
    });
    assert.deepEqual(events, []);
  });

  test('a provision whose due date is outside the period does not appear', () => {
    const events = collectEvents({ planned: [], recurrences: [], provisions, from: D('2026-11-01'), to: D('2026-11-30'), currency: 'DZD' });
    assert.deepEqual(events, []);
  });

  test('a period counts both of its ends', () => {
    assert.equal(eachDay(D('2026-10-01'), D('2026-10-31')).length, 31);
  });
});

describe('P6-07 — the calendar of a period', () => {
  const events = (extra = {}) =>
    collectEvents({
      planned: [{ id: 't1', kind: 'expense', value: 500000, currency: 'DZD', occurredAt: D('2026-10-20'), categoryId: 'c2', note: 'Loyer' }],
      recurrences: [recurrence()],
      provisions: [{ id: 'p1', label: 'Scolarité', value: 3000000, provisioned: 1000000, currency: 'DZD', targetDate: D('2026-10-25'), categoryId: 'c3' }],
      from: D('2026-10-01'),
      to: D('2026-10-31'),
      currency: 'DZD',
      ...extra,
    });

  const calendar = (extra = {}) =>
    buildCalendar({ events: events(), from: D('2026-10-01'), to: D('2026-10-31'), currency: 'DZD', now: D('2026-10-16'), ...extra });

  test('a provision is not a payment of the period', () => {
    const cal = calendar({ openingBalance: 1000000 });
    // 120 000 of subscription + 500 000 of rent. The 3 000 000 provision is
    // money being set aside for a dated expense, and the client says a
    // provision creates no realised expense.
    assert.equal(cal.totalPrevuSorties.resultat, 620000);
    assert.equal(cal.totalPrevuSorties.entrees_snapshot.provisions, 1, 'it is counted as a provision, and says so');
  });

  test('without a declared opening balance the projection is not computed', () => {
    const cal = calendar();
    assert.equal(cal.cashFinProjete, null);
    assert.equal(cal.premierJourTension, null);
    assert.deepEqual(cal.joursTension, []);
    assert.ok(cal.avertissements.some((text) => text.includes('solde total')), 'the screen says no account is counted, instead of starting from an imaginary zero (P8-11)');
    for (const day of cal.jours) assert.equal(day.tension, null);
  });

  test('the projected cash is cumulative, and the first day of tension is named', () => {
    const cal = calendar({ openingBalance: 600000 });
    const byDay = new Map(cal.jours.map((day) => [day.jour, day]));
    assert.equal(byDay.get('2026-10-04').cashProjete, 600000, 'nothing has happened yet');
    assert.equal(byDay.get('2026-10-05').cashProjete, 480000, 'the subscription has gone out');
    assert.equal(byDay.get('2026-10-20').cashProjete, -20000);
    assert.equal(cal.cashFinProjete, -20000);
    assert.equal(cal.premierJourTension, '2026-10-20');
    assert.equal(cal.joursTension.length, 12, 'the 20th to the 31st');
  });

  test('an incoming recurrence is added, not subtracted', () => {
    const cal = buildCalendar({
      events: collectEvents({
        recurrences: [recurrence({ id: 'r2', label: 'Salaire', kind: 'income', value: 6000000, nextDate: D('2026-10-02') })],
        from: D('2026-10-01'),
        to: D('2026-10-31'),
        currency: 'DZD',
      }),
      from: D('2026-10-01'),
      to: D('2026-10-31'),
      currency: 'DZD',
      openingBalance: 0,
      now: D('2026-10-16'),
    });
    assert.equal(cal.totalPrevuEntrees.resultat, 6000000);
    assert.equal(cal.totalPrevuSorties.resultat, null, 'nothing goes out, which is not "zero goes out"');
    assert.equal(cal.cashFinProjete, 6000000);
  });

  test('a declared floor decides what counts as tension', () => {
    const generous = calendar({ openingBalance: 600000, tensionFloor: 0 });
    // 480 000 is left on the 5th, so a floor of 500 000 bites that day while a
    // floor of zero only does on the 20th.
    const careful = calendar({ openingBalance: 600000, tensionFloor: 500000 });
    assert.equal(generous.premierJourTension, '2026-10-20');
    assert.equal(careful.premierJourTension, '2026-10-05', 'someone who wants to keep 500 000 aside is in tension sooner');
  });

  test('nothing planned at all is not a plan of zero', () => {
    const empty = buildCalendar({ events: [], from: D('2026-10-01'), to: D('2026-10-31'), currency: 'DZD', openingBalance: 100000, now: D('2026-10-16') });
    assert.equal(empty.totalPrevuSorties.resultat, null);
    assert.equal(empty.totalPrevuEntrees.resultat, null);
    assert.equal(empty.cashFinProjete, 100000, 'the cash still projects: nothing happens to it');
  });

  test('the plan and the facts are two separate figures', () => {
    const cal = calendar({
      openingBalance: 600000,
      realised: [
        { id: 'x1', kind: 'expense', value: 350000, currency: 'DZD', planned: false, status: 'real' },
        { id: 'x2', kind: 'expense', value: 900000, currency: 'DZD', planned: false, status: 'fictional' },
        { id: 'x3', kind: 'expense', value: 100000, currency: 'EUR', planned: false, status: 'real' },
      ],
    });
    assert.equal(cal.totalReelSorties.resultat, 350000, 'fictional is never added to real, and another currency is not converted');
    assert.equal(cal.totalPrevuSorties.resultat, 620000, 'the plan is untouched by the facts');
  });

  test('every figure carries its formula, its inputs and its date', () => {
    const cal = calendar({ openingBalance: 600000 });
    for (const key of ['totalPrevuSorties', 'totalPrevuEntrees', 'totalReelSorties']) {
      assert.ok(cal[key].formule_id, `${key} says which formula`);
      assert.ok(cal[key].calcule_le, `${key} says when`);
      assert.equal(cal[key].unite, 'DZD');
      assert.equal(cal[key].entrees_snapshot.solde_initial_declare, 600000, 'the declared balance is visible in the snapshot');
    }
  });
});

describe('P6-07 — what the subscriptions cost', () => {
  test('each one is brought back to the month, and the year is twelve of them', () => {
    const cost = recurringCost(
      [recurrence({ value: 120000, frequency: 'mensuel' }), recurrence({ id: 'r2', label: 'Assurance', value: 1200000, frequency: 'annuel' })],
      { currency: 'DZD', now: D('2026-10-16') },
    );
    assert.equal(cost.coutMensuel.resultat, 220000, '120 000 + a twelfth of 1 200 000');
    assert.equal(cost.coutAnnuel.resultat, 2640000);
    assert.equal(cost.lignes[0].mensuel.formule_id, 'F049');
    assert.deepEqual(cost.lignes.map((line) => line.label), ['Abonnement', 'Assurance'], 'sorted by what they actually cost per month');
  });

  test('an incoming recurrence is not a subscription', () => {
    const cost = recurringCost([recurrence({ kind: 'income', value: 6000000 })], { currency: 'DZD' });
    assert.equal(cost.coutMensuel.resultat, null, 'a salary among the subscriptions would make the number meaningless');
  });

  test('no subscription at all is not a cost of zero', () => {
    assert.equal(recurringCost([], { currency: 'DZD' }).coutMensuel.resultat, null);
  });

  test('another currency and an unusable frequency are reported, never guessed', () => {
    const cost = recurringCost(
      [recurrence({ currency: 'EUR' }), recurrence({ id: 'r3', label: 'Mystère', frequency: 'quand-ça-vient' })],
      { currency: 'DZD' },
    );
    assert.equal(cost.coutMensuel.resultat, null);
    assert.equal(cost.avertissements.length, 2);
  });
});

describe('P6-07 — a provision', () => {
  const provision = (extra = {}) => ({
    id: 'p1',
    label: 'Scolarité',
    value: 3000000,
    provisioned: 1000000,
    currency: 'DZD',
    targetDate: D('2026-10-25'),
    categoryId: 'c3',
    ...extra,
  });

  test('the monthly provision is what is left, over the months left (F045)', () => {
    const view = buildProvisionView(provision(), { now: D('2026-07-10') });
    assert.equal(view.moisRestants, 3);
    assert.equal(view.provisionMensuelle.resultat, 666667);
    assert.equal(view.provisionMensuelle.formule_id, 'F045');
    assert.equal(view.reste, 2000000);
    assert.equal(view.etat, 'active');
  });

  test('past the due date there is no month left to divide by', () => {
    const view = buildProvisionView(provision(), { now: D('2026-11-10') });
    assert.equal(view.provisionMensuelle.resultat, null, "F045: « si mois restants > 0 » — not the whole remaining amount");
    assert.equal(view.etat, 'passed');
    assert.ok(view.provisionMensuelle.avertissements, 'the formula says why');
  });

  test('a provision that covers its expense is reached, not negative', () => {
    const view = buildProvisionView(provision({ provisioned: 3000000 }), { now: D('2026-07-10') });
    assert.equal(view.etat, 'reached');
    assert.equal(view.reste, 0);
    assert.equal(view.provisionMensuelle.resultat, 0, 'nothing left to set aside');
  });
});

describe('P6-07 — the frequency a detected interval suggests', () => {
  test('an interval close to one of the client s frequencies suggests it', () => {
    assert.equal(frequencyForInterval(7), 'hebdomadaire');
    assert.equal(frequencyForInterval(30), 'mensuel');
    assert.equal(frequencyForInterval(28), 'mensuel');
    assert.equal(frequencyForInterval(91), 'trimestriel');
    assert.equal(frequencyForInterval(365), 'annuel');
  });

  test('an interval close to nothing suggests nothing', () => {
    // 50 days is neither monthly nor quarterly. Offering the least wrong answer
    // would put a figure in front of somebody that nothing supports.
    assert.equal(frequencyForInterval(50), null);
    assert.equal(frequencyForInterval(130), null);
  });
});

import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { shiftForWeekend } from '../../src/services/finOccurrence.service.js';

// The calendar's occurrences (P8-11): a salary is credited once, after
// confirmation (QA-P05); the weekend rule (PB-F021); the projected cash
// starts from the accounts, never from a typed balance (C23, C7).

let t;
let user;

const DAY = 86_400_000;
const dayStart = (offset) => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + offset * DAY);
};

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ name: 'Calendrier P8-11' });
});
after(() => t.close());

describe('P8-11 — the weekend rule (PB-F021)', () => {
  test('a Friday or a Saturday moves to Thursday, or to Sunday, or stays', () => {
    const saturday = new Date('2026-10-31T00:00:00.000Z');
    assert.equal(shiftForWeekend(saturday, 'previous').toISOString().slice(0, 10), '2026-10-29');
    assert.equal(shiftForWeekend(saturday, 'next').toISOString().slice(0, 10), '2026-11-01');
    assert.equal(shiftForWeekend(saturday, 'none').toISOString().slice(0, 10), '2026-10-31');
  });
});

describe('P8-11 — a salary is credited once, after confirmation (QA-P05)', () => {
  const salary = async () => {
    // A working day in the past, so the weekend rule does not move it.
    let due = dayStart(-3);
    while ([5, 6].includes(due.getUTCDay())) due = new Date(due.getTime() - DAY);
    const res = await t.request('POST', '/fin/recurrences', {
      user,
      json: { label: 'Salaire', kind: 'income', value: 6000000, currency: 'DZD', frequency: 'mensuel', nextDate: due.toISOString() },
    });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));
    return { recurrence: res.body.recurrence, due };
  };
  const income = async () => (await t.request('GET', '/fin/argent/synthese', { user })).body.synthese.revenus.resultat;

  test('nothing is real before confirmation; one credit after; a second confirmation is refused', async () => {
    const { recurrence, due } = await salary();
    assert.equal(await income(), null, 'expected, not received');
    const confirm = () => t.request('POST', '/fin/calendrier/occurrences', { user, json: { recurrenceId: recurrence.id, dueDate: due.toISOString(), action: 'confirm' } });
    assert.equal((await confirm()).status, 201);
    assert.equal(await income(), 6000000);
    assert.equal((await confirm()).status, 409);
    assert.equal(await income(), 6000000, 'never twice');
  });

  test('« Pas reçu » records nothing, and the occurrence leaves the calendar', async () => {
    const { recurrence, due } = await salary();
    const res = await t.request('POST', '/fin/calendrier/occurrences', { user, json: { recurrenceId: recurrence.id, dueDate: due.toISOString(), action: 'missed' } });
    assert.equal(res.status, 201);
    assert.equal(await income(), null);
    const cal = (await t.request('GET', '/fin/calendrier', { user })).body.calendrier;
    const events = cal.jours.flatMap((day) => day.evenements).filter((event) => event.sourceId === recurrence.id && event.dueDate === due.toISOString().slice(0, 10));
    assert.deepEqual(events, []);
  });

  test('another person cannot confirm someone else’s salary', async () => {
    const { recurrence, due } = await salary();
    const other = await t.adult({ name: 'Curieux' });
    const res = await t.request('POST', '/fin/calendrier/occurrences', { user: other, json: { recurrenceId: recurrence.id, dueDate: due.toISOString(), action: 'confirm' } });
    assert.equal(res.status, 404);
  });
});

describe('P8-11 — the projected cash starts from the accounts', () => {
  test('without any account it is not computed; with one it starts from its balance', async () => {
    const empty = (await t.request('GET', '/fin/calendrier', { user })).body.calendrier;
    assert.equal(empty.cashFinProjete, null);
    await t.request('POST', '/fin/comptes', { user, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 1000000, openingDate: dayStart(-60).toISOString() } });
    const cal = (await t.request('GET', '/fin/calendrier', { user })).body.calendrier;
    assert.equal(cal.cashFinProjete, 1000000);
  });
});

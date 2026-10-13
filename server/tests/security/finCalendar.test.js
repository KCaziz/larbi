import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Recurrences, provisions and the calendar (P6-07) are private financial data,
// like the movements they are built from (P6-04): what somebody pays every
// month, and what they are putting aside for, must not reach another account —
// nor an administrator, who has no screen onto anybody's money.

let t;
let owner;
let intruder;
let admin;
let recurrence;
let provision;
let planned;

const DAY = 24 * 3600 * 1000;
const iso = (date) => date.toISOString();
const inDays = (days) => new Date(Date.now() + days * DAY);
const ago = (days) => new Date(Date.now() - days * DAY);

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  intruder = await t.user();
  admin = await t.admin();

  const rec = await t.request('POST', '/fin/recurrences', {
    user: owner,
    json: { label: 'Netflix', kind: 'expense', value: 120000, currency: 'DZD', frequency: 'mensuel', nextDate: iso(inDays(3)) },
  });
  recurrence = rec.body.recurrence;

  const prov = await t.request('POST', '/fin/provisions', {
    user: owner,
    json: { label: 'Scolarité', value: 3000000, currency: 'DZD', targetDate: iso(inDays(90)) },
  });
  provision = prov.body.provision;

  const mov = await t.request('POST', '/fin/transactions', {
    user: owner,
    json: { kind: 'expense', value: 500000, currency: 'DZD', occurredAt: iso(inDays(5)), planned: true, note: 'Loyer' },
  });
  planned = mov.body.transaction;
});
after(() => t.close());

describe('the whole calendar needs a session', () => {
  test('every route refuses an anonymous caller', async () => {
    for (const [method, path, json] of [
      ['GET', '/fin/calendrier', undefined],
      ['GET', '/fin/recurrences', undefined],
      ['GET', '/fin/recurrences/detection', undefined],
      ['GET', '/fin/recurrences/abonnements', undefined],
      ['GET', '/fin/provisions', undefined],
      ['POST', '/fin/recurrences', { label: 'X', kind: 'expense', value: 1, currency: 'DZD', frequency: 'mensuel', nextDate: iso(inDays(1)) }],
      ['POST', '/fin/provisions', { label: 'X', value: 1, currency: 'DZD', targetDate: iso(inDays(1)) }],
      ['POST', '/fin/calendrier/plan', { month: iso(new Date()) }],
      ['POST', `/fin/transactions/${planned.id}/payer`, {}],
    ]) {
      const res = await t.request(method, path, { json });
      assert.equal(res.status, 401, `${method} ${path}`);
    }
  });
});

describe("another account's recurrences", () => {
  test('are not in their list, and neither is their cost', async () => {
    const list = await t.request('GET', '/fin/recurrences', { user: intruder });
    assert.deepEqual(list.body.recurrences, []);
    const cost = await t.request('GET', '/fin/recurrences/abonnements', { user: intruder });
    assert.equal(cost.body.abonnements.coutMensuel.resultat, null, "no total is built from somebody else's subscriptions");
  });

  test('cannot be read, corrected, archived or deleted — and the answer is 404, not 403', async () => {
    // 404 and not 403: a refusal that distinguishes "not yours" from "does not
    // exist" confirms the row exists, which is itself a leak.
    for (const [method, path, json] of [
      ['GET', `/fin/recurrences/${recurrence.id}/historique`, undefined],
      ['PATCH', `/fin/recurrences/${recurrence.id}`, { value: 999 }],
      ['PUT', `/fin/recurrences/${recurrence.id}/archive`, { archived: true }],
      ['DELETE', `/fin/recurrences/${recurrence.id}`, {}],
    ]) {
      const res = await t.request(method, path, { user: intruder, json });
      assert.equal(res.status, 404, `${method} ${path}`);
    }
    const untouched = await t.prisma.finRecurrence.findUnique({ where: { id: recurrence.id }, select: { value: true, deletedAt: true, archivedAt: true } });
    assert.deepEqual(untouched, { value: 120000, deletedAt: null, archivedAt: null });
  });

  test('are not visible to an administrator either', async () => {
    const list = await t.request('GET', '/fin/recurrences', { user: admin });
    assert.deepEqual(list.body.recurrences, []);
    const history = await t.request('GET', `/fin/recurrences/${recurrence.id}/historique`, { user: admin });
    assert.equal(history.status, 404, 'there is no administration side to somebody s money');
  });
});

describe("another account's provisions", () => {
  test('are not in their list and cannot be touched', async () => {
    const list = await t.request('GET', '/fin/provisions', { user: intruder });
    assert.deepEqual(list.body.provisions, []);
    for (const [method, path, json] of [
      ['GET', `/fin/provisions/${provision.id}/historique`, undefined],
      ['PATCH', `/fin/provisions/${provision.id}`, { value: 999999 }],
      ['DELETE', `/fin/provisions/${provision.id}`, {}],
    ]) {
      const res = await t.request(method, path, { user: intruder, json });
      assert.equal(res.status, 404, `${method} ${path}`);
    }
  });
});

describe("another account's calendar and plan", () => {
  test('their planned movements are not on the intruder s calendar', async () => {
    const mine = await t.request('GET', '/fin/calendrier', { user: owner });
    const theirs = await t.request('GET', '/fin/calendrier', { user: intruder });
    assert.ok(mine.body.calendrier.jours.some((day) => day.evenements.length > 0));
    assert.ok(theirs.body.calendrier.jours.every((day) => day.evenements.length === 0));
  });

  test('a planned movement of another account cannot be marked paid', async () => {
    const res = await t.request('POST', `/fin/transactions/${planned.id}/payer`, { user: intruder, json: {} });
    assert.equal(res.status, 404);
    const untouched = await t.prisma.finTransaction.findUnique({ where: { id: planned.id }, select: { planned: true, status: true } });
    assert.deepEqual(untouched, { planned: true, status: 'declared' });
  });

  test('copying the plan of the month only ever copies the caller s own rows', async () => {
    // The owner has a planned movement last month; the intruder copies "their"
    // plan and must get nothing.
    const lastMonth = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 1, 10, 12));
    await t.request('POST', '/fin/transactions', {
      user: owner,
      json: { kind: 'expense', value: 700000, currency: 'DZD', occurredAt: iso(lastMonth), planned: true, note: 'Loyer' },
    });
    const res = await t.request('POST', '/fin/calendrier/plan', {
      user: intruder,
      json: { month: iso(new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1))) },
    });
    assert.equal(res.status, 201);
    assert.deepEqual(res.body.created, []);
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: intruder.id } }), 0);
  });

  test('the detection only ever reads the caller s own movements', async () => {
    for (const days of [5, 35, 65]) {
      await t.request('POST', '/fin/transactions', {
        user: owner,
        json: { kind: 'expense', value: 120000, currency: 'DZD', occurredAt: iso(ago(days)), note: 'Spotify' },
      });
    }
    const theirs = await t.request('GET', '/fin/recurrences/detection', { user: intruder });
    assert.deepEqual(theirs.body.candidats, [], "another account's pattern is not proposed here");
    const mine = await t.request('GET', '/fin/recurrences/detection', { user: owner });
    assert.equal(mine.body.candidats.length, 1);
  });
});

describe('what the server decides, a caller cannot', () => {
  test('the metadata socle is not driven from the body', async () => {
    const res = await t.request('POST', '/fin/recurrences', {
      user: owner,
      json: {
        label: 'Forgé',
        kind: 'expense',
        value: 1000,
        currency: 'DZD',
        frequency: 'mensuel',
        nextDate: iso(inDays(1)),
        // All of these are the server's to decide. `strict()` refuses the body
        // rather than silently dropping them, which is what makes the trail
        // worth anything.
        source: 'official',
        version: 42,
        detected: true,
        sourceRef: 'detection:ALG-04',
      },
    });
    assert.equal(res.status, 400);
  });

  test('a status outside the two a caller may declare is refused', async () => {
    const res = await t.request('POST', '/fin/provisions', {
      user: owner,
      json: { label: 'X', value: 1000, currency: 'DZD', targetDate: iso(inDays(10)), status: 'official' },
    });
    assert.equal(res.status, 400);
  });

  test('a journal entry of another account is never returned', async () => {
    const changes = await t.prisma.finChange.findMany({ where: { userId: owner.id } });
    assert.ok(changes.length > 0, 'the owner has a trail');
    const history = await t.request('GET', `/fin/recurrences/${recurrence.id}/historique`, { user: intruder });
    assert.equal(history.status, 404);
  });
});

describe('erasing an account takes its calendar with it', () => {
  test('recurrences and provisions go with the account that owns them', async () => {
    assert.equal(await t.prisma.finRecurrence.count({ where: { userId: owner.id } }), 1);
    assert.equal(await t.prisma.finProvision.count({ where: { userId: owner.id } }), 1);

    // The complete deletion the privacy text promises (P6-01 point 9). It must
    // not be refused by a foreign key — the defect P6-04 had to fix.
    await t.prisma.user.delete({ where: { id: owner.id } });

    assert.equal(await t.prisma.finRecurrence.count({ where: { userId: owner.id } }), 0);
    assert.equal(await t.prisma.finProvision.count({ where: { userId: owner.id } }), 0);
    assert.equal(await t.prisma.finChange.count({ where: { userId: owner.id } }), 0);
  });

  test('a category used by a recurrence does not block that erasure', async () => {
    const cat = await t.request('POST', '/fin/categories', { user: owner, json: { family: 'fixed', label: 'Abonnements' } });
    await t.request('POST', '/fin/recurrences', {
      user: owner,
      json: { label: 'Internet', kind: 'expense', value: 300000, currency: 'DZD', frequency: 'mensuel', nextDate: iso(inDays(5)), categoryId: cat.body.category.id },
    });
    await t.request('POST', '/fin/provisions', {
      user: owner,
      json: { label: 'Assurance', value: 500000, currency: 'DZD', targetDate: iso(inDays(60)), categoryId: cat.body.category.id },
    });

    await t.prisma.user.delete({ where: { id: owner.id } });
    assert.equal(await t.prisma.finCategory.count({ where: { userId: owner.id } }), 0);
  });
});

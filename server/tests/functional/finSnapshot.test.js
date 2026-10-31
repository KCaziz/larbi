import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Snapshots (P8-24): a monthly report kept as it was, and the history of the
// financial-health index. A snapshot is never recomputed.

let t;
let user;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
});
after(() => t.close());

const month = new Date().toISOString().slice(0, 7);
const today = new Date().toISOString();
const spend = (value) => t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value, currency: 'DZD', occurredAt: today } });

describe('a kept monthly report', () => {
  test('keeps the month as it was: a later movement does not rewrite it', async () => {
    await spend(1000000);
    const kept = await t.request('POST', '/fin/rapport/instantane', { user, json: { mois: month } });
    assert.equal(kept.status, 201, JSON.stringify(kept.body).slice(0, 200));
    assert.equal(kept.body.instantane.version, 1);

    await spend(500000);
    const live = (await t.request('GET', `/fin/rapport?mois=${month}`, { user })).body.rapport;
    const stored = (await t.request('GET', `/fin/rapport/instantane/${month}`, { user })).body;
    assert.equal(live.sections.R01.depenses.resultat, 1500000);
    assert.equal(stored.rapport.sections.R01.depenses.resultat, 1000000, 'the kept report is the one of that day');
    assert.ok(stored.instantane.capturedAt);
  });

  test('keeping the month again replaces it and raises the version', async () => {
    await t.request('POST', '/fin/rapport/instantane', { user, json: { mois: month } });
    const again = await t.request('POST', '/fin/rapport/instantane', { user, json: { mois: month } });
    assert.equal(again.body.instantane.version, 2);
    assert.equal((await t.request('GET', '/fin/rapport/instantanes', { user })).body.instantanes.length, 1);
  });

  test('a month never kept is a 404, a malformed month a 400, and nobody else sees it', async () => {
    assert.equal((await t.request('GET', `/fin/rapport/instantane/${month}`, { user })).status, 404);
    assert.equal((await t.request('GET', '/fin/rapport/instantane/2026-13', { user })).status, 400);
    assert.equal((await t.request('POST', '/fin/rapport/instantane', { user, json: { mois: '2026-13' } })).status, 400);
    await t.request('POST', '/fin/rapport/instantane', { user, json: { mois: month } });
    const other = await t.adult({ finPublic: 'SAL', finCurrency: 'DZD' });
    assert.equal((await t.request('GET', `/fin/rapport/instantane/${month}`, { user: other })).status, 404);
  });
});

describe('the history of the health index', () => {
  test('the month’s index is kept when the day’s list is read, then listed', async () => {
    await t.request('POST', '/fin/transactions', { user, json: { kind: 'income', value: 8000000, currency: 'DZD', occurredAt: today } });
    await spend(2000000);
    assert.deepEqual((await t.request('GET', '/fin/sante/historique', { user })).body.points, [], 'nothing kept before it is read');
    const read = await t.request('GET', '/fin/aujourdhui', { user });
    assert.equal(read.status, 200);
    const points = (await t.request('GET', '/fin/sante/historique', { user })).body.points;
    assert.equal(points.length, 1);
    assert.equal(points[0].month, month);
    assert.equal(points[0].valeur, read.body.aujourdhui.santeFinanciere.answer.resultat);
    assert.ok(points[0].dimensions.length > 0, 'the dimensions kept at the time');
  });

  test('an index that cannot be measured yet is not a point of the history', async () => {
    await t.request('GET', '/fin/aujourdhui', { user });
    const points = (await t.request('GET', '/fin/sante/historique', { user })).body.points;
    for (const point of points) assert.ok(point.valeur !== null);
  });

  test('a minor is shown no index, and none is kept', async () => {
    const minor = await t.minor({ finPublic: 'LYC', finCurrency: 'DZD' });
    await t.request('POST', '/fin/transactions', { user: minor, json: { kind: 'income', value: 100000, currency: 'DZD', occurredAt: today } });
    await t.request('GET', '/fin/aujourdhui', { user: minor });
    assert.deepEqual((await t.request('GET', '/fin/sante/historique', { user: minor })).body.points, []);
  });
});

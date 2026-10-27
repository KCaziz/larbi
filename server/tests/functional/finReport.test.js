import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The monthly report (P8-10): its sections, its comparison with the previous
// month (PB-F023), its versioning, and its downloads.

let t;
let user;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ name: 'Rapport P8-10' });
});
after(() => t.close());

const month = new Date().toISOString().slice(0, 7);
const today = new Date().toISOString();

describe('P8-10 — the monthly report', () => {
  test('carries the sections, a version, and every figure with its formula', async () => {
    await t.request('POST', '/fin/transactions', { user, json: { kind: 'income', value: 6000000, currency: 'DZD', occurredAt: today } });
    await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value: 1500000, currency: 'DZD', occurredAt: today } });
    const res = await t.request('GET', `/fin/rapport?mois=${month}`, { user });
    assert.equal(res.status, 200);
    const report = res.body.rapport;
    assert.equal(report.version, 1);
    assert.ok(report.genereLe);
    assert.equal(report.sections.R01.fluxNet.resultat, 4500000);
    assert.equal(report.sections.R01.fluxNet.formule_id, 'PB-F006');
    assert.equal(report.sections.R01.tendance.depenses.formule_id, 'PB-F023');
    assert.equal(report.sections.R02.length, 1, 'the « Espèces » account');
    assert.equal(report.sections.R11.tauxPointage.formule_id, 'AN-F004');
  });

  test('downloads as CSV and as a spreadsheet', async () => {
    await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value: 1500000, currency: 'DZD', occurredAt: today } });
    const csv = await t.request('GET', `/fin/rapport/export?mois=${month}`, { user });
    assert.equal(csv.status, 200);
    assert.match(csv.headers.get('content-type'), /text\/csv/);
    assert.match(csv.text, /R-01/);
    const xlsx = await t.request('GET', `/fin/rapport/export?mois=${month}&format=xlsx`, { user });
    assert.equal(xlsx.status, 200);
    assert.ok(xlsx.buffer.length > 1000);
  });

  test('a month that is not a month is refused', async () => {
    assert.equal((await t.request('GET', '/fin/rapport?mois=2026-13', { user })).status, 400);
  });
});

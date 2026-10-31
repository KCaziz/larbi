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

  test('R-06 simulates cutting flexible spending with the person’s own rate, and the cascade adds up', async () => {
    const category = async (key) => (await t.prisma.finCategory.findFirst({ where: { key, userId: null }, select: { id: true } })).id;
    const add = async (kind, value, key) => t.request('POST', '/fin/transactions', { user, json: { kind, value, currency: 'DZD', occurredAt: today, categoryId: await category(key) } });
    await add('income', 6000000, 'income.salaire_net');
    await add('expense', 2000000, 'fixed.loyer'); // essential
    await add('expense', 500000, 'variable.restaurant'); // flexible
    const report = (await t.request('GET', `/fin/rapport?mois=${month}&reduction=20`, { user })).body.rapport;
    const r06 = report.sections.R06;
    assert.equal(r06.depensesFlexibles.resultat, 500000);
    assert.equal(r06.depensesFlexibles.formule_id, 'AN-F002');
    assert.equal(r06.reductionSimulee.resultat, 100000, '20 % of 500 000');
    assert.equal(r06.epargneScenario.resultat, 6000000 - 2500000 + 100000);
    assert.equal(r06.tauxEpargneScenario.formule_id, 'AN-F011');
    // Revenus → charges → dette → flexibles → épargne → reste.
    assert.equal(report.cascade.find((step) => step.cle === 'left').montant, 3500000);
  });

  test('two months of the person’s choosing are compared, the change being PB-F023', async () => {
    const lastMonth = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 1, 10, 12));
    await t.request('POST', '/fin/transactions', { user, json: { kind: 'income', value: 5000000, currency: 'DZD', occurredAt: lastMonth.toISOString() } });
    await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value: 1000000, currency: 'DZD', occurredAt: lastMonth.toISOString() } });
    await t.request('POST', '/fin/transactions', { user, json: { kind: 'income', value: 6000000, currency: 'DZD', occurredAt: today } });
    await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value: 1500000, currency: 'DZD', occurredAt: today } });
    const before = lastMonth.toISOString().slice(0, 7);
    const res = await t.request('GET', `/fin/rapport/comparaison?mois=${before}&avec=${month}`, { user });
    assert.equal(res.status, 200, JSON.stringify(res.body).slice(0, 200));
    const c = res.body.comparaison;
    assert.deepEqual(c.mois, { a: before, b: month });
    assert.equal(c.depenses.a.resultat, 1000000);
    assert.equal(c.depenses.b.resultat, 1500000);
    assert.equal(c.depenses.variation.formule_id, 'PB-F023');
    assert.equal(c.depenses.variation.resultat, 0.5);
    assert.equal(c.fluxNet.variation.resultat, (4500000 - 4000000) / 4000000);
  });

  test('the comparison needs two different months', async () => {
    assert.equal((await t.request('GET', `/fin/rapport/comparaison?mois=${month}&avec=${month}`, { user })).status, 400);
    assert.equal((await t.request('GET', `/fin/rapport/comparaison?mois=${month}`, { user })).status, 400);
  });

  test('a month that is not a month is refused', async () => {
    assert.equal((await t.request('GET', '/fin/rapport?mois=2026-13', { user })).status, 400);
  });
});

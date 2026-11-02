import '../helpers/setup-env.js';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { boot } from '../helpers/server.js';
import { dataQualityMeasures, goalLinesOf, plannedToDate } from '../../src/services/finHealthMeasures.service.js';

// The « Objectifs » and « Qualité des données » dimensions of the health index
// (P8-33, client's answer H of 2026-11-02), read from real rows.

let t;
let user;
const DAY = 24 * 3600 * 1000;
const NOW = new Date('2026-11-15T12:00:00Z');
const ago = (days) => new Date(NOW.getTime() - days * DAY);

const goal = (extra = {}) =>
  t.prisma.finGoal.create({
    data: { userId: user.id, label: 'Voiture', target: 1000000, currency: 'DZD', allocated: 0, source: 'manual', status: 'real', createdAt: ago(100), ...extra },
  });

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
});
after(() => t.close());

describe('the goals dimension', () => {
  test('a goal with a date is planned linearly from its creation; one with only a contribution, by the months elapsed', () => {
    const dated = { createdAt: ago(100), targetDate: new Date(NOW.getTime() + 100 * DAY), target: 1000000, monthlyContribution: null };
    assert.equal(Math.round(plannedToDate(dated, NOW)), 500000);
    assert.equal(plannedToDate({ ...dated, targetDate: ago(1) }, NOW), 1000000, 'past its date, all of it was planned');
    const monthly = { createdAt: new Date('2026-08-15T00:00:00Z'), targetDate: null, target: 1000000, monthlyContribution: 50000 };
    assert.equal(plannedToDate(monthly, NOW), 150000);
    assert.equal(plannedToDate({ ...monthly, monthlyContribution: null }, NOW), null, 'nothing to plan from');
  });

  test('trajectory from the capital really allocated; the emergency fund, paused and unplannable goals are left out', async () => {
    await goal({ targetDate: new Date(NOW.getTime() + 100 * DAY), allocated: 250000 });
    await goal({ label: 'Urgence', templateKey: 'emergency', targetDate: new Date(NOW.getTime() + 100 * DAY) });
    await goal({ label: 'En pause', progressStatus: 'paused', targetDate: new Date(NOW.getTime() + 100 * DAY) });
    await goal({ label: 'Sans plan' });
    const lines = await goalLinesOf(t.prisma, user.id, { now: NOW });
    assert.equal(lines.length, 1);
    assert.equal(Math.round(lines[0].trajectory), 50, '250 000 allocated of 500 000 planned');
    assert.equal(lines[0].regularity, null, 'no rhythm, no regularity');
  });

  test('regularity: the months in which the transfers into its account reached the planned contribution', async () => {
    const account = await t.prisma.finAccount.create({
      data: { userId: user.id, label: 'Projet', type: 'AC-02', currency: 'DZD', includeInTotal: true, includeInNetWorth: true, source: 'manual', status: 'real' },
    });
    const start = new Date('2026-08-15T00:00:00Z');
    await goal({ createdAt: start, monthlyContribution: 50000, accountId: account.id, allocated: 100000 });
    // Month 1 and month 3 are paid; month 2 is short.
    const move = (date, value) => t.prisma.finTransaction.create({ data: { userId: user.id, accountId: account.id, kind: 'transfer_in', transferId: randomUUID(), value, currency: 'DZD', occurredAt: new Date(date), source: 'manual', status: 'real' } });
    await move('2026-08-20T00:00:00Z', 50000);
    await move('2026-09-20T00:00:00Z', 20000);
    await move('2026-10-20T00:00:00Z', 60000);
    const [line] = await goalLinesOf(t.prisma, user.id, { now: NOW });
    assert.equal(Math.round(line.regularity), 67, '2 of the 3 expected months');
  });

  test('through the dashboard: a goal enters the index, and its absence leaves the weight to the others', async () => {
    const before = (await t.request('GET', '/fin/aujourdhui', { user })).body.aujourdhui.santeFinanciere;
    assert.equal(before.dimensions.find((row) => row.key === 'goals').score, null, 'no goal, not measured');
    await t.request('POST', '/fin/goals', { user, json: { label: 'Voyage', target: 500000, currency: 'DZD', monthlyContribution: 20000 } });
    const after = (await t.request('GET', '/fin/aujourdhui', { user })).body.aujourdhui.santeFinanciere;
    assert.equal(after.version, 'B-9');
    assert.equal(after.dimensions.find((row) => row.key === 'goals').score, 100, 'just created: nothing planned yet, on track');
  });
});

describe('the data-quality dimension', () => {
  test('clearing: the real movements of the last 30 days that were checked or reconciled', async () => {
    const account = await t.prisma.finAccount.create({ data: { userId: user.id, label: 'CCP', type: 'AC-02', currency: 'DZD', includeInTotal: true, includeInNetWorth: true, source: 'manual', status: 'real' } });
    const tx = (daysAgo, clearing, extra = {}) => t.prisma.finTransaction.create({ data: { userId: user.id, accountId: account.id, kind: 'expense', value: 1000, currency: 'DZD', occurredAt: ago(daysAgo), clearing, source: 'manual', status: 'real', ...extra } });
    await tx(2, 'checked');
    await tx(3, 'reconciled');
    await tx(4, 'unchecked');
    await tx(5, 'to_verify');
    await tx(60, 'unchecked'); // too old to count
    await tx(1, 'unchecked', { planned: true }); // not happened yet
    const measures = await dataQualityMeasures(t.prisma, user.id, { now: NOW });
    assert.equal(measures.clearing, 50);
  });

  test('freshness by its own threshold: 100 within, 50 up to twice, 0 beyond; an absent kind is not measured', async () => {
    // A manual account last touched 45 days ago (threshold 30): 50, alone in the measure.
    const account = await t.prisma.finAccount.create({ data: { userId: user.id, label: 'Espèces', type: 'AC-01', currency: 'DZD', includeInTotal: true, includeInNetWorth: true, source: 'manual', status: 'real' } });
    await t.prisma.$executeRaw`UPDATE fin_accounts SET updatedAt = ${ago(45)} WHERE id = ${account.id}`;
    assert.equal((await dataQualityMeasures(t.prisma, user.id, { now: NOW })).freshness, 50);
    // A valuation 10 days old (threshold 90) joins it: (50 + 100) / 2.
    await t.prisma.finAsset.create({ data: { userId: user.id, kind: 'property', label: 'Terrain', value: 1000000, currency: 'DZD', liquidity: 'illiquid', valuedAt: ago(10), source: 'manual', status: 'real' } });
    assert.equal((await dataQualityMeasures(t.prisma, user.id, { now: NOW })).freshness, 75);
    // Past twice its threshold the account counts 0.
    await t.prisma.$executeRaw`UPDATE fin_accounts SET updatedAt = ${ago(70)} WHERE id = ${account.id}`;
    assert.equal((await dataQualityMeasures(t.prisma, user.id, { now: NOW })).freshness, 50, '(0 + 100) / 2');
    const empty = await t.adult({ finPublic: 'SAL', finCurrency: 'DZD' });
    const none = await dataQualityMeasures(t.prisma, empty.id, { now: NOW });
    assert.deepEqual(none, { completeness: null, freshness: null, clearing: null }, 'nothing to measure is null, never 0');
  });

  test('completeness is the onboarding’s own ratio', async () => {
    const measures = await dataQualityMeasures(t.prisma, user.id, { onboarding: { ratio: 0.6 }, now: NOW });
    assert.equal(measures.completeness, 60);
  });
});

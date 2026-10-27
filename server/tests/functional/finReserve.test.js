import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The safety reserve measured by the client's final rules PB-F017 to PB-F019
// (P8-04, diagnostic n°2, C3 and C4).
//
// C3: the reserve used to be the cumulative sum of every « épargne » movement.
//     PB-F018 measures the capital of the emergency fund — its goal.
// C4: the essential expenses used to be divided by 3 whatever the history.
//     They are now averaged over the whole months the history covers.

let t;
let user;

const DAY = 24 * 3600 * 1000;
const daysAgo = (days) => new Date(Date.now() - days * DAY).toISOString();
const categoryId = async (key) => (await t.prisma.finCategory.findFirst({ where: { key, userId: null }, select: { id: true } })).id;

const spend = async (key, value, days) =>
  t.request('POST', '/fin/transactions', {
    user,
    json: { kind: 'expense', value, currency: 'DZD', occurredAt: daysAgo(days), categoryId: await categoryId(key) },
  });
const reserve = async () => (await t.request('GET', '/fin/reserve?currency=DZD', { user })).body;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ name: 'Réserve P8-04' });
});
after(() => t.close());

describe('P8-04 — the reserve is the capital of the emergency fund (PB-F018)', () => {
  test('savings movements alone do not make a reserve: there is no fund yet', async () => {
    await spend('fixed.loyer', 3000000, 40);
    await spend('fixed.loyer', 3000000, 10);
    await spend('goal.reserve_de_securite', 6000000, 5);

    const r = await reserve();
    assert.equal(r.moisReserve.resultat, null);
    assert.equal(r.moisReserve.formule_id, 'PB-F018');
    assert.ok(r.avertissements.some((text) => text.includes('Fonds d’urgence')), 'and the screen says how to get one');
  });

  test('the months of reserve read the capital allocated to the emergency-fund goal', async () => {
    await spend('fixed.loyer', 3000000, 40);
    await spend('fixed.loyer', 3000000, 10);
    await spend('goal.reserve_de_securite', 6000000, 5);
    const goal = await t.request('POST', '/fin/goals', {
      user,
      json: { label: 'Fonds d’urgence', templateKey: 'emergency', target: 18000000, currency: 'DZD', targetDate: '2027-12-01T00:00:00.000Z', allocated: 6000000 },
    });
    assert.equal(goal.status, 201, JSON.stringify(goal.body).slice(0, 200));

    const r = await reserve();
    assert.equal(r.epargneLiquide, 6000000);
    // One whole month of history: the last month holds one rent, 3 000 000.
    assert.equal(r.depensesEssentielles, 3000000);
    assert.equal(r.moisReserve.resultat, 2);
  });
});

describe('P8-04 — essential expenses over the months really covered (C4)', () => {
  test('two weeks of history are not divided by 3', async () => {
    // The old average made this 1 000 000 a month — a third of the rent —
    // and so showed three times the months of reserve.
    await spend('fixed.loyer', 3000000, 12);
    const r = await reserve();
    assert.notEqual(r.depensesEssentielles, 1000000);
    assert.equal(r.depensesEssentielles, null, 'less than a month, nothing declared: unknown, not guessed');
  });

  test('three months of history are averaged over three months', async () => {
    await spend('fixed.loyer', 3000000, 100);
    await spend('fixed.loyer', 3000000, 70);
    await spend('fixed.loyer', 3000000, 40);
    await spend('fixed.loyer', 3000000, 10);
    const r = await reserve();
    // The last three months hold three rents (70, 40 and 10 days ago).
    assert.equal(r.depensesEssentielles, 3000000);
  });
});

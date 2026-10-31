import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The Accueil (P8-06) — here, its « revenus prévus » block (P8-24): the salary
// comes FIRST among the declared resources, whatever their amounts.

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

const income = async (key, label, value) => {
  const category = await t.prisma.finCategory.findFirst({ where: { key, userId: null }, select: { id: true } });
  return t.prisma.finIncome.create({
    data: { userId: user.id, label, value, currency: 'DZD', frequency: 'mensuel', startDate: new Date(Date.now() - 40 * 86400000), categoryId: category.id, source: 'manual', status: 'declared' },
  });
};

describe('the Accueil', () => {
  test('the salary comes first among the declared resources, even when another one is larger', async () => {
    await income('income.freelance_mission', 'Mission', 9000000);
    await income('income.salaire_net', 'Salaire', 6000000);
    const res = await t.request('GET', '/fin/accueil', { user });
    assert.equal(res.status, 200, JSON.stringify(res.body).slice(0, 200));
    const list = res.body.synthese.revenusDeclares;
    assert.deepEqual(list.map((row) => row.label), ['Salaire', 'Mission']);
    assert.equal(list[0].salary, true);
    assert.equal(list[1].salary, false);
  });

  test('without any declared resource the block is empty, never invented', async () => {
    const res = await t.request('GET', '/fin/accueil', { user });
    assert.deepEqual(res.body.synthese.revenusDeclares, []);
  });
});

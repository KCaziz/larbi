import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The Accueil (P8-06) — here, its « revenus prévus » block (P8-24): the salary
// comes FIRST among the declared resources, whatever their amounts.

let t;
let user;

before(async () => {
  t = await boot({ subscribers: true });
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

// Recette R9-06 and R9-10: an account kept apart is computed on its own, and
// the plan of the month is the budget when there is one.
describe('the Accueil, account by account', () => {
  const justNow = () => new Date(Date.now() - 60_000).toISOString();
  const account = async (label, includeInTotal) => {
    const res = await t.request('POST', '/fin/comptes', { user, json: { type: 'AC-02', label, currency: 'DZD', openingBalance: 0, includeInTotal } });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.account?.id ?? res.body.id;
  };
  const spend = async (accountId, value) => {
    const res = await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value, currency: 'DZD', occurredAt: justNow(), accountId } });
    assert.equal(res.status, 201, JSON.stringify(res.body));
  };

  test('an account kept apart is left out of the global figures, and computed alone when chosen', async () => {
    const counted = await account('Banque', true);
    const apart = await account('À part', false);
    await spend(counted, 150000);
    await spend(apart, 50000);

    const all = await t.request('GET', '/fin/accueil', { user });
    assert.equal(all.status, 200);
    assert.equal(all.body.synthese.depenses.resultat, 150000, 'the account kept apart is not in the total');

    const one = await t.request('GET', `/fin/accueil?accountId=${apart}`, { user });
    assert.equal(one.status, 200);
    assert.equal(one.body.synthese.depenses.resultat, 50000, 'that account alone');

    const list = await t.request('GET', '/fin/transactions?inTotal=true', { user });
    assert.deepEqual(list.body.transactions.map((row) => row.value), [150000]);
  });

  test('« prévu / réel » takes the budget of the month as the plan', async () => {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
    const rent = await t.prisma.finCategory.findFirst({ where: { key: 'fixed.loyer', userId: null }, select: { id: true } });
    const budget = await t.request('POST', '/fin/budgets', {
      user,
      json: { label: 'Mois', periodStart: start.toISOString(), periodEnd: end.toISOString(), currency: 'DZD', envelopes: [{ categoryId: rent.id, kind: 'fixed', value: 2000000 }] },
    });
    assert.equal(budget.status, 201, JSON.stringify(budget.body));
    const res = await t.request('GET', '/fin/accueil', { user });
    assert.equal(res.body.synthese.prevuReel.prevu, 2000000);
    assert.equal(res.body.synthese.prevuReel.source, 'budget');
  });
});


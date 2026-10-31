import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P8-24, step P7 of the first steps: a debt's monthly instalment is planned in
// the current budget — ONE fixed envelope, kept in step, never counted twice.

let t;
let user;
let loanCategory;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
  loanCategory = (await t.prisma.finCategory.findFirst({ where: { key: 'fixed.credit_consommation', userId: null } })).id;
});
after(() => t.close());

const as = (method, path, json) => t.request(method, `/fin${path}`, { user, ...(json === undefined ? {} : { json }) });
const month = () => ({
  periodStart: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString(),
  periodEnd: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 0)).toISOString(),
});
const budget = () => as('POST', '/budgets', { label: 'Ce mois', ...month(), currency: 'DZD', envelopes: [] });
const debt = (json = {}) => as('POST', '/debts', { label: 'Téléphone', outstandingPrincipal: 2000000, monthlyInstalment: 100000, currency: 'DZD', ...json });

describe('a debt instalment in the budget', () => {
  test('creates one fixed envelope worth the instalment, in the current budget', async () => {
    const b = (await budget()).body.budget;
    const d = (await debt()).body.debt;
    const res = await as('POST', `/debts/${d.id}/budget`, { categoryId: loanCategory });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));
    assert.equal(res.body.budgetId, b.id);
    assert.equal(res.body.envelope.value, 100000);
    assert.equal(res.body.envelope.kind, 'fixed');
    assert.equal(res.body.envelope.categoryId, loanCategory);
  });

  test('doing it again follows the instalment instead of adding a second envelope', async () => {
    const b = (await budget()).body.budget;
    const d = (await debt()).body.debt;
    const first = (await as('POST', `/debts/${d.id}/budget`, { categoryId: loanCategory })).body.envelope;
    await as('PATCH', `/debts/${d.id}`, { monthlyInstalment: 150000 });
    const again = await as('POST', `/debts/${d.id}/budget`, { categoryId: loanCategory });
    assert.equal(again.status, 201, JSON.stringify(again.body).slice(0, 200));
    assert.equal(again.body.envelope.id, first.id, 'the same envelope');
    assert.equal(again.body.envelope.value, 150000);
    assert.equal(await t.prisma.finEnvelope.count({ where: { budgetId: b.id, deletedAt: null } }), 1);
  });

  test('refuses a receivable, a debt with no instalment, a non-debt category and a missing budget', async () => {
    await budget();
    const noInstalment = (await debt({ monthlyInstalment: 0 })).body.debt;
    assert.equal((await as('POST', `/debts/${noInstalment.id}/budget`, { categoryId: loanCategory })).status, 422);
    const d = (await debt()).body.debt;
    const food = (await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null } })).id;
    assert.equal((await as('POST', `/debts/${d.id}/budget`, { categoryId: food })).status, 422);
    await t.prisma.finBudget.deleteMany({ where: { userId: user.id } });
    const res = await as('POST', `/debts/${d.id}/budget`, { categoryId: loanCategory });
    assert.equal(res.status, 422);
    assert.equal(res.body.error?.details?.reason ?? res.body.error?.reason, 'noBudget');
  });

  test('somebody else’s debt is a 404', async () => {
    await budget();
    const d = (await debt()).body.debt;
    const other = await t.adult({ finPublic: 'SAL', finCurrency: 'DZD' });
    const res = await t.request('POST', `/fin/debts/${d.id}/budget`, { user: other, json: { categoryId: loanCategory } });
    assert.equal(res.status, 404);
  });
});

import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Recette R8-06: the debts screen draws what was owed at the start, what has
// been repaid and what is left. A debt of 1 000 repaid by 500 is « 500 left out
// of 1 000 », never « 500 = 100 % ».

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

const as = (method, path, json) => t.request(method, `/fin${path}`, { user, ...(json === undefined ? {} : { json }) });

describe('what has been repaid on a debt', () => {
  test('the list gives, with each debt, the sum of its repayments', async () => {
    const debt = (await as('POST', '/debts', { label: 'Prêt', outstandingPrincipal: 100000, monthlyInstalment: 10000, currency: 'DZD' })).body.debt;
    assert.equal((await as('GET', '/debts')).body.debts.find((row) => row.id === debt.id).repaid, 0, 'nothing repaid yet');

    const paid = await as('POST', `/debts/${debt.id}/paiements`, { amount: 50000, currency: 'DZD', paidAt: new Date().toISOString() });
    assert.equal(paid.status, 201, JSON.stringify(paid.body).slice(0, 200));

    const row = (await as('GET', '/debts')).body.debts.find((item) => item.id === debt.id);
    assert.equal(row.repaid, 50000);
    assert.equal(row.outstandingPrincipal, 50000, 'what is left went down by the repayment');
    assert.equal(row.outstandingPrincipal + row.repaid, 100000, 'the starting amount is kept');
  });
});

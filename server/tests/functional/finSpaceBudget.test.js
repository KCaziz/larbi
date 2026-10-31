import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P9-05: common budgets per collective category and month (COL-F06, COL-F07,
// ALG-C02, QC-06). A common budget touches no personal budget; the remaining
// amount may be negative; alerts come at 80 % and 100 %.

let t;
let owner;
let flatmate;
let space;
let ownerId;
let flatmateId;

const DAY = 24 * 3600 * 1000;
const iso = (date) => date.toISOString();
const ago = (days) => new Date(Date.now() - days * DAY);
const month = (date = new Date()) => date.toISOString().slice(0, 7);
// A date certainly inside the current month, whatever day it is.
const thisMonth = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 12));

async function memberId(user) {
  const res = await t.request('GET', `/fin/espaces/${space.id}/membres`, { user });
  return res.body.membres.find((m) => m.isMe).id;
}
const spend = (json) =>
  t.request('POST', `/fin/espaces/${space.id}/depenses`, {
    user: owner,
    json: { label: 'Facture', value: 100000, occurredAt: iso(thisMonth()), splitMode: 'equal', payerId: ownerId, participants: [{ memberId: ownerId }, { memberId: flatmateId }], ...json },
  });
const setBudget = (json, user = owner) => t.request('PUT', `/fin/espaces/${space.id}/budgets`, { user, json: { category: 'COLC-02', period: month(), value: 100000, ...json } });
const view = (user = owner) => t.request('GET', `/fin/espaces/${space.id}/budgets`, { user });

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  flatmate = await t.user();
  space = (await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'flatshare', label: 'Coloc', currency: 'DZD' } })).body.space;
  const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
  assert.equal((await t.request('POST', '/fin/espaces/rejoindre', { user: flatmate, json: { token: invite.body.token } })).status, 201);
  ownerId = await memberId(owner);
  flatmateId = await memberId(flatmate);
});
after(() => t.close());

describe('common budgets (COL-F06 / F07)', () => {
  test('the remaining amount and the consumption follow the realised expenses of the category', async () => {
    assert.equal((await setBudget({})).status, 200);
    await spend({ value: 60000, collectiveCategory: 'COLC-02' });
    await spend({ value: 30000, collectiveCategory: 'COLC-03' });

    const line = (await view()).body.budgets.budgets[0];
    assert.equal(line.category, 'COLC-02');
    assert.equal(line.reste.resultat, 40000);
    assert.equal(line.reste.formule_id, 'COL-F06');
    assert.equal(line.tauxConsommation.resultat, 0.6);
    assert.equal(line.alerte, 'none');
  });

  test('an overrun is a negative remainder, with alerts at 80 % and at 100 %', async () => {
    await setBudget({});
    await spend({ value: 85000, collectiveCategory: 'COLC-02' });
    assert.equal((await view()).body.budgets.budgets[0].alerte, 'warning');
    await spend({ value: 45000, collectiveCategory: 'COLC-02' });
    const body = (await view()).body.budgets;
    assert.equal(body.budgets[0].reste.resultat, -30000);
    assert.equal(body.budgets[0].alerte, 'exceeded');
    assert.equal(body.alertes.length, 1);
  });

  test('a cancelled or planned expense is not counted; spending with no envelope is said', async () => {
    await setBudget({});
    const cancelled = await spend({ value: 50000, collectiveCategory: 'COLC-02' });
    await t.request('POST', `/fin/espaces/${space.id}/depenses/${cancelled.body.expense.id}/annuler`, { user: owner, json: {} });
    await spend({ value: 20000, collectiveCategory: 'COLC-05' });
    const body = (await view()).body.budgets;
    assert.equal(body.budgets[0].spent, 0);
    assert.equal(body.horsBudget, 20000);
  });

  test('another month is another envelope', async () => {
    await setBudget({ period: month(new Date(Date.now() - 45 * DAY)) });
    assert.equal((await view()).body.budgets.budgets.length, 0);
  });

  test('QC-06: a common budget and its expenses change nothing in a personal budget', async () => {
    const personalBefore = await t.request('GET', '/fin/budgets', { user: owner });
    await setBudget({});
    await spend({ value: 60000, collectiveCategory: 'COLC-02' });
    const personalAfter = await t.request('GET', '/fin/budgets', { user: owner });
    assert.deepEqual(personalAfter.body, personalBefore.body);
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: owner.id } }), 0, 'no financial entry is written');
  });
});

describe('who may set an envelope', () => {
  test('a member reads but cannot set one; a stranger gets a 404', async () => {
    await setBudget({});
    assert.equal((await setBudget({ category: 'COLC-04' }, flatmate)).status, 403);
    assert.equal((await view(flatmate)).status, 200);
    const stranger = await t.user();
    assert.equal((await view(stranger)).status, 404);
    assert.equal((await setBudget({}, stranger)).status, 404);
  });

  test('an unknown category or a malformed month is refused', async () => {
    assert.equal((await setBudget({ category: 'COLC-99' })).status, 422);
    assert.equal((await setBudget({ period: '2026-13' })).status, 400);
  });

  test('deleting then setting again revives the same envelope', async () => {
    const first = (await setBudget({})).body.budget;
    assert.equal((await t.request('DELETE', `/fin/espaces/${space.id}/budgets/${first.id}`, { user: owner })).status, 200);
    assert.equal((await view()).body.budgets.budgets.length, 0);
    const again = (await setBudget({ value: 5000 })).body.budget;
    assert.equal(again.id, first.id);
    assert.equal((await view()).body.budgets.budgets[0].value, 5000);
  });
});

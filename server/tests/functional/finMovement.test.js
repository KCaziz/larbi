import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Movements (P8-07): the client's payment methods, tags that follow a
// category, duplicates asked before saving, and the clearing rate (AN-F004).

let t;
let user;

const daysAgo = (days) => new Date(Date.now() - days * 86_400_000).toISOString();
const categoryId = async (key) => (await t.prisma.finCategory.findFirst({ where: { key, userId: null }, select: { id: true } })).id;
const add = (json) => t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value: 100000, currency: 'DZD', occurredAt: daysAgo(1), ...json } });

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ name: 'Mouvements P8-07' });
});
after(() => t.close());

describe('P8-07 — the complete entry', () => {
  test('the client’s payment methods, a payer and a place are kept; an old value is refused', async () => {
    const res = await add({ paymentMethod: 'PM-06', payer: 'Ma sœur', place: 'Alger centre' });
    assert.equal(res.status, 201);
    assert.equal(res.body.transaction.paymentMethod, 'PM-06');
    assert.equal(res.body.transaction.payer, 'Ma sœur');
    assert.equal((await add({ paymentMethod: 'cash' })).status, 400);
  });

  test('a tag set to follow a category is applied to a new movement in it', async () => {
    const food = await categoryId('variable.alimentation_boissons');
    const tag = (await t.request('POST', '/fin/etiquettes', { user, json: { name: 'Courses', color: '#2563A6', autoCategoryId: food } })).body.tag;
    const res = await add({ categoryId: food });
    assert.equal(res.body.transaction.tagId, tag.id);
    // Filtered by tag, the list finds it.
    const list = await t.request('GET', `/fin/transactions?tagId=${tag.id}`, { user });
    assert.equal(list.body.total, 1);
  });

  test('a suspected duplicate is reported BEFORE saving, and nothing is written by the check', async () => {
    await add({ value: 250000 });
    const before = await t.prisma.finTransaction.count();
    const check = await t.request('POST', '/fin/transactions/doublons', { user, json: { kind: 'expense', value: 250000, currency: 'DZD', occurredAt: daysAgo(1) } });
    assert.equal(check.status, 200);
    assert.equal(check.body.duplicates.length, 1);
    assert.equal(await t.prisma.finTransaction.count(), before);
  });
});

describe('P8-07 — clearing (« pointage »)', () => {
  test('the rate is checked or reconciled over the real movements (AN-F004)', async () => {
    const ids = [];
    for (let i = 0; i < 4; i += 1) ids.push((await add({ value: 1000 * (i + 1) })).body.transaction.id);
    await t.request('PUT', `/fin/transactions/${ids[0]}/pointage`, { user, json: { clearing: 'checked' } });
    await t.request('PUT', `/fin/transactions/${ids[1]}/pointage`, { user, json: { clearing: 'reconciled' } });
    await t.request('PUT', `/fin/transactions/${ids[2]}/pointage`, { user, json: { clearing: 'to_verify' } });
    const view = (await t.request('GET', '/fin/pointage', { user })).body;
    assert.equal(view.taux.formule_id, 'AN-F004');
    assert.equal(view.taux.resultat, 0.5);
    assert.equal(view.pending.length, 2, 'the unchecked one and the one to verify');
  });

  test('clearing never changes a balance', async () => {
    const id = (await add({ value: 5000 })).body.transaction.id;
    const balance = async () => (await t.request('GET', '/fin/comptes', { user })).body.accounts[0].solde.resultat;
    const before = await balance();
    await t.request('PUT', `/fin/transactions/${id}/pointage`, { user, json: { clearing: 'reconciled' } });
    assert.equal(await balance(), before);
  });

  test('another person cannot clear a movement that is not theirs', async () => {
    const id = (await add({})).body.transaction.id;
    const other = await t.adult({ name: 'Curieux' });
    assert.equal((await t.request('PUT', `/fin/transactions/${id}/pointage`, { user: other, json: { clearing: 'checked' } })).status, 404);
  });
});

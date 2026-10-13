import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The safety reserve (P6-09) is this account's own money movements and its
// own chosen target: private, exactly like budgets, goals and debts.

let t;
let owner;
let intruder;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  intruder = await t.user();
});
after(() => t.close());

describe('the safety reserve', () => {
  test('requires a session', async () => {
    const res = await t.request('GET', '/fin/reserve');
    assert.equal(res.status, 401);
  });

  test("one account's chosen target never reads back on another's", async () => {
    await t.request('PUT', '/fin/reserve/cible', { user: owner, json: { targetMonths: 6 } });
    const theirs = await t.request('GET', '/fin/reserve', { user: intruder });
    assert.equal(theirs.body.cibleMois, null, "the intruder has not chosen a target of their own");
  });

  test('no target chosen is "non calculé", never 0', async () => {
    const res = await t.request('GET', '/fin/reserve', { user: owner });
    assert.equal(res.body.cibleMois, null);
    assert.equal(res.body.cibleMontant.resultat, null);
  });

  test('a negative or out-of-range target is refused', async () => {
    for (const targetMonths of [-1, 61]) {
      const res = await t.request('PUT', '/fin/reserve/cible', { user: owner, json: { targetMonths } });
      assert.equal(res.status, 400);
    }
  });
});

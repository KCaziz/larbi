import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Funding readiness (P6-16): never a credit score, never a prediction, never
// a guarantee — the client's own words, and the global index must never be a
// computed number since its weights are still "à valider" (P6-01).

let t;
let owner;
let other;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.adult();
  other = await t.adult();
});
after(() => t.close());

describe('funding readiness', () => {
  test('requires a session', async () => {
    const res = await t.request('GET', '/fin/financement/preparation');
    assert.equal(res.status, 401);
  });

  test('the global index is never a computed number, and the words "score de crédit" never appear', async () => {
    const res = await t.request('GET', '/fin/financement/preparation', { user: owner });
    assert.equal(res.status, 200);
    assert.equal(res.body.indiceGlobal.formula, 'F051');
    assert.equal(res.body.indiceGlobal.waitingOn, 'P6-01');
    assert.ok(!('resultat' in res.body.indiceGlobal), 'no computed figure hides behind the block');
    const text = JSON.stringify(res.body).toLowerCase();
    assert.ok(!text.includes('score de crédit') && !text.includes('score de credit') && !text.includes('credit score'));
  });

  test("stability is reported as a declared gap, never a guessed number", async () => {
    const res = await t.request('GET', '/fin/financement/preparation', { user: owner });
    assert.equal(res.body.dimensions.stability.formula, null);
  });

  test('completeness reflects what is actually declared, and only that', async () => {
    const before1 = await t.request('GET', '/fin/financement/preparation', { user: owner });
    const initialRatio = before1.body.dimensions.completeness.ratio;

    await t.request('PUT', '/fin/reserve/cible', { user: owner, json: { targetMonths: 3 } });

    const after1 = await t.request('GET', '/fin/financement/preparation', { user: owner });
    assert.ok(after1.body.dimensions.completeness.ratio > initialRatio, 'choosing a reserve target raises completeness');
    assert.ok(!after1.body.piecesManquantes.includes('reserveTarget'));
  });

  test("one account's readiness never reflects another account's data", async () => {
    await t.request('POST', '/fin/revenus', { user: owner, json: { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: new Date().toISOString() } });
    const res = await t.request('GET', '/fin/financement/preparation', { user: other });
    assert.ok(res.body.piecesManquantes.includes('income'), "the other account's own data has no income declared");
  });
});

describe('export', () => {
  test('is refused without explicit consent', async () => {
    const res = await t.request('POST', '/fin/financement/export', { user: owner, json: {} });
    assert.equal(res.status, 400);
  });

  test('is produced once consent is given, and carries the same blocked index', async () => {
    const res = await t.request('POST', '/fin/financement/export', { user: owner, json: { consent: true } });
    assert.equal(res.status, 200);
    assert.equal(res.body.export.indiceGlobal.formula, 'F051');
  });
});

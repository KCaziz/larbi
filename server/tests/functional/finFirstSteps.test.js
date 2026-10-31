import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// « Premiers pas » (P8-23): a step is done when its data exists, can be set
// aside (except the first), and the first income is entered once and read
// twice — as a resource and as a recurrence confirmed on the day.

let t;
let user;
const nextDate = new Date(Date.now() + 5 * 86_400_000).toISOString();

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ name: 'Premiers pas P8-23' });
});
after(() => t.close());

const state = async () => (await t.request('GET', '/fin/premiers-pas', { user })).body;
const stepOf = (body, key) => body.steps.find((step) => step.key === key);

describe('P8-23 — the eight steps', () => {
  test('a fresh account has nothing done, the next step is the first, and nothing blocks', async () => {
    const body = await state();
    assert.equal(body.steps.length, 8);
    assert.ok(body.steps.every((step) => !step.done));
    assert.equal(body.next, 'P0');
  });

  test('only the first step cannot be set aside; another can, and then the next one is offered', async () => {
    assert.equal((await t.request('PUT', '/fin/premiers-pas/etape', { user, json: { step: 'P0', skipped: true } })).status, 422);
    const res = await t.request('PUT', '/fin/premiers-pas/etape', { user, json: { step: 'P7', skipped: true } });
    assert.equal(res.status, 200);
    assert.equal(stepOf(res.body, 'P7').skipped, true);
    await t.request('PUT', '/fin/premiers-pas/etape', { user, json: { step: 'P7', skipped: false } });
    assert.equal(stepOf(await state(), 'P7').skipped, false);
  });
});

describe('P8-23 — the first income', () => {
  test('is entered once, becomes a resource AND a recurrence to confirm, and the salary is not credited yet', async () => {
    const res = await t.request('POST', '/fin/premiers-pas/revenu', {
      user,
      json: { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', nextDate },
    });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));
    assert.equal(res.body.recurrence.creationMode, 'confirm', 'à confirmer, the client’s recommendation for income');
    assert.equal(res.body.recurrence.weekendRule, 'previous', 'jour ouvré précédent, réponse C4');

    const body = await state();
    assert.equal(stepOf(body, 'P1').done, true);
    assert.equal(stepOf(body, 'P2').done, false, 'no account chosen yet');
    const synthesis = (await t.request('GET', '/fin/argent/synthese', { user })).body.synthese;
    assert.equal(synthesis.revenus.resultat, null, 'expected, not received');
    assert.equal(synthesis.revenusPrevus.resultat, 6000000);
  });

  test('another person sees none of it', async () => {
    await t.request('POST', '/fin/premiers-pas/revenu', { user, json: { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', nextDate } });
    const other = await t.adult({ name: 'Curieux' });
    const body = (await t.request('GET', '/fin/premiers-pas', { user: other })).body;
    assert.equal(stepOf(body, 'P1').done, false);
    assert.equal(body.salary, null);
  });
});

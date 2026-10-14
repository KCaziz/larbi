import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Common goals/envelopes, children and annual provisions (P6-15). These belong
// to the SPACE, not to one account, so the rule under test is the same as
// P6-14's: a space the caller is not a member of answers 404 on every route,
// and a viewer may read but never record.

let t;
let owner;
let flatmate;
let stranger;
let space;

const iso = (date) => date.toISOString();
const future = (days) => new Date(Date.now() + days * 24 * 3600 * 1000);

async function join(joiner, role = 'member') {
  const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role } });
  await t.request('POST', '/fin/espaces/rejoindre', { user: joiner, json: { token: invite.body.token } });
}

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  flatmate = await t.user();
  stranger = await t.user();
  const res = await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'household', label: 'Famille', currency: 'DZD' } });
  space = res.body.space;
  await join(flatmate, 'member');
});
after(() => t.close());

describe('common goals', () => {
  test('a space the caller is not in answers 404 on every route', async () => {
    const goal = await t.request('POST', `/fin/espaces/${space.id}/objectifs-communs`, { user: owner, json: { label: 'Vacances', target: 100000, currency: 'DZD' } });
    assert.equal(goal.status, 201);
    for (const [method, path, json] of [
      ['GET', `/fin/espaces/${space.id}/objectifs-communs`, undefined],
      ['POST', `/fin/espaces/${space.id}/objectifs-communs`, { label: 'X', target: 1000, currency: 'DZD' }],
      ['PATCH', `/fin/espaces/${space.id}/objectifs-communs/${goal.body.goal.id}`, { label: 'Y' }],
      ['DELETE', `/fin/espaces/${space.id}/objectifs-communs/${goal.body.goal.id}`, {}],
      ['POST', `/fin/espaces/${space.id}/objectifs-communs/${goal.body.goal.id}/contributions`, { amount: 100, contributedAt: iso(new Date()) }],
    ]) {
      const res = await t.request(method, path, { user: stranger, ...(json === undefined ? {} : { json }) });
      assert.equal(res.status, 404, `${method} ${path}`);
    }
  });

  test('a viewer reads but cannot create a goal or contribute', async () => {
    const viewer = await t.user();
    await join(viewer, 'viewer');
    const created = await t.request('POST', `/fin/espaces/${space.id}/objectifs-communs`, { user: viewer, json: { label: 'X', target: 1000, currency: 'DZD' } });
    assert.equal(created.status, 403);
    const list = await t.request('GET', `/fin/espaces/${space.id}/objectifs-communs`, { user: viewer });
    assert.equal(list.status, 200);
  });

  test('progress is built from actual contributions, never a free-floating number', async () => {
    const goal = await t.request('POST', `/fin/espaces/${space.id}/objectifs-communs`, { user: owner, json: { label: 'Vacances', target: 10000, currency: 'DZD' } });
    await t.request('POST', `/fin/espaces/${space.id}/objectifs-communs/${goal.body.goal.id}/contributions`, { user: owner, json: { amount: 3000, contributedAt: iso(new Date()) } });
    await t.request('POST', `/fin/espaces/${space.id}/objectifs-communs/${goal.body.goal.id}/contributions`, { user: flatmate, json: { amount: 2000, contributedAt: iso(new Date()) } });
    const res = await t.request('GET', `/fin/espaces/${space.id}/objectifs-communs`, { user: owner });
    const found = res.body.goals.find((g) => g.id === goal.body.goal.id);
    assert.equal(found.vue.allocated, 5000);
    assert.equal(found.vue.progres.resultat, 0.5);
  });

  test('only whoever contributed, or an admin, may remove a contribution', async () => {
    const goal = await t.request('POST', `/fin/espaces/${space.id}/objectifs-communs`, { user: owner, json: { label: 'Vacances', target: 10000, currency: 'DZD' } });
    const contribution = await t.request('POST', `/fin/espaces/${space.id}/objectifs-communs/${goal.body.goal.id}/contributions`, { user: owner, json: { amount: 1000, contributedAt: iso(new Date()) } });
    const res = await t.request('DELETE', `/fin/espaces/${space.id}/objectifs-communs/${goal.body.goal.id}/contributions/${contribution.body.contribution.id}`, { user: flatmate, json: {} });
    assert.equal(res.status, 403);
  });
});

describe('children', () => {
  test('minimal data only: no route accepts anything beyond first name, birth year and note', async () => {
    const res = await t.request('POST', `/fin/espaces/${space.id}/enfants`, { user: owner, json: { firstName: 'Amine', birthYear: 2015, lastName: 'Should not exist' } });
    assert.equal(res.status, 400);
  });

  test('a space the caller is not in answers 404', async () => {
    const child = await t.request('POST', `/fin/espaces/${space.id}/enfants`, { user: owner, json: { firstName: 'Amine', birthYear: 2015 } });
    assert.equal(child.status, 201);
    const res = await t.request('GET', `/fin/espaces/${space.id}/enfants`, { user: stranger });
    assert.equal(res.status, 404);
  });

  test('a viewer cannot add a child', async () => {
    const viewer = await t.user();
    await join(viewer, 'viewer');
    const res = await t.request('POST', `/fin/espaces/${space.id}/enfants`, { user: viewer, json: { firstName: 'Amine', birthYear: 2015 } });
    assert.equal(res.status, 403);
  });
});

describe('annual provisions', () => {
  test('a past target date is refused', async () => {
    const res = await t.request('POST', `/fin/espaces/${space.id}/provisions`, {
      user: owner,
      json: { label: 'Scolarité', plannedAmount: 50000, currency: 'DZD', targetDate: iso(new Date(Date.now() - 86400000)) },
    });
    assert.equal(res.status, 422);
  });

  test('the monthly figure divides what is left by the months left, and is not computed with zero months', async () => {
    const res = await t.request('POST', `/fin/espaces/${space.id}/provisions`, {
      user: owner,
      json: { label: 'Scolarité', plannedAmount: 12000, currency: 'DZD', targetDate: iso(future(60)), alreadyProvisioned: 0 },
    });
    assert.equal(res.status, 201);
    assert.ok(res.body.provision.vue.mensuelle.resultat > 0);
  });

  test('a space the caller is not in answers 404', async () => {
    const res = await t.request('GET', `/fin/espaces/${space.id}/provisions`, { user: stranger });
    assert.equal(res.status, 404);
  });
});

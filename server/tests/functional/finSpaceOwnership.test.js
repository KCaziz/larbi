import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Recette R2-01 and R2-02: who created a space is a person, said as such; and
// the owner — the only one who can delete the space — can hand it over.

let t;
let owner;
let other;
let space;
let ownerId;
let otherId;

const members = async (user) => (await t.request('GET', `/fin/espaces/${space.id}/membres`, { user })).body.membres;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  other = await t.user();
  space = (await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'couple', label: 'Nous deux', currency: 'DZD' } })).body.space;
  const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
  assert.equal((await t.request('POST', '/fin/espaces/rejoindre', { user: other, json: { token: invite.body.token } })).status, 201);
  const list = await members(owner);
  ownerId = list.find((m) => m.isMe).id;
  otherId = list.find((m) => !m.isMe).id;
});
after(async () => {
  await t.close();
});

describe('a space handed over (R2-02)', () => {
  test('the owner makes another member owner, and becomes admin', async () => {
    const res = await t.request('POST', `/fin/espaces/${space.id}/membres/${otherId}/proprietaire`, { user: owner, json: {} });
    assert.equal(res.status, 200);
    const roles = Object.fromEntries((await members(owner)).map((m) => [m.id, m.role]));
    assert.equal(roles[otherId], 'owner');
    assert.equal(roles[ownerId], 'admin');
  });

  test('only the owner hands the space over', async () => {
    const res = await t.request('POST', `/fin/espaces/${space.id}/membres/${ownerId}/proprietaire`, { user: other, json: {} });
    assert.equal(res.status, 403);
  });

  test('after the hand-over, only the new owner deletes the space, and the former one can leave', async () => {
    await t.request('POST', `/fin/espaces/${space.id}/membres/${otherId}/proprietaire`, { user: owner, json: {} });
    assert.equal((await t.request('DELETE', `/fin/espaces/${space.id}`, { user: owner, json: {} })).status, 403);
    assert.equal((await t.request('POST', `/fin/espaces/${space.id}/quitter`, { user: owner, json: {} })).status, 200);
    assert.equal((await t.request('DELETE', `/fin/espaces/${space.id}`, { user: other, json: {} })).status, 200);
  });

  test('a member who left cannot be made owner', async () => {
    await t.request('POST', `/fin/espaces/${space.id}/quitter`, { user: other, json: {} });
    assert.equal((await t.request('POST', `/fin/espaces/${space.id}/membres/${otherId}/proprietaire`, { user: owner, json: {} })).status, 404);
  });
});

describe('the activity names people, not the space (R2-01)', () => {
  test('the creation is the creator’s, with the space’s name beside it', async () => {
    const res = await t.request('GET', `/fin/espaces/${space.id}/activite`, { user: other });
    const created = res.body.activity.filter((row) => row.type === 'created');
    assert.equal(created.length, 1);
    assert.equal(created[0].id, ownerId);
    assert.equal(created[0].label, 'Nous deux');
    assert.notEqual(created[0].actor, 'Nous deux');
    assert.ok(res.body.activity.some((row) => row.type === 'member' && row.id === otherId));
  });
});

describe('an amount the database cannot keep is refused (R1-06)', () => {
  test('a goal above 21 474 836,47 DA is a 400, never a clamped figure', async () => {
    const res = await t.request('POST', '/fin/goals', { user: owner, json: { label: 'Trop', target: 99_999_999_999_900, currency: 'DZD' } });
    assert.equal(res.status, 400);
    const ok = await t.request('POST', '/fin/goals', { user: owner, json: { label: 'Maison', target: 2_147_483_647, currency: 'DZD', targetDate: null } });
    assert.equal(ok.status, 201);
    assert.equal(ok.body.goal.target, 2_147_483_647);
  });
});

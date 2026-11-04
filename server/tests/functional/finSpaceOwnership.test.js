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

describe('large amounts are kept exactly, and an amount beyond the limit is refused (R1-06, R1-10)', () => {
  test('a goal of 999 999 999 999 DA is stored as it was typed; one beyond 10^13 DA is a 400, never a clamped figure', async () => {
    const big = 99_999_999_999_900; // 999 999 999 999 DA, which a 32-bit column used to clamp to 21 474 836,47
    const ok = await t.request('POST', '/fin/goals', { user: owner, json: { label: 'Maison', target: big, currency: 'DZD', targetDate: null } });
    assert.equal(ok.status, 201, JSON.stringify(ok.body).slice(0, 200));
    assert.equal(ok.body.goal.target, big);
    const read = await t.request('GET', '/fin/goals', { user: owner });
    assert.equal(read.body.goals.find((goal) => goal.label === 'Maison').target, big, 'read back unchanged');
    const res = await t.request('POST', '/fin/goals', { user: owner, json: { label: 'Trop', target: 1_000_000_000_000_001, currency: 'DZD' } });
    assert.equal(res.status, 400);
  });

  test('sums of large amounts stay exact', async () => {
    const big = 99_999_999_999_901;
    for (const note of ['a', 'b']) {
      const made = await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value: big, currency: 'DZD', occurredAt: new Date(Date.now() - 3600_000).toISOString(), note } });
      assert.equal(made.status, 201, JSON.stringify(made.body).slice(0, 200));
    }
    const sum = await t.prisma.finTransaction.aggregate({ where: { userId: owner.id, kind: 'expense' }, _sum: { value: true } });
    assert.equal(sum._sum.value, big * 2);
  });
});

describe('one\'s own name in a space (R2-07)', () => {
  const rename = (user, displayName) => t.request('PUT', `/fin/espaces/${space.id}/mon-nom`, { user, json: { displayName } });
  const nameOf = async (user) => (await members(user)).find((m) => m.isMe).name;

  test('a member changes their own name, the others see it, and null gives back the account name', async () => {
    assert.equal((await rename(other, 'Sami')).status, 200);
    assert.equal(await nameOf(other), 'Sami');
    assert.equal((await members(owner)).find((m) => m.id === otherId).name, 'Sami');
    assert.equal((await rename(other, null)).status, 200);
    assert.notEqual(await nameOf(other), 'Sami');
  });

  test('the name of the space is refused: it is what made a creator look like the space', async () => {
    const res = await rename(owner, 'nous DEUX');
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'nameIsSpace');
  });

  test('somebody outside the space cannot reach it', async () => {
    const stranger = await t.user();
    assert.equal((await rename(stranger, 'X')).status, 404);
  });
});

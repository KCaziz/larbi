import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Shared expenses and settlements (P6-14), built on top of P6-13's spaces. The
// rule under test: a space the caller is not a member of answers 404 on every
// route, a viewer may read but never record, and nothing here can reveal an
// income a member withheld from the space.

let t;
let owner;
let flatmate;
let stranger;
let admin;
let space;
let ownerMemberId;
let flatmateMemberId;

const iso = (date) => date.toISOString();
const ago = (days) => new Date(Date.now() - days * 24 * 3600 * 1000);

async function join(joiner, role = 'member') {
  const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role } });
  const accepted = await t.request('POST', '/fin/espaces/rejoindre', { user: joiner, json: { token: invite.body.token } });
  assert.equal(accepted.status, 201);
}

async function memberId(user) {
  const res = await t.request('GET', `/fin/espaces/${space.id}/membres`, { user });
  return res.body.membres.find((m) => m.isMe).id;
}

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  flatmate = await t.user();
  stranger = await t.user();
  admin = await t.admin();
  const res = await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'flatshare', label: 'Coloc', currency: 'DZD' } });
  space = res.body.space;
  await join(flatmate, 'member');
  ownerMemberId = await memberId(owner);
  flatmateMemberId = await memberId(flatmate);
});
after(() => t.close());

describe('a space the caller is not in', () => {
  test('answers 404 on every shared-expense and settlement route', async () => {
    const expense = await t.request('POST', `/fin/espaces/${space.id}/depenses`, {
      user: owner,
      json: { label: 'Courses', value: 2000, occurredAt: iso(ago(1)), splitMode: 'equal', payerId: ownerMemberId, participants: [{ memberId: ownerMemberId }, { memberId: flatmateMemberId }] },
    });
    assert.equal(expense.status, 201);

    for (const [method, path, json] of [
      ['GET', `/fin/espaces/${space.id}/depenses`, undefined],
      ['POST', `/fin/espaces/${space.id}/depenses`, { label: 'X', value: 100, occurredAt: iso(ago(1)), splitMode: 'equal', payerId: ownerMemberId, participants: [{ memberId: ownerMemberId }] }],
      ['DELETE', `/fin/espaces/${space.id}/depenses/${expense.body.expense.id}`, {}],
      ['GET', `/fin/espaces/${space.id}/depenses/${expense.body.expense.id}/historique`, undefined],
      ['GET', `/fin/espaces/${space.id}/reglements`, undefined],
      ['POST', `/fin/espaces/${space.id}/reglements`, { fromId: ownerMemberId, toId: flatmateMemberId, value: 100, settledAt: iso(ago(1)) }],
      ['GET', `/fin/espaces/${space.id}/soldes`, undefined],
    ]) {
      const res = await t.request(method, path, { user: stranger, ...(json === undefined ? {} : { json }) });
      assert.equal(res.status, 404, `${method} ${path}`);
    }
  });

  test('is not reachable by an administrator either', async () => {
    const res = await t.request('GET', `/fin/espaces/${space.id}/soldes`, { user: admin });
    assert.equal(res.status, 404);
  });
});

describe('recording requires at least a member role', () => {
  test('a viewer reads but cannot record an expense or a settlement', async () => {
    const viewer = await t.user();
    await join(viewer, 'viewer');
    const viewerMemberId = await memberId(viewer);

    const expense = await t.request('POST', `/fin/espaces/${space.id}/depenses`, {
      user: viewer,
      json: { label: 'Courses', value: 1000, occurredAt: iso(ago(1)), splitMode: 'equal', payerId: ownerMemberId, participants: [{ memberId: ownerMemberId }] },
    });
    assert.equal(expense.status, 403);

    const settlement = await t.request('POST', `/fin/espaces/${space.id}/reglements`, {
      user: viewer,
      json: { fromId: viewerMemberId, toId: ownerMemberId, value: 500, settledAt: iso(ago(1)) },
    });
    assert.equal(settlement.status, 403);

    const balances = await t.request('GET', `/fin/espaces/${space.id}/soldes`, { user: viewer });
    assert.equal(balances.status, 200, 'a viewer still reads the space');
  });
});

describe('the shares always add up to the amount', () => {
  test('a participant listed twice is refused rather than silently deduplicated', async () => {
    const res = await t.request('POST', `/fin/espaces/${space.id}/depenses`, {
      user: owner,
      json: { label: 'Internet', value: 1000, occurredAt: iso(ago(1)), splitMode: 'equal', payerId: ownerMemberId, participants: [{ memberId: ownerMemberId }, { memberId: ownerMemberId }] },
    });
    assert.equal(res.status, 422);
  });

  test('a percent split that does not add up to 100% is refused', async () => {
    const res = await t.request('POST', `/fin/espaces/${space.id}/depenses`, {
      user: owner,
      json: {
        label: 'Loyer',
        value: 10000,
        occurredAt: iso(ago(1)),
        splitMode: 'percent',
        payerId: ownerMemberId,
        participants: [{ memberId: ownerMemberId, weight: 3000 }, { memberId: flatmateMemberId, weight: 3000 }],
      },
    });
    assert.equal(res.status, 422);
  });
});

describe('the income-proportional split needs consent', () => {
  test('is refused, naming the member, when a participant has not shared their income', async () => {
    const res = await t.request('POST', `/fin/espaces/${space.id}/depenses`, {
      user: owner,
      json: { label: 'Loyer', value: 10000, occurredAt: iso(ago(1)), splitMode: 'income_proportional', payerId: ownerMemberId, participants: [{ memberId: ownerMemberId }, { memberId: flatmateMemberId }] },
    });
    assert.equal(res.status, 422);
    assert.ok(JSON.stringify(res.body).includes(flatmateMemberId));
  });
});

describe('deleting an expense or a settlement', () => {
  test('a member who is neither the payer, the recorder, nor an admin cannot delete it', async () => {
    const other = await t.user();
    await join(other, 'member');
    const expense = await t.request('POST', `/fin/espaces/${space.id}/depenses`, {
      user: owner,
      json: { label: 'Courses', value: 1000, occurredAt: iso(ago(1)), splitMode: 'equal', payerId: ownerMemberId, participants: [{ memberId: ownerMemberId }, { memberId: flatmateMemberId }] },
    });
    const res = await t.request('DELETE', `/fin/espaces/${space.id}/depenses/${expense.body.expense.id}`, { user: other, json: {} });
    assert.equal(res.status, 403);
  });
});

describe('balances', () => {
  test('always sum to zero across the space', async () => {
    await t.request('POST', `/fin/espaces/${space.id}/depenses`, {
      user: owner,
      json: { label: 'Courses', value: 3000, occurredAt: iso(ago(1)), splitMode: 'equal', payerId: ownerMemberId, participants: [{ memberId: ownerMemberId }, { memberId: flatmateMemberId }] },
    });
    const res = await t.request('GET', `/fin/espaces/${space.id}/soldes`, { user: owner });
    const total = res.body.soldes.reduce((sum, row) => sum + row.solde.resultat, 0);
    assert.equal(total, 0);
  });
});

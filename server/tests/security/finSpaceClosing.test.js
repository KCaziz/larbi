import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P9-03: the « group / friends » space and its closing (SP-04, rule B3). Once
// the owner closes it, NOTHING is written in it — through any route — while the
// history, balances, report and export stay readable. Withdrawing consent and
// leaving remain possible: closing a space never traps a person's data.

let t;
let owner;
let friend;
let space;
let ownerId;
let friendId;
let expenseId;
let taskId;
let goalId;

const DAY = 24 * 3600 * 1000;
const iso = (date) => date.toISOString();

async function memberId(user) {
  const res = await t.request('GET', `/fin/espaces/${space.id}/membres`, { user });
  return res.body.membres.find((m) => m.isMe).id;
}
const api = (method, path, json, user = owner) => t.request(method, `/fin/espaces/${space.id}${path}`, { user, ...(json === undefined ? {} : { json }) });

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  friend = await t.user();
  const created = await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'group', label: 'Voyage à Djanet', currency: 'DZD' } });
  assert.equal(created.status, 201, JSON.stringify(created.body).slice(0, 200));
  space = created.body.space;
  const invite = await api('POST', '/invitations', { role: 'member' });
  await t.request('POST', '/fin/espaces/rejoindre', { user: friend, json: { token: invite.body.token } });
  ownerId = await memberId(owner);
  friendId = await memberId(friend);
  const parts = [{ memberId: ownerId }, { memberId: friendId }];
  expenseId = (await api('POST', '/depenses', { label: 'Location', value: 600000, occurredAt: iso(new Date(Date.now() - DAY)), splitMode: 'equal', payerId: ownerId, participants: parts })).body.expense.id;
  taskId = (await api('POST', '/taches', { title: 'Réserver', category: 'project', assigneeId: ownerId })).body.task.id;
  goalId = (await api('POST', '/objectifs-communs', { label: 'Cadeau', target: 1000000, currency: 'DZD' })).body.goal?.id;
});
after(() => t.close());

describe('a group space', () => {
  test('is a fourth kind of space, created like the others', async () => {
    assert.equal(space.kind, 'group');
    assert.equal(space.closedAt ?? null, null);
  });
});

describe('closing', () => {
  test('only the owner closes, once, and a member cannot', async () => {
    assert.equal((await api('POST', '/cloturer', {}, friend)).status, 403);
    assert.equal((await api('POST', '/cloturer', {})).status, 200);
    assert.equal((await api('POST', '/cloturer', {})).status, 409);
  });

  test('every write is refused with 423, whichever route it goes through', async () => {
    assert.equal((await api('POST', '/cloturer', {})).status, 200);
    const parts = [{ memberId: ownerId }, { memberId: friendId }];
    const writes = [
      ['POST', '/depenses', { label: 'X', value: 1000, occurredAt: iso(new Date(Date.now() - DAY)), splitMode: 'equal', payerId: ownerId, participants: parts }],
      ['POST', `/depenses/${expenseId}/annuler`, {}],
      ['DELETE', `/depenses/${expenseId}`, {}],
      ['POST', '/reglements', { fromId: friendId, toId: ownerId, value: 1000, settledAt: iso(new Date(Date.now() - DAY)) }],
      ['PUT', '/budgets', { category: 'COLC-02', period: new Date().toISOString().slice(0, 7), value: 1000 }],
      ['POST', '/taches', { title: 'Y', category: 'project', assigneeId: ownerId }],
      ['PATCH', `/taches/${taskId}`, { priority: 'urgent' }],
      ['POST', `/taches/${taskId}/terminer`, undefined],
      ['POST', '/ressources', { kind: 'other', value: 1000, occurredAt: iso(new Date(Date.now() - DAY)) }],
      ['POST', '/objectifs-communs', { label: 'Z', target: 1000, currency: 'DZD' }],
      ['POST', '/invitations', { role: 'member' }],
      ['PATCH', '', { label: 'Renommé' }],
      ['PUT', `/membres/${friendId}/role`, { role: 'admin' }],
    ];
    for (const [method, path, json] of writes) {
      const res = await api(method, path, json, owner);
      assert.equal(res.status, 423, `${method} ${path} → ${res.status} ${JSON.stringify(res.body).slice(0, 120)}`);
    }
    // the same for a member
    const asMember = await api('POST', '/depenses', { label: 'X', value: 1000, occurredAt: iso(new Date(Date.now() - DAY)), splitMode: 'equal', payerId: friendId, participants: parts }, friend);
    assert.equal(asMember.status, 423);
    void goalId;
  });

  test('a pending invitation is revoked, and an invitation already given is no longer accepted', async () => {
    const pending = await api('POST', '/invitations', { role: 'member' });
    await api('POST', '/cloturer', {});
    const late = await t.user();
    const res = await t.request('POST', '/fin/espaces/rejoindre', { user: late, json: { token: pending.body.token } });
    assert.ok([404, 410, 422, 423].includes(res.status), `status ${res.status}`);
    assert.equal(await t.prisma.finSpaceMember.count({ where: { spaceId: space.id, userId: late.id } }), 0);
  });

  test('history, balances, calendar, report, activity and export stay readable', async () => {
    await api('POST', '/cloturer', {});
    for (const path of ['/depenses', '/soldes', '/taches', '/calendrier', '/rapport', '/activite', '/ressources', '/budgets', '']) {
      const res = await api('GET', path, undefined, friend);
      assert.equal(res.status, 200, `GET ${path} → ${res.status}`);
    }
    assert.equal((await api('POST', '/export', { consent: true })).status, 200);
    const balances = (await api('GET', '/soldes', undefined, friend)).body.soldes;
    assert.equal(balances.find((b) => b.memberId === ownerId).solde.resultat, 300000, 'the balances are still there');
  });

  test('a person can still withdraw what they share and leave; the owner can still delete', async () => {
    await api('POST', '/cloturer', {});
    assert.equal((await api('PUT', '/mon-partage', { incomes: 'private' }, friend)).status, 200);
    assert.equal((await api('POST', '/quitter', {}, friend)).status, 200);
    assert.equal((await t.request('DELETE', `/fin/espaces/${space.id}`, { user: owner, json: {} })).status, 200);
  });

  test('the closing is traced', async () => {
    await api('POST', '/cloturer', { reason: 'voyage terminé' });
    const trail = await t.prisma.finChange.findMany({ where: { entityId: space.id, field: 'closedAt' } });
    assert.equal(trail.length, 1);
    assert.equal(trail[0].reason, 'voyage terminé');
  });
});

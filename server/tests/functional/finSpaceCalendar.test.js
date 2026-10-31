import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P9-07: the unified calendar of a space — bills, tasks, settlements, goals —
// filterable, read-only. A planned bill stays planned until confirmed.

let t;
let owner;
let flatmate;
let space;
let ownerId;
let flatmateId;

const month = () => new Date().toISOString().slice(0, 7);
const at = (day) => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), day, 12)).toISOString();

async function memberId(user) {
  const res = await t.request('GET', `/fin/espaces/${space.id}/membres`, { user });
  return res.body.membres.find((m) => m.isMe).id;
}
const calendar = (query = '', user = owner) => t.request('GET', `/fin/espaces/${space.id}/calendrier?mois=${month()}${query}`, { user });

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  flatmate = await t.user();
  space = (await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'flatshare', label: 'Coloc', currency: 'DZD' } })).body.space;
  const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
  await t.request('POST', '/fin/espaces/rejoindre', { user: flatmate, json: { token: invite.body.token } });
  ownerId = await memberId(owner);
  flatmateId = await memberId(flatmate);

  const parts = [{ memberId: ownerId }, { memberId: flatmateId }];
  await t.request('POST', `/fin/espaces/${space.id}/depenses`, { user: owner, json: { label: 'Loyer', value: 4000000, occurredAt: at(28), planned: true, splitMode: 'equal', payerId: ownerId, participants: parts } });
  await t.request('POST', `/fin/espaces/${space.id}/taches`, { user: owner, json: { title: 'Ménage', category: 'household', assigneeId: ownerId, dueDate: at(12) } });
  await t.request('POST', `/fin/espaces/${space.id}/objectifs-communs`, { user: owner, json: { label: 'Voyage', target: 10000000, currency: 'DZD', targetDate: at(20) } });
});
after(() => t.close());

describe('the calendar of a space', () => {
  test('one timeline, in date order, with the four kinds', async () => {
    const res = await calendar();
    assert.equal(res.status, 200, JSON.stringify(res.body).slice(0, 200));
    const events = res.body.calendrier.events;
    assert.deepEqual(events.map((e) => e.type), ['tasks', 'goals', 'bills']);
  });

  test('a planned bill stays planned, then reads as confirmed once it is a real expense', async () => {
    const bill = (await calendar('&types=bills')).body.calendrier.events[0];
    assert.equal(bill.status, 'planned');
    await t.prisma.finSharedExpense.update({ where: { id: bill.id }, data: { lifecycle: 'done', occurredAt: new Date(Date.now() - 3600 * 1000) } });
    const after = (await calendar('&types=bills')).body.calendrier.events;
    assert.equal(after.length, 1, 'the same row: no duplicate');
    assert.equal(after[0].status, 'confirmed');
  });

  test('filters keep only the kinds asked for; an unknown kind is refused', async () => {
    assert.deepEqual((await calendar('&types=tasks')).body.calendrier.events.map((e) => e.type), ['tasks']);
    assert.equal((await calendar('&types=weather')).status, 400);
  });

  test('a cancelled bill and a cancelled task are not on it', async () => {
    const bill = (await calendar('&types=bills')).body.calendrier.events[0];
    await t.request('POST', `/fin/espaces/${space.id}/depenses/${bill.id}/annuler`, { user: owner, json: {} });
    assert.equal((await calendar('&types=bills')).body.calendrier.events.length, 0);
  });

  test('it is a read: nothing is created, and a stranger gets a 404', async () => {
    const before = await t.prisma.finSharedExpense.count();
    await calendar();
    assert.equal(await t.prisma.finSharedExpense.count(), before);
    assert.equal((await calendar('', await t.user())).status, 404);
  });
});

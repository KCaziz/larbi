import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { nextOccurrence } from '../../src/services/finSpaceTask.service.js';

// P9-06: tasks of a space (COL-F11, COL-F12, ALG-C04, QC-07). A task is linked
// to a bill for information only and never creates a financial movement.

let t;
let owner;
let flatmate;
let space;
let ownerId;
let flatmateId;

const month = () => new Date().toISOString().slice(0, 7);
// Noon on the 10th of this month: inside the month whatever day the test runs.
const dueThisMonth = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 10, 12)).toISOString();

async function memberId(user) {
  const res = await t.request('GET', `/fin/espaces/${space.id}/membres`, { user });
  return res.body.membres.find((m) => m.isMe).id;
}
const create = (json, user = owner) =>
  t.request('POST', `/fin/espaces/${space.id}/taches`, { user, json: { title: 'Sortir les poubelles', category: 'household', assigneeId: ownerId, ...json } });
const stats = () => t.request('GET', `/fin/espaces/${space.id}/taches-synthese?mois=${month()}`, { user: owner });

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  flatmate = await t.user();
  space = (await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'flatshare', label: 'Coloc', currency: 'DZD' } })).body.space;
  const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
  assert.equal((await t.request('POST', '/fin/espaces/rejoindre', { user: flatmate, json: { token: invite.body.token } })).status, 201);
  ownerId = await memberId(owner);
  flatmateId = await memberId(flatmate);
});
after(() => t.close());

describe('tasks of a space', () => {
  test('a task has the client’s defaults: normal priority, no recurrence, weight 1, to do', async () => {
    const res = await create({});
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));
    assert.deepEqual(
      [res.body.task.priority, res.body.task.recurrence, res.body.task.weight, res.body.task.status],
      ['normal', 'none', 1, 'todo'],
    );
  });

  test('the person in charge and the participants must be members; the weight is 1, 2 or 3', async () => {
    const stranger = await t.user();
    const strangerSpace = (await t.request('POST', '/fin/espaces', { user: stranger, json: { kind: 'couple', label: 'Autre', currency: 'DZD' } })).body.space;
    const outsider = (await t.request('GET', `/fin/espaces/${strangerSpace.id}/membres`, { user: stranger })).body.membres[0].id;
    assert.equal((await create({ assigneeId: outsider })).status, 422);
    assert.equal((await create({ participants: [outsider] })).status, 422);
    assert.equal((await create({ weight: 4 })).status, 400);
  });

  test('a recurring task needs a date, and finishing it brings back the next occurrence, checklist unticked', async () => {
    assert.equal((await create({ recurrence: 'weekly' })).status, 400);
    const task = (await create({ recurrence: 'weekly', dueDate: dueThisMonth(), checklist: [{ label: 'Verre', done: true }] })).body.task;
    const done = await t.request('POST', `/fin/espaces/${space.id}/taches/${task.id}/terminer`, { user: owner });
    assert.equal(done.status, 200, JSON.stringify(done.body).slice(0, 200));
    assert.equal(done.body.task.status, 'done');
    assert.equal(done.body.next.status, 'todo');
    assert.equal(new Date(done.body.next.dueDate).getTime() - new Date(task.dueDate).getTime(), 7 * 24 * 3600 * 1000);
    assert.equal(done.body.next.checklist[0].done, false);
    assert.equal((await t.request('POST', `/fin/espaces/${space.id}/taches/${task.id}/terminer`, { user: owner })).status, 409);
  });

  test('QC-07: linking a task to an expense, and finishing it, writes no financial movement', async () => {
    const expense = (
      await t.request('POST', `/fin/espaces/${space.id}/depenses`, {
        user: owner,
        json: { label: 'Internet', value: 300000, occurredAt: new Date(Date.now() - 86400000).toISOString(), splitMode: 'equal', payerId: ownerId, participants: [{ memberId: ownerId }, { memberId: flatmateId }] },
      })
    ).body.expense;
    const expensesBefore = await t.prisma.finSharedExpense.count();
    const task = (await create({ title: 'Payer Internet', category: 'bills', linkedExpenseId: expense.id })).body.task;
    assert.equal((await t.request('POST', `/fin/espaces/${space.id}/taches/${task.id}/terminer`, { user: owner })).status, 200);
    assert.equal(await t.prisma.finSharedExpense.count(), expensesBefore, 'no shared expense created');
    assert.equal(await t.prisma.finTransaction.count(), 0, 'no personal movement created');
  });

  test('somebody who is not concerned cannot change a task; a stranger sees nothing', async () => {
    const task = (await create({})).body.task;
    const third = await t.user();
    const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
    await t.request('POST', '/fin/espaces/rejoindre', { user: third, json: { token: invite.body.token } });
    assert.equal((await t.request('PATCH', `/fin/espaces/${space.id}/taches/${task.id}`, { user: third, json: { status: 'doing' } })).status, 403);
    const stranger = await t.user();
    assert.equal((await t.request('GET', `/fin/espaces/${space.id}/taches`, { user: stranger })).status, 404);
  });

  test('a change is traced', async () => {
    const task = (await create({})).body.task;
    await t.request('PATCH', `/fin/espaces/${space.id}/taches/${task.id}`, { user: owner, json: { priority: 'urgent', reason: 'la collecte change' } });
    const trail = await t.prisma.finChange.findMany({ where: { entity: 'spaceTask', entityId: task.id, field: 'priority' } });
    assert.equal(trail.length, 1);
  });
});

describe('the figures (COL-F11 / COL-F12)', () => {
  test('the completion rate and the share of the load, as findings', async () => {
    const a = (await create({ dueDate: dueThisMonth(), weight: 1 })).body.task;
    await create({ dueDate: dueThisMonth(), weight: 3, assigneeId: flatmateId });
    await create({ dueDate: dueThisMonth(), weight: 2, assigneeId: flatmateId });
    await t.request('POST', `/fin/espaces/${space.id}/taches/${a.id}/terminer`, { user: owner });

    const body = (await stats()).body.synthese;
    assert.equal(body.tauxTerminees.formule_id, 'COL-F11');
    assert.equal(body.tauxTerminees.resultat, 1 / 3);
    const load = Object.fromEntries(body.charge.map((row) => [row.memberId, row.charge.resultat]));
    assert.equal(load[ownerId], 1 / 6);
    assert.equal(load[flatmateId], 5 / 6);
  });

  test('without any task the rate is not computed, never 0', async () => {
    const body = (await stats()).body.synthese;
    assert.equal(body.tauxTerminees.resultat, null);
    assert.ok(body.charge.every((row) => row.charge.resultat === null));
  });

  test('a cancelled task counts for neither', async () => {
    const task = (await create({ dueDate: dueThisMonth() })).body.task;
    await t.request('PATCH', `/fin/espaces/${space.id}/taches/${task.id}`, { user: owner, json: { status: 'cancelled' } });
    assert.equal((await stats()).body.synthese.tauxTerminees.resultat, null);
  });
});

describe('ALG-C04', () => {
  test('monthly keeps the day, clamped to the end of a short month', () => {
    assert.equal(nextOccurrence(new Date('2026-01-31T10:00:00Z'), 'monthly').toISOString(), '2026-02-28T10:00:00.000Z');
    assert.equal(nextOccurrence(new Date('2026-12-15T10:00:00Z'), 'monthly').toISOString(), '2027-01-15T10:00:00.000Z');
    assert.equal(nextOccurrence(new Date('2026-03-01T10:00:00Z'), 'daily').toISOString(), '2026-03-02T10:00:00.000Z');
    assert.equal(nextOccurrence(new Date('2026-03-01T10:00:00Z'), 'none'), null);
  });
});

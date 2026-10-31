import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P9-09: the common pot (client rule A1), the required contribution as a
// proposal (COL-F08), the alerts of a space, and its recent activity.

let t;
let owner;
let flatmate;
let space;
let ownerId;
let flatmateId;

const DAY = 24 * 3600 * 1000;
const iso = (date) => date.toISOString();
const ago = (days) => new Date(Date.now() - days * DAY);
const inDays = (days) => new Date(Date.now() + days * DAY);
const month = () => new Date().toISOString().slice(0, 7);

async function memberId(user) {
  const res = await t.request('GET', `/fin/espaces/${space.id}/membres`, { user });
  return res.body.membres.find((m) => m.isMe).id;
}
const inflow = (json, user = owner) => t.request('POST', `/fin/espaces/${space.id}/ressources`, { user, json: { kind: 'other', value: 100000, occurredAt: iso(ago(1)), ...json } });
const pot = (user = owner) => t.request('GET', `/fin/espaces/${space.id}/ressources`, { user });
const spend = (json) =>
  t.request('POST', `/fin/espaces/${space.id}/depenses`, {
    user: owner,
    json: { label: 'Facture', value: 100000, occurredAt: iso(ago(1)), splitMode: 'equal', payerId: ownerId, participants: [{ memberId: ownerId }, { memberId: flatmateId }], ...json },
  });
const notifications = async (user, type) => (await t.request('GET', '/fin/notifications', { user })).body.notifications.filter((n) => n.type === type);

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

describe('the common pot (rule A1)', () => {
  test('resources = opening + confirmed contributions + other entries; the balance = resources − realised expenses', async () => {
    await inflow({ kind: 'opening', value: 1000000 });
    await inflow({ kind: 'contribution', memberId: ownerId, value: 300000 });
    await inflow({ kind: 'other', value: 50000 });
    await spend({ value: 400000 });
    const body = (await pot()).body.ressources;
    assert.equal(body.resources.montant, 1350000);
    assert.equal(body.soldeGroupe.resultat, 950000);
  });

  test('a planned contribution counts for nothing, until it is confirmed', async () => {
    const planned = await inflow({ kind: 'contribution', memberId: flatmateId, value: 200000, planned: true, occurredAt: iso(inDays(3)) }, flatmate);
    assert.equal(planned.status, 201, JSON.stringify(planned.body).slice(0, 200));
    const before = (await pot()).body.ressources;
    assert.equal(before.resources.montant, 0);
    assert.equal(before.contributionsPrevues, 200000);
    const confirm = await t.request('POST', `/fin/espaces/${space.id}/ressources/${planned.body.entree.id}/confirmer`, { user: flatmate });
    assert.equal(confirm.status, 200);
    assert.equal((await pot()).body.ressources.resources.montant, 200000);
  });

  test('a cancelled or planned expense does not reduce the balance', async () => {
    await inflow({ kind: 'opening', value: 500000 });
    await spend({ value: 100000, planned: true, occurredAt: iso(inDays(4)) });
    assert.equal((await pot()).body.ressources.soldeGroupe.resultat, 500000);
  });

  test('only an administrator sets the opening balance; a member records their own contribution only', async () => {
    assert.equal((await inflow({ kind: 'opening', value: 10000 }, flatmate)).status, 403);
    assert.equal((await inflow({ kind: 'contribution', memberId: ownerId, value: 10000 }, flatmate)).status, 403);
    assert.equal((await inflow({ kind: 'contribution', memberId: flatmateId, value: 10000 }, flatmate)).status, 201);
    assert.equal((await inflow({ kind: 'contribution', value: 10000 })).status, 422, 'a contribution says who makes it');
  });
});

describe('the required contribution (COL-F08)', () => {
  test('is a proposal: the need beyond the resources, shared by the rule, and nothing is written', async () => {
    await inflow({ kind: 'opening', value: 400000 });
    const before = await t.prisma.finSpaceInflow.count();
    const res = await t.request('GET', `/fin/espaces/${space.id}/contribution-requise?besoin=1000000`, { user: owner });
    assert.equal(res.status, 200, JSON.stringify(res.body).slice(0, 200));
    const c = res.body.contribution;
    assert.equal(c.proposition, true);
    assert.equal(c.contributionRequise.formule_id, 'COL-F08');
    assert.equal(c.contributionRequise.resultat, 600000);
    assert.deepEqual(c.parts.map((p) => p.part), [300000, 300000]);
    assert.equal(await t.prisma.finSpaceInflow.count(), before);
    assert.equal(await t.prisma.finTransaction.count(), 0, 'no personal account is touched');
  });

  test('a need already covered asks for nothing — a true zero', async () => {
    await inflow({ kind: 'opening', value: 900000 });
    const c = (await t.request('GET', `/fin/espaces/${space.id}/contribution-requise?besoin=500000`, { user: owner })).body.contribution;
    assert.equal(c.contributionRequise.resultat, 0);
    assert.deepEqual(c.parts.map((p) => p.part), [0, 0]);
  });
});

describe('alerts', () => {
  test('a new expense tells the others, not its author', async () => {
    await spend({});
    assert.equal((await notifications(flatmate, 'space_expense')).length, 1);
    assert.equal((await notifications(owner, 'space_expense')).length, 0);
  });

  test('a budget crossing 80 % then 100 % tells everybody, once per level', async () => {
    await t.request('PUT', `/fin/espaces/${space.id}/budgets`, { user: owner, json: { category: 'COLC-02', period: month(), value: 100000 } });
    await spend({ value: 85000, collectiveCategory: 'COLC-02' });
    await spend({ value: 1000, collectiveCategory: 'COLC-02' });
    assert.equal((await notifications(flatmate, 'space_budget')).length, 1, 'same level, not repeated');
    await spend({ value: 20000, collectiveCategory: 'COLC-02' });
    const levels = (await notifications(flatmate, 'space_budget')).map((n) => n.params.niveau).sort();
    assert.deepEqual(levels, ['exceeded', 'warning']);
    assert.equal((await notifications(owner, 'space_budget')).length, 2, 'the author of the expense is told of the envelope too');
  });

  test('a settlement tells the other party only', async () => {
    const res = await t.request('POST', `/fin/espaces/${space.id}/reglements`, { user: owner, json: { fromId: ownerId, toId: flatmateId, value: 50000, settledAt: iso(ago(1)) } });
    assert.equal(res.status, 201);
    assert.equal((await notifications(flatmate, 'space_settlement')).length, 1);
    assert.equal((await notifications(owner, 'space_settlement')).length, 0);
  });

  test('somebody joining or leaving, and a role change, are told to those concerned', async () => {
    assert.equal((await notifications(owner, 'space_member')).length, 1, 'the owner learns the flatmate joined');
    await t.request('PUT', `/fin/espaces/${space.id}/membres/${flatmateId}/role`, { user: owner, json: { role: 'admin' } });
    assert.equal((await notifications(flatmate, 'space_permission')).length, 1);
    assert.equal((await notifications(owner, 'space_permission')).length, 0);
    await t.request('POST', `/fin/espaces/${space.id}/quitter`, { user: flatmate, json: {} });
    assert.equal((await notifications(owner, 'space_member')).length, 2);
  });

  test('a bill at J-3, a task due soon and an overdue one are raised when alerts are generated', async () => {
    await spend({ label: 'Internet', planned: true, occurredAt: iso(new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() + 3, 12))) });
    await t.request('POST', `/fin/espaces/${space.id}/taches`, { user: owner, json: { title: 'Ménage', category: 'household', assigneeId: ownerId, dueDate: iso(ago(2)) } });
    const listed = await t.request('GET', '/fin/notifications', { user: owner });
    assert.equal(listed.status, 200);
    const types = listed.body.notifications.map((n) => [n.type, n.params.niveau ?? n.params.days]);
    assert.ok(types.some(([type, days]) => type === 'space_bill' && days === 3), JSON.stringify(types));
    assert.ok(types.some(([type, level]) => type === 'space_task' && level === 'overdue'), JSON.stringify(types));
  });
});

describe('recent activity', () => {
  test('lists what the space holds in common, newest first, and every member reads the same', async () => {
    await spend({ label: 'Courses' });
    await t.request('POST', `/fin/espaces/${space.id}/taches`, { user: owner, json: { title: 'Ménage', category: 'household', assigneeId: ownerId } });
    const asOwner = (await t.request('GET', `/fin/espaces/${space.id}/activite`, { user: owner })).body.activity;
    const asFlatmate = (await t.request('GET', `/fin/espaces/${space.id}/activite`, { user: flatmate })).body.activity;
    assert.deepEqual(asOwner.map((a) => a.id), asFlatmate.map((a) => a.id));
    assert.ok(asOwner.some((a) => a.type === 'expense' && a.label === 'Courses'));
    assert.ok(asOwner.some((a) => a.type === 'task'));
    assert.ok(asOwner.some((a) => a.type === 'member'));
    for (let i = 1; i < asOwner.length; i += 1) assert.ok(new Date(asOwner[i - 1].at) >= new Date(asOwner[i].at));
  });

  test('never carries a personal account, and a stranger gets a 404', async () => {
    const acc = (await t.request('POST', '/fin/comptes', { user: owner, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 1000000, openingDate: iso(ago(30)) } })).body.account;
    await spend({ personalLink: { accountId: acc.id } });
    const body = JSON.stringify((await t.request('GET', `/fin/espaces/${space.id}/activite`, { user: flatmate })).body);
    assert.ok(!body.includes(acc.id) && !body.includes('personalTransactionId'));
    assert.equal((await t.request('GET', `/fin/espaces/${space.id}/activite`, { user: await t.user() })).status, 404);
  });
});

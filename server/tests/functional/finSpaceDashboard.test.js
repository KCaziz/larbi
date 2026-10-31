import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P9-02: the dashboard of a space (tab 03, CD-01 to CD-08): one request, every
// block a figure the server computed, nothing private in it.

let t;
let owner;
let flatmate;
let space;
let ownerId;
let flatmateId;

const DAY = 24 * 3600 * 1000;
const month = () => new Date().toISOString().slice(0, 7);
const at = (day) => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), day, 12)).toISOString();
const inDays = (days) => new Date(Date.now() + days * DAY).toISOString();

async function memberId(user) {
  const res = await t.request('GET', `/fin/espaces/${space.id}/membres`, { user });
  return res.body.membres.find((m) => m.isMe).id;
}
const api = (method, path, json, user = owner) => t.request(method, `/fin/espaces/${space.id}${path}`, { user, ...(json === undefined ? {} : { json }) });
const dashboard = (user = owner) => api('GET', `/tableau-de-bord?mois=${month()}`, undefined, user);

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  flatmate = await t.user();
  space = (await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'flatshare', label: 'Coloc', currency: 'DZD' } })).body.space;
  const invite = await api('POST', '/invitations', { role: 'member' });
  await t.request('POST', '/fin/espaces/rejoindre', { user: flatmate, json: { token: invite.body.token } });
  ownerId = await memberId(owner);
  flatmateId = await memberId(flatmate);
});
after(() => t.close());

describe('the dashboard of a space', () => {
  test('an empty space answers every block, with no invented figure', async () => {
    const res = await dashboard();
    assert.equal(res.status, 200, JSON.stringify(res.body).slice(0, 200));
    const d = res.body.tableau;
    assert.equal(d.soldeGroupe.resultat, 0);
    assert.equal(d.depenses.total, 0);
    assert.equal(d.depenses.tendance, null, 'no previous month: no trend, never an invented 0');
    assert.deepEqual(d.quiAPaye, []);
    assert.equal(d.objectif, null);
    assert.equal(d.taches.enRetard, 0);
  });

  test('the blocks follow the space: who paid, who owes what, budgets, bills, tasks, goal', async () => {
    const parts = [{ memberId: ownerId }, { memberId: flatmateId }];
    await api('POST', '/ressources', { kind: 'opening', value: 1000000, occurredAt: at(1) });
    await api('POST', '/depenses', { label: 'Courses', value: 400000, occurredAt: at(1), splitMode: 'equal', payerId: ownerId, participants: parts, collectiveCategory: 'COLC-02' });
    await api('POST', '/depenses', { label: 'Internet', value: 90000, occurredAt: inDays(5), planned: true, splitMode: 'equal', payerId: ownerId, participants: parts });
    await api('PUT', '/budgets', { category: 'COLC-02', period: month(), value: 500000 });
    await api('POST', '/taches', { title: 'Ménage', category: 'household', assigneeId: ownerId, dueDate: inDays(-2) });
    await api('POST', '/taches', { title: 'Courses', category: 'shopping', assigneeId: flatmateId, dueDate: inDays(2) });
    const goal = (await api('POST', '/objectifs-communs', { label: 'Voyage', target: 1000000, currency: 'DZD' })).body.goal;
    await api('POST', `/objectifs-communs/${goal.id}/contributions`, { amount: 250000, contributedAt: at(1) });

    const d = (await dashboard()).body.tableau;
    assert.equal(d.soldeGroupe.resultat, 600000, 'CD-01: resources − realised expenses');
    assert.equal(d.depenses.total, 400000);
    assert.equal(d.depenses.parCategorie[0].category, 'COLC-02');
    assert.deepEqual(d.quiAPaye.map((row) => [row.name !== null, row.paid]), [[true, 400000]], 'CD-03');
    assert.equal(d.quiDoitQuoi.transferts.length, 1, 'CD-04');
    assert.equal(d.quiDoitQuoi.transferts[0].amount, 200000);
    assert.equal(d.budgets[0].reste.resultat, 100000, 'CD-05');
    assert.equal(d.prochainesFactures.length, 1, 'CD-06: the planned bill, not the done expense');
    assert.equal(d.taches.enRetard, 1, 'CD-07');
    assert.equal(d.taches.prochaines.length, 1);
    assert.equal(d.objectif.progression.resultat, 0.25, 'CD-08');
  });

  test('the trend compares with the previous month', async () => {
    const parts = [{ memberId: ownerId }, { memberId: flatmateId }];
    const lastMonth = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 1, 10, 12)).toISOString();
    await api('POST', '/depenses', { label: 'Avant', value: 100000, occurredAt: lastMonth, splitMode: 'equal', payerId: ownerId, participants: parts });
    await api('POST', '/depenses', { label: 'Maintenant', value: 150000, occurredAt: at(1), splitMode: 'equal', payerId: ownerId, participants: parts });
    assert.equal((await dashboard()).body.tableau.depenses.tendance, 0.5);
  });

  test('every member reads the same; nothing personal; a stranger gets a 404', async () => {
    const account = (await t.request('POST', '/fin/comptes', { user: owner, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 1000000, openingDate: new Date(Date.now() - 30 * DAY).toISOString() } })).body.account;
    await api('POST', '/depenses', { label: 'X', value: 100000, occurredAt: at(1), splitMode: 'equal', payerId: ownerId, participants: [{ memberId: ownerId }], personalLink: { accountId: account.id } });
    const body = JSON.stringify((await dashboard(flatmate)).body);
    assert.ok(!body.includes(account.id) && !body.includes('personalTransactionId'));
    assert.equal((await dashboard(await t.user())).status, 404);
  });
});

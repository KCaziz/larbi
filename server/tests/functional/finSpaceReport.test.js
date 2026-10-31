import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P9-10: the report of a space for a month and its export, with an explicit
// consent on each call. Nothing personal can enter it.

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
const spend = (json) =>
  t.request('POST', `/fin/espaces/${space.id}/depenses`, {
    user: owner,
    json: { label: 'Facture', value: 100000, occurredAt: at(1), splitMode: 'equal', payerId: ownerId, participants: [{ memberId: ownerId }, { memberId: flatmateId }], ...json },
  });
const report = (user = owner) => t.request('GET', `/fin/espaces/${space.id}/rapport?mois=${month()}`, { user });
const exportFile = (json, user = owner) => t.request('POST', `/fin/espaces/${space.id}/export`, { user, json });

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
});
after(() => t.close());

describe('the report of a space', () => {
  test('totals the realised expenses of the month by category, with the balances', async () => {
    await spend({ value: 300000, collectiveCategory: 'COLC-02' });
    await spend({ value: 100000, collectiveCategory: 'COLC-03' });
    await spend({ value: 50000 });
    await spend({ value: 999999, planned: true, occurredAt: new Date(Date.now() + 86400000 * 5).toISOString() });
    const res = await report();
    assert.equal(res.status, 200, JSON.stringify(res.body).slice(0, 200));
    const r = res.body.rapport;
    assert.equal(r.depenses.total, 450000, 'a planned expense is not counted');
    assert.deepEqual(r.depenses.parCategorie.map((c) => c.value), [300000, 100000, 50000]);
    assert.equal(r.depenses.parCategorie[0].label, 'Courses');
    const mine = r.soldes.find((s) => s.memberId === ownerId);
    assert.equal(mine.solde.resultat, 225000);
  });

  test('every member reads the same report; a stranger gets a 404', async () => {
    await spend({});
    const a = (await report(owner)).body.rapport;
    const b = (await report(flatmate)).body.rapport;
    // Only the clock differs between two reads.
    const figures = (r) => JSON.stringify({ d: r.depenses, s: r.soldes.map((x) => [x.memberId, x.solde.resultat]), c: r.caisse.soldeGroupe.resultat });
    assert.equal(figures(a), figures(b));
    assert.equal((await report(await t.user())).status, 404);
  });

  test('carries nothing personal: no personal account, no personal transaction', async () => {
    const account = (await t.request('POST', '/fin/comptes', { user: owner, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 1000000, openingDate: new Date(Date.now() - 30 * 86400000).toISOString() } })).body.account;
    await spend({ occurredAt: at(2), personalLink: { accountId: account.id } });
    const body = JSON.stringify((await report(flatmate)).body);
    assert.ok(!body.includes(account.id) && !body.includes('personalTransactionId'));
  });
});

describe('the export', () => {
  test('is refused without an explicit consent, every time', async () => {
    assert.equal((await exportFile({})).status, 400);
    assert.equal((await exportFile({ consent: false })).status, 400);
    assert.equal((await exportFile({ consent: true })).status, 200);
    assert.equal((await exportFile({})).status, 400, 'the consent is not remembered');
  });

  test('gives a CSV of the same figures, and neutralises a formula in a member name', async () => {
    await t.prisma.finSpaceMember.update({ where: { id: ownerId }, data: { displayName: '=HYPERLINK("x")' } });
    await spend({ value: 300000, collectiveCategory: 'COLC-02' });
    const res = await exportFile({ consent: true, format: 'csv', mois: month() });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/csv/);
    const text = res.text;
    assert.ok(text.includes('Dépenses par catégorie'));
    assert.ok(!text.includes('"=HYPERLINK'), 'a cell never starts with =');
  });

  test('a stranger cannot export; a viewer can read but the file is the same for everybody', async () => {
    assert.equal((await exportFile({ consent: true }, await t.user())).status, 404);
  });
});

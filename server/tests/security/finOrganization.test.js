import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P13-05, lot A (2026-11-23): the organisations of the client's référentiel —
// members, roles (22_AUTORISATIONS), mandates (DEC-008, CNV-14), the journal
// (ECR-0008), Idempotency-Key and If-Match (DEC-005). What the API really
// allows, role by role.

let t;
before(async () => {
  t = await boot();
});
beforeEach(() => t.reset());
after(() => t.close());

const organisation = { name: 'Atelier Belkacem', currency: 'DZD', legalForm: 'pme', publicKey: 'PUB-06', wilaya: 'Alger' };
const sale = { kind: 'sale', number: 'F-1', label: 'Conseil', issuedAt: '2026-01-10T00:00:00.000Z', amountExcl: 100000, taxAmount: 0, currency: 'DZD' };

async function setUp() {
  const owner = await t.adult();
  const created = await t.request('POST', '/fin/entreprise', { user: owner, json: organisation });
  assert.equal(created.status, 201, JSON.stringify(created.body).slice(0, 200));
  return { owner, org: created.body.entreprise, as: { 'X-Organisation': created.body.entreprise.id } };
}

async function join(ctx, role) {
  const person = await t.adult();
  const invited = await t.request('POST', '/fin/entreprise/membres', { user: ctx.owner, headers: ctx.as, json: { email: person.email, role } });
  assert.equal(invited.status, 201, JSON.stringify(invited.body).slice(0, 200));
  const accepted = await t.request('POST', `/fin/entreprise/invitations/${invited.body.membre.id}/accepter`, { user: person });
  assert.equal(accepted.status, 200);
  return { person, memberId: invited.body.membre.id };
}

describe('organisations — the creator is the owner', () => {
  test('the organisation is created with its public, and its owner sees role and rights', async () => {
    const ctx = await setUp();
    assert.equal(ctx.org.publicKey, 'PUB-06');
    const me = await t.request('GET', '/fin/entreprise', { user: ctx.owner, headers: ctx.as });
    assert.equal(me.body.role, 'owner');
    assert.ok(me.body.permissions.includes('members.manage'));
    const list = await t.request('GET', '/fin/entreprise/organisations', { user: ctx.owner });
    assert.equal(list.body.organisations.length, 1);
    assert.equal(list.body.organisations[0].role, 'owner');
  });

  test('a person who is not a member gets 404 — nothing says the organisation exists', async () => {
    const ctx = await setUp();
    const stranger = await t.adult();
    for (const path of ['/fin/entreprise/documents', '/fin/entreprise/tableau-de-bord', '/fin/entreprise/membres', '/fin/entreprise/journal']) {
      const res = await t.request('GET', path, { user: stranger, headers: ctx.as });
      assert.equal(res.status, 404, path);
      assert.equal(res.body.error.details.reason, 'organisationNotFound');
    }
  });
});

describe('invitations and roles', () => {
  test('an invited person sees the invitation, joins, and works with their role only', async () => {
    const ctx = await setUp();
    const person = await t.adult();
    await t.request('POST', '/fin/entreprise/membres', { user: ctx.owner, headers: ctx.as, json: { email: person.email, role: 'collaborator' } });
    const waiting = await t.request('GET', '/fin/entreprise/organisations', { user: person });
    assert.equal(waiting.body.invitations.length, 1);
    assert.equal(waiting.body.organisations.length, 0);
    assert.equal((await t.request('GET', '/fin/entreprise/documents', { user: person, headers: ctx.as })).status, 404, 'not before accepting');

    await t.request('POST', `/fin/entreprise/invitations/${waiting.body.invitations[0].id}/accepter`, { user: person });
    const doc = await t.request('POST', '/fin/entreprise/documents', { user: person, headers: ctx.as, json: sale });
    assert.equal(doc.status, 201, 'a collaborator records a document');
    const pay = await t.request('POST', `/fin/entreprise/documents/${doc.body.document.id}/reglements`, { user: person, headers: ctx.as, json: { value: 1000, currency: 'DZD', receivedAt: '2026-01-20T00:00:00.000Z' } });
    assert.equal(pay.status, 403, 'but not a payment');
    assert.equal(pay.body.error.details.reason, 'roleForbidden');
    assert.equal((await t.request('GET', '/fin/entreprise/membres', { user: person, headers: ctx.as })).status, 403, 'nor the members');
  });

  test('only the invited person can answer the invitation', async () => {
    const ctx = await setUp();
    const person = await t.adult();
    const intruder = await t.adult();
    const invited = await t.request('POST', '/fin/entreprise/membres', { user: ctx.owner, headers: ctx.as, json: { email: person.email, role: 'owner' } });
    const res = await t.request('POST', `/fin/entreprise/invitations/${invited.body.membre.id}/accepter`, { user: intruder });
    assert.equal(res.status, 404);
  });

  test('a storekeeper records suppliers, never documents; a reader only reads; HR sees no figures', async () => {
    const ctx = await setUp();
    const store = await join(ctx, 'storekeeper');
    assert.equal((await t.request('POST', '/fin/entreprise/tiers', { user: store.person, headers: ctx.as, json: { kind: 'supplier', name: 'Grossiste' } })).status, 201);
    assert.equal((await t.request('POST', '/fin/entreprise/documents', { user: store.person, headers: ctx.as, json: sale })).status, 403);
    const reader = await join(ctx, 'reader');
    assert.equal((await t.request('GET', '/fin/entreprise/tableau-de-bord', { user: reader.person, headers: ctx.as })).status, 200);
    assert.equal((await t.request('POST', '/fin/entreprise/tiers', { user: reader.person, headers: ctx.as, json: { kind: 'client', name: 'X' } })).status, 403);
    const hr = await join(ctx, 'hr_manager');
    assert.equal((await t.request('GET', '/fin/entreprise/tableau-de-bord', { user: hr.person, headers: ctx.as })).status, 403);
  });

  test('a revoked member loses access at once; an expired one too', async () => {
    const ctx = await setUp();
    const member = await join(ctx, 'finance_manager');
    assert.equal((await t.request('GET', '/fin/entreprise/documents', { user: member.person, headers: ctx.as })).status, 200);
    assert.equal((await t.request('DELETE', `/fin/entreprise/membres/${member.memberId}`, { user: ctx.owner, headers: ctx.as })).status, 204);
    assert.equal((await t.request('GET', '/fin/entreprise/documents', { user: member.person, headers: ctx.as })).status, 404);

    const later = await join(ctx, 'reader');
    await t.prisma.finOrganizationMember.update({ where: { id: later.memberId }, data: { expiresAt: new Date(Date.now() - 1000) } });
    assert.equal((await t.request('GET', '/fin/entreprise/documents', { user: later.person, headers: ctx.as })).status, 404);
  });

  test('the organisation always keeps an owner', async () => {
    const ctx = await setUp();
    const members = await t.request('GET', '/fin/entreprise/membres', { user: ctx.owner, headers: ctx.as });
    const me = members.body.membres.find((m) => m.role === 'owner');
    const demote = await t.request('PUT', `/fin/entreprise/membres/${me.id}`, { user: ctx.owner, headers: ctx.as, json: { role: 'reader' } });
    assert.equal(demote.status, 422);
    assert.equal(demote.body.error.details.reason, 'lastOwner');
    assert.equal((await t.request('DELETE', `/fin/entreprise/membres/${me.id}`, { user: ctx.owner, headers: ctx.as })).status, 422);
  });
});

describe('mandates — an external accountant works only under a mandate in force', () => {
  test('no mandate: refused; a mandate in force: allowed; revoked or ended: refused again', async () => {
    const ctx = await setUp();
    const accountant = await join(ctx, 'accountant_external');
    const read = () => t.request('GET', '/fin/entreprise/documents', { user: accountant.person, headers: ctx.as });
    let res = await read();
    assert.equal(res.status, 403);
    assert.equal(res.body.error.details.reason, 'mandateRequired');

    const granted = await t.request('POST', '/fin/entreprise/mandats', { user: ctx.owner, headers: ctx.as, json: { memberId: accountant.memberId, scope: 'finance', purpose: 'Révision des comptes 2026' } });
    assert.equal(granted.status, 201);
    assert.equal((await read()).status, 200);
    assert.equal((await t.request('POST', '/fin/entreprise/documents', { user: accountant.person, headers: ctx.as, json: sale })).status, 403, 'reading, not writing');

    assert.equal((await t.request('DELETE', `/fin/entreprise/mandats/${granted.body.mandat.id}`, { user: ctx.owner, headers: ctx.as })).status, 204);
    assert.equal((await read()).status, 403);

    const ended = await t.request('POST', '/fin/entreprise/mandats', { user: ctx.owner, headers: ctx.as, json: { memberId: accountant.memberId, scope: 'finance', purpose: 'Clôture', startsAt: '2025-01-01T00:00:00.000Z', endsAt: '2025-06-30T00:00:00.000Z' } });
    assert.equal(ended.status, 201);
    assert.equal((await read()).status, 403, 'a mandate that has ended');
  });
});

describe('journal, Idempotency-Key and If-Match', () => {
  test('every write leaves a line in the journal, with its author', async () => {
    const ctx = await setUp();
    await t.request('POST', '/fin/entreprise/documents', { user: ctx.owner, headers: ctx.as, json: sale });
    await join(ctx, 'reader');
    const res = await t.request('GET', '/fin/entreprise/journal', { user: ctx.owner, headers: ctx.as });
    const actions = res.body.journal.map((row) => row.action);
    for (const action of ['organisation.created', 'document.created', 'member.invited', 'member.accepted']) assert.ok(actions.includes(action), action);
    assert.ok(res.body.journal.every((row) => row.at));
  });

  test('the same Idempotency-Key creates once and replays the first answer', async () => {
    const ctx = await setUp();
    const headers = { ...ctx.as, 'Idempotency-Key': 'once-1' };
    const first = await t.request('POST', '/fin/entreprise/documents', { user: ctx.owner, headers, json: sale });
    const second = await t.request('POST', '/fin/entreprise/documents', { user: ctx.owner, headers, json: sale });
    assert.equal(first.status, 201);
    assert.equal(second.status, 201);
    assert.equal(second.headers.get('idempotent-replayed'), 'true');
    assert.equal(second.body.document.id, first.body.document.id);
    assert.equal((await t.request('GET', '/fin/entreprise/documents', { user: ctx.owner, headers: ctx.as })).body.documents.length, 1);
    const elsewhere = await t.request('POST', '/fin/entreprise/tiers', { user: ctx.owner, headers, json: { kind: 'client', name: 'X' } });
    assert.equal(elsewhere.status, 422, 'a key used for another request');
  });

  test('If-Match: a correction made on an old version is refused (412)', async () => {
    const ctx = await setUp();
    const ok = await t.request('PUT', '/fin/entreprise', { user: ctx.owner, headers: { ...ctx.as, 'If-Match': '1' }, json: { tradeName: 'Belkacem & fils' } });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.entreprise.version, 2);
    const stale = await t.request('PUT', '/fin/entreprise', { user: ctx.owner, headers: { ...ctx.as, 'If-Match': '1' }, json: { tradeName: 'Autre' } });
    assert.equal(stale.status, 412);
    assert.equal(stale.body.error.details.reason, 'versionMismatch');
  });
});

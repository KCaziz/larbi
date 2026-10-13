import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Shared spaces (P6-13). The task asks for dedicated security tests in these
// words: « aucune donnée privée d'un membre visible par un autre, même par
// l'API directe ». That is what this file is.
//
// The rule being proved: joining a space reveals NOTHING. Sharing is per
// member, private by default, and a role says what somebody may do to the space
// — never what they may read of another member's money.

let t;
let owner;
let flatmate;
let stranger;
let admin;
let space;

const iso = (date) => date.toISOString();
const ago = (days) => new Date(Date.now() - days * 24 * 3600 * 1000);

// Money for `user`, so there is something that could leak.
async function giveMoney(user) {
  await t.request('POST', '/fin/revenus', {
    user,
    json: { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: iso(ago(60)) },
  });
  await t.request('POST', '/fin/transactions', {
    user,
    json: { kind: 'expense', value: 150000, currency: 'DZD', occurredAt: iso(ago(1)), note: 'Secret' },
  });
  await t.request('POST', '/fin/actifs', {
    user,
    json: { label: 'Épargne', kind: 'account', value: 80000000, currency: 'DZD', valuedAt: iso(ago(3)) },
  });
  await t.request('POST', '/fin/goals', { user, json: { label: 'Voyage', target: 5000000, currency: 'DZD' } });
}

// `joiner` joins `space` through a real invitation.
async function join(joiner, role = 'member') {
  const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role } });
  assert.equal(invite.status, 201);
  const accepted = await t.request('POST', '/fin/espaces/rejoindre', { user: joiner, json: { token: invite.body.token } });
  assert.equal(accepted.status, 201, 'the invitation works');
  return invite.body.token;
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
  const res = await t.request('POST', '/fin/espaces', {
    user: owner,
    json: { kind: 'flatshare', label: 'Coloc Alger', currency: 'DZD' },
  });
  space = res.body.space;
});
after(() => t.close());

describe('a space needs a session, and membership', () => {
  test('every route refuses an anonymous caller', async () => {
    for (const [method, path, json] of [
      ['GET', '/fin/espaces', undefined],
      ['GET', `/fin/espaces/${space.id}`, undefined],
      ['GET', `/fin/espaces/${space.id}/partage`, undefined],
      ['POST', '/fin/espaces', { kind: 'couple', label: 'X', currency: 'DZD' }],
      ['POST', '/fin/espaces/rejoindre', { token: 'x'.repeat(32) }],
    ]) {
      assert.equal((await t.request(method, path, { json })).status, 401, `${method} ${path}`);
    }
  });

  test("a space the caller is not in is 404, never 403", async () => {
    // « Accès non autorisé → écran neutre »: this only works if "not yours" and
    // "does not exist" are indistinguishable.
    for (const [method, path, json] of [
      ['GET', `/fin/espaces/${space.id}`, undefined],
      ['GET', `/fin/espaces/${space.id}/partage`, undefined],
      ['GET', `/fin/espaces/${space.id}/membres`, undefined],
      ['GET', `/fin/espaces/${space.id}/journal`, undefined],
      ['PATCH', `/fin/espaces/${space.id}`, { label: 'Pris' }],
      ['DELETE', `/fin/espaces/${space.id}`, {}],
      ['POST', `/fin/espaces/${space.id}/invitations`, { role: 'member' }],
      ['PUT', `/fin/espaces/${space.id}/mon-partage`, { incomes: 'shared' }],
    ]) {
      assert.equal((await t.request(method, path, { user: stranger, json })).status, 404, `${method} ${path}`);
    }
  });

  test("it is not in a stranger's list, and not visible to an administrator", async () => {
    assert.deepEqual((await t.request('GET', '/fin/espaces', { user: stranger })).body.spaces, []);
    assert.deepEqual((await t.request('GET', '/fin/espaces', { user: admin })).body.spaces, []);
    assert.equal((await t.request('GET', `/fin/espaces/${space.id}`, { user: admin })).status, 404);
  });
});

describe('joining a space reveals nothing', () => {
  test('a new member shares nothing, and neither does the owner', async () => {
    await giveMoney(owner);
    await giveMoney(flatmate);
    await join(flatmate);

    for (const [reader, subjectName] of [
      [flatmate, 'owner'],
      [owner, 'flatmate'],
    ]) {
      const res = await t.request('GET', `/fin/espaces/${space.id}/partage`, { user: reader });
      assert.equal(res.status, 200);
      const others = res.body.partage.filter((row) => !row.isMe);
      assert.equal(others.length, 1, `${subjectName} is listed`);
      assert.deepEqual(
        others[0].niveaux,
        { incomes: 'private', transactions: 'private', assets: 'private', goals: 'private' },
        'every kind is private by default',
      );
      // Not merely hidden by the interface: ABSENT from the answer.
      assert.deepEqual(others[0].donnees, {}, 'nothing of theirs is sent at all');
    }
  });

  test('creating a space is not an act of sharing', async () => {
    const res = await t.request('GET', `/fin/espaces/${space.id}`, { user: owner });
    assert.deepEqual(res.body.monPartage, { incomes: 'private', transactions: 'private', assets: 'private', goals: 'private' });
  });
});

describe('a role runs the space; it never reads somebody s money', () => {
  test('an admin of the space sees no more of a member s data than anybody else', async () => {
    await giveMoney(flatmate);
    await join(flatmate);
    // Promote a THIRD member to admin and check they still see nothing.
    const third = await t.user();
    await join(third, 'admin');

    const res = await t.request('GET', `/fin/espaces/${space.id}/partage`, { user: third });
    const theirFlatmate = res.body.partage.find((row) => row.userId === flatmate.id);
    assert.deepEqual(theirFlatmate.niveaux, { incomes: 'private', transactions: 'private', assets: 'private', goals: 'private' });
    assert.deepEqual(theirFlatmate.donnees, {});
  });

  test('nobody can set another member s sharing — there is no route for it', async () => {
    await join(flatmate);
    // The only sharing route is "mon-partage", and it writes the CALLER's row.
    const before = await t.request('GET', `/fin/espaces/${space.id}/partage`, { user: owner });
    assert.equal(before.body.partage.find((row) => row.userId === flatmate.id).niveaux.incomes, 'private');

    await t.request('PUT', `/fin/espaces/${space.id}/mon-partage`, { user: owner, json: { incomes: 'shared' } });

    const after = await t.request('GET', `/fin/espaces/${space.id}/partage`, { user: owner });
    assert.equal(
      after.body.partage.find((row) => row.userId === flatmate.id).niveaux.incomes,
      'private',
      "the owner changed their OWN matrix, not the flatmate's",
    );
    const mine = await t.request('GET', `/fin/espaces/${space.id}`, { user: owner });
    assert.equal(mine.body.monPartage.incomes, 'shared');
  });

  test('an admin cannot take ownership, nor change the owner s role', async () => {
    await join(flatmate, 'admin');
    const members = await t.request('GET', `/fin/espaces/${space.id}/membres`, { user: flatmate });
    const ownerRow = members.body.membres.find((row) => row.role === 'owner');
    const promote = await t.request('PUT', `/fin/espaces/${space.id}/membres/${ownerRow.id}/role`, { user: flatmate, json: { role: 'viewer' } });
    assert.equal(promote.status, 422);
    assert.equal(promote.body.error.details.reason, 'ownerFixed');
  });

  test('a viewer cannot invite, rename or delete the space', async () => {
    await join(flatmate, 'viewer');
    for (const [method, path, json, expected] of [
      ['POST', `/fin/espaces/${space.id}/invitations`, { role: 'member' }, 403],
      ['PATCH', `/fin/espaces/${space.id}`, { label: 'Renommé' }, 403],
      ['DELETE', `/fin/espaces/${space.id}`, {}, 403],
    ]) {
      const res = await t.request(method, path, { user: flatmate, json });
      assert.equal(res.status, expected, `${method} ${path}`);
    }
  });
});

describe('what sharing actually grants', () => {
  test('"totals only" sends the total and NOT the rows', async () => {
    await giveMoney(flatmate);
    await join(flatmate);
    await t.request('PUT', `/fin/espaces/${space.id}/mon-partage`, { user: flatmate, json: { incomes: 'totals', transactions: 'totals' } });

    const res = await t.request('GET', `/fin/espaces/${space.id}/partage`, { user: owner });
    const theirs = res.body.partage.find((row) => row.userId === flatmate.id);
    assert.equal(theirs.niveaux.incomes, 'totals');
    assert.equal(theirs.donnees.incomes.total.resultat, 6000000);
    assert.equal(theirs.donnees.incomes.lignes, null, 'the rows are not sent at all, not merely hidden');
    assert.equal(theirs.donnees.transactions.lignes, null);
    // And the note somebody typed is nowhere in the payload.
    assert.ok(!JSON.stringify(res.body).includes('Secret'), 'a typed note never travels at "totals"');
  });

  test('"shared" sends the rows, and only for the kinds granted', async () => {
    await giveMoney(flatmate);
    await join(flatmate);
    await t.request('PUT', `/fin/espaces/${space.id}/mon-partage`, { user: flatmate, json: { transactions: 'shared' } });

    const res = await t.request('GET', `/fin/espaces/${space.id}/partage`, { user: owner });
    const theirs = res.body.partage.find((row) => row.userId === flatmate.id);
    assert.ok(Array.isArray(theirs.donnees.transactions.lignes));
    assert.equal(theirs.niveaux.assets, 'private');
    assert.equal(theirs.donnees.assets, undefined, 'a kind that was not granted is absent entirely');
    assert.ok(!JSON.stringify(res.body).includes('80000000'), 'the asset never travels');
  });

  test('revoking sharing takes it back immediately', async () => {
    await giveMoney(flatmate);
    await join(flatmate);
    await t.request('PUT', `/fin/espaces/${space.id}/mon-partage`, { user: flatmate, json: { incomes: 'shared' } });
    assert.ok((await t.request('GET', `/fin/espaces/${space.id}/partage`, { user: owner })).body.partage.find((r) => r.userId === flatmate.id).donnees.incomes);

    await t.request('PUT', `/fin/espaces/${space.id}/mon-partage`, { user: flatmate, json: { incomes: 'private' } });
    const after = await t.request('GET', `/fin/espaces/${space.id}/partage`, { user: owner });
    assert.deepEqual(after.body.partage.find((row) => row.userId === flatmate.id).donnees, {});
  });

  test('every change of sharing is on the record', async () => {
    await join(flatmate);
    await t.request('PUT', `/fin/espaces/${space.id}/mon-partage`, { user: flatmate, json: { incomes: 'totals' } });
    const trail = await t.request('GET', `/fin/espaces/${space.id}/journal`, { user: owner });
    const change = trail.body.journal.find((row) => row.field === 'sharing.incomes');
    assert.ok(change, 'the client asks for a notification at every change of sharing: this is what it reads');
    assert.equal(change.before, 'private');
    assert.equal(change.after, 'totals');
  });

  test('leaving stops the sharing at once, in both directions', async () => {
    await giveMoney(flatmate);
    await join(flatmate);
    await t.request('PUT', `/fin/espaces/${space.id}/mon-partage`, { user: flatmate, json: { incomes: 'shared' } });
    assert.equal((await t.request('POST', `/fin/espaces/${space.id}/quitter`, { user: flatmate, json: {} })).status, 200);

    const res = await t.request('GET', `/fin/espaces/${space.id}/partage`, { user: owner });
    assert.equal(res.body.partage.filter((row) => !row.isMe).length, 0, 'they are no longer a member');
    assert.ok(!JSON.stringify(res.body).includes('6000000'), 'and nothing of theirs remains in the payload');
    assert.equal((await t.request('GET', `/fin/espaces/${space.id}`, { user: flatmate })).status, 404, 'and they see nothing either');
  });

  test('re-joining starts from private again', async () => {
    await giveMoney(flatmate);
    await join(flatmate);
    await t.request('PUT', `/fin/espaces/${space.id}/mon-partage`, { user: flatmate, json: { incomes: 'shared' } });
    await t.request('POST', `/fin/espaces/${space.id}/quitter`, { user: flatmate, json: {} });
    await join(flatmate);

    const res = await t.request('GET', `/fin/espaces/${space.id}/partage`, { user: owner });
    const theirs = res.body.partage.find((row) => row.userId === flatmate.id);
    assert.equal(theirs.niveaux.incomes, 'private', 'consent given once is not consent for ever');
  });
});

describe('invitations', () => {
  test('the token is returned once and only ever stored hashed', async () => {
    const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
    const token = invite.body.token;
    assert.ok(token.length >= 32);
    const rows = await t.prisma.finSpaceInvite.findMany({ select: { tokenHash: true } });
    assert.equal(rows.length, 1);
    assert.notEqual(rows[0].tokenHash, token, 'a leaked database must not hand over the ability to join');
    assert.equal(rows[0].tokenHash.length, 64, 'SHA-256, like a session token');
    // And it cannot be read back.
    const listed = await t.request('GET', `/fin/espaces/${space.id}`, { user: owner });
    assert.ok(!JSON.stringify(listed.body).includes(token));
  });

  test('an unknown, revoked or expired token all answer the same way', async () => {
    const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
    const expired = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
    await t.prisma.finSpaceInvite.updateMany({ where: { id: expired.body.invitation.id }, data: { expiresAt: ago(1) } });
    await t.request('DELETE', `/fin/espaces/${space.id}/invitations/${invite.body.invitation.id}`, { user: owner });

    const answers = [];
    for (const token of [invite.body.token, expired.body.token, 'z'.repeat(43)]) {
      const res = await t.request('POST', '/fin/espaces/rejoindre', { user: stranger, json: { token } });
      answers.push([res.status, res.body.error?.details?.reason]);
    }
    // All identical: the endpoint cannot be used to discover whether a token
    // ever existed.
    assert.deepEqual(answers, [
      [422, 'inviteUnusable'],
      [422, 'inviteUnusable'],
      [422, 'inviteUnusable'],
    ]);
    assert.equal(await t.prisma.finSpaceMember.count({ where: { userId: stranger.id } }), 0);
  });

  test('a token cannot be used twice', async () => {
    const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
    assert.equal((await t.request('POST', '/fin/espaces/rejoindre', { user: flatmate, json: { token: invite.body.token } })).status, 201);
    const again = await t.request('POST', '/fin/espaces/rejoindre', { user: stranger, json: { token: invite.body.token } });
    assert.equal(again.status, 422);
    assert.equal(again.body.error.details.reason, 'inviteUnusable');
  });

  test('somebody already in the space is told so', async () => {
    await join(flatmate);
    const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
    const res = await t.request('POST', '/fin/espaces/rejoindre', { user: flatmate, json: { token: invite.body.token } });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'alreadyMember', "the client lists « membre déjà présent » as its own case");
  });

  test('an invitation can never grant ownership', async () => {
    const res = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'owner' } });
    assert.equal(res.status, 400);
  });

  test('only an admin sees who else has been invited', async () => {
    await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
    await join(flatmate, 'member');
    const asMember = await t.request('GET', `/fin/espaces/${space.id}`, { user: flatmate });
    assert.equal(asMember.body.invitations, null);
    const asOwner = await t.request('GET', `/fin/espaces/${space.id}`, { user: owner });
    assert.ok(Array.isArray(asOwner.body.invitations));
  });

  test('a deleted space cannot be joined, and its pending invitations are revoked', async () => {
    const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
    await t.request('DELETE', `/fin/espaces/${space.id}`, { user: owner, json: {} });
    const res = await t.request('POST', '/fin/espaces/rejoindre', { user: flatmate, json: { token: invite.body.token } });
    assert.equal(res.status, 422);
    const row = await t.prisma.finSpaceInvite.findUnique({ where: { id: invite.body.invitation.id }, select: { status: true } });
    assert.equal(row.status, 'revoked');
  });
});

describe('erasing an account leaves no membership behind', () => {
  test('the memberships go with the account', async () => {
    await join(flatmate);
    assert.equal(await t.prisma.finSpaceMember.count({ where: { userId: flatmate.id } }), 1);
    // The complete deletion the privacy text promises (P6-01 point 9).
    await t.prisma.user.delete({ where: { id: flatmate.id } });
    assert.equal(await t.prisma.finSpaceMember.count({ where: { userId: flatmate.id } }), 0);
    // The space itself survives: the others are still in it.
    assert.equal((await t.request('GET', `/fin/espaces/${space.id}`, { user: owner })).status, 200);
  });

  test('erasing the owner does not strand the space rows', async () => {
    await join(flatmate);
    await t.prisma.user.delete({ where: { id: owner.id } });
    // The space's own row is untouched; the membership is gone, and the
    // flatmate still sees the space they are in.
    assert.equal(await t.prisma.finSpaceMember.count({ where: { userId: owner.id } }), 0);
    assert.equal((await t.request('GET', `/fin/espaces/${space.id}`, { user: flatmate })).status, 200);
  });
});

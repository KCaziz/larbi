// Shared spaces (P6-13): creating a space, its members, their roles, the
// permission matrix and the invitations.
//
// This is the file where the platform's privacy promise is either kept or
// broken, so two rules are written into its shape rather than left to callers:
//
//   1. SHARING IS PER MEMBER, AND PRIVATE BY DEFAULT. Joining a space reveals
//      nothing. Each person decides, kind by kind, what the others may see of
//      theirs — and an owner or admin can never decide it for them.
//   2. A READER'S VIEW IS BUILT FROM WHAT THE SUBJECT SHARED, never from what
//      the reader's role allows. A role says what you may do to the SPACE
//      (invite, rename, remove); it never grants sight of somebody's money.
//
// Everything that reads another member's data goes through `visibleTo`, so
// there is one place to check rather than one per screen.

import { createHash, randomBytes } from 'node:crypto';
import {
  DEFAULT_SHARING,
  DEFAULT_SPLIT_RULE,
  INVITE_EXPIRY_DAYS,
  INVITE_TOKEN_BYTES,
  SHARING_LEVELS,
  SHAREABLE_KINDS,
  SPACES_MAX_PER_ACCOUNT,
  SPACE_KINDS,
  SPACE_MEMBERS_MAX,
  SPACE_ROLES,
  SPLIT_RULES,
  roleAtLeast,
  sharesAtLeast,
} from '../constants/finSpace.js';
import { HttpError } from '../utils/httpError.js';
import { recordChange } from './finChange.service.js';
import { createNotification } from './finNotification.service.js';

export const SPACE_ENTITY = 'space';
export const MEMBERSHIP_ENTITY = 'membership';

const SPACE_SELECT = {
  id: true,
  kind: true,
  label: true,
  currency: true,
  splitRule: true,
  note: true,
  status: true,
  version: true,
  archivedAt: true,
  createdAt: true,
};

const MEMBER_SELECT = {
  id: true,
  spaceId: true,
  userId: true,
  role: true,
  sharing: true,
  displayName: true,
  joinedAt: true,
  leftAt: true,
};

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

// A member's sharing map, normalised: every shareable kind present, anything
// unknown dropped, and `private` wherever nothing was said. Reading a stored
// map through this is what makes "absent" and "private" the same thing — the
// safe direction.
export function normaliseSharing(raw) {
  const stored = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return Object.fromEntries(
    SHAREABLE_KINDS.map((kind) => {
      const level = stored[kind];
      return [kind, SHARING_LEVELS.includes(level) ? level : 'private'];
    }),
  );
}

/**
 * What `reader` may see of `subject`'s data, for one kind.
 *
 * The answer comes from what the SUBJECT shared, and from nothing else. A
 * reader's role is deliberately not an input: an admin of a flatshare runs the
 * space, they do not get to read a flatmate's salary.
 *
 * Returns one of SHARING_LEVELS. Reading one's own data is always `shared` —
 * it is one's own.
 */
export function visibleTo({ reader, subject, kind }) {
  if (!SHAREABLE_KINDS.includes(kind)) return 'private';
  if (!reader || !subject) return 'private';
  if (reader.userId === subject.userId) return 'shared';
  // Somebody who has left the space sees nothing more, and nothing of theirs is
  // shown either.
  if (reader.leftAt || subject.leftAt) return 'private';
  if (reader.spaceId !== subject.spaceId) return 'private';
  return normaliseSharing(subject.sharing)[kind];
}

// Convenience for the two questions callers actually ask.
export const canSeeRows = (args) => sharesAtLeast(visibleTo(args), 'shared');
export const canSeeTotals = (args) => sharesAtLeast(visibleTo(args), 'totals');

// ---- membership lookups ----------------------------------------------------

/**
 * The caller's own membership of a space, or a 404.
 *
 * 404 and not 403: a space the caller is not in must not be distinguishable
 * from one that does not exist. That is the client's « accès non autorisé →
 * écran neutre », enforced at the only place it can be.
 */
export async function ownMembership(prisma, userId, spaceId) {
  const membership = await prisma.finSpaceMember.findFirst({
    where: { spaceId, userId, leftAt: null, space: { deletedAt: null } },
    select: { ...MEMBER_SELECT, space: { select: SPACE_SELECT } },
  });
  if (!membership) throw new HttpError(404, 'Space not found');
  return membership;
}

// Same, but the caller must hold at least `role`.
export async function requireRole(prisma, userId, spaceId, role) {
  const membership = await ownMembership(prisma, userId, spaceId);
  if (!roleAtLeast(membership.role, role)) {
    throw new HttpError(403, 'This action needs a higher role in the space', { reason: 'roleRequired', needed: role });
  }
  return membership;
}

export function listSpaces(prisma, userId) {
  return prisma.finSpaceMember.findMany({
    where: { userId, leftAt: null, space: { deletedAt: null } },
    select: { role: true, sharing: true, joinedAt: true, space: { select: { ...SPACE_SELECT, _count: { select: { members: true } } } } },
    orderBy: { joinedAt: 'desc' },
  });
}

// ---- creating and changing a space -----------------------------------------

export async function createSpace(prisma, userId, body) {
  if (!SPACE_KINDS.includes(body.kind)) throw new HttpError(422, 'Unknown space kind', { reason: 'unknownKind' });
  if (!SPLIT_RULES.includes(body.splitRule ?? DEFAULT_SPLIT_RULE)) throw new HttpError(422, 'Unknown split rule', { reason: 'unknownSplitRule' });

  const mine = await prisma.finSpaceMember.count({ where: { userId, leftAt: null, space: { deletedAt: null } } });
  if (mine >= SPACES_MAX_PER_ACCOUNT) throw new HttpError(422, 'Too many spaces', { reason: 'tooManySpaces' });

  return prisma.$transaction(async (tx) => {
    const space = await tx.finSpace.create({
      data: {
        kind: body.kind,
        label: body.label,
        currency: body.currency,
        splitRule: body.splitRule ?? DEFAULT_SPLIT_RULE,
        note: body.note ?? null,
        source: 'manual',
        status: 'declared',
      },
      select: SPACE_SELECT,
    });
    await tx.finSpaceMember.create({
      data: {
        spaceId: space.id,
        userId,
        role: 'owner',
        // The creator shares nothing either. Creating a space is not an act of
        // sharing — the client's rule admits no exception for the owner.
        sharing: { ...DEFAULT_SHARING },
        displayName: body.displayName ?? null,
      },
    });
    await recordChange(tx, {
      userId,
      entity: SPACE_ENTITY,
      entityId: space.id,
      action: 'create',
      after: { kind: space.kind, label: space.label, currency: space.currency },
    });
    return space;
  });
}

export async function updateSpace(prisma, userId, spaceId, body) {
  const membership = await requireRole(prisma, userId, spaceId, 'admin');
  const { reason, ...fields } = body;
  if (fields.splitRule !== undefined && !SPLIT_RULES.includes(fields.splitRule)) {
    throw new HttpError(422, 'Unknown split rule', { reason: 'unknownSplitRule' });
  }
  // The currency of a space cannot change once it holds anything: figures
  // already computed in it would silently change meaning.
  if (fields.currency && fields.currency !== membership.space.currency) {
    throw new HttpError(422, 'The currency of a space cannot be changed', { reason: 'currencyFixed' });
  }

  return prisma.$transaction(async (tx) => {
    const space = await tx.finSpace.update({ where: { id: spaceId }, data: { ...fields, version: { increment: 1 } }, select: SPACE_SELECT });
    for (const [field, value] of Object.entries(fields)) {
      await recordChange(tx, {
        userId,
        entity: SPACE_ENTITY,
        entityId: spaceId,
        action: 'correct',
        field,
        before: membership.space[field] ?? null,
        after: value,
        reason: reason ?? null,
      });
    }
    return space;
  });
}

// Deleting a space is logical, like every other row of Phase 6: figures
// computed inside it must keep knowing what they were made of.
export async function deleteSpace(prisma, userId, spaceId, { reason } = {}) {
  await requireRole(prisma, userId, spaceId, 'owner');
  await prisma.$transaction(async (tx) => {
    await tx.finSpace.update({ where: { id: spaceId }, data: { deletedAt: new Date() } });
    await tx.finSpaceInvite.updateMany({ where: { spaceId, status: 'pending' }, data: { status: 'revoked' } });
    await recordChange(tx, { userId, entity: SPACE_ENTITY, entityId: spaceId, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id: spaceId };
}

// ---- members ---------------------------------------------------------------

/**
 * The members of a space, as THIS caller may see them.
 *
 * Each row says what that member shares with the caller — not what they share
 * in general — so a screen cannot accidentally render a level that was never
 * granted to the person looking.
 */
export async function listMembers(prisma, userId, spaceId) {
  const me = await ownMembership(prisma, userId, spaceId);
  const members = await prisma.finSpaceMember.findMany({
    where: { spaceId, leftAt: null },
    select: { ...MEMBER_SELECT, user: { select: { id: true, name: true } } },
    orderBy: { joinedAt: 'asc' },
  });
  return members.map((member) => ({
    id: member.id,
    userId: member.userId,
    role: member.role,
    joinedAt: member.joinedAt,
    // The display name if they chose one, else their account name. Joining a
    // flatshare should not force anybody to hand over their legal name, which
    // is why the column exists.
    name: member.displayName ?? member.user.name,
    isMe: member.userId === userId,
    // Only one's OWN matrix is returned in full. What somebody else shares is
    // reported as what they share WITH ME, kind by kind.
    sharing:
      member.userId === userId
        ? normaliseSharing(member.sharing)
        : Object.fromEntries(SHAREABLE_KINDS.map((kind) => [kind, visibleTo({ reader: me, subject: member, kind })])),
  }));
}

/**
 * Changing what I share. Only ever my own matrix.
 *
 * There is deliberately no way for an owner or an admin to set somebody else's
 * sharing: that is the whole point of « rien n'entre dans un espace partagé
 * sans action explicite ». Every change is journalled, which is also the record
 * the client's « notification à chaque changement de partage » will read once
 * P6-18 exists.
 */
export async function updateMySharing(prisma, userId, spaceId, sharing) {
  const me = await ownMembership(prisma, userId, spaceId);
  const before = normaliseSharing(me.sharing);
  const after = normaliseSharing({ ...before, ...sharing });
  const changedKinds = SHAREABLE_KINDS.filter((kind) => before[kind] !== after[kind]);

  const result = await prisma.$transaction(async (tx) => {
    const row = await tx.finSpaceMember.update({ where: { id: me.id }, data: { sharing: after }, select: MEMBER_SELECT });
    for (const kind of changedKinds) {
      await recordChange(tx, {
        userId,
        entity: MEMBERSHIP_ENTITY,
        entityId: me.id,
        action: 'correct',
        field: `sharing.${kind}`,
        before: before[kind],
        after: after[kind],
      });
    }
    return { ...row, sharing: normaliseSharing(row.sharing) };
  });

  // P6-18: « notification à chaque changement de partage », to the OTHER
  // live members — never to the one who just made the change.
  if (changedKinds.length > 0) {
    const others = await prisma.finSpaceMember.findMany({ where: { spaceId, userId: { not: userId }, leftAt: null }, select: { userId: true } });
    for (const other of others) {
      await createNotification(prisma, other.userId, {
        type: 'sharing_changed',
        params: { kinds: changedKinds },
        link: `/espaces`,
        referenceId: `${me.id}:${changedKinds.join(',')}:${Date.now()}`,
        dedupeBy: 'reference',
      });
    }
  }

  return result;
}

export async function setMemberRole(prisma, userId, spaceId, memberId, role) {
  const me = await requireRole(prisma, userId, spaceId, 'admin');
  if (!SPACE_ROLES.includes(role)) throw new HttpError(422, 'Unknown role', { reason: 'unknownRole' });
  // A space has exactly one owner, and ownership is not something a role change
  // hands over: that would be a silent takeover.
  if (role === 'owner') throw new HttpError(422, 'Ownership is not granted by a role change', { reason: 'ownerFixed' });

  const target = await prisma.finSpaceMember.findFirst({ where: { id: memberId, spaceId, leftAt: null }, select: MEMBER_SELECT });
  if (!target) throw new HttpError(404, 'Member not found');
  if (target.role === 'owner') throw new HttpError(422, 'The owner s role cannot be changed', { reason: 'ownerFixed' });
  // An admin cannot demote another admin: the owner settles that.
  if (target.role === 'admin' && me.role !== 'owner') {
    throw new HttpError(403, 'Only the owner can change another admin', { reason: 'roleRequired', needed: 'owner' });
  }

  return prisma.$transaction(async (tx) => {
    const row = await tx.finSpaceMember.update({ where: { id: memberId }, data: { role }, select: MEMBER_SELECT });
    await recordChange(tx, { userId, entity: MEMBERSHIP_ENTITY, entityId: memberId, action: 'correct', field: 'role', before: target.role, after: role });
    return row;
  });
}

/**
 * Leaving, or being removed.
 *
 * The membership is marked `leftAt` rather than deleted: the space's figures
 * were computed with that person in it, and erasing the row would make its past
 * unreadable. What stops being visible is their data — `visibleTo` returns
 * `private` for anybody who has left, immediately.
 *
 * The owner cannot leave while the space exists: somebody has to be able to
 * delete it. They hand ownership over first, or delete the space.
 */
export async function leaveSpace(prisma, userId, spaceId, { memberId = null, reason } = {}) {
  const me = await ownMembership(prisma, userId, spaceId);
  const removingSomebodyElse = memberId !== null && memberId !== me.id;
  if (removingSomebodyElse) await requireRole(prisma, userId, spaceId, 'admin');

  const target = removingSomebodyElse
    ? await prisma.finSpaceMember.findFirst({ where: { id: memberId, spaceId, leftAt: null }, select: MEMBER_SELECT })
    : me;
  if (!target) throw new HttpError(404, 'Member not found');
  if (target.role === 'owner') {
    throw new HttpError(422, 'The owner hands the space over or deletes it', { reason: 'ownerCannotLeave' });
  }

  return prisma.$transaction(async (tx) => {
    const row = await tx.finSpaceMember.update({ where: { id: target.id }, data: { leftAt: new Date() }, select: MEMBER_SELECT });
    await recordChange(tx, {
      userId,
      entity: MEMBERSHIP_ENTITY,
      entityId: target.id,
      action: 'correct',
      field: 'leftAt',
      before: null,
      after: row.leftAt,
      reason: reason ?? (removingSomebodyElse ? 'retiré de l’espace' : 'a quitté l’espace'),
    });
    return row;
  });
}

// ---- invitations -----------------------------------------------------------

/**
 * Invites somebody. Returns the PLAIN token once, and never again.
 *
 * Only the hash is stored, exactly like a session or a password-reset token: a
 * leaked database must not hand over the ability to join somebody's household.
 */
export async function inviteToSpace(prisma, userId, spaceId, { role }) {
  await requireRole(prisma, userId, spaceId, 'admin');
  if (!['admin', 'member', 'viewer'].includes(role)) throw new HttpError(422, 'Unknown role', { reason: 'unknownRole' });

  const members = await prisma.finSpaceMember.count({ where: { spaceId, leftAt: null } });
  if (members >= SPACE_MEMBERS_MAX) throw new HttpError(422, 'This space is full', { reason: 'spaceFull' });

  const token = randomBytes(INVITE_TOKEN_BYTES).toString('base64url');
  const invite = await prisma.finSpaceInvite.create({
    data: {
      spaceId,
      invitedById: userId,
      tokenHash: hashToken(token),
      role,
      expiresAt: new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 3600 * 1000),
    },
    select: { id: true, role: true, status: true, expiresAt: true, createdAt: true },
  });
  // The token travels with the answer and is never stored in the clear.
  return { invite, token };
}

export function listInvites(prisma, spaceId) {
  return prisma.finSpaceInvite.findMany({
    where: { spaceId, status: 'pending' },
    select: { id: true, role: true, status: true, expiresAt: true, createdAt: true, invitedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function revokeInvite(prisma, userId, spaceId, inviteId) {
  await requireRole(prisma, userId, spaceId, 'admin');
  const invite = await prisma.finSpaceInvite.findFirst({ where: { id: inviteId, spaceId, status: 'pending' }, select: { id: true } });
  if (!invite) throw new HttpError(404, 'Invitation not found');
  await prisma.finSpaceInvite.update({ where: { id: inviteId }, data: { status: 'revoked' } });
  return { id: inviteId };
}

/**
 * Accepting an invitation.
 *
 * Every refusal is the same shape on purpose — an unknown token, an expired
 * one, a revoked one and one for a deleted space all answer the same way — so
 * the endpoint cannot be used to discover whether a token ever existed.
 */
export async function acceptInvite(prisma, userId, token) {
  const invite = await prisma.finSpaceInvite.findUnique({
    where: { tokenHash: hashToken(String(token ?? '')) },
    select: { id: true, spaceId: true, role: true, status: true, expiresAt: true, space: { select: { id: true, deletedAt: true } } },
  });
  const unusable = !invite || invite.status !== 'pending' || invite.expiresAt < new Date() || invite.space.deletedAt;
  if (unusable) {
    // An expired invitation is marked as such when we happen to see it, so a
    // stale row does not stay "pending" for ever.
    if (invite && invite.status === 'pending' && invite.expiresAt < new Date()) {
      await prisma.finSpaceInvite.update({ where: { id: invite.id }, data: { status: 'expired' } });
    }
    throw new HttpError(422, 'This invitation cannot be used', { reason: 'inviteUnusable' });
  }

  const existing = await prisma.finSpaceMember.findUnique({
    where: { spaceId_userId: { spaceId: invite.spaceId, userId } },
    select: { id: true, leftAt: true },
  });
  // Already a member: the client lists « membre déjà présent » as its own case.
  // Said plainly, and the invitation is left alone rather than consumed.
  if (existing && !existing.leftAt) throw new HttpError(422, 'Already a member of this space', { reason: 'alreadyMember' });

  const members = await prisma.finSpaceMember.count({ where: { spaceId: invite.spaceId, leftAt: null } });
  if (members >= SPACE_MEMBERS_MAX) throw new HttpError(422, 'This space is full', { reason: 'spaceFull' });

  return prisma.$transaction(async (tx) => {
    const membership = existing
      ? // Somebody re-joining starts from private again: their old matrix is not
        // silently restored, because consent given once is not consent for ever.
        await tx.finSpaceMember.update({
          where: { id: existing.id },
          data: { leftAt: null, role: invite.role, sharing: { ...DEFAULT_SHARING }, joinedAt: new Date() },
          select: MEMBER_SELECT,
        })
      : await tx.finSpaceMember.create({
          data: { spaceId: invite.spaceId, userId, role: invite.role, sharing: { ...DEFAULT_SHARING } },
          select: MEMBER_SELECT,
        });
    await tx.finSpaceInvite.update({
      where: { id: invite.id },
      data: { status: 'accepted', acceptedAt: new Date(), acceptedById: userId },
    });
    await recordChange(tx, {
      userId,
      entity: MEMBERSHIP_ENTITY,
      entityId: membership.id,
      action: 'create',
      after: { spaceId: invite.spaceId, role: invite.role },
      reason: 'invitation acceptée',
    });
    return membership;
  });
}

/**
 * The trail of one space: who joined, who left, who changed what they share.
 *
 * This is what the client's « notification à chaque changement de sharing »
 * reads from. Only members may see it, and it carries no amounts — just the
 * facts of membership and consent.
 */
export async function spaceTrail(prisma, userId, spaceId) {
  await ownMembership(prisma, userId, spaceId);
  const memberIds = (await prisma.finSpaceMember.findMany({ where: { spaceId }, select: { id: true } })).map((row) => row.id);
  return prisma.finChange.findMany({
    where: {
      OR: [
        { entity: SPACE_ENTITY, entityId: spaceId },
        { entity: MEMBERSHIP_ENTITY, entityId: { in: memberIds } },
      ],
    },
    select: { entity: true, entityId: true, action: true, field: true, before: true, after: true, reason: true, createdAt: true, userId: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
}

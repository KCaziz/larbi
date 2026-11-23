import {
  MANDATED_ROLES,
  MANDATE_SCOPE_OF,
  ORGANIZATION_HEADER,
  PERMISSIONS,
  permissionsOf,
} from '../constants/finOrganization.js';
import { HttpError } from '../utils/httpError.js';

/**
 * P13-05, lot A: organisations, members, roles, mandates and journal.
 *
 * Every request about an organisation goes through `resolveOrganization`: the
 * person must be an ACTIVE member (not expired, not revoked), their role must
 * allow the action, and a role that needs a mandate must hold one in force,
 * today. A person who is not a member gets 404, the same answer as an
 * organisation that does not exist: nothing tells them it does (DEC-008).
 */

const live = { archivedAt: null, deletedAt: null };
const now = () => new Date();

const inForce = (member, at = now()) => member.status === 'active' && !member.revokedAt && (!member.expiresAt || member.expiresAt > at);

function mandateInForce(mandates, scopes, at = now()) {
  return mandates.some((mandate) => !mandate.revokedAt && mandate.startsAt <= at && (!mandate.endsAt || mandate.endsAt > at) && scopes.includes(mandate.scope));
}

/** The journal line of an action (ECR-0008). Never updated, never deleted. */
export function journal(prisma, { businessId, actorId, action, objectType, objectId = null, details = null }) {
  return prisma.finOrganizationJournal.create({ data: { businessId, actorId, action, objectType, objectId, details } });
}

/** The organisations a person is an active member of, and the invitations waiting for them. */
export async function listMyOrganizations(prisma, user) {
  const memberships = await prisma.finOrganizationMember.findMany({
    where: { userId: user.id, status: 'active', business: live },
    include: { business: { select: { id: true, name: true, tradeName: true, publicKey: true, currency: true } } },
    orderBy: { createdAt: 'asc' },
  });
  const invitations = await prisma.finOrganizationMember.findMany({
    where: { status: 'invited', OR: [{ userId: user.id }, { email: user.email.toLowerCase() }], business: live },
    include: { business: { select: { id: true, name: true, tradeName: true, publicKey: true } } },
    orderBy: { createdAt: 'asc' },
  });
  const at = now();
  return {
    organisations: memberships
      .filter((member) => inForce(member, at))
      .map((member) => ({ ...member.business, role: member.role, memberId: member.id })),
    invitations: invitations
      .filter((member) => !member.expiresAt || member.expiresAt > at)
      .map((member) => ({ id: member.id, role: member.role, organisation: member.business })),
  };
}

/**
 * The organisation a request is about, checked for `action`. Without the
 * header: the person's first organisation as owner, else their first one.
 * `optional`: answer null rather than 404 when the person has none at all.
 */
export async function resolveOrganization(prisma, req, action, { optional = false } = {}) {
  const wanted = req.get?.(ORGANIZATION_HEADER) || null;
  const memberships = await prisma.finOrganizationMember.findMany({
    where: { userId: req.user.id, status: 'active', ...(wanted ? { businessId: wanted } : {}), business: live },
    include: { business: true, mandates: true },
    orderBy: { createdAt: 'asc' },
  });
  const usable = memberships.filter((member) => inForce(member));
  const member = usable.find((row) => row.role === 'owner') ?? usable[0];
  if (!member) {
    if (optional && !wanted) return null;
    throw new HttpError(404, wanted ? 'Organisation not found' : 'No business space for this account', { reason: wanted ? 'organisationNotFound' : 'noBusiness' });
  }
  if (!PERMISSIONS[action]?.includes(member.role)) {
    throw new HttpError(403, 'Your role does not allow this', { reason: 'roleForbidden', role: member.role });
  }
  if (MANDATED_ROLES.includes(member.role) && !mandateInForce(member.mandates, MANDATE_SCOPE_OF[action] ?? [])) {
    throw new HttpError(403, 'No mandate in force for this', { reason: 'mandateRequired' });
  }
  return { business: member.business, member, role: member.role, permissions: permissionsOf(member.role) };
}

/** A new organisation, its creator as owner, and the first journal line. */
export async function createOrganization(prisma, user, body) {
  return prisma.$transaction(async (tx) => {
    const business = await tx.finBusiness.create({
      data: {
        userId: user.id,
        name: body.name,
        tradeName: body.tradeName ?? null,
        publicKey: body.publicKey ?? null,
        legalForm: body.legalForm ?? null,
        taxId: body.taxId ?? null,
        tradeRegister: body.tradeRegister ?? null,
        statisticalId: body.statisticalId ?? null,
        activity: body.activity ?? null,
        sector: body.sector ?? null,
        wilaya: body.wilaya ?? null,
        currency: body.currency,
        fiscalYearStartMonth: body.fiscalYearStartMonth ?? 1,
        source: 'declared',
        status: 'active',
      },
    });
    await tx.finOrganizationMember.create({
      data: { businessId: business.id, userId: user.id, email: user.email.toLowerCase(), role: 'owner', status: 'active', acceptedAt: now() },
    });
    await journal(tx, { businessId: business.id, actorId: user.id, action: 'organisation.created', objectType: 'organisation', objectId: business.id });
    return business;
  });
}

// ---- members ----------------------------------------------------------------

const memberView = (member) => ({
  id: member.id,
  email: member.email,
  name: member.user?.name ?? null,
  role: member.role,
  status: member.status,
  expiresAt: member.expiresAt,
  acceptedAt: member.acceptedAt,
  revokedAt: member.revokedAt,
  version: member.version,
  mandates: (member.mandates ?? []).map((mandate) => ({
    id: mandate.id,
    scope: mandate.scope,
    purpose: mandate.purpose,
    startsAt: mandate.startsAt,
    endsAt: mandate.endsAt,
    revokedAt: mandate.revokedAt,
  })),
});

export async function listMembers(prisma, businessId) {
  const members = await prisma.finOrganizationMember.findMany({
    where: { businessId },
    include: { user: { select: { name: true } }, mandates: { orderBy: { createdAt: 'desc' } } },
    orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
  });
  return members.map(memberView);
}

export async function inviteMember(prisma, ctx, body) {
  const email = body.email.trim().toLowerCase();
  const existing = await prisma.finOrganizationMember.findUnique({ where: { businessId_email: { businessId: ctx.business.id, email } } });
  if (existing && existing.status !== 'revoked') throw new HttpError(409, 'Already a member or invited', { reason: 'alreadyMember' });
  const account = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return prisma.$transaction(async (tx) => {
    const data = { userId: account?.id ?? null, role: body.role, status: 'invited', invitedById: ctx.member.userId, expiresAt: body.expiresAt ?? null, acceptedAt: null, revokedAt: null };
    const member = existing
      ? await tx.finOrganizationMember.update({ where: { id: existing.id }, data: { ...data, version: { increment: 1 } } })
      : await tx.finOrganizationMember.create({ data: { ...data, businessId: ctx.business.id, email } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'member.invited', objectType: 'member', objectId: member.id, details: { email, role: body.role } });
    return memberView(member);
  });
}

async function ownMember(prisma, businessId, id) {
  const member = await prisma.finOrganizationMember.findFirst({ where: { id, businessId } });
  if (!member) throw new HttpError(404, 'Member not found', { reason: 'memberNotFound' });
  return member;
}

// The organisation always keeps one active owner: without one, nobody could
// manage its members again.
async function assertAnotherOwner(prisma, businessId, memberId) {
  const owners = await prisma.finOrganizationMember.count({ where: { businessId, role: 'owner', status: 'active', revokedAt: null, id: { not: memberId } } });
  if (owners === 0) throw new HttpError(422, 'The organisation keeps one owner', { reason: 'lastOwner' });
}

export async function updateMember(prisma, ctx, id, body, ifMatch) {
  const member = await ownMember(prisma, ctx.business.id, id);
  checkVersion(member, ifMatch);
  if (member.status === 'revoked') throw new HttpError(422, 'A revoked member is invited again, not changed', { reason: 'memberRevoked' });
  if (member.role === 'owner' && body.role && body.role !== 'owner') await assertAnotherOwner(prisma, ctx.business.id, member.id);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finOrganizationMember.update({
      where: { id: member.id },
      data: { ...(body.role ? { role: body.role } : {}), ...(body.expiresAt !== undefined ? { expiresAt: body.expiresAt } : {}), version: { increment: 1 } },
    });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'member.updated', objectType: 'member', objectId: member.id, details: { from: member.role, to: updated.role, expiresAt: updated.expiresAt } });
    return memberView(updated);
  });
}

export async function revokeMember(prisma, ctx, id) {
  const member = await ownMember(prisma, ctx.business.id, id);
  if (member.status === 'revoked') return;
  if (member.role === 'owner') await assertAnotherOwner(prisma, ctx.business.id, member.id);
  await prisma.$transaction(async (tx) => {
    await tx.finOrganizationMember.update({ where: { id: member.id }, data: { status: 'revoked', revokedAt: now(), version: { increment: 1 } } });
    await tx.finOrganizationMandate.updateMany({ where: { memberId: member.id, revokedAt: null }, data: { revokedAt: now() } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'member.revoked', objectType: 'member', objectId: member.id, details: { email: member.email } });
  });
}

/** The invited person answers. Only they can: the invitation names their e-mail. */
export async function answerInvitation(prisma, user, id, accept) {
  const member = await prisma.finOrganizationMember.findFirst({
    where: { id, status: 'invited', OR: [{ userId: user.id }, { email: user.email.toLowerCase() }], business: live },
  });
  if (!member || (member.expiresAt && member.expiresAt <= now())) throw new HttpError(404, 'Invitation not found', { reason: 'invitationNotFound' });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finOrganizationMember.update({
      where: { id: member.id },
      data: accept ? { status: 'active', userId: user.id, acceptedAt: now(), version: { increment: 1 } } : { status: 'revoked', revokedAt: now(), version: { increment: 1 } },
    });
    await journal(tx, { businessId: member.businessId, actorId: user.id, action: accept ? 'member.accepted' : 'member.declined', objectType: 'member', objectId: member.id });
    return { id: updated.id, status: updated.status, organisationId: member.businessId };
  });
}

// ---- mandates ---------------------------------------------------------------

export async function grantMandate(prisma, ctx, body) {
  const member = await ownMember(prisma, ctx.business.id, body.memberId);
  if (member.status === 'revoked') throw new HttpError(422, 'A revoked member cannot receive a mandate', { reason: 'memberRevoked' });
  return prisma.$transaction(async (tx) => {
    const mandate = await tx.finOrganizationMandate.create({
      data: { businessId: ctx.business.id, memberId: member.id, scope: body.scope, purpose: body.purpose, startsAt: body.startsAt ?? now(), endsAt: body.endsAt ?? null, grantedById: ctx.member.userId },
    });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'mandate.granted', objectType: 'mandate', objectId: mandate.id, details: { member: member.email, scope: body.scope, endsAt: mandate.endsAt } });
    return mandate;
  });
}

export async function revokeMandate(prisma, ctx, id) {
  const mandate = await prisma.finOrganizationMandate.findFirst({ where: { id, businessId: ctx.business.id } });
  if (!mandate) throw new HttpError(404, 'Mandate not found', { reason: 'mandateNotFound' });
  if (mandate.revokedAt) return;
  await prisma.$transaction(async (tx) => {
    await tx.finOrganizationMandate.update({ where: { id }, data: { revokedAt: now() } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'mandate.revoked', objectType: 'mandate', objectId: id });
  });
}

// ---- journal ----------------------------------------------------------------

export async function listJournal(prisma, businessId, { limit = 100 } = {}) {
  const rows = await prisma.finOrganizationJournal.findMany({
    where: { businessId },
    include: { actor: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows.map((row) => ({ id: row.id, at: row.createdAt, actor: row.actor?.name ?? null, action: row.action, objectType: row.objectType, details: row.details }));
}

// ---- optimistic concurrency (If-Match, DEC-005) -----------------------------

/** `If-Match: <version>` (or `"<version>"`): refused with 412 when the object has moved on. */
export function checkVersion(row, ifMatch) {
  if (!ifMatch) return;
  const wanted = Number(String(ifMatch).replace(/^W\//, '').replace(/"/g, ''));
  if (!Number.isInteger(wanted) || wanted !== row.version) {
    throw new HttpError(412, 'Changed since you read it', { reason: 'versionMismatch', version: row.version });
  }
}

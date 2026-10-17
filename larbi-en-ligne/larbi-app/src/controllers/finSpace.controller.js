import { prisma } from '../config/prisma.js';
import {
  DEFAULT_SHARING,
  INVITE_EXPIRY_DAYS,
  SHARING_LEVELS,
  SHAREABLE_KINDS,
  SPACE_KINDS,
  SPACE_MEMBERS_MAX,
  SPACE_ROLES,
  SPLIT_RULES,
} from '../constants/finSpace.js';
import {
  acceptInvite,
  createSpace,
  deleteSpace,
  inviteToSpace,
  leaveSpace,
  listInvites,
  listMembers,
  listSpaces,
  normaliseSharing,
  ownMembership,
  requireRole,
  revokeInvite,
  setMemberRole,
  spaceTrail,
  updateMySharing,
  updateSpace,
  visibleTo,
} from '../services/finSpace.service.js';
import { totalsByReality } from '../services/finance/dataModel.js';
import { computed } from '../services/finance/contract.js';
import { describeFormula } from '../services/finance/describe.js';

// Shared spaces (P6-13), screens P01 / P04 / CO01 / CP01 / FA01.
//
// Every route needs a session. A space the caller is not a member of answers
// 404, never 403: the client's « accès non autorisé → écran neutre » only works
// if "not yours" and "does not exist" are indistinguishable.

export function getSpaceReferences(req, res) {
  res.json({
    kinds: SPACE_KINDS,
    roles: SPACE_ROLES,
    sharingLevels: SHARING_LEVELS,
    shareableKinds: SHAREABLE_KINDS,
    // Published so the interface can state the rule rather than imply it.
    defaultSharing: DEFAULT_SHARING,
    splitRules: SPLIT_RULES,
    membersMax: SPACE_MEMBERS_MAX,
    inviteExpiryDays: INVITE_EXPIRY_DAYS,
    formulas: ['F002', 'F003', 'F035', 'F041', 'F042'].map(describeFormula),
  });
}

export async function getSpaces(req, res) {
  const rows = await listSpaces(prisma, req.user.id);
  res.json({
    spaces: rows.map(({ space, role, sharing, joinedAt }) => {
      const { _count, ...rest } = space;
      return { ...rest, membres: _count.members, role, joinedAt, monPartage: normaliseSharing(sharing) };
    }),
  });
}

export async function postSpace(req, res) {
  res.status(201).json({ space: await createSpace(prisma, req.user.id, req.body) });
}

export async function getSpace(req, res) {
  const membership = await ownMembership(prisma, req.user.id, req.params.id);
  const [members, invites] = await Promise.all([
    listMembers(prisma, req.user.id, req.params.id),
    // Only an admin sees the pending invitations: who else has been invited is
    // the space's business, not every member's.
    ['owner', 'admin'].includes(membership.role) ? listInvites(prisma, req.params.id) : Promise.resolve(null),
  ]);
  res.json({
    space: membership.space,
    monRole: membership.role,
    monPartage: normaliseSharing(membership.sharing),
    membres: members,
    invitations: invites,
  });
}

export async function patchSpace(req, res) {
  res.json({ space: await updateSpace(prisma, req.user.id, req.params.id, req.body) });
}

export async function removeSpace(req, res) {
  res.json(await deleteSpace(prisma, req.user.id, req.params.id, { reason: req.body?.reason }));
}

export async function getMembers(req, res) {
  res.json({ membres: await listMembers(prisma, req.user.id, req.params.id) });
}

// Changing what I share. Only ever my own matrix — there is no route by which
// an owner or an admin could set somebody else's.
export async function putMySharing(req, res) {
  const member = await updateMySharing(prisma, req.user.id, req.params.id, req.body);
  res.json({ monPartage: member.sharing });
}

export async function putMemberRole(req, res) {
  res.json({ membre: await setMemberRole(prisma, req.user.id, req.params.id, req.params.memberId, req.body.role) });
}

export async function postLeave(req, res) {
  res.json({ membre: await leaveSpace(prisma, req.user.id, req.params.id, { reason: req.body?.reason }) });
}

export async function removeMember(req, res) {
  res.json({ membre: await leaveSpace(prisma, req.user.id, req.params.id, { memberId: req.params.memberId, reason: req.body?.reason }) });
}

export async function postInvite(req, res) {
  const { invite, token } = await inviteToSpace(prisma, req.user.id, req.params.id, { role: req.body.role });
  // The token is returned ONCE and stored only as a hash. The caller puts it in
  // the link it sends; there is no way to read it back afterwards.
  res.status(201).json({ invitation: invite, token });
}

export async function deleteInvite(req, res) {
  res.json(await revokeInvite(prisma, req.user.id, req.params.id, req.params.inviteId));
}

export async function postAcceptInvite(req, res) {
  res.status(201).json({ membre: await acceptInvite(prisma, req.user.id, req.body.token) });
}

export async function getSpaceTrail(req, res) {
  res.json({ journal: await spaceTrail(prisma, req.user.id, req.params.id) });
}

// ---- what the space actually shows -----------------------------------------

/**
 * The shared view of a space: per member, only what THAT member granted to the
 * caller.
 *
 * This is the one endpoint that returns other people's money, so the rule is
 * applied here and nowhere else: `visibleTo` decides, per member and per kind,
 * between nothing, a total, and the rows. A reader's role is not an input — an
 * admin runs the space, they do not get to read a flatmate's salary.
 */
export async function getSharedView(req, res) {
  const me = await ownMembership(prisma, req.user.id, req.params.id);
  const currency = me.space.currency;
  const members = await prisma.finSpaceMember.findMany({
    where: { spaceId: req.params.id, leftAt: null },
    select: { id: true, userId: true, spaceId: true, role: true, sharing: true, leftAt: true, displayName: true, user: { select: { name: true } } },
  });

  const view = [];
  for (const member of members) {
    const levels = Object.fromEntries(SHAREABLE_KINDS.map((kind) => [kind, visibleTo({ reader: me, subject: member, kind })]));
    const entry = {
      userId: member.userId,
      name: member.displayName ?? member.user.name,
      isMe: member.userId === req.user.id,
      niveaux: levels,
      donnees: {},
    };

    // Income (F002) and transactions (F003): the totals at `totals`, the rows
    // at `shared`, nothing at `private`.
    if (levels.incomes !== 'private') {
      const rows = await prisma.finIncome.findMany({
        where: { userId: member.userId, deletedAt: null, archivedAt: null, currency },
        select: { id: true, label: true, value: true, currency: true, frequency: true, status: true },
      });
      const totals = totalsByReality(rows, { currency, monthlyNormalisation: true });
      entry.donnees.incomes = {
        total: computed('F002', totals?.real ?? null, { inputs: { lignes: rows.length, devise: currency }, currency }),
        // At `totals` the rows are NOT sent at all — not sent and hidden by the
        // interface, which would be a leak waiting for a bug.
        lignes: levels.incomes === 'shared' ? rows : null,
      };
    }

    if (levels.transactions !== 'private') {
      const rows = await prisma.finTransaction.findMany({
        where: { userId: member.userId, deletedAt: null, planned: false, currency },
        select: { id: true, kind: true, value: true, currency: true, occurredAt: true, categoryId: true, status: true, note: true },
        orderBy: { occurredAt: 'desc' },
        take: 200,
      });
      const expenses = rows.filter((row) => row.kind === 'expense');
      const totals = totalsByReality(expenses, { currency });
      entry.donnees.transactions = {
        total: computed('F003', totals?.real ?? null, { inputs: { lignes: expenses.length, devise: currency }, currency }),
        lignes: levels.transactions === 'shared' ? rows : null,
      };
    }

    if (levels.assets !== 'private') {
      const rows = await prisma.finAsset.findMany({
        where: { userId: member.userId, deletedAt: null, archivedAt: null, currency },
        select: { id: true, label: true, kind: true, value: true, currency: true, valuedAt: true, liquidity: true, status: true },
      });
      const totals = totalsByReality(rows, { currency });
      entry.donnees.assets = {
        total: computed('F035', totals?.real ?? null, { inputs: { lignes: rows.length, devise: currency }, currency }),
        lignes: levels.assets === 'shared' ? rows : null,
      };
    }

    if (levels.goals !== 'private') {
      const rows = await prisma.finGoal.findMany({
        where: { userId: member.userId, deletedAt: null, archivedAt: null, currency },
        select: { id: true, label: true, target: true, allocated: true, currency: true, targetDate: true, status: true },
      });
      entry.donnees.goals = {
        // A goal's "total" is what has been set aside towards it.
        total: computed('F007', rows.length === 0 ? null : rows.reduce((sum, row) => sum + row.allocated, 0), {
          inputs: { objectifs: rows.length, devise: currency },
          currency,
        }),
        lignes: levels.goals === 'shared' ? rows : null,
      };
    }

    view.push(entry);
  }

  res.json({ espace: me.space, monRole: me.role, partage: view });
}

// Common goals and envelopes (P6-15): a pot that belongs to the SPACE, not to
// one account — the colocation's shared envelope, the couple's shared goal.
// Contributions are facts several people add to, unlike a personal goal's
// single editable "allocated" figure (P6-08).
import { SPACE_GOALS_MAX, SPACE_WRITE_MIN_ROLE } from '../constants/finSpaceGoal.js';
import { roleAtLeast } from '../constants/finSpace.js';
import { HttpError } from '../utils/httpError.js';
import { recordChange, recordCorrection } from './finChange.service.js';
import { ownMembership, requireRole } from './finSpace.service.js';
import { incomesForSplit, liveMembers } from './finShared.service.js';
import { goalProgress, goalRemaining, householdContribution } from './finance/formulas.js';
import { computed } from './finance/contract.js';

export const SPACE_GOAL_ENTITY = 'spaceGoal';
export const SPACE_GOAL_CONTRIBUTION_ENTITY = 'spaceGoalContribution';

const GOAL_SELECT = { id: true, spaceId: true, label: true, target: true, currency: true, targetDate: true, note: true, version: true, archivedAt: true };

export async function listSpaceGoals(prisma, userId, spaceId, { includeArchived = false } = {}) {
  await ownMembership(prisma, userId, spaceId);
  return prisma.finSpaceGoal.findMany({
    where: { spaceId, deletedAt: null, ...(includeArchived ? {} : { archivedAt: null }) },
    select: { ...GOAL_SELECT, contributions: { where: { deletedAt: null }, select: { memberId: true, amount: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function ownSpaceGoal(prisma, userId, spaceId, id) {
  await ownMembership(prisma, userId, spaceId);
  const row = await prisma.finSpaceGoal.findFirst({ where: { id, spaceId, deletedAt: null }, select: GOAL_SELECT });
  if (!row) throw new HttpError(404, 'Goal not found');
  return row;
}

// The goal with its live contributions, for a screen or for `buildSpaceGoalView`.
export async function ownSpaceGoalWithContributions(prisma, userId, spaceId, id) {
  await ownSpaceGoal(prisma, userId, spaceId, id);
  return prisma.finSpaceGoal.findFirst({
    where: { id, spaceId, deletedAt: null },
    select: { ...GOAL_SELECT, contributions: { where: { deletedAt: null }, select: { memberId: true, amount: true } } },
  });
}

export async function createSpaceGoal(prisma, userId, spaceId, body) {
  const me = await requireRole(prisma, userId, spaceId, SPACE_WRITE_MIN_ROLE);
  const count = await prisma.finSpaceGoal.count({ where: { spaceId, deletedAt: null } });
  if (count >= SPACE_GOALS_MAX) throw new HttpError(422, 'Too many goals', { reason: 'tooManyGoals' });
  if (body.currency && body.currency !== me.space.currency) {
    throw new HttpError(422, 'A common goal is in the currency of its space', { reason: 'currencyMismatch', expected: me.space.currency });
  }
  return prisma.$transaction(async (tx) => {
    const goal = await tx.finSpaceGoal.create({
      data: { spaceId, label: body.label, target: body.target, currency: me.space.currency, targetDate: body.targetDate ?? null, note: body.note ?? null },
      select: GOAL_SELECT,
    });
    await recordChange(tx, { userId, entity: SPACE_GOAL_ENTITY, entityId: goal.id, action: 'create', after: { spaceId, label: goal.label, target: goal.target } });
    return goal;
  });
}

export async function updateSpaceGoal(prisma, userId, spaceId, id, body) {
  await requireRole(prisma, userId, spaceId, SPACE_WRITE_MIN_ROLE);
  const before = await ownSpaceGoal(prisma, userId, spaceId, id);
  const { reason, ...fields } = body;
  return prisma.$transaction(async (tx) => {
    const after = await tx.finSpaceGoal.update({ where: { id }, data: { ...fields, version: { increment: 1 } }, select: GOAL_SELECT });
    await recordCorrection(tx, { userId, entity: SPACE_GOAL_ENTITY, entityId: id, before, after, reason: reason ?? null });
    return after;
  });
}

export async function deleteSpaceGoal(prisma, userId, spaceId, id, { reason } = {}) {
  await requireRole(prisma, userId, spaceId, SPACE_WRITE_MIN_ROLE);
  await ownSpaceGoal(prisma, userId, spaceId, id);
  await prisma.$transaction(async (tx) => {
    await tx.finSpaceGoal.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: SPACE_GOAL_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

export async function addContribution(prisma, userId, spaceId, goalId, body) {
  const me = await requireRole(prisma, userId, spaceId, SPACE_WRITE_MIN_ROLE);
  const goal = await ownSpaceGoal(prisma, userId, spaceId, goalId);
  return prisma.$transaction(async (tx) => {
    const contribution = await tx.finSpaceGoalContribution.create({
      data: { spaceGoalId: goal.id, memberId: me.id, amount: body.amount, currency: goal.currency, contributedAt: body.contributedAt, note: body.note ?? null },
    });
    await recordChange(tx, {
      userId,
      entity: SPACE_GOAL_CONTRIBUTION_ENTITY,
      entityId: contribution.id,
      action: 'create',
      after: { spaceGoalId: goal.id, memberId: me.id, amount: body.amount },
    });
    return contribution;
  });
}

// Who may remove a contribution: the member who made it, or an admin — the
// same rule P6-14 already uses for a shared expense.
export async function deleteContribution(prisma, userId, spaceId, goalId, contributionId, { reason } = {}) {
  const me = await ownMembership(prisma, userId, spaceId);
  const contribution = await prisma.finSpaceGoalContribution.findFirst({
    where: { id: contributionId, spaceGoalId: goalId, deletedAt: null },
    select: { id: true, memberId: true },
  });
  if (!contribution) throw new HttpError(404, 'Contribution not found');
  if (contribution.memberId !== me.id && !roleAtLeast(me.role, 'admin')) {
    throw new HttpError(403, 'Only whoever contributed, or an admin, may remove it', { reason: 'notYours' });
  }
  await prisma.$transaction(async (tx) => {
    await tx.finSpaceGoalContribution.update({ where: { id: contributionId }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: SPACE_GOAL_CONTRIBUTION_ENTITY, entityId: contributionId, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id: contributionId };
}

/**
 * The goal's progress (F025/F026), from what was actually contributed — never
 * a free-floating number, because several people pay into this one.
 */
export function buildSpaceGoalView(goal, { now = new Date() } = {}) {
  const allocated = goal.contributions.reduce((sum, contribution) => sum + contribution.amount, 0);
  const byMember = new Map();
  for (const contribution of goal.contributions) byMember.set(contribution.memberId, (byMember.get(contribution.memberId) ?? 0) + contribution.amount);
  const inputs = { cible: goal.target, capital: allocated, devise: goal.currency };
  const answer = (id, result) => computed(id, result, { inputs, currency: goal.currency, now });
  return {
    allocated,
    parMembre: [...byMember.entries()].map(([memberId, amount]) => ({ memberId, amount })),
    progres: answer('F025', goalProgress(allocated, goal.target)),
    reste: answer('F026', goalRemaining(goal.target, allocated)),
  };
}

/**
 * F044 — what each member's "fair share" of what is LEFT to reach the goal
 * would be, proportional to their income. A comparison for the "revue
 * financière" (P6-15), never a bill: the actual split stays whatever the
 * members agree, and this is only ever shown beside it.
 *
 * Needs every live member's consent to share their income IN THIS SPACE
 * (P6-13's matrix, `incomes` kind) — the same condition F042 already applies
 * to a shared expense. Refused by naming who has not consented, rather than
 * falling back to an equal split that would not be what it claims to be.
 */
export async function buildFairShare(prisma, spaceId, goal, allocated) {
  const members = await liveMembers(prisma, spaceId);
  const remaining = Math.max(0, goal.target - allocated);
  try {
    const incomes = await incomesForSplit(prisma, members, goal.currency);
    const weights = members.map((member) => incomes.get(member.id) ?? 0);
    const shares = remaining === 0 ? members.map(() => 0) : householdContribution(remaining, weights);
    return {
      disponible: true,
      parMembre: members.map((member, index) => ({
        memberId: member.id,
        name: member.displayName ?? member.user?.name ?? null,
        partEquitable: shares?.[index] ?? null,
      })),
    };
  } catch (err) {
    if (err instanceof HttpError && err.details?.reason === 'incomeConsentMissing') {
      return { disponible: false, manquants: err.details.members };
    }
    throw err;
  }
}

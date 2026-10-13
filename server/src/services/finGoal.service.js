// Financial goals (P6-08): the writes and the trajectory, screens C09-C11.
// Everything here is scoped to ONE account, exactly like budgets (P6-05).
import { GOAL_TEMPLATE_KEYS } from '../constants/finGoal.js';
import { goalReachDate } from './finance/algorithms.js';
import { computed } from './finance/contract.js';
import { goalProgress, goalRemaining, paymentWithReturn, paymentWithoutReturn, periodicRate } from './finance/formulas.js';
import { allocatedByOtherGoals, markedSavings } from './finSavings.service.js';
import { HttpError } from '../utils/httpError.js';
import { recordChange, recordCorrection } from './finChange.service.js';

export const GOAL_ENTITY = 'goal';

const GOAL_SELECT = {
  id: true,
  label: true,
  templateKey: true,
  target: true,
  currency: true,
  targetDate: true,
  allocated: true,
  monthlyContribution: true,
  rate: true,
  priority: true,
  note: true,
  scope: true,
  source: true,
  status: true,
  confidence: true,
  consentUses: true,
  version: true,
  archivedAt: true,
};

// A fictional goal plays with money that was never really saved — the same
// exemption the budget's status already carries. Everyone else's "capital
// déjà affecté" must fit inside what this account has actually set aside.
async function assertAllocationFits(prisma, userId, { currency, allocated, status, exceptId = null }) {
  if (status === 'fictional' || allocated === 0) return;
  const [pool, claimed] = await Promise.all([
    markedSavings(prisma, userId, currency),
    allocatedByOtherGoals(prisma, userId, currency, exceptId),
  ]);
  if (pool === null || allocated + claimed > pool) {
    throw new HttpError(422, 'Allocated capital exceeds the account\'s marked savings', { reason: 'allocatedExceedsSavings', pool, claimed });
  }
}

export function listGoals(prisma, userId, { includeArchived = false } = {}) {
  return prisma.finGoal.findMany({
    where: { userId, deletedAt: null, ...(includeArchived ? {} : { archivedAt: null }) },
    select: GOAL_SELECT,
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  });
}

export async function ownGoal(prisma, userId, id) {
  const row = await prisma.finGoal.findFirst({ where: { id, userId, deletedAt: null }, select: { ...GOAL_SELECT, userId: true } });
  if (!row) throw new HttpError(404, 'Goal not found');
  return row;
}

export async function createGoal(prisma, userId, body) {
  if (body.templateKey !== undefined && body.templateKey !== null && !GOAL_TEMPLATE_KEYS.includes(body.templateKey)) {
    throw new HttpError(422, 'Unknown goal template', { reason: 'unknownTemplate' });
  }
  const status = body.status ?? 'declared';
  const allocated = body.allocated ?? 0;
  await assertAllocationFits(prisma, userId, { currency: body.currency, allocated, status });

  return prisma.$transaction(async (tx) => {
    const goal = await tx.finGoal.create({
      data: {
        userId,
        label: body.label,
        templateKey: body.templateKey ?? null,
        target: body.target,
        currency: body.currency,
        targetDate: body.targetDate ?? null,
        allocated,
        monthlyContribution: body.monthlyContribution ?? null,
        rate: body.rate ?? null,
        priority: body.priority ?? 0,
        note: body.note ?? null,
        scope: body.scope ?? 'personal',
        consentUses: body.consentUses ?? [],
        source: 'manual',
        status,
      },
      select: GOAL_SELECT,
    });
    await recordChange(tx, {
      userId,
      entity: GOAL_ENTITY,
      entityId: goal.id,
      action: 'create',
      after: { label: goal.label, target: goal.target, currency: goal.currency, allocated: goal.allocated },
    });
    return goal;
  });
}

export async function updateGoal(prisma, userId, id, body) {
  const before = await ownGoal(prisma, userId, id);
  const { reason, ...fields } = body;
  if (fields.templateKey !== undefined && fields.templateKey !== null && !GOAL_TEMPLATE_KEYS.includes(fields.templateKey)) {
    throw new HttpError(422, 'Unknown goal template', { reason: 'unknownTemplate' });
  }
  if (fields.allocated !== undefined || fields.currency !== undefined || fields.status !== undefined) {
    await assertAllocationFits(prisma, userId, {
      currency: fields.currency ?? before.currency,
      allocated: fields.allocated ?? before.allocated,
      status: fields.status ?? before.status,
      exceptId: id,
    });
  }

  return prisma.$transaction(async (tx) => {
    const after = await tx.finGoal.update({ where: { id }, data: { ...fields, version: { increment: 1 } }, select: GOAL_SELECT });
    await recordCorrection(tx, { userId, entity: GOAL_ENTITY, entityId: id, before, after, reason: reason ?? null });
    return after;
  });
}

export async function setGoalArchived(prisma, userId, id, archived, { reason } = {}) {
  const before = await ownGoal(prisma, userId, id);
  const archivedAt = archived ? new Date() : null;
  return prisma.$transaction(async (tx) => {
    const after = await tx.finGoal.update({ where: { id }, data: { archivedAt }, select: GOAL_SELECT });
    await recordChange(tx, { userId, entity: GOAL_ENTITY, entityId: id, action: archived ? 'archive' : 'restore', field: 'archivedAt', before: before.archivedAt, after: archivedAt, reason: reason ?? null });
    return after;
  });
}

export async function deleteGoal(prisma, userId, id, { reason } = {}) {
  await ownGoal(prisma, userId, id);
  await prisma.$transaction(async (tx) => {
    await tx.finGoal.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: GOAL_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

/**
 * The trajectory of one goal (ALG-03, F025-F028, F032): progress, what is
 * left, and — when a contribution is known — an estimated date. Nothing here
 * is a promise: `completed: false` or a missing contribution both come back
 * as "non calculé" rather than a guessed number.
 */
export function buildGoalView(goal, { now = new Date() } = {}) {
  const warnings = [];
  const inputs = { cible: goal.target, capital: goal.allocated, devise: goal.currency, echeance: goal.targetDate, contribution_mensuelle: goal.monthlyContribution, taux_annuel: goal.rate };
  const answer = (id, result, extra = {}) => computed(id, result, { inputs, currency: goal.currency, warnings, now, ...extra });

  const monthlyRate = goal.rate !== null && goal.rate !== undefined ? periodicRate(goal.rate, 12) : 0;
  const contribution = goal.monthlyContribution ?? 0;
  const trajectory = goalReachDate({ capital: goal.allocated, target: goal.target, monthlyRate, contribution });
  if (trajectory && !trajectory.completed) {
    warnings.push("À cette contribution, l'objectif n'est pas atteint dans l'horizon de simulation : ce n'est pas une impossibilité, seulement ce que ce rythme donne.");
  }
  const estimatedDate =
    trajectory && trajectory.completed && trajectory.months > 0
      ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + trajectory.months, now.getUTCDate()))
      : null;

  // What it would take to hit the person's OWN target date, if they set one —
  // read-only arithmetic shown beside the trajectory, never written back.
  let requiredContribution = null;
  if (goal.targetDate) {
    const monthsLeft = Math.max(1, (goal.targetDate.getUTCFullYear() - now.getUTCFullYear()) * 12 + (goal.targetDate.getUTCMonth() - now.getUTCMonth()));
    requiredContribution =
      monthlyRate && monthlyRate > 0
        ? answer('F032', paymentWithReturn({ target: goal.target, initial: goal.allocated, rate: monthlyRate, periods: monthsLeft }))
        : answer('F028', paymentWithoutReturn({ target: goal.target, capital: goal.allocated, monthsLeft }));
  }

  return {
    progres: answer('F025', goalProgress(goal.allocated, goal.target)),
    reste: answer('F026', goalRemaining(goal.target, goal.allocated)),
    trajectoire: { mois: trajectory?.completed ? trajectory.months : null, dateEstimee: estimatedDate, atteignable: trajectory?.completed ?? null },
    contributionRequise: requiredContribution,
    avertissements: warnings,
  };
}

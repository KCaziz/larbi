// Financial goals (P6-08): the writes and the trajectory, screens C09-C11.
// Everything here is scoped to ONE account, exactly like budgets (P6-05).
import { SAVINGS_ACCOUNT_TYPE, accountType } from '../constants/finAccounts.js';
import { accountsWithBalances, createTransfer, usableAccount } from './finAccount.service.js';
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
  progressStatus: true,
  accountId: true,
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
async function assertAllocationFits(prisma, userId, { currency, allocated, status, accountId = null, exceptId = null }) {
  // A goal on its own account (P8-12) holds what that account holds: no
  // declared capital to bound.
  if (status === 'fictional' || allocated === 0 || accountId) return;
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
  if (body.accountId) await usableAccount(prisma, userId, body.accountId, body.currency);
  await assertAllocationFits(prisma, userId, { currency: body.currency, allocated, status, accountId: body.accountId ?? null });

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
        progressStatus: body.progressStatus ?? 'active',
        accountId: body.accountId ?? null,
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
  if (fields.accountId) await usableAccount(prisma, userId, fields.accountId, fields.currency ?? before.currency);
  if (fields.allocated !== undefined || fields.currency !== undefined || fields.status !== undefined) {
    await assertAllocationFits(prisma, userId, {
      currency: fields.currency ?? before.currency,
      allocated: fields.allocated ?? before.allocated,
      status: fields.status ?? before.status,
      accountId: fields.accountId === undefined ? before.accountId : fields.accountId,
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

  // PB-F014 — progress, its display capped at 100 % with the excess apart;
  // PB-F015 — what is left; PB-F016 — the minimum months at the planned
  // contribution, not computable without one.
  const progress = goalProgress(goal.allocated, goal.target);
  const left = goalRemaining(goal.target, goal.allocated);
  const minimumMonths = left === null || !(goal.monthlyContribution > 0) ? null : Math.ceil(left / goal.monthlyContribution);
  return {
    progres: answer('PB-F014', progress === null ? null : Math.min(1, progress)),
    excedent: progress !== null && progress > 1 ? goal.allocated - goal.target : 0,
    reste: answer('PB-F015', left),
    moisMinimum: answer('PB-F016', minimumMonths),
    trajectoire: { mois: trajectory?.completed ? trajectory.months : null, dateEstimee: estimatedDate, atteignable: trajectory?.completed ?? null },
    contributionRequise: requiredContribution,
    avertissements: warnings,
  };
}

// ---- P8-12: the goal's account, its contributions, its scenarios -------------

/**
 * The goals with their capital: a goal on its own account holds that
 * account's balance (PB-F001) — a contribution is then a transfer, never a
 * figure typed twice (« jamais déduite deux fois »); a goal without an account
 * keeps the capital declared on it.
 */
export async function goalsWithCapital(prisma, userId, goals) {
  if (!goals.some((goal) => goal.accountId)) return goals.map((goal) => ({ ...goal, capitalSource: 'declared' }));
  const { accounts } = await accountsWithBalances(prisma, userId, { includeArchived: true });
  const balances = new Map(accounts.map((account) => [account.id, account.solde.resultat]));
  return goals.map((goal) =>
    goal.accountId && balances.has(goal.accountId)
      ? { ...goal, allocated: Math.max(0, balances.get(goal.accountId) ?? 0), capitalSource: 'account' }
      : { ...goal, capitalSource: 'declared' },
  );
}

/**
 * The contributions of one goal (tab 10B): the transfers into its account,
 * each with the account it came from.
 */
export async function listGoalContributions(prisma, userId, id) {
  const goal = await ownGoal(prisma, userId, id);
  if (!goal.accountId) return [];
  const incoming = await prisma.finTransaction.findMany({
    where: { userId, accountId: goal.accountId, kind: 'transfer_in', deletedAt: null },
    select: { id: true, transferId: true, value: true, currency: true, occurredAt: true, note: true, status: true },
    orderBy: { occurredAt: 'desc' },
    take: 100,
  });
  const sources = await prisma.finTransaction.findMany({
    where: { userId, transferId: { in: incoming.map((row) => row.transferId) }, kind: 'transfer_out' },
    select: { transferId: true, account: { select: { id: true, label: true } } },
  });
  const from = new Map(sources.map((row) => [row.transferId, row.account]));
  return incoming.map((row) => ({ ...row, fromAccount: from.get(row.transferId) ?? null }));
}

/**
 * A real contribution (ARC-04): a transfer from one of the person's accounts
 * to the goal's account. A goal with no account yet receives its own savings
 * account (AC-04) on its first contribution — named after it, so the person
 * finds it in « Mes comptes ».
 */
export async function addGoalContribution(prisma, userId, id, body) {
  const goal = await ownGoal(prisma, userId, id);
  if (goal.status === 'fictional') throw new HttpError(422, 'A fictional goal takes no real money', { reason: 'fictionalGoal' });
  let accountId = goal.accountId;
  if (!accountId) {
    const type = accountType(SAVINGS_ACCOUNT_TYPE);
    const account = await prisma.finAccount.create({
      data: {
        userId,
        label: goal.label,
        type: SAVINGS_ACCOUNT_TYPE,
        currency: goal.currency,
        includeInTotal: type.includeInTotal,
        includeInNetWorth: type.includeInNetWorth,
        source: 'computed',
        status: 'declared',
      },
      select: { id: true },
    });
    accountId = account.id;
    // What was declared on the goal before it had an account stays declared
    // on it: the account starts at 0 and only real transfers fill it.
    await prisma.finGoal.update({ where: { id }, data: { accountId, version: { increment: 1 } } });
  }
  const transfer = await createTransfer(prisma, userId, {
    fromAccountId: body.fromAccountId,
    toAccountId: accountId,
    value: body.value,
    occurredAt: body.occurredAt,
    note: body.note ?? goal.label,
  });
  return { transfer, accountId };
}

/**
 * A scenario (C11, in red; tab 10B « simulation avec rendement si activée »):
 * the person's own parameters — monthly contribution, horizon, inflation,
 * hypothetical return, yearly raise of the contribution — month by month
 * (ALG-03). Read-only: nothing is written, and every parameter travels back
 * in `hypotheses`.
 */
export function goalScenario(goal, params, { now = new Date() } = {}) {
  const monthlyRate = params.rate ? Math.pow(1 + params.rate, 1 / 12) - 1 : 0;
  const inflation = params.inflation ?? 0;
  const raise = params.annualIncrease ?? 0;
  const horizon = params.months ?? null;
  const limit = horizon ?? 600;
  let capital = goal.allocated;
  let contribution = params.monthlyContribution ?? goal.monthlyContribution ?? 0;
  let reachedAt = null;
  for (let month = 1; month <= limit; month += 1) {
    capital = capital * (1 + monthlyRate) + contribution;
    if (month % 12 === 0) contribution = contribution * (1 + raise);
    // The target in the money of that month: inflation raises it over time.
    const target = goal.target * Math.pow(1 + inflation, month / 12);
    if (reachedAt === null && capital >= target) reachedAt = month;
  }
  const finalTarget = Math.round(goal.target * Math.pow(1 + inflation, limit / 12));
  const hypotheses = {
    contribution_mensuelle: params.monthlyContribution ?? goal.monthlyContribution ?? 0,
    horizon_mois: horizon,
    inflation_annuelle: inflation,
    rendement_annuel_hypothetique: params.rate ?? 0,
    hausse_annuelle_contribution: raise,
  };
  const answer = (result) => computed('ALG-03', result, { inputs: { cible: goal.target, capital: goal.allocated }, hypotheses, now });
  return {
    moisPourAtteindre: answer(reachedAt),
    dateAtteinte: reachedAt === null ? null : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + reachedAt, now.getUTCDate())),
    capitalFinHorizon: horizon === null ? null : Math.round(capital),
    cibleFinHorizon: horizon === null ? null : finalTarget,
    hypotheses,
  };
}

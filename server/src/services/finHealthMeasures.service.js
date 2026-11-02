import { CLEARING_WINDOW_DAYS, FRESHNESS_THRESHOLD_DAYS } from '../constants/finHealth.js';
import { freshnessOf, goalTrajectory } from './finHealth.service.js';

// What the two dimensions of the health index that were not measured before
// (« Objectifs » and « Qualité des données », client's answer H of 2026-11-02)
// are measured FROM. The scoring rules are pure and live in finHealth.service.js;
// this file only reads the rows they need and turns them into plain numbers.
//
// Three choices of ours, where his rules leave a gap — to be shown to him:
//   - « capital prévu à date » of a goal with a target date is linear from the
//     day the goal was created to that date; of a goal with only a monthly
//     contribution, that contribution times the whole months elapsed; of a goal
//     with neither, nothing can be planned, so the goal is NOT scored (never 0);
//   - « contribution faite à temps » = a calendar month (counted from the goal's
//     creation) in which the transfers into the goal's account reach the
//     planned monthly contribution;
//   - the « champs nécessaires » of the completeness are the onboarding
//     questions that apply to the person (the screen already tracks them).

const DAY = 24 * 3600 * 1000;
const daysBetween = (from, to) => (to.getTime() - from.getTime()) / DAY;

// Whole months from `from` to `to` (never negative).
const wholeMonths = (from, to) => Math.max(0, (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth()) - (to.getUTCDate() < from.getUTCDate() ? 1 : 0));

/** Capital planned by now, in the smallest unit, or null when the goal gives nothing to plan from. */
export function plannedToDate(goal, now) {
  const start = goal.createdAt;
  if (goal.targetDate) {
    const total = goal.targetDate.getTime() - start.getTime();
    if (total <= 0 || now >= goal.targetDate) return goal.target;
    return goal.target * Math.max(0, (now.getTime() - start.getTime()) / total);
  }
  if (goal.monthlyContribution) return goal.monthlyContribution * wholeMonths(start, now);
  return null;
}

/**
 * One line per active goal that can be scored: its trajectory, its regularity
 * (when a contribution rhythm and an account exist) and its priority.
 * The emergency fund is left out: the reserve dimension already measures it.
 */
export async function goalLinesOf(prisma, userId, { now = new Date() } = {}) {
  const goals = await prisma.finGoal.findMany({
    where: { userId, deletedAt: null, archivedAt: null, progressStatus: 'active', OR: [{ templateKey: null }, { templateKey: { not: 'emergency' } }] },
    select: { id: true, target: true, allocated: true, targetDate: true, monthlyContribution: true, accountId: true, priority: true, createdAt: true },
  });
  const lines = [];
  for (const goal of goals) {
    const planned = plannedToDate(goal, now);
    const trajectory = planned === null ? null : goalTrajectory(goal.allocated, planned);
    if (trajectory === null) continue;
    lines.push({ trajectory, regularity: await regularityOf(prisma, userId, goal, now), priority: goal.priority });
  }
  return lines;
}

// Contributions made on time / contributions expected × 100, or null without a rhythm.
async function regularityOf(prisma, userId, goal, now) {
  if (!goal.monthlyContribution || !goal.accountId) return null;
  const expected = wholeMonths(goal.createdAt, now);
  if (expected === 0) return null;
  const transfers = await prisma.finTransaction.findMany({
    where: { userId, accountId: goal.accountId, kind: 'transfer_in', deletedAt: null, planned: false, occurredAt: { gte: goal.createdAt, lte: now } },
    select: { value: true, occurredAt: true },
  });
  const perMonth = new Map();
  for (const transfer of transfers) {
    const index = wholeMonths(goal.createdAt, transfer.occurredAt);
    perMonth.set(index, (perMonth.get(index) ?? 0) + transfer.value);
  }
  let made = 0;
  for (let index = 0; index < expected; index += 1) if ((perMonth.get(index) ?? 0) >= goal.monthlyContribution) made += 1;
  return (made / expected) * 100;
}

/** { completeness, freshness, clearing } on 0-100, each null when it does not apply. */
export async function dataQualityMeasures(prisma, userId, { onboarding = null, now = new Date() } = {}) {
  const completeness = onboarding && Number.isFinite(onboarding.ratio) ? onboarding.ratio * 100 : null;

  // Pointage: real movements of the last 30 days that were checked or reconciled.
  const since = new Date(now.getTime() - CLEARING_WINDOW_DAYS * DAY);
  const eligible = await prisma.finTransaction.groupBy({
    by: ['clearing'],
    where: { userId, deletedAt: null, planned: false, occurredAt: { gte: since, lte: now } },
    _count: { _all: true },
  });
  const total = eligible.reduce((sum, row) => sum + row._count._all, 0);
  const cleared = eligible.filter((row) => row.clearing === 'checked' || row.clearing === 'reconciled').reduce((sum, row) => sum + row._count._all, 0);
  const clearing = total === 0 ? null : (cleared / total) * 100;

  // Freshness, one item per piece of data, each by its own threshold.
  const scores = [];
  const add = (date, threshold) => {
    const score = date ? freshnessOf(daysBetween(date, now), threshold) : null;
    if (score !== null) scores.push(score);
  };

  const accounts = await prisma.finAccount.findMany({ where: { userId, deletedAt: null, archivedAt: null, source: 'manual' }, select: { id: true, updatedAt: true } });
  if (accounts.length > 0) {
    const last = await prisma.finTransaction.groupBy({
      by: ['accountId'],
      where: { userId, deletedAt: null, planned: false, accountId: { in: accounts.map((account) => account.id) }, occurredAt: { lte: now } },
      _max: { occurredAt: true },
    });
    const lastBy = new Map(last.map((row) => [row.accountId, row._max.occurredAt]));
    for (const account of accounts) {
      const moved = lastBy.get(account.id);
      add(moved && moved > account.updatedAt ? moved : account.updatedAt, FRESHNESS_THRESHOLD_DAYS.accountBalance);
    }
  }

  const incomes = await prisma.finIncome.findMany({ where: { userId, deletedAt: null, OR: [{ endDate: null }, { endDate: { gte: now } }] }, select: { updatedAt: true } });
  if (incomes.length > 0) {
    const lastIncome = await prisma.finTransaction.findFirst({ where: { userId, kind: 'income', deletedAt: null, planned: false, occurredAt: { lte: now } }, orderBy: { occurredAt: 'desc' }, select: { occurredAt: true } });
    for (const income of incomes) add(lastIncome && lastIncome.occurredAt > income.updatedAt ? lastIncome.occurredAt : income.updatedAt, FRESHNESS_THRESHOLD_DAYS.recurringIncome);
  }

  const debts = await prisma.finDebt.findMany({ where: { userId, deletedAt: null, archivedAt: null }, select: { updatedAt: true } });
  for (const debt of debts) add(debt.updatedAt, FRESHNESS_THRESHOLD_DAYS.debt);

  const assets = await prisma.finAsset.findMany({ where: { userId, deletedAt: null, archivedAt: null, status: { not: 'fictional' } }, select: { valuedAt: true } });
  for (const asset of assets) add(asset.valuedAt, FRESHNESS_THRESHOLD_DAYS.valuation);

  // The professional situation and the profile are answers of the onboarding.
  const profile = await prisma.finOnboarding.findUnique({ where: { userId }, select: { updatedAt: true } });
  if (profile) add(profile.updatedAt, FRESHNESS_THRESHOLD_DAYS.profile);

  const freshness = scores.length === 0 ? null : scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return { completeness, freshness, clearing };
}

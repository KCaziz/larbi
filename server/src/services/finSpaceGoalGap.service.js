// Delay on a common goal (P9-17, client's answer of 2026-11-02).
//
//   expected to date = the member's share x the due dates already passed
//   gap              = max(0, expected to date - what they put in)
//
// First alert: 3 days after a due date, gap >= max(500 DA; 10 % of expected).
// Reinforced: gap >= max(1 000 DA; 25 % of expected), or a whole period unpaid
// 7 days after its due date. One reminder at +7 days, then nothing more: the
// event stays visible in the notifications. Without a calendar there is no
// delay to measure, only the milestones 25, 50, 75 and 100 %.
//
// The member concerned receives the detail; the owner and the admins only learn
// that « a planned contribution is still to complete », with no name and no
// amount (the space's permissions do not let them see it by right).

import { GOAL_GAP, GOAL_MILESTONES } from '../constants/finSpaceGoal.js';
import { roleAtLeast } from '../constants/finSpace.js';
import { createNotification } from './finNotification.service.js';

const DAY = 24 * 3600 * 1000;
const dayStart = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const dayKey = (date) => date.toISOString().slice(0, 10);

// The same day of the month `months` later, or the month's last day when it is shorter.
function addMonths(date, months) {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), last));
  return target;
}

/** The due dates up to `until` (and never past the goal's own date). */
export function dueDates({ firstDueAt, everyMonths, targetDate = null }, until) {
  const dates = [];
  const limit = targetDate && targetDate < until ? targetDate : until;
  for (let k = 0; k < 600; k += 1) {
    const due = addMonths(firstDueAt, k * everyMonths);
    if (dayStart(due) > dayStart(limit)) break;
    dates.push(due);
  }
  return dates;
}

/**
 * Where one member stands. `level` is null (nothing to say), 'late' or
 * 'reinforced'; `reminder` is true from the second step on.
 */
export function memberGap({ share, firstDueAt, everyMonths, targetDate = null, paid, currency, now }) {
  const dues = dueDates({ firstDueAt, everyMonths, targetDate }, now);
  if (dues.length === 0 || share <= 0) return null;
  const lastDue = dues.at(-1);
  const expected = share * dues.length;
  const gap = Math.max(0, expected - paid);
  if (gap === 0) return { expected, gap, lastDue, level: null, reminder: false };
  const days = Math.round((dayStart(now).getTime() - dayStart(lastDue).getTime()) / DAY);
  // The client's floors are in dinars; for another currency only the percentages apply.
  const floor = (min) => (currency === 'DZD' ? min : 0);
  const first = gap >= Math.max(floor(GOAL_GAP.firstMinDzd), GOAL_GAP.firstPercent * expected);
  const strong = gap >= Math.max(floor(GOAL_GAP.reinforcedMinDzd), GOAL_GAP.reinforcedPercent * expected);
  let level = null;
  if ((days >= GOAL_GAP.firstAfterDays && strong) || (days >= GOAL_GAP.unpaidPeriodAfterDays && gap >= share)) level = 'reinforced';
  else if (days >= GOAL_GAP.firstAfterDays && first) level = 'late';
  return { expected, gap, lastDue, level, reminder: level !== null && days >= GOAL_GAP.reminderAfterDays };
}

/** The alerts of one person on the common goals of the spaces they belong to. */
export async function scanGoalGaps(prisma, userId, memberships, now) {
  for (const { id: memberId, spaceId, role } of memberships) {
    // eslint-disable-next-line no-await-in-loop -- one space at a time
    const goals = await prisma.finSpaceGoal.findMany({
      where: { spaceId, deletedAt: null, archivedAt: null },
      select: {
        id: true,
        label: true,
        target: true,
        currency: true,
        targetDate: true,
        contributionEveryMonths: true,
        firstDueAt: true,
        shares: { select: { memberId: true, amount: true } },
        contributions: { where: { deletedAt: null, contributedAt: { lte: now } }, select: { memberId: true, amount: true } },
      },
    });
    const link = `/partage/${spaceId}/objectifs`;
    for (const goal of goals) {
      const paidBy = new Map();
      for (const row of goal.contributions) paidBy.set(row.memberId, (paidBy.get(row.memberId) ?? 0) + row.amount);
      const total = [...paidBy.values()].reduce((sum, value) => sum + value, 0);

      // Milestones: only the highest one reached is said, once.
      const reached = GOAL_MILESTONES.filter((percent) => total * 100 >= goal.target * percent).at(-1);
      if (reached) {
        // eslint-disable-next-line no-await-in-loop
        await createNotification(prisma, userId, { type: 'space_goal_gap', params: { event: 'milestone', label: goal.label, percent: reached }, link, referenceId: `${goal.id}:m${reached}`, dedupeBy: 'reference' });
      }

      if (!goal.contributionEveryMonths || !goal.firstDueAt) continue;
      for (const { memberId: owner, amount } of goal.shares) {
        const state = memberGap({ share: amount, firstDueAt: goal.firstDueAt, everyMonths: goal.contributionEveryMonths, targetDate: goal.targetDate, paid: paidBy.get(owner) ?? 0, currency: goal.currency, now });
        if (!state?.level) continue;
        const base = `${goal.id}:${owner}:${dayKey(state.lastDue)}`;
        if (owner === memberId) {
          const params = { label: goal.label, gap: state.gap, expected: state.expected, currency: goal.currency, due: dayKey(state.lastDue) };
          // eslint-disable-next-line no-await-in-loop
          await createNotification(prisma, userId, { type: 'space_goal_gap', params: { event: state.level, ...params }, link, referenceId: `${base}:${state.level}`, dedupeBy: 'reference' });
          if (state.reminder) {
            // eslint-disable-next-line no-await-in-loop
            await createNotification(prisma, userId, { type: 'space_goal_gap', params: { event: 'reminder', ...params }, link, referenceId: `${base}:reminder`, dedupeBy: 'reference' });
          }
        } else if (roleAtLeast(role, 'admin')) {
          // eslint-disable-next-line no-await-in-loop
          await createNotification(prisma, userId, { type: 'space_goal_gap', params: { event: 'admin', label: goal.label }, link, referenceId: `${base}:admin`, dedupeBy: 'reference' });
        }
      }
    }
  }
}

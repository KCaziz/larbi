// Alerts of Gestion commune (P9-09, tab 14 of the collective workbook).
//
// Two kinds, kept apart:
//   - EVENT alerts, raised the moment something happens in a space: somebody
//     joins or leaves, a new expense, a budget crossing 80 % / 100 %, a
//     settlement, a permission changed. They go to the OTHER members, never to
//     the one who just acted.
//   - SCANNED alerts, raised when the person's alerts are generated: a bill at
//     J-7 / J-3 / J, a task due soon or overdue, a contribution expected.
//
// An alert says that something happened or is due; it never contains an amount
// a member did not already have the right to see in the space.
import { createNotification } from './finNotification.service.js';
import { scanGoalGaps } from './finSpaceGoalGap.service.js';

const DAY = 24 * 3600 * 1000;
const BILL_DAYS = [7, 3, 0];
const TASK_SOON_DAYS = 2;

const dayKey = (date) => date.toISOString().slice(0, 10);
const dayStart = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

/**
 * Tells the other live members of a space. A failure to notify never breaks
 * the action that caused it: the expense is recorded either way.
 */
export async function notifySpace(prisma, spaceId, exceptUserId, { type, params = {}, link, referenceId, dedupeBy = 'reference', onlyUserIds = null }) {
  try {
    const members = await prisma.finSpaceMember.findMany({
      where: { spaceId, leftAt: null, ...(exceptUserId ? { userId: { not: exceptUserId } } : {}), ...(onlyUserIds ? { userId: { in: onlyUserIds } } : {}) },
      select: { userId: true },
    });
    for (const member of members) {
      // eslint-disable-next-line no-await-in-loop -- a handful of members
      await createNotification(prisma, member.userId, { type, params, link, referenceId, dedupeBy });
    }
  } catch {
    /* the alert is a courtesy; the write that triggered it already succeeded */
  }
}

/**
 * After an expense: has its envelope just crossed 80 % or 100 %? Everybody in
 * the space is told once per level (the level only goes up).
 */
export async function alertBudgetLevel(prisma, spaceId, { collectiveCategory, occurredAt }, spaceBudgetsView, userId) {
  if (!collectiveCategory) return;
  try {
    const period = occurredAt.toISOString().slice(0, 7);
    const view = await spaceBudgetsView(prisma, userId, spaceId, period);
    const line = view.budgets.find((budget) => budget.category === collectiveCategory);
    if (!line || line.alerte === 'none') return;
    await notifySpace(prisma, spaceId, null, {
      type: 'space_budget',
      params: { niveau: line.alerte, category: collectiveCategory, period },
      link: `/partage/${spaceId}/budgets`,
      referenceId: `${line.id}`,
      dedupeBy: 'level',
    });
  } catch {
    /* see notifySpace */
  }
}

/** The scanned alerts of one person, across the spaces they belong to. */
export async function scanSpaceAlerts(prisma, userId, now = new Date()) {
  const memberships = await prisma.finSpaceMember.findMany({ where: { userId, leftAt: null, space: { deletedAt: null } }, select: { id: true, spaceId: true, role: true } });
  const today = dayStart(now);
  // P9-17: delay on a common goal, and its milestones.
  await scanGoalGaps(prisma, userId, memberships, now);
  for (const { id: memberId, spaceId } of memberships) {
    const link = (path) => `/partage/${spaceId}/${path}`;
    // Bills: a planned shared expense, J-7 / J-3 / J.
    // eslint-disable-next-line no-await-in-loop -- one space at a time
    const bills = await prisma.finSharedExpense.findMany({
      where: { spaceId, deletedAt: null, lifecycle: 'planned', occurredAt: { gte: today, lt: new Date(today.getTime() + 8 * DAY) } },
      select: { id: true, label: true, occurredAt: true },
    });
    for (const bill of bills) {
      const days = Math.round((dayStart(bill.occurredAt).getTime() - today.getTime()) / DAY);
      if (!BILL_DAYS.includes(days)) continue;
      // eslint-disable-next-line no-await-in-loop
      await createNotification(prisma, userId, { type: 'space_bill', params: { label: bill.label, days, date: dayKey(bill.occurredAt) }, link: link('calendrier'), referenceId: `${bill.id}:${days}`, dedupeBy: 'reference' });
    }
    // Tasks on this person: due within two days, or overdue.
    // eslint-disable-next-line no-await-in-loop
    const tasks = await prisma.finSpaceTask.findMany({
      where: { spaceId, deletedAt: null, assigneeId: memberId, status: { in: ['todo', 'doing'] }, dueDate: { not: null, lt: new Date(today.getTime() + (TASK_SOON_DAYS + 1) * DAY) } },
      select: { id: true, title: true, dueDate: true },
    });
    for (const task of tasks) {
      const overdue = dayStart(task.dueDate).getTime() < today.getTime();
      // eslint-disable-next-line no-await-in-loop
      await createNotification(prisma, userId, {
        type: 'space_task',
        params: { label: task.title, niveau: overdue ? 'overdue' : 'soon', date: dayKey(task.dueDate) },
        link: link('taches'),
        referenceId: `${task.id}`,
        dedupeBy: 'level',
      });
    }
    // A contribution promised by this person whose date has come, still planned.
    // eslint-disable-next-line no-await-in-loop
    const expected = await prisma.finSpaceInflow.findMany({
      where: { spaceId, deletedAt: null, kind: 'contribution', status: 'planned', memberId, occurredAt: { lte: now } },
      select: { id: true, value: true, occurredAt: true },
    });
    for (const inflow of expected) {
      // eslint-disable-next-line no-await-in-loop
      await createNotification(prisma, userId, { type: 'space_contribution', params: { value: inflow.value, date: dayKey(inflow.occurredAt) }, link: link('ressources'), referenceId: inflow.id, dedupeBy: 'reference' });
    }
  }
}

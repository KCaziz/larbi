// The unified calendar of a space (P9-07, tab 09): bills, tasks, settlements and
// common goals on one filterable timeline. A READ: it creates nothing.
//
// A bill is a shared expense. It stays « planned » until it is confirmed, then
// reads as « confirmed » — the same row, which is why confirming it twice can
// never double it (the mechanism of P6-15 and P9-04). A cancelled one is not on
// the calendar: it no longer exists as something to pay.
import { ownMembership } from './finSpace.service.js';

export const CALENDAR_TYPES = ['bills', 'tasks', 'settlements', 'goals'];

const monthRange = (month) => {
  const [year, number] = month.split('-').map(Number);
  return { gte: new Date(Date.UTC(year, number - 1, 1)), lt: new Date(Date.UTC(year, number, 1)) };
};

export async function spaceCalendar(prisma, userId, spaceId, { month, types = CALENDAR_TYPES }) {
  const me = await ownMembership(prisma, userId, spaceId);
  const range = monthRange(month);
  const wants = (type) => types.includes(type);
  const [bills, tasks, settlements, goals] = await Promise.all([
    wants('bills')
      ? prisma.finSharedExpense.findMany({
          where: { spaceId, deletedAt: null, lifecycle: { in: ['planned', 'done'] }, occurredAt: range },
          select: { id: true, label: true, value: true, currency: true, occurredAt: true, lifecycle: true, collectiveCategory: true },
        })
      : [],
    wants('tasks')
      ? prisma.finSpaceTask.findMany({
          where: { spaceId, deletedAt: null, status: { not: 'cancelled' }, dueDate: range },
          select: { id: true, title: true, dueDate: true, status: true, priority: true, assigneeId: true },
        })
      : [],
    wants('settlements')
      ? prisma.finSettlement.findMany({
          where: { spaceId, deletedAt: null, settledAt: range },
          select: { id: true, fromId: true, toId: true, value: true, currency: true, settledAt: true },
        })
      : [],
    wants('goals')
      ? prisma.finSpaceGoal.findMany({
          where: { spaceId, deletedAt: null, archivedAt: null, targetDate: range },
          select: { id: true, label: true, target: true, currency: true, targetDate: true },
        })
      : [],
  ]);

  const events = [
    ...bills.map((row) => ({
      type: 'bills',
      id: row.id,
      date: row.occurredAt,
      title: row.label,
      amount: row.value,
      currency: row.currency,
      // planned until confirmed, then a real expense
      status: row.lifecycle === 'planned' ? 'planned' : 'confirmed',
      category: row.collectiveCategory,
    })),
    ...tasks.map((row) => ({ type: 'tasks', id: row.id, date: row.dueDate, title: row.title, status: row.status, priority: row.priority, assigneeId: row.assigneeId })),
    ...settlements.map((row) => ({ type: 'settlements', id: row.id, date: row.settledAt, amount: row.value, currency: row.currency, fromId: row.fromId, toId: row.toId, status: 'declared' })),
    ...goals.map((row) => ({ type: 'goals', id: row.id, date: row.targetDate, title: row.label, amount: row.target, currency: row.currency, status: 'target' })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime() || a.type.localeCompare(b.type));

  return { month, currency: me.space.currency, types, events };
}

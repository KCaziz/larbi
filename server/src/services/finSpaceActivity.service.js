// Recent activity of a space (P9-09, CD-09): what happened lately, newest first.
//
// Built only from what a space holds in common — shared expenses, settlements,
// tasks, entries to the common pot, new members. It never reads a personal
// transaction, a personal budget, or what a member chose to keep private in
// their sharing matrix; and it never names the personal account behind an
// expense. Every member, a `viewer` included, reads the same activity: it is
// the space's, not anyone's.
import { ownMembership } from './finSpace.service.js';

export const ACTIVITY_LIMIT = 30;

export async function spaceActivity(prisma, userId, spaceId, { limit = ACTIVITY_LIMIT } = {}) {
  const me = await ownMembership(prisma, userId, spaceId);
  const take = Math.min(limit, ACTIVITY_LIMIT);
  const [members, expenses, settlements, tasks, inflows] = await Promise.all([
    prisma.finSpaceMember.findMany({ where: { spaceId }, select: { id: true, displayName: true, joinedAt: true, user: { select: { name: true } } } }),
    prisma.finSharedExpense.findMany({
      where: { spaceId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take,
      select: { id: true, label: true, value: true, currency: true, lifecycle: true, recordedById: true, createdAt: true },
    }),
    prisma.finSettlement.findMany({
      where: { spaceId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take,
      select: { id: true, fromId: true, toId: true, value: true, currency: true, recordedById: true, createdAt: true },
    }),
    prisma.finSpaceTask.findMany({ where: { spaceId, deletedAt: null }, orderBy: { createdAt: 'desc' }, take, select: { id: true, title: true, status: true, createdById: true, createdAt: true } }),
    prisma.finSpaceInflow.findMany({
      where: { spaceId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take,
      select: { id: true, kind: true, value: true, status: true, recordedById: true, createdAt: true },
    }),
  ]);
  const names = new Map(members.map((member) => [member.id, member.displayName ?? member.user?.name ?? null]));
  const currency = me.space.currency;

  const items = [
    ...expenses.map((row) => ({ type: 'expense', id: row.id, at: row.createdAt, actor: names.get(row.recordedById) ?? null, label: row.label, amount: row.value, currency: row.currency, status: row.lifecycle })),
    ...settlements.map((row) => ({ type: 'settlement', id: row.id, at: row.createdAt, actor: names.get(row.recordedById) ?? null, from: names.get(row.fromId) ?? null, to: names.get(row.toId) ?? null, amount: row.value, currency: row.currency })),
    ...tasks.map((row) => ({ type: 'task', id: row.id, at: row.createdAt, actor: names.get(row.createdById) ?? null, label: row.title, status: row.status })),
    ...inflows.map((row) => ({ type: 'inflow', id: row.id, at: row.createdAt, actor: names.get(row.recordedById) ?? null, kind: row.kind, amount: row.value, currency, status: row.status })),
    ...members.map((member) => ({ type: 'member', id: member.id, at: member.joinedAt, actor: names.get(member.id) ?? null })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, take);

  return { activity: items };
}

// The history of a space, month by month (P8-32, Gestion commune): what the
// common pot held at the end of each month and what each member paid during it.
// The pot is the one of `spaceResources` (confirmed entries minus realised
// expenses), read at a date; the per-member figure is what the member PAID,
// whatever their share (their share is the balance's business, not a history).
import { ownMembership } from './finSpace.service.js';
import { liveMembers } from './finShared.service.js';

const monthKey = (date) => date.toISOString().slice(0, 7);

export async function spaceHistory(prisma, userId, spaceId, { months = 6, now = new Date() } = {}) {
  const me = await ownMembership(prisma, userId, spaceId);
  const currency = me.space.currency;
  const ends = Array.from({ length: months }, (_, index) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1 - index) + 1, 1) - 1));
  const windowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));

  const [members, expenses, inflows] = await Promise.all([
    liveMembers(prisma, spaceId, { includeLeft: true }),
    prisma.finSharedExpense.findMany({ where: { spaceId, deletedAt: null, lifecycle: 'done', currency }, select: { payerId: true, value: true, occurredAt: true } }),
    prisma.finSpaceInflow.findMany({ where: { spaceId, deletedAt: null, status: 'confirmed' }, select: { kind: true, value: true, occurredAt: true } }),
  ]);
  const names = members.map((member) => ({ memberId: member.id, name: member.displayName ?? member.user?.name ?? null }));

  const points = ends.map((end) => {
    const month = monthKey(end);
    const entered = inflows.filter((row) => row.occurredAt <= end).reduce((sum, row) => sum + row.value, 0);
    const spent = expenses.filter((row) => row.occurredAt <= end).reduce((sum, row) => sum + row.value, 0);
    const paid = Object.fromEntries(names.map(({ memberId }) => [memberId, expenses.filter((row) => row.payerId === memberId && monthKey(row.occurredAt) === month && row.occurredAt >= windowStart).reduce((sum, row) => sum + row.value, 0)]));
    return { month, soldeGroupe: entered - spent, paye: paid };
  });
  return { currency, members: names, points };
}

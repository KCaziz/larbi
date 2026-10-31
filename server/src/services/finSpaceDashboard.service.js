// The dashboard of a space (P9-02, tab 03 of the collective workbook, CD-01 to
// CD-09): the central view of what the group holds in common, in one request.
//
//   CD-01 group balance      CD-02 spending of the month (with the trend)
//   CD-03 who paid           CD-04 who owes what (the settlement plan)
//   CD-05 common budgets     CD-06 upcoming bills
//   CD-07 tasks to do        CD-08 a common goal
//   CD-09 recent activity    (its own endpoint, finSpaceActivity)
//
// Nothing here is personal: it composes services that only read what the space
// holds in common. Each block is a figure the server computed, never one the
// screen recomputes.
import { loadSharedData } from './finShared.service.js';
import { buildBalances, settlementPlan } from './finSharedView.service.js';
import { spaceBudgetsView } from './finSpaceBudget.service.js';
import { spaceResources } from './finSpaceResource.service.js';
import { ownMembership } from './finSpace.service.js';
import { computed } from './finance/contract.js';
import { ratio } from './finance/money.js';

const DAY = 24 * 3600 * 1000;
const monthRange = (month) => {
  const [year, number] = month.split('-').map(Number);
  return { gte: new Date(Date.UTC(year, number - 1, 1)), lt: new Date(Date.UTC(year, number, 1)) };
};
const previousMonth = (month) => {
  const [year, number] = month.split('-').map(Number);
  return new Date(Date.UTC(year, number - 2, 1)).toISOString().slice(0, 7);
};

export async function spaceDashboard(prisma, userId, spaceId, { month, now = new Date() }) {
  const me = await ownMembership(prisma, userId, spaceId);
  const currency = me.space.currency;
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const [shared, pot, budgets, expenses, previous, bills, tasks, goals] = await Promise.all([
    loadSharedData(prisma, spaceId),
    spaceResources(prisma, userId, spaceId),
    spaceBudgetsView(prisma, userId, spaceId, month),
    prisma.finSharedExpense.findMany({ where: { spaceId, deletedAt: null, lifecycle: 'done', occurredAt: monthRange(month) }, select: { value: true, payerId: true, collectiveCategory: true } }),
    prisma.finSharedExpense.aggregate({ where: { spaceId, deletedAt: null, lifecycle: 'done', occurredAt: monthRange(previousMonth(month)) }, _sum: { value: true } }),
    prisma.finSharedExpense.findMany({
      where: { spaceId, deletedAt: null, lifecycle: 'planned', occurredAt: { gte: today, lt: new Date(today.getTime() + 31 * DAY) } },
      orderBy: { occurredAt: 'asc' },
      take: 5,
      select: { id: true, label: true, value: true, currency: true, occurredAt: true },
    }),
    prisma.finSpaceTask.findMany({
      where: { spaceId, deletedAt: null, status: { in: ['todo', 'doing'] } },
      orderBy: [{ dueDate: 'asc' }],
      take: 50,
      select: { id: true, title: true, dueDate: true, assigneeId: true, priority: true },
    }),
    prisma.finSpaceGoal.findMany({
      where: { spaceId, deletedAt: null, archivedAt: null },
      orderBy: { createdAt: 'asc' },
      take: 1,
      select: { id: true, label: true, target: true, currency: true, targetDate: true, contributions: { where: { deletedAt: null }, select: { amount: true } } },
    }),
  ]);

  const members = shared.members;
  const nameOf = new Map(members.map((member) => [member.id, member.displayName ?? member.user?.name ?? null]));

  // CD-02 and CD-03
  const total = expenses.reduce((sum, row) => sum + row.value, 0);
  const lastTotal = previous._sum.value ?? 0;
  const paid = new Map();
  for (const row of expenses) paid.set(row.payerId, (paid.get(row.payerId) ?? 0) + row.value);

  // CD-04
  const balances = buildBalances({ members, expenses: shared.expenses, settlements: shared.settlements, currency, now });
  const plan = settlementPlan(balances, { currency, now, smallBalance: me.space.smallBalance });

  // CD-07: today, late, next — counts and the first few, never a judgement.
  const dayOf = (date) => (date ? new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())).getTime() : null);
  const late = tasks.filter((task) => task.dueDate && dayOf(task.dueDate) < today.getTime());
  const dueToday = tasks.filter((task) => task.dueDate && dayOf(task.dueDate) === today.getTime());
  const next = tasks.filter((task) => task.dueDate && dayOf(task.dueDate) > today.getTime()).slice(0, 3);

  // CD-08
  const goal = goals[0] ?? null;
  const allocated = goal ? goal.contributions.reduce((sum, row) => sum + row.amount, 0) : 0;

  return {
    month,
    currency,
    // CD-01: resources minus realised expenses, nothing private included.
    soldeGroupe: pot.soldeGroupe,
    depenses: {
      total,
      precedent: lastTotal,
      // « tendance »: the change against the previous month as a decimal (0.1 is
      // +10 %), null with no previous month to compare to — never an invented 0.
      // Not one of the client's formulas, so it carries no formula identifier.
      tendance: lastTotal > 0 ? (total - lastTotal) / lastTotal : null,
      parCategorie: Object.entries(
        expenses.reduce((acc, row) => ({ ...acc, [row.collectiveCategory ?? 'none']: (acc[row.collectiveCategory ?? 'none'] ?? 0) + row.value }), {}),
      )
        .map(([category, value]) => ({ category: category === 'none' ? null : category, value }))
        .sort((a, b) => b.value - a.value),
    },
    quiAPaye: members.map((member) => ({ memberId: member.id, name: nameOf.get(member.id) ?? null, paid: paid.get(member.id) ?? 0 })).filter((row) => row.paid > 0),
    quiDoitQuoi: {
      soldes: balances.map((row) => ({ memberId: row.memberId, name: row.name, solde: row.solde })),
      transferts: (plan.transferts ?? []).map((transfer) => ({ from: nameOf.get(transfer.from) ?? null, to: nameOf.get(transfer.to) ?? null, amount: transfer.amount })),
      masques: (plan.masques ?? []).length,
    },
    budgets: budgets.budgets,
    prochainesFactures: bills.map((bill) => ({ id: bill.id, label: bill.label, amount: bill.value, currency: bill.currency, date: bill.occurredAt })),
    taches: {
      enRetard: late.length,
      aujourdhui: dueToday.length,
      prochaines: next.map((task) => ({ id: task.id, title: task.title, dueDate: task.dueDate, assignee: nameOf.get(task.assigneeId) ?? null })),
    },
    objectif: goal
      ? {
          id: goal.id,
          label: goal.label,
          target: goal.target,
          allocated,
          currency: goal.currency,
          progression: computed('COL-F10', ratio(allocated, goal.target), { inputs: { capital_affecte: allocated, cible: goal.target }, currency, now }),
        }
      : null,
  };
}

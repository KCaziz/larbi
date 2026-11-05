// Common budgets (P9-05, COL-F06 / F07 / ALG-C02, QC-06): one envelope per
// collective category and month of a SPACE.
//
// Three promises, each one tested:
//   - A common budget touches no personal budget. It reads the space's own
//     shared expenses and nothing else, and nothing personal reads it (QC-06).
//   - An expense is attached to the budget of its category and month when it is
//     read, never by writing a financial entry (ALG-C02: « aucune écriture »).
//   - The remaining amount may be negative, and an alert is raised at 80 % and
//     at 100 % — a fact about the envelope, not a reproach.
import { COLLECTIVE_CATEGORIES, COLLECTIVE_CATEGORY_KEYS } from '../constants/finCollectiveCategories.js';
import { HttpError } from '../utils/httpError.js';
import { recordChange } from './finChange.service.js';
import { ownMembership, requireRole } from './finSpace.service.js';
import { computed } from './finance/contract.js';
import { attachToBudget, collectiveBudgetUsage, remainingCollectiveBudget } from './finance/collective.js';

export const SPACE_BUDGET_ENTITY = 'spaceBudget';
// Who may set the envelopes: they decide how the group spends, so an admin.
export const SPACE_BUDGET_MIN_ROLE = 'admin';
export const BUDGET_WARNING_AT = 0.8;

const BUDGET_SELECT = { id: true, spaceId: true, category: true, period: true, value: true, version: true };

const monthOf = (date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

export function budgetAlertLevel(rate) {
  if (rate === null) return 'none';
  if (rate > 1) return 'exceeded';
  if (rate >= 1) return 'reached';
  if (rate >= BUDGET_WARNING_AT) return 'warning';
  return 'none';
}

/**
 * The common budgets of one month, each with what was spent against it.
 *
 * The expenses are the REALISED ones of the space (a planned or cancelled one
 * counts for nothing), attached with ALG-C02 to the most specific budget.
 */
export async function spaceBudgetsView(prisma, userId, spaceId, period) {
  const me = await ownMembership(prisma, userId, spaceId);
  const currency = me.space.currency;
  const [budgets, expenses] = await Promise.all([
    prisma.finSpaceBudget.findMany({ where: { spaceId, period, deletedAt: null }, select: BUDGET_SELECT }),
    prisma.finSharedExpense.findMany({
      where: {
        spaceId,
        deletedAt: null,
        lifecycle: 'done',
        occurredAt: { gte: new Date(`${period}-01T00:00:00.000Z`), lt: nextMonth(period) },
      },
      select: { id: true, value: true, collectiveCategory: true, occurredAt: true },
    }),
  ]);

  const candidates = budgets.map((budget) => ({ ...budget, categoryId: budget.category }));
  const spent = new Map(budgets.map((budget) => [budget.id, []]));
  const unbudgeted = [];
  for (const expense of expenses) {
    const attached = attachToBudget({ spaceId, period, categoryId: expense.collectiveCategory }, candidates.map((c) => ({ ...c, spaceId })));
    if (attached) spent.get(attached.id).push(expense.value);
    else unbudgeted.push(expense.value);
  }

  const now = new Date();
  const lines = budgets
    .map((budget) => {
      const amounts = spent.get(budget.id);
      const total = amounts.reduce((sum, value) => sum + value, 0);
      const inputs = { budget_alloue: budget.value, depenses_reelles: total, categorie: budget.category, periode: period };
      const usage = collectiveBudgetUsage(budget.value, total);
      return {
        id: budget.id,
        category: budget.category,
        period,
        value: budget.value,
        spent: total,
        reste: computed('COL-F06', remainingCollectiveBudget(budget.value, amounts), { inputs, currency, now }),
        tauxConsommation: computed('COL-F07', usage, { inputs, currency, now }),
        alerte: budgetAlertLevel(usage),
      };
    })
    .sort((a, b) => COLLECTIVE_CATEGORY_KEYS.indexOf(a.category) - COLLECTIVE_CATEGORY_KEYS.indexOf(b.category));

  return {
    period,
    currency,
    categories: COLLECTIVE_CATEGORIES,
    budgets: lines,
    // Spent in the month with no envelope to read it: said, never hidden.
    horsBudget: unbudgeted.reduce((sum, value) => sum + value, 0),
    alertes: lines.filter((line) => line.alerte !== 'none').map((line) => ({ budgetId: line.id, category: line.category, niveau: line.alerte })),
  };
}

function nextMonth(period) {
  const [year, month] = period.split('-').map(Number);
  return new Date(Date.UTC(year, month, 1));
}

/** Sets (or replaces) the envelope of a category and month. */
export async function setSpaceBudget(prisma, userId, spaceId, { category, period, value }) {
  const me = await requireRole(prisma, userId, spaceId, SPACE_BUDGET_MIN_ROLE);
  if (!COLLECTIVE_CATEGORY_KEYS.includes(category)) throw new HttpError(422, 'Unknown collective category', { reason: 'unknownCategory' });
  const existing = await prisma.finSpaceBudget.findUnique({ where: { spaceId_category_period: { spaceId, category, period } }, select: { ...BUDGET_SELECT, deletedAt: true } });
  return prisma.$transaction(async (tx) => {
    const budget = existing
      ? await tx.finSpaceBudget.update({ where: { id: existing.id }, data: { value, deletedAt: null, setById: me.id, version: { increment: 1 } }, select: BUDGET_SELECT })
      : await tx.finSpaceBudget.create({ data: { spaceId, category, period, value, setById: me.id }, select: BUDGET_SELECT });
    await recordChange(tx, {
      userId,
      entity: SPACE_BUDGET_ENTITY,
      entityId: budget.id,
      action: existing ? 'correct' : 'create',
      field: existing ? 'value' : null,
      before: existing && !existing.deletedAt ? existing.value : null,
      after: value,
    });
    return budget;
  });
}

export async function deleteSpaceBudget(prisma, userId, spaceId, id) {
  await requireRole(prisma, userId, spaceId, SPACE_BUDGET_MIN_ROLE);
  const budget = await prisma.finSpaceBudget.findFirst({ where: { id, spaceId, deletedAt: null }, select: BUDGET_SELECT });
  if (!budget) throw new HttpError(404, 'Budget not found');
  await prisma.$transaction(async (tx) => {
    await tx.finSpaceBudget.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: SPACE_BUDGET_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true });
  });
  return { id };
}

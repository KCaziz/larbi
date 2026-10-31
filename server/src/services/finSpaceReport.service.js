// The report of a space for one month, and its export (P9-10, tab 15).
//
// Everything in it is something the space already holds in common: the shared
// expenses by category, the balances, the common budgets, the pot, the tasks.
// Nothing personal enters it — not a personal transaction, not a personal
// account — which is why a member's export cannot leak what the matrix keeps
// private. The export itself needs an explicit consent on every call, like the
// funding export of P6-16: the file leaves the application.
import { COLLECTIVE_CATEGORIES } from '../constants/finCollectiveCategories.js';
import { loadSharedData } from './finShared.service.js';
import { buildBalances } from './finSharedView.service.js';
import { spaceBudgetsView } from './finSpaceBudget.service.js';
import { spaceResources } from './finSpaceResource.service.js';
import { spaceTaskStats } from './finSpaceTask.service.js';
import { ownMembership } from './finSpace.service.js';

export const SPACE_REPORT_VERSION = 1;

const monthRange = (month) => {
  const [year, number] = month.split('-').map(Number);
  return { gte: new Date(Date.UTC(year, number - 1, 1)), lt: new Date(Date.UTC(year, number, 1)) };
};

export async function buildSpaceReport(prisma, userId, spaceId, { month, now = new Date() }) {
  const me = await ownMembership(prisma, userId, spaceId);
  const currency = me.space.currency;
  const [expenses, shared, budgets, pot, tasks] = await Promise.all([
    prisma.finSharedExpense.findMany({
      where: { spaceId, deletedAt: null, lifecycle: 'done', occurredAt: monthRange(month) },
      select: { value: true, collectiveCategory: true },
    }),
    loadSharedData(prisma, spaceId),
    spaceBudgetsView(prisma, userId, spaceId, month),
    spaceResources(prisma, userId, spaceId),
    spaceTaskStats(prisma, userId, spaceId, month),
  ]);

  const byCategory = new Map();
  for (const expense of expenses) {
    const key = expense.collectiveCategory ?? 'none';
    byCategory.set(key, (byCategory.get(key) ?? 0) + expense.value);
  }
  const total = expenses.reduce((sum, expense) => sum + expense.value, 0);
  const label = (key) => COLLECTIVE_CATEGORIES.find((category) => category.key === key)?.label ?? null;

  return {
    version: SPACE_REPORT_VERSION,
    genereLe: now.toISOString(),
    space: { id: spaceId, label: me.space.label, kind: me.space.kind },
    month,
    currency,
    depenses: {
      total,
      count: expenses.length,
      parCategorie: [...byCategory.entries()]
        .map(([key, value]) => ({ category: key === 'none' ? null : key, label: label(key), value }))
        .sort((a, b) => b.value - a.value),
    },
    // Balances are cumulative, not of the month: a debt does not reset on the 1st.
    soldes: buildBalances({ members: shared.members, expenses: shared.expenses, settlements: shared.settlements, currency, now }).map((row) => ({
      memberId: row.memberId,
      name: row.name,
      solde: row.solde,
    })),
    budgets: budgets.budgets,
    caisse: { ressources: pot.resources.montant, depensesRealisees: pot.depensesRealisees, soldeGroupe: pot.soldeGroupe, contributionsPrevues: pot.contributionsPrevues },
    taches: tasks,
  };
}

/** The flat rows of the export: Section, Indicateur, Valeur, Unité, Formule. */
export function spaceReportRows(report) {
  const rows = [];
  const add = (section, indicator, value, unit, formula = '') => rows.push([section, indicator, value, unit, formula]);
  add('Dépenses', 'Total du mois', report.depenses.total, report.currency);
  add('Dépenses', 'Nombre de dépenses', report.depenses.count, 'nombre');
  for (const row of report.depenses.parCategorie) add('Dépenses par catégorie', row.label ?? 'Sans catégorie', row.value, report.currency);
  for (const row of report.soldes) add('Soldes', row.name ?? '—', row.solde.resultat, report.currency, row.solde.formule_id);
  for (const budget of report.budgets) {
    const name = COLLECTIVE_CATEGORIES.find((category) => category.key === budget.category)?.label ?? budget.category;
    add('Budgets communs', `${name} — prévu`, budget.value, report.currency);
    add('Budgets communs', `${name} — reste`, budget.reste.resultat, report.currency, budget.reste.formule_id);
    add('Budgets communs', `${name} — consommation`, budget.tauxConsommation.resultat, 'ratio', budget.tauxConsommation.formule_id);
  }
  add('Caisse commune', 'Ressources communes', report.caisse.ressources, report.currency);
  add('Caisse commune', 'Solde du groupe', report.caisse.soldeGroupe.resultat, report.currency);
  add('Tâches', 'Taux de tâches terminées', report.taches.tauxTerminees.resultat, 'ratio', report.taches.tauxTerminees.formule_id);
  for (const row of report.taches.charge) add('Tâches', `Part de la charge — ${row.name ?? '—'}`, row.charge.resultat, 'ratio', row.charge.formule_id);
  return rows;
}

import { prisma } from '../config/prisma.js';
import { accountsWithBalances } from '../services/finAccount.service.js';
import { buildBudgetView } from '../services/finBudgetView.service.js';
import { currentBudget, loadBudgetData } from '../services/finBudget.service.js';
import { loadCalendarData } from '../services/finCalendar.service.js';
import { collectEvents } from '../services/finCalendarView.service.js';
import { buildGoalView, listGoals } from '../services/finGoal.service.js';
import { occurrencesWithOutcome } from '../services/finOccurrence.service.js';
import { buildReserveView } from '../services/finReserve.service.js';
import { breakdown, buildSynthesis, currentMonth, isSavingsMovement, loadSynthesisData } from '../services/finSynthesis.service.js';
import { isReal } from '../services/finance/dataModel.js';

// The Accueil of the application (P8-06, tab 03_Accueil_Synthese): ONE screen,
// the same for every profile (ARC-01), in one request. Every figure comes from
// the module that owns it — this controller computes nothing of its own, it
// gathers: accounts (PB-F001 to PB-F003), the period's synthesis (PB-F004 to
// PB-F006) with its breakdowns, the current budget, the three priority goals,
// the emergency fund and the next due dates.
export async function getHome(req, res) {
  const now = new Date();
  const currency = req.user.finCurrency;
  const period = req.query.from ? { start: req.query.from, end: req.query.to } : currentMonth(now);

  const [accounts, synthesisData, budget, goalRows, reserve] = await Promise.all([
    accountsWithBalances(prisma, req.user.id, { now }),
    loadSynthesisData(prisma, req.user.id, period),
    currentBudget(prisma, req.user.id, now),
    listGoals(prisma, req.user.id),
    buildReserveView(prisma, req.user.id, { currency, targetMonths: req.user.finReserveTargetMonths ?? null, now }),
  ]);

  const synthesis = buildSynthesis({ ...synthesisData, fallbackCurrency: currency, period, now });
  // The income side of the ring (ACC-04): realised income per category, the
  // same rule as PB-F004 (money taken back from savings is not income).
  const incomeRows = synthesisData.movements.filter((row) => row.kind === 'income' && !row.planned && isReal(row) && !isSavingsMovement(row) && row.currency === synthesis.currency);
  const incomeBreakdown = synthesis.mixedCurrencies ? [] : breakdown(incomeRows);

  // Category labels, icons and colours, joined once for both breakdowns.
  const ids = [...new Set([...synthesis.repartition, ...incomeBreakdown].map((row) => row.categoryId).filter(Boolean))];
  const categories = new Map(
    (await prisma.finCategory.findMany({ where: { id: { in: ids } }, select: { id: true, label: true, icon: true, color: true, group: true } })).map((row) => [row.id, row]),
  );
  const describe = (row) => {
    const category = categories.get(row.categoryId) ?? null;
    return { ...row, label: category?.label ?? null, icon: category?.icon ?? null, color: category?.color ?? null, group: category?.group ?? null };
  };

  // The budget of the moment, as cards (« Nos budgets »).
  let budgetCard = null;
  if (budget) {
    const view = buildBudgetView({ budget, ...(await loadBudgetData(prisma, req.user.id, budget)), now });
    budgetCard = {
      id: budget.id,
      label: budget.label,
      totalPrevu: view.totalPrevu,
      restant: view.ecart,
      budgetJournalier: view.budgetJournalier,
      enveloppes: view.enveloppes.map((line) => ({ id: line.id, categoryId: line.categoryId, categoryGroup: line.categoryGroup, prevu: line.prevu, reel: line.reel, taux: line.tauxConsommation, alerte: line.alerte.niveau })),
    };
    const lineIds = budgetCard.enveloppes.map((line) => line.categoryId).filter(Boolean);
    const lineLabels = new Map((await prisma.finCategory.findMany({ where: { id: { in: lineIds } }, select: { id: true, label: true } })).map((row) => [row.id, row.label]));
    budgetCard.enveloppes = budgetCard.enveloppes.map((line) => ({ ...line, label: line.categoryGroup ?? lineLabels.get(line.categoryId) ?? null }));
  }

  // At most three priority goals (tab 04): the highest priority first.
  const goals = goalRows
    .filter((goal) => goal.status !== 'fictional')
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .slice(0, 3)
    .map((goal) => ({ id: goal.id, label: goal.label, view: buildGoalView(goal, { now }) }));

  // The next due dates, over the coming 30 days, from the calendar itself.
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const to = new Date(from.getTime() + 30 * 24 * 3600 * 1000);
  const calendarData = await loadCalendarData(prisma, req.user.id, { from, to });
  const upcoming = collectEvents({ ...calendarData, from, to, currency, occurrencesOf: occurrencesWithOutcome }).slice(0, 5);

  res.json({
    periode: { debut: period.start, fin: period.end },
    comptes: accounts,
    synthese: {
      currency: synthesis.currency,
      revenus: synthesis.revenus,
      depenses: synthesis.depenses,
      fluxNet: synthesis.fluxNet,
      revenusPrevus: synthesis.revenusPrevus,
      prevuReel: synthesis.prevuReel,
      tendance: synthesis.tendance,
      depensesParCategorie: synthesis.repartition.map(describe),
      revenusParCategorie: incomeBreakdown.map(describe),
    },
    budget: budgetCard,
    objectifs: goals,
    reserve: { moisReserve: reserve.moisReserve, cibleMois: reserve.cibleMois },
    echeances: upcoming,
  });
}

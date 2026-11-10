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
import { chosenColors } from '../services/finCategory.service.js';

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
    loadSynthesisData(prisma, req.user.id, period, { accountId: req.query.accountId ?? null }),
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
  const declared = synthesisData.incomes.filter((row) => !row.archivedAt && row.currency === synthesis.currency);
  const ids = [...new Set([...synthesis.repartition, ...incomeBreakdown, ...declared].map((row) => row.categoryId).filter(Boolean))];
  const categories = new Map(
    (await prisma.finCategory.findMany({ where: { id: { in: ids } }, select: { id: true, label: true, icon: true, color: true, group: true } })).map((row) => [row.id, row]),
  );
  const colors = await chosenColors(prisma, req.user.id, ids);
  const describe = (row) => {
    const category = categories.get(row.categoryId) ?? null;
    return { ...row, label: category?.label ?? null, icon: category?.icon ?? null, color: colors.get(row.categoryId) ?? category?.color ?? null, group: category?.group ?? null };
  };

  // The declared resources, the salary FIRST (P8-24, P8-11): « Salaire & emploi »
  // before any other group, then the largest. The figure of each is what the
  // person declared; the total of the month is `revenusPrevus` (PB-F002).
  const salaryFirst = (row) => (categories.get(row.categoryId)?.group === 'Salaire & emploi' ? 0 : 1);
  const revenusDeclares = [...declared]
    .sort((a, b) => salaryFirst(a) - salaryFirst(b) || b.value - a.value)
    .slice(0, 3)
    .map((row) => ({ id: row.id, label: row.label ?? categories.get(row.categoryId)?.label ?? null, value: row.value, frequency: row.frequency, currency: row.currency, salary: salaryFirst(row) === 0 }));

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

  // Recette R9-10: « prévu / réel » of the spending. The plan of the month is
  // the budget when there is one (its envelopes are what the person planned to
  // spend); otherwise the payments marked as planned. One account chosen: the
  // budget covers every account, so only the planned payments apply.
  const budgetPlan = !req.query.accountId && budgetCard?.totalPrevu?.resultat !== null && budgetCard?.totalPrevu?.resultat !== undefined && budget.currency === synthesis.currency;
  const prevuReel = budgetPlan
    ? { prevu: budgetCard.totalPrevu.resultat, reel: synthesis.prevuReel.reel, source: 'budget' }
    : { ...synthesis.prevuReel, source: synthesis.prevuReel.prevu === null ? null : 'planned' };

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

  // Recette R10-05: the regular income of the period not confirmed yet — what
  // is still expected (never added to « revenus », which is what arrived).
  const periodData = await loadCalendarData(prisma, req.user.id, { from: period.start, to: period.end });
  const expected = collectEvents({ ...periodData, from: period.start, to: period.end, currency, occurrencesOf: occurrencesWithOutcome })
    .filter((event) => event.kind === 'recurrence' && event.inflow && (!req.query.accountId || event.accountId === req.query.accountId));
  const revenusAttendus = { total: expected.reduce((sum, event) => sum + event.value, 0), count: expected.length };

  res.json({
    periode: { debut: period.start, fin: period.end },
    comptes: accounts,
    synthese: {
      currency: synthesis.currency,
      revenus: synthesis.revenus,
      depenses: synthesis.depenses,
      fluxNet: synthesis.fluxNet,
      revenusPrevus: synthesis.revenusPrevus,
      revenusDeclares,
      revenusAttendus,
      prevuReel,
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

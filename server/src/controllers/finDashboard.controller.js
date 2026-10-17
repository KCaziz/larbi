import { prisma } from '../config/prisma.js';
import {
  ACTIONS_MAX,
  ACTION_PRIORITIES,
  DASHBOARDS,
  DATA_AGE_WARNING_DAYS,
  HEALTH_INDEX_NOT_FOR_YOUTH,
  KPI_KEYS,
  KPI_MAX,
  KPI_MIN,
  PERSONAL_INCOME_CATEGORY_KEYS,
  PERSONAL_INCOME_DEFINITION_VERSION,
  UPCOMING_DAYS,
  dashboardFor,
} from '../constants/finDashboard.js';
import { HEALTH_BANDS, HEALTH_DIMENSIONS, HEALTH_VERSION, REFERENTIAL_DIVERGENCES } from '../constants/finHealth.js';
import { questionsForPublic } from '../constants/finOnboarding.js';
import { isAdultAgeRange } from '../constants/finPublics.js';
import { currentBudget, loadBudgetData } from '../services/finBudget.service.js';
import { buildBudgetView } from '../services/finBudgetView.service.js';
import { loadCalendarData } from '../services/finCalendar.service.js';
import { collectEvents, recurringCost } from '../services/finCalendarView.service.js';
import { buildDebtSynthesis, listDebts } from '../services/finDebt.service.js';
import { buildGoalView, listGoals } from '../services/finGoal.service.js';
import { completeness } from '../services/finOnboarding.service.js';
import { buildReserveView } from '../services/finReserve.service.js';
import { markedSavingsInPeriod } from '../services/finSavings.service.js';
import { buildSynthesis, currentMonth, loadSynthesisData } from '../services/finSynthesis.service.js';
import { autonomy, buildDashboard, dataQuality } from '../services/finDashboard.service.js';
import { describeFormula } from '../services/finance/describe.js';
import { monthlyAmount } from '../services/finance/formulas.js';

// The "Aujourd'hui" home screen (P6-06), screens C04 / LY02 / ET02 / JA02 /
// SA02. One request, one answer: the question is « où j'en suis, que faire
// maintenant ? », and a screen that needed six round trips could not answer it
// in ten seconds.
//
// Everything is READ. This route writes nothing at all, which is also why it is
// safe to load it on every visit.

export function getDashboardReferences(req, res) {
  res.json({
    kpis: KPI_KEYS,
    limits: { kpiMin: KPI_MIN, kpiMax: KPI_MAX, actionsMax: ACTIONS_MAX, upcomingDays: UPCOMING_DAYS },
    priorities: ACTION_PRIORITIES,
    dashboards: Object.fromEntries(Object.entries(DASHBOARDS).map(([code, dashboard]) => [code, dashboard.title])),
    dataAgeWarningDays: DATA_AGE_WARNING_DAYS,
    // L'indice de santé financière n'attend plus rien (P6-22, chantier 2) :
    // ses pondérations sont dans le référentiel maître du client. Ce qui est
    // publié ici, c'est le barème retenu, ses dimensions et leurs poids —
    // « sous-scores cliquables, pondérations visibles » est la demande du
    // client — plus la seule règle d'affichage qui reste.
    santeFinanciere: {
      version: HEALTH_VERSION,
      dimensions: HEALTH_DIMENSIONS,
      bandes: HEALTH_BANDS.map((row) => ({ min: row.min, max: row.max, label: row.label })),
      compteJeune: HEALTH_INDEX_NOT_FOR_YOUTH,
    },
    // Les divergences que le client signale dans son propre référentiel, et le
    // choix fait en attendant sa réponse. Publiées plutôt que notées : un
    // barème choisi par le prestataire parce qu'il fallait bien en choisir un
    // devient une décision du client par usure s'il ne se voit pas.
    divergencesReferentiel: REFERENTIAL_DIVERGENCES,
    definitionRevenusPersonnels: { version: PERSONAL_INCOME_DEFINITION_VERSION, categories: PERSONAL_INCOME_CATEGORY_KEYS },
    formulas: ['F002', 'F003', 'F004', 'F008', 'F009', 'F012', 'F014', 'F018', 'F025', 'F047', 'F049', 'F055'].map(describeFormula),
  });
}

export async function getToday(req, res) {
  const now = new Date();
  const currency = req.user.finCurrency;
  const period = currentMonth(now);

  // ---- the money of the month (P6-04) -------------------------------------
  const { incomes, movements, previous } = await loadSynthesisData(prisma, req.user.id, period);
  const synthesis = buildSynthesis({ incomes, movements, previous, fallbackCurrency: currency, period, now });

  // ---- the budget of the period (P6-05) -----------------------------------
  const budget = await currentBudget(prisma, req.user.id, now);
  let budgetView = null;
  if (budget) {
    const data = await loadBudgetData(prisma, req.user.id, budget);
    budgetView = buildBudgetView({ budget, ...data, now });
  }

  // ---- the calendar of the coming days (P6-07) ----------------------------
  // From the START of today, not from this instant: a payment planned for this
  // morning and not yet confirmed is exactly the thing this screen should be
  // reminding somebody about.
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const horizon = new Date(startOfToday.getTime() + UPCOMING_DAYS * 24 * 3600 * 1000);
  const calendarData = await loadCalendarData(prisma, req.user.id, { from: startOfToday, to: horizon });
  const upcoming = collectEvents({ ...calendarData, from: startOfToday, to: horizon, currency }).slice(0, 5);
  const subscriptions = recurringCost(calendarData.recurrences, { currency, now });

  // ---- reserve (P6-09), goals (P6-08), debts (P6-10) ----------------------
  const reserve = await buildReserveView(prisma, req.user.id, { currency, targetMonths: req.user.finReserveTargetMonths ?? null, now });
  const goalRows = await listGoals(prisma, req.user.id);
  const goals = goalRows.map((goal) => ({ id: goal.id, label: goal.label, priority: goal.priority, view: buildGoalView(goal, { now }) }));
  const debtRows = await listDebts(prisma, req.user.id);
  const debts = debtRows.length === 0 ? null : buildDebtSynthesis(debtRows, { netMonthlyIncome: synthesis.revenus.resultat, currency, now });

  // ---- F047, for the student dashboard ------------------------------------
  // The monthly amount of each resource, with the category key the versioned
  // definition of "personal income" is read against.
  const normalised = incomes
    .map((income) => ({ categoryKey: income.category?.key ?? null, monthly: monthlyAmount(income.value, income.frequency) }))
    .filter((income) => income.monthly !== null);
  const autonomyAnswer = autonomy({ incomes: normalised, totalExpenses: synthesis.depenses.resultat, currency, now });

  // ---- F008, over the same period as the income it is divided by ----------
  const periodSavings = await markedSavingsInPeriod(prisma, req.user.id, currency, { from: period.start, to: period.end });

  // ---- where the onboarding stands (P6-03) --------------------------------
  const onboardingRow = await prisma.finOnboarding.findUnique({ where: { userId: req.user.id }, select: { answers: true, completedAt: true } });
  const questions = questionsForPublic(req.user.finPublic, { minor: isAdultAgeRange(req.user.finAgeRange) === false });
  const onboarding = onboardingRow ? completeness(questions, onboardingRow.answers ?? {}) : { applicable: questions.length, answered: 0, skipped: 0, remaining: questions.length, ratio: 0 };

  // ---- the quality banner (F055) ------------------------------------------
  // The most recent thing the person actually recorded, across the tables that
  // feed this screen. Nothing at all means the empty state, not stale data.
  const latest = await prisma.finTransaction.findFirst({
    where: { userId: req.user.id, deletedAt: null },
    select: { collectedAt: true },
    orderBy: { collectedAt: 'desc' },
  });
  const quality = dataQuality(latest?.collectedAt ?? null, { now });

  const dashboard = buildDashboard({
    publicCode: req.user.finPublic ?? null,
    ageRange: req.user.finAgeRange ?? null,
    synthesis,
    budget,
    budgetView,
    reserve,
    goals,
    debts,
    subscriptions,
    autonomyAnswer,
    periodSavings,
    upcoming,
    onboarding,
    uncategorised: synthesis.nonCategorisees,
    quality,
    currency,
    now,
  });
  dashboard.periode = { debut: period.start, fin: period.end };

  // The labels the cards need, joined here so the interface never guesses what
  // a category or an envelope is called.
  const ids = [...new Set([...dashboard.alertes.map((alert) => alert.categoryId), ...dashboard.echeances.map((event) => event.categoryId)].filter(Boolean))];
  const labels = new Map(
    (await prisma.finCategory.findMany({ where: { id: { in: ids } }, select: { id: true, label: true } })).map((row) => [row.id, row.label]),
  );
  dashboard.alertes = dashboard.alertes.map((alert) => ({ ...alert, categoryLabel: alert.categoryId ? (labels.get(alert.categoryId) ?? null) : null }));
  dashboard.echeances = dashboard.echeances.map((event) => ({ ...event, categoryLabel: event.categoryId ? (labels.get(event.categoryId) ?? null) : null }));

  res.json({
    aujourdhui: dashboard,
    // The formulas the cards answer with, so the "Pourquoi ?" panel explains
    // them without a second source of truth.
    formulas: [...new Set(dashboard.kpis.map((kpi) => kpi.formule).filter(Boolean))].map(describeFormula),
    // What the person would gain by picking a public, when they have not.
    tableauxDisponibles: req.user.finPublic ? null : Object.keys(DASHBOARDS),
    tableau: dashboardFor(req.user.finPublic ?? null).title,
  });
}

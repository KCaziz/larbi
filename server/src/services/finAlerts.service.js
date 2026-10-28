// The client's twelve alerts (P8-18, consolidated specification tab 25,
// AL-P01 to AL-P12), raised in one place, with the referential's thresholds
// (constants/finAlerts.js, P6-22). Until P8-18 an alert fired only when its
// own screen was opened — a budget's when the budget was opened, an overdue
// goal's when the goals were listed — and several never fired at all.
//
// Called when the notification centre and the « Aujourd'hui » list are read
// (no background job exists in this platform), at most once every few minutes
// per person. Every notification goes through createNotification: the
// person's family and type settings, the daily quota and the anti-repetition
// rule apply to all of them.
//
// AL-P11 (missing answer) and AL-P12 are also items of « Aujourd'hui »; AL-P06
// (reminders) is generateReminders, opt-in.
import { alertRule } from '../constants/finAlerts.js';
import { isAdultAgeRange } from '../constants/finPublics.js';
import { accountsWithBalances } from './finAccount.service.js';
import { currentBudget, loadBudgetData } from './finBudget.service.js';
import { buildBudgetView } from './finBudgetView.service.js';
import { loadCalendarData } from './finCalendar.service.js';
import { collectEvents } from './finCalendarView.service.js';
import { buildDebtSynthesis, listDebts } from './finDebt.service.js';
import { buildGoalView, goalsWithCapital, listGoals } from './finGoal.service.js';
import { createNotification } from './finNotification.service.js';
import { occurrencesWithOutcome } from './finOccurrence.service.js';
import { buildReserveView } from './finReserve.service.js';
import { buildSynthesis, currentMonth, debtRatioIncome, loadSynthesisData } from './finSynthesis.service.js';

const DAY = 24 * 3600 * 1000;
// How often the alerts of one person are recomputed, at most.
export const ALERTS_EVERY_MS = 5 * 60 * 1000;
// How far back an income or a payment not confirmed is still asked about.
const CONFIRM_LOOKBACK_DAYS = 31;
// A planned goal contribution is « forgotten » from this day of the month on.
const CONTRIBUTION_CHECK_DAY = 25;
// A course left this many days is worth a reminder (AL-P12).
const LEARNING_IDLE_DAYS = 7;

const lastRun = new Map();

const dayStart = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

/** The level of the debt-to-income ratio, at the referential's thresholds (30, 40, 50 %). */
export function debtRatioLevel(ratio) {
  if (ratio === null || ratio === undefined || !Number.isFinite(ratio)) return null;
  if (ratio > alertRule('dsr_critical').threshold) return 'critical';
  if (ratio > alertRule('dsr_high').threshold) return 'high';
  if (ratio >= alertRule('dsr_watch').threshold) return 'watch';
  return null;
}

/** The emergency fund against its target (AL-P09): under one month, under the target, reached. */
export function emergencyLevel(months, target) {
  if (months === null || months === undefined || !Number.isFinite(months)) return null;
  if (months < alertRule('reserve_critical').threshold) return 'critical';
  if (target && months < target) return 'below';
  if (target && months >= target) return 'reached';
  return null;
}

/** The last quarter of its target a goal has reached (AL-P08), or null. */
export function goalMilestone(progress) {
  if (progress === null || progress === undefined || !Number.isFinite(progress) || progress < 0.25) return null;
  return Math.min(1, Math.floor(progress * 4) / 4);
}

/**
 * Raises every alert that is due for this person. `force` skips the
 * once-every-few-minutes guard (tests, and a write that just changed things).
 */
export async function generateAlerts(prisma, user, { now = new Date(), force = false } = {}) {
  const userId = user.id;
  const last = lastRun.get(userId);
  if (!force && last && now.getTime() - last < ALERTS_EVERY_MS) return;
  lastRun.set(userId, now.getTime());

  const currency = user.finCurrency ?? 'DZD';
  const adult = isAdultAgeRange(user.finAgeRange) !== false;
  const notify = (type, args) => createNotification(prisma, userId, { type, ...args });

  // ---- AL-P02 / AL-P03: accounts --------------------------------------------
  const { accounts } = await accountsWithBalances(prisma, userId, { now });
  for (const account of accounts) {
    if (account.archivedAt) continue;
    // The most serious of its alerts: beyond the overdraft, in the red, under
    // the threshold the person chose.
    const level = ['overdraftExceeded', 'overdrawn', 'belowMinimum'].find((key) => account.alertes.includes(key));
    if (!level) continue;
    await notify('account_alert', { params: { niveau: level, label: account.label }, link: '/app/comptes', referenceId: `account:${account.id}`, dedupeBy: 'level' });
  }

  // ---- AL-P04 / AL-P05: the budget of the period ------------------------------
  const budget = await currentBudget(prisma, userId, now);
  if (budget) {
    const view = buildBudgetView({ budget, ...(await loadBudgetData(prisma, userId, budget)), now });
    const ids = view.enveloppes.map((line) => line.categoryId).filter(Boolean);
    const labels = new Map((await prisma.finCategory.findMany({ where: { id: { in: ids } }, select: { id: true, label: true } })).map((row) => [row.id, row.label]));
    for (const line of view.enveloppes) {
      if (line.alerte.niveau === 'none') continue;
      const label = line.categoryGroup ?? labels.get(line.categoryId) ?? null;
      await notify('budget_alert', {
        params: { niveau: line.alerte.niveau, label, taux: line.tauxConsommation.resultat },
        link: `/app/budgets/${budget.id}`,
        referenceId: line.id,
        dedupeBy: 'level',
      });
    }
  }

  // ---- AL-P01 / AL-P07: income and payments whose date has come ---------------
  const today = dayStart(now);
  const from = new Date(today.getTime() - CONFIRM_LOOKBACK_DAYS * DAY);
  const to = new Date(today.getTime() + DAY - 1);
  const past = await loadCalendarData(prisma, userId, { from, to });
  const toConfirm = collectEvents({ ...past, from, to, currency, occurrencesOf: occurrencesWithOutcome }).filter((event) => event.confirmable && !event.informational);
  for (const event of toConfirm) {
    const due = dayKey(event.dueDate ?? event.date);
    await notify(event.inflow ? 'income_to_confirm' : 'payment_to_confirm', {
      params: { label: event.label ?? null, date: due, value: event.value, currency },
      link: '/app/aujourdhui',
      referenceId: `${event.kind}:${event.sourceId}:${due}`,
    });
  }

  // ---- AL-P10: debts — a due date near or passed, and the share of income ----
  if (adult) {
    const debts = (await listDebts(prisma, userId)).filter((debt) => debt.direction !== 'lent' && !debt.archivedAt);
    for (const debt of debts) {
      if (!debt.dueDate) continue;
      const days = Math.round((dayStart(new Date(debt.dueDate)).getTime() - today.getTime()) / DAY);
      const level = days < 0 && -days >= -alertRule('debt_overdue').threshold ? 'overdue' : days >= 0 && days <= alertRule('debt_due_soon').threshold ? 'soon' : null;
      if (!level) continue;
      await notify('debt_due', { params: { niveau: level, label: debt.label, date: dayKey(debt.dueDate) }, link: '/app/dettes', referenceId: `debt:${debt.id}:${dayKey(debt.dueDate)}`, dedupeBy: 'level' });
    }
    if (debts.length > 0) {
      const period = currentMonth(now);
      const synthesis = buildSynthesis({ ...(await loadSynthesisData(prisma, userId, period)), fallbackCurrency: currency, period, now });
      const ratio = buildDebtSynthesis(debts, { netMonthlyIncome: debtRatioIncome(synthesis), currency, now }).tauxEffort?.resultat ?? null;
      const level = debtRatioLevel(ratio);
      if (level) await notify('debt_ratio', { params: { niveau: level, taux: ratio }, link: '/app/dettes', referenceId: 'debt-ratio', dedupeBy: 'level' });
    }
  }

  // ---- AL-P08: goals — overdue, milestones, a contribution forgotten ----------
  const goals = await goalsWithCapital(prisma, userId, await listGoals(prisma, userId));
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  for (const goal of goals) {
    if (goal.archivedAt || goal.status === 'fictional') continue;
    const progress = buildGoalView(goal, { now }).progres.resultat;
    if (goal.targetDate && goal.targetDate.getTime() < now.getTime() && (progress ?? 0) < 1) {
      await notify('goal_overdue', { params: { label: goal.label }, link: '/app/objectifs', referenceId: goal.id });
    }
    const milestone = goalMilestone(progress);
    if (milestone !== null) {
      await notify('goal_milestone', { params: { niveau: String(milestone), label: goal.label }, link: '/app/objectifs', referenceId: `milestone:${goal.id}`, dedupeBy: 'level' });
    }
    if (now.getUTCDate() >= CONTRIBUTION_CHECK_DAY && goal.monthlyContribution > 0 && goal.accountId && (progress ?? 0) < 1) {
      const paid = await prisma.finTransaction.count({
        where: { userId, deletedAt: null, accountId: goal.accountId, kind: 'transfer_in', planned: false, occurredAt: { gte: monthStart, lte: now } },
      });
      if (paid === 0) {
        await notify('goal_contribution_missed', {
          params: { label: goal.label, value: goal.monthlyContribution, currency: goal.currency },
          link: '/app/objectifs',
          referenceId: `contribution:${goal.id}:${dayKey(monthStart).slice(0, 7)}`,
        });
      }
    }
  }

  // ---- AL-P09: the emergency fund — never shown to a minor (P6-06) ----------
  if (adult) {
    const reserve = await buildReserveView(prisma, userId, { currency, targetMonths: user.finReserveTargetMonths ?? null, now });
    const level = emergencyLevel(reserve.moisReserve?.resultat ?? null, reserve.cibleMois ?? null);
    if (level) {
      await notify('emergency_fund', { params: { niveau: level, mois: reserve.moisReserve.resultat, cible: reserve.cibleMois }, link: '/app/objectifs/fonds-urgence', referenceId: 'emergency-fund', dedupeBy: 'level' });
    }
  }

  // ---- AL-P12: a course started and left for a week -------------------------
  const idleSince = new Date(now.getTime() - LEARNING_IDLE_DAYS * DAY);
  const courses = await prisma.enrollment.findMany({
    where: { userId, completedAt: null, status: 'active' },
    select: { id: true, enrolledAt: true, formation: { select: { title: true, slug: true } }, courseProgress: { select: { openedAt: true }, orderBy: { openedAt: 'desc' }, take: 1 } },
  });
  for (const course of courses) {
    const lastSeen = course.courseProgress[0]?.openedAt ?? course.enrolledAt;
    if (lastSeen > idleSince) continue;
    await notify('learning_to_continue', {
      params: { label: course.formation.title },
      link: `/app/formation/${course.formation.slug}`,
      // Once per idle spell: a new reminder only after the person came back.
      referenceId: `learning:${course.id}:${dayKey(lastSeen)}`,
    });
  }
}

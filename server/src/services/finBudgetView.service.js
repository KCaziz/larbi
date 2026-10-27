// What a budget period actually looks like (P6-05, screen C06): per envelope the
// planned amount, what was really spent, what is left, how fast it is going; and
// for the whole period the planned total, the resources, what is still free to
// allocate, and the daily budget.
//
// Pure: no database, no clock of its own (`now` is an argument). Every figure
// leaves through the engine's answer contract (P4-09) — a number that cannot say
// which formula produced it, from which inputs and when, is a number nobody can
// explain six months later. "Not computable" is always `null`, never 0.
//
// Nothing here recommends a distribution. The client is explicit: « aucune règle
// type 50/30/20 imposée ».

import { DEFAULT_ALERT_THRESHOLDS } from '../constants/finBudget.js';
import { computed } from './finance/contract.js';
import { isReal } from './finance/dataModel.js';
import { isSavingsMovement } from './finSynthesis.service.js';
import {
  envelopeProjection,
  envelopeUsageRate,
  monthlyAmount,
  netFlow,
  remainingBudget,
  totalExpenses,
  totalIncome,
} from './finance/formulas.js';

const DAY = 24 * 3600 * 1000;

// Whole days in [start, end], both ends included: a budget for the 1st to the
// 31st covers 31 days, not 30.
export const daysInPeriod = (start, end) => Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY) + 1);

// How many days of the period have gone by, as of `now`. Clamped into the
// period: before it starts nothing has elapsed, after it ends everything has.
export function daysElapsed(start, end, now) {
  const total = daysInPeriod(start, end);
  if (now.getTime() < start.getTime()) return 0;
  if (now.getTime() > end.getTime()) return total;
  return Math.min(total, Math.round((now.getTime() - start.getTime()) / DAY) + 1);
}

export const daysRemaining = (start, end, now) => daysInPeriod(start, end) - daysElapsed(start, end, now);

/**
 * The period expressed in WHOLE calendar months, or `null`.
 *
 * Resources are normalised to the month (F001), so comparing them to a budget
 * needs to know how many months the budget covers. A period that is exactly one,
 * three or twelve calendar months gives an exact answer; anything else (a
 * fortnight, the 10th to the 10th) does not, and then the comparison is simply
 * not made instead of being approximated — a "monthly income" stretched over 45
 * days would be a made-up number.
 */
export function wholeCalendarMonths(start, end) {
  if (start.getUTCDate() !== 1) return null;
  const months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth()) + 1;
  if (months < 1) return null;
  // The end must be the last day of its own month.
  const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
  return end.getUTCDate() === lastDay ? months : null;
}

// The alert level of one envelope, from the usage rate and the thresholds THIS
// budget declared. Thresholds are arguments, never a hidden coefficient, and
// they travel in the answer so a screen can show what it is comparing against.
//
// `exceeded` is the client's « dépassement ». It is reported, never refused:
// the money is already spent, and refusing the figure would only make it wrong.
export function alertLevel(rate, thresholds = DEFAULT_ALERT_THRESHOLDS) {
  if (rate === null) return 'none';
  if (rate > 1) return 'exceeded';
  const sorted = [...thresholds].sort((a, b) => b - a);
  for (const threshold of sorted) {
    if (rate >= threshold) return threshold >= 1 ? 'reached' : 'warning';
  }
  return 'none';
}

// Real, realised expenses of the period, per category. A planned movement has
// not happened (F009's own input is « dépenses réelles »), and a fictional one
// is never added to a real total — the phase rule.
/**
 * Which envelope each real expense goes to (tab 10B, « le plus spécifique »):
 * the envelope of its own sub-category, otherwise the envelope of its client
 * category group, otherwise none — spending outside every envelope, shown
 * apart. An expense is counted once, in one envelope at most (PB-F026).
 */
export function assignToEnvelopes(movements, envelopes) {
  const byCategory = new Map(envelopes.filter((envelope) => envelope.categoryId).map((envelope) => [envelope.categoryId, envelope.id]));
  const byGroup = new Map(envelopes.filter((envelope) => envelope.categoryGroup).map((envelope) => [envelope.categoryGroup, envelope.id]));
  const spent = new Map(envelopes.map((envelope) => [envelope.id, 0]));
  let outside = 0;
  let outsideCount = 0;
  for (const row of movements) {
    if (row.kind !== 'expense' || row.planned || !isReal(row)) continue;
    const target = byCategory.get(row.categoryId ?? null) ?? byGroup.get(row.category?.group ?? null) ?? null;
    if (target) spent.set(target, spent.get(target) + row.value);
    else if (!row.category || row.category.family !== 'goal') {
      outside += row.value;
      outsideCount += 1;
    }
  }
  return { spent, outside: outsideCount === 0 ? null : outside };
}

export function consumedByCategory(movements) {
  const byCategory = new Map();
  for (const row of movements) {
    if (row.kind !== 'expense' || row.planned || !isReal(row)) continue;
    const key = row.categoryId ?? null;
    byCategory.set(key, (byCategory.get(key) ?? 0) + row.value);
  }
  return byCategory;
}

/**
 * One budget period, computed.
 *
 * `budget`    the row (period, currency, alert thresholds)
 * `envelopes` its envelopes (planned amount, kind, optional cap)
 * `movements` the movements dated inside the period
 * `incomes`   the recurring resources active over the period
 * `goals`     the real goals, for their planned monthly contribution — the
 *             « allocations hors budget explicitement planifiées » of PB-F009
 *             (default retained until the client answers, P8-01 question C2)
 */
export function buildBudgetView({ budget, envelopes = [], movements = [], incomes = [], goals = [], carry = null, now = new Date() }) {
  const currency = budget.currency;
  const warnings = [];

  // A row in another currency is NOT converted and NOT counted: the engine
  // never converts without a dated rate. It is reported, so the figure on
  // screen is known to be partial rather than quietly wrong.
  const inCurrency = (rows) => rows.filter((row) => row.currency === currency);
  const skippedMovements = movements.length - inCurrency(movements).length;
  const skippedIncomes = incomes.length - inCurrency(incomes).length;
  if (skippedMovements > 0) {
    warnings.push(`${skippedMovements} mouvement(s) dans une autre devise ne sont pas comptés : convertir sans taux daté donnerait un chiffre faux.`);
  }
  if (skippedIncomes > 0) {
    warnings.push(`${skippedIncomes} ressource(s) dans une autre devise ne sont pas comptées : convertir sans taux daté donnerait un chiffre faux.`);
  }

  const period = { start: budget.periodStart, end: budget.periodEnd };
  const totalDays = daysInPeriod(period.start, period.end);
  const elapsed = daysElapsed(period.start, period.end, now);
  const remaining = daysRemaining(period.start, period.end, now);
  const months = wholeCalendarMonths(period.start, period.end);

  const assigned = assignToEnvelopes(inCurrency(movements), envelopes);
  const thresholds = Array.isArray(budget.alertThresholds) ? budget.alertThresholds : DEFAULT_ALERT_THRESHOLDS;

  const baseInputs = {
    periode: { debut: period.start.toISOString(), fin: period.end.toISOString() },
    jours_periode: totalDays,
    jours_ecoules: elapsed,
    jours_restants: remaining,
    mois_periode: months,
    seuils_alerte: thresholds,
  };
  const answer = (id, result, extra = {}) => computed(id, result, { inputs: baseInputs, currency, warnings, now, ...extra });

  const lines = envelopes.map((envelope) => {
    const spent = assigned.spent.get(envelope.id) ?? 0;
    // « Ajustements de report » (PB-F008): what was left of the same envelope
    // last period, when this budget carries it over.
    const carried = carry?.amounts?.[envelope.categoryGroup ? `group:${envelope.categoryGroup}` : `category:${envelope.categoryId}`] ?? 0;
    const allocated = envelope.value + carried;
    const rate = envelopeUsageRate(spent, allocated);
    const inputs = { ...baseInputs, enveloppe: envelope.id, prevu: envelope.value, report: carried, reel: spent, plafond: envelope.cap ?? null };
    return {
      id: envelope.id,
      categoryId: envelope.categoryId,
      categoryGroup: envelope.categoryGroup ?? null,
      report: carried,
      kind: envelope.kind,
      recurring: envelope.recurring,
      cap: envelope.cap ?? null,
      note: envelope.note ?? null,
      prevu: envelope.value,
      reel: spent,
      // PB-F008 — what is left of this envelope: allocated minus real
      // spending. Negative is the overspend (« peut être négatif »).
      ecart: computed('PB-F008', remainingBudget(allocated, spent), { inputs, currency, warnings, now }),
      // PB-F010 — consumption rate, a decimal shown × 100.
      tauxConsommation: computed('PB-F010', rate, { inputs, currency, warnings, now }),
      // F011 — where this envelope lands at the end of the period if it keeps
      // going at this pace. A PROJECTION, and the formula's own condition says
      // so; it is not a forecast of what the person will do.
      projection: computed('F011', envelopeProjection({ consumed: spent, daysElapsed: elapsed, daysInPeriod: totalDays }), {
        inputs,
        currency,
        warnings,
        now,
      }),
      alerte: { niveau: alertLevel(rate, thresholds), seuils: thresholds },
      // The optional « plafond ». `null` when none was set: "no ceiling" is not
      // "ceiling respected".
      plafondDepasse: envelope.cap === null || envelope.cap === undefined ? null : spent > envelope.cap,
    };
  });

  const plannedEntries = envelopes.map((envelope) => ({ amount: envelope.value, currency }));
  const carriedTotal = lines.reduce((sum, line) => sum + line.report, 0);
  // PB-F007 — what the period allocates in all. `null` over no envelope at
  // all: an empty budget has no total, it has nothing in it yet.
  const totalPrevu = envelopes.length === 0 ? null : totalExpenses(plannedEntries, { currency });

  // Real, realised movements of the period, savings excluded: PB-F004 and
  // PB-F005 leave transfers out of income and expenses (diagnostic n°2, C2).
  const counted = inCurrency(movements).filter((row) => !row.planned && isReal(row) && !isSavingsMovement(row));
  const realExpenseRows = counted.filter((row) => row.kind === 'expense');
  const realIncomeRows = counted.filter((row) => row.kind === 'income');
  const asEntries = (rows) => rows.map((row) => ({ amount: row.value, currency }));
  const totalReel = realExpenseRows.length === 0 ? null : totalExpenses(asEntries(realExpenseRows), { currency });
  const realIncome = realIncomeRows.length === 0 ? null : totalIncome(asEntries(realIncomeRows), { currency });

  // What the envelopes have really consumed: the « dépenses réelles
  // éligibles » of PB-F008. Spending in a category no envelope covers is not
  // taken from any envelope; it is shown apart, in `horsEnveloppe`.
  const consumedByEnvelopes = lines.reduce((sum, line) => sum + line.reel, 0);

  // The resources EXPECTED over the period, the « revenus prévus » of
  // PB-F009. Normalised to the month first (F001: a yearly grant is a twelfth
  // of itself), then multiplied by the whole calendar months the period
  // covers. When the period is not a whole number of months the comparison is
  // NOT made: stretching a monthly income over 45 days would be invented.
  const resourceEntries = [];
  for (const income of inCurrency(incomes)) {
    const amount = monthlyAmount(income.value, income.frequency);
    if (amount === null) {
      warnings.push(`Ressource « ${income.label} » : fréquence inutilisable, elle n'est pas comptée.`);
      continue;
    }
    resourceEntries.push({ amount, currency });
  }
  const monthlyResources = resourceEntries.length === 0 ? null : totalIncome(resourceEntries, { currency });
  const periodResources = monthlyResources === null || months === null ? null : monthlyResources * months;
  if (monthlyResources !== null && months === null) {
    warnings.push(
      "La période n'est pas un nombre entier de mois : les ressources mensuelles ne lui sont pas rapportées, donc aucun reste à affecter n'est calculé.",
    );
  }

  // « Budget supérieur au revenu : autorisé mais signalé » — the client's own
  // rule. Signalled, never refused: somebody who knows they will dip into their
  // savings this month is not making a mistake.
  const overCommitted = periodResources !== null && totalPrevu !== null && totalPrevu > periodResources;
  if (overCommitted) {
    warnings.push('Le budget prévu dépasse les ressources de la période. C’est autorisé : il est seulement signalé.');
  }

  // PB-F009 — the planned monthly contributions to real goals count as
  // allocated outside the budget, over the same whole months.
  const contributions = goals.filter(
    (goal) => goal.currency === currency && Number.isInteger(goal.monthlyContribution) && goal.monthlyContribution > 0,
  );
  const plannedOutside = months === null ? null : contributions.reduce((sum, goal) => sum + goal.monthlyContribution, 0) * months;
  const resteAAffecter = periodResources === null || plannedOutside === null ? null : periodResources - (totalPrevu ?? 0) - plannedOutside;

  // PB-F008 summed over the envelopes, then PB-F013: what is left per
  // remaining day, never below zero; an overspend is reported apart instead
  // of producing a negative daily budget. The previous version (F012) took
  // the fixed envelopes still to pay away a SECOND time from a remainder that
  // already contained them (diagnostic n°2, C5).
  const restant = totalPrevu === null ? null : remainingBudget(totalPrevu + carriedTotal, consumedByEnvelopes);
  const dailyAvailable = restant === null || remaining <= 0 ? null : Math.floor(Math.max(0, restant) / remaining);
  const overspend = restant === null ? null : Math.max(0, -restant);

  // Spending of the period that no envelope covers. Shown apart, never forced
  // into an envelope: the person decides whether it belongs in one.
  // PB-F011 / PB-F012 — the real spending per elapsed day, and where the
  // period lands at that pace (indicative); PB-F022 — real minus planned.
  const dailyAverage = totalReel === null ? null : Math.round(totalReel / Math.max(1, elapsed));
  const projected = dailyAverage === null ? null : dailyAverage * totalDays;
  const plannedVsReal = totalPrevu === null || totalReel === null ? null : totalReel - totalPrevu;

  return {
    currency,
    periode: { debut: period.start, fin: period.end, jours: totalDays, joursEcoules: elapsed, joursRestants: remaining, mois: months },
    enveloppes: lines,
    totalPrevu: answer('PB-F007', totalPrevu),
    totalReel: answer('PB-F005', totalReel),
    // PB-F006 — income really received minus expenses really paid over the
    // period. It used to be EXPECTED resources minus real expenses, which is
    // neither the client's net flow nor a remaining budget (diagnostic n°2, C1).
    fluxNet: answer('PB-F006', netFlow(realIncome, totalReel)),
    // The expected resources of the period (F001 × whole months): the base of
    // PB-F009, shown as « prévu », never as received.
    ressources: answer('F001', periodResources),
    // PB-F009 — still free to allocate, the « Non affecté » of screens JA03 /
    // JA04, which must always remain possible. Planning, not a bank balance;
    // negative means more is planned than expected: the signalled case above.
    resteAAffecter: answer('PB-F009', resteAAffecter, {
      inputs: {
        ...baseInputs,
        revenus_prevus: periodResources,
        budgets_alloues: totalPrevu,
        allocations_hors_budget: plannedOutside,
        objectifs_contribuant: contributions.length,
      },
    }),
    ecart: answer('PB-F008', restant),
    budgetJournalier: answer('PB-F013', dailyAvailable, { inputs: { ...baseInputs, budget_restant: restant } }),
    // « Afficher dépassement séparément » (PB-F013): by how much the envelopes
    // are overspent, 0 when they are not, null without a budget.
    depassement: overspend,
    // Collected for the home screen (P6-06): the envelopes that crossed one of
    // their thresholds, worst first.
    alertes: lines
      .filter((line) => line.alerte.niveau !== 'none')
      .sort((a, b) => (b.tauxConsommation.resultat ?? 0) - (a.tauxConsommation.resultat ?? 0))
      .map((line) => ({ enveloppe: line.id, categoryId: line.categoryId, niveau: line.alerte.niveau, taux: line.tauxConsommation.resultat })),
    horsEnveloppe: answer('PB-F005', assigned.outside),
    moyenneJournaliere: answer('PB-F011', dailyAverage),
    projectionFinPeriode: answer('PB-F012', projected),
    ecartPrevuReel: answer('PB-F022', plannedVsReal),
    report: carry ? { depuisBudget: carry.fromBudget, total: carriedTotal } : null,
    depassementRessources: overCommitted,
    avertissements: warnings,
  };
}

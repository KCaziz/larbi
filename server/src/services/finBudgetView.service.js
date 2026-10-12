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
import {
  dailyBudget,
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
 */
export function buildBudgetView({ budget, envelopes = [], movements = [], incomes = [], now = new Date() }) {
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

  const consumed = consumedByCategory(inCurrency(movements));
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
    const spent = consumed.get(envelope.categoryId ?? null) ?? 0;
    const rate = envelopeUsageRate(spent, envelope.value);
    const inputs = { ...baseInputs, enveloppe: envelope.id, prevu: envelope.value, reel: spent, plafond: envelope.cap ?? null };
    return {
      id: envelope.id,
      categoryId: envelope.categoryId,
      kind: envelope.kind,
      recurring: envelope.recurring,
      cap: envelope.cap ?? null,
      note: envelope.note ?? null,
      prevu: envelope.value,
      reel: spent,
      // F009 — the client's own row for « écart réel / prévu ». Positive is
      // what is left, negative is the overspend: one number, both readings.
      ecart: computed('F009', remainingBudget(envelope.value, spent), { inputs, currency, warnings, now }),
      // F010 — consumption rate, a decimal shown × 100.
      tauxConsommation: computed('F010', rate, { inputs, currency, warnings, now }),
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
  // F003 — the planned total of the period. `null` over no envelope at all: an
  // empty budget has no total, it has nothing in it yet.
  const totalPrevu = envelopes.length === 0 ? null : totalExpenses(plannedEntries, { currency });
  const realEntries = [...consumed.values()].map((amount) => ({ amount, currency }));
  const totalReel = realEntries.length === 0 ? null : totalExpenses(realEntries, { currency });

  // F002 then F001 — the resources of the period. Normalised to the month first
  // (a yearly grant is a twelfth of itself), then multiplied by the number of
  // whole calendar months the period covers. When the period is not a whole
  // number of months the comparison is NOT made: stretching a monthly income
  // over 45 days would be an invented figure.
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

  // F012 — what is left per remaining day, once the fixed envelopes still to be
  // paid are set aside. `null` once the period is over (no remaining day to
  // divide by), which the formula's own condition states.
  const remainingFixed = lines.filter((line) => line.kind === 'fixed').reduce((sum, line) => sum + Math.max(0, line.prevu - line.reel), 0);
  const balance = totalPrevu === null ? null : totalPrevu - (totalReel ?? 0);

  // Spending of the period that no envelope covers. Shown apart, never forced
  // into an envelope: the person decides whether it belongs in one.
  const covered = new Set(envelopes.map((envelope) => envelope.categoryId ?? null));
  const outside = [...consumed.entries()].filter(([categoryId]) => !covered.has(categoryId));

  return {
    currency,
    periode: { debut: period.start, fin: period.end, jours: totalDays, joursEcoules: elapsed, joursRestants: remaining, mois: months },
    enveloppes: lines,
    totalPrevu: answer('F003', totalPrevu),
    totalReel: answer('F003', totalReel),
    // F004 — the net flow of the budget: resources of the period minus what was
    // really spent. Not the same thing as the remaining budget (F009), and the
    // client insists the two are different readings.
    fluxNet: answer('F004', netFlow(periodResources, totalReel)),
    ressources: answer('F002', periodResources),
    // What is still free to allocate — the « Non affecté » of screens JA03 /
    // JA04, which must always remain possible. Negative means the person has
    // planned more than they expect to receive: the signalled case above.
    resteAAffecter: answer('F009', remainingBudget(periodResources, totalPrevu)),
    ecart: answer('F009', remainingBudget(totalPrevu, totalReel)),
    budgetJournalier: answer('F012', dailyBudget({ balance, remainingObligations: remainingFixed, remainingDays: remaining })),
    // Collected for the home screen (P6-06): the envelopes that crossed one of
    // their thresholds, worst first.
    alertes: lines
      .filter((line) => line.alerte.niveau !== 'none')
      .sort((a, b) => (b.tauxConsommation.resultat ?? 0) - (a.tauxConsommation.resultat ?? 0))
      .map((line) => ({ enveloppe: line.id, categoryId: line.categoryId, niveau: line.alerte.niveau, taux: line.tauxConsommation.resultat })),
    horsEnveloppe: answer('F003', outside.length === 0 ? null : totalExpenses(outside.map(([, amount]) => ({ amount, currency })), { currency })),
    depassementRessources: overCommitted,
    avertissements: warnings,
  };
}

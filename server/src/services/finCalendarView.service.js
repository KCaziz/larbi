// The financial calendar (P6-07, screens C23 / SA03 / SA04): what is expected
// day by day over a period, the total planned, the projected cash, and the days
// where that cash goes under — the client's « jours de tension ».
//
// Pure: no database, no clock of its own. Every figure leaves through the
// engine's answer contract (P4-09), and "not computable" is always `null`.
//
// Two rules of the client run through all of it:
//   - a planned event is NOT a transaction until it is confirmed, so nothing
//     here ever counts a planned movement as realised;
//   - a provision does not create a realised expense, so a provision shows its
//     due date and its monthly amount and enters no total of what was spent.

import { DEFAULT_TENSION_FLOOR } from '../constants/finCalendar.js';
import { computed } from './finance/contract.js';
import { isReal } from './finance/dataModel.js';
import { monthlyProvision, normalizedRecurringCost, totalExpenses, totalIncome } from './finance/formulas.js';

const DAY = 24 * 3600 * 1000;

// The UTC day a date falls on, as an ISO date string. The calendar groups by
// day, and a day is the only unit the client's screens use.
export const dayKey = (date) => date.toISOString().slice(0, 10);

const startOfDay = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

// Every day of [start, end], both ends included.
export function eachDay(start, end) {
  const days = [];
  for (let time = startOfDay(start).getTime(); time <= end.getTime(); time += DAY) days.push(new Date(time));
  return days;
}

// How many whole months `frequency` advances by. A weekly recurrence is not a
// number of months, so it advances in days instead — that is why this returns
// `null` for it rather than rounding a week up to a month.
const MONTH_STEP = { mensuel: 1, trimestriel: 3, semestriel: 6, annuel: 12 };
const DAY_STEP = { hebdomadaire: 7 };

/**
 * The dates one recurrence falls on inside [from, to].
 *
 * Projected from `nextDate` forward: a recurrence says when it is next
 * expected, and the frequency says how it repeats. Occurrences after `endDate`
 * are not produced — a subscription that ends in March does not appear in
 * April.
 *
 * Month arithmetic clamps the day (31 January plus one month is 28 February, not
 * 3 March): the same defect that had to be fixed in the budget periods.
 */
export function occurrencesOf(recurrence, from, to, { maxOccurrences = 400 } = {}) {
  const months = MONTH_STEP[recurrence.frequency];
  const days = DAY_STEP[recurrence.frequency];
  if (!months && !days) return [];

  const limit = recurrence.endDate && recurrence.endDate < to ? recurrence.endDate : to;
  const dates = [];
  let index = 0;
  const base = recurrence.nextDate;
  while (dates.length < maxOccurrences) {
    let date;
    if (months) {
      const step = months * index;
      const lastDay = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + step + 1, 0)).getUTCDate();
      date = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + step, Math.min(base.getUTCDate(), lastDay)));
    } else {
      date = new Date(base.getTime() + days * index * DAY);
    }
    index += 1;
    if (date.getTime() > limit.getTime()) break;
    if (date.getTime() >= startOfDay(from).getTime()) dates.push(date);
    // A recurrence whose next date is far in the past would otherwise spin
    // through every occurrence since: bounded by the same maximum.
    if (index > maxOccurrences) break;
  }
  return dates;
}

/**
 * Everything expected over [from, to], as one flat list of events.
 *
 * `planned`     movements marked `planned` in P6-04 (the client's planned
 *               payments: NOT transactions until confirmed)
 * `recurrences` confirmed recurrences, projected over the period
 * `provisions`  provisions whose due date falls in the period
 */
export function collectEvents({ planned = [], recurrences = [], provisions = [], outcomes = [], debts = [], goals = [], from, to, currency, occurrencesOf: expand = null }) {
  const events = [];

  for (const row of planned) {
    if (row.currency !== currency) continue;
    events.push({
      kind: row.kind === 'income' ? 'planned_income' : 'planned_expense',
      date: row.occurredAt,
      label: row.note ?? null,
      value: row.value,
      currency: row.currency,
      categoryId: row.categoryId ?? null,
      sourceId: row.id,
      // What the person still has to do about it: a planned movement becomes
      // real only when they say it happened.
      confirmable: true,
    });
  }

  for (const recurrence of recurrences) {
    if (recurrence.currency !== currency) continue;
    // P8-11: each occurrence with what was said about it (`expand`, from
    // finOccurrence.service.js — injected to keep this module pure). A
    // confirmed occurrence is a real movement now, and a missed one did not
    // happen: neither is expected any more.
    const occurrences = expand ? expand(recurrence, outcomes, from, to) : occurrencesOf(recurrence, from, to).map((date) => ({ dueDate: date, date, outcome: null }));
    for (const occurrence of occurrences) {
      if (occurrence.outcome === 'confirmed' || occurrence.outcome === 'missed') continue;
      const date = occurrence.date;
      events.push({
        kind: 'recurrence',
        date,
        dueDate: dayKey(occurrence.dueDate),
        postponed: occurrence.outcome === 'postponed',
        mode: recurrence.creationMode ?? 'confirm',
        accountId: recurrence.accountId ?? null,
        label: recurrence.label,
        value: recurrence.value,
        currency: recurrence.currency,
        categoryId: recurrence.categoryId ?? null,
        sourceId: recurrence.id,
        // The direction matters for the projection: a salary is a recurrence
        // too, and subtracting it would be the wrong sign.
        inflow: recurrence.kind === 'income',
        // « Confirmer, Modifier, Pas reçu, Reporter » the day it falls, unless
        // the person asked for it to be recorded on its own.
        confirmable: (recurrence.creationMode ?? 'confirm') !== 'auto_real',
      });
    }
  }

  // « Échéances » (tab 08): a debt's due date and a goal's target date. They
  // are reminders that open their object, not money of the period: they are
  // never counted in the projected cash (an instalment that is a recurrence
  // already is).
  for (const debt of debts) {
    if (debt.currency !== currency || !debt.dueDate || debt.dueDate < startOfDay(from) || debt.dueDate > to) continue;
    events.push({ kind: 'debt_due', date: debt.dueDate, label: debt.label, value: debt.monthlyInstalment, currency, categoryId: null, sourceId: debt.id, confirmable: false, informational: true });
  }
  for (const goal of goals) {
    if (goal.currency !== currency || !goal.targetDate || goal.targetDate < startOfDay(from) || goal.targetDate > to) continue;
    events.push({ kind: 'goal_due', date: goal.targetDate, label: goal.label, value: goal.target, currency, categoryId: null, sourceId: goal.id, confirmable: false, informational: true });
  }

  for (const provision of provisions) {
    if (provision.currency !== currency) continue;
    if (provision.targetDate < startOfDay(from) || provision.targetDate > to) continue;
    events.push({
      kind: 'provision',
      date: provision.targetDate,
      label: provision.label,
      value: provision.value,
      currency: provision.currency,
      categoryId: provision.categoryId ?? null,
      sourceId: provision.id,
      // What has already been set aside, so the screen can show the part that
      // still has to be found.
      provisioned: provision.provisioned,
      confirmable: false,
    });
  }

  return events.sort((a, b) => a.date - b.date || a.kind.localeCompare(b.kind));
}

const isInflow = (event) => event.kind === 'planned_income' || (event.kind === 'recurrence' && event.inflow);

/**
 * The calendar of one period.
 *
 * `openingBalance` is what the person says they have now. It is DECLARED, and
 * there is no account balance anywhere in FINCLUDIA to take it from: without it
 * the projected cash and the days of tension are simply not computed, and the
 * screen asks for it instead of showing a number built on a guess.
 */
export function buildCalendar({
  events = [],
  from,
  to,
  currency,
  openingBalance = null,
  tensionFloor = DEFAULT_TENSION_FLOOR,
  realised = [],
  now = new Date(),
}) {
  const warnings = [];
  // Informational dates (a debt's due date, a goal's target) are listed, never
  // counted as money of the period.
  const moneyEvents = events.filter((event) => !event.informational);
  const outflows = moneyEvents.filter((event) => !isInflow(event));
  const inflows = moneyEvents.filter(isInflow);

  // A provision is not a payment of the period: the money is being set aside
  // for a dated expense, and the client says a provision creates no realised
  // expense. It appears on its day and in its own total, never in the outflow
  // total of what is due.
  const dueOutflows = outflows.filter((event) => event.kind !== 'provision');

  const inputs = {
    periode: { debut: from.toISOString(), fin: to.toISOString() },
    evenements: events.length,
    sorties: dueOutflows.length,
    entrees: inflows.length,
    provisions: outflows.length - dueOutflows.length,
    solde_initial_declare: openingBalance,
    seuil_tension: tensionFloor,
  };
  const answer = (id, result, extra = {}) => computed(id, result, { inputs, currency, warnings, now, ...extra });

  const asEntries = (list) => list.map((event) => ({ amount: event.value, currency }));
  // F003 / F002 over an EMPTY set is `null`, not 0: nothing planned is not the
  // same statement as "zero planned".
  const totalOut = dueOutflows.length === 0 ? null : totalExpenses(asEntries(dueOutflows), { currency });
  const totalIn = inflows.length === 0 ? null : totalIncome(asEntries(inflows), { currency });

  // Day by day: what falls on it, and the running cash once it has.
  let running = openingBalance;
  if (openingBalance === null) {
    warnings.push(
      "Aucun compte n'est encore compté dans le solde total : le cash projeté et les jours de tension ne sont pas calculés, car les déduire d'autre chose serait les inventer.",
    );
  }
  const byDay = new Map();
  for (const event of events) {
    const key = dayKey(event.date);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(event);
  }

  const days = eachDay(from, to).map((date) => {
    const key = dayKey(date);
    const list = byDay.get(key) ?? [];
    const dayOut = list.filter((event) => !isInflow(event) && event.kind !== 'provision' && !event.informational).reduce((sum, event) => sum + event.value, 0);
    const dayIn = list.filter(isInflow).reduce((sum, event) => sum + event.value, 0);
    if (running !== null) running += dayIn - dayOut;
    return {
      jour: key,
      evenements: list.map(({ inflow, ...event }) => ({ ...event, sens: inflow || event.kind === 'planned_income' ? 'in' : 'out' })),
      entrees: dayIn,
      sorties: dayOut,
      // The projected cash AFTER that day. `null` when no opening balance was
      // declared — the whole projection then says "not computed" rather than
      // starting from an imaginary zero.
      cashProjete: running,
      tension: running === null ? null : running < tensionFloor,
    };
  });

  const tensionDays = days.filter((day) => day.tension === true);

  // What was really spent in the period already, so the screen can put the plan
  // next to the facts. Realised only: the planned rows are the plan.
  const realisedRows = realised.filter((row) => row.currency === currency && isReal(row) && !row.planned);
  const realisedOut = realisedRows.filter((row) => row.kind === 'expense');

  return {
    currency,
    periode: { debut: from, fin: to, jours: days.length },
    jours: days,
    totalPrevuSorties: answer('F003', totalOut),
    totalPrevuEntrees: answer('F002', totalIn),
    // Realised, for comparison. Separate figures, never added to the planned
    // ones: « prévu » and « réel » are two readings, and the client keeps them
    // apart everywhere.
    totalReelSorties: answer('F003', realisedOut.length === 0 ? null : totalExpenses(asEntries(realisedOut), { currency })),
    cashFinProjete: days.length === 0 ? null : days[days.length - 1].cashProjete,
    joursTension: tensionDays.map((day) => ({ jour: day.jour, cashProjete: day.cashProjete })),
    // The first day the money runs out, which is the one thing a person acts
    // on. `null` when there is none, or when no balance was declared.
    premierJourTension: tensionDays.length === 0 ? null : tensionDays[0].jour,
    avertissements: warnings,
  };
}

/**
 * The cost of the confirmed recurrences: per month and per year.
 *
 * F049 (« coût récurrent normalisé ») brings each one back to the month,
 * whatever its own frequency; the yearly figure is that total over twelve
 * months. Only EXPENSES: the client's screen is about what subscriptions cost,
 * and mixing a salary in would make the number meaningless.
 */
export function recurringCost(recurrences, { currency, now = new Date() } = {}) {
  const warnings = [];
  const expenses = recurrences.filter((row) => row.kind === 'expense' && row.currency === currency);
  const skipped = recurrences.filter((row) => row.kind === 'expense' && row.currency !== currency).length;
  if (skipped > 0) {
    warnings.push(`${skipped} abonnement(s) dans une autre devise ne sont pas comptés : convertir sans taux daté donnerait un chiffre faux.`);
  }

  const entries = [];
  for (const row of expenses) {
    const monthly = normalizedRecurringCost(row.value, row.frequency);
    if (monthly === null) {
      warnings.push(`« ${row.label} » : fréquence inutilisable, l'abonnement n'est pas compté.`);
      continue;
    }
    entries.push({ amount: monthly, currency, id: row.id, label: row.label, monthly });
  }

  const inputs = { abonnements: entries.length, devise: currency };
  const total = entries.length === 0 ? null : totalExpenses(entries, { currency });
  return {
    currency,
    // F049 per line, so a screen can sort the subscriptions by what they
    // actually cost per month rather than by the amount billed.
    lignes: entries
      .map((entry) => ({
        id: entry.id,
        label: entry.label,
        mensuel: computed('F049', entry.monthly, { inputs: { id: entry.id }, currency, now }),
      }))
      .sort((a, b) => (b.mensuel.resultat ?? 0) - (a.mensuel.resultat ?? 0)),
    coutMensuel: computed('F003', total, { inputs, currency, warnings, now }),
    // Twelve months of the monthly total. F001 is the client's own
    // frequency-factor row, used here in the other direction — the same reading
    // CAL-04 already makes when it annualises a monthly saving capacity.
    coutAnnuel: computed('F001', total === null ? null : total * 12, { inputs: { ...inputs, mois: 12 }, currency, warnings, now }),
    avertissements: warnings,
  };
}

/**
 * One provision, computed (F045).
 *
 * The monthly provision is what is left to set aside, divided by the months
 * remaining until the due date. Past the due date there is no month left to
 * divide by and the formula's own condition says so — the answer is `null`, not
 * the whole remaining amount.
 */
export function buildProvisionView(provision, { now = new Date() } = {}) {
  const monthsLeft = Math.max(
    0,
    (provision.targetDate.getUTCFullYear() - now.getUTCFullYear()) * 12 + (provision.targetDate.getUTCMonth() - now.getUTCMonth()),
  );
  const inputs = {
    montant_prevu: provision.value,
    deja_provisionne: provision.provisioned,
    mois_restants: monthsLeft,
    date_echeance: provision.targetDate.toISOString(),
  };
  return {
    id: provision.id,
    label: provision.label,
    categoryId: provision.categoryId ?? null,
    value: provision.value,
    provisioned: provision.provisioned,
    currency: provision.currency,
    targetDate: provision.targetDate,
    moisRestants: monthsLeft,
    // `reached` is the state the amounts say it is in, not an opinion: what was
    // set aside covers the expense.
    etat: provision.provisioned >= provision.value ? 'reached' : provision.targetDate < now ? 'passed' : 'active',
    provisionMensuelle: computed(
      'F045',
      monthlyProvision({ plannedAmount: provision.value, alreadyProvisioned: provision.provisioned, monthsLeft }),
      { inputs, currency: provision.currency, now },
    ),
    // What is still missing. Never negative: a provision past its target is
    // reached, not "minus two thousand".
    reste: Math.max(0, provision.value - provision.provisioned),
  };
}

// The "Mon argent" synthesis (P6-04, screen C05): resources, expenses, net
// flow, breakdown, trend, planned versus real.
//
// Every figure leaves through the engine's answer contract (P4-09): a number in
// a response that cannot say which formula produced it, from which inputs, in
// which version and when, is a number nobody can explain six months later. So
// nothing here returns a bare total, and "not computable" is always `null`,
// never 0.

import { computed } from './finance/contract.js';
import { monthlyAmount, netFlow, totalExpenses, totalIncome } from './finance/formulas.js';
import { isFictional, isReal } from './finance/dataModel.js';

// First and last instant of a month, and of the month before it (the trend).
const monthRange = (reference) => {
  const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1));
  const end = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 1) - 1);
  return { start, end };
};

export function previousMonth(reference) {
  return monthRange(new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - 1, 1)));
}

export const currentMonth = (reference = new Date()) => monthRange(reference);

// The currency the figures are expressed in. One account may hold rows in
// several currencies; the synthesis then refuses to total rather than convert
// without a dated rate, and says so instead of showing a wrong number.
function resolveCurrency(rows, fallback) {
  const currencies = [...new Set(rows.map((row) => row.currency))];
  if (currencies.length === 0) return { currency: fallback, mixed: false };
  if (currencies.length === 1) return { currency: currencies[0], mixed: false };
  return { currency: fallback, mixed: true };
}

// Resources active over a period, normalised to the month (F001): a yearly
// grant is a twelfth of itself per month, never its whole amount.
function monthlyResources(incomes, { currency }) {
  const entries = [];
  const warnings = [];
  for (const income of incomes) {
    const amount = monthlyAmount(income.value, income.frequency);
    if (amount === null) {
      // The client's own error case for screen ET01. Reported, not guessed.
      warnings.push(`Ressource « ${income.label} » : fréquence inutilisable, elle n'est pas comptée.`);
      continue;
    }
    entries.push({ amount, currency: income.currency });
  }
  // Resources were declared but NONE of them could be normalised: the total is
  // not zero, it is unknown. Returning 0 here would show « vous n'avez aucune
  // ressource » to someone who declared one with a frequency we cannot use.
  if (entries.length === 0) return { total: null, warnings };
  return { total: totalIncome(entries, { currency }), warnings };
}

const asEntries = (rows) => rows.map((row) => ({ amount: row.value, currency: row.currency }));

// A total over NO row is not zero: we cannot tell "spent nothing" from
// "recorded nothing", and the client's rule is « non calculé plutôt que 0 ».
// So an empty set answers null, and the formula's own condition explains it.
const totalOrNull = (rows, total, { currency }) => (rows.length === 0 ? null : total(asEntries(rows), { currency }));

/**
 * The synthesis of one period for one account.
 *
 * `incomes`   recurring resources (normalised to the month)
 * `movements` the dated movements of the period
 * `previous`  the movements of the month before, for the trend
 *
 * Real and fictional are computed side by side and NEVER added: the client's
 * rule, and the reason the fictional block is a separate object carrying its
 * own badge rather than a line in the same total.
 */
export function buildSynthesis({ incomes = [], movements = [], previous = [], fallbackCurrency = 'DZD', period, now = new Date() }) {
  const resolved = resolveCurrency([...incomes, ...movements], fallbackCurrency);
  const currency = resolved.currency;
  const warnings = [];
  if (resolved.mixed) {
    warnings.push('Plusieurs devises sont présentes : aucun total n’est calculé, car convertir sans taux daté donnerait un chiffre faux.');
  }

  const realMovements = movements.filter(isReal);
  const fictionalMovements = movements.filter(isFictional);
  const unreadable = movements.length - realMovements.length - fictionalMovements.length;
  if (unreadable > 0) {
    warnings.push(`${unreadable} mouvement(s) au statut illisible ne sont comptés ni en réel ni en fictif.`);
  }

  // Planned expenses are declared, not realised: F004's own condition is
  // "dépenses réalisées de la période", so the net flow uses realised rows and
  // the planned ones are reported beside it (the client's "prévu / réel").
  const realised = realMovements.filter((row) => !row.planned);
  const planned = movements.filter((row) => row.planned);

  const realExpenses = realised.filter((row) => row.kind === 'expense');
  const realIncome = realised.filter((row) => row.kind === 'income');
  const resources = resolved.mixed || incomes.length === 0 ? { total: null, warnings: [] } : monthlyResources(incomes, { currency });
  const expenses = resolved.mixed ? null : totalOrNull(realExpenses, totalExpenses, { currency });
  const movementIncome = resolved.mixed ? null : totalOrNull(realIncome, totalIncome, { currency });

  // Resources are what recurs; a movement of kind "income" is what actually
  // arrived. Both are income for F002, and summing them is the only honest
  // reading of "total revenus" for the period. Either side may be absent — a
  // salary with no one-off income is still a known total — but with NEITHER
  // there is nothing to total.
  const income = resources.total === null && movementIncome === null ? null : (resources.total ?? 0) + (movementIncome ?? 0);

  const inputs = {
    periode: period ? { debut: period.start.toISOString(), fin: period.end.toISOString() } : null,
    ressources_recurrentes: incomes.length,
    mouvements_reels: realised.length,
    mouvements_planifies: planned.length,
    mouvements_fictifs: fictionalMovements.length,
  };
  const allWarnings = [...warnings, ...resources.warnings];
  const answer = (id, result, extra = {}) => computed(id, result, { inputs, currency, warnings: allWarnings, now, ...extra });

  const previousRows = previous.filter((row) => isReal(row) && !row.planned && row.kind === 'expense');
  const previousExpenses = resolved.mixed ? null : totalOrNull(previousRows, totalExpenses, { currency });

  return {
    currency,
    mixedCurrencies: resolved.mixed,
    // F002, F003, F004 — the three figures the client's screen C05 shows.
    revenus: answer('F002', income),
    depenses: answer('F003', expenses),
    fluxNet: answer('F004', netFlow(income, expenses)),
    // The breakdown and the trend are descriptive, not formulas of the client's
    // catalogue: they are shown as plain data, without pretending to be a
    // computed indicator with a version.
    repartition: resolved.mixed ? [] : breakdown(realised.filter((row) => row.kind === 'expense')),
    tendance: {
      moisPrecedent: previousExpenses,
      // The difference, not a percentage: a percentage of a month with no
      // expense would divide by zero, and "+infinity %" explains nothing.
      variation: previousExpenses === null || expenses === null ? null : expenses - previousExpenses,
    },
    prevuReel: {
      prevu: resolved.mixed ? null : totalOrNull(planned.filter((row) => row.kind === 'expense'), totalExpenses, { currency }),
      reel: expenses,
    },
    // The fictional side, apart and badged. `null` when there is nothing
    // fictional at all: an empty simulation block would suggest one exists.
    simulation:
      fictionalMovements.length === 0
        ? null
        : {
            badge: 'SIMULATION',
            depenses: resolved.mixed ? null : totalOrNull(fictionalMovements.filter((row) => row.kind === 'expense'), totalExpenses, { currency }),
            revenus: resolved.mixed ? null : totalOrNull(fictionalMovements.filter((row) => row.kind === 'income'), totalIncome, { currency }),
          },
    nonCategorisees: realised.filter((row) => row.categoryId === null).length,
  };
}

// Expenses per category, biggest first. Returns the category id; the caller
// joins the labels it already has, so this stays a pure function.
export function breakdown(rows) {
  const byCategory = new Map();
  for (const row of rows) {
    const key = row.categoryId ?? null;
    byCategory.set(key, (byCategory.get(key) ?? 0) + row.value);
  }
  return [...byCategory.entries()]
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total);
}

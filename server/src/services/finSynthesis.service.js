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

// Money set aside for a goal, or taken back out of it (family `goal`, see
// finSavings.service.js). It moves between the person's own pockets: PB-F004
// and PB-F005 exclude transfers from income and expenses, so it is neither
// (diagnostic n°2, C2). It is still counted where it belongs — F007, the
// reserve, the goals — through finSavings.service.js.
export const isSavingsMovement = (row) => row.category?.family === 'goal';

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

  // Income and expenses are what REALLY happened (PB-F004, PB-F005), savings
  // movements excluded.
  const counted = realised.filter((row) => !isSavingsMovement(row));
  const realExpenses = counted.filter((row) => row.kind === 'expense');
  const realIncome = counted.filter((row) => row.kind === 'income');
  // Declared resources are split like movements: a lycéen's fictional pocket
  // money is never part of the real « prévu », which also feeds the debt ratio.
  const resourcesOf = (rows) => (resolved.mixed || rows.length === 0 ? { total: null, warnings: [] } : monthlyResources(rows, { currency }));
  const fictionalIncomes = incomes.filter(isFictional);
  const resources = resourcesOf(incomes.filter(isReal));
  const expenses = resolved.mixed ? null : totalOrNull(realExpenses, totalExpenses, { currency });

  // Diagnostic n°2, C1: this used to ADD the declared resources to the income
  // actually received. A salary declared once and recorded on arrival counted
  // twice; a salary declared but never received counted as received. The
  // client's rule is « Σ transactions type=Revenu et statut=Réalisé »: a
  // declared resource is what is EXPECTED, shown beside as `revenusPrevus`,
  // never added to the real.
  const income = resolved.mixed ? null : totalOrNull(realIncome, totalIncome, { currency });

  const inputs = {
    periode: period ? { debut: period.start.toISOString(), fin: period.end.toISOString() } : null,
    ressources_recurrentes: incomes.length,
    mouvements_reels: realised.length,
    mouvements_planifies: planned.length,
    mouvements_fictifs: fictionalMovements.length,
  };
  const allWarnings = [...warnings, ...resources.warnings];
  const answer = (id, result, extra = {}) => computed(id, result, { inputs, currency, warnings: allWarnings, now, ...extra });

  const previousRows = previous.filter((row) => isReal(row) && !row.planned && row.kind === 'expense' && !isSavingsMovement(row));
  const previousExpenses = resolved.mixed ? null : totalOrNull(previousRows, totalExpenses, { currency });

  return {
    currency,
    mixedCurrencies: resolved.mixed,
    // PB-F004, PB-F005, PB-F006 — the client's final rules for the three
    // figures of the synthesis (they supersede F002 to F004, P8-01 point 1).
    revenus: answer('PB-F004', income),
    depenses: answer('PB-F005', expenses),
    fluxNet: answer('PB-F006', netFlow(income, expenses)),
    // What the declared recurring resources add up to over a month (F001).
    // EXPECTED, not received: shown as « prévu », never added to `revenus`.
    revenusPrevus: answer('F001', resources.total),
    // The breakdown and the trend are descriptive, not formulas of the client's
    // catalogue: they are shown as plain data, without pretending to be a
    // computed indicator with a version.
    repartition: resolved.mixed ? [] : breakdown(realExpenses),
    tendance: {
      moisPrecedent: previousExpenses,
      // The difference, not a percentage: a percentage of a month with no
      // expense would divide by zero, and "+infinity %" explains nothing.
      variation: previousExpenses === null || expenses === null ? null : expenses - previousExpenses,
    },
    prevuReel: {
      prevu: resolved.mixed ? null : totalOrNull(planned.filter((row) => row.kind === 'expense' && !isSavingsMovement(row)), totalExpenses, { currency }),
      reel: expenses,
    },
    // The fictional side, apart and badged. `null` when there is nothing
    // fictional at all: an empty simulation block would suggest one exists.
    simulation:
      fictionalMovements.length === 0 && fictionalIncomes.length === 0
        ? null
        : {
            badge: 'SIMULATION',
            depenses: resolved.mixed ? null : totalOrNull(fictionalMovements.filter((row) => row.kind === 'expense'), totalExpenses, { currency }),
            revenus: resolved.mixed ? null : totalOrNull(fictionalMovements.filter((row) => row.kind === 'income'), totalIncome, { currency }),
            revenusPrevus: resourcesOf(fictionalIncomes).total,
          },
    nonCategorisees: counted.filter((row) => row.categoryId === null).length,
  };
}

/**
 * Everything one period's synthesis needs, from the database.
 *
 * Extracted so the "Mon argent" screen (P6-04) and the "Aujourd'hui" home
 * screen (P6-06) read the same rows with the same filters. Two callers each
 * writing their own query is how two screens end up disagreeing about the same
 * month.
 */
export async function loadSynthesisData(prisma, userId, period) {
  const before = previousMonth(period.start);
  const [incomes, movements, previous] = await Promise.all([
    // Resources active during the period: one that ended before it started, or
    // starts after it ended, is not part of it.
    prisma.finIncome.findMany({
      where: {
        userId,
        deletedAt: null,
        archivedAt: null,
        startDate: { lte: period.end },
        OR: [{ endDate: null }, { endDate: { gte: period.start } }],
      },
      select: { id: true, label: true, value: true, currency: true, frequency: true, status: true, categoryId: true, category: { select: { key: true, family: true } } },
    }),
    prisma.finTransaction.findMany({
      where: { userId, deletedAt: null, occurredAt: { gte: period.start, lte: period.end } },
      select: { id: true, kind: true, value: true, currency: true, categoryId: true, planned: true, status: true, category: { select: { family: true } } },
    }),
    prisma.finTransaction.findMany({
      where: { userId, deletedAt: null, occurredAt: { gte: before.start, lte: before.end } },
      select: { kind: true, value: true, currency: true, planned: true, status: true, category: { select: { family: true } } },
    }),
  ]);
  return { incomes, movements, previous };
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

// ---- history (P6-23) --------------------------------------------------------

/**
 * Revenus vs dépenses, one point per month, for the last `months` calendar
 * months (this one included) — read the same way as "Mon argent"'s own
 * figures (`loadSynthesisData` + `buildSynthesis`), never a parallel count
 * that could drift from the screen that already shows the current month.
 *
 * A month resolved in another currency than the account's own is reported as
 * `null` for both figures rather than converted or silently summed with the
 * rest — the same rule `buildSynthesis` itself applies within one month.
 */
export async function monthlyMoneyHistory(prisma, userId, { months = 6, currency } = {}) {
  const now = new Date();
  const periods = Array.from({ length: months }, (_, index) => {
    const monthsAgo = months - 1 - index;
    return currentMonth(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1)));
  });

  return Promise.all(
    periods.map(async (period) => {
      const { incomes, movements } = await loadSynthesisData(prisma, userId, period);
      const synthesis = buildSynthesis({ incomes, movements, previous: [], fallbackCurrency: currency, period });
      const inCurrency = !synthesis.mixedCurrencies && synthesis.currency === currency;
      return {
        month: period.start.toISOString().slice(0, 7),
        revenus: inCurrency ? synthesis.revenus.resultat : null,
        depenses: inCurrency ? synthesis.depenses.resultat : null,
      };
    }),
  );
}

// The net monthly income a DEBT RATIO is divided by (PB-F020). A ratio of
// effort is structural: it asks what share of a normal month the instalments
// take, so the declared recurring resources are the right base — this month's
// receipts, before the salary has arrived, would make the same debt look
// unbearable on the 5th and harmless on the 30th. Without any declared
// resource, the income actually received is the only base there is.
export const debtRatioIncome = (synthesis) => synthesis.revenusPrevus?.resultat ?? synthesis.revenus?.resultat ?? null;

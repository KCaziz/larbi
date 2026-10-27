// Optional budgeting methods (P8-09, tabs 12 and 12B): 50/30/20, 80/20,
// zero-based and envelopes. « Cadres facultatifs : ils analysent le mois mais
// n'imposent pas » (ARC-08) — this compares, it never judges and never moves
// money. The category → pocket mapping is always returned, so the
// classification is visible, and the person's own choices (the budget's
// `methodMapping`) override the defaults.
import { BUDGET_METHODS, METHOD_MAPPING } from '../constants/finBudgetMethods.js';
import { computed } from './finance/contract.js';
import { isReal } from './finance/dataModel.js';
import { markedSavingsInPeriod } from './finSavings.service.js';

// The targets the client gives (tab 12), as ratios.
const TARGETS = {
  'M-01': { needs: 0.5, wants: 0.3, savings: 0.2 },
  'M-02': { spending: 0.8, savings: 0.2 },
};

const DEFAULTS = new Map(METHOD_MAPPING.map((row) => [row.group, row.pocket]));

/**
 * The pocket of one real expense: the person's choice for its group, else the
 * client's default for the group, else its sub-category's « Essentielle ? »
 * flag. Money set aside (family `goal`) is savings; an expense with no
 * category is « à classer ».
 */
export function pocketOf(row, mapping = {}) {
  if (row.category?.family === 'goal') return 'savings';
  const group = row.category?.group ?? null;
  if (!row.category) return 'unclassified';
  const rule = (group && mapping[group]) ?? (group && DEFAULTS.get(group)) ?? 'byEssential';
  if (rule === 'byEssential') return row.category.essential ? 'needs' : 'wants';
  return rule;
}

/**
 * The analysis of one budget period by one method.
 *
 * `view` is the budget's own view (buildBudgetView), `movements` the period's
 * movements as loadBudgetData reads them.
 */
export async function methodAnalysis(prisma, userId, { method, budget, view, movements, now = new Date() }) {
  const definition = BUDGET_METHODS.find((row) => row.id === method);
  const currency = budget.currency;
  const mapping = budget.methodMapping ?? {};
  const real = movements.filter((row) => row.currency === currency && !row.planned && isReal(row));
  const income = real.filter((row) => row.kind === 'income' && row.category?.family !== 'goal').reduce((sum, row) => sum + row.value, 0);

  const pockets = { needs: 0, wants: 0, savings: 0, unclassified: 0 };
  for (const row of real.filter((item) => item.kind === 'expense')) pockets[pocketOf(row, mapping)] += row.value;
  // Savings moved by TRANSFER (P8-03) are savings too.
  const transfers = await markedSavingsInPeriod(prisma, userId, currency, { from: budget.periodStart, to: budget.periodEnd });
  const savings = (transfers.net ?? 0) > 0 ? Math.max(pockets.savings, transfers.net) : pockets.savings;

  const share = (amount) => (income > 0 ? amount / income : null);
  const inputs = { methode: method, revenus_realises: income, poches: { ...pockets, savings }, rattachement_personnel: mapping };
  const answer = (id, result) => computed(id, result, { inputs, currency, now });
  const gap = (part, target) => (part === null ? null : part - target);

  const result = { methode: definition, rattachement: mappingTable(mapping) };

  if (method === 'M-01') {
    const parts = { needs: share(pockets.needs), wants: share(pockets.wants), savings: share(savings) };
    result.poches = [
      { cle: 'needs', cible: TARGETS['M-01'].needs, part: answer('AN-F005', parts.needs), ecart: answer('AN-F008', gap(parts.needs, TARGETS['M-01'].needs)) },
      { cle: 'wants', cible: TARGETS['M-01'].wants, part: answer('AN-F006', parts.wants), ecart: answer('AN-F008', gap(parts.wants, TARGETS['M-01'].wants)) },
      { cle: 'savings', cible: TARGETS['M-01'].savings, part: answer('AN-F007', parts.savings), ecart: answer('AN-F008', gap(parts.savings, TARGETS['M-01'].savings)) },
    ];
    result.aClasser = pockets.unclassified;
  } else if (method === 'M-02') {
    const spending = share(pockets.needs + pockets.wants + pockets.unclassified);
    const saved = share(savings);
    result.poches = [
      { cle: 'spending', cible: TARGETS['M-02'].spending, ecart: answer('AN-F008', gap(spending, TARGETS['M-02'].spending)), partBrute: spending },
      { cle: 'savings', cible: TARGETS['M-02'].savings, part: answer('AN-F007', saved), ecart: answer('AN-F008', gap(saved, TARGETS['M-02'].savings)) },
    ];
  } else if (method === 'M-03') {
    // Zero-based: every expected dinar is given a job — the remainder to
    // allocate (PB-F009) aims at 0.
    result.resteAAllouer = view.resteAAffecter;
  } else if (method === 'M-04') {
    // Envelopes: how many of them stay within their allocation (AN-F003).
    const lines = view.enveloppes;
    const within = lines.filter((line) => line.tauxConsommation.resultat !== null && line.tauxConsommation.resultat <= 1).length;
    result.budgetsRespectes = computed('AN-F003', lines.length === 0 ? null : within / lines.length, { inputs: { enveloppes: lines.length, respectees: within }, now });
  }
  return result;
}

// Every group of tab 12B with its pocket: the client's text, the default we
// read in it, and the person's own choice when there is one.
function mappingTable(mapping) {
  return METHOD_MAPPING.map((row) => ({ groupe: row.group, texteClient: row.pocketText, parDefaut: row.pocket, choisi: mapping[row.group] ?? null }));
}

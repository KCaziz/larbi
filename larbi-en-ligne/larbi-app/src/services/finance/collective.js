// The collective formulas that are new in the client's shared-management
// workbook (P9-11, tabs 13 and 13B). The ones that already existed under an F
// number (COL-F01, F04, F05, F09, F10, ALG-C01, ALG-C03) are not written twice:
// see `equivalent` in constants/finCollectiveFormulas.js.
//
// Same rules as the rest of the engine: pure functions, whole amounts, and
// `null` when the inputs do not allow an answer — never 0 for "unknown".
import { isAmount, isRate, ratio, roundAmount, splitByWeights } from './money.js';

// COL-F02 — part % = montant × pourcentage_i, condition Σ% = 100. Returns every
// share so they add up exactly to the amount (largest remainder, ALG-C03).
export function percentShares(amount, percents) {
  if (!isAmount(amount) || !Array.isArray(percents) || percents.length === 0) return null;
  if (!percents.every((p) => isRate(p) && p >= 0)) return null;
  const total = percents.reduce((sum, p) => sum + p, 0);
  if (Math.abs(total - 100) > 1e-9) return null;
  // Hundredths of a percent keep the weights whole without changing the split.
  return splitByWeights(amount, percents.map((p) => Math.round(p * 100)));
}

// COL-F03 — part pondérée = montant × poids_i / Σ poids; the weights are positive.
export function weightedShares(amount, weights) {
  if (!Array.isArray(weights) || !weights.every((w) => isAmount(w) && w > 0)) return null;
  return splitByWeights(amount, weights);
}

// COL-F06 — budget commun restant = budget alloué − Σ dépenses collectives
// réelles associées. May be negative: an overrun is an answer, not an error.
export function remainingCollectiveBudget(allocated, realExpenses) {
  if (!isAmount(allocated) || !Array.isArray(realExpenses) || !realExpenses.every(isAmount)) return null;
  return roundAmount(allocated - realExpenses.reduce((sum, value) => sum + value, 0));
}

// COL-F07 — taux de consommation = dépenses / budget × 100 (the engine keeps
// the decimal, the screen multiplies). Only when the budget is positive.
export function collectiveBudgetUsage(allocated, spent) {
  if (!isAmount(allocated) || !isAmount(spent) || allocated <= 0) return null;
  return ratio(spent, allocated);
}

// COL-F08 — contribution requise = besoin collectif − ressources communes,
// shared by the active rule (`weights`, one per member). Nothing here touches a
// personal account: it only says what each member would owe once they agree.
// A need already covered by the common resources asks for nothing (0 is true
// there; it is not "unknown").
export function requiredContribution(need, commonResources, weights) {
  if (!isAmount(need) || !isAmount(commonResources) || need < 0 || commonResources < 0) return null;
  const required = Math.max(0, need - commonResources);
  const shares = required === 0 ? (Array.isArray(weights) ? weights.map(() => 0) : []) : splitByWeights(required, weights);
  return shares === null ? null : { required, shares };
}

// COL-F11 — taux de tâches terminées = terminées / (échues ou planifiées) × 100
// over a period. The caller filters the period.
export function taskCompletionRate(done, due) {
  if (!isAmount(done) || !isAmount(due) || due <= 0 || done < 0 || done > due) return null;
  return ratio(done, due);
}

// COL-F12 — charge de tâches d'un membre = Σ poids assignés / Σ poids de toutes
// les tâches. An organisational indicator, never a judgement of the person.
export function memberTaskLoad(memberWeights, allWeights) {
  const valid = (list) => Array.isArray(list) && list.every((w) => isRate(w) && w >= 0);
  if (!valid(memberWeights) || !valid(allWeights)) return null;
  const sum = (list) => list.reduce((total, w) => total + w, 0);
  return ratio(sum(memberWeights), sum(allWeights));
}

// ALG-C02 — rattachement d'une dépense à un budget collectif: same space, same
// period, same category or sub-category; the most specific budget wins (a
// sub-category budget over its category's). Writes nothing.
export function attachToBudget(expense, budgets) {
  if (!expense || !Array.isArray(budgets)) return null;
  const candidates = budgets.filter(
    (budget) => budget.spaceId === expense.spaceId && budget.period === expense.period && budget.categoryId === expense.categoryId,
  );
  const precise = candidates.find((budget) => budget.subCategoryId && budget.subCategoryId === expense.subCategoryId);
  if (precise) return precise;
  return candidates.find((budget) => !budget.subCategoryId) ?? null;
}

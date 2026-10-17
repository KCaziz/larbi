// Shared rules of the FINCLUDIA calculation engine (P4-09). Every formula in
// formulas.js goes through these helpers, so the client's transversal rules are
// applied in ONE place instead of being repeated 57 times.
//
// Amounts are INTEGERS in the currency's smallest unit (centimes), never floating
// point: 0.1 + 0.2 is not 0.3 in binary floating point, and a budget that drifts
// by a centime per operation is a bug nobody can explain to a user.
//
// A value that cannot be computed is `null`, NEVER 0. The client is explicit on
// this ("division par zéro = non calculable", "afficher « non calculé », jamais 0
// par défaut"): 0 is an answer ("you saved nothing"), null is the absence of an
// answer ("we don't know yet"), and showing one for the other is lying.

import { FREQUENCY_FACTORS, annualOccurrences } from '../../constants/finance.js';

// An amount is a safe integer: beyond 2^53 the arithmetic silently loses units,
// which is the client's "valeur extrême / pas de débordement" case.
export const isAmount = (value) => Number.isSafeInteger(value);

// A rate, an inflation figure, a quantity: finite, and that is all. Negative is
// allowed — the client asks for negative returns to be usable in simulations.
export const isRate = (value) => typeof value === 'number' && Number.isFinite(value);

// Money coming out of real arithmetic (an annuity, a share of a total) returns to
// an integer number of centimes. Half away from zero, so -0.5 does not round to 0
// and a refund keeps its sign.
export const roundAmount = (value) => {
  if (!isRate(value)) return null;
  const rounded = value < 0 ? -Math.round(-value) : Math.round(value);
  return isAmount(rounded) ? rounded : null;
};

// THE rule of the engine: a quotient whose denominator is zero (or unknown) is
// not computable. Used by every rate, every "per month" and every "per day".
export const ratio = (numerator, denominator) => {
  if (!isRate(numerator) || !isRate(denominator) || denominator === 0) return null;
  const value = numerator / denominator;
  return Number.isFinite(value) ? value : null;
};

// Monthly value of a recurring amount (F001). An unknown frequency is not
// computable rather than assumed monthly: assuming would silently turn a yearly
// insurance premium into a monthly charge.
export function monthly(amount, frequency) {
  if (!isAmount(amount)) return null;
  const factor = FREQUENCY_FACTORS[frequency];
  return factor === undefined ? null : roundAmount(amount * factor);
}

// Yearly value of a recurring amount (used by F049).
export function yearly(amount, frequency) {
  if (!isAmount(amount)) return null;
  const occurrences = annualOccurrences(frequency);
  return occurrences === null ? null : roundAmount(amount * occurrences);
}

// Sum of `{ amount, currency, frequency? }` entries, normalised to the month.
//
// Mixed currencies give null: the client forbids any implicit conversion
// ("conversion uniquement avec taux daté"), and converting here without a dated
// rate would invent an exchange rate. The caller converts first, with its rate
// and its date, then sums.
export function sumAmounts(entries, { currency, monthlyNormalisation = true } = {}) {
  if (!Array.isArray(entries)) return null;
  let total = 0;
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') return null;
    if (currency !== undefined && entry.currency !== currency) return null;
    const value = monthlyNormalisation && entry.frequency !== undefined ? monthly(entry.amount, entry.frequency) : entry.amount;
    if (!isAmount(value)) return null;
    total += value;
    if (!isAmount(total)) return null;
  }
  return total;
}

// Splits a total into `count` shares that add up EXACTLY to the total (F041, and
// the client's rule "somme des parts = montant ; arrondis affectés selon règle
// documentée"). The remaining centimes go to the first shares, one each: with
// 10,00 DA between 3 people the shares are 3,34 / 3,33 / 3,33, never 3 × 3,33
// with a centime quietly lost.
export function splitAmount(total, count) {
  if (!isAmount(total) || !Number.isSafeInteger(count) || count <= 0) return null;
  const sign = total < 0 ? -1 : 1;
  const absolute = Math.abs(total);
  const base = Math.floor(absolute / count);
  const remainder = absolute - base * count;
  return Array.from({ length: count }, (_, index) => sign * (base + (index < remainder ? 1 : 0)));
}

// Shares proportional to weights (F042, F044), adding up exactly to the total.
// The largest remainders get the leftover centimes, which is the standard way to
// keep a proportional split honest; ties go to the earliest weight so the result
// is deterministic.
export function splitByWeights(total, weights) {
  if (!isAmount(total) || !Array.isArray(weights) || weights.length === 0) return null;
  if (!weights.every((w) => isAmount(w) && w >= 0)) return null;
  const sum = weights.reduce((acc, w) => acc + w, 0);
  if (sum === 0) return null;
  const sign = total < 0 ? -1 : 1;
  const absolute = Math.abs(total);
  const exact = weights.map((w) => (absolute * w) / sum);
  const shares = exact.map((value) => Math.floor(value));
  let left = absolute - shares.reduce((acc, value) => acc + value, 0);
  const order = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (const { index } of order) {
    if (left <= 0) break;
    shares[index] += 1;
    left -= 1;
  }
  return shares.map((value) => sign * value);
}

// A weighted mean of normalised sub-scores (F051, F052, F053, F054). The client
// requires the weights to be visible and editable, so they are always an input —
// the engine has no built-in weighting. With no usable sub-score the answer is
// null, not 0: "we cannot score you yet" is not "you score zero".
export function weightedIndex(components) {
  if (!Array.isArray(components) || components.length === 0) return null;
  let weighted = 0;
  let weights = 0;
  for (const component of components) {
    if (!component || typeof component !== 'object') return null;
    const { score, weight } = component;
    if (!isRate(weight) || weight < 0) return null;
    if (score === null || score === undefined) continue; // missing dimension: partial score, client's F053
    if (!isRate(score)) return null;
    weighted += score * weight;
    weights += weight;
  }
  return ratio(weighted, weights);
}

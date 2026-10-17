// The comparison engine of FINCLUDIA (P4-12), screen C19. It builds a table —
// one row per criterion, one column per option — and, only when the person
// supplies weights, the optional synthetic score the client allows (F054).
//
// The client's rules, and how each one is kept here:
//
// 1. "Ne pas produire de classement opaque." No score exists unless weights are
//    given, the weights travel back with the answer, and the normalisation used
//    is named in the hypotheses. A score the reader cannot reproduce is exactly
//    what C19 forbids.
// 2. "Données manquantes explicites." A missing value is `null` in its cell and
//    listed in the warnings. It is never replaced by a zero, which would read as
//    "free" on a cost and as "worst" on a gain.
// 3. "Devises/horizons différents => demander normalisation." Options that do
//    not share a currency or an horizon are REFUSED, naming what differs, so the
//    caller normalises with its own rate or horizon. Converting here would
//    invent an exchange rate.
// 4. A criterion that gives every option the same value cannot separate them: it
//    is shown in the table and left out of the score, rather than given an
//    arbitrary half point.

import { COMPARISON_UNITS, MAX_OPTIONS, MIN_OPTIONS, criterionByKey } from '../../constants/comparison.js';
import { computed } from './contract.js';
import { optionFitScore } from './formulas.js';
import { isRate } from './money.js';

export class NotComparableError extends Error {
  constructor(field) {
    super(`not comparable: ${field}`);
    this.field = field;
  }
}

const valueOf = (option, key) => {
  const value = option.criteria?.[key];
  return value === undefined || value === '' ? null : value;
};

// Min-max over the options actually compared, direction applied: the best value
// of the set scores 1, the worst 0. This is RELATIVE to the set — add a fourth
// option and the scores move — which is why it is returned as a hypothesis and
// not presented as an absolute mark.
function normalise(values, direction) {
  const numbers = values.filter((value) => typeof value === 'number');
  if (numbers.length === 0) return null;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  if (min === max) return null; // does not separate the options
  return (value) => {
    if (typeof value !== 'number') return null;
    const scaled = (value - min) / (max - min);
    return direction === 'lower' ? 1 - scaled : scaled;
  };
}

/**
 * Compares 2 to 3 options on the criteria the caller names.
 *
 * @param {object} input
 * @param {Array<{key: string, label: string, currency?: string, horizonMonths?: number, criteria: object}>} input.options
 * @param {string[]} input.criteria  keys of constants/comparison.js
 * @param {object|null} input.weights  criterion key -> weight; a score exists only with this
 * @throws {NotComparableError} when the options do not share a currency or an horizon
 */
export function compareOptions({ options, criteria, weights = null, now = new Date() } = {}) {
  if (!Array.isArray(options) || options.length < MIN_OPTIONS || options.length > MAX_OPTIONS) return null;
  if (!Array.isArray(criteria) || criteria.length === 0) return null;
  if (new Set(options.map((option) => option.key)).size !== options.length) return null;

  const known = criteria.map(criterionByKey);
  if (known.some((criterion) => criterion === null)) return null;
  if (known.some((criterion) => !COMPARISON_UNITS.includes(criterion.unit))) return null;

  // Rule 3: refused, not converted. The field named is the one to normalise.
  const currencies = new Set(options.map((option) => option.currency).filter((value) => value !== undefined));
  if (currencies.size > 1) throw new NotComparableError('currency');
  const horizons = new Set(options.map((option) => option.horizonMonths).filter((value) => value !== undefined));
  if (horizons.size > 1) throw new NotComparableError('horizonMonths');
  const currency = [...currencies][0];

  const warnings = [];
  const rows = known.map((criterion) => {
    const values = options.map((option) => valueOf(option, criterion.key));
    const missing = options.filter((option, index) => values[index] === null).map((option) => option.key);
    if (missing.length > 0) warnings.push({ criterion: criterion.key, missing });

    const scale = criterion.direction === null ? null : normalise(values, criterion.direction);
    const comparable = criterion.direction !== null && values.every((value) => typeof value === 'number');
    // The best cell of a row is named only when the direction is known and no
    // value is missing: "best of what we know" would be misleading.
    let best = [];
    if (comparable) {
      const numbers = values.filter((value) => typeof value === 'number');
      const target = criterion.direction === 'lower' ? Math.min(...numbers) : Math.max(...numbers);
      best = options.filter((option, index) => values[index] === target).map((option) => option.key);
    }

    return {
      criterion: criterion.key,
      unit: criterion.unit,
      direction: criterion.direction,
      grade: criterion.grade === true,
      values: Object.fromEntries(options.map((option, index) => [option.key, values[index]])),
      best,
      // Rule 4: shown, but out of the score.
      separates: scale !== null,
      scale,
    };
  });

  let scores = null;
  if (weights !== null) {
    const used = rows.filter((row) => row.separates && isRate(weights[row.criterion]) && weights[row.criterion] > 0);
    if (used.length > 0) {
      scores = Object.fromEntries(
        options.map((option) => [
          option.key,
          computed(
            'F054',
            optionFitScore(
              used.map((row) => ({ score: row.scale(row.values[option.key]), weight: weights[row.criterion] })),
            ),
            {
              inputs: {
                option: option.key,
                criteres: used.map((row) => row.criterion),
                poids: Object.fromEntries(used.map((row) => [row.criterion, weights[row.criterion]])),
              },
              currency,
              // The client requires the method to be understandable before a
              // score is shown. These two lines ARE the method.
              hypotheses: {
                normalisation: 'min-max sur les options comparées',
                criteres_ecartes: rows.filter((row) => !row.separates).map((row) => row.criterion),
              },
              now,
            },
          ),
        ]),
      );
    }
  }

  return {
    options: options.map((option) => ({ key: option.key, label: option.label })),
    currency,
    horizonMonths: [...horizons][0] ?? null,
    criteria: rows.map(({ scale, ...row }) => row),
    scores,
    weights,
    warnings,
  };
}

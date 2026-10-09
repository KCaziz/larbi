// The answer contract of every critical calculation (P4-09), tab `15_API` of the
// client's workbook. The field names are the client's own, kept verbatim because
// this is the published shape of the API:
//
//   resultat          required   the main value
//   unite             required   "DZD", "%", "mois", "points"...
//   formule_id        required   Fxxx or ALG-xx
//   formule_version   required   version of the formula on the server
//   entrees_snapshot  required   the inputs used, or their identifier
//   hypotheses        if simulation   return, inflation, horizon...
//   avertissements    if applicable   missing, old or partial data
//   versions_sources  if external     references of the data used
//   calcule_le        required   timestamp
//
// Why it exists: the client requires every score, projection and comparison to
// expose its variables, its hypotheses and its date. A bare number in a response
// cannot be explained six months later, and a formula that changes silently makes
// every past screenshot a lie. Nothing computed on the server leaves without this
// envelope, and the interface never recomputes a value of its own.

import { algorithmById, formulaById } from '../../constants/finance.js';

// `unite` as the client wants it: a money result carries the currency actually
// used, a rate says it is a decimal to be shown as a percentage.
const UNIT_LABELS = {
  ratio: 'ratio', // decimal, displayed × 100 as a percentage
  months: 'mois',
  days: 'jours',
  points: 'points',
  count: 'nombre',
  composite: 'composite',
};

function resolveUnit(unit, currency) {
  if (unit !== 'money') return UNIT_LABELS[unit] ?? unit;
  // A money value without its currency is meaningless and would be displayed
  // next to the wrong symbol: that is a programming mistake, not user data.
  if (typeof currency !== 'string' || currency.length === 0) throw new Error('A money result needs its currency');
  return currency;
}

/**
 * Wraps a computed value in the client's contract.
 *
 * `result === null` is a legitimate answer ("not computable"): the formula's own
 * condition, as written by the client, is added to `avertissements` so the screen
 * can say WHY instead of showing a zero.
 */
export function computed(id, result, { inputs = {}, currency, hypotheses = null, warnings = [], sources = null, now = new Date() } = {}) {
  const formula = formulaById(id);
  const algorithm = formula ? null : algorithmById(id);
  if (!formula && !algorithm) throw new Error(`Unknown formula or algorithm: ${id}`);

  const messages = [...warnings];
  if (result === null && formula && formula.condition !== '—') messages.push(formula.condition);

  const answer = {
    resultat: result,
    unite: formula ? resolveUnit(formula.unit, currency) : 'composite',
    formule_id: id,
    formule_version: (formula ?? algorithm).version,
    entrees_snapshot: inputs,
    calcule_le: now.toISOString(),
  };
  // The three conditional fields are left out when they do not apply, rather
  // than sent empty: "hypotheses: null" on a plain total suggests a simulation
  // that never happened.
  if (hypotheses !== null) answer.hypotheses = hypotheses;
  if (messages.length > 0) answer.avertissements = messages;
  if (sources !== null) answer.versions_sources = sources;
  return answer;
}

// True when a contract answers "we cannot compute this". The interface shows
// "non calculé" for these, NEVER 0 (the client's rule, and the reason this
// helper exists instead of a `=== 0` test somewhere in a component).
export const isNotComputed = (answer) => answer?.resultat === null || answer?.resultat === undefined;

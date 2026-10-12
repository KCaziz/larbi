// The metadata socle, in code (P6-02). Pure functions, no database: this is what
// "une donnée financière valide" means, so one definition serves the zod schemas,
// the services and the extended consistency control, and they cannot drift apart.

import { CONFIDENCE_LEVELS, CONSENT_USES, DATA_SCOPES, DATA_SOURCES, DATA_STATUSES, FICTIONAL_STATUS } from '../../constants/finData.js';
import { isAmount, sumAmounts } from './money.js';

export const isKnownScope = (value) => DATA_SCOPES.includes(value);
export const isKnownSource = (value) => DATA_SOURCES.includes(value);
export const isKnownStatus = (value) => DATA_STATUSES.includes(value);

// A fictional row (the client's « fictif », badge « SIMULATION »). Anything whose
// status we cannot read is NOT treated as real: an unreadable status is reported
// by the consistency control, and until then it stays out of real totals.
export const isFictional = (row) => row?.status === FICTIONAL_STATUS;
export const isReal = (row) => isKnownStatus(row?.status) && !isFictional(row);

// ISO 4217: three letters, upper case. The engine never converts (no dated rate),
// so the only thing to check is that a currency is actually stated.
export const isCurrencyCode = (value) => typeof value === 'string' && /^[A-Z]{3}$/.test(value);

const isDateLike = (value) => value instanceof Date && !Number.isNaN(value.getTime());

// Every rule the client states about a stored financial datum, as a list of
// problems (empty = valid). `amounts: false` is for an object that carries no
// amount of its own — a category names a line, it is not a line — and then the
// integer-amount rule does not apply; `currency` says the same about the
// currency, and defaults to whatever `amounts` says.
export function checkFinancialRow(row, { amounts = true, currency = amounts } = {}) {
  const problems = [];
  if (!row || typeof row !== 'object') return ['not a record'];

  if (!isKnownStatus(row.status)) problems.push(`unknown status ${JSON.stringify(row.status)}`);
  if (!isKnownScope(row.scope)) problems.push(`unknown scope ${JSON.stringify(row.scope)}`);
  if (!isKnownSource(row.source)) problems.push(`unknown source ${JSON.stringify(row.source)}`);
  // "lorsque pertinent": absent is fine, a value nobody declared is not.
  if (row.confidence !== undefined && row.confidence !== null && !CONFIDENCE_LEVELS.includes(row.confidence)) {
    problems.push(`unknown confidence ${JSON.stringify(row.confidence)}`);
  }
  if (!Array.isArray(row.consentUses) || row.consentUses.some((use) => !CONSENT_USES.includes(use))) {
    problems.push('consent uses are not a list of declared uses');
  } else if (new Set(row.consentUses).size !== row.consentUses.length) {
    problems.push('the same consent use is listed twice');
  }
  if (!Number.isSafeInteger(row.version) || row.version < 1) problems.push('version is not a positive integer');
  if (!isDateLike(row.effectiveAt)) problems.push('no effective date');
  if (!isDateLike(row.collectedAt)) problems.push('no collection date');

  // A currency is required wherever an amount is expressed, even when the row
  // holds several amounts rather than one `value` (an onboarding record).
  if (currency && !isCurrencyCode(row.currency)) problems.push('no currency');
  // Integers in the smallest unit: a float amount has already lost centimes.
  if (amounts && !isAmount(row.value)) problems.push('amount is not a whole number of centimes');
  return problems;
}

// Real and fictional are counted SEPARATELY and never added together (the phase
// rule « réel et fictif jamais additionnés »). There is deliberately no function
// here that returns one combined total: a caller that wants both numbers shows
// both numbers, with the « SIMULATION » badge on the second.
//
// A row whose status is unreadable lands in neither total and is counted in
// `unknown`, so a screen can say so instead of quietly dropping it.
export function totalsByReality(rows, { currency, monthlyNormalisation = false } = {}) {
  if (!Array.isArray(rows)) return null;
  const real = rows.filter(isReal);
  const fictional = rows.filter(isFictional);
  const unknown = rows.length - real.length - fictional.length;
  const options = { currency, monthlyNormalisation };
  // The socle calls the amount `value` (the client's « valeur »); the engine's
  // adder calls it `amount`. One mapping here, so neither name leaks into the
  // other side.
  const entries = (list) => list.map((row) => ({ amount: row.value, currency: row.currency, ...(monthlyNormalisation ? { frequency: row.frequency } : {}) }));
  return {
    real: sumAmounts(entries(real), options),
    fictional: fictional.length === 0 ? null : sumAmounts(entries(fictional), options),
    counts: { real: real.length, fictional: fictional.length, unknown },
  };
}

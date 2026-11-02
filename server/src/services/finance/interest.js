// Simple and compound interest on a sum, with or without regular payments.
// The rules are the client's (message of 2026-11-02), written in his order:
//
//   - the rate of a period is NEVER divided: 1 % a month is already the monthly
//     rate; only a yearly rate is turned into the rate of the period, by
//     j / m when it is NOMINAL and by (1 + TAE)^(1/m) - 1 when it is EFFECTIVE;
//   - compound: capital(n+1) = capital(n) × (1 + r), with a payment added at
//     the end of the period (capital × (1 + r) + V) or at the start
//     ((capital + V) × (1 + r));
//   - simple: the base is the capital invested, never the interest, so the
//     interest does not earn interest.
//
// Nothing else is in the figures: no tax, no account fees (said by the client).
// The calculation is done period by period, in floating point, and rounded ONCE
// at the end, so the cents do not drift with the number of periods.

import { roundAmount } from './money.js';

export const RATE_PERIOD_MONTHS = { monthly: 1, quarterly: 3, annual: 12 };

/** The rate of one calculation period, from the rate as typed. */
export function periodRate({ rate, ratePeriod, rateKind, periodMonths }) {
  if (!Number.isFinite(rate) || rate <= -1) return null;
  if (ratePeriod !== 'annual') return rate;
  const perYear = 12 / periodMonths;
  return rateKind === 'effective' ? (1 + rate) ** (1 / perYear) - 1 : rate / perYear;
}

/** The yearly rate that a compounded period rate is worth: (1 + r)^m - 1. */
export const effectiveAnnualRate = (rate, periodMonths) => (Number.isFinite(rate) ? (1 + rate) ** (12 / periodMonths) - 1 : null);

/**
 * Value after `periods`, split into what the capital became and what the
 * payments became. `every` = a payment each `every` periods.
 */
export function interestValue({ initial, payment, rate, periods, every, kind, timing }) {
  if (![initial, payment, rate].every(Number.isFinite) || !Number.isSafeInteger(periods) || periods < 0) return null;
  if (kind === 'compound') {
    let lump = initial;
    let stream = 0;
    for (let t = 1; t <= periods; t += 1) {
      const pays = (t - (timing === 'start' ? 1 : 0)) % every === 0 && payment !== 0;
      if (timing === 'start' && pays) stream += payment;
      lump *= 1 + rate;
      stream *= 1 + rate;
      if (timing === 'end' && pays) stream += payment;
    }
    return { lump: roundAmount(lump), payments: roundAmount(stream), paid: payment === 0 ? 0 : payments(periods, every, timing) * payment };
  }
  // Simple: interest = r × (capital + payments made so far), per period, never added to the base.
  let invested = 0; // the payments made so far
  let interest = 0;
  for (let t = 1; t <= periods; t += 1) {
    const pays = payment !== 0 && (t - (timing === 'start' ? 1 : 0)) % every === 0;
    if (timing === 'start' && pays) invested += payment;
    interest += (initial + invested) * rate;
    if (timing === 'end' && pays) invested += payment;
  }
  const lumpInterest = initial * rate * periods;
  return { lump: roundAmount(initial + lumpInterest), payments: roundAmount(invested + (interest - lumpInterest)), paid: invested };
}

// How many payments fall inside `periods` periods.
function payments(periods, every, timing) {
  let count = 0;
  for (let t = 1; t <= periods; t += 1) if ((t - (timing === 'start' ? 1 : 0)) % every === 0) count += 1;
  return count;
}

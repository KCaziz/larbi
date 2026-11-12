// An interest rate may be written per month, quarter, half-year or year
// (recette R11-14). The engine reads one period per field (most often the
// year); a rate typed for another period is brought to it here, as a NOMINAL
// rate — the way banks quote one: 1 % per month is 12 % per year (no
// compounding added), and 12 % per year is 1 % per month.
export const RATE_PERIODS = ['annuel', 'semestriel', 'trimestriel', 'mensuel'];
export const PERIODS_PER_YEAR = { annuel: 1, semestriel: 2, trimestriel: 4, mensuel: 12 };

/** `value` (a number, any unit) written per `from`, expressed per `to`. */
export function convertRate(value, from = 'annuel', to = 'annuel') {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return null;
  return (Number(value) * PERIODS_PER_YEAR[from]) / PERIODS_PER_YEAR[to];
}

/** A percentage typed for `period`, as the yearly fraction the server stores (0.06 for 6 %). */
export function yearlyFraction(percentText, period = 'annuel') {
  if (percentText === '' || percentText === null || percentText === undefined) return null;
  const percent = Number(String(percentText).replace(',', '.'));
  if (!Number.isFinite(percent)) return null;
  return convertRate(percent, period, 'annuel') / 100;
}

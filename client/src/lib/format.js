// Unsupported UI languages (tamazight) fall back to French for formatting.
const locale = (language) => (language === 'tzm' ? 'fr' : language);

// Amounts travel as INTEGERS in the currency's smallest unit (centimes), which
// is how the calculation engine computes them (P4-09). Only the display divides.
export function formatAmount(language, minorUnits, currency) {
  if (minorUnits === null || minorUnits === undefined) return '';
  const value = minorUnits / 100;
  try {
    return new Intl.NumberFormat(locale(language), { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

// Rates are computed and carried as decimals (0.15) and shown as percentages —
// the client's rule. The × 100 lives here and nowhere else.
export function formatRatio(language, ratio, { digits = 1 } = {}) {
  if (ratio === null || ratio === undefined) return '';
  try {
    return new Intl.NumberFormat(locale(language), { style: 'percent', maximumFractionDigits: digits }).format(ratio);
  } catch {
    return `${(ratio * 100).toFixed(digits)} %`;
  }
}

export function formatNumber(language, value, { digits = 1 } = {}) {
  if (value === null || value === undefined) return '';
  try {
    return new Intl.NumberFormat(locale(language), { maximumFractionDigits: digits }).format(value);
  } catch {
    return String(value);
  }
}

// Locale-aware date; unsupported UI languages (tamazight) fall back to French.
export function formatDate(language, iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(language === 'tzm' ? 'fr' : language, { dateStyle: 'medium' }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleDateString();
  }
}

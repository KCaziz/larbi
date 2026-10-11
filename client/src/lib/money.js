// Money on screen (P3-09). The API always speaks in INTEGERS of the currency's
// smallest unit (centimes...); the number of decimals of each currency comes
// from Intl, so nothing is hard-coded per currency.

export function fractionDigits(currency) {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits;
  } catch {
    return 2;
  }
}

export function formatMoney(language, amount, currency) {
  const digits = fractionDigits(currency);
  const value = amount / 10 ** digits;
  try {
    return new Intl.NumberFormat(language === 'tzm' ? 'fr' : language, { style: 'currency', currency }).format(value);
  } catch {
    return `${value.toFixed(digits)} ${currency}`;
  }
}

// What an administrator types ("2 500,50" or "2500.5") -> 250050, or null when
// it is not a valid positive price for that currency. Done on the digits as
// text: no floating-point rounding.
export function toMinorUnits(text, currency) {
  const digits = fractionDigits(currency);
  const clean = String(text ?? '').replace(/[\s  ]/g, '').replace(',', '.');
  const pattern = digits > 0 ? new RegExp(`^(\\d{1,10})(?:\\.(\\d{1,${digits}}))?$`) : /^(\d{1,10})$/;
  const match = clean.match(pattern);
  if (!match) return null;
  const minor = Number(match[1] + (match[2] ?? '').padEnd(digits, '0'));
  return minor > 0 && Number.isSafeInteger(minor) ? minor : null;
}

// 250050 -> "2500.50": the value an edit field starts with.
export function fromMinorUnits(amount, currency) {
  const digits = fractionDigits(currency);
  if (digits === 0) return String(amount);
  const s = String(amount).padStart(digits + 1, '0');
  return `${s.slice(0, -digits)}.${s.slice(-digits)}`;
}

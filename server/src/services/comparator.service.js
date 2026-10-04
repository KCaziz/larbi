import { themeByKey } from '../constants/comparator.js';

// Pure helpers of the bank comparator (P4-06): no database access, unit-tested on
// every value of the client's file.
//
// The texts are shown to visitors exactly as the client wrote them. The only
// number derived from them is an ESTIMATED YEARLY COST, and only when the text is
// unambiguous: a plain amount ("1 260,5 DA", "180 DA (TTC)"), "Gratuit" / "Franco",
// or a yearly formula ("17 000 DA / An", "17 000 DA / 2 ans"). Anything else
// ("0,25% (Max 3 500 DA)", "1 800 DA + 700 DA/chargement", "426,89 DA (renouvellement)",
// "Non spécifié"...) gives null: the row is still shown, it is just not ranked.

const normalize = (text) =>
  String(text ?? '')
    .replace(/[  ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const FREE = /^(gratuit|franco)$/i;
// "1 260,5" / "17 000" / "75" — French grouping with spaces, decimal comma.
const NUMBER = String.raw`(\d{1,3}(?: \d{3})+|\d+)(?:,(\d+))?`;
const PLAIN_AMOUNT = new RegExp(String.raw`^${NUMBER} ?DA(?: \(TTC\))?$`, 'i');
const YEARLY_AMOUNT = new RegExp(String.raw`^${NUMBER} ?DA(?: \(TTC\))? ?\/ ?(?:(\d+) )?ans?$`, 'i');

const toNumber = (int, dec) => Number(`${int.replace(/ /g, '')}.${dec ?? '0'}`);
const round2 = (n) => Math.round(n * 100) / 100;

// A plain amount in DA, 0 for "Gratuit" / "Franco", null for anything else.
export function parseAmount(text) {
  const s = normalize(text);
  if (FREE.test(s)) return 0;
  const m = s.match(PLAIN_AMOUNT);
  return m ? toNumber(m[1], m[2]) : null;
}

// A yearly amount: a plain amount (the column is a yearly fee), or "X DA / An",
// "X DA / N ans" (spread over N years). null otherwise.
export function parseYearlyAmount(text) {
  const plain = parseAmount(text);
  if (plain !== null) return plain;
  const m = normalize(text).match(YEARLY_AMOUNT);
  if (!m) return null;
  const years = m[3] ? Number(m[3]) : 1;
  return years > 0 ? round2(toNumber(m[1], m[2]) / years) : null;
}

const PERIODS = { mensuel: 12, mensuelle: 12, trimestriel: 4, trimestrielle: 4, semestriel: 2, semestrielle: 2, annuel: 1, annuelle: 1 };

// How many times a year a fee is charged, from the periodicity text; null if unknown.
export function periodFactor(text) {
  const key = normalize(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  return PERIODS[key] ?? null;
}

// Estimated yearly cost of a condition of the rubric `themeKey`, or null when it
// cannot be derived without guessing.
export function annualCost(themeKey, values = {}) {
  const metric = themeByKey(themeKey)?.metric;
  if (!metric) return null;
  if (metric.kind === 'annual') return parseYearlyAmount(values[metric.amount]);
  if (metric.kind === 'periodic') {
    const amount = parseAmount(values[metric.amount]);
    if (amount === null) return null;
    if (amount === 0) return 0; // free: the periodicity does not matter
    const factor = periodFactor(values[metric.period]);
    return factor === null ? null : round2(amount * factor);
  }
  return null;
}

// Cleans the values typed for a rubric: only its own columns, trimmed, empty ones
// dropped. Returns { values, unknown } — `unknown` lists the keys that do not
// belong to the rubric (the caller refuses them).
export function cleanValues(themeKey, raw = {}) {
  const fields = themeByKey(themeKey)?.fields ?? [];
  const values = {};
  const unknown = [];
  for (const [key, value] of Object.entries(raw ?? {})) {
    if (!fields.includes(key)) {
      unknown.push(key);
      continue;
    }
    const text = normalize(value);
    if (text) values[key] = text;
  }
  return { values, unknown };
}

// Reading the text of a payslip (P8-30) — PURE functions, no browser, no network.
//
// What this does and does not do. It proposes CANDIDATE lines from text that a
// PDF reader or an OCR produced: a label, a kind (the decoder's own kinds) and
// an amount. It never computes a salary, never fills in what it did not read, and
// marks what it is unsure of. EVERY candidate is confirmed by the person before
// the decoder sees it (« extraites puis confirmées par la personne avant tout
// calcul »), and a line it cannot place is « à confirmer », never a guess.

// Accents and punctuation stripped, lower-cased, for matching only.
export const plain = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9%.,/\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * One amount as written on a payslip, in the smallest unit (centimes), or null.
 * « 45 000,00 », « 45.000,00 », « 45000.00 », « 45 000 ». The LAST separator is
 * the decimal one when it is followed by one or two digits; otherwise the
 * separators are thousands.
 */
export function parseAmount(token) {
  const text = String(token ?? '')
    .replace(/[   ]/g, '')
    .replace(/[^\d.,-]/g, '');
  if (!/\d/.test(text)) return null;
  const negative = text.startsWith('-');
  const digits = text.replace(/^-/, '');
  const lastDot = digits.lastIndexOf('.');
  const lastComma = digits.lastIndexOf(',');
  const last = Math.max(lastDot, lastComma);
  let integer = digits;
  let decimals = '00';
  if (last !== -1) {
    const after = digits.slice(last + 1);
    // Two digits (or one) after the last separator: that separator is the decimal point.
    if (after.length === 1 || after.length === 2) {
      integer = digits.slice(0, last);
      decimals = after.padEnd(2, '0');
    }
  }
  integer = integer.replace(/[.,]/g, '');
  if (!/^\d+$/.test(integer)) return null;
  const minor = Number(integer) * 100 + Number(decimals);
  if (!Number.isSafeInteger(minor)) return null;
  return negative ? -minor : minor;
}

// Words that name a line of a payslip, in the order they are tried. Each maps to
// one of the decoder's own kinds (constants/finPayroll.js); nothing else is invented.
const KINDS = [
  ['base_salary', /\b(salaire de base|salaire base|sal\.? de base|traitement de base)\b/],
  ['seniority', /\banciennete\b/],
  ['overtime', /\b(heures? sup|heures? supplementaires?|h\.? ?sup)\b/],
  ['bonus', /\b(prime|gratification|rendement|panier|transport)\b/],
  ['social_employee', /\b(retenue (ss|securite sociale)|securite sociale|cotisation|cnas|ss 9|retenue sociale)\b/],
  ['irg', /\b(irg|impot sur le revenu|retenue irg)\b/],
  ['advance', /\b(acompte|avance)\b/],
  ['allowance', /\b(indemnite|iep|ifsp|allocation)\b/],
  ['other_deduction', /\b(retenue|saisie|pret|mutuelle|cotisation mutuelle)\b/],
];

const NET = /\bnet (a|à) payer\b|\bnet a payer\b|\bnet payable\b|\bsalaire net\b/;
// An amount: groups of three digits joined by ONE space or dot (« 45 000,00 »,
// « 1 234 567 »), or plain digits, with up to two decimals. Two spaces or more
// separate COLUMNS, so « 1 000,00      1 250,00 » is two amounts.
const AMOUNT = /-?\d{1,3}(?:[ .  ]\d{3})+(?:[.,]\d{1,2})?|-?\d+(?:[.,]\d{1,2})?/g;
// Words of a line that is not an amount of the payslip (a page, a number of days).
const NOISE = /\b(page|folio|matricule|n°|numero|tel|telephone|code|date|jours?|exercice)\b/;

const kindOf = (label) => {
  const text = plain(label);
  for (const [kind, pattern] of KINDS) if (pattern.test(text)) return kind;
  return 'unknown';
};

/** « 09/2026 », « septembre 2026 » next to a period word → `2026-09`, or null. */
export function findPeriod(text) {
  const MONTHS = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];
  for (const line of String(text ?? '').split(/\r?\n/)) {
    const p = plain(line);
    if (!/(periode|mois de|bulletin|paie du|fiche de paie)/.test(p)) continue;
    const numeric = p.match(/\b(0?[1-9]|1[0-2])[/.-](20\d\d)\b/);
    if (numeric) return `${numeric[2]}-${numeric[1].padStart(2, '0')}`;
    const named = p.match(new RegExp(`\\b(${MONTHS.join('|')})\\s+(20\\d\\d)\\b`));
    if (named) return `${named[2]}-${String(MONTHS.indexOf(named[1]) + 1).padStart(2, '0')}`;
  }
  return null;
}

/**
 * The candidate lines of a payslip's text.
 *
 * A text line becomes a candidate when it ends with an amount. When several
 * amounts stand on the same line (base, rate, gain, deduction columns) the LAST
 * one is proposed and the line is marked `ambiguous`: the person looks at it.
 * `unknown` lines stay « à confirmer ». The net to pay is returned apart.
 */
export function parsePayslip(text) {
  const lines = String(text ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const candidates = [];
  let declaredNet = null;

  for (const line of lines) {
    const found = [...line.matchAll(AMOUNT)].map((match) => ({ raw: match[0], index: match.index }));
    if (found.length === 0) continue;
    const last = found[found.length - 1];
    const value = parseAmount(last.raw);
    if (value === null) continue;
    const label = line.slice(0, found[0].index).replace(/[\s(:.\-–]+$/, '').trim();
    // A bare number with no words before it (a page number, a date, a total with
    // no name) says nothing: not proposed.
    if (!/[a-zA-ZÀ-ÿ]{3,}/.test(label) || NOISE.test(plain(label))) continue;
    if (NET.test(plain(label))) {
      declaredNet = value;
      continue;
    }
    candidates.push({
      label: label.slice(0, 80),
      kind: kindOf(label),
      value,
      raw: line,
      // Several amounts on the line: which column is the one? Not decided here.
      ambiguous: found.length >= 3,
    });
  }
  return { candidates, declaredNet, period: findPeriod(text) };
}

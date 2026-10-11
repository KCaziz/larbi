import { INVOICE_LIMITS } from '../constants/invoice.js';

// Invoice generator (P4-03): turns what the person typed into exact amounts.
// Everything is integer arithmetic (BigInt) in the currency's smallest unit:
//   line total (excl. tax) = quantity x unit price, rounded to the nearest unit
//   line tax               = line total x rate, rounded to the nearest unit
//   totals                 = sums of the rounded line amounts
// Rounding "half up" per line is the default rule here; the client may give
// another one (per rate group, for instance), it would change only this file.

// Number of decimals of a currency (ISO 4217), from the runtime's own data.
export function fractionDigits(currency) {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits;
  } catch {
    return 2;
  }
}

// "2 500,5" with 2 decimals -> 250050n; null when it has more decimals than allowed.
export function parseDecimal(text, decimals) {
  const [int, frac = ''] = String(text).trim().replace(',', '.').split('.');
  if (!/^\d+$/.test(int) || !/^\d*$/.test(frac) || frac.length > decimals) return null;
  return BigInt(int + frac.padEnd(decimals, '0'));
}

// a / b rounded to the nearest integer, halves up (a, b >= 0).
const divRound = (a, b) => (a * 2n + b) / (2n * b);

// 1500n with 3 decimals -> "1.5" (how a quantity or a rate is shown back).
function decimalText(value, decimals) {
  const s = value.toString().padStart(decimals + 1, '0');
  const int = s.slice(0, s.length - decimals);
  const frac = s.slice(s.length - decimals).replace(/0+$/, '');
  return frac ? `${int}.${frac}` : int;
}

// `input` has passed invoiceSchema. Returns { errors } (paths of the fields at
// fault) or { invoice } with every amount computed.
export function computeInvoice(input) {
  const digits = fractionDigits(input.currency);
  const errors = [];

  if (input.dueDate && input.dueDate < input.issueDate) errors.push('dueDate');

  const lines = input.lines.map((line, i) => {
    const quantity = parseDecimal(line.quantity, 3);
    const unitPrice = parseDecimal(line.unitPrice, digits);
    const rate = parseDecimal(line.vatRate, 2); // basis points: 19.5 % -> 1950
    if (quantity === null || quantity === 0n) errors.push(`lines.${i}.quantity`);
    if (unitPrice === null) errors.push(`lines.${i}.unitPrice`);
    if (rate === null || rate > 10000n) errors.push(`lines.${i}.vatRate`);
    if (quantity === null || unitPrice === null || rate === null) return null;
    const net = divRound(quantity * unitPrice, 1000n);
    const vat = divRound(net * rate, 10000n);
    return { description: line.description, quantity, unitPrice, rate, net, vat };
  });
  if (errors.length) return { errors };

  const net = lines.reduce((s, l) => s + l.net, 0n);
  const vat = lines.reduce((s, l) => s + l.vat, 0n);
  if (net + vat > INVOICE_LIMITS.maxTotal) return { errors: ['total'] };

  // Tax summary per rate, in the order the rates first appear.
  const byRate = new Map();
  for (const l of lines) {
    const group = byRate.get(l.rate) ?? { net: 0n, vat: 0n };
    group.net += l.net;
    group.vat += l.vat;
    byRate.set(l.rate, group);
  }

  return {
    invoice: {
      language: input.language,
      number: input.number,
      issueDate: input.issueDate,
      dueDate: input.dueDate || null,
      currency: input.currency,
      fractionDigits: digits,
      seller: input.seller,
      buyer: input.buyer,
      notes: input.notes,
      lines: lines.map((l) => ({
        description: l.description,
        quantity: decimalText(l.quantity, 3),
        unitPrice: Number(l.unitPrice),
        vatRate: decimalText(l.rate, 2),
        net: Number(l.net),
        vat: Number(l.vat),
        gross: Number(l.net + l.vat),
      })),
      totals: {
        net: Number(net),
        vat: Number(vat),
        gross: Number(net + vat),
        byRate: [...byRate].map(([rate, g]) => ({ vatRate: decimalText(rate, 2), net: Number(g.net), vat: Number(g.vat) })),
      },
    },
  };
}

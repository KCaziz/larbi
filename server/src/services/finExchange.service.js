import { FOREIGN_CURRENCIES, OFFICIAL_CURRENCY } from '../constants/finCurrencies.js';
import { HttpError } from '../utils/httpError.js';

// P10-05 — counter-values at the OFFICIAL rate (Banque d'Algérie), never the
// parallel market, and always with the reference date of the rate used. The
// cahier: « conversion uniquement avec taux daté ».

// The latest official rate of each foreign currency on or before `at`.
export async function latestRates(prisma, at = new Date()) {
  const rows = await prisma.finExchangeRate.findMany({
    where: { currency: { in: FOREIGN_CURRENCIES }, referenceDate: { lte: at } },
    orderBy: { referenceDate: 'desc' },
    select: { currency: true, rate: true, referenceDate: true, source: true },
  });
  const rates = new Map();
  for (const row of rows) if (!rates.has(row.currency)) rates.set(row.currency, row);
  return rates;
}

// An amount (minor units) in `currency`, in dinars (minor units), with the rate
// and its date; null when no official rate is known for it.
export function counterValue(amount, currency, rates) {
  if (amount === null || amount === undefined) return null;
  if (currency === OFFICIAL_CURRENCY) return { value: amount, rate: 1, referenceDate: null, currency: OFFICIAL_CURRENCY };
  const rate = rates.get(currency);
  if (!rate) return null;
  return { value: Math.round(amount * rate.rate), rate: rate.rate, referenceDate: rate.referenceDate, currency: OFFICIAL_CURRENCY, source: rate.source };
}

export async function listRates(prisma) {
  const latest = await latestRates(prisma);
  return FOREIGN_CURRENCIES.map((currency) => {
    const row = latest.get(currency);
    return { currency, rate: row?.rate ?? null, referenceDate: row?.referenceDate ?? null, source: row?.source ?? null };
  });
}

// An administrator records the official rate of a reference date (one per
// currency and date: recording it again corrects it).
export async function recordRate(prisma, { currency, rate, referenceDate, source }) {
  if (!FOREIGN_CURRENCIES.includes(currency)) throw new HttpError(422, 'Unknown currency', { reason: 'unknownCurrency' });
  const day = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate()));
  return prisma.finExchangeRate.upsert({
    where: { currency_referenceDate: { currency, referenceDate: day } },
    create: { currency, rate, referenceDate: day, source },
    update: { rate, source },
    select: { currency: true, rate: true, referenceDate: true, source: true },
  });
}

// P13-05 (2026-11-25): the official rate to propose by default in the
// import-export and diaspora screens, from `from` to `to`, on or before `at`.
// Through the dinar when neither is the dinar; null when a rate is missing.
export async function officialRate(prisma, from, to, at = new Date()) {
  if (from === to) return null;
  const rates = await latestRates(prisma, at);
  const toDinar = (currency) => (currency === OFFICIAL_CURRENCY ? { rate: 1, referenceDate: null, source: null } : (rates.get(currency) ?? null));
  const a = toDinar(from);
  const b = toDinar(to);
  if (!a || !b) return null;
  const dates = [a.referenceDate, b.referenceDate].filter(Boolean).map((d) => new Date(d));
  const oldest = dates.length ? new Date(Math.min(...dates)) : null;
  return { rate: Math.round((a.rate / b.rate) * 1e6) / 1e6, referenceDate: oldest, source: a.source ?? b.source };
}

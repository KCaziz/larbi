import { INVESTLAB } from '../constants/investLabData.js';
import { computed } from './finance/contract.js';

/**
 * P13-01 (2026-11-25) — InvestLab: the client's market data 2020–2026 and the
 * calculations of its section 13.3, on its own conventions (annex B):
 *   - start at the end of the start year, end at the end of the end year
 *     (2026 = the reference of 17/11/2026, year-to-date);
 *   - fractions of units allowed (pedagogical), gross of tax and fees;
 *   - dividends in cash, not reinvested: those of the exercises after the start
 *     year up to the end year, on the quantity held when they are paid (assumed
 *     in the middle of the next year), corporate actions applied to quantities;
 *   - metals: metal performance × exchange-rate effect, in dinars;
 *   - real value: nominal value / cumulated inflation of the years covered.
 * An asset not listed at the start is « NOT_LISTED », never zero. Bonds,
 * deposits and foreign-currency deposits keep the document's own reference
 * values (they need contracts and coupons the document approximates).
 */

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
const LAST_YEAR = 2026;
const YTD_NOTE = '2026 : repère du 17/11/2026 (cumul de l’année), et inflation 2026 en rythme glissant.';

const endDate = (year) => (year === LAST_YEAR ? '2026-11-17' : `${year}-12-31`);
const factorBetween = (ticker, after, upTo) => INVESTLAB.actions.filter((a) => a.ticker === ticker && a.factor && a.date > after && a.date <= upTo).reduce((f, a) => f * a.factor, 1);

export function cumulatedInflation(from, to) {
  let factor = 1;
  for (let y = from + 1; y <= to; y += 1) {
    const rate = INVESTLAB.inflation[y]?.rate;
    if (rate === null || rate === undefined) return null;
    factor *= 1 + rate;
  }
  return factor;
}

/** One listed share bought at the end of `from`, held to the end of `to`. */
export function stockBacktest(ticker, amount, from, to) {
  const stock = INVESTLAB.stocks[ticker];
  const p0 = stock?.prices[from] ?? null;
  const p1 = stock?.prices[to] ?? null;
  if (p0 === null) return { status: 'NOT_LISTED' };
  if (p1 === null) return { status: 'NO_PRICE' };
  const start = `${from}-12-31`;
  const units = amount / p0;
  let income = 0;
  for (const d of INVESTLAB.dividends.filter((x) => x.ticker === ticker && x.year > from && x.year <= to && x.dps !== null)) {
    income += d.dps * units * factorBetween(ticker, start, `${d.year + 1}-07-01`);
  }
  const quantity = units * factorBetween(ticker, start, endDate(to));
  const final = quantity * p1 + income;
  return { status: 'OK', units, quantity, income, final };
}

export function indexBacktest(amount, from, to) {
  const a = INVESTLAB.index[from];
  const b = INVESTLAB.index[to];
  if (!a || !b) return { status: 'NO_PRICE' };
  return { status: 'OK', income: 0, final: (amount * b) / a };
}

export function metalBacktest(metal, amount, from, to) {
  const a = INVESTLAB.metals[from];
  const b = INVESTLAB.metals[to];
  if (!a?.[metal] || !b?.[metal] || !a.usdDzd || !b.usdDzd) return { status: 'NO_PRICE' };
  const metalReturn = b[metal] / a[metal] - 1;
  const fxReturn = b.usdDzd / a.usdDzd - 1;
  return { status: 'OK', income: 0, final: amount * (1 + metalReturn) * (1 + fxReturn), metalReturn, fxReturn };
}

/** The backtest of every computable asset, amount in DZD (minor units: centimes). */
export function backtest({ amount = 1_000_000, from = 2020, to = LAST_YEAR } = {}) {
  const inflation = cumulatedInflation(from, to);
  const now = new Date();
  const rows = [];
  const push = (asset, kind, r, formula) => {
    if (r.status !== 'OK') {
      rows.push({ asset, kind, status: r.status });
      return;
    }
    const nominal = r.final / amount - 1;
    const real = inflation ? r.final / inflation : null;
    const inputs = { montant: amount, debut: endDate(from), fin: endDate(to), revenus: Math.round(r.income) };
    rows.push({
      asset,
      kind,
      status: 'OK',
      income: Math.round(r.income),
      final: computed(formula, Math.round(r.final), { inputs, currency: 'DZD', now }),
      nominal: Math.round(nominal * 10000) / 10000,
      real: computed('E055', real === null ? null : Math.round(real), { inputs: { ...inputs, inflation_cumulee: inflation }, currency: 'DZD', now }),
      realReturn: real === null ? null : Math.round((real / amount - 1) * 10000) / 10000,
      ...(r.metalReturn !== undefined ? { metalReturn: r.metalReturn, fxReturn: r.fxReturn } : {}),
    });
  };
  for (const ticker of Object.keys(INVESTLAB.stocks)) push(ticker, 'stock', stockBacktest(ticker, amount, from, to), 'E054');
  push('DZAIRINDEX', 'index', indexBacktest(amount, from, to), 'E057');
  for (const metal of ['gold', 'silver', 'platinum']) push(metal, 'metal', metalBacktest(metal, amount, from, to), 'E056');
  rows.sort((a, b) => (b.final?.resultat ?? -Infinity) - (a.final?.resultat ?? -Infinity));
  return {
    parametres: { montant: amount, debut: endDate(from), fin: endDate(to), inflationCumulee: inflation },
    lignes: rows,
    reference: from === 2020 && to === LAST_YEAR ? INVESTLAB.reference : null,
    notes: to === LAST_YEAR ? [YTD_NOTE] : [],
  };
}

/** The sheet of one share (ECR « Fiche action »): prices, yearly change, dividends, corporate actions. */
export function stockSheet(ticker) {
  const stock = INVESTLAB.stocks[ticker];
  if (!stock) return null;
  const series = YEARS.map((y, i) => {
    const price = stock.prices[y] ?? null;
    const previous = i > 0 ? (stock.prices[YEARS[i - 1]] ?? null) : null;
    return { year: y, price, status: price === null ? 'NOT_LISTED' : 'OK', change: price !== null && previous !== null ? Math.round((price / previous - 1) * 10000) / 10000 : null };
  });
  return {
    ticker,
    ...stock,
    series,
    dividends: INVESTLAB.dividends.filter((d) => d.ticker === ticker).map((d) => ({ ...d, yield: d.dps !== null && stock.prices[d.year] ? Math.round((d.dps / stock.prices[d.year]) * 10000) / 10000 : null })),
    actions: INVESTLAB.actions.filter((a) => a.ticker === ticker),
  };
}

export const investLabOverview = () => ({
  sections: INVESTLAB.sections,
  actions: Object.entries(INVESTLAB.stocks).map(([ticker, s]) => ({ ticker, name: s.name, sector: s.sector, compartment: s.compartment, price: s.price, currentYield: s.currentYield })),
  indice: INVESTLAB.index,
  inflation: INVESTLAB.inflation,
  metaux: INVESTLAB.metals,
  sources: INVESTLAB.sources,
  annees: YEARS,
});

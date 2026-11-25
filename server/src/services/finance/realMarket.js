// The pedagogical market (EP06, R8-12) joined with the client's real market data
// (P13-01, InvestLab, FINCLUDIA_Portefeuille.docx). Decision of 2026-11-25:
// the real data are ADDED to the market; when both describe the same thing, the
// client's figures are the reference.
//
//   - added: the ten listed shares of the Algiers stock exchange, DZAIRINDEX,
//     silver and platinum in DZD — each with its real yearly prices;
//   - replaced: three archetypes the client's document also describes — gold,
//     savings at 2.5 % and the government bond (its OAT O100230). Their price
//     SCALE is kept, so a position already bought keeps its meaning, but their
//     path follows the client's figures instead of our simulated ones.
//
// The client publishes yearly values (end of year; 2026 as of 17 November). A
// month between two of them is interpolated geometrically, and said so; after
// the last one the price stays flat. Nothing is invented between the points.

import { MARKET_START, MARKET_SUPPORTS, MARKET_VERSION } from '../../constants/finPaperMarket.js';
import { INVESTLAB } from '../../constants/investLabData.js';
import { marketMonths, simulatedSeries } from './paperMarket.js';

const LAST_POINT_MONTH = { 2026: 10 }; // 17 November 2026 (0-based month)
const yearEnd = (year) => year * 12 + (LAST_POINT_MONTH[year] ?? 11);

/** Yearly points { year: value } → [{ index (months), value }] sorted, nulls left out. */
function points(yearly) {
  return Object.entries(yearly)
    .filter(([, v]) => v !== null && v !== undefined && Number.isFinite(Number(v)))
    .map(([year, v]) => ({ index: yearEnd(Number(year)), value: Number(v) }))
    .sort((a, b) => a.index - b.index);
}

/** The value of a month, interpolated geometrically between two published points. */
function valueAt(pts, index) {
  if (!pts.length) return null;
  if (index <= pts[0].index) return index === pts[0].index ? pts[0].value : null;
  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1];
    const b = pts[i];
    if (index <= b.index) {
      const share = (index - a.index) / (b.index - a.index);
      return a.value * (b.value / a.value) ** share;
    }
  }
  return pts.at(-1).value;
}

const toIndex = (month) => {
  const [y, m] = month.split('-').map(Number);
  return y * 12 + m - 1;
};

/** Yearly return (compound) and volatility (of yearly log returns) of the published points. */
function statsOf(pts) {
  if (pts.length < 2) return { yearlyReturn: 0, volatility: 0 };
  const years = (pts.at(-1).index - pts[0].index) / 12;
  const yearlyReturn = (pts.at(-1).value / pts[0].value) ** (1 / years) - 1;
  const logs = pts.slice(1).map((p, i) => Math.log(p.value / pts[i].value));
  const mean = logs.reduce((a, b) => a + b, 0) / logs.length;
  const volatility = logs.length > 1 ? Math.sqrt(logs.reduce((s, x) => s + (x - mean) ** 2, 0) / (logs.length - 1)) : 0;
  return { yearlyReturn: Math.round(yearlyReturn * 10000) / 10000, volatility: Math.round(volatility * 10000) / 10000 };
}

/** A monthly series in centimes from yearly points, either in its own unit or rescaled to `scaleTo`. */
function seriesFrom(pts, { now, unit = 100, scaleTo = null }) {
  const months = marketMonths(MARKET_START, now);
  const raw = months.map((month) => ({ month, value: valueAt(pts, toIndex(month)) })).filter((p) => p.value !== null);
  if (!raw.length) return [];
  const factor = scaleTo ? scaleTo / raw[0].value : unit;
  return raw.map((p) => ({ month: p.month, price: Math.max(1, Math.round(p.value * factor)) }));
}

const metalDzd = (metal) => Object.fromEntries(Object.entries(INVESTLAB.metals).map(([year, m]) => [year, m[metal] && m.usdDzd ? m[metal] * m.usdDzd : null]));

const SOURCE = 'Document FINCLUDIA Portefeuille (2020–2026), InvestLab';

/** The client's figures for the archetypes it also describes. */
function clientArchetype(support, now) {
  if (support.key === 'or') {
    const pts = points(metalDzd('gold'));
    return { pts, series: seriesFrom(pts, { now, scaleTo: support.startPrice }), note: 'gold' };
  }
  const reference = (name) => INVESTLAB.reference.find((r) => r.asset === name);
  const compound = (rate) => {
    // A steady published rate: the path compounds it month by month, without noise.
    const months = marketMonths(MARKET_START, now);
    return months.map((month, i) => ({ month, price: Math.round(support.startPrice * (1 + rate) ** (i / 12)) }));
  };
  if (support.key === 'livret') {
    const ref = reference('Épargne DZD 2,5% (scénario)');
    if (!ref) return null;
    return { rate: 0.025, series: compound(0.025), note: 'savings' };
  }
  if (support.key === 'obligation-etat') {
    const ref = reference('OAT O100230');
    if (!ref) return null;
    // The document's backtest: 10 000 at the end of 2020 → `final`, coupons included.
    const rate = Math.round(((ref.final / ref.initial) ** (1 / 6) - 1) * 10000) / 10000;
    return { rate, series: compound(rate), note: 'oat' };
  }
  return null;
}

/** Every support of the market, with its source, its series and its hypotheses. */
export function marketSupports(now = new Date()) {
  const archetypes = MARKET_SUPPORTS.map((support) => {
    const client = clientArchetype(support, now);
    if (!client) return { ...support, source: 'fictional', series: simulatedSeries(support, { version: MARKET_VERSION, start: MARKET_START, now }) };
    const stats = client.pts ? statsOf(client.pts) : { yearlyReturn: client.rate, volatility: 0 };
    return { ...support, ...stats, source: 'client', sourceLabel: SOURCE, clientNote: client.note, interpolated: Boolean(client.pts), series: client.series };
  });

  const added = [];
  for (const [ticker, stock] of Object.entries(INVESTLAB.stocks)) {
    const pts = points(stock.prices ?? {});
    const series = seriesFrom(pts, { now });
    if (!series.length) continue;
    added.push({
      key: `cote-${ticker.toLowerCase()}`,
      name: `${stock.name} (${ticker})`,
      description: [stock.sector, stock.compartment ? `compartiment ${stock.compartment}` : null, stock.isin].filter(Boolean).join(' · '),
      assetClass: 'shares',
      liquidity: 'days',
      horizonMonths: 96,
      risk: 6,
      startPrice: series[0].price,
      ...statsOf(pts),
      source: 'client',
      sourceLabel: SOURCE,
      interpolated: true,
      series,
    });
  }
  const indexPts = points(INVESTLAB.index ?? {});
  if (indexPts.length) {
    const series = seriesFrom(indexPts, { now });
    added.push({ key: 'dzairindex', name: 'DZAIRINDEX', description: 'Indice de la Bourse d’Alger, en points (1 point affiché comme 1 DA), indice de prix', assetClass: 'shares', liquidity: 'days', horizonMonths: 96, risk: 5, startPrice: series[0].price, ...statsOf(indexPts), source: 'client', sourceLabel: SOURCE, interpolated: true, series });
  }
  for (const [metal, name] of [['silver', 'Argent'], ['platinum', 'Platine']]) {
    const pts = points(metalDzd(metal));
    const series = seriesFrom(pts, { now });
    if (!series.length) continue;
    added.push({ key: metal === 'silver' ? 'argent' : 'platine', name, description: 'Prix de l’once en DZD (prix en dollars × cours USD/DZD de fin d’année)', assetClass: 'commodities', liquidity: 'days', horizonMonths: 60, risk: 5, startPrice: series[0].price, ...statsOf(pts), source: 'client', sourceLabel: SOURCE, interpolated: true, series });
  }
  return [...archetypes, ...added];
}

export const marketSupportByKey = (key, now = new Date()) => marketSupports(now).find((s) => s.key === key) ?? null;

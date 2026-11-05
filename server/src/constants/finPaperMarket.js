// The pedagogical market (screen EP06, recette R8-12).
//
// The client's specification asks for « des instruments et données de marché à
// finalité éducative, sans exécution », and allows « données fictives ou
// pédagogiques » — but supplies none: no instrument, no price, no history (its
// nine workbooks and two documents were searched on 2026-11-05). So the market
// is a set of ARCHETYPES, one per family of placement, with generic names (never
// a real company, bank or fund) and WRITTEN hypotheses: an average yearly return
// and a volatility, in prudent orders of magnitude. Their histories are
// simulated from these hypotheses (services/finance/paperMarket.js) and always
// shown as « exemple fictif — pas un cours réel ».
//
// These hypotheses are ours, dated and versioned: the client validates or
// replaces them at the acceptance, and a new version says which ones produced
// a figure. Prices in centimes of DZD.
export const MARKET_VERSION = '2026-11';
export const MARKET_HYPOTHESES_DATE = '2026-11-05';
// The months the simulated histories start from.
export const MARKET_START = '2024-01';
// The inflation the real returns are read against: the one the simulators
// offer by default (constants/simulators.js), not a forecast.
export const MARKET_INFLATION = 0.05;

// liquidity: how fast the money comes back — immediate, term (at maturity),
// days (sold within a few days, at the day's price).
// risk: 1 (lowest) to 7 (highest), the scale savings documents commonly use.
export const MARKET_SUPPORTS = [
  { key: 'livret', assetClass: 'savings', yearlyReturn: 0.025, volatility: 0.003, startPrice: 100_000, liquidity: 'immediate', horizonMonths: 0, risk: 1 },
  { key: 'depot-terme', assetClass: 'savings', yearlyReturn: 0.035, volatility: 0.003, startPrice: 100_000, liquidity: 'term', horizonMonths: 12, risk: 1 },
  { key: 'obligation-etat', assetClass: 'bonds', yearlyReturn: 0.05, volatility: 0.03, startPrice: 1_000_000, liquidity: 'days', horizonMonths: 36, risk: 2 },
  { key: 'sukuk', assetClass: 'bonds', yearlyReturn: 0.055, volatility: 0.04, startPrice: 1_000_000, liquidity: 'days', horizonMonths: 36, risk: 3 },
  { key: 'fonds-diversifie', assetClass: 'funds', yearlyReturn: 0.065, volatility: 0.09, startPrice: 500_000, liquidity: 'days', horizonMonths: 60, risk: 4 },
  { key: 'action-grande', assetClass: 'shares', yearlyReturn: 0.08, volatility: 0.2, startPrice: 250_000, liquidity: 'days', horizonMonths: 96, risk: 5 },
  { key: 'action-petite', assetClass: 'shares', yearlyReturn: 0.1, volatility: 0.32, startPrice: 80_000, liquidity: 'days', horizonMonths: 96, risk: 6 },
  { key: 'or', assetClass: 'commodities', yearlyReturn: 0.05, volatility: 0.15, startPrice: 1_500_000, liquidity: 'days', horizonMonths: 60, risk: 5 },
];
export const MARKET_SUPPORT_KEYS = MARKET_SUPPORTS.map((support) => support.key);
export const MARKET_ASSET_CLASSES = [...new Set(MARKET_SUPPORTS.map((support) => support.assetClass))];

// The projection a person may ask: an amount and a number of years.
export const PROJECTION_MAX_YEARS = 30;

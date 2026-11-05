// The pedagogical market's engine (screen EP06, recette R8-12). Pure functions:
// no database, no clock unless one is given.
//
// A support's history is a simulated monthly path from its written hypotheses
// (constants/finPaperMarket.js): each month's change is drawn around the
// average return with the support's volatility — the model the investment
// literature uses to teach risk (a log-normal walk). The draws come from a
// generator seeded with the support's key and the hypotheses' version, so a
// history is the same for everybody and on every reload, and a new month adds
// one step without rewriting the past. It is an EXAMPLE, never a quote.

// A small, well-known seeded generator (mulberry32): the same seed gives the
// same sequence, which is what makes the histories reproducible and testable.
function generator(seedText) {
  let seed = 2166136261;
  for (const char of seedText) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let x = seed;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// A standard normal draw from two uniform ones (Box-Muller).
const normal = (random) => {
  const u = Math.max(random(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
};

const monthKey = (year, month) => `${year}-${String(month + 1).padStart(2, '0')}`;

// The months from `start` ('YYYY-MM') to the month of `now`, both included.
export function marketMonths(start, now = new Date()) {
  const [year, month] = start.split('-').map(Number);
  const last = now.getUTCFullYear() * 12 + now.getUTCMonth();
  const months = [];
  for (let index = year * 12 + month - 1; index <= last; index += 1) months.push(monthKey(Math.floor(index / 12), index % 12));
  return months;
}

// The simulated monthly prices of a support, in centimes, one per month.
export function simulatedSeries(support, { version, start, now = new Date() }) {
  const random = generator(`${support.key}:${version}`);
  const drift = (Math.log(1 + support.yearlyReturn) - support.volatility ** 2 / 2) / 12;
  const spread = support.volatility / Math.sqrt(12);
  let price = support.startPrice;
  return marketMonths(start, now).map((month, index) => {
    if (index > 0) price *= Math.exp(drift + spread * normal(random));
    return { month, price: Math.max(1, Math.round(price)) };
  });
}

// What the history shows: the return over the last twelve months and over the
// whole history (per year), the volatility actually seen, the worst month and
// the largest fall from a peak. Null when the history is too short to say.
export function seriesMeasures(series) {
  if (series.length < 2) return { lastYear: null, perYear: null, volatility: null, worstMonth: null, largestFall: null };
  const prices = series.map((point) => point.price);
  const changes = prices.slice(1).map((price, index) => price / prices[index] - 1);
  const logs = prices.slice(1).map((price, index) => Math.log(price / prices[index]));
  const mean = logs.reduce((sum, value) => sum + value, 0) / logs.length;
  const variance = logs.length > 1 ? logs.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (logs.length - 1) : 0;
  let peak = prices[0];
  let largestFall = 0;
  for (const price of prices) {
    peak = Math.max(peak, price);
    largestFall = Math.min(largestFall, price / peak - 1);
  }
  const years = (prices.length - 1) / 12;
  return {
    lastYear: prices.length > 12 ? prices.at(-1) / prices.at(-13) - 1 : null,
    perYear: (prices.at(-1) / prices[0]) ** (1 / years) - 1,
    volatility: Math.sqrt(variance) * Math.sqrt(12),
    worstMonth: Math.min(...changes),
    largestFall,
  };
}

// The standard normal distribution function (Abramowitz-Stegun 7.1.26).
function normalCdf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-(x * x) / 2);
  return x >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
}

// « If I place this amount for this many years »: a range, not a promise. The
// low and high ends leave one chance in ten below and above; the middle is the
// median. Also the same middle in today's money, and the chance of ending
// below the amount placed. Amounts in centimes.
export function projection(support, { amount, years, inflation }) {
  const drift = Math.log(1 + support.yearlyReturn) - support.volatility ** 2 / 2;
  const spread = support.volatility * Math.sqrt(years);
  const at = (z) => Math.round(amount * Math.exp(drift * years + z * spread));
  const median = at(0);
  return {
    amount,
    years,
    low: at(-1.2816),
    median,
    high: at(1.2816),
    medianInTodayMoney: Math.round(median / (1 + inflation) ** years),
    chanceOfLoss: spread === 0 ? (drift < 0 ? 1 : 0) : normalCdf(-(drift * years) / spread),
  };
}

// The return once inflation is taken out — the real one.
export const realReturn = (yearlyReturn, inflation) => (1 + yearlyReturn) / (1 + inflation) - 1;

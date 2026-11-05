import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { MARKET_INFLATION, MARKET_START, MARKET_SUPPORTS, MARKET_VERSION } from '../../src/constants/finPaperMarket.js';
import { marketMonths, projection, realReturn, seriesMeasures, simulatedSeries } from '../../src/services/finance/paperMarket.js';

// The pedagogical market's engine (EP06, recette R8-12): simulated histories
// that are reproducible, coherent with their written hypotheses, and
// projections that are a range, never a promise.

const NOW = new Date('2026-11-05T12:00:00Z');
const byKey = (key) => MARKET_SUPPORTS.find((support) => support.key === key);
const seriesOf = (key, now = NOW) => simulatedSeries(byKey(key), { version: MARKET_VERSION, start: MARKET_START, now });

describe('the months of the market', () => {
  test('from the start month to the current one, both included, across years', () => {
    assert.deepEqual(marketMonths('2025-11', new Date('2026-02-10T00:00:00Z')), ['2025-11', '2025-12', '2026-01', '2026-02']);
    assert.equal(marketMonths(MARKET_START, NOW).length, 35);
  });
});

describe('a simulated history', () => {
  test('is the same on every call, and a new month adds a step without rewriting the past', () => {
    const now = seriesOf('action-grande');
    assert.deepEqual(now, seriesOf('action-grande'));
    const later = seriesOf('action-grande', new Date('2026-12-05T12:00:00Z'));
    assert.equal(later.length, now.length + 1);
    assert.deepEqual(later.slice(0, now.length), now);
  });

  test('starts at the written price and stays positive, in whole centimes', () => {
    for (const support of MARKET_SUPPORTS) {
      const series = seriesOf(support.key);
      assert.equal(series[0].price, support.startPrice, support.key);
      assert.ok(series.every((point) => Number.isInteger(point.price) && point.price > 0), support.key);
    }
  });

  test('a savings account never falls; a share varies far more than it', () => {
    const savings = seriesMeasures(seriesOf('livret'));
    const share = seriesMeasures(seriesOf('action-petite'));
    assert.equal(savings.largestFall, 0);
    assert.ok(savings.volatility < 0.01, `savings volatility ${savings.volatility}`);
    assert.ok(share.volatility > 0.15, `share volatility ${share.volatility}`);
    assert.ok(share.largestFall < -0.1, `share fall ${share.largestFall}`);
  });

  test('two months are too short to say anything about a year', () => {
    const measures = seriesMeasures([{ month: '2026-10', price: 100 }, { month: '2026-11', price: 110 }]);
    assert.equal(measures.lastYear, null);
    assert.equal(seriesMeasures([{ month: '2026-11', price: 100 }]).perYear, null);
  });
});

describe('a projection', () => {
  test('is a range around a median, wider the more the support varies', () => {
    const savings = projection(byKey('livret'), { amount: 10_000_000, years: 5, inflation: MARKET_INFLATION });
    const share = projection(byKey('action-grande'), { amount: 10_000_000, years: 5, inflation: MARKET_INFLATION });
    for (const result of [savings, share]) assert.ok(result.low < result.median && result.median < result.high);
    assert.ok(share.high - share.low > 10 * (savings.high - savings.low));
    assert.ok(share.chanceOfLoss > 0.1 && savings.chanceOfLoss < 0.01);
  });

  test('says what the middle is worth in today’s money', () => {
    const result = projection(byKey('livret'), { amount: 10_000_000, years: 10, inflation: MARKET_INFLATION });
    assert.equal(result.medianInTodayMoney, Math.round(result.median / (1 + MARKET_INFLATION) ** 10));
    assert.ok(result.medianInTodayMoney < result.amount, 'a savings account below inflation loses purchasing power');
  });

  test('the real return takes inflation out', () => {
    assert.ok(Math.abs(realReturn(0.05, 0.05)) < 1e-12);
    assert.ok(realReturn(0.025, MARKET_INFLATION) < 0);
  });
});

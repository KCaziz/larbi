import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { backtest, cumulatedInflation, stockSheet } from '../../src/services/investLab.service.js';

// P13-01 (2026-11-25): the engine of InvestLab reproduces the backtest of the
// client's document (section 12, 10 000 DZD from 31/12/2020 to 17/11/2026),
// line by line, from the document's own tables.

const NAMES = { gold: 'Or', silver: 'Argent', platinum: 'Platine' };

describe('InvestLab', () => {
  test('the backtest of the document, to the dinar, nominal and real', () => {
    const r = backtest({ amount: 1_000_000, from: 2020, to: 2026 });
    let checked = 0;
    for (const line of r.lignes.filter((l) => l.status === 'OK')) {
      const ref = r.reference.find((x) => x.asset === (NAMES[line.asset] ?? line.asset));
      assert.ok(ref, line.asset);
      assert.equal(Math.round(line.final.resultat / 100), ref.final, `${line.asset} nominal`);
      assert.equal(Math.round(line.real.resultat / 100), ref.real, `${line.asset} real`);
      checked += 1;
    }
    assert.equal(checked, 9);
  });

  test('a share not listed at the start is « not listed », never zero', () => {
    const r = backtest({ amount: 1_000_000, from: 2020, to: 2026 });
    assert.equal(r.lignes.find((l) => l.asset === 'CPA').status, 'NOT_LISTED');
    const later = backtest({ amount: 1_000_000, from: 2024, to: 2026 });
    assert.equal(later.lignes.find((l) => l.asset === 'CPA').status, 'OK');
  });

  test('Alliance: the free shares of 2025 multiply the quantity by 1.5', () => {
    const r = backtest({ amount: 1_000_000, from: 2024, to: 2026 });
    const all = r.lignes.find((l) => l.asset === 'ALL');
    // 10 000 / 420 shares × 1.5 × 360 + dividend of 2025 (26) on 1.5 × the shares.
    const units = 10_000 / 420;
    assert.equal(Math.round(all.final.resultat / 100), Math.round(units * 1.5 * 360 + 26 * units * 1.5));
  });

  test('cumulated inflation 2021–2026 is the document’s 1.4233', () => {
    assert.equal(Math.round(cumulatedInflation(2020, 2026) * 10000) / 10000, 1.4233);
  });

  test('a share sheet keeps N/C as null', () => {
    const cpa = stockSheet('CPA');
    assert.equal(cpa.series.find((p) => p.year === 2020).price, null);
    assert.equal(cpa.series.find((p) => p.year === 2020).status, 'NOT_LISTED');
  });
});

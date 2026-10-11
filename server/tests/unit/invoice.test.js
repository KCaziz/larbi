import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { computeInvoice, fractionDigits, parseDecimal } from '../../src/services/invoice.service.js';
import { invoiceSchema } from '../../src/validation/invoice.schemas.js';

// Invoice generator (P4-03): exact integer arithmetic, no floating point.
const base = (lines, extra = {}) =>
  invoiceSchema.parse({
    number: 'F-2026-001',
    issueDate: '2026-10-11',
    currency: 'DZD',
    seller: { name: 'Prestataire' },
    buyer: { name: 'Client' },
    lines,
    ...extra,
  });

describe('decimals', () => {
  test('currencies keep their own number of decimals', () => {
    assert.equal(fractionDigits('DZD'), 2);
    assert.equal(fractionDigits('JPY'), 0);
    assert.equal(fractionDigits('TND'), 3);
  });

  test('typed text becomes an integer of the smallest unit', () => {
    assert.equal(parseDecimal('2500,5', 2), 250050n);
    assert.equal(parseDecimal('2500.50', 2), 250050n);
    assert.equal(parseDecimal('0.1', 2), 10n);
    assert.equal(parseDecimal('1.005', 2), null, 'more decimals than the currency has');
  });
});

describe('amounts', () => {
  test('quantity x price, then tax per line, rounded half up; totals are sums of rounded lines', () => {
    const { invoice } = computeInvoice(
      base([
        { description: 'Heures', quantity: '1,5', unitPrice: '3333.33', vatRate: '19' },
        { description: 'Licence', quantity: '3', unitPrice: '0.10', vatRate: '9' },
        { description: 'Formation', quantity: '1', unitPrice: '1000', vatRate: '19' },
      ]),
    );
    // 1.5 x 3333.33 = 4999.995 -> 5000.00 ; tax 19 % = 950.00
    assert.deepEqual(invoice.lines[0], { description: 'Heures', quantity: '1.5', unitPrice: 333333, vatRate: '19', net: 500000, vat: 95000, gross: 595000 });
    // 3 x 0.10 = 0.30 ; 9 % = 0.027 -> 0.03
    assert.equal(invoice.lines[1].net, 30);
    assert.equal(invoice.lines[1].vat, 3);
    assert.deepEqual(invoice.totals, {
      net: 500000 + 30 + 100000,
      vat: 95000 + 3 + 19000,
      gross: 500000 + 30 + 100000 + 95000 + 3 + 19000,
      byRate: [
        { vatRate: '19', net: 600000, vat: 114000 },
        { vatRate: '9', net: 30, vat: 3 },
      ],
    });
  });

  test('0.1 + 0.2 is exactly 0.3 here (no floating point)', () => {
    const { invoice } = computeInvoice(
      base([
        { description: 'A', quantity: '1', unitPrice: '0.1', vatRate: '0' },
        { description: 'B', quantity: '1', unitPrice: '0.2', vatRate: '0' },
      ]),
    );
    assert.equal(invoice.totals.gross, 30);
  });

  test('a currency without decimals refuses cents; a zero quantity, a rate above 100 %, a due date before issue are refused', () => {
    assert.deepEqual(computeInvoice(base([{ description: 'A', quantity: '1', unitPrice: '10.5', vatRate: '0' }], { currency: 'JPY' })).errors, ['lines.0.unitPrice']);
    assert.deepEqual(computeInvoice(base([{ description: 'A', quantity: '0', unitPrice: '1', vatRate: '0' }])).errors, ['lines.0.quantity']);
    assert.deepEqual(computeInvoice(base([{ description: 'A', quantity: '1', unitPrice: '1', vatRate: '100.01' }])).errors, ['lines.0.vatRate']);
    assert.deepEqual(computeInvoice(base([{ description: 'A', quantity: '1', unitPrice: '1', vatRate: '0' }], { dueDate: '2026-10-10' })).errors, ['dueDate']);
  });

  test('an absurd total is refused instead of losing precision', () => {
    const lines = Array.from({ length: 100 }, () => ({ description: 'X', quantity: '9999999.999', unitPrice: '999999999999', vatRate: '100' }));
    assert.deepEqual(computeInvoice(base(lines)).errors, ['total']);
  });

  test('the schema refuses impossible dates and malformed numbers', () => {
    const ok = { number: '1', currency: 'DZD', seller: { name: 'S' }, buyer: { name: 'B' }, lines: [{ description: 'A', quantity: '1', unitPrice: '1', vatRate: '0' }] };
    assert.equal(invoiceSchema.safeParse({ ...ok, issueDate: '2026-02-30' }).success, false);
    assert.equal(invoiceSchema.safeParse({ ...ok, issueDate: '2026-10-11', lines: [{ ...ok.lines[0], quantity: '-1' }] }).success, false);
    assert.equal(invoiceSchema.safeParse({ ...ok, issueDate: '2026-10-11', lines: [{ ...ok.lines[0], unitPrice: '1e5' }] }).success, false);
    assert.equal(invoiceSchema.safeParse({ ...ok, issueDate: '2026-10-11' }).success, true);
  });
});

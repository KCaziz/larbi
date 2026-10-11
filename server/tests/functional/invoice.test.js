import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { boot } from '../helpers/server.js';

// Invoice generator (P4-03) through the real API: needs an account, computes on
// the server, builds a real Excel file, stores nothing.

let t;
let user;

const invoice = (extra = {}) => ({
  language: 'fr',
  number: 'F-2026/001',
  issueDate: '2026-10-11',
  dueDate: '2026-11-10',
  currency: 'dzd',
  seller: { name: 'Studio Essai', details: '12 rue des Tests\nAlger' },
  buyer: { name: 'Client SARL', details: '' },
  lines: [
    { description: 'Développement', quantity: '2', unitPrice: '15000', vatRate: '19' },
    { description: 'Hébergement', quantity: '1', unitPrice: '2500,50', vatRate: '9' },
  ],
  notes: 'Paiement à 30 jours.',
  ...extra,
});
const post = (path, json, who = user) => t.request('POST', `/tools/factures${path}`, { user: who, json });

before(async () => {
  t = await boot();
  await t.reset();
  user = await t.user();
});
after(() => t.close());

describe('invoice generator', () => {
  test('an account is required (tool registry: authenticated)', async () => {
    assert.equal((await t.request('POST', '/tools/factures/calcul', { json: invoice() })).status, 401);
    assert.equal((await t.request('POST', '/tools/factures/excel', { json: invoice() })).status, 401);
    const tools = (await t.request('GET', '/tools')).body.tools;
    assert.deepEqual(tools.find((x) => x.key === 'generateur-facture'), { key: 'generateur-facture', status: 'available', access: 'authenticated' });
  });

  test('the server checks and computes the invoice', async () => {
    const res = await post('/calcul', invoice());
    assert.equal(res.status, 200);
    const inv = res.body.invoice;
    assert.equal(inv.currency, 'DZD');
    assert.equal(inv.fractionDigits, 2);
    assert.deepEqual(inv.lines.map((l) => [l.net, l.vat]), [
      [3000000, 570000],
      [250050, 22505],
    ]);
    assert.deepEqual(inv.totals, {
      net: 3250050,
      vat: 592505,
      gross: 3842555,
      byRate: [
        { vatRate: '19', net: 3000000, vat: 570000 },
        { vatRate: '9', net: 250050, vat: 22505 },
      ],
    });
  });

  test('errors name the fields at fault, so the form can point at them', async () => {
    const res = await post('/calcul', invoice({ number: '', lines: [{ description: 'A', quantity: 'abc', unitPrice: '1', vatRate: '0' }] }));
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.error.details.fields.sort(), ['lines.0.quantity', 'number']);
    const tax = await post('/calcul', invoice({ lines: [{ description: 'A', quantity: '1', unitPrice: '1', vatRate: '120' }] }));
    assert.deepEqual(tax.body.error.details.fields, ['lines.0.vatRate']);
    assert.equal((await post('/calcul', invoice({ lines: [] }))).status, 400);
    assert.equal((await post('/calcul', invoice({ total: 1 }))).status, 400, 'no unknown field (a total cannot be imposed)');
  });

  test('the Excel file is a real workbook with the server amounts', async () => {
    const res = await post('/excel', invoice());
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    assert.match(res.headers.get('content-disposition'), /attachment; filename="facture-F-2026-001\.xlsx"/);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.deepEqual([...res.buffer.subarray(0, 2)], [0x50, 0x4b], 'a zip container (xlsx)');

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(res.buffer);
    const sheet = wb.worksheets[0];
    assert.equal(sheet.name, 'Facture');
    const cells = [];
    sheet.eachRow((row) => cells.push(row.values.slice(1)));
    const flat = cells.flat();
    assert.ok(flat.includes('Facture F-2026/001'));
    assert.ok(flat.includes('Studio Essai') && flat.includes('Alger') && flat.includes('Client SARL'));
    assert.ok(flat.includes('Paiement à 30 jours.'));
    const gross = cells.find((r) => r[0] === 'Total TTC');
    assert.equal(gross[4], 38425.55);
    const line = cells.find((r) => r[0] === 'Hébergement');
    assert.deepEqual(line, ['Hébergement', 1, 2500.5, 9, 2500.5]);
  });

  test('Arabic: labels in Arabic and a right-to-left sheet', async () => {
    const res = await post('/excel', invoice({ language: 'ar' }));
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(res.buffer);
    const sheet = wb.worksheets[0];
    assert.equal(sheet.name, 'فاتورة');
    assert.equal(sheet.views[0].rightToLeft, true);
  });
});

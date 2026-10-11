import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { boot } from '../helpers/server.js';

// Invoice generator (P4-03) against hostile input: what is typed must stay text
// in the Excel file (never a formula), and the generator cannot be used to make
// the server do unbounded work.

let t;
let user;
const invoice = (extra = {}) => ({
  number: 'F1',
  issueDate: '2026-10-11',
  currency: 'DZD',
  seller: { name: 'S' },
  buyer: { name: 'B' },
  lines: [{ description: 'Ligne', quantity: '1', unitPrice: '100', vatRate: '0' }],
  ...extra,
});

before(async () => {
  t = await boot();
  await t.reset();
  user = await t.user();
});
after(() => t.close());

describe('invoice generator security', () => {
  test('a formula typed as a description stays plain text in the Excel file', async () => {
    const payloads = ['=HYPERLINK("http://evil.example","clic")', '+1+1', '-2+3', '@SUM(A1)', '=cmd|\' /C calc\'!A0'];
    const res = await t.request('POST', '/tools/factures/excel', {
      user,
      json: invoice({ lines: payloads.map((description) => ({ description, quantity: '1', unitPrice: '1', vatRate: '0' })), buyer: { name: '=1+1', details: '=2+2' } }),
    });
    assert.equal(res.status, 200);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(res.buffer);
    let formulas = 0;
    const strings = [];
    wb.worksheets[0].eachRow((row) =>
      row.eachCell((cell) => {
        if (cell.type === ExcelJS.ValueType.Formula) formulas += 1;
        if (typeof cell.value === 'string') strings.push(cell.value);
      }),
    );
    assert.equal(formulas, 0);
    for (const p of [...payloads, '=1+1', '=2+2']) assert.ok(strings.includes(p), `${p} kept as text`);
  });

  test('a NUL character, too many lines or oversized texts are refused before any work', async () => {
    assert.equal((await t.request('POST', '/tools/factures/excel', { user, json: invoice({ number: 'F\u00001' }) })).status, 400);
    const many = Array.from({ length: 101 }, () => ({ description: 'X', quantity: '1', unitPrice: '1', vatRate: '0' }));
    assert.equal((await t.request('POST', '/tools/factures/excel', { user, json: invoice({ lines: many }) })).status, 400);
    assert.equal((await t.request('POST', '/tools/factures/calcul', { user, json: invoice({ notes: 'x'.repeat(2001) }) })).status, 400);
    const huge = await t.request('POST', '/tools/factures/calcul', { user, body: JSON.stringify(invoice({ notes: 'x'.repeat(200_000) })), headers: { 'content-type': 'application/json' } });
    assert.equal(huge.status, 413, 'the body size limit applies');
  });

  test('the file name cannot carry header injection or a path', async () => {
    const res = await t.request('POST', '/tools/factures/excel', { user, json: invoice({ number: '../../x"\r\nSet-Cookie: a=b' }) });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-disposition'), /^attachment; filename="facture-[A-Za-z0-9_-]+\.xlsx"$/);
    assert.equal(res.headers.get('set-cookie'), null);
  });
});

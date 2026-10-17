import ExcelJS from 'exceljs';
import { INVOICE_LABELS } from '../constants/invoice.js';
import { computeInvoice } from '../services/invoice.service.js';
import { HttpError } from '../utils/httpError.js';
import { invoiceSchema } from '../validation/invoice.schemas.js';
import { hasNulCharacter } from '../middleware/validate.js';

// Invoice generator (P4-03). Stateless: the invoice is checked and computed from
// what is sent, nothing is stored (no personal data kept, rule 10). The printed
// sheet (browser "save as PDF", like the certificate) and the Excel file both
// use the amounts computed HERE, never figures computed in the browser.

// Validation with the path of every field at fault, so the form can point at
// them (the shared validateBody only says "Invalid input").
function checkedInvoice(body) {
  // Same refusal as every other body (a NUL character would also corrupt the Excel file).
  if (hasNulCharacter(body)) throw new HttpError(400, 'Invalid input: forbidden character');
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, 'Invalid invoice', { fields: [...new Set(parsed.error.issues.map((i) => i.path.join('.') || 'body'))] });
  }
  const { errors, invoice } = computeInvoice(parsed.data);
  if (errors) throw new HttpError(400, 'Invalid invoice', { fields: errors });
  return invoice;
}

export function calculateInvoice(req, res) {
  res.json({ invoice: checkedInvoice(req.body) });
}

const fill = (text, vars) => text.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');

export async function invoiceExcel(req, res) {
  const invoice = checkedInvoice(req.body);
  const L = INVOICE_LABELS[invoice.language];
  const scale = 10 ** invoice.fractionDigits;
  const money = (minor) => minor / scale;
  const moneyFormat = invoice.fractionDigits > 0 ? `#,##0.${'0'.repeat(invoice.fractionDigits)}` : '#,##0';

  const workbook = new ExcelJS.Workbook();
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(L.sheet, { views: [{ rightToLeft: invoice.language === 'ar' }] });
  sheet.columns = [{ width: 46 }, { width: 12 }, { width: 20 }, { width: 12 }, { width: 18 }];

  sheet.addRow([`${L.title} ${invoice.number}`]).font = { bold: true, size: 16 };
  sheet.addRow([L.issueDate, invoice.issueDate]);
  if (invoice.dueDate) sheet.addRow([L.dueDate, invoice.dueDate]);
  sheet.addRow([L.currency, invoice.currency]);
  sheet.addRow([]);
  for (const [label, party] of [
    [L.seller, invoice.seller],
    [L.buyer, invoice.buyer],
  ]) {
    sheet.addRow([label]).font = { bold: true };
    sheet.addRow([party.name]);
    for (const detail of party.details.split('\n').filter((x) => x.trim())) sheet.addRow([detail]);
    sheet.addRow([]);
  }

  const header = sheet.addRow([L.description, L.quantity, L.unitPrice, L.vatRate, L.net]);
  header.font = { bold: true };
  header.eachCell((cell) => {
    cell.border = { bottom: { style: 'thin' } };
  });
  for (const line of invoice.lines) {
    const row = sheet.addRow([line.description, Number(line.quantity), money(line.unitPrice), Number(line.vatRate), money(line.net)]);
    row.getCell(3).numFmt = moneyFormat;
    row.getCell(5).numFmt = moneyFormat;
    row.getCell(1).alignment = { wrapText: true, vertical: 'top' };
  }
  sheet.addRow([]);

  const total = (label, minor, bold = false) => {
    const row = sheet.addRow([label, null, null, null, money(minor)]);
    row.getCell(5).numFmt = moneyFormat;
    if (bold) row.font = { bold: true };
  };
  total(L.net, invoice.totals.net);
  for (const group of invoice.totals.byRate) total(fill(L.vatAt, { rate: group.vatRate }), group.vat);
  total(L.gross, invoice.totals.gross, true);

  if (invoice.notes) {
    sheet.addRow([]);
    sheet.addRow([L.notes]).font = { bold: true };
    for (const note of invoice.notes.split('\n')) sheet.addRow([note]);
  }

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  // ASCII-only file name (header-safe); the invoice number keeps its real form inside.
  const safeNumber = invoice.number.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'facture';
  res.set({
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="facture-${safeNumber}.xlsx"`,
    'Cache-Control': 'no-store',
  });
  res.send(buffer);
}

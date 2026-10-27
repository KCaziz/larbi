import ExcelJS from 'exceljs';
import { prisma } from '../config/prisma.js';
import { buildMonthlyReport, reportRows } from '../services/finReport.service.js';
import { wealthFromAccounts } from './finWealth.controller.js';

// The monthly report (P8-10): the Synthèse page and its download (CSV, XLSX;
// the PDF is the page printed by the browser, which needs no extra library).

const currentMonthKey = (now = new Date()) => now.toISOString().slice(0, 7);

export async function getReport(req, res) {
  res.json({ rapport: await buildMonthlyReport(prisma, req.user, { month: req.query.mois ?? currentMonthKey(), wealthFromAccounts }) });
}

const HEADER = ['Section', 'Indicateur', 'Valeur', 'Unité', 'Formule', 'Version'];

// A text cell is quoted, and one that starts like a formula is prefixed with a
// quote: a spreadsheet would otherwise EXECUTE it. A number stays a number.
function csvCell(value) {
  if (typeof value === 'number') return String(value);
  const text = value === null || value === undefined ? '' : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function exportReport(req, res) {
  const month = req.query.mois ?? currentMonthKey();
  const report = await buildMonthlyReport(prisma, req.user, { month, wealthFromAccounts });
  const rows = reportRows(report);
  const name = `fincludia-rapport-${month}`;
  res.set('Cache-Control', 'private, no-store');

  if (req.query.format === 'xlsx') {
    const book = new ExcelJS.Workbook();
    const sheet = book.addWorksheet(`Rapport ${month}`);
    sheet.addRow([`Rapport mensuel ${month}`, `version ${report.version}`, `généré le ${report.genereLe}`, `montants en centimes (${report.currency})`]);
    sheet.addRow(HEADER);
    for (const row of rows) sheet.addRow(row.map((value) => (typeof value === 'string' && /^[=+\-@]/.test(value) ? `'${value}` : value)));
    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.set('Content-Disposition', `attachment; filename="${name}.xlsx"`);
    res.send(Buffer.from(await book.xlsx.writeBuffer()));
    return;
  }

  const lines = [HEADER.map(csvCell).join(','), ...rows.map((row) => row.map(csvCell).join(','))];
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="${name}.csv"`);
  res.send(`﻿${lines.join('\r\n')}\r\n`);
}

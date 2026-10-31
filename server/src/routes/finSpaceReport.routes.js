import ExcelJS from 'exceljs';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { spaceDashboard } from '../services/finSpaceDashboard.service.js';
import { buildSpaceReport, spaceReportRows } from '../services/finSpaceReport.service.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';

// The report of a space and its export (P9-10). Scoped to one space like every
// route of Gestion commune. The export is a POST with an explicit consent on
// every call, never remembered: the file leaves the application.
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const reportQuery = z.object({ mois: month.optional() }).strict();
const exportBody = z.object({ consent: z.literal(true), mois: month.optional(), format: z.enum(['csv', 'xlsx']).optional() }).strict();

const currentMonth = () => new Date().toISOString().slice(0, 7);
const HEADER = ['Section', 'Indicateur', 'Valeur', 'Unité', 'Formule'];

// A text cell that starts like a formula is prefixed with a quote: a
// spreadsheet would otherwise EXECUTE it (a member name is user input).
function csvCell(value) {
  if (typeof value === 'number') return String(value);
  const text = value === null || value === undefined ? '' : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);

router.get(
  '/espaces/:id/rapport',
  validateQuery(reportQuery),
  asyncRoute(async (req, res) => {
    res.json({ rapport: await buildSpaceReport(prisma, req.user.id, req.params.id, { month: req.query.mois ?? currentMonth() }) });
  }),
);

router.get(
  '/espaces/:id/tableau-de-bord',
  validateQuery(reportQuery),
  asyncRoute(async (req, res) => {
    res.json({ tableau: await spaceDashboard(prisma, req.user.id, req.params.id, { month: req.query.mois ?? currentMonth() }) });
  }),
);

router.post(
  '/espaces/:id/export',
  validateBody(exportBody),
  asyncRoute(async (req, res) => {
    const period = req.body.mois ?? currentMonth();
    const report = await buildSpaceReport(prisma, req.user.id, req.params.id, { month: period });
    const rows = spaceReportRows(report);
    const name = `fincludia-espace-${period}`;
    res.set('Cache-Control', 'private, no-store');
    if (req.body.format === 'xlsx') {
      const book = new ExcelJS.Workbook();
      const sheet = book.addWorksheet(`Espace ${period}`);
      sheet.addRow([`Rapport de l’espace ${report.space.label}`, period, `version ${report.version}`, `montants en centimes (${report.currency})`]);
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
  }),
);

export default router;

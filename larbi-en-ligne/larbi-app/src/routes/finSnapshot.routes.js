import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { getSnapshot, healthHistory, listSnapshots, saveSnapshot } from '../services/finSnapshot.service.js';
import { buildMonthlyReport } from '../services/finReport.service.js';
import { wealthFromAccounts } from '../controllers/finWealth.controller.js';
import { asyncRoute } from '../utils/asyncRoute.js';

// Snapshots (P8-24): the monthly reports the person chose to keep, and the
// history of the financial-health index. Both belong to the person alone.
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const keepSchema = z.object({ mois: month }).strict();
const historyQuery = z.object({ mois: z.coerce.number().int().min(2).max(24).optional() }).strict();

const router = Router();
router.use(requireAuth);

// A month's report, kept as it is now.
router.post(
  '/rapport/instantane',
  validateBody(keepSchema),
  asyncRoute(async (req, res) => {
    const report = await buildMonthlyReport(prisma, req.user, { month: req.body.mois, wealthFromAccounts });
    res.status(201).json({ instantane: await saveSnapshot(prisma, req.user.id, 'report', req.body.mois, report) });
  }),
);
router.get(
  '/rapport/instantanes',
  asyncRoute(async (req, res) => {
    res.json({ instantanes: await listSnapshots(prisma, req.user.id, 'report', { months: 24 }) });
  }),
);
router.get(
  '/rapport/instantane/:mois',
  asyncRoute(async (req, res) => {
    const parsed = month.safeParse(req.params.mois);
    if (!parsed.success) {
      res.status(400).json({ error: { message: 'A month as YYYY-MM' } });
      return;
    }
    const row = await getSnapshot(prisma, req.user.id, 'report', parsed.data);
    res.json({ rapport: row.payload, instantane: { period: row.period, version: row.version, capturedAt: row.capturedAt } });
  }),
);

// The index month by month. A minor has none: the index is not shown to them.
router.get(
  '/sante/historique',
  validateQuery(historyQuery),
  asyncRoute(async (req, res) => {
    // A minor never has a stored point: the index is not computed for them.
    res.json({ points: await healthHistory(prisma, req.user.id, { months: req.query.mois ?? 12 }) });
  }),
);

export default router;

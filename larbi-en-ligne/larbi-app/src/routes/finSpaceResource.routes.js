import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { spaceActivity } from '../services/finSpaceActivity.service.js';
import { INFLOW_KINDS, addSpaceInflow, confirmSpaceInflow, deleteSpaceInflow, proposeContribution, spaceResources } from '../services/finSpaceResource.service.js';
import { describeFormula } from '../services/finance/describe.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { reasonSchema } from '../validation/finData.schemas.js';

// The common pot, the contribution it asks for, and the recent activity of a
// space (P9-09). Scoped to one space: a space the caller is not in answers 404.
const inflowSchema = z
  .object({
    kind: z.enum(INFLOW_KINDS),
    memberId: z.string().uuid().optional(),
    value: z.number().int().min(1).max(1_000_000_000_000),
    occurredAt: z.coerce.date(),
    planned: z.boolean().optional(),
    note: z.string().trim().min(1).max(300).nullable().optional(),
  })
  .strict();
const needQuery = z.object({ besoin: z.coerce.number().int().min(0).max(1_000_000_000_000) }).strict();
const deleteSchema = z.object({ reason: reasonSchema.optional() }).strict();
const activityQuery = z.object({ limite: z.coerce.number().int().min(1).max(30).optional() }).strict();

const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);
router.param('inflowId', uuidParam);

router.get(
  '/espaces/:id/ressources',
  asyncRoute(async (req, res) => {
    res.json({ ressources: await spaceResources(prisma, req.user.id, req.params.id), formulas: ['COL-F08'].map(describeFormula) });
  }),
);
router.post(
  '/espaces/:id/ressources',
  validateBody(inflowSchema),
  asyncRoute(async (req, res) => {
    res.status(201).json({ entree: await addSpaceInflow(prisma, req.user.id, req.params.id, req.body) });
  }),
);
router.post(
  '/espaces/:id/ressources/:inflowId/confirmer',
  asyncRoute(async (req, res) => {
    res.json({ entree: await confirmSpaceInflow(prisma, req.user.id, req.params.id, req.params.inflowId) });
  }),
);
router.delete(
  '/espaces/:id/ressources/:inflowId',
  validateBody(deleteSchema),
  asyncRoute(async (req, res) => {
    res.json(await deleteSpaceInflow(prisma, req.user.id, req.params.id, req.params.inflowId, { reason: req.body?.reason }));
  }),
);
router.get(
  '/espaces/:id/contribution-requise',
  validateQuery(needQuery),
  asyncRoute(async (req, res) => {
    res.json({ contribution: await proposeContribution(prisma, req.user.id, req.params.id, { need: req.query.besoin }) });
  }),
);
router.get(
  '/espaces/:id/activite',
  validateQuery(activityQuery),
  asyncRoute(async (req, res) => {
    res.json(await spaceActivity(prisma, req.user.id, req.params.id, { limit: req.query.limite }));
  }),
);

export default router;

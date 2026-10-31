import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { CALENDAR_TYPES, spaceCalendar } from '../services/finSpaceCalendar.service.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';

// The calendar of a space (P9-07): a read, scoped to one space like every route
// of Gestion commune (404 for a space the caller is not in).
const querySchema = z
  .object({
    mois: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
    // `types=bills,tasks`: absent means everything.
    types: z
      .string()
      .transform((value) => value.split(',').filter(Boolean))
      .refine((list) => list.length > 0 && list.every((type) => CALENDAR_TYPES.includes(type)), 'Unknown calendar type')
      .optional(),
  })
  .strict();

const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);

router.get(
  '/espaces/:id/calendrier',
  validateQuery(querySchema),
  asyncRoute(async (req, res) => {
    const calendar = await spaceCalendar(prisma, req.user.id, req.params.id, { month: req.query.mois ?? new Date().toISOString().slice(0, 7), types: req.query.types });
    res.json({ calendrier: calendar });
  }),
);

export default router;

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { COLLECTIVE_CATEGORIES } from '../constants/finCollectiveCategories.js';
import { referenceOfCollective } from '../constants/finCollectiveCategoryMap.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { deleteSpaceBudget, setSpaceBudget, spaceBudgetsView } from '../services/finSpaceBudget.service.js';
import { describeFormula } from '../services/finance/describe.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';

// Common budgets (P9-05). Scoped to one space like every route of Gestion
// commune: a space the caller is not in answers 404.
const period = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const querySchema = z.object({ mois: period.optional() }).strict();
const bodySchema = z.object({ category: z.string().regex(/^COLC-\d{2}$/), period, value: z.number().int().min(0).max(1_000_000_000_000) }).strict();

const currentMonth = () => new Date().toISOString().slice(0, 7);

const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);
router.param('budgetId', uuidParam);

router.get('/espaces/references-budgets', (req, res) => {
  res.json({ categories: COLLECTIVE_CATEGORIES.map((category) => ({ ...category, referenceKey: referenceOfCollective(category.key) })), formulas: ['COL-F06', 'COL-F07', 'ALG-C02'].map(describeFormula) });
});
router.get(
  '/espaces/:id/budgets',
  validateQuery(querySchema),
  asyncRoute(async (req, res) => {
    res.json({ budgets: await spaceBudgetsView(prisma, req.user.id, req.params.id, req.query.mois ?? currentMonth()) });
  }),
);
router.put(
  '/espaces/:id/budgets',
  validateBody(bodySchema),
  asyncRoute(async (req, res) => {
    res.json({ budget: await setSpaceBudget(prisma, req.user.id, req.params.id, req.body) });
  }),
);
router.delete(
  '/espaces/:id/budgets/:budgetId',
  asyncRoute(async (req, res) => {
    res.json(await deleteSpaceBudget(prisma, req.user.id, req.params.id, req.params.budgetId));
  }),
);

export default router;

import { Router } from 'express';
import {
  getBudget,
  getBudgetHistory,
  getBudgetProposal,
  getBudgetReferences,
  getBudgets,
  getEnvelopeHistory,
  patchBudget,
  patchEnvelope,
  postBudget,
  postBudgetDuplicate,
  postEnvelope,
  putBudgetArchived,
  removeBudget,
  removeEnvelope,
  getBudgetMethod,
} from '../controllers/finBudget.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { archiveSchema, deleteSchema } from '../validation/finMoney.schemas.js';
import {
  budgetViewQuerySchema,
  methodQuerySchema,
  createBudgetSchema,
  createEnvelopeSchema,
  duplicateBudgetSchema,
  proposalQuerySchema,
  updateBudgetSchema,
  updateEnvelopeSchema,
} from '../validation/finBudget.schemas.js';

// Budgets and envelopes (P6-05), screens C06 / JA03 / JA04. Every route needs a
// session and only ever touches the caller's own rows: a budget is private
// data, and no administrator has a screen onto it.
const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);
router.param('envelopeId', uuidParam);

router.get('/budgets/references', getBudgetReferences);
// Declared BEFORE `/:id` so "references" and "proposition" are never read as
// identifiers.
router.get('/budgets/proposition', validateQuery(proposalQuerySchema), asyncRoute(getBudgetProposal));

router.get('/budgets', asyncRoute(getBudgets));
router.post('/budgets', validateBody(createBudgetSchema), asyncRoute(postBudget));
router.get('/budgets/:id', validateQuery(budgetViewQuerySchema), asyncRoute(getBudget));
// The optional methods (P8-09): an analysis, never a rule.
router.get('/budgets/:id/methode', validateQuery(methodQuerySchema), asyncRoute(getBudgetMethod));
router.patch('/budgets/:id', validateBody(updateBudgetSchema), asyncRoute(patchBudget));
router.put('/budgets/:id/archive', validateBody(archiveSchema), asyncRoute(putBudgetArchived));
router.delete('/budgets/:id', validateBody(deleteSchema), asyncRoute(removeBudget));
router.post('/budgets/:id/dupliquer', validateBody(duplicateBudgetSchema), asyncRoute(postBudgetDuplicate));
router.get('/budgets/:id/historique', asyncRoute(getBudgetHistory));

router.post('/budgets/:id/enveloppes', validateBody(createEnvelopeSchema), asyncRoute(postEnvelope));
router.patch('/budgets/:id/enveloppes/:envelopeId', validateBody(updateEnvelopeSchema), asyncRoute(patchEnvelope));
router.delete('/budgets/:id/enveloppes/:envelopeId', validateBody(deleteSchema), asyncRoute(removeEnvelope));
router.get('/budgets/:id/enveloppes/:envelopeId/historique', asyncRoute(getEnvelopeHistory));

export default router;

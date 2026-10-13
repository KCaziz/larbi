import { Router } from 'express';
import {
  getDebt,
  getDebtHistory,
  getDebtReferences,
  getDebts,
  getPayoffComparison,
  patchDebt,
  postDebt,
  postDebtPayment,
  putDebtArchived,
  removeDebt,
} from '../controllers/finDebt.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { archiveSchema, deleteSchema } from '../validation/finMoney.schemas.js';
import { createDebtPaymentSchema, createDebtSchema, payoffQuerySchema, updateDebtSchema } from '../validation/finDebt.schemas.js';

// Debts (P6-10), screens C13-C14. Private data, no admin side.
const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);

router.get('/debts/references', getDebtReferences);
// Declared BEFORE `/:id` so "comparaison" is never read as an identifier.
router.get('/debts/comparaison', validateQuery(payoffQuerySchema), asyncRoute(getPayoffComparison));

router.get('/debts', asyncRoute(getDebts));
router.post('/debts', validateBody(createDebtSchema), asyncRoute(postDebt));
router.get('/debts/:id', asyncRoute(getDebt));
router.patch('/debts/:id', validateBody(updateDebtSchema), asyncRoute(patchDebt));
router.put('/debts/:id/archive', validateBody(archiveSchema), asyncRoute(putDebtArchived));
router.delete('/debts/:id', validateBody(deleteSchema), asyncRoute(removeDebt));
router.get('/debts/:id/historique', asyncRoute(getDebtHistory));
router.post('/debts/:id/paiements', validateBody(createDebtPaymentSchema), asyncRoute(postDebtPayment));

export default router;

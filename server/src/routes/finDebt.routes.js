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
  postSimpleLoan,
} from '../controllers/finDebt.controller.js';
import { requireAdult, requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { archiveSchema, deleteSchema } from '../validation/finMoney.schemas.js';
import { createDebtPaymentSchema, createDebtSchema, payoffQuerySchema, simpleLoanSchema, updateDebtSchema } from '../validation/finDebt.schemas.js';

// Debts (P6-10), screens C13-C14. Private data, no admin side.
const router = Router();
router.use(requireAuth);
// Reserved to 18+ (P6-17, the client's rule: a lycéen is never shown a debt, a
// real patrimony or a credit offer). Refused SERVER-SIDE and not merely hidden
// in the navigation — `requireAdult` existed and guarded nothing until this
// task, which meant a minor could reach this through the API directly.
//
// Bound to THIS router's own path(s), never `router.use(requireAdult)`: every
// financial router is mounted on the same `/fin` prefix, so a pathless `use`
// would guard every route declared after it — reserve, calendar, notifications,
// the home screen — and lock a minor out of their own money. That mistake was
// made here first and caught by the journey route answering 403.
router.use('/debts', requireAdult);
router.param('id', uuidParam);

router.get('/debts/references', getDebtReferences);
// Declared BEFORE `/:id` so "comparaison" is never read as an identifier.
router.get('/debts/comparaison', validateQuery(payoffQuerySchema), asyncRoute(getPayoffComparison));

router.get('/debts', asyncRoute(getDebts));
router.post('/debts', validateBody(createDebtSchema), asyncRoute(postDebt));
// « J'ai prêté » / « On m'a prêté » (P8-13): the loan and its real movement.
router.post('/debts/pret', validateBody(simpleLoanSchema), asyncRoute(postSimpleLoan));
router.get('/debts/:id', asyncRoute(getDebt));
router.patch('/debts/:id', validateBody(updateDebtSchema), asyncRoute(patchDebt));
router.put('/debts/:id/archive', validateBody(archiveSchema), asyncRoute(putDebtArchived));
router.delete('/debts/:id', validateBody(deleteSchema), asyncRoute(removeDebt));
router.get('/debts/:id/historique', asyncRoute(getDebtHistory));
router.post('/debts/:id/paiements', validateBody(createDebtPaymentSchema), asyncRoute(postDebtPayment));

export default router;

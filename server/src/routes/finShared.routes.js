import { Router } from 'express';
import {
  deleteSharedReceipt,
  getSharedReceipt,
  getSubCategories,
  postSharedReceipt,
  cancelExpense,
  confirmExpense,
  getBalances,
  getSettlementHistory,
  getSettlements,
  getSharedExpenseHistory,
  getSharedExpenses,
  getSharedRecurrences,
  getSharedReferences,
  linkExpense,
  unlinkExpense,
  postConfirmRecurrence,
  postSettlement,
  postSharedExpense,
  removeSettlement,
  removeSharedExpense,
} from '../controllers/finShared.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { receiveFile } from '../middleware/upload.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { createSettlementSchema, createSharedExpenseSchema, deleteSharedSchema, linkPersonalSchema, sharedListQuerySchema } from '../validation/finShared.schemas.js';

// Shared expenses and settlements (P6-14), screens P02 / P03. Every route is
// scoped to one space, and membership is checked by P6-13's own helpers: a
// space the caller is not in answers 404, never 403.
const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);
router.param('expenseId', uuidParam);
router.param('settlementId', uuidParam);

router.get('/espaces/references-partage', getSharedReferences);

router.get('/espaces/:id/depenses', validateQuery(sharedListQuerySchema), asyncRoute(getSharedExpenses));
router.post('/espaces/:id/depenses', validateBody(createSharedExpenseSchema), asyncRoute(postSharedExpense));
// Declared before the bare `/depenses` is used for anything else: a
// candidate is read-only, confirming one writes through the same rules as a
// normal shared expense, plus the dedup check.
router.get('/espaces/:id/depenses-recurrentes', asyncRoute(getSharedRecurrences));
router.post('/espaces/:id/depenses-recurrentes/confirmer', validateBody(createSharedExpenseSchema), asyncRoute(postConfirmRecurrence));
router.delete('/espaces/:id/depenses/:expenseId', validateBody(deleteSharedSchema), asyncRoute(removeSharedExpense));
router.post('/espaces/:id/depenses/:expenseId/annuler', validateBody(deleteSharedSchema), asyncRoute(cancelExpense));
router.post('/espaces/:id/depenses/:expenseId/confirmer', asyncRoute(confirmExpense));
// The receipt: private storage, the members of the space only (P9-14).
router.post('/espaces/:id/depenses/:expenseId/justificatif', receiveFile, asyncRoute(postSharedReceipt));
router.get('/espaces/:id/depenses/:expenseId/justificatif', asyncRoute(getSharedReceipt));
router.delete('/espaces/:id/depenses/:expenseId/justificatif', asyncRoute(deleteSharedReceipt));
router.get('/espaces/:id/sous-categories', asyncRoute(getSubCategories));
router.put('/espaces/:id/depenses/:expenseId/lien-personnel', validateBody(linkPersonalSchema), asyncRoute(linkExpense));
router.delete('/espaces/:id/depenses/:expenseId/lien-personnel', asyncRoute(unlinkExpense));
router.get('/espaces/:id/depenses/:expenseId/historique', asyncRoute(getSharedExpenseHistory));

router.get('/espaces/:id/reglements', validateQuery(sharedListQuerySchema), asyncRoute(getSettlements));
router.post('/espaces/:id/reglements', validateBody(createSettlementSchema), asyncRoute(postSettlement));
router.delete('/espaces/:id/reglements/:settlementId', validateBody(deleteSharedSchema), asyncRoute(removeSettlement));
router.get('/espaces/:id/reglements/:settlementId/historique', asyncRoute(getSettlementHistory));

router.get('/espaces/:id/soldes', asyncRoute(getBalances));

export default router;

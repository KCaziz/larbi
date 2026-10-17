import { Router } from 'express';
import {
  exportTransactions,
  getIncomeHistory,
  getIncomes,
  getMoneyReferences,
  getReceipt,
  getSynthesis,
  getTransactionHistory,
  getTransactions,
  patchIncome,
  patchTransaction,
  postIncome,
  postReceipt,
  postTransaction,
  putIncomeArchived,
  removeIncome,
  removeReceipt,
  removeTransaction,
} from '../controllers/finMoney.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { receiveFile } from '../middleware/upload.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import {
  archiveSchema,
  createIncomeSchema,
  createTransactionSchema,
  deleteSchema,
  historyQuerySchema,
  synthesisQuerySchema,
  updateIncomeSchema,
  updateTransactionSchema,
} from '../validation/finMoney.schemas.js';

// "Mon argent" (P6-04), screens C05 (synthèse), C07 (saisie) and C08
// (historique). Every route needs a session and only ever touches the caller's
// own rows: financial data is private by default, and no administrator has a
// screen onto it.
const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);

router.get('/argent/references', getMoneyReferences);
router.get('/argent/synthese', validateQuery(synthesisQuerySchema), asyncRoute(getSynthesis));

// Recurring resources.
router.get('/revenus', asyncRoute(getIncomes));
router.post('/revenus', validateBody(createIncomeSchema), asyncRoute(postIncome));
router.patch('/revenus/:id', validateBody(updateIncomeSchema), asyncRoute(patchIncome));
router.put('/revenus/:id/archive', validateBody(archiveSchema), asyncRoute(putIncomeArchived));
router.delete('/revenus/:id', validateBody(deleteSchema), asyncRoute(removeIncome));
router.get('/revenus/:id/historique', asyncRoute(getIncomeHistory));

// Dated movements. The export is declared BEFORE `/:id` so "export" is never
// read as an identifier.
router.get('/transactions/export', validateQuery(historyQuerySchema), asyncRoute(exportTransactions));
router.get('/transactions', validateQuery(historyQuerySchema), asyncRoute(getTransactions));
router.post('/transactions', validateBody(createTransactionSchema), asyncRoute(postTransaction));
router.patch('/transactions/:id', validateBody(updateTransactionSchema), asyncRoute(patchTransaction));
router.delete('/transactions/:id', validateBody(deleteSchema), asyncRoute(removeTransaction));
router.get('/transactions/:id/historique', asyncRoute(getTransactionHistory));

// Receipts: private storage, served only to the owner, never a public URL.
router.post('/transactions/:id/justificatif', receiveFile, asyncRoute(postReceipt));
router.get('/transactions/:id/justificatif', asyncRoute(getReceipt));
router.delete('/transactions/:id/justificatif', asyncRoute(removeReceipt));

export default router;

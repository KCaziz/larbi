import { Router } from 'express';
import { getAccountHistory, getAccounts, patchAccount, postAccount, postTransfer, putAccountArchived, removeTransfer } from '../controllers/finAccount.controller.js';
import { getHome } from '../controllers/finHome.controller.js';
import { exportReport, getReport } from '../controllers/finReport.controller.js';
import { reportExportQuerySchema, reportQuerySchema } from '../validation/finAccount.schemas.js';
import { requireAuth } from '../middleware/auth.js';
import { synthesisQuerySchema } from '../validation/finMoney.schemas.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import {
  accountsQuerySchema,
  archiveAccountSchema,
  balanceHistoryQuerySchema,
  createAccountSchema,
  createTransferSchema,
  deleteTransferSchema,
  updateAccountSchema,
} from '../validation/finAccount.schemas.js';

// Accounts (« Mes comptes », P8-03 / P8-05) and transfers between them.
const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);
router.param('transferId', uuidParam);

// The Accueil of the application (P8-06): one screen, one request.
router.get('/accueil', validateQuery(synthesisQuerySchema), asyncRoute(getHome));
// The Synthèse and its monthly report (P8-10).
router.get('/rapport', validateQuery(reportQuerySchema), asyncRoute(getReport));
router.get('/rapport/export', validateQuery(reportExportQuerySchema), asyncRoute(exportReport));
router.get('/comptes', validateQuery(accountsQuerySchema), asyncRoute(getAccounts));
router.post('/comptes', validateBody(createAccountSchema), asyncRoute(postAccount));
router.get('/comptes/:id/historique', validateQuery(balanceHistoryQuerySchema), asyncRoute(getAccountHistory));
router.patch('/comptes/:id', validateBody(updateAccountSchema), asyncRoute(patchAccount));
router.put('/comptes/:id/archive', validateBody(archiveAccountSchema), asyncRoute(putAccountArchived));

router.post('/transferts', validateBody(createTransferSchema), asyncRoute(postTransfer));
router.delete('/transferts/:transferId', validateBody(deleteTransferSchema), asyncRoute(removeTransfer));

export default router;

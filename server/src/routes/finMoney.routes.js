import { Router } from 'express';
import {
  exportTransactions,
  getClearing,
  getTags,
  patchTag,
  postDuplicateCheck,
  postTag,
  putClearing,
  removeTag,
  getIncomeHistory,
  getIncomes,
  getMoneyReferences,
  getMoneySynthesisHistory,
  getReceipt,
  getSynthesis,
  getOneTransaction,
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
import { getPayrollReference, getPayslips, postDecodePayslip, postPayslip, removePayslip } from '../controllers/finPayroll.controller.js';
import { decodePayslipSchema, keepPayslipSchema } from '../validation/finPayroll.schemas.js';
import { getToolFavorites, getToolsCatalogue, putToolFavorite, removeToolFavorite } from '../controllers/finTools.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { receiveFile } from '../middleware/upload.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import {
  archiveSchema,
  clearingQuerySchema,
  clearingSchema,
  createTagSchema,
  duplicateCheckSchema,
  updateTagSchema,
  createIncomeSchema,
  createTransactionSchema,
  deleteSchema,
  historyQuerySchema,
  moneyHistoryQuerySchema,
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
// Revenus vs dépenses, plusieurs mois (P6-23). Pas de paramètre `from`/`to` :
// c'est toujours une fenêtre glissante se terminant au mois courant.
router.get('/argent/synthese/historique', validateQuery(moneyHistoryQuerySchema), asyncRoute(getMoneySynthesisHistory));

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
router.post('/transactions/doublons', validateBody(duplicateCheckSchema), asyncRoute(postDuplicateCheck));
router.put('/transactions/:id/pointage', validateBody(clearingSchema), asyncRoute(putClearing));
router.get('/pointage', validateQuery(clearingQuerySchema), asyncRoute(getClearing));
router.get('/etiquettes', asyncRoute(getTags));
router.post('/etiquettes', validateBody(createTagSchema), asyncRoute(postTag));
router.patch('/etiquettes/:id', validateBody(updateTagSchema), asyncRoute(patchTag));
router.delete('/etiquettes/:id', validateBody(deleteSchema), asyncRoute(removeTag));
router.get('/transactions/:id', asyncRoute(getOneTransaction));
router.patch('/transactions/:id', validateBody(updateTransactionSchema), asyncRoute(patchTransaction));
router.delete('/transactions/:id', validateBody(deleteSchema), asyncRoute(removeTransaction));
router.get('/transactions/:id/historique', asyncRoute(getTransactionHistory));

// Receipts: private storage, served only to the owner, never a public URL.
router.post('/transactions/:id/justificatif', receiveFile, asyncRoute(postReceipt));
router.get('/transactions/:id/justificatif', asyncRoute(getReceipt));
router.delete('/transactions/:id/justificatif', asyncRoute(removeReceipt));

// Le catalogue unique des Outils (P8-15).
router.get('/outils/catalogue', getToolsCatalogue);
// Its favourites (OUT-01), the person's own.
router.get('/outils/favoris', asyncRoute(getToolFavorites));
router.put('/outils/favoris/:code', asyncRoute(putToolFavorite));
router.delete('/outils/favoris/:code', asyncRoute(removeToolFavorite));

// Décodeur de fiche de paie (P4-14, écran C15). Le calcul seul ne lit ni
// écrit en base ; une fiche n'est conservée que si la personne le demande,
// avec son consentement (historique, P8-15). L'ajout au revenu mensuel passe
// par les routes de revenus ci-dessus, après confirmation explicite.
router.get('/paie/reference', getPayrollReference);
router.post('/paie/decoder', validateBody(decodePayslipSchema), asyncRoute(postDecodePayslip));
// The history (P8-15, the client's answer D5): kept only with the person's
// consent, read and deleted by them only.
router.get('/paie/fiches', asyncRoute(getPayslips));
router.post('/paie/fiches', validateBody(keepPayslipSchema), asyncRoute(postPayslip));
router.delete('/paie/fiches/:id', asyncRoute(removePayslip));

export default router;

import { Router } from 'express';
import {
  deleteMandate,
  deleteMember,
  getBusiness,
  getContacts,
  getDashboard,
  getDocuments,
  getJournal,
  getMembers,
  getOrganizations,
  getReferences,
  postBusiness,
  deleteDocument,
  getBudgets,
  getCashPlan,
  getCashPositions,
  getStock,
  postCashPosition,
  postItem,
  postStockMove,
  putBudget,
  getExport,
  getReminders,
  postContact,
  postCreditNote,
  postDocument,
  postDocumentStep,
  postReminder,
  putDocument,
  postInvitationAnswer,
  postMandate,
  postMember,
  postPayment,
  putBusiness,
  putMember,
} from '../controllers/finBusiness.controller.js';
import { idempotent } from '../middleware/idempotency.js';
import { requireAdult, requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import {
  contactQuerySchema,
  createBusinessSchema,
  budgetQuerySchema,
  cashPlanQuerySchema,
  createCashPositionSchema,
  createItemSchema,
  createStockMoveSchema,
  setBudgetSchema,
  createContactSchema,
  createCreditNoteSchema,
  createDocumentSchema,
  createReminderSchema,
  issueDocumentSchema,
  updateDocumentSchema,
  createPaymentSchema,
  dashboardQuerySchema,
  documentQuerySchema,
  grantMandateSchema,
  inviteMemberSchema,
  updateBusinessSchema,
  updateMemberSchema,
} from '../validation/finBusiness.schemas.js';

// Espace entreprise (P7-02).
//
// Réservé aux majeurs, et la garde est LIÉE À SON CHEMIN. Un
// `router.use(requireAdult)` sans chemin s'appliquerait à toutes les routes
// `/fin/*` déclarées après celle-ci, puisqu'elles partagent le même préfixe :
// c'est le défaut qui avait enfermé les mineurs hors de leur propre argent en
// P6-17, et il ne sera pas réintroduit ici.
//
// Pourquoi 18+ : exercer une activité commerciale, émettre des factures et
// porter des dettes fournisseurs ne sont pas des gestes de mineur. La règle
// est du même ordre que celle qui réserve les dettes personnelles.
const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);
router.use('/entreprise', requireAdult);

// P13-05 (DEC-005): every creation accepts an Idempotency-Key.
const once = asyncRoute(idempotent());

router.get('/entreprise/references', getReferences);
router.get('/entreprise', asyncRoute(getBusiness));
router.post('/entreprise', validateBody(createBusinessSchema), once, asyncRoute(postBusiness));
router.put('/entreprise', validateBody(updateBusinessSchema), asyncRoute(putBusiness));

// P13-05, lot A: the organisations of the person, and their invitations.
router.get('/entreprise/organisations', asyncRoute(getOrganizations));
router.post('/entreprise/invitations/:id/:answer(accepter|refuser)', asyncRoute(postInvitationAnswer));

// Members and roles, mandates, journal — of the organisation of the request.
router.get('/entreprise/membres', asyncRoute(getMembers));
router.post('/entreprise/membres', validateBody(inviteMemberSchema), once, asyncRoute(postMember));
router.put('/entreprise/membres/:id', validateBody(updateMemberSchema), asyncRoute(putMember));
router.delete('/entreprise/membres/:id', asyncRoute(deleteMember));
router.post('/entreprise/mandats', validateBody(grantMandateSchema), once, asyncRoute(postMandate));
router.delete('/entreprise/mandats/:id', asyncRoute(deleteMandate));
router.get('/entreprise/journal', asyncRoute(getJournal));

router.get('/entreprise/tiers', validateQuery(contactQuerySchema), asyncRoute(getContacts));
router.post('/entreprise/tiers', validateBody(createContactSchema), once, asyncRoute(postContact));

router.get('/entreprise/documents', validateQuery(documentQuerySchema), asyncRoute(getDocuments));
router.post('/entreprise/documents', validateBody(createDocumentSchema), once, asyncRoute(postDocument));
router.post('/entreprise/documents/:id/reglements', validateBody(createPaymentSchema), once, asyncRoute(postPayment));

// P13-05, lot B (19_CYCLE_FACTURE): quote → invoice → payment / credit note.
router.get('/entreprise/documents/export', validateQuery(dashboardQuerySchema), asyncRoute(getExport));
router.put('/entreprise/documents/:id', validateBody(updateDocumentSchema), asyncRoute(putDocument));
router.delete('/entreprise/documents/:id', asyncRoute(deleteDocument));
router.post('/entreprise/documents/:id/avoirs', validateBody(createCreditNoteSchema), once, asyncRoute(postCreditNote));
router.get('/entreprise/documents/:id/relances', asyncRoute(getReminders));
router.post('/entreprise/documents/:id/relances', validateBody(createReminderSchema), once, asyncRoute(postReminder));
router.post('/entreprise/documents/:id/:step(envoyer|accepter|refuser|facturer|emettre)', validateBody(issueDocumentSchema), once, asyncRoute(postDocumentStep));

// P13-05, lot C: stock by lot (CNV-16), budgets, the 13-week cash plan.
router.get('/entreprise/stock', asyncRoute(getStock));
router.post('/entreprise/stock/articles', validateBody(createItemSchema), once, asyncRoute(postItem));
router.post('/entreprise/stock/mouvements', validateBody(createStockMoveSchema), once, asyncRoute(postStockMove));
router.get('/entreprise/budgets', validateQuery(budgetQuerySchema), asyncRoute(getBudgets));
router.put('/entreprise/budgets', validateBody(setBudgetSchema), asyncRoute(putBudget));
router.get('/entreprise/tresorerie', validateQuery(cashPlanQuerySchema), asyncRoute(getCashPlan));
router.get('/entreprise/tresorerie/soldes', asyncRoute(getCashPositions));
router.post('/entreprise/tresorerie/soldes', validateBody(createCashPositionSchema), once, asyncRoute(postCashPosition));

router.get('/entreprise/tableau-de-bord', validateQuery(dashboardQuerySchema), asyncRoute(getDashboard));

export default router;

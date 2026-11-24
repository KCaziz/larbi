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
  deleteProjectShare,
  deletePartnerRequest,
  getCampaigns,
  getEmployees,
  getForumThread,
  getForumThreads,
  getPartnerOffers,
  getPartnerRequests,
  postAbsence,
  postAbsenceStep,
  postCampaign,
  postCommitment,
  postCommitmentStep,
  postEmployee,
  postForumReply,
  postForumReport,
  postForumThread,
  postPartnerRequest,
  putCampaign,
  putEmployee,
  getSearch,
  getSimulators,
  postCopilot,
  postSimulation,
  getPatrimony,
  getProjects,
  postExpense,
  postExpenseStep,
  postHolding,
  postHoldingValue,
  postMilestone,
  postMilestoneStep,
  postProject,
  postProjectShare,
  putProject,
  getOperations,
  getOperationScenario,
  getTradeReferences,
  postOperation,
  postOperationCost,
  postOperationReception,
  putOperation,
  putOperationPiece,
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
  getPayroll,
  postPayslipSimulation,
  putPayrollConditions,
  putPayrollAccess,
  getAnnualStatement,
  getMyPayslips,
  getStaff,
  postTimesheet,
  postTimesheetStep,
  postSkill,
  deleteSkill,
  postTraining,
  putTraining,
  postVacancy,
  putVacancy,
  postCandidate,
  putCandidate,
  deleteCandidate,
  getAssets,
  postAsset,
  putAsset,
  postDepreciation,
  postYearClose,
  getBank,
  postBankStatement,
  postBankAutoMatch,
  putBankLine,
  postPayrollRun,
  getPayrollRun,
  deletePayrollRun,
  putPayslip,
  postPayrollStep,
  getLedger,
  getLedgerEntries,
  getLedgerAccount,
  postLedgerEntry,
  putLedgerEntry,
  deleteLedgerEntry,
  postLedgerEntryStep,
  postLedgerProposals,
  postLedgerImport,
  postLedgerAccount,
  postLedgerChart,
  putLedgerMapping,
  postLedgerPeriod,
  postLedgerBankCheck,
} from '../controllers/finBusiness.controller.js';
import { idempotent } from '../middleware/idempotency.js';
import { requireAdult, requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import {
  contactQuerySchema,
  createBusinessSchema,
  absenceSchema,
  campaignSchema,
  commitmentSchema,
  employeeSchema,
  forumReplySchema,
  forumReportSchema,
  forumThreadSchema,
  forumQuerySchema,
  hrQuerySchema,
  offerQuerySchema,
  partnerRequestSchema,
  updateCampaignSchema,
  updateEmployeeSchema,
  copilotSchema,
  searchQuerySchema,
  simulationSchema,
  createExpenseSchema,
  createHoldingSchema,
  createMilestoneSchema,
  createProjectSchema,
  holdingValueSchema,
  projectShareSchema,
  stepBodySchema,
  updateProjectSchema,
  createOperationSchema,
  operationCostSchema,
  operationPieceSchema,
  operationReceptionSchema,
  operationScenarioSchema,
  updateOperationSchema,
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
  payslipSchema,
  payrollConditionsSchema,
  payrollAccessSchema,
  yearQuerySchema,
  staffQuerySchema,
  timesheetSchema,
  skillSchema,
  trainingSchema,
  trainingStatusSchema,
  vacancySchema,
  vacancyStatusSchema,
  candidateSchema,
  candidateStageSchema,
  assetSchema,
  assetDisposalSchema,
  bankQuerySchema,
  bankStatementSchema,
  bankMatchSchema,
  payslipUpdateSchema,
  payrollRunSchema,
  ledgerQuerySchema,
  ledgerEntrySchema,
  ledgerEntryUpdateSchema,
  ledgerImportSchema,
  ledgerAccountSchema,
  ledgerChartSchema,
  ledgerMappingSchema,
  ledgerPeriodSchema,
  ledgerBankCheckSchema,
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
router.param('sub', uuidParam);
router.use('/entreprise', requireAdult);
// P13-05, lot G: the forum of the professionals, adults only like the business space.
router.use('/forum', requireAdult);

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

// P13-05, lot D: micro-import and international trade (ECR-0350 to ECR-0371).
router.get('/entreprise/commerce/references', asyncRoute(getTradeReferences));
router.get('/entreprise/operations', asyncRoute(getOperations));
router.post('/entreprise/operations', validateBody(createOperationSchema), once, asyncRoute(postOperation));
router.put('/entreprise/operations/:id', validateBody(updateOperationSchema), asyncRoute(putOperation));
router.post('/entreprise/operations/:id/couts', validateBody(operationCostSchema), once, asyncRoute(postOperationCost));
router.put('/entreprise/operations/:id/pieces', validateBody(operationPieceSchema), asyncRoute(putOperationPiece));
router.post('/entreprise/operations/:id/reception', validateBody(operationReceptionSchema), once, asyncRoute(postOperationReception));
router.get('/entreprise/operations/:id/scenario', validateQuery(operationScenarioSchema), asyncRoute(getOperationScenario));

// P13-05, lot E: the diaspora — projects followed from abroad, the patrimony.
router.get('/entreprise/projets', asyncRoute(getProjects));
router.post('/entreprise/projets', validateBody(createProjectSchema), once, asyncRoute(postProject));
router.put('/entreprise/projets/:id', validateBody(updateProjectSchema), asyncRoute(putProject));
router.post('/entreprise/projets/:id/jalons', validateBody(createMilestoneSchema), once, asyncRoute(postMilestone));
router.post('/entreprise/projets/:id/jalons/:sub/:step(declarer|accepter|refuser)', validateBody(stepBodySchema), once, asyncRoute(postMilestoneStep));
router.post('/entreprise/projets/:id/depenses', validateBody(createExpenseSchema), once, asyncRoute(postExpense));
router.post('/entreprise/projets/:id/depenses/:sub/:step(justifier|valider|refuser|payer)', validateBody(stepBodySchema), once, asyncRoute(postExpenseStep));
router.post('/entreprise/projets/:id/partages', validateBody(projectShareSchema), once, asyncRoute(postProjectShare));
router.delete('/entreprise/projets/:id/partages/:sub', asyncRoute(deleteProjectShare));
router.get('/entreprise/patrimoine', asyncRoute(getPatrimony));
router.post('/entreprise/patrimoine', validateBody(createHoldingSchema), once, asyncRoute(postHolding));
router.post('/entreprise/patrimoine/:id/valeurs', validateBody(holdingValueSchema), once, asyncRoute(postHoldingValue));

// P13-05, lot F: simulators and comparators, universal search, copilot.
router.get('/entreprise/simulateurs', asyncRoute(getSimulators));
router.post('/entreprise/simulateurs/:code', validateBody(simulationSchema), asyncRoute(postSimulation));
router.get('/entreprise/recherche', validateQuery(searchQuerySchema), asyncRoute(getSearch));
router.post('/entreprise/copilote', validateBody(copilotSchema), asyncRoute(postCopilot));

// P13-05, lot G: partners, human resources (no payroll), crowdfunding preparation.
router.get('/entreprise/partenaires', validateQuery(offerQuerySchema), asyncRoute(getPartnerOffers));
router.get('/entreprise/partenaires/demandes', asyncRoute(getPartnerRequests));
router.post('/entreprise/partenaires/demandes', validateBody(partnerRequestSchema), once, asyncRoute(postPartnerRequest));
router.delete('/entreprise/partenaires/demandes/:id', asyncRoute(deletePartnerRequest));
router.get('/entreprise/personnel', validateQuery(hrQuerySchema), asyncRoute(getEmployees));
router.post('/entreprise/personnel', validateBody(employeeSchema), once, asyncRoute(postEmployee));
router.put('/entreprise/personnel/:id', validateBody(updateEmployeeSchema), asyncRoute(putEmployee));
router.post('/entreprise/personnel/:id/absences', validateBody(absenceSchema), once, asyncRoute(postAbsence));
router.post('/entreprise/personnel/:id/absences/:sub/:step(approuver|refuser|annuler)', asyncRoute(postAbsenceStep));
router.get('/entreprise/campagnes', asyncRoute(getCampaigns));
router.post('/entreprise/campagnes', validateBody(campaignSchema), once, asyncRoute(postCampaign));
router.put('/entreprise/campagnes/:id', validateBody(updateCampaignSchema), asyncRoute(putCampaign));
router.post('/entreprise/campagnes/:id/engagements', validateBody(commitmentSchema), once, asyncRoute(postCommitment));
router.post('/entreprise/campagnes/:id/engagements/:sub/:step(confirmer|annuler)', asyncRoute(postCommitmentStep));
// Lot G, second part: payroll (ECR-0265 to 0271) and accounting (ECR-0108, 0243 to 0250, 0330).
router.get('/entreprise/paie', asyncRoute(getPayroll));
router.put('/entreprise/paie/salaries/:id', validateBody(payrollConditionsSchema), asyncRoute(putPayrollConditions));
// Lot H: the employee's access to their payslips, the annual statement of salaries.
router.put('/entreprise/paie/salaries/:id/acces', validateBody(payrollAccessSchema), asyncRoute(putPayrollAccess));
router.get('/entreprise/paie/declaration-annuelle', validateQuery(yearQuerySchema), asyncRoute(getAnnualStatement));
router.get('/mes-bulletins', asyncRoute(getMyPayslips));
// Lot H: timesheets, skills, training plan, recruitment (ECR-0274 to 0277).
router.get('/entreprise/rh', validateQuery(staffQuerySchema), asyncRoute(getStaff));
router.post('/entreprise/rh/salaries/:id/temps', validateBody(timesheetSchema), asyncRoute(postTimesheet));
router.post('/entreprise/rh/salaries/:id/temps/:sub/:step(approuver|refuser)', asyncRoute(postTimesheetStep));
router.post('/entreprise/rh/salaries/:id/competences', validateBody(skillSchema), asyncRoute(postSkill));
router.delete('/entreprise/rh/salaries/:id/competences/:sub', asyncRoute(deleteSkill));
router.post('/entreprise/rh/formations', validateBody(trainingSchema), once, asyncRoute(postTraining));
router.put('/entreprise/rh/formations/:id', validateBody(trainingStatusSchema), asyncRoute(putTraining));
router.post('/entreprise/rh/postes', validateBody(vacancySchema), once, asyncRoute(postVacancy));
router.put('/entreprise/rh/postes/:id', validateBody(vacancyStatusSchema), asyncRoute(putVacancy));
router.post('/entreprise/rh/postes/:id/candidats', validateBody(candidateSchema), once, asyncRoute(postCandidate));
router.put('/entreprise/rh/postes/:id/candidats/:sub', validateBody(candidateStageSchema), asyncRoute(putCandidate));
router.delete('/entreprise/rh/postes/:id/candidats/:sub', asyncRoute(deleteCandidate));
router.post('/entreprise/paie/simulation', validateBody(payslipSchema), asyncRoute(postPayslipSimulation));
router.post('/entreprise/paie/lots', validateBody(payrollRunSchema), once, asyncRoute(postPayrollRun));
router.get('/entreprise/paie/lots/:id', asyncRoute(getPayrollRun));
router.delete('/entreprise/paie/lots/:id', asyncRoute(deletePayrollRun));
router.put('/entreprise/paie/lots/:id/bulletins/:sub', validateBody(payslipUpdateSchema), asyncRoute(putPayslip));
router.post('/entreprise/paie/lots/:id/:step(recalculer|valider|rouvrir|cloturer)', asyncRoute(postPayrollStep));
router.get('/entreprise/compta', validateQuery(ledgerQuerySchema), asyncRoute(getLedger));
router.get('/entreprise/compta/ecritures', validateQuery(ledgerQuerySchema), asyncRoute(getLedgerEntries));
router.get('/entreprise/compta/grand-livre', validateQuery(ledgerQuerySchema), asyncRoute(getLedgerAccount));
router.post('/entreprise/compta/ecritures', validateBody(ledgerEntrySchema), once, asyncRoute(postLedgerEntry));
router.put('/entreprise/compta/ecritures/:id', validateBody(ledgerEntryUpdateSchema), asyncRoute(putLedgerEntry));
router.delete('/entreprise/compta/ecritures/:id', asyncRoute(deleteLedgerEntry));
router.post('/entreprise/compta/ecritures/:id/:step(valider|contrepasser)', asyncRoute(postLedgerEntryStep));
router.post('/entreprise/compta/propositions', asyncRoute(postLedgerProposals));
router.post('/entreprise/compta/import', validateBody(ledgerImportSchema), asyncRoute(postLedgerImport));
router.post('/entreprise/compta/comptes', validateBody(ledgerAccountSchema), asyncRoute(postLedgerAccount));
router.post('/entreprise/compta/correspondances', validateBody(ledgerChartSchema), asyncRoute(postLedgerChart));
router.put('/entreprise/compta/correspondances/:id', validateBody(ledgerMappingSchema), asyncRoute(putLedgerMapping));
router.post('/entreprise/compta/periodes/:period/:step(cloturer|rouvrir)', validateBody(ledgerPeriodSchema), asyncRoute(postLedgerPeriod));
router.post('/entreprise/compta/rapprochements', validateBody(ledgerBankCheckSchema), asyncRoute(postLedgerBankCheck));
// Lot H: fixed assets, fiscal year closing, bank statements and matching.
router.get('/entreprise/compta/immobilisations', validateQuery(yearQuerySchema), asyncRoute(getAssets));
router.post('/entreprise/compta/immobilisations', validateBody(assetSchema), once, asyncRoute(postAsset));
router.put('/entreprise/compta/immobilisations/:id', validateBody(assetDisposalSchema), asyncRoute(putAsset));
router.post('/entreprise/compta/dotations/:year', asyncRoute(postDepreciation));
router.post('/entreprise/compta/exercices/:year/cloturer', asyncRoute(postYearClose));
router.get('/entreprise/compta/banque', validateQuery(bankQuerySchema), asyncRoute(getBank));
router.post('/entreprise/compta/banque/releve', validateBody(bankStatementSchema), asyncRoute(postBankStatement));
router.post('/entreprise/compta/banque/pointer', validateBody(bankQuerySchema), asyncRoute(postBankAutoMatch));
router.put('/entreprise/compta/banque/lignes/:id', validateBody(bankMatchSchema), asyncRoute(putBankLine));

router.get('/forum', validateQuery(forumQuerySchema), asyncRoute(getForumThreads));
router.post('/forum', validateBody(forumThreadSchema), once, asyncRoute(postForumThread));
router.get('/forum/:id', asyncRoute(getForumThread));
router.post('/forum/:id/reponses', validateBody(forumReplySchema), once, asyncRoute(postForumReply));
router.post('/forum/signalements', validateBody(forumReportSchema), asyncRoute(postForumReport));

router.get('/entreprise/tableau-de-bord', validateQuery(dashboardQuerySchema), asyncRoute(getDashboard));

export default router;

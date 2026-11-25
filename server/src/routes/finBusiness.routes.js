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
  getPlatforms,
  getOfficialRate,
  putCampaignPlatform,
  getCampaignReports,
  postCampaignReport,
  postCampaignReportValidation,
  getCampaignReportCsv,
  getRequestMessages,
  postRequestMessage,
  getMySpaces,
  getFinancerFiles,
  getFinancerFile,
  putFinancerFile,
  postFinancerMessage,
  postFinancerMessageClose,
  getInstitution,
  getInstitutionCsv,
  postProgram,
  putProgram,
  postCohort,
  postCohortFormation,
  deleteCohortFormation,
  postCohortInvites,
  deleteCohortMember,
  getCipReports,
  getCipReportCsv,
  getMyCohorts,
  getInvestLab,
  getInvestLabBacktest,
  getInvestLabStock,
  postMyCohortAnswer,
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
import { getRisks, postProjectFxScenario, postProjectFxSimulation, postRisk, postRiskAction, postRiskActionDone, putRisk } from '../controllers/finRisk.controller.js';
import { createRiskSchema, projectFxScenarioSchema, projectFxSimulationSchema, reassessRiskSchema, riskActionSchema } from '../validation/finBusiness.schemas.js';
import { deletePassport, deleteShare, getBatchCsv, getBatches, getFinancingCandidates, getPassports, getSpaceShare, getSpaceShares, postBatch, postBatchStep, postDispute, postPassport, postPassportStep, postShare } from '../controllers/finPassport.controller.js';
import { batchSchema, consentSchema, disputeSchema, financingQuerySchema, passportSchema, shareSchema } from '../validation/finBusiness.schemas.js';
import { deleteOwnLesson, getOwnFormations, getSessions, postOwnFormation, postOwnLesson, postSession, putAttendance, putOwnPublish, putOwnQuiz, putSession } from '../controllers/finInstitution.controller.js';
import { attendanceSchema, ownFormationSchema, ownLessonSchema, ownPublishSchema, ownQuizSchema, sessionSchema, sessionStatusSchema } from '../validation/finBusiness.schemas.js';
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
  platformLinkSchema,
  campaignReportSchema,
  partnerAnswerSchema,
  partnerFileStatusSchema,
  partnerMessageSchema,
  programSchema,
  programUpdateSchema,
  cohortSchema,
  cohortFormationSchema,
  cohortInviteSchema,
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
router.param('lesson', uuidParam);
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
// Lot D bis: the trade risk register (ECR-0370).
router.get('/entreprise/risques', asyncRoute(getRisks));
router.post('/entreprise/risques', validateBody(createRiskSchema), once, asyncRoute(postRisk));
router.put('/entreprise/risques/:id', validateBody(reassessRiskSchema), asyncRoute(putRisk));
router.post('/entreprise/risques/:id/actions', validateBody(riskActionSchema), once, asyncRoute(postRiskAction));
router.post('/entreprise/risques/:id/actions/:sub/faite', once, asyncRoute(postRiskActionDone));
// Lot D bis: the exchange effect on a project (ECR-0378), simulated or kept.
router.post('/entreprise/projets/:id/change/simulation', validateBody(projectFxSimulationSchema), asyncRoute(postProjectFxSimulation));
router.post('/entreprise/projets/:id/change/scenarios', validateBody(projectFxScenarioSchema), once, asyncRoute(postProjectFxScenario));
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
// Lot I: the crowdfunding regulatory report (ECR-0307) and the platform that reads it.
router.get('/entreprise/plateformes', asyncRoute(getPlatforms));
router.get('/entreprise/cours-officiel', asyncRoute(getOfficialRate));
router.put('/entreprise/campagnes/:id/plateforme', validateBody(platformLinkSchema), asyncRoute(putCampaignPlatform));
router.get('/entreprise/campagnes/:id/rapports', asyncRoute(getCampaignReports));
router.post('/entreprise/campagnes/:id/rapports', validateBody(campaignReportSchema), asyncRoute(postCampaignReport));
router.post('/entreprise/campagnes/:id/rapports/:sub/valider', asyncRoute(postCampaignReportValidation));
router.get('/entreprise/campagnes/:id/rapports/:sub/export', asyncRoute(getCampaignReportCsv));
// Lot I: the messages of a request to a partner, on the organisation's side (ECR-0288).
router.get('/entreprise/partenaires/demandes/:id/messages', asyncRoute(getRequestMessages));
router.post('/entreprise/partenaires/demandes/:id/messages', validateBody(partnerAnswerSchema), asyncRoute(postRequestMessage));
// Lot I: the partners' own space (ECR-0287 to 0294) and the learner's invitations.
// Lot F bis: the financial passport (FAC-010) and the receivables to finance (FAC-011).
router.get('/entreprise/passeports', asyncRoute(getPassports));
router.post('/entreprise/passeports', validateBody(passportSchema), once, asyncRoute(postPassport));
router.post('/entreprise/passeports/:id/:step(publier)', validateBody(consentSchema), once, asyncRoute(postPassportStep));
router.post('/entreprise/passeports/:id/:step(revoquer)', once, asyncRoute(postPassportStep));
router.delete('/entreprise/passeports/:id', asyncRoute(deletePassport));
router.post('/entreprise/documents/:id/litige', validateBody(disputeSchema), asyncRoute(postDispute));
router.get('/entreprise/financement-factures', validateQuery(financingQuerySchema), asyncRoute(getFinancingCandidates));
router.get('/entreprise/lots-factures', asyncRoute(getBatches));
router.post('/entreprise/lots-factures', validateBody(batchSchema), once, asyncRoute(postBatch));
router.post('/entreprise/lots-factures/:id/:step(cloturer|annuler)', once, asyncRoute(postBatchStep));
router.get('/entreprise/lots-factures/:id/export', asyncRoute(getBatchCsv));
router.post('/entreprise/partages-financeur', validateBody(shareSchema), once, asyncRoute(postShare));
router.delete('/entreprise/partages-financeur/:id', asyncRoute(deleteShare));
// Lot I bis: an institution's own courses and sessions (ECR-0294).
router.get('/partenaire/espaces/:id/formations', asyncRoute(getOwnFormations));
router.post('/partenaire/espaces/:id/formations', validateBody(ownFormationSchema), asyncRoute(postOwnFormation));
router.post('/partenaire/espaces/:id/formations/:sub/lecons', validateBody(ownLessonSchema), asyncRoute(postOwnLesson));
router.delete('/partenaire/espaces/:id/formations/:sub/lecons/:lesson', asyncRoute(deleteOwnLesson));
router.put('/partenaire/espaces/:id/formations/:sub/quiz', validateBody(ownQuizSchema), asyncRoute(putOwnQuiz));
router.put('/partenaire/espaces/:id/formations/:sub/publication', validateBody(ownPublishSchema), asyncRoute(putOwnPublish));
router.get('/partenaire/espaces/:id/sessions', asyncRoute(getSessions));
router.post('/partenaire/espaces/:id/sessions', validateBody(sessionSchema), asyncRoute(postSession));
router.put('/partenaire/espaces/:id/sessions/:sub', validateBody(sessionStatusSchema), asyncRoute(putSession));
router.put('/partenaire/espaces/:id/sessions/:sub/presence', validateBody(attendanceSchema), asyncRoute(putAttendance));
router.get('/partenaire/espaces/:id/partages', asyncRoute(getSpaceShares));
router.get('/partenaire/espaces/:id/partages/:sub', asyncRoute(getSpaceShare));
router.get('/partenaire/espaces', asyncRoute(getMySpaces));
router.get('/partenaire/espaces/:id/dossiers', asyncRoute(getFinancerFiles));
router.get('/partenaire/espaces/:id/dossiers/:sub', asyncRoute(getFinancerFile));
router.put('/partenaire/espaces/:id/dossiers/:sub', validateBody(partnerFileStatusSchema), asyncRoute(putFinancerFile));
router.post('/partenaire/espaces/:id/dossiers/:sub/messages', validateBody(partnerMessageSchema), asyncRoute(postFinancerMessage));
router.post('/partenaire/espaces/:id/dossiers/:sub/messages/:msg/clore', asyncRoute(postFinancerMessageClose));
router.get('/partenaire/espaces/:id/institution', asyncRoute(getInstitution));
router.get('/partenaire/espaces/:id/institution/export', asyncRoute(getInstitutionCsv));
router.post('/partenaire/espaces/:id/programmes', validateBody(programSchema), asyncRoute(postProgram));
router.put('/partenaire/espaces/:id/programmes/:sub', validateBody(programUpdateSchema), asyncRoute(putProgram));
router.post('/partenaire/espaces/:id/programmes/:sub/cohortes', validateBody(cohortSchema), asyncRoute(postCohort));
router.post('/partenaire/espaces/:id/cohortes/:sub/formations', validateBody(cohortFormationSchema), asyncRoute(postCohortFormation));
router.delete('/partenaire/espaces/:id/cohortes/:sub/formations/:formation', asyncRoute(deleteCohortFormation));
router.post('/partenaire/espaces/:id/cohortes/:sub/invitations', validateBody(cohortInviteSchema), asyncRoute(postCohortInvites));
router.delete('/partenaire/espaces/:id/cohortes/:sub/membres/:member', asyncRoute(deleteCohortMember));
router.get('/partenaire/espaces/:id/rapports', asyncRoute(getCipReports));
router.get('/partenaire/espaces/:id/rapports/:sub/export', asyncRoute(getCipReportCsv));
router.get('/mes-cohortes', asyncRoute(getMyCohorts));
// P13-01: InvestLab, the client's market data 2020–2026 (read only).
router.get('/investlab', asyncRoute(getInvestLab));
router.get('/investlab/backtest', asyncRoute(getInvestLabBacktest));
router.get('/investlab/actions/:ticker', asyncRoute(getInvestLabStock));
router.post('/mes-cohortes/:id/:step(accepter|refuser)', asyncRoute(postMyCohortAnswer));
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

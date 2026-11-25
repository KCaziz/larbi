import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { officialRate } from '../services/finExchange.service.js';
import { backtest, investLabOverview, stockSheet } from '../services/investLab.service.js';
import {
  BUSINESS_BLOCKED_STATEMENTS,
  BUSINESS_LEGAL_FORMS,
  BUSINESS_PAYMENT_METHODS,
  COST_NATURES,
  DEFAULT_COST_NATURE,
  EXPENSE_CATEGORIES,
  REMINDER_CHANNELS,
} from '../constants/finBusiness.js';
import { MANDATE_SCOPES, ORGANIZATION_PUBLICS, ORGANIZATION_ROLES } from '../constants/finOrganization.js';
import { addExpense, addHoldingValue, addMilestone, createHolding, createProject, listPatrimony, listProjects, moveExpense, moveMilestone, revokeShare, shareProject, updateProject } from '../services/finDiaspora.service.js';
import {
  addCommitment,
  createAbsence,
  createCampaign,
  createEmployee,
  createRequest,
  decideAbsence,
  listCampaigns,
  listEmployees,
  listRequests,
  moveCommitment,
  searchOffers,
  updateCampaign,
  updateEmployee,
  withdrawRequest,
} from '../services/finLotG.service.js';
import { createThread, getThread, listThreads, reply, report } from '../services/forum.service.js';
import {
  answerCohort,
  answerMessage,
  assignFormation,
  cipReportCsv,
  cipReports,
  createCohort,
  createProgram,
  financerCloseMessage,
  financerFile,
  financerFiles,
  financerMessage,
  financerSetStatus,
  institutionExport,
  institutionView,
  inviteLearners,
  linkPlatform,
  listPlatforms,
  listReports,
  myCohorts,
  mySpaces,
  ownReportCsv,
  prepareReport,
  removeLearner,
  requestMessages,
  unassignFormation,
  updateProgram,
  validateReport,
} from '../services/finPartnerPortal.service.js';
import { annualStatement, createRun, discardRun, getRun, linkEmployeeAccount, moveRun, myPayslips, payrollOverview, setConditions, simulatePayslip, updateSlip } from '../services/finPayrollRun.service.js';
import { addCandidate, createTraining, createVacancy, decideTimesheet, moveCandidate, recordTimesheet, removeCandidate, removeSkill, setSkill, staffOverview, updateTraining, updateVacancy } from '../services/finStaff.service.js';
import { autoMatch, bankView, closeYear, createAsset, disposeAsset, importBankStatement, listAssets, matchBankLine, proposeDepreciation } from '../services/finLedgerClose.service.js';
import {
  closePeriod,
  createAccount,
  createBankCheck,
  createEntry,
  discardEntry,
  importChart,
  importEntries,
  ledgerOfAccount,
  ledgerOverview,
  listEntries,
  moveEntry,
  proposeEntries,
  reopenPeriod,
  setMapping,
  updateEntry,
} from '../services/finLedger.service.js';
import { copilot, searchBusiness, simulate, simulatorCatalogue } from '../services/finBusinessTools.service.js';
import { addOperationCost, createOperation, listOperations, operationScenario, receiveOperation, setOperationPiece, tradeReferences, updateOperation } from '../services/finTrade.service.js';
import {
  businessCashPlan,
  businessDashboard,
  createCashPosition,
  createItem,
  createStockMove,
  listBudgets,
  listCashPositions,
  listStock,
  setBudget,
  createContact,
  createCreditNote,
  createDocument,
  createPayment,
  createReminder,
  discardDocument,
  exportDocuments,
  listContacts,
  listDocuments,
  listReminders,
  moveDocument,
  updateBusiness,
  updateDocument,
} from '../services/finBusiness.service.js';
import {
  answerInvitation,
  createOrganization,
  grantMandate,
  inviteMember,
  listJournal,
  listMembers,
  listMyOrganizations,
  resolveOrganization,
  revokeMandate,
  revokeMember,
  updateMember,
} from '../services/finOrganization.service.js';

// Espace entreprise (P7-02), devenu les ORGANISATIONS du référentiel du
// client (P13-05, lot A, 2026-11-23).
//
// Les adresses n'ont pas changé. L'organisation dont parle une requête vient
// de l'en-tête `X-Organisation` et de l'appartenance de la personne, contrôlée
// à chaque appel (membre actif, rôle, mandat) ; sans en-tête, c'est sa propre
// organisation, comme avant. Aucune adresse ne prend d'identifiant
// d'organisation : on ne lit pas celle d'un autre en changeant l'URL.

export function getReferences(req, res) {
  res.json({
    formesJuridiques: BUSINESS_LEGAL_FORMS,
    moyensReglement: BUSINESS_PAYMENT_METHODS,
    canauxRelance: REMINDER_CHANNELS,
    famillesDepense: EXPENSE_CATEGORIES,
    naturesCharge: COST_NATURES,
    natureParDefaut: DEFAULT_COST_NATURE,
    publics: ORGANIZATION_PUBLICS,
    roles: ORGANIZATION_ROLES,
    porteesMandat: MANDATE_SCOPES,
    // Publié avec les références : l'interface sait dès son premier appel ce
    // qu'elle ne pourra pas proposer, et pourquoi.
    etatsNonProduits: BUSINESS_BLOCKED_STATEMENTS,
  });
}

const resolve = (req, action, options) => resolveOrganization(prisma, req, action, options);

// The current organisation, with the person's role and what it allows.
export async function getBusiness(req, res) {
  const ctx = await resolve(req, 'org.read', { optional: true });
  res.json({ entreprise: ctx?.business ?? null, role: ctx?.role ?? null, permissions: ctx?.permissions ?? [] });
}

// A new organisation: every adult may create one, and is its owner.
export async function postBusiness(req, res) {
  res.status(201).json({ entreprise: await createOrganization(prisma, req.user, req.body) });
}

export async function putBusiness(req, res) {
  const ctx = await resolve(req, 'org.update');
  res.json({ entreprise: await updateBusiness(prisma, ctx, req.body, req.get('if-match')) });
}

export async function getOrganizations(req, res) {
  res.json(await listMyOrganizations(prisma, req.user));
}

export async function getContacts(req, res) {
  res.json({ tiers: await listContacts(prisma, await resolve(req, 'finance.read'), req.query) });
}

export async function postContact(req, res) {
  res.status(201).json({ tiers: await createContact(prisma, await resolve(req, 'contacts.write'), req.body) });
}

export async function getDocuments(req, res) {
  res.json({ documents: await listDocuments(prisma, await resolve(req, 'finance.read'), req.query) });
}

export async function postDocument(req, res) {
  res.status(201).json({ document: await createDocument(prisma, await resolve(req, 'documents.write'), req.body) });
}

// ---- lot B : le cycle de facturation (19_CYCLE_FACTURE) ---------------------

export async function putDocument(req, res) {
  res.json({ document: await updateDocument(prisma, await resolve(req, 'documents.write'), req.params.id, req.body, req.get('if-match')) });
}

export async function deleteDocument(req, res) {
  await discardDocument(prisma, await resolve(req, 'documents.write'), req.params.id);
  res.status(204).end();
}

// envoyer | accepter | refuser | facturer | emettre
export async function postDocumentStep(req, res) {
  const document = await moveDocument(prisma, await resolve(req, 'documents.write'), req.params.id, req.params.step, req.body, req.get('if-match'));
  res.status(req.params.step === 'facturer' ? 201 : 200).json({ document });
}

export async function postCreditNote(req, res) {
  res.status(201).json({ avoir: await createCreditNote(prisma, await resolve(req, 'documents.write'), req.params.id, req.body) });
}

export async function getReminders(req, res) {
  res.json({ relances: await listReminders(prisma, await resolve(req, 'finance.read'), req.params.id) });
}

export async function postReminder(req, res) {
  res.status(201).json({ relance: await createReminder(prisma, await resolve(req, 'documents.write'), req.params.id, req.body) });
}

export async function getExport(req, res) {
  const csv = await exportDocuments(prisma, await resolve(req, 'finance.read'), req.query);
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', 'attachment; filename="fincludia-pieces.csv"');
  res.send(csv);
}

export async function postPayment(req, res) {
  res.status(201).json({ reglement: await createPayment(prisma, await resolve(req, 'payments.write'), req.params.id, req.body) });
}

export async function getDashboard(req, res) {
  res.json(await businessDashboard(prisma, await resolve(req, 'finance.read'), req.query));
}

// ---- members, invitations, mandates, journal (lot A) ------------------------

export async function getMembers(req, res) {
  const ctx = await resolve(req, 'members.manage');
  res.json({ membres: await listMembers(prisma, ctx.business.id) });
}

export async function postMember(req, res) {
  res.status(201).json({ membre: await inviteMember(prisma, await resolve(req, 'members.manage'), req.body) });
}

export async function putMember(req, res) {
  res.json({ membre: await updateMember(prisma, await resolve(req, 'members.manage'), req.params.id, req.body, req.get('if-match')) });
}

export async function deleteMember(req, res) {
  await revokeMember(prisma, await resolve(req, 'members.manage'), req.params.id);
  res.status(204).end();
}

export async function postInvitationAnswer(req, res) {
  res.json({ invitation: await answerInvitation(prisma, req.user, req.params.id, req.params.answer === 'accepter') });
}

export async function postMandate(req, res) {
  res.status(201).json({ mandat: await grantMandate(prisma, await resolve(req, 'mandates.manage'), req.body) });
}

export async function deleteMandate(req, res) {
  await revokeMandate(prisma, await resolve(req, 'mandates.manage'), req.params.id);
  res.status(204).end();
}

export async function getJournal(req, res) {
  const ctx = await resolve(req, 'journal.read');
  res.json({ journal: await listJournal(prisma, ctx.business.id) });
}

// ---- lot C : stock, budgets, trésorerie -------------------------------------------

export async function getStock(req, res) {
  res.json({ articles: await listStock(prisma, await resolve(req, 'stock.read')) });
}

export async function postItem(req, res) {
  res.status(201).json({ article: await createItem(prisma, await resolve(req, 'stock.write'), req.body) });
}

export async function postStockMove(req, res) {
  res.status(201).json({ mouvement: await createStockMove(prisma, await resolve(req, 'stock.write'), req.body) });
}

export async function getBudgets(req, res) {
  res.json({ budgets: await listBudgets(prisma, await resolve(req, 'finance.read'), req.query) });
}

export async function putBudget(req, res) {
  res.json({ budget: await setBudget(prisma, await resolve(req, 'budget.write'), req.body) });
}

export async function getCashPlan(req, res) {
  res.json(await businessCashPlan(prisma, await resolve(req, 'finance.read'), req.query));
}

export async function getCashPositions(req, res) {
  res.json({ soldes: await listCashPositions(prisma, await resolve(req, 'finance.read')) });
}

export async function postCashPosition(req, res) {
  res.status(201).json({ solde: await createCashPosition(prisma, await resolve(req, 'cash.write'), req.body) });
}

// ---- lot D : micro-importation et commerce international ---------------------------

export async function getTradeReferences(req, res) {
  await resolve(req, 'finance.read');
  res.json(await tradeReferences());
}

export async function getOperations(req, res) {
  res.json({ operations: await listOperations(prisma, await resolve(req, 'finance.read')) });
}

export async function postOperation(req, res) {
  res.status(201).json({ operation: await createOperation(prisma, await resolve(req, 'trade.write'), req.body) });
}

export async function putOperation(req, res) {
  res.json({ operation: await updateOperation(prisma, await resolve(req, 'trade.write'), req.params.id, req.body, req.get('if-match')) });
}

export async function postOperationCost(req, res) {
  res.status(201).json({ cout: await addOperationCost(prisma, await resolve(req, 'trade.write'), req.params.id, req.body) });
}

export async function putOperationPiece(req, res) {
  res.json({ piece: await setOperationPiece(prisma, await resolve(req, 'trade.write'), req.params.id, req.body) });
}

export async function postOperationReception(req, res) {
  res.status(201).json({ reception: await receiveOperation(prisma, await resolve(req, 'trade.write'), req.params.id, req.body) });
}

export async function getOperationScenario(req, res) {
  res.json(await operationScenario(prisma, await resolve(req, 'finance.read'), req.params.id, req.query));
}

// ---- lot E : diaspora --------------------------------------------------------------
// A project is reached by every member (`org.read`), then checked project by
// project: its managers, or a share in force (CNV-14).

export async function getProjects(req, res) {
  res.json({ projets: await listProjects(prisma, await resolve(req, 'org.read')) });
}

export async function postProject(req, res) {
  res.status(201).json({ projet: await createProject(prisma, await resolve(req, 'project.manage'), req.body) });
}

export async function putProject(req, res) {
  res.json({ projet: await updateProject(prisma, await resolve(req, 'org.read'), req.params.id, req.body, req.get('if-match')) });
}

export async function postMilestone(req, res) {
  res.status(201).json({ jalon: await addMilestone(prisma, await resolve(req, 'org.read'), req.params.id, req.body) });
}

export async function postMilestoneStep(req, res) {
  res.json({ jalon: await moveMilestone(prisma, await resolve(req, 'org.read'), req.params.id, req.params.sub, req.params.step, req.body) });
}

export async function postExpense(req, res) {
  res.status(201).json({ depense: await addExpense(prisma, await resolve(req, 'org.read'), req.params.id, req.body) });
}

export async function postExpenseStep(req, res) {
  res.json({ depense: await moveExpense(prisma, await resolve(req, 'org.read'), req.params.id, req.params.sub, req.params.step, req.body) });
}

export async function postProjectShare(req, res) {
  res.status(201).json({ partage: await shareProject(prisma, await resolve(req, 'org.read'), req.params.id, req.body) });
}

export async function deleteProjectShare(req, res) {
  await revokeShare(prisma, await resolve(req, 'org.read'), req.params.id, req.params.sub);
  res.status(204).end();
}

export async function getPatrimony(req, res) {
  res.json(await listPatrimony(prisma, await resolve(req, 'patrimony.read')));
}

export async function postHolding(req, res) {
  res.status(201).json({ bien: await createHolding(prisma, await resolve(req, 'patrimony.write'), req.body) });
}

export async function postHoldingValue(req, res) {
  res.status(201).json({ valeur: await addHoldingValue(prisma, await resolve(req, 'patrimony.write'), req.params.id, req.body) });
}

// ---- lot F : simulateurs, recherche, copilote ------------------------------------------

export async function getSimulators(req, res) {
  await resolve(req, 'org.read');
  res.json(simulatorCatalogue());
}

// A simulation stores nothing (CNV-12): it needs only to be a member.
export async function postSimulation(req, res) {
  await resolve(req, 'org.read');
  res.json(await simulate(req.params.code, req.body.inputs));
}

export async function getSearch(req, res) {
  res.json({ resultats: await searchBusiness(prisma, await resolve(req, 'org.read'), req.query.q) });
}

export async function postCopilot(req, res) {
  res.json(await copilot(prisma, await resolve(req, 'org.read'), req.body));
}

// ---- lot G : partenaires, personnel, financement participatif, forum ----------------

export async function getPartnerOffers(req, res) {
  const ctx = await resolve(req, 'org.read');
  res.json({ offres: await searchOffers(prisma, { ...req.query, publicKey: ctx.business.publicKey ?? undefined }) });
}

export async function getPartnerRequests(req, res) {
  res.json({ demandes: await listRequests(prisma, await resolve(req, 'partners.request')) });
}

export async function postPartnerRequest(req, res) {
  res.status(201).json({ demande: await createRequest(prisma, await resolve(req, 'partners.request'), req.body) });
}

export async function deletePartnerRequest(req, res) {
  res.json({ demande: await withdrawRequest(prisma, await resolve(req, 'partners.request'), req.params.id) });
}

export async function getEmployees(req, res) {
  res.json(await listEmployees(prisma, await resolve(req, 'hr.read'), req.query));
}

export async function postEmployee(req, res) {
  res.status(201).json({ salarie: await createEmployee(prisma, await resolve(req, 'hr.manage'), req.body) });
}

export async function putEmployee(req, res) {
  res.json({ salarie: await updateEmployee(prisma, await resolve(req, 'hr.manage'), req.params.id, req.body, req.get('if-match')) });
}

export async function postAbsence(req, res) {
  res.status(201).json({ absence: await createAbsence(prisma, await resolve(req, 'hr.manage'), req.params.id, req.body) });
}

export async function postAbsenceStep(req, res) {
  res.json({ absence: await decideAbsence(prisma, await resolve(req, 'hr.manage'), req.params.id, req.params.sub, req.params.step) });
}

export async function getCampaigns(req, res) {
  res.json({ campagnes: await listCampaigns(prisma, await resolve(req, 'finance.read')) });
}

export async function postCampaign(req, res) {
  res.status(201).json({ campagne: await createCampaign(prisma, await resolve(req, 'crowdfunding.manage'), req.body) });
}

export async function putCampaign(req, res) {
  res.json({ campagne: await updateCampaign(prisma, await resolve(req, 'crowdfunding.manage'), req.params.id, req.body, req.get('if-match')) });
}

export async function postCommitment(req, res) {
  res.status(201).json({ engagement: await addCommitment(prisma, await resolve(req, 'crowdfunding.manage'), req.params.id, req.body) });
}

export async function postCommitmentStep(req, res) {
  res.json({ engagement: await moveCommitment(prisma, await resolve(req, 'crowdfunding.manage'), req.params.id, req.params.sub, req.params.step) });
}

// The forum belongs to people, not to an organisation.
export async function getForumThreads(req, res) {
  res.json({ discussions: await listThreads(prisma, req.user, req.query) });
}

export async function getForumThread(req, res) {
  res.json({ discussion: await getThread(prisma, req.user, req.params.id) });
}

export async function postForumThread(req, res) {
  res.status(201).json({ discussion: await createThread(prisma, req.user, req.body) });
}

export async function postForumReply(req, res) {
  res.status(201).json({ message: await reply(prisma, req.user, req.params.id, req.body) });
}

export async function postForumReport(req, res) {
  res.status(201).json({ signalement: await report(prisma, req.user, req.body) });
}

// ---- lot G, second part: payroll (ECR-0265 to 0271) ----------------------------------------------
export async function getPayroll(req, res) {
  res.json(await payrollOverview(prisma, await resolve(req, 'payroll.read')));
}

export async function postPayslipSimulation(req, res) {
  res.json({ simulation: await simulatePayslip(await resolve(req, 'payroll.read'), req.body) });
}

export async function postPayrollRun(req, res) {
  res.status(201).json({ lot: await createRun(prisma, await resolve(req, 'payroll.manage'), req.body) });
}

export async function getPayrollRun(req, res) {
  res.json({ lot: await getRun(prisma, await resolve(req, 'payroll.read'), req.params.id) });
}

export async function deletePayrollRun(req, res) {
  res.json(await discardRun(prisma, await resolve(req, 'payroll.manage'), req.params.id));
}

export async function putPayslip(req, res) {
  res.json({ bulletin: await updateSlip(prisma, await resolve(req, 'payroll.manage'), req.params.id, req.params.sub, req.body) });
}

export async function postPayrollStep(req, res) {
  res.json({ lot: await moveRun(prisma, await resolve(req, 'payroll.manage'), req.params.id, req.params.step, req.get('if-match')) });
}

// ---- accounting (ECR-0108, 0243 to 0250, 0330) ------------------------------------------------------
export async function getLedger(req, res) {
  res.json(await ledgerOverview(prisma, await resolve(req, 'ledger.read'), req.query));
}

export async function getLedgerEntries(req, res) {
  res.json({ ecritures: await listEntries(prisma, await resolve(req, 'ledger.read'), req.query) });
}

export async function getLedgerAccount(req, res) {
  if (!req.query.account) throw new HttpError(400, 'An account is required', { reason: 'accountRequired' });
  res.json({ grandLivre: await ledgerOfAccount(prisma, await resolve(req, 'ledger.read'), req.query) });
}

export async function postLedgerEntry(req, res) {
  res.status(201).json({ ecriture: await createEntry(prisma, await resolve(req, 'ledger.write'), req.body) });
}

export async function putLedgerEntry(req, res) {
  res.json({ ecriture: await updateEntry(prisma, await resolve(req, 'ledger.write'), req.params.id, req.body, req.get('if-match')) });
}

export async function deleteLedgerEntry(req, res) {
  res.json(await discardEntry(prisma, await resolve(req, 'ledger.write'), req.params.id));
}

export async function postLedgerEntryStep(req, res) {
  res.json({ ecriture: await moveEntry(prisma, await resolve(req, 'ledger.write'), req.params.id, req.params.step) });
}

export async function postLedgerProposals(req, res) {
  res.json(await proposeEntries(prisma, await resolve(req, 'ledger.write')));
}

export async function postLedgerImport(req, res) {
  res.json({ rapport: await importEntries(prisma, await resolve(req, 'ledger.write'), req.body) });
}

export async function postLedgerAccount(req, res) {
  res.status(201).json({ compte: await createAccount(prisma, await resolve(req, 'ledger.write'), req.body) });
}

export async function postLedgerChart(req, res) {
  res.json(await importChart(prisma, await resolve(req, 'ledger.write'), req.body));
}

export async function putLedgerMapping(req, res) {
  res.json({ correspondance: await setMapping(prisma, await resolve(req, 'ledger.write'), req.params.id, req.body) });
}

export async function postLedgerPeriod(req, res) {
  const { period, step } = req.params;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) throw new HttpError(400, 'A month YYYY-MM', { reason: 'invalidPeriod' });
  const ctx = await resolve(req, 'ledger.write');
  if (step === 'rouvrir' && !req.body.reason) throw new HttpError(422, 'A reason is required', { reason: 'reasonRequired' });
  res.json({ periode: step === 'cloturer' ? await closePeriod(prisma, ctx, period) : await reopenPeriod(prisma, ctx, period, req.body) });
}

export async function postLedgerBankCheck(req, res) {
  res.status(201).json({ rapprochement: await createBankCheck(prisma, await resolve(req, 'ledger.write'), req.body) });
}

export async function putPayrollConditions(req, res) {
  res.json({ salarie: await setConditions(prisma, await resolve(req, 'payroll.manage'), req.params.id, req.body, req.get('if-match')) });
}

// ---- lot H --------------------------------------------------------------------------------------
const yearOf = (value) => {
  const year = Number(value);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new HttpError(400, 'A year', { reason: 'invalidYear' });
  return year;
};

export async function putPayrollAccess(req, res) {
  res.json(await linkEmployeeAccount(prisma, await resolve(req, 'payroll.manage'), req.params.id, req.body));
}

export async function getAnnualStatement(req, res) {
  const year = req.query.year ?? new Date().getUTCFullYear() - 1;
  const csv = await annualStatement(prisma, await resolve(req, 'payroll.read'), year);
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="fincludia-salaires-${year}.csv"`);
  res.send(csv);
}

export async function getMyPayslips(req, res) {
  res.json({ bulletins: await myPayslips(prisma, req.user) });
}

export async function getStaff(req, res) {
  res.json(await staffOverview(prisma, await resolve(req, 'hr.read'), req.query));
}

export async function postTimesheet(req, res) {
  res.status(201).json({ temps: await recordTimesheet(prisma, await resolve(req, 'hr.manage'), req.params.id, req.body) });
}

export async function postTimesheetStep(req, res) {
  res.json({ temps: await decideTimesheet(prisma, await resolve(req, 'hr.manage'), req.params.id, req.params.sub, req.params.step) });
}

export async function postSkill(req, res) {
  res.status(201).json({ competence: await setSkill(prisma, await resolve(req, 'hr.manage'), req.params.id, req.body) });
}

export async function deleteSkill(req, res) {
  res.json(await removeSkill(prisma, await resolve(req, 'hr.manage'), req.params.id, req.params.sub));
}

export async function postTraining(req, res) {
  res.status(201).json({ formation: await createTraining(prisma, await resolve(req, 'hr.manage'), req.body) });
}

export async function putTraining(req, res) {
  res.json({ formation: await updateTraining(prisma, await resolve(req, 'hr.manage'), req.params.id, req.body) });
}

export async function postVacancy(req, res) {
  res.status(201).json({ poste: await createVacancy(prisma, await resolve(req, 'hr.manage'), req.body) });
}

export async function putVacancy(req, res) {
  res.json({ poste: await updateVacancy(prisma, await resolve(req, 'hr.manage'), req.params.id, req.body) });
}

export async function postCandidate(req, res) {
  res.status(201).json({ candidat: await addCandidate(prisma, await resolve(req, 'hr.manage'), req.params.id, req.body) });
}

export async function putCandidate(req, res) {
  res.json({ candidat: await moveCandidate(prisma, await resolve(req, 'hr.manage'), req.params.id, req.params.sub, req.body) });
}

export async function deleteCandidate(req, res) {
  res.json(await removeCandidate(prisma, await resolve(req, 'hr.manage'), req.params.id, req.params.sub));
}

export async function getAssets(req, res) {
  res.json(await listAssets(prisma, await resolve(req, 'ledger.read'), req.query));
}

export async function postAsset(req, res) {
  res.status(201).json({ immobilisation: await createAsset(prisma, await resolve(req, 'ledger.write'), req.body) });
}

export async function putAsset(req, res) {
  res.json({ immobilisation: await disposeAsset(prisma, await resolve(req, 'ledger.write'), req.params.id, req.body) });
}

export async function postDepreciation(req, res) {
  res.json(await proposeDepreciation(prisma, await resolve(req, 'ledger.write'), yearOf(req.params.year)));
}

export async function postYearClose(req, res) {
  res.json({ exercice: await closeYear(prisma, await resolve(req, 'ledger.write'), yearOf(req.params.year)) });
}

export async function getBank(req, res) {
  res.json(await bankView(prisma, await resolve(req, 'ledger.read'), req.query));
}

export async function postBankStatement(req, res) {
  res.json(await importBankStatement(prisma, await resolve(req, 'ledger.write'), req.body));
}

export async function postBankAutoMatch(req, res) {
  res.json(await autoMatch(prisma, await resolve(req, 'ledger.write'), req.body.account ?? '512'));
}

export async function putBankLine(req, res) {
  res.json({ ligne: await matchBankLine(prisma, await resolve(req, 'ledger.write'), req.params.id, req.body) });
}

// ---- lot I: partners' space, learner's invitations, crowdfunding report -------------------------------
const sendCsv = (res, name, csv) => {
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="${name}"`);
  res.send(csv);
};

export async function getPlatforms(req, res) {
  await resolve(req, 'finance.read');
  res.json({ plateformes: await listPlatforms(prisma) });
}

export async function putCampaignPlatform(req, res) {
  res.json({ campagne: await linkPlatform(prisma, await resolve(req, 'crowdfunding.manage'), req.params.id, req.body) });
}

export async function getCampaignReports(req, res) {
  res.json({ rapports: await listReports(prisma, await resolve(req, 'finance.read'), req.params.id) });
}

export async function postCampaignReport(req, res) {
  res.status(201).json({ rapport: await prepareReport(prisma, await resolve(req, 'crowdfunding.manage'), req.params.id, req.body) });
}

export async function postCampaignReportValidation(req, res) {
  res.json({ rapport: await validateReport(prisma, await resolve(req, 'crowdfunding.manage'), req.params.id, req.params.sub) });
}

export async function getCampaignReportCsv(req, res) {
  sendCsv(res, 'fincludia-rapport-campagne.csv', await ownReportCsv(prisma, await resolve(req, 'finance.read'), req.params.id, req.params.sub));
}

export async function getRequestMessages(req, res) {
  res.json({ messages: await requestMessages(prisma, await resolve(req, 'partners.request'), req.params.id) });
}

export async function postRequestMessage(req, res) {
  res.status(201).json({ message: await answerMessage(prisma, await resolve(req, 'partners.request'), req.params.id, req.body) });
}

export async function getMySpaces(req, res) {
  res.json({ espaces: await mySpaces(prisma, req.user) });
}

export async function getFinancerFiles(req, res) {
  res.json(await financerFiles(prisma, req.user, req.params.id, req.query));
}

export async function getFinancerFile(req, res) {
  res.json({ dossier: await financerFile(prisma, req.user, req.params.id, req.params.sub) });
}

export async function putFinancerFile(req, res) {
  res.json({ dossier: await financerSetStatus(prisma, req.user, req.params.id, req.params.sub, req.body) });
}

export async function postFinancerMessage(req, res) {
  res.status(201).json({ message: await financerMessage(prisma, req.user, req.params.id, req.params.sub, req.body) });
}

export async function postFinancerMessageClose(req, res) {
  res.json({ message: await financerCloseMessage(prisma, req.user, req.params.id, req.params.sub, req.params.msg) });
}

export async function getInstitution(req, res) {
  res.json(await institutionView(prisma, req.user, req.params.id));
}

export async function getInstitutionCsv(req, res) {
  sendCsv(res, 'fincludia-institution.csv', await institutionExport(prisma, req.user, req.params.id));
}

export async function postProgram(req, res) {
  res.status(201).json({ programme: await createProgram(prisma, req.user, req.params.id, req.body) });
}

export async function putProgram(req, res) {
  res.json({ programme: await updateProgram(prisma, req.user, req.params.id, req.params.sub, req.body) });
}

export async function postCohort(req, res) {
  res.status(201).json({ cohorte: await createCohort(prisma, req.user, req.params.id, req.params.sub, req.body) });
}

export async function postCohortFormation(req, res) {
  res.status(201).json({ affectation: await assignFormation(prisma, req.user, req.params.id, req.params.sub, req.body) });
}

export async function deleteCohortFormation(req, res) {
  res.json(await unassignFormation(prisma, req.user, req.params.id, req.params.sub, req.params.formation));
}

export async function postCohortInvites(req, res) {
  res.status(201).json(await inviteLearners(prisma, req.user, req.params.id, req.params.sub, req.body));
}

export async function deleteCohortMember(req, res) {
  res.json({ membre: await removeLearner(prisma, req.user, req.params.id, req.params.sub, req.params.member) });
}

export async function getCipReports(req, res) {
  res.json({ rapports: await cipReports(prisma, req.user, req.params.id) });
}

export async function getCipReportCsv(req, res) {
  sendCsv(res, 'fincludia-rapport-campagne.csv', await cipReportCsv(prisma, req.user, req.params.id, req.params.sub));
}

export async function getMyCohorts(req, res) {
  res.json({ cohortes: await myCohorts(prisma, req.user) });
}

export async function postMyCohortAnswer(req, res) {
  res.json({ membre: await answerCohort(prisma, req.user, req.params.id, req.params.step === 'accepter') });
}

// The official rate proposed by default in the import-export and diaspora screens.
export async function getOfficialRate(req, res) {
  await resolve(req, 'org.read');
  const from = String(req.query.from ?? '').toUpperCase();
  const to = String(req.query.to ?? '').toUpperCase();
  if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) throw new HttpError(400, 'Two currencies', { reason: 'invalidCurrency' });
  const at = req.query.date && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date) ? new Date(`${req.query.date}T23:59:59.999Z`) : new Date();
  res.json({ cours: await officialRate(prisma, from, to, at) });
}

// P13-01: InvestLab — the client's market data 2020–2026, read only.
export async function getInvestLab(req, res) {
  res.json(investLabOverview());
}

export async function getInvestLabStock(req, res) {
  const sheet = stockSheet(String(req.params.ticker).toUpperCase());
  if (!sheet) throw new HttpError(404, 'Unknown share', { reason: 'stockNotFound' });
  res.json({ action: sheet });
}

export async function getInvestLabBacktest(req, res) {
  const amount = Number(req.query.amount ?? 1000000);
  const from = Number(req.query.from ?? 2020);
  const to = Number(req.query.to ?? 2026);
  if (!Number.isInteger(amount) || amount <= 0 || amount > 1e13 || !Number.isInteger(from) || !Number.isInteger(to) || from < 2020 || to > 2026 || to <= from) {
    throw new HttpError(400, 'Amount and two years between 2020 and 2026', { reason: 'invalidBacktest' });
  }
  res.json(backtest({ amount, from, to }));
}

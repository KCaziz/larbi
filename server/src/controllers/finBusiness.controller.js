import { prisma } from '../config/prisma.js';
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

import {
  BUSINESS_BLOCKED_STATEMENTS,
  BUSINESS_CONTACT_KINDS,
  BUSINESS_DOCUMENT_KINDS,
  CASH_BASIS_NOTICE,
} from '../constants/finBusiness.js';
import { HttpError } from '../utils/httpError.js';
import { buildBusinessDashboard, documentSettlement, documentTotal } from './finBusinessView.service.js';

/**
 * L'espace entreprise (P7-02) : accès à la base.
 *
 * Les calculs vivent dans finBusinessView.service.js, sans base ; ici on lit,
 * on écrit, et on refuse ce qui n'a pas de sens — en DISANT pourquoi, ce
 * qu'une violation de contrainte SQL ne saurait pas faire.
 *
 * Chaque requête est bornée à l'entreprise du compte appelant. Il n'existe
 * aucune route qui prenne un `businessId` : l'entreprise est déduite de la
 * session, donc on ne peut pas lire celle d'un autre en changeant un
 * identifiant dans l'URL.
 */

const activeFilter = { archivedAt: null, deletedAt: null };

/** L'entreprise du compte, ou `null` : un compte n'en a pas forcément. */
export function findBusiness(prisma, userId) {
  return prisma.finBusiness.findFirst({ where: { userId, ...activeFilter } });
}

export async function requireBusiness(prisma, userId) {
  const business = await findBusiness(prisma, userId);
  if (!business) {
    throw new HttpError(404, 'No business space for this account', { reason: 'noBusiness' });
  }
  return business;
}

export async function createBusiness(prisma, userId, body) {
  const existing = await findBusiness(prisma, userId);
  // Une entreprise par compte : le projet a tranché qu'un compte porte un seul
  // profil actif à la fois (P3-18), et deux entreprises sur un compte seraient
  // deux comptabilités dans le même tiroir.
  if (existing) throw new HttpError(409, 'This account already has a business space', { reason: 'businessExists' });

  return prisma.finBusiness.create({
    data: {
      userId,
      name: body.name,
      legalForm: body.legalForm ?? null,
      // Identifiants fiscaux stockés tels quels : aucun format n'est imposé.
      // Un NIF refusé à tort empêcherait d'enregistrer une entreprise réelle,
      // et nous n'avons pas la règle de composition officielle.
      taxId: body.taxId ?? null,
      tradeRegister: body.tradeRegister ?? null,
      statisticalId: body.statisticalId ?? null,
      activity: body.activity ?? null,
      currency: body.currency,
      fiscalYearStartMonth: body.fiscalYearStartMonth ?? 1,
      source: 'declared',
      status: 'active',
    },
  });
}

export async function updateBusiness(prisma, userId, body) {
  const business = await requireBusiness(prisma, userId);
  return prisma.finBusiness.update({
    where: { id: business.id },
    // La version s'incrémente à chaque correction : le socle de P6-02 veut une
    // modification traçable, pas un écrasement silencieux.
    data: { ...body, version: { increment: 1 } },
  });
}

// ---- tiers ----------------------------------------------------------------

export async function listContacts(prisma, userId, { kind } = {}) {
  const business = await requireBusiness(prisma, userId);
  return prisma.finBusinessContact.findMany({
    where: { businessId: business.id, ...(kind ? { kind } : {}), ...activeFilter },
    orderBy: { name: 'asc' },
  });
}

export async function createContact(prisma, userId, body) {
  const business = await requireBusiness(prisma, userId);
  if (!BUSINESS_CONTACT_KINDS.includes(body.kind)) {
    throw new HttpError(422, 'Unknown contact kind', { reason: 'unknownKind' });
  }
  return prisma.finBusinessContact.create({
    data: { businessId: business.id, ...body, source: 'declared', status: 'active' },
  });
}

// ---- documents ------------------------------------------------------------

export async function listDocuments(prisma, userId, { kind, from, to } = {}) {
  const business = await requireBusiness(prisma, userId);
  const documents = await prisma.finBusinessDocument.findMany({
    where: {
      businessId: business.id,
      ...(kind ? { kind } : {}),
      ...(from || to ? { issuedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      ...activeFilter,
    },
    orderBy: { issuedAt: 'desc' },
    include: { contact: { select: { id: true, name: true, kind: true } } },
  });
  const payments = await prisma.finBusinessPayment.findMany({
    where: { businessId: business.id, documentId: { in: documents.map((d) => d.id) }, ...activeFilter },
  });

  // L'état de règlement est TOUJOURS déduit, jamais stocké : un document que
  // l'on peut marquer « payé » à la main ment dès que quelqu'un se trompe.
  return documents.map((document) => ({
    ...document,
    total: documentTotal(document),
    reglement: documentSettlement(document, payments),
  }));
}

export async function createDocument(prisma, userId, body) {
  const business = await requireBusiness(prisma, userId);
  if (!BUSINESS_DOCUMENT_KINDS.includes(body.kind)) {
    throw new HttpError(422, 'Unknown document kind', { reason: 'unknownKind' });
  }
  // La devise du document est celle de l'entreprise : le moteur ne convertit
  // jamais sans taux daté, et un tableau de bord mêlant deux devises ne
  // pourrait additionner rien du tout. Le refus le dit, plutôt que de laisser
  // une contrainte SQL parler à sa place.
  if (body.currency !== business.currency) {
    throw new HttpError(422, 'A document uses the currency of its business', {
      reason: 'currencyMismatch',
      expected: business.currency,
    });
  }
  if (body.contactId) await assertContactBelongs(prisma, business.id, body.contactId, body.kind);

  const existing = await prisma.finBusinessDocument.findFirst({
    where: { businessId: business.id, kind: body.kind, number: body.number },
  });
  if (existing) {
    throw new HttpError(409, 'This document number already exists', { reason: 'duplicateNumber' });
  }

  return prisma.finBusinessDocument.create({
    data: { businessId: business.id, ...body, source: 'declared', status: 'active' },
  });
}

/**
 * Un tiers appartient à l'entreprise, et son sens correspond au document : une
 * vente va à un client, un achat vient d'un fournisseur. Sans cette règle, le
 * total des créances clients compterait des fournisseurs.
 */
async function assertContactBelongs(prisma, businessId, contactId, documentKind) {
  const contact = await prisma.finBusinessContact.findFirst({ where: { id: contactId, businessId, ...activeFilter } });
  if (!contact) throw new HttpError(404, 'Contact not found', { reason: 'contactNotFound' });
  const expected = documentKind === 'sale' ? 'client' : 'supplier';
  if (contact.kind !== expected) {
    throw new HttpError(422, 'This contact does not match the document kind', {
      reason: 'contactKindMismatch',
      expected,
    });
  }
}

// ---- règlements -----------------------------------------------------------

export async function createPayment(prisma, userId, documentId, body) {
  const business = await requireBusiness(prisma, userId);
  const document = await prisma.finBusinessDocument.findFirst({
    where: { id: documentId, businessId: business.id, ...activeFilter },
  });
  if (!document) throw new HttpError(404, 'Document not found', { reason: 'documentNotFound' });

  // « Le règlement est dans la devise de son document » référence une colonne
  // de clé étrangère : MariaDB refuse une telle CHECK (erreur 1901). La règle
  // vit donc ici, et le test de sécurité la vérifie par l'API.
  if (body.currency !== document.currency) {
    throw new HttpError(422, 'A payment uses the currency of its document', {
      reason: 'currencyMismatch',
      expected: document.currency,
    });
  }
  if (new Date(body.receivedAt) < new Date(document.issuedAt)) {
    throw new HttpError(422, 'A payment cannot predate its document', { reason: 'paymentBeforeIssue' });
  }

  const payments = await prisma.finBusinessPayment.findMany({
    where: { businessId: business.id, documentId, ...activeFilter },
  });
  const settlement = documentSettlement(document, payments);
  // Le trop-perçu est refusé plutôt que toléré : il vient presque toujours
  // d'une saisie en double, et le laisser passer fausse les créances sans que
  // personne ne s'en aperçoive. Un vrai trop-perçu se traite par un avoir,
  // c'est-à-dire un document, pas par un règlement excédentaire.
  if (body.value > settlement.outstanding) {
    throw new HttpError(422, 'This payment exceeds what is still due', {
      reason: 'overpayment',
      outstanding: settlement.outstanding,
    });
  }

  return prisma.finBusinessPayment.create({
    data: { businessId: business.id, documentId, ...body, source: 'declared', status: 'active' },
  });
}

// ---- tableau de bord ------------------------------------------------------

export async function businessDashboard(prisma, userId, { from, to } = {}) {
  const business = await requireBusiness(prisma, userId);
  const documents = await prisma.finBusinessDocument.findMany({
    where: { businessId: business.id, ...activeFilter },
  });
  const payments = await prisma.finBusinessPayment.findMany({
    where: {
      businessId: business.id,
      ...(from || to ? { receivedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      ...activeFilter,
    },
  });

  return {
    entreprise: { id: business.id, nom: business.name, devise: business.currency },
    periode: from && to ? { debut: from, fin: to } : null,
    ...buildBusinessDashboard({ business, documents, payments }),
    // Les états que le contrat annonce et que nous ne produisons pas, nommés
    // avec ce qui manque. Un écran qui dirait seulement « indisponible » se
    // lirait comme une fonction oubliée plutôt que comme une donnée attendue.
    etatsNonProduits: BUSINESS_BLOCKED_STATEMENTS,
    avertissement: CASH_BASIS_NOTICE,
  };
}

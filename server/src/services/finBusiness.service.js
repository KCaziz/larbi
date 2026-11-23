import {
  BUSINESS_BLOCKED_STATEMENTS,
  BUSINESS_CONTACT_KINDS,
  BUSINESS_DOCUMENT_KINDS,
  CASH_BASIS_NOTICE,
  DEFAULT_COST_NATURE,
  DOCUMENT_NUMBER_PREFIX,
} from '../constants/finBusiness.js';
import { cashPlan, pilotFigures, stockLots } from './finBusinessPilot.service.js';
import { HttpError } from '../utils/httpError.js';
import { buildBusinessDashboard, creditNotesOf, documentSettlement, documentTotal, isIssuedInvoice } from './finBusinessView.service.js';
import { checkVersion, journal } from './finOrganization.service.js';

/**
 * L'espace entreprise (P7-02) : accès à la base.
 *
 * Les calculs vivent dans finBusinessView.service.js, sans base ; ici on lit,
 * on écrit, et on refuse ce qui n'a pas de sens — en DISANT pourquoi, ce
 * qu'une violation de contrainte SQL ne saurait pas faire.
 *
 * P13-05, lot A (2026-11-23) : chaque fonction reçoit `ctx`, l'organisation
 * déjà RÉSOLUE et contrôlée (membre actif, rôle, mandat) par
 * `resolveOrganization`. Aucune route ne prend d'identifiant d'organisation
 * dans son adresse : l'organisation vient de l'en-tête et de l'appartenance
 * de la personne, jamais d'un identifiant qu'on pourrait changer.
 * Chaque écriture laisse une ligne au journal de l'organisation.
 *
 * P13-05, lot B (2026-11-23) : le cycle de facturation du client
 * (19_CYCLE_FACTURE) — devis, facture en brouillon puis émise avec son numéro,
 * avoir, relance, export. Un document émis ne se réécrit jamais : il se
 * corrige par un avoir (CNV-02).
 */

const activeFilter = { archivedAt: null, deletedAt: null };

export async function updateBusiness(prisma, ctx, body, ifMatch) {
  // If-Match (DEC-005) : une correction faite sur une version périmée est
  // refusée (412) plutôt que d'écraser celle de quelqu'un d'autre.
  checkVersion(ctx.business, ifMatch);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finBusiness.update({
      where: { id: ctx.business.id },
      // La version s'incrémente à chaque correction : le socle de P6-02 veut une
      // modification traçable, pas un écrasement silencieux.
      data: { ...body, version: { increment: 1 } },
    });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'organisation.updated', objectType: 'organisation', objectId: ctx.business.id, details: { fields: Object.keys(body) } });
    return updated;
  });
}

// ---- tiers ----------------------------------------------------------------

export async function listContacts(prisma, { business }, { kind } = {}) {
  return prisma.finBusinessContact.findMany({
    where: { businessId: business.id, ...(kind ? { kind } : {}), ...activeFilter },
    orderBy: { name: 'asc' },
  });
}

export async function createContact(prisma, ctx, body) {
  const { business } = ctx;
  if (!BUSINESS_CONTACT_KINDS.includes(body.kind)) {
    throw new HttpError(422, 'Unknown contact kind', { reason: 'unknownKind' });
  }
  return prisma.$transaction(async (tx) => {
    const contact = await tx.finBusinessContact.create({
      data: { businessId: business.id, ...body, source: 'declared', status: 'active' },
    });
    await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'contact.created', objectType: 'contact', objectId: contact.id, details: { kind: contact.kind, name: contact.name } });
    return contact;
  });
}

// ---- documents ------------------------------------------------------------

const documentInclude = {
  contact: { select: { id: true, name: true, kind: true, email: true, phone: true, address: true, taxId: true } },
  lines: { orderBy: { position: 'asc' }, select: { id: true, position: true, label: true, quantity: true, unitPrice: true, amount: true } },
  related: { select: { id: true, number: true, docType: true } },
  reminders: { orderBy: { sentAt: 'desc' }, select: { id: true, channel: true, sentAt: true, note: true, nextActionAt: true } },
};

const startOfToday = (now = new Date()) => new Date(now.toISOString().slice(0, 10));
const isExpired = (document, now = new Date()) =>
  document.docType === 'quote' && ['draft', 'sent', 'accepted'].includes(document.state) && Boolean(document.validUntil) && new Date(document.validUntil) < startOfToday(now);

/** Ce que l'API rend d'un document : la pièce, et ce qui en est DÉDUIT. */
function documentView(document, payments, documents) {
  const { reminders = [], ...rest } = document;
  const issued = isIssuedInvoice(document);
  return {
    ...rest,
    total: documentTotal(document),
    // L'état de règlement est TOUJOURS déduit, jamais stocké : un document que
    // l'on peut marquer « payé » à la main ment dès que quelqu'un se trompe.
    // Seule une facture émise en a un : un devis n'appelle aucun paiement.
    reglement: issued ? documentSettlement(document, payments, documents) : null,
    avoirs: issued
      ? creditNotesOf(document, documents).map((c) => ({ id: c.id, number: c.number, issuedAt: c.issuedAt, total: documentTotal(c) }))
      : [],
    expire: isExpired(document),
    relances: reminders,
  };
}

export async function listDocuments(prisma, { business }, { kind, docType, from, to } = {}) {
  const documents = await prisma.finBusinessDocument.findMany({
    where: {
      businessId: business.id,
      ...(kind ? { kind } : {}),
      ...(docType ? { docType } : {}),
      ...(from || to ? { issuedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      ...activeFilter,
    },
    orderBy: [{ issuedAt: 'desc' }, { createdAt: 'desc' }],
    include: documentInclude,
  });
  // Les avoirs d'une facture comptent pour son solde, quelle que soit la
  // période ou le type demandé.
  const creditNotes = await prisma.finBusinessDocument.findMany({
    where: { businessId: business.id, docType: 'credit_note', ...activeFilter },
  });
  const payments = await prisma.finBusinessPayment.findMany({
    where: { businessId: business.id, documentId: { in: documents.map((d) => d.id) }, ...activeFilter },
  });
  return documents.map((document) => documentView(document, payments, creditNotes));
}

async function findDocument(prisma, businessId, id) {
  const document = await prisma.finBusinessDocument.findFirst({ where: { id, businessId, ...activeFilter }, include: { lines: true } });
  if (!document) throw new HttpError(404, 'Document not found', { reason: 'documentNotFound' });
  return document;
}

/**
 * Le numéro suivant d'une séquence de l'organisation (FAC-003) :
 * FAC-2026-0001, DEV-2026-0001, AV-2026-0001. Seuls les documents que
 * l'organisation ÉMET en reçoivent un ; un achat garde celui du fournisseur.
 */
async function nextNumber(tx, businessId, docType, date) {
  const prefix = `${DOCUMENT_NUMBER_PREFIX[docType]}-${new Date(date).getUTCFullYear()}-`;
  const taken = await tx.finBusinessDocument.findMany({
    where: { businessId, kind: 'sale', docType, number: { startsWith: prefix } },
    select: { number: true },
  });
  const highest = taken.reduce((max, { number }) => Math.max(max, Number(number.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(highest + 1).padStart(4, '0')}`;
}

/**
 * Deux émissions simultanées peuvent viser le même numéro : l'unicité en base
 * en refuse une, qui est rejouée avec le numéro suivant. Un numéro saisi par
 * la personne n'est jamais rejoué : son doublon est une erreur à lui dire.
 */
async function withFreshNumber(work, numbered) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await work();
    } catch (err) {
      if (err?.code !== 'P2002') throw err;
      if (!numbered || attempt >= 4) throw new HttpError(409, 'This document number already exists', { reason: 'duplicateNumber' });
    }
  }
}

const linesData = (lines) =>
  lines.map((line, index) => ({
    position: index + 1,
    label: line.label,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    // En centimes entiers, comme tout montant du moteur.
    amount: Math.round(line.quantity * line.unitPrice),
  }));
const linesTotal = (rows) => rows.reduce((sum, row) => sum + row.amount, 0);

async function assertNumberFree(prisma, businessId, kind, docType, number) {
  const existing = await prisma.finBusinessDocument.findFirst({ where: { businessId, kind, docType, number } });
  if (existing) throw new HttpError(409, 'This document number already exists', { reason: 'duplicateNumber' });
}

export async function createDocument(prisma, ctx, body) {
  const { business } = ctx;
  const { docType = 'invoice', draft = false, lines, reglement, ...fields } = body;
  if (!BUSINESS_DOCUMENT_KINDS.includes(fields.kind)) {
    throw new HttpError(422, 'Unknown document kind', { reason: 'unknownKind' });
  }
  // La devise du document est celle de l'entreprise : le moteur ne convertit
  // jamais sans taux daté, et un tableau de bord mêlant deux devises ne
  // pourrait additionner rien du tout. Le refus le dit, plutôt que de laisser
  // une contrainte SQL parler à sa place.
  if (fields.currency !== business.currency) {
    throw new HttpError(422, 'A document uses the currency of its business', {
      reason: 'currencyMismatch',
      expected: business.currency,
    });
  }
  // FAC-001 : un devis s'adresse à un client et dit ce qu'il propose.
  if (docType === 'quote' && !fields.contactId) throw new HttpError(422, 'A quote needs its client', { reason: 'clientRequired' });
  if (docType === 'quote' && !lines) throw new HttpError(422, 'A quote needs its lines', { reason: 'linesRequired' });
  // Un achat est une pièce REÇUE : elle a déjà son numéro, celui du
  // fournisseur, et n'a pas de brouillon.
  if (fields.kind === 'purchase' && !fields.number) throw new HttpError(422, 'A purchase keeps its supplier number', { reason: 'supplierNumberRequired' });
  if (fields.kind === 'purchase' && draft) throw new HttpError(422, 'A purchase is received, not drafted', { reason: 'purchaseIsReceived' });
  if (fields.contactId) await assertContactBelongs(prisma, business.id, fields.contactId, fields.kind);
  if (fields.number) await assertNumberFree(prisma, business.id, fields.kind, docType, fields.number);
  // Lot C : une famille de dépense classe un achat, et sa nature (fixe ou
  // variable) vient de la famille quand la personne ne la précise pas.
  if ((fields.category || fields.costNature) && fields.kind !== 'purchase') {
    throw new HttpError(422, 'Only a purchase has an expense family', { reason: 'categoryForPurchases' });
  }
  if (fields.category && !fields.costNature) fields.costNature = DEFAULT_COST_NATURE[fields.category];
  // « Payée comptant » : la pièce et son règlement complet, en un seul geste
  // (une dépense de caisse, une vente au comptant). Seulement pour une pièce émise.
  if (reglement && (docType !== 'invoice' || draft)) {
    throw new HttpError(422, 'Only an issued invoice is paid', { reason: 'notIssued' });
  }
  if (reglement && new Date(reglement.receivedAt) < new Date(fields.issuedAt)) {
    throw new HttpError(422, 'A payment cannot predate its document', { reason: 'paymentBeforeIssue' });
  }

  const state = docType === 'quote' ? 'draft' : draft ? 'draft' : 'issued';
  // Une facture en brouillon attend son numéro jusqu'à l'émission ; un devis
  // en a un dès sa création (il s'envoie, il s'exporte).
  const numbered = !fields.number && !(docType === 'invoice' && state === 'draft');
  const rows = lines ? linesData(lines) : null;

  return withFreshNumber(
    () =>
      prisma.$transaction(async (tx) => {
        const number = fields.number ?? (numbered ? await nextNumber(tx, business.id, docType, fields.issuedAt) : null);
        const document = await tx.finBusinessDocument.create({
          data: {
            businessId: business.id,
            ...fields,
            number,
            docType,
            state,
            ...(rows ? { amountExcl: linesTotal(rows), lines: { create: rows } } : {}),
            source: 'declared',
            status: 'active',
          },
        });
        const action = docType === 'quote' ? 'quote.created' : state === 'draft' ? 'invoice.drafted' : 'document.created';
        await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action, objectType: 'document', objectId: document.id, details: { kind: document.kind, number: document.number } });
        if (reglement) {
          const total = documentTotal(document);
          if (total > 0) {
            const payment = await tx.finBusinessPayment.create({
              data: { businessId: business.id, documentId: document.id, value: total, currency: document.currency, receivedAt: reglement.receivedAt, method: reglement.method ?? null, source: 'declared', status: 'active' },
            });
            await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'payment.created', objectType: 'payment', objectId: payment.id, details: { document: document.number } });
          }
        }
        return document;
      }),
    numbered,
  );
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

const isEditable = (document) =>
  (document.docType === 'invoice' && document.state === 'draft') || (document.docType === 'quote' && ['draft', 'sent'].includes(document.state));

/**
 * Corriger un brouillon (facture en brouillon, devis pas encore accepté). Une
 * pièce émise ne se réécrit pas : elle se corrige par un avoir (CNV-02). Seul
 * son coût direct, qui n'est pas sur la pièce, peut toujours être complété.
 */
export async function updateDocument(prisma, ctx, id, body, ifMatch) {
  const { business } = ctx;
  const document = await findDocument(prisma, business.id, id);
  checkVersion(document, ifMatch);
  const fields = Object.keys(body);
  if (!isEditable(document) && fields.some((field) => field !== 'costExcl')) {
    throw new HttpError(409, 'An issued document is corrected by a credit note', { reason: 'documentIsFinal' });
  }
  if (body.contactId) await assertContactBelongs(prisma, business.id, body.contactId, document.kind);
  const merged = { ...document, ...body };
  if ((merged.dueAt && merged.dueAt < merged.issuedAt) || (merged.validUntil && merged.validUntil < merged.issuedAt)) {
    throw new HttpError(422, 'A due or validity date cannot precede the issue date', { reason: 'datesOutOfOrder' });
  }
  const { lines, ...rest } = body;
  const rows = lines ? linesData(lines) : null;
  if (document.docType === 'quote' && body.contactId === null) throw new HttpError(422, 'A quote needs its client', { reason: 'clientRequired' });

  return prisma.$transaction(async (tx) => {
    if (rows) await tx.finBusinessDocumentLine.deleteMany({ where: { documentId: document.id } });
    // Un document qui avait des lignes garde un hors taxe qui en est la somme.
    if (body.amountExcl !== undefined && document.lines.length > 0 && !rows) {
      await tx.finBusinessDocumentLine.deleteMany({ where: { documentId: document.id } });
    }
    const updated = await tx.finBusinessDocument.update({
      where: { id: document.id },
      data: {
        ...rest,
        ...(rows ? { amountExcl: linesTotal(rows), lines: { create: rows } } : {}),
        version: { increment: 1 },
      },
    });
    await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'document.updated', objectType: 'document', objectId: document.id, details: { number: document.number, fields } });
    return updated;
  });
}

/** Abandonner un brouillon. Il est archivé, pas effacé : le journal y renvoie. */
export async function discardDocument(prisma, ctx, id) {
  const { business } = ctx;
  const document = await findDocument(prisma, business.id, id);
  if (document.state !== 'draft') {
    throw new HttpError(409, 'An issued document is corrected by a credit note', { reason: 'documentIsFinal' });
  }
  await prisma.$transaction(async (tx) => {
    await tx.finBusinessDocument.update({ where: { id: document.id }, data: { archivedAt: new Date(), version: { increment: 1 } } });
    await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'document.discarded', objectType: 'document', objectId: document.id, details: { docType: document.docType, number: document.number } });
  });
}

// Les étapes du cycle : d'où l'on part, où l'on arrive (19_CYCLE_FACTURE).
const TRANSITIONS = {
  envoyer: { docType: 'quote', from: ['draft'], to: 'sent', action: 'quote.sent' },
  accepter: { docType: 'quote', from: ['draft', 'sent'], to: 'accepted', action: 'quote.accepted' },
  refuser: { docType: 'quote', from: ['draft', 'sent'], to: 'refused', action: 'quote.refused' },
  facturer: { docType: 'quote', from: ['accepted'], to: 'invoiced', action: 'quote.invoiced' },
  emettre: { docType: 'invoice', from: ['draft'], to: 'issued', action: 'invoice.issued' },
};
export const DOCUMENT_TRANSITIONS = Object.keys(TRANSITIONS);

/**
 * Faire avancer un document dans son cycle. Le changement d'état est
 * CONDITIONNEL en base (état et version attendus) : deux clics simultanés ne
 * facturent pas deux fois le même devis (« jamais d'impact à double »).
 */
export async function moveDocument(prisma, ctx, id, step, body = {}, ifMatch) {
  const { business } = ctx;
  const rule = TRANSITIONS[step];
  const document = await findDocument(prisma, business.id, id);
  checkVersion(document, ifMatch);
  if (document.docType !== rule.docType || !rule.from.includes(document.state)) {
    throw new HttpError(409, 'This step does not apply to this document now', { reason: 'invalidTransition', state: document.state });
  }
  // FAC-002 : un devis expiré ne s'accepte plus.
  if (step === 'accepter' && isExpired(document)) throw new HttpError(409, 'This quote has expired', { reason: 'quoteExpired' });

  const issuedAt = body.issuedAt ?? (step === 'facturer' ? startOfToday() : document.issuedAt);
  const dueAt = body.dueAt === undefined ? document.dueAt : body.dueAt;
  if (dueAt && dueAt < issuedAt) throw new HttpError(422, 'A due date cannot precede the issue date', { reason: 'datesOutOfOrder' });

  const claim = async (tx, extra = {}) => {
    const { count } = await tx.finBusinessDocument.updateMany({
      where: { id: document.id, state: document.state, version: document.version },
      data: { state: rule.to, ...extra, version: { increment: 1 } },
    });
    if (count === 0) throw new HttpError(409, 'Changed since you read it', { reason: 'stateChanged' });
  };

  if (step === 'facturer') {
    // Le devis accepté devient une facture EN BROUILLON, avec ses lignes : elle
    // se relit avant d'être émise et de créer la créance (FAC-002 → FAC-003).
    return prisma.$transaction(async (tx) => {
      await claim(tx);
      const invoice = await tx.finBusinessDocument.create({
        data: {
          businessId: business.id,
          kind: 'sale',
          docType: 'invoice',
          state: 'draft',
          number: null,
          relatedId: document.id,
          contactId: document.contactId,
          label: document.label,
          issuedAt,
          dueAt,
          amountExcl: document.amountExcl,
          taxAmount: document.taxAmount,
          costExcl: document.costExcl,
          currency: document.currency,
          note: document.note,
          lines: { create: document.lines.map(({ position, label, quantity, unitPrice, amount }) => ({ position, label, quantity, unitPrice, amount })) },
          source: 'declared',
          status: 'active',
        },
      });
      await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: rule.action, objectType: 'document', objectId: document.id, details: { number: document.number, invoice: invoice.id } });
      return invoice;
    });
  }

  if (step === 'emettre') {
    const numbered = !document.number;
    return withFreshNumber(
      () =>
        prisma.$transaction(async (tx) => {
          // Le numéro arrive AVEC l'émission : une facture émise sans numéro
          // n'existe pas, même un instant.
          const number = document.number ?? (await nextNumber(tx, business.id, 'invoice', issuedAt));
          await claim(tx, { number, issuedAt, dueAt });
          const issued = await tx.finBusinessDocument.findUnique({ where: { id: document.id } });
          await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: rule.action, objectType: 'document', objectId: document.id, details: { number } });
          return issued;
        }),
      numbered,
    );
  }

  return prisma.$transaction(async (tx) => {
    await claim(tx);
    await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: rule.action, objectType: 'document', objectId: document.id, details: { number: document.number } });
    return tx.finBusinessDocument.findUnique({ where: { id: document.id } });
  });
}

/**
 * Un avoir (FAC-007) : il corrige une facture émise sans la toucher. Jamais au
 * delà de ce qu'elle vaut encore, déduction faite des avoirs déjà émis ; s'il
 * dépasse ce qui reste dû parce qu'elle est déjà réglée, l'excédent est « à
 * rembourser » au client (E014), pas effacé.
 */
export async function createCreditNote(prisma, ctx, invoiceId, body) {
  const { business } = ctx;
  const invoice = await findDocument(prisma, business.id, invoiceId);
  if (!isIssuedInvoice(invoice)) throw new HttpError(409, 'A credit note corrects an issued invoice', { reason: 'notIssued' });
  if (new Date(body.issuedAt) < new Date(invoice.issuedAt)) {
    throw new HttpError(422, 'A credit note cannot predate its invoice', { reason: 'creditBeforeInvoice' });
  }
  if (invoice.kind === 'purchase' && !body.number) throw new HttpError(422, 'A supplier credit note keeps its number', { reason: 'supplierNumberRequired' });
  if (body.number) await assertNumberFree(prisma, business.id, invoice.kind, 'credit_note', body.number);

  const previous = await prisma.finBusinessDocument.findMany({ where: { businessId: business.id, docType: 'credit_note', relatedId: invoice.id, ...activeFilter } });
  const remaining = documentTotal(invoice) - previous.reduce((sum, c) => sum + documentTotal(c), 0);
  const amount = body.amountExcl + (body.taxAmount ?? 0);
  if (amount > remaining) {
    throw new HttpError(422, 'A credit note cannot exceed what the invoice is still worth', { reason: 'creditExceedsInvoice', max: remaining });
  }

  const numbered = !body.number;
  return withFreshNumber(
    () =>
      prisma.$transaction(async (tx) => {
        const number = body.number ?? (await nextNumber(tx, business.id, 'credit_note', body.issuedAt));
        const credit = await tx.finBusinessDocument.create({
          data: {
            businessId: business.id,
            kind: invoice.kind,
            docType: 'credit_note',
            state: 'issued',
            number,
            relatedId: invoice.id,
            contactId: invoice.contactId,
            label: body.label ?? invoice.label,
            issuedAt: body.issuedAt,
            amountExcl: body.amountExcl,
            taxAmount: body.taxAmount ?? 0,
            currency: invoice.currency,
            note: body.note ?? null,
            source: 'declared',
            status: 'active',
          },
        });
        await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'creditNote.issued', objectType: 'document', objectId: credit.id, details: { number, invoice: invoice.number } });
        return credit;
      }),
    numbered,
  );
}

// ---- règlements -----------------------------------------------------------

async function settlementOf(prisma, businessId, document) {
  const payments = await prisma.finBusinessPayment.findMany({ where: { businessId, documentId: document.id, ...activeFilter } });
  const credits = await prisma.finBusinessDocument.findMany({ where: { businessId, docType: 'credit_note', relatedId: document.id, ...activeFilter } });
  return documentSettlement(document, payments, credits);
}

export async function createPayment(prisma, ctx, documentId, body) {
  const { business } = ctx;
  const document = await findDocument(prisma, business.id, documentId);
  // FAC-001/FAC-003 : un devis ou un brouillon n'appelle aucun paiement ; un
  // avoir se règle par sa facture.
  if (!isIssuedInvoice(document)) throw new HttpError(409, 'Only an issued invoice is paid', { reason: 'notIssued' });

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

  const settlement = await settlementOf(prisma, business.id, document);
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

  return prisma.$transaction(async (tx) => {
    const payment = await tx.finBusinessPayment.create({
      data: { businessId: business.id, documentId, ...body, source: 'declared', status: 'active' },
    });
    await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'payment.created', objectType: 'payment', objectId: payment.id, details: { document: document.number } });
    return payment;
  });
}

// ---- relances (FAC-008) ---------------------------------------------------

export async function listReminders(prisma, { business }, documentId) {
  await findDocument(prisma, business.id, documentId);
  return prisma.finBusinessReminder.findMany({ where: { businessId: business.id, documentId }, orderBy: { sentAt: 'desc' } });
}

/**
 * Enregistrer une relance. FINCLUDIA n'envoie rien : la personne relance par
 * son propre canal, et l'historique dit quand, comment, et la prochaine
 * action. Aucun solde ne change.
 */
export async function createReminder(prisma, ctx, documentId, body) {
  const { business } = ctx;
  const document = await findDocument(prisma, business.id, documentId);
  if (!isIssuedInvoice(document) || document.kind !== 'sale') {
    throw new HttpError(409, 'Only an issued sale invoice is followed up', { reason: 'notIssued' });
  }
  const settlement = await settlementOf(prisma, business.id, document);
  if (settlement.outstanding <= 0) throw new HttpError(409, 'Nothing is due on this invoice', { reason: 'nothingDue' });
  const sentAt = body.sentAt ?? new Date();
  if (body.nextActionAt && body.nextActionAt < sentAt) {
    throw new HttpError(422, 'The next action follows the reminder', { reason: 'datesOutOfOrder' });
  }
  return prisma.$transaction(async (tx) => {
    const reminder = await tx.finBusinessReminder.create({
      data: { businessId: business.id, documentId, channel: body.channel, sentAt, note: body.note ?? null, nextActionAt: body.nextActionAt ?? null },
    });
    await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'reminder.recorded', objectType: 'document', objectId: document.id, details: { number: document.number, channel: body.channel } });
    return reminder;
  });
}

// ---- export (FAC-009) -----------------------------------------------------

const csvCell = (value) => {
  if (value === null || value === undefined) return '';
  const text = value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const toUnits = (minor) => (minor / 100).toFixed(2);

/**
 * Les pièces émises, en lignes de GESTION avec leurs identifiants, pour le
 * comptable de l'organisation. Ce ne sont pas des écritures comptables : la
 * correspondance avec le plan comptable (SCF) lui appartient (CNV-06), et
 * l'export ne clôt rien.
 */
export async function exportDocuments(prisma, ctx, { from, to } = {}) {
  const { business } = ctx;
  const all = await prisma.finBusinessDocument.findMany({
    where: { businessId: business.id, ...activeFilter },
    orderBy: [{ issuedAt: 'asc' }, { createdAt: 'asc' }],
    include: { contact: { select: { name: true } }, related: { select: { number: true } } },
  });
  const payments = await prisma.finBusinessPayment.findMany({ where: { businessId: business.id, ...activeFilter } });
  const inPeriod = (d) => (!from || d.issuedAt >= from) && (!to || d.issuedAt <= to);
  const rows = all.filter((d) => (isIssuedInvoice(d) || d.docType === 'credit_note') && inPeriod(d));

  const header = ['id', 'type', 'sens', 'numero', 'date', 'echeance', 'tiers', 'hors_taxe', 'taxe', 'total', 'devise', 'avoirs', 'regle', 'reste_du', 'piece_liee'];
  const lines = rows.map((d) => {
    const settlement = isIssuedInvoice(d) ? documentSettlement(d, payments, all) : null;
    return [
      d.id,
      d.docType === 'credit_note' ? 'avoir' : 'facture',
      d.kind === 'sale' ? 'vente' : 'achat',
      d.number,
      d.issuedAt,
      d.dueAt,
      d.contact?.name,
      toUnits(d.amountExcl),
      toUnits(d.taxAmount),
      toUnits(documentTotal(d)),
      d.currency,
      settlement ? toUnits(settlement.credited) : '',
      settlement ? toUnits(settlement.settled) : '',
      settlement ? toUnits(settlement.outstanding) : '',
      d.related?.number,
    ]
      .map(csvCell)
      .join(';');
  });

  await journal(prisma, { businessId: business.id, actorId: ctx.member.userId, action: 'documents.exported', objectType: 'organisation', objectId: business.id, details: { lignes: rows.length } });
  // BOM : un tableur ouvre alors les accents correctement.
  return `﻿${[header.join(';'), ...lines].join('\r\n')}\r\n`;
}

// ---- tableau de bord ------------------------------------------------------

async function pilotInputs(prisma, businessId) {
  const [documents, payments, moves, budgets, cashPositions] = await Promise.all([
    prisma.finBusinessDocument.findMany({ where: { businessId, ...activeFilter } }),
    prisma.finBusinessPayment.findMany({ where: { businessId, ...activeFilter } }),
    prisma.finBusinessStockMove.findMany({ where: { businessId } }),
    prisma.finBusinessBudget.findMany({ where: { businessId } }),
    prisma.finBusinessCashPosition.findMany({ where: { businessId } }),
  ]);
  return { documents, payments, moves, budgets, cashPositions };
}

export async function businessDashboard(prisma, { business }, { from, to } = {}) {
  const inputs = await pilotInputs(prisma, business.id);
  const { documents } = inputs;
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
    ...buildBusinessDashboard({ business, documents, payments, from, to }),
    // Lot C : les chiffres de pilotage, sur TOUS les règlements (un solde ne
    // dépend pas de la période regardée).
    pilotage: pilotFigures({ business, ...inputs, from, to }),
    // Les états que le contrat annonce et que nous ne produisons pas, nommés
    // avec ce qui manque. Un écran qui dirait seulement « indisponible » se
    // lirait comme une fonction oubliée plutôt que comme une donnée attendue.
    etatsNonProduits: BUSINESS_BLOCKED_STATEMENTS,
    avertissement: CASH_BASIS_NOTICE,
  };
}

// ---- lot C : trésorerie à 13 semaines ------------------------------------------

export async function businessCashPlan(prisma, { business }, { retardClients = 0 } = {}) {
  const inputs = await pilotInputs(prisma, business.id);
  return cashPlan({ business, ...inputs, clientDelayDays: retardClients });
}

export async function listCashPositions(prisma, { business }) {
  return prisma.finBusinessCashPosition.findMany({ where: { businessId: business.id }, orderBy: { observedAt: 'desc' }, take: 24 });
}

/** Un solde constaté : ce que l'organisation détient réellement, à une date. */
export async function createCashPosition(prisma, ctx, body) {
  const { business } = ctx;
  if (new Date(body.observedAt) > new Date()) throw new HttpError(422, 'A balance is observed, not foreseen', { reason: 'futureBalance' });
  return prisma.$transaction(async (tx) => {
    const position = await tx.finBusinessCashPosition.create({ data: { businessId: business.id, observedAt: body.observedAt, amount: body.amount, note: body.note ?? null } });
    await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'cash.observed', objectType: 'organisation', objectId: business.id, details: { observedAt: body.observedAt } });
    return position;
  });
}

// ---- lot C : budgets ------------------------------------------------------------

export async function listBudgets(prisma, { business }, { mois } = {}) {
  return prisma.finBusinessBudget.findMany({ where: { businessId: business.id, ...(mois ? { month: mois } : {}) }, orderBy: [{ month: 'asc' }, { category: 'asc' }] });
}

/** Fixer le budget d'une famille pour un mois (le remplacer s'il existe). */
export async function setBudget(prisma, ctx, body) {
  const { business } = ctx;
  return prisma.$transaction(async (tx) => {
    const budget = await tx.finBusinessBudget.upsert({
      where: { businessId_category_month: { businessId: business.id, category: body.category, month: body.month } },
      create: { businessId: business.id, category: body.category, month: body.month, amount: body.amount },
      update: { amount: body.amount, version: { increment: 1 } },
    });
    await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'budget.set', objectType: 'budget', objectId: budget.id, details: { category: body.category, month: body.month } });
    return budget;
  });
}

// ---- lot C : stock (CNV-16) -----------------------------------------------------

/**
 * Les articles et leurs lots. Les quantités pour tout rôle qui lit le stock ;
 * les VALEURS seulement pour qui lit les chiffres (DRT-007 : le magasinier ne
 * voit pas les montants).
 */
export async function listStock(prisma, ctx) {
  const { business } = ctx;
  const withValues = ctx.permissions.includes('finance.read');
  const items = await prisma.finBusinessItem.findMany({ where: { businessId: business.id, archivedAt: null }, orderBy: { name: 'asc' } });
  const moves = await prisma.finBusinessStockMove.findMany({ where: { businessId: business.id }, orderBy: { movedAt: 'asc' } });
  const lots = stockLots(moves);
  return items.map((item) => {
    const mine = lots.filter((lot) => lot.itemId === item.id);
    const strip = ({ totalCost, unitCost, value, ...rest }) => (withValues ? { ...rest, totalCost, unitCost, value } : rest);
    return {
      ...item,
      quantite: Math.round(mine.reduce((sum, lot) => sum + Math.max(0, lot.remaining), 0) * 1000) / 1000,
      ...(withValues ? { valeur: mine.some((lot) => lot.value !== null) ? mine.reduce((sum, lot) => sum + (lot.value ?? 0), 0) : null } : {}),
      lots: mine.map(strip),
    };
  });
}

export async function createItem(prisma, ctx, body) {
  const { business } = ctx;
  const existing = await prisma.finBusinessItem.findFirst({ where: { businessId: business.id, name: body.name } });
  if (existing) throw new HttpError(409, 'This item already exists', { reason: 'duplicateItem' });
  return prisma.$transaction(async (tx) => {
    const item = await tx.finBusinessItem.create({ data: { businessId: business.id, name: body.name, unit: body.unit, reference: body.reference ?? null } });
    await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'item.created', objectType: 'item', objectId: item.id, details: { name: item.name } });
    return item;
  });
}

/**
 * Un mouvement de stock. Une entrée crée un lot (quantité reçue, coût total).
 * Une perte ou une sortie nomme son lot, et ne prend jamais plus que ce qu'il
 * en reste : un stock négatif est une erreur de saisie, pas un stock.
 */
export async function createStockMove(prisma, ctx, body) {
  const { business } = ctx;
  const item = await prisma.finBusinessItem.findFirst({ where: { id: body.itemId, businessId: business.id, archivedAt: null } });
  if (!item) throw new HttpError(404, 'Item not found', { reason: 'itemNotFound' });
  if (body.documentId) await findDocument(prisma, business.id, body.documentId);

  if (body.kind === 'in') {
    if (body.totalCost === undefined || body.totalCost === null) throw new HttpError(422, 'A lot has its total cost', { reason: 'lotCostRequired' });
    if (body.lotId) throw new HttpError(422, 'An entry is a lot of its own', { reason: 'entryHasNoLot' });
  } else {
    if (body.totalCost !== undefined && body.totalCost !== null) throw new HttpError(422, 'Only an entry carries a cost', { reason: 'costOnEntryOnly' });
    if (!body.lotId) throw new HttpError(422, 'Say which lot it comes from', { reason: 'lotRequired' });
    const lot = await prisma.finBusinessStockMove.findFirst({ where: { id: body.lotId, businessId: business.id, itemId: item.id, kind: 'in' } });
    if (!lot) throw new HttpError(404, 'Lot not found', { reason: 'lotNotFound' });
    if (new Date(body.movedAt) < new Date(lot.movedAt)) throw new HttpError(422, 'A movement cannot predate its lot', { reason: 'moveBeforeLot' });
    const drawn = await prisma.finBusinessStockMove.findMany({ where: { lotId: lot.id } });
    const [state] = stockLots([lot, ...drawn]);
    if (body.quantity > state.remaining) {
      throw new HttpError(422, 'More than what is left of this lot', { reason: 'notEnoughStock', remaining: state.remaining });
    }
  }

  return prisma.$transaction(async (tx) => {
    const move = await tx.finBusinessStockMove.create({
      data: {
        businessId: business.id,
        itemId: item.id,
        kind: body.kind,
        quantity: body.quantity,
        movedAt: body.movedAt,
        lotId: body.kind === 'in' ? null : body.lotId,
        lotRef: body.kind === 'in' ? (body.lotRef ?? null) : null,
        totalCost: body.kind === 'in' ? body.totalCost : null,
        documentId: body.documentId ?? null,
        note: body.note ?? null,
      },
    });
    await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: `stock.${body.kind}`, objectType: 'item', objectId: item.id, details: { quantity: body.quantity } });
    return move;
  });
}

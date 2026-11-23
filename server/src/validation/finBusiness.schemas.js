import { z } from 'zod';
import { MAX_STORED_AMOUNT } from './finData.schemas.js';
import {
  BUSINESS_CONTACT_KINDS,
  BUSINESS_DOCUMENT_KINDS,
  BUSINESS_LEGAL_FORMS,
  BUSINESS_PAYMENT_METHODS,
  COST_NATURES,
  EXPENSE_CATEGORIES,
  REMINDER_CHANNELS,
  STOCK_MOVE_KINDS,
} from '../constants/finBusiness.js';
import { MANDATE_SCOPES, ORGANIZATION_PUBLICS, ORGANIZATION_ROLES } from '../constants/finOrganization.js';

// Entrées de l'espace entreprise (P7-02). Mêmes conventions que le reste du
// moteur : montants entiers en centimes, devise obligatoire, champ inconnu
// refusé plutôt qu'ignoré.
//
// Les identifiants fiscaux (NIF, RC, NIS) sont des chaînes libres bornées, et
// c'est délibéré : nous n'avons pas la règle officielle de composition, et un
// format inventé refuserait des entreprises réelles.

const amount = z.number().int().min(0).max(MAX_STORED_AMOUNT);
const positiveAmount = z.number().int().positive().max(MAX_STORED_AMOUNT);
const currency = z.string().regex(/^[A-Z]{3}$/);
const shortText = (max) => z.string().trim().min(1).max(max);
const optionalText = (max) => z.string().trim().max(max).optional().nullable();
const isoDate = z.coerce.date();

export const createBusinessSchema = z
  .object({
    name: shortText(160),
    // P13-05 (ECR-0162 to ECR-0164): the organisation as the client describes it.
    tradeName: optionalText(160),
    publicKey: z.enum(ORGANIZATION_PUBLICS).optional().nullable(),
    sector: optionalText(160),
    wilaya: optionalText(60),
    legalForm: z.enum(BUSINESS_LEGAL_FORMS).optional().nullable(),
    taxId: optionalText(40),
    tradeRegister: optionalText(40),
    statisticalId: optionalText(40),
    activity: optionalText(160),
    currency,
    fiscalYearStartMonth: z.number().int().min(1).max(12).optional(),
  })
  .strict();

export const updateBusinessSchema = createBusinessSchema.partial().strict();

// P13-05, lot A: members, mandates.
const futureDate = isoDate.refine((date) => date > new Date(), { message: 'Must be in the future' });
export const inviteMemberSchema = z
  .object({
    email: z.string().trim().email().max(254),
    role: z.enum(ORGANIZATION_ROLES),
    expiresAt: futureDate.optional().nullable(),
  })
  .strict();

export const updateMemberSchema = z
  .object({
    role: z.enum(ORGANIZATION_ROLES).optional(),
    expiresAt: futureDate.optional().nullable(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to change' });

export const grantMandateSchema = z
  .object({
    memberId: z.string().uuid(),
    scope: z.enum(MANDATE_SCOPES),
    purpose: shortText(200),
    startsAt: isoDate.optional(),
    endsAt: isoDate.optional().nullable(),
  })
  .strict()
  .refine((body) => !body.endsAt || body.endsAt > (body.startsAt ?? new Date()), { message: 'The end follows the start', path: ['endsAt'] });

export const createContactSchema = z
  .object({
    kind: z.enum(BUSINESS_CONTACT_KINDS),
    name: shortText(160),
    taxId: optionalText(40),
    email: z.string().trim().email().max(254).optional().nullable(),
    phone: optionalText(40),
    address: optionalText(300),
    country: z.string().regex(/^[A-Z]{2}$/).optional().nullable(),
    note: optionalText(300),
  })
  .strict();

export const contactQuerySchema = z.object({ kind: z.enum(BUSINESS_CONTACT_KINDS).optional() }).strict();

// P13-05, lot B : ce qu'un devis ou une facture vend. La quantité peut être
// décimale (1,5 heure) ; le prix unitaire hors taxe est en centimes.
const lineSchema = z
  .object({
    label: shortText(200),
    quantity: z.number().positive().max(1_000_000).refine((q) => Math.round(q * 1000) === q * 1000, { message: 'At most three decimals' }),
    unitPrice: amount,
  })
  .strict();
const lines = z.array(lineSchema).min(1).max(100);

const datesInOrder = (doc) => (!doc.dueAt || !doc.issuedAt || doc.dueAt >= doc.issuedAt) && (!doc.validUntil || !doc.issuedAt || doc.validUntil >= doc.issuedAt);

export const createDocumentSchema = z
  .object({
    // Lot B : un devis ou une facture ; un avoir passe par sa facture.
    docType: z.enum(['quote', 'invoice']).optional(),
    kind: z.enum(BUSINESS_DOCUMENT_KINDS),
    // Facultatif pour ce que l'organisation émet : FINCLUDIA attribue alors le
    // numéro suivant (FAC-003). Obligatoire pour un achat : c'est celui du
    // fournisseur.
    number: shortText(40).optional(),
    // Une facture en brouillon ne crée aucune créance tant qu'elle n'est pas émise.
    draft: z.boolean().optional(),
    label: shortText(200),
    contactId: z.string().uuid().optional().nullable(),
    issuedAt: isoDate,
    dueAt: isoDate.optional().nullable(),
    validUntil: isoDate.optional().nullable(),
    // Hors taxe et taxe sont déclarés tous les deux. Aucun taux de TVA n'est
    // appliqué ici : le taux appartient au document réel, et le projet
    // n'invente pas de règle fiscale. Avec des lignes, le hors taxe est leur
    // somme, et il n'est pas saisi en plus.
    lines: lines.optional(),
    amountExcl: amount.optional(),
    taxAmount: amount.optional(),
    // Coûts directs hors taxe, pour la marge indicative (E012).
    costExcl: amount.optional().nullable(),
    // Lot C : la famille et la nature d'un achat.
    category: z.enum(EXPENSE_CATEGORIES).optional().nullable(),
    costNature: z.enum(COST_NATURES).optional().nullable(),
    // Lot C : réglée en totalité à l'enregistrement (caisse, comptant).
    reglement: z
      .object({ receivedAt: isoDate, method: z.enum(BUSINESS_PAYMENT_METHODS).optional().nullable() })
      .strict()
      .optional(),
    currency,
    note: optionalText(300),
  })
  .strict()
  .refine(datesInOrder, { message: 'A due or validity date cannot precede the issue date', path: ['dueAt'] })
  .refine((doc) => (doc.lines === undefined) !== (doc.amountExcl === undefined), {
    message: 'Either lines or an amount excluding tax',
    path: ['amountExcl'],
  })
  .refine((doc) => doc.docType !== 'quote' || doc.kind === 'sale', { message: 'A quote is a sale', path: ['kind'] });

// Un brouillon se corrige ; un document émis ne se réécrit plus (CNV-02).
// Le coût direct, lui, n'est pas sur la pièce : il se complète à tout moment.
export const updateDocumentSchema = z
  .object({
    label: shortText(200).optional(),
    contactId: z.string().uuid().optional().nullable(),
    issuedAt: isoDate.optional(),
    dueAt: isoDate.optional().nullable(),
    validUntil: isoDate.optional().nullable(),
    lines: lines.optional(),
    amountExcl: amount.optional(),
    taxAmount: amount.optional(),
    costExcl: amount.optional().nullable(),
    note: optionalText(300),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to change' })
  .refine((body) => body.lines === undefined || body.amountExcl === undefined, { message: 'Either lines or an amount excluding tax', path: ['amountExcl'] });

// Émettre une facture en brouillon (FAC-003), ou facturer un devis accepté.
export const issueDocumentSchema = z
  .object({
    issuedAt: isoDate.optional(),
    dueAt: isoDate.optional().nullable(),
  })
  .strict();

// Un avoir (FAC-007) : toujours sur une facture émise, jamais au-delà de ce
// qu'elle vaut encore.
export const createCreditNoteSchema = z
  .object({
    number: shortText(40).optional(),
    label: shortText(200).optional(),
    issuedAt: isoDate,
    amountExcl: amount,
    taxAmount: amount.optional(),
    note: optionalText(300),
  })
  .strict()
  .refine((body) => body.amountExcl + (body.taxAmount ?? 0) > 0, { message: 'A credit note is not zero', path: ['amountExcl'] });

// Une relance (FAC-008) : préparée par FINCLUDIA, envoyée par la personne.
export const createReminderSchema = z
  .object({
    channel: z.enum(REMINDER_CHANNELS),
    sentAt: isoDate.optional(),
    note: optionalText(300),
    nextActionAt: isoDate.optional().nullable(),
  })
  .strict();

export const documentQuerySchema = z
  .object({
    kind: z.enum(BUSINESS_DOCUMENT_KINDS).optional(),
    docType: z.enum(['quote', 'invoice', 'credit_note']).optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
  })
  .strict();

export const createPaymentSchema = z
  .object({
    value: positiveAmount,
    currency,
    receivedAt: isoDate,
    method: z.enum(BUSINESS_PAYMENT_METHODS).optional().nullable(),
    note: optionalText(300),
  })
  .strict();

export const dashboardQuerySchema = z.object({ from: isoDate.optional(), to: isoDate.optional() }).strict();

// ---- lot C (P13-05) : stock, budgets, trésorerie ---------------------------------

export const createItemSchema = z
  .object({
    name: shortText(160),
    unit: shortText(20),
    reference: optionalText(60),
  })
  .strict();

const quantity = z.number().positive().max(1_000_000_000).refine((q) => Math.round(q * 1000) === q * 1000, { message: 'At most three decimals' });

export const createStockMoveSchema = z
  .object({
    itemId: z.string().uuid(),
    kind: z.enum(STOCK_MOVE_KINDS),
    quantity,
    movedAt: isoDate,
    // Une entrée : son repère de lot et son coût total (achat et frais).
    lotRef: optionalText(60),
    totalCost: amount.optional().nullable(),
    // Une perte ou une sortie : le lot d'où elle vient.
    lotId: z.string().uuid().optional().nullable(),
    documentId: z.string().uuid().optional().nullable(),
    note: optionalText(300),
  })
  .strict();

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export const setBudgetSchema = z
  .object({
    category: z.enum(EXPENSE_CATEGORIES),
    month,
    amount,
  })
  .strict();

export const budgetQuerySchema = z.object({ mois: month.optional() }).strict();

export const createCashPositionSchema = z
  .object({
    observedAt: isoDate,
    // Un découvert est un solde aussi : négatif permis.
    amount: z.number().int().min(-MAX_STORED_AMOUNT).max(MAX_STORED_AMOUNT),
    note: optionalText(300),
  })
  .strict();

export const cashPlanQuerySchema = z
  .object({
    // Scénario : les clients paient N jours plus tard (CNV-12, rien n'est créé).
    retardClients: z.coerce.number().int().min(0).max(365).optional(),
  })
  .strict();

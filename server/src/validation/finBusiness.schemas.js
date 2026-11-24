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
import { ABSENCE_KINDS, CAMPAIGN_CHECKS, CAMPAIGN_INSTRUMENTS, CAMPAIGN_STATUSES, CONTRACTS, PARTNER_REQUEST_STATUSES, PARTNER_TYPES, SHAREABLE_ITEMS } from '../services/finLotG.service.js';
import { FORUM_CATEGORIES, REPORT_REASONS } from '../services/forum.service.js';
import { ASSET_CATEGORIES, LEDGER_JOURNALS } from '../constants/finEmployerRules.js';
import { CANDIDATE_STAGES, TRAINING_STATUSES, VACANCY_STATUSES } from '../services/finStaff.service.js';
import { HOLDING_CATEGORIES, HOLDING_KINDS, PROJECT_NATURES, PROJECT_STATUSES, SHARE_ACCESS, VALUATION_MODES } from '../constants/finDiaspora.js';
import { INCOTERM_CODES, OPERATION_COST_KINDS, OPERATION_KINDS, OPERATION_STATUSES, PIECE_KINDS, PIECE_STATUSES } from '../constants/finTrade.js';

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
    // Lot D : l'opération internationale à laquelle la pièce appartient.
    operationId: z.string().uuid().optional().nullable(),
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

// ---- lot D (P13-05) : micro-importation et commerce international ------------------

const country = z.string().regex(/^[A-Z]{2}$/);

export const createOperationSchema = z
  .object({
    kind: z.enum(OPERATION_KINDS),
    reference: shortText(40).optional(),
    label: shortText(200),
    country,
    counterpartyId: z.string().uuid().optional().nullable(),
    currency,
    // DEC-017 : un Incoterm avec sa version et son lieu nommé.
    incoterm: z.enum(INCOTERM_CODES).optional().nullable(),
    incotermVersion: z
      .string()
      .regex(/^\d{4}$/)
      .optional()
      .nullable(),
    namedPlace: optionalText(120),
    itemId: z.string().uuid().optional().nullable(),
    quantityOrdered: z.number().positive().max(1_000_000_000).optional().nullable(),
    plannedAt: isoDate.optional().nullable(),
    note: optionalText(300),
  })
  .strict();

export const updateOperationSchema = z
  .object({
    label: shortText(200).optional(),
    status: z.enum(OPERATION_STATUSES).optional(),
    counterpartyId: z.string().uuid().optional().nullable(),
    incoterm: z.enum(INCOTERM_CODES).optional().nullable(),
    incotermVersion: z
      .string()
      .regex(/^\d{4}$/)
      .optional()
      .nullable(),
    namedPlace: optionalText(120),
    itemId: z.string().uuid().optional().nullable(),
    quantityOrdered: z.number().positive().max(1_000_000_000).optional().nullable(),
    plannedAt: isoDate.optional().nullable(),
    note: optionalText(300),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to change' });

export const operationCostSchema = z
  .object({
    kind: z.enum(OPERATION_COST_KINDS),
    label: optionalText(200),
    // En unités mineures de SA devise (centimes d'euro, de dinar…).
    amount,
    currency,
    // DEC-015 : combien d'unités de la devise de l'organisation pour une unité de celle du coût.
    rate: z.number().positive().max(1_000_000).optional().nullable(),
    rateDate: isoDate.optional().nullable(),
    rateSource: optionalText(120),
    paidAt: isoDate.optional().nullable(),
  })
  .strict();

export const operationPieceSchema = z.object({ kind: z.enum(PIECE_KINDS), status: z.enum(PIECE_STATUSES), reference: optionalText(80), note: optionalText(300) }).strict();

export const operationReceptionSchema = z
  .object({ receivedAt: isoDate, quantityReceived: z.number().positive().max(1_000_000_000), quantityDamaged: z.number().min(0).max(1_000_000_000).optional(), itemId: z.string().uuid().optional(), lotRef: optionalText(60), note: optionalText(300) })
  .strict();

export const operationScenarioSchema = z
  .object({ variation: z.coerce.number().min(-0.9).max(5), prixVente: z.coerce.number().int().min(0).max(MAX_STORED_AMOUNT).optional(), fraisVente: z.coerce.number().int().min(0).max(MAX_STORED_AMOUNT).optional() })
  .strict();

// ---- lot E (P13-05) : diaspora ------------------------------------------------------

const rateFields = { rate: z.number().positive().max(1_000_000).optional().nullable(), rateDate: isoDate.optional().nullable(), rateSource: optionalText(120) };

export const createProjectSchema = z
  .object({
    name: shortText(160),
    nature: z.enum(PROJECT_NATURES),
    location: optionalText(160),
    managerName: optionalText(160),
    budget: amount,
    currency,
    fundsConfirmed: amount.optional(),
    targetAt: isoDate.optional().nullable(),
    note: optionalText(300),
  })
  .strict();

export const updateProjectSchema = z
  .object({
    name: shortText(160).optional(),
    nature: z.enum(PROJECT_NATURES).optional(),
    location: optionalText(160),
    managerName: optionalText(160),
    budget: amount.optional(),
    fundsConfirmed: amount.optional(),
    targetAt: isoDate.optional().nullable(),
    status: z.enum(PROJECT_STATUSES).optional(),
    note: optionalText(300),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to change' });

export const createMilestoneSchema = z.object({ label: shortText(200), weight: z.number().int().min(1).max(100), dueAt: isoDate.optional().nullable() }).strict();

// The body of a step: a proof, a note, a payment date — each step reads what it needs.
export const stepBodySchema = z.object({ proofRef: optionalText(160), note: optionalText(300), paidAt: isoDate.optional() }).strict();

export const createExpenseSchema = z.object({ label: shortText(200), supplier: optionalText(160), amount, currency, ...rateFields, spentAt: isoDate, proofRef: optionalText(160) }).strict();

export const projectShareSchema = z.object({ memberId: z.string().uuid(), access: z.enum(SHARE_ACCESS), purpose: shortText(200), endsAt: futureDate.optional().nullable() }).strict();

export const holdingValueSchema = z.object({ value: amount, valuedAt: isoDate, mode: z.enum(VALUATION_MODES), ...rateFields, proofRef: optionalText(160) }).strict();

export const createHoldingSchema = z
  .object({
    kind: z.enum(HOLDING_KINDS),
    category: z.enum(HOLDING_CATEGORIES),
    label: shortText(160),
    country: z.string().regex(/^[A-Z]{2}$/),
    currency,
    value: amount,
    valuedAt: isoDate,
    mode: z.enum(VALUATION_MODES),
    ...rateFields,
    proofRef: optionalText(160),
  })
  .strict();

// ---- lot F (P13-05) : simulateurs, recherche, copilote -------------------------------

// The inputs of a simulator: numbers only, by name; the simulator says which it needs.
export const simulationSchema = z.object({ inputs: z.record(z.string().max(40), z.number().finite().nullable()).refine((r) => Object.keys(r).length <= 20, { message: 'Too many inputs' }) }).strict();

export const searchQuerySchema = z.object({ q: z.string().trim().min(2).max(80) }).strict();

export const copilotSchema = z
  .object({
    question: z.string().trim().max(300).optional(),
    intent: z.string().max(40).optional(),
    params: z
      .object({ clientId: z.string().uuid().optional(), number: z.string().max(40).optional() })
      .strict()
      .optional(),
  })
  .strict()
  .refine((body) => body.question || body.intent, { message: 'A question or an intent' });

// ---- lot G (P13-05) : partenaires, personnel, financement participatif, forum ---------

export const offerQuerySchema = z.object({ type: z.enum(PARTNER_TYPES).optional(), wilaya: z.string().trim().max(60).optional() }).strict();

export const partnerRequestSchema = z
  .object({
    offerId: z.string().uuid(),
    motive: shortText(300),
    amount: amount.optional().nullable(),
    message: z.string().trim().max(3000).optional().nullable(),
    sharedItems: z.array(z.enum(SHAREABLE_ITEMS)).max(SHAREABLE_ITEMS.length).optional(),
    // ECR-0161: sent only after confirmation, with consent.
    consent: z.literal(true),
  })
  .strict();

export const employeeSchema = z
  .object({
    fullName: shortText(160),
    position: shortText(120),
    department: optionalText(120),
    contract: z.enum(CONTRACTS),
    managerName: optionalText(160),
    startedAt: isoDate,
    endedAt: isoDate.optional().nullable(),
    leaveRightsPerYear: z.number().min(0).max(366).optional(),
    leaveCarryOver: z.number().min(0).max(366).optional(),
    // Lot G, second part: the payroll conditions (ECR-0265).
    employeeNumber: optionalText(30),
    baseSalary: amount.optional().nullable(),
    partTime: z.boolean().optional(),
  })
  .strict();

export const updateEmployeeSchema = employeeSchema
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to change' });

export const hrQuerySchema = z.object({ from: isoDate.optional(), to: isoDate.optional() }).strict();

export const absenceSchema = z.object({ kind: z.enum(ABSENCE_KINDS), startsAt: isoDate, endsAt: isoDate, days: z.number().positive().max(366), note: optionalText(300) }).strict();

export const campaignSchema = z
  .object({
    name: shortText(160),
    instrument: z.enum(CAMPAIGN_INSTRUMENTS),
    target: positiveAmount,
    currency,
    preMoney: amount.optional().nullable(),
    startsAt: isoDate.optional().nullable(),
    endsAt: isoDate.optional().nullable(),
    platformName: optionalText(160),
    risks: z.string().trim().max(3000).optional().nullable(),
  })
  .strict();

export const updateCampaignSchema = z
  .object({
    name: shortText(160).optional(),
    target: positiveAmount.optional(),
    preMoney: amount.optional().nullable(),
    startsAt: isoDate.optional().nullable(),
    endsAt: isoDate.optional().nullable(),
    platformName: optionalText(160),
    platformAuthorization: optionalText(160),
    platformChecked: z.boolean().optional(),
    risks: z.string().trim().max(3000).optional().nullable(),
    status: z.enum(CAMPAIGN_STATUSES).optional(),
    check: z
      .object({ key: z.enum(CAMPAIGN_CHECKS), done: z.boolean() })
      .strict()
      .optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to change' });

export const commitmentSchema = z.object({ amount: positiveAmount, declaredAt: isoDate, source: shortText(160) }).strict();

export const forumQuerySchema = z.object({ category: z.enum(FORUM_CATEGORIES).optional(), q: z.string().trim().max(80).optional() }).strict();

export const forumThreadSchema = z.object({ category: z.enum(FORUM_CATEGORIES), title: shortText(200), body: z.string().trim().min(10).max(5000), consent: z.literal(true) }).strict();

export const forumReplySchema = z.object({ body: z.string().trim().min(2).max(5000) }).strict();

export const forumReportSchema = z.object({ threadId: z.string().uuid().optional(), postId: z.string().uuid().optional(), reason: z.enum(REPORT_REASONS), note: optionalText(300) }).strict();

export const partnerOfferSchema = z
  .object({
    partnerName: shortText(160),
    partnerType: z.enum(PARTNER_TYPES),
    title: shortText(200),
    description: z.string().trim().min(1).max(5000),
    authorization: optionalText(160),
    verifiedAt: isoDate.optional().nullable(),
    wilayas: z.array(z.string().trim().min(1).max(60)).max(58).optional(),
    publics: z.array(z.enum(ORGANIZATION_PUBLICS)).max(10).optional(),
    conditions: z.string().trim().max(5000).optional().nullable(),
    fees: optionalText(300),
    sourceUrl: z.string().trim().url().max(300).optional().nullable(),
    contactEmail: z.string().trim().email().max(254).optional().nullable(),
    validUntil: isoDate.optional().nullable(),
    active: z.boolean().optional(),
  })
  .strict();

export const updatePartnerOfferSchema = partnerOfferSchema.partial().strict();

export const partnerRequestStatusSchema = z.object({ status: z.enum(PARTNER_REQUEST_STATUSES), note: optionalText(300) }).strict();

export const forumDecisionSchema = z.object({ decision: z.enum(['kept', 'removed']), note: optionalText(300) }).strict();
export const forumHeldSchema = z.object({ publish: z.boolean() }).strict();

// ---- lot G, second part: payroll and accounting ----------------------------------------------
const period = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const payVariables = { baseSalary: amount.optional(), overtime: amount.optional(), bonuses: amount.optional(), nonContributable: amount.optional(), absenceDeduction: amount.optional(), netDeductions: amount.optional(), irregularBonuses: amount.optional() };
export const payslipSchema = z.object({ ...payVariables, partTime: z.boolean().optional() }).strict();
export const payslipUpdateSchema = z
  .object({ ...payVariables, note: optionalText(300) })
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to change' });
export const payrollConditionsSchema = z
  .object({ employeeNumber: optionalText(30), socialNumber: optionalText(30), baseSalary: amount.nullable().optional(), partTime: z.boolean().optional() })
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to change' });
export const payrollRunSchema = z.object({ period }).strict();

const accountCode = z
  .string()
  .trim()
  .regex(/^[1-7][0-9]{1,9}$/);
const ledgerLine = z.object({ account: accountCode, label: optionalText(200), debit: amount.optional(), credit: amount.optional() }).strict();
export const ledgerEntrySchema = z.object({ journal: z.enum(LEDGER_JOURNALS), number: optionalText(40), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), label: shortText(200), lines: z.array(ledgerLine).min(2).max(200) }).strict();
export const ledgerEntryUpdateSchema = ledgerEntrySchema.partial().strict();
export const ledgerQuerySchema = z
  .object({
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    journal: z.enum(LEDGER_JOURNALS).optional(),
    status: z.enum(['draft', 'validated']).optional(),
    account: z
      .string()
      .regex(/^[1-7][0-9]{0,9}$/)
      .optional(),
  })
  .strict();
const fileContent = z.string().min(1).max(2_000_000);
export const ledgerImportSchema = z.object({ content: fileContent, apply: z.boolean().optional() }).strict();
export const ledgerChartSchema = z.object({ content: fileContent }).strict();
export const ledgerAccountSchema = z.object({ code: accountCode, label: shortText(160) }).strict();
export const ledgerMappingSchema = z.object({ account: accountCode.nullable().or(z.literal('')) }).strict();
export const ledgerPeriodSchema = z.object({ reason: optionalText(300) }).strict();
export const ledgerBankCheckSchema = z.object({ account: accountCode, checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), statementBalance: z.number().int().min(-MAX_STORED_AMOUNT).max(MAX_STORED_AMOUNT), note: optionalText(300) }).strict();

// ---- lot H: payroll access, HR, fixed assets, bank ----------------------------------------------
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}/);
export const payrollAccessSchema = z.object({ email: z.string().trim().email().max(254).nullable() }).strict();
export const yearQuerySchema = z.object({ year: z.coerce.number().int().min(2000).max(2100).optional() }).strict();
export const staffQuerySchema = z.object({ month: period.optional() }).strict();
export const timesheetSchema = z.object({ workedOn: day, hours: z.number().min(0).max(24), overtimeHours: z.number().min(0).max(24).optional(), note: optionalText(300) }).strict();
export const skillSchema = z.object({ skill: shortText(120), level: z.number().int().min(1).max(4) }).strict();
export const trainingSchema = z.object({ title: shortText(160), provider: optionalText(160), employeeId: z.string().uuid().optional().nullable(), plannedAt: day, cost: amount.optional().nullable() }).strict();
export const trainingStatusSchema = z.object({ status: z.enum(TRAINING_STATUSES) }).strict();
export const vacancySchema = z.object({ title: shortText(160), department: optionalText(120), contract: z.enum(CONTRACTS), openedAt: day }).strict();
export const vacancyStatusSchema = z.object({ status: z.enum(VACANCY_STATUSES) }).strict();
export const candidateSchema = z.object({ fullName: shortText(160), note: optionalText(300) }).strict();
export const candidateStageSchema = z.object({ stage: z.enum(CANDIDATE_STAGES), note: optionalText(300) }).strict();
export const assetSchema = z
  .object({ label: shortText(160), category: z.enum(Object.keys(ASSET_CATEGORIES)), account: accountCode.optional(), acquiredAt: day, cost: positiveAmount, durationMonths: z.number().int().min(1).max(1200).optional() })
  .strict();
export const assetDisposalSchema = z.object({ disposedAt: day }).strict();
export const bankQuerySchema = z.object({ account: accountCode.optional() }).strict();
export const bankStatementSchema = z.object({ account: accountCode, content: fileContent }).strict();
export const bankMatchSchema = z.object({ lineId: z.string().uuid().nullable() }).strict();

import { z } from 'zod';
import { FREQUENCIES } from '../constants/finance.js';
import { CLEARING_STATES, PAYMENT_METHODS, TRANSACTION_KINDS, TRANSACTION_SORTS, TRANSACTIONS_MAX_PAGE_SIZE, TRANSFER_KINDS } from '../constants/finMoney.js';
import { amountSchema, consentUsesSchema, currencySchema, reasonSchema, scopeSchema, statusSchema } from './finData.schemas.js';

// "Mon argent" (P6-04). The vocabularies come from the constants, so what the
// database refuses and what validation refuses are the same lists.

const label = z.string().trim().min(1).max(80);
const isoDate = z.coerce.date();
// An amount is positive here: the SIGN is carried by `kind` (income / expense).
// A negative "expense" would mean the same thing twice and make every total
// depend on which convention the caller happened to use.
const positiveAmount = amountSchema.min(0);

export const createIncomeSchema = z
  .object({
    label,
    categoryId: z.string().uuid().nullable().optional(),
    value: positiveAmount,
    currency: currencySchema,
    // Mandatory, and no default: the client's own error case for screen ET01 is
    // a missing frequency, and defaulting to monthly would turn a yearly grant
    // into twelve times itself.
    frequency: z.enum(FREQUENCIES),
    startDate: isoDate,
    endDate: isoDate.nullable().optional(),
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    // Only ever used to declare a teaching/fictional row. Everything else is
    // decided by the server.
    status: z.enum(['declared', 'fictional']).optional(),
  })
  .strict()
  .refine((body) => !body.endDate || body.endDate >= body.startDate, { message: 'endDate is before startDate', path: ['endDate'] });

export const updateIncomeSchema = z
  .object({
    label: label.optional(),
    categoryId: z.string().uuid().nullable().optional(),
    value: positiveAmount.optional(),
    currency: currencySchema.optional(),
    frequency: z.enum(FREQUENCIES).optional(),
    startDate: isoDate.optional(),
    endDate: isoDate.nullable().optional(),
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

export const createTransactionSchema = z
  .object({
    kind: z.enum(TRANSACTION_KINDS),
    // Optional: none chosen means the « Espèces » account (PB-PR-04).
    accountId: z.string().uuid().optional(),
    tagId: z.string().uuid().nullable().optional(),
    payer: z.string().trim().min(1).max(80).nullable().optional(),
    place: z.string().trim().min(1).max(120).nullable().optional(),
    value: positiveAmount,
    currency: currencySchema,
    occurredAt: isoDate,
    // Null is a real answer: "transactions non catégorisées à part" is one of
    // the client's own screens, so an uncategorised movement is accepted.
    categoryId: z.string().uuid().nullable().optional(),
    subcategory: z.string().trim().min(1).max(60).nullable().optional(),
    paymentMethod: z.enum(PAYMENT_METHODS).nullable().optional(),
    note: z.string().trim().min(1).max(300).nullable().optional(),
    shared: z.boolean().optional(),
    planned: z.boolean().optional(),
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    status: z.enum(['real', 'declared', 'fictional']).optional(),
  })
  .strict();

export const updateTransactionSchema = z
  .object({
    kind: z.enum(TRANSACTION_KINDS).optional(),
    accountId: z.string().uuid().optional(),
    tagId: z.string().uuid().nullable().optional(),
    payer: z.string().trim().min(1).max(80).nullable().optional(),
    place: z.string().trim().min(1).max(120).nullable().optional(),
    value: positiveAmount.optional(),
    currency: currencySchema.optional(),
    occurredAt: isoDate.optional(),
    categoryId: z.string().uuid().nullable().optional(),
    subcategory: z.string().trim().min(1).max(60).nullable().optional(),
    paymentMethod: z.enum(PAYMENT_METHODS).nullable().optional(),
    note: z.string().trim().min(1).max(300).nullable().optional(),
    shared: z.boolean().optional(),
    planned: z.boolean().optional(),
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

// « Doublon suspect demandé en confirmation » (P8-07): the same fields as an
// entry, checked BEFORE anything is written.
export const duplicateCheckSchema = z
  .object({
    kind: z.enum(TRANSACTION_KINDS),
    value: positiveAmount,
    currency: currencySchema,
    occurredAt: isoDate,
    categoryId: z.string().uuid().nullable().optional(),
  })
  .strict();

export const clearingSchema = z.object({ clearing: z.enum(CLEARING_STATES) }).strict();

export const clearingQuerySchema = z.object({ from: isoDate.optional(), to: isoDate.optional() }).strict();

const tagName = z.string().trim().min(1).max(40);
const tagColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const createTagSchema = z
  .object({ name: tagName, color: tagColor, autoCategoryId: z.string().uuid().nullable().optional() })
  .strict();

export const updateTagSchema = z
  .object({
    name: tagName.optional(),
    color: tagColor.optional(),
    autoCategoryId: z.string().uuid().nullable().optional(),
    archived: z.boolean().optional(),
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

export const archiveSchema = z.object({ archived: z.boolean(), reason: reasonSchema.optional() }).strict();
export const deleteSchema = z.object({ reason: reasonSchema.optional() }).strict();

// A query-string boolean: "true"/"false" only, so a typo is refused instead of
// being read as false and silently changing what the person sees.
const queryBoolean = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional();

// The filters of screen C08. `status` and `source` are the socle vocabularies:
// the client lists both among the filters.
export const historyQuerySchema = z
  .object({
    text: z.string().trim().min(1).max(120).optional(),
    kind: z.enum([...TRANSACTION_KINDS, ...TRANSFER_KINDS]).optional(),
    accountId: z.string().uuid().optional(),
    tagId: z.string().uuid().optional(),
    clearing: z.enum(CLEARING_STATES).optional(),
    tab: z.enum(['transfers']).optional(),
    status: statusSchema.optional(),
    source: z.enum(['manual', 'imported', 'document', 'partner', 'computed']).optional(),
    scope: scopeSchema.optional(),
    categoryId: z.string().uuid().optional(),
    uncategorised: queryBoolean,
    shared: queryBoolean,
    planned: queryBoolean,
    from: isoDate.optional(),
    to: isoDate.optional(),
    minAmount: z.coerce.number().int().min(0).optional(),
    maxAmount: z.coerce.number().int().min(0).optional(),
    sort: z.enum(TRANSACTION_SORTS).optional(),
    page: z.coerce.number().int().min(1).max(10000).optional(),
    pageSize: z.coerce.number().int().min(1).max(TRANSACTIONS_MAX_PAGE_SIZE).optional(),
  })
  .strict()
  .refine((query) => !query.from || !query.to || query.to >= query.from, { message: 'to is before from', path: ['to'] })
  .refine((query) => query.minAmount === undefined || query.maxAmount === undefined || query.maxAmount >= query.minAmount, {
    message: 'maxAmount is below minAmount',
    path: ['maxAmount'],
  });

// The synthesis of one period (screen C05). No period = the current month.
export const synthesisQuerySchema = z
  .object({ from: isoDate.optional(), to: isoDate.optional() })
  .strict()
  .refine((query) => Boolean(query.from) === Boolean(query.to), { message: 'A period needs both ends' })
  .refine((query) => !query.from || query.to >= query.from, { message: 'to is before from', path: ['to'] });

// Revenus vs dépenses sur plusieurs mois (P6-23). Bornes mêmes que le contrôleur
// (2 à 12) : ici pour que la requête soit refusée avant d'atteindre le service,
// pas seulement écrêtée en silence.
export const moneyHistoryQuerySchema = z.object({ months: z.coerce.number().int().min(2).max(12).optional() }).strict();

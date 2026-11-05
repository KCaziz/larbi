import { z } from 'zod';
import { BUDGET_RECURRENCES, ENVELOPE_KINDS, MAX_ALERT_THRESHOLDS, MAX_PROPOSAL_MONTHS } from '../constants/finBudget.js';
import { amountSchema, consentUsesSchema, currencySchema, reasonSchema, scopeSchema } from './finData.schemas.js';
import { POCKET_RULES } from '../constants/finBudgetMethods.js';

// Budgets and envelopes (P6-05). The vocabularies come from the constants, so
// what the database refuses and what validation refuses are the same lists.

const label = z.string().trim().min(1).max(80);
const note = z.string().trim().min(1).max(300).nullable().optional();
const isoDate = z.coerce.date();
// A planned amount is positive: an envelope IS an allocation, so a negative one
// would mean the opposite of itself.
const plannedAmount = amountSchema.min(0);

// Alert thresholds, as ratios (0.8 = 80 %). Bounded above 0 and at most 5 of
// them: they are compared against a consumption rate, and a threshold of 0
// would fire on an envelope nobody has touched.
const alertThresholdsSchema = z
  .array(z.number().positive().max(10))
  .min(1)
  .max(MAX_ALERT_THRESHOLDS)
  .refine((list) => new Set(list).size === list.length, { message: 'The same threshold is listed twice' });

// The person's pocket for a client category group (tab 12B, editable).
const methodMappingSchema = z.record(z.string().trim().min(1).max(60), z.enum(POCKET_RULES)).refine((value) => Object.keys(value).length <= 40, { message: 'Too many groups' });

// The optional methods' analysis (P8-09).
export const methodQuerySchema = z.object({ methode: z.enum(['M-01', 'M-02', 'M-03', 'M-04']) }).strict();

const envelopeFields = {
  // A sub-category OR a client category group (« Logement »…, P8-09): one of
  // the two, checked by the service.
  categoryId: z.string().uuid().nullable().optional(),
  categoryGroup: z.string().trim().min(1).max(60).nullable().optional(),
  kind: z.enum(ENVELOPE_KINDS),
  value: plannedAmount,
  // The optional « plafond » of the client's own wording. Null is "no ceiling",
  // which is different from a ceiling equal to the planned amount.
  cap: plannedAmount.nullable().optional(),
  recurring: z.boolean().optional(),
  note,
};

export const createBudgetSchema = z
  .object({
    label,
    periodStart: isoDate,
    periodEnd: isoDate,
    currency: currencySchema,
    recurrence: z.enum(BUDGET_RECURRENCES).optional(),
    alertThresholds: alertThresholdsSchema.optional(),
    carryOver: z.boolean().optional(),
    carryOverspend: z.boolean().optional(),
    methodMapping: methodMappingSchema.optional(),
    note,
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    // Only ever used to declare a teaching/fictional budget (P6-03's mode).
    status: z.enum(['declared', 'fictional']).optional(),
    // The first envelopes, in the same call: screens JA03 / JA04 are ONE
    // allocation plan, not a budget followed by a series of writes.
    envelopes: z.array(z.object(envelopeFields).strict()).max(60).optional(),
  })
  .strict()
  .refine((body) => body.periodEnd > body.periodStart, { message: 'A period ends after it starts', path: ['periodEnd'] })
  .refine((body) => (body.envelopes ?? []).every((envelope) => envelope.cap === null || envelope.cap === undefined || envelope.cap >= envelope.value), {
    message: 'A cap is not below the planned amount',
    path: ['envelopes'],
  });

export const updateBudgetSchema = z
  .object({
    label: label.optional(),
    periodStart: isoDate.optional(),
    periodEnd: isoDate.optional(),
    currency: currencySchema.optional(),
    recurrence: z.enum(BUDGET_RECURRENCES).optional(),
    alertThresholds: alertThresholdsSchema.optional(),
    carryOver: z.boolean().optional(),
    carryOverspend: z.boolean().optional(),
    methodMapping: methodMappingSchema.optional(),
    note,
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

export const createEnvelopeSchema = z.object(envelopeFields).strict().refine(
  (body) => body.cap === null || body.cap === undefined || body.cap >= body.value,
  { message: 'A cap is not below the planned amount', path: ['cap'] },
);

export const updateEnvelopeSchema = z
  .object({
    categoryId: z.string().uuid().nullable().optional(),
    categoryGroup: z.string().trim().min(1).max(60).nullable().optional(),
    kind: z.enum(ENVELOPE_KINDS).optional(),
    value: plannedAmount.optional(),
    cap: plannedAmount.nullable().optional(),
    recurring: z.boolean().optional(),
    note,
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

export const duplicateBudgetSchema = z.object({ label: label.optional() }).strict();

// The view of one budget. `at` lets a caller ask "as of this moment", which the
// tests need and which a period selector will use; it is NOT a filter on the
// data, only the instant the projection is computed from.
export const budgetViewQuerySchema = z.object({ at: isoDate.optional() }).strict();

// The proposed distribution. `months` is the observation window; `currency`
// decides which rows are comparable, because nothing is ever converted.
export const proposalQuerySchema = z
  .object({
    months: z.coerce.number().int().min(1).max(MAX_PROPOSAL_MONTHS).optional(),
    currency: currencySchema.optional(),
    to: isoDate.optional(),
  })
  .strict();

import { z } from 'zod';
import { CALENDAR_MAX_DAYS, CALENDAR_VIEWS, MAX_REMINDER_DAYS, MAX_REMINDER_DAY_VALUE } from '../constants/finCalendar.js';
import { FREQUENCIES } from '../constants/finance.js';
import { TRANSACTION_KINDS } from '../constants/finMoney.js';
import { amountSchema, consentUsesSchema, currencySchema, reasonSchema, scopeSchema } from './finData.schemas.js';

// Tab 08B: how an occurrence becomes real, and the weekend rule (PB-F021).
const CREATION_MODES = ['confirm', 'auto_real', 'planned'];
const WEEKEND_RULES = ['previous', 'next', 'none'];

// Calendar, recurrences and provisions (P6-07). The vocabularies come from the
// constants, so what the database refuses and what validation refuses are the
// same lists.

const label = z.string().trim().min(1).max(80);
const note = z.string().trim().min(1).max(300).nullable().optional();
const isoDate = z.coerce.date();
// An amount is positive: the direction is carried by `kind`, exactly as for a
// movement (P6-04).
const positiveAmount = amountSchema.min(0);

// Days before the due date to remind. « J-7 / J-1 configurables » — a bounded
// list of distinct positive days, because each one becomes a reminder and the
// same day twice would mean two identical reminders.
// P8-11 adds « J » (0) and « J+1 » (-1) to the days before.
const reminderDaysSchema = z
  .array(z.number().int().min(-1).max(MAX_REMINDER_DAY_VALUE))
  .max(MAX_REMINDER_DAYS)
  .refine((list) => new Set(list).size === list.length, { message: 'The same reminder day is listed twice' });

export const createRecurrenceSchema = z
  .object({
    label,
    categoryId: z.string().uuid().nullable().optional(),
    kind: z.enum(TRANSACTION_KINDS),
    value: positiveAmount,
    currency: currencySchema,
    // Mandatory, like a resource's (P6-04): a recurrence without a frequency is
    // not a recurrence, and defaulting to monthly would turn a yearly insurance
    // premium into twelve times itself.
    frequency: z.enum(FREQUENCIES),
    nextDate: isoDate,
    endDate: isoDate.nullable().optional(),
    reminderDays: reminderDaysSchema.optional(),
    accountId: z.string().uuid().nullable().optional(),
    creationMode: z.enum(CREATION_MODES).optional(),
    weekendRule: z.enum(WEEKEND_RULES).optional(),
    note,
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    status: z.enum(['declared', 'fictional']).optional(),
  })
  .strict()
  .refine((body) => !body.endDate || body.endDate >= body.nextDate, { message: 'endDate is before nextDate', path: ['endDate'] });

export const updateRecurrenceSchema = z
  .object({
    label: label.optional(),
    categoryId: z.string().uuid().nullable().optional(),
    kind: z.enum(TRANSACTION_KINDS).optional(),
    value: positiveAmount.optional(),
    currency: currencySchema.optional(),
    frequency: z.enum(FREQUENCIES).optional(),
    nextDate: isoDate.optional(),
    endDate: isoDate.nullable().optional(),
    reminderDays: reminderDaysSchema.optional(),
    accountId: z.string().uuid().nullable().optional(),
    creationMode: z.enum(CREATION_MODES).optional(),
    weekendRule: z.enum(WEEKEND_RULES).optional(),
    note,
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

// Confirming a detected candidate. `detected` is NOT accepted from the caller:
// the server sets it, because it is the trace of where the row came from.
export const confirmRecurrenceSchema = createRecurrenceSchema;

export const createProvisionSchema = z
  .object({
    label,
    categoryId: z.string().uuid().nullable().optional(),
    // A provision for nothing is not a provision: the expense has an amount.
    value: amountSchema.min(1),
    currency: currencySchema,
    provisioned: positiveAmount.optional(),
    targetDate: isoDate,
    reminderDays: reminderDaysSchema.optional(),
    note,
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    status: z.enum(['declared', 'fictional']).optional(),
  })
  .strict()
  .refine((body) => (body.provisioned ?? 0) <= body.value, { message: 'More has been set aside than the expense itself', path: ['provisioned'] });

export const updateProvisionSchema = z
  .object({
    label: label.optional(),
    categoryId: z.string().uuid().nullable().optional(),
    value: amountSchema.min(1).optional(),
    currency: currencySchema.optional(),
    provisioned: positiveAmount.optional(),
    targetDate: isoDate.optional(),
    reminderDays: reminderDaysSchema.optional(),
    note,
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

// « Marquer payé ». The date and the amount may both differ from the plan — what
// was actually paid is what counts — and neither is required.
export const markPaidSchema = z
  .object({ occurredAt: isoDate.optional(), value: positiveAmount.optional(), reason: reasonSchema.optional() })
  .strict();

// A whole number of centimes arriving in a query string, which is always text.
// `amountSchema` refuses a string on purpose (a body must send a real number);
// a query parameter has to be coerced, and a value that is not a whole number
// is still refused rather than rounded.
const queryAmount = z.coerce.number().int().safe();

// The calendar of a period. `solde` is the DECLARED opening balance: FINCLUDIA
// holds no account balance, so without it the projected cash is not computed
// rather than started from an imaginary zero. It may be negative — somebody may
// well be in the red, and refusing to say so would be the wrong answer.
// « Confirmer, Modifier, Pas reçu, Reporter » (tab 02, step P2).
export const occurrenceSchema = z
  .object({
    recurrenceId: z.string().uuid(),
    dueDate: isoDate,
    action: z.enum(['confirm', 'modify', 'missed', 'postpone']),
    value: positiveAmount.min(1).optional(),
    occurredAt: isoDate.optional(),
    postponedTo: isoDate.optional(),
  })
  .strict();

export const calendarQuerySchema = z
  .object({
    from: isoDate.optional(),
    to: isoDate.optional(),
    vue: z.enum(CALENDAR_VIEWS).optional(),
    currency: currencySchema.optional(),
    solde: queryAmount.optional(),
    seuilTension: queryAmount.optional(),
  })
  .strict()
  .refine((query) => Boolean(query.from) === Boolean(query.to), { message: 'A period needs both ends' })
  .refine((query) => !query.from || query.to >= query.from, { message: 'to is before from', path: ['to'] })
  .refine((query) => !query.from || (query.to - query.from) / 86_400_000 <= CALENDAR_MAX_DAYS, {
    message: 'The period is too long to project day by day',
    path: ['to'],
  });

// ALG-04's parameters, exposed so the detection is never a black box: the
// person can widen the tolerance or ask for more occurrences and see what
// changes.
export const detectionQuerySchema = z
  .object({
    currency: currencySchema.optional(),
    amountTolerance: z.coerce.number().min(0).max(1).optional(),
    intervalDays: z.coerce.number().int().min(1).max(400).optional(),
    intervalToleranceDays: z.coerce.number().int().min(0).max(60).optional(),
    minimumOccurrences: z.coerce.number().int().min(2).max(24).optional(),
  })
  .strict();

// « Plan du mois » (SA03): copy the planned movements of the month before.
export const copyPlanSchema = z.object({ month: isoDate, currency: currencySchema.optional() }).strict();

export const subscriptionsQuerySchema = z.object({ currency: currencySchema.optional() }).strict();

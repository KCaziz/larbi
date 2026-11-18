import { z } from 'zod';
import { ACCOUNT_TYPE_IDS } from '../constants/finAccounts.js';
import { amountSchema, currencySchema, reasonSchema } from './finData.schemas.js';

// Accounts and transfers (P8-03). The fields are those of the client's tab
// `04B_Champs_Comptes`; the vocabularies come from the constants, so what the
// database refuses and what validation refuses are the same lists.

const label = z.string().trim().min(1).max(80);
const isoDate = z.coerce.date();
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/);
// An opening balance may be negative (an overdrawn current account); every
// other amount here is positive.
const positiveAmount = amountSchema.min(0);

export const createAccountSchema = z
  .object({
    label,
    type: z.enum(ACCOUNT_TYPE_IDS),
    currency: currencySchema,
    openingBalance: amountSchema.optional(),
    openingDate: isoDate.optional(),
    includeInTotal: z.boolean().optional(),
    includeInNetWorth: z.boolean().optional(),
    color: hexColor.nullable().optional(),
    icon: z.string().trim().min(1).max(16).nullable().optional(),
    minBalanceAlert: amountSchema.nullable().optional(),
    maxBalanceInfo: amountSchema.nullable().optional(),
    overdraftAllowed: positiveAmount.nullable().optional(),
    note: z.string().trim().min(1).max(300).nullable().optional(),
  })
  .strict();

// The currency and the type are not corrected: they decide how every past
// movement on the account reads. A wrong one is fixed by a new account.
export const updateAccountSchema = z
  .object({
    label: label.optional(),
    openingBalance: amountSchema.optional(),
    openingDate: isoDate.optional(),
    includeInTotal: z.boolean().optional(),
    includeInNetWorth: z.boolean().optional(),
    color: hexColor.nullable().optional(),
    icon: z.string().trim().min(1).max(16).nullable().optional(),
    minBalanceAlert: amountSchema.nullable().optional(),
    maxBalanceInfo: amountSchema.nullable().optional(),
    overdraftAllowed: positiveAmount.nullable().optional(),
    note: z.string().trim().min(1).max(300).nullable().optional(),
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

export const archiveAccountSchema = z.object({ archived: z.boolean(), reason: reasonSchema.optional() }).strict();

export const accountsQuerySchema = z
  .object({ includeArchived: z.enum(['true', 'false']).transform((value) => value === 'true').optional() })
  .strict();

export const createTransferSchema = z
  .object({
    fromAccountId: z.string().uuid(),
    toAccountId: z.string().uuid(),
    value: positiveAmount.min(1),
    // The transfer's fees, if any: recorded as an expense of the source account.
    fee: positiveAmount.min(1).nullable().optional(),
    occurredAt: isoDate,
    note: z.string().trim().min(1).max(300).nullable().optional(),
    planned: z.boolean().optional(),
  })
  .strict();

// Recette R10-10: `jours` asks for one point per day (the last N days), so
// movements of the current month show on the curve instead of melting into
// one monthly point.
export const balanceHistoryQuerySchema = z.object({ months: z.coerce.number().int().min(2).max(24).optional(), jours: z.coerce.number().int().min(7).max(92).optional() }).strict();

// Recette R10-09: the money in and out of ONE account over a period.
export const accountFlowQuerySchema = z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional() }).strict();

export const deleteTransferSchema = z.object({ reason: reasonSchema.optional() }).strict();

// The monthly report (P8-10): a month as `YYYY-MM`, and the download format.
const monthKey = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
// `reduction`: the share of flexible spending the person imagines cutting (R-06), 0 to 100.
export const reportQuerySchema = z.object({ mois: monthKey.optional(), reduction: z.coerce.number().min(0).max(100).optional(), accountId: z.string().uuid().optional() }).strict();
// « comparer deux mois »: both are required, and they must differ.
export const reportCompareQuerySchema = z.object({ mois: monthKey, avec: monthKey }).strict().refine((q) => q.mois !== q.avec, { message: 'Two different months' });
export const reportExportQuerySchema = z.object({ mois: monthKey.optional(), format: z.enum(['csv', 'xlsx']).optional() }).strict();

// P10-05 — an official rate (Banque d'Algérie) recorded by an administrator:
// how many dinars for one unit, on a reference date.
export const exchangeRateSchema = z
  .object({
    currency: z.enum(['EUR', 'USD', 'GBP', 'CAD']),
    rate: z.number().positive().max(100000),
    referenceDate: z.coerce.date(),
    source: z.string().trim().min(1).max(200),
  })
  .strict();

// Recette R10-08: deleting an account is said out loud (`confirm: true`).
export const deleteAccountSchema = z.object({ confirm: z.literal(true), reason: reasonSchema.optional() }).strict();

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

export const balanceHistoryQuerySchema = z.object({ months: z.coerce.number().int().min(2).max(24).optional() }).strict();

export const deleteTransferSchema = z.object({ reason: reasonSchema.optional() }).strict();

// The monthly report (P8-10): a month as `YYYY-MM`, and the download format.
const monthKey = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
export const reportQuerySchema = z.object({ mois: monthKey.optional() }).strict();
export const reportExportQuerySchema = z.object({ mois: monthKey.optional(), format: z.enum(['csv', 'xlsx']).optional() }).strict();

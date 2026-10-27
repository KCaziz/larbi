import { z } from 'zod';
import { DEBT_STRATEGIES } from '../constants/finDebt.js';
import { amountSchema, consentUsesSchema, currencySchema, reasonSchema, scopeSchema } from './finData.schemas.js';

const label = z.string().trim().min(1).max(80);
const shortText = z.string().trim().min(1).max(120).nullable().optional();
const note = z.string().trim().min(1).max(300).nullable().optional();
const isoDate = z.coerce.date();
const positiveAmount = amountSchema.min(0);
const rate = z.number().min(0).max(1);

export const createDebtSchema = z
  .object({
    label,
    lender: shortText,
    purpose: z.string().trim().min(1).max(200).nullable().optional(),
    assetFinanced: shortText,
    outstandingPrincipal: positiveAmount,
    monthlyInstalment: positiveAmount,
    currency: currencySchema,
    rate: rate.nullable().optional(),
    knownTotalCost: positiveAmount.nullable().optional(),
    dueDate: isoDate.nullable().optional(),
    debtType: z.enum(['D-01', 'D-02', 'D-03', 'D-04', 'D-05']).nullable().optional(),
    note,
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    status: z.enum(['declared', 'fictional']).optional(),
  })
  .strict();

export const updateDebtSchema = z
  .object({
    label: label.optional(),
    lender: shortText,
    purpose: z.string().trim().min(1).max(200).nullable().optional(),
    assetFinanced: shortText,
    outstandingPrincipal: positiveAmount.optional(),
    monthlyInstalment: positiveAmount.optional(),
    currency: currencySchema.optional(),
    rate: rate.nullable().optional(),
    knownTotalCost: positiveAmount.nullable().optional(),
    dueDate: isoDate.nullable().optional(),
    debtType: z.enum(['D-01', 'D-02', 'D-03', 'D-04', 'D-05']).nullable().optional(),
    note,
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

export const createDebtPaymentSchema = z
  // `accountId` (P8-13): the person's account the payment leaves (or, for a
  // receivable, arrives on) — the payment is then a real transfer.
  .object({ amount: amountSchema.min(1), currency: currencySchema, paidAt: isoDate, accountId: z.string().uuid().optional(), note })
  .strict();

export const payoffQuerySchema = z
  .object({ extraPayment: z.coerce.number().int().min(0).max(100_000_000).optional(), strategy: z.enum(DEBT_STRATEGIES).optional() })
  .strict();

// « J'ai prêté » / « On m'a prêté » (P8-13, D-01 / D-02): the loan and its
// real movement, in one call.
export const simpleLoanSchema = z
  .object({
    direction: z.enum(['lent', 'borrowed']),
    counterparty: z.string().trim().min(1).max(60),
    accountId: z.string().uuid(),
    value: amountSchema.min(1),
    occurredAt: isoDate,
    dueDate: isoDate.nullable().optional(),
    monthlyInstalment: amountSchema.min(0).optional(),
    note,
  })
  .strict();

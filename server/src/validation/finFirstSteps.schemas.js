import { z } from 'zod';
import { FREQUENCIES } from '../constants/finance.js';
import { FIRST_STEPS } from '../services/finFirstSteps.service.js';
import { amountSchema, currencySchema } from './finData.schemas.js';

// « Premiers pas » (P8-23).
export const stepSchema = z.object({ step: z.enum(FIRST_STEPS), skipped: z.boolean() }).strict();

// P1: the first income. The next date stands for « jour habituel » and for the
// start date at once: a salary received on the 25th starts on its next 25th.
export const firstIncomeSchema = z
  .object({
    label: z.string().trim().min(1).max(80),
    categoryId: z.string().uuid().nullable().optional(),
    value: amountSchema.min(1),
    currency: currencySchema,
    frequency: z.enum(FREQUENCIES),
    nextDate: z.coerce.date(),
    accountId: z.string().uuid().nullable().optional(),
    weekendRule: z.enum(['previous', 'next', 'none']).optional(),
    autoCredit: z.boolean().optional(),
  })
  .strict();

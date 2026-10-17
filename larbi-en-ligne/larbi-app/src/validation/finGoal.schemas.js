import { z } from 'zod';
import { GOAL_TEMPLATE_KEYS } from '../constants/finGoal.js';
import { amountSchema, consentUsesSchema, currencySchema, reasonSchema, scopeSchema } from './finData.schemas.js';

const label = z.string().trim().min(1).max(80);
const note = z.string().trim().min(1).max(300).nullable().optional();
const isoDate = z.coerce.date();
const targetAmount = amountSchema.min(1);
const allocatedAmount = amountSchema.min(0);
// A ratio (0.05 = 5 %), bounded generously: nothing in the client's catalogue
// needs more, and an unbounded rate would let a typo blow up the trajectory.
const annualRate = z.number().min(0).max(1);

export const createGoalSchema = z
  .object({
    label,
    templateKey: z.enum(GOAL_TEMPLATE_KEYS).nullable().optional(),
    target: targetAmount,
    currency: currencySchema,
    targetDate: isoDate.nullable().optional(),
    allocated: allocatedAmount.optional(),
    monthlyContribution: allocatedAmount.nullable().optional(),
    rate: annualRate.nullable().optional(),
    priority: z.number().int().min(0).max(100).optional(),
    note,
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    status: z.enum(['declared', 'fictional']).optional(),
  })
  .strict();

export const updateGoalSchema = z
  .object({
    label: label.optional(),
    templateKey: z.enum(GOAL_TEMPLATE_KEYS).nullable().optional(),
    target: targetAmount.optional(),
    currency: currencySchema.optional(),
    targetDate: isoDate.nullable().optional(),
    allocated: allocatedAmount.optional(),
    monthlyContribution: allocatedAmount.nullable().optional(),
    rate: annualRate.nullable().optional(),
    priority: z.number().int().min(0).max(100).optional(),
    note,
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

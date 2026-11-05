import { z } from 'zod';
import { GOAL_PROGRESS_STATUSES } from '../constants/finGoal.js';
import { GOAL_TEMPLATE_KEYS } from '../constants/finGoal.js';
import { amountSchema, consentUsesSchema, currencySchema, reasonSchema, scopeSchema } from './finData.schemas.js';

const label = z.string().trim().min(1).max(80);
// « Autre objectif » (answer D1): its own icon (an emoji) and colour.
const icon = z.string().trim().min(1).max(16).nullable().optional();
const color = z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional();
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
    icon,
    color,
    target: targetAmount,
    currency: currencySchema,
    targetDate: isoDate.nullable().optional(),
    allocated: allocatedAmount.optional(),
    monthlyContribution: allocatedAmount.nullable().optional(),
    // P8-12: « en cours / atteint / en pause / arrêté », and the goal's own
    // account (a contribution is then a transfer to it).
    progressStatus: z.enum(GOAL_PROGRESS_STATUSES).optional(),
    accountId: z.string().uuid().nullable().optional(),
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
    icon,
    color,
    target: targetAmount.optional(),
    currency: currencySchema.optional(),
    targetDate: isoDate.nullable().optional(),
    allocated: allocatedAmount.optional(),
    monthlyContribution: allocatedAmount.nullable().optional(),
    // P8-12: « en cours / atteint / en pause / arrêté », and the goal's own
    // account (a contribution is then a transfer to it).
    progressStatus: z.enum(GOAL_PROGRESS_STATUSES).optional(),
    accountId: z.string().uuid().nullable().optional(),
    rate: annualRate.nullable().optional(),
    priority: z.number().int().min(0).max(100).optional(),
    note,
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

// A real contribution (P8-12): a transfer from one of the person's accounts.
export const goalContributionSchema = z
  .object({ fromAccountId: z.string().uuid(), value: allocatedAmount.min(1), occurredAt: z.coerce.date(), note: z.string().trim().min(1).max(300).nullable().optional() })
  .strict();

// A scenario (C11): the person's own parameters, all optional, all bounded.
export const goalScenarioSchema = z
  .object({
    monthlyContribution: allocatedAmount.optional(),
    months: z.number().int().min(1).max(600).optional(),
    inflation: z.number().min(0).max(1).optional(),
    rate: z.number().min(-0.5).max(1).optional(),
    annualIncrease: z.number().min(0).max(1).optional(),
  })
  .strict();

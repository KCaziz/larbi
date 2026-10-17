import { z } from 'zod';
import { amountSchema, currencySchema, reasonSchema } from './finData.schemas.js';

const label = z.string().trim().min(1).max(80);
const note = z.string().trim().min(1).max(300).nullable().optional();
const isoDate = z.coerce.date();
const target = amountSchema.min(1);

export const createSpaceGoalSchema = z
  .object({ label, target, currency: currencySchema, targetDate: isoDate.nullable().optional(), note })
  .strict();

export const updateSpaceGoalSchema = z
  .object({ label: label.optional(), target: target.optional(), targetDate: isoDate.nullable().optional(), note, reason: reasonSchema.optional() })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

export const createContributionSchema = z.object({ amount: amountSchema.min(1), contributedAt: isoDate, note }).strict();

export const createChildSchema = z
  .object({ firstName: z.string().trim().min(1).max(60), birthYear: z.number().int().min(1900).max(new Date().getFullYear()), note })
  .strict();

export const updateChildSchema = z
  .object({ firstName: z.string().trim().min(1).max(60).optional(), birthYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(), note })
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to change' });

export const createProvisionSchema = z
  .object({ label, plannedAmount: amountSchema.min(1), currency: currencySchema, targetDate: isoDate, alreadyProvisioned: amountSchema.min(0).optional(), note })
  .strict();

export const updateProvisionSchema = z
  .object({
    label: label.optional(),
    plannedAmount: amountSchema.min(1).optional(),
    targetDate: isoDate.optional(),
    alreadyProvisioned: amountSchema.min(0).optional(),
    note,
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

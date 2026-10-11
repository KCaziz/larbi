import { z } from 'zod';
import { FIN_DEEP_LINK_WHITELIST, FIN_INTENT_CODES } from '../constants/finAssistant.js';

const LIMITS = { label: 120, example: 200, keyword: 60, keywords: 30, response: 10_000, flowName: 150, stepKey: 60, prompt: 2000, optionLabel: 100, options: 8 };

export const resolveQuerySchema = z.object({ query: z.string().trim().min(1).max(200) }).strict();

export const updateIntentSchema = z
  .object({
    label: z.string().trim().min(1).max(LIMITS.label),
    keywords: z.array(z.string().trim().min(1).max(LIMITS.keyword)).max(LIMITS.keywords),
    responseTemplate: z.string().min(1).max(LIMITS.response),
    deepLinkPath: z.enum(FIN_DEEP_LINK_WHITELIST).nullable(),
  })
  .partial()
  .strict();

export const createFlowSchema = z.object({ name: z.string().trim().min(1).max(LIMITS.flowName) }).strict();
export const updateFlowSchema = z.object({ name: z.string().trim().min(1).max(LIMITS.flowName) }).partial().strict();

const option = z.object({
  label: z.string().trim().min(1).max(LIMITS.optionLabel),
  nextStepKey: z.string().trim().min(1).max(LIMITS.stepKey).nullable(),
  intentCode: z.enum(FIN_INTENT_CODES).nullable(),
});

export const createStepSchema = z
  .object({
    stepKey: z
      .string()
      .trim()
      .min(1)
      .max(LIMITS.stepKey)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    prompt: z.string().trim().min(1).max(LIMITS.prompt),
    options: z.array(option).max(LIMITS.options),
  })
  .strict();

export const updateStepSchema = z
  .object({
    prompt: z.string().trim().min(1).max(LIMITS.prompt),
    options: z.array(option).max(LIMITS.options),
  })
  .partial()
  .strict();

export const flowStepActionSchema = z
  .object({
    flowKey: z
      .string()
      .trim()
      .min(1)
      .max(LIMITS.flowName)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    stepKey: z.string().trim().min(1).max(LIMITS.stepKey).nullable(),
  })
  .strict();

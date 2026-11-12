import { z } from 'zod';
import { FIN_DEEP_LINK_WHITELIST } from '../constants/finAssistant.js';

const LIMITS = { label: 120, example: 200, keyword: 60, keywords: 30, response: 10_000, flowName: 150, stepKey: 60, prompt: 2000, optionLabel: 100, options: 8 };

// The languages an answer can be translated into (French is the columns themselves).
export const FIN_TRANSLATION_LANGUAGES = ['en', 'ar'];

export const resolveQuerySchema = z.object({ query: z.string().trim().min(1).max(200), lang: z.enum(['fr', ...FIN_TRANSLATION_LANGUAGES]).optional() }).strict();

// R11-05: { en: { label, responseTemplate }, ar: {...} }; an empty text means "not translated".
const translation = z.object({ label: z.string().trim().max(LIMITS.label), responseTemplate: z.string().max(LIMITS.response) }).partial().strict();
const translations = z.object(Object.fromEntries(FIN_TRANSLATION_LANGUAGES.map((lang) => [lang, translation.optional()]))).strict();

export const updateIntentSchema = z
  .object({
    label: z.string().trim().min(1).max(LIMITS.label),
    keywords: z.array(z.string().trim().min(1).max(LIMITS.keyword)).max(LIMITS.keywords),
    responseTemplate: z.string().min(1).max(LIMITS.response),
    deepLinkPath: z.enum(FIN_DEEP_LINK_WHITELIST).nullable(),
    translations,
  })
  .partial()
  .strict();

// R11-05: an answer written by an administrator, beside the client's list.
export const createIntentSchema = z
  .object({
    label: z.string().trim().min(1).max(LIMITS.label),
    keywords: z.array(z.string().trim().min(1).max(LIMITS.keyword)).min(1).max(LIMITS.keywords),
    responseTemplate: z.string().max(LIMITS.response).optional(),
    deepLinkPath: z.enum(FIN_DEEP_LINK_WHITELIST).nullable().optional(),
    translations: translations.optional(),
  })
  .strict();

export const createFlowSchema = z.object({ name: z.string().trim().min(1).max(LIMITS.flowName) }).strict();
export const updateFlowSchema = z.object({ name: z.string().trim().min(1).max(LIMITS.flowName) }).partial().strict();

const option = z.object({
  label: z.string().trim().min(1).max(LIMITS.optionLabel),
  nextStepKey: z.string().trim().min(1).max(LIMITS.stepKey).nullable(),
  // Checked against the answers that exist (the client's and the administrator's own).
  intentCode: z.string().trim().min(1).max(40).nullable(),
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

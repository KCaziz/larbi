import { z } from 'zod';
import { ONBOARDING_QUESTION_KEYS } from '../constants/finOnboarding.js';
import { FREQUENCIES } from '../constants/finance.js';
import { currencySchema } from './finData.schemas.js';

// Progressive onboarding (P6-03). The shape of an answer is checked here; which
// question is legitimate for which public is checked in the service, because
// that depends on the session's profile and a schema cannot see it.
//
// `skipped` is a first-class answer: « Passer » is one of the client's own
// buttons, and a skipped question must be recorded as skipped rather than left
// looking like one nobody reached.
const answerSchema = z
  .object({
    skipped: z.literal(true).optional(),
    amount: z.number().int().min(0).safe().optional(),
    frequency: z.enum(FREQUENCIES).optional(),
    choice: z.string().trim().min(1).max(80).optional(),
    text: z.string().trim().min(1).max(80).optional(),
    // Set when the person has seen the "this looks out of scale" question and
    // confirmed their answer anyway. The client's rule: ask, never block.
    confirmed: z.literal(true).optional(),
  })
  .strict()
  .refine((answer) => answer.skipped || answer.amount !== undefined || answer.choice !== undefined || answer.text !== undefined, {
    message: 'An answer is a value or a skip',
  });

// A strict object over the declared question keys, not z.record(z.enum(...)):
// zod treats a record over an enum as exhaustive, which would refuse the
// partial batch that « Enregistrer et quitter » sends.
const answersSchema = z
  .object(Object.fromEntries(ONBOARDING_QUESTION_KEYS.map((key) => [key, answerSchema.optional()])))
  .strict();

export const saveOnboardingSchema = z
  .object({
    answers: answersSchema.optional(),
    // Accepting the client's fictional starter budget. Only offered to the
    // lycéen experience; the service refuses it elsewhere.
    fictional: z.literal(true).optional(),
    currency: currencySchema.optional(),
  })
  .strict()
  .refine((body) => body.answers !== undefined || body.fictional !== undefined || body.currency !== undefined, {
    message: 'Nothing to save',
  });

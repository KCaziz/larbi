import { z } from 'zod';
import { FIN_AGE_RANGES, FIN_PUBLIC_CODES } from '../constants/finPublics.js';

// FINCLUDIA onboarding (P3-18, screen C02): "Profil principal; tranche d'âge;
// situation; intention principale; horizon", buttons "Continuer / Je ne sais
// pas / Modifier plus tard" — every field below is optional for that reason:
// "Je ne sais pas" must be a real option, not a dead end.
const publicCode = z.enum(FIN_PUBLIC_CODES);

export const updateFinProfileSchema = z
  .object({
    finPublic: publicCode.nullable(),
    finSecondaryPublics: z.array(publicCode).max(7),
    finAgeRange: z.enum(FIN_AGE_RANGES).nullable(),
    finCountry: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/)
      .nullable(),
    finSituation: z.string().trim().max(120).nullable(),
    finMainIntention: z.string().trim().max(120).nullable(),
    finHorizon: z.string().trim().max(60).nullable(),
    // « Revenu irrégulier » (GO-01, question C3): declared, never detected.
    finIrregularIncome: z.boolean(),
    // Every required text must be accepted together (no financial data is
    // asked before consent) — true is the only accepted value, so a caller
    // cannot "silently" skip consent by omitting the field with a falsy default.
    acceptConsents: z.literal(true).optional(),
  })
  .partial()
  .strict()
  .refine((data) => !data.finSecondaryPublics || !data.finPublic || !data.finSecondaryPublics.includes(data.finPublic), {
    message: 'A secondary public cannot repeat the primary one',
    path: ['finSecondaryPublics'],
  });

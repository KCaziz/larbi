import { z } from 'zod';
import { CRITERION_KEYS, GRADE_MAX, GRADE_MIN, MAX_OPTIONS, MIN_OPTIONS, criterionByKey } from '../constants/comparison.js';

// Input validation of the comparison engine and of the job-offer comparator
// (P4-12). Same conventions as the simulators: amounts are integers in the
// currency's smallest unit, a decimal is refused rather than rounded, and an
// unknown field is refused rather than ignored.

const MAX_AMOUNT = Number.MAX_SAFE_INTEGER;
const amount = z.number().int().min(0).max(MAX_AMOUNT);
const currency = z.string().regex(/^[A-Z]{3}$/);
const label = z.string().trim().min(1).max(60);
const freeText = z.string().trim().min(1).max(280);

// A weight is a plain positive number the person chooses. No default: a score
// exists only when weights were actually given (C19). Every criterion is
// optional — weighting one criterion must not force a weight on the others —
// but a key nobody declared is refused, like anywhere else.
const weights = z
  .object(Object.fromEntries(CRITERION_KEYS.map((key) => [key, z.number().min(0).max(100).optional()])))
  .strict();

// The value of a criterion, typed by the criterion itself: a cost is an amount,
// a grade is bounded to the stated scale, "conditions" is text.
const criterionValue = (key) => {
  const criterion = criterionByKey(key);
  if (criterion.unit === 'text') return freeText;
  if (criterion.unit === 'money') return z.number().int().max(MAX_AMOUNT);
  if (criterion.unit === 'points') return z.number().min(GRADE_MIN).max(GRADE_MAX);
  if (criterion.unit === 'ratio') return z.number().min(-1).max(10);
  return z.number().int().min(0).max(1_000_000);
};

const criteriaValues = z
  .object(Object.fromEntries(CRITERION_KEYS.map((key) => [key, criterionValue(key).optional()])))
  .strict();

export const comparisonSchema = z
  .object({
    options: z
      .array(
        z
          .object({
            key: z.string().trim().min(1).max(20),
            label,
            currency: currency.optional(),
            horizonMonths: z.number().int().min(1).max(1_000_000).optional(),
            criteria: criteriaValues,
          })
          .strict(),
      )
      .min(MIN_OPTIONS)
      .max(MAX_OPTIONS),
    // The criteria actually compared, named from the fixed vocabulary.
    criteria: z.array(z.enum(CRITERION_KEYS)).min(1).max(CRITERION_KEYS.length),
    weights: weights.optional(),
  })
  .strict();

export const jobOffersSchema = z
  .object({
    currency,
    offers: z
      .array(
        z
          .object({
            label,
            net: amount,
            bonuses: amount.default(0),
            monetisableBenefits: amount.default(0),
            transportCost: amount.default(0),
            mealCost: amount.default(0),
            annualJobCosts: amount.default(0),
            commuteMinutes: z.number().int().min(0).max(1_440).default(0),
            // Free text on purpose: a benefit nobody can price is described, not
            // measured (the client's rule for ET08).
            nonMonetisableBenefits: freeText.optional(),
          })
          .strict(),
      )
      .min(MIN_OPTIONS)
      .max(MAX_OPTIONS),
    weights: weights.optional(),
  })
  .strict();

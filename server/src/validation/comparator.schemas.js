import { z } from 'zod';
import { COMPARATOR_LIMITS, COMPARATOR_SEGMENTS, THEME_KEYS } from '../constants/comparator.js';

// Bank comparator administration (P4-08). Shapes and sizes here; what depends on
// the rubric (its own columns, whether it has a category) is checked by the
// controller against src/constants/comparator.js.

const bankName = z.string().trim().min(1).max(COMPARATOR_LIMITS.bankName);
export const bankSchema = z.object({ name: bankName }).strict();

// { field: text }. Unknown fields are refused by the controller (they depend on the rubric).
const values = z.record(z.string().max(40), z.string().max(COMPARATOR_LIMITS.value));
const category = z
  .string()
  .trim()
  .max(COMPARATOR_LIMITS.category)
  .transform((v) => (v === '' ? null : v))
  .nullable();

const conditionFields = {
  bankId: z.string().uuid(),
  segment: z.enum(COMPARATOR_SEGMENTS),
  category,
  label: z.string().trim().min(1).max(COMPARATOR_LIMITS.label),
  values,
};

export const createConditionSchema = z
  .object({ theme: z.enum(THEME_KEYS), ...conditionFields })
  .partial({ segment: true, category: true, values: true })
  .strict();

// The rubric of a row never changes: its columns would not mean the same thing.
export const updateConditionSchema = z.object(conditionFields).partial().strict();

export const conditionsQuerySchema = z.object({ theme: z.enum(THEME_KEYS) }).strict();

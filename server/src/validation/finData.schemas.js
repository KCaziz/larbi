import { z } from 'zod';
import { CATEGORY_FAMILY_CODES } from '../constants/finCategories.js';
import { CONFIDENCE_LEVELS, CONSENT_USES, DATA_SCOPES, DATA_SOURCES, DATA_STATUSES } from '../constants/finData.js';

// The metadata socle as validation (P6-02). The vocabularies come from
// constants/finData.js — the same lists the database CHECKs are built from and
// the same lists services/finance/dataModel.js checks against — so there is one
// definition of "allowed" and three places that happen to read it.

export const scopeSchema = z.enum(DATA_SCOPES);
export const sourceSchema = z.enum(DATA_SOURCES);
export const statusSchema = z.enum(DATA_STATUSES);
export const confidenceSchema = z.enum(CONFIDENCE_LEVELS);

// A list of authorised uses, without repetition: the same use twice says
// nothing more and would make a diff in the correction trail look like a change.
export const consentUsesSchema = z
  .array(z.enum(CONSENT_USES))
  .max(CONSENT_USES.length)
  .refine((uses) => new Set(uses).size === uses.length, { message: 'A use cannot be listed twice' });

// An amount in the smallest unit of the currency: a whole number, never a float
// (a float has already lost centimes before it reaches us).
export const amountSchema = z.number().int().safe();
export const currencySchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/);

// Why a correction was made, if the person wrote it down. Never required: the
// client asks for a traceable correction, not for a justification to be typed
// before anything can be fixed.
export const reasonSchema = z.string().trim().min(1).max(200);

const labelSchema = z.string().trim().min(1).max(80);

export const createCategorySchema = z
  .object({
    family: z.enum(CATEGORY_FAMILY_CODES),
    label: labelSchema,
    essential: z.boolean().optional(),
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
  })
  .strict();

// Every field optional (a rename alone is the common case), but an empty body
// is refused: it would be a write that changes nothing.
export const updateCategorySchema = z
  .object({
    label: labelSchema.optional(),
    essential: z.boolean().optional(),
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => ['label', 'essential', 'scope', 'consentUses'].some((field) => field in body), {
    message: 'Nothing to change',
  });

// Customising a standard category: a new label for this account, or hiding it,
// or both. Same rule — an empty body changes nothing, so it is refused.
export const customiseCategorySchema = z
  .object({
    label: labelSchema.optional(),
    hidden: z.boolean().optional(),
    // « Essentielle ? », the person's own reading (P8-08).
    essential: z.boolean().optional(),
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => 'label' in body || 'hidden' in body || 'essential' in body, { message: 'Nothing to change' });

export const archiveCategorySchema = z.object({ archived: z.boolean(), reason: reasonSchema.optional() }).strict();

export const deleteCategorySchema = z.object({ reason: reasonSchema.optional() }).strict();

export const listCategoriesQuerySchema = z
  .object({
    // Archived categories are hidden by default: they are not offered any more.
    // A management screen asks for them explicitly to let someone bring one back.
    includeArchived: z
      .enum(['true', 'false'])
      .optional()
      .transform((value) => value === 'true'),
  })
  .strict();

import { z } from 'zod';

export const createAccountTypeSchema = z.object({ label: z.string().trim().min(1).max(60) }).strict();

// Every field optional (PATCH): only what is sent is changed. Slug never
// changes after creation (it may already be stored on users and articles).
export const updateAccountTypeSchema = z
  .object({
    label: z.string().trim().min(1).max(60),
    isActive: z.boolean(),
    order: z.coerce.number().int().min(0).max(1000),
  })
  .partial()
  .strict();

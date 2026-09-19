import { z } from 'zod';
import { ACCOUNT_TYPES } from '../constants/accountTypes.js';

const email = z.string().trim().toLowerCase().email().max(254);

// Strict objects: unknown keys (e.g. "role", "accessLevel") are rejected, so a
// client can never self-assign privileges at registration.
export const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email,
    // bcrypt only uses the first 72 bytes, hence the upper bound.
    password: z.string().min(8).max(72),
    accountType: z.enum(ACCOUNT_TYPES.map((t) => t.value)),
  })
  .strict();

// Only accountType is self-editable. accessLevel and role never are.
export const updateMeSchema = z
  .object({ accountType: z.enum(ACCOUNT_TYPES.map((t) => t.value)) })
  .strict();

export const loginSchema = z.object({ email, password: z.string().min(1).max(72) }).strict();

import { z } from 'zod';

const email = z.string().trim().toLowerCase().email().max(254);

// Shape only: account types are a real, admin-managed table (P3-15), not a
// fixed list known at schema-definition time. The controller checks the
// value against the current, active categories (accountTypes.service.js).
const accountType = z.string().trim().min(1).max(60);

// Strict objects: unknown keys (e.g. "role", "accessLevel") are rejected, so a
// client can never self-assign privileges at registration.
export const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email,
    // bcrypt only uses the first 72 bytes, hence the upper bound.
    password: z.string().min(8).max(72),
    accountType,
  })
  .strict();

// Self-editable: name, e-mail (which needs the current password) and account
// type. accessLevel and role never are.
export const updateMeSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    email: email.optional(),
    accountType: accountType.optional(),
    currentPassword: z.string().min(1).max(72).optional(),
  })
  .strict()
  .refine((v) => v.name !== undefined || v.email !== undefined || v.accountType !== undefined, {
    message: 'Nothing to update',
  })
  .refine((v) => v.email === undefined || v.currentPassword !== undefined, {
    message: 'The current password is required to change the e-mail',
    path: ['currentPassword'],
  });

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1).max(72), newPassword: z.string().min(8).max(72) })
  .strict();

export const loginSchema = z.object({ email, password: z.string().min(1).max(72) }).strict();

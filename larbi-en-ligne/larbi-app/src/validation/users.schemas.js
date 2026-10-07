import { z } from 'zod';
import { ACCESS_LEVELS, ROLES, USER_STATUS } from '../constants/roles.js';

export const usersQuerySchema = z
  .object({
    query: z.string().trim().max(100).optional(),
    role: z.enum(Object.values(ROLES)).optional(),
    accessLevel: z.enum(Object.values(ACCESS_LEVELS)).optional(),
    status: z.enum(Object.values(USER_STATUS)).optional(),
    accountType: z.string().trim().min(1).max(60).optional(),
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

// Every field optional (PATCH): only what is sent is changed. Shape only for
// accountType — it is checked against the account types table by the
// controller (P3-15), the same way self-service registration is.
export const updateUserSchema = z
  .object({
    role: z.enum(Object.values(ROLES)),
    accessLevel: z.enum(Object.values(ACCESS_LEVELS)),
    status: z.enum(Object.values(USER_STATUS)),
    accountType: z.string().trim().min(1).max(60),
  })
  .partial()
  .strict();

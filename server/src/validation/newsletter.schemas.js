import { z } from 'zod';
import { LOCALES } from '../services/newsletter.service.js';

// The interface language. "tzm" (Tamazight) has no e-mail texts yet: French is used.
const locale = z
  .enum([...LOCALES, 'tzm'])
  .default('fr')
  .transform((value) => (value === 'tzm' ? 'fr' : value));

export const subscribeSchema = z
  .object({ email: z.string().trim().toLowerCase().email().max(254), locale })
  .strict();

// Signed link token: bounded here, its shape and signature are checked by the service.
export const tokenSchema = z.object({ token: z.string().min(20).max(200) }).strict();

export const subscribersQuerySchema = z
  .object({
    status: z.enum(['pending', 'confirmed', 'unsubscribed']).optional(),
    query: z.string().trim().max(100).optional(),
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

export const digestQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(20).default(5),
    since: z.coerce.date().optional(),
  })
  .strict();

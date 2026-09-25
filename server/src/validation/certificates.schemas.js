import { z } from 'zod';
import { optionalText } from './cms.schemas.js';

export const certificatesQuerySchema = z
  .object({
    query: z.string().trim().max(100).optional(),
    status: z.enum(['active', 'revoked', 'all']).default('all'),
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

export const revokeCertificateSchema = z.object({ reason: optionalText(300).optional() }).strict();

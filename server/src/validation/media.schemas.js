import { z } from 'zod';
import { MEDIA_KIND } from '../constants/elearning.js';

export const mediaQuerySchema = z
  .object({
    kind: z.enum(Object.values(MEDIA_KIND)).optional(),
    query: z.string().trim().max(150).optional(),
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

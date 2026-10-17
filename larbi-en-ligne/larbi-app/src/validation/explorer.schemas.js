import { z } from 'zod';
import { COMPARATOR_SEGMENTS, THEME_KEYS } from '../constants/comparator.js';

const themesList = z
  .string()
  .max(200)
  .refine((value) => value.split(',').every((key) => THEME_KEYS.includes(key)), 'unknown theme');

export const explorerQuerySchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    themes: themesList.optional(),
    bankId: z.string().uuid().optional(),
    segment: z.enum(COMPARATOR_SEGMENTS).optional(),
  })
  .strict();

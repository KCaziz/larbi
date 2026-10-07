import { z } from 'zod';

export const contactSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().toLowerCase().email().max(254),
    message: z.string().trim().min(1).max(5000),
  })
  .strict();

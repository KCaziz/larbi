import { z } from 'zod';

// Null clears the target: "no target chosen yet" is a real state, not 0 months.
export const reserveTargetSchema = z.object({ targetMonths: z.number().int().min(0).max(60).nullable() }).strict();

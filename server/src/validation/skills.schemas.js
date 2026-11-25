import { z } from 'zod';

// P13-02: the exercise answer of an Academy module, then the steps of the
// corrected answer it meets; the mission declared done with its reference.
export const skillExerciseSchema = z
  .object({
    answer: z.string().max(5000).optional(),
    steps: z.array(z.number().int().min(0).max(4)).max(5).optional(),
  })
  .strict();

export const skillMissionSchema = z
  .object({
    done: z.boolean().optional(),
    evidenceRef: z.string().max(300).optional(),
  })
  .strict();

// The integrative case: the answer, then one rating per criterion (met 1, partly
// 0.5, not 0) and whether a critical error remains.
export const skillCaseSchema = z
  .object({
    answer: z.string().max(10000).optional(),
    ratings: z.array(z.union([z.literal(0), z.literal(0.5), z.literal(1)])).max(10).optional(),
    criticalError: z.boolean().optional(),
  })
  .strict();

// The answer to a numbered exercise: a number, typed as the person writes it.
export const skillVariantAnswerSchema = z.object({ answer: z.string().trim().min(1).max(40) }).strict();

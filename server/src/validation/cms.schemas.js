import { z } from 'zod';
import { ACCESS_LEVELS } from '../constants/roles.js';

// Optional text field coming from a form: "" means "cleared" -> null.
export const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))
    .nullable();

export const createFormationSchema = z.object({ title: z.string().trim().min(1).max(150) }).strict();

// Every field optional (PATCH): only what is sent is changed.
export const updateFormationSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    description: z.string().trim().max(2000),
    categoryId: z.string().uuid().nullable(),
    requiredAccessLevel: z.enum(Object.values(ACCESS_LEVELS)),
    certificationEnabled: z.boolean(),
    certificationTitle: optionalText(150),
    certificationDescription: optionalText(1000),
  })
  .partial()
  .strict();

export const createCourseSchema = z.object({ title: z.string().trim().min(1).max(150) }).strict();

export const updateCourseSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    summary: optionalText(500),
    // Rich text HTML from the editor; sanitised by the controller.
    body: z.string().max(200_000).nullable(),
    estimatedMinutes: z.number().int().min(0).max(1440).nullable(),
    isRequired: z.boolean(),
  })
  .partial()
  .strict();

export const reorderCoursesSchema = z
  .object({ courseIds: z.array(z.string().uuid()).max(500) })
  .strict();

export const createCategorySchema = z.object({ name: z.string().trim().min(1).max(80) }).strict();

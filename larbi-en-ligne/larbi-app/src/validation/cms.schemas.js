import { z } from 'zod';
import { FORMATION_LEVEL, FORMATION_STATUS } from '../constants/elearning.js';
import { ACCESS_LEVELS } from '../constants/roles.js';

// Optional text field coming from a form: "" means "cleared" -> null.
export const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))
    .nullable();

// A short list typed line by line (objectives, prerequisites): plain text, bounded.
const lines = z.array(z.string().trim().min(1).max(200)).max(12);

export const createFormationSchema = z.object({ title: z.string().trim().min(1).max(150) }).strict();

// Every field optional (PATCH): only what is sent is changed.
export const updateFormationSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    subtitle: optionalText(160),
    description: z.string().trim().max(2000),
    level: z.enum(Object.values(FORMATION_LEVEL)).nullable(),
    objectives: lines,
    prerequisites: lines,
    categoryId: z.string().uuid().nullable(),
    requiredAccessLevel: z.enum(Object.values(ACCESS_LEVELS)),
    certificationEnabled: z.boolean(),
    certificationTitle: optionalText(150),
    certificationDescription: optionalText(1000),
  })
  .partial()
  .strict();

export const createCourseSchema = z.object({ title: z.string().trim().min(1).max(150), sectionId: z.string().uuid().optional() }).strict();

export const createSectionSchema = z.object({ title: z.string().trim().min(1).max(150) }).strict();

export const updateSectionSchema = z
  .object({ title: z.string().trim().min(1).max(150), description: optionalText(500) })
  .partial()
  .strict();

// The whole plan: chapters in order, each with its lessons in order.
export const outlineSchema = z
  .object({
    sections: z
      .array(z.object({ id: z.string().uuid(), courseIds: z.array(z.string().uuid()).max(500) }).strict())
      .max(100),
  })
  .strict();

export const statusSchema = z.object({ status: z.enum(Object.values(FORMATION_STATUS)) }).strict();

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

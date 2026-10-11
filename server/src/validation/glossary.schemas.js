import { z } from 'zod';
import { CONTENT_LANGUAGES } from '../constants/blog.js';

// "Apprendre" glossary and mini-guides (P2-08). One language per entry, like
// articles and formations.
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const LIMITS = { term: 120, definition: 20_000, example: 5_000, title: 150, theme: 60, related: 12 };

export const createTermSchema = z.object({ term: z.string().trim().min(1).max(LIMITS.term) }).strict();

export const updateTermSchema = z
  .object({
    term: z.string().trim().min(1).max(LIMITS.term),
    definition: z.string().min(1).max(LIMITS.definition),
    example: z.string().max(LIMITS.example).nullable(),
    relatedTerms: z.array(z.string().uuid()).max(LIMITS.related),
    level: z.enum(LEVELS).nullable(),
    theme: z.string().trim().max(LIMITS.theme).nullable(),
    language: z.enum(CONTENT_LANGUAGES),
  })
  .partial()
  .strict();

export const createGuideSchema = z.object({ title: z.string().trim().min(1).max(LIMITS.title) }).strict();

export const updateGuideSchema = z
  .object({
    title: z.string().trim().min(1).max(LIMITS.title),
    body: z.string().max(200_000).nullable(),
    level: z.enum(LEVELS).nullable(),
    theme: z.string().trim().max(LIMITS.theme).nullable(),
    language: z.enum(CONTENT_LANGUAGES),
  })
  .partial()
  .strict();

export const reorderGuidesSchema = z.object({ ids: z.array(z.string().uuid()).min(1).max(500) }).strict();

// Public "Apprendre" search (P2-08): lexical, across glossary + guides.
export const learnSearchQuerySchema = z
  .object({
    query: z.string().trim().max(100).optional(),
    level: z.enum(LEVELS).optional(),
    theme: z.string().trim().max(LIMITS.theme).optional(),
    lang: z.enum(CONTENT_LANGUAGES).optional(),
  })
  .strict();

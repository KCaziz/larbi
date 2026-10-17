import { z } from 'zod';
import { CONTENT_LANGUAGES } from '../constants/blog.js';
import { FAVORITE_KINDS } from '../constants/learning.js';
import { SIMULATOR_KEYS } from '../constants/simulators.js';

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
    // The "Simuler" button of C21: one of the calculators that really exist,
    // never a free-form key, and `null` to detach it.
    simulatorKey: z.enum(SIMULATOR_KEYS).nullable(),
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
    // The "Simuler" button of C21: one of the calculators that really exist,
    // never a free-form key, and `null` to detach it.
    simulatorKey: z.enum(SIMULATOR_KEYS).nullable(),
    level: z.enum(LEVELS).nullable(),
    theme: z.string().trim().max(LIMITS.theme).nullable(),
    language: z.enum(CONTENT_LANGUAGES),
  })
  .partial()
  .strict();

export const reorderGuidesSchema = z.object({ ids: z.array(z.string().uuid()).min(1).max(500) }).strict();

// Public "Apprendre" search (P2-08): lexical, across the four kinds of content
// (courses, glossary, mini-guides, articles), on the two axes they all carry.
export const learnSearchQuerySchema = z
  .object({
    query: z.string().trim().max(100).optional(),
    level: z.enum(LEVELS).optional(),
    theme: z.string().trim().max(LIMITS.theme).optional(),
    lang: z.enum(CONTENT_LANGUAGES).optional(),
  })
  .strict();

// Favourites (P2-08): the kind comes from one closed list, the reference is a
// uuid. Nothing else is accepted — a favourite is two values, not a payload.
export const addFavoriteSchema = z
  .object({ kind: z.enum(FAVORITE_KINDS), refId: z.string().uuid() })
  .strict();

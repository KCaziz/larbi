import { z } from 'zod';
import { MAX_TAGS_PER_ARTICLE, BLOG_PAGE_SIZE } from '../constants/blog.js';
import { ACCESS_LEVELS } from '../constants/roles.js';
import { optionalText } from './cms.schemas.js';

export const createArticleSchema = z.object({ title: z.string().trim().min(1).max(150) }).strict();

// Every field optional (PATCH): only what is sent is changed. The status is
// deliberately absent: only publish / unpublish change it.
export const updateArticleSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    excerpt: z.string().trim().max(300),
    // Rich text HTML from the editor; sanitised by the controller.
    body: z.string().max(200_000).nullable(),
    categoryId: z.string().uuid().nullable(),
    tags: z.array(z.string().trim().min(1).max(40)).max(MAX_TAGS_PER_ARTICLE),
    // Visibility by profile (P3-04). Shape only: each slug is checked against the
    // account categories that currently exist by the controller (P3-15), since
    // that list is now admin-managed, not fixed at schema-definition time.
    requiredAccessLevel: z.enum(Object.values(ACCESS_LEVELS)),
    targetAccountTypes: z
      .array(z.string().trim().min(1).max(60))
      .max(20)
      .transform((types) => [...new Set(types)]),
    metaTitle: optionalText(70),
    metaDescription: optionalText(170),
  })
  .partial()
  .strict();

const slug = z.string().max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

// Public list: query-string parameters, everything bounded.
export const blogListQuerySchema = z
  .object({
    query: z.string().trim().max(100).optional(),
    category: slug.optional(),
    tag: slug.optional(),
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(BLOG_PAGE_SIZE.max).default(BLOG_PAGE_SIZE.default),
  })
  .strict();

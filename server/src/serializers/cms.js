import { readingMinutes } from '../services/article.service.js';
import { articleReadiness, formationReadiness } from '../services/readiness.service.js';

// Explicit allow-lists. In particular Media.storageKey (the internal storage
// name) is NEVER returned: clients only get an authorised URL.
export const ADMIN_MEDIA_URL = (id) => `/api/admin/media/${id}/file`;

export function toMedia(media) {
  if (!media) return null;
  return {
    id: media.id,
    kind: media.kind,
    originalName: media.originalName,
    mimeType: media.mimeType,
    sizeBytes: media.sizeBytes,
    url: ADMIN_MEDIA_URL(media.id),
  };
}

export function toAdminCourse(course) {
  return {
    id: course.id,
    title: course.title,
    summary: course.summary,
    body: course.body,
    position: course.position,
    isRequired: course.isRequired,
    estimatedMinutes: course.estimatedMinutes,
    media: (course.media ?? []).map(toMedia),
  };
}

export function toAdminFormation(formation) {
  return {
    id: formation.id,
    title: formation.title,
    description: formation.description,
    status: formation.status,
    requiredAccessLevel: formation.requiredAccessLevel,
    category: formation.category ? { id: formation.category.id, name: formation.category.name } : null,
    cover: toMedia(formation.coverImage),
    certification: {
      enabled: formation.certificationEnabled,
      title: formation.certificationTitle,
      description: formation.certificationDescription,
    },
    publishedAt: formation.publishedAt,
    updatedAt: formation.updatedAt,
    courses: (formation.courses ?? []).map(toAdminCourse),
    readiness: formationReadiness(formation),
  };
}

// Admin view of an article (the editor needs the body, the SEO fields and the
// checklist). The slug is not exposed: editors never need to see or type it.
export function toAdminArticle(article) {
  return {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    body: article.body,
    status: article.status,
    category: article.category ? { id: article.category.id, name: article.category.name } : null,
    tags: (article.tags ?? []).map((link) => link.tag.name).sort((a, b) => a.localeCompare(b)),
    cover: toMedia(article.coverImage),
    media: (article.media ?? []).map(toMedia),
    requiredAccessLevel: article.requiredAccessLevel,
    targetAccountTypes: article.targetAccountTypes ?? [],
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    author: article.author ? { name: article.author.name } : null,
    readingMinutes: readingMinutes(article.bodyText),
    // Public address, only once published (for the "view on the blog" link).
    publicPath: article.status === 'published' ? `/blog/${article.slug}` : null,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    readiness: articleReadiness(article),
  };
}

// Row of the admin list.
export function toAdminArticleRow(article) {
  return {
    id: article.id,
    title: article.title,
    status: article.status,
    requiredAccessLevel: article.requiredAccessLevel,
    category: article.category ? { id: article.category.id, name: article.category.name } : null,
    cover: toMedia(article.coverImage),
    author: article.author ? { name: article.author.name } : null,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
  };
}

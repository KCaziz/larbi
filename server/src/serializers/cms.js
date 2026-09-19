import { formationReadiness } from '../services/readiness.service.js';

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

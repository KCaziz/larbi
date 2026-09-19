import { summarizeProgress } from '../services/progress.service.js';

// Explicit allow-lists for what a LEARNER may see. Never included: storage keys,
// author, other learners' data, unpublished internals, and — until the learner
// is enrolled and allowed — the lesson contents and files.
export const coverUrl = (slug) => `/api/learn/formations/${slug}/cover`;
export const learnerMediaUrl = (id) => `/api/learn/media/${id}`;

const toCertificationInfo = (f) => ({
  enabled: f.certificationEnabled,
  title: f.certificationEnabled ? f.certificationTitle : null,
  description: f.certificationEnabled ? f.certificationDescription : null,
});

export function toEnrollmentSummary(enrollment, courses) {
  if (!enrollment) return null;
  return {
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
    progress: summarizeProgress(courses, enrollment.courseProgress ?? []),
    certification: enrollment.certification
      ? { certificateNumber: enrollment.certification.certificateNumber, issuedAt: enrollment.certification.issuedAt }
      : null,
  };
}

// Card in the catalogue / "my formations".
export function toCatalogItem(formation, { accessible, enrollment }) {
  return {
    slug: formation.slug,
    title: formation.title,
    description: formation.description,
    category: formation.category ? { id: formation.category.id, name: formation.category.name } : null,
    coverUrl: formation.coverImageId ? coverUrl(formation.slug) : null,
    courseCount: formation.courses.length,
    requiredAccessLevel: formation.requiredAccessLevel,
    accessible,
    published: formation.status === 'published',
    enrollment: toEnrollmentSummary(enrollment, formation.courses),
  };
}

// Detail page: the lesson LIST (titles, summaries) is visible to any logged-in
// user to help them decide; bodies and files are not (see toCourseContent).
export function toFormationDetail(formation, { accessible, enrollment }) {
  const item = toCatalogItem(formation, { accessible, enrollment });
  return {
    ...item,
    certification: toCertificationInfo(formation),
    canEnroll: accessible && !enrollment && formation.status === 'published',
    courses: formation.courses.map((c) => ({
      id: c.id,
      position: c.position,
      title: c.title,
      summary: c.summary,
      estimatedMinutes: c.estimatedMinutes,
      isRequired: c.isRequired,
    })),
  };
}

export function toCourseContent(course, formation, media) {
  const ordered = formation.courses;
  const index = ordered.findIndex((c) => c.id === course.id);
  return {
    id: course.id,
    position: course.position,
    title: course.title,
    summary: course.summary,
    // Already sanitised when saved by the CMS (sanitize.service.js).
    body: course.body,
    estimatedMinutes: course.estimatedMinutes,
    isRequired: course.isRequired,
    media: media.map((m) => ({
      id: m.id,
      kind: m.kind,
      originalName: m.originalName,
      mimeType: m.mimeType,
      sizeBytes: m.sizeBytes,
      url: learnerMediaUrl(m.id),
    })),
    previousId: index > 0 ? ordered[index - 1].id : null,
    nextId: index >= 0 && index < ordered.length - 1 ? ordered[index + 1].id : null,
  };
}

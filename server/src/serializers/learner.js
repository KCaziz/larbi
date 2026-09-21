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

// `quizzes`: the quizzes of the formation ([{ id, isRequired, isComplete }]); the passed ones come
// from `enrollment.quizAttempts` (passed attempts).
export function toEnrollmentSummary(enrollment, courses, quizzes = []) {
  if (!enrollment) return null;
  const quizState = {
    required: quizzes.filter((q) => q.isRequired && q.isComplete).map((q) => q.id),
    passedIds: new Set((enrollment.quizAttempts ?? []).filter((a) => a.passed).map((a) => a.quizId)),
  };
  return {
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
    progress: summarizeProgress(courses, enrollment.courseProgress ?? [], quizState),
    certification: enrollment.certification
      ? { certificateNumber: enrollment.certification.certificateNumber, issuedAt: enrollment.certification.issuedAt }
      : null,
  };
}

// A quiz as the learner sees it BEFORE starting: what it is, never its questions or answers. The
// state (attempts used, best score, passed) is that of this learner's enrolment, if any.
// `quiz._count.questions` and the attempts (`enrollment.quizAttempts`) come from the loaders.
export function toQuizSummary(quiz, enrollment) {
  const submitted = (enrollment?.quizAttempts ?? []).filter((a) => a.quizId === quiz.id && a.submittedAt);
  return {
    id: quiz.id,
    scope: quiz.scope,
    courseId: quiz.courseId,
    sectionId: quiz.sectionId,
    title: quiz.title,
    isRequired: quiz.isRequired,
    questionCount: quiz._count?.questions ?? 0,
    passingScore: quiz.passingScore,
    maxAttempts: quiz.maxAttempts,
    attemptsUsed: submitted.length,
    bestScore: submitted.length ? Math.max(...submitted.map((a) => a.score ?? 0)) : null,
    passed: submitted.some((a) => a.passed),
  };
}

// Certificate as its owner sees it. The certification name falls back to the
// formation title when the admin left it empty.
export const toCertificateView = (c) => ({
  certificateNumber: c.certificateNumber,
  holderName: c.holderName,
  certificationTitle: c.certificationTitle ?? c.formationTitle,
  formationTitle: c.formationTitle,
  issuedAt: c.issuedAt,
});

// What ANYONE holding the number may learn when verifying a certificate:
// no e-mail, no ids, nothing about the account beyond the printed name.
// Deliberately its own allow-list, so the owner's view can grow without leaking.
export const toPublicCertificate = (c) => ({
  certificateNumber: c.certificateNumber,
  holderName: c.holderName,
  certificationTitle: c.certificationTitle ?? c.formationTitle,
  formationTitle: c.formationTitle,
  issuedAt: c.issuedAt,
});

// Card in the catalogue / "my formations".
export function toCatalogItem(formation, { accessible, enrollment }) {
  return {
    slug: formation.slug,
    title: formation.title,
    subtitle: formation.subtitle,
    description: formation.description,
    level: formation.level,
    totalMinutes: formation.courses.reduce((sum, c) => sum + (c.estimatedMinutes ?? 0), 0),
    category: formation.category ? { id: formation.category.id, name: formation.category.name } : null,
    coverUrl: formation.coverImageId ? coverUrl(formation.slug) : null,
    courseCount: formation.courses.length,
    requiredAccessLevel: formation.requiredAccessLevel,
    accessible,
    published: formation.status === 'published',
    archived: formation.status === 'archived',
    enrollment: toEnrollmentSummary(enrollment, formation.courses, formation.quizzes),
  };
}

// Chapters with the ids of their lessons. A lesson without chapter (data older than the
// chapters) is shown in the first one, so nothing ever disappears from the plan.
function toSections(formation) {
  const sections = formation.sections ?? [];
  if (sections.length === 0) return [];
  const known = new Set(sections.map((s) => s.id));
  return sections.map((s, index) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    courseIds: formation.courses.filter((c) => (known.has(c.sectionId) ? c.sectionId === s.id : index === 0)).map((c) => c.id),
  }));
}

// Detail page: the lesson LIST (titles, summaries) is visible to any logged-in
// user to help them decide; bodies and files are not (see toCourseContent).
export function toFormationDetail(formation, { accessible, enrollment }) {
  const item = toCatalogItem(formation, { accessible, enrollment });
  return {
    ...item,
    certification: toCertificationInfo(formation),
    objectives: formation.objectives ?? [],
    prerequisites: formation.prerequisites ?? [],
    // The plan: chapters in order, each listing its lessons (ids into `courses` below).
    sections: toSections(formation),
    // Only finished quizzes are shown (an author's work in progress is not).
    quizzes: (formation.quizzes ?? []).filter((q) => q.isComplete).map((q) => toQuizSummary(q, enrollment)),
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

const learnerMedia = (m) => ({
  id: m.id,
  kind: m.kind,
  originalName: m.originalName,
  mimeType: m.mimeType,
  sizeBytes: m.sizeBytes,
  url: learnerMediaUrl(m.id),
});

// A block as the reader gets it: its (already validated / sanitised) data and, for a file,
// the authorised URL. Never a storage key, never a position or a database detail.
export function toLearnerBlock(block) {
  return { id: block.id, type: block.type, data: block.data, media: block.media ? learnerMedia(block.media) : null };
}

// `blocks`: the blocks of the lesson (with their file). A lesson WITHOUT blocks (older data) is
// still served the old way: `body` and `media`. For a lesson with blocks, `body` and `media`
// are derived from them for the same reason (older clients); readers use `blocks`.
export function toCourseContent(course, formation, media, blocks = []) {
  const ordered = formation.courses;
  const index = ordered.findIndex((c) => c.id === course.id);
  return {
    id: course.id,
    position: course.position,
    title: course.title,
    summary: course.summary,
    // Already sanitised when saved by the CMS (sanitize.service.js).
    body: blocks.length ? (blocks.find((b) => b.type === 'text')?.data?.html || null) : course.body,
    blocks: blocks.map(toLearnerBlock),
    estimatedMinutes: course.estimatedMinutes,
    isRequired: course.isRequired,
    media: (blocks.length ? blocks.filter((b) => b.media).map((b) => b.media) : media).map(learnerMedia),
    previousId: index > 0 ? ordered[index - 1].id : null,
    nextId: index >= 0 && index < ordered.length - 1 ? ordered[index + 1].id : null,
  };
}

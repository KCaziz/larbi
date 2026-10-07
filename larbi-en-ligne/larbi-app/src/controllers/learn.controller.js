import { prisma } from '../config/prisma.js';
import { FORMATION_STATUS } from '../constants/elearning.js';
import { hasAccessLevel } from '../constants/roles.js';
import {
  toCatalogItem,
  toCertificateView,
  toCourseContent,
  toEnrollmentSummary,
  toQuizSummary,
  toFormationDetail,
} from '../serializers/learner.js';
import { claimCertificate, completeCourse, recordCourseOpened, reopenCourse } from '../services/progress.service.js';
import { sendStoredMedia } from '../services/mediaResponse.js';
import { HttpError } from '../utils/httpError.js';
import { logSecurityEvent } from '../utils/securityLog.js';

// Learner-facing E-Learning API (P2-03). Every route requires a logged-in user;
// every permission decision is made HERE, never in the browser:
//   visible   = published, or the user is already enrolled in it
//   can enrol = published AND the user's access level >= the formation's level
//   can read  = enrolled AND the user's access level is (still) high enough
// Unknown / hidden formations answer 404, never 403, so their existence leaks nothing.

const COURSES_ORDERED = { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] };
const FORMATION_INCLUDE = { category: true, courses: COURSES_ORDERED, sections: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] }, quizzes: { select: { id: true, scope: true, courseId: true, sectionId: true, title: true, isRequired: true, isComplete: true, passingScore: true, maxAttempts: true, _count: { select: { questions: true } } } } };
// `quizAttempts`: only the PASSED ones matter for the summary (which required quizzes are done).
const ENROLLMENT_INCLUDE = { courseProgress: true, certification: true, quizAttempts: { where: { submittedAt: { not: null } }, select: { quizId: true, score: true, passed: true, submittedAt: true } } };

const accessibleTo = (user, formation) => hasAccessLevel(user.accessLevel, formation.requiredAccessLevel);

export async function findEnrollment(userId, formationId) {
  return prisma.enrollment.findUnique({
    where: { userId_formationId: { userId, formationId } },
    include: ENROLLMENT_INCLUDE,
  });
}

export async function loadForUser(slug, user) {
  const formation = await prisma.formation.findUnique({ where: { slug }, include: FORMATION_INCLUDE });
  if (!formation) throw new HttpError(404, 'Not found');
  const enrollment = await findEnrollment(user.id, formation.id);
  if (formation.status !== FORMATION_STATUS.PUBLISHED && !enrollment) throw new HttpError(404, 'Not found');
  return { formation, enrollment };
}

// Throws the right 403 (with a machine-readable reason the UI can explain).
export function assertCanRead(user, formation, enrollment) {
  if (!enrollment) throw new HttpError(403, 'You are not enrolled in this formation', { reason: 'not_enrolled' });
  if (!accessibleTo(user, formation)) {
    throw new HttpError(403, 'Premium access required', { reason: 'premium_required' });
  }
}

export async function listCatalog(req, res) {
  const formations = await prisma.formation.findMany({
    where: { status: FORMATION_STATUS.PUBLISHED },
    orderBy: { publishedAt: 'desc' },
    include: FORMATION_INCLUDE,
  });
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user.id, formationId: { in: formations.map((f) => f.id) } },
    include: ENROLLMENT_INCLUDE,
  });
  const byFormation = new Map(enrollments.map((e) => [e.formationId, e]));
  res.json({
    formations: formations.map((f) =>
      toCatalogItem(f, { accessible: accessibleTo(req.user, f), enrollment: byFormation.get(f.id) ?? null }),
    ),
  });
}

export async function myEnrollments(req, res) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user.id },
    orderBy: { enrolledAt: 'desc' },
    include: { ...ENROLLMENT_INCLUDE, formation: { include: FORMATION_INCLUDE } },
  });
  res.json({
    formations: enrollments.map((e) =>
      toCatalogItem(e.formation, { accessible: accessibleTo(req.user, e.formation), enrollment: e }),
    ),
  });
}

export async function getFormation(req, res) {
  const { formation, enrollment } = await loadForUser(req.params.slug, req.user);
  res.json({ formation: toFormationDetail(formation, { accessible: accessibleTo(req.user, formation), enrollment }) });
}

export async function enroll(req, res) {
  const { formation, enrollment: existing } = await loadForUser(req.params.slug, req.user);
  let status = 200;
  let enrollment = existing;

  if (!existing) {
    if (formation.status !== FORMATION_STATUS.PUBLISHED) throw new HttpError(404, 'Not found');
    if (!accessibleTo(req.user, formation)) {
      throw new HttpError(403, 'Premium access required', { reason: 'premium_required' });
    }
    try {
      await prisma.enrollment.create({ data: { userId: req.user.id, formationId: formation.id } });
      status = 201;
    } catch (err) {
      // Two simultaneous clicks: the unique (user, formation) constraint keeps
      // a single row, the second request simply reads it.
      if (err?.code !== 'P2002') throw err;
    }
    enrollment = await findEnrollment(req.user.id, formation.id);
  }

  res.status(status).json({
    formation: toFormationDetail(formation, { accessible: accessibleTo(req.user, formation), enrollment }),
  });
}

export async function getCourse(req, res) {
  const { formation, enrollment } = await loadForUser(req.params.slug, req.user);
  assertCanRead(req.user, formation, enrollment);

  const course = formation.courses.find((c) => c.id === req.params.courseId);
  if (!course) throw new HttpError(404, 'Not found');

  // Opening is recorded here, where the content is actually served, so it
  // cannot be skipped or faked from the browser.
  await recordCourseOpened(enrollment, course);
  const media = await prisma.media.findMany({ where: { courseId: course.id }, orderBy: { createdAt: 'asc' } });
  const blocks = await prisma.lessonBlock.findMany({ where: { courseId: course.id }, orderBy: { position: 'asc' }, include: { media: true } });
  const lessonQuiz = formation.quizzes.filter((q) => q.isComplete).map((q) => toQuizSummary(q, enrollment)).find((q) => q.scope === 'course' && q.courseId === course.id) ?? null;
  const completed = enrollment.courseProgress.some((p) => p.courseId === course.id && p.status === 'completed');
  res.json({
    formation: { slug: formation.slug, title: formation.title },
    course: toCourseContent(course, formation, media, blocks),
    completed,
    // The quiz of this lesson, if it has a finished one (its questions are served by the quiz routes).
    quiz: lessonQuiz,
  });
}

// Shared by "complete" / "reopen": same access rules as reading the lesson.
async function changeProgress(req, res, action) {
  const { formation, enrollment } = await loadForUser(req.params.slug, req.user);
  assertCanRead(req.user, formation, enrollment);
  const course = formation.courses.find((c) => c.id === req.params.courseId);
  if (!course) throw new HttpError(404, 'Not found');

  await action(enrollment, course, { user: req.user, formation });

  const fresh = await findEnrollment(req.user.id, formation.id);
  const completed = fresh.courseProgress.some((p) => p.courseId === course.id && p.status === 'completed');
  res.json({ completed, enrollment: toEnrollmentSummary(fresh, formation.courses, formation.quizzes) });
}

export const completeLesson = (req, res) => changeProgress(req, res, completeCourse);
export const reopenLesson = (req, res) => changeProgress(req, res, reopenCourse);

// The certificate is issued automatically when the last required course is
// completed (progress.service). This route covers a learner who finished before
// certification was switched on. Idempotent; 409 + reason when conditions are not met.
export async function claimMyCertificate(req, res) {
  const { formation, enrollment } = await loadForUser(req.params.slug, req.user);
  assertCanRead(req.user, formation, enrollment);
  const { certification, created } = await claimCertificate(enrollment, { user: req.user, formation });
  res.status(created ? 201 : 200).json({ certificate: toCertificateView(certification) });
}

// The certificate of the CURRENT user for a formation (owner only: it is looked
// up through the user's own enrolment). Viewing it needs no premium level — it is
// a record of what the user achieved, not premium content.
export async function getFormationCertificate(req, res) {
  const { enrollment } = await loadForUser(req.params.slug, req.user);
  if (!enrollment?.certification) throw new HttpError(404, 'Not found');
  res.json({ certificate: toCertificateView(enrollment.certification) });
}

export async function listMyCertificates(req, res) {
  const certifications = await prisma.certification.findMany({
    where: { enrollment: { userId: req.user.id } },
    orderBy: { issuedAt: 'desc' },
    include: { enrollment: { select: { formation: { select: { slug: true } } } } },
  });
  res.json({
    certificates: certifications.map((c) => ({ ...toCertificateView(c), formationSlug: c.enrollment.formation.slug })),
  });
}

// Marketing image of a formation, for any logged-in user who can see the formation.
export async function getCover(req, res) {
  const { formation } = await loadForUser(req.params.slug, req.user);
  if (!formation.coverImageId) throw new HttpError(404, 'Not found');
  const media = await prisma.media.findUnique({ where: { id: formation.coverImageId } });
  if (!media) throw new HttpError(404, 'Not found');
  sendStoredMedia(res, media, { cache: 'private, max-age=300' });
}

// Lesson files (video, document, image). Only for learners enrolled in the
// formation the file belongs to, with a sufficient access level.
export async function getMedia(req, res) {
  const media = await prisma.media.findUnique({
    where: { id: req.params.id },
    include: { course: { include: { formation: true } } },
  });
  // A file that is not attached to a lesson (cover, orphan) is not a lesson file.
  if (!media?.course) throw new HttpError(404, 'Not found');

  const { formation } = media.course;
  const enrollment = await findEnrollment(req.user.id, formation.id);
  // A formation this user cannot see (unpublished, not enrolled) does not exist for
  // them: 404, the same answer as an unknown id, so nothing about it is revealed.
  if (!enrollment && formation.status !== FORMATION_STATUS.PUBLISHED) throw new HttpError(404, 'Not found');
  try {
    assertCanRead(req.user, formation, enrollment);
  } catch (err) {
    // Traced by ids only (no file name, no storage key).
    logSecurityEvent('media_access_denied', { userId: req.user.id, mediaId: media.id, reason: err.details?.reason });
    throw err;
  }
  sendStoredMedia(res, media);
}

import { prisma } from '../config/prisma.js';
import { ENROLLMENT_STATUS, PROGRESS_STATUS } from '../constants/elearning.js';
import { HttpError } from '../utils/httpError.js';
import { createCertificate } from './certificate.service.js';

// Progress tracking (P2-04).
//
// percent           = completed courses / all courses (bonus lessons included), rounded
// requiredRemaining = required courses not completed yet
// An enrolment becomes "completed" when every REQUIRED course is completed
// (bonus lessons never block the certificate).

// Read-side summary. `courses`: the formation's courses; `progressRows`: the
// CourseProgress rows of ONE enrolment.
export function summarizeProgress(courses, progressRows) {
  const completedIds = new Set(
    progressRows.filter((row) => row.status === PROGRESS_STATUS.COMPLETED).map((row) => row.courseId),
  );
  // Only courses that still exist and belong to the formation count.
  const completedCourseIds = courses.filter((c) => completedIds.has(c.id)).map((c) => c.id);
  const total = courses.length;
  const completed = completedCourseIds.length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    requiredRemaining: courses.filter((c) => c.isRequired && !completedIds.has(c.id)).length,
    completedCourseIds,
  };
}

// Records that the learner opened a course. Idempotent: the first opening
// creates the row, later ones change nothing (never downgrades "completed").
export async function recordCourseOpened(enrollment, course) {
  await prisma.courseProgress.createMany({
    data: [{ enrollmentId: enrollment.id, courseId: course.id, formationId: enrollment.formationId }],
    skipDuplicates: true,
  });
}

// Runs `work` in a transaction that holds a row lock on the enrolment, so two
// simultaneous validations of the last two courses cannot both miss the
// completion (each would otherwise only see its own change).
async function withEnrollmentLock(enrollmentId, work) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM enrollments WHERE id = ${enrollmentId} FOR UPDATE`;
    return work(tx);
  });
}

// A formation is finished when every REQUIRED course is completed. A formation
// with no required course at all can only be finished by doing every course
// (otherwise "no required course left" would be true before starting).
export function isFormationFinished(courses, { completed, total, requiredRemaining }) {
  if (total === 0) return false;
  return courses.some((c) => c.isRequired) ? requiredRemaining === 0 : completed === total;
}

// Recomputes the enrolment status from the stored progress. The original
// completion date is kept while the enrolment stays completed.
async function syncEnrollmentStatus(tx, enrollmentId, courses) {
  const rows = await tx.courseProgress.findMany({ where: { enrollmentId } });
  const finished = isFormationFinished(courses, summarizeProgress(courses, rows));
  const current = await tx.enrollment.findUnique({ where: { id: enrollmentId } });
  await tx.enrollment.update({
    where: { id: enrollmentId },
    data: finished
      ? { status: ENROLLMENT_STATUS.COMPLETED, completedAt: current.completedAt ?? new Date() }
      : { status: ENROLLMENT_STATUS.ACTIVE, completedAt: null },
  });
}

// Issues the certificate when, and only when, its conditions are met: the
// formation delivers one, the enrolment is completed and every required course
// is (still) completed. Idempotent: an existing certificate is returned as is.
// Must run inside the enrolment lock so two requests cannot both create one.
async function issueCertificateIfEligible(tx, { user, formation, enrollmentId }) {
  const existing = await tx.certification.findUnique({ where: { enrollmentId } });
  if (existing) return { certification: existing, created: false };
  if (!formation.certificationEnabled) return { certification: null, reason: 'certification_disabled' };

  const enrollment = await tx.enrollment.findUnique({ where: { id: enrollmentId } });
  const rows = await tx.courseProgress.findMany({ where: { enrollmentId } });
  const finished = isFormationFinished(formation.courses, summarizeProgress(formation.courses, rows));
  if (enrollment.status !== ENROLLMENT_STATUS.COMPLETED || !finished) {
    return { certification: null, reason: 'not_completed' };
  }
  return { certification: await createCertificate(tx, { user, formation, enrollmentId }), created: true };
}

// Marks a course completed and, if that finishes the formation, issues the
// certificate in the same transaction. Refuses an inconsistent validation:
//   - the course must have been opened first (409 not_opened);
//   - the enrolment must be the learner's, the course part of that formation
//     (checked by the caller, and again by the composite foreign keys).
export async function completeCourse(enrollment, course, { user, formation }) {
  const courses = formation.courses;
  return withEnrollmentLock(enrollment.id, async (tx) => {
    const row = await tx.courseProgress.findUnique({
      where: { enrollmentId_courseId: { enrollmentId: enrollment.id, courseId: course.id } },
    });
    if (!row) throw new HttpError(409, 'Open the course before completing it', { reason: 'not_opened' });
    if (row.status !== PROGRESS_STATUS.COMPLETED) {
      await tx.courseProgress.update({
        where: { id: row.id },
        data: { status: PROGRESS_STATUS.COMPLETED, completedAt: new Date() },
      });
    }
    // An already completed enrolment stays completed (e.g. an admin added a required course later).
    const before = await tx.enrollment.findUnique({ where: { id: enrollment.id } });
    if (before.status !== ENROLLMENT_STATUS.COMPLETED) await syncEnrollmentStatus(tx, enrollment.id, courses);
    await issueCertificateIfEligible(tx, { user, formation, enrollmentId: enrollment.id });
  });
}

// "Get my certificate": for a learner who completed the formation but has no
// certificate yet (e.g. the admin switched certification on afterwards).
// Same rules as automatic issuing: 409 with a reason when they are not met.
export async function claimCertificate(enrollment, { user, formation }) {
  return withEnrollmentLock(enrollment.id, async (tx) => {
    const result = await issueCertificateIfEligible(tx, { user, formation, enrollmentId: enrollment.id });
    if (!result.certification) {
      throw new HttpError(409, 'The conditions to get a certificate are not met', { reason: result.reason });
    }
    return result;
  });
}

// Undoes a validation ("I clicked by mistake"). Once a certificate exists the
// learner cannot un-complete anything: the certificate stays valid and consistent.
export async function reopenCourse(enrollment, course, { formation }) {
  const courses = formation.courses;
  return withEnrollmentLock(enrollment.id, async (tx) => {
    const certification = await tx.certification.findUnique({ where: { enrollmentId: enrollment.id } });
    if (certification) {
      throw new HttpError(409, 'A certificate was already issued', { reason: 'certified' });
    }
    await tx.courseProgress.updateMany({
      where: { enrollmentId: enrollment.id, courseId: course.id, status: PROGRESS_STATUS.COMPLETED },
      data: { status: PROGRESS_STATUS.IN_PROGRESS, completedAt: null },
    });
    await syncEnrollmentStatus(tx, enrollment.id, courses);
  });
}

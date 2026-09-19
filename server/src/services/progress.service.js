import { prisma } from '../config/prisma.js';
import { ENROLLMENT_STATUS, PROGRESS_STATUS } from '../constants/elearning.js';
import { HttpError } from '../utils/httpError.js';

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

// Recomputes the enrolment status from the stored progress. Returns the new status.
async function syncEnrollmentStatus(tx, enrollmentId, courses) {
  const rows = await tx.courseProgress.findMany({ where: { enrollmentId } });
  const { completed, requiredRemaining } = summarizeProgress(courses, rows);
  const finished = completed > 0 && requiredRemaining === 0;
  await tx.enrollment.update({
    where: { id: enrollmentId },
    data: finished
      ? { status: ENROLLMENT_STATUS.COMPLETED, completedAt: new Date() }
      : { status: ENROLLMENT_STATUS.ACTIVE, completedAt: null },
  });
  return finished ? ENROLLMENT_STATUS.COMPLETED : ENROLLMENT_STATUS.ACTIVE;
}

// Marks a course completed. Refuses an inconsistent validation:
//   - the course must have been opened first (409 not_opened);
//   - the enrolment must be the learner's, the course part of that formation
//     (checked by the caller, and again by the composite foreign keys).
export async function completeCourse(enrollment, course, courses) {
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
    // Keeps the original completion date if the enrolment was already completed.
    const before = await tx.enrollment.findUnique({ where: { id: enrollment.id } });
    if (before.status === ENROLLMENT_STATUS.COMPLETED) return;
    await syncEnrollmentStatus(tx, enrollment.id, courses);
  });
}

// Undoes a validation ("I clicked by mistake"). Once a certificate exists the
// learner cannot un-complete anything: the certificate stays valid and consistent.
export async function reopenCourse(enrollment, course, courses) {
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

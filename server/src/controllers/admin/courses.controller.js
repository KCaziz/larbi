import { prisma } from '../../config/prisma.js';
import { toAdminCourse } from '../../serializers/cms.js';
import { sanitizeRichText } from '../../services/sanitize.service.js';
import { removeStored } from '../../services/storage.service.js';
import { HttpError } from '../../utils/httpError.js';

const COURSE_INCLUDE = { media: { orderBy: { createdAt: 'asc' } } };

export async function createCourse(req, res) {
  const formationId = req.params.id;
  const course = await prisma.$transaction(async (tx) => {
    const formation = await tx.formation.findUnique({ where: { id: formationId }, select: { id: true } });
    if (!formation) throw new HttpError(404, 'Not found');
    const last = await tx.course.aggregate({ where: { formationId }, _max: { position: true } });
    return tx.course.create({
      data: { formationId, title: req.body.title, position: (last._max.position ?? -1) + 1 },
      include: COURSE_INCLUDE,
    });
  });
  res.status(201).json({ course: toAdminCourse(course) });
}

export async function updateCourse(req, res) {
  const data = { ...req.body };
  // Rich text is sanitised on the server, whatever the editor sent.
  if (data.body !== undefined) data.body = data.body === null ? null : sanitizeRichText(data.body);
  const course = await prisma.course.update({ where: { id: req.params.id }, data, include: COURSE_INCLUDE });
  res.json({ course: toAdminCourse(course) });
}

export async function deleteCourse(req, res) {
  const course = await prisma.course.findUnique({ where: { id: req.params.id }, include: COURSE_INCLUDE });
  if (!course) throw new HttpError(404, 'Not found');

  // Delete, then close the gap so positions stay 0..n-1.
  await prisma.$transaction(async (tx) => {
    await tx.course.delete({ where: { id: course.id } });
    const rest = await tx.course.findMany({
      where: { formationId: course.formationId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      select: { id: true },
    });
    await Promise.all(rest.map((c, index) => tx.course.update({ where: { id: c.id }, data: { position: index } })));
  });
  await removeStored(course.media.map((m) => m.storageKey));
  res.status(204).end();
}

// Body: the complete list of the formation's course ids in the desired order.
// It must be EXACTLY the current set: no missing, extra, foreign or duplicate id.
export async function reorderCourses(req, res) {
  const formationId = req.params.id;
  const { courseIds } = req.body;

  const courses = await prisma.$transaction(async (tx) => {
    const current = await tx.course.findMany({ where: { formationId }, select: { id: true } });
    const currentIds = new Set(current.map((c) => c.id));
    const sameSet =
      courseIds.length === currentIds.size &&
      new Set(courseIds).size === courseIds.length &&
      courseIds.every((id) => currentIds.has(id));
    if (!sameSet) throw new HttpError(400, 'courseIds must list every course of the formation exactly once');

    await Promise.all(courseIds.map((id, index) => tx.course.update({ where: { id }, data: { position: index } })));
    return tx.course.findMany({
      where: { formationId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      include: COURSE_INCLUDE,
    });
  });
  res.json({ courses: courses.map(toAdminCourse) });
}

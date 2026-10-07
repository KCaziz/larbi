import { prisma } from '../../config/prisma.js';
import { toAdminCourse } from '../../serializers/cms.js';
import { sanitizeRichText } from '../../services/sanitize.service.js';
import { lockLesson, currentBlockIds, renumberBlocks } from '../../services/blocks.service.js';
import { applyOutline, currentOutline, lastOrNewSection, renumber } from '../../services/outline.service.js';
import { removeStored } from '../../services/storage.service.js';
import { HttpError } from '../../utils/httpError.js';

const COURSE_INCLUDE = {
  media: { orderBy: { createdAt: 'asc' } },
  blocks: { orderBy: { position: 'asc' }, include: { media: true } },
};

export async function createCourse(req, res) {
  const formationId = req.params.id;
  const course = await prisma.$transaction(async (tx) => {
    const formation = await tx.formation.findUnique({ where: { id: formationId }, select: { id: true } });
    if (!formation) throw new HttpError(404, 'Not found');
    // The new lesson goes to the requested chapter (which must belong to this formation),
    // otherwise to the last chapter (created if the formation has none yet).
    let section;
    if (req.body.sectionId) {
      section = await tx.section.findFirst({ where: { id: req.body.sectionId, formationId } });
      if (!section) throw new HttpError(400, 'Unknown chapter');
    } else {
      section = await lastOrNewSection(tx, formationId);
    }
    const created = await tx.course.create({
      data: { formationId, sectionId: section.id, title: req.body.title, position: 1_000_000 },
      include: COURSE_INCLUDE,
    });
    // Put it at the END of its chapter and renumber the global order.
    const plan = await currentOutline(tx, formationId);
    for (const chapter of plan) {
      chapter.courseIds = chapter.courseIds.filter((id) => id !== created.id);
      if (chapter.id === section.id) chapter.courseIds.push(created.id);
    }
    await applyOutline(tx, formationId, plan);
    return tx.course.findUnique({ where: { id: created.id }, include: COURSE_INCLUDE });
  });
  res.status(201).json({ course: toAdminCourse(course) });
}

export async function updateCourse(req, res) {
  const data = { ...req.body };
  // Rich text is sanitised on the server, whatever the editor sent.
  if (data.body !== undefined) data.body = data.body === null ? null : sanitizeRichText(data.body);
  const course = await prisma.$transaction(async (tx) => {
    if (data.body !== undefined) await lockLesson(tx, req.params.id);
    const updated = await tx.course.update({ where: { id: req.params.id }, data });
    // `body` is the older way of writing a lesson (before blocks): it is kept in step with the
    // FIRST text block so that both ways always show the same thing.
    if (data.body !== undefined) await syncBodyBlock(tx, updated.id, data.body);
    return tx.course.findUnique({ where: { id: updated.id }, include: COURSE_INCLUDE });
  });
  res.json({ course: toAdminCourse(course) });
}

// Makes the first text block of the lesson say `html` (creating it at the top if needed).
async function syncBodyBlock(tx, courseId, html) {
  const blocks = await tx.lessonBlock.findMany({ where: { courseId }, orderBy: { position: 'asc' } });
  const first = blocks.find((b) => b.type === 'text');
  if (first) {
    await tx.lessonBlock.update({ where: { id: first.id }, data: { data: { html: html ?? '' } } });
  } else if (html) {
    const created = await tx.lessonBlock.create({ data: { courseId, type: 'text', position: 0, data: { html } } });
    await renumberBlocks(tx, [created.id, ...(await currentBlockIds(tx, courseId)).filter((id) => id !== created.id)]);
  }
}

export async function deleteCourse(req, res) {
  const course = await prisma.course.findUnique({ where: { id: req.params.id }, include: COURSE_INCLUDE });
  if (!course) throw new HttpError(404, 'Not found');

  // Delete, then close the gap so positions stay 0..n-1.
  await prisma.$transaction(async (tx) => {
    await tx.course.delete({ where: { id: course.id } });
    await renumber(tx, course.formationId);
  });
  await removeStored(course.media.map((m) => m.storageKey));
  res.status(204).end();
}

// Body: the complete list of the formation's lesson ids in the desired order (older clients,
// before chapters existed). Every lesson keeps its chapter; the order given applies inside
// each chapter. It must be EXACTLY the current set: no missing, extra, foreign or duplicate id.
export async function reorderCourses(req, res) {
  const formationId = req.params.id;
  const { courseIds } = req.body;

  const courses = await prisma.$transaction(async (tx) => {
    const plan = await currentOutline(tx, formationId);
    const rank = new Map(courseIds.map((id, index) => [id, index]));
    const current = new Set(plan.flatMap((s) => s.courseIds));
    const sameSet = courseIds.length === current.size && new Set(courseIds).size === courseIds.length && courseIds.every((id) => current.has(id));
    if (!sameSet) throw new HttpError(400, 'courseIds must list every course of the formation exactly once');
    await applyOutline(tx, formationId, plan.map((s) => ({ ...s, courseIds: [...s.courseIds].sort((a, b) => rank.get(a) - rank.get(b)) })));
    return tx.course.findMany({
      where: { formationId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      include: COURSE_INCLUDE,
    });
  });
  res.json({ courses: courses.map(toAdminCourse) });
}

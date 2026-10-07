import { prisma } from '../../config/prisma.js';
import { toAdminSection } from '../../serializers/cms.js';
import { applyOutline } from '../../services/outline.service.js';
import { HttpError } from '../../utils/httpError.js';
import { loadFormation } from './formations.controller.js';
import { toAdminFormation } from '../../serializers/cms.js';

// Chapters of a formation (P3-11): create, rename, delete, reorder with the lessons.

export async function createSection(req, res) {
  const formationId = req.params.id;
  const section = await prisma.$transaction(async (tx) => {
    if (!(await tx.formation.findUnique({ where: { id: formationId }, select: { id: true } }))) {
      throw new HttpError(404, 'Not found');
    }
    const last = await tx.section.aggregate({ where: { formationId }, _max: { position: true } });
    return tx.section.create({
      data: { formationId, title: req.body.title, position: (last._max.position ?? -1) + 1 },
    });
  });
  res.status(201).json({ section: toAdminSection(section) });
}

export async function updateSection(req, res) {
  const section = await prisma.section.update({ where: { id: req.params.id }, data: req.body });
  res.json({ section: toAdminSection(section) });
}

// A chapter that still holds lessons cannot be deleted: the progress of learners lives on
// the lessons, so they must be moved (or deleted on purpose) first.
export async function deleteSection(req, res) {
  await prisma.$transaction(async (tx) => {
    const section = await tx.section.findUnique({ where: { id: req.params.id } });
    if (!section) throw new HttpError(404, 'Not found');
    const lessons = await tx.course.count({ where: { sectionId: section.id } });
    if (lessons > 0) {
      throw new HttpError(409, 'The chapter still contains lessons: move or delete them first', { lessons });
    }
    await tx.section.delete({ where: { id: section.id } });
    const rest = await tx.section.findMany({ where: { formationId: section.formationId }, orderBy: [{ position: 'asc' }, { createdAt: 'asc' }], select: { id: true } });
    await Promise.all(rest.map((s, index) => tx.section.update({ where: { id: s.id }, data: { position: index } })));
  });
  res.status(204).end();
}

// The whole plan in one request: chapters in order, each with its lessons in order (a
// lesson can move from one chapter to another). Atomic: either everything is applied or
// nothing (a plan that misses or repeats a chapter or a lesson is refused with a 400).
export async function saveOutline(req, res) {
  await prisma.$transaction((tx) => applyOutline(tx, req.params.id, req.body.sections));
  res.json({ formation: toAdminFormation(await loadFormation(req.params.id)) });
}

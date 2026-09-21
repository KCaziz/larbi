import { prisma } from '../../config/prisma.js';
import { toAdminCourse, toAdminFormation } from '../../serializers/cms.js';
import { duplicateFormation, duplicateLesson, duplicateSection } from '../../services/duplicate.service.js';
import { FORMATION_INCLUDE, loadFormation } from './formations.controller.js';

// Duplication of content (P3-14). The answer is the new content as the editor needs it.

export async function duplicateLessonRoute(req, res) {
  const { courseId } = await duplicateLesson(req.params.id, req.user.id);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { media: { orderBy: { createdAt: 'asc' } }, blocks: { orderBy: { position: 'asc' }, include: { media: true } } },
  });
  res.status(201).json({ course: toAdminCourse(course) });
}

export async function duplicateSectionRoute(req, res) {
  const { formationId } = await duplicateSection(req.params.id, req.user.id);
  res.status(201).json({ formation: toAdminFormation(await loadFormation(formationId)) });
}

export async function duplicateFormationRoute(req, res) {
  const { formationId } = await duplicateFormation(req.params.id, req.user.id);
  const copy = await prisma.formation.findUnique({ where: { id: formationId }, include: FORMATION_INCLUDE });
  res.status(201).json({ formation: toAdminFormation(copy) });
}

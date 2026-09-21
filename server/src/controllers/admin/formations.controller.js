import { prisma } from '../../config/prisma.js';
import { FORMATION_STATUS } from '../../constants/elearning.js';
import { toAdminFormation, toMedia } from '../../serializers/cms.js';
import { formationReadiness } from '../../services/readiness.service.js';
import { uniqueSlug } from '../../services/slug.service.js';
import { removeStored } from '../../services/storage.service.js';
import { HttpError } from '../../utils/httpError.js';

export const FORMATION_INCLUDE = {
  category: true,
  coverImage: true,
  sections: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] },
  quizzes: { include: { questions: { include: { choices: true } } } },
  courses: {
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    include: {
      media: { orderBy: { createdAt: 'asc' } },
      blocks: { orderBy: { position: 'asc' }, include: { media: true } },
    },
  },
};

export async function loadFormation(id) {
  const formation = await prisma.formation.findUnique({ where: { id }, include: FORMATION_INCLUDE });
  if (!formation) throw new HttpError(404, 'Not found');
  return formation;
}

export async function listFormations(req, res) {
  const rows = await prisma.formation.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { coverImage: true, category: true, _count: { select: { courses: true, enrollments: true } } },
  });
  res.json({
    formations: rows.map((f) => ({
      id: f.id,
      title: f.title,
      status: f.status,
      requiredAccessLevel: f.requiredAccessLevel,
      category: f.category ? { id: f.category.id, name: f.category.name } : null,
      cover: toMedia(f.coverImage),
      subtitle: f.subtitle,
      level: f.level,
      courseCount: f._count.courses,
      enrollmentCount: f._count.enrollments,
      publishedAt: f.publishedAt,
      updatedAt: f.updatedAt,
    })),
  });
}

export async function createFormation(req, res) {
  const slug = await uniqueSlug(
    req.body.title,
    async (s) => Boolean(await prisma.formation.findUnique({ where: { slug: s }, select: { id: true } })),
    'formation',
  );
  const created = await prisma.formation.create({
    data: { slug, title: req.body.title, description: '', createdById: req.user.id },
    include: FORMATION_INCLUDE,
  });
  res.status(201).json({ formation: toAdminFormation(created) });
}

export async function getFormation(req, res) {
  res.json({ formation: toAdminFormation(await loadFormation(req.params.id)) });
}

export async function updateFormation(req, res) {
  const { certificationEnabled, certificationTitle, certificationDescription, ...rest } = req.body;

  if (rest.categoryId) {
    const category = await prisma.formationCategory.findUnique({ where: { id: rest.categoryId } });
    if (!category) throw new HttpError(400, 'Unknown category');
  }

  const data = { ...rest };
  if (certificationEnabled !== undefined) data.certificationEnabled = certificationEnabled;
  if (certificationTitle !== undefined) data.certificationTitle = certificationTitle;
  if (certificationDescription !== undefined) data.certificationDescription = certificationDescription;

  // Status is deliberately not editable here: only publish / unpublish change it.
  const updated = await prisma.formation.update({
    where: { id: req.params.id },
    data,
    include: FORMATION_INCLUDE,
  });
  res.json({ formation: toAdminFormation(updated) });
}

export async function publishFormation(req, res) {
  const formation = await loadFormation(req.params.id);
  const readiness = formationReadiness(formation);
  if (!readiness.ready) {
    throw new HttpError(422, 'Formation is not ready to be published', {
      missing: readiness.items.filter((i) => !i.ok).map((i) => i.key),
    });
  }
  const updated =
    formation.status === FORMATION_STATUS.PUBLISHED
      ? formation
      : await prisma.formation.update({
          where: { id: formation.id },
          data: { status: FORMATION_STATUS.PUBLISHED, publishedAt: new Date() },
          include: FORMATION_INCLUDE,
        });
  res.json({ formation: toAdminFormation(updated) });
}

// Moves a formation to any status (draft, in review, published, archived). Publishing is
// the same guarded operation as before (422 + the list of what is missing); every other
// status simply takes the formation out of the catalogue: the learners already enrolled
// keep their access and their progress.
export async function setFormationStatus(req, res) {
  const { status } = req.body;
  if (status === FORMATION_STATUS.PUBLISHED) return publishFormation(req, res);
  const updated = await prisma.formation.update({
    where: { id: req.params.id },
    data: { status, publishedAt: null },
    include: FORMATION_INCLUDE,
  });
  return res.json({ formation: toAdminFormation(updated) });
}

export async function unpublishFormation(req, res) {
  const updated = await prisma.formation.update({
    where: { id: req.params.id },
    data: { status: FORMATION_STATUS.DRAFT, publishedAt: null },
    include: FORMATION_INCLUDE,
  });
  res.json({ formation: toAdminFormation(updated) });
}

export async function deleteFormation(req, res) {
  const formation = await loadFormation(req.params.id);
  const enrollments = await prisma.enrollment.count({ where: { formationId: formation.id } });
  if (enrollments > 0) {
    throw new HttpError(409, 'Formation has enrolled learners: unpublish it instead', { enrollments });
  }
  const keys = [
    ...formation.courses.flatMap((c) => c.media.map((m) => m.storageKey)),
    ...(formation.coverImage ? [formation.coverImage.storageKey] : []),
  ];
  await prisma.formation.delete({ where: { id: formation.id } });
  // The cover row is not covered by the formation's cascade: remove it explicitly.
  if (formation.coverImageId) await prisma.media.delete({ where: { id: formation.coverImageId } });
  await removeStored(keys);
  res.status(204).end();
}

export async function listCategories(req, res) {
  const categories = await prisma.formationCategory.findMany({ orderBy: { name: 'asc' } });
  res.json({ categories: categories.map((c) => ({ id: c.id, name: c.name })) });
}

export async function createCategory(req, res) {
  const slug = await uniqueSlug(
    req.body.name,
    async (s) => Boolean(await prisma.formationCategory.findUnique({ where: { slug: s }, select: { id: true } })),
    'categorie',
  );
  const category = await prisma.formationCategory.create({ data: { slug, name: req.body.name } });
  res.status(201).json({ category: { id: category.id, name: category.name } });
}

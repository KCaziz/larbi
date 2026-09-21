import { HttpError } from '../utils/httpError.js';

// The PLAN of a formation (P3-11): ordered chapters, each with its ordered lessons.
//
// Storage rules (kept so that everything written before chapters still works):
//   - sections.position   : order of the chapters (0..n-1)
//   - courses.sectionId   : chapter of the lesson
//   - courses.position    : GLOBAL order of the lessons in the formation (chapters first, then
//                           the order inside the chapter). The learner pages and the progress
//                           code read this column unchanged (previous / next lesson...).
// Every function below takes a transaction client (`tx`) and must be called inside one.

export const DEFAULT_SECTION_TITLE = 'Chapitre 1';

// Returns the last chapter of the formation, creating "Chapitre 1" when there is none.
export async function lastOrNewSection(tx, formationId) {
  const last = await tx.section.findFirst({ where: { formationId }, orderBy: { position: 'desc' } });
  if (last) return last;
  return tx.section.create({ data: { formationId, title: DEFAULT_SECTION_TITLE, position: 0 } });
}

// Writes a complete plan. `plan` = [{ id: sectionId, courseIds: [lessonId...] }, ...] in the
// wanted order. It must list EVERY chapter and EVERY lesson of the formation exactly once:
// nothing missing, nothing foreign, nothing duplicated (otherwise 400 and nothing changes).
export async function applyOutline(tx, formationId, plan) {
  const [sections, courses] = await Promise.all([
    tx.section.findMany({ where: { formationId }, select: { id: true } }),
    tx.course.findMany({ where: { formationId }, select: { id: true } }),
  ]);

  const sectionIds = plan.map((s) => s.id);
  const courseIds = plan.flatMap((s) => s.courseIds);
  const same = (given, current) => given.length === current.length && new Set(given).size === given.length && current.every((c) => given.includes(c.id));
  if (!same(sectionIds, sections)) {
    throw new HttpError(400, 'The plan must list every chapter of the formation exactly once');
  }
  if (!same(courseIds, courses)) {
    throw new HttpError(400, 'The plan must list every lesson of the formation exactly once');
  }

  let global = 0;
  for (const [sectionIndex, section] of plan.entries()) {
    await tx.section.update({ where: { id: section.id }, data: { position: sectionIndex } });
    for (const courseId of section.courseIds) {
      await tx.course.update({ where: { id: courseId }, data: { sectionId: section.id, position: global } });
      global += 1;
    }
  }
}

// Reads the current plan in the shape applyOutline expects. A lesson that has no chapter
// (data written before chapters existed) is placed in the FIRST chapter, created if needed.
export async function currentOutline(tx, formationId) {
  let sections = await tx.section.findMany({ where: { formationId }, orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] });
  const courses = await tx.course.findMany({
    where: { formationId },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, sectionId: true },
  });
  if (sections.length === 0 && courses.length > 0) sections = [await lastOrNewSection(tx, formationId)];
  const known = new Set(sections.map((s) => s.id));
  return sections.map((s, index) => ({
    id: s.id,
    courseIds: courses.filter((c) => (known.has(c.sectionId) ? c.sectionId === s.id : index === 0)).map((c) => c.id),
  }));
}

// Renumbers positions after a deletion or an insertion, keeping the current order.
export async function renumber(tx, formationId) {
  await applyOutline(tx, formationId, await currentOutline(tx, formationId));
}

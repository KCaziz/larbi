import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { FORMATION_STATUS } from '../constants/elearning.js';
import { HttpError } from '../utils/httpError.js';
import { applyOutline, currentOutline } from './outline.service.js';
import { uniqueSlug } from './slug.service.js';
import { PRIVATE_DIR, pathForKey, removeStored } from './storage.service.js';

// Duplication (P3-14): a lesson, a chapter or a whole formation, as an independent copy.
//
// What is copied: the content (text, blocks, files, quizzes with their questions and answers,
// pedagogical presentation, certification settings). What is NEVER copied: enrolments, progress,
// certificates, quiz attempts, history of versions, and the published status (a copy of a
// formation is a draft). Files are copied on disk under NEW random names, so deleting the copy
// never touches the original. If anything fails, every file already copied is removed and the
// database is left untouched (one transaction).

const COPY_SUFFIX = ' (copie)';
const ADD_TIMEOUT = { timeout: 60_000, maxWait: 10_000 };

// Copies stored files, remembering them so a failure can remove them.
class FileCopier {
  constructor() {
    this.keys = [];
  }

  async copy(storageKey) {
    const key = `${randomBytes(16).toString('hex')}${path.extname(storageKey)}`;
    try {
      await fs.copyFile(pathForKey(storageKey), path.join(PRIVATE_DIR, key));
    } catch (err) {
      if (err?.code === 'ENOENT') throw new HttpError(409, 'A file of this content is missing and cannot be copied');
      throw err;
    }
    this.keys.push(key);
    return key;
  }

  discard() {
    return removeStored(this.keys);
  }
}

// Runs `work(tx, copier)` in a transaction; a failure removes the copied files.
async function run(work) {
  const copier = new FileCopier();
  try {
    return await prisma.$transaction((tx) => work(tx, copier), ADD_TIMEOUT);
  } catch (err) {
    await copier.discard();
    throw err;
  }
}

const withCopySuffix = (title) => `${title.slice(0, 150 - COPY_SUFFIX.length)}${COPY_SUFFIX}`;

async function cloneMedia(tx, copier, media, courseId, userId) {
  const storageKey = await copier.copy(media.storageKey);
  return tx.media.create({
    data: {
      kind: media.kind,
      storageKey,
      originalName: media.originalName,
      mimeType: media.mimeType,
      sizeBytes: media.sizeBytes,
      courseId,
      uploadedById: userId,
    },
  });
}

const LESSON_SOURCE = { blocks: { orderBy: { position: 'asc' }, include: { media: true } } };

// Copies one lesson (fields, blocks, files) into `sectionId`. Position is fixed afterwards.
async function copyLesson(tx, copier, source, { sectionId, title, userId }) {
  const created = await tx.course.create({
    data: {
      formationId: source.formationId,
      sectionId,
      title,
      summary: source.summary,
      body: source.body,
      position: 1_000_000,
      isRequired: source.isRequired,
      estimatedMinutes: source.estimatedMinutes,
    },
  });
  for (const [position, block] of source.blocks.entries()) {
    const media = block.media ? await cloneMedia(tx, copier, block.media, created.id, userId) : null;
    await tx.lessonBlock.create({ data: { courseId: created.id, type: block.type, position, data: block.data, mediaId: media?.id ?? null } });
  }
  return created;
}

// Puts `newIds` right after `afterId` in the plan (which already contains them, at the end).
async function placeAfter(tx, formationId, { afterSectionId, afterLessonId, newSectionId, newLessonIds }) {
  const plan = await currentOutline(tx, formationId);
  if (newSectionId) {
    const moving = plan.find((s) => s.id === newSectionId);
    const rest = plan.filter((s) => s.id !== newSectionId);
    const at = rest.findIndex((s) => s.id === afterSectionId);
    rest.splice(at + 1, 0, moving);
    await applyOutline(tx, formationId, rest);
    return;
  }
  const next = plan.map((s) => ({ ...s, courseIds: s.courseIds.filter((id) => !newLessonIds.includes(id)) }));
  const target = next.find((s) => s.courseIds.includes(afterLessonId));
  target.courseIds.splice(target.courseIds.indexOf(afterLessonId) + 1, 0, ...newLessonIds);
  await applyOutline(tx, formationId, next);
}

export function duplicateLesson(lessonId, userId) {
  return run(async (tx, copier) => {
    const source = await tx.course.findUnique({ where: { id: lessonId }, include: LESSON_SOURCE });
    if (!source) throw new HttpError(404, 'Not found');
    const created = await copyLesson(tx, copier, source, { sectionId: source.sectionId, title: withCopySuffix(source.title), userId });
    await placeAfter(tx, source.formationId, { afterLessonId: source.id, newLessonIds: [created.id] });
    return { formationId: source.formationId, courseId: created.id };
  });
}

export function duplicateSection(sectionId, userId) {
  return run(async (tx, copier) => {
    const source = await tx.section.findUnique({ where: { id: sectionId } });
    if (!source) throw new HttpError(404, 'Not found');
    const lessons = await tx.course.findMany({ where: { sectionId }, orderBy: { position: 'asc' }, include: LESSON_SOURCE });
    const section = await tx.section.create({
      data: { formationId: source.formationId, title: withCopySuffix(source.title), description: source.description, position: 1_000_000 },
    });
    for (const lesson of lessons) await copyLesson(tx, copier, lesson, { sectionId: section.id, title: lesson.title, userId });
    await placeAfter(tx, source.formationId, { afterSectionId: source.id, newSectionId: section.id });
    return { formationId: source.formationId, sectionId: section.id };
  });
}

// A whole formation: presentation, chapters, lessons (blocks and files), cover, quizzes.
export function duplicateFormation(formationId, userId) {
  return run(async (tx, copier) => {
    const source = await tx.formation.findUnique({
      where: { id: formationId },
      include: {
        sections: { orderBy: { position: 'asc' } },
        courses: { orderBy: { position: 'asc' }, include: LESSON_SOURCE },
        coverImage: true,
        quizzes: { include: { questions: { orderBy: { position: 'asc' }, include: { choices: { orderBy: { position: 'asc' } } } } } },
      },
    });
    if (!source) throw new HttpError(404, 'Not found');

    const title = withCopySuffix(source.title);
    const slug = await uniqueSlug(title, async (s) => Boolean(await tx.formation.findUnique({ where: { slug: s }, select: { id: true } })), 'formation');
    const copy = await tx.formation.create({
      data: {
        slug,
        title,
        subtitle: source.subtitle,
        description: source.description,
        level: source.level,
        objectives: source.objectives,
        prerequisites: source.prerequisites,
        requiredAccessLevel: source.requiredAccessLevel,
        categoryId: source.categoryId,
        certificationEnabled: source.certificationEnabled,
        certificationTitle: source.certificationTitle,
        certificationDescription: source.certificationDescription,
        status: FORMATION_STATUS.DRAFT,
        createdById: userId,
      },
    });

    if (source.coverImage) {
      const storageKey = await copier.copy(source.coverImage.storageKey);
      const cover = await tx.media.create({
        data: { kind: source.coverImage.kind, storageKey, originalName: source.coverImage.originalName, mimeType: source.coverImage.mimeType, sizeBytes: source.coverImage.sizeBytes, uploadedById: userId },
      });
      await tx.formation.update({ where: { id: copy.id }, data: { coverImageId: cover.id } });
    }

    const sectionMap = new Map();
    for (const section of source.sections) {
      const created = await tx.section.create({ data: { formationId: copy.id, title: section.title, description: section.description, position: section.position } });
      sectionMap.set(section.id, created.id);
    }
    const lessonMap = new Map();
    for (const lesson of source.courses) {
      const created = await tx.course.create({
        data: {
          formationId: copy.id,
          sectionId: sectionMap.get(lesson.sectionId) ?? null,
          title: lesson.title,
          summary: lesson.summary,
          body: lesson.body,
          position: lesson.position,
          isRequired: lesson.isRequired,
          estimatedMinutes: lesson.estimatedMinutes,
        },
      });
      lessonMap.set(lesson.id, created.id);
      for (const [position, block] of lesson.blocks.entries()) {
        const media = block.media ? await cloneMedia(tx, copier, block.media, created.id, userId) : null;
        await tx.lessonBlock.create({ data: { courseId: created.id, type: block.type, position, data: block.data, mediaId: media?.id ?? null } });
      }
    }

    for (const quiz of source.quizzes) {
      await tx.quiz.create({
        data: {
          formationId: copy.id,
          scope: quiz.scope,
          courseId: quiz.courseId ? lessonMap.get(quiz.courseId) : null,
          sectionId: quiz.sectionId ? sectionMap.get(quiz.sectionId) : null,
          finalFormationId: quiz.scope === 'formation' ? copy.id : null,
          title: quiz.title,
          instructions: quiz.instructions,
          passingScore: quiz.passingScore,
          maxAttempts: quiz.maxAttempts,
          shuffleQuestions: quiz.shuffleQuestions,
          isRequired: quiz.isRequired,
          showCorrection: quiz.showCorrection,
          isComplete: quiz.isComplete,
          questions: {
            create: quiz.questions.map((q) => ({
              type: q.type,
              position: q.position,
              prompt: q.prompt,
              explanation: q.explanation,
              points: q.points,
              acceptedAnswers: q.acceptedAnswers,
              choices: { create: q.choices.map((c) => ({ text: c.text, isCorrect: c.isCorrect, position: c.position })) },
            })),
          },
        },
      });
    }
    return { formationId: copy.id };
  });
}

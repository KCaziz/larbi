import { prisma } from '../../config/prisma.js';
import { MEDIA_KIND } from '../../constants/elearning.js';
import { toAdminBlock } from '../../serializers/cms.js';
import {
  BLOCK_FOR_MEDIA_KIND,
  MAX_BLOCKS_PER_LESSON,
  currentBlockIds,
  isMediaBlock,
  lockLesson,
  renumberBlocks,
  snapshotIfDue,
  takeSnapshot,
  validateBlockData,
} from '../../services/blocks.service.js';
import { discardTemp, ingestUpload, removeStored } from '../../services/storage.service.js';
import { HttpError } from '../../utils/httpError.js';

// Blocks of a lesson (P3-12). Every operation locks the lesson for the duration of its
// transaction (two editors cannot renumber at the same time) and keeps the history: the
// state before an edit is saved as a revision when the last one is old enough.

const WITH_MEDIA = { media: true };

// Inserts `blockId` after `afterId` (or at the end) in the list of ids and renumbers.
async function place(tx, courseId, blockId, afterId) {
  const ids = (await currentBlockIds(tx, courseId)).filter((id) => id !== blockId);
  if (afterId) {
    const index = ids.indexOf(afterId);
    if (index < 0) throw new HttpError(400, 'Unknown block to insert after');
    ids.splice(index + 1, 0, blockId);
  } else {
    ids.push(blockId);
  }
  await renumberBlocks(tx, ids);
}

async function assertRoom(tx, courseId) {
  if ((await tx.lessonBlock.count({ where: { courseId } })) >= MAX_BLOCKS_PER_LESSON) {
    throw new HttpError(409, 'This lesson has reached the maximum number of blocks', { max: MAX_BLOCKS_PER_LESSON });
  }
}

export async function createBlock(req, res) {
  const courseId = req.params.id;
  const { type, data, afterId } = req.body;
  if (isMediaBlock(type)) throw new HttpError(400, 'Image, video and file blocks are created by uploading a file');
  const clean = validateBlockData(type, data);

  const block = await prisma.$transaction(async (tx) => {
    await lockLesson(tx, courseId);
    await assertRoom(tx, courseId);
    await snapshotIfDue(tx, courseId, req.user.id);
    const created = await tx.lessonBlock.create({ data: { courseId, type, position: 0, data: clean } });
    await place(tx, courseId, created.id, afterId);
    return tx.lessonBlock.findUnique({ where: { id: created.id }, include: WITH_MEDIA });
  });
  res.status(201).json({ block: toAdminBlock(block) });
}

// A file uploaded from the editor becomes a media row of the lesson AND the block that
// shows it, atomically. The block type follows the REAL type of the file (sniffed from its
// content by the storage service), never what the browser claims.
export async function uploadBlockFile(req, res) {
  const courseId = req.params.id;
  const afterId = typeof req.body?.afterId === 'string' && req.body.afterId ? req.body.afterId : undefined;

  try {
    if (!(await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }))) throw new HttpError(404, 'Not found');
  } catch (err) {
    await discardTemp(req.file);
    throw err;
  }
  const stored = await ingestUpload(req.file, [MEDIA_KIND.IMAGE, MEDIA_KIND.VIDEO, MEDIA_KIND.DOCUMENT]);

  try {
    const block = await prisma.$transaction(async (tx) => {
      await lockLesson(tx, courseId);
      await assertRoom(tx, courseId);
      await snapshotIfDue(tx, courseId, req.user.id);
      const media = await tx.media.create({ data: { ...stored, courseId, uploadedById: req.user.id } });
      const type = BLOCK_FOR_MEDIA_KIND[media.kind];
      const defaults = {
        image: { alt: media.originalName, caption: '' },
        video: { caption: '' },
        file: { label: media.originalName, description: '' },
      }[type];
      const created = await tx.lessonBlock.create({ data: { courseId, type, position: 0, data: defaults, mediaId: media.id } });
      await place(tx, courseId, created.id, afterId);
      return tx.lessonBlock.findUnique({ where: { id: created.id }, include: WITH_MEDIA });
    });
    res.status(201).json({ block: toAdminBlock(block) });
  } catch (err) {
    await removeStored([stored.storageKey]);
    throw err;
  }
}

export async function updateBlock(req, res) {
  const block = await prisma.$transaction(async (tx) => {
    const existing = await tx.lessonBlock.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new HttpError(404, 'Not found');
    await lockLesson(tx, existing.courseId);
    await snapshotIfDue(tx, existing.courseId, req.user.id);
    return tx.lessonBlock.update({
      where: { id: existing.id },
      data: { data: validateBlockData(existing.type, req.body.data) },
      include: WITH_MEDIA,
    });
  });
  res.json({ block: toAdminBlock(block) });
}

export async function duplicateBlock(req, res) {
  const block = await prisma.$transaction(async (tx) => {
    const existing = await tx.lessonBlock.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new HttpError(404, 'Not found');
    if (isMediaBlock(existing.type)) throw new HttpError(400, 'A block that shows a file cannot be duplicated: upload the file again');
    await lockLesson(tx, existing.courseId);
    await assertRoom(tx, existing.courseId);
    await snapshotIfDue(tx, existing.courseId, req.user.id);
    const created = await tx.lessonBlock.create({ data: { courseId: existing.courseId, type: existing.type, position: 0, data: existing.data } });
    await place(tx, existing.courseId, created.id, existing.id);
    return tx.lessonBlock.findUnique({ where: { id: created.id }, include: WITH_MEDIA });
  });
  res.status(201).json({ block: toAdminBlock(block) });
}

// Deleting a block that shows a file deletes the file too (row and stored file): the file
// only exists to be shown by that block.
export async function deleteBlock(req, res) {
  const keys = [];
  await prisma.$transaction(async (tx) => {
    const existing = await tx.lessonBlock.findUnique({ where: { id: req.params.id }, include: WITH_MEDIA });
    if (!existing) throw new HttpError(404, 'Not found');
    await lockLesson(tx, existing.courseId);
    await snapshotIfDue(tx, existing.courseId, req.user.id);
    await tx.lessonBlock.delete({ where: { id: existing.id } });
    if (existing.media) {
      const others = await tx.lessonBlock.count({ where: { mediaId: existing.media.id } });
      if (others === 0) {
        await tx.media.delete({ where: { id: existing.media.id } });
        keys.push(existing.media.storageKey);
      }
    }
    await renumberBlocks(tx, await currentBlockIds(tx, existing.courseId));
  });
  await removeStored(keys);
  res.status(204).end();
}

// Body: EVERY block id of the lesson, in the wanted order (no missing, extra or repeated id).
export async function reorderBlocks(req, res) {
  const courseId = req.params.id;
  const { blockIds } = req.body;
  const blocks = await prisma.$transaction(async (tx) => {
    await lockLesson(tx, courseId);
    const current = await currentBlockIds(tx, courseId);
    const same = blockIds.length === current.length && new Set(blockIds).size === blockIds.length && blockIds.every((id) => current.includes(id));
    if (!same) throw new HttpError(400, 'blockIds must list every block of the lesson exactly once');
    await snapshotIfDue(tx, courseId, req.user.id);
    await renumberBlocks(tx, blockIds);
    return tx.lessonBlock.findMany({ where: { courseId }, orderBy: { position: 'asc' }, include: WITH_MEDIA });
  });
  res.json({ blocks: blocks.map(toAdminBlock) });
}

// ---- history --------------------------------------------------------------------
const toRevision = (r) => ({
  id: r.id,
  label: r.label,
  createdAt: r.createdAt,
  author: r.createdBy ? { name: r.createdBy.name } : null,
  blockCount: Array.isArray(r.blocks) ? r.blocks.length : 0,
});

export async function listRevisions(req, res) {
  if (!(await prisma.course.findUnique({ where: { id: req.params.id }, select: { id: true } }))) throw new HttpError(404, 'Not found');
  const rows = await prisma.lessonRevision.findMany({
    where: { courseId: req.params.id },
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { name: true } } },
  });
  res.json({ revisions: rows.map(toRevision) });
}

// "Save a version" on demand (a named checkpoint).
export async function createRevision(req, res) {
  const courseId = req.params.id;
  const revision = await prisma.$transaction(async (tx) => {
    await lockLesson(tx, courseId);
    return takeSnapshot(tx, courseId, req.user.id, req.body.label ?? null);
  });
  const full = await prisma.lessonRevision.findUnique({ where: { id: revision.id }, include: { createdBy: { select: { name: true } } } });
  res.status(201).json({ revision: toRevision(full) });
}

// Restores a version: the current blocks are saved first (so restoring can itself be
// undone), then replaced. A block whose file no longer exists is skipped: a deleted file
// cannot come back. Files of the blocks that are replaced stay stored (nothing is lost).
export async function restoreRevision(req, res) {
  const courseId = req.params.id;
  const blocks = await prisma.$transaction(async (tx) => {
    await lockLesson(tx, courseId);
    const revision = await tx.lessonRevision.findFirst({ where: { id: req.params.revisionId, courseId } });
    if (!revision) throw new HttpError(404, 'Not found');

    if ((await tx.lessonBlock.count({ where: { courseId } })) > 0) await takeSnapshot(tx, courseId, req.user.id, 'before-restore');
    await tx.lessonBlock.deleteMany({ where: { courseId } });

    const kept = [];
    for (const item of revision.blocks) {
      if (item.mediaId && !(await tx.media.findFirst({ where: { id: item.mediaId, courseId }, select: { id: true } }))) continue;
      kept.push(item);
    }
    for (const [position, item] of kept.entries()) {
      await tx.lessonBlock.create({ data: { courseId, type: item.type, position, data: item.data, mediaId: item.mediaId ?? null } });
    }
    return tx.lessonBlock.findMany({ where: { courseId }, orderBy: { position: 'asc' }, include: WITH_MEDIA });
  });
  res.json({ blocks: blocks.map(toAdminBlock) });
}

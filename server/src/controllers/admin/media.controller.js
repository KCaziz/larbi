import { prisma } from '../../config/prisma.js';
import { MEDIA_KIND } from '../../constants/elearning.js';
import { toMedia } from '../../serializers/cms.js';
import { sendStoredMedia } from '../../services/mediaResponse.js';
import { BLOCK_FOR_MEDIA_KIND, lockLesson } from '../../services/blocks.service.js';
import { discardTemp, ingestUpload, removeStored } from '../../services/storage.service.js';
import { HttpError } from '../../utils/httpError.js';

const ATTACHMENT_KINDS = [MEDIA_KIND.VIDEO, MEDIA_KIND.DOCUMENT, MEDIA_KIND.IMAGE];

// Runs `fn`, and if it fails, throws away the temp file / stored file.
async function withCleanup(file, fn) {
  try {
    return await fn();
  } catch (err) {
    await discardTemp(file);
    throw err;
  }
}

// Cover image of any content that has a "coverImage" (formations, articles).
// "delegate" is the Prisma model. The previous cover (row + file) is replaced.
function coverUploader(delegate) {
  return async function uploadCoverFor(req, res) {
    const owner = await withCleanup(req.file, async () => {
      const found = await delegate.findUnique({
        where: { id: req.params.id },
        include: { coverImage: true },
      });
      if (!found) throw new HttpError(404, 'Not found');
      return found;
    });

    const stored = await ingestUpload(req.file, [MEDIA_KIND.IMAGE]);
    let media;
    try {
      media = await prisma.media.create({ data: { ...stored, uploadedById: req.user.id } });
      await delegate.update({ where: { id: owner.id }, data: { coverImageId: media.id } });
    } catch (err) {
      await removeStored([stored.storageKey]);
      throw err;
    }

    if (owner.coverImage) {
      await prisma.media.delete({ where: { id: owner.coverImage.id } });
      await removeStored([owner.coverImage.storageKey]);
    }
    res.status(201).json({ media: toMedia(media) });
  };
}

// Files attached to a lesson or an article. "ownerField" is the Media column
// that points to the owner (courseId / articleId).
function attachmentUploader(delegate, ownerField, afterCreate) {
  return async function uploadAttachmentFor(req, res) {
    const owner = await withCleanup(req.file, async () => {
      const found = await delegate.findUnique({ where: { id: req.params.id }, select: { id: true } });
      if (!found) throw new HttpError(404, 'Not found');
      return found;
    });

    const stored = await ingestUpload(req.file, ATTACHMENT_KINDS);
    try {
      const media = await prisma.media.create({
        data: { ...stored, [ownerField]: owner.id, uploadedById: req.user.id },
      });
      if (afterCreate) await afterCreate(media);
      res.status(201).json({ media: toMedia(media) });
    } catch (err) {
      await removeStored([stored.storageKey]);
      throw err;
    }
  };
}

export const uploadCover = coverUploader(prisma.formation);
export const uploadArticleCover = coverUploader(prisma.article);
// Older way of attaching a file to a lesson (before blocks): the file now ALSO becomes the
// last block of the lesson, so it is shown by the reader and by the editor like any other.
export const uploadCourseMedia = attachmentUploader(prisma.course, 'courseId', async (media) => {
  const type = BLOCK_FOR_MEDIA_KIND[media.kind];
  const defaults = {
    image: { alt: media.originalName, caption: '' },
    video: { caption: '' },
    file: { label: media.originalName, description: '' },
  }[type];
  await prisma.$transaction(async (tx) => {
    await lockLesson(tx, media.courseId);
    const last = await tx.lessonBlock.aggregate({ where: { courseId: media.courseId }, _max: { position: true } });
    await tx.lessonBlock.create({ data: { courseId: media.courseId, type, position: (last._max.position ?? -1) + 1, data: defaults, mediaId: media.id } });
  });
});
export const uploadArticleMedia = attachmentUploader(prisma.article, 'articleId');

// Media library (P3-16): every uploaded file, across formations and articles,
// with what currently uses it — so an admin can find and remove one without
// having to know which lesson or article it was attached to.
const usageOf = (m) => {
  if (m.coverOf) return { kind: 'formation-cover', label: m.coverOf.title };
  if (m.articleCoverOf) return { kind: 'article-cover', label: m.articleCoverOf.title };
  if (m.course) return { kind: 'course', label: m.course.title };
  if (m.article) return { kind: 'article', label: m.article.title };
  return { kind: 'orphan', label: null };
};

export async function listMedia(req, res) {
  const { page, limit, kind, query } = req.query;
  const filter = {
    ...(kind ? { kind } : {}),
    ...(query ? { originalName: { contains: query, mode: 'insensitive' } } : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.media.count({ where: filter }),
    prisma.media.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        uploadedBy: { select: { name: true } },
        coverOf: { select: { title: true } },
        articleCoverOf: { select: { title: true } },
        course: { select: { title: true } },
        article: { select: { title: true } },
      },
    }),
  ]);
  res.json({
    media: rows.map((m) => ({
      id: m.id,
      kind: m.kind,
      originalName: m.originalName,
      mimeType: m.mimeType,
      sizeBytes: m.sizeBytes,
      uploadedBy: m.uploadedBy?.name ?? null,
      createdAt: m.createdAt,
      usage: usageOf(m),
    })),
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
}

export async function deleteMedia(req, res) {
  const media = await prisma.media.findUnique({ where: { id: req.params.id } });
  if (!media) throw new HttpError(404, 'Not found');
  await prisma.media.delete({ where: { id: media.id } });
  await removeStored([media.storageKey]);
  res.status(204).end();
}

// Admin-only preview inside the CMS. Learners use their own, permission-checked
// routes (learn.controller.js). Nothing here is publicly reachable.
export async function serveMedia(req, res) {
  const media = await prisma.media.findUnique({ where: { id: req.params.id } });
  if (!media) throw new HttpError(404, 'Not found');
  sendStoredMedia(res, media);
}

import { prisma } from '../../config/prisma.js';
import { MEDIA_KIND } from '../../constants/elearning.js';
import { toMedia } from '../../serializers/cms.js';
import { sendStoredMedia } from '../../services/mediaResponse.js';
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
function attachmentUploader(delegate, ownerField) {
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
      res.status(201).json({ media: toMedia(media) });
    } catch (err) {
      await removeStored([stored.storageKey]);
      throw err;
    }
  };
}

export const uploadCover = coverUploader(prisma.formation);
export const uploadArticleCover = coverUploader(prisma.article);
export const uploadCourseMedia = attachmentUploader(prisma.course, 'courseId');
export const uploadArticleMedia = attachmentUploader(prisma.article, 'articleId');

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

import { prisma } from '../../config/prisma.js';
import { MEDIA_KIND } from '../../constants/elearning.js';
import { toMedia } from '../../serializers/cms.js';
import { sendStoredMedia } from '../../services/mediaResponse.js';
import { discardTemp, ingestUpload, removeStored } from '../../services/storage.service.js';
import { HttpError } from '../../utils/httpError.js';

const COURSE_KINDS = [MEDIA_KIND.VIDEO, MEDIA_KIND.DOCUMENT, MEDIA_KIND.IMAGE];

// Runs `fn`, and if it fails, throws away the temp file / stored file.
async function withCleanup(file, fn) {
  try {
    return await fn();
  } catch (err) {
    await discardTemp(file);
    throw err;
  }
}

export async function uploadCover(req, res) {
  const formation = await withCleanup(req.file, async () => {
    const found = await prisma.formation.findUnique({
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
    await prisma.formation.update({ where: { id: formation.id }, data: { coverImageId: media.id } });
  } catch (err) {
    await removeStored([stored.storageKey]);
    throw err;
  }

  // Replace: the previous cover (row + file) is removed.
  if (formation.coverImage) {
    await prisma.media.delete({ where: { id: formation.coverImage.id } });
    await removeStored([formation.coverImage.storageKey]);
  }
  res.status(201).json({ media: toMedia(media) });
}

export async function uploadCourseMedia(req, res) {
  const course = await withCleanup(req.file, async () => {
    const found = await prisma.course.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!found) throw new HttpError(404, 'Not found');
    return found;
  });

  const stored = await ingestUpload(req.file, COURSE_KINDS);
  try {
    const media = await prisma.media.create({
      data: { ...stored, courseId: course.id, uploadedById: req.user.id },
    });
    res.status(201).json({ media: toMedia(media) });
  } catch (err) {
    await removeStored([stored.storageKey]);
    throw err;
  }
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

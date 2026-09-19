import { prisma } from '../../config/prisma.js';
import { ARTICLE_STATUS } from '../../constants/blog.js';
import { toAdminArticle, toAdminArticleRow } from '../../serializers/cms.js';
import { bodyToText, normalizeTags } from '../../services/article.service.js';
import { articleReadiness } from '../../services/readiness.service.js';
import { sanitizeRichText } from '../../services/sanitize.service.js';
import { uniqueSlug } from '../../services/slug.service.js';
import { removeStored } from '../../services/storage.service.js';
import { HttpError } from '../../utils/httpError.js';

// Administration of blog articles. Built on the shared CMS base (P2-02): same
// admin router, same sanitiser, same slug / storage / readiness services.

export const ARTICLE_INCLUDE = {
  category: true,
  coverImage: true,
  author: { select: { name: true } },
  tags: { include: { tag: true } },
  media: { orderBy: { createdAt: 'asc' } },
};

async function loadArticle(id) {
  const article = await prisma.article.findUnique({ where: { id }, include: ARTICLE_INCLUDE });
  if (!article) throw new HttpError(404, 'Not found');
  return article;
}

export async function listArticles(req, res) {
  const rows = await prisma.article.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { category: true, coverImage: true, author: { select: { name: true } } },
  });
  res.json({ articles: rows.map(toAdminArticleRow) });
}

export async function createArticle(req, res) {
  const slug = await uniqueSlug(
    req.body.title,
    async (s) => Boolean(await prisma.article.findUnique({ where: { slug: s }, select: { id: true } })),
    'article',
  );
  const created = await prisma.article.create({
    data: { slug, title: req.body.title, authorId: req.user.id },
    include: ARTICLE_INCLUDE,
  });
  res.status(201).json({ article: toAdminArticle(created) });
}

export async function getArticle(req, res) {
  res.json({ article: toAdminArticle(await loadArticle(req.params.id)) });
}

export async function updateArticle(req, res) {
  const { tags, body, categoryId, ...rest } = req.body;
  const data = { ...rest };

  // Rich text is sanitised on the server, whatever the editor sent. The plain
  // copy (search, reading time) is derived from the SANITISED html.
  if (body !== undefined) {
    const clean = body === null ? null : sanitizeRichText(body);
    data.body = clean;
    data.bodyText = clean ? bodyToText(clean) : '';
  }

  if (categoryId !== undefined) {
    if (categoryId) {
      const category = await prisma.articleCategory.findUnique({ where: { id: categoryId } });
      if (!category) throw new HttpError(400, 'Unknown category');
    }
    data.categoryId = categoryId;
  }

  // The slug (public URL) never changes after creation, and the status only
  // changes through publish / unpublish: neither is accepted here.
  const updated = await prisma.$transaction(async (tx) => {
    if (tags !== undefined) {
      const normalized = normalizeTags(tags);
      await tx.tag.createMany({ data: normalized, skipDuplicates: true });
      const rows = await tx.tag.findMany({ where: { slug: { in: normalized.map((t) => t.slug) } }, select: { id: true } });
      data.tags = { deleteMany: {}, create: rows.map((row) => ({ tagId: row.id })) };
    }
    return tx.article.update({ where: { id: req.params.id }, data, include: ARTICLE_INCLUDE });
  });
  res.json({ article: toAdminArticle(updated) });
}

export async function publishArticle(req, res) {
  const article = await loadArticle(req.params.id);
  const readiness = articleReadiness(article);
  if (!readiness.ready) {
    throw new HttpError(422, 'Article is not ready to be published', {
      missing: readiness.items.filter((i) => !i.ok).map((i) => i.key),
    });
  }
  const updated =
    article.status === ARTICLE_STATUS.PUBLISHED
      ? article
      : await prisma.article.update({
          where: { id: article.id },
          data: { status: ARTICLE_STATUS.PUBLISHED, publishedAt: new Date() },
          include: ARTICLE_INCLUDE,
        });
  res.json({ article: toAdminArticle(updated) });
}

export async function unpublishArticle(req, res) {
  const updated = await prisma.article.update({
    where: { id: req.params.id },
    data: { status: ARTICLE_STATUS.DRAFT, publishedAt: null },
    include: ARTICLE_INCLUDE,
  });
  res.json({ article: toAdminArticle(updated) });
}

export async function deleteArticle(req, res) {
  const article = await loadArticle(req.params.id);
  const keys = [
    ...article.media.map((m) => m.storageKey),
    ...(article.coverImage ? [article.coverImage.storageKey] : []),
  ];
  await prisma.article.delete({ where: { id: article.id } });
  // The cover row is not covered by the article's cascade (its foreign key is on
  // the article side): remove it explicitly.
  if (article.coverImageId) await prisma.media.delete({ where: { id: article.coverImageId } });
  await removeStored(keys);
  res.status(204).end();
}

export async function listArticleCategories(req, res) {
  const categories = await prisma.articleCategory.findMany({ orderBy: { name: 'asc' } });
  res.json({ categories: categories.map((c) => ({ id: c.id, name: c.name })) });
}

export async function createArticleCategory(req, res) {
  const slug = await uniqueSlug(
    req.body.name,
    async (s) => Boolean(await prisma.articleCategory.findUnique({ where: { slug: s }, select: { id: true } })),
    'categorie',
  );
  const category = await prisma.articleCategory.create({ data: { slug, name: req.body.name } });
  res.status(201).json({ category: { id: category.id, name: category.name } });
}

// Existing tag names, to suggest them while typing (avoids "TVA" / "tva" drift).
export async function listTags(req, res) {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' }, select: { name: true } });
  res.json({ tags: tags.map((t) => t.name) });
}

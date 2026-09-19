import { prisma } from '../config/prisma.js';
import { ARTICLE_STATUS } from '../constants/blog.js';
import { toArticleCard, toArticleDetail } from '../serializers/blog.js';
import { sendStoredMedia } from '../services/mediaResponse.js';
import { HttpError } from '../utils/httpError.js';

// PUBLIC blog API: no session, read-only, PUBLISHED articles only. Everything
// that is a draft answers 404, exactly like an unknown slug.

const PUBLISHED = { status: ARTICLE_STATUS.PUBLISHED };
const CARD_INCLUDE = { category: true, author: { select: { name: true } }, tags: { include: { tag: true } } };
// Public files are cached for a few minutes: an article that is unpublished
// stops being served as soon as the cache expires.
const PUBLIC_CACHE = 'public, max-age=300';

// "%" and "_" typed by a visitor are ordinary characters, not LIKE wildcards.
const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

function listFilter({ query, category, tag }) {
  const where = { ...PUBLISHED };
  if (category) where.category = { slug: category };
  if (tag) where.tags = { some: { tag: { slug: tag } } };
  if (query) {
    const contains = { contains: escapeLike(query), mode: 'insensitive' };
    where.OR = [
      { title: contains },
      { excerpt: contains },
      { bodyText: contains },
      { tags: { some: { tag: { name: contains } } } },
    ];
  }
  return where;
}

export async function listArticles(req, res) {
  const { page, limit } = req.query;
  const where = listFilter(req.query);
  const [total, rows] = await prisma.$transaction([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: CARD_INCLUDE,
    }),
  ]);
  res.json({
    articles: rows.map(toArticleCard),
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
}

// Recommended articles: same category first, then shared tags, then the newest.
async function relatedTo(article) {
  const tagIds = article.tags.map((link) => link.tagId);
  const candidates = await prisma.article.findMany({
    where: { ...PUBLISHED, id: { not: article.id } },
    orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
    take: 40,
    include: CARD_INCLUDE,
  });
  const score = (c) =>
    (article.categoryId && c.categoryId === article.categoryId ? 2 : 0) +
    c.tags.filter((link) => tagIds.includes(link.tagId)).length;
  // Array.sort is stable: equal scores keep the "newest first" order.
  return candidates.sort((a, b) => score(b) - score(a)).slice(0, 3);
}

export async function getArticle(req, res) {
  const article = await prisma.article.findFirst({
    where: { slug: req.params.slug, ...PUBLISHED },
    include: { ...CARD_INCLUDE, media: { orderBy: { createdAt: 'asc' } } },
  });
  if (!article) throw new HttpError(404, 'Not found');
  res.json({ article: toArticleDetail(article, await relatedTo(article)) });
}

// Only categories / tags that have at least one published article are public.
export async function listCategories(req, res) {
  const rows = await prisma.articleCategory.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: { where: PUBLISHED } } } },
  });
  res.json({
    categories: rows.filter((c) => c._count.articles > 0).map((c) => ({ name: c.name, slug: c.slug, count: c._count.articles })),
  });
}

export async function listTags(req, res) {
  const rows = await prisma.tag.findMany({
    include: { _count: { select: { articles: { where: { article: PUBLISHED } } } } },
  });
  res.json({
    tags: rows
      .filter((t) => t._count.articles > 0)
      .sort((a, b) => b._count.articles - a._count.articles || a.name.localeCompare(b.name))
      .slice(0, 30)
      .map((t) => ({ name: t.name, slug: t.slug, count: t._count.articles })),
  });
}

export async function getCover(req, res) {
  const article = await prisma.article.findFirst({
    where: { slug: req.params.slug, ...PUBLISHED },
    include: { coverImage: true },
  });
  if (!article?.coverImage) throw new HttpError(404, 'Not found');
  sendStoredMedia(res, article.coverImage, { cache: PUBLIC_CACHE });
}

// A file attached to a PUBLISHED article (or its cover). Files of drafts, of
// lessons and orphans are not reachable here, whatever the id.
export async function getMedia(req, res) {
  const media = await prisma.media.findUnique({
    where: { id: req.params.id },
    include: { article: { select: { status: true } }, articleCoverOf: { select: { status: true } } },
  });
  const owner = media?.article ?? media?.articleCoverOf;
  if (!media || owner?.status !== ARTICLE_STATUS.PUBLISHED) throw new HttpError(404, 'Not found');
  sendStoredMedia(res, media, { cache: PUBLIC_CACHE });
}

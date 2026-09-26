import { prisma } from '../config/prisma.js';
import { ARTICLE_STATUS } from '../constants/blog.js';
import { toArticleCard, toArticleDetail } from '../serializers/blog.js';
import { articleLock, isTargetedAt, readableLevels, TARGET_BONUS } from '../services/blogAccess.js';
import { sendStoredMedia } from '../services/mediaResponse.js';
import { HttpError } from '../utils/httpError.js';

// PUBLIC blog API: no session, read-only, PUBLISHED articles only. Everything
// that is a draft answers 404, exactly like an unknown slug.

const PUBLISHED = { status: ARTICLE_STATUS.PUBLISHED };
const CARD_INCLUDE = { category: true, author: { select: { name: true } }, tags: { include: { tag: true } }, translations: true };
// Public files are cached for a few minutes: an article that is unpublished
// stops being served as soon as the cache expires.
const PUBLIC_CACHE = 'public, max-age=300';

// Answers that depend on the session must never be shared between visitors by a cache.
const viewerDependent = (res) => {
  res.set('Cache-Control', 'private, no-cache');
  res.vary('Cookie'); // adds to the CORS "Vary: Origin", never replaces it
};

// "%" and "_" typed by a visitor are ordinary characters, not LIKE wildcards.
const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

function listFilter({ query, category, tag, lang }, user) {
  const where = { ...PUBLISHED };
  if (category) where.category = { slug: category };
  if (tag) where.tags = { some: { tag: { slug: tag } } };
  if (query) {
    const contains = { contains: escapeLike(query), mode: 'insensitive' };
    where.OR = [
      { title: contains },
      { excerpt: contains },
      // Searching the TEXT of an article the viewer cannot read would reveal its content
      // word by word: for those, only the public teaser (title, excerpt, tags) is searched.
      { AND: [{ bodyText: contains }, { requiredAccessLevel: { in: readableLevels(user) } }] },
      { tags: { some: { tag: { name: contains } } } },
    ];
    // Also what the visitor reads in THEIR language (same rule for the text of a locked article).
    if (lang) {
      where.OR.push(
        { translations: { some: { language: lang, OR: [{ title: contains }, { excerpt: contains }] } } },
        { AND: [{ translations: { some: { language: lang, bodyText: contains } } }, { requiredAccessLevel: { in: readableLevels(user) } }] },
      );
    }
  }
  return where;
}

export async function listArticles(req, res) {
  const { page, limit, lang } = req.query;
  viewerDependent(res);
  const where = listFilter(req.query, req.user);
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
    articles: rows.map((a) => toArticleCard(a, articleLock(req.user, a), lang)),
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
}

// Recommended articles: aimed at the viewer's account type first, then same
// category, then shared tags, then the newest. Locked ones are recommended too (as
// a teaser) but flagged, so the page can show the padlock.
async function relatedTo(article, user) {
  const tagIds = article.tags.map((link) => link.tagId);
  const candidates = await prisma.article.findMany({
    where: { ...PUBLISHED, id: { not: article.id } },
    orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
    take: 40,
    include: CARD_INCLUDE,
  });
  const score = (c) =>
    (isTargetedAt(c, user) ? TARGET_BONUS : 0) +
    (article.categoryId && c.categoryId === article.categoryId ? 2 : 0) +
    c.tags.filter((link) => tagIds.includes(link.tagId)).length;
  // Array.sort is stable: equal scores keep the "newest first" order.
  return candidates
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3)
    .map((a) => ({ article: a, lock: articleLock(user, a) }));
}

export async function getArticle(req, res) {
  viewerDependent(res);
  const article = await prisma.article.findFirst({
    where: { slug: req.params.slug, ...PUBLISHED },
    include: { ...CARD_INCLUDE, media: { orderBy: { createdAt: 'asc' } } },
  });
  if (!article) throw new HttpError(404, 'Not found');
  res.json({ article: toArticleDetail(article, { lock: articleLock(req.user, article), related: await relatedTo(article, req.user), lang: req.query.lang }) });
}

// "For your profile": articles aimed at the logged-in user's account type. Someone
// who is not logged in (or with nothing aimed at them) gets the newest articles.
export async function recommendations(req, res) {
  viewerDependent(res);
  const targeted = req.user
    ? await prisma.article.findMany({
        where: { ...PUBLISHED, targetAccountTypes: { has: req.user.accountType } },
        orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
        take: 3,
        include: CARD_INCLUDE,
      })
    : [];
  const personalised = targeted.length > 0;
  const rows = personalised
    ? targeted
    : await prisma.article.findMany({ where: PUBLISHED, orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }], take: 3, include: CARD_INCLUDE });
  res.json({ personalised, articles: rows.map((a) => toArticleCard(a, articleLock(req.user, a), req.query.lang)) });
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
// lessons and orphans are not reachable here, whatever the id. The COVER of an
// article is public (teaser, even for premium); its attached files follow the
// article's access level.
export async function getMedia(req, res) {
  const media = await prisma.media.findUnique({
    where: { id: req.params.id },
    include: {
      article: { select: { status: true, requiredAccessLevel: true } },
      articleCoverOf: { select: { status: true } },
    },
  });
  const owner = media?.article ?? media?.articleCoverOf;
  if (!media || owner?.status !== ARTICLE_STATUS.PUBLISHED) throw new HttpError(404, 'Not found');

  const lock = media.article ? articleLock(req.user, media.article) : null;
  if (lock) {
    throw new HttpError(lock === 'login_required' ? 401 : 403, 'This file is reserved', { reason: lock });
  }
  // A protected file must never be kept by a shared cache.
  sendStoredMedia(res, media, { cache: media.article?.requiredAccessLevel === 'premium' ? 'private, no-store' : PUBLIC_CACHE });
}

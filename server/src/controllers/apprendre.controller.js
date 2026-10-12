import { prisma } from '../config/prisma.js';
import { DEFAULT_CONTENT_LANGUAGE } from '../constants/blog.js';
import { FAVORITE_KINDS } from '../constants/learning.js';
import { simulatorByKey } from '../constants/simulators.js';
import { articleLock, readableLevels } from '../services/blogAccess.js';
import { HttpError } from '../utils/httpError.js';

// Public "Apprendre" page (P2-08): the client's C21 screen and its "Learning
// Search". One lexical search across the four kinds of content the client lists
// — courses, glossary, mini-guides, articles — grouped by kind, filtered on the
// two axes every one of them now carries (level, theme).
//
// Three rules of the specification shape this file:
//
// 1. "Ordonner, jamais cacher." Content aimed at the viewer's FINCLUDIA public
//    comes FIRST; nothing is removed because of who is reading. The only thing
//    that ever hides content is publication status and the premium lock, which
//    already existed (P3-04).
// 2. A locked article is still FOUND and still shown, by its public teaser. Its
//    text is searched only for a viewer allowed to read it — otherwise the
//    search would reveal a paid article word by word (the blog's own rule).
// 3. The "Simuler" button exists only when an ADMINISTRATOR attached a
//    calculator to the entry. Guessing one from the wording would send people to
//    the wrong tool.

const escapeLike = (s) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

// Answers depend on who asks (ordering, locked text): never shared by a cache.
const viewerDependent = (res) => {
  res.set('Cache-Control', 'private, no-cache');
  res.vary('Cookie');
};

// A simulator key an administrator picked, kept only if it still exists: a
// calculator may be renamed or dropped between two lots, and a dead link in a
// glossary entry is worse than no button.
const simulatorOf = (row) => (row.simulatorKey && simulatorByKey(row.simulatorKey) ? row.simulatorKey : null);

const termCard = (t) => ({
  kind: 'term',
  id: t.id,
  slug: t.slug,
  title: t.term,
  level: t.level,
  theme: t.theme,
  hasExample: Boolean(t.example),
  simulator: simulatorOf(t),
});

const guideCard = (g) => ({ kind: 'guide', id: g.id, slug: g.slug, title: g.title, level: g.level, theme: g.theme, simulator: simulatorOf(g) });

const courseCard = (f) => ({
  kind: 'course',
  id: f.id,
  slug: f.slug,
  title: f.title,
  level: f.level,
  theme: f.theme,
  // A formation is readable once signed in (the catalogue is behind a session):
  // said here so the card can carry the reason instead of a dead link.
  requiresAccount: true,
  requiredAccessLevel: f.requiredAccessLevel,
  quizCount: f._count?.quizzes ?? 0,
});

const articleCard = (a, user) => ({
  kind: 'article',
  id: a.id,
  slug: a.slug,
  title: a.title,
  excerpt: a.excerpt,
  level: a.level,
  theme: a.theme,
  lock: articleLock(user, a),
});

// "Ordonner, jamais cacher" (P3-04's rule, applied to the four kinds here): an
// entry whose theme matches one of the viewer's publics comes first. With no
// session, or no theme, the order is the natural one.
const PUBLIC_BONUS = 3;
const viewerPublics = (user) => {
  if (!user?.finPublic) return [];
  const secondary = Array.isArray(user.finSecondaryPublics) ? user.finSecondaryPublics : [];
  return [user.finPublic, ...secondary];
};

function rank(cards, user) {
  const publics = viewerPublics(user).map((code) => code.toLowerCase());
  if (publics.length === 0) return cards;
  return cards
    .map((card, index) => {
      const theme = (card.theme ?? '').toLowerCase();
      const bonus = theme && publics.some((code) => theme.includes(code)) ? PUBLIC_BONUS : 0;
      return { card, index, bonus };
    })
    .sort((a, b) => b.bonus - a.bonus || a.index - b.index)
    .map((entry) => entry.card);
}

const axes = ({ level, theme }) => {
  const where = {};
  if (level) where.level = level;
  if (theme) where.theme = theme;
  return where;
};

export async function search(req, res) {
  viewerDependent(res);
  const { query, lang } = req.query;
  const user = req.user ?? null;
  const language = lang ?? DEFAULT_CONTENT_LANGUAGE;
  const contains = query ? { contains: escapeLike(query) } : null;

  const [terms, guides, courses, articles] = await Promise.all([
    prisma.glossaryTerm.findMany({
      where: {
        status: 'published',
        language,
        ...axes(req.query),
        ...(contains ? { OR: [{ term: contains }, { definition: contains }, { example: contains }] } : {}),
      },
      orderBy: { term: 'asc' },
      take: 60,
    }),
    prisma.miniGuide.findMany({
      where: {
        status: 'published',
        language,
        ...axes(req.query),
        ...(contains ? { OR: [{ title: contains }, { body: contains }] } : {}),
      },
      orderBy: { position: 'asc' },
      take: 60,
    }),
    // Courses: the published formations. A premium formation is listed (the
    // catalogue already lists it) — only its lessons are protected.
    prisma.formation.findMany({
      where: {
        status: 'published',
        ...axes(req.query),
        ...(contains ? { OR: [{ title: contains }, { subtitle: contains }, { description: contains }] } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: 30,
      include: { _count: { select: { quizzes: true } } },
    }),
    // Articles: the blog's own rule on locked text, kept identical.
    prisma.article.findMany({
      where: {
        status: 'published',
        ...axes(req.query),
        ...(contains
          ? {
              OR: [
                { title: contains },
                { excerpt: contains },
                { AND: [{ bodyText: contains }, { requiredAccessLevel: { in: readableLevels(user) } }] },
              ],
            }
          : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: 30,
    }),
  ]);

  res.json({
    terms: rank(terms.map(termCard), user),
    guides: rank(guides.map(guideCard), user),
    courses: rank(courses.map(courseCard), user),
    articles: rank(
      articles.map((a) => articleCard(a, user)),
      user,
    ),
    favoriteKinds: FAVORITE_KINDS,
  });
}

export async function getTerm(req, res) {
  viewerDependent(res);
  const term = await prisma.glossaryTerm.findFirst({ where: { slug: req.params.slug, status: 'published' } });
  if (!term) throw new HttpError(404, 'Not found');
  let related = [];
  if (term.relatedTerms.length) {
    related = await prisma.glossaryTerm.findMany({
      where: { id: { in: term.relatedTerms }, status: 'published' },
      select: { id: true, slug: true, term: true },
    });
  }
  res.json({
    term: {
      id: term.id,
      slug: term.slug,
      term: term.term,
      definition: term.definition,
      example: term.example,
      level: term.level,
      theme: term.theme,
      simulator: simulatorOf(term),
      related,
    },
  });
}

export async function getGuide(req, res) {
  viewerDependent(res);
  const guide = await prisma.miniGuide.findFirst({ where: { slug: req.params.slug, status: 'published' } });
  if (!guide) throw new HttpError(404, 'Not found');
  res.json({
    guide: {
      id: guide.id,
      slug: guide.slug,
      title: guide.title,
      body: guide.body,
      level: guide.level,
      theme: guide.theme,
      simulator: simulatorOf(guide),
    },
  });
}

// --- Favourites (P2-08) ----------------------------------------------------
// They belong to an account, so they need a session. A favourite pointing at
// content that has since been deleted or unpublished is dropped when the list is
// read: the row is harmless, and hiding it is better than a dead card.

const LOADERS = {
  term: (ids) => prisma.glossaryTerm.findMany({ where: { id: { in: ids }, status: 'published' } }),
  guide: (ids) => prisma.miniGuide.findMany({ where: { id: { in: ids }, status: 'published' } }),
  course: (ids) => prisma.formation.findMany({ where: { id: { in: ids }, status: 'published' }, include: { _count: { select: { quizzes: true } } } }),
  article: (ids) => prisma.article.findMany({ where: { id: { in: ids }, status: 'published' } }),
};

const CARDS = { term: termCard, guide: guideCard, course: courseCard, article: articleCard };

export async function listFavorites(req, res) {
  viewerDependent(res);
  const rows = await prisma.learningFavorite.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  const byKind = new Map();
  for (const row of rows) {
    if (!byKind.has(row.kind)) byKind.set(row.kind, []);
    byKind.get(row.kind).push(row.refId);
  }

  const found = new Map();
  await Promise.all(
    [...byKind].map(async ([kind, ids]) => {
      const loaded = await LOADERS[kind](ids);
      for (const item of loaded) found.set(`${kind}:${item.id}`, CARDS[kind](item, req.user));
    }),
  );

  // The order the person favourited them in, newest first.
  const favorites = rows.map((row) => found.get(`${row.kind}:${row.refId}`)).filter(Boolean);
  res.json({ favorites });
}

export async function addFavorite(req, res) {
  viewerDependent(res);
  const { kind, refId } = req.body;
  // The content must exist and be published: favouriting a draft would keep a
  // reference to something the person was never shown.
  const [item] = await LOADERS[kind]([refId]);
  if (!item) throw new HttpError(404, 'Not found');
  // Already there: the same answer as creating it, so clicking twice is not an
  // error the interface has to explain.
  await prisma.learningFavorite.upsert({
    where: { userId_kind_refId: { userId: req.user.id, kind, refId } },
    update: {},
    create: { userId: req.user.id, kind, refId },
  });
  res.status(201).json({ favorite: CARDS[kind](item, req.user) });
}

export async function removeFavorite(req, res) {
  const { count } = await prisma.learningFavorite.deleteMany({
    where: { userId: req.user.id, kind: req.params.kind, refId: req.params.refId },
  });
  if (count === 0) throw new HttpError(404, 'Not found');
  res.status(204).end();
}

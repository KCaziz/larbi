import { prisma } from '../config/prisma.js';
import { DEFAULT_CONTENT_LANGUAGE } from '../constants/blog.js';
import { HttpError } from '../utils/httpError.js';

// Public "Apprendre" page (P2-08): glossary + mini-guides, published only, no
// session. "Recherche lexicale... résultats groupés" (client's words): one
// search across both, grouped, plus a level/theme filter.

const escapeLike = (s) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

const termCard = (t) => ({ id: t.id, slug: t.slug, term: t.term, example: t.example ? true : false, level: t.level, theme: t.theme });
const guideCard = (g) => ({ id: g.id, slug: g.slug, title: g.title, level: g.level, theme: g.theme });

function whereFor(model, { query, level, theme, lang }) {
  const where = { status: 'published', language: lang ?? DEFAULT_CONTENT_LANGUAGE };
  if (level) where.level = level;
  if (theme) where.theme = theme;
  if (query) {
    const contains = { contains: escapeLike(query) };
    where.OR = model === 'term' ? [{ term: contains }, { definition: contains }, { example: contains }] : [{ title: contains }, { body: contains }];
  }
  return where;
}

export async function search(req, res) {
  const [terms, guides] = await Promise.all([
    prisma.glossaryTerm.findMany({ where: whereFor('term', req.query), orderBy: { term: 'asc' }, take: 60 }),
    prisma.miniGuide.findMany({ where: whereFor('guide', req.query), orderBy: { position: 'asc' }, take: 60 }),
  ]);
  res.json({ terms: terms.map(termCard), guides: guides.map(guideCard) });
}

export async function getTerm(req, res) {
  const term = await prisma.glossaryTerm.findFirst({ where: { slug: req.params.slug, status: 'published' } });
  if (!term) throw new HttpError(404, 'Not found');
  let related = [];
  if (term.relatedTerms.length) {
    related = await prisma.glossaryTerm.findMany({ where: { id: { in: term.relatedTerms }, status: 'published' }, select: { id: true, slug: true, term: true } });
  }
  res.json({ term: { id: term.id, slug: term.slug, term: term.term, definition: term.definition, example: term.example, level: term.level, theme: term.theme, related } });
}

export async function getGuide(req, res) {
  const guide = await prisma.miniGuide.findFirst({ where: { slug: req.params.slug, status: 'published' } });
  if (!guide) throw new HttpError(404, 'Not found');
  res.json({ guide: { id: guide.id, slug: guide.slug, title: guide.title, body: guide.body, level: guide.level, theme: guide.theme } });
}

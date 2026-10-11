import { prisma } from '../../config/prisma.js';
import { sanitizeRichText, richTextToPlain } from '../../services/sanitize.service.js';
import { uniqueSlug } from '../../services/slug.service.js';
import { HttpError } from '../../utils/httpError.js';

// Administration of the "Apprendre" glossary and mini-guides (P2-08). Written
// by the team (decided 2026-10-11: no longer waiting on the client for these),
// general definitions only — nothing tied to a specific offer, rate or legal
// rule (that stays client-sourced, elsewhere).

const termRow = (t) => ({
  id: t.id,
  slug: t.slug,
  term: t.term,
  definition: t.definition,
  example: t.example,
  relatedTerms: t.relatedTerms,
  level: t.level,
  theme: t.theme,
  status: t.status,
  language: t.language,
  updatedAt: t.updatedAt,
});

const guideRow = (g) => ({
  id: g.id,
  slug: g.slug,
  title: g.title,
  body: g.body,
  level: g.level,
  theme: g.theme,
  status: g.status,
  language: g.language,
  position: g.position,
  updatedAt: g.updatedAt,
});

// ---- Glossary terms ------------------------------------------------------------

export async function listTerms(req, res) {
  const terms = await prisma.glossaryTerm.findMany({ orderBy: { term: 'asc' } });
  res.json({ terms: terms.map(termRow) });
}

export async function getTerm(req, res) {
  const term = await prisma.glossaryTerm.findUnique({ where: { id: req.params.id } });
  if (!term) throw new HttpError(404, 'Not found');
  res.json({ term: termRow(term) });
}

export async function createTerm(req, res) {
  const slug = await uniqueSlug(req.body.term, (s) => prisma.glossaryTerm.findUnique({ where: { slug: s }, select: { id: true } }).then(Boolean), 'terme');
  // A fresh term starts with no real definition: stored empty until a first save.
  const created = await prisma.glossaryTerm.create({ data: { slug, term: req.body.term, definition: '<p></p>' } });
  res.status(201).json({ term: termRow(created) });
}

export async function updateTerm(req, res) {
  const existing = await prisma.glossaryTerm.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, 'Not found');

  const data = { ...req.body };
  if ('definition' in data) data.definition = sanitizeRichText(data.definition) ?? '<p></p>';
  if ('example' in data) data.example = data.example === null ? null : (sanitizeRichText(data.example) ?? null);
  if ('relatedTerms' in data && data.relatedTerms.length) {
    const known = await prisma.glossaryTerm.count({ where: { id: { in: data.relatedTerms } } });
    if (known !== data.relatedTerms.length) throw new HttpError(400, 'Unknown related term');
  }

  const changesText = ('definition' in data && data.definition !== existing.definition) || ('example' in data && data.example !== existing.example);

  const updated = await prisma.$transaction(async (tx) => {
    // A snapshot is taken before EVERY replacement (the client's own rule: "une
    // définition remplacée garde son historique" — unlike lesson autosave,
    // there is no time throttling here).
    if (changesText) await tx.glossaryTermRevision.create({ data: { termId: existing.id, definition: existing.definition, example: existing.example } });
    return tx.glossaryTerm.update({ where: { id: existing.id }, data });
  });
  res.json({ term: termRow(updated) });
}

export async function listTermRevisions(req, res) {
  const rows = await prisma.glossaryTermRevision.findMany({ where: { termId: req.params.id }, orderBy: { createdAt: 'desc' }, take: 50 });
  res.json({ revisions: rows.map((r) => ({ id: r.id, definition: r.definition, example: r.example, createdAt: r.createdAt })) });
}

async function setTermStatus(req, res, status) {
  const existing = await prisma.glossaryTerm.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, 'Not found');
  if (status === 'published' && !richTextToPlain(existing.definition)) throw new HttpError(422, 'A definition is required before publishing');
  const updated = await prisma.glossaryTerm.update({ where: { id: existing.id }, data: { status } });
  res.json({ term: termRow(updated) });
}
export const publishTerm = (req, res) => setTermStatus(req, res, 'published');
export const unpublishTerm = (req, res) => setTermStatus(req, res, 'draft');

export async function deleteTerm(req, res) {
  const existing = await prisma.glossaryTerm.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, 'Not found');
  await prisma.glossaryTerm.delete({ where: { id: existing.id } });
  res.status(204).end();
}

// ---- Mini-guides ----------------------------------------------------------------

export async function listGuides(req, res) {
  const guides = await prisma.miniGuide.findMany({ orderBy: { position: 'asc' } });
  res.json({ guides: guides.map(guideRow) });
}

export async function getGuide(req, res) {
  const guide = await prisma.miniGuide.findUnique({ where: { id: req.params.id } });
  if (!guide) throw new HttpError(404, 'Not found');
  res.json({ guide: guideRow(guide) });
}

export async function createGuide(req, res) {
  const slug = await uniqueSlug(req.body.title, (s) => prisma.miniGuide.findUnique({ where: { slug: s }, select: { id: true } }).then(Boolean), 'guide');
  const last = await prisma.miniGuide.aggregate({ _max: { position: true } });
  const created = await prisma.miniGuide.create({ data: { slug, title: req.body.title, body: '<p></p>', position: (last._max.position ?? -1) + 1 } });
  res.status(201).json({ guide: guideRow(created) });
}

export async function updateGuide(req, res) {
  const existing = await prisma.miniGuide.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, 'Not found');
  const data = { ...req.body };
  if ('body' in data) data.body = sanitizeRichText(data.body) ?? '<p></p>';
  const updated = await prisma.miniGuide.update({ where: { id: existing.id }, data });
  res.json({ guide: guideRow(updated) });
}

async function setGuideStatus(req, res, status) {
  const existing = await prisma.miniGuide.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, 'Not found');
  if (status === 'published' && !richTextToPlain(existing.body)) throw new HttpError(422, 'A body is required before publishing');
  const updated = await prisma.miniGuide.update({ where: { id: existing.id }, data: { status } });
  res.json({ guide: guideRow(updated) });
}
export const publishGuide = (req, res) => setGuideStatus(req, res, 'published');
export const unpublishGuide = (req, res) => setGuideStatus(req, res, 'draft');

export async function reorderGuides(req, res) {
  const { ids } = req.body;
  await prisma.$transaction(async (tx) => {
    const current = await tx.miniGuide.findMany({ select: { id: true } });
    const known = new Set(current.map((g) => g.id));
    if (new Set(ids).size !== ids.length || ids.length !== known.size || !ids.every((id) => known.has(id))) {
      throw new HttpError(409, 'The list changed, reload it');
    }
    for (const [position, id] of ids.entries()) await tx.miniGuide.update({ where: { id }, data: { position } });
  });
  res.status(204).end();
}

export async function deleteGuide(req, res) {
  const existing = await prisma.miniGuide.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, 'Not found');
  await prisma.miniGuide.delete({ where: { id: existing.id } });
  res.status(204).end();
}

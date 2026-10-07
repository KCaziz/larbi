import { z } from 'zod';
import { HttpError } from '../utils/httpError.js';
import { richTextToPlain, sanitizeRichText } from './sanitize.service.js';

// Content of a lesson = an ordered list of typed blocks (P3-12).
//
// The server is the only authority on what a block may contain: `data` is validated and
// cleaned per type here, whatever the browser sent. Rich text is sanitised (same allow-list
// as everywhere), links must be http(s), a code block is plain text, a table is a grid of
// plain text cells — there is never a raw HTML fragment stored "as is".

export const BLOCK_TYPES = ['text', 'image', 'video', 'file', 'code', 'table', 'quote', 'callout', 'resources'];
// Blocks that show an uploaded file, and the kind of file each one accepts.
export const MEDIA_BLOCK_KIND = { image: 'image', video: 'video', file: 'document' };
export const BLOCK_FOR_MEDIA_KIND = { image: 'image', video: 'video', document: 'file' };
export const isMediaBlock = (type) => type in MEDIA_BLOCK_KIND;

export const CODE_LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'python', 'sql', 'html', 'css', 'json', 'bash', 'java', 'csharp', 'php', 'xml', 'yaml',
];
export const MAX_BLOCKS_PER_LESSON = 200;

const plain = (max) =>
  z
    .string()
    .max(max)
    .transform((value) => value.trim())
    .default('');

// Links in a list of resources: http(s) only (no javascript:, data:, file:...), no credentials.
const httpUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
    } catch {
      return false;
    }
  }, 'Invalid link');

const SCHEMAS = {
  text: z.object({ html: z.string().max(100_000).default('') }).strict(),
  image: z.object({ alt: plain(200), caption: plain(300) }).strict(),
  video: z.object({ caption: plain(300) }).strict(),
  file: z.object({ label: plain(150), description: plain(300) }).strict(),
  code: z
    .object({
      language: z.enum(CODE_LANGUAGES).default('plaintext'),
      code: z.string().max(20_000).default(''),
      caption: plain(200),
    })
    .strict(),
  table: z
    .object({
      headers: z.array(plain(100)).min(1).max(8),
      rows: z.array(z.array(plain(300)).max(8)).max(50).default([]),
      caption: plain(200),
    })
    .strict()
    .refine((table) => table.rows.every((row) => row.length === table.headers.length), 'Every row needs one cell per column'),
  quote: z.object({ text: plain(1000), author: plain(100) }).strict(),
  callout: z
    .object({ variant: z.enum(['info', 'tip', 'warning']).default('info'), title: plain(100), html: z.string().max(5000).default('') })
    .strict(),
  resources: z
    .object({
      title: plain(100),
      items: z.array(z.object({ label: plain(150), url: httpUrl, description: plain(300) }).strict()).max(20).default([]),
    })
    .strict(),
};

// Returns the cleaned `data` of a block, or throws a 400.
export function validateBlockData(type, data) {
  const schema = SCHEMAS[type];
  if (!schema) throw new HttpError(400, 'Unknown block type');
  const parsed = schema.safeParse(data ?? {});
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => i.path.join('.') || 'data'))];
    throw new HttpError(400, `Invalid block content: ${fields.join(', ')}`);
  }
  const clean = parsed.data;
  if (type === 'text') return { html: sanitizeRichText(clean.html) ?? '' };
  if (type === 'callout') return { ...clean, html: sanitizeRichText(clean.html) ?? '' };
  if (type === 'code') return { ...clean, code: clean.code.replace(/\r\n?/g, '\n') };
  return clean;
}

// Does this block show anything? (the "ready to publish" checklist counts real content only)
export function blockHasContent(block) {
  const d = block.data ?? {};
  switch (block.type) {
    case 'text':
      return Boolean(richTextToPlain(d.html));
    case 'image':
    case 'video':
    case 'file':
      return Boolean(block.mediaId);
    case 'code':
      return Boolean(d.code?.trim());
    case 'table':
      return (d.rows ?? []).some((row) => row.some((cell) => cell));
    case 'quote':
      return Boolean(d.text);
    case 'callout':
      return Boolean(d.title || richTextToPlain(d.html));
    case 'resources':
      return (d.items ?? []).length > 0;
    default:
      return false;
  }
}

// Locks the lesson row for the rest of the transaction: two people editing the same lesson
// cannot both renumber its blocks at the same time.
export async function lockLesson(tx, courseId) {
  const rows = await tx.$queryRaw`SELECT id FROM courses WHERE id = ${courseId} FOR UPDATE`;
  if (rows.length === 0) throw new HttpError(404, 'Not found');
}

// Writes positions 0..n-1 for the given ids, in that order.
export async function renumberBlocks(tx, orderedIds) {
  for (const [position, id] of orderedIds.entries()) {
    await tx.lessonBlock.update({ where: { id }, data: { position } });
  }
}

export const currentBlockIds = async (tx, courseId) =>
  (await tx.lessonBlock.findMany({ where: { courseId }, orderBy: [{ position: 'asc' }, { createdAt: 'asc' }], select: { id: true } })).map((b) => b.id);

// ---- history --------------------------------------------------------------------
export const REVISION_INTERVAL_MS = 10 * 60 * 1000; // an automatic snapshot at most every 10 minutes
export const MAX_REVISIONS = 30;

const snapshotOf = (blocks) => blocks.map((b) => ({ type: b.type, position: b.position, data: b.data, mediaId: b.mediaId }));

export async function takeSnapshot(tx, courseId, userId, label = null) {
  const blocks = await tx.lessonBlock.findMany({ where: { courseId }, orderBy: { position: 'asc' } });
  const revision = await tx.lessonRevision.create({ data: { courseId, createdById: userId, label, blocks: snapshotOf(blocks) } });
  // Only the most recent MAX_REVISIONS are kept.
  const old = await tx.lessonRevision.findMany({ where: { courseId }, orderBy: { createdAt: 'desc' }, skip: MAX_REVISIONS, select: { id: true } });
  if (old.length) await tx.lessonRevision.deleteMany({ where: { id: { in: old.map((r) => r.id) } } });
  return revision;
}

// Called BEFORE an edit: if the lesson has content and nothing was saved in the last few
// minutes, the state before the edit is kept, so any edit can be undone from the history.
export async function snapshotIfDue(tx, courseId, userId) {
  const count = await tx.lessonBlock.count({ where: { courseId } });
  if (count === 0) return null;
  const last = await tx.lessonRevision.findFirst({ where: { courseId }, orderBy: { createdAt: 'desc' } });
  if (last && Date.now() - last.createdAt.getTime() < REVISION_INTERVAL_MS) return null;
  return takeSnapshot(tx, courseId, userId);
}

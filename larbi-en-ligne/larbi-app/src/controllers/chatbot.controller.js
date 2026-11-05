import { prisma } from '../config/prisma.js';
import { DEFAULT_CONTENT_LANGUAGE } from '../constants/blog.js';

// Public, read-only (P3-07): the published questions of one language, in the
// administrator's order. No session, nothing about drafts, nothing stored about
// who opened which question (no analytics on the MVP, rule 10).
export async function listPublicChatbotEntries(req, res) {
  const language = req.query.lang ?? DEFAULT_CONTENT_LANGUAGE;
  const read = (lang) =>
    prisma.chatbotEntry.findMany({ where: { language: lang, status: 'published' }, orderBy: { position: 'asc' }, select: { id: true, question: true, answer: true } });
  let entries = await read(language);
  // Nothing written yet in this language: the default language answers rather
  // than an empty panel (SUIVI_RECETTE R5-05), and the reply says so.
  let fallback = false;
  if (entries.length === 0 && language !== DEFAULT_CONTENT_LANGUAGE) {
    entries = await read(DEFAULT_CONTENT_LANGUAGE);
    fallback = entries.length > 0;
  }
  res.json({ entries, fallback });
}

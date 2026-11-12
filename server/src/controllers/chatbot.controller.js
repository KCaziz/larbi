import { prisma } from '../config/prisma.js';
import { DEFAULT_CONTENT_LANGUAGE } from '../constants/blog.js';

// Public, read-only (P3-07): the published questions of one language, in the
// administrator's order. No session, nothing about drafts, nothing stored about
// who opened which question (no analytics on the MVP, rule 10).
export async function listPublicChatbotEntries(req, res) {
  const language = req.query.lang ?? DEFAULT_CONTENT_LANGUAGE;
  // P11-02: the site's FAQ and the application's are not the same questions.
  const where = req.query.audience ? { audience: { in: [req.query.audience, 'both'] } } : {};
  const rows = await prisma.chatbotEntry.findMany({ where: { status: 'published', ...where }, orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] });
  // R11-05: each question in the reader's language; a question not translated
  // yet shows in the default language (R5-05) rather than vanishing, and the
  // reply says so.
  const groups = new Map();
  for (const row of rows) {
    const key = row.groupId ?? row.id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  let fallback = false;
  const entries = [];
  for (const versions of groups.values()) {
    const own = versions.find((row) => row.language === language);
    const chosen = own ?? versions.find((row) => row.language === DEFAULT_CONTENT_LANGUAGE);
    if (!chosen) continue;
    if (!own) fallback = true;
    entries.push({ id: chosen.id, question: chosen.question, answer: chosen.answer });
  }
  res.json({ entries, fallback });
}

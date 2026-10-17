import { prisma } from '../config/prisma.js';
import { DEFAULT_CONTENT_LANGUAGE } from '../constants/blog.js';

// Public, read-only (P3-07): the published questions of one language, in the
// administrator's order. No session, nothing about drafts, nothing stored about
// who opened which question (no analytics on the MVP, rule 10).
export async function listPublicChatbotEntries(req, res) {
  const language = req.query.lang ?? DEFAULT_CONTENT_LANGUAGE;
  const entries = await prisma.chatbotEntry.findMany({
    where: { language, status: 'published' },
    orderBy: { position: 'asc' },
    select: { id: true, question: true, answer: true },
  });
  res.json({ entries });
}

import { prisma } from '../../config/prisma.js';
import { sanitizeRichText } from '../../services/sanitize.service.js';
import { CHATBOT_LIMITS } from '../../validation/chatbot.schemas.js';
import { HttpError } from '../../utils/httpError.js';

// Administration of the guided assistant (P3-07): questions and their answers,
// written by an administrator, one language per entry, in an explicit order.
// A new entry is a draft: nothing reaches visitors before it is published.

const toRow = (e) => ({
  id: e.id,
  question: e.question,
  answer: e.answer,
  language: e.language,
  status: e.status,
  position: e.position,
  updatedAt: e.updatedAt,
});

// The editor's HTML goes through the same allow-list as articles; an answer
// without any visible text ("<p></p>") is refused rather than stored empty.
function cleanAnswer(html) {
  const clean = sanitizeRichText(html);
  if (!clean) throw new HttpError(400, 'Validation failed', { answer: 'empty' });
  return clean;
}

const nextPosition = async (language) => {
  const last = await prisma.chatbotEntry.aggregate({ where: { language }, _max: { position: true } });
  return (last._max.position ?? -1) + 1;
};

async function findEntry(id) {
  const entry = await prisma.chatbotEntry.findUnique({ where: { id } });
  if (!entry) throw new HttpError(404, 'Not found');
  return entry;
}

export async function listChatbotEntries(req, res) {
  const entries = await prisma.chatbotEntry.findMany({ orderBy: [{ language: 'asc' }, { position: 'asc' }] });
  res.json({ entries: entries.map(toRow), limits: CHATBOT_LIMITS });
}

export async function createChatbotEntry(req, res) {
  if ((await prisma.chatbotEntry.count()) >= CHATBOT_LIMITS.entries) throw new HttpError(409, 'Too many entries');
  const { question, language } = req.body;
  const created = await prisma.chatbotEntry.create({
    data: { question, answer: cleanAnswer(req.body.answer), language, position: await nextPosition(language) },
  });
  res.status(201).json({ entry: toRow(created) });
}

export async function updateChatbotEntry(req, res) {
  const entry = await findEntry(req.params.id);
  const data = {};
  if (req.body.question !== undefined) data.question = req.body.question;
  if (req.body.answer !== undefined) data.answer = cleanAnswer(req.body.answer);
  // Moving to another language puts the entry at the end of that language's list.
  if (req.body.language !== undefined && req.body.language !== entry.language) {
    data.language = req.body.language;
    data.position = await nextPosition(req.body.language);
  }
  const updated = await prisma.chatbotEntry.update({ where: { id: entry.id }, data });
  res.json({ entry: toRow(updated) });
}

async function setStatus(req, res, status) {
  const entry = await findEntry(req.params.id);
  const updated = await prisma.chatbotEntry.update({ where: { id: entry.id }, data: { status } });
  res.json({ entry: toRow(updated) });
}
export const publishChatbotEntry = (req, res) => setStatus(req, res, 'published');
export const unpublishChatbotEntry = (req, res) => setStatus(req, res, 'draft');

// The new order of one language, as the complete list of its entries: a partial
// or stale list (an entry added meanwhile in another tab) is refused instead of
// silently mixing two orders.
export async function reorderChatbotEntries(req, res) {
  const { language, ids } = req.body;
  await prisma.$transaction(async (tx) => {
    const current = await tx.chatbotEntry.findMany({ where: { language }, select: { id: true } });
    const known = new Set(current.map((e) => e.id));
    if (new Set(ids).size !== ids.length || ids.length !== known.size || !ids.every((id) => known.has(id))) {
      throw new HttpError(409, 'The list changed, reload it');
    }
    for (const [position, id] of ids.entries()) {
      await tx.chatbotEntry.update({ where: { id }, data: { position } });
    }
  });
  res.status(204).end();
}

export async function deleteChatbotEntry(req, res) {
  const entry = await findEntry(req.params.id);
  await prisma.chatbotEntry.delete({ where: { id: entry.id } });
  res.status(204).end();
}

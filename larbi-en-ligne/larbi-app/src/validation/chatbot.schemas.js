import { z } from 'zod';
import { CONTENT_LANGUAGES } from '../constants/blog.js';

// Guided assistant (P3-07). The answer is rich text: its length is bounded here
// (the column is TEXT), its HTML is sanitised by the controller.
export const CHATBOT_LIMITS = { question: 200, answer: 10_000, entries: 200 };

const question = z.string().trim().min(1).max(CHATBOT_LIMITS.question);
const answer = z.string().min(1).max(CHATBOT_LIMITS.answer);
const language = z.enum(CONTENT_LANGUAGES);

export const createChatbotEntrySchema = z.object({ question, answer, language: language.default('fr') }).strict();

export const updateChatbotEntrySchema = z.object({ question, answer, language }).partial().strict();

// The whole order of ONE language at once: every entry of that language, once.
export const reorderChatbotSchema = z
  .object({ language, ids: z.array(z.string().uuid()).min(1).max(CHATBOT_LIMITS.entries) })
  .strict();

export const chatbotLangQuerySchema = z.object({ lang: language.optional() }).strict();

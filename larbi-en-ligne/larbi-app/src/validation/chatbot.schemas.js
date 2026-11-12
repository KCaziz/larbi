import { z } from 'zod';
import { CONTENT_LANGUAGES } from '../constants/blog.js';

// Guided assistant (P3-07). The answer is rich text: its length is bounded here
// (the column is TEXT), its HTML is sanitised by the controller.
export const CHATBOT_LIMITS = { question: 200, answer: 10_000, entries: 200 };

const question = z.string().trim().min(1).max(CHATBOT_LIMITS.question);
const answer = z.string().min(1).max(CHATBOT_LIMITS.answer);
const language = z.enum(CONTENT_LANGUAGES);
// P11-02: where the question is shown.
export const CHATBOT_AUDIENCES = ['site', 'app', 'both'];
const audience = z.enum(CHATBOT_AUDIENCES);

// R11-05: `groupId` adds a translation to an existing question.
export const createChatbotEntrySchema = z.object({ question, answer, language: language.default('fr'), audience: audience.default('both'), groupId: z.string().uuid().optional() }).strict();

export const updateChatbotEntrySchema = z.object({ question, answer, audience }).partial().strict();

// R11-05: the order of the questions, all their translations at once.
export const reorderChatbotGroupsSchema = z.object({ groupIds: z.array(z.string().uuid()).min(1).max(CHATBOT_LIMITS.entries) }).strict();

// The whole order of ONE language at once: every entry of that language, once.
export const reorderChatbotSchema = z
  .object({ language, ids: z.array(z.string().uuid()).min(1).max(CHATBOT_LIMITS.entries) })
  .strict();

export const chatbotLangQuerySchema = z.object({ lang: language.optional(), audience: z.enum(['site', 'app']).optional() }).strict();

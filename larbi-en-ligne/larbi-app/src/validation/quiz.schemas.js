import { z } from 'zod';
import { MAX_CHOICES, QUESTION_TYPES } from '../services/quiz.service.js';

// Draft-friendly: an author may save a question that is not finished yet (empty text, no
// right answer): the CMS shows what is missing and a quiz with a problem is simply not
// served to learners. Sizes are bounded and unknown fields refused.

export const createQuizSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    scope: z.enum(['course', 'section', 'formation']),
    courseId: z.string().uuid().optional(),
    sectionId: z.string().uuid().optional(),
  })
  .strict();

export const updateQuizSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    instructions: z.string().trim().max(1000),
    passingScore: z.number().int().min(0).max(100),
    maxAttempts: z.number().int().min(1).max(50).nullable(),
    shuffleQuestions: z.boolean(),
    isRequired: z.boolean(),
    showCorrection: z.boolean(),
  })
  .partial()
  .strict();

export const createQuestionSchema = z.object({ type: z.enum(QUESTION_TYPES) }).strict();

export const updateQuestionSchema = z
  .object({
    prompt: z.string().trim().max(1000),
    explanation: z.string().trim().max(1000),
    points: z.number().int().min(1).max(100),
    // single / multiple: the whole list of choices, in order (an `id` keeps an existing choice)
    choices: z
      .array(z.object({ id: z.string().uuid().optional(), text: z.string().trim().max(300), isCorrect: z.boolean() }).strict())
      .max(MAX_CHOICES),
    // true / false: which of the two is the right answer
    correctTrue: z.boolean(),
    // free text: the accepted answers
    acceptedAnswers: z.array(z.string().trim().max(200)).max(10),
  })
  .partial()
  .strict();

export const reorderQuestionsSchema = z.object({ questionIds: z.array(z.string().uuid()).max(100) }).strict();

// A learner's answers: bounded, and only ids / short text (the server checks them against the quiz).
export const submitAttemptSchema = z
  .object({
    answers: z
      .array(
        z
          .object({
            questionId: z.string().uuid(),
            choiceIds: z.array(z.string().uuid()).max(MAX_CHOICES).optional(),
            text: z.string().max(500).optional(),
          })
          .strict(),
      )
      .max(100),
  })
  .strict();

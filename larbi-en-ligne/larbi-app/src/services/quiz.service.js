import { randomInt } from 'node:crypto';

// Quizzes (P3-13): what a well-formed question is, how an attempt is graded, and what a learner
// may see. Everything about the RIGHT ANSWERS stays on the server: `toLearnerQuestion` is the
// only view given before an attempt is submitted and it contains none of them.

export const QUESTION_TYPES = ['single', 'multiple', 'true_false', 'text'];
export const CHOICE_TYPES = ['single', 'multiple', 'true_false'];
export const TRUE_FALSE_TEXTS = ['true', 'false'];
export const MAX_CHOICES = 10;
export const MAX_QUESTIONS = 100;

// Comparison of free-text answers: without case, accents or extra spaces ("  Éléphant " = "elephant").
export function normaliseAnswer(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// ---- is the question well formed? ---------------------------------------------------
// Returns the problems (keys the CMS translates); an empty list = complete. A quiz with any
// problem is never served to learners.
export function questionProblems(question) {
  const problems = [];
  if (!question.prompt?.trim()) problems.push('prompt');
  if (question.type === 'text') {
    if (!(question.acceptedAnswers ?? []).some((a) => normaliseAnswer(a))) problems.push('accepted');
    return problems;
  }
  const choices = question.choices ?? [];
  const correct = choices.filter((c) => c.isCorrect).length;
  if (question.type === 'true_false') {
    const texts = choices.map((c) => c.text).sort();
    if (choices.length !== 2 || texts[0] !== 'false' || texts[1] !== 'true') problems.push('trueFalse');
    else if (correct !== 1) problems.push('noCorrect');
    return problems;
  }
  if (choices.length < 2) problems.push('choices');
  if (choices.some((c) => !c.text?.trim())) problems.push('choiceText');
  if (question.type === 'single' && correct !== 1) problems.push(correct === 0 ? 'noCorrect' : 'manyCorrect');
  if (question.type === 'multiple' && correct === 0) problems.push('noCorrect');
  return problems;
}

export function quizProblems(quiz) {
  const questions = quiz.questions ?? [];
  if (questions.length === 0) return ['noQuestions'];
  return questions.some((q) => questionProblems(q).length > 0) ? ['questions'] : [];
}

export const isQuizComplete = (quiz) => quizProblems(quiz).length === 0;

// Keeps the denormalised `isComplete` column in step (called by every CMS change of a quiz).
export async function refreshQuizCompleteness(tx, quizId) {
  const quiz = await tx.quiz.findUnique({ where: { id: quizId }, include: { questions: { include: { choices: true } } } });
  if (!quiz) return null;
  const isComplete = isQuizComplete(quiz);
  if (quiz.isComplete !== isComplete) await tx.quiz.update({ where: { id: quizId }, data: { isComplete } });
  return isComplete;
}

// ---- grading ------------------------------------------------------------------------
// All-or-nothing per question: a "multiple" question needs exactly the right set of choices.
export function gradeQuestion(question, answer) {
  const chosen = new Set(answer?.choiceIds ?? []);
  let correct = false;
  if (question.type === 'text') {
    const given = normaliseAnswer(answer?.text);
    correct = given !== '' && (question.acceptedAnswers ?? []).some((accepted) => normaliseAnswer(accepted) === given);
  } else if (question.type === 'multiple') {
    const right = question.choices.filter((c) => c.isCorrect).map((c) => c.id);
    correct = right.length > 0 && chosen.size === right.length && right.every((id) => chosen.has(id));
  } else {
    // single / true_false: exactly one choice, and it is the right one
    const only = chosen.size === 1 ? question.choices.find((c) => chosen.has(c.id)) : null;
    correct = Boolean(only?.isCorrect);
  }
  return { correct, points: correct ? question.points : 0 };
}

// `answers`: [{ questionId, choiceIds?, text? }]. Answers for questions that are not in the
// quiz are ignored; a question left unanswered is simply wrong.
export function gradeAttempt(questions, answers, passingScore) {
  const byQuestion = new Map(answers.map((a) => [a.questionId, a]));
  const results = questions.map((question) => {
    const answer = byQuestion.get(question.id);
    const { correct, points } = gradeQuestion(question, answer);
    return { question, answer, correct, points };
  });
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = results.reduce((sum, r) => sum + r.points, 0);
  const score = totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);
  return { results, totalPoints, earnedPoints, score, passed: totalPoints > 0 && score >= passingScore };
}

// ---- what the learner is given ---------------------------------------------------------
// BEFORE submitting: the question and its choices, nothing else (no isCorrect, no explanation,
// no accepted answers).
export function toLearnerQuestion(question) {
  return {
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    points: question.points,
    choices: question.type === 'text' ? [] : question.choices.map((c) => ({ id: c.id, text: c.text })),
  };
}

// AFTER submitting: whether each answer was right; the right answers and the explanation only
// when the quiz shows its correction.
export function toCorrection(result, quiz) {
  const { question, answer, correct, points } = result;
  const out = {
    questionId: question.id,
    correct,
    points,
    maxPoints: question.points,
    choiceIds: answer?.choiceIds ?? [],
    text: answer?.text ?? '',
  };
  if (quiz.showCorrection) {
    out.explanation = question.explanation;
    if (question.type === 'text') out.acceptedAnswers = question.acceptedAnswers;
    else out.correctChoiceIds = question.choices.filter((c) => c.isCorrect).map((c) => c.id);
  }
  return out;
}

// Deterministic-per-attempt shuffle source (crypto, not Math.random).
export function shuffled(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

import { prisma } from '../config/prisma.js';
import { toEnrollmentSummary, toQuizSummary } from '../serializers/learner.js';
import { reevaluateEnrollment, withEnrollmentLock } from '../services/progress.service.js';
import { gradeAttempt, shuffled, toCorrection, toLearnerQuestion } from '../services/quiz.service.js';
import { HttpError } from '../utils/httpError.js';
import { assertCanRead, findEnrollment, loadForUser } from './learn.controller.js';

// Quizzes, learner side (P3-13). Every route needs a session, an enrolment and the access level
// of the formation (same rules as reading a lesson). The right answers, the explanations and
// the accepted answers of a question leave the server ONLY in the response to a submitted
// attempt, and only when the quiz shows its correction. Grading is done here, once.

const FULL = { questions: { orderBy: { position: 'asc' }, include: { choices: { orderBy: { position: 'asc' } } } } };

async function loadQuiz(req) {
  const { formation, enrollment } = await loadForUser(req.params.slug, req.user);
  assertCanRead(req.user, formation, enrollment);
  const quiz = await prisma.quiz.findFirst({ where: { id: req.params.quizId, formationId: formation.id }, include: FULL });
  if (!quiz) throw new HttpError(404, 'Not found');
  // A quiz that is not finished is not served (its author is still working on it).
  if (!quiz.isComplete) throw new HttpError(409, 'This quiz is not available yet', { reason: 'quiz_unavailable' });
  return { formation, enrollment, quiz };
}

const attemptsOf = (enrollmentId, quizId) => prisma.quizAttempt.findMany({ where: { enrollmentId, quizId }, orderBy: { startedAt: 'asc' } });

function summaryFor(quiz, attempts) {
  return toQuizSummary({ ...quiz, _count: { questions: quiz.questions.length } }, { quizAttempts: attempts });
}

const questionsInOrder = (quiz, order) => {
  const byId = new Map(quiz.questions.map((q) => [q.id, q]));
  // Questions added after the attempt started go last; deleted ones disappear.
  const listed = order.map((id) => byId.get(id)).filter(Boolean);
  const rest = quiz.questions.filter((q) => !order.includes(q.id));
  return [...listed, ...rest];
};

export async function getQuiz(req, res) {
  const { enrollment, quiz } = await loadQuiz(req);
  const attempts = await attemptsOf(enrollment.id, quiz.id);
  res.json({
    quiz: { ...summaryFor(quiz, attempts), instructions: quiz.instructions },
    openAttempt: attempts.some((a) => !a.submittedAt),
  });
}

// Starts an attempt (or resumes the one that is open: leaving the page never burns a try).
export async function startAttempt(req, res) {
  const { enrollment, quiz } = await loadQuiz(req);
  const attempt = await withEnrollmentLock(enrollment.id, async (tx) => {
    const open = await tx.quizAttempt.findFirst({ where: { enrollmentId: enrollment.id, quizId: quiz.id, submittedAt: null } });
    if (open) return open;
    const used = await tx.quizAttempt.count({ where: { enrollmentId: enrollment.id, quizId: quiz.id, submittedAt: { not: null } } });
    if (quiz.maxAttempts !== null && used >= quiz.maxAttempts) {
      throw new HttpError(403, 'No attempt left for this quiz', { reason: 'no_attempts_left' });
    }
    const ids = quiz.questions.map((q) => q.id);
    return tx.quizAttempt.create({
      data: { quizId: quiz.id, formationId: quiz.formationId, enrollmentId: enrollment.id, questionOrder: quiz.shuffleQuestions ? shuffled(ids) : ids },
    });
  });
  const attempts = await attemptsOf(enrollment.id, quiz.id);
  res.status(201).json({
    attempt: { id: attempt.id, startedAt: attempt.startedAt },
    quiz: { ...summaryFor(quiz, attempts), instructions: quiz.instructions },
    questions: questionsInOrder(quiz, attempt.questionOrder).map(toLearnerQuestion),
  });
}

// Keeps only what belongs to the question: a choice id of ANOTHER question, a text sent for a
// choice question, etc. count for nothing.
function cleanAnswer(question, raw) {
  if (question.type === 'text') return { questionId: question.id, choiceIds: [], text: String(raw?.text ?? '').slice(0, 500) };
  const own = new Set(question.choices.map((c) => c.id));
  return { questionId: question.id, choiceIds: [...new Set(raw?.choiceIds ?? [])].filter((id) => own.has(id)), text: '' };
}

export async function submitAttempt(req, res) {
  const { formation, enrollment, quiz } = await loadQuiz(req);

  const outcome = await withEnrollmentLock(enrollment.id, async (tx) => {
    const attempt = await tx.quizAttempt.findFirst({ where: { id: req.params.attemptId, quizId: quiz.id, enrollmentId: enrollment.id } });
    if (!attempt) throw new HttpError(404, 'Not found');
    // An attempt is graded ONCE: replaying a submission cannot change a result.
    if (attempt.submittedAt) throw new HttpError(409, 'This attempt was already submitted', { reason: 'already_submitted' });

    const given = new Map(req.body.answers.map((a) => [a.questionId, a]));
    const answers = quiz.questions.map((q) => cleanAnswer(q, given.get(q.id)));
    const graded = gradeAttempt(quiz.questions, answers, quiz.passingScore);

    await tx.quizAttemptAnswer.createMany({
      data: graded.results.map((r) => ({
        attemptId: attempt.id,
        questionId: r.question.id,
        choiceIds: r.answer?.choiceIds ?? [],
        text: r.answer?.text ?? '',
        correct: r.correct,
        points: r.points,
      })),
    });
    const saved = await tx.quizAttempt.update({
      where: { id: attempt.id },
      data: { submittedAt: new Date(), score: graded.score, earnedPoints: graded.earnedPoints, totalPoints: graded.totalPoints, passed: graded.passed },
    });
    // A passed quiz can be the last thing missing: the formation is finished and the
    // certificate issued in this same locked transaction (same rule as the last lesson).
    if (graded.passed) await reevaluateEnrollment(tx, { user: req.user, formation, enrollmentId: enrollment.id });
    return { saved, graded };
  });

  const fresh = await findEnrollment(req.user.id, formation.id);
  const attempts = await attemptsOf(enrollment.id, quiz.id);
  const { graded, saved } = outcome;
  res.json({
    result: {
      attemptId: saved.id,
      score: graded.score,
      passed: graded.passed,
      earnedPoints: graded.earnedPoints,
      totalPoints: graded.totalPoints,
      passingScore: quiz.passingScore,
      // Without a correction the learner only learns the score, never which answers were right.
      corrections: quiz.showCorrection ? graded.results.map((r) => toCorrection(r, quiz)) : [],
    },
    quiz: { ...summaryFor(quiz, attempts), instructions: quiz.instructions },
    enrollment: toEnrollmentSummary(fresh, formation.courses, formation.quizzes),
  });
}

// The result of the last submitted attempt (to look at it again).
export async function getLastResult(req, res) {
  const { enrollment, quiz } = await loadQuiz(req);
  const attempt = await prisma.quizAttempt.findFirst({
    where: { enrollmentId: enrollment.id, quizId: quiz.id, submittedAt: { not: null } },
    orderBy: { submittedAt: 'desc' },
    include: { answers: true },
  });
  if (!attempt) throw new HttpError(404, 'Not found');
  const byQuestion = new Map(attempt.answers.map((a) => [a.questionId, a]));
  const results = quiz.questions
    .filter((q) => byQuestion.has(q.id))
    .map((question) => {
      const a = byQuestion.get(question.id);
      return { question, answer: { choiceIds: a.choiceIds, text: a.text }, correct: a.correct, points: a.points };
    });
  res.json({
    result: {
      attemptId: attempt.id,
      score: attempt.score,
      passed: attempt.passed,
      earnedPoints: attempt.earnedPoints,
      totalPoints: attempt.totalPoints,
      passingScore: quiz.passingScore,
      corrections: quiz.showCorrection ? results.map((r) => toCorrection(r, quiz)) : [],
    },
    // What the learner needs to read the correction again (they saw these questions already).
    questions: quiz.showCorrection ? results.map((r) => toLearnerQuestion(r.question)) : [],
  });
}

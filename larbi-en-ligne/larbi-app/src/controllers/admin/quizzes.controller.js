import { prisma } from '../../config/prisma.js';
import { toAdminQuiz, toAdminQuestion } from '../../serializers/cms.js';
import { MAX_QUESTIONS, normaliseAnswer, refreshQuizCompleteness } from '../../services/quiz.service.js';
import { HttpError } from '../../utils/httpError.js';

// Administration of quizzes (P3-13): attached to a lesson, a chapter or the end of a formation.

const FULL = { questions: { orderBy: { position: 'asc' }, include: { choices: { orderBy: { position: 'asc' } } } } };

async function loadQuiz(tx, id) {
  const quiz = await tx.quiz.findUnique({ where: { id }, include: FULL });
  if (!quiz) throw new HttpError(404, 'Not found');
  return quiz;
}

export async function createQuiz(req, res) {
  const formationId = req.params.id;
  const { title, scope, courseId, sectionId } = req.body;

  const quiz = await prisma.$transaction(async (tx) => {
    if (!(await tx.formation.findUnique({ where: { id: formationId }, select: { id: true } }))) throw new HttpError(404, 'Not found');
    const data = { formationId, title, scope };
    if (scope === 'course') {
      if (!courseId || sectionId) throw new HttpError(400, 'A lesson quiz needs a lesson (courseId) and nothing else');
      if (!(await tx.course.findFirst({ where: { id: courseId, formationId }, select: { id: true } }))) throw new HttpError(400, 'Unknown lesson');
      data.courseId = courseId;
    } else if (scope === 'section') {
      if (!sectionId || courseId) throw new HttpError(400, 'A chapter quiz needs a chapter (sectionId) and nothing else');
      if (!(await tx.section.findFirst({ where: { id: sectionId, formationId }, select: { id: true } }))) throw new HttpError(400, 'Unknown chapter');
      data.sectionId = sectionId;
    } else {
      if (courseId || sectionId) throw new HttpError(400, 'The final quiz of a formation has no lesson or chapter');
      data.finalFormationId = formationId;
    }
    // One quiz per target: a second one is a 409 (unique keys), not a silent duplicate.
    return tx.quiz.create({ data, include: FULL });
  });
  res.status(201).json({ quiz: toAdminQuiz(quiz) });
}

export async function getQuiz(req, res) {
  res.json({ quiz: toAdminQuiz(await loadQuiz(prisma, req.params.id)) });
}

export async function updateQuiz(req, res) {
  const quiz = await prisma.quiz.update({ where: { id: req.params.id }, data: req.body, include: FULL });
  res.json({ quiz: toAdminQuiz(quiz) });
}

// Deleting a quiz deletes the attempts of the learners with it.
export async function deleteQuiz(req, res) {
  await prisma.quiz.delete({ where: { id: req.params.id } });
  res.status(204).end();
}

const DEFAULT_CHOICES = {
  single: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
  multiple: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
  true_false: [{ text: 'true', isCorrect: true }, { text: 'false', isCorrect: false }],
  text: [],
};

export async function createQuestion(req, res) {
  const quizId = req.params.id;
  const { type } = req.body;
  const question = await prisma.$transaction(async (tx) => {
    await loadQuiz(tx, quizId);
    const count = await tx.quizQuestion.count({ where: { quizId } });
    if (count >= MAX_QUESTIONS) throw new HttpError(409, 'This quiz has reached the maximum number of questions', { max: MAX_QUESTIONS });
    const created = await tx.quizQuestion.create({
      data: {
        quizId,
        type,
        position: count,
        choices: { create: DEFAULT_CHOICES[type].map((choice, position) => ({ ...choice, position })) },
      },
      include: { choices: { orderBy: { position: 'asc' } } },
    });
    await refreshQuizCompleteness(tx, quizId);
    return created;
  });
  res.status(201).json({ question: toAdminQuestion(question) });
}

// Replaces the content of a question. The TYPE of a question never changes (delete it and
// make another one): each type has its own shape.
export async function updateQuestion(req, res) {
  const { prompt, explanation, points, choices, correctTrue, acceptedAnswers } = req.body;
  const result = await prisma.$transaction(async (tx) => {
    const question = await tx.quizQuestion.findUnique({ where: { id: req.params.id }, include: { choices: { orderBy: { position: 'asc' } } } });
    if (!question) throw new HttpError(404, 'Not found');

    const data = {};
    if (prompt !== undefined) data.prompt = prompt;
    if (explanation !== undefined) data.explanation = explanation;
    if (points !== undefined) data.points = points;

    if (question.type === 'text') {
      if (choices !== undefined || correctTrue !== undefined) throw new HttpError(400, 'A free-text question has accepted answers, not choices');
      if (acceptedAnswers !== undefined) {
        const seen = new Set();
        data.acceptedAnswers = acceptedAnswers.filter((a) => {
          const key = normaliseAnswer(a);
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
    } else if (question.type === 'true_false') {
      if (choices !== undefined || acceptedAnswers !== undefined) throw new HttpError(400, 'A true / false question only has its right answer');
      if (correctTrue !== undefined) {
        await tx.quizChoice.deleteMany({ where: { questionId: question.id } });
        await tx.quizChoice.createMany({
          data: [
            { questionId: question.id, position: 0, text: 'true', isCorrect: correctTrue },
            { questionId: question.id, position: 1, text: 'false', isCorrect: !correctTrue },
          ],
        });
      }
    } else {
      if (correctTrue !== undefined || acceptedAnswers !== undefined) throw new HttpError(400, 'A choice question has choices only');
      if (choices !== undefined) {
        const own = new Set(question.choices.map((c) => c.id));
        if (choices.some((c) => c.id && !own.has(c.id))) throw new HttpError(400, 'A choice does not belong to this question');
        const kept = new Set(choices.filter((c) => c.id).map((c) => c.id));
        await tx.quizChoice.deleteMany({ where: { questionId: question.id, id: { notIn: [...kept] } } });
        for (const [position, choice] of choices.entries()) {
          if (choice.id) await tx.quizChoice.update({ where: { id: choice.id }, data: { text: choice.text, isCorrect: choice.isCorrect, position } });
          else await tx.quizChoice.create({ data: { questionId: question.id, text: choice.text, isCorrect: choice.isCorrect, position } });
        }
      }
    }

    if (Object.keys(data).length) await tx.quizQuestion.update({ where: { id: question.id }, data });
    await refreshQuizCompleteness(tx, question.quizId);
    return tx.quizQuestion.findUnique({ where: { id: question.id }, include: { choices: { orderBy: { position: 'asc' } }, quiz: { select: { isComplete: true } } } });
  });
  res.json({ question: toAdminQuestion(result), isComplete: result.quiz.isComplete });
}

export async function deleteQuestion(req, res) {
  await prisma.$transaction(async (tx) => {
    const question = await tx.quizQuestion.findUnique({ where: { id: req.params.id } });
    if (!question) throw new HttpError(404, 'Not found');
    await tx.quizQuestion.delete({ where: { id: question.id } });
    const rest = await tx.quizQuestion.findMany({ where: { quizId: question.quizId }, orderBy: { position: 'asc' }, select: { id: true } });
    for (const [position, q] of rest.entries()) await tx.quizQuestion.update({ where: { id: q.id }, data: { position } });
    await refreshQuizCompleteness(tx, question.quizId);
  });
  res.status(204).end();
}

// Body: EVERY question id of the quiz in the wanted order.
export async function reorderQuestions(req, res) {
  const quizId = req.params.id;
  const { questionIds } = req.body;
  const quiz = await prisma.$transaction(async (tx) => {
    await loadQuiz(tx, quizId);
    const current = (await tx.quizQuestion.findMany({ where: { quizId }, select: { id: true } })).map((q) => q.id);
    const same = questionIds.length === current.length && new Set(questionIds).size === questionIds.length && questionIds.every((id) => current.includes(id));
    if (!same) throw new HttpError(400, 'questionIds must list every question of the quiz exactly once');
    for (const [position, id] of questionIds.entries()) await tx.quizQuestion.update({ where: { id }, data: { position } });
    return loadQuiz(tx, quizId);
  });
  res.json({ quiz: toAdminQuiz(quiz) });
}

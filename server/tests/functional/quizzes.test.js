import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P3-13 — quizzes: authoring, what a learner may see, grading by the server, attempts, and the
// link with the end of the formation. Real API, real database.

let t;
let admin;
let learner;

const api = (method, url, opts) => t.request(method, url, { user: admin, ...opts });
const as = (user, method, url, opts) => t.request(method, url, { user, ...opts });

// A published formation ("Q") with two lessons, enrolled learner, and a complete lesson quiz:
//   q1 single  : 2+2 ? (4 right)                       2 points
//   q2 multiple: prime numbers (2, 3, 5 right)          3 points
//   q3 true/false: "the earth is round" (true)          1 point
//   q4 text    : capital of France (Paris, "ville de Paris")   4 points
async function build({ title = 'Quiz', required = false, extra = {}, enroll = true } = {}) {
  const f = await t.formation({ title, courses: [{ title: 'L1' }, { title: 'L2' }] });
  const [l1] = f.courses;
  const quiz = (await api('POST', `/admin/formations/${f.id}/quizzes`, { json: { title: 'Contrôle', scope: 'course', courseId: l1.id } })).body.quiz;
  await api('PATCH', `/admin/quizzes/${quiz.id}`, { json: { isRequired: required, passingScore: 60, ...extra } });

  const ask = async (type, content) => {
    const q = (await api('POST', `/admin/quizzes/${quiz.id}/questions`, { json: { type } })).body.question;
    const res = await api('PATCH', `/admin/questions/${q.id}`, { json: content });
    assert.equal(res.status, 200, JSON.stringify(res.body).slice(0, 200));
    return res.body.question;
  };
  const q1 = await ask('single', { prompt: '2 + 2 ?', explanation: 'Deux et deux font quatre.', points: 2, choices: [{ text: '3', isCorrect: false }, { text: '4', isCorrect: true }, { text: '5', isCorrect: false }] });
  const q2 = await ask('multiple', { prompt: 'Nombres premiers ?', explanation: '2, 3 et 5 sont premiers.', points: 3, choices: [{ text: '2', isCorrect: true }, { text: '3', isCorrect: true }, { text: '4', isCorrect: false }, { text: '5', isCorrect: true }] });
  const q3 = await ask('true_false', { prompt: 'La Terre est ronde.', explanation: 'Elle est presque sphérique.', points: 1, correctTrue: true });
  const q4 = await ask('text', { prompt: 'Capitale de la France ?', explanation: 'C\'est Paris.', points: 4, acceptedAnswers: ['Paris', 'Ville de Paris'] });
  await t.prisma.formation.update({ where: { id: f.id }, data: { status: 'published', publishedAt: new Date() } });
  const enrollment = enroll ? await t.prisma.enrollment.create({ data: { userId: learner.id, formationId: f.id } }) : null;
  return { f, l1, l2: f.courses[1], quiz, q1, q2, q3, q4, enrollment, slug: f.slug };
}

const choice = (question, text) => question.choices.find((c) => c.text === text).id;
const perfect = (x) => [
  { questionId: x.q1.id, choiceIds: [choice(x.q1, '4')] },
  { questionId: x.q2.id, choiceIds: [choice(x.q2, '2'), choice(x.q2, '3'), choice(x.q2, '5')] },
  { questionId: x.q3.id, choiceIds: [choice(x.q3, 'true')] },
  { questionId: x.q4.id, text: 'paris' },
];
const url = (x, rest = '') => `/learn/formations/${x.slug}/quizzes/${x.quiz.id}${rest}`;
const start = (x, user = learner) => as(user, 'POST', url(x, '/attempts'));
const submit = (x, attemptId, answers, user = learner) => as(user, 'POST', url(x, `/attempts/${attemptId}/submit`), { json: { answers } });

before(async () => {
  t = await boot();
  await t.reset();
  admin = await t.admin();
  learner = await t.user();
});
after(() => t.close());

describe('authoring', () => {
  let f;
  let lessons;

  before(async () => {
    f = await t.formation({ title: 'Auteur', courses: [{ title: 'A' }, { title: 'B' }] });
    lessons = f.courses;
  });

  test('a quiz can be attached to a lesson, a chapter or the end of the formation, once each', async () => {
    const section = (await t.prisma.section.findFirst({ where: { formationId: f.id } })).id;
    const make = (body) => api('POST', `/admin/formations/${f.id}/quizzes`, { json: body });
    const lesson = await make({ title: 'Leçon', scope: 'course', courseId: lessons[0].id });
    const chapter = await make({ title: 'Chapitre', scope: 'section', sectionId: section });
    const final = await make({ title: 'Final', scope: 'formation' });
    assert.deepEqual([lesson.status, chapter.status, final.status], [201, 201, 201]);
    assert.equal(lesson.body.quiz.isRequired, false, 'informative by default');
    assert.equal(lesson.body.quiz.passingScore, 70);
    assert.equal(lesson.body.quiz.isComplete, false, 'no question yet');
    for (const body of [{ title: 'Bis', scope: 'course', courseId: lessons[0].id }, { title: 'Bis', scope: 'section', sectionId: section }, { title: 'Bis', scope: 'formation' }]) {
      assert.equal((await make(body)).status, 409, `a second quiz for the same target: ${body.scope}`);
    }
    assert.equal((await make({ title: 'Autre leçon', scope: 'course', courseId: lessons[1].id })).status, 201);
  });

  test('a wrong target is refused: another formation, missing or extra target, unknown scope', async () => {
    const other = await t.formation({ title: 'Autre', courses: [{ title: 'X' }] });
    const otherSection = (await t.prisma.section.findFirst({ where: { formationId: other.id } })).id;
    const make = (body) => api('POST', `/admin/formations/${f.id}/quizzes`, { json: body });
    for (const body of [
      { title: 'x', scope: 'course', courseId: other.courses[0].id },
      { title: 'x', scope: 'section', sectionId: otherSection },
      { title: 'x', scope: 'course' },
      { title: 'x', scope: 'section' },
      { title: 'x', scope: 'formation', courseId: lessons[0].id },
      { title: 'x', scope: 'course', courseId: lessons[1].id, sectionId: otherSection },
      { title: 'x', scope: 'lesson' },
      { title: '', scope: 'formation' },
      { title: 'x', scope: 'formation', extra: 1 },
    ]) assert.equal((await make(body)).status, 400, JSON.stringify(body).slice(0, 70));
    assert.equal((await api('POST', '/admin/formations/11111111-1111-4111-8111-111111111111/quizzes', { json: { title: 'x', scope: 'formation' } })).status, 404);
  });

  test('settings: passing score, attempts, shuffle, required, correction; refuses nonsense', async () => {
    const q = (await api('POST', `/admin/formations/${(await t.formation({ title: 'Réglages', courses: [] })).id}/quizzes`, { json: { title: 'R', scope: 'formation' } })).body.quiz;
    const ok = await api('PATCH', `/admin/quizzes/${q.id}`, { json: { title: 'Nouveau', instructions: 'Lisez bien.', passingScore: 80, maxAttempts: 3, shuffleQuestions: true, isRequired: true, showCorrection: false } });
    assert.equal(ok.status, 200);
    assert.deepEqual([ok.body.quiz.passingScore, ok.body.quiz.maxAttempts, ok.body.quiz.shuffleQuestions, ok.body.quiz.isRequired, ok.body.quiz.showCorrection], [80, 3, true, true, false]);
    assert.equal((await api('PATCH', `/admin/quizzes/${q.id}`, { json: { maxAttempts: null } })).body.quiz.maxAttempts, null, 'unlimited');
    for (const json of [{ passingScore: 101 }, { passingScore: -1 }, { maxAttempts: 0 }, { maxAttempts: 51 }, { title: '' }, { scope: 'course' }, { isRequired: 'yes' }, { instructions: 'x'.repeat(1001) }]) {
      assert.equal((await api('PATCH', `/admin/quizzes/${q.id}`, { json })).status, 400, JSON.stringify(json));
    }
  });

  test('a new question of each type starts with the right shape; a quiz is complete only when every question is', async () => {
    const q = (await api('POST', `/admin/formations/${f.id}/quizzes`, { json: { title: 'Formes', scope: 'course', courseId: (await t.formation({ title: 'F2', courses: [{ title: 'Z' }] })).courses[0].id } }));
    assert.equal(q.status, 400, 'lesson of another formation');
    const quiz = (await api('GET', `/admin/formations/${f.id}`)).body.formation.quizzes.find((x) => x.title === 'Final');
    const create = async (type) => (await api('POST', `/admin/quizzes/${quiz.id}/questions`, { json: { type } })).body.question;
    const single = await create('single');
    const tf = await create('true_false');
    const text = await create('text');
    assert.equal(single.choices.length, 2);
    assert.deepEqual(tf.choices.map((c) => [c.text, c.isCorrect]), [['true', true], ['false', false]]);
    assert.deepEqual(text.choices, []);
    assert.deepEqual(single.problems.sort(), ['choiceText', 'noCorrect', 'prompt']);
    assert.deepEqual(text.problems.sort(), ['accepted', 'prompt']);
    assert.equal((await api('POST', `/admin/quizzes/${quiz.id}/questions`, { json: { type: 'essay' } })).status, 400);
    assert.equal((await api('GET', `/admin/quizzes/${quiz.id}`)).body.quiz.isComplete, false);
  });

  test('updating a question: content, choices (kept by id), true/false, accepted answers; the type never changes', async () => {
    const quiz = (await api('POST', `/admin/formations/${(await t.formation({ title: 'Maj', courses: [] })).id}/quizzes`, { json: { title: 'M', scope: 'formation' } })).body.quiz;
    const single = (await api('POST', `/admin/quizzes/${quiz.id}/questions`, { json: { type: 'single' } })).body.question;
    const save = (id, json) => api('PATCH', `/admin/questions/${id}`, { json });
    let res = await save(single.id, { prompt: '  Quelle couleur ?  ', explanation: 'Le ciel.', points: 5, choices: [{ text: 'Bleu', isCorrect: true }, { text: 'Rouge', isCorrect: false }, { text: 'Vert', isCorrect: false }] });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.question.problems, []);
    assert.equal(res.body.question.prompt, 'Quelle couleur ?');
    assert.equal(res.body.isComplete, true);
    const [blue, red] = res.body.question.choices;
    // keep two choices by id (texts change), drop the third, add a new one
    res = await save(single.id, { choices: [{ id: red.id, text: 'Rouge vif', isCorrect: false }, { id: blue.id, text: 'Bleu ciel', isCorrect: true }, { text: 'Jaune', isCorrect: false }] });
    assert.deepEqual(res.body.question.choices.map((c) => c.text), ['Rouge vif', 'Bleu ciel', 'Jaune']);
    assert.equal(res.body.question.choices[1].id, blue.id, 'the choice kept its id');
    assert.equal(await t.prisma.quizChoice.count({ where: { questionId: single.id } }), 3, 'the dropped choice is gone');
    // structure refused per type
    assert.equal((await save(single.id, { correctTrue: true })).status, 400);
    assert.equal((await save(single.id, { acceptedAnswers: ['x'] })).status, 400);
    assert.equal((await save(single.id, { choices: [{ id: '11111111-1111-4111-8111-111111111111', text: 'x', isCorrect: true }] })).status, 400, 'a choice of another question');
    const tf = (await api('POST', `/admin/quizzes/${quiz.id}/questions`, { json: { type: 'true_false' } })).body.question;
    assert.equal((await save(tf.id, { correctTrue: false })).body.question.choices.find((c) => c.isCorrect).text, 'false');
    assert.equal((await save(tf.id, { choices: [] })).status, 400);
    const text = (await api('POST', `/admin/quizzes/${quiz.id}/questions`, { json: { type: 'text' } })).body.question;
    const answers = (await save(text.id, { prompt: 'Capitale ?', acceptedAnswers: ['Paris', ' paris ', 'PARIS', 'Éléphant', 'elephant', ''] })).body.question.acceptedAnswers;
    assert.deepEqual(answers, ['Paris', 'Éléphant'], 'duplicates (without case, accents, spaces) and blanks are dropped');
    assert.equal((await save(text.id, { choices: [{ text: 'x', isCorrect: true }] })).status, 400);
    // bounds
    for (const json of [{ points: 0 }, { points: 101 }, { prompt: 'x'.repeat(1001) }, { choices: Array.from({ length: 11 }, () => ({ text: 'x', isCorrect: false })) }, { unknown: 1 }, { choices: [{ text: 'x'.repeat(301), isCorrect: true }] }]) {
      assert.equal((await save(single.id, json)).status, 400, JSON.stringify(json).slice(0, 60));
    }
  });

  test('every way to be incomplete is reported (and a complete question has no problem)', async () => {
    const quiz = (await api('POST', `/admin/formations/${(await t.formation({ title: 'Problèmes', courses: [] })).id}/quizzes`, { json: { title: 'P', scope: 'formation' } })).body.quiz;
    const problemsOf = async (type, content) => {
      const q = (await api('POST', `/admin/quizzes/${quiz.id}/questions`, { json: { type } })).body.question;
      return (await api('PATCH', `/admin/questions/${q.id}`, { json: content })).body.question.problems.sort();
    };
    assert.deepEqual(await problemsOf('single', { prompt: 'p', choices: [{ text: 'a', isCorrect: true }] }), ['choices']);
    assert.deepEqual(await problemsOf('single', { prompt: 'p', choices: [{ text: 'a', isCorrect: true }, { text: 'b', isCorrect: true }] }), ['manyCorrect']);
    assert.deepEqual(await problemsOf('single', { prompt: 'p', choices: [{ text: 'a', isCorrect: false }, { text: 'b', isCorrect: false }] }), ['noCorrect']);
    assert.deepEqual(await problemsOf('single', { prompt: 'p', choices: [{ text: 'a', isCorrect: true }, { text: '  ', isCorrect: false }] }), ['choiceText']);
    assert.deepEqual(await problemsOf('multiple', { prompt: 'p', choices: [{ text: 'a', isCorrect: false }, { text: 'b', isCorrect: false }] }), ['noCorrect']);
    assert.deepEqual(await problemsOf('multiple', { prompt: 'p', choices: [{ text: 'a', isCorrect: true }, { text: 'b', isCorrect: true }] }), [], 'several right answers are fine');
    assert.deepEqual(await problemsOf('text', { prompt: 'p', acceptedAnswers: ['  '] }), ['accepted']);
    assert.deepEqual(await problemsOf('true_false', { prompt: 'p' }), []);
  });

  test('deleting a question renumbers; reordering needs every id exactly once', async () => {
    const quiz = (await api('POST', `/admin/formations/${(await t.formation({ title: 'Ordre', courses: [] })).id}/quizzes`, { json: { title: 'O', scope: 'formation' } })).body.quiz;
    const ids = [];
    for (const p of ['A', 'B', 'C']) {
      const q = (await api('POST', `/admin/quizzes/${quiz.id}/questions`, { json: { type: 'text' } })).body.question;
      await api('PATCH', `/admin/questions/${q.id}`, { json: { prompt: p } });
      ids.push(q.id);
    }
    const order = async () => (await api('GET', `/admin/quizzes/${quiz.id}`)).body.quiz.questions.map((q) => q.prompt).join('');
    assert.equal((await api('PUT', `/admin/quizzes/${quiz.id}/questions/order`, { json: { questionIds: [ids[2], ids[0], ids[1]] } })).status, 200);
    assert.equal(await order(), 'CAB');
    for (const questionIds of [ids.slice(1), [...ids, ids[0]], [ids[0], ids[0], ids[1]], [], ['x']]) {
      assert.equal((await api('PUT', `/admin/quizzes/${quiz.id}/questions/order`, { json: { questionIds } })).status, 400);
    }
    assert.equal(await order(), 'CAB');
    assert.equal((await api('DELETE', `/admin/questions/${ids[2]}`)).status, 204);
    assert.deepEqual((await t.prisma.quizQuestion.findMany({ where: { quizId: quiz.id }, orderBy: { position: 'asc' } })).map((q) => q.position), [0, 1]);
    assert.equal((await api('DELETE', `/admin/questions/${ids[2]}`)).status, 404);
  });

  test('an incomplete quiz blocks the publication of the formation (422), a complete one does not', async () => {
    const x = await build({ title: 'Publication', enroll: false });
    await t.prisma.formation.update({ where: { id: x.f.id }, data: { status: 'draft', publishedAt: null, description: 'D', certificationEnabled: false } });
    await api('POST', `/admin/formations/${x.f.id}/cover`, { form: (await import('../helpers/fixtures.js')).fileForm((await import('../helpers/fixtures.js')).PNG) });
    for (const c of x.f.courses) await api('PATCH', `/admin/courses/${c.id}`, { json: { body: '<p>Contenu</p>' } });
    const empty = (await api('POST', `/admin/formations/${x.f.id}/quizzes`, { json: { title: 'Vide', scope: 'formation' } })).body.quiz;
    const blocked = await api('PUT', `/admin/formations/${x.f.id}/status`, { json: { status: 'published' } });
    assert.equal(blocked.status, 422);
    assert.ok(blocked.body.error.details.missing.includes('quizzes'));
    await api('DELETE', `/admin/quizzes/${empty.id}`);
    assert.equal((await api('PUT', `/admin/formations/${x.f.id}/status`, { json: { status: 'published' } })).status, 200);
  });

  test('only an administrator: 401 anonymous / 403 learner on every quiz route', async () => {
    const x = await build({ title: 'Droits', enroll: false });
    const routes = [
      ['POST', `/admin/formations/${x.f.id}/quizzes`, { title: 'x', scope: 'formation' }],
      ['GET', `/admin/quizzes/${x.quiz.id}`],
      ['PATCH', `/admin/quizzes/${x.quiz.id}`, { title: 'x' }],
      ['DELETE', `/admin/quizzes/${x.quiz.id}`],
      ['POST', `/admin/quizzes/${x.quiz.id}/questions`, { type: 'text' }],
      ['PUT', `/admin/quizzes/${x.quiz.id}/questions/order`, { questionIds: [] }],
      ['PATCH', `/admin/questions/${x.q1.id}`, { prompt: 'x' }],
      ['DELETE', `/admin/questions/${x.q1.id}`],
    ];
    for (const [method, path, json] of routes) {
      assert.equal((await t.request(method, path, { json })).status, 401, `anonymous ${method} ${path}`);
      assert.equal((await t.request(method, path, { user: learner, json })).status, 403, `learner ${method} ${path}`);
    }
    assert.equal((await t.prisma.quiz.findUnique({ where: { id: x.quiz.id } })).title, 'Contrôle');
  });
});

describe('what a learner may see BEFORE submitting', () => {
  let x;
  before(async () => {
    x = await build({ title: 'Avant' });
  });

  test('the summary shows what the quiz is, never a question or an answer', async () => {
    const res = await as(learner, 'GET', url(x));
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.quiz, { id: x.quiz.id, scope: 'course', courseId: x.l1.id, sectionId: null, title: 'Contrôle', isRequired: false, questionCount: 4, passingScore: 60, maxAttempts: null, attemptsUsed: 0, bestScore: null, passed: false, instructions: '' });
    assert.ok(!res.text.includes('Deux et deux') && !res.text.includes('2 + 2'));
  });

  test('starting serves the questions with NO right answer, explanation or accepted answer anywhere', async () => {
    const res = await start(x);
    assert.equal(res.status, 201);
    assert.equal(res.body.questions.length, 4);
    for (const q of res.body.questions) {
      assert.deepEqual(Object.keys(q).sort(), ['choices', 'id', 'points', 'prompt', 'type']);
      for (const c of q.choices) assert.deepEqual(Object.keys(c).sort(), ['id', 'text']);
    }
    const raw = res.text;
    for (const secret of ['isCorrect', 'explanation', 'acceptedAnswers', 'correctChoiceIds', 'Deux et deux font quatre', 'presque sphérique', 'Ville de Paris']) {
      assert.ok(!raw.includes(secret), `leaked: ${secret}`);
    }
  });

  test('the lesson and the formation announce the quiz (finished ones only), without questions', async () => {
    const lesson = await as(learner, 'GET', `/learn/formations/${x.slug}/courses/${x.l1.id}`);
    assert.equal(lesson.body.quiz.id, x.quiz.id);
    assert.equal(lesson.body.quiz.questionCount, 4);
    assert.equal((await as(learner, 'GET', `/learn/formations/${x.slug}/courses/${x.l2.id}`)).body.quiz, null);
    const detail = (await as(learner, 'GET', `/learn/formations/${x.slug}`)).body.formation;
    assert.deepEqual(detail.quizzes.map((q) => q.id), [x.quiz.id]);
    assert.ok(!JSON.stringify(detail).includes('2 + 2'));
  });

  test('resuming gives the SAME attempt and the same order (leaving the page never burns a try)', async () => {
    const shuffled = await build({ title: 'Mélange', extra: { shuffleQuestions: true, maxAttempts: 1 } });
    const first = await start(shuffled);
    const again = await start(shuffled);
    assert.equal(again.body.attempt.id, first.body.attempt.id);
    assert.deepEqual(again.body.questions.map((q) => q.id), first.body.questions.map((q) => q.id));
    assert.equal(await t.prisma.quizAttempt.count({ where: { quizId: shuffled.quiz.id } }), 1);
  });

  test('two simultaneous starts create ONE open attempt', async () => {
    const race = await build({ title: 'Course' });
    const results = await Promise.all([1, 2, 3, 4].map(() => start(race)));
    assert.ok(results.every((r) => r.status === 201));
    assert.equal(new Set(results.map((r) => r.body.attempt.id)).size, 1);
    assert.equal(await t.prisma.quizAttempt.count({ where: { quizId: race.quiz.id } }), 1);
  });

  test('not enrolled: 403; premium formation without premium: 403; draft or another formation: 404; anonymous: 401', async () => {
    const stranger = await t.user();
    assert.equal((await as(stranger, 'GET', url(x))).status, 403);
    assert.equal((await start(x, stranger)).status, 403);
    assert.equal((await t.request('GET', url(x))).status, 401);
    const premium = await build({ title: 'Premium' });
    await t.prisma.formation.update({ where: { id: premium.f.id }, data: { requiredAccessLevel: 'premium' } });
    const res = await as(learner, 'GET', url(premium));
    assert.equal(res.status, 403);
    assert.equal(res.body.error.details.reason, 'premium_required');
    const other = await build({ title: 'Autre formation' });
    assert.equal((await as(learner, 'GET', `/learn/formations/${x.slug}/quizzes/${other.quiz.id}`)).status, 404, 'a quiz of ANOTHER formation');
    assert.equal((await as(learner, 'GET', `/learn/formations/${x.slug}/quizzes/not-a-uuid`)).status, 404);
    const hidden = await build({ title: 'Caché', enroll: false });
    await t.prisma.formation.update({ where: { id: hidden.f.id }, data: { status: 'draft', publishedAt: null } });
    assert.equal((await as(learner, 'GET', url(hidden))).status, 404);
  });

  test('a quiz that is not finished is not served (409) and not listed', async () => {
    const y = await build({ title: 'Inachevé' });
    const extra = (await api('POST', `/admin/quizzes/${y.quiz.id}/questions`, { json: { type: 'single' } })).body.question;
    assert.ok(extra.problems.length > 0);
    assert.equal((await as(learner, 'GET', url(y))).status, 409);
    assert.equal((await start(y)).status, 409);
    assert.deepEqual((await as(learner, 'GET', `/learn/formations/${y.slug}`)).body.formation.quizzes, []);
    await api('DELETE', `/admin/questions/${extra.id}`);
    assert.equal((await as(learner, 'GET', url(y))).status, 200, 'served again once complete');
  });
});

describe('grading is done by the server', () => {
  test('a perfect attempt: 100 %, passed, with the right answers and the explanations', async () => {
    const x = await build({ title: 'Parfait' });
    const attempt = (await start(x)).body.attempt;
    const res = await submit(x, attempt.id, perfect(x));
    assert.equal(res.status, 200);
    const { result } = res.body;
    assert.deepEqual([result.score, result.passed, result.earnedPoints, result.totalPoints, result.passingScore], [100, true, 10, 10, 60]);
    assert.equal(result.corrections.length, 4);
    assert.ok(result.corrections.every((c) => c.correct));
    const c1 = result.corrections.find((c) => c.questionId === x.q1.id);
    assert.equal(c1.explanation, 'Deux et deux font quatre.');
    assert.deepEqual(c1.correctChoiceIds, [choice(x.q1, '4')]);
    assert.deepEqual(result.corrections.find((c) => c.questionId === x.q4.id).acceptedAnswers.sort(), ['Paris', 'Ville de Paris']);
    assert.equal(res.body.quiz.passed, true);
    assert.equal(res.body.quiz.attemptsUsed, 1);
  });

  test('partial answers: points per question, all-or-nothing for a multiple choice, the pass mark decides', async () => {
    const x = await build({ title: 'Partiel', extra: { passingScore: 70 } });
    const attempt = (await start(x)).body.attempt;
    const res = await submit(x, attempt.id, [
      { questionId: x.q1.id, choiceIds: [choice(x.q1, '4')] }, // right: 2
      { questionId: x.q2.id, choiceIds: [choice(x.q2, '2'), choice(x.q2, '3')] }, // one right choice missing: 0
      { questionId: x.q3.id, choiceIds: [choice(x.q3, 'false')] }, // wrong: 0
      { questionId: x.q4.id, text: 'Ville de Paris' }, // right: 4
    ]);
    assert.deepEqual([res.body.result.earnedPoints, res.body.result.score, res.body.result.passed], [6, 60, false], '6/10 = 60 % < 70 %');
    const by = Object.fromEntries(res.body.result.corrections.map((c) => [c.questionId, c.correct]));
    assert.deepEqual([by[x.q1.id], by[x.q2.id], by[x.q3.id], by[x.q4.id]], [true, false, false, true]);
    assert.equal(res.body.quiz.passed, false);
    assert.equal(res.body.quiz.bestScore, 60);
  });

  test('a multiple choice with one wrong extra choice is wrong; a single choice with two selected is wrong', async () => {
    const x = await build({ title: 'Strict' });
    const attempt = (await start(x)).body.attempt;
    const res = await submit(x, attempt.id, [
      { questionId: x.q1.id, choiceIds: [choice(x.q1, '4'), choice(x.q1, '3')] },
      { questionId: x.q2.id, choiceIds: [choice(x.q2, '2'), choice(x.q2, '3'), choice(x.q2, '5'), choice(x.q2, '4')] },
    ]);
    assert.equal(res.body.result.earnedPoints, 0);
  });

  test('free text: without case, accents or extra spaces; a wrong or empty answer is wrong', async () => {
    const x = await build({ title: 'Texte' });
    const q = (await api('POST', `/admin/quizzes/${x.quiz.id}/questions`, { json: { type: 'text' } })).body.question;
    await api('PATCH', `/admin/questions/${q.id}`, { json: { prompt: 'Animal ?', points: 1, acceptedAnswers: ['Éléphant'] } });
    for (const [given, expected] of [['elephant', true], ['  ÉLÉPHANT  ', true], ['éléphants', false], ['', false], ['ele phant', false]]) {
      const attempt = (await start(x)).body.attempt;
      const res = await submit(x, attempt.id, [{ questionId: q.id, text: given }]);
      assert.equal(res.body.result.corrections.find((c) => c.questionId === q.id).correct, expected, `"${given}"`);
    }
  });

  test('tampering: choice ids of another question, unknown questions, text on a choice question, unanswered: all count for nothing', async () => {
    const x = await build({ title: 'Triche' });
    const attempt = (await start(x)).body.attempt;
    const res = await submit(x, attempt.id, [
      { questionId: x.q1.id, choiceIds: [choice(x.q2, '2')] }, // a choice of ANOTHER question
      { questionId: x.q2.id, text: 'les nombres premiers' }, // text for a choice question
      { questionId: '11111111-1111-4111-8111-111111111111', choiceIds: [choice(x.q1, '4')] }, // unknown question
    ]);
    assert.equal(res.status, 200);
    assert.equal(res.body.result.earnedPoints, 0);
    assert.equal(res.body.result.corrections.length, 4, 'graded on the quiz questions only');
  });

  test('invalid submissions are refused: malformed body, too many answers, unknown fields', async () => {
    const x = await build({ title: 'Formes' });
    const attempt = (await start(x)).body.attempt;
    for (const json of [{}, { answers: 'x' }, { answers: [{ questionId: 'nope' }] }, { answers: [{ questionId: x.q1.id, extra: 1 }] }, { answers: [{ questionId: x.q1.id, text: 'x'.repeat(501) }] }, { answers: [], extra: 1 }]) {
      assert.equal((await as(learner, 'POST', url(x, `/attempts/${attempt.id}/submit`), { json })).status, 400, JSON.stringify(json).slice(0, 60));
    }
    assert.equal((await t.prisma.quizAttempt.findUnique({ where: { id: attempt.id } })).submittedAt, null, 'nothing was graded');
  });

  test('an attempt is graded ONCE: replaying, or two submissions at the same time, cannot change the result', async () => {
    const x = await build({ title: 'Une fois' });
    const attempt = (await start(x)).body.attempt;
    const both = await Promise.all([submit(x, attempt.id, perfect(x)), submit(x, attempt.id, [])]);
    assert.deepEqual(both.map((r) => r.status).sort(), [200, 409]);
    const stored = await t.prisma.quizAttempt.findUnique({ where: { id: attempt.id }, include: { answers: true } });
    assert.equal(stored.answers.length, 4, 'one row per question, not two sets');
    const replay = await submit(x, attempt.id, perfect(x));
    assert.equal(replay.status, 409);
    assert.equal(replay.body.error.details.reason, 'already_submitted');
  });

  test("another learner's attempt, a foreign attempt id or another quiz's attempt: 404 / 403", async () => {
    const x = await build({ title: 'Propriété' });
    const attempt = (await start(x)).body.attempt;
    const other = await t.user();
    await t.prisma.enrollment.create({ data: { userId: other.id, formationId: x.f.id } });
    assert.equal((await submit(x, attempt.id, perfect(x), other)).status, 404, 'not their attempt');
    const y = await build({ title: 'Autre quiz' });
    assert.equal((await as(learner, 'POST', `/learn/formations/${x.slug}/quizzes/${x.quiz.id}/attempts/11111111-1111-4111-8111-111111111111/submit`, { json: { answers: [] } })).status, 404);
    assert.equal((await as(learner, 'POST', `/learn/formations/${y.slug}/quizzes/${y.quiz.id}/attempts/${attempt.id}/submit`, { json: { answers: [] } })).status, 404, 'an attempt of another quiz');
    assert.equal((await t.prisma.quizAttempt.findUnique({ where: { id: attempt.id } })).submittedAt, null);
  });

  test('without correction the learner only learns the score: no per-question result, no answer, no explanation', async () => {
    const x = await build({ title: 'Sans correction', extra: { showCorrection: false } });
    const attempt = (await start(x)).body.attempt;
    const res = await submit(x, attempt.id, perfect(x));
    assert.deepEqual([res.body.result.score, res.body.result.passed, res.body.result.corrections], [100, true, []]);
    for (const secret of ['Deux et deux font quatre', 'explanation', 'correctChoiceIds', 'acceptedAnswers']) assert.ok(!res.text.includes(secret), secret);
    const again = await as(learner, 'GET', url(x, '/result'));
    assert.deepEqual(again.body.result.corrections, []);
    assert.ok(!again.text.includes('Deux et deux'));
  });

  test('the last result can be read again (with its correction), and 404 before any attempt', async () => {
    const x = await build({ title: 'Relire' });
    assert.equal((await as(learner, 'GET', url(x, '/result'))).status, 404);
    const attempt = (await start(x)).body.attempt;
    await submit(x, attempt.id, perfect(x));
    const res = await as(learner, 'GET', url(x, '/result'));
    assert.equal(res.body.result.score, 100);
    assert.equal(res.body.result.corrections.length, 4);
  });

  test('the number of attempts is limited: after the last one, 403 "no_attempts_left"; an open attempt can still be finished', async () => {
    const x = await build({ title: 'Limité', extra: { maxAttempts: 2 } });
    for (let i = 0; i < 2; i += 1) {
      const attempt = (await start(x)).body.attempt;
      assert.equal((await submit(x, attempt.id, [])).status, 200);
    }
    const blocked = await start(x);
    assert.equal(blocked.status, 403);
    assert.equal(blocked.body.error.details.reason, 'no_attempts_left');
    assert.equal((await as(learner, 'GET', url(x))).body.quiz.attemptsUsed, 2);
    // an attempt that was open before the limit was reached can still be submitted
    const y = await build({ title: 'Limité 1', extra: { maxAttempts: 1 } });
    const open = (await start(y)).body.attempt;
    assert.equal((await start(y)).body.attempt.id, open.id);
    assert.equal((await submit(y, open.id, perfect(y))).status, 200);
    assert.equal((await start(y)).status, 403);
  });

  test('score and pass mark are stored; the database refuses an inconsistent attempt', async () => {
    const x = await build({ title: 'Stockage' });
    const attempt = (await start(x)).body.attempt;
    await submit(x, attempt.id, perfect(x));
    const row = await t.prisma.quizAttempt.findUnique({ where: { id: attempt.id } });
    assert.deepEqual([row.score, row.passed, row.earnedPoints, row.totalPoints], [100, true, 10, 10]);
    await assert.rejects(t.prisma.quizAttempt.update({ where: { id: attempt.id }, data: { score: 101 } }), 'score out of range');
    await assert.rejects(t.prisma.quizAttempt.create({ data: { quizId: x.quiz.id, formationId: x.f.id, enrollmentId: x.enrollment.id, score: 50 } }), 'a score without a submission date');
  });
});

describe('a required quiz decides the end of the formation and the certificate', () => {
  const certified = (x) => t.prisma.certification.count({ where: { enrollmentId: x.enrollment.id } });
  const status = async (x) => (await t.prisma.enrollment.findUnique({ where: { id: x.enrollment.id } })).status;
  const completeLessons = async (x) => {
    for (const lesson of [x.l1, x.l2]) {
      await as(learner, 'GET', `/learn/formations/${x.slug}/courses/${lesson.id}`);
      assert.equal((await as(learner, 'PUT', `/learn/formations/${x.slug}/courses/${lesson.id}/completion`)).status, 200);
    }
  };

  test('all lessons done but the required quiz not passed: NOT finished, no certificate; passing it finishes and certifies, in one step', async () => {
    const x = await build({ title: 'Obligatoire', required: true });
    await completeLessons(x);
    assert.equal(await status(x), 'active');
    assert.equal(await certified(x), 0);
    const detail = (await as(learner, 'GET', `/learn/formations/${x.slug}`)).body.formation;
    assert.equal(detail.enrollment.progress.requiredQuizzesRemaining, 1);
    assert.equal(detail.enrollment.progress.requiredRemaining, 0, 'the lessons are done');

    const failing = (await start(x)).body.attempt;
    const failed = await submit(x, failing.id, []);
    assert.equal(failed.body.result.passed, false);
    assert.equal(failed.body.enrollment.status, 'active');
    assert.equal(await certified(x), 0);

    const winning = (await start(x)).body.attempt;
    const won = await submit(x, winning.id, perfect(x));
    assert.equal(won.body.result.passed, true);
    assert.equal(won.body.enrollment.status, 'completed');
    assert.equal(won.body.enrollment.progress.requiredQuizzesRemaining, 0);
    assert.ok(won.body.enrollment.certification, 'the certificate was issued by this very request');
    assert.equal(await status(x), 'completed');
    assert.equal(await certified(x), 1);
  });

  test('passing the quiz BEFORE the last lesson: the last lesson then finishes and certifies', async () => {
    const x = await build({ title: 'Ordre inverse', required: true });
    const attempt = (await start(x)).body.attempt;
    await submit(x, attempt.id, perfect(x));
    assert.equal(await status(x), 'active', 'lessons are still missing');
    await completeLessons(x);
    assert.equal(await status(x), 'completed');
    assert.equal(await certified(x), 1);
  });

  test('an informative quiz never blocks; an incomplete required quiz cannot trap a learner', async () => {
    const info = await build({ title: 'Informatif', required: false });
    await completeLessons(info);
    assert.equal(await status(info), 'completed');
    const trapped = await build({ title: 'Piège', required: true });
    await api('POST', `/admin/quizzes/${trapped.quiz.id}/questions`, { json: { type: 'single' } }); // now incomplete
    await completeLessons(trapped);
    assert.equal(await status(trapped), 'completed', 'a quiz nobody can take cannot block the formation');
  });

  test('the same learner passing twice does not issue two certificates; a passed quiz stays passed', async () => {
    const x = await build({ title: 'Deux fois', required: true });
    await completeLessons(x);
    for (let i = 0; i < 2; i += 1) {
      const attempt = (await start(x)).body.attempt;
      assert.equal((await submit(x, attempt.id, perfect(x))).status, 200);
    }
    assert.equal(await certified(x), 1);
    const failing = (await start(x)).body.attempt;
    await submit(x, failing.id, []);
    assert.equal(await status(x), 'completed', 'a later failure does not undo a completed formation');
    assert.equal((await as(learner, 'GET', url(x))).body.quiz.passed, true);
  });

  test('making a quiz required AFTER a learner finished does not take the certificate away', async () => {
    const x = await build({ title: 'Rétroactif' });
    await completeLessons(x);
    assert.equal(await status(x), 'completed');
    await api('PATCH', `/admin/quizzes/${x.quiz.id}`, { json: { isRequired: true } });
    assert.equal(await status(x), 'completed');
    const cert = await as(learner, 'POST', `/learn/formations/${x.slug}/certificate`);
    assert.ok([200, 201].includes(cert.status));
  });

  test('a chapter quiz and the final quiz count the same way', async () => {
    const x = await build({ title: 'Portées', required: false });
    const final = (await api('POST', `/admin/formations/${x.f.id}/quizzes`, { json: { title: 'Final', scope: 'formation' } })).body.quiz;
    await api('PATCH', `/admin/quizzes/${final.id}`, { json: { isRequired: true, passingScore: 50 } });
    const q = (await api('POST', `/admin/quizzes/${final.id}/questions`, { json: { type: 'true_false' } })).body.question;
    await api('PATCH', `/admin/questions/${q.id}`, { json: { prompt: 'Vrai ?', correctTrue: true } });
    await completeLessons(x);
    assert.equal(await status(x), 'active', 'the final quiz is required');
    const started = await as(learner, 'POST', `/learn/formations/${x.slug}/quizzes/${final.id}/attempts`);
    const yes = started.body.questions[0].choices.find((c) => c.text === 'true').id;
    const res = await as(learner, 'POST', `/learn/formations/${x.slug}/quizzes/${final.id}/attempts/${started.body.attempt.id}/submit`, { json: { answers: [{ questionId: q.id, choiceIds: [yes] }] } });
    assert.equal(res.body.result.passed, true);
    assert.equal(await status(x), 'completed');
    const detail = (await as(learner, 'GET', `/learn/formations/${x.slug}`)).body.formation;
    assert.deepEqual(detail.quizzes.map((z) => z.scope).sort(), ['course', 'formation']);
  });
});

describe('deleting', () => {
  test('deleting a lesson deletes its quiz; deleting a quiz deletes the attempts; the formation is untouched', async () => {
    const x = await build({ title: 'Suppression' });
    const attempt = (await start(x)).body.attempt;
    await submit(x, attempt.id, perfect(x));
    assert.equal((await api('DELETE', `/admin/courses/${x.l1.id}`)).status, 204);
    assert.equal(await t.prisma.quiz.count({ where: { id: x.quiz.id } }), 0);
    assert.equal(await t.prisma.quizAttempt.count({ where: { quizId: x.quiz.id } }), 0);
    assert.equal(await t.prisma.formation.count({ where: { id: x.f.id } }), 1);
    const y = await build({ title: 'Suppression 2' });
    const a = (await start(y)).body.attempt;
    await submit(y, a.id, []);
    assert.equal((await api('DELETE', `/admin/quizzes/${y.quiz.id}`)).status, 204);
    assert.equal(await t.prisma.quizAttempt.count({ where: { quizId: y.quiz.id } }), 0);
    assert.equal(await t.prisma.quizQuestion.count({ where: { quizId: y.quiz.id } }), 0);
  });
});

describe('the database refuses inconsistent quizzes', () => {
  test('scope and target must agree; one quiz per target; the target must be in the same formation', async () => {
    const f = await t.formation({ title: 'SQL', courses: [{ title: 'A' }] });
    const g = await t.formation({ title: 'SQL 2', courses: [{ title: 'B' }] });
    const section = await t.prisma.section.findFirst({ where: { formationId: f.id } });
    const base = { formationId: f.id, title: 'x' };
    await assert.rejects(t.prisma.quiz.create({ data: { ...base, scope: 'course' } }), 'lesson quiz without lesson');
    await assert.rejects(t.prisma.quiz.create({ data: { ...base, scope: 'section', courseId: f.courses[0].id } }), 'section quiz with a lesson');
    await assert.rejects(t.prisma.quiz.create({ data: { ...base, scope: 'formation' } }), 'final quiz without its marker');
    await assert.rejects(t.prisma.quiz.create({ data: { ...base, scope: 'exam', courseId: f.courses[0].id } }), 'unknown scope');
    await assert.rejects(t.prisma.quiz.create({ data: { ...base, scope: 'course', courseId: g.courses[0].id } }), 'lesson of another formation');
    await assert.rejects(t.prisma.quiz.create({ data: { ...base, scope: 'course', courseId: f.courses[0].id, passingScore: 101 } }), 'pass mark out of range');
    await assert.rejects(t.prisma.quiz.create({ data: { ...base, scope: 'course', courseId: f.courses[0].id, maxAttempts: 0 } }), 'zero attempts');
    await t.prisma.quiz.create({ data: { ...base, scope: 'section', sectionId: section.id } });
    await assert.rejects(t.prisma.quiz.create({ data: { ...base, scope: 'section', sectionId: section.id } }), 'two quizzes for one chapter');
    await t.prisma.quiz.create({ data: { ...base, scope: 'formation', finalFormationId: f.id } });
    await assert.rejects(t.prisma.quiz.create({ data: { ...base, scope: 'formation', finalFormationId: f.id } }), 'two final quizzes');
  });

  test('question type and points are checked by the database too', async () => {
    const f = await t.formation({ title: 'SQL 3', courses: [] });
    const quiz = await t.prisma.quiz.create({ data: { formationId: f.id, title: 'x', scope: 'formation', finalFormationId: f.id } });
    await assert.rejects(t.prisma.quizQuestion.create({ data: { quizId: quiz.id, type: 'essay', position: 0 } }), 'type');
    await assert.rejects(t.prisma.quizQuestion.create({ data: { quizId: quiz.id, type: 'single', position: 0, points: 0 } }), 'points');
    await assert.rejects(t.prisma.quizQuestion.create({ data: { quizId: quiz.id, type: 'single', position: -1 } }), 'position');
  });
});

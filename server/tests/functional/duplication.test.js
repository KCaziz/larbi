import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { PNG, PDF, fileForm } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';

// P3-14 — duplicating a lesson, a chapter or a whole formation: an independent copy of the
// content (files included), never of the learners' data; atomic, with no residue on failure.

let t;
let admin;
let learner;
let storage;

const api = (method, url, opts) => t.request(method, url, { user: admin, ...opts });
const files = () => (existsSync(storage) ? readdirSync(storage) : []);
const upload = (courseId, bytes, opts) => api('POST', `/admin/courses/${courseId}/blocks/upload`, { form: fileForm(bytes, opts) });

// A formation with two chapters: "Bases" (L1 with text + image + PDF, L2) and "Suite" (L3), a lesson
// quiz on L1 (one true/false question), a final quiz, a cover, an enrolment and progress.
async function source(title = 'Source') {
  const f = (await api('POST', '/admin/formations', { json: { title } })).body.formation;
  const bases = (await api('POST', `/admin/formations/${f.id}/sections`, { json: { title: 'Bases' } })).body.section;
  const suite = (await api('POST', `/admin/formations/${f.id}/sections`, { json: { title: 'Suite' } })).body.section;
  const lesson = async (name, sectionId) => (await api('POST', `/admin/formations/${f.id}/courses`, { json: { title: name, sectionId } })).body.course;
  const l1 = await lesson('L1', bases.id);
  const l2 = await lesson('L2', bases.id);
  const l3 = await lesson('L3', suite.id);
  await api('PATCH', `/admin/formations/${f.id}`, {
    json: { subtitle: 'Sous-titre', description: 'Description', level: 'advanced', objectives: ['O1', 'O2'], prerequisites: ['P1'], requiredAccessLevel: 'premium', certificationEnabled: true, certificationTitle: 'Certificat X', certificationDescription: 'Desc' },
  });
  await api('PATCH', `/admin/courses/${l1.id}`, { json: { summary: 'Résumé', estimatedMinutes: 15, isRequired: true, body: '<p>Texte de L1</p>' } });
  await api('PATCH', `/admin/courses/${l2.id}`, { json: { isRequired: false } });
  await api('POST', `/admin/courses/${l1.id}/blocks`, { json: { type: 'code', data: { language: 'sql', code: 'SELECT 1;' } } });
  const image = (await upload(l1.id, PNG, { name: 'schema.png' })).body.block;
  const pdf = (await upload(l1.id, PDF, { name: 'guide.pdf', type: 'application/pdf' })).body.block;
  await api('POST', `/admin/formations/${f.id}/cover`, { form: fileForm(PNG) });
  const quiz = (await api('POST', `/admin/formations/${f.id}/quizzes`, { json: { title: 'Quiz L1', scope: 'course', courseId: l1.id } })).body.quiz;
  const q = (await api('POST', `/admin/quizzes/${quiz.id}/questions`, { json: { type: 'true_false' } })).body.question;
  await api('PATCH', `/admin/questions/${q.id}`, { json: { prompt: 'Vrai ?', explanation: 'Oui.', points: 3, correctTrue: false } });
  await api('PATCH', `/admin/quizzes/${quiz.id}`, { json: { isRequired: true, passingScore: 80, maxAttempts: 2 } });
  const final = (await api('POST', `/admin/formations/${f.id}/quizzes`, { json: { title: 'Final', scope: 'formation' } })).body.quiz;
  const fq = (await api('POST', `/admin/quizzes/${final.id}/questions`, { json: { type: 'text' } })).body.question;
  await api('PATCH', `/admin/questions/${fq.id}`, { json: { prompt: 'Capitale ?', acceptedAnswers: ['Paris'] } });
  // learners' data on the original: must NEVER be copied
  await t.prisma.formation.update({ where: { id: f.id }, data: { status: 'published', publishedAt: new Date() } });
  const enrollment = await t.prisma.enrollment.create({ data: { userId: learner.id, formationId: f.id } });
  await t.prisma.courseProgress.create({ data: { enrollmentId: enrollment.id, courseId: l1.id, formationId: f.id, status: 'completed', completedAt: new Date() } });
  await t.prisma.quizAttempt.create({ data: { quizId: quiz.id, formationId: f.id, enrollmentId: enrollment.id, submittedAt: new Date(), score: 100, earnedPoints: 3, totalPoints: 3, passed: true } });
  return { f, bases, suite, l1, l2, l3, image, pdf, quiz };
}

const shape = async (formationId) => {
  const sections = await t.prisma.section.findMany({ where: { formationId }, orderBy: { position: 'asc' } });
  const courses = await t.prisma.course.findMany({ where: { formationId }, orderBy: { position: 'asc' } });
  return courses.map((c) => `${sections.find((s) => s.id === c.sectionId)?.title}:${c.title}`);
};

before(async () => {
  t = await boot();
  await t.reset();
  storage = path.join(process.env.STORAGE_DIR, 'private');
  admin = await t.admin();
  learner = await t.user();
});
after(() => t.close());

describe('duplicating a lesson', () => {
  test('the copy comes right after the original, in the same chapter, with its blocks and its OWN copies of the files', async () => {
    const x = await source('Leçon');
    const before = files().length;
    const res = await api('POST', `/admin/courses/${x.l1.id}/duplicate`);
    assert.equal(res.status, 201);
    const copy = res.body.course;
    assert.equal(copy.title, 'L1 (copie)');
    assert.deepEqual(await shape(x.f.id), ['Bases:L1', 'Bases:L1 (copie)', 'Bases:L2', 'Suite:L3']);
    assert.deepEqual((await t.prisma.course.findMany({ where: { formationId: x.f.id }, orderBy: { position: 'asc' } })).map((c) => c.position), [0, 1, 2, 3]);
    const c = await t.prisma.course.findUnique({ where: { id: copy.id } });
    assert.deepEqual([c.summary, c.estimatedMinutes, c.isRequired], ['Résumé', 15, true]);
    const original = await t.prisma.lessonBlock.findMany({ where: { courseId: x.l1.id }, orderBy: { position: 'asc' }, include: { media: true } });
    const copied = await t.prisma.lessonBlock.findMany({ where: { courseId: copy.id }, orderBy: { position: 'asc' }, include: { media: true } });
    assert.deepEqual(copied.map((b) => b.type), original.map((b) => b.type));
    assert.deepEqual(copied.map((b) => b.data), original.map((b) => b.data));
    const fileBlocks = copied.filter((b) => b.media);
    assert.equal(fileBlocks.length, 2);
    for (const b of fileBlocks) {
      const source = original.find((o) => o.media && o.media.originalName === b.media.originalName);
      assert.notEqual(b.media.id, source.media.id, 'a new media row');
      assert.notEqual(b.media.storageKey, source.media.storageKey, 'a new stored file');
      assert.equal(b.media.courseId, copy.id);
      assert.ok(existsSync(path.join(storage, b.media.storageKey)));
    }
    assert.equal(files().length, before + 2, 'two files copied on disk');
    assert.ok(!JSON.stringify(res.body).includes('storageKey'));
  });

  test('deleting the copy does not touch the original (its files stay)', async () => {
    const x = await source('Indépendance');
    const copy = (await api('POST', `/admin/courses/${x.l1.id}/duplicate`)).body.course;
    assert.equal((await api('DELETE', `/admin/courses/${copy.id}`)).status, 204);
    const originalFiles = (await t.prisma.media.findMany({ where: { courseId: x.l1.id } })).map((m) => m.storageKey);
    assert.equal(originalFiles.length, 2);
    for (const key of originalFiles) assert.ok(existsSync(path.join(storage, key)));
  });

  test("progress, quiz and history of the original are NOT copied", async () => {
    const x = await source('Sans données');
    const copy = (await api('POST', `/admin/courses/${x.l1.id}/duplicate`)).body.course;
    assert.equal(await t.prisma.courseProgress.count({ where: { courseId: copy.id } }), 0);
    assert.equal(await t.prisma.quiz.count({ where: { courseId: copy.id } }), 0);
    assert.equal(await t.prisma.lessonRevision.count({ where: { courseId: copy.id } }), 0);
  });

  test('a missing file makes the whole copy fail cleanly: no lesson, no block, no media row, no stray file', async () => {
    const x = await source('Fichier manquant');
    const media = await t.prisma.media.findFirst({ where: { courseId: x.l1.id }, orderBy: { createdAt: 'desc' } });
    rmSync(path.join(storage, media.storageKey));
    const lessons = await t.prisma.course.count({ where: { formationId: x.f.id } });
    const mediaRows = await t.prisma.media.count();
    const blocks = await t.prisma.lessonBlock.count();
    const stored = files().length;
    const res = await api('POST', `/admin/courses/${x.l1.id}/duplicate`);
    assert.equal(res.status, 409);
    assert.equal(await t.prisma.course.count({ where: { formationId: x.f.id } }), lessons);
    assert.equal(await t.prisma.media.count(), mediaRows);
    assert.equal(await t.prisma.lessonBlock.count(), blocks);
    assert.equal(files().length, stored, 'the files copied before the failure were removed');
  });

  test('unknown lesson: 404; only an administrator (401 / 403)', async () => {
    const x = await source('Droits');
    assert.equal((await api('POST', '/admin/courses/11111111-1111-4111-8111-111111111111/duplicate')).status, 404);
    for (const [path, id] of [['courses', x.l1.id], ['sections', x.bases.id], ['formations', x.f.id]]) {
      assert.equal((await t.request('POST', `/admin/${path}/${id}/duplicate`)).status, 401);
      assert.equal((await t.request('POST', `/admin/${path}/${id}/duplicate`, { user: learner })).status, 403);
    }
    assert.equal(await t.prisma.course.count({ where: { formationId: x.f.id } }), 3);
  });
});

describe('duplicating a chapter', () => {
  test('the copy comes right after, with copies of every lesson (blocks and files) in the same order', async () => {
    const x = await source('Chapitre');
    const res = await api('POST', `/admin/sections/${x.bases.id}/duplicate`);
    assert.equal(res.status, 201);
    assert.deepEqual(res.body.formation.sections.map((s) => s.title), ['Bases', 'Bases (copie)', 'Suite']);
    assert.deepEqual(await shape(x.f.id), ['Bases:L1', 'Bases:L2', 'Bases (copie):L1', 'Bases (copie):L2', 'Suite:L3']);
    const copiedL1 = (await t.prisma.course.findMany({ where: { formationId: x.f.id, title: 'L1' }, orderBy: { position: 'asc' } }))[1];
    assert.deepEqual((await t.prisma.lessonBlock.findMany({ where: { courseId: copiedL1.id }, orderBy: { position: 'asc' } })).map((b) => b.type), ['text', 'code', 'image', 'file']);
    assert.equal(await t.prisma.quiz.count({ where: { formationId: x.f.id } }), 2, 'quizzes are not copied with a chapter');
  });
});

describe('duplicating a formation', () => {
  test('an independent DRAFT: presentation, plan, blocks, files, cover, quizzes; nothing of the learners', async () => {
    const x = await source('Formation');
    const stored = files().length;
    const res = await api('POST', `/admin/formations/${x.f.id}/duplicate`);
    assert.equal(res.status, 201);
    const copy = res.body.formation;
    assert.equal(copy.title, 'Formation (copie)');
    assert.equal(copy.status, 'draft');
    assert.equal(copy.publishedAt, null);
    assert.deepEqual([copy.subtitle, copy.level, copy.objectives, copy.prerequisites, copy.requiredAccessLevel], ['Sous-titre', 'advanced', ['O1', 'O2'], ['P1'], 'premium']);
    assert.deepEqual([copy.certification.enabled, copy.certification.title], [true, 'Certificat X']);
    assert.notEqual(copy.id, x.f.id);
    const row = await t.prisma.formation.findUnique({ where: { id: copy.id } });
    const orig = await t.prisma.formation.findUnique({ where: { id: x.f.id } });
    assert.notEqual(row.slug, orig.slug);
    assert.deepEqual(await shape(copy.id), ['Bases:L1', 'Bases:L2', 'Suite:L3']);
    assert.notEqual(row.coverImageId, orig.coverImageId, 'the cover is a copy');
    assert.equal(files().length, stored + 3, 'cover + image + PDF copied');

    // quizzes with their questions, answers and settings
    const quizzes = await t.prisma.quiz.findMany({ where: { formationId: copy.id }, include: { questions: { include: { choices: true } } }, orderBy: { scope: 'asc' } });
    assert.deepEqual(quizzes.map((q) => [q.scope, q.title, q.isRequired, q.passingScore, q.maxAttempts, q.isComplete]), [['course', 'Quiz L1', true, 80, 2, true], ['formation', 'Final', false, 70, null, true]]);
    const copiedL1 = await t.prisma.course.findFirst({ where: { formationId: copy.id, title: 'L1' } });
    assert.equal(quizzes[0].courseId, copiedL1.id, 'the quiz follows ITS lesson in the copy');
    assert.equal(quizzes[1].finalFormationId, copy.id);
    const tf = quizzes[0].questions[0];
    assert.deepEqual([tf.prompt, tf.explanation, tf.points], ['Vrai ?', 'Oui.', 3]);
    assert.deepEqual(tf.choices.map((c) => [c.text, c.isCorrect]).sort(), [['false', true], ['true', false]]);

    // nothing of the learners
    assert.equal(await t.prisma.enrollment.count({ where: { formationId: copy.id } }), 0);
    assert.equal(await t.prisma.courseProgress.count({ where: { formationId: copy.id } }), 0);
    assert.equal(await t.prisma.quizAttempt.count({ where: { formationId: copy.id } }), 0);
    // the original is untouched
    assert.equal((await t.prisma.formation.findUnique({ where: { id: x.f.id } })).status, 'published');
    assert.equal(await t.prisma.enrollment.count({ where: { formationId: x.f.id } }), 1);
  });

  test('the copy is not visible to learners (a draft), and can be deleted with all its files', async () => {
    const x = await source('Brouillon copié');
    const copy = (await api('POST', `/admin/formations/${x.f.id}/duplicate`)).body.formation;
    const slug = (await t.prisma.formation.findUnique({ where: { id: copy.id } })).slug;
    assert.equal((await t.request('GET', `/learn/formations/${slug}`, { user: learner })).status, 404);
    const stored = files().length;
    assert.equal((await api('DELETE', `/admin/formations/${copy.id}`)).status, 204);
    assert.equal(files().length, stored - 3, 'the copies of the files are removed with it');
    assert.equal(await t.prisma.formation.count({ where: { id: x.f.id } }), 1);
    for (const m of await t.prisma.media.findMany({ where: { OR: [{ courseId: x.l1.id }, { id: (await t.prisma.formation.findUnique({ where: { id: x.f.id } })).coverImageId }] } })) {
      assert.ok(existsSync(path.join(storage, m.storageKey)), 'the original files are still there');
    }
  });

  test('duplicating twice gives two distinct slugs; a failure leaves nothing behind', async () => {
    const x = await source('Deux fois');
    const a = (await api('POST', `/admin/formations/${x.f.id}/duplicate`)).body.formation;
    const b = (await api('POST', `/admin/formations/${x.f.id}/duplicate`)).body.formation;
    const slugs = (await t.prisma.formation.findMany({ where: { id: { in: [a.id, b.id, x.f.id] } } })).map((f) => f.slug);
    assert.equal(new Set(slugs).size, 3);

    const media = await t.prisma.media.findFirst({ where: { courseId: x.l1.id } });
    rmSync(path.join(storage, media.storageKey));
    const formations = await t.prisma.formation.count();
    const stored = files().length;
    assert.equal((await api('POST', `/admin/formations/${x.f.id}/duplicate`)).status, 409);
    assert.equal(await t.prisma.formation.count(), formations, 'no half-copied formation');
    assert.equal(files().length, stored, 'no stray copied file');
  });

  test('the whole database stays consistent after duplications', async () => {
    const { checkConsistency } = await import('../../src/services/consistency.service.js');
    const problems = await checkConsistency(t.prisma, { privateDir: storage });
    // (the formation whose file was removed on purpose above is the only expected inconsistency)
    assert.deepEqual(problems.filter((p) => !/is missing|orphan file/.test(p.detail) && !/is missing/.test(p.rule)), []);
  });
});

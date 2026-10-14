import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { ENROLLMENT_STATUS, PROGRESS_STATUS } from '../../src/constants/elearning.js';
import { SECURITY_MODULE_SLUG } from '../../src/constants/finPasseport.js';

// Passeport de connaissances financières (P2-09), écrans LY11/LY12/ET09.
// Jamais un score bancaire, jamais une mesure de solvabilité, jamais un
// jugement sur une absence de contenu publié (« Sécurité numérique »).

let t;
const get = (user) => t.request('GET', '/fin/passeport', { user });

async function enroll(prisma, user, formation, status = ENROLLMENT_STATUS.ACTIVE) {
  return prisma.enrollment.create({
    data: { userId: user.id, formationId: formation.id, status, completedAt: status === ENROLLMENT_STATUS.COMPLETED ? new Date() : null },
  });
}

before(async () => {
  t = await boot();
  await t.reset();
});
after(() => t.close());

describe('access and isolation', () => {
  test('no session: 401', async () => {
    assert.equal((await get()).status, 401);
  });

  test('two accounts never see each other\'s progress', async () => {
    const alice = await t.user();
    const bob = await t.user();
    const formation = await t.formation({ title: 'Budget de base' });
    await enroll(t.prisma, alice, formation, ENROLLMENT_STATUS.COMPLETED);

    const aliceRes = await get(alice);
    const bobRes = await get(bob);
    assert.equal(aliceRes.body.formationsTerminees.length, 1);
    assert.equal(bobRes.body.formationsTerminees.length, 0);
  });
});

describe('a learner with nothing yet', () => {
  test('every figure is "not computed", never zero or invented', async () => {
    const user = await t.user();
    const res = await get(user);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.formationsTerminees, []);
    assert.deepEqual(res.body.etapesSuivantes, []);
    assert.deepEqual(res.body.quizReussis, []);
    assert.equal(res.body.dimensions.formationsCompletion, null);
    assert.equal(res.body.dimensions.quizzesAverage, null);
    assert.deepEqual(res.body.dimensions.securityModule, { reason: 'noContentPublished' });
  });
});

describe('the global index is never published', () => {
  test('whatever the data, "indiceConnaissances" never carries a number', async () => {
    const user = await t.user();
    const formation = await t.formation({ title: 'Épargne' });
    await enroll(t.prisma, user, formation, ENROLLMENT_STATUS.COMPLETED);
    const res = await get(user);
    assert.equal(typeof res.body.indiceConnaissances, 'object');
    assert.equal(res.body.indiceConnaissances.formula, 'F052');
    assert.ok('waitingOn' in res.body.indiceConnaissances);
    assert.ok(!JSON.stringify(res.body).match(/"indiceConnaissances":\s*-?\d/));
  });
});

describe('completed formations and real certificates', () => {
  test('a completed formation with a certificate says so; without one, it does not invent one', async () => {
    const user = await t.user();
    const formationA = await t.formation({ title: 'Formation A' });
    const formationB = await t.formation({ title: 'Formation B', certificationEnabled: false });
    const enA = await enroll(t.prisma, user, formationA, ENROLLMENT_STATUS.COMPLETED);
    await enroll(t.prisma, user, formationB, ENROLLMENT_STATUS.COMPLETED);
    await t.prisma.certification.create({
      data: { certificateNumber: t.unique('CERT'), enrollmentId: enA.id, holderName: user.name, formationTitle: formationA.title },
    });

    const res = await get(user);
    const titles = res.body.formationsTerminees.map((f) => f.formation.title);
    assert.ok(titles.includes('Formation A'));
    assert.ok(titles.includes('Formation B'));
    assert.equal(res.body.formationsTerminees.find((f) => f.formation.title === 'Formation A').certified, true);
    assert.equal(res.body.formationsTerminees.find((f) => f.formation.title === 'Formation B').certified, false);
    assert.equal(res.body.dimensions.formationsCompletion, 1);
  });
});

describe('next steps: only what really blocks the formation', () => {
  test('the required, unfinished courses of an active enrolment, nothing invented', async () => {
    const user = await t.user();
    const formation = await t.formation({ title: 'Diagnostic épargne', courses: [{ title: 'Leçon 1' }, { title: 'Leçon 2' }] });
    const enrollment = await enroll(t.prisma, user, formation, ENROLLMENT_STATUS.ACTIVE);
    await t.prisma.courseProgress.create({
      data: { enrollmentId: enrollment.id, courseId: formation.courses[0].id, formationId: formation.id, status: PROGRESS_STATUS.COMPLETED, completedAt: new Date() },
    });

    const res = await get(user);
    assert.equal(res.body.etapesSuivantes.length, 1);
    assert.deepEqual(res.body.etapesSuivantes[0].remaining, ['Leçon 2']);
  });

  test('a formation with nothing left to do is not listed as a next step', async () => {
    const user = await t.user();
    const formation = await t.formation({ title: 'Tout fait', courses: [{ title: 'Leçon unique' }] });
    const enrollment = await enroll(t.prisma, user, formation, ENROLLMENT_STATUS.ACTIVE);
    await t.prisma.courseProgress.create({
      data: { enrollmentId: enrollment.id, courseId: formation.courses[0].id, formationId: formation.id, status: PROGRESS_STATUS.COMPLETED, completedAt: new Date() },
    });
    assert.deepEqual((await get(user)).body.etapesSuivantes, []);
  });
});

describe('quizzes passed, cross-formation', () => {
  test('a passed attempt appears with its score; the average dimension reflects it', async () => {
    const user = await t.user();
    const formation = await t.formation({ title: 'Les dettes' });
    const enrollment = await enroll(t.prisma, user, formation, ENROLLMENT_STATUS.ACTIVE);
    const quiz = await t.prisma.quiz.create({ data: { formationId: formation.id, scope: 'formation', title: 'Quiz final', isComplete: true } });
    await t.prisma.quizAttempt.create({
      data: { quizId: quiz.id, formationId: formation.id, enrollmentId: enrollment.id, submittedAt: new Date(), score: 80, earnedPoints: 8, totalPoints: 10, passed: true },
    });

    const res = await get(user);
    assert.equal(res.body.quizReussis.length, 1);
    assert.equal(res.body.quizReussis[0].quizTitle, 'Quiz final');
    assert.equal(res.body.quizReussis[0].score, 80);
    assert.equal(res.body.dimensions.quizzesAverage, 0.8);
  });

  test('a failed attempt never counts as passed', async () => {
    const user = await t.user();
    const formation = await t.formation({ title: 'Les crédits' });
    const enrollment = await enroll(t.prisma, user, formation, ENROLLMENT_STATUS.ACTIVE);
    const quiz = await t.prisma.quiz.create({ data: { formationId: formation.id, scope: 'formation', title: 'Quiz', isComplete: true } });
    await t.prisma.quizAttempt.create({
      data: { quizId: quiz.id, formationId: formation.id, enrollmentId: enrollment.id, submittedAt: new Date(), score: 40, earnedPoints: 4, totalPoints: 10, passed: false },
    });
    const res = await get(user);
    assert.deepEqual(res.body.quizReussis, []);
    assert.equal(res.body.dimensions.quizzesAverage, null);
  });
});

describe('"Sécurité numérique": declared, never guessed', () => {
  test('no formation published at this slug: the dimension is declared unavailable, not zero', async () => {
    const user = await t.user();
    const res = await get(user);
    assert.deepEqual(res.body.dimensions.securityModule, { reason: 'noContentPublished' });
  });

  test('the formation exists but is still a draft: still unavailable', async () => {
    const user = await t.user();
    await t.prisma.formation.deleteMany({ where: { slug: SECURITY_MODULE_SLUG } });
    await t.prisma.formation.create({ data: { slug: SECURITY_MODULE_SLUG, title: 'Sécurité numérique', description: 'x', status: 'draft' } });
    const res = await get(user);
    assert.deepEqual(res.body.dimensions.securityModule, { reason: 'noContentPublished' });
  });

  test('published, not started yet: null, never zero', async () => {
    const user = await t.user();
    await t.prisma.formation.deleteMany({ where: { slug: SECURITY_MODULE_SLUG } });
    await t.prisma.formation.create({ data: { slug: SECURITY_MODULE_SLUG, title: 'Sécurité numérique', description: 'x', status: 'published', publishedAt: new Date() } });
    const res = await get(user);
    assert.equal(res.body.dimensions.securityModule, null);
  });

  test('published and completed: 1', async () => {
    const user = await t.user();
    await t.prisma.formation.deleteMany({ where: { slug: SECURITY_MODULE_SLUG } });
    const formation = await t.prisma.formation.create({ data: { slug: SECURITY_MODULE_SLUG, title: 'Sécurité numérique', description: 'x', status: 'published', publishedAt: new Date() } });
    await enroll(t.prisma, user, formation, ENROLLMENT_STATUS.COMPLETED);
    const res = await get(user);
    assert.equal(res.body.dimensions.securityModule, 1);
  });
});

describe('the passport\'s title follows the public, never the mechanics', () => {
  test('lycéen -> "avenir", étudiant -> "etudiant", anything else -> "generic"', async () => {
    const lyc = await t.user({ finPublic: 'LYC' });
    const etu = await t.user({ finPublic: 'ETU' });
    const other = await t.user({ finPublic: 'SAL' });
    const none = await t.user();
    assert.equal((await get(lyc)).body.titre, 'avenir');
    assert.equal((await get(etu)).body.titre, 'etudiant');
    assert.equal((await get(other)).body.titre, 'generic');
    assert.equal((await get(none)).body.titre, 'generic');
  });
});

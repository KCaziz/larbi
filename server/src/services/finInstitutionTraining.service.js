import { randomBytes } from 'node:crypto';
import { HttpError } from '../utils/httpError.js';
import { computed } from './finance/contract.js';
import { refreshQuizCompleteness } from './quiz.service.js';
import { spaceOf } from './finPartnerPortal.service.js';

/**
 * P13-05, lot I bis (2026-11-25): an institution's own training (ECR-0294,
 * PRT-007, PRT-020).
 *
 * - Its own courses: lessons and a final quiz, written in its space. They reuse
 *   the platform's course engine (progress, quiz, certificate), with an
 *   « attestation pédagogique » that claims no regulatory qualification. They
 *   are never in the public catalogue: only the institution's members (to check
 *   them) and the learners of its cohorts the course is assigned to can open one.
 * - Sessions: a cohort, a trainer, dates, a place, and who attended — marked by
 *   the institution, which invited these people.
 * - Follow-up: aggregates only, above the institution's anonymity threshold:
 *   attendance rate (E066), completion (E049) and the course score, average of
 *   the validated evaluations weighted by their points (E067).
 */

const ownInclude = {
  courses: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }], select: { id: true, title: true, position: true, estimatedMinutes: true } },
  quizzes: { where: { scope: 'formation' }, include: { _count: { select: { questions: true } } } },
};

const escapeHtml = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const paragraphs = (text) =>
  String(text)
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');

const slugOf = (title) =>
  `${String(title)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'formation'}-${randomBytes(3).toString('hex')}`;

async function ownFormation(prisma, user, spaceId, formationId) {
  await spaceOf(prisma, user, spaceId, 'institution');
  const formation = await prisma.formation.findFirst({ where: { id: formationId, ownerSpaceId: spaceId }, include: ownInclude });
  if (!formation) throw new HttpError(404, 'Course not found', { reason: 'formationNotFound' });
  return formation;
}

const formationView = (f) => ({
  id: f.id,
  slug: f.slug,
  title: f.title,
  description: f.description,
  status: f.status,
  lessons: f.courses,
  quiz: f.quizzes[0] ? { id: f.quizzes[0].id, questions: f.quizzes[0]._count.questions, passingScore: f.quizzes[0].passingScore, complete: f.quizzes[0].isComplete } : null,
});

/** Can this person open a course that belongs to an institution? */
export async function canOpenOwnedFormation(prisma, userId, formation) {
  if (!formation.ownerSpaceId) return true;
  const member = await prisma.finPartnerSpaceMember.findFirst({ where: { spaceId: formation.ownerSpaceId, userId }, select: { id: true } });
  if (member) return true;
  const learner = await prisma.finPartnerCohortMember.findFirst({
    where: { userId, status: 'active', cohort: { program: { spaceId: formation.ownerSpaceId }, formations: { some: { formationId: formation.id } } } },
    select: { id: true },
  });
  return Boolean(learner);
}

export async function listOwnFormations(prisma, user, spaceId) {
  await spaceOf(prisma, user, spaceId, 'institution');
  const formations = await prisma.formation.findMany({ where: { ownerSpaceId: spaceId }, include: ownInclude, orderBy: { createdAt: 'desc' } });
  return formations.map(formationView);
}

export async function createOwnFormation(prisma, user, spaceId, { title, description }) {
  const space = await spaceOf(prisma, user, spaceId, 'institution');
  const formation = await prisma.formation.create({
    data: {
      slug: slugOf(title),
      title,
      description,
      status: 'draft',
      ownerSpaceId: spaceId,
      createdById: user.id,
      certificationEnabled: true,
      certificationTitle: `Attestation pédagogique — ${title}`.slice(0, 150),
      // PRT-020: no regulatory qualification is implied.
      certificationDescription: `Attestation pédagogique délivrée par ${space.name} sur FINCLUDIA : elle atteste un parcours suivi et réussi, ni une habilitation professionnelle ni une habilitation réglementaire.`,
      subtitle: space.name,
    },
    include: ownInclude,
  });
  return formationView(formation);
}

export async function addOwnLesson(prisma, user, spaceId, formationId, { title, text, minutes }) {
  const formation = await ownFormation(prisma, user, spaceId, formationId);
  const html = paragraphs(text);
  if (!html) throw new HttpError(422, 'A lesson needs its text', { reason: 'textRequired' });
  const position = formation.courses.length ? Math.max(...formation.courses.map((c) => c.position)) + 1 : 1;
  await prisma.course.create({
    data: {
      formationId,
      title,
      position,
      isRequired: true,
      estimatedMinutes: minutes ?? 15,
      blocks: { create: { type: 'text', position: 1, data: { html } } },
    },
  });
  return formationView(await ownFormation(prisma, user, spaceId, formationId));
}

export async function removeOwnLesson(prisma, user, spaceId, formationId, courseId) {
  const formation = await ownFormation(prisma, user, spaceId, formationId);
  if (formation.status === 'published') throw new HttpError(409, 'A published course keeps its lessons', { reason: 'formationPublished' });
  const deleted = await prisma.course.deleteMany({ where: { id: courseId, formationId } });
  if (!deleted.count) throw new HttpError(404, 'Lesson not found', { reason: 'lessonNotFound' });
  return formationView(await ownFormation(prisma, user, spaceId, formationId));
}

/** The final quiz, written in one go: single-answer questions, each with its explanation. */
export async function setOwnQuiz(prisma, user, spaceId, formationId, { passingScore, questions }) {
  const formation = await ownFormation(prisma, user, spaceId, formationId);
  if (formation.status === 'published') throw new HttpError(409, 'A published course keeps its quiz', { reason: 'formationPublished' });
  for (const q of questions) {
    if (q.correct < 0 || q.correct >= q.choices.length) throw new HttpError(422, 'Each question needs its right answer', { reason: 'noCorrect' });
  }
  await prisma.$transaction(async (tx) => {
    await tx.quiz.deleteMany({ where: { formationId, scope: 'formation' } });
    const quiz = await tx.quiz.create({
      data: {
        formationId,
        scope: 'formation',
        finalFormationId: formationId,
        title: `Évaluation — ${formation.title}`.slice(0, 150),
        passingScore,
        shuffleQuestions: true,
        isRequired: true,
        showCorrection: true,
        questions: {
          create: questions.map((q, i) => ({
            type: 'single',
            position: i,
            prompt: q.prompt,
            explanation: q.explanation ?? '',
            critical: Boolean(q.critical),
            choices: { create: q.choices.map((text, j) => ({ text, position: j, isCorrect: j === q.correct })) },
          })),
        },
      },
    });
    await refreshQuizCompleteness(tx, quiz.id);
  });
  return formationView(await ownFormation(prisma, user, spaceId, formationId));
}

/** Publier: open to the learners of the cohorts it is assigned to. */
export async function publishOwnFormation(prisma, user, spaceId, formationId, publish) {
  const formation = await ownFormation(prisma, user, spaceId, formationId);
  if (publish && formation.courses.length === 0) throw new HttpError(422, 'A course needs at least one lesson', { reason: 'lessonRequired' });
  if (publish && formation.quizzes[0] && !formation.quizzes[0].isComplete) throw new HttpError(422, 'The quiz is not complete', { reason: 'quizIncomplete' });
  await prisma.formation.update({ where: { id: formationId }, data: publish ? { status: 'published', publishedAt: formation.publishedAt ?? new Date() } : { status: 'draft' } });
  return formationView(await ownFormation(prisma, user, spaceId, formationId));
}

// ---- sessions ---------------------------------------------------------------------------

async function sessionOf(prisma, user, spaceId, sessionId) {
  const space = await spaceOf(prisma, user, spaceId, 'institution');
  const session = await prisma.finInstitutionSession.findFirst({ where: { id: sessionId, spaceId }, include: { attendance: true, cohort: { include: { members: true } } } });
  if (!session) throw new HttpError(404, 'Session not found', { reason: 'sessionNotFound' });
  return { space, session };
}

async function sessionView(prisma, session, threshold) {
  const participants = session.cohort.members.filter((m) => m.status === 'active');
  const marked = session.attendance.filter((a) => participants.some((m) => m.id === a.memberId));
  const present = marked.filter((a) => a.present).length;
  const base = {
    id: session.id,
    title: session.title,
    trainerName: session.trainerName,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    location: session.location,
    status: session.status,
    cohort: { id: session.cohort.id, name: session.cohort.name },
    formationId: session.formationId,
    // The institution's own sheet: who it invited, and whether they came.
    feuille: participants.map((m) => ({ memberId: m.id, email: m.email, present: session.attendance.find((a) => a.memberId === m.id)?.present ?? null })),
    participants: participants.length,
    presence: computed('E066', marked.length ? present / marked.length : null, { inputs: { marques: marked.length, presents: present } }),
  };
  // Learning figures: aggregates, and only above the anonymity threshold.
  if (!session.formationId || participants.length < threshold) {
    return { ...base, masque: participants.length < threshold, seuil: threshold, completion: computed('E049', null, { inputs: { actifs: participants.length } }), score: computed('E067', null, { inputs: { actifs: participants.length } }) };
  }
  const userIds = participants.map((m) => m.userId).filter(Boolean);
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: { in: userIds }, formationId: session.formationId },
    include: { quizAttempts: { where: { submittedAt: { not: null }, passed: true }, select: { earnedPoints: true, totalPoints: true } } },
  });
  const completed = enrollments.filter((e) => e.completedAt).length;
  const attempts = enrollments.flatMap((e) => e.quizAttempts);
  const earned = attempts.reduce((s, a) => s + (a.earnedPoints ?? 0), 0);
  const total = attempts.reduce((s, a) => s + (a.totalPoints ?? 0), 0);
  return {
    ...base,
    masque: false,
    completion: computed('E049', enrollments.length ? completed / enrollments.length : null, { inputs: { demarres: enrollments.length, termines: completed } }),
    score: computed('E067', total ? earned / total : null, { inputs: { evaluations_validees: attempts.length } }),
  };
}

export async function listSessions(prisma, user, spaceId) {
  const space = await spaceOf(prisma, user, spaceId, 'institution');
  const sessions = await prisma.finInstitutionSession.findMany({ where: { spaceId }, include: { attendance: true, cohort: { include: { members: true } } }, orderBy: { startsAt: 'desc' } });
  const out = [];
  for (const s of sessions) out.push(await sessionView(prisma, s, space.anonymityThreshold));
  return out;
}

export async function createSession(prisma, user, spaceId, body) {
  await spaceOf(prisma, user, spaceId, 'institution');
  const cohort = await prisma.finPartnerCohort.findFirst({ where: { id: body.cohortId, program: { spaceId } } });
  if (!cohort) throw new HttpError(404, 'Cohort not found', { reason: 'cohortNotFound' });
  if (new Date(body.endsAt) < new Date(body.startsAt)) throw new HttpError(422, 'A session ends after it starts', { reason: 'datesOutOfOrder' });
  if (body.formationId) {
    const assigned = await prisma.finPartnerCohortFormation.findFirst({ where: { cohortId: cohort.id, formationId: body.formationId } });
    if (!assigned) throw new HttpError(422, 'Assign the course to the cohort first', { reason: 'formationNotAssigned' });
  }
  await prisma.finInstitutionSession.create({
    data: { spaceId, cohortId: cohort.id, formationId: body.formationId ?? null, title: body.title, trainerName: body.trainerName, startsAt: new Date(body.startsAt), endsAt: new Date(body.endsAt), location: body.location ?? null, createdById: user.id },
  });
  return listSessions(prisma, user, spaceId);
}

export async function updateSession(prisma, user, spaceId, sessionId, { status }) {
  await sessionOf(prisma, user, spaceId, sessionId);
  await prisma.finInstitutionSession.update({ where: { id: sessionId }, data: { status } });
  return listSessions(prisma, user, spaceId);
}

/** Présence: marked for a learner who accepted the cohort. */
export async function markAttendance(prisma, user, spaceId, sessionId, { memberId, present }) {
  const { session } = await sessionOf(prisma, user, spaceId, sessionId);
  const member = session.cohort.members.find((m) => m.id === memberId && m.status === 'active');
  if (!member) throw new HttpError(404, 'Participant not found', { reason: 'memberNotFound' });
  if (session.status === 'cancelled') throw new HttpError(409, 'This session was cancelled', { reason: 'sessionCancelled' });
  await prisma.finInstitutionAttendance.upsert({ where: { sessionId_memberId: { sessionId, memberId } }, update: { present, markedAt: new Date() }, create: { sessionId, memberId, present } });
  return listSessions(prisma, user, spaceId);
}

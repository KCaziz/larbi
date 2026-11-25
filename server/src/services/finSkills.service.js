import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { computed } from './finance/contract.js';
import { gradeAttempt, shuffled, toLearnerQuestion } from './quiz.service.js';
import { EXERCISE_TEMPLATES, drawVariant, withinTolerance } from '../constants/academyExercises.js';
import { reissueAfterCompetence, withEnrollmentLock } from './progress.service.js';

// P13-02 — FINCLUDIA Academy, the validation rules of the pedagogical referential
// (section 2, rule V10), the Skills Passport (section 3), the progression
// (section 22) and the statuses shown (section 23).
//
//   score de module = 0,50 × QCM + 0,30 × exercice + 0,20 × mission
//   module validé   : score ≥ 80, QCM ≥ 80, exercice ≥ 70, mission réalisée,
//                     aucune erreur critique.
//
// The QCM is graded by the server (quiz.service, best attempt). The exercise is
// graded on the five steps of the corrected answer given by the referential
// (diagnostic, méthode, résultat, interprétation, décision/contrôle): the person
// writes an answer, THEN reads the correction and ticks the steps their answer
// meets; each step is worth 20 points. The mission is declared done, with the
// reference of what was produced (proof of the referential, "sans données
// sensibles inutiles"). A module that depends on a rule that changes is to be
// refreshed one year after its validation (the referential's "expiration ciblée").
//
// Remediation: under 60 % at the QCM, the exercise is to be written again before
// a new attempt; between 60 and 79 %, the missed questions are listed with their
// explanation, and the next session asks other questions when the bank allows it.
//
// The integrative case of a path is graded on its own weighted grid (each
// criterion met, partly met or not), pass mark 75 %, no critical error. A path
// level is reached when every module of that level and below is acquired (or
// exempted by the entry test) with an average module score of 80 %; the whole
// path also needs its integrative case.
//
// The entry test of a path asks one question per module, drawn from its bank. At
// 85 % or more, the fundamental modules (N0–N1) answered right are exempted,
// except security, compliance and active regulation (rule "Exemption").

export const RULES = { qcm: 80, exercise: 70, mastery: 80, mastered: 90, reinforce: 60, case: 75, pretest: 85, weights: { qcm: 0.5, exercise: 0.3, mission: 0.2 } };
export const EXERCISE_STEPS = ['diagnostic', 'method', 'result', 'interpretation', 'decision'];
const REFRESH_MONTHS = 12;
const PRETEST_MAX = 30;
// Security (digital security, fraud), compliance and active regulation are never exempted;
// an emergency fund (« fonds de sécurité ») is budgeting, not security.
const NOT_EXEMPTABLE = /s[ée]curit[ée] (financi[èe]re )?num[ée]rique|security|fraude|conformit|r[ée]glement|fiscal|douane|de change/i;

// Pure: the consolidated score and the state of one module.
export function masteryOf({ qcmScore, exerciseScore, missionStatus, criticalErrors }) {
  const missionScore = missionStatus === 'done' ? 100 : 0;
  const mastery =
    qcmScore === null || qcmScore === undefined || exerciseScore === null || exerciseScore === undefined
      ? null
      : Math.round(RULES.weights.qcm * qcmScore + RULES.weights.exercise * exerciseScore + RULES.weights.mission * missionScore);
  const missing = [];
  if (qcmScore === null || qcmScore === undefined) missing.push('qcm');
  else if (qcmScore < RULES.qcm) missing.push('qcmBelow');
  if ((criticalErrors ?? 0) > 0) missing.push('critical');
  if (exerciseScore === null || exerciseScore === undefined) missing.push('exercise');
  else if (exerciseScore < RULES.exercise) missing.push('exerciseBelow');
  if (missionStatus !== 'done') missing.push('mission');
  if (mastery !== null && mastery < RULES.mastery) missing.push('masteryBelow');
  return { mastery, validated: missing.length === 0, missing };
}

// Pure: the status shown (section 23 of the referential).
//   discover · inProgress · reinforce · redo · blocked · acquired · mastered · refresh · exempt
export function statusOf(record, { caseValidated = false, now = new Date() } = {}) {
  if (!record) return 'discover';
  if (record.exempt && !record.validatedAt) return 'exempt';
  if (record.validatedAt) {
    if (record.refreshDue && record.refreshDue < now) return 'refresh';
    return (record.masteryScore ?? 0) >= RULES.mastered && record.missionStatus === 'done' && caseValidated ? 'mastered' : 'acquired';
  }
  if ((record.criticalErrors ?? 0) > 0) return 'blocked';
  if (record.qcmScore !== null && record.qcmScore !== undefined && record.qcmScore < RULES.reinforce) return 'redo';
  if ((record.qcmScore !== null && record.qcmScore !== undefined && record.qcmScore < RULES.qcm) || (record.exerciseScore !== null && record.exerciseScore !== undefined && record.exerciseScore < RULES.exercise)) return 'reinforce';
  return 'inProgress';
}
const ACQUIRED = new Set(['acquired', 'mastered', 'exempt']);

// "N2-N4" -> 2 ; "" -> 0.
export const levelStart = (level) => Number((/N(\d)/.exec(level ?? '') ?? [0, 0])[1]);

// Pure: the grid of an integrative case. `ratings`: one of 0 / 0.5 / 1 per criterion.
export function caseScore(criteria, ratings) {
  if (!Array.isArray(ratings) || ratings.length !== criteria.length) return null;
  return Math.round(criteria.reduce((sum, c, i) => sum + c.weight * (ratings[i] ?? 0), 0));
}

// The best QCM of a person on one quiz: the best attempt without a critical error,
// else the best attempt (its critical errors then block the module).
async function bestQcm(db, userId, quizId) {
  const attempts = await db.quizAttempt.findMany({
    where: { quizId, submittedAt: { not: null }, enrollment: { userId } },
    select: { score: true, criticalErrors: true },
  });
  if (!attempts.length) return { qcmScore: null, criticalErrors: 0, attempts: 0 };
  const clean = attempts.filter((a) => !a.criticalErrors);
  const pool = clean.length ? clean : attempts;
  const best = pool.reduce((a, b) => ((b.score ?? 0) > (a.score ?? 0) ? b : a));
  return { qcmScore: best.score ?? 0, criticalErrors: best.criticalErrors ?? 0, attempts: attempts.length };
}

// Recomputes (and creates when needed) the Skills Passport line of a module. Called
// after a QCM attempt, an exercise or a mission. Nothing happens for a quiz that is
// not an Academy module.
export async function refreshSkillRecord(db, userId, { quizId = null, moduleId = null, patch = {} } = {}) {
  const module = await db.finAcademyModule.findFirst({ where: quizId ? { quizId } : { id: moduleId } });
  if (!module) return null;
  const current = await db.finSkillRecord.findUnique({ where: { userId_moduleId: { userId, moduleId: module.id } } });
  const qcm = await bestQcm(db, userId, module.quizId);
  const next = { ...(current ?? { exerciseScore: null, missionStatus: 'todo' }), ...patch, qcmScore: qcm.qcmScore, criticalErrors: qcm.criticalErrors };
  const { mastery, validated } = masteryOf(next);
  const now = new Date();
  const validatedAt = validated ? (current?.validatedAt ?? now) : null;
  const refreshDue = validated && module.regulatory ? new Date(Date.UTC(validatedAt.getUTCFullYear(), validatedAt.getUTCMonth() + REFRESH_MONTHS, validatedAt.getUTCDate())) : null;
  const data = { ...patch, qcmScore: qcm.qcmScore, criticalErrors: qcm.criticalErrors, masteryScore: mastery, validatedAt, refreshDue, contentVersion: module.contentVersion };
  return db.finSkillRecord.upsert({
    where: { userId_moduleId: { userId, moduleId: module.id } },
    update: data,
    create: { userId, moduleId: module.id, ...data },
  });
}

// A change of a competence, under the enrolment lock: the record is recomputed,
// then the path's certificate is delivered if it is now due (section 22, step 7).
async function competenceChange(userId, formationId, work) {
  const enrollment = await prisma.enrollment.findUnique({ where: { userId_formationId: { userId, formationId } }, select: { id: true } });
  if (!enrollment) return prisma.$transaction(work);
  return withEnrollmentLock(enrollment.id, async (tx) => {
    const out = await work(tx);
    await reissueAfterCompetence(tx, userId, formationId);
    return out;
  });
}

// The exercise score: the better of the grid (self-assessment on the corrected
// answer) and of the numbered exercise checked by the server.
const bestExercise = (grid, auto) => (grid === null && auto === null ? null : Math.max(grid ?? 0, auto ?? 0));

/** The numbered exercise as the person sees it: the wording, and after an answer, the correction. */
function variantView(module, record) {
  const template = EXERCISE_TEMPLATES[module.code];
  if (!template) return null;
  const v = record?.exerciseVariant;
  if (!v) return { available: true, text: null, unit: template.unit };
  const out = { available: true, text: template.text(v.values), unit: template.unit, answered: Boolean(v.answeredAt), attempts: v.attempts ?? 1, bestScore: record?.autoScore ?? null };
  if (v.answeredAt) {
    out.given = v.given;
    out.correct = v.correct;
    out.expected = Math.round(template.answer(v.values) * 100) / 100;
    out.working = template.working(v.values, template.answer(v.values));
  }
  return out;
}

/** Nouvel énoncé: new amounts for the same competence (section 21). */
export async function newExerciseVariant(userId, courseId) {
  const module = await prisma.finAcademyModule.findUnique({ where: { courseId } });
  const template = module && EXERCISE_TEMPLATES[module.code];
  if (!template) throw new HttpError(404, 'Not found');
  const record = await prisma.finSkillRecord.findUnique({ where: { userId_moduleId: { userId, moduleId: module.id } } });
  const previous = record?.exerciseVariant;
  // An unanswered wording stays: drawing again until an easy one comes is not practice.
  if (previous && !previous.answeredAt) return competenceForCourse(userId, courseId);
  const variant = { values: drawVariant(template), drawnAt: new Date().toISOString(), attempts: (previous?.attempts ?? 0) + 1 };
  await competenceChange(userId, module.formationId, (tx) => refreshSkillRecord(tx, userId, { moduleId: module.id, patch: { exerciseVariant: variant } }));
  return competenceForCourse(userId, courseId);
}

/** The answer to the numbered exercise, checked once with the tolerance. */
export async function answerExerciseVariant(userId, courseId, { answer }) {
  const module = await prisma.finAcademyModule.findUnique({ where: { courseId } });
  const template = module && EXERCISE_TEMPLATES[module.code];
  if (!template) throw new HttpError(404, 'Not found');
  const record = await prisma.finSkillRecord.findUnique({ where: { userId_moduleId: { userId, moduleId: module.id } } });
  const variant = record?.exerciseVariant;
  if (!variant) throw new HttpError(409, 'Ask for a wording first', { reason: 'noVariant' });
  if (variant.answeredAt) throw new HttpError(409, 'This wording was already answered', { reason: 'already_submitted' });
  const given = Number(String(answer).replace(/\s/g, '').replace(',', '.'));
  const correct = withinTolerance(template.answer(variant.values), given, template.unit);
  const autoScore = Math.max(record.autoScore ?? 0, correct ? 100 : 0);
  const patch = {
    exerciseVariant: { ...variant, answeredAt: new Date().toISOString(), given: Number.isFinite(given) ? given : null, correct },
    autoScore,
    exerciseScore: bestExercise(record.gridScore ?? null, autoScore),
    // A numbered exercise answered counts as the exercise written (rule « Rattrapage »).
    exerciseSavedAt: new Date(),
  };
  await competenceChange(userId, module.formationId, (tx) => refreshSkillRecord(tx, userId, { moduleId: module.id, patch }));
  return competenceForCourse(userId, courseId);
}

// Rule "Rattrapage": under 60 %, a new QCM attempt needs the exercise written
// again after the failed attempt (guided re-reading + mandatory exercise).
export async function assertCanRetry(db, userId, quizId) {
  const module = await db.finAcademyModule.findUnique({ where: { quizId }, select: { id: true, exercise: true } });
  if (!module || !module.exercise.trim()) return;
  const last = await db.quizAttempt.findFirst({ where: { quizId, submittedAt: { not: null }, enrollment: { userId } }, orderBy: { submittedAt: 'desc' }, select: { score: true, submittedAt: true } });
  if (!last || (last.score ?? 0) >= RULES.reinforce) return;
  const record = await db.finSkillRecord.findUnique({ where: { userId_moduleId: { userId, moduleId: module.id } }, select: { exerciseSavedAt: true } });
  if (!record?.exerciseSavedAt || record.exerciseSavedAt < last.submittedAt) throw new HttpError(409, 'Write the exercise again before a new attempt', { reason: 'exercise_required' });
}

// The questions missed at the last attempt, with their explanation (remediation).
async function remediationOf(userId, module) {
  const last = await prisma.quizAttempt.findFirst({
    where: { quizId: module.quizId, submittedAt: { not: null }, enrollment: { userId } },
    orderBy: { submittedAt: 'desc' },
    include: { answers: { where: { correct: false }, select: { questionId: true } } },
  });
  if (!last || (last.score ?? 0) >= RULES.qcm) return null;
  const questions = await prisma.quizQuestion.findMany({ where: { id: { in: last.answers.map((a) => a.questionId) } }, select: { prompt: true, explanation: true, critical: true } });
  return {
    kind: (last.score ?? 0) < RULES.reinforce ? 'redo' : 'reinforce',
    score: last.score,
    missed: questions.map((q) => ({ prompt: q.prompt, explanation: q.explanation, critical: q.critical })),
  };
}

async function caseValidatedFor(userId, formationId) {
  const record = await prisma.finCaseRecord.findFirst({ where: { userId, academyCase: { formationId }, validatedAt: { not: null } }, select: { id: true } });
  return Boolean(record);
}

function toLine(module, record, { caseValidated = false, now = new Date() } = {}) {
  const view = masteryOf({
    qcmScore: record?.qcmScore ?? null,
    exerciseScore: record?.exerciseScore ?? null,
    missionStatus: record?.missionStatus ?? 'todo',
    criticalErrors: record?.criticalErrors ?? 0,
  });
  return {
    moduleId: module.id,
    code: module.code,
    title: module.title,
    level: module.level,
    evidenceType: module.evidenceType,
    regulatory: module.regulatory,
    contentVersion: record?.contentVersion ?? module.contentVersion,
    qcmScore: record?.qcmScore ?? null,
    criticalErrors: record?.criticalErrors ?? 0,
    exerciseScore: record?.exerciseScore ?? null,
    missionStatus: record?.missionStatus ?? 'todo',
    evidenceRef: record?.evidenceRef ?? '',
    exempt: Boolean(record?.exempt),
    mastery: computed('E058', view.mastery === null ? null : view.mastery / 100, {
      inputs: { qcm: record?.qcmScore ?? null, exercice: record?.exerciseScore ?? null, mission: (record?.missionStatus ?? 'todo') === 'done' ? 100 : 0 },
      now,
    }),
    missing: view.missing,
    state: statusOf(record, { caseValidated, now }),
    validatedAt: record?.validatedAt ?? null,
    refreshDue: record?.refreshDue ?? null,
  };
}

function toCaseView(academyCase, record) {
  const answered = Boolean(record?.answer?.trim());
  return {
    caseId: academyCase.id,
    title: academyCase.title,
    scenario: academyCase.scenario,
    tasks: academyCase.tasks,
    criteria: academyCase.criteria,
    correction: answered ? academyCase.correction : null,
    answer: record?.answer ?? '',
    ratings: record?.ratings ?? null,
    criticalError: Boolean(record?.criticalError),
    score: record?.score ?? null,
    validatedAt: record?.validatedAt ?? null,
    passMark: RULES.case,
  };
}

// What a lesson of the Academy asks: a module (QCM, exercise, mission), or the
// integrative case of the path. The correction appears only once an answer was
// written (the referential corrects AFTER the attempt).
export async function competenceForCourse(userId, courseId) {
  const [module, academyCase] = await Promise.all([prisma.finAcademyModule.findUnique({ where: { courseId } }), prisma.finAcademyCase.findUnique({ where: { courseId } })]);
  let moduleView = null;
  if (module) {
    const record = await prisma.finSkillRecord.findUnique({ where: { userId_moduleId: { userId, moduleId: module.id } } });
    const answered = Boolean(record?.exerciseAnswer?.trim());
    moduleView = {
      ...toLine(module, record, { caseValidated: await caseValidatedFor(userId, module.formationId) }),
      quizId: module.quizId,
      exercise: module.exercise,
      correction: answered ? module.correction : null,
      exerciseAnswer: record?.exerciseAnswer ?? '',
      exerciseSteps: record?.exerciseSteps ?? [],
      gridScore: record?.gridScore ?? null,
      variant: variantView(module, record),
      mission: module.mission,
      challenge: module.challenge,
      tool: module.tool,
      proof: module.proof,
      remediation: await remediationOf(userId, module),
      rules: RULES,
    };
  }
  let caseView = null;
  if (academyCase) {
    const record = await prisma.finCaseRecord.findUnique({ where: { userId_caseId: { userId, caseId: academyCase.id } } });
    caseView = toCaseView(academyCase, record);
  }
  return { module: moduleView, case: caseView };
}

export async function saveExercise(userId, courseId, { answer, steps }) {
  const module = await prisma.finAcademyModule.findUnique({ where: { courseId } });
  if (!module) throw new HttpError(404, 'Not found');
  const record = await prisma.finSkillRecord.findUnique({ where: { userId_moduleId: { userId, moduleId: module.id } } });
  const text = (answer ?? record?.exerciseAnswer ?? '').trim();
  const patch = { exerciseAnswer: text };
  if (answer !== undefined && text) patch.exerciseSavedAt = new Date();
  // The steps are ticked after reading the correction, so an answer must exist first.
  if (steps !== undefined && text) {
    const kept = [...new Set(steps)].filter((i) => i >= 0 && i < EXERCISE_STEPS.length).sort();
    patch.exerciseSteps = kept;
    patch.gridScore = kept.length * (100 / EXERCISE_STEPS.length);
  }
  if (!text) {
    patch.exerciseSteps = [];
    patch.gridScore = null;
  }
  patch.exerciseScore = bestExercise(patch.gridScore !== undefined ? patch.gridScore : (record?.gridScore ?? null), record?.autoScore ?? null);
  await competenceChange(userId, module.formationId, (tx) => refreshSkillRecord(tx, userId, { moduleId: module.id, patch }));
  return competenceForCourse(userId, courseId);
}

export async function saveMission(userId, courseId, { done, evidenceRef }) {
  const module = await prisma.finAcademyModule.findUnique({ where: { courseId } });
  if (!module) throw new HttpError(404, 'Not found');
  const patch = {};
  if (done !== undefined) patch.missionStatus = done ? 'done' : 'todo';
  if (evidenceRef !== undefined) patch.evidenceRef = evidenceRef.trim();
  await competenceChange(userId, module.formationId, (tx) => refreshSkillRecord(tx, userId, { moduleId: module.id, patch }));
  return competenceForCourse(userId, courseId);
}

// The integrative case: the answer first, then the grid once the correction is read.
export async function saveCase(userId, courseId, { answer, ratings, criticalError }) {
  const academyCase = await prisma.finAcademyCase.findUnique({ where: { courseId } });
  if (!academyCase) throw new HttpError(404, 'Not found');
  const current = await prisma.finCaseRecord.findUnique({ where: { userId_caseId: { userId, caseId: academyCase.id } } });
  const text = (answer ?? current?.answer ?? '').trim();
  const data = { answer: text };
  if (criticalError !== undefined) data.criticalError = criticalError;
  if (ratings !== undefined) {
    if (!text) throw new HttpError(409, 'Write the answer before grading it', { reason: 'answer_required' });
    const score = caseScore(academyCase.criteria, ratings);
    if (score === null) throw new HttpError(400, 'One rating per criterion');
    data.ratings = ratings;
    data.score = score;
  }
  const score = data.score ?? current?.score ?? null;
  const critical = data.criticalError ?? current?.criticalError ?? false;
  const passed = Boolean(text) && score !== null && score >= RULES.case && !critical;
  data.validatedAt = passed ? (current?.validatedAt ?? new Date()) : null;
  if (!text) Object.assign(data, { ratings: null, score: null, validatedAt: null });
  await competenceChange(userId, academyCase.formationId, (tx) =>
    tx.finCaseRecord.upsert({
      where: { userId_caseId: { userId, caseId: academyCase.id } },
      update: data,
      create: { userId, caseId: academyCase.id, ...data },
    }),
  );
  return competenceForCourse(userId, courseId);
}

// ---- the path (one Academy course) ------------------------------------------------------
async function pathOf(userId, formationId, now = new Date()) {
  const modules = await prisma.finAcademyModule.findMany({ where: { formationId }, orderBy: { code: 'asc' } });
  if (!modules.length) return null;
  const [records, academyCase, pretest] = await Promise.all([
    prisma.finSkillRecord.findMany({ where: { userId, moduleId: { in: modules.map((m) => m.id) } } }),
    prisma.finAcademyCase.findUnique({ where: { formationId }, include: { records: { where: { userId } } } }),
    prisma.finPretest.findFirst({ where: { userId, formationId }, orderBy: { startedAt: 'desc' } }),
  ]);
  const caseRecord = academyCase?.records[0] ?? null;
  const caseValidated = Boolean(caseRecord?.validatedAt);
  const byModule = new Map(records.map((r) => [r.moduleId, r]));
  const lines = modules.map((m) => ({ ...toLine(m, byModule.get(m.id), { caseValidated, now }), courseId: m.courseId, start: levelStart(m.level) }));
  // Levels: each module counts from the first level of its range ("N2-N4" -> N2).
  const starts = [...new Set(lines.map((l) => l.start))].sort((a, b) => a - b);
  let reached = null;
  for (const n of starts) {
    const upTo = lines.filter((l) => l.start <= n);
    const scored = upTo.filter((l) => l.state !== 'exempt');
    const average = scored.length ? scored.reduce((s, l) => s + (l.mastery.resultat ?? 0), 0) / scored.length : 1;
    if (upTo.every((l) => ACQUIRED.has(l.state)) && average >= RULES.mastery / 100) reached = n;
    else break;
  }
  const acquired = lines.filter((l) => ACQUIRED.has(l.state)).length;
  const scored = lines.filter((l) => l.mastery.resultat !== null);
  const average = scored.length ? scored.reduce((s, l) => s + l.mastery.resultat, 0) / scored.length : null;
  const allAcquired = acquired === lines.length;
  return {
    formationId,
    modules: lines,
    acquired,
    total: lines.length,
    average: computed('E059', average, { inputs: { modules_notes: scored.length }, now }),
    levels: starts.map((n) => `N${n}`),
    reached: reached === null ? null : `N${reached}`,
    next: starts.find((n) => reached === null || n > reached) ?? null,
    case: academyCase ? { courseId: academyCase.courseId, title: academyCase.title, score: caseRecord?.score ?? null, validated: caseValidated } : null,
    validated: allAcquired && (average === null || average >= RULES.mastery / 100) && (!academyCase || caseValidated),
    pretest: pretest ? { id: pretest.id, submitted: Boolean(pretest.submittedAt), score: pretest.score, exempted: pretest.exempted ?? [] } : null,
    rules: RULES,
  };
}

export async function pathProgress(userId, formationId) {
  const path = await pathOf(userId, formationId);
  if (path?.next !== undefined && path.next !== null) path.next = `N${path.next}`;
  return path;
}

// ---- entry test --------------------------------------------------------------------------
const choicesOf = (q) => ({ ...q, choices: shuffled(q.choices) });

export async function startPretest(userId, formationId) {
  const done = await prisma.finPretest.findFirst({ where: { userId, formationId, submittedAt: { not: null } }, select: { id: true } });
  if (done) throw new HttpError(409, 'The entry test of this path was already taken', { reason: 'pretest_done' });
  const modules = await prisma.finAcademyModule.findMany({ where: { formationId }, include: { quiz: { include: { questions: { include: { choices: { orderBy: { position: 'asc' } } } } } } } });
  if (!modules.length) throw new HttpError(404, 'Not found');
  let pretest = await prisma.finPretest.findFirst({ where: { userId, formationId, submittedAt: null }, orderBy: { startedAt: 'desc' } });
  if (!pretest) {
    const picks = shuffled(modules)
      .slice(0, PRETEST_MAX)
      .map((m) => ({ moduleId: m.id, questionId: shuffled(m.quiz.questions)[0]?.id }))
      .filter((p) => p.questionId);
    pretest = await prisma.finPretest.create({ data: { userId, formationId, questions: picks } });
  }
  const byId = new Map(modules.flatMap((m) => m.quiz.questions).map((q) => [q.id, q]));
  return {
    id: pretest.id,
    passMark: RULES.pretest,
    questions: pretest.questions.map((p) => byId.get(p.questionId)).filter(Boolean).map((q) => toLearnerQuestion(choicesOf(q))),
  };
}

export async function submitPretest(userId, formationId, pretestId, answers) {
  return prisma.$transaction(async (tx) => {
    const pretest = await tx.finPretest.findFirst({ where: { id: pretestId, userId, formationId } });
    if (!pretest) throw new HttpError(404, 'Not found');
    if (pretest.submittedAt) throw new HttpError(409, 'Already submitted', { reason: 'already_submitted' });
    const ids = pretest.questions.map((p) => p.questionId);
    const questions = await tx.quizQuestion.findMany({ where: { id: { in: ids } }, include: { choices: true } });
    const ordered = ids.map((id) => questions.find((q) => q.id === id)).filter(Boolean);
    const given = new Map(answers.map((a) => [a.questionId, a]));
    const graded = gradeAttempt(
      ordered,
      ordered.map((q) => {
        const own = new Set(q.choices.map((c) => c.id));
        return { questionId: q.id, choiceIds: [...new Set(given.get(q.id)?.choiceIds ?? [])].filter((id) => own.has(id)) };
      }),
      RULES.pretest,
    );
    const right = new Set(graded.results.filter((r) => r.correct).map((r) => r.question.id));
    const exempted = [];
    // The score alone decides (critical questions do not block an entry test; they
    // are the reason security / compliance modules are never exempted).
    if (graded.score >= RULES.pretest) {
      const modules = await tx.finAcademyModule.findMany({ where: { id: { in: pretest.questions.map((p) => p.moduleId) } } });
      for (const p of pretest.questions) {
        const m = modules.find((x) => x.id === p.moduleId);
        if (!m || !right.has(p.questionId) || levelStart(m.level) > 1 || m.regulatory || NOT_EXEMPTABLE.test(`${m.title} ${m.tool}`)) continue;
        await tx.finSkillRecord.upsert({
          where: { userId_moduleId: { userId, moduleId: m.id } },
          update: { exempt: true },
          create: { userId, moduleId: m.id, exempt: true, contentVersion: m.contentVersion },
        });
        exempted.push(m.id);
      }
    }
    await tx.finPretest.update({ where: { id: pretest.id }, data: { submittedAt: new Date(), score: graded.score, exempted } });
    return {
      score: graded.score,
      passMark: RULES.pretest,
      exempted: exempted.length,
      corrections: graded.results.map((r) => ({
        questionId: r.question.id,
        prompt: r.question.prompt,
        correct: r.correct,
        explanation: r.question.explanation,
        correctChoiceIds: r.question.choices.filter((c) => c.isCorrect).map((c) => c.id),
      })),
    };
  });
}

// ---- the Skills Passport ------------------------------------------------------------------
export async function skillsPassport(userId, now = new Date()) {
  const records = await prisma.finSkillRecord.findMany({
    where: { userId },
    include: { module: { include: { formation: { select: { id: true, slug: true, title: true } } } } },
    orderBy: { updatedAt: 'desc' },
  });
  const validatedCases = new Set(
    (await prisma.finCaseRecord.findMany({ where: { userId, validatedAt: { not: null } }, select: { academyCase: { select: { formationId: true } } } })).map((r) => r.academyCase.formationId),
  );
  const lines = records.map((r) => ({ ...toLine(r.module, r, { caseValidated: validatedCases.has(r.module.formationId), now }), courseId: r.module.courseId, formation: r.module.formation }));
  const formationIds = [...new Set(records.map((r) => r.module.formationId))];
  const paths = [];
  for (const id of formationIds) {
    const path = await pathProgress(userId, id);
    const formation = records.find((r) => r.module.formationId === id).module.formation;
    paths.push({ formation, acquired: path.acquired, total: path.total, reached: path.reached, next: path.next, validated: path.validated, case: path.case, average: path.average });
  }
  const totals = {};
  for (const l of lines) totals[l.state] = (totals[l.state] ?? 0) + 1;
  return { lines, paths, totals, rules: RULES };
}

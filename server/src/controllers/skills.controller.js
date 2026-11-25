import { HttpError } from '../utils/httpError.js';
import { answerExerciseVariant, competenceForCourse, newExerciseVariant, pathProgress, saveCase, saveExercise, saveMission, skillsPassport, startPretest, submitPretest } from '../services/finSkills.service.js';
import { assertCanRead, loadForUser } from './learn.controller.js';

// P13-02: FINCLUDIA Academy for the person enrolled in it (same access rule as
// reading a lesson): a module's validation, the integrative case, the entry
// test and the progression of the path, the Skills Passport.
async function access(req, { course = true } = {}) {
  const { formation, enrollment } = await loadForUser(req.params.slug, req.user);
  assertCanRead(req.user, formation, enrollment);
  if (course && !formation.courses.some((c) => c.id === req.params.courseId)) throw new HttpError(404, 'Not found');
  return formation;
}

// A lesson that is not part of the Academy answers `module: null, case: null`.
export async function getModuleCompetence(req, res) {
  await access(req);
  res.json(await competenceForCourse(req.user.id, req.params.courseId));
}

export async function putModuleExercise(req, res) {
  await access(req);
  res.json(await saveExercise(req.user.id, req.params.courseId, req.body));
}

export async function putModuleMission(req, res) {
  await access(req);
  res.json(await saveMission(req.user.id, req.params.courseId, req.body));
}

export async function postVariant(req, res) {
  await access(req);
  res.json(await newExerciseVariant(req.user.id, req.params.courseId));
}

export async function postVariantAnswer(req, res) {
  await access(req);
  res.json(await answerExerciseVariant(req.user.id, req.params.courseId, req.body));
}

export async function putModuleCase(req, res) {
  await access(req);
  res.json(await saveCase(req.user.id, req.params.courseId, req.body));
}

// A formation that is not an Academy path answers `path: null`.
export async function getPath(req, res) {
  const formation = await access(req, { course: false });
  res.json({ path: await pathProgress(req.user.id, formation.id) });
}

export async function postPretest(req, res) {
  const formation = await access(req, { course: false });
  res.status(201).json({ pretest: await startPretest(req.user.id, formation.id) });
}

export async function postPretestSubmit(req, res) {
  const formation = await access(req, { course: false });
  const result = await submitPretest(req.user.id, formation.id, req.params.pretestId, req.body.answers);
  res.json({ result, path: await pathProgress(req.user.id, formation.id) });
}

export async function getSkillsPassport(req, res) {
  res.json(await skillsPassport(req.user.id));
}

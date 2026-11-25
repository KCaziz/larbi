import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { mediaDeniedLimiter, mediaVolumeLimiter } from '../middleware/rateLimit.js';
import { getLastResult, getQuiz, startAttempt, submitAttempt } from '../controllers/quiz.controller.js';
import { quizLimiter } from '../middleware/rateLimit.js';
import { validateBody } from '../middleware/validate.js';
import { submitAttemptSchema } from '../validation/quiz.schemas.js';
import { skillCaseSchema, skillExerciseSchema, skillMissionSchema, skillVariantAnswerSchema } from '../validation/skills.schemas.js';
import { getModuleCompetence, getPath, getSkillsPassport, postPretest, postPretestSubmit, postVariant, postVariantAnswer, putModuleCase, putModuleExercise, putModuleMission } from '../controllers/skills.controller.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { HttpError } from '../utils/httpError.js';
import {
  claimMyCertificate,
  completeLesson,
  enroll,
  getCourse,
  getCover,
  getFormation,
  getFormationCertificate,
  getMedia,
  listCatalog,
  listMyCertificates,
  myEnrollments,
  reopenLesson,
} from '../controllers/learn.controller.js';

// Learner API: catalogue, enrolment, lesson content. All routes need a session.
const router = Router();
router.use(requireAuth);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
router.param('slug', (req, res, next, value) =>
  value.length <= 80 && SLUG.test(value) ? next() : next(new HttpError(404, 'Not found')),
);
router.param('courseId', uuidParam);
router.param('id', uuidParam);
router.param('quizId', uuidParam);
router.param('attemptId', uuidParam);
router.param('pretestId', uuidParam);

router.get('/formations', asyncRoute(listCatalog));
router.get('/enrollments', asyncRoute(myEnrollments));
router.get('/formations/:slug', asyncRoute(getFormation));
router.post('/formations/:slug/enroll', asyncRoute(enroll));
router.get('/formations/:slug/cover', mediaVolumeLimiter, asyncRoute(getCover));
router.get('/formations/:slug/courses/:courseId', asyncRoute(getCourse));
router.put('/formations/:slug/courses/:courseId/completion', asyncRoute(completeLesson));
router.delete('/formations/:slug/courses/:courseId/completion', asyncRoute(reopenLesson));
router.get('/certificates', asyncRoute(listMyCertificates));
router.get('/formations/:slug/certificate', asyncRoute(getFormationCertificate));
router.post('/formations/:slug/certificate', asyncRoute(claimMyCertificate));
// Quizzes (P3-13): limited per account (starting and submitting are the only expensive calls).
router.get('/formations/:slug/quizzes/:quizId', asyncRoute(getQuiz));
router.post('/formations/:slug/quizzes/:quizId/attempts', quizLimiter, asyncRoute(startAttempt));
router.post('/formations/:slug/quizzes/:quizId/attempts/:attemptId/submit', quizLimiter, validateBody(submitAttemptSchema), asyncRoute(submitAttempt));
router.get('/formations/:slug/quizzes/:quizId/result', asyncRoute(getLastResult));
// P13-02: FINCLUDIA Academy, the module's own validation and the Skills Passport.
router.get('/passeport-competences', asyncRoute(getSkillsPassport));
router.get('/formations/:slug/courses/:courseId/competence', asyncRoute(getModuleCompetence));
router.put('/formations/:slug/courses/:courseId/competence/exercice', validateBody(skillExerciseSchema), asyncRoute(putModuleExercise));
router.put('/formations/:slug/courses/:courseId/competence/mission', validateBody(skillMissionSchema), asyncRoute(putModuleMission));
router.post('/formations/:slug/courses/:courseId/competence/exercice-chiffre', quizLimiter, asyncRoute(postVariant));
router.post('/formations/:slug/courses/:courseId/competence/exercice-chiffre/reponse', quizLimiter, validateBody(skillVariantAnswerSchema), asyncRoute(postVariantAnswer));
router.put('/formations/:slug/courses/:courseId/competence/cas', validateBody(skillCaseSchema), asyncRoute(putModuleCase));
router.get('/formations/:slug/parcours', asyncRoute(getPath));
router.post('/formations/:slug/pretest', quizLimiter, asyncRoute(postPretest));
router.post('/formations/:slug/pretest/:pretestId/submit', quizLimiter, validateBody(submitAttemptSchema), asyncRoute(postPretestSubmit));
router.get('/media/:id', mediaDeniedLimiter, mediaVolumeLimiter, asyncRoute(getMedia));

export default router;

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { HttpError } from '../utils/httpError.js';
import {
  completeLesson,
  enroll,
  getCourse,
  getCover,
  getFormation,
  getMedia,
  listCatalog,
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

router.get('/formations', asyncRoute(listCatalog));
router.get('/enrollments', asyncRoute(myEnrollments));
router.get('/formations/:slug', asyncRoute(getFormation));
router.post('/formations/:slug/enroll', asyncRoute(enroll));
router.get('/formations/:slug/cover', asyncRoute(getCover));
router.get('/formations/:slug/courses/:courseId', asyncRoute(getCourse));
router.put('/formations/:slug/courses/:courseId/completion', asyncRoute(completeLesson));
router.delete('/formations/:slug/courses/:courseId/completion', asyncRoute(reopenLesson));
router.get('/media/:id', asyncRoute(getMedia));

export default router;

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { receiveFile } from '../middleware/upload.js';
import { validateBody } from '../middleware/validate.js';
import { ROLES } from '../constants/roles.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import {
  createCategory,
  createFormation,
  deleteFormation,
  getFormation,
  listCategories,
  listFormations,
  publishFormation,
  unpublishFormation,
  updateFormation,
} from '../controllers/admin/formations.controller.js';
import { createCourse, deleteCourse, reorderCourses, updateCourse } from '../controllers/admin/courses.controller.js';
import { deleteMedia, serveMedia, uploadCourseMedia, uploadCover } from '../controllers/admin/media.controller.js';
import {
  createCategorySchema,
  createCourseSchema,
  createFormationSchema,
  reorderCoursesSchema,
  updateCourseSchema,
  updateFormationSchema,
} from '../validation/cms.schemas.js';

// CMS administration API. EVERY route below requires an authenticated admin,
// checked here on the server (the React admin area is only a convenience).
// The CMS base is shared: articles (P3-02) add their routes to this router.
const router = Router();
router.use(requireAuth, requireRole(ROLES.ADMIN));
router.param('id', uuidParam);

// Formations
router.get('/formations', asyncRoute(listFormations));
router.post('/formations', validateBody(createFormationSchema), asyncRoute(createFormation));
router.get('/formations/:id', asyncRoute(getFormation));
router.patch('/formations/:id', validateBody(updateFormationSchema), asyncRoute(updateFormation));
router.delete('/formations/:id', asyncRoute(deleteFormation));
router.post('/formations/:id/publish', asyncRoute(publishFormation));
router.post('/formations/:id/unpublish', asyncRoute(unpublishFormation));
router.post('/formations/:id/cover', receiveFile, asyncRoute(uploadCover));

// Courses of a formation
router.post('/formations/:id/courses', validateBody(createCourseSchema), asyncRoute(createCourse));
router.put('/formations/:id/courses/order', validateBody(reorderCoursesSchema), asyncRoute(reorderCourses));
router.patch('/courses/:id', validateBody(updateCourseSchema), asyncRoute(updateCourse));
router.delete('/courses/:id', asyncRoute(deleteCourse));
router.post('/courses/:id/media', receiveFile, asyncRoute(uploadCourseMedia));

// Media
router.get('/media/:id/file', asyncRoute(serveMedia));
router.delete('/media/:id', asyncRoute(deleteMedia));

// Categories
router.get('/categories', asyncRoute(listCategories));
router.post('/categories', validateBody(createCategorySchema), asyncRoute(createCategory));

export default router;

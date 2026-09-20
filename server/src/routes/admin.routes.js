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
import {
  createArticle,
  createArticleCategory,
  deleteArticle,
  getArticle,
  listArticleCategories,
  listArticles,
  listTags,
  publishArticle,
  unpublishArticle,
  updateArticle,
} from '../controllers/admin/articles.controller.js';
import {
  deleteSubscriber,
  exportSubscribers,
  listSubscribers,
  previewDigest,
} from '../controllers/admin/newsletter.controller.js';
import { validateQuery } from '../middleware/validate.js';
import { digestQuerySchema, subscribersQuerySchema } from '../validation/newsletter.schemas.js';
import {
  deleteMedia,
  serveMedia,
  uploadArticleCover,
  uploadArticleMedia,
  uploadCourseMedia,
  uploadCover,
} from '../controllers/admin/media.controller.js';
import { createArticleSchema, updateArticleSchema } from '../validation/blog.schemas.js';
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

// Blog articles (P3-02)
router.get('/articles', asyncRoute(listArticles));
router.post('/articles', validateBody(createArticleSchema), asyncRoute(createArticle));
router.get('/articles/:id', asyncRoute(getArticle));
router.patch('/articles/:id', validateBody(updateArticleSchema), asyncRoute(updateArticle));
router.delete('/articles/:id', asyncRoute(deleteArticle));
router.post('/articles/:id/publish', asyncRoute(publishArticle));
router.post('/articles/:id/unpublish', asyncRoute(unpublishArticle));
router.post('/articles/:id/cover', receiveFile, asyncRoute(uploadArticleCover));
router.post('/articles/:id/media', receiveFile, asyncRoute(uploadArticleMedia));
router.get('/article-categories', asyncRoute(listArticleCategories));
router.post('/article-categories', validateBody(createCategorySchema), asyncRoute(createArticleCategory));
router.get('/tags', asyncRoute(listTags));

// Media
router.get('/media/:id/file', asyncRoute(serveMedia));
router.delete('/media/:id', asyncRoute(deleteMedia));

// Categories
router.get('/categories', asyncRoute(listCategories));
router.post('/categories', validateBody(createCategorySchema), asyncRoute(createCategory));

// Newsletter (P3-05)
router.get('/newsletter/subscribers', validateQuery(subscribersQuerySchema), asyncRoute(listSubscribers));
router.get('/newsletter/subscribers.csv', validateQuery(subscribersQuerySchema), asyncRoute(exportSubscribers));
router.delete('/newsletter/subscribers/:id', asyncRoute(deleteSubscriber));
router.get('/newsletter/digest', validateQuery(digestQuerySchema), asyncRoute(previewDigest));

export default router;

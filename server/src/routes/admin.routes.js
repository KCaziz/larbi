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
  setFormationStatus,
  unpublishFormation,
  updateFormation,
} from '../controllers/admin/formations.controller.js';
import {
  createBlock,
  createRevision,
  deleteBlock,
  duplicateBlock,
  listRevisions,
  reorderBlocks,
  restoreRevision,
  updateBlock,
  uploadBlockFile,
} from '../controllers/admin/blocks.controller.js';
import { createBlockSchema, createRevisionSchema, reorderBlocksSchema, updateBlockSchema } from '../validation/blocks.schemas.js';
import {
  createQuestion,
  createQuiz,
  deleteQuestion,
  deleteQuiz,
  getQuiz,
  reorderQuestions,
  updateQuestion,
  updateQuiz,
} from '../controllers/admin/quizzes.controller.js';
import {
  createQuestionSchema,
  createQuizSchema,
  reorderQuestionsSchema,
  updateQuestionSchema,
  updateQuizSchema,
} from '../validation/quiz.schemas.js';
import { duplicateFormationRoute, duplicateLessonRoute, duplicateSectionRoute } from '../controllers/admin/duplicate.controller.js';
import { createSection, deleteSection, saveOutline, updateSection } from '../controllers/admin/sections.controller.js';
import { getDashboard } from '../controllers/admin/dashboard.controller.js';
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
  listMedia,
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
  createSectionSchema,
  outlineSchema,
  statusSchema,
  updateSectionSchema,
  reorderCoursesSchema,
  updateCourseSchema,
  updateFormationSchema,
} from '../validation/cms.schemas.js';
import { mediaQuerySchema } from '../validation/media.schemas.js';
import {
  createAccountType,
  deleteAccountType,
  listAccountTypes,
  updateAccountType,
} from '../controllers/admin/accountTypes.controller.js';
import { createAccountTypeSchema, updateAccountTypeSchema } from '../validation/accountTypes.schemas.js';
import { getUser, listUsers, updateUser } from '../controllers/admin/users.controller.js';
import { updateUserSchema, usersQuerySchema } from '../validation/users.schemas.js';
import { deleteSetting, listSettings, upsertSettingRoute } from '../controllers/admin/settings.controller.js';
import { upsertSettingSchema } from '../validation/settings.schemas.js';
import {
  listCertificates,
  restoreCertificate,
  revokeCertificate,
} from '../controllers/admin/certificates.controller.js';
import { certificatesQuerySchema, revokeCertificateSchema } from '../validation/certificates.schemas.js';

// CMS administration API. EVERY route below requires an authenticated admin,
// checked here on the server (the React admin area is only a convenience).
// The CMS base is shared: articles (P3-02) add their routes to this router.
const router = Router();
router.use(requireAuth, requireRole(ROLES.ADMIN));
router.param('id', uuidParam);
router.param('revisionId', uuidParam);

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
router.get('/dashboard', asyncRoute(getDashboard));
// Duplication (P3-14)
router.post('/formations/:id/duplicate', asyncRoute(duplicateFormationRoute));
router.post('/sections/:id/duplicate', asyncRoute(duplicateSectionRoute));
router.post('/courses/:id/duplicate', asyncRoute(duplicateLessonRoute));
router.put('/formations/:id/status', validateBody(statusSchema), asyncRoute(setFormationStatus));
router.post('/formations/:id/sections', validateBody(createSectionSchema), asyncRoute(createSection));
router.put('/formations/:id/outline', validateBody(outlineSchema), asyncRoute(saveOutline));
router.patch('/sections/:id', validateBody(updateSectionSchema), asyncRoute(updateSection));
router.delete('/sections/:id', asyncRoute(deleteSection));
router.post('/formations/:id/courses', validateBody(createCourseSchema), asyncRoute(createCourse));
router.put('/formations/:id/courses/order', validateBody(reorderCoursesSchema), asyncRoute(reorderCourses));
router.patch('/courses/:id', validateBody(updateCourseSchema), asyncRoute(updateCourse));
router.delete('/courses/:id', asyncRoute(deleteCourse));
// Quizzes (P3-13)
router.post('/formations/:id/quizzes', validateBody(createQuizSchema), asyncRoute(createQuiz));
router.get('/quizzes/:id', asyncRoute(getQuiz));
router.patch('/quizzes/:id', validateBody(updateQuizSchema), asyncRoute(updateQuiz));
router.delete('/quizzes/:id', asyncRoute(deleteQuiz));
router.post('/quizzes/:id/questions', validateBody(createQuestionSchema), asyncRoute(createQuestion));
router.put('/quizzes/:id/questions/order', validateBody(reorderQuestionsSchema), asyncRoute(reorderQuestions));
router.patch('/questions/:id', validateBody(updateQuestionSchema), asyncRoute(updateQuestion));
router.delete('/questions/:id', asyncRoute(deleteQuestion));

// Blocks of a lesson (P3-12)
router.post('/courses/:id/blocks', validateBody(createBlockSchema), asyncRoute(createBlock));
router.post('/courses/:id/blocks/upload', receiveFile, asyncRoute(uploadBlockFile));
router.put('/courses/:id/blocks/order', validateBody(reorderBlocksSchema), asyncRoute(reorderBlocks));
router.patch('/blocks/:id', validateBody(updateBlockSchema), asyncRoute(updateBlock));
router.post('/blocks/:id/duplicate', asyncRoute(duplicateBlock));
router.delete('/blocks/:id', asyncRoute(deleteBlock));
router.get('/courses/:id/revisions', asyncRoute(listRevisions));
router.post('/courses/:id/revisions', validateBody(createRevisionSchema), asyncRoute(createRevision));
router.post('/courses/:id/revisions/:revisionId/restore', asyncRoute(restoreRevision));
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
router.get('/media', validateQuery(mediaQuerySchema), asyncRoute(listMedia));
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

// Account types (P3-15)
router.get('/account-types', asyncRoute(listAccountTypes));
router.post('/account-types', validateBody(createAccountTypeSchema), asyncRoute(createAccountType));
router.patch('/account-types/:id', validateBody(updateAccountTypeSchema), asyncRoute(updateAccountType));
router.delete('/account-types/:id', asyncRoute(deleteAccountType));

// Users, rights and access (P3-16)
router.get('/users', validateQuery(usersQuerySchema), asyncRoute(listUsers));
router.get('/users/:id', asyncRoute(getUser));
router.patch('/users/:id', validateBody(updateUserSchema), asyncRoute(updateUser));

// Platform settings (P3-16)
router.get('/settings', asyncRoute(listSettings));
router.post('/settings', validateBody(upsertSettingSchema), asyncRoute(upsertSettingRoute));
router.delete('/settings/:key', asyncRoute(deleteSetting));

// Certificates (P3-16)
router.get('/certificates', validateQuery(certificatesQuerySchema), asyncRoute(listCertificates));
router.post('/certificates/:id/revoke', validateBody(revokeCertificateSchema), asyncRoute(revokeCertificate));
router.post('/certificates/:id/restore', asyncRoute(restoreCertificate));

export default router;

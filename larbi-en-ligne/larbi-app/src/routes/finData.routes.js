import { Router } from 'express';
import {
  getCategories,
  getCategoryHistory,
  getReferences,
  patchCategory,
  patchStandardCategory,
  postCategory,
  putCategoryArchived,
  removeCategory,
  removeStandardCustomisation,
} from '../controllers/finData.controller.js';
import { STANDARD_CATEGORY_KEYS } from '../constants/finCategories.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { HttpError } from '../utils/httpError.js';
import {
  archiveCategorySchema,
  createCategorySchema,
  customiseCategorySchema,
  deleteCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from '../validation/finData.schemas.js';

// FINCLUDIA common financial data model (P6-02). Every route needs a session:
// financial data is private by default, and a category is part of it. No
// administration side — the client's reference is read-only for everyone, and
// what a person adds belongs to them alone.
const router = Router();
router.use(requireAuth);

router.param('id', uuidParam);
// A standard key is a closed set (the client's own 91 rows): anything else is
// not a key that could exist, so it is a 404 and never reaches a query.
const keys = new Set(STANDARD_CATEGORY_KEYS);
router.param('key', (req, res, next, value) => (keys.has(value) ? next() : next(new HttpError(404, 'Not found'))));

router.get('/references', getReferences);

router.get('/categories', validateQuery(listCategoriesQuerySchema), asyncRoute(getCategories));
router.post('/categories', validateBody(createCategorySchema), asyncRoute(postCategory));
// Customising one of the client's standard categories, for this account only.
router.patch('/categories/standard/:key', validateBody(customiseCategorySchema), asyncRoute(patchStandardCategory));
router.delete('/categories/standard/:key', asyncRoute(removeStandardCustomisation));

router.patch('/categories/:id', validateBody(updateCategorySchema), asyncRoute(patchCategory));
router.put('/categories/:id/archive', validateBody(archiveCategorySchema), asyncRoute(putCategoryArchived));
router.delete('/categories/:id', validateBody(deleteCategorySchema), asyncRoute(removeCategory));
router.get('/categories/:id/historique', asyncRoute(getCategoryHistory));

export default router;

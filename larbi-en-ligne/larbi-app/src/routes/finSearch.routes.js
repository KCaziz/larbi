import { Router } from 'express';
import { getSearch } from '../controllers/finSearch.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { searchQuerySchema } from '../validation/finSearch.schemas.js';

// Global search (P6-20), screen C22, onglet « 12_Recherche ».
const router = Router();
router.use(requireAuth);

router.get('/recherche', validateQuery(searchQuerySchema), asyncRoute(getSearch));

export default router;

import { Router } from 'express';
import { getDashboardReferences, getToday } from '../controllers/finDashboard.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncRoute } from '../utils/asyncRoute.js';

// The "Aujourd'hui" home screen and the dashboards per public (P6-06), screens
// C04 / LY02 / ET02 / JA02 / SA02.
//
// Read-only, and session-scoped like every other financial route: this screen
// is a summary of one account's own money and nobody else's.
const router = Router();
router.use(requireAuth);

router.get('/aujourdhui/references', getDashboardReferences);
router.get('/aujourdhui', asyncRoute(getToday));

export default router;

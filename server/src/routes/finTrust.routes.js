import { Router } from 'express';
import {
  getCompleteness,
  getConsents,
  getDevices,
  getInventory,
  postDeleteAccount,
  postExport,
  postWithdrawSharing,
} from '../controllers/finTrust.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { deleteAccountSchema, sensitiveActionSchema, withdrawSharingSchema } from '../validation/finTrust.schemas.js';

// Trust and data centre (P6-19), screen C25.
const router = Router();
router.use(requireAuth);

router.get('/confiance/inventaire', asyncRoute(getInventory));
router.get('/confiance/completude', asyncRoute(getCompleteness));
router.get('/confiance/consentements', asyncRoute(getConsents));
router.post('/confiance/consentements/retirer-partage', validateBody(withdrawSharingSchema), asyncRoute(postWithdrawSharing));
router.get('/confiance/appareils', getDevices);
router.post('/confiance/export', validateBody(sensitiveActionSchema), asyncRoute(postExport));
router.post('/confiance/suppression', validateBody(deleteAccountSchema), asyncRoute(postDeleteAccount));

export default router;

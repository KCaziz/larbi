import { Router } from 'express';
import {
  getCompleteness,
  getConsents,
  getDevices,
  getInventory,
  postDeleteAccount, getResetPreview, postReset,
  postDisconnectDevice,
  postDisconnectOthers,
  postExport,
  postWithdrawSharing,
} from '../controllers/finTrust.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { deleteAccountSchema, resetSchema, sensitiveActionSchema, withdrawSharingSchema } from '../validation/finTrust.schemas.js';

// Trust and data centre (P6-19), screen C25.
const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);

router.get('/confiance/inventaire', asyncRoute(getInventory));
router.get('/confiance/completude', asyncRoute(getCompleteness));
router.get('/confiance/consentements', asyncRoute(getConsents));
router.post('/confiance/consentements/retirer-partage', validateBody(withdrawSharingSchema), asyncRoute(postWithdrawSharing));
router.get('/confiance/appareils', asyncRoute(getDevices));
router.post('/confiance/appareils/deconnecter-autres', validateBody(sensitiveActionSchema), asyncRoute(postDisconnectOthers));
router.post('/confiance/appareils/:id/deconnecter', validateBody(sensitiveActionSchema), asyncRoute(postDisconnectDevice));
router.post('/confiance/export', validateBody(sensitiveActionSchema), asyncRoute(postExport));
router.post('/confiance/suppression', validateBody(deleteAccountSchema), asyncRoute(postDeleteAccount));
// P11-01: start again, all or some parts.
router.get('/confiance/reinitialiser', asyncRoute(getResetPreview));
router.post('/confiance/reinitialiser', validateBody(resetSchema), asyncRoute(postReset));

export default router;

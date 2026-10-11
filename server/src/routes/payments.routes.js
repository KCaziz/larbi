import { Router } from 'express';
import {
  fakeCheckoutPage,
  fakeCheckoutSubmit,
  getMyOrder,
  listMyOrders,
  listOffers,
  receiveNotification,
  startOrder,
} from '../controllers/payments.controller.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { paymentNotificationLimiter, paymentOrderLimiter, publicReadLimiter } from '../middleware/rateLimit.js';
import { validateBody } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { HttpError } from '../utils/httpError.js';
import { createOrderSchema, fakeCheckoutSchema } from '../validation/payments.schemas.js';

// Payment API (P3-09). The provider-notification route receives its body RAW
// (see app.js): its signature covers the exact bytes sent.
const router = Router();
router.param('id', uuidParam);
router.param('provider', (req, res, next, value) => (/^[a-z0-9_-]{1,30}$/.test(value) ? next() : next(new HttpError(404, 'Not found'))));
router.param('reference', (req, res, next, value) => (/^[A-Za-z0-9_-]{1,191}$/.test(value) ? next() : next(new HttpError(404, 'Not found'))));

router.get('/offers', publicReadLimiter, asyncRoute(listOffers));
router.post('/webhook/:provider', paymentNotificationLimiter, asyncRoute(receiveNotification));

router.post('/orders', requireAuth, paymentOrderLimiter, validateBody(createOrderSchema), asyncRoute(startOrder));
router.get('/orders', requireAuth, asyncRoute(listMyOrders));
router.get('/orders/:id', requireAuth, asyncRoute(getMyOrder));

// The simulated provider's "hosted page" exists only when that provider is in
// use, which config/env.js refuses in production.
if (env.paymentProvider === 'fake') {
  router.get('/fake/checkout/:reference', publicReadLimiter, asyncRoute(fakeCheckoutPage));
  router.post('/fake/checkout/:reference', publicReadLimiter, validateBody(fakeCheckoutSchema), asyncRoute(fakeCheckoutSubmit));
}

export default router;

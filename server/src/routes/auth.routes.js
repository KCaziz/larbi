import { Router } from 'express';
import { changePassword, login, logout, me, register, updateMe } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validateBody } from '../middleware/validate.js';
import { changePasswordSchema, loginSchema, registerSchema, updateMeSchema } from '../validation/auth.schemas.js';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, validateBody(updateMeSchema), updateMe);
router.post('/password', requireAuth, authLimiter, validateBody(changePasswordSchema), changePassword);

export default router;

import { Router } from 'express';
import { getAccountTypes } from '../controllers/accountTypes.controller.js';
import { asyncRoute } from '../utils/asyncRoute.js';

const router = Router();

router.get('/', asyncRoute(getAccountTypes));

export default router;

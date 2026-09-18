import { Router } from 'express';
import { getAccountTypes } from '../controllers/accountTypes.controller.js';

const router = Router();

router.get('/', getAccountTypes);

export default router;

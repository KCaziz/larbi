import { Router } from 'express';
import {
  exportTrades,
  getInstruments,
  getPaperReferences,
  getPortfolio,
  getReadiness,
  getTrades,
  patchPortfolio,
  postInstrument,
  postRebalance,
  postReset,
  postRiskProfile,
  postTrade,
  putInstrumentPrice,
} from '../controllers/finPaper.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import {
  addInstrumentSchema,
  markInstrumentSchema,
  portfolioQuerySchema,
  rebalanceSchema,
  resetPortfolioSchema,
  riskAnswersSchema,
  tradeSchema,
  updatePortfolioSchema,
} from '../validation/finPaper.schemas.js';

// Paper portfolio and investment workshop (P6-12), screens C17 and EP03-EP07.
// Every route needs a session; everything it touches is fictional, and nothing
// is ever executed anywhere.
const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);

router.get('/portefeuille/references', getPaperReferences);
// The saver's path (EP03): answers, never blocks.
router.get('/portefeuille/diagnostic', asyncRoute(getReadiness));
router.post('/portefeuille/profil-risque', validateBody(riskAnswersSchema), postRiskProfile);
// The decision journal and its export (EP07). `export` before `/:id`.
router.get('/portefeuille/decisions/export', asyncRoute(exportTrades));
router.get('/portefeuille/decisions', asyncRoute(getTrades));

router.get('/portefeuille', validateQuery(portfolioQuerySchema), asyncRoute(getPortfolio));
router.patch('/portefeuille', validateBody(updatePortfolioSchema), asyncRoute(patchPortfolio));
router.post('/portefeuille/reinitialiser', validateBody(resetPortfolioSchema), asyncRoute(postReset));

router.get('/portefeuille/instruments', asyncRoute(getInstruments));
router.post('/portefeuille/instruments', validateBody(addInstrumentSchema), asyncRoute(postInstrument));
router.put('/portefeuille/instruments/:id/prix', validateBody(markInstrumentSchema), asyncRoute(putInstrumentPrice));

router.post('/portefeuille/operations', validateBody(tradeSchema), asyncRoute(postTrade));
// Proposed, never applied: it writes nothing.
router.post('/portefeuille/reequilibrage', validateBody(rebalanceSchema), asyncRoute(postRebalance));

export default router;

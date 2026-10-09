import { Router } from 'express';
import { getSegment, getSummary, getTheme, listTools } from '../controllers/comparator.controller.js';
import { getSimulator, listSimulators, runSimulation } from '../controllers/simulations.controller.js';
import { getComparisonMeta, runComparison, runJobOfferComparison } from '../controllers/comparisons.controller.js';
import {
  compareScenarios,
  deleteScenario,
  getScenario,
  listScenarios,
  renameScenario,
  saveScenario,
} from '../controllers/scenarios.controller.js';
import { EXPLICIT_SEGMENTS, themeByKey } from '../constants/comparator.js';
import { simulatorByKey } from '../constants/simulators.js';
import { requireAuth } from '../middleware/auth.js';
import { publicReadLimiter } from '../middleware/rateLimit.js';
import { toolAccess } from '../middleware/toolAccess.js';
import { validateBody } from '../middleware/validate.js';
import { SIMULATION_SCHEMAS } from '../validation/simulations.schemas.js';
import { comparisonSchema, jobOffersSchema } from '../validation/comparisons.schemas.js';
import { compareScenariosSchema, renameScenarioSchema, saveScenarioSchema } from '../validation/scenarios.schemas.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { HttpError } from '../utils/httpError.js';

// Tools API (P4-01). Every tool is mounted behind toolAccess(<its key>): who may
// use it is decided once, in constants/tools.js, and enforced here.
const router = Router();
router.use(publicReadLimiter);

router.get('/', listTools);

// Bank comparator (P4-06). Unknown rubric or segment: 404, like an unknown page.
const comparator = Router();
comparator.param('theme', (req, res, next, value) => (themeByKey(value) ? next() : next(new HttpError(404, 'Not found'))));
comparator.param('segment', (req, res, next, value) => (EXPLICIT_SEGMENTS.includes(value) ? next() : next(new HttpError(404, 'Not found'))));
comparator.get('/', asyncRoute(getSummary));
comparator.get('/themes/:theme', asyncRoute(getTheme));
comparator.get('/segments/:segment', asyncRoute(getSegment));
router.use('/comparator', ...toolAccess('comparateur-bancaire'), comparator);

// FINCLUDIA simulators (P4-10). Pure compute: the body is validated, the maths
// run, nothing is read from or written to the database.
const simulations = Router();
simulations.param('key', (req, res, next, value) => (simulatorByKey(value) ? next() : next(new HttpError(404, 'Not found'))));
simulations.get('/', listSimulators);
simulations.get('/:key', getSimulator);
// The schema depends on the simulator, so it is picked per request — from the
// SAME registry that describes the form, which is why a field cannot be offered
// to the interface and refused by the server.
simulations.post('/:key', (req, res, next) => validateBody(SIMULATION_SCHEMAS[req.params.key])(req, res, next), runSimulation);
router.use('/simulations', ...toolAccess('simulateurs'), simulations);

// Multi-criteria comparison and job-offer comparator (P4-12). Pure compute as
// well: the table is built from the body, nothing is stored.
const comparisons = Router();
comparisons.get('/', getComparisonMeta);
comparisons.post('/', validateBody(comparisonSchema), runComparison);
comparisons.post('/offres-emploi', validateBody(jobOffersSchema), runJobOfferComparison);
router.use('/comparaisons', ...toolAccess('comparaisons'), comparisons);

// Saved scenarios of the simulation workshop (P4-16, screen C18). Running a
// simulation needs no account (the client's C18 works "en mode découverte");
// KEEPING one does, because a scenario belongs to someone. Every route below
// requires a session, and every query filters on the owner.
const scenarios = Router();
scenarios.use(requireAuth);
scenarios.param('id', uuidParam);
scenarios.get('/', asyncRoute(listScenarios));
scenarios.post('/', validateBody(saveScenarioSchema), asyncRoute(saveScenario));
scenarios.post('/comparaison', validateBody(compareScenariosSchema), asyncRoute(compareScenarios));
scenarios.get('/:id', asyncRoute(getScenario));
scenarios.patch('/:id', validateBody(renameScenarioSchema), asyncRoute(renameScenario));
scenarios.delete('/:id', asyncRoute(deleteScenario));
router.use('/scenarios', ...toolAccess('simulateurs'), scenarios);

export default router;

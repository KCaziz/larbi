import { prisma } from '../config/prisma.js';
import { MAX_OPTIONS, MIN_OPTIONS } from '../constants/comparison.js';
import { simulatorByKey } from '../constants/simulators.js';
import { SIMULATION_SCHEMAS } from '../validation/simulations.schemas.js';
import { runScenario, toScenario, versionsOf } from '../services/scenario.service.js';
import { HttpError } from '../utils/httpError.js';

// Saved scenarios of the simulation workshop (P4-16, screen C18). Every route
// here needs a session, and a scenario belongs to exactly one account: the
// queries filter on the owner, so an id from someone else answers 404 rather
// than telling the caller it exists.
const MAX_SCENARIOS = 50;

const noStore = (res) => res.set('Cache-Control', 'no-store');

export async function listScenarios(req, res) {
  noStore(res);
  const rows = await prisma.simulationScenario.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ scenarios: rows.map(toScenario), limit: MAX_SCENARIOS });
}

export async function getScenario(req, res) {
  noStore(res);
  const row = await prisma.simulationScenario.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!row) throw new HttpError(404, 'Not found');
  res.json({ scenario: toScenario(row) });
}

// Saving RECOMPUTES the figures server-side from the inputs. The body never
// carries results: a client-supplied figure would be stored as if the engine had
// produced it, and the versions saved next to it would be a lie.
export async function saveScenario(req, res) {
  noStore(res);
  const { simulator: key, title, ...rest } = req.body;
  if (!simulatorByKey(key)) throw new HttpError(404, 'Not found');

  const parsed = SIMULATION_SCHEMAS[key].safeParse(rest);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => issue.path.join('.') || 'body');
    throw new HttpError(400, `Invalid input: ${[...new Set(fields)].join(', ')}`);
  }
  const { currency, ...inputs } = parsed.data;
  const { resultats, hypotheses } = runScenario({ simulator: key, currency, inputs });

  const count = await prisma.simulationScenario.count({ where: { userId: req.user.id } });
  if (count >= MAX_SCENARIOS) throw new HttpError(409, 'Too many scenarios');

  const row = await prisma.simulationScenario.create({
    data: {
      userId: req.user.id,
      simulator: key,
      title,
      currency,
      inputs,
      hypotheses: hypotheses ?? undefined,
      versions: versionsOf(resultats),
    },
  });
  res.status(201).json({ scenario: toScenario(row) });
}

export async function renameScenario(req, res) {
  noStore(res);
  const { count } = await prisma.simulationScenario.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { title: req.body.title },
  });
  if (count === 0) throw new HttpError(404, 'Not found');
  const row = await prisma.simulationScenario.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  res.json({ scenario: toScenario(row) });
}

export async function deleteScenario(req, res) {
  const { count } = await prisma.simulationScenario.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  if (count === 0) throw new HttpError(404, 'Not found');
  res.status(204).end();
}

// Comparing scenarios (P4-16). It follows the same rules as the comparison
// engine of P4-12 — two to three options, one currency, nothing converted — but
// it does NOT call it: the engine compares a fixed vocabulary of criteria (cost,
// risk, liquidity…), while two scenarios are compared on their own figures,
// which carry their own units and formulas.
//
// And deliberately NO synthetic score here. Scoring a scenario would mean
// weighing a living allowance against a savings rate and a number of months:
// there is no defensible normalisation across units, so the comparison shows the
// figures side by side and lets the person read them.
export async function compareScenarios(req, res) {
  noStore(res);
  const { ids } = req.body;
  if (new Set(ids).size !== ids.length) throw new HttpError(400, 'Invalid input: ids');

  const rows = await prisma.simulationScenario.findMany({ where: { id: { in: ids }, userId: req.user.id } });
  if (rows.length !== ids.length) throw new HttpError(404, 'Not found');

  const scenarios = ids.map((id) => toScenario(rows.find((row) => row.id === id)));
  const unplayable = scenarios.filter((scenario) => scenario.resultats === null);
  if (unplayable.length > 0) throw new HttpError(409, 'Scenario cannot be recomputed');

  // The named results shared by every scenario compared. A figure only one of
  // them has would be a row with a single cell: nothing to compare.
  const shared = Object.keys(scenarios[0].resultats).filter((name) =>
    scenarios.every((scenario) => scenario.resultats[name] !== undefined),
  );
  if (shared.length === 0) throw new HttpError(409, 'Nothing in common to compare');

  // Same rule as the engine: amounts in two currencies are refused, never
  // converted at a rate nobody dated.
  const currencies = new Set(scenarios.map((scenario) => scenario.currency));
  if (currencies.size > 1) throw new HttpError(400, 'Not comparable: currency');

  const rowsOut = shared.map((name) => {
    const answers = scenarios.map((scenario) => scenario.resultats[name]);
    const values = Object.fromEntries(scenarios.map((scenario, index) => [scenario.id, answers[index].resultat]));
    return {
      result: name,
      // The unit and the formula come from the answers themselves, so a row of
      // the table can still say which formula produced its figures.
      unite: answers[0].unite,
      formule_id: answers[0].formule_id,
      versions: Object.fromEntries(scenarios.map((scenario, index) => [scenario.id, answers[index].formule_version])),
      values,
    };
  });

  res.json({
    scenarios: scenarios.map(({ id, title, simulator, currency, hypotheses, versionsChanged }) => ({
      id,
      title,
      simulator,
      currency,
      hypotheses,
      ...(versionsChanged ? { versionsChanged } : {}),
    })),
    currency: [...currencies][0],
    results: rowsOut,
    bounds: { min: MIN_OPTIONS, max: MAX_OPTIONS },
  });
}

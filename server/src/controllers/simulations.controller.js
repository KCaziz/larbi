import { formulaById } from '../constants/finance.js';
import { SIMULATORS, simulatorByKey } from '../constants/simulators.js';
import { SIMULATOR_FUNCTIONS } from '../services/finance/simulators.js';

// FINCLUDIA simulators (P4-10). Read-only compute: no account, no stored data,
// nothing written. Every answer carries, for each figure, the formula that
// produced it and the inputs it came from — that is what the "Pourquoi ?" button
// the client requires on every value displays, with no second request.

// The answer depends only on the body, never on who asks, but it must not be
// cached as if it were a page: a simulation is specific to what was typed.
const noStore = (res) => res.set('Cache-Control', 'no-store');

// The client's own three columns for a formula, so the interface can explain a
// result in the client's wording instead of paraphrasing it.
const describeFormula = (id) => {
  const formula = formulaById(id);
  return { id, label: formula.label, rule: formula.rule, condition: formula.condition, unit: formula.unit, version: formula.version };
};

const describe = (simulator) => ({
  key: simulator.key,
  calculator: simulator.calculator,
  publics: simulator.publics,
  fields: simulator.fields.map(({ key, type, required = false, min, max }) => ({ key, type, required, min, max })),
  formulas: simulator.formulas.map(describeFormula),
});

export function listSimulators(req, res) {
  noStore(res);
  res.json({ simulators: SIMULATORS.map(describe) });
}

export function getSimulator(req, res) {
  noStore(res);
  res.json({ simulator: describe(simulatorByKey(req.params.key)) });
}

export function runSimulation(req, res) {
  noStore(res);
  const simulator = simulatorByKey(req.params.key);
  const { currency, ...input } = req.body;
  const { resultats, hypotheses } = SIMULATOR_FUNCTIONS[simulator.key](input, { currency });
  const answer = { simulator: simulator.key, calculator: simulator.calculator, resultats };
  if (hypotheses !== null) answer.hypotheses = hypotheses;
  res.json(answer);
}

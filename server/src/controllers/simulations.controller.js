import { algorithmById, formulaById } from '../constants/finance.js';
import { SIMULATORS, simulatorByKey } from '../constants/simulators.js';
import { SIMULATOR_FUNCTIONS } from '../services/finance/simulators.js';

// FINCLUDIA simulators (P4-10). Read-only compute: no account, no stored data,
// nothing written. Every answer carries, for each figure, the formula that
// produced it and the inputs it came from — that is what the "Pourquoi ?" button
// the client requires on every value displays, with no second request.

// The answer depends only on the body, never on who asks, but it must not be
// cached as if it were a page: a simulation is specific to what was typed.
const noStore = (res) => res.set('Cache-Control', 'no-store');

// The client's own columns for a formula, so the interface can explain a result
// in the client's wording instead of paraphrasing it. An algorithm (ALG-xx) has
// a name and a rule but no "condition" column in the client's workbook, and
// `condition: null` says that plainly rather than inventing a sentence.
const describeFormula = (id) => {
  const formula = formulaById(id);
  if (formula) {
    return { id, label: formula.label, rule: formula.rule, condition: formula.condition, unit: formula.unit, version: formula.version };
  }
  const algorithm = algorithmById(id);
  return { id, label: algorithm.label, rule: algorithm.rule, condition: null, unit: 'composite', version: algorithm.version };
};

// A repeated field carries the description of its own rows, so the form can draw
// them without a second source of truth.
const describeField = ({ key, type, required = false, min, max, maxLength, item, minItems, maxItems, default: value }) => ({
  key,
  type,
  required,
  min,
  max,
  maxLength,
  default: value,
  ...(item ? { item: item.map(describeField), minItems, maxItems } : {}),
});

const describe = (simulator) => ({
  key: simulator.key,
  calculator: simulator.calculator,
  publics: simulator.publics,
  fields: simulator.fields.map(describeField),
  formulas: simulator.formulas.map(describeFormula),
  // The illustrative values the empty state of the workshop offers (P4-16).
  // Sent with the simulator so the form can load them without a second request,
  // and labelled as an example everywhere it shows them.
  example: simulator.example,
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

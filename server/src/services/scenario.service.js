// Saved simulation scenarios (P4-16, screen C18).
//
// The one decision that shapes this file: a scenario stores its INPUTS, and the
// figures are recomputed from them every time it is read. Storing the numbers
// instead would make a scenario a screenshot — reopened a year later, nobody
// could tell whether the figures still follow from the formulas, or which
// formula produced them.
//
// What IS stored alongside the inputs is what cannot be recomputed: the
// hypotheses the simulation ran under and the formula version of each figure.
// Comparing them with today's versions is how the screen can say "this scenario
// was computed with F021 version 1, which has since changed".

import { simulatorByKey } from '../constants/simulators.js';
import { SIMULATOR_FUNCTIONS } from './finance/simulators.js';
import { SIMULATION_SCHEMAS } from '../validation/simulations.schemas.js';

// Runs a scenario's stored inputs through its simulator.
export function runScenario({ simulator, currency, inputs }) {
  const { resultats, hypotheses } = SIMULATOR_FUNCTIONS[simulator](inputs, { currency });
  return { resultats, hypotheses };
}

export const versionsOf = (resultats) =>
  Object.fromEntries(Object.values(resultats).map((answer) => [answer.formule_id, answer.formule_version]));

// The inputs stored for a scenario must still be valid input for its simulator:
// a lot may add a required field, or tighten a bound, after a scenario was
// saved. Rather than feed stale inputs to the engine, the scenario says it
// cannot be recomputed and keeps everything else it knows.
export function replayScenario(row) {
  const simulator = simulatorByKey(row.simulator);
  if (!simulator) return { stale: 'simulator', resultats: null, hypotheses: null };

  const parsed = SIMULATION_SCHEMAS[row.simulator].safeParse({ currency: row.currency, ...row.inputs });
  if (!parsed.success) return { stale: 'inputs', resultats: null, hypotheses: null };

  const { currency, ...inputs } = parsed.data;
  const { resultats, hypotheses } = runScenario({ simulator: row.simulator, currency, inputs });
  return { stale: null, resultats, hypotheses };
}

// Which formulas have moved since the scenario was saved. Empty when nothing
// changed, which is the normal case; non-empty is exactly what the client's
// rule about versioned formulas exists to make visible.
export function changedVersions(stored, resultats) {
  if (resultats === null) return [];
  const now = versionsOf(resultats);
  return Object.entries(stored ?? {})
    .filter(([id, version]) => now[id] !== undefined && now[id] !== version)
    .map(([id, version]) => ({ formule_id: id, saved: version, current: now[id] }));
}

export function toScenario(row) {
  const { stale, resultats, hypotheses } = replayScenario(row);
  const answer = {
    id: row.id,
    simulator: row.simulator,
    title: row.title,
    currency: row.currency,
    inputs: row.inputs,
    // The hypotheses as they were SAVED: they are part of what the scenario is,
    // not something to recompute.
    hypotheses: row.hypotheses ?? null,
    versions: row.versions ?? {},
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    resultats,
  };
  if (stale !== null) answer.stale = stale;
  const changed = changedVersions(row.versions, resultats);
  if (changed.length > 0) answer.versionsChanged = changed;
  // A recomputed hypothesis that differs from the saved one would mean the
  // simulator itself changed: worth saying, for the same reason as a version.
  if (hypotheses !== null && row.hypotheses !== null && JSON.stringify(hypotheses) !== JSON.stringify(row.hypotheses)) {
    answer.hypothesesChanged = hypotheses;
  }
  return answer;
}

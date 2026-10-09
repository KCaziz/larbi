import { z } from 'zod';
import { MAX_OPTIONS, MIN_OPTIONS } from '../constants/comparison.js';
import { SIMULATOR_KEYS } from '../constants/simulators.js';

// Saved scenarios of the simulation workshop (P4-16).
//
// The body of a save is deliberately NOT strict here: everything besides
// `simulator` and `title` is the simulator's own input, and it is validated by
// that simulator's schema in the controller — the same schema the form was built
// from. Checking it twice, here and there, would be two places to keep in step.
// The simulator's schema is `.strict()`, so an unknown field is still refused.
//
// What a save never carries is a RESULT: the figures are recomputed server-side
// from the inputs. A client-supplied figure would be stored as if the engine had
// produced it, next to a formula version that did not produce it.

export const titleSchema = z.string().trim().min(1).max(120);

export const saveScenarioSchema = z
  .object({
    simulator: z.enum(SIMULATOR_KEYS),
    title: titleSchema,
  })
  .catchall(z.unknown());

export const renameScenarioSchema = z.object({ title: titleSchema }).strict();

export const compareScenariosSchema = z
  .object({
    // The client's bound for a comparison: two to three.
    ids: z.array(z.string().uuid()).min(MIN_OPTIONS).max(MAX_OPTIONS),
  })
  .strict();

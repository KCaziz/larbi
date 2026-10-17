import { z } from 'zod';
import { SIMULATORS } from '../constants/simulators.js';

// Input validation of the FINCLUDIA simulators (P4-10). The schemas are BUILT
// from the registry (constants/simulators.js) instead of being written again
// here: a field declared for the form is therefore always the field the server
// accepts, and the two can never drift apart.

// Amounts are integers in the currency's smallest unit (centimes). A decimal is
// refused rather than rounded: rounding someone's input silently is how a budget
// stops matching what they typed.
const MAX_AMOUNT = Number.MAX_SAFE_INTEGER;

// A rate is a decimal (0.05 = 5 %) and may be negative — the client asks for
// negative returns to be usable in a simulation. The bounds only keep the
// compounding arithmetic finite; they are not a judgement on what is realistic.
const RATE_MIN = -1;
const RATE_MAX = 10;

// Any ISO-like code: the engine never converts, it only labels its result with
// the currency it was given, so restricting the list would be an invention.
// Which currencies the product actually offers is a client decision (P6-01).
const currency = z.string().regex(/^[A-Z]{3}$/);

function fieldSchema(field) {
  if (field.type === 'money') {
    let schema = z.number().int().max(MAX_AMOUNT);
    if (field.min !== undefined) schema = schema.min(field.min);
    return schema;
  }
  if (field.type === 'count') {
    let schema = z.number().int().max(field.max ?? 1_000_000);
    schema = schema.min(field.min ?? 0);
    return schema;
  }
  // A name the user typed to tell two rows apart (P4-11): trimmed, bounded, and
  // never used for anything but display.
  if (field.type === 'text') return z.string().trim().min(1).max(field.maxLength ?? 60);
  if (field.type === 'list') {
    return z.array(itemSchema(field.item)).min(field.minItems ?? 1).max(field.maxItems ?? 20);
  }
  return z.number().min(field.min ?? RATE_MIN).max(RATE_MAX);
}

// A row of a repeated field. An optional text inside a row is simply absent
// when not typed — unlike an amount, an empty name is not an answer of "zero".
const itemSchema = (item) =>
  z
    .object(
      Object.fromEntries(
        item.map((field) => {
          const schema = fieldSchema(field);
          if (field.required) return [field.key, schema];
          return [field.key, field.type === 'text' ? schema.optional() : schema.default(0)];
        }),
      ),
    )
    .strict();

// An optional amount defaults to 0: the user said "nothing under this heading",
// which is a real answer. A REQUIRED field has no default — it is refused when
// absent, so no simulation ever runs on a number nobody gave. The one field with
// a declared `default` is a stated convention, not an assumption (see the
// registry's comment on `periodsPerYear`).
// A rule that needs two fields at once (P4-11): a down payment above the price
// leaves nothing to finance, and a negative instalment is not an answer worth
// showing. Refusing names the offending field, which the form displays, instead
// of returning "non calculé" with no reason.
const withRefinements = (schema, simulator) =>
  (simulator.refinements ?? []).reduce((current, rule) => current.refine(rule.check, { path: [rule.path] }), schema);

const schemaFor = (simulator) =>
  withRefinements(
    z
      .object({
        currency,
        ...Object.fromEntries(
          simulator.fields.map((field) => {
            const schema = fieldSchema(field);
            if (field.required) return [field.key, schema];
            return [field.key, schema.default(field.default ?? 0)];
          }),
        ),
      })
      .strict(),
    simulator,
  );

export const SIMULATION_SCHEMAS = Object.fromEntries(SIMULATORS.map((simulator) => [simulator.key, schemaFor(simulator)]));

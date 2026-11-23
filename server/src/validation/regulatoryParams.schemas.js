import { z } from 'zod';
import { REGULATORY_PARAMS } from '../constants/regulatoryParams.js';

const KIND = Object.fromEntries(REGULATORY_PARAMS.map((param) => [param.key, param.kind]));

// P13-05: the client confirms a value (or corrects it) and the date it applies
// from. A rate is a decimal between 0 and 1 (0.005 = 0.5 %), an amount a
// positive number of dinars, any other rule a sentence.
export const confirmRegulatorySchema = z
  .object({
    value: z.string().trim().min(1).max(500),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict();

export function checkRegulatoryValue(key, value) {
  const number = Number(value.replace(',', '.'));
  if (KIND[key] === 'rate') return Number.isFinite(number) && number >= 0 && number <= 1 ? String(number) : null;
  if (KIND[key] === 'amount') return Number.isFinite(number) && number > 0 ? String(number) : null;
  return value;
}

import { z } from 'zod';
import { CORE_KEYS, GA_MEASUREMENT_ID } from '../services/settings.service.js';
import { phoneSchema } from './fieldRules.js';

// Only one of the known settings: see CORE_KEYS (settings.service.js). The
// Analytics identifier has a fixed shape: anything else would load nothing.
export const upsertSettingSchema = z
  .object({ key: z.enum(CORE_KEYS), value: z.string().max(2000) })
  .strict()
  .refine((body) => body.key !== 'gaMeasurementId' || GA_MEASUREMENT_ID.test(body.value), { message: 'Invalid Google Analytics identifier', path: ['value'] })
  // R20: the phone shown in the footer is a phone number (or empty).
  .refine((body) => body.key !== 'contactPhone' || body.value.trim() === '' || phoneSchema.safeParse(body.value).success, { message: 'Invalid phone number', path: ['value'] });

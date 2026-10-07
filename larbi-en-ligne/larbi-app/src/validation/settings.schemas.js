import { z } from 'zod';
import { CORE_KEYS } from '../services/settings.service.js';

// Only one of the four known settings: see CORE_KEYS (settings.service.js).
export const upsertSettingSchema = z.object({ key: z.enum(CORE_KEYS), value: z.string().max(2000) }).strict();

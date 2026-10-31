import { z } from 'zod';
import { EDUCATION_PROFILE_CODES } from '../constants/finPublics.js';
import {
  MISSION_BADGES_MAX,
  MISSION_CHOICES_MAX,
  MISSION_CHOICES_MIN,
  MISSION_EFFECT_MAX,
  MISSION_RESILIENCE_MAX,
  MISSION_STEPS_MAX,
} from '../constants/finMissions.js';

// A mission, as the administrator enters it (P8-17). Every rule of the structure
// is checked here, so what is stored can always be played and scored.
const key = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60);
const effect = z.number().int().min(-MISSION_EFFECT_MAX).max(MISSION_EFFECT_MAX);

const choiceSchema = z
  .object({
    key,
    label: z.string().trim().min(1).max(160),
    // Money effects in centimes of the FICTIVE sum, resilience in points.
    cash: effect,
    savings: effect,
    resilience: z.number().int().min(-MISSION_RESILIENCE_MAX).max(MISSION_RESILIENCE_MAX),
    explanation: z.string().trim().min(1).max(400),
  })
  .strict();

const stepSchema = z
  .object({
    key,
    prompt: z.string().trim().min(1).max(400),
    choices: z.array(choiceSchema).min(MISSION_CHOICES_MIN).max(MISSION_CHOICES_MAX),
  })
  .strict()
  .refine((step) => new Set(step.choices.map((choice) => choice.key)).size === step.choices.length, { message: 'Two choices of a step share a key', path: ['choices'] });

const badgeSchema = z.object({ key, label: z.string().trim().min(1).max(60), minResilience: z.number().int().min(-MISSION_RESILIENCE_MAX * MISSION_STEPS_MAX).max(MISSION_RESILIENCE_MAX * MISSION_STEPS_MAX) }).strict();

const fields = {
  slug: key,
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(500),
  profiles: z.array(z.enum(EDUCATION_PROFILE_CODES)).max(EDUCATION_PROFILE_CODES.length),
  startingAmount: z.number().int().min(0).max(MISSION_EFFECT_MAX),
  currency: z.string().regex(/^[A-Z]{3}$/),
  steps: z.array(stepSchema).min(1).max(MISSION_STEPS_MAX),
  badges: z.array(badgeSchema).max(MISSION_BADGES_MAX),
  position: z.number().int().min(0).max(1000),
};

const uniqueKeys = (list) => new Set(list.map((row) => row.key)).size === list.length;

export const createMissionSchema = z
  .object({ ...fields, profiles: fields.profiles.default([]), badges: fields.badges.default([]), position: fields.position.default(0), currency: fields.currency.default('DZD') })
  .strict()
  .refine((body) => uniqueKeys(body.steps), { message: 'Two steps share a key', path: ['steps'] })
  .refine((body) => uniqueKeys(body.badges), { message: 'Two badges share a key', path: ['badges'] });

export const updateMissionSchema = z
  .object(Object.fromEntries(Object.entries(fields).map(([name, schema]) => [name, schema.optional()])))
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to change' })
  .refine((body) => body.steps === undefined || uniqueKeys(body.steps), { message: 'Two steps share a key', path: ['steps'] })
  .refine((body) => body.badges === undefined || uniqueKeys(body.badges), { message: 'Two badges share a key', path: ['badges'] });

export const playMissionSchema = z
  .object({ choices: z.array(z.object({ step: key, choice: key }).strict()).min(1).max(MISSION_STEPS_MAX) })
  .strict();

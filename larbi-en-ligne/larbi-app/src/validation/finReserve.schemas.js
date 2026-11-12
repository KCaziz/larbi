import { z } from 'zod';
import { currencySchema } from './finData.schemas.js';

// Null clears the target: "no target chosen yet" is a real state, not 0 months.
export const reserveTargetSchema = z.object({ targetMonths: z.number().int().min(0).max(60).nullable() }).strict();

// Recette R12-01: the monthly estimate of essential expenses, in minor units.
export const reserveEstimateSchema = z.object({ amount: z.number().int().min(0).safe(), currency: currencySchema }).strict();

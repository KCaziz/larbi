import { z } from 'zod';
import { ORDER_STATUS, PURCHASABLE_ACCESS_LEVELS } from '../constants/payments.js';

// The buyer only names an offer: amount, currency and access come from the server.
export const createOrderSchema = z.object({ offerId: z.string().uuid() }).strict();

// Offers, written by an administrator from the client's figures (P3-09).
// Amount in the smallest unit of the currency (centimes...), an integer.
const offerFields = {
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).nullable(),
  amount: z.number().int().min(1).max(1_000_000_000),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
  accessLevel: z.enum(PURCHASABLE_ACCESS_LEVELS),
  isActive: z.boolean(),
  position: z.number().int().min(0).max(1000),
};

export const createOfferSchema = z
  .object({ ...offerFields, description: offerFields.description.default(null), accessLevel: offerFields.accessLevel.default('premium'), isActive: offerFields.isActive.default(false) })
  .omit({ position: true })
  .strict();

export const updateOfferSchema = z.object(offerFields).partial().strict();

// An empty status ("?status=") means every status.
export const ordersQuerySchema = z.object({ status: z.union([z.enum(Object.values(ORDER_STATUS)), z.literal('')]).optional() }).strict();

// Simulated checkout page (development / tests only): what the buyer clicked.
export const fakeCheckoutSchema = z.object({ action: z.enum(['pay', 'cancel']) }).strict();

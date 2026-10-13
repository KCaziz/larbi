import { z } from 'zod';
import { ASSET_KINDS, ASSET_LIQUIDITY, WEALTH_STATUSES } from '../constants/finWealth.js';
import { amountSchema, confidenceSchema, consentUsesSchema, currencySchema, reasonSchema, scopeSchema } from './finData.schemas.js';

// Real patrimony (P6-11). The vocabularies come from the constants, so what the
// database refuses and what validation refuses are the same lists.

const label = z.string().trim().min(1).max(80);
const note = z.string().trim().min(1).max(300).nullable().optional();
const holder = z.string().trim().min(1).max(80).nullable().optional();
const isoDate = z.coerce.date();

// « Le fictif est interdit ici » — the client's own sentence. `fictional` is
// absent from WEALTH_STATUSES, so a request asking for it is refused by
// validation before the CHECK ever sees it, and the refusal can say why.
const statusSchema = z.enum(WEALTH_STATUSES);

export const createAssetSchema = z
  .object({
    label,
    kind: z.enum(ASSET_KINDS),
    categoryId: z.string().uuid().nullable().optional(),
    // An asset worth nothing is not an asset; a negative one would be a debt,
    // and debts have their own table (P6-10).
    value: amountSchema.min(1),
    currency: currencySchema,
    // « Valeur datée »: the date the value was established, not the date the
    // row was typed. Required, because an undated valuation cannot be known to
    // be stale — and the client asks for an alert on exactly that.
    valuedAt: isoDate,
    liquidity: z.enum(ASSET_LIQUIDITY).optional(),
    holder,
    note,
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    // How sure the figure is. A flat is an estimate, a bank balance is not, and
    // this is the socle field that says which.
    confidence: confidenceSchema.nullable().optional(),
    status: statusSchema.optional(),
  })
  .strict();

export const updateAssetSchema = z
  .object({
    label: label.optional(),
    kind: z.enum(ASSET_KINDS).optional(),
    categoryId: z.string().uuid().nullable().optional(),
    value: amountSchema.min(1).optional(),
    currency: currencySchema.optional(),
    valuedAt: isoDate.optional(),
    liquidity: z.enum(ASSET_LIQUIDITY).optional(),
    holder,
    note,
    scope: scopeSchema.optional(),
    consentUses: consentUsesSchema.optional(),
    confidence: confidenceSchema.nullable().optional(),
    status: statusSchema.optional(),
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' })
  // A new amount without the date it was established would make a stale figure
  // look fresh. The service refuses it too; refusing it here gives the clearer
  // message.
  .refine((body) => body.value === undefined || body.valuedAt !== undefined, {
    message: 'A new value needs the date it was established',
    path: ['valuedAt'],
  });

// The patrimony view. Both thresholds are arguments so the screen can show what
// it is comparing against, and neither is a hidden coefficient.
export const wealthQuerySchema = z
  .object({
    currency: currencySchema.optional(),
    staleDays: z.coerce.number().int().min(1).max(3650).optional(),
    noticeShare: z.coerce.number().min(0.01).max(1).optional(),
  })
  .strict();

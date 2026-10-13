import { z } from 'zod';
import { PARTICIPANTS_MAX, SPLIT_MODES } from '../constants/finShared.js';
import { amountSchema, currencySchema, reasonSchema } from './finData.schemas.js';

// Shared expenses and settlements (P6-14). The vocabularies come from the
// constants, so what the database refuses and what validation refuses are the
// same lists.

const label = z.string().trim().min(1).max(80);
const note = z.string().trim().min(1).max(300).nullable().optional();
const isoDate = z.coerce.date();

// `weight` means something different in each mode, which is why it is one
// field and not three: the amount in `amounts`, the percentage in hundredths
// of a percent in `percent`, and nothing at all in `equal` and
// `income_proportional` (where the server supplies it).
const participantSchema = z
  .object({ memberId: z.string().uuid(), weight: amountSchema.min(0).optional() })
  .strict();

export const createSharedExpenseSchema = z
  .object({
    label,
    // A shared expense of zero is not an expense.
    value: amountSchema.min(1),
    // Optional: the space decides it, and a mismatch is refused rather than
    // silently overridden.
    currency: currencySchema.optional(),
    occurredAt: isoDate,
    splitMode: z.enum(SPLIT_MODES),
    // The payer may be somebody other than the caller, and may be absent from
    // the participants entirely (« payeur pouvant ne pas participer »).
    payerId: z.string().uuid(),
    participants: z.array(participantSchema).min(1).max(PARTICIPANTS_MAX),
    categoryId: z.string().uuid().nullable().optional(),
    note,
  })
  .strict()
  // The modes that need a weight per participant say so here, so the refusal
  // is precise instead of being "the shares do not add up".
  .refine((body) => !['amounts', 'percent'].includes(body.splitMode) || body.participants.every((p) => p.weight !== undefined), {
    message: 'This split mode needs a value for every participant',
    path: ['participants'],
  });

export const createSettlementSchema = z
  .object({
    fromId: z.string().uuid(),
    toId: z.string().uuid(),
    value: amountSchema.min(1),
    currency: currencySchema.optional(),
    settledAt: isoDate,
    note,
  })
  .strict()
  // Nobody settles with themselves: it would move no money and change nothing,
  // so it can only be a mistake. Refused here as well as in the service,
  // because MariaDB will not take it as a CHECK (both columns are foreign keys).
  .refine((body) => body.fromId !== body.toId, { message: 'A settlement needs two different members', path: ['toId'] });

export const deleteSharedSchema = z.object({ reason: reasonSchema.optional() }).strict();

export const sharedListQuerySchema = z
  .object({ page: z.coerce.number().int().min(1).max(10000).optional(), pageSize: z.coerce.number().int().min(1).max(100).optional() })
  .strict();

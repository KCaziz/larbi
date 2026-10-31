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
    // A planned expense has not happened yet: it may be dated ahead and counts
    // for nothing until it is confirmed (P9-04).
    planned: z.boolean().optional(),
    // The free unit of a split by usage, one per expense.
    usageUnit: z.string().trim().min(1).max(30).optional(),
    // One of the 19 collective categories (P9-05): what the common budget reads.
    collectiveCategory: z.string().regex(/^COLC-\d{2}$/).nullable().optional(),
    // Paid with personal money (P9-08): EITHER a personal expense is created on
    // the chosen account, OR an existing personal expense is designated — never
    // both, so the amount can never be counted twice in a personal budget.
    personalLink: z
      .object({ accountId: z.string().uuid().optional(), transactionId: z.string().uuid().optional() })
      .strict()
      .refine((link) => (link.accountId === undefined) !== (link.transactionId === undefined), { message: 'Give an account OR a transaction, not both' })
      .optional(),
  })
  .strict()
  // The modes that need a weight per participant say so here, so the refusal
  // is precise instead of being "the shares do not add up".
  .refine((body) => !['amounts', 'percent', 'weighted', 'usage'].includes(body.splitMode) || body.participants.every((p) => p.weight !== undefined), {
    message: 'This split mode needs a value for every participant',
    path: ['participants'],
  })
  .refine((body) => body.splitMode !== 'usage' || body.usageUnit !== undefined, {
    message: 'A split by usage names its unit',
    path: ['usageUnit'],
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

export const linkPersonalSchema = z.object({ transactionId: z.string().uuid() }).strict();

export const deleteSharedSchema = z.object({ reason: reasonSchema.optional() }).strict();

export const sharedListQuerySchema = z
  .object({ page: z.coerce.number().int().min(1).max(10000).optional(), pageSize: z.coerce.number().int().min(1).max(100).optional() })
  .strict();

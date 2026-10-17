import { z } from 'zod';
import { SHARING_LEVELS, SHAREABLE_KINDS, SPACE_KINDS, SPLIT_RULES } from '../constants/finSpace.js';
import { currencySchema, reasonSchema } from './finData.schemas.js';

// Shared spaces (P6-13). The vocabularies come from the constants, so what the
// database refuses and what validation refuses are the same lists.

const label = z.string().trim().min(1).max(80);
const note = z.string().trim().min(1).max(300).nullable().optional();
const displayName = z.string().trim().min(1).max(60).nullable().optional();

export const createSpaceSchema = z
  .object({
    kind: z.enum(SPACE_KINDS),
    label,
    currency: currencySchema,
    splitRule: z.enum(SPLIT_RULES).optional(),
    note,
    // The name the others will see. Optional, and deliberately separate from
    // the account's own name: joining a flatshare should not hand over one's
    // legal name.
    displayName,
  })
  .strict();

export const updateSpaceSchema = z
  .object({
    label: label.optional(),
    splitRule: z.enum(SPLIT_RULES).optional(),
    note,
    reason: reasonSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

// My own sharing matrix, kind by kind. A partial object is accepted — changing
// one kind should not require restating the others — and anything absent keeps
// the level it had.
export const sharingSchema = z
  .object(Object.fromEntries(SHAREABLE_KINDS.map((kind) => [kind, z.enum(SHARING_LEVELS).optional()])))
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to change' });

// Never `owner`: a space has exactly one, and neither an invitation nor a role
// change hands it over.
export const inviteSchema = z.object({ role: z.enum(['admin', 'member', 'viewer']) }).strict();
export const roleSchema = z.object({ role: z.enum(['admin', 'member', 'viewer']) }).strict();

// The token is the secret in the invitation link. Bounded, so a huge body is
// refused before anything is hashed.
export const acceptInviteSchema = z.object({ token: z.string().trim().min(16).max(200) }).strict();

export const leaveSchema = z.object({ reason: reasonSchema.optional() }).strict();

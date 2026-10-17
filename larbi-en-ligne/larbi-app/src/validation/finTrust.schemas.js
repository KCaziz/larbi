import { z } from 'zod';
import { SHAREABLE_KINDS } from '../constants/finSpace.js';

// Sensitive actions (P6-19): the consent is explicit on the call itself, and
// the password is the re-authentication the client asks for.
export const sensitiveActionSchema = z.object({ consent: z.literal(true), currentPassword: z.string().min(1) }).strict();

// Deletion asks for one more thing: typing the account's own e-mail, the same
// confirmation pattern a destructive action elsewhere in this project would
// use — a password alone is also what unlocks the session itself, so a
// second, different proof lowers the chance of an accidental click.
export const deleteAccountSchema = z.object({ consent: z.literal(true), currentPassword: z.string().min(1), email: z.string().email() }).strict();

export const withdrawSharingSchema = z.object({ spaceId: z.string().uuid(), kind: z.enum(SHAREABLE_KINDS), currentPassword: z.string().min(1) }).strict();

import bcrypt from 'bcryptjs';
import { HttpError } from './httpError.js';

// Re-authentication for sensitive actions (P6-19: export, account deletion,
// withdrawing a consent) — the same check the account already uses to change
// its own e-mail or password (auth.controller.js): a stolen open session must
// not be enough on its own for an action this consequential.
export async function assertCurrentPassword(req) {
  const { currentPassword } = req.body ?? {};
  if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
    throw new HttpError(403, 'Current password required', { reason: 'passwordRequired' });
  }
  const ok = await bcrypt.compare(currentPassword, req.user.passwordHash);
  if (!ok) throw new HttpError(403, 'Wrong password', { reason: 'wrongPassword' });
}

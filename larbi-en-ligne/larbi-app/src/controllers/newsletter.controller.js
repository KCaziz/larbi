import { HttpError } from '../utils/httpError.js';
import { confirm, subscribe, unsubscribe } from '../services/newsletter.service.js';

// PUBLIC newsletter API (no session).

// Always the same answer for a valid address (known, new, already confirmed...):
// the form cannot be used to find out who is subscribed.
export async function subscribeToNewsletter(req, res) {
  const { available } = await subscribe(req.body.email, req.body.locale);
  if (!available) throw new HttpError(503, 'The newsletter is not available yet', { reason: 'mail_unavailable' });
  res.status(202).json({ ok: true });
}

export async function confirmSubscription(req, res) {
  if (!(await confirm(req.body.token))) throw new HttpError(400, 'Invalid or expired link', { reason: 'invalid_link' });
  res.json({ ok: true });
}

export async function unsubscribeFromNewsletter(req, res) {
  if (!(await unsubscribe(req.body.token))) throw new HttpError(400, 'Invalid link', { reason: 'invalid_link' });
  res.json({ ok: true });
}

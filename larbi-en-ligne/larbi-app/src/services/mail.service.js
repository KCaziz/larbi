import { env } from '../config/env.js';

// Outgoing e-mail. NO provider is chosen yet (TASKS.md, blocking questions), so two
// honest drivers exist:
//   console : development and tests. Nothing leaves the machine: the message is kept in
//             `outbox` (tests read it) and printed to the server log (so a developer can
//             click the link by hand).
//   none    : production default. Sending fails with MailNotConfiguredError and the
//             caller tells the visitor the service is unavailable, instead of pretending.
// Wiring a real provider = adding one driver here; nothing else changes.
export class MailNotConfiguredError extends Error {
  constructor() {
    super('No e-mail provider is configured');
    this.name = 'MailNotConfiguredError';
  }
}

const OUTBOX_LIMIT = 100;
export const outbox = [];

const drivers = {
  async console(mail) {
    outbox.push({ ...mail, sentAt: new Date() });
    if (outbox.length > OUTBOX_LIMIT) outbox.shift();
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[mail:console] to=${mail.to} subject="${mail.subject}"\n${mail.text}\n`);
    }
  },
  async none() {
    throw new MailNotConfiguredError();
  },
};

export const mailAvailable = () => env.mailDriver !== 'none';

// mail = { to, subject, text, headers? }
export function sendMail(mail) {
  return drivers[env.mailDriver](mail);
}

import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Outgoing e-mail. Three drivers:
//   smtp    : production. Real mails, sent through the mailbox of the domain
//             (contact@fincludia.com) with the SMTP_* settings.
//   console : development and tests. Nothing leaves the machine: the message is kept in
//             `outbox` (tests read it) and printed to the server log (so a developer can
//             click the link by hand).
//   none    : production without a mailbox. Sending fails with MailNotConfiguredError and
//             the caller tells the visitor the service is unavailable, instead of pretending.
export class MailNotConfiguredError extends Error {
  constructor() {
    super('No e-mail provider is configured');
    this.name = 'MailNotConfiguredError';
  }
}

const OUTBOX_LIMIT = 100;
export const outbox = [];

let transport = null;
function smtpTransport() {
  transport ??= nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: { user: env.smtpUser, pass: env.smtpPassword },
  });
  return transport;
}

const drivers = {
  async smtp(mail) {
    await smtpTransport().sendMail({
      from: env.mailFrom,
      to: mail.to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      headers: mail.headers,
    });
  },
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

// mail = { to, subject, text, replyTo?, headers? }
export function sendMail(mail) {
  return drivers[env.mailDriver](mail);
}

// Checks the SMTP connection and login without sending anything
// (`npm run mail:check`).
export function verifyMailTransport() {
  if (env.mailDriver !== 'smtp') return Promise.resolve(false);
  return smtpTransport().verify();
}

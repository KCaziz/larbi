import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { mailAvailable, sendMail } from '../services/mail.service.js';

// The message is always stored (the administration reads it); when a mailbox is
// configured it is also forwarded there, with the visitor as « reply-to » so the
// team answers straight from its mail client. A mail failure never loses the
// message nor fails the visitor's request.
export async function createContactMessage(req, res, next) {
  try {
    const { name, email, message } = req.body;
    await prisma.contactMessage.create({ data: { name, email, message } });
    if (env.contactInbox && mailAvailable()) {
      sendMail({
        to: env.contactInbox,
        replyTo: email,
        subject: `[FINCLUDIA] Message de ${name}`,
        text: `Nom : ${name}\nAdresse : ${email}\n\n${message}\n`,
      }).catch((err) => console.error('[mail] contact forward failed:', err.message));
    }
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

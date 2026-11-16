// Checks the e-mail settings of the server (SMTP_* in .env).
//   npm run mail:check                       connects and logs in, sends nothing
//   npm run mail:check -- someone@example.com   also sends a test message there
import { env } from '../src/config/env.js';
import { sendMail, verifyMailTransport } from '../src/services/mail.service.js';

const [to] = process.argv.slice(2);

if (env.mailDriver !== 'smtp') {
  console.error(`MAIL_DRIVER is "${env.mailDriver}": set MAIL_DRIVER=smtp and the SMTP_* values in .env first.`);
  process.exit(2);
}

try {
  await verifyMailTransport();
  console.log(`OK: connected to ${env.smtpHost}:${env.smtpPort} as ${env.smtpUser}.`);
  if (to) {
    await sendMail({ to, subject: 'FINCLUDIA : message de test', text: 'Ce message confirme que le site peut envoyer des e-mails.\n' });
    console.log(`OK: test message sent to ${to}.`);
  }
} catch (err) {
  console.error(`FAILED: ${err.message}`);
  process.exit(1);
}

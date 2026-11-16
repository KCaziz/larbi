import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The contact form: always stored, and forwarded to the team's mailbox
// (CONTACT_INBOX, contact@fincludia.com in production) when one is set, with the
// visitor as « reply-to ».

let t;
let env;
let outbox;

before(async () => {
  t = await boot();
  ({ env } = await import('../../src/config/env.js'));
  ({ outbox } = await import('../../src/services/mail.service.js'));
  await t.reset();
});
after(() => {
  env.contactInbox = null;
  return t.close();
});

const message = { name: 'Samia', email: 'samia@example.com', message: 'Bonjour, je voudrais une démonstration pour mon entreprise.' };
const until = async (check) => {
  for (let i = 0; i < 50 && !check(); i += 1) await new Promise((resolve) => setTimeout(resolve, 20));
};

describe('the contact form and the mailbox', () => {
  test('without a mailbox the message is stored, and no mail is sent', async () => {
    env.contactInbox = null;
    const before = outbox.length;
    const res = await t.request('POST', '/contact', { json: message });
    assert.equal(res.status, 201);
    assert.equal(await t.prisma.contactMessage.count({ where: { email: message.email } }), 1);
    assert.equal(outbox.length, before);
  });

  test('with a mailbox the message is stored AND forwarded there, the visitor as reply-to', async () => {
    env.contactInbox = 'contact@fincludia.com';
    const res = await t.request('POST', '/contact', { json: { ...message, email: 'karim@example.com', name: 'Karim' } });
    assert.equal(res.status, 201);
    assert.equal(await t.prisma.contactMessage.count({ where: { email: 'karim@example.com' } }), 1);
    await until(() => outbox.some((mail) => mail.to === 'contact@fincludia.com'));
    const mail = outbox.findLast((m) => m.to === 'contact@fincludia.com');
    assert.ok(mail, 'forwarded to the mailbox');
    assert.equal(mail.replyTo, 'karim@example.com');
    assert.match(mail.subject, /Karim/);
    assert.match(mail.text, /démonstration/);
  });
});

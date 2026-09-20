import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P3-05 — the newsletter in PRODUCTION mode. No e-mail provider is chosen yet, so the
// default driver is "none": the site must say so instead of pretending a mail was sent.

let t;
before(async () => {
  t = await boot({ production: true });
  await t.reset();
});
after(() => t.close());

describe('no e-mail provider configured', () => {
  test('subscribing answers 503 (the page shows "not available yet") and stores nothing', async () => {
    const res = await t.request('POST', '/newsletter/subscribe', { json: { email: 'prod@example.com' } });
    assert.equal(res.status, 503);
    assert.equal(await t.prisma.newsletterSubscriber.count(), 0);
  });

  test('the production error carries no stack and no internal detail', async () => {
    const res = await t.request('POST', '/newsletter/subscribe', { json: { email: 'prod@example.com' } });
    assert.doesNotMatch(res.text, /stack|at .*\.js|MailNotConfigured/i);
  });

  test('the preparation of a mailing tells the administrator that sending is not available', async () => {
    const admin = await t.admin();
    const res = await t.request('GET', '/admin/newsletter/digest', { user: admin });
    assert.equal(res.status, 200);
    assert.equal(res.body.digest.sendingAvailable, false);
  });
});

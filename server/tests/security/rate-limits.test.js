import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { PNG, fileForm } from '../helpers/fixtures.js';
import { captureConsole } from '../helpers/log.js';
import { boot } from '../helpers/server.js';

// Abuse limits. The application reads its limits when it starts, so this file
// boots a server with LOW limits (see `extra`) and checks each one.

const LIMITS = { AUTH_RATE_LIMIT: '5', CONTACT_RATE_LIMIT: '3', CERTIFICATE_RATE_LIMIT: '4', MEDIA_RATE_LIMIT: '8', MEDIA_DENIED_LIMIT: '4', PUBLIC_READ_LIMIT: '6', NEWSLETTER_RATE_LIMIT: '3', NEWSLETTER_LINK_RATE_LIMIT: '3' };

let t;
let log;
before(async () => {
  log = captureConsole('warn');
  t = await boot({ extra: LIMITS });
  await t.reset();
});
after(async () => {
  log.restore();
  await t.close();
});

const statuses = async (n, fn) => {
  const out = [];
  for (let i = 0; i < n; i += 1) out.push((await fn(i)).status);
  return out;
};

describe('authentication', () => {
  test('login attempts are limited per address: 5 allowed, then 429 — even with the right password', async () => {
    const email = `${t.unique('rl')}@example.com`;
    const reg = await t.request('POST', '/auth/register', { json: { name: 'R', email, password: 'motdepasse-long', accountType: 'pme' } });
    assert.equal(reg.status, 201, 'registration counts as attempt 1');
    const seq = await statuses(6, () => t.request('POST', '/auth/login', { json: { email, password: 'faux-mot-de-passe' } }));
    assert.deepEqual(seq, [401, 401, 401, 401, 429, 429]);
    const rightPassword = await t.request('POST', '/auth/login', { json: { email, password: 'motdepasse-long' } });
    assert.equal(rightPassword.status, 429, 'the lock does not depend on the password being wrong');
    assert.ok(rightPassword.headers.get('ratelimit-limit') || rightPassword.headers.get('ratelimit-policy'), 'the client is told the limit');
    assert.doesNotMatch(rightPassword.text, /stack|password|email/i);
  });
});

describe('public forms and lookups', () => {
  test('contact form: 3 messages, then 429 (nothing stored beyond the limit)', async () => {
    const send = () => t.request('POST', '/contact', { json: { name: 'A', email: 'a@example.com', message: 'Bonjour' } });
    assert.deepEqual(await statuses(5, send), [201, 201, 201, 429, 429]);
    assert.equal(await t.prisma.contactMessage.count(), 3);
  });

  test('certificate verification: 4 lookups, then 429', async () => {
    const seq = await statuses(6, () => t.request('GET', '/certificates/LARBI-AAAA-BBBB-CCCC'));
    assert.deepEqual(seq, [404, 404, 404, 404, 429, 429]);
  });

  test('public blog: 6 reads per minute per address, shared by every blog route', async () => {
    const paths = ['/blog/articles', '/blog/categories', '/blog/tags', '/blog/articles/x', '/blog/articles', '/blog/categories', '/blog/articles', '/blog/tags'];
    const seq = await statuses(paths.length, (i) => t.request('GET', paths[i]));
    assert.deepEqual(seq.slice(0, 6), [200, 200, 200, 404, 200, 200]);
    assert.deepEqual(seq.slice(6), [429, 429]);
  });
});

describe('protected files', () => {
  let admin;
  let f;
  let A;
  let B;
  let C;
  before(async () => {
    admin = await t.admin();
    A = await t.user();
    B = await t.user();
    C = await t.user();
    f = (await t.request('POST', '/admin/formations', { user: admin, json: { title: 'Limites' } })).body.formation;
    const course = (await t.request('POST', `/admin/formations/${f.id}/courses`, { user: admin, json: { title: 'L' } })).body.course;
    const media = (await t.request('POST', `/admin/courses/${course.id}/media`, { user: admin, form: fileForm(PNG) })).body.media;
    await t.prisma.formation.update({ where: { id: f.id }, data: { status: 'published', publishedAt: new Date() } });
    f = { ...f, slug: (await t.prisma.formation.findUnique({ where: { id: f.id } })).slug, media };
    await t.request('POST', `/learn/formations/${f.slug}/enroll`, { user: A });
    await t.request('POST', `/learn/formations/${f.slug}/enroll`, { user: C });
  });

  test('repeated REFUSED requests lock the account out (probing): 4 refusals, then 429', async () => {
    const seq = await statuses(7, () => t.request('GET', `/learn/media/${f.media.id}`, { user: B }));
    assert.deepEqual(seq, [403, 403, 403, 403, 429, 429, 429]);
  });

  test('the lock-out is per account: another learner is not affected', async () => {
    assert.equal((await t.request('GET', `/learn/media/${f.media.id}`, { user: A })).status, 200);
  });

  test('successful reads are never counted as refusals, but the volume is capped: 8 per minute', async () => {
    const seq = await statuses(10, () => t.request('GET', `/learn/media/${f.media.id}`, { user: C }));
    assert.deepEqual(seq.slice(0, 8), Array(8).fill(200));
    assert.deepEqual(seq.slice(8), [429, 429]);
  });

  test('covers share the volume limit', async () => {
    const seq = await statuses(3, () => t.request('GET', `/learn/formations/${f.slug}/cover`, { user: C }));
    assert.ok(seq.every((s) => s === 429), 'C already used up its volume');
  });

  test('lock-outs and refusals are traced with identifiers only', () => {
    const events = log.events();
    const denied = events.filter((e) => e.event === 'media_access_denied' && e.userId === B.id);
    assert.equal(denied.length, 4);
    assert.ok(denied.every((e) => e.mediaId === f.media.id && e.reason === 'not_enrolled'));
    const blocked = events.filter((e) => e.event === 'media_probing_blocked');
    assert.deepEqual(blocked.map((e) => e.userId), [B.id], 'traced once per lock-out, not once per blocked request');
    const raw = JSON.stringify(events);
    assert.doesNotMatch(raw, /@test\.local|storage|\.png|originalName/);
  });
});

describe('newsletter', () => {
  test('the subscription form is limited per IP (mail bombing): 3 allowed, then 429', async () => {
    const seq = await statuses(5, (i) => t.request('POST', '/newsletter/subscribe', { json: { email: `spam${i}@example.com` } }));
    assert.deepEqual(seq, [202, 202, 202, 429, 429]);
    assert.equal(await t.prisma.newsletterSubscriber.count(), 3, 'refused requests store nothing');
  });

  test('confirmation / unsubscription links are limited too', async () => {
    const seq = await statuses(5, () => t.request('POST', '/newsletter/confirm', { json: { token: 'x'.repeat(40) } }));
    assert.deepEqual(seq, [400, 400, 400, 429, 429]);
  });
});

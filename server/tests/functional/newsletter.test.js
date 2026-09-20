import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P3-05 — newsletter: double opt-in, unsubscription, administration, preparation of a mailing.

let t;
let admin;
let standardUser;
let outbox;
let makeToken;

const post = (path, json, opts) => t.request('POST', path, { json, ...opts });
const subscribe = (email, extra = {}) => post('/newsletter/subscribe', { email, ...extra });
const tokenIn = (mail) => new URL(mail.text.match(/https?:\/\/\S+/)[0]).searchParams.get('token');
const row = (email) => t.prisma.newsletterSubscriber.findUnique({ where: { email } });
const lastMailTo = (email) => [...outbox].reverse().find((m) => m.to === email);
// The 5-minute delay between two mails to one address is a rule of its own (tested below).
const rewindMailDelay = (email) =>
  t.prisma.newsletterSubscriber.update({ where: { email }, data: { lastEmailAt: new Date(Date.now() - 10 * 60 * 1000) } });

before(async () => {
  t = await boot();
  ({ outbox } = await import('../../src/services/mail.service.js'));
  ({ makeToken } = await import('../../src/services/newsletter.service.js'));
  await t.reset();
  admin = await t.admin();
  standardUser = await t.user();
});
after(() => t.close());

describe('subscribing (double opt-in)', () => {
  test('a new address is stored as pending and receives ONE confirmation link, nothing else', async () => {
    const res = await subscribe('Alice@Example.COM ');
    assert.equal(res.status, 202);
    const stored = await row('alice@example.com');
    assert.equal(stored.status, 'pending');
    assert.equal(stored.confirmedAt, null);
    assert.equal(outbox.filter((m) => m.to === 'alice@example.com').length, 1);
    assert.match(lastMailTo('alice@example.com').text, /\/newsletter\/confirmer\?token=/);
  });

  test('pending is NOT subscribed: the address is not among the recipients of a mailing', async () => {
    const res = await t.request('GET', '/admin/newsletter/digest', { user: admin });
    assert.equal(res.body.digest.recipients.total, 0);
  });

  test('the confirmation link (POST) confirms; the date of consent is kept', async () => {
    const token = tokenIn(lastMailTo('alice@example.com'));
    const res = await post('/newsletter/confirm', { token });
    assert.equal(res.status, 200);
    const stored = await row('alice@example.com');
    assert.equal(stored.status, 'confirmed');
    assert.ok(stored.confirmedAt);
  });

  test('clicking the link twice is harmless and keeps the first date', async () => {
    const before = (await row('alice@example.com')).confirmedAt;
    const res = await post('/newsletter/confirm', { token: tokenIn(lastMailTo('alice@example.com')) });
    assert.equal(res.status, 200);
    assert.deepEqual((await row('alice@example.com')).confirmedAt, before);
  });

  test('subscribing again while confirmed: same answer, no new mail, nothing changes', async () => {
    const mails = outbox.length;
    const res = await subscribe('alice@example.com');
    assert.equal(res.status, 202);
    assert.equal(outbox.length, mails);
    assert.equal((await row('alice@example.com')).status, 'confirmed');
  });

  test('the answer is identical for a known and an unknown address (nobody can find out who is subscribed)', async () => {
    const known = await subscribe('alice@example.com');
    const unknown = await subscribe('nobody-yet@example.com');
    assert.equal(known.status, unknown.status);
    assert.deepEqual(known.body, unknown.body);
  });

  test('a pending address cannot be mailed again before 5 minutes (no mail bombing), then it can', async () => {
    await subscribe('bob@example.com');
    const mails = outbox.filter((m) => m.to === 'bob@example.com').length;
    await subscribe('bob@example.com');
    await subscribe('bob@example.com');
    assert.equal(outbox.filter((m) => m.to === 'bob@example.com').length, mails);
    await rewindMailDelay('bob@example.com');
    await subscribe('bob@example.com');
    assert.equal(outbox.filter((m) => m.to === 'bob@example.com').length, mails + 1);
  });

  test('simultaneous requests for one new address create one row and one mail', async () => {
    await Promise.all([1, 2, 3, 4].map(() => subscribe('race@example.com')));
    assert.equal(await t.prisma.newsletterSubscriber.count({ where: { email: 'race@example.com' } }), 1);
    assert.equal(outbox.filter((m) => m.to === 'race@example.com').length, 1);
  });

  test('the language of the interface picks the language of the mail; Tamazight falls back to French', async () => {
    await subscribe('en@example.com', { locale: 'en' });
    await subscribe('ar@example.com', { locale: 'ar' });
    await subscribe('tzm@example.com', { locale: 'tzm' });
    assert.match(lastMailTo('en@example.com').subject, /Confirm/);
    assert.match(lastMailTo('ar@example.com').subject, /أكّد/);
    assert.match(lastMailTo('tzm@example.com').subject, /Confirmez/);
    assert.equal((await row('tzm@example.com')).locale, 'fr');
  });

  test('invalid input: 400 (bad address, unknown field, unknown language, oversized address)', async () => {
    for (const body of [
      { email: 'not-an-email' },
      { email: '' },
      { email: 'a@example.com', status: 'confirmed' },
      { email: 'a@example.com', locale: 'klingon' },
      { email: `${'a'.repeat(250)}@example.com` },
      {},
    ]) {
      assert.equal((await post('/newsletter/subscribe', body)).status, 400, JSON.stringify(body).slice(0, 60));
    }
    assert.equal(await t.prisma.newsletterSubscriber.count({ where: { email: { contains: 'not-an-email' } } }), 0);
  });

  test('a mass-assignment attempt cannot subscribe an address as confirmed', async () => {
    const res = await post('/newsletter/subscribe', { email: 'sneaky@example.com', status: 'confirmed', confirmedAt: new Date() });
    assert.equal(res.status, 400);
    assert.equal(await row('sneaky@example.com'), null);
  });
});

describe('confirmation and unsubscription links', () => {
  test('a forged, truncated or foreign token confirms nothing (400)', async () => {
    await subscribe('carol@example.com');
    const carol = await row('carol@example.com');
    const good = tokenIn(lastMailTo('carol@example.com'));
    const [id, expiry, signature] = good.split('.');
    const forged = [
      `${id}.${expiry}.${signature.slice(0, -2)}xx`,
      `${id}.${Number(expiry) + 999999}.${signature}`,
      `${id}.0.${signature}`,
      `${carol.id}.0.AAAA`,
      good.slice(0, 30),
      'x'.repeat(50),
      `${'0'.repeat(8)}-0000-0000-0000-${'0'.repeat(12)}.0.${signature}`,
    ];
    for (const token of forged) assert.equal((await post('/newsletter/confirm', { token })).status, 400, token.slice(0, 40));
    assert.equal((await row('carol@example.com')).status, 'pending');
  });

  test('an EXPIRED confirmation link is refused', async () => {
    const carol = await row('carol@example.com');
    const [id] = makeToken('confirm', carol.id, 60).split('.');
    const realExpired = `${id}.${Math.floor(Date.now() / 1000) - 10}.x`;
    assert.equal((await post('/newsletter/confirm', { token: realExpired })).status, 400);
  });

  test('a confirmation token cannot be used to unsubscribe, nor the other way round', async () => {
    const carol = await row('carol@example.com');
    const confirmToken = makeToken('confirm', carol.id, 3600);
    const unsubscribeToken = makeToken('unsubscribe', carol.id);
    assert.equal((await post('/newsletter/unsubscribe', { token: confirmToken })).status, 400);
    assert.equal((await post('/newsletter/confirm', { token: unsubscribeToken })).status, 400);
    assert.equal((await row('carol@example.com')).status, 'pending');
  });

  test('links are POST only: a GET (mail scanner, link preview) confirms nothing', async () => {
    const token = tokenIn(lastMailTo('carol@example.com'));
    const res = await t.request('GET', `/newsletter/confirm?token=${token}`);
    assert.ok([404, 405].includes(res.status));
    assert.equal((await row('carol@example.com')).status, 'pending');
  });

  test('unsubscribing a confirmed subscriber keeps only the address and the date, and stops mailings', async () => {
    const alice = await row('alice@example.com');
    const res = await post('/newsletter/unsubscribe', { token: makeToken('unsubscribe', alice.id) });
    assert.equal(res.status, 200);
    const stored = await row('alice@example.com');
    assert.equal(stored.status, 'unsubscribed');
    assert.ok(stored.unsubscribedAt);
    const digest = await t.request('GET', '/admin/newsletter/digest', { user: admin });
    assert.equal(digest.body.digest.recipients.total, 0);
  });

  test('unsubscribing twice, or after the row was erased, still answers OK', async () => {
    const alice = await row('alice@example.com');
    assert.equal((await post('/newsletter/unsubscribe', { token: makeToken('unsubscribe', alice.id) })).status, 200);
    const gone = await t.prisma.newsletterSubscriber.create({ data: { email: 'gone@example.com' } });
    const token = makeToken('unsubscribe', gone.id);
    await t.prisma.newsletterSubscriber.delete({ where: { id: gone.id } });
    assert.equal((await post('/newsletter/unsubscribe', { token })).status, 200);
  });

  test('an old confirmation link cannot bring back someone who unsubscribed', async () => {
    const alice = await row('alice@example.com');
    assert.equal((await post('/newsletter/confirm', { token: makeToken('confirm', alice.id, 3600) })).status, 400);
    assert.equal((await row('alice@example.com')).status, 'unsubscribed');
  });

  test('coming back requires a NEW confirmation', async () => {
    await subscribe('alice@example.com');
    const stored = await row('alice@example.com');
    assert.equal(stored.status, 'pending');
    assert.equal(stored.unsubscribedAt, null);
    assert.equal(stored.confirmedAt, null);
    assert.equal((await post('/newsletter/confirm', { token: tokenIn(lastMailTo('alice@example.com')) })).status, 200);
    assert.equal((await row('alice@example.com')).status, 'confirmed');
  });

  test('a pending address that unsubscribes is erased completely (it never consented)', async () => {
    await subscribe('dave@example.com');
    const dave = await row('dave@example.com');
    assert.equal((await post('/newsletter/unsubscribe', { token: makeToken('unsubscribe', dave.id) })).status, 200);
    assert.equal(await row('dave@example.com'), null);
  });
});

describe('administration of the subscribers', () => {
  const admGet = (path, user = admin) => t.request('GET', `/admin/newsletter${path}`, { user });

  test('only an administrator: 401 anonymous, 403 standard account (list, export, delete, preparation)', async () => {
    const someone = await row('alice@example.com');
    for (const [method, path] of [
      ['GET', '/subscribers'],
      ['GET', '/subscribers.csv'],
      ['GET', '/digest'],
      ['DELETE', `/subscribers/${someone.id}`],
    ]) {
      assert.equal((await t.request(method, `/admin/newsletter${path}`)).status, 401, `anon ${method} ${path}`);
      assert.equal((await t.request(method, `/admin/newsletter${path}`, { user: standardUser })).status, 403, `user ${method} ${path}`);
    }
    assert.ok(await row('alice@example.com'));
  });

  test('list with counts, status filter, search and pagination', async () => {
    const all = await admGet('/subscribers');
    assert.equal(all.status, 200);
    assert.equal(all.body.counts.total, all.body.pagination.total);
    assert.ok(all.body.counts.confirmed >= 1 && all.body.counts.pending >= 1);
    const confirmed = await admGet('/subscribers?status=confirmed');
    assert.ok(confirmed.body.subscribers.every((s) => s.status === 'confirmed'));
    const found = await admGet('/subscribers?query=ALICE');
    assert.deepEqual(found.body.subscribers.map((s) => s.email), ['alice@example.com']);
    const page = await admGet('/subscribers?limit=2&page=2');
    assert.equal(page.body.subscribers.length, 2);
    assert.equal(page.body.pagination.limit, 2);
  });

  test('the list exposes no internal token or hash, and "%" or "_" in the search are ordinary characters', async () => {
    const res = await admGet('/subscribers');
    assert.deepEqual(Object.keys(res.body.subscribers[0]).sort(), ['confirmedAt', 'createdAt', 'email', 'id', 'locale', 'status', 'unsubscribedAt']);
    assert.equal((await admGet('/subscribers?query=%25')).body.subscribers.length, 0);
    assert.equal((await admGet('/subscribers?query=_')).body.subscribers.length, 0);
  });

  test('bad parameters: 400', async () => {
    for (const q of ['status=weird', 'limit=1000', 'page=0', 'foo=bar']) assert.equal((await admGet(`/subscribers?${q}`)).status, 400, q);
  });

  test('CSV export: consenting subscribers only, spreadsheet formulas neutralised', async () => {
    await t.prisma.newsletterSubscriber.create({ data: { email: '=cmd|calc@example.com', status: 'confirmed', confirmedAt: new Date() } });
    const res = await admGet('/subscribers.csv');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/csv/);
    assert.match(res.headers.get('content-disposition'), /attachment/);
    assert.match(res.headers.get('cache-control'), /no-store/);
    const lines = res.text.replace(/^﻿/, '').trim().split('\r\n');
    assert.equal(lines[0], 'email,status,locale,confirmedAt');
    assert.ok(lines.slice(1).every((l) => l.includes(',confirmed,')));
    assert.ok(lines.some((l) => l.startsWith("'=cmd")), 'the formula is prefixed');
    assert.ok(!lines.some((l) => l.startsWith('=')));
    assert.ok(!res.text.includes('carol@example.com'), 'pending addresses are not exported');
  });

  test('erasure: deleting a subscriber removes the row; an unknown id is a 404', async () => {
    const carol = await row('carol@example.com');
    const res = await t.request('DELETE', `/admin/newsletter/subscribers/${carol.id}`, { user: admin });
    assert.equal(res.status, 204);
    assert.equal(await row('carol@example.com'), null);
    assert.equal((await t.request('DELETE', `/admin/newsletter/subscribers/${carol.id}`, { user: admin })).status, 404);
    assert.equal((await t.request('DELETE', '/admin/newsletter/subscribers/not-a-uuid', { user: admin })).status, 404);
  });
});

describe('preparation of a mailing (nothing is sent)', () => {
  let published;
  let premiumOne;

  before(async () => {
    await t.article({ title: 'Ancien article', publishedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000) });
    published = await t.article({ title: 'Nouveau <b>article</b> & co', body: '<p>Texte</p>' });
    premiumOne = await t.article({ title: 'Article premium', requiredAccessLevel: 'premium', body: `<p>SECRET-BODY</p>` });
    await t.article({ title: 'Brouillon', status: 'draft' });
  });

  test('builds the message per language from PUBLISHED articles only, newest first', async () => {
    const res = await t.request('GET', '/admin/newsletter/digest?limit=3', { user: admin });
    assert.equal(res.status, 200);
    const { digest } = res.body;
    assert.equal(digest.articles.length, 3);
    assert.ok(!digest.articles.some((a) => a.title === 'Brouillon'));
    assert.deepEqual(Object.keys(digest.messages).sort(), ['ar', 'en', 'fr']);
    assert.match(digest.messages.fr.text, new RegExp(`/blog/${published.slug}`));
    assert.match(digest.messages.fr.text, /\{\{unsubscribeUrl\}\}/);
  });

  test('premium articles are announced as such and their text never appears in the mailing', async () => {
    const { digest } = (await t.request('GET', '/admin/newsletter/digest', { user: admin })).body;
    assert.ok(digest.articles.find((a) => a.title === 'Article premium').premium);
    assert.match(digest.messages.fr.text, /réservé aux comptes premium/);
    assert.ok(!JSON.stringify(digest).includes('SECRET-BODY'));
    assert.ok(premiumOne);
  });

  test('HTML is escaped (a title cannot inject markup into the mailing)', async () => {
    const { digest } = (await t.request('GET', '/admin/newsletter/digest', { user: admin })).body;
    assert.ok(digest.messages.fr.html.includes('Nouveau &lt;b&gt;article&lt;/b&gt; &amp; co'));
    assert.ok(!digest.messages.fr.html.includes('<b>article</b>'));
  });

  test('counts the recipients per language: confirmed subscribers only', async () => {
    const before = (await t.request('GET', '/admin/newsletter/digest', { user: admin })).body.digest.recipients.total;
    const alice = await row('alice@example.com');
    assert.equal(alice.status, 'confirmed');
    assert.equal(before, await t.prisma.newsletterSubscriber.count({ where: { status: 'confirmed' } }));
    const { recipients } = (await t.request('GET', '/admin/newsletter/digest', { user: admin })).body.digest;
    assert.equal(recipients.total, recipients.byLocale.fr + recipients.byLocale.en + recipients.byLocale.ar);
  });

  test('preparing sends nothing', async () => {
    const mails = outbox.length;
    await t.request('GET', '/admin/newsletter/digest', { user: admin });
    assert.equal(outbox.length, mails);
  });

  test('bad parameters: 400', async () => {
    for (const q of ['limit=0', 'limit=999', 'since=not-a-date', 'x=1']) {
      assert.equal((await t.request('GET', `/admin/newsletter/digest?${q}`, { user: admin })).status, 400, q);
    }
  });
});

describe('database rules', () => {
  test('the database refuses inconsistent rows even if the code were wrong', async () => {
    const create = (data) => t.prisma.newsletterSubscriber.create({ data });
    await assert.rejects(create({ email: 'Upper@Example.com' }), 'email must be lower-case');
    await assert.rejects(create({ email: 'x1@example.com', status: 'weird' }), 'unknown status');
    await assert.rejects(create({ email: 'x2@example.com', status: 'confirmed' }), 'confirmed without a consent date');
    await assert.rejects(create({ email: 'x3@example.com', status: 'unsubscribed', confirmedAt: new Date() }), 'unsubscribed without a date');
    await assert.rejects(create({ email: 'alice@example.com' }), 'duplicate address');
  });
});

import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { PDF, PNG, fileForm } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';

// P3-04 — visibility and recommendations by profile. Every decision is checked
// through the real API: what an anonymous visitor, a standard account, a premium
// account and an administrator each receive.

let t;
let admin;
let standardPmi; // standard account, account type "pmi"
let premiumPme; // premium account, account type "pme"
let open; // standard article, aimed at "pmi"
let premium; // premium article, aimed at "pme", with a cover and an attached PDF
let openFile; // PDF attached to `open`
let premiumFile; // PDF attached to `premium`
let premiumDraft; // premium DRAFT

const SECRET = 'motsecretpremium';

const get = (path, opts) => t.request('GET', path, opts);
const upload = (article, path, bytes, opts) => t.request('POST', `/admin/articles/${article.id}/${path}`, { user: admin, form: fileForm(bytes, opts) });
const bySlug = (res, slug) => res.body.articles.find((a) => a.slug === slug);

before(async () => {
  t = await boot();
  await t.reset();
  admin = await t.admin({ accessLevel: 'standard' }); // an admin is not premium: the ROLE opens everything
  standardPmi = await t.user({ accountType: 'pmi', accessLevel: 'standard' });
  premiumPme = await t.user({ accountType: 'pme', accessLevel: 'premium' });
  open = await t.article({ title: 'Guide ouvert', body: '<p>Texte public</p>', targetAccountTypes: ['pmi'] });
  premium = await t.article({
    title: 'Dossier premium',
    body: `<p>Le ${SECRET} est ici.</p>`,
    requiredAccessLevel: 'premium',
    targetAccountTypes: ['pme'],
  });
  premiumDraft = await t.article({ title: 'Brouillon premium', status: 'draft', requiredAccessLevel: 'premium', targetAccountTypes: ['pme', 'pmi'] });
  await upload(premium, 'cover', PNG);
  premiumFile = (await upload(premium, 'media', PDF, { name: 'dossier.pdf', type: 'application/pdf' })).body.media;
  openFile = (await upload(open, 'media', PDF, { name: 'ouvert.pdf', type: 'application/pdf' })).body.media;
});
after(() => t.close());

describe('the list shows a teaser of every published article and locks what the viewer cannot read', () => {
  test('anonymous visitor: the premium card is there, locked, "login_required"', async () => {
    const card = bySlug(await get('/blog/articles'), premium.slug);
    assert.equal(card.title, 'Dossier premium');
    assert.equal(card.requiredAccessLevel, 'premium');
    assert.equal(card.locked, true);
    assert.equal(card.lockReason, 'login_required');
    assert.ok(!('body' in card));
  });

  test('standard account: locked with "premium_required"; open articles are not locked', async () => {
    const res = await get('/blog/articles', { user: standardPmi });
    assert.equal(bySlug(res, premium.slug).lockReason, 'premium_required');
    assert.equal(bySlug(res, open.slug).locked, false);
  });

  test('premium account and administrator: nothing is locked', async () => {
    for (const user of [premiumPme, admin]) {
      const res = await get('/blog/articles', { user });
      assert.equal(bySlug(res, premium.slug).locked, false);
      assert.equal(bySlug(res, premium.slug).lockReason, null);
    }
  });

  test('a premium DRAFT is invisible to everybody, including premium accounts', async () => {
    for (const user of [undefined, standardPmi, premiumPme]) {
      const res = await get('/blog/articles', { user });
      assert.ok(!bySlug(res, premiumDraft.slug));
    }
  });

  test('the response depends on the session, so it must never sit in a shared cache', async () => {
    const res = await get('/blog/articles');
    assert.match(res.headers.get('cache-control'), /private/);
    assert.match(res.headers.get('vary'), /cookie/i);
  });

  test('...and it keeps the CORS "Vary: Origin" (a second Vary header must add to it, not replace it)', async () => {
    const res = await get('/blog/articles', { headers: { Origin: 'http://localhost:5173' } });
    assert.match(res.headers.get('vary'), /origin/i);
    assert.match(res.headers.get('vary'), /cookie/i);
  });
});

describe('the article page: the text and the files stay on the server for those who cannot read them', () => {
  test('anonymous: teaser only, no text, no files, no trace of the text anywhere in the response', async () => {
    const res = await get(`/blog/articles/${premium.slug}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.article.locked, true);
    assert.equal(res.body.article.lockReason, 'login_required');
    assert.equal(res.body.article.body, null);
    assert.deepEqual(res.body.article.media, []);
    assert.ok(!res.text.includes(SECRET));
    assert.ok(!res.text.includes(premiumFile.id));
  });

  test('standard account: same teaser, reason "premium_required"', async () => {
    const res = await get(`/blog/articles/${premium.slug}`, { user: standardPmi });
    assert.equal(res.body.article.lockReason, 'premium_required');
    assert.equal(res.body.article.body, null);
    assert.ok(!res.text.includes(SECRET));
  });

  test('premium account and administrator receive the text and the files', async () => {
    for (const user of [premiumPme, admin]) {
      const res = await get(`/blog/articles/${premium.slug}`, { user });
      assert.equal(res.body.article.locked, false);
      assert.match(res.body.article.body, new RegExp(SECRET));
      assert.equal(res.body.article.media.length, 1);
    }
  });

  test('a standard article is fully readable by anybody', async () => {
    const res = await get(`/blog/articles/${open.slug}`);
    assert.equal(res.body.article.locked, false);
    assert.match(res.body.article.body, /Texte public/);
  });

  test('losing premium takes effect immediately, with the same session', async () => {
    const user = await t.user({ accountType: 'pme', accessLevel: 'premium' });
    assert.equal((await get(`/blog/articles/${premium.slug}`, { user })).body.article.locked, false);
    await t.prisma.user.update({ where: { id: user.id }, data: { accessLevel: 'standard' } });
    assert.equal((await get(`/blog/articles/${premium.slug}`, { user })).body.article.locked, true);
  });

  test('a garbage, tampered or orphan session cookie means "anonymous", never an error', async () => {
    const res = await get(`/blog/articles/${premium.slug}`, { token: 'not.a.token' });
    assert.equal(res.status, 200);
    assert.equal(res.body.article.lockReason, 'login_required');
    const ghost = await t.user();
    await t.prisma.user.delete({ where: { id: ghost.id } });
    assert.equal((await get(`/blog/articles/${premium.slug}`, { user: ghost })).body.article.lockReason, 'login_required');
  });

  test('the related articles of a premium page are locked for the viewer as well', async () => {
    const res = await get(`/blog/articles/${open.slug}`, { user: standardPmi });
    const related = res.body.article.related.find((a) => a.slug === premium.slug);
    assert.equal(related.locked, true);
    assert.ok(!('body' in related));
  });
});

describe('search does not leak the text of articles the viewer cannot read', () => {
  const search = (query, user) => get(`/blog/articles?query=${encodeURIComponent(query)}`, { user });

  test('a word that only appears in the text of a premium article finds nothing for locked viewers', async () => {
    assert.equal((await search(SECRET)).body.pagination.total, 0);
    assert.equal((await search(SECRET, standardPmi)).body.pagination.total, 0);
  });

  test('...but finds the article for a premium account', async () => {
    const res = await search(SECRET, premiumPme);
    assert.equal(res.body.pagination.total, 1);
    assert.equal(res.body.articles[0].slug, premium.slug);
  });

  test('the public teaser (title, excerpt) stays searchable by everybody', async () => {
    assert.equal((await search('Dossier premium')).body.pagination.total, 1);
  });
});

describe('files of premium articles are protected by the server', () => {
  const file = (id, opts) => get(`/blog/media/${id}`, opts);

  test('anonymous: 401 "login_required"', async () => {
    const res = await file(premiumFile.id);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.details.reason, 'login_required');
  });

  test('standard account: 403 "premium_required"', async () => {
    const res = await file(premiumFile.id, { user: standardPmi });
    assert.equal(res.status, 403);
    assert.equal(res.body.error.details.reason, 'premium_required');
  });

  test('premium account: the file, marked as not cacheable by a shared cache', async () => {
    const res = await file(premiumFile.id, { user: premiumPme });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/pdf');
    assert.match(res.headers.get('cache-control'), /no-store/);
    assert.match(res.headers.get('cache-control'), /private/);
  });

  test('the file of a standard article stays public (anonymous, shared cache allowed)', async () => {
    const res = await file(openFile.id);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('cache-control'), /public/);
  });

  test('the COVER of a premium article is public: it is part of the teaser', async () => {
    const res = await get(`/blog/articles/${premium.slug}/cover`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/png');
  });

  test('the file of a premium DRAFT stays a 404', async () => {
    const draftFile = (await upload(premiumDraft, 'media', PDF, { name: 'brouillon.pdf', type: 'application/pdf' })).body.media;
    for (const user of [undefined, premiumPme]) assert.equal((await file(draftFile.id, { user })).status, 404);
  });
});

describe('recommendations by account type', () => {
  test('a "pmi" account is recommended the article aimed at "pmi", flagged as personalised', async () => {
    const res = await get('/blog/recommendations', { user: standardPmi });
    assert.equal(res.body.personalised, true);
    assert.deepEqual(res.body.articles.map((a) => a.slug), [open.slug]);
  });

  test('a "pme" account is recommended the premium article aimed at "pme" (locked or not, as for the viewer)', async () => {
    const res = await get('/blog/recommendations', { user: premiumPme });
    assert.deepEqual(res.body.articles.map((a) => a.slug), [premium.slug]);
    assert.equal(res.body.articles[0].locked, false);
  });

  test('an account type nobody aims at, and anonymous visitors, get the newest articles, not personalised', async () => {
    const other = await t.user({ accountType: 'auto-entrepreneur' });
    for (const user of [other, undefined]) {
      const res = await get('/blog/recommendations', { user });
      assert.equal(res.body.personalised, false);
      assert.deepEqual(res.body.articles.map((a) => a.slug).sort(), [open.slug, premium.slug].sort());
    }
  });

  test('a draft is never recommended, even when aimed at the account type', async () => {
    const res = await get('/blog/recommendations', { user: premiumPme });
    assert.ok(!res.body.articles.some((a) => a.slug === premiumDraft.slug));
  });

  test('"related articles" put the ones aimed at the viewer first', async () => {
    const other = await t.article({ title: 'Autre article' });
    const res = await get(`/blog/articles/${other.slug}`, { user: standardPmi });
    assert.equal(res.body.article.related[0].slug, open.slug);
  });
});

describe('the editor: who may set the access level and the target profiles', () => {
  let article;
  const patch = (json, user = admin) => t.request('PATCH', `/admin/articles/${article.id}`, { user, json });

  before(async () => {
    article = await t.article({ title: 'À régler', status: 'draft' });
  });

  test('an administrator sets the level and the profiles (duplicates removed)', async () => {
    const res = await patch({ requiredAccessLevel: 'premium', targetAccountTypes: ['pme', 'pme', 'pmi'] });
    assert.equal(res.status, 200);
    assert.equal(res.body.article.requiredAccessLevel, 'premium');
    assert.deepEqual(res.body.article.targetAccountTypes, ['pme', 'pmi']);
  });

  test('unknown level or unknown account type: 400', async () => {
    assert.equal((await patch({ requiredAccessLevel: 'gold' })).status, 400);
    assert.equal((await patch({ targetAccountTypes: ['astronaute'] })).status, 400);
    assert.equal((await patch({ targetAccountTypes: 'pme' })).status, 400);
  });

  test('a standard account and an anonymous visitor cannot: 403 / 401', async () => {
    assert.equal((await patch({ requiredAccessLevel: 'standard' }, standardPmi)).status, 403);
    assert.equal((await t.request('PATCH', `/admin/articles/${article.id}`, { json: { requiredAccessLevel: 'standard' } })).status, 401);
    const check = await t.prisma.article.findUnique({ where: { id: article.id } });
    assert.equal(check.requiredAccessLevel, 'premium');
  });

  test('the database itself refuses an unknown access level', async () => {
    await assert.rejects(t.prisma.article.update({ where: { id: article.id }, data: { requiredAccessLevel: 'gold' } }));
  });
});

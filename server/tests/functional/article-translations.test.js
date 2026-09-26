import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Translations of an article: written language, one translation per other language,
// automatic choice by the visitor's language with fallback on the written one.

let t;
let admin;
let standard;
let article; // written in French, published
let draft; // written in French, NOT published
let premium; // premium, written in French

const get = (path, opts) => t.request('GET', path, opts);
const put = (a, lang, json, user = admin) => t.request('PUT', `/admin/articles/${a.id}/translations/${lang}`, { user, json });
const EN = { title: 'English title', excerpt: 'English summary', body: '<p>The english <strong>text</strong> with zebra.</p>' };

before(async () => {
  t = await boot();
  await t.reset();
  admin = await t.admin();
  standard = await t.user();
  article = await t.article({ title: 'Titre français', excerpt: 'Résumé', body: '<p>Le texte français</p>' });
  draft = await t.article({ title: 'Brouillon', status: 'draft', body: '<p>Texte</p>' });
  premium = await t.article({ title: 'Dossier', requiredAccessLevel: 'premium', body: '<p>Texte fermé</p>' });
});
after(() => t.close());

describe('administration', () => {
  test('an article is written in French by default; its language can be changed', async () => {
    const res = await t.request('GET', `/admin/articles/${article.id}`, { user: admin });
    assert.equal(res.body.article.language, 'fr');
    assert.deepEqual(res.body.article.translations, []);
    const patched = await t.request('PATCH', `/admin/articles/${draft.id}`, { user: admin, json: { language: 'en' } });
    assert.equal(patched.body.article.language, 'en');
    await t.request('PATCH', `/admin/articles/${draft.id}`, { user: admin, json: { language: 'fr' } });
    assert.equal((await t.request('PATCH', `/admin/articles/${draft.id}`, { user: admin, json: { language: 'de' } })).status, 400);
  });

  test('only an administrator; an unknown language is a 404', async () => {
    assert.equal((await t.request('PUT', `/admin/articles/${article.id}/translations/en`, { json: EN })).status, 401);
    assert.equal((await put(article, 'en', EN, standard)).status, 403);
    assert.equal((await t.request('GET', `/admin/articles/${article.id}/translations/en`, { user: standard })).status, 403);
    assert.equal((await put(article, 'de', EN)).status, 404);
  });

  test('a translation is saved (sanitised), listed on the article, read back, and replaced by a second save', async () => {
    const res = await put(article, 'en', { ...EN, body: '<p>The english <strong>text</strong> with zebra.</p><script>alert(1)</script>' });
    assert.equal(res.status, 200);
    assert.ok(!res.body.translation.body.includes('<script'), 'sanitised');
    const row = await t.prisma.articleTranslation.findFirst({ where: { articleId: article.id, language: 'en' } });
    assert.match(row.bodyText, /zebra/);
    const full = await t.request('GET', `/admin/articles/${article.id}`, { user: admin });
    assert.deepEqual(full.body.article.translations.map((x) => x.language), ['en']);
    assert.equal((await t.request('GET', `/admin/articles/${article.id}/translations/en`, { user: admin })).body.translation.title, 'English title');
    await put(article, 'en', { ...EN, title: 'Better title' });
    assert.equal(await t.prisma.articleTranslation.count({ where: { articleId: article.id } }), 1, 'still one row');
    assert.equal((await t.request('GET', `/admin/articles/${article.id}/translations/en`, { user: admin })).body.translation.title, 'Better title');
  });

  test('refused: the written language itself, no title, no text, unknown field', async () => {
    assert.equal((await put(article, 'fr', EN)).status, 400);
    assert.equal((await put(article, 'ar', { ...EN, title: '   ' })).status, 400);
    assert.equal((await put(article, 'ar', { ...EN, body: '' })).status, 400);
    assert.equal((await put(article, 'ar', { ...EN, body: '<p> </p><img src="x">' })).status, 400, 'no readable text');
    assert.equal((await put(article, 'ar', { ...EN, status: 'published' })).status, 400);
    assert.equal(await t.prisma.articleTranslation.count({ where: { articleId: article.id, language: 'ar' } }), 0);
  });

  test('an article cannot be moved to a language it is already translated into', async () => {
    const res = await t.request('PATCH', `/admin/articles/${article.id}`, { user: admin, json: { language: 'en' } });
    assert.equal(res.status, 409);
  });

  test('the database refuses a translation without text or in an unknown language', async () => {
    await assert.rejects(t.prisma.articleTranslation.create({ data: { articleId: article.id, language: 'ar', title: 'x', bodyText: '' } }));
    await assert.rejects(t.prisma.articleTranslation.create({ data: { articleId: article.id, language: 'zz', title: 'x', bodyText: 'y' } }));
  });

  test('deleting a translation, then the article, removes them; unknown ones are a 404', async () => {
    await put(draft, 'ar', { title: 'عنوان', excerpt: '', body: '<p>نص</p>' });
    assert.equal((await t.request('DELETE', `/admin/articles/${draft.id}/translations/ar`, { user: admin })).status, 204);
    assert.equal((await t.request('DELETE', `/admin/articles/${draft.id}/translations/ar`, { user: admin })).status, 404);
    await put(draft, 'ar', { title: 'عنوان', excerpt: '', body: '<p>نص</p>' });
    await t.request('DELETE', `/admin/articles/${draft.id}`, { user: admin });
    assert.equal(await t.prisma.articleTranslation.count({ where: { articleId: draft.id } }), 0);
  });
});

describe('what visitors get', () => {
  test('no language asked, or a language without translation: the written language, with the list of available ones', async () => {
    const res = await get(`/blog/articles/${article.slug}`);
    assert.equal(res.body.article.title, 'Titre français');
    assert.equal(res.body.article.language, 'fr');
    assert.deepEqual(res.body.article.availableLanguages, ['fr', 'en']);
    const ar = await get(`/blog/articles/${article.slug}?lang=ar`);
    assert.equal(ar.body.article.title, 'Titre français', 'fallback');
    assert.equal(ar.body.article.language, 'fr');
  });

  test('the visitor language picks the translation: title, summary, text, SEO', async () => {
    await put(article, 'en', { ...EN, title: 'English title', metaTitle: 'SEO en' });
    const res = await get(`/blog/articles/${article.slug}?lang=en`);
    assert.equal(res.body.article.title, 'English title');
    assert.equal(res.body.article.excerpt, 'English summary');
    assert.match(res.body.article.body, /english/);
    assert.equal(res.body.article.language, 'en');
    assert.equal(res.body.article.seo.title, 'SEO en');
    assert.equal(res.body.article.slug, article.slug, 'the address is shared');
  });

  test('the list and the recommendations are translated too; search finds words of the visitor language', async () => {
    const list = await get('/blog/articles?lang=en');
    const card = list.body.articles.find((a) => a.slug === article.slug);
    assert.equal(card.title, 'English title');
    assert.deepEqual(card.availableLanguages, ['fr', 'en']);
    const found = await get('/blog/articles?lang=en&query=zebra');
    assert.ok(found.body.articles.some((a) => a.slug === article.slug));
    const notInFrench = await get('/blog/articles?lang=fr&query=zebra');
    assert.ok(!notInFrench.body.articles.some((a) => a.slug === article.slug), 'the english text is not searched in French');
    const rec = await get('/blog/recommendations?lang=en');
    assert.ok(rec.body.articles.some((a) => a.title === 'English title'));
  });

  test('a translation follows the article: hidden while it is a draft; its text stays locked for a premium article', async () => {
    await t.request('POST', `/admin/articles/${article.id}/unpublish`, { user: admin });
    assert.equal((await get(`/blog/articles/${article.slug}?lang=en`)).status, 404);
    await t.prisma.article.update({ where: { id: article.id }, data: { status: 'published', publishedAt: new Date() } });

    await put(premium, 'en', { title: 'Premium file', excerpt: 'Teaser', body: '<p>closed secretword</p>' });
    const locked = await get(`/blog/articles/${premium.slug}?lang=en`);
    assert.equal(locked.body.article.title, 'Premium file', 'the teaser is translated');
    assert.equal(locked.body.article.body, null, 'the text is not sent');
    assert.ok(!JSON.stringify(locked.body).includes('secretword'));
    const search = await get('/blog/articles?lang=en&query=secretword');
    assert.ok(!search.body.articles.some((a) => a.slug === premium.slug), 'the locked text is not searchable');
  });

  test('a bad language is refused', async () => {
    assert.equal((await get(`/blog/articles/${article.slug}?lang=de`)).status, 400);
    assert.equal((await get('/blog/articles?lang=xx')).status, 400);
  });
});

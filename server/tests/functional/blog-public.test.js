import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { MP4, PDF, PNG, fileForm } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';

// P3-03 — the PUBLIC blog API: no session, published content only.

let t;
let admin;
let catA;
let catB;
let a1; // published, category A, tags TVA + Facture, cover + files
let a2; // published, category A, tag TVA
let a3; // published, category B, tag Compta
let draft; // draft, category A, tag Secret
let files; // { png, pdf, mp4 } attached to a1

const get = (path, opts) => t.request('GET', path, opts);
const upload = (path, bytes, opts) => t.request('POST', path, { user: admin, form: fileForm(bytes, opts) });

before(async () => {
  t = await boot();
  await t.reset();
  admin = await t.admin({ name: 'Camille Auteur' });
  catA = await t.prisma.articleCategory.create({ data: { slug: 'fiscalite', name: 'Fiscalité' } });
  catB = await t.prisma.articleCategory.create({ data: { slug: 'gestion', name: 'Gestion' } });
  await t.prisma.articleCategory.create({ data: { slug: 'vide', name: 'Vide' } }); // no published article
  a1 = await t.article({ title: 'Comprendre la TVA', body: '<p>La taxe sur la valeur ajoutée expliquée simplement.</p>', tags: ['TVA', 'Facture'], category: catA, author: admin, metaTitle: 'Titre SEO', metaDescription: 'Description SEO' });
  a2 = await t.article({ title: 'TVA et auto-entrepreneurs', tags: ['TVA'], category: catA, author: admin });
  a3 = await t.article({ title: 'Tenir sa comptabilité', tags: ['Compta'], category: catB });
  draft = await t.article({ title: 'Brouillon secret', status: 'draft', tags: ['Secret'], category: catA, body: '<p>Contenu confidentiel du brouillon</p>' });

  const cover = await upload(`/admin/articles/${a1.id}/cover`, PNG);
  const png = await upload(`/admin/articles/${a1.id}/media`, PNG, { name: 'schema.png' });
  const pdf = await upload(`/admin/articles/${a1.id}/media`, PDF, { name: 'guide.pdf', type: 'application/pdf' });
  const mp4 = await upload(`/admin/articles/${a1.id}/media`, MP4, { name: 'demo.mp4', type: 'video/mp4' });
  files = { cover: cover.body.media, png: png.body.media, pdf: pdf.body.media, mp4: mp4.body.media };
  await upload(`/admin/articles/${draft.id}/cover`, PNG);
  const dm = await upload(`/admin/articles/${draft.id}/media`, PDF, { name: 'secret.pdf', type: 'application/pdf' });
  files.draftMedia = dm.body.media;
});
after(() => t.close());

const titles = (res) => res.body.articles.map((a) => a.title);

describe('list', () => {
  test('anyone (no session) sees published articles only, newest first', async () => {
    const res = await get('/blog/articles');
    assert.equal(res.status, 200);
    assert.deepEqual(titles(res), ['Tenir sa comptabilité', 'TVA et auto-entrepreneurs', 'Comprendre la TVA']);
    assert.ok(!titles(res).includes('Brouillon secret'));
    assert.deepEqual(res.body.pagination, { page: 1, limit: 9, total: 3, pages: 1 });
  });

  test('a card carries exactly the public fields (no text, no ids, no e-mail, no status)', async () => {
    const res = await get('/blog/articles');
    const card = res.body.articles.find((a) => a.title === 'Comprendre la TVA');
    assert.deepEqual(Object.keys(card).sort(), ['author', 'category', 'coverUrl', 'excerpt', 'lockReason', 'locked', 'publishedAt', 'readingMinutes', 'requiredAccessLevel', 'slug', 'tags', 'title']);
    assert.deepEqual(card.author, { name: 'Camille Auteur' });
    assert.deepEqual(card.category, { name: 'Fiscalité', slug: 'fiscalite' });
    assert.deepEqual(card.tags.map((x) => x.name), ['Facture', 'TVA']);
    assert.match(card.coverUrl, /^\/api\/blog\/articles\/.+\/cover$/);
    assert.ok(!res.text.includes('@test.local'));
    assert.ok(!/"(id|status|body|bodyText|storageKey|authorId)"/.test(res.text));
  });

  test('pagination: size, pages, second page, page beyond the end', async () => {
    for (let i = 1; i <= 10; i += 1) await t.article({ title: `Article de pagination ${String(i).padStart(2, '0')}`, category: catB });
    const p1 = await get('/blog/articles?limit=5');
    assert.equal(p1.body.articles.length, 5);
    assert.deepEqual(p1.body.pagination, { page: 1, limit: 5, total: 13, pages: 3 });
    const p3 = await get('/blog/articles?limit=5&page=3');
    assert.equal(p3.body.articles.length, 3);
    const seen = new Set([...p1.body.articles, ...(await get('/blog/articles?limit=5&page=2')).body.articles, ...p3.body.articles].map((a) => a.slug));
    assert.equal(seen.size, 13, 'no article is repeated or lost across pages');
    const beyond = await get('/blog/articles?limit=5&page=99');
    assert.equal(beyond.status, 200);
    assert.deepEqual(beyond.body.articles, []);
    assert.equal(beyond.body.pagination.total, 13);
    await t.prisma.article.deleteMany({ where: { title: { startsWith: 'Article de pagination' } } });
  });

  test('bad pagination / unknown parameters are refused with 400', async () => {
    for (const q of ['page=0', 'page=-1', 'page=abc', 'page=1.5', 'page=1001', 'limit=0', 'limit=25', 'limit=abc', 'foo=bar', `query=${'x'.repeat(101)}`, 'category=Bad Slug', 'tag=../x', 'category[]=a']) {
      assert.equal((await get(`/blog/articles?${q}`)).status, 400, q);
    }
  });

  test('filter by category and by tag; unknown filters simply match nothing', async () => {
    assert.deepEqual(titles(await get('/blog/articles?category=fiscalite')).sort(), ['Comprendre la TVA', 'TVA et auto-entrepreneurs']);
    assert.deepEqual(titles(await get('/blog/articles?tag=compta')), ['Tenir sa comptabilité']);
    assert.deepEqual(titles(await get('/blog/articles?category=fiscalite&tag=facture')), ['Comprendre la TVA']);
    assert.deepEqual(titles(await get('/blog/articles?category=inconnue')), []);
    assert.deepEqual(titles(await get('/blog/articles?category=gestion&tag=tva')), []);
  });

  test('filters can never reveal a draft (category and tag of the draft included)', async () => {
    assert.ok(!titles(await get('/blog/articles?tag=secret')).includes('Brouillon secret'));
    assert.deepEqual(titles(await get('/blog/articles?tag=secret')), []);
    assert.ok(!titles(await get('/blog/articles?category=fiscalite')).includes('Brouillon secret'));
  });

  test('search: title, summary, text and tag names, case-insensitive; never the draft', async () => {
    assert.deepEqual(titles(await get('/blog/articles?query=comptabilité')), ['Tenir sa comptabilité']);
    assert.deepEqual(titles(await get('/blog/articles?query=COMPRENDRE')), ['Comprendre la TVA']);
    assert.deepEqual(titles(await get('/blog/articles?query=valeur ajoutée')), ['Comprendre la TVA']); // body text
    assert.deepEqual(titles(await get('/blog/articles?query=Résumé de Tenir')), ['Tenir sa comptabilité']); // summary
    assert.deepEqual(titles(await get('/blog/articles?query=compta')), ['Tenir sa comptabilité']); // tag name
    assert.deepEqual(titles(await get('/blog/articles?query=confidentiel')), [], 'text of the draft is not searchable');
    assert.deepEqual(titles(await get('/blog/articles?query=brouillon')), []);
  });

  test('search: "%" and "_" are ordinary characters, injection strings are harmless', async () => {
    assert.deepEqual(titles(await get('/blog/articles?query=%25')), [], '"%" must not match everything');
    assert.deepEqual(titles(await get('/blog/articles?query=_')), [], '"_" must not match everything');
    assert.deepEqual(titles(await get('/blog/articles?query=' + encodeURIComponent("' OR '1'='1"))), []);
    const sql = await get('/blog/articles?query=' + encodeURIComponent("x'; DROP TABLE articles; --"));
    assert.equal(sql.status, 200);
    assert.equal(await t.prisma.article.count(), 4, 'nothing was dropped');
    assert.equal((await get('/blog/articles?query=%5C')).status, 200, 'a lone backslash does not crash the query');
  });
});

describe('article page', () => {
  test('a published article is readable without a session', async () => {
    const res = await get(`/blog/articles/${a1.slug}`);
    assert.equal(res.status, 200);
    const a = res.body.article;
    assert.equal(a.title, 'Comprendre la TVA');
    assert.match(a.body, /valeur ajoutée/);
    assert.deepEqual(a.author, { name: 'Camille Auteur' });
    assert.ok(a.publishedAt && a.updatedAt);
    assert.ok(!res.text.includes('@test.local'));
    assert.ok(!/storageKey|"status"|authorId|bodyText|"authorId"/.test(res.text));
  });

  test('SEO: custom title / description win, otherwise the title / summary are used', async () => {
    assert.deepEqual((await get(`/blog/articles/${a1.slug}`)).body.article.seo, { title: 'Titre SEO', description: 'Description SEO' });
    assert.deepEqual((await get(`/blog/articles/${a2.slug}`)).body.article.seo, { title: 'TVA et auto-entrepreneurs', description: 'Résumé de TVA et auto-entrepreneurs' });
  });

  test('files are listed with PUBLIC addresses only', async () => {
    const media = (await get(`/blog/articles/${a1.slug}`)).body.article.media;
    assert.deepEqual(media.map((m) => m.kind), ['image', 'document', 'video']);
    assert.ok(media.every((m) => m.url.startsWith('/api/blog/media/')));
    assert.ok(media.every((m) => !Object.hasOwn(m, 'storageKey')));
  });

  test('a draft, an unknown slug and a malformed slug all answer the same 404', async () => {
    const answers = [];
    for (const slug of [draft.slug, 'inexistant', 'UPPER', 'a'.repeat(81), '..%2Fetc%2Fpasswd', 'a b', '-x']) {
      const res = await get(`/blog/articles/${slug}`);
      assert.equal(res.status, 404, slug);
      answers.push(JSON.stringify(res.body.error.message));
    }
    assert.equal(new Set(answers).size, 1);
  });

  test('recommended articles: same category first, never the article itself, never a draft, at most 3', async () => {
    const related = (await get(`/blog/articles/${a1.slug}`)).body.article.related;
    assert.ok(related.length <= 3 && related.length >= 1);
    assert.ok(!related.some((r) => r.slug === a1.slug));
    assert.ok(!related.some((r) => r.title === 'Brouillon secret'));
    assert.equal(related[0].title, 'TVA et auto-entrepreneurs', 'same category and same tag come first');
    assert.ok(related.every((r) => Object.keys(r).sort().join() === 'author,category,coverUrl,excerpt,lockReason,locked,publishedAt,readingMinutes,requiredAccessLevel,slug,tags,title'));
  });
});

describe('categories and keywords', () => {
  test('only categories with a published article, with the right counts', async () => {
    const res = await get('/blog/categories');
    assert.deepEqual(res.body.categories, [
      { name: 'Fiscalité', slug: 'fiscalite', count: 2 },
      { name: 'Gestion', slug: 'gestion', count: 1 },
    ]);
  });

  test('keywords: only those used by a published article, most used first, draft excluded', async () => {
    const res = await get('/blog/tags');
    assert.deepEqual(res.body.tags.map((x) => [x.name, x.count]), [['TVA', 2], ['Compta', 1], ['Facture', 1]]);
    assert.ok(!res.body.tags.some((x) => x.name === 'Secret'));
  });
});

describe('public files', () => {
  test('cover of a published article: served, cacheable, hardened headers', async () => {
    const res = await get(`/blog/articles/${a1.slug}/cover`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.buffer, PNG);
    assert.equal(res.headers.get('content-type'), 'image/png');
    assert.match(res.headers.get('cache-control'), /public/);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.match(res.headers.get('content-security-policy'), /sandbox/);
  });

  test('attached files: exact bytes, documents forced to download', async () => {
    const png = await get(`/blog/media/${files.png.id}`);
    assert.deepEqual(png.buffer, PNG);
    const pdf = await get(`/blog/media/${files.pdf.id}`);
    assert.deepEqual(pdf.buffer, PDF);
    assert.match(pdf.headers.get('content-disposition'), /^attachment/);
    const video = await get(`/blog/media/${files.mp4.id}`, { headers: { Range: 'bytes=0-9' } });
    assert.equal(video.status, 206);
    assert.equal(video.buffer.length, 10);
  });

  test('the cover row is also public through the media route (it is part of a published article)', async () => {
    assert.equal((await get(`/blog/media/${files.cover.id}`)).status, 200);
  });

  test('files and cover of a DRAFT are not public', async () => {
    assert.equal((await get(`/blog/articles/${draft.slug}/cover`)).status, 404);
    assert.equal((await get(`/blog/media/${files.draftMedia.id}`)).status, 404);
  });

  test('an article without a cover answers 404 on its cover address', async () => {
    assert.equal((await get(`/blog/articles/${a3.slug}/cover`)).status, 404);
  });

  test('lesson files and unknown ids are not reachable through the blog', async () => {
    const f = await t.formation({ title: 'Formation privée' });
    const media = await t.prisma.media.create({ data: { kind: 'image', storageKey: 'a'.repeat(32) + '.png', originalName: 'x.png', mimeType: 'image/png', sizeBytes: 1, courseId: f.courses[0].id } });
    assert.equal((await get(`/blog/media/${media.id}`)).status, 404);
    for (const id of ['00000000-0000-4000-8000-000000000000', 'nope', '..%2F..%2Fetc']) assert.equal((await get(`/blog/media/${id}`)).status, 404, id);
  });

  test('unpublishing makes the article, its cover and its files vanish at once; publishing brings them back', async () => {
    const before = await get(`/blog/articles/${a2.slug}`);
    assert.equal(before.status, 200);
    await t.request('POST', `/admin/articles/${a1.id}/unpublish`, { user: admin });
    assert.equal((await get(`/blog/articles/${a1.slug}`)).status, 404);
    assert.equal((await get(`/blog/articles/${a1.slug}/cover`)).status, 404);
    assert.equal((await get(`/blog/media/${files.png.id}`)).status, 404);
    assert.ok(!titles(await get('/blog/articles')).includes('Comprendre la TVA'));
    assert.ok(!(await get('/blog/tags')).body.tags.some((x) => x.name === 'Facture'), 'its keywords disappear with it');
    await t.prisma.article.update({ where: { id: a1.id }, data: { status: 'published', publishedAt: new Date() } });
    assert.equal((await get(`/blog/articles/${a1.slug}`)).status, 200);
    assert.equal((await get(`/blog/media/${files.png.id}`)).status, 200);
  });
});

describe('account deletion', () => {
  test('when the author deletes their account the article stays, without a byline', async () => {
    const author = await t.admin({ name: 'Partie' });
    const post = await t.article({ title: 'Sans auteur', author });
    await t.prisma.user.delete({ where: { id: author.id } });
    const res = await get(`/blog/articles/${post.slug}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.article.author, null);
  });
});

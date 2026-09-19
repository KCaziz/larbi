import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { HOSTILE, MP4, PDF, PNG, fileForm } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';

// P3-02 — administration of blog articles (real API, real database, real files).

let t;
let admin;
before(async () => {
  t = await boot();
  await t.reset();
  admin = await t.admin();
});
after(() => t.close());

const create = async (title = 'Mon article') => (await t.request('POST', '/admin/articles', { user: admin, json: { title } })).body.article;
const patch = (id, json) => t.request('PATCH', `/admin/articles/${id}`, { user: admin, json });
const upload = (path, bytes, opts) => t.request('POST', path, { user: admin, form: fileForm(bytes, opts) });
const cleanBody = '<p>Un texte de plus de quelques mots pour la lecture.</p>';

describe('creation', () => {
  test('a title alone creates a draft written by the author', async () => {
    const res = await t.request('POST', '/admin/articles', { user: admin, json: { title: '  Comment facturer ?  ' } });
    assert.equal(res.status, 201);
    const a = res.body.article;
    assert.equal(a.title, 'Comment facturer ?');
    assert.equal(a.status, 'draft');
    assert.equal(a.publishedAt, null);
    assert.equal(a.author.name, 'Test Admin');
    assert.deepEqual(a.tags, []);
    assert.equal(a.publicPath, null);
  });

  test('the public address is generated from the title, unique, and never shown in the editor', async () => {
    const first = await create('Guide TVA');
    const second = await create('Guide TVA');
    const rows = await t.prisma.article.findMany({ where: { id: { in: [first.id, second.id] } } });
    const slugs = rows.map((r) => r.slug).sort();
    assert.equal(new Set(slugs).size, 2);
    assert.ok(slugs.every((s) => s.startsWith('guide-tva')), slugs.join());
    assert.equal(Object.hasOwn(first, 'slug'), false);
  });

  test('invalid creation requests are refused with 400', async () => {
    for (const json of [{}, { title: '' }, { title: '   ' }, { title: 'x'.repeat(151) }, { title: 'ok', status: 'published' }, { title: 'ok', authorId: 'x' }]) {
      const res = await t.request('POST', '/admin/articles', { user: admin, json });
      assert.equal(res.status, 400, JSON.stringify(json).slice(0, 60));
    }
  });
});

describe('editing', () => {
  test('rich text is sanitised by the SERVER and its plain copy derived from the clean version', async () => {
    const a = await create();
    const dirty = '<p onclick="steal()">Bonjour <strong>monde</strong></p><script>alert(1)</script><a href="javascript:alert(1)">x</a><iframe src="//evil"></iframe><img src=x onerror=alert(1)>';
    const res = await patch(a.id, { body: dirty });
    assert.equal(res.status, 200);
    const body = res.body.article.body;
    assert.match(body, /<strong>monde<\/strong>/);
    assert.doesNotMatch(body, /script|onclick|javascript:|iframe|<img|onerror/i);
    const row = await t.prisma.article.findUnique({ where: { id: a.id } });
    assert.equal(row.bodyText, 'Bonjour monde x');
    assert.equal(res.body.article.readingMinutes, 1);
  });

  test('an empty editor ("<p></p>") counts as no content', async () => {
    const a = await create();
    await patch(a.id, { body: cleanBody });
    const res = await patch(a.id, { body: '<p></p>' });
    assert.equal(res.body.article.body, null);
    assert.equal((await t.prisma.article.findUnique({ where: { id: a.id } })).bodyText, '');
    assert.equal(res.body.article.readingMinutes, 0);
  });

  test('summary, SEO fields: trimmed, empty means "none"', async () => {
    const a = await create();
    const res = await patch(a.id, { excerpt: '  Court résumé  ', metaTitle: '', metaDescription: '  Description  ' });
    assert.equal(res.body.article.excerpt, 'Court résumé');
    assert.equal(res.body.article.metaTitle, null);
    assert.equal(res.body.article.metaDescription, 'Description');
  });

  test('field limits and unknown fields are refused', async () => {
    const a = await create();
    const bad = [
      { title: '' },
      { excerpt: 'x'.repeat(301) },
      { metaTitle: 'x'.repeat(71) },
      { metaDescription: 'x'.repeat(171) },
      { body: 'x'.repeat(200_001) },
      { status: 'published' },
      { slug: 'hacked' },
      { authorId: 'x' },
      { publishedAt: '2020-01-01' },
      { categoryId: 'not-a-uuid' },
      { tags: 'not-an-array' },
      { tags: Array.from({ length: 11 }, (_, i) => `t${i}`) },
      { tags: ['x'.repeat(41)] },
      { tags: [''] },
      { tags: ['   '] },
    ];
    for (const json of bad) assert.equal((await patch(a.id, json)).status, 400, JSON.stringify(json).slice(0, 60));
  });

  test('the public address and the status can only change through their own actions', async () => {
    const a = await create('Adresse stable');
    const before = (await t.prisma.article.findUnique({ where: { id: a.id } })).slug;
    await patch(a.id, { title: 'Un tout autre titre' });
    assert.equal((await t.prisma.article.findUnique({ where: { id: a.id } })).slug, before);
  });

  test('an unknown category is refused, a known one is attached and can be cleared', async () => {
    const a = await create();
    const unknown = await patch(a.id, { categoryId: '00000000-0000-4000-8000-000000000000' });
    assert.equal(unknown.status, 400);
    const cat = (await t.request('POST', '/admin/article-categories', { user: admin, json: { name: 'Fiscalité' } })).body.category;
    assert.equal((await patch(a.id, { categoryId: cat.id })).body.article.category.name, 'Fiscalité');
    assert.equal((await patch(a.id, { categoryId: null })).body.article.category, null);
  });

  test('tags: trimmed, de-duplicated, replaced (not appended), shared between articles', async () => {
    const a = await create();
    const b = await create();
    const res = await patch(a.id, { tags: ['TVA', 'tva', '  Facture  électronique '] });
    assert.deepEqual(res.body.article.tags, ['Facture électronique', 'TVA']);
    await patch(b.id, { tags: ['TVA'] });
    assert.equal(await t.prisma.tag.count({ where: { slug: 'tva' } }), 1, 'one tag row shared by both articles');
    assert.deepEqual((await patch(a.id, { tags: ['Comptabilité'] })).body.article.tags, ['Comptabilité']);
    assert.deepEqual((await patch(a.id, { tags: [] })).body.article.tags, []);
    const suggestions = await t.request('GET', '/admin/tags', { user: admin });
    assert.ok(suggestions.body.tags.includes('TVA'));
  });

  test('tags written in Arabic keep distinct addresses', async () => {
    const a = await create();
    const res = await patch(a.id, { tags: ['ضريبة', 'فاتورة'] });
    assert.equal(res.body.article.tags.length, 2);
    assert.equal(await t.prisma.tag.count({ where: { name: { in: ['ضريبة', 'فاتورة'] } } }), 2);
  });

  test('the author of an article never changes when another administrator edits it', async () => {
    const a = await create();
    const other = await t.admin({ name: 'Autre Admin' });
    await t.request('PATCH', `/admin/articles/${a.id}`, { user: other, json: { title: 'Modifié' } });
    assert.equal((await t.request('GET', `/admin/articles/${a.id}`, { user: admin })).body.article.author.name, 'Test Admin');
  });

  test('a body above the administration limit (1 MB) is refused with 413', async () => {
    const a = await create();
    const res = await patch(a.id, { body: 'x'.repeat(1_100_000) });
    assert.equal(res.status, 413);
  });

  test('unknown or malformed ids answer 404', async () => {
    for (const id of ['00000000-0000-4000-8000-000000000000', 'nope', '..%2Fetc']) {
      assert.equal((await t.request('GET', `/admin/articles/${id}`, { user: admin })).status, 404, id);
    }
  });
});

describe('publication', () => {
  test('an empty article cannot be published: 422 lists what is missing', async () => {
    const a = await create();
    const res = await t.request('POST', `/admin/articles/${a.id}/publish`, { user: admin });
    assert.equal(res.status, 422);
    assert.deepEqual(res.body.error.details.missing.sort(), ['content', 'cover', 'excerpt']);
    assert.equal((await t.prisma.article.findUnique({ where: { id: a.id } })).status, 'draft');
  });

  test('the checklist reflects the article and publication succeeds once everything is there', async () => {
    const a = await create('À publier');
    await patch(a.id, { excerpt: 'Résumé', body: cleanBody });
    let items = (await t.request('GET', `/admin/articles/${a.id}`, { user: admin })).body.article.readiness;
    assert.equal(items.ready, false);
    assert.deepEqual(items.items.filter((i) => !i.ok).map((i) => i.key), ['cover']);

    await upload(`/admin/articles/${a.id}/cover`, PNG);
    items = (await t.request('GET', `/admin/articles/${a.id}`, { user: admin })).body.article.readiness;
    assert.equal(items.ready, true);

    const res = await t.request('POST', `/admin/articles/${a.id}/publish`, { user: admin });
    assert.equal(res.status, 200);
    assert.equal(res.body.article.status, 'published');
    assert.ok(res.body.article.publishedAt);
    assert.match(res.body.article.publicPath, /^\/blog\/a-publier/);
  });

  test('publishing twice keeps the original date; unpublishing clears it', async () => {
    const a = await create('Dates');
    await patch(a.id, { excerpt: 'R', body: cleanBody });
    await upload(`/admin/articles/${a.id}/cover`, PNG);
    const first = (await t.request('POST', `/admin/articles/${a.id}/publish`, { user: admin })).body.article.publishedAt;
    await new Promise((r) => setTimeout(r, 20));
    const again = (await t.request('POST', `/admin/articles/${a.id}/publish`, { user: admin })).body.article.publishedAt;
    assert.equal(again, first);
    const off = (await t.request('POST', `/admin/articles/${a.id}/unpublish`, { user: admin })).body.article;
    assert.equal(off.status, 'draft');
    assert.equal(off.publishedAt, null);
    assert.equal(off.publicPath, null);
  });

  test('emptying a required field is only noticed at the next publication attempt', async () => {
    const a = await create('Vidé');
    await patch(a.id, { excerpt: 'R', body: cleanBody });
    await upload(`/admin/articles/${a.id}/cover`, PNG);
    await t.request('POST', `/admin/articles/${a.id}/publish`, { user: admin });
    await patch(a.id, { body: null });
    await t.request('POST', `/admin/articles/${a.id}/unpublish`, { user: admin });
    const res = await t.request('POST', `/admin/articles/${a.id}/publish`, { user: admin });
    assert.equal(res.status, 422);
    assert.deepEqual(res.body.error.details.missing, ['content']);
  });
});

describe('cover and files', () => {
  test('cover: an image is stored privately and replaced (old row and file removed)', async () => {
    const a = await create();
    const first = await upload(`/admin/articles/${a.id}/cover`, PNG, { name: 'un.png' });
    assert.equal(first.status, 201);
    assert.equal(first.body.media.kind, 'image');
    assert.equal(Object.hasOwn(first.body.media, 'storageKey'), false);
    const filesAfterFirst = t.storedFiles();
    const second = await upload(`/admin/articles/${a.id}/cover`, PNG, { name: 'deux.png' });
    assert.equal(second.status, 201);
    assert.equal(t.storedFiles().length, filesAfterFirst.length, 'the previous cover file was removed');
    assert.equal(await t.prisma.media.count({ where: { id: first.body.media.id } }), 0);
    assert.equal((await t.request('GET', `/admin/articles/${a.id}`, { user: admin })).body.article.cover.originalName, 'deux.png');
  });

  test('cover: only images are accepted', async () => {
    const a = await create();
    assert.equal((await upload(`/admin/articles/${a.id}/cover`, PDF, { name: 'x.pdf', type: 'application/pdf' })).status, 415);
    assert.equal((await upload(`/admin/articles/${a.id}/cover`, MP4, { name: 'x.mp4', type: 'video/mp4' })).status, 415);
  });

  test('files: image, PDF and video are attached, listed and served to the admin', async () => {
    const a = await create();
    const png = await upload(`/admin/articles/${a.id}/media`, PNG, { name: 'schema.png' });
    const pdf = await upload(`/admin/articles/${a.id}/media`, PDF, { name: 'guide.pdf', type: 'application/pdf' });
    const mp4 = await upload(`/admin/articles/${a.id}/media`, MP4, { name: 'demo.mp4', type: 'video/mp4' });
    assert.deepEqual([png.status, pdf.status, mp4.status], [201, 201, 201]);
    const media = (await t.request('GET', `/admin/articles/${a.id}`, { user: admin })).body.article.media;
    assert.deepEqual(media.map((m) => m.kind), ['image', 'document', 'video']);
    const file = await t.request('GET', png.body.media.url.replace(/^\/api/, ''), { user: admin });
    assert.equal(file.status, 200);
    assert.deepEqual(file.buffer, PNG);
  });

  test('hostile files are refused by content and leave nothing on disk', async () => {
    const a = await create();
    const before = { priv: t.storedFiles().length, tmp: t.storedFiles('tmp').length };
    for (const [label, f] of Object.entries(HOSTILE)) {
      const res = await upload(`/admin/articles/${a.id}/media`, f.bytes, { name: f.name, type: f.type });
      assert.ok([400, 415].includes(res.status), `${label} -> ${res.status}`);
    }
    assert.deepEqual({ priv: t.storedFiles().length, tmp: t.storedFiles('tmp').length }, before);
  });

  test('a file cannot be attached to an article that does not exist (and is not kept)', async () => {
    const before = t.storedFiles().length;
    const res = await upload('/admin/articles/00000000-0000-4000-8000-000000000000/media', PNG);
    assert.equal(res.status, 404);
    assert.equal(t.storedFiles().length, before);
    assert.equal(t.storedFiles('tmp').length, 0);
  });

  test('removing a file deletes its row and its bytes', async () => {
    const a = await create();
    const up = await upload(`/admin/articles/${a.id}/media`, PNG);
    const before = t.storedFiles().length;
    assert.equal((await t.request('DELETE', `/admin/media/${up.body.media.id}`, { user: admin })).status, 204);
    assert.equal(t.storedFiles().length, before - 1);
  });
});

describe('categories and tags', () => {
  test('categories are created from a name and listed alphabetically', async () => {
    await t.request('POST', '/admin/article-categories', { user: admin, json: { name: 'Zèbre' } });
    await t.request('POST', '/admin/article-categories', { user: admin, json: { name: 'Abeille' } });
    const list = (await t.request('GET', '/admin/article-categories', { user: admin })).body.categories.map((c) => c.name);
    assert.ok(list.indexOf('Abeille') < list.indexOf('Zèbre'));
    assert.equal((await t.request('POST', '/admin/article-categories', { user: admin, json: { name: '' } })).status, 400);
  });

  test('two categories with the same name get different addresses (no clash)', async () => {
    const one = await t.request('POST', '/admin/article-categories', { user: admin, json: { name: 'Doublon' } });
    const two = await t.request('POST', '/admin/article-categories', { user: admin, json: { name: 'Doublon' } });
    assert.equal(one.status, 201);
    assert.equal(two.status, 201);
    assert.equal(await t.prisma.articleCategory.count({ where: { name: 'Doublon' } }), 2);
  });

  test('formation categories and article categories are separate lists', async () => {
    await t.request('POST', '/admin/categories', { user: admin, json: { name: 'Catégorie de formation' } });
    const list = (await t.request('GET', '/admin/article-categories', { user: admin })).body.categories.map((c) => c.name);
    assert.ok(!list.includes('Catégorie de formation'));
  });
});

describe('deletion', () => {
  test('deleting an article removes it, its tags links, its cover and its files (rows and bytes)', async () => {
    const a = await create('À supprimer');
    await patch(a.id, { tags: ['a', 'b'] });
    await upload(`/admin/articles/${a.id}/cover`, PNG);
    await upload(`/admin/articles/${a.id}/media`, PDF, { name: 'x.pdf', type: 'application/pdf' });
    const filesBefore = t.storedFiles().length;
    assert.equal((await t.request('DELETE', `/admin/articles/${a.id}`, { user: admin })).status, 204);
    assert.equal(t.storedFiles().length, filesBefore - 2);
    assert.equal(await t.prisma.article.count({ where: { id: a.id } }), 0);
    assert.equal(await t.prisma.articleTag.count({ where: { articleId: a.id } }), 0);
    assert.equal(await t.prisma.media.count({ where: { OR: [{ articleId: a.id }, { articleCoverOf: { id: a.id } }] } }), 0);
    assert.equal((await t.request('GET', `/admin/articles/${a.id}`, { user: admin })).status, 404);
  });

  test('deleting the author account keeps the article (without byline)', async () => {
    const author = await t.admin({ name: 'Auteur Parti' });
    const post = await t.article({ title: 'Reste', author, status: 'draft' });
    await t.prisma.user.delete({ where: { id: author.id } });
    const row = await t.prisma.article.findUnique({ where: { id: post.id } });
    assert.ok(row);
    assert.equal(row.authorId, null);
  });
});

describe('list', () => {
  test('lists every article (drafts included) with its status, most recently edited first', async () => {
    await t.reset();
    admin = await t.admin();
    const older = await create('Ancien');
    await new Promise((r) => setTimeout(r, 15));
    await create('Récent');
    await patch(older.id, { excerpt: 'touché' });
    const rows = (await t.request('GET', '/admin/articles', { user: admin })).body.articles;
    assert.deepEqual(rows.map((r) => r.title), ['Ancien', 'Récent']);
    assert.ok(rows.every((r) => r.status === 'draft'));
    assert.ok(rows.every((r) => !Object.hasOwn(r, 'body')), 'the list does not carry the article text');
  });
});

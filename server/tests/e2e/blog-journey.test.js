import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { PDF, PNG, makePng } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P3-02 + P3-03 end to end, in a real browser: the client writes and publishes an
// article in the administration, visitors read it on the public blog.

const bcrypt = createRequire(import.meta.url)('bcryptjs');
const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const PASSWORD = 'Passw0rd!test';

describe('blog: from the editor to the reader', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let files;
  let articleId;
  let slug;
  let admin;

  before(async () => {
    t = await boot();
    await t.reset();
    admin = await t.admin({ name: 'Camille Rédactrice', email: 'redactrice@example.com', passwordHash: await bcrypt.hash(PASSWORD, 10) });
    site = await startSite(t.baseUrl);
    b = await Browser.launch();
    const dir = mkdtempSync(path.join(tmpdir(), 'larbi-e2e-files-'));
    files = { cover: path.join(dir, 'couverture.png'), pdf: path.join(dir, 'guide.pdf'), fake: path.join(dir, 'faux.png') };
    writeFileSync(files.cover, makePng(640, 360));
    writeFileSync(files.pdf, PDF);
    writeFileSync(files.fake, 'ceci est du texte, pas une image');
    assert.ok(PNG.length > 0);
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  const login = async () => {
    await b.goto(`${site.url}/connexion`);
    await b.waitFor("!!document.querySelector('#email')");
    await b.type('#email', 'redactrice@example.com');
    await b.type('#password', PASSWORD);
    await b.click(fr.auth.login.submit);
    assert.ok(await b.waitFor("location.pathname !== '/connexion'"), 'left the sign-in page');
  };

  describe('the client writes the article (administration)', () => {
    test('signs in and finds an empty article list', async () => {
      await login();
      await b.goto(`${site.url}/admin/articles`);
      assert.ok(await b.waitText(fr.admin.articles.list.emptyTitle));
    });

    test('a title alone is enough to start (an empty title is refused in plain language)', async () => {
      await b.click(fr.admin.articles.list.new);
      await b.waitFor("!!document.querySelector('#new-content-title')");
      await b.click(fr.admin.articles.newDialog.create);
      assert.ok(await b.waitText(fr.admin.articles.newDialog.required));
      await b.type('#new-content-title', 'Bien facturer en 2026');
      await b.click(fr.admin.articles.newDialog.create);
      assert.ok(await b.waitFor('/^\\/admin\\/articles\\/[0-9a-f-]{36}$/.test(location.pathname)'));
      articleId = await b.ev("location.pathname.split('/').pop()");
      await b.waitFor("!!document.querySelector('#a-excerpt')");
    });

    test('nothing can be published yet: the checklist says what is missing, in the article wording', async () => {
      await b.clickTab(fr.admin.articles.steps.publish);
      assert.ok(await b.waitText(fr.admin.articles.readiness.excerpt));
      assert.ok((await b.text()).includes(fr.admin.articles.readiness.cover));
      assert.equal(await b.ev(`[...document.querySelectorAll('button')].find(x => x.textContent.trim() === ${JSON.stringify(fr.admin.articles.publish.publish)}).disabled`), true);
      await b.clickTab(fr.admin.articles.steps.content);
    });

    test('writes the summary and the text with formatting, then saves', async () => {
      await b.type('#a-excerpt', 'Un guide simple pour émettre des factures conformes.');
      await b.ev("document.querySelector('.cms-rte-content').focus()");
      await b.send('Input.insertText', { text: 'la mention obligatoire' });
      await b.ev("document.execCommand('selectAll')"); // select the text, then use the "Bold" button
      assert.ok(await b.clickWhere(`e => e.getAttribute('aria-label') === ${JSON.stringify(fr.admin.rte.bold)}`));
      assert.ok(await b.waitText(fr.admin.save.dirty), 'unsaved changes are announced');
      await b.click(fr.admin.save.button);
      assert.ok(await b.waitText(fr.admin.save.saved));
      const row = await t.prisma.article.findUnique({ where: { id: articleId } });
      assert.match(row.body, /<strong>la mention obligatoire<\/strong>/);
      assert.equal(row.bodyText, 'la mention obligatoire');
    });

    test('images and files: a fake image is refused in plain words, the real cover and a PDF are attached', async () => {
      await b.clickTab(fr.admin.articles.steps.media);
      await b.waitFor("document.querySelectorAll('#step-panel-media input[type=file]').length === 2");
      await b.setFiles('#step-panel-media input[type=file]', files.fake, 0);
      assert.ok(await b.waitFor("!!document.querySelector('#step-panel-media [role=alert]')"));
      assert.doesNotMatch(await b.ev("document.querySelector('#step-panel-media [role=alert]').innerText"), /415|MIME|undefined|500/);
      await b.setFiles('#step-panel-media input[type=file]', files.cover, 0);
      assert.ok(await b.waitFor("!!document.querySelector('#step-panel-media .cms-image-preview img') && document.querySelector('#step-panel-media .cms-image-preview img').naturalWidth > 0"));
      await b.setFiles('#step-panel-media input[type=file]', files.pdf, 1);
      assert.ok(await b.waitFor(`document.querySelector('#step-panel-media').innerText.includes('guide.pdf')`));
    });

    test('category created on the spot, keywords typed one by one and pasted, search-engine fields', async () => {
      await b.clickTab(fr.admin.articles.steps.organize);
      await b.waitFor("!!document.querySelector('#a-category')");
      await b.click(fr.admin.info.categoryNew);
      await b.waitFor(`!!document.querySelector('input[aria-label=${JSON.stringify(fr.admin.info.categoryNewLabel)}]')`);
      await b.type(`input[aria-label=${JSON.stringify(fr.admin.info.categoryNewLabel)}]`, 'Fiscalité');
      await b.click(fr.admin.info.categoryAdd);
      assert.ok(await b.waitFor("[...document.querySelectorAll('#a-category option')].some(o => o.textContent === 'Fiscalité')"));
      await b.type('#a-tags', 'TVA');
      await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      await b.type('#a-tags', 'Facture, Comptabilité, tva,');
      assert.ok(await b.waitFor("[...document.querySelectorAll('.cms-tag span')].map(s => s.textContent).join('|') === 'TVA|Facture|Comptabilité'"), 'chips: duplicates (tva) ignored, all pasted words added');
      await b.type('#a-meta-title', 'Facturer en 2026 : le guide');
      await b.type('#a-meta-desc', 'Toutes les règles de facturation à connaître.');
      await b.click(fr.admin.save.button);
      assert.ok(await b.waitText(fr.admin.save.saved));
      const row = await t.prisma.article.findUnique({ where: { id: articleId }, include: { tags: { include: { tag: true } }, category: true } });
      assert.equal(row.category.name, 'Fiscalité');
      assert.deepEqual(row.tags.map((x) => x.tag.name).sort(), ['Comptabilité', 'Facture', 'TVA']);
      assert.equal(row.metaTitle, 'Facturer en 2026 : le guide');
    });

    test('the preview shows the article as readers will see it, including unsaved edits', async () => {
      await b.clickTab(fr.admin.articles.steps.content);
      await b.type('#a-title', 'Bien facturer en 2026 (aperçu)');
      await b.clickTab(fr.admin.articles.steps.preview);
      assert.ok(await b.waitText(fr.admin.articles.preview.unsaved));
      const preview = await b.ev("document.querySelector('.cms-preview').innerText");
      for (const expected of ['Bien facturer en 2026 (aperçu)', 'Un guide simple', 'la mention obligatoire', 'Fiscalité', 'TVA']) assert.ok(preview.includes(expected), expected);
      assert.equal(await b.ev("document.querySelectorAll('.cms-preview a.blog-tag').length"), 0, 'keywords are not links in the preview');
      await b.shot('blog-preview');
      await b.clickTab(fr.admin.articles.steps.content);
      await b.type('#a-title', 'Bien facturer en 2026'); // back to the saved title: nothing left to save
      assert.ok(await b.waitFor(`!${b.hasText(fr.admin.save.dirty)}`));
    });

    test('everything is ready: the article is published and offers a link to the blog', async () => {
      await b.clickTab(fr.admin.articles.steps.publish);
      assert.ok(await b.waitText(fr.admin.articles.publish.allDone));
      await b.click(fr.admin.articles.publish.publish);
      assert.ok(await b.waitText(fr.admin.articles.publish.published));
      assert.ok(await b.waitText(fr.admin.articles.publish.viewOnBlog));
      const row = await t.prisma.article.findUnique({ where: { id: articleId } });
      assert.equal(row.status, 'published');
      slug = row.slug;
    });

    test('the list shows the article as published, written by its author', async () => {
      await b.goto(`${site.url}/admin/articles`);
      assert.ok(await b.waitText('Bien facturer en 2026'));
      const rowText = await b.ev("document.querySelector('.cms-table tbody tr').innerText");
      assert.match(rowText, /Publié/);
      assert.match(rowText, /Camille Rédactrice/);
      assert.match(rowText, /Fiscalité/);
    });
  });

  describe('visitors read it (public blog, no account)', () => {
    before(async () => {
      await b.clearCookies();
      // Another published article sharing a keyword, for the recommendations.
      const cat = await t.prisma.articleCategory.findFirst({ where: { name: 'Fiscalité' } });
      await t.article({ title: 'La TVA expliquée', tags: ['TVA'], category: cat, author: admin });
      await t.article({ title: 'Un brouillon secret', status: 'draft', tags: ['TVA'], category: cat });
    });

    test('the list shows published articles only, with cover, category and reading time — and needs no sign-in', async () => {
      await b.goto(`${site.url}/blog`);
      assert.ok(await b.waitText('Bien facturer en 2026'));
      const text = await b.text();
      assert.ok(text.includes('La TVA expliquée'));
      assert.ok(!text.includes('Un brouillon secret'));
      assert.ok(text.includes('Fiscalité'));
      assert.match(text, /\d+ min de lecture/);
      assert.ok(await b.waitFor("[...document.querySelectorAll('.blog-card img')].some(i => i.naturalWidth > 0)"), 'the cover image loads');
      assert.equal(new URL(await b.ev('location.href')).pathname, '/blog', 'not redirected to a sign-in page');
      await b.shot('blog-list');
    });

    test('search finds an article by its words; an unknown search says so', async () => {
      await b.type('#blog-search', 'facturer');
      await b.click(fr.blogList.searchButton);
      assert.ok(await b.waitFor(`${b.hasText('Bien facturer en 2026')} && !${b.hasText('La TVA expliquée')}`));
      assert.match(await b.ev('location.search'), /q=facturer/, 'the search lives in the address (shareable)');
      await b.type('#blog-search', 'zzzzzzz');
      await b.click(fr.blogList.searchButton);
      assert.ok(await b.waitText(fr.blogList.noResultsTitle));
      await b.click(fr.blogList.clear);
      assert.ok(await b.waitText('La TVA expliquée'));
    });

    test('category and keyword filters narrow the list and can be switched off', async () => {
      await b.clickWhere(`e => e.classList.contains('blog-filter') && e.textContent.trim().startsWith('Fiscalité')`);
      assert.ok(await b.waitFor("new URLSearchParams(location.search).get('category') === 'fiscalite'"));
      await b.clickWhere(`e => e.classList.contains('blog-filter') && e.textContent.trim() === 'Facture'`);
      assert.ok(await b.waitFor(`${b.hasText('Bien facturer en 2026')} && !${b.hasText('La TVA expliquée')}`));
      await b.clickWhere(`e => e.classList.contains('blog-filter') && e.textContent.trim() === 'Facture'`);
      assert.ok(await b.waitText('La TVA expliquée'));
      await b.goto(`${site.url}/blog?tag=BAD%20SLUG&page=-3`);
      assert.ok(await b.waitText(fr.blogList.noResultsTitle), 'a malformed address matches nothing instead of breaking');
    });

    test('the article page: content, author, keywords, files, search-engine title and description', async () => {
      await b.goto(`${site.url}/blog/${slug}`);
      assert.ok(await b.waitText('la mention obligatoire'));
      assert.equal(await b.ev("document.querySelector('.blog-article h1').innerText"), 'Bien facturer en 2026');
      const text = await b.text();
      assert.ok(text.includes('Un guide simple pour émettre des factures conformes.'));
      assert.ok(text.includes('Par Camille Rédactrice'));
      assert.match(await b.ev("document.querySelector('.rich-content strong').innerText"), /la mention obligatoire/);
      assert.equal(await b.ev("document.title"), 'Facturer en 2026 : le guide · Larbi');
      assert.equal(await b.ev("document.querySelector('meta[name=description]').content"), 'Toutes les règles de facturation à connaître.');
      assert.ok(await b.ev("!!document.querySelector('.blog-article-cover') && document.querySelector('.blog-article-cover').naturalWidth > 0"));
      const href = await b.ev("document.querySelector('a.blog-doc').getAttribute('href')");
      const doc = await b.fetch(href);
      assert.deepEqual([doc.status, /attachment/.test(doc.disposition ?? '')], [200, true], 'the PDF downloads');
      assert.equal(await b.ev("document.querySelectorAll('.blog-tags a.blog-tag').length"), 3);
      await b.shot('blog-article');
    });

    test('recommended articles: same category and keyword, never the article itself, never a draft', async () => {
      const related = await b.ev("document.querySelector('.blog-related')?.innerText ?? ''");
      assert.match(related, /La TVA expliquée/);
      assert.doesNotMatch(related, /Un brouillon secret|Bien facturer en 2026/);
    });

    test('a keyword leads to the filtered list; leaving the page restores the tab title', async () => {
      await b.clickWhere(`e => e.classList.contains('blog-tag') && e.textContent.trim() === 'TVA'`);
      assert.ok(await b.waitFor("location.pathname === '/blog' && new URLSearchParams(location.search).get('tag') === 'tva'"));
      assert.ok(await b.waitFor("document.title === 'Blog · Larbi'"));
      assert.ok((await b.text()).includes('La TVA expliquée'));
    });

    test('a draft and an unknown address look exactly alike: "article not found"', async () => {
      const draft = await t.prisma.article.findFirst({ where: { title: 'Un brouillon secret' } });
      for (const target of [draft.slug, 'inexistant']) {
        await b.goto(`${site.url}/blog/${target}`);
        assert.ok(await b.waitText(fr.article.notFoundTitle), target);
        assert.ok(!(await b.text()).includes('confidentiel'));
      }
      assert.equal((await b.fetch(`/api/blog/articles/${draft.slug}/cover`, { cache: 'no-store' })).status, 404);
    });
  });

  describe('safety and reach', () => {
    test('a malicious payload saved by an editor never runs on the public page', async () => {
      const a = (await t.request('POST', '/admin/articles', { user: admin, json: { title: 'Piégé' } })).body.article;
      await t.request('PATCH', `/admin/articles/${a.id}`, { user: admin, json: { excerpt: '<img src=x onerror=window.__xss=1>', body: '<p>Texte</p><img src=x onerror="window.__xss=1"><script>window.__xss=1</script><a href="javascript:window.__xss=1">clic</a>' } });
      await t.prisma.article.update({ where: { id: a.id }, data: { status: 'published', publishedAt: new Date() } });
      const row = await t.prisma.article.findUnique({ where: { id: a.id } });
      await b.goto(`${site.url}/blog/${row.slug}`);
      assert.ok(await b.waitText('Texte'));
      await new Promise((r) => setTimeout(r, 500));
      assert.equal(await b.ev('window.__xss'), undefined, 'no script ran');
      assert.equal(await b.ev("document.querySelectorAll('.rich-content img, .rich-content script, .blog-article-head img').length"), 0);
      assert.equal(await b.ev("document.querySelector('.rich-content a')?.getAttribute('href') ?? null"), null, 'the javascript: link lost its address');
      await t.prisma.article.delete({ where: { id: a.id } });
    });

    test('unpublishing in the administration removes the article from the blog at once', async () => {
      await login();
      await b.goto(`${site.url}/admin/articles/${articleId}`);
      await b.waitFor("!!document.querySelector('#a-title')");
      await b.clickTab(fr.admin.articles.steps.publish);
      await b.click(fr.admin.articles.publish.unpublish);
      assert.ok(await b.waitText(fr.admin.articles.publish.unpublished));
      await b.clearCookies();
      await b.goto(`${site.url}/blog/${slug}`);
      assert.ok(await b.waitText(fr.article.notFoundTitle));
      await b.goto(`${site.url}/blog`);
      assert.ok(await b.waitText('La TVA expliquée'));
      assert.ok(!(await b.text()).includes('Bien facturer en 2026'));
      // no-store: ask the SERVER (public files may stay in a browser cache for 5 minutes by design)
      assert.equal((await b.fetch(`/api/blog/articles/${slug}/cover`, { cache: 'no-store' })).status, 404);
    });

    test('Arabic (right-to-left) and mobile: readable, nothing overflows', async () => {
      await b.goto(`${site.url}/blog`);
      await b.ev("localStorage.setItem('lang', 'ar')");
      await b.goto(`${site.url}/blog`);
      assert.ok(await b.waitFor("document.documentElement.dir === 'rtl' && document.body.innerText.includes('المدونة')"));
      await b.shot('blog-list-ar');
      await b.ev("localStorage.setItem('lang', 'fr'); localStorage.setItem('theme', 'dark')");
      await b.goto(`${site.url}/blog`);
      await b.waitText('La TVA expliquée');
      assert.equal(await b.ev("document.documentElement.dataset.theme"), 'dark');
      await b.shot('blog-list-dark');
      await b.ev("localStorage.setItem('theme', 'light')");
      await b.setViewport(375);
      const first = await t.prisma.article.findFirst({ where: { status: 'published' } });
      for (const p of ['/blog', `/blog/${first.slug}`]) {
        await b.goto(site.url + p);
        await new Promise((r) => setTimeout(r, 700));
        assert.ok((await b.ev('document.documentElement.scrollWidth - window.innerWidth')) <= 0, `horizontal overflow on ${p}`);
      }
      await b.shot('blog-mobile');
    });

    test('no JavaScript error, and no unexpected HTTP error, during the whole journey', () => {
      assert.deepEqual(b.jsErrors, []);
      const expected = [/^401 \/api\/auth\/me$/, /^404 \/api\/blog\/articles\/[^/?]+(\/cover)?(\?lang=[a-z]{2})?$/, /^400 \/api\/blog\/articles\?/, /^415 \/api\/admin\/articles\/[^/]+\/cover$/];
      // provoked on purpose: anonymous session check, drafts / unpublished pages, a malformed filter, the fake image
      const unexpected = b.badResponses.filter((r) => !expected.some((re) => re.test(r)));
      assert.deepEqual(unexpected, []);
    });
  });
});

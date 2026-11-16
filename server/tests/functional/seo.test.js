import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { boot } from '../helpers/server.js';

// Search engines (P12-06): every page of the public site is sent with its own
// title, description, language versions, share preview and structured data,
// with its real HTTP status; sitemap.xml and robots.txt describe the site.

const SITE = 'https://fincludia.com';
const clientDir = mkdtempSync(path.join(tmpdir(), 'fincludia-seo-client-'));
// The shape of the website's real index.html (client/index.html, built).
writeFileSync(
  path.join(clientDir, 'index.html'),
  '<!doctype html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8" />\n    <title>FINCLUDIA</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>\n',
);

let t;
let admin;
let article;
let draft;

before(async () => {
  t = await boot({ extra: { CLIENT_DIR: clientDir, PUBLIC_URL: SITE } });
  await t.reset();
  admin = await t.admin();
  article = await t.article({
    title: 'Faire son budget en dinars',
    excerpt: 'Une méthode simple pour répartir son salaire.',
    body: '<p>Premier paragraphe utile.</p><p>Second paragraphe.</p>',
    author: admin,
  });
  await t.prisma.articleTranslation.create({
    data: { articleId: article.id, language: 'ar', title: 'إعداد الميزانية بالدينار', excerpt: 'طريقة بسيطة لتوزيع الراتب.', bodyText: 'نص المقال.' },
  });
  draft = await t.article({ title: 'Brouillon caché', status: 'draft' });
  await t.prisma.glossaryTerm.create({ data: { slug: 'taux-interet', term: 'Taux d’intérêt', definition: 'Le prix de l’argent prêté, en pourcentage.', status: 'published', language: 'fr' } });
  await t.prisma.glossaryTerm.create({ data: { slug: 'brouillon-terme', term: 'Terme brouillon', definition: 'Pas encore publié.', status: 'draft', language: 'fr' } });
});

after(async () => {
  await t.close();
  rmSync(clientDir, { recursive: true, force: true });
});

const page = (pathname, options) => t.request('GET', pathname, { raw: true, redirect: 'manual', ...options });
const pick = (html, re) => html.match(re)?.[1];
const jsonLd = (html) => JSON.parse(pick(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/));

describe('pages sent to search engines', () => {
  test('the home page: its own title, description, language versions, preview and organisation', async () => {
    const res = await page('/');
    assert.equal(res.status, 200);
    assert.match(res.text, /<html lang="fr" dir="ltr">/);
    assert.match(res.text, /<title>FINCLUDIA — [^<]+<\/title>/);
    assert.match(res.text, /<meta name="description" content="[^"]{60,}" \/>/);
    assert.match(res.text, new RegExp(`<link rel="canonical" href="${SITE}/" />`));
    for (const [lang, href] of [['fr', '/'], ['en', '/en'], ['ar', '/ar'], ['x-default', '/']]) {
      assert.ok(res.text.includes(`<link rel="alternate" hreflang="${lang}" href="${SITE}${href}" />`), `hreflang ${lang}`);
    }
    assert.match(res.text, new RegExp(`<meta property="og:image" content="${SITE}/og-image.png" />`));
    const types = jsonLd(res.text)['@graph'].map((node) => node['@type']);
    assert.deepEqual(types, ['Organization', 'WebSite']);
    // A readable version of the page, replaced by the website when it starts.
    assert.match(res.text, /<div id="root"><div class="seo-shell">[\s\S]*<h1>[^<]+<\/h1>/);
  });

  test('Arabic and English live at their own address, right-to-left for Arabic', async () => {
    const ar = await page('/ar/outils/comparateur');
    assert.equal(ar.status, 200);
    assert.match(ar.text, /<html lang="ar" dir="rtl">/);
    assert.match(ar.text, new RegExp(`<link rel="canonical" href="${SITE}/ar/outils/comparateur" />`));
    assert.match(ar.text, /href="\/ar\/outils\/comparateur\/carte-locale"/, 'the links of the readable version stay in Arabic');
    const en = await page('/en/outils/simulateurs/budget-mensuel');
    assert.equal(en.status, 200);
    assert.match(en.text, /<html lang="en" dir="ltr">/);
    assert.match(en.text, /<title>Monthly budget: online simulator · FINCLUDIA<\/title>/);
  });

  test('an article: its title, the translations that exist, and BlogPosting data', async () => {
    const fr = await page(`/blog/${article.slug}`);
    assert.equal(fr.status, 200);
    assert.match(fr.text, /<title>Faire son budget en dinars · FINCLUDIA<\/title>/);
    assert.match(fr.text, /<meta property="og:type" content="article" \/>/);
    assert.ok(fr.text.includes(`hreflang="ar" href="${SITE}/ar/blog/${article.slug}"`));
    assert.ok(!fr.text.includes('hreflang="en"'), 'no English translation: no English version announced');
    const posting = jsonLd(fr.text)['@graph'].find((node) => node['@type'] === 'BlogPosting');
    assert.equal(posting.headline, 'Faire son budget en dinars');
    assert.equal(posting.inLanguage, 'fr');
    assert.match(fr.text, /<p>Premier paragraphe utile\.<\/p>/);

    const ar = await page(`/ar/blog/${article.slug}`);
    assert.match(ar.text, /<title>إعداد الميزانية بالدينار · FINCLUDIA<\/title>/);
    // No English translation: the English address shows the original, and says so.
    const en = await page(`/en/blog/${article.slug}`);
    assert.equal(en.status, 200);
    assert.match(en.text, new RegExp(`<link rel="canonical" href="${SITE}/blog/${article.slug}" />`));
  });

  test('a glossary term exists at the address of its own language only', async () => {
    const res = await page('/apprendre/termes/taux-interet');
    assert.equal(res.status, 200);
    assert.match(res.text, /<title>Taux d’intérêt : définition simple · FINCLUDIA<\/title>/);
    assert.equal(jsonLd(res.text)['@graph'][0]['@type'], 'DefinedTerm');
    assert.ok(!res.text.includes('hreflang='), 'one language: no language versions');
  });

  test('what does not exist is a real 404; drafts do not exist', async () => {
    for (const pathname of ['/page-inexistante', `/blog/${draft.slug}`, '/apprendre/termes/brouillon-terme', '/outils/comparateur/inexistant', '/outils/simulateurs/inconnu', '/ar/app']) {
      const res = await page(pathname);
      assert.equal(res.status, 404, pathname);
      assert.match(res.text, /<meta name="robots" content="noindex, nofollow" \/>/, pathname);
      assert.equal(res.headers.get('x-robots-tag'), 'noindex', pathname);
    }
  });

  test('private windows and one-time pages are served, never indexed', async () => {
    for (const pathname of ['/app', '/app/budgets/123', '/partage', '/admin/formations', '/compte/fincludia', '/connexion', '/verification/FINCLUDIA-ABCD']) {
      const res = await page(pathname);
      assert.equal(res.status, 200, pathname);
      assert.equal(res.headers.get('x-robots-tag'), 'noindex', pathname);
      assert.ok(!res.text.includes('rel="canonical"'), pathname);
    }
  });

  test('one spelling per address: no /fr prefix, no trailing slash', async () => {
    const fr = await page('/fr/blog?page=2');
    assert.equal(fr.status, 301);
    assert.equal(fr.headers.get('location'), '/blog?page=2');
    const slash = await page('/outils/');
    assert.equal(slash.status, 301);
    assert.equal(slash.headers.get('location'), '/outils');
  });

  test('a title can never break out of the page (escaped in the tags and in the data)', async () => {
    const evil = await t.article({ title: '</title><script>alert(1)</script> "x"', excerpt: '</script><img src=x onerror=alert(2)>' });
    const res = await page(`/blog/${evil.slug}`);
    assert.equal(res.status, 200);
    assert.ok(!res.text.includes('<script>alert(1)</script>'));
    assert.ok(!res.text.includes('<img src=x'));
    assert.match(res.text, /<title>&lt;\/title&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt; &quot;x&quot; · FINCLUDIA<\/title>/);
    assert.equal(jsonLd(res.text)['@graph'].find((node) => node['@type'] === 'BlogPosting').headline, '</title><script>alert(1)</script> "x"');
  });

  test('closed for maintenance: 503 with a retry delay, so search engines keep the pages', async () => {
    await t.prisma.platformSetting.update({ where: { key: 'maintenanceMode' }, data: { value: 'true' } });
    try {
      const res = await page('/faq');
      assert.equal(res.status, 503);
      assert.equal(res.headers.get('retry-after'), '3600');
    } finally {
      await t.prisma.platformSetting.update({ where: { key: 'maintenanceMode' }, data: { value: 'false' } });
    }
  });
});

describe('sitemap.xml and robots.txt', () => {
  test('the sitemap lists every public page in each language, published content only', async () => {
    const res = await page('/sitemap.xml');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /application\/xml/);
    const locs = [...res.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const url of [`${SITE}/`, `${SITE}/ar`, `${SITE}/en/faq`, `${SITE}/outils/comparateur/carte-locale`, `${SITE}/blog/${article.slug}`, `${SITE}/ar/blog/${article.slug}`, `${SITE}/apprendre/termes/taux-interet`]) {
      assert.ok(locs.includes(url), url);
    }
    assert.ok(!locs.includes(`${SITE}/en/blog/${article.slug}`), 'no translation, no address');
    assert.ok(!locs.some((url) => url.includes(draft.slug) || /\/(app|admin|partage|connexion)(\/|$)/.test(url)), 'nothing private, nothing unpublished');
    assert.equal(new Set(locs).size, locs.length, 'no address twice');
  });

  test('robots.txt closes the private windows and points to the sitemap — the API stays readable', async () => {
    const res = await page('/robots.txt');
    assert.equal(res.status, 200);
    for (const rule of ['Disallow: /app', 'Disallow: /admin', 'Disallow: /partage']) assert.ok(res.text.includes(rule), rule);
    assert.ok(!res.text.includes('Disallow: /api'), 'the website needs the API to show its pages');
    assert.ok(res.text.includes(`Sitemap: ${SITE}/sitemap.xml`));
  });

  test('API answers are never indexed', async () => {
    const res = await t.request('GET', '/health');
    assert.equal(res.headers.get('x-robots-tag'), 'noindex');
  });
});

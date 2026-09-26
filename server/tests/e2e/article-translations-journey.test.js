import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// Article translations in a real browser: the author translates from the editor, a
// visitor gets the text in the language of the interface, with the tag of the available
// languages, and falls back on the written language when there is no translation.

const bcrypt = createRequire(import.meta.url)('bcryptjs');
const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const PASSWORD = 'Passw0rd!test';

describe('article translations, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let article;

  before(async () => {
    t = await boot();
    await t.reset();
    await t.admin({ name: 'Camille', email: 'camille@example.com', passwordHash: await bcrypt.hash(PASSWORD, 10) });
    article = await t.article({ title: 'Titre français', excerpt: 'Résumé français', body: '<p>Texte français</p>' });
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1400, height: 1200 });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('the author translates the article into English from the "Traductions" step', async () => {
    await b.goto(`${site.url}/connexion`);
    await b.waitFor("!!document.querySelector('#email')");
    await b.type('#email', 'camille@example.com');
    await b.type('#password', PASSWORD);
    await b.click(fr.auth.login.submit);
    assert.ok(await b.waitFor("location.pathname !== '/connexion'"));
    await b.goto(`${site.url}/admin/articles/${article.id}`);
    await b.waitFor("!!document.querySelector('[role=tab]')");
    await b.clickTab(fr.admin.articles.steps.translations);
    assert.ok(await b.waitText(fr.admin.articles.translations.missing));
    await b.clickWhere("e => e.tagName === 'BUTTON' && e.getAttribute('aria-controls') === 'tr-en-form'");
    await b.waitFor("!!document.querySelector('#tr-en-t')");
    await b.type('#tr-en-t', 'English title');
    await b.type('#tr-en-e', 'English summary');
    await b.click('#tr-en-b');
    await b.ev("document.querySelector('#tr-en-b').focus()");
    await b.type('#tr-en-b', 'English text');
    await b.clickWhere(`e => e.tagName === 'BUTTON' && e.textContent.trim() === ${JSON.stringify(fr.admin.articles.translations.save)}`);
    assert.ok(await b.waitText(fr.admin.articles.translations.saved));
    const row = await t.prisma.articleTranslation.findFirst({ where: { articleId: article.id, language: 'en' } });
    assert.equal(row.title, 'English title');
    assert.match(row.bodyText, /English text/);
  });

  test('a visitor in French reads the written language; in English, the translation; the tag lists both languages', async () => {
    await b.ev("localStorage.setItem('lang', 'fr')");
    await b.goto(`${site.url}/blog/${article.slug}`);
    assert.ok(await b.waitText('Titre français'));
    assert.deepEqual(await b.ev("[...document.querySelectorAll('.blog-article .blog-lang')].map((e) => e.textContent)"), ['FR', 'EN']);
    await b.ev("localStorage.setItem('lang', 'en')");
    await b.goto(`${site.url}/blog/${article.slug}`);
    assert.ok(await b.waitText('English title'));
    assert.ok(await b.waitText('English text'));
    assert.equal(await b.ev("document.querySelector('.blog-article .blog-lang-current').textContent"), 'EN');
    await b.goto(`${site.url}/blog`);
    assert.ok(await b.waitText('English summary'));
  });

  test('a language without translation falls back on the written one (Arabic: text in French, the tag says so)', async () => {
    await b.ev("localStorage.setItem('lang', 'ar')");
    await b.goto(`${site.url}/blog/${article.slug}`);
    assert.ok(await b.waitText('Titre français'));
    assert.equal(await b.ev("document.querySelector('.blog-article .blog-lang-current').textContent"), 'FR');
    await b.ev("localStorage.setItem('lang', 'fr')");
  });

  test('no JavaScript error during the whole journey', () => {
    assert.deepEqual(b.jsErrors, []);
  });
});

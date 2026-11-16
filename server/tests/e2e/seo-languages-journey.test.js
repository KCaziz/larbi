import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// The language is in the address of the public site (P12-06), in a real
// browser: /ar/… and /en/… show their language, the menu opens the same page
// in another language, a visitor who chose a language is taken to its address,
// and Google Analytics is loaded only after the visitor accepted it.

const locale = (lang) => JSON.parse(readFileSync(path.resolve(SERVER_DIR, `../client/src/i18n/locales/${lang}.json`), 'utf8'));
const fr = locale('fr');
const ar = locale('ar');
const en = locale('en');

describe('languages in the address and audience measurement', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  const state = async () =>
    JSON.parse(
      await b.ev(
        "JSON.stringify({ path: location.pathname, lang: document.documentElement.lang, dir: document.documentElement.dir, title: document.title, nav: [...document.querySelectorAll('.main-nav a')].map((a) => a.getAttribute('href')) })",
      ),
    );
  const chooseLanguage = (code) =>
    b.ev(`(() => { const s = document.querySelector('.language-switcher select'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, '${code}'); s.dispatchEvent(new Event('change', { bubbles: true })); return true })()`);

  before(async () => {
    t = await boot();
    await t.reset();
    site = await startSite(t.baseUrl);
    // A browser in English: the public site must still open in French at a
    // French address (a search engine runs in English too).
    b = await Browser.launch({ lang: 'en', width: 1280 });
  });

  after(async () => {
    await t.prisma.platformSetting.updateMany({ where: { key: 'gaMeasurementId' }, data: { value: '' } });
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('an address without prefix is French, even in an English browser', async () => {
    await b.goto(`${site.url}/faq`);
    await b.waitFor(`document.title === ${JSON.stringify(`${fr.seo.pages.faq.title} · FINCLUDIA`)}`, 'the French title');
    const s = await state();
    assert.equal(s.lang, 'fr');
    assert.ok(s.nav.includes('/faq') || s.nav.includes('/blog'), 'French links have no prefix');
  });

  test('/ar shows the Arabic site, right to left, with Arabic links', async () => {
    await b.goto(`${site.url}/ar/blog`);
    await b.waitFor(`document.title === ${JSON.stringify(`${ar.seo.pages.blog.title} · FINCLUDIA`)}`, 'the Arabic title');
    const s = await state();
    assert.equal(s.lang, 'ar');
    assert.equal(s.dir, 'rtl');
    assert.ok(s.nav.every((href) => href.startsWith('/ar')), `Arabic links: ${s.nav.join(', ')}`);
  });

  test('having chosen Arabic, a French address opens at its Arabic address', async () => {
    await b.goto(`${site.url}/outils`);
    await b.waitFor("location.pathname === '/ar/outils'", 'the Arabic address');
  });

  test('the language menu opens the same page in the other language', async () => {
    await chooseLanguage('fr');
    await b.waitFor("location.pathname === '/outils' && document.documentElement.lang === 'fr'", 'the French page');
    await chooseLanguage('en');
    await b.waitFor(`location.pathname === '/en/outils' && document.title === ${JSON.stringify(`${en.seo.pages.tools.title} · FINCLUDIA`)}`, 'the English page');
    await chooseLanguage('fr');
    await b.waitFor("location.pathname === '/outils'", 'back to French');
  });

  test('the sign-in page follows the language too', async () => {
    await b.goto(`${site.url}/connexion`);
    await chooseLanguage('ar');
    await b.waitFor("location.pathname === '/ar/connexion'", 'the Arabic sign-in page');
    await chooseLanguage('fr');
    await b.waitFor("location.pathname === '/connexion'", 'the French sign-in page');
  });

  test('without an Analytics identifier there is no banner and nothing is loaded', async () => {
    await b.goto(`${site.url}/a-propos`);
    await b.waitFor("document.querySelector('h1')", 'the page');
    await new Promise((resolve) => setTimeout(resolve, 800));
    assert.equal(await b.ev("!!document.querySelector('.analytics-consent')"), false);
    assert.equal(await b.ev("!!document.querySelector('script[src*=\"googletagmanager\"]')"), false);
  });

  test('with an identifier: a banner, nothing loaded before the answer, refusing is respected, accepting loads it', async () => {
    await t.prisma.platformSetting.upsert({ where: { key: 'gaMeasurementId' }, update: { value: 'G-TEST12345' }, create: { key: 'gaMeasurementId', value: 'G-TEST12345' } });
    await b.ev("localStorage.removeItem('fincludia.analytics'); true");
    await b.goto(`${site.url}/a-propos`);
    await b.waitFor("document.querySelector('.analytics-consent')", 'the consent banner');
    assert.equal(await b.ev("!!document.querySelector('script[src*=\"googletagmanager\"]')"), false, 'nothing before an answer');

    await b.clickContaining(fr.analytics.refuse);
    await b.waitFor("!document.querySelector('.analytics-consent')", 'the banner closed');
    await b.goto(`${site.url}/faq`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    assert.equal(await b.ev("!!document.querySelector('.analytics-consent')"), false, 'the answer is remembered');
    assert.equal(await b.ev("!!document.querySelector('script[src*=\"googletagmanager\"]')"), false, 'refused: never loaded');

    // The footer brings the choice back.
    await b.clickContaining(fr.analytics.manage);
    await b.waitFor("document.querySelector('.analytics-consent')", 'the banner again');
    await b.clickContaining(fr.analytics.accept);
    await b.waitFor("document.querySelector('script[src*=\"googletagmanager.com/gtag/js?id=G-TEST12345\"]')", 'Analytics loaded after consent');
  });
});

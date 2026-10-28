import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';

// P8-28, the client's message of 2026-10-28: « les comparateurs bancaires
// s'affichent mal, ainsi que pour les autres produits bancaires ils ne se
// génèrent pas ». Inside the application, beside its menu.

describe('the bank comparator inside the application', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  const noSideScroll = () => b.ev('document.documentElement.scrollWidth <= window.innerWidth + 1');

  before(async () => {
    t = await boot();
    await t.reset();
    await t.loadComparatorData();
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1280 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
    const person = await t.adult({ finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(person.id), url: site.url, httpOnly: true });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('a rubric fits the page beside the menu, at 1 280 and 1 024 px: no column is cut', async () => {
    for (const width of [1280, 1024]) {
      await b.setViewport(width, 900);
      await b.goto(`${site.url}/app/outils/comparateur/credits`);
      assert.ok(await b.waitFor("document.querySelectorAll('.condition-card, .comparator-table tbody tr').length > 0", 'the offers'));
      assert.ok(await noSideScroll(), `the page scrolls sideways at ${width} px`);
      // Beside the menu the page is narrower than the table: the cards are shown.
      assert.equal(await b.ev("getComputedStyle(document.querySelector('.comparator-table-wrap')).display"), 'none', `cards at ${width} px`);
    }
    await b.setViewport(1280, 900);
    await b.shot('p8-28-credits');
  });

  test('its links stay inside the application', async () => {
    await b.goto(`${site.url}/app/outils/comparateur`);
    assert.ok(await b.waitFor("document.querySelectorAll('.theme-card').length >= 14", 'the 14 families'));
    const outside = await b.ev("[...document.querySelectorAll('.comparator-page a, a.theme-card, a.segment-card')].map((a) => a.getAttribute('href')).filter((href) => href.startsWith('/outils'))");
    assert.deepEqual(outside, []);
  });

  test('an empty rubric says the source does not document it, never « bientôt »', async () => {
    await b.goto(`${site.url}/app/outils/comparateur`);
    assert.ok(await b.waitFor("document.querySelectorAll('.theme-card-empty').length >= 3", 'the empty rubrics'));
    const text = await b.ev("document.querySelector('.theme-card-empty').textContent");
    assert.match(text, /Non documenté/);
    assert.doesNotMatch(await b.ev('document.body.innerText'), /Bientôt disponible/);
  });

  test('the 25 credit fiches show their criteria and where they come from', async () => {
    await b.goto(`${site.url}/app/outils/credit`);
    assert.ok(await b.waitFor("document.querySelectorAll('.credit-offer').length === 25", 'the 25 fiches'));
    assert.ok(await b.ev("document.querySelectorAll('.credit-offer-criteria').length === 25"), 'each with its criteria');
    assert.ok(await b.waitText('non vérifiée par FINCLUDIA'));
  });

  test('the Algérie Poste fiches show their tariff and its source', async () => {
    await b.goto(`${site.url}/app/outils/postal`);
    assert.ok(await b.waitFor("document.querySelectorAll('.postal-card').length > 0", 'the fiches'));
    assert.ok(await b.ev("document.querySelectorAll('.postal-source').length === document.querySelectorAll('.postal-card').length"), 'each tariff with its source');
  });
});

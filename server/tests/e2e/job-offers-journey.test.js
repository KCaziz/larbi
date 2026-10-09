import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// The job-offer comparator in a real browser (P4-12, screen ET08). The maths are
// covered on the engine (unit/comparison.test.js) and on the API
// (functional/comparisons.test.js); what matters here is what the person sees:
// the better salary losing once the job costs are counted, a score that does not
// appear until weights are given, and the unpriceable benefits shown apart.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const j = fr.jobOffers;
const c = fr.comparison;

describe('comparing job offers, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  const fill = (field, value) => b.type(`#offer-${field}`, String(value));
  const plain = (text) => (text ?? '').replace(/[\s  ]+/g, ' ').trim();

  before(async () => {
    t = await boot();
    await t.reset();
    site = await startSite(t.baseUrl);
    b = await Browser.launch();
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('from the tools page, no account needed', async () => {
    await b.clearCookies();
    await b.goto(`${site.url}/outils`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/outils/offres-emploi'"), 'the tools page links to the comparator');
    assert.ok(await b.waitText(j.intro));
    // Two offers by default: the client's screen compares two or three.
    assert.equal(await b.ev("document.querySelectorAll('.simulator-list').length"), 2);
  });

  test('the better salary loses once the job costs are counted', async () => {
    await b.goto(`${site.url}/outils/offres-emploi`);
    assert.ok(await b.waitText(j.intro));
    await fill('0-label', 'Proche');
    await fill('0-net', 68000);
    await fill('0-mealCost', 4000);
    await fill('0-commuteMinutes', 30);
    await fill('1-label', 'Loin');
    await fill('1-net', 75000);
    await fill('1-transportCost', 12000);
    await fill('1-mealCost', 6000);
    await fill('1-commuteMinutes', 110);
    assert.ok(await b.clickContaining(j.compare));
    // Not j.resultsTitle: "Comparaison" is already in the page's disclaimer
    // ("Comparaison indicative..."), so waiting on it would pass without any
    // result on screen. "Critère" belongs to the table alone.
    assert.ok(await b.waitText(c.criterion));

    // The cell highlighted on "net gain" is the one of the smaller salary.
    const best = await b.ev(`(() => {
      const rows = [...document.querySelectorAll('.comparison-table tbody tr')];
      const row = rows.find((r) => r.querySelector('th')?.innerText.includes(${JSON.stringify(c.criteria.netValue)}));
      if (!row) return null;
      const cells = [...row.querySelectorAll('td')];
      const index = cells.findIndex((cell) => cell.classList.contains('comparison-best'));
      const heads = [...document.querySelectorAll('.comparison-table thead th')];
      return index === -1 ? null : heads[index + 1].innerText.trim();
    })()`);
    assert.equal(best, 'Proche', 'the offer that leaves more, not the one that pays more');

    const text = plain(await b.text());
    // The direction is shown next to the criterion, so the highlight can be
    // checked rather than trusted.
    assert.ok(text.includes(plain(c.direction.higher)) && text.includes(plain(c.direction.lower)));
    assert.ok(text.includes(plain(j.results.netEconomique)));
  });

  test('no score until weights are given, and then the method is shown with it', async () => {
    await b.goto(`${site.url}/outils/offres-emploi`);
    assert.ok(await b.waitText(j.intro));
    await fill('0-label', 'A');
    await fill('0-net', 60000);
    await fill('0-transportCost', 2000);
    await fill('1-label', 'B');
    await fill('1-net', 70000);
    await fill('1-transportCost', 9000);
    assert.ok(await b.clickContaining(j.compare));
    assert.ok(await b.waitText(c.criterion));
    assert.equal(
      await b.ev("document.querySelectorAll('.comparison-score-row').length"),
      0,
      'a ranking nobody asked for is never shown',
    );

    // Asking for a score reveals the weights, which are editable before it is
    // computed: the client's condition in C19.
    assert.ok(await b.ev("(() => { const e = document.querySelector('#scored'); if (!e) return false; e.click(); return true; })()"));
    assert.ok(await b.ev("document.querySelectorAll('#weight-netValue').length === 1"));
    assert.ok(await b.clickContaining(j.compare));
    assert.ok(await b.waitFor("document.querySelectorAll('.comparison-score-row').length === 1"));
    const text = plain(await b.text());
    assert.ok(text.includes('F054'), 'the formula of the score is named');
    assert.ok(text.includes(plain(c.criteria.netValue)));
  });

  test('a benefit nobody can price is shown apart from the figures', async () => {
    await b.goto(`${site.url}/outils/offres-emploi`);
    assert.ok(await b.waitText(j.intro));
    await fill('0-label', 'Startup');
    await fill('0-net', 60000);
    await fill('0-nonMonetisableBenefits', 'Télétravail deux jours par semaine');
    await fill('1-label', 'Grand groupe');
    await fill('1-net', 62000);
    assert.ok(await b.clickContaining(j.compare));
    assert.ok(await b.waitText(j.nonMonetisableTitle));
    const aside = await b.ev("document.querySelector('.comparison-aside')?.innerText ?? null");
    assert.ok(aside?.includes('Télétravail deux jours par semaine'), 'described, not priced');
    assert.ok(!aside.includes('F048'), 'it is not presented as part of a computed figure');
  });

  test('a single offer cannot be compared, and the screen says so', async () => {
    await b.goto(`${site.url}/outils/offres-emploi`);
    assert.ok(await b.waitText(j.intro));
    // Only one offer filled in: the server refuses rather than compare an
    // offer against an empty column.
    await fill('0-label', 'Seule');
    await fill('0-net', 50000);
    assert.ok(await b.clickContaining(j.compare));
    assert.ok(await b.waitFor("document.querySelectorAll('.notice-error').length === 1"), 'the refusal is shown');
    // And the page is still there: a refused form must not take the screen down.
    assert.ok((await b.text()).includes(j.compare));
    assert.equal(await b.ev("document.querySelectorAll('.comparison-table').length"), 0);
  });

  test('on a phone, in Arabic, the comparison table stays readable', async () => {
    await b.setViewport(375);
    await b.ev("localStorage.setItem('lang', 'ar')");
    await b.goto(`${site.url}/outils/offres-emploi`);
    const ar = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/ar.json'), 'utf8'));
    assert.ok(await b.waitText(ar.jobOffers.intro));
    assert.equal(await b.ev("document.documentElement.getAttribute('dir')"), 'rtl');
    await fill('0-label', 'أ');
    await fill('0-net', 60000);
    await fill('1-label', 'ب');
    await fill('1-net', 70000);
    assert.ok(await b.clickContaining(ar.jobOffers.compare));
    assert.ok(await b.waitText(ar.comparison.criterion));
    const overflow = await b.ev('document.documentElement.scrollWidth - document.documentElement.clientWidth');
    assert.ok(overflow <= 1, `horizontal overflow of ${overflow}px`);
    await b.setViewport(1280);
    await b.ev("localStorage.setItem('lang', 'fr')");
  });
});

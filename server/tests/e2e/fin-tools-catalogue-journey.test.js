import '../helpers/setup-env.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';
import { TOOLS_CATALOGUE } from '../../src/constants/finToolsCatalogue.js';

// P8-15: one catalogue of the Tools inside the application — every
// calculator, searchable, by family, each opening inside the application.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const items = () => "document.querySelectorAll('.tools-item').length";

describe('the single tools catalogue', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  before(async () => {
    t = await boot();
    await t.reset();
    const user = await t.adult({ finPublic: 'SAL', finOnboardedAt: new Date() });
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1280 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('every calculator is listed, and every link stays inside the application', async () => {
    await b.goto(`${site.url}/app/outils`);
    assert.ok(await b.waitFor(`${items()} === ${TOOLS_CATALOGUE.length}`, 'the whole catalogue'));
    const outside = await b.ev("[...document.querySelectorAll('#app-main a')].map((a) => a.getAttribute('href')).filter((href) => href && !href.startsWith('/app'))");
    assert.deepEqual(outside, []);
    assert.ok(await b.waitText(fr.toolsCatalogue.pending), 'a calculator not built yet says so');
    await b.shot('p8-15-catalogue');
  });

  test('search, accents ignored, and families', async () => {
    await b.type('.tools-search input', 'reserve securite');
    assert.ok(await b.waitFor(`${items()} >= 1 && ${items()} < 5`, 'a narrowed list'));
    assert.ok(await b.waitText(fr.toolsCatalogue.items['CAL-05']));
    await b.type('.tools-search input', ' ');
    assert.ok(await b.click(fr.toolsCatalogue.family.debt));
    const debts = TOOLS_CATALOGUE.filter((tool) => tool.family === 'debt').length;
    assert.ok(await b.waitFor(`${items()} === ${debts}`, 'the debt family only'));
  });

  test('a calculator opens its simulator, inside the application', async () => {
    assert.ok(await b.clickWhere(`e => e.getAttribute('href') === '/app/outils/simulateurs/effort-dette'`));
    assert.ok(await b.waitFor("location.pathname === '/app/outils/simulateurs/effort-dette'", 'the simulator'));
  });
  test('C19 — two options compared, a score only with weights, and an export', async () => {
    await b.goto(`${site.url}/app/outils/comparer`);
    assert.ok(await b.waitFor("!!document.querySelector('#option-1-cost')", 'the form'));
    await b.type('#option-0-label', 'Prêt A');
    await b.type('#option-0-cost', '120000');
    await b.type('#option-0-duration', '24');
    await b.type('#option-1-label', 'Prêt B');
    await b.type('#option-1-cost', '95000');
    assert.ok(await b.click(fr.compare.compare));
    assert.ok(await b.waitFor("document.querySelectorAll('.comparison-table tbody tr').length === 3", 'one row per criterion'));
    assert.equal(await b.ev("document.querySelector('.comparison-best').closest('tr').querySelectorAll('td')[1].classList.contains('comparison-best')"), true, 'the lower cost is the best');
    assert.ok(await b.waitText('Donnée manquante'), 'a missing duration is said, not zeroed');
    assert.equal(await b.ev("!!document.querySelector('.comparison-score-row')"), false, 'no score without weights');

    await b.ev("document.querySelector('#compare-scored').click()");
    assert.ok(await b.waitFor("!!document.querySelector('#compare-weight-cost')", 'the weights'));
    await b.type('#compare-weight-cost', '3');
    assert.ok(await b.click(fr.compare.compare));
    assert.ok(await b.waitFor("!!document.querySelector('.comparison-score-row')", 'a score with weights'));
    assert.ok(await b.waitText('min-max'), 'its method is shown with it');
    assert.ok(await b.waitText(fr.compare.export));
    await b.shot('p8-15-compare');
  });

  test('a favourite: starred, kept in head of the catalogue after a reload, filtered, unstarred', async () => {
    const star = (code) => `[...document.querySelectorAll('.tools-item')].find((li) => li.querySelector('.tools-item-meta span')?.textContent === '${code}')?.querySelector('.tools-star')`;
    await b.goto(`${site.url}/app/outils`);
    assert.ok(await b.waitFor(`${items()} === ${TOOLS_CATALOGUE.length}`, 'the whole catalogue'));
    assert.equal(await b.ev("!!document.querySelector('.tools-favorites')"), false, 'no favourite yet');

    await b.ev(`${star('CAL-05')}.click()`);
    assert.ok(await b.waitFor("!!document.querySelector('.tools-favorites')", 'the favourites section'));
    await b.goto(`${site.url}/app/outils`);
    assert.ok(await b.waitFor("document.querySelectorAll('.tools-favorites .tools-item').length === 1", 'kept after a reload'));
    assert.equal(await b.ev(`${star('CAL-05')}.getAttribute('aria-pressed')`), 'true', 'its state is announced, not only coloured');

    assert.ok(await b.click(fr.toolsCatalogue.family.favorites));
    assert.ok(await b.waitFor(`${items()} === 1`, 'the favourites filter'));
    await b.ev(`${star('CAL-05')}.click()`);
    assert.ok(await b.waitText(fr.toolsCatalogue.noFavorite), 'an empty filter says what to do');
    await b.shot('p8-15-favourites');
  });
});

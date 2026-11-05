import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// The pedagogical market (EP06, recette R8-12), in a real browser: every card
// says it is a fictional example, a projection is a range, and a fictional
// purchase lands in the training portfolio with its price.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));

describe('the pedagogical market, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  before(async () => {
    t = await boot();
    await t.reset();
    const user = await t.adult({ finPublic: 'EPG', finCurrency: 'DZD', finOnboardedAt: new Date() });
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

  test('every support is a card marked as a fictional example, with its risk in words', async () => {
    await b.goto(`${site.url}/app/portefeuille/marche`);
    assert.ok(await b.waitFor("document.querySelectorAll('.market-card').length === 8", 'the eight supports'));
    assert.equal(await b.ev("document.querySelectorAll('.market-badge').length"), 8, 'each card says it is an example');
    assert.ok(await b.waitText(fr.market.supports.livret.name));
    assert.ok(await b.waitText('Risque 1 sur 7'));
    assert.ok(await b.click(fr.market.classes.shares));
    assert.ok(await b.waitFor("document.querySelectorAll('.market-card').length === 2", 'the shares only'));
    await b.shot('r8-12-market');
  });

  test('a projection is a range, with today’s money and the chance of a loss', async () => {
    assert.ok(await b.clickWhere(`e => e.textContent.trim() === ${JSON.stringify(fr.market.projection.run)} && e.closest('.market-card')`));
    assert.ok(await b.waitFor("!!document.querySelector('.market-projection-result')", 'the result'));
    const text = await b.ev("document.querySelector('.market-projection-result').innerText");
    assert.match(text, /entre .+ et .+/);
    assert.match(text, /argent d’aujourd’hui/);
    assert.match(text, /Chance de finir sous le montant placé/);
  });

  test('a fictional purchase lands in the training portfolio', async () => {
    await b.goto(`${site.url}/app/portefeuille/marche`);
    assert.ok(await b.waitFor("document.querySelectorAll('.market-card').length === 8", 'the market'));
    await b.ev("document.querySelector('#buy-livret').closest('form').querySelector('button[type=submit]').click()");
    assert.ok(await b.waitFor("location.pathname === '/app/portefeuille'", 'back on the portfolio'));
    assert.ok(await b.waitText(fr.market.supports.livret.name), 'the support is a position');
  });
});

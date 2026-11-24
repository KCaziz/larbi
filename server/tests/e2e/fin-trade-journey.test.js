import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P13-05, lot D (2026-11-24): an import in the browser — the client's case of
// 30_TESTS_CALCUL: 8 000 EUR at 135 = 1 080 000 DA, + 120 000 + 80 000 =
// 1 280 000 DA landed; 410 received, 10 damaged: 3 200 DA per unit.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const T = fr.business.trade;
const P = fr.business.pilot;

describe('an import operation, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let owner;

  const choose = (selector, value) =>
    b.ev(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  const button = (label) => b.clickWhere(`e => e.tagName === 'BUTTON' && e.textContent.trim() === ${JSON.stringify(label)}`);
  const tab = async (key) => {
    assert.ok(await b.waitFor(`!!document.querySelector('#business-tab-${key}')`, `the ${key} tab`, 15_000));
    await b.ev(`document.querySelector('#business-tab-${key}').click(); true`);
  };
  const text = async () => (await b.ev('document.body.textContent')).replace(/[  ]/g, ' ');
  const optionValue = (selector, label) => b.ev(`[...document.querySelectorAll(${JSON.stringify(`${selector} option`)})].find(o => o.textContent.includes(${JSON.stringify(label)}))?.value ?? ''`);

  before(async () => {
    t = await boot();
    await t.reset();
    owner = await t.adult({ name: 'Rachid Import', finCurrency: 'DZD', finOnboardedAt: new Date() });
    const org = await t.request('POST', '/fin/entreprise', { user: owner, json: { name: 'Import Sahel', currency: 'DZD', publicKey: 'PUB-09' } });
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1200, height: 1100 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev(`localStorage.setItem('lang', 'fr'); localStorage.setItem('fincludia.organisation', ${JSON.stringify(org.body.entreprise.id)}); true`);
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(owner.id), url: site.url, httpOnly: true });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('an item, then an import FOB Valence for 400 units', async () => {
    await b.goto(`${site.url}/app/entreprise`);
    await tab('stock');
    assert.ok(await b.waitFor("!!document.querySelector('#item-name')", 'the item form', 15_000));
    await b.type('#item-name', 'Pièces détachées');
    await b.type('#item-unit', 'pièce');
    await button(P.addItem);
    assert.ok(await b.waitText(P.itemCreated, 10_000));

    await tab('trade');
    assert.ok(await b.waitFor("!!document.querySelector('#operation-label')", 'the operation form', 15_000));
    // The lists come from the server: wait for them before choosing.
    assert.ok(await b.waitFor("document.querySelectorAll('#operation-incoterm option').length > 1 && document.querySelectorAll('#operation-item option').length > 1", 'the lists', 15_000));
    await b.type('#operation-label', 'Pièces Valence');
    await b.type('#operation-country', 'ES');
    await choose('#operation-incoterm', 'FOB');
    assert.ok(await b.waitFor("!!document.querySelector('#operation-place')", 'the named place', 5000));
    await b.type('#operation-place', 'Port de Valence');
    assert.ok(await b.waitFor("[...document.querySelectorAll('#operation-item option')].length > 1", 'the item', 10_000));
    await choose('#operation-item', await optionValue('#operation-item', 'Pièces détachées'));
    await b.type('.trade-new input[type=number]', '400');
    await button(T.create);
    assert.ok(await b.waitText(T.created, 10_000));
    assert.ok(await b.waitFor("document.body.textContent.includes('OP-')", 'the reference', 10_000));
  });

  test('three costs, one in euros at a dated rate: 1 280 000 landed, said to exclude duties', async () => {
    await button(T.details);
    assert.ok(await b.waitFor("!!document.querySelector('[id^=cost-amount-]')", 'the cost form', 10_000));
    await b.type('[id^=cost-amount-]', '8000');
    await b.type('[id^=cost-rate-]', '135');
    await b.type('[id^=cost-source-]', 'Banque d’Algérie');
    await button(T.addCost);
    assert.ok(await b.waitText(T.costAdded, 10_000));

    for (const [kind, amount] of [['transport', '120000'], ['customs_fees', '80000']]) {
      await choose('[id^=cost-kind-]', kind);
      await b.ev("(() => { const el = document.querySelector('[id^=cost-currency-]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ''); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()");
      await b.type('[id^=cost-currency-]', 'DZD');
      assert.ok(await b.waitFor("!document.querySelector('[id^=cost-rate-]')", 'no rate in DZD', 5000));
      await b.type('[id^=cost-amount-]', amount);
      await button(T.addCost);
      assert.ok(await b.waitFor(`document.querySelectorAll('.trade-details tbody tr').length >= ${kind === 'transport' ? 2 : 3}`, kind, 10_000));
    }
    assert.ok(await b.waitFor("document.body.textContent.replace(/[\\u00a0\\u202f]/g, ' ').includes('1 280 000')", 'the landed cost', 10_000));
    assert.ok((await text()).includes(T.excludingDuties.split(':')[0]), 'without duties, it says so');
  });

  test('410 received, 10 damaged: 400 in stock at 3 200', async () => {
    await b.ev("(() => { const el = document.querySelector('[id^=reception-qty-]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ''); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()");
    await b.type('[id^=reception-qty-]', '410');
    await b.type('.trade-reception input[type=number]:not([id])', '10');
    await button(T.receive);
    assert.ok(await b.waitText(T.receivedOk, 10_000));
    assert.ok(await b.waitFor("document.body.textContent.replace(/[\\u00a0\\u202f]/g, ' ').includes('3 200')", 'the unit cost', 10_000));
    assert.ok((await text()).includes(T.statuses.received));
  });

  test('the file, the exchange scenario and the Incoterms matrix', async () => {
    if (!(await b.ev("!!document.querySelector('.trade-pieces')"))) await button(T.details);
    assert.ok(await b.waitFor("!!document.querySelector('.trade-pieces select')", 'the file', 10_000));
    await choose('.trade-pieces select', 'accepted');
    assert.ok(await b.waitText(T.pieceSaved, 10_000));
    assert.ok(await b.waitFor(`document.body.textContent.includes('1 pièce(s) acceptée(s)')`, 'the file state', 10_000));
    assert.ok(await b.waitFor("document.querySelectorAll('.trade-scenario tbody tr').length >= 2", 'the scenario', 10_000));
    await b.ev("document.querySelector('.trade-incoterms').open = true; true");
    const page = await text();
    assert.ok(page.includes(T.incoterms.FOB) && page.includes(T.risk.onBoard), 'the matrix');
    await b.ev("document.querySelector('.trade-op').scrollIntoView(); true");
    await b.shot('trade-owner');
  });
});

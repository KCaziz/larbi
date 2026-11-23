import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P13-05, lot C (2026-11-23): steering a micro-business in the browser — its
// own home (01_PUBLICS, PUB-05), stock by lot (CNV-16), the 13-week cash plan,
// the month's budget; and the storekeeper, who moves stock without ever
// seeing an amount (DRT-007).

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const P = fr.business.pilot;

describe('steering a micro-business, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let owner;
  let keeper;
  let orgId;

  const as = async (user) => {
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
  };
  const choose = (selector, value) =>
    b.ev(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  const button = (label) => b.clickWhere(`e => e.tagName === 'BUTTON' && e.textContent.trim() === ${JSON.stringify(label)}`);
  const tab = async (key) => {
    assert.ok(await b.waitFor(`!!document.querySelector('#business-tab-${key}')`, `the ${key} tab`, 15_000));
    await b.ev(`document.querySelector('#business-tab-${key}').click(); true`);
  };
  const nbsp = (s) => s.replace(/[  ]/g, ' ');
  const text = async () => nbsp(await b.ev('document.body.textContent'));

  before(async () => {
    t = await boot();
    await t.reset();
    owner = await t.adult({ name: 'Amel Haddad', finCurrency: 'DZD', finOnboardedAt: new Date() });
    keeper = await t.adult({ name: 'Yacine Magasin', finCurrency: 'DZD', finOnboardedAt: new Date() });
    const org = await t.request('POST', '/fin/entreprise', { user: owner, json: { name: 'Épicerie Amel', currency: 'DZD', publicKey: 'PUB-05' } });
    orgId = org.body.entreprise.id;
    const headers = { 'X-Organisation': orgId };
    const invited = await t.request('POST', '/fin/entreprise/membres', { user: owner, headers, json: { email: keeper.email, role: 'storekeeper' } });
    await t.request('POST', `/fin/entreprise/invitations/${invited.body.membre.id}/accepter`, { user: keeper });
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1200, height: 1100 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev(`localStorage.setItem('lang', 'fr'); localStorage.setItem('fincludia.organisation', ${JSON.stringify(orgId)}); true`);
    await as(owner);
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('the micro-business sees its own home', async () => {
    await b.goto(`${site.url}/app/entreprise`);
    assert.ok(await b.waitText(P.homes['PUB-05'], 15_000));
    for (const key of ['tresorerieDisponible', 'stock', 'seuil']) assert.ok((await text()).includes(P.figures[key]), key);
  });

  test('an item, a lot of 400 for 1 280 000, an exit of 280: 120 left at 3 200', async () => {
    await tab('stock');
    assert.ok(await b.waitFor("!!document.querySelector('#item-name')", 'the item form', 10_000));
    await b.type('#item-name', 'Huile 5 L');
    await b.type('#item-unit', 'bidon');
    await button(P.addItem);
    assert.ok(await b.waitText(P.itemCreated, 10_000));
    assert.ok(await b.waitFor("[...document.querySelectorAll('#move-item option')].some(o => o.textContent === 'Huile 5 L')", 'the item in the list', 10_000));
    const itemId = await b.ev("[...document.querySelectorAll('#move-item option')].find(o => o.textContent === 'Huile 5 L').value");
    await choose('#move-item', itemId);
    await b.type('#move-quantity', '400');
    await b.type('#move-cost', '1280000');
    await button(P.saveMove);
    assert.ok(await b.waitText(P.moveSaved, 10_000));

    await choose('#move-kind', 'out');
    assert.ok(await b.waitFor("document.querySelectorAll('#move-lot option').length > 1", 'the open lot', 10_000));
    const lotId = await b.ev("document.querySelectorAll('#move-lot option')[1].value");
    await choose('#move-lot', lotId);
    await b.type('#move-quantity', '280');
    await button(P.saveMove);
    assert.ok(await b.waitFor("document.body.textContent.includes('120 bidon')", 'what is left', 10_000));
    const page = await text();
    assert.ok(page.includes('384 000'), 'the value of what is left');
    assert.ok(page.includes('3 200'), 'the unit cost of the lot');
  });

  test('a balance, then 13 weeks; a budget compared with the real', async () => {
    await tab('steer');
    assert.ok(await b.waitText(P.noBalance, 10_000));
    await b.type('#cash-balance', '250000');
    await button(P.saveBalance);
    assert.ok(await b.waitText(P.balanceSaved, 10_000));
    assert.ok(await b.waitFor("document.querySelectorAll('.pilot-plan tbody tr').length === 13", 'the 13 weeks', 10_000));
    assert.ok((await text()).includes(P.noTension.split('{{')[0].trim()), 'no tension');

    await choose('#budget-category', 'loyer');
    await b.type('#budget-amount', '40000');
    await button(P.setBudget);
    assert.ok(await b.waitText(P.budgetSaved, 10_000));
    assert.ok(await b.waitFor(`document.body.textContent.includes(${JSON.stringify(P.categories.loyer)}) && !!document.querySelector('.pilot-table:not(.pilot-plan) tbody tr')`, 'the budget line', 10_000));
    await b.shot('pilot-owner');
  });

  test('the storekeeper sees the stock and its quantities, never an amount', async () => {
    await as(keeper);
    await b.goto(`${site.url}/app/entreprise`);
    assert.ok(await b.waitFor("document.body.textContent.includes('120 bidon')", 'the stock', 15_000));
    // The list of the stock: quantities only. (The reception form asks the
    // cost of a new lot: entering it is part of receiving, DRT-007.)
    const list = nbsp(await b.ev("document.querySelector('#business-stock').parentElement.querySelector('.business-documents').textContent"));
    assert.equal(list.includes('384 000'), false, 'no value');
    assert.equal(list.includes('DZD'), false, 'no amount at all');
    assert.equal(await b.ev("!!document.querySelector('.fin-figure-grid')"), false, 'no figure');
    assert.equal(await b.ev("!!document.querySelector('#business-tab-steer')"), false, 'no budget or cash tab');
    assert.ok(await b.ev("!!document.querySelector('#move-item')"), 'but the movements form');
    await b.shot('pilot-storekeeper');
  });
});

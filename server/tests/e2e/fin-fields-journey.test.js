import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';

// SUIVI_RECETTE R3-01: every field of a form has the application's field style. A
// field with no border at all is a field nobody drew; the search boxes that wear
// their border on a wrapper are the only exception.

const PAGES = [
  '/app/comptes',
  '/app/comptes/nouveau',
  '/app/mouvements',
  '/app/budgets',
  '/app/budgets/nouveau',
  '/app/objectifs',
  '/app/objectifs/nouveau',
  '/app/dettes',
  '/app/dettes/pret',
  '/app/calendrier',
  '/app/calendrier/regulier',
  '/app/parametres/premiers-pas',
  '/app/parametres/categories',
  '/app/budgets/revenus',
];

describe('every form field is drawn', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let user;

  before(async () => {
    t = await boot();
    await t.reset();
    user = await t.adult({ name: 'Farid Champs', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1100 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('no field of the application pages is left without a border', async () => {
    const bare = [];
    for (const path of PAGES) {
      await b.goto(`${site.url}${path}`);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const found = await b.ev(`(() => {
        const out = [];
        for (const el of document.querySelectorAll('main input, main select, main textarea')) {
          const type = el.getAttribute('type');
          if (['hidden', 'checkbox', 'radio', 'color', 'file', 'range'].includes(type)) continue;
          if (el.closest('.sr-only, [hidden], .fincat-search, .category-picker-search, .fin-amount, .money-search')) continue;
          const box = el.getBoundingClientRect();
          if (box.width === 0 || box.height === 0) continue;
          const style = getComputedStyle(el);
          if (parseFloat(style.borderTopWidth) === 0 && parseFloat(style.borderBottomWidth) === 0) out.push(el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''));
        }
        return out;
      })()`);
      for (const id of found) bare.push(`${path} ${id}`);
    }
    assert.deepEqual(bare, []);
  });
});

import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { APP_SCREENS } from '../../src/constants/finAppScreens.js';

// « Trouvable » (P8-21, section 6): every screen of the consolidated
// specification that has its own page is reached FROM THE MENU, in two clicks
// at most, for each of the five profiles of the budget management — never from
// a typed address. The first click is the entry the matrix names (`via`), the
// second a link of that page to the screen.
//
// A profile changes the educational layer, never what can be reached (ARC-02):
// the same walk runs for all five, and must find the same screens.

const PROFILES = ['LYC', 'ETU', 'JAC', 'SAL', 'EPG'];
// A menu entry is waited for longer than the helper's default: after some
// fifty pages in a row, the browser sometimes needs more than four seconds.
const MENU_WAIT = 8000;
const SETTINGS = new Set(['/app/parametres/confiance', '/app/parametres/premiers-pas']);
const reachable = APP_SCREENS.filter((screen) => screen.served === 'page' && screen.via !== null);

// `/app/budgets/:id` is any budget's address — a real id, so that
// `/app/objectifs/nouveau` never passes for a goal's detail.
// A month (`:mois`) is a month, any other parameter a real id.
const pattern = (to) => new RegExp(`^${to.replace(/:mois/g, '\\d{4}-\\d{2}').replace(/:[a-z]+/gi, '[0-9a-f-]{36}')}$`);
// The link of the page that leads to the screen: one whose address IS the
// screen's (any id for `:id`), not merely one that starts like it.
const linkTo = (to) => `[...document.querySelectorAll('#app-main a')].find((a) => ${pattern(to)}.test(a.getAttribute('href') ?? ''))`;

describe('every screen is found from the menu, for every profile', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  const path = () => b.ev('location.pathname');
  const firstClick = async (via) => {
    if (via === '/app') return true;
    if (SETTINGS.has(via)) {
      await b.ev("document.querySelector('.app-profile button').click()");
      return b.clickWhere(`e => e.matches('.app-profile-link') && e.getAttribute('href') === ${JSON.stringify(via)}`, MENU_WAIT);
    }
    return b.clickWhere(`e => e.matches('.app-sidebar .app-nav-link') && e.getAttribute('href') === ${JSON.stringify(via)}`, MENU_WAIT);
  };

  before(async () => {
    t = await boot();
    await t.reset();
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1280 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  for (const finPublic of PROFILES) {
    test(`profile ${finPublic}: the ${reachable.length} screens with their own page`, async () => {
      const person = await t.adult({ finPublic, finCurrency: 'DZD', finOnboardedAt: new Date() });
      // A budget, so that « Détail budget » has something to open.
      const start = new Date();
      start.setUTCDate(1);
      const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0, 23, 59, 59));
      await t.request('POST', '/fin/budgets', { user: person, json: { label: 'Ce mois', periodStart: start.toISOString(), periodEnd: end.toISOString(), currency: 'DZD' } });
      // An account, a goal, a movement and an asset, so that their details have something to open (P8-25).
      await t.request('POST', '/fin/actifs', { user: person, json: { label: 'Appartement', kind: 'property', value: 90000000, currency: 'DZD', valuedAt: new Date(Date.now() - 86_400_000).toISOString() } });
      await t.request('POST', '/fin/transactions', { user: person, json: { kind: 'expense', value: 150000, currency: 'DZD', occurredAt: new Date(Date.now() - 86_400_000).toISOString() } });
      await t.request('POST', '/fin/goals', { user: person, json: { label: 'Vacances', target: 5000000, currency: 'DZD', targetDate: new Date(Date.now() + 200 * 86_400_000).toISOString() } });
      await t.request('POST', '/fin/comptes', { user: person, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 0, openingDate: start.toISOString() } });
      await b.clearCookies();
      await b.send('Network.setCookie', { name: 'session', value: t.signSession(person.id), url: site.url, httpOnly: true });

      const lost = [];
      for (const screen of reachable) {
        await b.goto(`${site.url}/app`);
        await b.waitFor("document.querySelectorAll('.app-sidebar .app-nav-link').length >= 16", 'the sidebar');
        if (!(await firstClick(screen.via))) {
          lost.push(`${screen.code}: no menu entry ${screen.via}`);
          continue;
        }
        if (screen.to !== screen.via) {
          await b.waitFor(`location.pathname === ${JSON.stringify(screen.via)}`, screen.via);
          const link = linkTo(screen.to);
          if (!(await b.waitFor(`!!(${link})`, screen.to, 6000))) {
            lost.push(`${screen.code}: no link to ${screen.to} on ${screen.via}`);
            continue;
          }
          await b.ev(`(${link}).click()`);
        }
        const target = pattern(screen.to);
        if (!(await b.waitFor(`${target}.test(location.pathname)`, screen.to, 6000))) {
          lost.push(`${screen.code}: arrived on ${await path()} instead of ${screen.to}`);
          continue;
        }
        // The screen really shows: a heading, and no error state.
        const shown = await b.waitFor("!!document.querySelector('#app-main h1') && !document.querySelector('#app-main .status-hero[role=alert]')", 'the page', 6000);
        if (!shown) lost.push(`${screen.code}: ${screen.to} shows no heading, or an error`);
      }
      assert.deepEqual(lost, []);
    });
  }
});

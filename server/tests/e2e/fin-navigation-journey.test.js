import '../helpers/setup-env.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// The navigation of the application in a real browser. P1-12 asked for it
// first; P8-02 and P8-26 replaced its menu (« Mon argent », « Mes objectifs »…)
// by the client's final one — five sections, the four daily entries in a
// bottom bar on a phone (answer D3). The requirements did not change, so this
// file keeps proving them on the menu that exists now:
// - a side menu on a computer, beside the page;
// - on a phone, a bottom bar and « Plus » for the rest;
// - every entry reachable with the keyboard alone, visibly focused, the
//   current one marked without colour alone;
// - a declared minor loses the adults-only entries, and nothing else;
// - the period drives the figures the server answers;
// - the top bar carries the notifications and opens the assistant in place.
//
// `b.hasText(x)` builds a string of JavaScript: a text that must be there is
// WAITED for (`b.waitText`), never asserted from that string.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DAY = 86_400_000;

describe('P1-12 — the navigation of the application', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let adult;
  let minor;

  before(async () => {
    t = await boot();
    await t.reset();
    adult = await t.adult({ name: 'Salima Salariée', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    minor = await t.minor({ name: 'Lyes Lycéen', finPublic: 'LYC', finCurrency: 'DZD', finOnboardedAt: new Date() });
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

  const setSession = async (user) => {
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
  };
  const sidebarRoutes = () => b.ev("[...document.querySelectorAll('.app-sidebar a')].map((a) => a.getAttribute('href'))");

  // One Tab press, as a person makes it: a real key event, so the browser's own
  // focus order decides what comes next.
  const pressTab = async () => {
    for (const type of ['rawKeyDown', 'keyUp']) {
      await b.send('Input.dispatchKeyEvent', { type, windowsVirtualKeyCode: 9, key: 'Tab', code: 'Tab' });
    }
    await sleep(40);
  };
  const pressEnter = async () => {
    for (const type of ['rawKeyDown', 'char', 'keyUp']) {
      await b.send('Input.dispatchKeyEvent', { type, windowsVirtualKeyCode: 13, key: 'Enter', code: 'Enter', text: '\r' });
    }
    await sleep(400);
  };
  const focused = () => b.ev("(() => { const e = document.activeElement; return e ? `${e.tagName}:${(e.getAttribute('href') ?? e.textContent ?? '').trim().slice(0, 40)}` : 'none'; })()");

  test('on a computer, the five sections of the client stand beside the page', async () => {
    await setSession(adult);
    await b.setViewport(1280);
    await b.goto(`${site.url}/app/aujourdhui`);
    assert.ok(await b.waitFor("!!document.querySelector('.app-sidebar .app-nav-link')", 'the menu'), 'no menu rendered');
    const headings = await b.ev("[...document.querySelectorAll('.app-sidebar .app-nav-heading')].map((h) => h.textContent.trim())");
    assert.deepEqual(headings, Object.values(fr.appNav.sections), 'the five sections of the client, in order');

    const sideBySide = await b.ev(`(() => {
      const nav = document.querySelector('.app-sidebar').getBoundingClientRect();
      const main = document.querySelector('.app-main').getBoundingClientRect();
      return nav.width > 0 && nav.right <= main.left + 1 && nav.bottom > main.top + 40;
    })()`);
    assert.ok(sideBySide, 'the menu is not beside the page at 1280px');
    assert.ok((await sidebarRoutes()).includes('/app/dettes'), 'an adult has every entry');
  });

  test('on a phone, the four daily entries are a bottom bar, and « Plus » opens the rest', async () => {
    await b.setViewport(375, 760);
    await b.goto(`${site.url}/app/budgets`);
    assert.ok(await b.waitFor("!!document.querySelector('.app-bottom-nav .app-bottom-link')", 'the bottom bar'));
    assert.equal(await b.ev("document.querySelector('.app-sidebar').offsetParent"), null, 'the side menu still shows on a phone');
    const daily = await b.ev("[...document.querySelectorAll('.app-bottom-nav a')].map((a) => a.getAttribute('href'))");
    assert.deepEqual(daily, ['/app', '/app/aujourdhui', '/app/comptes', '/app/mouvements']);

    assert.ok(await b.click(fr.appNav.more));
    assert.ok(await b.waitFor("!!document.querySelector('#app-more a[href=\"/app/objectifs\"]')", 'the rest in « Plus »'));
  });

  test('every entry is reachable with the Tab key alone, and Enter follows it', async () => {
    await b.setViewport(1280);
    await b.goto(`${site.url}/app/aujourdhui`);
    await b.waitFor("!!document.querySelector('.app-sidebar .app-nav-link')");
    await b.ev('document.activeElement?.blur(); window.scrollTo(0, 0)');

    // Walk forward until the focus lands on the entry we want. No `focus()`
    // anywhere: if the order is wrong, this never arrives.
    let reached = null;
    for (let i = 0; i < 80 && !reached; i += 1) {
      await pressTab();
      const href = await b.ev("document.activeElement?.closest('.app-sidebar') ? (document.activeElement.getAttribute('href') ?? '') : ''");
      if (href === '/app/objectifs') reached = href;
    }
    assert.equal(reached, '/app/objectifs', `never reached the goals entry by keyboard (last focus: ${await focused()})`);
    await pressEnter();
    assert.ok(await b.waitFor("location.pathname === '/app/objectifs'", 'navigation to /app/objectifs'), 'Enter did not follow the focused entry');
  });

  test('the focused entry is visibly focused, and the current one is marked without colour alone', async () => {
    const ring = await b.ev(`(() => {
      const link = document.querySelector('.app-sidebar .app-nav-link');
      link.focus();
      const s = getComputedStyle(link);
      return s.outlineStyle !== 'none' || s.boxShadow !== 'none';
    })()`);
    assert.ok(ring, 'a focused menu entry shows nothing');
    // `aria-current` is what a screen reader announces; the style follows it.
    assert.equal(await b.ev("document.querySelector('.app-sidebar a[aria-current=\"page\"]')?.getAttribute('href')"), '/app/objectifs');
  });

  test('a declared minor loses the adults-only entries, and keeps their own money', async () => {
    await setSession(minor);
    await b.goto(`${site.url}/app/aujourdhui`);
    assert.ok(await b.waitFor("!!document.querySelector('.app-sidebar .app-nav-link')", 'the menu'));
    // The menu learns that the person is a declared minor from the server
    // (`GET /fin/parcours`, `mineurDeclare`): waited for, not read at once.
    assert.ok(await b.waitFor("!document.querySelector('.app-sidebar a[href=\"/app/dettes\"]')", 'the adults-only entries to go'), 'a minor is offered /app/dettes');
    const routes = await sidebarRoutes();
    for (const route of ['/app/dettes', '/app/patrimoine']) assert.ok(!routes.includes(route), `a minor is offered ${route}`);
    // The failure to guard against is over-hiding: a menu that protects a
    // minor by taking away their own pages is worse than the problem.
    for (const route of ['/app/aujourdhui', '/app/comptes', '/app/mouvements', '/app/budgets', '/app/objectifs', '/app/portefeuille', '/app/formation']) {
      assert.ok(routes.includes(route), `a minor lost ${route}`);
    }
  });

  test('the period is a real radio group, and the server answers for the window chosen', async () => {
    await setSession(adult);
    // An expense 40 days ago: outside « ce mois », inside « 90 jours ».
    await t.request('POST', '/fin/transactions', {
      user: adult,
      json: { kind: 'expense', value: 4_321_00, currency: 'DZD', occurredAt: new Date(Date.now() - 40 * DAY).toISOString() },
    });
    await b.goto(`${site.url}/app`);
    assert.ok(await b.waitFor("!!document.querySelector('.fin-period input[type=radio]')", 'the period selector'), 'no period selector');
    assert.equal(await b.ev("document.querySelector('.fin-period input:checked').value"), 'mois');
    const figures = () => b.ev("document.querySelector('.fin-figure-grid')?.innerText ?? ''");
    assert.ok(await b.waitFor("!!document.querySelector('.fin-figure-grid')", 'the figures'));
    const thisMonth = await figures();

    // Clicked on the radio itself: a label wrapping an input is what makes it
    // a radio group with free keyboard behaviour.
    assert.ok(await b.ev(`(() => { const i = document.querySelector('.fin-period input[value="90jours"]'); if (!i) return false; i.click(); return true; })()`));
    assert.ok(
      await b.waitFor(`(document.querySelector('.fin-figure-grid')?.innerText ?? '') !== ${JSON.stringify(thisMonth)}`, 'the figures to change'),
      'choosing 90 days did not change the figures the server answered',
    );
    assert.match(await figures(), /4\s?321/, 'the expense of 40 days ago is in the 90 days');
    assert.doesNotMatch(thisMonth, /4\s?321/, 'and it was not in this month');
    assert.equal(await b.ev("document.querySelector('.fin-period input:checked').value"), '90jours');
  });

  test('the top bar carries the notifications and opens the assistant without leaving the page', async () => {
    await b.goto(`${site.url}/app/aujourdhui`);
    assert.ok(await b.waitFor("!!document.querySelector('.notif-bell')", 'the bell'), 'no notification entry in the top bar');
    // The count is in the accessible name, not only in a coloured disc.
    assert.match(await b.ev("document.querySelector('.notif-bell').getAttribute('aria-label')"), /Notifications/);

    assert.ok(await b.clickWhere(`e => (e.getAttribute('title') ?? '') === ${JSON.stringify(fr.nav.assistant)}`), 'no help entry in the top bar');
    assert.ok(await b.waitFor("!!document.querySelector('.chatbot-panel')", 'the assistant panel'), 'the help entry opened nothing');
    assert.equal(await b.ev('location.pathname'), '/app/aujourdhui', 'the help entry navigated away');
  });
});

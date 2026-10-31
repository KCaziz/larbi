import '../helpers/setup-env.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// Gestion commune in a real browser (P9-12): a solution of its own, reached only
// from the switcher of the top bar, with a page for every compartment of a space
// reachable from its own menu — the « trouvable » rule. Nothing of it appears in
// the personal application's menu.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
// Every compartment of a group space, in the menu's order (SpaceFrame.jsx).
const SECTIONS = ['dashboard', 'expenses', 'budgets', 'pot', 'tasks', 'calendar', 'goals', 'report', 'members'];

describe('Gestion commune, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let owner;
  let space;

  before(async () => {
    t = await boot();
    await t.reset();
    owner = await t.adult({ name: 'Nadia Hôte', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    const friend = await t.adult({ name: 'Karim Ami', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    space = (await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'group', label: 'Week-end Tipaza', currency: 'DZD' } })).body.space;
    const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
    await t.request('POST', '/fin/espaces/rejoindre', { user: friend, json: { token: invite.body.token } });
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1280 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(owner.id), url: site.url, httpOnly: true });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('nothing of it is in the personal menu; the switcher in the top bar is the only door', async () => {
    await b.goto(`${site.url}/app`);
    await b.waitFor("document.querySelectorAll('.app-sidebar .app-nav-text').length >= 10", 'the sidebar');
    const sidebarLinks = await b.ev("[...document.querySelectorAll('.app-sidebar a')].map((a) => a.getAttribute('href'))");
    assert.ok(!sidebarLinks.some((href) => /partage|espaces/.test(href)), JSON.stringify(sidebarLinks));
    await b.waitFor(`[...document.querySelectorAll('.app-switcher a')].some((a) => a.getAttribute('href') === '/partage')`, 'the switcher');
    await b.shot('shared-switcher');
  });

  test('the switcher leads to Gestion commune, which lists the space', async () => {
    await b.ev(`document.querySelector('.app-switcher a[href="/partage"]').click()`);
    await b.waitFor("location.pathname === '/partage'", 'the address /partage');
    await b.waitText('Week-end Tipaza');
    // and back, with the same switcher
    await b.waitFor(`[...document.querySelectorAll('.app-switcher a')].some((a) => a.getAttribute('href') === '/app')`, 'the way back');
    await b.shot('shared-list');
  });

  test('every compartment of a space is reachable from its own menu, each at its own address', async () => {
    await b.ev(`[...document.querySelectorAll('.spaces-open')].find((a) => a.textContent.includes('Week-end Tipaza')).click()`);
    await b.waitFor(`location.pathname === '/partage/${space.id}'`, 'the space dashboard');
    await b.waitFor("document.querySelectorAll('.space-nav-link').length >= 9", 'the space menu');
    await b.waitFor("document.querySelectorAll('.space-overview .space-compartment').length >= 7", 'the dashboard blocks');
    await b.shot('shared-dashboard');
    const labels = await b.ev("[...document.querySelectorAll('.space-nav-link')].map((a) => a.textContent.trim())");
    assert.deepEqual(labels, SECTIONS.map((key) => fr.shared.sections[key]));

    const seen = new Set();
    for (const key of SECTIONS) {
      const label = fr.shared.sections[key];
      await b.ev(`[...document.querySelectorAll('.space-nav-link')].find((a) => a.textContent.trim() === ${JSON.stringify(label)}).click()`);
      await b.waitFor(`document.querySelector('.space-nav-link.active')?.textContent.trim() === ${JSON.stringify(label)}`, `the page ${label}`);
      seen.add(await b.ev('location.pathname'));
    }
    assert.equal(seen.size, SECTIONS.length, 'one address per compartment');
    await b.shot('shared-space');
  });

  test('the space page tells where the person is: the title and the way back', async () => {
    await b.waitFor(`document.querySelector('main h1')?.textContent.includes('Week-end Tipaza')`, 'the space title');
    assert.ok(await b.ev(`[...document.querySelectorAll('a')].some((a) => a.getAttribute('href') === '/partage')`), 'a way back to the list');
  });

  test('on a phone the menu still reaches every compartment, without a sideways scroll', async () => {
    await b.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 800, deviceScaleFactor: 1, mobile: true });
    await b.goto(`${site.url}/partage/${space.id}`);
    await b.waitFor("document.querySelectorAll('.space-nav-link').length >= 9", 'the space menu');
    assert.ok(await b.ev('document.documentElement.scrollWidth <= window.innerWidth + 1'), 'no horizontal page scroll');
    // The door between the two applications stays on a phone (« trouvable »), on both sides.
    assert.ok(await b.ev(`(() => { const a = document.querySelector('.app-switcher a[href="/app"]'); return !!a && a.getBoundingClientRect().width >= 44; })()`), 'the way back is visible on a phone');
    await b.shot('shared-phone');
    await b.goto(`${site.url}/app`);
    await b.waitFor(`!!document.querySelector('.app-switcher a[href="/partage"]')`, 'the switcher of the personal app');
    assert.ok(await b.ev(`document.querySelector('.app-switcher a[href="/partage"]').getBoundingClientRect().width >= 44`), 'the door to Gestion commune is visible on a phone');
    await b.send('Emulation.clearDeviceMetricsOverride');
  });
});

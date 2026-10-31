import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';

// P8-24 on the Accueil: on a phone, the quick add is a sheet over the page, not
// the Mouvements page; on a computer the same button goes to the page. And the
// net flow follows the scroll as a slim bar once the ring is behind.

describe('the Accueil on a phone', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let user;

  const month = (shift) => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + shift, 10, 12)).toISOString();

  before(async () => {
    t = await boot();
    await t.reset();
    user = await t.adult({ name: 'Salima Mobile', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    for (const shift of [-2, -1, 0]) {
      await t.request('POST', '/fin/transactions', { user, json: { kind: 'income', value: 8000000, currency: 'DZD', occurredAt: month(shift) } });
      await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value: 3000000, currency: 'DZD', occurredAt: month(shift) } });
    }
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 390 });
    await b.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 800, deviceScaleFactor: 1, mobile: true });
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

  test('the shortcut opens a sheet over the Accueil, which Escape closes, focus going back', async () => {
    await b.goto(`${site.url}/app`);
    await b.waitFor("!!document.querySelector('.home-shortcuts a[href=\"/app/mouvements/nouveau\"]')", 'the shortcut');
    await b.ev("document.querySelector('.home-shortcuts a[href=\"/app/mouvements/nouveau\"]').click()");
    await b.waitFor("!!document.querySelector('[role=dialog].quick-add-sheet')", 'the sheet');
    assert.equal(await b.ev('location.pathname'), '/app', 'the person is still on the Accueil');
    assert.ok(await b.ev("document.body.style.overflow === 'hidden'"), 'the page behind does not scroll');
    assert.ok(await b.ev("document.querySelector('.quick-add-sheet').contains(document.activeElement)"), 'focus is inside the sheet');
    await new Promise((r) => setTimeout(r, 500));
    await b.shot('quickadd-sheet');
    await b.ev("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))");
    await b.waitFor("!document.querySelector('[role=dialog]')", 'the sheet closed');
    assert.equal(await b.ev("document.activeElement?.getAttribute('href')"), '/app/mouvements/nouveau', 'focus is back on the button');
  });

  test('saving in the sheet records the movement and refreshes the page behind it', async () => {
    await b.goto(`${site.url}/app`);
    await b.waitFor("!!document.querySelector('.home-shortcuts a[href=\"/app/mouvements/nouveau\"]')", 'the shortcut');
    const before = await t.prisma.finTransaction.count({ where: { userId: user.id } });
    await b.ev("document.querySelector('.home-shortcuts a[href=\"/app/mouvements/nouveau\"]').click()");
    await b.waitFor("!!document.querySelector('.quick-add-sheet form')", 'the form');
    await b.waitFor("document.querySelectorAll('.quick-add-sheet select option').length > 3", 'the lookups');
    await b.ev(`(() => {
      const input = document.querySelector('.quick-add-sheet input[inputmode="decimal"], .quick-add-sheet input[type="number"], .quick-add-sheet input[type="text"]');
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      set.call(input, '1500');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('.quick-add-sheet form').requestSubmit();
    })()`);
    await b.waitFor("!document.querySelector('[role=dialog]')", 'the sheet closed after saving', 15_000);
    const after = await t.prisma.finTransaction.count({ where: { userId: user.id } });
    assert.equal(after, before + 1);
    assert.equal(await b.ev('location.pathname'), '/app');
  });

  test('scrolled past the ring, the net flow stays on screen as a slim bar', async () => {
    await b.goto(`${site.url}/app`);
    await b.waitFor("!!document.getElementById('home-ring-section')", 'the ring');
    assert.ok(!(await b.ev("!!document.querySelector('.home-miniflow')")), 'nothing while the ring is in view');
    await b.ev("window.scrollTo(0, document.body.scrollHeight)");
    await b.waitFor("!!document.querySelector('.home-miniflow')", 'the mini flow', 10_000);
    assert.match(await b.ev("document.querySelector('.home-miniflow').textContent"), /Flux net/);
    await b.shot('home-miniflow');
  });
});

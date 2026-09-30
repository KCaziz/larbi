import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// Guided tour shown to an administrator the first time they open the admin
// (this session's follow-up request): appears once, can be skipped or stepped
// through, never comes back on its own once dismissed, and can be reopened.

const bcrypt = createRequire(import.meta.url)('bcryptjs');
const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const PASSWORD = 'Passw0rd!test';

describe('admin guided tour, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  before(async () => {
    t = await boot();
    await t.reset();
    await t.admin({ name: 'Camille', email: 'camille@example.com', passwordHash: await bcrypt.hash(PASSWORD, 10) });
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1400, height: 1000 });
    await b.goto(`${site.url}/connexion`);
    await b.waitFor("!!document.querySelector('#email')");
    await b.type('#email', 'camille@example.com');
    await b.type('#password', PASSWORD);
    await b.click(fr.auth.login.submit);
    assert.ok(await b.waitFor("location.pathname !== '/connexion'"));
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('opens by itself on the first visit to the admin, and steps through the real menu', async () => {
    await b.goto(`${site.url}/admin`);
    assert.ok(await b.waitFor("!!document.querySelector('.cms-tour[open]')"));
    assert.ok(await b.waitText(fr.admin.nav.dashboard));
    await b.clickWhere(`e => e.tagName === 'BUTTON' && e.textContent.trim() === ${JSON.stringify(fr.admin.tour.next)}`);
    assert.ok(await b.waitText(fr.admin.nav.formations));
    assert.ok(await b.ev(`!![...document.querySelectorAll('.cms-tour button')].find((e) => e.textContent.trim() === ${JSON.stringify(fr.admin.tour.previous)})`), 'a way back appears from the second step');
  });

  test('"Passer" dismisses it, and it does not come back on its own afterwards', async () => {
    await b.clickWhere(`e => e.tagName === 'BUTTON' && e.textContent.trim() === ${JSON.stringify(fr.admin.tour.skip)}`);
    assert.ok(await b.waitFor("!document.querySelector('.cms-tour[open]')"));
    await b.goto(`${site.url}/admin/articles`);
    await b.waitFor("!!document.querySelector('.cms-tour-reopen')");
    assert.equal(await b.ev("!!document.querySelector('.cms-tour[open]')"), false);
    await b.goto(`${site.url}/admin`);
    assert.equal(await b.ev("!!document.querySelector('.cms-tour[open]')"), false, 'not shown again after a reload');
  });

  test('the "?" button reopens it on demand', async () => {
    await b.clickWhere("e => e.classList.contains('cms-tour-reopen')");
    assert.ok(await b.waitFor("!!document.querySelector('.cms-tour[open]')"));
    assert.ok(await b.waitText(fr.admin.nav.dashboard), 'restarts from the first step');
  });

  test('no JavaScript error during the whole journey', () => {
    assert.deepEqual(b.jsErrors, []);
  });
});

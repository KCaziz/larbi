import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// Maintenance mode in a real browser (P3-16 follow-up): once it is on, a
// standard visitor gets the maintenance notice on every route except the
// login page (an administrator still needs a way in); an administrator keeps
// browsing the real site, with a banner reminding them it is on. The API
// enforces the same rule independently (functional/admin-platform.test.js):
// this only checks the visible half of it.

const bcrypt = createRequire(import.meta.url)('bcryptjs');
const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const PASSWORD = 'Passw0rd!test';

describe('maintenance mode, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  const setMaintenance = (on) =>
    t.prisma.platformSetting.upsert({
      where: { key: 'maintenanceMode' },
      update: { value: String(on) },
      create: { key: 'maintenanceMode', value: String(on) },
    });

  const login = async (email) => {
    await b.clearCookies();
    await b.goto(`${site.url}/connexion`);
    await b.waitFor("!!document.querySelector('#email')");
    await b.type('#email', email);
    await b.type('#password', PASSWORD);
    await b.click(fr.auth.login.submit);
    assert.ok(await b.waitFor("location.pathname !== '/connexion'"));
  };

  before(async () => {
    t = await boot();
    await t.reset();
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    await t.admin({ name: 'Admin', email: 'admin@example.com', passwordHash });
    await t.user({ name: 'Standard', email: 'standard@example.com', passwordHash });
    await t.article({ title: 'Article public', status: 'published' });
    site = await startSite(t.baseUrl);
    b = await Browser.launch();
  });

  after(async () => {
    await setMaintenance(false);
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('a standard visitor gets the maintenance page on every route except the login page', async () => {
    await setMaintenance(true);
    await login('standard@example.com');

    await b.goto(`${site.url}/`);
    assert.ok(await b.waitText(fr.maintenance.title));
    await b.goto(`${site.url}/blog`);
    assert.ok(await b.waitText(fr.maintenance.title));
    assert.ok(!(await b.text()).includes('Article public'), 'no real content leaks through');
    await b.goto(`${site.url}/compte/tableau-de-bord`);
    assert.ok(await b.waitText(fr.maintenance.title));

    await b.clearCookies();
    await b.goto(`${site.url}/inscription`);
    assert.ok(await b.waitText(fr.maintenance.title), 'no new account while the site is closed');

    await b.goto(`${site.url}/connexion`);
    assert.ok(await b.waitText(fr.auth.login.submit), 'the login form itself stays reachable');
    assert.ok(!(await b.text()).includes(fr.maintenance.title));
  });

  test('an administrator keeps browsing the real site, with a reminder banner', async () => {
    await login('admin@example.com');
    await b.goto(`${site.url}/blog`);
    assert.ok(await b.waitText('Article public'));
    assert.ok(await b.waitText(fr.maintenance.banner));
    assert.ok(!(await b.text()).includes(fr.maintenance.title));
  });

  test('once maintenance is turned back off, the standard visitor sees the real site again', async () => {
    await setMaintenance(false);
    await login('standard@example.com');
    await b.goto(`${site.url}/blog`);
    assert.ok(await b.waitText('Article public'));
    assert.ok(!(await b.text()).includes(fr.maintenance.title));
    assert.ok(!(await b.text()).includes(fr.maintenance.banner));
  });

  test('no JavaScript error during the whole journey', () => {
    assert.deepEqual(b.jsErrors, []);
  });
});

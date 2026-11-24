import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P13-05: the window of the administration that asks the client to confirm
// the regulatory values of the référentiel (tab 25_PARAMETRES), one by one,
// with the date each applies from.

const bcrypt = createRequire(import.meta.url)('bcryptjs');
const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const PASSWORD = 'Passw0rd!test';

describe('regulatory values to confirm, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  before(async () => {
    t = await boot();
    await t.reset();
    // Nothing answered yet: the state of a new installation.
    await t.prisma.platformSetting.deleteMany({ where: { key: 'regulatoryParams' } });
    await t.admin({ name: 'Nadia', email: 'nadia@example.com', passwordHash: await bcrypt.hash(PASSWORD, 10) });
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1300, height: 950 });
    await b.goto(`${site.url}/connexion`);
    await b.waitFor("!!document.querySelector('#email')");
    await b.type('#email', 'nadia@example.com');
    await b.type('#password', PASSWORD);
    await b.click(fr.auth.login.submit);
    assert.ok(await b.waitFor("location.pathname !== '/connexion'"));
  });

  after(async () => {
    await b?.close();
    site?.stop();
    // Leave the database as reset() leaves it for the other journeys.
    await t.reset();
    await t.close();
  });

  test('the window opens in the administration, with the proposed values and no code on screen', async () => {
    await b.goto(`${site.url}/admin`);
    assert.ok(await b.waitFor("!!document.querySelector('.regulatory-dialog[open]')", 'the window', 15_000));
    assert.equal(await b.ev("document.querySelectorAll('.regulatory-item').length"), 20);
    const text = await b.ev("document.querySelector('.regulatory-dialog').textContent");
    assert.ok(text.includes(fr.admin.regulatory.params['PARM-002'].name));
    assert.ok(!/PARM-\d/.test(text), 'no internal code is shown');
    assert.equal(await b.ev("document.querySelector('.regulatory-item input').value"), '0,5', 'the IFU rate proposed, in percent');
    await b.shot('regulatory-window');
  });

  test('« Je confirme » records the value and its date, and the item leaves the list', async () => {
    await b.ev("document.querySelector('.regulatory-confirm').click(); true");
    assert.ok(await b.waitFor("document.querySelectorAll('.regulatory-item').length === 19", 'one less to confirm', 10_000));
    const stored = JSON.parse((await t.prisma.platformSetting.findUnique({ where: { key: 'regulatoryParams' } })).value);
    assert.equal(stored['PARM-002'].value, '0.005');
    assert.match(stored['PARM-002'].effectiveFrom, /^\d{4}-\d{2}-\d{2}$/);
  });

  test('« Plus tard » closes it for this visit; it comes back while values are left', async () => {
    await b.clickWhere(`e => e.tagName === 'BUTTON' && e.textContent.trim() === ${JSON.stringify(fr.admin.regulatory.later)}`);
    assert.ok(await b.waitFor("!document.querySelector('.regulatory-dialog')"));
    await b.goto(`${site.url}/admin/articles`);
    await b.waitFor("!!document.querySelector('.cms-content')");
    assert.equal(await b.ev("!!document.querySelector('.regulatory-dialog')"), false, 'not again in the same visit');
    await b.ev("sessionStorage.clear(); true");
    await b.goto(`${site.url}/admin`);
    assert.ok(await b.waitFor("!!document.querySelector('.regulatory-dialog[open]')", 'back on the next visit', 15_000));
  });
});

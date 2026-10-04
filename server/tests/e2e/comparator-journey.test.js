import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// The bank comparator in a real browser (P4-07, P4-08): a visitor browses the
// client's data (rubrics, filters, sort by estimated yearly cost, segment view,
// phone layout, Arabic), and an administrator changes the data, which the public
// pages show at once. The rules themselves are tested on the API
// (functional/comparator.test.js); this checks what people actually see.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const c = fr.comparator;
const BANK = 'Banque Essai E2E';

describe('bank comparator, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let admin;

  const rows = () => b.ev("[...document.querySelectorAll('.comparator-table tbody tr')].map((tr) => tr.innerText)");
  // Picks an option of a React-controlled <select> the way a user would (change event).
  const choose = (selector, optionText) =>
    b.ev(`(() => {
      const select = document.querySelector(${JSON.stringify(selector)});
      const option = [...select.options].find((o) => o.textContent.trim() === ${JSON.stringify(optionText)});
      if (!option) return false;
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, option.value);
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
  const clickLabelled = (label) => b.clickWhere(`e => (e.getAttribute('aria-label') ?? '') === ${JSON.stringify(label)}`);
  const setSession = (user) =>
    user ? b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true }) : b.clearCookies();

  before(async () => {
    t = await boot();
    await t.reset();
    await t.loadComparatorData();
    admin = await t.admin({ name: 'Admin Comparateur' });
    site = await startSite(t.baseUrl);
    b = await Browser.launch();
    // The texts below are the French ones, whatever the language of the machine.
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('from the tools page to the comparator: the 11 rubrics, the undocumented ones say so', async () => {
    await b.goto(`${site.url}/outils`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/outils/comparateur'"));
    assert.ok(await b.waitText(c.bankCount_other.replace('{{count}}', '13')));
    assert.ok(await b.waitText(c.conditionCount_other.replace('{{count}}', '152')));
    const text = await b.text();
    for (const key of Object.keys(c.themes)) assert.ok(text.includes(c.themes[key]), `rubric ${key} is listed`);
    assert.equal(await b.ev("document.querySelectorAll('.theme-card-empty').length"), 3, 'safe boxes, domestic transfers, cheques');
    assert.equal(await b.ev("document.querySelectorAll('a.theme-card').length"), 8);
  });

  test('a rubric: the client texts as written, filters, search, sort by estimated yearly cost', async () => {
    await b.goto(`${site.url}/outils/comparateur/comptes`);
    assert.ok(await b.waitFor("document.querySelectorAll('.comparator-table tbody tr').length === 26"));
    assert.ok(await b.waitText('1 260,5 DA'), 'amounts are shown exactly as in the client file');
    assert.ok(await b.waitText(c.labelHeaders.comptes.toUpperCase()), "the rubric's own column name");

    assert.ok(await b.click(c.sortByCost));
    await b.waitFor("document.querySelector('.comparator-table tbody tr td.cost-cell')?.innerText.length > 0");
    const sorted = await rows();
    assert.match(sorted[0], new RegExp(c.free), 'free accounts first');
    assert.match(sorted[3], /300 DA\/an/, 'then the cheapest paying one (75 DA x 4 or 300 DA a year)');

    assert.ok(await choose('.comparator-controls select', 'CPA'));
    assert.ok(await b.waitFor("document.querySelectorAll('.comparator-table tbody tr').length === 2"));
    assert.ok(await choose('.comparator-controls select', c.allBanks));
    await b.type('.comparator-controls input[type=search]', 'Corporate');
    assert.ok(await b.waitFor("document.querySelectorAll('.comparator-table tbody tr').length === 1"));
    assert.match((await rows())[0], /ABC Bank/);
  });

  test('savings: profit shares keep their own wording and are never ranked', async () => {
    await b.goto(`${site.url}/outils/comparateur/epargne`);
    assert.ok(await b.waitText(c.themeFields.epargne.rate.toUpperCase()));
    assert.ok(await b.waitText('53,27% (Part Client) / 46,73% (Part Banque)'));
    assert.equal(await b.ev(`document.body.innerText.includes(${JSON.stringify(c.sortByCost)})`), false, 'no cost sort for savings');
  });

  test('segment view = the client tab 12; unknown rubric and "non précisé" are not found', async () => {
    await b.goto(`${site.url}/outils/comparateur/segments/entreprise`);
    assert.ok(await b.waitText('Compte Commercial DZD (Entreprise)'));
    assert.ok(await b.waitText('Financement Exploitation (Entreprise)'));
    assert.ok(!(await b.text()).includes('Compte Chèque (Particulier)'));

    for (const route of ['/outils/comparateur/inexistant', '/outils/comparateur/segments/non_precise']) {
      await b.goto(site.url + route);
      assert.ok(await b.waitText(fr.notFound.title), `${route} shows the not-found page`);
    }
  });

  test('phone width in Arabic: cards instead of the table, right to left, no horizontal scroll', async () => {
    await b.setViewport(375);
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'ar')");
    await b.goto(`${site.url}/outils/comparateur/carte-internationale`);
    assert.ok(await b.waitFor("document.querySelectorAll('.condition-card').length === 12"));
    assert.equal(await b.ev('document.documentElement.dir'), 'rtl');
    assert.equal(await b.ev("getComputedStyle(document.querySelector('.comparator-table-wrap')).display"), 'none');
    assert.equal(await b.ev('document.documentElement.scrollWidth - window.innerWidth <= 0'), true);
    await b.shot('comparator-ar-375');
    await b.ev("localStorage.setItem('lang', 'fr')");
    await b.setViewport(1280);
  });

  test('administration: a new bank and condition show at once on the public pages, then are removed', async () => {
    await setSession(admin);
    await b.goto(`${site.url}/admin/comparateur`);
    assert.ok(await b.waitText(c.admin.title));
    assert.ok(await b.waitText('ABC Bank'));

    assert.ok(await b.click(c.admin.addBank));
    await b.waitFor("!!document.querySelector('.comparator-admin-form input')");
    await b.type('.comparator-admin-form input', BANK);
    assert.ok(await b.click(c.admin.save));
    assert.ok(await b.waitText(BANK));

    assert.ok(await b.clickTab(c.admin.conditions));
    assert.ok(await b.waitText('Compte Courant (Corporate)'));
    assert.ok(await b.click(c.admin.addCondition));
    await b.waitFor("!!document.querySelector('.comparator-condition-form')");
    assert.ok(await choose('.comparator-condition-form select', BANK));
    const inputs = '.comparator-condition-form input';
    await b.type(`${inputs}:nth-of-type(1)`, 'Compte Essai');
    await b.ev(`document.querySelectorAll(${JSON.stringify(inputs)})[1].focus()`);
    await b.send('Input.insertText', { text: '50 DA' });
    await b.ev(`document.querySelectorAll(${JSON.stringify(inputs)})[2].focus()`);
    await b.send('Input.insertText', { text: 'Mensuel' });
    assert.ok(await b.click(c.admin.save));
    assert.ok(await b.waitText(c.admin.saved));
    assert.ok(await b.waitText('Compte Essai'));

    // Editing keeps the bank and the other columns, changes only what was retyped.
    assert.ok(await clickLabelled(`${c.admin.editCondition} — ${BANK}, Compte Essai`));
    await b.waitFor("!!document.querySelector('.comparator-condition-form')");
    assert.equal(await b.ev("document.querySelector('.comparator-condition-form select').selectedOptions[0].textContent"), BANK);
    await b.ev(`(() => { const e = document.querySelectorAll(${JSON.stringify(inputs)})[1]; e.focus(); e.select(); })()`);
    await b.send('Input.insertText', { text: '100 DA' });
    assert.ok(await b.click(c.admin.save));
    assert.ok(await b.waitFor("!document.querySelector('.comparator-condition-form')"));
    assert.ok(await b.waitText('100 DA'));

    await b.goto(`${site.url}/outils/comparateur/comptes`);
    assert.ok(await b.waitText('Compte Essai'));
    const mine = (await rows()).find((r) => r.includes(BANK));
    assert.match(mine, /100 DA\tMensuel/);
    assert.match(mine, /1\s200 DA\/an/, '100 DA a month = 1 200 DA a year, computed by the server');

    await b.goto(`${site.url}/admin/comparateur`);
    assert.ok(await b.waitText(BANK));
    assert.ok(await clickLabelled(`${c.admin.deleteBank} — ${BANK}`));
    assert.ok(await b.waitFor("[...document.querySelectorAll('dialog.cms-dialog')].some((d) => d.open)"));
    assert.ok(await b.clickWhere(`e => e.closest('dialog[open]') && e.textContent.trim() === ${JSON.stringify(c.admin.deleteBank)}`));
    assert.ok(await b.waitFor(`!document.body.innerText.includes(${JSON.stringify(BANK)})`));
    assert.equal(await t.prisma.comparatorBank.count({ where: { name: BANK } }), 0);
    assert.equal(await t.prisma.comparatorCondition.count({ where: { label: 'Compte Essai' } }), 0, 'its conditions went with it');

    await b.goto(`${site.url}/outils/comparateur/comptes`);
    assert.ok(await b.waitFor("document.querySelectorAll('.comparator-table tbody tr').length === 26"));
  });

  test('no JavaScript error and no unexpected HTTP error during the whole journey', () => {
    assert.deepEqual(b.jsErrors, []);
    const unexpected = b.badResponses.filter((r) => !/^401 \/api\/auth\/me$/.test(r) && !/^404 \/api\/tools\/comparator\/(themes\/inexistant|segments\/non_precise)$/.test(r));
    assert.deepEqual(unexpected, []);
  });
});

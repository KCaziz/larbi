import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// The application in its own window (P8-02), in a real browser: the client's
// final menu, the same for a lycéen and a salarié (QA-V7-01), usable below
// 768 px (QA-V7-05), and the former addresses still arriving.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
// The order retained on 2026-10-28 (answer D3 and its improvements).
const FINANCIAL_ENTRIES = ['home', 'today', 'accounts', 'movements', 'budgets', 'calendar', 'synthesis', 'health', 'goals', 'debts', 'wealth', 'paper', 'tools'].map((key) => fr.appNav[key]);

describe('the application shell, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  const signIn = async (user) => {
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
  };
  const sidebarLabels = () => b.ev("[...document.querySelectorAll('.app-sidebar .app-nav-text')].map((e) => e.textContent.trim())");

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

  test('a lycéen and a salarié see the same financial menu, in the client’s order (QA-V7-01)', async () => {
    const menus = [];
    for (const finPublic of ['LYC', 'SAL']) {
      await signIn(await t.adult({ finPublic }));
      await b.goto(`${site.url}/app`);
      await b.waitFor("document.querySelectorAll('.app-sidebar .app-nav-text').length >= 16", 'the sidebar');
      menus.push(await sidebarLabels());
    }
    assert.deepEqual(menus[0], menus[1]);
    assert.deepEqual(menus[0].slice(0, FINANCIAL_ENTRIES.length), FINANCIAL_ENTRIES);
    await b.shot('app-desktop');
  });

  test('a declared minor does not see the adults-only entries', async () => {
    await signIn(await t.minor({ finPublic: 'LYC' }));
    await b.goto(`${site.url}/app`);
    // The menu first renders before the account is loaded, with all 13 entries:
    // wait for the account's own menu, not for the first one.
    await b.waitFor("document.querySelectorAll('.app-sidebar .app-nav-text').length === 14", 'the sidebar of a minor');
    const labels = await sidebarLabels();
    assert.ok(!labels.includes(fr.appNav.debts) && !labels.includes(fr.appNav.wealth), labels.join(', '));
  });

  test('below 768 px, a bottom bar and the « Plus » sheet replace the sidebar (QA-V7-05)', async () => {
    await signIn(await t.adult({ finPublic: 'ETU' }));
    await b.setViewport(390, 844);
    await b.goto(`${site.url}/app`);
    await b.waitFor("document.querySelectorAll('.app-bottom-link').length === 5", 'the bottom bar');
    assert.equal(await b.ev("getComputedStyle(document.querySelector('.app-sidebar')).display"), 'none');
    // No horizontal scroll on the home page.
    assert.ok(await b.ev('document.documentElement.scrollWidth <= window.innerWidth + 1'), 'the page scrolls sideways');
    await b.shot('app-phone');
    await b.ev("[...document.querySelectorAll('.app-bottom-link')].at(-1).click()");
    assert.ok(await b.waitText(fr.appNav.health), 'the sheet lists the other entries');
    await b.shot('app-phone-more');
    await b.setViewport(1280, 1000);
  });

  test('the former addresses arrive in the application', async () => {
    await signIn(await t.adult({ finPublic: 'SAL' }));
    for (const [from, to] of [
      ['/mon-argent', '/app/synthese'],
      ['/compte/categories', '/app/parametres/categories'],
      ['/outils/comparateur', '/app/outils/comparateur'],
    ]) {
      await b.goto(`${site.url}${from}`);
      await b.waitFor(`location.pathname === ${JSON.stringify(to)}`, `${from} → ${to}`);
    }
  });

  test('« Mes comptes » shows balances, liabilities apart and alerts in words (P8-05)', async () => {
    const owner = await t.adult({ finPublic: 'SAL' });
    await signIn(owner);
    const post = (url, json) => t.request('POST', url, { user: owner, json });
    const ago = (days) => new Date(Date.now() - days * 86_400_000).toISOString();
    const current = (await post('/fin/comptes', { label: 'Compte courant', type: 'AC-02', currency: 'DZD', openingBalance: 5000000, openingDate: ago(60), minBalanceAlert: 6000000 })).body.account;
    await post('/fin/comptes', { label: 'Épargne', type: 'AC-04', currency: 'DZD', openingDate: ago(60) });
    await post('/fin/comptes', { label: 'Carte de crédit', type: 'AC-07', currency: 'DZD', openingBalance: 1200000, openingDate: ago(60) });
    await post('/fin/transactions', { kind: 'expense', value: 300000, currency: 'DZD', accountId: current.id, occurredAt: ago(2) });
    await b.goto(`${site.url}/app/comptes`);
    assert.ok(await b.waitText(fr.accounts.alerts.belowMinimum), 'the alert is written');
    assert.ok(await b.waitText(fr.accounts.liabilities), 'liabilities are apart');
    await b.shot('app-accounts');
  });

  test('« Mouvements » lists by tab and offers the clearing screen (P8-07)', async () => {
    const owner = await t.adult({ finPublic: 'SAL' });
    await signIn(owner);
    const ago = (days) => new Date(Date.now() - days * 86_400_000).toISOString();
    for (const [kind, value] of [['expense', 450000], ['income', 6000000], ['expense', 120000]]) {
      await t.request('POST', '/fin/transactions', { user: owner, json: { kind, value, currency: 'DZD', occurredAt: ago(2), paymentMethod: 'PM-02', note: 'Essai' } });
    }
    await b.goto(`${site.url}/app/mouvements`);
    assert.ok(await b.waitText(fr.movements.tabs.clearing), 'the tabs');
    await b.waitFor("document.querySelectorAll('.money-row').length === 3", 'three movements');
    await b.shot('app-movements');
    // The clearing is its own screen now (TRX-04, P8-25), one click away.
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/app/mouvements/pointage'"), 'the clearing screen is offered');
    assert.ok(await b.waitText(fr.movements.clearingRate), 'the clearing rate');
  });

  test('the Accueil shows the balance, the ring and the cards (P8-06)', async () => {
    const owner = await t.adult({ finPublic: 'JAC' });
    await signIn(owner);
    const ago = (days) => new Date(Date.now() - days * 86_400_000).toISOString();
    const category = async (key) => (await t.prisma.finCategory.findFirst({ where: { key, userId: null }, select: { id: true } })).id;
    const account = (await t.request('POST', '/fin/comptes', { user: owner, json: { label: 'Compte courant', type: 'AC-02', currency: 'DZD', openingBalance: 8000000, openingDate: ago(40) } })).body.account;
    for (const [key, value] of [['fixed.loyer', 3000000], ['variable.alimentation_boissons', 900000], ['variable.restaurant', 250000], ['variable.carburant', 400000]]) {
      await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value, currency: 'DZD', occurredAt: ago(1), accountId: account.id, categoryId: await category(key) } });
    }
    await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'income', value: 6500000, currency: 'DZD', occurredAt: ago(2), accountId: account.id, categoryId: await category('income.salaire_net') } });
    await b.goto(`${site.url}/app`);
    assert.ok(await b.waitText(fr.appHome.budgets), 'the cards');
    await b.waitFor("document.querySelectorAll('.home-ring-legend-item').length >= 4", 'the ring legend');
    await b.shot('app-home');
    await b.ev("document.querySelector('.home-ring-section').scrollIntoView()");
    await b.shot('app-home-ring');
    await b.ev("document.querySelector('.home-grid').scrollIntoView()");
    await b.shot('app-home-cards');
    // The Synthèse of the same month (P8-10).
    await b.goto(`${site.url}/app/synthese`);
    assert.ok(await b.waitText(fr.synthesis.sections.R03), 'the sections');
    await b.shot('app-synthesis');
    await b.setViewport(390, 844);
    await b.goto(`${site.url}/app`);
    await b.waitFor("document.querySelectorAll('.home-ring-legend-item').length >= 4", 'the ring legend on a phone');
    assert.ok(await b.ev('document.documentElement.scrollWidth <= window.innerWidth + 1'), 'no sideways scroll');
    await b.shot('app-home-phone');
    await b.setViewport(1280, 1000);
  });

  test('in Arabic, the shell is right to left', async () => {
    await b.ev("localStorage.setItem('lang', 'ar')");
    await b.goto(`${site.url}/app/comptes`);
    await b.waitFor("document.documentElement.dir === 'rtl'", 'rtl');
    await b.waitFor("document.querySelector('.app-sidebar') !== null", 'the sidebar');
    await b.shot('app-rtl');
    await b.ev("localStorage.setItem('lang', 'fr')");
  });
});

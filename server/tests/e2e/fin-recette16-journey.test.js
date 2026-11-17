import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';

// SUIVI_RECETTE R16, through the screens: a new account's opening balance is
// its « revenu initial » (Accueil and account page), the account page shows its
// budget and the envelope of each expense, and the ring is bigger, on the
// right of its description, in marked colours.

describe('the ninth pass, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let user;
  let account;

  const as = (method, path, json) => t.request(method, `/fin${path}`, { user, ...(json === undefined ? {} : { json }) });
  const monthStart = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
  const monthEnd = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 0));
  const soon = () => new Date(Date.now() - 3600_000).toISOString();

  before(async () => {
    t = await boot({ subscribers: true });
    await t.reset();
    user = await t.adult({ name: 'Nadia Neuvième', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    // A new account, opened today, and no income declared.
    account = (await as('POST', '/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 15000000 })).body.account;
    const food = await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null }, select: { id: true } });
    const transport = await t.prisma.finCategory.findFirst({ where: { key: 'variable.transport_public', userId: null }, select: { id: true } });
    await as('POST', '/budgets', {
      label: 'Ce mois',
      periodStart: monthStart().toISOString().slice(0, 10),
      periodEnd: monthEnd().toISOString().slice(0, 10),
      currency: 'DZD',
      accountId: account.id,
      envelopes: [{ categoryId: food.id, kind: 'variable', value: 4000000 }],
    });
    await as('POST', '/transactions', { kind: 'expense', value: 1200000, currency: 'DZD', occurredAt: soon(), accountId: account.id, categoryId: food.id, note: 'Courses' });
    await as('POST', '/transactions', { kind: 'expense', value: 300000, currency: 'DZD', occurredAt: soon(), accountId: account.id, categoryId: transport.id, note: 'Bus' });

    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1100, height: 1000 });
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

  test('the Accueil counts the opening balance as income, and draws a bigger ring on the right', async () => {
    await b.goto(`${site.url}/app`);
    assert.ok(await b.waitText('de revenu initial', 20_000), 'the part of the income that is the starting balance');
    await b.ev("[...document.querySelectorAll('.movements-tab')].find((e) => e.textContent.includes('Revenus'))?.click()");
    await b.waitFor("[...document.querySelectorAll('.home-ring-legend-label')].some((e) => e.textContent.includes('Revenu initial'))", 'the revenu initial slice', 10_000);
    const box = await b.ev(`(() => {
      const legend = document.querySelector('.home-ring .home-ring-legend').getBoundingClientRect();
      const ring = document.querySelector('.home-ring .home-ring-svg').getBoundingClientRect();
      return { legendRight: legend.right, ringLeft: ring.left, ringWidth: ring.width };
    })()`);
    assert.ok(box.ringLeft >= box.legendRight - 1, `the ring right of its description: ${JSON.stringify(box)}`);
    assert.ok(box.ringWidth >= 280, `bigger: ${box.ringWidth}px`);
    await b.ev("document.querySelector('.home-ring-section').scrollIntoView({ block: 'start' })");
    await b.shot('recette16-home');
  });

  test('the account page says the revenu initial, its budget, and the envelope of each expense', async () => {
    await b.goto(`${site.url}/app/comptes/${account.id}`);
    assert.ok(await b.waitText('Revenu initial', 20_000));
    assert.ok(await b.waitText('Budgets de ce compte'));
    assert.ok(await b.waitText('Ce mois › '), 'the expense reconciled with its envelope');
    assert.ok(await b.waitText('Hors budget'), 'and the one outside the budget');
    // R16: the balance curve of an account opened today is a line from its starting balance.
    await b.waitFor("document.querySelectorAll('.accounts-chart .chart-dot').length >= 2", 'two points on the curve', 10_000);
    await b.ev("document.querySelector('.accounts-chart').scrollIntoView({ block: 'start' })");
    await b.shot('recette16-curve');
    await b.ev("document.querySelector('#account-budgets').scrollIntoView({ block: 'start' })");
    await b.shot('recette16-account');
  });
});

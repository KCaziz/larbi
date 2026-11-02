import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';

// The chart catalogue of the client (tab 13, P8-24): G-03 net flow, G-04 planned
// vs real, G-06 account balances, G-08 emergency-fund gauge, G-11 debts by type.
// Each one must draw, name its series in writing, and offer its figures as text.

describe('the charts, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let user;
  let budgetId;

  const as = (method, path, json) => t.request(method, `/fin${path}`, { user, ...(json === undefined ? {} : { json }) });
  const month = (shift) => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + shift, 10, 12)).toISOString();

  before(async () => {
    t = await boot();
    await t.reset();
    user = await t.adult({ name: 'Salima Graphiques', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    const account = (await as('POST', '/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 5000000, openingDate: month(-8) })).body.account;
    for (const shift of [-2, -1, 0]) {
      await as('POST', '/transactions', { kind: 'income', value: 8000000, currency: 'DZD', occurredAt: month(shift), accountId: account.id });
      await as('POST', '/transactions', { kind: 'expense', value: 3000000 + shift * 100000, currency: 'DZD', occurredAt: month(shift), accountId: account.id });
    }
    const food = await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null }, select: { id: true } });
    budgetId = (
      await as('POST', '/budgets', {
        label: 'Ce mois',
        periodStart: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString(),
        periodEnd: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 0)).toISOString(),
        currency: 'DZD',
        envelopes: [{ categoryId: food.id, kind: 'variable', value: 1000000 }],
      })
    ).body.budget.id;
    await as('POST', '/debts', { label: 'Prêt voiture', outstandingPrincipal: 2000000, monthlyInstalment: 100000, currency: 'DZD', debtType: 'D-03' });
    // The reserve is computable once there is liquid savings and an essential expense.
    const essential = await t.prisma.finCategory.findFirst({ where: { userId: null, essential: true, family: { not: 'income' } }, select: { id: true } });
    // The fund is a goal made from the emergency template, held on a savings account.
    const savings = (await as('POST', '/comptes', { label: 'Épargne', type: 'AC-04', currency: 'DZD', openingBalance: 9000000, openingDate: month(-8) })).body.account;
    await t.prisma.finGoal.create({
      data: { userId: user.id, label: 'Fonds d’urgence', target: 18000000, allocated: 9000000, currency: 'DZD', templateKey: 'emergency', accountId: savings.id, source: 'manual', status: 'declared' },
    });
    // One essential expense 40 days ago opens a month of history; one 5 days ago falls inside it.
    await as('POST', '/transactions', { kind: 'expense', value: 100000, currency: 'DZD', occurredAt: new Date(Date.now() - 40 * 86400000).toISOString(), categoryId: essential.id, accountId: account.id });
    const essentialSpend = await as('POST', '/transactions', { kind: 'expense', value: 3000000, currency: 'DZD', occurredAt: new Date(Date.now() - 5 * 86400000).toISOString(), categoryId: essential.id, accountId: account.id });
    assert.equal(essentialSpend.status, 201, JSON.stringify(essentialSpend.body).slice(0, 200));
    await as('PUT', '/reserve/cible?currency=DZD', { targetMonths: 6 });

    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1100 });
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

  const chartsOn = async (path, wait) => {
    await b.goto(`${site.url}${path}`);
    await b.waitFor(wait, `the charts of ${path}`, 15_000);
  };

  test('G-03 — the Synthèse draws the net flow, with its legend and its table', async () => {
    await chartsOn('/app/synthese', "document.querySelectorAll('.chart .chart-line').length >= 1");
    assert.ok(await b.ev("!!document.querySelector('.chart .chart-legend-item') && !!document.querySelector('.chart details table')"));
    await b.ev("(document.querySelector('.chart, .home-ring') ?? document.body).scrollIntoView()");
    await b.shot('chart-net-flow');
  });

  test('G-05 — the Synthèse history can be read by week and by day, the table following', async () => {
    await chartsOn('/app/synthese', "document.querySelectorAll('.synthesis-steps button').length === 3");
    assert.ok(await b.clickContaining('Par jour'));
    await b.waitFor("document.querySelectorAll('.wealth-chart table tbody tr').length === 31 || document.querySelectorAll('.chart table tbody tr').length === 31", 'thirty-one days', 15_000);
    assert.ok(await b.clickContaining('Par semaine'));
    await b.waitFor("document.querySelectorAll('.chart table tbody tr').length === 12", 'twelve weeks', 15_000);
    await b.shot('chart-by-week');
  });

  test('G-04 — a budget shows planned and real side by side, each value written', async () => {
    await chartsOn(`/app/budgets/${budgetId}`, "document.querySelectorAll('.chart-bar-row').length >= 1");
    const values = await b.ev("[...document.querySelectorAll('.chart-bar-value')].map((e) => e.textContent.trim())");
    assert.ok(values.length >= 2 && values.every((v) => v.length > 0), JSON.stringify(values));
    await b.ev("(document.querySelector('.chart, .home-ring') ?? document.body).scrollIntoView()");
    await b.shot('chart-planned-real');
  });

  test('G-04 — the same budget draws what was spent so far against the even pace, over its table', async () => {
    await chartsOn(`/app/budgets/${budgetId}`, "document.querySelectorAll('.chart .chart-line').length >= 1");
    assert.ok(await b.ev("[...document.querySelectorAll('.chart-legend-item')].some((e) => /rythme/i.test(e.textContent))"), 'a legend naming the pace');
    assert.ok(await b.ev("!!document.querySelector('.chart details table')"), 'the figures as a table');
    await b.ev("(document.querySelector('.chart .chart-line') ?? document.body).scrollIntoView()");
    await b.shot('chart-budget-pace');
  });

  test('G-06 — the accounts page draws the balance history of the account', async () => {
    await chartsOn('/app/comptes', "document.querySelectorAll('.accounts-chart .chart-line').length >= 1");
    await b.ev("(document.querySelector('.chart, .home-ring') ?? document.body).scrollIntoView()");
    await b.shot('chart-balances');
  });

  test('G-08 — the reserve says its state in words as well as colour', async () => {
    await chartsOn('/app/objectifs/fonds-urgence', "!!document.querySelector('.chart-gauge [role=meter]')");
    const text = await b.ev("document.querySelector('.chart-gauge-text').textContent");
    assert.match(text, /\/ 6 mois/);
    assert.match(text, /cible/);
    await b.ev("(document.querySelector('.chart, .home-ring') ?? document.body).scrollIntoView()");
    await b.shot('chart-gauge');
  });

  test('G-11 — the debts are drawn by type, with the client’s own name for the type', async () => {
    await chartsOn('/app/dettes', "!!document.querySelector('.home-ring')");
    assert.ok((await b.ev("document.body.textContent")).includes('Emprunt bancaire'));
    await b.ev("(document.querySelector('.chart, .home-ring') ?? document.body).scrollIntoView()");
    await b.shot('chart-debts');
  });
});

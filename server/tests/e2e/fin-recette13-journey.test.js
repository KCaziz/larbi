import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';

// SUIVI_RECETTE R13, through the screens: the account of a budget and of an
// envelope, a weekly budget, the balance counted as a resource, the shares of an
// envelope, the ring of the home page in distinct colours, and one operation
// instead of two when it is a declared payment.

describe('the seventh pass, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let user;
  let budgetId;
  let courant;
  let second;
  let loyer;

  const DAY = 86400000;
  const as = (method, path, json) => t.request(method, `/fin${path}`, { user, ...(json === undefined ? {} : { json }) });
  const monthStart = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
  const monthEnd = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 0));
  const setValue = (selector, value, proto = 'HTMLInputElement') =>
    b.ev(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false;
      Object.getOwnPropertyDescriptor(${proto}.prototype, 'value').set.call(el, ${JSON.stringify(value)});
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);

  before(async () => {
    t = await boot({ subscribers: true });
    await t.reset();
    user = await t.adult({ name: 'Samira Septième', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    const opened = new Date(monthStart().getTime() - 40 * DAY).toISOString();
    courant = (await as('POST', '/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 15000000, openingDate: opened })).body.account;
    second = (await as('POST', '/comptes', { label: 'Autre courant', type: 'AC-02', currency: 'DZD', openingBalance: 5000000, openingDate: opened })).body.account;
    const food = await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null }, select: { id: true } });
    loyer = await t.prisma.finCategory.findFirst({ where: { key: 'fixed.loyer', userId: null }, select: { id: true } });
    const made = await as('POST', '/budgets', {
      label: 'Ce mois',
      periodStart: monthStart().toISOString(),
      periodEnd: monthEnd().toISOString(),
      currency: 'DZD',
      accountId: courant.id,
      envelopes: [{ categoryId: food.id, kind: 'variable', value: 600000 }, { categoryId: loyer.id, kind: 'fixed', value: 200000 }],
    });
    budgetId = made.body.budget.id;
    await as('POST', '/transactions', { kind: 'expense', value: 150000, currency: 'DZD', occurredAt: new Date(Date.now() - 3600_000).toISOString(), accountId: courant.id, categoryId: food.id });
    await as('POST', '/transactions', { kind: 'expense', value: 50000, currency: 'DZD', occurredAt: new Date(Date.now() - 3600_000).toISOString(), accountId: courant.id, categoryId: loyer.id });
    await as('POST', '/transactions', { kind: 'expense', value: 150000, currency: 'DZD', occurredAt: new Date(Date.now() + 2 * DAY).toISOString(), planned: true, accountId: courant.id, categoryId: food.id });

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

  test('the budget says which account it is spent from, the balance it counts, and what each envelope weighs', async () => {
    await b.goto(`${site.url}/app/budgets/${budgetId}`);
    assert.ok(await b.waitText('Compte : Courant', 20_000), 'the account of the budget');
    assert.ok(await b.waitText('Solde au début de la période'), 'the balance counted as a resource');
    assert.ok(await b.waitText('Ressources totales'), 'incomes + balance');
    assert.ok(await b.waitText('du budget total'), 'the share in the budget');
    assert.ok(await b.waitText('des dépenses du budget'), 'the share in the spending');
    assert.ok(await b.waitText('prévu à venir'), 'the committed amount, with what is planned still to come');
    await b.shot('recette13-budget');
  });

  test('the budget form offers the account to debit and a weekly recurrence', async () => {
    await b.goto(`${site.url}/app/budgets/nouveau`);
    await b.waitFor("document.querySelectorAll('#new-budget-account option').length >= 3", 'the form and the accounts', 20_000);
    const accounts = await b.ev("[...document.querySelectorAll('#new-budget-account option')].map((o) => o.textContent.trim())");
    assert.ok(accounts[0].includes('Tous') && accounts.includes('Courant') && accounts.includes('Autre courant'), JSON.stringify(accounts));
    const recurrences = await b.ev("[...document.querySelectorAll('#new-budget-recurrence option')].map((o) => o.textContent.trim())");
    assert.ok(recurrences.includes('Hebdomadaire'), JSON.stringify(recurrences));
  });

  test('the ring of the home page draws two accounts of the same type in two colours', async () => {
    await b.goto(`${site.url}/app`);
    await b.waitFor("document.querySelectorAll('.home-ring-legend-item').length >= 2", 'the ring', 20_000);
    const colours = await b.ev("[...document.querySelectorAll('.home-ring-swatch')].map((e) => getComputedStyle(e).backgroundColor)");
    assert.ok(colours.length >= 2);
    assert.equal(new Set(colours).size, colours.length, `distinct colours: ${JSON.stringify(colours)}`);
    await b.shot('recette13-ring');
  });

  test('entering a declared payment asks « is it that payment? » and records it once', async () => {
    await as('POST', '/recurrences', { label: 'Loyer', categoryId: loyer.id, kind: 'expense', value: 1500000, currency: 'DZD', frequency: 'mensuel', nextDate: new Date(Date.now() - 2 * DAY).toISOString(), accountId: courant.id });
    await b.goto(`${site.url}/app/mouvements`);
    assert.ok(await b.clickContaining('Ajouter une dépense ou un revenu'));
    await b.waitFor("!!document.querySelector('#entry-amount')", 'the form', 20_000);
    await b.type('#entry-amount', '15000');
    // The category picker is a button: choose the rent in it.
    assert.ok(await b.clickWhere('e => e.id === "entry-categoryId"'));
    await b.waitFor("!!document.querySelector('.category-picker-panel input')", 'the picker', 5_000);
    await b.type('.category-picker-panel input', 'Loyer');
    assert.ok(await b.clickWhere("e => e.classList.contains('category-picker-row') && /Loyer/.test(e.textContent)"));
    assert.ok(await b.clickWhere('e => e.type === "submit" && /Enregistrer|Ajouter/.test(e.textContent)'));
    assert.ok(await b.waitText('paiement régulier', 15_000), 'asked whether it is the declared payment');
    assert.ok(await b.clickContaining("Oui, c'est ce paiement"));
    for (let i = 0; i < 30 && (await t.prisma.finOccurrence.count()) === 0; i += 1) await new Promise((resolve) => setTimeout(resolve, 300));
    assert.equal(await t.prisma.finOccurrence.count(), 1, 'the due date is settled by it');
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: user.id, categoryId: loyer.id, planned: false, deletedAt: null, value: 1500000 } }), 1, 'one operation, not two');
    await b.shot('recette13-one-operation');
  });
  test('with income declared but not yet received, the home page also says the flux with it', async () => {
    const declared = await as('POST', '/revenus', { label: 'Salaire', value: 8000000, currency: 'DZD', frequency: 'mensuel', startDate: new Date(monthStart().getTime() - 60 * DAY).toISOString(), accountId: courant.id });
    assert.equal(declared.status, 201, JSON.stringify(declared.body).slice(0, 200));
    await b.goto(`${site.url}/app`);
    assert.ok(await b.waitText('Flux prévu', 20_000), 'the expected income enters the reading of the flux (R18: a figure of its own)');
    await b.shot('recette13-flux-expected');
  });
  test('the home page says what was spent outside every envelope, and the Flux tab draws income against spending', async () => {
    const other = await t.prisma.finCategory.findFirst({ where: { key: 'variable.sorties', userId: null }, select: { id: true } });
    await as('POST', '/transactions', { kind: 'expense', value: 90000, currency: 'DZD', occurredAt: new Date(Date.now() - 3600_000).toISOString(), accountId: courant.id, categoryId: other.id });
    await as('POST', '/transactions', { kind: 'income', value: 500000, currency: 'DZD', occurredAt: new Date(Date.now() - 3600_000).toISOString(), accountId: courant.id });
    await b.goto(`${site.url}/app`);
    assert.ok(await b.waitText('dépensés hors budget', 20_000), 'spending no envelope covers');
    assert.ok(await b.clickWhere('e => e.getAttribute("role") === "tab" && e.textContent.trim() === "Flux"'));
    await b.waitFor("document.querySelectorAll('.home-ring-legend-item').length >= 2", 'income and spending on the ring', 10_000);
    const colours = await b.ev("[...document.querySelectorAll('.home-ring-swatch')].map((e) => getComputedStyle(e).backgroundColor)");
    assert.equal(new Set(colours).size, colours.length, JSON.stringify(colours));
    await b.shot('recette13-flux-tab');
  });
});

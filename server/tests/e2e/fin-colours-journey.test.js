import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';

// P8-27, the client's message of 2026-10-28: « des couleurs pour chaque
// catégorie, sous-catégorie, et les différencier entre les différents flux »,
// and « les 3 suggestions » of the Accueil (screen C04, « 1–3 actions »).

describe('colours of the flows and of the categories, and the three suggestions', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let person;

  before(async () => {
    t = await boot();
    await t.reset();
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1280 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
    person = await t.adult({ finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    const as = (path, json) => t.request('POST', path, { user: person, json });
    const day = new Date(Date.now() - 86_400_000).toISOString();
    const food = await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null } });
    const salary = await t.prisma.finCategory.findFirst({ where: { key: 'income.salaire_net', userId: null } });
    const current = (await as('/fin/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 1000000 })).body.account;
    const savings = (await as('/fin/comptes', { label: 'Épargne', type: 'AC-04', currency: 'DZD' })).body.account;
    await as('/fin/transactions', { kind: 'income', value: 6000000, currency: 'DZD', occurredAt: day, categoryId: salary.id, accountId: current.id });
    await as('/fin/transactions', { kind: 'expense', value: 250000, currency: 'DZD', occurredAt: day, categoryId: food.id, accountId: current.id });
    await as('/fin/transferts', { fromAccountId: current.id, toAccountId: savings.id, value: 100000, occurredAt: day });
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(person.id), url: site.url, httpOnly: true });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('income, expense and transfer wear three different colours, and each category its own chip', async () => {
    await b.goto(`${site.url}/app/mouvements`);
    assert.ok(await b.waitFor("document.querySelectorAll('.movements-row.flow').length >= 4", 'the movements'));
    const colours = await b.ev(`(() => {
      const of = (flow) => { const row = document.querySelector('.movements-row.flow-' + flow); return row ? getComputedStyle(row).borderInlineStartColor : null; };
      return { income: of('income'), expense: of('expense'), transfer: of('transfer') };
    })()`);
    assert.ok(colours.income && colours.expense && colours.transfer, JSON.stringify(colours));
    assert.equal(new Set(Object.values(colours)).size, 3, `three different colours: ${JSON.stringify(colours)}`);
    // The flow is written too: the colour is never the only signal.
    assert.ok(await b.ev("[...document.querySelectorAll('.movements-row .flow-label')].some((e) => e.textContent.trim() === 'Revenu')"));
    // The category chip carries the colour of the client's category.
    const chip = await b.ev("(() => { const c = document.querySelector('.movements-row .category-chip'); return c ? c.style.getPropertyValue('--category-color') : null; })()");
    assert.match(chip ?? '', /^#[0-9A-Fa-f]{6}$/);
    await b.ev("document.querySelector('.movements-row').scrollIntoView({ block: 'center' })");
    await b.shot('p8-27-movements');
  });

  test('the Accueil offers one to three suggestions', async () => {
    await b.goto(`${site.url}/app`);
    assert.ok(await b.waitFor("!!document.querySelector('#home-today')", 'the suggestions'));
    const suggestions = await b.ev("(document.querySelector('.home-suggestions')?.children[0] ? 1 : 0) + document.querySelectorAll('.home-suggestion').length");
    assert.ok(suggestions >= 1 && suggestions <= 3, `${suggestions} suggestions`);
    await b.shot('p8-27-home');
  });
});

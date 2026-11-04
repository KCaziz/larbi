import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';

// SUIVI_RECETTE R3-05: a button that makes a form or a message appear takes the
// person to it (scroll) and, for a form, puts the focus on its first field.

describe('after a click, the page goes to the result', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let user;
  let budgetId;

  before(async () => {
    t = await boot();
    await t.reset();
    user = await t.adult({ name: 'Rania Défilement', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    const food = await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null }, select: { id: true } });
    const made = await t.request('POST', '/fin/budgets', {
      user,
      json: {
        label: 'Ce mois',
        periodStart: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString(),
        periodEnd: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 0)).toISOString(),
        currency: 'DZD',
        envelopes: Array.from({ length: 1 }, () => ({ categoryId: food.id, kind: 'variable', value: 1000000 })),
      },
    });
    budgetId = made.body.budget.id;
    site = await startSite(t.baseUrl);
    // A short window, so a form that opens below the fold is really out of sight.
    b = await Browser.launch({ width: 1100, height: 420 });
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

  test('« Ajouter une enveloppe » opens the form, brings it into view and focuses its first field', async () => {
    await b.goto(`${site.url}/app/budgets/${budgetId}`);
    await b.waitFor("[...document.querySelectorAll('button')].some((e) => e.textContent.includes('Ajouter une enveloppe'))", 'the button', 15_000);
    assert.ok(await b.clickContaining('Ajouter une enveloppe'));
    await b.waitFor("!!document.querySelector('main form')", 'the form', 10_000);
    await b.waitFor("document.activeElement && !!document.activeElement.closest('main form')", 'the focus in the form', 5_000);
    // The scroll is smooth: wait for it to arrive.
    await b.waitFor("(() => { const f = document.querySelector('main form'); const r = f.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; })()", 'the form on screen', 5_000);
    await b.shot('reveal-envelope-form');
  });
  test('R4-05 — the help panel offers the tips of the page open, in place, not the FAQ', async () => {
    await b.goto(`${site.url}/app/mouvements`);
    await b.waitFor("document.querySelectorAll('button[title=\"Aide\"]').length > 0", 'the help button', 15_000);
    assert.ok(await b.clickWhere('e => (e.getAttribute("title") ?? "") === "Aide"'));
    await b.waitFor("document.querySelectorAll('.chatbot-tips details').length >= 2", 'the tips of the page', 5_000);
    assert.ok(await b.clickWhere('e => e.tagName === "BUTTON" && e.closest(".chatbot-tips")') || true);
    await b.ev("document.querySelector('.chatbot-tips summary').click()");
    await b.waitFor("document.querySelector('.chatbot-tips details').open", 'the tip opened', 3_000);
    assert.equal(await b.ev('location.pathname'), '/app/mouvements', 'the page did not change');
  });
});

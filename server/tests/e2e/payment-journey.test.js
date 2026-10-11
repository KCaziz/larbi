import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// Payment base in a real browser (P3-09), with the SIMULATED provider: an
// administrator publishes an offer; a learner pays on the provider's page and
// comes back premium; another one cancels; the administrator sees both orders.
// Attacks on the notifications are tested on the API (security/payments.test.js).

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const p = fr.payments;
const OFFER = 'Accès premium annuel';

describe('payment, end to end (simulated provider)', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let admin;
  let buyer;
  let quitter;

  const setSession = async (user) => {
    await b.clearCookies();
    if (user) await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
  };
  const fill = async (selector, text) => {
    await b.ev(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, ''); e.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await b.type(selector, text);
  };

  before(async () => {
    t = await boot();
    await t.reset();
    admin = await t.admin({ name: 'Admin Paiement' });
    buyer = await t.user({ name: 'Acheteuse' });
    quitter = await t.user({ name: 'Indécis' });
    site = await startSite(t.baseUrl);
    b = await Browser.launch();
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('without any offer, the premium page says so (nothing to buy, nothing invented)', async () => {
    await setSession(buyer);
    await b.goto(`${site.url}/compte/premium`);
    assert.ok(await b.waitText(p.noOffer));
  });

  test('the administrator creates an offer from a typed price, sees how it will look, and publishes it', async () => {
    await setSession(admin);
    await b.goto(`${site.url}/admin/paiements`);
    assert.ok(await b.waitText(p.admin.subtitle));
    assert.ok(await b.click(p.admin.add));
    assert.ok(await b.waitFor("Boolean(document.querySelector('#po-name'))"));
    await fill('#po-name', OFFER);
    await fill('#po-currency', 'dzd');
    await fill('#po-price', '2500,5');
    assert.ok(await b.waitFor("document.body.innerText.includes('2') && document.body.innerText.includes('500,50')"), 'the preview shows the formatted price');
    assert.ok(await b.clickWhere("e => e.closest('form') && e.type === 'submit' && !e.disabled"));
    assert.ok(await b.waitText(p.admin.saved));
    const stored = await t.prisma.paymentOffer.findFirst();
    assert.equal(stored.amount, 250050, '2500,5 DZD = 250050 centimes, typed as text, no floating point');
    assert.equal(stored.currency, 'DZD');
    assert.equal(stored.isActive, false, 'hidden until the administrator offers it');
    await b.ev("document.querySelector('.payments-admin-toggle input').click()");
    assert.ok(await b.waitFor("document.body.innerText.includes(" + JSON.stringify(p.admin.active) + ')'));
  });

  test('a learner pays on the provider page and comes back premium', async () => {
    await setSession(buyer);
    await b.goto(`${site.url}/compte/premium`);
    assert.ok(await b.waitText(OFFER));
    assert.ok(await b.waitText(p.securityNote));
    assert.ok(await b.click(p.buy));
    assert.ok(await b.waitFor("location.pathname.startsWith('/api/payments/fake/checkout/')"), 'sent to the provider page');
    assert.ok(await b.waitText('Simulated payment provider'));
    assert.ok(await b.click('Pay'));
    assert.ok(await b.waitFor("location.pathname === '/paiement/retour'"));
    assert.ok(await b.waitText(p.return.paidTitle));
    assert.equal((await t.prisma.user.findUnique({ where: { id: buyer.id } })).accessLevel, 'premium');
    await b.shot('payment-return');

    await b.goto(`${site.url}/compte/premium`);
    assert.ok(await b.waitText(fr.account.premium.activeTitle), 'the page shows the new access at once');
    await b.goto(`${site.url}/compte/paiements`);
    assert.ok(await b.waitText(OFFER));
    assert.ok(await b.waitText(p.status.paid));
  });

  test('another learner cancels on the provider page: nothing is granted', async () => {
    await setSession(quitter);
    await b.goto(`${site.url}/compte/premium`);
    assert.ok(await b.click(p.buy));
    assert.ok(await b.waitText('Simulated payment provider'));
    assert.ok(await b.click('Cancel'));
    assert.ok(await b.waitText(p.return.cancelledTitle));
    assert.equal((await t.prisma.user.findUnique({ where: { id: quitter.id } })).accessLevel, 'standard');
  });

  test('coming back to the return page by hand changes nothing', async () => {
    const order = await t.prisma.paymentOrder.findFirst({ where: { userId: quitter.id } });
    await b.goto(`${site.url}/paiement/retour?commande=${order.id}`);
    assert.ok(await b.waitText(p.return.cancelledTitle));
    assert.equal((await t.prisma.user.findUnique({ where: { id: quitter.id } })).accessLevel, 'standard');
    // Someone else's order: not found, nothing about it is shown.
    const theirs = await t.prisma.paymentOrder.findFirst({ where: { userId: buyer.id } });
    await b.goto(`${site.url}/paiement/retour?commande=${theirs.id}`);
    assert.ok(await b.waitText(p.return.notFound));
  });

  test('the administrator sees both orders, read-only, and can filter them', async () => {
    await setSession(admin);
    await b.goto(`${site.url}/admin/paiements`);
    assert.ok(await b.clickTab(p.admin.orders));
    assert.ok(await b.waitText(buyer.email));
    assert.ok(await b.waitText(quitter.email));
    assert.ok(await b.waitText(p.admin.ordersHint));
    assert.equal(await b.ev("[...document.querySelectorAll('.payments-admin-section button')].filter((x) => /pay|refund|rembours/i.test(x.textContent)).length"), 0, 'no action on an order');
  });

  test('phone: the premium page and my payments fit the screen', async () => {
    await setSession(buyer);
    await b.setViewport(390, 800);
    await b.goto(`${site.url}/compte/paiements`);
    assert.ok(await b.waitText(OFFER));
    assert.equal(await b.ev('document.documentElement.scrollWidth <= innerWidth'), true);
    await b.shot('payment-mine-phone');
    await b.setViewport(1280, 1000);
  });
});

import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P13-05, lot B (2026-11-23): the sales cycle of the client's référentiel
// (19_CYCLE_FACTURE), in the browser — the client's own case TST-00028:
// quote 85 000 DA, direct cost 32 000 DA, deposit 20 000 DA → receivable
// 65 000 DA, margin 53 000 DA, cash 20 000 DA; then a credit note and a
// reminder that changes no balance.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const I = fr.business.inv;

describe('quote → invoice → payment → credit note → reminder, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let owner;

  const choose = (selector, value) =>
    b.ev(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  const button = (label) => b.clickWhere(`e => e.tagName === 'BUTTON' && e.textContent.trim() === ${JSON.stringify(label)}`);
  const text = () => b.ev('document.body.textContent');
  // Lot C: the business space is in tabs.
  const tab = async (key) => {
    assert.ok(await b.waitFor(`!!document.querySelector('#business-tab-${key}')`, `the ${key} tab`, 15_000));
    await b.ev(`document.querySelector('#business-tab-${key}').click(); true`);
  };
  const nbsp = (s) => s.replace(/[  ]/g, ' ');

  before(async () => {
    t = await boot();
    await t.reset();
    owner = await t.adult({ name: 'Nadia Ait', finCurrency: 'DZD', finOnboardedAt: new Date() });
    const org = await t.request('POST', '/fin/entreprise', { user: owner, json: { name: 'Cabinet Ait', currency: 'DZD', publicKey: 'PUB-01' } });
    assert.equal(org.status, 201);
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1200, height: 1100 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev(`localStorage.setItem('lang', 'fr'); localStorage.setItem('fincludia.organisation', ${JSON.stringify(org.body.entreprise.id)}); true`);
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(owner.id), url: site.url, httpOnly: true });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('a client is added, then a quote with its lines', async () => {
    await b.goto(`${site.url}/app/entreprise`);
    await tab('sales');
    assert.ok(await b.waitFor("!!document.querySelector('#contact-name')", 'the contacts form', 15_000));
    await b.type('#contact-name', 'Société Atlas');
    await button(I.addContact);
    assert.ok(await b.waitText(I.contactCreated, 10_000));

    await choose('#document-type', 'quote');
    assert.ok(await b.waitFor("[...document.querySelectorAll('#document-contact option')].some(o => o.textContent === 'Société Atlas')", 'the client in the list', 10_000));
    const clientId = await b.ev("[...document.querySelectorAll('#document-contact option')].find(o => o.textContent === 'Société Atlas').value");
    await choose('#document-contact', clientId);
    await b.type('#document-label', 'Mission de conseil');
    await b.type('.inv-line input:not([type=number])', 'Diagnostic et restitution');
    await b.type('#line-price-0', '85000');
    await b.type('#business-cost', '32000');
    assert.ok(nbsp(await text()).includes('85 000'), 'the total of the lines is shown');
    await button(I.createQuote);
    assert.ok(await b.waitText(I.quoteCreated, 10_000));
    assert.ok(await b.waitText('DEV-2026-0001', 10_000) || (await text()).includes('DEV-'), 'the quote is numbered');
  });

  test('sent, accepted, turned into a draft invoice, then issued', async () => {
    // Each step waits for the list to show the new state before the next one.
    const badge = (label) => b.waitFor(`[...document.querySelectorAll('.business-document-state')].some(e => e.textContent === ${JSON.stringify(label)})`, label, 10_000);
    await button(I.send);
    assert.ok(await b.waitText(I.sent, 10_000));
    assert.ok(await badge(I.quoteStates.sent));
    await button(I.accept);
    assert.ok(await b.waitText(I.acceptedOk, 10_000));
    assert.ok(await badge(I.quoteStates.accepted));
    await button(I.toInvoice);
    assert.ok(await b.waitText(I.invoicedOk, 10_000));
    assert.ok(await badge(I.draft));
    assert.ok((await text()).includes(I.noNumberYet), 'the draft waits for its number');
    await button(I.issue);
    assert.ok(await b.waitText(I.issuedOk, 10_000));
    assert.ok(await b.waitFor("document.body.textContent.includes('FAC-')", 'the invoice number', 10_000));
  });

  test('a deposit of 20 000: receivable 65 000, margin 53 000 (TST-00028)', async () => {
    assert.ok(await b.waitFor(`!!document.querySelector('input[id^="payment-"]')`, 'the payment form', 10_000));
    await b.type('input[id^="payment-"]', '20000');
    await b.ev("document.querySelector('.business-payment button[type=submit]').click(); true");
    assert.ok(await b.waitText(fr.business.paymentCreated, 10_000));
    assert.ok(await b.waitFor("document.body.textContent.replace(/[\\u00a0\\u202f]/g, ' ').includes('65 000')", 'the receivable', 10_000));
    await tab('home');
    assert.ok(await b.waitFor("!!document.querySelector('#business-sales')", 'the sales figures', 10_000));
    const page = nbsp(await text());
    assert.ok(page.includes('53 000'), 'the indicative margin');
    assert.ok(page.includes(I.agingTitle), 'the aged balance');
    await tab('sales');
    assert.ok(await b.waitFor("!!document.querySelector('.business-documents')", 'the documents again', 10_000));
  });

  test('a credit note of 5 000 lowers what is due without touching the invoice', async () => {
    await button(I.creditNote);
    assert.ok(await b.waitFor("!!document.querySelector('.inv-credit')", 'the credit note form', 10_000));
    await b.type('.inv-credit input[id^="credit-"]:not([id^="credit-tax"])', '5000');
    await button(I.issueCredit);
    assert.ok(await b.waitText(I.creditCreated, 10_000));
    assert.ok(await b.waitFor("document.body.textContent.replace(/[\\u00a0\\u202f]/g, ' ').includes('60 000')", 'what is left due', 10_000));
    assert.ok((await text()).includes('AV-2026-0001'));
  });

  test('a reminder is prepared, recorded, and changes no balance', async () => {
    await button(I.remind);
    assert.ok(await b.waitFor("!!document.querySelector('.inv-preview')", 'the preview', 10_000));
    const message = await b.ev("document.querySelector('.inv-preview').value");
    assert.ok(message.includes('Société Atlas') && message.includes('FAC-'), 'the message names the client and the invoice');
    await button(I.recordReminder);
    assert.ok(await b.waitText(I.reminderRecorded, 10_000));
    assert.ok(await b.waitFor(`document.body.textContent.includes(${JSON.stringify(I.lastReminder_one.split(' ')[0])})`, 'the reminder in the history', 10_000));
    assert.ok(nbsp(await text()).includes('60 000'), 'still 60 000 due');
    await b.shot('invoicing-owner');
    await tab('home');
    assert.ok(await b.waitFor("!!document.querySelector('#business-sales')", 'the sales figures', 10_000));
    await b.ev("document.querySelector('#business-sales').scrollIntoView(); true");
    await b.shot('invoicing-figures');
  });

  test('the invoice prints alone, as a sheet with its lines and what is left to pay', async () => {
    await tab('sales');
    assert.ok(await b.waitFor("!!document.querySelector('.business-documents')", 'the documents', 10_000));
    // No print dialog in a test: the browser's print is replaced, the page is rendered as printed.
    await b.ev('window.print = () => { window.__printed = (window.__printed ?? 0) + 1; }; true');
    await button(I.print.action);
    assert.ok(await b.waitFor('window.__printed === 1', 'one print', 10_000));
    await b.send('Emulation.setEmulatedMedia', { media: 'print' });
    const sheet = nbsp(await b.ev("document.querySelector('.print-sheet').innerText"));
    assert.ok(sheet.includes(I.print.invoice.toUpperCase()) || sheet.includes(I.print.invoice), 'the title');
    assert.ok(sheet.includes('Société Atlas') && sheet.includes('Diagnostic et restitution'), 'the client and the lines');
    assert.ok(sheet.includes('60 000'), 'what is left to pay');
    assert.equal(await b.ev("getComputedStyle(document.getElementById('root')).display"), 'none', 'nothing else is printed');
    await b.shot('invoicing-print');
    await b.send('Emulation.setEmulatedMedia', { media: '' });
    await b.ev("window.dispatchEvent(new Event('afterprint')); true");
    assert.ok(await b.waitFor("!document.querySelector('.print-sheet')", 'the sheet closes', 10_000));
    assert.equal(await b.ev('window.__printed'), 1, 'printed once, not in a loop');
  });

  test('nothing on screen shows a raw key or a formula code', async () => {
    const page = await text();
    assert.equal(/business\.inv\.|business\.org\.|\bE01[1-4]\b/.test(page), false);
  });
});

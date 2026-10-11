import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// Invoice generator in a real browser (P4-03): account required, field errors
// shown where they are, server-computed preview, a real PDF export of ONE A4
// portrait page holding only the invoice, the Excel file, Arabic, phone layout.

const locale = (lang) => JSON.parse(readFileSync(path.resolve(SERVER_DIR, `../client/src/i18n/locales/${lang}.json`), 'utf8'));
const fr = locale('fr');
const ar = locale('ar');
const inv = fr.invoice;

describe('invoice generator, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let user;

  // Types into the n-th input/textarea whose label starts with `label`.
  const typeIn = (label, text, index = 0) =>
    b.ev(`(() => {
      const field = [...document.querySelectorAll('.invoice-form label')]
        .filter((l) => l.textContent.trim().startsWith(${JSON.stringify(label)}))[${index}]
        ?.querySelector('input, textarea');
      if (!field) return false;
      const proto = field.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(field, ${JSON.stringify(text)});
      field.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);

  before(async () => {
    t = await boot();
    await t.reset();
    user = await t.user({ name: 'Facturière' });
    site = await startSite(t.baseUrl);
    b = await Browser.launch();
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr'); localStorage.removeItem('invoice-draft')");
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('without an account the generator is not reachable; the tools page links to it', async () => {
    await b.goto(`${site.url}/outils/facture`);
    assert.ok(await b.waitFor("location.pathname === '/connexion'"));
    await b.goto(`${site.url}/outils`);
    assert.ok(await b.waitFor("Boolean(document.querySelector('a[href=\"/outils/facture\"]'))"));
  });

  test('errors are shown under the fields at fault', async () => {
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
    await b.goto(`${site.url}/outils/facture`);
    assert.ok(await b.waitText(inv.privacy));
    assert.ok(await typeIn(inv.quantity, '-2'));
    assert.ok(await b.click(inv.calculate));
    assert.ok(await b.waitText(inv.errors.summary));
    assert.ok(await b.waitText(inv.errors.quantity));
    assert.ok(await b.waitText(inv.errors.required));
    assert.equal(await b.ev("Boolean(document.querySelector('.invoice-sheet'))"), false, 'no preview from refused data');
  });

  test('a valid invoice: the server computes it and the preview shows its amounts', async () => {
    await typeIn(inv.number, 'F-2026-042');
    await typeIn(inv.partyName, 'Studio Essai', 0);
    await typeIn(inv.partyDetails, '12 rue des Tests\nAlger', 0);
    await typeIn(inv.partyName, 'Client SARL', 1);
    await typeIn(inv.description, 'Développement');
    await typeIn(inv.quantity, '1,5');
    await typeIn(inv.unitPrice, '3333,33');
    await typeIn(inv.vatRate, '19');
    assert.ok(await b.click(inv.addLine));
    await typeIn(inv.description, 'Hébergement', 1);
    await typeIn(inv.quantity, '1', 1);
    await typeIn(inv.unitPrice, '2500,50', 1);
    await typeIn(inv.vatRate, '9', 1);
    await typeIn(inv.notes, 'Paiement à 30 jours.');
    assert.ok(await b.click(inv.calculate));
    assert.ok(await b.waitFor("Boolean(document.querySelector('.invoice-sheet'))"));
    const sheet = await b.ev("document.querySelector('.invoice-sheet').innerText");
    // 1.5 x 3333.33 = 4999.995 -> 5000.00 (server rounding), + 2500.50 = 7500.50 excl. tax
    assert.match(sheet, /7\s?500,50/);
    assert.match(sheet, /950,00/, 'VAT 19 % on 5000.00');
    assert.match(sheet, /225,05/, 'VAT 9 % on 2500.50 = 225.045 -> 225.05');
    assert.match(sheet, /8\s?675,55/, 'total incl. tax');
    assert.match(sheet, /Studio Essai/);
    assert.match(sheet, /Alger/);
    await b.shot('invoice-preview');
  });

  test('editing after the calculation hides the preview until it is checked again', async () => {
    await typeIn(inv.notes, 'Paiement à 45 jours.');
    assert.ok(await b.waitFor("!document.querySelector('.invoice-sheet')"));
    assert.ok(await b.click(inv.calculate));
    assert.ok(await b.waitFor("Boolean(document.querySelector('.invoice-sheet'))"));
  });

  test('printing keeps only the invoice, on ONE A4 portrait page', async () => {
    await b.send('Emulation.setEmulatedMedia', { media: 'print' });
    const visible = await b.ev(`(() => {
      const shown = (sel) => { const e = document.querySelector(sel); return Boolean(e) && getComputedStyle(e).display !== 'none'; };
      return { header: shown('.site-header'), footer: shown('.site-footer'), form: shown('.invoice-form'), sheet: shown('.invoice-sheet'), export: shown('.invoice-export') };
    })()`);
    assert.deepEqual(visible, { header: false, footer: false, form: false, sheet: true, export: false });
    await b.send('Emulation.setEmulatedMedia', { media: '' });

    const { data } = await b.send('Page.printToPDF', { preferCSSPageSize: true, printBackground: true });
    const pdf = Buffer.from(data, 'base64');
    assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
    const pages = pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? [];
    assert.equal(pages.length, 1, 'exactly one page');
    const box = pdf.toString('latin1').match(/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\s*\]/);
    assert.ok(box && Number(box[1]) < Number(box[2]), `portrait page: ${box?.[1]} x ${box?.[2]}`);
  });

  test('the Excel file is built by the server from the same draft (its amounts: functional/invoice.test.js)', async () => {
    const res = await b.ev(`(async () => {
      const draft = JSON.parse(localStorage.getItem('invoice-draft'));
      const r = await fetch('/api/tools/factures/excel', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...draft, language: 'fr' }) });
      const bytes = new Uint8Array(await r.arrayBuffer());
      return { status: r.status, type: r.headers.get('content-type'), head: [bytes[0], bytes[1]], disposition: r.headers.get('content-disposition') };
    })()`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.head, [0x50, 0x4b]);
    assert.match(res.disposition, /facture-F-2026-042\.xlsx/);
    assert.ok(await b.waitFor(`[...document.querySelectorAll('button')].some((x) => x.textContent.trim() === ${JSON.stringify(inv.excel)} && !x.disabled)`));
  });

  test('the draft is kept in this browser only, and the form can be cleared', async () => {
    await b.goto(`${site.url}/outils/facture`);
    assert.ok(await b.waitFor("document.querySelector('.invoice-form input')?.value === 'F-2026-042'"), 'draft restored after a reload');
    assert.ok(await b.click(inv.reset));
    assert.ok(await b.waitFor("document.querySelector('.invoice-form input').value === ''"));
  });

  test('Arabic: right-to-left sheet with Arabic labels', async () => {
    await b.ev("localStorage.setItem('lang', 'ar')");
    await b.goto(`${site.url}/outils/facture`);
    assert.ok(await b.waitText(ar.invoice.privacy));
    await typeIn(ar.invoice.number, '7');
    await typeIn(ar.invoice.partyName, 'مكتب', 0);
    await typeIn(ar.invoice.partyName, 'زبون', 1);
    await typeIn(ar.invoice.description, 'خدمة');
    await typeIn(ar.invoice.unitPrice, '100');
    assert.ok(await b.click(ar.invoice.calculate));
    assert.ok(await b.waitFor("Boolean(document.querySelector('.invoice-sheet'))"));
    assert.equal(await b.ev("document.querySelector('.invoice-sheet').getAttribute('dir')"), 'rtl');
    assert.ok(await b.waitText(ar.invoice.sheet.gross));
    await b.shot('invoice-ar');
    await b.ev("localStorage.setItem('lang', 'fr')");
  });

  test('phone: the form and the sheet fit the screen', async () => {
    await b.setViewport(390, 800);
    await b.goto(`${site.url}/outils/facture`);
    assert.ok(await b.waitText(inv.privacy));
    assert.equal(await b.ev('document.documentElement.scrollWidth <= innerWidth'), true);
    assert.ok(await b.click(inv.calculate));
    assert.ok(await b.waitFor("Boolean(document.querySelector('.invoice-sheet'))"));
    assert.equal(await b.ev('document.documentElement.scrollWidth <= innerWidth'), true);
    await b.shot('invoice-phone');
    await b.setViewport(1280, 1000);
  });
});

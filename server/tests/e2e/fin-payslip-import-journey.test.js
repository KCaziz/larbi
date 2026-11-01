import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';

// P8-30: a payslip as a PDF or a photo is read IN THE BROWSER, its lines are
// confirmed by the person, and only then does the decoder see them. The file is
// uploaded nowhere (the test counts the requests), and a file that cannot be read
// says so and leaves the manual entry untouched.

const LINES = ['BULLETIN DE PAIE', 'Periode : 09/2026', 'Salaire de base 30 000,00', 'Prime de rendement 3 000,00', 'Retenue securite sociale 3 465,00', 'IRG 4 120,50', 'Net a payer 25 414,50'];

// A small, valid PDF with a real text layer, built here so the test needs no fixture.
function buildPdf(lines) {
  const stream = `BT /F1 14 Tf 40 780 Td 20 TL ${lines.map((line) => `(${line}) Tj T*`).join(' ')} ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(body, 'latin1');
}

describe('importing a payslip, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let user;
  let uploads;

  // Everything the page sends from now on is counted: a payslip must never be uploaded.
  const watch = () => b.ev(`window.__sent = []; const f = window.fetch; window.fetch = (u, o) => { window.__sent.push([String(u), (o && o.method) || 'GET']); return f(u, o); };`);
  const feed = (script) => b.ev(`(async () => { ${script} })()`);
  const setFile = (makeFile) =>
    feed(`
      const file = await (${makeFile})();
      const transfer = new DataTransfer();
      transfer.items.add(file);
      const input = document.getElementById('payslip-file');
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    `);

  before(async () => {
    t = await boot();
    await t.reset();
    user = await t.adult({ name: 'Salima Paie', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1100 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
    await b.goto(`${site.url}/app/outils/fiche-de-paie`);
    await b.waitFor("!!document.getElementById('payslip-file')", 'the import block', 15_000);
    await watch();
    uploads = () => b.ev('window.__sent.filter(([u, m]) => m !== "GET" && /paie|fiche/.test(u)).length');
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('a PDF with a text layer: its lines come up to be confirmed, with the net and the period', async () => {
    const base64 = buildPdf(LINES).toString('base64');
    await setFile(`async () => { const bytes = Uint8Array.from(atob('${base64}'), (c) => c.charCodeAt(0)); return new File([bytes], 'fiche.pdf', { type: 'application/pdf' }); }`);
    await b.waitFor("!!document.querySelector('.payslip-import-table')", 'the review table', 30_000);
    const rows = await b.ev("[...document.querySelectorAll('.payslip-import-table tbody tr')].map((tr) => [tr.querySelector('select').value, tr.querySelectorAll('input[type=text]')[1].value])");
    assert.ok(rows.some(([kind, value]) => kind === 'base_salary' && value === '30000'), JSON.stringify(rows));
    assert.ok(rows.some(([kind, value]) => kind === 'irg' && value === '4120.5'), JSON.stringify(rows));
    assert.equal(await b.ev("document.getElementById('payslip-import-net').value"), '25414.5', 'the net is read, not computed');
    assert.equal(await b.ev("document.getElementById('payslip-import-period').value"), '2026-09');
    assert.equal(await uploads(), 0, 'nothing was sent anywhere');
    await b.shot('payslip-import-review');
  });

  test('nothing is calculated until the person confirms; then the form holds what they kept', async () => {
    assert.ok(!(await b.ev("!!document.querySelector('.payslip-result, [data-testid=payslip-result]')")), 'no result yet');
    await b.ev("[...document.querySelectorAll('.payslip-import-actions button')].find((x) => x.textContent.includes('Utiliser')).click()");
    await b.waitFor("!document.querySelector('.payslip-import-table')", 'the review closed', 10_000);
    const lines = await b.ev("[...document.querySelectorAll('.payslip-form input[inputmode=decimal], .payslip-form input[type=text]')].map((i) => i.value).filter(Boolean)");
    assert.ok(lines.includes('30000'), JSON.stringify(lines));
  });

  test('a photo: read by OCR in the browser, from this site’s own language data', async () => {
    await b.goto(`${site.url}/app/outils/fiche-de-paie`);
    await b.waitFor("!!document.getElementById('payslip-file')", 'the import block', 15_000);
    await watch();
    await setFile(`async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000; canvas.height = 560;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1000, 560);
      ctx.fillStyle = '#000'; ctx.font = '34px Arial';
      ${JSON.stringify(LINES)}.forEach((line, i) => ctx.fillText(line, 40, 60 + i * 70));
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      return new File([blob], 'fiche.png', { type: 'image/png' });
    }`);
    await b.waitFor("!!document.querySelector('.payslip-import-table')", 'the OCR result', 90_000);
    const rows = await b.ev("[...document.querySelectorAll('.payslip-import-table tbody tr')].map((tr) => [tr.querySelector('select').value, tr.querySelectorAll('input[type=text]')[1].value])");
    assert.ok(rows.some(([kind]) => kind === 'base_salary'), `the base salary line was read: ${JSON.stringify(rows)}`);
    assert.equal(await uploads(), 0);
    await b.shot('payslip-import-photo');
  });

  test('a file that cannot be read says so, and the manual entry stays', async () => {
    await b.goto(`${site.url}/app/outils/fiche-de-paie`);
    await b.waitFor("!!document.getElementById('payslip-file')", 'the import block', 15_000);
    await watch();
    await setFile(`async () => new File([new Uint8Array([1, 2, 3, 4])], 'vide.pdf', { type: 'application/pdf' })`);
    await b.waitFor("!!document.querySelector('.notice, [role=status]') && !document.querySelector('.payslip-import-table')", 'the refusal', 30_000);
    assert.ok(await b.ev("!!document.querySelector('.payslip-form')"), 'the manual form is still there');
    assert.ok(!(await b.ev("!!document.querySelector('.payslip-import-table')")), 'no guessed lines');
  });
});

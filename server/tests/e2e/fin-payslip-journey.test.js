import '../helpers/setup-env.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P8-15: the payslip decoder, found in the Tools catalogue — typed, explained,
// compared with the net printed on it, kept only with consent, deleted, and
// added to the monthly income only after a confirmation.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const amount = (n) => `.payslip-lines > div:nth-of-type(${n}) .fin-amount input`;

describe('the payslip decoder', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let user;

  before(async () => {
    t = await boot();
    await t.reset();
    user = await t.adult({ finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1280 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('the catalogue lists it, and « Comparer un financement » (JA09)', async () => {
    await b.goto(`${site.url}/app/outils`);
    assert.ok(await b.waitText(fr.toolsCatalogue.items['OUT-PAIE']));
    assert.ok(await b.waitText(fr.toolsCatalogue.items['CAL-25']));
    const href = await b.ev("[...document.querySelectorAll('#app-main a')].map((a) => a.getAttribute('href')).find((h) => h && h.includes('fiche-de-paie'))");
    assert.equal(href, '/app/outils/fiche-de-paie');
  });

  test('typed, explained and compared with the net printed on the payslip', async () => {
    await b.goto(`${site.url}/app/outils/fiche-de-paie`);
    assert.ok(await b.waitFor(`!!document.querySelector(${JSON.stringify(amount(3))})`, 'three starting lines'));
    await b.type(amount(1), '60000');
    await b.type(amount(2), '5400');
    await b.type(amount(3), '2600');
    await b.type('#payslip-declared-net', '52000');
    assert.ok(await b.click(fr.payslip.decode));
    assert.ok(await b.waitText(fr.payslip.explained));
    assert.ok(await b.waitText('Le net calculé correspond au net inscrit'));
    assert.ok(await b.waitText('Part salariale des cotisations sociales'), 'a line explained');
    assert.equal(await t.prisma.finPayslip.count(), 0, 'decoding keeps nothing');
    await b.shot('p8-15-payslip');
    await b.ev("document.querySelector('.fin-figure-grid').scrollIntoView()");
    await b.shot('p8-15-payslip-result');
  });

  test('kept only once consent is given, then deleted', async () => {
    assert.equal(await b.ev(`[...document.querySelectorAll('button')].find((e) => e.textContent.trim() === ${JSON.stringify(fr.payslip.keep)}).disabled`), true);
    await b.ev("document.querySelector('.payslip-consent input').click()");
    assert.ok(await b.click(fr.payslip.keep));
    assert.ok(await b.waitText(fr.payslip.kept));
    assert.ok(await b.waitFor("document.querySelectorAll('.payslip-history li').length === 1", 'one kept payslip'));
    assert.equal(await t.prisma.finPayslip.count({ where: { userId: user.id } }), 1);

    assert.ok(await b.click(fr.payslip.delete));
    assert.ok(await b.click(fr.payslip.confirmDelete));
    assert.ok(await b.waitText(fr.payslip.historyEmpty));
    assert.equal(await t.prisma.finPayslip.count(), 0);
  });

  test('added to the monthly income only after a confirmation', async () => {
    assert.ok(await b.click(fr.payslip.addIncome));
    assert.ok(await b.waitText('Ajouter un revenu mensuel de'));
    assert.equal(await t.prisma.finIncome.count({ where: { userId: user.id } }), 0, 'nothing before the confirmation');
    assert.ok(await b.click(fr.payslip.confirm));
    assert.ok(await b.waitText(fr.payslip.incomeAdded));
    const incomes = await t.prisma.finIncome.findMany({ where: { userId: user.id } });
    assert.equal(incomes.length, 1);
    assert.equal(incomes[0].value, 5_200_000);
    assert.equal(incomes[0].frequency, 'mensuel');
  });
});

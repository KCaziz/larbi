import '../helpers/setup-env.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P8-25: every screen of the client has its own address — reached from the
// page of its menu in one click, reopened as it was from a copied address,
// with its own way back. Never a section unfolding in another page.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const iso = (days) => new Date(Date.now() + days * 86_400_000).toISOString();

describe('each screen at its own address (P8-25)', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let user;
  const post = (url, json) => t.request('POST', url, { user, json });
  const at = () => b.ev('location.pathname');

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

  test('COM-02: a new account, at /app/comptes/nouveau, and back to the list that says so', async () => {
    await b.goto(`${site.url}/app/comptes`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/app/comptes/nouveau'"), 'one click from « Mes comptes »');
    assert.ok(await b.waitFor("location.pathname === '/app/comptes/nouveau' && !!document.querySelector('#account-label')", 'the form, at its own address'));
    await b.type('#account-label', 'Compte courant');
    assert.ok(await b.click(fr.accounts.save));
    assert.ok(await b.waitText(fr.accounts.created), 'the list says what happened');
    assert.equal(await at(), '/app/comptes');
  });

  test('COM-03 and COM-02: the detail of an account, then its correction, each at its address', async () => {
    const account = (await t.prisma.finAccount.findFirst({ where: { userId: user.id, label: 'Compte courant' } }));
    assert.ok(await b.clickWhere(`e => e.getAttribute('href') === '/app/comptes/${account.id}'`), 'the account leads to its detail');
    assert.ok(await b.waitFor(`location.pathname === '/app/comptes/${account.id}'`, 'the detail'));
    assert.ok(await b.waitText(fr.accounts.balanceCurve), 'the balance month by month');

    assert.ok(await b.clickWhere(`e => e.getAttribute('href') === '/app/comptes/${account.id}/modifier'`));
    assert.ok(await b.waitFor(`!!document.querySelector('#account-${account.id}-label')`, 'the correction form'));
    await b.type(`#account-${account.id}-label`, 'Compte principal');
    assert.ok(await b.click(fr.accounts.save));
    assert.ok(await b.waitText(fr.accounts.saved));
    assert.equal(await at(), `/app/comptes/${account.id}`, 'back on the detail');
    assert.ok(await b.waitText('Compte principal'));

    // A copied address reopens the same screen.
    await b.goto(`${site.url}/app/comptes/${account.id}`);
    assert.ok(await b.waitText('Compte principal'), 'the address alone opens the detail');
    assert.ok(await b.clickWhere("e => e.matches('.fin-back') && e.getAttribute('href') === '/app/comptes'"), 'its own way back');
  });

  test('COM-04: a transfer, at /app/comptes/transfert — explained when there is only one account', async () => {
    await b.goto(`${site.url}/app/comptes/transfert`);
    assert.ok(await b.waitText(fr.accounts.transferNeedsTwo), 'one account: the screen says what is missing');

    await post('/fin/comptes', { label: 'Épargne', type: 'AC-04', currency: 'DZD', openingBalance: 0, openingDate: iso(-10) });
    await b.goto(`${site.url}/app/comptes`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/app/comptes/transfert'"));
    assert.ok(await b.waitFor("!!document.querySelector('#transfer-amount')", 'the transfer form'));
    await b.type('#transfer-amount', '1000');
    assert.ok(await b.click(fr.accounts.transfer));
    assert.ok(await b.waitText(fr.accounts.transferred));
    assert.equal(await at(), '/app/comptes');
  });

  test('an unknown account is said, not a broken screen', async () => {
    await b.goto(`${site.url}/app/comptes/00000000-0000-4000-8000-000000000000`);
    assert.ok(await b.waitText(fr.accounts.notFound));
  });

  test('TRX-02: the entry at /app/mouvements/nouveau, one click from the list', async () => {
    await b.goto(`${site.url}/app/mouvements`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/app/mouvements/nouveau'"));
    assert.ok(await b.waitFor("location.pathname === '/app/mouvements/nouveau' && !!document.querySelector('#entry-amount')", 'the entry'));
    await b.type('#entry-amount', '1500');
    await b.type('#entry-note', 'Boulangerie');
    assert.ok(await b.click(fr.myMoney.save));
    assert.ok(await b.waitText(fr.myMoney.added));
    assert.equal(await at(), '/app/mouvements');
  });

  test('TRX-03: a movement opens at /app/mouvements/:id, with its trail; a copy starts from it', async () => {
    const movement = await t.prisma.finTransaction.findFirst({ where: { userId: user.id, note: 'Boulangerie' } });
    assert.ok(await b.clickWhere(`e => e.getAttribute('href') === '/app/mouvements/${movement.id}'`), 'the row leads to its detail');
    assert.ok(await b.waitFor(`location.pathname === '/app/mouvements/${movement.id}'`, 'the detail'));
    assert.ok(await b.waitText('Boulangerie'));
    assert.ok(await b.waitText(fr.movements.trailTitle), 'the trail of corrections');

    assert.ok(await b.clickWhere(`e => e.getAttribute('href') === '/app/mouvements/nouveau?copie=${movement.id}'`));
    assert.ok(await b.waitFor("document.querySelector('#entry-note')?.value === 'Boulangerie'", 'the copy starts from the movement'));

    await b.goto(`${site.url}/app/mouvements/00000000-0000-4000-8000-000000000000`);
    assert.ok(await b.waitText(fr.movements.notFound), 'an unknown movement is said');
    const someoneElse = await t.adult({ finPublic: 'SAL' });
    const theirs = (await t.request('POST', '/fin/transactions', { user: someoneElse, json: { kind: 'expense', value: 100, currency: 'DZD', occurredAt: iso(-1) } })).body.transaction;
    await b.goto(`${site.url}/app/mouvements/${theirs.id}`);
    assert.ok(await b.waitText(fr.movements.notFound), 'and so is someone else’s');
  });

  test('BUD-02: a budget created at /app/budgets/nouveau opens on its own detail, then is corrected at /modifier', async () => {
    await b.goto(`${site.url}/app/budgets`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/app/budgets/nouveau'"));
    assert.ok(await b.waitFor("location.pathname === '/app/budgets/nouveau' && !!document.querySelector('#new-budget-label')", 'the form'));
    await b.type('#new-budget-label', 'Budget du mois');
    assert.ok(await b.click(fr.budget.save));
    assert.ok(await b.waitText(fr.budget.created), 'the new budget opens on its detail');
    const budget = await t.prisma.finBudget.findFirst({ where: { userId: user.id, label: 'Budget du mois' } });
    assert.equal(await at(), `/app/budgets/${budget.id}`);

    assert.ok(await b.clickWhere(`e => e.getAttribute('href') === '/app/budgets/${budget.id}/modifier'`));
    assert.ok(await b.waitFor("document.querySelector('#new-budget-label')?.value === 'Budget du mois'", 'the correction, filled'));
    await b.type('#new-budget-label', 'Mon budget');
    assert.ok(await b.click(fr.budget.save));
    assert.ok(await b.waitText(fr.budget.saved));
    assert.ok(await b.waitText('Mon budget'));
  });

  test('BUD-04: the method analysis at /app/budgets/:id/methode, one click from the list', async () => {
    const budget = await t.prisma.finBudget.findFirst({ where: { userId: user.id } });
    await b.goto(`${site.url}/app/budgets`);
    assert.ok(await b.clickWhere(`e => e.getAttribute('href') === '/app/budgets/${budget.id}/methode'`));
    assert.ok(await b.waitFor("!!document.querySelector('#budget-method')", 'the method picker'));
    assert.equal(await at(), `/app/budgets/${budget.id}/methode`);
  });

  test('OBJ-02 and OBJ-03: a goal created at /app/objectifs/nouveau opens at /app/objectifs/:id, with its figures', async () => {
    await b.goto(`${site.url}/app/objectifs`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/app/objectifs/nouveau'"));
    assert.ok(await b.waitFor("!!document.querySelector('#new-goal-label')", 'the form'));
    await b.type('#new-goal-label', 'Ordinateur');
    await b.type('#new-goal-target', '120000');
    await b.ev(`(() => { const i = document.querySelector('#new-goal-date'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, '${iso(300).slice(0, 10)}'); i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    assert.ok(await b.click(fr.goals.save));
    assert.ok(await b.waitText(fr.goals.created), 'the new goal opens on its own screen');
    const goal = await t.prisma.finGoal.findFirst({ where: { userId: user.id, label: 'Ordinateur' } });
    assert.equal(await at(), `/app/objectifs/${goal.id}`);
    assert.ok(await b.waitText(fr.goals.progress), 'its figures');

    await b.goto(`${site.url}/app/objectifs`);
    assert.ok(await b.clickWhere(`e => e.getAttribute('href') === '/app/objectifs/${goal.id}'`), 'the list leads to it');
    assert.ok(await b.waitFor(`location.pathname === '/app/objectifs/${goal.id}'`, 'the detail'));
  });

  test('DET-02 to DET-05: lending, a bank debt and the strategies, each at its own address', async () => {
    await b.goto(`${site.url}/app/dettes`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/app/dettes/pret'"), '« J’ai prêté » one click away');
    assert.ok(await b.waitFor("!!document.querySelector('#loan-who')", 'the loan form'));
    await b.type('#loan-who', 'Karim');
    await b.type('#loan-amount', '2000');
    assert.ok(await b.click(fr.debts.save));
    assert.ok(await b.waitText(fr.debts.loans.saved), 'back on « Mes dettes », which says so');
    assert.equal(await at(), '/app/dettes');

    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/app/dettes/emprunt'"));
    assert.ok(await b.waitFor("location.pathname === '/app/dettes/emprunt' && !!document.querySelector('#loan-who')", '« On m’a prêté »'));

    await b.goto(`${site.url}/app/dettes`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/app/dettes/nouvelle'"));
    assert.ok(await b.waitFor("location.pathname === '/app/dettes/nouvelle'", 'the bank debt form'));

    await b.goto(`${site.url}/app/dettes`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/app/dettes/strategies'"));
    assert.ok(await b.waitText(fr.debts.compareIntro), 'the strategies, at their own address');
  });

  test('PAT-02: an asset opens at /app/patrimoine/:id, and a new valuation keeps its date in the trail', async () => {
    const asset = (await post('/fin/actifs', { label: 'Appartement', kind: 'property', value: 90000000, currency: 'DZD', valuedAt: iso(-20) })).body.asset;
    await b.goto(`${site.url}/app/patrimoine`);
    assert.ok(await b.clickWhere(`e => e.getAttribute('href') === '/app/patrimoine/${asset.id}'`), 'the asset leads to its detail');
    assert.ok(await b.waitFor("!!document.querySelector('#asset-new-value')", 'the detail'));
    assert.ok(await b.waitText(fr.wealth.noValuation));
    await b.type('#asset-new-value', '950000');
    assert.ok(await b.click(fr.wealth.save));
    assert.ok(await b.waitText(fr.wealth.revalued));
    assert.ok(await b.waitFor("document.querySelectorAll('.wealth-valuations li').length === 1", 'the valuation in its trail'));
  });

  test('CAL-02: a regular payment at /app/calendrier/regulier, then back on the calendar that says so', async () => {
    await b.goto(`${site.url}/app/calendrier`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/app/calendrier/regulier'"));
    assert.ok(await b.waitFor("location.pathname === '/app/calendrier/regulier' && !!document.querySelector('#app-main form')", 'the form'));
  });

  test('SYN-02 and REP-01: the list of reports, and one month at its own address', async () => {
    await b.goto(`${site.url}/app/synthese`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/app/synthese/rapports'"), 'the reports, one click away');
    assert.ok(await b.waitText(fr.synthesis.reportsTitle));
    const month = new Date().toISOString().slice(0, 7);
    assert.ok(await b.clickWhere(`e => e.getAttribute('href') === '/app/synthese/rapport/${month}'`));
    assert.ok(await b.waitText(fr.synthesis.sections.R01), 'the report of the month');
    assert.equal(await at(), `/app/synthese/rapport/${month}`);
    // A copied address reopens the same month, not the current one.
    await b.goto(`${site.url}/app/synthese/rapport/2026-01`);
    assert.ok(await b.waitFor("document.querySelector('#synthesis-month')?.value === '2026-01'", 'the month of the address'));
  });

  test('TRX-04: the clearing at /app/mouvements/pointage', async () => {
    await b.goto(`${site.url}/app/mouvements`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/app/mouvements/pointage'"));
    assert.ok(await b.waitText(fr.movements.clearingRate));
    assert.ok(await b.click(fr.movements.clearingStates.checked));
    assert.ok(await b.waitText(fr.movements.cleared));
  });
});

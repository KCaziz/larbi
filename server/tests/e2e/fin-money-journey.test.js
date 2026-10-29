import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// The first steps (P6-03) and the entry of a movement (P6-04) in a real
// browser: a person answers a few questions, sees a first budget, enters a
// movement, finds it, and never sees a fictional amount mixed with a real one.
//
// P6-04 was written for the former « Mon argent » page. P8-07 replaced it by
// « Mouvements » (`/app/mouvements`, TRX-01 to TRX-04) and P8-10 by the
// Synthèse; the requirements did not change, so they are proven there now —
// with one behaviour the client changed: a suspected duplicate is asked
// BEFORE saving (« Enregistrer quand même »), never saved and flagged after.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const on = fr.finOnboarding;
const mm = fr.myMoney;
const fin = fr.fincludia;
const HOUR = 3600 * 1000;

describe('FINCLUDIA money, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  const setSession = async (user) => {
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
  };
  const withPublic = (finPublic) =>
    finPublic === 'LYC'
      ? t.minor({ finPublic, finCurrency: 'DZD', finOnboardedAt: new Date() })
      : t.adult({ finPublic, finCurrency: 'DZD', finOnboardedAt: new Date() });

  // The figure shown by one card, found by its label — WAITED for, since the
  // figures arrive after the page.
  const figureExpr = (label) => `(() => {
      const card = [...document.querySelectorAll('.fin-figure')].find((e) => e.querySelector('.fin-figure-label')?.textContent.includes(${JSON.stringify(label)}));
      return card ? card.querySelector('.fin-figure-value').textContent.trim().replace(/[\\u00a0\\u202f]/g, ' ') : '';
    })()`;
  const waitFigure = (label, pattern) => b.waitFor(`${pattern}.test(${figureExpr(label)})`, `figure ${label}`);

  const openOnboarding = async () => {
    await b.goto(`${site.url}/app/parametres/premiers-pas`);
    assert.ok(await b.waitText(on.resultTitle), 'the first steps are rendered');
  };
  // The list, and the entry at its own address (TRX-02, P8-25).
  const openMovements = async () => {
    await b.goto(`${site.url}/app/mouvements`);
    assert.ok(await b.waitFor("!!document.querySelector('.money-totals')", 'the movements page'));
  };
  const openEntry = async () => {
    await b.goto(`${site.url}/app/mouvements/nouveau`);
    assert.ok(await b.waitFor("!!document.querySelector('#entry-amount')", 'the entry'));
  };
  const rows = () => b.ev("document.querySelectorAll('.money-row').length");

  const fill = async (selector, value) => {
    await b.type(selector, String(value));
    await b.ev(`document.querySelector(${JSON.stringify(selector)}).dispatchEvent(new Event('change', { bubbles: true }))`);
  };
  // A <input type="date"> or a <select> takes its value through the native
  // setter, as React reads it.
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
    t = await boot();
    await t.reset();
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

  test('P6-03: a salarié answers a few questions and gets a first budget that explains itself', async () => {
    const user = await withPublic('SAL');
    await setSession(user);
    await openOnboarding();

    // Nothing is answered yet, so every figure says "non calculé" — not zero.
    assert.ok(await b.waitFor(`${figureExpr(on.result.revenus)} === ${JSON.stringify(fin.notComputed)}`, 'not computed'));

    // The client's own « Pourquoi cette question ? », on the question it belongs to.
    assert.ok(
      await b.ev(`(() => {
        const box = [...document.querySelectorAll('.fin-onboarding-question')].find((e) => e.querySelector('legend').textContent.includes(${JSON.stringify(on.questions.netSalary)}));
        const button = box?.querySelector('.fin-onboarding-why');
        if (!button) return false;
        button.click();
        return true;
      })()`),
    );
    assert.ok(await b.waitText('Le salaire NET est ce qui arrive'), 'the explanation is shown');

    await fill('#q-netSalary', 60000);
    assert.ok(await setValue('#f-netSalary', 'mensuel', 'HTMLSelectElement'));
    await fill('#q-fixedCharges', 25000);
    assert.ok(await b.click(on.saveAndQuit));
    assert.ok(await b.waitText(on.saved), 'the confirmation survives the reload');

    // 60 000,00 - 25 000,00 = 35 000,00 DZD, computed by the server.
    assert.ok(await waitFigure(on.result.fluxNet, '/35\\s?000/'), 'the net flow computed by the server');

    assert.ok(await b.ev("(() => { const d = [...document.querySelectorAll('.fin-why summary')]; if (!d.length) return false; d[0].click(); return true; })()"));
    assert.ok(await b.waitText(fin.whyByFormula.F002), 'the plain-language sentence for F002');

    // And it really wrote a resource, not just a number on screen.
    const incomes = await t.prisma.finIncome.findMany({ where: { userId: user.id } });
    assert.equal(incomes.length, 1);
    assert.equal(incomes[0].value, 6000000, 'stored in centimes');
  });

  test('P6-03: skipping a question is an answer, and completeness says so', async () => {
    const user = await withPublic('SAL');
    await setSession(user);
    await openOnboarding();
    assert.ok(
      await b.ev(`(() => {
        const box = [...document.querySelectorAll('.fin-onboarding-question')].find((e) => e.querySelector('legend').textContent.includes(${JSON.stringify(on.questions.liquidSavings)}));
        const input = box?.querySelector('.fin-onboarding-skip input');
        if (!input) return false;
        input.click();
        return true;
      })()`),
    );
    assert.ok(await b.click(on.saveAndQuit));
    assert.ok(await b.waitText(on.saved));
    const stored = await t.prisma.finOnboarding.findFirst({ where: { userId: user.id } });
    assert.deepEqual(stored.answers.liquidSavings, { skipped: true });
  });

  test('P6-03: a lycéen is never asked about debt, and is offered the fictional budget', async () => {
    await setSession(await withPublic('LYC'));
    await openOnboarding();
    assert.ok(await b.waitFor("document.querySelectorAll('.fin-onboarding-question legend').length > 0", 'the questions'));
    const legends = await b.ev("[...document.querySelectorAll('.fin-onboarding-question legend')].map((e) => e.textContent)");
    assert.ok(!legends.some((text) => text.includes(on.questions.debtPayment)), 'no debt question');
    assert.ok(legends.some((text) => text.includes(on.questions.pocketMoney)));

    assert.ok(await b.waitText(on.fictionalTitle));
    assert.ok(await b.click(on.fictionalAccept));
    assert.ok(await b.waitText(on.fictionalStarted));
    assert.ok(await b.waitText(fin.simulationBadge));
    assert.ok(await b.waitFor("document.querySelectorAll('.fin-figure-simulation').length > 0", 'the simulated figures'));
  });

  test('P6-04: entering an expense, finding it in the list, and seeing the synthesis move', async () => {
    const user = await withPublic('SAL');
    await setSession(user);
    await openMovements();
    assert.ok(await b.waitText(mm.noTransaction), 'nothing recorded yet');

    await openEntry();
    await fill('#entry-amount', 2500);
    await fill('#entry-note', 'Courses de la semaine');
    assert.ok(await b.click(mm.save));
    assert.ok(await b.waitText(mm.added), 'back on the list, which says so');
    assert.ok(await b.waitText('Courses de la semaine'), 'the movement is in the list, with its note');
    assert.equal(await rows(), 1);

    // The Synthèse recomputes from it, on the server.
    await b.goto(`${site.url}/app/synthese`);
    assert.ok(await waitFigure(fr.movements.tabs.expense, '/2\\s?500/'), 'the synthesis counts the new expense');
  });

  test('P6-04: a suspected duplicate is asked before saving, and saved only if the person says so', async () => {
    const user = await withPublic('SAL');
    await setSession(user);
    await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value: 250000, currency: 'DZD', occurredAt: new Date(Date.now() - HOUR).toISOString() } });
    await openEntry();

    await fill('#entry-amount', 2500);
    assert.ok(await b.click(mm.save));
    assert.ok(await b.waitText(fr.movements.saveAnyway), 'the duplicate is asked about, not refused');
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: user.id } }), 1, 'nothing saved before the answer');
    assert.ok(await b.click(fr.movements.saveAnyway));
    assert.ok(await b.waitText(mm.added));
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: user.id } }), 2, 'saved once the person says so');
  });

  test('P6-04: a future date is refused for an ordinary expense, and explained on the page', async () => {
    await setSession(await withPublic('SAL'));
    await openEntry();
    const future = new Date(Date.now() + 5 * 24 * HOUR).toISOString().slice(0, 10);
    await fill('#entry-amount', 1000);
    assert.ok(await setValue('#entry-occurredAt', future));
    assert.equal(await b.ev("document.querySelector('#entry-occurredAt').value"), future);
    assert.ok(await b.click(mm.save));
    assert.ok(await b.waitText(mm.errors.refused), 'the reason is shown');
    assert.ok(await b.ev("!!document.querySelector('#entry-amount')"), 'the form is still there');

    // Marked as planned, the same date is accepted.
    assert.ok(await b.ev("(() => { const el = document.querySelector('#entry-planned'); if (!el) return false; el.click(); return true; })()"), 'the planned box is ticked');
    assert.ok(await b.click(mm.save));
    assert.ok(await b.waitText(mm.added));
    assert.ok(await b.waitText(mm.plannedTag));
  });

  test('P6-04: the filters narrow the list, and a movement is recategorised by correcting it', async () => {
    const user = await withPublic('SAL');
    await setSession(user);
    for (const [value, note] of [
      [250000, 'Courses de la semaine'],
      [90000, 'Taxi'],
      [700000, 'Pharmacie'],
    ]) {
      await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value, currency: 'DZD', occurredAt: new Date(Date.now() - HOUR).toISOString(), note } });
    }
    await openMovements();
    assert.ok(await b.waitFor("document.querySelectorAll('.money-row').length === 3", 'three movements'));

    await fill('#filter-text', 'Courses');
    assert.ok(await b.click(mm.filter));
    assert.ok(await b.waitFor("document.querySelectorAll('.money-row').length === 1", 'only the matching one'));

    const categoryId = (await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null }, select: { id: true } })).id;
    assert.ok(await b.clickWhere(`e => (e.getAttribute('title') ?? '') === ${JSON.stringify(fr.movements.edit)}`));
    assert.ok(await b.waitFor("document.querySelector('#entry-note')?.value === 'Courses de la semaine'", 'the movement in the form'));
    assert.ok(await setValue('#entry-categoryId', categoryId, 'HTMLSelectElement'));
    assert.ok(await b.click(mm.save));
    assert.ok(await b.waitText(fr.movements.corrected), 'back on the movement, which says so');
    const moved = await t.prisma.finTransaction.findFirst({ where: { userId: user.id, note: 'Courses de la semaine' } });
    assert.equal(moved.categoryId, categoryId);
    assert.equal(await b.ev('location.pathname'), `/app/mouvements/${moved.id}`, 'the correction returns to its detail');

    await openMovements();
    await fill('#filter-text', 'Courses');
    assert.ok(await b.click(mm.filter));
    assert.ok(await b.waitFor("document.querySelectorAll('.money-row').length === 1", 'filtered again'));
    assert.ok(await b.click(mm.clear));
    assert.ok(await b.waitFor("document.querySelectorAll('.money-row').length === 3", 'the filter is cleared'));
  });

  test('P6-04: a fictional movement is never mixed into the real total', async () => {
    const user = await withPublic('LYC');
    await setSession(user);
    await t.request('PUT', '/fin/onboarding', { user, json: { fictional: true } });
    await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value: 150000, currency: 'DZD', occurredAt: new Date(Date.now() - HOUR).toISOString() } });

    await openMovements();
    assert.ok(await b.waitFor("document.querySelectorAll('.money-row-simulation').length >= 1", 'the fictional rows, marked apart'));
    // The totals of the list are the REAL ones: the 5 000 DA of fictional
    // income of the starter budget are not in them.
    const totals = (await b.ev("document.querySelector('.money-totals').innerText")).replace(/[  ]/g, ' ');
    assert.ok(!totals.includes('5 000'), `the real totals show ${totals}`);
  });

  test('both pages work in Arabic, right to left', async () => {
    const ar = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/ar.json'), 'utf8'));
    await b.ev("localStorage.setItem('lang', 'ar')");
    await b.goto(`${site.url}/app/mouvements/nouveau`);
    assert.ok(await b.waitText(ar.myMoney.save));
    assert.equal(await b.ev("document.documentElement.getAttribute('dir')"), 'rtl');
    await b.goto(`${site.url}/app/parametres/premiers-pas`);
    assert.ok(await b.waitText(ar.finOnboarding.resultTitle));
    await b.ev("localStorage.setItem('lang', 'fr')");
  });
});

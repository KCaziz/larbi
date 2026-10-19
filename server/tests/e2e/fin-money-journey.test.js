import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// The onboarding (P6-03) and "Mon argent" (P6-04) in a real browser: a person
// answers a few questions, sees a first budget, enters a movement, finds it in
// the history, and never sees a fictional amount mixed with a real one.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const on = fr.finOnboarding;
const mm = fr.myMoney;
const fin = fr.fincludia;

describe('FINCLUDIA money, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  const setSession = async (user) => {
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
  };

  // A user with a FINCLUDIA public, reloaded so the session carries it.
  const withPublic = async (finPublic) => {
    const created = await t.user();
    await t.prisma.user.update({ where: { id: created.id }, data: { finPublic, finCurrency: 'DZD' } });
    return t.prisma.user.findUnique({ where: { id: created.id } });
  };

  // The figure shown by one card, found by its label.
  const figureOf = (label) =>
    b.ev(`(() => {
      const card = [...document.querySelectorAll('.fin-figure')].find((e) => e.querySelector('.fin-figure-label')?.textContent.includes(${JSON.stringify(label)}));
      return card ? card.querySelector('.fin-figure-value').textContent.trim() : null;
    })()`);

  // `on.title` and `mm.title` are ALSO the labels of the account navigation
  // links, so waiting on them succeeds before the page has rendered a thing.
  // These wait on text that belongs to the page body alone.
  const openOnboarding = async () => {
    await b.goto(`${site.url}/compte/premiers-pas`);
    assert.ok(await b.waitText(on.resultTitle), 'the onboarding page is rendered');
  };
  const openMoney = async () => {
    await b.goto(`${site.url}/mon-argent`);
    assert.ok(await b.waitText(mm.synthesisTitle), 'the money page is rendered');
  };

  const fill = async (selector, value) => {
    await b.type(selector, String(value));
    await b.ev(`document.querySelector(${JSON.stringify(selector)}).dispatchEvent(new Event('change', { bubbles: true }))`);
  };

  // A <input type="date"> does not take inserted text: its value has to be set
  // through the native setter, like a <select>.
  const setDate = (selector, value) =>
    b.ev(`(() => {
      const input = document.querySelector(${JSON.stringify(selector)});
      if (!input) return false;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);

  const pick = (selector, value) =>
    b.ev(`(() => {
      const select = document.querySelector(${JSON.stringify(selector)});
      if (!select) return false;
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, ${JSON.stringify(value)});
      select.dispatchEvent(new Event('change', { bubbles: true }));
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
    assert.equal(await figureOf(on.result.revenus), fin.notComputed);

    // The client's own « Pourquoi cette question ? », on the question it belongs
    // to: clicking the first one on the page would explain a different question.
    assert.ok(
      await b.ev(`(() => {
        const box = [...document.querySelectorAll('.fin-onboarding-question')].find((e) => e.querySelector('legend').textContent.includes(${JSON.stringify(fr.finOnboarding.questions.netSalary)}));
        const button = box?.querySelector('.fin-onboarding-why');
        if (!button) return false;
        button.click();
        return true;
      })()`),
    );
    assert.ok(await b.waitText('Le salaire NET est ce qui arrive'), 'the explanation is shown');

    await fill('#q-netSalary', 60000);
    assert.ok(await pick('#f-netSalary', 'mensuel'));
    await fill('#q-fixedCharges', 25000);
    assert.ok(await b.click(on.saveAndQuit));
    assert.ok(await b.waitText(on.saved), 'the confirmation survives the reload');

    // 60 000,00 - 25 000,00 = 35 000,00 DZD, computed by the server.
    const net = await figureOf(on.result.fluxNet);
    assert.match(net.replace(/ | /g, ' '), /35\s?000/);

    // "Pourquoi ?" opens a short, discreet explanation — the formula itself
    // is no longer shown on screen (2026-10-19, see FigureCard and TASKS.md).
    assert.ok(await b.ev("(() => { const d = [...document.querySelectorAll('.fin-why summary')]; if (!d.length) return false; d[0].click(); return true; })()"));
    assert.ok(await b.waitText(fr.fincludia.whyByFormula.F002), 'the plain-language sentence for F002');

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
        const box = [...document.querySelectorAll('.fin-onboarding-question')].find((e) => e.querySelector('legend').textContent.includes(${JSON.stringify(fr.finOnboarding.questions.liquidSavings)}));
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
    const user = await withPublic('LYC');
    await setSession(user);
    await openOnboarding();

    const legends = await b.ev("[...document.querySelectorAll('.fin-onboarding-question legend')].map((e) => e.textContent)");
    assert.ok(!legends.some((text) => text.includes(fr.finOnboarding.questions.debtPayment)), 'no debt question');
    assert.ok(legends.some((text) => text.includes(fr.finOnboarding.questions.pocketMoney)));

    assert.ok(await b.waitText(on.fictionalTitle));
    assert.ok(await b.click(on.fictionalAccept));
    assert.ok(await b.waitText(on.fictionalStarted));
    // Every figure now carries the badge, permanently.
    assert.ok(await b.waitText(fin.simulationBadge));
    assert.equal(await b.ev("document.querySelectorAll('.fin-figure-simulation').length > 0"), true);
  });

  test('P6-04: entering an expense, finding it in the history, and seeing the synthesis move', async () => {
    const user = await withPublic('SAL');
    await setSession(user);
    await openMoney();
    assert.equal(await figureOf(mm.expenses), fin.notComputed, 'nothing recorded is not zero spent');

    await fill('#entry-amount', 2500);
    await fill('#entry-note', 'Courses de la semaine');
    assert.ok(await b.click(mm.save));
    assert.ok(await b.waitText(mm.added));

    // The synthesis recomputed server-side.
    const expenses = await figureOf(mm.expenses);
    assert.match(expenses.replace(/ | /g, ' '), /2\s?500/);

    // And the movement is in the history, with its note.
    assert.ok(await b.waitText('Courses de la semaine'));
    assert.equal(await b.ev("document.querySelectorAll('.money-row').length"), 1);
  });

  test('P6-04: a suspected duplicate is signalled, and the movement is still saved', async () => {
    const user = await withPublic('SAL');
    await setSession(user);
    // The first movement is entered through the API, so what the browser does
    // here is exactly the second one — the one that must be flagged.
    await t.request('POST', '/fin/transactions', {
      user,
      json: { kind: 'expense', value: 250000, currency: 'DZD', occurredAt: new Date(Date.now() - 3600 * 1000).toISOString() },
    });
    await openMoney();

    await fill('#entry-amount', 2500);
    assert.ok(await b.click(mm.save));
    assert.ok(await b.waitText('très semblable'), 'the duplicate is signalled, not refused');
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: user.id } }), 2, 'and saved anyway');
  });

  test('P6-04: a future date is refused for an ordinary expense, and explained on the page', async () => {
    await setSession(await withPublic('SAL'));
    await openMoney();
    const future = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    await fill('#entry-amount', 1000);
    assert.ok(await setDate('#entry-date', future));
    assert.equal(await b.ev("document.querySelector('#entry-date').value"), future);
    assert.ok(await b.click(mm.save));
    assert.ok(await b.waitText(mm.errors.refused), 'the reason is shown');
    assert.ok(await b.ev(`document.body.innerText.includes(${JSON.stringify(mm.synthesisTitle)})`), 'the page is still there');

    // Marked as planned, the same date is accepted.
    assert.ok(await b.ev("(() => { const el = document.querySelector('#entry-planned'); if (!el) return false; el.click(); return true; })()"), 'the planned box is ticked');
    assert.ok(await b.click(mm.save));
    assert.ok(await b.waitText(mm.added));
    assert.ok(await b.waitText(mm.plannedTag));
  });

  test('P6-04: the history filters narrow the list, and recategorising works in place', async () => {
    const user = await withPublic('SAL');
    await setSession(user);
    const hourAgo = () => new Date(Date.now() - 3600 * 1000).toISOString();
    for (const [value, note] of [
      [250000, 'Courses de la semaine'],
      [90000, 'Taxi'],
      [700000, 'Pharmacie'],
    ]) {
      await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value, currency: 'DZD', occurredAt: hourAgo(), note } });
    }
    await openMoney();
    assert.equal(await b.ev("document.querySelectorAll('.money-row').length"), 3);

    await fill('#money-text', 'Courses');
    assert.ok(await b.click(mm.filter));
    assert.ok(await b.waitText('Courses de la semaine'));
    assert.equal(await b.ev("document.querySelectorAll('.money-row').length"), 1, 'only the matching one');

    // Recategorise the row in place, from the picker of its own line.
    const categoryId = (await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null }, select: { id: true } })).id;
    assert.ok(await pick('.money-row select', categoryId));
    assert.ok(await b.waitText(mm.recategorised));
    const moved = await t.prisma.finTransaction.findFirst({ where: { userId: user.id, note: 'Courses de la semaine' } });
    assert.equal(moved.categoryId, categoryId);

    assert.ok(await b.click(mm.clear));
    assert.ok(await b.waitFor("document.querySelectorAll('.money-row').length === 3", 'the filter is cleared'));
  });

  test('P6-04: a fictional movement is never mixed into the real total', async () => {
    const user = await withPublic('LYC');
    await setSession(user);
    // The fictional starter budget, then one real expense.
    await t.request('PUT', '/fin/onboarding', { user, json: { fictional: true } });
    await t.request('POST', '/fin/transactions', {
      user,
      json: { kind: 'expense', value: 150000, currency: 'DZD', occurredAt: new Date(Date.now() - 3600 * 1000).toISOString() },
    });

    await openMoney();
    assert.ok(await b.waitText(mm.simulationTitle), 'the fictional block is apart');
    // The real income total must NOT include the 5 000 DA of fictional money.
    const income = await figureOf(mm.income);
    assert.ok(!income.replace(/ | /g, ' ').includes('5 000'), `real income shows ${income}`);
    assert.equal(await b.ev("document.querySelectorAll('.money-row-simulation').length"), 1);
  });

  test('both pages work in Arabic, right to left', async () => {
    const ar = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/ar.json'), 'utf8'));
    await b.ev("localStorage.setItem('lang', 'ar')");
    await b.goto(`${site.url}/mon-argent`);
    assert.ok(await b.waitText(ar.myMoney.synthesisTitle));
    assert.equal(await b.ev("document.documentElement.getAttribute('dir')"), 'rtl');
    await b.goto(`${site.url}/compte/premiers-pas`);
    assert.ok(await b.waitText(ar.finOnboarding.resultTitle));
    await b.ev("localStorage.setItem('lang', 'fr')");
  });
});

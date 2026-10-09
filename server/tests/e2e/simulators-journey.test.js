import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// The FINCLUDIA simulators in a real browser (P4-10). The arithmetic is already
// covered on the engine (unit/finance.test.js) and on the API
// (functional/simulations.test.js); what matters here is what a person actually
// gets: a form drawn from what the server declares, figures in dinars and
// percentages, a "Pourquoi ?" that shows the formula, and "non calculé" instead
// of a zero when a value cannot be worked out.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const s = fr.simulators;

describe('simulators, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  // Types into the input of a field, the way a user would.
  const fill = (field, value) => b.type(`#field-${field}`, String(value));
  const results = () =>
    b.ev(`[...document.querySelectorAll('.simulator-result')].map((li) => ({
      name: li.querySelector('.simulator-result-name').innerText.trim(),
      value: li.querySelector('.simulator-value').innerText.trim(),
    }))`);
  // French number formatting uses narrow no-break spaces ("10 %", "25 000,00 DA"),
  // so comparisons normalise every kind of space to a plain one.
  const plain = (text) => (text ?? '').replace(/[\s  ]+/g, ' ').trim();
  const valueOf = async (label) => plain((await results()).find((r) => r.name === label)?.value);

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

  test('from the tools page to the catalogue: every simulator, no account needed', async () => {
    await b.clearCookies();
    await b.goto(`${site.url}/outils`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/outils/simulateurs'"), 'the tools page links to the simulators');
    // Waiting on the title alone would pass without navigating: the tools page
    // has a card with the same name. The intro belongs to the catalogue only.
    assert.ok(await b.waitText(s.intro));
    assert.equal(await b.ev("document.querySelectorAll('.feature-card').length"), Object.keys(s.list).length);
    const text = await b.text();
    for (const key of Object.keys(s.list)) assert.ok(text.includes(s.list[key].title), `${key} is listed`);
    assert.ok(text.includes(s.disclaimer), 'the indicative-simulation notice is shown');
  });

  test('a monthly budget: dinars in, dinars out, and the living allowance is not the net flow', async () => {
    await b.goto(`${site.url}/outils/simulateurs/budget-mensuel`);
    assert.ok(await b.waitText(s.list['budget-mensuel'].title));
    await fill('plannedIncome', 100000);
    await fill('fixedExpenses', 40000);
    await fill('variableExpenses', 20000);
    await fill('debtInstalments', 15000);
    await fill('plannedSavings', 10000);
    assert.ok(await b.clickContaining(s.compute));
    assert.ok(await b.waitText(s.resultsTitle));

    const netFlow = await valueOf(s.results.fluxNet);
    const living = await valueOf(s.results.resteAVivre);
    assert.ok(netFlow.includes('25'), `net flow shows 25 000, got ${netFlow}`);
    assert.ok(living.includes('45'), `living allowance shows 45 000, got ${living}`);
    assert.notEqual(netFlow, living, 'the client insists these two are different numbers');
    assert.equal(await valueOf(s.results.tauxEpargne), '10 %');
  });

  test('"Pourquoi ?" shows the formula, its reference and the values used', async () => {
    // Self-contained: a test must not depend on the state another one left.
    await b.goto(`${site.url}/outils/simulateurs/autonomie-etudiant`);
    assert.ok(await b.waitText(s.list['autonomie-etudiant'].title));
    await fill('ownIncome', 30000);
    await fill('totalExpenses', 60000);
    assert.ok(await b.clickContaining(s.compute));
    assert.ok(await b.waitText(s.resultsTitle));
    // A <summary> is not a button or a link, so the shared click helper cannot
    // reach it: same approach as the other journeys that open a <details>.
    assert.ok(await b.ev("(() => { const e = document.querySelector('.simulator-why > summary'); if (!e) return false; e.click(); return true; })()"));
    const why = await b.ev(`(() => {
      const open = [...document.querySelectorAll('.simulator-why')].find((d) => d.open);
      return open ? open.innerText : null;
    })()`);
    assert.ok(why, 'a "Pourquoi ?" panel is open');
    assert.ok(why.includes(s.whyFormula) && why.includes(s.whyCondition) && why.includes(s.whyInputs));
    assert.match(why, /F0\d\d/, "the client's formula reference is shown");
  });

  test('what cannot be computed says "non calculé", never 0', async () => {
    await b.goto(`${site.url}/outils/simulateurs/reserve-securite`);
    assert.ok(await b.waitText(s.list['reserve-securite'].title));
    await fill('liquidSavings', 300000);
    await fill('essentialMonthlyExpenses', 0);
    await fill('targetMonths', 6);
    assert.ok(await b.clickContaining(s.compute));
    assert.ok(await b.waitText(s.resultsTitle));
    assert.equal(await valueOf(s.results.moisCouverts), s.notComputed);
    assert.equal(await b.ev("document.querySelectorAll('.simulator-value-unknown').length >= 1"), true, 'shown differently from a figure');
  });

  test('a projection shows its hypotheses', async () => {
    await b.goto(`${site.url}/outils/simulateurs/objectif-avec-rendement`);
    assert.ok(await b.waitText(s.list['objectif-avec-rendement'].title));
    await fill('target', 2000000);
    await fill('capital', 500000);
    await fill('contribution', 20000);
    await fill('months', 36);
    await fill('monthlyRate', 0.4); // typed as a percentage, sent as 0.004
    assert.ok(await b.clickContaining(s.compute));
    assert.ok(await b.waitText(s.hypotheses));
    const text = await b.text();
    assert.ok(text.includes(fr.simulators.hypothesisNames.horizon_mois));
    assert.ok(await valueOf(s.results.valeurFutureTotale));
  });

  // Lot 2 (P4-11): the first simulator with a repeated field, and the first
  // results that are one answer with several parts.
  test('a list of debts: a row is added, and the two orders are compared', async () => {
    await b.goto(`${site.url}/outils/simulateurs/strategies-dettes`);
    assert.ok(await b.waitText(s.list['strategies-dettes'].title));
    await fill('debts-0-label', 'Carte');
    await fill('debts-0-balance', 300000);
    await fill('debts-0-annualRate', 18);
    await fill('debts-0-minimumPayment', 10000);
    // A second debt: the row only exists because the person asked for it.
    assert.ok(await b.clickContaining(s.addRow));
    assert.ok(await b.ev("document.querySelectorAll('#field-debts-1-label').length === 1"));
    await fill('debts-1-label', 'Auto');
    await fill('debts-1-balance', 800000);
    await fill('debts-1-annualRate', 6);
    await fill('debts-1-minimumPayment', 20000);
    await fill('extraPayment', 15000);
    assert.ok(await b.clickContaining(s.compute));
    assert.ok(await b.waitText(s.resultsTitle));

    const text = plain(await b.text());
    assert.ok(text.includes(plain(s.results.avalanche)) && text.includes(plain(s.results.bouleDeNeige)));
    // The parts of a plan, and the name the person typed read back in the
    // payoff order rather than a row number.
    assert.ok(text.includes(plain(s.parts.totalInterest)) && text.includes(plain(s.parts.payoff)));
    assert.ok(text.includes('Carte') && text.includes('Auto'), 'the debts are named by what was typed');
  });

  test('a financing: the convention is shown as an input, and the impact has two parts', async () => {
    await b.goto(`${site.url}/outils/simulateurs/mensualite-financement`);
    assert.ok(await b.waitText(s.list['mensualite-financement'].title));
    // F020 requires the convention to be stated: it is a field with a value the
    // person can see and change, not a 12 hidden in the code.
    assert.equal(await b.ev("document.querySelector('#field-periodsPerYear').value"), '12');
    await fill('creditAmount', 2000000);
    await fill('downPayment', 200000);
    await fill('annualRate', 6);
    await fill('durationMonths', 60);
    await fill('netIncome', 120000);
    await fill('currentLivingAllowance', 60000);
    assert.ok(await b.clickContaining(s.compute));
    assert.ok(await b.waitText(s.resultsTitle));

    const text = plain(await b.text());
    assert.ok(text.includes(plain(s.results.mensualite)) && text.includes(plain(s.results.coutTotal)));
    // One answer, two values, as the client's own F056 row returns them.
    assert.ok(text.includes(plain(s.parts.livingAllowance)) && text.includes(plain(s.parts.effortRate)));
  });

  test('a refused saisie is explained on the page, which stays usable', async () => {
    // A down payment above the price: the server refuses and names the field.
    // This path used to take the whole screen down — the error callout asked
    // for a variant the component did not have (fixed with P4-12).
    await b.goto(`${site.url}/outils/simulateurs/simulation-logement`);
    assert.ok(await b.waitText(s.list['simulation-logement'].title));
    await fill('price', 1000000);
    await fill('downPayment', 1500000);
    await fill('annualRate', 5);
    await fill('durationMonths', 120);
    await fill('netIncome', 100000);
    await fill('currentLivingAllowance', 50000);
    assert.ok(await b.clickContaining(s.compute));
    assert.ok(await b.waitFor("document.querySelectorAll('.notice-error').length === 1"), 'the refusal is shown');
    assert.ok((await b.text()).includes(s.compute), 'the form is still there');
    assert.equal(await b.ev("document.querySelectorAll('.simulator-result').length"), 0);

    // And correcting the input works, without reloading the page.
    await fill('downPayment', 200000);
    assert.ok(await b.clickContaining(s.compute));
    assert.ok(await b.waitText(s.resultsTitle));
    assert.ok(await valueOf(s.results.mensualite));
  });

  test('an unknown simulator is a 404 page, not a broken screen', async () => {
    await b.goto(`${site.url}/outils/simulateurs/inexistant`);
    assert.ok(await b.waitText(fr.notFound.title));
  });

  test('on a phone, in Arabic, the form and the results stay readable', async () => {
    await b.setViewport(375);
    await b.ev("localStorage.setItem('lang', 'ar')");
    await b.goto(`${site.url}/outils/simulateurs/inflation`);
    const ar = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/ar.json'), 'utf8')).simulators;
    assert.ok(await b.waitText(ar.list.inflation.title));
    assert.equal(await b.ev("document.documentElement.getAttribute('dir')"), 'rtl');
    await fill('nominalValue', 1000000);
    await fill('inflation', 5);
    await fill('years', 10);
    assert.ok(await b.clickContaining(ar.compute));
    assert.ok(await b.waitText(ar.resultsTitle));
    const overflow = await b.ev('document.documentElement.scrollWidth - document.documentElement.clientWidth');
    assert.ok(overflow <= 1, `horizontal overflow of ${overflow}px`);
    await b.setViewport(1280);
    await b.ev("localStorage.setItem('lang', 'fr')");
  });
});

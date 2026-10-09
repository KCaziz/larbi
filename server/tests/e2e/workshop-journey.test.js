import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// The simulation workshop in a real browser (P4-16, screen C18). The API is
// covered by functional/scenarios.test.js; what matters here is the journey the
// client describes: find a simulator, see an example, run it, keep the scenario
// with its hypotheses, compare two of them.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const w = fr.workshop;
const s = fr.simulators;
const PASSWORD = 'Passw0rd!test';

describe('the simulation workshop, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  const plain = (text) => (text ?? '').replace(/[\s  ]+/g, ' ').trim();
  const fill = (field, value) => b.type(`#field-${field}`, String(value));

  const login = async (email) => {
    await b.clearCookies();
    await b.goto(`${site.url}/connexion`);
    await b.waitFor("!!document.querySelector('#email')");
    await b.type('#email', email);
    await b.type('#password', PASSWORD);
    await b.click(fr.auth.login.submit);
    assert.ok(await b.waitFor("location.pathname !== '/connexion'"), `signed in as ${email}`);
  };

  before(async () => {
    t = await boot();
    await t.reset();
    await t.user({ name: 'Nadia Épargnante', email: 'nadia@example.com', passwordHash: await bcrypt.hash(PASSWORD, 10) });
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

  test('the empty state is the catalogue, and the search narrows it', async () => {
    await b.clearCookies();
    await b.goto(`${site.url}/outils`);
    assert.ok(await b.clickWhere("e => e.getAttribute('href') === '/outils/atelier'"), 'the tools page links to the workshop');
    assert.ok(await b.waitText(w.intro));
    // Every simulator is offered, as the client's empty state asks.
    const all = await b.ev("document.querySelectorAll('.feature-card').length");
    assert.ok(all >= 18, `the catalogue shows every simulator, got ${all}`);

    await b.type('#workshop-search', 'dette');
    assert.ok(await b.waitFor(`document.querySelectorAll('.feature-card').length < ${all}`), 'the search narrows the catalogue');
    const text = plain(await b.text());
    assert.ok(text.includes(plain(s.list['strategies-dettes'].title)));
    assert.ok(!text.includes(plain(s.list.inflation.title)), 'what does not match is not shown');
  });

  test('a simulator opens in place, with example values to look at first', async () => {
    await b.goto(`${site.url}/outils/atelier`);
    assert.ok(await b.waitText(w.intro));
    await b.type('#workshop-search', 'inflation');
    // Several simulators mention inflation in their description, so the card is
    // picked by its title rather than by being the only one left.
    assert.ok(
      await b.waitFor(`(() => {
        const card = [...document.querySelectorAll('.feature-card')].find((c) => c.innerText.includes(${JSON.stringify(s.list.inflation.title)}));
        if (!card) return false;
        card.querySelector('button').click();
        return true;
      })()`),
    );
    assert.ok(await b.waitFor("!!document.querySelector('#field-nominalValue')"), 'the form opened in the workshop');

    // The example is loaded into the form, visible and editable — not computed.
    assert.ok(await b.clickContaining(s.loadExample));
    assert.ok(await b.waitFor("document.querySelector('#field-nominalValue').value !== ''"));
    assert.equal(await b.ev("document.querySelectorAll('.simulator-result').length"), 0, 'nothing is computed until asked');

    assert.ok(await b.clickContaining(s.compute));
    assert.ok(await b.waitText(s.resultsTitle));
    // A visitor can compute; keeping the scenario is what needs an account.
    assert.ok((await b.text()).includes(plain(s.saveNeedsAccount).slice(0, 40)));
    assert.equal(await b.ev("document.querySelectorAll('#scenario-title').length"), 0);
  });

  test('signed in: a scenario is kept with its hypotheses and its formula versions', async () => {
    await login('nadia@example.com');
    await b.goto(`${site.url}/outils/simulateurs/objectif-avec-rendement`);
    assert.ok(await b.waitText(s.list['objectif-avec-rendement'].title));
    await fill('target', 2000000);
    await fill('capital', 500000);
    await fill('contribution', 20000);
    await fill('months', 60);
    await fill('monthlyRate', 0.4);
    assert.ok(await b.clickContaining(s.compute));
    assert.ok(await b.waitText(s.resultsTitle));

    assert.ok(await b.waitFor("!!document.querySelector('#scenario-title')"), 'a signed-in person is offered to keep it');
    await b.type('#scenario-title', 'Objectif deux millions');
    assert.ok(await b.clickContaining(s.saveScenario));
    assert.ok(await b.waitText('Objectif deux millions'));

    // And it is listed in the workshop, with the hypotheses it ran under.
    await b.goto(`${site.url}/outils/atelier`);
    assert.ok(await b.waitText('Objectif deux millions'));
    const text = plain(await b.text());
    assert.ok(text.includes(plain(s.hypotheses)), 'the hypotheses are shown with the scenario');
    assert.ok(text.includes(plain(s.hypothesisNames.horizon_mois)));
  });

  test('two scenarios are compared figure by figure, with no overall mark', async () => {
    await login('nadia@example.com');
    // A second scenario of the same simulator, with one input changed.
    await b.goto(`${site.url}/outils/simulateurs/budget-mensuel`);
    assert.ok(await b.waitText(s.list['budget-mensuel'].title));
    const budget = async (instalments, title) => {
      await fill('plannedIncome', 80000);
      await fill('fixedExpenses', 35000);
      await fill('variableExpenses', 20000);
      await fill('debtInstalments', instalments);
      await fill('plannedSavings', 10000);
      assert.ok(await b.clickContaining(s.compute));
      assert.ok(await b.waitFor("!!document.querySelector('#scenario-title')"));
      await b.type('#scenario-title', title);
      assert.ok(await b.clickContaining(s.saveScenario));
      assert.ok(await b.waitText(title));
    };
    await budget(8000, 'Sans voiture');
    await b.goto(`${site.url}/outils/simulateurs/budget-mensuel`);
    assert.ok(await b.waitText(s.list['budget-mensuel'].title));
    await budget(20000, 'Avec voiture');

    await b.goto(`${site.url}/outils/atelier`);
    assert.ok(await b.waitText('Sans voiture'));
    // Pick the two budget scenarios.
    assert.ok(
      await b.ev(`(() => {
        const wanted = ['Sans voiture', 'Avec voiture'];
        const items = [...document.querySelectorAll('.scenario')];
        let clicked = 0;
        for (const item of items) {
          if (wanted.some((name) => item.innerText.includes(name))) {
            item.querySelector('input[type=checkbox]').click();
            clicked += 1;
          }
        }
        return clicked === 2;
      })()`),
    );
    assert.ok(await b.clickContaining(w.compareSelected.replace('{{count}}', '2')));
    assert.ok(await b.waitText(w.comparisonTitle));

    const text = plain(await b.text());
    // The same figure of both scenarios, side by side, with its formula named.
    assert.ok(text.includes(plain(s.results.fluxNet)) && text.includes('F004'));
    assert.ok(text.includes(plain(w.noScoreNote).slice(0, 40)), 'the absence of an overall mark is explained');
  });

  test('a scenario can be deleted, and the comparison goes with it', async () => {
    await login('nadia@example.com');
    await b.goto(`${site.url}/outils/atelier`);
    assert.ok(await b.waitText(w.myScenarios));
    const before = await b.ev("document.querySelectorAll('.scenario').length");
    assert.ok(before >= 1);
    assert.ok(await b.clickContaining(w.deleteScenario));
    assert.ok(await b.waitFor(`document.querySelectorAll('.scenario').length === ${before - 1}`), 'the scenario is gone');
  });

  test('on a phone, in Arabic, the workshop stays readable', async () => {
    await b.setViewport(375);
    await b.ev("localStorage.setItem('lang', 'ar')");
    await b.goto(`${site.url}/outils/atelier`);
    const ar = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/ar.json'), 'utf8'));
    assert.ok(await b.waitText(ar.workshop.intro));
    assert.equal(await b.ev("document.documentElement.getAttribute('dir')"), 'rtl');
    const overflow = await b.ev('document.documentElement.scrollWidth - document.documentElement.clientWidth');
    assert.ok(overflow <= 1, `horizontal overflow of ${overflow}px`);
    await b.setViewport(1280);
    await b.ev("localStorage.setItem('lang', 'fr')");
  });
});

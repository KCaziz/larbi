import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// The 8 scenarios per public of the client's QA tab (`16_QA_Tests`), in a
// real browser — the browser-journey half of `P6-21`'s remaining criterion.
// They are deliberately NOT the ten J01-J10 chains again (`fin-j01-j10-
// journey.test.js` already covers one full adult account through each
// functional chain): this file walks the OTHER dimension, the account's
// PUBLIC, and proves that each of the 8 gets its own working home screen
// rather than one generic page pretending to be eight.
//
// For each public, the test:
//   1. creates an account carrying that public (and, for the one public that
//      can be a minor — the lycéen — an age bracket that actually is one);
//   2. opens "Aujourd'hui" and asserts the page renders ITS OWN dashboard
//      subtitle (`finDashboard.js`'s `title` key, read from the SAME source
//      the server uses, never retyped) — proving the per-public branch for
//      that specific public does not crash and is not the default one.
//
// What this does NOT assert: that a screen outside a public's journey map is
// UNREACHABLE. `finNavigation.js` says so itself — hiding a route from the
// menu is a convenience, never the protection; the actual guard is
// `requireAdult` on the API, already covered by the security suites. A
// browser test asserting a 404 on a route that simply isn't gated would be
// asserting something the code never promised.
const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));

// One sensible age bracket per public — adult for all but the lycéen, who is
// the only public the client's own map allows to be a minor (`19_Mineurs`).
const PUBLICS = [
  { code: 'LYC', finAgeRange: '13-18', dashboardKey: 'myWeek' },
  { code: 'ETU', finAgeRange: '19-24', dashboardKey: 'student' },
  { code: 'JAC', finAgeRange: '19-24', dashboardKey: 'firstIncome' },
  { code: 'SAL', finAgeRange: '25-34', dashboardKey: 'health' },
  { code: 'COL', finAgeRange: '19-24', dashboardKey: 'flatshare' },
  { code: 'COU', finAgeRange: '25-34', dashboardKey: 'couple' },
  { code: 'FAM', finAgeRange: '35-49', dashboardKey: 'household' },
  { code: 'EPG', finAgeRange: '25-34', dashboardKey: 'savings' },
];

describe(
  'FINCLUDIA — les 8 scénarios par public (onglet QA du client)',
  { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' },
  () => {
    let t;
    let site;
    let b;

    before(async () => {
      t = await boot();
      site = await startSite(t.baseUrl);
      b = await Browser.launch();
    });

    after(async () => {
      await b?.close();
      await site?.stop();
      await t?.close();
    });

    const shows = (what) => b.ev(b.hasText(what));

    const setSession = async (user) => {
      await b.clearCookies();
      await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
    };

    const account = async ({ finPublic, finAgeRange }) => {
      const created = await t.user();
      await t.prisma.user.update({ where: { id: created.id }, data: { finPublic, finCurrency: 'DZD', finAgeRange } });
      const user = await t.prisma.user.findUnique({ where: { id: created.id } });
      await setSession(user);
      return user;
    };

    const open = async (route, bodyText, what) => {
      await b.goto(`${site.url}${route}`);
      assert.ok(await b.waitText(bodyText), `${what} s'affiche`);
    };

    for (const { code, finAgeRange, dashboardKey } of PUBLICS) {
      test(`${code} — son propre tableau de bord « Aujourd'hui »`, async () => {
        await t.reset();
        await account({ finPublic: code, finAgeRange });

        // The generic proof first: the page itself renders (the figures
        // section is there, not an error or an infinite skeleton).
        await open('/aujourdhui', fr.today.figuresTitle, "l'accueil Aujourd'hui");

        // Then the proof that matters for THIS test: the subtitle is the
        // one this public's own dashboard carries, read from the client's
        // own wording — never the default ("Vos chiffres du mois, et la
        // suite.") that every public would show if the branch silently
        // fell through to it.
        const own = fr.today.dashboards[dashboardKey];
        const fallback = fr.today.dashboards.general;
        assert.ok(own && own !== fallback, `${code} a bien son propre texte de tableau de bord`);
        assert.ok(await shows(own), `${code} affiche « ${own} »`);
      });
    }
  },
);

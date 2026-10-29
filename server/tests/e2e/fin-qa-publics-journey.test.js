import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';
import { educationProfileByCode } from '../../src/constants/finEducation.js';

// The 8 scenarios per public of the client's QA tab (`16_QA_Tests`), in a
// real browser.
//
// The rule they prove changed with the consolidated cahier (ARC-03,
// QA-V7-01, P8-01): budget management is THE SAME for every profile — « toutes
// les fonctions budget restent visibles ; l'utilisateur choisit ce qu'il
// renseigne » — and the education layer is the only one that varies (P8-17).
// The former version of this file asserted one dashboard per public, a design
// the client has since replaced; it failed on screens that no longer exist.
//
// For each public, the test:
//   1. creates an account with that public (the lycéen with a minor's age
//      bracket, the only public the client allows to be a minor);
//   2. opens « Aujourd'hui » inside the application: the same screen for all;
//   3. opens Formation: the parcours of THIS profile, read from the server's
//      own constant — or, for the three collective publics that left for
//      « Gestion commune », the invitation to choose one of the six.
const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));

const PUBLICS = [
  { code: 'LYC', finAgeRange: '13-18' },
  { code: 'ETU', finAgeRange: '19-24' },
  { code: 'JAC', finAgeRange: '19-24' },
  { code: 'SAL', finAgeRange: '25-34' },
  { code: 'COL', finAgeRange: '19-24' },
  { code: 'COU', finAgeRange: '25-34' },
  { code: 'FAM', finAgeRange: '35-49' },
  { code: 'EPG', finAgeRange: '25-34' },
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
      await b.goto(`${site.url}/a-propos`);
      await b.ev("localStorage.setItem('lang', 'fr')");
    });

    after(async () => {
      await b?.close();
      await site?.stop();
      await t?.close();
    });

    const account = async ({ finPublic, finAgeRange }) => {
      const user = await t.adult({ finPublic, finAgeRange, finCurrency: 'DZD', finOnboardedAt: new Date() });
      await b.clearCookies();
      await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
      return user;
    };

    for (const { code, finAgeRange } of PUBLICS) {
      test(`${code} — le même « Aujourd'hui » que tous, et sa propre couche de formation`, async () => {
        await t.reset();
        await account({ finPublic: code, finAgeRange });

        await b.goto(`${site.url}/app/aujourdhui`);
        assert.ok(await b.waitText(fr.today.questionsTitle), `« Aujourd'hui » s'affiche pour ${code}`);

        await b.goto(`${site.url}/app/formation`);
        const profile = educationProfileByCode(code);
        if (profile) {
          const parcours = fr.education.parcoursPreparing.replace('{{name}}', profile.parcours.name);
          assert.ok(await b.waitText(parcours), `${code} voit son parcours ${profile.parcours.name}`);
        } else {
          // COL, COU, FAM: kept for the people who have them, never offered again.
          assert.ok(await b.waitText(fr.education.chooseLink), `${code} est invité à choisir un des six profils`);
        }
      });
    }
  },
);

import '../helpers/setup-env.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P8-17: the educational layer, the only one that changes with the profile —
// its parcours on the Formation, Progression and Certificats screens, links
// that stay inside the application, and a former collective profile asked to
// choose.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));

describe('the educational layer of a profile', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  const signIn = async (user) => {
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
  };

  before(async () => {
    t = await boot();
    await t.reset();
    await t.formation({ title: 'Parcours Avenir', slug: 'parcours-avenir', courses: [{ title: 'Mon premier budget' }, { title: 'Ma carte' }] });
    const forLyc = await t.formation({ title: 'Besoins et envies' });
    await t.prisma.formation.update({ where: { id: forLyc.id }, data: { educationProfiles: ['LYC'] } });
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1280 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('Formation shows the parcours of the profile, and its links stay inside the application', async () => {
    await signIn(await t.adult({ finPublic: 'LYC', finOnboardedAt: new Date() }));
    await b.goto(`${site.url}/app/formation`);
    assert.ok(await b.waitText(fr.education.yourParcours.replace('{{name}}', 'Avenir')), 'the parcours of the lycéen');
    assert.ok(await b.waitText('Besoins et envies'), 'recommended to the profile');
    const outside = await b.ev("[...document.querySelectorAll('#app-main a')].map((a) => a.getAttribute('href')).filter((href) => href && href.startsWith('/catalogue'))");
    assert.deepEqual(outside, [], 'no link leaves the application for the showcase catalogue');
    await b.shot('p8-17-formation');
  });

  test('Progression and Certificats show the parcours, its missions and its certificate', async () => {
    await b.goto(`${site.url}/app/progression`);
    assert.ok(await b.waitText(fr.education.missionsPreparing));
    await b.goto(`${site.url}/app/certificats`);
    assert.ok(await b.waitText('Certificat pédagogique de parcours Avenir'));
  });

  test('a former collective profile is asked to choose one of the six', async () => {
    await signIn(await t.adult({ finPublic: 'COU', finOnboardedAt: new Date() }));
    await b.goto(`${site.url}/app/formation`);
    assert.ok(await b.waitText(fr.education.chooseLink));
    await b.goto(`${site.url}/app/parametres/fincludia`);
    assert.ok(await b.waitFor("!!document.querySelector('#fin-public')", 'the profile form'));
    const options = await b.ev("[...document.querySelectorAll('#fin-public option')].map((o) => o.value).filter(Boolean)");
    assert.deepEqual(options, ['LYC', 'ETU', 'JAC', 'SAL', 'EPG', 'AUT']);
  });
});

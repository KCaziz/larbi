import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';

// P8-17: a learner plays a pedagogical mission from the progress page, sees the
// explained result and the badge; an administrator reaches the entry screen.

describe('the missions, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let learner;
  let admin;

  const mission = {
    slug: 'mon-premier-salaire',
    title: 'Mon premier salaire',
    summary: 'Quelques choix sur une somme fictive.',
    profiles: ['LYC'],
    startingAmount: 5000000,
    currency: 'DZD',
    steps: [
      {
        key: 'loyer',
        prompt: 'Le loyer arrive. Que fais-tu ?',
        choices: [
          { key: 'payer', label: 'Je le paie tout de suite', cash: -2000000, savings: 0, resilience: 30, explanation: 'Une charge fixe payée à temps évite les pénalités.' },
          { key: 'attendre', label: 'J’attends la fin du mois', cash: 0, savings: 0, resilience: -10, explanation: 'Un retard coûte plus qu’il ne rapporte.' },
        ],
      },
    ],
    badges: [{ key: 'en-route', label: 'En route', minResilience: 20 }],
  };

  before(async () => {
    t = await boot();
    await t.reset();
    admin = await t.admin();
    learner = await t.adult({ name: 'Lyes Lycéen', finPublic: 'LYC', finCurrency: 'DZD', finOnboardedAt: new Date() });
    const created = await t.request('POST', '/admin/fin-missions', { user: admin, json: mission });
    await t.request('POST', `/admin/fin-missions/${created.body.mission.id}/publish`, { user: admin });
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1100 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(learner.id), url: site.url, httpOnly: true });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('the progress page points at the missions; the list shows the mission; its steps show no effect', async () => {
    await b.goto(`${site.url}/app/progression`);
    assert.ok(await b.waitFor("!!document.querySelector('a[href=\"/app/apprendre/missions\"]')", 'the link to the missions'));
    await b.goto(`${site.url}/app/apprendre/missions`);
    assert.ok(await b.waitText('Mon premier salaire'));
    await b.ev("document.querySelector('a[href=\"/app/apprendre/missions/mon-premier-salaire\"]').click()");
    assert.ok(await b.waitFor("location.pathname === '/app/apprendre/missions/mon-premier-salaire'", 'the mission'));
    assert.ok(await b.waitFor("document.querySelectorAll('input[type=radio]').length === 2", 'the choices'));
    assert.ok(!(await b.ev("document.body.innerText.includes('pénalités')")), 'the explanation is not shown before the choice');
    await b.shot('mission-play');
  });

  test('playing gives the explained result, the rule and the badge; the replay starts again', async () => {
    await b.ev("document.getElementById('loyer-payer').click()");
    await b.ev("document.querySelector('form.mission-form button[type=submit]').click()");
    assert.ok(await b.waitFor("!!document.querySelector('.mission-result')", 'the result'));
    const text = await b.ev("document.querySelector('.mission-result').innerText");
    assert.match(text, /Badge obtenu : En route/);
    assert.match(text, /pénalités/);
    assert.match(text, /Règle/);
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: learner.id } }), 0, 'nothing real was written');
    await b.shot('mission-result');
    await b.ev("[...document.querySelectorAll('.mission-result button')].find((x) => x.textContent.includes('Rejouer')).click()");
    assert.ok(await b.waitFor("!!document.querySelector('form.mission-form')", 'the form again'));
  });

  test('the administrator reaches the entry screen and sees the mission', async () => {
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(admin.id), url: site.url, httpOnly: true });
    await b.goto(`${site.url}/admin/missions-fincludia`);
    assert.ok(await b.waitText('Missions pédagogiques'));
    assert.ok(await b.waitText('Mon premier salaire'));
    // R8-11: the mission is edited in a form, never as raw JSON.
    assert.ok(await b.click('Modifier'));
    assert.ok(await b.waitFor("!!document.querySelector('form.missions-admin-form')", 'the form'));
    assert.equal(await b.ev("document.getElementById('mission-title').value"), 'Mon premier salaire');
    assert.equal(await b.ev("document.querySelectorAll('.missions-admin-choice').length"), 2, 'the two choices of the step');
    assert.doesNotMatch(await b.text(), /\{\s*"slug"/, 'no JSON on screen');
  });
});

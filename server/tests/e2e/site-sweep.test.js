import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { PNG, fileForm } from '../helpers/fixtures.js';
import { SERVER_DIR } from '../helpers/env.js';
import { boot } from '../helpers/server.js';

// Every page of the site, in every language, at desktop and phone width, as an
// anonymous visitor, a learner and an administrator. Each visit must show a real
// page: no JavaScript error, no untranslated key, no horizontal overflow, no
// blank or broken screen, no unexpected HTTP error.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const NAMESPACES = new Set(Object.keys(fr));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('site sweep', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let learner;
  let admin;
  let data;
  const problems = [];
  let visits = 0;

  before(async () => {
    t = await boot();
    await t.reset();
    admin = await t.admin();
    learner = await t.user({ name: 'Léa Apprenante' });
    site = await startSite(t.baseUrl);
    b = await Browser.launch();

    const f = await t.formation({ title: 'Formation balayage', courses: [{ title: 'Cours A' }, { title: 'Cours B', isRequired: false }] });
    const draftFormation = await t.formation({ title: 'Brouillon', status: 'draft' });
    const enrollment = await t.prisma.enrollment.create({ data: { userId: learner.id, formationId: f.id, status: 'completed', completedAt: new Date() } });
    await t.prisma.courseProgress.create({ data: { enrollmentId: enrollment.id, courseId: f.courses[0].id, formationId: f.id, status: 'completed', completedAt: new Date() } });
    const cert = await t.prisma.certification.create({ data: { certificateNumber: 'LARBI-SWEE-PPPP-TEST', enrollmentId: enrollment.id, holderName: 'Léa Apprenante', formationTitle: f.title, certificationTitle: 'Certificat balayage' } });
    const cat = await t.prisma.articleCategory.create({ data: { slug: 'fiscalite', name: 'Fiscalité' } });
    const article = await t.article({ title: 'Article balayage', tags: ['TVA'], category: cat, author: admin });
    await t.request('POST', `/admin/articles/${article.id}/cover`, { user: admin, form: fileForm(PNG) });
    const draftArticle = await t.article({ title: 'Brouillon article', status: 'draft' });
    data = { f, draftFormation, cert, article, draftArticle };
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  const setSession = (user) =>
    user
      ? b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true })
      : b.clearCookies();
  const setLanguage = async (lang) => {
    await b.goto(`${site.url}/a-propos`);
    await b.ev(`localStorage.setItem('lang', '${lang}')`);
  };

  // What is on screen right now. Only these render-state checks may be retried once
  // (a loaded machine can be slower than the fixed wait after navigation); JavaScript
  // and HTTP errors are recorded as they happen and are never retried.
  async function renderProblems() {
    const found = [];
    const text = await b.text();
    const raw = text.split('\n').map((l) => l.trim()).filter((l) => /^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9_]+)+$/.test(l) && NAMESPACES.has(l.split('.')[0]));
    if (raw.length) found.push(`untranslated key: ${raw.slice(0, 3).join(', ')}`);
    if ((await b.ev('document.documentElement.scrollWidth - window.innerWidth')) > 0) found.push('horizontal overflow');
    if (text.trim().length < 40) found.push(`almost empty page (${text.trim().length} characters)`);
    if (/unexpected application error|something went wrong/i.test(text)) found.push('error screen');
    return found;
  }

  async function audit(label, { expectHttp = [] } = {}) {
    visits += 1;
    const found = [];
    let render = await renderProblems();
    if (render.length) {
      await sleep(1500);
      render = await renderProblems();
    }
    found.push(...render);
    if (b.jsErrors.length) found.push(`JavaScript error: ${b.jsErrors.slice(0, 2).join(' || ')}`);
    const bad = b.badResponses.filter((r) => !/^401 \/api\/auth\/me$/.test(r) && !expectHttp.some((re) => re.test(r)));
    if (bad.length) found.push(`unexpected HTTP: ${bad.slice(0, 3).join(', ')}`);
    if (found.length) problems.push({ label, found });
    b.jsErrors.length = 0;
    b.badResponses.length = 0;
  }

  const runs = [['fr', 1280], ['en', 1280], ['ar', 1280], ['tzm', 1280], ['fr', 375], ['ar', 375]];

  for (const [lang, width] of runs) {
    test(`${lang} at ${width}px: every page, as visitor, learner and administrator`, async () => {
      await b.setViewport(width);
      await setLanguage(lang);

      const visitor = ['/', '/formations', '/outils', '/blog', `/blog/${data.article.slug}`, '/blog?category=fiscalite', '/blog?q=balayage', '/a-propos', '/services', '/faq', '/fonctionnalites', '/contact', '/mentions-legales', '/confidentialite', '/connexion', '/inscription', '/mot-de-passe-oublie', '/verification', `/verification/${data.cert.certificateNumber}`];
      await setSession(null);
      for (const route of visitor) {
        await b.goto(site.url + route);
        await sleep(300);
        await audit(`${lang}/${width} visitor ${route}`);
      }
      // pages that are "not found" ON PURPOSE (their 404 is part of the behaviour)
      for (const route of ['/page-inexistante', `/blog/${data.draftArticle.slug}`, '/blog/inexistant', '/verification/LARBI-AAAA-BBBB-CCCC']) {
        await b.goto(site.url + route);
        await sleep(300);
        await audit(`${lang}/${width} visitor (not found) ${route}`, { expectHttp: [/^404 \/api\//] });
      }

      await setSession(learner);
      const account = ['/compte/profil', '/compte/tableau-de-bord', '/compte/formations', '/compte/certificats', '/compte/type', '/compte/premium', '/catalogue', `/catalogue/${data.f.slug}`, `/catalogue/${data.f.slug}/cours/${data.f.courses[0].id}`, `/catalogue/${data.f.slug}/certificat`];
      for (const route of account) {
        await b.goto(site.url + route);
        await sleep(400);
        await audit(`${lang}/${width} learner ${route}`);
      }
      await b.goto(`${site.url}/catalogue/${data.draftFormation.slug}`);
      await sleep(300);
      await audit(`${lang}/${width} learner (draft formation: not found on purpose)`, { expectHttp: [/^404 \/api\//] });
      await b.goto(`${site.url}/admin/formations`);
      await sleep(300);
      await audit(`${lang}/${width} learner -> /admin (must be refused)`, { expectHttp: [/^403 \/api\/admin\//] });
      assert.doesNotMatch(await b.text(), /Formation balayage/, 'a learner must not see the administration');

      await setSession(admin);
      for (const route of ['/admin/formations', `/admin/formations/${data.f.id}`, '/admin/articles', `/admin/articles/${data.article.id}`]) {
        await b.goto(site.url + route);
        await sleep(500);
        await audit(`${lang}/${width} admin ${route}`);
        const steps = await b.ev("document.querySelectorAll('[role=tab]').length");
        for (let i = 0; i < steps; i += 1) {
          await b.ev(`document.querySelectorAll('[role=tab]')[${i}].click()`);
          await sleep(350);
          await audit(`${lang}/${width} admin ${route} step ${i + 1}/${steps}`);
        }
      }
    });
  }

  test('the whole sweep found no problem', () => {
    assert.ok(visits >= 280, `only ${visits} visits`); // 6 runs x 48 pages
    assert.deepEqual(problems, [], problems.map((p) => `${p.label}: ${p.found.join('; ')}`).join('\n'));
  });
});

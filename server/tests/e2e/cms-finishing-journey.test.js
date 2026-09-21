import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { PNG, fileForm } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P3-14 in a real browser: duplicating a formation from the list, a chapter and a lesson from the
// plan, and the whole-formation preview ("what the student sees").

const bcrypt = createRequire(import.meta.url)('bcryptjs');
const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const PASSWORD = 'Passw0rd!test';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('duplication and preview, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let admin;
  let source;
  let l1;

  const api = (method, url, opts) => t.request(method, url, { user: admin, ...opts });
  const waitDb = async (check, ms = 8000) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (await check()) return true;
      await sleep(150);
    }
    return false;
  };

  before(async () => {
    t = await boot();
    await t.reset();
    admin = await t.admin({ name: 'Camille Rédactrice', email: 'redactrice@example.com', passwordHash: await bcrypt.hash(PASSWORD, 10) });
    source = (await api('POST', '/admin/formations', { json: { title: 'Ma formation' } })).body.formation;
    const a = (await api('POST', `/admin/formations/${source.id}/sections`, { json: { title: 'Bases' } })).body.section;
    const c = (await api('POST', `/admin/formations/${source.id}/sections`, { json: { title: 'Suite' } })).body.section;
    l1 = (await api('POST', `/admin/formations/${source.id}/courses`, { json: { title: 'Leçon un', sectionId: a.id } })).body.course;
    await api('POST', `/admin/formations/${source.id}/courses`, { json: { title: 'Leçon deux', sectionId: c.id } });
    await api('PATCH', `/admin/formations/${source.id}`, { json: { subtitle: 'Un sous-titre', description: 'Description', level: 'beginner', objectives: ['Apprendre'], prerequisites: ['Rien'] } });
    await api('POST', `/admin/formations/${source.id}/cover`, { form: fileForm(PNG) });
    await api('POST', `/admin/courses/${l1.id}/blocks`, { json: { type: 'code', data: { language: 'python', code: 'print("salut")' } } });
    await api('POST', `/admin/courses/${l1.id}/blocks`, { json: { type: 'callout', data: { variant: 'tip', title: 'Astuce', html: '<p>À retenir</p>' } } });
    const quiz = (await api('POST', `/admin/formations/${source.id}/quizzes`, { json: { title: 'Quiz final', scope: 'formation' } })).body.quiz;
    const q = (await api('POST', `/admin/quizzes/${quiz.id}/questions`, { json: { type: 'true_false' } })).body.question;
    await api('PATCH', `/admin/questions/${q.id}`, { json: { prompt: 'Vrai ?' } });
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1400, height: 1200 });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('from the list: "Dupliquer" opens the copy, a draft with the same content', async () => {
    await b.goto(`${site.url}/connexion`);
    await b.waitFor("!!document.querySelector('#email')");
    await b.type('#email', 'redactrice@example.com');
    await b.type('#password', PASSWORD);
    await b.click(fr.auth.login.submit);
    assert.ok(await b.waitFor("location.pathname !== '/connexion'"));
    await b.goto(`${site.url}/admin/formations`);
    assert.ok(await b.waitText('Ma formation'));
    await b.clickWhere(`e => e.getAttribute('aria-label') === ${JSON.stringify(`${fr.admin.list.duplicate} : Ma formation`)}`);
    assert.ok(await b.waitFor('/^\\/admin\\/formations\\/[0-9a-f-]{36}$/.test(location.pathname) && !location.pathname.endsWith("' + source.id + '")'));
    const copy = await t.prisma.formation.findFirst({ where: { title: 'Ma formation (copie)' } });
    assert.ok(copy);
    assert.equal(copy.status, 'draft');
    assert.equal(await t.prisma.course.count({ where: { formationId: copy.id } }), 2);
    assert.ok(await b.waitFor("!!document.querySelector('#f-title') && document.querySelector('#f-title').value === 'Ma formation (copie)'"));
  });

  test('from the plan: duplicate a lesson, then a chapter', async () => {
    await b.goto(`${site.url}/admin/formations/${source.id}`);
    await b.waitFor("!!document.querySelector('[role=tab]')");
    await b.clickTab(fr.admin.steps.courses);
    await b.waitFor("document.querySelectorAll('.cms-course').length === 2");
    await b.clickWhere(`e => e.getAttribute('aria-label') === ${JSON.stringify(`${fr.admin.courses.duplicate} : Leçon un`)}`);
    assert.ok(await b.waitFor("document.querySelectorAll('.cms-course').length === 3"));
    assert.ok(await waitDb(async () => (await t.prisma.course.count({ where: { formationId: source.id } })) === 3));
    const copy = await t.prisma.course.findFirst({ where: { formationId: source.id, title: 'Leçon un (copie)' } });
    assert.equal(await t.prisma.lessonBlock.count({ where: { courseId: copy.id } }), 2, 'the blocks are copied');

    await b.clickWhere(`e => e.getAttribute('aria-label') === ${JSON.stringify(`${fr.admin.outline.duplicateChapter} : Bases`)}`);
    assert.ok(await b.waitFor("document.querySelectorAll('.cms-chapter').length === 3"));
    assert.equal(await t.prisma.section.count({ where: { formationId: source.id, title: 'Bases (copie)' } }), 1);
    assert.equal(await t.prisma.course.count({ where: { formationId: source.id } }), 5, 'the two lessons of the chapter were copied');
  });

  test('the preview shows the formation as the student sees it: presentation, chapters, lessons block by block, quiz', async () => {
    await b.clickTab(fr.admin.steps.preview);
    assert.ok(await b.waitText('Un sous-titre'));
    assert.ok(await b.waitText(fr.learn.detail.objectives));
    assert.ok(await b.waitText('Apprendre'));
    assert.ok(await b.waitText(fr.learn.level.beginner));
    const headings = await b.ev("[...document.querySelectorAll('.learn-page-preview .learn-chapter-title')].map(h => h.childNodes[0].textContent)");
    assert.deepEqual(headings, ['Bases', 'Bases (copie)', 'Suite']);
    // unfold the first lesson: the blocks are rendered like in the reader
    await b.ev("document.querySelector('.cms-preview-lesson > summary').click()");
    assert.ok(await b.waitFor("!!document.querySelector('.cms-preview-lesson[open] .block-code code')"));
    assert.equal(await b.ev("document.querySelector('.cms-preview-lesson[open] .block-code code').textContent"), 'print("salut")');
    assert.ok(await b.ev("!!document.querySelector('.cms-preview-lesson[open] .block-callout')"));
    assert.ok(await b.ev("[...document.querySelectorAll('.cms-preview-quiz')].some(p => p.innerText.includes('Quiz final'))"), 'the quiz is announced');
  });

  test('no JavaScript error during the whole journey', () => {
    assert.deepEqual(b.jsErrors, []);
  });
});

import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P3-11 in a real browser: the administrator organises a formation into chapters and lessons
// (drag and drop with the mouse and with the keyboard, arrows), fills the pedagogical
// presentation, moves the formation through its statuses, and a learner sees the result.

const bcrypt = createRequire(import.meta.url)('bcryptjs');
const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const PASSWORD = 'Passw0rd!test';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('formation structure, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let admin;
  let formation; // { id, a, b, l1, l2, l3 }

  const api = (method, url, opts) => t.request(method, url, { user: admin, ...opts });
  const order = async () => {
    const rows = await t.prisma.course.findMany({ where: { formationId: formation.id }, orderBy: { position: 'asc' } });
    const sections = await t.prisma.section.findMany({ where: { formationId: formation.id } });
    return rows.map((c) => `${sections.find((s) => s.id === c.sectionId)?.title}:${c.title}`);
  };
  const waitOrder = async (expected) => {
    for (let i = 0; i < 40; i += 1) {
      if (JSON.stringify(await order()) === JSON.stringify(expected)) return true;
      await sleep(150);
    }
    return false;
  };
  const key = async (name, code, text) => {
    await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: name, code, text });
    await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: name, code });
    await sleep(120);
  };
  // The drag handle of a lesson (by its title) / of a chapter (by its title)
  const gripOfLesson = (title) => `[...document.querySelectorAll('.cms-course')].find(c => c.querySelector('.cms-course-title').textContent === ${JSON.stringify(title)}).querySelector('.cms-grip')`;
  const gripOfChapter = (title) => `[...document.querySelectorAll('.cms-chapter')].find(c => c.querySelector('.cms-chapter-title').value === ${JSON.stringify(title)}).querySelector('.cms-chapter-head .cms-grip')`;
  const center = async (expr) => b.ev(`(() => { const r = (${expr}).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  const mouse = (type, x, y) => b.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1 });
  const drag = async (fromExpr, toExpr, dy = 0) => {
    const from = await center(fromExpr);
    const to = await center(toExpr);
    await mouse('mouseMoved', from.x, from.y);
    await mouse('mousePressed', from.x, from.y);
    for (let i = 1; i <= 12; i += 1) {
      await mouse('mouseMoved', from.x + ((to.x - from.x) * i) / 12, from.y + ((to.y + dy - from.y) * i) / 12);
      await sleep(25);
    }
    await sleep(150);
    await mouse('mouseReleased', to.x, to.y + dy);
    await sleep(200);
  };

  before(async () => {
    t = await boot();
    await t.reset();
    admin = await t.admin({ name: 'Camille Rédactrice', email: 'redactrice@example.com', passwordHash: await bcrypt.hash(PASSWORD, 10) });
    const f = (await api('POST', '/admin/formations', { json: { title: 'Comptabilité pas à pas' } })).body.formation;
    const a = (await api('POST', `/admin/formations/${f.id}/sections`, { json: { title: 'Bases' } })).body.section;
    const bb = (await api('POST', `/admin/formations/${f.id}/sections`, { json: { title: 'Pratique' } })).body.section;
    const lesson = async (title, sectionId) => (await api('POST', `/admin/formations/${f.id}/courses`, { json: { title, sectionId } })).body.course;
    formation = { id: f.id, a, b: bb, l1: await lesson('Leçon 1', a.id), l2: await lesson('Leçon 2', a.id), l3: await lesson('Leçon 3', bb.id) };
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1400, height: 1100 });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  describe('the plan', () => {
    test('the administrator signs in and sees the chapters with their lessons', async () => {
      await b.goto(`${site.url}/connexion`);
      await b.waitFor("!!document.querySelector('#email')");
      await b.type('#email', 'redactrice@example.com');
      await b.type('#password', PASSWORD);
      await b.click(fr.auth.login.submit);
      assert.ok(await b.waitFor("location.pathname !== '/connexion'"));
      await b.goto(`${site.url}/admin/formations/${formation.id}`);
      await b.waitFor("!!document.querySelector('[role=tab]')");
      await b.clickTab(fr.admin.steps.courses);
      assert.ok(await b.waitFor("document.querySelectorAll('.cms-chapter').length === 2"));
      assert.deepEqual(await order(), ['Bases:Leçon 1', 'Bases:Leçon 2', 'Pratique:Leçon 3']);
    });

    test('keyboard: Space lifts a lesson, the arrow moves it, Space drops it; the order is saved', async () => {
      await b.ev(`${gripOfLesson('Leçon 1')}.focus()`);
      await key(' ', 'Space', ' ');
      await key('ArrowDown', 'ArrowDown');
      await key(' ', 'Space', ' ');
      assert.ok(await waitOrder(['Bases:Leçon 2', 'Bases:Leçon 1', 'Pratique:Leçon 3']), JSON.stringify(await order()));
    });

    test('mouse: dragging a lesson into ANOTHER chapter moves it there, in ONE saved plan', async () => {
      await drag(gripOfLesson('Leçon 3'), gripOfLesson('Leçon 2'), -8);
      assert.ok(await waitOrder(['Bases:Leçon 3', 'Bases:Leçon 2', 'Bases:Leçon 1']), JSON.stringify(await order()));
      assert.ok(await b.waitFor("document.querySelectorAll('.cms-chapter')[1].querySelectorAll('.cms-course').length === 0"), 'the chapter is now empty');
      assert.ok(await b.waitText(fr.admin.outline.chapterEmpty));
    });

    test('mouse: dragging a lesson onto an EMPTY chapter drops it there', async () => {
      await drag(gripOfLesson('Leçon 1'), gripOfChapter('Pratique'));
      assert.ok(await waitOrder(['Bases:Leçon 3', 'Bases:Leçon 2', 'Pratique:Leçon 1']), JSON.stringify(await order()));
    });

    test('mouse: dragging a chapter above the other reorders the chapters', async () => {
      await drag(gripOfChapter('Pratique'), gripOfChapter('Bases'), -10);
      assert.ok(await waitOrder(['Pratique:Leçon 1', 'Bases:Leçon 3', 'Bases:Leçon 2']), JSON.stringify(await order()));
      const sections = await t.prisma.section.findMany({ where: { formationId: formation.id }, orderBy: { position: 'asc' } });
      assert.deepEqual(sections.map((s) => s.title), ['Pratique', 'Bases']);
    });

    test('the arrow buttons cross the edge of a chapter (no drag needed)', async () => {
      await b.ev(`(() => { const el = [...document.querySelectorAll('.cms-course')].find(c => c.querySelector('.cms-course-title').textContent === 'Leçon 3'); el.querySelector('[aria-label=${JSON.stringify(fr.admin.courses.moveUp)}]').click(); })()`);
      assert.ok(await waitOrder(['Pratique:Leçon 1', 'Pratique:Leçon 3', 'Bases:Leçon 2']), JSON.stringify(await order()));
    });

    test('the plan is the same after a reload (nothing lives only in the browser)', async () => {
      await b.goto(`${site.url}/admin/formations/${formation.id}`);
      await b.waitFor("!!document.querySelector('[role=tab]')");
      await b.clickTab(fr.admin.steps.courses);
      const shown = await b.ev("[...document.querySelectorAll('.cms-chapter')].map(c => c.querySelector('.cms-chapter-title').value + ':' + [...c.querySelectorAll('.cms-course-title')].map(x => x.textContent).join('|'))");
      assert.deepEqual(shown, ['Pratique:Leçon 1|Leçon 3', 'Bases:Leçon 2']);
    });

    test('renaming a chapter in place, adding a chapter and a lesson inside it', async () => {
      await b.ev(`(() => { const i = ${gripOfChapter('Bases').replace('.cms-chapter-head .cms-grip', '.cms-chapter-title')}; i.focus(); i.select(); })()`);
      await b.send('Input.insertText', { text: 'Les bases' });
      await key('Enter', 'Enter');
      for (let i = 0; i < 30 && !(await t.prisma.section.findFirst({ where: { formationId: formation.id, title: 'Les bases' } })); i += 1) await sleep(150);
      assert.ok(await t.prisma.section.findFirst({ where: { formationId: formation.id, title: 'Les bases' } }));

      await b.type('#new-chapter-title', 'Conclusion');
      await b.click(fr.admin.outline.addChapter);
      assert.ok(await b.waitFor("document.querySelectorAll('.cms-chapter').length === 3"));
      const chapter = await t.prisma.section.findFirst({ where: { formationId: formation.id, title: 'Conclusion' } });
      await b.type(`#new-lesson-${chapter.id}`, 'Bilan final');
      await b.clickWhere(`e => e.textContent.trim() === ${JSON.stringify(fr.admin.outline.addLesson)} && e.closest('form') && e.closest('form').querySelector('#new-lesson-${chapter.id}')`);
      assert.ok(await waitOrder(['Pratique:Leçon 1', 'Pratique:Leçon 3', 'Les bases:Leçon 2', 'Conclusion:Bilan final']), JSON.stringify(await order()));
    });

    test('a chapter that still has lessons cannot be deleted: a clear message, nothing is lost', async () => {
      await b.ev(`document.querySelector('[aria-label=${JSON.stringify(`${fr.admin.outline.deleteChapter} : Conclusion`)}]').click()`);
      assert.ok(await b.waitFor("!!document.querySelector('dialog[open]')"));
      await b.clickWhere(`e => e.closest('dialog[open]') && e.textContent.trim() === ${JSON.stringify(fr.admin.courses.deleteConfirm)}`);
      assert.ok(await b.waitText(fr.admin.outline.chapterNotEmpty));
      assert.equal(await t.prisma.section.count({ where: { formationId: formation.id, title: 'Conclusion' } }), 1);
    });
  });

  describe('pedagogical presentation and statuses', () => {
    test('subtitle, level, objectives and prerequisites are saved with the save bar', async () => {
      await b.clickTab(fr.admin.steps.info);
      await b.waitFor("!!document.querySelector('#f-subtitle')");
      await b.type('#f-subtitle', 'Tenir ses comptes sereinement');
      await b.ev("(() => { const s = document.querySelector('#f-level'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, 'intermediate'); s.dispatchEvent(new Event('change', { bubbles: true })); })()");
      await b.type('#f-objectives', 'Enregistrer une opération');
      await key('Enter', 'Enter');
      await b.type('#f-objectives', 'Lire un bilan');
      await key('Enter', 'Enter');
      await b.type('#f-prerequisites', 'Aucun');
      await key('Enter', 'Enter');
      assert.ok(await b.waitText('Lire un bilan'));
      await b.click(fr.admin.save.button);
      assert.ok(await b.waitText(fr.admin.save.saved));
      const row = await t.prisma.formation.findUnique({ where: { id: formation.id } });
      assert.equal(row.subtitle, 'Tenir ses comptes sereinement');
      assert.equal(row.level, 'intermediate');
      assert.deepEqual(row.objectives, ['Enregistrer une opération', 'Lire un bilan']);
      assert.deepEqual(row.prerequisites, ['Aucun']);
    });

    test('an objective can be removed again', async () => {
      await b.ev(`document.querySelector('[aria-label=${JSON.stringify(`${fr.admin.lines.remove} : Lire un bilan`)}]').click()`);
      await b.click(fr.admin.save.button);
      assert.ok(await b.waitText(fr.admin.save.saved));
      assert.deepEqual((await t.prisma.formation.findUnique({ where: { id: formation.id } })).objectives, ['Enregistrer une opération']);
    });

    test('draft -> in review from the publication tab; publishing stays impossible while incomplete', async () => {
      await b.clickTab(fr.admin.steps.publish);
      assert.ok(await b.waitText(fr.admin.workflow.action.in_review));
      assert.equal(await b.ev(`[...document.querySelectorAll('button')].find(x => x.textContent.trim() === ${JSON.stringify(fr.admin.workflow.action.published)}).disabled`), true);
      await b.click(fr.admin.workflow.action.in_review);
      assert.ok(await b.waitText(fr.admin.workflow.done.in_review));
      assert.equal((await t.prisma.formation.findUnique({ where: { id: formation.id } })).status, 'in_review');
    });

    test('the dashboard lists the formation under "À relire" and shows what is missing', async () => {
      await b.goto(`${site.url}/admin`);
      assert.ok(await b.waitText(fr.admin.dashboard.review));
      assert.ok(await b.waitFor(`document.querySelector('#review-title').closest('section').innerText.includes('Comptabilité pas à pas')`));
      assert.ok(await b.ev(`document.body.innerText.includes(${JSON.stringify(fr.admin.status.in_review)})`));
      assert.ok(await b.ev("!!document.querySelector('.dash-missing')"), 'the missing items are announced');
    });
  });

  describe('what a learner sees', () => {
    let slug;
    before(async () => {
      // complete the formation through the API, then publish it
      await api('PATCH', `/admin/formations/${formation.id}`, { json: { description: 'Une formation claire.', certificationEnabled: false } });
      await api('POST', `/admin/formations/${formation.id}/cover`, { form: (await import('../helpers/fixtures.js')).fileForm((await import('../helpers/fixtures.js')).PNG) });
      const fresh = (await api('GET', `/admin/formations/${formation.id}`)).body.formation;
      for (const c of fresh.courses) await api('PATCH', `/admin/courses/${c.id}`, { json: { body: '<p>Du contenu.</p>', estimatedMinutes: 10 } });
      assert.equal((await api('PUT', `/admin/formations/${formation.id}/status`, { json: { status: 'published' } })).status, 200);
      slug = (await t.prisma.formation.findUnique({ where: { id: formation.id } })).slug;
      await t.user({ name: 'Sofia', email: 'apprenante@example.com', passwordHash: await bcrypt.hash(PASSWORD, 10) });
    });

    test('chapters, level, duration, objectives and prerequisites are shown on the formation page', async () => {
      await b.clearCookies();
      await b.goto(`${site.url}/connexion`);
      await b.waitFor("!!document.querySelector('#email')");
      await b.type('#email', 'apprenante@example.com');
      await b.type('#password', PASSWORD);
      await b.click(fr.auth.login.submit);
      assert.ok(await b.waitFor("location.pathname !== '/connexion'"));
      await b.goto(`${site.url}/catalogue/${slug}`);
      assert.ok(await b.waitText('Comptabilité pas à pas'));
      const headings = await b.ev("[...document.querySelectorAll('.learn-chapter-title')].map(h => h.childNodes[0].textContent)");
      assert.deepEqual(headings, ['Pratique', 'Les bases', 'Conclusion']);
      assert.ok(await b.ev(`document.body.innerText.includes(${JSON.stringify(fr.learn.level.intermediate)})`));
      assert.ok(await b.waitText('Tenir ses comptes sereinement'));
      assert.ok(await b.waitText(fr.learn.detail.objectives));
      assert.ok(await b.waitText('Enregistrer une opération'));
      assert.ok(await b.waitText(fr.learn.detail.prerequisites));
      assert.ok(await b.ev("document.body.innerText.includes('40 min')"), 'total duration is the sum of the lessons');
    });

    test('an archived formation disappears from the catalogue but stays open for the enrolled learner', async () => {
      await b.click(fr.learn.detail.enroll);
      assert.ok(await b.waitText(fr.learn.detail.enrolled));
      assert.equal((await api('PUT', `/admin/formations/${formation.id}/status`, { json: { status: 'archived' } })).status, 200);
      await b.goto(`${site.url}/catalogue`);
      await b.waitFor("!!document.querySelector('.learn-page')");
      await sleep(400);
      assert.ok(!(await b.text()).includes('Comptabilité pas à pas'), 'not in the catalogue any more');
      await b.goto(`${site.url}/catalogue/${slug}`);
      assert.ok(await b.waitText('Comptabilité pas à pas'), 'still readable for the enrolled learner');
    });
  });

  test('no JavaScript error during the whole journey', () => {
    assert.deepEqual(b.jsErrors, []);
  });
});

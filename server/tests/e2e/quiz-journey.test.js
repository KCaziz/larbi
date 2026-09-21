import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { PNG, fileForm } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P3-13 in a real browser: an administrator builds a required quiz for a lesson (settings,
// three types of question, reordering), then a learner takes it: a failed attempt with its
// correction, a passed one, the certificate. The page never contains an answer before submitting.

const bcrypt = createRequire(import.meta.url)('bcryptjs');
const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const PASSWORD = 'Passw0rd!test';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('quiz, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let admin;
  let formation;
  let lessonId;
  let slug;

  const api = (method, url, opts) => t.request(method, url, { user: admin, ...opts });
  const quizRow = () => t.prisma.quiz.findFirst({ where: { courseId: lessonId }, include: { questions: { orderBy: { position: 'asc' }, include: { choices: { orderBy: { position: 'asc' } } } } } });
  const waitDb = async (check, ms = 8000) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (await check()) return true;
      await sleep(150);
    }
    return false;
  };
  const key = async (name, code, text) => {
    await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: name, code, text });
    await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: name, code });
    await sleep(300);
  };
  const setValue = (selector, value) =>
    b.ev(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); const proto = e.tagName === 'SELECT' ? HTMLSelectElement.prototype : e.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(e, ${JSON.stringify(value)}); e.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  const question = (n) => `.quiz-question:nth-child(${n})`;
  const saveQuestion = (n) => b.clickWhere(`e => e.textContent.trim() === ${JSON.stringify(fr.admin.quiz.question.save)} && e.closest(${JSON.stringify(question(n))})`);
  const login = async (email) => {
    await b.clearCookies();
    await b.goto(`${site.url}/connexion`);
    await b.waitFor("!!document.querySelector('#email')");
    await b.type('#email', email);
    await b.type('#password', PASSWORD);
    await b.click(fr.auth.login.submit);
    assert.ok(await b.waitFor("location.pathname !== '/connexion'"));
  };

  before(async () => {
    t = await boot();
    await t.reset();
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    admin = await t.admin({ name: 'Camille Rédactrice', email: 'redactrice@example.com', passwordHash });
    await t.user({ name: 'Sofia', email: 'apprenante@example.com', passwordHash });
    const f = (await api('POST', '/admin/formations', { json: { title: 'Formation quiz' } })).body.formation;
    const lesson = (await api('POST', `/admin/formations/${f.id}/courses`, { json: { title: 'Ma leçon' } })).body.course;
    await api('PATCH', `/admin/courses/${lesson.id}`, { json: { body: '<p>Contenu de la leçon.</p>' } });
    formation = f;
    lessonId = lesson.id;
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1400, height: 1300 });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  describe('the administrator builds the quiz', () => {
    test('adds a quiz to the lesson: it starts empty and incomplete', async () => {
      await login('redactrice@example.com');
      await b.goto(`${site.url}/admin/formations/${formation.id}`);
      await b.waitFor("!!document.querySelector('[role=tab]')");
      await b.clickTab(fr.admin.steps.courses);
      await b.waitFor("!!document.querySelector('.cms-course-toggle')");
      await b.ev("document.querySelector('.cms-course-toggle').click()");
      assert.ok(await b.waitText(fr.admin.quiz.add.course));
      await b.click(fr.admin.quiz.add.course);
      assert.ok(await b.waitFor("!!document.querySelector('.quiz-editor')"));
      assert.ok(await b.waitText(fr.admin.quiz.problems.noQuestions));
      const quiz = await quizRow();
      assert.equal(quiz.isRequired, false);
      assert.equal(quiz.isComplete, false);
    });

    test('settings: required, pass mark 60 %; saved with their own button', async () => {
      await setValue(`.quiz-editor input[id^='quiz-pass-']`, '60');
      await b.ev(`[...document.querySelectorAll('.quiz-editor .cms-check')].find(l => l.textContent.includes(${JSON.stringify(fr.admin.quiz.required)})).querySelector('input').click()`);
      await b.click(fr.admin.quiz.saveSettings);
      assert.ok(await b.waitText(fr.admin.quiz.saved));
      const quiz = await quizRow();
      assert.deepEqual([quiz.isRequired, quiz.passingScore], [true, 60]);
    });

    test('a single-choice question: statement, three answers, the right one, points; the card says "complete"', async () => {
      await b.clickWhere(`e => e.classList.contains('cms-palette-button') && e.closest('.quiz-editor') && e.textContent.trim() === ${JSON.stringify(fr.admin.quiz.types.single)}`);
      assert.ok(await b.waitFor("document.querySelectorAll('.quiz-question').length === 1"));
      assert.ok(await b.waitText(fr.admin.quiz.problems.prompt));
      await setValue(`${question(1)} textarea`, 'Combien font 2 + 2 ?');
      const texts = `${question(1)} .quiz-choice`;
      for (const [i, text] of ['3', '4', '5'].entries()) {
        await b.ev(`(() => { const inputs = document.querySelectorAll(${JSON.stringify(`${texts} input[type=text]`)}); if (!inputs[${i}]) { [...document.querySelectorAll('.quiz-question:nth-child(1) button')].find(x => x.textContent.trim() === ${JSON.stringify(fr.admin.quiz.question.addChoice)}).click(); } })()`);
        await sleep(150);
        await b.ev(`(() => { const e = document.querySelectorAll(${JSON.stringify(`${texts} input[type=text]`)})[${i}]; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, ${JSON.stringify(text)}); e.dispatchEvent(new Event('input', { bubbles: true })); })()`);
      }
      await b.ev(`document.querySelectorAll(${JSON.stringify(`${texts} input[type=radio]`)})[1].click()`);
      await saveQuestion(1);
      assert.ok(await b.waitText(fr.admin.quiz.question.saved));
      const q = (await quizRow()).questions[0];
      assert.equal(q.prompt, 'Combien font 2 + 2 ?');
      assert.deepEqual(q.choices.map((c) => [c.text, c.isCorrect]), [['3', false], ['4', true], ['5', false]]);
    });

    test('a true / false question and a free-text question (accepted answers typed one by one)', async () => {
      await b.clickWhere(`e => e.classList.contains('cms-palette-button') && e.closest('.quiz-editor') && e.textContent.trim() === ${JSON.stringify(fr.admin.quiz.types.true_false)}`);
      assert.ok(await b.waitFor("document.querySelectorAll('.quiz-question').length === 2"));
      await setValue(`${question(2)} textarea`, 'La Terre est ronde.');
      await saveQuestion(2);
      assert.ok(await waitDb(async () => (await quizRow()).questions[1]?.prompt === 'La Terre est ronde.'));

      await b.clickWhere(`e => e.classList.contains('cms-palette-button') && e.closest('.quiz-editor') && e.textContent.trim() === ${JSON.stringify(fr.admin.quiz.types.text)}`);
      assert.ok(await b.waitFor("document.querySelectorAll('.quiz-question').length === 3"));
      await setValue(`${question(3)} textarea`, 'Capitale de la France ?');
      await b.type(`${question(3)} .cms-lines input`, 'Paris');
      await key('Enter', 'Enter');
      await saveQuestion(3);
      assert.ok(await waitDb(async () => (await quizRow()).questions[2]?.acceptedAnswers.includes('Paris')));
      assert.ok(await b.waitText(fr.admin.quiz.complete_other.replace('{{count}}', '3')), 'the quiz is complete');
      assert.equal((await quizRow()).isComplete, true);
    });

    test('reordering a question from the keyboard is saved', async () => {
      await b.ev(`document.querySelector(${JSON.stringify(`${question(1)} .cms-grip`)}).focus()`);
      await sleep(300);
      await key(' ', 'Space', ' ');
      await key('ArrowDown', 'ArrowDown');
      await key(' ', 'Space', ' ');
      assert.ok(await waitDb(async () => (await quizRow()).questions[1]?.prompt === 'Combien font 2 + 2 ?'), JSON.stringify((await quizRow()).questions.map((q) => q.prompt)));
      // put it back first (the learner test below relies on the original order)
      await b.ev(`document.querySelector(${JSON.stringify(`${question(2)} .cms-grip`)}).focus()`);
      await sleep(300);
      await key(' ', 'Space', ' ');
      await key('ArrowUp', 'ArrowUp');
      await key(' ', 'Space', ' ');
      assert.ok(await waitDb(async () => (await quizRow()).questions[0]?.prompt === 'Combien font 2 + 2 ?'));
    });

    test('the formation is finished by the client and published: the quiz is complete so nothing blocks it', async () => {
      await api('PATCH', `/admin/formations/${formation.id}`, { json: { description: 'Une formation.', certificationEnabled: true, certificationTitle: 'Certificat quiz' } });
      await api('POST', `/admin/formations/${formation.id}/cover`, { form: fileForm(PNG) });
      const res = await api('PUT', `/admin/formations/${formation.id}/status`, { json: { status: 'published' } });
      assert.equal(res.status, 200);
      slug = (await t.prisma.formation.findUnique({ where: { id: formation.id } })).slug;
    });
  });

  describe('a learner takes it', () => {
    const explanation = 'Deux et deux font quatre.';

    before(async () => {
      // explanations / accepted answers, written by the author (kept out of the page until the correction)
      const quiz = await quizRow();
      await api('PATCH', `/admin/questions/${quiz.questions[0].id}`, { json: { explanation } });
      await api('PATCH', `/admin/questions/${quiz.questions[2].id}`, { json: { explanation: 'C\'est Paris.', acceptedAnswers: ['Paris', 'Ville de Paris'] } });
    });

    test('the lesson announces a required quiz; the formation says one is left', async () => {
      await login('apprenante@example.com');
      await b.goto(`${site.url}/catalogue/${slug}`);
      await b.click(fr.learn.detail.enroll);
      assert.ok(await b.waitText(fr.learn.detail.enrolled));
      assert.ok(await b.waitText('1 quiz obligatoire à réussir'));
      await b.goto(`${site.url}/catalogue/${slug}/cours/${lessonId}`);
      assert.ok(await b.waitFor("!!document.querySelector('.quiz-card')"));
      assert.match(await b.ev("document.querySelector('.quiz-card').innerText"), /Obligatoire/);
      await b.click(fr.learn.course.markDone);
      assert.ok(await b.waitText(fr.learn.detail.lessonDone));
      const enrollment = await t.prisma.enrollment.findFirst({});
      assert.equal(enrollment.status, 'active', 'the lesson is done but the required quiz is not passed');
    });

    test('the questions are shown without ANY answer, explanation or accepted answer in the page', async () => {
      await b.click(fr.quiz.start); // on the lesson: opens the quiz page (its introduction)
      assert.ok(await b.waitFor("!!document.querySelector('.quiz-panel')"));
      const intro = await b.ev('document.documentElement.innerHTML');
      assert.ok(!intro.includes('Combien font'), 'the introduction shows no question yet');
      await b.click(fr.quiz.start); // on the page: starts the attempt
      assert.ok(await b.waitFor("!!document.querySelector('.quiz-taking .quiz-item')"));
      assert.equal(await b.ev("document.querySelectorAll('.quiz-item').length"), 3);
      const html = await b.ev('document.documentElement.innerHTML');
      for (const secret of [explanation, 'Ville de Paris', 'correctChoiceIds', 'isCorrect']) assert.ok(!html.includes(secret), `leaked: ${secret}`);
    });

    test('a wrong attempt: score, failure message, the correction with explanation; then a second attempt is offered', async () => {
      // answer the single choice wrongly (3), true/false wrongly (false), free text wrongly
      await b.ev("document.querySelectorAll('.quiz-item')[0].querySelectorAll('input[type=radio]')[0].click()");
      await b.ev("document.querySelectorAll('.quiz-item')[1].querySelectorAll('input[type=radio]')[1].click()");
      await setValue('.quiz-taking fieldset:nth-of-type(3) input[type=text]', 'Lyon');
      await b.click(fr.quiz.submit);
      assert.ok(await b.waitFor("!!document.querySelector('.quiz-result')"));
      assert.match(await b.ev("document.querySelector('.quiz-result').className"), /failed/);
      assert.ok(await b.waitText('0 %'));
      assert.ok(await b.waitText(explanation), 'the correction shows the explanation');
      assert.ok(await b.waitText('Paris'), 'and the accepted answers');
      const attempt = await t.prisma.quizAttempt.findFirst({ orderBy: { startedAt: 'asc' } });
      assert.deepEqual([attempt.score, attempt.passed], [0, false]);
      assert.equal((await t.prisma.enrollment.findFirst({})).status, 'active');
    });

    test('the second attempt, all right: passed, the formation is finished and the certificate issued', async () => {
      await b.click(fr.quiz.retry);
      // a NEW attempt: the form with enabled fields (the previous result was read-only)
      assert.ok(await b.waitFor("!!document.querySelector('form.quiz-taking .quiz-item input:not([disabled])')"));
      await b.ev("document.querySelectorAll('.quiz-item')[0].querySelectorAll('input[type=radio]')[1].click()");
      await b.ev("document.querySelectorAll('.quiz-item')[1].querySelectorAll('input[type=radio]')[0].click()");
      await setValue('.quiz-taking fieldset:nth-of-type(3) input[type=text]', '  paris ');
      await b.click(fr.quiz.submit);
      assert.ok(await b.waitFor("!!document.querySelector('.quiz-result.passed')"));
      assert.ok(await b.waitText('100 %'));
      assert.ok(await b.waitText(fr.quiz.certified));
      const enrollment = await t.prisma.enrollment.findFirst({});
      assert.equal(enrollment.status, 'completed');
      assert.equal(await t.prisma.certification.count({ where: { enrollmentId: enrollment.id } }), 1);
    });

    test('the summary remembers the best score, and the last result can be read again', async () => {
      await b.goto(`${site.url}/catalogue/${slug}/cours/${lessonId}`);
      assert.ok(await b.waitFor("!!document.querySelector('.quiz-card')"));
      assert.match(await b.ev("document.querySelector('.quiz-card').innerText"), /Réussi \(100 %\)/);
      await b.click(fr.quiz.open);
      assert.ok(await b.waitFor("!!document.querySelector('.quiz-panel')"));
      await b.click(fr.quiz.seeLast);
      assert.ok(await b.waitFor("!!document.querySelector('.quiz-result.passed')"));
      assert.ok(await b.waitText(explanation));
    });

    test('Arabic (right to left) and phone width: the quiz page does not overflow', async () => {
      await b.ev("localStorage.setItem('lang', 'ar')");
      await b.setViewport(375, 800);
      const quiz = await quizRow();
      await b.goto(`${site.url}/catalogue/${slug}/quiz/${quiz.id}`);
      assert.ok(await b.waitFor("!!document.querySelector('.quiz-panel')"));
      assert.equal(await b.ev('document.documentElement.dir'), 'rtl');
      assert.ok(await b.ev('document.documentElement.scrollWidth <= window.innerWidth'), 'no horizontal scroll');
    });

    test('another learner (not enrolled) is refused with an explanation, not an error page', async () => {
      await t.user({ name: 'Intruse', email: 'intruse@example.com', passwordHash: await bcrypt.hash(PASSWORD, 10) });
      await b.ev("localStorage.setItem('lang', 'fr')");
      await b.setViewport(1400, 1000);
      await login('intruse@example.com');
      const quiz = await quizRow();
      await b.goto(`${site.url}/catalogue/${slug}/quiz/${quiz.id}`);
      assert.ok(await b.waitText(fr.learn.course.notEnrolled));
    });
  });

  test('no JavaScript error during the whole journey', () => {
    assert.deepEqual(b.jsErrors, []);
  });
});

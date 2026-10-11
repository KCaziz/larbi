import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// Guided assistant in a real browser (P3-07): an administrator writes and
// publishes a question in the CMS, a visitor opens the panel, picks it, reads the
// answer, closes with Escape; Arabic and phone layouts; never in the admin area.
// The rules themselves are tested on the API (functional/chatbot.test.js).

const locale = (lang) => JSON.parse(readFileSync(path.resolve(SERVER_DIR, `../client/src/i18n/locales/${lang}.json`), 'utf8'));
const fr = locale('fr');
const ar = locale('ar');
const c = fr.chatbot;
const QUESTION = 'Comment suivre ma progression ?';
const ANSWER = 'Ouvrez Mon espace puis Mes formations.';

describe('guided assistant, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let admin;

  const toggleShown = () => b.ev("Boolean(document.querySelector('.chatbot-toggle'))");
  const setSession = (user) =>
    user ? b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true }) : b.clearCookies();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  before(async () => {
    t = await boot();
    await t.reset();
    admin = await t.admin({ name: 'Admin Assistant' });
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

  test('nothing published yet: no button at all (no empty panel)', async () => {
    await b.goto(`${site.url}/`);
    assert.ok(await b.waitFor("document.querySelector('main')?.innerText.trim().length > 0"), 'the page is rendered');
    await sleep(800);
    assert.equal(await toggleShown(), false);
  });

  test('an administrator writes a question, it stays a draft until published', async () => {
    await setSession(admin);
    await b.goto(`${site.url}/admin/assistant`);
    assert.ok(await b.waitText(c.admin.subtitle));
    assert.ok(await b.click(c.admin.add));
    assert.ok(await b.waitFor("Boolean(document.querySelector('#cb-question'))"));
    await b.type('#cb-question', QUESTION);
    await b.ev("document.querySelector('#cb-answer').focus()");
    await b.send('Input.insertText', { text: ANSWER });
    assert.ok(await b.click(c.admin.save));
    assert.ok(await b.waitText(c.admin.saved));
    assert.ok(await b.waitText(c.admin.status.draft));
    assert.equal(await toggleShown(), false, 'never shown inside the administration');

    await b.clearCookies();
    await b.goto(`${site.url}/`);
    await sleep(800);
    assert.equal(await toggleShown(), false, 'a draft is not public');

    await setSession(admin);
    await b.goto(`${site.url}/admin/assistant`);
    assert.ok(await b.clickWhere(`e => e.getAttribute('aria-label') === ${JSON.stringify(`${c.admin.publish} — ${QUESTION}`)}`));
    assert.ok(await b.waitText(c.admin.published));
  });

  test('a visitor opens the panel, picks the question, reads the answer, closes with Escape', async () => {
    await b.clearCookies();
    await b.goto(`${site.url}/blog`);
    assert.ok(await b.waitFor(toggleShownExpr()));
    assert.ok(await b.click(c.open));
    assert.ok(await b.waitText(c.intro));
    assert.equal(await b.ev("document.querySelector('.chatbot-toggle').getAttribute('aria-expanded')"), 'true');
    assert.ok(await b.click(QUESTION));
    assert.ok(await b.waitText(ANSWER));
    assert.equal(await b.ev('document.activeElement?.textContent'), QUESTION, 'focus moves to the question shown');
    assert.ok(await b.click(c.back));
    assert.ok(await b.waitText(c.intro));
    assert.ok(await b.waitText(c.contact));

    await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    assert.ok(await b.waitFor("!document.querySelector('.chatbot-panel')"));
    assert.equal(await b.ev("document.activeElement?.classList.contains('chatbot-toggle')"), true, 'focus goes back to the button');
    await b.shot('chatbot-desktop');
  });

  test('"contact the team" leads to the contact page', async () => {
    assert.ok(await b.click(c.open));
    assert.ok(await b.click(c.contact));
    assert.ok(await b.waitFor("location.pathname === '/contact'"));
    assert.ok(await b.waitFor("!document.querySelector('.chatbot-panel')"));
  });

  test('Arabic: only Arabic questions, right-to-left, the panel stays on screen', async () => {
    await b.ev("localStorage.setItem('lang', 'ar')");
    await b.goto(`${site.url}/`);
    await sleep(800);
    assert.equal(await toggleShown(), false, 'no Arabic question published yet');

    await t.prisma.chatbotEntry.create({ data: { question: 'كيف أتابع تقدمي؟', answer: '<p>افتح فضائي ثم تكويناتي.</p>', language: 'ar', status: 'published' } });
    await b.goto(`${site.url}/`);
    assert.ok(await b.waitFor(toggleShownExpr()));
    assert.ok(await b.click(ar.chatbot.open));
    assert.ok(await b.waitText('كيف أتابع تقدمي؟'));
    assert.equal(await b.ev("document.querySelector('.chatbot').getAttribute('dir')"), 'rtl');
    const box = await b.ev("(() => { const r = document.querySelector('.chatbot-panel').getBoundingClientRect(); return { left: r.left, right: r.right, vw: innerWidth }; })()");
    assert.ok(box.left >= 0 && box.right <= box.vw, `inside the viewport: ${JSON.stringify(box)}`);
    assert.ok(box.left < box.vw / 2, 'on the left side in Arabic');
    await b.shot('chatbot-ar');
    await b.ev("localStorage.setItem('lang', 'fr')");
  });

  test('phone: icon-only button, panel within the screen, no horizontal scroll', async () => {
    await b.setViewport(390, 800);
    await b.goto(`${site.url}/`);
    assert.ok(await b.waitFor(toggleShownExpr()));
    const toggleWidth = await b.ev("document.querySelector('.chatbot-toggle').getBoundingClientRect().width");
    assert.ok(toggleWidth < 70, `icon only: ${toggleWidth}px`);
    assert.ok(await b.clickWhere("e => e.classList.contains('chatbot-toggle')"));
    assert.ok(await b.waitText(QUESTION));
    const panel = await b.ev("(() => { const r = document.querySelector('.chatbot-panel').getBoundingClientRect(); return { left: r.left, right: r.right }; })()");
    assert.ok(panel.left >= 0 && panel.right <= 390, JSON.stringify(panel));
    assert.equal(await b.ev('document.documentElement.scrollWidth <= innerWidth'), true);
    await b.shot('chatbot-phone');
    await b.setViewport(1280, 1000);
  });

  function toggleShownExpr() {
    return "Boolean(document.querySelector('.chatbot-toggle'))";
  }
});

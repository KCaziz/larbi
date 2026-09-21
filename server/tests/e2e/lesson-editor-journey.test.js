import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { PNG, fileForm, makePng } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P3-12 in a real browser: an administrator builds a lesson block by block (text, code, table,
// image, callout, links), sees it saved by itself, reorders it from the keyboard, previews
// it as a student, restores an older version; then a learner reads it.

const bcrypt = createRequire(import.meta.url)('bcryptjs');
const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const PASSWORD = 'Passw0rd!test';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('lesson editor with blocks, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let admin;
  let formation;
  let lessonId;
  let imagePath;

  const api = (method, url, opts) => t.request(method, url, { user: admin, ...opts });
  const blocks = () => t.prisma.lessonBlock.findMany({ where: { courseId: lessonId }, orderBy: { position: 'asc' } });
  const waitBlocks = async (check, ms = 8000) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      const list = await blocks();
      if (check(list)) return true;
      await sleep(150);
    }
    return false;
  };
  const key = async (name, code, text) => {
    await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: name, code, text });
    await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: name, code });
    await sleep(120);
  };
  const setValue = (selector, value) =>
    b.ev(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); const proto = e.tagName === 'SELECT' ? HTMLSelectElement.prototype : e.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(e, ${JSON.stringify(value)}); e.dispatchEvent(new Event(e.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); })()`);
  const lastBlockSelector = '.cms-block-list > div:last-child .cms-block';

  before(async () => {
    t = await boot();
    await t.reset();
    admin = await t.admin({ name: 'Camille Rédactrice', email: 'redactrice@example.com', passwordHash: await bcrypt.hash(PASSWORD, 10) });
    const f = (await api('POST', '/admin/formations', { json: { title: 'Formation blocs' } })).body.formation;
    const lesson = (await api('POST', `/admin/formations/${f.id}/courses`, { json: { title: 'Ma leçon' } })).body.course;
    formation = f;
    lessonId = lesson.id;
    const dir = mkdtempSync(path.join(tmpdir(), 'larbi-e2e-files-'));
    imagePath = path.join(dir, 'schema.png');
    writeFileSync(imagePath, makePng(320, 180));
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1400, height: 1200 });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  describe('building the lesson', () => {
    test('opens the lesson in the plan: it is empty and offers every type of block', async () => {
      await b.goto(`${site.url}/connexion`);
      await b.waitFor("!!document.querySelector('#email')");
      await b.type('#email', 'redactrice@example.com');
      await b.type('#password', PASSWORD);
      await b.click(fr.auth.login.submit);
      assert.ok(await b.waitFor("location.pathname !== '/connexion'"));
      await b.goto(`${site.url}/admin/formations/${formation.id}`);
      await b.waitFor("!!document.querySelector('[role=tab]')");
      await b.clickTab(fr.admin.steps.courses);
      await b.waitFor("!!document.querySelector('.cms-course-toggle')");
      await b.ev("document.querySelector('.cms-course-toggle').click()");
      assert.ok(await b.waitText(fr.admin.blocks.empty));
      for (const type of ['text', 'image', 'video', 'file', 'code', 'table', 'quote', 'callout', 'resources']) {
        assert.ok(await b.ev(`[...document.querySelectorAll('.cms-palette-button')].some(x => x.textContent.trim() === ${JSON.stringify(fr.admin.blocks.types[type])})`), type);
      }
    });

    test('a text block: type in it, it is saved by itself (nobody presses a save button)', async () => {
      await b.click(fr.admin.blocks.types.text);
      assert.ok(await b.waitFor("!!document.querySelector('.cms-block .cms-rte-content')"));
      await b.ev("document.querySelector('.cms-block .cms-rte-content').focus()");
      await b.send('Input.insertText', { text: 'Bienvenue dans la leçon.' });
      assert.ok(await waitBlocks((l) => l[0]?.type === 'text' && /Bienvenue dans la leçon/.test(l[0].data.html)), 'saved by itself');
      assert.ok(await b.waitText(fr.admin.blocks.status.saved));
    });

    test('a code block: language and code (kept exactly, never interpreted)', async () => {
      await b.click(fr.admin.blocks.types.code);
      assert.ok(await b.waitFor("document.querySelectorAll('.cms-block').length === 2"));
      await setValue(`${lastBlockSelector} select`, 'python');
      await b.type(`${lastBlockSelector} textarea`, 'print("<b>bonjour</b>")');
      assert.ok(await waitBlocks((l) => l[1]?.type === 'code' && l[1].data.language === 'python' && l[1].data.code === 'print("<b>bonjour</b>")'));
    });

    test('a table: column titles, a row, an extra column', async () => {
      await b.click(fr.admin.blocks.types.table);
      assert.ok(await b.waitFor("document.querySelectorAll('.cms-block').length === 3"));
      const inputs = `${lastBlockSelector} .cms-grid input`;
      const setAt = async (index, value) => {
        await b.ev(`(() => { const e = document.querySelectorAll(${JSON.stringify(inputs)})[${index}]; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, ${JSON.stringify(value)}); e.dispatchEvent(new Event('input', { bubbles: true })); })()`);
        await sleep(120);
      };
      // first row = titles of the columns, then the cells of the row
      await setAt(0, 'Produit');
      await setAt(1, 'Prix');
      await setAt(2, 'Cahier');
      await setAt(3, '3,50');
      assert.ok(await waitBlocks((l) => l[2]?.type === 'table' && JSON.stringify(l[2].data.headers) === '["Produit","Prix"]' && l[2].data.rows[0][0] === 'Cahier' && l[2].data.rows[0][1] === '3,50'), JSON.stringify((await blocks())[2]?.data));
      await b.click(fr.admin.blocks.table.addRow);
      assert.ok(await b.waitFor(`document.querySelectorAll(${JSON.stringify(`${lastBlockSelector} tbody tr`)}).length === 2`));
    });

    test('an image: chosen from the computer, stored privately, shown in the editor', async () => {
      await b.setFiles('.cms-palette input[type=file][accept*="image/png"]', imagePath);
      assert.ok(await waitBlocks((l) => l.some((x) => x.type === 'image' && x.mediaId)));
      assert.ok(await b.waitFor("!!document.querySelector('.cms-block img.cms-block-preview')"));
      assert.ok(await b.waitFor("document.querySelector('.cms-block img.cms-block-preview').naturalWidth > 0"), 'the image loads through the authorised route');
      const image = (await blocks()).find((x) => x.type === 'image');
      assert.equal(image.data.alt, 'schema.png');
    });

    test('a callout and a list of links: an unfinished link is NOT saved (and stays on screen), a real one is', async () => {
      await b.click(fr.admin.blocks.types.callout);
      assert.ok(await b.waitFor("document.querySelectorAll('.cms-block').length === 5"));
      await setValue(`${lastBlockSelector} select`, 'warning');
      await b.type(`${lastBlockSelector} input[type=text]`, 'À retenir');
      assert.ok(await waitBlocks((l) => l.at(-1)?.type === 'callout' && l.at(-1).data.variant === 'warning' && l.at(-1).data.title === 'À retenir'), JSON.stringify((await blocks()).at(-1)));

      await b.click(fr.admin.blocks.types.resources);
      assert.ok(await b.waitFor("document.querySelectorAll('.cms-block').length === 6"), 'six blocks on screen');
      await b.click(fr.admin.blocks.resources.add);
      assert.ok(await b.waitFor(`document.querySelectorAll(${JSON.stringify(`${lastBlockSelector} .cms-resource-list li`)}).length === 1`));
      await b.type(`${lastBlockSelector} .cms-resource-list li input:nth-child(1)`, 'Site officiel');
      await sleep(1500);
      assert.deepEqual((await blocks()).at(-1).data.items, [], 'a link without an address is not saved yet');
      assert.equal(await b.ev(`document.querySelector(${JSON.stringify(`${lastBlockSelector} .cms-resource-list li input:nth-child(1)`)}).value`), 'Site officiel', 'but it stays on screen');
      await b.type(`${lastBlockSelector} .cms-resource-list li input[type=url]`, 'https://example.org/aide');
      assert.ok(await waitBlocks((l) => l.at(-1)?.data.items?.[0]?.url === 'https://example.org/aide' && l.at(-1).data.items[0].label === 'Site officiel'));
    });
  });

  describe('order, preview, history', () => {
    test('reordering from the keyboard: Space lifts the last block, the arrow moves it up, Space drops it', async () => {
      const before = (await blocks()).map((x) => x.type);
      assert.equal(before.at(-1), 'resources');
      // every autosave must have settled first (a saved list is re-read after each save)
      assert.ok(await b.waitText(fr.admin.blocks.status.saved));
      await b.ev("[...document.querySelectorAll('.cms-block')].at(-1).querySelector('.cms-grip').focus()");
      await sleep(300);
      await key(' ', 'Space', ' ');
      await sleep(300);
      await key('ArrowUp', 'ArrowUp');
      await sleep(300);
      await key(' ', 'Space', ' ');
      assert.ok(await waitBlocks((l) => l.at(-2)?.type === 'resources' && l.at(-1)?.type === 'callout'), JSON.stringify((await blocks()).map((x) => x.type)));
      assert.deepEqual((await blocks()).map((x) => x.position), [0, 1, 2, 3, 4, 5]);
    });

    test('the student preview shows the blocks as the reader will (code, table header, callout, link, image)', async () => {
      await b.click(fr.admin.blocks.preview);
      assert.ok(await b.waitFor("!!document.querySelector('.cms-block-preview-pane .blocks')"));
      const seen = await b.ev(`(() => { const p = document.querySelector('.cms-block-preview-pane'); return {
        code: p.querySelector('.block-code code')?.textContent,
        language: p.querySelector('.block-code-language')?.textContent,
        header: [...p.querySelectorAll('.block-table th')].map(x => x.textContent),
        callout: p.querySelector('.block-callout')?.innerText,
        link: p.querySelector('.block-resources a')?.getAttribute('href'),
        rel: p.querySelector('.block-resources a')?.getAttribute('rel'),
        image: p.querySelector('.block-figure img')?.naturalWidth > 0,
        injected: !!p.querySelector('.block-code b'),
      }; })()`);
      assert.equal(seen.code, 'print("<b>bonjour</b>")');
      assert.equal(seen.language, 'python');
      assert.deepEqual(seen.header, ['Produit', 'Prix']);
      assert.match(seen.callout, /À retenir/);
      assert.equal(seen.link, 'https://example.org/aide');
      assert.match(seen.rel, /noopener/);
      assert.equal(seen.image, true);
      assert.equal(seen.injected, false, 'the code is text, never HTML');
      await b.click(fr.admin.blocks.edit);
      assert.ok(await b.waitFor("!document.querySelector('.cms-block-preview-pane')"));
    });

    test('history: a named version, then a change, then restoring brings the earlier blocks back', async () => {
      await b.click(fr.admin.blocks.history);
      assert.ok(await b.waitText(fr.admin.blocks.revision.intro));
      await b.type(`#revision-label-${lessonId}`, 'Version complète');
      await b.click(fr.admin.blocks.revision.save);
      assert.ok(await b.waitText(fr.admin.blocks.revision.saved));
      const saved = (await blocks()).map((x) => x.type);

      // delete the code block (with confirmation)
      await b.ev("[...document.querySelectorAll('.cms-block')].find(x => x.querySelector('.cms-block-type').textContent === 'Code').querySelector('[aria-label]:not(.cms-grip).danger').click()");
      assert.ok(await b.waitFor("!!document.querySelector('dialog[open]')"));
      await b.clickWhere(`e => e.closest('dialog[open]') && e.textContent.trim() === ${JSON.stringify(fr.admin.courses.deleteConfirm)}`);
      assert.ok(await waitBlocks((l) => l.length === saved.length - 1), `delete: ${JSON.stringify((await blocks()).map((x) => x.type))} vs ${JSON.stringify(saved)}`);

      // restore the named version
      await b.ev(`[...document.querySelectorAll('.cms-revision-list li')].find(li => li.innerText.includes('Version complète')).querySelector('button').click()`);
      assert.ok(await b.waitFor("!!document.querySelector('dialog[open]')"));
      await b.clickWhere(`e => e.closest('dialog[open]') && e.textContent.trim() === ${JSON.stringify(fr.admin.blocks.revision.restore)}`);
      assert.ok(await b.waitText(fr.admin.blocks.revision.restored), `restore message; page: ${(await b.text()).slice(0, 300)}`);
      assert.deepEqual((await blocks()).map((x) => x.type), saved);
      assert.ok(await b.waitFor("[...document.querySelectorAll('.cms-block-type')].some(x => x.textContent === 'Code')"), 'the code block is back on screen');
    });
  });

  describe('what a learner reads', () => {
    let slug;
    before(async () => {
      await api('PATCH', `/admin/formations/${formation.id}`, { json: { description: 'Une formation.', certificationEnabled: false } });
      await api('POST', `/admin/formations/${formation.id}/cover`, { form: fileForm(PNG) });
      await api('PUT', `/admin/formations/${formation.id}/status`, { json: { status: 'published' } });
      slug = (await t.prisma.formation.findUnique({ where: { id: formation.id } })).slug;
      // a hostile value planted DIRECTLY in the database (as if the server had been bypassed)
      await t.prisma.lessonBlock.create({ data: { courseId: lessonId, type: 'text', position: 99, data: { html: '<p>Texte piégé</p><img src=x onerror="window.__xss=1"><script>window.__xss=1</script>' } } });
      await t.user({ name: 'Sofia', email: 'apprenante@example.com', passwordHash: await bcrypt.hash(PASSWORD, 10) });
    });

    test('the blocks are shown in order; the image loads through the authorised route; a hostile value planted in the database does not run', async () => {
      await b.clearCookies();
      await b.goto(`${site.url}/connexion`);
      await b.waitFor("!!document.querySelector('#email')");
      await b.type('#email', 'apprenante@example.com');
      await b.type('#password', PASSWORD);
      await b.click(fr.auth.login.submit);
      assert.ok(await b.waitFor("location.pathname !== '/connexion'"));
      await b.goto(`${site.url}/catalogue/${slug}`);
      await b.click(fr.learn.detail.enroll);
      assert.ok(await b.waitText(fr.learn.detail.enrolled));
      await b.goto(`${site.url}/catalogue/${slug}/cours/${lessonId}`);
      assert.ok(await b.waitText('Bienvenue dans la leçon.'));
      assert.ok(await b.waitFor("document.querySelector('.blocks .block-figure img')?.naturalWidth > 0"));
      assert.ok(await b.waitText('Texte piégé'));
      assert.equal(await b.ev('window.__xss'), undefined, 'nothing planted in the database can run');
      const kinds = await b.ev("[...document.querySelectorAll('.blocks > *')].map(e => e.className.split(' ')[0])");
      assert.ok(kinds.includes('block-code') && kinds.includes('block-table') && kinds.includes('block-callout') && kinds.includes('block-resources'), kinds.join());
    });

    test('code stays left to right even in an Arabic page, and nothing overflows on a phone', async () => {
      await b.ev("localStorage.setItem('lang', 'ar')");
      await b.setViewport(375, 800);
      await b.goto(`${site.url}/catalogue/${slug}/cours/${lessonId}`);
      assert.ok(await b.waitFor("!!document.querySelector('.block-code pre')"));
      assert.equal(await b.ev('document.documentElement.dir'), 'rtl');
      assert.equal(await b.ev("getComputedStyle(document.querySelector('.block-code pre')).direction"), 'ltr');
      assert.ok(await b.ev('document.documentElement.scrollWidth <= window.innerWidth'), 'no horizontal scroll');
    });

    test('a learner cannot use the editor routes', async () => {
      const res = await b.fetch(`/api/admin/courses/${lessonId}/blocks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'quote', data: { text: 'x' } }) });
      assert.equal(res.status, 403);
    });
  });

  test('no JavaScript error during the whole journey', () => {
    assert.deepEqual(b.jsErrors, []);
  });
});

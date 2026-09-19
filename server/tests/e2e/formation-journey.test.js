import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { MP4, PDF, makePng } from '../helpers/fixtures.js';
import { SERVER_DIR } from '../helpers/env.js';
import { boot } from '../helpers/server.js';

// PHASE 2 in a real browser: the client builds a formation in the administration
// (real uploads), a learner signs up, follows it and is certified, and the
// protections are attacked from inside the page. Only the administrator account
// is prepared; everything else goes through the real forms.

const bcrypt = createRequire(import.meta.url)('bcryptjs');
const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const PASSWORD = 'Passw0rd!test';

describe('formation: from the client to a certified learner', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let files;
  let formationId;
  let slug;
  let lessons;
  let learnerEmail;
  let certificateNumber;

  before(async () => {
    t = await boot();
    await t.reset();
    await t.admin({ name: 'Cliente Formatrice', email: 'formatrice@example.com', passwordHash: await bcrypt.hash(PASSWORD, 10) });
    site = await startSite(t.baseUrl);
    b = await Browser.launch();
    const dir = mkdtempSync(path.join(tmpdir(), 'larbi-e2e-files-'));
    files = { cover: path.join(dir, 'couverture.png'), pdf: path.join(dir, 'support.pdf'), mp4: path.join(dir, 'demo.mp4'), fake: path.join(dir, 'faux.png') };
    writeFileSync(files.cover, makePng(640, 360));
    writeFileSync(files.pdf, PDF);
    writeFileSync(files.mp4, MP4);
    writeFileSync(files.fake, 'ceci est du texte, pas une image');
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  const signIn = async (email) => {
    await b.goto(`${site.url}/connexion`);
    await b.waitFor("!!document.querySelector('#email')");
    await b.type('#email', email);
    await b.type('#password', PASSWORD);
    await b.click(fr.auth.login.submit);
    return b.waitFor("location.pathname !== '/connexion'");
  };
  const register = async (name, email) => {
    await b.goto(`${site.url}/inscription`);
    await b.waitFor("!!document.querySelector('#name') && document.querySelector('#accountType').options.length > 0");
    await b.type('#name', name);
    await b.type('#email', email);
    await b.type('#password', PASSWORD);
    await b.click(fr.auth.register.submit);
    return b.waitFor("location.pathname !== '/inscription'");
  };

  describe('1. the client creates the formation (administration)', () => {
    test('title alone creates it; an empty title is refused in plain language', async () => {
      assert.ok(await signIn('formatrice@example.com'));
      await b.goto(`${site.url}/admin/formations`);
      await b.waitText(fr.admin.list.new);
      await b.click(fr.admin.list.new);
      await b.waitFor("!!document.querySelector('#new-content-title')");
      await b.click(fr.admin.newDialog.create);
      assert.ok(await b.waitText(fr.admin.newDialog.required));
      await b.type('#new-content-title', 'Comptabilité pour indépendants');
      await b.click(fr.admin.newDialog.create);
      assert.ok(await b.waitFor('/^\\/admin\\/formations\\/[0-9a-f-]{36}$/.test(location.pathname)'));
      formationId = await b.ev("location.pathname.split('/').pop()");
    });

    test('information, a category made on the spot, a refused fake image, the real cover', async () => {
      await b.waitFor("!!document.querySelector('#f-description')");
      await b.type('#f-description', 'Apprenez les bases de la comptabilité : factures, TVA, déclarations.');
      await b.click(fr.admin.info.categoryNew);
      await b.waitFor(`!!document.querySelector('input[aria-label=${JSON.stringify(fr.admin.info.categoryNewLabel)}]')`);
      await b.type(`input[aria-label=${JSON.stringify(fr.admin.info.categoryNewLabel)}]`, 'Gestion');
      await b.click(fr.admin.info.categoryAdd);
      assert.ok(await b.waitFor("[...document.querySelectorAll('#f-category option')].some(o => o.textContent === 'Gestion')"));
      await b.setFiles('input[type=file]', files.fake);
      assert.ok(await b.waitFor("!!document.querySelector('.cms-upload [role=alert]')"));
      assert.doesNotMatch(await b.ev("document.querySelector('.cms-upload [role=alert]').innerText"), /415|MIME|multipart|500|undefined/i);
      await b.setFiles('input[type=file]', files.cover);
      assert.ok(await b.waitFor("!!document.querySelector('.cms-image-preview img') && document.querySelector('.cms-image-preview img').naturalWidth > 0"));
      assert.ok(await b.waitText(fr.admin.save.dirty));
      await b.click(fr.admin.save.button);
      assert.ok(await b.waitText(fr.admin.save.saved));
    });

    test('three courses (rich text, files, one optional), reordered with the arrows', async () => {
      await b.clickTab(fr.admin.steps.courses);
      await b.waitFor("!!document.querySelector('#new-course-title')");
      const specs = [
        { title: 'Introduction à la comptabilité', text: 'Bienvenue dans ce premier cours.', required: true, upload: [files.mp4, files.pdf] },
        { title: 'Facturer et déclarer la TVA', text: 'Ce deuxième cours explique la facture.', required: true, upload: [] },
        { title: 'Pour aller plus loin', text: 'Un cours bonus.', required: false, upload: [] },
      ];
      for (const [n, spec] of specs.entries()) {
        await b.type('#new-course-title', spec.title);
        await b.click(fr.admin.courses.add);
        assert.ok(await b.waitFor(`document.querySelectorAll('.cms-course').length === ${n + 1} && document.querySelectorAll('.cms-course')[${n}].classList.contains('open') && document.querySelectorAll('.cms-course.open').length === 1`), `card ${n + 1} open`);
        await b.ev("document.querySelector('.cms-course.open .cms-rte-content').focus()");
        await b.send('Input.insertText', { text: spec.text });
        if (!spec.required) await b.ev("document.querySelector('.cms-course.open .cms-check input[type=checkbox]').click()");
        for (const file of spec.upload) {
          await b.setFiles('.cms-course.open input[type=file]', file);
          const name = path.basename(file);
          assert.ok(await b.waitFor(`document.querySelector('.cms-course.open').innerText.includes(${JSON.stringify(name)})`), name);
        }
        await b.click(fr.admin.course.save);
        assert.ok(await b.waitText(fr.admin.course.saved));
        await new Promise((r) => setTimeout(r, 300));
      }
      const order = async () => (await t.prisma.course.findMany({ where: { formationId }, orderBy: { position: 'asc' } })).map((c) => c.title.split(' ')[0]);
      assert.deepEqual(await order(), ['Introduction', 'Facturer', 'Pour']);
      await b.ev(`document.querySelectorAll('.cms-course')[1].querySelector('[aria-label=${JSON.stringify(fr.admin.courses.moveUp)}]').click()`);
      await new Promise((r) => setTimeout(r, 1000));
      assert.deepEqual(await order(), ['Facturer', 'Introduction', 'Pour']);
      await b.ev(`document.querySelectorAll('.cms-course')[1].querySelector('[aria-label=${JSON.stringify(fr.admin.courses.moveUp)}]').click()`);
      await new Promise((r) => setTimeout(r, 1000));
      assert.deepEqual(await order(), ['Introduction', 'Facturer', 'Pour']);
      const first = await t.prisma.course.findFirst({ where: { formationId, position: 0 }, include: { media: true } });
      assert.equal(first.media.length, 2);
      assert.match(first.body, /Bienvenue/);
    });

    test('certification, publication checklist, publication', async () => {
      await b.clickTab(fr.admin.steps.certification);
      await b.waitFor("!!document.querySelector('#c-name')");
      await b.type('#c-name', 'Certificat de comptabilité de base');
      await b.click(fr.admin.save.button);
      await b.waitText(fr.admin.save.saved);
      await b.clickTab(fr.admin.steps.publish);
      assert.ok(await b.waitText(fr.admin.publish.allDone));
      await b.click(fr.admin.publish.publish);
      assert.ok(await b.waitText(fr.admin.publish.published));
      const row = await t.prisma.formation.findUnique({ where: { id: formationId } });
      assert.equal(row.status, 'published');
      slug = row.slug;
      lessons = await t.prisma.course.findMany({ where: { formationId }, orderBy: { position: 'asc' }, include: { media: true } });
    });

    test('an incomplete formation cannot be published: the button is off, and the server refuses a forced call', async () => {
      await b.goto(`${site.url}/admin/formations`);
      await b.waitText(fr.admin.list.new);
      await b.click(fr.admin.list.new);
      await b.waitFor("!!document.querySelector('#new-content-title')");
      await b.type('#new-content-title', 'Brouillon secret');
      await b.click(fr.admin.newDialog.create);
      await b.waitFor('/^\\/admin\\/formations\\/[0-9a-f-]{36}$/.test(location.pathname)');
      const draftId = await b.ev("location.pathname.split('/').pop()");
      await b.clickTab(fr.admin.steps.publish);
      await b.waitText(fr.admin.publish.publish);
      assert.equal(await b.ev(`[...document.querySelectorAll('button')].find(x => x.textContent.trim() === ${JSON.stringify(fr.admin.publish.publish)}).disabled`), true);
      assert.equal((await b.fetch(`/api/admin/formations/${draftId}/publish`, { method: 'POST' })).status, 422);
      assert.equal((await t.prisma.formation.findUnique({ where: { id: draftId } })).status, 'draft');
    });
  });

  describe('2. a learner follows it', () => {
    test('signs up through the form (a plain account) and sees the published formation, not the draft', async () => {
      await b.clearCookies();
      learnerEmail = 'lea@example.com';
      assert.ok(await register('Léa Apprenante', learnerEmail));
      const lea = await t.prisma.user.findUnique({ where: { email: learnerEmail } });
      assert.deepEqual([lea.role, lea.accessLevel], ['user', 'standard']);
      await b.goto(`${site.url}/catalogue`);
      assert.ok(await b.waitText('Comptabilité pour indépendants'));
      assert.ok(!(await b.text()).includes('Brouillon secret'));
      assert.ok(await b.waitFor("[...document.querySelectorAll('.learn-card img')].some(i => i.naturalWidth > 0)"), 'the cover loads through the authorised route');
    });

    test('enrols, reads lesson 1: text, the video stream and the PDF are served to the enrolled learner', async () => {
      await b.goto(`${site.url}/catalogue/${slug}`);
      await b.waitText(fr.learn.detail.enroll);
      await b.click(fr.learn.detail.enroll);
      assert.ok(await b.waitText(fr.learn.detail.start));
      await b.goto(`${site.url}/catalogue/${slug}/cours/${lessons[0].id}`);
      assert.ok(await b.waitText('Bienvenue dans ce premier cours'));
      assert.ok(await b.waitFor("!!document.querySelector('video') && document.querySelector('video').src.includes('/api/learn/media/')"));
      await new Promise((r) => setTimeout(r, 800));
      assert.ok(b.responses.some((r) => /^(200|206) \/api\/learn\/media\//.test(r)), 'the video request succeeded with the learner session');
      const pdf = await b.fetch(await b.ev("document.querySelector('a.learn-doc').getAttribute('href')"));
      assert.deepEqual([pdf.status, /attachment/.test(pdf.disposition ?? '')], [200, true]);
      assert.equal((await t.prisma.courseProgress.findFirst({ where: { courseId: lessons[0].id } })).status, 'in_progress', 'the SERVER recorded the opening');
      await b.shot('formation-lesson');
    });

    test('progress is kept by the server, not the browser: cleared cookies and storage, progress comes back', async () => {
      await b.click(fr.learn.course.markDone);
      assert.ok(await b.waitText('33%'));
      assert.equal((await t.prisma.courseProgress.findFirst({ where: { courseId: lessons[0].id } })).status, 'completed');
      assert.equal(await t.prisma.certification.count(), 0, 'no certificate after 1 of 2 required lessons');
      await b.clearCookies();
      await b.ev('localStorage.clear(); sessionStorage.clear()');
      assert.ok(await signIn(learnerEmail));
      await b.goto(`${site.url}/catalogue/${slug}`);
      assert.ok(await b.waitFor(`${b.hasText('33%')} && ${b.hasText('1 sur 3')}`));
    });

    test('the last required lesson issues exactly one certificate; the optional one is not needed', async () => {
      await b.goto(`${site.url}/catalogue/${slug}/cours/${lessons[1].id}`);
      await b.waitText(fr.learn.course.markDone);
      await b.click(fr.learn.course.markDone);
      assert.ok(await b.waitText(fr.learn.course.certificateReady));
      const cert = await t.prisma.certification.findFirst();
      assert.equal(await t.prisma.certification.count(), 1);
      assert.deepEqual([cert.holderName, cert.certificationTitle], ['Léa Apprenante', 'Certificat de comptabilité de base']);
      assert.equal((await b.fetch(`/api/learn/formations/${slug}/courses/${lessons[1].id}/completion`, { method: 'DELETE' })).status, 409, 'cannot be un-validated once certified');
      certificateNumber = cert.certificateNumber;
      await b.clickContaining(fr.learn.certification.view);
      assert.ok(await b.waitFor(`${b.hasText('Léa Apprenante')} && ${b.hasText(certificateNumber)}`));
      await b.shot('formation-certificate');
    });
  });

  describe('3. protections, from inside the page', () => {
    test('anonymous: no video, no cover, no lesson page; the storage folder is not served', async () => {
      await b.clearCookies();
      await b.goto(site.url);
      const video = lessons[0].media.find((m) => m.kind === 'video');
      const media = await b.fetch(`/api/learn/media/${video.id}`);
      assert.equal(media.status, 401);
      assert.match(media.type, /json/, 'an error message, never the file');
      assert.equal((await b.fetch(`/api/learn/formations/${slug}/cover`, { cache: 'no-store' })).status, 401);
      await b.goto(`${site.url}/catalogue/${slug}/cours/${lessons[0].id}`);
      assert.ok(await b.waitFor("location.pathname === '/connexion'"), 'sent to the sign-in page');
      const stored = await b.fetch(`/storage/private/${video.storageKey}`);
      assert.ok(stored.type !== 'video/mp4' && !(stored.head[4] === 0x66), 'the storage folder is not served');
      assert.equal((await fetch(`${t.baseUrl}/storage/private/${video.storageKey}`)).status, 404);
    });

    test('a signed-in stranger (not enrolled): 403 with a clear message, no player, no certificate of others', async () => {
      assert.ok(await register('Omar Extérieur', 'omar@example.com'));
      const video = lessons[0].media.find((m) => m.kind === 'video');
      const denied = await b.fetch(`/api/learn/media/${video.id}`);
      assert.equal(denied.status, 403);
      assert.match(denied.type, /json/);
      await b.goto(`${site.url}/catalogue/${slug}/cours/${lessons[0].id}`);
      assert.ok(await b.waitText(fr.learn.course.notEnrolled));
      assert.equal(await b.ev("!document.querySelector('video')"), true);
      assert.equal((await b.fetch(`/api/learn/formations/${slug}/certificate`)).status, 404);
      await b.shot('formation-stranger');
    });

    test('a non-administrator: "access denied" in the interface AND 403 on the API, nothing changed', async () => {
      await b.goto(`${site.url}/admin/formations`);
      assert.ok(await b.waitText(fr.forbidden.title));
      const video = lessons[0].media.find((m) => m.kind === 'video');
      for (const [method, url] of [['GET', '/api/admin/formations'], ['POST', `/api/admin/formations/${formationId}/unpublish`], ['DELETE', `/api/admin/formations/${formationId}`], ['GET', `/api/admin/media/${video.id}/file`], ['PATCH', `/api/admin/formations/${formationId}`]]) {
        const res = await b.fetch(url, { method, headers: { 'Content-Type': 'application/json' }, ...(method === 'PATCH' ? { body: JSON.stringify({ title: 'hacked' }) } : {}) });
        assert.equal(res.status, 403, `${method} ${url}`);
      }
      const row = await t.prisma.formation.findUnique({ where: { id: formationId } });
      assert.deepEqual([row.title, row.status], ['Comptabilité pour indépendants', 'published']);
    });

    test('the certificate can be verified by anyone, without an account', async () => {
      await b.clearCookies();
      await b.goto(`${site.url}/verification/${certificateNumber}`);
      assert.ok(await b.waitText(fr.verify.valid));
      assert.ok((await b.text()).includes('Léa Apprenante'));
      assert.ok(!(await b.text()).includes('@example.com'));
    });

    test('no JavaScript error, and no HTTP error other than the refusals provoked on purpose', () => {
      assert.deepEqual(b.jsErrors, []);
      const provoked = [/\/api\/auth\/me$/, /\/api\/admin\//, /\/api\/learn\//, /\/storage\/private\//];
      assert.deepEqual(b.badResponses.filter((r) => !provoked.some((re) => re.test(r))), []);
    });
  });
});

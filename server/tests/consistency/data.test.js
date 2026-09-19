import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { MP4, PDF, PNG, fileForm } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';
import { checkConsistency, privateDirOf } from '../../src/services/consistency.service.js';

// GLOBAL consistency: a realistic history is produced through the API (creation,
// edits, publication, learning, certificates, deletions), then the rules that
// span the whole system must hold. Negative controls prove the checker is not
// vacuous: each kind of inconsistency, injected by hand, must be detected.

let t;
let admin;
const check = () => checkConsistency(t.prisma, { privateDir: privateDirOf(t.storageDir) });
const rules = async () => (await check()).map((p) => p.rule);
const api = (method, path, opts) => t.request(method, path, { user: admin, ...opts });
const upload = (path, bytes, opts) => api('POST', path, { form: fileForm(bytes, opts) });

before(async () => {
  t = await boot();
  await t.reset();
  admin = await t.admin();
});
after(() => t.close());

describe('a realistic history leaves the system consistent', () => {
  test('formations, learning and certificates', async () => {
    // A formation built the way the client does it.
    const f = (await api('POST', '/admin/formations', { json: { title: 'Comptabilité' } })).body.formation;
    await api('PATCH', `/admin/formations/${f.id}`, { json: { description: 'Desc', certificationTitle: 'Certificat' } });
    await upload(`/admin/formations/${f.id}/cover`, PNG);
    await upload(`/admin/formations/${f.id}/cover`, PNG, { name: 'remplacée.png' }); // replaced cover
    const c1 = (await api('POST', `/admin/formations/${f.id}/courses`, { json: { title: 'Un' } })).body.course;
    const c2 = (await api('POST', `/admin/formations/${f.id}/courses`, { json: { title: 'Deux' } })).body.course;
    const c3 = (await api('POST', `/admin/formations/${f.id}/courses`, { json: { title: 'Trois' } })).body.course;
    for (const c of [c1, c2, c3]) await api('PATCH', `/admin/courses/${c.id}`, { json: { body: '<p>Contenu <strong>riche</strong> &amp; propre</p>' } });
    await api('PATCH', `/admin/courses/${c3.id}`, { json: { isRequired: false } });
    await upload(`/admin/courses/${c1.id}/media`, MP4, { name: 'v.mp4', type: 'video/mp4' });
    const doc = (await upload(`/admin/courses/${c2.id}/media`, PDF, { name: 'd.pdf', type: 'application/pdf' })).body.media;
    await api('DELETE', `/admin/media/${doc.id}`); // a removed file
    await api('PUT', `/admin/formations/${f.id}/courses/order`, { json: { courseIds: [c2.id, c1.id, c3.id] } });
    await api('DELETE', `/admin/courses/${c3.id}`); // a removed course closes the gap
    assert.equal((await api('POST', `/admin/formations/${f.id}/publish`)).status, 200);
    const slug = (await t.prisma.formation.findUnique({ where: { id: f.id } })).slug;

    // Learners: one finishes (certificate), one stops halfway, one leaves the platform.
    const done = await t.user({ name: 'Finisseur' });
    const half = await t.user();
    const gone = await t.user();
    for (const u of [done, half, gone]) await t.request('POST', `/learn/formations/${slug}/enroll`, { user: u });
    const courses = (await t.request('GET', `/learn/formations/${slug}`, { user: done })).body.formation.courses;
    for (const c of courses) {
      await t.request('GET', `/learn/formations/${slug}/courses/${c.id}`, { user: done });
      await t.request('PUT', `/learn/formations/${slug}/courses/${c.id}/completion`, { user: done });
    }
    await t.request('GET', `/learn/formations/${slug}/courses/${courses[0].id}`, { user: half });
    await t.request('PUT', `/learn/formations/${slug}/courses/${courses[0].id}/completion`, { user: half });
    await t.request('GET', `/learn/formations/${slug}/courses/${courses[0].id}`, { user: gone });
    await t.prisma.user.delete({ where: { id: gone.id } });
    // A required course added later: the finisher keeps their certificate and completed status.
    await api('POST', `/admin/formations/${f.id}/courses`, { json: { title: 'Ajouté plus tard' } });

    assert.equal(await t.prisma.certification.count(), 1);
    assert.deepEqual(await check(), []);
  });

  test('articles, keywords, files, unpublication and deletion', async () => {
    const make = async (title, body) => {
      const a = (await api('POST', '/admin/articles', { json: { title } })).body.article;
      await api('PATCH', `/admin/articles/${a.id}`, { json: { excerpt: 'Résumé', body, tags: ['TVA', 'Facture'] } });
      await upload(`/admin/articles/${a.id}/cover`, PNG);
      await upload(`/admin/articles/${a.id}/media`, PDF, { name: 'g.pdf', type: 'application/pdf' });
      return a;
    };
    const one = await make('R&D et TVA', '<h2>Titre</h2><p>Le service R&amp;D <em>recrute</em></p><ul><li>a</li><li>b</li></ul>');
    const two = await make('Autre', '<p>Texte</p><script>alert(1)</script><p>suite</p>');
    const three = await make('À supprimer', '<p>x</p>');
    for (const a of [one, two, three]) await api('POST', `/admin/articles/${a.id}/publish`);
    await api('PATCH', `/admin/articles/${one.id}`, { json: { title: 'Titre modifié', body: '<p>Nouveau texte</p>', tags: ['Compta'] } }); // edit while published
    await api('POST', `/admin/articles/${two.id}/unpublish`);
    await upload(`/admin/articles/${two.id}/cover`, PNG, { name: 'nouvelle.png' }); // cover replaced
    await api('DELETE', `/admin/articles/${three.id}`);
    assert.deepEqual(await check(), []);
  });
});

describe('the checker detects what it should (negative controls)', () => {
  const storedKey = async () => (await t.prisma.media.findFirst()).storageKey;
  const file = (key) => path.join(privateDirOf(t.storageDir), key);

  test('a file that vanished from disk', async () => {
    const key = await storedKey();
    const bytes = (await import('node:fs')).readFileSync(file(key));
    unlinkSync(file(key));
    assert.ok((await rules()).includes('every media row has its file on disk'));
    writeFileSync(file(key), bytes);
    assert.deepEqual(await check(), []);
  });

  test('a stray file nobody references', async () => {
    writeFileSync(file(`${'0'.repeat(32)}.png`), PNG);
    assert.ok((await rules()).includes('every stored file is referenced by a media row'));
    unlinkSync(file(`${'0'.repeat(32)}.png`));
    assert.deepEqual(await check(), []);
  });

  test('a media row that belongs to nothing', async () => {
    const orphan = await t.prisma.media.create({ data: { kind: 'image', storageKey: `${'1'.repeat(32)}.png`, originalName: 'x.png', mimeType: 'image/png', sizeBytes: 1 } });
    writeFileSync(file(orphan.storageKey), PNG);
    assert.ok((await rules()).includes('every file has an owner'));
    await t.prisma.media.delete({ where: { id: orphan.id } });
    unlinkSync(file(orphan.storageKey));
    assert.deepEqual(await check(), []);
  });

  test('stored HTML that was never sanitised (written around the API)', async () => {
    const a = await t.article({ title: 'Direct', body: '<p>ok</p><script>alert(1)</script>' });
    assert.ok((await rules()).includes('stored article HTML is already sanitised'));
    const f = await t.formation({ courses: [{ title: 'X', body: '<p>ok</p><img src=x onerror=alert(1)>' }] });
    assert.ok((await rules()).includes('stored lesson HTML is already sanitised'));
    await t.prisma.article.delete({ where: { id: a.id } });
    await t.prisma.formation.delete({ where: { id: f.id } });
    assert.deepEqual(await check(), []);
  });

  test('a plain-text copy that no longer matches the article body', async () => {
    const a = await t.article({ title: 'Copie', body: '<p>Bonjour</p>' });
    await t.prisma.article.update({ where: { id: a.id }, data: { bodyText: 'autre chose' } });
    assert.ok((await rules()).includes('article plain text matches its body'));
    await t.prisma.article.delete({ where: { id: a.id } });
    assert.deepEqual(await check(), []);
  });

  test('a completed enrolment that lacks a required course (progress deleted behind the API)', async () => {
    const f = await t.formation({ courses: [{ title: 'A' }, { title: 'B' }] });
    const u = await t.user();
    await t.prisma.course.updateMany({ where: { formationId: f.id }, data: { createdAt: new Date(Date.now() - 86_400_000) } });
    const e = await t.prisma.enrollment.create({ data: { userId: u.id, formationId: f.id, status: 'completed', completedAt: new Date() } });
    await t.prisma.courseProgress.create({ data: { enrollmentId: e.id, courseId: f.courses[0].id, formationId: f.id, status: 'completed', completedAt: new Date() } });
    assert.ok((await rules()).includes('a completed enrolment has every required course completed'));
    await t.prisma.enrollment.delete({ where: { id: e.id } });
    await t.prisma.formation.delete({ where: { id: f.id } });
    assert.deepEqual(await check(), []);
  });

  test('a certificate for an enrolment that is not completed, and a malformed number', async () => {
    const f = await t.formation();
    const u = await t.user();
    const e = await t.prisma.enrollment.create({ data: { userId: u.id, formationId: f.id } });
    const c = await t.prisma.certification.create({ data: { certificateNumber: 'pas-un-numero', enrollmentId: e.id, holderName: ' ', formationTitle: 'F' } });
    const found = await rules();
    for (const rule of ['a certificate exists only for a completed enrolment', 'certificate numbers are well formed', 'a certificate carries its holder and formation names']) assert.ok(found.includes(rule), rule);
    await t.prisma.certification.delete({ where: { id: c.id } });
    await t.prisma.enrollment.delete({ where: { id: e.id } });
    await t.prisma.formation.delete({ where: { id: f.id } });
    assert.deepEqual(await check(), []);
  });

  test('a hole in the order of the courses', async () => {
    const f = await t.formation({ courses: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] });
    await t.prisma.course.update({ where: { id: f.courses[1].id }, data: { position: 7 } });
    assert.ok((await rules()).includes('the courses of a formation are numbered 0..n-1 without gap or duplicate'));
    await t.prisma.formation.delete({ where: { id: f.id } });
    assert.deepEqual(await check(), []);
  });

  test('an e-mail address stored with capitals', async () => {
    const u = await t.user();
    await t.prisma.user.update({ where: { id: u.id }, data: { email: 'MAJUSCULES@Example.com' } });
    assert.ok((await rules()).includes('e-mail addresses are stored lower-case and trimmed'));
    await t.prisma.user.update({ where: { id: u.id }, data: { email: 'majuscules@example.com' } });
    assert.deepEqual(await check(), []);
  });
});

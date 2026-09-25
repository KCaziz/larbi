import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P2-03 / P2-04 / P2-05 — catalogue, enrolment, progress, completion, certificate.

let t;
before(async () => {
  t = await boot();
  await t.reset();
});
after(() => t.close());

const NUMBER = /^LARBI-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
const slugOf = (f) => f.slug;
const get = (path, user) => t.request('GET', `/learn${path}`, { user });
const enroll = (f, user) => t.request('POST', `/learn/formations/${f.slug}/enroll`, { user });
const open = (f, course, user) => get(`/formations/${f.slug}/courses/${course.id}`, user);
const complete = (f, course, user) => t.request('PUT', `/learn/formations/${f.slug}/courses/${course.id}/completion`, { user });
const undo = (f, course, user) => t.request('DELETE', `/learn/formations/${f.slug}/courses/${course.id}/completion`, { user });
async function finish(f, user, only = f.courses) {
  for (const c of only) {
    await open(f, c, user);
    const res = await complete(f, c, user);
    assert.equal(res.status, 200);
  }
}

describe('catalogue', () => {
  test('lists PUBLISHED formations only, with access and enrolment state per account', async () => {
    const std = await t.user();
    const prem = await t.user({ accessLevel: 'premium' });
    const open1 = await t.formation({ title: 'Ouverte' });
    const locked = await t.formation({ title: 'Premium', requiredAccessLevel: 'premium' });
    await t.formation({ title: 'Brouillon', status: 'draft' });
    const asStd = (await get('/formations', std)).body.formations;
    assert.deepEqual(asStd.map((f) => f.title).sort(), ['Ouverte', 'Premium']);
    assert.equal(asStd.find((f) => f.title === 'Premium').accessible, false);
    assert.equal(asStd.find((f) => f.title === 'Ouverte').accessible, true);
    assert.equal((await get('/formations', prem)).body.formations.find((f) => f.title === 'Premium').accessible, true);
    assert.equal(asStd.find((f) => f.title === 'Ouverte').enrollment, null);
    assert.ok(open1 && locked);
  });

  test('the detail shows the programme WITHOUT any lesson content or file; a draft is unknown (404)', async () => {
    const u = await t.user();
    const f = await t.formation({ title: 'Détail', courses: [{ title: 'A', body: '<p>SECRET</p>' }] });
    const res = await get(`/formations/${slugOf(f)}`, u);
    assert.equal(res.status, 200);
    assert.deepEqual(Object.keys(res.body.formation.courses[0]).sort(), ['estimatedMinutes', 'id', 'isRequired', 'position', 'summary', 'title']);
    assert.ok(!res.text.includes('SECRET'));
    assert.equal(res.body.formation.canEnroll, true);
    const draft = await t.formation({ title: 'Caché', status: 'draft' });
    assert.equal((await get(`/formations/${slugOf(draft)}`, u)).status, 404);
  });
});

describe('enrolment', () => {
  test('enrolling is idempotent; premium formations refuse standard accounts; drafts cannot be joined', async () => {
    const u = await t.user();
    const f = await t.formation();
    assert.equal((await enroll(f, u)).status, 201);
    assert.equal((await enroll(f, u)).status, 200);
    assert.equal(await t.prisma.enrollment.count({ where: { userId: u.id, formationId: f.id } }), 1);
    const prem = await t.formation({ requiredAccessLevel: 'premium' });
    const refused = await enroll(prem, u);
    assert.equal(refused.status, 403);
    assert.equal(refused.body.error.details.reason, 'premium_required');
    const draft = await t.formation({ status: 'draft' });
    assert.equal((await enroll(draft, u)).status, 404);
  });

  test('five simultaneous clicks create ONE enrolment', async () => {
    const u = await t.user();
    const f = await t.formation();
    const results = await Promise.all(Array.from({ length: 5 }, () => enroll(f, u)));
    assert.ok(results.every((r) => [200, 201].includes(r.status)));
    assert.equal(await t.prisma.enrollment.count({ where: { userId: u.id, formationId: f.id } }), 1);
  });

  test('lessons are readable only when enrolled (403 not_enrolled), and only their own formation', async () => {
    const u = await t.user();
    const f = await t.formation({ courses: [{ title: 'A', body: '<p>Contenu</p>' }] });
    const other = await t.formation();
    const denied = await open(f, f.courses[0], u);
    assert.equal(denied.status, 403);
    assert.equal(denied.body.error.details.reason, 'not_enrolled');
    await enroll(f, u);
    const ok = await open(f, f.courses[0], u);
    assert.equal(ok.status, 200);
    assert.match(ok.body.course.body, /Contenu/);
    assert.equal((await open(f, other.courses[0], u)).status, 404, 'a lesson of another formation');
  });

  test('losing the premium level removes access at once; getting it back restores it', async () => {
    const u = await t.user({ accessLevel: 'premium' });
    const f = await t.formation({ requiredAccessLevel: 'premium' });
    await enroll(f, u);
    assert.equal((await open(f, f.courses[0], u)).status, 200);
    await t.prisma.user.update({ where: { id: u.id }, data: { accessLevel: 'standard' } });
    const res = await open(f, f.courses[0], u);
    assert.equal(res.status, 403);
    assert.equal(res.body.error.details.reason, 'premium_required');
    await t.prisma.user.update({ where: { id: u.id }, data: { accessLevel: 'premium' } });
    assert.equal((await open(f, f.courses[0], u)).status, 200);
  });

  test('an unpublished formation stays readable for those already enrolled, and closed to newcomers', async () => {
    const u = await t.user();
    const later = await t.user();
    const f = await t.formation();
    await enroll(f, u);
    await t.prisma.formation.update({ where: { id: f.id }, data: { status: 'draft', publishedAt: null } });
    assert.equal((await open(f, f.courses[0], u)).status, 200);
    assert.equal((await enroll(f, later)).status, 404);
    assert.ok(!(await get('/formations', u)).body.formations.some((x) => x.slug === f.slug), 'no longer in the catalogue');
    assert.ok((await get('/enrollments', u)).body.formations.some((x) => x.slug === f.slug), 'still in "my formations"');
  });
});

describe('progress', () => {
  test('a lesson must be opened before it can be validated (409 not_opened)', async () => {
    const u = await t.user();
    const f = await t.formation({ courses: [{ title: 'A' }, { title: 'B' }] });
    await enroll(f, u);
    const early = await complete(f, f.courses[0], u);
    assert.equal(early.status, 409);
    assert.equal(early.body.error.details.reason, 'not_opened');
    assert.equal(await t.prisma.courseProgress.count({ where: { enrollment: { userId: u.id } } }), 0);
  });

  test('opening is recorded by the server, once; validation is idempotent; the percentage is computed by the server', async () => {
    const u = await t.user();
    const f = await t.formation({ courses: [{ title: 'A' }, { title: 'B' }, { title: 'C', isRequired: false }] });
    await enroll(f, u);
    await open(f, f.courses[0], u);
    await open(f, f.courses[0], u);
    assert.equal(await t.prisma.courseProgress.count({ where: { enrollment: { userId: u.id } } }), 1);
    const first = await complete(f, f.courses[0], u);
    assert.deepEqual(
      { completed: first.body.enrollment.progress.completed, total: first.body.enrollment.progress.total, percent: first.body.enrollment.progress.percent, remaining: first.body.enrollment.progress.requiredRemaining },
      { completed: 1, total: 3, percent: 33, remaining: 1 },
    );
    assert.equal((await complete(f, f.courses[0], u)).body.enrollment.progress.completed, 1);
  });

  test('a lesson can be un-validated until a certificate exists', async () => {
    const u = await t.user();
    const f = await t.formation({ certificationEnabled: false, courses: [{ title: 'A' }, { title: 'B' }] });
    await enroll(f, u);
    await finish(f, u);
    assert.equal((await t.prisma.enrollment.findFirst({ where: { userId: u.id } })).status, 'completed');
    const res = await undo(f, f.courses[1], u);
    assert.equal(res.status, 200);
    assert.equal(res.body.enrollment.status, 'active');
    assert.equal((await t.prisma.enrollment.findFirst({ where: { userId: u.id } })).completedAt, null);
    assert.equal((await complete(f, f.courses[1], u)).body.enrollment.status, 'completed');
  });

  test('an optional lesson never blocks completion; un-validating one keeps the original completion date', async () => {
    const u = await t.user();
    const f = await t.formation({ certificationEnabled: false, courses: [{ title: 'A' }, { title: 'Bonus', isRequired: false }] });
    await enroll(f, u);
    await finish(f, u, [f.courses[0], f.courses[1]]);
    const before = (await t.prisma.enrollment.findFirst({ where: { userId: u.id } })).completedAt;
    await new Promise((r) => setTimeout(r, 25));
    await undo(f, f.courses[1], u);
    const after = await t.prisma.enrollment.findFirst({ where: { userId: u.id } });
    assert.equal(after.status, 'completed');
    assert.equal(after.completedAt.getTime(), before.getTime());
  });

  test('a formation made only of optional lessons is finished when ALL are done', async () => {
    const u = await t.user();
    const f = await t.formation({ certificationEnabled: false, courses: [{ title: 'A', isRequired: false }, { title: 'B', isRequired: false }] });
    await enroll(f, u);
    await finish(f, u, [f.courses[0]]);
    assert.equal((await t.prisma.enrollment.findFirst({ where: { userId: u.id } })).status, 'active');
    await finish(f, u, [f.courses[1]]);
    assert.equal((await t.prisma.enrollment.findFirst({ where: { userId: u.id } })).status, 'completed');
  });

  test('progress is private: another learner never sees or changes it', async () => {
    const a = await t.user();
    const b = await t.user();
    const f = await t.formation({ courses: [{ title: 'A' }, { title: 'B' }] });
    await enroll(f, a);
    await enroll(f, b);
    await finish(f, a, [f.courses[0]]);
    assert.equal((await get(`/formations/${f.slug}`, b)).body.formation.enrollment.progress.completed, 0);
    assert.equal(await t.prisma.courseProgress.count({ where: { enrollment: { userId: b.id } } }), 0);
  });

  test('two last validations at the same moment never lose the completion', async () => {
    const u = await t.user();
    const f = await t.formation({ certificationEnabled: false, courses: [{ title: 'A' }, { title: 'B' }] });
    await enroll(f, u);
    await open(f, f.courses[0], u);
    await open(f, f.courses[1], u);
    await Promise.all([complete(f, f.courses[0], u), complete(f, f.courses[1], u)]);
    assert.equal((await t.prisma.enrollment.findFirst({ where: { userId: u.id } })).status, 'completed');
  });
});

describe('certificate', () => {
  test('issued automatically with the LAST required lesson, never before, once', async () => {
    const u = await t.user({ name: 'Léa Apprenante' });
    const f = await t.formation({ title: 'Compta', courses: [{ title: 'A' }, { title: 'B' }, { title: 'Bonus', isRequired: false }] });
    await enroll(f, u);
    await finish(f, u, [f.courses[0]]);
    assert.equal(await t.prisma.certification.count({ where: { enrollment: { userId: u.id } } }), 0);
    await finish(f, u, [f.courses[1]]);
    const cert = await t.prisma.certification.findFirst({ where: { enrollment: { userId: u.id } } });
    assert.ok(cert);
    assert.match(cert.certificateNumber, NUMBER);
    assert.deepEqual([cert.holderName, cert.formationTitle, cert.certificationTitle], ['Léa Apprenante', 'Compta', 'Certificat Compta']);
    await complete(f, f.courses[1], u);
    assert.equal(await t.prisma.certification.count({ where: { enrollmentId: cert.enrollmentId } }), 1);
  });

  test('once certified, lessons can no longer be un-validated (409 certified)', async () => {
    const u = await t.user();
    const f = await t.formation({ courses: [{ title: 'A' }] });
    await enroll(f, u);
    await finish(f, u);
    const res = await undo(f, f.courses[0], u);
    assert.equal(res.status, 409);
    assert.equal(res.body.error.details.reason, 'certified');
  });

  test('two last validations at once issue exactly one certificate', async () => {
    const u = await t.user();
    const f = await t.formation({ courses: [{ title: 'A' }, { title: 'B' }] });
    await enroll(f, u);
    await open(f, f.courses[0], u);
    await open(f, f.courses[1], u);
    const res = await Promise.all([complete(f, f.courses[0], u), complete(f, f.courses[1], u)]);
    assert.ok(res.every((r) => r.status === 200));
    assert.equal(await t.prisma.certification.count({ where: { enrollment: { userId: u.id } } }), 1);
  });

  test('the owner reads it; nobody else does; the list shows only their own', async () => {
    const owner = await t.user();
    const stranger = await t.user();
    const f = await t.formation({ courses: [{ title: 'A' }] });
    await enroll(f, owner);
    await finish(f, owner);
    const mine = await get(`/formations/${f.slug}/certificate`, owner);
    assert.equal(mine.status, 200);
    assert.deepEqual(Object.keys(mine.body.certificate).sort(), ['certificateNumber', 'certificationTitle', 'formationTitle', 'holderName', 'issuedAt', 'revoked', 'revokedAt']);
    assert.equal((await get(`/formations/${f.slug}/certificate`, stranger)).status, 404);
    assert.equal((await get('/certificates', owner)).body.certificates.length, 1);
    assert.equal((await get('/certificates', stranger)).body.certificates.length, 0);
  });

  test('no certificate when the formation delivers none; it can be claimed once switched on', async () => {
    const u = await t.user();
    const f = await t.formation({ certificationEnabled: false, courses: [{ title: 'A' }] });
    await enroll(f, u);
    await finish(f, u);
    assert.equal(await t.prisma.certification.count({ where: { enrollment: { userId: u.id } } }), 0);
    const early = await t.request('POST', `/learn/formations/${f.slug}/certificate`, { user: u });
    assert.equal(early.status, 409);
    assert.equal(early.body.error.details.reason, 'certification_disabled');
    await t.prisma.formation.update({ where: { id: f.id }, data: { certificationEnabled: true, certificationTitle: 'Titre tardif' } });
    const claimed = await t.request('POST', `/learn/formations/${f.slug}/certificate`, { user: u });
    assert.equal(claimed.status, 201);
    assert.equal(claimed.body.certificate.certificationTitle, 'Titre tardif');
    assert.equal((await t.request('POST', `/learn/formations/${f.slug}/certificate`, { user: u })).status, 200, 'claiming again returns the same certificate');
  });

  test('claiming before finishing is refused (409 not_completed)', async () => {
    const u = await t.user();
    const f = await t.formation({ courses: [{ title: 'A' }, { title: 'B' }] });
    await enroll(f, u);
    await finish(f, u, [f.courses[0]]);
    const res = await t.request('POST', `/learn/formations/${f.slug}/certificate`, { user: u });
    assert.equal(res.status, 409);
    assert.equal(res.body.error.details.reason, 'not_completed');
  });

  test('the certificate stays identical if the account or the formation is renamed later', async () => {
    const u = await t.user({ name: 'Nom Initial' });
    const f = await t.formation({ title: 'Titre initial', courses: [{ title: 'A' }] });
    await enroll(f, u);
    await finish(f, u);
    const { certificateNumber } = await t.prisma.certification.findFirst({ where: { enrollment: { userId: u.id } } });
    await t.prisma.user.update({ where: { id: u.id }, data: { name: 'Nom Modifié' } });
    await t.prisma.formation.update({ where: { id: f.id }, data: { title: 'Titre modifié', certificationEnabled: false } });
    const check = await t.request('GET', `/certificates/${certificateNumber}`);
    assert.equal(check.status, 200);
    assert.deepEqual([check.body.certificate.holderName, check.body.certificate.formationTitle], ['Nom Initial', 'Titre initial']);
  });

  test('public verification: numbers are normalised, unknown or malformed ones answer the same 404, and it is never cached', async () => {
    const u = await t.user();
    const f = await t.formation({ courses: [{ title: 'A' }] });
    await enroll(f, u);
    await finish(f, u);
    const { certificateNumber } = await t.prisma.certification.findFirst({ where: { enrollment: { userId: u.id } } });
    const ok = await t.request('GET', `/certificates/${certificateNumber}`);
    assert.equal(ok.status, 200);
    assert.match(ok.headers.get('cache-control'), /no-store/);
    assert.ok(!ok.text.includes('@test.local'));
    assert.equal((await t.request('GET', `/certificates/${encodeURIComponent(`  ${certificateNumber.toLowerCase()} `)}`)).status, 200);
    const answers = [];
    for (const bad of ['LARBI-AAAA-BBBB-CCCC', 'abc', 'LARBI-0OI1-AAAA-BBBB', "'; DROP TABLE certifications;--", 'A'.repeat(500)]) {
      const res = await t.request('GET', `/certificates/${encodeURIComponent(bad)}`);
      assert.equal(res.status, 404, bad);
      answers.push(res.body.error.message);
    }
    assert.equal(new Set(answers).size, 1);
  });

  test('deleting the account erases the certificate: it can no longer be verified', async () => {
    const u = await t.user();
    const f = await t.formation({ courses: [{ title: 'A' }] });
    await enroll(f, u);
    await finish(f, u);
    const { certificateNumber } = await t.prisma.certification.findFirst({ where: { enrollment: { userId: u.id } } });
    await t.prisma.user.delete({ where: { id: u.id } });
    assert.equal((await t.request('GET', `/certificates/${certificateNumber}`)).status, 404);
  });

  test('a lesson added after the certificate does not revoke it; one added before claiming blocks the claim', async () => {
    const done = await t.user();
    const pending = await t.user();
    const f = await t.formation({ certificationEnabled: false, courses: [{ title: 'A' }] });
    await enroll(f, pending);
    await finish(f, pending);
    await t.prisma.formation.update({ where: { id: f.id }, data: { certificationEnabled: true, certificationTitle: 'Titre' } });
    await enroll(f, done);
    await finish(f, done);
    await t.prisma.course.create({ data: { formationId: f.id, title: 'Ajouté après', position: 9, isRequired: true, body: '<p>x</p>' } });
    assert.equal(await t.prisma.certification.count({ where: { enrollment: { userId: done.id } } }), 1, 'already issued: untouched');
    const res = await t.request('POST', `/learn/formations/${f.slug}/certificate`, { user: pending });
    assert.equal(res.status, 409, 'not yet issued: the new required lesson must be done first');
  });
});

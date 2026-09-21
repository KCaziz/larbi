import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P2-01 / P3-01 — the database itself refuses inconsistent data (CHECK, unique,
// foreign keys) and applies the deletion rules. Nothing goes through the API here.

let t;
before(async () => {
  t = await boot();
  await t.reset();
});
after(() => t.close());

const rejects = (promise, label) => assert.rejects(promise, undefined, label);
const key = () => `${Math.random().toString(16).slice(2).padEnd(32, '0').slice(0, 32)}.png`;
const media = (data = {}) => t.prisma.media.create({ data: { kind: 'image', storageKey: key(), originalName: 'x.png', mimeType: 'image/png', sizeBytes: 1, ...data } });

describe('value constraints', () => {
  test('users: role and access level are limited to the known values', async () => {
    await rejects(t.user({ role: 'superadmin' }), 'role');
    await rejects(t.user({ accessLevel: 'gold' }), 'accessLevel');
  });

  test('formations and articles: status is one of the known values and always agrees with the publication date', async () => {
    await rejects(t.prisma.formation.create({ data: { slug: t.unique('f'), title: 'x', description: '', status: 'deleted' } }), 'formation status');
    await rejects(t.prisma.formation.create({ data: { slug: t.unique('f'), title: 'x', description: '', status: 'archived', publishedAt: new Date() } }), 'archived with date');
    for (const status of ['draft', 'in_review', 'archived']) {
      await t.prisma.formation.create({ data: { slug: t.unique('f'), title: 'x', description: '', status } }); // accepted: no publication date
    }
    await rejects(t.prisma.formation.create({ data: { slug: t.unique('f'), title: 'x', description: '', status: 'published' } }), 'published without date');
    await rejects(t.prisma.formation.create({ data: { slug: t.unique('f'), title: 'x', description: '', status: 'draft', publishedAt: new Date() } }), 'draft with date');
    await rejects(t.article({ status: 'archived' }), 'article status');
    await rejects(t.prisma.article.create({ data: { slug: t.unique('a'), title: 'x', status: 'published' } }), 'article published without date');
    await rejects(t.prisma.article.create({ data: { slug: t.unique('a'), title: 'x', status: 'draft', publishedAt: new Date() } }), 'article draft with date');
    await rejects(t.prisma.article.create({ data: { slug: t.unique('a'), title: '   ' } }), 'blank title');
  });

  test('public addresses (slugs) can only be lower-case words joined by dashes', async () => {
    for (const slug of ['Upper', 'with space', 'a/b', '-lead', 'trail-', 'double--dash', 'é', '', 'x'.repeat(81), '../etc']) {
      await rejects(t.prisma.article.create({ data: { slug, title: 'x' } }), `article slug "${slug.slice(0, 12)}"`);
    }
    await rejects(t.prisma.articleCategory.create({ data: { slug: 'Bad Slug', name: 'x' } }), 'category slug');
    await rejects(t.prisma.tag.create({ data: { slug: 'Bad Slug', name: 'x' } }), 'tag slug');
    await t.prisma.article.create({ data: { slug: 'ok-slug-123', title: 'x' } });
  });

  test('slugs are unique', async () => {
    await t.prisma.article.create({ data: { slug: 'same-slug', title: 'a' } });
    await rejects(t.prisma.article.create({ data: { slug: 'same-slug', title: 'b' } }), 'duplicate slug');
  });

  test('media: known kinds, non-negative size, unique storage key, ONE owner at most', async () => {
    await rejects(media({ kind: 'executable' }), 'kind');
    await rejects(media({ sizeBytes: -1 }), 'size');
    const k = key();
    await media({ storageKey: k });
    await rejects(media({ storageKey: k }), 'duplicate storage key');
    const f = await t.formation();
    const a = await t.article();
    await rejects(media({ courseId: f.courses[0].id, articleId: a.id }), 'lesson AND article');
    await media({ courseId: f.courses[0].id });
    await media({ articleId: a.id });
  });

  test('enrolments: unique per account and formation; completed agrees with its date', async () => {
    const u = await t.user();
    const f = await t.formation();
    const e = await t.prisma.enrollment.create({ data: { userId: u.id, formationId: f.id } });
    await rejects(t.prisma.enrollment.create({ data: { userId: u.id, formationId: f.id } }), 'duplicate enrolment');
    await rejects(t.prisma.enrollment.update({ where: { id: e.id }, data: { status: 'completed' } }), 'completed without date');
    await rejects(t.prisma.enrollment.update({ where: { id: e.id }, data: { completedAt: new Date() } }), 'date while active');
    await rejects(t.prisma.enrollment.update({ where: { id: e.id }, data: { status: 'weird' } }), 'status');
  });

  test('progress: a lesson of ANOTHER formation cannot be recorded (composite foreign keys)', async () => {
    const u = await t.user();
    const f1 = await t.formation();
    const f2 = await t.formation();
    const e = await t.prisma.enrollment.create({ data: { userId: u.id, formationId: f1.id } });
    await rejects(t.prisma.courseProgress.create({ data: { enrollmentId: e.id, courseId: f2.courses[0].id, formationId: f1.id } }), 'foreign lesson');
    await rejects(t.prisma.courseProgress.create({ data: { enrollmentId: e.id, courseId: f1.courses[0].id, formationId: f2.id } }), 'wrong formation id');
    await t.prisma.courseProgress.create({ data: { enrollmentId: e.id, courseId: f1.courses[0].id, formationId: f1.id } });
    await rejects(t.prisma.courseProgress.create({ data: { enrollmentId: e.id, courseId: f1.courses[0].id, formationId: f1.id } }), 'duplicate progress');
  });

  test('certificates: one per enrolment, unique numbers', async () => {
    const u = await t.user();
    const f = await t.formation();
    const e = await t.prisma.enrollment.create({ data: { userId: u.id, formationId: f.id, status: 'completed', completedAt: new Date() } });
    await t.prisma.certification.create({ data: { certificateNumber: 'LARBI-AAAA-BBBB-CCCC', enrollmentId: e.id, holderName: 'x', formationTitle: 'y' } });
    await rejects(t.prisma.certification.create({ data: { certificateNumber: 'LARBI-DDDD-EEEE-FFFF', enrollmentId: e.id, holderName: 'x', formationTitle: 'y' } }), 'second certificate for one enrolment');
    const u2 = await t.user();
    const e2 = await t.prisma.enrollment.create({ data: { userId: u2.id, formationId: f.id, status: 'completed', completedAt: new Date() } });
    await rejects(t.prisma.certification.create({ data: { certificateNumber: 'LARBI-AAAA-BBBB-CCCC', enrollmentId: e2.id, holderName: 'x', formationTitle: 'y' } }), 'duplicate number');
  });
});

describe('deletion rules', () => {
  test('deleting an account erases its enrolments, progress and certificates', async () => {
    const u = await t.user();
    const f = await t.formation();
    const e = await t.prisma.enrollment.create({ data: { userId: u.id, formationId: f.id, status: 'completed', completedAt: new Date() } });
    await t.prisma.courseProgress.create({ data: { enrollmentId: e.id, courseId: f.courses[0].id, formationId: f.id, status: 'completed', completedAt: new Date() } });
    await t.prisma.certification.create({ data: { certificateNumber: 'LARBI-GGGG-HHHH-JJJJ', enrollmentId: e.id, holderName: 'x', formationTitle: 'y' } });
    await t.prisma.user.delete({ where: { id: u.id } });
    assert.deepEqual(
      [await t.prisma.enrollment.count({ where: { id: e.id } }), await t.prisma.courseProgress.count({ where: { enrollmentId: e.id } }), await t.prisma.certification.count({ where: { enrollmentId: e.id } })],
      [0, 0, 0],
    );
    assert.equal(await t.prisma.formation.count({ where: { id: f.id } }), 1, 'the formation itself stays');
  });

  test('a formation with enrolments cannot be deleted (RESTRICT)', async () => {
    const u = await t.user();
    const f = await t.formation();
    await t.prisma.enrollment.create({ data: { userId: u.id, formationId: f.id } });
    await rejects(t.prisma.formation.delete({ where: { id: f.id } }), 'formation with learners');
  });

  test('deleting a lesson removes its progress and its file rows', async () => {
    const u = await t.user();
    const f = await t.formation({ courses: [{ title: 'A' }, { title: 'B' }] });
    const e = await t.prisma.enrollment.create({ data: { userId: u.id, formationId: f.id } });
    await t.prisma.courseProgress.create({ data: { enrollmentId: e.id, courseId: f.courses[0].id, formationId: f.id } });
    const m = await media({ courseId: f.courses[0].id });
    await t.prisma.course.delete({ where: { id: f.courses[0].id } });
    assert.equal(await t.prisma.courseProgress.count({ where: { enrollmentId: e.id } }), 0);
    assert.equal(await t.prisma.media.count({ where: { id: m.id } }), 0);
    assert.equal(await t.prisma.enrollment.count({ where: { id: e.id } }), 1);
  });

  test('deleting an article removes its keyword links and file rows, not the keywords themselves', async () => {
    const a = await t.article({ tags: ['Durable'] });
    const m = await media({ articleId: a.id });
    await t.prisma.article.delete({ where: { id: a.id } });
    assert.equal(await t.prisma.articleTag.count({ where: { articleId: a.id } }), 0);
    assert.equal(await t.prisma.media.count({ where: { id: m.id } }), 0);
    assert.equal(await t.prisma.tag.count({ where: { slug: 'durable' } }), 1);
  });

  test('deleting a keyword, a category or a cover row detaches them without deleting articles', async () => {
    const cat = await t.prisma.articleCategory.create({ data: { slug: t.unique('c'), name: 'Cat' } });
    const cover = await media();
    const a = await t.article({ tags: ['Jetable'], category: cat, coverImageId: cover.id });
    await t.prisma.tag.delete({ where: { slug: 'jetable' } });
    await t.prisma.articleCategory.delete({ where: { id: cat.id } });
    await t.prisma.media.delete({ where: { id: cover.id } });
    const row = await t.prisma.article.findUnique({ where: { id: a.id }, include: { tags: true } });
    assert.ok(row);
    assert.deepEqual([row.categoryId, row.coverImageId, row.tags.length], [null, null, 0]);
  });

  test('deleting the uploader account keeps the files and the formation', async () => {
    const u = await t.admin();
    const f = await t.formation({ createdById: u.id });
    const m = await media({ uploadedById: u.id, courseId: f.courses[0].id });
    await t.prisma.user.delete({ where: { id: u.id } });
    assert.equal((await t.prisma.media.findUnique({ where: { id: m.id } })).uploadedById, null);
    assert.equal((await t.prisma.formation.findUnique({ where: { id: f.id } })).createdById, null);
  });
});

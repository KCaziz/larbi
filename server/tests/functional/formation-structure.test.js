import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PNG, fileForm } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P3-11 — structure of a formation: pedagogical fields, chapters, plan reorder,
// statuses, dashboard. Everything through the real API and the real database.

let t;
let admin;
let learner;

const api = (method, url, opts) => t.request(method, url, { user: admin, ...opts });
const lessonIds = (formation) => formation.courses.map((c) => c.id);
const chapterOf = (formation) => Object.fromEntries(formation.courses.map((c) => [c.title, formation.sections.find((s) => s.id === c.sectionId)?.title]));

// A formation with two chapters ("A": L1 L2, "B": L3) built ONLY through the API.
async function build(title = 'Formation test') {
  const f = (await api('POST', '/admin/formations', { json: { title } })).body.formation;
  const a = (await api('POST', `/admin/formations/${f.id}/sections`, { json: { title: 'A' } })).body.section;
  const b = (await api('POST', `/admin/formations/${f.id}/sections`, { json: { title: 'B' } })).body.section;
  const lesson = async (name, sectionId) => (await api('POST', `/admin/formations/${f.id}/courses`, { json: { title: name, sectionId } })).body.course;
  const l1 = await lesson('L1', a.id);
  const l2 = await lesson('L2', a.id);
  const l3 = await lesson('L3', b.id);
  return { id: f.id, a, b, l1, l2, l3 };
}
const reload = async (id) => (await api('GET', `/admin/formations/${id}`)).body.formation;

before(async () => {
  t = await boot();
  await t.reset();
  admin = await t.admin();
  learner = await t.user();
});
after(() => t.close());

describe('chapters and lessons', () => {
  test('the first lesson of a formation without chapter creates "Chapitre 1" and goes into it', async () => {
    const f = (await api('POST', '/admin/formations', { json: { title: 'Sans chapitre' } })).body.formation;
    assert.deepEqual(f.sections, []);
    const res = await api('POST', `/admin/formations/${f.id}/courses`, { json: { title: 'Première' } });
    assert.equal(res.status, 201);
    const fresh = await reload(f.id);
    assert.deepEqual(fresh.sections.map((s) => s.title), ['Chapitre 1']);
    assert.equal(res.body.course.sectionId, fresh.sections[0].id);
  });

  test('lessons are placed in the requested chapter, at its end; the global order goes chapter by chapter', async () => {
    const x = await build();
    const f = await reload(x.id);
    assert.deepEqual(f.courses.map((c) => c.title), ['L1', 'L2', 'L3']);
    assert.deepEqual(f.courses.map((c) => c.position), [0, 1, 2]);
    assert.deepEqual(chapterOf(f), { L1: 'A', L2: 'A', L3: 'B' });
    // a new lesson in chapter A goes after L2 but BEFORE L3 (chapter A comes first)
    await api('POST', `/admin/formations/${x.id}/courses`, { json: { title: 'L4', sectionId: x.a.id } });
    const after4 = await reload(x.id);
    assert.deepEqual(after4.courses.map((c) => c.title), ['L1', 'L2', 'L4', 'L3']);
    assert.deepEqual(after4.courses.map((c) => c.position), [0, 1, 2, 3]);
  });

  test('a lesson cannot be created in a chapter of ANOTHER formation (400)', async () => {
    const x = await build('Une');
    const y = await build('Deux');
    const res = await api('POST', `/admin/formations/${x.id}/courses`, { json: { title: 'Intrus', sectionId: y.a.id } });
    assert.equal(res.status, 400);
  });

  test('renaming a chapter; empty or oversized titles are refused', async () => {
    const x = await build();
    const ok = await api('PATCH', `/admin/sections/${x.a.id}`, { json: { title: 'Introduction', description: 'Pour démarrer' } });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.section.title, 'Introduction');
    assert.equal((await api('PATCH', `/admin/sections/${x.a.id}`, { json: { title: '  ' } })).status, 400);
    assert.equal((await api('PATCH', `/admin/sections/${x.a.id}`, { json: { title: 'x'.repeat(151) } })).status, 400);
    assert.equal((await api('PATCH', `/admin/sections/${x.a.id}`, { json: { position: 5 } })).status, 400, 'position is only changed through the plan');
  });

  test('a chapter that still holds lessons cannot be deleted (409); an empty one can, and the others are renumbered', async () => {
    const x = await build();
    assert.equal((await api('DELETE', `/admin/sections/${x.a.id}`)).status, 409);
    const c = (await api('POST', `/admin/formations/${x.id}/sections`, { json: { title: 'C' } })).body.section;
    assert.equal((await api('DELETE', `/admin/sections/${x.b.id}`)).status, 409);
    assert.equal((await api('DELETE', `/admin/sections/${c.id}`)).status, 204);
    const f = await reload(x.id);
    assert.deepEqual(f.sections.map((s) => [s.title, s.position]), [['A', 0], ['B', 1]]);
    assert.equal((await api('DELETE', `/admin/sections/${c.id}`)).status, 404);
  });

  test('deleting a lesson closes the gap in the global order', async () => {
    const x = await build();
    await api('DELETE', `/admin/courses/${x.l1.id}`);
    const f = await reload(x.id);
    assert.deepEqual(f.courses.map((c) => [c.title, c.position]), [['L2', 0], ['L3', 1]]);
  });
});

describe('saving the whole plan (drag and drop)', () => {
  test('moves a lesson to another chapter and reorders the chapters in ONE request', async () => {
    const x = await build();
    const res = await api('PUT', `/admin/formations/${x.id}/outline`, {
      json: { sections: [{ id: x.b.id, courseIds: [x.l3.id, x.l1.id] }, { id: x.a.id, courseIds: [x.l2.id] }] },
    });
    assert.equal(res.status, 200);
    const f = res.body.formation;
    assert.deepEqual(f.sections.map((s) => s.title), ['B', 'A']);
    assert.deepEqual(f.courses.map((c) => c.title), ['L3', 'L1', 'L2']);
    assert.deepEqual(f.courses.map((c) => c.position), [0, 1, 2]);
    assert.deepEqual(chapterOf(f), { L3: 'B', L1: 'B', L2: 'A' });
  });

  test('a plan that misses, repeats or invents a chapter or a lesson is refused and NOTHING changes', async () => {
    const x = await build();
    const other = await build('Autre');
    const before = JSON.stringify((await reload(x.id)).courses.map((c) => [c.id, c.sectionId, c.position]));
    const bad = [
      { sections: [{ id: x.a.id, courseIds: [x.l1.id, x.l2.id] }, { id: x.b.id, courseIds: [] }] }, // L3 missing
      { sections: [{ id: x.a.id, courseIds: [x.l1.id, x.l2.id, x.l3.id] }] }, // chapter B missing
      { sections: [{ id: x.a.id, courseIds: [x.l1.id, x.l1.id, x.l2.id] }, { id: x.b.id, courseIds: [x.l3.id] }] }, // duplicate
      { sections: [{ id: x.a.id, courseIds: [x.l1.id, x.l2.id, other.l1.id] }, { id: x.b.id, courseIds: [x.l3.id] }] }, // foreign lesson
      { sections: [{ id: x.a.id, courseIds: [x.l1.id, x.l2.id] }, { id: other.a.id, courseIds: [x.l3.id] }] }, // foreign chapter
      { sections: [{ id: x.a.id, courseIds: [x.l1.id, x.l2.id] }, { id: x.b.id, courseIds: [x.l3.id] }, { id: x.b.id, courseIds: [] }] }, // repeated chapter
      { sections: 'nope' },
      { sections: [], extra: true },
    ];
    for (const json of bad) assert.equal((await api('PUT', `/admin/formations/${x.id}/outline`, { json })).status, 400, JSON.stringify(json).slice(0, 80));
    assert.equal(JSON.stringify((await reload(x.id)).courses.map((c) => [c.id, c.sectionId, c.position])), before);
  });

  test('the ids stay the same: progress and certificates of learners survive a reorganisation', async () => {
    const x = await build();
    const enrollment = await t.prisma.enrollment.create({ data: { userId: learner.id, formationId: x.id } });
    await t.prisma.courseProgress.create({ data: { enrollmentId: enrollment.id, courseId: x.l1.id, formationId: x.id, status: 'completed', completedAt: new Date() } });
    await api('PUT', `/admin/formations/${x.id}/outline`, {
      json: { sections: [{ id: x.b.id, courseIds: [x.l1.id, x.l3.id] }, { id: x.a.id, courseIds: [x.l2.id] }] },
    });
    const rows = await t.prisma.courseProgress.findMany({ where: { enrollmentId: enrollment.id } });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].courseId, x.l1.id);
    assert.equal(rows[0].status, 'completed');
  });

  test('the legacy "order the lessons" request still works and keeps every lesson in its chapter', async () => {
    const x = await build();
    const res = await api('PUT', `/admin/formations/${x.id}/courses/order`, { json: { courseIds: [x.l2.id, x.l1.id, x.l3.id] } });
    assert.equal(res.status, 200);
    const f = await reload(x.id);
    assert.deepEqual(f.courses.map((c) => c.title), ['L2', 'L1', 'L3']);
    assert.deepEqual(chapterOf(f), { L2: 'A', L1: 'A', L3: 'B' });
  });

  test('only an administrator: 401 anonymous / 403 learner on every new route', async () => {
    const x = await build();
    const routes = [
      ['POST', `/admin/formations/${x.id}/sections`, { title: 'Z' }],
      ['PATCH', `/admin/sections/${x.a.id}`, { title: 'Z' }],
      ['DELETE', `/admin/sections/${x.a.id}`, undefined],
      ['PUT', `/admin/formations/${x.id}/outline`, { sections: [] }],
      ['PUT', `/admin/formations/${x.id}/status`, { status: 'archived' }],
      ['GET', '/admin/dashboard', undefined],
    ];
    for (const [method, url, json] of routes) {
      assert.equal((await t.request(method, url, { json })).status, 401, `anonymous ${method} ${url}`);
      assert.equal((await t.request(method, url, { user: learner, json })).status, 403, `learner ${method} ${url}`);
    }
    assert.equal((await reload(x.id)).sections.length, 2);
  });
});

describe('pedagogical fields', () => {
  test('subtitle, level, objectives and prerequisites are saved; the total duration is computed', async () => {
    const x = await build();
    await api('PATCH', `/admin/courses/${x.l1.id}`, { json: { estimatedMinutes: 20 } });
    await api('PATCH', `/admin/courses/${x.l3.id}`, { json: { estimatedMinutes: 15 } });
    const res = await api('PATCH', `/admin/formations/${x.id}`, {
      json: { subtitle: 'Un sous-titre', level: 'intermediate', objectives: ['Comprendre', 'Appliquer'], prerequisites: ['Aucun'] },
    });
    assert.equal(res.status, 200);
    const f = res.body.formation;
    assert.equal(f.subtitle, 'Un sous-titre');
    assert.equal(f.level, 'intermediate');
    assert.deepEqual(f.objectives, ['Comprendre', 'Appliquer']);
    assert.deepEqual(f.prerequisites, ['Aucun']);
    assert.equal(f.totalMinutes, 35);
    assert.equal((await api('PATCH', `/admin/formations/${x.id}`, { json: { level: null, subtitle: '' } })).body.formation.level, null);
  });

  test('invalid values are refused: unknown level, blank line, too many or too long lines, wrong types', async () => {
    const x = await build();
    for (const json of [
      { level: 'expert' },
      { objectives: [''] },
      { objectives: ['  '] },
      { objectives: Array.from({ length: 13 }, (_, i) => `o${i}`) },
      { prerequisites: ['x'.repeat(201)] },
      { objectives: 'texte' },
      { subtitle: 'x'.repeat(161) },
    ]) {
      assert.equal((await api('PATCH', `/admin/formations/${x.id}`, { json })).status, 400, JSON.stringify(json).slice(0, 60));
    }
  });

  test('the learner sees them, with the chapters and their lessons, and the same order as the reader', async () => {
    const x = await build();
    await api('PATCH', `/admin/formations/${x.id}`, { json: { subtitle: 'Sous-titre', level: 'beginner', objectives: ['O1'], prerequisites: ['P1'], description: 'D' } });
    await t.prisma.formation.update({ where: { id: x.id }, data: { status: 'published', publishedAt: new Date() } });
    const slug = (await t.prisma.formation.findUnique({ where: { id: x.id } })).slug;
    const res = await t.request('GET', `/learn/formations/${slug}`, { user: learner });
    assert.equal(res.status, 200);
    const d = res.body.formation;
    assert.equal(d.subtitle, 'Sous-titre');
    assert.equal(d.level, 'beginner');
    assert.deepEqual(d.objectives, ['O1']);
    assert.deepEqual(d.prerequisites, ['P1']);
    assert.deepEqual(d.sections.map((s) => [s.title, s.courseIds.length]), [['A', 2], ['B', 1]]);
    assert.deepEqual(d.courses.map((c) => c.title), ['L1', 'L2', 'L3']);
    assert.deepEqual(d.sections.flatMap((s) => s.courseIds), d.courses.map((c) => c.id), 'chapters list the lessons in the reader order');
  });
});

describe('statuses', () => {
  let x;
  let slug;

  before(async () => {
    x = await build('Statuts');
    await api('PATCH', `/admin/formations/${x.id}`, { json: { description: 'Une description', certificationEnabled: false } });
    await api('POST', `/admin/formations/${x.id}/cover`, { form: fileForm(PNG) });
    for (const l of [x.l1, x.l2, x.l3]) await api('PATCH', `/admin/courses/${l.id}`, { json: { body: '<p>Du contenu réel</p>' } });
    slug = (await t.prisma.formation.findUnique({ where: { id: x.id } })).slug;
  });

  const setStatus = (status) => api('PUT', `/admin/formations/${x.id}/status`, { json: { status } });

  test('draft -> in review -> published (guarded) -> archived -> draft', async () => {
    assert.equal((await setStatus('in_review')).body.formation.status, 'in_review');
    const published = await setStatus('published');
    assert.equal(published.status, 200);
    assert.equal(published.body.formation.status, 'published');
    assert.ok(published.body.formation.publishedAt);
    const archived = await setStatus('archived');
    assert.equal(archived.body.formation.status, 'archived');
    assert.equal(archived.body.formation.publishedAt, null, 'only a published formation has a publication date');
    assert.equal((await setStatus('draft')).body.formation.status, 'draft');
  });

  test('publishing still refuses an incomplete formation (422 with what is missing)', async () => {
    const incomplete = (await api('POST', '/admin/formations', { json: { title: 'Incomplète' } })).body.formation;
    const res = await api('PUT', `/admin/formations/${incomplete.id}/status`, { json: { status: 'published' } });
    assert.equal(res.status, 422);
    assert.ok(res.body.error.details.missing.includes('description'));
    assert.equal((await reload(incomplete.id)).status, 'draft');
  });

  test('an unknown status is refused (400) and the database itself refuses one', async () => {
    assert.equal((await setStatus('deleted')).status, 400);
    assert.equal((await api('PUT', `/admin/formations/${x.id}/status`, { json: { status: 'draft', extra: 1 } })).status, 400);
    await assert.rejects(t.prisma.formation.update({ where: { id: x.id }, data: { status: 'weird' } }));
  });

  test('only "published" is in the catalogue; a formation in review or archived is a 404 for everybody else', async () => {
    const other = await t.user();
    await setStatus('published');
    assert.ok((await t.request('GET', '/learn/formations', { user: other })).body.formations.some((f) => f.slug === slug));
    for (const status of ['in_review', 'archived', 'draft']) {
      await setStatus(status);
      assert.ok(!(await t.request('GET', '/learn/formations', { user: other })).body.formations.some((f) => f.slug === slug), status);
      assert.equal((await t.request('GET', `/learn/formations/${slug}`, { user: other })).status, 404, status);
      assert.equal((await t.request('POST', `/learn/formations/${slug}/enroll`, { user: other })).status, 404, status);
    }
  });

  test('learners already enrolled keep their access when the formation is archived', async () => {
    await setStatus('published');
    await t.request('POST', `/learn/formations/${slug}/enroll`, { user: learner });
    const lesson = (await reload(x.id)).courses[0];
    await setStatus('archived');
    const detail = await t.request('GET', `/learn/formations/${slug}`, { user: learner });
    assert.equal(detail.status, 200);
    assert.equal(detail.body.formation.archived, true);
    assert.equal(detail.body.formation.canEnroll, false);
    assert.equal((await t.request('GET', `/learn/formations/${slug}/courses/${lesson.id}`, { user: learner })).status, 200);
    assert.equal((await t.request('GET', '/learn/enrollments', { user: learner })).body.formations.some((f) => f.slug === slug), true);
  });

  test('the old publish / unpublish requests keep working', async () => {
    await api('POST', `/admin/formations/${x.id}/unpublish`);
    assert.equal((await reload(x.id)).status, 'draft');
    assert.equal((await api('POST', `/admin/formations/${x.id}/publish`)).status, 200);
    assert.equal((await reload(x.id)).status, 'published');
  });
});

describe('the database refuses inconsistent structure', () => {
  test('a lesson cannot point to a chapter of another formation', async () => {
    const x = await build('Une');
    const y = await build('Deux');
    await assert.rejects(t.prisma.course.update({ where: { id: x.l1.id }, data: { sectionId: y.a.id } }));
  });

  test('a chapter that still has lessons cannot be removed at the SQL level either', async () => {
    const x = await build();
    await assert.rejects(t.prisma.section.delete({ where: { id: x.a.id } }));
  });

  test('unknown level: refused by the CHECK constraint', async () => {
    const x = await build();
    await assert.rejects(t.prisma.formation.update({ where: { id: x.id }, data: { level: 'guru' } }));
  });

  test('deleting a formation removes its chapters', async () => {
    const x = await build();
    assert.equal((await api('DELETE', `/admin/formations/${x.id}`)).status, 204);
    assert.equal(await t.prisma.section.count({ where: { formationId: x.id } }), 0);
  });
});

describe('migration of existing data', () => {
  test('the data migration puts every existing lesson into ONE default chapter, and can run twice', async () => {
    const dir = path.join(SERVER_DIR, 'prisma/migrations');
    const { readdirSync } = await import('node:fs');
    const name = readdirSync(dir).find((n) => n.endsWith('_cms_structure'));
    const migration = readFileSync(path.join(dir, name, 'migration.sql'), 'utf8');
    const data = migration.slice(migration.indexOf('INSERT INTO "sections"'));

    // legacy formation: lessons without chapter, with progress
    const legacy = await t.formation({ title: 'Ancienne', courses: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] });
    await t.prisma.course.updateMany({ where: { formationId: legacy.id }, data: { sectionId: null } });
    await t.prisma.section.deleteMany({ where: { formationId: legacy.id } });
    const empty = await t.formation({ title: 'Vide', courses: [] });
    const enrollment = await t.prisma.enrollment.create({ data: { userId: learner.id, formationId: legacy.id } });
    await t.prisma.courseProgress.create({ data: { enrollmentId: enrollment.id, courseId: legacy.courses[0].id, formationId: legacy.id } });
    const idsBefore = (await t.prisma.course.findMany({ where: { formationId: legacy.id }, orderBy: { position: 'asc' } })).map((c) => [c.id, c.position]);

    for (let run = 0; run < 2; run += 1) {
      for (const statement of data.split(/;\s*\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('--'))) {
        await t.prisma.$executeRawUnsafe(statement);
      }
      const sections = await t.prisma.section.findMany({ where: { formationId: legacy.id } });
      assert.equal(sections.length, 1, `run ${run + 1}: one default chapter`);
      assert.equal(sections[0].title, 'Chapitre 1');
      const lessons = await t.prisma.course.findMany({ where: { formationId: legacy.id }, orderBy: { position: 'asc' } });
      assert.ok(lessons.every((c) => c.sectionId === sections[0].id));
      assert.deepEqual(lessons.map((c) => [c.id, c.position]), idsBefore, 'same ids, same order');
      assert.equal(await t.prisma.courseProgress.count({ where: { enrollmentId: enrollment.id } }), 1);
      assert.equal(await t.prisma.section.count({ where: { formationId: empty.id } }), 0, 'a formation without lessons gets no chapter');
    }
  });
});

describe('dashboard', () => {
  test('counts by status and the recent items with what is still missing', async () => {
    await t.reset();
    admin = await t.admin();
    const done = await t.formation({ title: 'Publiée', status: 'published' });
    await t.formation({ title: 'En révision', status: 'in_review' });
    await t.formation({ title: 'Archivée', status: 'archived' });
    await t.article({ title: 'Article', status: 'draft' });
    const res = await api('GET', '/admin/dashboard');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.formations.byStatus, { draft: 0, in_review: 1, published: 1, archived: 1 });
    assert.deepEqual(res.body.articles.byStatus, { draft: 1, published: 0 });
    const item = res.body.recentFormations.find((f) => f.id === done.id);
    assert.ok(Array.isArray(item.missing));
    assert.ok(item.missing.includes('description') || item.missing.includes('cover'));
    assert.equal(res.body.recentArticles[0].title, 'Article');
    assert.ok(!res.text.includes('storageKey'));
  });
});

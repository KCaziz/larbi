import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { HOSTILE, MP4, PDF, PNG, fileForm } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';

// P2-02 — the formation CMS used by the client (real API, database and files).

let t;
let admin;
before(async () => {
  t = await boot();
  await t.reset();
  admin = await t.admin();
});
after(() => t.close());

const api = (method, path, json) => t.request(method, path, { user: admin, json });
const upload = (path, bytes, opts) => t.request('POST', path, { user: admin, form: fileForm(bytes, opts) });
const newFormation = async (title = 'Comptabilité') => (await api('POST', '/admin/formations', { title })).body.formation;
const newCourse = async (formationId, title = 'Cours') => (await api('POST', `/admin/formations/${formationId}/courses`, { title })).body.course;

// A formation that satisfies every publication requirement.
async function readyFormation(title = 'Prête') {
  const f = await newFormation(title);
  await api('PATCH', `/admin/formations/${f.id}`, { description: 'Une description', certificationTitle: 'Certificat' });
  await upload(`/admin/formations/${f.id}/cover`, PNG);
  const c = await newCourse(f.id);
  await api('PATCH', `/admin/courses/${c.id}`, { body: '<p>Contenu du cours</p>' });
  return { f, c };
}

describe('formation', () => {
  test('a title alone creates a draft formation', async () => {
    const res = await api('POST', '/admin/formations', { title: '  Ma formation  ' });
    assert.equal(res.status, 201);
    assert.equal(res.body.formation.title, 'Ma formation');
    assert.equal(res.body.formation.status, 'draft');
    assert.equal(res.body.formation.requiredAccessLevel, 'standard');
    assert.deepEqual(res.body.formation.courses, []);
  });

  test('invalid creation / update requests are refused', async () => {
    for (const json of [{}, { title: '' }, { title: 'x'.repeat(151) }, { title: 'ok', status: 'published' }]) {
      assert.equal((await api('POST', '/admin/formations', json)).status, 400, JSON.stringify(json).slice(0, 50));
    }
    const f = await newFormation();
    for (const json of [{ requiredAccessLevel: 'gold' }, { description: 'x'.repeat(2001) }, { status: 'published' }, { slug: 'x' }, { certificationTitle: 'x'.repeat(151) }, { categoryId: 'nope' }]) {
      assert.equal((await api('PATCH', `/admin/formations/${f.id}`, json)).status, 400, JSON.stringify(json).slice(0, 50));
    }
  });

  test('information, access level and certification settings are saved', async () => {
    const f = await newFormation();
    const res = await api('PATCH', `/admin/formations/${f.id}`, { description: 'Desc', requiredAccessLevel: 'premium', certificationEnabled: false, certificationTitle: '', certificationDescription: '  Note  ' });
    const g = res.body.formation;
    assert.equal(g.description, 'Desc');
    assert.equal(g.requiredAccessLevel, 'premium');
    assert.deepEqual(g.certification, { enabled: false, title: null, description: 'Note' });
  });

  test('categories: created from a name, unknown ones refused, clearable', async () => {
    const f = await newFormation();
    const cat = (await api('POST', '/admin/categories', { name: 'Gestion' })).body.category;
    assert.equal((await api('PATCH', `/admin/formations/${f.id}`, { categoryId: cat.id })).body.formation.category.name, 'Gestion');
    assert.equal((await api('PATCH', `/admin/formations/${f.id}`, { categoryId: '00000000-0000-4000-8000-000000000000' })).status, 400);
    assert.equal((await api('PATCH', `/admin/formations/${f.id}`, { categoryId: null })).body.formation.category, null);
    assert.ok((await api('GET', '/admin/categories')).body.categories.some((c) => c.name === 'Gestion'));
  });

  test('the cover image is stored privately, replaced cleanly, and only images are accepted', async () => {
    const f = await newFormation();
    const first = await upload(`/admin/formations/${f.id}/cover`, PNG);
    assert.equal(first.status, 201);
    const filesAfterFirst = t.storedFiles().length;
    await upload(`/admin/formations/${f.id}/cover`, PNG);
    assert.equal(t.storedFiles().length, filesAfterFirst, 'the replaced cover file is gone');
    assert.equal((await upload(`/admin/formations/${f.id}/cover`, PDF, { name: 'x.pdf', type: 'application/pdf' })).status, 415);
    assert.equal((await t.request('DELETE', `/admin/media/${(await api('GET', `/admin/formations/${f.id}`)).body.formation.cover.id}`, { user: admin })).status, 204);
    assert.equal((await api('GET', `/admin/formations/${f.id}`)).body.formation.cover, null);
  });
});

describe('courses', () => {
  test('courses are appended in order and their rich text is sanitised', async () => {
    const f = await newFormation();
    const c1 = await newCourse(f.id, 'Un');
    const c2 = await newCourse(f.id, 'Deux');
    assert.deepEqual([c1.position, c2.position], [0, 1]);
    const res = await api('PATCH', `/admin/courses/${c1.id}`, { body: '<p>ok</p><script>alert(1)</script><a href="javascript:x">l</a><img src=x onerror=y>', summary: 'Résumé', estimatedMinutes: 12, isRequired: false });
    assert.doesNotMatch(res.body.course.body, /script|javascript:|<img|onerror/);
    assert.equal(res.body.course.isRequired, false);
    assert.equal(res.body.course.estimatedMinutes, 12);
  });

  test('course fields are validated', async () => {
    const f = await newFormation();
    const c = await newCourse(f.id);
    for (const json of [{ title: '' }, { estimatedMinutes: -1 }, { estimatedMinutes: 1441 }, { estimatedMinutes: 1.5 }, { isRequired: 'yes' }, { position: 3 }, { formationId: 'x' }]) {
      assert.equal((await api('PATCH', `/admin/courses/${c.id}`, json)).status, 400, JSON.stringify(json));
    }
  });

  test('reordering applies a valid permutation and refuses anything else (state unchanged)', async () => {
    const f = await newFormation();
    const [a, b, c] = [await newCourse(f.id, 'A'), await newCourse(f.id, 'B'), await newCourse(f.id, 'C')];
    const order = async () => (await api('GET', `/admin/formations/${f.id}`)).body.formation.courses.map((x) => x.title);
    assert.equal((await api('PUT', `/admin/formations/${f.id}/courses/order`, { courseIds: [c.id, a.id, b.id] })).status, 200);
    assert.deepEqual(await order(), ['C', 'A', 'B']);
    const other = await newFormation('Autre');
    const foreign = await newCourse(other.id, 'Étranger');
    for (const courseIds of [[a.id, b.id], [a.id, a.id, b.id, c.id], [a.id, b.id, c.id, foreign.id], [a.id, b.id, foreign.id], []]) {
      assert.equal((await api('PUT', `/admin/formations/${f.id}/courses/order`, { courseIds })).status, 400, JSON.stringify(courseIds.length));
    }
    assert.deepEqual(await order(), ['C', 'A', 'B']);
  });

  test('files: video, PDF and image are attached; hostile files refused without residue', async () => {
    const f = await newFormation();
    const c = await newCourse(f.id);
    for (const [bytes, opts, kind] of [[MP4, { name: 'v.mp4', type: 'video/mp4' }, 'video'], [PDF, { name: 'd.pdf', type: 'application/pdf' }, 'document'], [PNG, { name: 'i.png' }, 'image']]) {
      const res = await upload(`/admin/courses/${c.id}/media`, bytes, opts);
      assert.equal(res.status, 201);
      assert.equal(res.body.media.kind, kind);
      assert.equal(Object.hasOwn(res.body.media, 'storageKey'), false);
    }
    const before = { priv: t.storedFiles().length, tmp: t.storedFiles('tmp').length };
    for (const [label, h] of Object.entries(HOSTILE)) {
      const res = await upload(`/admin/courses/${c.id}/media`, h.bytes, { name: h.name, type: h.type });
      assert.ok([400, 415].includes(res.status), `${label} -> ${res.status}`);
    }
    assert.deepEqual({ priv: t.storedFiles().length, tmp: t.storedFiles('tmp').length }, before);
  });

  test('deleting a course closes the gap in the order and removes its files', async () => {
    const f = await newFormation();
    const [a, b, c] = [await newCourse(f.id, 'A'), await newCourse(f.id, 'B'), await newCourse(f.id, 'C')];
    await upload(`/admin/courses/${b.id}/media`, PNG);
    const filesBefore = t.storedFiles().length;
    assert.equal((await api('DELETE', `/admin/courses/${b.id}`)).status, 204);
    assert.equal(t.storedFiles().length, filesBefore - 1);
    const rest = (await api('GET', `/admin/formations/${f.id}`)).body.formation.courses;
    assert.deepEqual(rest.map((x) => [x.title, x.position]), [['A', 0], ['C', 1]]);
    assert.ok(a && c);
  });
});

describe('publication', () => {
  test('an incomplete formation is refused with the list of what is missing (server-side rule)', async () => {
    const f = await newFormation();
    const res = await api('POST', `/admin/formations/${f.id}/publish`, undefined);
    assert.equal(res.status, 422);
    assert.deepEqual(res.body.error.details.missing.sort(), ['certification', 'courses', 'coursesContent', 'cover', 'description']);
    assert.equal((await t.prisma.formation.findUnique({ where: { id: f.id } })).status, 'draft');
  });

  test('every course must have content, and an enabled certification needs a name', async () => {
    const { f } = await readyFormation('Contenu');
    await newCourse(f.id, 'Vide');
    let res = await api('POST', `/admin/formations/${f.id}/publish`);
    assert.deepEqual(res.body.error.details.missing, ['coursesContent']);
    await api('PATCH', `/admin/formations/${f.id}`, { certificationTitle: '' });
    res = await api('POST', `/admin/formations/${f.id}/publish`);
    assert.deepEqual(res.body.error.details.missing.sort(), ['certification', 'coursesContent']);
    await api('PATCH', `/admin/formations/${f.id}`, { certificationEnabled: false });
    assert.deepEqual((await api('POST', `/admin/formations/${f.id}/publish`)).body.error.details.missing, ['coursesContent']);
  });

  test('a ready formation is published, edited while published, unpublished and republished', async () => {
    const { f } = await readyFormation('Cycle de vie');
    const res = await api('POST', `/admin/formations/${f.id}/publish`);
    assert.equal(res.status, 200);
    assert.equal(res.body.formation.status, 'published');
    assert.ok(res.body.formation.publishedAt);
    assert.equal((await api('PATCH', `/admin/formations/${f.id}`, { description: 'Mise à jour' })).body.formation.status, 'published');
    const off = await api('POST', `/admin/formations/${f.id}/unpublish`);
    assert.equal(off.body.formation.status, 'draft');
    assert.equal(off.body.formation.publishedAt, null);
    assert.equal((await api('POST', `/admin/formations/${f.id}/publish`)).status, 200);
  });

  test('deleting: blocked while learners are enrolled (409), otherwise everything goes, files included', async () => {
    const { f } = await readyFormation('À supprimer');
    const learner = await t.user();
    await api('POST', `/admin/formations/${f.id}/publish`);
    await t.request('POST', `/learn/formations/${(await t.prisma.formation.findUnique({ where: { id: f.id } })).slug}/enroll`, { user: learner });
    assert.equal((await api('DELETE', `/admin/formations/${f.id}`)).status, 409);
    assert.equal(await t.prisma.formation.count({ where: { id: f.id } }), 1);

    await t.prisma.enrollment.deleteMany({ where: { formationId: f.id } });
    const filesBefore = t.storedFiles().length;
    assert.equal((await api('DELETE', `/admin/formations/${f.id}`)).status, 204);
    assert.equal(t.storedFiles().length, filesBefore - 1, 'the cover file was removed');
    assert.equal(await t.prisma.formation.count({ where: { id: f.id } }), 0);
  });

  test('the list shows every formation with its counters', async () => {
    const res = await api('GET', '/admin/formations');
    assert.equal(res.status, 200);
    assert.ok(res.body.formations.length >= 5);
    assert.ok(res.body.formations.every((x) => typeof x.courseCount === 'number' && typeof x.enrollmentCount === 'number'));
  });
});

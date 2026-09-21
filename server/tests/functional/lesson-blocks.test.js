import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { HOSTILE, MP4, PDF, PNG, fileForm } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P3-12 — lessons made of typed blocks: validation per type, order, files, history, the
// learner's view, and the migration of the older content. Real API, real database.

let t;
let admin;
let learner;
let lesson; // { id, formationId }
let storage; // private storage folder of the test

const api = (method, url, opts) => t.request(method, url, { user: admin, ...opts });
const blocksOf = async (courseId = lesson.id) => (await t.prisma.lessonBlock.findMany({ where: { courseId }, orderBy: { position: 'asc' } }));
const add = (type, data, extra = {}, courseId = lesson.id) => api('POST', `/admin/courses/${courseId}/blocks`, { json: { type, data, ...extra } });
const upload = (bytes, opts = {}, courseId = lesson.id, fields = {}) => {
  const form = fileForm(bytes, opts);
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return api('POST', `/admin/courses/${courseId}/blocks/upload`, { form });
};
const files = () => (existsSync(storage) ? readdirSync(storage) : []);
const freshLesson = async (title = 'Leçon') => {
  const f = await t.formation({ title, courses: [{ title: 'L', body: null }] });
  await t.prisma.course.update({ where: { id: f.courses[0].id }, data: { body: null } });
  return { id: f.courses[0].id, formationId: f.id, slug: f.slug };
};

before(async () => {
  t = await boot();
  await t.reset();
  storage = path.join(process.env.STORAGE_DIR, 'private');
  admin = await t.admin();
  learner = await t.user();
  lesson = await freshLesson();
});
after(() => t.close());

describe('block types: what the server accepts, fills in and cleans', () => {
  test('each type is stored with its complete, cleaned data (defaults filled, text trimmed)', async () => {
    const cases = [
      ['text', { html: '<p>Bonjour <strong>monde</strong></p>' }, { html: '<p>Bonjour <strong>monde</strong></p>' }],
      ['code', { code: 'const a = 1;\r\nconsole.log(a);' }, { language: 'plaintext', code: 'const a = 1;\nconsole.log(a);', caption: '' }],
      ['code', { language: 'python', code: 'print(1)', caption: '  Exemple  ' }, { language: 'python', code: 'print(1)', caption: 'Exemple' }],
      ['table', { headers: [' A ', 'B'], rows: [['1', '2'], ['3', '4']] }, { headers: ['A', 'B'], rows: [['1', '2'], ['3', '4']], caption: '' }],
      ['quote', { text: '  Citation  ', author: 'Camille' }, { text: 'Citation', author: 'Camille' }],
      ['callout', { variant: 'tip', title: 'Astuce', html: '<p>À retenir</p>' }, { variant: 'tip', title: 'Astuce', html: '<p>À retenir</p>' }],
      ['resources', { title: 'Pour aller plus loin', items: [{ label: 'Site officiel', url: 'https://example.org/aide' }] }, { title: 'Pour aller plus loin', items: [{ label: 'Site officiel', url: 'https://example.org/aide', description: '' }] }],
    ];
    for (const [type, data, expected] of cases) {
      const res = await add(type, data);
      assert.equal(res.status, 201, `${type}: ${res.text.slice(0, 120)}`);
      assert.equal(res.body.block.type, type);
      assert.deepEqual(res.body.block.data, expected, type);
    }
    assert.equal((await blocksOf()).length, cases.length);
  });

  test('a text block is sanitised on the server, whatever the browser sent', async () => {
    const hostile = '<p onclick="x()">Texte</p><script>alert(1)</script><img src=x onerror=alert(1)><iframe src="//evil"></iframe><a href="javascript:alert(1)">lien</a><a href="https://ok.example/x">ok</a>';
    for (const [type, data] of [['text', { html: hostile }], ['callout', { title: 'T', html: hostile }]]) {
      const res = await add(type, data);
      const html = res.body.block.data.html;
      assert.doesNotMatch(html, /script|onerror|onclick|iframe|javascript:|<img/i, type);
      assert.match(html, /Texte/);
      assert.match(html, /https:\/\/ok\.example\/x/);
    }
  });

  test('an empty editor ("<p></p>") is stored as no text at all', async () => {
    const res = await add('text', { html: '<p></p>' });
    assert.equal(res.body.block.data.html, '');
  });

  test('invalid content is refused with 400 and nothing is stored', async () => {
    const before = (await blocksOf()).length;
    const bad = [
      ['nope', {}],
      ['code', { language: 'brainfuck', code: 'x' }],
      ['code', { code: 'x'.repeat(20_001) }],
      ['table', { headers: [], rows: [] }],
      ['table', { headers: ['A', 'B'], rows: [['1']] }],
      ['table', { headers: Array.from({ length: 9 }, (_, i) => `c${i}`), rows: [] }],
      ['table', { headers: ['A'], rows: Array.from({ length: 51 }, () => ['x']) }],
      ['quote', { text: 'x'.repeat(1001) }],
      ['callout', { variant: 'danger', title: '' }],
      ['resources', { items: [{ label: 'x', url: 'javascript:alert(1)' }] }],
      ['resources', { items: [{ label: 'x', url: 'data:text/html,<script>1</script>' }] }],
      ['resources', { items: [{ label: 'x', url: 'ftp://example.org/f' }] }],
      ['resources', { items: [{ label: 'x', url: 'https://user:pass@example.org/' }] }],
      ['resources', { items: [{ label: 'x', url: 'pas une adresse' }] }],
      ['resources', { items: Array.from({ length: 21 }, () => ({ label: 'x', url: 'https://example.org' })) }],
      ['text', { html: 'x', extra: 'field' }],
      ['text', { html: 'x'.repeat(100_001) }],
    ];
    for (const [type, data] of bad) {
      const res = await add(type, data);
      assert.equal(res.status, 400, `${type} ${JSON.stringify(data).slice(0, 60)}`);
    }
    assert.equal((await blocksOf()).length, before);
  });

  test('image, video and file blocks cannot be made from JSON (a real file is needed); unknown ids are refused', async () => {
    for (const type of ['image', 'video', 'file']) assert.equal((await add(type, {})).status, 400, type);
    assert.equal((await add('text', { html: '<p>x</p>' }, { afterId: '11111111-1111-4111-8111-111111111111' })).status, 400);
    assert.equal((await add('text', { html: '<p>x</p>' }, { afterId: 'not-a-uuid' })).status, 400);
    assert.equal((await add('text', { html: '<p>x</p>' }, {}, '11111111-1111-4111-8111-111111111111')).status, 404);
  });

  test('a forbidden control character (NUL) in any field is a 400, not a 500', async () => {
    assert.equal((await add('quote', { text: 'a\u0000b' })).status, 400);
  });

  test('updating validates against the type the block ALREADY has (a block never changes type)', async () => {
    const block = (await add('quote', { text: 'Avant' })).body.block;
    const ok = await api('PATCH', `/admin/blocks/${block.id}`, { json: { data: { text: 'Après', author: 'X' } } });
    assert.equal(ok.status, 200);
    assert.deepEqual(ok.body.block.data, { text: 'Après', author: 'X' });
    assert.equal((await api('PATCH', `/admin/blocks/${block.id}`, { json: { data: { html: '<p>x</p>' } } })).status, 400, 'a text payload on a quote');
    assert.equal((await api('PATCH', `/admin/blocks/${block.id}`, { json: { type: 'text', data: { text: 'x' } } })).status, 400, 'type is not editable');
    assert.equal((await api('PATCH', '/admin/blocks/11111111-1111-4111-8111-111111111111', { json: { data: {} } })).status, 404);
  });
});

describe('order', () => {
  let course;

  before(async () => {
    course = await freshLesson('Ordre');
  });

  const titles = async () => (await blocksOf(course.id)).map((b) => b.data.text);
  const quote = (text, extra) => add('quote', { text }, extra, course.id);

  test('blocks are numbered 0..n-1; "after" inserts in the middle', async () => {
    const a = (await quote('A')).body.block;
    const c = (await quote('C')).body.block;
    await quote('B', { afterId: a.id });
    assert.deepEqual(await titles(), ['A', 'B', 'C']);
    assert.deepEqual((await blocksOf(course.id)).map((b) => b.position), [0, 1, 2]);
    assert.ok(c);
  });

  test('reordering needs EVERY id exactly once; anything else is refused and nothing moves', async () => {
    const ids = (await blocksOf(course.id)).map((b) => b.id);
    const other = (await add('quote', { text: 'ailleurs' }, {})).body.block.id; // block of ANOTHER lesson
    for (const blockIds of [ids.slice(1), [...ids, other], [ids[0], ids[0], ids[1]], [], ['x']]) {
      assert.equal((await api('PUT', `/admin/courses/${course.id}/blocks/order`, { json: { blockIds } })).status, 400);
    }
    assert.deepEqual(await titles(), ['A', 'B', 'C']);
    const res = await api('PUT', `/admin/courses/${course.id}/blocks/order`, { json: { blockIds: [ids[2], ids[0], ids[1]] } });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.blocks.map((b) => b.data.text), ['C', 'A', 'B']);
    assert.deepEqual(await titles(), ['C', 'A', 'B']);
  });

  test('duplicating a block puts the copy right after it; a block that shows a file cannot be duplicated', async () => {
    const first = (await blocksOf(course.id))[0];
    const copy = await api('POST', `/admin/blocks/${first.id}/duplicate`);
    assert.equal(copy.status, 201);
    assert.deepEqual(await titles(), ['C', 'C', 'A', 'B']);
    const image = (await upload(PNG, {}, course.id)).body.block;
    assert.equal((await api('POST', `/admin/blocks/${image.id}/duplicate`)).status, 400);
  });

  test('deleting closes the gap', async () => {
    const [first] = await blocksOf(course.id);
    assert.equal((await api('DELETE', `/admin/blocks/${first.id}`)).status, 204);
    assert.deepEqual((await blocksOf(course.id)).map((b) => b.position), [0, 1, 2, 3]);
    assert.equal((await api('DELETE', `/admin/blocks/${first.id}`)).status, 404);
  });

  test('ten simultaneous insertions give ten distinct, contiguous positions (the lesson is locked while editing)', async () => {
    const race = await freshLesson('Course');
    const results = await Promise.all(Array.from({ length: 10 }, (_, i) => add('quote', { text: `q${i}` }, {}, race.id)));
    assert.ok(results.every((r) => r.status === 201));
    assert.deepEqual((await blocksOf(race.id)).map((b) => b.position), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test('a lesson holds at most 200 blocks (409 beyond)', async () => {
    const full = await freshLesson('Pleine');
    await t.prisma.lessonBlock.createMany({ data: Array.from({ length: 200 }, (_, position) => ({ courseId: full.id, type: 'quote', position, data: { text: 'x', author: '' } })) });
    assert.equal((await add('quote', { text: 'de trop' }, {}, full.id)).status, 409);
  });
});

describe('files', () => {
  let course;

  before(async () => {
    course = await freshLesson('Fichiers');
  });

  test('the block type follows the REAL type of the file: image, file (PDF), video', async () => {
    const image = await upload(PNG, { name: 'schema.png' }, course.id);
    const pdf = await upload(PDF, { name: 'support.pdf', type: 'application/pdf' }, course.id);
    const video = await upload(MP4, { name: 'cours.mp4', type: 'video/mp4' }, course.id);
    assert.deepEqual([image.status, pdf.status, video.status], [201, 201, 201]);
    assert.deepEqual([image.body.block.type, pdf.body.block.type, video.body.block.type], ['image', 'file', 'video']);
    assert.equal(image.body.block.data.alt, 'schema.png');
    assert.equal(pdf.body.block.data.label, 'support.pdf');
    assert.equal(image.body.block.media.kind, 'image');
    assert.match(image.body.block.media.url, /^\/api\/admin\/media\//);
    assert.ok(!JSON.stringify(image.body).includes('storageKey'));
  });

  test('what the browser claims does not matter: a PDF sent as "image/png" is a file block; a text file called .png is refused', async () => {
    const claimed = await upload(PDF, { name: 'faux.png', type: 'image/png' }, course.id);
    assert.equal(claimed.status, 201);
    assert.equal(claimed.body.block.type, 'file');
    const before = files().length;
    const fake = await upload(Buffer.from('ceci est du texte'), { name: 'image.png', type: 'image/png' }, course.id);
    assert.equal(fake.status, 415);
    assert.equal(files().length, before, 'no stored residue');
    assert.equal(await t.prisma.lessonBlock.count({ where: { courseId: course.id, type: 'image' } }), 1);
  });

  test('hostile files (SVG with script, HTML, PHP) are refused, and there is no residue', async () => {
    const before = files().length;
    for (const [name, bytes, type] of [['x.svg', HOSTILE.svg, 'image/svg+xml'], ['x.html', HOSTILE.html, 'text/html'], ['x.php', Buffer.from('<?php system($_GET[1]); ?>'), 'application/x-php']]) {
      assert.equal((await upload(bytes, { name, type }, course.id)).status, 415, name);
    }
    assert.equal(files().length, before);
  });

  test('"after" places the file block; an unknown lesson or block leaves no residue', async () => {
    const first = (await blocksOf(course.id))[0];
    const before = files().length;
    const placed = await upload(PNG, { name: 'inséré.png' }, course.id, { afterId: first.id });
    assert.equal(placed.status, 201);
    assert.equal((await blocksOf(course.id))[1].id, placed.body.block.id);
    const stored = files().length;
    assert.equal((await upload(PNG, {}, course.id, { afterId: '11111111-1111-4111-8111-111111111111' })).status, 400);
    assert.equal((await upload(PNG, {}, '11111111-1111-4111-8111-111111111111')).status, 404);
    assert.equal(files().length, stored, 'refused uploads leave nothing behind');
    assert.equal(stored, before + 1);
  });

  test('deleting a file block deletes the file too (row and stored file)', async () => {
    const block = (await upload(PNG, { name: 'a-supprimer.png' }, course.id)).body.block;
    const stored = files().length;
    assert.equal((await api('DELETE', `/admin/blocks/${block.id}`)).status, 204);
    assert.equal(files().length, stored - 1);
    assert.equal(await t.prisma.media.count({ where: { id: block.media.id } }), 0);
  });

  test('deleting the file itself (older route) removes the block that showed it', async () => {
    const block = (await upload(PNG, { name: 'x.png' }, course.id)).body.block;
    assert.equal((await api('DELETE', `/admin/media/${block.media.id}`)).status, 204);
    assert.equal(await t.prisma.lessonBlock.count({ where: { id: block.id } }), 0);
  });

  test('deleting the lesson removes its blocks, files and history', async () => {
    const gone = await freshLesson('À supprimer');
    await upload(PNG, {}, gone.id);
    await add('quote', { text: 'x' }, {}, gone.id);
    await add('quote', { text: 'y' }, {}, gone.id); // takes a snapshot (history)
    const stored = files().length;
    assert.equal((await api('DELETE', `/admin/courses/${gone.id}`)).status, 204);
    assert.equal(await t.prisma.lessonBlock.count({ where: { courseId: gone.id } }), 0);
    assert.equal(await t.prisma.lessonRevision.count({ where: { courseId: gone.id } }), 0);
    assert.equal(files().length, stored - 1);
  });

  test('the database refuses a block that shows a file of ANOTHER lesson, or a wrong type / media pair', async () => {
    const other = await freshLesson('Autre');
    const foreign = (await upload(PNG, {}, other.id)).body.block.media.id;
    await assert.rejects(t.prisma.lessonBlock.create({ data: { courseId: course.id, type: 'image', position: 99, data: { alt: '', caption: '' }, mediaId: foreign } }), 'foreign file');
    await assert.rejects(t.prisma.lessonBlock.create({ data: { courseId: course.id, type: 'image', position: 99, data: { alt: '', caption: '' } } }), 'image without file');
    await assert.rejects(t.prisma.lessonBlock.create({ data: { courseId: course.id, type: 'quote', position: 99, data: { text: 'x' }, mediaId: foreign } }), 'text with file');
    await assert.rejects(t.prisma.lessonBlock.create({ data: { courseId: course.id, type: 'poem', position: 0, data: {} } }), 'unknown type');
    await assert.rejects(t.prisma.lessonBlock.create({ data: { courseId: course.id, type: 'quote', position: -1, data: {} } }), 'negative position');
  });
});

describe('older way of writing a lesson keeps working, in step with the blocks', () => {
  test('PATCH body writes the first text block (created at the top, kept in place afterwards)', async () => {
    const course = await freshLesson('Ancien');
    await add('quote', { text: 'Déjà là' }, {}, course.id);
    const res = await api('PATCH', `/admin/courses/${course.id}`, { json: { body: '<p>Texte <strong>ancien</strong></p><script>1</script>' } });
    assert.equal(res.status, 200);
    let blocks = await blocksOf(course.id);
    assert.deepEqual(blocks.map((b) => b.type), ['text', 'quote']);
    assert.equal(blocks[0].data.html, '<p>Texte <strong>ancien</strong></p>');
    await api('PATCH', `/admin/courses/${course.id}`, { json: { body: '<p>Nouveau</p>' } });
    blocks = await blocksOf(course.id);
    assert.equal(blocks.length, 2);
    assert.equal(blocks[0].data.html, '<p>Nouveau</p>');
    await api('PATCH', `/admin/courses/${course.id}`, { json: { body: null } });
    assert.equal((await blocksOf(course.id))[0].data.html, '');
  });

  test('the older "attach a file" request also creates the block that shows it', async () => {
    const course = await freshLesson('Ancien 2');
    const res = await api('POST', `/admin/courses/${course.id}/media`, { form: fileForm(PDF, { name: 'annexe.pdf', type: 'application/pdf' }) });
    assert.equal(res.status, 201);
    const blocks = await blocksOf(course.id);
    assert.deepEqual(blocks.map((b) => b.type), ['file']);
    assert.equal(blocks[0].mediaId, res.body.media.id);
  });
});

describe('history', () => {
  let course;

  before(async () => {
    course = await freshLesson('Historique');
  });

  const revisions = async () => (await api('GET', `/admin/courses/${course.id}/revisions`)).body.revisions;

  test('the first edit of a lesson that has content keeps its previous state; the following ones (within 10 minutes) do not', async () => {
    await add('quote', { text: 'v1' }, {}, course.id); // empty lesson: nothing to keep yet
    assert.equal((await revisions()).length, 0);
    const b2 = (await add('quote', { text: 'v2' }, {}, course.id)).body.block; // now there is content: state kept
    assert.equal((await revisions()).length, 1);
    await api('PATCH', `/admin/blocks/${b2.id}`, { json: { data: { text: 'v2 modifié' } } });
    await api('PATCH', `/admin/blocks/${b2.id}`, { json: { data: { text: 'v2 encore' } } });
    assert.equal((await revisions()).length, 1, 'no new snapshot within the interval');
    await t.prisma.lessonRevision.updateMany({ where: { courseId: course.id }, data: { createdAt: new Date(Date.now() - 20 * 60 * 1000) } });
    await api('PATCH', `/admin/blocks/${b2.id}`, { json: { data: { text: 'v2 tard' } } });
    assert.equal((await revisions()).length, 2, 'an old snapshot triggers a new one');
  });

  test('a named version can be saved on demand, with its author', async () => {
    const res = await api('POST', `/admin/courses/${course.id}/revisions`, { json: { label: 'Avant relecture' } });
    assert.equal(res.status, 201);
    assert.equal(res.body.revision.label, 'Avant relecture');
    assert.equal(res.body.revision.blockCount, 2);
    assert.ok(res.body.revision.author?.name);
    assert.equal((await api('POST', `/admin/courses/${course.id}/revisions`, { json: { label: '' } })).status, 400);
  });

  test('restoring brings back the blocks of that version, and the state before restoring is kept (undoable)', async () => {
    const saved = (await api('POST', `/admin/courses/${course.id}/revisions`, { json: { label: 'V-restaurer' } })).body.revision;
    const [first] = await blocksOf(course.id);
    await api('DELETE', `/admin/blocks/${first.id}`);
    await add('quote', { text: 'ajout après' }, {}, course.id);
    const before = (await blocksOf(course.id)).map((b) => b.data.text);
    const res = await api('POST', `/admin/courses/${course.id}/revisions/${saved.id}/restore`);
    assert.equal(res.status, 200);
    assert.equal(res.body.blocks.length, 2);
    assert.ok(!res.body.blocks.some((b) => b.data.text === 'ajout après'));
    assert.deepEqual((await blocksOf(course.id)).map((b) => b.position), [0, 1]);
    const list = await revisions();
    const undo = list.find((r) => r.label === 'before-restore');
    assert.ok(undo, 'the state before restoring is a version too');
    // restoring THAT version brings the "after" state back
    await api('POST', `/admin/courses/${course.id}/revisions/${undo.id}/restore`);
    assert.deepEqual((await blocksOf(course.id)).map((b) => b.data.text), before);
  });

  test('a block whose file was deleted since is skipped when restoring (a deleted file does not come back)', async () => {
    const c = await freshLesson('Restauration fichier');
    await add('quote', { text: 'texte' }, {}, c.id);
    const image = (await upload(PNG, {}, c.id)).body.block;
    const version = (await api('POST', `/admin/courses/${c.id}/revisions`, { json: { label: 'avec image' } })).body.revision;
    await api('DELETE', `/admin/blocks/${image.id}`);
    const res = await api('POST', `/admin/courses/${c.id}/revisions/${version.id}/restore`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.blocks.map((b) => b.type), ['quote']);
  });

  test('a version of ANOTHER lesson cannot be restored here (404), nor an unknown one', async () => {
    const other = await freshLesson('Autre historique');
    await add('quote', { text: 'x' }, {}, other.id);
    const foreign = (await api('POST', `/admin/courses/${other.id}/revisions`, { json: { label: 'étrangère' } })).body.revision;
    assert.equal((await api('POST', `/admin/courses/${course.id}/revisions/${foreign.id}/restore`)).status, 404);
    assert.equal((await api('POST', `/admin/courses/${course.id}/revisions/11111111-1111-4111-8111-111111111111/restore`)).status, 404);
    assert.equal((await api('GET', '/admin/courses/11111111-1111-4111-8111-111111111111/revisions')).status, 404);
  });

  test('only the 30 most recent versions are kept', async () => {
    const c = await freshLesson('Beaucoup');
    await add('quote', { text: 'x' }, {}, c.id);
    for (let i = 0; i < 33; i += 1) await api('POST', `/admin/courses/${c.id}/revisions`, { json: { label: `v${i}` } });
    const list = (await api('GET', `/admin/courses/${c.id}/revisions`)).body.revisions;
    assert.equal(list.length, 30);
    assert.equal(list[0].label, 'v32');
    assert.ok(!list.some((r) => r.label === 'v0'));
  });
});

describe('who may do what', () => {
  test('every block and history route: 401 anonymous, 403 for a learner, and nothing changes', async () => {
    const c = await freshLesson('Droits');
    const block = (await add('quote', { text: 'protégé' }, {}, c.id)).body.block;
    const routes = [
      ['POST', `/admin/courses/${c.id}/blocks`, { type: 'quote', data: { text: 'x' } }],
      ['POST', `/admin/courses/${c.id}/blocks/upload`, undefined],
      ['PUT', `/admin/courses/${c.id}/blocks/order`, { blockIds: [block.id] }],
      ['PATCH', `/admin/blocks/${block.id}`, { data: { text: 'piraté' } }],
      ['POST', `/admin/blocks/${block.id}/duplicate`, undefined],
      ['DELETE', `/admin/blocks/${block.id}`, undefined],
      ['GET', `/admin/courses/${c.id}/revisions`, undefined],
      ['POST', `/admin/courses/${c.id}/revisions`, { label: 'x' }],
      ['POST', `/admin/courses/${c.id}/revisions/11111111-1111-4111-8111-111111111111/restore`, undefined],
    ];
    for (const [method, url, json] of routes) {
      assert.equal((await t.request(method, url, { json })).status, 401, `anonymous ${method} ${url}`);
      assert.equal((await t.request(method, url, { user: learner, json })).status, 403, `learner ${method} ${url}`);
    }
    assert.deepEqual((await blocksOf(c.id)).map((b) => b.data.text), ['protégé']);
  });
});

describe('what the learner receives', () => {
  let course;
  let formation;
  let fileBlock;

  before(async () => {
    formation = await t.formation({ title: 'Lecture', courses: [{ title: 'Avec blocs', body: null }, { title: 'Ancienne', body: '<p>Texte ancien</p>' }] });
    course = formation.courses[0];
    await t.prisma.course.update({ where: { id: course.id }, data: { body: null } });
    await add('text', { html: '<p>Introduction</p>' }, {}, course.id);
    await add('code', { language: 'sql', code: 'SELECT 1;' }, {}, course.id);
    fileBlock = (await upload(PDF, { name: 'guide.pdf', type: 'application/pdf' }, course.id)).body.block;
    await t.prisma.enrollment.create({ data: { userId: learner.id, formationId: formation.id } });
  });

  const read = (id, user = learner) => t.request('GET', `/learn/formations/${formation.slug}/courses/${id}`, { user });

  test('the blocks in order, with the authorised URL of the file and no storage key', async () => {
    const res = await read(course.id);
    assert.equal(res.status, 200);
    const { blocks } = res.body.course;
    assert.deepEqual(blocks.map((b) => b.type), ['text', 'code', 'file']);
    assert.deepEqual(blocks[1].data, { language: 'sql', code: 'SELECT 1;', caption: '' });
    assert.equal(blocks[2].media.url, `/api/learn/media/${fileBlock.media.id}`);
    assert.ok(!res.text.includes('storageKey') && !res.text.includes(fileBlock.media.id.replace(/-/g, '') + '.pdf'));
    assert.deepEqual(Object.keys(blocks[0]).sort(), ['data', 'id', 'media', 'type']);
  });

  test('older clients still get `body` and `media` (derived from the blocks)', async () => {
    const { course: c } = (await read(course.id)).body;
    assert.equal(c.body, '<p>Introduction</p>');
    assert.equal(c.media.length, 1);
    assert.equal(c.media[0].kind, 'document');
  });

  test('a lesson WITHOUT blocks is still served the old way (body), with an empty block list', async () => {
    const old = formation.courses[1];
    await t.prisma.lessonBlock.deleteMany({ where: { courseId: old.id } });
    const { course: c } = (await read(old.id)).body;
    assert.deepEqual(c.blocks, []);
    assert.equal(c.body, '<p>Texte ancien</p>');
  });

  test('the file of a block is served to the enrolled learner and to nobody else', async () => {
    const url = `/learn/media/${fileBlock.media.id}`;
    assert.equal((await t.request('GET', url, { user: learner })).status, 200);
    assert.equal((await t.request('GET', url)).status, 401);
    const stranger = await t.user();
    assert.equal((await t.request('GET', url, { user: stranger })).status, 403);
    assert.equal((await read(course.id, stranger)).status, 403);
  });

  test('the ready-to-publish checklist counts real block content only', async () => {
    const f = await t.formation({ title: 'Prête ?', courses: [{ title: 'L', body: null }] });
    await t.prisma.course.update({ where: { id: f.courses[0].id }, data: { body: null } });
    await add('text', { html: '' }, {}, f.courses[0].id);
    await add('code', { code: '   ' }, {}, f.courses[0].id);
    let readiness = (await api('GET', `/admin/formations/${f.id}`)).body.formation.readiness;
    assert.equal(readiness.items.find((i) => i.key === 'coursesContent').ok, false, 'empty blocks are not content');
    await add('quote', { text: 'Vrai contenu' }, {}, f.courses[0].id);
    readiness = (await api('GET', `/admin/formations/${f.id}`)).body.formation.readiness;
    assert.equal(readiness.items.find((i) => i.key === 'coursesContent').ok, true);
  });
});

describe('migration of the existing lessons', () => {
  test('the data migration turns text and files into blocks, in reading order, and can run twice', async () => {
    const dir = path.join(SERVER_DIR, 'prisma/migrations');
    const name = readdirSync(dir).find((n) => n.endsWith('_lesson_blocks'));
    const migration = readFileSync(path.join(dir, name, 'migration.sql'), 'utf8');
    const data = migration.slice(migration.indexOf('INSERT INTO "lesson_blocks"'));

    // legacy lessons: text + files, no blocks (as they were before this change)
    const f = await t.formation({ title: 'Héritage', courses: [{ title: 'Texte et fichiers', body: '<p>Ancien texte</p>' }, { title: 'Texte seul', body: '<p>Seul</p>' }, { title: 'Fichier seul', body: null }, { title: 'Vide', body: null }] });
    const [both, textOnly, fileOnly, empty] = f.courses;
    await t.prisma.course.update({ where: { id: fileOnly.id }, data: { body: null } });
    await t.prisma.course.update({ where: { id: empty.id }, data: { body: null } });
    const media = (courseId, kind, originalName, ageMinutes) =>
      t.prisma.media.create({ data: { kind, storageKey: `${randomBytes(16).toString('hex')}.bin`, originalName, mimeType: 'application/octet-stream', sizeBytes: 1, courseId, createdAt: new Date(Date.now() - ageMinutes * 60_000) } });
    const second = await media(both.id, 'document', 'b.pdf', 1);
    const first = await media(both.id, 'image', 'a.png', 5);
    await media(fileOnly.id, 'video', 'v.mp4', 3);
    await t.prisma.lessonBlock.deleteMany({ where: { courseId: { in: f.courses.map((c) => c.id) } } });

    const statements = data.split(/;\s*\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('--'));
    for (let run = 1; run <= 2; run += 1) {
      for (const statement of statements) await t.prisma.$executeRawUnsafe(statement);
      const shape = async (id) => (await blocksOf(id)).map((b) => `${b.position}:${b.type}`);
      assert.deepEqual(await shape(both.id), ['0:text', '1:image', '2:file'], `run ${run}: text first, then files in upload order`);
      assert.deepEqual(await shape(textOnly.id), ['0:text']);
      assert.deepEqual(await shape(fileOnly.id), ['0:video']);
      assert.deepEqual(await shape(empty.id), [], 'a lesson with nothing gets no block');
    }
    const blocks = await blocksOf(both.id);
    assert.equal(blocks[0].data.html, '<p>Ancien texte</p>');
    assert.equal(blocks[1].mediaId, first.id);
    assert.equal(blocks[2].mediaId, second.id);
    assert.deepEqual(blocks[1].data, { alt: 'a.png', caption: '' });
    assert.equal((await t.prisma.course.findUnique({ where: { id: both.id } })).body, '<p>Ancien texte</p>', 'the old text column is kept (nothing is lost)');
  });
});

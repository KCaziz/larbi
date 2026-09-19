import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { HOSTILE, MP4, PDF, PNG, fileForm } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';

// P2-06 — private files: who can read a lesson file, what the server exposes,
// how it answers to tampering. Files are created through the real admin API.

let t;
let admin;
let A; // enrolled learner
let B; // logged in, NOT enrolled
let PREM;
let F; // standard published formation with a video, a PDF and an image
let FP; // premium published formation
let FD; // draft formation (with files)
let F2; // another published formation
const UUID0 = '00000000-0000-4000-8000-000000000000';
const sha = (buf) => createHash('sha256').update(buf).digest('hex');

async function build(title, { premium = false, publish = true } = {}) {
  const f = (await t.request('POST', '/admin/formations', { user: admin, json: { title } })).body.formation;
  await t.request('PATCH', `/admin/formations/${f.id}`, { user: admin, json: { description: 'Desc', requiredAccessLevel: premium ? 'premium' : 'standard', certificationTitle: 'C' } });
  const cover = await t.request('POST', `/admin/formations/${f.id}/cover`, { user: admin, form: fileForm(PNG) });
  const c = (await t.request('POST', `/admin/formations/${f.id}/courses`, { user: admin, json: { title: 'Leçon' } })).body.course;
  await t.request('PATCH', `/admin/courses/${c.id}`, { user: admin, json: { body: '<p>Texte</p>' } });
  const up = async (bytes, opts) => (await t.request('POST', `/admin/courses/${c.id}/media`, { user: admin, form: fileForm(bytes, opts) })).body.media;
  const mp4 = await up(MP4, { name: 'video.mp4', type: 'video/mp4' });
  const pdf = await up(PDF, { name: 'doc.pdf', type: 'application/pdf' });
  const img = await up(PNG, { name: 'schema.png' });
  if (publish) assert.equal((await t.request('POST', `/admin/formations/${f.id}/publish`, { user: admin })).status, 200);
  const row = await t.prisma.formation.findUnique({ where: { id: f.id } });
  return { id: f.id, slug: row.slug, coverId: cover.body.media.id, course: c, mp4, pdf, img };
}
const url = (m) => `/learn/media/${m.id}`;
const get = (path, opts) => t.request('GET', path, opts);

// fetch() adds "Cache-Control: no-cache" to conditional requests, which disables 304.
const rawGet = (path, user, headers) =>
  new Promise((resolve, reject) => {
    const req = http.request(`${t.baseUrl}/api${path}`, { method: 'GET', headers: { Cookie: `session=${t.signSession(user.id)}`, ...headers } }, (res) => {
      res.resume();
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', reject);
    req.end();
  });

before(async () => {
  t = await boot();
  await t.reset();
  admin = await t.admin();
  A = await t.user();
  B = await t.user();
  PREM = await t.user({ accessLevel: 'premium' });
  F = await build('Standard');
  FP = await build('Premium', { premium: true });
  FD = await build('Brouillon', { publish: false });
  F2 = await build('Autre');
  await t.request('POST', `/learn/formations/${F.slug}/enroll`, { user: A });
  await t.request('POST', `/learn/formations/${FP.slug}/enroll`, { user: PREM });
});
after(() => t.close());

describe('private storage', () => {
  test('stored names are random and typed by the SNIFFED content; files live in the storage folder only', async () => {
    const rows = await t.prisma.media.findMany();
    assert.ok(rows.length >= 12);
    for (const m of rows) {
      assert.match(m.storageKey, /^[a-f0-9]{32}\.(png|pdf|mp4)$/);
      assert.ok(t.storedFiles().includes(m.storageKey));
    }
  });

  test('no static route serves the storage folder, in any spelling', async () => {
    const key = (await t.prisma.media.findFirst({ where: { kind: 'video' } })).storageKey;
    for (const p of [`/storage/private/${key}`, `/private/${key}`, `/uploads/${key}`, `/static/${key}`, `/public/${key}`, `/files/${key}`, `/api/storage/private/${key}`, `/api/private/${key}`, `/api/uploads/${key}`, '/storage/', '/storage/private/', `/../storage/private/${key}`, `/%2e%2e/storage/private/${key}`, `/api/%2e%2e/storage/private/${key}`]) {
      const res = await t.request('GET', p, { raw: true });
      assert.equal(res.status, 404, p);
      assert.ok(!res.buffer.includes(MP4.subarray(0, 24)), p);
    }
  });

  test('no JSON response — catalogue, lesson, admin, upload, error — reveals a storage key or path', async () => {
    const leak = /[a-f0-9]{32}\.(png|jpg|webp|pdf|mp4|webm)|storageKey|storage[/\\]|private[/\\]|[A-Za-z]:[/\\]/i;
    const responses = {
      catalogue: await get('/learn/formations', { user: A }),
      detail: await get(`/learn/formations/${F.slug}`, { user: A }),
      lesson: await get(`/learn/formations/${F.slug}/courses/${F.course.id}`, { user: A }),
      enrolments: await get('/learn/enrollments', { user: A }),
      adminList: await get('/admin/formations', { user: admin }),
      adminOne: await get(`/admin/formations/${F.id}`, { user: admin }),
      denied: await get(url(F.mp4), { user: B }),
      unknown: await get(url({ id: UUID0 }), { user: A }),
      malformed: await get('/learn/media/not-a-uuid', { user: A }),
      upload: await t.request('POST', `/admin/courses/${F.course.id}/media`, { user: admin, form: fileForm(PNG, { name: '../../evil.png' }) }),
    };
    for (const [label, res] of Object.entries(responses)) {
      const payload = res.text.replace(/"stack":"[^"]*"/g, '');
      assert.doesNotMatch(payload, leak, label);
    }
    assert.equal(responses.upload.body.media.originalName, 'evil.png', 'a hostile name is reduced to its base name');
  });
});

describe('who may read a lesson file', () => {
  test('anonymous 401 · not enrolled 403 · enrolled 200 with the exact bytes', async () => {
    assert.equal((await get(url(F.mp4))).status, 401);
    const denied = await get(url(F.mp4), { user: B });
    assert.equal(denied.status, 403);
    assert.equal(denied.body.error.details.reason, 'not_enrolled');
    assert.ok(!denied.buffer.includes(MP4.subarray(0, 40)), 'a refusal carries no file bytes');
    const ok = await get(url(F.mp4), { user: A });
    assert.equal(ok.status, 200);
    assert.equal(sha(ok.buffer), sha(MP4));
  });

  test('response headers: type from our database, PDF forced to download, hardening headers', async () => {
    const video = await get(url(F.mp4), { user: A });
    assert.equal(video.headers.get('content-type'), 'video/mp4');
    assert.match(video.headers.get('content-disposition'), /^inline/);
    assert.equal(video.headers.get('x-content-type-options'), 'nosniff');
    assert.match(video.headers.get('content-security-policy'), /sandbox/);
    assert.match(video.headers.get('cache-control'), /private/);
    assert.match(video.headers.get('cache-control'), /no-store/);
    assert.equal(video.headers.get('cross-origin-resource-policy'), 'same-origin');
    const pdf = await get(url(F.pdf), { user: A });
    assert.equal(sha(pdf.buffer), sha(PDF));
    assert.match(pdf.headers.get('content-disposition'), /^attachment/);
    assert.equal(sha((await get(url(F.img), { user: A })).buffer), sha(PNG));
  });

  test('HEAD obeys the same rules as GET', async () => {
    assert.equal((await t.request('HEAD', `/learn/media/${F.mp4.id}`)).status, 401);
    assert.equal((await t.request('HEAD', `/learn/media/${F.mp4.id}`, { user: B })).status, 403);
    assert.equal((await t.request('HEAD', `/learn/media/${F.mp4.id}`, { user: A })).status, 200);
  });

  test("another formation's files, a cover and unknown ids are refused", async () => {
    assert.equal((await get(url(F2.mp4), { user: A })).status, 403);
    assert.equal((await get(`/learn/media/${F.coverId}`, { user: A })).status, 404, 'a cover is not a lesson file');
    for (const id of ['not-a-uuid', '..%2F..%2Fetc%2Fpasswd', UUID0, `${F.mp4.id}%00.png`]) assert.equal((await get(`/learn/media/${id}`, { user: A })).status, 404, id);
    assert.ok([403, 404].includes((await get(`/learn/media/${F.mp4.id}/../${F2.mp4.id}`, { user: A })).status));
  });

  test('files of an UNPUBLISHED formation do not reveal their existence to strangers (404, not 403)', async () => {
    assert.equal((await get(url(FD.mp4), { user: B })).status, 404);
    assert.equal((await get(url(FD.mp4), { user: A })).status, 404);
  });

  test('forged sessions and unknown accounts are refused', async () => {
    assert.equal((await get(url(F.mp4), { token: 'forged.jwt.value' })).status, 401);
    assert.equal((await get(url(F.mp4), { token: t.signSession(UUID0) })).status, 401);
  });

  test('rights are re-checked on EVERY request: premium lost, enrolment removed, both take effect at once', async () => {
    assert.equal((await get(url(FP.mp4), { user: PREM })).status, 200);
    await t.prisma.user.update({ where: { id: PREM.id }, data: { accessLevel: 'standard' } });
    const lost = await get(url(FP.mp4), { user: PREM });
    assert.equal(lost.status, 403);
    assert.equal(lost.body.error.details.reason, 'premium_required');
    await t.prisma.user.update({ where: { id: PREM.id }, data: { accessLevel: 'premium' } });
    assert.equal((await get(url(FP.mp4), { user: PREM })).status, 200);
    await t.prisma.enrollment.deleteMany({ where: { userId: A.id, formationId: F.id } });
    assert.equal((await get(url(F.mp4), { user: A })).status, 403);
    await t.request('POST', `/learn/formations/${F.slug}/enroll`, { user: A });
    assert.equal((await get(url(F.mp4), { user: A })).status, 200);
  });

  test('the administration preview route is for administrators only', async () => {
    assert.equal((await get(`/admin/media/${F.mp4.id}/file`)).status, 401);
    assert.equal((await get(`/admin/media/${F.mp4.id}/file`, { user: A })).status, 403);
    assert.equal(sha((await get(`/admin/media/${F.mp4.id}/file`, { user: admin })).buffer), sha(MP4));
  });

  test('the cover: any signed-in user sees a published one; a draft one is unknown', async () => {
    assert.equal((await get(`/learn/formations/${F.slug}/cover`)).status, 401);
    const ok = await get(`/learn/formations/${F.slug}/cover`, { user: B });
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get('content-type'), 'image/png');
    assert.equal((await get(`/learn/formations/${FD.slug}/cover`, { user: B })).status, 404);
  });
});

describe('cross-origin and caching', () => {
  test('a foreign origin gets no CORS permission, the site origin does', async () => {
    const evil = await get(url(F.mp4), { user: A, headers: { Origin: 'http://evil.example' } });
    assert.equal(evil.headers.get('access-control-allow-origin'), null);
    const own = await get('/blog/articles', { headers: { Origin: 'http://localhost:5173' } });
    assert.equal(own.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.equal(own.headers.get('access-control-allow-credentials'), 'true');
  });

  test('conditional requests: the authorised learner gets 304, an unauthorised user is still refused', async () => {
    const etag = (await get(url(F.mp4), { user: A })).headers.get('etag');
    assert.ok(etag);
    assert.equal(await rawGet(url(F.mp4), A, { 'If-None-Match': etag }), 304);
    assert.equal(await rawGet(url(F.mp4), B, { 'If-None-Match': etag }), 403, 'knowing the ETag opens nothing');
  });

  test('Range: partial content, 416 for impossible ranges, never more than the file', async () => {
    const part = await get(url(F.mp4), { user: A, headers: { Range: 'bytes=0-9' } });
    assert.equal(part.status, 206);
    assert.equal(part.buffer.length, 10);
    assert.match(part.headers.get('content-range'), /^bytes 0-9\//);
    assert.equal((await get(url(F.mp4), { user: A, headers: { Range: 'bytes=99999999-' } })).status, 416);
    const multi = await get(url(F.mp4), { user: A, headers: { Range: 'bytes=0-1,5-6,10-11' } });
    assert.ok(multi.buffer.length <= MP4.length + 600);
    const garbage = await get(url(F.mp4), { user: A, headers: { Range: 'bytes=abc' } });
    assert.ok([200, 416].includes(garbage.status));
  });
});

describe('hostile uploads', () => {
  test('every hostile file is refused by its content and leaves nothing on disk', async () => {
    const before = { priv: t.storedFiles().length, tmp: t.storedFiles('tmp').length };
    for (const [label, h] of Object.entries(HOSTILE)) {
      const res = await t.request('POST', `/admin/courses/${F.course.id}/media`, { user: admin, form: fileForm(h.bytes, { name: h.name, type: h.type }) });
      assert.ok([400, 415].includes(res.status), `${label} -> ${res.status}`);
    }
    assert.deepEqual({ priv: t.storedFiles().length, tmp: t.storedFiles('tmp').length }, before);
  });

  test('wrong field name, two files, no body, oversized image: refused, nothing kept', async () => {
    const before = { priv: t.storedFiles().length, tmp: t.storedFiles('tmp').length };
    const path = `/admin/courses/${F.course.id}/media`;
    assert.equal((await t.request('POST', path, { user: admin, form: fileForm(PNG, { field: 'other' }) })).status, 400);
    const two = fileForm(PNG);
    two.append('file', new Blob([PNG], { type: 'image/png' }), 'second.png');
    const res = await t.request('POST', path, { user: admin, form: two });
    assert.ok(res.status >= 400 && res.status < 500, String(res.status));
    const empty = await t.request('POST', path, { user: admin });
    assert.ok(empty.status >= 400 && empty.status < 500);
    assert.equal((await t.request('POST', path, { user: admin, form: fileForm(Buffer.concat([PNG, Buffer.alloc(6 * 1024 * 1024, 1)]), { name: 'big.png' }) })).status, 413);
    assert.deepEqual({ priv: t.storedFiles().length, tmp: t.storedFiles('tmp').length }, before);
  });

  test('a PNG carrying a script is stored as a plain image and served so it cannot run', async () => {
    const poly = await t.request('POST', `/admin/courses/${F.course.id}/media`, { user: admin, form: fileForm(Buffer.concat([PNG, Buffer.from('<script>alert(1)</script>')]), { name: 'poly.png' }) });
    assert.equal(poly.status, 201);
    assert.equal(poly.body.media.mimeType, 'image/png');
    const served = await get(url(poly.body.media), { user: A });
    assert.equal(served.headers.get('content-type'), 'image/png');
    assert.equal(served.headers.get('x-content-type-options'), 'nosniff');
    assert.match(served.headers.get('content-security-policy'), /sandbox/);
  });
});

describe('cleanup', () => {
  test('deleting formations through the API removes every one of their files from disk', async () => {
    const media = await t.prisma.media.findMany({ where: { OR: [{ course: { formationId: { in: [FD.id, F2.id] } } }, { id: { in: [FD.coverId, F2.coverId] } }] } });
    const keys = media.map((m) => m.storageKey);
    assert.ok(keys.length >= 8);
    for (const f of [FD, F2]) assert.equal((await t.request('DELETE', `/admin/formations/${f.id}`, { user: admin })).status, 204);
    assert.deepEqual(keys.filter((k) => t.storedFiles().includes(k)), []);
    assert.equal(await t.prisma.media.count({ where: { id: { in: media.map((m) => m.id) } } }), 0);
  });
});

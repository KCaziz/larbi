import '../helpers/setup-env.js';
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import { HOSTILE, MP4, PDF, PNG } from '../helpers/fixtures.js';
import { PRIVATE_DIR, cleanOriginalName, ingestUpload, pathForKey, removeStored } from '../../src/services/storage.service.js';
import { signSession, verifySession } from '../../src/services/token.service.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { asyncRoute, uuidParam } from '../../src/utils/asyncRoute.js';
import { HttpError } from '../../src/utils/httpError.js';
import { toMedia, toAdminArticle } from '../../src/serializers/cms.js';
import { toArticleCard, toArticleDetail } from '../../src/serializers/blog.js';
import { toCertificateView, toCatalogItem, toEnrollmentSummary, toFormationDetail, toPublicCertificate } from '../../src/serializers/learner.js';
import { env } from '../../src/config/env.js';

const scratch = mkdtempSync(path.join(tmpdir(), 'larbi-unit-'));
after(() => rmSync(scratch, { recursive: true, force: true }));
const tempFile = (bytes, name = 'upload') => {
  const file = path.join(scratch, `${name}-${Math.random().toString(16).slice(2)}`);
  writeFileSync(file, bytes);
  return { path: file, size: bytes.length, originalname: name };
};

describe('storage: file names', () => {
  test('cleanOriginalName keeps only a harmless base name', () => {
    assert.equal(cleanOriginalName('../../etc/passwd'), 'passwd');
    assert.equal(cleanOriginalName('C:\\Users\\x\\evil.png'.replaceAll('\\', '/')), 'evil.png');
    assert.equal(cleanOriginalName('a\u0000b\u001f.png'), 'ab.png');
    assert.equal(cleanOriginalName('x'.repeat(500)).length, 200);
    for (const empty of ['', null, undefined, '/', '..']) assert.match(cleanOriginalName(empty), /^(file|\.\.)$/);
  });

  test('pathForKey only accepts our own random keys (no traversal)', () => {
    assert.equal(path.dirname(pathForKey('a'.repeat(32) + '.png')), PRIVATE_DIR);
    for (const bad of ['../../secret.png', 'a'.repeat(32), 'a'.repeat(31) + '.png', `${'a'.repeat(32)}.toolong`, `${'a'.repeat(32)}.p`, `${'A'.repeat(32)}.png`, '..', '', `${'a'.repeat(32)}.png/../x`, `${'a'.repeat(32)}.png\u0000`]) {
      assert.throws(() => pathForKey(bad), HttpError, bad);
    }
  });
});

describe('storage: uploads are judged by their CONTENT', () => {
  test('accepted types get a random name and the extension of the detected type', async () => {
    const cases = [[PNG, 'image', 'image/png', 'png'], [PDF, 'document', 'application/pdf', 'pdf'], [MP4, 'video', 'video/mp4', 'mp4']];
    for (const [bytes, kind, mime, ext] of cases) {
      const file = tempFile(bytes, `renamed.${kind === 'image' ? 'exe' : 'txt'}`);
      const stored = await ingestUpload(file, ['image', 'document', 'video']);
      assert.equal(stored.kind, kind);
      assert.equal(stored.mimeType, mime);
      assert.match(stored.storageKey, new RegExp(`^[a-f0-9]{32}\\.${ext}$`));
      assert.ok(existsSync(path.join(PRIVATE_DIR, stored.storageKey)));
      assert.equal(existsSync(file.path), false, 'the temporary file was moved');
      await removeStored([stored.storageKey]);
      assert.equal(existsSync(path.join(PRIVATE_DIR, stored.storageKey)), false);
    }
  });

  test('every hostile file is refused with 415 and leaves nothing behind', async () => {
    const before = readdirSync(PRIVATE_DIR).length;
    for (const [label, h] of Object.entries(HOSTILE)) {
      const file = tempFile(h.bytes, h.name);
      await assert.rejects(() => ingestUpload(file, ['image', 'document', 'video']), (err) => err instanceof HttpError && err.statusCode === 415, label);
      assert.equal(existsSync(file.path), false, `${label}: temp file removed`);
    }
    assert.equal(readdirSync(PRIVATE_DIR).length, before);
  });

  test('a valid file of a kind the endpoint does not accept is refused (PDF as a cover)', async () => {
    const file = tempFile(PDF);
    await assert.rejects(() => ingestUpload(file, ['image']), (err) => err.statusCode === 415);
    assert.equal(existsSync(file.path), false);
  });

  test('the size limit of each kind is enforced (413) and cleaned up', async () => {
    const big = Buffer.concat([PNG, Buffer.alloc(env.maxImageBytes + 1)]);
    const file = tempFile(big);
    await assert.rejects(() => ingestUpload(file, ['image']), (err) => err.statusCode === 413);
    assert.equal(existsSync(file.path), false);
  });

  test('no file at all is a 400', async () => {
    await assert.rejects(() => ingestUpload(undefined, ['image']), (err) => err.statusCode === 400);
  });

  test('a stored file is not executable and lives only in the private folder', async () => {
    const stored = await ingestUpload(tempFile(PNG), ['image']);
    const full = path.join(PRIVATE_DIR, stored.storageKey);
    assert.equal(path.dirname(full), PRIVATE_DIR);
    assert.ok(statSync(full).isFile());
    await removeStored([stored.storageKey, '../../nope.png', 'not-a-key']);
  });
});

describe('session token', () => {
  test('round trip: the subject is the user id', () => {
    assert.equal(verifySession(signSession('user-1')).sub, 'user-1');
  });

  test('a tampered, unsigned, foreign or expired token is refused', () => {
    const good = signSession('user-1');
    const [h, p, s] = good.split('.');
    const forgedPayload = Buffer.from(JSON.stringify({ sub: 'admin-1', iat: 1 })).toString('base64url');
    const candidates = {
      'changed payload': `${h}.${forgedPayload}.${s}`,
      'stripped signature': `${h}.${p}.`,
      'alg none': `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${p}.`,
      'other secret': jwt.sign({}, 'another-secret-another-secret-another-secret', { subject: 'user-1' }),
      expired: jwt.sign({}, env.jwtSecret, { subject: 'user-1', expiresIn: -10 }),
      'HS512 instead of HS256': jwt.sign({}, env.jwtSecret, { subject: 'user-1', algorithm: 'HS512' }),
      garbage: 'not.a.jwt',
      empty: '',
    };
    for (const [label, token] of Object.entries(candidates)) assert.throws(() => verifySession(token), undefined, label);
  });
});

describe('error handling', () => {
  const respond = (err) => {
    const res = { statusCode: null, body: null, status(code) { this.statusCode = code; return this; }, json(b) { this.body = b; return this; } };
    const original = console.error;
    console.error = () => {};
    try {
      errorHandler(err, {}, res, () => {});
    } finally {
      console.error = original;
    }
    return res;
  };

  test('HttpError keeps its status, message and safe details', () => {
    const res = respond(new HttpError(422, 'Not ready', { missing: ['cover'] }));
    assert.equal(res.statusCode, 422);
    assert.equal(res.body.error.message, 'Not ready');
    assert.deepEqual(res.body.error.details, { missing: ['cover'] });
  });

  test('an unexpected error is a 500 (never a status taken from the error text)', () => {
    assert.equal(respond(new Error('boom')).statusCode, 500);
    assert.equal(respond({ statusCode: 200, message: 'x' }).statusCode, 500);
  });

  test('asyncRoute turns Prisma "not found" and "duplicate" into 404 and 409', async () => {
    const run = (code) => new Promise((resolve) => asyncRoute(async () => { throw Object.assign(new Error('x'), { code }); })({}, {}, resolve));
    assert.equal((await run('P2025')).statusCode, 404);
    assert.equal((await run('P2002')).statusCode, 409);
    assert.equal((await run('P9999')).message, 'x');
  });

  test('uuidParam lets valid ids through and answers 404 for anything else', () => {
    const run = (value) => new Promise((resolve) => uuidParam({}, {}, resolve, value));
    return Promise.all([
      run('00000000-0000-4000-8000-000000000000').then((e) => assert.equal(e, undefined)),
      ...['nope', '', '../etc', '00000000-0000-4000-8000-00000000000g', "' OR 1=1"].map((v) => run(v).then((e) => assert.equal(e.statusCode, 404, v))),
    ]);
  });
});

describe('serializers expose an explicit allow-list', () => {
  const media = { id: 'm1', kind: 'image', originalName: 'a.png', mimeType: 'image/png', sizeBytes: 3, storageKey: 'a'.repeat(32) + '.png', uploadedById: 'u1', courseId: 'c1', createdAt: new Date() };
  const noStorage = (value) => assert.doesNotMatch(JSON.stringify(value), /storageKey|[a-f0-9]{32}\.png|uploadedById/);

  test('a media never carries its storage key or its uploader', () => {
    assert.deepEqual(Object.keys(toMedia(media)).sort(), ['id', 'kind', 'mimeType', 'originalName', 'sizeBytes', 'url']);
    noStorage(toMedia(media));
    assert.equal(toMedia(null), null);
  });

  const article = {
    id: 'a1', slug: 'mon-article', title: 'T', excerpt: 'E', body: '<p>x</p>', bodyText: 'x', status: 'published', publishedAt: new Date(), updatedAt: new Date(),
    coverImageId: 'cov', categoryId: 'k', category: { id: 'k', name: 'Cat', slug: 'cat' }, tags: [{ tagId: 't1', tag: { name: 'B', slug: 'b' } }, { tagId: 't2', tag: { name: 'A', slug: 'a' } }],
    author: { name: 'Camille', email: 'camille@private.test' }, authorId: 'u1', metaTitle: null, metaDescription: null, media: [media], coverImage: media,
  };

  test('public article card and page: no id, e-mail, status, author id or storage key', () => {
    const card = toArticleCard(article);
    assert.deepEqual(Object.keys(card).sort(), ['author', 'category', 'coverUrl', 'excerpt', 'lockReason', 'locked', 'publishedAt', 'readingMinutes', 'requiredAccessLevel', 'slug', 'tags', 'title']);
    assert.deepEqual(card.author, { name: 'Camille' }, 'the author e-mail is never public');
    assert.deepEqual(card.tags.map((t) => t.name), ['A', 'B'], 'sorted');
    const detail = toArticleDetail(article, { related: [{ article, lock: null }] });
    for (const value of [card, detail]) {
      noStorage(value);
      assert.doesNotMatch(JSON.stringify(value), /camille@private|authorId|"status"|bodyText|"id":"a1"/);
    }
    assert.deepEqual(detail.seo, { title: 'T', description: 'E' }, 'falls back to title and summary');
    assert.equal(detail.related.length, 1);
  });

  test('admin article: everything the editor needs, still no storage key', () => {
    const admin = toAdminArticle(article);
    noStorage(admin);
    assert.equal(admin.publicPath, '/blog/mon-article');
    assert.equal(Object.hasOwn(admin, 'slug'), false);
    assert.equal(toAdminArticle({ ...article, status: 'draft' }).publicPath, null);
  });

  test('learner views: certificate fields and lesson list without content', () => {
    const cert = { certificateNumber: 'LARBI-AAAA-BBBB-CCCC', holderName: 'H', formationTitle: 'F', certificationTitle: null, issuedAt: new Date(), enrollmentId: 'e1', id: 'x' };
    for (const view of [toCertificateView(cert), toPublicCertificate(cert)]) {
      assert.deepEqual(Object.keys(view).sort(), ['certificateNumber', 'certificationTitle', 'formationTitle', 'holderName', 'issuedAt']);
      assert.equal(view.certificationTitle, 'F', 'falls back to the formation title');
    }
    const formation = { slug: 's', title: 'F', description: 'd', status: 'published', requiredAccessLevel: 'standard', coverImageId: null, category: null, certificationEnabled: true, certificationTitle: 'C', certificationDescription: null, courses: [{ id: 'c1', position: 0, title: 'A', summary: null, body: '<p>SECRET</p>', estimatedMinutes: null, isRequired: true }] };
    const detail = toFormationDetail(formation, { accessible: true, enrollment: null });
    assert.doesNotMatch(JSON.stringify(detail), /SECRET|body/);
    assert.equal(detail.canEnroll, true);
    assert.equal(toCatalogItem(formation, { accessible: false, enrollment: null }).accessible, false);
    assert.equal(toEnrollmentSummary(null, []), null);
  });
});

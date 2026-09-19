import '../helpers/setup-env.js';
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CERTIFICATE_NUMBER_PATTERN, generateCertificateNumber, normalizeCertificateNumber } from '../../src/services/certificate.service.js';
import { isFormationFinished, summarizeProgress } from '../../src/services/progress.service.js';
import { articleReadiness, courseHasContent, formationReadiness } from '../../src/services/readiness.service.js';
import { ACCESS_LEVELS, ROLES, hasAccessLevel } from '../../src/constants/roles.js';

describe('certificate numbers', () => {
  test('follow LARBI-XXXX-XXXX-XXXX without look-alike characters', () => {
    for (let i = 0; i < 2000; i += 1) {
      const n = generateCertificateNumber();
      assert.match(n, CERTIFICATE_NUMBER_PATTERN);
      assert.doesNotMatch(n.slice(6), /[01IO]/);
    }
  });

  test('are unique and not sequential across 20 000 draws', () => {
    const seen = new Set();
    for (let i = 0; i < 20_000; i += 1) seen.add(generateCertificateNumber());
    assert.equal(seen.size, 20_000);
    const firsts = [...seen].slice(0, 200).map((n) => n.slice(6, 10));
    assert.ok(new Set(firsts).size > 150, 'no visible ordering');
  });

  test('use every character of the alphabet (uniform-looking draw)', () => {
    const chars = new Set();
    for (let i = 0; i < 2000; i += 1) for (const c of generateCertificateNumber().replaceAll('-', '').slice(5)) chars.add(c);
    assert.equal(chars.size, 32);
  });

  test('the pattern rejects malformed and ambiguous numbers', () => {
    for (const bad of ['', 'LARBI', 'LARBI-AAAA-BBBB', 'LARBI-AAAA-BBBB-CCCCC', 'larbi-aaaa-bbbb-cccc', 'LARBI-0AAA-BBBB-CCCC', 'LARBI-IAAA-BBBB-CCCC', 'XXXXX-AAAA-BBBB-CCCC', 'LARBI-AAAA-BBBB-CCC!', "LARBI-AAAA-BBBB-CCCC'; --"]) {
      assert.doesNotMatch(bad, CERTIFICATE_NUMBER_PATTERN, bad);
    }
  });

  test('typed numbers are normalised (case, spaces); non-strings are harmless', () => {
    assert.equal(normalizeCertificateNumber('  larbi-abcd-2345-wxyz '), 'LARBI-ABCD-2345-WXYZ');
    assert.equal(normalizeCertificateNumber(null), '');
    assert.equal(normalizeCertificateNumber(undefined), '');
    assert.equal(normalizeCertificateNumber(42), '42');
  });
});

describe('progress rules', () => {
  const courses = [
    { id: 'a', isRequired: true },
    { id: 'b', isRequired: true },
    { id: 'c', isRequired: false },
  ];
  const done = (...ids) => ids.map((courseId) => ({ courseId, status: 'completed' }));

  test('percentage counts all courses (optional included), rounded', () => {
    assert.equal(summarizeProgress(courses, []).percent, 0);
    assert.equal(summarizeProgress(courses, done('a')).percent, 33);
    assert.equal(summarizeProgress(courses, done('a', 'b')).percent, 67);
    assert.equal(summarizeProgress(courses, done('a', 'b', 'c')).percent, 100);
  });

  test('lists what is completed and how many required courses remain', () => {
    const s = summarizeProgress(courses, done('a'));
    assert.deepEqual([s.completed, s.total, s.requiredRemaining, s.completedCourseIds], [1, 3, 1, ['a']]);
    assert.equal(summarizeProgress(courses, done('a', 'b')).requiredRemaining, 0);
  });

  test('only rows that are "completed" and belong to an existing course count', () => {
    const rows = [{ courseId: 'a', status: 'in_progress' }, { courseId: 'ghost', status: 'completed' }, { courseId: 'b', status: 'completed' }];
    const s = summarizeProgress(courses, rows);
    assert.deepEqual([s.completed, s.completedCourseIds], [1, ['b']]);
  });

  test('a formation without courses has 0% and is never finished', () => {
    const s = summarizeProgress([], []);
    assert.deepEqual([s.percent, s.total], [0, 0]);
    assert.equal(isFormationFinished([], s), false);
  });

  test('finished = every REQUIRED course done; optional ones never block', () => {
    assert.equal(isFormationFinished(courses, summarizeProgress(courses, done('a'))), false);
    assert.equal(isFormationFinished(courses, summarizeProgress(courses, done('a', 'b'))), true);
    assert.equal(isFormationFinished(courses, summarizeProgress(courses, done('c'))), false);
  });

  test('with NO required course, finished only when ALL courses are done', () => {
    const optional = [{ id: 'x', isRequired: false }, { id: 'y', isRequired: false }];
    assert.equal(isFormationFinished(optional, summarizeProgress(optional, done('x'))), false);
    assert.equal(isFormationFinished(optional, summarizeProgress(optional, done('x', 'y'))), true);
  });
});

describe('access levels', () => {
  test('premium sees everything, standard only standard', () => {
    assert.equal(hasAccessLevel('standard', 'standard'), true);
    assert.equal(hasAccessLevel('premium', 'standard'), true);
    assert.equal(hasAccessLevel('premium', 'premium'), true);
    assert.equal(hasAccessLevel('standard', 'premium'), false);
  });

  test('unknown, missing or hostile values are denied', () => {
    for (const [user, required] of [[undefined, 'standard'], [null, 'premium'], ['gold', 'standard'], ['standard', 'gold'], ['premium', undefined], ['__proto__', 'standard'], ['standard', 'constructor'], ['', ''], [{}, {}]]) {
      assert.equal(hasAccessLevel(user, required), false, JSON.stringify([user, required]));
    }
  });

  test('role and level constants', () => {
    assert.deepEqual(ROLES, { USER: 'user', ADMIN: 'admin' });
    assert.deepEqual(ACCESS_LEVELS, { STANDARD: 'standard', PREMIUM: 'premium' });
  });
});

describe('publication readiness', () => {
  test('formation: lists every missing requirement', () => {
    const r = formationReadiness({ title: '', description: '  ', coverImageId: null, courses: [], certificationEnabled: true, certificationTitle: null });
    assert.equal(r.ready, false);
    assert.deepEqual(r.items.filter((i) => !i.ok).map((i) => i.key), ['title', 'description', 'cover', 'courses', 'coursesContent', 'certification']);
  });

  test('formation: ready when complete; certification name only needed when enabled', () => {
    const base = { title: 'T', description: 'D', coverImageId: 'c', courses: [{ body: '<p>x</p>', media: [] }], certificationEnabled: true, certificationTitle: 'C' };
    assert.equal(formationReadiness(base).ready, true);
    assert.equal(formationReadiness({ ...base, certificationTitle: '' }).ready, false);
    assert.equal(formationReadiness({ ...base, certificationEnabled: false, certificationTitle: '' }).ready, true);
  });

  test('a course has content with text OR a file, an empty editor does not count', () => {
    assert.equal(courseHasContent({ body: '<p>texte</p>', media: [] }), true);
    assert.equal(courseHasContent({ body: null, media: [{}] }), true);
    assert.equal(courseHasContent({ body: '<p></p>', media: [] }), false);
    assert.equal(courseHasContent({ body: null }), false);
  });

  test('article: title, summary, real text and cover are required', () => {
    const ok = { title: 'T', excerpt: 'E', bodyText: 'du texte', coverImageId: 'c' };
    assert.equal(articleReadiness(ok).ready, true);
    for (const [field, value, key] of [['title', ' ', 'title'], ['excerpt', '', 'excerpt'], ['bodyText', '  ', 'content'], ['coverImageId', null, 'cover']]) {
      const r = articleReadiness({ ...ok, [field]: value });
      assert.equal(r.ready, false, field);
      assert.deepEqual(r.items.filter((i) => !i.ok).map((i) => i.key), [key]);
    }
  });
});

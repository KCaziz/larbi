import '../helpers/setup-env.js';
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { loginSchema, registerSchema, updateMeSchema } from '../../src/validation/auth.schemas.js';
import { contactSchema } from '../../src/validation/contact.schemas.js';
import { createCategorySchema, createCourseSchema, createFormationSchema, reorderCoursesSchema, updateCourseSchema, updateFormationSchema } from '../../src/validation/cms.schemas.js';
import { blogListQuerySchema, createArticleSchema, updateArticleSchema } from '../../src/validation/blog.schemas.js';

// Every input reaches the server through one of these schemas: they are the
// first barrier (type, size, unknown fields). ".strict()" means extra fields fail.

const ok = (schema, value) => assert.equal(schema.safeParse(value).success, true, JSON.stringify(value).slice(0, 80));
const ko = (schema, value) => assert.equal(schema.safeParse(value).success, false, JSON.stringify(value).slice(0, 80));
const uuid = '00000000-0000-4000-8000-000000000000';

describe('auth', () => {
  const user = { name: 'Léa', email: 'lea@example.com', password: 'motdepasse', accountType: 'pme' };

  test('registration: accepts a valid body and normalises e-mail and name', () => {
    const r = registerSchema.parse({ ...user, email: '  LEA@Example.COM ', name: '  Léa  ' });
    assert.equal(r.email, 'lea@example.com');
    assert.equal(r.name, 'Léa');
  });

  test('registration: refuses bad values and every unknown or privileged field', () => {
    for (const bad of [{ name: '' }, { name: 'x'.repeat(101) }, { email: 'x' }, { email: 'a@b' }, { password: 'short' }, { password: 'x'.repeat(73) }, { accountType: 'admin' }, { role: 'admin' }, { accessLevel: 'premium' }, { id: 'x' }, { name: 42 }, { email: ['a@b.co'] }, { password: { a: 1 } }]) {
      ko(registerSchema, { ...user, ...bad });
    }
    ko(registerSchema, {});
    ko(registerSchema, null);
    ko(registerSchema, 'text');
  });

  test('login and profile update', () => {
    ok(loginSchema, { email: 'a@b.co', password: 'x' });
    for (const bad of [{}, { email: 'a@b.co' }, { email: 'a@b.co', password: '' }, { email: 'a@b.co', password: 'x'.repeat(73) }, { email: { $ne: null }, password: 'x' }, { email: 'a@b.co', password: 'x', remember: true }]) ko(loginSchema, bad);
    ok(updateMeSchema, { accountType: 'pmi' });
    for (const bad of [{}, { accountType: 'x' }, { role: 'admin' }, { accountType: 'pmi', role: 'admin' }]) ko(updateMeSchema, bad);
  });

  test('contact form', () => {
    ok(contactSchema, { name: 'A', email: 'a@b.co', message: 'Bonjour' });
    for (const bad of [{ name: '', email: 'a@b.co', message: 'x' }, { name: 'A', email: 'nope', message: 'x' }, { name: 'A', email: 'a@b.co', message: '' }, { name: 'A', email: 'a@b.co', message: 'x'.repeat(5001) }, { name: 'A', email: 'a@b.co', message: 'x', spam: 1 }]) ko(contactSchema, bad);
  });
});

describe('CMS (formations)', () => {
  test('titles are trimmed, required and limited to 150 characters', () => {
    assert.equal(createFormationSchema.parse({ title: '  Ma formation ' }).title, 'Ma formation');
    for (const bad of [{}, { title: '' }, { title: '   ' }, { title: 'x'.repeat(151) }, { title: 'ok', status: 'published' }, { title: 5 }]) ko(createFormationSchema, bad);
    ok(createCourseSchema, { title: 'x'.repeat(150) });
    ko(createCourseSchema, { title: 'x'.repeat(151) });
    ko(createCategorySchema, { name: 'x'.repeat(81) });
  });

  test('formation update: partial, strict, bounded', () => {
    ok(updateFormationSchema, {});
    ok(updateFormationSchema, { requiredAccessLevel: 'premium', certificationEnabled: false, categoryId: null });
    assert.equal(updateFormationSchema.parse({ certificationTitle: '' }).certificationTitle, null, 'empty means none');
    for (const bad of [{ requiredAccessLevel: 'gold' }, { status: 'published' }, { slug: 'x' }, { description: 'x'.repeat(2001) }, { categoryId: 'not-a-uuid' }, { certificationEnabled: 'yes' }]) ko(updateFormationSchema, bad);
  });

  test('course update and reorder', () => {
    ok(updateCourseSchema, { estimatedMinutes: 0 });
    ok(updateCourseSchema, { estimatedMinutes: 1440, body: null });
    for (const bad of [{ estimatedMinutes: -1 }, { estimatedMinutes: 1441 }, { estimatedMinutes: 1.5 }, { body: 'x'.repeat(200_001) }, { isRequired: 1 }, { position: 2 }]) ko(updateCourseSchema, bad);
    ok(reorderCoursesSchema, { courseIds: [uuid] });
    for (const bad of [{}, { courseIds: ['x'] }, { courseIds: Array(501).fill(uuid) }, { courseIds: [uuid], extra: 1 }]) ko(reorderCoursesSchema, bad);
  });
});

describe('blog', () => {
  test('article creation: a title only', () => {
    ok(createArticleSchema, { title: 'Bonjour' });
    for (const bad of [{}, { title: '' }, { title: 'x'.repeat(151) }, { title: 'x', slug: 'y' }, { title: 'x', status: 'published' }]) ko(createArticleSchema, bad);
  });

  test('article update: every limit, empty optional text means "none"', () => {
    ok(updateArticleSchema, { tags: ['a', 'b'], categoryId: uuid, body: null });
    const parsed = updateArticleSchema.parse({ metaTitle: '', metaDescription: '  d  ', excerpt: '  e ' });
    assert.deepEqual([parsed.metaTitle, parsed.metaDescription, parsed.excerpt], [null, 'd', 'e']);
    const bad = [{ excerpt: 'x'.repeat(301) }, { metaTitle: 'x'.repeat(71) }, { metaDescription: 'x'.repeat(171) }, { tags: Array(11).fill('t') }, { tags: [''] }, { tags: ['x'.repeat(41)] }, { tags: 'a' }, { categoryId: 'x' }, { body: 'x'.repeat(200_001) }, { slug: 'x' }, { status: 'published' }, { authorId: uuid }, { publishedAt: '2020-01-01' }];
    for (const b of bad) ko(updateArticleSchema, b);
  });

  test('public list query: coerced, bounded, strict', () => {
    assert.deepEqual(blogListQuerySchema.parse({}), { page: 1, limit: 9 });
    assert.deepEqual(blogListQuerySchema.parse({ page: '3', limit: '24', query: '  tva  ', category: 'a-b', tag: 'x' }), { page: 3, limit: 24, query: 'tva', category: 'a-b', tag: 'x' });
    for (const bad of [{ page: '0' }, { page: '-1' }, { page: '1.5' }, { page: 'abc' }, { page: '1001' }, { limit: '0' }, { limit: '25' }, { query: 'x'.repeat(101) }, { category: 'Bad Slug' }, { category: 'a/../b' }, { tag: 'UPPER' }, { tag: 'x'.repeat(81) }, { unknown: '1' }, { category: ['a', 'b'] }]) ko(blogListQuerySchema, bad);
  });
});

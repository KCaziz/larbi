import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify, uniqueSlug } from '../../src/services/slug.service.js';

describe('slugify', () => {
  test('lower-cases, removes accents and joins words with single dashes', () => {
    assert.equal(slugify('Comptabilité & Gestion : le guide 2026 !'), 'comptabilite-gestion-le-guide-2026');
    assert.equal(slugify('  Été   à   Paris  '), 'ete-a-paris');
    assert.equal(slugify('Crème brûlée'), 'creme-brulee');
  });

  test('never produces leading, trailing or doubled dashes', () => {
    for (const input of ['--x--', '!!!hello!!!', 'a   -   b', '___a___b___']) {
      assert.match(slugify(input, 'x'), /^[a-z0-9]+(-[a-z0-9]+)*$/, input);
    }
  });

  test('is limited to 60 characters without ending on a dash', () => {
    const slug = slugify(`${'mot '.repeat(40)}fin`);
    assert.ok(slug.length <= 60);
    assert.ok(!slug.endsWith('-'));
  });

  test('a text without any latin letter or digit falls back to the given word', () => {
    assert.equal(slugify('مرحبا بالعالم', 'article'), 'article');
    assert.equal(slugify('日本語', 'item'), 'item');
    assert.equal(slugify('', 'item'), 'item');
    assert.equal(slugify(null, 'item'), 'item');
    assert.equal(slugify(undefined), 'item');
  });

  test('hostile input becomes a harmless slug', () => {
    assert.equal(slugify('../../etc/passwd'), 'etc-passwd');
    assert.equal(slugify('<script>alert(1)</script>'), 'script-alert-1-script');
    assert.equal(slugify("'; DROP TABLE users; --"), 'drop-table-users');
  });
});

describe('uniqueSlug', () => {
  test('returns the readable slug when it is free', async () => {
    assert.equal(await uniqueSlug('Mon titre', async () => false), 'mon-titre');
  });

  test('numbers the slug on collision: title-2, title-3…', async () => {
    const taken = new Set(['mon-titre', 'mon-titre-2']);
    assert.equal(await uniqueSlug('Mon titre', async (s) => taken.has(s)), 'mon-titre-3');
  });

  test('falls back to a random suffix when every numbered slug is taken', async () => {
    const slug = await uniqueSlug('Plein', async (s) => s === 'plein' || /^plein-\d+$/.test(s));
    assert.match(slug, /^plein-[0-9a-f]{8}$/);
  });
});

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { bodyToText, normalizeTags, readingMinutes, tagSlug } from '../../src/services/article.service.js';

describe('bodyToText', () => {
  test('separates words across blocks (no "HelloWorld")', () => {
    assert.equal(bodyToText('<p>Hello</p><p>World</p>'), 'Hello World');
    assert.equal(bodyToText('<h2>Titre</h2><p>Texte</p><ul><li>a</li><li>b</li></ul>'), 'Titre Texte a b');
    assert.equal(bodyToText('ligne<br>suivante'), 'ligne suivante');
  });

  test('gives searchable text: "R&D" stays "R&D"', () => {
    assert.equal(bodyToText('<p>Le service R&amp;D recrute</p><p>a &lt; b</p>'), 'Le service R&D recrute a < b');
  });

  test('does not split a word inside inline formatting', () => {
    assert.equal(bodyToText('<p>ab<strong>cd</strong>ef</p>'), 'abcdef');
  });

  test('collapses whitespace; empty input gives an empty string', () => {
    assert.equal(bodyToText('<p>  a \n\n  b  </p>'), 'a b');
    assert.equal(bodyToText(null), '');
    assert.equal(bodyToText('<p></p>'), '');
  });
});

describe('readingMinutes', () => {
  test('0 for no text, at least 1 otherwise, 200 words per minute rounded up', () => {
    assert.equal(readingMinutes(''), 0);
    assert.equal(readingMinutes('   '), 0);
    assert.equal(readingMinutes(null), 0);
    assert.equal(readingMinutes('un mot'), 1);
    assert.equal(readingMinutes('mot '.repeat(200)), 1);
    assert.equal(readingMinutes('mot '.repeat(201)), 2);
    assert.equal(readingMinutes('mot '.repeat(1000)), 5);
  });
});

describe('tagSlug', () => {
  test('latin names give a readable slug', () => {
    assert.equal(tagSlug('Facture électronique'), 'facture-electronique');
    assert.equal(tagSlug('TVA'), tagSlug('tva'));
  });

  test('names without latin letters get a stable, distinct, valid slug', () => {
    const a = tagSlug('ضريبة');
    const b = tagSlug('فاتورة');
    assert.notEqual(a, b);
    assert.equal(a, tagSlug('ضريبة'));
    assert.equal(a, tagSlug('  ضريبة  '));
    assert.match(a, /^t-[0-9a-f]{10}$/);
  });
});

describe('normalizeTags', () => {
  test('trims, drops blanks, merges duplicates (same slug) and keeps the first spelling', () => {
    assert.deepEqual(normalizeTags(['TVA', 'tva', '  Facture   électronique ', '', '   ', 'Tva']), [
      { name: 'TVA', slug: 'tva' },
      { name: 'Facture électronique', slug: 'facture-electronique' },
    ]);
  });

  test('handles missing input', () => {
    assert.deepEqual(normalizeTags(undefined), []);
    assert.deepEqual(normalizeTags([]), []);
  });
});

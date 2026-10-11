import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { isAdultAgeRange, FIN_PUBLICS, FIN_PUBLIC_CODES } from '../../src/constants/finPublics.js';
import { updateFinProfileSchema } from '../../src/validation/finProfile.schemas.js';

describe('isAdultAgeRange', () => {
  test('under18 is the only minor bracket; every other bracket is adult; unset is unknown', () => {
    assert.equal(isAdultAgeRange('under18'), false);
    for (const range of ['18-24', '25-34', '35-49', '50-64', '65plus']) assert.equal(isAdultAgeRange(range), true);
    assert.equal(isAdultAgeRange(null), null);
    assert.equal(isAdultAgeRange(undefined), null);
  });
});

describe('the 8 publics', () => {
  test('exactly the client\'s own list (01_Publics), nothing added or removed', () => {
    assert.deepEqual(FIN_PUBLIC_CODES, ['LYC', 'ETU', 'JAC', 'SAL', 'COL', 'COU', 'FAM', 'EPG']);
    assert.equal(FIN_PUBLICS.length, 8);
    assert.ok(FIN_PUBLICS.every((p) => p.label && p.experience && p.mission));
  });
});

describe('updateFinProfileSchema', () => {
  test('every field optional ("je ne sais pas / modifier plus tard")', () => {
    assert.equal(updateFinProfileSchema.safeParse({}).success, true);
  });

  test('finPublic null is accepted (clearing), unknown codes are not', () => {
    assert.equal(updateFinProfileSchema.safeParse({ finPublic: null }).success, true);
    assert.equal(updateFinProfileSchema.safeParse({ finPublic: 'ADM' }).success, false);
  });

  test('secondary publics cannot include the primary one', () => {
    assert.equal(updateFinProfileSchema.safeParse({ finPublic: 'SAL', finSecondaryPublics: ['SAL'] }).success, false);
    assert.equal(updateFinProfileSchema.safeParse({ finPublic: 'SAL', finSecondaryPublics: ['COL', 'COU'] }).success, true);
  });

  test('country is a 2-letter code, case-insensitive on input', () => {
    assert.equal(updateFinProfileSchema.parse({ finCountry: 'dz' }).finCountry, 'DZ');
    assert.equal(updateFinProfileSchema.safeParse({ finCountry: 'DZA' }).success, false);
  });
});

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { COLLECTIVE_CATEGORY_KEYS } from '../../src/constants/finCollectiveCategories.js';
import { REFERENCE_CATEGORIES } from '../../src/constants/finCategoryReference.js';
import { COLLECTIVE_REFERENCE_MAP, collectiveOfReference } from '../../src/constants/finCollectiveCategoryMap.js';

// P9-16: the proposed mapping is complete and points at real reference categories.
describe('the common-to-reference mapping', () => {
  test('every one of the 19 is mapped, to a category of the 125', () => {
    assert.deepEqual(Object.keys(COLLECTIVE_REFERENCE_MAP), COLLECTIVE_CATEGORY_KEYS);
    const keys = new Set(REFERENCE_CATEGORIES.map((category) => category.key));
    for (const key of Object.values(COLLECTIVE_REFERENCE_MAP)) assert.ok(keys.has(key), key);
  });
  test('the shared fallback category reads back as « Autre »', () => {
    assert.equal(collectiveOfReference('variable.autre_depense_variable'), 'COLC-19');
    assert.equal(collectiveOfReference('variable.cafe_snack'), null);
  });
});

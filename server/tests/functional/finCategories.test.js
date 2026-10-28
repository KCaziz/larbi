import '../helpers/setup-env.js';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { MAX_OWN_PER_FAMILY } from '../../src/services/finCategory.service.js';
import { RETIRED_CATEGORIES } from '../../src/constants/finCategories.js';

// The common financial data model (P6-02) through the real API and database:
// the client's category reference, what a user adds to it, what they change
// about it, and the correction trail every change leaves behind.

let t;
let user;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.user();
});
after(() => t.close());

const list = (query = '') => t.request('GET', `/fin/categories${query}`, { user });
const create = (json) => t.request('POST', '/fin/categories', { user, json });
const familyOf = (body, code) => body.groups.find((group) => group.code === code);
const labels = (body, code) => familyOf(body, code).categories.map((c) => c.label);

describe('reading the reference', () => {
  test("the 8 families come back in the client's order, each with its categories", async () => {
    const res = await list();
    assert.equal(res.status, 200);
    assert.deepEqual(
      res.body.groups.map((g) => g.code),
      ['income', 'fixed', 'variable', 'seasonal', 'goal', 'asset', 'debt', 'shared'],
    );
    assert.equal(
      res.body.groups.reduce((total, g) => total + g.categories.length, 0),
      91 + 98 - Object.keys(RETIRED_CATEGORIES).length,
      'the standard categories, minus the old ones the 125 replace (answer D4)',
    );
    // A retired category is never offered again, and a new movement cannot use it.
    assert.ok(!res.body.groups.flatMap((g) => g.categories).some((c) => RETIRED_CATEGORIES[c.key]));
    const retired = await t.prisma.finCategory.findFirst({ where: { key: 'seasonal.vacances', userId: null } });
    const refused = await t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value: 1000, currency: 'DZD', occurredAt: new Date().toISOString(), categoryId: retired.id } });
    assert.equal(refused.status, 422);
    assert.equal(familyOf(res.body, 'income').label, 'Revenus / ressources');
  });

  test('a standard category is marked as such, carries its key, and is official', async () => {
    const salary = familyOf((await list()).body, 'income').categories.find((c) => c.key === 'income.salaire_net');
    assert.equal(salary.label, 'Salaire net');
    assert.equal(salary.origin, 'standard');
    assert.equal(salary.customised, false);
    assert.equal(salary.status, 'official');
  });

  test('every route needs a session: financial data is private by default', async () => {
    for (const [method, path] of [
      ['GET', '/fin/categories'],
      ['GET', '/fin/references'],
      ['POST', '/fin/categories'],
      ['PATCH', '/fin/categories/standard/income.prime'],
    ]) {
      const options = method === 'GET' ? {} : { json: {} };
      assert.equal((await t.request(method, path, options)).status, 401, `${method} ${path}`);
    }
  });

  test('the vocabularies are served, so the interface never retypes them', async () => {
    const res = await t.request('GET', '/fin/references', { user });
    assert.equal(res.status, 200);
    assert.equal(res.body.families.length, 8);
    assert.ok(res.body.statuses.includes('fictional'));
    assert.equal(res.body.fictionalStatus, 'fictional');
    assert.equal(res.body.defaultScope, 'personal');
    assert.equal(res.body.limits.ownCategoriesPerFamily, MAX_OWN_PER_FAMILY);
  });
});

describe('creating a category', () => {
  test('a new category is the user\'s own, declared, personal, and version 1', async () => {
    const res = await create({ family: 'variable', label: 'Café du matin' });
    assert.equal(res.status, 201);
    assert.deepEqual(
      { ...res.body.category, id: 'x' },
      {
        id: 'x',
        key: null,
        family: 'variable',
        label: 'Café du matin',
        group: null,
        icon: null,
        // P8-27: no colour of its own, so its family's; no group of the client's.
        color: '#2563A6',
        groupColor: null,
        essential: false,
        recurrence: null,
        suggestedFor: [],
        origin: 'own',
        customised: false,
        archived: false,
        reference: null,
        scope: 'personal',
        // Typed by a person: "déclarée", never "officielle" — only the client's
        // reference is official.
        status: 'declared',
        consentUses: [],
        version: 1,
      },
    );
    assert.ok(labels((await list()).body, 'variable').includes('Café du matin'));
  });

  test('the label is trimmed and its inner spaces collapsed', async () => {
    const res = await create({ family: 'goal', label: '  Permis   moto ' });
    assert.equal(res.body.category.label, 'Permis moto');
  });

  test('a name already taken in that family is refused (409), whether standard or own', async () => {
    const standard = await create({ family: 'variable', label: 'Alimentation animal' });
    assert.equal(standard.status, 409);
    assert.deepEqual(standard.body.error.details, { reason: 'labelTaken' });
    // Case does not make two names different to a reader.
    await create({ family: 'goal', label: 'Mon projet' });
    assert.equal((await create({ family: 'goal', label: 'MON PROJET' })).status, 409);
  });

  test('the same name in ANOTHER family is fine — the client repeats labels across families', async () => {
    assert.equal((await create({ family: 'asset', label: 'Alimentation animal' })).status, 201);
  });

  test('an unknown family, an empty label and an unknown field are refused', async () => {
    assert.equal((await create({ family: 'nope', label: 'X' })).status, 400);
    assert.equal((await create({ family: 'goal', label: '   ' })).status, 400);
    assert.equal((await create({ family: 'goal', label: 'X', status: 'official' })).status, 400, 'status is not settable');
    assert.equal((await create({ family: 'goal', label: 'X', consentUses: ['resale'] })).status, 400);
  });

  test('a périmètre and the authorised uses can be set at creation', async () => {
    const res = await create({ family: 'shared', label: 'Loyer du studio', scope: 'space', consentUses: ['shared_space'] });
    assert.equal(res.status, 201);
    assert.equal(res.body.category.scope, 'space');
    assert.deepEqual(res.body.category.consentUses, ['shared_space']);
  });

  test('the number of own categories per family is capped', async () => {
    for (let index = 0; index < MAX_OWN_PER_FAMILY; index += 1) {
      assert.equal((await create({ family: 'debt', label: `Dette ${index}` })).status, 201);
    }
    const refused = await create({ family: 'debt', label: 'Une de trop' });
    assert.equal(refused.status, 422);
    assert.deepEqual(refused.body.error.details, { reason: 'tooMany', limit: MAX_OWN_PER_FAMILY });
    // The cap is per family: another family is unaffected.
    assert.equal((await create({ family: 'goal', label: 'Une de trop' })).status, 201);
  });
});

describe('correcting a category', () => {
  test('a rename bumps the version and leaves a journal entry with its reason', async () => {
    const { body } = await create({ family: 'variable', label: 'Cafe' });
    const res = await t.request('PATCH', `/fin/categories/${body.category.id}`, { user, json: { label: 'Café', reason: 'accent' } });
    assert.equal(res.status, 200);
    assert.equal(res.body.category.label, 'Café');
    assert.equal(res.body.category.version, 2, 'a correction bumps the version');

    const history = await t.request('GET', `/fin/categories/${body.category.id}/historique`, { user });
    assert.deepEqual(
      history.body.changes.map((c) => [c.action, c.field, c.before, c.after, c.reason]),
      [
        ['create', null, null, { family: 'variable', label: 'Cafe', scope: 'personal', consentUses: [] }, null],
        ['correct', 'label', 'Cafe', 'Café', 'accent'],
      ],
    );
  });

  test('a reason is never required — a correction must not depend on typing one', async () => {
    const { body } = await create({ family: 'variable', label: 'Cafe' });
    const res = await t.request('PATCH', `/fin/categories/${body.category.id}`, { user, json: { label: 'Thé' } });
    assert.equal(res.status, 200);
    const history = await t.request('GET', `/fin/categories/${body.category.id}/historique`, { user });
    assert.equal(history.body.changes.at(-1).reason, null);
  });

  test('a body that changes nothing is refused rather than written', async () => {
    const { body } = await create({ family: 'variable', label: 'Cafe' });
    assert.equal((await t.request('PATCH', `/fin/categories/${body.category.id}`, { user, json: {} })).status, 400);
    assert.equal((await t.request('PATCH', `/fin/categories/${body.category.id}`, { user, json: { reason: 'parce que' } })).status, 400);
  });

  test('each changed field gets its own journal entry', async () => {
    const { body } = await create({ family: 'shared', label: 'Courses communes' });
    await t.request('PATCH', `/fin/categories/${body.category.id}`, { user, json: { scope: 'space', consentUses: ['shared_space'] } });
    const history = await t.request('GET', `/fin/categories/${body.category.id}/historique`, { user });
    assert.deepEqual(
      history.body.changes.filter((c) => c.action === 'correct').map((c) => c.field),
      ['scope', 'consentUses'],
    );
  });

  test('a renamed category cannot take a name another one already has', async () => {
    const { body } = await create({ family: 'goal', label: 'Permis' });
    assert.equal(body.category, undefined, 'Permis is already a standard goal');
    const mine = await create({ family: 'goal', label: 'Scooter' });
    assert.equal((await t.request('PATCH', `/fin/categories/${mine.body.category.id}`, { user, json: { label: 'Permis' } })).status, 409);
  });
});

describe('archiving and deleting', () => {
  test('an archived category leaves the catalogue but is still there to be brought back', async () => {
    const { body } = await create({ family: 'variable', label: 'Cigarettes' });
    const id = body.category.id;

    const archived = await t.request('PUT', `/fin/categories/${id}/archive`, { user, json: { archived: true } });
    assert.equal(archived.status, 200);
    assert.equal(archived.body.category.archived, true);
    assert.ok(!labels((await list()).body, 'variable').includes('Cigarettes'), 'not offered any more');
    assert.ok(labels((await list('?includeArchived=true')).body, 'variable').includes('Cigarettes'), 'still listable');

    const restored = await t.request('PUT', `/fin/categories/${id}/archive`, { user, json: { archived: false } });
    assert.equal(restored.body.category.archived, false);
    assert.ok(labels((await list()).body, 'variable').includes('Cigarettes'));

    const history = await t.request('GET', `/fin/categories/${id}/historique`, { user });
    assert.deepEqual(
      history.body.changes.map((c) => c.action),
      ['create', 'archive', 'restore'],
    );
  });

  test('a deletion is logical: the row goes from the catalogue, the journal says it was deleted', async () => {
    const { body } = await create({ family: 'asset', label: 'Vieille moto' });
    const id = body.category.id;
    const res = await t.request('DELETE', `/fin/categories/${id}`, { user, json: { reason: 'vendue' } });
    assert.equal(res.status, 200);
    assert.ok(!labels((await list('?includeArchived=true')).body, 'asset').includes('Vieille moto'));

    // The row survives, with its deletion dated — that is what makes an old
    // total still able to say what its lines were called.
    const row = await t.prisma.finCategory.findUnique({ where: { id } });
    assert.ok(row, 'the row is still in the table');
    assert.ok(row.deletedAt instanceof Date);
    const trail = await t.prisma.finChange.findMany({ where: { entityId: id }, orderBy: { createdAt: 'asc' } });
    assert.deepEqual(
      trail.map((c) => [c.action, c.reason]),
      [
        ['create', null],
        ['delete', 'vendue'],
      ],
    );
  });

  test('a deleted category cannot be corrected, archived or deleted again', async () => {
    const { body } = await create({ family: 'asset', label: 'Vieille moto' });
    const id = body.category.id;
    await t.request('DELETE', `/fin/categories/${id}`, { user, json: {} });
    assert.equal((await t.request('PATCH', `/fin/categories/${id}`, { user, json: { label: 'X' } })).status, 404);
    assert.equal((await t.request('PUT', `/fin/categories/${id}/archive`, { user, json: { archived: true } })).status, 404);
    assert.equal((await t.request('DELETE', `/fin/categories/${id}`, { user, json: {} })).status, 404);
  });
});

describe("customising the client's reference", () => {
  const standard = '/fin/categories/standard/variable.alimentation_animal';

  test('a standard category can be renamed for this account only, and says so', async () => {
    const res = await t.request('PATCH', standard, { user, json: { label: 'Mon chat' } });
    assert.equal(res.status, 200);
    assert.equal(res.body.category.label, 'Mon chat');
    assert.equal(res.body.category.origin, 'standard', 'still a reference category');
    assert.equal(res.body.category.customised, true);
    assert.equal(res.body.category.reference, 'Alimentation animal', "the client's own wording stays visible");
    assert.equal(res.body.category.status, 'declared', 'the label is now the person\'s, not official');

    const other = await t.user();
    const theirs = await t.request('GET', '/fin/categories', { user: other });
    assert.ok(
      theirs.body.groups
        .find((g) => g.code === 'variable')
        .categories.some((c) => c.key === 'variable.alimentation_animal' && c.label === 'Alimentation animal'),
      'another account still sees the reference untouched',
    );
  });

  test('a standard category can be hidden, and brought back', async () => {
    await t.request('PATCH', standard, { user, json: { hidden: true } });
    assert.ok(!labels((await list()).body, 'variable').includes('Alimentation animal'));
    assert.ok(labels((await list('?includeArchived=true')).body, 'variable').includes('Alimentation animal'));

    await t.request('PATCH', standard, { user, json: { hidden: false } });
    assert.ok(labels((await list()).body, 'variable').includes('Alimentation animal'));
  });

  test('resetting removes the customisation and the reference comes back', async () => {
    await t.request('PATCH', standard, { user, json: { label: 'Mon chat', hidden: true } });
    const res = await t.request('DELETE', standard, { user });
    assert.equal(res.status, 200);
    const after = familyOf((await list()).body, 'variable').categories.find((c) => c.key === 'variable.alimentation_animal');
    assert.equal(after.label, 'Alimentation animal');
    assert.equal(after.customised, false);
    assert.equal(after.archived, false);
  });

  test('resetting something that was never customised is a 404, not a silent success', async () => {
    assert.equal((await t.request('DELETE', standard, { user })).status, 404);
  });

  test('a key that is not one of the 91 is a 404, and never reaches a query', async () => {
    assert.equal((await t.request('PATCH', '/fin/categories/standard/variable.licorne', { user, json: { label: 'X' } })).status, 404);
    assert.equal((await t.request('PATCH', '/fin/categories/standard/..%2Fetc', { user, json: { label: 'X' } })).status, 404);
  });

  test('a standard row itself is never written to, whatever the account does', async () => {
    await t.request('PATCH', standard, { user, json: { label: 'Mon chat' } });
    const reference = await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_animal', userId: null } });
    assert.equal(reference.label, 'Alimentation animal');
    assert.equal(reference.status, 'official');
    assert.equal(reference.version, 1);
  });

  test('the customisation cannot take a name another category in the family already has', async () => {
    // « Vêtements » is the universal category that absorbed « Habillement » (P8-08).
    assert.equal((await t.request('PATCH', standard, { user, json: { label: 'Vêtements' } })).status, 409);
  });

  test('an empty customisation is refused rather than writing an override that changes nothing', async () => {
    assert.equal((await t.request('PATCH', standard, { user, json: {} })).status, 400);
  });
});

describe('P8-08 — « Essentielle ? » is the reference’s, and the person may change it', () => {
  test('a standard category carries the client’s flag, and an override can change it', async () => {
    const list = async () => (await t.request('GET', '/fin/categories', { user })).body;
    const rent = (body) => body.groups.flatMap((g) => g.categories).find((c) => c.key === 'fixed.loyer');
    assert.equal(rent(await list()).essential, true);
    assert.equal(rent(await list()).group, 'Logement');

    assert.equal((await t.request('PATCH', '/fin/categories/standard/fixed.loyer', { user, json: { essential: false } })).status, 200);
    assert.equal(rent(await list()).essential, false, 'the person’s own reading');
  });
});

describe('P8-27 — a colour for every category on screen', () => {
  test('every category served has a colour; a group shares one; a person may choose their own', async () => {
    const hex = /^#[0-9A-Fa-f]{6}$/;
    const all = (await list()).body.groups.flatMap((g) => g.categories);
    assert.deepEqual(all.filter((c) => !hex.test(c.color ?? '')).map((c) => c.key ?? c.label), []);
    const food = all.filter((c) => c.group === 'Alimentation');
    assert.ok(food.length > 1 && food.every((c) => c.groupColor === food[0].groupColor), 'the sub-categories of a group share its colour');
    const own = await t.request('POST', '/fin/categories', { user, json: { family: 'variable', label: 'Mes plantes', color: '#15803D' } });
    assert.equal(own.status, 201);
    assert.equal(own.body.category.color, '#15803D');
    assert.equal((await t.request('POST', '/fin/categories', { user, json: { family: 'variable', label: 'X', color: 'vert' } })).status, 400);
  });
});

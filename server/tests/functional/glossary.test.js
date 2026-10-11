import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// "Apprendre" glossary and mini-guides (P2-08) through the real API and database.

let t;
let admin;

const adm = (method, path, json) => t.request(method, `/admin/glossary${path}`, { user: admin, json });
const pub = (path) => t.request('GET', `/apprendre${path}`);

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  admin = await t.admin();
});
after(() => t.close());

describe('glossary terms, administration', () => {
  test('a new term starts empty and draft; publishing an empty definition is refused', async () => {
    const created = (await adm('POST', '/terms', { term: 'Taux d’effort' })).body.term;
    assert.equal(created.status, 'draft');
    assert.equal(created.definition, '<p></p>');
    assert.match(created.slug, /^taux-d-effort/);
    assert.equal((await adm('POST', `/terms/${created.id}/publish`)).status, 422);
  });

  test('every replacement of the definition is kept in the history, not throttled', async () => {
    const term = (await adm('POST', '/terms', { term: 'Épargne de précaution' })).body.term;
    await adm('PATCH', `/terms/${term.id}`, { definition: '<p>Première version.</p>' });
    await adm('PATCH', `/terms/${term.id}`, { definition: '<p>Deuxième version.</p>' });
    await adm('PATCH', `/terms/${term.id}`, { definition: '<p>Troisième version.</p>' });
    const revisions = (await adm('GET', `/terms/${term.id}/revisions`)).body.revisions;
    assert.equal(revisions.length, 3, 'one snapshot per change, taken before it');
    assert.match(revisions[0].definition, /Deuxième/, 'most recent snapshot first, holding the version just replaced');
    assert.match(revisions[2].definition, /vide|^<p><\/p>$/, 'the very first snapshot is the empty starting definition');
  });

  test('publish / unpublish, and related terms must exist', async () => {
    const a = (await adm('POST', '/terms', { term: 'Dette' })).body.term;
    const b = (await adm('POST', '/terms', { term: 'Crédit' })).body.term;
    const bad = await adm('PATCH', `/terms/${a.id}`, { definition: '<p>x</p>', relatedTerms: ['00000000-0000-4000-8000-000000000000'] });
    assert.equal(bad.status, 400);
    const ok = await adm('PATCH', `/terms/${a.id}`, { definition: '<p>x</p>', relatedTerms: [b.id] });
    assert.equal(ok.status, 200);
    assert.equal((await adm('POST', `/terms/${a.id}/publish`)).body.term.status, 'published');
    assert.equal((await adm('POST', `/terms/${a.id}/unpublish`)).body.term.status, 'draft');
  });

  test('deleting a term', async () => {
    const term = (await adm('POST', '/terms', { term: 'Jetable' })).body.term;
    assert.equal((await adm('DELETE', `/terms/${term.id}`)).status, 204);
    assert.equal((await adm('GET', `/terms/${term.id}`)).status, 404);
  });
});

describe('mini-guides, administration', () => {
  test('created at the end of the list, draft, publishing empty refused', async () => {
    const a = (await adm('POST', '/guides', { title: 'Premier guide' })).body.guide;
    const b = (await adm('POST', '/guides', { title: 'Second guide' })).body.guide;
    assert.equal(b.position, a.position + 1);
    assert.equal((await adm('POST', `/guides/${a.id}/publish`)).status, 422);
    await adm('PATCH', `/guides/${a.id}`, { body: '<p>Contenu réel.</p>' });
    assert.equal((await adm('POST', `/guides/${a.id}/publish`)).body.guide.status, 'published');
  });

  test('reordering takes the complete list, and refuses a partial or stale one', async () => {
    const a = (await adm('POST', '/guides', { title: 'A' })).body.guide;
    const b = (await adm('POST', '/guides', { title: 'B' })).body.guide;
    const c = (await adm('POST', '/guides', { title: 'C' })).body.guide;
    assert.equal((await adm('PUT', '/guides/order', { ids: [c.id, a.id, b.id] })).status, 204);
    const list = (await adm('GET', '/guides')).body.guides.map((g) => g.title);
    assert.deepEqual(list, ['C', 'A', 'B']);
    assert.equal((await adm('PUT', '/guides/order', { ids: [c.id, a.id] })).status, 409);
  });

  test('deleting a guide', async () => {
    const g = (await adm('POST', '/guides', { title: 'À supprimer' })).body.guide;
    assert.equal((await adm('DELETE', `/guides/${g.id}`)).status, 204);
    assert.equal((await adm('GET', `/guides/${g.id}`)).status, 404);
  });
});

describe('public "Apprendre" page', () => {
  test('search finds only published terms and guides, by term/definition/title/body text', async () => {
    const term = (await adm('POST', '/terms', { term: 'Taux d’endettement' })).body.term;
    await adm('PATCH', `/terms/${term.id}`, { definition: '<p>Part du revenu consacrée au remboursement.</p>' });
    await adm('POST', `/terms/${term.id}/publish`);
    const draftTerm = (await adm('POST', '/terms', { term: 'Brouillon' })).body.term;
    await adm('PATCH', `/terms/${draftTerm.id}`, { definition: '<p>x</p>' });

    const guide = (await adm('POST', '/guides', { title: 'Comprendre son taux d’endettement' })).body.guide;
    await adm('PATCH', `/guides/${guide.id}`, { body: '<p>Guide publié.</p>' });
    await adm('POST', `/guides/${guide.id}/publish`);

    const res = await pub('?query=endettement');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.terms.map((x) => x.term), ['Taux d’endettement']);
    assert.deepEqual(res.body.guides.map((x) => x.title), ['Comprendre son taux d’endettement']);

    const empty = await pub('?query=brouillon');
    assert.deepEqual(empty.body.terms, [], 'a draft never appears in public search');
  });

  test('filters by level and theme', async () => {
    const a = (await adm('POST', '/terms', { term: 'A' })).body.term;
    await adm('PATCH', `/terms/${a.id}`, { definition: '<p>x</p>', level: 'beginner', theme: 'budget' });
    await adm('POST', `/terms/${a.id}/publish`);
    const b = (await adm('POST', '/terms', { term: 'B' })).body.term;
    await adm('PATCH', `/terms/${b.id}`, { definition: '<p>x</p>', level: 'advanced', theme: 'dette' });
    await adm('POST', `/terms/${b.id}/publish`);

    assert.deepEqual((await pub('?level=beginner')).body.terms.map((x) => x.term), ['A']);
    assert.deepEqual((await pub('?theme=dette')).body.terms.map((x) => x.term), ['B']);
  });

  test('a term page shows its related published terms; a draft term or guide is a 404', async () => {
    const a = (await adm('POST', '/terms', { term: 'Capital' })).body.term;
    const b = (await adm('POST', '/terms', { term: 'Intérêt' })).body.term;
    await adm('PATCH', `/terms/${a.id}`, { definition: '<p>x</p>', relatedTerms: [b.id] });
    await adm('POST', `/terms/${a.id}/publish`);
    // b stays draft: must not be offered as "related" from the public side.
    const res = await pub(`/termes/${a.slug}`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.term.related, []);
    await adm('PATCH', `/terms/${b.id}`, { definition: '<p>y</p>' });
    await adm('POST', `/terms/${b.id}/publish`);
    const res2 = await pub(`/termes/${a.slug}`);
    assert.deepEqual(res2.body.term.related.map((x) => x.term), ['Intérêt']);

    const draft = (await adm('POST', '/terms', { term: 'Jamais publié' })).body.term;
    assert.equal((await pub(`/termes/${draft.slug}`)).status, 404);

    const guide = (await adm('POST', '/guides', { title: 'Guide public' })).body.guide;
    assert.equal((await pub(`/guides/${guide.slug}`)).status, 404, 'still draft');
    await adm('PATCH', `/guides/${guide.id}`, { body: '<p>x</p>' });
    await adm('POST', `/guides/${guide.id}/publish`);
    assert.equal((await pub(`/guides/${guide.slug}`)).status, 200);
  });

  test('needs no session at all', async () => {
    assert.equal((await pub('')).status, 200);
  });
});

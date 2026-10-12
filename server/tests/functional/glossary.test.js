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
    assert.deepEqual(res.body.terms.map((x) => x.title), ['Taux d’endettement']);
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

    assert.deepEqual((await pub('?level=beginner')).body.terms.map((x) => x.title), ['A']);
    assert.deepEqual((await pub('?theme=dette')).body.terms.map((x) => x.title), ['B']);
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

// What finishing P2-08 added (2026-10-11): the search covers the four kinds of
// content the client lists, not only the glossary; an entry can point at a
// calculator; and content can be kept as a favourite.
describe('the grouped search of the four kinds of content', () => {
  const publishTerm = async (name, patch = {}) => {
    const term = (await adm('POST', '/terms', { term: name })).body.term;
    await adm('PATCH', `/terms/${term.id}`, { definition: `<p>${name} explique</p>`, ...patch });
    await adm('POST', `/terms/${term.id}/publish`);
    return term;
  };

  test('courses, articles, terms and guides come back in four groups', async () => {
    await publishTerm('Epargne', { theme: 'budget' });
    const formation = await t.formation({ title: 'Gerer son budget', status: 'published', theme: 'budget', level: 'beginner' });
    const article = await t.article({ title: 'Tenir un budget', status: 'published', theme: 'budget', level: 'beginner' });

    const res = await pub('');
    assert.equal(res.status, 200);
    for (const group of ['courses', 'articles', 'terms', 'guides']) assert.ok(Array.isArray(res.body[group]), group);
    assert.deepEqual(res.body.courses.map((c) => c.title), [formation.title]);
    assert.deepEqual(res.body.articles.map((a) => a.title), [article.title]);
    // One card shape for the four kinds, so a single component can render them.
    for (const card of [...res.body.courses, ...res.body.articles, ...res.body.terms]) {
      for (const field of ['kind', 'id', 'slug', 'title']) assert.ok(field in card, `${card.kind}.${field}`);
    }
    assert.equal(res.body.courses[0].kind, 'course');
  });

  test('the two axes filter every kind, and the search text reaches courses and articles', async () => {
    await t.formation({ title: 'Credit immobilier', status: 'published', theme: 'dette', level: 'advanced' });
    await t.formation({ title: 'Premiers pas', status: 'published', theme: 'budget', level: 'beginner' });
    await t.article({ title: 'Rembourser plus vite', status: 'published', theme: 'dette', level: 'advanced' });

    const byTheme = await pub('?theme=dette');
    assert.deepEqual(byTheme.body.courses.map((c) => c.title), ['Credit immobilier']);
    assert.deepEqual(byTheme.body.articles.map((a) => a.title), ['Rembourser plus vite']);

    const byLevel = await pub('?level=beginner');
    assert.deepEqual(byLevel.body.courses.map((c) => c.title), ['Premiers pas']);
    assert.equal(byLevel.body.articles.length, 0, 'an article of another level is filtered out');

    const byText = await pub('?query=immobilier');
    assert.deepEqual(byText.body.courses.map((c) => c.title), ['Credit immobilier']);
  });

  test('a draft course or article is never in the results', async () => {
    await t.formation({ title: 'Brouillon de cours', status: 'draft' });
    await t.article({ title: 'Brouillon article', status: 'draft' });
    const res = await pub('');
    assert.equal(res.body.courses.length, 0);
    assert.equal(res.body.articles.length, 0);
  });

  test('a premium article is found and shown, but its text is not searchable by someone who cannot read it', async () => {
    await t.article({ title: 'Analyse reservee', status: 'published', requiredAccessLevel: 'premium', body: '<p>un secret payant</p>' });

    // Found by its public teaser, with the lock said out loud.
    const visitor = await pub('?query=Analyse');
    assert.equal(visitor.body.articles.length, 1);
    assert.equal(visitor.body.articles[0].lock, 'login_required');

    // Its TEXT is not searchable: that would reveal a paid article word by word.
    assert.equal((await pub('?query=secret%20payant')).body.articles.length, 0);

    // For a premium reader, the same search finds it.
    const premium = await t.user({ accessLevel: 'premium' });
    const asPremium = await t.request('GET', '/apprendre?query=secret%20payant', { user: premium });
    assert.equal(asPremium.body.articles.length, 1);
    assert.equal(asPremium.body.articles[0].lock, null);
  });

  test('content of the viewer public comes first, and nothing is ever hidden', async () => {
    await publishTerm('Avalanche de dettes', { theme: 'dette' });
    await publishTerm('Budget etudiant', { theme: 'etu' });

    const anonymous = await pub('');
    assert.equal(anonymous.body.terms.length, 2, 'both are listed for everyone');
    const order = anonymous.body.terms.map((x) => x.title);

    // A student sees the student theme first - and still sees the other one.
    const student = await t.user({ finPublic: 'ETU' });
    const ranked = await t.request('GET', '/apprendre', { user: student });
    assert.equal(ranked.body.terms.length, 2, 'ordering never removes anything');
    assert.equal(ranked.body.terms[0].title, 'Budget etudiant');
    assert.notDeepEqual(ranked.body.terms.map((x) => x.title), order);
  });
});

describe('the Simuler button and the favourites', () => {
  test('a calculator is attached by an administrator, and only a real one is accepted', async () => {
    const term = (await adm('POST', '/terms', { term: 'Mensualite' })).body.term;
    const refused = await adm('PATCH', `/terms/${term.id}`, { simulatorKey: 'calculateur-imaginaire' });
    assert.equal(refused.status, 400, 'a key no simulator answers to is refused');

    const ok = await adm('PATCH', `/terms/${term.id}`, { definition: '<p>x</p>', simulatorKey: 'mensualite-financement' });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.term.simulatorKey, 'mensualite-financement');
    await adm('POST', `/terms/${term.id}/publish`);

    // The public page and the search both carry it, so the button needs no
    // second request and no guessing.
    assert.equal((await pub(`/termes/${ok.body.term.slug}`)).body.term.simulator, 'mensualite-financement');
    assert.equal((await pub('')).body.terms[0].simulator, 'mensualite-financement');
  });

  test('keeping a favourite needs an account, and the list is the account own', async () => {
    const term = (await adm('POST', '/terms', { term: 'Reserve' })).body.term;
    await adm('PATCH', `/terms/${term.id}`, { definition: '<p>x</p>' });
    await adm('POST', `/terms/${term.id}/publish`);

    assert.equal((await t.request('GET', '/apprendre/favoris')).status, 401);
    assert.equal((await t.request('POST', '/apprendre/favoris', { json: { kind: 'term', refId: term.id } })).status, 401);

    const me = await t.user();
    const other = await t.user();
    const added = await t.request('POST', '/apprendre/favoris', { user: me, json: { kind: 'term', refId: term.id } });
    assert.equal(added.status, 201);
    assert.equal(added.body.favorite.title, 'Reserve');

    // Clicking twice is not an error.
    assert.equal((await t.request('POST', '/apprendre/favoris', { user: me, json: { kind: 'term', refId: term.id } })).status, 201);
    assert.equal((await t.request('GET', '/apprendre/favoris', { user: me })).body.favorites.length, 1);
    assert.equal((await t.request('GET', '/apprendre/favoris', { user: other })).body.favorites.length, 0);

    assert.equal((await t.request('DELETE', `/apprendre/favoris/term/${term.id}`, { user: me })).status, 204);
    assert.equal((await t.request('GET', '/apprendre/favoris', { user: me })).body.favorites.length, 0);
    assert.equal((await t.request('DELETE', `/apprendre/favoris/term/${term.id}`, { user: me })).status, 404);
  });

  test('a favourite can only point at published content, and an unknown kind is refused', async () => {
    const me = await t.user();
    const draft = (await adm('POST', '/terms', { term: 'Jamais publie' })).body.term;
    assert.equal((await t.request('POST', '/apprendre/favoris', { user: me, json: { kind: 'term', refId: draft.id } })).status, 404);
    assert.equal((await t.request('POST', '/apprendre/favoris', { user: me, json: { kind: 'podcast', refId: draft.id } })).status, 400);
    assert.equal((await t.request('POST', '/apprendre/favoris', { user: me, json: { kind: 'term', refId: 'pas-un-uuid' } })).status, 400);
  });

  test('a favourite whose content is unpublished later simply drops out of the list', async () => {
    const me = await t.user();
    const term = (await adm('POST', '/terms', { term: 'Volatile' })).body.term;
    await adm('PATCH', `/terms/${term.id}`, { definition: '<p>x</p>' });
    await adm('POST', `/terms/${term.id}/publish`);
    await t.request('POST', '/apprendre/favoris', { user: me, json: { kind: 'term', refId: term.id } });
    assert.equal((await t.request('GET', '/apprendre/favoris', { user: me })).body.favorites.length, 1);

    await adm('POST', `/terms/${term.id}/unpublish`);
    assert.equal((await t.request('GET', '/apprendre/favoris', { user: me })).body.favorites.length, 0, 'no dead card');
  });
});

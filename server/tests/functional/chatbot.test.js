import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Guided assistant (P3-07) through the real API and the real database:
// an administrator writes the questions, visitors only read the published ones.

let t;
let admin;

const adm = (method, path, json) => t.request(method, `/admin/chatbot${path}`, { user: admin, json });
const pub = (lang) => t.request('GET', `/chatbot/entries${lang ? `?lang=${lang}` : ''}`);
const create = async (question, extra = {}) => (await adm('POST', '', { question, answer: `<p>Réponse à ${question}</p>`, ...extra })).body.entry;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  admin = await t.admin();
});
after(() => t.close());

describe('administration', () => {
  test('a new entry is a draft, at the end of its language, with a sanitised answer', async () => {
    const res = await adm('POST', '', { question: '  Comment créer un compte ?  ', answer: '<p>Cliquez sur <strong>Inscription</strong>.</p>' });
    assert.equal(res.status, 201);
    assert.equal(res.body.entry.question, 'Comment créer un compte ?', 'trimmed');
    assert.equal(res.body.entry.status, 'draft');
    assert.equal(res.body.entry.language, 'fr', 'French by default');
    assert.equal(res.body.entry.position, 0);
    const second = await create('Deuxième question');
    assert.equal(second.position, 1);
    const english = await create('First English question', { language: 'en' });
    assert.equal(english.position, 0, 'each language has its own order');
  });

  test('an answer without visible text, or an empty question, is refused', async () => {
    assert.equal((await adm('POST', '', { question: 'Q', answer: '<p></p>' })).status, 400);
    assert.equal((await adm('POST', '', { question: '   ', answer: '<p>R</p>' })).status, 400);
    assert.equal((await adm('POST', '', { question: 'Q', answer: '<p>R</p>', language: 'tzm' })).status, 400);
    assert.equal((await adm('POST', '', { question: 'x'.repeat(201), answer: '<p>R</p>' })).status, 400);
    assert.equal((await adm('POST', '', { question: 'Q', answer: '<p>R</p>', status: 'published' })).status, 400, 'status is not writable at creation');
  });

  test('editing, publishing, unpublishing and deleting', async () => {
    const entry = await create('Question');
    const edited = await adm('PATCH', `/${entry.id}`, { question: 'Question modifiée', answer: '<p>Nouvelle réponse</p>' });
    assert.equal(edited.status, 200);
    assert.equal(edited.body.entry.question, 'Question modifiée');
    assert.equal((await adm('POST', `/${entry.id}/publish`)).body.entry.status, 'published');
    assert.equal((await adm('POST', `/${entry.id}/unpublish`)).body.entry.status, 'draft');
    assert.equal((await adm('DELETE', `/${entry.id}`)).status, 204);
    assert.equal((await adm('PATCH', `/${entry.id}`, { question: 'x' })).status, 404);
    assert.equal((await adm('DELETE', '/not-a-uuid')).status, 404);
  });

  test('moving an entry to another language puts it at the end of that language', async () => {
    await create('EN 1', { language: 'en' });
    const fr = await create('FR 1');
    const moved = await adm('PATCH', `/${fr.id}`, { language: 'en' });
    assert.equal(moved.body.entry.language, 'en');
    assert.equal(moved.body.entry.position, 1);
  });

  test('reordering takes the complete list of one language, and refuses a partial or stale one', async () => {
    const a = await create('A');
    const b = await create('B');
    const c = await create('C');
    assert.equal((await adm('PUT', '/order', { language: 'fr', ids: [c.id, a.id, b.id] })).status, 204);
    const list = (await adm('GET', '')).body.entries.filter((e) => e.language === 'fr').map((e) => e.question);
    assert.deepEqual(list, ['C', 'A', 'B']);
    assert.equal((await adm('PUT', '/order', { language: 'fr', ids: [c.id, a.id] })).status, 409, 'an entry is missing');
    assert.equal((await adm('PUT', '/order', { language: 'fr', ids: [c.id, a.id, a.id] })).status, 409, 'an entry twice');
    assert.equal((await adm('PUT', '/order', { language: 'en', ids: [a.id, b.id, c.id] })).status, 409, 'entries of another language');
  });
});

describe('public reading', () => {
  test('only published entries of the requested language, in order, without any internal field', async () => {
    const a = await create('Publiée A');
    const b = await create('Publiée B');
    await create('Brouillon');
    const en = await create('Published EN', { language: 'en' });
    for (const e of [a, b, en]) await adm('POST', `/${e.id}/publish`);
    await adm('PUT', '/order', { language: 'fr', ids: [b.id, a.id, (await adm('GET', '')).body.entries.find((e) => e.question === 'Brouillon').id] });

    const fr = await pub();
    assert.equal(fr.status, 200);
    assert.deepEqual(fr.body.entries.map((e) => e.question), ['Publiée B', 'Publiée A'], 'French by default, drafts hidden');
    assert.deepEqual(Object.keys(fr.body.entries[0]).sort(), ['answer', 'id', 'question']);
    assert.deepEqual((await pub('en')).body.entries.map((e) => e.question), ['Published EN']);
    assert.deepEqual((await pub('ar')).body.entries, [], 'nothing published: an empty list (the client hides the button)');
    assert.equal((await pub('xx')).status, 400);
  });
});

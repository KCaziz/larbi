import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// "Apprendre" glossary and mini-guides (P2-08): administration refused to
// non-administrators, and the rich text is sanitised the same way as everywhere.

let t;
let admin;
let learner;

before(async () => {
  t = await boot();
  await t.reset();
  admin = await t.admin();
  learner = await t.user();
});
after(() => t.close());

describe('glossary and guides security', () => {
  test('every admin route is refused to anonymous (401) and to a learner (403)', async () => {
    const calls = [
      ['GET', '/admin/glossary/terms'],
      ['POST', '/admin/glossary/terms', { term: 'X' }],
      ['GET', '/admin/glossary/guides'],
      ['POST', '/admin/glossary/guides', { title: 'X' }],
    ];
    for (const [method, path, json] of calls) {
      assert.equal((await t.request(method, path, { json })).status, 401, `${method} ${path} anonymous`);
      assert.equal((await t.request(method, path, { user: learner, json })).status, 403, `${method} ${path} learner`);
    }
  });

  test('a term definition is sanitised the same as every other rich text (scripts and handlers stripped, links kept)', async () => {
    const term = (
      await t.request('POST', '/admin/glossary/terms', { user: admin, json: { term: 'XSS' } })
    ).body.term;
    const res = await t.request('PATCH', `/admin/glossary/terms/${term.id}`, {
      user: admin,
      json: { definition: '<p onclick="alert(1)">Texte<script>alert(1)</script><a href="https://example.com">lien</a></p>' },
    });
    assert.equal(res.status, 200);
    const stored = res.body.term.definition;
    assert.ok(!stored.includes('<script') && !stored.includes('onclick'));
    assert.ok(stored.includes('href="https://example.com"'));

    await t.request('POST', `/admin/glossary/terms/${term.id}/publish`, { user: admin });
    const publicDef = (await t.request('GET', `/apprendre/termes/${term.body?.slug ?? term.slug}`)).body.term.definition;
    assert.equal(publicDef, stored, 'the public page shows the sanitised version');
  });

  test('a mini-guide body is sanitised the same way', async () => {
    const guide = (await t.request('POST', '/admin/glossary/guides', { user: admin, json: { title: 'XSS guide' } })).body.guide;
    const res = await t.request('PATCH', `/admin/glossary/guides/${guide.id}`, { user: admin, json: { body: '<img src=x onerror=alert(1)><p>Texte</p>' } });
    assert.ok(!res.body.guide.body.includes('onerror'));
  });

  test('a draft term or guide never appears in public search, whatever is searched', async () => {
    await t.request('POST', '/admin/glossary/terms', { user: admin, json: { term: 'Secret interne' } });
    const res = await t.request('GET', '/apprendre?query=secret');
    assert.deepEqual(res.body.terms, []);
  });
});

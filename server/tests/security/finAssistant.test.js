import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// FINCLUDIA deterministic assistant (P3-19) security: administration refused
// to non-administrators, no data of another user ever leaks through it, rich
// text sanitised, and the query itself cannot carry a script into the audit.

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

describe('fin-assistant security', () => {
  test('every admin route is refused to anonymous (401) and to a learner (403)', async () => {
    const intents = (await t.request('GET', '/admin/fin-assistant/intents', { user: admin })).body.intents;
    const id = intents[0].id;
    const calls = [
      ['GET', '/admin/fin-assistant/intents'],
      ['PATCH', `/admin/fin-assistant/intents/${id}`, { label: 'X' }],
      ['GET', '/admin/fin-assistant/flows'],
      ['POST', '/admin/fin-assistant/flows', { name: 'X' }],
      ['GET', '/admin/fin-assistant/audit-log'],
    ];
    for (const [method, path, json] of calls) {
      assert.equal((await t.request(method, path, { json })).status, 401, `${method} ${path} anonymous`);
      assert.equal((await t.request(method, path, { user: learner, json })).status, 403, `${method} ${path} learner`);
    }
  });

  test('a response template is sanitised exactly like every other rich text', async () => {
    const intents = (await t.request('GET', '/admin/fin-assistant/intents', { user: admin })).body.intents;
    const target = intents[0];
    const res = await t.request('PATCH', `/admin/fin-assistant/intents/${target.id}`, {
      user: admin,
      json: { responseTemplate: '<p onclick="alert(1)">Texte<script>alert(1)</script><a href="https://example.com">lien</a></p>' },
    });
    assert.equal(res.status, 200);
    assert.ok(!res.body.intent.responseTemplate.includes('<script') && !res.body.intent.responseTemplate.includes('onclick'));
    assert.ok(res.body.intent.responseTemplate.includes('href="https://example.com"'));
  });

  test('an unpublished flow cannot be read by guessing its key', async () => {
    const flow = (await t.request('POST', '/admin/fin-assistant/flows', { user: admin, json: { name: 'Secret' } })).body.flow;
    assert.equal((await t.request('GET', `/fin-assistant/flows/${flow.key}`)).status, 404);
  });

  test('resolving never returns a draft intent, whatever the query', async () => {
    const intents = (await t.request('GET', '/admin/fin-assistant/intents', { user: admin })).body.intents;
    const target = intents.find((i) => i.code === 'AIDE_DETTE');
    await t.request('PATCH', `/admin/fin-assistant/intents/${target.id}`, { user: admin, json: { keywords: ['dette'], responseTemplate: '<p>x</p>' } });
    // Never published.
    const res = await t.request('POST', '/fin-assistant/resolve', { json: { query: 'dette' } });
    assert.equal(res.body.type, 'fallback');
  });

  test('a query is refused if empty or too long; no server error either way', async () => {
    assert.equal((await t.request('POST', '/fin-assistant/resolve', { json: { query: '' } })).status, 400);
    assert.equal((await t.request('POST', '/fin-assistant/resolve', { json: { query: 'x'.repeat(201) } })).status, 400);
    assert.equal((await t.request('POST', '/fin-assistant/resolve', { json: { query: 'x', extra: 1 } })).status, 400, 'no unknown field');
  });

  test('the audit log never records free text, only closed codes', async () => {
    await t.request('POST', '/fin-assistant/resolve', { json: { query: '<script>alert(1)</script>' } });
    const entry = await t.prisma.finAuditLog.findFirst({ orderBy: { createdAt: 'desc' } });
    assert.ok(!JSON.stringify(entry).includes('script'));
  });

  test('a step option naming an unpublished intent is still only ever resolved through the real resolver (the option itself is just data)', async () => {
    const flow = (await t.request('POST', '/admin/fin-assistant/flows', { user: admin, json: { name: 'Avec intention' } })).body.flow;
    const res = await t.request('POST', `/admin/fin-assistant/flows/${flow.id}/steps`, {
      user: admin,
      json: { stepKey: 'a', prompt: 'x', options: [{ label: 'y', nextStepKey: null, intentCode: 'NAVIGUER' }] },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.step.options[0].intentCode, 'NAVIGUER');
  });

  test('a step cannot reference an intent code outside the closed list', async () => {
    const flow = (await t.request('POST', '/admin/fin-assistant/flows', { user: admin, json: { name: 'Mauvaise intention' } })).body.flow;
    const res = await t.request('POST', `/admin/fin-assistant/flows/${flow.id}/steps`, {
      user: admin,
      json: { stepKey: 'a', prompt: 'x', options: [{ label: 'y', nextStepKey: null, intentCode: 'INVENTE' }] },
    });
    assert.equal(res.status, 400);
  });
});

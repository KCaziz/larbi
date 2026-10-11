import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// FINCLUDIA deterministic assistant (P3-19) through the real API and database.

let t;
let admin;

const adm = (method, path, json) => t.request(method, `/admin/fin-assistant${path}`, { user: admin, json });
const pub = (method, path, json) => t.request(method, `/fin-assistant${path}`, { json });

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  admin = await t.admin();
});
after(() => t.close());

describe('intents administration', () => {
  test('the 8 intents of the client\'s file are seeded on first list, all draft', async () => {
    const res = await adm('GET', '/intents');
    assert.equal(res.status, 200);
    assert.equal(res.body.intents.length, 8);
    assert.ok(res.body.intents.every((i) => i.status === 'draft'));
    assert.deepEqual(res.body.intents.map((i) => i.code).sort(), ['AIDE_BUDGET', 'AIDE_DETTE', 'APPRENDRE_TERME', 'CHERCHER_SOLUTION', 'CRÉER_OBJECTIF', 'DÉPENSE_PARTAGÉE', 'EXPLIQUER_INDICATEUR', 'NAVIGUER'].sort());
    const again = await adm('GET', '/intents');
    assert.equal(again.body.intents.length, 8, 'seeding is idempotent');
  });

  test('publishing without a response is refused; a whitelisted deep link is accepted, an unknown one is refused', async () => {
    const intents = (await adm('GET', '/intents')).body.intents;
    const navigate = intents.find((i) => i.code === 'NAVIGUER');
    assert.equal((await adm('POST', `/intents/${navigate.id}/publish`)).status, 422);
    assert.equal((await adm('PATCH', `/intents/${navigate.id}`, { deepLinkPath: '/ecran-inconnu' })).status, 400);
    const ok = await adm('PATCH', `/intents/${navigate.id}`, { responseTemplate: '<p>Ouvrez Apprendre.</p>', keywords: ['depense', 'ajouter'], deepLinkPath: '/apprendre' });
    assert.equal(ok.status, 200);
    assert.equal((await adm('POST', `/intents/${navigate.id}/publish`)).body.intent.status, 'published');
  });
});

describe('resolving a query (public)', () => {
  async function publishNaviguer() {
    const intents = (await adm('GET', '/intents')).body.intents;
    const navigate = intents.find((i) => i.code === 'NAVIGUER');
    await adm('PATCH', `/intents/${navigate.id}`, { responseTemplate: '<p>Ouvrez Apprendre.</p>', keywords: ['depense', 'ajouter'], deepLinkPath: '/apprendre' });
    await adm('POST', `/intents/${navigate.id}/publish`);
    return navigate;
  }

  test('a matching query resolves to the intent, with its deep link', async () => {
    await publishNaviguer();
    const res = await pub('POST', '/resolve', { query: 'Où ajouter une dépense ?' });
    assert.equal(res.status, 200);
    assert.equal(res.body.type, 'intent');
    assert.equal(res.body.intent.code, 'NAVIGUER');
    assert.equal(res.body.intent.deepLinkPath, '/apprendre');
    assert.equal(await t.prisma.finAuditLog.count({ where: { action: 'resolved', intentCode: 'NAVIGUER' } }), 1);
  });

  test('a draft intent is never matched, even with its own keywords', async () => {
    const intents = (await adm('GET', '/intents')).body.intents;
    const navigate = intents.find((i) => i.code === 'NAVIGUER');
    await adm('PATCH', `/intents/${navigate.id}`, { keywords: ['depense'] });
    const res = await pub('POST', '/resolve', { query: 'depense' });
    assert.equal(res.body.type, 'fallback');
  });

  test('an unmatched query falls back to up to 6 published categories', async () => {
    await publishNaviguer();
    const res = await pub('POST', '/resolve', { query: 'bonjour tout le monde' });
    assert.equal(res.body.type, 'fallback');
    assert.deepEqual(res.body.categories.map((c) => c.code), ['NAVIGUER']);
    assert.equal(await t.prisma.finAuditLog.count({ where: { action: 'fallback' } }), 1);
  });

  test('a deep link an administrator removed from the whitelist (never possible through the API) never leaks: the server re-checks it', async () => {
    const navigate = await publishNaviguer();
    // Simulate stale data: directly write a path outside the whitelist.
    await t.prisma.finIntent.update({ where: { id: navigate.id }, data: { deepLinkPath: '/un-ecran-retire' } });
    const res = await pub('POST', '/resolve', { query: 'ajouter une dépense' });
    assert.equal(res.body.intent.deepLinkPath, null, 'never offered if not on the current whitelist');
  });

  test('needs no session; a logged-in visitor is recorded in the audit log', async () => {
    await publishNaviguer();
    const learner = await t.user();
    await t.request('POST', '/fin-assistant/resolve', { user: learner, json: { query: 'ajouter une dépense' } });
    const entry = await t.prisma.finAuditLog.findFirst({ where: { intentCode: 'NAVIGUER' } });
    assert.equal(entry.userId, learner.id);
  });

  test('no financial data, and no raw query text, is ever stored in the audit log', async () => {
    await publishNaviguer();
    await pub('POST', '/resolve', { query: 'ajouter une dépense de 50000 DA' });
    const entry = await t.prisma.finAuditLog.findFirst({ orderBy: { createdAt: 'desc' } });
    assert.deepEqual(Object.keys(entry).sort(), ['action', 'createdAt', 'flowKey', 'id', 'intentCode', 'stepKey', 'userId'].sort());
  });
});

describe('flows', () => {
  test('a flow with steps, published, is readable publicly; a draft one is a 404', async () => {
    const flow = (await adm('POST', '/flows', { name: 'Budget en 3 étapes' })).body.flow;
    assert.equal(flow.key, 'budget-en-3-etapes');
    assert.equal((await pub('GET', `/flows/${flow.key}`)).status, 404, 'draft, not public yet');
    assert.equal((await adm('POST', `/flows/${flow.id}/publish`)).status, 422, 'no step yet');

    const step1 = (await adm('POST', `/flows/${flow.id}/steps`, { stepKey: 'depart', prompt: 'Quel est votre revenu ?', options: [{ label: 'Continuer', nextStepKey: 'charges', intentCode: null }] })).body.step;
    await adm('POST', `/flows/${flow.id}/steps`, { stepKey: 'charges', prompt: 'Quelles sont vos charges ?', options: [] });
    assert.equal((await adm('POST', `/flows/${flow.id}/publish`)).body.flow.status, 'published');

    const res = await pub('GET', `/flows/${flow.key}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.flow.steps.length, 2);
    assert.equal(res.body.flow.steps[0].stepKey, 'depart');
    assert.deepEqual(res.body.flow.steps[0].options, [{ label: 'Continuer', nextStepKey: 'charges', intentCode: null }]);
    assert.equal(await t.prisma.finAuditLog.count({ where: { action: 'flow_started', flowKey: flow.key } }), 1);
    assert.ok(step1.id);
  });

  test('two steps of the same flow cannot share a key', async () => {
    const flow = (await adm('POST', '/flows', { name: 'Doublon' })).body.flow;
    await adm('POST', `/flows/${flow.id}/steps`, { stepKey: 'a', prompt: 'x', options: [] });
    assert.equal((await adm('POST', `/flows/${flow.id}/steps`, { stepKey: 'a', prompt: 'y', options: [] })).status, 409);
  });

  test('deleting a flow removes its steps', async () => {
    const flow = (await adm('POST', '/flows', { name: 'Jetable' })).body.flow;
    await adm('POST', `/flows/${flow.id}/steps`, { stepKey: 'a', prompt: 'x', options: [] });
    assert.equal((await adm('DELETE', `/flows/${flow.id}`)).status, 204);
    assert.equal(await t.prisma.finFlowStep.count({ where: { flowId: flow.id } }), 0);
  });
});

describe('audit log, administration', () => {
  test('read-only list, most recent first', async () => {
    const intents = (await adm('GET', '/intents')).body.intents;
    const navigate = intents.find((i) => i.code === 'NAVIGUER');
    await adm('PATCH', `/intents/${navigate.id}`, { responseTemplate: '<p>x</p>', keywords: ['depense'] });
    await adm('POST', `/intents/${navigate.id}/publish`);
    await pub('POST', '/resolve', { query: 'depense' });
    await pub('POST', '/resolve', { query: 'rien de connu' });
    const log = (await adm('GET', '/audit-log')).body.entries;
    assert.deepEqual(log.map((e) => e.action), ['fallback', 'resolved']);
  });
});

import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { confirmedValue } from '../../src/services/regulatoryParams.service.js';

// P13-05: the regulatory values of the client's référentiel (tab
// 25_PARAMETRES) are confirmed by the client, one by one, with their date —
// never applied from the workbook's candidate alone (DEC-001).

let t;
let admin;
let user;
before(async () => {
  t = await boot();
  await t.reset();
  await t.prisma.platformSetting.deleteMany({ where: { key: 'regulatoryParams' } });
  admin = await t.admin();
  user = await t.user();
});
after(() => t.close());

describe('regulatory values to confirm (P13-05)', () => {
  test('all twelve are pending at first, with the workbook candidate shown, never applied', async () => {
    const res = await t.request('GET', '/admin/regulatory-params', { user: admin });
    assert.equal(res.status, 200);
    assert.equal(res.body.params.length, 12);
    assert.equal(res.body.pending, 12);
    const ifu = res.body.params.find((param) => param.key === 'PARM-002');
    assert.equal(ifu.candidate, '0.005');
    assert.equal(ifu.status, 'pending');
    assert.equal(await confirmedValue('PARM-002'), null, 'the candidate is not a confirmed value');
  });

  test('the administrator confirms a value with its date; it applies from that date only', async () => {
    const res = await t.request('PUT', '/admin/regulatory-params/PARM-002', { user: admin, json: { value: '0,005', effectiveFrom: '2026-01-01' } });
    assert.equal(res.status, 200);
    assert.equal(res.body.value, '0.005');
    const list = (await t.request('GET', '/admin/regulatory-params', { user: admin })).body;
    assert.equal(list.pending, 11);
    assert.equal(list.params.find((param) => param.key === 'PARM-002').status, 'confirmed');
    assert.equal(await confirmedValue('PARM-002', new Date('2026-06-01')), '0.005');
    assert.equal(await confirmedValue('PARM-002', new Date('2025-06-01')), null, 'not before its date');
  });

  test('a rule written in words is kept as written; a correction replaces the previous answer', async () => {
    await t.request('PUT', '/admin/regulatory-params/PARM-004', { user: admin, json: { value: 'Taux normal 19 %, réduit 9 %', effectiveFrom: '2026-01-01' } });
    await t.request('PUT', '/admin/regulatory-params/PARM-003', { user: admin, json: { value: '5000000', effectiveFrom: '2026-01-01' } });
    await t.request('PUT', '/admin/regulatory-params/PARM-003', { user: admin, json: { value: '6000000', effectiveFrom: '2026-02-01' } });
    assert.equal(await confirmedValue('PARM-004'), 'Taux normal 19 %, réduit 9 %');
    assert.equal(await confirmedValue('PARM-003'), '6000000');
    assert.equal((await t.request('GET', '/admin/regulatory-params', { user: admin })).body.pending, 9);
  });

  test('a wrong value, a missing date or an unknown parameter is refused', async () => {
    assert.equal((await t.request('PUT', '/admin/regulatory-params/PARM-002', { user: admin, json: { value: '5', effectiveFrom: '2026-01-01' } })).status, 422, 'a rate above 100 %');
    assert.equal((await t.request('PUT', '/admin/regulatory-params/PARM-003', { user: admin, json: { value: 'beaucoup', effectiveFrom: '2026-01-01' } })).status, 422);
    assert.equal((await t.request('PUT', '/admin/regulatory-params/PARM-002', { user: admin, json: { value: '0.005' } })).status, 400);
    assert.equal((await t.request('PUT', '/admin/regulatory-params/PARM-999', { user: admin, json: { value: 'x', effectiveFrom: '2026-01-01' } })).status, 404);
  });

  test('only an administrator reads or confirms them', async () => {
    assert.equal((await t.request('GET', '/admin/regulatory-params', { user })).status, 403);
    assert.equal((await t.request('PUT', '/admin/regulatory-params/PARM-005', { user, json: { value: 'x', effectiveFrom: '2026-01-01' } })).status, 403);
    assert.equal((await t.request('GET', '/admin/regulatory-params')).status, 401);
  });
});

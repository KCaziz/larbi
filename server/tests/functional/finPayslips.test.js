import '../helpers/setup-env.js';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The history of payslips (P8-15, the client's answer D5): a payslip is kept
// only when its owner asks, with consent; read and deleted by them only.

let t;
let user;

const as = (who, method, path, json) => t.request(method, path, { user: who, ...(json === undefined ? {} : { json }) });
const FICHE = {
  period: '2026-09',
  declaredNet: 5_200_000,
  lines: [
    { kind: 'base_salary', value: 6_000_000 },
    { kind: 'social_employee', value: 540_000 },
    { kind: 'irg', value: 260_000 },
  ],
};

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ finPublic: 'SAL', finCurrency: 'DZD' });
});
after(() => t.close());

describe('P8-15 — the payslips the person chooses to keep', () => {
  test('decoding keeps nothing', async () => {
    assert.equal((await as(user, 'POST', '/fin/paie/decoder', FICHE)).status, 200);
    assert.equal(await t.prisma.finPayslip.count(), 0);
  });

  test('nothing is kept without consent', async () => {
    assert.equal((await as(user, 'POST', '/fin/paie/fiches', FICHE)).status, 400);
    assert.equal((await as(user, 'POST', '/fin/paie/fiches', { ...FICHE, consent: false })).status, 400);
    assert.equal(await t.prisma.finPayslip.count(), 0);
  });

  test('kept with consent: what was typed and what the decoder made of it', async () => {
    const res = await as(user, 'POST', '/fin/paie/fiches', { ...FICHE, consent: true });
    assert.equal(res.status, 201);
    const { fiche } = res.body;
    assert.equal(fiche.period, '2026-09');
    assert.equal(fiche.gross, 6_000_000);
    assert.equal(fiche.value, 5_200_000);
    assert.equal(fiche.declaredNet, 5_200_000);
    assert.equal(fiche.lines.length, 3);
    const row = await t.prisma.finPayslip.findUnique({ where: { id: fiche.id } });
    assert.equal(row.status, 'declared');
    assert.equal(row.source, 'manual');

    const list = (await as(user, 'GET', '/fin/paie/fiches')).body.fiches;
    assert.deepEqual(list.map((f) => f.id), [fiche.id]);
  });

  test('another account neither sees nor deletes it; its owner deletes it for real', async () => {
    const { fiche } = (await as(user, 'POST', '/fin/paie/fiches', { ...FICHE, consent: true })).body;
    const other = await t.adult({ finPublic: 'SAL' });
    assert.deepEqual((await as(other, 'GET', '/fin/paie/fiches')).body.fiches, []);
    assert.equal((await as(other, 'DELETE', `/fin/paie/fiches/${fiche.id}`)).status, 404);

    assert.equal((await as(user, 'DELETE', `/fin/paie/fiches/${fiche.id}`)).status, 204);
    assert.equal(await t.prisma.finPayslip.count(), 0);
    assert.equal((await as(user, 'DELETE', `/fin/paie/fiches/${fiche.id}`)).status, 404);
  });

  test('a kept payslip is in the inventory and the export of the person’s data', async () => {
    await as(user, 'POST', '/fin/paie/fiches', { ...FICHE, consent: true });
    const inventory = await as(user, 'GET', '/fin/confiance/inventaire');
    assert.equal(inventory.status, 200, JSON.stringify(inventory.body));
    assert.match(JSON.stringify(inventory.body), /payslip/);
  });
});

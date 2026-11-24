import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P13-05, lot F (2026-11-24): simulators (client's cases), search, copilot.

let t;
before(async () => {
  t = await boot();
});
beforeEach(() => t.reset());
after(() => t.close());

async function setUp() {
  const owner = await t.adult();
  const created = await t.request('POST', '/fin/entreprise', { user: owner, json: { name: 'Cabinet Ait', currency: 'DZD', publicKey: 'PUB-01' } });
  const as = { 'X-Organisation': created.body.entreprise.id };
  return (method, path, json) => t.request(method, `/fin/entreprise${path}`, { user: owner, headers: as, json });
}

describe('lot F', () => {
  test('the simulators: the client’s cases, and the 180 rows of the workbook each placed', async () => {
    const call = await setUp();
    const loan = await call('POST', '/simulateurs/loan', { inputs: { principal: 100_000_000, annualRate: 0.06, months: 60 } });
    assert.equal(loan.body.outputs.find((o) => o.key === 'monthlyPayment').value, 1_933_280);
    const factoring = await call('POST', '/simulateurs/invoiceFinancing', { inputs: { eligible: 800_000_000, advanceRate: 0.8, feeRate: 0.01 } });
    assert.equal(factoring.body.outputs.find((o) => o.key === 'net').value, 632_000_000);
    const tax = await call('POST', '/simulateurs/regulatoryProvision', { inputs: { base: 1000 } });
    assert.equal(tax.body.regleNonPubliee !== undefined, true);
    const catalogue = (await call('GET', '/simulateurs')).body.catalogue;
    assert.ok(catalogue.length >= 178);
    assert.ok(catalogue.every((row) => row.code || row.reason));
  });

  test('search and copilot read the organisation’s own data', async () => {
    const call = await setUp();
    const client = (await call('POST', '/tiers', { kind: 'client', name: 'Société Atlas' })).body.tiers;
    await call('POST', '/documents', { kind: 'sale', label: 'Mission', contactId: client.id, issuedAt: '2026-11-01T00:00:00.000Z', amountExcl: 8_500_000, currency: 'DZD' });
    const found = (await call('GET', '/recherche?q=atlas')).body.resultats;
    assert.ok(found.some((r) => r.type === 'contact' && r.title === 'Société Atlas'));
    assert.ok((await call('GET', '/recherche?q=FAC-')).body.resultats.some((r) => r.type === 'document'));

    const answer = (await call('POST', '/copilote', { question: 'Combien me doit la société Atlas ?' })).body;
    assert.equal(answer.intent, 'clientBalance');
    assert.equal(answer.values.amount, 8_500_000);
    assert.equal((await call('POST', '/copilote', { question: 'Quel temps fera-t-il ?' })).body.intent, null, 'unknown: the menu, never an invented answer');
  });
});

import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P13-05, lot D (2026-11-24): micro-import and international trade through the
// API — an operation, its costs at a dated rate (DEC-015), its Incoterm with
// its named place (DEC-017), its file, its reception into stock as one lot at
// the landed cost (CNV-16), its margin, and an exchange scenario that creates
// nothing (CNV-12).

let t;
before(async () => {
  t = await boot();
});
beforeEach(() => t.reset());
after(() => t.close());

const C = (n) => Math.round(n * 100);
const day = (iso) => `${iso}T00:00:00.000Z`;
const rated = { rate: 135, rateDate: day('2026-11-01'), rateSource: 'Banque d’Algérie, cours du jour' };

async function setUp() {
  const owner = await t.adult();
  const created = await t.request('POST', '/fin/entreprise', { user: owner, json: { name: 'Import Sahel', currency: 'DZD', publicKey: 'PUB-09' } });
  const as = { 'X-Organisation': created.body.entreprise.id };
  const call = (method, path, json, user = owner) => t.request(method, `/fin/entreprise${path}`, { user, headers: as, json });
  return { owner, as, call };
}

const findOp = async (call, id) => (await call('GET', '/operations')).body.operations.find((op) => op.id === id);

describe('an import operation, from order to stock', () => {
  test('costs at a dated rate, a landed cost of 1 280 000, received as one lot of 400 at 3 200', async () => {
    const { call } = await setUp();
    const item = (await call('POST', '/stock/articles', { name: 'Pièces détachées', unit: 'pièce' })).body.article;
    const created = await call('POST', '/operations', { kind: 'import', label: 'Pièces Valence', country: 'ES', currency: 'EUR', incoterm: 'FOB', namedPlace: 'Port de Valence', itemId: item.id, quantityOrdered: 400 });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    const op = created.body.operation;
    assert.match(op.reference, /^OP-\d{4}-0001$/);
    assert.equal(op.incotermVersion, '2020');

    const noRate = await call('POST', `/operations/${op.id}/couts`, { kind: 'goods', amount: C(8000), currency: 'EUR' });
    assert.equal(noRate.status, 422);
    assert.equal(noRate.body.error.details.reason, 'rateRequired');
    assert.equal((await call('POST', `/operations/${op.id}/couts`, { kind: 'goods', amount: C(8000), currency: 'EUR', ...rated })).status, 201);
    await call('POST', `/operations/${op.id}/couts`, { kind: 'transport', amount: C(120_000), currency: 'DZD' });
    await call('POST', `/operations/${op.id}/couts`, { kind: 'customs_fees', amount: C(80_000), currency: 'DZD', paidAt: day('2026-11-10') });

    let view = (await findOp(call, op.id)).calcul;
    assert.equal(view.coutRendu.resultat, C(1_280_000));
    assert.equal(view.droitsDeclares, false, 'no duties declared: the cost is said to exclude them');
    assert.equal(view.paye, C(80_000), 'engaged is not paid (CNV-09)');

    const received = await call('POST', `/operations/${op.id}/reception`, { receivedAt: day('2026-11-20'), quantityReceived: 410, quantityDamaged: 10 });
    assert.equal(received.status, 201, JSON.stringify(received.body));
    assert.equal(received.body.reception.unitCost, C(3200));

    view = (await findOp(call, op.id)).calcul;
    assert.equal(view.coutUnitaire.resultat, C(3200));
    const stock = (await call('GET', '/stock')).body.articles[0];
    assert.equal(stock.quantite, 400);
    assert.equal(stock.valeur, C(1_280_000));

    const again = await call('POST', `/operations/${op.id}/reception`, { receivedAt: day('2026-11-21'), quantityReceived: 1 });
    assert.equal(again.status, 409);
    const late = await call('POST', `/operations/${op.id}/couts`, { kind: 'duties', amount: C(1000), currency: 'DZD' });
    assert.equal(late.status, 409, 'no cost once the goods are in stock at their landed cost');

    // Sold 100 units: the margin counts the landed cost of those 100 only.
    const lotId = stock.lots[0].id;
    await call('POST', '/stock/mouvements', { itemId: item.id, kind: 'out', lotId, quantity: 100, movedAt: day('2026-11-22') });
    await call('POST', '/documents', { kind: 'sale', label: 'Vente pièces', issuedAt: day('2026-11-22'), amountExcl: C(520_000), currency: 'DZD', operationId: op.id });
    view = (await findOp(call, op.id)).calcul;
    assert.equal(view.marge.resultat, C(520_000 - 100 * 3200));
  });

  test('the reception needs every rate, an item and a net quantity', async () => {
    const { call } = await setUp();
    const item = (await call('POST', '/stock/articles', { name: 'Tissu', unit: 'm' })).body.article;
    const op = (await call('POST', '/operations', { kind: 'micro_import', label: 'Tissu Istanbul', country: 'TR', currency: 'TRY' })).body.operation;
    assert.equal((await call('POST', `/operations/${op.id}/reception`, { receivedAt: day('2026-11-20'), quantityReceived: 10, itemId: item.id })).body.error.details.reason, 'noCost');
    await call('POST', `/operations/${op.id}/couts`, { kind: 'goods', amount: C(1000), currency: 'TRY', rate: 3.9, rateDate: day('2026-11-01'), rateSource: 'Bureau de change' });
    assert.equal((await call('POST', `/operations/${op.id}/reception`, { receivedAt: day('2026-11-20'), quantityReceived: 10 })).body.error.details.reason, 'itemRequired');
    assert.equal((await call('POST', `/operations/${op.id}/reception`, { receivedAt: day('2026-11-20'), quantityReceived: 5, quantityDamaged: 5, itemId: item.id })).body.error.details.reason, 'netQuantityZero');
  });
});

describe('rules of the file', () => {
  test('an Incoterm without its named place is refused (DEC-017)', async () => {
    const { call } = await setUp();
    const res = await call('POST', '/operations', { kind: 'export', label: 'Dattes', country: 'FR', currency: 'EUR', incoterm: 'CIF' });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'namedPlaceRequired');
  });

  test('the file opens with the expected documents; ready only when all are accepted', async () => {
    const { call } = await setUp();
    const op = (await call('POST', '/operations', { kind: 'micro_import', label: 'Vêtements', country: 'TR', currency: 'TRY' })).body.operation;
    let view = (await findOp(call, op.id)).calcul;
    assert.equal(view.dossier.required, 4);
    assert.equal(view.dossier.ready, false);
    for (const kind of ['commercial_invoice', 'payment_proof', 'customs_declaration', 'authorization']) {
      assert.equal((await call('PUT', `/operations/${op.id}/pieces`, { kind, status: 'accepted', reference: `R-${kind}` })).status, 200);
    }
    view = (await findOp(call, op.id)).calcul;
    assert.equal(view.dossier.ready, true);
    assert.equal(view.dossier.completude.resultat, 1);
  });

  test('a status « received » comes from the reception, and a closed operation is not changed', async () => {
    const { call } = await setUp();
    const op = (await call('POST', '/operations', { kind: 'export', label: 'Huile d’olive', country: 'FR', currency: 'EUR' })).body.operation;
    assert.equal((await call('PUT', `/operations/${op.id}`, { status: 'received' })).body.error.details.reason, 'receiveByReception');
    assert.equal((await call('POST', `/operations/${op.id}/reception`, { receivedAt: day('2026-11-20'), quantityReceived: 1 })).body.error.details.reason, 'exportNotReceived');
    assert.equal((await call('PUT', `/operations/${op.id}`, { status: 'closed' })).status, 200);
    assert.equal((await call('POST', `/operations/${op.id}/couts`, { kind: 'bank', amount: 100, currency: 'DZD' })).body.error.details.reason, 'operationClosed');
  });

  test('an exchange scenario computes, and creates nothing (CNV-12)', async () => {
    const { call } = await setUp();
    const op = (await call('POST', '/operations', { kind: 'import', label: 'Machine', country: 'DE', currency: 'EUR', quantityOrdered: 1 })).body.operation;
    await call('POST', `/operations/${op.id}/couts`, { kind: 'goods', amount: C(50_000), currency: 'EUR', rate: 140, rateDate: day('2026-11-01'), rateSource: 'Banque' });
    const res = await call('GET', `/operations/${op.id}/scenario?variation=0.08`);
    assert.equal(res.status, 200);
    assert.equal(res.body.effet.resultat, C(560_000));
    const view = (await findOp(call, op.id)).calcul;
    assert.equal(view.coutRendu.resultat, C(7_000_000), 'the operation itself is unchanged');
  });
});

describe('rights and references', () => {
  test('the references list the Incoterms and say which micro-import rules are not published', async () => {
    const { call } = await setUp();
    const refs = (await call('GET', '/commerce/references')).body;
    assert.equal(refs.incoterms.length, 11);
    assert.equal(refs.reglesMicroImport.length, 6);
    assert.ok(refs.reglesMicroImport.every((r) => typeof r.confirmed === 'boolean'));
  });

  test('a reader sees operations but changes nothing; another organisation sees nothing', async () => {
    const ctx = await setUp();
    const op = (await ctx.call('POST', '/operations', { kind: 'import', label: 'X', country: 'CN', currency: 'USD' })).body.operation;
    const reader = await t.adult();
    const invited = await ctx.call('POST', '/membres', { email: reader.email, role: 'reader' });
    await t.request('POST', `/fin/entreprise/invitations/${invited.body.membre.id}/accepter`, { user: reader });
    assert.equal((await ctx.call('GET', '/operations', undefined, reader)).status, 200);
    assert.equal((await ctx.call('POST', `/operations/${op.id}/couts`, { kind: 'bank', amount: 1, currency: 'DZD' }, reader)).status, 403);

    const other = await setUp();
    assert.equal((await other.call('POST', `/operations/${op.id}/couts`, { kind: 'bank', amount: 1, currency: 'DZD' })).status, 404);
    assert.equal((await other.call('GET', `/operations/${op.id}/scenario?variation=0.1`)).status, 404);
    assert.equal((await other.call('POST', '/documents', { kind: 'sale', label: 'X', issuedAt: day('2026-11-01'), amountExcl: 1, currency: 'DZD', operationId: op.id })).status, 404);
  });
});

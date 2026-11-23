import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P13-05, lot B (2026-11-23): selling and collecting, as the client's tab
// 19_CYCLE_FACTURE describes it — quote (FAC-001/002), invoice drafted then
// issued with its number (FAC-003), partial payment (FAC-004/005), overdue and
// aged receivables (FAC-006), credit note (FAC-007), reminder (FAC-008),
// export (FAC-009), correction without erasing (FAC-012). The amounts are the
// client's own cases (30_TESTS_CALCUL, 27_RECETTES TST-00001/00003/00025/
// 00028/00035), in centimes.

let t;
before(async () => {
  t = await boot();
});
beforeEach(() => t.reset());
after(() => t.close());

const DA = (n) => n * 100;
const day = (iso) => `${iso}T00:00:00.000Z`;

async function setUp() {
  const owner = await t.adult();
  const created = await t.request('POST', '/fin/entreprise', { user: owner, json: { name: 'Cabinet Ait', currency: 'DZD', publicKey: 'PUB-01' } });
  assert.equal(created.status, 201);
  const as = { 'X-Organisation': created.body.entreprise.id };
  const call = (method, path, json, headers = {}) => t.request(method, `/fin/entreprise${path}`, { user: owner, headers: { ...as, ...headers }, json });
  const client = await call('POST', '/tiers', { kind: 'client', name: 'Société Atlas', email: 'compta@atlas.example' });
  assert.equal(client.status, 201);
  return { owner, as, call, clientId: client.body.tiers.id };
}

const findDoc = async (call, id) => (await call('GET', '/documents')).body.documents.find((d) => d.id === id);

describe('quote → invoice → payment (TST-00028)', () => {
  test('a quote creates no receivable; accepted, it becomes a draft invoice; issued, it is numbered and owed', async () => {
    const { call, clientId } = await setUp();
    const quote = await call('POST', '/documents', {
      docType: 'quote',
      kind: 'sale',
      contactId: clientId,
      label: 'Mission de conseil',
      issuedAt: day('2026-03-01'),
      validUntil: day('2099-12-31'),
      lines: [
        { label: 'Diagnostic', quantity: 2, unitPrice: DA(30000) },
        { label: 'Restitution', quantity: 1, unitPrice: DA(25000) },
      ],
      costExcl: DA(32000),
      currency: 'DZD',
    });
    assert.equal(quote.status, 201, JSON.stringify(quote.body));
    assert.equal(quote.body.document.number, 'DEV-2026-0001');
    assert.equal(quote.body.document.amountExcl, DA(85000), 'the lines make the amount');
    assert.equal(quote.body.document.state, 'draft');

    let board = (await call('GET', '/tableau-de-bord')).body;
    assert.equal(board.creances.resultat, null, 'FAC-001: no receivable for a quote');

    assert.equal((await call('POST', `/documents/${quote.body.document.id}/envoyer`, {})).status, 200);
    board = (await call('GET', '/tableau-de-bord')).body;
    assert.equal(board.devisEnCours.resultat, DA(85000), 'a sent quote is a commercial commitment');

    // A quote is not paid.
    const early = await call('POST', `/documents/${quote.body.document.id}/reglements`, { value: DA(1000), currency: 'DZD', receivedAt: day('2026-03-02') });
    assert.equal(early.status, 409);
    assert.equal(early.body.error.details.reason, 'notIssued');

    assert.equal((await call('POST', `/documents/${quote.body.document.id}/accepter`, {})).status, 200);
    const invoiced = await call('POST', `/documents/${quote.body.document.id}/facturer`, { issuedAt: day('2026-03-05'), dueAt: day('2026-04-19') });
    assert.equal(invoiced.status, 201, JSON.stringify(invoiced.body));
    const draft = invoiced.body.document;
    assert.equal(draft.state, 'draft');
    assert.equal(draft.number, null, 'a draft waits for its number');
    assert.equal(draft.relatedId, quote.body.document.id);

    // Invoicing the same quote twice is refused (« jamais d'impact à double »).
    const again = await call('POST', `/documents/${quote.body.document.id}/facturer`, {});
    assert.equal(again.status, 409);

    board = (await call('GET', '/tableau-de-bord')).body;
    assert.equal(board.devisEnCours.resultat, null, 'an invoiced quote is no longer open');

    const issued = await call('POST', `/documents/${draft.id}/emettre`, {});
    assert.equal(issued.status, 200, JSON.stringify(issued.body));
    assert.equal(issued.body.document.number, 'FAC-2026-0001');

    const paid = await call('POST', `/documents/${draft.id}/reglements`, { value: DA(20000), currency: 'DZD', receivedAt: day('2026-03-20') });
    assert.equal(paid.status, 201);

    board = (await call('GET', '/tableau-de-bord')).body;
    assert.equal(board.creances.resultat, DA(65000), 'receivable 65 000 DA');
    assert.equal(board.encaissements.resultat, DA(20000), 'cash 20 000 DA, never 85 000 at issue');
    assert.equal(board.marge.resultat, DA(53000), 'indicative margin 53 000 DA');
    assert.equal(board.caFacture.resultat, DA(85000));
  });

  test('a second issued invoice takes the next number', async () => {
    const { call } = await setUp();
    const one = await call('POST', '/documents', { kind: 'sale', label: 'A', issuedAt: day('2026-01-10'), amountExcl: DA(100), currency: 'DZD' });
    const two = await call('POST', '/documents', { kind: 'sale', label: 'B', issuedAt: day('2026-02-10'), amountExcl: DA(100), currency: 'DZD' });
    assert.equal(one.body.document.number, 'FAC-2026-0001');
    assert.equal(two.body.document.number, 'FAC-2026-0002');
  });

  test('an expired quote cannot be accepted', async () => {
    const { call, clientId } = await setUp();
    const quote = await call('POST', '/documents', { docType: 'quote', kind: 'sale', contactId: clientId, label: 'Vieux devis', issuedAt: day('2025-01-01'), validUntil: day('2025-02-01'), lines: [{ label: 'X', quantity: 1, unitPrice: DA(100) }], currency: 'DZD' });
    const accepted = await call('POST', `/documents/${quote.body.document.id}/accepter`, {});
    assert.equal(accepted.status, 409);
    assert.equal(accepted.body.error.details.reason, 'quoteExpired');
  });

  test('a quote needs its client and its lines', async () => {
    const { call, clientId } = await setUp();
    const noClient = await call('POST', '/documents', { docType: 'quote', kind: 'sale', label: 'X', issuedAt: day('2026-01-01'), lines: [{ label: 'X', quantity: 1, unitPrice: 1 }], currency: 'DZD' });
    assert.equal(noClient.body.error.details.reason, 'clientRequired');
    const noLines = await call('POST', '/documents', { docType: 'quote', kind: 'sale', contactId: clientId, label: 'X', issuedAt: day('2026-01-01'), amountExcl: 100, currency: 'DZD' });
    assert.equal(noLines.body.error.details.reason, 'linesRequired');
  });
});

describe('credit notes (TST-00003, FAC-007, CNV-02)', () => {
  test('invoice − payment − credit note: 85 000 − 30 000 − 5 000 = 50 000', async () => {
    const { call } = await setUp();
    const invoice = (await call('POST', '/documents', { kind: 'sale', label: 'Prestation', issuedAt: day('2026-01-10'), amountExcl: DA(85000), currency: 'DZD' })).body.document;
    await call('POST', `/documents/${invoice.id}/reglements`, { value: DA(30000), currency: 'DZD', receivedAt: day('2026-01-20') });
    const credit = await call('POST', `/documents/${invoice.id}/avoirs`, { issuedAt: day('2026-01-25'), amountExcl: DA(5000) });
    assert.equal(credit.status, 201, JSON.stringify(credit.body));
    assert.equal(credit.body.avoir.number, 'AV-2026-0001');

    const doc = await findDoc(call, invoice.id);
    assert.equal(doc.reglement.outstanding, DA(50000));
    assert.equal(doc.reglement.credited, DA(5000));
    assert.equal(doc.total, DA(85000), 'the invoice itself is never rewritten');
    assert.equal(doc.avoirs.length, 1);

    const board = (await call('GET', '/tableau-de-bord')).body;
    assert.equal(board.caFacture.resultat, DA(80000), 'CA facturé net d’avoir 80 000');
    assert.equal(board.creances.resultat, DA(50000));
  });

  test('a credit note never exceeds what the invoice is still worth', async () => {
    const { call } = await setUp();
    const invoice = (await call('POST', '/documents', { kind: 'sale', label: 'P', issuedAt: day('2026-01-10'), amountExcl: DA(1000), currency: 'DZD' })).body.document;
    await call('POST', `/documents/${invoice.id}/avoirs`, { issuedAt: day('2026-01-11'), amountExcl: DA(600) });
    const over = await call('POST', `/documents/${invoice.id}/avoirs`, { issuedAt: day('2026-01-12'), amountExcl: DA(500) });
    assert.equal(over.status, 422);
    assert.equal(over.body.error.details.reason, 'creditExceedsInvoice');
    assert.equal(over.body.error.details.max, DA(400));
  });

  test('a full credit note cancels an unpaid invoice; on a paid one, the excess is to refund', async () => {
    const { call } = await setUp();
    const a = (await call('POST', '/documents', { kind: 'sale', label: 'A', issuedAt: day('2026-01-10'), amountExcl: DA(1000), currency: 'DZD' })).body.document;
    await call('POST', `/documents/${a.id}/avoirs`, { issuedAt: day('2026-01-11'), amountExcl: DA(1000) });
    assert.equal((await findDoc(call, a.id)).reglement.state, 'cancelled');

    const b = (await call('POST', '/documents', { kind: 'sale', label: 'B', issuedAt: day('2026-01-10'), amountExcl: DA(1000), currency: 'DZD' })).body.document;
    await call('POST', `/documents/${b.id}/reglements`, { value: DA(1000), currency: 'DZD', receivedAt: day('2026-01-12') });
    await call('POST', `/documents/${b.id}/avoirs`, { issuedAt: day('2026-01-13'), amountExcl: DA(300) });
    const board = (await call('GET', '/tableau-de-bord')).body;
    assert.equal(board.aRembourser.resultat, DA(300));
  });

  test('an issued invoice is not rewritten and not deleted; a draft is', async () => {
    const { call } = await setUp();
    const issued = (await call('POST', '/documents', { kind: 'sale', label: 'A', issuedAt: day('2026-01-10'), amountExcl: DA(1000), currency: 'DZD' })).body.document;
    const rewrite = await call('PUT', `/documents/${issued.id}`, { amountExcl: DA(10) });
    assert.equal(rewrite.status, 409);
    assert.equal(rewrite.body.error.details.reason, 'documentIsFinal');
    assert.equal((await call('DELETE', `/documents/${issued.id}`)).status, 409);
    // Its direct cost is not on the invoice: it may be completed.
    assert.equal((await call('PUT', `/documents/${issued.id}`, { costExcl: DA(400) })).status, 200);

    const draft = (await call('POST', '/documents', { kind: 'sale', draft: true, label: 'B', issuedAt: day('2026-01-10'), amountExcl: DA(1000), currency: 'DZD' })).body.document;
    const edited = await call('PUT', `/documents/${draft.id}`, { lines: [{ label: 'Heure', quantity: 1.5, unitPrice: DA(2000) }] }, { 'If-Match': String(draft.version) });
    assert.equal(edited.status, 200);
    assert.equal(edited.body.document.amountExcl, DA(3000));
    const stale = await call('PUT', `/documents/${draft.id}`, { label: 'C' }, { 'If-Match': String(draft.version) });
    assert.equal(stale.status, 412, 'a stale version is refused');
    assert.equal((await call('DELETE', `/documents/${draft.id}`)).status, 204);
    assert.equal(await findDoc(call, draft.id), undefined);
  });
});

describe('receivables, reminders, export', () => {
  test('aged balance and reminder (TST-00035: 110 000, paid 40 000, 70 000 left)', async () => {
    const { call, clientId } = await setUp();
    const invoice = (await call('POST', '/documents', { kind: 'sale', contactId: clientId, label: 'Livraison', issuedAt: day('2026-01-10'), dueAt: day('2026-02-09'), amountExcl: DA(110000), currency: 'DZD' })).body.document;
    await call('POST', `/documents/${invoice.id}/reglements`, { value: DA(40000), currency: 'DZD', receivedAt: day('2026-02-20') });

    const board = (await call('GET', '/tableau-de-bord')).body;
    assert.equal(board.creances.resultat, DA(70000));
    assert.equal(board.encaissements.resultat, DA(40000));
    assert.equal(board.balanceAgee.over90, DA(70000), 'due since February 2026: more than 90 days late');

    const reminder = await call('POST', `/documents/${invoice.id}/relances`, { channel: 'email', note: 'Relance amiable', nextActionAt: day('2099-01-01') });
    assert.equal(reminder.status, 201, JSON.stringify(reminder.body));
    const doc = await findDoc(call, invoice.id);
    assert.equal(doc.relances.length, 1);
    assert.equal(doc.reglement.outstanding, DA(70000), 'a reminder changes no balance');
  });

  test('no reminder for a settled invoice', async () => {
    const { call } = await setUp();
    const invoice = (await call('POST', '/documents', { kind: 'sale', label: 'A', issuedAt: day('2026-01-10'), amountExcl: DA(1000), currency: 'DZD' })).body.document;
    await call('POST', `/documents/${invoice.id}/reglements`, { value: DA(1000), currency: 'DZD', receivedAt: day('2026-01-12') });
    const reminder = await call('POST', `/documents/${invoice.id}/relances`, { channel: 'telephone' });
    assert.equal(reminder.status, 409);
    assert.equal(reminder.body.error.details.reason, 'nothingDue');
  });

  test('the export lists issued invoices and credit notes with their ids, never quotes or drafts', async () => {
    const { owner, as, call, clientId } = await setUp();
    const invoice = (await call('POST', '/documents', { kind: 'sale', contactId: clientId, label: 'A; "spéciale"', issuedAt: day('2026-01-10'), amountExcl: DA(1000), currency: 'DZD' })).body.document;
    await call('POST', `/documents/${invoice.id}/avoirs`, { issuedAt: day('2026-01-11'), amountExcl: DA(100) });
    await call('POST', '/documents', { kind: 'sale', draft: true, label: 'Brouillon', issuedAt: day('2026-01-10'), amountExcl: DA(1), currency: 'DZD' });
    await call('POST', '/documents', { docType: 'quote', kind: 'sale', contactId: clientId, label: 'Devis', issuedAt: day('2026-01-10'), lines: [{ label: 'X', quantity: 1, unitPrice: 1 }], currency: 'DZD' });

    const res = await t.request('GET', '/fin/entreprise/documents/export', { user: owner, headers: as });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/csv/);
    const rows = res.text.replace(/^﻿/, '').trim().split('\r\n');
    assert.equal(rows.length, 3, 'header + invoice + credit note');
    assert.ok(rows[1].startsWith(invoice.id));
    assert.ok(rows[1].includes('Société Atlas'));
    assert.ok(rows[2].includes('AV-2026-0001') && rows[2].includes('FAC-2026-0001'), 'the credit note names its invoice');
    assert.ok(rows[1].includes(';900.00;'), 'what is left due, net of the credit note');
  });

  test('a purchase keeps its supplier number and has no draft', async () => {
    const { call } = await setUp();
    const noNumber = await call('POST', '/documents', { kind: 'purchase', label: 'Fournitures', issuedAt: day('2026-01-10'), amountExcl: DA(100), currency: 'DZD' });
    assert.equal(noNumber.body.error.details.reason, 'supplierNumberRequired');
    const draft = await call('POST', '/documents', { kind: 'purchase', number: 'FRN-9', draft: true, label: 'Fournitures', issuedAt: day('2026-01-10'), amountExcl: DA(100), currency: 'DZD' });
    assert.equal(draft.body.error.details.reason, 'purchaseIsReceived');
  });

  test('every step is in the journal', async () => {
    const { call, clientId } = await setUp();
    const quote = (await call('POST', '/documents', { docType: 'quote', kind: 'sale', contactId: clientId, label: 'D', issuedAt: day('2026-01-10'), lines: [{ label: 'X', quantity: 1, unitPrice: DA(10) }], currency: 'DZD' })).body.document;
    await call('POST', `/documents/${quote.id}/accepter`, {});
    const draft = (await call('POST', `/documents/${quote.id}/facturer`, {})).body.document;
    await call('POST', `/documents/${draft.id}/emettre`, {});
    await call('POST', `/documents/${draft.id}/avoirs`, { issuedAt: new Date().toISOString(), amountExcl: DA(1) });
    const actions = (await call('GET', '/journal')).body.journal.map((line) => line.action);
    for (const action of ['quote.created', 'quote.accepted', 'quote.invoiced', 'invoice.issued', 'creditNote.issued']) assert.ok(actions.includes(action), action);
  });
});

describe('rights on the cycle', () => {
  test('a reader sees the documents but moves nothing', async () => {
    const ctx = await setUp();
    const { call, clientId } = ctx;
    const quote = (await call('POST', '/documents', { docType: 'quote', kind: 'sale', contactId: clientId, label: 'D', issuedAt: day('2026-01-10'), lines: [{ label: 'X', quantity: 1, unitPrice: 1 }], currency: 'DZD' })).body.document;
    const reader = await t.adult();
    const invited = await call('POST', '/membres', { email: reader.email, role: 'reader' });
    await t.request('POST', `/fin/entreprise/invitations/${invited.body.membre.id}/accepter`, { user: reader });
    const as = { user: reader, headers: ctx.as };
    assert.equal((await t.request('GET', '/fin/entreprise/documents', as)).status, 200);
    assert.equal((await t.request('POST', `/fin/entreprise/documents/${quote.id}/accepter`, { ...as, json: {} })).status, 403);
    assert.equal((await t.request('DELETE', `/fin/entreprise/documents/${quote.id}`, as)).status, 403);
  });

  test('another organisation’s document is not found', async () => {
    const one = await setUp();
    const two = await setUp();
    const doc = (await one.call('POST', '/documents', { kind: 'sale', label: 'A', issuedAt: day('2026-01-10'), amountExcl: DA(1000), currency: 'DZD' })).body.document;
    for (const [method, path, json] of [
      ['POST', `/documents/${doc.id}/avoirs`, { issuedAt: day('2026-01-11'), amountExcl: 1 }],
      ['POST', `/documents/${doc.id}/relances`, { channel: 'email' }],
      ['PUT', `/documents/${doc.id}`, { costExcl: 1 }],
      ['GET', `/documents/${doc.id}/relances`, undefined],
    ]) {
      const res = await two.call(method, path, json);
      assert.equal(res.status, 404, `${method} ${path}`);
    }
  });
});

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { cashAvailable, cashPlan, pilotFigures, stockLots, stockValue } from '../../src/services/finBusinessPilot.service.js';

// P13-05, lot C (2026-11-23): the steering figures, on the client's own cases
// of tab 30_TESTS_CALCUL (amounts in centimes where they are money).

const business = { id: 'b', currency: 'DZD' };
const now = new Date('2026-06-30T12:00:00.000Z');
let n = 0;
const id = () => `id-${(n += 1)}`;
const sale = (over = {}) => ({ id: id(), kind: 'sale', docType: 'invoice', state: 'issued', currency: 'DZD', amountExcl: 0, taxAmount: 0, issuedAt: new Date('2026-06-10'), dueAt: null, ...over });
const purchase = (over = {}) => sale({ kind: 'purchase', ...over });
const pay = (document, value, at = '2026-06-15') => ({ id: id(), documentId: document.id, value, currency: 'DZD', receivedAt: new Date(at) });

describe('stock by lot (CNV-16)', () => {
  test('coût rendu unitaire 1 280 000 / 400 = 3 200 ; 120 restant = 384 000', () => {
    const lot = { id: 'L1', itemId: 'I', kind: 'in', quantity: 400, totalCost: 1_280_000, movedAt: new Date('2026-01-01') };
    const out = { id: 'O1', itemId: 'I', kind: 'out', lotId: 'L1', quantity: 280 };
    const [state] = stockLots([lot, out]);
    assert.equal(state.unitCost, 3200);
    assert.equal(state.remaining, 120);
    assert.equal(state.value, 384_000);
    assert.equal(stockValue([state]), 384_000);
  });

  test('taux d’avaries 10 / 500 = 2 %, and a loss raises the cost of the units left', () => {
    const [state] = stockLots([
      { id: 'L', itemId: 'I', kind: 'in', quantity: 500, totalCost: 1_000_000 },
      { id: 'X', itemId: 'I', kind: 'loss', lotId: 'L', quantity: 10 },
    ]);
    assert.equal(state.lossRate, 0.02);
    assert.equal(state.net, 490);
    assert.equal(state.unitCost, Math.round(1_000_000 / 490));
  });

  test('garde-fou : quantité nette nulle → non calculable, never a division by zero', () => {
    const [state] = stockLots([
      { id: 'L', itemId: 'I', kind: 'in', quantity: 10, totalCost: 5000 },
      { id: 'X', itemId: 'I', kind: 'loss', lotId: 'L', quantity: 10 },
    ]);
    assert.equal(state.unitCost, null);
    assert.equal(state.value, null);
  });

  test('no lot: the stock value is not computed, not zero', () => {
    assert.equal(stockValue([]), null);
  });
});

describe('steering figures', () => {
  test('BFR simplifié 700 000 + 900 000 − 600 000 = 1 000 000', () => {
    const s = sale({ amountExcl: 900_000 });
    const p = purchase({ amountExcl: 600_000 });
    const moves = [{ id: 'L', itemId: 'I', kind: 'in', quantity: 1, totalCost: 700_000 }];
    const board = pilotFigures({ business, documents: [s, p], moves, now });
    assert.equal(board.bfr.resultat, 1_000_000);
  });

  test('délai clients 600 000 / 3 000 000 × 30 = 6 jours ; fournisseurs 400 000 / 1 200 000 × 30 = 10', () => {
    const s = sale({ amountExcl: 3_000_000, issuedAt: new Date('2026-06-10') });
    const p = purchase({ amountExcl: 1_200_000, issuedAt: new Date('2026-06-10') });
    const board = pilotFigures({
      business,
      documents: [s, p],
      payments: [pay(s, 2_400_000), pay(p, 800_000)],
      now,
      from: new Date('2026-05-31T12:00:00.000Z'),
      to: now,
    });
    assert.equal(board.delaiClients.resultat, 6);
    assert.equal(board.delaiFournisseurs.resultat, 10);
  });

  test('seuil de rentabilité 1 200 000 / 0,4 = 3 000 000', () => {
    const documents = [
      sale({ amountExcl: 5_000_000 }),
      purchase({ amountExcl: 3_000_000, category: 'marchandises' }),
      purchase({ amountExcl: 1_200_000, category: 'loyer' }),
    ];
    const board = pilotFigures({ business, documents, now });
    assert.equal(board.seuil.resultat, 3_000_000);
  });

  test('without fixed or variable charges, the break-even point is not computed', () => {
    const board = pilotFigures({ business, documents: [sale({ amountExcl: 1000 })], now });
    assert.equal(board.seuil.resultat, null);
  });

  test('concentration client 1 800 000 / 10 000 000 = 0,18', () => {
    const documents = [sale({ amountExcl: 1_800_000, contactId: 'A' }), sale({ amountExcl: 1_700_000, contactId: 'B' }), sale({ amountExcl: 6_500_000 })];
    assert.equal(pilotFigures({ business, documents, now }).concentration.resultat, 0.18);
  });

  test('écart budgétaire 120 000 − 100 000 = 20 000, per family', () => {
    const documents = [purchase({ amountExcl: 120_000, category: 'loyer', issuedAt: new Date('2026-06-05') })];
    const budgets = [{ category: 'loyer', month: '2026-06', amount: 100_000 }];
    const board = pilotFigures({ business, documents, budgets, now });
    assert.equal(board.budget.resultat, 20_000);
    assert.deepEqual(board.budgetMois.lignes, [{ category: 'loyer', budget: 100_000, real: 120_000, gap: 20_000 }]);
  });

  test('charges par famille, net of credit notes', () => {
    const rent = purchase({ amountExcl: 100_000, category: 'loyer' });
    const credit = { id: id(), kind: 'purchase', docType: 'credit_note', state: 'issued', relatedId: rent.id, currency: 'DZD', amountExcl: 10_000, taxAmount: 0, issuedAt: new Date('2026-06-11') };
    const board = pilotFigures({ business, documents: [rent, credit, purchase({ amountExcl: 5000 })], now });
    assert.deepEqual(board.chargesParFamille, [
      { category: 'loyer', amount: 90_000 },
      { category: 'unclassified', amount: 5000 },
    ]);
  });
});

describe('cash available, runway, 13 weeks', () => {
  test('trésorerie disponible = solde constaté + encaissements − décaissements depuis', () => {
    const s = sale({ amountExcl: 500_000 });
    const p = purchase({ amountExcl: 800_000 });
    const cash = cashAvailable({
      cashPositions: [{ observedAt: new Date('2026-06-01'), amount: 1_200_000 }],
      payments: [pay(s, 500_000, '2026-06-20'), pay(p, 800_000, '2026-06-21')],
      invoices: [s, p],
      now,
    });
    assert.equal(cash.amount, 900_000);
  });

  test('autonomie 15 000 000 / 2 000 000 = 7,5 mois', () => {
    const p = purchase({ amountExcl: 6_000_000, issuedAt: new Date('2026-04-15') });
    const board = pilotFigures({
      business,
      documents: [p],
      payments: [pay(p, 6_000_000, '2026-05-01')],
      cashPositions: [{ observedAt: new Date('2026-06-29'), amount: 15_000_000 }],
      now,
    });
    assert.equal(board.autonomie.resultat, 7.5);
  });

  test('no observed balance: nothing is projected, and the plan says so', () => {
    const plan = cashPlan({ business, documents: [sale({ amountExcl: 1000, dueAt: new Date('2026-07-10') })], now });
    assert.equal(plan.depart, null);
    assert.equal(plan.besoin.resultat, null);
  });

  test('13 weeks: receivables at their due date, overdue in week 1, budgets spread; the first week of tension and the need (TST-00030)', () => {
    const documents = [
      sale({ amountExcl: 120_000, dueAt: new Date('2026-07-08') }),
      sale({ amountExcl: 120_000, dueAt: new Date('2026-06-01') }),
      sale({ amountExcl: 50_000 }),
      purchase({ amountExcl: 400_000, dueAt: new Date('2026-07-02') }),
    ];
    const plan = cashPlan({ business, documents, cashPositions: [{ observedAt: new Date('2026-06-30'), amount: 200_000 }], now });
    assert.equal(plan.semaines.length, 13);
    assert.equal(plan.semaines[0].encaissements, 120_000, 'the overdue one in week 1');
    assert.equal(plan.enRetard.encaissements, 120_000);
    assert.equal(plan.sansEcheance.encaissements, 50_000);
    assert.equal(plan.semaines[0].decaissements, 400_000);
    assert.equal(plan.semaines[0].solde, -80_000);
    assert.equal(plan.premiereTension, 1);
    assert.equal(plan.besoin.resultat, 80_000);
    assert.equal(plan.semaines[1].solde, 40_000);

    // Scenario: clients pay 30 days later — the tension lasts longer; nothing is created.
    const late = cashPlan({ business, documents, cashPositions: [{ observedAt: new Date('2026-06-30'), amount: 200_000 }], now, clientDelayDays: 30 });
    assert.equal(plan.semaines[4].tension, false);
    assert.equal(late.semaines[1].solde, -80_000, 'the 8 July invoice now lands in August');
    assert.equal(late.semaines[4].tension, true);
    assert.equal(late.semaines[5].solde, 40_000);

    // Fixed charges of 150 000 a month, budgeted: spread over the weeks.
    const budgeted = cashPlan({ business, documents: [], budgets: [{ category: 'loyer', month: '2026-07', amount: 150_000 }], cashPositions: [{ observedAt: new Date('2026-06-30'), amount: 0 }], now });
    const july = budgeted.semaines.reduce((sum, w) => sum + w.chargesPrevues, 0);
    assert.ok(Math.abs(july - 150_000) <= 13, `July budget spread: ${july}`);
  });
});

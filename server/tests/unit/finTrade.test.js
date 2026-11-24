import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { convert, fileState, fxScenario, landedCost, operationView } from '../../src/services/finTradeView.service.js';
import { INCOTERMS } from '../../src/constants/finTrade.js';
import { BUSINESS_FORMULAS } from '../../src/constants/finBusiness.js';

// P13-05, lot D (2026-11-24): micro-import and international trade, on the
// client's cases of tab 30_TESTS_CALCUL. Amounts in minor units (centimes).

const DA = (n) => Math.round(n * 100);
const EUR = (n) => Math.round(n * 100);
const goods = { kind: 'goods', amount: EUR(8000), currency: 'EUR', rate: 135, rateDate: new Date('2026-11-01'), rateSource: 'Banque d’Algérie' };

describe('conversion at a dated rate (DEC-015, CNV-10)', () => {
  test('achat import converti : 8 000 × 135 = 1 080 000 DA', () => {
    assert.equal(convert(EUR(8000), 'EUR', 'DZD', 135), DA(1_080_000));
  });

  test('garde-fou cours inconnu : non calculable, never a rate of 1', () => {
    assert.equal(convert(EUR(1000), 'EUR', 'DZD', null), null);
    const cost = landedCost({ costs: [{ ...goods, rate: null }], base: 'DZD' });
    assert.equal(cost.total, null);
    assert.equal(cost.missingRates, 1);
  });

  test('currencies with other minor units convert through their units', () => {
    assert.equal(convert(1000, 'JPY', 'DZD', 0.9), DA(900));
  });
});

describe('landed cost (CAL-0053, CAL-0054)', () => {
  const costs = [goods, { kind: 'transport', amount: DA(120_000), currency: 'DZD' }, { kind: 'customs_fees', amount: DA(80_000), currency: 'DZD' }];

  test('coût rendu total 1 080 000 + 120 000 + 80 000 = 1 280 000 ; unitaire / 400 = 3 200', () => {
    const cost = landedCost({ costs, base: 'DZD', netUnits: 400 });
    assert.equal(cost.total, DA(1_280_000));
    assert.equal(cost.unit, DA(3200));
  });

  test('duties are declared, never assumed: their absence is said (DEC-014)', () => {
    assert.equal(landedCost({ costs, base: 'DZD' }).dutiesDeclared, false);
    assert.equal(landedCost({ costs: [...costs, { kind: 'duties', amount: DA(10), currency: 'DZD' }], base: 'DZD' }).dutiesDeclared, true);
  });

  test('garde-fou quantité nette nulle : no unit cost', () => {
    assert.equal(landedCost({ costs, base: 'DZD', netUnits: 0 }).unit, null);
  });

  test('marge unitaire du lot : 5 200 − 3 200 − 400 = 1 600', () => {
    const result = fxScenario({ costs, base: 'DZD', variation: 0, netUnits: 400, unitPrice: DA(5200), unitSellingCost: DA(400) });
    assert.equal(result.reference.margeUnitaire, DA(1600));
  });
});

describe('exchange scenarios (ECR-0365, CNV-12)', () => {
  test('stress de change : 50 000 × 140 × 8 % = 560 000 DA', () => {
    const result = fxScenario({ costs: [{ kind: 'goods', amount: EUR(50_000), currency: 'EUR', rate: 140, rateDate: new Date(), rateSource: 'x' }], base: 'DZD', variation: 0.08 });
    assert.equal(result.effet.resultat, DA(560_000));
  });

  test('écart de change : 50 000 × (144 − 140) = 200 000 DA', () => {
    const result = fxScenario({ costs: [{ kind: 'goods', amount: EUR(50_000), currency: 'EUR', rate: 140, rateDate: new Date(), rateSource: 'x' }], base: 'DZD', variation: 144 / 140 - 1 });
    assert.equal(result.effet.resultat, DA(200_000));
  });
});

describe('file and margin of an operation', () => {
  test('taux de pièces complètes : 3 acceptées sur 4 attendues = 75 %', () => {
    const state = fileState('micro_import', [
      { kind: 'commercial_invoice', status: 'accepted' },
      { kind: 'payment_proof', status: 'accepted' },
      { kind: 'customs_declaration', status: 'accepted' },
      { kind: 'authorization', status: 'submitted' },
    ]);
    assert.equal(state.ratio, 0.75);
    assert.equal(state.ready, false);
    assert.deepEqual(state.missing, ['authorization']);
  });

  test('marge export estimée : 2 000 000 − 1 340 000 − 210 000 = 450 000', () => {
    const operation = { id: 'op', kind: 'export', currency: 'EUR' };
    const view = operationView({
      operation,
      base: 'DZD',
      costs: [
        { kind: 'goods', amount: DA(1_340_000), currency: 'DZD' },
        { kind: 'transport', amount: DA(210_000), currency: 'DZD' },
      ],
      documents: [{ id: 'f', operationId: 'op', kind: 'sale', docType: 'invoice', state: 'issued', currency: 'DZD', amountExcl: DA(2_000_000), taxAmount: 0 }],
    });
    assert.equal(view.marge.resultat, DA(450_000));
  });

  test('an imported lot: the margin counts the landed cost of the units SOLD only', () => {
    const operation = { id: 'op', kind: 'import', currency: 'EUR' };
    const moves = [
      { id: 'L', kind: 'in', operationId: 'op', itemId: 'I', quantity: 400, totalCost: DA(1_280_000) },
      { id: 'O', kind: 'out', lotId: 'L', itemId: 'I', quantity: 100 },
    ];
    const view = operationView({
      operation,
      base: 'DZD',
      costs: [goods, { kind: 'transport', amount: DA(200_000), currency: 'DZD' }],
      moves,
      documents: [{ id: 'f', operationId: 'op', kind: 'sale', docType: 'invoice', state: 'issued', currency: 'DZD', amountExcl: DA(520_000), taxAmount: 0 }],
    });
    assert.equal(view.coutUnitaire.resultat, DA(3200));
    assert.equal(view.marge.resultat, DA(520_000 - 100 * 3200));
  });
});

describe('a reception loss read twice is counted once', () => {
  test('410 received, 10 damaged: 400 net, whatever the way the moves were gathered', () => {
    const operation = { id: 'op', kind: 'import', currency: 'EUR' };
    const loss = { id: 'X', kind: 'loss', lotId: 'L', operationId: 'op', itemId: 'I', quantity: 10 };
    const moves = [{ id: 'L', kind: 'in', operationId: 'op', itemId: 'I', quantity: 410, totalCost: DA(1_280_000) }, loss, loss];
    const view = operationView({ operation, base: 'DZD', costs: [{ kind: 'goods', amount: DA(1_280_000), currency: 'DZD' }], moves });
    assert.equal(view.coutUnitaire.resultat, DA(3200));
  });
});

describe('references', () => {
  test('the 11 Incoterms 2020, each saying who clears, carries, insures and where risk passes', () => {
    assert.equal(INCOTERMS.length, 11);
    for (const row of INCOTERMS) for (const field of ['mode', 'exportClearance', 'mainCarriage', 'insurance', 'importClearance', 'risk']) assert.ok(row[field], `${row.code}.${field}`);
    assert.equal(INCOTERMS.find((r) => r.code === 'DDP').importClearance, 'seller');
    assert.equal(INCOTERMS.find((r) => r.code === 'EXW').exportClearance, 'buyer');
  });

  test('no trade figure computes a tax', () => {
    assert.deepEqual(BUSINESS_FORMULAS.filter((f) => /taux|TVA/i.test(f.rule)).map((f) => f.id), []);
  });
});

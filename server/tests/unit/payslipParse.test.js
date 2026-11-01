import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { findPeriod, parseAmount, parsePayslip } from '../../../client/src/lib/payslipParse.js';

// Reading the text of a payslip (P8-30). The reader only PROPOSES lines: it never
// computes a salary, never fills in what it did not read, and marks what it is
// unsure of. Amounts are exact, in centimes.

describe('amounts as a payslip writes them', () => {
  test('thousands and decimals, in every habit', () => {
    assert.equal(parseAmount('45 000,00'), 4500000);
    assert.equal(parseAmount('45.000,00'), 4500000);
    assert.equal(parseAmount('45000.00'), 4500000);
    assert.equal(parseAmount('45 000'), 4500000);
    assert.equal(parseAmount('45,000'), 4500000, 'three digits after the separator: thousands');
    assert.equal(parseAmount('1 234 567,89'), 123456789);
    assert.equal(parseAmount('0,5'), 50);
  });

  test('what is not an amount is null, never zero', () => {
    assert.equal(parseAmount(''), null);
    assert.equal(parseAmount('abc'), null);
    assert.equal(parseAmount(null), null);
  });
});

const PAYSLIP = `
RÉPUBLIQUE ALGÉRIENNE — BULLETIN DE PAIE
Période : 09/2026
Salaire de base            30 000,00
Indemnité d'ancienneté      1 500,00
Prime de rendement          3 000,00
Heures supplémentaires      2 000,00
Retenue sécurité sociale (9%)   3 465,00
IRG                         4 120,50
Acompte                     5 000,00
Page 1
Net à payer                 23 914,50
`;

describe('the lines of a payslip', () => {
  const parsed = parsePayslip(PAYSLIP);
  const byKind = (kind) => parsed.candidates.filter((row) => row.kind === kind);

  test('each line is proposed with the decoder’s own kind and an exact amount', () => {
    assert.equal(byKind('base_salary')[0].value, 3000000);
    assert.equal(byKind('seniority')[0].value, 150000);
    assert.equal(byKind('bonus')[0].value, 300000);
    assert.equal(byKind('overtime')[0].value, 200000);
    assert.equal(byKind('social_employee')[0].value, 346500);
    assert.equal(byKind('irg')[0].value, 412050);
    assert.equal(byKind('advance')[0].value, 500000);
  });

  test('the net to pay is returned apart — read, never computed — and the period is found', () => {
    assert.equal(parsed.declaredNet, 2391450);
    assert.equal(parsed.period, '2026-09');
    assert.ok(!parsed.candidates.some((row) => /^net/i.test(row.label)));
  });

  test('a page number or a bare figure with no words is not a line', () => {
    assert.ok(!parsed.candidates.some((row) => /page/i.test(row.label)));
    assert.deepEqual(parsePayslip('12 345,00\n2026').candidates, []);
  });

  test('a line it cannot place stays « unknown », and several amounts on one line are marked ambiguous', () => {
    const odd = parsePayslip('Retenue spéciale du service      1 000,00      12,5 %      1 250,00\nLibellé inconnu 2 000,00');
    const unknown = odd.candidates.find((row) => row.label.startsWith('Libellé'));
    assert.equal(unknown.kind, 'unknown');
    const multi = odd.candidates.find((row) => row.label.startsWith('Retenue spéciale'));
    assert.equal(multi.ambiguous, true);
    assert.equal(multi.value, 125000, 'the last amount is proposed, and flagged for the person');
  });

  test('nothing is invented from an empty or unreadable text', () => {
    assert.deepEqual(parsePayslip('').candidates, []);
    assert.deepEqual(parsePayslip('lorem ipsum dolor sit amet').candidates, []);
    assert.equal(parsePayslip('').declaredNet, null);
  });
});

describe('the period', () => {
  test('a month as a number or as a name, next to a period word', () => {
    assert.equal(findPeriod('Période de paie : 03/2026'), '2026-03');
    assert.equal(findPeriod('Bulletin de paie — septembre 2026'), '2026-09');
    assert.equal(findPeriod('Date d’embauche 01/2020'), null, 'a date with no period word beside it is not the period');
  });
});

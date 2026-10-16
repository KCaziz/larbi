import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BUSINESS_BLOCKED_STATEMENTS,
  BUSINESS_FORMULAS,
  BUSINESS_FORMULA_IDS,
  DOCUMENT_DIRECTION,
  businessFormulaById,
} from '../../src/constants/finBusiness.js';
import { FORMULA_IDS } from '../../src/constants/finance.js';
import * as view from '../../src/services/finBusinessView.service.js';
import { computed } from '../../src/services/finance/contract.js';

// Espace entreprise (P7-02) — les calculs, sans base ni HTTP.
//
// Ce qui est gardé ici tient en deux idées :
//   1. ces chiffres sont des faits de TRÉSORERIE, et rien d'autre ne doit
//      prétendre sortir d'ici (surtout pas un résultat comptable) ;
//   2. `null` veut dire « non calculable », jamais zéro.

const business = { id: 'b1', currency: 'DZD', name: 'Atelier' };
const doc = (over = {}) => ({
  id: 'd1',
  businessId: 'b1',
  kind: 'sale',
  number: 'F-001',
  label: 'Prestation',
  issuedAt: new Date('2026-01-10T00:00:00Z'),
  dueAt: null,
  amountExcl: 100000,
  taxAmount: 19000,
  currency: 'DZD',
  archivedAt: null,
  deletedAt: null,
  ...over,
});
const pay = (over = {}) => ({
  id: 'p1',
  businessId: 'b1',
  documentId: 'd1',
  value: 50000,
  currency: 'DZD',
  receivedAt: new Date('2026-01-20T00:00:00Z'),
  archivedAt: null,
  deletedAt: null,
  ...over,
});

describe('P7-02 — le catalogue des chiffres d’entreprise est le nôtre, et le dit', () => {
  test('aucun identifiant ne recouvre une formule du client', () => {
    // Le catalogue F001-F057 est celui du classeur : y glisser des
    // identifiants de notre fait le rendrait impossible à relire face à sa
    // source. D'où le préfixe E, et ce test.
    const collisions = BUSINESS_FORMULA_IDS.filter((id) => FORMULA_IDS.includes(id));
    assert.deepEqual(collisions, []);
  });

  test('chaque chiffre d’entreprise porte sa règle et sa condition', () => {
    const incomplete = BUSINESS_FORMULAS.filter((f) => !f.rule || !f.condition || !f.label);
    assert.deepEqual(incomplete.map((f) => f.id), []);
  });

  test('le contrat du moteur accepte un chiffre d’entreprise comme les autres', () => {
    const answer = computed('E006', 4200, { currency: 'DZD' });
    assert.equal(answer.formule_id, 'E006');
    assert.equal(answer.unite, 'DZD');
    assert.ok(answer.calcule_le);
    assert.equal(businessFormulaById('E006').fn, 'cashBalance');
  });

  test('un identifiant inconnu reste refusé', () => {
    assert.throws(() => computed('E999', 1, { currency: 'DZD' }), /Unknown formula/);
  });
});

describe('P7-02 — le règlement d’un document est déduit, jamais déclaré', () => {
  test('un document sans règlement est impayé', () => {
    const settlement = view.documentSettlement(doc(), []);
    assert.equal(settlement.total, 119000);
    assert.equal(settlement.settled, 0);
    assert.equal(settlement.outstanding, 119000);
    assert.equal(settlement.state, 'unpaid');
  });

  test('un règlement partiel laisse le reste dû', () => {
    const settlement = view.documentSettlement(doc(), [pay()]);
    assert.equal(settlement.settled, 50000);
    assert.equal(settlement.outstanding, 69000);
    assert.equal(settlement.state, 'partial');
  });

  test('un document soldé l’est exactement, au centime', () => {
    const settlement = view.documentSettlement(doc(), [pay({ value: 119000 })]);
    assert.equal(settlement.outstanding, 0);
    assert.equal(settlement.state, 'paid');
  });

  test('un règlement dans une autre devise n’est jamais additionné, et il est signalé', () => {
    // Le moteur ne convertit pas sans taux daté. L'ignorer en silence ferait
    // apparaître une facture comme impayée sans dire pourquoi.
    const settlement = view.documentSettlement(doc(), [pay({ currency: 'EUR', value: 1000 })]);
    assert.equal(settlement.settled, 0);
    assert.equal(settlement.devisesIgnorees.length, 1);
    assert.equal(settlement.devisesIgnorees[0].currency, 'EUR');
  });

  test('un règlement archivé ne compte plus', () => {
    const settlement = view.documentSettlement(doc(), [pay({ archivedAt: new Date() })]);
    assert.equal(settlement.settled, 0);
  });

  test('le total d’un document est hors taxe plus taxe, sans taux supposé', () => {
    // Aucun taux de TVA n'est appliqué nulle part : les deux montants viennent
    // du document réel.
    assert.equal(view.documentTotal(doc({ amountExcl: 7, taxAmount: 0 })), 7);
    assert.equal(view.documentTotal(doc({ amountExcl: 0, taxAmount: 0 })), 0);
  });
});

describe('P7-02 — le retard', () => {
  const now = new Date('2026-03-01T00:00:00Z');

  test('un document échu et non réglé est en retard', () => {
    const d = doc({ dueAt: new Date('2026-02-01T00:00:00Z') });
    assert.equal(view.isOverdue(d, view.documentSettlement(d, []), now), true);
  });

  test('un document sans échéance n’est JAMAIS en retard', () => {
    // Beaucoup de documents n'en portent pas. Les traiter comme échus
    // transformerait une absence d'information en dette exigible.
    const d = doc({ dueAt: null });
    assert.equal(view.isOverdue(d, view.documentSettlement(d, []), now), false);
  });

  test('un document échu mais soldé n’est pas en retard', () => {
    const d = doc({ dueAt: new Date('2026-02-01T00:00:00Z') });
    assert.equal(view.isOverdue(d, view.documentSettlement(d, [pay({ value: 119000 })]), now), false);
  });
});

describe('P7-02 — le tableau de bord de trésorerie', () => {
  test('sans rien, tout est « non calculé » et jamais zéro', () => {
    // La règle du projet. « Rien n'est entré » et « nous ne savons pas ce qui
    // est entré » ne se lisent pas pareil, et l'asymétrie entre deux totaux
    // dont l'un serait gardé est exactement le défaut trouvé en P6-21.
    const board = view.buildBusinessDashboard({ business, documents: [], payments: [] });
    for (const key of ['encaissements', 'decaissements', 'tresorerie', 'creances', 'dettes', 'echu', 'delaiMoyen']) {
      assert.equal(board[key].resultat, null, key);
    }
  });

  test('un encaissement sur une vente entre en trésorerie', () => {
    const board = view.buildBusinessDashboard({ business, documents: [doc()], payments: [pay()] });
    assert.equal(board.encaissements.resultat, 50000);
    assert.equal(board.decaissements.resultat, null);
    assert.equal(board.tresorerie.resultat, 50000);
  });

  test('un règlement sur un achat sort de la trésorerie', () => {
    const purchase = doc({ id: 'd2', kind: 'purchase', number: 'A-001', amountExcl: 30000, taxAmount: 0 });
    const board = view.buildBusinessDashboard({
      business,
      documents: [doc(), purchase],
      payments: [pay(), pay({ id: 'p2', documentId: 'd2', value: 30000 })],
    });
    assert.equal(board.encaissements.resultat, 50000);
    assert.equal(board.decaissements.resultat, 30000);
    assert.equal(board.tresorerie.resultat, 20000);
  });

  test('les créances et les dettes se distinguent par le sens du document', () => {
    const purchase = doc({ id: 'd2', kind: 'purchase', number: 'A-001', amountExcl: 30000, taxAmount: 0 });
    const board = view.buildBusinessDashboard({ business, documents: [doc(), purchase], payments: [] });
    assert.equal(board.creances.resultat, 119000);
    assert.equal(board.dettes.resultat, 30000);
  });

  test('le sens d’un document n’est jamais ambigu', () => {
    assert.equal(DOCUMENT_DIRECTION.sale, 'in');
    assert.equal(DOCUMENT_DIRECTION.purchase, 'out');
  });

  test('le montant échu est accompagné de la liste de ce qui le compose', () => {
    // Un montant échu sans le détail n'est pas actionnable : on ne sait pas
    // qui relancer.
    const late = doc({ dueAt: new Date('2020-01-01T00:00:00Z') });
    const board = view.buildBusinessDashboard({ business, documents: [late], payments: [] });
    assert.equal(board.echu.resultat, 119000);
    assert.equal(board.enRetard.length, 1);
    assert.equal(board.enRetard[0].numero, 'F-001');
  });

  test('un règlement dans une autre devise n’entre pas dans la trésorerie', () => {
    const board = view.buildBusinessDashboard({ business, documents: [doc()], payments: [pay({ currency: 'EUR' })] });
    assert.equal(board.encaissements.resultat, null);
  });

  test('le délai moyen ne compte que les documents soldés', () => {
    // Un document en cours n'a pas encore de délai. L'inclure avec le délai
    // écoulé à ce jour ferait baisser la moyenne à chaque facture émise : un
    // indicateur qui s'améliore quand on facture davantage ne mesure rien.
    const partial = view.buildBusinessDashboard({ business, documents: [doc()], payments: [pay()] });
    assert.equal(partial.delaiMoyen.resultat, null);

    const settled = view.buildBusinessDashboard({
      business,
      documents: [doc()],
      payments: [pay({ value: 119000, receivedAt: new Date('2026-01-20T00:00:00Z') })],
    });
    assert.equal(settled.delaiMoyen.resultat, 10);
  });

  test('chaque chiffre arrive dans le contrat du moteur', () => {
    const board = view.buildBusinessDashboard({ business, documents: [doc()], payments: [pay()] });
    for (const key of ['encaissements', 'decaissements', 'tresorerie', 'creances', 'dettes', 'echu']) {
      assert.match(board[key].formule_id, /^E\d{3}$/, key);
      assert.ok(board[key].calcule_le, key);
      assert.ok(board[key].entrees_snapshot, key);
    }
  });

  test('le tableau de bord dit sur quelle base il est calculé', () => {
    const board = view.buildBusinessDashboard({ business, documents: [], payments: [] });
    assert.match(board.base, /trésorerie/);
    assert.match(board.base, /ne remplacent pas un bilan/);
  });
});

describe('P7-02 — ce que ce module refuse de produire', () => {
  test('les états comptables sont nommés, avec ce qui leur manque', () => {
    // Le point le plus important du module. Un « compte de résultat » inventé
    // serait faux ET présenté comme comptable : c'est la faute la plus
    // coûteuse possible ici, et elle est interdite par construction.
    const keys = BUSINESS_BLOCKED_STATEMENTS.map((s) => s.key).sort();
    assert.deepEqual(keys, ['balance_sheet', 'depreciation', 'income_statement', 'inventory', 'vat_return']);
    for (const statement of BUSINESS_BLOCKED_STATEMENTS) {
      assert.ok(statement.needs.length > 30, `${statement.key} ne dit pas ce qui manque`);
    }
  });

  test('aucun chiffre du module ne prétend être un résultat comptable', () => {
    // Les libellés sont lus par des gens : « résultat » y serait compris comme
    // le résultat de l'exercice.
    const suspicious = BUSINESS_FORMULAS.filter((f) => /résultat|bilan|TVA/i.test(f.label));
    assert.deepEqual(suspicious.map((f) => f.id), []);
  });

  test('et aucun ne calcule une taxe', () => {
    const taxing = BUSINESS_FORMULAS.filter((f) => /taux|TVA/i.test(f.rule));
    assert.deepEqual(taxing.map((f) => f.id), []);
  });
});

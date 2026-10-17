import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ALERT_CONSTANTS,
  ALERT_DIVERGENCES,
  ALERT_LEVELS,
  ALERT_RULES,
  alertConstant,
  alertRule,
  alertsOfFamily,
} from '../../src/constants/finAlerts.js';
import { CONSUMER_DSR_HARD_MAX } from '../../src/constants/finCredit.js';
import { RESERVE_BANDS } from '../../src/constants/finHealth.js';
import { DEFAULT_ALERT_THRESHOLDS } from '../../src/constants/finBudget.js';

// Seuils d'alertes du référentiel maître (P6-22, chantier 4).
//
// Ce que ces tests gardent : les seuils sont CEUX du client, les messages sont
// les SIENS mot pour mot, et les seuils déjà codés ailleurs dans le produit
// n'ont pas divergé de leur source.

describe('P6-22 — les seuils viennent du référentiel, pas d’une habitude', () => {
  test('chaque règle porte un niveau connu, un message et ce dont elle dépend', () => {
    assert.ok(ALERT_RULES.length >= 18);
    for (const rule of ALERT_RULES) {
      assert.ok(ALERT_LEVELS.includes(rule.level), `${rule.key} : niveau « ${rule.level} »`);
      assert.ok(rule.message && rule.message.length > 10, rule.key);
      assert.ok(rule.needs, `${rule.key} ne dit pas de quelle mesure il dépend`);
    }
  });

  test('les messages sont ceux du client, au mot près', () => {
    // Ce sont des phrases adressées à quelqu'un sur sa situation financière.
    // Les reformuler change le ton d'une alerte, et le ton est la moitié du
    // message.
    assert.equal(alertRule('envelope_warning').message, 'Vous avez utilisé 80% de l’enveloppe X.');
    assert.equal(alertRule('reserve_critical').message, 'Votre réserve couvre moins d’un mois de dépenses essentielles.');
    assert.equal(alertRule('dsr_critical').message, 'Plus de la moitié du revenu est engagée dans les mensualités.');
    assert.equal(alertRule('balance_deficit_large').message, 'Le déficit projeté dépasse 10% de vos ressources.');
  });

  test('les trois seuils de dette montent dans le bon ordre', () => {
    const [watch, high, critical] = ['dsr_watch', 'dsr_high', 'dsr_critical'].map(alertRule);
    assert.ok(watch.threshold < high.threshold, 'surveillance avant pression');
    assert.ok(high.threshold < critical.threshold, 'pression avant critique');
    assert.equal(watch.threshold, 0.3);
    assert.equal(critical.threshold, 0.5);
  });

  test('le seuil de vigilance de dette est le plafond légal, et le dit', () => {
    // Coïncidence voulue : 30 % est à la fois le seuil de vigilance du client
    // et l'article 16 du décret 15-114. La note l'explique au lieu de laisser
    // croire à un hasard.
    const watch = alertRule('dsr_watch');
    assert.equal(watch.threshold, CONSUMER_DSR_HARD_MAX);
    assert.match(watch.note, /15-114/);
  });

  test('la cible de réserve n’est pas un nombre figé', () => {
    // Elle dépend du profil (grille A, 12_Reserve). Écrire 3 ici la figerait
    // pour un lycéen dont la cible est 0,5 mois.
    assert.equal(alertRule('reserve_below_target').threshold, 'cible_profil');
    // Et le seuil critique, lui, est bien la borne commune de la grille.
    assert.equal(alertRule('reserve_critical').threshold, 1);
    assert.equal(RESERVE_BANDS.find((band) => band.label === 'critique').max, 1);
  });

  test('la fraîcheur dépend du TYPE de donnée, pas d’un seuil unique', () => {
    // Le point que le produit traitait d'un seul seuil : une valeur de
    // patrimoine vieille de trois mois n'est pas inquiétante, un revenu de
    // trois mois l'est.
    assert.equal(alertRule('stale_income_debt').threshold, 90);
    assert.equal(alertRule('stale_assets').threshold, 180);
    assert.equal(alertRule('stale_monthly').threshold, 31);
    const freshness = alertsOfFamily('fraicheur');
    assert.equal(new Set(freshness.map((row) => row.threshold)).size, freshness.length, 'deux seuils identiques');
  });
});

describe('P6-22 — ce qui était déjà codé n’a pas divergé de sa source', () => {
  test('les seuils d’enveloppe du produit sont ceux du référentiel', () => {
    // Ils coïncidaient déjà. Les rattacher à une source ne les change pas,
    // mais un seuil qui coïncide par hasard et un seuil qui vient du document
    // ne se relisent pas de la même façon le jour où le client en change un.
    assert.deepEqual(DEFAULT_ALERT_THRESHOLDS, [
      alertRule('envelope_warning').threshold,
      alertRule('envelope_exceeded').threshold,
    ]);
  });

  test('les constantes nommées portent leur statut légal ou interne', () => {
    // Une politique interne se change par décision, une règle légale par
    // décret : confondre les deux, c'est traiter un texte officiel comme un
    // réglage.
    const legal = alertConstant('CONSUMER_DSR_HARD_MAX');
    assert.equal(legal.value, 0.3);
    assert.match(legal.status, /15-114/);
    assert.equal(alertConstant('ENVELOPE_WARNING').status, 'FINCLUDIA');
    for (const row of ALERT_CONSTANTS) assert.ok(row.status, row.key);
  });
});

describe('P6-22 — les divergences du document sont déclarées', () => {
  test('chaque divergence dit ce qui a été retenu, l’alternative et pourquoi', () => {
    // Le même onglet contient deux tables aux seuils différents. Trancher en
    // silence ferait d'un choix du prestataire une décision du client.
    assert.ok(ALERT_DIVERGENCES.length >= 3);
    for (const row of ALERT_DIVERGENCES) {
      assert.ok(row.chosen && row.alternative && row.why, row.key);
    }
  });

  test('le repère à 20 % n’est pas perdu, il est déclaré comme repère', () => {
    const divergence = ALERT_DIVERGENCES.find((row) => row.key === 'dsr_watch_level');
    assert.match(divergence.alternative, /20 %/);
    assert.equal(alertConstant('DEBT_WATCH').value, 0.2);
  });
});

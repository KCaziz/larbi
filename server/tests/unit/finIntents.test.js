import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FIN_INTENT_CATALOGUE,
  FIN_INTENT_CODES,
  FIN_INTENT_FALLBACK,
  FIN_INTENT_GUARDRAILS,
  finIntent,
} from '../../src/constants/finIntents.js';
import { GOAL_MODELS, GOAL_MODEL_FREE, goalModel } from '../../src/constants/finGoalModels.js';
import { ADULT_AGE } from '../../src/constants/finPublics.js';

// Contenu de l'assistant et des objectifs (P6-22, chantier 6).
//
// Ce catalogue remplace 8 intentions brouillon et 11 modèles génériques écrits
// par l'équipe faute de mieux. Ce que ces tests gardent avant tout, ce ne sont
// pas les réponses : ce sont les GARDE-FOUS, c'est-à-dire ce que l'assistant
// n'a pas le droit de faire.

describe('P6-22 — les 25 intentions du client', () => {
  test('le catalogue est complet et sans doublon', () => {
    assert.equal(FIN_INTENT_CATALOGUE.length, 25);
    assert.deepEqual([...new Set(FIN_INTENT_CODES)].sort(), [...FIN_INTENT_CODES].sort());
  });

  test('chaque intention porte ses déclencheurs, ses étapes et sa réponse', () => {
    // Les déclencheurs sont ce qui rend la reconnaissance DÉTERMINISTE : sans
    // eux, « reconnaître une intention » redeviendrait une interprétation.
    for (const intent of FIN_INTENT_CATALOGUE) {
      assert.ok(intent.label, intent.code);
      assert.ok(intent.answer, `${intent.code} n'a pas de réponse`);
      if (!intent.fallback) {
        assert.ok(intent.triggers.length > 0, `${intent.code} n'a aucun déclencheur`);
      }
    }
  });

  test('CHAQUE intention porte un garde-fou', () => {
    // Le point le plus important du catalogue. Une intention sans garde-fou
    // est une intention où l'assistant peut tout dire.
    const silent = FIN_INTENT_CATALOGUE.filter((row) => !row.guardrail);
    assert.deepEqual(silent.map((row) => row.code), []);
    assert.equal(FIN_INTENT_GUARDRAILS.length, 25);
  });

  test('les garde-fous les plus durs sont là, mot pour mot', () => {
    // Ces trois-là protègent de trois fautes différentes : exposer un secret,
    // inventer un chiffre, improviser une réponse.
    assert.match(finIntent('CB22').guardrail, /Ne jamais demander code PIN\/OTP\/mot de passe/);
    assert.match(finIntent('CB24').guardrail, /Ne jamais deviner un taux/);
    assert.match(finIntent('CB99').guardrail, /Ne jamais générer de contenu hors base validée/);
  });

  test('le repli existe, et c’est le seul', () => {
    // CB99 est la seule entrée que le résolveur a le droit de choisir sans
    // avoir reconnu quoi que ce soit.
    assert.equal(FIN_INTENT_FALLBACK.code, 'CB99');
    assert.equal(FIN_INTENT_CATALOGUE.filter((row) => row.fallback).length, 1);
    assert.match(FIN_INTENT_FALLBACK.answer, /Aucune réponse libre/);
  });

  test('l’intention « utilisateur mineur » cite le bon âge', () => {
    // CB16 dit « <19 fonctions adultes bloquées ». C'est la même règle que le
    // chantier 1 ; si quelqu'un remettait 18 dans le code, les deux
    // divergeraient en silence.
    const minor = finIntent('CB16');
    assert.match(minor.guardrail, new RegExp(`${ADULT_AGE}`));
    assert.match(minor.guardrail, /consentement|tranche|bloquées/i);
  });

  test('les intentions financières renvoient à leurs garde-fous métier', () => {
    // Trois règles que le projet applique déjà ailleurs, et que le client
    // répète ici : pas d'accord de crédit, pas de « meilleure banque », pas de
    // recommandation d'investissement.
    assert.match(finIntent('CB09').guardrail, /Pas accord de crédit/);
    assert.match(finIntent('CB15').guardrail, /Pas .meilleure banque. globale/);
    assert.match(finIntent('CB17').guardrail, /Aucune recommandation/);
  });

  test('aucune intention ne promet une décision bancaire', () => {
    // Balayage sur TOUTES les réponses, pas sur une liste choisie d'avance :
    // une formulation ajoutée plus tard ne serait pas couverte autrement.
    const promising = FIN_INTENT_CATALOGUE.filter((row) => /vous (obtiendrez|aurez) |garantit|accord assuré/i.test(row.answer ?? ''));
    assert.deepEqual(promising.map((row) => row.code), []);
  });
});

describe('P6-22 — les 20 modèles d’objectifs', () => {
  test('le catalogue est complet', () => {
    assert.equal(GOAL_MODELS.length, 20);
    assert.ok(goalModel('G01'));
    assert.ok(goalModel('G20'));
    assert.equal(goalModel('G99'), null);
  });

  test('chaque modèle porte sa cible, son horizon et sa règle', () => {
    for (const model of GOAL_MODELS) {
      assert.ok(model.label, model.code);
      assert.ok(model.defaultTarget, `${model.code} n'a pas de cible par défaut`);
      assert.ok(model.horizon, `${model.code} n'a pas d'horizon`);
      assert.ok(model.rule, `${model.code} n'a pas de règle`);
    }
  });

  test('les cibles restent du texte, jamais converties en nombre', () => {
    // « 3 mois dépenses essentielles; 6 si revenu variable » : convertir
    // obligerait à choisir entre les deux valeurs d'une condition, ce que la
    // condition demande précisément de ne pas faire.
    assert.match(goalModel('G02').defaultTarget, /6 si revenu variable/);
    assert.match(goalModel('G06').defaultTarget, /10-30%/);
    assert.equal(typeof goalModel('G06').defaultTarget, 'string');
  });

  test('les règles qui sont des interdits sont conservées telles quelles', () => {
    // Trois modèles portent une interdiction, et c'est ce qui empêche le
    // produit de proposer un objectif que personne n'a demandé.
    assert.match(goalModel('G06').rule, /Ne pas présumer exigence bancaire/);
    assert.match(goalModel('G08').rule, /jamais proposé sans intention/);
    assert.match(goalModel('G07').rule, /uniquement si règle vérifiée/);
  });

  test('l’objectif libre existe et est toujours disponible', () => {
    // Sans lui, une personne devrait faire entrer son projet dans une case
    // qui ne lui va pas.
    assert.ok(GOAL_MODEL_FREE);
    assert.equal(GOAL_MODEL_FREE.code, 'G20');
    assert.match(GOAL_MODEL_FREE.rule, /Toujours disponible/);
  });

  test('la réserve et le fonds d’urgence précèdent l’investissement', () => {
    // L'ordre de priorité du client, qui est aussi celui du tableau de bord :
    // sécurité avant placement.
    assert.match(goalModel('G02').rule, /avant investissement/i);
    assert.match(goalModel('G17').rule, /réserve et dette vérifiées/i);
  });
});

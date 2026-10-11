import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { fallbackCategories, isKnownDeepLink, normalise, resolveIntent } from '../../src/services/finAssistant.service.js';
import { FIN_INTENTS, FIN_INTENT_CODES } from '../../src/constants/finAssistant.js';

describe('the 8 intents', () => {
  test('exactly the client\'s own closed list (13_Chatbot), nothing added or removed', () => {
    assert.deepEqual(FIN_INTENT_CODES, ['NAVIGUER', 'EXPLIQUER_INDICATEUR', 'CRÉER_OBJECTIF', 'AIDE_BUDGET', 'AIDE_DETTE', 'APPRENDRE_TERME', 'CHERCHER_SOLUTION', 'DÉPENSE_PARTAGÉE']);
    assert.ok(FIN_INTENTS.every((i) => i.label && i.exampleQuery));
  });
});

describe('normalise', () => {
  test('accents and case are ignored', () => {
    assert.equal(normalise('Où Ajouter une DÉPENSE ?'), 'ou ajouter une depense');
  });
});

describe('resolveIntent', () => {
  const intents = [
    { code: 'A', keywords: ['dépense', 'ajouter'] },
    { code: 'B', keywords: ['dette', 'rembourser'] },
  ];
  test('picks the intent with the most keyword hits', () => {
    assert.equal(resolveIntent('comment ajouter une dépense', intents).code, 'A');
    assert.equal(resolveIntent('rembourser ma dette plus vite', intents).code, 'B');
  });
  test('an empty or unmatched query resolves to nothing (fallback territory)', () => {
    assert.equal(resolveIntent('', intents), null);
    assert.equal(resolveIntent('bonjour', intents), null);
  });
  test('accents and case do not prevent a match', () => {
    assert.equal(resolveIntent('DÉPENSE à AJOUTER', intents).code, 'A');
  });
});

describe('isKnownDeepLink', () => {
  test('only a real, whitelisted route is offered; an unbuilt FINCLUDIA screen is not', () => {
    assert.equal(isKnownDeepLink('/apprendre'), true);
    assert.equal(isKnownDeepLink('/ecran-qui-nexiste-pas'), false);
    assert.equal(isKnownDeepLink(null), false);
  });
});

describe('fallbackCategories', () => {
  test('at most 6 ("4 à 6 catégories", client\'s words)', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ code: `C${i}` }));
    assert.equal(fallbackCategories(many).length, 6);
  });
});

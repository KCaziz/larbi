import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ADULT_AGE,
  FIN_AGE_RANGES,
  FIN_PUBLICS,
  FIN_PUBLIC_CODES,
  MINOR_AGE_RANGES,
  YOUTH_ALLOWED,
  YOUTH_FORBIDDEN,
  YOUTH_MIN_AGE,
  isAdultAgeRange,
} from '../../src/constants/finPublics.js';
import { updateFinProfileSchema } from '../../src/validation/finProfile.schemas.js';

describe('isAdultAgeRange', () => {
  test('13-18 is a minor bracket; every bracket from 19 is adult; unset is unknown', () => {
    assert.equal(isAdultAgeRange('13-18'), false);
    for (const range of ['19-24', '25-34', '35-49', '50-64', '65plus']) assert.equal(isAdultAgeRange(range), true);
    assert.equal(isAdultAgeRange(null), null);
    assert.equal(isAdultAgeRange(undefined), null);
  });
});

describe('la majorité civile est 19 ans, pas 18 (P6-22)', () => {
  test('les deux seuils sont ceux du référentiel du client', () => {
    // `ADULT_AGE = 19` (Code civil algérien, art. 40) et `YOUTH_MIN_AGE = 13`
    // (politique FINCLUDIA, et le client prend soin de dire que ce n'est pas
    // un âge légal de consentement numérique). Le projet avait supposé 18 —
    // l'habitude française — et cette supposition décidait qui pouvait voir
    // ses dettes et préparer un financement.
    assert.equal(ADULT_AGE, 19);
    assert.equal(YOUTH_MIN_AGE, 13);
  });

  test('aucune tranche ne place la frontière à 18 ans', () => {
    // Le test qui empêche le retour en arrière : si quelqu'un réintroduit une
    // tranche `18-24` ou `under18`, la frontière redevient 18 sans que rien
    // ne le dise.
    assert.ok(!FIN_AGE_RANGES.includes('under18'), 'la tranche under18 est revenue');
    assert.ok(!FIN_AGE_RANGES.includes('18-24'), 'la tranche 18-24 est revenue');
    assert.deepEqual(FIN_AGE_RANGES, ['under13', '13-18', '19-24', '25-34', '35-49', '50-64', '65plus']);
  });

  test('une personne de 18 ans est mineure', () => {
    // Le cœur du changement, dit en une ligne : la tranche qui contient 18 ans
    // n'est pas adulte.
    assert.equal(isAdultAgeRange('13-18'), false);
    assert.equal(isAdultAgeRange('19-24'), true);
  });

  test('les tranches mineures sont nommées, pas déduites', () => {
    // Une tranche ajoutée plus tard serait adulte par oubli si l'adulte était
    // défini par « tout sauf under13 ». L'erreur se ferait alors dans le sens
    // qui ouvre des droits, ce qui est le mauvais sens.
    assert.deepEqual(MINOR_AGE_RANGES, ['under13', '13-18']);
    for (const range of MINOR_AGE_RANGES) assert.equal(isAdultAgeRange(range), false, range);
  });

  test('toute tranche inconnue du référentiel n’est jamais adulte par défaut', () => {
    // Deux façons de se tromper : une tranche inventée, et une tranche vide.
    // Aucune des deux ne doit ouvrir un droit.
    assert.equal(isAdultAgeRange(''), null);
    assert.equal(isAdultAgeRange(null), null);
    // Et le refus par défaut est le travail de `requireAdult`, qui traite
    // `null` comme « ne peut pas » — vérifié par les tests de sécurité.
  });

  test('ce qu’un compte jeune garde est écrit, pas sous-entendu', () => {
    // Un refus qui n'énumère que des interdits se lit comme une porte fermée.
    assert.match(YOUTH_ALLOWED, /[Bb]udget réel/);
    assert.match(YOUTH_ALLOWED, /portefeuille fictif/);
    assert.match(YOUTH_FORBIDDEN, /crédit réel/);
  });
});

describe('the 8 publics', () => {
  test('exactly the client\'s own list (01_Publics), nothing added or removed', () => {
    assert.deepEqual(FIN_PUBLIC_CODES, ['LYC', 'ETU', 'JAC', 'SAL', 'COL', 'COU', 'FAM', 'EPG']);
    assert.equal(FIN_PUBLICS.length, 8);
    assert.ok(FIN_PUBLICS.every((p) => p.label && p.experience && p.mission));
  });
});

describe('updateFinProfileSchema', () => {
  test('every field optional ("je ne sais pas / modifier plus tard")', () => {
    assert.equal(updateFinProfileSchema.safeParse({}).success, true);
  });

  test('finPublic null is accepted (clearing), unknown codes are not', () => {
    assert.equal(updateFinProfileSchema.safeParse({ finPublic: null }).success, true);
    assert.equal(updateFinProfileSchema.safeParse({ finPublic: 'ADM' }).success, false);
  });

  test('secondary publics cannot include the primary one', () => {
    assert.equal(updateFinProfileSchema.safeParse({ finPublic: 'SAL', finSecondaryPublics: ['SAL'] }).success, false);
    assert.equal(updateFinProfileSchema.safeParse({ finPublic: 'SAL', finSecondaryPublics: ['COL', 'COU'] }).success, true);
  });

  test('country is a 2-letter code, case-insensitive on input', () => {
    assert.equal(updateFinProfileSchema.parse({ finCountry: 'dz' }).finCountry, 'DZ');
    assert.equal(updateFinProfileSchema.safeParse({ finCountry: 'DZA' }).success, false);
  });
});

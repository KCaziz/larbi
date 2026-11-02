import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { MISSION_CATALOGUE } from '../../src/constants/finMissionRules.js';
import { EDUCATION_PROFILES } from '../../src/constants/finEducation.js';
import { certificationStatus } from '../../src/services/finCertification.service.js';

// P8-34: the client's counts and rules for the mandatory missions.
const all = (parcours, score) => Object.fromEntries(MISSION_CATALOGUE[parcours].missions.map((mission) => [mission.key, score]));

describe('the catalogue', () => {
  test('8 missions for the lycéen and the salarié, 10 for the épargnant; each parcours exists in the education layer', () => {
    assert.equal(MISSION_CATALOGUE.avenir.missions.length, 8);
    assert.equal(MISSION_CATALOGUE['mon-argent'].missions.length, 8);
    assert.equal(MISSION_CATALOGUE.epargne.missions.length, 10);
    for (const [key, parcours] of Object.entries(MISSION_CATALOGUE)) {
      assert.equal(EDUCATION_PROFILES.find((row) => row.code === parcours.profile)?.parcours.key, key);
    }
  });
});

describe('the certification rules', () => {
  test('everything at 90 %, the final case passed: eligible', () => {
    const status = certificationStatus('avenir', { scores: all('avenir', 90), finalCasePassed: true });
    assert.equal(status.eligible, true);
    assert.deepEqual(status.missing, []);
  });

  test('a mission needs 70 %, the security module 80 %', () => {
    const scores = { ...all('avenir', 90), 'avenir-02': 69, 'avenir-05': 79 };
    const status = certificationStatus('avenir', { scores, finalCasePassed: true });
    assert.equal(status.missions.find((m) => m.key === 'avenir-02').validated, false);
    assert.equal(status.missions.find((m) => m.key === 'avenir-05').validated, false);
    assert.equal(certificationStatus('avenir', { scores: { ...scores, 'avenir-02': 70, 'avenir-05': 80 }, finalCasePassed: true }).eligible, true);
  });

  test('the average must reach 75 % even with every mission validated', () => {
    const status = certificationStatus('mon-argent', { scores: all('mon-argent', 72), finalCasePassed: true });
    assert.equal(status.validated, 8);
    assert.deepEqual(status.missing, ['average']);
  });

  test('the final case is required; a mission never attempted counts 0 and blocks', () => {
    assert.deepEqual(certificationStatus('epargne', { scores: all('epargne', 95) }).missing, ['finalCase']);
    const partial = certificationStatus('epargne', { scores: { ...all('epargne', 95), 'epargne-10': null }, finalCasePassed: true });
    assert.ok(partial.missing.includes('missions'));
    assert.ok(partial.average < 95);
  });

  test('an unknown parcours has no status, nothing is guessed', () => {
    assert.equal(certificationStatus('campus', {}), null);
  });
});

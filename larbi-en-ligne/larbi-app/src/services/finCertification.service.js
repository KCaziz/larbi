// The certification rules of the missions V1 (P8-34, client's answer E of 2026-11-02), as one pure function.
//
//   - a mission is validated at 70 % of its quiz at least, a digital-security
//     module at 80 %;
//   - the certificate asks: every mandatory mission validated, a global average
//     of at least 75 %, the final case passed, and the mandatory security
//     modules finished;
//   - it stays pedagogical: no diploma, no financial approval, no bank score.
//
// `certificationStatus` reads results it is GIVEN (the best percentage of each
// mission, the final case); `certificationFor` takes them from the missions the
// person has played, a mission being graded as the share of its resilience
// points obtained at best.

import { EDUCATION_PROFILES } from '../constants/finEducation.js';
import { CERTIFICATE_AVERAGE_PERCENT, MISSION_CATALOGUE, MISSION_PASS_PERCENT, SECURITY_MODULE_PASS_PERCENT } from '../constants/finMissionRules.js';

/**
 * @param {string} parcoursKey  'avenir' | 'mon-argent' | 'epargne'
 * @param {{ scores?: Record<string, number|null>, finalCasePassed?: boolean }} results
 *   `scores`: best quiz percentage by mission key (absent or null = not attempted)
 * @returns {null | { missions, validated, total, average, finalCasePassed, missing, eligible }}
 *   null when the parcours has no catalogue (never a guess)
 */
export function certificationStatus(parcoursKey, { scores = {}, finalCasePassed = false } = {}) {
  const parcours = MISSION_CATALOGUE[parcoursKey];
  if (!parcours) return null;

  const missions = parcours.missions.map((mission) => {
    const score = Number.isFinite(scores[mission.key]) ? scores[mission.key] : null;
    const threshold = mission.security ? SECURITY_MODULE_PASS_PERCENT : MISSION_PASS_PERCENT;
    return { key: mission.key, title: mission.title, security: Boolean(mission.security), score, threshold, validated: score !== null && score >= threshold };
  });

  const validated = missions.filter((mission) => mission.validated).length;
  // The average is over ALL mandatory missions: one never attempted counts 0,
  // so it cannot be skipped to lift the mean.
  const average = missions.reduce((sum, mission) => sum + (mission.score ?? 0), 0) / missions.length;

  const missing = [];
  if (validated < missions.length) missing.push('missions');
  if (average < CERTIFICATE_AVERAGE_PERCENT) missing.push('average');
  if (!finalCasePassed) missing.push('finalCase');
  if (missions.some((mission) => mission.security && !mission.validated)) missing.push('security');

  return { certification: parcours.certification, missions, validated, total: missions.length, average, finalCasePassed, missing, eligible: missing.length === 0 };
}

// ---- from the missions a person has played ---------------------------------

const clampPercent = (value) => Math.max(0, Math.min(100, value));

/** The best a mission can score: the best choice of every step. */
export const maxResilience = (mission) => mission.steps.reduce((sum, step) => sum + Math.max(...step.choices.map((choice) => choice.resilience)), 0);

/**
 * Where a person stands towards the certificate of their parcours: each mission
 * is graded as the share of its resilience points obtained at best (the
 * missions have no separate quiz), the final case is the mission `<parcours>-cas-final`
 * passed at the mission threshold. Null when the profile has no parcours.
 */
export async function certificationFor(prisma, user) {
  const profile = EDUCATION_PROFILES.find((row) => row.code === user.finPublic);
  const parcoursKey = profile?.parcours?.key;
  if (!parcoursKey || !MISSION_CATALOGUE[parcoursKey]) return null;

  const slugs = [...MISSION_CATALOGUE[parcoursKey].missions.map((mission) => mission.key), `${parcoursKey}-cas-final`];
  const missions = await prisma.finMission.findMany({ where: { slug: { in: slugs }, status: 'published' }, select: { id: true, slug: true, steps: true } });
  const attempts = await prisma.finMissionAttempt.findMany({ where: { userId: user.id, missionId: { in: missions.map((mission) => mission.id) } }, select: { missionId: true, result: true } });

  const percents = {};
  for (const mission of missions) {
    const max = maxResilience(mission);
    const best = Math.max(...attempts.filter((attempt) => attempt.missionId === mission.id).map((attempt) => attempt.result?.resilience ?? -Infinity), -Infinity);
    percents[mission.slug] = Number.isFinite(best) && max > 0 ? clampPercent((best / max) * 100) : null;
  }
  const finalPercent = percents[`${parcoursKey}-cas-final`];
  return certificationStatus(parcoursKey, { scores: percents, finalCasePassed: finalPercent !== null && finalPercent !== undefined && finalPercent >= MISSION_PASS_PERCENT });
}

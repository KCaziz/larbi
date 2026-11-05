// Pedagogical missions (P8-17): the scoring, what a learner reads and plays, and
// what an administrator enters. The rule is in constants/finMissions.js and is
// the same for every mission; nothing here touches a real account.
import { MISSION_ATTEMPTS_KEPT } from '../constants/finMissions.js';
import { HttpError } from '../utils/httpError.js';

const PROFILE_FREE = 'AUT';

/**
 * The result of a series of choices — a pure function, so the rule can be read
 * and tested alone.
 *
 * `choices`: [{ step, choice }], one per step, in any order. Anything else — a
 * missing step, an unknown key, a step answered twice — is refused rather than
 * scored, because a result computed on a partial play would be a wrong figure.
 */
export function scoreMission(mission, choices) {
  const byStep = new Map();
  for (const entry of choices ?? []) {
    if (byStep.has(entry.step)) throw new HttpError(422, 'A step is answered twice', { reason: 'duplicateStep', step: entry.step });
    byStep.set(entry.step, entry.choice);
  }
  const stepKeys = new Set(mission.steps.map((step) => step.key));
  for (const key of byStep.keys()) if (!stepKeys.has(key)) throw new HttpError(422, 'Unknown step', { reason: 'unknownStep', step: key });

  const trace = mission.steps.map((step) => {
    const choiceKey = byStep.get(step.key);
    if (choiceKey === undefined) throw new HttpError(422, 'Every step needs an answer', { reason: 'missingStep', step: step.key });
    const choice = step.choices.find((row) => row.key === choiceKey);
    if (!choice) throw new HttpError(422, 'Unknown choice', { reason: 'unknownChoice', step: step.key });
    return { step: step.key, prompt: step.prompt, choice: choice.key, label: choice.label, explanation: choice.explanation, cash: choice.cash, savings: choice.savings, resilience: choice.resilience };
  });

  const sum = (field) => trace.reduce((total, row) => total + row[field], 0);
  const resilience = sum('resilience');
  // The highest badge whose threshold the total reaches; none when none is reached.
  const badge = [...(mission.badges ?? [])].sort((a, b) => b.minResilience - a.minResilience).find((row) => resilience >= row.minResilience) ?? null;
  return {
    startingAmount: mission.startingAmount,
    cash: mission.startingAmount + sum('cash'),
    savings: sum('savings'),
    resilience,
    badge: badge ? { key: badge.key, label: badge.label } : null,
    // « Explicable »: the rule, in words, and each choice with what it did and why.
    rule: 'startingAmount + sum of the cash effects ; savings and resilience are the sums of their effects ; the badge is the highest one whose threshold the resilience reaches',
    trace,
  };
}

const offeredTo = (mission, finPublic) => {
  const profiles = mission.profiles ?? [];
  return profiles.length === 0 || finPublic === PROFILE_FREE || profiles.includes(finPublic);
};

// What a learner may read BEFORE playing: the prompts and the choices' labels —
// never their effects or explanations, which would turn the mission into a
// lookup table.
const learnerView = (mission) => ({
  slug: mission.slug,
  title: mission.title,
  summary: mission.summary,
  startingAmount: mission.startingAmount,
  currency: mission.currency,
  steps: mission.steps.map((step) => ({ key: step.key, prompt: step.prompt, choices: step.choices.map((choice) => ({ key: choice.key, label: choice.label })) })),
});

export async function listMissionsFor(prisma, user) {
  const rows = await prisma.finMission.findMany({ where: { status: 'published' }, orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] });
  const mine = rows.filter((row) => offeredTo(row, user.finPublic ?? null));
  const attempts = await prisma.finMissionAttempt.findMany({ where: { userId: user.id, missionId: { in: mine.map((row) => row.id) } }, orderBy: { createdAt: 'desc' }, select: { missionId: true, result: true, createdAt: true } });
  return mine.map((row) => {
    const own = attempts.filter((attempt) => attempt.missionId === row.id);
    // The best badge ever earned on this mission, and how many times it was played.
    const best = [...own].sort((a, b) => (b.result.resilience ?? 0) - (a.result.resilience ?? 0))[0] ?? null;
    return {
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      steps: row.steps.length,
      played: own.length,
      badge: best?.result.badge ?? null,
      lastPlayedAt: own[0]?.createdAt ?? null,
    };
  });
}

async function publishedMission(prisma, user, slug) {
  const mission = await prisma.finMission.findFirst({ where: { slug, status: 'published' } });
  if (!mission || !offeredTo(mission, user.finPublic ?? null)) throw new HttpError(404, 'Mission not found');
  return mission;
}

export async function getMissionFor(prisma, user, slug) {
  return learnerView(await publishedMission(prisma, user, slug));
}

export async function playMission(prisma, user, slug, choices) {
  const mission = await publishedMission(prisma, user, slug);
  const result = scoreMission(mission, choices);
  const saved = await prisma.finMissionAttempt.create({ data: { userId: user.id, missionId: mission.id, choices, result } });
  // Only the last few plays are kept: a mission is replayed for learning, not archived.
  const old = await prisma.finMissionAttempt.findMany({ where: { userId: user.id, missionId: mission.id }, orderBy: { createdAt: 'desc' }, skip: MISSION_ATTEMPTS_KEPT, select: { id: true } });
  if (old.length > 0) await prisma.finMissionAttempt.deleteMany({ where: { id: { in: old.map((row) => row.id) } } });
  return { attemptId: saved.id, result };
}

// ---- administration --------------------------------------------------------

export const listMissionsAdmin = (prisma) => prisma.finMission.findMany({ orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] });

export async function createMission(prisma, body) {
  if (await prisma.finMission.findUnique({ where: { slug: body.slug }, select: { id: true } })) throw new HttpError(409, 'This address is taken', { reason: 'slugTaken' });
  return prisma.finMission.create({ data: { ...body, status: 'draft' } });
}

export async function updateMission(prisma, id, body) {
  const existing = await prisma.finMission.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, 'Mission not found');
  if (body.slug && body.slug !== existing.slug && (await prisma.finMission.findUnique({ where: { slug: body.slug }, select: { id: true } }))) {
    throw new HttpError(409, 'This address is taken', { reason: 'slugTaken' });
  }
  return prisma.finMission.update({ where: { id }, data: { ...body, version: { increment: 1 } } });
}

export async function setMissionStatus(prisma, id, status) {
  const existing = await prisma.finMission.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, 'Mission not found');
  return prisma.finMission.update({ where: { id }, data: { status, publishedAt: status === 'published' ? (existing.publishedAt ?? new Date()) : existing.publishedAt } });
}

export async function deleteMission(prisma, id) {
  const existing = await prisma.finMission.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, 'Mission not found');
  // A published mission has been played: unpublish it first, deliberately.
  if (existing.status === 'published') throw new HttpError(409, 'Unpublish the mission before deleting it', { reason: 'published' });
  await prisma.finMission.delete({ where: { id } });
  return { id };
}

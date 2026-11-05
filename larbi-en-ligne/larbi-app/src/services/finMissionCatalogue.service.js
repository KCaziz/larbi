// Puts the drafted missions V1 into the database (P8-34). Idempotent and
// non-destructive: a mission that already exists (its address is taken) is left
// exactly as the administrator edited it, so running this again never undoes
// the client's own wording.
import { MISSION_CATALOGUE } from '../constants/finMissionRules.js';
import { missionDrafts } from '../constants/finMissionContent.js';

export async function ensureMissionCatalogue(prisma) {
  const created = [];
  for (const draft of missionDrafts(MISSION_CATALOGUE)) {
    // eslint-disable-next-line no-await-in-loop -- 29 rows, once
    if (await prisma.finMission.findUnique({ where: { slug: draft.slug }, select: { id: true } })) continue;
    // eslint-disable-next-line no-await-in-loop
    await prisma.finMission.create({ data: { ...draft, publishedAt: new Date() } });
    created.push(draft.slug);
  }
  return created;
}

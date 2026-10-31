// Snapshots (P8-24): what was true at a date, kept as it was — never recomputed.
//
//   report  a monthly report the person chose to keep (« instantané de rapport »)
//   health  the month's financial-health index, kept each time it is computed,
//           so the index has a HISTORY instead of one figure that moves
//
// One per (person, kind, month). Keeping the same month again replaces the
// stored figure and raises `version`: the latest reading of a month stands, and
// the screen says when it was taken.
import { HttpError } from '../utils/httpError.js';

export async function saveSnapshot(prisma, userId, kind, period, payload) {
  return prisma.finSnapshot.upsert({
    where: { userId_kind_period: { userId, kind, period } },
    create: { userId, kind, period, payload },
    update: { payload, capturedAt: new Date(), version: { increment: 1 } },
    select: { id: true, kind: true, period: true, version: true, capturedAt: true },
  });
}

export function listSnapshots(prisma, userId, kind, { months = 12 } = {}) {
  return prisma.finSnapshot.findMany({
    where: { userId, kind },
    orderBy: { period: 'desc' },
    take: months,
    select: { id: true, period: true, version: true, capturedAt: true, payload: kind === 'health' },
  });
}

export async function getSnapshot(prisma, userId, kind, period) {
  const row = await prisma.finSnapshot.findUnique({ where: { userId_kind_period: { userId, kind, period } }, select: { period: true, version: true, capturedAt: true, payload: true } });
  if (!row) throw new HttpError(404, 'No snapshot for this month');
  return row;
}

/**
 * The month's health index, kept. Only a real figure is kept (a null index is
 * « not measurable yet », not a point of the history), and never for a minor,
 * who is not shown the index at all.
 */
export async function recordHealthSnapshot(prisma, userId, month, health) {
  const value = health?.answer?.resultat ?? null;
  if (value === null) return null;
  return saveSnapshot(prisma, userId, 'health', month, {
    valeur: value,
    bande: health.bande ?? null,
    partiel: health.partiel,
    version: health.version,
    dimensions: health.dimensions.map((row) => ({ key: row.key, score: row.score })),
  });
}

/** The index month by month, oldest first, with the dimensions kept at the time. */
export async function healthHistory(prisma, userId, { months = 12 } = {}) {
  const rows = await listSnapshots(prisma, userId, 'health', { months });
  return rows
    .map((row) => ({ month: row.period, capturedAt: row.capturedAt, valeur: row.payload.valeur, bande: row.payload.bande, partiel: row.payload.partiel, dimensions: row.payload.dimensions }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

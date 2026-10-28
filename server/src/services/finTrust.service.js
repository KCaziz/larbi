// Trust and data centre (P6-19): inventory, consents, export, deletion,
// completeness. Reuses FINANCIAL_TABLES (P6-02) as the single registry of
// what "this account's financial data" means, rather than a second list that
// could drift from the one the consistency control already checks against.
import { FINANCIAL_TABLES, liveFilter } from '../constants/finData.js';
import { FIN_CONSENT_TEXTS } from '../constants/finPublics.js';
import { COMPLETENESS_CHECKS, DELETION_POLICY, DEVICES_BLOCKED } from '../constants/finTrust.js';
import { SHAREABLE_KINDS } from '../constants/finSpace.js';
import { eraseAccountReceipts } from './finMoney.service.js';
import { normaliseSharing, updateMySharing } from './finSpace.service.js';
import { hasCurrentConsents } from './finProfile.service.js';

// Per table: how many live rows, where they came from, what they are
// currently declared as, and the window they were collected over. A
// mechanical READ of the socle every financial task already writes — no new
// bookkeeping of its own.
export async function buildDataInventory(prisma, userId) {
  const rows = await Promise.all(
    FINANCIAL_TABLES.map(async (table) => {
      const { model, label } = table;
      const data = await prisma[model].findMany({
        // Certaines tables du socle n'ont pas de `userId` : elles appartiennent
        // à un objet qui le porte. Le chemin est déclaré dans le registre, donc
        // aucun lecteur n'a à le deviner.
        where: liveFilter(table, userId),
        select: { source: true, status: true, consentUses: true, collectedAt: true },
      });
      if (data.length === 0) return { label, count: 0, sources: [], statuses: [], usages: [], premiereCollecte: null, derniereCollecte: null };
      const dates = data.map((row) => row.collectedAt.getTime());
      return {
        label,
        count: data.length,
        sources: [...new Set(data.map((row) => row.source))],
        statuses: [...new Set(data.map((row) => row.status))],
        usages: [...new Set(data.flatMap((row) => row.consentUses ?? []))],
        premiereCollecte: new Date(Math.min(...dates)),
        derniereCollecte: new Date(Math.max(...dates)),
      };
    }),
  );
  return rows;
}

// Legal texts accepted (P3-18) plus every space-sharing consent this account
// currently grants (P6-13) — the ONE consent in this platform whose
// withdrawal actually blocks a dependent use (income-proportional splits,
// F042/F044), which is what the client's own wording asks to show.
export async function listConsents(prisma, userId) {
  const [legal, memberships] = await Promise.all([
    prisma.finConsent.findMany({ where: { userId }, orderBy: { acceptedAt: 'desc' } }),
    prisma.finSpaceMember.findMany({
      where: { userId, leftAt: null },
      select: { id: true, sharing: true, space: { select: { id: true, label: true, kind: true } } },
    }),
  ]);
  return {
    textes: legal.map((row) => ({
      textKey: row.textKey,
      version: row.version,
      acceptedAt: row.acceptedAt,
      current: FIN_CONSENT_TEXTS[row.textKey]?.version === row.version,
    })),
    partages: memberships.flatMap((member) => {
      const sharing = normaliseSharing(member.sharing);
      return SHAREABLE_KINDS.filter((kind) => sharing[kind] !== 'private').map((kind) => ({
        spaceId: member.space.id,
        spaceLabel: member.space.label,
        spaceKind: member.space.kind,
        kind,
        level: sharing[kind],
      }));
    }),
  };
}

// Withdraws ONE sharing consent in ONE space — exactly what `updateMySharing`
// (P6-13) already does, called from here so the trust centre can require
// re-authentication on top of it without duplicating the sharing logic.
export async function withdrawSpaceSharing(prisma, userId, spaceId, kind) {
  if (!SHAREABLE_KINDS.includes(kind)) throw new Error(`Unknown shareable kind: ${kind}`);
  return updateMySharing(prisma, userId, spaceId, { [kind]: 'private' });
}

// Mechanical completeness — "has this account started using X", never a
// judgement on them and never the word the client forbids.
export async function buildCompleteness(prisma, userId) {
  const [user, incomeCount, budgetCount, goalCount, consentsOk] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { finPublic: true, finOnboardedAt: true } }),
    prisma.finIncome.count({ where: { userId, deletedAt: null, archivedAt: null } }),
    prisma.finBudget.count({ where: { userId, deletedAt: null } }),
    prisma.finGoal.count({ where: { userId, deletedAt: null } }),
    hasCurrentConsents(userId),
  ]);
  const checks = [
    { key: 'public', done: Boolean(user?.finPublic) },
    { key: 'onboarding', done: Boolean(user?.finOnboardedAt) },
    { key: 'income', done: incomeCount > 0 },
    { key: 'budget', done: budgetCount > 0 },
    { key: 'goal', done: goalCount > 0 },
    { key: 'consents', done: consentsOk },
  ];
  const done = checks.filter((c) => c.done).length;
  return { ratio: done / COMPLETENESS_CHECKS.length, checks };
}

// The export: the account's profile fields plus every row FINANCIAL_TABLES
// names, in full — not just the inventory's counts. Scoped to FINCLUDIA's own
// data, which is what the privacy text promises; the platform's other
// features (formations, articles...) are not financial data and stay out.
export async function exportAccountData(prisma, userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, finPublic: true, finCurrency: true, finAgeRange: true, finCountry: true, finOnboardedAt: true },
  });
  const tables = await Promise.all(
    FINANCIAL_TABLES.map(async (table) => ({
      label: table.label,
      rows: await prisma[table.model].findMany({ where: liveFilter(table, userId) }),
    })),
  );
  const consents = await listConsents(prisma, userId);
  return { compte: user, donnees: tables, consentements: consents, politiqueSuppression: DELETION_POLICY, exporteLe: new Date().toISOString() };
}

// Complete, immediate deletion (P6-01 point 9, decided 2026-10-11: no
// retention period). Files have no foreign key, so they are removed BEFORE
// the row that references them goes — afterwards there is nothing left to
// find them by. Everything else cascades from the User row itself.
export async function deleteAccount(prisma, userId) {
  await eraseAccountReceipts(prisma, userId);
  await prisma.user.delete({ where: { id: userId } });
  return { deleted: true, ...DELETION_POLICY };
}

export function connectedDevices() {
  return { disponible: false, ...DEVICES_BLOCKED };
}

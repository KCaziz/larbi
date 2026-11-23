import { prisma } from '../config/prisma.js';
import { REGULATORY_PARAMS, REGULATORY_SETTING_KEY } from '../constants/regulatoryParams.js';

// P13-05: the client's confirmation of each regulatory value, with the date it
// applies from. Kept as one JSON row of `platform_settings` — a handful of
// values, written by an administrator, read by the future regulatory screens:
// `confirmedValue(key)` returns null until the client has confirmed it, and a
// screen then says « règle non publiée » instead of computing (DEC-001).

async function readDecisions(client = prisma) {
  const row = await client.platformSetting.findUnique({ where: { key: REGULATORY_SETTING_KEY } });
  if (!row) return {};
  try {
    const parsed = JSON.parse(row.value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function listRegulatoryParams() {
  const decisions = await readDecisions();
  const params = REGULATORY_PARAMS.map((param) => {
    const decision = decisions[param.key] ?? null;
    return {
      key: param.key,
      group: param.group,
      kind: param.kind,
      candidate: param.candidate,
      source: param.source,
      status: decision ? 'confirmed' : 'pending',
      value: decision?.value ?? null,
      effectiveFrom: decision?.effectiveFrom ?? null,
      confirmedAt: decision?.confirmedAt ?? null,
    };
  });
  return { params, pending: params.filter((param) => param.status === 'pending').length };
}

// One confirmation. The read and the write are in one transaction, so two
// administrators confirming two values at the same moment both keep theirs.
export async function confirmRegulatoryParam(key, { value, effectiveFrom }, userId) {
  return prisma.$transaction(async (tx) => {
    const decisions = await readDecisions(tx);
    decisions[key] = { value, effectiveFrom, confirmedAt: new Date().toISOString(), confirmedBy: userId };
    const text = JSON.stringify(decisions);
    await tx.platformSetting.upsert({ where: { key: REGULATORY_SETTING_KEY }, update: { value: text }, create: { key: REGULATORY_SETTING_KEY, value: text } });
    return decisions[key];
  });
}

// For the screens that will apply a value: the confirmed value in force on
// `at`, or null (never the candidate of the workbook).
export async function confirmedValue(key, at = new Date()) {
  const decision = (await readDecisions())[key];
  if (!decision || new Date(decision.effectiveFrom) > at) return null;
  return decision.value;
}

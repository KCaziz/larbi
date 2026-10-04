import { prisma } from '../config/prisma.js';
import { COMPARATOR_THEMES, themeByKey } from '../constants/comparator.js';
import { TOOLS } from '../constants/tools.js';
import { sortConditions, toPublicCondition, toThemeInfo } from '../serializers/comparator.js';

// Tools catalogue (P4-01) and the PUBLIC bank comparator (P4-06): read only.
// Same answer for everyone, always revalidated (an edit in the administration
// shows at once; an unchanged answer costs a 304 thanks to the ETag).

const fresh = (res) => res.set('Cache-Control', 'no-cache');
const BANK = { bank: { select: { id: true, name: true } } };

export async function dataUpdatedAt() {
  const meta = await prisma.comparatorMeta.findUnique({ where: { id: 1 } });
  return meta?.dataUpdatedAt ?? null;
}

export function listTools(req, res) {
  fresh(res);
  res.json({ tools: TOOLS.map(({ key, status, access }) => ({ key, status, access })) });
}

export async function getSummary(req, res) {
  fresh(res);
  const [pairs, updatedAt] = await Promise.all([
    prisma.comparatorCondition.groupBy({ by: ['theme', 'bankId'], _count: { _all: true }, orderBy: [{ theme: 'asc' }, { bankId: 'asc' }] }),
    dataUpdatedAt(),
  ]);
  const themes = COMPARATOR_THEMES.map((theme) => {
    const mine = pairs.filter((p) => p.theme === theme.key);
    return { ...toThemeInfo(theme), conditionCount: mine.reduce((n, p) => n + p._count._all, 0), bankCount: mine.length };
  });
  res.json({
    themes,
    bankCount: new Set(pairs.map((p) => p.bankId)).size,
    conditionCount: pairs.reduce((n, p) => n + p._count._all, 0),
    updatedAt,
  });
}

export async function getTheme(req, res) {
  fresh(res);
  const theme = themeByKey(req.params.theme);
  const [rows, updatedAt] = await Promise.all([prisma.comparatorCondition.findMany({ where: { theme: theme.key }, include: BANK }), dataUpdatedAt()]);
  res.json({ theme: toThemeInfo(theme), conditions: sortConditions(rows).map(toPublicCondition), updatedAt });
}

// The client's tab 12 "Comparatif — Particuliers / Professionnels / Entreprises":
// only the conditions whose segment is stated, rubric by rubric.
export async function getSegment(req, res) {
  fresh(res);
  const [rows, updatedAt] = await Promise.all([prisma.comparatorCondition.findMany({ where: { segment: req.params.segment }, include: BANK }), dataUpdatedAt()]);
  const groups = COMPARATOR_THEMES.map((theme) => ({
    theme: toThemeInfo(theme),
    conditions: sortConditions(rows.filter((r) => r.theme === theme.key)).map(toPublicCondition),
  })).filter((group) => group.conditions.length > 0);
  res.json({ segment: req.params.segment, groups, updatedAt });
}

import { themeByKey } from '../constants/comparator.js';
import { annualCost } from '../services/comparator.service.js';

// Bank comparator (P4-06): what the API returns. Public data by nature (the
// conditions of banks), nothing else: no position, no internal dates per row.

export const toThemeInfo = (theme) => ({
  key: theme.key,
  fields: theme.fields,
  category: theme.category,
  hasMetric: Boolean(theme.metric),
});

// Only the rubric's own columns, only texts: a value that would not belong to the
// rubric is never sent (the consistency check reports it).
function ownValues(themeKey, values) {
  const fields = themeByKey(themeKey)?.fields ?? [];
  const src = values && typeof values === 'object' ? values : {};
  return Object.fromEntries(fields.filter((f) => typeof src[f] === 'string' && src[f] !== '').map((f) => [f, src[f]]));
}

export function toPublicCondition(row) {
  const values = ownValues(row.theme, row.values);
  return {
    id: row.id,
    bank: { id: row.bank.id, name: row.bank.name },
    segment: row.segment,
    category: row.category,
    label: row.label,
    values,
    annualCost: annualCost(row.theme, values),
  };
}

export function toAdminCondition(row) {
  return { ...toPublicCondition(row), theme: row.theme, position: row.position, updatedAt: row.updatedAt };
}

// Banks in a neutral order (alphabetical, French rules), then the client's order
// inside a bank: a comparator must not rank a bank first by the way it lists them.
export function sortConditions(rows) {
  return [...rows].sort((a, b) => a.bank.name.localeCompare(b.bank.name, 'fr', { sensitivity: 'base' }) || a.position - b.position);
}

import { ApiError } from './api.js';

// Shared helpers of the bank comparator pages (public and administration).

// The header of a column in the client's own words. A field shared by several
// rubrics keeps the rubric's wording when the client gave one: an Islamic profit
// share is a "part de bénéfices", a credit has a "taux / marge" — never one
// generic "taux" (client rule: the two are never assimilated).
export function fieldLabel(t, themeKey, field) {
  return t(`comparator.themeFields.${themeKey}.${field}`, { defaultValue: t(`comparator.fields.${field}`) });
}

// The rubric's first column ("Type de compte", "Opération", "Carte"...).
export const labelHeader = (t, themeKey) => t(`comparator.labelHeaders.${themeKey}`);

export const isNotFound = (error) => error instanceof ApiError && error.status === 404;

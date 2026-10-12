import { algorithmById, formulaById } from '../../constants/finance.js';

// The client's own columns for a formula, so an interface can explain a result
// in the client's wording instead of paraphrasing it. An algorithm (ALG-xx) has
// a name and a rule but no "condition" column in the client's workbook, and
// `condition: null` says that plainly rather than inventing a sentence.
//
// Shared by every controller that returns contract answers (P4-10, P4-12,
// P6-03, P6-04): one definition, so two screens cannot explain the same
// formula differently.
export function describeFormula(id) {
  const formula = formulaById(id);
  if (formula) {
    return { id, label: formula.label, rule: formula.rule, condition: formula.condition, unit: formula.unit, version: formula.version };
  }
  const algorithm = algorithmById(id);
  return { id, label: algorithm.label, rule: algorithm.rule, condition: null, unit: 'composite', version: algorithm.version };
}

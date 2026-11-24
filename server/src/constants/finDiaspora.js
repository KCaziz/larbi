// P13-05, lot E (2026-11-24): the diaspora (PUB-10) — screens ECR-0372 to
// ECR-0381, decisions DEC-016 and DEC-018, conventions CNV-13 and CNV-14.
//
// FINCLUDIA follows and proves; it moves no money (DEC-016). An expense is
// declared, then justified, then validated by ANOTHER person (DEC-018); a
// project is shared with one member, for a purpose, until a date (CNV-14).

export const PROJECT_NATURES = ['construction', 'immobilier', 'agriculture', 'commerce', 'industrie', 'services', 'autre'];
export const PROJECT_STATUSES = ['planned', 'active', 'done', 'cancelled'];
export const MILESTONE_STATUSES = ['planned', 'declared', 'accepted', 'rejected'];
export const EXPENSE_STATUSES = ['to_justify', 'submitted', 'validated', 'rejected'];
export const SHARE_ACCESS = ['read', 'contribute'];

export const HOLDING_KINDS = ['asset', 'debt'];
export const HOLDING_CATEGORIES = ['immobilier', 'terrain', 'compte', 'placement', 'entreprise', 'vehicule', 'pret', 'autre'];
// ECR-0372: declared, estimated and verified are never mixed up.
export const VALUATION_MODES = ['declared', 'estimated', 'verified'];

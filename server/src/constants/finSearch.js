// Global search (P6-20), screen C22, onglet « 12_Recherche ». Lexical search
// plus a configured synonym list — never a generative interpretation of the
// query, which the client explicitly forbids.
//
// This list is OURS, not the client's: the workbook asks for "synonymes
// configurés" without naming them, so these are a declared, editable
// starting set — the same kind of reserve as the payment-methods list
// (P6-04) — rather than left empty until the client supplies one.
// Keyed by the NORMALISED form (no accent, lower case — see `normalise` in
// finSearch.service.js), since that is how an incoming query is looked up;
// the values are kept in their ordinary written French, since those are what
// actually gets compared against stored text.
export const SEARCH_SYNONYMS = {
  depense: ['achat', 'paiement', 'sortie'],
  revenu: ['salaire', 'paie', 'rentrée'],
  objectif: ['but', 'projet', 'épargne'],
  dette: ['crédit', 'emprunt', 'prêt'],
  budget: ['enveloppe', 'plafond'],
  reserve: ['sécurité', 'coussin'],
  partage: ['coloc', 'espace', 'commun'],
};

export const SEARCH_CATEGORIES = ['actions', 'mesDonnees', 'objectifs', 'apprendre', 'explorer'];

// "Explorer" (comparateur bancaire, offres d'emploi) is not wired into the
// global search yet: both already exist as their own public tools with their
// own access rules (P4-06 à P4-13), and merging them here is a connection to
// build deliberately, not to improvise alongside the rest of this task.
export const EXPLORER_BLOCKED = { reason: 'notWiredYet' };

export const SEARCH_RESULTS_MAX = 20;

// P9-16 — la correspondance directe entre les 19 catégories communes (COLC-nn,
// présélection ergonomique) et les 125 catégories du référentiel (P8-08).
//
// Le client demande une correspondance directe mais n'en donne pas la table
// (réponse F du 2026-11-02) : celle-ci est NOTRE PROPOSITION, à lui faire
// valider (voir TASKS.md, P9-16). Elle ne retire rien : on peut toujours
// choisir n'importe laquelle des 125 catégories ; les budgets, rapports et
// alertes continuent de regrouper par les 19.

export const COLLECTIVE_REFERENCE_MAP = {
  'COLC-01': 'fixed.loyer',
  'COLC-02': 'variable.alimentation_boissons',
  'COLC-03': 'fixed.electricite',
  'COLC-04': 'fixed.gaz',
  'COLC-05': 'fixed.eau',
  'COLC-06': 'fixed.internet',
  'COLC-07': 'variable.produits_menagers',
  'COLC-08': 'variable.petit_equipement',
  'COLC-09': 'variable.transport_public',
  'COLC-10': 'variable.activites_enfant',
  'COLC-11': 'variable.medecin',
  'COLC-12': 'variable.scolarite_enfant',
  'COLC-13': 'fixed.streaming_video',
  'COLC-14': 'variable.sorties',
  'COLC-15': 'variable.hebergement',
  'COLC-16': 'variable.autre_depense_variable',
  'COLC-17': 'variable.alimentation_animal',
  'COLC-18': 'variable.cadeau_offert',
  'COLC-19': 'variable.autre_depense_variable',
};

// Le chemin inverse : une catégorie du référentiel choisie seule range la
// dépense dans la présélection qui la porte (« Autre » pour la catégorie
// partagée par « Projet commun » et « Autre »). Les autres catégories n'ont
// pas de présélection : rien n'est deviné.
const REVERSE = new Map(Object.entries(COLLECTIVE_REFERENCE_MAP).map(([colc, key]) => [key, colc]));

export const collectiveOfReference = (referenceKey) => REVERSE.get(referenceKey) ?? null;
export const referenceOfCollective = (colc) => COLLECTIVE_REFERENCE_MAP[colc] ?? null;

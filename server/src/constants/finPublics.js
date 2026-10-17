// The 8 FINCLUDIA publics (P3-18), taken as-is from the client's own file
// (FINCLUDIA_Cahier_des_Charges_Complet.xlsx, onglet "01_Publics"): codes,
// labels, experience names and missions are the client's, not invented.
export const FIN_PUBLICS = [
  { code: 'LYC', label: 'Lycéen', experience: 'FINCLUDIA Avenir', mission: 'Apprendre à gérer une ressource et préparer les étapes suivantes.' },
  { code: 'ETU', label: 'Étudiant', experience: 'FINCLUDIA Campus', mission: 'Piloter ressources, dépenses, études, réserve et transition vers l’emploi.' },
  { code: 'JAC', label: 'Jeune actif', experience: 'FINCLUDIA Premier Revenu', mission: 'Transformer le premier salaire en stabilité financière.' },
  { code: 'SAL', label: 'Salarié', experience: 'FINCLUDIA Mon Argent', mission: 'Piloter budget, sécurité, dettes, projets et patrimoine.' },
  { code: 'COL', label: 'Colocataire', experience: 'FINCLUDIA Colocation', mission: 'Gérer les dépenses communes sans exposer les finances privées.' },
  { code: 'COU', label: 'Couple', experience: 'FINCLUDIA Couple', mission: 'Organiser les finances communes et les objectifs partagés.' },
  { code: 'FAM', label: 'Famille', experience: 'FINCLUDIA Famille', mission: 'Piloter le foyer, les enfants, les dépenses annuelles et les projets.' },
  { code: 'EPG', label: 'Épargnant débutant', experience: 'FINCLUDIA Épargne & Investissement', mission: 'Sécuriser, épargner, comprendre le risque et pratiquer en fictif.' },
];

export const FIN_PUBLIC_CODES = FIN_PUBLICS.map((p) => p.code);
export const finPublicByCode = (code) => FIN_PUBLICS.find((p) => p.code === code) ?? null;

// L'âge de la majorité civile, et il n'est pas 18 (P6-22, chantier 1).
//
// Le référentiel maître du client le dit explicitement : **19 ans révolus en
// Algérie, article 40 du Code civil** (onglets `19_Mineurs` et `25_Constantes`,
// clé `ADULT_AGE`). Le projet avait supposé 18 — l'habitude française — et
// cette supposition décidait qui pouvait voir ses dettes, son patrimoine réel
// et une préparation de financement. Une personne de 18 ans y avait accès
// alors qu'elle est mineure au regard du droit algérien.
//
// 13 ans est l'autre seuil, et le client prend soin de dire que c'est une
// **politique FINCLUDIA**, pas un âge légal de consentement numérique
// (`YOUTH_MIN_AGE`) : en dessous, pas de compte autonome ; entre 13 et 18, un
// compte jeune qui suppose le consentement vérifié du représentant légal
// (loi 18-07, article 8).
export const ADULT_AGE = 19;
export const YOUTH_MIN_AGE = 13;

// Tranche d'âge, jamais une date de naissance (règle 10, minimisation) : le
// serveur n'a besoin de savoir que de quel côté de la majorité se trouve le
// compte.
//
// Les bornes suivent celles du client : `under13` (pas de compte autonome
// prévu), `13-18` (compte jeune), puis les tranches adultes à partir de 19.
export const FIN_AGE_RANGES = ['under13', '13-18', '19-24', '25-34', '35-49', '50-64', '65plus'];

// Les tranches qui ne sont PAS majeures. Écrites en clair plutôt que déduites
// d'une comparaison de chaînes : c'est la liste qu'on relit quand on doute,
// et une tranche ajoutée plus tard sera adulte par oubli si elle n'est pas
// nommée ici — l'erreur se ferait dans le sens qui ouvre des droits.
export const MINOR_AGE_RANGES = ['under13', '13-18'];

// true = peut utiliser les fonctions réservées aux adultes, false = ne peut
// pas, null = inconnu (une tranche non renseignée est traitée comme « ne peut
// pas » par requireAdult : refus par défaut).
export function isAdultAgeRange(ageRange) {
  if (!ageRange) return null;
  return !MINOR_AGE_RANGES.includes(ageRange);
}

// Ce qu'un compte jeune (13-18) peut faire, d'après `19_Mineurs`. Déclaré ici
// pour que les refus puissent citer la règle au lieu de dire seulement non.
export const YOUTH_ALLOWED =
  'Budget réel, enveloppes, objectifs, éducation, quiz, sécurité numérique, simulation pédagogique et portefeuille fictif.';
export const YOUTH_FORBIDDEN =
  'Préparation de crédit réel, mise en relation de financement, dette personnelle à finalité de financement, comparateurs avec contact commercial, patrimoine d’investissement réel et toute démarche contractuelle.';

// Versioned consent texts (P6-01 point 9, decided 2026-10-11: written by the
// team, not the client). Bumping VERSION makes every previously accepted
// consent stale — see services/finProfile.service.js.
export const FIN_CONSENT_TEXTS = {
  finNoAdvice: {
    version: '1',
    fr: "FINCLUDIA affiche des calculs, des définitions et des pistes à explorer. Rien de ce qui est affiché ne constitue un conseil financier réglementé, une offre ferme ou une promesse d'obtention : chaque chiffre indique la formule et les hypothèses utilisées, à vérifier auprès d'un professionnel avant toute décision.",
  },
  finPrivacy: {
    version: '1',
    fr: "Les données financières saisies dans FINCLUDIA (revenus, dépenses, objectifs...) appartiennent à votre compte : elles ne sont jamais lues par un autre utilisateur sans votre accord explicite dans un espace partagé. Une demande de suppression de compte efface ces données de façon complète et définitive, sans délai de conservation supplémentaire.",
  },
};

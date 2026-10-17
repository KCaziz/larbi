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

// Age bracket, not a birth date (rule 10, minimisation): the server only ever
// needs to know whether someone is under 18 — the 18+ gate is already settled
// project-wide. The exact minimum age to REGISTER, and parental consent, are
// still open (P6-01 point 7): this list is ready for both once answered.
export const FIN_AGE_RANGES = ['under18', '18-24', '25-34', '35-49', '50-64', '65plus'];

// true = may use functions reserved to adults, false = may not, null = unknown
// (an unset bracket is treated as "may not" by requireAdult: deny by default).
export function isAdultAgeRange(ageRange) {
  if (!ageRange) return null;
  return ageRange !== 'under18';
}

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

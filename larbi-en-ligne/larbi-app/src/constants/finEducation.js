// The educational layer (P8-17) — « la seule couche véritablement différente
// selon le profil » (consolidated specification, tab 22_Formation_Progression;
// last file, tab 16_Education). The words are the client's; a profile shapes
// what is recommended to learn, never what the budget management shows.
//
// A parcours is a formation of the catalogue at an agreed address
// (`parcours.slug`): its courses, quizzes and certificate are the ones the
// e-learning already serves (P2-01 to P2-05), certificate verification
// included. The client writes the contents (his answer E, 2026-10-28); until
// a parcours is published, the screens say it is being prepared.
export const EDUCATION_PROFILES = [
  {
    code: 'LYC',
    contents: ['Argent', 'budget', 'sécurité numérique', 'banque', 'épargne', 'études', 'premier salaire'],
    parcours: { key: 'avenir', slug: 'parcours-avenir', name: 'Avenir', kind: 'Missions courtes' },
    progression: 'Quiz + badges',
    certificate: 'Certificat pédagogique de parcours Avenir',
  },
  {
    code: 'ETU',
    contents: ['Budget études', 'autonomie', 'aides', 'premier emploi', 'fiche de paie'],
    parcours: { key: 'campus', slug: 'parcours-campus', name: 'Campus', kind: 'Campus' },
    progression: 'Quiz + simulations',
    certificate: 'Certificat pédagogique Campus',
  },
  {
    code: 'JAC',
    contents: ['Premier salaire', 'réserve', 'dettes', 'projets', 'financement'],
    parcours: { key: 'premier-revenu', slug: 'parcours-premier-revenu', name: 'Premier Revenu', kind: 'Premier Revenu' },
    progression: 'Missions pratiques',
    certificate: 'Certificat Premier Revenu',
  },
  {
    code: 'SAL',
    contents: ['Pilotage mensuel', 'objectifs', 'dette', 'patrimoine', 'retraite'],
    parcours: { key: 'mon-argent', slug: 'parcours-mon-argent', name: 'Mon Argent', kind: 'Mon Argent' },
    progression: 'Cas pratiques',
    certificate: 'Certificat Pilotage financier personnel',
  },
  {
    code: 'EPG',
    contents: ['Inflation', 'épargne', 'risque', 'diversification', 'portefeuille fictif'],
    parcours: { key: 'epargne', slug: 'parcours-epargne-investissement', name: 'Épargne & Investissement', kind: 'Épargne & Investissement' },
    progression: 'Laboratoire fictif',
    certificate: 'Certificat pédagogique Épargne',
  },
  {
    code: 'AUT',
    contents: ['Bibliothèque complète', 'recommandations éditoriales selon besoins saisis'],
    parcours: null,
    progression: 'Parcours personnalisé sans restriction fonctionnelle',
    certificate: null,
  },
];

export const educationProfileByCode = (code) => EDUCATION_PROFILES.find((row) => row.code === code) ?? null;
export const EDUCATION_SOURCE = 'FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#22_Formation_Progression ; FINCLUDIA_Gestion_Budgetaire_Personnelle_Centralisee.xlsx#16_Education';

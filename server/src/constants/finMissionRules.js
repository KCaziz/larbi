// The mandatory missions V1 and the rules of certification (P8-34, client's
// answer E of 2026-11-02). TITLES AND RULES ONLY: the texts of the missions,
// their quizzes and the final case are the client's to supply, and none of them
// is written here.
//
// A parcours (finEducation.js) is a formation of the e-learning; a mission is
// one of its lessons, graded by the quiz that goes with it (Quiz.passingScore).

export const MISSION_PASS_PERCENT = 70;
export const SECURITY_MODULE_PASS_PERCENT = 80;
export const CERTIFICATE_AVERAGE_PERCENT = 75;

// `security: true` marks a module of digital security (80 % to pass, and it
// must be finished to get the certificate). Only the titles the client wrote
// with « sécurité » in them are marked; the others are not guessed.
export const MISSION_CATALOGUE = {
  avenir: {
    profile: 'LYC',
    certification: 'Passeport Avenir — Bases financières',
    missions: [
      { key: 'avenir-01', title: 'Besoin ou envie ?' },
      { key: 'avenir-02', title: 'Construire mon premier budget' },
      { key: 'avenir-03', title: 'Transformer une envie en objectif' },
      { key: 'avenir-04', title: 'Comprendre compte, CCP, carte et paiement' },
      { key: 'avenir-05', title: 'Sécurité financière numérique', security: true },
      { key: 'avenir-06', title: 'Comprendre le crédit sans emprunter' },
      { key: 'avenir-07', title: 'Simuler mon premier salaire' },
      { key: 'avenir-08', title: 'Découvrir épargne, risque et portefeuille fictif' },
    ],
    challenge: ['créer une ressource', 'réaliser un budget', 'créer un objectif', 'identifier une tentative de fraude', 'tester un crédit pédagogique', 'construire un premier portefeuille fictif'],
  },
  'mon-argent': {
    profile: 'SAL',
    certification: 'Pilotage financier personnel — Niveau fondamental',
    missions: [
      { key: 'mon-argent-01', title: 'Lire et analyser mon mois' },
      { key: 'mon-argent-02', title: 'Comprendre ma fiche de paie' },
      { key: 'mon-argent-03', title: 'Maîtriser abonnements et dépenses récurrentes' },
      { key: 'mon-argent-04', title: 'Construire ma sécurité financière et tester un choc' },
      { key: 'mon-argent-05', title: 'Comprendre mes dettes et choisir une stratégie' },
      { key: 'mon-argent-06', title: 'Planifier mes objectifs de long terme' },
      { key: 'mon-argent-07', title: 'Construire mon patrimoine net' },
      { key: 'mon-argent-08', title: 'Simuler logement, retraite, inflation et décisions de long terme' },
    ],
    challenge: ['clôturer un mois', 'pointer ses opérations', 'analyser son rapport', 'créer son fonds d’urgence', 'déclarer ses dettes', 'tester deux stratégies', 'construire son patrimoine', 'simuler un projet long terme'],
  },
  epargne: {
    profile: 'EPG',
    certification: 'Épargne & Investissement — Bases pédagogiques',
    missions: [
      { key: 'epargne-01', title: 'Suis-je prêt à épargner ou investir ?' },
      { key: 'epargne-02', title: 'Définir objectif et horizon' },
      { key: 'epargne-03', title: 'Intérêt simple et intérêt composé' },
      { key: 'epargne-04', title: 'Inflation et rendement réel' },
      { key: 'epargne-05', title: 'Risque, volatilité, perte et liquidité' },
      { key: 'epargne-06', title: 'Comprendre les grandes classes d’actifs' },
      { key: 'epargne-07', title: 'Diversification et concentration' },
      { key: 'epargne-08', title: 'Construire un portefeuille fictif' },
      { key: 'epargne-09', title: 'Comparer deux placements' },
      { key: 'epargne-10', title: 'Tenir un journal de décisions et faire une revue' },
    ],
    challenge: ['diagnostic', 'objectif', 'simulation d’intérêts', 'inflation', 'profil pédagogique de risque', 'portefeuille fictif', 'comparaison', 'revue du journal'],
  },
};

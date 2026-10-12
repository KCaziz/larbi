// Progressive financial onboarding (P6-03). The questions are the client's own,
// screen by screen (onglet `06_Champs_Inputs`): C03 "Onboarding financier
// progressif" for every public, plus the dedicated screens LY01 (lycéen), ET01
// (étudiant), SA01 (salarié) and EP01 (épargnant débutant). Nothing is asked
// that the client did not list, and nothing it listed is dropped.
//
// Each question declares:
//   key        stable identifier, used by the API and the answers record
//   screen     the client's screen it comes from, so it can be traced back
//   publics    which FINCLUDIA publics are asked (null = every public, C03)
//   adultsOnly a question about DEBT or REAL PATRIMONY. The client's rule for a
//              lycéen is « jamais de dette, de patrimoine réel ni d'offre de
//              crédit », so these are never asked of the lycéen experience nor
//              of anyone whose age bracket says under 18 — whichever public
//              they picked.
//   role       what the answer IS, independently of which screen asks it. The
//              client's dedicated screens REFINE the common C03 socle rather
//              than adding to it: a salarié is asked SA01's « charges fixes »
//              INSTEAD of C03's « dépenses essentielles estimées », never both,
//              because both are the same money and totalling them would count
//              it twice.
//   kind       'resource'  a recurring resource -> becomes a real FinIncome row
//              'expense'   a recurring essential charge -> estimated amount
//              'amount'    a one-off amount (savings, debt, goal target)
//              'text'      a short free answer
//              'choice'    one value from `options`
//   category   key of a STANDARD category (constants/finCategories.js) the
//              answer belongs to — never guessed from the wording at runtime
//   why        the answer to "Pourquoi cette question ?", which the client
//              requires on every question. Written by the team (same rule as
//              the glossary of P2-08): factual, never moralising.
//
// Every question is skippable: the client's own buttons are « Passer »,
// « Pourquoi cette question ? » and « Enregistrer et quitter ». An onboarding
// that cannot be left half-done is an onboarding people abandon for good.

export const ONBOARDING_QUESTION_KINDS = ['resource', 'expense', 'amount', 'text', 'choice'];

// The public of the client's own minors' experience (LY01).
export const MINOR_PUBLIC = 'LYC';

// Knowledge level (LY01 "niveau de connaissance"). Three steps, ours, and only
// used to choose what to explain first — never to restrict anything. The real
// knowledge index is P2-09, whose weightings the client still owes (P6-01).
export const KNOWLEDGE_LEVELS = ['beginner', 'intermediate', 'advanced'];

export const ONBOARDING_QUESTIONS = [
  // ---- C03, every public ---------------------------------------------------
  {
    key: 'resources', role: 'resources',
    screen: 'C03',
    publics: null,
    kind: 'resource',
    category: 'income.autre_revenu',
    why: 'Sans vos ressources, aucun budget ne peut être calculé : tout le reste en découle. Une seule ressource suffit pour commencer.',
  },
  {
    key: 'essentialExpenses', role: 'essentialExpenses',
    screen: 'C03',
    publics: null,
    kind: 'expense',
    category: 'fixed.autre_charge_fixe',
    why: "Une estimation de vos dépenses essentielles permet de calculer ce qu'il vous reste chaque mois. Une approximation suffit : elle se corrige ensuite.",
  },
  {
    key: 'savings', role: 'savings',
    screen: 'C03',
    publics: null,
    // Real patrimony: never asked of a minor (the client's rule).
    adultsOnly: true,
    kind: 'amount',
    category: 'asset.compte_d_epargne',
    why: "L'épargne déjà disponible sert à mesurer combien de temps vous pourriez tenir en cas d'imprévu. Elle n'est jamais partagée avec qui que ce soit.",
  },
  {
    key: 'debtPayment', role: 'debt',
    screen: 'C03',
    publics: null,
    // The client is explicit: a lycéen is never asked about debt.
    adultsOnly: true,
    kind: 'amount',
    category: 'debt.autre_dette',
    why: "Le total de vos mensualités de dette sert à calculer votre taux d'effort. Aucun jugement n'est porté sur le fait d'avoir une dette.",
  },
  {
    key: 'mainGoal', role: 'goal',
    screen: 'C03',
    publics: null,
    kind: 'choice',
    category: 'goal.autre',
    // The goal families of the client's own reference, so the answer is a real
    // category and not a free-text label nothing can use.
    options: [
      'goal.reserve_de_securite',
      'goal.etudes',
      'goal.ordinateur_equipement',
      'goal.permis',
      'goal.mobilite_stage',
      'goal.voyage',
      'goal.mariage',
      'goal.voiture',
      'goal.logement',
      'goal.enfant_etudes_enfant',
      'goal.retraite',
      'goal.projet_personnel',
      'goal.epargne_investissement',
      'goal.autre',
    ],
    why: "Un objectif principal permet de montrer l'effet de vos choix sur quelque chose qui compte pour vous, au lieu d'un chiffre abstrait.",
  },
  { key: 'goalAmount', role: 'goalAmount', screen: 'C03', publics: null, kind: 'amount', category: 'goal.autre', why: 'Le montant visé permet de calculer en combien de temps vous y arrivez. Vous pouvez le laisser vide et le fixer plus tard.' },

  // ---- LY01, lycéen --------------------------------------------------------
  // No debt, no real patrimony, no credit offer: the client's rule for a minor.
  {
    key: 'schoolLevel', role: 'profile',
    screen: 'LY01',
    publics: ['LYC'],
    kind: 'text',
    category: null,
    why: 'Votre classe sert seulement à choisir les exemples et les explications les plus proches de votre situation.',
  },
  {
    key: 'pocketMoney', role: 'resources',
    screen: 'LY01',
    publics: ['LYC'],
    kind: 'resource',
    category: 'income.aide_familiale',
    why: "L'argent dont vous disposez, même petit et irrégulier, suffit pour apprendre à le répartir. La fréquence est demandée parce qu'une somme par semaine et la même par mois ne veulent pas dire la même chose.",
  },
  {
    key: 'knowledgeLevel', role: 'knowledge',
    screen: 'LY01',
    publics: ['LYC'],
    kind: 'choice',
    category: null,
    options: KNOWLEDGE_LEVELS,
    why: "Votre réponse sert à choisir par quoi commencer les explications. Elle ne limite l'accès à rien.",
  },

  // ---- ET01, étudiant ------------------------------------------------------
  { key: 'grant', role: 'resources', screen: 'ET01', publics: ['ETU'], kind: 'resource', category: 'income.bourse', why: 'La bourse est souvent versée à une fréquence qui n’est pas mensuelle : la préciser évite de compter trop, ou trop peu, chaque mois.' },
  { key: 'familyHelp', role: 'resources', screen: 'ET01', publics: ['ETU'], kind: 'resource', category: 'income.aide_familiale', why: "L'aide familiale fait partie de vos ressources, même si elle est irrégulière." },
  { key: 'studentJob', role: 'resources', screen: 'ET01', publics: ['ETU'], kind: 'resource', category: 'income.job_etudiant', why: 'Un job étudiant change ce que vous pouvez prévoir : sa fréquence compte autant que son montant.' },
  { key: 'freelance', role: 'resources', screen: 'ET01', publics: ['ETU'], kind: 'resource', category: 'income.freelance_mission', why: 'Un revenu de mission est irrégulier par nature : la fréquence déclarée sert à le ramener à un montant mensuel comparable.' },
  { key: 'housing', role: 'essentialExpenses', screen: 'ET01', publics: ['ETU'], kind: 'expense', category: 'fixed.loyer', why: 'Le logement est en général la plus grosse charge fixe : il pèse le plus sur ce qu’il vous reste.' },
  { key: 'transport', role: 'essentialExpenses', screen: 'ET01', publics: ['ETU'], kind: 'expense', category: 'fixed.transport_recurrent', why: 'Le transport récurrent est une charge qu’on oublie souvent d’estimer alors qu’elle revient chaque mois.' },
  { key: 'food', role: 'essentialExpenses', screen: 'ET01', publics: ['ETU'], kind: 'expense', category: 'variable.alimentation_boissons', why: 'L’alimentation est la dépense la plus variable : une estimation moyenne suffit pour commencer.' },
  { key: 'studies', role: 'essentialExpenses', screen: 'ET01', publics: ['ETU'], kind: 'expense', category: 'fixed.scolarite_etudes', why: 'Les frais d’études et de fournitures reviennent à des moments précis de l’année : les déclarer évite une mauvaise surprise.' },
  { key: 'phone', role: 'essentialExpenses', screen: 'ET01', publics: ['ETU'], kind: 'expense', category: 'fixed.telephone', why: 'Le téléphone et internet sont des abonnements : petits mais réguliers.' },

  // ---- SA01, salarié -------------------------------------------------------
  { key: 'netSalary', role: 'resources', screen: 'SA01', publics: ['SAL', 'JAC'], kind: 'resource', category: 'income.salaire_net', why: 'Le salaire NET est ce qui arrive réellement sur votre compte : c’est lui qui sert de base, pas le brut.' },
  { key: 'otherIncome', role: 'resources', screen: 'SA01', publics: ['SAL', 'JAC'], kind: 'resource', category: 'income.autre_revenu', why: 'Prime, revenu locatif, mission : tout ce qui entre compte, même ponctuellement.' },
  { key: 'fixedCharges', role: 'essentialExpenses', screen: 'SA01', publics: ['SAL', 'JAC'], kind: 'expense', category: 'fixed.autre_charge_fixe', why: 'Les charges fixes sont celles que vous ne pouvez pas décider de ne pas payer ce mois-ci : loyer, abonnements, assurances.' },
  { key: 'liquidSavings', role: 'savings', screen: 'SA01', publics: ['SAL', 'JAC', 'EPG'], adultsOnly: true, kind: 'amount', category: 'asset.compte_d_epargne', why: 'L’épargne disponible immédiatement est celle qui vous protège d’un imprévu. Les biens non liquides viendront plus tard.' },

  // ---- EP01, épargnant débutant -------------------------------------------
  { key: 'flexibleExpenses', role: 'flexibleExpenses', screen: 'EP01', publics: ['EPG'], kind: 'expense', category: 'variable.autre_depense_variable', why: 'Séparer les dépenses souples des dépenses essentielles montre la marge de manœuvre réelle, sans rien vous interdire.' },
];

export const ONBOARDING_QUESTION_KEYS = ONBOARDING_QUESTIONS.map((q) => q.key);
export const onboardingQuestionByKey = (key) => ONBOARDING_QUESTIONS.find((q) => q.key === key) ?? null;

// The questions asked to one public, in the client's order.
//
// A question with no `publics` belongs to the common C03 socle. It is asked to
// everyone EXCEPT where this public's own screen already covers the same role:
// SA01's « charges fixes » replaces C03's « dépenses essentielles estimées »
// for a salarié, and asking both would count the same money twice. A public
// nobody has yet (no profile chosen) gets exactly the socle.
export function questionsForPublic(publicCode, { minor = false } = {}) {
  // Debt and real patrimony are never asked of a minor, whichever public they
  // picked: the lycéen experience IS the minors' one, and an age bracket that
  // says under 18 settles it for anybody else.
  const allowed = ONBOARDING_QUESTIONS.filter((q) => !(q.adultsOnly && (minor || publicCode === MINOR_PUBLIC)));
  const own = allowed.filter((q) => q.publics !== null && publicCode && q.publics.includes(publicCode));
  const covered = new Set(own.map((q) => q.role));
  const socle = allowed.filter((q) => q.publics === null && !covered.has(q.role));
  // Back in the client's own order: the socle first, then the dedicated screen.
  return allowed.filter((q) => socle.includes(q) || own.includes(q));
}

// The question of a given role that this public is asked, or null. Used instead
// of naming a key: the key depends on the public, the role does not.
export const questionOfRole = (questions, role) => questions.find((q) => q.role === role) ?? null;

// The fictional starter budget the client offers a lycéen, in its own words
// (« commence avec 5 000 DA fictifs »). Stored in centimes, like every amount,
// and ALWAYS with the fictional status: it is never added to a real total.
export const FICTIONAL_START = { amount: 500000, currency: 'DZD' };

// An answer so far from the others that it is probably a typo — a resource a
// hundred times the declared expenses, or the reverse. The client's rule is
// explicit: « incohérence au-delà d'un seuil -> demande de confirmation, jamais
// de blocage silencieux ». So this is a RATIO that triggers a question, never a
// refusal, and the person can confirm and move on.
export const INCONSISTENCY_RATIO = 100;

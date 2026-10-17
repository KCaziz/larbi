// Seuils d'alertes du référentiel maître (P6-22, chantier 4), transcrits de
// l'onglet `13_Alertes` et recoupés avec `25_Constantes`.
//
// Plusieurs de ces seuils étaient DÉJÀ codés et tombent juste — l'enveloppe à
// 80 % et à 100 % (P6-05), la fenêtre de rappel à J-7 (P6-07). Les transcrire
// ici ne les change pas : cela leur donne une source. Un seuil qui coïncide
// par hasard avec le document du client et un seuil qui en vient ne se
// relisent pas de la même façon le jour où le client en change un.
//
// LES MESSAGES SONT CEUX DU CLIENT, mot pour mot. Ce sont des phrases qui
// s'adressent à quelqu'un sur sa situation financière ; les reformuler, c'est
// changer le ton d'une alerte, et le ton est la moitié du message.
//
// Les niveaux sont ceux de la colonne « Niveau » de l'onglet, du plus calme au
// plus pressant. Ils ne sont pas une invention du produit.
export const ALERT_LEVELS = ['information', 'surveillance', 'avertissement', 'prioritaire', 'critique'];

const alert = (key, { family, level, message, threshold = null, needs = null, note = null }) => ({
  key,
  family,
  level,
  message,
  threshold,
  // Ce qui doit exister pour que cette alerte puisse seulement se poser. Une
  // alerte sans producteur n'est pas « désactivée » : elle attend une mesure
  // que personne ne calcule encore, et le dire évite de la croire couverte.
  needs,
  note,
});

export const ALERT_RULES = [
  // ---- budget ------------------------------------------------------------
  alert('envelope_warning', {
    family: 'budget',
    level: 'information',
    threshold: 0.8,
    needs: 'budget',
    message: 'Vous avez utilisé 80% de l’enveloppe X.',
  }),
  alert('envelope_exceeded', {
    family: 'budget',
    level: 'avertissement',
    threshold: 1,
    needs: 'budget',
    message: 'L’enveloppe X est dépassée.',
  }),
  alert('budget_projection', {
    family: 'budget',
    level: 'prioritaire',
    threshold: 1.1,
    needs: 'budget',
    message: 'Au rythme actuel, X dépassera le budget.',
  }),

  // ---- solde --------------------------------------------------------------
  alert('balance_negative_projection', {
    family: 'solde',
    level: 'prioritaire',
    threshold: 0,
    needs: 'projection',
    message: 'Votre mois est projeté en déficit.',
  }),
  alert('balance_deficit_large', {
    family: 'solde',
    level: 'critique',
    threshold: 0.1,
    needs: 'projection',
    message: 'Le déficit projeté dépasse 10% de vos ressources.',
  }),

  // ---- réserve ------------------------------------------------------------
  alert('reserve_critical', {
    family: 'reserve',
    level: 'critique',
    threshold: 1,
    needs: 'reserve',
    message: 'Votre réserve couvre moins d’un mois de dépenses essentielles.',
  }),
  alert('reserve_below_target', {
    family: 'reserve',
    level: 'surveillance',
    // Pas un nombre : la cible dépend du profil (grille A, `12_Reserve`), et
    // écrire 3 ici la figerait pour tout le monde.
    threshold: 'cible_profil',
    needs: 'reserve',
    message: 'Votre réserve est sous la cible choisie.',
  }),

  // ---- dette --------------------------------------------------------------
  alert('dsr_watch', {
    family: 'dette',
    level: 'surveillance',
    threshold: 0.3,
    needs: 'debts',
    message: 'La part des mensualités devient importante.',
    note: 'Pour un crédit à la consommation, ce seuil est aussi le plafond légal (article 16 du décret 15-114).',
  }),
  alert('dsr_high', {
    family: 'dette',
    level: 'prioritaire',
    threshold: 0.4,
    needs: 'debts',
    message: 'Votre marge budgétaire après dettes se réduit fortement.',
  }),
  alert('dsr_critical', {
    family: 'dette',
    level: 'critique',
    threshold: 0.5,
    needs: 'debts',
    message: 'Plus de la moitié du revenu est engagée dans les mensualités.',
  }),

  // ---- objectifs ----------------------------------------------------------
  alert('goal_behind', {
    family: 'objectif',
    level: 'avertissement',
    threshold: 0.1,
    needs: 'goals',
    message: 'Votre objectif prend du retard.',
  }),
  alert('goal_far_behind', {
    family: 'objectif',
    level: 'prioritaire',
    threshold: 0.25,
    needs: 'goals',
    message: 'L’objectif est nettement hors trajectoire.',
  }),

  // ---- échéances ----------------------------------------------------------
  alert('debt_due_soon', {
    family: 'echeance',
    level: 'information',
    threshold: 3,
    needs: 'debts',
    message: 'Échéance dans 3 jours.',
  }),
  alert('debt_overdue', {
    family: 'echeance',
    level: 'critique',
    threshold: -1,
    needs: 'debts',
    message: 'Échéance dépassée : mettez à jour le statut.',
  }),

  // ---- fraîcheur des données ---------------------------------------------
  // Le client distingue les durées PAR TYPE de donnée, et c'est le point que
  // le produit traitait d'un seul seuil : une valeur de patrimoine vieille de
  // trois mois n'est pas inquiétante, un revenu de trois mois l'est.
  alert('stale_income_debt', {
    family: 'fraicheur',
    level: 'surveillance',
    threshold: 90,
    needs: 'quality',
    message: 'Mettez à jour cette donnée avant une simulation de financement.',
  }),
  alert('stale_assets', {
    family: 'fraicheur',
    level: 'information',
    threshold: 180,
    needs: 'wealth',
    message: 'Valeur patrimoniale ancienne.',
  }),
  alert('stale_monthly', {
    family: 'fraicheur',
    level: 'information',
    threshold: 31,
    needs: 'quality',
    message: 'Cette donnée mensuelle n’a pas été actualisée depuis plus d’un mois.',
  }),

  // ---- offres bancaires ---------------------------------------------------
  alert('offer_review', {
    family: 'offre',
    level: 'surveillance',
    threshold: 30,
    needs: 'offers',
    message: 'Offre à revalider.',
    note: 'Masquée du classement principal au-delà de ce délai.',
  }),
  alert('offer_exclude', {
    family: 'offre',
    level: 'avertissement',
    threshold: 90,
    needs: 'offers',
    message: 'Conditions à revérifier : cette offre sort du classement.',
  }),
];

export const alertRule = (key) => ALERT_RULES.find((row) => row.key === key) ?? null;
export const alertsOfFamily = (family) => ALERT_RULES.filter((row) => row.family === family);

// Les constantes nommées de `25_Constantes`, avec le statut que le client leur
// donne : « FINCLUDIA » pour une politique interne, un texte légal sinon. La
// distinction compte — une politique interne se change par décision, une règle
// légale se change par décret.
export const ALERT_CONSTANTS = [
  { key: 'CONSUMER_DSR_HARD_MAX', value: 0.3, status: 'Décret 15-114 art. 16' },
  { key: 'DEBT_WATCH', value: 0.2, status: 'FINCLUDIA' },
  { key: 'EMERGENCY_CRITICAL_MONTHS', value: 1, status: 'FINCLUDIA' },
  { key: 'EMERGENCY_STANDARD_MONTHS', value: 3, status: 'FINCLUDIA' },
  { key: 'EMERGENCY_ROBUST_MONTHS', value: 6, status: 'FINCLUDIA' },
  { key: 'ENVELOPE_WARNING', value: 0.8, status: 'FINCLUDIA' },
  { key: 'ENVELOPE_EXCEEDED', value: 1, status: 'FINCLUDIA' },
  { key: 'USER_DATA_STALE_DAYS', value: 30, status: 'FINCLUDIA' },
  { key: 'BANK_OFFER_REVIEW_DAYS', value: 30, status: 'FINCLUDIA' },
  { key: 'BANK_OFFER_EXCLUDE_DAYS', value: 60, status: 'FINCLUDIA' },
  { key: 'SCORE_MIN_CONFIDENCE', value: 0.6, status: 'FINCLUDIA' },
];

export const alertConstant = (key) => ALERT_CONSTANTS.find((row) => row.key === key) ?? null;

// Les divergences entre les deux tables du même onglet, signalées plutôt que
// tranchées en silence — le client garde « table structurée A » et « liste
// courte B » côte à côte, avec des seuils qui ne coïncident pas.
export const ALERT_DIVERGENCES = [
  {
    key: 'dsr_watch_level',
    subject: 'Seuil de vigilance sur le taux d’effort',
    chosen: '30 % (table A), aligné sur le plafond légal du crédit à la consommation.',
    alternative: 'La liste courte B place la vigilance à 20 %, et `25_Constantes` nomme ce seuil `DEBT_WATCH`.',
    why: 'Deux seuils coexistent pour deux usages : 20 % est un repère pédagogique, 30 % une limite légale. Le produit alerte à 30 % et garde 20 % comme repère affiché.',
  },
  {
    key: 'offer_exclude_days',
    subject: 'Délai d’exclusion d’une offre bancaire',
    chosen: '90 jours (table A : « désactiver le classement après 90 jours »).',
    alternative: '`25_Constantes` donne `BANK_OFFER_EXCLUDE_DAYS = 60`.',
    why: 'Les deux valeurs sont dans le même document. Celle de la table A est accompagnée de sa règle ; celle des constantes est seule.',
  },
  {
    key: 'stale_monthly_days',
    subject: 'Fraîcheur d’une donnée mensuelle',
    chosen: '31 jours (liste courte B : « après 31 jours sans actualisation »).',
    alternative: '`25_Constantes` donne `USER_DATA_STALE_DAYS = 30`.',
    why: 'Un écart d’un jour, mais 31 évite qu’une donnée saisie le 1er du mois soit déclarée périmée le 1er du mois suivant.',
  },
];

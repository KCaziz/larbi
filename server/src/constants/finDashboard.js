// The "Aujourd'hui" home screen and the dashboards per public (P6-06): the
// client's screens C04, LY02, ET02, JA02, SA02 and its tab `08_Tableaux_Bord`.
//
// The whole point of the screen is to answer « où j'en suis, que faire
// maintenant ? » in under ten seconds, so the counts below are HARD LIMITS, not
// suggestions: a dashboard that shows eleven indicators answers nothing.

// « 3 à 5 KPI » and « 1 à 3 actions au maximum » — the client's own numbers.
export const KPI_MIN = 3;
export const KPI_MAX = 5;
export const ACTIONS_MAX = 3;

// « Ma semaine » for the lycéen: « 1 alerte + 1 mission max ». A teenager's
// first screen is not a cockpit.
export const MINOR_ALERTS_MAX = 1;
export const MINOR_ACTIONS_MAX = 1;

// Beyond this, a figure is shown with the client's « bannière de qualité »: the
// data behind it is old enough that the person should look at it again. Measured
// by F055 (« âge donnée »). The client asks for « un seuil par type » and gives
// none, so this is OURS, declared as such, and it is an argument everywhere
// rather than a hidden constant.
export const DATA_AGE_WARNING_DAYS = 45;

// How far ahead the home screen looks for what is coming up. A week, because
// the question is "what do I do now", not "what does my year look like".
export const UPCOMING_DAYS = 7;

/**
 * Every KPI the dashboards can show, and what each one needs.
 *
 * `needs` is the module a KPI reads. A KPI whose module has no data yet does
 * NOT disappear: it becomes the client's « invitation à compléter », which is
 * why `invite` exists on each one. That is the difference between "we cannot
 * compute this" and "there is nothing here" — the first is an answer, the
 * second is a dead card.
 *
 * `formula` is the row of the client's catalogue the figure comes from, so the
 * « Pourquoi ? » panel explains it without a second source of truth. A KPI
 * built on no catalogue formula says `null` rather than borrowing an id.
 */
export const DASHBOARD_KPIS = [
  {
    key: 'netFlow',
    needs: 'money',
    formula: 'F004',
    invite: 'addMovement',
  },
  {
    key: 'monthlyResources',
    needs: 'money',
    formula: 'F002',
    invite: 'addIncome',
  },
  {
    key: 'monthExpenses',
    needs: 'money',
    formula: 'F003',
    invite: 'addMovement',
  },
  {
    key: 'remainingToAllocate',
    needs: 'budget',
    formula: 'F009',
    invite: 'createBudget',
  },
  {
    key: 'dailyBudget',
    needs: 'budget',
    formula: 'F012',
    invite: 'createBudget',
  },
  {
    key: 'reserveMonths',
    needs: 'reserve',
    formula: 'F014',
    invite: 'setReserve',
  },
  {
    key: 'goalProgress',
    needs: 'goals',
    formula: 'F025',
    invite: 'createGoal',
  },
  {
    key: 'debtEffort',
    needs: 'debts',
    formula: 'F018',
    invite: 'addDebt',
  },
  {
    key: 'studentAutonomy',
    needs: 'money',
    formula: 'F047',
    invite: 'addIncome',
  },
  {
    key: 'subscriptionCost',
    needs: 'calendar',
    formula: 'F049',
    invite: 'addRecurrence',
  },
  {
    key: 'savingsRate',
    needs: 'money',
    formula: 'F008',
    invite: 'addIncome',
  },
];

export const KPI_KEYS = DASHBOARD_KPIS.map((kpi) => kpi.key);
export const kpiByKey = (key) => DASHBOARD_KPIS.find((kpi) => kpi.key === key) ?? null;

/**
 * One dashboard per public, in the client's own order (tab `08_Tableaux_Bord`).
 *
 * `kpis` is a PREFERENCE ORDER, longer than KPI_MAX on purpose: the five shown
 * are the first five that resolve, so somebody who has a budget sees budget
 * figures and somebody who has not sees the next ones down instead of five
 * empty cards.
 *
 * `title` is an i18n key, never a sentence: the dashboards are translated like
 * everything else.
 */
export const DASHBOARDS = {
  // « Ma semaine » — 1 alerte + 1 mission max (the client's rule). No debt, no
  // real patrimony, no credit: a lycéen is never shown any of it (P6-03).
  LYC: { title: 'myWeek', kpis: ['monthExpenses', 'monthlyResources', 'goalProgress'], excludes: ['debts', 'reserve'], minor: true },
  // Étudiant: « budget / jour, autonomie F047 » — the client names both.
  ETU: { title: 'student', kpis: ['dailyBudget', 'studentAutonomy', 'monthExpenses', 'netFlow', 'goalProgress', 'reserveMonths'] },
  // Jeune actif: the first income, which is the allocation plan of JA03 / JA04.
  JAC: { title: 'firstIncome', kpis: ['remainingToAllocate', 'monthlyResources', 'savingsRate', 'reserveMonths', 'netFlow', 'goalProgress'] },
  // Salarié. The client asks for a « santé financière personnelle » here: a
  // weighted F053 score with visible weights, SEPARATE from any credit. It is
  // deliberately NOT in this list — see HEALTH_INDEX_BLOCKED below.
  SAL: { title: 'health', kpis: ['netFlow', 'remainingToAllocate', 'reserveMonths', 'debtEffort', 'savingsRate', 'subscriptionCost'] },
  COL: { title: 'flatshare', kpis: ['monthExpenses', 'netFlow', 'remainingToAllocate', 'monthlyResources', 'subscriptionCost'] },
  COU: { title: 'couple', kpis: ['netFlow', 'monthlyResources', 'remainingToAllocate', 'goalProgress', 'reserveMonths'] },
  FAM: { title: 'household', kpis: ['monthExpenses', 'netFlow', 'remainingToAllocate', 'reserveMonths', 'subscriptionCost', 'debtEffort'] },
  EPG: { title: 'savings', kpis: ['savingsRate', 'reserveMonths', 'goalProgress', 'netFlow', 'monthlyResources'] },
};

// The dashboard for somebody who has not picked a public yet. Not an error
// state: the money figures work without a public, and the screen says what
// choosing one would add.
export const DEFAULT_DASHBOARD = { title: 'general', kpis: ['netFlow', 'monthlyResources', 'monthExpenses', 'remainingToAllocate', 'goalProgress'] };

export const dashboardFor = (publicCode) => DASHBOARDS[publicCode] ?? DEFAULT_DASHBOARD;

/**
 * L'indice de santé financière n'est plus bloqué (P6-22, chantier 2).
 *
 * Il l'a été tant que les pondérations manquaient : « un score n'est pas un
 * chiffre que l'on peut vérifier, c'est un jugement porté sur quelqu'un », et
 * le publier sur des poids inventés était la chose que ce projet refusait.
 * Le référentiel maître du client les fournit — barème B, sept dimensions,
 * onglet `09_Sante_Poids` — et F053 y est désormais branché
 * (`services/finHealth.service.js`).
 *
 * Ce qui reste déclaré : le score est **partiel** tant que toutes les
 * dimensions ne sont pas mesurables, et il le dit.
 *
 * Et il n'est pas montré à un compte jeune. Le client exclut l'alerte adulte
 * sur la réserve d'un lycéen (« objectif éducatif, sans alerte adulte ») ; une
 * note globale « Priorité sécurité » affichée à un adolescent est le même
 * jugement d'adulte, porté sur un public dont le produit est pédagogique.
 */
export const HEALTH_INDEX_NOT_FOR_YOUTH = {
  formula: 'F053',
  reason: 'youth',
  detail: 'L’indice global n’est pas affiché à un compte jeune : le produit y est pédagogique, pas évaluatif.',
};

/**
 * The actions the home screen may propose, in priority order.
 *
 * The client's own priority is « sécurité > échéance > budget > apprentissage »
 * (stated for the notifications of P6-18, and the same order applies here
 * because it is the same question: what matters most right now).
 *
 * Each action is a link to a screen that exists. An action pointing at a module
 * that is not built would be worse than no action at all.
 */
export const DASHBOARD_ACTIONS = [
  { key: 'confirmPlanned', priority: 'echeance', to: '/calendrier', needs: 'calendar' },
  { key: 'envelopeExceeded', priority: 'budget', to: '/budget', needs: 'budget' },
  { key: 'buildReserve', priority: 'securite', to: '/reserve', needs: 'reserve' },
  { key: 'categoriseMovements', priority: 'budget', to: '/mon-argent', needs: 'money' },
  { key: 'finishOnboarding', priority: 'apprentissage', to: '/compte/premiers-pas', needs: 'onboarding' },
  { key: 'createBudget', priority: 'budget', to: '/budget', needs: 'budget' },
  { key: 'addMovement', priority: 'apprentissage', to: '/mon-argent', needs: 'money' },
];

export const ACTION_PRIORITIES = ['securite', 'echeance', 'budget', 'apprentissage'];

/**
 * What counts as a student's OWN income, for F047 (« autonomie financière
 * étudiant »).
 *
 * F047's condition in the client's catalogue is « Définition revenus personnels
 * versionnée » — it requires a definition, and it requires that definition to
 * be versioned. The client does not give one, so this is OURS, declared as
 * such and versioned here: income the person EARNS is personal, income they
 * RECEIVE from a grant, their family or an allowance is not.
 *
 * It is a reading, not a value judgement: somebody living on a grant is not
 * less autonomous as a person, the indicator simply measures how much of their
 * spending their own work covers. The answer carries this version so a figure
 * read today can still be explained if the definition ever changes.
 */
export const PERSONAL_INCOME_DEFINITION_VERSION = 1;
export const PERSONAL_INCOME_CATEGORY_KEYS = [
  'income.salaire_net',
  'income.job_etudiant',
  'income.stage_remunere',
  'income.freelance_mission',
  'income.prime',
  'income.revenu_locatif',
];
export const actionByKey = (key) => DASHBOARD_ACTIONS.find((action) => action.key === key) ?? null;

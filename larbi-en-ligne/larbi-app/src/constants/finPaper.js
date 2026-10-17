// Paper portfolio and investment workshop (P6-12): the client's screens C17 and
// EP03 to EP07, and F038 / F039 / F040 / F057.
//
// WHAT IS NOT HERE, AND WHY. The client's own rule for this task is
// « instruments et prix de référence : uniquement des données fournies ou
// validées par le client (P6-01) », and it has provided neither. So this file
// holds NO instrument catalogue and NO price: there is nothing to put in one
// that would not be invented.
//
// What exists instead is the workshop. The person names the instrument they
// want to practise with and states the simulated price themselves — that is
// their own simulation, not reference data the platform publishes. The day the
// client supplies a catalogue, it becomes a list to pick from and this comment
// is what explains why the field was free text before.

// The client's own default: « capital fictif modifiable (100 000 DA par
// défaut) ». In centimes, like every amount in the platform.
export const DEFAULT_PAPER_CAPITAL = 10_000_000;
export const PAPER_CAPITAL_MIN = 100_000;
export const PAPER_CAPITAL_MAX = 100_000_000_000;

// Simulated fees, as a rate of the traded amount. « Frais simulés » is the
// client's wording; the VALUE is ours, declared as such, and it is stored per
// portfolio so it is visible and editable rather than a hidden coefficient.
export const DEFAULT_PAPER_FEE_RATE = 0.01;
export const MAX_PAPER_FEE_RATE = 0.1;

// A fictional trade is a buy or a sell. Nothing else: there is « aucune
// exécution » — no order type, no leverage, no short.
export const PAPER_TRADE_KINDS = ['buy', 'sell'];

// THE status of everything in this task. A paper portfolio is fictional from
// end to end, it carries the permanent « SIMULATION » badge, and no value of it
// ever enters real patrimony (P6-11 forbids the reverse too).
export const PAPER_STATUS = 'fictional';

// Concentration above this share of the portfolio gets an EDUCATIONAL note.
// The client is explicit: « concentration excessive → message éducatif, pas une
// alarme ». Ours, declared, and an argument everywhere so a screen can show
// what it is comparing against.
export const PAPER_CONCENTRATION_NOTICE = 0.4;

// Bounds. A workshop, not a trading desk.
export const PAPER_INSTRUMENTS_MAX = 30;
export const PAPER_TRADES_PAGE_SIZE = 100;

// The « diagnostic : suis-je prêt à commencer ? » of screen EP03.
//
// Each check is a QUESTION, never a gate: the client says « réserve et
// objectifs d'abord, SANS BLOQUER l'accès éducatif ». So the diagnostic
// answers, and the workshop opens regardless — the whole point of a paper
// portfolio is to practise before one is ready.
export const READINESS_CHECKS = [
  // Reads P6-09: is there a safety reserve, and does it cover anything?
  { key: 'reserve', reads: 'reserve', formula: 'F014' },
  // Reads P6-08: is there at least one goal with something set aside?
  { key: 'goals', reads: 'goals', formula: 'F025' },
  // Reads P6-04: is there a positive net flow to invest FROM?
  { key: 'netFlow', reads: 'money', formula: 'F004' },
  // Reads P6-10: is the debt service light enough that investing is not
  // borrowing to invest?
  { key: 'debt', reads: 'debts', formula: 'F018' },
];

// The educational risk questionnaire (F057). The QUESTIONS are ours — the
// client asks for a « profil de risque pédagogique » and supplies none — and
// they are declared and versioned, like the personal-income definition of
// P6-06.
//
// The THRESHOLDS that would turn a score into a label (« prudent »,
// « équilibré »...) are explicitly « non figés » in the client's own catalogue
// and have not been given (P6-01). So the score is shown and the label is NOT
// invented: F057 already returns `category: null` without them, and that is the
// honest answer rather than a word somebody would read as a verdict.
export const RISK_QUESTIONNAIRE_VERSION = 1;
export const RISK_QUESTIONS = [
  {
    key: 'horizon',
    weight: 1,
    options: [
      { key: 'under2y', points: 1 },
      { key: '2to5y', points: 2 },
      { key: 'over5y', points: 3 },
    ],
  },
  {
    key: 'reaction',
    weight: 1,
    options: [
      { key: 'sellAll', points: 1 },
      { key: 'wait', points: 2 },
      { key: 'buyMore', points: 3 },
    ],
  },
  {
    key: 'experience',
    weight: 1,
    options: [
      { key: 'none', points: 1 },
      { key: 'some', points: 2 },
      { key: 'regular', points: 3 },
    ],
  },
  {
    key: 'lossTolerance',
    weight: 1,
    options: [
      { key: 'none', points: 1 },
      { key: 'tenPercent', points: 2 },
      { key: 'thirtyPercent', points: 3 },
    ],
  },
];

export const RISK_QUESTION_KEYS = RISK_QUESTIONS.map((question) => question.key);
export const riskQuestionByKey = (key) => RISK_QUESTIONS.find((question) => question.key === key) ?? null;

// Export of the decision journal (screen EP07). CSV only, like P6-04's: it
// opens everywhere and carries no formula a spreadsheet could execute.
export const PAPER_EXPORT_COLUMNS = ['date', 'kind', 'instrument', 'quantity', 'unitPrice', 'fee', 'amount', 'currency', 'note'];

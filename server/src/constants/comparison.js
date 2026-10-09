// The multi-criteria comparison of FINCLUDIA (P4-12), screen C19 of the client's
// specification, and the criteria of the job-offer comparator (ET08).
//
// The vocabulary is FIXED on purpose. A caller names the criteria it compares,
// it does not invent them: a criterion needs a direction (is more better?) and a
// unit before anything can be normalised or displayed, and it needs a label in
// the three languages. An unknown criterion would be a column nobody can read.
//
//   direction 'lower'  : the smaller value is the better one (a cost, a risk)
//   direction 'higher' : the larger value is the better one (a gain, liquidity)
//   direction null     : not comparable by size — shown, never scored (text)
//
// `grade` marks the criteria whose value is the USER'S OWN grading on a 0-10
// scale, not a FINCLUDIA rating: the client gives no scale for liquidity or
// risk, so the only honest source is the person comparing, and the screen says
// so.

export const COMPARISON_UNITS = ['money', 'months', 'points', 'ratio', 'count', 'text'];

export const COMPARISON_CRITERIA = [
  { key: 'cost', unit: 'money', direction: 'lower' },
  { key: 'fees', unit: 'money', direction: 'lower' },
  { key: 'netValue', unit: 'money', direction: 'higher' },
  { key: 'duration', unit: 'months', direction: 'lower' },
  { key: 'commuteMinutes', unit: 'count', direction: 'lower' },
  { key: 'liquidity', unit: 'points', direction: 'higher', grade: true },
  { key: 'risk', unit: 'points', direction: 'lower', grade: true },
  { key: 'compatibility', unit: 'ratio', direction: 'higher' },
  { key: 'conditions', unit: 'text', direction: null },
];

export const CRITERION_KEYS = COMPARISON_CRITERIA.map((criterion) => criterion.key);
export const criterionByKey = (key) => COMPARISON_CRITERIA.find((criterion) => criterion.key === key) ?? null;

// The client's own bound: "2 à 3 scénarios/offres/solutions". Beyond three
// columns a comparison stops being read and starts being ranked, which is what
// C19 forbids.
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 3;

// The 0-10 scale of a graded criterion. Stated here so the form, the validation
// and the normalisation cannot disagree about it.
export const GRADE_MIN = 0;
export const GRADE_MAX = 10;

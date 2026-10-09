import { COMPARISON_CRITERIA, GRADE_MAX, GRADE_MIN, MAX_OPTIONS, MIN_OPTIONS } from '../constants/comparison.js';
import { compareOptions, NotComparableError } from '../services/finance/comparison.js';
import { JOB_OFFER_CRITERIA, compareJobOffers } from '../services/finance/jobOffers.js';
import { HttpError } from '../utils/httpError.js';

// Multi-criteria comparison (P4-12), screens C19 and ET08. Read-only compute:
// no account, no stored data, nothing written.
const noStore = (res) => res.set('Cache-Control', 'no-store');

// What the interface needs to draw the table before anything is compared: the
// criteria it may offer, their direction and their unit, and the bounds the
// client set. Nothing here is a hidden convention.
export function getComparisonMeta(req, res) {
  noStore(res);
  res.json({
    criteria: COMPARISON_CRITERIA.map(({ key, unit, direction, grade = false }) => ({ key, unit, direction, grade })),
    minOptions: MIN_OPTIONS,
    maxOptions: MAX_OPTIONS,
    gradeScale: { min: GRADE_MIN, max: GRADE_MAX },
    jobOfferCriteria: JOB_OFFER_CRITERIA,
  });
}

// A refusal to compare is not a server error: it is the client's rule that
// different currencies or horizons must be normalised FIRST, and the answer says
// which field to normalise.
const refuseIfNotComparable = (run) => {
  try {
    return run();
  } catch (error) {
    if (error instanceof NotComparableError) throw new HttpError(400, `Not comparable: ${error.field}`);
    throw error;
  }
};

export function runComparison(req, res) {
  noStore(res);
  const { options, criteria, weights } = req.body;
  const comparison = refuseIfNotComparable(() => compareOptions({ options, criteria, weights: weights ?? null }));
  if (comparison === null) throw new HttpError(400, 'Invalid input: options, criteria');
  res.json({ comparison });
}

export function runJobOfferComparison(req, res) {
  noStore(res);
  const { offers, weights, currency } = req.body;
  const answer = refuseIfNotComparable(() => compareJobOffers({ offers, weights: weights ?? null, currency }));
  res.json(answer);
}

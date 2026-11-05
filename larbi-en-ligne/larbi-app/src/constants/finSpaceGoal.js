// Common goals and envelopes, children, and annual provisions (P6-15),
// screens P05, CO02-CO06, CP02-CP04, FA02-FA06. Reuses P6-13's roles rather
// than inventing a second ladder: a `viewer` reads the space, never writes.
export const SPACE_WRITE_MIN_ROLE = 'member';

export const SPACE_GOALS_MAX = 40;
export const CHILDREN_MAX = 12;
export const PROVISIONS_MAX = 40;

// P9-17 (client's answer of 2026-11-02): when a member is late on a common goal.
// The gap is measured against what THAT member was expected to put in, never
// against the others. The first floors are in dinars (centimes); for another
// currency only the percentages apply (he gave no other figure).
export const GOAL_EVERY_MONTHS = [1, 2, 3, 6, 12];
export const GOAL_GAP = {
  firstAfterDays: 3,
  firstMinDzd: 50000, // 500 DA
  firstPercent: 0.1,
  reinforcedMinDzd: 100000, // 1 000 DA
  reinforcedPercent: 0.25,
  unpaidPeriodAfterDays: 7,
  reminderAfterDays: 7,
};
export const GOAL_MILESTONES = [25, 50, 75, 100];

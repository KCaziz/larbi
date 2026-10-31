// Pedagogical missions (P8-17, P2-10 taken up again): short missions — a series
// of choices on a FICTIVE sum — whose result says what each choice did and why.
// The scenarios are the client's to write (his answer E, 2026-10-28); this is
// the structure that holds them, shown and scored the same way whatever they say.
//
// The rules, all of them visible to the person (« règles configurées et
// explicables »):
//   - the fictive sum starts at `startingAmount`;
//   - every choice carries three effects the author wrote: on cash, on savings
//     and on resilience points;
//   - the result is the sum of the effects of the choices made, nothing else;
//   - the badge is the highest one whose `minResilience` the total reaches.
// A mission's score is SEPARATE from the knowledge index (P2-09) and touches no
// real data: an attempt reads and writes nothing of the person's accounts.
export const MISSION_STATUSES = ['draft', 'published'];
export const MISSION_STEPS_MAX = 12;
export const MISSION_CHOICES_MIN = 2;
export const MISSION_CHOICES_MAX = 5;
export const MISSION_BADGES_MAX = 5;
export const MISSION_EFFECT_MAX = 1_000_000_000;
export const MISSION_RESILIENCE_MAX = 100;
export const MISSION_ATTEMPTS_KEPT = 20;

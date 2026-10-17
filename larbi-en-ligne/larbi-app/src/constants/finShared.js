// Shared expenses and settlements (P6-14): the client's screens P02 and P03,
// F041 / F042 / F043 and ALG-02.
//
// Everything here lives INSIDE a shared space (P6-13). A shared expense is by
// nature visible to the members who take part in it — that is what it is for —
// but the ONE thing it must not do is reveal more than the space's permission
// matrix already allows. See INCOME_SPLIT_REQUIRES_SHARING below: that is the
// only place where this task has to ask P6-13 for permission.

// How a shared expense is divided. The client's own list, plus the income
// proportional mode its F042 describes.
//
//   equal               F041: the amount over the participants
//   percent             weights in hundredths of a percent, given per participant
//   amounts             the amounts typed one by one
//   income_proportional F042: proportional to the participants' declared income
export const SPLIT_MODES = ['equal', 'percent', 'amounts', 'income_proportional'];

// The rounding rule, documented because the client asks for it to be
// (« arrondis selon une règle documentée ») and published by the API so nobody
// has to read this file to know it.
//
// Largest remainder: everybody gets the floor of their exact share, and the
// leftover centimes go one each to the largest fractional parts, ties broken by
// the participant's position. It is the standard way to keep a split honest, and
// it guarantees the one property the client states as a rule: the shares add up
// to the amount EXACTLY, never to a centime more or less.
export const ROUNDING_RULE = 'largest_remainder';
export const ROUNDING_RULE_TEXT =
  'Chaque part reçoit la partie entière de sa quote-part exacte, puis les centimes restants sont attribués un par un aux plus grandes fractions (à égalité, au participant le plus haut dans la liste). La somme des parts est donc toujours exactement égale au montant.';

// « Convention de signe documentée dans l'API » — the client asks for it in
// those words, so it is a constant the API publishes rather than a sentence in
// a comment.
//
// F043: solde = payé pour le groupe − quote-part due − règlements reçus
//              + règlements versés.
// POSITIVE means the member is OWED money by the group.
// NEGATIVE means the member OWES money to the group.
export const BALANCE_SIGN = 'positive_means_owed_to_the_member';
export const BALANCE_SIGN_TEXT =
  'Un solde POSITIF signifie que le groupe doit de l’argent à ce membre ; un solde NÉGATIF signifie que ce membre doit de l’argent au groupe. La somme de tous les soldes d’un espace est toujours nulle.';

/**
 * The income proportional split (F042) needs every participant's income, and
 * the client's own condition on that formula is « avec consentement ».
 *
 * In FINCLUDIA that consent already exists and has a name: the `incomes` level
 * of the space's permission matrix (P6-13). So this mode is only available when
 * EVERY participant shares their income in that space at `totals` or better —
 * otherwise the shares themselves would reveal, by arithmetic, an income the
 * person chose to keep private.
 *
 * Refused rather than silently falling back to an equal split: a split that is
 * not the one asked for is a wrong figure, and the refusal says which members
 * have not consented so the person can ask them rather than guess.
 */
export const INCOME_SPLIT_REQUIRES_SHARING = 'totals';

// Who may do what. Reuses the roles of P6-13 rather than inventing a second
// ladder: a `viewer` reads the space and records nothing.
export const EXPENSE_MIN_ROLE = 'member';

// A settlement is DECLARATIVE. The client is explicit: « paiements déclaratifs
// (aucune intégration de paiement) ». Nothing in FINCLUDIA moves money, and
// this constant exists so the API can say so rather than let it be assumed.
export const SETTLEMENTS_ARE_DECLARATIVE = true;

// Bounds. A shared expense has participants, not a mailing list.
export const PARTICIPANTS_MAX = 12;
export const SHARED_EXPENSES_PAGE_SIZE = 100;
export const SETTLEMENTS_PAGE_SIZE = 100;

// Percent weights are given in HUNDREDTHS of a percent (so 33.33 % is 3333),
// because a percentage split of three people cannot be written in whole
// percents without losing a third of a point. They must add up to 100 %.
export const PERCENT_SCALE = 10_000;

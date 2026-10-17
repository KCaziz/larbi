// Shared spaces (P6-13): the client's screens P01, P04, CO01, CP01, FA01 — the
// « À plusieurs » hub, its members, and the permission matrix.
//
// The phase rule this whole file exists to serve: « données privées par défaut ;
// rien n'entre dans un espace partagé sans action explicite ». Every default
// below is therefore the most private one available, and sharing is only ever
// something somebody turns on.

// The kinds of space the client names.
export const SPACE_KINDS = ['flatshare', 'couple', 'household'];

// Roles, in the client's own order and with the client's own names. Ordered
// from most to least powerful, which is what makes "at least this role" a
// comparison rather than a list of special cases.
export const SPACE_ROLES = ['owner', 'admin', 'member', 'viewer'];
export const roleRank = (role) => SPACE_ROLES.indexOf(role);
// True when `role` is at least as powerful as `needed`.
export const roleAtLeast = (role, needed) => {
  const a = roleRank(role);
  const b = roleRank(needed);
  return a !== -1 && b !== -1 && a <= b;
};

// What a member may be allowed to see of ANOTHER member's data, per data kind.
// The client's own three levels: « privé, partagé, total seul ».
//
//   private  nothing at all — the default, everywhere
//   totals   the totals only (« Partager seulement les totaux »)
//   shared   the rows themselves
//
// Ordered from least to most revealing, so a comparison decides what a reader
// may do instead of a chain of conditions.
export const SHARING_LEVELS = ['private', 'totals', 'shared'];
export const sharingRank = (level) => SHARING_LEVELS.indexOf(level);
export const sharesAtLeast = (level, needed) => sharingRank(level) >= sharingRank(needed) && sharingRank(level) !== -1;

// The data kinds the matrix covers, as the client lists them: « revenus,
// transactions, actifs, objectifs ». Each one maps to a table of an earlier
// task, and nothing is shareable that is not named here — a kind absent from
// this list cannot be shared at all, which is the safe direction to fail in.
export const SHAREABLE_KINDS = ['incomes', 'transactions', 'assets', 'goals'];

// THE default matrix: everything private. Written out rather than derived, so
// that reading this file answers "what does a new member share?" without
// following any logic.
export const DEFAULT_SHARING = Object.freeze(Object.fromEntries(SHAREABLE_KINDS.map((kind) => [kind, 'private'])));

// How a shared expense is split by default in a space (P6-14 will use it; the
// client asks for « règle de partage par défaut » at creation). `equal` is
// F041, `income_proportional` is F042 — and F042 needs the members' incomes,
// which is itself a sharing decision, so it is never the default.
export const SPLIT_RULES = ['equal', 'income_proportional', 'custom'];
export const DEFAULT_SPLIT_RULE = 'equal';

// Invitations. A link that never expires is a key left under the mat.
export const INVITE_EXPIRY_DAYS = 14;
export const INVITE_TOKEN_BYTES = 32;
export const INVITE_STATUSES = ['pending', 'accepted', 'revoked', 'expired'];

// How many members one space may hold. A bound, not an opinion: the client's
// spaces are a flatshare, a couple or a household, and an unbounded member list
// would be an invitation surface rather than a feature.
export const SPACE_MEMBERS_MAX = 12;
export const SPACES_MAX_PER_ACCOUNT = 10;

// What happened to a membership or to a sharing setting, for the trail. The
// client asks for a « notification à chaque changement de partage »: until
// P6-18 carries notifications, these journal rows ARE the record, and the
// interface reads them.
export const MEMBERSHIP_ACTIONS = ['invited', 'joined', 'left', 'removed', 'role_changed', 'sharing_changed', 'revoked'];

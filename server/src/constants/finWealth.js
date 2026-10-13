// Real patrimony (P6-11): the client's screens C16 and JA07, and F035 / F036 /
// F037.
//
// This file covers ASSETS only. The client's screen shows « actifs et passifs »,
// but the liabilities already have their table — `fin_debts` (P6-10) — and net
// worth reads them there. A second table of liabilities would be two places to
// correct the same debt, and F035 would depend on which one the caller happened
// to use.

// The kinds of asset, taken from the client's own enumeration in the task:
// « comptes, CCP, espèces, or, véhicule, immobilier, placements ». `other` is
// added for the same reason every category family of P6-02 carries an « Autre »:
// so nobody is forced into a wrong answer about their own money.
export const ASSET_KINDS = ['account', 'ccp', 'cash', 'gold', 'vehicle', 'property', 'investment', 'other'];

// Liquidity, which the client lists among the fields. It is not cosmetic: F014
// (« réserve en mois ») requires the illiquid to be excluded, and the engine
// cannot tell a savings account from a flat on its own.
//
//   liquid       available within days, at a known value (an account, cash)
//   semi_liquid  sellable, but not at a certain price or not quickly (gold,
//                a listed investment)
//   illiquid     a vehicle, a property: months, and the price is a negotiation
export const ASSET_LIQUIDITY = ['liquid', 'semi_liquid', 'illiquid'];

// Which kinds are liquid by DEFAULT when the person does not say. A default,
// never a verdict: the field is theirs to change, and the answer always carries
// what was actually stored rather than this table.
export const DEFAULT_LIQUIDITY = {
  account: 'liquid',
  ccp: 'liquid',
  cash: 'liquid',
  gold: 'semi_liquid',
  investment: 'semi_liquid',
  vehicle: 'illiquid',
  property: 'illiquid',
  other: 'semi_liquid',
};

// « Alerte valeur de plus de 90 jours » — the client's own threshold, one of the
// few it actually gives. Measured by F055 on the date the person valued the
// asset (`valuedAt`), not on when the row was created: a flat entered last year
// and re-valued last week is fresh data.
export const VALUATION_STALE_DAYS = 90;

// The status a real-patrimony row may NEVER have. « Le fictif est interdit ici »
// is the client's sentence, and it is enforced three times over: by zod, by a
// SQL CHECK, and by the consistency control — because the whole point of F035 is
// that net worth is real, and one fictional row in it makes the figure a lie.
export const FORBIDDEN_WEALTH_STATUS = 'fictional';

// What a caller may declare. `real` is an asset whose value they know (a bank
// statement), `declared` one they are estimating (a car, a flat). Both are
// real patrimony; the difference is how sure the figure is, which is what the
// socle's `confidence` is for.
export const WEALTH_STATUSES = ['real', 'declared', 'official'];

// Concentration above this share of the total gets the client's EDUCATIONAL
// message — « message éducatif, pas une alarme » (its own words, for the paper
// portfolio of P6-12, and the same restraint applies here). Ours, declared:
// the client sets no threshold, and this one only decides when a sentence
// appears, never a figure.
export const CONCENTRATION_NOTICE_SHARE = 0.5;

export const WEALTH_PAGE_SIZE = 100;

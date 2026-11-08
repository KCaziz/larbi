// P10-05 — the currencies of the personal finances (client's choice,
// 2026-11-08): the dinar and four foreign ones. An account or an asset in a
// foreign currency STAYS in that currency; in the patrimony it counts for its
// counter-value in dinars at the OFFICIAL rate (Banque d'Algérie) of a stated
// reference date — never the parallel market — and never in the dinar cash.
export const OFFICIAL_CURRENCY = 'DZD';
export const SUPPORTED_CURRENCIES = ['DZD', 'EUR', 'USD', 'GBP', 'CAD'];
export const FOREIGN_CURRENCIES = SUPPORTED_CURRENCIES.filter((code) => code !== OFFICIAL_CURRENCY);

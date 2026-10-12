// "Mon argent" (P6-04): the vocabularies of resources and transactions, from
// the client's own file (onglets `04_Donnees_Objets` and `06_Champs_Inputs`,
// screens C05, C07, C08).

// A movement is money in or money out. The client's screen C07 calls this field
// "Type" and offers nothing else.
export const TRANSACTION_KINDS = ['income', 'expense'];

// Screen C07 asks for a "mode de paiement" and the client does NOT enumerate
// the values anywhere in its file. These are OURS, declared as such: the three
// ways money actually moves here plus the CCP the client's own asset categories
// already name, and "other" so nobody is ever forced into a wrong answer. The
// column is nullable, so "not stated" stays different from "cash". If the client
// gives its own list, only this one changes.
export const PAYMENT_METHODS = ['cash', 'card', 'transfer', 'cheque', 'ccp', 'other'];

// How the history may be ordered (screen C08: "tri"). A closed list, because it
// becomes an ORDER BY: a column name taken from a query string would be an
// injection surface.
export const TRANSACTION_SORTS = ['date_desc', 'date_asc', 'amount_desc', 'amount_asc'];

// Page size of the history. The client asks for search and filters, not for an
// unbounded dump: a response has to stay a response.
export const TRANSACTIONS_PAGE_SIZE = 50;
export const TRANSACTIONS_MAX_PAGE_SIZE = 200;

// A movement the person probably entered twice (client: "doublon suspect
// signalé"). Same kind, same amount, same currency, same category, within this
// many hours of each other. SIGNALLED, never refused: two identical coffees in
// the same morning are perfectly real, and refusing them would be wrong.
export const DUPLICATE_WINDOW_HOURS = 24;

// Export (screen C08). CSV only: it opens everywhere, and it carries no formula
// a spreadsheet could execute.
export const EXPORT_COLUMNS = ['date', 'kind', 'amount', 'currency', 'category', 'subcategory', 'paymentMethod', 'status', 'source', 'shared', 'planned', 'note'];

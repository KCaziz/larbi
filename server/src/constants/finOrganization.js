// P13-05, lot A (2026-11-23): the organisations of the client's « Référentiel
// unique Professionnels, Commerce, Diaspora ».
//
// Its rule, repeated on every line of tab 01_PUBLICS: A PUBLIC GRANTS NO
// RIGHT. What a person may do in an organisation comes from their ROLE there,
// and — for the roles that need one — a MANDATE in force, all checked by the
// server on every request (DEC-008, CNV-07).

// The ten publics (tab 01_PUBLICS). They choose a home, a path and indicators.
export const ORGANIZATION_PUBLICS = ['PUB-01', 'PUB-02', 'PUB-03', 'PUB-04', 'PUB-05', 'PUB-06', 'PUB-07', 'PUB-08', 'PUB-09', 'PUB-10'];

// The roles of tab 22_AUTORISATIONS that apply to the modules built so far,
// each with the line it comes from. Payroll, HR, projects and stock gain their
// own actions with their lots; the role exists now so a person can be invited.
export const ORGANIZATION_ROLES = [
  'owner', // DRT-001, DRT-015 — titulaire / dirigeant
  'finance_manager', // DRT-002, DRT-018 — gestionnaire / responsable financier
  'accountant_internal', // DRT-019 — comptable interne
  'accountant_external', // DRT-003, DRT-020 — comptable externe / cabinet, under mandate
  'collaborator', // DRT-016 — collaborateur
  'project_manager', // DRT-006 — chef de projet
  'storekeeper', // DRT-007 — magasinier / achats
  'hr_manager', // DRT-005, DRT-017 — responsable RH (no amounts by default)
  'reader', // DRT-036 — lecteur
];

// The roles whose every access needs a mandate in force (DRT-003: « mandat
// révocable et vérifié sur chaque requête »; DRT-020: « jamais d'accès sans
// mandat client »).
export const MANDATED_ROLES = ['accountant_external'];

export const MANDATE_SCOPES = ['finance', 'documents'];

// What each action needs. `org.read` is every member: knowing which
// organisation you are in is not a figure.
const FINANCE_READERS = ['owner', 'finance_manager', 'accountant_internal', 'accountant_external', 'collaborator', 'project_manager', 'reader'];
export const PERMISSIONS = {
  'org.read': ORGANIZATION_ROLES,
  'org.update': ['owner'],
  'members.manage': ['owner'],
  'mandates.manage': ['owner'],
  'journal.read': ['owner', 'finance_manager', 'accountant_internal', 'accountant_external'],
  'finance.read': FINANCE_READERS,
  // DRT-007: the storekeeper records suppliers, never documents or payments.
  'contacts.write': ['owner', 'finance_manager', 'accountant_internal', 'collaborator', 'storekeeper'],
  'documents.write': ['owner', 'finance_manager', 'accountant_internal', 'collaborator'],
  'payments.write': ['owner', 'finance_manager', 'accountant_internal'],
  // Lot C (2026-11-23). DRT-007: the storekeeper records receptions and stock
  // movements, and sees quantities — never the values (those need finance.read).
  'stock.read': [...FINANCE_READERS, 'storekeeper'],
  'stock.write': ['owner', 'finance_manager', 'accountant_internal', 'storekeeper'],
  'budget.write': ['owner', 'finance_manager', 'accountant_internal'],
  // The opening cash balance of the 13-week plan: a fact about the bank, set by those who handle payments.
  'cash.write': ['owner', 'finance_manager', 'accountant_internal'],
};

// The scope of mandate each action reaches, for a mandated role.
export const MANDATE_SCOPE_OF = {
  'finance.read': ['finance', 'documents'],
  'journal.read': ['finance'],
  'org.read': ['finance', 'documents'],
  'stock.read': ['finance', 'documents'],
};

export const permissionsOf = (role) => Object.keys(PERMISSIONS).filter((action) => PERMISSIONS[action].includes(role));

// The header that says which organisation a request is about. The addresses
// of the API do not change (decision of 2026-11-23): without the header, the
// person's own organisation is used, as before.
export const ORGANIZATION_HEADER = 'x-organisation';

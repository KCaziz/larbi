// The tools of the platform (P4-01) and who may use them. ONE place decides, for
// the API (middleware/toolAccess.js) and for the catalogue page (GET /api/tools).
//   access : 'public' (no account) | 'authenticated' (any account) | 'premium'
//   status : 'available' | 'planned' (announced on the catalogue, not built yet)
export const TOOL_ACCESS = ['public', 'authenticated', 'premium'];

export const TOOLS = [
  // 2026-10-04: the client's workbooks set no access rule for the comparator, so
  // it is in free access (the user's decision, see TASKS.md P4-06).
  { key: 'comparateur-bancaire', status: 'available', access: 'public' },
  // FINCLUDIA simulators (P4-10). Free access: they are pure calculators that
  // read no stored data and keep nothing, and the client's own screen C18 says
  // the simulation workshop works "en mode découverte", without a profile.
  // Requiring an account is one word here if the client decides otherwise.
  { key: 'simulateurs', status: 'available', access: 'public' },
  // Multi-criteria comparison and job-offer comparator (P4-12). Free access for
  // the same reason: they compare the figures the person types, and read nothing.
  { key: 'comparaisons', status: 'available', access: 'public' },
  // Cahier des charges: "Outils : accès authentifié et selon les droits".
  { key: 'simulateur-credit', status: 'planned', access: 'authenticated' },
  { key: 'generateur-facture', status: 'planned', access: 'authenticated' },
];

export const toolByKey = (key) => TOOLS.find((tool) => tool.key === key) ?? null;

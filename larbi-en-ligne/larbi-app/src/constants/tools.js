// The tools of the platform (P4-01) and who may use them. ONE place decides, for
// the API (middleware/toolAccess.js) and for the catalogue page (GET /api/tools).
//   access : 'public' (no account) | 'authenticated' (any account) | 'premium'
//   status : 'available' | 'planned' (announced on the catalogue, not built yet)
export const TOOL_ACCESS = ['public', 'authenticated', 'premium'];

export const TOOLS = [
  // 2026-10-04: the client's workbooks set no access rule for the comparator, so
  // it is in free access (the user's decision, see TASKS.md P4-06).
  { key: 'comparateur-bancaire', status: 'available', access: 'public' },
  // Cahier des charges: "Outils : accès authentifié et selon les droits".
  { key: 'simulateur-credit', status: 'planned', access: 'authenticated' },
  { key: 'generateur-facture', status: 'planned', access: 'authenticated' },
];

export const toolByKey = (key) => TOOLS.find((tool) => tool.key === key) ?? null;

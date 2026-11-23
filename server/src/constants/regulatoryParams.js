// The regulatory values of the client's « Référentiel unique Professionnels,
// Commerce, Diaspora » (2026-11-23), tab 25_PARAMETRES: the ones its own
// « Statut » column leaves « NON ACTIVÉE sans signature » (PARM-002 to 007)
// or « soumise à homologation » (PARM-026 to 031). Decision DEC-001: no
// regulatory amount is ever computed from a value the client has not
// confirmed, with the date it applies from (P13-05). The administrator is
// asked once, in a window of the administration, to confirm each one.
//
// `kind`: 'rate' (a decimal, 0.005 = 0.5 %), 'amount' (DZD), or 'text' (a
// rule written in words, when there is no single figure). `candidate`: the
// value the workbook proposes, if any — to confirm or correct, never applied
// on its own. The names shown on screen live in the client's translations.
export const REGULATORY_PARAMS = [
  { key: 'PARM-002', group: 'tax', kind: 'rate', candidate: '0.005', source: 'https://www.mfdgi.gov.dz/fr/professionnels/services-pro/regime-forfaitaire-unique/ifu' },
  { key: 'PARM-003', group: 'tax', kind: 'amount', candidate: '5000000', source: 'https://www.mfdgi.gov.dz/fr/professionnels/services-pro/regime-forfaitaire-unique/ifu' },
  { key: 'PARM-004', group: 'tax', kind: 'text', candidate: null, source: 'https://www.mfdgi.gov.dz/' },
  { key: 'PARM-005', group: 'social', kind: 'text', candidate: null, source: 'https://www.casnos.dz/' },
  { key: 'PARM-006', group: 'social', kind: 'text', candidate: null, source: 'https://cnas.dz/' },
  { key: 'PARM-007', group: 'tax', kind: 'text', candidate: null, source: 'https://www.mfdgi.gov.dz/' },
  { key: 'PARM-026', group: 'import', kind: 'text', candidate: null, source: 'https://www.joradp.dz/FTP/jo-francais/2025/F2025040.pdf' },
  { key: 'PARM-027', group: 'import', kind: 'text', candidate: null, source: 'https://www.joradp.dz/FTP/jo-francais/2025/F2025040.pdf' },
  { key: 'PARM-028', group: 'import', kind: 'text', candidate: null, source: 'https://www.joradp.dz/FTP/jo-francais/2025/F2025040.pdf' },
  { key: 'PARM-029', group: 'import', kind: 'amount', candidate: null, source: 'https://www.joradp.dz/FTP/jo-francais/2025/F2025040.pdf' },
  { key: 'PARM-030', group: 'import', kind: 'text', candidate: null, source: 'https://www.douane.gov.dz/' },
  { key: 'PARM-031', group: 'import', kind: 'text', candidate: null, source: 'https://www.douane.gov.dz/' },
];

export const REGULATORY_KEYS = REGULATORY_PARAMS.map((param) => param.key);

// Where the decisions are kept: one row of `platform_settings`, never shown by
// the settings form (which only reads its own keys).
export const REGULATORY_SETTING_KEY = 'regulatoryParams';

// P13-05, lot D (2026-11-24): micro-import and international trade — the
// client's screens ECR-0350 to ECR-0371, decisions DEC-013 to DEC-017 and
// conventions CNV-09, CNV-10, CNV-15, CNV-16.
//
// FINCLUDIA prepares, computes and keeps the proof. It files nothing with
// customs, moves no money, applies no duty rate (DEC-014: duties are DECLARED
// from the customs notice) and implies no exchange rate (DEC-015).

export const OPERATION_KINDS = ['micro_import', 'import', 'export'];
export const OPERATION_STATUSES = ['draft', 'ordered', 'shipped', 'received', 'closed', 'cancelled'];
// Statuses an operation may still be changed in (CNV-02: what is closed is not rewritten).
export const OPEN_OPERATION_STATUSES = ['draft', 'ordered', 'shipped', 'received'];

// What a landed cost is made of (CAL-0053, CAL-0610): the goods converted at a
// dated rate, then every attributable cost, each in its own currency.
export const OPERATION_COST_KINDS = ['goods', 'transport', 'insurance', 'travel', 'duties', 'customs_fees', 'bank', 'local_transport', 'other'];

export const PIECE_KINDS = ['commercial_invoice', 'packing_list', 'transport_document', 'customs_declaration', 'origin_certificate', 'payment_proof', 'authorization', 'insurance_certificate'];
export const PIECE_STATUSES = ['missing', 'submitted', 'accepted', 'rejected'];

// The documents each kind of operation expects (ECR-0356, ECR-0368). Our list,
// from the client's screens; a file is « ready to file » only when every one
// of them is accepted.
export const REQUIRED_PIECES = {
  micro_import: ['commercial_invoice', 'payment_proof', 'customs_declaration', 'authorization'],
  import: ['commercial_invoice', 'packing_list', 'transport_document', 'customs_declaration', 'payment_proof'],
  export: ['commercial_invoice', 'packing_list', 'transport_document', 'customs_declaration', 'origin_certificate'],
};

// The regulatory values of micro-import (25_PARAMETRES): shown confirmed or
// « rule not published », never guessed (DEC-013).
export const MICRO_IMPORT_RULES = ['PARM-026', 'PARM-027', 'PARM-028', 'PARM-029', 'PARM-030', 'PARM-031'];

// Incoterms 2020 (ICC), as an INDICATIVE matrix (DEC-017, CNV-15): who clears
// for export, who pays the main carriage, who must insure, who clears for
// import, and where the risk passes. The contract and its named place govern;
// without a named place, no comparison is made.
export const INCOTERM_VERSION = '2020';
export const INCOTERMS = [
  { code: 'EXW', mode: 'any', exportClearance: 'buyer', mainCarriage: 'buyer', insurance: 'none', importClearance: 'buyer', risk: 'premises' },
  { code: 'FCA', mode: 'any', exportClearance: 'seller', mainCarriage: 'buyer', insurance: 'none', importClearance: 'buyer', risk: 'carrier' },
  { code: 'CPT', mode: 'any', exportClearance: 'seller', mainCarriage: 'seller', insurance: 'none', importClearance: 'buyer', risk: 'carrier' },
  { code: 'CIP', mode: 'any', exportClearance: 'seller', mainCarriage: 'seller', insurance: 'seller', importClearance: 'buyer', risk: 'carrier' },
  { code: 'DAP', mode: 'any', exportClearance: 'seller', mainCarriage: 'seller', insurance: 'none', importClearance: 'buyer', risk: 'destination' },
  { code: 'DPU', mode: 'any', exportClearance: 'seller', mainCarriage: 'seller', insurance: 'none', importClearance: 'buyer', risk: 'destinationUnloaded' },
  { code: 'DDP', mode: 'any', exportClearance: 'seller', mainCarriage: 'seller', insurance: 'none', importClearance: 'seller', risk: 'destination' },
  { code: 'FAS', mode: 'sea', exportClearance: 'seller', mainCarriage: 'buyer', insurance: 'none', importClearance: 'buyer', risk: 'alongside' },
  { code: 'FOB', mode: 'sea', exportClearance: 'seller', mainCarriage: 'buyer', insurance: 'none', importClearance: 'buyer', risk: 'onBoard' },
  { code: 'CFR', mode: 'sea', exportClearance: 'seller', mainCarriage: 'seller', insurance: 'none', importClearance: 'buyer', risk: 'onBoard' },
  { code: 'CIF', mode: 'sea', exportClearance: 'seller', mainCarriage: 'seller', insurance: 'seller', importClearance: 'buyer', risk: 'onBoard' },
];
export const INCOTERM_CODES = INCOTERMS.map((row) => row.code);

// The scenarios of change offered on screen (ECR-0365): a stressed rate is the
// initial rate × (1 + variation), never a forecast.
export const FX_VARIATIONS = [-0.1, -0.05, 0.05, 0.1, 0.2];

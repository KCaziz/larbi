// Bank comparator (P4-06). The rubrics are the 11 of the client's guide
// ("Conditions_bancaires_par_thematiques_et_segments.xlsx", tab 00_Guide), in the
// client's order, each with its own columns (`fields`). Kept in sync with the
// CHECK constraints of the `comparator` migration.
//   category : the rubric has a "Catégorie" column (e.g. Retrait / Versement)
//   metric   : how an estimated yearly cost can be derived from the text, if at all
//              - periodic : an amount + a periodicity (Mensuel, Trimestriel...)
//              - annual   : a yearly amount ("4 500 DA", "17 000 DA / 2 ans")
//              Savings, credits and percentage fees never get one: the client's
//              guide forbids comparing profit shares with interest rates, and a
//              fee in % depends on an amount nobody has given.
export const COMPARATOR_THEMES = [
  { key: 'comptes', fields: ['fee', 'period'], category: false, metric: { kind: 'periodic', amount: 'fee', period: 'period' } },
  { key: 'versements-retraits', fields: ['fee', 'conditions'], category: true, metric: null },
  { key: 'carte-locale', fields: ['annualFee', 'atmWithdrawal', 'opposition'], category: false, metric: { kind: 'annual', amount: 'annualFee' } },
  { key: 'epargne', fields: ['rate', 'conditions'], category: false, metric: null },
  { key: 'coffres-forts', fields: ['fee', 'period', 'conditions'], category: false, metric: { kind: 'periodic', amount: 'fee', period: 'period' } },
  { key: 'credits', fields: ['fileFee', 'rate', 'earlyRepayment'], category: false, metric: null },
  { key: 'virements', fields: ['fee', 'conditions'], category: false, metric: null },
  { key: 'carte-internationale', fields: ['annualFee', 'foreignWithdrawal', 'opposition'], category: false, metric: { kind: 'annual', amount: 'annualFee' } },
  { key: 'devises', fields: ['fee', 'conditions'], category: true, metric: null },
  { key: 'operations-diverses', fields: ['fee', 'conditions'], category: true, metric: null },
  { key: 'cheques', fields: ['fee', 'conditions'], category: false, metric: null },
];

export const THEME_KEYS = COMPARATOR_THEMES.map((theme) => theme.key);
export const themeByKey = (key) => COMPARATOR_THEMES.find((theme) => theme.key === key) ?? null;

// A segment is only set when the client's file states it in the label; anything
// else is "non_precise" (the client's own wording: « Non précisé dans le tableau source »).
export const COMPARATOR_SEGMENTS = ['particulier', 'professionnel', 'entreprise', 'non_precise'];
export const EXPLICIT_SEGMENTS = ['particulier', 'professionnel', 'entreprise'];

// Size limits of what an administrator may type (validation + UI maxLength).
export const COMPARATOR_LIMITS = { bankName: 80, label: 200, category: 80, value: 300 };

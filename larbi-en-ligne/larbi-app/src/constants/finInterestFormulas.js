// Formules de l'intérêt simple et composé (INT-F01 à INT-F05).
//
// Écrites à la main d'après la réponse du client du 2026-11-02 (« Formule
// générale », « Règle métier FINCLUDIA »). Elles ne sont PAS ajoutées au
// catalogue F001-F057, celui du classeur : le même raisonnement que pour les
// formules de l'entreprise (`E001`) et du budget (`PB-F`) — elles portent un
// préfixe `INT` qui dit qu'elles viennent d'un message, pas du classeur.
//
// Le capital composé et les versements en fin de période restent les F029 et
// F030 du client ; ces cinq-là sont ce que ses messages ajoutent.

export const INTEREST_FORMULAS = [
  {
    id: 'INT-F01',
    unit: 'ratio',
    version: 1,
    label: 'Taux de période',
    rule: 'Taux mensuel ou trimestriel : tel que saisi, jamais divisé. Taux annuel nominal j : r = j / m. Taux annuel effectif TAE : r = (1 + TAE)^(1/m) - 1. m = nombre de périodes par an.',
    condition: 'Un taux mensuel de 1 % n’est jamais divisé par 12.',
  },
  {
    id: 'INT-F02',
    unit: 'money',
    version: 1,
    label: 'Valeur finale du capital',
    rule: 'Intérêt simple : C0 × (1 + r × n). Intérêt composé : C0 × (1 + r)^n.',
    condition: 'r est le taux de la période, n le nombre de périodes ; hypothèses visibles.',
  },
  {
    id: 'INT-F03',
    unit: 'money',
    version: 1,
    label: 'Valeur finale des versements',
    rule: 'Intérêt composé : capital suivant = capital × (1 + r) + V en fin de période, ou (capital + V) × (1 + r) en début. Intérêt simple : chaque versement rapporte V × r par période où il est resté, sans jamais produire d’intérêt lui-même.',
    condition: 'Impôts et frais de gestion du compte non intégrés.',
  },
  {
    id: 'INT-F04',
    unit: 'money',
    version: 1,
    label: 'Valeur finale totale',
    rule: 'INT-F02 + INT-F03',
    condition: 'Hypothèses visibles',
  },
  {
    id: 'INT-F05',
    unit: 'ratio',
    version: 1,
    label: 'Taux annuel effectif équivalent',
    rule: '(1 + r)^m - 1',
    condition: 'Intérêt composé uniquement : en intérêt simple, le taux ne se compose pas.',
  },
];

export const interestFormulaById = (id) => INTEREST_FORMULAS.find((formula) => formula.id === id) ?? null;

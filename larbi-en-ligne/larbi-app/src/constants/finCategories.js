// FINCLUDIA category reference (P6-02), taken as-is from the client's own file
// (FINCLUDIA_Cahier_des_Charges_Complet.xlsx, onglet "03_Categories"): the 91
// standard categories of its 8 families, extracted by script rather than
// retyped. `label` is the client's wording VERBATIM and is never reworded nor
// translated — like the formula catalogue (constants/finance.js) and the bank
// comparator data (P4-06), this is client reference data, not interface text.
//
// `code` is ours: a stable identifier the database and the API use, so a label
// the client later rewords does not change what rows point at.
//
// Every family carries its own "Autre…" category, which is the client's rule
// « « Autre » reste disponible »; a unit test checks it still holds.
import { OLD_ESSENTIAL_KEYS, REFERENCE_CATEGORIES } from './finCategoryReference.js';

export const CATEGORY_FAMILIES = [
  { code: 'income', label: 'Revenus / ressources' },
  { code: 'fixed', label: 'Dépenses fixes / obligatoires' },
  { code: 'variable', label: 'Dépenses variables' },
  { code: 'seasonal', label: 'Dépenses saisonnières / provisions' },
  { code: 'goal', label: 'Objectifs' },
  { code: 'asset', label: 'Actifs réels' },
  { code: 'debt', label: 'Dettes / passifs' },
  { code: 'shared', label: 'Dépenses partagées' },
];

export const CATEGORY_FAMILY_CODES = CATEGORY_FAMILIES.map((f) => f.code);
export const categoryFamilyByCode = (code) => CATEGORY_FAMILIES.find((f) => f.code === code) ?? null;

// The standard rows. `key` is `<family>.<slug of the label>`: labels repeat
// across families (Loyer is both a fixed charge and a shared expense), so the
// family is part of the key.
// The 91 rows of P6-02, as first extracted. Since P8-08 they are the starting
// point only: see STANDARD_CATEGORIES below.
const P6_02_CATEGORIES = [
  { key: 'income.salaire_net', family: 'income', label: 'Salaire net' },
  { key: 'income.salaire_brut_information', family: 'income', label: 'Salaire brut (information)' },
  { key: 'income.prime', family: 'income', label: 'Prime' },
  { key: 'income.bourse', family: 'income', label: 'Bourse' },
  { key: 'income.aide_familiale', family: 'income', label: 'Aide familiale' },
  { key: 'income.allocation_aide', family: 'income', label: 'Allocation / aide' },
  { key: 'income.job_etudiant', family: 'income', label: 'Job étudiant' },
  { key: 'income.stage_remunere', family: 'income', label: 'Stage rémunéré' },
  { key: 'income.freelance_mission', family: 'income', label: 'Freelance / mission' },
  { key: 'income.revenu_locatif', family: 'income', label: 'Revenu locatif' },
  { key: 'income.pension', family: 'income', label: 'Pension' },
  { key: 'income.dividende_revenu_de_placement_declare', family: 'income', label: 'Dividende / revenu de placement déclaré' },
  { key: 'income.autre_revenu', family: 'income', label: 'Autre revenu' },
  { key: 'fixed.loyer', family: 'fixed', label: 'Loyer' },
  { key: 'fixed.credit_immobilier', family: 'fixed', label: 'Crédit immobilier' },
  { key: 'fixed.credit_consommation', family: 'fixed', label: 'Crédit consommation' },
  { key: 'fixed.assurance', family: 'fixed', label: 'Assurance' },
  { key: 'fixed.copropriete_charges', family: 'fixed', label: 'Copropriété / charges' },
  { key: 'fixed.electricite', family: 'fixed', label: 'Électricité' },
  { key: 'fixed.gaz', family: 'fixed', label: 'Gaz' },
  { key: 'fixed.eau', family: 'fixed', label: 'Eau' },
  { key: 'fixed.telephone', family: 'fixed', label: 'Téléphone' },
  { key: 'fixed.internet', family: 'fixed', label: 'Internet' },
  { key: 'fixed.transport_recurrent', family: 'fixed', label: 'Transport récurrent' },
  { key: 'fixed.scolarite_etudes', family: 'fixed', label: 'Scolarité / études' },
  { key: 'fixed.pension_engagement', family: 'fixed', label: 'Pension / engagement' },
  { key: 'fixed.abonnement', family: 'fixed', label: 'Abonnement' },
  { key: 'fixed.autre_charge_fixe', family: 'fixed', label: 'Autre charge fixe' },
  { key: 'variable.alimentation_boissons', family: 'variable', label: 'Alimentation / boissons' },
  { key: 'variable.transport_automobile', family: 'variable', label: 'Transport / automobile' },
  { key: 'variable.sante_hygiene', family: 'variable', label: 'Santé / hygiène' },
  { key: 'variable.habillement', family: 'variable', label: 'Habillement' },
  { key: 'variable.maison_equipement', family: 'variable', label: 'Maison / équipement' },
  { key: 'variable.culture_loisirs_sorties', family: 'variable', label: 'Culture / loisirs / sorties' },
  { key: 'variable.dons_cadeaux', family: 'variable', label: 'Dons / cadeaux' },
  { key: 'variable.animaux', family: 'variable', label: 'Animaux' },
  { key: 'variable.telecom_variable', family: 'variable', label: 'Télécom variable' },
  { key: 'variable.etudes_fournitures', family: 'variable', label: 'Études / fournitures' },
  { key: 'variable.autre_depense_variable', family: 'variable', label: 'Autre dépense variable' },
  { key: 'seasonal.frais_d_etudes', family: 'seasonal', label: 'Frais d’études' },
  { key: 'seasonal.rentree_scolaire', family: 'seasonal', label: 'Rentrée scolaire' },
  { key: 'seasonal.assurance_annuelle', family: 'seasonal', label: 'Assurance annuelle' },
  { key: 'seasonal.entretien_reparation', family: 'seasonal', label: 'Entretien / réparation' },
  { key: 'seasonal.vacances', family: 'seasonal', label: 'Vacances' },
  { key: 'seasonal.fetes', family: 'seasonal', label: 'Fêtes' },
  { key: 'seasonal.mariage', family: 'seasonal', label: 'Mariage' },
  { key: 'seasonal.equipement', family: 'seasonal', label: 'Équipement' },
  { key: 'seasonal.autre_depense_annuelle', family: 'seasonal', label: 'Autre dépense annuelle' },
  { key: 'goal.reserve_de_securite', family: 'goal', label: 'Réserve de sécurité' },
  { key: 'goal.etudes', family: 'goal', label: 'Études' },
  { key: 'goal.ordinateur_equipement', family: 'goal', label: 'Ordinateur / équipement' },
  { key: 'goal.permis', family: 'goal', label: 'Permis' },
  { key: 'goal.mobilite_stage', family: 'goal', label: 'Mobilité / stage' },
  { key: 'goal.voyage', family: 'goal', label: 'Voyage' },
  { key: 'goal.mariage', family: 'goal', label: 'Mariage' },
  { key: 'goal.voiture', family: 'goal', label: 'Voiture' },
  { key: 'goal.logement', family: 'goal', label: 'Logement' },
  { key: 'goal.enfant_etudes_enfant', family: 'goal', label: 'Enfant / études enfant' },
  { key: 'goal.retraite', family: 'goal', label: 'Retraite' },
  { key: 'goal.projet_personnel', family: 'goal', label: 'Projet personnel' },
  { key: 'goal.epargne_investissement', family: 'goal', label: 'Épargne / investissement' },
  { key: 'goal.autre', family: 'goal', label: 'Autre' },
  { key: 'asset.especes', family: 'asset', label: 'Espèces' },
  { key: 'asset.compte_bancaire', family: 'asset', label: 'Compte bancaire' },
  { key: 'asset.ccp', family: 'asset', label: 'CCP' },
  { key: 'asset.compte_d_epargne', family: 'asset', label: 'Compte d’épargne' },
  { key: 'asset.immobilier', family: 'asset', label: 'Immobilier' },
  { key: 'asset.or', family: 'asset', label: 'Or' },
  { key: 'asset.vehicule', family: 'asset', label: 'Véhicule' },
  { key: 'asset.participation_entreprise', family: 'asset', label: 'Participation / entreprise' },
  { key: 'asset.actions_declarees', family: 'asset', label: 'Actions déclarées' },
  { key: 'asset.obligations_sukuk_declares', family: 'asset', label: 'Obligations / sukuk déclarés' },
  { key: 'asset.creance', family: 'asset', label: 'Créance' },
  { key: 'asset.autre_actif', family: 'asset', label: 'Autre actif' },
  { key: 'debt.credit_immobilier', family: 'debt', label: 'Crédit immobilier' },
  { key: 'debt.credit_consommation', family: 'debt', label: 'Crédit consommation' },
  { key: 'debt.financement_vehicule', family: 'debt', label: 'Financement véhicule' },
  { key: 'debt.dette_familiale_declaree', family: 'debt', label: 'Dette familiale déclarée' },
  { key: 'debt.autre_dette', family: 'debt', label: 'Autre dette' },
  { key: 'shared.loyer', family: 'shared', label: 'Loyer' },
  { key: 'shared.courses', family: 'shared', label: 'Courses' },
  { key: 'shared.internet', family: 'shared', label: 'Internet' },
  { key: 'shared.electricite', family: 'shared', label: 'Électricité' },
  { key: 'shared.gaz', family: 'shared', label: 'Gaz' },
  { key: 'shared.eau', family: 'shared', label: 'Eau' },
  { key: 'shared.menage', family: 'shared', label: 'Ménage' },
  { key: 'shared.equipement_commun', family: 'shared', label: 'Équipement commun' },
  { key: 'shared.transport_commun', family: 'shared', label: 'Transport commun' },
  { key: 'shared.sorties', family: 'shared', label: 'Sorties' },
  { key: 'shared.projet_commun', family: 'shared', label: 'Projet commun' },
  { key: 'shared.autre', family: 'shared', label: 'Autre' },
];

// The standard reference since P8-08: the client's 125 universal categories
// (generated, constants/finCategoryReference.js), plus the old rows none of
// them covers. An old row a new one absorbed keeps its key — its movements do
// not move — and takes the client's new definition.
const absorbed = new Map(REFERENCE_CATEGORIES.filter((c) => c.mergedFrom).map((c) => [c.mergedFrom, c]));
const fromReference = (c) => ({
  key: c.key,
  family: c.family,
  label: c.label,
  group: c.group,
  icon: c.icon,
  color: c.color,
  essential: c.essential,
  recurrence: c.recurrence,
  suggestedFor: c.suggestedFor,
});
// The client's answer D4 (2026-10-28): the 125 REPLACE the 91. An old income
// or expense category no new one absorbed is retired: its rows move to the
// category of the 125 named here (migration 20261028130000, journalled), and
// it can no longer be chosen. It stays in the table, archived, for the history
// that names it. Where nothing among the 125 is close, « Autre dépense ».
// Presented to the client at acceptance. Not here: the `goal` family (savings
// still read it), « Autre charge fixe » and « Transport récurrent » (the
// current first-run questions write on them, and they count as essential for
// the reserve) — all retired with the new first-run journey, P8-23; the `asset`
// and `debt` families (kinds of assets and debts, not categories of
// movements) and the `shared` family (Phase 9, P9-05).
export const RETIRED_CATEGORIES = {
  'income.salaire_brut_information': 'income.salaire_net',
  'fixed.assurance': 'fixed.assurance_mutuelle_sante',
  'fixed.abonnement': 'variable.autre_depense_variable',
  'variable.transport_automobile': 'variable.carburant',
  'variable.sante_hygiene': 'variable.hygiene_soins',
  'variable.maison_equipement': 'variable.petit_equipement',
  'variable.culture_loisirs_sorties': 'variable.sorties',
  'variable.dons_cadeaux': 'variable.cadeau_offert',
  'variable.animaux': 'variable.alimentation_animal',
  'variable.telecom_variable': 'fixed.telephone',
  'seasonal.frais_d_etudes': 'fixed.scolarite_etudes',
  'seasonal.rentree_scolaire': 'variable.etudes_fournitures',
  'seasonal.assurance_annuelle': 'variable.autre_depense_variable',
  'seasonal.entretien_reparation': 'variable.reparation',
  'seasonal.vacances': 'variable.hebergement',
  'seasonal.fetes': 'variable.autre_depense_variable',
  'seasonal.mariage': 'variable.autre_depense_variable',
  'seasonal.equipement': 'variable.petit_equipement',
  'seasonal.autre_depense_annuelle': 'variable.autre_depense_variable',
};

export const STANDARD_CATEGORIES = [
  ...P6_02_CATEGORIES.map((c) =>
    absorbed.has(c.key)
      ? fromReference(absorbed.get(c.key))
      : {
          ...c,
          group: null,
          icon: null,
          color: null,
          essential: OLD_ESSENTIAL_KEYS.includes(c.key),
          recurrence: null,
          suggestedFor: [],
          ...(RETIRED_CATEGORIES[c.key] ? { retiredTo: RETIRED_CATEGORIES[c.key] } : {}),
        },
  ),
  ...REFERENCE_CATEGORIES.filter((c) => !c.mergedFrom).map(fromReference),
];

export const STANDARD_CATEGORY_KEYS = STANDARD_CATEGORIES.map((c) => c.key);
export const standardCategoryByKey = (key) => STANDARD_CATEGORIES.find((c) => c.key === key) ?? null;
export const standardCategoriesOfFamily = (family) => STANDARD_CATEGORIES.filter((c) => c.family === family);

// « Des couleurs pour chaque catégorie, sous-catégorie » (the client,
// 2026-10-28, P8-27). The 125 carry their own colour (a sub-category); a
// group (the category) takes the colour of its first sub-category in the
// client's order; a row with neither — an old category kept, a person's own —
// takes its family's. Every category on screen therefore has a colour.
export const FAMILY_COLORS = {
  income: '#0B7A6C',
  fixed: '#3A5F8A',
  variable: '#2563A6',
  seasonal: '#7C3AED',
  goal: '#B7791F',
  asset: '#087682',
  debt: '#9F1239',
  shared: '#C2410C',
};
export const GROUP_COLORS = Object.fromEntries(
  REFERENCE_CATEGORIES.filter((c, index, all) => c.group && c.color && all.findIndex((other) => other.group === c.group && other.family === c.family) === index).map((c) => [
    `${c.family}:${c.group}`,
    c.color,
  ]),
);
export const categoryColor = (row) => row.color ?? (row.group ? GROUP_COLORS[`${row.family}:${row.group}`] : null) ?? FAMILY_COLORS[row.family] ?? null;

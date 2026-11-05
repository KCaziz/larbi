// Règles-cadres du crédit (P4-02), transcrites de l'onglet `04_Credit_Regles`
// du référentiel maître du client.
//
// Les formules CR01 à CR10 sont des mathématiques financières ordinaires : une
// mensualité d'emprunt amortissable se calcule de la même façon partout. Ce
// qui vient du client, et qui ne s'invente pas, ce sont les RÈGLES AUTOUR :
// le plafond légal, ce qu'il vise, ce qu'il ne vise pas, et ce que le produit
// a le droit d'affirmer.
//
// La règle la plus importante du lot n'est pas une formule :
//
//   « L'établissement prêteur reste décisionnaire. FINCLUDIA affiche une
//     simulation et une compatibilité avec critères publics, jamais une
//     décision. »
//
// Tout le reste de ce module en découle.

// ---------------------------------------------------------------------------
// Le plafond légal
// ---------------------------------------------------------------------------

/**
 * Article 16 du décret exécutif n° 15-114 : le remboursement mensuel global
 * d'un crédit à la CONSOMMATION ne peut dépasser 30 % des revenus mensuels
 * nets régulièrement perçus.
 *
 * Le client insiste sur la limite de cette limite, en tête de son onglet :
 * « le plafond 30 % cité dans l'ODT vise la consommation et ne doit pas être
 * généralisé à l'immobilier ». L'appliquer à un crédit immobilier refuserait
 * des dossiers que la loi n'interdit pas — et plusieurs offres immobilières du
 * référentiel annoncent justement 40 % ou 50 % selon le revenu.
 */
export const CONSUMER_DSR_HARD_MAX = 0.3;
export const CONSUMER_DSR_SOURCE = 'Article 16 du décret exécutif n° 15-114';
export const CONSUMER_DSR_SCOPE = 'consumer';

// Les natures de crédit auxquelles le plafond légal s'applique. Déduit du type
// du produit, et nommé plutôt que testé par sous-chaîne au fil du code.
export const CONSUMER_KINDS = ['Consommation', 'Consommation islamique', 'Automobile', 'Automobile islamique'];

// Le repère interne, à n'utiliser QUE faute de ratio publié par la banque, et
// à présenter comme tel (même règle que la préparation au financement).
export const INTERNAL_DSR_MARKERS = [0.2, 0.3, 0.4, 0.5];

// ---------------------------------------------------------------------------
// Les messages exacts du client
// ---------------------------------------------------------------------------

// Repris mot pour mot de l'onglet `04_Credit_Regles`. Ce sont des phrases
// juridiques autant que commerciales : les reformuler, c'est changer ce que le
// produit affirme.
export const CREDIT_MESSAGES = {
  simulation: 'Ce calcul est une simulation mathématique et ne constitue pas une offre de crédit.',
  verifiedProduct: 'Résultat fondé sur les conditions publiques vérifiées le {{date}}. La décision appartient à la banque.',
  missingCriterion: 'FINCLUDIA ne dispose pas d’un critère public nécessaire pour calculer le montant maximal de cette banque.',
  compatible: 'Vos données semblent compatibles avec les critères publics renseignés ; cela ne garantit pas l’acceptation du dossier.',
  incompatible: 'Au moins un critère public affiché n’est pas satisfait. Vérifiez les conditions auprès de l’établissement.',
};

// ---------------------------------------------------------------------------
// Les règles que le moteur doit respecter sans les calculer
// ---------------------------------------------------------------------------

export const CREDIT_RULES = [
  {
    key: 'duration',
    label: 'Durée',
    rule: 'La durée vient du produit bancaire. Ne pas imposer 60 mois aux crédits hors consommation.',
  },
  {
    key: 'eligible_goods',
    label: 'Biens éligibles',
    rule: 'Le décret vise le crédit à la consommation des ménages ; les offres précisent les biens éligibles, notamment la production locale selon le produit. Vérifié seulement lorsque la banque le publie.',
  },
  {
    key: 'excessive_rates',
    label: 'Taux excessifs',
    rule: 'La Banque d’Algérie publie semestriellement des seuils de taux excessifs (instruction n° 06-2026 du 29/06/2026). Comparer un TEG publié et validé, jamais un taux nominal reconstitué.',
  },
  {
    key: 'final_decision',
    label: 'Décision finale',
    rule: 'L’établissement prêteur reste décisionnaire. FINCLUDIA affiche une simulation et une compatibilité avec des critères publics, jamais une décision.',
  },
];

// Les identifiants des formules du client, pour que chaque chiffre affiché
// puisse citer celle dont il sort.
export const CREDIT_FORMULAS = {
  CR01: 'i = taux_annuel / 12',
  CR02: 'M = P×i / (1−(1+i)^−n) ; si i = 0 : M = P/n',
  CR03: 'DSR_actuel = mensualités_existantes / revenu_éligible',
  CR04: 'DSR_futur = (mensualités_existantes + M) / revenu_éligible',
  CR05: 'M_cap = ratio_max_banque × revenu_éligible − mensualités_existantes',
  CR06: 'P_cap = M_cap × (1−(1+i)^−n) / i',
  CR07: 'P_quotité = prix_bien × quotité_max_banque',
  CR08: 'min(P_cap, P_quotité, plafond_montant_banque)',
  CR09: 'M×n + frais + assurance connue − capital emprunté',
  CR10: 'prix_bien − crédit_max, ou le pourcentage minimum publié par la banque',
};

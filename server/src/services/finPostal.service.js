import {
  POSTAL_BLOCKED_CALCULATIONS,
  POSTAL_CONTROLS,
  POSTAL_COVERAGE,
  POSTAL_PINPAD_SCALE,
  POSTAL_SERVICES,
  POSTAL_UNDOCUMENTED_FAMILIES,
} from '../constants/finPostal.js';

/**
 * Référentiel Algérie Poste / CCP (P4-17).
 *
 * Tout ce fichier tourne autour d'une seule règle, celle que le classeur du
 * client pose lui-même : **aucune ligne n'est publiable**. `publishable` et
 * `auto_compute` valent FALSE sur les 75 fiches, parce que la source est un
 * texte transmis et non une brochure officielle datée.
 *
 * La conséquence n'est pas « on ne sert rien ». C'est que le PUBLIC voit le
 * catalogue — quels services existent, par quel canal, à quelles conditions —
 * sans les montants, et avec la raison écrite ; tandis que l'ÉQUIPE voit tout,
 * y compris le texte tarifaire brut, pour aller chercher les preuves.
 *
 * Servir un tarif invérifiable sur une page publique, ce serait publier une
 * information financière que personne n'a datée. C'est précisément ce que ce
 * projet ne fait pas.
 *
 * Aucune fonction ici ne touche la base : le référentiel est un fichier généré.
 */

// Les champs qui portent un montant, un taux ou un plafond. Ce sont eux, et
// eux seuls, que la vue publique retire tant que la ligne n'est pas publiable.
const PRICED_FIELDS = [
  'fee_amount_dzd',
  'fee_amount_max_dzd',
  'fee_rate_max',
  'limit_min_dzd',
  'limit_max_dzd',
  'raw_tariff_text',
];

export const PUBLICATION_REASON =
  'Tarif transmis sans pièce officielle datée : non publié tant que la grille d’Algérie Poste n’est pas fournie (contrôle P01).';

/**
 * Une fiche telle qu'un visiteur peut la voir.
 *
 * Le service est nommé, son canal et ses conditions sont donnés — ce sont des
 * faits de procédure, pas des prix. Les montants sont `null` et la fiche DIT
 * pourquoi : « non publié » et « gratuit » ne doivent jamais se ressembler,
 * exactement comme « non calculé » et zéro ailleurs dans le produit.
 */
export function publicView(service) {
  const view = { ...service };
  if (!service.publishable) {
    for (const field of PRICED_FIELDS) view[field] = null;
    view.tarifStatut = 'non_publie';
    view.tarifRaison = PUBLICATION_REASON;
  } else {
    view.tarifStatut = 'publie';
    view.tarifRaison = null;
  }
  // Ces champs n'intéressent que l'équipe : ils décrivent l'état de la preuve,
  // pas le service.
  delete view.review_notes;
  delete view.verification_status;
  return view;
}

/** Le catalogue public : tout le monde voit quels services existent. */
export function publicCatalogue({ family = null, segment = null } = {}) {
  return POSTAL_SERVICES.filter((row) => (family ? row.service_family === family : true))
    .filter((row) => (segment ? row.customer_segment === segment : true))
    .map(publicView);
}

/**
 * Le coût annuel équivalent d'une fiche, quand il est calculable.
 *
 * Trois conditions, et l'absence d'une seule rend la réponse `null` plutôt
 * qu'approximative : la ligne doit autoriser le calcul (`auto_compute`), porter
 * un montant fixe, et nommer une périodicité connue. Un prix « par retrait » ou
 * « par transaction » n'a pas d'équivalent annuel sans savoir combien de fois
 * la personne le paiera — et ce nombre, nous ne l'inventons pas.
 */
const PERIODS_PER_YEAR = { Mensuelle: 12, Annuelle: 1, Trimestrielle: 4, Hebdomadaire: 52 };

export function annualEquivalent(service) {
  if (!service.auto_compute) {
    return { resultat: null, raison: 'calcul_non_autorise', detail: PUBLICATION_REASON };
  }
  if (service.fee_amount_dzd === null) {
    return { resultat: null, raison: 'montant_absent', detail: 'Aucun montant fixe déclaré.' };
  }
  const perYear = PERIODS_PER_YEAR[service.price_period];
  if (!perYear) {
    return {
      resultat: null,
      raison: 'periodicite_inconnue',
      detail: `Périodicité « ${service.price_period ?? 'non renseignée'} » : un coût à l’usage n’a pas d’équivalent annuel sans le nombre d’opérations.`,
    };
  }
  return { resultat: service.fee_amount_dzd * perYear, raison: null, detail: null };
}

/**
 * Le total annuel d'une sélection de services.
 *
 * Le piège que le classeur signale explicitement : l'abonnement TPE à 800 DA HT
 * et ses trois composantes (300 + 300 + 200) sont la MÊME dépense. Les
 * composantes portent un `parent_fee_id` ; si le parent est dans la sélection,
 * elles en sortent. Sans cela, un commerçant verrait 1 600 DA par mois au lieu
 * de 800.
 *
 * Et comme aucune ligne n'autorise le calcul aujourd'hui, ce total renvoie
 * `null` avec la liste de ce qui l'a empêché — jamais un total partiel, qui
 * se lirait comme un total complet.
 */
export function annualTotal(serviceIds) {
  const selected = POSTAL_SERVICES.filter((row) => serviceIds.includes(row.service_id));
  const parents = new Set(selected.map((row) => row.service_id));
  const counted = selected.filter((row) => !(row.parent_fee_id && parents.has(row.parent_fee_id)));
  const ignored = selected
    .filter((row) => row.parent_fee_id && parents.has(row.parent_fee_id))
    .map((row) => ({ service_id: row.service_id, raison: 'composante_du_forfait', parent: row.parent_fee_id }));

  const lines = counted.map((row) => ({ service_id: row.service_id, ...annualEquivalent(row) }));
  const blocked = lines.filter((line) => line.resultat === null);

  return {
    // Le client demande qu'un total impossible soit annoncé comme tel. Un
    // total qui ignorerait les lignes bloquées serait faux et le paraîtrait
    // juste, ce qui est pire.
    total: blocked.length > 0 ? null : lines.reduce((sum, line) => sum + line.resultat, 0),
    devise: 'DZD',
    lignes: lines,
    bloquees: blocked,
    ignorees: ignored,
  };
}

/** Ce que l'équipe doit obtenir avant de publier quoi que ce soit. */
export function pendingControls() {
  return POSTAL_CONTROLS.map((control) => ({ ...control, statut: 'ouvert' }));
}

/**
 * L'état du référentiel, en une réponse : ce qu'il couvre, ce qu'il ne couvre
 * pas, et ce qui empêche de le publier. C'est la page que l'équipe regarde
 * pour savoir quoi demander à Algérie Poste.
 */
export function referenceSummary() {
  const byKind = {};
  for (const row of POSTAL_SERVICES) byKind[row.entry_kind] = (byKind[row.entry_kind] ?? 0) + 1;

  return {
    fournisseur: { id: 'DZ_ALGERIE_POSTE', nom: 'Algérie Poste', pays: 'DZ' },
    fiches: POSTAL_SERVICES.length,
    // La distinction que le client répète : un plafond n'est pas un prix, un
    // délai non plus.
    parNature: byKind,
    publiables: POSTAL_SERVICES.filter((row) => row.publishable).length,
    calculables: POSTAL_SERVICES.filter((row) => row.auto_compute).length,
    raisonNonPublie: PUBLICATION_REASON,
    controlesOuverts: POSTAL_CONTROLS.length,
    calculsBloques: POSTAL_BLOCKED_CALCULATIONS,
    famillesNonDocumentees: POSTAL_UNDOCUMENTED_FAMILIES,
    // Dit une fois, pour que personne n'ait à le redécouvrir : l'absence de
    // donnée n'est pas l'absence de produit.
    avertissementNonDocumente:
      'Non documenté ne veut pas dire inexistant ni interdit : ces familles ne figurent pas dans le texte transmis, et rien ne doit en être déduit.',
    couverture: POSTAL_COVERAGE,
  };
}

/** Le barème PIN PAD, transcrit, avec la raison pour laquelle il ne calcule rien. */
export function pinpadScale() {
  return {
    code: 'PINPAD-01',
    tranches: POSTAL_PINPAD_SCALE,
    calculable: false,
    raison:
      'Le texte ne dit pas si le tarif est progressif marginal ou appliqué à tout le montant, ni comment arrondir les fractions de 1 000 DA. Deux lectures donnent deux prix : aucun n’est calculé (contrôle P03).',
  };
}

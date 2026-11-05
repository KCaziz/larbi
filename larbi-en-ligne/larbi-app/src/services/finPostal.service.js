import {
  POSTAL_BLOCKED_CALCULATIONS,
  POSTAL_CONTROLS,
  POSTAL_COVERAGE,
  POSTAL_PINPAD_SCALE,
  POSTAL_SERVICES,
  POSTAL_UNDOCUMENTED_FAMILIES,
} from '../constants/finPostal.js';
import { SOURCE_PUBLICATION } from '../constants/finPublication.js';

/**
 * Référentiel Algérie Poste / CCP (P4-17).
 *
 * Tout ce fichier tourne autour d'une seule règle, celle que le classeur du
 * client pose lui-même : **aucune ligne n'est publiable**. `publishable` et
 * `auto_compute` valent FALSE sur les 75 fiches, parce que la source est un
 * texte transmis et non une brochure officielle datée.
 *
 * Jusqu'au 2026-10-28, le PUBLIC voyait le catalogue sans les montants. Depuis,
 * à la demande du client (P8-28), les tarifs sont montrés, chacun avec sa
 * provenance (`SOURCE_PUBLICATION`) : une information de la source du client,
 * jamais présentée comme vérifiée par FINCLUDIA. Aucun CALCUL n'en est tiré
 * (`auto_compute` reste faux) tant qu'une grille officielle datée manque.
 *
 * Aucune fonction ici ne touche la base : le référentiel est un fichier généré.
 */

// Why no CALCULATION is made from these tariffs (they are shown since
// 2026-10-28, see publicView).
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
  if (service.publishable) {
    view.tarifStatut = 'publie';
    view.tarifRaison = null;
  } else {
    // Shown at the client's request of 2026-10-28 (P8-28), with where it comes
    // from: a tariff of the client's source, not one checked by FINCLUDIA.
    // Still never computed with (`auto_compute` stays false).
    view.tarifStatut = 'source_client';
    view.tarifRaison = SOURCE_PUBLICATION.notice;
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
    // Shown with their provenance at the client's request (P8-28).
    affichees: POSTAL_SERVICES.length,
    affichage: SOURCE_PUBLICATION,
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

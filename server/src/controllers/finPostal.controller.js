import { POSTAL_SERVICES } from '../constants/finPostal.js';
import {
  annualTotal,
  pendingControls,
  pinpadScale,
  publicCatalogue,
  publicView,
  referenceSummary,
} from '../services/finPostal.service.js';
import { HttpError } from '../utils/httpError.js';

// Référentiel Algérie Poste / CCP (P4-17).
//
// Deux publics, deux vues, et la différence tient en une phrase : le visiteur
// voit QUELS services existent, l'équipe voit AUSSI ce qu'ils coûtent d'après
// un texte que personne n'a daté.
//
// Les routes publiques ne servent donc jamais un montant non publiable. Ce
// n'est pas de la prudence d'affichage : publier un tarif invérifiable sur une
// page publique, c'est publier une information financière fausse jusqu'à preuve
// du contraire, et le classeur du client l'interdit explicitement.

export function getSummary(req, res) {
  res.json(referenceSummary());
}

export function getCatalogue(req, res) {
  const { famille, segment } = req.query;
  res.json({
    services: publicCatalogue({ family: famille ?? null, segment: segment ?? null }),
    // Répété dans chaque réponse plutôt que supposé connu : une interface qui
    // ne lit que `services` doit quand même pouvoir dire pourquoi les montants
    // sont vides.
    tarifs: referenceSummary().raisonNonPublie,
  });
}

export function getService(req, res, next) {
  const service = POSTAL_SERVICES.find((row) => row.service_id === req.params.id);
  if (!service) return next(new HttpError(404, 'Not found'));
  return res.json({ service: publicView(service) });
}

export function getPinpad(req, res) {
  res.json(pinpadScale());
}

// Les 16 contrôles à obtenir d'Algérie Poste. Publiés : ce sont les questions
// ouvertes du référentiel, et une liste que personne ne rouvre ne fait avancer
// aucune d'elles.
export function getControls(req, res) {
  res.json({ controles: pendingControls() });
}

// Le coût annuel d'une sélection — qui, aujourd'hui, répond `null` sur tout,
// avec la raison ligne par ligne. La route existe pour que cette réponse soit
// VISIBLE plutôt que devinée, et elle deviendra utile sans changer de forme le
// jour où des lignes passeront `auto_compute`.
export function postAnnualTotal(req, res) {
  res.json(annualTotal(req.body.services));
}

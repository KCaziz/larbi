import { CREDIT_OFFERS } from '../constants/finCreditOffers.js';
import { SOURCE_PUBLICATION } from '../constants/finPublication.js';
import { checkAgainstOffer, compareFinancing, creditRules, simulate } from '../services/finCredit.service.js';
import { HttpError } from '../utils/httpError.js';

// Simulateur de crédit (P4-02) et comparaison de financements (P4-15).
//
// Calcul pur, aucune écriture : la personne saisit son projet, le serveur
// calcule. Rien n'est conservé, et aucune offre n'est publiée — les 25 fiches
// du référentiel attendent le contrôle des brochures officielles.

export function getCreditRules(req, res) {
  res.json(creditRules());
}

export function postSimulate(req, res) {
  res.json(simulate(req.body));
}

// La liste des offres. Depuis le 2026-10-28, à la demande du client (P8-28),
// chaque fiche est montrée avec ses critères tels que la source les écrit, son
// statut déclaré et sa provenance — jamais comme vérifiée par FINCLUDIA.
// `publiable` garde son sens : une offre dont les critères permettent un
// calcul d'éligibilité, ce qu'aucune n'autorise encore.
export function getOffers(req, res) {
  const { kind } = req.query;
  const rows = CREDIT_OFFERS.filter((row) => (kind ? row.kind === kind : true));
  res.json({
    offres: rows.map((row) => ({
      ref: row.ref,
      banque: row.bank,
      produit: row.product,
      type: row.kind,
      islamique: row.islamic,
      publiable: row.publishable,
      raisonNonPubliee: row.publishable ? null : row.blockedReason,
      criteres: {
        taux: row.rateText,
        duree: row.durationText,
        effort: row.dsrText,
        apport: row.downPaymentText,
        age: row.ageText,
        revenu: row.incomeText,
      },
      statutDeclare: row.declaredStatus,
      source: row.source,
    })),
    publiables: rows.filter((row) => row.publishable).length,
    total: rows.length,
    affichage: SOURCE_PUBLICATION,
  });
}

export function getOffer(req, res, next) {
  const checked = checkAgainstOffer(req.params.ref);
  if (!checked) return next(new HttpError(404, 'Not found'));
  return res.json(checked);
}

export function getComparison(req, res) {
  res.json(compareFinancing(req.query));
}

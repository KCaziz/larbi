import { decodePayslip, payrollReference } from '../services/finPayroll.service.js';

// Décodeur de fiche de paie (P4-14, écran C15).
//
// Aucune écriture, aucune lecture en base : la personne saisit sa fiche, le
// serveur l'explique. Rien n'est conservé — une fiche de paie est une donnée
// sensible, et le client ne demande pas qu'on la garde. L'ajout au revenu
// mensuel se fait par le module revenus (P6-04), après confirmation explicite.

export function getPayrollReference(req, res) {
  res.json(payrollReference());
}

export function postDecodePayslip(req, res) {
  res.json(decodePayslip(req.body));
}

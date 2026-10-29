import { prisma } from '../config/prisma.js';
import { decodePayslip, deletePayslip, keepPayslip, listPayslips, payrollReference } from '../services/finPayroll.service.js';
import { HttpError } from '../utils/httpError.js';

// Décodeur de fiche de paie (P4-14, écran C15).
//
// Le décodage n'écrit ni ne lit rien en base : la personne saisit sa fiche, le
// serveur l'explique. Une fiche de paie est une donnée sensible : elle n'est
// conservée que si la personne le demande, avec son consentement (historique,
// P8-15, réponse D5 du client), et elle peut la supprimer. L'ajout au revenu
// mensuel se fait par le module revenus (P6-04), après confirmation explicite.

export function getPayrollReference(req, res) {
  res.json(payrollReference());
}

export function postDecodePayslip(req, res) {
  res.json(decodePayslip(req.body));
}

// The history (P8-15): only the payslips the person chose to keep.
export async function getPayslips(req, res) {
  res.json({ fiches: await listPayslips(prisma, req.user.id) });
}

export async function postPayslip(req, res) {
  const { consent, ...entry } = req.body;
  res.status(201).json({ fiche: await keepPayslip(prisma, req.user.id, entry) });
}

export async function removePayslip(req, res) {
  if (!(await deletePayslip(prisma, req.user.id, req.params.id))) throw new HttpError(404, 'Not found');
  res.status(204).end();
}

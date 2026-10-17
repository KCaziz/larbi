import { prisma } from '../config/prisma.js';
import { BUSINESS_BLOCKED_STATEMENTS, BUSINESS_LEGAL_FORMS, BUSINESS_PAYMENT_METHODS } from '../constants/finBusiness.js';
import {
  businessDashboard,
  createBusiness,
  createContact,
  createDocument,
  createPayment,
  findBusiness,
  listContacts,
  listDocuments,
  updateBusiness,
} from '../services/finBusiness.service.js';

// Espace entreprise (P7-02).
//
// Aucune route ne prend d'identifiant d'entreprise : elle est toujours déduite
// de la session. C'est ce qui rend impossible de lire la comptabilité d'un
// autre compte en changeant un identifiant dans l'URL — et c'est vérifié par
// un test de sécurité plutôt que laissé à la relecture.

export function getReferences(req, res) {
  res.json({
    formesJuridiques: BUSINESS_LEGAL_FORMS,
    moyensReglement: BUSINESS_PAYMENT_METHODS,
    // Publié avec les références : l'interface sait dès son premier appel ce
    // qu'elle ne pourra pas proposer, et pourquoi.
    etatsNonProduits: BUSINESS_BLOCKED_STATEMENTS,
  });
}

export async function getBusiness(req, res) {
  res.json({ entreprise: await findBusiness(prisma, req.user.id) });
}

export async function postBusiness(req, res) {
  res.status(201).json({ entreprise: await createBusiness(prisma, req.user.id, req.body) });
}

export async function putBusiness(req, res) {
  res.json({ entreprise: await updateBusiness(prisma, req.user.id, req.body) });
}

export async function getContacts(req, res) {
  res.json({ tiers: await listContacts(prisma, req.user.id, req.query) });
}

export async function postContact(req, res) {
  res.status(201).json({ tiers: await createContact(prisma, req.user.id, req.body) });
}

export async function getDocuments(req, res) {
  res.json({ documents: await listDocuments(prisma, req.user.id, req.query) });
}

export async function postDocument(req, res) {
  res.status(201).json({ document: await createDocument(prisma, req.user.id, req.body) });
}

export async function postPayment(req, res) {
  res.status(201).json({ reglement: await createPayment(prisma, req.user.id, req.params.id, req.body) });
}

export async function getDashboard(req, res) {
  res.json(await businessDashboard(prisma, req.user.id, req.query));
}

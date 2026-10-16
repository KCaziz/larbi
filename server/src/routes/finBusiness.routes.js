import { Router } from 'express';
import {
  getBusiness,
  getContacts,
  getDashboard,
  getDocuments,
  getReferences,
  postBusiness,
  postContact,
  postDocument,
  postPayment,
  putBusiness,
} from '../controllers/finBusiness.controller.js';
import { requireAdult, requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import {
  contactQuerySchema,
  createBusinessSchema,
  createContactSchema,
  createDocumentSchema,
  createPaymentSchema,
  dashboardQuerySchema,
  documentQuerySchema,
  updateBusinessSchema,
} from '../validation/finBusiness.schemas.js';

// Espace entreprise (P7-02).
//
// Réservé aux majeurs, et la garde est LIÉE À SON CHEMIN. Un
// `router.use(requireAdult)` sans chemin s'appliquerait à toutes les routes
// `/fin/*` déclarées après celle-ci, puisqu'elles partagent le même préfixe :
// c'est le défaut qui avait enfermé les mineurs hors de leur propre argent en
// P6-17, et il ne sera pas réintroduit ici.
//
// Pourquoi 18+ : exercer une activité commerciale, émettre des factures et
// porter des dettes fournisseurs ne sont pas des gestes de mineur. La règle
// est du même ordre que celle qui réserve les dettes personnelles.
const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);
router.use('/entreprise', requireAdult);

router.get('/entreprise/references', getReferences);
router.get('/entreprise', asyncRoute(getBusiness));
router.post('/entreprise', validateBody(createBusinessSchema), asyncRoute(postBusiness));
router.put('/entreprise', validateBody(updateBusinessSchema), asyncRoute(putBusiness));

router.get('/entreprise/tiers', validateQuery(contactQuerySchema), asyncRoute(getContacts));
router.post('/entreprise/tiers', validateBody(createContactSchema), asyncRoute(postContact));

router.get('/entreprise/documents', validateQuery(documentQuerySchema), asyncRoute(getDocuments));
router.post('/entreprise/documents', validateBody(createDocumentSchema), asyncRoute(postDocument));
router.post('/entreprise/documents/:id/reglements', validateBody(createPaymentSchema), asyncRoute(postPayment));

router.get('/entreprise/tableau-de-bord', validateQuery(dashboardQuerySchema), asyncRoute(getDashboard));

export default router;

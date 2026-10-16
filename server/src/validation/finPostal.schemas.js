import { z } from 'zod';
import { POSTAL_SERVICES } from '../constants/finPostal.js';

// Entrées du référentiel Algérie Poste / CCP (P4-17).
//
// Les identifiants sont vérifiés contre le référentiel LUI-MÊME, pas contre un
// motif : `AP-999` a la bonne forme et ne désigne rien. Un comparateur qui
// accepte un service inexistant répond sur du vide.
const SERVICE_IDS = POSTAL_SERVICES.map((row) => row.service_id);

export const annualTotalSchema = z
  .object({
    services: z.array(z.enum(SERVICE_IDS)).min(1).max(POSTAL_SERVICES.length),
  })
  .strict();

export const catalogueQuerySchema = z
  .object({
    famille: z.enum([...new Set(POSTAL_SERVICES.map((row) => row.service_family))]).optional(),
    segment: z.enum([...new Set(POSTAL_SERVICES.map((row) => row.customer_segment))]).optional(),
  })
  .strict();

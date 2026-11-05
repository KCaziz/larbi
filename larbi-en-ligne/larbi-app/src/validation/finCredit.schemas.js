import { z } from 'zod';
import { CONSUMER_KINDS } from '../constants/finCredit.js';
import { CREDIT_KINDS, CREDIT_OFFERS } from '../constants/finCreditOffers.js';

// Entrées du simulateur de crédit (P4-02) et de la comparaison de financements
// (P4-15). Montants entiers en centimes, taux en décimal, champ inconnu refusé.
//
// Le TAUX est saisi par la personne, pas choisi dans une offre : aucune des 25
// fiches du référentiel n'est publiable, et proposer un taux de banque dans un
// menu déroulant reviendrait à le publier.
const amount = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const positiveAmount = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);

export const simulateCreditSchema = z
  .object({
    principal: positiveAmount,
    // 0 accepté : un financement sans intérêt existe, et la formule le prévoit.
    annualRate: z.number().min(0).max(1),
    months: z.number().int().min(1).max(600),
    income: positiveAmount.optional().nullable(),
    existingInstalments: amount.optional(),
    fees: amount.optional(),
    insurance: amount.optional(),
    // La nature du crédit décide si le plafond légal s'applique. Elle est
    // choisie dans la liste du client, jamais libre : « Consommation » et
    // « consommation » ne doivent pas donner deux règles différentes.
    kind: z.enum([...new Set([...CREDIT_KINDS, ...CONSUMER_KINDS])]).optional().nullable(),
  })
  .strict();

export const offerQuerySchema = z
  .object({ kind: z.enum([...new Set(CREDIT_KINDS)]).optional() })
  .strict();

export const offerRefSchema = z.enum(CREDIT_OFFERS.map((row) => row.ref));

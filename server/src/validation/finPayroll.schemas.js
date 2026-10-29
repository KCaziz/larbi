import { z } from 'zod';
import { PAYSLIP_LINE_KEYS } from '../constants/finPayroll.js';

// Entrées du décodeur de fiche de paie (P4-14). Mêmes conventions que le reste
// du moteur : montants entiers en centimes, champ inconnu refusé.
//
// Les montants sont saisis POSITIFS, y compris les retenues : une personne lit
// « IRG 4 500 » sur sa fiche, pas « −4 500 ». Le sens vient du type de ligne,
// pas du signe, ce qui évite qu'une retenue saisie en négatif s'ajoute au net.
const amount = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);

export const decodePayslipSchema = z
  .object({
    lines: z
      .array(
        z
          .object({
            kind: z.enum(PAYSLIP_LINE_KEYS),
            label: z.string().trim().max(80).optional(),
            value: amount,
          })
          .strict(),
      )
      .min(1)
      .max(60),
    // Le net inscrit sur la fiche, pour le comparer à celui que donnent les
    // lignes. Facultatif : beaucoup de gens saisiront d'abord les lignes.
    declaredNet: amount.optional().nullable(),
    period: z.string().trim().max(20).optional().nullable(),
  })
  .strict();

// Keeping a payslip (P8-15, the client's answer D5): the same entry, and the
// person's explicit consent — `true` is the only accepted value.
export const keepPayslipSchema = decodePayslipSchema.extend({ consent: z.literal(true) }).strict();

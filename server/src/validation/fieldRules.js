import { z } from 'zod';

// R20 (2026-11-28): the fields that were free text and accepted anything
// (letters in a phone number, a NIF of three characters). The same rules as
// the screens (client/src/components/fincludia/BusinessFields.jsx).
//
// - Phone: digits, spaces, dots, dashes, brackets, a leading « + »; 6 to 15 digits.
// - NIF (numéro d'identification fiscale): 15 digits, or 20 for the newer form.
// - NIS (numéro d'identification statistique): 15 digits.
// - Trade register (RC): letters, digits, spaces, « / » and « - », 5 to 30
//   characters, at least one digit (« 16/00-0123456 B 12 »).

const optional = (schema) =>
  z.preprocess((value) => (typeof value === 'string' && value.trim() === '' ? null : value), schema.optional().nullable());

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9 .()-]{5,23}$/, { message: 'Invalid phone number' })
  .refine((value) => {
    const digits = value.replace(/\D/g, '').length;
    return digits >= 6 && digits <= 15;
  }, { message: 'Invalid phone number' });

export const nifSchema = z.string().trim().regex(/^(\d{15}|\d{20})$/, { message: 'A NIF has 15 or 20 digits' });
export const nisSchema = z.string().trim().regex(/^\d{15}$/, { message: 'A NIS has 15 digits' });
export const tradeRegisterSchema = z
  .string()
  .trim()
  .regex(/^[0-9A-Za-z][0-9A-Za-z /-]{4,29}$/, { message: 'Invalid trade register number' })
  .refine((value) => /\d/.test(value), { message: 'Invalid trade register number' });

export const optionalPhone = optional(phoneSchema);
export const optionalNif = optional(nifSchema);
export const optionalNis = optional(nisSchema);
export const optionalTradeRegister = optional(tradeRegisterSchema);

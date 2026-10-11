import { z } from 'zod';
import { INVOICE_LANGUAGES, INVOICE_LIMITS } from '../constants/invoice.js';

// Invoice generator (P4-03). Numbers travel as TEXT ("1,5", "2500.50") and are
// turned into integers on the server (services/invoice.service.js): no floating
// point between what the person typed and the totals.
const decimal = (intDigits, fracDigits) => z.string().trim().regex(new RegExp(`^\\d{1,${intDigits}}(?:[.,]\\d{1,${fracDigits}})?$`));
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s), 'invalid date');

const party = z
  .object({
    name: z.string().trim().min(1).max(INVOICE_LIMITS.partyName),
    // Address, identifiers, contact: free lines, written by the person. No legal
    // identifier is imposed or invented (they depend on the country and status).
    details: z.string().trim().max(INVOICE_LIMITS.partyDetails).default(''),
  })
  .strict();

const line = z
  .object({
    description: z.string().trim().min(1).max(INVOICE_LIMITS.description),
    quantity: decimal(7, 3),
    unitPrice: decimal(12, 3),
    // Typed by the person: the platform does not decide which rate applies.
    vatRate: decimal(3, 2),
  })
  .strict();

export const invoiceSchema = z
  .object({
    language: z.enum(INVOICE_LANGUAGES).default('fr'),
    number: z.string().trim().min(1).max(INVOICE_LIMITS.number),
    issueDate: isoDate,
    dueDate: z.union([isoDate, z.literal('')]).default(''),
    currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
    seller: party,
    buyer: party,
    lines: z.array(line).min(1).max(INVOICE_LIMITS.lines),
    notes: z.string().trim().max(INVOICE_LIMITS.notes).default(''),
  })
  .strict();

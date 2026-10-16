import { z } from 'zod';
import {
  BUSINESS_CONTACT_KINDS,
  BUSINESS_DOCUMENT_KINDS,
  BUSINESS_LEGAL_FORMS,
  BUSINESS_PAYMENT_METHODS,
} from '../constants/finBusiness.js';

// Entrées de l'espace entreprise (P7-02). Mêmes conventions que le reste du
// moteur : montants entiers en centimes, devise obligatoire, champ inconnu
// refusé plutôt qu'ignoré.
//
// Les identifiants fiscaux (NIF, RC, NIS) sont des chaînes libres bornées, et
// c'est délibéré : nous n'avons pas la règle officielle de composition, et un
// format inventé refuserait des entreprises réelles.

const amount = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const positiveAmount = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const currency = z.string().regex(/^[A-Z]{3}$/);
const shortText = (max) => z.string().trim().min(1).max(max);
const optionalText = (max) => z.string().trim().max(max).optional().nullable();
const isoDate = z.coerce.date();

export const createBusinessSchema = z
  .object({
    name: shortText(160),
    legalForm: z.enum(BUSINESS_LEGAL_FORMS).optional().nullable(),
    taxId: optionalText(40),
    tradeRegister: optionalText(40),
    statisticalId: optionalText(40),
    activity: optionalText(160),
    currency,
    fiscalYearStartMonth: z.number().int().min(1).max(12).optional(),
  })
  .strict();

export const updateBusinessSchema = createBusinessSchema.partial().strict();

export const createContactSchema = z
  .object({
    kind: z.enum(BUSINESS_CONTACT_KINDS),
    name: shortText(160),
    taxId: optionalText(40),
    email: z.string().trim().email().max(254).optional().nullable(),
    phone: optionalText(40),
    address: optionalText(300),
    country: z.string().regex(/^[A-Z]{2}$/).optional().nullable(),
    note: optionalText(300),
  })
  .strict();

export const contactQuerySchema = z.object({ kind: z.enum(BUSINESS_CONTACT_KINDS).optional() }).strict();

export const createDocumentSchema = z
  .object({
    kind: z.enum(BUSINESS_DOCUMENT_KINDS),
    number: shortText(40),
    label: shortText(200),
    contactId: z.string().uuid().optional().nullable(),
    issuedAt: isoDate,
    dueAt: isoDate.optional().nullable(),
    // Hors taxe et taxe sont déclarés tous les deux. Aucun taux de TVA n'est
    // appliqué ici : le taux appartient au document réel, et le projet
    // n'invente pas de règle fiscale.
    amountExcl: amount,
    taxAmount: amount.optional(),
    currency,
    note: optionalText(300),
  })
  .strict()
  .refine((doc) => !doc.dueAt || doc.dueAt >= doc.issuedAt, {
    message: 'An due date cannot precede the issue date',
    path: ['dueAt'],
  });

export const documentQuerySchema = z
  .object({
    kind: z.enum(BUSINESS_DOCUMENT_KINDS).optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
  })
  .strict();

export const createPaymentSchema = z
  .object({
    value: positiveAmount,
    currency,
    receivedAt: isoDate,
    method: z.enum(BUSINESS_PAYMENT_METHODS).optional().nullable(),
    note: optionalText(300),
  })
  .strict();

export const dashboardQuerySchema = z.object({ from: isoDate.optional(), to: isoDate.optional() }).strict();

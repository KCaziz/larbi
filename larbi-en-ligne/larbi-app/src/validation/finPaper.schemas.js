import { z } from 'zod';
import { MAX_PAPER_FEE_RATE, PAPER_CAPITAL_MAX, PAPER_CAPITAL_MIN, PAPER_TRADE_KINDS, RISK_QUESTIONS } from '../constants/finPaper.js';
import { amountSchema, currencySchema } from './finData.schemas.js';

// Paper portfolio (P6-12). Everything here is fictional, and the server pins
// the status: there is no field by which a caller could ask for anything else.

const note = z.string().trim().min(1).max(300).nullable().optional();
const isoDate = z.coerce.date();
// A price of zero is not a price; a quantity of zero is not a trade.
const priceSchema = amountSchema.min(1);

export const updatePortfolioSchema = z
  .object({
    // « Capital fictif modifiable » — the client's own wording.
    capital: amountSchema.min(PAPER_CAPITAL_MIN).max(PAPER_CAPITAL_MAX).optional(),
    // The simulated fee rate, as a decimal. Bounded, and visible everywhere it
    // is used: never a hidden coefficient.
    feeRate: z.number().min(0).max(MAX_PAPER_FEE_RATE).optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to change' });

export const resetPortfolioSchema = z
  .object({ capital: amountSchema.min(PAPER_CAPITAL_MIN).max(PAPER_CAPITAL_MAX).optional() })
  .strict();

// An instrument the person names, with THEIR simulated price. There is no
// catalogue to pick from: the client has supplied none, and inventing one is
// exactly what its rule forbids.
export const addInstrumentSchema = z
  .object({
    label: z.string().trim().min(1).max(80),
    markPrice: priceSchema,
    // Dated, like a real asset's valuation (P6-11): a price nobody can date is
    // a price nobody can check.
    markedAt: isoDate,
    note,
  })
  .strict();

export const markInstrumentSchema = z.object({ markPrice: priceSchema, markedAt: isoDate, note }).strict();

export const tradeSchema = z
  .object({
    instrumentId: z.string().uuid(),
    kind: z.enum(PAPER_TRADE_KINDS),
    quantity: z.number().int().min(1).max(1_000_000),
    unitPrice: priceSchema,
    decidedAt: isoDate,
    // WHY. Optional, because the client never requires a justification before
    // anything can be recorded — but this is what makes it a decision journal.
    note,
  })
  .strict();

// « Rééquilibrage »: target shares per instrument, which must add up to 1. A
// set that does not is refused rather than normalised behind the person's back.
export const rebalanceSchema = z
  .object({ targets: z.record(z.string().uuid(), z.number().min(0).max(1)) })
  .strict()
  .refine((body) => Object.keys(body.targets).length > 0, { message: 'No target given' })
  .refine((body) => Math.abs(Object.values(body.targets).reduce((sum, share) => sum + share, 0) - 1) <= 0.0001, {
    message: 'The target shares must add up to 100 %',
    path: ['targets'],
  });

// The educational risk questionnaire. Each answer must be one of its own
// question's options: a free-text answer could not be scored.
export const riskAnswersSchema = z
  .object(
    Object.fromEntries(
      RISK_QUESTIONS.map((question) => [question.key, z.enum(question.options.map((option) => option.key)).optional()]),
    ),
  )
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'No answer given' });

export const portfolioQuerySchema = z
  .object({ currency: currencySchema.optional(), noticeShare: z.coerce.number().min(0.01).max(1).optional() })
  .strict();

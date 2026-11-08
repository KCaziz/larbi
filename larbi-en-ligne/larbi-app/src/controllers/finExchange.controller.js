import { prisma } from '../config/prisma.js';
import { OFFICIAL_CURRENCY, SUPPORTED_CURRENCIES } from '../constants/finCurrencies.js';
import { listRates, recordRate } from '../services/finExchange.service.js';

// P10-05 — the currencies one can hold, and the official rates in use.
export async function getCurrencies(req, res) {
  res.json({ devises: SUPPORTED_CURRENCIES, officielle: OFFICIAL_CURRENCY, cours: await listRates(prisma) });
}

// An administrator records the official rate of a reference date.
export async function postRate(req, res) {
  res.status(201).json({ cours: await recordRate(prisma, req.body) });
}

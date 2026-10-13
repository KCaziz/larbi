import { prisma } from '../config/prisma.js';
import {
  DEFAULT_PAPER_CAPITAL,
  DEFAULT_PAPER_FEE_RATE,
  MAX_PAPER_FEE_RATE,
  PAPER_CONCENTRATION_NOTICE,
  PAPER_EXPORT_COLUMNS,
  PAPER_INSTRUMENTS_MAX,
  PAPER_TRADE_KINDS,
  READINESS_CHECKS,
  RISK_QUESTIONNAIRE_VERSION,
  RISK_QUESTIONS,
} from '../constants/finPaper.js';
import { buildDebtSynthesis, listDebts } from '../services/finDebt.service.js';
import { buildGoalView, listGoals } from '../services/finGoal.service.js';
import {
  addInstrument,
  buildPortfolioView,
  getOrCreatePortfolio,
  listInstruments,
  listTrades,
  markInstrument,
  rebalancePlan,
  readiness,
  recordTrade,
  resetPortfolio,
  riskProfile,
  updatePortfolio,
} from '../services/finPaper.service.js';
import { buildReserveView } from '../services/finReserve.service.js';
import { buildSynthesis, currentMonth, loadSynthesisData } from '../services/finSynthesis.service.js';
import { describeFormula } from '../services/finance/describe.js';

// Paper portfolio and investment workshop (P6-12), screens C17 and EP03-EP07.
//
// Every figure is fictional and says so. Nothing here is ever added to a real
// total, and nothing is ever executed anywhere.

export function getPaperReferences(req, res) {
  res.json({
    tradeKinds: PAPER_TRADE_KINDS,
    defaultCapital: DEFAULT_PAPER_CAPITAL,
    defaultFeeRate: DEFAULT_PAPER_FEE_RATE,
    maxFeeRate: MAX_PAPER_FEE_RATE,
    instrumentsMax: PAPER_INSTRUMENTS_MAX,
    concentrationNotice: PAPER_CONCENTRATION_NOTICE,
    exportColumns: PAPER_EXPORT_COLUMNS,
    readinessChecks: READINESS_CHECKS,
    riskQuestions: RISK_QUESTIONS,
    riskQuestionnaireVersion: RISK_QUESTIONNAIRE_VERSION,
    // Said out loud by the API, because it is the honest limit of this screen:
    // there is no instrument catalogue and no published price. The client has
    // supplied neither, and its own rule for this task forbids inventing them.
    instrumentCatalogue: null,
    instrumentCatalogueWaitingOn: 'P6-01',
    pricesDeclaredByThePerson: true,
    formulas: ['F036', 'F037', 'F038', 'F039', 'F040', 'F057'].map(describeFormula),
  });
}

async function viewFor(req) {
  const portfolio = await getOrCreatePortfolio(prisma, req.user.id, { currency: req.user.finCurrency });
  const [instruments, trades] = await Promise.all([listInstruments(prisma, portfolio.id), listTrades(prisma, portfolio.id)]);
  return {
    portfolio,
    instruments,
    trades,
    view: buildPortfolioView({
      portfolio,
      instruments,
      trades,
      noticeShare: req.query?.noticeShare ?? PAPER_CONCENTRATION_NOTICE,
    }),
  };
}

export async function getPortfolio(req, res) {
  const { view } = await viewFor(req);
  res.json({ portefeuille: view, formulas: ['F038', 'F039', 'F040', 'F036', 'F037'].map(describeFormula) });
}

export async function patchPortfolio(req, res) {
  res.json({ portefeuille: await updatePortfolio(prisma, req.user.id, req.body) });
}

export async function postReset(req, res) {
  // The trades go with it. That is right here and nowhere else in Phase 6:
  // nothing in this table ever fed a real history, and a reset that kept the
  // old decisions would not be a reset. The journal is exportable first.
  res.json({ portefeuille: await resetPortfolio(prisma, req.user.id, { capital: req.body?.capital }) });
}

export async function getInstruments(req, res) {
  const portfolio = await getOrCreatePortfolio(prisma, req.user.id, { currency: req.user.finCurrency });
  res.json({ instruments: await listInstruments(prisma, portfolio.id) });
}

export async function postInstrument(req, res) {
  res.status(201).json({ instrument: await addInstrument(prisma, req.user.id, req.body) });
}

export async function putInstrumentPrice(req, res) {
  res.json({ instrument: await markInstrument(prisma, req.user.id, req.params.id, req.body) });
}

export async function postTrade(req, res) {
  const trade = await recordTrade(prisma, req.user.id, req.body);
  // The fresh portfolio travels back with it: a buy changes the cash, and a
  // screen that had to ask again would show a stale figure for a moment.
  const portfolio = await getOrCreatePortfolio(prisma, req.user.id);
  res.status(201).json({ trade, portefeuille: { cash: portfolio.cash, capital: portfolio.capital } });
}

// The decision journal (screen EP07).
export async function getTrades(req, res) {
  const portfolio = await getOrCreatePortfolio(prisma, req.user.id, { currency: req.user.finCurrency });
  const [trades, instruments] = await Promise.all([listTrades(prisma, portfolio.id), listInstruments(prisma, portfolio.id)]);
  const labels = new Map(instruments.map((row) => [row.id, row.label]));
  res.json({ decisions: trades.map((trade) => ({ ...trade, instrument: labels.get(trade.instrumentId) ?? null })) });
}

// One CSV cell. Quoted always, and a value that starts like a formula is
// prefixed with a quote: a spreadsheet would otherwise EXECUTE `=...` from a
// note somebody typed (the same rule as P6-04's export).
function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function exportTrades(req, res) {
  const portfolio = await getOrCreatePortfolio(prisma, req.user.id, { currency: req.user.finCurrency });
  const [trades, instruments] = await Promise.all([listTrades(prisma, portfolio.id), listInstruments(prisma, portfolio.id)]);
  const labels = new Map(instruments.map((row) => [row.id, row.label]));

  const lines = [PAPER_EXPORT_COLUMNS.map(csvCell).join(',')];
  for (const trade of trades) {
    lines.push(
      [
        trade.decidedAt.toISOString().slice(0, 10),
        trade.kind,
        labels.get(trade.instrumentId) ?? '',
        trade.quantity,
        trade.unitPrice,
        trade.fee,
        trade.quantity * trade.unitPrice,
        trade.currency,
        trade.note ?? '',
      ]
        .map(csvCell)
        .join(','),
    );
  }
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', 'attachment; filename="journal-de-decisions.csv"');
  res.set('Cache-Control', 'private, no-store');
  res.send(`﻿${lines.join('\r\n')}\r\n`);
}

// « Rééquilibrage »: proposed, never applied.
export async function postRebalance(req, res) {
  const { view } = await viewFor(req);
  const plan = rebalancePlan({
    positions: view.positions.filter((position) => position.quantity > 0),
    invested: view.valeurInvestie.resultat,
    targets: req.body.targets,
    currency: view.currency,
  });
  res.json({ plan, applique: false });
}

/**
 * « Suis-je prêt à commencer ? » (screen EP03).
 *
 * Reads the reserve (P6-09), the goals (P6-08), the net flow (P6-04) and the
 * debt effort (P6-10). It answers; it never blocks — the client is explicit
 * that educational access is not gated on any of it.
 */
export async function getReadiness(req, res) {
  const currency = req.user.finCurrency;
  const period = currentMonth();
  const [reserve, goalRows, debtRows, synthesisData] = await Promise.all([
    buildReserveView(prisma, req.user.id, { currency, targetMonths: req.user.finReserveTargetMonths ?? null }),
    listGoals(prisma, req.user.id),
    listDebts(prisma, req.user.id),
    loadSynthesisData(prisma, req.user.id, period),
  ]);
  const synthesis = buildSynthesis({ ...synthesisData, fallbackCurrency: currency, period });
  const debts = debtRows.length === 0 ? null : buildDebtSynthesis(debtRows, { netMonthlyIncome: synthesis.revenus.resultat, currency });

  res.json({
    diagnostic: readiness({
      reserve,
      goals: goalRows.map((goal) => ({ id: goal.id, label: goal.label, view: buildGoalView(goal) })),
      netFlow: synthesis.fluxNet,
      debtEffort: debts?.tauxEffort ?? null,
    }),
    // Stated in the answer, so no screen can turn this into a gate by mistake.
    accesEducatifBloque: false,
  });
}

export function postRiskProfile(req, res) {
  // No thresholds are passed, because the client has not validated any
  // (P6-01). F057 therefore returns no category, and none is invented here: the
  // score is shown, the label is not.
  res.json({ profil: riskProfile(req.body) });
}

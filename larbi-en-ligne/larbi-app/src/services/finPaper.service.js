// Paper portfolio and investment workshop (P6-12): screens C17 and EP03 to
// EP07, F038 / F039 / F040 / F057.
//
// Three rules shape the whole file:
//
//   1. NOTHING HERE IS REAL. Every row is `fictional` (pinned by a CHECK), every
//      figure carries the SIMULATION badge, and no value of it ever reaches a
//      real total — P6-11 forbids the reverse, so the two can never meet.
//   2. AUCUNE EXÉCUTION. A trade changes fictional cash and a fictional
//      position. Nothing is sent anywhere, and there is no order type, no
//      leverage and no short: fictional cash may not go negative.
//   3. NO INVENTED PRICE. The client has supplied no instrument and no
//      reference price, and its rule forbids inventing them. The person names
//      the instrument and states the simulated price themselves, dated — so
//      every figure below rests on a number they can see and change.

import {
  DEFAULT_PAPER_CAPITAL,
  DEFAULT_PAPER_FEE_RATE,
  PAPER_CONCENTRATION_NOTICE,
  PAPER_INSTRUMENTS_MAX,
  PAPER_STATUS,
  PAPER_TRADE_KINDS,
  RISK_QUESTIONNAIRE_VERSION,
  RISK_QUESTIONS,
  riskQuestionByKey,
} from '../constants/finPaper.js';
import { HttpError } from '../utils/httpError.js';
import { computed } from './finance/contract.js';
import { assetAllocation, maxConcentration, paperGainLoss, paperPortfolioValue, paperReturn, riskProfileScore } from './finance/formulas.js';

const PORTFOLIO_SELECT = {
  id: true,
  capital: true,
  cash: true,
  currency: true,
  feeRate: true,
  resetAt: true,
  status: true,
  version: true,
};

const INSTRUMENT_SELECT = { id: true, label: true, markPrice: true, markedAt: true, note: true };
const TRADE_SELECT = { id: true, instrumentId: true, kind: true, quantity: true, unitPrice: true, fee: true, currency: true, decidedAt: true, note: true, status: true };

// The fee a trade of this size would cost, at this portfolio's declared rate.
// Rounded to the centime, which is the unit everything is stored in.
export const feeFor = (amount, feeRate) => Math.round(amount * feeRate);

/**
 * The account's portfolio, created on first use.
 *
 * One per account: « le portefeuille fictif », and « réinitialisation » means
 * starting this one over rather than keeping a drawer of them.
 */
export async function getOrCreatePortfolio(prisma, userId, { currency, capital } = {}) {
  const start = capital ?? DEFAULT_PAPER_CAPITAL;
  // `upsert` et non « chercher puis créer ».
  //
  // La page du portefeuille lance QUATRE requêtes en parallèle au montage, et
  // plusieurs d'entre elles passent ici. Avec un `findUnique` suivi d'un
  // `create`, toutes voyaient « pas de portefeuille » en même temps et toutes
  // tentaient de le créer : la contrainte d'unicité sur `userId` en refusait
  // une, et la PREMIÈRE visite de tout nouveau compte échouait en 409.
  //
  // Le défaut ne se voyait qu'avec un vrai navigateur — un test qui appelle
  // les routes l'une après l'autre ne le reproduit jamais. C'est le balayage
  // du site qui l'a signalé.
  //
  // `upsert` ne suffit pas : sous MariaDB, Prisma l'émule par une lecture
  // suivie d'une écriture, donc la course demeure. La seule façon fiable est
  // de LAISSER la base trancher — elle seule sait qui est arrivé premier — et
  // de relire quand elle refuse le doublon.
  const existing = await prisma.finPaperPortfolio.findUnique({ where: { userId }, select: PORTFOLIO_SELECT });
  if (existing) return existing;

  try {
    return await prisma.finPaperPortfolio.create({
      data: {
        userId,
        capital: start,
        // All of it is cash to begin with: nothing has been "bought" yet.
        cash: start,
        currency: currency ?? 'DZD',
        feeRate: DEFAULT_PAPER_FEE_RATE,
        source: 'manual',
        status: PAPER_STATUS,
      },
      select: PORTFOLIO_SELECT,
    });
  } catch (error) {
    // P2002 = contrainte d'unicité : quelqu'un d'autre vient de le créer. Ce
    // n'est pas une erreur du point de vue de l'appelant, qui voulait un
    // portefeuille et va en recevoir un.
    if (error?.code !== 'P2002') throw error;
    return prisma.finPaperPortfolio.findUnique({ where: { userId }, select: PORTFOLIO_SELECT });
  }
}

/**
 * Changing the fictional capital, or the simulated fee rate.
 *
 * Raising the capital adds the difference to cash; lowering it takes the
 * difference out, and is refused if the cash would go negative — otherwise the
 * portfolio would be holding positions it never had the money for.
 */
export async function updatePortfolio(prisma, userId, body) {
  const portfolio = await getOrCreatePortfolio(prisma, userId);
  const data = {};
  if (body.capital !== undefined) {
    const delta = body.capital - portfolio.capital;
    if (portfolio.cash + delta < 0) {
      throw new HttpError(422, 'Lowering the capital that far would leave negative cash', { reason: 'capitalBelowInvested' });
    }
    data.capital = body.capital;
    data.cash = portfolio.cash + delta;
  }
  if (body.feeRate !== undefined) data.feeRate = body.feeRate;
  if (Object.keys(data).length === 0) throw new HttpError(422, 'Nothing to change', { reason: 'nothingToChange' });
  return prisma.finPaperPortfolio.update({ where: { id: portfolio.id }, data: { ...data, version: { increment: 1 } }, select: PORTFOLIO_SELECT });
}

/**
 * « Réinitialisation »: the portfolio starts over.
 *
 * The trades and the instruments go — physically, which is the one place in
 * Phase 6 where that is right: nothing here fed a real history, and a reset
 * that kept the old decisions would not be a reset. The decision journal is
 * exportable precisely so somebody can keep it before pressing this.
 */
export async function resetPortfolio(prisma, userId, { capital } = {}) {
  const portfolio = await getOrCreatePortfolio(prisma, userId);
  const start = capital ?? portfolio.capital;
  return prisma.$transaction(async (tx) => {
    await tx.finPaperTrade.deleteMany({ where: { portfolioId: portfolio.id } });
    await tx.finPaperInstrument.deleteMany({ where: { portfolioId: portfolio.id } });
    return tx.finPaperPortfolio.update({
      where: { id: portfolio.id },
      data: { capital: start, cash: start, resetAt: new Date(), version: { increment: 1 } },
      select: PORTFOLIO_SELECT,
    });
  });
}

// ---- instruments -----------------------------------------------------------

export function listInstruments(prisma, portfolioId) {
  return prisma.finPaperInstrument.findMany({ where: { portfolioId }, select: INSTRUMENT_SELECT, orderBy: { label: 'asc' } });
}

export async function addInstrument(prisma, userId, body) {
  const portfolio = await getOrCreatePortfolio(prisma, userId);
  const count = await prisma.finPaperInstrument.count({ where: { portfolioId: portfolio.id } });
  if (count >= PAPER_INSTRUMENTS_MAX) throw new HttpError(422, 'Too many instruments', { reason: 'tooManyInstruments' });
  if (body.markedAt.getTime() > Date.now()) throw new HttpError(422, 'A price cannot be dated in the future', { reason: 'futurePrice' });

  const clash = await prisma.finPaperInstrument.findFirst({ where: { portfolioId: portfolio.id, label: body.label }, select: { id: true } });
  if (clash) throw new HttpError(422, 'This instrument is already in the portfolio', { reason: 'duplicateInstrument' });

  return prisma.finPaperInstrument.create({
    data: {
      portfolioId: portfolio.id,
      label: body.label,
      // The person's OWN simulated price. Nothing in the platform publishes one.
      markPrice: body.markPrice,
      markedAt: body.markedAt,
      note: body.note ?? null,
    },
    select: INSTRUMENT_SELECT,
  });
}

async function ownInstrument(prisma, portfolioId, id) {
  const row = await prisma.finPaperInstrument.findFirst({ where: { id, portfolioId }, select: INSTRUMENT_SELECT });
  if (!row) throw new HttpError(404, 'Instrument not found');
  return row;
}

// Re-marking an instrument: the person states a new simulated price, dated.
export async function markInstrument(prisma, userId, id, body) {
  const portfolio = await getOrCreatePortfolio(prisma, userId);
  await ownInstrument(prisma, portfolio.id, id);
  if (body.markedAt.getTime() > Date.now()) throw new HttpError(422, 'A price cannot be dated in the future', { reason: 'futurePrice' });
  return prisma.finPaperInstrument.update({
    where: { id },
    data: { markPrice: body.markPrice, markedAt: body.markedAt, ...(body.note === undefined ? {} : { note: body.note }) },
    select: INSTRUMENT_SELECT,
  });
}

// ---- trades ----------------------------------------------------------------

// The position held in one instrument, from the trades. Derived rather than
// stored: the trades are the record, and a stored quantity would be a second
// truth to keep in step.
export function positionOf(trades) {
  let quantity = 0;
  let cost = 0;
  for (const trade of trades) {
    const amount = trade.quantity * trade.unitPrice;
    if (trade.kind === 'buy') {
      quantity += trade.quantity;
      // The fictional cost INCLUDES the simulated fee: F039's own condition is
      // « inclure frais fictifs ».
      cost += amount + trade.fee;
    } else {
      // A sell reduces the position and the cost it carries, proportionally, so
      // what is left shows the cost of what is still held.
      const sold = Math.min(quantity, trade.quantity);
      const share = quantity === 0 ? 0 : sold / quantity;
      cost -= Math.round(cost * share);
      quantity -= sold;
    }
  }
  return { quantity, cost: Math.max(0, cost) };
}

/**
 * A fictional buy or sell.
 *
 * No execution: this moves fictional cash and nothing else. A buy the cash
 * cannot cover is REFUSED rather than borrowed — there is no leverage in a
 * workshop — and a sell of more units than are held is refused too, because a
 * short position is not something this task offers.
 */
export async function recordTrade(prisma, userId, body) {
  if (!PAPER_TRADE_KINDS.includes(body.kind)) throw new HttpError(422, 'Unknown trade kind', { reason: 'unknownKind' });
  const portfolio = await getOrCreatePortfolio(prisma, userId);
  const instrument = await ownInstrument(prisma, portfolio.id, body.instrumentId);
  if (body.decidedAt.getTime() > Date.now()) throw new HttpError(422, 'A decision cannot be dated in the future', { reason: 'futureDecision' });

  const amount = body.quantity * body.unitPrice;
  const fee = feeFor(amount, portfolio.feeRate);

  if (body.kind === 'buy') {
    if (amount + fee > portfolio.cash) {
      throw new HttpError(422, 'Not enough fictional cash for this purchase', { reason: 'notEnoughCash', cash: portfolio.cash, needed: amount + fee });
    }
  } else {
    const trades = await prisma.finPaperTrade.findMany({
      where: { portfolioId: portfolio.id, instrumentId: instrument.id },
      select: TRADE_SELECT,
      orderBy: { decidedAt: 'asc' },
    });
    const held = positionOf(trades).quantity;
    if (body.quantity > held) {
      throw new HttpError(422, 'More units than are held', { reason: 'notEnoughUnits', held });
    }
  }

  return prisma.$transaction(async (tx) => {
    const trade = await tx.finPaperTrade.create({
      data: {
        portfolioId: portfolio.id,
        instrumentId: instrument.id,
        kind: body.kind,
        quantity: body.quantity,
        unitPrice: body.unitPrice,
        fee,
        currency: portfolio.currency,
        decidedAt: body.decidedAt,
        // WHY. The reason is the point of a decision journal; the amounts are
        // the easy part.
        note: body.note ?? null,
        status: PAPER_STATUS,
      },
      select: TRADE_SELECT,
    });
    const delta = body.kind === 'buy' ? -(amount + fee) : amount - fee;
    await tx.finPaperPortfolio.update({ where: { id: portfolio.id }, data: { cash: portfolio.cash + delta } });
    return trade;
  });
}

export function listTrades(prisma, portfolioId, { instrumentId = null } = {}) {
  return prisma.finPaperTrade.findMany({
    where: { portfolioId, ...(instrumentId ? { instrumentId } : {}) },
    select: TRADE_SELECT,
    orderBy: { decidedAt: 'desc' },
  });
}

// ---- the view (pure) -------------------------------------------------------

/**
 * The portfolio, computed.
 *
 * Every figure carries the engine's contract AND the SIMULATION badge: the
 * client asks for the badge to be permanent, so it is part of the answer rather
 * than something a screen remembers to add.
 */
export function buildPortfolioView({ portfolio, instruments = [], trades = [], now = new Date(), noticeShare = PAPER_CONCENTRATION_NOTICE }) {
  const currency = portfolio.currency;
  const warnings = [];

  const byInstrument = new Map(instruments.map((row) => [row.id, row]));
  const tradesOf = (id) => trades.filter((trade) => trade.instrumentId === id).sort((a, b) => a.decidedAt - b.decidedAt);

  const positions = instruments
    .map((instrument) => {
      const { quantity, cost } = positionOf(tradesOf(instrument.id));
      const value = quantity * instrument.markPrice;
      const inputs = {
        instrument: instrument.label,
        quantite: quantity,
        prix_simule: instrument.markPrice,
        prix_date: instrument.markedAt.toISOString(),
        cout_fictif: cost,
      };
      return {
        id: instrument.id,
        label: instrument.label,
        quantity,
        markPrice: instrument.markPrice,
        markedAt: instrument.markedAt,
        cost,
        value,
        // F039 — gain or loss on what is still held, fees included.
        gainPerte: computed('F039', quantity === 0 ? null : paperGainLoss(value, cost), { inputs, currency, now }),
        // F040 — the return on that cost.
        rendement: computed('F040', quantity === 0 ? null : paperReturn(paperGainLoss(value, cost), cost), { inputs, currency, now }),
        badge: 'SIMULATION',
      };
    })
    .filter((position) => position.quantity > 0 || tradesOf(position.id).length > 0)
    .sort((a, b) => b.value - a.value);

  const held = positions.filter((position) => position.quantity > 0);
  const inputs = {
    capital_fictif: portfolio.capital,
    liquidites_fictives: portfolio.cash,
    instruments: held.length,
    taux_frais_simules: portfolio.feeRate,
    depuis: portfolio.resetAt.toISOString(),
  };
  const answer = (id, result, extra = {}) =>
    computed(id, result, {
      inputs,
      currency,
      warnings,
      now,
      // The client asks for the hypotheses of a simulation to be visible. The
      // simulated price is the hypothesis here, and it is the person's own.
      hypotheses: { prix_simules_declares_par_la_personne: true, taux_frais_simules: portfolio.feeRate },
      ...extra,
    });

  // F038 — « valeur = Σ quantité × prix simulé ».
  const invested = held.length === 0 ? null : paperPortfolioValue(held.map((position) => ({ quantity: position.quantity, simulatedPrice: position.markPrice })));
  const totalCost = held.reduce((sum, position) => sum + position.cost, 0);
  // The whole portfolio: what is invested plus the fictional cash left.
  const total = invested === null ? portfolio.cash : invested + portfolio.cash;

  // Allocation and concentration, over what is invested. Reuses F036 / F037,
  // the same rows the real patrimony uses — one definition of "a share".
  const shares = held.map((position) => ({
    id: position.id,
    label: position.label,
    allocation: computed('F036', invested === null ? null : assetAllocation(position.value, invested), {
      inputs: { ...inputs, instrument: position.label, valeur: position.value },
      currency,
      now,
    }),
  }));
  const concentration = shares.length === 0 ? null : maxConcentration(shares.map((row) => row.allocation.resultat).filter((value) => value !== null));

  // An instrument whose simulated price is older than the portfolio itself has
  // probably not been kept up: said, not corrected.
  const stalePrices = held.filter((position) => position.markedAt < portfolio.resetAt);
  if (stalePrices.length > 0) {
    warnings.push(`${stalePrices.length} prix simulé(s) datent d'avant la dernière réinitialisation : les remettre à jour rendrait la valeur plus parlante.`);
  }

  return {
    // The badge the client asks to be permanent, at the top level as well as on
    // every position.
    badge: 'SIMULATION',
    currency,
    capital: portfolio.capital,
    cash: portfolio.cash,
    feeRate: portfolio.feeRate,
    depuis: portfolio.resetAt,
    positions,
    valeurInvestie: answer('F038', invested),
    // The total includes the fictional cash, so it can be read against the
    // starting capital.
    valeurTotale: answer('F038', total),
    // F039 / F040 over the whole portfolio: against the capital that was put
    // in, which is what somebody actually wants to know.
    gainPerte: answer('F039', held.length === 0 && trades.length === 0 ? null : paperGainLoss(total, portfolio.capital)),
    rendement: answer('F040', held.length === 0 && trades.length === 0 ? null : paperReturn(paperGainLoss(total, portfolio.capital), portfolio.capital)),
    coutFictif: totalCost,
    allocation: shares,
    concentrationMax: answer('F037', concentration),
    // « Message éducatif, pas une alarme » — the client's own words. The answer
    // carries the fact and the threshold; the sentence is the interface's.
    concentrationSignalee: concentration === null ? null : concentration >= noticeShare,
    seuilConcentration: noticeShare,
    // Said out loud, because it is the honest limit of this screen.
    prixDeclaresParLaPersonne: true,
    avertissements: warnings,
  };
}

/**
 * « Rééquilibrage »: what it would take to reach a target allocation.
 *
 * PROPOSED, never applied. It returns the units to buy or sell per instrument
 * and writes nothing — the person makes each trade themselves, which is also
 * what keeps the decision journal honest.
 */
export function rebalancePlan({ positions, invested, targets, currency, now = new Date() }) {
  const total = Object.values(targets).reduce((sum, share) => sum + share, 0);
  if (positions.length === 0 || invested === null || invested === 0) return null;
  // Shares that do not add up to 1 would silently invest more or less than
  // everything: refused rather than normalised behind the person's back.
  if (Math.abs(total - 1) > 0.0001) return null;

  return positions
    .filter((position) => targets[position.id] !== undefined && position.markPrice > 0)
    .map((position) => {
      const targetValue = Math.round(invested * targets[position.id]);
      const delta = targetValue - position.value;
      // Whole units, like every trade here. The remainder is left as a
      // difference the person can see rather than rounded away silently.
      const units = Math.trunc(Math.abs(delta) / position.markPrice);
      return {
        id: position.id,
        label: position.label,
        cible: targets[position.id],
        valeurActuelle: position.value,
        valeurCible: targetValue,
        action: units === 0 ? 'hold' : delta > 0 ? 'buy' : 'sell',
        unites: units,
        ecartResiduel: Math.abs(delta) - units * position.markPrice,
        allocationCible: computed('F036', targets[position.id], { inputs: { instrument: position.label, cible: targets[position.id] }, currency, now }),
      };
    });
}

/**
 * « Suis-je prêt à commencer ? » (screen EP03).
 *
 * Every line is a QUESTION, never a gate. The client is explicit: « réserve et
 * objectifs d'abord, SANS BLOQUER l'accès éducatif » — so this answers, and the
 * workshop opens either way. Practising before one is ready is the point of a
 * paper portfolio.
 */
export function readiness({ reserve = null, goals = [], netFlow = null, debtEffort = null, now = new Date() }) {
  const checks = [
    {
      key: 'reserve',
      // `null` means "we cannot tell", which is different from "no".
      ok: reserve?.moisReserve?.resultat === null || reserve?.moisReserve?.resultat === undefined ? null : reserve.moisReserve.resultat >= 1,
      answer: reserve?.moisReserve ?? null,
    },
    {
      key: 'goals',
      ok: goals.length === 0 ? false : goals.some((goal) => (goal.view?.progres?.resultat ?? 0) > 0),
      answer: goals[0]?.view?.progres ?? null,
    },
    {
      key: 'netFlow',
      ok: netFlow?.resultat === null || netFlow?.resultat === undefined ? null : netFlow.resultat > 0,
      answer: netFlow ?? null,
    },
    {
      key: 'debt',
      ok: debtEffort?.resultat === null || debtEffort?.resultat === undefined ? null : debtEffort.resultat < 0.33,
      answer: debtEffort ?? null,
    },
  ];
  return {
    checks,
    // How many are answered and favourable. NOT a score and NOT a verdict: the
    // screen shows the four lines, and the workshop is open regardless.
    repondues: checks.filter((check) => check.ok !== null).length,
    favorables: checks.filter((check) => check.ok === true).length,
    bloque: false,
    now: now.toISOString(),
  };
}

/**
 * The educational risk profile (F057).
 *
 * The questions are ours, declared and versioned. The THRESHOLDS that would
 * turn the score into a word are « non figés » in the client's own catalogue and
 * have not been given (P6-01), so F057 returns no category and this function
 * does not invent one: the score is shown, the label is not.
 */
export function riskProfile(answers, { thresholds = null, now = new Date() } = {}) {
  const points = [];
  for (const question of RISK_QUESTIONS) {
    const chosen = answers?.[question.key];
    const option = question.options.find((row) => row.key === chosen);
    if (!option) continue;
    points.push({ points: option.points, weight: question.weight });
  }
  if (points.length === 0) {
    return {
      score: computed('F057', null, { inputs: { reponses: 0, version_questionnaire: RISK_QUESTIONNAIRE_VERSION }, now }),
      categorie: null,
      versionQuestionnaire: RISK_QUESTIONNAIRE_VERSION,
      seuilsManquants: true,
    };
  }
  const result = riskProfileScore(points, thresholds);
  return {
    score: computed('F057', result === null ? null : result.score, {
      inputs: {
        reponses: points.length,
        questions: RISK_QUESTIONS.length,
        version_questionnaire: RISK_QUESTIONNAIRE_VERSION,
        // The weights are in the answer, never hidden: the engine's rule.
        poids: RISK_QUESTIONS.map((question) => ({ [question.key]: question.weight })),
      },
      now,
    }),
    // `null` until the client validates the thresholds. A word like
    // « prudent » would read as a verdict on somebody, built on nothing.
    categorie: result?.category ?? null,
    versionQuestionnaire: RISK_QUESTIONNAIRE_VERSION,
    seuilsManquants: thresholds === null,
  };
}

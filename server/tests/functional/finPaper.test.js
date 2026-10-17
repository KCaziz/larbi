import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Paper portfolio and investment workshop (P6-12) through the real API: the
// fictional capital, the trades that execute nothing, the SIMULATION badge, the
// decision journal, the rebalancing that is proposed and never applied, the
// readiness diagnostic that never blocks, and the risk score whose label is not
// invented.

let t;
let user;

const DAY = 24 * 3600 * 1000;
const iso = (date) => date.toISOString();
const ago = (days) => new Date(Date.now() - days * DAY);
const inDays = (days) => new Date(Date.now() + days * DAY);

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult();
});
after(() => t.close());

const portfolio = () => t.request('GET', '/fin/portefeuille', { user });
const addInstrument = (json = {}) =>
  t.request('POST', '/fin/portefeuille/instruments', {
    user,
    json: { label: 'Action A', markPrice: 100000, markedAt: iso(ago(1)), ...json },
  });
const trade = (json) => t.request('POST', '/fin/portefeuille/operations', { user, json: { decidedAt: iso(ago(1)), ...json } });

describe('P6-12 — the fictional portfolio', () => {
  test("it starts at the client's own default capital, all of it in cash", async () => {
    const res = await portfolio();
    assert.equal(res.status, 200);
    assert.equal(res.body.portefeuille.capital, 10000000, '100 000 DA in centimes');
    assert.equal(res.body.portefeuille.cash, 10000000);
    assert.equal(res.body.portefeuille.badge, 'SIMULATION');
  });

  test('the capital is modifiable, and the difference goes to cash', async () => {
    const res = await t.request('PATCH', '/fin/portefeuille', { user, json: { capital: 20000000 } });
    assert.equal(res.status, 200);
    assert.equal(res.body.portefeuille.capital, 20000000);
    assert.equal(res.body.portefeuille.cash, 20000000);
  });

  test('lowering the capital below what is invested is refused', async () => {
    const instrument = await addInstrument();
    await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 90, unitPrice: 100000 });
    const res = await t.request('PATCH', '/fin/portefeuille', { user, json: { capital: 100000 } });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'capitalBelowInvested');
  });

  test('every figure carries the SIMULATION badge and its hypotheses', async () => {
    const instrument = await addInstrument();
    await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 10, unitPrice: 100000 });
    const view = (await portfolio()).body.portefeuille;
    assert.equal(view.badge, 'SIMULATION');
    assert.equal(view.positions[0].badge, 'SIMULATION');
    assert.equal(view.valeurInvestie.formule_id, 'F038');
    assert.equal(view.valeurInvestie.hypotheses.prix_simules_declares_par_la_personne, true);
    assert.equal(view.prixDeclaresParLaPersonne, true);
  });
});

describe('P6-12 — there is no instrument catalogue, and the API says so', () => {
  test('the references publish the limit rather than hiding it', async () => {
    const res = await t.request('GET', '/fin/portefeuille/references', { user });
    assert.equal(res.status, 200);
    // The client has supplied no instrument and no reference price, and its own
    // rule for this task forbids inventing them.
    assert.equal(res.body.instrumentCatalogue, null);
    assert.equal(res.body.instrumentCatalogueWaitingOn, 'P6-01');
    assert.equal(res.body.pricesDeclaredByThePerson, true);
    assert.equal(res.body.defaultCapital, 10000000);
  });

  test('the person names the instrument and states its price, dated', async () => {
    const res = await addInstrument({ label: 'Mon support fictif', markPrice: 250000, markedAt: iso(ago(2)) });
    assert.equal(res.status, 201);
    assert.equal(res.body.instrument.markPrice, 250000);
    assert.ok(res.body.instrument.markedAt);
  });

  test('a price in the future, or at zero, is refused', async () => {
    assert.equal((await addInstrument({ markedAt: iso(inDays(2)) })).status, 422);
    assert.equal((await addInstrument({ markPrice: 0 })).status, 400);
  });

  test('the same instrument cannot be added twice', async () => {
    await addInstrument();
    const again = await addInstrument();
    assert.equal(again.status, 422);
    assert.equal(again.body.error.details.reason, 'duplicateInstrument');
  });

  test('re-marking the price changes the value, not the past trades', async () => {
    const instrument = await addInstrument({ markPrice: 100000 });
    await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 10, unitPrice: 100000 });
    const before = (await portfolio()).body.portefeuille;
    assert.equal(before.valeurInvestie.resultat, 1000000);

    await t.request('PUT', `/fin/portefeuille/instruments/${instrument.body.instrument.id}/prix`, {
      user,
      json: { markPrice: 150000, markedAt: iso(ago(1)) },
    });
    const after = (await portfolio()).body.portefeuille;
    assert.equal(after.valeurInvestie.resultat, 1500000);
    const journal = await t.request('GET', '/fin/portefeuille/decisions', { user });
    assert.equal(journal.body.decisions[0].unitPrice, 100000, 'the recorded decision is untouched');
  });
});

describe('P6-12 — trades change fictional cash and nothing else', () => {
  test('a buy takes the amount and the simulated fee out of the cash', async () => {
    const instrument = await addInstrument();
    const res = await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 10, unitPrice: 100000, note: 'pour essayer' });
    assert.equal(res.status, 201);
    assert.equal(res.body.trade.fee, 10000, '1 % of 1 000 000');
    assert.equal(res.body.portefeuille.cash, 10000000 - 1000000 - 10000);
    assert.equal(res.body.trade.status, 'fictional');
  });

  test('a buy the cash cannot cover is refused, never borrowed', async () => {
    const instrument = await addInstrument();
    const res = await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 200, unitPrice: 100000 });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'notEnoughCash', 'there is no leverage in a workshop');
    assert.equal((await portfolio()).body.portefeuille.cash, 10000000, 'the cash is untouched');
  });

  test('selling more units than are held is refused', async () => {
    const instrument = await addInstrument();
    await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 10, unitPrice: 100000 });
    const res = await trade({ instrumentId: instrument.body.instrument.id, kind: 'sell', quantity: 15, unitPrice: 110000 });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'notEnoughUnits', 'a short position is not something this task offers');
  });

  test('a sell returns the amount minus the fee', async () => {
    const instrument = await addInstrument();
    await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 10, unitPrice: 100000 });
    const res = await trade({ instrumentId: instrument.body.instrument.id, kind: 'sell', quantity: 10, unitPrice: 120000 });
    assert.equal(res.status, 201);
    assert.equal(res.body.trade.fee, 12000);
    assert.equal(res.body.portefeuille.cash, 10000000 - 1000000 - 10000 + 1200000 - 12000);
  });

  test('a decision cannot be dated in the future', async () => {
    const instrument = await addInstrument();
    const res = await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 1, unitPrice: 100000, decidedAt: iso(inDays(2)) });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'futureDecision');
  });

  test('gain, loss and return are computed on the fictional cost, fees included', async () => {
    const instrument = await addInstrument({ markPrice: 120000 });
    await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 10, unitPrice: 100000 });
    const view = (await portfolio()).body.portefeuille;
    const position = view.positions[0];
    // Cost 1 000 000 + 10 000 of fee; value 10 x 120 000 = 1 200 000.
    assert.equal(position.cost, 1010000);
    assert.equal(position.value, 1200000);
    assert.equal(position.gainPerte.resultat, 190000);
    assert.equal(position.gainPerte.formule_id, 'F039');
    assert.equal(position.rendement.formule_id, 'F040');
  });

  test('an empty portfolio has no return rather than a return of zero', async () => {
    const view = (await portfolio()).body.portefeuille;
    assert.equal(view.valeurInvestie.resultat, null);
    assert.equal(view.gainPerte.resultat, null);
    assert.equal(view.rendement.resultat, null);
  });
});

describe('P6-12 — nothing of this reaches real patrimony', () => {
  test('the paper portfolio is absent from net worth', async () => {
    const instrument = await addInstrument();
    await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 50, unitPrice: 100000 });

    const wealth = await t.request('GET', '/fin/patrimoine', { user });
    assert.equal(wealth.body.patrimoine.totalActifs, null, 'a fictional position is not an asset');
    assert.equal(wealth.body.patrimoine.patrimoineNet.resultat, null);
  });

  test('and no real asset can be fictional either', async () => {
    // The other half of the same boundary, enforced by P6-11.
    const res = await t.request('POST', '/fin/actifs', {
      user,
      json: { label: 'X', kind: 'investment', value: 1000, currency: 'DZD', valuedAt: iso(ago(1)), status: 'fictional' },
    });
    assert.equal(res.status, 400);
  });
});

describe('P6-12 — the decision journal and its export', () => {
  test('the journal keeps what was done and why', async () => {
    const instrument = await addInstrument();
    await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 5, unitPrice: 100000, note: 'je teste une première ligne' });
    const res = await t.request('GET', '/fin/portefeuille/decisions', { user });
    assert.equal(res.body.decisions.length, 1);
    assert.equal(res.body.decisions[0].note, 'je teste une première ligne');
    assert.equal(res.body.decisions[0].instrument, 'Action A');
  });

  test('the export is a CSV, and a note that looks like a formula is neutralised', async () => {
    const instrument = await addInstrument();
    await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 1, unitPrice: 100000, note: '=SUM(A1:A9)' });
    const res = await t.request('GET', '/fin/portefeuille/decisions/export', { user });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/csv/);
    assert.ok(res.text.includes("\"'=SUM(A1:A9)\""), 'a spreadsheet must not execute what somebody typed');
  });

  test('a reset clears the portfolio, and says the journal was exportable first', async () => {
    const instrument = await addInstrument();
    await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 5, unitPrice: 100000 });
    const res = await t.request('POST', '/fin/portefeuille/reinitialiser', { user, json: {} });
    assert.equal(res.status, 200);
    assert.equal(res.body.portefeuille.cash, res.body.portefeuille.capital);
    assert.equal(await t.prisma.finPaperTrade.count(), 0);
    assert.equal(await t.prisma.finPaperInstrument.count(), 0);
  });
});

describe('P6-12 — rebalancing is proposed, never applied', () => {
  test('it returns the units to buy or sell and writes nothing', async () => {
    const a = await addInstrument({ label: 'A', markPrice: 100000 });
    const b = await addInstrument({ label: 'B', markPrice: 50000 });
    await trade({ instrumentId: a.body.instrument.id, kind: 'buy', quantity: 60, unitPrice: 100000 });
    await trade({ instrumentId: b.body.instrument.id, kind: 'buy', quantity: 20, unitPrice: 50000 });

    const tradesBefore = await t.prisma.finPaperTrade.count();
    const res = await t.request('POST', '/fin/portefeuille/reequilibrage', {
      user,
      json: { targets: { [a.body.instrument.id]: 0.5, [b.body.instrument.id]: 0.5 } },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.applique, false);
    assert.ok(res.body.plan.some((row) => row.action === 'sell'));
    assert.ok(res.body.plan.some((row) => row.action === 'buy'));
    assert.equal(await t.prisma.finPaperTrade.count(), tradesBefore, 'nothing was executed');
  });

  test('targets that do not add up to 100 % are refused rather than normalised', async () => {
    const a = await addInstrument({ label: 'A' });
    const res = await t.request('POST', '/fin/portefeuille/reequilibrage', { user, json: { targets: { [a.body.instrument.id]: 0.5 } } });
    assert.equal(res.status, 400);
  });
});

describe('P6-12 — the saver s path', () => {
  test('the diagnostic answers and never blocks', async () => {
    const res = await t.request('GET', '/fin/portefeuille/diagnostic', { user });
    assert.equal(res.status, 200);
    assert.equal(res.body.diagnostic.bloque, false);
    assert.equal(res.body.accesEducatifBloque, false, 'the client is explicit: educational access is not gated');
    assert.equal(res.body.diagnostic.checks.length, 4);
    // Nothing is known yet, so the answers are "cannot tell", not "no".
    assert.ok(res.body.diagnostic.checks.some((check) => check.ok === null));
  });

  test('and the workshop is open regardless', async () => {
    assert.equal((await portfolio()).status, 200);
    assert.equal((await addInstrument()).status, 201);
  });

  test('the risk score is shown and its label is NOT invented', async () => {
    const res = await t.request('POST', '/fin/portefeuille/profil-risque', {
      user,
      json: { horizon: 'over5y', reaction: 'wait', experience: 'none', lossTolerance: 'tenPercent' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.profil.score.resultat, 8);
    assert.equal(res.body.profil.score.formule_id, 'F057');
    // The thresholds are « non figés » and have not been given (P6-01): a word
    // like "prudent" would read as a verdict on somebody, built on nothing.
    assert.equal(res.body.profil.categorie, null);
    assert.equal(res.body.profil.seuilsManquants, true);
    // The weights are in the answer, never hidden.
    assert.ok(res.body.profil.score.entrees_snapshot.poids);
    assert.equal(res.body.profil.versionQuestionnaire, 1);
  });

  test('an answer outside its own options is refused', async () => {
    const res = await t.request('POST', '/fin/portefeuille/profil-risque', { user, json: { horizon: 'demain' } });
    assert.equal(res.status, 400);
  });
});

describe('P6-12 — one account, one portfolio', () => {
  test('another account never sees it', async () => {
    const other = await t.user();
    const instrument = await addInstrument();
    await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 5, unitPrice: 100000 });

    const theirs = await t.request('GET', '/fin/portefeuille', { user: other });
    assert.equal(theirs.body.portefeuille.cash, theirs.body.portefeuille.capital, 'they get their own, untouched');
    assert.deepEqual(theirs.body.portefeuille.positions, []);
    const theirJournal = await t.request('GET', '/fin/portefeuille/decisions', { user: other });
    assert.deepEqual(theirJournal.body.decisions, []);
  });

  test('an instrument of another portfolio cannot be traded', async () => {
    const other = await t.user();
    const mine = await addInstrument();
    const res = await t.request('POST', '/fin/portefeuille/operations', {
      user: other,
      json: { instrumentId: mine.body.instrument.id, kind: 'buy', quantity: 1, unitPrice: 100000, decidedAt: iso(ago(1)) },
    });
    assert.equal(res.status, 404);
  });

  test('every route needs a session', async () => {
    for (const [method, path, json] of [
      ['GET', '/fin/portefeuille', undefined],
      ['GET', '/fin/portefeuille/decisions', undefined],
      ['GET', '/fin/portefeuille/diagnostic', undefined],
      ['POST', '/fin/portefeuille/instruments', { label: 'X', markPrice: 1, markedAt: iso(ago(1)) }],
      ['POST', '/fin/portefeuille/reinitialiser', {}],
    ]) {
      assert.equal((await t.request(method, path, { json })).status, 401, `${method} ${path}`);
    }
  });

  test('erasing an account takes its portfolio with it', async () => {
    const instrument = await addInstrument();
    await trade({ instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 5, unitPrice: 100000 });
    await t.prisma.user.delete({ where: { id: user.id } });
    assert.equal(await t.prisma.finPaperPortfolio.count(), 0);
    assert.equal(await t.prisma.finPaperTrade.count(), 0);
    assert.equal(await t.prisma.finPaperInstrument.count(), 0);
  });
});

describe('P6-12 — la première visite d’un nouveau compte', () => {
  test('quatre requêtes simultanées ne créent qu’un portefeuille, et aucune n’échoue', async () => {
    // Le défaut que ce test interdit : la page lance quatre requêtes en
    // parallèle au montage, et plusieurs passent par `getOrCreatePortfolio`.
    // Avec un « chercher puis créer », toutes voyaient « pas de portefeuille »
    // en même temps, toutes tentaient de le créer, et la contrainte d'unicité
    // sur `userId` en refusait une : la PREMIÈRE visite de tout nouveau compte
    // échouait en 409.
    //
    // Un test qui appelle les routes l'une après l'autre ne le reproduit
    // jamais. Celui-ci les lance ensemble, comme un navigateur.
    const fresh = await t.user();
    const responses = await Promise.all([
      t.request('GET', '/fin/portefeuille', { user: fresh }),
      t.request('GET', '/fin/portefeuille/diagnostic', { user: fresh }),
      t.request('GET', '/fin/portefeuille/decisions', { user: fresh }),
      t.request('GET', '/fin/portefeuille', { user: fresh }),
    ]);

    const failed = responses.filter((res) => res.status !== 200).map((res) => `${res.status} ${JSON.stringify(res.body).slice(0, 120)}`);
    assert.deepEqual(failed, [], 'une requête simultanée a échoué');

    // Et un seul portefeuille existe au bout du compte.
    assert.equal(await t.prisma.finPaperPortfolio.count({ where: { userId: fresh.id } }), 1);
  });
});

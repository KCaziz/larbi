import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { MARKET_SUPPORTS } from '../../src/constants/finPaperMarket.js';

// The pedagogical market (EP06, recette R8-12) over HTTP: the same examples for
// everybody, a session required, a projection asked within bounds, and a
// purchase into the training portfolio at the month's simulated price.

let t;
let user;

before(async () => {
  t = await boot();
  await t.reset();
  user = await t.adult({ finPublic: 'EPG', finCurrency: 'DZD', finOnboardedAt: new Date() });
});
after(() => t.close());

const as = (path, init = {}) => t.request(init.method ?? 'GET', `/fin${path}`, { user, ...(init.json ? { json: init.json } : {}) });

describe('the pedagogical market', () => {
  test('lists every support with its hypotheses, its history and what that history shows', async () => {
    const res = await as('/portefeuille/marche');
    assert.equal(res.status, 200);
    assert.equal(res.body.supports.length, MARKET_SUPPORTS.length);
    assert.ok(res.body.version && res.body.hypothesesDate, 'the hypotheses are dated and versioned');
    for (const support of res.body.supports) {
      assert.ok(support.series.length >= 2, support.key);
      assert.equal(support.price, support.series.at(-1).price, `${support.key}: the price is the last month's`);
      assert.ok(support.risk >= 1 && support.risk <= 7);
      assert.ok('largestFall' in support.measures);
    }
  });

  test('needs a session', async () => {
    assert.equal((await t.request('GET', '/fin/portefeuille/marche')).status, 401);
  });

  test('projects an amount over years; refuses an unknown support and an out-of-bounds request', async () => {
    const ok = await as('/portefeuille/marche/fonds-diversifie/projection?montant=10000000&annees=5');
    assert.equal(ok.status, 200);
    assert.ok(ok.body.projection.low < ok.body.projection.median && ok.body.projection.median < ok.body.projection.high);
    assert.equal((await as('/portefeuille/marche/inconnu/projection?montant=10000000&annees=5')).status, 404);
    assert.equal((await as('/portefeuille/marche/or/projection?montant=10000000&annees=99')).status, 400);
  });

  test('a support bought at the month’s price lands in the training portfolio, never in real wealth', async () => {
    const market = (await as('/portefeuille/marche')).body;
    const gold = market.supports.find((support) => support.key === 'or');
    const instrument = (await as('/portefeuille/instruments', { method: 'POST', json: { label: 'Or (exemple)', markPrice: gold.price, markedAt: new Date().toISOString() } })).body.instrument;
    const trade = await as('/portefeuille/operations', { method: 'POST', json: { instrumentId: instrument.id, kind: 'buy', quantity: 2, unitPrice: gold.price, decidedAt: new Date().toISOString() } });
    assert.equal(trade.status, 201, JSON.stringify(trade.body).slice(0, 200));
    const portfolio = (await as('/portefeuille')).body.portefeuille;
    assert.equal(portfolio.positions.find((position) => position.label === 'Or (exemple)').quantity, 2);
    assert.equal(await t.prisma.finAsset.count({ where: { userId: user.id } }), 0, 'nothing reaches real wealth');
  });
});

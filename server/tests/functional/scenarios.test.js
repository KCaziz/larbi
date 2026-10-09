import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { SIMULATORS } from '../../src/constants/simulators.js';
import { SIMULATION_SCHEMAS } from '../../src/validation/simulations.schemas.js';

// Saved scenarios of the simulation workshop (P4-16, screen C18). Running a
// simulation needs no account; keeping one does. These tests are about what a
// saved scenario must still be able to say later: which formula version produced
// each figure, under which hypotheses, and from which inputs.

let t;
const DA = (units) => units * 100;

before(async () => {
  t = await boot();
  await t.reset();
});
after(() => t.close());

const budget = {
  simulator: 'budget-mensuel',
  title: 'Budget actuel',
  currency: 'DZD',
  plannedIncome: DA(80_000),
  fixedExpenses: DA(35_000),
  variableExpenses: DA(20_000),
  debtInstalments: DA(8_000),
  plannedSavings: DA(10_000),
};

const as = (user) => ({ user });
const save = (user, body) => t.request('POST', '/tools/scenarios', { ...as(user), json: body });

describe('keeping a simulation', () => {
  test('a session is needed to keep one, not to run one', async () => {
    assert.equal((await t.request('GET', '/tools/scenarios')).status, 401);
    assert.equal((await t.request('POST', '/tools/scenarios', { json: budget })).status, 401);
    // The simulator itself stays in free access.
    assert.equal((await t.request('GET', '/tools/simulations/budget-mensuel')).status, 200);
  });

  test('a saved scenario keeps its inputs, its hypotheses and its formula versions', async () => {
    const user = await t.user();
    const res = await save(user, { ...budget, simulator: 'objectif-avec-rendement', title: 'Objectif 2 millions', target: DA(2_000_000), capital: DA(500_000), contribution: DA(20_000), months: 60, monthlyRate: 0.004, plannedIncome: undefined, fixedExpenses: undefined, variableExpenses: undefined, debtInstalments: undefined, plannedSavings: undefined });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    const { scenario } = res.body;
    assert.equal(scenario.title, 'Objectif 2 millions');
    assert.equal(scenario.currency, 'DZD');
    // The hypotheses of the projection are saved WITH the result, as the client
    // requires for this screen.
    assert.deepEqual(scenario.hypotheses, { rendement_mensuel: 0.004, horizon_mois: 60 });
    // One version per formula used, so the figures stay explainable later.
    assert.deepEqual(Object.keys(scenario.versions).sort(), ['F026', 'F029', 'F030', 'F031', 'F032']);
    for (const version of Object.values(scenario.versions)) assert.ok(Number.isInteger(version));
    assert.equal(scenario.inputs.target, DA(2_000_000));
  });

  test('the figures are recomputed from the inputs, never taken from the request', async () => {
    const user = await t.user();
    // A result sent by the client is an unknown field for the simulator's own
    // schema, so it is refused rather than stored as if the engine made it.
    const forged = await save(user, { ...budget, resultats: { fluxNet: { resultat: 999 } } });
    assert.equal(forged.status, 400);

    const res = await save(user, budget);
    assert.equal(res.status, 201);
    // 80 000 - (35 000 + 20 000 + 8 000)
    assert.equal(res.body.scenario.resultats.fluxNet.resultat, DA(17_000));
    assert.equal(res.body.scenario.resultats.fluxNet.formule_id, 'F004');
  });

  test('a scenario read back recomputes the same figures', async () => {
    const user = await t.user();
    const saved = (await save(user, budget)).body.scenario;
    const read = await t.request('GET', `/tools/scenarios/${saved.id}`, as(user));
    assert.equal(read.status, 200);
    assert.deepEqual(read.body.scenario.resultats.fluxNet.resultat, saved.resultats.fluxNet.resultat);
    assert.deepEqual(read.body.scenario.versions, saved.versions);
    // Nothing says a version changed, because nothing has.
    assert.equal(read.body.scenario.versionsChanged, undefined);
  });

  test('a formula that moved since the scenario was saved is said, not hidden', async () => {
    const user = await t.user();
    const saved = (await save(user, budget)).body.scenario;
    // The formula the scenario ran under is kept with it. Pretend F004 was at
    // version 1 then and has been revised since: the engine is at a different
    // version now, and the scenario must say so instead of showing today's
    // figure under yesterday's label.
    await t.prisma.simulationScenario.update({
      where: { id: saved.id },
      data: { versions: { ...saved.versions, F004: saved.versions.F004 + 1 } },
    });
    const read = await t.request('GET', `/tools/scenarios/${saved.id}`, as(user));
    assert.equal(read.status, 200);
    assert.deepEqual(read.body.scenario.versionsChanged, [
      { formule_id: 'F004', saved: saved.versions.F004 + 1, current: saved.versions.F004 },
    ]);
    // The figures themselves are still recomputed and still shown.
    assert.equal(read.body.scenario.resultats.fluxNet.resultat, DA(17_000));
  });

  test('a scenario whose inputs no longer satisfy its simulator says it cannot be recomputed', async () => {
    const user = await t.user();
    const saved = (await save(user, budget)).body.scenario;
    // A later lot could tighten a bound or add a required field. Rather than
    // feed stale inputs to the engine, the scenario keeps everything it knows
    // and says the figures are not available.
    await t.prisma.simulationScenario.update({ where: { id: saved.id }, data: { inputs: { plannedIncome: DA(80_000) } } });
    const read = await t.request('GET', `/tools/scenarios/${saved.id}`, as(user));
    assert.equal(read.status, 200);
    assert.equal(read.body.scenario.resultats, null);
    assert.equal(read.body.scenario.stale, 'inputs');
    assert.equal(read.body.scenario.title, 'Budget actuel', 'what it knows is still there');
    // And it cannot be compared, rather than compared against nothing.
    const other = (await save(user, { ...budget, title: 'Valide' })).body.scenario;
    const res = await t.request('POST', '/tools/scenarios/comparaison', { ...as(user), json: { ids: [saved.id, other.id] } });
    assert.equal(res.status, 409);
  });

  test('a scenario belongs to one account: another one gets a 404, not a hint', async () => {
    const owner = await t.user();
    const other = await t.user();
    const saved = (await save(owner, budget)).body.scenario;
    assert.equal((await t.request('GET', `/tools/scenarios/${saved.id}`, as(other))).status, 404);
    assert.equal((await t.request('PATCH', `/tools/scenarios/${saved.id}`, { ...as(other), json: { title: 'Pris' } })).status, 404);
    assert.equal((await t.request('DELETE', `/tools/scenarios/${saved.id}`, as(other))).status, 404);
    // And the owner still has it, untouched.
    const read = await t.request('GET', `/tools/scenarios/${saved.id}`, as(owner));
    assert.equal(read.body.scenario.title, 'Budget actuel');
  });

  test('the list is the account’s own, newest first', async () => {
    const user = await t.user();
    await save(user, { ...budget, title: 'Premier' });
    await save(user, { ...budget, title: 'Second' });
    const res = await t.request('GET', '/tools/scenarios', as(user));
    assert.equal(res.status, 200);
    assert.deepEqual(
      res.body.scenarios.map((scenario) => scenario.title),
      ['Second', 'Premier'],
    );
    assert.ok(res.body.limit > 0, 'the cap is stated, so the interface can say it');
  });

  test('renaming and deleting', async () => {
    const user = await t.user();
    const saved = (await save(user, budget)).body.scenario;
    const renamed = await t.request('PATCH', `/tools/scenarios/${saved.id}`, { ...as(user), json: { title: 'Budget revu' } });
    assert.equal(renamed.status, 200);
    assert.equal(renamed.body.scenario.title, 'Budget revu');
    // The inputs are untouched by a rename: only the name changed.
    assert.deepEqual(renamed.body.scenario.inputs, saved.inputs);

    assert.equal((await t.request('DELETE', `/tools/scenarios/${saved.id}`, as(user))).status, 204);
    assert.equal((await t.request('GET', `/tools/scenarios/${saved.id}`, as(user))).status, 404);
  });

  test('refusals: unknown simulator, empty title, forged body', async () => {
    const user = await t.user();
    assert.equal((await save(user, { ...budget, simulator: 'inexistant' })).status, 400);
    assert.equal((await save(user, { ...budget, title: '   ' })).status, 400);
    // A required input of the simulator is still required when saving.
    assert.equal((await save(user, { ...budget, plannedIncome: undefined })).status, 400);
    assert.equal((await save(user, { ...budget, plannedIncome: 80_000.5 })).status, 400);
  });

  test('every example of the catalogue is a scenario the server accepts', async () => {
    const user = await t.user();
    for (const simulator of SIMULATORS) {
      assert.ok(simulator.example, `${simulator.key} has no example for the empty state`);
      // The example must be valid input for the simulator's own schema, or the
      // empty state of the workshop would offer values the server refuses.
      const parsed = SIMULATION_SCHEMAS[simulator.key].safeParse({ currency: 'DZD', ...simulator.example });
      assert.ok(parsed.success, `${simulator.key}: ${JSON.stringify(parsed.error?.issues)}`);

      const res = await save(user, { simulator: simulator.key, title: `Exemple ${simulator.key}`, currency: 'DZD', ...simulator.example });
      assert.equal(res.status, 201, `${simulator.key}: ${JSON.stringify(res.body)}`);
      assert.ok(Object.keys(res.body.scenario.resultats).length > 0, simulator.key);
    }
  });
});

describe('comparing scenarios', () => {
  test('two scenarios of the same simulator are compared figure by figure', async () => {
    const user = await t.user();
    const a = (await save(user, { ...budget, title: 'Sans voiture' })).body.scenario;
    const b = (await save(user, { ...budget, title: 'Avec voiture', debtInstalments: DA(20_000) })).body.scenario;
    const res = await t.request('POST', '/tools/scenarios/comparaison', { ...as(user), json: { ids: [a.id, b.id] } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.deepEqual(
      res.body.scenarios.map((scenario) => scenario.title),
      ['Sans voiture', 'Avec voiture'],
    );
    const netFlow = res.body.results.find((row) => row.result === 'fluxNet');
    assert.equal(netFlow.values[a.id], DA(17_000));
    assert.equal(netFlow.values[b.id], DA(5_000));
    // A row still says which formula produced its figures, and in which version
    // for each scenario.
    assert.equal(netFlow.formule_id, 'F004');
    assert.equal(netFlow.unite, 'DZD');
    assert.deepEqual(Object.keys(netFlow.versions).sort(), [a.id, b.id].sort());
  });

  test('two different simulators are compared only on what they have in common', async () => {
    const user = await t.user();
    const a = (await save(user, { ...budget, title: 'Budget' })).body.scenario;
    const b = (
      await save(user, {
        simulator: 'capacite-epargne',
        title: 'Capacité',
        currency: 'DZD',
        income: DA(80_000),
        expenses: DA(55_000),
        instalments: DA(8_000),
        reservedMargin: 0,
      })
    ).body.scenario;
    const res = await t.request('POST', '/tools/scenarios/comparaison', { ...as(user), json: { ids: [a.id, b.id] } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const names = res.body.results.map((row) => row.result);
    // Both simulators return these; only one returns "chargesObligatoires".
    assert.ok(names.includes('fluxNet') && names.includes('resteAVivre') && names.includes('tauxEpargne'));
    assert.ok(!names.includes('chargesObligatoires'), 'a figure only one scenario has is not a comparison row');
  });

  test('no score is produced: there is no honest way to weigh months against dinars', async () => {
    const user = await t.user();
    const a = (await save(user, { ...budget, title: 'A' })).body.scenario;
    const b = (await save(user, { ...budget, title: 'B', plannedSavings: DA(20_000) })).body.scenario;
    const res = await t.request('POST', '/tools/scenarios/comparaison', { ...as(user), json: { ids: [a.id, b.id] } });
    assert.equal(res.status, 200);
    assert.equal(res.body.scores, undefined);
    // And weights cannot be smuggled in to ask for one.
    const weighted = await t.request('POST', '/tools/scenarios/comparaison', {
      ...as(user),
      json: { ids: [a.id, b.id], weights: { cost: 1 } },
    });
    assert.equal(weighted.status, 400);
  });

  test('different currencies are refused, never converted', async () => {
    const user = await t.user();
    const a = (await save(user, { ...budget, title: 'En dinars' })).body.scenario;
    const b = (await save(user, { ...budget, title: 'En euros', currency: 'EUR' })).body.scenario;
    const res = await t.request('POST', '/tools/scenarios/comparaison', { ...as(user), json: { ids: [a.id, b.id] } });
    assert.equal(res.status, 400);
    assert.match(res.body.error.message, /currency/);
  });

  test("the client's bound: two or three, and only one's own scenarios", async () => {
    const user = await t.user();
    const other = await t.user();
    const a = (await save(user, { ...budget, title: 'A' })).body.scenario;
    const b = (await save(user, { ...budget, title: 'B' })).body.scenario;
    const c = (await save(user, { ...budget, title: 'C' })).body.scenario;
    const d = (await save(user, { ...budget, title: 'D' })).body.scenario;
    const mine = (await save(other, { ...budget, title: 'Pas la mienne' })).body.scenario;

    const post = (json) => t.request('POST', '/tools/scenarios/comparaison', { ...as(user), json });
    assert.equal((await post({ ids: [a.id] })).status, 400, 'one scenario is not a comparison');
    assert.equal((await post({ ids: [a.id, b.id, c.id, d.id] })).status, 400, 'four is beyond what the client allows');
    assert.equal((await post({ ids: [a.id, a.id] })).status, 400, 'the same scenario twice compares nothing');
    assert.equal((await post({ ids: [a.id, mine.id] })).status, 404, "someone else's scenario is simply not found");
    assert.equal((await post({ ids: [a.id, b.id, c.id] })).status, 200);
  });
});

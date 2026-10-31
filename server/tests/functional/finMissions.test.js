import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { scoreMission } from '../../src/services/finMission.service.js';

// Pedagogical missions (P8-17). The scenarios are the client's; what is proved
// here is the STRUCTURE: the rule that scores them, what a learner may see before
// playing, that a play touches no real data, and who may enter one.

let t;
let admin;
let lycee;
let salarie;

const mission = (extra = {}) => ({
  slug: 'premier-salaire',
  title: 'Mon premier salaire',
  summary: 'Quelques choix sur une somme fictive.',
  profiles: [],
  startingAmount: 5000000,
  currency: 'DZD',
  steps: [
    {
      key: 'loyer',
      prompt: 'Le loyer arrive. Que fais-tu ?',
      choices: [
        { key: 'payer', label: 'Je le paie tout de suite', cash: -2000000, savings: 0, resilience: 20, explanation: 'Une charge fixe payée à temps évite les pénalités.' },
        { key: 'attendre', label: 'J’attends la fin du mois', cash: 0, savings: 0, resilience: -10, explanation: 'Un retard coûte plus qu’il ne rapporte.' },
      ],
    },
    {
      key: 'reste',
      prompt: 'Il reste de l’argent. Que fais-tu ?',
      choices: [
        { key: 'epargner', label: 'J’en mets de côté', cash: -500000, savings: 500000, resilience: 30, explanation: 'Une réserve absorbe un imprévu.' },
        { key: 'depenser', label: 'Je le dépense', cash: -500000, savings: 0, resilience: 0, explanation: 'Plaisir immédiat, aucune marge ensuite.' },
      ],
    },
  ],
  badges: [
    { key: 'solide', label: 'Budget solide', minResilience: 50 },
    { key: 'en-route', label: 'En route', minResilience: 20 },
  ],
  ...extra,
});

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  admin = await t.admin();
  lycee = await t.adult({ finPublic: 'LYC', finCurrency: 'DZD' });
  salarie = await t.adult({ finPublic: 'SAL', finCurrency: 'DZD' });
});
after(() => t.close());

const adm = (method, path, json) => t.request(method, `/admin/fin-missions${path}`, { user: admin, ...(json === undefined ? {} : { json }) });
const publish = async (body = mission()) => {
  const created = await adm('POST', '', body);
  assert.equal(created.status, 201, JSON.stringify(created.body).slice(0, 300));
  assert.equal((await adm('POST', `/${created.body.mission.id}/publish`)).status, 200);
  return created.body.mission;
};

describe('the scoring rule', () => {
  test('is the sum of the effects of the choices made, and the badge is the highest threshold reached', () => {
    const m = mission();
    const best = scoreMission(m, [{ step: 'loyer', choice: 'payer' }, { step: 'reste', choice: 'epargner' }]);
    assert.equal(best.cash, 5000000 - 2000000 - 500000);
    assert.equal(best.savings, 500000);
    assert.equal(best.resilience, 50);
    assert.equal(best.badge.key, 'solide');
    const middle = scoreMission(m, [{ step: 'loyer', choice: 'payer' }, { step: 'reste', choice: 'depenser' }]);
    assert.equal(middle.resilience, 20);
    assert.equal(middle.badge.key, 'en-route');
    const low = scoreMission(m, [{ step: 'loyer', choice: 'attendre' }, { step: 'reste', choice: 'depenser' }]);
    assert.equal(low.resilience, -10);
    assert.equal(low.badge, null, 'no badge is invented when no threshold is reached');
  });

  test('every choice is traced with its explanation, and an incomplete play is refused rather than scored', () => {
    const result = scoreMission(mission(), [{ step: 'loyer', choice: 'payer' }, { step: 'reste', choice: 'epargner' }]);
    assert.equal(result.trace.length, 2);
    assert.match(result.trace[0].explanation, /pénalités/);
    assert.throws(() => scoreMission(mission(), [{ step: 'loyer', choice: 'payer' }]), /Every step needs an answer/);
    assert.throws(() => scoreMission(mission(), [{ step: 'loyer', choice: 'inconnu' }, { step: 'reste', choice: 'epargner' }]), /Unknown choice/);
    assert.throws(() => scoreMission(mission(), [{ step: 'loyer', choice: 'payer' }, { step: 'loyer', choice: 'payer' }, { step: 'reste', choice: 'epargner' }]), /twice/);
  });
});

describe('what the administrator enters', () => {
  test('a complete mission is stored as a draft; the structure is checked', async () => {
    const ok = await adm('POST', '', mission());
    assert.equal(ok.status, 201);
    assert.equal(ok.body.mission.status, 'draft');
    assert.equal((await adm('POST', '', mission())).status, 409, 'the address is taken');
    const oneChoice = mission({ slug: 'a', steps: [{ key: 's', prompt: 'p', choices: [mission().steps[0].choices[0]] }] });
    assert.equal((await adm('POST', '', oneChoice)).status, 400, 'a step needs at least two choices');
    const doubleKey = mission({ slug: 'b', steps: [mission().steps[0], mission().steps[0]] });
    assert.equal((await adm('POST', '', doubleKey)).status, 400, 'two steps with one key');
  });

  test('only an administrator; a published mission cannot be deleted before it is unpublished', async () => {
    assert.equal((await t.request('GET', '/admin/fin-missions', { user: lycee })).status, 403);
    const m = await publish();
    assert.equal((await adm('DELETE', `/${m.id}`)).status, 409);
    await adm('POST', `/${m.id}/unpublish`);
    assert.equal((await adm('DELETE', `/${m.id}`)).status, 200);
  });
});

describe('what a learner sees and plays', () => {
  test('a draft is invisible; a published mission shows its prompts and labels — never its effects', async () => {
    const draft = (await adm('POST', '', mission())).body.mission;
    assert.deepEqual((await t.request('GET', '/fin/missions', { user: lycee })).body.missions, []);
    assert.equal((await t.request('GET', `/fin/missions/${draft.slug}`, { user: lycee })).status, 404);
    await adm('POST', `/${draft.id}/publish`);
    const seen = (await t.request('GET', `/fin/missions/${draft.slug}`, { user: lycee })).body.mission;
    assert.equal(seen.steps[0].choices[0].label, 'Je le paie tout de suite');
    assert.equal(JSON.stringify(seen).includes('resilience'), false);
    assert.equal(JSON.stringify(seen).includes('explanation'), false);
  });

  test('a mission for one profile is offered to it and to « autre / libre », not to the others', async () => {
    await publish(mission({ profiles: ['LYC'] }));
    assert.equal((await t.request('GET', '/fin/missions', { user: lycee })).body.missions.length, 1);
    assert.equal((await t.request('GET', '/fin/missions', { user: salarie })).body.missions.length, 0);
    assert.equal((await t.request('GET', '/fin/missions/premier-salaire', { user: salarie })).status, 404);
    const free = await t.adult({ finPublic: 'AUT', finCurrency: 'DZD' });
    assert.equal((await t.request('GET', '/fin/missions', { user: free })).body.missions.length, 1);
  });

  test('playing returns the explained result, keeps the attempt, lets the badge show, and touches no real data', async () => {
    await publish();
    const accountsBefore = await t.prisma.finAccount.count({ where: { userId: lycee.id } });
    const transactionsBefore = await t.prisma.finTransaction.count({ where: { userId: lycee.id } });
    const play = await t.request('POST', '/fin/missions/premier-salaire/jouer', { user: lycee, json: { choices: [{ step: 'loyer', choice: 'payer' }, { step: 'reste', choice: 'epargner' }] } });
    assert.equal(play.status, 201, JSON.stringify(play.body).slice(0, 300));
    assert.equal(play.body.result.badge.key, 'solide');
    assert.equal(play.body.result.trace.length, 2);

    const list = (await t.request('GET', '/fin/missions', { user: lycee })).body.missions[0];
    assert.equal(list.played, 1);
    assert.equal(list.badge.key, 'solide');
    assert.equal(await t.prisma.finAccount.count({ where: { userId: lycee.id } }), accountsBefore);
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: lycee.id } }), transactionsBefore, 'a mission never writes a real movement');
  });

  test('an incomplete or unknown play is refused (422), and a replay is another attempt', async () => {
    await publish();
    const play = (choices) => t.request('POST', '/fin/missions/premier-salaire/jouer', { user: lycee, json: { choices } });
    assert.equal((await play([{ step: 'loyer', choice: 'payer' }])).status, 422);
    assert.equal((await play([{ step: 'loyer', choice: 'nope' }, { step: 'reste', choice: 'epargner' }])).status, 422);
    const full = [{ step: 'loyer', choice: 'attendre' }, { step: 'reste', choice: 'depenser' }];
    await play(full);
    await play(full);
    assert.equal((await t.request('GET', '/fin/missions', { user: lycee })).body.missions[0].played, 2);
  });

  test('it needs a session', async () => {
    assert.equal((await t.request('GET', '/fin/missions')).status, 401);
  });
});

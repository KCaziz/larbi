import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P13-05, lot E (2026-11-24): the diaspora — the rules that matter most:
// two people for an expense (DEC-018), access by project (CNV-14), and a
// patrimony consolidated only at dated rates (CNV-10). Client's cases of
// 30_TESTS_CALCUL: budget 4 000 000 − 2 450 000 = 1 550 000; net worth
// 15 000 000 − 5 000 000 = 10 000 000.

let t;
before(async () => {
  t = await boot();
});
beforeEach(() => t.reset());
after(() => t.close());

const C = (n) => Math.round(n * 100);
const day = (iso) => `${iso}T00:00:00.000Z`;

async function setUp() {
  const owner = await t.adult();
  const created = await t.request('POST', '/fin/entreprise', { user: owner, json: { name: 'Projets Kabylie', currency: 'EUR', publicKey: 'PUB-10' } });
  const as = { 'X-Organisation': created.body.entreprise.id };
  const call = (method, path, json, user = owner) => t.request(method, `/fin/entreprise${path}`, { user, headers: as, json });
  const site = await t.adult();
  const invited = await call('POST', '/membres', { email: site.email, role: 'project_manager' });
  await t.request('POST', `/fin/entreprise/invitations/${invited.body.membre.id}/accepter`, { user: site });
  return { owner, site, siteMemberId: invited.body.membre.id, call };
}

describe('a project followed from abroad', () => {
  test('shared to the site manager, who declares; the owner validates; the budget left is 1 550 000', async () => {
    const { site, siteMemberId, call } = await setUp();
    const project = (await call('POST', '/projets', { name: 'Maison Tizi Ouzou', nature: 'construction', budget: C(4_000_000), currency: 'DZD', fundsConfirmed: C(1_000_000) })).body.projet;

    assert.equal((await call('GET', '/projets', undefined, site)).body.projets.length, 0, 'not shared: nothing');
    assert.equal((await call('POST', `/projets/${project.id}/depenses`, { label: 'X', amount: 1, currency: 'DZD', spentAt: day('2026-11-01') }, site)).status, 404);

    assert.equal((await call('POST', `/projets/${project.id}/partages`, { memberId: siteMemberId, access: 'contribute', purpose: 'Suivi du chantier' })).status, 201);
    const expense = await call('POST', `/projets/${project.id}/depenses`, { label: 'Ciment et fer', amount: C(2_450_000), currency: 'DZD', spentAt: day('2026-11-01') }, site);
    assert.equal(expense.status, 201, JSON.stringify(expense.body));
    assert.equal(expense.body.depense.status, 'to_justify');

    // The site manager cannot validate; the proof first.
    assert.equal((await call('POST', `/projets/${project.id}/depenses/${expense.body.depense.id}/valider`, {}, site)).status, 403);
    assert.equal((await call('POST', `/projets/${project.id}/depenses/${expense.body.depense.id}/valider`, {})).body.error.details.reason, 'invalidTransition');
    await call('POST', `/projets/${project.id}/depenses/${expense.body.depense.id}/justifier`, { proofRef: 'Facture 2026-118' }, site);
    assert.equal((await call('POST', `/projets/${project.id}/depenses/${expense.body.depense.id}/valider`, {})).status, 200);

    const view = (await call('GET', '/projets')).body.projets[0].calcul;
    assert.equal(view.realise.resultat, C(2_450_000));
    assert.equal(view.reste.resultat, C(1_550_000));
    assert.equal(view.aFinancer.resultat, C(550_000));
    assert.equal(view.paye, 0, 'validated is not paid');
  });

  test('whoever declares an expense does not validate it', async () => {
    const { call } = await setUp();
    const project = (await call('POST', '/projets', { name: 'Atelier', nature: 'industrie', budget: C(100), currency: 'EUR' })).body.projet;
    const expense = (await call('POST', `/projets/${project.id}/depenses`, { label: 'Outils', amount: C(10), currency: 'EUR', spentAt: day('2026-11-01'), proofRef: 'Ticket 4' })).body.depense;
    const res = await call('POST', `/projets/${project.id}/depenses/${expense.id}/valider`, {});
    assert.equal(res.status, 409);
    assert.equal(res.body.error.details.reason, 'secondPersonRequired');
  });

  test('a revoked share closes the project; the patrimony is never shared', async () => {
    const { site, siteMemberId, call } = await setUp();
    const project = (await call('POST', '/projets', { name: 'Verger', nature: 'agriculture', budget: C(100), currency: 'EUR' })).body.projet;
    const share = (await call('POST', `/projets/${project.id}/partages`, { memberId: siteMemberId, access: 'read', purpose: 'Lecture' })).body.partage;
    assert.equal((await call('GET', '/projets', undefined, site)).body.projets.length, 1);
    assert.equal((await call('POST', `/projets/${project.id}/depenses`, { label: 'X', amount: 1, currency: 'EUR', spentAt: day('2026-11-01') }, site)).status, 403, 'read only');
    assert.equal((await call('GET', '/patrimoine', undefined, site)).status, 403);
    await call('DELETE', `/projets/${project.id}/partages/${share.id}`);
    assert.equal((await call('GET', '/projets', undefined, site)).body.projets.length, 0);
  });
});

describe('the patrimony across countries', () => {
  test('15 000 000 − 5 000 000 = 10 000 000, and nothing without a rate', async () => {
    const { call } = await setUp();
    const house = await call('POST', '/patrimoine', { kind: 'asset', category: 'immobilier', label: 'Maison', country: 'DZ', currency: 'DZD', value: C(15_000_000 * 145), valuedAt: day('2026-10-01'), mode: 'estimated' });
    assert.equal(house.status, 201, JSON.stringify(house.body));
    let view = (await call('GET', '/patrimoine')).body;
    assert.equal(view.net.resultat, null, 'DZD in a EUR organisation, no rate: not computable');

    await call('POST', `/patrimoine/${house.body.bien.id}/valeurs`, { value: C(15_000_000 * 145), valuedAt: day('2026-11-01'), mode: 'verified', rate: 1 / 145, rateDate: day('2026-11-01'), rateSource: 'Banque' });
    await call('POST', '/patrimoine', { kind: 'debt', category: 'pret', label: 'Prêt', country: 'FR', currency: 'EUR', value: C(5_000_000), valuedAt: day('2026-11-01'), mode: 'declared' });
    view = (await call('GET', '/patrimoine')).body;
    assert.equal(view.net.resultat, C(10_000_000));
    assert.equal(view.lignes[0].values.length, 2, 'the former valuation is kept');
  });
});

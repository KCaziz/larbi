import '../helpers/setup-env.js';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P13-05, lot I (2026-11-25): the partners' and institutions' own space and
// the crowdfunding regulatory report — the rules that matter most.

let t;
before(async () => {
  t = await boot();
});
beforeEach(() => t.reset());
after(() => t.close());

async function organisation() {
  const owner = await t.adult();
  const created = await t.request('POST', '/fin/entreprise', { user: owner, json: { name: 'Atelier', currency: 'DZD', publicKey: 'PUB-06', wilaya: 'Alger' } });
  const as = { 'X-Organisation': created.body.entreprise.id };
  const call = (method, path, json, user = owner) => t.request(method, `/fin/entreprise${path}`, { user, headers: as, json });
  return { owner, call };
}

describe('lot I: partners and institutions', () => {
  test('a financer sees only the requests to its offers, with only what was shared; documents are asked and answered', async () => {
    const admin = await t.admin();
    const banker = await t.adult();
    const outsider = await t.adult();
    const space = (await t.request('POST', '/admin/partenaires/espaces', { user: admin, json: { name: 'Banque Exemple', kind: 'financer' } })).body.espace;
    await t.request('POST', `/admin/partenaires/espaces/${space.id}/membres`, { user: admin, json: { email: banker.email } });
    const offer = (await t.request('POST', '/admin/partenaires/offres', { user: admin, json: { partnerName: 'Banque Exemple', partnerType: 'bank', title: 'Crédit', description: 'PME', spaceId: space.id } })).body.offre;
    const { call } = await organisation();
    const request = (await call('POST', '/partenaires/demandes', { offerId: offer.id, motive: 'Machine', sharedItems: ['profile'], consent: true })).body.demande;

    assert.equal((await t.request('GET', `/fin/partenaire/espaces/${space.id}/dossiers`, { user: outsider })).status, 404, 'not a member: no space');
    const files = (await t.request('GET', `/fin/partenaire/espaces/${space.id}/dossiers`, { user: banker })).body;
    assert.equal(files.dossiers.length, 1);
    const file = (await t.request('GET', `/fin/partenaire/espaces/${space.id}/dossiers/${request.id}`, { user: banker })).body.dossier;
    assert.equal(file.partage.profile.name, 'Atelier');
    assert.equal(file.partage.dashboard, undefined, 'the dashboard was not shared');

    const asked = (await t.request('POST', `/fin/partenaire/espaces/${space.id}/dossiers/${request.id}/messages`, { user: banker, json: { kind: 'piece', body: 'Bilan 2025 ?' } })).body.message;
    await call('POST', `/partenaires/demandes/${request.id}/messages`, { body: 'Ci-joint', replyToId: asked.id });
    const again = (await t.request('GET', `/fin/partenaire/espaces/${space.id}/dossiers`, { user: banker })).body;
    assert.notEqual(again.delaiReponse.resultat, null);
    assert.equal(again.dossiers[0].demandesOuvertes, 0);
  });

  test('an institution sees aggregates only; a learner joins by consent, within the licences', async () => {
    const admin = await t.admin();
    const manager = await t.adult();
    const space = (await t.request('POST', '/admin/partenaires/espaces', { user: admin, json: { name: 'Université', kind: 'institution', licences: 1, anonymityThreshold: 2 } })).body.espace;
    await t.request('POST', `/admin/partenaires/espaces/${space.id}/membres`, { user: admin, json: { email: manager.email } });
    const base = `/fin/partenaire/espaces/${space.id}`;
    const program = (await t.request('POST', `${base}/programmes`, { user: manager, json: { name: 'Gestion', startsAt: '2026-11-01', milestones: ['Lancement', 'Bilan'] } })).body.programme;
    await t.request('PUT', `${base}/programmes/${program.id}`, { user: manager, json: { milestone: { index: 0, done: true } } });
    const cohort = (await t.request('POST', `${base}/programmes/${program.id}/cohortes`, { user: manager, json: { name: 'Promo 1' } })).body.cohorte;
    const a = await t.adult();
    const b = await t.adult();
    await t.request('POST', `${base}/cohortes/${cohort.id}/invitations`, { user: manager, json: { emails: [a.email, b.email] } });

    const [invitation] = (await t.request('GET', '/fin/mes-cohortes', { user: a })).body.cohortes;
    assert.equal(invitation.status, 'invited');
    assert.equal((await t.request('POST', `/fin/mes-cohortes/${invitation.id}/accepter`, { user: a })).status, 200);
    const [other] = (await t.request('GET', '/fin/mes-cohortes', { user: b })).body.cohortes;
    const refused = await t.request('POST', `/fin/mes-cohortes/${other.id}/accepter`, { user: b });
    assert.equal(refused.body.error.details.reason, 'noLicenceLeft');

    const view = (await t.request('GET', `${base}/institution`, { user: manager })).body;
    assert.equal(view.programmes[0].avancement.resultat, 0.5);
    assert.equal(view.licences.utilisation.resultat, 1);
    const stats = view.programmes[0].cohorts[0].stats;
    assert.equal(stats.activation.resultat, 0.5);
    assert.equal(stats.masque, true, 'one active learner is under the threshold of two');
    assert.equal(stats.demarres, undefined);
  });

  test('a campaign report is validated by another person, then read by its platform only', async () => {
    const admin = await t.admin();
    const platformUser = await t.adult();
    const space = (await t.request('POST', '/admin/partenaires/espaces', { user: admin, json: { name: 'Plateforme', kind: 'cip' } })).body.espace;
    await t.request('POST', `/admin/partenaires/espaces/${space.id}/membres`, { user: admin, json: { email: platformUser.email } });
    const { call } = await organisation();
    const second = await t.adult();
    const invited = await call('POST', '/membres', { email: second.email, role: 'finance_manager' });
    await t.request('POST', `/fin/entreprise/invitations/${invited.body.membre.id}/accepter`, { user: second });

    const campaign = (await call('POST', '/campagnes', { name: 'Ligne', instrument: 'don', target: 1_000_000_00, currency: 'DZD' })).body.campagne;
    await call('PUT', `/campagnes/${campaign.id}/plateforme`, { spaceId: space.id });
    await call('POST', `/campagnes/${campaign.id}/engagements`, { amount: 200_000_00, declaredAt: '2026-11-10T00:00:00.000Z', source: 'Plateforme' });
    const report = (await call('POST', `/campagnes/${campaign.id}/rapports`, { from: '2026-11-01', to: '2026-11-30' })).body.rapport;
    assert.equal(report.content.operations.declares.montant, 200_000_00);
    assert.equal((await t.request('GET', `/fin/partenaire/espaces/${space.id}/rapports`, { user: platformUser })).body.rapports.length, 0, 'a draft is not shown');
    assert.equal((await call('POST', `/campagnes/${campaign.id}/rapports/${report.id}/valider`)).body.error.details.reason, 'secondPersonRequired');
    assert.equal((await call('POST', `/campagnes/${campaign.id}/rapports/${report.id}/valider`, {}, second)).status, 200);
    assert.equal((await t.request('GET', `/fin/partenaire/espaces/${space.id}/rapports`, { user: platformUser })).body.rapports.length, 1);
  });
});

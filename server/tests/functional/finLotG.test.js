import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P13-05, lot G (2026-11-24): partners, forum, HR without payroll,
// crowdfunding preparation — the rules that matter most.

let t;
before(async () => {
  t = await boot();
});
beforeEach(() => t.reset());
after(() => t.close());

const day = (iso) => `${iso}T00:00:00.000Z`;

async function setUp() {
  const owner = await t.adult();
  const created = await t.request('POST', '/fin/entreprise', { user: owner, json: { name: 'Atelier', currency: 'DZD', publicKey: 'PUB-06', wilaya: 'Alger' } });
  const as = { 'X-Organisation': created.body.entreprise.id };
  const call = (method, path, json, user = owner) => t.request(method, `/fin/entreprise${path}`, { user, headers: as, json });
  return { owner, call };
}

describe('lot G', () => {
  test('partners: an offer from the administration, a request only with consent, followed with its history', async () => {
    const admin = await t.admin();
    const offer = await t.request('POST', '/admin/partenaires/offres', { user: admin, json: { partnerName: 'Banque Exemple', partnerType: 'bank', title: 'Crédit d’équipement', description: 'Pour les PME.', wilayas: ['Alger'], publics: ['PUB-06'] } });
    assert.equal(offer.status, 201, JSON.stringify(offer.body));
    const { call } = await setUp();
    const offers = (await call('GET', '/partenaires')).body.offres;
    assert.equal(offers.length, 1);
    assert.equal((await call('POST', '/partenaires/demandes', { offerId: offer.body.offre.id, motive: 'Machine', consent: false })).status, 400);
    const request = await call('POST', '/partenaires/demandes', { offerId: offer.body.offre.id, motive: 'Machine', sharedItems: ['profile', 'dashboard'], consent: true });
    assert.equal(request.status, 201);
    await t.request('PATCH', `/admin/partenaires/demandes/${request.body.demande.id}`, { user: admin, json: { status: 'in_review', note: 'Dossier reçu' } });
    const mine = (await call('GET', '/partenaires/demandes')).body.demandes[0];
    assert.equal(mine.status, 'in_review');
    assert.equal(mine.history.length, 2);
  });

  test('forum: a message with a phone number waits for a moderator; a report is decided by a person', async () => {
    const { owner } = await setUp();
    const held = await t.request('POST', '/fin/forum', { user: owner, json: { category: 'tresorerie', title: 'Aide', body: 'Appelez-moi au 0551 23 45 67 pour en parler', consent: true } });
    assert.equal(held.body.discussion.status, 'held');
    const other = await t.adult();
    assert.equal((await t.request('GET', '/fin/forum', { user: other })).body.discussions.length, 0, 'not shown to others');
    const ok = await t.request('POST', '/fin/forum', { user: owner, json: { category: 'tresorerie', title: 'Délais clients', body: 'Comment réduisez-vous vos délais clients ?', consent: true } });
    assert.equal(ok.body.discussion.status, 'published');
    await t.request('POST', '/fin/forum/signalements', { user: other, json: { threadId: ok.body.discussion.id, reason: 'spam' } });
    const admin = await t.admin();
    const queue = (await t.request('GET', '/admin/forum/moderation', { user: admin })).body;
    assert.equal(queue.signalements.length, 1);
    assert.equal(queue.discussionsRetenues.length, 1);
    await t.request('POST', `/admin/forum/signalements/${queue.signalements[0].id}/decision`, { user: admin, json: { decision: 'removed', note: 'Hors sujet' } });
    assert.equal((await t.request('GET', '/fin/forum', { user: other })).body.discussions.length, 0);
  });

  test('HR: an absence is decided by another person; the leave balance counts approved days only', async () => {
    const { call } = await setUp();
    const employee = (await call('POST', '/personnel', { fullName: 'Nadia B.', position: 'Comptable', contract: 'cdi', startedAt: day('2020-01-01'), leaveRightsPerYear: 30 })).body.salarie;
    const absence = (await call('POST', `/personnel/${employee.id}/absences`, { kind: 'conge', startsAt: new Date().toISOString(), endsAt: new Date().toISOString(), days: 2 })).body.absence;
    const self = await call('POST', `/personnel/${employee.id}/absences/${absence.id}/approuver`);
    assert.equal(self.body.error.details.reason, 'secondPersonRequired');
    const view = (await call('GET', '/personnel')).body;
    assert.equal(view.salaries[0].conges.taken, 0, 'not approved: not taken');
    assert.equal(view.indicateurs.effectif.resultat, 1);
  });

  test('crowdfunding: a campaign opens only once its checks and its platform are done', async () => {
    const { call } = await setUp();
    const campaign = (await call('POST', '/campagnes', { name: 'Nouvelle ligne', instrument: 'capital', target: 1_000_000_00, currency: 'DZD', preMoney: 4_000_000_00 })).body.campagne;
    assert.equal((await call('PUT', `/campagnes/${campaign.id}`, { status: 'open' })).body.error.details.reason, 'campaignNotReady');
    const commitment = (await call('POST', `/campagnes/${campaign.id}/engagements`, { amount: 300_000_00, declaredAt: day('2026-11-20'), source: 'Plateforme' })).body.engagement;
    await call('POST', `/campagnes/${campaign.id}/engagements/${commitment.id}/confirmer`);
    const view = (await call('GET', '/campagnes')).body.campagnes[0].calcul;
    assert.equal(view.reste.resultat, 700_000_00);
    assert.equal(view.finance.resultat, 0.3);
    assert.equal(view.dilution, 0.2);
    assert.equal(view.plateformeVerifiee, false);
  });
});

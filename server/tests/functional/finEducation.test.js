import '../helpers/setup-env.js';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The educational layer (P8-17): six profiles, a parcours each (a formation of
// the catalogue at an agreed address), recommendations, and a person of a
// former collective profile asked to choose.

let t;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
});
after(() => t.close());

const view = async (user) => (await t.request('GET', '/fin/formation/parcours', { user })).body;

describe('P8-17 — the educational layer', () => {
  test('six profiles, the client’s words; a parcours being prepared says so', async () => {
    const user = await t.adult({ finPublic: 'LYC' });
    const res = await view(user);
    assert.deepEqual(res.profils.map((p) => p.code), ['LYC', 'ETU', 'JAC', 'SAL', 'EPG', 'AUT']);
    assert.equal(res.profil.code, 'LYC');
    assert.equal(res.parcours.name, 'Avenir');
    assert.equal(res.parcours.certificat, 'Certificat pédagogique de parcours Avenir');
    assert.equal(res.parcours.statut, 'en_preparation', 'the client is writing it');
    assert.equal(res.missions.statut, 'en_preparation');
    assert.equal(res.aChoisir, false);
  });

  test('a published parcours shows where the person stands; recommendations come first for the profile', async () => {
    await t.formation({ title: 'Parcours Avenir', slug: 'parcours-avenir', courses: [{ title: 'Mon premier budget' }, { title: 'Ma carte' }] });
    const forLyc = await t.formation({ title: 'Besoins et envies' });
    await t.prisma.formation.update({ where: { id: forLyc.id }, data: { educationProfiles: ['LYC'] } });
    const forSal = await t.formation({ title: 'Préparer sa retraite' });
    await t.prisma.formation.update({ where: { id: forSal.id }, data: { educationProfiles: ['SAL'] } });
    await t.formation({ title: 'Pour tous' });

    const user = await t.adult({ finPublic: 'LYC' });
    const res = await view(user);
    assert.equal(res.parcours.statut, 'publie');
    assert.equal(res.parcours.formation.cours.total, 2);
    assert.equal(res.parcours.formation.inscrit, false);
    const titles = res.recommandees.map((row) => row.title);
    assert.equal(titles[0], 'Besoins et envies', 'recommended to the profile first');
    assert.ok(titles.includes('Pour tous'));
    assert.ok(!titles.includes('Préparer sa retraite'), 'recommended to another profile only');
    assert.ok(!titles.includes('Parcours Avenir'), 'the parcours is shown as the parcours');
  });

  test('« autre / libre » gets the complete library', async () => {
    const forSal = await t.formation({ title: 'Préparer sa retraite' });
    await t.prisma.formation.update({ where: { id: forSal.id }, data: { educationProfiles: ['SAL'] } });
    const res = await view(await t.adult({ finPublic: 'AUT' }));
    assert.equal(res.parcours, null);
    assert.ok(res.recommandees.some((row) => row.title === 'Préparer sa retraite'));
  });

  test('a former collective profile is asked to choose, and can only choose one of the six', async () => {
    const user = await t.adult({ finPublic: 'COU' });
    const res = await view(user);
    assert.equal(res.aChoisir, true);
    assert.equal((await t.request('PUT', '/profile/fin', { user, json: { finPublic: 'FAM', acceptConsents: true } })).status, 400);
    assert.equal((await t.request('PUT', '/profile/fin', { user, json: { finPublic: 'SAL', acceptConsents: true } })).status, 200);
    assert.equal((await view(await t.prisma.user.findUnique({ where: { id: user.id } }))).aChoisir, false);
  });

  test('an admin attaches a formation to profiles, and only to the client’s six', async () => {
    const admin = await t.admin();
    const formation = await t.formation({ title: 'Épargner' });
    const ok = await t.request('PATCH', `/admin/formations/${formation.id}`, { user: admin, json: { educationProfiles: ['EPG', 'SAL'] } });
    assert.equal(ok.status, 200, JSON.stringify(ok.body).slice(0, 200));
    assert.deepEqual(ok.body.formation.educationProfiles, ['EPG', 'SAL']);
    assert.equal((await t.request('PATCH', `/admin/formations/${formation.id}`, { user: admin, json: { educationProfiles: ['COL'] } })).status, 400);
  });
});

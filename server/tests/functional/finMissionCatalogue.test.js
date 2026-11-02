import '../helpers/setup-env.js';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { MISSION_CATALOGUE } from '../../src/constants/finMissionRules.js';
import { missionDrafts } from '../../src/constants/finMissionContent.js';
import { createMissionSchema } from '../../src/validation/finMissions.schemas.js';
import { ensureMissionCatalogue } from '../../src/services/finMissionCatalogue.service.js';

// P8-34: the drafted missions V1 are valid, seeded without overwriting, played,
// and counted towards the certificate.

let t;
before(async () => {
  t = await boot();
});
beforeEach(() => t.reset());
after(() => t.close());

const play = (user, slug, picks) =>
  t.request('POST', `/fin/missions/${slug}/jouer`, { user, json: { choices: picks.map((choice, index) => ({ step: `etape-${index + 1}`, choice })) } });

describe('the drafted content', () => {
  test('26 missions and 3 final cases, every one accepted by the administration schema', () => {
    const drafts = missionDrafts(MISSION_CATALOGUE);
    assert.equal(drafts.length, 29);
    for (const draft of drafts) {
      const { status, ...body } = draft;
      const parsed = createMissionSchema.safeParse(body);
      assert.ok(parsed.success, `${draft.slug}: ${parsed.error?.message.slice(0, 200)}`);
    }
  });
});

describe('seeding and play', () => {
  test('adds what is missing, never overwrites an edited mission', async () => {
    assert.equal((await ensureMissionCatalogue(t.prisma)).length, 29);
    await t.prisma.finMission.update({ where: { slug: 'avenir-01' }, data: { title: 'Titre réécrit par le client' } });
    assert.deepEqual(await ensureMissionCatalogue(t.prisma), []);
    assert.equal((await t.prisma.finMission.findUnique({ where: { slug: 'avenir-01' } })).title, 'Titre réécrit par le client');
  });

  test('a lycéen sees his 8 missions and his final case, not the others', async () => {
    await ensureMissionCatalogue(t.prisma);
    const user = await t.adult({ finPublic: 'LYC', finCurrency: 'DZD', finOnboardedAt: new Date() });
    const list = (await t.request('GET', '/fin/missions', { user })).body.missions;
    assert.equal(list.length, 9);
    assert.ok(list.every((row) => row.slug.startsWith('avenir')));
  });

  test('the certificate path: 70 % per mission, 80 % for security, the final case, the 75 % average', async () => {
    await ensureMissionCatalogue(t.prisma);
    const user = await t.adult({ finPublic: 'LYC', finCurrency: 'DZD', finOnboardedAt: new Date() });
    const before = (await t.request('GET', '/fin/missions/certification', { user })).body.certification;
    assert.equal(before.eligible, false);
    assert.equal(before.total, 8);
    // Best + acceptable = 70 %: validates a normal mission, not the security module (80 %).
    for (const mission of MISSION_CATALOGUE.avenir.missions) assert.equal((await play(user, mission.key, ['a', 'b'])).status, 201);
    let status = (await t.request('GET', '/fin/missions/certification', { user })).body.certification;
    assert.equal(status.validated, 7, 'the security module needs 80 %');
    assert.ok(status.missing.includes('security') && status.missing.includes('finalCase'));
    // Perfect on the security module and on the final case; the average of the others stays at 70 %.
    await play(user, 'avenir-05', ['a', 'a']);
    await play(user, 'avenir-cas-final', ['a', 'a', 'b']);
    status = (await t.request('GET', '/fin/missions/certification', { user })).body.certification;
    assert.equal(status.validated, 8);
    assert.deepEqual(status.missing, ['average'], 'an average of about 73 % is under 75 %');
    // Replaying the others perfectly lifts it.
    for (const mission of MISSION_CATALOGUE.avenir.missions) await play(user, mission.key, ['a', 'a']);
    status = (await t.request('GET', '/fin/missions/certification', { user })).body.certification;
    assert.equal(status.eligible, true, JSON.stringify(status.missing));
  });

  test('a profile without a parcours has no certification', async () => {
    const user = await t.adult({ finPublic: 'AUT', finCurrency: 'DZD', finOnboardedAt: new Date() });
    assert.equal((await t.request('GET', '/fin/missions/certification', { user })).body.certification, null);
  });
});

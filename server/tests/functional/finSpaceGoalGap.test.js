import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P9-17 through the real API: the calendar of a common goal, the member's own
// alert with the detail, the owner's one without it, the milestones.

let t;
let owner;
let flatmate;
let space;
let ids;
let goal;

const DAY = 24 * 3600 * 1000;
const da = (units) => units * 100;
const iso = (date) => date.toISOString();
const ago = (days) => new Date(Date.now() - days * DAY);
const calendarUrl = () => `/fin/espaces/${space.id}/objectifs-communs/${goal.id}/calendrier`;
const gapAlerts = async (user) => (await t.request('GET', '/fin/notifications', { user })).body.notifications.filter((n) => n.type === 'space_goal_gap');
const calendar = (extra = {}) => ({ everyMonths: 1, firstDueAt: iso(ago(10)), shares: [{ memberId: ids.owner, amount: da(10000) }, { memberId: ids.flatmate, amount: da(10000) }], ...extra });

async function memberId(user) {
  const res = await t.request('GET', `/fin/espaces/${space.id}/membres`, { user });
  return res.body.membres.find((m) => m.isMe).id;
}

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  flatmate = await t.user();
  space = (await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'flatshare', label: 'Coloc', currency: 'DZD' } })).body.space;
  const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
  await t.request('POST', '/fin/espaces/rejoindre', { user: flatmate, json: { token: invite.body.token } });
  ids = { owner: await memberId(owner), flatmate: await memberId(flatmate) };
  const made = await t.request('POST', `/fin/espaces/${space.id}/objectifs-communs`, { user: owner, json: { label: 'Voyage', target: da(1000000), currency: 'DZD' } });
  assert.equal(made.status, 201, JSON.stringify(made.body).slice(0, 200));
  goal = made.body.goal;
});
after(() => t.close());

describe('the calendar of a common goal', () => {
  test('is set, shown with the goal, and removed with null', async () => {
    const set = await t.request('PUT', calendarUrl(), { user: owner, json: { calendar: calendar() } });
    assert.equal(set.status, 200, JSON.stringify(set.body).slice(0, 300));
    assert.equal(set.body.goal.contributionEveryMonths, 1);
    assert.equal(set.body.goal.shares.length, 2);
    const removed = await t.request('PUT', calendarUrl(), { user: owner, json: { calendar: null } });
    assert.equal(removed.body.goal.contributionEveryMonths, null);
    assert.equal(removed.body.goal.shares.length, 0);
  });

  test('refuses a stranger as a member, a member twice, and an unsupported rhythm', async () => {
    const stranger = '4f9a2d3e-2c1b-4d5e-8a7f-1b2c3d4e5f60';
    assert.equal((await t.request('PUT', calendarUrl(), { user: owner, json: { calendar: calendar({ shares: [{ memberId: stranger, amount: 100 }] }) } })).status, 422);
    assert.equal((await t.request('PUT', calendarUrl(), { user: owner, json: { calendar: calendar({ shares: [{ memberId: ids.owner, amount: 100 }, { memberId: ids.owner, amount: 100 }] }) } })).status, 422);
    assert.equal((await t.request('PUT', calendarUrl(), { user: owner, json: { calendar: calendar({ everyMonths: 5 }) } })).status, 422);
  });
});

describe('the alerts', () => {
  test('the late member gets the detail, the owner only a generic line, and each only once', async () => {
    await t.request('PUT', calendarUrl(), { user: owner, json: { calendar: calendar() } });
    await t.request('POST', `/fin/espaces/${space.id}/objectifs-communs/${goal.id}/contributions`, { user: owner, json: { amount: da(10000), contributedAt: iso(ago(5)) } });
    const mine = await gapAlerts(flatmate);
    assert.equal(mine.length, 2, 'reinforced and, being 10 days past, the reminder');
    assert.ok(mine.some((n) => n.params.event === 'reinforced' && n.params.gap === da(10000) && n.params.expected === da(10000)));
    assert.ok(mine.some((n) => n.params.event === 'reminder'));
    const theirs = await gapAlerts(owner);
    assert.deepEqual(theirs.filter((n) => n.params.event !== 'milestone').map((n) => n.params), [{ event: 'admin', label: 'Voyage' }], 'no name, no amount');
    assert.equal((await gapAlerts(flatmate)).length, 2, 'nothing repeated on the next generation');
  });

  test('nothing before the third day after the due date, nothing without a calendar', async () => {
    await t.request('PUT', calendarUrl(), { user: owner, json: { calendar: calendar({ firstDueAt: iso(ago(1)) }) } });
    assert.equal((await gapAlerts(flatmate)).length, 0);
    await t.request('PUT', calendarUrl(), { user: owner, json: { calendar: null } });
    assert.equal((await gapAlerts(flatmate)).length, 0);
  });

  test('milestones: the highest reached is told once to everybody, calendar or not', async () => {
    await t.request('POST', `/fin/espaces/${space.id}/objectifs-communs/${goal.id}/contributions`, { user: owner, json: { amount: da(300000), contributedAt: iso(ago(1)) } });
    const seen = await gapAlerts(flatmate);
    assert.deepEqual(seen.map((n) => [n.params.event, n.params.percent]), [['milestone', 25]]);
    assert.equal((await gapAlerts(flatmate)).length, 1);
  });
});

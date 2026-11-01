import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';

// The second batch of charts: the dashboard and the report of a shared space, the
// shared budgets and the task load, the health dimensions, the wealth (assets
// against debts, allocation) and the compound-interest curve. Each must draw,
// write its values, and offer the figures as text.

describe('more charts, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let owner;
  let space;

  const first = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 0, 0, 1)).toISOString();
  const api = (method, path, json, user = owner) => t.request(method, path, { user, ...(json === undefined ? {} : { json }) });
  const scrollShot = async (selector, name) => {
    await b.ev(`(document.querySelector(${JSON.stringify(selector)}) ?? document.body).scrollIntoView()`);
    await b.shot(name);
  };

  before(async () => {
    t = await boot();
    await t.reset();
    owner = await t.adult({ name: 'Nadia Graphiques', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    const friend = await t.adult({ name: 'Karim Ami', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    space = (await api('POST', '/fin/espaces', { kind: 'flatshare', label: 'Coloc', currency: 'DZD' })).body.space;
    const invite = await api('POST', `/fin/espaces/${space.id}/invitations`, { role: 'member' });
    await t.request('POST', '/fin/espaces/rejoindre', { user: friend, json: { token: invite.body.token } });
    const members = (await api('GET', `/fin/espaces/${space.id}/membres`)).body.membres;
    const ownerId = members.find((m) => m.isMe).id;
    const friendId = members.find((m) => !m.isMe).id;
    const parts = [{ memberId: ownerId }, { memberId: friendId }];
    await api('POST', `/fin/espaces/${space.id}/depenses`, { label: 'Courses', value: 400000, occurredAt: first(), splitMode: 'equal', payerId: ownerId, participants: parts, collectiveCategory: 'COLC-02' });
    await api('POST', `/fin/espaces/${space.id}/depenses`, { label: 'Internet', value: 90000, occurredAt: first(), splitMode: 'equal', payerId: friendId, participants: parts, collectiveCategory: 'COLC-06' });
    await api('PUT', `/fin/espaces/${space.id}/budgets`, { category: 'COLC-02', period: new Date().toISOString().slice(0, 7), value: 500000 });
    await api('POST', `/fin/espaces/${space.id}/taches`, { title: 'Ménage', category: 'household', assigneeId: ownerId, dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), weight: 3 });
    await api('POST', `/fin/espaces/${space.id}/taches`, { title: 'Courses', category: 'shopping', assigneeId: friendId, dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), weight: 1 });
    // personal side: an income and an expense (for the health index), an asset and a debt
    await api('POST', '/fin/transactions', { kind: 'income', value: 8000000, currency: 'DZD', occurredAt: first() });
    await api('POST', '/fin/transactions', { kind: 'expense', value: 2000000, currency: 'DZD', occurredAt: first() });
    await api('POST', '/fin/debts', { label: 'Téléphone', outstandingPrincipal: 2000000, monthlyInstalment: 100000, currency: 'DZD' });
    await t.prisma.finAsset.create({ data: { userId: owner.id, label: 'Livret', kind: 'savings', liquidity: 'immediate', value: 5000000, currency: 'DZD', valuedAt: new Date(), source: 'manual', status: 'declared' } }).catch(() => null);

    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1100 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(owner.id), url: site.url, httpOnly: true });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('the dashboard of a space: a ring of the spending, balances on one baseline, budgets planned against real', async () => {
    await b.goto(`${site.url}/partage/${space.id}`);
    await b.waitFor("document.querySelectorAll('.space-overview .home-ring').length >= 1", 'the ring', 15_000);
    assert.ok(await b.ev("document.querySelectorAll('.space-overview .chart-bar-track-signed').length >= 1"), 'the balances on a baseline');
    assert.ok(await b.ev("document.querySelectorAll('.space-overview .chart-legend-item').length >= 2"), 'a written legend');
    await scrollShot('.space-overview', 'charts2-space');
  });

  test('the report of a space: the ring and the balances', async () => {
    await b.goto(`${site.url}/partage/${space.id}/rapport`);
    await b.waitFor("document.querySelectorAll('.home-ring').length >= 1 && document.querySelectorAll('.chart-bar-track-signed').length >= 1", 'ring and balances', 15_000);
    await scrollShot('.home-ring', 'charts2-space-report');
  });

  test('the common budgets and the task load are drawn', async () => {
    await b.goto(`${site.url}/partage/${space.id}/budgets`);
    await b.waitFor("document.querySelectorAll('.chart-bar-row').length >= 1", 'the budgets bars', 15_000);
    await b.goto(`${site.url}/partage/${space.id}/taches`);
    await b.waitFor("document.querySelectorAll('.chart-bar-row').length >= 2", 'the load bars', 15_000);
    await scrollShot('.chart', 'charts2-tasks');
  });

  test('the health index: its dimensions side by side, out of 100', async () => {
    await b.goto(`${site.url}/app/sante`);
    await b.waitFor("document.querySelectorAll('.chart-bar-row').length >= 5", 'the dimensions', 15_000);
    assert.ok(await b.ev("[...document.querySelectorAll('.chart-bar-value')].some((e) => e.textContent.includes('/ 100'))"));
    await scrollShot('.chart', 'charts2-health');
  });

  test('the wealth: what is owned against what is owed', async () => {
    await b.goto(`${site.url}/app/patrimoine`);
    await b.waitFor("document.querySelectorAll('.chart-bar-row').length >= 2", 'the two bars', 15_000);
    await scrollShot('.chart', 'charts2-wealth');
  });

  test('the compound-interest curve: value against what was paid in, over the table', async () => {
    await b.goto(`${site.url}/outils/simulateurs/interet-compose`);
    await b.waitFor("!!document.querySelector('button[type=submit], form button')", 'the form');
    await b.ev("document.querySelector('form button[type=button], .simulator-example, button')?.click()");
    const clicked = await b.clickContaining('Charger un exemple');
    assert.ok(clicked);
    assert.ok(await b.clickContaining('Calculer'));
    await b.waitFor("document.querySelectorAll('.simulator-serie .chart-line').length >= 2", 'the two curves', 15_000);
    assert.ok(await b.ev("document.querySelectorAll('.simulator-serie .chart-legend-item').length === 2"), 'a legend naming both');
    await scrollShot('.simulator-serie', 'charts2-compound');
  });
});

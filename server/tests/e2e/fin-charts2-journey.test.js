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

  test('the dashboard of a space also draws the pot and what each member paid, month by month', async () => {
    const history = (await api('GET', `/fin/espaces/${space.id}/historique-mensuel`)).body.historique;
    assert.equal(history.points.length, 6);
    const last = history.points.at(-1);
    assert.equal(last.soldeGroupe, -490000, 'no entry, 400 000 + 90 000 spent');
    assert.deepEqual(Object.values(last.paye).sort((a, b) => a - b), [90000, 400000], 'each member paid their own');
    await b.goto(`${site.url}/partage/${space.id}`);
    await b.waitFor("document.querySelectorAll('.space-overview .chart-line').length >= 2", 'the two curves', 15_000);
    assert.ok(await b.ev("document.querySelectorAll('.space-overview .chart-legend-item').length >= 3"), 'a legend naming the balance and the members');
    await scrollShot('.space-compartment-wide', 'charts2-space-history');
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

  test('the debt strategies: what is still owed month by month, one curve for each order', async () => {
    await api('POST', '/fin/debts', { label: 'Crédit voiture', outstandingPrincipal: 6000000, monthlyInstalment: 300000, currency: 'DZD', rate: 0.09 });
    await api('POST', '/fin/debts', { label: 'Crédit conso', outstandingPrincipal: 2000000, monthlyInstalment: 150000, currency: 'DZD', rate: 0.14 });
    await b.goto(`${site.url}/app/dettes/strategies`);
    await b.waitFor("document.querySelectorAll('.chart .chart-line').length >= 2", 'the two curves', 15_000);
    assert.ok(await b.ev("document.querySelectorAll('.chart .chart-legend-item').length === 2"), 'a legend naming both orders');
    assert.ok(await b.ev("!!document.querySelector('.chart details table')"), 'the figures as a table');
    await scrollShot('.chart', 'charts2-debt-strategies');
  });

  test('the goals against each other, personal and common: progress on one scale, the value written', async () => {
    // Written straight to the table: the API refuses capital that no marked saving backs.
    const goal = (label, target, allocated) => t.prisma.finGoal.create({ data: { userId: owner.id, label, target, currency: 'DZD', allocated, source: 'manual', status: 'real' } });
    await goal('Voyage', 1000000, 250000);
    await goal('Ordinateur', 400000, 300000);
    await b.goto(`${site.url}/app/objectifs`);
    await b.waitFor("document.querySelectorAll('.chart .chart-bar-row').length >= 2", 'the goal bars', 15_000);
    const values = await b.ev("[...document.querySelectorAll('.chart-bar-value')].map((e) => e.textContent.trim())");
    assert.ok(values.some((v) => v.includes('25')) && values.some((v) => v.includes('75')), JSON.stringify(values));
    await scrollShot('.chart', 'charts2-goals');

    await api('POST', `/fin/espaces/${space.id}/objectifs-communs`, { label: 'Cuisine', target: 1000000, currency: 'DZD' });
    await api('POST', `/fin/espaces/${space.id}/objectifs-communs`, { label: 'Vacances', target: 500000, currency: 'DZD' });
    await b.goto(`${site.url}/partage/${space.id}/objectifs`);
    await b.waitFor("document.querySelectorAll('.chart .chart-bar-row').length >= 2", 'the common goal bars', 15_000);
    await scrollShot('.chart', 'charts2-common-goals');
  });

  test('the calendar: the load of the month week by week, what falls due', async () => {
    const day = (n) => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), n, 12)).toISOString();
    const planned = (n, kind, value) => api('POST', '/fin/transactions', { kind, value, currency: 'DZD', occurredAt: day(n), planned: true });
    const first = await planned(3, 'expense', 150000);
    assert.equal(first.status, 201, JSON.stringify(first.body).slice(0, 300));
    for (const [n, kind, value] of [[20, 'expense', 90000]]) {
      const res = await planned(n, kind, value);
      assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 300));
    }
    const cal = (await api('GET', '/fin/calendrier')).body.calendrier;
    assert.ok((cal.semaines ?? []).length >= 4, 'the weeks of the month');
    assert.equal(cal.semaines.reduce((sum, week) => sum + week.sorties, 0), 240000);
    await b.goto(`${site.url}/app/calendrier`);
    await b.waitFor("document.querySelectorAll('.chart .chart-bar-row').length >= 4", 'the weeks', 15_000);
    await scrollShot('.chart', 'charts2-calendar-weeks');
  });

  test('two months compared: the categories side by side, each value written', async () => {
    const lastMonth = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 1, 10, 12)).toISOString();
    assert.equal((await api('POST', '/fin/transactions', { kind: 'expense', value: 700000, currency: 'DZD', occurredAt: lastMonth })).status, 201);
    await b.goto(`${site.url}/app/synthese/rapports`);
    await b.waitFor("document.querySelectorAll('.synthesis-compare .chart-bar-row').length >= 1", 'the compared bars', 15_000);
    assert.ok(await b.ev("document.querySelectorAll('.synthesis-compare .chart-legend-item').length === 2"), 'a legend naming both months');
    await scrollShot('.synthesis-compare .chart', 'charts2-compare-months');
  });

  test('the expected incomes: each source against the same scale, at its monthly equivalent', async () => {
    const listed = await api('GET', '/fin/revenus');
    assert.equal(listed.status, 200);
    await api('POST', '/fin/revenus', { label: 'Salaire', value: 8000000, currency: 'DZD', frequency: 'mensuel', startDate: new Date(Date.now() - 60 * 86400000).toISOString() });
    await api('POST', '/fin/revenus', { label: 'Prime annuelle', value: 1200000, currency: 'DZD', frequency: 'annuel', startDate: new Date(Date.now() - 60 * 86400000).toISOString() });
    const monthly = (await api('GET', '/fin/revenus')).body.incomes.find((row) => row.label === 'Prime annuelle').monthlyValue;
    assert.equal(monthly, 100000, 'a year of 12 000 DA is 1 000 DA a month');
    await b.goto(`${site.url}/app/budgets/revenus`);
    await b.waitFor("document.querySelectorAll('.chart .chart-bar-track, .chart li').length >= 2", 'the bars', 15_000);
    assert.ok((await b.ev('document.body.textContent')).includes('Prime annuelle'));
    await scrollShot('.chart', 'charts2-incomes');
  });
});

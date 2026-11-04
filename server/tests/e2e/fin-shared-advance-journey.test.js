import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';

// SUIVI_RECETTE R2-06 (scenario S20a, rule P9-15), driven through the screens:
// A pays 9 000 DA of groceries for A, B and C in equal parts with their own
// account. The account is debited of 9 000, A's budget bears 3 000, 6 000 are an
// advance; B pays 3 000 back and A says where it arrived: the account rises, it
// is NOT an income, and the advance goes from 6 000 to 3 000.

describe('a shared expense paid with one’s own money, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let a;
  let bUser;
  let cUser;
  let space;
  let ids;
  let account;

  const api = (method, path, json, user = a) => t.request(method, path, { user, ...(json === undefined ? {} : { json }) });
  const memberId = async (user) => (await api('GET', `/fin/espaces/${space.id}/membres`, undefined, user)).body.membres.find((m) => m.isMe).id;
  const balance = async (id) => (await api('GET', '/fin/comptes')).body.accounts.find((row) => row.id === id).solde.resultat;
  const setField = (selector, value, proto = 'HTMLInputElement') =>
    b.ev(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false;
      Object.getOwnPropertyDescriptor(${proto}.prototype, 'value').set.call(el, ${JSON.stringify(value)});
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);

  before(async () => {
    t = await boot();
    await t.reset();
    a = await t.adult({ name: 'Amel Payeuse', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    bUser = await t.adult({ name: 'Bilal', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    cUser = await t.adult({ name: 'Chafia', finPublic: 'SAL', finCurrency: 'DZD', finOnboardedAt: new Date() });
    space = (await api('POST', '/fin/espaces', { kind: 'flatshare', label: 'Coloc', currency: 'DZD', displayName: 'Amel' })).body.space;
    for (const user of [bUser, cUser]) {
      const invite = await api('POST', `/fin/espaces/${space.id}/invitations`, { role: 'member' });
      await api('POST', '/fin/espaces/rejoindre', { token: invite.body.token }, user);
    }
    ids = { a: await memberId(a), b: await memberId(bUser), c: await memberId(cUser) };
    account = (await api('POST', '/fin/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 5000000, openingDate: new Date(Date.now() - 60 * 86400000).toISOString() })).body.account;
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1100, height: 1000 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(a.id), url: site.url, httpOnly: true });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('the form: the account is debited of 9 000, the budget bears 3 000, 6 000 are an advance', async () => {
    await b.goto(`${site.url}/partage/${space.id}/depenses`);
    assert.ok(await b.waitText('Ajouter une dépense partagée', 20_000), 'the expenses page');
    assert.ok(await b.clickContaining('Ajouter une dépense partagée'));
    await b.waitFor("!!document.querySelector('#shared-expense-label')", 'the form', 10_000);
    await b.type('#shared-expense-label', 'Courses');
    await b.type('#shared-expense-value', '9000');
    assert.ok(await setField('#shared-expense-account', account.id, 'HTMLSelectElement'));
    assert.ok(await b.clickWhere('e => e.type === "submit" && e.closest("form") && !!e.closest("form").querySelector("#shared-expense-label")'));
    await b.waitFor('true', 'sent', 1000);
    for (let i = 0; i < 30 && (await t.prisma.finSharedExpense.count()) === 0; i += 1) await new Promise((resolve) => setTimeout(resolve, 300));

    assert.equal(await balance(account.id), 5000000 - 900000, 'the account is debited of the whole amount');
    const expenses = await t.prisma.finTransaction.findMany({ where: { userId: a.id, kind: 'expense', deletedAt: null } });
    assert.deepEqual(expenses.map((row) => row.value), [300000], 'A’s own expense is the share only: 3 000 DA');
    const advance = (await api('GET', '/fin/comptes')).body.accounts.find((row) => row.type === 'AC-09');
    assert.equal(advance.solde.resultat, 600000, 'the advance to recover is 6 000 DA');
    await b.shot('shared-advance-after-expense');
  });

  test('B pays 3 000 back and A says where: the account rises, it is not an income, the advance falls to 3 000', async () => {
    const res = await api('POST', `/fin/espaces/${space.id}/reglements`, { fromId: ids.b, toId: ids.a, value: 300000, settledAt: new Date().toISOString(), accountId: account.id });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));
    assert.equal(await balance(account.id), 5000000 - 900000 + 300000);
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: a.id, kind: 'income' } }), 0, 'never an income');
    const advance = (await api('GET', '/fin/comptes')).body.accounts.find((row) => row.type === 'AC-09');
    assert.equal(advance.solde.resultat, 300000);
    // The same expense is not counted twice: still one personal expense of 3 000.
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: a.id, kind: 'expense', deletedAt: null } }), 1);

    await b.goto(`${site.url}/app/comptes`);
    assert.ok(await b.waitText('Avance', 20_000), 'the advance account is on the accounts page');
    await b.shot('shared-advance-accounts');
  });
});

import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P13-05, lot A (2026-11-23): the organisations of the client's référentiel,
// in the browser — an owner creates one with its professional profile,
// invites an external accountant, who accepts but sees nothing until the
// owner gives a mandate; the journal says who did what.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const O = fr.business.org;

describe('organisations, members and mandates, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let owner;
  let accountant;

  const as = async (user) => {
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
  };
  // A React-controlled <select>: the native setter, then the event React listens to.
  const choose = (selector, value) =>
    b.ev(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  const button = (label) => b.clickWhere(`e => e.tagName === 'BUTTON' && e.textContent.trim().includes(${JSON.stringify(label)})`);

  before(async () => {
    t = await boot();
    await t.reset();
    owner = await t.adult({ name: 'Samia Belkacem', finCurrency: 'DZD', finOnboardedAt: new Date() });
    accountant = await t.adult({ name: 'Karim Comptable', finCurrency: 'DZD', finOnboardedAt: new Date() });
    site = await startSite(t.baseUrl);
    b = await Browser.launch({ width: 1200, height: 1000 });
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr'); localStorage.removeItem('fincludia.organisation'); true");
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('the owner creates the organisation with its professional profile', async () => {
    await as(owner);
    await b.goto(`${site.url}/app/entreprise`);
    assert.ok(await b.waitFor("!!document.querySelector('#business-name')", 'the creation form', 15_000));
    await b.type('#business-name', 'Atelier Belkacem');
    await choose('#business-public', 'PUB-06');
    await b.ev("document.querySelector('.business-create button[type=submit]').click(); true");
    assert.ok(await b.waitFor("!!document.querySelector('#org-switch')", 'the organisation bar', 15_000));
    assert.ok((await b.ev('document.body.textContent')).includes(O.yourRole.replace('{{role}}', O.roles.owner)));
    const org = await t.prisma.finBusiness.findFirst({ where: { userId: owner.id } });
    assert.equal(org.publicKey, 'PUB-06');
  });

  test('the owner invites an external accountant, who is told a mandate is needed', async () => {
    // Lot C: members and journal live in their own tab.
    assert.ok(await b.waitFor("!!document.querySelector('#business-tab-team')", 'the team tab', 15_000));
    await b.ev("document.querySelector('#business-tab-team').click(); true");
    assert.ok(await b.waitFor("!!document.querySelector('.org-invite')", 'the members section', 15_000));
    await b.type('.org-invite input[type=email]', accountant.email);
    await choose('.org-invite select', 'accountant_external');
    assert.ok(await b.waitText(O.mandateNeeded));
    await button(O.invite);
    assert.ok(await b.waitText(O.status.invited, 10_000));
  });

  test('the accountant accepts, and sees nothing without a mandate', async () => {
    await as(accountant);
    await b.goto(`${site.url}/app/entreprise`);
    assert.ok(await b.waitText(O.invitationsTitle, 15_000));
    await button(O.accept);
    assert.ok(await b.waitFor("!!document.querySelector('#org-switch')", 'now a member', 15_000));
    assert.ok(await b.waitText(O.yourRole.replace('{{role}}', O.roles.accountant_external), 10_000));
    assert.equal(await b.ev("!!document.querySelector('.org-members')"), false, 'no members section for this role');
    assert.equal(await b.ev("!!document.querySelector('.fin-figure-grid')"), false, 'no figures');
  });

  test('the owner gives a mandate; the accountant then reads the figures, and the journal says it all', async () => {
    await as(owner);
    await b.goto(`${site.url}/app/entreprise`);
    assert.ok(await b.waitFor("!!document.querySelector('#business-tab-team')", 'the team tab', 15_000));
    await b.ev("document.querySelector('#business-tab-team').click(); true");
    assert.ok(await b.waitFor("!!document.querySelector('.org-mandate-form')", 'the mandate form', 15_000));
    await b.type('.org-mandate-form input:not([type=date])', 'Révision des comptes 2026');
    await button(O.grant);
    assert.ok(await b.waitText(O.granted, 10_000));
    // The journal reads itself again after the save.
    assert.ok(await b.waitFor(`document.querySelector('.org-journal').textContent.includes(${JSON.stringify(O.actions['mandate.granted'])})`, 'the new line', 10_000));
    const journal = await b.ev("document.querySelector('.org-journal').textContent");
    for (const action of ['organisation.created', 'member.invited', 'member.accepted', 'mandate.granted']) assert.ok(journal.includes(O.actions[action]), action);
    await b.shot('organisation-owner');

    await as(accountant);
    await b.goto(`${site.url}/app/entreprise`);
    assert.ok(await b.waitFor("!!document.querySelector('.fin-figure-grid')", 'the figures, under mandate', 15_000));
    assert.equal(await b.ev("!!document.querySelector('#business-amount')"), false, 'reading, not writing');
    await b.shot('organisation-accountant');
  });
});

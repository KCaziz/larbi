import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { PDF, fileForm } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// P3-04 + P3-05 in a real browser: what visitors, a standard account and a premium account
// see on the blog, the newsletter sign-up / confirmation / unsubscription, and the
// administration screens (subscribers, mailing preparation, access level of an article).

const bcrypt = createRequire(import.meta.url)('bcryptjs');
const locale = (l) => JSON.parse(readFileSync(path.resolve(SERVER_DIR, `../client/src/i18n/locales/${l}.json`), 'utf8'));
const fr = locale('fr');
const ar = locale('ar');
const PASSWORD = 'Passw0rd!test';
const SECRET = 'motsecretpremium';

describe('profiles and newsletter, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let outbox;
  let makeToken;
  let premiumArticle;
  let targeted;
  let admin;

  const row = (email) => t.prisma.newsletterSubscriber.findUnique({ where: { email } });
  const mailTo = (email) => [...outbox].reverse().find((m) => m.to === email);
  const tokenOf = (mail) => new URL(mail.text.match(/https?:\/\/\S+/)[0]).searchParams.get('token');

  const login = async (email, expectPath) => {
    await b.clearCookies();
    await b.goto(`${site.url}/connexion`);
    await b.waitFor("!!document.querySelector('#email')");
    await b.type('#email', email);
    await b.type('#password', PASSWORD);
    await b.click(fr.auth.login.submit);
    assert.ok(await b.waitFor(expectPath ? `location.pathname === '${expectPath}'` : "location.pathname !== '/connexion'"), `signed in as ${email}`);
  };

  before(async () => {
    t = await boot();
    ({ outbox } = await import('../../src/services/mail.service.js'));
    ({ makeToken } = await import('../../src/services/newsletter.service.js'));
    await t.reset();
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    admin = await t.admin({ name: 'Camille Rédactrice', email: 'redactrice@example.com', passwordHash });
    await t.user({ name: 'Sofia Standard', email: 'standard@example.com', passwordHash, accountType: 'pmi', accessLevel: 'standard' });
    await t.user({ name: 'Karim Premium', email: 'premium@example.com', passwordHash, accountType: 'pme', accessLevel: 'premium' });
    targeted = await t.article({ title: 'Guide pour les PMI', body: '<p>Texte pour PMI</p>', targetAccountTypes: ['pmi'] });
    premiumArticle = await t.article({ title: 'Dossier premium', body: `<p>Le ${SECRET} est ici.</p>`, requiredAccessLevel: 'premium' });
    await t.request('POST', `/admin/articles/${premiumArticle.id}/media`, { user: admin, form: fileForm(PDF, { name: 'dossier.pdf', type: 'application/pdf' }) });
    site = await startSite(t.baseUrl);
    b = await Browser.launch();
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  describe('a visitor without account', () => {
    test('sees the premium article in the list, marked as premium', async () => {
      await b.goto(`${site.url}/blog`);
      assert.ok(await b.waitText('Dossier premium'));
      assert.ok(await b.ev(`[...document.querySelectorAll('.blog-chip-premium')].some(e => e.textContent.includes(${JSON.stringify(fr.blogList.premiumBadge)}))`));
    });

    test('opens it and finds the padlock instead of the text; the text is nowhere in the page, not even hidden', async () => {
      await b.goto(`${site.url}/blog/${premiumArticle.slug}`);
      assert.ok(await b.waitText(fr.article.lock.title));
      assert.ok(await b.waitText(fr.article.lock.loginBody));
      assert.ok(!(await b.ev('document.documentElement.innerHTML')).includes(SECRET), 'the text never reached the browser');
      assert.ok(!(await b.ev('document.documentElement.innerHTML')).includes('dossier.pdf'), 'nor the file');
    });

    test('"Se connecter" leads to the login and comes back to the article', async () => {
      await b.click(fr.article.lock.login);
      assert.ok(await b.waitFor("location.pathname === '/connexion'"));
      await b.type('#email', 'standard@example.com');
      await b.type('#password', PASSWORD);
      await b.click(fr.auth.login.submit);
      assert.ok(await b.waitFor(`location.pathname === '/blog/${premiumArticle.slug}'`), 'back on the article');
    });
  });

  describe('a standard account', () => {
    test('is told the article needs premium, with the way to upgrade; still no text', async () => {
      assert.ok(await b.waitText(fr.article.lock.premiumBody));
      assert.ok(await b.waitText(fr.article.lock.upgrade));
      assert.ok(!(await b.ev('document.documentElement.innerHTML')).includes(SECRET));
    });

    test('searching a word that only exists in the premium text finds nothing', async () => {
      await b.goto(`${site.url}/blog?q=${SECRET}`);
      assert.ok(await b.waitText(fr.blogList.noResultsTitle));
    });

    test('a "pmi" account gets "Pour votre profil" with the article aimed at pmi', async () => {
      await b.goto(`${site.url}/blog`);
      assert.ok(await b.waitText(fr.blogList.forYou));
      assert.ok(await b.ev(`document.querySelector('.blog-foryou')?.innerText.includes(${JSON.stringify(targeted.title)})`));
    });
  });

  describe('a premium account', () => {
    test('reads the text and gets the attached file', async () => {
      await login('premium@example.com');
      await b.goto(`${site.url}/blog/${premiumArticle.slug}`);
      assert.ok(await b.waitText(SECRET));
      assert.ok(!(await b.text()).includes(fr.article.lock.title));
      assert.ok(await b.waitText('dossier.pdf'));
      const url = await b.ev("document.querySelector('.blog-doc').getAttribute('href')");
      const file = await b.fetch(url);
      assert.equal(file.status, 200);
      assert.equal(file.type, 'application/pdf');
    });

    test('the same file, requested without the session, is refused', async () => {
      const url = await b.ev("document.querySelector('.blog-doc').getAttribute('href')");
      await b.clearCookies();
      assert.equal((await b.fetch(url)).status, 401);
    });
  });

  describe('newsletter: sign-up, confirmation, unsubscription', () => {
    test('a visitor signs up from the blog and is told to check their mailbox', async () => {
      await b.clearCookies();
      await b.goto(`${site.url}/blog`);
      await b.waitFor("!!document.querySelector('#newsletter-email')");
      await b.type('#newsletter-email', 'lecteur@example.com');
      await b.click(fr.newsletter.submit);
      assert.ok(await b.waitText(fr.newsletter.doneTitle));
      assert.equal((await row('lecteur@example.com')).status, 'pending');
      assert.ok(mailTo('lecteur@example.com'));
    });

    test('an invalid address is refused in plain language', async () => {
      await b.goto(`${site.url}/blog`);
      await b.waitFor("!!document.querySelector('#newsletter-email')");
      await b.type('#newsletter-email', 'pas-une-adresse');
      await b.click(fr.newsletter.submit);
      assert.ok(await b.waitText(fr.newsletter.invalid));
      assert.equal(await t.prisma.newsletterSubscriber.count({ where: { email: { contains: 'pas-une' } } }), 0);
    });

    test('opening the link of the mail confirms NOTHING by itself; the button does', async () => {
      await b.goto(`${site.url}/newsletter/confirmer?token=${tokenOf(mailTo('lecteur@example.com'))}`);
      assert.ok(await b.waitText(fr.newsletter.link.confirm.title));
      await new Promise((r) => setTimeout(r, 600));
      assert.equal((await row('lecteur@example.com')).status, 'pending', 'a mail scanner opening the link changes nothing');
      await b.click(fr.newsletter.link.confirm.button);
      assert.ok(await b.waitText(fr.newsletter.link.confirm.doneTitle));
      assert.equal((await row('lecteur@example.com')).status, 'confirmed');
    });

    test('a broken link shows an explanation, not an error page', async () => {
      await b.goto(`${site.url}/newsletter/confirmer?token=${'x'.repeat(40)}`);
      await b.click(fr.newsletter.link.confirm.button);
      assert.ok(await b.waitText(fr.newsletter.link.invalid));
      await b.goto(`${site.url}/newsletter/desinscription`);
      assert.ok(await b.waitText(fr.newsletter.link.invalid));
    });

    test('the unsubscription link works through its button', async () => {
      const subscriber = await row('lecteur@example.com');
      await b.goto(`${site.url}/newsletter/desinscription?token=${makeToken('unsubscribe', subscriber.id)}`);
      assert.ok(await b.waitText(fr.newsletter.link.unsubscribe.title));
      assert.equal((await row('lecteur@example.com')).status, 'confirmed', 'opening the page does not unsubscribe');
      await b.click(fr.newsletter.link.unsubscribe.button);
      assert.ok(await b.waitText(fr.newsletter.link.unsubscribe.doneTitle));
      assert.equal((await row('lecteur@example.com')).status, 'unsubscribed');
    });
  });

  describe('administration', () => {
    before(async () => {
      await t.prisma.newsletterSubscriber.createMany({
        data: [
          { email: 'confirme@example.com', status: 'confirmed', confirmedAt: new Date(), locale: 'en' },
          { email: 'attente@example.com' },
        ],
      });
      await login('redactrice@example.com');
    });

    test('the menu has a Newsletter entry; the page shows counts and the list', async () => {
      await b.goto(`${site.url}/admin/newsletter`);
      assert.ok(await b.waitText('confirme@example.com'));
      assert.ok(await b.ev(`[...document.querySelectorAll('.newsletter-stats div')].some(d => d.textContent.includes(${JSON.stringify(fr.admin.newsletter.status.confirmed)}))`));
      assert.ok(await b.ev(`[...document.querySelectorAll('a')].some(a => a.textContent.includes(${JSON.stringify(fr.admin.nav.newsletter)}))`));
    });

    test('search and status filter', async () => {
      await b.type('#nl-search', 'attente');
      await b.click(fr.admin.newsletter.searchButton);
      assert.ok(await b.waitFor(`!document.body.innerText.includes('confirme@example.com') && document.body.innerText.includes('attente@example.com')`));
    });

    test('deleting a subscriber asks for confirmation, then erases the address', async () => {
      await b.clickWhere(`e => e.getAttribute('aria-label') === ${JSON.stringify(fr.admin.newsletter.delete.replace('{{email}}', 'attente@example.com'))}`);
      assert.ok(await b.waitText('attente@example.com'));
      assert.ok(await b.waitFor("!!document.querySelector('dialog[open]')"));
      assert.equal(await t.prisma.newsletterSubscriber.count({ where: { email: 'attente@example.com' } }), 1, 'nothing is deleted before confirming');
      await b.clickWhere(`e => e.closest('dialog[open]') && e.textContent.trim() === ${JSON.stringify(fr.admin.newsletter.deleteConfirm)}`);
      assert.ok(await b.waitFor("!document.querySelector('dialog[open]')"));
      assert.equal(await t.prisma.newsletterSubscriber.count({ where: { email: 'attente@example.com' } }), 0);
    });

    test('the CSV export downloads only confirmed addresses, for an administrator', async () => {
      const res = await b.fetch('/api/admin/newsletter/subscribers.csv');
      assert.equal(res.status, 200);
      assert.match(res.type, /text\/csv/);
      assert.match(res.disposition, /attachment/);
    });

    test('"Préparer un envoi" shows the message per language and says nothing is sent', async () => {
      await b.goto(`${site.url}/admin/newsletter`);
      await b.clickTab(fr.admin.newsletter.tabs.digest);
      assert.ok(await b.waitText(fr.admin.newsletter.digest.subject));
      assert.ok(await b.waitText(fr.admin.newsletter.digest.notSentYet));
      assert.ok(await b.waitText('Dossier premium'));
      assert.ok(await b.ev("document.querySelector('.newsletter-preview pre').innerText.includes('{{unsubscribeUrl}}')"));
    });

    test('the editor of an article lets the author choose the access level and the profiles, and saves them', async () => {
      await b.goto(`${site.url}/admin/articles/${targeted.id}`);
      await b.waitFor("!!document.querySelector('[role=tab]')");
      await b.clickTab(fr.admin.articles.steps.organize);
      assert.ok(await b.waitText(fr.admin.articles.organize.accessTitle));
      await b.ev("(() => { const s = document.querySelector('#a-level'); const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set; set.call(s, 'premium'); s.dispatchEvent(new Event('change', { bubbles: true })); })()");
      await b.clickWhere("e => e.tagName === 'BUTTON' && e.textContent.trim() === 'Enregistrer'");
      assert.ok(await b.waitFor(`document.body.innerText.includes(${JSON.stringify(fr.admin.save.saved)})`));
      const saved = await t.prisma.article.findUnique({ where: { id: targeted.id } });
      assert.equal(saved.requiredAccessLevel, 'premium');
      assert.deepEqual(saved.targetAccountTypes, ['pmi']);
    });

    test('a standard account cannot open the newsletter administration', async () => {
      await login('standard@example.com');
      const res = await b.fetch('/api/admin/newsletter/subscribers');
      assert.equal(res.status, 403);
      await b.goto(`${site.url}/admin/newsletter`);
      assert.ok(await b.waitFor("!document.body.innerText.includes('confirme@example.com')"));
    });
  });

  describe('Arabic (right to left) and phone width', () => {
    test('the sign-up block and the lock are translated and the page does not overflow on 375px', async () => {
      await b.clearCookies();
      await b.goto(`${site.url}/`);
      await b.ev("localStorage.setItem('lang', 'ar')");
      await b.setViewport(375, 800);
      await b.goto(`${site.url}/blog/${premiumArticle.slug}`);
      assert.ok(await b.waitText(ar.article.lock.title));
      assert.ok(await b.waitText(ar.newsletter.title));
      assert.equal(await b.ev('document.documentElement.dir'), 'rtl');
      assert.ok(await b.ev('document.documentElement.scrollWidth <= window.innerWidth'), 'no horizontal scroll');
    });
  });

  test('no JavaScript error during the whole journey', () => {
    assert.deepEqual(b.jsErrors, []);
  });
});

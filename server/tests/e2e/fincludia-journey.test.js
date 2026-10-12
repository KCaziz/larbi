import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// FINCLUDIA foundations in a real browser: publics onboarding (P3-18), the
// "Apprendre" glossary and mini-guides (P2-08), and the deterministic
// assistant's free-text resolver with a real deep link (P3-19).

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const fin = fr.account.fin;
const ap = fr.apprendre;
const cb = fr.chatbot;

describe('FINCLUDIA foundations, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let admin;
  let learner;

  const setSession = async (user) => {
    await b.clearCookies();
    if (user) await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
  };

  before(async () => {
    t = await boot();
    await t.reset();
    admin = await t.admin({ name: 'Admin FINCLUDIA' });
    learner = await t.user({ name: 'Visiteuse' });
    site = await startSite(t.baseUrl);
    b = await Browser.launch();
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test('P3-18: onboarding picks one public, consent is required once, and a later change is logged as a transition', async () => {
    await setSession(learner);
    await b.goto(`${site.url}/compte/fincludia`);
    assert.ok(await b.waitText(fin.title));
    assert.ok(await b.waitText(fin.consentPrivacy));

    // Saving without consent is blocked client-side (the button stays disabled).
    assert.equal(await b.ev("document.querySelector('.fin-profile-form button[type=submit]').disabled"), true);

    await b.ev(`(() => {
      const select = document.querySelector('#fin-public');
      const option = [...select.options].find((o) => o.textContent.includes('Étudiant'));
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, option.value);
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    assert.ok(await b.ev("(() => { const el = document.querySelector('.fin-consent-checkbox input'); if (!el) return false; el.click(); return true; })()"));
    assert.equal(await b.ev("document.querySelector('.fin-profile-form button[type=submit]').disabled"), false);
    assert.ok(await b.clickWhere("e => e.type === 'submit' && e.closest('.fin-profile-form')"));
    assert.ok(await b.waitText(fin.saved));
    assert.equal((await t.prisma.user.findUnique({ where: { id: learner.id } })).finPublic, 'ETU');

    // Change the public: a real transition this time.
    await b.ev(`(() => {
      const select = document.querySelector('#fin-public');
      const option = [...select.options].find((o) => o.textContent.includes('Jeune actif'));
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, option.value);
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    assert.ok(await b.clickWhere("e => e.type === 'submit' && e.closest('.fin-profile-form')"));
    assert.ok(await b.waitText(fin.transitionsTitle));
    assert.equal(await t.prisma.finProfileTransition.count({ where: { userId: learner.id } }), 1);
    await b.shot('fincludia-profile');
  });

  test('P2-08: an administrator publishes a glossary term and a mini-guide, a visitor finds them from Apprendre', async () => {
    await setSession(admin);
    await b.goto(`${site.url}/admin/apprendre`);
    assert.ok(await b.waitText('Apprendre'));
    assert.ok(await b.click(fr.admin.glossary.addTerm));
    await b.type('.glossary-admin-inline-form input', 'Taux d’effort');
    assert.ok(await b.clickWhere("e => e.type === 'submit' && e.closest('.glossary-admin-inline-form')"));
    assert.ok(await b.waitFor("Boolean(document.querySelector('.glossary-admin-form'))"));
    await b.ev("document.querySelector('.cms-rte-content').focus()");
    await b.send('Input.insertText', { text: 'La part du revenu consacrée au remboursement des crédits.' });
    assert.ok(await b.clickWhere("e => e.type === 'submit' && e.closest('.glossary-admin-form')"));
    assert.ok(await b.waitText(fr.admin.glossary.saved));
    assert.ok(await b.clickWhere(`e => e.title === ${JSON.stringify(fr.admin.glossary.publish)}`));
    assert.ok(await b.waitText(fr.admin.glossary.published));

    await b.goto(`${site.url}/apprendre`);
    assert.ok(await b.waitText(ap.title));
    await b.type('#apprendre-q', 'effort');
    assert.ok(await b.click(ap.search));
    assert.ok(await b.waitText('Taux d’effort'));
    assert.ok(await b.click('Taux d’effort'));
    assert.ok(await b.waitFor("location.pathname.startsWith('/apprendre/termes/')"));
    assert.ok(await b.waitText('remboursement des crédits'));
    await b.shot('apprendre-term');
  });

  // What finishing P2-08 added: the search groups the four kinds of content the
  // client lists, an entry can send to a calculator, and content can be kept.
  test('P2-08: Apprendre groups courses, glossary and articles, sends to a calculator, and keeps a favourite', async () => {
    // A course and an article on the same theme as a glossary term.
    // Its own account: this test must not depend on what the profile test
    // left on the shared one (a public changes the ORDER of the results).
    const keeper = await t.user({ name: 'Collectionneuse' });
    await t.formation({ title: 'Maitriser son budget', status: 'published', theme: 'budget', level: 'beginner' });
    await t.article({ title: 'Tenir un budget au quotidien', status: 'published', theme: 'budget', level: 'beginner' });
    const term = await t.prisma.glossaryTerm.create({
      data: {
        slug: 'mensualite-de-credit',
        term: 'Mensualite de credit',
        definition: '<p>Le montant verse chaque mois a la banque.</p>',
        status: 'published',
        theme: 'budget',
        level: 'beginner',
        // The calculator an administrator attached to this term.
        simulatorKey: 'mensualite-financement',
      },
    });

    await setSession(null);
    await b.goto(`${site.url}/apprendre`);
    assert.ok(await b.waitText(ap.title));

    // The four groups the client asks for, each with its own heading.
    const text = await b.text();
    for (const heading of [ap.coursesTitle, ap.termsTitle, ap.articlesTitle]) {
      assert.ok(text.includes(heading), `the "${heading}" group is shown`);
    }
    assert.ok(text.includes('Maitriser son budget') && text.includes('Tenir un budget au quotidien'));
    // The mention the client imposes on this screen.
    assert.ok(text.includes(ap.disclaimer.slice(0, 40)));
    // A course says it needs an account rather than leading to a refusal.
    assert.ok(text.includes(ap.requiresAccount));

    // "Simuler" leads to the calculator the administrator chose.
    assert.ok(await b.clickContaining(ap.simulate));
    assert.ok(await b.waitFor("location.pathname === '/outils/simulateurs/mensualite-financement'"));

    // Keeping a favourite needs an account: a visitor is told, not offered.
    await b.goto(`${site.url}/apprendre`);
    assert.ok(await b.waitText(ap.favorites.needsAccount.slice(0, 30)));
    assert.equal(await b.ev("document.querySelectorAll('.apprendre-fav').length"), 0);

    // Signed in, the same card can be kept, and it lands in "Mes favoris".
    await setSession(keeper);
    await b.goto(`${site.url}/apprendre`);
    assert.ok(await b.waitText(ap.favorites.title));
    assert.ok(await b.waitFor("document.querySelectorAll('.apprendre-fav').length > 0"));
    assert.ok(
      await b.ev(`(() => {
        const card = [...document.querySelectorAll('.apprendre-card')].find((c) => c.innerText.includes('Mensualite de credit'));
        if (!card) return false;
        card.querySelector('.apprendre-fav').click();
        return true;
      })()`),
    );
    assert.ok(await b.waitFor("document.querySelectorAll('.apprendre-fav.active').length > 0"), 'the card is marked as kept');
    assert.equal(await t.prisma.learningFavorite.count({ where: { userId: keeper.id, kind: 'term', refId: term.id } }), 1);
    await b.shot('apprendre-grouped');
  });

  test('P3-19: the assistant resolves a free-text query and opens a real screen', async () => {
    await setSession(admin);
    await b.goto(`${site.url}/admin/assistant-fincludia`);
    assert.ok(await b.waitText(fr.admin.finAssistant.title));
    assert.ok(await b.waitText(fr.admin.finAssistant.intentsNote));
    // Edit "APPRENDRE_TERME": deep link to /apprendre, a response, and keywords.
    assert.ok(
      await b.ev(`(() => {
        const item = [...document.querySelectorAll('.fa-admin-item')].find((e) => e.textContent.includes('APPRENDRE_TERME'));
        const button = item && [...item.querySelectorAll('button')].find((e) => e.textContent.trim() === ${JSON.stringify(fr.admin.finAssistant.edit)});
        if (!button) return false;
        button.click();
        return true;
      })()`),
    );
    assert.ok(await b.waitFor("Boolean(document.querySelector('.fa-admin-form'))"));
    await b.type('#fi-keywords', 'obligation, terme, definition');
    await b.ev("document.querySelector('.cms-rte-content').focus()");
    await b.send('Input.insertText', { text: 'Direction : la page Apprendre.' });
    await b.ev(`(() => {
      const select = document.querySelector('#fi-link');
      const option = [...select.options].find((o) => o.value === '/apprendre');
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, option.value);
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    assert.ok(await b.clickWhere("e => e.type === 'submit' && e.closest('.fa-admin-form')"));
    assert.ok(await b.waitText(fr.admin.finAssistant.saved));
    assert.ok(
      await b.ev(`(() => {
        const item = [...document.querySelectorAll('.fa-admin-item')].find((e) => e.textContent.includes('APPRENDRE_TERME'));
        const button = item && [...item.querySelectorAll('button')].find((e) => e.title === ${JSON.stringify(fr.admin.finAssistant.publish)});
        if (!button) return false;
        button.click();
        return true;
      })()`),
    );
    assert.ok(await b.waitText(fr.admin.finAssistant.published));

    await setSession(null);
    await b.goto(`${site.url}/`);
    assert.ok(await b.waitFor("Boolean(document.querySelector('.chatbot-toggle'))"));
    assert.ok(await b.click(cb.open));
    assert.ok(await b.waitFor("Boolean(document.querySelector('.chatbot-search'))"));
    await b.type('.chatbot-search input', 'C\'est quoi une obligation ?');
    assert.ok(await b.clickWhere("e => e.type === 'submit' && e.closest('.chatbot-search')"));
    assert.ok(await b.waitText('la page Apprendre'));
    assert.ok(await b.click(cb.openScreen));
    assert.ok(await b.waitFor("location.pathname === '/apprendre'"));
    await b.shot('fincludia-assistant-resolved');
  });

  test('P3-19: an unmatched query falls back to categories, never invents an answer', async () => {
    await b.goto(`${site.url}/`);
    assert.ok(await b.click(cb.open));
    await b.type('.chatbot-search input', 'bonjour tout le monde comment ça va');
    assert.ok(await b.clickWhere("e => e.type === 'submit' && e.closest('.chatbot-search')"));
    assert.ok(await b.waitText(cb.notUnderstood));
  });

  test('phone: the FINCLUDIA profile and Apprendre pages fit the screen', async () => {
    await setSession(learner);
    await b.setViewport(390, 800);
    await b.goto(`${site.url}/compte/fincludia`);
    assert.ok(await b.waitText(fin.title));
    assert.equal(await b.ev('document.documentElement.scrollWidth <= innerWidth'), true);
    await b.goto(`${site.url}/apprendre`);
    assert.ok(await b.waitText(ap.title));
    assert.equal(await b.ev('document.documentElement.scrollWidth <= innerWidth'), true);
    await b.setViewport(1280, 1000);
  });
});

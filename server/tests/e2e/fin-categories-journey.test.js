import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// "Mes catégories" in a real browser (P6-02): the client's reference is there,
// a category can be added, renamed, hidden and brought back, a standard one can
// be renamed for this account alone, and every change leaves a readable trail.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));
const c = fr.finCategories;

describe('FINCLUDIA categories, end to end', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let owner;

  const goToCategories = async () => {
    await b.goto(`${site.url}/compte/categories`);
    assert.ok(await b.waitText(c.title), 'the categories page opens');
  };

  // The row of one category, found by its visible label.
  const rowOf = (label) =>
    `(() => { const li = [...document.querySelectorAll('.fincat-row')].find((e) => e.querySelector('.fincat-label')?.textContent.trim() === ${JSON.stringify(label)}); return li; })()`;

  const labelsOf = (family) =>
    b.ev(`(() => {
      const section = [...document.querySelectorAll('.fincat-family')].find((e) => e.querySelector('h3').textContent.includes(${JSON.stringify(family)}));
      return [...section.querySelectorAll('.fincat-label')].map((e) => e.textContent.trim());
    })()`);

  // Waits for the control, like a person would, instead of demanding that the
  // row already be rendered the instant the page reports its title.
  const clickActionInRow = (label, title) =>
    b.clickWhere(
      `e => (e.title === ${JSON.stringify(title)} || e.textContent.trim() === ${JSON.stringify(title)})` +
        ` && e.closest('.fincat-row')?.querySelector('.fincat-label')?.textContent.trim() === ${JSON.stringify(label)}`,
    );

  before(async () => {
    t = await boot();
    await t.reset();
    owner = await t.user({ name: 'Propriétaire' });
    site = await startSite(t.baseUrl);
    b = await Browser.launch();
    await b.goto(`${site.url}/a-propos`);
    await b.ev("localStorage.setItem('lang', 'fr')");
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(owner.id), url: site.url, httpOnly: true });
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  test("the client's reference is on screen, grouped in its 8 families", async () => {
    await goToCategories();
    // The families are the client's own wording (reference data, untranslated).
    for (const family of ['Revenus / ressources', 'Dépenses fixes / obligatoires', 'Objectifs', 'Dettes / passifs', 'Dépenses partagées']) {
      assert.ok(await b.waitText(family), `family ${family}`);
    }
    assert.equal(await b.ev("document.querySelectorAll('.fincat-family').length"), 8);
    assert.equal(await b.ev("document.querySelectorAll('.fincat-row').length"), 91, 'the 91 standard categories');

    // Every family offers an "Autre", so nothing has to be forced somewhere wrong.
    const goals = await labelsOf('Objectifs');
    assert.ok(goals.includes('Autre'));
    assert.ok(goals.includes('Réserve de sécurité'));
  });

  test('adding a category, renaming it, and reading the trail of what happened', async () => {
    await goToCategories();
    const section = "[...document.querySelectorAll('.fincat-family')].find((e) => e.querySelector('h3').textContent.includes('Dépenses variables'))";
    assert.ok(
      await b.ev(`(() => { const el = ${section}.querySelector('.fincat-add-open'); if (!el) return false; el.click(); return true; })()`),
      'the add form opens',
    );
    await b.type('#fincat-new-variable', 'Café du matin');
    assert.ok(await b.ev(`(() => { const el = ${section}.querySelector('button[type=submit]'); if (!el) return false; el.click(); return true; })()`));
    assert.ok(await b.waitText(c.created), 'the confirmation survives the reload');
    assert.ok((await labelsOf('Dépenses variables')).includes('Café du matin'));

    // Renaming it in place.
    assert.ok(await clickActionInRow('Café du matin', c.rename));
    const id = await b.ev(`(() => ${rowOf('Café du matin')} ? '' : '')()`);
    assert.equal(id, '', 'the row is still on screen while editing');
    await b.type('.fincat-edit input', 'Café');
    assert.ok(await b.ev("(() => { const el = document.querySelector('.fincat-edit button[type=submit]'); if (!el) return false; el.click(); return true; })()"));
    assert.ok(await b.waitText(c.saved));
    assert.ok((await labelsOf('Dépenses variables')).includes('Café'));

    // The trail: the creation, then the correction, both readable.
    assert.ok(await clickActionInRow('Café', c.history));
    assert.ok(await b.waitText('Nom'), 'the corrected field is named in the trail');
    const trail = await b.ev("[...document.querySelectorAll('.fincat-history li')].map((e) => e.innerText).join(' | ')");
    assert.ok(trail.includes('Café du matin'), 'the previous name is still readable');
    assert.ok(trail.includes(c.actions.create), 'the creation is in the trail');
  });

  test('hiding a category takes it out of the list, and it can be brought back', async () => {
    await goToCategories();
    assert.ok(await clickActionInRow('Café', c.archive));
    assert.ok(await b.waitText(c.archived));
    assert.ok(!(await labelsOf('Dépenses variables')).includes('Café'), 'gone from the list');

    // It is not deleted: asking for hidden categories shows it, struck through.
    assert.ok(await b.ev("(() => { const el = document.querySelector('.fincat-archived input'); if (!el) return false; el.click(); return true; })()"));
    assert.ok(await b.waitText('Café'));
    assert.ok(await b.ev(`(() => ${rowOf('Café')}.classList.contains('fincat-archived-row'))()`));

    assert.ok(await clickActionInRow('Café', c.restore));
    assert.ok(await b.waitText(c.restored));
    assert.ok((await labelsOf('Dépenses variables')).includes('Café'));
  });

  test("renaming one of the client's standard categories keeps its original name in view", async () => {
    await goToCategories();
    assert.ok(await clickActionInRow('Animaux', c.rename));
    await b.type('.fincat-edit input', 'Mon chat');
    assert.ok(await b.ev("(() => { const el = document.querySelector('.fincat-edit button[type=submit]'); if (!el) return false; el.click(); return true; })()"));
    assert.ok(await b.waitText(c.saved));

    const labels = await labelsOf('Dépenses variables');
    assert.ok(labels.includes('Mon chat'));
    assert.ok(!labels.includes('Animaux'), 'the person sees their own label');
    // The client's wording stays shown beside it: the category must remain
    // findable under the name the reference gives it.
    assert.ok(await b.waitText(c.wasCalled.replace('{{label}}', 'Animaux')));

    // The reference row in the database was NOT touched.
    const reference = await t.prisma.finCategory.findFirst({ where: { key: 'variable.animaux', userId: null } });
    assert.equal(reference.label, 'Animaux');

    // And it can go back to the client's name.
    assert.ok(await clickActionInRow('Mon chat', c.reset));
    assert.ok(await b.waitText(c.resetDone));
    assert.ok((await labelsOf('Dépenses variables')).includes('Animaux'));
  });

  test('a refused name is explained on the page instead of blanking it', async () => {
    await goToCategories();
    const section = "[...document.querySelectorAll('.fincat-family')].find((e) => e.querySelector('h3').textContent.includes('Objectifs'))";
    assert.ok(await b.ev(`(() => { const el = ${section}.querySelector('.fincat-add-open'); if (!el) return false; el.click(); return true; })()`));
    await b.type('#fincat-new-goal', 'Permis');
    assert.ok(await b.ev(`(() => { const el = ${section}.querySelector('button[type=submit]'); if (!el) return false; el.click(); return true; })()`));

    assert.ok(await b.waitText(c.errors.labelTaken), 'the reason is shown');
    assert.ok(await b.ev(`document.body.innerText.includes(${JSON.stringify(c.title)})`), 'the page is still there');
  });

  test('deleting a category removes it from the list but keeps the row for the history', async () => {
    await goToCategories();
    const section = "[...document.querySelectorAll('.fincat-family')].find((e) => e.querySelector('h3').textContent.includes('Actifs réels'))";
    assert.ok(await b.ev(`(() => { const el = ${section}.querySelector('.fincat-add-open'); if (!el) return false; el.click(); return true; })()`));
    await b.type('#fincat-new-asset', 'Vieille moto');
    assert.ok(await b.ev(`(() => { const el = ${section}.querySelector('button[type=submit]'); if (!el) return false; el.click(); return true; })()`));
    assert.ok(await b.waitText(c.created));

    assert.ok(await clickActionInRow('Vieille moto', c.delete));
    assert.ok(await b.waitText(c.deleted));
    assert.ok(!(await labelsOf('Actifs réels')).includes('Vieille moto'));

    const row = await t.prisma.finCategory.findFirst({ where: { userId: owner.id, label: 'Vieille moto' } });
    assert.ok(row.deletedAt, 'the deletion is logical: the row is still there, dated');
    const trail = await t.prisma.finChange.findMany({ where: { entityId: row.id } });
    assert.ok(
      trail.some((change) => change.action === 'delete'),
      'and the journal says it was deleted',
    );
  });

  test('another account sees the reference untouched', async () => {
    const other = await t.user({ name: 'Quelqu un d autre' });
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(other.id), url: site.url, httpOnly: true });
    await goToCategories();
    const labels = await labelsOf('Dépenses variables');
    assert.ok(labels.includes('Animaux'), "the other account's rename is invisible here");
    assert.ok(!labels.includes('Café'), "and so is the other account's own category");
    assert.equal(await b.ev("document.querySelectorAll('.fincat-row').length"), 91);
  });

  test('the page works in Arabic, right to left', async () => {
    const ar = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/ar.json'), 'utf8'));
    await b.ev("localStorage.setItem('lang', 'ar')");
    // Not goToCategories(): that one waits for the FRENCH title.
    await b.goto(`${site.url}/compte/categories`);
    assert.ok(await b.waitText(ar.finCategories.title));
    assert.equal(await b.ev("document.documentElement.getAttribute('dir')"), 'rtl');
    // The category labels stay the client's own wording, untranslated.
    assert.ok(await b.waitText('Animaux'));
    await b.ev("localStorage.setItem('lang', 'fr')");
  });
});

import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';

// The navigation of the connected space in a real browser (P1-12): the nine
// entries, the two layouts, the top bar, and the keyboard path the client asks
// for explicitly.
//
// Why a browser test and not only an API one: the menu's whole job is to be
// usable. Three of its four requirements — side menu on a computer, tabs plus a
// secondary menu on a phone, keyboard navigation — are statements about what a
// person can do with it, and none of them can be checked from a JSON answer.
//
// `shows` / `hides` EVALUATE the expression. `b.hasText(x)` builds a string of
// JavaScript, so `assert.ok(await b.hasText(x))` asserts that a non-empty
// string is truthy, which it always is — twenty assertions were vacuously true
// in the ten-journey suite before this was noticed.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('P1-12 — the navigation of the connected space', { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;
  let adult;
  let minor;

  before(async () => {
    t = await boot();
    await t.reset();
    adult = await t.adult({ name: 'Salima Salariée', finPublic: 'SAL' });
    minor = await t.minor({ name: 'Lyes Lycéen', finPublic: 'LYC' });
    site = await startSite(t.baseUrl);
    b = await Browser.launch();
  });

  after(async () => {
    await b?.close();
    site?.stop();
    await t.close();
  });

  const setSession = (user) =>
    b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });

  const shows = (what) => b.ev(b.hasText(what));
  const hides = async (what) => !(await b.ev(b.hasText(what)));

  // One Tab press, as a person makes it: a real key event, so the browser's own
  // focus order decides what comes next — not a `focus()` call that would prove
  // nothing about the order.
  const pressTab = async (shift = false) => {
    for (const type of ['rawKeyDown', 'keyUp']) {
      await b.send('Input.dispatchKeyEvent', { type, windowsVirtualKeyCode: 9, key: 'Tab', code: 'Tab', modifiers: shift ? 8 : 0 });
    }
    await sleep(40);
  };

  const pressEnter = async () => {
    for (const type of ['rawKeyDown', 'char', 'keyUp']) {
      await b.send('Input.dispatchKeyEvent', { type, windowsVirtualKeyCode: 13, key: 'Enter', code: 'Enter', text: '\r' });
    }
    await sleep(400);
  };

  const focused = () => b.ev("(() => { const e = document.activeElement; return e ? `${e.tagName}:${(e.getAttribute('href') ?? e.textContent ?? '').trim().slice(0, 40)}` : 'none'; })()");

  test('a salariée adulte sees the client’s groups beside her page, on a computer', async () => {
    await setSession(adult);
    await b.setViewport(1280);
    await b.goto(`${site.url}/aujourdhui`);
    // The groups come FROM THE SERVER, so waiting for the navigation is not
    // enough: the account block renders at once and the groups arrive after
    // `GET /fin/parcours`. Waiting on the wrong element is how a menu test
    // passes on a menu that is still empty.
    assert.ok(await b.waitFor("!!document.querySelector('.fin-nav-groups')", 'the menu groups'), 'no menu rendered');

    // The client's own entries, by name.
    for (const label of ['Aujourd’hui', 'Mon argent', 'Mes objectifs', 'Ma sécurité', 'Mon patrimoine', 'Apprendre']) {
      assert.ok(await shows(label), `missing group: ${label}`);
    }

    // On a computer every group is open: the entries of a group you are NOT in
    // are visible too, which is the difference between a side menu and a
    // vertical row of tabs.
    const visibleEntries = await b.ev("[...document.querySelectorAll('.fin-nav-entry')].filter((e) => e.offsetParent !== null).length");
    assert.ok(visibleEntries >= 8, `only ${visibleEntries} entries visible on a computer`);
  });

  test('and the navigation really is beside the page, not above it', async () => {
    // The requirement is a LAYOUT, so it is measured: the menu and the content
    // share a horizontal band instead of stacking.
    const sideBySide = await b.ev(`(() => {
      const nav = document.querySelector('.fin-nav').getBoundingClientRect();
      const main = document.querySelector('.fin-shell-main').getBoundingClientRect();
      return nav.bottom > main.top + 40 && Math.abs(nav.width - main.width) > 100;
    })()`);
    assert.ok(sideBySide, 'the menu is not beside the page at 1280px');
  });

  test('on a phone the groups are tabs, and only the current group shows its entries', async () => {
    await b.setViewport(375, 760);
    await b.goto(`${site.url}/budget`);
    assert.ok(await b.waitFor("!!document.querySelector('.fin-nav-group-current')", 'the current group'));

    // "Mon argent" holds the budget, so its entries are the secondary menu.
    const current = await b.ev("document.querySelector('.fin-nav-group-current .fin-nav-group-link').innerText.trim()");
    assert.equal(current, 'Mon argent');

    // A group you are not in costs no tab stop: hidden, not merely collapsed.
    const hiddenElsewhere = await b.ev(`[...document.querySelectorAll('.fin-nav-group:not(.fin-nav-group-current) .fin-nav-entry')].every((e) => e.offsetParent === null)`);
    assert.ok(hiddenElsewhere, 'a group that is not current still shows its entries on a phone');

    const openHere = await b.ev("[...document.querySelectorAll('.fin-nav-group-current .fin-nav-entry')].filter((e) => e.offsetParent !== null).length");
    assert.ok(openHere >= 2, `the current group shows only ${openHere} entries`);
  });

  test('the whole menu is reachable with the Tab key alone, and Enter follows it', async () => {
    await b.setViewport(1280);
    await b.goto(`${site.url}/aujourdhui`);
    await b.waitFor("!!document.querySelector('.fin-nav-groups')");
    await b.ev('document.body.focus(); window.scrollTo(0, 0)');

    // Walk forward until the focus lands inside the menu, then on the entry we
    // want. No `focus()` anywhere: if the order is wrong, this never arrives.
    let reached = null;
    for (let i = 0; i < 80 && !reached; i += 1) {
      await pressTab();
      const href = await b.ev("document.activeElement?.closest('.fin-nav') ? (document.activeElement.getAttribute('href') ?? '') : ''");
      if (href === '/objectifs') reached = href;
    }
    assert.equal(reached, '/objectifs', `never reached the goals entry by keyboard (last focus: ${await focused()})`);

    await pressEnter();
    assert.ok(await b.waitFor("location.pathname === '/objectifs'", 'navigation to /objectifs'), 'Enter did not follow the focused entry');
  });

  test('the focused entry is visibly focused, and the current one is marked without colour alone', async () => {
    // The client asks for keyboard navigation AND for meaning never carried by
    // colour alone. A focus ring that was removed, or an active entry marked
    // only by a tint, breaks one of the two.
    const ring = await b.ev(`(() => {
      const link = document.querySelector('.fin-nav-entry');
      link.focus();
      const s = getComputedStyle(link);
      return s.outlineStyle !== 'none' || s.boxShadow !== 'none';
    })()`);
    assert.ok(ring, 'a focused menu entry shows nothing');

    const marked = await b.ev(`(() => {
      const current = document.querySelector('.fin-nav-entry.active, .fin-nav-group-current > .fin-nav-group-link');
      if (!current) return false;
      const s = getComputedStyle(current);
      return current.getAttribute('aria-current') === 'page' || Number(s.fontWeight) >= 600;
    })()`);
    assert.ok(marked, 'the current entry is distinguished by colour alone');
  });

  test('a lycéen is offered no debt, no patrimony and no funding entry', async () => {
    await setSession(minor);
    await b.goto(`${site.url}/aujourdhui`);
    await b.waitFor("!!document.querySelector('.fin-nav-groups')");

    assert.ok(await hides('Mon patrimoine'), 'a minor is offered the patrimony group');
    const routes = await b.ev("[...document.querySelectorAll('.fin-nav a')].map((a) => a.getAttribute('href'))");
    for (const route of ['/dettes', '/patrimoine', '/financement', '/outils/explorateur']) {
      assert.ok(!routes.includes(route), `a minor is offered ${route}`);
    }
  });

  test('but a lycéen keeps their own money in the menu', async () => {
    // The failure to guard against is over-hiding: a menu that protects a minor
    // by taking away their own pages is worse than the problem it solves.
    const routes = await b.ev("[...document.querySelectorAll('.fin-nav a')].map((a) => a.getAttribute('href'))");
    for (const route of ['/aujourdhui', '/mon-argent', '/objectifs', '/portefeuille', '/apprendre']) {
      assert.ok(routes.includes(route), `a minor lost ${route}`);
    }
  });

  test('the period selector is a real radio group, and the server answers for the window chosen', async () => {
    // The control is only worth having if choosing changes the figures. So the
    // assertion is not "four options are on screen" but "the period the server
    // answered for moved" — read from the dates the page prints, which come
    // from the server's answer and not from the browser.
    await setSession(adult);
    await b.setViewport(1280);
    await b.goto(`${site.url}/mon-argent`);
    assert.ok(await b.waitFor("!!document.querySelector('.fin-period')", 'the period selector'), 'no period selector');

    const options = await b.ev("document.querySelectorAll('.fin-period input[type=radio]').length");
    assert.equal(options, 4, 'the client asks for four windows');
    assert.equal(await b.ev("document.querySelector('.fin-period input:checked').value"), 'mois');

    const monthStart = await b.ev("document.querySelector('.money-period').innerText.trim()");
    // Clicked on the radio itself, not on a button: the option is a label
    // wrapping an input, which is what makes it a radio group with free
    // keyboard behaviour. (`b.clickWhere` only looks at buttons, links and
    // tabs — the control is clickable by a person, the helper simply does not
    // see labels.)
    assert.ok(
      await b.ev(`(() => { const i = document.querySelector('.fin-period input[value="90jours"]'); if (!i) return false; i.click(); return true; })()`),
      'the 90 days option is not there',
    );
    assert.ok(
      await b.waitFor(`document.querySelector('.money-period')?.innerText.trim() !== ${JSON.stringify(monthStart)}`, 'the period to change'),
      'choosing 90 days did not change the period the figures cover',
    );
    assert.equal(await b.ev("document.querySelector('.fin-period input:checked').value"), '90jours');
  });

  test('the top bar carries the notifications and opens the assistant without leaving the page', async () => {
    await setSession(adult);
    await b.goto(`${site.url}/aujourdhui`);
    assert.ok(await b.waitFor("!!document.querySelector('.notif-bell')", 'the bell'), 'no notification entry in the top bar');

    // The count is in the accessible name, not only in a coloured disc.
    const label = await b.ev("document.querySelector('.notif-bell').getAttribute('aria-label')");
    assert.match(label, /Notifications/);

    // The assistant is a panel, not a route: the bar asks for it and the page
    // does not change.
    assert.ok(await b.clickWhere("e => (e.getAttribute('title') ?? '') === 'Aide'"), 'no help entry in the top bar');
    assert.ok(await b.waitFor("!!document.querySelector('.chatbot-panel, [class*=chatbot][class*=panel]')", 'the assistant panel'), 'the help entry opened nothing');
    assert.equal(await b.ev('location.pathname'), '/aujourdhui', 'the help entry navigated away');
  });
});

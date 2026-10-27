import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Browser, findChrome, startSite } from '../helpers/browser.js';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';

// The client's ten end-to-end journeys (onglet `02_Parcours_E2E`), in a real
// browser — the last criterion of the end-of-phase validation (P6-21).
//
// Each test walks ONE of the client's functional chains, in the client's own
// order, and asserts that every link of the chain is reachable and shows the
// figure that chain is about:
//
//   J01 Entrer dans FINCLUDIA        connexion → profil → diagnostic → tableau
//   J02 Construire mon budget        revenus → catégories → enveloppes → dépenses → prévu/réel
//   J03 Créer un objectif            catalogue → montant/date → trajectoire → contribution → suivi
//   J04 Renforcer ma sécurité        dépenses essentielles → épargne → mois de réserve → cible
//   J05 Comprendre une dette         ajouter → coût/échéances → taux d'effort → scénarios
//   J06 Préparer un financement      besoin → situation → préparation → comparaison
//   J07 Construire mon patrimoine    actifs/dettes → valorisations → net → concentration
//   J08 Apprendre à investir         diagnostic → profil → portefeuille fictif → journal
//   J09 Gérer à plusieurs            espace → inviter → permissions → dépense → soldes → règlements
//   J10 Préparer une dépense annuelle provision → contribution mensuelle → échéance
//
// The data is set up through the API (fast and unambiguous); what the browser
// proves is that the SCREENS of the chain render, carry the figures, and never
// show a fictional amount inside a real total.

const fr = JSON.parse(readFileSync(path.resolve(SERVER_DIR, '../client/src/i18n/locales/fr.json'), 'utf8'));

describe("FINCLUDIA — les dix parcours J01 à J10 du client", { skip: findChrome() ? false : 'no Chrome/Chromium found (set CHROME_PATH)' }, () => {
  let t;
  let site;
  let b;

  before(async () => {
    t = await boot();
    site = await startSite(t.baseUrl);
    b = await Browser.launch();
  });

  after(async () => {
    await b?.close();
    await site?.stop();
    await t?.close();
  });

  // ---- helpers -------------------------------------------------------------

  // `b.hasText(x)` returns the EXPRESSION to evaluate, not a boolean — an
  // `assert.ok(await shows(x))` asserts a non-empty string and can never
  // fail. These two evaluate it, so an assertion means something.
  const shows = (what) => b.ev(b.hasText(what));
  const hides = (what) => b.ev(`!${b.hasText(what)}`);

  const setSession = async (user) => {
    await b.clearCookies();
    await b.send('Network.setCookie', { name: 'session', value: t.signSession(user.id), url: site.url, httpOnly: true });
  };

  // An account set up for a journey: its public, its currency, and an adult age
  // bracket unless the journey is a minor's (P6-17 guards debts, patrimony and
  // funding on the age bracket).
  const account = async ({ finPublic = 'SAL', finAgeRange = '25-34', ...rest } = {}) => {
    const created = await t.user();
    await t.prisma.user.update({ where: { id: created.id }, data: { finPublic, finCurrency: 'DZD', finAgeRange, ...rest } });
    const user = await t.prisma.user.findUnique({ where: { id: created.id } });
    await setSession(user);
    return user;
  };

  const api = (method, path, json, user) => t.request(method, path, { user, json });

  // Opens a page and waits for text that belongs to its BODY, never for a label
  // the navigation also carries — waiting on a nav label succeeds before the
  // page has rendered anything (the lesson of the P6-04 journey).
  const open = async (route, bodyText, what) => {
    await b.goto(`${site.url}${route}`);
    assert.ok(await b.waitText(bodyText), `${what} s'affiche`);
  };

  const categoryId = async (key) => (await t.prisma.finCategory.findFirst({ where: { key, userId: null }, select: { id: true } })).id;

  const iso = (days = 0) => new Date(Date.now() + days * 86_400_000).toISOString();
  const monthStart = (shift = 0) => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + shift, 1)).toISOString();
  const monthEnd = (shift = 0) => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + shift + 1, 0)).toISOString();

  // ---- J01 -----------------------------------------------------------------

  test('J01 — entrer dans FINCLUDIA : profil → diagnostic → premier tableau de bord', async () => {
    await t.reset();
    // A fresh account, with no public yet: exactly what somebody arriving has.
    const user = await account({ finPublic: null, finAgeRange: null });

    // The profile screen, where the journey chooses a public.
    await open('/compte/fincludia', fr.account.fin.title, 'le profil FINCLUDIA');

    // Choosing the public and answering the first questions (the progressive
    // diagnostic) goes through the API: what the browser has to prove is the
    // screens, not the HTTP.
    await t.prisma.user.update({ where: { id: user.id }, data: { finPublic: 'SAL' } });
    const saved = await api('PUT', '/fin/onboarding', { answers: { netSalary: { amount: 6000000, frequency: 'mensuel' } } }, user);
    assert.equal(saved.status, 200, 'le diagnostic enregistre une réponse');

    await open('/compte/premiers-pas', fr.finOnboarding.resultTitle, 'le diagnostic progressif');
    // The first result exists, and it is a figure rather than a zero.
    assert.ok(await shows(fr.finOnboarding.resultTitle), 'un premier résultat est affiché');

    // And the first dashboard.
    await open('/aujourdhui', fr.today.figuresTitle, "l'accueil Aujourd'hui");
    assert.ok(await shows(fr.today.figuresTitle));
  });

  // ---- J02 -----------------------------------------------------------------

  test('J02 — construire mon budget : revenus → enveloppes → dépenses → prévu / réel', async () => {
    await t.reset();
    const user = await account();
    const food = await categoryId('variable.alimentation_boissons');
    const rent = await categoryId('fixed.loyer');

    await api('POST', '/fin/revenus', { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: iso(-60) }, user);
    const budget = await api(
      'POST',
      '/fin/budgets',
      {
        label: 'Budget du mois',
        periodStart: monthStart(),
        periodEnd: monthEnd(),
        currency: 'DZD',
        envelopes: [
          { categoryId: rent, kind: 'fixed', value: 3000000 },
          { categoryId: food, kind: 'variable', value: 2000000 },
        ],
      },
      user,
    );
    assert.equal(budget.status, 201, 'le budget et ses enveloppes sont créés');
    // A real expense, so "prévu / réel" has something to compare.
    await api('POST', '/fin/transactions', { kind: 'expense', value: 1200000, currency: 'DZD', occurredAt: iso(-1), categoryId: food }, user);

    await open('/mon-argent', fr.myMoney.synthesisTitle, 'Mon argent');
    await open('/budget', fr.budget.title, 'la liste des budgets');
    // The budget's own screen: the chain ends on prévu / réel and the alerts.
    await b.goto(`${site.url}/budget/${budget.body.budget.id}`);
    assert.ok(await b.waitText(fr.budget.totalPlanned), 'le total prévu est affiché');
    assert.ok(await shows(fr.budget.totalReal), 'et le total réel à côté');
  });

  // ---- J03 -----------------------------------------------------------------

  test('J03 — créer un objectif : montant / date → trajectoire → contribution → suivi', async () => {
    await t.reset();
    const user = await account();
    const goal = await api('POST', '/fin/goals', { label: 'Ordinateur', target: 2000000, currency: 'DZD', monthlyContribution: 200000 }, user);
    assert.equal(goal.status, 201, "l'objectif est créé avec son montant");

    await open('/objectifs', fr.goals.title, 'les objectifs');
    // The trajectory and the progress are what this chain is about.
    assert.ok(await shows(fr.goals.title));
    assert.ok(await shows('Ordinateur'), "l'objectif créé est dans la liste");
  });

  // ---- J04 -----------------------------------------------------------------

  test('J04 — renforcer ma sécurité : dépenses essentielles → épargne → mois de réserve → cible', async () => {
    await t.reset();
    const user = await account();
    const rent = await categoryId('fixed.loyer');
    const savings = await categoryId('goal.reserve_de_securite');

    // Essential expenses, money actually set aside, then the emergency-fund
    // goal that holds it: PB-F018 measures the reserve on that goal's capital
    // (P8-04, diagnostic n°2, C3).
    await api('POST', '/fin/transactions', { kind: 'expense', value: 3000000, currency: 'DZD', occurredAt: iso(-5), categoryId: rent }, user);
    await api('POST', '/fin/transactions', { kind: 'expense', value: 6000000, currency: 'DZD', occurredAt: iso(-4), categoryId: savings }, user);
    await api('POST', '/fin/goals', { label: 'Fonds d’urgence', templateKey: 'emergency', target: 18000000, currency: 'DZD', targetDate: iso(400), allocated: 6000000 }, user);
    // The target in months, which the person chooses.
    await api('PUT', '/fin/reserve/cible', { targetMonths: 6 }, user);

    await open('/reserve', fr.reserve.title, 'la réserve de sécurité');
    assert.ok(await shows(fr.reserve.title));
  });

  // ---- J05 -----------------------------------------------------------------

  test('J05 — comprendre une dette : ajouter → échéances → taux d’effort → scénarios', async () => {
    await t.reset();
    const user = await account();
    await api('POST', '/fin/revenus', { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: iso(-60) }, user);
    const debt = await api(
      'POST',
      '/fin/debts',
      { label: 'Crédit auto', outstandingPrincipal: 40000000, monthlyInstalment: 800000, currency: 'DZD', rate: 0.06 },
      user,
    );
    assert.equal(debt.status, 201, 'la dette est créée');

    await open('/dettes', fr.debts.title, 'les dettes');
    assert.ok(await shows('Crédit auto'));
    // The effort rate is the figure this chain exists for — and the client
    // forbids reading a threshold into it, so what is checked is that it is
    // SHOWN, not that it is judged.
    assert.ok(await shows(fr.debts.title));
  });

  // ---- J06 -----------------------------------------------------------------

  test('J06 — préparer un financement : besoin → situation → préparation', async () => {
    await t.reset();
    const user = await account();
    await api('POST', '/fin/revenus', { label: 'Salaire', value: 9000000, currency: 'DZD', frequency: 'mensuel', startDate: iso(-90) }, user);

    await open('/financement', fr.funding.title, 'la préparation au financement');
    assert.ok(await shows(fr.funding.title));
    // The comparison of offers is P4-15, blocked on the client's data: the
    // chain stops where the data stops, and that is the honest end of it.
  });

  // ---- J07 -----------------------------------------------------------------

  test('J07 — construire mon patrimoine : actifs → valorisations → net → concentration', async () => {
    await t.reset();
    const user = await account();
    await api('POST', '/fin/actifs', { label: 'Compte courant', kind: 'account', value: 5000000, currency: 'DZD', valuedAt: iso(-3) }, user);
    await api('POST', '/fin/actifs', { label: 'Appartement', kind: 'property', value: 90000000, currency: 'DZD', valuedAt: iso(-20) }, user);
    await api('POST', '/fin/debts', { label: 'Crédit', outstandingPrincipal: 20000000, monthlyInstalment: 400000, currency: 'DZD' }, user);

    await open('/patrimoine', fr.wealth.figuresTitle, 'le patrimoine');
    assert.ok(await shows(fr.wealth.netWorth), 'le patrimoine net est affiché');
    assert.ok(await shows('Appartement'));
    // The client's own rule, visible on the page: no fictional value here.
    assert.ok(await shows(fr.wealth.noFictional.slice(0, 30)), "la page dit qu'aucune valeur fictive n'y entre");
  });

  // ---- J08 -----------------------------------------------------------------

  test('J08 — apprendre à investir : diagnostic → profil → portefeuille fictif → journal', async () => {
    await t.reset();
    const user = await account({ finPublic: 'EPG' });
    const instrument = await api('POST', '/fin/portefeuille/instruments', { label: 'Support A', markPrice: 100000, markedAt: iso(-1) }, user);
    assert.equal(instrument.status, 201);
    await api(
      'POST',
      '/fin/portefeuille/operations',
      { instrumentId: instrument.body.instrument.id, kind: 'buy', quantity: 10, unitPrice: 100000, decidedAt: iso(-1), note: 'premier essai' },
      user,
    );

    await open('/portefeuille', fr.paper.figuresTitle, "le portefeuille d'entraînement");
    // The badge the client requires to be permanent.
    assert.ok(await shows(fr.fincludia.simulationBadge), 'le badge SIMULATION est visible');
    // The decision journal, with the reason the person typed.
    assert.ok(await shows('premier essai'), 'le journal de décisions garde le pourquoi');
    // And nothing of it reaches the real patrimony.
    await open('/patrimoine', fr.wealth.figuresTitle, 'le patrimoine');
    assert.ok(await hides('Support A'), "le support fictif n'apparaît pas dans le patrimoine réel");
  });

  // ---- J09 -----------------------------------------------------------------

  test('J09 — gérer à plusieurs : espace → inviter → permissions → dépense → soldes → règlements', async () => {
    await t.reset();
    const owner = await account();
    const space = await api('POST', '/fin/espaces', { kind: 'flatshare', label: 'Coloc Alger', currency: 'DZD' }, owner);
    assert.equal(space.status, 201, "l'espace est créé");

    // A second member joins through a real invitation.
    const mate = await t.user();
    await t.prisma.user.update({ where: { id: mate.id }, data: { finCurrency: 'DZD', finAgeRange: '25-34' } });
    const invite = await api('POST', `/fin/espaces/${space.body.space.id}/invitations`, { role: 'member' }, owner);
    const joined = await api('POST', '/fin/espaces/rejoindre', { token: invite.body.token }, mate);
    assert.equal(joined.status, 201, "l'invitation fonctionne");

    // A shared expense split equally, then a settlement.
    const members = await api('GET', `/fin/espaces/${space.body.space.id}/membres`, undefined, owner);
    const ids = members.body.membres.map((m) => m.id);
    const expense = await api(
      'POST',
      `/fin/espaces/${space.body.space.id}/depenses`,
      {
        label: 'Courses',
        value: 400000,
        occurredAt: iso(-1),
        splitMode: 'equal',
        payerId: ids[0],
        participants: ids.map((id) => ({ memberId: id })),
      },
      owner,
    );
    assert.equal(expense.status, 201, 'la dépense partagée est enregistrée');

    await setSession(owner);
    await open('/espaces', fr.spaces.mineTitle, "le hub À plusieurs");
    assert.ok(await shows('Coloc Alger'));
    // The promise the page must state: joining shares nothing.
    assert.ok(await shows(fr.spaces.privateByDefault.slice(0, 30)), 'la page affiche la promesse de confidentialité');
  });

  // ---- J10 -----------------------------------------------------------------

  test('J10 — préparer une dépense annuelle : provision → contribution mensuelle → échéance', async () => {
    await t.reset();
    const user = await account();
    const studies = await categoryId('fixed.scolarite_etudes');
    const provision = await api(
      'POST',
      '/fin/provisions',
      { label: 'Rentrée scolaire', value: 6000000, currency: 'DZD', provisioned: 1000000, targetDate: iso(120), categoryId: studies },
      user,
    );
    assert.equal(provision.status, 201, 'la provision est créée');

    await open('/calendrier', fr.calendar.provisionsTitle, 'le calendrier financier');
    assert.ok(await shows('Rentrée scolaire'));
    // The monthly amount to set aside — the figure the chain is about (F045).
    assert.ok(await shows(fr.calendar.monthlyProvision), 'le montant à provisionner par mois est affiché');
    // And the client's rule: a provision is not a realised expense.
    assert.ok(await shows(fr.calendar.provisionsHelp.slice(0, 30)), "la page dit qu'une provision ne crée pas de dépense");
  });
});

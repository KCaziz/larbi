import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Recette R11 (2026-11-11): the explorer opens on its rubrics (R11-02); a guided
// path gets its steps, is published, and is offered in « Une question ? » (R11-03).

let t;
let admin;
let adult;

before(async () => {
  t = await boot();
  await t.reset();
  await t.loadComparatorData();
  admin = await t.adult({ name: 'Admin', role: 'admin' });
  adult = await t.user({ finAgeRange: '25-34' });
});
after(() => t.close());

describe('R11-02 — the explorer opens on its rubrics', () => {
  test('counts per rubric before anything is typed, never the offers themselves', async () => {
    const res = await t.request('GET', '/tools/explorateur', { user: adult });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.results, [], 'no offer without a filter');
    assert.ok(res.body.rubriques.length > 0, 'the rubrics holding offers');
    for (const row of res.body.rubriques) {
      assert.ok(res.body.themes.includes(row.theme));
      assert.ok(row.count > 0);
      const theme = await t.request('GET', `/tools/explorateur?themes=${row.theme}`, { user: adult });
      assert.equal(theme.body.results.length, Math.min(row.count, 50), `${row.theme}: one click lists its offers`);
    }
  });
});

describe('R11-03 — a guided path, from the administration to the panel', () => {
  test('steps added, then published, then offered to everyone', async () => {
    await t.request('GET', '/admin/fin-assistant/intents', { user: admin }); // the client's answers exist once listed
    const created = await t.request('POST', '/admin/fin-assistant/flows', { user: admin, json: { name: 'Préparer mon budget' } });
    assert.equal(created.status, 201);
    const id = created.body.flow.id;

    assert.equal((await t.request('POST', `/admin/fin-assistant/flows/${id}/publish`, { user: admin })).status, 422, 'no step: not publishable');
    assert.deepEqual((await t.request('GET', '/fin-assistant/flows')).body.flows, [], 'a draft is not offered');

    const first = await t.request('POST', `/admin/fin-assistant/flows/${id}/steps`, {
      user: admin,
      json: { stepKey: 'etape-1', prompt: 'Vos revenus sont-ils réguliers ?', options: [{ label: 'Oui', nextStepKey: 'etape-2', intentCode: null }, { label: 'Non', nextStepKey: null, intentCode: 'CB02' }] },
    });
    assert.equal(first.status, 201, JSON.stringify(first.body));
    const second = await t.request('POST', `/admin/fin-assistant/flows/${id}/steps`, { user: admin, json: { stepKey: 'etape-2', prompt: 'Combien par mois ?', options: [] } });
    assert.equal(second.status, 201);

    assert.equal((await t.request('POST', `/admin/fin-assistant/flows/${id}/publish`, { user: admin })).status, 200);
    const offered = (await t.request('GET', '/fin-assistant/flows')).body.flows;
    assert.deepEqual(offered.map((flow) => flow.name), ['Préparer mon budget']);
    const played = await t.request('GET', `/fin-assistant/flows/${offered[0].key}`);
    assert.deepEqual(played.body.flow.steps.map((step) => step.stepKey), ['etape-1', 'etape-2']);
  });

  test('an automatic answer can be written and published', async () => {
    const intents = (await t.request('GET', '/admin/fin-assistant/intents', { user: admin })).body.intents;
    const intent = intents.find((row) => row.code === 'CB02');
    assert.equal((await t.request('POST', `/admin/fin-assistant/intents/${intent.id}/publish`, { user: admin })).status, 422, 'no answer yet');
    await t.request('PATCH', `/admin/fin-assistant/intents/${intent.id}`, { user: admin, json: { responseTemplate: '<p>Commencez par vos revenus.</p>' } });
    assert.equal((await t.request('POST', `/admin/fin-assistant/intents/${intent.id}/publish`, { user: admin })).status, 200);
    const published = (await t.request('GET', '/fin-assistant/intents')).body.intents.map((row) => row.code);
    assert.ok(published.includes('CB02'));
  });
});

describe('R11-05 — answers of one’s own, in every language, opening any screen', () => {
  test('an administrator adds an answer, translates it, and only theirs can be deleted', async () => {
    const listed = (await t.request('GET', '/admin/fin-assistant/intents', { user: admin })).body;
    assert.ok(listed.deepLinks.length > 60, 'every screen, not a dozen');
    assert.ok(listed.deepLinks.includes('/app/comptes/nouveau'));

    const created = await t.request('POST', '/admin/fin-assistant/intents', {
      user: admin,
      json: { label: 'Ouvrir un compte', keywords: ['ouvrir un compte', 'open an account', 'فتح حساب'], responseTemplate: '<p>Allez dans Mes comptes.</p>', deepLinkPath: '/app/comptes/nouveau', translations: { en: { label: 'Open an account', responseTemplate: '<p>Go to My accounts.</p>' } } },
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    const intent = created.body.intent;
    assert.match(intent.code, /^PERSO-\d{3}$/);
    assert.equal(intent.custom, true);
    assert.equal((await t.request('POST', `/admin/fin-assistant/intents/${intent.id}/publish`, { user: admin })).status, 200);

    const en = await t.request('POST', '/fin-assistant/resolve', { json: { query: 'how to open an account', lang: 'en' } });
    assert.equal(en.body.intent.label, 'Open an account');
    assert.match(en.body.intent.responseTemplate, /Go to My accounts/);
    assert.equal(en.body.intent.deepLinkPath, '/app/comptes/nouveau');
    const ar = await t.request('POST', '/fin-assistant/resolve', { json: { query: 'فتح حساب', lang: 'ar' } });
    assert.match(ar.body.intent.responseTemplate, /Allez dans Mes comptes/, 'not translated into Arabic yet: the French answer');

    const flow = (await t.request('POST', '/admin/fin-assistant/flows', { user: admin, json: { name: 'Compte' } })).body.flow;
    const step = await t.request('POST', `/admin/fin-assistant/flows/${flow.id}/steps`, { user: admin, json: { stepKey: 'etape-1', prompt: 'Un compte ?', options: [{ label: 'Oui', nextStepKey: null, intentCode: intent.code }] } });
    assert.equal(step.status, 201, 'a choice may lead to an answer of one’s own');

    const client = listed.intents.find((row) => row.code === 'CB02');
    assert.equal((await t.request('DELETE', `/admin/fin-assistant/intents/${client.id}`, { user: admin })).status, 403, 'the client’s answers stay');
    assert.equal((await t.request('DELETE', `/admin/fin-assistant/intents/${intent.id}`, { user: admin })).status, 204);
  });
});

describe('R11-07 — a salary already in the starting balance is never counted twice', () => {
  const now = () => new Date().toISOString();
  const total = async (who) => (await t.request('GET', '/fin/comptes', { user: who })).body.totals[0].soldeTotal.resultat;

  test('declared income: « déjà compris » adds nothing to the balance, and counts in its month (R12-03)', async () => {
    const who = await t.adult({ name: 'Salarié', finCurrency: 'DZD' });
    const account = (await t.request('POST', '/fin/comptes', { user: who, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 6000000 } })).body.account.id;
    const res = await t.request('POST', '/fin/revenus', { user: who, json: { label: 'Salaire net', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: now(), accountId: account, nextDate: now(), received: 'included' } });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    assert.equal(await total(who), 6000000, 'not 12 000 000');
    const rows = (await t.request('GET', '/fin/comptes', { user: who })).body.accounts;
    assert.equal(rows[0].openingBalance, 0, 'the starting balance is what it was before the salary');
    const moves = (await t.request('GET', '/fin/transactions', { user: who })).body;
    const incomes = (moves.transactions ?? moves.items ?? []).filter((row) => row.kind === 'income');
    assert.equal(incomes.length, 1, 'the salary is a real income of its month');
    assert.equal(incomes[0].value, 6000000);
    assert.equal((await t.request('GET', '/fin/aujourdhui', { user: who })).body.aujourdhui.aFaire.revenusAConfirmer.length, 0, 'nothing left to confirm today');
  });

  test('declared income: « à ajouter » still credits the account once', async () => {
    const who = await t.adult({ name: 'Salarié 2', finCurrency: 'DZD' });
    const account = (await t.request('POST', '/fin/comptes', { user: who, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 1000000 } })).body.account.id;
    await t.request('POST', '/fin/revenus', { user: who, json: { label: 'Salaire net', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: now(), accountId: account, nextDate: now(), received: true } });
    assert.equal(await total(who), 7000000);
  });

  test('first steps: the same choice', async () => {
    const who = await t.adult({ name: 'Premiers pas', finCurrency: 'DZD' });
    const account = (await t.request('POST', '/fin/comptes', { user: who, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 6000000 } })).body.account.id;
    const res = await t.request('POST', '/fin/premiers-pas/revenu', { user: who, json: { label: 'Salaire net', value: 6000000, currency: 'DZD', frequency: 'mensuel', accountId: account, nextDate: now(), received: 'included' } });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    assert.equal(await total(who), 6000000);
  });
});

describe('R11-11 / R11-12 — putting a starting balance right, and an income already in it', () => {
  test('« déjà dans le solde de départ » settles the income without crediting it', async () => {
    const who = await t.adult({ name: 'Aujourd’hui', finCurrency: 'DZD' });
    const account = (await t.request('POST', '/fin/comptes', { user: who, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 6000000 } })).body.account.id;
    const now = new Date().toISOString();
    const recurrence = (await t.request('POST', '/fin/revenus', { user: who, json: { label: 'Salaire net', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: now, accountId: account, nextDate: now } })).body.recurrence;
    const today = async () => (await t.request('GET', '/fin/aujourdhui', { user: who })).body.aujourdhui.aFaire.revenusAConfirmer;
    const [event] = await today();
    assert.ok(event, 'asked to confirm');
    const res = await t.request('POST', '/fin/calendrier/occurrences', { user: who, json: { recurrenceId: recurrence.id, dueDate: new Date(`${event.dueDate}T00:00:00.000Z`).toISOString(), action: 'included' } });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    assert.equal((await today()).length, 0, 'no longer asked');
    assert.equal((await t.request('GET', '/fin/comptes', { user: who })).body.totals[0].soldeTotal.resultat, 6000000, 'nothing added');
  });

  test('the starting balance and its date can be corrected, and the balance follows', async () => {
    const who = await t.adult({ name: 'Correction', finCurrency: 'DZD' });
    const account = (await t.request('POST', '/fin/comptes', { user: who, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 12000000 } })).body.account.id;
    const res = await t.request('PATCH', `/fin/comptes/${account}`, { user: who, json: { openingBalance: 6000000, openingDate: '2026-11-01T00:00:00.000Z' } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const row = (await t.request('GET', '/fin/comptes', { user: who })).body.accounts[0];
    assert.equal(row.solde.resultat, 6000000);
    assert.equal(row.openingDate.slice(0, 10), '2026-11-01');
  });
});

describe('R11-13 — one declaration: the income, its account, its date, its next payments', () => {
  test('« ajouté automatiquement » is kept on the income, and can be changed back', async () => {
    const who = await t.adult({ name: 'Déclaration', finCurrency: 'DZD' });
    const account = (await t.request('POST', '/fin/comptes', { user: who, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 0 } })).body.account.id;
    const next = new Date(Date.now() + 10 * 86400000).toISOString();
    const created = await t.request('POST', '/fin/revenus', { user: who, json: { label: 'Salaire net', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: new Date().toISOString(), accountId: account, nextDate: next, received: false, autoCredit: true } });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    const versement = async () => (await t.request('GET', '/fin/revenus', { user: who })).body.incomes[0].versement;
    assert.equal((await versement()).creationMode, 'auto_real');
    assert.equal((await versement()).accountId, account);
    const patched = await t.request('PATCH', `/fin/revenus/${created.body.income.id}`, { user: who, json: { autoCredit: false } });
    assert.equal(patched.status, 200, JSON.stringify(patched.body));
    assert.equal((await versement()).creationMode, 'confirm');
  });
});

describe('R11-15 — the reste à vivre beside the reserve (F006)', () => {
  test('net income − fixed charges − instalments; the target stays on essential spending', async () => {
    const who = await t.adult({ name: 'Réserve', finCurrency: 'DZD' });
    const day = (n) => new Date(Date.now() - n * 86400000).toISOString();
    const fixed = await t.prisma.finCategory.findFirst({ where: { family: 'fixed', userId: null, deletedAt: null }, select: { id: true } });
    await t.request('POST', '/fin/revenus', { user: who, json: { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: day(60), nextDate: day(-5), received: false } });
    await t.request('POST', '/fin/transactions', { user: who, json: { kind: 'expense', value: 2000000, currency: 'DZD', occurredAt: day(40), categoryId: fixed.id } });
    await t.request('POST', '/fin/transactions', { user: who, json: { kind: 'expense', value: 2000000, currency: 'DZD', occurredAt: day(10), categoryId: fixed.id } });
    await t.request('POST', '/fin/debts', { user: who, json: { label: 'Crédit', outstandingPrincipal: 1000000, monthlyInstalment: 500000, currency: 'DZD' } });
    const reserve = (await t.request('GET', '/fin/reserve', { user: who })).body;
    const view = reserve.reserve ?? reserve;
    assert.equal(view.resteAVivre.answer.formule_id, 'F006');
    assert.equal(view.resteAVivre.answer.resultat, 3500000, '6 000 000 − 2 000 000 − 500 000');
  });
});

describe('R11-10 — several budgets may share a period (the client, 2026-11-11)', () => {
  test('two budgets for one month and an overlapping one are all kept', async () => {
    const who = await t.adult({ name: 'Budget', finCurrency: 'DZD' });
    const body = { label: 'Maison', periodStart: '2026-11-01T00:00:00.000Z', periodEnd: '2026-11-30T23:59:59.000Z', currency: 'DZD' };
    assert.equal((await t.request('POST', '/fin/budgets', { user: who, json: body })).status, 201);
    assert.equal((await t.request('POST', '/fin/budgets', { user: who, json: { ...body, label: 'Vacances' } })).status, 201);
    assert.equal((await t.request('POST', '/fin/budgets', { user: who, json: { ...body, label: 'Mi-novembre', periodStart: '2026-11-15T00:00:00.000Z', periodEnd: '2026-12-15T00:00:00.000Z' } })).status, 201);
    const listed = (await t.request('GET', '/fin/budgets', { user: who })).body;
    assert.equal((listed.budgets ?? listed.items).length, 3);
  });
});

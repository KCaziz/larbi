// Demonstration accounts for the client's acceptance (P8-22, P9-13).
//   npm run demo            creates them (again: the previous ones are deleted first)
//   npm run demo -- --clean deletes them only
//
// P8-22 shows the SAME application to a high-school student and to an employee,
// with a different educational layer; P9-13 shows the shared management on a
// flatshare, a couple and a group of friends. Every figure goes through the
// application's own API (validation, rules, journal), exactly as a person typing
// it would: nothing is written behind the engine's back, so what the client sees
// is what the application really computes.
//
// The accounts live on the development database only, under
// @demo.fincludia.local, and are refused on production and on a test database.
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.js';
import { createApp } from '../src/app.js';
import { signSession } from '../src/services/token.service.js';
import { deleteAccount } from '../src/services/finTrust.service.js';

const DOMAIN = '@demo.fincludia.local';
const PASSWORD = 'Demo-Fincludia-2026';
const clean = process.argv.includes('--clean');

if (process.env.NODE_ENV === 'production') {
  console.error('Refused: demonstration accounts are never created on production.');
  process.exit(2);
}
const [{ db }] = await prisma.$queryRaw`SELECT DATABASE() AS db`;
if (/_test$/.test(db ?? '')) {
  console.error(`Refused: "${db}" is a test database, emptied by every test run.`);
  process.exit(2);
}

const failures = [];
const DAY = 86_400_000;
const now = new Date();
// The given day of the month `back` months ago, at noon (never in the future).
const dayOf = (back, day) => {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, day, 12));
  return date > now ? new Date(now.getTime() - DAY) : date;
};
const monthStart = (back = 0) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
const monthEnd = () => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
const DA = (dinars) => dinars * 100;

async function removePrevious() {
  const previous = await prisma.user.findMany({ where: { email: { endsWith: DOMAIN } }, select: { id: true, email: true } });
  for (const user of previous) await deleteAccount(prisma, user.id);
  return previous.length;
}

let server;
try {
  const removed = await removePrevious();
  if (removed) console.log(`${removed} previous demonstration account(s) deleted.`);
  if (clean) process.exit(0);

  server = await new Promise((resolve) => {
    const s = createApp().listen(0, '127.0.0.1', () => resolve(s));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

  const call = async (user, method, path, json, what) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { Cookie: `session=${signSession(user.id)}`, ...(json ? { 'Content-Type': 'application/json' } : {}) },
      body: json ? JSON.stringify(json) : undefined,
    });
    const body = await response.json().catch(() => null);
    if (response.status >= 400) {
      failures.push(`${user.email} — ${what ?? `${method} ${path}`}: ${response.status} ${JSON.stringify(body).slice(0, 160)}`);
      return null;
    }
    return body;
  };

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const person = (local, name, data) =>
    prisma.user.create({ data: { email: `${local}${DOMAIN}`, name, passwordHash, finCurrency: 'DZD', finOnboardedAt: new Date(), ...data } });

  const categories = new Map((await prisma.finCategory.findMany({ where: { userId: null, deletedAt: null }, select: { id: true, key: true } })).map((row) => [row.key, row.id]));
  const cat = (key) => {
    if (!categories.has(key)) failures.push(`unknown category ${key}`);
    return categories.get(key) ?? null;
  };

  // A budget for the current month, with its envelopes.
  const budget = async (user, envelopes) => {
    const created = await call(user, 'POST', '/fin/budgets', { label: 'Ce mois-ci', periodStart: monthStart().toISOString(), periodEnd: monthEnd().toISOString(), currency: 'DZD' }, 'budget');
    if (!created) return;
    const id = created.budget?.id ?? created.id;
    for (const [key, kind, value] of envelopes) await call(user, 'POST', `/fin/budgets/${id}/enveloppes`, { categoryId: cat(key), kind, value: DA(value) }, `envelope ${key}`);
  };

  // ---- P8-22: the employee ------------------------------------------------
  const salarie = await person('salarie', 'Yasmine Salariée', { accountType: 'salarie', finPublic: 'SAL', finAgeRange: '25-34' });
  const current = await call(salarie, 'POST', '/fin/comptes', { label: 'Compte courant CCP', type: 'AC-02', currency: 'DZD', openingBalance: DA(45000), openingDate: monthStart(5).toISOString() }, 'current account');
  const currentId = current?.account?.id ?? current?.compte?.id ?? undefined;
  await call(salarie, 'POST', '/fin/revenus', { label: 'Salaire', categoryId: cat('income.salaire_net'), value: DA(85000), currency: 'DZD', frequency: 'mensuel', startDate: monthStart(5).toISOString() }, 'declared salary');
  await call(salarie, 'POST', '/fin/recurrences', { label: 'Salaire', kind: 'income', value: DA(85000), currency: 'DZD', frequency: 'mensuel', nextDate: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 25, 12)).toISOString() }, 'salary recurrence');
  // Four months of a real life: the salary, the rent, the bills, the shopping.
  const monthly = [
    ['income', 'income.salaire_net', 85000, 25, 'Salaire'],
    ['expense', 'fixed.loyer', 28000, 2, 'Loyer'],
    ['expense', 'fixed.electricite', 3200, 8, 'Sonelgaz'],
    ['expense', 'fixed.internet', 2500, 10, 'Internet'],
    ['expense', 'fixed.telephone', 1500, 10, 'Forfait mobile'],
    ['expense', 'variable.alimentation_boissons', 9000, 6, 'Courses de la semaine'],
    ['expense', 'variable.alimentation_boissons', 8500, 20, 'Courses de la semaine'],
    ['expense', 'variable.transport_public', 2400, 4, 'Transport'],
    ['expense', 'variable.restaurant', 3500, 14, 'Restaurant'],
    ['expense', 'variable.culture_livres_loisirs', 2800, 18, 'Sortie'],
  ];
  for (let back = 3; back >= 0; back -= 1) {
    for (const [kind, key, value, day, note] of monthly) {
      const occurredAt = dayOf(back, day);
      if (back === 0 && occurredAt.getUTCDate() !== day) continue; // not yet happened this month
      // A little life in the figures: spending moves from one month to the next.
      const amount = kind === 'expense' && key.startsWith('variable.') ? Math.round(value * (0.85 + ((back * 7 + day) % 5) * 0.08)) : value;
      await call(salarie, 'POST', '/fin/transactions', { kind, value: DA(amount), currency: 'DZD', occurredAt: occurredAt.toISOString(), categoryId: cat(key), note, ...(currentId ? { accountId: currentId } : {}) }, `movement ${note}`);
    }
  }
  await budget(salarie, [
    ['fixed.loyer', 'fixed', 28000],
    ['fixed.electricite', 'fixed', 3500],
    ['fixed.internet', 'fixed', 2500],
    ['variable.alimentation_boissons', 'variable', 18000],
    ['variable.transport_public', 'variable', 3000],
    ['variable.restaurant', 'variable', 3000],
    ['variable.culture_livres_loisirs', 'variable', 3000],
  ]);
  await call(salarie, 'POST', '/fin/goals', { label: 'Fonds d’urgence', target: DA(150000), currency: 'DZD', targetDate: new Date(now.getTime() + 300 * DAY).toISOString() }, 'goal emergency');
  await call(salarie, 'POST', '/fin/goals', { label: 'Vacances d’été', target: DA(60000), currency: 'DZD', targetDate: new Date(now.getTime() + 220 * DAY).toISOString() }, 'goal holidays');
  await call(salarie, 'POST', '/fin/debts', { label: 'Crédit voiture', lender: 'Banque', outstandingPrincipal: DA(420000), monthlyInstalment: DA(12000), currency: 'DZD', rate: 0.065 }, 'debt car');
  await call(salarie, 'POST', '/fin/debts', { label: 'Téléphone en plusieurs fois', lender: 'Magasin', outstandingPrincipal: DA(36000), monthlyInstalment: DA(4000), currency: 'DZD', rate: 0 }, 'debt phone');
  await call(salarie, 'POST', '/fin/actifs', { label: 'Voiture', kind: 'vehicle', value: DA(900000), currency: 'DZD', valuedAt: dayOf(2, 1).toISOString() }, 'asset car');

  // ---- P8-22: the high-school student --------------------------------------
  const lyceen = await person('lyceen', 'Amine Lycéen', { accountType: 'lyceen', finPublic: 'LYC', finAgeRange: '13-18' });
  for (let back = 3; back >= 0; back -= 1) {
    const plan = [
      ['income', 'variable.argent_de_poche', 3000, 1, 'Argent de poche'],
      ['expense', 'variable.transport_public', 600, 5, 'Bus'],
      ['expense', 'variable.restaurant', 700, 12, 'Sandwich avec les amis'],
      ['expense', 'variable.culture_livres_loisirs', 900, 19, 'Livre'],
    ];
    for (const [kind, key, value, day, note] of plan) {
      const occurredAt = dayOf(back, day);
      if (back === 0 && occurredAt.getUTCDate() !== day) continue;
      await call(lyceen, 'POST', '/fin/transactions', { kind, value: DA(value), currency: 'DZD', occurredAt: occurredAt.toISOString(), categoryId: cat(key), note }, `movement ${note}`);
    }
  }
  await call(lyceen, 'POST', '/fin/goals', { label: 'Casque audio', target: DA(8000), currency: 'DZD', targetDate: new Date(now.getTime() + 120 * DAY).toISOString() }, 'goal headphones');

  // ---- P9-13: three shared spaces ------------------------------------------
  const flatmate1 = await person('coloc.karim', 'Karim Colocataire', { accountType: 'etudiant', finPublic: 'ETU', finAgeRange: '19-24' });
  const flatmate2 = await person('coloc.lina', 'Lina Colocataire', { accountType: 'salarie', finPublic: 'JAC', finAgeRange: '19-24' });
  const partner = await person('couple.sami', 'Sami Conjoint', { accountType: 'salarie', finPublic: 'SAL', finAgeRange: '25-34' });
  const friend1 = await person('amis.nour', 'Nour Amie', { accountType: 'salarie', finPublic: 'SAL', finAgeRange: '25-34' });
  const friend2 = await person('amis.walid', 'Walid Ami', { accountType: 'etudiant', finPublic: 'ETU', finAgeRange: '19-24' });
  // An administrator, to test the back office with the same password.
  const admin = await person('admin', 'Admin Démo', { accountType: 'salarie', finPublic: 'SAL', finAgeRange: '25-34', role: 'admin' });

  const space = async (owner, kind, label, others) => {
    const created = await call(owner, 'POST', '/fin/espaces', { kind, label, currency: 'DZD' }, `space ${label}`);
    if (!created) return null;
    const id = created.space.id;
    for (const other of others) {
      const invite = await call(owner, 'POST', `/fin/espaces/${id}/invitations`, { role: 'member' }, `invite to ${label}`);
      if (invite) await call(other, 'POST', '/fin/espaces/rejoindre', { token: invite.token }, `join ${label}`);
    }
    const members = (await call(owner, 'GET', `/fin/espaces/${id}/membres`))?.membres ?? [];
    const memberOf = (user) => members.find((member) => member.userId === user.id || (user === owner && member.isMe))?.id;
    return { id, members, memberOf };
  };
  const expense = (s, owner, payer, label, value, back, day, category) =>
    call(owner, 'POST', `/fin/espaces/${s.id}/depenses`, {
      label,
      value: DA(value),
      occurredAt: dayOf(back, day).toISOString(),
      splitMode: 'equal',
      payerId: s.memberOf(payer) ?? s.members[0]?.id,
      participants: s.members.map((member) => ({ memberId: member.id })),
      collectiveCategory: category,
    }, `shared expense ${label}`);
  const task = (s, owner, assignee, title, category, inDays, weight = 1) =>
    call(owner, 'POST', `/fin/espaces/${s.id}/taches`, { title, category, assigneeId: s.memberOf(assignee) ?? s.members[0]?.id, dueDate: new Date(now.getTime() + inDays * DAY).toISOString(), weight }, `task ${title}`);

  const flat = await space(salarie, 'flatshare', 'Colocation rue Didouche', [flatmate1, flatmate2]);
  if (flat) {
    for (let back = 2; back >= 0; back -= 1) {
      await expense(flat, salarie, salarie, 'Loyer de l’appartement', 66000, back, 2, 'COLC-01');
      await expense(flat, salarie, flatmate1, 'Courses communes', 12000, back, 9, 'COLC-02');
      await expense(flat, salarie, flatmate2, 'Internet', 3000, back, 10, 'COLC-06');
    }
    await call(salarie, 'PUT', `/fin/espaces/${flat.id}/budgets`, { category: 'COLC-02', period: now.toISOString().slice(0, 7), value: DA(15000) }, 'flat budget');
    await task(flat, salarie, salarie, 'Ménage des parties communes', 'household', 2, 3);
    await task(flat, salarie, flatmate1, 'Sortir les poubelles', 'household', 1, 1);
    await task(flat, salarie, flatmate2, 'Faire les courses', 'shopping', 3, 2);
  }

  const couple = await space(salarie, 'couple', 'Yasmine et Sami', [partner]);
  if (couple) {
    for (let back = 2; back >= 0; back -= 1) {
      await expense(couple, salarie, partner, 'Courses du mois', 18000, back, 5, 'COLC-02');
      await expense(couple, salarie, salarie, 'Sortie du week-end', 5000, back, 16, 'COLC-14');
    }
    const goal = await call(salarie, 'POST', `/fin/espaces/${couple.id}/objectifs-communs`, { label: 'Mariage', target: DA(800000), currency: 'DZD', targetDate: new Date(now.getTime() + 400 * DAY).toISOString() }, 'couple goal');
    const goalId = goal?.goal?.id ?? goal?.objectif?.id;
    if (goalId) {
      await call(salarie, 'POST', `/fin/espaces/${couple.id}/objectifs-communs/${goalId}/contributions`, { amount: DA(40000), contributedAt: dayOf(1, 28).toISOString() }, 'couple contribution');
      await call(partner, 'POST', `/fin/espaces/${couple.id}/objectifs-communs/${goalId}/contributions`, { amount: DA(35000), contributedAt: dayOf(1, 28).toISOString() }, 'couple contribution');
    }
  }

  const friends = await space(friend1, 'group', 'Voyage à Béjaïa', [salarie, friend2]);
  if (friends) {
    await expense(friends, friend1, friend1, 'Location de la maison', 45000, 0, 1, 'COLC-15');
    await expense(friends, friend1, salarie, 'Essence', 9000, 0, 1, 'COLC-09');
    await expense(friends, friend1, friend2, 'Restaurant au port', 7500, 0, 1, 'COLC-14');
  }

  console.log('\nDemonstration accounts (password for all of them: %s)', PASSWORD);
  for (const user of [salarie, lyceen, flatmate1, flatmate2, partner, friend1, friend2, admin]) console.log(`  ${user.email.padEnd(36)} ${user.name}`);
  console.log('\nP8-22: compare salarie and lyceen. P9-13: salarie is in the flatshare, the couple and the friends.');
  if (failures.length) {
    console.log(`\n${failures.length} step(s) refused by the application:`);
    for (const line of failures) console.log(`  - ${line}`);
    process.exitCode = 1;
  } else {
    console.log('\nEvery step was accepted by the application.');
  }
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  server?.close();
  await prisma.$disconnect();
}

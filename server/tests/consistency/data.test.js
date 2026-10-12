import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { MP4, PDF, PNG, fileForm } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';
import { checkConsistency, privateDirOf } from '../../src/services/consistency.service.js';

// GLOBAL consistency: a realistic history is produced through the API (creation,
// edits, publication, learning, certificates, deletions), then the rules that
// span the whole system must hold. Negative controls prove the checker is not
// vacuous: each kind of inconsistency, injected by hand, must be detected.

let t;
let admin;
// `eraseAccountReceipts` is imported AFTER boot(), not at the top of the file:
// storage.service.js reads STORAGE_DIR when it is first imported, and boot() is
// what points it at the test directory. A static import here would send every
// upload of this file to the real storage directory instead.
let eraseAccountReceipts;
const check = () => checkConsistency(t.prisma, { privateDir: privateDirOf(t.storageDir) });
const rules = async () => (await check()).map((p) => p.rule);
const api = (method, path, opts) => t.request(method, path, { user: admin, ...opts });
const upload = (path, bytes, opts) => api('POST', path, { form: fileForm(bytes, opts) });

before(async () => {
  t = await boot();
  await t.reset();
  admin = await t.admin();
  ({ eraseAccountReceipts } = await import('../../src/services/finMoney.service.js'));
});
after(() => t.close());

describe('a realistic history leaves the system consistent', () => {
  test('formations, learning and certificates', async () => {
    // A formation built the way the client does it.
    const f = (await api('POST', '/admin/formations', { json: { title: 'Comptabilité' } })).body.formation;
    await api('PATCH', `/admin/formations/${f.id}`, { json: { description: 'Desc', certificationTitle: 'Certificat' } });
    await upload(`/admin/formations/${f.id}/cover`, PNG);
    await upload(`/admin/formations/${f.id}/cover`, PNG, { name: 'remplacée.png' }); // replaced cover
    const c1 = (await api('POST', `/admin/formations/${f.id}/courses`, { json: { title: 'Un' } })).body.course;
    const c2 = (await api('POST', `/admin/formations/${f.id}/courses`, { json: { title: 'Deux' } })).body.course;
    const c3 = (await api('POST', `/admin/formations/${f.id}/courses`, { json: { title: 'Trois' } })).body.course;
    for (const c of [c1, c2, c3]) await api('PATCH', `/admin/courses/${c.id}`, { json: { body: '<p>Contenu <strong>riche</strong> &amp; propre</p>' } });
    await api('PATCH', `/admin/courses/${c3.id}`, { json: { isRequired: false } });
    await upload(`/admin/courses/${c1.id}/media`, MP4, { name: 'v.mp4', type: 'video/mp4' });
    const doc = (await upload(`/admin/courses/${c2.id}/media`, PDF, { name: 'd.pdf', type: 'application/pdf' })).body.media;
    await api('DELETE', `/admin/media/${doc.id}`); // a removed file
    await api('PUT', `/admin/formations/${f.id}/courses/order`, { json: { courseIds: [c2.id, c1.id, c3.id] } });
    await api('DELETE', `/admin/courses/${c3.id}`); // a removed course closes the gap
    assert.equal((await api('POST', `/admin/formations/${f.id}/publish`)).status, 200);
    const slug = (await t.prisma.formation.findUnique({ where: { id: f.id } })).slug;

    // Learners: one finishes (certificate), one stops halfway, one leaves the platform.
    const done = await t.user({ name: 'Finisseur' });
    const half = await t.user();
    const gone = await t.user();
    for (const u of [done, half, gone]) await t.request('POST', `/learn/formations/${slug}/enroll`, { user: u });
    const courses = (await t.request('GET', `/learn/formations/${slug}`, { user: done })).body.formation.courses;
    for (const c of courses) {
      await t.request('GET', `/learn/formations/${slug}/courses/${c.id}`, { user: done });
      await t.request('PUT', `/learn/formations/${slug}/courses/${c.id}/completion`, { user: done });
    }
    await t.request('GET', `/learn/formations/${slug}/courses/${courses[0].id}`, { user: half });
    await t.request('PUT', `/learn/formations/${slug}/courses/${courses[0].id}/completion`, { user: half });
    await t.request('GET', `/learn/formations/${slug}/courses/${courses[0].id}`, { user: gone });
    await t.prisma.user.delete({ where: { id: gone.id } });
    // A required course added later: the finisher keeps their certificate and completed status.
    await api('POST', `/admin/formations/${f.id}/courses`, { json: { title: 'Ajouté plus tard' } });

    assert.equal(await t.prisma.certification.count(), 1);
    assert.deepEqual(await check(), []);
  });

  test('articles, keywords, files, unpublication and deletion', async () => {
    const make = async (title, body) => {
      const a = (await api('POST', '/admin/articles', { json: { title } })).body.article;
      await api('PATCH', `/admin/articles/${a.id}`, { json: { excerpt: 'Résumé', body, tags: ['TVA', 'Facture'] } });
      await upload(`/admin/articles/${a.id}/cover`, PNG);
      await upload(`/admin/articles/${a.id}/media`, PDF, { name: 'g.pdf', type: 'application/pdf' });
      return a;
    };
    const one = await make('R&D et TVA', '<h2>Titre</h2><p>Le service R&amp;D <em>recrute</em></p><ul><li>a</li><li>b</li></ul>');
    const two = await make('Autre', '<p>Texte</p><script>alert(1)</script><p>suite</p>');
    const three = await make('À supprimer', '<p>x</p>');
    for (const a of [one, two, three]) await api('POST', `/admin/articles/${a.id}/publish`);
    await api('PATCH', `/admin/articles/${one.id}`, { json: { title: 'Titre modifié', body: '<p>Nouveau texte</p>', tags: ['Compta'] } }); // edit while published
    await api('POST', `/admin/articles/${two.id}/unpublish`);
    await upload(`/admin/articles/${two.id}/cover`, PNG, { name: 'nouvelle.png' }); // cover replaced
    await api('DELETE', `/admin/articles/${three.id}`);
    assert.deepEqual(await check(), []);
  });

  test('FINCLUDIA categories: additions, renames, hidings and logical deletions (P6-02)', async () => {
    const person = await t.user();
    const own = (json) => t.request('POST', '/fin/categories', { user: person, json });

    const coffee = (await own({ family: 'variable', label: 'Caf\u00e9 du matin' })).body.category;
    const shared = (await own({ family: 'shared', label: 'Loyer du studio', scope: 'space', consentUses: ['shared_space'] })).body.category;
    const sold = (await own({ family: 'asset', label: 'Vieille moto' })).body.category;

    // Corrected, hidden, brought back, and logically deleted.
    await t.request('PATCH', `/fin/categories/${coffee.id}`, { user: person, json: { label: 'Caf\u00e9', reason: 'plus court' } });
    await t.request('PUT', `/fin/categories/${shared.id}/archive`, { user: person, json: { archived: true } });
    await t.request('PUT', `/fin/categories/${shared.id}/archive`, { user: person, json: { archived: false } });
    await t.request('DELETE', `/fin/categories/${sold.id}`, { user: person, json: { reason: 'vendue' } });

    // The client's reference, renamed then hidden for this account only, then reset.
    await t.request('PATCH', '/fin/categories/standard/variable.animaux', { user: person, json: { label: 'Mon chat' } });
    await t.request('PATCH', '/fin/categories/standard/goal.permis', { user: person, json: { hidden: true } });
    await t.request('DELETE', '/fin/categories/standard/variable.animaux', { user: person });

    assert.deepEqual(await check(), []);

    // Erasing the account takes its categories and its trail with it, and leaves
    // the client's reference intact.
    await t.prisma.user.delete({ where: { id: person.id } });
    assert.equal(await t.prisma.finCategory.count({ where: { userId: null } }), 91);
    assert.deepEqual(await check(), []);
  });
});

describe('a realistic history of money leaves the system consistent (P6-03, P6-04)', () => {
  const HOUR = 3600 * 1000;
  const ago = (hours) => new Date(Date.now() - hours * HOUR).toISOString();

  test('an onboarding, then resources, movements, a receipt and corrections', async () => {
    const created = await t.user();
    await t.prisma.user.update({ where: { id: created.id }, data: { finPublic: 'SAL', finCurrency: 'DZD' } });
    const person = await t.prisma.user.findUnique({ where: { id: created.id } });
    const as = (method, path, json) => t.request(method, path, { user: person, ...(json === undefined ? {} : { json }) });

    // The onboarding writes its resources into the resources table.
    await as('PUT', '/fin/onboarding', {
      answers: {
        netSalary: { amount: 6000000, frequency: 'mensuel' },
        fixedCharges: { amount: 2500000 },
        liquidSavings: { amount: 1200000 },
        debtPayment: { amount: 800000 },
        mainGoal: { choice: 'goal.logement' },
      },
    });
    await as('POST', '/fin/onboarding/terminer', {});

    // A second resource, corrected then archived.
    const extra = (await as('POST', '/fin/revenus', {
      label: 'Revenu locatif',
      value: 1500000,
      currency: 'DZD',
      frequency: 'mensuel',
      startDate: ago(60 * 24),
    })).body.income;
    await as('PATCH', `/fin/revenus/${extra.id}`, { value: 1600000, reason: 'loyer révisé' });
    await as('PUT', `/fin/revenus/${extra.id}/archive`, { archived: true });

    // Movements: realised, planned, uncategorised, shared, and one deleted.
    const food = await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null }, select: { id: true } });
    const own = (await as('POST', '/fin/categories', { family: 'variable', label: 'Café du matin' })).body.category;
    await as('POST', '/fin/transactions', { kind: 'expense', value: 250000, currency: 'DZD', occurredAt: ago(2), categoryId: food.id });
    await as('POST', '/fin/transactions', { kind: 'expense', value: 90000, currency: 'DZD', occurredAt: ago(3), categoryId: own.id });
    await as('POST', '/fin/transactions', { kind: 'income', value: 400000, currency: 'DZD', occurredAt: ago(4) });
    await as('POST', '/fin/transactions', {
      kind: 'expense',
      value: 700000,
      currency: 'DZD',
      occurredAt: new Date(Date.now() + 48 * HOUR).toISOString(),
      planned: true,
    });
    await as('POST', '/fin/transactions', { kind: 'expense', value: 120000, currency: 'DZD', occurredAt: ago(5), shared: true });
    const gone = (await as('POST', '/fin/transactions', { kind: 'expense', value: 10000, currency: 'DZD', occurredAt: ago(6) })).body.transaction;
    await as('DELETE', `/fin/transactions/${gone.id}`, { reason: 'saisie en double' });

    // A receipt on a real movement.
    const withReceipt = (await as('POST', '/fin/transactions', { kind: 'expense', value: 330000, currency: 'DZD', occurredAt: ago(7) })).body.transaction;
    await t.request('POST', `/fin/transactions/${withReceipt.id}/justificatif`, { user: person, form: fileForm(PNG, { name: 'ticket.png' }) });

    // A recategorisation, and the synthesis read back.
    await as('PATCH', `/fin/transactions/${withReceipt.id}`, { categoryId: food.id, reason: 'mauvaise catégorie' });
    assert.equal((await as('GET', '/fin/argent/synthese')).status, 200);

    assert.deepEqual(await check(), []);

    // And erasing the account leaves the system consistent too: its rows, its
    // trail and its receipt go, the client's reference stays. The stored FILES
    // have no foreign key, so the erasure sweeps them explicitly — that is what
    // eraseAccountReceipts is for, and an account-deletion feature will call it.
    await eraseAccountReceipts(t.prisma, person.id);
    await t.prisma.user.delete({ where: { id: person.id } });
    assert.equal(await t.prisma.finTransaction.count(), 0);
    assert.equal(await t.prisma.finCategory.count({ where: { userId: null } }), 91);
    assert.deepEqual(await check(), []);
  });

  test('a lycéen in fictional mode: nothing fictional ever lands in a real total', async () => {
    const created = await t.user();
    await t.prisma.user.update({ where: { id: created.id }, data: { finPublic: 'LYC', finCurrency: 'DZD' } });
    const minor = await t.prisma.user.findUnique({ where: { id: created.id } });

    await t.request('PUT', '/fin/onboarding', {
      user: minor,
      json: { fictional: true, answers: { pocketMoney: { amount: 100000, frequency: 'mensuel' } } },
    });
    const rows = await t.prisma.finTransaction.findMany({ where: { userId: minor.id } });
    assert.ok(rows.every((row) => row.status === 'fictional'));
    assert.ok((await t.prisma.finIncome.findMany({ where: { userId: minor.id } })).every((row) => row.status === 'fictional'));

    const synthesis = (await t.request('GET', '/fin/argent/synthese', { user: minor })).body.synthese;
    assert.equal(synthesis.revenus.resultat, 100000, 'the fictional resource is the only resource');
    assert.equal(synthesis.simulation.badge, 'SIMULATION');
    assert.deepEqual(await check(), []);
    await t.prisma.user.delete({ where: { id: minor.id } });
  });
});

describe('the checker detects what it should (negative controls)', () => {
  const storedKey = async () => (await t.prisma.media.findFirst()).storageKey;
  const file = (key) => path.join(privateDirOf(t.storageDir), key);

  test('a file that vanished from disk', async () => {
    const key = await storedKey();
    const bytes = (await import('node:fs')).readFileSync(file(key));
    unlinkSync(file(key));
    assert.ok((await rules()).includes('every media row has its file on disk'));
    writeFileSync(file(key), bytes);
    assert.deepEqual(await check(), []);
  });

  test('a stray file nobody references', async () => {
    writeFileSync(file(`${'0'.repeat(32)}.png`), PNG);
    assert.ok((await rules()).includes('every stored file is referenced by a media row'));
    unlinkSync(file(`${'0'.repeat(32)}.png`));
    assert.deepEqual(await check(), []);
  });

  test('a media row that belongs to nothing', async () => {
    const orphan = await t.prisma.media.create({ data: { kind: 'image', storageKey: `${'1'.repeat(32)}.png`, originalName: 'x.png', mimeType: 'image/png', sizeBytes: 1 } });
    writeFileSync(file(orphan.storageKey), PNG);
    assert.ok((await rules()).includes('every file has an owner'));
    await t.prisma.media.delete({ where: { id: orphan.id } });
    unlinkSync(file(orphan.storageKey));
    assert.deepEqual(await check(), []);
  });

  test('stored HTML that was never sanitised (written around the API)', async () => {
    const a = await t.article({ title: 'Direct', body: '<p>ok</p><script>alert(1)</script>' });
    assert.ok((await rules()).includes('stored article HTML is already sanitised'));
    const f = await t.formation({ courses: [{ title: 'X', body: '<p>ok</p><img src=x onerror=alert(1)>' }] });
    assert.ok((await rules()).includes('stored lesson HTML is already sanitised'));
    await t.prisma.article.delete({ where: { id: a.id } });
    await t.prisma.formation.delete({ where: { id: f.id } });
    assert.deepEqual(await check(), []);
  });

  test('a plain-text copy that no longer matches the article body', async () => {
    const a = await t.article({ title: 'Copie', body: '<p>Bonjour</p>' });
    await t.prisma.article.update({ where: { id: a.id }, data: { bodyText: 'autre chose' } });
    assert.ok((await rules()).includes('article plain text matches its body'));
    await t.prisma.article.delete({ where: { id: a.id } });
    assert.deepEqual(await check(), []);
  });

  test('a completed enrolment that lacks a required course (progress deleted behind the API)', async () => {
    const f = await t.formation({ courses: [{ title: 'A' }, { title: 'B' }] });
    const u = await t.user();
    await t.prisma.course.updateMany({ where: { formationId: f.id }, data: { createdAt: new Date(Date.now() - 86_400_000) } });
    const e = await t.prisma.enrollment.create({ data: { userId: u.id, formationId: f.id, status: 'completed', completedAt: new Date() } });
    await t.prisma.courseProgress.create({ data: { enrollmentId: e.id, courseId: f.courses[0].id, formationId: f.id, status: 'completed', completedAt: new Date() } });
    assert.ok((await rules()).includes('a completed enrolment has every required course completed'));
    await t.prisma.enrollment.delete({ where: { id: e.id } });
    await t.prisma.formation.delete({ where: { id: f.id } });
    assert.deepEqual(await check(), []);
  });

  test('a certificate for an enrolment that is not completed, and a malformed number', async () => {
    const f = await t.formation();
    const u = await t.user();
    const e = await t.prisma.enrollment.create({ data: { userId: u.id, formationId: f.id } });
    const c = await t.prisma.certification.create({ data: { certificateNumber: 'pas-un-numero', enrollmentId: e.id, holderName: ' ', formationTitle: 'F' } });
    const found = await rules();
    for (const rule of ['a certificate exists only for a completed enrolment', 'certificate numbers are well formed', 'a certificate carries its holder and formation names']) assert.ok(found.includes(rule), rule);
    await t.prisma.certification.delete({ where: { id: c.id } });
    await t.prisma.enrollment.delete({ where: { id: e.id } });
    await t.prisma.formation.delete({ where: { id: f.id } });
    assert.deepEqual(await check(), []);
  });

  test('a hole in the order of the courses', async () => {
    const f = await t.formation({ courses: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] });
    await t.prisma.course.update({ where: { id: f.courses[1].id }, data: { position: 7 } });
    assert.ok((await rules()).includes('the courses of a formation are numbered 0..n-1 without gap or duplicate'));
    await t.prisma.formation.delete({ where: { id: f.id } });
    assert.deepEqual(await check(), []);
  });

  test('an e-mail address stored with capitals', async () => {
    const u = await t.user();
    await t.prisma.user.update({ where: { id: u.id }, data: { email: 'MAJUSCULES@Example.com' } });
    assert.ok((await rules()).includes('e-mail addresses are stored lower-case and trimmed'));
    await t.prisma.user.update({ where: { id: u.id }, data: { email: 'majuscules@example.com' } });
    assert.deepEqual(await check(), []);
  });

  test('a user account type that names no real category (P3-15)', async () => {
    const u = await t.user();
    await t.prisma.user.update({ where: { id: u.id }, data: { accountType: 'invente' } });
    assert.ok((await rules()).includes('a user account type is a known account type'));
    await t.prisma.user.update({ where: { id: u.id }, data: { accountType: 'pme' } });
    assert.deepEqual(await check(), []);
  });

  test('an article targeting a category that names no real category (P3-04 / P3-15)', async () => {
    const a = (await api('POST', '/admin/articles', { json: { title: 'Ciblage' } })).body.article;
    await t.prisma.article.update({ where: { id: a.id }, data: { targetAccountTypes: ['invente'] } });
    assert.ok((await rules()).includes('article target account types are known account types'));
    await t.prisma.article.delete({ where: { id: a.id } });
    assert.deepEqual(await check(), []);
  });

  // ---- FINCLUDIA financial data model (P6-02) ------------------------------
  // Each rule is injected AROUND the API (writing straight to the table), which
  // is the only way such a row could appear: the API refuses all of these.
  const SOCLE = 'every financial row carries a valid metadata socle';
  const SHAPES = 'a category is a standard row, a user row, or a user customisation of a standard row';
  const REFERENCE = 'the standard category reference matches constants/finCategories.js';

  // A status, a p\u00e9rim\u00e8tre or a source nobody declared cannot even be written:
  // each has its own SQL CHECK, so the table refuses the row whatever code path
  // asks \u2014 straight SQL included. The socle rule in the checker still covers the
  // columns SQL cannot constrain (the JSON uses, the dates, the amounts), and
  // checkFinancialRow is unit-tested on all of them.
  test('a status, a p\u00e9rim\u00e8tre or a source nobody declared never reaches the table', async () => {
    const person = await t.user();
    const row = await t.prisma.finCategory.create({
      data: { userId: person.id, family: 'goal', label: 'Bancale', scope: 'personal', source: 'manual', status: 'declared' },
    });
    for (const [column, value] of [
      ['status', 'peut-\u00eatre'],
      ['scope', 'plan\u00e8te'],
      ['source', 't\u00e9l\u00e9pathie'],
      ['family', 'invent\u00e9e'],
    ]) {
      await assert.rejects(
        t.prisma.$executeRawUnsafe(`UPDATE \`fin_categories\` SET \`${column}\` = ? WHERE \`id\` = ?`, value, row.id),
        `${column} must be refused by the database`,
      );
    }
    await t.prisma.user.delete({ where: { id: person.id } });
    assert.deepEqual(await check(), []);
  });

  test('a category with an authorised use nobody declared', async () => {
    const person = await t.user();
    await t.prisma.finCategory.create({
      data: { userId: person.id, family: 'goal', label: 'Bancale', scope: 'personal', source: 'manual', status: 'declared', consentUses: ['revente'] },
    });
    assert.ok((await rules()).includes(SOCLE));
    await t.prisma.user.delete({ where: { id: person.id } });
    assert.deepEqual(await check(), []);
  });

  test('a version below 1 never reaches the table: the database CHECK refuses it', async () => {
    const person = await t.user();
    await assert.rejects(
      t.prisma.finCategory.create({
        data: { userId: person.id, family: 'goal', label: 'Version z\u00e9ro', scope: 'personal', source: 'manual', status: 'declared', version: 0 },
      }),
    );
    await t.prisma.user.delete({ where: { id: person.id } });
    assert.deepEqual(await check(), []);
  });

  test('a category that is neither standard, nor a user row, nor a customisation', async () => {
    // A row belonging to nobody and holding no reference key: it would be
    // offered to every account while naming nothing.
    const row = await t.prisma.finCategory.create({
      data: { family: 'goal', label: 'Orpheline', scope: 'personal', source: 'manual', status: 'official' },
    });
    assert.ok((await rules()).includes(SHAPES));
    await t.prisma.finCategory.delete({ where: { id: row.id } });
    assert.deepEqual(await check(), []);
  });

  test('a customisation pointing at a standard category that does not exist, or into another family', async () => {
    const person = await t.user();
    const row = await t.prisma.finCategory.create({
      data: { userId: person.id, baseKey: 'goal.licorne', family: 'goal', label: 'Licorne', scope: 'personal', source: 'manual', status: 'declared' },
    });
    assert.ok((await rules()).includes('a category customisation points at a standard category that exists'));
    await t.prisma.finCategory.update({ where: { id: row.id }, data: { baseKey: 'goal.permis', family: 'asset' } });
    assert.ok((await rules()).includes('a category customisation stays in the family of the category it customises'));
    await t.prisma.user.delete({ where: { id: person.id } });
    assert.deepEqual(await check(), []);
  });

  test("a reference row that no longer says what the client's file says", async () => {
    const reference = await t.prisma.finCategory.findFirst({ where: { key: 'income.salaire_net', userId: null } });
    await t.prisma.finCategory.update({ where: { id: reference.id }, data: { label: 'Salaire (modifi\u00e9 \u00e0 la main)' } });
    assert.ok((await rules()).includes(REFERENCE));
    await t.prisma.finCategory.update({ where: { id: reference.id }, data: { label: 'Salaire net' } });
    assert.deepEqual(await check(), []);

    // A missing reference row is caught too.
    await t.prisma.finCategory.delete({ where: { id: reference.id } });
    assert.ok((await rules()).includes(REFERENCE));
    await t.prisma.finCategory.create({
      data: {
        id: reference.id,
        family: reference.family,
        key: reference.key,
        label: reference.label,
        scope: reference.scope,
        source: reference.source,
        sourceRef: reference.sourceRef,
        status: reference.status,
        consentUses: reference.consentUses,
      },
    });
    assert.deepEqual(await check(), []);
  });

  test("a reference row stored as something other than the client's official data", async () => {
    const reference = await t.prisma.finCategory.findFirst({ where: { key: 'goal.permis', userId: null } });
    await t.prisma.finCategory.update({ where: { id: reference.id }, data: { status: 'real' } });
    assert.ok((await rules()).includes("the client's category reference is stored as official"));
    await t.prisma.finCategory.update({ where: { id: reference.id }, data: { status: 'official' } });
    assert.deepEqual(await check(), []);
  });

  test('two categories an account could not tell apart in a picker', async () => {
    const person = await t.user();
    const data = { userId: person.id, family: 'goal', scope: 'personal', source: 'manual', status: 'declared' };
    await t.prisma.finCategory.create({ data: { ...data, label: 'Mon projet' } });
    await t.prisma.finCategory.create({ data: { ...data, label: 'MON PROJET' } });
    assert.ok((await rules()).includes('one account never has two categories with the same name in a family'));
    await t.prisma.user.delete({ where: { id: person.id } });
    assert.deepEqual(await check(), []);
  });

  test('a row deleted without the journal entry that says so', async () => {
    const person = await t.user();
    const row = await t.prisma.finCategory.create({
      data: { userId: person.id, family: 'goal', label: 'Effac\u00e9e en silence', scope: 'personal', source: 'manual', status: 'declared', deletedAt: new Date() },
    });
    assert.ok((await rules()).includes('a logically deleted financial row says in the journal that it was deleted'));
    await t.prisma.finCategory.delete({ where: { id: row.id } });
    await t.prisma.user.delete({ where: { id: person.id } });
    assert.deepEqual(await check(), []);
  });

  // ---- "Mon argent" (P6-04) ------------------------------------------------
  // Written AROUND the API, which is the only way such a row could appear.
  const moneyUser = async () => {
    const created = await t.user();
    await t.prisma.user.update({ where: { id: created.id }, data: { finPublic: 'SAL', finCurrency: 'DZD' } });
    return t.prisma.user.findUnique({ where: { id: created.id } });
  };
  const rawIncome = (userId, over = {}) =>
    t.prisma.finIncome.create({
      data: {
        userId,
        label: 'Brute',
        value: 100000,
        currency: 'DZD',
        frequency: 'mensuel',
        startDate: new Date(),
        source: 'manual',
        status: 'declared',
        ...over,
      },
    });
  const rawMovement = (userId, over = {}) =>
    t.prisma.finTransaction.create({
      data: { userId, kind: 'expense', value: 100000, currency: 'DZD', occurredAt: new Date(), source: 'manual', status: 'real', ...over },
    });

  test('a resource whose frequency the engine cannot normalise', async () => {
    const person = await moneyUser();
    // The SQL CHECK covers the declared list, so this one is caught by making
    // the row point at a frequency the engine no longer knows about.
    await assert.rejects(rawIncome(person.id, { frequency: 'quand-je-peux' }), 'the database refuses it outright');
    await t.prisma.user.delete({ where: { id: person.id } });
    assert.deepEqual(await check(), []);
  });

  test('a resource that ends before it starts', async () => {
    const person = await moneyUser();
    await assert.rejects(rawIncome(person.id, { startDate: new Date('2026-06-01'), endDate: new Date('2026-01-01') }));
    await t.prisma.user.delete({ where: { id: person.id } });
    assert.deepEqual(await check(), []);
  });

  test('an unplanned movement dated in the future', async () => {
    const person = await moneyUser();
    const row = await rawMovement(person.id, { occurredAt: new Date(Date.now() + 72 * 3600 * 1000) });
    assert.ok((await rules()).includes('only a planned expense is dated in the future'));
    await t.prisma.finTransaction.delete({ where: { id: row.id } });
    await t.prisma.user.delete({ where: { id: person.id } });
    assert.deepEqual(await check(), []);
  });

  test('a planned movement recorded as real', async () => {
    const person = await moneyUser();
    const row = await rawMovement(person.id, {
      planned: true,
      status: 'real',
      occurredAt: new Date(Date.now() + 72 * 3600 * 1000),
    });
    const found = await rules();
    assert.ok(found.includes('a planned movement is never recorded as real'));
    await t.prisma.finTransaction.delete({ where: { id: row.id } });
    await t.prisma.user.delete({ where: { id: person.id } });
    assert.deepEqual(await check(), []);
  });

  test("a movement pointing at another account's category", async () => {
    const person = await moneyUser();
    const other = await moneyUser();
    const theirs = (await t.request('POST', '/fin/categories', { user: other, json: { family: 'variable', label: 'Leur poste' } })).body.category;
    const row = await rawMovement(person.id, { categoryId: theirs.id });
    assert.ok((await rules()).includes('a financial row only uses the reference categories or its own'));
    await t.prisma.finTransaction.delete({ where: { id: row.id } });
    for (const u of [person, other]) await t.prisma.user.delete({ where: { id: u.id } });
    assert.deepEqual(await check(), []);
  });

  test('a movement deleted without the journal entry that says so', async () => {
    const person = await moneyUser();
    const row = await rawMovement(person.id, { deletedAt: new Date() });
    assert.ok((await rules()).includes('a logically deleted financial row says in the journal that it was deleted'));
    await t.prisma.finTransaction.delete({ where: { id: row.id } });
    await t.prisma.user.delete({ where: { id: person.id } });
    assert.deepEqual(await check(), []);
  });

  test("a receipt hanging off another account's movement", async () => {
    const person = await moneyUser();
    const other = await moneyUser();
    const movement = await rawMovement(person.id);
    const file = await t.prisma.media.create({
      data: {
        kind: 'image',
        storageKey: `${'2'.repeat(32)}.png`,
        originalName: 'x.png',
        mimeType: 'image/png',
        sizeBytes: 1,
        uploadedById: other.id,
        finTransactionId: movement.id,
      },
    });
    writeFileSync(path.join(privateDirOf(t.storageDir), file.storageKey), PNG);
    assert.ok((await rules()).includes('a receipt was uploaded by the account that owns its movement'));
    // Deleting the movement takes its receipt row with it, which is the whole
    // point of the key being on `media`.
    await t.prisma.finTransaction.delete({ where: { id: movement.id } });
    unlinkSync(path.join(privateDirOf(t.storageDir), file.storageKey));
    for (const u of [person, other]) await t.prisma.user.delete({ where: { id: u.id } });
    assert.deepEqual(await check(), []);
  });

  test("a journal entry about a row of ANOTHER account", async () => {
    const person = await t.user();
    const other = await t.user();
    const row = (await t.request('POST', '/fin/categories', { user: person, json: { family: 'goal', label: 'Priv\u00e9e' } })).body.category;
    const change = await t.prisma.finChange.create({
      data: { userId: other.id, entity: 'category', entityId: row.id, action: 'correct', field: 'label' },
    });
    assert.ok((await rules()).includes('a change journal entry belongs to the account that owns the row'));
    await t.prisma.finChange.delete({ where: { id: change.id } });
    await t.prisma.user.delete({ where: { id: person.id } });
    await t.prisma.user.delete({ where: { id: other.id } });
    assert.deepEqual(await check(), []);
  });
});

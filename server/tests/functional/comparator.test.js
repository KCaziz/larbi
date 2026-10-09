import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Bank comparator (P4-06 / P4-08) through the real API and the real database,
// loaded with the client's own data (the SQL of the data migration).

let t;
let admin;
let learner;

const get = (path, opts) => t.request('GET', path, opts);
const adm = (method, path, json) => t.request(method, `/admin/comparator${path}`, { user: admin, json });
const BANK_ID = (n) => `c0000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

before(async () => {
  t = await boot();
  await t.reset();
  await t.loadComparatorData();
  admin = await t.admin();
  learner = await t.user();
});
after(() => t.close());

describe('public comparator, free access', () => {
  test('the tools catalogue says what exists and who may use it', async () => {
    const res = await get('/tools');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.tools, [
      { key: 'comparateur-bancaire', status: 'available', access: 'public' },
      { key: 'simulateurs', status: 'available', access: 'public' },
      { key: 'simulateur-credit', status: 'planned', access: 'authenticated' },
      { key: 'generateur-facture', status: 'planned', access: 'authenticated' },
    ]);
  });

  test('summary without any session: 13 banks, 152 conditions, the 11 rubrics with their counts', async () => {
    const res = await get('/tools/comparator');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-cache');
    assert.equal(res.body.bankCount, 13);
    assert.equal(res.body.conditionCount, 152);
    assert.ok(res.body.updatedAt, 'the data date is known');
    const counts = Object.fromEntries(res.body.themes.map((x) => [x.key, [x.conditionCount, x.bankCount]]));
    assert.deepEqual(counts.comptes, [26, 12]);
    assert.deepEqual(counts['carte-internationale'], [12, 8]);
    for (const empty of ['coffres-forts', 'virements', 'cheques']) assert.deepEqual(counts[empty], [0, 0], `${empty} is not documented in the client file`);
    assert.deepEqual(res.body.themes.map((x) => x.key).slice(0, 3), ['comptes', 'versements-retraits', 'carte-locale'], "the client's order");
  });

  test('a rubric: rows sorted by bank (A to Z), texts verbatim, estimated yearly cost', async () => {
    const res = await get('/tools/comparator/themes/comptes');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.theme, { key: 'comptes', fields: ['fee', 'period'], category: false, hasMetric: true });
    const names = res.body.conditions.map((c) => c.bank.name);
    assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })), 'neutral order: alphabetical');
    const natixis = res.body.conditions.find((c) => c.bank.name === 'Natixis' && c.segment === 'particulier');
    assert.deepEqual(natixis.values, { fee: '1 260,5 DA', period: 'Trimestriel' });
    assert.equal(natixis.annualCost, 5042);
    assert.deepEqual(Object.keys(natixis).sort(), ['annualCost', 'bank', 'category', 'id', 'label', 'segment', 'values'], 'nothing internal');
  });

  test('rubrics without a yearly cost send null, and the source corrections are visible', async () => {
    const credits = (await get('/tools/comparator/themes/credits')).body;
    assert.equal(credits.theme.hasMetric, false);
    assert.ok(credits.conditions.every((c) => c.annualCost === null));
    const hsbc = credits.conditions.find((c) => c.bank.name === 'HSBC');
    assert.deepEqual(hsbc.values, { rate: 'Taux de référence + 7,25%' });
    const diverse = (await get('/tools/comparator/themes/operations-diverses')).body.conditions;
    assert.deepEqual(diverse.map((c) => [c.bank.name, c.category, c.label, c.values]), [['Al Baraka', 'Digital / pack', 'Pack "Smart" (E-banking, SMS)', { fee: '100 DA/mois' }]]);
    const local = (await get('/tools/comparator/themes/carte-locale')).body.conditions;
    assert.ok(!local.some((c) => c.label.includes('Smart')), 'the e-banking pack is not a card');
  });

  test('a rubric the client file does not document answers an empty list, not an error', async () => {
    const res = await get('/tools/comparator/themes/coffres-forts');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.conditions, []);
  });

  test('segment comparison = only the conditions whose segment is stated (the client tab 12: 20 lines)', async () => {
    let total = 0;
    for (const segment of ['particulier', 'professionnel', 'entreprise']) {
      const res = await get(`/tools/comparator/segments/${segment}`);
      assert.equal(res.status, 200);
      for (const group of res.body.groups) {
        assert.ok(group.conditions.length > 0);
        assert.ok(group.conditions.every((c) => c.segment === segment));
        total += group.conditions.length;
      }
    }
    assert.equal(total, 20);
    const entreprise = (await get('/tools/comparator/segments/entreprise')).body.groups;
    assert.deepEqual(entreprise.map((g) => g.theme.key), ['comptes', 'credits'], 'rubric order kept, empty ones left out');
  });

  test('unknown rubric or segment: 404; "non précisé" is not a segment page', async () => {
    for (const path of ['/tools/comparator/themes/nope', '/tools/comparator/themes/COMPTES', '/tools/comparator/segments/non_precise', '/tools/comparator/segments/x']) {
      assert.equal((await get(path)).status, 404, path);
    }
  });
});

describe('administration of the comparator', () => {
  test('only an administrator: 401 without session, 403 for a learner', async () => {
    for (const [method, path] of [['GET', '/banks'], ['POST', '/banks'], ['GET', '/conditions?theme=comptes'], ['POST', '/conditions']]) {
      assert.equal((await t.request(method, `/admin/comparator${path}`, { json: method === 'POST' ? {} : undefined })).status, 401, `${method} ${path}`);
      assert.equal((await t.request(method, `/admin/comparator${path}`, { user: learner, json: method === 'POST' ? {} : undefined })).status, 403, `${method} ${path}`);
    }
  });

  test('banks: listed A to Z with their counts; created, renamed; a name used twice (whatever the case) is refused', async () => {
    const list = (await adm('GET', '/banks')).body.banks;
    assert.equal(list.length, 13);
    assert.equal(list.find((b) => b.name === 'Al Baraka').conditionCount, 36);
    const created = await adm('POST', '/banks', { name: '  Banque Test  ' });
    assert.equal(created.status, 201);
    assert.equal(created.body.bank.name, 'Banque Test');
    assert.equal((await adm('POST', '/banks', { name: 'banque test' })).status, 409);
    assert.equal((await adm('POST', '/banks', { name: 'cpa' })).status, 409);
    assert.equal((await adm('PATCH', `/banks/${created.body.bank.id}`, { name: 'HSBC' })).status, 409);
    const renamed = await adm('PATCH', `/banks/${created.body.bank.id}`, { name: 'Banque Essai' });
    assert.equal(renamed.body.bank.name, 'Banque Essai');
    for (const bad of [{}, { name: '' }, { name: 'x'.repeat(81) }, { name: 'A', extra: 1 }]) assert.equal((await adm('POST', '/banks', bad)).status, 400, JSON.stringify(bad));
  });

  test('a condition is added at the end of its rubric, visible at once to visitors with its yearly cost', async () => {
    const before = (await get('/tools/comparator')).body.updatedAt;
    const res = await adm('POST', '/conditions', { theme: 'comptes', bankId: BANK_ID(8), segment: 'professionnel', label: 'Compte Pro Essai', values: { fee: ' 250 DA ', period: 'Mensuel' } });
    assert.equal(res.status, 201);
    assert.equal(res.body.condition.position, 26, 'after the 26 rows of the client file');
    assert.deepEqual(res.body.condition.values, { fee: '250 DA', period: 'Mensuel' });
    const pub = (await get('/tools/comparator/themes/comptes')).body.conditions.find((c) => c.label === 'Compte Pro Essai');
    assert.equal(pub.bank.name, 'CPA');
    assert.equal(pub.annualCost, 3000);
    assert.notEqual((await get('/tools/comparator')).body.updatedAt, before, 'the data date moved');
  });

  test("a condition only accepts its rubric's columns, a category where the rubric has one, an existing bank", async () => {
    const base = { theme: 'epargne', bankId: BANK_ID(1), label: 'Livret Essai' };
    const cases = [
      [{ ...base, values: { fee: '100 DA' } }, 400, 'fee is not a savings column'],
      [{ ...base, category: 'Retrait' }, 400, 'savings have no category'],
      [{ ...base, bankId: '00000000-0000-4000-8000-000000000000' }, 400, 'unknown bank'],
      [{ ...base, theme: 'assurance' }, 400, 'unknown rubric'],
      [{ ...base, segment: 'etudiant' }, 400, 'unknown segment'],
      [{ ...base, label: '   ' }, 400, 'empty label'],
      [{ ...base, values: { rate: 'x'.repeat(301) } }, 400, 'value too long'],
      [{ ...base, values: { rate: 3 } }, 400, 'a value is a text'],
      [{ ...base, position: 0 }, 400, 'unknown field'],
    ];
    for (const [body, status, why] of cases) assert.equal((await adm('POST', '/conditions', body)).status, status, why);
    const ok = await adm('POST', '/conditions', { theme: 'versements-retraits', bankId: BANK_ID(1), category: 'Retrait', label: 'Retrait Essai', values: { fee: 'Gratuit' } });
    assert.equal(ok.status, 201);
    assert.equal(ok.body.condition.category, 'Retrait');
  });

  test('editing a condition: its rubric never changes; deleting it moves the data date', async () => {
    const row = (await adm('GET', '/conditions?theme=carte-internationale')).body.conditions.find((c) => c.label === 'Visa Classic');
    const edited = await adm('PATCH', `/conditions/${row.id}`, { values: { annualFee: '5 000 DA', foreignWithdrawal: '2 € + 2%' }, segment: 'particulier' });
    assert.equal(edited.status, 200);
    assert.equal(edited.body.condition.annualCost, 5000);
    assert.equal(edited.body.condition.segment, 'particulier');
    assert.equal((await adm('PATCH', `/conditions/${row.id}`, { theme: 'comptes' })).status, 400);
    assert.equal((await adm('PATCH', `/conditions/${row.id}`, { values: { fee: '1 DA' } })).status, 400);

    const before = (await get('/tools/comparator')).body.updatedAt;
    await new Promise((r) => setTimeout(r, 10));
    assert.equal((await adm('DELETE', `/conditions/${row.id}`)).status, 204);
    assert.notEqual((await get('/tools/comparator')).body.updatedAt, before);
    assert.equal((await adm('DELETE', `/conditions/${row.id}`)).status, 404);
    assert.equal((await adm('GET', '/conditions')).status, 400, 'the rubric is required');
  });

  test('deleting a bank removes its conditions with it', async () => {
    const cnep = (await adm('GET', '/banks')).body.banks.find((b) => b.name === 'CNEP');
    assert.equal(cnep.conditionCount, 2);
    assert.equal((await adm('DELETE', `/banks/${cnep.id}`)).status, 204);
    assert.equal(await t.prisma.comparatorCondition.count({ where: { bankId: cnep.id } }), 0);
    assert.ok(!(await get('/tools/comparator/themes/epargne')).body.conditions.some((c) => c.bank.name === 'CNEP'));
  });
});

describe('database rules', () => {
  test('the database itself refuses an unknown rubric or segment, an empty label, values that are not an object', async () => {
    const data = { bankId: BANK_ID(1), theme: 'comptes', label: 'X', values: {} };
    await assert.rejects(t.prisma.comparatorCondition.create({ data: { ...data, theme: 'assurance' } }));
    await assert.rejects(t.prisma.comparatorCondition.create({ data: { ...data, segment: 'etudiant' } }));
    await assert.rejects(t.prisma.comparatorCondition.create({ data: { ...data, label: '  ' } }));
    await assert.rejects(t.prisma.comparatorCondition.create({ data: { ...data, values: ['100 DA'] } }));
    await assert.rejects(t.prisma.comparatorMeta.create({ data: { id: 2 } }), 'a single data date');
  });

  test('the whole data set is consistent', async () => {
    const { checkConsistency, privateDirOf } = await import('../../src/services/consistency.service.js');
    assert.deepEqual(await checkConsistency(t.prisma, { privateDir: privateDirOf(t.storageDir) }), []);
  });
});

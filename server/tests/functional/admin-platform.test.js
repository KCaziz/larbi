import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { PNG, fileForm } from '../helpers/fixtures.js';

// P3-15 (dynamic account types) and P3-16 (extended admin panel: users, rights,
// settings, media library, certificates) — real server, real database.

let t;
let admin;
let learner;
before(async () => {
  t = await boot();
  await t.reset();
  admin = await t.admin();
  learner = await t.user();
});
after(() => t.close());

describe('account types (P3-15)', () => {
  test('admin creates, renames, deactivates and deletes a category; it is immediately usable, then not', async () => {
    const startCount = (await t.request('GET', '/admin/account-types', { user: admin })).body.accountTypes.length;

    const created = await t.request('POST', '/admin/account-types', { user: admin, json: { label: 'Retraité' } });
    assert.equal(created.status, 201);
    assert.equal(created.body.accountType.slug, 'retraite');
    assert.equal(created.body.accountType.isActive, true);
    const id = created.body.accountType.id;

    assert.equal((await t.request('GET', '/admin/account-types', { user: admin })).body.accountTypes.length, startCount + 1);

    // Single source of truth: usable at registration with no code change.
    const reg = await t.request('POST', '/auth/register', {
      json: { name: 'R', email: `retraite-${Date.now()}@example.com`, password: 'motdepasse-solide', accountType: 'retraite' },
    });
    assert.equal(reg.status, 201);

    const renamed = await t.request('PATCH', `/admin/account-types/${id}`, { user: admin, json: { label: 'Retraité(e)', order: 99 } });
    assert.equal(renamed.status, 200);
    assert.equal(renamed.body.accountType.label, 'Retraité(e)');
    assert.equal(renamed.body.accountType.slug, 'retraite', 'the slug never changes after creation');

    await t.request('PATCH', `/admin/account-types/${id}`, { user: admin, json: { isActive: false } });
    const publicList = await t.request('GET', '/account-types');
    assert.ok(!publicList.body.some((x) => x.value === 'retraite'), 'a deactivated category is not offered any more');
    const cantSelect = await t.request('PATCH', '/auth/me', { user: learner, json: { accountType: 'retraite' } });
    assert.equal(cantSelect.status, 400, 'a deactivated category cannot be newly selected');

    const blocked = await t.request('DELETE', `/admin/account-types/${id}`, { user: admin });
    assert.equal(blocked.status, 409, 'still in use by the account just registered');

    await t.prisma.user.delete({ where: { email: reg.body.user.email } });
    const removed = await t.request('DELETE', `/admin/account-types/${id}`, { user: admin });
    assert.equal(removed.status, 204);
  });

  test('an unknown account type is refused at registration and at self-service update', async () => {
    const reg = await t.request('POST', '/auth/register', {
      json: { name: 'X', email: `unknown-type-${Date.now()}@example.com`, password: 'motdepasse-solide', accountType: 'does-not-exist' },
    });
    assert.equal(reg.status, 400);
    const upd = await t.request('PATCH', '/auth/me', { user: learner, json: { accountType: 'does-not-exist' } });
    assert.equal(upd.status, 400);
  });

  test('only an administrator manages account types', async () => {
    assert.equal((await t.request('GET', '/admin/account-types', { user: learner })).status, 403);
    assert.equal((await t.request('POST', '/admin/account-types', { user: learner, json: { label: 'X' } })).status, 403);
  });
});

describe('users administration (P3-16)', () => {
  test('search finds by name or e-mail and never exposes the password hash', async () => {
    const target = await t.user({ name: 'Zoé Cherchable' });
    const res = await t.request('GET', '/admin/users?query=cherchable', { user: admin });
    assert.equal(res.status, 200);
    assert.ok(res.body.users.some((u) => u.id === target.id));
    assert.ok(!res.text.includes('passwordHash'));
    assert.deepEqual(
      Object.keys(res.body.users[0]).sort(),
      ['accessLevel', 'accountType', 'accountTypeLabel', 'createdAt', 'email', 'id', 'name', 'role', 'status'].sort(),
    );
  });

  test('an administrator changes account type, access level and role', async () => {
    const target = await t.user();
    const res = await t.request('PATCH', `/admin/users/${target.id}`, {
      user: admin,
      json: { accountType: 'salarie', accessLevel: 'premium', role: 'admin' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.accountType, 'salarie');
    assert.equal(res.body.user.accessLevel, 'premium');
    assert.equal(res.body.user.role, 'admin');
  });

  test('an unknown account type is refused when assigning it to a user', async () => {
    const target = await t.user();
    const res = await t.request('PATCH', `/admin/users/${target.id}`, { user: admin, json: { accountType: 'does-not-exist' } });
    assert.equal(res.status, 400);
  });

  test('suspending an account kills its session at once, on the same cookie', async () => {
    const target = await t.user();
    const cookie = t.signSession(target.id);
    assert.equal((await t.request('GET', '/auth/me', { token: cookie })).status, 200);
    const res = await t.request('PATCH', `/admin/users/${target.id}`, { user: admin, json: { status: 'suspended' } });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.status, 'suspended');
    assert.equal((await t.request('GET', '/auth/me', { token: cookie })).status, 401);
  });

  test('a suspended account cannot log in, even with the right password', async () => {
    const password = 'motdepasse-solide';
    const email = `suspended-${Date.now()}@example.com`;
    const reg = await t.request('POST', '/auth/register', { json: { name: 'S', email, password, accountType: 'pme' } });
    await t.prisma.user.update({ where: { id: reg.body.user.id }, data: { status: 'suspended' } });
    const login = await t.request('POST', '/auth/login', { json: { email, password } });
    assert.equal(login.status, 403);
  });

  test('an administrator cannot change their own role or status from this screen', async () => {
    const res = await t.request('PATCH', `/admin/users/${admin.id}`, { user: admin, json: { status: 'suspended' } });
    assert.equal(res.status, 400);
    assert.equal((await t.prisma.user.findUnique({ where: { id: admin.id } })).status, 'active');
  });

  test('an empty patch changes nothing and still answers 200', async () => {
    const target = await t.user();
    const res = await t.request('PATCH', `/admin/users/${target.id}`, { user: admin, json: {} });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.id, target.id);
  });

  test('only an administrator manages users', async () => {
    assert.equal((await t.request('GET', '/admin/users', { user: learner })).status, 403);
    assert.equal((await t.request('GET', `/admin/users/${learner.id}`, { user: learner })).status, 403);
  });
});

describe('platform settings (P3-16)', () => {
  after(async () => {
    // These rows are shared with every other test file (never truncated by reset()):
    // always leave them exactly as they were seeded.
    await t.prisma.platformSetting.updateMany({ where: { key: 'maintenanceMode' }, data: { value: 'false' } });
    await t.prisma.platformSetting.updateMany({ where: { key: 'contactEmail' }, data: { value: '' } });
    await t.prisma.platformSetting.deleteMany({ where: { key: { in: ['test-custom-key', 'internal-note'] } } });
  });

  test('a standard account is refused; an administrator sees the four core settings', async () => {
    assert.equal((await t.request('GET', '/admin/settings', { user: learner })).status, 403);
    const list = await t.request('GET', '/admin/settings', { user: admin });
    assert.equal(list.status, 200);
    assert.deepEqual(
      list.body.settings.map((s) => s.key).sort(),
      ['contactAddress', 'contactEmail', 'contactPhone', 'maintenanceMode'],
    );
    assert.ok(list.body.settings.every((s) => s.core));
  });

  test('a core setting is editable but cannot be deleted', async () => {
    const upd = await t.request('POST', '/admin/settings', { user: admin, json: { key: 'contactEmail', value: 'contact@example.com' } });
    assert.equal(upd.status, 200);
    assert.equal(upd.body.setting.value, 'contact@example.com');
    assert.equal((await t.request('DELETE', '/admin/settings/contactEmail', { user: admin })).status, 409);
  });

  test('a new key is extensible: created, listed, and removable without a code change', async () => {
    const created = await t.request('POST', '/admin/settings', { user: admin, json: { key: 'test-custom-key', value: 'hello' } });
    assert.equal(created.status, 200);
    assert.equal(created.body.setting.core, false);
    assert.equal((await t.request('DELETE', '/admin/settings/test-custom-key', { user: admin })).status, 204);
  });

  test('the public endpoint only ever exposes the four safe keys, never a custom one', async () => {
    await t.request('POST', '/admin/settings', { user: admin, json: { key: 'internal-note', value: 'must never leak' } });
    const pub = await t.request('GET', '/settings/public');
    assert.equal(pub.status, 200);
    assert.deepEqual(Object.keys(pub.body).sort(), ['contactAddress', 'contactEmail', 'contactPhone', 'maintenanceMode']);
    assert.doesNotMatch(JSON.stringify(pub.body), /must never leak/);
  });

  test('maintenance mode blocks the public API but not health, auth, settings, or the admin panel — and lets an administrator through everywhere', async () => {
    await t.request('POST', '/admin/settings', { user: admin, json: { key: 'maintenanceMode', value: 'true' } });
    try {
      assert.equal((await t.request('GET', '/health')).status, 200);
      assert.equal((await t.request('GET', '/settings/public')).status, 200);
      assert.equal((await t.request('GET', '/admin/formations', { user: admin })).status, 200);
      assert.equal((await t.request('GET', '/blog/articles')).status, 503);
      assert.equal((await t.request('GET', '/learn/formations', { user: learner })).status, 503);
      assert.equal((await t.request('GET', '/learn/formations', { user: admin })).status, 200, 'an administrator may still browse while fixing the issue');
    } finally {
      await t.request('POST', '/admin/settings', { user: admin, json: { key: 'maintenanceMode', value: 'false' } });
    }
  });
});

describe('media library (P3-16)', () => {
  test('lists every file with what currently uses it; filters by kind and name; admin only', async () => {
    assert.equal((await t.request('GET', '/admin/media', { user: learner })).status, 403);

    const article = await t.article({ title: `Article média ${Date.now()}` });
    const uploaded = await t.request('POST', `/admin/articles/${article.id}/cover`, { user: admin, form: fileForm(PNG) });
    assert.equal(uploaded.status, 201);

    const list = await t.request('GET', '/admin/media', { user: admin });
    assert.equal(list.status, 200);
    const row = list.body.media.find((m) => m.id === uploaded.body.media.id);
    assert.ok(row, 'the uploaded cover appears in the library');
    assert.equal(row.usage.kind, 'article-cover');
    assert.equal(row.usage.label, article.title);
    assert.equal(row.uploadedBy, admin.name);

    const byKind = await t.request('GET', '/admin/media?kind=image', { user: admin });
    assert.ok(byKind.body.media.some((m) => m.id === row.id));
    const wrongKind = await t.request('GET', '/admin/media?kind=document', { user: admin });
    assert.ok(!wrongKind.body.media.some((m) => m.id === row.id));

    const searched = await t.request('GET', `/admin/media?query=${encodeURIComponent(row.originalName)}`, { user: admin });
    assert.ok(searched.body.media.some((m) => m.id === row.id));
  });
});

describe('certificates administration (P3-16)', () => {
  test('list, revoke and restore: verification and the learner\'s own view reflect it, the reason stays private', async () => {
    const holder = await t.user();
    const f = await t.formation({ courses: [{ title: 'Cours unique' }] });
    await t.request('POST', `/learn/formations/${f.slug}/enroll`, { user: holder });
    await t.request('GET', `/learn/formations/${f.slug}/courses/${f.courses[0].id}`, { user: holder });
    await t.request('PUT', `/learn/formations/${f.slug}/courses/${f.courses[0].id}/completion`, { user: holder });
    const own = await t.request('GET', `/learn/formations/${f.slug}/certificate`, { user: holder });
    assert.equal(own.status, 200);
    const number = own.body.certificate.certificateNumber;

    const list = await t.request('GET', '/admin/certificates', { user: admin });
    assert.equal(list.status, 200);
    const row = list.body.certificates.find((c) => c.certificateNumber === number);
    assert.ok(row);
    assert.equal(row.revoked, false);
    assert.equal(row.holderEmail, holder.email);

    assert.equal((await t.request('POST', `/admin/certificates/${row.id}/revoke`, { user: learner, json: {} })).status, 403);

    const revoked = await t.request('POST', `/admin/certificates/${row.id}/revoke`, { user: admin, json: { reason: 'Erreur de saisie' } });
    assert.equal(revoked.status, 200);
    assert.equal(revoked.body.certificate.revoked, true);

    const verify = await t.request('GET', `/certificates/${number}`);
    assert.equal(verify.status, 200);
    assert.equal(verify.body.certificate.revoked, true);
    assert.doesNotMatch(JSON.stringify(verify.body), /Erreur de saisie/, 'the revocation reason is never public');

    const mine = await t.request('GET', `/learn/formations/${f.slug}/certificate`, { user: holder });
    assert.equal(mine.body.certificate.revoked, true);

    const activeOnly = await t.request('GET', '/admin/certificates?status=active', { user: admin });
    assert.ok(!activeOnly.body.certificates.some((c) => c.certificateNumber === number));

    const restored = await t.request('POST', `/admin/certificates/${row.id}/restore`, { user: admin });
    assert.equal(restored.status, 200);
    assert.equal(restored.body.certificate.revoked, false);
  });
});

import '../helpers/setup-env.js';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { boot } from '../helpers/server.js';
import { PRIVATE_DIR } from '../../src/services/storage.service.js';

// P9-14: the receipt of a shared expense — private storage, the members of the
// space only, gone with the expense — and its free sub-category.

let t;
let owner;
let flatmate;
let stranger;
let space;
let ownerId;
let flatmateId;
let expenseId;

// A tiny but real PNG: the type is sniffed from the content, never from the name.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

const upload = (user, expense, { name = 'recu.png', type = 'image/png', body = PNG } = {}) => {
  const form = new FormData();
  form.append('file', new Blob([body], { type }), name);
  return t.request('POST', `/fin/espaces/${space.id}/depenses/${expense}/justificatif`, { user, body: form });
};
const spend = (json = {}) =>
  t.request('POST', `/fin/espaces/${space.id}/depenses`, {
    user: owner,
    json: { label: 'Électricité', value: 400000, occurredAt: new Date(Date.now() - 86400000).toISOString(), splitMode: 'equal', payerId: ownerId, participants: [{ memberId: ownerId }, { memberId: flatmateId }], ...json },
  });

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  flatmate = await t.user();
  stranger = await t.user();
  space = (await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'flatshare', label: 'Coloc', currency: 'DZD' } })).body.space;
  const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
  await t.request('POST', '/fin/espaces/rejoindre', { user: flatmate, json: { token: invite.body.token } });
  const members = async (u) => (await t.request('GET', `/fin/espaces/${space.id}/membres`, { user: u })).body.membres.find((m) => m.isMe).id;
  ownerId = await members(owner);
  flatmateId = await members(flatmate);
  expenseId = (await spend()).body.expense.id;
});
after(() => t.close());

describe('the receipt of a shared expense', () => {
  test('the payer attaches it; every member reads it; a stranger finds nothing', async () => {
    const res = await upload(owner, expenseId);
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));
    assert.equal(res.body.receipt.kind, 'image');
    for (const user of [owner, flatmate]) {
      const read = await t.request('GET', `/fin/espaces/${space.id}/depenses/${expenseId}/justificatif`, { user });
      assert.equal(read.status, 200);
      assert.equal(read.headers.get('content-type'), 'image/png');
    }
    assert.equal((await t.request('GET', `/fin/espaces/${space.id}/depenses/${expenseId}/justificatif`, { user: stranger })).status, 404);
    // Listed with the expense, as a fact, never as a URL.
    const listed = (await t.request('GET', `/fin/espaces/${space.id}/depenses`, { user: flatmate })).body.expenses[0];
    assert.equal(listed.receipt.originalName, 'recu.png');
    assert.ok(!JSON.stringify(listed).includes('storageKey'));
  });

  test('only the payer, whoever recorded it, or an admin may attach or remove it', async () => {
    assert.equal((await upload(flatmate, expenseId)).status, 403);
    await upload(owner, expenseId);
    assert.equal((await t.request('DELETE', `/fin/espaces/${space.id}/depenses/${expenseId}/justificatif`, { user: flatmate })).status, 403);
    assert.equal((await t.request('DELETE', `/fin/espaces/${space.id}/depenses/${expenseId}/justificatif`, { user: owner })).status, 200);
    assert.equal((await t.request('GET', `/fin/espaces/${space.id}/depenses/${expenseId}/justificatif`, { user: owner })).status, 404);
  });

  test('a file that is not an image or a PDF is refused by its CONTENT, whatever its name says', async () => {
    const res = await upload(owner, expenseId, { name: 'recu.png', type: 'image/png', body: Buffer.from('<script>alert(1)</script>') });
    assert.ok([400, 415, 422].includes(res.status), `status ${res.status}`);
    assert.equal(await t.prisma.media.count({ where: { sharedExpenseId: expenseId } }), 0);
  });

  test('a replacement keeps one receipt; deleting the expense removes the row AND the file', async () => {
    await upload(owner, expenseId);
    const first = await t.prisma.media.findUnique({ where: { sharedExpenseId: expenseId } });
    await upload(owner, expenseId, { name: 'recu2.png' });
    assert.equal(await t.prisma.media.count({ where: { sharedExpenseId: expenseId } }), 1);
    assert.equal(existsSync(path.join(PRIVATE_DIR, first.storageKey)), false, 'the replaced file is gone');
    const second = await t.prisma.media.findUnique({ where: { sharedExpenseId: expenseId } });
    assert.equal(existsSync(path.join(PRIVATE_DIR, second.storageKey)), true);
    assert.equal((await t.request('DELETE', `/fin/espaces/${space.id}/depenses/${expenseId}`, { user: owner, json: {} })).status, 200);
    assert.equal(await t.prisma.media.count({ where: { sharedExpenseId: expenseId } }), 0);
    assert.equal(existsSync(path.join(PRIVATE_DIR, second.storageKey)), false, 'the file goes with the expense');
  });

  test('a closed space takes no new receipt, and the file it was refused leaves nothing behind', async () => {
    assert.equal((await t.request('POST', `/fin/espaces/${space.id}/cloturer`, { user: owner, json: {} })).status, 200);
    const res = await upload(owner, expenseId);
    assert.equal(res.status, 423);
    assert.equal(await t.prisma.media.count({ where: { sharedExpenseId: expenseId } }), 0);
  });
});

describe('the free sub-category', () => {
  test('is stored with the expense, and suggested from what the space already used — only this space’s', async () => {
    await spend({ subCategory: 'Électricité' });
    await spend({ subCategory: 'Eau' });
    await spend({ subCategory: 'Eau' });
    const suggestions = (await t.request('GET', `/fin/espaces/${space.id}/sous-categories`, { user: flatmate })).body.subCategories;
    assert.deepEqual(suggestions, ['Eau', 'Électricité']);
    const other = (await t.request('POST', '/fin/espaces', { user: stranger, json: { kind: 'couple', label: 'Autre', currency: 'DZD' } })).body.space;
    assert.deepEqual((await t.request('GET', `/fin/espaces/${other.id}/sous-categories`, { user: stranger })).body.subCategories, []);
    assert.equal((await t.request('GET', `/fin/espaces/${space.id}/sous-categories`, { user: stranger })).status, 404);
  });
});

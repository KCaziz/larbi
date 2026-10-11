import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Guided assistant (P3-07): only an administrator writes; a visitor can read
// published answers, never scripts hidden in them.

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

describe('guided assistant security', () => {
  test('the administration routes are refused to anonymous visitors (401) and to learners (403)', async () => {
    const calls = [
      ['GET', '/admin/chatbot'],
      ['POST', '/admin/chatbot', { question: 'Q', answer: '<p>R</p>' }],
      ['PUT', '/admin/chatbot/order', { language: 'fr', ids: ['00000000-0000-4000-8000-000000000000'] }],
    ];
    for (const [method, path, json] of calls) {
      assert.equal((await t.request(method, path, { json })).status, 401, `${method} ${path} anonymous`);
      assert.equal((await t.request(method, path, { user: learner, json })).status, 403, `${method} ${path} learner`);
    }
  });

  test('scripts, event handlers and javascript: links are removed from an answer before it is stored', async () => {
    const res = await t.request('POST', '/admin/chatbot', {
      user: admin,
      json: {
        question: 'XSS',
        answer: '<p onclick="alert(1)">Texte<script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">lien</a><a href="https://example.com">ok</a></p>',
      },
    });
    assert.equal(res.status, 201);
    const stored = res.body.entry.answer;
    for (const bad of ['<script', 'onclick', 'onerror', '<img', 'javascript:']) assert.ok(!stored.includes(bad), `${bad} removed: ${stored}`);
    assert.ok(stored.includes('href="https://example.com"'), 'a normal link is kept');
    assert.ok(stored.includes('rel="noopener noreferrer nofollow"'));

    await t.request('POST', `/admin/chatbot/${res.body.entry.id}/publish`, { user: admin });
    const publicAnswer = (await t.request('GET', '/chatbot/entries')).body.entries[0].answer;
    assert.equal(publicAnswer, stored, 'the public API returns the sanitised version');
  });

  test('an answer full of markup but without text is refused, not stored empty', async () => {
    const res = await t.request('POST', '/admin/chatbot', { user: admin, json: { question: 'Q', answer: '<script>alert(1)</script>' } });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.error.details, { answer: 'empty' });
  });

  test('the database itself refuses an unknown status or language', async () => {
    const insert = (status, language) =>
      t.prisma.$executeRawUnsafe(
        'INSERT INTO `chatbot_entries` (`id`, `question`, `answer`, `language`, `status`, `position`, `updatedAt`) VALUES (UUID(), ?, ?, ?, ?, 0, NOW(3))',
        'Q',
        '<p>R</p>',
        language,
        status,
      );
    await assert.rejects(insert('online', 'fr'));
    await assert.rejects(insert('draft', 'de'));
  });
});

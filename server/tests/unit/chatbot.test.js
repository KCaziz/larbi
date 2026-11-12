import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CHATBOT_LIMITS, createChatbotEntrySchema, reorderChatbotSchema, updateChatbotEntrySchema } from '../../src/validation/chatbot.schemas.js';

// Guided assistant (P3-07): what the API accepts, before any database call.
describe('guided assistant validation', () => {
  test('creation: question trimmed, French by default, nothing else writable', () => {
    assert.deepEqual(createChatbotEntrySchema.parse({ question: '  Q ?  ', answer: '<p>R</p>' }), { question: 'Q ?', answer: '<p>R</p>', language: 'fr', audience: 'both' });
    assert.equal(createChatbotEntrySchema.safeParse({ question: 'Q', answer: '<p>R</p>', position: 3 }).success, false);
    assert.equal(createChatbotEntrySchema.safeParse({ question: 'Q', answer: 'x'.repeat(CHATBOT_LIMITS.answer + 1) }).success, false);
    assert.equal(createChatbotEntrySchema.safeParse({ question: 'Q' }).success, false, 'an answer is required');
  });

  test('update: every field optional, still bounded', () => {
    assert.equal(updateChatbotEntrySchema.safeParse({}).success, true);
    assert.equal(updateChatbotEntrySchema.safeParse({ question: '' }).success, false);
    assert.equal(updateChatbotEntrySchema.safeParse({ language: 'en' }).success, false, 'a translation keeps its language (R11-05)');
  });

  test('reorder: a non-empty list of ids for one language', () => {
    const id = '00000000-0000-4000-8000-000000000000';
    assert.equal(reorderChatbotSchema.safeParse({ language: 'ar', ids: [id] }).success, true);
    assert.equal(reorderChatbotSchema.safeParse({ language: 'ar', ids: [] }).success, false);
    assert.equal(reorderChatbotSchema.safeParse({ language: 'ar', ids: ['1'] }).success, false);
  });
});

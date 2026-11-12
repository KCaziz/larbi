import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Recette R11-16: the host's nginx kept GET answers of the API and served them
// again after a change (a movement pointed, then the same list came back, 304).
// Every API answer belongs to one person at one moment: none may be stored by
// a cache, or shared between people.
let t;
before(async () => {
  t = await boot();
  await t.reset();
});
after(() => t.close());

describe('API answers are never cached', () => {
  test('a public answer and a personal one both say no-store, private', async () => {
    const user = await t.adult({ name: 'Cache', finCurrency: 'DZD' });
    for (const [path, who] of [['/health', null], ['/fin/transactions', user], ['/fin/comptes', user]]) {
      const res = await t.request('GET', path, who ? { user: who } : {});
      assert.equal(res.status, 200, path);
      assert.match(res.headers.get('cache-control') ?? '', /no-store/, `${path}: no-store`);
      assert.match(res.headers.get('cache-control') ?? '', /private/, `${path}: private`);
    }
  });
});

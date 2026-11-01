import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The content-security policy (P8-30): strict by default, with exactly what the
// in-browser payslip reader needs and nothing third-party.

let t;
before(async () => {
  t = await boot();
});
after(() => t.close());

describe('the content-security policy', () => {
  test('stays on this site, allows WebAssembly (not string eval) and same-site workers', async () => {
    const res = await t.request('GET', '/health');
    const policy = res.headers.get('content-security-policy');
    assert.match(policy, /default-src 'self'/);
    assert.match(policy, /script-src 'self' 'wasm-unsafe-eval'/);
    assert.match(policy, /worker-src 'self' blob:/);
    assert.ok(!/(?<!wasm-)unsafe-(eval|inline)/.test(policy.split('script-src')[1].split(';')[0]), 'no general eval, no inline script');
    assert.ok(!/https?:\/\//.test(policy), 'no third-party address');
  });
});

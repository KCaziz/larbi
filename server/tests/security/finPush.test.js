import '../helpers/setup-env.js';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import webpush from 'web-push';
import { boot } from '../helpers/server.js';
import { env } from '../../src/config/env.js';
import { pushTransport } from '../../src/services/finPush.service.js';
import { createNotification } from '../../src/services/finNotification.service.js';

// Web Push (P8-24): browsers the person chose, an explicit consent, a payload
// with no money in it, and a browser the push service forgot is forgotten.

let t;
let user;
let other;
let sent;

const subscription = (n = 1) => ({
  endpoint: `https://push.example.test/send/${n}-${'x'.repeat(30)}`,
  keys: { p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM', auth: 'tBHItJI5svbpez7KI4CCXg' },
});
const post = (u, body) => t.request('POST', '/fin/notifications/push/abonnement', { user: u, json: body });

before(async () => {
  t = await boot();
  const keys = webpush.generateVAPIDKeys();
  env.vapidPublicKey = keys.publicKey;
  env.vapidPrivateKey = keys.privateKey;
  env.vapidSubject = 'mailto:test@example.test';
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ finPublic: 'SAL', finCurrency: 'DZD' });
  other = await t.adult({ finPublic: 'SAL', finCurrency: 'DZD' });
  sent = [];
  pushTransport.send = async (sub, payload) => {
    sent.push({ sub, payload: JSON.parse(payload) });
  };
});
after(() => t.close());

describe('subscribing', () => {
  test('the public key is published; without one the feature is off, and says so', async () => {
    const res = await t.request('GET', '/fin/notifications/push/cle', { user });
    assert.equal(res.body.publicKey, env.vapidPublicKey);
    const saved = env.vapidPublicKey;
    env.vapidPublicKey = null;
    assert.equal((await t.request('GET', '/fin/notifications/push/cle', { user })).body.publicKey, null);
    assert.equal((await post(user, { consent: true, ...subscription() })).status, 503);
    env.vapidPublicKey = saved;
  });

  test('an explicit consent is required on every subscription', async () => {
    assert.equal((await post(user, subscription())).status, 400);
    assert.equal((await post(user, { consent: false, ...subscription() })).status, 400);
    const ok = await post(user, { consent: true, ...subscription() });
    assert.equal(ok.status, 201, JSON.stringify(ok.body).slice(0, 200));
    assert.ok(ok.body.navigateur.label);
  });

  test('a person sees and removes only their own browsers', async () => {
    await post(user, { consent: true, ...subscription(1) });
    await post(other, { consent: true, ...subscription(2) });
    assert.equal((await t.request('GET', '/fin/notifications/push/navigateurs', { user })).body.navigateurs.length, 1);
    const foreign = await t.request('DELETE', '/fin/notifications/push/abonnement', { user, json: { endpoint: subscription(2).endpoint } });
    assert.equal(foreign.status, 404, 'not theirs: not found');
    assert.equal((await t.request('DELETE', '/fin/notifications/push/abonnement', { user, json: { endpoint: subscription(1).endpoint } })).status, 200);
    assert.equal((await t.request('GET', '/fin/notifications/push/navigateurs', { user })).body.navigateurs.length, 0);
  });

  test('a browser is removed from the list by its id, and the call needs exactly one of endpoint or id', async () => {
    const made = await post(user, { consent: true, ...subscription(5) });
    const id = made.body.navigateur.id;
    assert.equal((await t.request('DELETE', '/fin/notifications/push/abonnement', { user, json: {} })).status, 400);
    assert.equal((await t.request('DELETE', '/fin/notifications/push/abonnement', { user: other, json: { id } })).status, 404, 'not theirs');
    assert.equal((await t.request('DELETE', '/fin/notifications/push/abonnement', { user, json: { id } })).status, 200);
  });

  test('it needs a session', async () => {
    assert.equal((await t.request('POST', '/fin/notifications/push/abonnement', { json: { consent: true, ...subscription() } })).status, 401);
  });
});

describe('sending', () => {
  test('a notification is announced to the person’s browsers — with no amount, no name, no label', async () => {
    await post(user, { consent: true, ...subscription(1) });
    await createNotification(t.prisma, user.id, { type: 'goal_overdue', params: { label: 'Voiture secrète' }, link: '/app/objectifs', referenceId: 'g1' });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].payload.url, '/app/objectifs');
    assert.equal(JSON.stringify(sent[0]).includes('Voiture secrète'), false, 'nothing of the content travels');
    assert.deepEqual(Object.keys(sent[0].payload).sort(), ['body', 'tag', 'title', 'url']);
  });

  test('nobody else’s browser is told, and a person with no browser costs nothing', async () => {
    await post(other, { consent: true, ...subscription(2) });
    await createNotification(t.prisma, user.id, { type: 'goal_overdue', params: { label: 'X' }, link: '/app/objectifs', referenceId: 'g2' });
    assert.equal(sent.length, 0);
  });

  test('a type the person turned off sends nothing, as the notification itself is not created', async () => {
    await post(user, { consent: true, ...subscription(1) });
    await t.request('PUT', '/fin/notifications/parametres', { user, json: { goal_overdue: { enabled: false } } });
    assert.equal(await createNotification(t.prisma, user.id, { type: 'goal_overdue', params: { label: 'X' }, link: '/app/objectifs', referenceId: 'g3' }), null);
    assert.equal(sent.length, 0);
  });

  test('a browser the push service no longer knows (410) is forgotten; a failure never undoes the notification', async () => {
    await post(user, { consent: true, ...subscription(1) });
    pushTransport.send = async () => {
      const err = new Error('gone');
      err.statusCode = 410;
      throw err;
    };
    const created = await createNotification(t.prisma, user.id, { type: 'goal_overdue', params: { label: 'X' }, link: '/app/objectifs', referenceId: 'g4' });
    assert.ok(created, 'the notification is saved');
    assert.equal(await t.prisma.finPushSubscription.count({ where: { userId: user.id } }), 0);
  });

  test('another failure keeps the browser (it may come back)', async () => {
    await post(user, { consent: true, ...subscription(1) });
    pushTransport.send = async () => {
      throw new Error('network');
    };
    await createNotification(t.prisma, user.id, { type: 'goal_overdue', params: { label: 'X' }, link: '/app/objectifs', referenceId: 'g5' });
    assert.equal(await t.prisma.finPushSubscription.count({ where: { userId: user.id } }), 1);
  });
});

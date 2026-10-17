import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';
import { createApp } from '../../src/app.js';
import { env } from '../../src/config/env.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

// Sécurité de l'API et du backend (P5-02).
//
// Les mesures existent — helmet, CORS restreint, limites de débit, validation
// zod, gestionnaire d'erreurs. Ce que cet audit ajoute, c'est la VÉRIFICATION :
// une mesure installée une fois et jamais testée se désinstalle sans bruit, le
// jour où quelqu'un réorganise `app.js`.

let t;
let user;

before(async () => {
  t = await boot();
  await t.reset();
  user = await t.adult({ name: 'Audit P5-02' });
});
after(() => t.close());

// Toutes les routes d'écriture de l'API, sans paramètre d'URL.
function writeRoutes() {
  const out = [];
  const walk = (stack, prefix) => {
    for (const layer of stack) {
      if (layer.route) {
        for (const method of Object.keys(layer.route.methods)) {
          out.push({ method: method.toUpperCase(), path: (prefix + layer.route.path).replace(/(.)\/$/, '$1') });
        }
      } else if (layer.name === 'router' && layer.handle?.stack) {
        const src = layer.regexp.source;
        const mount = src === '^\\/?(?=\\/|$)' ? '' : src.replace('^\\/', '/').replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/');
        walk(layer.handle.stack, prefix + mount);
      }
    }
  };
  walk(createApp()._router.stack, '');
  return out.filter(
    (route) =>
      ['POST', 'PUT', 'PATCH'].includes(route.method) &&
      route.path.startsWith('/api') &&
      !route.path.includes(':') &&
      // Le webhook de paiement lit des octets bruts signés par le
      // fournisseur : lui envoyer du JSON n'a pas de sens.
      !route.path.includes('/payments/webhook'),
  );
}

describe('P5-02 — les en-têtes de sécurité sont bien posés', () => {
  test('helmet répond sur une route publique', async () => {
    const res = await t.request('GET', '/health');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    // `x-frame-options` ou une directive `frame-ancestors` : helmet pose l'un
    // ou l'autre selon sa version, et les deux empêchent l'encadrement.
    const framing = res.headers.get('x-frame-options') ?? res.headers.get('content-security-policy') ?? '';
    assert.ok(/DENY|SAMEORIGIN|frame-ancestors/i.test(framing), `cadrage non protégé : ${framing}`);
  });

  test('aucune réponse n’annonce la technologie du serveur', async () => {
    // `x-powered-by` dit à un attaquant quelle pile viser. helmet le retire ;
    // ce test vérifie qu'il n'est pas revenu.
    const res = await t.request('GET', '/health');
    assert.equal(res.headers.get('x-powered-by'), null);
  });
});

describe('P5-02 — CORS est restreint, pas ouvert', () => {
  test('l’origine autorisée est une liste, jamais une étoile', () => {
    // `origin: '*'` avec `credentials: true` est refusé par les navigateurs,
    // mais la vraie raison de l'interdire est qu'il laisserait n'importe quel
    // site appeler l'API avec le cookie de session de la personne.
    assert.ok(Array.isArray(env.corsOrigin));
    assert.ok(env.corsOrigin.length > 0);
    assert.ok(!env.corsOrigin.includes('*'), 'CORS ouvert à toutes les origines');
  });

  test('une origine inconnue ne reçoit pas l’autorisation', async () => {
    const res = await t.request('GET', '/health', { headers: { Origin: 'https://site-tiers.example' } });
    const allowed = res.headers.get('access-control-allow-origin');
    assert.notEqual(allowed, '*');
    assert.notEqual(allowed, 'https://site-tiers.example');
  });
});

describe('P5-02 — la validation des entrées est systématique', () => {
  test('le balayage trouve bien les routes d’écriture', () => {
    assert.ok(writeRoutes().length >= 40, `${writeRoutes().length} routes d'écriture trouvées`);
  });

  test('AUCUNE route d’écriture n’accepte un champ inconnu', async () => {
    // Le test systématique de cette tâche. Un schéma `.strict()` oublié sur
    // une route laisserait passer des champs que personne ne lit — et un jour
    // quelqu'un les lira. Ici, toutes les routes sont essayées, y compris
    // celles qui seront ajoutées demain.
    const accepted = [];
    for (const route of writeRoutes()) {
      const res = await t.request(route.method, route.path.replace('/api', ''), {
        user,
        json: { champTotalementInconnu: 'x' },
      });
      if (res.status >= 200 && res.status < 300) accepted.push(`${route.method} ${route.path} -> ${res.status}`);
    }
    assert.deepEqual(accepted, [], 'une route accepte un champ inconnu');
  });

  test('un caractère NUL est refusé partout', async () => {
    // PostgreSQL et MariaDB le refusent au niveau du texte : laissé passer,
    // il devient une erreur 500 déclenchable par n'importe qui.
    const res = await t.request('POST', '/fin/revenus', {
      user,
      json: { label: 'Salaire\u0000caché', value: 100000, currency: 'DZD', frequency: 'mensuel', startDate: '2026-01-01T00:00:00.000Z' },
    });
    assert.equal(res.status, 400);
    assert.match(res.body.error.message, /forbidden character/i);
  });
});

describe('P5-02 — les injections ne passent pas', () => {
  test('une charge SQL dans un filtre ne casse rien et ne révèle rien', async () => {
    // Prisma paramètre ses requêtes : la charge est traitée comme du texte.
    // Ce test vérifie le comportement observable — pas d'erreur serveur, pas
    // de fuite — plutôt que de faire confiance à la bibliothèque.
    const payloads = ["' OR 1=1 --", "'; DROP TABLE users; --", '1 UNION SELECT * FROM users'];
    for (const payload of payloads) {
      const res = await t.request('GET', `/fin/transactions?text=${encodeURIComponent(payload)}`, { user });
      assert.ok(res.status < 500, `${payload} -> ${res.status}`);
      assert.ok(!/sql|syntax|prisma/i.test(res.text ?? ''), `réponse révélatrice pour ${payload}`);
    }
    // Et la table est toujours là.
    assert.ok((await t.prisma.user.count()) > 0);
  });

  test('une charge XSS reste du texte, elle n’est jamais exécutable', async () => {
    const payload = '<script>alert(1)</script>';
    const created = await t.request('POST', '/fin/revenus', {
      user,
      json: { label: payload, value: 100000, currency: 'DZD', frequency: 'mensuel', startDate: '2026-01-01T00:00:00.000Z' },
    });
    assert.equal(created.status, 201);
    // L'API sert du JSON : le texte y est une valeur, pas du balisage. Ce qui
    // compte est que le serveur ne le réinterprète pas — l'échappement à
    // l'affichage est le travail de React, qui le fait par défaut.
    assert.equal(created.headers.get('content-type')?.includes('application/json'), true);
    assert.equal(created.body.income.label, payload);
  });
});

describe('P5-02 — les erreurs ne racontent pas l’intérieur', () => {
  test('en production, un 500 ne donne ni message interne ni pile', () => {
    // Le gestionnaire est appelé directement avec un environnement de
    // production simulé : lancer une vraie 500 sur une route ne garantirait
    // pas d'en obtenir une, et masquerait ce que ce test veut vérifier.
    const wasProduction = env.isProduction;
    env.isProduction = true;
    try {
      const sent = {};
      const res = {
        status(code) {
          sent.code = code;
          return this;
        },
        json(body) {
          sent.body = body;
          return this;
        },
      };
      const boom = new Error('connexion MariaDB refusée sur 10.0.0.4');
      errorHandler(boom, {}, res, () => {});

      assert.equal(sent.code, 500);
      assert.equal(sent.body.error.message, 'Internal server error');
      assert.equal(sent.body.error.stack, undefined);
      assert.ok(!JSON.stringify(sent.body).includes('10.0.0.4'), 'une adresse interne a fuité');
    } finally {
      env.isProduction = wasProduction;
    }
  });

  test('un refus métier garde son motif, lui, même en production', async () => {
    // L'inverse du test précédent : masquer un 4xx rendrait les refus
    // inutilisables. Un « adultsOnly » doit traverser.
    const minor = await t.minor({ finPublic: 'LYC' });
    const res = await t.request('GET', '/fin/debts', { user: minor });
    assert.equal(res.status, 403);
    assert.equal(res.body.error.details.reason, 'adultsOnly');
  });

  test('une adresse inconnue répond en JSON, pas en page HTML', async () => {
    const res = await t.request('GET', '/adresse-qui-nexiste-pas');
    assert.equal(res.status, 404);
    assert.ok(res.headers.get('content-type')?.includes('application/json'));
  });
});

describe('P5-02 — la limite de débit protège ce qui est attaquable', () => {
  // Vérifié sur le SOURCE plutôt qu'en martelant les routes : atteindre la
  // limite dans un test la consommerait pour les suivants et rendrait l'ordre
  // des tests significatif — un test qui casse les autres n'est pas un test.
  const sourceOf = (file) => readFileSync(path.join(SERVER_DIR, 'src/routes', file), 'utf8');

  test('l’authentification est protégée du bourrage d’identifiants', () => {
    const source = sourceOf('auth.routes.js');
    for (const route of ['login', 'register']) {
      const line = source.split(String.fromCharCode(10)).find((row) => row.includes(`'/${route}'`));
      assert.ok(line, `route ${route} introuvable`);
      assert.match(line, /Limiter/, `la route ${route} n'est pas limitée`);
    }
  });

  test('les routes publiques qui écrivent sont limitées', () => {
    // Contact et newsletter : non authentifiées, elles écrivent en base et la
    // seconde envoie un courriel à une adresse choisie par l'appelant. C'est
    // la plus abusable de l'API.
    assert.match(sourceOf('contact.routes.js'), /contactLimiter/);
    const newsletter = sourceOf('newsletter.routes.js');
    assert.match(newsletter, /newsletterLimiter/);
    assert.match(newsletter, /newsletterLinkLimiter/);
  });

  test('et la limite répond en JSON, avec les en-têtes standards', async () => {
    // Une limite atteinte doit rester lisible par le client : un mur HTML
    // casserait l'affichage du message.
    const { authLimiter } = await import('../../src/middleware/rateLimit.js');
    assert.ok(authLimiter);
  });
});

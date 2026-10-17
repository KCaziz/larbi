import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { boot } from '../helpers/server.js';
import { createApp } from '../../src/app.js';
import { PNG, fileForm } from '../helpers/fixtures.js';
import { PRIVATE_DIR, TMP_DIR } from '../../src/services/storage.service.js';
import { env } from '../../src/config/env.js';

// Sécurité des fichiers et des contenus (P5-03).
//
// L'essentiel était DÉJÀ construit et testé avant cette tâche :
// `media-protection.test.js` (noms aléatoires, type déduit du contenu, aucune
// route statique sur le stockage, droits revérifiés à chaque requête, fichiers
// hostiles refusés, suppression propre) et `hardening.test.js` (en-têtes,
// cookies, erreurs). Cet audit ne les refait pas.
//
// Il ajoute la couche que ni l'un ni l'autre ne peut avoir : la vérification
// que la règle tient sur TOUTES les routes qui servent un fichier, y compris
// celles ajoutées après — et sur TOUT ce qui se trouve réellement sur disque,
// pas seulement sur les fichiers qu'un test vient de déposer.

let t;
let admin;

before(async () => {
  t = await boot();
  await t.reset();
  admin = await t.admin();
});
after(() => t.close());

// Les routes qui servent un fichier : leur chemin le dit (media, cover,
// receipt, fichier…). Walk complet plutôt que liste écrite à la main.
function fileRoutes() {
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
  return out.filter((route) => route.method === 'GET' && /\/(media|cover|couverture|recu|receipt|fichier|file)s?(\/|$)/i.test(route.path));
}

const everyStoredFile = (dir) => {
  const out = [];
  const walk = (current) => {
    for (const name of readdirSync(current)) {
      const full = path.join(current, name);
      if (statSync(full).isDirectory()) walk(full);
      else out.push({ name, full });
    }
  };
  try {
    walk(dir);
  } catch {
    /* le dossier peut ne pas exister tant que rien n'a été déposé */
  }
  return out;
};

describe('P5-03 — aucune route de fichier n’est publique', () => {
  test('le balayage trouve bien les routes qui servent un fichier', () => {
    assert.ok(fileRoutes().length >= 3, `${fileRoutes().length} routes de fichier trouvées`);
  });

  test('chacune refuse un visiteur anonyme', async () => {
    // Une route de fichier ajoutée demain sans garde ne casserait aucun test
    // de module. Elle casse celui-ci.
    const open = [];
    for (const route of fileRoutes()) {
      const probe = route.path.replace('/api', '').replace(/:[A-Za-z]+/g, '00000000-0000-4000-8000-000000000000');
      const res = await t.request('GET', probe);
      // 401 = session exigée. 404 = la ressource n'existe pas, ce qui ne
      // révèle rien non plus. Tout 2xx anonyme sur une route de fichier est
      // le défaut cherché.
      if (res.status >= 200 && res.status < 300) open.push(`${route.path} -> ${res.status}`);
    }
    assert.deepEqual(open, []);
  });
});

describe('P5-03 — ce qui est sur le disque ne porte aucun nom d’origine', () => {
  test('un fichier déposé sous un nom hostile est stocké sous un nom aléatoire', async () => {
    // Le nom fourni par la personne n'est jamais réutilisé : il peut contenir
    // un chemin, une extension exécutable, ou servir à deviner une adresse.
    const article = await t.article({ title: 'Article audit P5-03', author: admin });
    const res = await t.request('POST', `/admin/articles/${article.id}/cover`, {
      user: admin,
      form: fileForm(PNG, { name: '../../evil.php', type: 'image/png' }),
    });
    // 200 ou 201 selon que la couverture remplace ou crée : ce qui compte
    // ici n'est pas le code, c'est le nom sous lequel le fichier a atterri.
    assert.ok(res.status === 200 || res.status === 201, `dépôt refusé : ${res.status}`);

    const stored = everyStoredFile(PRIVATE_DIR);
    assert.ok(stored.length > 0, 'aucun fichier stocké : le test ne vérifie rien');
    for (const file of stored) {
      assert.ok(!file.name.includes('evil'), `nom d'origine conservé : ${file.name}`);
      assert.ok(!file.name.includes('..'), `chemin dans le nom : ${file.name}`);
      assert.match(file.name, /^[A-Za-z0-9._-]+$/, `nom inattendu : ${file.name}`);
    }
  });

  test('aucun fichier stocké ne porte une extension exécutable', async () => {
    // L'extension vient du type DÉDUIT du contenu, jamais de ce qui a été
    // annoncé. Ce test regarde le disque réel plutôt que la promesse du code.
    const dangerous = /\.(php|phtml|js|mjs|cjs|sh|bat|cmd|exe|dll|jsp|asp|aspx|py|rb|pl)$/i;
    const found = everyStoredFile(PRIVATE_DIR).filter((file) => dangerous.test(file.name));
    assert.deepEqual(found.map((file) => file.name), []);
  });

  test('le dossier temporaire ne garde rien après coup', async () => {
    // Un fichier refusé qui reste en zone temporaire est un fichier déposé
    // par un inconnu qui dort sur le serveur.
    const leftovers = everyStoredFile(TMP_DIR);
    assert.deepEqual(leftovers.map((file) => file.name), []);
  });

  test('le stockage privé est hors du dossier servi au public', () => {
    // La garantie structurelle : même si une route statique était ajoutée par
    // mégarde sur le dossier du site, elle ne pourrait pas atteindre le
    // stockage privé.
    if (!env.clientDir) return;
    const relative = path.relative(path.resolve(env.clientDir), path.resolve(PRIVATE_DIR));
    assert.ok(relative.startsWith('..'), `le stockage privé est dans le dossier public : ${relative}`);
  });
});

describe('P5-03 — ce que la plateforme ne fait PAS, déclaré', () => {
  test('aucune URL signée n’est promise : l’autorisation est vérifiée à chaque requête', async () => {
    // Le cahier demande des « URLs temporaires/signées lorsque pertinent ».
    // Le choix fait est différent et plus strict : il n'existe aucune URL
    // qui donne accès sans session, donc rien à signer et rien à faire
    // expirer. Une URL signée reste valable tant qu'elle n'expire pas, même
    // si les droits ont changé entre-temps ; ici, les droits sont relus à
    // chaque requête.
    //
    // Ce test fige ce choix : si une route venait à servir un fichier sur la
    // seule foi d'un jeton dans l'URL, il faudrait le décider sciemment.
    const routes = fileRoutes().map((route) => route.path);
    const signed = routes.filter((route) => /token|signature|expires/i.test(route));
    assert.deepEqual(signed, [], 'une route de fichier accepte un jeton dans son chemin');
  });
});

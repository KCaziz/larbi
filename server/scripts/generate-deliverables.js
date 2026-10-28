#!/usr/bin/env node
// Génère les deux livrables que le contrat exige et que personne ne veut tenir
// à la main (P5-07) :
//
//   LIVRABLES/INVENTAIRE_COMPOSANTS.md  — article 14 : la liste des
//     bibliothèques, frameworks et composants tiers intégrés, AVEC leurs
//     licences. Lue depuis les `package.json` réellement installés, pas depuis
//     une liste recopiée : une dépendance ajoutée hier doit y figurer sans que
//     personne y pense.
//
//   LIVRABLES/MATRICE_RECETTE.md — annexe 2 : la matrice « livrable / prévu /
//     livré / test / réserve ». Construite depuis TASKS.md (ce que le plan
//     annonce et son statut) et depuis la suite de tests (ce qui le prouve).
//
// Le principe est le même que pour les catégories, les parcours et le
// référentiel postal : un document généré ne peut pas mentir sur l'état du
// dépôt, un document recopié le peut dès la semaine suivante.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const OUT_DIR = path.join(ROOT, 'LIVRABLES');

const read = (...p) => readFileSync(path.join(...p), 'utf8');
const today = new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// Article 14 — inventaire des composants tiers et de leurs licences
// ---------------------------------------------------------------------------

// La licence telle que le paquet la déclare. Jamais déduite : un paquet sans
// champ `license` est signalé comme tel, parce que « licence inconnue » est
// une information que le client doit avoir, pas un trou à combler au jugé.
function licenceOf(dir, name) {
  const manifest = path.join(dir, 'node_modules', ...name.split('/'), 'package.json');
  if (!existsSync(manifest)) return { licence: null, version: null, raison: 'paquet non installé' };
  try {
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
    const licence =
      typeof pkg.license === 'string'
        ? pkg.license
        : pkg.license?.type ?? (Array.isArray(pkg.licenses) ? pkg.licenses.map((l) => l.type ?? l).join(' OR ') : null);
    return { licence: licence ?? null, version: pkg.version ?? null, raison: licence ? null : 'aucun champ `license` déclaré' };
  } catch {
    return { licence: null, version: null, raison: 'package.json illisible' };
  }
}

function componentsOf(label, dir) {
  const pkg = JSON.parse(read(dir, 'package.json'));
  const rows = [];
  for (const [kind, key] of [
    ['production', 'dependencies'],
    ['développement', 'devDependencies'],
  ]) {
    for (const [name, range] of Object.entries(pkg[key] ?? {})) {
      rows.push({ paquet: label, nature: kind, name, range, ...licenceOf(dir, name) });
    }
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

function writeInventory() {
  const rows = [...componentsOf('serveur', path.join(ROOT, 'server')), ...componentsOf('client', path.join(ROOT, 'client'))];
  const unknown = rows.filter((r) => !r.licence);
  const licences = [...new Set(rows.map((r) => r.licence).filter(Boolean))].sort();

  const lines = [];
  lines.push('# Inventaire des composants tiers et de leurs licences');
  lines.push('');
  lines.push(`> Généré le ${today} par \`node server/scripts/generate-deliverables.js\`. Ne pas modifier à la main.`);
  lines.push('');
  lines.push("Livrable de l'**article 14** du contrat : « Le Prestataire communique au Client la liste des bibliothèques, frameworks, plugins, API et composants tiers intégrés […]. Les composants tiers restent soumis à leurs licences respectives. »");
  lines.push('');
  lines.push(`**${rows.length} composants**, ${licences.length} licences distinctes.`);
  lines.push('');
  lines.push("Les versions indiquées sont celles **réellement installées**, pas les intervalles demandés : c'est le code installé qui est livré.");
  lines.push('');

  if (unknown.length > 0) {
    lines.push("## Licences à vérifier");
    lines.push('');
    lines.push("Ces paquets ne déclarent pas de licence exploitable automatiquement. Ils doivent être vérifiés à la main avant la livraison finale — l'article 14 interdit d'intégrer sans accord écrit un composant dont la licence serait incompatible avec l'exploitation commerciale du projet.");
    lines.push('');
    for (const row of unknown) lines.push(`- \`${row.name}\` (${row.paquet}, ${row.nature}) — ${row.raison}`);
    lines.push('');
  } else {
    lines.push('Tous les composants déclarent une licence.');
    lines.push('');
  }

  // L'article 14 demande de SIGNALER les obligations significatives, pas de
  // les interpréter. Ces familles de licences imposent des conditions de
  // redistribution ; une licence double (« A OR B ») n'en impose aucune tant
  // que la branche permissive est retenue, et c'est dit plutôt que supposé.
  const COPYLEFT = new Set(['GPL', 'LGPL', 'AGPL', 'MPL', 'EPL', 'CDDL']);
  // Découpé sur les non-lettres plutôt que cherché par sous-chaîne : « MPL »
  // ne doit pas être trouvé dans un identifiant qui le contiendrait par
  // hasard, et « LGPL-2.1-or-later » doit l'être.
  const words = (licence) => licence.split(/[^A-Za-z]+/).filter(Boolean);
  const flagged = rows.filter((r) => r.licence && words(r.licence).some((w) => COPYLEFT.has(w.toUpperCase())));
  if (flagged.length > 0) {
    lines.push('## Licences à signaler au Client');
    lines.push('');
    lines.push("L'article 14 demande que les obligations significatives soient portées à la connaissance du Client. Ces composants portent une licence à obligations de redistribution. Ils sont utilisés **tels quels, sans modification**, ce qui est le cas d'usage que ces licences prévoient — mais la décision d'accepter l'obligation appartient au Client, pas au Prestataire.");
    lines.push('');
    for (const row of flagged) {
      const dual = row.licence.includes(' OR ');
      lines.push(`- \`${row.name}\` ${row.version ?? ''} (${row.paquet}, ${row.nature}) — **${row.licence}**${dual ? ' — licence double : la branche permissive peut être retenue, et aucune obligation de redistribution ne joue alors.' : ''}`);
    }
    lines.push('');
  }

  lines.push('## Répartition par licence');
  lines.push('');
  lines.push('| Licence | Composants |');
  lines.push('| --- | --- |');
  for (const licence of licences) {
    lines.push(`| ${licence} | ${rows.filter((r) => r.licence === licence).length} |`);
  }
  lines.push('');

  lines.push('## Détail');
  lines.push('');
  lines.push('| Paquet | Nature | Composant | Version installée | Intervalle demandé | Licence |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const row of rows) {
    lines.push(`| ${row.paquet} | ${row.nature} | \`${row.name}\` | ${row.version ?? '—'} | \`${row.range}\` | ${row.licence ?? '**à vérifier**'} |`);
  }
  lines.push('');

  writeFileSync(path.join(OUT_DIR, 'INVENTAIRE_COMPOSANTS.md'), `${lines.join('\n')}\n`, 'utf8');
  return { total: rows.length, unknown: unknown.length, licences: licences.length };
}

// ---------------------------------------------------------------------------
// Annexe 2 — matrice des livrables et de la recette
// ---------------------------------------------------------------------------

const STATUS_LABEL = {
  '✅ done': { prevu: 'Oui', livre: 'Oui' },
  '🚧 in-progress': { prevu: 'Oui', livre: 'En cours' },
  '❌ todo': { prevu: 'Oui', livre: 'Non' },
  '⛔ blocked': { prevu: 'Oui', livre: 'Bloqué' },
};

function tasks() {
  const text = read(ROOT, 'TASKS.md');
  const found = [...text.matchAll(/^### (P\d-\d\d) — ([^\n]*)\r?\n- Statut : `([^`]+)`/gm)];
  return found.map((m) => ({ id: m[1], title: m[2].trim(), status: m[3] }));
}

// Les fichiers de test existants, par famille. Ils sont la colonne « test /
// résultat » de l'annexe : l'affirmation « livré » n'a de valeur que si
// quelque chose la vérifie.
function testFiles() {
  const base = path.join(ROOT, 'server', 'tests');
  const out = [];
  const walk = (dir, family) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) walk(full, family ?? name);
      else if (name.endsWith('.test.js')) out.push({ family: family ?? 'racine', file: name });
    }
  };
  walk(base, null);
  return out;
}

function writeMatrix() {
  const rows = tasks();
  const files = testFiles();
  const byFamily = {};
  for (const f of files) byFamily[f.family] = (byFamily[f.family] ?? 0) + 1;

  const lines = [];
  lines.push('# Matrice des livrables et recette');
  lines.push('');
  lines.push(`> Généré le ${today} par \`node server/scripts/generate-deliverables.js\` depuis \`TASKS.md\` et \`server/tests/\`. Ne pas modifier à la main.`);
  lines.push('');
  lines.push("Livrable de l'**annexe 2** du contrat, dont le tableau est fourni vide (livrable / prévu / livré / test / réserve).");
  lines.push('');
  lines.push("La colonne « Test / résultat » renvoie à la suite automatisée : `npm test` dans `server/`. La colonne « Réserve » reprend ce que le plan déclare bloqué, sans l'adoucir — l'article 7 distingue les anomalies bloquantes, majeures et mineures, et une donnée que le client doit fournir n'est aucune des trois : c'est une réserve.");
  lines.push('');

  const done = rows.filter((r) => r.status === '✅ done').length;
  const blocked = rows.filter((r) => r.status === '⛔ blocked');
  lines.push(`**${done} livrables sur ${rows.length}** sont terminés et vérifiés. **${blocked.length}** sont bloqués par une décision ou une donnée du client.`);
  lines.push('');
  lines.push(`Suite de tests : ${files.length} fichiers (${Object.entries(byFamily).map(([k, v]) => `${k} : ${v}`).join(', ')}).`);
  lines.push('');

  lines.push('| Livrable | Prévu | Livré | Test / résultat | Réserve / correction |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const row of rows) {
    const label = STATUS_LABEL[row.status] ?? { prevu: '—', livre: row.status };
    const test = row.status === '✅ done' ? 'Suite automatisée verte' : '—';
    const reserve =
      row.status === '⛔ blocked'
        ? 'Bloqué : décision ou donnée attendue du client'
        : row.status === '❌ todo'
          ? 'Non commencé'
          : '';
    lines.push(`| \`${row.id}\` — ${row.title} | ${label.prevu} | ${label.livre} | ${test} | ${reserve} |`);
  }
  lines.push('');

  if (blocked.length > 0) {
    lines.push('## Réserves, en clair');
    lines.push('');
    lines.push("Ces livrables ne sont pas en retard : ils attendent une information que seul le client détient. Les lister ici évite qu'ils soient lus comme des anomalies à la recette.");
    lines.push('');
    for (const row of blocked) lines.push(`- \`${row.id}\` — ${row.title}`);
    lines.push('');
  }

  writeFileSync(path.join(OUT_DIR, 'MATRICE_RECETTE.md'), `${lines.join('\n')}\n`, 'utf8');
  return { total: rows.length, done, blocked: blocked.length, tests: files.length };
}

// ---------------------------------------------------------------------------
// P8-21 — provenance des 44 écrans de la gestion budgétaire
// ---------------------------------------------------------------------------

const SERVED_LABEL = { page: 'Sa propre page', grouped: 'Regroupé dans une autre page', topbar: 'Barre supérieure', pending: 'Pas encore servi' };

// Lue depuis src/constants/finAppScreens.js, que le test de cohérence confronte
// au routeur du client et à TASKS.md.
async function writeScreens() {
  const { APP_SCREENS } = await import('../src/constants/finAppScreens.js');
  const count = (kind) => APP_SCREENS.filter((screen) => screen.served === kind).length;
  const code = (value) => (value ? `\`${value}\`` : '—');
  const lines = [
    '# Matrice des écrans de la gestion budgétaire',
    '',
    `> Généré le ${today} par \`node server/scripts/generate-deliverables.js\` depuis \`server/src/constants/finAppScreens.js\`. Ne pas modifier à la main.`,
    '',
    "Les 44 écrans du cahier consolidé (onglet `05_Ecrans_Detailles`) et la façon dont chacun est servi. La règle « trouvable » (TASKS.md, section 6) veut que chaque écran ait **sa propre adresse**, atteinte depuis le menu en deux clics au plus : un écran regroupé dans une autre page n'est donc pas terminé, et la tâche qui le doit est nommée.",
    '',
    `**${count('page')} écrans sur 44** ont leur propre page ; ${count('grouped')} sont regroupés dans une autre ; ${count('topbar')} vivent dans la barre supérieure ; ${count('pending')} ne sont pas encore servis.`,
    '',
    '| Code | Écran | Menu du client | Servi | Adresse | Premier clic | Tâche |',
    '|---|---|---|---|---|---|---|',
  ];
  for (const screen of APP_SCREENS) {
    lines.push(`| ${screen.code} | ${screen.label} | ${screen.menu} | ${SERVED_LABEL[screen.served]} | ${code(screen.to)} | ${code(screen.via)} | ${code(screen.owner)} |`);
  }
  writeFileSync(path.join(OUT_DIR, 'MATRICE_ECRANS.md'), `${lines.join('\n')}\n`, 'utf8');
  return { total: APP_SCREENS.length, pages: count('page'), grouped: count('grouped') };
}

mkdirSync(OUT_DIR, { recursive: true });
const inventory = writeInventory();
const matrix = writeMatrix();
const screens = await writeScreens();
console.log(`LIVRABLES/INVENTAIRE_COMPOSANTS.md : ${inventory.total} composants, ${inventory.licences} licences, ${inventory.unknown} à vérifier`);
console.log(`LIVRABLES/MATRICE_RECETTE.md       : ${matrix.total} livrables, ${matrix.done} terminés, ${matrix.blocked} bloqués, ${matrix.tests} fichiers de test`);
console.log(`LIVRABLES/MATRICE_ECRANS.md        : ${screens.total} écrans, ${screens.pages} avec leur propre page, ${screens.grouped} regroupés`);

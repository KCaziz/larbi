# Larbi — Plateforme E-Learning, Blog & Outils

Voir [TASKS.md](./TASKS.md) pour la source de vérité du projet (phases, tâches, statuts, règles de sécurité).

## Stack

- Frontend : React (Vite) — [client/](./client)
- Backend : Express / Node.js — [server/](./server)
- Base de données : PostgreSQL (via Docker en développement)

## Démarrage (développement)

### 1. Base de données

```bash
docker compose up -d
```

Démarre PostgreSQL 16 sur `localhost:5432` (utilisateur `larbi`, base `larbi_dev`).

### 2. Backend

```bash
cd server
cp .env.example .env   # si absent
npm install
npm run dev
```

API disponible sur `http://localhost:4000`. Vérification : `GET /api/health`.

`JWT_SECRET` (signature des sessions, 32 caractères minimum) est obligatoire : le serveur refuse de démarrer sans. En local, remplacer la valeur d'exemple de `.env` par une valeur aléatoire :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Après un premier `npm install`, ou après avoir modifié `server/prisma/schema.prisma` :

```bash
npm run prisma:migrate   # applique les migrations sur la base locale
npm run prisma:generate  # régénère le client Prisma
```

### 3. Frontend

```bash
cd client
cp .env.example .env   # si absent
npm install
npm run dev
```

Application disponible sur `http://localhost:5173`.

## Tests

Les tests vivent dans `server/tests/` et utilisent l'exécuteur intégré de Node (aucune dépendance de test à installer). Ils n'utilisent **jamais** la base de développement : une base dédiée `larbi_test` (même serveur PostgreSQL, créée et migrée automatiquement) et un dossier de stockage temporaire. Le nom de la base doit finir par `_test`, sinon les tests refusent de tourner.

```bash
cd server
npm run test:unit          # fonctions pures, sans base ni réseau (rapide)
npm test                   # unitaires + fonctionnels + sécurité + cohérence (base de test)
npm run test:functional    # API réelle, base réelle, vrais fichiers
npm run test:security      # autorisations, sessions, injections, fichiers privés, limites de débit, mode production
npm run test:consistency   # cohérence globale : données, fichiers, client <-> serveur, traductions, migrations, suivi TASKS.md
npm run test:e2e           # vrai navigateur (Chrome/Chromium/Edge requis, CHROME_PATH pour un chemin non standard)
npm run check:consistency  # vérifie la base et le stockage COURANTS (lecture seule) ; code 0 = cohérent
```

Variables utiles : `TEST_DATABASE_URL` (autre serveur PostgreSQL de test), `CHROME_PATH` (navigateur des tests de bout en bout). Les captures d'écran des tests de bout en bout sont écrites dans `server/tests/e2e/screenshots/` (ignoré par Git).

## Structure

```text
client/    Frontend React (Vite)
  src/
    i18n/        configuration i18next + fichiers de traduction (fr, en, ar, tzm)
    theme/       contexte clair/sombre (ThemeProvider, useTheme)
server/    Backend Express
  prisma/
    schema.prisma   modèles de données (Prisma ORM)
    migrations/     historique des migrations SQL
  src/
    config/       env, client Prisma
    constants/    données de référence (ex. types de compte)
    controllers/  logique des routes
    routes/       définition des endpoints (montés sous /api)
    middleware/   gestion des erreurs, 404, etc.
docker-compose.yml   PostgreSQL de développement
```

## Notes techniques importantes

- ORM : Prisma (`prisma-client-js`), introduit en P1-05 avec le premier modèle réel (`User`). P1-01 avait volontairement différé son adoption (Prisma refuse de générer un client sans modèle métier). Prisma 7 nécessite un driver adapter explicite (`@prisma/adapter-pg`) — voir `server/src/config/prisma.js`.
- Les secrets (chaîne de connexion, etc.) vivent uniquement dans les fichiers `.env` (non versionnés). Voir `.env.example` dans `client/` et `server/`.
- Langues : français, anglais et arabe (RTL) sont réellement traduits. Le tamazight (`tzm`) est enregistré comme langue sélectionnable mais sans traduction — tout retombe sur le français (`fallbackLng`). Toute nouvelle page doit utiliser `useTranslation()`/`t()`, jamais de texte en dur (voir TASKS.md, section 6).
- Thème clair/sombre : bascule manuelle mémorisée (`localStorage`), en plus de la préférence système. Toute nouvelle couleur doit utiliser les tokens CSS de `client/src/index.css`, pas de couleur codée en dur.

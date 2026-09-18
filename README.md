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

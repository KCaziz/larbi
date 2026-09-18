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
server/    Backend Express
  src/
    config/       env, connexion DB
    controllers/  logique des routes
    routes/       définition des endpoints (montés sous /api)
    middleware/   gestion des erreurs, 404, etc.
docker-compose.yml   PostgreSQL de développement
```

## Notes techniques importantes

- Aucun ORM n'est encore installé : la connexion PostgreSQL du socle (P1-01) utilise le driver `pg` directement (pool + `SELECT 1`), le temps qu'un besoin réel de modèles apparaisse (P1-06 / P2-01). Ce choix évite de définir des modèles de données prématurés dans le schéma.
- Les secrets (chaîne de connexion, etc.) vivent uniquement dans les fichiers `.env` (non versionnés). Voir `.env.example` dans `client/` et `server/`.

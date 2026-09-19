# Plateforme E-Learning, Blog & Outils — Task Tracker

## 0. Rôle de ce fichier

Ce fichier est la source de vérité du projet.

Claude Code doit :
1. Lire ce fichier avant toute intervention.
2. Identifier les tâches réalisables selon leurs dépendances.
3. Travailler dans l'ordre des phases défini ci-dessous.
4. Ne pas commencer une tâche dont les dépendances ne sont pas terminées.
5. Après chaque tâche terminée, mettre à jour son statut dans ce fichier.
6. Ajouter une note courte lorsqu'une décision technique importante est prise.
7. Vérifier le résultat avant de passer à la tâche suivante.
8. Ne pas élargir le périmètre sans signaler clairement l'impact sur le délai de 2 mois.
9. **Git : ne jamais commiter, pousser ni gérer le dépôt** (add, commit, push, branches, PR…). L'utilisateur s'en charge lui-même (précision du 2026-09-19). Ne pas non plus proposer de commits ni s'en soucier dans les comptes rendus.

Statuts :
- `❌ todo` : non commencée
- `🚧 in-progress` : en cours
- `✅ done` : terminée et vérifiée
- `⛔ blocked` : bloquée par un problème ou une décision externe

Priorités :
- `🔴 high` : indispensable pour respecter le MVP / délai
- `🟡 medium` : importante mais peut être simplifiée
- `🟢 low` : confort / amélioration / V2

Règle de planning :
- Durée totale cible : **8 semaines**
- Les phases sont séquentielles.
- Pas de chevauchement entre phases dans le planning contractuel.
- L'objectif est un MVP réellement livrable en 8 semaines, pas une plateforme exhaustive.

---

# 1. Résumé du projet

Plateforme web composée de quatre grands domaines :

1. **Site public / pages principales**
   - majorité des pages développées en premier
   - navigation, présentation, pages de contenu, authentification et espaces selon le type de compte

2. **E-Learning**
   - création de formations par le client
   - une formation contient un nombre défini de cours
   - suivi de progression des utilisateurs
   - validation de complétion
   - certification à la fin de la formation

3. **Blog / contenus**
   - articles et tutoriels accessibles publiquement
   - système simplifié de rédaction et de gestion des contenus
   - newsletter email
   - contenus multimédias : texte, images, vidéos, etc.

4. **Outils**
   - au minimum deux outils/simulateurs
   - premier outil : simulateur de crédit
   - second outil : générateur de facture
   - éventuel simulateur fiscalité à considérer uniquement si le délai le permet

## Gestion des comptes

Le système doit pouvoir gérer plusieurs types de comptes / profils clients, notamment :
- auto-entrepreneur
- PME
- PMI
- autres catégories pouvant être ajoutées

Les contenus et fonctionnalités accessibles peuvent dépendre du type de compte et du niveau d'accès :
- utilisateur standard
- utilisateur premium
- autres niveaux si nécessaires

## Accès aux fonctionnalités

- Blog : accès public.
- Articles/tutoriels : accès public selon leur statut de publication.
- Formations : accès authentifié et selon les droits.
- Outils : accès authentifié et selon les droits.
- Contenus premium : affichage/recommandation selon le profil de l'utilisateur.

## Sécurité

Le client accorde une importance particulière à :
- protection des comptes
- protection des contenus propriétaires
- protection des vidéos, images et documents
- limitation du téléchargement direct des contenus
- contrôle des accès
- disponibilité du serveur
- sécurité générale de l'application

Important : aucune solution web ne peut empêcher absolument la copie d'un contenu affiché à l'utilisateur. L'objectif est donc de réduire fortement les possibilités de récupération directe, contrôler les accès, protéger le stockage et tracer les accès lorsque nécessaire.

## Stack imposée

- Frontend : React
- Backend : Express / Node.js
- Base de données : PostgreSQL

Technologies complémentaires autorisées si elles servent clairement le projet :
- ORM PostgreSQL
- stockage objet privé
- CDN / reverse proxy
- système d'authentification sécurisé
- génération PDF / Excel
- email provider
- cache
- rate limiting
- monitoring / logs
- antivirus / contrôle des fichiers uploadés

---

# 2. Architecture cible simplifiée

```text
React
  |
  | HTTPS / API
  v
Express / Node.js
  |
  +---- Auth / RBAC
  |
  +---- Users / Accounts
  |
  +---- Courses / Progress / Certifications
  |
  +---- Articles / Tutorials / Media
  |
  +---- Tools / Simulators
  |
  +---- Newsletter
  |
  +---- Admin / Content Management
  |
  v
PostgreSQL

Private Media Storage
  |
  +---- Videos
  +---- Images
  +---- Documents
  +---- Certificates

Security Layer
  |
  +---- HTTPS
  +---- Authentication
  +---- Authorization
  +---- Rate limiting
  +---- Input validation
  +---- Secure headers
  +---- File validation
  +---- Private media access
  +---- Logs / monitoring
  +---- Backups
```

---

# 3. Planning global — 8 semaines

| Phase | Durée | Objectif |
|---|---:|---|
| Phase 1 | Semaine 1–3 | Frontend principal + architecture + léger backend |
| Phase 2 | Semaine 4–5 | Plateforme E-Learning |
| Phase 3 | Semaine 6 | Blog + CMS contenu + newsletter |
| Phase 4 | Semaine 7 | Outils : crédit + générateur de facture |
| Phase 5 | Semaine 8 | Sécurité, intégration, tests, disponibilité et livraison |

**Total : 8 semaines.**

---

# PHASE 1 — FRONTEND PRINCIPAL + SOCLE TECHNIQUE
## Durée : 3 semaines
## Objectif

Construire la majorité des pages et le socle technique avant d'attaquer les fonctionnalités métier lourdes.

### P1-01 — Initialisation du projet
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : aucune
- Durée cible : 1 jour

Tâches :
- Initialiser le projet React.
- Initialiser le serveur Express.
- Initialiser PostgreSQL.
- Définir la structure des dossiers.
- Configurer les variables d'environnement.
- Configurer Git.
- Préparer les environnements développement/production.
- Mettre en place une base de gestion des erreurs.

Réalisé :
- `client/` : React 19 + Vite 8, `react-router-dom` installé (routeur utilisé à partir de P1-02).
- `server/` : Express 4, structure `src/{config,controllers,routes,middleware}`, middlewares de sécurité de base (`helmet`, `cors` restreint à `CORS_ORIGIN`, `morgan`), gestion d'erreurs centralisée (`errorHandler` ne fuite pas la stack trace en production), 404 handler.
- PostgreSQL 16 démarré via `docker-compose.yml` (service `postgres`, volume nommé `postgres_data`).
- Endpoint `GET /api/health` : renvoie `status`, `uptime`, et vérifie réellement la connexion PostgreSQL (pool `pg`, `SELECT 1`). Testé : `200 OK` avec `"database":"connected"` quand Postgres est up ; passe à `503`/`"database":"unavailable"` si la DB est injoignable.
- `.env.example` fournis dans `client/` et `server/` ; secrets réels uniquement dans des `.env` non versionnés (`.gitignore` racine).
- Dépôt Git initialisé (`git init`) à la racine.

Décision technique :
- Aucun ORM installé pour l'instant. Prisma a été essayé mais refuse de générer un client sans au moins un modèle métier — en définir un maintenant aurait signifié inventer des entités (User, etc.) hors du périmètre de P1-01. La connexion PostgreSQL du socle utilise donc le driver `pg` nu (pool + requête `SELECT 1`). Un ORM (Prisma pressenti) sera introduit quand de vrais modèles seront nécessaires, dès P1-05/P1-06 (modèle utilisateur) ou P2-01 (modèles E-Learning).

Tests effectués :
- Backend démarré (`node src/server.js`) : `GET /api/health` → `200 {"status":"ok","database":"connected"}` ; `GET /api/inconnu` → `404` géré proprement.
- Frontend démarré (`npm run dev`) : réponse HTTP `200` sur `http://localhost:5173`.
- `docker compose up -d` : conteneur `larbi_postgres_dev` à l'état `healthy`.

### P1-02 — Architecture frontend
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P1-01`
- Durée cible : 2 jours

Tâches :
- Router principal.
- Layout global.
- Header.
- Footer.
- Navigation.
- Pages d'erreur.
- Composants réutilisables.
- Structure responsive.
- Gestion de l'état global si nécessaire.

Réalisé :
- `router/index.jsx` : `createBrowserRouter` avec un layout racine (`MainLayout`), un `errorElement` (`ErrorPage`) et une route `*` (`NotFoundPage`) pour les 404 réelles.
- `layouts/MainLayout.jsx` : Header + `<Outlet/>` + Footer.
- `components/layout/Header.jsx` + `Navigation.jsx` : header sticky, navigation principale, menu mobile (burger) avec état local (`useState`), liens Connexion/Inscription.
- `components/layout/Footer.jsx` : liens légaux, copyright dynamique.
- `components/ui/Button.jsx`, `Container.jsx` : composants réutilisables (bouton avec variantes, wrapper de largeur max).
- `pages/PlaceholderPage.jsx` : composant générique réutilisé pour toutes les routes dont le contenu réel appartient à P1-03/P1-04 (Formations, Outils, Blog, À propos, Contact, mentions légales, confidentialité, Connexion, Inscription) — évite les liens de navigation morts sans anticiper le contenu métier de ces tâches.
- `pages/HomePage.jsx`, `NotFoundPage.jsx`, `ErrorPage.jsx` : pages minimales fonctionnelles.
- Structure responsive : breakpoint à 860px (nav desktop → menu burger), grilles/flex qui s'adaptent dans header/footer/pages.

Décision technique :
- Pas de state manager global (Redux/Zustand/Context) introduit à ce stade : aucun état ne traverse encore plusieurs pages indépendantes (le menu mobile est un état local au `Header`). La gestion d'état global réelle (utilisateur connecté, rôle, type de compte) sera mise en place avec l'authentification (P1-06), pas avant, pour éviter un contexte vide/fictif.

Tests effectués :
- `npm run build` (Vite) : compilation production réussie, aucune erreur d'import/JSX.
- Serveur de dev lancé, `curl` sur `/` : HTML servi correctement avec le bon `<title>` et point d'entrée `main.jsx`.
- Relecture du routing : chaque lien de `Header`/`Footer`/`HomePage` correspond à une route déclarée (aucun lien mort, aucune route orpheline).
- Limite de vérification : aucun outil de navigateur réel n'était disponible dans cet environnement pour cette session ; l'interaction du menu mobile (ouverture/fermeture) et le rendu visuel des breakpoints n'ont donc pas été confirmés visuellement par Claude. À vérifier manuellement en ouvrant `http://localhost:5173` et en réduisant la largeur de fenêtre sous 860px.

### P1-03 — Pages publiques principales
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P1-02`
- Durée cible : 5 jours

Pages à implémenter selon les maquettes / cahier des charges :
- Accueil.
- À propos / présentation.
- Services / offres.
- Contact.
- FAQ si prévue.
- Pages de présentation des formations.
- Pages de présentation des outils.
- Page blog.
- Page article.
- Pages légales nécessaires.

Réalisé :
- `pages/HomePage.jsx` enrichie (présentation des 3 domaines, types de compte).
- `pages/AboutPage.jsx`, `ServicesPage.jsx`, `FaqPage.jsx` (FAQ incluse — contenu strictement basé sur les règles déjà actées dans ce fichier : comptes, standard/premium, sécurité, certification).
- `pages/ContactPage.jsx` : formulaire avec validation côté client, composant `Notice` réutilisable.
- `pages/formations/FormationsPresentationPage.jsx`, `pages/outils/ToolsPresentationPage.jsx` : pages de présentation (pas de catalogue réel — celui-ci appartient à P2-03/P4-01).
- `pages/blog/BlogListPage.jsx`, `pages/blog/ArticlePage.jsx` (route `/blog/:slug`) : état vide honnête, pas d'articles fabriqués.
- `pages/legal/LegalNoticePage.jsx`, `PrivacyPolicyPage.jsx` : structure complète mais avec les informations d'identité légale explicitement marquées `[à compléter par le client]`.
- Nouveau composant réutilisable `components/ui/Notice.jsx` (variantes `info` / `action-needed`).
- `router/index.jsx` et `config/navigation.js` mis à jour (routes réelles, ajout Services au menu principal, FAQ au footer).

Décisions techniques / signalements :
- **Contact** : le formulaire ne transmet rien pour l'instant (aucun endpoint backend n'est prévu avant P1-07 « Intégration frontend/backend »). Le bouton d'envoi affiche un message honnête plutôt qu'une fausse confirmation d'envoi.
- **Mentions légales / Politique de confidentialité** : information manquante signalée (règle §11 de ce fichier) — raison sociale, SIRET, adresse, hébergeur et contact DPO doivent être fournis par le client avant toute mise en ligne réelle. Rien n'a été inventé.
- **Formations / Outils / Blog** : ce sont des pages de présentation uniquement (texte descriptif basé sur le cahier des charges). Le catalogue de formations réel, la liste d'articles réelle et les outils fonctionnels appartiennent respectivement à P2-03, P3-03 et P4-01/P4-02/P4-03 — non anticipés ici pour ne pas dupliquer ce travail ni inventer de contenu métier (formations, articles ou tarifs fictifs).

Tests effectués :
- `npm run build` : compilation production réussie (52 modules), aucune erreur.
- `npm run lint` (oxlint) : aucun avertissement.
- Serveur de dev + `curl` sur chaque route (`/`, `/formations`, `/outils`, `/blog`, `/blog/:slug`, `/a-propos`, `/services`, `/faq`, `/contact`, `/mentions-legales`, `/confidentialite`, `/connexion`, `/inscription`, route inconnue) : toutes répondent `200` (SPA — confirme que le serveur sert l'app, pas le rendu du bon composant).
- Relecture manuelle de chaque page pour la syntaxe JSX et la cohérence des imports.
- Limite de vérification : comme pour P1-02, aucun outil de navigateur réel n'était disponible dans cette session. Le rendu visuel réel de chaque page (FAQ accordéon, formulaire de contact, responsive du `feature-grid`) n'a pas été confirmé visuellement par Claude. Une tentative de test de rendu via SSR (Vite `ssrLoadModule`) a été abandonnée après un conflit d'interopérabilité CJS/ESM avec `react-router-dom` ; ne pas la reprendre sans raison forte, ce n'était pas concluant. À vérifier manuellement via `npm run dev` dans `client/`.

### P1-04 — Pages utilisateurs
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P1-02`
- Durée cible : 3 jours

Pages :
- Connexion.
- Inscription.
- Mot de passe oublié.
- Profil.
- Tableau de bord.
- Gestion du type de compte.
- Présentation des fonctionnalités accessibles.
- Pages premium / accès restreint.

Réalisé :
- `pages/auth/LoginPage.jsx`, `RegisterPage.jsx`, `ForgotPasswordPage.jsx` : formulaires avec validation côté client, liens croisés (connexion ↔ inscription ↔ mot de passe oublié).
- `layouts/AccountLayout.jsx` + `components/layout/AccountNav.jsx` : shell commun pour l'espace compte (`/compte/*`), avec onglets Profil / Tableau de bord / Type de compte / Contenus premium.
- `pages/account/ProfilePage.jsx`, `DashboardPage.jsx`, `AccountTypePage.jsx`, `PremiumAccessPage.jsx`.
- `pages/FeaturesOverviewPage.jsx` (`/fonctionnalites`) : tableau récapitulatif des accès par domaine et par type de compte, basé uniquement sur les règles déjà actées en section 1 de ce fichier.
- Nouveau composant réutilisable `components/ui/LockedContent.jsx` (pattern visuel de contenu verrouillé).
- `router/index.jsx` : routes `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/compte` (+ 4 sous-routes), `/fonctionnalites`.
- Suppression de `pages/PlaceholderPage.jsx`, devenu totalement inutilisé une fois `/connexion` et `/inscription` remplacées par de vraies pages.
- Liens de découverte ajoutés depuis `HomePage` et `ServicesPage` vers `/fonctionnalites` (aucune route orpheline).

Décisions techniques / signalements :
- **Aucune authentification réelle** : P1-06 (dépendant de P1-04 et P1-05) n'est pas commencée. Les formulaires Connexion/Inscription/Mot de passe oublié valident les champs côté client mais n'envoient rien à un backend — chaque soumission affiche un message honnête plutôt qu'une fausse confirmation.
- **Espace `/compte/*` sans garde d'accès** : comme il n'existe pas encore de notion de session, je n'ai pas ajouté de redirection « non connecté → /connexion ». En ajouter une maintenant aurait simulé une sécurité qui n'existe pas (contraire à la règle #2 : « ne jamais considérer une restriction React comme une mesure de sécurité »). La vraie protection (côté serveur + garde frontend) arrive avec P1-06/P1-07.
- **Profil / Tableau de bord** : champs affichés avec des valeurs `—` (aucune donnée utilisateur fictive), en attendant de vraies données après authentification.
- **Contenus premium** : la page démontre uniquement le *pattern visuel* de verrouillage (`LockedContent`) ; le texte de la page rappelle explicitement que le contrôle réel est côté serveur.

Manquements identifiés (à traiter dans les tâches déjà prévues, pas de nouvelle tâche nécessaire) :
- L'intégration réelle de ces formulaires à un backend d'authentification dépend de P1-05 (backend minimal) puis P1-06 (auth + rôles) et P1-07 (intégration).
- La protection effective de `/compte/*` (redirection si non connecté, contenu selon le rôle) doit être ajoutée lors de P1-07, pas avant.

Tests effectués :
- `npm run build` : 64 modules, compilation réussie, aucune erreur.
- `npm run lint` (oxlint) : aucun avertissement.
- Toutes les nouvelles routes testées via `curl` (`/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/compte`, `/compte/profil`, `/compte/tableau-de-bord`, `/compte/type`, `/compte/premium`, `/fonctionnalites`) : `200`.
- Relecture manuelle : chaque nouveau lien (`form-links`, boutons « voir le détail des accès ») pointe vers une route déclarée ; aucun import mort après suppression de `PlaceholderPage`.
- Limite de vérification identique aux tâches précédentes : pas d'outil navigateur disponible dans cette session pour confirmer visuellement les formulaires, les onglets du compte et le rendu du tableau des fonctionnalités. À vérifier manuellement via `npm run dev`.

### P1-05 — Backend minimal et navigation dynamique
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P1-01`
- Durée cible : 2 jours

Tâches :
- Structure Express.
- Routes principales.
- Contrôleurs simples.
- Connexion PostgreSQL.
- Modèles initiaux.
- Endpoint de santé `/health`.
- API de lecture minimale pour les contenus nécessaires au frontend.
- Gestion centralisée des erreurs.

Réalisé :
- **ORM introduit** : Prisma (`prisma-client-js`), différé depuis P1-01 faute de modèle réel — c'est maintenant le cas.
- **Modèle initial** : `User` (`prisma/schema.prisma`) — `id`, `email` (unique), `passwordHash`, `name`, `accountType`, `accessLevel` (défaut `standard`), timestamps. `accountType`/`accessLevel` en simples chaînes (pas d'enum Postgres) pour permettre l'ajout de nouvelles catégories sans migration, comme l'exige le cahier des charges (« autres catégories pouvant être ajoutées »).
- Migration `20260918174952_init_user` appliquée sur la base `larbi_dev` — table `users` créée et vérifiée réellement en base (`\d users` via psql, puis un cycle create/find/delete via Prisma).
- `config/prisma.js` : client Prisma avec driver adapter `@prisma/adapter-pg` (obligatoire depuis Prisma 7 — voir décision technique).
- `GET /api/health` migré de `pg` brut vers Prisma (`$queryRaw SELECT 1`), toujours fonctionnel.
- **API de lecture minimale** : `GET /api/account-types` — renvoie les 3 catégories de compte du cahier des charges, servies depuis une constante (`src/constants/accountTypes.js`), pas depuis une table (cohérent avec le choix ci-dessus). Cet endpoint n'est pas encore appelé par le frontend (le câblage réel est explicitement le rôle de P1-07).
- `server/.gitignore` (généré par `prisma init`) ignore le client généré (`src/generated/prisma`) ; `prisma/migrations/` est versionné comme il se doit.

Décisions techniques / signalements :
- **Prisma 7 exige un driver adapter explicite** (`@prisma/adapter-pg`) pour se connecter — ce n'était pas le cas des versions précédentes. Sans lui, `PrismaClient` lève une erreur au démarrage (« A driver adapter is required »). Documenté dans `config/prisma.js` et le README.
- **Nettoyage** : `npx prisma init` (v7) génère par défaut des dossiers de documentation pour agents IA (`.claude/skills`, `.windsurf/skills`, `.agents/skills`, `skills-lock.json`), sans rapport avec ce projet. Supprimés immédiatement pour ne pas polluer le dépôt ni prêter à confusion avec une vraie configuration Claude Code.
- **Générateur Prisma** : le nouveau générateur par défaut `prisma-client` (Prisma 7) ne produit que du TypeScript, inutilisable tel quel dans ce serveur Node/ESM sans outillage TS. Utilisation du générateur classique `prisma-client-js` à la place (JS + `.d.ts` prêts à l'emploi).
- **`prisma7.config.ts`** : fichier de config généré par le CLI Prisma (requiert `dotenv`, déjà présent). Chargé par le CLI lui-même (confirmé via `prisma format`/`migrate`) — n'introduit pas de dépendance TypeScript pour l'application elle-même, qui reste 100 % JS.
- **Vulnérabilités npm (`prisma audit`)** : 4 vulnérabilités « high » signalées, toutes dans les dépendances de développement du CLI Prisma (`deepmerge-ts` via `@prisma/config`, `mysql2` embarqué par le CLI même si le projet n'utilise que PostgreSQL). `npm audit fix --force` proposerait de revenir à `prisma@6.19.3`, une régression non souhaitée. Aucun impact runtime identifié (uniquement l'outil CLI, pas `@prisma/client`). À surveiller lors d'une future mise à jour de Prisma plutôt qu'à corriger maintenant.
- **Pas d'endpoint d'écriture ajouté** (pas de `POST /api/users`, pas de route de connexion) : toute logique touchant à la création/authentification d'utilisateurs appartient explicitement à P1-06, pas à P1-05.

Tests effectués :
- `npx prisma migrate dev` : migration appliquée sans erreur ; `docker exec larbi_postgres_dev psql -U larbi -d larbi_dev -c "\d users"` confirme la table réelle en base.
- Script Node ponctuel : `prisma.user.create()` → `findUnique()` → `delete()` exécutés avec succès contre la vraie base (puis nettoyage), preuve que la connexion et le modèle fonctionnent de bout en bout, pas seulement au niveau du schéma.
- Serveur démarré (`node src/server.js`) : `GET /api/health` → `200 {"status":"ok","database":"connected"}` ; `GET /api/account-types` → `200` avec les 3 catégories ; `GET /api/nope` → `404` géré proprement.
- Pas de linter configuré côté serveur (seul le frontend en a un) — relecture manuelle des fichiers modifiés/ajoutés.

### P1-06 — Authentification + rôles
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P1-04`, `P1-05`
- Durée cible : 2 jours

Tâches :
- Inscription.
- Connexion.
- Sessions / tokens sécurisés.
- Hashage des mots de passe.
- Déconnexion.
- Contrôle d'accès.
- Rôles / permissions.
- Types de comptes : auto-entrepreneur, PME, PMI, etc.
- Niveau standard / premium.

Réalisé (backend uniquement — le câblage React est P1-07) :
- Endpoints : `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- Mots de passe hashés avec `bcryptjs` (coût 12) ; comparaison factice quand l'email est inconnu (pas de fuite par timing) ; message d'erreur de login identique pour email inconnu / mauvais mot de passe.
- Session : JWT (HS256, 7 jours par défaut) dans un cookie `httpOnly`, `SameSite=Lax`, `Secure` en production — jamais lisible par le JS de la page. `JWT_SECRET` obligatoire (≥ 32 caractères), le serveur refuse de démarrer sinon.
- Validation stricte avec `zod` (`.strict()`) : `role` / `accessLevel` fournis à l'inscription sont **rejetés** (400) — aucune auto-attribution de privilèges ; `accountType` validé contre `constants/accountTypes.js`.
- RBAC : nouveau champ `User.role` (`user` | `admin`, migration `add_user_role`). Middlewares `requireAuth`, `requireRole(...)`, `requireAccessLevel('premium')`. `requireAuth` recharge l'utilisateur en base à chaque requête : un changement de rôle/niveau ou une suppression de compte est effectif immédiatement.
- `express-rate-limit` sur register/login (20 tentatives / 15 min / IP, configurable via `AUTH_RATE_LIMIT`).
- Réponses utilisateur via une liste blanche explicite de champs (`passwordHash` jamais renvoyé).

Décisions techniques / signalements :
- `role` (ce que l'on peut gérer) est distinct de `accessLevel` (niveau de contenu consommable), conformément à la section 1.
- **Déconnexion sans révocation serveur** : le JWT est stateless, le logout supprime le cookie mais un token déjà copié reste valide jusqu'à expiration. Acceptable pour le MVP ; une liste de révocation serait à envisager en P5-01 si le client l'exige.
- **Aucun endpoint de création d'admin** (volontaire) : le premier admin est promu directement en base (`UPDATE users SET role='admin'`). À documenter dans la doc d'exploitation (P5-06).
- Aucune route métier n'utilise encore `requireRole`/`requireAccessLevel` : ils sont testés mais seront appliqués aux routes E-Learning/blog/outils dans leurs tâches respectives.
- « Mot de passe oublié » : l'envoi d'email n'est pas dans le périmètre de P1-06 (aucun fournisseur email défini) — la page existe côté front (P1-04), sans endpoint réel pour l'instant.
- Environnement : `server/.env` créé depuis `.env.example` (non versionné), `docker compose up`, `npm install`.

Tests effectués (serveur réel + PostgreSQL réel, `curl`) :
- `/me` sans cookie → 401 ; cookie forgé → 401 ; après logout → 401.
- Register OK → 201 (cookie `HttpOnly`) ; email en doublon → 409 ; `role: "admin"` injecté → 400 ; `accountType` invalide → 400 ; mot de passe court → 400.
- Login OK → 200 ; mauvais mot de passe et email inconnu → 401 identique.
- Vérifié en base : `passwordHash` = hash bcrypt (`$2b$12$…`), `role=user`, `accessLevel=standard` par défaut.
- RBAC via routes de sonde temporaires (supprimées) : user standard → 403 sur route admin et premium ; sans cookie → 401 ; après promotion en base, même session → 200 sur les deux.
- Rate limit (limite abaissée à 3) : 401, 401, 401, puis 429, 429.
- Comptes de test supprimés de la base. Pas de suite de tests automatisés (le projet n'en a pas encore ; à traiter en P5-05).

### P1-07 — Intégration frontend/backend
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P1-03`, `P1-05`, `P1-06`
- Durée cible : 2 jours

Tâches :
- Connexion React ↔ API.
- Authentification réelle.
- Protection des routes frontend.
- Gestion des erreurs API.
- États loading / empty / error.
- Tests des principaux parcours.

Réalisé — frontend :
- `lib/api.js` : client `fetch` unique (`credentials: 'include'`, erreurs normalisées en `ApiError`, `status 0` = serveur injoignable). `errorKey()` traduit chaque erreur en clé i18n : aucun message serveur (anglais) n'est affiché à l'utilisateur.
- `auth/` (`AuthContext`, `useAuth`) : état global de session (`loading` / `authenticated` / `anonymous` / `error`), initialisé par `GET /auth/me` ; `login`, `register`, `logout`, `updateAccountType`. Le logout ne vide l'état local qu'après confirmation du serveur.
- `RequireAuth` protège `/compte/*` (redirection vers `/connexion`, puis retour à la page demandée après connexion) ; états chargement et erreur serveur avec bouton « Réessayer ».
- Connexion / Inscription branchées à l'API (validation, bouton désactivé pendant l'envoi, messages : identifiants incorrects, email déjà utilisé, mot de passe trop court, serveur injoignable, trop de tentatives). Les types de compte de l'inscription viennent de `GET /api/account-types` (états chargement/erreur gérés).
- Profil : vraies données (nom, email, type, niveau). Type de compte : modification réelle. Contenus premium : verrou ou message actif selon `accessLevel` renvoyé par le serveur. En-tête : « Mon espace » + « Déconnexion » quand connecté. Formulaire de contact : envoi réel.
- Point de bascule vers le menu burger relevé à 1180 px (l'en-tête connecté est plus large) ; le dashboard reste en état vide (`—`), il n'y a encore aucune donnée E-Learning.
- Vite : proxy `/api` → `localhost:4000` (même origine, donc cookie de session « first-party » sans réglage CORS/SameSite). `VITE_API_URL` devient optionnel.
- i18n : 42 clés ajoutées/mises à jour et 7 obsolètes retirées (textes « pas encore relié »), parité fr/en/ar vérifiée (241 clés chacun).

Réalisé — backend (ajouts minimaux nécessaires) :
- `POST /api/contact` : validation stricte (zod), limité à 5 messages / heure / IP, stocké dans la nouvelle table `contact_messages` (migration `add_contact_messages`). Aucun email n'est envoyé (pas de fournisseur défini) : les messages sont uniquement en base, une vue admin viendra avec le CMS/admin.
- `PATCH /api/auth/me` : modification de son propre `accountType` uniquement (`role` et `accessLevel` rejetés en 400 ; requête filtrée sur l'id de la session, donc jamais celui d'un autre utilisateur).

Décisions techniques / signalements :
- **« Mot de passe oublié » reste inactif** : il exige un service d'envoi d'email, non défini. Le texte de la page le dit honnêtement (aucune fausse confirmation). À traiter quand le fournisseur email sera choisi (utile aussi pour la newsletter P3-05).
- La protection des routes React est de l'ergonomie, pas de la sécurité : chaque endpoint reste protégé côté serveur (`requireAuth`).
- Le passage à `premium` n'a pas de parcours (pas de paiement dans le MVP) : pour l'instant seul un admin peut modifier `accessLevel` en base.

Tests effectués (vrai navigateur Edge piloté par puppeteer-core, serveur Express + PostgreSQL réels, 20/20 réussis) :
- Garde : `/compte/profil` anonyme → `/connexion` ; après connexion retour sur `/compte/profil`.
- Inscription : types de compte chargés depuis l'API, mot de passe court refusé, création puis redirection, profil avec vraies données ; session conservée après rechargement de la page.
- Modification du type de compte confirmée puis reflétée dans le profil ; page premium verrouillée pour un compte standard.
- Contact : message enregistré ; déconnexion → garde de nouveau active ; mauvais mot de passe → erreur générique ; email déjà utilisé → message explicite ; API coupée (requête bloquée) → message « serveur injoignable » ; aucune erreur JS non interceptée.
- Backend via `curl` : contact 201 / 400 / 429 (limite abaissée pour le test), `PATCH /auth/me` 200 / 400 (role, type invalide) / 401 sans session.
- `npm run lint` sans avertissement, `npm run build` réussi. Captures visuelles : clair, sombre, arabe (RTL), 820 px et 1200 px.
- Deux défauts trouvés et corrigés pendant les tests : en-tête connecté qui débordait sous 1180 px, et email long qui sortait de sa carte. Un échec initial du test « connexion » venait de mon script (mot de passe mal saisi), pas de l'application.
- Limites : pas de test sur vrai téléphone ni Safari/Firefox ; pas de suite de tests automatisés conservée dans le dépôt (le script de test est resté hors du projet ; à formaliser en P5-05).

### P1-09 — Mode clair / sombre
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P1-02`
- Durée cible : 1 jour

Origine : omission signalée par l'utilisateur après coup (2026-09-18) — ajoutée à sa demande, pas une correction de bug. Ne modifie le design d'aucune page (remarques de design à venir de l'utilisateur, hors périmètre ici) : uniquement le mécanisme clair/sombre.

Tâches :
- Jetons de couleur clair/sombre exploitables partout (déjà en place depuis P1-02 via `prefers-color-scheme`, complétés ici par une bascule manuelle).
- Bascule manuelle indépendante de la préférence système, avec mémorisation du choix.
- Application immédiate sans flash de la mauvaise couleur au chargement.

Réalisé :
- `src/theme/theme-context.js`, `ThemeContext.jsx` (`ThemeProvider`), `useTheme.js` : état `light`/`dark`, initialisé depuis `localStorage` sinon `prefers-color-scheme`, persisté à chaque changement.
- `index.css` : les variables de thème sombre sont désormais définies à la fois sous `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) {...} }` (préférence système) et sous `:root[data-theme='dark'] {...}` (bascule manuelle explicite) — les deux mécanismes cohabitent.
- `index.html` : petit script inline exécuté avant le montage React, qui applique `data-theme` dès le premier paint pour éviter un flash de la mauvaise couleur.
- `components/ui/ThemeToggle.jsx` : bouton dans le `Header`, alterne clair/sombre.

Décision technique :
- Bascule à deux états (clair/sombre) plutôt qu'un troisième état « système » explicite dans l'interface : le système est déjà le point de départ par défaut (tant qu'aucun choix n'est mémorisé), ce qui couvre le besoin sans complexifier le composant.

Tests effectués :
- `npm run build` : compilation réussie.
- `npm run lint` (oxlint) : aucun avertissement.
- Limite de vérification identique aux tâches précédentes : pas d'outil navigateur disponible dans cette session pour confirmer visuellement la bascule et l'absence de flash. À vérifier manuellement.

### P1-10 — Internationalisation (i18n)
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P1-02`
- Durée cible : 2 jours

Origine : omission signalée par l'utilisateur après coup (2026-09-18) — le projet doit supporter plusieurs langues : français, anglais, arabe et tamazight. Ajoutée à sa demande.

Tâches :
- Mise en place d'i18next / react-i18next.
- Traduction réelle en français (langue source), anglais et arabe.
- Tamazight enregistré comme langue sélectionnable mais **non traduit** : repli automatique (`fallbackLng`) vers le français pour toute clé manquante, conformément à la demande explicite de l'utilisateur.
- Support RTL (arabe) : bascule de `dir`/`lang` sur `<html>` selon la langue active.
- Sélecteur de langue accessible depuis le `Header`.

Réalisé :
- `src/i18n/index.js` : configuration i18next (`fr`, `en`, `ar`, `tzm`), `fallbackLng: 'fr'`, détection via `localStorage` puis `navigator`.
- `src/i18n/locales/{fr,en,ar}.json` : traductions complètes et vérifiées comme strictement identiques en structure de clés (199 clés dans chacun des 3 fichiers, aucune manquante ni orpheline — vérifié par script).
- `src/i18n/locales/tzm.json` : fichier volontairement vide (commenté), aucune traduction fournie — tout retombe sur le français.
- `src/i18n/useSyncHtmlAttributes.js` : synchronise `<html lang>` et `<html dir>` avec la langue active (nécessaire pour un rendu RTL correct en arabe), appelé depuis `App.jsx`.
- `components/ui/LanguageSwitcher.jsx` : sélecteur des 4 langues, intégré au `Header`.
- **Toutes** les pages et composants texte existants (Header, Footer, AccountNav, Home, À propos, Services, FAQ, Contact, Fonctionnalités, présentation Formations/Outils, Blog/Article, pages légales, Connexion/Inscription/Mot de passe oublié, Profil/Tableau de bord/Type de compte/Premium, 404/Erreur) migrés vers `useTranslation()` / `t()` — plus aucun texte français en dur dans le JSX (vérifié par recherche des caractères accentués dans les fichiers `.jsx`, seuls des commentaires de code subsistent).
- `config/navigation.js` : les libellés de navigation sont désormais des clés i18n (`labelKey`), plus du texte littéral.
- Ajustement CSS minimal pour la compatibilité RTL (`text-align: start` au lieu de `left` dans le tableau des fonctionnalités) — le reste de la mise en page utilise déjà flex/grid avec `gap`, agnostique à la direction. Aucune autre modification de design.

Décisions techniques / signalements :
- **Pas de redesign** : conformément à la demande explicite de l'utilisateur (remarques de design à venir), seule l'infrastructure clair/sombre et langues a été ajoutée — aucune page n'a été redessinée.
- **RTL** : le mécanisme (`dir="rtl"` sur `<html>` en arabe) est fonctionnel, mais un passage de polish visuel dédié au RTL (vérifier chaque composant pixel par pixel en arabe) n'a pas été fait — cohérent avec la consigne de ne pas retravailler le design maintenant.
- **Tamazight** : uniquement « mis en place » comme demandé — sélectionnable dans le switcher, zéro traduction fournie, comportement de repli vérifié par construction (`fallbackLng: 'fr'`).

Règle ajoutée pour la suite du projet (voir aussi section 6) : toute nouvelle page ou tout nouveau composant (Phases 2 à 5) doit utiliser `useTranslation()`/`t()` dès sa création, jamais de texte en dur — les traductions en/ar correspondantes doivent être ajoutées dans le même changement, sauf pour un contenu réellement dynamique (ex. articles de blog, formations) qui suit son propre système de traduction de contenu à définir le moment venu.

Tests effectués :
- `npm run build` : 104 modules, compilation réussie.
- `npm run lint` (oxlint) : aucun avertissement.
- Script de vérification de parité des clés entre `fr.json`, `en.json` et `ar.json` : 199 clés de chaque côté, aucun écart.
- Recherche de texte français résiduel dans les fichiers `.jsx` (caractères accentués) : uniquement des commentaires de code, aucun texte affiché à l'utilisateur.
- Limite de vérification identique aux tâches précédentes : pas d'outil navigateur disponible dans cette session pour confirmer visuellement le changement de langue, le rendu RTL réel et l'absence de régression visuelle. À vérifier manuellement via `npm run dev`.

### P1-11 — Refonte visuelle du frontend
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P1-02`, `P1-09`, `P1-10`
- Durée cible : 1 jour

Origine : demande explicite de l'utilisateur (2026-09-19), avant P1-07 — le rendu précédent « faisait trop IA ». Tâche ajoutée hors du plan initial : impact délai ≈ 1 jour, absorbé dans la marge de la Phase 1. Aucun changement fonctionnel ni de contenu.

Demandes :
- Icônes Lucide à la place des emojis et caractères décoratifs.
- Mode clair / sombre avec de vraies palettes différentes (pas seulement blanc ↔ noir).
- Meilleure typographie et esthétique générale, moins « générique IA ».

Réalisé :
- Paquets : `lucide-react`, `@fontsource-variable/fraunces`, `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-sans-arabic` (polices auto-hébergées via npm : pas d'appel à un CDN externe, donc pas de fuite d'IP visiteur vers un tiers).
- Typographie : titres en Fraunces (serif éditorial), texte en IBM Plex Sans ; IBM Plex Sans Arabic en repli pour l'arabe. Interlettrage désactivé en RTL (il casse la liaison des lettres arabes).
- Palette claire « Papier » : fond papier chaud, texte encre bleu nuit, accent vert profond, laiton en secondaire. Palette sombre « Ardoise » : fond ardoise bleu-vert, accent menthe, laiton clair — ambiance distincte, pas une inversion. Tous les composants lisent des tokens CSS (`index.css`).
- Supprimé : dégradés violet/rose, texte en dégradé, blobs flous, pastilles arrondies partout, cartes qui « sautent » au survol, barres de couleur en haut des cartes. Remplacé par aplats, filets fins, rayons modestes (8/12 px), grille discrète en fond du hero et des bannières de page.
- Accueil : hero en deux colonnes avec un index cliquable des trois domaines (contenu réel, rien d'inventé), bande de points clés, étapes numérotées 01/02/03 en serif, bandeau final sombre.
- Icônes : tous les emojis (pages, en-tête, pied de page, notices, verrou, bascule de thème) et flèches textuelles (→ / ←) remplacés par des composants Lucide. Les flèches sont ajoutées par `Button arrow` et inversées automatiquement en RTL.
- `PageHeader` et `AuthAside` reçoivent maintenant un composant Lucide (`icon={Landmark}`) au lieu d'un caractère.
- Classes de ton renommées de façon cohérente avec la nouvelle palette : `tone-violet/amber/pink` → `tone-primary/brass/clay`.
- i18n : seules les flèches ont été retirées des chaînes fr/en/ar ; aucune clé ajoutée ni supprimée.

Tests effectués :
- `npm run lint` : aucun avertissement ; `npm run build` : réussi.
- Recherche d'emojis / flèches / anciens tokens (`gradient-*`, `--pink`, `--amber`) dans `src` : 0 occurrence.
- Captures réelles avec Edge headless sur le serveur Vite : accueil clair, accueil sombre, connexion sombre, accueil arabe (RTL : mise en page miroir, flèches inversées, police arabe), page Formations en arabe à 500 px de large (aucun débordement horizontal).
- Un premier test mobile (390 px) semblait rogné : Edge headless impose une largeur minimale ; je ne l'ai pas considéré comme concluant, mais j'ai tout de même remplacé les `1fr` par `minmax(0, 1fr)` (cause classique de débordement de grille), puis re-testé à 500 px.
- Limites : pas vérifié sur un vrai téléphone ni sous 500 px, ni dans Safari/Firefox ; toutes les pages n'ont pas été capturées une par une (les autres réutilisent les mêmes composants et tokens). Contraste des textes non mesuré avec un outil dédié (palette choisie pour rester lisible, à valider lors de P1-08). À regarder à l'œil : `npm run dev`.

### P1-08 — Validation de fin de phase
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P1-07`, `P1-09`, `P1-10`
- Durée cible : 1 jour

Critères :
- Les pages principales sont navigables.
- Authentification fonctionnelle.
- Les rôles sont reconnus.
- Le backend répond correctement.
- PostgreSQL est connecté.
- Aucun blocage majeur ne doit empêcher la Phase 2.

Validation effectuée le 2026-09-19 — **Phase 1 validée** (63 vérifications automatisées + contrôles manuels, tout au vert) :

1. Pages navigables (navigateur Edge réel, 22/22) :
   - 16 routes publiques × 3 langues (fr / en / ar) : chaque page s'affiche avec son titre, `lang`/`dir` corrects (RTL en arabe), 404 uniquement sur route inconnue, aucune erreur JS/console. Tamazight retombe bien sur le français, aucune clé i18n brute visible.
   - 14 liens internes distincts explorés depuis toutes les pages : aucun lien mort.
   - Clair / sombre : palettes réellement différentes (`rgb(247,245,240)` vs `rgb(13,20,23)`) ; aucun débordement horizontal à 500 px dans les deux thèmes.
2. Authentification (navigateur réel, 20/20 sur le parcours complet + backend) : inscription, connexion, déconnexion, session conservée au rechargement, garde `/compte/*` (les 5 routes redirigent un anonyme vers `/connexion`, puis accessibles une fois connecté), erreurs (mot de passe faux, email en doublon, serveur injoignable).
3. Rôles reconnus : un compte standard voit le contenu premium verrouillé ; après passage à `premium` en base, la même session voit le changement immédiatement (le serveur reste la source de vérité) ; le rôle `admin` est reconnu par `/auth/me` ; `requireRole` / `requireAccessLevel` testés en P1-06 (403 puis 200). 4 tentatives d'élévation de privilèges (`role`, `accessLevel` via inscription ou `PATCH /auth/me`) rejetées en 400.
4. Backend (mode `NODE_ENV=production`, 21/21) : `/health` connecté à PostgreSQL, 404 JSON, JSON malformé → 400 sans stack trace, injections SQL/objets rejetées par la validation, en-têtes Helmet, CORS (origine étrangère refusée), cookie de session `HttpOnly` + `Secure` + `SameSite=Lax`, mot de passe stocké en bcrypt coût 12, JWT `alg=none` et JWT signé avec un autre secret refusés, jeton d'un compte supprimé refusé, brute-force limité (429), démarrage refusé sans `JWT_SECRET` valide.
5. PostgreSQL : les 3 migrations s'appliquent depuis zéro sur une base vierge (`migrate deploy`, schéma « up to date », base temporaire supprimée). Panne simulée (conteneur arrêté) : `/health` → 503 `degraded`, `/auth/login` → 500 « Internal server error » sans détail ; après redémarrage, reprise automatique sans relancer l'API.
6. Hygiène : aucun `.env` versionné, aucun secret / identifiant DB dans le build client (`dist`), `npm run lint` sans avertissement, `npm run build` réussi, parité i18n 241 clés × 3 langues.

Constats non bloquants (à connaître pour la suite) :
- **`npm audit` serveur : 4 vulnérabilités « high »**, toutes dans le CLI `prisma` (`deepmerge-ts`, `mysql2` embarqué), jamais chargées par l'API en exécution ; corriger = rétrograder Prisma (régression). Déjà signalé en P1-05 ; à réexaminer en P5-02. `npm audit` client : 0.
- **Piège Prisma** : après chaque migration (`prisma migrate dev`), lancer aussi `npx prisma generate` — le client généré n'a pas été mis à jour automatiquement ici (rencontré deux fois : `role`, `ContactMessage`). À respecter à partir de P2-01.
- **Environnement de dev** : Docker Desktop doit être lancé et `docker compose up -d` exécuté avant le serveur ; le port Vite 5173 peut être pris par un autre projet local (utiliser `--port`).
- Aucune suite de tests automatisés n'est conservée dans le dépôt (les scripts de validation vivent hors projet) : à formaliser en P5-05.
- Limites : pas de test sur vrai téléphone ni Safari/Firefox ; contrastes non mesurés avec un outil dédié ; pas d'audit d'accessibilité clavier/lecteur d'écran.

---

# PHASE 2 — E-LEARNING
## Durée : 2 semaines
## Objectif

Livrer le cœur de la plateforme de formation.

### P2-01 — Modèle de données E-Learning
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P1-08`
- Durée cible : 2 jours

Entités à prévoir :
- Formation.
- Cours.
- Utilisateur.
- Inscription à une formation.
- Progression.
- Certification.
- Catégories / métadonnées si nécessaires.
- Contenus multimédias.

Relations minimales :
- Une formation possède plusieurs cours.
- Un utilisateur peut être inscrit à plusieurs formations.
- La progression est suivie par formation et par cours.
- Une certification est délivrée lorsque les conditions sont remplies.

Réalisé (modèle de données uniquement — aucun endpoint, ils appartiennent à P2-02 et suivantes) :
- Migration `elearning_model` (Prisma + SQL) : tables `formation_categories`, `formations`, `courses`, `media`, `enrollments`, `course_progress`, `certifications`. Constantes des valeurs autorisées dans `server/src/constants/elearning.js`.
- Relations : une formation a N cours ; un utilisateur a N inscriptions (unique par couple utilisateur + formation) ; la progression est suivie par inscription **et** par cours ; une seule certification par inscription, associée à l'utilisateur et à la formation via l'inscription.
- Accès : `formations.requiredAccessLevel` (`standard` / `premium`) pour appliquer le niveau côté serveur ; `courses.isRequired` pour distinguer cours obligatoires et bonus (base du calcul de complétion en P2-04).

Décisions techniques :
- **Le nombre de cours n'est pas stocké** : c'est `count(courses)`, il ne peut donc jamais diverger de la liste réelle (P2-02 « définir le nombre de cours »).
- **Intégrité garantie par PostgreSQL, pas seulement par le code** : clés composites `(inscription, formation)` et `(cours, formation)` sur `course_progress` — la base refuse une progression sur un cours d'une autre formation (répond à « empêcher une validation incohérente », P2-04). Contraintes `CHECK` ajoutées à la main dans la migration : statuts autorisés, `published` ⇔ `publishedAt` renseigné, `completed` ⇔ `completedAt` renseigné (inscription et progression), positions et tailles positives. Elles couvrent aussi `users.role` / `users.accessLevel` (jusqu'ici validés seulement par l'application).
- Statuts en chaînes de caractères plutôt qu'en enums PostgreSQL (même raisonnement que `accountType` : évolutif sans migration), protégés par les `CHECK`.
- **Suppressions** : supprimer un utilisateur supprime ses inscriptions, progressions et certificats (droit à l'effacement) ; supprimer un cours supprime sa progression et ses médias ; une formation ayant des inscrits **ne peut pas être supprimée** (RESTRICT) — il faut la dépublier ; supprimer l'auteur conserve la formation.
- **Ordre des cours** : `position` volontairement non unique (une contrainte d'unicité fait échouer un échange de deux cours en cours de transaction) ; P2-02 réordonne dans une transaction et trie par `(position, createdAt)`.
- **Média** : `media.storageKey` est une clé de stockage interne, jamais à sérialiser ni à exposer en URL (règle de sécurité n°4) ; l'accès se fera par URLs signées/temporaires en P2-06. `sizeBytes` en entier 32 bits (limite ≈ 2 Go par fichier, suffisante pour le MVP).
- **Certificat** : nom du titulaire et titre de la formation copiés dans la certification (elle reste valide et vérifiable si le compte ou la formation est renommé) ; `certificateNumber` unique, à générer côté application de façon non séquentielle (P2-05).
- **Limite assumée** : « certification délivrée uniquement quand les conditions sont remplies » ne peut pas être imposé par une contrainte SQL (elle dépend du contenu d'autres lignes) ; ce sera appliqué côté serveur en P2-04/P2-05, avec un test dédié.
- Catégories : table minimale `formation_categories` (slug + nom) ; les contenus de formation (titre, description) sont en une seule langue pour l'instant — le système de traduction des contenus dynamiques reste à définir (voir règle i18n en section 6).

Tests effectués (PostgreSQL réel, script Prisma jetable puis supprimé, 35/35) :
- Parcours nominal : formation avec catégorie, couverture et 3 cours ordonnés ; inscription ; progression ; calcul « tous les cours obligatoires terminés » en une requête (bonus ignoré) ; certification retrouvée par utilisateur/formation et par numéro public.
- 22 violations d'intégrité rejetées : doublons (inscription, progression, certification par inscription, numéro de certificat, slug, clé de stockage), progression sur un cours d'une autre formation, formationId incohérent, chacune des contraintes `CHECK`.
- Suppressions : formation avec inscrits bloquée ; cascades cours → progression et médias, utilisateur → inscription/progression/certificat ; auteur supprimé → formation conservée ; couverture supprimée → champ mis à `null`.
- Migrations appliquées depuis une base vierge (4 migrations, 9 tables, schéma « up to date »), puis suppression de la base temporaire. Régression : suite backend production 21/21, aucune donnée de test résiduelle.

### P2-02 — Gestion des formations côté client/admin (CMS)
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P2-01`
- Durée cible : 2 jours → **3 jours** (périmètre élargi le 2026-09-19, voir « Impact délai »)

Décision du client (2026-09-19) : les formations sont créées par un **administrateur** (`role='admin'`) dans un **CMS conçu pour des non-informaticiens**. Ce CMS doit contenir tout ce dont une formation a besoin pour être publiée : informations, cours, images, certification à la fin.

**Exigence structurante : la base du CMS est partagée avec les articles (P3-02).** Ce qui est générique (coquille d'administration, éditeur de texte riche, envoi de médias, liste + éditeur + publication, checklist de publication, sécurité côté serveur) doit être écrit une seule fois dans P2-02 ; P3-02 (articles) ne fera que brancher ses propres champs dessus, sans réécrire ces briques.

Fonctionnalités (formation) :
- Créer une formation (brouillon) en ne saisissant que son titre, puis la compléter.
- Modifier une formation : titre, description, catégorie, niveau d'accès (tous les comptes / premium), image de couverture.
- Ajouter / modifier / supprimer les cours ; contenu en éditeur de texte riche (gras, titres, listes, liens) ; vidéos, documents et images attachés à un cours.
- Organiser l'ordre des cours (boutons monter / descendre, pas de glisser-déposer).
- Définir les informations de certification (activée ou non, titre, description).
- Vérifier que la formation est prête (checklist claire, en langage simple) puis la publier / dépublier.
- Le « nombre de cours » est simplement le nombre de cours ajoutés (voir P2-01).

Base CMS réutilisable (à construire ici, réutilisée par P3-02) :
- Côté serveur : préfixe `/api/admin/*` réservé au rôle admin, service de stockage privé + validation des envois (type réel du fichier, taille, nom aléatoire), assainissement du HTML riche, génération de slugs uniques, calcul « prêt à publier », gestion d'erreurs avec détails.
- Côté React : coquille d'administration (menu latéral), tableau de contenus avec états vide/chargement/erreur, badge de statut, champ avec aide, éditeur de texte riche, champ image / envoi de fichier, boîte de confirmation, barre d'enregistrement avec état, onglets/étapes, checklist de publication, boutons monter/descendre.

Exigences pour les non-informaticiens : vocabulaire simple (aucun terme technique : pas de « slug », « statut », « ID »…), actions confirmées avant toute suppression, message clair après chaque enregistrement, avertissement si on quitte avec des modifications non enregistrées, tout traduit (fr / en / ar).

Impact délai : +1 jour sur P2-02 (éditeur riche, envoi de médias, base partagée). Compensé en P3-02, qui réutilise cette base (–1 jour attendu). Aucun impact sur les 8 semaines tant que P3-02 est bien construit sur la base.

Limites volontaires (renvoyées aux tâches prévues) : lecture des médias par les apprenants et URLs signées → P2-06 ; durcissement complet des uploads (antivirus, watermark) → P5-03.

Réalisé — backend (`/api/admin/*`, tout derrière `requireAuth` + `requireRole('admin')`) :
- Formations : liste, création (titre seul → brouillon), lecture, modification, publication / dépublication, suppression. Cours : ajout, modification, suppression (positions refermées), réordonnancement transactionnel (la liste envoyée doit être exactement l'ensemble des cours de la formation). Catégories : liste + création. Médias : couverture (remplace et supprime l'ancienne), fichiers de cours (vidéo MP4/WebM, PDF, image), suppression, lecture réservée aux admins.
- Base partagée (réutilisable par les articles) : `services/storage.service.js` (stockage privé + validation des envois), `middleware/upload.js`, `services/sanitize.service.js` (HTML riche), `services/slug.service.js`, `services/readiness.service.js` (liste « prêt à publier »), `serializers/cms.js`, `utils/asyncRoute.js`, `HttpError` avec `details`, `routes/admin.routes.js`.
- Publication : refusée côté serveur (422 + liste de ce qui manque) tant que titre, description, image de couverture, au moins un cours, contenu de **chaque** cours (texte, vidéo, document ou image) et nom de la certification (si activée) ne sont pas renseignés — la checklist du navigateur ne peut donc pas être contournée.

Réalisé — frontend (`/admin`, chargé à la demande : le site public ne télécharge jamais l'éditeur) :
- Base CMS réutilisable dans `components/cms/` : coquille avec menu latéral (`CmsShell`, entrées dans `config/adminNav.js`), barre de titre, badge d'état, tableau, état vide, champ avec aide, **éditeur de texte riche** (TipTap : gras, italique, souligné, 2 niveaux de titre, listes, citation, lien), envoi de fichier, champ image, liste de médias avec lecteur vidéo, boîte de confirmation, barre d'enregistrement (non enregistré / enregistrement / enregistré / erreur), avertissement avant de quitter avec des modifications non enregistrées, étapes numérotées avec coches, checklist de publication, boutons monter / descendre.
- Parcours de l'admin : liste des formations → « Nouvelle formation » (titre seul) → éditeur en 4 étapes : Informations (titre, description, catégorie créable sur place, niveau d'accès, image de couverture), Cours (ajout, texte riche, vidéos/documents/images, durée, obligatoire ou bonus, ordre, suppression confirmée), Certification (activée, nom, description), Publication (checklist avec bouton « Compléter » vers l'étape concernée, publier / retirer, suppression en zone séparée).
- Langage simple pour non-informaticiens (aucun terme technique visible), messages clairs après chaque action, tout traduit fr / en / ar (150 clés ajoutées, parité 391 clés), RTL vérifié. Lien « Administration » dans l'en-tête, visible uniquement pour les admins.

Décisions techniques :
- **Sécurité des textes** : le HTML de l'éditeur est assaini côté serveur à l'enregistrement (liste blanche : pas de script, iframe, image, style, gestionnaires d'événements, liens `javascript:`) ; l'éditeur du navigateur n'est pas la frontière de sécurité. Même règle pour les articles.
- **Sécurité des fichiers** : le type réel est lu dans le **contenu** du fichier (nom et Content-Type du client ignorés) ; SVG et HTML refusés ; taille limitée par type (image 5 Mo, document 25 Mo, vidéo 300 Mo, réglables par variables d'environnement) ; nom de stockage aléatoire (pas de traversée de dossier) ; dossier `server/storage/` hors de tout accès statique et ignoré par Git ; un envoi refusé ne laisse aucun fichier ; la clé de stockage n'est jamais renvoyée au navigateur (URL d'accès autorisée uniquement). Lecture réservée aux admins pour l'instant.
- **Cover / suppression** : la couverture n'est pas couverte par la cascade (sa clé étrangère est du côté formation) : suppression explicite. Un `deleteMany` avec `id: undefined` (qui aurait supprimé tous les médias) a été repéré et corrigé avant le premier test.
- **Édition d'une formation publiée** autorisée ; le statut ne change que par publier / retirer. Retirer de la publication garde les inscriptions et la progression.
- **Pas de slug ni d'ID visibles** : générés automatiquement à partir du titre (uniques).
- **Ordre** : boutons monter / descendre plutôt que glisser-déposer (plus simple et accessible).
- **En-tête admin** : ajout du bouton « Administration » ; « Mon espace » se réduit à son icône (avec info-bulle) pour les admins sur grand écran, point de bascule burger relevé à 1240 px, espacements compactés (mesure : contenu nécessaire 1246 px → 1200 px).
- Stockage à sauvegarder avec la base (P5-04) ; variable `STORAGE_DIR` documentée dans `.env.example`.

Tests effectués (vrai serveur + PostgreSQL + navigateur Edge piloté, **128/128** au total) :
- **API admin, 67/67** : anonyme → 401 et non-admin → 403 sur toutes les routes admin ; id mal formé → 404 ; validation stricte (statut, slug, champs inconnus rejetés) ; assainissement HTML (script, iframe, img, `onerror`, `onclick`, `javascript:`, style supprimés ; gras, liens sûrs, titres conservés) ; réordonnancement (permutation valide appliquée ; id manquant / en double / en trop / d'une autre formation refusés, état inchangé) ; envois hostiles (texte renommé `.png`, SVG, HTML, PDF en couverture → 415 ; image de 6 Mo → 413 ; aucun fichier résiduel) ; nom de fichier `../../../evil.png` neutralisé ; clé de stockage jamais exposée ; dossier de stockage non servi ; lecture des fichiers : admin 200, anonyme 401, non-admin 403 ; remplacement de couverture ; règles de publication (422 avec la liste des manques, publication, re-publication refusée si une exigence redevient manquante, dépublication) ; suppressions (cours → positions refermées et médias supprimés ; formation avec inscrits → 409 ; sans inscrits → 204 et fichiers supprimés sans toucher aux autres médias) ; aucun média ni fichier orphelin en fin de test.
- **Interface CMS, 39/39** (parcours d'une personne non technique, du début à la fin) : non-admin → « Accès refusé » et pas de lien Administration ; création (titre vide refusé) ; checklist et bouton Publier désactivé ; catégorie créée sur place ; faux fichier image refusé en langage simple ; couverture affichée via la route autorisée ; avertissement avant de quitter avec des modifications non enregistrées ; enregistrement confirmé ; texte riche (gras + liste) enregistré proprement ; PDF et vidéo attachés avec lecteur ; réordonnancement persistant ; publication puis liste (badge, nombre de cours, accès premium, miniature) ; dépublication ; suppression confirmée en nommant la formation ; base propre ensuite ; aucune erreur JS.
- **Non-régression** : suite Phase 1 « pages » 22/22, suite backend production 21/21, `npm run lint` sans avertissement, build réussi (site public 386 Ko, éditeur en chunk séparé).
- Défauts trouvés et corrigés pendant les tests : `deleteMany` dangereux (ci-dessus) ; barre d'outils de l'éditeur qui faisait perdre le curseur (comportement de la souris) ; en-tête admin trop large en français (bouton Déconnexion coupé) ; lien « Créer une catégorie » mal aligné.
- Limites : pas de test sur téléphone réel / Safari / Firefox ; vidéo testée avec un fichier MP4 minimal (détection du type et lecteur, pas de lecture d'un vrai film) ; pas de test avec un fichier de 300 Mo (limite configurée mais non éprouvée en charge) ; pas d'audit d'accessibilité au lecteur d'écran ; antivirus non branché (P5-03).
- `npm audit` : 0 nouvelle vulnérabilité (multer, file-type, sanitize-html, TipTap) ; les 4 « high » restantes sont celles du CLI Prisma (voir P1-08).

### P2-03 — Interface utilisateur E-Learning
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P2-02`
- Durée cible : 2 jours

Pages :
- Catalogue des formations.
- Détail d'une formation.
- Inscription.
- Liste des cours.
- Lecture d'un cours.
- Progression.
- État terminé / non terminé.
- Certification.

Périmètre retenu (frontière avec les tâches voisines) : P2-03 livre **toutes les pages** et les **routes serveur de lecture et d'inscription**. L'enregistrement de la progression (ouvrir / terminer un cours, règles de validation) reste **P2-04** ; la génération du certificat reste **P2-05** ; les URLs signées / durcissement des médias restent **P2-06**. Les pages affichent l'état de progression et de certification **lu en base** (0 % tant que P2-04 n'écrit rien) : aucune donnée fictive, aucun bouton « terminer » factice.

Réalisé — backend (`/api/learn/*`, toutes les routes exigent une session) :
- `GET /formations` (catalogue : formations **publiées** uniquement, avec indicateur « accessible » selon le niveau du compte et l'inscription éventuelle), `GET /formations/:slug` (détail : liste des cours avec titres, résumés, durées, obligatoire/bonus — **sans** contenu ni fichiers), `POST /formations/:slug/enroll`, `GET /formations/:slug/courses/:courseId` (contenu d'un cours), `GET /formations/:slug/cover`, `GET /media/:id` (fichiers de cours en streaming, Range supporté), `GET /enrollments` (mes formations).
- Règles d'accès décidées et appliquées **côté serveur** : visible = publiée **ou** déjà inscrit ; s'inscrire = publiée **et** niveau du compte ≥ niveau de la formation ; lire un cours / un fichier = inscrit **et** niveau (re-vérifié à chaque lecture : un compte qui perd le premium perd l'accès aux contenus premium). Une formation cachée ou inconnue répond **404** (jamais 403) pour ne rien révéler ; les 403 portent une raison (`not_enrolled`, `premium_required`) que l'interface traduit.
- Inscription **idempotente et sûre en concurrence** : 3 clics simultanés → une seule inscription (contrainte unique + relecture).
- Sérialiseurs à liste blanche (`serializers/learner.js`) : jamais de clé de stockage, d'auteur, ni de données d'un autre apprenant ; le contenu des cours n'apparaît qu'après contrôle d'inscription. `services/progress.service.js` calcule le résumé de progression (terminés / total / % / cours obligatoires restants) à partir des lignes stockées ; `services/mediaResponse.js` (partagé avec l'aperçu admin) envoie les fichiers avec type issu de la base, téléchargement forcé pour les documents et CSP sandbox.

Réalisé — frontend (pages chargées à la demande, derrière la garde de session) :
- `/catalogue` : cartes (couverture, catégorie, étiquette premium avec cadenas si non accessible, nombre de cours, progression si inscrit), recherche et filtre par catégorie, états chargement / vide / aucun résultat / erreur.
- `/catalogue/:slug` : détail, programme (numéro, résumé, durée, obligatoire / bonus, **terminé / non terminé**), panneau d'inscription (S'inscrire → Commencer / Continuer, ou explication premium), bloc **certification** (nom, description, règle, cours obligatoires restants, numéro et date une fois délivrée), avertissement si la formation a été retirée du catalogue.
- `/catalogue/:slug/cours/:courseId` : lecteur de cours (fil d'Ariane, plan latéral avec état de chaque cours, texte riche, lecteur vidéo, documents en téléchargement, images, précédent / suivant), messages clairs si non inscrit / premium requis / introuvable.
- `/compte/formations` (« Mes formations », nouvel onglet du compte) et tableau de bord alimenté par de vrais chiffres (formations en cours, certificats). Le bouton « Accéder au catalogue » de la page publique `/formations` mène au catalogue (connexion demandée, retour automatique).
- `RichContent` : affichage du texte riche **re-nettoyé côté navigateur** (DOMPurify, même liste blanche que le serveur) — sécurité en profondeur, réutilisable par les articles. Hook `useApi` (chargement / erreur / rechargement) réutilisable.
- Traductions fr / en / ar (63 clés + pluriels : deux formes pour fr / en, six formes pour l'arabe), RTL vérifié.

Décisions techniques :
- **Un apprenant inscrit garde l'accès à une formation retirée du catalogue** (comme annoncé dans le CMS et conservé dans P2-02) ; en revanche personne ne peut s'y inscrire à nouveau.
- **Formations réservées aux comptes connectés** (règle du cahier des charges) : le catalogue et les cours sont derrière la connexion ; la page publique `/formations` reste la vitrine.
- **Lecture des fichiers par l'apprenant** : construite ici (sinon le lecteur n'aurait pas de vidéo) avec contrôle d'inscription + niveau à chaque requête. Reste pour **P2-06** : URLs temporaires / signées, limitation d'abus, traçabilité des accès, tests de contournement approfondis. `controlsList="nodownload"` sur la vidéo est un confort d'affichage, **pas** une protection (rappel : un contenu affiché ne peut pas être empêché d'être capturé).
- Slug d'URL (issu du titre) pour les pages apprenant ; l'ID interne n'est jamais exposé pour les formations.
- Pourcentage = cours terminés / **tous** les cours (bonus inclus) ; P2-04 pourra affiner cette définition avec « cours obligatoires » (`requiredRemaining` est déjà calculé).

Tests effectués (vrai serveur + PostgreSQL + navigateur Edge piloté ; **97 nouveaux tests**, 246 au total avec la non-régression) :
- **API apprenant, 50/50** : anonyme → 401 partout ; catalogue sans brouillon ni fuite (contenu, clés de stockage, auteur, autres comptes) ; détail sans contenu avant inscription ; brouillon → 404 ; inscription : premium refusé à un compte standard (403), brouillon refusé, double clic inoffensif, **3 requêtes simultanées → une seule inscription** ; lecture : refusée avant inscription, cours d'une autre formation → 404 ; fichiers : vidéo 200 puis **Range 206**, PDF en téléchargement avec CSP sandbox, refus pour un non-inscrit, la couverture n'est pas un fichier de cours ; **perte du premium → accès premium refusé**, retour du premium → rétabli ; progression calculée depuis la base (1/3 = 33 %, 1 cours obligatoire restant), invisible pour un autre compte ; certificat visible seulement par son titulaire ; formation retirée : disparaît du catalogue, reste accessible aux inscrits, inscription impossible ; aucun résidu.
- **Parcours apprenant dans le navigateur, 47/47** : de la page publique → connexion demandée → retour au catalogue ; cartes, couvertures chargées, recherche, filtre catégorie ; formation premium et brouillon inaccessibles (message clair) ; détail, inscription, persistance après rechargement ; lecteur (texte riche, vidéo servie avec la session en 206, PDF, plan, précédent / suivant, dernier cours bonus) ; **HTML hostile injecté directement en base : rien ne s'exécute** (ni script, ni `onerror`, ni lien `javascript:`, ni iframe) ; progression 33 % / « Terminé » / « Continuer » ouvre le premier cours non terminé ; Mes formations et tableau de bord (vrais chiffres, états vides) ; formation retirée puis republiée ; arabe en RTL ; aucun débordement à 500 px ; aucune erreur JS.
- Non-régression : API admin 67/67, interface CMS 39/39, pages Phase 1 22/22, backend production 21/21, `npm run lint` sans avertissement, build réussi.
- Défauts trouvés et corrigés : styles partagés (lien « Retour », états vides) absents des pages apprenant car chargés seulement dans l'admin → importés par `Learn.css`. (Deux échecs de mon script de test — session partagée entre deux onglets — ne venaient pas de l'application.)
- Limites : pas de test sur téléphone réel / Safari / Firefox ; vidéo testée avec un MP4 minimal (le lecteur s'affiche et le flux est servi, pas de lecture d'un vrai film) ; la lecture de fichiers volumineux (centaines de Mo) n'est pas éprouvée en charge ; pas d'audit d'accessibilité au lecteur d'écran ; **aucun moyen d'enregistrer une progression n'existe encore** (P2-04) — les états « Terminé » ont été vérifiés en écrivant des lignes de test directement en base.
- `npm audit` : 0 nouvelle vulnérabilité (DOMPurify) ; les 4 « high » restantes sont celles du CLI Prisma.

### P2-04 — Suivi de progression
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P2-03`
- Durée cible : 2 jours

Tâches :
- Enregistrer l'ouverture / validation d'un cours.
- Marquer un cours comme terminé.
- Calculer le pourcentage de progression.
- Vérifier que tous les cours requis sont terminés.
- Empêcher une validation incohérente côté serveur.
- Afficher la progression à l'utilisateur.

Réalisé (aucune migration : le modèle de P2-01 suffisait) :
- `PUT /api/learn/formations/:slug/courses/:courseId/completion` (valider) et `DELETE` (annuler une validation faite par erreur). Mêmes règles d'accès que la lecture : inscrit **et** niveau suffisant, revérifié à chaque écriture (formation cachée → 404, non inscrit → 403 `not_enrolled`, premium perdu → 403 `premium_required`). La réponse renvoie l'état recalculé par le serveur (`completed` + résumé d'inscription) : le navigateur n'invente jamais un pourcentage.
- **Ouverture d'un cours** enregistrée par le serveur dans `getCourse` (au moment où le contenu est réellement servi, donc impossible à sauter ou falsifier) : ligne `course_progress` `in_progress`, idempotente (`createMany skipDuplicates`), ne rétrograde jamais un cours terminé.
- **Validations incohérentes refusées** : cours jamais ouvert → 409 `not_opened` ; cours d'une autre formation → 404 (et refusé de toute façon par les clés composites SQL) ; utilisateur non inscrit → 403.
- **Achèvement de la formation** : l'inscription passe à `completed` (avec `completedAt`) quand tous les cours **obligatoires** sont terminés ; les cours bonus comptent dans le pourcentage mais ne bloquent jamais. Annuler un cours obligatoire ramène l'inscription à `active` (date effacée) ; la date d'achèvement d'origine est conservée si on revalide après coup.
- **Concurrence** : chaque écriture s'exécute dans une transaction qui verrouille la ligne d'inscription (`SELECT … FOR UPDATE`), pour que deux validations simultanées des deux derniers cours ne ratent pas l'achèvement (chacune ne verrait sinon que sa propre modification).
- Interface : bloc « Votre progression » dans le lecteur (barre, bouton « Marquer comme terminé » / « Annuler la validation », message de félicitations quand la formation est terminée, erreur serveur affichée), plan latéral et pages formation / Mes formations / tableau de bord mis à jour ; textes fr/en/ar.

Décisions :
- Ouverture enregistrée à la lecture (et non par un appel séparé du navigateur) : c'est la seule preuve fiable que le contenu a été servi.
- Validation impossible sans ouverture préalable : c'est la règle « incohérente » retenue. Je n'impose **pas** un ordre séquentiel des cours (non demandé ; à discuter avec le client si besoin).
- Annulation permise tant qu'aucun certificat n'existe ; ensuite 409 `certified` (le certificat de P2-05 reste cohérent). P2-05 devra créer la certification dans la même transaction/verrou que la complétion.
- Pourcentage inchangé : cours terminés / tous les cours (bonus inclus).
- Si un administrateur ajoute plus tard un cours obligatoire à une formation déjà terminée par un apprenant, son inscription reste `completed` (il n'est pas dépossédé de son acquis) ; le résumé affichera néanmoins `requiredRemaining > 0`.

Tests effectués (vrai serveur + PostgreSQL + Edge piloté ; 54 nouveaux tests) :
- API 28/28 : 401 anonyme, ids invalides, non inscrit, cours jamais ouvert (409), cours d'une autre formation, ouverture idempotente, calculs (33 % / 67 % / 100 %), bonus qui ne termine pas la formation, idempotence de la validation, annulation, blocage une fois certifié, perte du premium, 6 paires de validations simultanées sans mise à jour perdue, requête SQL de cohérence (aucune inscription `completed` avec un cours obligatoire manquant), aucune donnée résiduelle.
- Navigateur 26/26 : inscription → lecteur → validation → 33 % sans rechargement → persistance après rechargement → félicitations → annulation → pages formation / Mes formations, refus serveur affiché (inscription supprimée en coulisse), arabe RTL, mobile 375 px sans débordement, thème sombre, aucune erreur JS.
- Limites : le test de concurrence n'a pas été rejoué sans le verrou pour prouver qu'il échouerait alors ; pas de test sur téléphone réel / Safari / Firefox.

### P2-05 — Certification
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P2-04`
- Durée cible : 2 jours

Tâches :
- Détecter la complétion de la formation.
- Générer la certification.
- Associer la certification à l'utilisateur et à la formation.
- Prévoir un identifiant unique / numéro de certificat.
- Permettre la consultation du certificat.
- Préparer une vérification de certificat si nécessaire.

### P2-06 — Protection des contenus E-Learning
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P2-03`
- Durée cible : 1 jour

Tâches :
- Stockage privé des médias.
- Ne jamais exposer directement les chemins de stockage sensibles.
- Vérification des permissions avant accès.
- URLs temporaires/signées pour les médias protégés si nécessaire.
- Contrôle des types et tailles de fichiers.
- Protection des endpoints médias.
- Limitation des accès non autorisés.

### P2-07 — Validation de fin de phase
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P2-05`, `P2-06`
- Durée cible : 1 jour

Critères :
- Le client peut créer une formation.
- Il peut définir ses cours.
- Un utilisateur peut suivre les cours.
- La progression est enregistrée côté serveur.
- La certification est délivrée uniquement lorsque les conditions sont remplies.
- Les contenus protégés ne sont pas publiquement accessibles.
- Les contrôles d'autorisation sont réalisés côté backend.

---

# PHASE 3 — BLOG + CMS CONTENU + NEWSLETTER
## Durée : 1 semaine
## Objectif

Mettre en place le système de contenus publics et sa gestion.

### P3-01 — Modèle de données blog
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P2-07`
- Durée cible : 1 jour

Entités :
- Article.
- Catégorie.
- Auteur.
- Tags.
- Statut de publication.
- Média.
- Métadonnées SEO si nécessaires.

### P3-02 — CMS simplifié
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P3-01`, `P2-02`
- Durée cible : 2 jours (1 jour attendu grâce à la base CMS de P2-02)

**Doit réutiliser la base CMS construite en P2-02** (coquille d'administration, liste de contenus, éditeur riche, envoi de médias, barre d'enregistrement, checklist et publication, routes `/api/admin/*`, assainissement HTML) : ne pas dupliquer ces briques. Seuls les champs propres aux articles (catégories/tags, SEO, prévisualisation publique) sont à ajouter. Si une brique de P2-02 est insuffisante pour les articles, l'améliorer dans la base plutôt que de la copier.

Fonctionnalités :
- Créer un article.
- Modifier un article.
- Prévisualiser.
- Publier / dépublier.
- Ajouter images.
- Ajouter vidéos / médias selon besoin.
- Catégoriser.
- Ajouter tags.
- Éditeur riche simple.

### P3-03 — Frontend blog
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P3-02`
- Durée cible : 1 jour

Pages :
- Liste des articles.
- Recherche / filtrage simple si prévu.
- Article complet.
- Articles recommandés.
- Catégories.

### P3-04 — Recommandation / visibilité selon profil
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P1-06`, `P3-03`
- Durée cible : 1 jour

Tâches :
- Identifier les contenus premium.
- Adapter les recommandations selon le type de compte.
- Masquer ou verrouiller les contenus nécessitant une autorisation.
- Ne pas se limiter à un contrôle frontend : vérifier les permissions côté serveur.

### P3-05 — Newsletter
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P3-02`
- Durée cible : 1 jour

Tâches :
- Inscription à la newsletter.
- Validation email si nécessaire.
- Gestion des abonnés.
- Désinscription.
- Préparation de l'envoi d'informations/articles.

---

# PHASE 4 — OUTILS
## Durée : 1 semaine
## Objectif

Livrer au minimum deux outils fonctionnels.

### P4-01 — Architecture commune des outils
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P3-05`
- Durée cible : 1 jour

Tâches :
- Page catalogue des outils.
- Système commun d'accès.
- Structure React réutilisable.
- API Express dédiée.
- Validation des entrées.
- Journalisation minimale des erreurs.

### P4-02 — Simulateur de crédit
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P4-01`
- Durée cible : 2 jours

Fonctionnement cible :
- Entrées liées au patrimoine / profil financier selon les règles fournies par le client.
- Traitement côté serveur.
- Calcul du crédit possible.
- Présentation des résultats pour plusieurs banques.
- Architecture permettant de modifier les règles de calcul sans réécrire toute l'application.

Important :
- Les règles bancaires et formules doivent être fournies/validées par le client.
- Ne pas inventer les critères ou taux des banques.

### P4-03 — Générateur de facture
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P4-01`
- Durée cible : 2 jours

Tâches :
- Formulaire des informations de facture.
- Client.
- Prestataire.
- Produits/services.
- Quantités.
- Prix.
- TVA si nécessaire selon les règles fournies.
- Numéro de facture.
- Date.
- Calcul des totaux.
- Génération PDF.
- Génération Excel.
- Vérification des données avant génération.

### P4-04 — Simulateur fiscalité
- Statut : `❌ todo`
- Priorité : `🟢 low`
- Dépendances : `P4-03`
- Durée cible : 0 jour dans le MVP

Décision :
- Ne pas planifier son développement dans les 8 semaines tant que le périmètre et les règles fiscales ne sont pas clairement définis.
- Peut être ajouté en V2 si le client fournit les règles et si le délai réel le permet.

### P4-05 — Validation de fin de phase
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P4-02`, `P4-03`
- Durée cible : 1 jour

Critères :
- Deux outils minimum sont utilisables.
- Les entrées sont validées côté serveur.
- Les résultats du simulateur sont cohérents avec les règles fournies.
- Les factures PDF et Excel sont générées correctement.
- Les outils respectent les règles d'accès utilisateur.

---

# PHASE 5 — SÉCURITÉ + DISPONIBILITÉ + TESTS + LIVRAISON
## Durée : 1 semaine
## Objectif

Durcir la plateforme et préparer une livraison exploitable.

### P5-01 — Audit d'authentification et autorisation
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P4-05`
- Durée cible : 1 jour

Vérifications :
- Authentification.
- Permissions.
- RBAC.
- Accès aux formations.
- Accès aux contenus premium.
- Accès aux médias.
- Accès admin.
- IDOR / accès à la ressource d'un autre utilisateur.
- Contrôle serveur systématique.

### P5-02 — Sécurité API et backend
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P5-01`
- Durée cible : 1 jour

Vérifications / mesures :
- Validation stricte des entrées.
- Protection contre injections.
- Rate limiting.
- CORS correctement configuré.
- Headers de sécurité.
- Gestion sécurisée des erreurs.
- Secrets uniquement via variables d'environnement.
- Limitation des données retournées par l'API.
- Protection des endpoints sensibles.

### P5-03 — Sécurité des fichiers et contenus
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P5-02`
- Durée cible : 1 jour

Mesures :
- Stockage privé des contenus propriétaires.
- Validation MIME + extension + taille.
- Renommage des fichiers uploadés.
- Contrôle des uploads.
- Accès aux médias par autorisation.
- URLs temporaires/signées lorsque pertinent.
- Pas de lien public permanent vers les contenus premium.
- Protection contre upload de fichiers dangereux.
- Vérification antivirus si disponible et nécessaire.
- Watermarking éventuel pour les contenus sensibles si validé par le client.

Limite :
- La plateforme peut empêcher le téléchargement direct et réduire l'exposition, mais ne peut pas empêcher totalement une capture d'écran, un enregistrement d'écran ou une copie manuelle d'un contenu visible.

### P5-04 — Disponibilité et sauvegardes
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P5-03`
- Durée cible : 1 jour

Tâches :
- HTTPS.
- Reverse proxy.
- Health check.
- Restart automatique du backend.
- Logs.
- Monitoring de base.
- Sauvegardes PostgreSQL.
- Vérification de restauration.
- Sauvegarde des contenus médias.
- Séparation des secrets et configurations.

### P5-05 — Tests fonctionnels et sécurité
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P5-04`
- Durée cible : 1 jour

Parcours minimum :
- Inscription → connexion → profil.
- Accès standard / premium.
- Création formation → inscription → cours → progression → certification.
- Création article → publication → consultation.
- Newsletter.
- Simulateur crédit.
- Génération facture PDF.
- Génération facture Excel.
- Tentative d'accès non autorisé aux contenus.
- Tentative d'accès direct à un média privé.
- Upload de fichiers invalides.
- Tests de validation API.

### P5-06 — Préparation production et livraison
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P5-05`
- Durée cible : 1 jour

Tâches :
- Configuration production.
- Build frontend.
- Déploiement backend.
- Déploiement frontend.
- Migration PostgreSQL.
- Variables d'environnement production.
- Vérification HTTPS.
- Vérification des sauvegardes.
- Smoke tests.
- Documentation courte d'exploitation.
- Documentation des comptes / rôles / accès administrateur.

---

# 4. Fonctionnalités volontairement hors MVP 8 semaines

Ces éléments ne doivent pas être développés avant les fonctionnalités prioritaires :

- Simulateur fiscal complet.
- Système de recommandation complexe basé sur IA.
- Application mobile.
- Streaming vidéo propriétaire complexe.
- DRM complet.
- Analytics avancées.
- Système social / commentaires complexe.
- Marketplace.
- Paiement complexe si non indispensable au MVP.
- Automatisations marketing avancées.
- Multi-langue avancé si non prévu dans les pages initiales.

---

# 5. Règles de sécurité du projet

Claude Code doit considérer les règles suivantes comme obligatoires :

1. Toute autorisation doit être vérifiée côté backend.
2. Ne jamais considérer une restriction React comme une mesure de sécurité.
3. Ne jamais exposer les secrets dans le frontend.
4. Ne jamais exposer publiquement les chemins privés des médias.
5. Les contenus premium doivent être protégés au niveau API et stockage.
6. Les IDs reçus par l'API doivent être vérifiés contre l'utilisateur connecté et ses permissions.
7. Les uploads doivent être validés.
8. Les erreurs de production ne doivent pas exposer de stack trace ou secret.
9. Les endpoints sensibles doivent être protégés contre l'abus.
10. Les données personnelles doivent être limitées aux informations réellement nécessaires.
11. Les sauvegardes doivent être testées, pas seulement configurées.
12. Toute fonctionnalité de contenu doit prendre en compte la propriété intellectuelle.

---

# 6. Critères généraux de qualité

Une tâche ne peut passer à `✅ done` que si :

- le code est réellement implémenté ;
- les dépendances sont respectées ;
- le frontend fonctionne ;
- le backend fonctionne lorsque concerné ;
- les erreurs principales sont gérées ;
- les permissions sont vérifiées lorsque concerné ;
- aucune fonctionnalité critique n'est laissée en TODO ;
- un test manuel ou automatisé pertinent a été effectué ;
- les fichiers de suivi sont mis à jour.

Règle ajoutée le 2026-09-18 (voir P1-10) : toute nouvelle page ou tout nouveau composant texte, à partir de maintenant, doit utiliser `useTranslation()`/`t()` (i18next) dès sa création — jamais de texte en dur. Les traductions français/anglais/arabe correspondantes doivent être ajoutées dans le même changement (le tamazight reste volontairement en repli vers le français). Les couleurs doivent utiliser les tokens CSS existants (`index.css`), pas de couleurs codées en dur, pour rester compatibles avec le mode clair/sombre. Les icônes sont des composants `lucide-react` (jamais d'emoji ni de caractère décoratif) ; les flèches directionnelles utilisent la classe `icon-dir` pour s'inverser en RTL.

# 7. État actuel

Phase active : `PHASE 2` (la Phase 1 a été validée le 2026-09-19, voir P1-08)

Dernières tâches terminées et vérifiées :
`P2-04 — Suivi de progression`, `P2-03 — Interface utilisateur E-Learning`, `P2-02 — Gestion des formations côté admin (CMS)`, `P2-01 — Modèle de données E-Learning`, `P1-08 — Validation de fin de phase` (Phase 1 validée), `P1-07 — Intégration frontend/backend`, `P1-11 — Refonte visuelle du frontend`, `P1-06 — Authentification + rôles`, `P1-05 — Backend minimal et navigation dynamique`, `P1-09 — Mode clair / sombre`, `P1-10 — Internationalisation (i18n)` (toutes ✅ done)

Toutes les tâches de pages (P1-02, P1-03, P1-04), le socle backend (P1-05) et les deux ajouts signalés par l'utilisateur (mode clair/sombre, i18n FR/EN/AR + tamazight en repli) sont terminés. Le modèle `User` existe en base (Prisma).

Prochaines tâches réalisables (dépendances satisfaites) :
- `P2-05 — Certification` (dépend de `P2-04` ✅).
- `P2-06 — Protection des contenus E-Learning` (dépend de `P2-03` ✅ ; peut se faire avant ou après P2-04/P2-05).

Recommandation : `P2-05` (certificat), puis `P2-06` et `P2-07`. Points d'attention :
- P2-05 : la complétion est déjà détectée (`enrollment.status = completed`, `completedAt`) dans `services/progress.service.js` (`completeCourse`, sous verrou de ligne). Générer la certification (numéro non séquentiel, nom du titulaire et titre copiés) **dans cette même transaction** ; `reopenCourse` refuse déjà (409 `certified`) toute annulation une fois le certificat émis. Afficher/consulter le certificat (le bloc certification de la page formation lit déjà `enrollment.certification`).
- P2-06 s'appuie sur l'existant : `learn.controller.js#getMedia` contrôle déjà inscription + niveau ; il reste à ajouter URLs temporaires / signées, limitation d'abus, traçabilité et tests de contournement.
- Rappel : `npx prisma generate` après chaque migration (voir P1-08).

Blocages / informations manquantes signalées (non bloquantes pour continuer, mais à ne pas oublier avant livraison) :
- Mentions légales et politique de confidentialité : identité légale du client (raison sociale, SIRET, adresse, hébergeur, contact DPO) à fournir avant mise en production (voir notes P1-03).
- Formulaire de contact : aucune coordonnée réelle (email/téléphone/adresse) fournie — non affichée pour éviter de publier une information inventée.
- Fournisseur d'email non défini : « mot de passe oublié » reste inactif et les messages du formulaire de contact ne sont que stockés en base (voir P1-07). À choisir avant la newsletter (P3-05) et la mise en production.
- Simulateur de crédit (P4-02) : règles bancaires/taux à fournir par le client le moment venu — rappel déjà noté dans la tâche elle-même.

Point de vérification manuelle recommandé pour l'utilisateur : ouvrir `http://localhost:5173` après `npm run dev` dans `client/` et tester le menu mobile sous 860px de large (non vérifié visuellement par Claude faute d'outil navigateur dans cette session).

Objectif final :
Livrer un MVP exploitable de la plateforme dans un délai maximal de **8 semaines**, en respectant l'ordre :
**Frontend principal → E-Learning → Blog/CMS/Newsletter → Outils → Sécurité/Tests/Livraison**.

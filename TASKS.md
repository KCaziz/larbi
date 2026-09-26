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

Note du 2026-09-19 : deux ajouts demandés par le client (assistant guidé `P3-07`, paiement `P3-08` à `P3-10`) allongent la Phase 3 d'environ une semaine si tout est conservé dans le délai initial ; le détail et les arbitrages possibles sont dans « Impact sur le délai », après `P3-10`.

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

Vérification complémentaire (2026-09-19, reprise après interruption de la session initiale) — P2-04 confirmée terminée après 2 corrections :
- **Défaut corrigé 1 — date d'achèvement écrasée** : annuler un cours *bonus* d'une formation déjà terminée remettait `completedAt` à « maintenant » (le recalcul de statut ne conservait pas la date d'origine, contrairement à ce que dit la décision ci-dessus). `syncEnrollmentStatus` conserve désormais la date tant que l'inscription reste terminée.
- **Défaut corrigé 2 — formation composée uniquement de cours bonus** : elle passait « terminée » dès le premier cours (0 cours obligatoire = « rien à faire »). Règle retenue : sans aucun cours obligatoire, la formation est terminée quand **tous** ses cours le sont. **À valider avec le client** (règle métier non précisée par le cahier des charges) ; en pratique un formateur devrait garder au moins un cours obligatoire.
- **Message de refus précis** dans le lecteur : refus d'inscription / de niveau premium affichés avec les textes dédiés au lieu du message générique « accès refusé ».
- **Concurrence prouvée** : verrou `FOR UPDATE` désactivé temporairement → la complétion est perdue **8 fois sur 8** (deux validations simultanées des deux derniers cours) ; avec le verrou → **0 sur 8**. La limite « non rejouée sans le verrou » ci-dessus est donc levée.
- Nouveaux tests (vrai serveur + PostgreSQL + Chrome piloté par le protocole DevTools) : API progression **45/45**, parcours navigateur **29/29** (fr, sombre, arabe RTL, mobile 375 px, aucune erreur JS), balayage de **192 pages** (16 publiques, 9 apprenant, admin + chaque étape de l'éditeur ; fr / en / ar / tzm ; 1280 px et 375 px) sans erreur JS, débordement, clé de traduction brute ni erreur HTTP inattendue, contrôle d'accès **67/67** (chaque route admin : anonyme 401 / apprenant 403 ; jetons falsifiés, expirés, `alg=none`, compte supprimé ou rétrogradé ; injection de `role` / `accessLevel` refusée ; aucune trace d'erreur en production).
- Limites : les scripts de test sont jetables (non versionnés) ; Chrome uniquement (pas Safari / Firefox / téléphone réel).

### P2-05 — Certification
- Statut : `✅ done`
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

Réalisé (migration `certification_title` : colonne `certificationTitle` nullable dans `certifications`) :
- **Émission automatique** : `completeCourse` (`services/progress.service.js`) appelle `issueCertificateIfEligible` dans la **même transaction et sous le même verrou de ligne** que le calcul d'achèvement. La certification est créée quand, et seulement quand : la formation délivre une certification (`certificationEnabled`), l'inscription est `completed` et tous les cours obligatoires **actuels** sont terminés (aucun cours obligatoire : tous les cours). Idempotent : un certificat existant est renvoyé tel quel.
- **Numéro** `LARBI-XXXX-XXXX-XXXX` : 12 caractères tirés avec `crypto.randomInt` dans un alphabet de 32 signes sans ambiguïté (ni 0/O ni 1/I) → 60 bits, non séquentiel, non devinable ; unicité contrôlée avant insertion (une violation d'unicité annulerait la transaction en cours).
- **Association** : la certification est liée à l'inscription (unique), donc à l'utilisateur et à la formation ; nom du titulaire, titre de la formation et nom de la certification sont **copiés** au moment de l'émission.
- **API apprenant** (session requise) : `GET /api/learn/formations/:slug/certificate` (mon certificat), `GET /api/learn/certificates` (mes certificats), `POST /api/learn/formations/:slug/certificate` (« obtenir » le certificat d'une formation terminée avant que la certification soit activée ; idempotent, 201 / 200 ; 409 `not_completed` ou `certification_disabled`).
- **API publique de vérification** : `GET /api/certificates/:number` — sans compte ; le format est contrôlé avant tout accès à la base, un numéro inconnu et un numéro mal formé répondent le même 404 ; limitée à 30 requêtes/minute/IP (`CERTIFICATE_RATE_LIMIT`) ; jamais mise en cache ; ne renvoie que titulaire, certification, formation, date et numéro (liste blanche distincte de la vue du titulaire).
- **Interface** (fr / en / ar, RTL) : page du certificat `/catalogue/:slug/certificat` (feuille prête à imprimer, bouton « Imprimer ou enregistrer en PDF »), « Mes certificats » `/compte/certificats` (nouvel onglet du compte), vérification publique `/verification` et `/verification/:number` (lien dans le pied de page), boutons « Voir / Obtenir mon certificat » dans la page formation, message + lien dans le lecteur dès l'émission (le bouton « Annuler » est remplacé par une explication), badge « Certificat obtenu » sur les cartes.

Décisions :
- **Pas de bibliothèque PDF** : le PDF est produit par le navigateur (« Enregistrer au format PDF »), la feuille de style d'impression ne garde que le certificat (A4 paysage). Aucune dépendance ajoutée, texte réel dans le PDF. Limite : rendu dépendant du navigateur, aucune signature numérique (aucune valeur légale n'est revendiquée).
- **Contenu du certificat** : aucune mention d'organisme émetteur, de signature, de logo ni de texte juridique autre que le nom de la plateforme — ces informations n'ont pas été fournies (à ajouter si le client les donne).
- **Vérification publique = nom complet du titulaire visible** par toute personne qui détient le numéro (indispensable pour vérifier ; le numéro n'est pas devinable). **À valider avec le client** et à mentionner dans la politique de confidentialité quand les textes légaux seront fournis.
- **Le certificat reste valide et identique** si le compte ou la formation est renommé, si la certification est désactivée ensuite ou si un cours obligatoire est ajouté. Supprimer le compte supprime le certificat (droit à l'effacement) : il devient invérifiable.
- **Accès** : émettre un certificat exige le niveau d'accès actuel (comme lire le cours) ; consulter un certificat déjà obtenu n'exige pas le premium (c'est un acquis du titulaire, pas un contenu premium).
- **Cours obligatoire ajouté après coup** : l'inscription reste `completed` (décision P2-04) mais un certificat pas encore émis ne l'est pas tant que le nouveau cours obligatoire n'est pas terminé.
- **Pas de révocation** d'un certificat par l'administrateur (non demandée) : à ajouter si le client le souhaite.
- Couleurs : jetons `--paper-*` (index.css) volontairement **non redéfinis en mode sombre** : la feuille reste claire, elle est faite pour le papier.

Tests effectués (vrai serveur + PostgreSQL + Chrome piloté par le protocole DevTools) :
- **API 62/62** : format et unicité de 20 000 numéros générés ; anonyme → 401 ; aucune émission avant la fin (409, aucune ligne créée), le bonus seul n'émet pas ; émission à la dernière validation (lignes, copies du nom et des titres, inscription `completed`) ; idempotence (revalider, réclamer) ; annulation refusée une fois certifié ; le titulaire seul lit son certificat (autre utilisateur → 404, aucune fuite d'e-mail ni d'identifiant) ; vérification publique (champs, `no-store`, numéro tapé en minuscules accepté, 7 entrées hostiles ou mal formées → 404 identique) ; renommages, désactivation de la certification et cours obligatoire ajouté après coup sans effet sur un certificat émis ; certification activée après coup → « obtenir » ; formation uniquement bonus ; premium perdu (consultation possible, nouvelle émission refusée) ; suppression du compte → certificat invérifiable ; **concurrence : 8 tours de deux dernières validations simultanées → exactement 1 certificat à chaque fois, 6 demandes simultanées → 1 création + 5 lectures**.
- **Test témoin** : verrou de ligne désactivé temporairement → les tests de concurrence échouent (8 tours sur 8 faux) ; avec le verrou → 0 échec.
- **Navigateur 41/41** : parcours complet du lecteur au certificat, contenu de la feuille, numéro identique à la base, rendu d'**impression** (en-tête, pied de page et barre d'actions masqués) et **export PDF réel d'exactement une page**, page formation, « Mes formations », « Mes certificats », vérification publique déconnecté (valide, inconnu, format invalide sans requête, numéro en minuscules), lien du pied de page, formation dont la certification est activée après coup, feuille toujours claire en thème sombre, arabe RTL, mobile 375 px sans débordement, aucune erreur JS.
- **Balayage de 216 pages** (dont les nouvelles ; fr / en / ar / tzm ; 1280 et 375 px) sans erreur JS, débordement, clé brute ni erreur HTTP inattendue ; **sécurité 67/67** en mode production ; limitation de débit vérifiée sur une instance dédiée (5 requêtes puis 429) ; suite P2-04 45/45 (adaptée : ses formations n'ont pas de certification pour continuer à tester l'annulation) ; lint et build sans erreur, 476 références de traduction sans manque.
- Limites : Chrome uniquement (impression testée par émulation du média `print` et export PDF, pas d'imprimante réelle) ; les scripts de test sont jetables (non versionnés) ; pas de test de charge sur la vérification publique ; pas de QR code (le lien de vérification est imprimé en toutes lettres).

### P2-06 — Protection des contenus E-Learning
- Statut : `✅ done`
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

Démarche : l'essentiel existait déjà (P2-02 / P2-03 : stockage hors de tout dossier statique, clés jamais sérialisées, contrôle inscription + niveau à chaque requête, type réel lu dans le contenu, limites de taille). P2-06 a donc consisté à **attaquer** ces protections avec un test dédié (87 vérifications sur le vrai serveur, la vraie base et le vrai disque, fichiers envoyés par l'API admin), puis à corriger ce qu'il a révélé.

Réalisé (corrections issues des attaques) :
- **Existence non révélée** : un fichier d'une formation non publiée, demandé par quelqu'un qui n'y est pas inscrit, répondait 403 (« non inscrit ») donc confirmait l'existence de l'identifiant ; il répond maintenant **404**, comme un identifiant inconnu (même règle que pour les formations).
- **Plage `Range` impossible** : répondait 404 « fichier introuvable » ; répond maintenant **416** avec la taille réelle (`services/mediaResponse.js`).
- **Limitation des accès non autorisés** (`middleware/rateLimit.js`, clé = **compte**, pas l'adresse IP, pour ne jamais pénaliser un voisin de réseau) : (1) *refus* — 30 requêtes refusées ou en erreur par 10 minutes → 429 (les requêtes réussies ne comptent pas, un usage normal n'est jamais touché ; `MEDIA_DENIED_LIMIT`) ; (2) *volume* — 300 requêtes/minute sur les fichiers et couvertures → 429, contre le téléchargement en masse par script (`MEDIA_RATE_LIMIT`). Le blocage d'un compte n'affecte pas les autres. Les couvertures (images marketing visibles de tout utilisateur connecté) ne sont soumises qu'à la limite de volume, pour qu'un catalogue avec des images cassées ne bloque jamais la lecture d'un cours.
- **Traçabilité** (`utils/securityLog.js`) : une ligne JSON par événement sensible — `media_access_denied` (compte, fichier, raison) et `media_probing_blocked` (compte, une fois par blocage). Uniquement des identifiants : ni nom de fichier, ni clé de stockage, ni e-mail.

Constaté déjà correct (aucun changement nécessaire, prouvé par les tests) :
- **Stockage privé** : noms aléatoires (32 hexadécimaux + extension du type *détecté*), dossier non servi (11 chemins d'accès direct testés, dont `..` et `%2e%2e` → 404), ignoré par Git, aucune clé ni chemin dans **aucune** réponse JSON (catalogue, détail, cours, admin, envois, erreurs).
- **Permissions à chaque requête** : anonyme 401, non inscrit 403, inscrit 200 avec les octets exacts, autre formation 403, couverture ≠ fichier de cours (404), premium perdu → 403 immédiat puis rétabli → 200, désinscription → 403 à la requête suivante, jeton falsifié / compte inconnu → 401, `HEAD` soumis aux mêmes règles, requête conditionnelle (`If-None-Match`) d'un non autorisé → 403 (jamais 304), route admin réservée aux administrateurs.
- **Envois hostiles refusés (415/413/400, aucun résidu sur disque)** : texte renommé `.png`, HTML, SVG avec script, exécutable Windows, ZIP renommé `.pdf`, fichier vide, PHP avec type image, PDF comme couverture, mauvais nom de champ, deux fichiers dans une requête, image de 6 Mo, requête sans fichier ; nom `../../evil.png` neutralisé ; un fichier polyglotte (PNG + script) est stocké comme simple image et servi `image/png` + `nosniff` + CSP `sandbox` (il ne peut rien exécuter). Un envoi **interrompu** en cours de route ne laisse aucun fichier temporaire.
- **En-têtes des fichiers** : type issu de notre base, PDF forcé en téléchargement, `X-Content-Type-Options: nosniff`, CSP `sandbox`, `Cache-Control: private, no-store`, `Cross-Origin-Resource-Policy: same-origin`, aucune autorisation CORS pour une origine étrangère.

Décisions :
- **URLs signées / temporaires : non nécessaires ici, volontairement non ajoutées.** Le cahier des charges dit « si nécessaire ». Les fichiers sont servis sur la même origine avec le cookie de session (`HttpOnly`, `SameSite=Lax`) : une adresse copiée-collée ne fonctionne pas sans session, ce qui est **plus strict** qu'une adresse signée (utilisable par quiconque la possède pendant sa durée de vie). Une adresse signée ne devient utile qu'avec un CDN ou un stockage objet (S3…) qui ne peut pas recevoir le cookie : à traiter en P5-06 si l'hébergement le impose. Le point d'entrée est unique (`getMedia` + `sendStoredMedia`), le changement sera localisé.
- **Couvertures mises en cache 5 min** (`private, max-age=300`) : un navigateur peut resservir une couverture (image marketing) pendant 5 minutes après une déconnexion. Accepté (faible sensibilité, gain de performance du catalogue). Les fichiers de cours, eux, sont `no-store`.
- **Limiteurs en mémoire, par processus** : suffisant pour un seul serveur ; plusieurs instances demanderaient un stockage partagé (à voir en P5-06).
- **Aucune purge planifiée des fichiers temporaires** : inutile, l'envoi interrompu est nettoyé par le serveur (vérifié : un fichier temporaire existe pendant l'envoi, aucun après).
- `controlsList="nodownload"` sur la vidéo reste un confort d'affichage, **pas** une protection : un apprenant autorisé peut toujours enregistrer ce qu'il voit.

Tests effectués : **87/87** en développement et **84/84** en mode production (la différence = 3 vérifications de journal) ; limite de volume sur instance dédiée (6 requêtes servies puis 429, un autre apprenant non affecté, les couvertures partagent la limite) ; limites de taille sur instance dédiée à seuils réduits par variables d'environnement (image 1 000 o, document 1 500 o, vidéo 2 500 o → 413 partout, aucun résidu, fichiers juste sous la limite acceptés) ; envoi interrompu ; suites P2-04 (45/45) et P2-05 (62/62) rejouées sans régression.
- Défauts trouvés par ces tests : 404 au lieu de 416 sur plage impossible, existence des fichiers d'une formation brouillon révélée (403), sondage illimité des identifiants. Les autres écarts observés pendant la mise au point venaient du script de test (trace d'erreur du mode développement, cache navigateur, normalisation d'URL).
- Limites : fichiers de test très petits (une vidéo de 300 Mo n'a pas été envoyée : la limite est éprouvée avec des seuils réduits) ; pas d'antivirus ni d'analyse du contenu des PDF (P5-03) ; pas de test de montée en charge des limiteurs.

### P2-07 — Validation de fin de phase
- Statut : `✅ done`
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

Validation effectuée le 2026-09-19 — **Phase 2 validée** (parcours complet dans un vrai Chrome + suites d'API, 477 vérifications automatisées et un balayage de 216 pages, tout au vert). Le parcours de bout en bout ne prépare que le compte administrateur ; **tout le reste passe par l'interface réelle** (formulaires, envois de fichiers), avec lecture de la base pour vérifier ce que le serveur a réellement enregistré.

1. **Le client peut créer une formation** (interface d'administration, 72/72 avec le point 2 à 7) : connexion par le formulaire ; « Nouvelle formation » avec le seul titre (titre vide refusé en langage simple) ; description ; catégorie créée sur place ; **faux fichier image refusé avec un message compréhensible** ; couverture (PNG réel) affichée ; avertissement « modifications non enregistrées » puis confirmation ; nom de la certification ; publication. Une formation incomplète : bouton « Publier » désactivé **et** publication forcée directement auprès du serveur → 422, elle reste brouillon.
2. **Il peut définir ses cours** : 3 cours (texte riche, résumé, durée, vidéo MP4 et PDF envoyés, un cours facultatif) enregistrés et retrouvés en base ; ordre modifié avec « Monter ce cours » puis rétabli, persistant côté serveur.
3. **Un utilisateur peut suivre les cours** : création de compte par le formulaire d'inscription (compte simple : rôle `user`, niveau standard) ; catalogue (couverture chargée, brouillon absent) ; inscription ; leçon avec texte, **vidéo servie par la route protégée (200 / 206)** et PDF téléchargeable.
4. **La progression est enregistrée côté serveur** : ouverture et validation lues en base ; puis **cookies et stockage du navigateur effacés**, nouvelle connexion : la progression (33 %, « 1 sur 3 ») revient du serveur ; annulation refusée (409) une fois certifié.
5. **La certification n'est délivrée que si les conditions sont remplies** : aucun certificat après 1 cours obligatoire sur 2 (contrôlé en base) ; **exactement un** certificat à la dernière validation obligatoire (le cours facultatif n'est pas exigé), nom du titulaire copié, inscription `completed` ; page du certificat et vérification publique déconnecté. Détail des cas limites en P2-05 (62/62 : concurrence, certification activée après coup, cours ajouté après coup, premium perdu…).
6. **Les contenus protégés ne sont pas publiquement accessibles** : anonyme → 401 sur la vidéo **et** sur la couverture (requête forcée hors cache navigateur) ; un compte connecté mais **non inscrit** → 403, message clair, aucun lecteur vidéo ; adresse d'un fichier du dossier de stockage → 404 (serveur d'API) et jamais les octets du fichier (serveur de développement du site) ; un anonyme qui ouvre l'adresse d'un cours est renvoyé vers la connexion ; certificat d'un autre utilisateur → 404. En plus, 87 attaques ciblées (P2-06).
7. **Les contrôles d'autorisation sont faits côté backend** : **audit automatique de toutes les routes réellement enregistrées dans Express (38)** — 7 sont publiques volontairement (santé, inscription, connexion, déconnexion, formulaire de contact, types de compte, vérification d'un certificat), les 31 autres exigent une session (401 sinon), et les 18 routes d'administration répondent 401 à un anonyme, **403 à un apprenant**, 200/4xx métier à un administrateur. Toute route ajoutée plus tard sera contrôlée par le même audit. Dans le navigateur, un non-administrateur voit « Accès refusé » et **5 opérations d'administration tentées directement contre l'API** (lister, retirer de la publication, supprimer, lire un fichier, modifier) sont refusées (403) sans rien modifier. Suite sécurité 67/67 en mode production : jetons falsifiés / expirés / `alg=none`, compte supprimé ou rétrogradé, tentatives d'élévation de privilèges, aucune trace d'erreur.

Autres contrôles :
- **Migrations depuis une base vierge** : les 5 migrations s'appliquent (`migrate deploy`), schéma « à jour », 10 tables, **aucune dérive** entre l'historique de migrations et `schema.prisma` (`migrate diff` : aucune différence) ; base temporaire supprimée.
- **Non-régression** : API P2-04 45/45, P2-05 62/62, P2-06 87/87 (84/84 en production) ; navigateur P2-04 29/29, P2-05 41/41 ; balayage de **216 pages** (fr / en / ar / tzm, 1280 et 375 px, anonyme / apprenant / administrateur, chaque étape de l'éditeur) sans erreur JS, débordement, clé de traduction brute ni erreur HTTP inattendue.
- **Hygiène** : `npm run lint` sans avertissement, build réussi, parité i18n **536 clés × 3 langues**, aucun secret (`JWT_SECRET`, mot de passe de base) dans le build du site, aucun `.env` ni fichier de stockage suivi par Git, `npm audit` client : 0, aucun résidu de test en base ni sur disque.

Défauts trouvés puis corrigés pendant la fin de Phase 2 (déjà détaillés dans P2-04, P2-05, P2-06) : date d'achèvement écrasée à l'annulation d'un cours facultatif ; formation uniquement facultative « terminée » au premier cours ; message de refus trop générique ; existence des fichiers d'une formation brouillon révélée (403 au lieu de 404) ; plage `Range` impossible en 404 au lieu de 416 ; sondage illimité des identifiants de fichiers. Côté environnement de développement : dépendances non installées (police du site, paquets du serveur), base de développement sans les 3 dernières migrations, `JWT_SECRET` absent du `.env` local — le README indique désormais comment générer le secret.

Constats non bloquants et décisions à valider avec le client :
- **Règle « formation sans cours obligatoire »** : terminée seulement quand tous les cours le sont (règle non précisée par le cahier des charges, voir P2-04).
- **Vérification publique d'un certificat** : le nom complet du titulaire est visible par qui détient le numéro ; à mentionner dans la politique de confidentialité (textes légaux du client toujours attendus) ; le certificat ne porte ni organisme émetteur, ni signature, ni logo (informations non fournies) ; pas de révocation par l'administrateur (voir P2-05).
- **Couvertures en cache 5 min**, limiteurs de débit **en mémoire** (un seul serveur), URLs signées non nécessaires en l'état (voir P2-06) : à réexaminer en P5-06 selon l'hébergement retenu (CDN, stockage objet, plusieurs instances).
- **`npm audit` serveur : 4 « high »** toujours dans le CLI Prisma (jamais chargé par l'API en exécution) ; inchangé depuis P1-08.
- **Aucune suite de tests automatisés n'est conservée dans le dépôt** (une dizaine de scripts de validation, écrits pour cette phase, vivent hors du projet) : à formaliser en P5-05 ; en attendant, ce rapport est la trace des vérifications.
- **Non testé** : Safari, Firefox, téléphone réel ; vidéos longues réelles (fichiers de test minuscules, limites de taille éprouvées avec des seuils réduits) ; accessibilité au lecteur d'écran ; montée en charge.

---

# PHASE 3 — BLOG + CMS CONTENU + NEWSLETTER
## Durée : 1 semaine
## Objectif

Mettre en place le système de contenus publics et sa gestion.

### P3-01 — Modèle de données blog
- Statut : `✅ done`
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

Réalisé (migration `blog_model` ; modèle uniquement, les routes sont en P3-02 / P3-03) :
- Tables `articles`, `article_categories`, `tags`, `article_tags` et colonne `articleId` sur `media`. Un article a : titre, adresse publique (slug) unique, résumé, corps HTML assaini, **copie en texte brut** du corps, statut, date de publication, catégorie, image de couverture, auteur, titre et description SEO (facultatifs).
- Intégrité garantie par PostgreSQL (mêmes principes que P2-01) : statut `draft`/`published` **toujours cohérent avec la date de publication**, titre non vide, adresses (articles, catégories, mots-clés) limitées à `[a-z0-9]` séparés par des tirets et 80 caractères, **un fichier appartient à une leçon OU à un article, jamais aux deux**.

Décisions techniques :
- **Catégories d'articles séparées de celles des formations** (domaines différents, évolutions indépendantes). Mots-clés (« tags ») partagés entre articles ; identité par adresse : « TVA » et « tva » sont le même mot-clé. Un mot-clé sans lettre latine (arabe…) reçoit une adresse stable `t-<empreinte>` au lieu de fusionner avec tous les autres.
- **`bodyText`** (texte brut dérivé du corps) sert à la recherche et au temps de lecture : évite d'analyser du HTML à chaque requête. Le test de cohérence vérifie qu'il correspond toujours au corps.
- **Suppression du compte de l'auteur** : l'article est conservé, sans nom d'auteur (droit à l'effacement). Suppression d'une catégorie / d'un mot-clé / d'une couverture : l'article reste, détaché.
- **Médias** : même stockage privé que les formations (couverture + fichiers joints). Les images « dans le texte » ne sont pas prévues : l'assainisseur refuse `<img>` par sécurité, les images et vidéos s'affichent **sous le texte** (amélioration possible plus tard avec une liste blanche d'adresses).
- **Pas de niveau d'accès (premium) ni de langue par article** : le premium est l'objet de P3-04 (migration additive à ce moment-là) ; comme les formations, le contenu est dans une seule langue (règle i18n, section 6).

Tests : contraintes et suppressions vérifiées directement en base (`tests/functional/database.test.js`, 14 vérifications dont les règles du blog) ; migrations rejouées depuis zéro et **aucune dérive** entre `schema.prisma` et l'historique (`tests/consistency/project.test.js`).

### P3-02 — CMS simplifié
- Statut : `✅ done`
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

Réalisé — backend (`/api/admin/articles…`, tout derrière `requireAuth` + `requireRole('admin')`, sur le routeur admin partagé) :
- Articles : liste, création (titre seul → brouillon), lecture, modification, publication / retrait, suppression (lignes **et fichiers**). Catégories d'articles (liste + création), suggestions de mots-clés existants, couverture (remplace et supprime l'ancienne) et fichiers joints (image, vidéo, PDF), lecture des fichiers réservée aux admins.
- Publication refusée côté serveur (422 + liste de ce qui manque) tant que titre, résumé, texte réel et image de couverture ne sont pas renseignés. La date de publication d'origine est conservée si on republie sans retirer.
- Texte assaini **côté serveur** à chaque enregistrement ; copie texte brut dérivée du texte assaini ; mots-clés nettoyés (espaces, doublons, 10 maximum) et **remplacés** (pas cumulés).

Réalisé — frontend (`/admin/articles`, chargé à la demande) :
- Liste des articles et éditeur en **5 étapes** : *Contenu* (titre, résumé, texte riche), *Images et médias* (couverture, fichiers), *Classement* (catégorie créable sur place, mots-clés saisis un par un ou collés « a, b, c », titre et description pour les moteurs de recherche), *Aperçu*, *Publication* (checklist, publier / retirer, lien « Voir sur le blog », suppression en zone séparée). Barre d'enregistrement, avertissement avant de quitter avec des modifications non enregistrées, tout traduit fr / en / ar.
- **Aperçu = le même composant que la page publique** (`ArticleView`), alimenté par ce qui est à l'écran, enregistré ou non : ce que l'éditeur prévisualise EST ce qui sera publié.

**Réutilisation de la base CMS (règle de la tâche)** — aucune brique copiée, quatre briques de P2-02 généralisées et réutilisées par les formations ET les articles :
- `ContentList` (liste + création par le titre + états chargement / vide / erreur) : `FormationsListPage` en est devenue une simple configuration.
- `PublishPanel` (checklist, publier / retirer, zone de suppression) : `PublishStep` des formations en est un fin habillage.
- Serveur : `coverUploader` / `attachmentUploader` (couverture et fichiers joints pour formations, cours et articles) ; `ReadinessChecklist` et `StatusBadge` acceptent leurs propres libellés.
- Nouveau composant générique `TagInput` (mots-clés) ; styles du texte riche déplacés dans `RichContent.css` (utilisés aussi par le blog public) ; utilitaire `.sr-only` rendu global.

Décisions :
- **L'adresse publique (slug) est cachée aux éditeurs et ne change plus après la création** : renommer un article ne casse aucun lien partagé.
- Un article publié peut être modifié sans être retiré (comme les formations) ; les exigences ne sont revérifiées qu'à la prochaine publication.
- Limite de taille des requêtes d'administration portée à **1 Mo** (le texte accepte 200 000 caractères, jusqu'à 3 octets chacun) ; les routes publiques gardent 100 ko.
- Pas de planification de publication ni de versions d'un article (non demandé).

### P3-03 — Frontend blog
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P3-02`
- Durée cible : 1 jour

Pages :
- Liste des articles.
- Recherche / filtrage simple si prévu.
- Article complet.
- Articles recommandés.
- Catégories.

Réalisé — API publique (`/api/blog/*`, **sans session**, lecture seule, articles **publiés uniquement**) :
- Liste paginée (9 par page, 24 maximum) avec recherche et filtres, page d'un article (avec recommandations), catégories et mots-clés (seulement ceux qui ont au moins un article publié, avec leurs compteurs), couverture et fichiers joints (`/api/blog/articles/:slug/cover`, `/api/blog/media/:id`).
- **Un brouillon est indistinguable d'un article inexistant** (même 404) : page, couverture, fichiers, filtres, mots-clés, recherche, recommandations. Le retrait d'un article le fait disparaître de tout, immédiatement.
- Listes blanches de champs (`serializers/blog.js`) : ni identifiant, ni statut, ni e-mail de l'auteur (son nom seulement), ni clé de stockage.
- Limitation de débit 240 lectures/minute/adresse (`PUBLIC_READ_LIMIT`), validation stricte des paramètres (page, taille, filtres, longueur de la recherche : 400 sinon).

Réalisé — pages du site (fr / en / ar, RTL) :
- `/blog` : recherche, filtres par catégorie et par mot-clé (dans l'adresse : `?q=&category=&tag=&page=`, donc partageables), compteur de résultats, pagination, états chargement / vide / aucun résultat / erreur ; une adresse de filtre mal formée ne casse rien (elle ne renvoie aucun résultat).
- `/blog/:slug` : couverture, catégorie, auteur, date, temps de lecture, texte, fichiers (image, vidéo, PDF téléchargeable), mots-clés (liens vers la liste filtrée), « À lire aussi » (même catégorie d'abord, puis mots-clés communs, jamais l'article lui-même ni un brouillon, 3 maximum). Titre et description de l'onglet issus des champs SEO (à défaut le titre et le résumé), restaurés en quittant la page.

Décisions :
- **Recherche** dans le titre, le résumé, le texte et les mots-clés, insensible à la casse. **Prisma n'échappe pas les jokers `%` et `_`** dans `contains` (vérifié) : sans échappement, une recherche « % » aurait renvoyé tous les articles ; le serveur les traite comme des caractères ordinaires.
- **Fichiers publics mis en cache 5 min** (`public, max-age=300`) : un article retiré peut rester visible dans le cache d'un navigateur jusqu'à 5 minutes (le serveur, lui, répond aussitôt 404). Choix assumé (performance) ; les fichiers de formation, eux, restent `no-store`.
- **Référencement (SEO)** : le site est une application monopage, les balises sont posées par JavaScript. Les moteurs qui exécutent JavaScript (Google) les voient ; ceux qui ne l'exécutent pas voient les valeurs par défaut. Un rendu côté serveur est hors périmètre du MVP. Pas de plan de site (`sitemap.xml`) ni de balises de partage sociales : à envisager si le blog devient un canal d'acquisition.
- Pas de page dédiée par catégorie : les catégories et mots-clés sont des filtres de la liste. Tous les articles sont publics (contenus premium : P3-04).

**Tests (P3-02 + P3-03)** : API d'administration 30 vérifications, API publique 23 (dont recherche, pagination, brouillons, jokers, fichiers, retrait) ; parcours **dans un vrai navigateur** (20 vérifications) : un rédacteur se connecte, écrit un article (gras, résumé, couverture, PDF, catégorie créée sur place, mots-clés collés, SEO), vérifie l'aperçu avec ses modifications non enregistrées, publie ; puis un visiteur sans compte lit la liste, cherche, filtre, ouvre l'article (titre et description de l'onglet, téléchargement du PDF, recommandations), constate qu'un brouillon et une adresse inconnue donnent la même page « introuvable » ; une charge XSS enregistrée par un éditeur ne s'exécute pas ; le retrait le fait disparaître ; arabe RTL, mode sombre et mobile 375 px sans débordement ; aucune erreur JS.
- **Défauts trouvés par ces tests et corrigés** : le texte brut collait les blocs voisins (`<p>A</p><p>B</p>` → « AB », donc recherche et temps de lecture faux) ; il gardait les entités HTML (« R&D » stocké `R&amp;D` : la recherche « R&D » ne trouvait rien) ; un caractère nul dans un champ texte provoquait une **erreur 500** (voir P3-06) ; l'assistant de test a aussi révélé que la liste `/blog` et le titre de la bannière n'étaient pas alignés (corrigé).
- Limites : Chrome uniquement ; pas de test au lecteur d'écran ; vidéos de test minuscules.

### P3-04 — Recommandation / visibilité selon profil
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P1-06`, `P3-03`
- Durée cible : 1 jour

Tâches :
- Identifier les contenus premium.
- Adapter les recommandations selon le type de compte.
- Masquer ou verrouiller les contenus nécessitant une autorisation.
- Ne pas se limiter à un contrôle frontend : vérifier les permissions côté serveur.

Réalisé (migration additive `p3_profile_and_newsletter` : `articles.requiredAccessLevel` avec `CHECK`, `articles.targetAccountTypes` ; `prisma generate` fait) :
- **Contenus premium** : chaque article porte un niveau d'accès (`standard` par défaut, `premium`). Règle appliquée **par le serveur** (`services/blogAccess.js`, une seule source de vérité) : standard → tout le monde ; premium → compte premium (un administrateur lit toujours). Le niveau est relu en base à chaque requête : perdre le premium retire l'accès immédiatement, avec la même session.
- **Verrouillage** : la liste garde la carte de tout article publié (titre, résumé, image = « teaser ») avec `locked` / `lockReason` (`login_required` ou `premium_required`) ; la page d'un article verrouillé n'envoie **ni le texte ni les fichiers** (`body: null`, `media: []`) — la réponse ne contient pas le moindre extrait du texte, vérifié. Fichiers joints d'un article premium : 401 (anonyme) / 403 (standard), `Cache-Control: private, no-store`. Les articles recommandés (« À lire aussi ») sont eux aussi marqués verrouillés selon le lecteur.
- **Fuite par la recherche fermée** : chercher un mot présent seulement dans le texte d'un article premium ne le trouve pas pour un lecteur non autorisé (sinon on reconstituerait le texte mot à mot) ; titre, résumé et mots-clés restent cherchables.
- **Recommandations selon le type de compte** : l'article peut cibler des types de compte (`targetAccountTypes`, vide = tous). `GET /api/blog/recommendations` renvoie ceux qui visent le type de compte du lecteur connecté (repli : les plus récents, `personalised: false`) ; « À lire aussi » place en premier les articles visant le lecteur. Le ciblage **ordonne, il ne cache rien**.
- Session **facultative** sur les routes publiques du blog (`optionalAuth`) : cookie absent, expiré, falsifié ou compte supprimé = visiteur anonyme, jamais une erreur. Les réponses dépendantes de la session sont `private, no-cache` avec `Vary: Cookie` (ajouté à `Vary: Origin` du CORS, pas à sa place — un premier essai l'écrasait, détecté par le test CORS existant).
- Interface : pastille « Premium » sur les cartes et la page, bloc cadenas avec les boutons adaptés (se connecter / créer un compte / voir l'accès premium, retour automatique sur l'article après connexion), section « Pour votre profil » en tête du blog quand quelque chose vise le lecteur, champs « Qui peut lire cet article ? » et « Article recommandé pour » dans l'étape *Classement* du CMS ; textes fr / en / ar. Contrôle de cohérence global étendu (types de compte ciblés valides).

Décisions :
- **La couverture d'un article premium reste publique** (fait partie de l'accroche) ; le texte et les fichiers, non.
- Un article premium reste visible dans les listes et en accroche pour un compte standard : c'est ce qui donne envie de passer premium (à contester avec le client s'il préfère le masquer entièrement).
- Pas de notion d'« abonnement payant » ici : le niveau du compte est celui défini en P1-06 ; le paiement (P3-08 à P3-10) viendra le modifier.

Tests (vrai serveur + PostgreSQL de test + Chrome) : 31 tests d'API (`functional/blog-access.test.js` : anonyme / standard / premium / administrateur, brouillon premium, fichiers, recherche, recommandations, éditeur, `CHECK` SQL) et le parcours navigateur (`e2e/profile-newsletter-journey.test.js`, 22 vérifications communes avec P3-05 : le texte n'est nulle part dans le HTML de la page pour un visiteur, retour sur l'article après connexion, section « Pour votre profil », fichier refusé sans session, arabe RTL, 375 px). Suite complète : voir P3-05.

### P3-05 — Newsletter
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P3-02`
- Durée cible : 1 jour

Tâches :
- Inscription à la newsletter.
- Validation email si nécessaire.
- Gestion des abonnés.
- Désinscription.
- Préparation de l'envoi d'informations/articles.

Réalisé :
- **Double opt-in** : `POST /api/newsletter/subscribe` enregistre l'adresse « en attente » et envoie **un** lien de confirmation ; rien n'est envoyé ensuite tant que la personne n'a pas cliqué. La date de confirmation est la preuve du consentement. Adresses normalisées (minuscules, sans espaces), `CHECK` SQL sur le statut, la casse et la cohérence des dates.
- **Liens signés sans stockage** : `<id>.<expiration>.<signature HMAC-SHA256>` (clé dérivée de `JWT_SECRET`), un jeton de confirmation ne peut pas servir à se désabonner (ni l'inverse), confirmation valable 7 jours, désinscription sans expiration. Confirmer et se désabonner sont des **POST derrière un bouton** : les scanners de courriel et aperçus de liens ouvrent tous les liens en GET et ne doivent rien confirmer ni résilier à la place de la personne (testé, y compris dans le navigateur).
- **Pas d'énumération** : la réponse est la même pour une adresse inconnue, en attente ou déjà inscrite. Une adresse en attente ne reçoit pas plus d'un courriel par 5 minutes ; limite par IP (5 inscriptions / heure) et sur les liens ; deux demandes simultanées → une ligne, un courriel.
- **Désinscription** : un abonné confirmé passe à « désabonné » (adresse et date conservées pour respecter son choix) ; une adresse jamais confirmée est **effacée**. Se réinscrire exige une nouvelle confirmation ; un ancien lien de confirmation ne peut pas ramener quelqu'un qui s'est désabonné.
- **Gestion des abonnés (administration `/admin/newsletter`)** : compteurs par statut, liste paginée avec recherche et filtre, suppression avec confirmation (droit à l'effacement), export CSV des confirmés (formules de tableur neutralisées), seulement pour un administrateur.
- **Préparation de l'envoi** (l'onglet « Préparer un envoi ») : construit, **sans rien envoyer**, le message des derniers articles publiés dans les trois langues (texte + HTML échappé, articles premium signalés, aucun extrait de leur texte), avec l'en-tête `List-Unsubscribe` et le nombre de destinataires confirmés par langue ; indique si l'envoi est possible.
- Formulaire d'inscription en bas du blog et des articles ; pages `/newsletter/confirmer` et `/newsletter/desinscription` ; textes fr / en / ar (les courriels aussi ; le tamazight retombe sur le français).
- **Fournisseur d'e-mail : toujours non choisi, donc AUCUN courriel réel ne part.** `services/mail.service.js` a deux pilotes : `console` (développement et tests : le message est gardé en mémoire et affiché dans le journal du serveur, rien ne sort) et `none` (**défaut en production**) : l'inscription répond alors 503 « pas encore disponible » et **ne stocke rien**, au lieu de faire semblant. Brancher un vrai fournisseur = ajouter un pilote dans ce fichier + variables d'environnement (documentées dans `server/.env.example` : `MAIL_DRIVER`, `PUBLIC_URL`, limites).

Décisions :
- Pas de tâche d'envoi en masse : la tâche demande la **préparation** ; l'envoi réel (file d'attente, reprise sur erreur, en-tête `List-Unsubscribe-Post` à un clic) dépend du fournisseur choisi.
- Adresses en attente jamais confirmées : conservées (elles ne reçoivent rien) ; l'administrateur peut les supprimer. Un nettoyage automatique (par exemple après 30 jours) est à décider avec le client.
- Sans IP ni journal de consentement détaillé : seule la date de confirmation est gardée (minimisation des données). À revoir avec la politique de confidentialité.

Tests : 33 tests d'API (`functional/newsletter.test.js` : inscription, double confirmation, jetons falsifiés / expirés / croisés, GET refusé, désinscription, réinscription, concurrence, administration, CSV, préparation, `CHECK` SQL), 3 en mode production sans fournisseur (`security/newsletter-production.test.js`), 2 limites de débit (`security/rate-limits.test.js`), le parcours navigateur (22 vérifications). **`npm test` : 402/402** (les 7 échecs du premier essai venaient des garde-fous du projet — audit des routes publiques, contrat client/serveur, variables d'environnement documentées, listes blanches de champs, en-tête CORS — tous traités) ; **`npm run test:e2e` : 63/63** ; `npm run lint` et build du client sans avertissement ; contrôle de cohérence de la base sans violation.
- Limites : aucun courriel réellement envoyé ni reçu (voir ci-dessus) ; pas de test sur téléphone réel / Safari / Firefox ; pas d'audit lecteur d'écran.

### P3-06 — Suite de tests automatisés (unitaires, fonctionnels, sécurité, cohérence globale)
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P3-03`
- Durée cible : ajout demandé par le client le 2026-09-19 (hors plan initial ; avance une partie de `P5-05`)

Demande : tests unitaires, fonctionnels et de sécurité, plus un test de cohérence globale de l'ensemble du système. Jusqu'ici les vérifications étaient des scripts jetables hors du dépôt ; elles sont désormais **versionnées** dans `server/tests/`, rejouables par n'importe qui (commandes et prérequis dans le README, section « Tests »).

Réalisé — **374 vérifications automatisées** (`npm test` : 333 en 75 secondes ; navigateur : 41) :
- **Unitaires, 95** (aucune base, aucun réseau) : slugs, assainissement HTML (23 familles d'attaques XSS), texte brut / temps de lecture / mots-clés, numéros de certificat (20 000 tirages), règles de progression et d'achèvement, niveaux d'accès, checklists de publication, schémas de validation (auth, contact, formations, articles, requêtes publiques), stockage privé (le type est jugé sur le **contenu**, taille, noms hostiles), jeton de session (falsifications), gestion d'erreurs, listes blanches des sérialiseurs.
- **Fonctionnels, 123** (vraie API, vraie base, vrais fichiers) : authentification, CMS des formations, parcours d'apprentissage complet (inscription → progression → certificat → vérification publique, y compris les accès concurrents), CMS des articles, API publique du blog, intégrité de la base (contraintes CHECK, clés étrangères, règles de suppression).
- **Sécurité, 79** : **audit automatique de toutes les routes réellement enregistrées** (public déclaré ou 401 ; routes d'administration : 401 anonyme / 403 apprenant / accès administrateur), sessions falsifiées (autre secret, expirée, `alg: none`, charge modifiée, compte supprimé, rôle relu en base), élévation de privilèges, énumération de comptes (temps de réponse compris), XSS enregistré, injections SQL et d'objets, pollution de prototype, corps anormaux, injection d'en-tête par nom de fichier, protection des fichiers privés (matrice complète), limites de débit (instance à seuils bas), et **mode production** : en-têtes, CORS, cookie `Secure`, aucune fuite dans les erreurs — y compris une **vraie panne de base** provoquée pendant le test.
- **Cohérence globale, 36** : (1) *données* — un historique réaliste (créations, éditions, publications, apprentissage, suppressions) est produit par l'API puis `services/consistency.service.js` contrôle les règles qui traversent tout le système (fichiers ↔ lignes, achèvement ↔ progression, certificats ↔ inscriptions, ordre des cours, HTML stocké déjà assaini, texte brut ↔ corps…) ; **9 tests « témoin » injectent chaque type d'incohérence à la main et vérifient qu'elle est détectée** (sinon « tout est vert » ne prouverait rien) ; la même vérification tourne sur la base réelle : `npm run check:consistency`. (2) *projet* — chaque adresse d'API écrite dans le client existe côté serveur avec la bonne méthode, chaque lien interne mène à une route, chaque entrée de menu aussi, français / anglais / arabe définissent les mêmes textes avec les mêmes variables et les formes plurielles requises, chaque clé demandée existe, `.env.example` ↔ variables réellement lues, aucun secret versionné, migrations ↔ `schema.prisma` sans dérive, aucune fonction de contrôleur oubliée hors routeur, suivi `TASKS.md` (dépendances existantes, rien de fait avant ses dépendances, tâche terminée = documentée, section « état actuel » exacte).
- **Navigateur, 41** (vrai Chrome piloté par le protocole DevTools, site et API de test) : parcours blog (20), parcours formation de l'administratrice à l'apprenante certifiée et attaques d'accès depuis la page (14), **balayage de 288 pages** (français / anglais / arabe / tamazight, 1280 et 375 px, visiteur / apprenant / administrateur, chaque étape des éditeurs) sans erreur JS, débordement, clé brute, page vide ni erreur HTTP inattendue.

Principes : base **dédiée `larbi_test`** créée et migrée automatiquement, avec garde-fou (le nom doit finir par `_test`, sinon refus) — la base de développement n'est jamais touchée ; stockage temporaire ; exécuteur natif de Node (**aucune dépendance de test ajoutée**) ; le vrai serveur tourne dans le processus de test ; les sessions sont fabriquées comme le fait la connexion ; chaque niveau est indépendant (`test:unit`, `test:functional`, `test:security`, `test:consistency`, `test:e2e`).

Défauts réels trouvés par ces tests et corrigés :
- **Caractère nul (` `) dans un champ texte → erreur 500** (PostgreSQL le refuse), déclenchable par n'importe quel utilisateur : refusé désormais en 400 par les validateurs, avec une profondeur d'imbrication limitée à 32 niveaux (un JSON de 5 000 niveaux faisait aussi déborder la pile).
- **Texte brut des articles** : blocs voisins collés et entités HTML conservées (voir P3-03).
- **La limite de 100 ko d'Express contredisait la validation à 200 000 caractères** : corps longs impossibles à enregistrer ; 1 Mo pour l'administration.
- **Les messages « route introuvable » reflétaient la méthode et le chemin demandés** : message constant.
- **Variables d'environnement lues mais non documentées** (`AUTH_RATE_LIMIT`, `CONTACT_RATE_LIMIT`, `PUBLIC_READ_LIMIT`, `LOG_REQUESTS`) : ajoutées à `.env.example`.
- Le fichier local `client/.env` (`VITE_API_URL`) aurait dirigé le site de test vers l'API de développement : neutralisé dans les tests.

Fiabilité : lors d'une exécution isolée le balayage a passé 7/7 ; une exécution faite pendant qu'un lint et un build tournaient sur la même machine a signalé un problème de rendu non identifié (journal filtré) qui n'est pas revenu à la relance. Le balayage accorde donc désormais une seconde chance (1,5 s) aux seuls états de rendu transitoires (page vide, débordement, clé non traduite, écran d'erreur) ; les erreurs JavaScript et HTTP ne sont **jamais** rejouées. Si le problème revient, le message d'échec donne la page, la langue et la largeur en cause.

Limites : pas de mesure de couverture chiffrée (aucun outil ajouté) ; les composants React ne sont pas testés isolément (aucun framework de test de composants) mais exercés en navigateur réel ; Chrome uniquement, pas de Safari / Firefox / téléphone réel ; pas d'audit d'accessibilité ; pas de test de charge ; newsletter, simulateurs et factures n'existent pas encore.

### P3-07 — Assistant guidé (chatbot à questions / réponses prédéfinies)
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P1-10`, `P2-02`
- Durée cible : 1 jour
- Origine : demande du client du 2026-09-19 (ajout au périmètre initial, voir « Impact sur le délai » après P3-10)

Principe : un **assistant très simple, sans saisie libre et sans intelligence artificielle**. Le visiteur ouvre un panneau, **choisit une question parmi une liste prédéfinie** et obtient une **réponse prédéfinie**. Le contenu est géré par l'administrateur, dans la base CMS existante (P2-02).

Tâches :
- Modèle de données (migration additive) : questions (texte de la question, réponse, ordre, statut brouillon / publié) et, si utile, un regroupement par thème. Contraintes en base comme pour le blog (longueurs, statut, ordre).
- Administration (`/api/admin/chatbot/*`, réservée à l'administrateur, entrée dans `config/adminNav.js`) : créer, modifier, réordonner, publier / dépublier, supprimer ; réponse rédigée dans l'éditeur riche existant, **assainie côté serveur** (`sanitizeRichText`) et re-nettoyée à l'affichage (`RichContent`).
- API publique **en lecture seule** (`/api/chatbot/*`, sans session) : uniquement les entrées publiées, avec la limitation de débit de lecture publique ; à déclarer publique dans l'audit d'autorisation automatique (P2-07).
- Interface : bouton flottant + panneau accessible (fermeture par Échap, focus géré, `aria-*`), liste de questions cliquables, réponse affichée, retour à la liste, lien « Contacter l'équipe » vers `/contact` quand aucune question ne convient. Textes de l'interface via `t()` (fr / en / ar), couleurs par tokens (mode sombre), propriétés logiques (RTL), icônes `lucide-react`, utilisable sur mobile. Non affiché dans l'administration.
- Si aucune entrée n'est publiée, le bouton n'apparaît pas (pas de panneau vide).
- Tests dans `server/tests/` : unitaires (validation), fonctionnels (CRUD, seules les entrées publiées sont publiques), sécurité (routes admin refusées aux non-administrateurs, XSS dans une réponse, audit des routes), cohérence (clés de traduction), navigateur (ouvrir, choisir, lire, RTL, mobile).

Décisions à trancher (valeur par défaut retenue si le client ne précise rien) :
- Langue du contenu : une seule langue par entrée, comme les formations et les articles (défaut) ; un contenu par langue serait une extension à chiffrer.
- Enchaînement de questions (arbre de décision « après cette réponse, proposer… ») : **hors périmètre** par défaut ; liste simple.
- Statistiques sur les questions les plus cliquées : **hors périmètre** par défaut (minimisation des données, règle 10, et pas d'analytics avancées au MVP).

Important :
- **Les questions et réponses doivent être fournies ou validées par le client.** Ne rien inventer de commercial, juridique, tarifaire ou fiscal ; ne livrer aucun contenu factice publié.
- Cet assistant ne remplace pas la FAQ (P1-03) : la FAQ reste la page de référence.

### P3-08 — Paiement : décisions à préciser (recherches à mener par le client)
- Statut : `⛔ blocked`
- Priorité : `🔴 high`
- Dépendances : `P1-06`
- Durée cible : 0 jour de développement (travail de recherche et de décision du client)
- Origine : demande du client du 2026-09-19

**Le client doit intégrer le paiement, mais son périmètre exact n'est pas encore défini** : type de banque ou de fournisseur, moyens de paiement, devise, ce qui est vendu. **Le client mène ses propres recherches pour préciser ces points ; Claude ne choisit pas de fournisseur, n'invente aucune règle commerciale, légale ou fiscale, et n'invente aucune information bancaire.** Cette tâche reste `⛔ blocked` jusqu'à réception des réponses ; elle débloque `P3-10`.

Points à préciser :
1. **Ce qui est vendu** : accès premium (abonnement mensuel / annuel ou durée fixe), formation à l'unité, les deux ? Prix, éventuel essai gratuit, promotions.
2. **Pays et devise(s)** d'encaissement ; clients visés (locaux, étrangers, les deux).
3. **Moyens de paiement à accepter** : cartes bancaires (locales / internationales), virement, paiement hors ligne avec validation manuelle par l'administrateur, portefeuille électronique… (un paiement hors ligne ajoute une fonction de validation manuelle à prévoir).
4. **Type de fournisseur** : passerelle proposée par la banque du client, agrégateur / prestataire de paiement, plateforme internationale. Critères à vérifier : disponible pour le pays et la forme juridique du client, frais et commissions, délai de versement, **page de paiement hébergée** (aucune donnée de carte chez nous), documentation d'API et **environnement de test (sandbox)**, notifications serveur (webhooks) signées, remboursements, abonnements récurrents si besoin.
5. **Entité qui encaisse** : compte bancaire professionnel, pièces demandées par le fournisseur pour l'ouverture.
6. **Cadre légal et fiscal** (à fournir par le client) : conditions générales de vente, politique de remboursement / rétractation, TVA, mentions à faire figurer sur les reçus.
7. **Règles de gestion** : remboursements, paiement échoué ou annulé, litiges, expiration d'un abonnement (que devient l'accès ?).
8. **Reçus et factures** envoyés au client après paiement (lien possible avec le générateur de facture, P4-03).
9. **Budget** : coûts d'ouverture, abonnement et frais par transaction du fournisseur.

Livrable attendu : une courte note (fournisseur retenu, moyens acceptés, devise, offres et prix, règles de remboursement) et l'accès à un compte de test du fournisseur. Passer alors cette tâche à `✅ done` (décisions reçues) et `P3-10` à `❌ todo`.

### P3-09 — Paiement : socle indépendant du fournisseur
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P3-04`
- Durée cible : 2 jours
- Origine : demande du client du 2026-09-19

Objectif : préparer tout ce qui **ne dépend pas du choix du fournisseur**, pour que le branchement final (P3-10) soit court. La logique d'accès est la partie sensible : elle doit être correcte avant qu'un vrai paiement existe.

Tâches :
- Modèle de données (migration additive) : offres (ce qui est vendu, prix, devise, niveau d'accès accordé), commandes (utilisateur, offre, **montant et devise figés au moment de la commande**, statut en attente / payée / échouée / annulée / remboursée), journal des événements reçus du fournisseur (identifiant externe **unique** pour l'idempotence). Montants en **entiers** (plus petite unité monétaire), jamais en nombre à virgule.
- Interface « adaptateur de fournisseur » (créer une session de paiement, vérifier la signature d'une notification, interpréter l'événement), plus un **faux fournisseur réservé aux tests et au développement, désactivé en production**.
- **Attribution de l'accès uniquement à partir d'une notification serveur authentique** (signature vérifiée), dans une transaction, de façon idempotente (une notification rejouée ou concurrente n'accorde pas deux fois). **Le retour du navigateur après paiement n'accorde jamais rien** : la page de retour relit l'état côté serveur. Retrait ou ajustement de l'accès en cas de remboursement selon les règles de P3-08.
- Le client n'envoie que l'identifiant d'une offre : **le prix vient toujours du serveur** ; une commande n'est lisible que par son propriétaire (règle 6).
- Route de notification (webhook) publique **déclarée dans l'audit des routes**, corps brut conservé pour la signature, taille limitée, limitation de débit, protection contre le rejeu, réponses génériques.
- **Aucune donnée de carte ne transite ni n'est stockée** (page de paiement hébergée ou redirection). Secrets du fournisseur uniquement dans les variables d'environnement serveur, documentés dans `.env.example`. Journal de sécurité (`logSecurityEvent`) sans donnée sensible.
- Interface (i18n fr / en / ar, tokens, RTL) : page des offres, démarrage du paiement, page de retour, « Mes paiements » ; côté administration : liste des commandes en lecture seule.
- Tests : unitaires (montants, statuts), fonctionnels, **sécurité** (notification falsifiée, rejouée, en double et concurrente ; montant ou offre modifiés ; commande d'un autre utilisateur ; accès accordé une seule fois ; retour navigateur sans effet), cohérence (commande payée ↔ accès accordé, aucune commande payée sans événement), navigateur avec le faux fournisseur.

Important :
- Ne pas choisir ni annoncer de fournisseur réel ici ; les règles de remboursement et les prix viennent du client (P3-08).
- Le niveau d'accès premium existe déjà (P1-06, P3-04) : le paiement ne fait que l'accorder ou le retirer, côté serveur.

### P3-10 — Paiement : branchement du fournisseur choisi
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P3-08`, `P3-09`
- Durée cible : 1 à 2 jours (selon le fournisseur et la qualité de sa documentation)
- Origine : demande du client du 2026-09-19

Tâches :
- Adaptateur du fournisseur retenu en P3-08 (création de la session, vérification de signature, événements de succès / échec / remboursement).
- Configuration par variables d'environnement (clés de test et de production séparées, jamais dans le dépôt ni le frontend).
- Essais complets dans l'environnement de test du fournisseur : paiement réussi, refusé, abandonné, notification en double, remboursement.
- Réconciliation : vérification que chaque commande « payée » correspond à un paiement chez le fournisseur.
- Liste de contrôle avant ouverture : clés de production, adresse de notification en HTTPS, conditions générales de vente affichées, reçus, sauvegardes (P5-04).
- Ajouter les tests de bout en bout correspondants à `server/tests/` ; `npm test` doit rester vert.

Statut de blocage : ne peut commencer qu'après les décisions de `P3-08`.

### Impact sur le délai (ajouts du 2026-09-19)

Le chatbot et le paiement n'étaient **pas** dans le plan initial de 8 semaines. Estimation, sans compter le temps de recherche du client (P3-08) :
- `P3-07` chatbot : 1 jour ;
- `P3-09` socle de paiement : 2 jours ;
- `P3-10` branchement du fournisseur : 1 à 2 jours, **conditionné par les décisions de `P3-08`**.

Soit environ **4 à 5 jours ouvrés, donc à peu près une semaine de plus** que les 8 semaines prévues. Pour rester à 8 semaines, il faudrait par exemple repousser le simulateur de fiscalité (déjà hors MVP, `P4-04`), simplifier le simulateur de crédit tant que ses règles ne sont pas fournies, ou livrer le paiement dans une seconde livraison. Le client doit arbitrer. Ordre conseillé : `P3-04`, `P3-05`, `P3-07`, `P3-09`, puis Phase 4 ; `P3-10` dès que `P3-08` est levée (le retard des décisions ne doit pas bloquer les outils).

---

### P3-11 — CMS pédagogique, lot A : structure d'une formation
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P2-02`, `P2-04`
- Durée cible : 3 à 4 jours

**Contexte (ajout du 2026-09-21, demandé par l'utilisateur)** : le CMS de P2-02 est jugé trop simple (titre + description + un texte + des fichiers) pour l'ambition du projet. Cette évolution (lots A à D, `P3-11` à `P3-14`) le transforme en outil de création pédagogique **sans réécriture** : migrations additives seulement (expand / contract), `Course.id` inchangé (progression, certificats et clés composites SQL intacts), lecture de l'ancien contenu conservée tant que la migration n'est pas validée.

**Vocabulaire retenu (décision 1)** : « Formation » (= « cours » de l'ensemble) → « Chapitre » (table `sections`) → « Leçon » (table `courses`, nom conservé en base). Aucun renommage massif des textes existants.

Décisions par défaut retenues (l'utilisateur a demandé d'avancer sans attendre les réponses ; à confirmer avec le client) :
- Quiz : obligatoire ou informatif **au choix de l'admin, par quiz** (informatif par défaut) ; réponse libre corrigée **automatiquement** (liste de réponses acceptées) ; pas de correction manuelle dans ce lot.
- Formation publiée : modification **directe avec historique** (pas de brouillon séparé) ; vidéos **fichiers privés uniquement** (pas d'embarquement YouTube / Vimeo) ; liens externes en simples liens `http(s)`.
- « En révision » : **statut** seulement (l'administrateur relit puis publie) ; pas de rôle « éditeur » distinct.

Tâches :
- Champs pédagogiques d'une formation : sous-titre, niveau (débutant / intermédiaire / avancé), objectifs, prérequis ; durée totale **calculée**.
- Chapitres : créer, renommer, supprimer, réordonner ; leçons rattachées à un chapitre ; migration des leçons existantes dans un chapitre par défaut.
- Réorganisation du plan par glisser-déposer (chapitres et leçons, y compris d'un chapitre à l'autre), avec boutons monter / descendre conservés comme alternative clavier ; une seule requête serveur atomique.
- Statuts `draft` / `in_review` / `published` / `archived` (contrainte SQL étendue) ; règles de visibilité côté serveur (archivée = hors catalogue, accès conservé aux inscrits).
- Tableau de bord de production (compteurs par statut, formations récentes, ce qui reste à compléter) et liste des formations plus riche.
- Page apprenant : programme organisé par chapitres, niveau, objectifs, prérequis, durée.

Réalisé (migrations additives `cms_structure` + `cms_structure_relation`, `prisma generate` fait) :
- **Modèle** : `formations` gagne `subtitle`, `level` (`CHECK` beginner / intermediate / advanced), `objectives[]`, `prerequisites[]` ; nouvelle table `sections` (chapitres) ; `courses.sectionId` avec **clé composite** `(sectionId, formationId)` → `sections(id, formationId)` : une leçon ne peut pas être dans le chapitre d'une autre formation, un chapitre qui contient encore des leçons ne peut pas être supprimé (RESTRICT, la progression vit sur les leçons). Statuts `draft` / `in_review` / `published` / `archived` (`CHECK` étendu, `publishedAt` seulement pour « publiée »).
- **Migration des données, sans perte** : chaque formation qui a des leçons reçoit **un** chapitre « Chapitre 1 » qui les contient toutes ; `Course.id`, l'ordre et tout ce qui les référence (progression, certificats) sont inchangés. Appliquée sur la base de démonstration existante (4 formations, 9 leçons) sans erreur ; **idempotente** (rejouée deux fois : même résultat, testée).
- **`Course.position` reste l'ordre GLOBAL** (chapitres d'abord, puis l'ordre dans le chapitre) : le lecteur apprenant, précédent / suivant, la progression et le certificat n'ont pas eu à changer.
- **API** (admin) : `POST/PATCH/DELETE` chapitres ; `PUT /formations/:id/outline` enregistre **tout le plan en une requête atomique** (chapitres dans l'ordre, chacun avec ses leçons ; un plan qui oublie, répète ou invente un chapitre ou une leçon est refusé en 400 et **rien ne change**) ; `PUT /formations/:id/status` (quatre statuts ; publier reste gardé par la checklist serveur, 422 avec ce qui manque) ; `GET /admin/dashboard`. Les anciennes routes (publier, retirer, réordonner les leçons) fonctionnent toujours.
- **Interface d'administration** : étape « Plan et leçons » avec chapitres et leçons **réordonnables par glisser-déposer** (@dnd-kit : souris, tactile et **clavier** — Espace, flèches, Espace —, annonces lecteur d'écran traduites), déplacement d'une leçon **d'un chapitre à l'autre** (y compris vers un chapitre vide), boutons monter / descendre qui franchissent aussi la limite d'un chapitre, renommage du chapitre sur place, ajout de chapitre et de leçon, suppression confirmée (message clair si le chapitre n'est pas vide). La première leçon crée « Chapitre 1 » toute seule : personne n'a besoin de comprendre les chapitres pour commencer. Étape « Informations » enrichie (sous-titre, niveau, objectifs et prérequis saisis ligne par ligne, durée totale **calculée** = somme des leçons, jamais stockée). Étape « Publication » : circuit brouillon → en révision → publiée → archivée avec les boutons adaptés à l'état. **Tableau de bord** (`/admin`) : compteurs par statut, formations « à relire », récents avec ce qu'il reste à compléter.
- **Apprenant** : page de la formation avec niveau, durée, sous-titre, objectifs, prérequis et programme **par chapitres** (les titres de chapitre ne s'affichent que s'il y en a plusieurs) ; carte du catalogue enrichie.
- Contrôle de cohérence global étendu : toute leçon est dans un chapitre et l'ordre global suit l'ordre des chapitres. Seed de démonstration mis à jour (chapitres, niveaux, statuts en révision et archivé).

Décisions :
- Vocabulaire conservé : Formation → Chapitre → Leçon (la table `courses` garde son nom).
- Une formation en révision, brouillon ou archivée est **hors catalogue** mais reste lisible par les inscrits (même règle que « retirer » avant) ; s'inscrire n'est possible que pour une formation publiée. « En révision » est un simple statut : pas de rôle « éditeur » distinct (décision par défaut, à confirmer).
- Supprimer un chapitre non vide est **refusé** plutôt que de supprimer ses leçons en cascade : la progression des apprenants en dépend.

Tests (vrai serveur + PostgreSQL de test + Chrome ; 26 tests d'API, 16 vérifications navigateur) : `functional/formation-structure.test.js` (chapitres, création de leçon dans un chapitre, refus d'un chapitre étranger, plan atomique et ses 8 refus, progression conservée après réorganisation, ancienne route d'ordre, 401 / 403 sur chaque nouvelle route, champs pédagogiques et leurs refus, statuts et catalogue, accès des inscrits à une formation archivée, clés SQL, migration idempotente, tableau de bord) et `e2e/cms-structure-journey.test.js` (glisser-déposer **à la souris et au clavier**, vers un autre chapitre, vers un chapitre vide, réordonner les chapitres, flèches, rechargement, renommage, statuts, tableau de bord, vue apprenant, formation archivée). Les tests existants ont été adaptés là où l'interface a changé (publication par le circuit d'états, première leçon). **`npm test` : 428/428** ; parcours navigateur (blog, structure, formation, profils, balayage du site 7/7 en 4 langues et 375 px) tous verts ; `npm run lint` et build du client sans avertissement ; cohérence de la base sans violation.
- Limites : le glisser-déposer tactile n'est pas testé sur un vrai téléphone (le capteur tactile est celui de la bibliothèque) ; pas de test au lecteur d'écran (annonces fournies mais non écoutées).

### P3-12 — CMS pédagogique, lot B : blocs de contenu et éditeur avancé
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P3-11`
- Durée cible : 5 à 6 jours

Tâches :
- Modèle de blocs `lesson_blocks` (type avec `CHECK`, position, données JSON **validées par type côté serveur**, référence de média vérifiée : le fichier doit appartenir à la leçon).
- Types : texte riche, image (légende, texte alternatif), vidéo (fichier privé), fichier à télécharger, code (langage), tableau, citation, encadré (info / astuce / attention), ressources et liens externes.
- Éditeur de blocs (ajout, réordonnancement par glisser-déposer, duplication, suppression) ; bloc texte = éditeur TipTap existant étendu par **profils d'options** (le blog garde son profil actuel).
- Assainissement : profil « leçon » plus large (tableaux, code) sans toucher au profil « article » ; jamais de HTML non assaini, coloration du code faite à l'affichage à partir du texte brut.
- Lecteur apprenant : rendu des blocs ; **double lecture** (blocs s'il y en a, sinon ancien `body` + fichiers).
- Migration idempotente des leçons existantes (un bloc texte + un bloc par fichier joint, dans l'ordre) avec tests d'intégrité (progression et certificats inchangés).
- Enregistrement automatique (brouillon local et serveur, indicateur d'état), historique `lesson_revisions` avec restauration.
- Aperçu « vue étudiant » (même composant que le lecteur).

Réalisé (migration additive `lesson_blocks`, avec **reprise automatique des contenus existants** ; `prisma generate` fait) :
- **Modèle** : `lesson_blocks` (type avec `CHECK`, position ≥ 0, `data` JSON objet, `mediaId` obligatoire pour image / vidéo / document et interdit pour les autres) et `lesson_revisions` (historique). Un bloc ne peut afficher qu'un fichier **de sa propre leçon** (clé composite `(mediaId, courseId)`) ; supprimer un fichier supprime le bloc qui l'affichait.
- **Neuf types de blocs** : texte riche, image (texte alternatif, légende), vidéo (fichier privé), document, code (langage, jamais interprété), tableau (grille de cellules en texte simple), citation, encadré (information / astuce / attention), liens et ressources. Le serveur **valide et nettoie chaque bloc selon son type** (`services/blocks.service.js`) : HTML assaini avec la même liste blanche que partout, liens `http(s)` seulement (ni `javascript:`, ni `data:`, ni identifiants dans l'adresse), tailles bornées, champs inconnus refusés, jamais de HTML brut stocké tel quel ; 200 blocs maximum par leçon.
- **Fichiers** : envoi depuis l'éditeur (`POST /courses/:id/blocks/upload`) = fichier privé + bloc créé en une seule opération ; le type du bloc suit le **vrai type du fichier** (contenu, jamais le nom ni l'en-tête annoncé) ; SVG / HTML / PHP refusés sans aucun résidu sur le disque ; supprimer un bloc supprime aussi le fichier.
- **API** (admin, chaque opération verrouille la leçon le temps de sa transaction : dix insertions simultanées donnent dix positions distinctes) : créer, modifier (validé selon le type que le bloc a déjà : un bloc ne change pas de type), dupliquer, supprimer, réordonner (liste exacte exigée, sinon 400 et rien ne bouge), historique.
- **Historique** : la version d'avant une modification est conservée automatiquement (au plus une toutes les 10 minutes), versions nommées à la demande, restauration (l'état d'avant la restauration est lui-même conservé, donc annulable), 30 versions conservées ; un bloc dont le fichier a été supprimé depuis n'est pas restauré.
- **Éditeur** (dans chaque leçon du plan) : ajout par une palette (icônes) ou « + » entre deux blocs, **enregistrement automatique** bloc par bloc avec état toujours visible (« Tout est enregistré » / « Enregistrement… » / « Échec » + réessayer), ce qui n'est pas encore enregistré est envoyé si l'on quitte la leçon, **glisser-déposer** des blocs (souris, tactile, clavier), duplication, suppression confirmée, **aperçu étudiant** (le même composant que le lecteur), panneau d'historique. Un lien sans adresse valide reste à l'écran mais n'est pas enregistré tant qu'il n'est pas terminé (défaut trouvé par le test : la palette créait un lien vide que le serveur refusait).
- **Lecteur apprenant** : rendu bloc par bloc (`BlockRenderer`) ; le code reste **de gauche à droite dans une page arabe**, les tableaux défilent sans casser la page (375 px), un bouton copie le code ; seconde assainissement côté navigateur (DOMPurify) : une valeur piégée plantée directement en base ne s'exécute pas (testé).
- **Double lecture (expand / contract)** : une leçon sans bloc est encore servie à l'ancienne (`body` + fichiers) ; pour une leçon avec blocs, `body` et `media` sont dérivés des blocs pour les anciens clients. Les anciennes requêtes (écrire `body`, joindre un fichier) fonctionnent toujours et **alimentent aussi les blocs** (le texte = premier bloc texte ; un fichier joint = un bloc). La colonne `courses.body` et les fichiers sont conservés (rien n'est perdu).
- **Migration des données** appliquée à la base de démonstration : chaque texte est devenu un bloc texte, chaque fichier un bloc image / vidéo / document, dans l'ordre de lecture ; **idempotente** (rejouée deux fois : même résultat, testée). Contrôle de cohérence global étendu (positions 0..n-1, contenu valide et déjà propre, bloc-fichier du bon type). Seed de démonstration : une leçon riche (encadré, tableau, code, citation, liens).

Décisions :
- Le tableau est une **grille de cellules en texte simple** (et non du HTML) : aucune balise à assainir, édition et rendu simples, validation stricte.
- Pas de coloration syntaxique du code dans ce lot (langage indiqué, monospace, bouton copier) : à ajouter au besoin sans changer le modèle.
- Pas de vidéo externe (YouTube, Vimeo), conformément à la décision par défaut du lot A.
- L'historique restaure les blocs et non le titre / résumé / durée de la leçon (ces champs gardent leur bouton « Enregistrer »).

Tests (vrai serveur + PostgreSQL de test + Chrome ; 36 tests d'API, 13 vérifications navigateur) : `functional/lesson-blocks.test.js` (les neuf types et leurs refus, assainissement, ordre et concurrence, fichiers dont hostiles, anciennes routes, historique, droits, vue apprenant, checklist de publication, contraintes SQL, migration) et `e2e/lesson-editor-journey.test.js` (construction d'une leçon de bout en bout, enregistrement automatique, lien inachevé, réordonnancement au clavier, aperçu étudiant, version nommée puis restauration, lecture par un apprenant avec valeur piégée en base, arabe et 375 px). Les tests existants ont été adaptés là où l'interface a changé (leçon écrite avec des blocs). **`npm test` : 464/464** ; parcours navigateur tous verts ; `npm run lint` et build du client sans avertissement ; cohérence de la base sans violation.
- Limites : le glisser-déposer tactile et la lecture d'écran ne sont pas testés sur de vrais appareils ; le test de réordonnancement au clavier est sensible au timing (il attend désormais entre chaque touche) ; l'image du bloc n'est pas redimensionnée côté serveur.

### P3-13 — CMS pédagogique, lot C : quiz
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P3-12`
- Durée cible : 5 à 6 jours

Tâches :
- Modèles `quizzes`, `quiz_questions`, `quiz_choices`, `quiz_attempts`, `quiz_attempt_answers` (contraintes SQL, clés composites avec la formation).
- Portée : leçon, chapitre ou fin de formation ; note de réussite, tentatives maximales, ordre mélangé, obligatoire ou informatif.
- Questions : choix unique, choix multiple, vrai / faux, réponse libre (réponses acceptées, normalisation casse / accents) ; énoncé, explication, score par question.
- Constructeur de quiz dans le CMS (checklist de publication : au moins une question, une bonne réponse par question, points > 0).
- Lecteur de quiz apprenant ; **correction faite par le serveur** ; les bonnes réponses et explications ne sont **jamais** envoyées avant la soumission ; limite de tentatives ; note et réussite enregistrées.
- Intégration à la progression : un quiz **obligatoire** réussi conditionne la fin de la formation et le certificat (à faire dans la même transaction verrouillée que P2-04 / P2-05).
- Tests de sécurité (fuite des réponses, triche par requêtes directes, concurrence, accès non inscrit).

Réalisé (migrations additives `quizzes`, `quiz_is_complete`, `quiz_target_check` ; `prisma generate` fait) :
- **Modèle** : `quizzes` (portée leçon / chapitre / fin de formation, **un quiz par cible** garanti par des clés uniques, cible obligatoirement dans la même formation par clés composites, `CHECK` sur la portée, la note de réussite 0 à 100 et le nombre de tentatives), `quiz_questions` (4 types), `quiz_choices`, `quiz_attempts` (ouverte ou corrigée, jamais entre les deux : `CHECK`) et `quiz_attempt_answers`. Colonne `isComplete` dénormalisée, tenue à jour par le CMS et **recalculée par le contrôle de cohérence global**.
- **Quatre types de questions** : choix unique, choix multiple, vrai / faux, réponse libre (réponses acceptées comparées sans casse, sans accents et sans espaces superflus). Pour chaque question : énoncé, explication affichée après correction, points (1 à 100). Correction « tout ou rien » par question (un choix multiple exige exactement le bon ensemble).
- **Réglages d'un quiz** : note de réussite, tentatives maximales (illimitées par défaut), ordre des questions mélangé, **obligatoire ou informatif** (informatif par défaut), correction montrée ou non.
- **Sécurité du contenu** : les bonnes réponses, les explications et les réponses acceptées **ne quittent jamais le serveur avant la soumission** (vérifié : la réponse de « démarrer » ne contient aucun `isCorrect`, aucune explication, aucune réponse acceptée) ; **la correction est faite par le serveur, une seule fois par tentative** (rejouer ou soumettre deux fois en même temps → une seule réussit, 409 pour l'autre) ; les identifiants de choix d'une autre question, les questions inconnues et le texte envoyé pour un choix sont ignorés ; sans correction affichée, l'apprenant n'apprend que sa note (aucun résultat par question) ; reprendre une tentative ouverte ne consomme pas d'essai ; limite de débit par **compte** (40 démarrages / envois par 10 minutes, `QUIZ_RATE_LIMIT`).
- **Accès** : mêmes règles que la lecture d'une leçon (connecté, inscrit, niveau du compte revérifié) ; un quiz d'une autre formation, d'une formation cachée ou incomplet n'est pas servi (404 / 409).
- **Lien avec la fin de la formation** : un quiz **obligatoire et complet** réussi conditionne la fin de la formation et le certificat. Le calcul (`progress.service.js`) tient compte des leçons **et** des quiz obligatoires, dans la **même transaction verrouillée** que la validation d'une leçon : réussir le dernier quiz termine la formation et délivre le certificat dans la même requête ; réussir un quiz avant la dernière leçon n'y change rien tant qu'il reste une leçon. Un quiz obligatoire incomplet ne peut pas piéger un apprenant (il n'est pas compté) ; rendre un quiz obligatoire **après** qu'un apprenant a terminé ne lui retire pas son certificat ; un échec ultérieur n'annule pas une formation terminée.
- **CMS** : un quiz s'ajoute depuis une leçon, un chapitre ou la fin de la formation (zone « Quiz » à chaque endroit) ; éditeur avec réglages, questions réordonnables par glisser-déposer (souris, tactile, clavier), chaque question avec son bouton d'enregistrement et la liste de ce qui manque (« Indiquez la bonne réponse »…), suppression confirmée. **Un quiz incomplet bloque la publication** (nouvelle ligne de la checklist « Terminer ou supprimer les quiz incomplets », refus serveur 422).
- **Apprenant** : carte du quiz sur la leçon, sur le chapitre et en fin de formation (obligatoire, meilleur score, tentatives restantes) ; page de quiz en trois temps (introduction → questions → résultat avec correction et explications), reprise, « revoir mon dernier résultat », nouvelle tentative directe, mention « quiz obligatoire à réussir » dans le panneau de la formation ; textes fr / en / ar (pluriels arabes compris), arabe RTL et 375 px vérifiés.
- Seed de démonstration non modifié pour les quiz (aucun contenu pédagogique inventé au-delà des exemples de blocs).

Décisions :
- Un quiz par cible (leçon, chapitre, formation) : plus simple pour un public non technique ; plusieurs quiz par cible = évolution possible sans changer le reste.
- Correction « tout ou rien » par question (pas de points partiels) ; réponse libre corrigée automatiquement, sans correction manuelle (décision par défaut du lot A).
- Modifier un quiz déjà passé par des apprenants ne change pas leurs notes enregistrées ; l'historique de leurs tentatives suit le quiz (supprimer le quiz supprime les tentatives : le CMS le dit avant de confirmer).
- Le quiz d'une leçon ne conditionne pas le bouton « Marquer comme terminé » de cette leçon : seul le quiz **obligatoire** compte pour la fin de la formation.

Tests (vrai serveur + PostgreSQL de test + Chrome ; 37 tests d'API, 1 de limite de débit, 14 vérifications navigateur) : `functional/quizzes.test.js` (conception : portées, cibles refusées, réglages, formes de chaque type et toutes les manières d'être incomplet, choix conservés par identifiant, réordonnancement, blocage de la publication, 401 / 403 ; côté apprenant : rien de secret avant la soumission, reprise, démarrages simultanés, accès, quiz incomplet, correction de chaque type, tricherie, soumissions invalides, une seule correction, tentatives des autres, sans correction, tentatives limitées ; lien avec la fin de la formation dans les six cas ci-dessus ; suppression ; contraintes SQL), `security/rate-limits.test.js`, `e2e/quiz-journey.test.js` (un administrateur construit un quiz obligatoire avec trois types de questions et le réordonne au clavier ; un apprenant échoue, lit la correction, réussit, obtient le certificat ; arabe, 375 px, apprenant non inscrit). **`npm test` : 502/502** ; parcours navigateur tous verts ; `npm run lint` et build du client sans avertissement ; cohérence de la base sans violation.
- Limites : pas de correction manuelle des réponses libres ; pas de banque de questions partagée entre quiz ; pas de tirage aléatoire de questions ; lecture d'écran et écrans tactiles réels non testés.

### P3-14 — CMS pédagogique, lot D : finitions
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P3-13`
- Durée cible : 2 jours

Tâches (périmètre réellement retenu ; ce qui a été écarté est listé dans « Décisions ») :
- Aperçu étudiant d'une formation entière (présentation, plan, leçons bloc par bloc, quiz).
- Duplication d'une leçon, d'un chapitre et d'une formation.

Réalisé :
- **Duplication** (`POST /api/admin/courses/:id/duplicate`, `/sections/:id/duplicate`, `/formations/:id/duplicate`) : copie **indépendante** du contenu — texte, blocs, **fichiers copiés sur le disque sous de nouveaux noms** (supprimer la copie ne touche jamais l'original), couverture, présentation pédagogique, réglages de certification, et, pour une formation, chapitres, leçons et **quiz avec leurs questions et réponses** (chaque quiz suit sa leçon dans la copie). Jamais copiés : inscriptions, progression, certificats, tentatives de quiz, historique des versions ; une formation copiée est un **brouillon** avec une adresse (slug) distincte. La copie d'une leçon ou d'un chapitre se place juste après l'original. **Atomique** : si un fichier manque, la copie échoue (409) et rien ne reste — ni ligne en base, ni fichier orphelin sur le disque (testé).
- **Interface** : boutons « Dupliquer » dans la liste des formations (ouvre la copie), sur chaque leçon et chaque chapitre du plan ; nouvel onglet **« Aperçu »** de l'éditeur de formation : la formation telle que l'apprenant la voit (niveau, durée, sous-titre, objectifs, prérequis), chapitres, chaque leçon dépliable rendue **bloc par bloc avec le même composant que le lecteur**, emplacement des quiz (obligatoire / incomplet signalés) ; textes fr / en / ar.

Décisions :
- **Colonne `courses.body` conservée** (et les anciens fichiers joints) : la phase « contract » qui la supprimerait n'apporte rien tant que le double chemin de lecture ne coûte rien, et risquerait de faire perdre du contenu ; à reprendre seulement si le client le demande. Les blocs sont la source de vérité dès qu'une leçon en a.
- **Écarté de ce lot** : historique consultable pour toute une formation (l'historique reste **par leçon**, avec restauration — lot B) ; aide contextuelle dédiée (chaque champ du CMS porte déjà son texte d'explication) ; duplication d'un quiz seul ; import / export de formation.
- Une copie de leçon ou de chapitre **ne copie pas les quiz** (un quiz par cible : la copie d'un quiz sur la même formation ne serait pas rattachable) ; la copie d'une formation entière, elle, les copie.

Tests (vrai serveur + PostgreSQL de test + Chrome ; 10 tests d'API, 4 vérifications navigateur) : `functional/duplication.test.js` (copie juste après l'original avec ses blocs et **ses propres** fichiers, indépendance à la suppression, données des apprenants non copiées, échec propre sur fichier manquant sans aucun résidu, droits 401 / 403, chapitre entier, formation entière : brouillon, quiz suivant leur leçon, aucune inscription, copie invisible pour un apprenant et supprimable avec tous ses fichiers, deux copies = deux adresses, cohérence globale) et `e2e/cms-finishing-journey.test.js` (« Dupliquer » depuis la liste, depuis le plan, onglet « Aperçu »). **`npm test` : 512/512** ; parcours navigateur (`npm run test:e2e`) : **110/110** ; `npm run lint` et build du client sans avertissement ; contrôle de cohérence de la base sans violation.
- Limites : pas de duplication d'un quiz seul ; les très grosses formations (centaines de Mo de vidéos) dupliquent leurs fichiers de façon synchrone dans la requête (timeout de la transaction : 60 s).

### P3-15 — Types de compte dynamiques
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P1-06`
- Durée cible : ajout demandé par le client le 2026-09-25 (hors plan initial)

Demande : en plus des catégories déjà prévues (auto-entrepreneur, PME, PMI), prévoir dès maintenant étudiant, lycéen et salarié, et permettre à l'administrateur d'**ajouter de nouveaux types de compte plus tard, sans modification du code**.

Réalisé (migration additive `account_types_settings_status`, `prisma generate` fait) :
- **Nouvelle table `account_types`** (`slug` unique, `label`, `actif`, `ordre`) : les catégories ne sont plus une liste figée dans le code (`constants/accountTypes.js`, supprimé) mais un contenu géré par l'administration, comme les catégories du blog ou des formations. La migration installe les six catégories : les trois déjà utilisées (mêmes `slug` qu'avant, aucune donnée existante à toucher) puis étudiant, lycéen, salarié.
- **`users.accountType` reste une simple chaîne**, inchangée dans son type et son usage partout ailleurs dans le code : c'est volontairement une référence souple (comme les statuts « draft/published » ailleurs dans ce projet), validée à l'inscription et à la mise à jour du profil contre les catégories **actives** de la table, plutôt qu'une clé étrangère — migration beaucoup plus sûre, aucune table ni relation existante à toucher.
- **Administration** (`/api/admin/account-types`, onglet de la page « Utilisateurs », voir P3-16) : créer (identifiant généré automatiquement à partir du libellé), renommer, réordonner, activer/désactiver, supprimer. **Suppression refusée (409)** tant qu'un compte utilise encore la catégorie ; désactiver la retire de l'inscription et de l'auto-sélection sans toucher aux comptes qui l'ont déjà.
- **Une seule source de vérité** : `GET /api/account-types` (public, inscription et page « Type de compte ») ne renvoie que les catégories actives ; le ciblage d'articles par profil (P3-04, étape *Classement* du CMS) lit désormais la même liste au lieu d'une liste à trois valeurs codée en dur dans la page — les nouveaux types (étudiant, lycéen, salarié…) y sont donc immédiatement utilisables.
- Contrôle de cohérence global étendu : le type de compte de chaque utilisateur et chaque type ciblé par un article doivent exister dans la table (deux témoins qui injectent une valeur inventée et vérifient qu'elle est détectée).

Décisions :
- Le libellé est un texte simple, non traduit (même logique que les catégories d'articles ou de formations) : l'administrateur l'écrit dans la langue de son choix.
- Pas de clé étrangère `users.accountType → account_types.id` : la référence par `slug`, déjà validée côté serveur, évite une migration de données et garde la compatibilité avec tout ce qui existait (tests, jeux de données de démonstration, ciblage d'articles).

Tests : voir P3-16 (même suite, même campagne de tests).

### P3-16 — Panel d'administration étendu (utilisateurs, droits, paramètres, médiathèque, certifications) et tableau de bord personnalisé
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P3-15`, `P2-07`
- Durée cible : ajout demandé par le client le 2026-09-25 (hors plan initial)

Demande : un panel d'administration permettant de gérer les utilisateurs, les types de compte, les droits et accès, les médias et les certifications, avec des paramètres de plateforme éditables sans intervention technique, une architecture extensible pour ajouter d'autres fonctions plus tard ; et un tableau de bord personnalisé selon le profil de l'utilisateur connecté (informations personnelles, formations, progression, certifications, contenus pertinents pour son profil).

Réalisé (migration additive `account_types_settings_status` partagée avec P3-15 ; `prisma generate` fait) :
- **Gestion des utilisateurs** (`/api/admin/users`, page « Utilisateurs » → onglet « Comptes ») : recherche par nom ou e-mail, filtre par rôle / statut, liste paginée ; un administrateur change le **type de compte**, le **niveau d'accès** (standard / premium) et le **rôle** (utilisateur / administrateur) directement dans le tableau. C'est la réponse concrète à « gérer les droits et accès » : les deux mécanismes qui existaient déjà séparément (rôle en P1-06, niveau d'accès en P1-06/P3-04) sont désormais pilotables depuis une interface, sans jamais toucher à la base à la main.
- **Suspension de compte** (nouveauté, colonne `users.status`, `CHECK` SQL) : un administrateur suspend ou réactive un compte d'un bouton. Une suspension **coupe la session en cours immédiatement** (`requireAuth` relit le statut à chaque requête, exactement comme un changement de rôle) et empêche toute nouvelle connexion (login refusé en 403), même avec le bon mot de passe.
- **Garde-fou** : un administrateur ne peut pas changer son **propre** rôle ou statut depuis cet écran (refusé en 400) — il ne peut donc pas se verrouiller lui-même hors de l'administration par erreur.
- **Types de compte** : voir P3-15 (onglet « Types de compte » de la même page).
- **Paramètres de la plateforme** (`/api/admin/settings`, page « Paramètres ») : magasin clé/valeur (`platform_settings`) **extensible** — un administrateur peut ajouter n'importe quelle nouvelle clé depuis l'écran, sans migration ni redéploiement. Quatre réglages « cœur » déjà branchés dans l'application : **mode maintenance** (case à cocher, effet réel : voir plus bas), et **e-mail / téléphone / adresse de contact public**, vides par défaut (aucune coordonnée inventée), maintenant affichés sur la page Contact et dans le pied de page dès que l'administrateur les renseigne — cela remplace l'avertissement « aucune coordonnée fournie » qui s'affichait jusqu'ici. Les réglages « cœur » sont modifiables mais pas supprimables (409) ; un réglage personnalisé ajouté par l'administrateur peut l'être.
- **Mode maintenance, appliqué réellement côté serveur** (pas seulement une case cochée) : un nouveau filtre (`maintenanceGate`, avant toutes les routes) répond **503** à toute requête publique tant qu'il est actif, sauf `/api/health`, `/api/auth/*`, `/api/settings/public` et **tout `/api/admin/*`** — un administrateur peut donc toujours se connecter, consulter le site normalement (pas seulement l'administration) et désactiver le mode maintenance pour tout remettre en ordre. Le client affiche un bandeau discret sur tout le site quand il est actif.
- **Médiathèque** (`/api/admin/media`, page « Médiathèque ») : liste de **tous** les fichiers envoyés (formations et articles confondus), avec ce qui les utilise (couverture de formation ou d'article, leçon, article, ou « aucune »), recherche par nom, filtre par type, suppression (réutilise le retrait déjà existant : fichier et ligne supprimés ensemble). Répond au besoin de gérer les médias indépendamment d'avoir à rouvrir chaque formation ou chaque article un par un.
- **Certifications** (`/api/admin/certificates`, page « Certifications ») : liste de tous les certificats délivrés, recherche par titulaire / formation / numéro, filtre valide / révoqué. **Révocation** (nouveauté, `certifications.revokedAt` / `revokedReason`, `CHECK` SQL : un motif implique une date) : un certificat révoqué **n'est jamais supprimé** (l'obtention reste un fait acquis pour l'apprenant) mais la vérification publique et la page « Mes certificats » de l'apprenant l'affichent aussitôt comme invalide ; le motif de révocation reste strictement interne, jamais renvoyé par l'API publique ni à l'apprenant. Réversible (« Rétablir »).
- **Contenus premium** : déjà couvert (niveau d'accès des formations depuis P2-02, des articles depuis P3-04) ; aucun développement supplémentaire nécessaire, seulement vérifié que la case existe bien dans chaque éditeur.
- **Architecture extensible** : chaque nouvelle fonction d'administration est une entrée de plus dans le même registre (`config/adminNav.js`) et un routeur de plus sous le même `/api/admin/*`, déjà protégé une seule fois (`requireAuth` + `requireRole(admin)`) ; le magasin de paramètres clé/valeur permet d'ajouter un réglage sans migration.
- **Tableau de bord personnalisé** (`/compte/tableau-de-bord`, réponse à la demande sur le profil utilisateur) : informations du compte (nom, e-mail, type de compte, niveau d'accès) avec accès direct à leur modification ; formations en cours (réutilise `/api/learn/enrollments`) ; certificats obtenus, **révoqués exclus du compteur et de la liste** (réutilise `/api/learn/certificates`) ; articles recommandés pour le profil du lecteur (réutilise `/api/blog/recommendations`, P3-04, donc déjà personnalisés par type de compte) ; section « Outils » en attente de la Phase 4. Aucune nouvelle route serveur n'a été nécessaire : uniquement l'assemblage, côté client, de ce qui existait déjà.

Décisions :
- **Pas de moteur de permissions granulaire** : « gérer les droits et accès » est couvert par les deux leviers déjà prévus au cahier des charges (rôle, niveau d'accès) rendus pilotables depuis une interface, plus le nouveau statut actif/suspendu. Un système de permissions fines par fonctionnalité serait une extension à chiffrer séparément si le client le demande.
- **Suspension plutôt que suppression du compte** : réversible, ne supprime aucune donnée (formations créées, articles, inscriptions), correspond à l'usage réel (« je veux fermer l'accès de quelqu'un », pas nécessairement effacer son historique). La suppression réelle d'un compte (droit à l'effacement) reste à faire si le client la demande explicitement — voir note ajoutée à P5-05.
- **Mode maintenance** : un administrateur reste actif de bout en bout (connexion, navigation normale, extinction du mode) au lieu d'un simple message statique, pour que ce soit un outil réellement utilisable en situation réelle.
- Libellé des paramètres « cœur » fixés dans le code (quatre clés), le reste totalement libre : équilibre entre une interface simple pour les réglages qui existent déjà dans l'application et une extensibilité réelle pour le reste.

Tests (vrai serveur + PostgreSQL de test + Chrome) : 18 tests fonctionnels dédiés (`functional/admin-platform.test.js` : types de compte créés/renommés/désactivés/supprimés et leur effet immédiat sur l'inscription, gestion des utilisateurs et de la suspension y compris l'impossibilité de se modifier soi-même, paramètres cœur et personnalisés, mode maintenance avec son exemption pour l'administrateur, médiathèque avec son filtre et son usage, certificats avec révocation/rétablissement et confidentialité du motif) ; 2 témoins de cohérence supplémentaires (`consistency/data.test.js`) ; l'audit de sécurité automatique (`security/authorization.test.js`) couvre **sans modification** chaque nouvelle route (401 anonyme, 403 apprenant, fonctionne pour l'administrateur) puisqu'il parcourt les routes réellement enregistrées ; parcours navigateur : les quatre nouvelles pages ajoutées au balayage du site (`e2e/site-sweep.test.js`, toutes langues, mobile et bureau). Correctifs faits en cours de route : (1) `tests/helpers/server.js` ne remet plus à zéro `account_types` et `platform_settings` entre les fichiers de test (ce sont des données de référence, comme un contenu géré par l'administration, pas un contenu de test) — chaque test qui les modifie nettoie derrière lui, deux témoins de cohérence ajoutés le confirment ; (2) **le tableau « Comptes » débordait horizontalement à 1280 px** (huit colonnes, dont trois listes déroulantes dont la largeur suivait le texte le plus long parmi les options traduites) — trouvé par le balayage du site, corrigé en regroupant nom et e-mail dans une seule colonne et en limitant la largeur des listes déroulantes, revérifié par deux exécutions consécutives du balayage. **`npm test` : 533/533** ; parcours navigateur (`npm run test:e2e`) : **110/110** ; `npm run lint` et build du client sans avertissement ; contrôle de cohérence de la base sans violation.
- Limites : pas de moteur de permissions granulaire (voir Décisions) ; pas de suppression réelle d'un compte utilisateur ; le mode maintenance ne bloque que l'API (il n'existe pas de rendu HTML serveur à bloquer, le client est une page unique) — un visiteur qui a déjà chargé le site avant l'activation peut encore voir les pages déjà en cache tant qu'il ne fait pas d'appel réseau ; pas de journal d'audit détaillé des actions d'administration (qui a changé quoi et quand) au-delà des dates `updatedAt` ; la page Footer et la page Contact interrogent chacune séparément les réglages publics (petites requêtes redondantes, sans conséquence pratique à ce stade).

### P3-17 — Articles multilingues (traductions)
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P3-16`, `P3-04`
- Durée cible : ajout demandé par le client le 2026-09-26 (hors plan initial)

Demande : chaque article a une langue ; l'administrateur peut le traduire s'il a le temps, sinon l'article s'affiche dans sa langue d'origine ; une petite balise indique les langues disponibles ; la langue affichée suit automatiquement la langue de navigation choisie.

Réalisé (migration additive `article_translations`, `CHECK` SQL, `prisma generate` fait) :
- **Base** : `articles.language` (fr / en / ar, défaut fr) et nouvelle table `article_translations` (titre, résumé, texte, texte brut de recherche, SEO ; une ligne par article et par langue, clé unique `(articleId, language)`, suppression en cascade avec l'article). Une traduction a toujours un titre et un texte (`CHECK`), jamais dans la langue de l'article (contrôlé par le serveur et par le contrôle de cohérence).
- **Ce qui est traduit / partagé** : seul le texte dépend de la langue. Adresse (slug), couverture, fichiers, catégorie, mots-clés, statut, niveau d'accès et profils ciblés restent sur l'article et sont communs à toutes les langues : une traduction n'a donc ni statut ni droits propres (elle est publique quand l'article l'est, verrouillée quand il est premium).
- **API publique** : `?lang=fr|en|ar` sur la liste, l'article et les recommandations ; réponse = traduction si elle existe, sinon langue d'origine. Chaque carte porte `language` (langue affichée) et `availableLanguages`. La recherche couvre aussi le texte de la langue du visiteur, avec la même règle qu'avant pour le texte d'un article verrouillé (jamais cherché). Une langue inconnue est refusée (400).
- **Administration** : choix de la langue de l'article (étape « Contenu »), nouvelle étape « Traductions » (une carte par autre langue : Traduit / Non traduit, formulaire titre, résumé, texte enrichi, SEO ; enregistrement et suppression propres à chaque langue, texte nettoyé côté serveur comme l'article), colonne « Langues » dans la liste. Changer la langue d'un article vers une langue déjà traduite est refusé (409).
- **Site** : la langue de l'interface choisit la traduction (le tamazight, sans contenu, retombe sur la langue d'origine) ; balise « FR · EN » sur les cartes et la page d'un article, la langue affichée est marquée ; le texte est balisé `lang` / `dir` (un article arabe s'affiche de droite à gauche même dans une interface française).

Décisions :
- **Une table de traductions plutôt qu'un doublon complet des articles** : dupliquer toute la ligne (couverture, fichiers, statut, droits) obligerait à tout tenir synchronisé et permettrait qu'une traduction soit publique alors que l'article est premium ou brouillon.
- Langues de contenu = les trois de la plateforme (fr, en, ar) ; en ajouter une demande une migration (contrainte) et une entrée dans `CONTENT_LANGUAGES`.

Tests : `functional/article-translations.test.js` (12 tests : langue par défaut et changement, droits 401 / 403, enregistrement nettoyé et remplacement, refus de la langue d'origine / sans titre / sans texte / champ inconnu, conflit de langue, contraintes de la base, suppression, repli sur la langue d'origine, choix par langue, liste et recommandations traduites, recherche par langue, brouillon et article premium jamais dévoilés, langue invalide) et `e2e/article-translations-journey.test.js` (l'auteur traduit depuis l'éditeur, le visiteur lit l'original en français, la traduction en anglais, l'original en arabe faute de traduction, balises correctes, aucune erreur JS) ; tests d'allow-list, du blog et de cohérence adaptés. **`npm test` : 547/547** ; lint et build du client sans avertissement ; cohérence de la base sans violation.
- Limites : le texte des cartes « newsletter » (préparation d'un envoi) reste dans la langue d'origine des articles ; pas de traduction automatique ; pas de mise en évidence d'une traduction devenue obsolète quand l'original change ; les catégories et mots-clés ne sont pas traduits (un seul nom).

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
- Ajout du 2026-09-19 : si le paiement (`P3-09`, `P3-10`) est livré, y inclure la revue de la route de notification du fournisseur (signature, rejeu, doublons concurrents), de l'attribution d'accès et des secrets de paiement ; et l'API publique de l'assistant guidé (`P3-07`).

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

Avancement (2026-09-19) : la suite de tests versionnée de `P3-06` couvre déjà les parcours formation → certification, création d'article → publication → consultation, tentatives d'accès non autorisé et à un média privé, envois de fichiers invalides, validation API. Restent à couvrir quand ils existeront : newsletter, assistant guidé (`P3-07`), paiement (`P3-09`, `P3-10`), simulateur de crédit, factures PDF / Excel. Cette tâche reste `❌ todo` tant que ces parcours manquent.

Avancement (2026-09-25, P3-16) : gestion des utilisateurs (types de compte, niveau d'accès, rôle, suspension) et panel d'administration (paramètres, médiathèque, certifications avec révocation) désormais couverts par `functional/admin-platform.test.js`. Point resté ouvert (noté en Décisions de `P3-16`) : il n'existe pas de suppression réelle (« droit à l'effacement ») d'un compte utilisateur, seulement la suspension ; à ajouter si le client le demande explicitement, avec ses propres tests.

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

Précision du 2026-09-19 (demande du client) : l'intégration d'un paiement **simple** (achat ou abonnement donnant accès au contenu premium) est désormais **dans le périmètre** — voir `P3-08`, `P3-09`, `P3-10`, dont la forme exacte reste à préciser par le client. Ce qui reste hors MVP : marketplace, multi-vendeurs, paiement fractionné, facturation d'abonnement complexe et toute règle non demandée. La ligne « Paiement complexe » ci-dessus est conservée telle quelle.

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

Phase active : `PHASE 3` — BLOG + CMS CONTENU + NEWSLETTER (les Phases 1 et 2 ont été validées le 2026-09-19, voir P1-08 et P2-07)

Dernières tâches terminées et vérifiées :
`P3-16 — Panel d'administration étendu (utilisateurs, droits, paramètres, médiathèque, certifications) et tableau de bord personnalisé`, `P3-15 — Types de compte dynamiques`, `P3-14 — CMS pédagogique, lot D : finitions`, `P3-13 — CMS pédagogique, lot C : quiz`, `P3-12 — CMS pédagogique, lot B : blocs de contenu et éditeur avancé`, `P3-11 — CMS pédagogique, lot A : structure d'une formation`, `P3-05 — Newsletter`, `P3-04 — Recommandation / visibilité selon profil`, `P3-06 — Suite de tests automatisés (unitaires, fonctionnels, sécurité, cohérence globale)`, `P3-03 — Frontend blog`, `P3-02 — CMS simplifié`, `P3-01 — Modèle de données blog`, `P2-07 — Validation de fin de phase` (Phase 2 validée), `P2-06 — Protection des contenus E-Learning`, `P2-05 — Certification`, `P2-04 — Suivi de progression`, `P2-03 — Interface utilisateur E-Learning`, `P2-02 — Gestion des formations côté admin (CMS)`, `P2-01 — Modèle de données E-Learning`, `P1-08 — Validation de fin de phase` (Phase 1 validée), `P1-07 — Intégration frontend/backend`, `P1-11 — Refonte visuelle du frontend`, `P1-06 — Authentification + rôles`, `P1-05 — Backend minimal et navigation dynamique`, `P1-09 — Mode clair / sombre`, `P1-10 — Internationalisation (i18n)` (toutes ✅ done)

Toutes les tâches de pages (P1-02, P1-03, P1-04), le socle backend (P1-05) et les deux ajouts signalés par l'utilisateur (mode clair/sombre, i18n FR/EN/AR + tamazight en repli) sont terminés. Le modèle `User` existe en base (Prisma).

Prochaines tâches réalisables (dépendances satisfaites) :
- `P3-07 — Assistant guidé (chatbot à questions / réponses prédéfinies)` (dépend de `P1-10` ✅ et `P2-02` ✅ ; **questions et réponses à fournir par le client**).
- `P3-09 — Paiement : socle indépendant du fournisseur` (dépend de `P3-04` ✅ ; `P3-08` reste bloquée sur les décisions du client et bloque seulement `P3-10`).
- Le blog est terminé (P3-01 à P3-06 hors paiement et assistant guidé). La Phase 4 (outils) ne doit commencer qu'après validation de la Phase 3.

Recommandation : `P3-07` si le client a fourni les questions / réponses, sinon `P3-09` ; puis la validation de fin de Phase 3. Points d'attention :
- **Newsletter : aucun courriel réel ne part tant qu'un fournisseur d'e-mail n'est pas choisi** (pilote `none` par défaut en production : l'inscription répond « pas encore disponible »). C'est la décision client la plus urgente pour rendre P3-05 réellement utilisable ; elle débloque aussi « mot de passe oublié ».
- Chaque nouvelle tâche ajoute ses tests dans `server/tests/` (voir P3-06 et README « Tests ») ; `npm test` doit rester vert, le test de cohérence du projet vérifie aussi ce fichier (statuts, dépendances, tâches terminées documentées, cette section).
- Toute nouvelle route API : elle sera contrôlée par l'audit d'autorisation automatique (toutes les routes Express, voir P2-07) — la déclarer publique ou la protéger explicitement.
- Décisions clients encore ouvertes, listées à la fin de P2-07 (règle des formations sans cours obligatoire, visibilité du nom sur la vérification publique, mentions du certificat).
- Rappel : `npx prisma generate` après chaque migration (voir P1-08) ; sur une machine neuve : `npm install` dans `client/` et `server/`, `prisma migrate deploy`, `JWT_SECRET` dans `server/.env` (voir README).

Blocages / informations manquantes signalées (non bloquantes pour continuer, mais à ne pas oublier avant livraison) :
- Mentions légales et politique de confidentialité : identité légale du client (raison sociale, SIRET, adresse, hébergeur, contact DPO) à fournir avant mise en production (voir notes P1-03).
- Formulaire de contact : aucune coordonnée réelle (email/téléphone/adresse) fournie. Depuis P3-16, un administrateur peut les saisir lui-même (page « Paramètres ») et elles s'affichent aussitôt sur `/contact` et dans le pied de page — reste seulement à ce que le client transmette (ou saisisse) les informations réelles.
- Fournisseur d'email non défini : « mot de passe oublié » reste inactif et les messages du formulaire de contact ne sont que stockés en base (voir P1-07). La newsletter (P3-05) est construite mais ne peut rien envoyer tant qu'il n'est pas choisi ; à choisir avant la mise en production.
- Paiement (`P3-08`, `⛔ blocked`) : fournisseur / banque, moyens de paiement, devise, offres et règles de remboursement **non définis** ; le client fait ses propres recherches (liste des points dans `P3-08`). Bloque `P3-10`, pas `P3-09`.
- Assistant guidé (`P3-07`) : questions et réponses à fournir par le client ; aucun contenu inventé.
- Simulateur de crédit (P4-02) : règles bancaires/taux à fournir par le client le moment venu — rappel déjà noté dans la tâche elle-même.

Point de vérification manuelle recommandé pour l'utilisateur : ouvrir `http://localhost:5173` après `npm run dev` dans `client/` et tester le menu mobile sous 860px de large (non vérifié visuellement par Claude faute d'outil navigateur dans cette session).

Objectif final :
Livrer un MVP exploitable de la plateforme dans un délai maximal de **8 semaines**, en respectant l'ordre :
**Frontend principal → E-Learning → Blog/CMS/Newsletter → Outils → Sécurité/Tests/Livraison**.

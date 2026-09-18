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
- Statut : `❌ todo`
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

### P1-07 — Intégration frontend/backend
- Statut : `❌ todo`
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

### P1-08 — Validation de fin de phase
- Statut : `❌ todo`
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

---

# PHASE 2 — E-LEARNING
## Durée : 2 semaines
## Objectif

Livrer le cœur de la plateforme de formation.

### P2-01 — Modèle de données E-Learning
- Statut : `❌ todo`
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

### P2-02 — Gestion des formations côté client/admin
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P2-01`
- Durée cible : 2 jours

Fonctionnalités :
- Créer une formation.
- Modifier une formation.
- Définir le nombre de cours.
- Ajouter / modifier / supprimer les cours.
- Définir les informations de certification.
- Publier / dépublier une formation.
- Organiser l'ordre des cours.

### P2-03 — Interface utilisateur E-Learning
- Statut : `❌ todo`
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

### P2-04 — Suivi de progression
- Statut : `❌ todo`
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
- Dépendances : `P3-01`
- Durée cible : 2 jours

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

Règle ajoutée le 2026-09-18 (voir P1-10) : toute nouvelle page ou tout nouveau composant texte, à partir de maintenant, doit utiliser `useTranslation()`/`t()` (i18next) dès sa création — jamais de texte en dur. Les traductions français/anglais/arabe correspondantes doivent être ajoutées dans le même changement (le tamazight reste volontairement en repli vers le français). Les couleurs doivent utiliser les tokens CSS existants (`index.css`), pas de couleurs codées en dur, pour rester compatibles avec le mode clair/sombre.

# 7. État actuel

Phase active : `PHASE 1`

Dernières tâches terminées et vérifiées :
`P1-05 — Backend minimal et navigation dynamique`, `P1-09 — Mode clair / sombre`, `P1-10 — Internationalisation (i18n)` (toutes ✅ done)

Toutes les tâches de pages (P1-02, P1-03, P1-04), le socle backend (P1-05) et les deux ajouts signalés par l'utilisateur (mode clair/sombre, i18n FR/EN/AR + tamazight en repli) sont terminés. Le modèle `User` existe en base (Prisma).

Prochaine tâche réalisable (dépendances satisfaites) :
- `P1-06 — Authentification + rôles` (dépend de `P1-04` ✅ et `P1-05` ✅).

Rappel de dépendances à venir :
- `P1-07 — Intégration frontend/backend` dépend de `P1-03` ✅, `P1-05` ✅ et `P1-06` ❌ — reste bloquée tant que P1-06 n'est pas fait.
- `P1-08 — Validation de fin de phase` dépend désormais de `P1-07` ❌, `P1-09` ✅ et `P1-10` ✅.

Recommandation : `P1-06` est la seule tâche non bloquée pour continuer la Phase 1.

Blocages / informations manquantes signalées (non bloquantes pour continuer, mais à ne pas oublier avant livraison) :
- Mentions légales et politique de confidentialité : identité légale du client (raison sociale, SIRET, adresse, hébergeur, contact DPO) à fournir avant mise en production (voir notes P1-03).
- Formulaire de contact : aucune coordonnée réelle (email/téléphone/adresse) fournie — non affichée pour éviter de publier une information inventée.
- Simulateur de crédit (P4-02) : règles bancaires/taux à fournir par le client le moment venu — rappel déjà noté dans la tâche elle-même.

Point de vérification manuelle recommandé pour l'utilisateur : ouvrir `http://localhost:5173` après `npm run dev` dans `client/` et tester le menu mobile sous 860px de large (non vérifié visuellement par Claude faute d'outil navigateur dans cette session).

Objectif final :
Livrer un MVP exploitable de la plateforme dans un délai maximal de **8 semaines**, en respectant l'ordre :
**Frontend principal → E-Learning → Blog/CMS/Newsletter → Outils → Sécurité/Tests/Livraison**.

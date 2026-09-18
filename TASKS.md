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
- Statut : `❌ todo`
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

### P1-04 — Pages utilisateurs
- Statut : `❌ todo`
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

### P1-05 — Backend minimal et navigation dynamique
- Statut : `❌ todo`
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

### P1-08 — Validation de fin de phase
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P1-07`
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

# 7. État actuel

Phase active : `PHASE 1`

Dernière tâche terminée et vérifiée :
`P1-02 — Architecture frontend` (✅ done)

Prochaines tâches réalisables (dépendances satisfaites) :
- `P1-03 — Pages publiques principales` (dépend de P1-02 ✅)
- `P1-04 — Pages utilisateurs` (dépend de P1-02 ✅)
- `P1-05 — Backend minimal et navigation dynamique` (dépend de P1-01 ✅)

Recommandation : `P1-03` en priorité (contenu public, socle SEO/premiers visiteurs), `P1-04` peut suivre juste après, `P1-05` peut être mené en parallèle logique côté backend.

Point de vérification manuelle recommandé pour l'utilisateur : ouvrir `http://localhost:5173` après `npm run dev` dans `client/` et tester le menu mobile sous 860px de large (non vérifié visuellement par Claude faute d'outil navigateur dans cette session).

Objectif final :
Livrer un MVP exploitable de la plateforme dans un délai maximal de **8 semaines**, en respectant l'ordre :
**Frontend principal → E-Learning → Blog/CMS/Newsletter → Outils → Sécurité/Tests/Livraison**.

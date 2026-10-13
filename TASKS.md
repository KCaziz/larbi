# Plateforme E-Learning, Blog & Outils — Task Tracker

Ce fichier liste les tâches, leurs statuts, dépendances et périmètres. Les détails de mise en œuvre (fichiers livrés, décisions techniques, tests effectués) sont dans [NOTES_TECHNIQUES.md](NOTES_TECHNIQUES.md), avec un lien à la fin de chaque tâche concernée.

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

5. **FINCLUDIA — gestion financière personnelle** (nouvelle direction ajoutée le 2026-10-09, voir Phase 6)
   - sources fournies par le client, à la racine du dépôt : `FINCLUDIA spécification des parcours fonctionnels.odt` (écrans et parcours) et `FINCLUDIA_Cahier_des_Charges_Complet.xlsx` (20 onglets : 81 écrans, 417 champs, 30 calculateurs, 57 formules F001–F060, 4 algorithmes, 7 moteurs de recherche, 23 domaines d'API, tests, ordre de construction) ; **ces deux fichiers font foi** pour tout ce qui concerne FINCLUDIA
   - 8 publics, chacun avec son parcours : lycéen (« Avenir »), étudiant (« Campus »), jeune actif (« Premier Revenu »), salarié (« Mon Argent »), colocataire, couple, famille, épargnant débutant ; un socle d'écrans communs (C01–C26) décliné par public, des écrans partagés (P01–P05) et des écrans propres à chaque public
   - modules : Mon argent (revenus, transactions, budgets, calendrier), Mes objectifs, Ma sécurité (réserve, dettes), Mon patrimoine, Investir & simuler (portefeuille **fictif**), À plusieurs (espaces partagés), Explorer / comparer, Apprendre, atelier de simulation, décodeur de fiche de paie, assistant **déterministe** (aucune IA générative)
   - principes imposés par le client : ne demander une donnée que lorsqu'elle sert (en expliquant pourquoi) ; tout score ou calcul affiche ses variables, hypothèses, date et version de formule ; **le réel et le fictif ne partagent jamais un total** ; une valeur non calculable s'affiche « non calculé », jamais 0 ; jamais de « score de crédit », de promesse d'accord ou de « meilleure offre » opaque ; fonctions réservées aux 18 ans et plus interdites aux mineurs ; 3 actions prioritaires au maximum à l'accueil
   - ce que l'existant couvre déjà : comptes et connexion (C01, partiel), Apprendre (C21 : formations, quiz, certificats, blog), comparateur banque (base d'ET06 / C20), types de compte (base des 8 publics), assistant à questions prédéfinies (base de C26, `P3-07`)

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
| Phase 6 | Hors des 8 semaines (ajout du 2026-10-09) | FINCLUDIA : gestion financière personnelle (voir « Impact sur le délai (FINCLUDIA) » en fin de Phase 6) |

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p1-01).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p1-02).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p1-03).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p1-04).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p1-05).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p1-06).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p1-07).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p1-09).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p1-10).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p1-11).

### P1-12 — FINCLUDIA : système de design et navigation de l'espace connecté (lot 0)
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P1-11`, `P6-01`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (spécification § 2–3 et § 17, onglets `14_Etats_Alertes` et `19_Cartes_Parcours`)

Objectif : poser les composants communs à tous les écrans FINCLUDIA avant d'écrire le moindre écran métier (lot 0 du backlog client : « aucune dépendance, tout le reste en dépend »).

Tâches :
- Navigation de l'espace connecté : menu principal FINCLUDIA (Aujourd'hui, Mon argent, Mes objectifs, Ma sécurité, Mon patrimoine, Investir & simuler, À plusieurs, Explorer, Apprendre), **latéral sur ordinateur, onglets + menu secondaire sur téléphone** ; entrées affichées ou masquées **selon le public** (carte des parcours, onglet `19_Cartes_Parcours`) et l'âge (mineur : pas d'entrées réservées aux 18 ans et plus). Le masquage n'est qu'un confort : chaque route serveur vérifie elle-même le droit (règle 2).
- Barre supérieure : recherche globale (branchée en `P6-20`), notifications (`P6-18`), aide / assistant (`P3-19`), profil.
- Composants réutilisables : carte KPI (valeur, unité, date de calcul, bouton « Pourquoi ? » qui affiche formule, variables et hypothèses, état **« non calculé »** distinct de zéro) ; carte « Prochaine action » (titre, raison, impact, bouton principal, « Pourquoi ? ») ; bannière de qualité des données (donnée manquante, ancienne ou seulement déclarée) ; sélecteur de période (semaine, mois, 90 jours, année) ; **sélecteur Réel / Fictif** avec séparation visuelle forte et badge permanent « SIMULATION » ; champ montant (entier, devise obligatoire) ; champ « Pourquoi cette question ? ».
- États UX communs (onglet `14_Etats_Alertes`) : vide (utilité + un seul appel à l'action), chargement (squelette, double envoi empêché, saisie conservée), partiel / donnée ancienne, succès (confirmation brève + impact recalculé), erreur près du champ.
- Accessibilité exigée par le client : libellés explicites, erreurs près des champs, navigation au clavier, **jamais la couleur seule** pour porter un sens.
- Règles du projet inchangées : `t()` fr / en / ar, tokens CSS (clair / sombre), propriétés logiques (RTL), icônes `lucide-react`, `icon-dir`.
- Tests : balayage du site (`e2e/site-sweep.test.js`) étendu aux nouvelles pages, toutes langues, 375 et 1280 px ; parcours clavier.

**Déjà livré par `P6-03` (2026-10-12), donc hors du reste à faire :** les **composants réutilisables** du troisième point — carte de chiffre avec « Pourquoi ? » (formule, version, données utilisées, date) et état **« non calculé » distinct de zéro**, champ montant entier à devise obligatoire, **badge « SIMULATION »** permanent avec séparation visuelle forte du fictif, champ « Pourquoi cette question ? » — dans `client/src/components/fincludia/`. Les **états UX communs** (vide, chargement, succès, erreur près du champ) existent depuis `P1-11` (`LoadingState`, `ErrorState`, `Notice`, `form-status` / `form-error`), et le défaut qui démontait la page à chaque écriture est corrigé dans `useApi` (voir `P6-04`).

**Reste à faire, et ce qui le bloque :** la **navigation de l'espace connecté** (menu par public selon l'onglet `19_Cartes_Parcours`, latéral sur ordinateur, onglets sur téléphone) et la **barre supérieure** — elles dépendent du périmètre de la première livraison (`P6-01` point 2), de la recherche globale (`P6-20`) et des notifications (`P6-18`) ; plus le **sélecteur de période** et la **carte « Prochaine action »**, qui attendent les écrans qui les utilisent.

Important : le nom **FINCLUDIA** est tranché (décision du 2026-10-09, voir `P6-01` point 1 et le renommage documenté sous `P4-09`) ; le logo et la charte restent à fournir.

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p2-01).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p2-02).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p2-03).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p2-04).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p2-05).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p2-06).

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

### P2-08 — FINCLUDIA : « Apprendre » — glossaire, mini-guides et recherche pédagogique
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P2-07`, `P3-18`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écran C21, moteur « Learning Search » de l'onglet `12_Recherche`)

L'e-learning existant (formations, leçons, quiz, certificats) et le blog forment déjà le cœur d'« Apprendre ». Ce qui manque :
- **Glossaire** (terme, définition, exemple, termes liés) et **mini-guides**, gérés dans le CMS existant, **versionnés** (le client exige un contenu versionné : une définition remplacée garde son historique).
- **Niveau** (débutant / intermédiaire / avancé) et **thème** sur formations, articles, termes et guides ; contenus proposés selon le public (`P3-18`) — ordonner, jamais cacher, comme le ciblage des articles (`P3-04`).
- Page « Apprendre » unique : recherche lexicale (terme, niveau, thème, format), résultats groupés cours / glossaire / guides / quiz, bouton « Simuler » quand un calculateur correspond (`P4-09`), favoris.
- Mention imposée : **aucun contenu ne remplace un conseil réglementé**.
- Tests : fonctionnels (versionnage, recherche, droits premium inchangés), navigateur.

Décision (2026-10-11) : le glossaire et les mini-guides sont **rédigés par l'équipe** (définitions générales de termes financiers courants), plus attendus du client. Reste la règle de fond : aucun contenu propre à une offre, un taux, une règle légale ou fiscale n'est inventé — ce qui est spécifique au client (barèmes, règles, offres) reste à faire valider par lui.

Réalisé en deux temps. Le 2026-10-11 (migration `finculdia_p3_18_p2_08_p3_19`) : glossaire **versionné** (chaque remplacement d'une définition garde l'ancienne, sans limitation de fréquence — la règle du client), mini-guides, administration dans le CMS, pages publiques `/apprendre`, `/apprendre/termes/:slug`, `/apprendre/guides/:slug`, niveau et thème sur les deux.

Terminé le 2026-10-11 (migration additive `apprendre_axes_favorites`) — ce qui manquait par rapport à la spécification :
- **La recherche couvre les quatre familles de contenu que le client liste** (cours, glossaire, mini-guides, articles), groupées, et non plus le glossaire seul. Les quatre partagent **une seule forme de carte**, ce qui permet à un même composant de les afficher.
- **Les deux axes existent désormais sur les quatre** : un thème sur les formations, un niveau et un thème sur les articles. Filtrer sur un axe qu'une partie du contenu ne porte pas n'aurait filtré qu'une partie du contenu.
- **Bouton « Simuler »** : un terme ou un guide peut pointer vers un calculateur, **choisi par un administrateur** et validé contre le registre des simulateurs. Le deviner à partir du libellé aurait envoyé les gens vers le mauvais outil ; une clé dont le simulateur a disparu n'affiche pas de bouton plutôt qu'un lien mort.
- **Favoris** (`/api/apprendre/favoris`) : une ligne par (compte, nature, référence). Un favori qui pointe vers un contenu dépublié ou supprimé disparaît simplement de la liste, au lieu d'afficher une carte morte.
- **La mention imposée** (« aucun contenu ne remplace un conseil réglementé ») est affichée sur la page.

Décisions :
- **Ordonner, jamais cacher** (la règle de `P3-04` étendue aux quatre familles) : le contenu du public de la personne passe en premier, rien n'est retiré en fonction de qui lit. Les seules choses qui masquent un contenu restent la publication et le verrou premium, qui existaient déjà.
- **Un article premium est trouvé et affiché, mais son texte n'est fouillé que pour qui a le droit de le lire** : chercher dans le corps d'un article payant révèlerait son contenu mot à mot. C'est la règle que le blog applique déjà, reprise à l'identique.
- **Les quiz ne sont pas des résultats autonomes** : un quiz n'a pas de page publique et ses questions sont du contenu protégé. La carte d'une formation annonce combien elle en contient, ce qui répond au besoin sans exposer les questions.
- **Une formation dit qu'elle demande un compte** sur sa carte, plutôt que de mener à un refus.
- **Les thèmes proposés en filtre sont ceux présents dans les résultats** : le vocabulaire est libre (ce sont les administrateurs qui l'écrivent), donc une liste figée proposerait des thèmes que rien ne porte, ou en oublierait.

Tests : `tests/functional/glossary.test.js` passe de 11 à **20 tests** (quatre groupes, les deux axes sur chaque famille, brouillons absents, article premium trouvable sans que son texte le soit, ordre par public sans rien cacher, calculateur validé contre le registre, favoris : session exigée, propriété du compte, double clic sans erreur, contenu non publié refusé, nature inconnue refusée, favori dépublié qui disparaît) ; un parcours navigateur ajouté à `tests/e2e/fincludia-journey.test.js`.

Deux défauts trouvés et corrigés :
- **L'audit d'autorisation a refusé la suppression d'un favori** : la vérification du paramètre d'URL répondait 404 avant que `requireAuth` ait pu répondre 401. Les favoris sont donc un **sous-routeur** avec son propre `requireAuth`, et non trois routes gardées une par une.
- **Dans l'administration du glossaire, créer un terme ou un guide laissait l'administrateur sur la liste**, alors qu'une entrée est créée vide et qu'une entrée vide ne peut pas être publiée : créer ouvre maintenant l'éditeur. Et comme pour le profil FINCLUDIA, chaque enregistrement rechargeait la liste en remplaçant la page par l'état de chargement, ce qui détruisait le message de confirmation.

Limites : les favoris n'ont pas d'écran dédié (ils sont une section de `/apprendre`). Le contenu du glossaire et des guides reste à écrire : la mécanique est là, les définitions sont à produire. Le ciblage par public se fait sur le thème de l'entrée ; un ciblage explicite par public viendra avec `P6-17` si le client le demande.

### P2-09 — FINCLUDIA : indice de connaissances financières et passeports (Avenir, étudiant)
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P2-08`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans LY11, LY12, ET09 ; formule F052)

Tâches :
- **Indice de connaissances financières** (F052) calculé côté serveur à partir des quiz réussis et modules terminés, **séparé** du score de quiz et de tout score financier ; formule et version affichées.
- Module **« Sécurité numérique »** (hameçonnage, mot de passe, carte, code OTP, liens frauduleux, achats en ligne) : un parcours de quiz construit avec l'outil existant (`P3-13`), contenu fourni par le client.
- **Passeport Avenir** (lycéen) et **passeport financier étudiant** : compétences acquises, progression, étapes suivantes, export d'une **attestation pédagogique** (réutilise la génération de certificats, `P2-05`). Mention obligatoire : **le passeport n'est pas un score bancaire et ne mesure pas la solvabilité**.
- Tests : unitaires (indice), fonctionnels (attestation, cloisonnement par utilisateur), navigateur.

### P2-10 — FINCLUDIA : défis et missions pédagogiques (lycéen)
- Statut : `❌ todo`
- Priorité : `🟢 low` — **abandonné pour l'instant** (décision du 2026-10-11, voir note ci-dessous)
- Dépendances : `P2-09`, `P6-12`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écran LY03)

Tâches :
- Catalogue de missions courtes (choix successifs sur une somme **fictive**), résultat cash / épargne / résilience pédagogique, explication de chaque choix, rejouer.
- Score de mission selon des règles configurées et explicables, **séparé** de l'indice de connaissances (`P2-09`) ; badges.
- Aucune conséquence sur des données réelles ; adapté aux mineurs.

Décision (2026-10-11) : cette tâche n'est plus demandée au client et n'est plus poursuivie pour l'instant ; elle pourra être reprise plus tard si une source de contenu (scénarios, règles de points, textes) est définie.

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-01).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-02).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-03).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-04).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-05).

### P3-06 — Suite de tests automatisés (unitaires, fonctionnels, sécurité, cohérence globale)
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P3-03`
- Durée cible : ajout demandé par le client le 2026-09-19 (hors plan initial ; avance une partie de `P5-05`)

Demande : tests unitaires, fonctionnels et de sécurité, plus un test de cohérence globale de l'ensemble du système. Jusqu'ici les vérifications étaient des scripts jetables hors du dépôt ; elles sont désormais **versionnées** dans `server/tests/`, rejouables par n'importe qui (commandes et prérequis dans le README, section « Tests »).

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-06).

### P3-07 — Assistant guidé (chatbot à questions / réponses prédéfinies)
- Statut : `✅ done`
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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-07).

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
- Statut : `✅ done`
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

Décisions par défaut retenues en attendant `P3-08` (à confirmer avec le client) : une offre est un **achat unique** qui accorde le niveau premium **sans durée** (abonnement et expiration attendent `P3-08`) ; un **remboursement retire le premium**, sauf si une autre commande payée le justifie encore ; les prix et devises sont **saisis par l'administrateur** à partir des informations du client.

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-09).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-11).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-12).

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

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-13).

### P3-14 — CMS pédagogique, lot D : finitions
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P3-13`
- Durée cible : 2 jours

Tâches (périmètre réellement retenu ; ce qui a été écarté est listé dans « Décisions ») :
- Aperçu étudiant d'une formation entière (présentation, plan, leçons bloc par bloc, quiz).
- Duplication d'une leçon, d'un chapitre et d'une formation.

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-14).

### P3-15 — Types de compte dynamiques
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P1-06`
- Durée cible : ajout demandé par le client le 2026-09-25 (hors plan initial)

Demande : en plus des catégories déjà prévues (auto-entrepreneur, PME, PMI), prévoir dès maintenant étudiant, lycéen et salarié, et permettre à l'administrateur d'**ajouter de nouveaux types de compte plus tard, sans modification du code**.

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-15).

### P3-16 — Panel d'administration étendu (utilisateurs, droits, paramètres, médiathèque, certifications) et tableau de bord personnalisé
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P3-15`, `P2-07`
- Durée cible : ajout demandé par le client le 2026-09-25 (hors plan initial)

Demande : un panel d'administration permettant de gérer les utilisateurs, les types de compte, les droits et accès, les médias et les certifications, avec des paramètres de plateforme éditables sans intervention technique, une architecture extensible pour ajouter d'autres fonctions plus tard ; et un tableau de bord personnalisé selon le profil de l'utilisateur connecté (informations personnelles, formations, progression, certifications, contenus pertinents pour son profil).

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-16).

### P3-17 — Articles multilingues (traductions)
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P3-16`, `P3-04`
- Durée cible : ajout demandé par le client le 2026-09-26 (hors plan initial)

Demande : chaque article a une langue ; l'administrateur peut le traduire s'il a le temps, sinon l'article s'affiche dans sa langue d'origine ; une petite balise indique les langues disponibles ; la langue affichée suit automatiquement la langue de navigation choisie.

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p3-17).

### P3-18 — FINCLUDIA : publics (personas), âge, intention et changement de parcours
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P3-15`
- Dépendance à `P6-01` retirée le 2026-10-11 : son point 3 (un seul profil actif) est tranché, et les deux points encore ouverts qu'elle touche sont traités comme des **réserves déclarées** plutôt que comme des inventions — la devise par défaut est `DZD` et le dit (point 4), et l'âge est une **tranche** (`under18` …) prête pour l'âge minimum et le consentement parental que le client fixera (point 7). La tâche n'attend donc plus rien pour être utile.
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans C01, C02, JA01 ; onglet `01_Publics`)

Les types de compte dynamiques (`P3-15`) sont la base, mais FINCLUDIA va plus loin :
- **8 publics** (LYC, ETU, JAC, SAL, COL, COU, FAM, EPG) avec leur nom d'expérience ; **un profil principal** et des **rôles complémentaires** activables sans dupliquer les données (ex. salarié + colocataire).
- Inscription / profil (C01, C02) : pays, langue, **devise par défaut**, tranche d'âge, situation, intention principale, horizon ; **consentements versionnés** (date, version du texte accepté) ; « Je ne sais pas » et « Modifier plus tard » toujours possibles. Connexion par téléphone : **abandonnée** (décision du 2026-10-11, pas de SMS).
- **Mineurs** : contrôle **côté serveur** qui interdit les fonctions réservées aux 18 ans et plus (crédit, offres, couple / foyer contractuel…) ; combinaisons âge / public incohérentes refusées.
- **Changement de parcours** (ex. étudiant → jeune actif au premier salaire) : proposé, **jamais forcé**, historique des parcours conservé (`/profile/transitions`).
- Aucune donnée financière demandée avant le consentement.
- Tests : fonctionnels (transitions, refus mineur sur chaque route réservée), sécurité (un mineur ne passe pas en appelant l'API directement), cohérence (public de chaque compte connu).

Décision (2026-10-11) : les types existants **auto-entrepreneur / PME / PMI** (orientés entreprise) et les 8 publics FINCLUDIA (particuliers) ne coexistent jamais sur un même compte — **un utilisateur a un seul profil actif à la fois**, jamais deux étiquettes en même temps. Reste à détailler à l'implémentation : la bascule exacte (remplacement pur des anciens types, ou liste unique où l'utilisateur choisit une seule valeur parmi l'ensemble).

Réalisé (2026-10-11, migration additive `finculdia_p3_18_p2_08_p3_19`) :
- **Les 8 publics viennent du fichier client** (onglet `01_Publics`) : code, libellé, nom d'expérience et mission sont recopiés, pas réécrits. Un profil principal, des rôles complémentaires, et l'écran `/compte/fincludia` (C01 / C02) où chaque champ reste facultatif, avec « je ne sais pas / plus tard » toujours possible.
- **Consentements versionnés** : une ligne par acceptation, avec la version exacte du texte accepté ; réaccepter après une modification ajoute une ligne, n'écrase jamais la précédente. Aucune donnée financière n'est demandée avant le consentement.
- **Changement de parcours** proposé, jamais forcé, et historisé (`/profile/fin/transitions`).
- **L'âge est une tranche, pas une date de naissance** (minimisation) : le serveur n'a besoin de savoir qu'une chose, « moins de 18 ans ou non ». Le garde-fou `requireAdult` **refuse par défaut** — une tranche non renseignée est traitée comme un mineur, pas comme un adulte.

Vérifié le 2026-10-11 (audit de ce qui était livré mais non documenté) : `tests/functional/finProfile.test.js`, `tests/security/finProfile.test.js` et le parcours navigateur `tests/e2e/fincludia-journey.test.js` passent.

Défaut trouvé et corrigé lors de cet audit : **l'enregistrement du profil fonctionnait mais ne disait rien**. Le message de confirmation était tenu par le formulaire, alors que sauvegarder recharge le profil — et le premier enregistrement change en plus la clé de ce formulaire (`finOnboardedAt` cesse d'être nul), donc le message était détruit avant d'avoir été lu. La confirmation appartient désormais à la page, et un rechargement ne remplace plus l'écran par l'état de chargement.

Limites : `requireAdult` existe, est testé, et **ne garde encore aucune route** — les fonctions réservées aux 18 ans et plus (crédit selon les règles des banques, offres, foyer contractuel) ne sont pas encore construites. Il sera appliqué en même temps qu'elles. L'âge minimum d'inscription et le consentement parental restent à trancher (`P6-01` point 7).

### P3-19 — FINCLUDIA : assistant déterministe (intentions, parcours à étapes, liens profonds)
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P3-07`, `P4-09`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écran C26, onglet `13_Chatbot`)

Évolution de l'assistant à questions prédéfinies (`P3-07`) vers l'assistant FINCLUDIA, **toujours sans IA générative** :
- **Résolveur d'intentions** à liste fermée (NAVIGUER, EXPLIQUER_INDICATEUR, CRÉER_OBJECTIF… — liste de l'onglet `13_Chatbot`) par mots-clés, synonymes et contexte de l'écran ; si la confiance est insuffisante, proposer 4 à 6 catégories puis la recherche globale.
- **Moteur de parcours** (machine à états : parcours, étape, réponses possibles, étape suivante) — lève la limite « liste simple, pas d'arbre de décision » de `P3-07`.
- **Modèles de réponse** pré-écrits avec variables lues dans les API de calcul (`P4-09`) en **lecture seule** ; aucune écriture, aucun calcul propre, **jamais de recommandation générée**.
- **Liens profonds** vers un écran, un filtre ou un simulateur ; message de secours si une API est indisponible.
- **Journal d'audit** : intention, parcours, version du modèle, action cliquée, erreur (sans donnée financière en clair).
- Administration des intentions, synonymes, parcours et modèles dans le CMS.
- Tests : unitaires (résolution, repli), fonctionnels, sécurité (aucune donnée d'un autre utilisateur dans une réponse), navigateur.

Important : intentions, réponses et parcours sont **fournis ou validés par le client** (même règle que `P3-07`).

Réalisé (2026-10-11, migration `finculdia_p3_18_p2_08_p3_19`) : les 8 intentions de l'onglet `13_Chatbot` en liste fermée (contrainte en base), résolution par mots-clés, repli sur des catégories quand la confiance est insuffisante, moteur de parcours à étapes, liens profonds pris dans une **liste blanche re-vérifiée côté serveur**, journal d'audit sans donnée financière ni texte de requête en clair, et l'administration des intentions et des parcours dans le CMS.

Vérifié le 2026-10-11 : `tests/functional/finAssistant.test.js`, `tests/security/finAssistant.test.js` et les deux parcours navigateur passent.

Défaut trouvé et corrigé lors de cet audit : **le résolveur était inatteignable**. Le bouton flottant de l'assistant se masquait dès qu'aucune **question prédéfinie** (`P3-07`) n'était publiée — alors que les intentions de `P3-19` sont un contenu à part entière, et que le commentaire du composant disait déjà « rien n'est affiché quand **ni l'un ni l'autre** n'a de contenu publié ». Le composant lit maintenant aussi les intentions publiées, et le champ de saisie libre n'apparaît que s'il y a de quoi répondre : un champ qui ne peut répondre que « je n'ai pas compris » est pire que pas de champ.

Limites : les intentions sont livrées en **brouillon**, avec leurs libellés du fichier client mais sans réponses rédigées — elles restent à écrire et à valider (`P6-01` point 10). Les modèles de réponse ne lisent pas encore de variable dans les API de calcul : ils sont du texte pré-écrit, ce qui est la partie prudente de la spécification.

### P4-01 — Architecture commune des outils
- Statut : `✅ done`
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

Plan (2026-10-04) : la Phase 4 commence à la demande de l'utilisateur par le **comparateur bancaire** (`P4-06` à `P4-08`), premier outil qui sert aussi à poser cette architecture commune. Le simulateur de crédit (`P4-02`) et le générateur de facture (`P4-03`) gardent leurs propres tâches.

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p4-01).

### P4-02 — Simulateur de crédit
- Statut : `⛔ blocked`
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

Blocage (2026-10-11) : les deux classeurs du client donnent des **conditions bancaires** (frais, commissions), pas de **règles d'octroi ni de formules de capacité d'emprunt** (taux par banque, durée maximale, taux d'endettement admis, apport, critères de patrimoine). Sans elles, le simulateur ne peut rien calculer sans inventer. À fournir par le client ; le moteur de calcul versionné (`P4-09`) et les calculateurs de crédit génériques (`P4-11`) sont prêts à les recevoir.

### P4-03 — Générateur de facture
- Statut : `✅ done`
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

Décisions par défaut retenues (à confirmer avec le client) : **aucun taux de TVA ni mention légale n'est imposé** (l'utilisateur saisit le taux de chaque ligne et ses identifiants) ; numéro de facture **saisi par l'utilisateur** (pas de numérotation automatique, qui supposerait de conserver les factures) ; TVA arrondie **ligne par ligne** ; **rien n'est conservé sur le serveur** ; PDF produit par le navigateur, comme le certificat.

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p4-03).

### P4-04 — Simulateur fiscalité
- Statut : `❌ todo`
- Priorité : `🟢 low`
- Dépendances : `P4-03`
- Durée cible : 0 jour dans le MVP

Décision :
- Ne pas planifier son développement dans les 8 semaines tant que le périmètre et les règles fiscales ne sont pas clairement définis.
- Peut être ajouté en V2 si le client fournit les règles et si le délai réel le permet.

### P4-06 — Comparateur bancaire, lot A : données et API publique
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P4-01`
- Durée cible : 1 jour

Demande (2026-10-04) : le client a fourni deux classeurs, `Tableaux_conditions_bancaires_mise_en_forme.xlsx` (la base : 6 onglets, 13 banques algériennes) et `Conditions_bancaires_par_thematiques_et_segments.xlsx` (le découpage du comparateur, construit **exclusivement** sur la base : 11 rubriques + un comparatif transversal Particuliers / Professionnels / Entreprises). Règles du client, reprises telles quelles : aucune donnée externe, aucune donnée inventée, les mentions « Gratuit », « Non spécifié » et les conditions sont conservées mot pour mot, un segment n'est attribué que s'il figure dans le libellé, les parts de bénéfices (finance islamique) et les taux d'intérêt (finance conventionnelle) ne sont jamais assimilés.

Tâches :
- Modèle de données : banques, et conditions (rubrique, segment, catégorie, libellé, valeurs propres à chaque rubrique).
- Les 11 rubriques du guide client, chacune avec ses propres colonnes ; les trois rubriques sans donnée (coffres-forts, virements domestiques, chèques) existent mais sont présentées comme « non documentées ».
- Reprise des données du classeur client (migration de données reproductible) ; anomalies évidentes du fichier source corrigées **et signalées** au client, rien d'autre de modifié.
- Coût annuel estimé calculé côté serveur, seulement quand le tarif est un montant simple (jamais pour l'épargne, les crédits ou les frais en pourcentage).
- API publique en lecture : résumé, une rubrique, une vue par segment.
- Contrôles de cohérence de la base et tests.

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p4-06).

### P4-07 — Comparateur bancaire, lot B : pages publiques
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P4-06`
- Durée cible : 1 jour

Tâches :
- Page d'accueil du comparateur (rubriques, nombre de banques et d'offres, rubriques non documentées signalées, date de mise à jour, mention « à titre indicatif »).
- Page par rubrique : filtres par segment, par banque et recherche ; tri par coût annuel estimé quand la rubrique s'y prête ; tableau sur ordinateur, fiches sur téléphone.
- Comparatif par segment (Particulier / Professionnel / Entreprise), comme l'onglet 12 du classeur client.
- Textes fr / en / ar (les données elles-mêmes restent dans la langue du fichier client).
- Parcours navigateur et balayage du site (toutes langues, 375 px).

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p4-07).

### P4-08 — Comparateur bancaire, lot C : administration des données
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P4-06`
- Durée cible : 1 jour

Tâches :
- Entrée « Comparateur bancaire » dans l'administration.
- Banques : ajout, renommage, suppression (avec ses conditions, après confirmation).
- Conditions par rubrique : ajout, modification, suppression, avec les colonnes propres à la rubrique ; validation côté serveur.
- La date « données mises à jour le » affichée au public suit automatiquement les modifications.
- Tests fonctionnels et parcours navigateur.

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p4-08).

### Impact sur le délai (comparateur, ajout du 2026-10-04)

Le comparateur bancaire n'était pas dans le plan initial (Phase 4 : simulateur de crédit + générateur de facture). Estimation : **environ 3 jours** (`P4-01` compris). Le simulateur de crédit reste dépendant des règles de calcul du client (les classeurs fournis donnent des conditions, pas de formules : « TR + Marge », fourchettes, etc.). Proposé ensuite, hors de ce plan : import d'un classeur mis à jour depuis l'administration, simulation des frais pour un montant donné (retraits, transferts), traduction des données.

### P4-09 — FINCLUDIA : moteur de calcul versionné
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P4-01`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (onglets `10_Formules`, `11_Algorithmes`, `15_API` « contrat calcul critique »)

Socle de **tous** les calculs FINCLUDIA (tableaux de bord, objectifs, dettes, assistant…) : un seul endroit, côté serveur.
- Catalogue des formules **F001–F057** et algorithmes **ALG-01 à ALG-04**, chacun avec identifiant et **version** ; une formule modifiée devient une nouvelle version, l'ancienne reste lisible.
- **Contrat de réponse imposé** pour tout calcul critique : `resultat`, `unite`, `formule_id`, `formule_version`, plus variables utilisées, hypothèses, date de calcul et qualité des données (champs exacts : onglet `15_API`).
- Règles transversales du client : taux calculés en décimal et affichés en %, **division par zéro = « non calculé »** (jamais 0), normalisation mensuelle (F001 : hebdo × 52/12, trimestriel × 1/3…), **même devise et même période** obligatoires (pas de conversion implicite sans taux daté), montants en entiers.
- Les tableaux de bord **ne recalculent jamais** localement : ils lisent ce moteur.
- Tests : **un test unitaire par formule** avec les cas de l'onglet `16_QA_Tests`, cas limites (zéro, négatif, devise différente).

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p4-09).

### P4-16 — FINCLUDIA : atelier de simulation (C18)
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P4-09`, `P4-10`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écran C18) ; sorti de `P4-09` le 2026-10-09

Séparé de `P4-09` en cours de route : le moteur de calcul est sans état et utilisable tel quel, tandis que l'atelier est un **écran** qui a besoin de simulateurs à héberger — un atelier livré avant le premier calculateur (`P4-10`) serait une page vide.

Tâches :
- Point d'entrée unique de tous les calculateurs : recherche d'un type de simulation, paramètres selon le simulateur, résultat avec ses hypothèses et sa sensibilité.
- **Scénario enregistré avec ses hypothèses ET la version de formule** utilisée (migration additive), afin qu'un scénario rouvert plus tard reste explicable même si la formule a changé depuis.
- Comparaison de scénarios, partage / export, mention « simulation indicative » sur chaque résultat.
- Catalogue des simulateurs et exemples en état vide.

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p4-16).

### P4-10 — FINCLUDIA : calculateurs, lot 1 (budget, épargne, objectifs, inflation, simulations de vie)
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P4-09`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (onglet `09_Calculateurs` ; écrans LY09, LY10, ET04, ET07)

Calculateurs de l'onglet `09_Calculateurs` sans dette ni crédit : budget mensuel (CAL-01), budget jusqu'à la fin du mois (CAL-02), enveloppe (CAL-03), épargne, valeur future et **valeur réelle** (inflation), provisions de dépenses annuelles ; simulations de parcours : budget de la future vie étudiante (LY09), premier salaire (LY10 / CAL-17). Chacun : formulaire, résultat avec « Pourquoi ? ». Toujours marqués « simulation », jamais de promesse. (L'enregistrement de scénario appartient à `P4-16`, l'atelier ; la date d'atteinte d'un objectif par itération, ALG-03, est déjà dans le moteur `P4-09` et sera branchée par l'atelier.)

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p4-10).

### P4-11 — FINCLUDIA : calculateurs, lot 2 (dettes et crédit)
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P4-09`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écran C14, ALG-01, onglet `09_Calculateurs`)

- Mensualité / tableau d'amortissement à partir des paramètres saisis par l'utilisateur ; si le taux est inconnu, **seulement des scénarios sur le capital**.
- Remboursement **avalanche** (coût le plus élevé d'abord) et **boule de neige** (plus petit capital d'abord) : simulation période par période, mensualité libérée réallouée (ALG-01) ; date « zéro dette », économie de temps et de coût.
- Frais de remboursement anticipé pris en compte **s'ils sont renseignés** ; ne jamais affirmer qu'une possibilité contractuelle existe.
- Lien avec `P4-02` (simulateur de crédit selon les règles des banques) : ce lot calcule à partir des chiffres **de l'utilisateur**, `P4-02` à partir des règles **des banques** fournies par le client ; les deux partagent le moteur `P4-09`.

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p4-11).

### P4-12 — FINCLUDIA : moteur de comparaison multicritère et comparateur d'offres d'emploi
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P4-09`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans C19, ET08)

- Comparer **2 à 3 options** (scénarios, offres, solutions) sur des critères homogènes : coût, durée, liquidité, risque, frais, conditions, compatibilité.
- Score synthétique **optionnel**, uniquement avec **poids visibles et modifiables** (Σ critère normalisé × poids) ; jamais de classement opaque ; données manquantes affichées comme telles ; devises ou horizons différents → demande de normalisation.
- **Comparateur d'offres d'emploi** (ET08) : net économique = net + avantages monétisables − coûts liés à l'emploi (trajet, repas…) ; avantages non monétisables affichés à part.

Détails techniques : voir [`NOTES_TECHNIQUES.md`](NOTES_TECHNIQUES.md#p4-12).

### P4-13 — Comparateur bancaire, lot D : adéquation à l'usage et « Explorer » (FINCLUDIA)
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P4-08`, `P4-12`, `P3-18`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans ET06, C20 ; moteur « Offer Search »)

Prolonge le comparateur existant (`P4-06` à `P4-08`) sans toucher à ses données client :
- **Comparateur banque / CCP étudiant** (ET06) : l'utilisateur décrit son usage (carte, paiement en ligne, retraits, virements, budget de frais) et voit l'**adéquation** = Σ(correspondance critère × poids utilisateur) / Σ poids, critère par critère ; **aucun « meilleur » absolu**. Le CCP n'est pas dans le classeur actuel : à ajouter seulement si le client fournit ses données.
- **Explorer** (C20) : recherche de solutions par besoin (voiture, logement, épargne…), montant, horizon, type, établissement ; chaque résultat porte **source, date et fraîcheur** ; « compatibilité apparente selon critères publics » seulement si toutes les règles sont explicites, **jamais d'affirmation d'éligibilité** ; réservé aux 18 ans et plus selon les règles de `P3-18`.
- Sauvegarde d'offres et comparaison (via `P4-12`).
- Référentiel d'offres (« Offer Graph » : offres, fournisseurs, sources datées) : seulement les données fournies par le client, comme aujourd'hui.

### P4-14 — FINCLUDIA : décodeur de fiche de paie
- Statut : `⛔ blocked`
- Priorité : `🟡 medium`
- Dépendances : `P4-09`, `P6-01`
- Durée cible : 2 jours (estimation, une fois les règles reçues)
- Origine : direction FINCLUDIA du 2026-10-09 (écran C15)

- Saisie manuelle (ou assistée) des lignes d'une fiche : brut, cotisations, IRG, primes, retenues, net, période ; décomposition expliquée ligne par ligne ; lignes inconnues « à confirmer » ; ajout au revenu mensuel **après confirmation** de l'utilisateur.
- Net = brut + éléments positifs − retenues **seulement selon la structure saisie** ; **aucune déduction légale inventée**, ne prétend jamais certifier la fiche.
- Import d'un document et extraction automatique : phase ultérieure (le client le note lui-même).

Blocage : les **règles de paie et barèmes (cotisations, IRG), datés et versionnés**, doivent être fournis par le client (`P6-01`) avant tout calcul autre qu'une simple addition des lignes saisies.

### P4-15 — FINCLUDIA : comparer un financement (conventionnel / islamique)
- Statut : `⛔ blocked`
- Priorité : `🟢 low`
- Dépendances : `P4-12`, `P4-11`, `P6-01`
- Durée cible : 2 jours (estimation, une fois les données reçues)
- Origine : direction FINCLUDIA du 2026-10-09 (écran JA09)

- Besoin, montant, durée, apport, préférence **conventionnelle ou islamique**, revenu, garanties → mensualité / coût, apport, frais, conditions, impact sur la trésorerie, source et date.
- Taux d'intérêt et parts de bénéfices **jamais assimilés** (même règle que le comparateur, `P4-06`) ; pas de classement opaque ; pas d'éligibilité garantie.

Blocage : offres de financement et leurs règles de calcul **à fournir par le client** (les classeurs actuels donnent des conditions, pas des formules — voir `P4-02`).

### P4-05 — Validation de fin de phase
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P4-02`, `P4-03`, `P4-07`, `P4-08`
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
- Ajout FINCLUDIA (2026-10-09) : les données financières personnelles (revenus, transactions, dettes, patrimoine) sont les plus sensibles de la plateforme. Vérifier en plus : cloisonnement strict par propriétaire **et** par espace partagé (un membre ne voit que ce qui a été explicitement partagé, `P6-13`), accès refusé = écran neutre, droits Owner / Admin / Member / Viewer, contrôle d'âge côté serveur pour les fonctions 18+ (`P3-18`), recherche globale et assistant incapables de renvoyer une donnée d'un autre utilisateur (`P6-20`, `P3-19`), réauthentification pour les actions sensibles (export, suppression, retrait de consentement, `P6-19`).

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

Ajout FINCLUDIA (2026-10-09) : le client demande désormais explicitement la suppression et l'export des données (écran C25, tâche `P6-19`), ce qui lève le point ci-dessus pour FINCLUDIA. Parcours de bout en bout à couvrir quand ils existeront : les scénarios J01 à J10 de l'onglet `02_Parcours_E2E` et les 8 scénarios par public de `16_QA_Tests` (entrer dans FINCLUDIA, construire un budget, créer un objectif, renforcer sa sécurité, gérer une dette, préparer un financement, construire son patrimoine, apprendre à investir, gérer à plusieurs, préparer une dépense annuelle).

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

# PHASE 6 — FINCLUDIA : GESTION FINANCIÈRE PERSONNELLE
## Durée : hors des 8 semaines (estimation dans « Impact sur le délai (FINCLUDIA) » ci-dessous)
## Objectif

Transformer la plateforme en compagnon financier pour les 8 publics FINCLUDIA, selon les deux documents du client à la racine du dépôt (`FINCLUDIA spécification des parcours fonctionnels.odt`, `FINCLUDIA_Cahier_des_Charges_Complet.xlsx`), qui font foi. Cette phase regroupe les **modules qui n'existent pas encore** ; ce qui prolonge un module existant a été ajouté dans sa phase (`P1-12`, `P2-08` à `P2-10`, `P3-18`, `P3-19`, `P4-09` à `P4-15`).

Ordre suivi : celui du backlog client (onglet `17_Backlog`) — lot 0 design (`P1-12`) → lot 1 socle argent → lot 2 objectifs, sécurité, simulations → lot 3 apprentissage et paie → lot 4 patrimoine et portefeuille fictif → lot 5 espaces partagés → lot 6 financement et comparaisons → lot 7 personnalisation des 8 parcours → lot 8 exports, passeports, durcissement.

Règles communes à toutes les tâches de cette phase (exigences du client) :
- **Métadonnées obligatoires** sur chaque donnée financière importante (onglet `04_Donnees_Objets`) : valeur, devise, propriétaire / périmètre (personne, couple, foyer, espace), **source, date, statut (réel / déclaré / importé / calculé / fictif), méthode de saisie, niveau de confiance**.
- Montants en **entiers** (plus petite unité monétaire), devise toujours explicite, aucune conversion sans taux daté.
- Tous les calculs passent par le moteur versionné `P4-09` ; « non calculé » plutôt que 0.
- **Réel et fictif jamais additionnés** ; le fictif porte le badge « SIMULATION ».
- Données privées par défaut ; rien n'entre dans un espace partagé sans action explicite.
- Messages neutres, jamais culpabilisants ni moraux (« bonne / mauvaise dette » interdit).
- Chaque tâche : migration additive avec `CHECK` SQL, validation zod, routes déclarées dans l'audit d'autorisation, tests unitaires / fonctionnels / sécurité / cohérence / navigateur, i18n fr / en / ar, tokens, RTL.

### P6-01 — FINCLUDIA : décisions de cadrage à obtenir du client
- Statut : `⛔ blocked`
- Priorité : `🔴 high`
- Dépendances : `P1-06`
- Durée cible : 0 jour de développement (décisions du client)
- Origine : direction FINCLUDIA du 2026-10-09

Les deux documents sont très détaillés sur les écrans, mais plusieurs points ne peuvent pas être décidés par Claude :
1. ~~**Nom et identité**~~ — **tranché le 2026-10-09 : la plateforme s'appelle FINCLUDIA.** Renommage appliqué dans tout le code, les textes fr/en/ar, les tests et la documentation (détail et points d'attention : « Renommage en FINCLUDIA » ci-dessous). **Restent à fournir** : logo, charte graphique, nom de domaine. **Reste à trancher** : que deviennent l'e-learning, le blog et les outils actuels — intégrés comme modules « Apprendre » / « Explorer » (hypothèse retenue dans ce plan) ou site séparé ? Le texte de présentation de la page d'accueil décrit encore l'ancien positionnement (« formations, blog et outils pour auto-entrepreneurs, PME, PMI ») : il n'a **pas** été réécrit, parce que le nouveau positionnement est une décision commerciale, pas un renommage.
2. **Périmètre de la première livraison** : les 8 publics d'un coup ou d'abord quelques-uns (ex. étudiant + jeune actif + salarié) ? Quels lots du backlog client ?
3. ~~**Types de compte existants**~~ (auto-entrepreneur, PME, PMI) face aux 8 publics (voir `P3-18`) — **tranché le 2026-10-11 : un seul profil actif à la fois, jamais deux en même temps.** Pas de coexistence en deux axes indépendants.
4. **Devises** : DZD seulement ou plusieurs (EUR, USD…) ? Source et fréquence des taux de change si plusieurs.
5. **Seuils** que le document laisse « à valider » : taux d'effort dette, cibles de réserve, pondérations de l'indice de santé financière (F053) et de l'indice de préparation au financement, seuils d'alertes.
6. **Règles de paie** (cotisations, IRG) datées, pour `P4-14` ; **offres de financement** pour `P4-15` ; données **CCP** pour `P4-13`.
7. **Mineurs** : âge minimum d'inscription, consentement parental, fonctions exactes réservées aux 18 ans et plus.
8. ~~**Canaux de notification**~~ — **tranché le 2026-10-11 : pas de SMS.** Les notifications restent in-app ; l'e-mail reste une option future, dépendante du même choix de fournisseur que la newsletter (non fait).
9. ~~**Textes légaux**~~ — **tranché le 2026-10-11 :** la mention « pas de conseil réglementé » et la politique de confidentialité sont rédigées par l'équipe. Une suppression de compte entraîne une suppression complète et immédiate des données (pas de durée de conservation à part).
10. **Contenus restant à fournir** : missions (abandonné, voir `P2-10`), intentions de l'assistant déterministe (`P3-19`), modèles d'objectifs, référentiel de catégories (l'onglet `03_Categories` en donne une base). Le glossaire et les guides (`P2-08`) sont rédigés par l'équipe, plus attendus du client.
11. **Hébergement** : un hébergement mutualisé (cPanel, MariaDB) suffit pour une démonstration ; des données financières réelles demandent sauvegardes testées, chiffrement et disponibilité à confirmer (voir `P5-04`).

Livrable attendu : une note de réponses. Passer alors cette tâche à `✅ done`.

#### Renommage en FINCLUDIA (2026-10-09)

Appliqué : titre de la page, nom de marque et textes d'accueil fr / en / ar, suffixe des titres de pages, préfixe des numéros de certificat (`FINCLUDIA-XXXX-XXXX-XXXX`, voir `P2-05`), nom du paquet serveur (`fincludia-server`), domaine des comptes de démonstration (`@demo.fincludia.test`), dossiers temporaires des tests, README. Aucune migration n'a été nécessaire : **aucune migration ni contrainte SQL ne contenait l'ancien nom**, il n'existait que dans le code et les textes.

**Volontairement non renommé, et pourquoi :**
- **Base de données, conteneur Docker, identifiants de connexion** (`larbi_dev`, `larbi_test`, `larbi_mariadb_dev`, utilisateur `larbi`) : invisibles des utilisateurs, et les renommer demande de recréer la base et d'y recopier les données — dont les données réelles du comparateur. À faire seulement si le client le demande, avec une copie vérifiée avant bascule.
- **Dossier du projet** (`Desktop/ayrep/Larbi`) et dépôt Git : le renommer casse les chemins de travail en cours ; opération à faire par l'utilisateur, hors session.
- **Historique des tâches de ce fichier** (par exemple le conteneur `larbi_postgres_dev` de `P1-01`) : c'est le compte rendu de ce qui a réellement été fait à l'époque. Le réécrire falsifierait l'historique.
- **Texte de positionnement de la page d'accueil** : voir le point 1 ci-dessus — c'est une décision commerciale.
- **Paquet de déploiement `larbi-en-ligne/`** (suivi par Git, 262 fichiers) : artefact généré, à régénérer plutôt qu'à modifier.

### P6-02 — FINCLUDIA : modèle de données financier commun
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P3-18`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (onglets `03_Categories`, `04_Donnees_Objets`)

- Référentiel de **catégories** (revenus, dépenses, objectifs, actifs, dettes, dépenses partagées), standard et personnalisables, « Autre » toujours disponible ; catégories créées par l'utilisateur.
- **Socle de métadonnées** commun (voir règles de la phase) réutilisé par toutes les tables financières ; **périmètre** (personnel / espace partagé / foyer) sur chaque ligne.
- Suppression **logique** et correction **traçable** lorsqu'une donnée alimente un historique.
- Contrôle de cohérence étendu : devise présente, statut connu, montants entiers, aucune ligne fictive dans un total réel.

**Réalisé (2026-10-12) :**
- **Référentiel de catégories** : les **91 catégories standard** des **8 familles** de l'onglet `03_Categories` (revenus, dépenses fixes, dépenses variables, dépenses saisonnières, objectifs, actifs, dettes, dépenses partagées), extraites du fichier du client **par script** (`src/constants/finCategories.js`) et insérées par la migration. Les libellés sont **ceux du client, mot pour mot**, jamais traduits ni reformulés : c'est de la donnée de référence, comme le catalogue de formules de `P4-09` ou les données du comparateur de `P4-06`. Chaque famille garde son « Autre », ce que vérifie un test unitaire.
- **Catégories personnalisables** : une personne peut **ajouter** ses propres catégories, **renommer** une catégorie standard **pour elle seule**, et la **masquer**. Une ligne de référence n'est **jamais modifiée** : le choix d'un compte ne peut pas changer ce qu'un autre compte voit (un test de sécurité vérifie que les 91 lignes restent identiques au bit près après que trois comptes, dont un administrateur, aient essayé). Le nom d'origine du client reste affiché à côté du nom choisi, pour que la catégorie reste trouvable sous son nom de référence.
- **Socle de métadonnées** (`src/constants/finData.js`, `src/services/finance/dataModel.js`) : les onze métadonnées de l'onglet `04_Donnees_Objets` écrites **une seule fois** et reprises à l'identique par toute table financière de la phase — périmètre, source, référence de source, statut, confiance, usages autorisés, date d'effet, date de collecte, version, plus `value`/`currency` sur les tables qui portent un montant. Le socle est **documenté dans `schema.prisma`** au-dessus de la première table qui l'applique.
- **Suppression logique et correction traçable** : rien n'est effacé. Une correction incrémente la `version` de l'objet et écrit une ligne par champ modifié dans le **journal `fin_changes`** (valeur avant, valeur après, motif facultatif) ; un retrait pose `archivedAt` ; une suppression pose `deletedAt` et laisse sa ligne de journal. La seule suppression physique est l'**effacement complet du compte** que promet le texte de confidentialité (`P6-01` point 9), par `ON DELETE CASCADE`.
- **Contrôle de cohérence étendu** (`services/consistency.service.js`) : parcourt le socle **table par table** via un registre (`FINANCIAL_TABLES`), donc une table financière ajoutée par une tâche suivante est contrôlée dès qu'elle s'y déclare. S'y ajoutent : les trois formes légales d'une catégorie, la correspondance **exacte** entre le référentiel en base et `finCategories.js`, l'unicité des noms par famille et par compte, le fait qu'une ligne supprimée porte sa ligne de journal, et le fait qu'un journal ne parle jamais d'une ligne d'un autre compte.
- **API** (`/api/fin`, `routes/finData.routes.js`) : `GET /references` (les vocabulaires, pour que l'interface ne les retape pas), `GET|POST /categories`, `PATCH|DELETE /categories/:id`, `PUT /categories/:id/archive`, `GET /categories/:id/historique`, `PATCH|DELETE /categories/standard/:key`. **Tout exige une session** : la donnée financière est privée par défaut, et il n'y a **aucun côté administration** — un administrateur est ici un compte comme un autre.
- **Interface** : page « Mes catégories » (`/compte/categories`, `FinCategoriesPage.jsx`), ajoutée au menu du compte : familles du client, étiquettes d'origine, ajout, renommage en place, masquage, retour au nom d'origine, suppression, et l'historique des corrections dépliable par ligne. fr / en / ar, jetons CSS, propriétés logiques (RTL), icônes `lucide-react`.

**Décisions (et pourquoi) :**
- **Une seule table pour le référentiel et les catégories d'un compte**, avec trois formes (standard / propre / personnalisation). Deux tables séparées auraient été plus propres à lire, mais une ligne financière de `P6-04` doit pointer vers **une** catégorie : avec deux tables il faudrait deux clés étrangères dont une toujours nulle, ou une référence non typée. Une seule table donne **une clé étrangère et un seul espace d'identifiants**.
- **Le référentiel est inséré par la migration**, pas par un script d'amorçage : il fait partie de l'histoire du schéma, il est présent dans toute base (développement, test, production) sans étape supplémentaire, et le contrôle de cohérence vérifie qu'il dit toujours la même chose que le code. Les identifiants sont des **uuid5 de la clé**, donc stables d'un environnement à l'autre.
- **« Réel » et « fictif » ne sont jamais additionnés** : `totalsByReality()` rend **deux totaux séparés** et compte à part les lignes dont le statut est illisible. Il n'existe **volontairement aucune fonction** qui renvoie la somme des deux — c'est la règle de la phase, et une somme mixte serait un chiffre faux affiché avec aplomb.
- **`404` et non `403`** sur la catégorie d'un autre compte, y compris pour son historique : un `403` confirmerait que cet identifiant existe et appartient à quelqu'un, ce qui est déjà une information sur un autre compte.
- **Le statut suit le libellé affiché** : quand une personne renomme une catégorie standard, la ligne qu'elle voit passe de `official` à `declared`. Le libellé est devenu le sien ; prétendre le contraire serait mentir sur la provenance de la donnée.
- **Le motif d'une correction n'est jamais obligatoire** : le client demande une correction *traçable*, pas une justification à taper avant de pouvoir corriger quoi que ce soit.
- **La forme d'une catégorie n'est pas une contrainte SQL** : elle lit `userId`, une colonne de clé étrangère, et MariaDB refuse un `CHECK` qui en référence une (même raison que les règles médias et quiz existantes). Elle est donc vérifiée par le contrôle de cohérence, et tous les autres vocabulaires fermés ont bien leur `CHECK`.

**Tests :** 27 unitaires (`tests/unit/finDataModel.test.js` : le référentiel, le socle, la séparation réel / fictif, le journal), 27 fonctionnels (`tests/functional/finCategories.test.js`), 9 de sécurité (`tests/security/finCategories.test.js` : isolation entre comptes, métadonnées non pilotables depuis le corps de la requête, référentiel en lecture seule, effacement du compte), 24 de cohérence (`tests/consistency/data.test.js` : un historique réaliste de modifications laisse le système cohérent, plus **un contrôle négatif par règle**), 8 en navigateur (`tests/e2e/fin-categories-journey.test.js`, dont le rendu arabe RTL) ; `/compte/categories` et `/compte/fincludia` ajoutées au balayage du site. `npm run check:consistency` propre. Lint et build du client sans régression.

**Limites et réserves déclarées :**
- Le **niveau de confiance** (`CONFIDENCE_LEVELS`) est à nous : le client écrit « niveau ou règle de confiance lorsque pertinent » **sans énumérer** d'échelle. La colonne est nullable, donc « non renseigné » reste distinct de « faible », et seule cette liste changera si le client donne la sienne.
- Les **usages autorisés** (`CONSENT_USES`) se limitent aux deux usages que les règles du client décrivent réellement : l'entrée dans un espace partagé (`P6-13`) et l'export (`P6-20`). Rien d'autre n'a été déduit.
- Le **référentiel de catégories reste à confirmer par le client** (`P6-01` point 10) : l'onglet `03_Categories` est repris tel quel, ce qui est la base qu'il annonce lui-même, pas une validation.
- Le socle est appliqué **pour de vrai** à `fin_categories`, qui est la seule table financière existante à ce stade. Une catégorie **nomme** une ligne, elle n'en est pas une : elle ne porte donc ni `value`, ni `currency`, ni `confidence` — trois champs qui seraient nuls sur chacune de ses lignes. Les règles « devise présente » et « montants entiers » sont écrites, testées unitairement et branchées sur le registre ; elles s'appliqueront à la première table qui portera des montants (`P6-04`).
- **Dérive de somme de contrôle réparée** : la migration `20261011212102_apprendre_axes_favorites` avait été modifiée après son application, ce qui aurait forcé une **réinitialisation destructrice** de `larbi_dev` à la migration suivante. La base correspondait déjà exactement au fichier (contraintes `CHECK` vérifiées) : seule l'empreinte stockée a été corrigée, dans `larbi_dev` et `larbi_test`. **Aucune donnée perdue.** À retenir : une migration déjà appliquée ne se modifie plus.

### P6-03 — FINCLUDIA : onboarding financier progressif
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-02`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans C03, LY01, ET01, SA01, EP01)

- Minimum de questions pour un premier résultat utile : ressources, dépenses essentielles estimées, épargne disponible, dette si pertinente, objectif principal ; questions **conditionnelles selon le public** ; « Passer », « Pourquoi cette question ? », « Enregistrer et quitter ».
- Résultat immédiat : premier budget, premier indicateur, niveau de complétude.
- Ressources irrégulières (bourse, job, freelance) avec fréquence obligatoire (normalisation F001).
- Lycéen : jamais de dette, de patrimoine réel ni d'offre de crédit ; mode **budget fictif** proposé (« commence avec 5 000 DA fictifs »).
- Incohérence au-delà d'un seuil → demande de confirmation, jamais de blocage silencieux.

**Dépendance à `P1-12` retirée le 2026-10-12, et pourquoi :** `P1-12` (lot 0 design) attend `P6-01` — le logo, la charte et le périmètre de la première livraison. Ce que `P6-03` avait réellement besoin d'elle, ce sont ses **composants communs**, et ils sont livrés ici : `client/src/components/fincludia/FigureCard.jsx` (carte de chiffre avec « Pourquoi ? », formule, version, données utilisées, date, et l'état **« non calculé » visuellement distinct de zéro**), `AmountField.jsx` (montant entier avec devise obligatoire), le **badge « SIMULATION »** permanent et la séparation visuelle forte du fictif, dans `Fincludia.css`. Il reste à `P1-12` ce qui dépend vraiment du client : le **menu de l'espace connecté** par public et la **barre supérieure** (recherche globale `P6-20`, notifications `P6-18`), plus la charte. Ces composants sont notés sous `P1-12` comme déjà faits, afin que son périmètre restant soit exact.

**Réalisé (2026-10-12) :**
- **Les questions sont celles du client, écran par écran.** L'onglet `06_Champs_Inputs` les liste : `src/constants/finOnboarding.js` reprend **C03** (socle commun), **LY01** (lycéen), **ET01** (étudiant), **SA01** (salarié) et **EP01** (épargnant débutant) — 23 questions, rien d'inventé, rien d'omis. Chaque question déclare son écran d'origine, les publics concernés, son type, la **catégorie standard** de `P6-02` à laquelle elle se rattache, et le texte de « **Pourquoi cette question ?** » (rédigé par l'équipe, factuel, jamais moralisateur).
- **Les écrans dédiés raffinent le socle, ils ne s'y ajoutent pas.** Chaque question porte un **rôle** : un salarié est interrogé sur ses « charges fixes » (SA01) **au lieu** de l'estimation de C03, jamais les deux — sinon le même argent serait compté deux fois. C'est un défaut que le test a trouvé, pas une subtilité théorique.
- **Rien n'est obligatoire et rien ne bloque** : « Passer » est enregistré **comme un passage** (et non comme une question jamais atteinte), « Enregistrer et quitter » accepte un lot partiel à tout moment, « Terminer » fonctionne à n'importe quel niveau de complétude.
- **Résultat immédiat** : premier budget (F002, F003, F004) et premier indicateur (F018, **affiché seulement si une mensualité de dette a été déclarée** — un taux d'effort à 0 % se lirait « pas de dette », ce qui est une réponse que nous n'avons pas), plus le **niveau de complétude** (répondues / passées / restantes).
- **Ressources irrégulières** : la fréquence est **obligatoire** pour une ressource (c'est le cas d'erreur du client sur l'écran ET01) ; une estimation de dépense vaut par défaut « par mois », ce qui est la formulation de la question. Les réponses de ressources deviennent de **vraies lignes** de `fin_incomes`, corrigées et non dupliquées quand la personne revient sur sa réponse, avec `sourceRef = onboarding:<question>` pour la traçabilité.
- **Lycéen** : jamais interrogé sur la **dette** ni sur le **patrimoine réel** (l'épargne disponible en est) — **refusé par le serveur**, pas masqué dans l'interface. La règle vaut aussi pour une **tranche d'âge « moins de 18 ans »** quel que soit le public choisi : un mineur qui se déclare salarié reste un mineur. Le **budget fictif de 5 000 DA** du client est **proposé** et non imposé ; l'accepter passe l'onboarding, ses ressources et son solde de départ en statut `fictional`, et chaque chiffre produit porte l'avertissement « SIMULATION ».
- **Incohérence** : un montant cent fois plus grand que les autres **déclenche une demande de confirmation**, l'enregistrement se fait quand même, et confirmer fait disparaître la question. Jamais de blocage silencieux.

**Décisions (et pourquoi) :**
- **Les rôles, pas les clés** : le service lit « l'épargne », « la dette », « l'objectif » par rôle, parce que la question qui les porte dépend du public. Coder la clé en dur aurait silencieusement ignoré la réponse de quiconque voit une autre version de la question.
- **Ce qui n'a pas encore de table reste déclaré sur l'onboarding** : épargne disponible, mensualités de dette, montant de l'objectif attendent `P6-05`, `P6-08` et `P6-11`. Ils sont tout de même calculés **à travers le moteur versionné**, donc aucun chiffre n'est fabriqué.
- **Le niveau de connaissance (LY01)** ne restreint rien : il sert à choisir par quoi commencer les explications. Le véritable indice est `P2-09`, dont les pondérations appartiennent au client.

**Tests :** 30 unitaires (`tests/unit/finOnboarding.test.js` : le registre contre les écrans du client, les rôles, la complétude, les incohérences, le premier résultat), 33 fonctionnels (`tests/functional/finOnboarding.test.js`), la part onboarding des tests de sécurité et de cohérence, 3 parcours navigateur dans `tests/e2e/fin-money-journey.test.js`.

**Détail technique :** voir `NOTES_TECHNIQUES.md`, section `P6-03 / P6-04`.

**Limites :** le niveau de connaissance et les seuils d'incohérence sont **les nôtres** (le client ne les chiffre pas) ; le seuil est un rapport de 100, documenté dans `constants/finOnboarding.js` et modifiable d'une ligne.

### P6-04 — FINCLUDIA : « Mon argent » — revenus et transactions
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-02`, `P4-09`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans C05, C07, C08 ; domaines API `/incomes`, `/transactions`)

- Saisie rapide d'une dépense ou d'un revenu (type, montant, devise, date, catégorie, sous-catégorie, moyen de paiement, note, justificatif optionnel, partagé oui / non), « Enregistrer et ajouter ».
- Historique : recherche texte, filtres (date, montant, catégorie, type, membre, source, statut), tri, totaux filtrés, recatégorisation, export ; transactions non catégorisées à part ; doublon suspect signalé ; date future seulement pour une dépense planifiée.
- Synthèse « Mon argent » : revenus, dépenses, flux net (F004), répartition, tendance, prévu / réel.
- Justificatifs : stockage **privé** existant (`P2-06`), jamais d'URL publique.
- Import bancaire / scan : phase ultérieure (le client le note lui-même).

**Réalisé (2026-10-12) :**
- **Deux tables**, reprenant le socle de `P6-02` à l'identique : **`fin_incomes`** (ressource récurrente : libellé, catégorie, montant entier, devise, **fréquence obligatoire**, date de début et de fin) et **`fin_transactions`** (mouvement daté : type, montant, devise, date, catégorie, sous-catégorie, moyen de paiement, note, partagé, planifié, justificatif). Un montant ponctuel n'est pas une ressource : c'est un mouvement.
- **Saisie rapide** (écran C07) avec « **Enregistrer et ajouter** », qui conserve le type, la date et la catégorie — ce qui change d'un mouvement au suivant, c'est le montant et la note.
- **Historique** (écran C08) : recherche texte sur la note et la sous-catégorie, filtres (date, montant, catégorie, type, source, statut, partagé, planifié), tri sur **liste fermée**, pagination, **totaux de l'ensemble filtré**, recatégorisation en place, et **export CSV appliquant exactement les mêmes filtres**.
- **Transactions non catégorisées à part** : une catégorie vide est une réponse acceptée, comptée à part et atteignable d'un clic depuis la synthèse.
- **Doublon suspect signalé, jamais refusé** : même type, même montant, même devise, même catégorie à moins de 24 h. Deux cafés identiques le même matin sont parfaitement réels.
- **Synthèse « Mon argent »** (écran C05) : F002, F003, F004, répartition par catégorie, tendance par rapport au mois précédent, **prévu / réel**, et un bloc **fictif séparé** portant le badge « SIMULATION ».
- **Justificatifs** : stockage privé de `P2-06`, servis **uniquement au propriétaire**, `private, no-store`, CSP `sandbox`, **jamais d'URL publique**. Un remplacement supprime l'ancien fichier, et `eraseAccountReceipts()` balaie les fichiers d'un compte pour l'effacement complet que promet le texte de confidentialité.
- **Chaque chiffre passe par le contrat du moteur** (`P4-09`) : formule, version, données utilisées, date de calcul, avertissements. Rien n'est recalculé dans le navigateur.
- **Interface** : page « Mon argent » (`/mon-argent`), synthèse + saisie + historique, fr / en / ar, jetons CSS, propriétés logiques (RTL).

**Décisions (et pourquoi) :**
- **Trois compartiments de totaux, jamais un** : ce qui a eu lieu, ce qui est seulement **planifié**, et ce qui est **fictif**. Le client distingue lui-même « prévu / réel », et la règle de phase interdit d'additionner réel et fictif — un total unique serait donc faux deux fois. Le test l'a montré : la dépense planifiée se retrouvait dans le total réel.
- **« Non calculé » plutôt que 0** dans deux cas que les tests ont trouvés : sur un **ensemble vide** (on ne peut pas distinguer « n'a rien dépensé » de « n'a rien saisi ») et quand **aucune ressource déclarée n'est normalisable** (afficher 0 dirait « vous n'avez aucune ressource » à quelqu'un qui en a déclaré une).
- **Le signe est porté par le type**, pas par le montant : un montant négatif dirait la même chose deux fois et rendrait tout total dépendant de la convention du client appelant.
- **Une date future n'est acceptée que pour une dépense planifiée**, et une dépense planifiée est `declared`, pas `real` : F004 porte sur les dépenses **réalisées** de la période.
- **Export CSV neutralisé** : une note commençant par `=`, `+`, `-` ou `@` est préfixée d'une apostrophe. Sans cela, un tableur **exécuterait** ce que la personne a tapé.
- **Clé étrangère de catégorie en `SET NULL`**, jamais `Restrict` : perdre une catégorie ne doit pas emporter l'argent. L'application ne supprime jamais une catégorie physiquement (`P6-02` supprime logiquement), donc cela ne joue qu'à l'effacement du compte — où la ligne part de toute façon.
- **Le moyen de paiement est une liste à nous** : le client demande le champ et n'énumère rien (réserve déclarée, voir ci-dessous).

**Tests :** 28 unitaires (`tests/unit/finSynthesis.test.js` : la synthèse, la séparation réel / planifié / fictif, les devises mixtes, la tendance, les filtres), 38 fonctionnels (`tests/functional/finMoney.test.js`), 16 de sécurité (`tests/security/finMoney.test.js` : isolation entre comptes, justificatifs privés, métadonnées non pilotables, tri non injectable, effacement du compte), l'historique réaliste et 7 contrôles négatifs dans `tests/consistency/data.test.js`, 9 parcours navigateur (`tests/e2e/fin-money-journey.test.js`).

**Détail technique, pièges inclus :** voir `NOTES_TECHNIQUES.md`, section `P6-03 / P6-04`.

**Défauts corrigés en chemin, trouvés par les tests :**
- **L'effacement complet d'un compte échouait** : la clé étrangère de catégorie était en `Restrict`, donc supprimer un compte qui avait utilisé une de ses propres catégories était refusé par la base.
- **Les justificatifs survivaient à l'effacement d'un compte** : la clé était sur la transaction, si bien que supprimer le mouvement laissait le fichier et sa ligne. La clé est passée sur `media` avec `ON DELETE CASCADE`, exactement comme les fichiers de leçon et d'article (migration `20261012192000_fin_receipt_on_media`, écrite à la main).
- **Le journal de corrections ne connaissait que les catégories** : aucune correction de ressource ou de mouvement n'était tracée, alors que c'est l'exigence même de `P6-02`.
- **Toute écriture faisait disparaître la page** : `useApi.reload()` vidait les données, la page rendait son état de chargement, et **tous ses composants enfants étaient démontés** — formulaire à moitié rempli, avertissement de doublon, confirmation. Un rechargement du **même** chemin conserve désormais ce qui est à l'écran. C'est la troisième fois que ce défaut se manifeste (`P2-08` deux fois) ; il est corrigé à la racine, dans le hook. Deux parcours navigateur de `P6-02` ne passaient en réalité que **grâce** à ce clignotement : ils lisaient la liste pendant que la page était vide, puis la retrouvaient remplie. Ils attendent maintenant explicitement.
- **Une dérive de somme de contrôle de migration** avait été laissée par une session précédente ; réparée sans perte de données (détail sous `P6-02`).
- **La page débordait de l'écran à 1280 px**, dans les quatre langues : un `<select>` est aussi large que sa plus longue option, et les 91 catégories étaient affichées « famille · libellé ». Trouvé par le balayage du site, corrigé par des `<optgroup>` par famille et des `select` qui peuvent rétrécir.

**Limites et réserves déclarées :**
- **Moyens de paiement** (`PAYMENT_METHODS`) : liste à nous — espèces, carte, virement, chèque, CCP, autre. Le client demande le champ sans l'énumérer ; la colonne est nullable, donc « non précisé » reste distinct de « espèces ».
- **Import bancaire et scan de ticket** : hors périmètre, le client le note lui-même.
- **Filtre « membre »** (écran C08) : il désigne un membre d'espace partagé, qui n'existe qu'avec `P6-13`. Le périmètre (`scope`) est filtrable dès maintenant ; le membre viendra avec les espaces.
- **L'effacement d'un compte n'est pas encore une fonction du produit** (pas de route dédiée) : `eraseAccountReceipts()` existe pour que la tâche qui l'écrira ait un seul endroit honnête à appeler, et le test de sécurité l'exerce.

### P6-05 — FINCLUDIA : budgets et enveloppes
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-04`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans C06, JA03, JA04 ; CAL-01, CAL-03)

- Budget par période et catégorie (fixe / variable, récurrence, plafond optionnel) ; reste à affecter ; écart réel − prévu ; répartition automatique selon l'historique **proposée, jamais imposée**.
- Plan de répartition du premier salaire (JA03 / JA04) : chaque dinar affectable, « Non affecté » toujours possible, **aucune règle type 50/30/20 imposée**.
- Budget supérieur au revenu : autorisé mais signalé ; chevauchement de périodes refusé.
- Alertes 80 % / 100 % / dépassement, configurables (via `P6-18`).

**Réalisé (2026-10-13) :** backend déjà posé (modèle `FinBudget` / `FinEnvelope`, services, contrôleurs, routes `/fin/budgets`), vérifié et complété dans cette session.
- **Deux tables**, même socle que `P6-02` à `P6-04` : **`fin_budgets`** (période, devise, récurrence, seuils d'alerte configurables) et **`fin_envelopes`** (catégorie, fixe / variable, montant prévu, plafond optionnel, reconduction).
- **Vue calculée d'un budget** (écran C06, `finBudgetView.service.js`) : par enveloppe, prévu / réel / écart (F009), taux de consommation (F010) et projection de fin de période (F011) ; pour le budget entier, ressources de la période (F002), total prévu / réel (F003), flux net (F004), **reste à affecter** (F009) et **budget journalier** (F012). Chaque figure passe par le contrat du moteur (`P4-09`).
- **Répartition proposée, jamais imposée** (`finBudgetProposal.service.js`) : deux sources déclarées séparément (moyenne mensuelle de l'historique réel, et les dépenses déclarées à l'inscription `P6-03` normalisées au mois), fusionnées avec priorité à l'historique ; l'API `/fin/budgets/proposition` n'écrit jamais rien — c'est la personne qui choisit « Utiliser » enveloppe par enveloppe.
- **Chevauchement de périodes refusé**, sauf avec un budget archivé ; **budget supérieur aux ressources autorisé mais signalé**, jamais refusé. **Dupliquer pour la période suivante** ne reconduit que les enveloppes marquées comme récurrentes.
- **Interface** : liste des budgets (créer, dupliquer, archiver, supprimer) sur `/budget`, détail d'un budget sur `/budget/:id` (figures, alertes, formulaire d'ajout d'enveloppe, panneau de proposition), fr / en / ar, jetons CSS, propriétés logiques (RTL).

**Défaut trouvé et corrigé en chemin :** le **client Prisma généré était désynchronisé du schéma** — les modèles `FinCategory`, `FinBudget` et plusieurs autres existaient dans `schema.prisma` mais pas dans le client compilé (`src/generated/prisma`), ce qui faisait planter plusieurs routes financières (`Cannot read properties of undefined (reading 'findFirst')`) à l'exécution. `npx prisma generate` corrige, mais le défaut montre qu'une régénération a été oubliée dans une session précédente — à refaire systématiquement après toute modification de `schema.prisma`.

**Tests :** 9 de sécurité (`tests/security/finBudget.test.js`, nouveaux dans cette session : isolation entre comptes sur budgets et enveloppes, 404 et non 403, journal de corrections non partagé, métadonnées serveur non pilotables, effacement de compte), plus les unitaires et fonctionnels déjà en place (`tests/unit/finBudget.test.js`, `tests/functional/finBudget.test.js`).

**Limites et réserves déclarées :**
- **Pas encore de scénario dans la suite de cohérence globale** (`tests/consistency/data.test.js`) ni de **parcours navigateur** (`tests/e2e`) dédiés aux budgets — contrairement à `P6-04`. À ajouter si une revue plus poussée est demandée.
- **Alertes configurables via `P6-18`** (centre de notifications) : les seuils existent et sont stockés par budget, mais rien ne pousse encore de notification — seul l'écran du budget les affiche.
- Le **filtre « membre »** et le **périmètre partagé** d'un budget suivent la même réserve que `P6-04` : filtrables dès maintenant par `scope`, le membre viendra avec `P6-13`.

### P6-06 — FINCLUDIA : accueil « Aujourd'hui » et tableaux de bord par public
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-05`, `P6-08`, `P6-09`, `P6-10` (une cinquième, retirée le 2026-10-13, est justifiée sous la tâche)
- Durée cible : 4 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans C04, LY02, ET02, JA02, SA02 ; onglet `08_Tableaux_Bord`)

- Répondre en moins de 10 secondes à « où j'en suis, que faire maintenant ? » : 3 à 5 KPI, **1 à 3 actions au maximum**, alertes, objectif prioritaire, échéances ; une carte non calculable devient une invitation à compléter.
- Un tableau de bord par public avec ses indicateurs (onglet `08_Tableaux_Bord`) : « Ma semaine » (lycéen, 1 alerte + 1 mission max), étudiant (budget / jour, autonomie F047), premier revenu, **santé financière personnelle** (salarié : score pondéré F053 avec sous-scores cliquables et pondérations visibles, **séparé de tout crédit**), colocation, couple (« Moi / Nous »), foyer, parcours d'épargne.
- Indicateurs **lus dans le moteur `P4-09`**, jamais recalculés côté client ; bannière de qualité si une donnée est ancienne.

**Dépendance à `P6-18` retirée le 2026-10-13, et pourquoi :** ce que `P6-06` avait besoin de `P6-18`, ce sont les **alertes**. Elles sont ici, mais **in-app seulement** — ce qui est l'ordre du client lui-même (« canal in-app d'abord »). Les alertes affichées sont des faits : une enveloppe au-delà d'un seuil que la personne a elle-même déclaré (`P6-05`). Il reste à `P6-18` ce qui lui appartient vraiment : le centre de notifications, les quotas, l'anti-répétition, la désactivation par type et les canaux e-mail / push. `P6-05`, `P6-08`, `P6-09` et `P6-10` sont faites, donc la tâche n'attendait plus qu'elle.

**Réalisé (2026-10-13) :**
- **Un seul appel répond à l'écran** (`GET /fin/aujourdhui`) : une question posée en moins de dix secondes ne peut pas demander six allers-retours. La route **n'écrit rien** — vérifié par un test qui compte les lignes de journal avant et après deux appels.
- **Ce service compose, il ne calcule pas.** Chaque chiffre vient du module qui le possède — la synthèse de `P6-04`, la vue de budget de `P6-05`, le calendrier de `P6-07`, la réserve de `P6-09`, les objectifs de `P6-08`, les dettes de `P6-10` — et arrive **déjà enveloppé dans le contrat du moteur**. La règle du client (« indicateurs lus dans le moteur `P4-09`, jamais recalculés côté client ») est donc appliquée une couche plus tôt : ils ne sont pas recalculés ici non plus.
- **Les plafonds du client sont des limites dures, pas des intentions** : 5 KPI au maximum, 1 à 3 actions, et pour un mineur **1 alerte + 1 mission** (« Ma semaine »). Un test les vérifie pour les huit publics.
- **Un tableau de bord par public** (`constants/finDashboard.js`, onglet `08_Tableaux_Bord`) : « Ma semaine » (lycéen), étudiant (**budget / jour** et **autonomie F047**), premier revenu (reste à affecter), salarié, colocation, couple, foyer, parcours d'épargne — plus un tableau général pour qui n'a pas encore choisi de parcours, qui dit ce que le choix changerait. **L'ordre des KPI est une préférence plus longue que le plafond** : les cartes affichées sont les premières qui **aboutissent**, donc quelqu'un sans budget voit les chiffres suivants plutôt que cinq cartes vides.
- **Une carte non calculable devient une invitation à compléter**, jamais un zéro — et elle garde la formule qu'elle aurait portée, donc le panneau « Pourquoi ? » fonctionne dans les deux cas. En revanche, **un module qui n'existe pas encore ne produit aucune carte, pas même une invitation** : inviter quelqu'un à ouvrir un écran que personne n'a construit serait pire que de ne rien montrer.
- **Un lycéen n'est jamais exposé à une dette ni à un patrimoine réel**, même quand une dette existe dans son compte : la règle du client est appliquée **côté serveur**, pas seulement masquée dans l'interface. Et une tranche d'âge « moins de 18 ans » fait un mineur **quel que soit le public choisi**, exactement comme l'onboarding de `P6-03`.
- **Les actions suivent l'ordre de priorité du client** — sécurité > échéance > budget > apprentissage — et chacune pointe vers un écran qui existe.
- **F047 (autonomie étudiante) exige une définition versionnée**, et le client n'en donne pas : la nôtre est déclarée et versionnée dans `constants/finDashboard.js` (le revenu qu'on **gagne** est personnel, celui qu'on **reçoit** d'une bourse, de sa famille ou d'une allocation ne l'est pas), et **la version voyage dans le `entrees_snapshot`** de chaque réponse. C'est une lecture, pas un jugement : vivre d'une bourse ne rend personne moins autonome, l'indicateur mesure seulement la part de ses dépenses que son propre travail couvre.
- **F008 (taux d'épargne) lit l'épargne DE LA PÉRIODE** : diviser le cumul mis de côté par le revenu d'un mois ne serait pas un taux. `markedSavingsInPeriod` a été ajouté à `finSavings.service.js` (les mouvements d'épargne sont datés, donc la période est un vrai filtre), et rien marqué comme épargne sur la période donne **« non calculé »**, pas 0 %.
- **Bannière de qualité (F055)** : mesurée sur la date de **collecte** la plus récente — quand la donnée a été saisie, pas quand le mouvement a eu lieu. Un compte où rien n'a jamais été saisi est **vide, pas périmé** (`stale: null`), et le seuil est un argument visible dans la réponse.
- **Interface** : `/aujourdhui`, en tête du menu de l'espace connecté, actions d'abord (c'est la question posée), puis alertes, chiffres, objectif prioritaire et prochaines échéances ; fr / en / ar, jetons CSS, propriétés logiques (RTL).
- **Tests** : 27 unitaires (`tests/unit/finDashboard.test.js`), 21 fonctionnels (`tests/functional/finDashboard.test.js`). `/aujourdhui` est ajouté au balayage du site.

**Défauts trouvés par les tests et corrigés :**
- **F055 était appelée avec ses arguments inversés** (`dataAgeDays(now, date)` au lieu de `dataAgeDays(date, now)`) : tous les âges revenaient **négatifs**, donc la bannière de qualité **ne pouvait jamais s'afficher**. Le test qui attendait 76 jours a renvoyé −76.
- **Le chargement de la synthèse était écrit deux fois** : le contrôleur de « Mon argent » avait sa requête, l'accueil allait avoir la sienne. `loadSynthesisData` a été extrait dans `finSynthesis.service.js` et les deux écrans le partagent — deux appelants écrivant chacun sa requête, c'est ainsi que deux écrans finissent par ne pas être d'accord sur le même mois. Les 38 tests de `P6-04` confirment que rien n'a changé pour elle.
- **`FinGoal` et `FinDebt` n'étaient pas déclarées dans `FINANCIAL_TABLES`** (`P6-08` / `P6-10`) : elles portent le socle de `P6-02` mais **le contrôle de cohérence ne les parcourait pas**, alors que c'est précisément le registre qui le lui dit. Elles y sont ajoutées, avec `fin_recurrences` et `fin_provisions`.
- **Corriger un objectif ou une dette n'écrivait RIEN dans le journal** (`P6-08` / `P6-10`). Les deux services appelaient bien `recordCorrection`, mais sans leurs champs déclarés dans `JOURNALLED_FIELDS` : `diffFields` renvoyait une liste vide, donc une cible modifiée ou un capital restant corrigé ne laissait **aucune trace** — l'exigence même de `P6-02` pour une donnée qui alimente un historique. C'est le même défaut, à l'identique, que celui trouvé sous `P6-04` (« le journal ne connaissait que les catégories »). `goal`, `debt` et `debtPayment` sont ajoutés.
- **Deux chemins d'API supposés au lieu d'être vérifiés** dans mes propres tests (`/fin/objectifs`, `/fin/dettes` au lieu de `/fin/goals`, `/fin/debts`) : l'un faisait échouer le test, l'autre passait **parce que je n'avais pas vérifié le statut de la création**. L'assertion manquante a été ajoutée : cacher une dette qui n'existe pas n'aurait rien prouvé.

**Limites et réserves déclarées :**
- **La santé financière personnelle (F053) n'est PAS publiée.** Le mécanisme existe dans le moteur et prend ses pondérations en argument ; ce qui manque, ce sont les **pondérations**, que le client a laissées « à valider » (`P6-01` point 5). Un score n'est pas un chiffre qu'on peut vérifier, c'est un **jugement sur quelqu'un** : le publier sur des poids inventés est la seule chose que ce projet refuse de faire, et l'indice de connaissances de `P2-09` est retenu pour exactement la même raison. L'écran montre donc les **sous-scores lisibles un par un** — ce que le client demande de toute façon (« sous-scores cliquables, pondérations visibles ») — et **dit à l'écran** pourquoi le score global n'est pas là. Le jour où les poids arrivent, `HEALTH_INDEX_BLOCKED` disparaît et F053 est branchée.
- **Le sélecteur de période et la carte « Prochaine action » de `P1-12`** restent à `P1-12` : l'accueil affiche le mois courant et ses actions, mais le composant commun de navigation temporelle dépend toujours du périmètre de la première livraison.
- **« Moi / Nous » (couple), colocation et foyer ont leur tableau de bord mais pas encore leurs chiffres partagés** : ils lisent les données personnelles du compte. Le périmètre partagé arrive avec `P6-13` et `P6-15`.
- **Le tableau du lycéen descend volontairement sous le plancher de 3 KPI.** La fourchette « 3 à 5 KPI » est la règle de l'écran général (C04) ; « Ma semaine » est explicitement limitée par le client à **1 alerte + 1 mission**, et un compte de lycéen sans objectif n'affiche donc que deux chiffres. Inventer un troisième indicateur pour remplir la grille serait exactement ce que cette tâche refuse de faire ailleurs.
- **Pas de parcours navigateur dédié** à l'accueil (le balayage couvre la page, pas le scénario complet).

### P6-07 — FINCLUDIA : calendrier financier et dépenses récurrentes
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P6-04`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans C23, SA03, SA04, ET04, FA04 ; ALG-04)

- Calendrier mois / semaine : paiements planifiés, échéances de dettes, contributions aux objectifs, provisions ; total prévu par période, **jours de tension**, cash projeté simple.
- Un événement planifié **n'est pas une transaction** avant confirmation (« Marquer payé ») : pas de double comptage.
- Plan du mois (SA03) : copier le mois précédent, cash de fin projeté.
- **Détection de récurrences** (ALG-04 : libellé, montant toléré, intervalle) **proposée puis confirmée** par l'utilisateur ; coût mensuel / annuel des abonnements ; jamais de résiliation automatique.
- Provisions de dépenses annuelles ou d'études : provision mensuelle = (montant − déjà provisionné) / mois restants ; une provision ne crée pas de dépense réalisée.
- Rappels J-7 / J-1 configurables.

**Réalisé (2026-10-13) :**
- **Deux tables, et délibérément pas une troisième.** `fin_recurrences` (abonnement, loyer, salaire : libellé, catégorie, sens, montant, devise, fréquence, prochaine échéance, fin, rappels, origine détectée) et `fin_provisions` (dépense datée : montant prévu, déjà provisionné, échéance, rappels), toutes deux sur le socle de `P6-02`. **Un paiement planifié n'a pas eu besoin de table** : c'est déjà un mouvement `planned` de `P6-04`, et le calendrier le lit là-bas. Une seconde table d'événements planifiés aurait été exactement le double comptage que le client interdit.
- **« Marquer payé » corrige la ligne existante** (`POST /fin/transactions/:id/payer`) : le même mouvement cesse d'être planifié et devient réel, à la date et au montant réellement payés — qui peuvent différer du prévu. Il n'y a jamais une deuxième ligne à compter, et le journal garde qu'il était planifié avant d'être réel. Un mouvement jamais planifié ne peut pas être « payé » (422 `notPlanned`), et rien ne se confirme dans le futur (422 `futureDate`).
- **Calendrier mois / semaine** (`finCalendarView.service.js`, pur) : les trois sources sur leur jour, total prévu des sorties et des entrées (F003, F002), dépenses réelles de la période pour comparaison, **cash projeté cumulé jour par jour** et **jours de tension** (le premier est nommé, c'est celui sur lequel on agit). Les occurrences d'une récurrence sont projetées depuis sa prochaine échéance, **avec le jour borné au mois** (31 janvier → 28 février, jamais 3 mars) et sans dérive, puisque chaque occurrence se calcule depuis la date de base.
- **Le solde de départ est déclaré, jamais déduit** : FINCLUDIA ne détient aucun solde de compte. Sans lui, le cash projeté et les jours de tension ne sont **pas calculés** et l'écran le dit, au lieu de partir d'un zéro imaginaire. Un solde négatif est accepté : quelqu'un peut être à découvert, et refuser de l'écrire serait la mauvaise réponse. Le **seuil de tension** est lui aussi un paramètre (0 par défaut, le seul seuil qui ne demande de décision à personne).
- **Détection ALG-04 proposée puis confirmée** : `GET /fin/recurrences/detection` lit les mouvements réels des six derniers mois, n'écrit rien, et renvoie des **candidats** (`confirmed: false`) avec leur nombre d'occurrences, la fréquence du client la plus proche de l'intervalle mesuré, la catégorie des mouvements d'origine **et les paramètres utilisés** — pas de boîte noire : la tolérance est élargissable et l'on voit ce qui change. Seul `POST /fin/recurrences/confirmer` crée la ligne, qui porte alors `detected: true` et `sourceRef: 'detection:ALG-04'`. Ce que l'on suit déjà n'est plus reproposé.
- **Jamais de résiliation automatique** : retirer une récurrence arrête son **suivi**, rien d'autre. La plateforme ne contacte aucun fournisseur, et l'interface l'écrit au lieu de laisser le supposer.
- **Coût des abonnements** : F049 ramène chaque ligne au mois quelle que soit sa fréquence, puis le total annuel est douze mois de ce total (F001, dans l'autre sens — la lecture que CAL-04 fait déjà). Une récurrence **entrante** (un salaire) n'est pas un abonnement et n'entre pas dans le coût.
- **Provisions (F045)** : à provisionner par mois = (montant prévu − déjà provisionné) / mois restants. Passé l'échéance, il n'y a plus de mois pour diviser et la réponse est **« non calculé »**, pas le reste entier. Une provision **ne crée jamais une dépense réalisée** : elle apparaît sur son jour, dans son propre total, et n'entre dans aucun total de ce qui a été dépensé — vérifié par un test contre la synthèse de `P6-04`.
- **Plan du mois (SA03)** : `POST /fin/calendrier/plan` reprend les paiements **planifiés** du mois précédent, décalés d'un mois, jour borné au mois. Une dépense déjà réalisée n'est jamais copiée (ce serait inventer un paiement), et relancer l'action ne double pas le plan (ce qui est déjà prévu est laissé tel quel et compté dans `skipped`).
- **Interface** : `/calendrier`, trois sections visiblement distinctes parce que ce sont trois promesses différentes (planifié / récurrent / provisionné), fr / en / ar, jetons CSS, propriétés logiques (RTL), icônes `lucide-react`.
- **Cohérence globale étendue** : une récurrence porte une fréquence normalisable par le moteur, ne finit pas avant sa prochaine échéance, est une entrée ou une sortie ; une récurrence détectée dit de quelle détection elle vient ; une provision n'a jamais plus de provisionné que la dépense ; récurrences et provisions n'utilisent que les catégories de référence ou les leurs, et leur suppression logique est journalisée.
- **Tests** : 28 unitaires (`tests/unit/finCalendar.test.js`), 27 fonctionnels (`tests/functional/finCalendar.test.js`), 14 de sécurité (`tests/security/finCalendar.test.js` : isolation entre comptes, 404 et non 403, invisible pour un administrateur, le socle non pilotable depuis le corps de requête, effacement de compte). `/calendrier` est ajouté au balayage du site.

**Défauts trouvés par les tests et corrigés :**
- **L'arithmétique des mois débordait** : 31 janvier + 1 mois donnait 3 mars. Le jour est désormais **borné au mois cible**, dans les occurrences d'une récurrence comme dans les périodes de budget de `P6-05` (`nextPeriod`, corrigé au passage avec son test de non-régression) — sans quoi un budget mensuel sortait un peu plus du calendrier à chaque période.
- **`solde` en paramètre de requête était refusé** : les chaînes de requête sont du texte, et `amountSchema` refuse une chaîne à dessein (un corps JSON doit envoyer un vrai nombre). Un `queryAmount` qui convertit — mais refuse toujours ce qui n'est pas entier — a été ajouté.
- **Une règle de cohérence écrite deux fois** : « un mouvement planifié n'est jamais réel » existait déjà depuis `P6-04`. La règle de `P6-04` dit maintenant explicitement qu'elle **porte aussi** celle de `P6-07` (« un événement planifié n'est pas une transaction avant confirmation »), au lieu d'en avoir deux qui remonteraient la même violation.

**Limites et réserves déclarées :**
- **Rappels J-7 / J-1 : stockés, pas encore poussés.** `reminderDays` existe par récurrence et par provision, et l'interface les lit ; **aucune notification n'est envoyée** avant `P6-18` (centre de notifications). C'est aussi l'ordre du client : « canal in-app d'abord ».
- **Échéances de dettes et contributions aux objectifs ne sont pas encore des lignes du calendrier.** `P6-08` et `P6-10` existent, mais leurs échéances ne sont pas des dates stockées : une dette porte une mensualité, pas un jour du mois. Les ajouter demanderait d'inventer ce jour. À brancher quand ces tables porteront une date d'échéance.
- **Trois listes sont les nôtres, déclarées comme telles** dans `constants/finCalendar.js` : les paramètres par défaut d'ALG-04 (le client demande « libellé, montant toléré, intervalle » sans donner de valeurs), la fenêtre d'observation de six mois, et le seuil de tension à 0.
- **Pas de parcours navigateur dédié** au calendrier (le balayage couvre la page, pas le scénario complet).

### P6-08 — FINCLUDIA : objectifs financiers
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-05`, `P4-10`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans C09, C10, C11 ; ALG-03)

- Catalogue de modèles (urgence, études, permis, voiture, logement, voyage, mariage, enfant, retraite, projet, investissement) + objectif personnalisé ; valeurs d'exemple **non présélectionnées comme recommandation**.
- Création : nom, cible, devise, date future, capital déjà affecté (jamais plus que l'épargne marquée, sauf objectif fictif), priorité, contribution.
- Détail : trajectoire, date estimée (ALG-03), valeur nominale / réelle, manque ou excédent, contribution nécessaire, scénarios comparés ; **hypothèses toujours visibles** ; « résultat = simulation, pas promesse ».
- Alertes : objectif en retard, jalon atteint, contribution oubliée.

**Réalisé (2026-10-13) :** nouveau modèle `FinGoal`, service, contrôleur, routes `/fin/goals`, page `/objectifs`.
- **Catalogue de 11 modèles** (`constants/finGoal.js`) : un libellé chacun, jamais de montant suggéré.
- **Capital déjà affecté plafonné par l'épargne réellement constatée** : un nouveau service partagé (`finSavings.service.js`, F007 « épargne nette ») somme les dépôts et retraits réels catégorisés dans la famille « Objectifs » de `P6-02`, et la somme des objectifs réels d'un compte ne peut jamais la dépasser — sauf objectif **fictif**, qui ne compte pas contre de l'argent qui n'a jamais été réellement mis de côté.
- **Trajectoire (ALG-03)** : réutilise l'algorithme déjà construit et testé en `P4-10` (simulateur autonome) ; ici appliqué aux données réelles de l'objectif. Un rendement non renseigné est traité comme 0 %, jamais deviné. `completed: false` (hors horizon de simulation) est montré comme tel, pas masqué.
- **Contribution nécessaire pour la date choisie** (F028 / F032), affichée seulement si une date cible existe.
- **Interface** : liste dépliable avec barre de progression, formulaire de création par modèle ou personnalisé, correction du capital affecté et de la contribution, archivage, suppression ; fr / en / ar.

**Tests :** 6 de sécurité (`tests/security/finGoal.test.js` : isolation entre comptes, plafond d'allocation, effacement de compte).

**Limites et réserves déclarées :**
- **Valeur nominale / réelle (inflation) et scénarios comparés** ne sont pas repris ici : l'outil autonome `/outils/simulateurs` (`P4-10`) couvre déjà cette exploration ; les reprendre dans la fiche objectif aurait dupliqué la même mécanique sans donnée supplémentaire.
- **Alertes** (objectif en retard, jalon atteint, contribution oubliée) attendent le centre de notifications (`P6-18`).
- **Pas encore de test unitaire/fonctionnel dédié, de scénario de cohérence globale ni de parcours navigateur** — seule la sécurité est couverte pour l'instant, comme `P6-05` à sa livraison.

### P6-09 — FINCLUDIA : réserve de sécurité
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-05`
- Durée cible : 1 jour (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écran C12 ; F014)

Mois de réserve = épargne liquide / dépenses essentielles mensuelles ; cible en mois choisie par l'utilisateur ; manque, date estimée, composition expliquée. **Portefeuille fictif et actifs illiquides exclus par défaut** ; dépenses essentielles = 0 → « non calculé ».

**Réalisé (2026-10-13) :** pas de table dédiée — seule une cible (`users.finReserveTargetMonths`, nullable, **aucune valeur par défaut**) appartient en propre à cette tâche ; le reste se lit dans les données déjà existantes.
- **Épargne liquide** : le même F007 que `P6-08` (dépôts − retraits réels de la famille « Objectifs »), partagé via `finSavings.service.js` pour que les deux tâches ne tiennent jamais deux comptabilités différentes de la même épargne.
- **Dépenses essentielles mensuelles** : moyenne réelle sur 3 mois des catégories que l'onboarding (`P6-03`) qualifie déjà de `role: 'essentialExpenses'` (dérivées de `ONBOARDING_QUESTIONS`, jamais retypées) ; à défaut d'historique, reprend les réponses déclarées à l'inscription — le même pont que la proposition de budget (`P6-05`).
- **F014/F015/F016** exposées via `/fin/reserve` ; cible modifiable via `/fin/reserve/cible`, `null` tant que la personne n'a rien choisi — jamais 0 par défaut.
- **Interface** : page `/reserve` (figures, composition, choix de la cible), fr / en / ar.

**Tests :** 4 de sécurité (`tests/security/finReserve.test.js` : session requise, cible non partagée entre comptes, absence de cible = non calculé, bornes refusées).

**Limites et réserves déclarées :**
- **Date estimée d'atteinte de la cible** n'est pas calculée : aucune formule du catalogue ne la couvre, et en inventer une aurait été exactement ce que la règle du projet interdit.
- **Actifs illiquides et portefeuille fictif** : rien à exclure explicitement tant que `P6-11` (patrimoine réel) et `P6-12` (portefeuille fictif) n'existent pas — seule l'épargne réelle via transactions est comptée aujourd'hui, ce qui revient au même résultat qu'une exclusion, mais la case sera à revisiter quand ces tâches existeront.
- **Pas encore de test unitaire/fonctionnel dédié, de scénario de cohérence globale ni de parcours navigateur.**

### P6-10 — FINCLUDIA : dettes et analyse de l'endettement
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-04`, `P4-11`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans C13, C14)

- Déclaration des dettes (capital restant, mensualité, taux ou coût si connu, échéance, objet, prêteur, actif financé), paiements.
- Synthèse : encours, mensualités, **taux d'effort** (indicateur pédagogique, seuils `P6-01`), échéances ; qualification **productive / neutre / sous pression** seulement si les informations suffisent — jamais « bonne / mauvaise ».
- Détail : scénarios avalanche / boule de neige et versement supplémentaire (`P4-11`).

**Réalisé (2026-10-13) :** nouveaux modèles `FinDebt` et `FinDebtPayment`, service, contrôleur, routes `/fin/debts`, page `/dettes`.
- **Un paiement fait baisser le capital restant** et s'écrit dans le journal de corrections de la dette, plutôt que de laisser le capital dériver d'une mensualité déclarée à part — un dépassement est plafonné au capital restant, jamais négatif.
- **F017-F019** (service mensuel, taux d'effort, dette / revenu annuel) via `finance/formulas.js`, déjà écrites et testées depuis `P4-11` ; F018 n'est affiché que si une dette existe, pour la même raison que `P3-18`/`P6-04` : un taux à 0 % se lirait « pas de dette ».
- **Comparaison avalanche / boule de neige (ALG-01)** : réutilise l'algorithme du simulateur autonome (`P4-11`) sur les dettes réellement déclarées ; exclut explicitement, avec avertissement, toute dette sans taux connu — un taux deviné depuis la mensualité aurait inventé une donnée.
- **Qualification « productive / neutre / sous pression » volontairement absente** : ses seuils restent « à valider » par le client (`P6-01` point 5) ; en afficher un sans eux aurait été un verdict inventé. Seuls les indicateurs bruts sont montrés.
- **Interface** : liste dépliable (encours, synthèse, enregistrement de paiement), formulaire de déclaration, comparaison des deux stratégies, archivage, suppression ; fr / en / ar.

**Tests :** 6 de sécurité (`tests/security/finDebt.test.js` : isolation entre comptes, paiement plafonné, effacement de compte).

**Limites et réserves déclarées :**
- **Qualification productive / neutre / sous pression** : en attente des seuils du client (`P6-01` point 5), voir ci-dessus.
- **Pas encore de test unitaire/fonctionnel dédié, de scénario de cohérence globale ni de parcours navigateur.**

### P6-11 — FINCLUDIA : patrimoine réel
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P6-02`, `P6-10`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans C16, JA07 ; F035)

Actifs (comptes, CCP, espèces, or, véhicule, immobilier, placements) et passifs, valeur **datée**, devise, propriétaire, source, liquidité ; patrimoine net = actifs réels − dettes réelles ; allocation, historique, concentration ; alerte « valeur de plus de 90 jours ». **Le fictif est interdit ici.**

**Réalisé (2026-10-13) :**
- **Une seule table, et c'est un choix.** L'écran C16 montre « actifs **et passifs** », mais les passifs ont déjà la leur — `fin_debts` (`P6-10`) — et F035 les lit là-bas. Une seconde table de passifs aurait fait **deux endroits où corriger la même dette**, et le patrimoine net aurait dépendu de celui que l'appelant avait utilisé. `fin_assets` ne porte donc que les actifs, avec le socle de `P6-02` et 10 `CHECK`.
- **« Le fictif est interdit ici » est appliqué trois fois** : le statut `fictional` est absent de la liste zod, absent du `CHECK` SQL, et une règle de cohérence le cherche quand même. Ce n'est pas de la redondance : **une seule ligne fictive dans F035 ne rend pas le chiffre approximatif, elle le rend faux**, et l'autre moitié de la frontière est tenue par `P6-12` (dont toutes les lignes sont épinglées à `fictional`). Un test vérifie que la base refuse l'insertion directe.
- **La valeur est datée, et la date voyage avec le montant** : `valuedAt` est le jour où la personne a **établi** le montant, pas celui de la saisie — un appartement saisi l'an dernier et réévalué la semaine dernière est une donnée fraîche. **Corriger le montant sans donner la date est refusé** : sans cela, une valeur ancienne se mettrait silencieusement à paraître récente.
- **Alerte « valeur de plus de 90 jours »** (F055 sur `valuedAt`) : c'est l'un des rares seuils que le client **donne lui-même**. Il est paramétrable dans la requête et la réponse dit lequel a servi.
- **Liquidité : disponible / mobilisable / immobilisé.** Ce n'est pas décoratif : la condition de F014 (« réserve en mois ») est d'**exclure l'illiquide**, et le moteur ne peut pas distinguer un compte d'un appartement. La vue expose `disponibleRapidement`, qui est précisément le chiffre dont F014 a besoin. Un défaut par type est proposé, jamais imposé.
- **Patrimoine net (F035), allocation (F036) par ligne et par type, concentration (F037)** — avec la même retenue que `P6-12` : la concentration est **un fait et un seuil**, jamais une alarme, et la phrase qui l'accompagne appartient à l'interface.
- **L'historique des valorisations est lu dans le journal de corrections**, pas dans une seconde table : `fin_changes` enregistre déjà chaque changement de `value` et de `valuedAt` avec sa date (`P6-02`). Une série de valorisations séparée aurait été les mêmes faits stockés deux fois, et les deux auraient divergé.
- **Interface** : `/patrimoine`, fr / en / ar, jetons CSS, propriétés logiques (RTL). La page **dit** qu'aucune valeur fictive n'y entre, et pourquoi la date d'évaluation est demandée.
- **Tests** : 21 unitaires (`tests/unit/finWealth.test.js`), 15 fonctionnels (`tests/functional/finWealth.test.js`), 12 de sécurité (`tests/security/finWealth.test.js`). `/patrimoine` est ajouté au balayage du site.

**Défauts trouvés par les tests et corrigés :**
- **F035 était appelée avec deux totaux au lieu de ses listes d'entrées** (`netWorth(totalAssets, totalDebts)`) : la fonction attend `{ assets, liabilities, currency }` et sommait donc **deux listes vides**, si bien que le patrimoine net valait **0** quels que soient les montants. Quatre tests l'ont attrapé d'un coup.
- **J'avais étiqueté les totaux bruts en F035** alors que F035 est le **net** : un total d'actifs portant l'identifiant du patrimoine net l'aurait mal attribué. Les deux totaux bruts sont désormais des données descriptives, comme la `repartition` de la synthèse, et seul le net porte F035.
- **`sumAmounts` importé depuis `formulas.js`** où il n'existe pas (il est dans `finance/money.js`) : l'application ne démarrait plus. Trouvé en démarrant l'application, pas par un test — voir la note d'outillage sous `P6-12`.

**Limites et réserves déclarées :**
- **La réserve de sécurité (`P6-09`) ne lit pas encore `disponibleRapidement`.** Elle compte l'épargne marquée par les mouvements de la famille « objectifs », ce qui était la seule lecture possible avant cette tâche. Le brancher ferait changer un chiffre déjà affiché à des comptes existants : c'est une décision à prendre, pas un détail d'implémentation, et elle est signalée plutôt que prise seule.
- **Le périmètre « propriétaire »** d'un actif est le `scope` du socle (personnel / couple / foyer / espace) ; le **partage effectif** avec un membre d'espace est traité par `P6-13` (niveau `assets` de la matrice).
- **Le seuil de concentration (50 %)** est le nôtre, déclaré dans `constants/finWealth.js` : le client n'en fixe aucun, et il ne décide que l'apparition d'une phrase, jamais un chiffre.

### P6-12 — FINCLUDIA : portefeuille fictif et laboratoire d'investissement
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P6-11`, `P4-09`
- Durée cible : 4 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans C17, EP03 à EP07)

- Portefeuille **fictif** : capital fictif modifiable (100 000 DA par défaut), achats / ventes fictifs, frais simulés, rééquilibrage, réinitialisation ; plus-value et rendement ; badge « SIMULATION » permanent ; **aucune exécution**, aucune valeur fictive dans le patrimoine réel.
- Parcours épargnant : diagnostic « Suis-je prêt à commencer ? » (réserve et objectifs d'abord, sans bloquer l'accès éducatif), **profil de risque pédagogique**, « Comprendre les placements », « Marché pédagogique », **journal de décisions** et export.
- Concentration excessive → message éducatif, pas une alarme.
- Instruments et prix de référence : uniquement des données fournies ou validées par le client (`P6-01`).

**Réalisé (2026-10-13) :**

**La contrainte d'abord, parce qu'elle a décidé de la forme de la tâche.** Le client n'a fourni **ni instruments ni prix de référence**, et sa propre règle interdit d'en inventer. Il n'y a donc **aucun catalogue d'instruments et aucune cotation** dans ce qui est livré — et il n'y a pas non plus de « Marché pédagogique » avec des cours, qui serait exactement la donnée interdite. Ce qui existe est l'**atelier** : la personne **nomme** le support et **déclare elle-même** le prix simulé, daté. C'est sa simulation, pas une référence que la plateforme publierait. L'API le dit à voix haute (`instrumentCatalogue: null`, `instrumentCatalogueWaitingOn: 'P6-01'`, `pricesDeclaredByThePerson: true`) et la page aussi. Le jour où le client fournit un catalogue, le champ libre devient une liste à choisir.

- **Trois tables** (`fin_paper_portfolios`, `fin_paper_instruments`, `fin_paper_trades`), 15 `CHECK`, dont le plus important : **le `status` est épinglé à `fictional`** sur le portefeuille et sur chaque opération. Pas « par défaut » — **épinglé** : une ligne de cet atelier qui pourrait être stockée autrement serait à une requête près d'entrer dans un total réel. Avec l'interdiction symétrique de `P6-11`, les deux ne peuvent jamais se rencontrer, et un test le vérifie dans les deux sens.
- **Capital fictif de 100 000 DA par défaut** (la valeur du client), **modifiable** : l'augmenter ajoute la différence aux liquidités, la baisser sous ce qui est investi est **refusée** plutôt que de laisser un portefeuille tenir des positions qu'il n'a jamais pu payer.
- **Aucune exécution, et aucun effet de levier** : une opération déplace des liquidités fictives et rien d'autre. Un achat que les liquidités ne couvrent pas est **refusé, jamais emprunté** ; vendre plus d'unités qu'on en détient est refusé aussi — une position short n'est pas quelque chose que cette tâche propose. Les **frais simulés** sont stockés **sur l'opération**, pas recalculés : changer le taux plus tard ne doit pas réécrire le passé.
- **Badge « SIMULATION » permanent** : au niveau du portefeuille, sur chaque position, et dans les `hypotheses` de chaque réponse du moteur — où figure aussi le fait que **les prix sont ceux de la personne**.
- **Plus-value (F039), rendement (F040), valeur (F038)**, avec les **frais fictifs inclus dans le coût** (la condition de F039). Un portefeuille vide n'a **pas** un rendement de 0 : il n'en a pas.
- **Rééquilibrage proposé, jamais appliqué** : la route renvoie les unités à acheter ou à vendre et **n'écrit rien** ; chaque ligne est une opération que la personne passe elle-même, ce qui est aussi ce qui garde le journal honnête. Des cibles qui ne font pas 100 % sont **refusées** plutôt que normalisées dans son dos.
- **Journal de décisions** : la table des opérations **est** le journal, et son champ `note` est le **pourquoi** — l'intérêt du dispositif ; les montants sont la partie facile. Export CSV avec la même protection que `P6-04` : une note commençant par `=` est préfixée d'une apostrophe pour qu'un tableur ne l'**exécute** pas.
- **« Suis-je prêt à commencer ? » répond et ne bloque jamais.** Quatre points lus dans les modules existants — réserve (F014, `P6-09`), objectifs (F025, `P6-08`), flux net (F004, `P6-04`), taux d'effort (F018, `P6-10`) — et la réponse porte `bloque: false` **dans le corps de la réponse**, pour qu'aucun écran ne puisse en faire un verrou par inadvertance. C'est la règle du client : « réserve et objectifs d'abord, **sans bloquer l'accès éducatif** ».
- **Profil de risque pédagogique (F057) : le score est affiché, l'étiquette ne l'est pas.** Les questions sont les nôtres, déclarées et **versionnées** ; les **seuils** qui transformeraient le nombre en mot (« prudent », « dynamique ») sont « non figés » dans le catalogue du client et n'ont pas été donnés (`P6-01`). F057 renvoie donc `category: null`, rien n'en invente une, et **l'écran explique pourquoi** il n'y a pas de mot à côté du chiffre. Les **pondérations sont dans la réponse**, jamais cachées.
- **Concentration excessive → message éducatif, pas une alarme** (les mots du client) : la réponse porte le fait et le seuil, la phrase appartient à l'interface. Réutilise F036 / F037, les **mêmes lignes** que le patrimoine réel — une seule définition de « une part ».
- **Réinitialisation** : c'est **le seul endroit de la Phase 6 où une suppression est physique**, et c'est juste ici — rien dans cette table n'a alimenté un historique réel, et une réinitialisation qui garderait les anciennes décisions n'en serait pas une. L'export existe précisément pour qu'on puisse garder le journal avant, et l'écran le dit **avant** le bouton.
- **« Comprendre les placements »** renvoie au glossaire et aux mini-guides de `P2-08`, qui existent : aucun contenu n'est dupliqué.
- **Interface** : `/portefeuille`, fr / en / ar, jetons CSS, propriétés logiques (RTL).
- **Tests** : 31 fonctionnels (`tests/functional/finPaper.test.js`), passés du premier coup, dont la frontière avec le patrimoine réel dans les deux sens, le refus de l'effet de levier, et le score sans étiquette. `/portefeuille` est ajouté au balayage du site.

**Limites et réserves déclarées :**
- **Pas de « Marché pédagogique ».** Il demanderait des instruments et des cours de référence, que le client doit fournir (`P6-01`). C'est la seule puce de la spécification qui n'est pas livrée, et elle ne l'est pas **parce que** la dernière puce de la même spécification l'interdit.
- **Les quantités sont des unités entières.** Un atelier n'a pas besoin de fractions, et un entier est une quantité que la personne peut vérifier. À revoir si le client fournit des instruments qui se fractionnent.
- **Trois listes sont les nôtres**, déclarées dans `constants/finPaper.js` : le taux de frais simulés par défaut (1 %), le seuil de concentration (40 %) et le **questionnaire de risque** (versionné).

### P6-13 — FINCLUDIA : espaces partagés — création, membres et permissions
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P6-04`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans P01, P04, CO01, CP01, FA01)

- Hub « À plusieurs » : créer un espace (colocation, couple, foyer), devise, membres, règle de partage par défaut ; invitations (expiration, membre déjà présent) ; rejoindre, quitter.
- Rôles **Owner / Admin / Member / Viewer** ; **matrice de permissions** (revenus, transactions, actifs, objectifs : privé, partagé, total seul) — par défaut **tout est privé** ; « Partager seulement les totaux » ; révocation ; notification à chaque changement de partage.
- Accès non autorisé → écran neutre ; membre supprimé → historique anonymisé selon la politique (`P6-01`).
- Tests de sécurité dédiés : aucune donnée privée d'un membre visible par un autre, même par l'API directe.

**Réalisé (2026-10-13) :**

**Deux règles sont inscrites dans la FORME du code, pas laissées à la discipline des appelants :**
1. **Le partage est par MEMBRE, et privé par défaut.** Rejoindre un espace ne révèle rien. Chaque personne décide, poste par poste, ce que les autres peuvent voir des siennes — et **il n'existe aucune route par laquelle un propriétaire ou un administrateur pourrait régler le partage de quelqu'un d'autre**. Ce n'est pas une vérification, c'est une absence : la seule route de partage écrit la ligne de l'appelant.
2. **La vue d'un lecteur est construite à partir de ce que le SUJET a partagé, jamais de ce que le rôle du lecteur autorise.** Un rôle dit ce qu'on peut faire à l'**espace** (inviter, renommer, retirer) ; il ne donne jamais accès à l'argent de quelqu'un. Tout passe par une seule fonction, `visibleTo({ reader, subject, kind })`, donc il y a **un** endroit à vérifier et non un par écran.

- **Trois tables** (`fin_spaces`, `fin_space_members`, `fin_space_invites`), 12 `CHECK`. Elles ne sont **pas** dans `FINANCIAL_TABLES`, et c'est délibéré : elles ne portent aucun montant ni le socle de métadonnées — un espace n'est pas une donnée financière, c'est **qui peut en voir une**. Leurs règles sont donc écrites explicitement dans le contrôle de cohérence.
- **Rôles Owner / Admin / Member / Viewer**, comparés par rang plutôt que par cas particuliers. Un espace vivant a **exactement un propriétaire** (règle de cohérence) ; **une invitation ne peut jamais accorder la propriété**, un changement de rôle non plus, et le propriétaire ne peut pas quitter l'espace — il le transmet ou le supprime, sinon personne ne pourrait plus le supprimer.
- **Matrice de permissions : privé / totaux seuls / détail**, sur revenus, transactions, actifs et objectifs. Au niveau « **totaux seuls** », les lignes **ne sont pas envoyées du tout** — pas envoyées puis masquées par l'interface, ce qui serait une fuite en attente d'un bug. Un test vérifie qu'une note saisie par la personne **n'apparaît nulle part** dans la réponse à ce niveau.
- **Révocation immédiate**, dans les deux sens : retirer un partage le reprend aussitôt, et **quitter l'espace coupe tout** — ce que la personne partageait cesse d'être visible, et elle ne voit plus rien non plus. **Re-rejoindre repart de privé** : un consentement donné une fois n'est pas un consentement pour toujours.
- **Accès non autorisé → écran neutre** : un espace dont l'appelant n'est pas membre répond **404, jamais 403**. C'est la seule façon de tenir cette exigence : distinguer « pas à vous » de « n'existe pas » confirmerait l'existence de l'espace.
- **Invitations** : le jeton est renvoyé **une seule fois** et stocké **haché en SHA-256**, comme une session ou un jeton de réinitialisation — une base qui fuite ne doit pas donner la capacité de rejoindre le foyer de quelqu'un. Un jeton inconnu, révoqué ou expiré répondent **tous les trois à l'identique**, pour que la route ne serve pas à découvrir si un jeton a existé. « Membre déjà présent » est le cas que le client nomme, et il est dit tel quel. Les invitations d'un espace supprimé sont révoquées.
- **Notification à chaque changement de partage** : chaque changement écrit une ligne dans le journal (`sharing.<poste>`, valeur avant / après), et c'est **ce journal que `P6-18` lira**. En attendant, le journal de l'espace est consultable par ses membres et ne contient **aucun montant** — seulement les faits d'appartenance et de consentement.
- **Nom affiché** distinct du nom du compte : rejoindre une colocation ne doit pas obliger à livrer son nom légal.
- **Interface** : `/espaces`, avec la promesse en tête de page et le réglage « ce que JE partage » comme seul contrôle de partage ; fr / en / ar, jetons CSS, propriétés logiques (RTL).
- **Tests** : **24 de sécurité** (`tests/security/finSpace.test.js`), passés du premier coup — c'est le fichier que la spécification demande en ces termes (« aucune donnée privée d'un membre visible par un autre, même par l'API directe »). Ils couvrent : l'espace invisible pour un non-membre et pour un administrateur, le 404 systématique, un admin qui ne voit pas plus qu'un autre, l'absence de route pour régler le partage d'autrui, « totaux seuls » qui n'envoie pas les lignes, la révocation immédiate, le départ, le re-rejoint à zéro, le jeton haché et à usage unique, et l'effacement de compte. `/espaces` est ajouté au balayage du site.

**Limites et réserves déclarées :**
- **« Membre supprimé → historique anonymisé selon la politique » attend la politique.** Aujourd'hui l'appartenance est marquée `leftAt` (les chiffres de l'espace ont été calculés avec cette personne dedans, et effacer la ligne rendrait ce passé illisible) et **ses données cessent d'être visibles immédiatement**. Quelle part de l'historique doit être anonymisée, et comment, est un point de `P6-01` : c'est une règle de conservation, pas un détail technique, et elle n'est pas inventée.
- **Les dépenses partagées et les règlements** sont `P6-14` : cette tâche livre l'espace, ses membres et la matrice, pas encore F041 / F042 / F043 sur des dépenses communes. La **règle de partage par défaut** est stockée à la création, prête pour elle.
- **La notification elle-même attend `P6-18`** : le journal des changements de partage existe et est lisible, rien ne le **pousse** encore.
- **Les tableaux de bord « Moi / Nous », colocation et foyer de `P6-06`** lisent encore les données personnelles du compte. Les brancher sur cette matrice est le travail de `P6-15`.

### P6-14 — FINCLUDIA : dépenses partagées et règlements
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P6-13`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans P02, P03 ; F043, ALG-02)

- Dépense partagée : payeur, participants, répartition égale / en % / en montants, **somme des parts = montant**, arrondis selon une règle documentée, payeur pouvant ne pas participer.
- Soldes par membre (convention de signe documentée dans l'API) ; « qui doit quoi à qui » avec **minimisation du nombre de remboursements** (ALG-02) qui ne change jamais la dette nette de chacun ; paiements déclaratifs (aucune intégration de paiement).

### P6-15 — FINCLUDIA : colocation, couple et famille
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P6-14`, `P6-05`, `P6-08`
- Durée cible : 4 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans P05, CO02 à CO06, CP02 à CP04, FA02 à FA06)

- Tableau de bord partagé selon le type d'espace, **jamais de montant privé non partagé**.
- Colocation : factures et abonnements communs (un paiement confirmé crée la dépense partagée, sans doublon), enveloppes communes, accord financier, objectifs communs.
- Couple : objectif commun, contributions (F044), revue financière, séparation « Moi / Nous ».
- Famille : foyer, enfants et projets (**données enfant minimales**), dépenses annuelles et provisions (F045), revue du foyer.

### P6-16 — FINCLUDIA : préparation au financement
- Statut : `❌ todo`
- Priorité : `🟢 low`
- Dépendances : `P6-10`, `P6-11`, `P6-01`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans JA08, SA05)

Indice de **préparation** du dossier (complétude, stabilité, effort dette, apport, réserve ; pondérations du client), points forts / faibles, pièces manquantes, checklist, export (avec consentement). **Jamais le mot « score de crédit », aucune prédiction ni garantie d'accord.**

### P6-17 — FINCLUDIA : personnalisation des 8 parcours
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P6-06`, `P6-15`, `P2-09`, `P4-10`
- Durée cible : 5 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (spécification § 6 à 13, onglet `19_Cartes_Parcours` ; lot 7 du backlog client)

Une fois les moteurs stables : vocabulaire, navigation, écrans activés et tableaux de bord **propres à chaque public** (carte des parcours), écrans spécifiques restants (préparer mes études LY09, autonomie ET03, transition premier revenu JA01, plan du mois SA03, diagnostic épargne EP01…), et passages d'un parcours à l'autre (`P3-18`). Les écrans communs sont réutilisés par configuration, jamais recopiés.

### P6-18 — FINCLUDIA : centre de notifications et alertes
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P6-04`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écran C24, onglet `14_Etats_Alertes`)

Liste chronologique avec lien vers l'écran concerné ; filtres (action, information, sécurité ; lu / non lu) ; priorité **sécurité > échéance > budget > apprentissage** ; quotas et anti-répétition ; désactivation par type ; **rappels uniquement sur consentement (opt-in)**. Canal in-app d'abord ; e-mail / push selon `P6-01`.

### P6-19 — FINCLUDIA : centre de confiance et de données
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P6-02`, `P3-18`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écran C25)

Inventaire des données (origine, date, statut, usage autorisé), consentements (retrait qui bloque les usages dépendants), **export** des données, **suppression** selon la politique légale (expliquée quand une obligation de conservation l'empêche), appareils connectés, score de complétude (**jamais un score de solvabilité**) ; actions sensibles **réauthentifiées**. Lève le point « droit à l'effacement » resté ouvert en `P5-05`.

### P6-20 — FINCLUDIA : recherche globale
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P6-04`, `P6-08`, `P2-08`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écran C22, onglet `12_Recherche`)

Une seule barre : écrans, actions, transactions, objectifs, contenus « Apprendre », offres autorisées ; résultats groupés (Actions, Mes données, Objectifs, Apprendre, Explorer) ; recherche lexicale + synonymes configurés, **aucune interprétation générative** ; données privées **strictement cloisonnées** (propriétaire / espace) ; aucun résultat → reformulations et catégories.

### P6-21 — FINCLUDIA : validation de fin de phase
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P6-03`, `P6-06`, `P6-07`, `P6-12`, `P6-15`, `P6-16`, `P6-17`, `P6-19`, `P6-20`, `P4-13`, `P4-14`, `P4-15`, `P4-16`, `P3-19`, `P2-10`
- Durée cible : 2 jours (estimation)

Critères :
- Les 10 parcours de bout en bout (J01 à J10, onglet `02_Parcours_E2E`) passent en navigateur pour chaque public concerné.
- Chaque formule a son test unitaire avec les exemples du client (onglet `16_QA_Tests`).
- Aucune donnée privée visible hors de son propriétaire ou de son espace (audit de sécurité automatique + tests dédiés).
- Aucun total ne mélange réel et fictif ; aucune valeur non calculable affichée à 0.
- Matrice de provenance (onglet `18_Provenance`) : chaque écran livré est rattaché à sa ligne source.

### Impact sur le délai (FINCLUDIA, ajout du 2026-10-09)

FINCLUDIA **n'était pas dans le plan de 8 semaines** et représente un produit nettement plus grand que le MVP actuel. Estimation grossière, tâche par tâche (tests compris, **hors temps de décision du client**) :
- prolongements des modules existants : `P1-12` 3 j, `P2-08` à `P2-10` 6 j, `P3-18` et `P3-19` 5 j, `P4-09` à `P4-16` 18 j (dont `P4-09` fait) ;
- nouveaux modules `P6-02` à `P6-21` : environ 56 j.

Soit **environ 86 jours ouvrés, de l'ordre de 4 mois** pour une personne, en plus de ce qui reste du MVP (paiement, simulateur de crédit, facture, Phase 5). Pistes pour livrer plus tôt : commencer par 2 ou 3 publics, livrer les lots 0 à 2 du backlog client (argent, budget, objectifs, réserve, dettes) avant le reste, garder espaces partagés et portefeuille fictif pour une seconde livraison. **Le client doit arbitrer (`P6-01`).**

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

Précision du 2026-10-09 (direction FINCLUDIA) : la liste ci-dessus reste valable **pour le MVP 8 semaines**, mais FINCLUDIA (Phase 6) en reprend volontairement plusieurs éléments, **hors de ce délai** : agrégation des données financières personnelles, portefeuille fictif, espaces partagés. Restent explicitement hors périmètre même dans FINCLUDIA, parce que le client les exclut lui-même dans ses documents : **IA générative** sous toute forme (l'assistant est déterministe, `P3-19`), **exécution d'ordres réels** (le portefeuille est fictif, `P6-12`), **connexion bancaire automatique / agrégation par API bancaire** (saisie manuelle ou import, « phase ultérieure »), **extraction automatique d'une fiche de paie** (`P4-14`), **conseil financier réglementé** et **score de solvabilité** (interdits), application mobile, paiement entre membres d'un espace partagé (règlements seulement déclaratifs, `P6-14`).

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

Règles ajoutées le 2026-10-09 (direction FINCLUDIA, données financières personnelles) :
13. Une donnée financière appartient à un propriétaire et à un périmètre : toute lecture et toute écriture vérifient les deux côté serveur. Un espace partagé ne donne accès qu'à ce qui a été explicitement partagé.
14. Les totaux réels et les données fictives (portefeuille, budget d'entraînement) ne sont jamais additionnés, ni dans l'API, ni dans la base, ni à l'affichage.
15. Une valeur qui ne peut pas être calculée se renvoie « non calculée » ; ne jamais remplacer une donnée manquante par 0.
16. Tout calcul critique renvoie sa formule, sa version, ses variables, ses hypothèses et sa date (contrat de l'onglet `15_API`). Aucun calcul financier n'est fait côté client.
17. Aucune règle financière, légale, fiscale ou de paie n'est inventée : elle vient du client, datée et versionnée, sinon la fonction reste bloquée.
18. Les fonctions réservées aux 18 ans et plus sont refusées côté serveur, pas seulement masquées dans l'interface.
19. L'assistant ne génère jamais de texte : il choisit parmi des modèles validés et lit des valeurs par des API en lecture seule.

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

Règle ajoutée le 2026-10-09 (FINCLUDIA) : tout écran FINCLUDIA doit traiter les cinq états exigés par le client (vide, chargement, partiel / donnée ancienne, succès, erreur près du champ — onglet `14_Etats_Alertes`), afficher la date et la version de chaque valeur calculée, et rester utilisable au clavier sans dépendre de la couleur seule. Un écran livré sans son état vide ni son état « non calculé » n'est pas terminé.

Règle ajoutée le 2026-09-18 (voir P1-10) : toute nouvelle page ou tout nouveau composant texte, à partir de maintenant, doit utiliser `useTranslation()`/`t()` (i18next) dès sa création — jamais de texte en dur. Les traductions français/anglais/arabe correspondantes doivent être ajoutées dans le même changement (le tamazight reste volontairement en repli vers le français). Les couleurs doivent utiliser les tokens CSS existants (`index.css`), pas de couleurs codées en dur, pour rester compatibles avec le mode clair/sombre. Les icônes sont des composants `lucide-react` (jamais d'emoji ni de caractère décoratif) ; les flèches directionnelles utilisent la classe `icon-dir` pour s'inverser en RTL.

# 7. État actuel

Phase active : `PHASE 3` — BLOG + CMS CONTENU + NEWSLETTER (les Phases 1 et 2 ont été validées le 2026-09-19, voir P1-08 et P2-07)

Dernières tâches terminées et vérifiées :
`P6-04 — FINCLUDIA : « Mon argent » — revenus et transactions`, `P6-03 — FINCLUDIA : onboarding financier progressif`, `P6-02 — FINCLUDIA : modèle de données financier commun`, `P2-08 — FINCLUDIA : « Apprendre » — glossaire, mini-guides et recherche pédagogique`, `P3-18 — FINCLUDIA : publics (personas), âge, intention et changement de parcours`, `P3-19 — FINCLUDIA : assistant déterministe (intentions, parcours à étapes, liens profonds)`, `P4-03 — Générateur de facture` (sans conservation : calcul et Excel par le serveur, PDF par le navigateur), `P3-09 — Paiement : socle indépendant du fournisseur` (avec un fournisseur simulé réservé au développement ; en production le paiement reste annoncé « pas encore disponible » jusqu'à `P3-10`), `P3-07 — Assistant guidé (chatbot à questions / réponses prédéfinies)` (le module est prêt ; il reste invisible tant que l'administrateur n'a publié aucune question), `P4-16 — FINCLUDIA : atelier de simulation (C18)`, `P4-12 — FINCLUDIA : moteur de comparaison multicritère et comparateur d'offres d'emploi`, `P4-11 — FINCLUDIA : calculateurs, lot 2 (dettes et crédit)`, `P4-10 — FINCLUDIA : calculateurs, lot 1 (budget, épargne, objectifs, inflation, simulations de vie)`, `P4-09 — FINCLUDIA : moteur de calcul versionné` (premières tâches de la direction FINCLUDIA, 2026-10-09), `P4-08 — Comparateur bancaire, lot C : administration des données`, `P4-07 — Comparateur bancaire, lot B : pages publiques`, `P4-06 — Comparateur bancaire, lot A : données et API publique`, `P4-01 — Architecture commune des outils` (comparateur bancaire commencé à la demande de l'utilisateur, avant la validation de la Phase 3), `P3-17 — Articles multilingues (traductions)`, `P3-16 — Panel d'administration étendu (utilisateurs, droits, paramètres, médiathèque, certifications) et tableau de bord personnalisé`, `P3-15 — Types de compte dynamiques`, `P3-14 — CMS pédagogique, lot D : finitions`, `P3-13 — CMS pédagogique, lot C : quiz`, `P3-12 — CMS pédagogique, lot B : blocs de contenu et éditeur avancé`, `P3-11 — CMS pédagogique, lot A : structure d'une formation`, `P3-05 — Newsletter`, `P3-04 — Recommandation / visibilité selon profil`, `P3-06 — Suite de tests automatisés (unitaires, fonctionnels, sécurité, cohérence globale)`, `P3-03 — Frontend blog`, `P3-02 — CMS simplifié`, `P3-01 — Modèle de données blog`, `P2-07 — Validation de fin de phase` (Phase 2 validée), `P2-06 — Protection des contenus E-Learning`, `P2-05 — Certification`, `P2-04 — Suivi de progression`, `P2-03 — Interface utilisateur E-Learning`, `P2-02 — Gestion des formations côté admin (CMS)`, `P2-01 — Modèle de données E-Learning`, `P1-08 — Validation de fin de phase` (Phase 1 validée), `P1-07 — Intégration frontend/backend`, `P1-11 — Refonte visuelle du frontend`, `P1-06 — Authentification + rôles`, `P1-05 — Backend minimal et navigation dynamique`, `P1-09 — Mode clair / sombre`, `P1-10 — Internationalisation (i18n)` (toutes ✅ done)

Toutes les tâches de pages (P1-02, P1-03, P1-04), le socle backend (P1-05) et les deux ajouts signalés par l'utilisateur (mode clair/sombre, i18n FR/EN/AR + tamazight en repli) sont terminés. Le modèle `User` existe en base (Prisma).

Nom de la plateforme : **FINCLUDIA** (tranché le 2026-10-09, `P6-01` point 1). Renommage appliqué dans le code, les textes fr / en / ar, les tests et la documentation ; ce qui reste volontairement à l'ancien nom (base de données, conteneur Docker, dossier du projet, historique de ce fichier) et pourquoi : voir « Renommage en FINCLUDIA » dans `P6-01`.

Direction ajoutée le 2026-10-09 : **FINCLUDIA** (gestion financière personnelle, 8 publics) devient la suite du projet, sur la base des deux documents du client à la racine du dépôt. Le plan est découpé en Phase 6 (`P6-01` à `P6-21`, modules nouveaux) plus les prolongements des modules existants : `P1-12` (système de design et navigation), `P2-08` à `P2-10` (Apprendre : glossaire, indice de connaissances, défis), `P3-18` et `P3-19` (publics / personas, assistant déterministe), `P4-09` à `P4-15` (moteur de calcul versionné, calculateurs, comparaisons, fiche de paie, financement). Estimation d'environ **4 mois** en plus du MVP restant, détail dans « Impact sur le délai (FINCLUDIA) » à la fin de la Phase 6. **Rien ne doit commencer avant les décisions de cadrage `P6-01`** (nom de la plateforme, périmètre de la première livraison, publics retenus, devises, seuils, règles de paie).

Prochaines tâches réalisables (dépendances satisfaites) :
- Le blog est terminé (P3-01 à P3-06 hors paiement et assistant guidé). La Phase 4 (outils) ne doit commencer qu'après validation de la Phase 3.
- La Phase 4 FINCLUDIA est faite (`P4-09` moteur, `P4-10` et `P4-11` les 18 calculateurs, `P4-12` comparaisons et offres d'emploi, `P4-16` atelier), ainsi que les fondations `P3-18` (publics), `P2-08` (Apprendre) et `P3-19` (assistant déterministe).
- **Le socle argent de FINCLUDIA est en place** : `P6-02` (référentiel de catégories, socle de métadonnées, journal de corrections, contrôle de cohérence étendu), `P6-03` (onboarding progressif) et `P6-04` (« Mon argent » : ressources, mouvements, historique, synthèse, justificatifs). Les tâches qu'ils débloquent, par ordre d'intérêt :
  - **Mise à jour du 2026-10-13 :** `P6-05` (budgets et enveloppes), `P6-06` (accueil « Aujourd'hui » et tableaux de bord par public), `P6-07` (calendrier et dépenses récurrentes), `P6-08` (objectifs), `P6-09` (réserve) et `P6-10` (dettes) sont **faites**. Les six lots 0 à 2 du backlog client — argent, budget, objectifs, réserve, dettes, calendrier — tiennent donc debout, et l'accueil les lit tous.
  - **Mise à jour du 2026-10-13 (seconde) :** `P6-11` (patrimoine réel), `P6-12` (portefeuille fictif et atelier d'investissement) et `P6-13` (espaces partagés) sont **faites**. La suite réalisable sans rien demander au client est `P6-14` (dépenses partagées et règlements, qui dépend de `P6-13` ✅), puis `P6-15` (colocation, couple, famille) et `P6-18` (centre de notifications) — ce dernier a maintenant trois journaux à lire : les alertes de budget (`P6-05`), les rappels d'échéance (`P6-07`) et les changements de partage (`P6-13`).
  - `P6-19` (centre de confiance) ne dépend plus que de ses propres prérequis.
  - **`P6-18` a un périmètre plus net qu'avant** : les alertes de budget sont déjà affichées in-app par `P6-05` et `P6-06` (ce qui est l'ordre du client, « canal in-app d'abord »), et les rappels J-7 / J-1 de `P6-07` sont **stockés** par récurrence et par provision. Il lui reste le centre de notifications lui-même : liste, quotas, anti-répétition, désactivation par type, canaux e-mail / push.
  - `P1-12` **a rétréci** : ses composants communs sont livrés (voir la note sous la tâche) ; il ne lui reste que la navigation de l'espace connecté et la barre supérieure, qui dépendent de `P6-01`, `P6-18` et `P6-20`.
  - **Ce qui reste volontairement ouvert** et attend le client : la confirmation du référentiel de catégories (`P6-01` point 10), l'échelle du **niveau de confiance** et la liste des **moyens de paiement** — trois listes provisoires, déclarées comme telles dans `constants/finData.js` et `constants/finMoney.js`.
  - `P2-09 — indice de connaissances financières et passeports` (dépend de `P2-08` ✅) : attention, les **pondérations** de l'indice sont un seuil à valider par le client (`P6-01` point 5) ; l'indice `F052` prend ses poids en argument, donc la mécanique est faisable sans eux, pas la publication d'un score.
  - `P4-13 — comparateur bancaire, lot D` (dépend de `P4-08` ✅, `P4-12` ✅, `P3-18` ✅) : l'adéquation à l'usage et « Explorer » sont faisables sur les données déjà fournies ; les données **CCP** manquent (`P6-01` point 6) et ne doivent pas être inventées.
- `P4-14` et `P4-15` attendent les règles de paie et de financement du client ; le reste de la Phase 6 part maintenant de `P6-11` / `P6-13`, puis attend `P6-01` pour ce qui touche aux seuils et aux devises.
- **Trois listes de données attendues du client bloquent désormais des points précis, pas des tâches entières** : les **instruments et prix de référence** du portefeuille fictif (`P6-12` : l'atelier fonctionne, le « Marché pédagogique » non), les **seuils du profil de risque** (`P6-12` : le score s'affiche, l'étiquette non) et la **politique d'anonymisation** d'un membre retiré d'un espace (`P6-13`).
- **Deux scores restent délibérément non publiés**, pour la même raison et dans les mêmes termes : l'indice de **connaissances financières** (`F052`, `P2-09`) et l'indice de **santé financière** (`F053`, `P6-06`). Les deux mécanismes existent dans le moteur et prennent leurs pondérations en argument ; ce sont les **poids** que le client doit valider (`P6-01` point 5). Un score est un jugement sur quelqu'un, pas un chiffre qu'il peut vérifier : `P6-06` affiche donc les sous-scores un par un et **dit à l'écran** pourquoi le score global est absent.
- Le moteur de comparaison de `P4-12` est désormais disponible pour `P4-13` (adéquation à l'usage) et pour tout écran qui doit comparer des options sans produire de classement opaque.

- Comparateur bancaire et générateur de facture terminés (P4-01, P4-03, P4-06 à P4-08). Reste dans la Phase 4 : `P4-02 — Simulateur de crédit`, **bloqué** sur les règles de calcul du client ; il bloque à son tour la validation de fin de phase `P4-05`, donc la Phase 5.

Recommandation : plus aucune tâche du **MVP** n'est réalisable sans une décision ou une donnée du client (voir « Blocages » ci-dessous) ; côté FINCLUDIA, `P6-02` à `P6-13` étant faites, la suite la plus utile est `P6-14` (dépenses partagées et règlements) puis `P6-15`, qui s'appuient sur la matrice de permissions déjà livrée — ni l'une ni l'autre ne demande rien au client. Puis la validation de fin de Phase 3. En parallèle, obtenir les réponses de `P6-01`, qui conditionne tout FINCLUDIA. Points d'attention :
- **Newsletter : aucun courriel réel ne part tant qu'un fournisseur d'e-mail n'est pas choisi** (pilote `none` par défaut en production : l'inscription répond « pas encore disponible »). C'est la décision client la plus urgente pour rendre P3-05 réellement utilisable ; elle débloque aussi « mot de passe oublié ».
- Chaque nouvelle tâche ajoute ses tests dans `server/tests/` (voir P3-06 et README « Tests ») ; `npm test` doit rester vert, le test de cohérence du projet vérifie aussi ce fichier (statuts, dépendances, tâches terminées documentées, cette section).
- Toute nouvelle route API : elle sera contrôlée par l'audit d'autorisation automatique (toutes les routes Express, voir P2-07) — la déclarer publique ou la protéger explicitement.
- Décisions clients encore ouvertes, listées à la fin de P2-07 (règle des formations sans cours obligatoire, visibilité du nom sur la vérification publique, mentions du certificat).
- Rappel : `npx prisma generate` après chaque migration (voir P1-08) ; sur une machine neuve : `npm install` dans `client/` et `server/`, `prisma migrate deploy`, `JWT_SECRET` dans `server/.env` (voir README).
- **Paquet de déploiement `larbi-en-ligne/` périmé** depuis le renommage et le changement de préfixe des certificats : à régénérer (construction du client, assemblage, export SQL) avant toute nouvelle mise en ligne. Ce qui est actuellement déployé sur l'hébergement mutualisé porte encore l'ancien nom.

Blocages / informations manquantes signalées (non bloquantes pour continuer, mais à ne pas oublier avant livraison) :
- Mentions légales et politique de confidentialité : identité légale du client (raison sociale, SIRET, adresse, hébergeur, contact DPO) à fournir avant mise en production (voir notes P1-03).
- Formulaire de contact : aucune coordonnée réelle (email/téléphone/adresse) fournie. Depuis P3-16, un administrateur peut les saisir lui-même (page « Paramètres ») et elles s'affichent aussitôt sur `/contact` et dans le pied de page — reste seulement à ce que le client transmette (ou saisisse) les informations réelles.
- Fournisseur d'email non défini : « mot de passe oublié » reste inactif et les messages du formulaire de contact ne sont que stockés en base (voir P1-07). La newsletter (P3-05) est construite mais ne peut rien envoyer tant qu'il n'est pas choisi ; à choisir avant la mise en production.
- Paiement (`P3-08`, `⛔ blocked`) : fournisseur / banque, moyens de paiement, devise, offres et règles de remboursement **non définis** ; le client fait ses propres recherches (liste des points dans `P3-08`). Bloque `P3-10`, pas `P3-09`.
- Assistant guidé (`P3-07`, terminé) : une **v1 basique** est en ligne (6 questions génériques sur l'usage du site, rédigées par l'équipe — rien de commercial, légal ou tarifaire). Le client peut fournir des questions/réponses plus détaillées à tout moment, à saisir dans Administration → Assistant ; la v1 reste en place tant qu'il n'y a rien de plus précis.
- Simulateur de crédit (`P4-02`, `⛔ blocked`) : règles d'octroi, taux et formules de capacité d'emprunt à fournir par le client (les classeurs fournis ne contiennent que des conditions bancaires). Bloque `P4-05` puis toute la Phase 5.
- **FINCLUDIA (`P6-01`, `⛔ blocked`)** : points de cadrage encore ouverts à trancher par le client avant de développer (sort commercial de l'existant — module ou site à part, logo/charte/domaine, périmètre de la première livraison, publics retenus, devises et taux de change, seuils et pondérations laissés « à valider » dans la spécification, règles de paie datées, âge minimum et consentement parental). Trois points sont tranchés depuis le 2026-10-11 : type de compte (un seul profil à la fois, voir `P3-18`), canaux de notification (pas de SMS) et textes légaux de confidentialité (voir ci-dessous). Bloque `P1-12`, `P3-18`, `P4-14`, `P4-15`, `P6-16` et, par ricochet, la quasi-totalité de la Phase 6.
- Décision (2026-10-11) : **un utilisateur a un seul profil actif à la fois.** Les types de compte actuels (auto-entrepreneur, PME, PMI) et les 8 publics FINCLUDIA ne se cumulent jamais sur un même compte (pas de double étiquette) ; voir `P3-18`.
- Décision (2026-10-11) : **pas de SMS.** Les notifications restent dans le site (in-app) ; un envoi par e-mail reste possible plus tard, mais dépend du même choix de fournisseur que la newsletter (toujours non choisi, voir ci-dessus).
- Décision (2026-10-11) : la mention « pas de conseil financier réglementé » et les textes de confidentialité propres aux données financières sont **rédigés par l'équipe**, pas par le client. Une demande de suppression de compte entraîne une **suppression complète et immédiate** des données : pas de durée de conservation à définir.
- FINCLUDIA, données encore à fournir par le client : barèmes de paie (`P4-14`), offres de financement et leurs formules (`P4-15`), données CCP (`P4-13`), instruments et prix de référence du portefeuille fictif (`P6-12`), intentions et réponses de l'assistant déterministe (`P3-19`), modèles d'objectifs financiers, **confirmation** du référentiel de catégories (`P6-02` l'a implémenté tel quel depuis l'onglet `03_Categories` ; il reste à confirmer, pas à fournir) et l'échelle du niveau de confiance, que le client n'énumère pas. Le glossaire et les mini-guides (`P2-08`) sont désormais rédigés par l'équipe, pas attendus du client.
- FINCLUDIA, hébergement : l'hébergement mutualisé actuel (cPanel, MariaDB) convient à une démonstration, pas à des données financières réelles sans sauvegardes testées, chiffrement et disponibilité confirmés (voir `P5-04` et point 11 de `P6-01`).

Point de vérification manuelle recommandé pour l'utilisateur : ouvrir `http://localhost:5173` après `npm run dev` dans `client/` et tester le menu mobile sous 860px de large (non vérifié visuellement par Claude faute d'outil navigateur dans cette session).

Objectif final :
Livrer un MVP exploitable de la plateforme dans un délai maximal de **8 semaines**, en respectant l'ordre :
**Frontend principal → E-Learning → Blog/CMS/Newsletter → Outils → Sécurité/Tests/Livraison**.

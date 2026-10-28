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
10. **Reprise de session** (règle du 2026-10-28, après une session interrompue qui avait laissé le client Prisma non régénéré, 8 migrations non appliquées et des statuts incohérents) : commencer chaque session par `npm run reprise` dans `server/`. Le script régénère le client Prisma, applique les migrations en attente sur la base de développement (`migrate deploy`, jamais de réinitialisation), puis liste les tâches en cours, les restes orphelins et les tâches réalisables. `npm run reprise -- --verifier` fait le même constat sans rien changer.
11. **Clore une tâche au fil de l'eau** : statut, note « Réalisé », section 7 et `npm run deliverables` sont mis à jour **dès** qu'une tâche est terminée, pas en fin de session : une session peut s'arrêter à tout moment. Une tâche terminée peut laisser un reste (`- **Reste** :` ou `- **Restent** :`), mais chaque reste nomme la tâche encore ouverte qui le reprend ; le test de cohérence le vérifie.

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
   - **restructuration demandée par le client les 2026-10-26 et 2026-10-27** (Phases 8 et 9) : deux solutions séparées. **Gestion budgétaire** (Phase 8) : un seul moteur budgétaire, le même pour tous, dans une fenêtre distincte de la vitrine, avec un Accueil qui centralise comptes, budgets, objectifs, outils, santé financière, formation, progression et certificats — cahier `FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx`, qui **fait foi pour la gestion personnelle**. **Gestion commune** (Phase 9) : la gestion collective des dépenses et des tâches — cahier `FINCLUDIA_Partage_Gestion_Collective_Depenses_Taches.xlsx`. Les personas sont conservés et réduits à 5 profils éducatifs : ils changent les contenus d'apprentissage, jamais les fonctions financières (`P8-17`)

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
| Phase 7 | Non estimable (alerte de périmètre) | Espace entreprise / ERP, diaspora (cahiers des charges manquants) |
| Phase 8 | Hors des 8 semaines (ajout du 2026-10-26, réécrite le 2026-10-27) | Gestion budgétaire : moteur budgétaire unique, comptes, Accueil centralisé, profils éducatifs, corrections de calcul |
| Phase 9 | Hors des 8 semaines (ajout du 2026-10-27) | Gestion commune : gestion collective des dépenses et des tâches, solution séparée (voir « Impact sur le délai (Phases 8 et 9) ») |

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
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P1-11`
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

**Écart décidé le 2026-10-19 — « Pourquoi ? » ne montre plus la formule.** Demande explicite de l'utilisateur : rendre le déclencheur discret (une icône plutôt qu'un lien texte) et retirer formule/variables/hypothèses/date, remplacées par **une phrase en langage courant propre à chaque métrique**. C'est un **écart assumé** par rapport à l'exigence du client citée ci-dessus (« bouton Pourquoi ? qui affiche formule, variables et hypothèses ») — noté ici plutôt que caché, comme toute décision qui s'écarte du cahier des charges.
- **Comment ça marche** : `FigureCard.jsx` et `SimulatorRunner.jsx` lisent `answer.formule_id` (toujours présent sur une réponse du moteur) et cherchent `fincludia.whyByFormula.<id>` ; repli sur `fincludia.whyGeneric` si l'identifiant n'a pas (encore) sa phrase. **Aucun des 52 emplacements de `<FigureCard>` n'a eu besoin d'être modifié** : la correspondance se fait par formule, pas par appel, donc une seule modification du composant s'applique à tout le produit.
- **81 phrases écrites** (une par formule F001-F057, ALG-01 à ALG-04, E001-E010 du socle entreprise, CR01-CR10 du crédit), traduites fr / en / ar, vérifiées par le test de cohérence des traductions (clés identiques dans les trois langues, aucune vide).
- **La carte « Prochaine action »** (même point du cahier des charges, même bouton « Pourquoi ? ») n'est **pas concernée** : ce n'est pas un calcul mais la règle de priorité d'une suggestion, demande hors du périmètre cité par l'utilisateur. Elle garde son ancien style, sous sa propre classe (`fin-next-action-why`), pour ne pas être affectée par le changement visuel des cartes de chiffres.
- **Tests mis à jour** : deux parcours navigateur (`fin-money-journey.test.js`, `simulators-journey.test.js`) asserts désormais la phrase en langage courant et vérifient explicitement que la référence de formule (`/F0\d\d/`) **n'apparaît plus** à l'écran.
- **Si le client s'y oppose un jour** : remettre `formula`/`answer.formule_id`/`answer.entrees_snapshot`/`answer.hypotheses` dans le panneau est un retour en arrière localisé à ces deux composants, pas une reconstruction — rien d'autre n'a changé.
- **Contredit en partie par le cahier consolidé du 2026-10-27** : il maintient « hypothèses toujours visibles et modifiables » (OBJ-03), « poids visibles » (HEA-01) et « Voir pourquoi » (ACC-17). **Maintenu tel quel par décision de l'utilisateur le 2026-10-27** (`P8-01` point 7) : « Pourquoi ? » garde sa phrase courte, **sans** formule, hypothèses ni pondérations. C'est un écart assumé avec ces trois exigences du cahier consolidé, et il ne doit pas être défait. Seul point à corriger : la phrase étant choisie par identifiant de formule, un chiffre qui porte le mauvais identifiant affiche une explication fausse (diagnostic n°2, C6, corrigé par `P8-04`).

**Réalisé partiellement (2026-10-17/18), sur retour utilisateur :**
- **Sidebar classique refaite entièrement** (`FincludiaNav.jsx`/`.css`) : le bascule (icônes seules ↔ sections complètes) vit **dans la sidebar elle-même**, en haut à droite — jamais dans le composant parent — et l'état repliée reste une **colonne d'icônes**, jamais une disparition totale, comme demandé explicitement. Le panneau de contenu ne reprend plus la largeur totale quand la sidebar change d'état : `FincludiaLayout.css` est passé de `grid` à `flex`, avec la largeur de la sidebar portée par elle-même (`flex-basis`), pour éliminer le bug où le contenu « remplaçait » la sidebar visuellement.
- **La sidebar ne disparaît plus sur certaines routes** : `FincludiaLayout` englobe maintenant à la fois les routes publiques d'outils/apprentissage et les routes du compte authentifié (`router/index.jsx`), donc un compte connecté garde son menu en changeant de page ; un visiteur anonyme ne voit, lui, aucun habillage supplémentaire. C'est ce même changement de structure qui corrige « Mon entreprise » (`/entreprise`, `P7-02`), qui perdait son cadre de navigation.
- **Barre supérieure illisible une fois connecté, corrigée** : la cause réelle était 7 liens marketing + recherche + notifications + assistant + compte + déconnexion en concurrence sur une seule ligne. Pour un compte **authentifié seulement**, les liens marketing passent dans un menu déroulant « Plus » (`Header.jsx`/`.css`) ; un visiteur anonyme garde la navigation complète, dont il a besoin.

**Correction du 2026-10-18, après vérification directe du code :** la note précédente disait le menu par public et la barre supérieure encore à câbler — c'était inexact. `FincludiaNav.jsx` lit déjà `GET /fin/parcours` et n'affiche que les routes que **le serveur** a déjà réduites au public et à l'âge du compte (commentaire du fichier : « WHAT IT SHOWS COMES FROM THE SERVER »), donc le filtrage par public (`P6-17`) est bien relié à cette sidebar. `Header.jsx` rend déjà `<GlobalSearch />` (`P6-20`) et `<NotificationBell />` (`P6-18`) pour tout compte authentifié, plus le bouton assistant (`P3-19`) — les trois sont des composants réels (176 et 39 lignes), pas des réserves. La dépendance à `P6-01` est donc levée : rien dans ce qui reste n'attend plus une décision du client.

**Deuxième correction du 2026-10-18** : le **sélecteur de période** existe déjà (`components/fincludia/PeriodSelector.jsx`), utilisé sur `/mon-argent` — il n'attendait plus rien, il manquait seulement d'être signalé ici. **Reste réellement à faire, non bloquant :** l'étendre aux autres tableaux de bord qui pourraient s'en servir, et la **carte « Prochaine action »**, qui elle attend toujours un écran qui s'en serve.

Important : le nom **FINCLUDIA** est tranché (décision du 2026-10-09, voir `P6-01` point 1 et le renommage documenté sous `P4-09`) ; le logo et la charte restent à fournir.

### P1-13 — Charte graphique officielle (logo, palette, typographies)
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P1-11`, `P1-12`
- Durée cible : 2 jours (estimation)
- Origine : document client « Positionnement officiel aperçu charte graphique.odt », reçu le 2026-10-16

Ce document **lève la réserve « logo et charte restent à fournir »** portée depuis le 2026-10-09 (`P6-01` point 1).

Ce qu'il tranche :
- **Positionnement** : « plateforme d'éducation, d'inclusion et d'intelligence financières qui aide les particuliers, entrepreneurs et entreprises à comprendre, simuler et mieux décider ».
- **Signature** : « La finance, enfin plus claire. » / « Comprendre. Simuler. Décider. Avancer. »
- **Couleurs officielles** : Bleu profond `#055686` (institutionnelle), Sarcelle `#10A9B6` (innovation), Menthe `#4FE5D3` (progression), Encre `#102A43` (texte principal), Blanc `#FFFFFF` (fond), Menthe très pâle `#EFFBFA` (fond secondaire).
- **Dégradé officiel** : bleu profond → sarcelle → menthe, décrit comme « un actif graphique de FINCLUDIA ».
- **Répartition** : 70 % blanc / neutres, 15 % bleu profond, 10 % sarcelle, 5 % menthe.
- **Typographies UI** : **Sora** pour les titres, **Inter** pour le contenu et les données.
- **Direction UX** : white-first, premium, fintech + edtech, très lisible, pédagogique, courbes inspirées du F. **Principe produit** : comprendre → calculer → comparer → décider.
- **Logo** : « F » + mot-symbole FINCLUDIA, **géométrie figée**, fourni en PNG dans le document.

**Écart avec l'existant, mesuré et non supposé :**
- **La palette coïncide déjà.** `client/src/index.css` porte `--accent: #055686`, `--text-h: #102A43`, un accent sombre `#4FE5D3`, et son commentaire nomme déjà « teal #10A9B6 ». Rien à changer sur les couleurs d'accent : c'est le seul endroit où la charte confirme ce qui existe au lieu de le contredire.
- **Les typographies ne correspondent pas.** `P1-11` a posé **Fraunces** (serif) pour les titres et **IBM Plex Sans** pour le texte ; la charte demande **Sora** et **Inter**. C'est le seul écart structurant.
- **Le fond n'est pas « white-first »** : `--bg` vaut `#f4f9fb`, la charte demande `#FFFFFF` avec `#EFFBFA` en fond secondaire.
- **Le logo n'est pas utilisé** : l'en-tête affiche la lettre « L » (`brand-mark`).

Tâches :
- Remplacer les polices, **auto-hébergées via npm** comme les actuelles — pas d'appel à un CDN tiers, donc pas de fuite d'IP visiteur (règle posée en `P1-11`). Garder **IBM Plex Sans Arabic** en repli : ni Sora ni Inter ne couvrent l'arabe, et la plateforme est trilingue.
- Fond blanc, fond secondaire `#EFFBFA`, répartition 70/15/10/5.
- Intégrer le logo (en-tête, favicon, page d'accueil, certificats).
- Reprendre le positionnement et la signature sur la page d'accueil — ce que `P6-01` point 1 laissait ouvert faute de texte officiel. Le texte actuel décrit encore « formations, blog et outils pour auto-entrepreneurs, PME, PMI ».
- Mesurer le contraste de la nouvelle palette : `P1-11` l'avait déclaré non mesuré.

**À demander au client avant de commencer :**
- **Le logo en vectoriel (SVG).** Seul un PNG est fourni ; un logo d'en-tête en PNG est flou sur écran dense, et une « géométrie figée » mérite un format qui ne se dégrade pas.
- **La signature exacte** : le document en donne deux formes — « Comprendre. Simuler. Décider. Avancer. » dans le corps, « Comprendre. Décider. Avancer. » dans le bloc de synthèse. Une signature de marque ne se devine pas.
- **Le mode sombre**, que la charte ne décrit pas du tout. Le projet en a un depuis `P1-09`. Il sera conservé tel quel et déclaré comme tel, plutôt qu'inventé aux couleurs de la charte.
- Les **traductions** du positionnement et de la signature : la charte est en français seul, et la plateforme sert fr / en / ar.

**Réalisé (2026-10-16) :**

- **Typographies remplacées** : Sora pour les titres, Inter pour le contenu, auto-hébergées via npm (`@fontsource-variable/sora`, `@fontsource-variable/inter`) — aucune adresse IP de visiteur ne part vers un CDN tiers, règle posée en `P1-11`. **IBM Plex Sans Arabic reste chargée** et n'est pas un reste : ni Sora ni Inter ne couvrent l'alphabet arabe, et sans ce repli un titre arabe tomberait sur une police système au hasard de la machine. Fraunces et IBM Plex Sans sont désinstallées.
- **Le jeton de police a changé de nom** : `--serif` est devenu `--display` (27 usages). Il portait une serif avant la charte et porte une sans aujourd'hui ; un jeton nommé d'après une classe de police n'aurait pas survécu au changement, un jeton nommé d'après son rôle le traverse.
- **Fond « white-first »** : `--bg` passe de `#f4f9fb` à `#FFFFFF`, `--bg-alt` à `#EFFBFA`. Le mode sombre n'est **pas** touché : la charte ne le décrit pas, et l'inventer à ses couleurs aurait été une décision de marque prise à la place du client.
- **Le dégradé officiel est un jeton**, `--brand-gradient` (bleu profond → sarcelle → menthe) : la charte le désigne comme « un actif graphique », donc il est nommé une fois et non recopié à chaque usage. Il habille la signature de la page d'accueil, avec un repli en couleur pleine — `background-clip: text` n'est pas universel, et un texte invisible vaut moins qu'un texte monochrome.
- **Le logo remplace la lettre « L »** dans l'en-tête, et devient le favicon. Les deux PNG de la charte ont été préparés sans toucher à la géométrie : fond blanc rendu transparent et rognage, pour qu'un logo ne pose pas un carré blanc sur fond sombre. **L'ancien favicon était violet** — un reste du thème abandonné en `P1-11`, qui contredisait la palette depuis.
- **La page d'accueil porte enfin le positionnement du client** : la signature « La finance, enfin plus claire. » en titre, le positionnement officiel en chapeau, traduits en fr / en / ar. Le texte précédent décrivait encore « formations, blog et outils pour auto-entrepreneurs, PME, PMI ».

**Ce que la charte confirme, et c'est notable :** la palette coïncidait **déjà** avec le code. `index.css` portait `#055686`, `#102A43` et `#4FE5D3`, et son commentaire nommait même « teal #10A9B6 ». Aucune couleur d'accent n'a eu à changer.

**Réserves déclarées :**
- **Le logo n'existe qu'en PNG.** Il est utilisé tel quel ; le SVG reste à demander, et une « géométrie figée » mérite un format qui ne se dégrade pas sur écran dense.
- **La signature a deux formes dans le même document** — « Comprendre. Simuler. Décider. Avancer. » dans le corps, « Comprendre. Décider. Avancer. » dans la synthèse. La première est retenue ; le client doit trancher.
- **Le mode sombre, le RTL, les tailles et les espacements ne sont pas décrits** par la charte : ils restent ceux de `P1-11`.
- **Les traductions du positionnement sont de l'équipe**, le document étant en français seul.
- **Le contraste de la nouvelle palette de texte n'a pas été mesuré** avec un outil dédié ; la réserve de `P1-11` reste ouverte.

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
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P2-08`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans LY11, LY12, ET09 ; formule F052)

Tâches :
- **Indice de connaissances financières** (F052) calculé côté serveur à partir des quiz réussis et modules terminés, **séparé** du score de quiz et de tout score financier ; formule et version affichées.
- Module **« Sécurité numérique »** (hameçonnage, mot de passe, carte, code OTP, liens frauduleux, achats en ligne) : un parcours de quiz construit avec l'outil existant (`P3-13`), contenu fourni par le client.
- **Passeport Avenir** (lycéen) et **passeport financier étudiant** : compétences acquises, progression, étapes suivantes, export d'une **attestation pédagogique** (réutilise la génération de certificats, `P2-05`). Mention obligatoire : **le passeport n'est pas un score bancaire et ne mesure pas la solvabilité**.
- Tests : unitaires (indice), fonctionnels (attestation, cloisonnement par utilisateur), navigateur.

**Réalisé (2026-10-14) :**
- **F052 suit exactement le patron déjà posé par F051 (`P6-16`) et F053 (`P6-06`)** : le mécanisme (`weightedIndex`) et sa fiche (`describeFormula('F052')`) existaient déjà dans le moteur, mais rien d'autre n'était construit. L'indice global reste **explicitement bloqué** (`KNOWLEDGE_INDEX_BLOCKED`, `constants/finPasseport.js`) tant que ses pondérations ne sont pas fournies (`P6-01` point 5) ; trois dimensions sont montrées seules : taux de formations terminées, moyenne des quiz réussis, état du module « Sécurité numérique ».
- **Aucune nouvelle table** : le passeport lit uniquement ce que P2-01 à P2-05 écrivent déjà (`Enrollment`, `CourseProgress`, `QuizAttempt`, `Certification`) — `services/finPasseport.service.js` ajoute la seule chose qui manquait, une lecture **cross-formation** des quiz réussis d'une personne (le modèle ne la permettait pas directement, `QuizAttempt` ne portant pas `userId`).
- **« Sécurité numérique » est une formation comme une autre** (`constants/finPasseport.js` → `SECURITY_MODULE_SLUG = 'securite-numerique'`) : aucun contenu n'a été inventé pour ce module ; tant qu'aucune formation de ce slug n'est publiée, la dimension est déclarée indisponible (`SECURITY_MODULE_BLOCKED`), jamais mesurée à zéro.
- **« Étapes suivantes » = les cours obligatoires qui bloquent réellement une formation en cours** — jamais une recommandation inventée. Une formation sans rien à finir n'apparaît simplement pas dans la liste.
- **Export d'attestation : réutilise réellement P2-05, ne le duplique pas.** Il n'existe aucune génération de PDF côté serveur dans tout le projet (même l'attestation de formation s'imprime depuis le navigateur) : plutôt que d'inventer un second type de certificat sans formation associée, le passeport **relie** chaque formation déjà certifiée à son attestation réelle et vérifiable (`/compte/certificats`), et offre en plus un résumé imprimable de sa propre progression (sans numéro, jamais présenté comme un document vérifiable).
- **« Avenir » / « étudiant » changent le titre, jamais le mécanisme** : `passeportTitleKey(finPublic)` choisit un intitulé (`LYC` → Avenir, `ETU` → étudiant, sinon générique) sur les mêmes données — aucun blocage d'accès par public, puisque rien dans les règles du client n'en demande un ici (à la différence de la majorité, `P3-18`).
- **Mention obligatoire du client présente dans l'interface** : « le passeport n'est pas un score bancaire et ne mesure pas la solvabilité » (`passport.disclaimer`, fr/en/ar).
- **Interface** : page `/passeport` (trois cartes de repères, formations terminées avec lien vers l'attestation réelle, étapes suivantes, quiz réussis, impression) ; fr / en / ar.

**Tests :** 14 de sécurité (`tests/security/finPasseport.test.js`) : session requise, isolation entre comptes, chaque figure absente plutôt qu'à zéro pour un apprenant sans historique, l'indice global jamais un nombre, une formation certifiée distinguée d'une formation terminée sans certificat, étapes suivantes limitées à ce qui bloque réellement, quiz réussis cross-formation avec moyenne correcte, un essai échoué jamais compté, le module « Sécurité numérique » à ses quatre états (absent, brouillon, publié non commencé, terminé), le titre du passeport selon le public.

**Limites et réserves déclarées :**
- **L'indice global (F052) reste bloqué** jusqu'aux pondérations du client (`P6-01` point 5) — déclaré sur l'écran lui-même.
- **« Sécurité numérique » n'a aucun contenu publié** : la formation et ses quiz restent à écrire par le client, comme prévu.
- **Pas de test unitaire/fonctionnel dédié supplémentaire ni de parcours navigateur**, au-delà de ce qui est listé ci-dessus.

### P2-10 — FINCLUDIA : défis et missions pédagogiques (lycéen)
- Statut : `❌ todo`
- Priorité : `🟡 medium` — abandonnée le 2026-10-11, **reprise le 2026-10-27** (voir la note ci-dessous)
- Dépendances : `P2-09`, `P6-12`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écran LY03)

> **Reprise décidée le 2026-10-27** (`P8-01` point 5). Le cahier consolidé, qui prime, prévoit des missions dans la couche éducative (« missions courtes, quiz » pour le lycéen, onglets 02 et 22 ; « compétences, jalons et missions », FOR-02). L'abandon du 2026-10-11 est levé ; la tâche est réalisée dans le cadre de `P8-17`.

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

**Remis en question le 2026-10-26 (retour du client, Phase 8).** Les 8 publics mélangent deux axes — étapes de vie (LYC, ETU, JAC, SAL, EPG) et façons de vivre à plusieurs (COL, COU, FAM) — et le profil principal unique oblige un salarié en colocation à choisir. Les rôles complémentaires sont stockés mais ne changent ni le menu ni le tableau de bord. Les personas sont **conservés et repensés** (consigne de l'utilisateur). **Tranché par le client le 2026-10-27** (cahier consolidé, ARC-02, onglet 02) : cinq profils éducatifs (Lycéen, Étudiant, Jeune actif, Salarié, Épargnant), qui ne changent que les contenus d'apprentissage, missions et certificats — jamais une fonction financière ; COL, COU et FAM quittent le profil personnel pour Gestion commune. Mise en œuvre : `P8-17` (profils), `P8-02` (navigation identique pour tous). Ce qui est livré ici (consentements versionnés, tranche d'âge, changement de parcours proposé et jamais forcé) reste valable tel quel.

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

**Mise à jour du 2026-10-17** : le client a fourni 25 intentions complètes (déclencheurs, questions, réponses, garde-fous — voir `P6-01` point 10 et `P6-22`), contre les 8 intentions brouillon actuellement en base. Intégration restant à faire dans `P6-22`.

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
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P4-01`, `P6-22`
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

~~Blocage (2026-10-11)~~ — **levé le 2026-10-17.** Le référentiel maître fournit les formules `CR01`-`CR10`, les règles-cadres et 25 fiches produits de 18 banques (`03_Offres_Credit`, `04_Credit_Regles`).

**Réalisé (2026-10-17) :**

**Deux moitiés, tenues séparées.** Les **mathématiques** sont ordinaires et se calculent toujours : mensualité, capacité, coût total, taux d'effort. Les **critères d'une banque** ne se calculent pas, ils se lisent — et aucune des 25 offres n'est publiable.

- **Le plafond légal est un verrou, pas un avertissement** : article 16 du décret exécutif 15-114, le crédit à la consommation ne peut dépasser 30 % des revenus nets réguliers. Un dépassement **bloque** la simulation.
- **Et il n'est jamais généralisé à l'immobilier.** Le client l'écrit en tête de son onglet ; l'appliquer partout refuserait des dossiers que la loi n'interdit pas, et plusieurs offres immobilières du référentiel annoncent 40 % ou 50 % selon le revenu. Deux tests encadrent la frontière : le même dossier bloque en consommation et passe en immobilier.
- **Le cas « taux zéro » est traité** : ce n'est pas une curiosité mathématique — un prêt à taux zéro existe, certaines formules islamiques n'affichent aucune marge, et la formule générale y diviserait par zéro.
- **Les cinq messages du client sont repris mot pour mot.** Ce sont des phrases juridiques autant que commerciales ; les reformuler changerait ce que le produit affirme. Dont celle qui résume tout : « L'établissement prêteur reste décisionnaire. »
- L'outil passe de `planned` à `available` dans le registre, après être resté annoncé-non-construit depuis le début du projet.

**Défaut introduit puis attrapé :** le script de génération marquait une offre publiable « sauf si son statut mentionne un audit ». `ODT-CR-015` a une case de statut **vide** et sortait publiable — alors que son statut déclaré dit « Conflit officiel – bloquer production tant que banque non confirmée ». **Une absence lue comme une autorisation**, exactement ce que le client interdit ailleurs. La règle est inversée : publiable seulement si le client l'autorise explicitement. Aucune des 25 ne passe.

**Tests :** 26 unitaires (`tests/unit/finCredit.test.js`).

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

**Corrigé sur retour utilisateur (2026-10-17) :** l'atelier était « mal conçu » pour deux raisons concrètes. Ouvrir un simulateur depuis la grille de cartes ne menait nulle part visuellement (son formulaire apparaissait plus bas, sans défilement ni autre signe) — corrigé par un défilement automatique vers le formulaire ouvert. Comparer deux scénarios qui échouait (409) affichait le texte anglais brut du serveur — corrigé en ajoutant des codes `reason` structurés côté serveur (`unplayable`, `nothingInCommon`, `currency`) que le client traduit désormais en fr/en/ar au lieu de deviner depuis le texte.

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
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P4-08`, `P4-12`, `P3-18`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans ET06, C20 ; moteur « Offer Search »)

Prolonge le comparateur existant (`P4-06` à `P4-08`) sans toucher à ses données client :
- **Comparateur banque / CCP étudiant** (ET06) : l'utilisateur décrit son usage (carte, paiement en ligne, retraits, virements, budget de frais) et voit l'**adéquation** = Σ(correspondance critère × poids utilisateur) / Σ poids, critère par critère ; **aucun « meilleur » absolu**. Le CCP n'est pas dans le classeur actuel : à ajouter seulement si le client fournit ses données.
- **Explorer** (C20) : recherche de solutions par besoin (voiture, logement, épargne…), montant, horizon, type, établissement ; chaque résultat porte **source, date et fraîcheur** ; « compatibilité apparente selon critères publics » seulement si toutes les règles sont explicites, **jamais d'affirmation d'éligibilité** ; réservé aux 18 ans et plus selon les règles de `P3-18`.
- Sauvegarde d'offres et comparaison (via `P4-12`).
- Référentiel d'offres (« Offer Graph » : offres, fournisseurs, sources datées) : seulement les données fournies par le client, comme aujourd'hui.

**Réalisé (2026-10-14) :**
- **« Adéquation à l'usage » réutilise le moteur générique P4-12** (`compareOptions`, F054) plutôt que d'en inventer un second : quatre critères ajoutés au vocabulaire fixe de `constants/comparison.js` (`accountFee`, `cardFee`, `transferFee`, `atmFee`, tous `money`/`lower`), exactement comme `commuteMinutes` l'avait été pour les offres d'emploi. Les options comparées sont 2 ou 3 comptes **déjà publics** du comparateur (`P4-06`), choisis par la personne ; leurs frais de carte et de virement viennent du même établissement **seulement quand une seule ligne existe** pour cette rubrique chez cette banque — plusieurs lignes (plusieurs types de carte) restent une ambiguïté non tranchée, pas une valeur inventée (`services/bankUsage.service.js`).
- **« Paiement en ligne » n'a jamais de colonne dans les classeurs du client**, pour aucune banque : plutôt que de deviner une valeur, ce critère n'existe simplement pas dans la liste comparée — dit dans l'interface (`bankUsage.noOnlinePayment`), vérifié par un test.
- **« Explorer » est une recherche littérale** sur les mêmes lignes publiques du comparateur (`services/explorer.service.js`) : aucune interprétation générative, aucun classement, aucune affirmation d'éligibilité. Le besoin (voiture, logement, épargne…) n'a pas de colonne dédiée dans les classeurs du client : il se tape dans la recherche comme un mot parmi d'autres plutôt que d'être deviné par une liste de besoins inventée ici. Sans filtre réel (requête de moins de 2 caractères, aucune rubrique), la réponse est vide — jamais un listage complet déguisé en recherche (même principe que `P6-20`).
- **Explorer est réservé aux 18 ans et plus, effectivement** : premier usage réel de `requireAdult` (middleware/auth.js), posé par `P3-18` mais jamais câblé avant cette tâche. Nouveau tool `explorateur-financier` (`access: 'authenticated'`), avec `requireAdult` ajouté en plus sur la route — une personne dont la tranche d'âge n'est pas encore déclarée est refusée comme un mineur, jamais comme un adulte par défaut.
- **Fraîcheur honnête, pas inventée par ligne** : le modèle de données du comparateur n'a qu'une seule date, globale (`ComparatorMeta.dataUpdatedAt`) — Explorer la renvoie telle quelle plutôt que d'inventer une date par offre.
- **Interface** : lien « Adéquation à mon usage » depuis le comparateur (public, `/outils/comparateur/adequation`) ; écran « Explorer » dans le catalogue d'outils, réservé aux 18 ans et plus (`/outils/explorateur`) ; fr / en / ar.

**Tests :** 6 fonctionnels (`tests/functional/comparator.test.js`, nouveau bloc « usage fit ») : quatre critères sans score par défaut, le score n'apparaît qu'avec des poids et porte sa formule (F054), le chiffre rejoint exactement le coût annuel déjà affiché par le comparateur, un identifiant qui n'est pas un compte ou qui est inconnu est refusé, la borne 2 à 3 est respectée, « paiement en ligne » n'apparaît jamais. 10 de sécurité (`tests/security/explorer.test.js`) : session requise, mineur refusé, âge non déclaré traité comme un mineur (refus par défaut), adulte accepté, aucun filtre réel → résultat vide, correspondance littérale, rubrique inconnue refusée, jamais de classement (`best`/`scores` absents de la réponse), fraîcheur réelle renvoyée.

**Corrigé sur retour utilisateur (2026-10-17) :** l'état vide d'Explorer ne montrait qu'une phrase « tapez pour chercher », sans aucun exemple — une page de recherche sans suggestion ne dit pas à quoi ressemble une requête valable. Ajout de 4 exemples cliquables (« carte internationale », « virement », « épargne », « retrait ») qui lancent directement la recherche.

**Limites et réserves déclarées :**
- **CCP étudiant** : non ajouté, comme prévu — aucune donnée CCP dans le classeur actuel.
- **Explorer ne filtre pas par montant ni par horizon** : ces deux notions n'ont pas de colonne exploitable dans les classeurs du client (les crédits et l'épargne, par exemple, n'ont ni montant ni durée structurés) ; elles se cherchent comme un mot du texte libre plutôt que d'être un filtre numérique inventé.
- **Pas de test unitaire/fonctionnel dédié supplémentaire, de scénario de cohérence globale ni de parcours navigateur** au-delà de ce qui est listé ci-dessus.

### P4-14 — FINCLUDIA : décodeur de fiche de paie
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P4-09`, `P6-22`
- Durée cible : 2 jours (estimation, une fois les règles reçues)

**Dépendance à `P6-01` retirée le 2026-10-17**, pour la même raison que `P6-22` : cette tâche collecte des réponses du client, et celles dont le décodeur avait besoin — SNMG, barème IRG, cotisations datées et sourcées — sont arrivées. La garder bloquerait une tâche livrée sur une tâche dont le rôle est d'attendre.
- Origine : direction FINCLUDIA du 2026-10-09 (écran C15)

- Saisie manuelle (ou assistée) des lignes d'une fiche : brut, cotisations, IRG, primes, retenues, net, période ; décomposition expliquée ligne par ligne ; lignes inconnues « à confirmer » ; ajout au revenu mensuel **après confirmation** de l'utilisateur.
- Net = brut + éléments positifs − retenues **seulement selon la structure saisie** ; **aucune déduction légale inventée**, ne prétend jamais certifier la fiche.
- Import d'un document et extraction automatique : phase ultérieure (le client le note lui-même).

**Déblocage du 2026-10-17** : SNMG, barème IRG et cotisations (employeur/salarié, par branche, datés et sourcés) reçus — voir `P6-01` point 6 et `P6-22`.

**Réalisé (2026-10-17) :**

**La ligne de partage de toute la tâche :** le client écrit en tête de son propre onglet que sa grille « ne fait pas un moteur de paie complet ». Et la tâche demande un **décodeur** — la personne saisit les lignes de sa fiche, le produit les explique. Recalculer un IRG sur un barème dont la date d'effet n'est pas confirmée, puis l'afficher à côté du chiffre de l'employeur, ferait croire à une erreur de paie là où il n'y a qu'une incertitude de notre côté.

- `net = brut − retenues`, **uniquement d'après la structure saisie**. Une fiche sans cotisation donne un net égal au brut : le décodeur lit, il ne complète pas.
- **Le sens vient du type de ligne, jamais du signe** : quelqu'un qui saisit « IRG 4 500 » ne doit pas voir son net augmenter.
- Sur trois régimes IRG mensuels, **deux sont déclarés non calculables avec leur raison**. Seule l'exonération sous 30 000 DA est appliquée, parce qu'elle est sans ambiguïté.
- **Quatre contrôles, tous formulés comme des points à vérifier** : cohérence avec le net inscrit, écart aux 9 % salariaux (avec tolérance d'un dinar, les arrondis d'un logiciel de paie n'étant pas les nôtres), brut sous le SNMG (avec l'explication possible du temps partiel), IRG retenu sous le seuil d'exonération. Le message sur la cotisation précise que **l'assiette n'est pas toujours le brut total**, parce que c'est vrai et que l'omettre inquiéterait pour rien.
- **La fiche n'est pas conservée** : c'est une donnée sensible, et le client ne demande pas de la garder. L'ajout au revenu mensuel passe par `P6-04`, après confirmation explicite.

**Tests :** 20 unitaires (`tests/unit/finPayroll.test.js`), dont la vérification que la part salariale est bien la somme de ses branches (1,5 + 6,75 + 0,5 + 0,25 = 9 %) et que le barème IRG est continu et croissant — une borne mal transcrite laisserait un trou invisible à la lecture.

### P4-15 — FINCLUDIA : comparer un financement (conventionnel / islamique)
- Statut : `✅ done`
- Priorité : `🟢 low`
- Dépendances : `P4-12`, `P4-11`, `P6-22`
- Durée cible : 2 jours (estimation, une fois les données reçues)

**Dépendance à `P6-01` retirée le 2026-10-17** : les offres de financement que cette tâche attendait sont dans le référentiel maître (25 fiches, onglet `03_Offres_Credit`).
- Origine : direction FINCLUDIA du 2026-10-09 (écran JA09)

- Besoin, montant, durée, apport, préférence **conventionnelle ou islamique**, revenu, garanties → mensualité / coût, apport, frais, conditions, impact sur la trésorerie, source et date.
- Taux d'intérêt et parts de bénéfices **jamais assimilés** (même règle que le comparateur, `P4-06`) ; pas de classement opaque ; pas d'éligibilité garantie.

**Réalisé (2026-10-17) :** 4 offres islamiques et 21 conventionnelles, rendues **séparément**, jamais dans une même colonne triée — une marge bénéficiaire et un taux d'intérêt ne se comparent pas terme à terme, et les aligner pour les classer revient à les assimiler. La raison est **dite** dans la réponse, pas sous-entendue.

Les critères sortent **en texte**, tels que le client les a écrits (« 8,00 % épargnant / 8,25 % non-épargnant », « Jusqu'à 40 ans », « Non publié »). Les convertir en seuils comparables obligerait à choisir lequel des deux taux retenir : une décision commerciale déguisée en conversion.

Et la comparaison annonce elle-même **combien d'offres sont réellement publiables** : zéro sur vingt-cinq, tant que les brochures officielles n'ont pas été contrôlées.

**Déblocage du 2026-10-17** : 25 fiches produits réelles et leurs formules de calcul reçues — voir `P6-01` point 6 et `P6-22`. Plus `⛔ blocked` ; reste à implémenter **en respectant le garde-fou du client** : la quasi-totalité de ces 25 fiches est marquée « audit primaire requis » dans sa propre source (statut déclaré, pas une vérification indépendante) et un produit (`ODT-CR-015`, Al Salam Bank « Tayssir véhicule ») est explicitement signalé en conflit — à bloquer en production tant que la banque n'a pas confirmé.

### P4-17 — Référentiel Algérie Poste / CCP (comparateur et pédagogie)
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P4-06`, `P4-13`
- Durée cible : 3 jours (estimation)
- Origine : classeur client `FINCLUDIA_ALGERIE_POSTE_CCP_REFERENTIEL_COMPARATEUR.xlsx`, reçu le 2026-10-16

Ce classeur **lève le blocage « données CCP »** (`P6-01` point 6) et la réserve de `P4-13` / écran ET06 : « le CCP n'est pas dans le classeur actuel : à ajouter seulement si le client fournit ses données ». 16 onglets, **75 lignes uniques**, et un schéma d'import déjà normalisé.

Ce qui est directement exploitable :
- `01_Referentiel_Unique` : 75 fiches `AP-001`…`AP-075`, avec la nature de l'information **explicitement typée** — `TARIF` (46), `PLAFOND` (4), `DÉLAI` (7), `PROCÉDURE`, `INFORMATION`, `DÉFINITION`. La consigne du client est écrite en toutes lettres : **tarif ≠ plafond ≠ délai ≠ procédure**.
- `12_Import_FINCLUDIA` : un export à **32 colonnes** prêt au mapping, et `14_Dictionnaire_API` qui donne pour chaque champ son type, un exemple et son contrôle d'intégrité.
- `10_Matrice_FINCLUDIA` : la couverture rubrique par rubrique, les familles **« Non documenté »** isolées, et une précaution d'intégration par rubrique.
- `11_Controle_Validation` : **16 contrôles à faire avant publication** (`P01`…`P16`), chacun avec la preuve attendue et l'impact produit.
- `13_Couts_Annualises` (équivalents annuels quand prix fixe et périodicité sont explicites) et `15_Sources_Provenance`.

**Ce qui n'est pas fourni — et c'est le classeur lui-même qui le dit :**
- **Aucune ligne n'est publiable.** `publishable = FALSE` et `auto_compute = FALSE` sur **toutes** les lignes, `verification_status = UNVERIFIED_USER_SUPPLIED`, `source_proof_url` et `valid_from` **volontairement vides**. La source est un texte transmis, pas une brochure officielle datée.
- **Trois calculs sont explicitement bloqués** : le barème progressif PIN PAD (`P03` — base, arrondi des fractions de 1 000 et plafond inconnus), les tranches de virement BaridiMob « 12 à 24 DA » (`P05`), et la commission TPE « jusqu'à 1,50 % », qui est un **plafond, pas un taux appliqué** (`P07`).
- **`P16`** : « Ne jamais importer une offre à partir d'une absence de données » — crédit, carte internationale, change / devises et coffre-fort restent **bloqués**, et l'absence de donnée ne vaut pas absence de produit.

Tâches :
- Modèle et **import reproductible par script** depuis `12_Import_FINCLUDIA`, comme les 91 catégories de `P6-02` et les 78 écrans de `P6-17` : extrait, jamais retapé.
- **Faire respecter `publishable` et `auto_compute` par le code**, pas seulement par la documentation : une ligne non publiable ne s'affiche pas comme un tarif public, une ligne sans calcul possible ne nourrit aucun simulateur. C'est la même règle que « non calculé ≠ 0 », appliquée à la provenance.
- **Le piège du double comptage** : l'abonnement TPE à 800 DA HT et ses trois composantes (300 + 300 + 200) sont la **même** dépense ; le champ `parent_fee_id` existe pour ça et doit être honoré.
- **Séparer le comparateur postal du comparateur bancaire** (consigne de `10_Matrice_FINCLUDIA` : « ne pas transformer une boîte postale en coffre bancaire », « comparateur postal séparé du comparateur bancaire »).
- Alimenter **ET06** (comparateur banque / CCP étudiant) et `P4-13` avec ce que le classeur documente réellement, et seulement cela.
- Rendre les **16 contrôles visibles** (centre de confiance `P6-19` ou administration) plutôt que de les laisser dans un fichier que personne ne rouvre : ce sont les questions à poser à Algérie Poste.
- Les fiches `DÉFINITION` (RIP, NIP) sont du **contenu pédagogique** : elles relèvent d'`Apprendre` (`P2-08`), pas du comparateur.

Réserve : tant que le client n'a pas obtenu la grille tarifaire officielle datée (`P01`), ce lot livre **un référentiel interne et une pédagogie**, pas un comparateur public de tarifs Algérie Poste.

**Réalisé (2026-10-16) :**

- **Généré par script**, `server/scripts/generate-postal.py` → `src/constants/finPostal.js` : 75 fiches, 16 contrôles, 15 rubriques de couverture, 4 lignes de barème PIN PAD. Même méthode que les 91 catégories de `P6-02` et les 78 écrans de `P6-17` — extrait, jamais retapé, parce qu'une ligne que personne n'a tapée est une ligne que personne n'a pu déformer. Ici ce sont des tarifs.
- **La règle « aucune ligne publiable » est tenue par le CODE, pas par la documentation.** `publicView()` retire tout montant, tout taux et tout plafond d'une fiche non publiable, et pose `tarifStatut: 'non_publie'` avec la raison. « Non publié » et « gratuit » ne doivent jamais se ressembler — c'est la même règle que « non calculé ≠ 0 », appliquée à la provenance.
- **API publique** sous `/api/tools/postal` : résumé, catalogue filtrable, fiche, barème PIN PAD, les 16 contrôles, et un coût annuel qui répond `null` **ligne par ligne avec sa raison**. Libre d'accès comme le comparateur bancaire, et déclarée telle dans l'audit d'autorisation.
- **Le piège du double comptage est codé** : l'abonnement TPE à 800 DA HT et ses composantes (300 + 300 + 200) sont la même dépense ; `parent_fee_id` les écarte du total dès que le parent est dans la sélection. Sans cela un commerçant verrait 1 600 DA par mois au lieu de 800.
- **Page publique** `/outils/postal` : le catalogue, les familles non documentées, les trois calculs bloqués et les 16 contrôles — publiés plutôt que rangés dans un fichier, parce que ce sont les questions à poser à Algérie Poste et qu'une liste que personne ne rouvre n'en fait avancer aucune.
- **Tests** : 26 unitaires, 15 fonctionnels. Le plus important balaie **toute** la réponse de l'API à la recherche d'un montant, champ par champ, au lieu de vérifier une liste de champs écrite d'avance : un champ ajouté plus tard ne serait pas couvert par une telle liste.

**Défaut trouvé dans mes propres tests :** trois tests fonctionnels passaient pour la mauvaise raison. Ils envoyaient le corps avec `body:` au lieu de `json:`, donc Express ne lisait rien et la route répondait 400 — ce qu'ils attendaient. Deux tests voisins, qui attendaient 200, l'ont révélé. **Un test qui attend une erreur doit être regardé deux fois : il passe aussi quand la requête n'arrive jamais.**

**Et une attente à moi qui était fausse :** le classeur range `AP-017` (Western Union reçu) sous la rubrique « Change / comptes en devises », pourtant marquée non documentée. Mon test exigeait zéro référence ; le client cite cette fiche comme **contre-exemple**, pour prévenir qu'un transfert reçu n'est pas une opération de change. Le test vérifie maintenant ce qui compte — aucune **fiche** ne se range dans une famille non documentée — et la mise en garde du client est préservée.

### P4-05 — Validation de fin de phase
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P4-02`, `P4-03`, `P4-07`, `P4-08`
- Durée cible : 1 jour

Critères :
- Deux outils minimum sont utilisables.
- Les entrées sont validées côté serveur.
- Les résultats du simulateur sont cohérents avec les règles fournies.
- Les factures PDF et Excel sont générées correctement.
- Les outils respectent les règles d'accès utilisateur.

**Validation effectuée le 2026-10-17 — Phase 4 validée.** Les cinq critères sont vérifiés **mécaniquement** par `tests/functional/p4-05-validation.test.js` (14 tests), et non cochés à la relecture : un critère coché à la main se décoche tout seul à la modification suivante.

- **Critère 1** — neuf outils disponibles, et surtout : **aucun outil annoncé disponible n'est en réalité absent**. C'est le piège d'un catalogue, et `simulateur-credit` y figurait comme `planned` depuis le début du projet. Il est passé `available` le jour où il a existé.
- **Critère 2** — balayage de **toutes** les routes POST des outils : aucune n'accepte un corps vide. Une route ajoutée demain sans validation serait signalée par ce test et par aucun autre. Plus : champ inconnu refusé, montant décimal refusé plutôt qu'arrondi.
- **Critère 3** — la mensualité suit la formule `CR02` du client au dinar près, le plafond légal de la consommation **bloque** en citant l'article 16 du décret 15-114, et il n'est pas appliqué à l'immobilier. Aucun taux de banque n'est servi : les 25 offres restent non publiées.
- **Critère 4** — facture calculée et fichier Excel produit.
- **Critère 5** — les deux sens de l'accès : un outil public reste ouvert, un outil authentifié reste fermé, « Explorer » reste réservé aux majeurs (19 ans depuis `P6-22`), et **aucun outil n'écrit en base**.

**Deux défauts, tous deux dans le test et non dans le produit.** Il connaissait les chemins de mémoire et les avait devinés en anglais (`/comparisons`, `/explorer`, `/invoice`) alors qu'ils sont en français : il signalait trois outils absents qui existaient tous. Il lit maintenant les montages dans le fichier de routes. Et il envoyait une facture sans numéro, sans date, sans vendeur ni acheteur — le serveur avait raison de la refuser.

---

# PHASE 5 — SÉCURITÉ + DISPONIBILITÉ + TESTS + LIVRAISON
## Durée : 1 semaine
## Objectif

Durcir la plateforme et préparer une livraison exploitable.

### P5-01 — Audit d'authentification et autorisation
- Statut : `✅ done`
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

**Réalisé le 2026-10-18, sur preuve déjà existante plutôt que sur une relecture manuelle** — même principe que `P4-05` : un audit coché à l'œil se décoche à la modification suivante, celui-ci est mécanique.
- **`tests/security/authorization.test.js`** balaie **toutes** les routes Express déclarées : toute route non listée publique répond 401 à un appel anonyme, toute route d'administration répond 403 à un compte standard, et le préfixe admin n'est joignable par aucune autre orthographe — exactement les points « RBAC », « accès admin » et « contrôle serveur systématique ».
- **IDOR et cloisonnement par propriétaire** : vérifiés module par module plutôt qu'une fois pour toutes, parce que la vérification vit dans chaque service (`ownAsset`, `ownDebt`, etc.) — 38 fichiers `tests/security/*.test.js`, 364 cas, dont 24 dédiés aux espaces partagés (`finSpace.test.js`, matrice Owner/Admin/Member/Viewer, « totaux seuls » qui n'envoie pas les lignes).
- **Accès refusé = écran neutre (404, jamais 403)** sur toute ressource d'un autre compte — règle tenue systématiquement depuis `P6-02` et vérifiée à chaque module financier.
- **Contrôle d'âge serveur** (`requireAdult`) : testé dans le sens du refus et du **sur-refus** (`P6-17`, `P7-02`) — une garde posée sans son chemin refuserait tout, pas seulement ce qu'elle doit refuser.
- **Réauthentification pour les actions sensibles** (export, suppression de compte, retrait de consentement) : couverte par `tests/security/finTrust.test.js` (`P6-19`).
- **Accès aux formations / contenus premium / médias** : couvert depuis `P3-06`/`P3-16` (voir `P5-05`), inchangé depuis.

### P5-02 — Sécurité API et backend
- Statut : `✅ done`
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

**Réalisé le 2026-10-18, vérifié dans le code plutôt que décrété :**
- **Validation stricte** : chaque route body passe par un schéma `zod` (`validateBody`/`validateQuery`), jamais une vérification manuelle éparpillée — c'est la même discipline qui a permis à `P4-05` de refuser systématiquement un corps vide ou un champ inconnu.
- **Injections** : Prisma paramètre toutes les requêtes (aucun SQL concaténé dans `src/`) ; la seule famille de risque réelle de ce projet, l'injection de formule dans un export CSV/Excel (`=…`), est neutralisée à l'écriture (`P6-12`, `P6-04` et les autres exports).
- **Rate limiting** : 10 limiteurs dédiés (`src/middleware/rateLimit.js`) — authentification, formulaire de contact, newsletter, liens de confirmation, quiz, médias protégés (volume ET tentatives refusées, par compte), lecture publique, notifications et commandes de paiement. Chacun documente le risque qu'il couvre plutôt que d'être une valeur copiée.
- **CORS et en-têtes de sécurité** : `helmet()` et `cors({ origin: env.corsOrigin })` posés en tête de `app.js`, avant tout autre middleware.
- **Erreurs** : `errorHandler` renvoie un message générique et masque la pile d'appel en production (`env.isProduction`), le détail complet seulement en développement.
- **Secrets** : uniquement via variables d'environnement (`.env`, jamais côté navigateur) — règle déjà notée tenue par `P5-07`/article 13 du contrat.
- **Endpoints sensibles et paiement** : revue déjà faite par les tests de sécurité de `P3-09`/`P3-10` (signature de notification, rejeu, doublons) et de `P3-07` (assistant public, aucune fuite inter-compte).

### P5-03 — Sécurité des fichiers et contenus
- Statut : `✅ done`
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

**Réalisé le 2026-10-18, vérifié dans `src/services/storage.service.js` et `src/middleware/upload.js` :**
- **Le type réel est reniflé dans le contenu du fichier** (`fileTypeFromFile`), jamais déduit du nom ou de l'en-tête envoyés par le navigateur — un `.pdf.exe` renommé ne trompe pas la validation.
- **Nom de stockage aléatoire**, extension prise du type **reniflé** et non du nom d'origine ; le fichier est renommé au moment où il quitte le dossier temporaire.
- **Stockage privé** (`PRIVATE_DIR`, hors du dossier servi statiquement) ; les médias ne sont accessibles que par une route authentifiée qui vérifie le droit avant de les servir, jamais par un chemin public direct.
- **Taille plafonnée** par type (image / document / vidéo) en plus du plafond global de `multer`.
- **Rate limiting dédié** sur les médias protégés (`mediaVolumeLimiter`, `mediaDenedLimiter` — volume et tentatives refusées, par compte).
- **Antivirus et watermarking** : non faits, comme la tâche le permet elle-même (« si disponible et nécessaire », « éventuel, si validé par le client ») — aucune des deux conditions n'est posée aujourd'hui.

### P5-04 — Disponibilité et sauvegardes
- Statut : `🚧 in-progress`
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

**État réel au 2026-10-18, pour ne pas laisser croire que c'est fait :**
- **Fait** : `/api/health` (vérifie la connexion base, utilisé pendant la mise en ligne du 2026-10-17), logs (`morgan`), secrets séparés de la configuration (`.env`, jamais commité), restart géré par Passenger côté cPanel (relance automatique du process).
- **Fait une fois, manuellement, pas encore systématisé** : une sauvegarde complète de la base de développement (`mariadb-dump`) a servi à repeupler la base de production le 2026-10-17 — ce n'était pas une sauvegarde programmée, et sa restauration n'a jamais été testée à vide (sans la base de départ).
- **Pas fait** : sauvegardes programmées et vérifiées par restauration réelle, sauvegarde des médias uploadés, monitoring au-delà du health check, HTTPS vérifié sur l'hébergement réel choisi. Dépend en partie de `P6-01` point 11 (le client doit encore arbitrer l'hébergement définitif pour des données réelles).

**Réalisé le 2026-10-18 — sauvegardes et vérification de restauration, codées et testées réellement :**
- **`scripts/backup-database.js`** (`npm run backup`) : dump de la base avec `mariadb-dump` (repli sur `mysqldump` si absent — détecté, jamais supposé), **streamé directement vers gzip sans être chargé en mémoire** (le dump grossit avec la base, pas avec la machine qui sauvegarde). Le mot de passe passe par la variable d'environnement `MYSQL_PWD`, jamais sur la ligne de commande, où `ps` le verrait. Archive aussi les médias uploadés (`storage/private`) en `.tar.gz` le même run — une sauvegarde de base sans les fichiers qu'elle référence n'en est qu'une moitié. **Rotation automatique** : garde les `BACKUP_KEEP` (défaut 14) dernières exécutions, supprime le reste.
- **`scripts/verify-backup.js`** (`npm run backup:verify`) : restaure la **dernière** sauvegarde dans une base jetable (jamais la vraie), compte les tables obtenues, les compare au nombre de `@@map(...)` de `schema.prisma` (+1 pour `_prisma_migrations`), puis supprime la base jetable dans tous les cas. Une sauvegarde qu'on n'a jamais restaurée n'est qu'un fichier, pas une sauvegarde.
- **Les deux scripts ont été exécutés pour de vrai** contre la base de développement (pas seulement relus) : dump réel, archive média réelle, restauration réelle avec comparaison de tables réussie (75 = 75, `_prisma_migrations` compris). Deux défauts trouvés en les faisant tourner : sous Windows, `spawn` sans `shell` ne trouve pas un `.cmd`/`.bat` sur le PATH (corrigé, conditionnel à la plateforme — sans effet sur la cible Linux de production) ; et le script de vérification comparait d'abord 75 tables restaurées à 74 attendues avant de compter `_prisma_migrations`, qui n'a pas de modèle Prisma mais existe bien dans tout dump réel.
- **`/backups` ajouté au `.gitignore`** du serveur : contient des données réelles, jamais versionné, comme `/storage`.
- **Toujours pas fait, et ça dépend du client** : où ces sauvegardes sont finalement conservées (un autre disque, un autre hébergeur) est une décision d'infrastructure qui attend `P6-01` point 11 ; le monitoring au-delà du health check et la vérification HTTPS attendent le même arbitrage.

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

### P5-07 — Livrables contractuels, réversibilité et matrice de recette
- Statut : `🚧 in-progress`
- Priorité : `🔴 high`
- Dépendances : `P5-06`
- Durée cible : 2 jours (estimation)
- Origine : « FINCLUDIA contrat.docx », reçu le 2026-10-16 (contrat de prestation daté du 14/09/2026)

Le contrat ajoute des **livrables** que ce plan ne prévoyait nulle part. Ils ne sont pas du développement, mais ils conditionnent la livraison finale et le dernier quart du paiement.

Livrables exigés, article par article :
- **Article 14 — inventaire des composants tiers.** Liste des bibliothèques, frameworks, plugins et API intégrés, **avec leurs licences**, et les obligations significatives signalées. Générable depuis `package.json` des deux paquets, donc à générer plutôt qu'à écrire à la main.
- **Article 3 — dossiers d'études des tests et des formules**, **dossier d'exécution**, **catalogue de données** et **mini-formation de prise en main**. Les deux premiers existent en grande partie : la suite de tests et `NOTES_TECHNIQUES.md` les documentent ; ce qui manque est leur mise en forme en documents remis.
- **Article 17 — réversibilité.** Code source, documentation, bases et scripts, configurations non secrètes, comptes et accès, sauvegardes disponibles, inventaire des composants tiers : remis **dans les sept (7) jours** suivant la fin du contrat.
- **Article 10 — comptes au nom du client.** Domaine, hébergement, cloud, dépôt Git, base, messagerie, SSL, analytics et API doivent être ouverts au nom du client ou sous son contrôle direct. À vérifier compte par compte avant la livraison : aujourd'hui le dépôt et la base de développement sont sur la machine du prestataire.
- **Annexe 2 — matrice des livrables et recette.** Le contrat fournit un tableau **vide** (livrable / prévu / livré / test / réserve). C'est exactement ce que produisent déjà les validations de fin de phase (`P1-08`, `P2-07`, `P4-05`, `P6-21`) : la matrice doit être **générée depuis ce fichier et la suite de tests**, pas retapée.

Obligations qui touchent le code, et où elles en sont :
- **Article 9 — absence de backdoor, de compte administrateur dissimulé, de collecte non autorisée.** À affirmer explicitement dans l'audit de `P5-01` / `P5-02`, avec la preuve : l'audit d'autorisation parcourt déjà **toutes** les routes Express, et aucun compte n'est créé hors migration ou action d'administrateur.
- **Article 13 — pas de secret en clair dans le code.** Règle déjà tenue (`.env`, jamais de secret côté navigateur) ; elle devient contractuelle, donc elle mérite un test de cohérence plutôt qu'une habitude.
- **Article 12 — pas de données personnelles réelles en développement ni en test.** Déjà respecté : les tests créent leurs propres comptes fictifs. À déclarer dans le dossier de livraison.
- **Article 12 — base légale nommée** : loi n° 18-07 du 10 juin 2018, **modifiée et complétée par la loi n° 25-11 du 24 juillet 2025**. La politique de confidentialité et le centre de confiance (`P6-19`) peuvent enfin citer un texte précis au lieu de rester génériques.
- **Article 15 — garantie de 90 jours** après la livraison finale, pour les anomalies imputables aux développements livrés.
- **Article 7 — recette** : anomalies **bloquantes / majeures / mineures**, les deux premières corrigées avant la livraison finale, les mineures consignées en réserves. Délai de validation proposé : **10 jours calendaires** à compter d'une version réellement testable.

Réserve : le contrat laisse la **date de livraison cible vide** (`P6-01` point 13). Les jalons existent (conception, version intermédiaire, recette, corrections, mise en production, livraison finale) mais aucun n'a d'échéance.

**Réalisé (2026-10-16) — les deux documents sont GÉNÉRÉS, pas rédigés :**

`npm run deliverables` (`server/scripts/generate-deliverables.js`) produit :

- **`LIVRABLES/INVENTAIRE_COMPOSANTS.md`** (article 14) : 40 composants, 8 licences, lus depuis les `package.json` **réellement installés** — versions installées et non intervalles demandés, parce que c'est le code installé qui est livré. Un paquet sans champ `license` serait signalé comme tel plutôt que complété au jugé ; il n'y en a aucun aujourd'hui.
- **`LIVRABLES/MATRICE_RECETTE.md`** (annexe 2) : les 88 livrables du plan avec leur état et la suite de tests qui les couvre, et une section « réserves, en clair » pour que les livrables bloqués par une donnée du client ne soient pas lus comme des anomalies à la recette.

**Deux licences à obligations sont signalées au client**, ce que l'article 14 demande explicitement : `mariadb` (LGPL-2.1-or-later, dépendance de développement) et `dompurify` (MPL-2.0 **OR** Apache-2.0, donc sans obligation si la branche permissive est retenue). Les deux sont utilisées sans modification ; la décision d'accepter l'obligation appartient au client, pas au prestataire.

**Un document généré ne peut pas mentir sur l'état du dépôt ; un document recopié le peut dès la semaine suivante.** Quatre tests de cohérence le vérifient : chaque dépendance déclarée figure à l'inventaire, chaque licence à obligations est signalée, chaque livrable du plan figure à la matrice, et **aucun livrable bloqué n'y apparaît comme livré** — ce document sert à la recette et au dernier quart du paiement, un « livré » de trop s'y lit comme une facturation de trop.

**Reste à faire :** la vérification compte par compte de l'article 10 (domaine, hébergement, dépôt Git, base, SSL au nom du client — aujourd'hui le dépôt et la base de développement sont sur la machine du prestataire), le dossier d'exécution et la mini-formation, et l'affirmation explicite de l'article 9 dans l'audit de `P5-01`.

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
1. ~~**Nom et identité**~~ — **tranché le 2026-10-09 : la plateforme s'appelle FINCLUDIA.** Renommage appliqué dans tout le code, les textes fr/en/ar, les tests et la documentation (détail et points d'attention : « Renommage en FINCLUDIA » ci-dessous). **Restent à fournir** : logo, charte graphique, nom de domaine. **Reste à trancher** : que deviennent l'e-learning, le blog et les outils actuels — intégrés comme modules « Apprendre » / « Explorer » (hypothèse retenue dans ce plan) ou site séparé ? Le texte de présentation de la page d'accueil décrit encore l'ancien positionnement (« formations, blog et outils pour auto-entrepreneurs, PME, PMI ») : il n'a **pas** été réécrit, parce que le nouveau positionnement est une décision commerciale, pas un renommage. **Reçu le 2026-10-16 : le logo et la charte graphique officielle** (« Positionnement officiel aperçu charte graphique.odt ») — positionnement, signature, palette, dégradé officiel, typographies et logo. Détail, écarts avec l'existant et travail restant : `P1-13`. **Reste à fournir : le nom de domaine.** Le sort commercial de l'e-learning, du blog et des outils n'est toujours **pas** tranché, mais la charte y répond en partie : elle décrit une plateforme « d'éducation, d'inclusion et d'intelligence financières », donc un seul produit.
2. **Périmètre de la première livraison** : les 8 publics d'un coup ou d'abord quelques-uns (ex. étudiant + jeune actif + salarié) ? Quels lots du backlog client ?
3. ~~**Types de compte existants**~~ (auto-entrepreneur, PME, PMI) face aux 8 publics (voir `P3-18`) — **tranché le 2026-10-11 : un seul profil actif à la fois, jamais deux en même temps.** Pas de coexistence en deux axes indépendants.
4. ~~**Devises**~~ — **reçu le 2026-10-17** (`FINCLUDIA_REFERENTIEL_MAITRE_EXCEL_BLOCAGES_AZIZ.xlsx`, onglet `08_Devises`) : **DZD comme devise de base**, et une liste fermée de devises prises en charge (USD, EUR, GBP, JPY, CNY, CHF, CAD, DKK, SEK, NOK, AED, SAR, KWD, TND, MAD, LYD, MRU, SDR). Source du taux : Banque d'Algérie, taux de change journalier officiel, un seul cours par jour ouvrable ; alerte de fraîcheur au-delà de **2 jours ouvrables** ; jamais de taux de marché parallèle. Si l'utilisateur connaît le taux réellement appliqué par sa banque, ce taux se stocke **séparément**, sans écraser le taux de référence. Voir `P6-22` pour la mise en œuvre.
5. **Seuils** que le document laisse « à valider » — **substantiellement reçu le 2026-10-17**, mêmes onglets du référentiel maître : `09_Sante_Poids`/`10_Sante_Baremes` (pondérations et grilles de sous-scores de l'indice de santé financière F053 — **barème « B », 7 dimensions** : équilibre mensuel 25 %, réserve 20 %, dette 20 %, épargne 15 %, objectifs 10 %, stabilité des revenus 5 %, qualité des données 5 %, avec le détail de normalisation de chaque dimension et les paliers de score global 0-39/40-59/60-79/80-100), `11_Readiness` (indice de préparation au financement, version A : 6 critères pondérés 30/20/15/15/10/10 et leurs normalisations), `12_Reserve` (cibles de réserve par profil, deux grilles), `13_Alertes` (seuils complets budget/dette/réserve/objectifs/échéances/fraîcheur), `25_Constantes` (constantes versionnées : `DEBT_WATCH`=20 %, `EMERGENCY_CRITICAL/STANDARD/ROBUST_MONTHS`=1/3/6, `ENVELOPE_WARNING`=80 %, `ENVELOPE_EXCEEDED`=100 % — **ces deux derniers correspondent déjà exactement** aux seuils implémentés dans `P6-05`). **Réserve non close** : le document nomme lui-même un second barème de santé financière à 6 dimensions sans en donner le détail, et plusieurs grilles de réserve/readiness coexistent sans arbitrage explicite entre elles — à signaler au client plutôt qu'à trancher seul. Mise en œuvre : voir `P6-22`.
6. ~~**Règles de paie**~~ (cotisations, IRG) **reçues le 2026-10-17**, onglets `14_Paie_Regles`/`15_IRG_Tranches` : SNMG 24 000 DA/mois (décret présidentiel 26-01 du 2026-01-07), cotisations détaillées par branche et par part employeur/salarié (total salarié 9 %, total employeur 25 % + 0,5 % œuvres sociales, décret exécutif 15-236 du 2015-09-16, « à revalider si nouveau texte »), barème IRG par tranches daté (DGI, page consultée le 2026-10-12), exonération ≤30 000 DA/mois. Débloque `P4-14`. — **Offres de financement** pour `P4-15` **reçues le 2026-10-17**, onglet `03_Offres_Credit` : 25 fiches produits réelles (banque, taux, durée, DSR, apport, âge, revenu minimum, source), plus les formules de calcul (`04_Credit_Regles` : mensualité, capacité, apport requis, plafond légal 30 % pour le crédit à la consommation — décret exécutif 15-114 art. 16) et les règles de gouvernance avant publication (`24_Gouvernance` : revalidation hebdomadaire/mensuelle, retrait du comparateur actif au-delà de 30-90 jours sans revalidation). **Le client marque lui-même la quasi-totalité de ces 25 fiches « Audit primaire requis »** (statut déclaré dans sa propre source, non une vérification indépendante) et bloque explicitement un produit (`ODT-CR-015`, Al Salam Bank « Tayssir véhicule » : « Conflit officiel — bloquer production tant que banque non confirmée ») : l'implémentation de `P4-15` doit respecter ce garde-fou, pas le contourner. — Données **CCP** pour `P4-13` : toujours fournies depuis le 2026-10-16 sans ligne publiable (inchangé, voir `P4-17`).
7. **Mineurs** : âge minimum d'inscription, consentement parental, fonctions exactes réservées aux adultes — **reçu le 2026-10-17**, onglet `19_Mineurs` et `25_Constantes` (`ADULT_AGE`). **Point d'attention majeur : la majorité retenue par le client est 19 ans (Code civil algérien, art. 40), pas 18.** Règle précise : moins de 13 ans → aucun compte autonome (profil enfant seulement, géré par un adulte dans son propre espace) ; 13-18 ans → « Mode Jeune » possible avec consentement **vérifié** du représentant légal avant tout traitement de données (loi 18-07 art. 8), budget réel, objectifs, sécurité, comparateurs informatifs, portefeuille fictif autorisés, **jamais** de crédit réel, financement, investissement exécuté ou transmission à un partenaire sans consentement légal ; 19 ans et plus → compte adulte complet. Tout le code actuel (`FIN_AGE_RANGES`, `requireAdult`, les textes « réservé aux personnes de 18 ans et plus » fr/en/ar) utilise encore **18** comme seuil : correction nécessaire, voir `P6-22`.
8. ~~**Canaux de notification**~~ — **tranché le 2026-10-11 : pas de SMS.** Les notifications restent in-app ; l'e-mail reste une option future, dépendante du même choix de fournisseur que la newsletter (non fait).
9. ~~**Textes légaux**~~ — **tranché le 2026-10-11 :** la mention « pas de conseil réglementé » et la politique de confidentialité sont rédigées par l'équipe. Une suppression de compte entraîne une suppression complète et immédiate des données (pas de durée de conservation à part).
10. **Contenus restant à fournir** : missions (abandonné, voir `P2-10`). ~~**Intentions de l'assistant déterministe**~~ (`P3-19`) — **reçues le 2026-10-17**, onglets `20_Assistant_25`/`21_Assistant_Complements` : **25 intentions** complètes (CB01 à CB24, plus le repli CB99 « intention inconnue »), chacune avec ses déclencheurs (mots-clés), ses questions/étapes, sa réponse-type et son garde-fou explicite — bien plus riche que les 8 intentions brouillon actuellement en base (voir limite notée dans `P3-19`). ~~**Modèles d'objectifs**~~ — **reçus le 2026-10-17**, onglet `22_Objectifs_20` : **20 modèles** (G01 à G20, cible par défaut, horizon, règle/condition) contre les 11 génériques actuellement dans `constants/finGoal.js` (`P6-08`). Référentiel de catégories (l'onglet `03_Categories` en donne une base, déjà implémenté par `P6-02`, confirmation seulement). Le glossaire et les guides (`P2-08`) sont rédigés par l'équipe, plus attendus du client. Intégration de ce contenu plus riche : voir `P6-22`.
11. **Hébergement** : un hébergement mutualisé (cPanel, MariaDB) suffit pour une démonstration ; des données financières réelles demandent sauvegardes testées, chiffrement et disponibilité à confirmer (voir `P5-04`). **Précision contractuelle (contrat du 2026-09-14, article 6)** : les frais annexes — nom de domaine, hébergement, licences tierces, certificats de sécurité — sont **à la charge du prestataire**, sauf stipulation contraire. Le choix de l'hébergement reste une décision du client (il porte ses données), mais son coût n'est pas un argument pour le reporter.
12. **Périmètre contractuel non couvert par ce plan** (contrat, Annexe 1) : le contrat annonce, au-delà de la gestion de budget des particuliers, un **ERP pour entreprises, PME, PMI, micro-entreprises, startupeurs, auto-entrepreneurs, micro-importateurs et professions libérales** avec tableaux de bord et **états financiers**, ainsi qu'un volet **diaspora et commerce international**. Rien de tout cela n'existe dans ce plan. Voir `P7-01` : c'est une décision de périmètre, pas une tâche à lancer.
13. **Date de livraison cible** : le contrat la laisse **vide** (article « Date de livraison cible »), alors qu'il fixe le début au 14/09/2026, un paiement en quatre fois (25 % / 25 % / 25 % à la validation de la recette / 25 % à la livraison finale et à la levée des réserves) et une garantie de **90 jours**. Sans date, ni les jalons ni la recette n'ont d'échéance opposable.
14. **Annexe 1 du contrat à compléter** : front-end, back-end, base de données, espace administrateur, gestion des rôles, hébergement, sécurité/sauvegardes, documentation/formation et mise en production y sont **tous laissés vides**. Ce plan en est la réponse de fait ; il vaut mieux l'y reporter que de laisser l'annexe muette.

Livrable attendu : une note de réponses. Passer alors cette tâche à `✅ done`. **Toujours `⛔ blocked`** malgré la réception du référentiel maître ci-dessous : les points 2 (périmètre de la première livraison), 12 (périmètre ERP, voir `P7-01`), 13 (date de livraison) et 14 (annexe 1 du contrat) restent sans réponse du client.

#### Référentiel maître reçu du client (2026-10-17)

`FINCLUDIA_REFERENTIEL_MAITRE_EXCEL_BLOCAGES_AZIZ.xlsx` (32 onglets) : reconstruction structurée, par le client, du document ODT déjà reçu — pas une vérification bancaire/fiscale indépendante (son propre onglet `01_Mode_Emploi` le dit explicitement). Répond en grande partie aux points 4, 5, 6, 7 et 10 de `P6-01` ci-dessus. Contenu par onglet, pour traçabilité :
- `02_Identite` : marque, promesse, mission, positionnement et limites (ni banque ni prêteur), piliers de marque — déjà conformes à ce qui est implémenté.
- `03_Offres_Credit`, `04_Credit_Regles`, `05_Credit_Criteres`, `06_Inputs_Credit`, `07_Schema_Import` : 25 fiches de crédit réelles, les formules de calcul (mensualité, capacité, apport, plafond légal 30 %), les critères d'incompatibilité (jamais une décision bancaire simulée) et un schéma cible d'import — matière de `P4-15` et renfort de `P4-11`.
- `08_Devises`, `09_Sante_Poids`, `10_Sante_Baremes`, `11_Readiness`, `12_Reserve`, `13_Alertes`, `14_Paie_Regles`, `15_IRG_Tranches`, `19_Mineurs`, `25_Constantes` : les seuils, pondérations et règles de `P6-01` points 4 à 7 (devises, indice de santé financière, préparation au financement, réserve, alertes, paie/IRG, mineurs, constantes versionnées).
- `16_Revenus_44`, `17_Depenses_125`, `18_Transactions` : catégories de revenus/dépenses — à comparer aux 91 catégories déjà livrées par `P6-02` (confirmation, pas un nouveau besoin a priori).
- `20_Assistant_25`, `21_Assistant_Complements` : 25 intentions de l'assistant déterministe (`P3-19`).
- `22_Objectifs_20`, `23_Objectifs_Variantes` : 20 modèles d'objectifs (`P6-08`).
- `24_Gouvernance` : règles de fraîcheur et garde-fous de publication par type de donnée — contraintes à respecter par `P4-15`, `P4-13`, `P4-17` et le centre d'alertes `P6-18`.
- `27_Plan_Action` : plan de lots proposé par le client pour « rendre le référentiel actionnable » — à lire comme une proposition de structuration, pas un donneur d'ordre : la plupart de ces lots sont déjà couverts, sous d'autres noms, par les phases 3/4/6 de ce plan.
- `28_Inventaire_Source`, `29_Archive_Integrale`, `30_Notes_Source` : archive brute et notes de traçabilité (191, 1180 et 189 lignes) — matière de référence, non résumée ici ; à consulter au cas par cas si une valeur précise doit être retrouvée à sa source.
- `31_Comparateur_Themes` : confirme que seules les données de crédit sont exploitables au niveau produit dans ce fichier ; les 13 autres familles tarifaires du comparateur restent à alimenter depuis d'autres documents (déjà le cas, voir `P4-06`/`P4-07`).

**Nouvelle tâche créée pour absorber ce contenu : `P6-22`.**

### P6-22 — FINCLUDIA : intégration du référentiel maître (seuils, paie, mineurs, assistant, objectifs)
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P4-09`

**Dépendance à `P6-01` retirée le 2026-10-17 :** `P6-01` est la tâche « décisions à obtenir du client », et le référentiel maître reçu ce jour-là **répond** à ce que cette tâche attendait. Attendre que `P6-01` passe `✅ done` aurait bloqué six chantiers sur une tâche dont le rôle est justement de collecter des réponses déjà arrivées.
- Durée cible : 5 jours (estimation)
- Origine : `FINCLUDIA_REFERENTIEL_MAITRE_EXCEL_BLOCAGES_AZIZ.xlsx`, reçu le 2026-10-17

Six chantiers distincts, listés séparément parce qu'ils touchent des modules différents et peuvent avancer indépendamment :

1. **Correction de la majorité légale : 18 → 19 ans.** `FIN_AGE_RANGES` (`constants/finPublics.js`, actuellement `['under18', '18-24', ...]`), la fonction qui en déduit le statut adulte, `requireAdult` et tout texte fr/en/ar « réservé aux personnes de 18 ans et plus » (au moins 19 fichiers concernés côté serveur et client). **Tâche sensible** : une tranche d'âge mal reclassée changerait ce qu'un compte existant peut voir — prévoir une migration de données si des comptes réels sont déjà en tranche `18-24`.
2. **Indice de santé financière (F053)** : implémenter le barème B (7 dimensions, pondérations et grilles de sous-scores de `09_Sante_Poids`/`10_Sante_Baremes`), actuellement non calculé. Signaler au client, avant de choisir seul, l'existence d'un second barème à 6 dimensions mentionné mais non détaillé dans son propre document.
3. **Indice de préparation au financement et cibles de réserve** : implémenter la version A de `11_Readiness` (6 critères pondérés) et une cible de réserve par profil (`12_Reserve`) — actuellement `P6-09` n'a pas de cible versionnée par profil.
4. **Seuils d'alertes du centre de notifications (`P6-18`)** : aligner les seuils déjà codés sur `13_Alertes` et `25_Constantes` (plusieurs correspondent déjà exactement, ex. enveloppe 80 %/100 % ; d'autres restent à vérifier un par un, ex. DSR 20/30/40/50 %, fraîcheur 30/60/90/180 jours selon le type de donnée).
5. **Paie et IRG (`P4-14`)** et **offres de financement (`P4-15`)** : implémenter avec les données reçues (voir `P6-01` points 6), **en respectant le garde-fou du client** — pas de publication d'une offre marquée « audit primaire requis » sans contrôle, blocage explicite de `ODT-CR-015`.
6. **Contenu plus riche de l'assistant (`P3-19`, 25 intentions) et des objectifs (`P6-08`, 20 modèles)** : remplacer les 8 intentions brouillon et les 11 modèles génériques actuels par le contenu complet du client, avec ses garde-fous (ex. CB22 « jamais demander un code PIN/OTP »).

**Réalisé (2026-10-17) — les six chantiers :**

**1. Majorité civile à 19 ans.** Le référentiel tranche : **19 ans révolus, Code civil algérien article 40** (`ADULT_AGE`, onglets `19_Mineurs` et `25_Constantes`). Le projet avait supposé 18 — l'habitude française — et cette supposition décidait qui pouvait voir ses dettes, son patrimoine réel et préparer un financement. **Une personne de 18 ans y avait accès alors qu'elle est mineure au regard du droit applicable.**

- Tranches : `under13 | 13-18 | 19-24 | 25-34 | 35-49 | 50-64 | 65plus`. Le second seuil est 13 ans, et le client précise que c'est une **politique FINCLUDIA**, pas un âge légal de consentement numérique.
- Les tranches mineures sont **nommées** (`MINOR_AGE_RANGES`) et non déduites par « tout sauf under13 » : une tranche ajoutée plus tard serait adulte par oubli, et l'erreur se ferait dans le sens qui ouvre des droits.
- **Migration de données, et le refus de deviner** : `under18` → `13-18` (le compte était mineur, il le reste, aucun droit ouvert) ; `18-24` → **`NULL`**. Cette tranche est devenue ambiguë — la remapper vers `19-24` promouvrait des mineurs, vers `13-18` retirerait des droits à des majeurs. `NULL` est un état déjà prévu et sûr : `requireAdult` refuse par défaut et le refus porte le motif `ageUnknown`, que l'écran traduit en « indiquez votre tranche d'âge » avec le lien.
- **La contrainte SQL avait été oubliée** : `users_fin_age_range_check` énumérait encore les anciennes valeurs, et la base refusait ce que le code produisait. Trouvé par la suite, corrigé dans la migration — en plaçant le remplacement **après** le remappage, puisque l'inverse échouerait sur les lignes portant encore les anciennes valeurs.
- Le refus adressé à un compte jeune **dit ce qui lui reste** (budget réel, enveloppes, objectifs, sécurité, apprentissage, portefeuille fictif) : un refus qui n'énumère que des interdits se lit comme une porte fermée.

**2. Indice de santé financière (F053), enfin calculé.** Bloqué depuis le début de la Phase 6 faute de pondérations ; le client fournit le **barème B à 7 dimensions** (`09_Sante_Poids`, `10_Sante_Baremes`). Ce qui reste vrai : **une dimension absente n'est jamais un zéro** — elle sort du calcul, son poids sort du dénominateur, et le score s'annonce partiel en nommant ce qui manque. Un test le prouve d'une façon qui ne peut pas mentir : retirer une dimension faible fait **monter** le score, ce qui serait impossible si l'absence valait zéro.

Il n'est **pas affiché à un compte jeune** : le client exclut l'alerte adulte sur la réserve d'un lycéen, et une note globale « Priorité sécurité » affichée à un adolescent est le même jugement d'adulte.

**3. Préparation au financement (version A) et cibles de réserve (grille A).** Deux règles du client tenues à la lettre :
- **Au-delà du plafond publié par la banque, ce n'est pas un score bas, c'est un BLOCAGE.** Un 0 noyé dans six critères pondérés laisserait un dossier « presque prêt » alors que la banque le refuse.
- **Un lycéen n'est jamais alerté sur sa réserve** (« objectif éducatif, sans alerte adulte »).
- `EPG` (épargnant débutant) **n'a de cible dans aucune des deux grilles** : sa cible est `null` avec la raison, pas « 3 mois par défaut ». Inventer une cible de réserve, c'est inventer un objectif d'épargne.

**4. Seuils d'alertes** (`13_Alertes`, `25_Constantes`) : 18 règles avec leur niveau et **le message du client mot pour mot**. Ce sont des phrases adressées à quelqu'un sur sa situation financière ; les reformuler change le ton d'une alerte, et le ton est la moitié du message.

La nuance que le produit n'avait pas : **la fraîcheur dépend du type de donnée** — 90 jours pour un revenu ou une dette, 180 pour une valeur de patrimoine, 31 pour une donnée mensuelle. Le produit n'avait qu'un seuil unique.

Les seuils d'enveloppe déjà codés (80 %, 100 %) tombaient **déjà** juste, mais par coïncidence : ils sont maintenant rattachés à leur source, et un test vérifie qu'ils ne divergent plus.

**5. Paie, IRG et crédit.** Voir `P4-14` (décodeur de fiche de paie), `P4-02` (simulateur de crédit) et `P4-15` (comparaison de financements), toutes trois débloquées et livrées le même jour.

**6. Assistant et objectifs.** Les **25 intentions** `CB01`-`CB25` remplacent 8 brouillons ; les **20 modèles d'objectifs** `G01`-`G20` remplacent 11 génériques. Générés par script depuis les onglets `20_Assistant_25` et `22_Objectifs_20`.

Le plus précieux n'est pas le contenu, ce sont les **garde-fous**, présents sur les 25 sans exception et protégeant de trois fautes distinctes : `CB22` « ne jamais demander code PIN/OTP/mot de passe » (exposer un secret), `CB24` « ne jamais deviner un taux » (inventer un chiffre), `CB99` « ne jamais générer de contenu hors base validée » (improviser). Un test balaie **toutes** les réponses à la recherche d'une promesse de décision bancaire, plutôt qu'une liste choisie d'avance.

`CB16` (« utilisateur mineur ») dit « <19 fonctions adultes bloquées » : un test vérifie que cet âge est bien celui du chantier 1, pour que le catalogue du client et la règle du produit ne puissent pas diverger en silence.

**Les divergences déclarées, pas tranchées en silence.** Le document du client contient plusieurs tables qui ne coïncident pas, et il écrit lui-même « aucune ne doit remplacer l'autre silencieusement ». Six divergences sont publiées par l'API avec le choix retenu, l'alternative et la raison : deux barèmes de santé, deux usages de la préparation, deux grilles de réserve, le seuil de vigilance de dette (20 % ou 30 %), le délai d'exclusion d'une offre (60 ou 90 jours) et la fraîcheur mensuelle (30 ou 31 jours).

**Tests :** environ 120 ajoutés (`finHealth`, `finPayroll`, `finCredit`, `finAlerts`, `finIntents`, plus les tranches d'âge dans `finProfile`).

**Réserves déclarées :**
- Le **barème de santé à 6 dimensions** mentionné par le client n'est pas implémentable : il n'est pas chiffré dans son document.
- Les **régimes IRG** au-dessus du seuil d'exonération sont transcrits mais **non appliqués** : la formule du second abattement et la date d'effet ne sont pas confirmées.
- **Aucune des 25 offres de crédit n'est publiable** tant que le client n'a pas contrôlé les brochures officielles.
- Le **consentement vérifié du représentant légal** (13-18 ans, loi 18-07 article 8) reste à construire : le client en pose l'obligation sans décrire de méthode de vérification.

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

> **Erreurs de calcul reconnues le 2026-10-27 (signalées par le client, vérifiées dans le code) — correction : `P8-04`, `P8-03`.** (C1) Le total des revenus additionne les ressources **déclarées** et les revenus **réellement saisis** : un salaire saisi des deux façons compte double, un revenu déclaré jamais reçu compte comme reçu. (C2) Mettre de côté est enregistré comme une **dépense** de famille `goal`, et un retrait d'épargne comme un **revenu** : l'épargne fait baisser le flux net. Les écrans C07 et C08 de l'ancien cahier sont aussi surlignés par le client comme incomplets (actions de saisie, filtres) : reprise dans `P8-07`.

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

> **Erreurs reconnues le 2026-10-27 — correction : `P8-04`, refonte : `P8-09`.** (C5) Le budget journalier (F012) remplace le solde par « budget prévu − dépensé », puis retranche une seconde fois les enveloppes fixes restantes. (C6) Le « reste à affecter » porte l'identifiant F009 et le total prévu l'identifiant F003, donc une explication « Pourquoi ? » qui n'est pas la sienne. Le cahier consolidé demande aussi un budget **par catégorie**, rattaché automatiquement aux dépenses, y compris antérieures (onglet 10B) — l'écran C06 est surligné par le client.

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

**Corrigé sur retour utilisateur (2026-10-17) :** créer une enveloppe échouait (422) quand la catégorie choisie appartenait à la famille « revenus » — règle déjà appliquée côté serveur (`isBudgetableFamily`, `BUDGETABLE_FAMILY_EXCLUSIONS = ['income']`) mais jamais reproduite côté client : le sélecteur de catégorie proposait les catégories de revenu comme n'importe quelle autre, menant droit au refus serveur. `BudgetDetailPage.jsx` filtre maintenant les catégories de la famille « income » avant de les proposer.

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

> **Remplacé par décision du client le 2026-10-27 — `P8-06`.** Le cahier consolidé remplace « les tableaux de bord financiers spécifiques par public » par **un seul Accueil, le même pour tous** (ARC-01, onglet 29). Les huit tableaux de cette tâche seront fondus en un seul ; le moteur de calcul et les règles (3 actions au plus, « non calculé » plutôt que 0) sont repris.

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

> **Écart reconnu le 2026-10-27 — refonte : `P8-12`.** Les écrans C09 à C11 sont surlignés par le client : le détail d'un objectif ne simule ni inflation, ni rendement hypothétique, ni hausse annuelle de l'épargne, ni scénarios (C11, en rouge), et les statuts « en pause » / « arrêté » manquent. Le catalogue doit aussi contenir « Réserve de sécurité » et « épargne projet ».

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
- **Mise à jour du 2026-10-17** : le client a fourni un catalogue de 20 modèles (`22_Objectifs_20`, G01-G20, cible par défaut + horizon + règle), contre les 11 modèles génériques actuels. Intégration restant à faire dans `P6-22`.

### P6-09 — FINCLUDIA : réserve de sécurité
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-05`
- Durée cible : 1 jour (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écran C12 ; F014)

> **Erreurs de calcul reconnues le 2026-10-27 — correction : `P8-04`, refonte : `P8-12`.** (C4) Les dépenses essentielles sont la somme de 3 mois **divisée par 3 même quand l'historique n'a que quelques jours** : elles sont sous-estimées, donc les mois de réserve surestimés ; et « essentiel » est une liste de catégories codée en dur au lieu d'un drapeau modifiable. (C3) L'épargne liquide est un cumul de mouvements, pas le solde des comptes d'épargne. Le cahier consolidé fait du fonds d'urgence un type d'objectif (GO-01) : cette page rejoint « Objectifs & sécurité ».

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

**Corrigé sur retour utilisateur (2026-10-17) :** la comparaison avalanche / boule de neige « ne marchait pas » — en réalité, quand aucune dette éligible n'avait de taux connu, l'écran n'affichait strictement rien (ni plans, ni la raison), parce que l'ancien code exigeait `comparison.data.avalanche` pour afficher quoi que ce soit, y compris les avertissements. Corrigé : un état de chargement est affiché pendant le calcul, et si la comparaison ne peut pas se faire, les avertissements du serveur (ex. « dette sans taux connu exclue ») s'affichent désormais dans un encart visible plutôt que de disparaître silencieusement.

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

**Corrigé sur retour utilisateur (2026-10-17 et 2026-10-18) :**
- **Un libellé d'actif long cassait la ligne** : `.wealth-row-label` portait `margin-inline-end: auto`, qui, dans une ligne en `flex-wrap`, poussait tout le reste (type, liquidité, montant, date, bouton supprimer) sur une ligne séparée en dessous. Corrigé en regroupant tout sauf le libellé dans un bloc `.wealth-row-meta` qui porte lui-même la marge automatique, pour que le libellé et le reste se répartissent indépendamment.
- **Ajouter un actif donnait l'impression que « rien ne se passe » / qu'on ne retrouve pas l'actif ajouté** : le formulaire est en bas de la page, mais le message de confirmation et la liste des actifs sont en haut — en soumettant depuis le bas d'une longue page, la personne ne voyait ni l'un ni l'autre. Corrigé : après un ajout réussi, la page défile automatiquement jusqu'à la section « Mes actifs » pour montrer la nouvelle ligne.

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
- **La notification elle-même est maintenant poussée** (`P6-18`, 2026-10-14) : chaque changement de partage notifie les autres membres de l'espace, jamais l'auteur du changement. Le journal reste consultable indépendamment.
- **Les tableaux de bord « Moi / Nous », colocation et foyer de `P6-06`** lisent encore les données personnelles du compte. Les brancher sur cette matrice est le travail de `P6-15`.

### P6-14 — FINCLUDIA : dépenses partagées et règlements
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P6-13`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans P02, P03 ; F043, ALG-02)

- Dépense partagée : payeur, participants, répartition égale / en % / en montants, **somme des parts = montant**, arrondis selon une règle documentée, payeur pouvant ne pas participer.
- Soldes par membre (convention de signe documentée dans l'API) ; « qui doit quoi à qui » avec **minimisation du nombre de remboursements** (ALG-02) qui ne change jamais la dette nette de chacun ; paiements déclaratifs (aucune intégration de paiement).

**Réalisé (2026-10-14) :** modèles `FinSharedExpense` / `FinSharedShare` / `FinSettlement`, service et contrôleur déjà posés par une session précédente ; cette session a écrit les **routes** (`finShared.routes.js`, montées sur `/fin/espaces/:id/depenses`, `/reglements`, `/soldes`, manquantes jusqu'ici), appliqué les **migrations non jouées** (`fin_calendar`, `fin_assets`, `fin_spaces`, `fin_paper`, `fin_shared_expenses` — cinq migrations existaient en fichier mais n'avaient jamais été appliquées ni à la base de développement ni à celle de test), écrit les **tests de sécurité** et construit l'**interface**.
- **Le payeur et les participants sont des appartenances (`FinSpaceMember`), pas des comptes** : une dépense reste lisible « payée par X » après le départ de X, et un participant qui n'est pas membre de l'espace est refusé (422), pas simplement ignoré.
- **Arrondi au plus grand reste** (`ROUNDING_RULE`, documenté dans l'API elle-même, pas seulement en commentaire) : la somme des parts est toujours exactement égale au montant, et un participant listé deux fois est refusé plutôt que dédoublonné silencieusement.
- **Le partage proportionnel aux revenus (F042) ne lit jamais un revenu sans le consentement déjà posé par `P6-13`** (niveau `incomes` ≥ `totals` de la matrice de partage) : un participant qui n'a pas partagé est nommé dans le refus, jamais contourné par un repli silencieux vers une répartition égale.
- **Un règlement est déclaratif** (`SETTLEMENTS_ARE_DECLARATIVE: true`, publié par l'API) : aucune intégration de paiement, l'une ou l'autre partie peut l'enregistrer.
- **ALG-02 vérifié, pas seulement appliqué** : le service recalcule la position nette de chaque membre après le plan de remboursement et lève une erreur si une seule dinar s'est déplacé entre deux personnes autrement que par le solde déjà dû — la minimisation ne doit jamais rejouer une dette.
- **Suppression d'une dépense ou d'un règlement** : réservée à qui l'a payé(e), qui l'a enregistré(e), ou un administrateur de l'espace — pas n'importe quel membre, puisque retirer l'écriture de quelqu'un d'autre change ce que tout le monde doit.
- **Interface** : section « Dépenses partagées » dans le détail de l'espace (`/espaces`) — soldes, plan de remboursement, formulaires de dépense et de règlement, liste et suppression ; fr / en / ar.

**Défaut trouvé et corrigé en chemin :** les migrations de `P6-06`, `P6-07`, `P6-11`, `P6-12`, `P6-13` et de cette tâche existaient toutes en fichier mais **n'avaient jamais été appliquées** à la base de développement, et la base de test était également en retard — la cohérence du projet (contrôle « aucune dérive ») l'a révélé. `npx prisma migrate dev` puis `node tests/setup.js` ont rattrapé les deux. À vérifier systématiquement après avoir repris du code écrit dans une session précédente.

**Tests :** 8 de sécurité (`tests/security/finShared.test.js` : espace non membre → 404 sur toutes les routes, rôle `viewer` ne peut qu'observer, somme des parts toujours exacte, consentement du partage proportionnel aux revenus, suppression réservée au payeur/enregistreur/admin, soldes de l'espace toujours nuls).

**Limites et réserves déclarées :**
- **Pas encore de test unitaire/fonctionnel dédié, de scénario de cohérence globale ni de parcours navigateur.**
- **Les tableaux de bord colocation / couple / foyer** qui consomment ces dépenses partagées sont `P6-15`.

### P6-15 — FINCLUDIA : colocation, couple et famille
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P6-14`, `P6-05`, `P6-08`
- Durée cible : 4 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans P05, CO02 à CO06, CP02 à CP04, FA02 à FA06)

- Tableau de bord partagé selon le type d'espace, **jamais de montant privé non partagé**.
- Colocation : factures et abonnements communs (un paiement confirmé crée la dépense partagée, sans doublon), enveloppes communes, accord financier, objectifs communs.
- Couple : objectif commun, contributions (F044), revue financière, séparation « Moi / Nous ».
- Famille : foyer, enfants et projets (**données enfant minimales**), dépenses annuelles et provisions (F045), revue du foyer.

**Réalisé (2026-10-14) :**
- **Trois nouveaux modèles liés à l'espace, pas au compte** : `FinSpaceGoal` (+ `FinSpaceGoalContribution`), `FinChild`, `FinSpaceProvision` — un objectif ou une enveloppe commune appartient à l'ESPACE, visible par construction par tous ses membres, contrairement à `FinGoal` / `FinBudget` (`P6-08` / `P6-05`) qui restent strictement personnels. C'est la décision prise en amont de cette tâche : créer des tables liées à l'espace plutôt que de superposer un deuxième sens à `scope` sur les tables personnelles.
- **La progression d'un objectif commun vient des contributions réellement enregistrées** (F025/F026 sur leur somme), jamais d'un nombre éditable par une seule personne.
- **F044 (contribution foyer proportionnelle au revenu)** : ce qu'il reste à atteindre sur un objectif commun est réparti par revenu via `householdContribution`, affiché **à côté** des contributions réelles comme une comparaison, jamais comme une facture. N'est calculé que si **tous** les membres vivants ont partagé leur revenu dans cet espace (même condition que F042 pour les dépenses partagées, `P6-13`) ; sinon la réponse dit explicitement « non disponible » et nomme qui manque — jamais un repli silencieux vers un partage égal.
- **Factures et abonnements communs, avec déduplication** (`depenses-recurrentes`) : ALG-04 (déjà écrit en Phase 4) propose des candidats à partir des dépenses partagées passées ; confirmer une période crée la dépense, et confirmer une seconde fois pour le **même libellé et le même mois civil** est refusé — « un paiement confirmé crée la dépense partagée sans doublon » tenu au pied de la lettre.
- **Accord financier** : le champ `note` de l'espace (déjà prévu par `P6-13`), rendu éditable en clair sur la page — pas une nouvelle donnée, juste la bonne étiquette dessus.
- **Revue « Moi / Nous »** (couple) : « Moi » vient strictement de ma synthèse personnelle (`/fin/argent/synthese`), « Nous » des objectifs communs de l'espace — les deux sources ne sont jamais mélangées côté serveur.
- **Revue du foyer** (famille) : une phrase de synthèse (enfants déclarés, provisions et leur coût mensuel total, objectifs communs), composée d'endpoints qui vérifient chacun l'appartenance — aucun nouveau calcul serveur.
- **Les enfants portent une donnée minimale** : prénom et année de naissance seulement, imposé par une contrainte `CHECK` et par le schéma de validation.
- **Les provisions annuelles (F045)** réutilisent la formule déjà écrite et testée en Phase 4 ; une date cible passée est refusée.
- **Interface** : sections « Accord financier », revue Moi/Nous ou du foyer selon le type d'espace, « Factures récurrentes », « Objectifs et enveloppes communs » (avec part équitable F044), « Enfants » et « Provisions annuelles » pour un foyer — toutes intégrées au détail de `/espaces` ; fr / en / ar.

**Tests :** 15 de sécurité (`tests/security/finSpaceGoal.test.js` : 10, `tests/security/finSharedRecurrence.test.js` : 5 — déduplication des factures récurrentes, F044 non disponible puis calculé et exact au centime).

**Limites et réserves déclarées :**
- **Pas de test unitaire/fonctionnel dédié, de scénario de cohérence globale ni de parcours navigateur.**
- **Enveloppes communes** : modélisées comme le même objet qu'un objectif commun (une cible et des contributions), par simplification délibérée plutôt qu'un budget par catégorie façon `P6-05` ; suffisant pour « mettre de côté pour quelque chose à plusieurs », pas pour un budget détaillé par poste.

**Repris le 2026-10-26 (Phase 8).** Le nouveau cahier des charges collectif demande de vrais budgets communs par catégorie (onglet 06, COL-F06/F07) : la simplification ci-dessus est remplacée par `P9-05`. Et toutes les sections de cette tâche, aujourd'hui empilées dans le détail dépliable de `/espaces`, reçoivent chacune leur propre page dans Gestion commune, une solution séparée (`P9-02`) — c'est l'une des causes directes du « je ne me suis pas retrouvé » du client.

### P6-16 — FINCLUDIA : préparation au financement
- Statut : `✅ done`
- Priorité : `🟢 low`
- Dépendances : `P6-10`, `P6-11`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écrans JA08, SA05)

Indice de **préparation** du dossier (complétude, stabilité, effort dette, apport, réserve ; pondérations du client), points forts / faibles, pièces manquantes, checklist, export (avec consentement). **Jamais le mot « score de crédit », aucune prédiction ni garantie d'accord.**

- Dépendance à `P6-01` retirée le 2026-10-14, **pour la même raison que `P2-09` et le F053 du tableau de bord (`P6-06`)** : le mécanisme (F051, « poids configurables/visibles ») est construit et prend ses pondérations en argument, mais les pondérations elles-mêmes restent « à valider » (`P6-01` point 5). Plutôt qu'attendre, l'indice global est **explicitement bloqué** (`FUNDING_INDEX_BLOCKED`) et chaque dimension est montrée seule — exactement ce que la règle du client demande déjà ailleurs (« sous-scores... pondérations visibles »). Rien n'attend plus pour être utile.

**Réalisé (2026-10-14) :**
- **Quatre des cinq dimensions sont des chiffres déjà construits**, jamais recalculés : taux d'effort dette (F018, `P6-10`), apport potentiel (F007, épargne réellement constatée, `P6-08`/`P6-09`), réserve de sécurité (F014, `P6-09`). La **complétude** est la seule chose que cette tâche ajoute, et c'est un fait mécanique (« tel élément est-il déclaré ») — jamais un jugement : public choisi, revenu déclaré, cible de réserve choisie, au moins un actif réel (`P6-11`).
- **« Stabilité » n'a aucune formule dans le classeur du client** — contrairement aux quatre autres dimensions. Plutôt que d'en inventer une (ce que ce projet refuse systématiquement), elle est déclarée **non disponible** (`STABILITY_BLOCKED`) et listée dans les pièces manquantes.
- **« Points forts / points faibles »** n'est pas construit : qualifier un chiffre de fort ou de faible demanderait un seuil, et aucun seuil n'est fourni pour ces dimensions — exactement la réserve qui bloque l'indice global lui-même. Montrer les chiffres bruts, sans verdict, est la version honnête de cette exigence tant que `P6-01` n'a pas tranché.
- **Jamais les mots « score de crédit »** : vérifié par un test qui inspecte la réponse complète de l'API.
- **Export avec consentement explicite** (`POST /fin/financement/export`, `{ consent: true }` obligatoire à chaque appel, jamais mémorisé) : télécharge les mêmes données que l'écran, avec le même indice global bloqué.
- **Interface** : page `/financement` (cinq cartes de figures, case « stabilité » marquée non calculée, checklist, bouton d'export) ; fr / en / ar.

**Tests :** 7 de sécurité (`tests/security/finFunding.test.js` : session requise, indice global jamais un nombre calculé, absence des mots interdits, complétude qui reflète les déclarations réelles, isolation entre comptes, export refusé sans consentement).

**Corrigé sur retour utilisateur (2026-10-17) :** l'entrée de menu « Préparation au financement » était jugée trop longue — raccourcie en « Financement » (fr/en/ar) dans `fincludiaMenu.js`.

**Limites et réserves déclarées :**
- **L'indice global (F051) et la qualification forts/faibles restent bloqués** jusqu'aux pondérations et seuils du client (`P6-01` point 5) — déclaré sur l'écran lui-même, pas seulement ici.
- **Pas de test unitaire/fonctionnel dédié, de scénario de cohérence globale ni de parcours navigateur.**

### P6-17 — FINCLUDIA : personnalisation des 8 parcours
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P6-06`, `P6-15`, `P2-09`, `P4-10`
- Durée cible : 5 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (spécification § 6 à 13, onglet `19_Cartes_Parcours` ; lot 7 du backlog client)

Une fois les moteurs stables : vocabulaire, navigation, écrans activés et tableaux de bord **propres à chaque public** (carte des parcours), écrans spécifiques restants (préparer mes études LY09, autonomie ET03, transition premier revenu JA01, plan du mois SA03, diagnostic épargne EP01…), et passages d'un parcours à l'autre (`P3-18`). Les écrans communs sont réutilisés par configuration, jamais recopiés.

**Réalisé (2026-10-14) :**

**La carte des parcours est GÉNÉRÉE depuis le classeur du client**, pas écrite à la main : `server/scripts/generate-journeys.py` lit l'onglet `19_Cartes_Parcours` et produit `src/constants/finJourneys.js` — 78 écrans, 8 parcours. Même méthode que les 91 catégories de `P6-02` : extrait par script, jamais retapé, parce qu'une ligne que personne n'a tapée est une ligne que personne n'a pu déformer. Cet onglet n'avait jamais été exploité et il contenait exactement ce que la tâche demandait.

- **Le vocabulaire est celui du client**, dans son ordre : « Ma semaine » (lycéen), « Mon mois » et « Autonomie » (étudiant), « Notre mois / Nos objectifs / Notre sécurité » (couple), « Aujourd'hui foyer » (famille). Avec le tableau de bord principal que le client nomme lui-même : « Parcours financier », « Santé financière étudiante », « Tableau de bord Premier Revenu », « Budget partagé », « Parcours d'épargne »…
- **Les écrans communs sont réutilisés par configuration, jamais recopiés** — l'exigence explicite de la tâche. Les « écrans spécifiques restants » qu'elle cite existaient déjà, dispersés : **LY09** « Préparer mes études » est le simulateur de `P4-10`, **ET03** « Autonomie » est la carte F047 du tableau de bord de `P6-06`, **JA01** « Transition premier revenu » est son tableau « Premier revenu », **SA03** « Plan du mois » est la copie de plan de `P6-07`, **EP01** « Diagnostic épargne » sont les questions EP01 de l'onboarding `P6-03`. Cette tâche les **rattache**, elle n'en reconstruit aucun.
- **`GET /fin/parcours`** publie la carte de l'appelant : tableau principal, navigation, et pour chaque écran s'il est servi, par quelle route, s'il est réservé aux adultes et s'il est autorisé. **`GET /fin/parcours/carte`** publie la carte entière — c'est la **matrice de provenance** que `P6-21` demande (onglet `18_Provenance`) : **71 écrans servis sur 78**, et les 7 autres disent ce qu'ils attendent plutôt que de manquer en silence (`C15` et `ET07` → `P4-14`, `JA09` → `P4-15`, `EP06` → instruments et prix à fournir, `LY03` → tâche abandonnée par le client, `LY11` → contenu à rédiger, `C22` → barre d'en-tête et non une route).
- **La navigation lit cette carte** au lieu d'une liste en dur de 25 entrées montrée à tout le monde. Si la carte ne peut pas être lue, **toutes** les entrées restent affichées : masquer sur échec réseau ferait passer un incident pour un produit plus petit, et le serveur refuse de toute façon ce qui doit l'être.

**Erreur d'interprétation reconnue le 2026-10-26 (Phase 8).** La carte des parcours a été appliquée comme une **liste d'accès** : selon le public, le menu montre 7 à 15 des 21 rubriques (« À plusieurs » invisible pour 5 publics sur 8, un colocataire sans « Aujourd'hui », réserve, dettes ni « Apprendre »). C'était le contraire de ce que voulait dire « masquer un écran est un confort » : on ne masquait pas un confort, on amputait le produit. Le client l'a vécu comme « beaucoup de compartiments sont absents ». Le filtrage par public est supprimé par `P8-02` (seul le filtre légal d'âge reste) et, selon le cahier consolidé du 2026-10-27, le profil ne règle plus que la couche éducative (`P8-17`). De même, « 71 écrans servis sur 78 » est exact en routes mais trompeur en pages : 21 de ces écrans partagent `/espaces` (voir `P8-21`).

**La garde 18+ est enfin appliquée.** `requireAdult` existait depuis `P3-18`, était testé, et **ne gardait aucune route** — la limite était déclarée sous `P3-18` (« il sera appliqué en même temps que les fonctions réservées aux adultes »). Ces fonctions existent depuis `P6-10`, `P6-11` et `P6-16`, donc c'est ici. Elle garde désormais `/debts`, `/patrimoine`, `/actifs` et `/financement`, **côté serveur** : un mineur ne pouvait pas seulement les voir dans le menu, il pouvait **créer une dette ou un patrimoine réel par l'API**.

**Le refus est devenu actionnable.** `requireAdult` refuse par défaut (tranche d'âge inconnue = traitée comme mineur), ce qui est la bonne direction pour une règle qui protège des mineurs. Mais il distingue maintenant les deux cas : `adultsOnly` pour un mineur, `ageUnknown` pour un adulte qui n'a simplement pas renseigné son profil. Sans cette distinction, le second cas est une porte fermée — c'est ainsi qu'une règle de protection devient un verrouillage.

**Tests :** 16 de sécurité (`tests/security/finJourney.test.js`), dont celui qui compte le plus — « un mineur garde **toute** route qui est la sienne ». Deux fixtures explicites ajoutées (`t.adult()`, `t.minor()`) ; `t.user()` reste **sans** tranche d'âge, parce que c'est ce à quoi ressemble un compte neuf et que rendre le fixture adulte par défaut aurait masqué la règle à tous les tests d'un coup.

**Défauts trouvés et corrigés :**
- **J'ai failli verrouiller les mineurs hors de leur propre argent.** `router.use(requireAdult)` dans un routeur monté sur `/fin` s'applique à **toutes** les routes `/fin/*` déclarées ensuite : réserve, calendrier, accueil, notifications, recherche, passeport. La route de parcours a répondu 403 et l'a révélé. La garde est maintenant liée à ses propres chemins (`router.use('/debts', requireAdult)`), et le test qui l'interdit est écrit.
- **Un composant utilisé sans import** dans `SpacesPage.jsx` (`Notice`), hérité d'une session précédente : la page plantait dès qu'aucune récurrence partagée n'était détectée. Trouvé par le linter, corrigé.
- **`POST /api/tools/comparator/adequation` répondait 400 au lieu de 401** à un appel anonyme : `P4-13` avait ajouté une route publique sans la déclarer dans l'audit d'autorisation. La route est bien publique par conception (le comparateur est `access: 'public'`, elle ne lit que des données publiques et n'écrit rien) ; c'est sa **déclaration** qui manquait. L'audit a fait exactement son travail.
- **Le client Prisma généré était désynchronisé du schéma**, pour la **deuxième fois** (déjà signalé sous `P6-05`) : `FinNotification`, `FinChild`, `FinSpaceGoal` et `FinSpaceProvision` existaient dans `schema.prisma` mais pas dans le client compilé, ce qui faisait échouer **20 tests** et plantait toutes les routes correspondantes. `npx prisma generate` corrige. À la deuxième occurrence, ce n'est plus un oubli mais un défaut de procédure : il mérite un garde-fou automatique plutôt qu'une note (proposé sous `P6-21`).

**Limites et réserves déclarées :**
- **L'interface ne propose pas encore « indiquez votre tranche d'âge »** quand le refus est `ageUnknown`. Le motif est publié par l'API et exploitable ; l'écran qui l'utilise reste à ajouter, et aucun compte existant n'a renseigné sa tranche d'âge.
- **Les 7 écrans non servis** attendent ce qui est déclaré dans la matrice de provenance, pas du développement : trois attendent des données du client, un est abandonné, un est du contenu à rédiger, un est une barre d'en-tête et non une route.
- **Le vocabulaire par public n'est pas traduit** : la navigation du client est en français dans le classeur, et c'est elle qui est servie. Les libellés anglais et arabes de ces entrées restent à écrire — traduire le vocabulaire d'un parcours est une décision éditoriale, pas une chaîne à deviner.
- **Pas de parcours navigateur dédié** à la carte (le balayage couvre les pages, et la navigation filtrée est exercée par chacune).

### P6-18 — FINCLUDIA : centre de notifications et alertes
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P6-04`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écran C24, onglet `14_Etats_Alertes`)

Liste chronologique avec lien vers l'écran concerné ; filtres (action, information, sécurité ; lu / non lu) ; priorité **sécurité > échéance > budget > apprentissage** ; quotas et anti-répétition ; désactivation par type ; **rappels uniquement sur consentement (opt-in)**. Canal in-app d'abord ; e-mail / push selon `P6-01`.

**Réalisé (2026-10-14) :** nouveau modèle `FinNotification` (+ `users.finNotificationSettings`), moteur générique, et trois déclencheurs réels câblés dans des tâches déjà construites.
- **Priorité réutilisée, pas redéfinie** : `NOTIFICATION_PRIORITIES` importe `ACTION_PRIORITIES` du tableau de bord (`P6-06`), qui porte déjà l'ordre exact du client — une seule liste, jamais deux qui pourraient diverger.
- **Catalogue fermé** (`constants/finNotification.js`) : chaque type porte sa catégorie (le filtre), sa priorité (le tri), s'il exige un consentement explicite, et s'il est activé par défaut. Rien n'est jamais du texte libre côté serveur : le texte affiché vient de `params` (des valeurs déjà visibles par leur propriétaire) interprétées par i18n côté client.
- **Anti-répétition à deux régimes** : une **escalade** (un seuil de budget qui monte) crée une nouvelle ligne — c'est une information neuve — tandis qu'un **fait ponctuel** (un objectif en retard) n'en crée qu'une seule, pour toujours, qu'elle ait été lue ou non.
- **Trois déclencheurs réels**, chacun ajouté à l'endroit où le signal existe déjà, sans toucher à la logique de calcul :
  - `budget_alert` dans la lecture d'un budget (`P6-05`) : un niveau d'alerte non « none » crée ou retrouve la notification de ce niveau.
  - `goal_overdue` dans la liste des objectifs (`P6-08`) : une date cible dépassée sans objectif atteint.
  - `sharing_changed` dans le changement de ma propre matrice de partage (`P6-13`) : notifie les **autres** membres de l'espace, jamais l'auteur du changement — exactement la phrase du client que `P6-13` avait déjà préparée.
  - `reminder_upcoming` (opt-in) généré à la lecture même de la liste de notifications, à partir du calendrier (`P6-07`, `loadCalendarData`) : ce site n'a pas de tâche planifiée en arrière-plan, donc une visite au centre de notifications est aussi ce qui le rafraîchit.
- **Désactivation par type et opt-in séparés** : `enabled` (activé/désactivé) et `optedIn` (consentement explicite) sont deux réglages distincts — un type qui exige un consentement reste bloqué même activé si le consentement n'a pas été donné, et inversement activé par défaut ne veut pas dire poussé sans consentement.
- **Interface** : page `/notifications` (filtres catégorie/lu, tri par priorité, tout marquer comme lu, paramètres par type) ; fr / en / ar.

**Tests :** 11 de sécurité (`tests/security/finNotification.test.js` : isolation entre comptes, tri par priorité, les trois déclencheurs réels, désactivation par type, opt-in des rappels, marquage lu/tout lu, 404 sur la notification d'un autre compte).

**Défaut trouvé et corrigé en chemin :** `z.record(z.enum(TYPES), schema)` refusait une requête qui ne nommait qu'**un seul** type à modifier, en réclamant les autres comme manquants — zod calque `Record<K, V>` de TypeScript, qui rend toutes les clés d'une énumération finie obligatoires. Remplacé par un objet explicite dont chaque clé est optionnelle.

**Limites et réserves déclarées :**
- **Catégorie « sécurité » sans déclencheur** : rien dans FINCLUDIA ne lève encore d'évènement de sécurité (connexion inhabituelle, etc.) — le filtre existe, le déclencheur non, plutôt que d'en inventer un.
- **`goal_milestone`** (jalon atteint) existe dans le catalogue mais n'est pas câblé : aucun seuil de jalon n'est défini par le client.
- **E-mail / push restent une réserve `P6-01`** : canal in-app seulement, comme le texte du client l'annonce lui-même en premier.
- **Pas de test unitaire/fonctionnel dédié, de scénario de cohérence globale ni de parcours navigateur.**

### P6-19 — FINCLUDIA : centre de confiance et de données
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-02`, `P3-18`
- Durée cible : 3 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écran C25)

Inventaire des données (origine, date, statut, usage autorisé), consentements (retrait qui bloque les usages dépendants), **export** des données, **suppression** selon la politique légale (expliquée quand une obligation de conservation l'empêche), appareils connectés, score de complétude (**jamais un score de solvabilité**) ; actions sensibles **réauthentifiées**. Lève le point « droit à l'effacement » resté ouvert en `P5-05`.

**Réalisé (2026-10-14) :**
- **L'inventaire réutilise `FINANCIAL_TABLES` (P6-02)** — le registre que le contrôle de cohérence lit déjà — plutôt qu'une seconde liste qui aurait pu diverger : pour chaque table, nombre de lignes vivantes, origines, statuts, usages consentis et fenêtre de collecte, lus directement depuis le socle que chaque tâche financière écrit déjà.
- **Le seul consentement dont le retrait bloque réellement un usage dépendant est le niveau de partage des revenus dans un espace** (P6-13/P6-14/P6-15) : le retirer depuis ce centre appelle la même fonction que le réglage de partage, avec une réauthentification en plus, et bloque aussitôt le partage proportionnel aux revenus (F042/F044) — vérifié par un test qui retire puis constate le blocage.
- **Export et suppression réauthentifiés** (`utils/reauth.js`, le même contrôle que le changement d'e-mail ou de mot de passe) : l'export télécharge le périmètre FINCLUDIA complet (profil + chaque table de `FINANCIAL_TABLES`, lignes entières, pas seulement les comptes) ; la suppression demande en plus de taper l'adresse e-mail du compte, une seconde preuve différente du mot de passe.
- **Suppression complète et immédiate, sans branche de conservation** : la décision du client (2026-10-11, `P6-01` point 9) dit qu'aucune durée de conservation n'existe dans cette plateforme — la politique affichée le dit tel quel plutôt que d'inventer une règle à expliquer. Les justificatifs sont effacés avant la ligne du compte (`eraseAccountReceipts`, déjà posé par `P6-04`) ; tout le reste part en cascade depuis `User`. **Lève le point ouvert de `P5-05`** : une suppression de compte en libre-service existe désormais.
- **Complétude mécanique, jamais un score de solvabilité** : six faits (public choisi, inscription terminée, revenu déclaré, budget créé, objectif créé, textes légaux acceptés), pas un jugement.
- **« Appareils connectés » honnêtement déclaré indisponible** : l'authentification de cette plateforme est un jeton signé sans état (cookie), il n'existe aucune table de sessions à lire — construire une vraie liste d'appareils est un chantier de suivi de session à part, pas quelque chose que cet écran peut inventer.
- **Interface** : page `/confiance` (inventaire, complétude, consentements avec retrait réauthentifié, appareils, export, suppression avec double confirmation) ; fr / en / ar.

**Tests :** 11 de sécurité (`tests/security/finTrust.test.js` : isolation entre comptes, export et suppression refusés sans mot de passe, suppression refusée si l'e-mail ne correspond pas, suppression effective et complète, retrait de partage qui bloque effectivement l'usage dépendant, complétude qui progresse avec les déclarations réelles).

**Limites et réserves déclarées :**
- **Appareils connectés** : fonctionnalité non construite, voir ci-dessus — nécessiterait un suivi de session dédié.
- **Pas de test unitaire/fonctionnel dédié, de scénario de cohérence globale ni de parcours navigateur.**

### P6-20 — FINCLUDIA : recherche globale
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P6-04`, `P6-08`, `P2-08`
- Durée cible : 2 jours (estimation)
- Origine : direction FINCLUDIA du 2026-10-09 (écran C22, onglet `12_Recherche`)

Une seule barre : écrans, actions, transactions, objectifs, contenus « Apprendre », offres autorisées ; résultats groupés (Actions, Mes données, Objectifs, Apprendre, Explorer) ; recherche lexicale + synonymes configurés, **aucune interprétation générative** ; données privées **strictement cloisonnées** (propriétaire / espace) ; aucun résultat → reformulations et catégories.

**Réalisé (2026-10-14) :**
- **« Actions » est purement local** (`client/src/config/searchScreens.js`) : une vingtaine d'écrans avec mots-clés, filtrés côté client, instantané, aucun appel réseau — cohérent avec le fait qu'un écran n'est pas une donnée privée.
- **« Mes données » et « Objectifs » interrogent le serveur**, strictement filtrés par `userId` (`GET /fin/recherche?q=`) : transactions (note, sous-catégorie), budgets, dettes, objectifs personnels — jamais les lignes partagées d'un espace, qui ont leur propre écran et leur propre vérification d'appartenance (`P6-14`) que ce fichier n'a aucune raison de dupliquer.
- **« Apprendre » réutilise la recherche publique déjà construite** (`P2-08`, `GET /apprendre?query=`) plutôt que de la reconstruire une seconde fois.
- **Synonymes configurés, dans les deux sens** (`constants/finSearch.js`) : chercher « dette » trouve une note écrite « crédit » et réciproquement — une liste déclarée comme la nôtre (le classeur du client demande des synonymes sans les nommer), à la manière de la liste des moyens de paiement.
- **Aucune interprétation générative** : chaque résultat vient d'un `contains` littéral sur le texte de la requête ou l'un de ses synonymes déclarés — jamais d'un modèle qui devine une intention.
- **« Explorer » honnêtement non branché** : le comparateur bancaire et les offres d'emploi existent déjà comme outils publics avec leurs propres règles d'accès ; les fusionner dans cette barre est une connexion à construire délibérément, pas à improviser dans cette tâche — l'API le dit explicitement (`notWiredYet`) plutôt que de renvoyer un tableau vide qui aurait l'air d'un résultat complet.
- **Interface** : barre dans l'en-tête (visible sur toutes les pages, seulement une fois connecté), panneau groupé par catégorie, aucun résultat → message explicite ; fr / en / ar.

**Tests :** 7 de sécurité (`tests/security/finSearch.test.js` : session requise, isolation entre comptes sur les transactions et les objectifs, correspondance littérale, expansion de synonyme dans les deux sens, requête vide sans résultat, « Explorer » déclaré non branché).

**Limites et réserves déclarées :**
- **« Explorer » (comparateur bancaire, offres d'emploi) non fusionné** dans cette barre, voir ci-dessus.
- **Les objectifs et dépenses communs d'un espace** (`P6-15`) ne sont pas cherchés ici : leur visibilité suit l'appartenance à l'espace, une règle que ce fichier ne duplique pas.
- **Pas de test unitaire/fonctionnel dédié, de scénario de cohérence globale ni de parcours navigateur.**

### P6-23 — FINCLUDIA : visualisations graphiques des tableaux de bord
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P6-04`, `P6-05`, `P6-06`, `P6-11`
- Durée cible : 3 jours (estimation)
- Origine : retour utilisateur du 2026-10-18 (« il n'a pas trouvé les schémas courbe et illustrations des différents chiffres et tableaux de bord »)

**Constat vérifié dans le code, pas supposé** : aucune bibliothèque de graphiques n'est installée (ni Recharts, ni Chart.js, ni D3 dans `client/package.json`) et aucune page n'affiche de courbe ou de graphique SVG. Les tableaux de bord actuels (`/aujourdhui`, `/mon-argent`, `/budget`, `/patrimoine`) affichent uniquement des chiffres en texte et des listes. Le retour du client est donc exact : il ne manque pas de les trouver, ils n'existent pas encore.

Non bloqué par le client : c'est un choix d'outillage et de maquette, pas une donnée à obtenir. À construire :
- Choisir une bibliothèque de graphiques (légère, accessible, compatible RTL) et l'ajouter aux dépendances.
- Répartition du budget par catégorie (camembert ou barres) sur `/budget` et `/budget/:id`.
- Évolution du patrimoine net dans le temps sur `/patrimoine` (à partir du journal de corrections déjà tenu par `P6-02`/`P6-11`, pas d'une nouvelle table).
- Courbe revenus/dépenses sur `/mon-argent` et le tableau de bord « Aujourd'hui » (`P6-06`), par public.
- **Règles à respecter, déjà posées par le projet** : jamais un total qui mélange réel et fictif (`P6-12`) sur le même graphique ; jamais la couleur seule pour porter un sens (règle d'accessibilité de `P1-12`) ; jetons CSS clair/sombre ; aucune valeur non calculable affichée comme un zéro silencieux sur un graphique.

**Réalisé en partie (2026-10-18) — premier chantier, la répartition du budget :**
- **Pas de bibliothèque ajoutée.** Une jauge SVG/CSS maison (`components/fincludia/BudgetMeter.jsx`) plutôt qu'une dépendance : la donnée à montrer (prévu vs réel d'une enveloppe, un seul ratio) ne justifie pas le poids d'une bibliothèque de graphiques, et un composant maison suit nativement les jetons CSS clair/sombre et les propriétés logiques (RTL) du reste du projet sans configuration supplémentaire. Une vraie bibliothèque reste à évaluer pour les chantiers plus complexes ci-dessous (courbes).
- **Jauge prévu/réel par enveloppe** sur `/budget/:id` (`BudgetDetailPage.jsx`) : la couleur suit le niveau d'alerte déjà existant (`none`/`warning`/`reached`/`exceeded`), mais le pourcentage exact est **toujours écrit en texte** à côté — jamais seulement la couleur — et toute la jauge porte un `aria-label` qui dit le montant réel, le montant prévu et le pourcentage, pour un lecteur d'écran.
- **Aucune donnée nouvelle requise** : `prevu`/`reel`/`alerte.niveau` existaient déjà dans la réponse de `/fin/budgets/:id`.

- **Répartition du budget entre enveloppes** (`components/fincludia/BudgetDistribution.jsx`) : une barre empilée au-dessus de la liste des enveloppes sur `/budget/:id`, largeur de chaque segment proportionnelle à son montant prévu, quatre teintes de la charte (bleu profond / sarcelle / océan / menthe, jetons déjà existants) plutôt qu'une couleur inventée. **Purement décorative** (`aria-hidden="true"`) : les chiffres qu'elle résume sont déjà lisibles juste en dessous, dans la liste des enveloppes elle-même — la barre n'introduit aucun fait que le texte ne porte pas déjà.

**Terminé le 2026-10-18 — deuxième chantier, l'évolution du patrimoine net :**
- **Toujours aucune bibliothèque ajoutée** : une courbe SVG maison (`components/fincludia/NetWorthChart.jsx`) plutôt qu'une dépendance, pour la même raison que la jauge de budget.
- **Nouveau point d'API, `GET /fin/patrimoine/historique`** (`finWealth.service.js:netWorthHistory`, routée dans `finWealth.routes.js`, même garde `requireAdult` que le reste de `/patrimoine`) : reconstruit le patrimoine net **à chaque jour où il a réellement bougé**, en relisant le journal de corrections (`fin_changes`) des actifs ET des dettes — jamais une nouvelle table recalculant les mêmes faits. Un actif archivé, supprimé, ou dans une autre devise que celle du compte cesse de compter à partir du moment où c'est le cas, exactement comme pour le chiffre affiché en direct (`buildWealthView`) : la courbe et le chiffre du jour ne peuvent jamais se contredire. Sans aucun mouvement réel, la série est **vide** — jamais un point à zéro fabriqué.
- **Tests** : 6 fonctionnels ajoutés (`tests/functional/finWealth.test.js`, bloc « P6-23 — net worth history ») : correction qui déplace la série, dette soustraite et non ajoutée, actif archivé qui arrête de compter, devise étrangère qui ne compte jamais, compte vide qui donne une série vide, isolation entre comptes. Un défaut trouvé en écrivant ces tests : un évènement qui ne change rien dans la devise ciblée (ex. un actif créé dans une autre devise) ajoutait quand même un point « plat » à la série — corrigé en ne poussant un point que si le total a réellement changé.
- **Interface** : `/patrimoine` affiche la courbe sous les chiffres principaux, avec un tableau des valeurs exactes replié par défaut (`<details>`) — le trait SVG est décoratif (`aria-hidden`), rien n'existe seulement comme une forme illisible à un lecteur d'écran.

**Terminé le 2026-10-18 — troisième et dernier chantier, la courbe revenus/dépenses :**
- **Nouveau point d'API, `GET /fin/argent/synthese/historique?months=`** (2 à 12, 6 par défaut) : relit la synthèse de chaque mois de la fenêtre avec les mêmes fonctions que la synthèse du mois courant déjà affichée (`loadSynthesisData` + `buildSynthesis`, `finSynthesis.service.js:monthlyMoneyHistory`) — jamais un second calcul qui pourrait diverger de ce que l'écran affiche déjà pour le mois en cours. Un mois résolu dans une autre devise que celle du compte répond `null` pour ce mois plutôt que de convertir ou de l'additionner en silence.
- **Interface** : `/mon-argent` affiche la courbe (deux traits — vert pour les revenus, teinte « océan » de la charte pour les dépenses, **jamais le rouge d'alerte** pour une dépense normale) sous les trois chiffres de synthèse ; légende textuelle, jamais la couleur seule ; même tableau replié que pour le patrimoine.
- **Tests** : 4 fonctionnels ajoutés (`tests/functional/finMoney.test.js`, bloc « the revenus/dépenses history »).

**Réserve déclarée :** l'aperçu par public sur « Aujourd'hui » (`P6-06`) ne reprend pas encore ces courbes — ce tableau de bord a sa propre mise en page par public et mériterait sa propre revue plutôt qu'un ajout mécanique ; à faire si le client le demande.

### P6-24 — FINCLUDIA : comptes financiers multiples et coordination des opérations
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-04`, `P6-11`, `P8-03`, `P8-05`

**Débloquée le 2026-10-27 : le client a choisi la réponse (a), et il a fourni les écrans et les champs.** Cahier consolidé, ARC-04 : « toute transaction réelle crédite ou débite exactement un compte ; un transfert produit deux mouvements liés atomiquement » ; onglets 07 (dix types de comptes), 07B (champs), 08 (transactions), COM-01 à COM-04 (écrans), QA-P01 à QA-P10 (contrôles). La mise en œuvre est découpée en `P8-03` (modèle et migration) et `P8-05` (écrans « Mes comptes ») ; cette tâche se ferme quand les deux le sont.

**Réalisé le 2026-10-27, fermée le 2026-10-28** : `P8-03` et `P8-05` sont terminées. Chaque transaction réelle débite ou crédite exactement un compte, le solde se recalcule depuis les mouvements, et un transfert entre deux comptes produit deux mouvements liés écrits ensemble. Le détail est dans ces deux tâches. La session du 2026-10-27 s'est arrêtée avant de fermer celle-ci. Le constat ci-dessous reste la raison d'être de ce travail.
- Durée cible : non estimable tant que le périmètre n'est pas défini
- Origine : retour utilisateur du 2026-10-18 (« je veux savoir si les comptes sont coordonnés, et qu'à chaque opération les comptes nécessaires seront impactés »)

**Constat vérifié dans le code :** `fin_assets` (`P6-11`) permet déjà de déclarer plusieurs comptes nommés librement (compte courant, compte épargne, CCP…), mais ce sont des **valorisations déclarées**, pas des comptes **opérationnels** : aucune table financière de la plateforme (`schema.prisma`) ne porte de colonne reliant une transaction, un revenu ou une dépense (`P6-04`) à un compte précis. Une dépense enregistrée dans « Mon argent » ne fait donc baisser le solde d'aucun compte particulier, et rien ne se répercute automatiquement d'un compte à un autre.

Ce qui bloque, concrètement :
- **Aucun écran ni champ du cahier des charges client ne décrit ce mécanisme.** `P6-04` (revenus/transactions) et `P6-11` (patrimoine) sont, dans la spécification du client, deux modules séparés et volontairement non reliés par une clé technique — relier les transactions à un compte serait une extension du modèle de données, pas une implémentation de ce qui est déjà spécifié.
- **La question a deux réponses possibles, très différentes à construire**, et seul le client peut choisir : (a) chaque dépense/revenu désigne un compte, et le solde de ce compte se recalcule à partir de son historique de mouvements — ce qui change `fin_transactions` et la façon dont `P6-04` calcule ses totaux ; ou (b) ce que la plateforme fait déjà (comptes déclarés dans le patrimoine, chiffres de budget et de trésorerie séparés) suffit, et seule la pédagogie ou la présentation doit mieux l'expliquer.
- **Un virement entre deux comptes propres** (ex. compte courant → compte épargne) n'a pas de concept existant : ni une dépense, ni un revenu, ni un objectif ne le modélisent aujourd'hui.

**Ce qu'il faut obtenir pour débloquer :** confirmation du client sur le comportement attendu (solution (a) ou (b) ci-dessus), et si (a), les écrans/champs précis — c'est exactement le genre de règle que ce projet ne construit jamais sans une source qui la décrit.

### P6-21 — FINCLUDIA : validation de fin de phase
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-03`, `P6-06`, `P6-07`, `P6-12`, `P6-15`, `P6-16`, `P6-17`, `P6-19`, `P6-20`, `P6-22`, `P4-13`, `P4-14`, `P4-15`, `P4-16`, `P3-19`
- Durée cible : 2 jours (estimation)

- Dépendance à `P2-10` retirée le 2026-10-14 : elle n'est pas une réserve en attente du client comme les autres, mais une tâche **abandonnée** par décision du client (2026-10-11, voir `P2-10`) — la laisser dans cette liste bloquerait la clôture de la Phase 6 sur un module que personne ne demande plus. Si elle est un jour reprise, elle sera réévaluée pour cette liste à ce moment-là.
- Dépendance à `P6-22` ajoutée le 2026-10-17 : les données reçues ce jour-là ne servent à rien pour la recette tant qu'elles ne sont pas implémentées.

Critères :
- Les 10 parcours de bout en bout (J01 à J10, onglet `02_Parcours_E2E`) passent en navigateur pour chaque public concerné.
- Chaque formule a son test unitaire avec les exemples du client (onglet `16_QA_Tests`).
- Aucune donnée privée visible hors de son propriétaire ou de son espace (audit de sécurité automatique + tests dédiés).
- Aucun total ne mélange réel et fictif ; aucune valeur non calculable affichée à 0.
- Matrice de provenance (onglet `18_Provenance`) : chaque écran livré est rattaché à sa ligne source.

**Recette exécutée le 2026-10-14 — la tâche reste `❌ todo`, et pourquoi.**

`P6-21` ne peut pas être déclarée terminée : deux de ses dépendances, `P4-14` (décodeur de fiche de paie) et `P4-15` (comparer un financement), restaient `⛔ blocked` sur des **données que le client doit fournir** — barèmes de paie datés, offres de financement. **Mise à jour du 2026-10-17** : ces données sont reçues (voir `P6-01` point 6, `P6-22`) et les deux tâches sont repassées `❌ todo` — mais ni l'une ni l'autre n'est encore implémentée, donc `P6-21` reste tout autant hors de portée, pour une raison différente (du travail restant, plus un blocage client). Les critères qui **ne dépendent pas** d'elles ont en revanche été exécutés, et voici leur état.

**Critère « aucune donnée privée visible hors de son propriétaire ou de son espace » — tenu.** Audit d'autorisation automatique (`tests/security/authorization.test.js`) : toute route non déclarée publique répond 401 à un appel anonyme, toute route d'administration répond 403 à un compte standard, et le préfixe d'administration n'est joignable par aucune autre orthographe. Plus les suites dédiées : espaces partagés (24 tests sur la matrice de permissions), patrimoine, dettes, calendrier, portefeuille fictif, parcours.

**Critère « aucun total ne mélange réel et fictif ; aucune valeur non calculable affichée à 0 » — tenu, et c'est ce critère qui a trouvé un défaut.** La grille de calcul du client (onglet `16_QA_Tests`, section « Test calcul ») est désormais un fichier de tests à elle seule : `tests/unit/finQaGrid.test.js`, **41 tests**, un `describe` par cas du client et dans son ordre — cas nominal, dénominateur nul, valeur manquante, valeur extrême, devise différente, donnée ancienne, réel/fictif, permissions. Ces huit cas sont des règles **transversales** : chaque formule avait déjà son test, et ce que personne ne vérifiait, c'est que le catalogue entier obéit à la grille.

**Critère « chaque formule a son test unitaire » — tenu** : le test vérifie aussi que les **57 formules** du catalogue sont toutes implémentées et appelables, dans les deux sens.

**Critère « matrice de provenance (onglet `18_Provenance`) » — tenu depuis `P6-17`** : `GET /fin/parcours/carte` rattache chacun des **78 écrans** du client soit à la route servie, soit à ce qu'il attend. **71 servis sur 78.**

**Critère « les 10 parcours de bout en bout J01 à J10 passent en navigateur » — tenu.** `tests/e2e/fin-j01-j10-journey.test.js`, **10 parcours, 10 réussis** : un test par chaîne fonctionnelle de l'onglet `02_Parcours_E2E`, dans l'ordre du client. `J01` entrer dans FINCLUDIA, `J02` construire mon budget, `J03` créer un objectif, `J04` renforcer ma sécurité, `J05` comprendre une dette, `J06` préparer un financement, `J07` construire mon patrimoine, `J08` apprendre à investir, `J09` gérer à plusieurs, `J10` préparer une dépense annuelle.

Les données sont posées par l'API (rapide et sans ambiguïté) ; ce que le navigateur prouve, c'est que **les écrans de la chaîne s'affichent et portent la figure dont la chaîne parle**. Deux parcours vérifient en plus une règle du client **à l'écran** : `J07` que la page de patrimoine dit qu'aucune valeur fictive n'y entre, et `J08` que le portefeuille d'entraînement porte le badge SIMULATION tout en restant **absent** du patrimoine réel.

**Et ce fichier a lui-même failli ne rien prouver.** `b.hasText(x)` du pilote de navigateur ne renvoie pas un booléen mais **la chaîne de l'expression** à évaluer : écrit `assert.ok(await b.hasText(x))`, il affirme qu'une chaîne non vide est vraie, ce qui l'est toujours. Vingt assertions étaient donc vraies par construction, et le premier verdict « 9 verts sur 10 » ne valait rien. Le seul échec était, ironiquement, la seule assertion qui testait quelque chose (un `!hasText`, donc `!"chaîne"`). Corrigé par deux helpers dont le nom rend l'oubli impossible, `shows()` et `hides()`, qui évaluent l'expression — et par la vérification que l'échec de `J08` ne cachait **pas** une vraie fuite (l'API du patrimoine ne contient pas le support fictif, et le patrimoine net y est bien `null`).

**Reste pour clore la tâche :** les huit scénarios par public de l'onglet QA (lycéen, étudiant, jeune actif, salarié, colocation, couple, famille, épargnant) n'ont pas de parcours navigateur dédié — ils recoupent largement les dix chaînes ci-dessus, mais pas exactement. Et `P4-14`, `P4-15` (désormais `❌ todo`, données reçues le 2026-10-17) ainsi que `P6-22` restent la vraie raison pour laquelle cette tâche n'est pas `✅ done` : il reste à les implémenter.

**Défauts trouvés par la recette et corrigés :**
- **Le total réel valait 0 au lieu de « non calculé »** sur un ensemble vide (`totalsByReality`, `services/finance/dataModel.js`). L'asymétrie était parlante : le total **fictif** était protégé par `fictional.length === 0 ? null : …`, le total **réel** ne l'était pas. Conséquence concrète : un espace partagé dont la seule ligne avait un statut illisible affichait « 0 » comme revenu partagé d'un membre — ce qui se lit « cette personne n'a rien », alors que nous n'avions simplement pas pu classer sa ligne. C'est exactement le défaut que la grille du client existe pour attraper.
- **Le client Prisma généré était désynchronisé du schéma**, pour la **deuxième fois** (voir aussi `P6-05` et `P6-17`) : **20 tests** en échec et toutes les routes de notifications, enfants, objectifs partagés et provisions partagées en panne à l'exécution. Détail et recommandation sous `P6-17`.
- **Une route publique non déclarée dans l'audit** (`POST /api/tools/comparator/adequation`, ajoutée par `P4-13`) : elle répondait 400 au lieu de 401 à un appel anonyme. L'audit a fait son travail ; c'était la déclaration qui manquait, pas la garde.

**Le garde-fou recommandé est en place.** `tests/setup.js` compare désormais les modèles de `prisma/schema.prisma` à ceux du schéma **embarqué dans le client généré** (`inlineSchema`, donc exact et sans base de données) et s'arrête en nommant les modèles manquants avec « Lancez : npx prisma generate ». Vérifié dans les deux sens : il passe en phase, il échoue avec le bon message dès qu'un modèle est ajouté au schéma sans régénérer. Le défaut qui a coûté deux sessions ne peut plus se présenter comme vingt erreurs `Cannot read properties of undefined`.

**L'écran du refus réservé aux adultes est livré** : `components/fincludia/AdultOnly.jsx`, branché sur les pages dettes, patrimoine et financement, distingue les deux motifs que le serveur distingue (`adultsOnly` → rien à corriger ; `ageUnknown` → « il manque votre tranche d'âge », avec le lien vers le profil), en fr / en / ar. Sans cela, un adulte au profil incomplet n'avait qu'une porte fermée.

**Mise à jour du 2026-10-18 — les deux vraies raisons de blocage sont levées.** `P4-14`, `P4-15` et `P6-22` sont maintenant `✅ done` (voir chacune). Une relance complète (`npm test`, 1792 tests) a trouvé deux défauts réels, corrigés le même jour : la migration `20261017090000_adult_age_19` (`P6-22`) n'avait jamais été appliquée à la base de développement (corrigé par `prisma migrate deploy`), et la matrice de recette ne listait pas encore `P7-03`/`P7-04`/`P7-05` (corrigé par `npm run deliverables`). Le seul échec restant connu (`P5-07` « en cours » dépend de `P5-06` « à faire ») est antérieur à cette session, sans lien avec `P6-21`, et concerne deux tâches de Phase 5.

**Réalisé le 2026-10-18 — le dernier critère réel.** Les huit scénarios par public de l'onglet QA (lycéen, étudiant, jeune actif, salarié, colocataire, couple, famille, épargnant débutant) ont maintenant leur parcours navigateur dédié : `tests/e2e/fin-qa-publics-journey.test.js`, **8 parcours, 8 réussis** du premier coup. Délibérément **pas** une onzième répétition des chaînes J01-J10 : ce fichier teste l'autre axe, celui du PUBLIC plutôt que de la chaîne fonctionnelle — pour chacun des 8, un compte est créé avec ce public (et, pour le seul public qui peut être mineur, le lycéen, une tranche d'âge qui l'est réellement), puis l'écran « Aujourd'hui » est ouvert et son sous-titre est vérifié contre le texte **propre à ce public** (`finDashboard.js`, `P6-06`) — jamais le texte par défaut, qui révélerait un embranchement tombé en silence sur le cas générique.

**Limite reconnue le 2026-10-26 (Phase 8) :** ces parcours ouvrent chaque écran **par son adresse** ; ils prouvent qu'il s'affiche, pas qu'on peut le trouver depuis le menu. C'est exactement le trou par lequel le défaut « compartiments absents » est passé. Un critère « trouvable depuis la navigation » est ajouté aux critères de qualité (section 6), et appliqué par `P8-21` et `P9-12`.

**Ce que ce fichier ne vérifie délibérément pas** : qu'un écran hors de la carte des parcours d'un public lui est **inaccessible**. `finNavigation.js` le dit lui-même dans son propre commentaire — masquer une route du menu est un confort, jamais la protection ; la garde réelle est `requireAdult` côté API, déjà couverte par les suites de sécurité. Un test qui affirmerait un 404 sur une route que le code ne protège pas affirmerait quelque chose que le produit n'a jamais promis.

### Impact sur le délai (FINCLUDIA, ajout du 2026-10-09)

FINCLUDIA **n'était pas dans le plan de 8 semaines** et représente un produit nettement plus grand que le MVP actuel. Estimation grossière, tâche par tâche (tests compris, **hors temps de décision du client**) :
- prolongements des modules existants : `P1-12` 3 j, `P2-08` à `P2-10` 6 j, `P3-18` et `P3-19` 5 j, `P4-09` à `P4-16` 18 j (dont `P4-09` fait) ;
- nouveaux modules `P6-02` à `P6-21` : environ 56 j.

Soit **environ 86 jours ouvrés, de l'ordre de 4 mois** pour une personne, en plus de ce qui reste du MVP (paiement, simulateur de crédit, facture, Phase 5). Pistes pour livrer plus tôt : commencer par 2 ou 3 publics, livrer les lots 0 à 2 du backlog client (argent, budget, objectifs, réserve, dettes) avant le reste, garder espaces partagés et portefeuille fictif pour une seconde livraison. **Le client doit arbitrer (`P6-01`).**

---

# PHASE 7 — PÉRIMÈTRE CONTRACTUEL NON COUVERT
## Durée : non estimable en l'état
## Objectif

Signaler, sans l'engager, la partie du périmètre que le contrat annonce et que ce plan ne couvre pas. Cette phase n'est pas un planning : c'est une alerte de périmètre.

### P7-01 — ERP entreprises, diaspora et commerce international
- Statut : `⛔ blocked`
- **Décision du client (2026-10-16) : oui, cette partie est demandée.** Le socle qui ne dépend d'aucun référentiel comptable est livré (`P7-02`) ; ce qui reste bloqué ici est tout ce qui en dépend — états financiers, TVA, amortissements, stock — et le volet diaspora / commerce international, pour lequel aucun cahier des charges n'a été fourni.
- Priorité : `🔴 high`
- Dépendances : `P6-01`
- Durée cible : non estimable tant que le périmètre n'est pas défini
- Origine : « FINCLUDIA contrat.docx », Annexe 1 « Fonctionnalités principales », reçu le 2026-10-16

L'Annexe 1 du contrat annonce, **au-delà** de la gestion de budget des particuliers :
- un **ERP** pour entreprises, PME, PMI, micro-entreprises, startupeurs, auto-entrepreneurs, micro-importateurs et professions libérales, avec **tableaux de bord et états financiers** ;
- un volet **diaspora et commerce international** ;
- un cahier des charges « détaillé produit par produit et réparti selon le public cible ».

La charte graphique le confirme de son côté : ses publics incluent « indépendants + entrepreneurs + startups + PME/PMI, commerce international et diaspora ».

**Rien de cela n'existe dans ce plan, et il ne faut pas faire semblant du contraire.** Les Phases 1 à 6 livrent une plateforme d'éducation financière, un blog, des outils publics et FINCLUDIA pour les **particuliers** (8 publics, tous personnels). Un ERP avec états financiers — comptabilité, facturation, immobilisations, TVA, bilan et compte de résultat — est un autre produit, avec d'autres obligations légales et fiscales.

Ce qui bloque, concrètement :
- **Le cahier des charges « produit par produit » n'a pas été fourni** pour cette partie. Le classeur `FINCLUDIA_Cahier_des_Charges_Complet.xlsx` reçu couvre les parcours **personnels** ; aucun onglet ne décrit un ERP.
- Des **états financiers** supposent un référentiel comptable daté (plan comptable algérien, règles de TVA, obligations déclaratives). C'est précisément la catégorie d'information que ce projet n'invente jamais — comme les barèmes de paie de `P4-14` et les offres de financement de `P4-15`.
- L'Annexe 1 est marquée « à compléter avant signature » et ses autres lignes (front-end, back-end, base, administration, hébergement, sécurité, documentation, mise en production) sont **vides**.

Décision attendue du client, et c'est une question de périmètre, pas de calendrier :
1. Cette partie fait-elle partie de la **même** livraison que les Phases 1 à 6, ou d'un contrat ultérieur ?
2. Si elle en fait partie, le montant, le délai et l'Annexe 1 doivent être revus — l'article 4 du contrat prévoit exactement cela : « une modification substantielle fait l'objet d'une validation écrite précisant l'impact sur le prix, le délai et le périmètre ».
3. Si elle n'en fait pas partie, l'Annexe 1 doit le dire, sinon la livraison finale sera jugée incomplète au regard de son propre texte.

Tant que ce point n'est pas tranché, **aucune ligne de code ne doit être écrite pour cette partie** : commencer un ERP sans son cahier des charges produirait exactement le genre de travail qu'il faudrait jeter.

**Mise à jour du 2026-10-16.** Le client confirme la demande. La ligne de partage retenue, et elle est nette :

- **Ce qui ne dépend d'aucune norme est livré** (`P7-02`) : des tiers, des documents de vente et d'achat tels qu'ils ont été émis ou reçus, les règlements qui les soldent, et un tableau de bord de **trésorerie**. « Qui me doit quoi, qu'est-ce que je dois, combien est réellement entré ce mois-ci » sont des faits, pas des conventions comptables.
- **Ce qui suppose une norme reste bloqué ici** : bilan, compte de résultat, déclaration de TVA, amortissements, stocks. Ils supposent le **Système Comptable Financier algérien** et des règles fiscales datées. Ils sont **nommés dans le produit**, chacun avec ce qui lui manque, plutôt que tus — un écran muet se lit comme une fonction oubliée.
- **Le volet diaspora et commerce international reste entier** : aucun onglet du cahier des charges ne le décrit, et il ne se devine pas.

**Ce qu'il faut obtenir pour débloquer la suite :** le plan comptable et les règles de présentation applicables, le régime d'imposition et les taux de TVA datés, les durées et modes d'amortissement admis, la méthode de valorisation des stocks — et le cahier des charges « produit par produit » que l'annexe 1 annonce pour cette partie.

**Éclaté en tâches suivies séparément le 2026-10-18**, pour que chaque blocage reste traçable individuellement plutôt que noyé dans une seule tâche : `P7-03` (déclinaison par segment : PME/PMI, start-up, micro-entreprise, auto-entrepreneur, micro-importateur, profession libérale), `P7-04` (états financiers réglementaires), `P7-05` (diaspora et commerce international). Cette tâche (`P7-01`) reste l'alerte de périmètre globale ; `P7-02` reste le seul lot livré.

### P7-02 — Espace entreprise : socle de trésorerie (tiers, ventes, achats, règlements)
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-02`
- Durée cible : 4 jours (estimation)
- Origine : contrat, annexe 1 « Fonctionnalités principales » ; décision du client du 2026-10-16

`P7-01` est l'**origine** de cette tâche, pas son prérequis : elle restera `⛔ blocked` tant que les états comptables n'auront pas leur référentiel, et attendre qu'elle soit terminée aurait bloqué tout l'espace entreprise sur la partie qu'on ne peut justement pas construire.

Le premier lot de l'ERP : **tout ce qui se calcule sans référentiel comptable**, et rien d'autre.

**Réalisé (2026-10-16) :**

- **Modèle** : `FinBusiness` (une entreprise par compte), `FinBusinessContact` (clients et fournisseurs), `FinBusinessDocument` (ventes et achats), `FinBusinessPayment` (règlements). Migration `20261016120000_fin_business`, **17 CHECK**, socle de métadonnées de `P6-02` sur chaque table qui porte un montant. Les quatre tables sont **déclarées dans `FINANCIAL_TABLES` le jour même** — les objectifs et les dettes y avaient été oubliés et n'étaient parcourus par aucun contrôle de cohérence, défaut trouvé seulement en `P6-21`.
- **Dix chiffres**, `E001` à `E010`, dans **leur propre catalogue** : le catalogue `F001`-`F057` est celui du classeur du client, et y glisser des identifiants de notre fait le rendrait impossible à relire face à sa source. Ils passent par le même contrat de moteur (formule, version, entrées, date) que tous les autres.
- **Tableau de bord de trésorerie** : encaissements, décaissements, solde, créances clients, dettes fournisseurs, échu non réglé **avec la liste des documents qui le composent** (un montant échu sans le détail n'est pas actionnable), et délai moyen de règlement.
- **Page `/entreprise`**, réservée aux majeurs, avec la garde **liée à son chemin** : un `router.use(requireAdult)` sans chemin aurait refusé toutes les routes `/fin/*` déclarées ensuite, le défaut qui avait enfermé les mineurs hors de leur propre argent en `P6-17`. Un test vérifie le **sur-refus**, pas seulement le refus.
- **Dixième entrée de menu**, ajoutée **après** les neuf du client et déclarée comme nôtre (`EXTRA_ROUTES`, origine « contrat, annexe 1 ») : `SCREEN_ROUTES` est généré depuis le classeur des parcours, et y ajouter un écran de notre fait corromprait la matrice de provenance de `P6-21`.
- **Tests** : 26 unitaires, 18 de sécurité. Verts du premier coup.

### P7-03 — Espace entreprise : déclinaison par segment (PME/PMI, start-up, micro-entreprise, auto-entrepreneur, micro-importateur, profession libérale)
- Statut : `⛔ blocked`
- Priorité : `🔴 high`
- Dépendances : `P7-01`, `P7-02`
- Durée cible : non estimable tant que le périmètre n'est pas défini
- Origine : demande du 2026-10-18 (confirmée sur `P7-01`, contrat annexe 1) ; décision du client du 2026-10-16 que cette partie est bien demandée

Le socle livré par `P7-02` (tiers, documents de vente/achat, règlements, trésorerie) est **générique** : il traite une entreprise comme une entreprise, sans distinguer une PME d'un auto-entrepreneur. Le contrat et la charte nomment pourtant des publics **distincts** : PME, PMI, start-up, micro-entreprise, auto-entrepreneur, micro-importateur, profession libérale — chacun avec vraisemblablement ses propres statuts juridiques, obligations déclaratives, seuils et besoins de tableau de bord (ex. un micro-importateur suit des opérations de douane et de change qu'un cabinet libéral n'a pas).

Ce qui bloque, concrètement :
- **Aucun cahier des charges « produit par produit » par segment n'a été fourni** — l'annexe 1 l'annonce mais ne le détaille pas, et le classeur `FINCLUDIA_Cahier_des_Charges_Complet.xlsx` reçu ne couvre que les 8 publics **personnels**.
- Sans ce document, il n'y a **aucun écran, aucun champ et aucun calcul propre à un segment** qui puisse être construit sans être inventé — même règle que `P4-14`/`P4-15`/`P6-01` : ce projet ne fabrique pas un barème ou une règle métier qui n'existe pas dans une source.
- Le **statut juridique de chaque segment** (seuils de chiffre d'affaires, régime fiscal applicable) doit être confirmé avant de décider si un compte déclare un segment librement ou si des règles de seuil s'appliquent.

**Ce qu'il faut obtenir pour débloquer :** le cahier des charges détaillé par segment (écrans, champs, calculs attendus pour chacun des six profils cités), et la liste des statuts/seuils qui les distinguent légalement.

### P7-04 — Espace entreprise : états financiers réglementaires (bilan, compte de résultat, TVA, amortissements, stocks)
- Statut : `⛔ blocked`
- Priorité : `🔴 high`
- Dépendances : `P7-01`, `P7-02`
- Durée cible : non estimable tant que le référentiel n'est pas fourni
- Origine : contrat, annexe 1 « Fonctionnalités principales » ; isolé de `P7-01` le 2026-10-18 pour suivi individuel

Extrait de `P7-01` en tâche propre, pour qu'il reste traçable séparément de la question des segments (`P7-03`) et de celle de la diaspora (`P7-05`). Ce que `P7-02` livre (trésorerie, créances, dettes) ne suppose aucune convention comptable ; un bilan et un compte de résultat en supposent une, datée et officielle.

Ce qui bloque, concrètement, et c'est resté identique depuis le 2026-10-16 :
- Le **plan comptable et les règles de présentation** du Système Comptable Financier algérien applicables à chaque segment.
- Le **régime d'imposition et les taux de TVA datés**.
- Les **durées et modes d'amortissement admis**.
- La **méthode de valorisation des stocks**.

**Ce qu'il faut obtenir pour débloquer :** ces quatre référentiels, fournis ou validés par le client — jamais composés ici, pour la même raison que les barèmes de paie (`P4-14`) ou les offres de financement (`P4-15`) ne le sont pas.

### P7-05 — Diaspora et commerce international
- Statut : `⛔ blocked`
- Priorité : `🟡 medium`
- Dépendances : `P7-01`
- Durée cible : non estimable tant que le périmètre n'est pas défini
- Origine : contrat, annexe 1 « Fonctionnalités principales » ; charte graphique (ses publics incluent « commerce international et diaspora ») ; isolé de `P7-01` le 2026-10-18

Volet entier, cité deux fois par le client (contrat et charte) sans qu'aucun écran, champ ou calcul ne soit décrit nulle part. Contrairement à `P7-03` et `P7-04`, ce n'est même pas une extension d'un module existant : rien dans `P7-02` ne couvre une opération en devise étrangère, un transfert international ou un besoin propre à un compte à l'étranger.

Ce qui bloque, concrètement :
- **Aucun cahier des charges** ne décrit ce volet — pas un onglet du classeur reçu, pas une ligne de l'annexe 1 au-delà de la mention de son existence.
- **Ce que « diaspora » doit couvrir n'est pas défini** : un espace dédié aux Algériens résidant à l'étranger (épargne, transferts, investissement au pays) ? Des règles de change réglementées ? Les deux ?
- **Ce que « commerce international » doit couvrir n'est pas défini** : import/export documentaire, douane, lettres de crédit — chacun est un domaine réglementé qui suppose ses propres règles, datées et officielles.

**Ce qu'il faut obtenir pour débloquer :** une définition écrite du périmètre attendu pour chacun des deux volets, puis le cahier des charges produit par produit comme pour le reste de la Phase 7.

**Les règles qui ne pouvaient pas être des contraintes SQL**, et où elles vivent :
- « un règlement est dans la devise de son document » référence une colonne de clé étrangère — MariaDB refuse (erreur 1901) : service + test de sécurité ;
- « la somme des règlements ne dépasse pas le total » traverse plusieurs lignes : service. Le trop-perçu est **refusé**, pas toléré : il vient presque toujours d'une saisie en double, et le laisser passer fausse les créances sans que personne ne le voie. Un vrai trop-perçu se traite par un avoir, c'est-à-dire par un document ;
- « une vente va à un client, un achat à un fournisseur » : sans elle, le total des créances clients compterait des fournisseurs.

**Décisions qui méritent d'être lues :**
- **Aucun taux de TVA n'est appliqué nulle part.** Hors taxe et taxe sont **saisis tous les deux**, parce que le taux appartient au document réel. Un test interdit qu'une formule du module calcule une taxe.
- **L'état de règlement d'un document est toujours DÉDUIT**, jamais stocké : un document qu'on peut marquer « payé » à la main ment dès que quelqu'un se trompe.
- **Un document sans échéance n'est jamais en retard.** Beaucoup n'en portent pas ; les traiter comme échus transformerait une absence d'information en dette exigible.
- **Le délai moyen ne compte que les documents soldés.** Inclure les documents en cours avec leur délai écoulé ferait baisser la moyenne à chaque facture émise : un indicateur qui s'améliore quand on facture davantage ne mesure rien.
- **Les identifiants fiscaux (NIF, RC, NIS) ne sont pas validés par un format.** Nous n'avons pas la règle officielle de composition, et un format inventé refuserait des entreprises réelles.

**Limite déclarée, et elle est centrale :** cet espace ne produit **ni bilan, ni compte de résultat, ni déclaration de TVA, ni amortissements, ni état de stock**. Ces cinq états sont nommés dans l'API et à l'écran, chacun avec ce qui lui manque. Un compte de résultat inventé serait faux **et** présenté comme comptable : c'est la faute la plus coûteuse que ce module pourrait commettre, et elle est interdite par construction.

---

# PHASE 8 — GESTION BUDGÉTAIRE CONSOLIDÉE : UN SEUL MOTEUR POUR TOUS
## Durée : hors des 8 semaines (estimation dans « Impact sur le délai (Phases 8 et 9) » en fin de Phase 9)
## Objectif

Rendre l'application personnelle **conforme à la vision du client**, telle qu'il l'a écrite dans deux envois :

- **2026-10-26** — `FINCLUDIA_Partage_Gestion_Collective_Depenses_Taches.xlsx` et ce message : « je ne me suis pas retrouvé dans la partie budget […] beaucoup de compartiments sont absents […] une seule page qui donnait à l'ensemble des solutions […] chaque solution doit donner à sa propre page et ses tableaux de bord ». La gestion collective devient une solution distincte : **Phase 9**.
- **2026-10-27** — `FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx` (40 onglets : 44 écrans, 125 catégories, 69 formules, 32 calculateurs, 35 contrôles) **et** `FINCLUDIA_Cahier_des_Charges_Complet (1).xlsx`, l'ancien cahier renvoyé par le client avec ses surlignages. Ses mots : « le travail que tu as effectué sur la solution est bien. Cependant des modifications doivent être apportées sur le fond et sur la forme […] la gestion budgétaire doit donner à une fenêtre distincte de la vitrine du site. Elle devrait avoir son tableau de bord distinct centralisé et devrait aussi centraliser les solutions » ; « ce document contient ce qui n'a pas été implémenté ou bien mal implémenté » ; « **il ne s'agit pas de supprimer ce qui a été fait** mais dans un premier temps de revoir l'ancien cahier des charges avec les fonctionnalités qui ont été ratées, ensuite actualiser, aménager et apporter plus de finesse aux solutions déjà existantes ». Il signale aussi, oralement, des **erreurs dans les calculs** et une **mauvaise séparation des sections**.

**Pour la gestion personnelle, le cahier consolidé fait foi** ; l'ancien cahier complet reste la référence pour tout ce que le consolidé ne redit pas.

**Les documents de référence, tels que le client les a listés le 2026-10-28** :
1. **le premier cahier des charges** — `FINCLUDIA_Cahier_des_Charges_Complet.xlsx` (et sa version annotée « (1) ») : le socle, et la référence de tout ce que les autres ne redisent pas ;
2. **le document des dépenses collectives, à faire à part** — `FINCLUDIA_Partage_Gestion_Collective_Depenses_Taches.xlsx` : la gestion commune (Phase 9) ;
3. **le document de la gestion budgétaire spécifique** — `FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx` : écrans, champs, catégories, contrôles ;
4. **le document central de la gestion budgétaire, qui retrace l’ensemble des parcours** — `FINCLUDIA_Gestion_Budgetaire_Personnelle_Centralisee.xlsx` : règles de calcul définitives (PB-F001 à PB-F027) et premier démarrage ;
5. **le référentiel maître** — `FINCLUDIA_REFERENTIEL_MAITRE_EXCEL_BLOCAGES_AZIZ.xlsx` : produits bancaires (25 fiches de crédit, périmètre du comparateur), pondérations (identiques à celles validées le 2026-10-28, sauf « stabilité des revenus », remplacée par « budgets » sur décision du client) et passeport financier ; avec les classeurs du comparateur (`Tableaux_conditions_bancaires_mise_en_forme.xlsx`, `Conditions_bancaires_par_thematiques_et_segments.xlsx`) et d’Algérie Poste (`FINCLUDIA_ALGERIE_POSTE_CCP_REFERENTIEL_COMPARATEUR.xlsx`).

**Troisième envoi, le 2026-10-27** — `FINCLUDIA_Gestion_Budgetaire_Personnelle_Centralisee.xlsx` (27 onglets), avec ce message : « voici pour comprendre les calculs et formules. L'ensemble des calculs sont inspirés du premier cahier des charges […] lorsque j'ai scindé la gestion des parties collectives de la gestion budgétaire, j'ai repensé l'architecture et en même temps j'ai apporté des éclaircissements pour la gestion budgétaire consolidée. » C'est la source des formules PB-F001 à PB-F027 (onglet `13_Formules`, « règles de calcul définitives »), des 17 calculateurs CAL-P01 à CAL-P17, du parcours de premier démarrage (P0 à P7) et des principes PB-PR-01 à PB-PR-10. **Ordre de priorité entre les sources** : ce fichier pour les calculs et la gestion budgétaire qu'il détaille ; puis le cahier consolidé ; puis l'ancien cahier complet. Consigne de l'utilisateur (2026-10-27) : conformité absolue à cette vision ; planification dans ce fichier d'abord, implémentation dans un second temps.

**Historique de cette phase.** Ouverte le 2026-10-26 sous le titre « Trois solutions distinctes et clarté des parcours », elle a été **réécrite en entier le 2026-10-27**. Le cahier consolidé répond à plusieurs questions que l'on posait alors au client, et il **corrige une de nos propositions** : il n'y aura pas de hub « Mes solutions » donnant trois solutions égales. L'application personnelle **est** la fenêtre centrale, distincte de la vitrine : elle ouvre sur son Accueil et centralise formation, outils et santé financière ; seule la gestion collective vit à part (Phase 9). Les numéros `P8-01` à `P8-19` de la veille (rien n'était commencé) ont été réattribués ; le diagnostic de la veille reste valable et il est conservé ci-dessous.

### Ce que le client a tranché (cahier consolidé, onglets 01 à 03B)

- **ARC-01 — Un seul moteur financier** : tous les utilisateurs ont les mêmes comptes, budgets, transactions, objectifs, dettes, graphiques, rapports, calculateurs, tableaux de bord, patrimoine réel et portefeuille fictif.
- **ARC-02 — Les profils ne sont qu'une couche éducative.** Cinq profils : Lycéen, Étudiant, Jeune actif, Salarié, Épargnant. Ils n'activent ni ne désactivent **aucune** fonction financière ; ils changent uniquement l'ordre des contenus, les missions, les questions pédagogiques et les certificats. « Même tableau de bord que tous » (onglet 02). C'est plus net encore que notre proposition de la veille, qui laissait le profil régler le vocabulaire et l'ordre des blocs financiers.
- **ARC-03 — La gestion collective sort de l'application personnelle.** Colocation, couple, famille, dépenses partagées, règlements, permissions de foyer et tâches collectives en sont exclus. QA-V7-06 : **aucune** entrée collective dans la navigation, les écrans, l'API ou les calculs personnels → Phase 9.
- **ARC-04 — Le compte est la source de vérité** : toute transaction réelle crédite ou débite exactement un compte ; un transfert produit deux mouvements liés, de façon atomique. C'est la réponse (a) à la question de `P6-24`.
- **ARC-05 — Le budget est une allocation**, jamais un mouvement : seule la transaction réelle modifie le compte.
- **ARC-06** — le fictif n'entre jamais dans le solde, le patrimoine, la santé financière ou une capacité. **ARC-07** — responsive par conception. **ARC-08** — méthodes budgétaires facultatives, jamais prescriptives. **ARC-09** — pointage des opérations. **ARC-10** — rapport mensuel versionné.
- **Une fenêtre distincte de la vitrine**, avec un tableau de bord centralisé (message du 2026-10-27).
- **La navigation finale, dans cet ordre** (onglet 03) : Accueil, Mes comptes, Synthèse, Calendrier financier, Objectifs & sécurité, Dettes, Patrimoine réel, Portefeuille fictif, Outils, Santé financière, Formation, Progression, Certificats. Barre latérale sur ordinateur ; navigation basse et menu secondaire sur téléphone (onglet 03B).

### Diagnostic n°1 — organisation (2026-10-26, toujours valable)

Le client n'avait pas mal regardé : il décrivait exactement ce que le produit lui montrait. Mesures faites dans le code :

1. **Les personas servaient de barrière.** `menuFor()` (`server/src/constants/finNavigation.js`) appliquait la carte des parcours (`19_Cartes_Parcours`) comme une liste d'accès : selon le public, le menu montrait **7 à 15 des 21 rubriques** (« À plusieurs » invisible pour 5 publics sur 8, un colocataire sans « Aujourd'hui », réserve, dettes ni « Apprendre », un lycéen sans page budget). Notre faute : avoir lu une carte de parcours *recommandés* comme une matrice de *droits*. ARC-02 le confirme.
2. **Deux axes étaient mélangés dans les 8 publics** : des étapes de vie (LYC, ETU, JAC, SAL, EPG) et des façons de vivre à plusieurs (COL, COU, FAM). ARC-02 et ARC-03 les séparent.
3. **Des écrans comptés « servis » étaient fusionnés** : 70 écrans du client sur 23 routes ; `/espaces` en portait **21** dans une page à accordéons, `/aujourdhui` 8 tableaux de bord différents.
4. **Aucune porte d'entrée claire** : arrivée sur `/compte/profil` après connexion ; une barre latérale mélangeant 10 groupes et 11 liens de compte ; formation éclatée sur 7 adresses.
5. **Notre mesure de « terminé » regardait l'API et les tests, pas ce que voit le client** : les parcours navigateur ouvraient chaque page par son adresse, jamais depuis le menu.

### Diagnostic n°2 — erreurs de calcul et écarts au cahier (vérifié dans le code le 2026-10-27)

Les définitions F001 à F057 sont **identiques, au mot près**, dans l'ancien cahier et dans le consolidé (comparaison cellule par cellule ; seules F041 à F044, collectives, sont retirées). Les fonctions du moteur (`server/src/services/finance/formulas.js`) les appliquent fidèlement. **Les erreurs viennent des données qu'on leur donne** :

- **C1 — Les revenus sont comptés deux fois (F002).** `buildSynthesis` (`finSynthesis.service.js`) additionne les ressources récurrentes **déclarées** (normalisées au mois) **et** les mouvements de revenu **réellement saisis**. Un salaire déclaré dans les ressources puis saisi à sa réception compte double ; un revenu déclaré mais jamais reçu compte comme reçu. Le cahier : revenus du mois = revenus **réalisés** (onglet 11), et un salaire ne devient réel qu'après confirmation (onglet 15B, QA-P05). L'erreur se propage au flux net (F004), au taux d'épargne (F008), au taux d'effort (F018, dont le dénominateur est gonflé, donc l'effort sous-estimé) et à l'indice de santé (F053).
- **C2 — L'épargne est comptée comme une dépense.** Mettre de l'argent de côté est enregistré comme une dépense de famille `goal` (`finSavings.service.js`), et `buildSynthesis` comme `foldTotals` (`finMoney.service.js`) la comptent dans les dépenses (F003) ; un retrait d'épargne est compté comme un revenu. Le cahier : un virement vers l'épargne n'est pas une dépense de consommation (AC-04, QA-P09), et les transferts sont exclus des revenus et des dépenses.
- **C3 — L'épargne liquide de la réserve est un cumul de mouvements, pas un solde** (`finReserve.service.js`). F014 parle d'« épargne liquide » et OBJ-04 de « compte(s) éligibles » : c'est un solde de comptes.
- **C4 — Les dépenses essentielles sont divisées par 3 quoi qu'il arrive.** La réserve fait la moyenne sur 3 mois même quand l'historique n'a que quelques jours : les dépenses essentielles sont sous-estimées, donc les mois de réserve **surestimés**. Et « essentiel » est une liste fixe de catégories codée en dur (`ESSENTIAL_EXPENSE_CATEGORY_KEYS`), alors que le cahier porte un drapeau « Essentielle ? » par sous-catégorie, modifiable (onglet 09, AN-F001).
- **C5 — Le budget journalier (F012) est faux deux fois** (`finBudgetView.service.js`). Le « solde » y est remplacé par « budget prévu − dépensé », puis les enveloppes fixes restantes sont **retranchées une seconde fois** alors qu'elles sont déjà dans ce reste. Le cahier : (solde − obligations restantes) / jours restants, où le solde est celui des comptes.
- **C6 — De mauvais identifiants de formule sont attachés à des chiffres affichés.** F009 (« budget restant ») porte le « reste à affecter » d'un budget et la « réserve après apport » du simulateur logement ; F003 (« total dépenses ») porte le total **prévu** d'un budget. Or, depuis le 2026-10-19, la phrase « Pourquoi ? » est choisie par identifiant de formule : ces chiffres affichent une **explication fausse**.
- **C7 — Le cash projeté du calendrier exige un solde de départ saisi à la main**, faute de comptes (C23, surligné : « cash début + revenus planifiés − dépenses planifiées »).
- **C8 — Le détail d'un objectif ne simule rien** (C11, surligné et en rouge) : ni inflation, ni rendement hypothétique, ni hausse annuelle de l'épargne, ni comparaison de scénarios, ni statuts « en pause » / « arrêté » (onglet 16B). Ces calculs n'existent que dans les calculateurs isolés.
- **C9 — Le « Pourquoi ? » simplifié le 2026-10-19 diffère du consolidé**, qui demande « hypothèses toujours visibles et modifiables » (C11, OBJ-03) et « poids visibles » (HEA-01, onglet 21). **L'utilisateur a décidé le 2026-10-27 de le garder ainsi** : une phrase courte par chiffre, sans formule, hypothèses ni poids. Écart assumé, à ne pas défaire.
- **C10 — Les formules PB-F citées par les écrans du consolidé n'y étaient pas définies.** **Résolu le 2026-10-27** : le client les a envoyées (27 formules, `P8-01` point 1). Elles confirment le diagnostic — revenus et dépenses **réalisés** seulement, transferts exclus (PB-F004 à PB-F006), budget quotidien = budget restant / jours restants (PB-F013), fonds d'urgence mesuré sur le capital de son objectif (PB-F018).

### Ce que le client a marqué dans l'ancien cahier (`FINCLUDIA_Cahier_des_Charges_Complet (1).xlsx`)

Comparé cellule par cellule à la version du 2026-10-08 : aucun commentaire écrit, quatre corrections de texte, et des surlignages.
- **Surlignés en jaune** (onglet `05_Ecrans`) — selon son message, ce qui n'a pas été implémenté ou l'a été mal : C06 créer / modifier un budget, C07 saisie (ses actions), C08 historique (ses filtres), C09 à C11 objectifs (catalogue, création, détail), C12 réserve, C13 et C14 dettes, C15 fiche de paie, C16 patrimoine, C17 portefeuille fictif, C19 moteur de comparaison, C23 calendrier, C25 centre de confiance, CO01 à CO06 colocation, SA01 à SA03 et SA05 (salarié).
- **En rouge** — **corrigé le 2026-10-28 par le client : « ce qui n’a pas été intégré dans le processus »** (nous l’avions lu comme « règles soulignées »). En texte rouge : « transaction créée ; budget et tableau de bord recalculés » (C07) ; « l'utilisateur peut toujours créer “Autre” » et « montant / horizon manquant seulement lors de la création » (C09) ; contribution, horizon, inflation, rendement hypothétique, hausse annuelle, scénario (C11) ; taux d'effort et encours (C13) ; cash projeté et rappels J-7 / J-1 configurables (C23) ; les titres « Réserve de sécurité » et « Centre de confiance ».
- **Textes modifiés** : le catalogue d'objectifs (C09) ajoute « épargne projet » et « Réserve de sécurité » ; la ligne revenus des champs (onglet 06) devient « Revenus par la suite ressources (ça dépend des profils) » ; une catégorie « Actifs réels » devient « Actifs financier » (onglet 03).
- **En fond rouge** (même sens) : sept écrans « jeune actif » — JA01 transition premier revenu, JA02 tableau de bord jeune actif, JA03 plan premier salaire, JA04 organiser mon premier revenu, JA07 mes premiers actifs, JA08 préparation au financement, JA09 comparer un financement. Vérification du 2026-10-28 : JA02 est remplacé par l’Accueil unique (ARC-02) ; JA07 est le Patrimoine ; JA09 est l’outil « Comparer un financement » ; **JA08 existe (`/app/financement`) mais aucun lien n’y mène** ; JA01, JA03 et JA04 (le premier salaire) n’existent qu’en morceaux → `P8-23` et `P8-17`. Les règles en texte rouge sont en place, sauf l’« Autre » objectif personnalisable de C09 (ni icône ni couleur) et les rappels de C23, qui ne partaient pas avant le 2026-10-28.
- **D'autres couleurs** regroupent les écrans propres à chaque public (couple, épargne, étudiant, foyer, lycéen). Notre lecture (retenue en `P8-01` point 11) : les blocs collectifs partent en Phase 9, les blocs par public deviennent la couche éducative.

### Correspondance entre l'existant et la navigation finale

| Entrée finale | Écrans du client | Aujourd'hui | Tâche |
|---|---|---|---|
| Accueil (+ ajout rapide, mouvements, budgets) | ACC-01, ACC-02, TRX-01 à 04, BUD-01 à 04 | `/aujourdhui` (8 tableaux par public), `/mon-argent`, `/budget` | `P8-06`, `P8-07`, `P8-09` |
| Mes comptes | COM-01 à 04 | n'existe pas (le patrimoine connaît des comptes seulement déclarés) | `P8-03`, `P8-05` |
| Synthèse | SYN-01, SYN-02, REP-01 | en partie : la synthèse de `/mon-argent`, les graphiques de `P6-23` | `P8-10` |
| Calendrier financier | CAL-01, CAL-02 | `/calendrier` | `P8-11` |
| Objectifs & sécurité | OBJ-01 à 04 | `/objectifs` et `/reserve`, séparés | `P8-12` |
| Dettes | DET-01 à 05 | `/dettes` | `P8-13` |
| Patrimoine réel, Portefeuille fictif | PAT-01, PAT-02, PF-01 | `/patrimoine`, `/portefeuille` | `P8-14` |
| Outils | OUT-01, OUT-02 | `/outils/*`, éparpillés | `P8-15` |
| Santé financière | HEA-01 | une carte F053 dans `/aujourdhui` | `P8-16` |
| Formation, Progression, Certificats | FOR-01 à 03, ONB-01 | `/catalogue`, `/apprendre`, `/passeport`, `/compte/formations`, `/compte/certificats` | `P8-17` |
| Barre supérieure et paramètres | SEA-01, NOT-01, CHAT-01, DATA-01 | `P6-20`, `P6-18`, `P3-19`, `/confiance` | `P8-18`, `P8-19`, `P8-20` |

### Ce qui sera supprimé ou remplacé — et uniquement cela

Le client le dit : « il ne s'agit pas de supprimer ce qui a été fait ». Ne sont retirés que les éléments que le cahier consolidé écarte lui-même ; tout le reste (moteur, 57 formules, sécurité, tests, écrans) est repris, aménagé et affiné.

- Les **8 tableaux de bord par public** (`finDashboard.js`) → un seul Accueil (ARC-01, `P8-06`).
- Le **filtrage du menu par public** et la carte des parcours employée comme liste d'accès (`finNavigation.js`, `finJourneys.js`) → une navigation identique pour tous (`P8-02`). Seules les règles d'âge légales (`P6-22`) retirent des fonctions, et toujours côté serveur.
- Les **publics COL, COU et FAM** du profil personnel → cinq profils éducatifs (`P8-17`) ; la vie à plusieurs part dans Gestion commune (Phase 9).
- L'entrée **« À plusieurs »** et tout écran, route, calcul ou intention d'assistant collectif de l'application personnelle (QA-V7-06) → Phase 9. F041 à F044 quittent le catalogue **personnel** (onglet 99) : leur code est déplacé dans le moteur collectif, pas effacé.
- **« Mettre de côté » enregistré comme une dépense** → un transfert vers un compte d'épargne, avec migration des mouvements existants (`P8-03`).
- Les **ressources déclarées comptées comme des revenus reçus** → des revenus récurrents « à confirmer » (`P8-04`, `P8-11`).
- La **page `/reserve`** → le fonds d'urgence devient un type d'objectif dans « Objectifs & sécurité » (GO-01, OBJ-04), avec redirection (`P8-12`).
- Le **hub « Mes solutions »** proposé le 2026-10-26 → abandonné avant d'être construit : l'application ouvre directement sur son Accueil.
- `/compte/tableau-de-bord` (le tableau de bord de formation) → Formation et Progression dans l'application (`P8-17`).
- Le **solde de départ saisi à la main** dans le calendrier → le solde des comptes (`P8-11`).

### P8-01 — Moteur budgétaire unique : décisions de cadrage
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-21`
- Durée cible : 0 jour de développement (décisions)
- Origine : cahier consolidé et ancien cahier annoté, reçus le 2026-10-27 ; réponses de l'utilisateur du 2026-10-27

**Décisions (2026-10-27).** Les points que les deux fichiers ne tranchaient pas ont été tranchés par l'utilisateur, avec une **règle de priorité générale** qui vaut pour toute la Phase 8 :
- **le nouveau cahier (consolidé) prime** ;
- un élément de l'ancien cahier ou de l'existant **reste** s'il ne gêne pas, ne contredit pas et ne se superpose pas au nouveau ; **sinon il est supprimé** ;
- ce que le nouveau cahier **ne mentionne pas** est **gardé tel quel** ;
- quand rien ne tranche, on choisit **le plus logique pour l'ergonomie et l'expérience utilisateur**.

Application point par point :
1. **Formules PB-F — reçues du client le 2026-10-27** (`FINCLUDIA_Gestion_Budgetaire_Personnelle_Centralisee.xlsx`, onglet `13_Formules`, « règles de calcul définitives »). Elles étaient citées par 13 écrans du cahier consolidé (onglet `05_Ecrans_Detailles`, colonne J ; onglets `10B` et `11`) sans y être définies. **Ces 27 définitions font foi et remplacent celles que nous avions déduites** — trois de nos déductions étaient fausses (PB-F003, PB-F008, PB-F013). À écrire dans le moteur versionné, chacune avec sa phrase « Pourquoi ? » courte :
   - **PB-F001** solde courant d'un compte = solde initial + Σ crédits réalisés − Σ débits réalisés + Σ transferts entrants − Σ transferts sortants (même compte et devise, statut réalisé uniquement) ;
   - **PB-F002** solde total = Σ des soldes courants des comptes inclus au total **et de nature actif / liquide** (les passifs ne s'additionnent pas au cash disponible) ;
   - **PB-F003** position nette des comptes = Σ actifs inclus au patrimoine − Σ passifs inclus au patrimoine (vue patrimoine, distincte du solde total) ;
   - **PB-F004** total revenus = Σ revenus réalisés ; **PB-F005** total dépenses = Σ dépenses réalisées ; **PB-F006** flux net = PB-F004 − PB-F005 — transferts toujours exclus ;
   - **PB-F007** budget alloué total = Σ des montants alloués des budgets actifs de la période (n'affecte aucun compte) ;
   - **PB-F008** budget restant d'une catégorie = montant alloué − Σ dépenses réelles éligibles de la période + ajustements de report (peut être négatif) ;
   - **PB-F009** reste à allouer = revenus prévus − Σ budgets alloués − allocations hors budget explicitement planifiées (planification, pas un solde) ;
   - **PB-F010** taux de consommation = dépenses éligibles / montant alloué × 100 (si budget > 0) ;
   - **PB-F011** moyenne journalière = Σ dépenses réelles de la période / jours écoulés (au moins 1) ; **PB-F012** projection fin de période = PB-F011 × jours de la période (indicative) ;
   - **PB-F013** budget quotidien disponible = max(0, budget restant) / jours restants (si jours restants > 0 ; dépassement affiché à part) ;
   - **PB-F014** progression objectif = capital affecté / cible × 100 (affichage plafonné à 100 %, excédent à part) ; **PB-F015** reste = max(0, cible − capital affecté) ; **PB-F016** mois minimum = ceil(reste / contribution mensuelle), non calculable si contribution nulle ;
   - **PB-F017** cible fonds d'urgence = dépenses essentielles mensuelles × cible en mois ; **PB-F018** mois de fonds d'urgence = **capital du fonds d'urgence** / dépenses essentielles mensuelles (actifs illiquides exclus) ; **PB-F019** manque = max(0, cible − capital du fonds) ;
   - **PB-F020** ratio dette / revenu = Σ mensualités obligatoires / revenus nets × 100 (descriptif) ;
   - **PB-F021** prochaine date d'une récurrence = f(date de début, fréquence, règle du jour, date de fin), rien après la date de fin ;
   - **PB-F022** écart prévu / réel = réel − prévu, en montant et en % si le prévu ≠ 0 ; **PB-F023** tendance = (période − période précédente) / |période précédente| × 100, si la base ≠ 0 ;
   - **PB-F024** patrimoine net issu des comptes = Σ comptes et actifs patrimoniaux − Σ dettes et passifs, complété par les autres actifs du module patrimoine ;
   - **PB-F025** impact d'un transfert sur le solde total = 0 si la source et la destination sont toutes deux incluses et dans la même devise ; sinon, la variation des comptes inclus — toujours exclu des revenus et dépenses ;
   - **PB-F026** anti-double impact budget : une dépense réelle n'est agrégée qu'une fois par `transaction_id` ; `budget_id` ne crée aucune seconde écriture (contrainte d'unicité) ;
   - **PB-F027** solde d'une carte de crédit = solde initial du passif + achats + frais et intérêts − remboursements (passif, jamais ajouté au cash).

   Ces formules recoupent des formules F existantes (F002-F004, F009-F011, F014-F016, F018, F025-F027, F035) : **là où elles diffèrent, la PB-F prime**, puisqu'elle est la plus récente et la plus précise (par exemple, le fonds d'urgence se mesure sur le capital de son objectif, plus sur un cumul de mouvements). Les F restent pour tout ce que les PB-F ne couvrent pas (crédit, inflation, rendement, indices).
2. **Modèles d'objectifs** — les 11 du nouveau cahier (GO-01 à GO-11) priment. Parmi les 20 existants (`P6-22`), sont **supprimés** ceux qui se superposent : G01 réserve de départ et G02 fonds d'urgence (→ GO-01), G03 caution / installation logement et G07 logement-apport (→ GO-07), G04 ordinateur et G14 électroménager (→ GO-03 « ordinateur / équipement »), G05 permis (→ GO-04), G06 véhicule-apport (→ GO-06), G08 mariage (→ GO-08), G11 formation professionnelle (→ GO-02), G12 voyage (→ GO-05), G15 remboursement dette (→ GO-09), G18 retraite (→ GO-10), G20 objectif libre (→ GO-11). Sont **gardés**, parce qu'ils ne recouvrent aucun modèle nouveau : G09 naissance / arrivée d'un enfant, G10 études d'un enfant, G13 travaux du logement, G16 provision pour dépenses annuelles, G17 épargne long terme, G19 projet entrepreneurial personnel. **Total : 17 modèles.** Les objectifs déjà créés par les utilisateurs ne changent pas ; seul le catalogue change.
3. **Cibles du fonds d'urgence** — celles du nouveau cahier priment (GO-01) : lycéen 1 mois (pédagogique), étudiant 2, jeune actif ou salarié stable 3, revenu irrégulier 6 ; toujours modifiables. Les grilles du référentiel maître ne servent plus que là où GO-01 ne dit rien.
4. **Indice de santé financière** — les 7 dimensions du nouveau cahier priment (onglet 21) : équilibre du mois, réserve, dette, épargne, **budgets**, objectifs, qualité des données. « Stabilité des revenus » (barème « B » de `P6-22`) est supprimée, puisqu'elle n'y figure plus. Le nouveau cahier dit seulement « poids configurable » : les poids existants sont donc **gardés** pour les dimensions communes (25 / 20 / 20 / 15 / 10 / 5), et « budgets » reprend les 5 % libérés ; son sous-score suit la définition du dernier fichier du client (onglet `11_Tableau_Bord` : « respect des budgets = dépenses réelles / budgets actifs »), ramenée sur 100. Ces valeurs sont des **valeurs par défaut**, versionnées et modifiables dans l'administration ; elles ne sont pas affichées dans « Pourquoi ? » (point 7).
5. **Missions** — le nouveau cahier les mentionne (onglets 02 et 22, FOR-02) : elles sont **reprises**. `P2-10`, abandonnée le 2026-10-11, est réalisée dans le cadre de `P8-17`.
6. **Catégories** — les 125 du nouveau cahier priment. Parmi les 91 existantes (`P6-02`), celles qui recouvrent une catégorie nouvelle sont fusionnées dedans (leurs transactions suivent) ; celles qui ne recouvrent rien restent ; les catégories créées par les utilisateurs restent toutes.
7. **« Pourquoi ? »** — **gardé tel quel**, par décision explicite de l'utilisateur (2026-10-27) : une phrase courte par chiffre, sans formule, hypothèses ni poids, alors même que le nouveau cahier les demande (OBJ-03, HEA-01). C'est la seule exception à la règle « le nouveau cahier prime ». Chaque nouvelle formule de cette phase reçoit simplement sa phrase courte.
8. **Fenêtre distincte** — choix ergonomique : l'application vit sous un **chemin dédié** (`/app`) du même domaine, avec sa propre mise en page, sans rien de la vitrine. Le bouton « Mon espace » de la vitrine l'ouvre **dans le même onglet** : le bouton « retour » reste utilisable, rien ne s'ouvre en double sur téléphone, et une seule connexion sert aux deux. Un sous-domaine aurait demandé une seconde configuration de session et d'hébergement sans rien apporter à l'utilisateur.
9. **Notifications « push »** — choix logique en l'absence de règle : notifications dans l'application toujours, **plus les notifications du navigateur** (Web Push, sans fournisseur payant) pour qui les accepte. Toujours pas de SMS (`P6-01` point 8). Le dernier fichier du client prévoit aussi l'e-mail sur consentement (onglet `17_API_Donnees` : « push / in-app / email selon opt-in ») : il sera branché dès qu'un fournisseur d'e-mail est choisi (`P3-08`). **Toutes les alertes restent visibles dans « Aujourd'hui »** (onglet `14_Alertes`).
10. **Incohérences internes du nouveau cahier** — son architecture prime sur ses listes : ARC-03 et QA-V7-06 excluent le collectif, donc le calculateur CAL-21 et l'intention DÉPENSE_PARTAGÉE vont dans Gestion commune (Phase 9). La **fiche de paie**, absente des écrans du nouveau cahier, est **gardée telle quelle** dans les Outils (son API reste citée dans l'onglet 27), et revue contre l'ancien C15 (`P8-15`).
11. **Couleurs de l'ancien cahier annoté** — jaune = raté ou mal implémenté (confirmé par le client le 2026-10-28) ; **rouge = non intégré dans le processus** (précision du client du 2026-10-28, voir plus haut) ; autres couleurs = regroupement par public.
12. **Mineurs** — le nouveau cahier renvoie à des « règles d'âge légales séparées » sans les détailler : les règles de `P6-22` sont **gardées telles quelles** (majorité à 19 ans, pas de compte autonome avant 13 ans, « Mode Jeune » de 13 à 18 ans avec consentement parental, jamais de crédit réel avant la majorité), toujours appliquées côté serveur.

**À présenter au client à la recette, sans bloquer le travail :** les 17 modèles d'objectifs du point 2 et les poids par défaut du point 4. Les formules PB-F ne sont plus à confirmer : elles viennent du client.

**Questions envoyées au client le 2026-10-27 — en attente de réponse, sans bloquer le travail.** Chacune a une valeur par défaut, appliquée tant que le client n'a pas répondu, versionnée et modifiable, et listée dans la recette pour qu'il la confirme ou la corrige :
- **C1 — Report (PB-F008)** : par défaut, seul un reste **positif** est reporté sur la période suivante ; un dépassement n'est pas reporté en négatif.
- **C2 — « Allocations hors budget explicitement planifiées » (PB-F009)** : par défaut, les apports mensuels **planifiés** vers les objectifs et le fonds d'urgence.
- **C3 — Revenu irrégulier (GO-01, cible 6 mois)** : par défaut, c'est l'utilisateur qui le **déclare** dans son profil ; aucune détection automatique.
- **C4 — Salaire tombant un jour non ouvré (PB-F021)** : par défaut, l'utilisateur choisit la règle ; « jour ouvré précédent » est présélectionné.
- **C5 — Sous-score « budgets » de la santé financière** : par défaut 100 tant que les dépenses restent dans les budgets, puis baisse proportionnelle jusqu'à 0 à 200 % de consommation. Précise le point 4 ci-dessus.
- **E — Contenus pédagogiques** (missions et contenus par profil, onglets 02 et 22) : par défaut, nous rédigeons une **première version que le client valide** avant publication (`P8-17`). Aucun contenu n'est publié sans cette validation.
- Pour rappel, les points 2, 4, 6, 9, 10, 11 et 12 ci-dessus lui sont soumis en même temps, pour confirmation (question D).

**Réponses du client du 2026-10-28** aux questions du 2026-10-27. Elles priment sur les choix par défaut ci-dessus :
- **Pondérations de la santé financière** : celles du tableau déjà envoyé, inchangées (équilibre 25, réserve 20, dette 20, épargne 15, objectifs 10, budgets 5, qualité 5). « Chaque approche a un objectif donné. »
- **C1 report d’un budget** : `report = max(0 ; reste)`. Un dépassement reste visible dans l’historique et le rapport, mais ne réduit pas automatiquement le mois suivant : **l’utilisateur peut choisir** de reporter son dépassement et de le soustraire du budget suivant.
- **C2 PB-F009** : reste à allouer = revenus prévus − budgets alloués − contributions prévues aux objectifs − contribution prévue au fonds d’urgence − **provisions**. Les mensualités de dette déjà présentes dans les budgets ne sont pas retirées une seconde fois.
- **C3 régularité du revenu** : champ du profil « Stable | Irrégulier | Saisonnier », déclaré par l’utilisateur ; il règle la cible du fonds d’urgence. Plus tard, une variabilité forte de l’historique pourra **proposer** « Vos revenus semblent variables. Souhaitez-vous modifier votre profil ? », sans jamais changer la classification seule.
- **C4 salaire un week-end** : « jour ouvré précédent | jour ouvré suivant | date exacte », jour ouvré précédent présélectionné, modifiable.
- **C5 score « Budgets »** : pour chaque budget, r = dépenses réelles / budget alloué ; score = 100 si r ≤ 1, 100 × (2 − r) si 1 < r < 2, 0 si r ≥ 2 ; plusieurs budgets : **moyenne pondérée par le montant alloué** ; aucun budget : dimension non calculée, son poids redistribué entre les dimensions disponibles.
- **D1 modèles d’objectifs** : GO-01 à GO-11, puis **GO-12** naissance d’un enfant, **GO-13** études d’un enfant, **GO-14** travaux du logement, **GO-15** provision pour dépenses annuelles, **GO-16** épargne long terme, **GO-17** projet entrepreneurial. Toujours possible : « Autre objectif » avec nom, **icône, couleur**, montant et date personnalisés.
- **D3 navigation, ordre définitif** : Mon espace (zone profil) ; Accueil ; **Aujourd’hui** ; Mes comptes ; Synthèse ; Calendrier financier ; Objectifs & sécurité ; Dettes ; Patrimoine réel ; Portefeuille fictif ; Outils ; Santé financière ; Formation ; Progression ; Certificats. « Aujourd’hui » rassemble les actions à terminer, revenus à confirmer, transactions à pointer, échéances, questions manquantes, alertes et modules pédagogiques à poursuivre. **Améliorations retenues par l’utilisateur le 2026-10-28** (proposées au client) : « Mouvements » et « Budgets » entrent au menu après « Mes comptes » ; « Santé financière » rejoint « Synthèse » ; le menu est rangé en sections — *Au quotidien* (Accueil, Aujourd’hui, Mes comptes, Mouvements, Budgets, Calendrier financier), *Analyser* (Synthèse, Santé financière), *Construire* (Objectifs & sécurité, Dettes, Patrimoine réel, Portefeuille fictif), *Outils*, *Apprendre* (Formation, Progression, Certificats) ; l’Accueil montre les chiffres, « Aujourd’hui » la liste à faire avec un compteur ; barre du bas sur téléphone : Accueil, Aujourd’hui, Mes comptes, Mouvements, Plus.
- **D4 catégories** : les 125 **remplacent** les 91. Catégorie identique → même catégorie ; catégories qui se recoupent → fusion ; **ancienne catégorie supprimée → historique conservé mais remappé** ; catégories personnelles jamais supprimées ; une nouvelle transaction ne propose que les 125 et les catégories personnelles. Cela corrige le point 6 ci-dessus, qui gardait les anciennes catégories sans équivalent.
- **D5 fiche de paie** : dans Outils → « Décodeur de fiche de paie », pas dans le menu. Module complet : saisie / import, brut, primes, cotisations, retenues, IRG, net théorique, rapprochement avec la fiche réelle, **historique**, données extraites confirmées avant calcul.
- **D6 mineurs** : règles inchangées (moins de 13 ans aucun compte ; 13 à 18 ans Mode Jeune avec consentement parental ; 19 ans et plus compte complet ; aucun crédit réel ni fonction réglementée avant la majorité ; simulateurs pédagogiques autorisés en Mode Jeune).
- **D7 notifications** : centre de notifications maintenant, e-mail à la phase suivante (fournisseur, consentement, délivrabilité). **Réglage par famille** : budgets, revenus, échéances, dettes, objectifs, formation, sécurité.
- **E contenus** : le client fournit lui-même les contenus de missions et de formation par profil.
Mis en œuvre par `P8-26` (corrections des écrans déjà livrés), `P8-15` (fiche de paie), `P8-17` (contenus), `P8-18` (familles de notifications) et `P8-23` (premier salaire).

### P8-02 — Une application dans sa propre fenêtre, distincte de la vitrine, avec la navigation finale
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P1-12`
- Durée cible : 3 jours (estimation)
- Origine : message du client du 2026-10-27 ; cahier consolidé, onglets 03 et 03B, ARC-07, QA-V7-01, QA-V7-05

- **Séparer l'application de la vitrine** : sa propre mise en page, sans l'en-tête ni le pied de page marketing ; la vitrine garde les pages publiques et un bouton « Accéder à mon espace » qui ouvre l'application (décision `P8-01` point 8 : chemin dédié `/app`, ouvert dans le même onglet ; un sélecteur « Gestion budgétaire / Gestion commune » dans la barre supérieure mène à Gestion commune, hors du menu financier, `P9-01` point 1). Après connexion, arrivée sur **l'Accueil** — plus jamais sur `/compte/profil`.
- **Navigation finale, dans l'ordre du client** : Accueil, Mes comptes, Synthèse, Calendrier, Objectifs & sécurité, Dettes, Patrimoine réel, Portefeuille fictif, Outils, Santé financière, Formation, Progression, Certificats — complétée par les précisions du dernier fichier (onglet `03B_Navigation`) : **« Aujourd'hui »**, la liste de ce qui reste à faire (actions non réalisées, questions manquantes, revenus à confirmer, échéances, cours du parcours), accessible depuis la Synthèse et le menu ; **« Mon espace »** en tête (profil, préférences, devise, confidentialité, notifications) ; le bloc « Nos budgets » et une icône étoile / + pour l'ajout rapide ; l'icône de téléchargement en haut à droite de la Synthèse. **Identique pour tous les profils** : le filtrage par public de `menuFor()` est supprimé ; seules les règles d'âge légales retirent des entrées, et le serveur les refuse de toute façon (`requireAdult`).
- **Responsive (onglet 03B)** : barre latérale fixe de 240 à 280 px au-delà de 1 200 px ; barre rétractable entre 768 et 1 199 px ; navigation basse et menu secondaire sous 768 px. Cibles tactiles d'au moins 44 px, aucune action critique au seul survol, jamais un tableau dense sans vue en cartes.
- **Barre supérieure** : recherche, notifications, aide, profil ; les liens du compte quittent la barre latérale pour un menu « Paramètres ».
- Redirection de toutes les anciennes adresses.
- Tests : QA-V7-01 (un lycéen et un salarié ont la même navigation financière), QA-V7-05 (Accueil sous 768 px), parcours clavier, RTL, fr / en / ar.

**Réalisé le 2026-10-27.**
- **L'application vit sous `/app`**, avec sa propre mise en page (`client/src/layouts/AppLayout.jsx`), sans en-tête ni pied de page de la vitrine. Le bouton « Accéder à mon espace » de la vitrine l'ouvre ; la connexion et l'inscription arrivent sur l'Accueil (`/app`).
- **Navigation finale, identique pour tous** (`client/src/config/appNavigation.js`) : les 13 entrées dans l'ordre du client, Formation / Progression / Certificats en bas de barre. Seul un mineur **déclaré** ne voit pas Dettes et Patrimoine (nouveau champ `mineurDeclare` de `GET /api/fin/parcours`) ; le serveur les refuse de toute façon. Un compte dont l'âge n'est pas renseigné garde ces entrées, et la page lui dit quoi compléter.
- **Barre supérieure** : sélecteur « Gestion budgétaire / Gestion commune » (vers `/app/espaces` en attendant `P9-02`), recherche, ajout rapide (+), notifications, aide, et « Mon espace » (profil, profil financier et devise, catégories, premiers pas, notifications, confidentialité, formations, paiements, premium, espace entreprise pour les majeurs).
- **Responsive (onglet 03B)** : barre latérale fixe à partir de 1 200 px, rétractable de 768 à 1 199 px, barre basse (Accueil, Comptes, Synthèse, Calendrier, Plus) sous 768 px ; cibles de 44 px ; propriétés logiques (arabe vérifié).
- **Toutes les anciennes adresses redirigent** (`LEGACY_REDIRECTS`, 30 adresses, chemin et paramètres conservés). Les pages publiques (outils, glossaire) restent ouvertes aux visiteurs dans la vitrine ; une personne connectée y est renvoyée vers la même page dans l'application.
- **Nouvelles pages** : « Mes comptes » (`/app/comptes`, base de `P8-05`), « Santé financière » (`/app/sante`, base de `P8-16`), « Mon espace » (`/app/parametres`). L'ancienne coque (FincludiaLayout, FincludiaNav, AccountLayout, fincludiaMenu) est supprimée.
- Test navigateur `server/tests/e2e/app-shell.test.js` : QA-V7-01 (même menu pour un lycéen et un salarié), mineur déclaré, QA-V7-05 (téléphone, sans défilement horizontal), redirections, arabe.
- **Restent ailleurs** : l'Accueil affiche encore l'ancien tableau « Aujourd'hui » jusqu'à `P8-06` (qui y ajoute aussi la liste « Aujourd'hui » de l'onglet 03B) ; le filtrage par public `menuFor()` du serveur n'est plus lu par le client et sera retiré avec `P8-21` ; les liens internes des pages pointent encore vers les anciennes adresses, qui redirigent.

### P8-03 — Lot 0 : comptes, transactions, transferts et anti-doublon
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-04`
- Durée cible : 5 jours (estimation)
- Origine : cahier consolidé, ARC-04, ARC-05, ARC-09, onglets 07, 07B, 08, 08B, 08C, 09B ; lot 0 du backlog du client (onglet 28) ; tranche `P6-24`

- **Comptes** : dix types (AC-01 espèces à AC-10 autre), chacun avec sa nature (actif liquide, épargne, investissement, passif, créance) et ses valeurs par défaut d'inclusion au solde total et au patrimoine ; champs de l'onglet 07B (nom, type, solde initial et sa date, devise, couleur, icône, inclusion au total et au patrimoine, seuil minimum, seuil informatif, découvert autorisé, note, statut actif / archivé).
- **Transactions** : type revenu / dépense / transfert / ajustement ; montant toujours positif, le sens vient du type ; **un compte obligatoire** ; compte de destination pour un transfert ; statut prévu / à confirmer / réalisé / annulé — **seul « réalisé » touche un solde** ; moyen de paiement PM-01 à PM-10, distinct du compte (seule la carte de crédit est un compte, et c'est un passif) ; étiquette (nom, couleur, application automatique proposée) ; payeur ; lieu ; pièce jointe et reçu (stockage privé de `P5-03`) ; budget ; récurrence.
- **Pointage** : non pointée, pointée, rapprochée, à vérifier — sans effet sur le solde, seulement sur la fiabilité (onglet 08C).
- **Un transfert = deux mouvements liés, écrits dans une seule transaction de base de données** ; exclu des revenus et des dépenses.
- **Taxonomie respectée** (onglet 09B) : catégorie, compte, moyen de paiement, étiquette, budget et objectif sont six notions distinctes.
- **Sans compte, un compte « Espèces » est créé par défaut** (PB-PR-04). **Option de comptabilisation automatique** d'une échéance ou d'un revenu attendu, sinon rien ne touche un solde avant confirmation (PB-PR-08).
- **Migration sans perte** : un compte « Espèces » par devise reçoit les transactions existantes ; les mouvements « épargne » (famille `goal`) deviennent des transferts vers un compte d'épargne ; les comptes déclarés du patrimoine (`P6-11`) sont proposés comme comptes. La formule de solde est PB-F001 (`P8-01` point 1).
- Tests : QA-P01, QA-P03, QA-P04, QA-P06, QA-P08, QA-P09, QA-P10 du client, plus la sécurité (un compte n'est lisible que de son propriétaire, y compris par l'API).
- **Précisions du 2026-10-27** (dernier fichier, onglets `01_Principes`, `05_Transactions`, `13_Formules`, `17_API_Donnees`) : un transfert porte un `transfer_id` commun à ses deux écritures (PB-PR-06) et passe par sa propre route `/transfers` ; anti-double impact par `transaction_id` (PB-F026) ; solde d'une carte de crédit (PB-F027).

**Réalisé le 2026-10-27 (le socle du lot 0).**
- **Comptes** : table `fin_accounts` ; les 10 types AC-01 à AC-10 sont générés depuis l'onglet `04_Comptes` (`server/scripts/generate-accounts.py` → `constants/finAccounts.js`), avec leur nature et leurs inclusions par défaut ; champs de l'onglet 04B ; archivage sans effacement. API : `GET/POST /api/fin/comptes`, `PATCH /api/fin/comptes/:id`, `PUT /api/fin/comptes/:id/archive`.
- **Soldes calculés, jamais stockés** : PB-F001 par compte (seuls les mouvements réalisés comptent), PB-F002 solde total (comptes inclus, hors passifs), PB-F003 position nette ; un passif se lit à l'envers (PB-F027). Plusieurs devises ne s'additionnent jamais.
- **Un compte par mouvement** : `accountId` ; sans compte choisi, le compte « Espèces » de la devise, créé au premier mouvement (PB-PR-04) ; devise du mouvement = devise du compte.
- **Transferts** : `POST /api/fin/transferts`, deux écritures `transfer_out` / `transfer_in` liées par un `transferId`, dans une seule transaction de base ; même devise obligatoire ; exclus des revenus et des dépenses ; supprimés ensemble (`DELETE /api/fin/transferts/:transferId`) ; un côté ne se corrige pas seul.
- **Migration sans perte** (`20261027120000_fin_accounts`, vérifiée sur données d'essai) : un compte « Espèces » par personne et devise reçoit tous les mouvements ; chaque mouvement « épargne » (famille `goal`) devient un transfert vers un compte « Épargne » (AC-04). L'épargne nette (F007) lit désormais ces transferts.
- **Reporté vers `P8-07`** (champs de saisie de l'écran Mouvements) : moyens de paiement PM-01 à PM-10, étiquettes, payeur, lieu, statuts « à confirmer » / « annulé », pointage, type « ajustement ». **Vers `P8-05`** : proposer les comptes déclarés du patrimoine (`P6-11`) comme comptes. **Vers `P8-11`** : comptabilisation automatique d'une échéance (PB-PR-08).

### P8-04 — Corriger dès maintenant les calculs faux (diagnostic n°2)
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-04`
- Durée cible : 2 jours (estimation)
- Origine : erreurs de calcul signalées par le client le 2026-10-27, vérifiées dans le code (diagnostic n°2)

Ce qui peut être corrigé **sans attendre les comptes**, parce que des chiffres faux sont à l'écran aujourd'hui :
- **C1** : les totaux suivent PB-F004 à PB-F006 — revenus et dépenses **réalisés** seulement, transferts exclus ; les ressources déclarées sont montrées à côté comme « prévu », jamais ajoutées au réel.
- **C4** : dépenses essentielles = moyenne sur les mois **réellement couverts** par l'historique (jamais une division par 3 sur deux semaines) ; « essentiel » lu sur un drapeau par catégorie ou sous-catégorie, modifiable.
- **C5** : le budget quotidien suit PB-F013 — max(0, budget restant) / jours restants, dépassement affiché à part — au lieu du calcul actuel, qui soustrait deux fois les enveloppes fixes.
- **C3 / C4** : la réserve suit PB-F017 à PB-F019 — sur le **capital du fonds d'urgence** (son objectif), plus sur un cumul de mouvements « épargne ».
- **C6** : chaque chiffre porte l'identifiant de **sa** formule ; les chiffres sans formule propre reçoivent la PB-F définie en `P8-01` point 1, jamais l'identifiant d'une autre.
- Puis contrôle de tout ce qui en dépend : F004, F008, F018, F053, l'indice de préparation (`P6-16`), l'accueil et les tableaux de bord.
- **Méthode** : pour chaque erreur, un test qui la reproduit d'abord (rouge), puis la correction (vert). C2, C3, C5 (le solde) et C7 sont corrigés avec les comptes (`P8-03`, `P8-05`, `P8-11`).

**Réalisé le 2026-10-27.**
- Les 27 formules PB-F sont dans le moteur, générées depuis l'onglet `13_Formules` (`server/scripts/generate-budget-formulas.py` → `constants/finBudgetFormulas.js`), et reconnues par le contrat de réponse.
- **C1** : la synthèse et l'historique comptent les revenus **reçus** seulement (PB-F004 à PB-F006) ; les ressources déclarées sont affichées à côté, « Revenus prévus » (F001). Le taux d'effort des dettes reste calculé sur les ressources déclarées (ratio structurel, comme la page Dettes).
- **C2 (en partie)** : l'argent mis de côté (famille `goal`) n'est plus compté ni en dépense ni en revenu, dans la synthèse, l'historique et les budgets. Sa transformation en vrai transfert entre comptes reste dans `P8-03`.
- **C3** : la réserve se mesure sur le capital de l'objectif « Fonds d'urgence » (PB-F017 à PB-F019). Sans cet objectif, elle est « non calculée » et l'écran dit comment le créer.
- **C4 (en partie)** : les dépenses essentielles sont la moyenne sur les mois **complets** réellement couverts (1 à 3) ; à moins d'un mois, la déclaration d'inscription, sinon « non calculé ». Le drapeau « Essentielle ? » par catégorie arrive avec les 125 catégories (`P8-08`).
- **C5** : budget quotidien = max(0, budget restant) / jours restants (PB-F013), dépassement affiché à part ; reste à affecter selon PB-F009, apports mensuels prévus des objectifs compris (question C2, valeur par défaut).
- **C6** : la vue budget porte ses PB-F (PB-F005 à PB-F010, PB-F013) ; la « réserve après apport » du simulateur logement porte F007. Restent les totaux prévus du calendrier, repris avec `P8-11`.
- Reportés, comme prévu : C2 (transferts), solde de C5 et C7 avec `P8-03`, `P8-05`, `P8-11`.

### P8-05 — Mes comptes
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P8-02`, `P8-03`
- Durée cible : 3 jours (estimation)
- Origine : cahier consolidé, COM-01 à COM-04, G-02, G-06, AL-P02, AL-P03 ; lot 1

- Liste des comptes et solde total des comptes inclus ; passifs affichés à part ; filtre actifs / archivés.
- Création et modification (assistant pas à pas sur téléphone) ; détail d'un compte avec sa courbe de solde, ses mouvements et le prévu / réel ; nouveau transfert (source, destination, montant, date, frais, note).
- Alertes : solde sous le seuil choisi, compte débiteur — rouge **et** texte, jamais la couleur seule.
- **Formules du client** : PB-F001 (solde d'un compte), PB-F002 (solde total, comptes actifs / liquides inclus seulement), PB-F025 (effet d'un transfert sur le total) — calculateurs CAL-P01 et CAL-P02.

**Commencé le 2026-10-27 (avec `P8-02`).** La page `/app/comptes` existe : liste des comptes avec leur solde (PB-F001), solde total (PB-F002) et position nette (PB-F003) par devise, ajout d'un compte (les 10 types du client, leur règle affichée), transfert entre deux comptes, et « Voir les mouvements » qui ouvre la Synthèse filtrée sur le compte. Reste : modifier et archiver un compte, l'alerte de solde minimum, et proposer les comptes déclarés du patrimoine (`P6-11`).

**Réalisé le 2026-10-27.** Comptes actifs ou archivés ; dettes et cartes de crédit affichées à part, jamais ajoutées au disponible ; modification (nom, inclusions, seuil d'alerte, découvert autorisé, note) et archivage / réactivation ; détail d'un compte avec son solde à la fin de chacun des six derniers mois (`GET /api/fin/comptes/:id/historique`, PB-F001 à chaque date) ; alertes AL-P02 / AL-P03 (sous le seuil choisi, à découvert, au-delà du découvert autorisé) écrites en toutes lettres avec une icône ; frais d'un transfert enregistrés comme une dépense du compte de départ (catégorie « Frais de transfert ») ; comptes déclarés dans le patrimoine (`P6-11`) proposés, jamais créés d'office. Écart assumé : pas d'assistant pas à pas sur téléphone, le formulaire tient sur une colonne.

### P8-06 — Accueil centralisé, le même pour tous
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P8-04`, `P8-05`
- Durée cible : 4 jours (estimation)
- Origine : cahier consolidé, onglet 04 (ACC-01 à ACC-19), ACC-02, G-01 à G-03 ; message du 2026-10-27 (« tableau de bord distinct centralisé ») ; SA02 surligné

- Remplace les 8 tableaux de bord de `/aujourdhui` par **un seul écran**, bloc par bloc selon l'onglet 04 : solde total en grand (bascule total / un compte, clic vers « Mes comptes ») ; accès à la synthèse juste à côté ; raccourci des comptes ; dépenses et revenus de la période ; flux net ; sélecteur jour / semaine / mois / 90 jours / année / période libre ; graphique en anneau dont un clic sur une part filtre les mouvements ; anneau qui devient une petite courbe quand on descend vers les mouvements ; petit carré « Outils » ; cartes de budgets avec un « + » qui ouvre la gestion des budgets (jamais une saisie implicite) ; progression des objectifs ; réserve ; au plus 3 objectifs prioritaires ; prochaines échéances et lien vers le calendrier ; formation du parcours ; santé financière avec « Voir pourquoi » ; prévu / réel / tendance ; historique en bas.
- **Ajout rapide** (ACC-02) : revenu, dépense ou transfert, en feuille glissante sur téléphone ; un brouillon, sans aucun effet avant « Enregistrer ».
- Ce que le profil change ici : uniquement le bloc formation.
- **Précisions du 2026-10-27** (onglet `03_Accueil_Synthese`) : trois raccourcis centraux toujours visibles, « Mes comptes | Dépenses & revenus | Flux net » ; le graphique circulaire change selon l'onglet actif (comptes, dépenses, revenus, flux) ; un clic sur « Revenus » ou « Dépenses » ouvre toutes les transactions avec leurs filtres ; le solde se met à jour dès qu'une transaction est confirmée. Flux net = PB-F006.
**Réalisé le 2026-10-27.** Un seul Accueil (`/app`, `client/src/pages/accueil/HomePage.jsx`), le même pour tous, servi par **une requête** `GET /api/fin/accueil` qui rassemble ce que chaque module calcule déjà :
- solde total en grand, ou un compte choisi, avec clic vers « Mes comptes » ; « Synthèse » juste à côté (ACC-01, ACC-02) ;
- les trois raccourcis toujours visibles « Mes comptes | Dépenses & revenus | Flux net » (ACC-03) ;
- période Jour / Semaine / Mois / 90 jours / Année / Période (dates libres) qui pilote toute la page (ACC-05) ;
- revenus, dépenses et flux net (PB-F004 à PB-F006) ;
- **anneau** selon l'onglet actif (comptes, dépenses, revenus, flux), couleur fixe par catégorie (celle du client), au plus cinq parts plus « Autres », légende avec montant et part, clic sur une part (ou sa ligne de légende) qui filtre les mouvements affichés dessous et le lien « Voir tous les mouvements » (ACC-04, ACC-07, ACC-08) ; petit carré « Outils » à gauche (ACC-06) ;
- « Aujourd'hui » (la prochaine action) ; « Nos budgets » avec un « + » qui ouvre la gestion des budgets ; au plus trois objectifs prioritaires et le fonds d'urgence ; prochaines échéances et lien vers le calendrier ; santé financière avec « Voir pourquoi » ; bloc formation ; prévu / réel / tendance (ACC-09).
- Vérifié dans un navigateur, ordinateur et téléphone (sans défilement horizontal).
- **Restent** : l'ancien écran par public reste servi sous `/app/aujourdhui` en attendant d'être réduit à la seule liste « Aujourd'hui » (`P8-21`) ; l'ajout rapide en feuille glissante sur téléphone (aujourd'hui, il ouvre la page Mouvements) et l'anneau qui se change en mini-courbe au défilement → `P8-24`.

### P8-07 — Mouvements : revenus, dépenses, transferts et pointage
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P8-02`, `P8-03`
- Durée cible : 3 jours (estimation)
- Origine : cahier consolidé, TRX-01 à TRX-04, AN-F004 ; ancien cahier C07 et C08 surlignés ; reprise de `/mon-argent` (`P6-04`)

- Liste par onglets (revenus / dépenses / transferts), totaux et jauges ; filtres période, compte, type, catégorie, étiquette, pointage, montant.
- Saisie complète (montant, description, catégorie, sous-catégorie, compte, moyen de paiement, date, étiquette, payeur, lieu, pièce, reçu, budget) avec catégories en icônes et clavier numérique ; « Enregistrer » et « Enregistrer et nouveau ». La transaction recalcule aussitôt solde, budget et Accueil (C07, en rouge).
- Détail et correction avec motif ; suppression logique et trace ; dupliquer ; doublon suspect demandé en confirmation, jamais supprimé d'office.
- Écran de pointage : taux de pointage (AN-F004), opérations non pointées, gestes de glissement sur téléphone.
- Ce qui disparaît des filtres de l'ancien C08 : « membre », qui relève du collectif.

**Réalisé le 2026-10-27.** Nouvelle page « Mouvements » (`/app/mouvements`), atteinte depuis la Synthèse, « Mes comptes » (« Voir les mouvements ») et le + de la barre supérieure ; la Synthèse garde ses chiffres.
- **Onglets** Tous / Revenus / Dépenses / Transferts / Pointage ; filtres texte, compte, catégorie, étiquette, pointage, période, montant min. / max., sans catégorie ; totaux du jeu filtré, transferts exclus ; export.
- **Saisie complète** (onglet 08) : description, catégorie et sous-catégorie, compte, moyen de paiement, étiquette, payé par, lieu ; « Enregistrer » et « Enregistrer et nouveau ». **Moyens de paiement du client** PM-01 à PM-10 (générés depuis `05B_Moyens_Paiement`), anciennes valeurs migrées (`20261027140000_fin_movements`).
- **Correction** avec motif facultatif, **duplication**, suppression logique (un transfert part avec ses deux côtés). **Doublon suspect demandé avant d'enregistrer** (`POST /api/fin/transactions/doublons`, qui n'écrit rien) : « Enregistrer quand même » ou annuler ; jamais rien supprimé d'office.
- **Étiquettes** (`/api/fin/etiquettes`) : nom, couleur, et option d'application automatique à une catégorie.
- **Pointage** (onglet 08C) : non pointée / pointée / rapprochée / à vérifier, sur chaque ligne et dans l'onglet dédié, avec le **taux de pointage AN-F004** et les opérations restant à vérifier ; sans aucun effet sur un solde. Les 16 formules d'analyse AN-F001 à AN-F016 sont générées dans le moteur depuis l'onglet `24_Formules`.
- **Écarts assumés** : pas de gestes de glissement sur téléphone (des boutons à la place) ; le type « ajustement » et les statuts « à confirmer » / « annulé » arrivent avec `P8-11` (revenus à confirmer) ; le rattachement à un budget reste par catégorie (`P8-09`).

### P8-08 — Catégories universelles
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P8-01`, `P6-02`
- Durée cible : 2 jours (estimation)
- Origine : cahier consolidé, onglets 09 et 09B, AN-F001 ; ancien cahier C09 en rouge (« toujours créer “Autre” »)

- Les 125 catégories et sous-catégories du consolidé, chacune avec son icône, sa couleur, son caractère essentiel, sa récurrence typique et les profils pour lesquels elle est **suggérée** (un ordre d'affichage, jamais une restriction).
- « Autre » et les catégories personnelles toujours possibles ; drapeau « essentielle » modifiable par l'utilisateur.
- Migration depuis les 91 catégories de `P6-02` (décision `P8-01` point 6) : celles qui recouvrent une catégorie nouvelle y sont fusionnées, les autres et toutes les catégories des utilisateurs restent, sans perdre une seule transaction catégorisée.

**Réalisé le 2026-10-27.**
- Les 125 catégories de l'onglet `09_Categories` (identique à l'onglet `07_Categories` du dernier classeur) sont générées par `server/scripts/generate-categories.py`, qui écrit à la fois `constants/finCategoryReference.js` et la migration `20261027130000_fin_categories_125`. Chaque catégorie porte son groupe (« Logement », « Alimentation »…), son icône, sa couleur, « Essentielle ? », sa récurrence typique et « Suggéré pour » (ordre d'affichage seulement).
- **Fusion** (décision `P8-01` point 6) : 27 anciennes catégories recouvrent une nouvelle et en prennent la définition **en place** — même clé, même identifiant, donc aucun mouvement ne bouge. Exemples : « Habillement » → « Vêtements », « Alimentation / boissons » → « Courses alimentaires », « Revenu locatif » → « Loyer reçu ». La liste complète est dans le script (`MERGES`) ; dans le doute, l'ancienne reste. 98 nouvelles catégories sont ajoutées ; les 64 anciennes non recouvertes (objectifs, actifs, dettes, partagées, saisonnières…) et toutes les catégories des utilisateurs restent : 189 catégories standard.
- **« Essentielle ? » modifiable** : par l'utilisateur, sur une catégorie standard (sa personnalisation) comme sur les siennes, depuis la page des catégories. La réserve lit désormais ce drapeau : plus aucune liste de catégories essentielles codée en dur (fin de C4, `P8-04`).
- Le sélecteur de catégorie de « Mon argent » est regroupé par groupe du client, avec les icônes.
- La famille d'une nouvelle dépense (fixe / variable / saisonnière) est lue dans sa récurrence typique ; elle ne sert qu'à proposer un type d'enveloppe.

### P8-09 — Budgets : une allocation, rattachée automatiquement, et des méthodes facultatives
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P8-03`, `P8-08`
- Durée cible : 4 jours (estimation)
- Origine : cahier consolidé, BUD-01 à BUD-04, onglets 10, 10B, 12, 12B, G-04, G-09, AN-F003, AN-F005 à AN-F008 ; ancien cahier C06 et SA03 surlignés ; reprise de `/budget` (`P6-05`)

- **Un budget par catégorie** (sous-catégorie facultative) et par période — hebdomadaire, mensuelle, annuelle ou ponctuelle —, avec son périmètre de comptes, le report du reste, deux seuils d'alerte (80 % et 100 % par défaut), sa couleur, son icône et son statut actif / pause / archivé. Le modèle actuel de `P6-05` (une période qui contient des enveloppes) est repris et adapté à ce découpage.
- **Règles de l'onglet 10B** : une dépense sans budget n'est jamais une erreur ; un budget créé **après** des dépenses les agrège aussitôt (QA-P02) ; une dépense va au budget le plus spécifique, sinon le choix est proposé ; un dépassement s'affiche (reste négatif, plus de 100 %) mais ne bloque jamais une dépense (QA-P07) ; reste à allouer ; moyenne par jour et projection de fin de mois ; une modification recalcule et se versionne ; une suppression archive.
- **Méthodes facultatives** : 50 / 30 / 20, 80 / 20, base zéro, enveloppes, répartition personnalisée — avec un rattachement des catégories **visible et modifiable** (onglet 12B). L'écran compare, il ne juge pas (ARC-08).
- Le « plan du mois » de l'ancien SA03 (copier le mois précédent, éviter le double comptage) se retrouve ici et dans le calendrier (`P8-11`).
- **Formules du client** : PB-F007 (budget alloué total), PB-F008 (budget restant, report compris), PB-F009 (reste à allouer), PB-F010 (taux de consommation), PB-F011 et PB-F012 (moyenne par jour, projection), PB-F013 (budget quotidien disponible), PB-F022 (écart prévu / réel), PB-F026 (une dépense n'est comptée qu'une fois) — calculateurs CAL-P04 à CAL-P08 et CAL-P14 ; route `/budget-lines` pour les lignes d'un budget.
**Réalisé le 2026-10-27.**
- **Une enveloppe couvre une sous-catégorie OU une catégorie entière du client** (« Logement », « Alimentation »…) ; une dépense va à l'enveloppe la plus spécifique (sa sous-catégorie, sinon son groupe), sinon elle reste « hors enveloppe » — jamais comptée deux fois (PB-F026). Un budget créé après des dépenses les agrège aussitôt (lecture par période) ; un dépassement s'affiche sans rien bloquer.
- **Report du reste** (case à cocher par budget) : le reste **positif** de chaque enveloppe de la période précédente s'ajoute à la même enveloppe (valeur par défaut de la question C1) ; PB-F008 en tient compte.
- **Rythme de la période** : moyenne réelle par jour (PB-F011), projection de fin de période (PB-F012), écart réel − prévu (PB-F022), en plus de PB-F007 à PB-F010 et PB-F013 (`P8-04`).
- **Méthodes facultatives** (onglets 12 et 12B, générées par `server/scripts/generate-budget-methods.py`) : 50/30/20 (AN-F005 à AN-F008), 80/20, base zéro (reste à allouer visant 0), enveloppes (AN-F003). Le rattachement catégorie → poche est **affiché et modifiable par budget** ; les lignes « Configurable » du client ont une poche par défaut lisible dans le script. `GET /api/fin/budgets/:id/methode?methode=M-01`.
- **Écarts assumés** : pas de périmètre de comptes par budget ni de statut « pause » ; la répartition personnalisée (M-05) attend une définition des poches par l'utilisateur ; « copier le mois précédent » reste la duplication existante (`P6-05`).

### P8-10 — Synthèse, rapport mensuel et téléchargement
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P8-06`, `P8-09`
- Durée cible : 4 jours (estimation)
- Origine : cahier consolidé, SYN-01, SYN-02, REP-01, onglets 11, 13 et 14, ARC-10, AN-F001 à AN-F016, QA-V7-02, QA-V7-03 ; lot 2

- Page Synthèse : les sections R-01 à R-12 (résumé du mois, comptes, dépenses, budgets, méthode, scénarios d'épargne, objectifs, fonds d'urgence, dettes, patrimoine, qualité, formation et actions), chaque bloc cliquable.
- Rapport mensuel **versionné** et téléchargeable en PDF, XLSX ou CSV ; comparaison de deux mois ; le réel et le fictif toujours séparés ; les données non pointées signalées.
- Les 12 graphiques du catalogue (onglet 13), en reprenant ceux de `P6-23` ; la cascade mensuelle (revenus → charges → dette → épargne → reste).
- Les indicateurs de l'onglet 11 et les formules AN-F001 à AN-F016, toutes versionnées dans le moteur, chacune avec sa phrase « Pourquoi ? ».
- **Précisions du 2026-10-27** : la Synthèse contient « Aujourd'hui » (actions non réalisées, questions manquantes, revenus à confirmer, échéances, cours du parcours) ; l'icône de téléchargement est en haut à droite (onglet `03B_Navigation`) ; écart prévu / réel PB-F022 et tendance PB-F023 (calculateurs CAL-P14 et CAL-P15). **« Aujourd'hui »** reprend la logique d'actions de l'actuelle page `/aujourdhui` (`P6-06`), qui devient cette liste de choses à faire plutôt qu'un tableau de bord.
**Réalisé le 2026-10-27.**
- **Page Synthèse** (`/app/synthese`, `client/src/pages/synthese/SynthesisPage.jsx`) servie par le **rapport mensuel** `GET /api/fin/rapport?mois=AAAA-MM` : sections R-01 (résumé, comparaison au mois précédent par **PB-F023**), R-02 (soldes de début et de fin par compte), R-03 (top catégories, moyenne par jour PB-F011), R-04 (budget), R-05 (lecture 50/30/20), R-07 (objectifs), R-08 (fonds d'urgence), R-09 (dettes), R-10 (patrimoine PB-F024), R-11 (taux de pointage AN-F004, à pointer, sans catégorie), R-12 (formation) — chaque bloc ouvre l'écran d'où il vient ; lien « Aujourd'hui ».
- **Versionné** (ARC-10) : le rapport porte sa version et sa date de production, et chaque chiffre son identifiant et sa version de formule.
- **Téléchargement** en haut à droite : CSV et XLSX (`/api/fin/rapport/export`, montants en centimes, cellules protégées contre les formules), PDF par l'impression du navigateur (feuille d'impression sans la coque de l'application) — aucune dépendance nouvelle.
- L'ancienne page « Mon argent » est remplacée (la saisie et l'historique sont dans « Mouvements », `P8-07`).
- **Restent** : la section R-06 (scénarios d'épargne), la cascade mensuelle et les autres graphiques du catalogue (onglet 13 : seuls G-01, G-02, G-05, G-07 existent) ; une comparaison de deux mois au choix (aujourd'hui : le mois précédent) ; des instantanés de rapport conservés (aujourd'hui : régénéré à la demande, versionné) → `P8-24`.

### P8-11 — Calendrier financier : trois onglets et revenus à confirmer
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P8-03`
- Durée cible : 3 jours (estimation)
- Origine : cahier consolidé, CAL-01, CAL-02, ONB-02, onglets 15 et 15B, AL-P01, AL-P06, AL-P07, QA-P05 ; ancien cahier C23 surligné ; reprise de `/calendrier` (`P6-07`)

- Trois onglets : **Revenus | Dépenses | Échéances** ; vues mois et semaine, et une vue agenda sur téléphone.
- Récurrences : fréquences hebdomadaire à annuelle ou personnalisée, dates de début et de fin, jour habituel, mode de création (« à confirmer », « créer comme réalisé », « créer comme prévu »), compte, catégorie, montant, rappels J-7 / J-3 / J / J+1.
- **Salaire** : « Quel jour du mois recevez-vous votre salaire ? », puis confirmation du montant le jour venu, et un seul crédit après confirmation (QA-P05). C'est le premier revenu de l'accueil (ONB-02).
- Une échéance ouvre directement son objet (dette, objectif) avec « Marquer payé », « Reporter », « Modifier » ; un événement prévu ne touche jamais le réel avant confirmation.
- Cash projeté = solde des comptes + revenus planifiés − dépenses planifiées (C23, en rouge), sans solde saisi à la main.
- **Précisions du 2026-10-27** (étape P2 de `02_Premier_Demarrage`, onglet `08B_Recurrences`) : pour un salaire, demander aussi la **règle si le jour tombe un week-end** et le compte destinataire ; le jour venu, quatre réponses : **Confirmer, Modifier, Pas reçu, Reporter**. Prochaine occurrence = PB-F021 (calculateur CAL-P13).
**Réalisé le 2026-10-27.**
- **Onglets** Tout / Revenus / Dépenses / Échéances (vues mois et semaine ; la liste par jour sert de vue agenda sur téléphone). Les échéances de dettes et les dates d'objectifs y apparaissent avec un lien « Ouvrir » vers leur objet, sans être comptées dans le cash.
- **Récurrences complètes** (onglet 08B) : compte, mode de création (« me demander de confirmer » par défaut, « enregistrer comme réalisé », « comme prévu »), **règle de week-end** (jour ouvré précédent par défaut — question C4 ; le week-end algérien est vendredi-samedi), rappels J-7 / J-3 / J / J+1 (désormais réellement générés à ces jours-là, par occurrence).
- **Le jour venu : Confirmer, Modifier, Pas reçu, Reporter** (`POST /api/fin/calendrier/occurrences`). Rien de réel avant confirmation ; une occurrence n'est créditée qu'**une seule fois** (table `fin_occurrences`, unique par récurrence et date — QA-P05). Le mode « réalisé » crée seul les occurrences échues (sur 62 jours au plus).
- **Cash projeté = solde des comptes (PB-F002) + entrées prévues − sorties prévues**, plus aucun solde saisi à la main (fin de C7, `P8-04`).
- PB-F021 (prochaine date, règle du jour) appliqué à chaque occurrence. Migration `20261027160000_fin_calendar_occurrences`.
- **Restent** : la question « Quel jour recevez-vous votre salaire ? » posée au premier démarrage (`P8-23`), et le salaire comme premier revenu de l'Accueil (`P8-24`).

### P8-12 — Objectifs & sécurité : un seul compartiment, et des objectifs qui simulent
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P8-03`, `P8-04`
- Durée cible : 3 jours (estimation)
- Origine : cahier consolidé, OBJ-01 à OBJ-04, onglets 16 et 16B, G-07, G-08 ; ancien cahier C09 à C12 surlignés ; reprise de `/objectifs` (`P6-08`) et `/reserve` (`P6-09`)

- **Fusion** de `/objectifs` et `/reserve` ; le fonds d'urgence est un type d'objectif (GO-01), avec la cible du nouveau cahier selon le profil pédagogique — lycéen 1 mois, étudiant 2, jeune actif ou salarié stable 3, revenu irrégulier 6 — **toujours modifiable** (`P8-01` point 3).
- **17 modèles d'objectifs** (`P8-01` point 2 : GO-01 à GO-11, plus G09, G10, G13, G16, G17, G19 ; les modèles existants qui se superposent sont retirés du catalogue, jamais des objectifs déjà créés) ; « Réserve de sécurité » et « épargne projet » dans le catalogue (C09 modifié) ; aucun calcul avant montant et horizon, et un montant ou un horizon ne manque qu'à la création (C09, en rouge).
- Statuts en cours / atteint / en pause / arrêté.
- **Détail** : anneau avec le pourcentage au centre et le montant déjà affecté sur la cible, reste à atteindre, mois minimum, historique des contributions avec leur compte source, projection (retard ou avance, contribution nécessaire) — et des **scénarios** : contribution, horizon, inflation, rendement hypothétique, hausse annuelle de l'épargne (C11, en rouge), paramètres que l'utilisateur saisit lui-même dans le formulaire du scénario ; le « Pourquoi ? » de ces chiffres garde sa phrase courte (`P8-01` point 7).
- Une contribution réelle est un transfert vers le compte de l'objectif (ARC-04).
- **Formules du client** : PB-F014 (progression, affichage plafonné à 100 % et excédent à part), PB-F015 (reste), PB-F016 (mois minimum), PB-F017 à PB-F019 (fonds d'urgence, mesuré sur le **capital de son objectif**) — calculateurs CAL-P09 et CAL-P10 ; routes `/goals` et `/goal-contributions`. Une contribution qui est un transfert entre deux comptes inclus n'est **jamais déduite deux fois** (étape P6). Le client a ajouté à la main « épargne » sous la liste des objectifs (onglet `10_Objectifs_Urgence`) : couvert par le modèle G17 « épargne long terme », gardé (`P8-01` point 2).
**Réalisé le 2026-10-27.**
- **Un seul compartiment** : la page Objectifs (`/app/objectifs`) s'ouvre sur le **fonds d'urgence** (mois couverts, cible, manque — PB-F017 à PB-F019) avec son détail sous `/app/objectifs/fonds-urgence` ; l'ancienne adresse `/reserve` y redirige.
- **Cible du fonds d'urgence selon le profil** quand la personne n'en a pas choisi : lycéen 1 mois, étudiant 2, jeune actif ou salarié 3, **revenu irrégulier 6** — case « Mon revenu est irrégulier » ajoutée au profil financier (déclaré, jamais détecté : question C3). Un profil que le client ne nomme pas (épargnant) n'a pas de cible imposée. Toujours modifiable.
- **17 modèles** (`server/scripts/generate-goal-catalog.py` pour GO-01 à GO-11, plus G09, G10, G13, G16, G17, G19) ; un GO qui recouvre un ancien modèle en garde la clé, donc aucun objectif existant ne change. Montant **et horizon demandés à la création** (C09).
- **Statuts** en cours / atteint / en pause / arrêté.
- **Détail** : anneau de progression (% au centre, capital sur cible, excédent à part), PB-F014 (affiché plafonné à 100 %), PB-F015, PB-F016 (mois minimum), contribution nécessaire, historique des contributions avec leur compte source.
- **Une contribution réelle est un transfert** vers le compte de l'objectif (`POST /api/fin/goals/:id/contributions`), compte d'épargne créé au premier versement et visible dans « Mes comptes » ; le capital de l'objectif est alors le solde de ce compte — jamais saisi, jamais compté deux fois, et le solde total ne bouge pas.
- **Scénarios** (`POST /api/fin/goals/:id/scenario`, ALG-03) : contribution, horizon, inflation, rendement hypothétique, hausse annuelle, saisis par la personne ; rien n'est enregistré, toutes les hypothèses reviennent avec la réponse.
- Migration `20261027170000_fin_goals_accounts`.

### P8-13 — Dettes et créances
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P8-03`
- Durée cible : 3 jours (estimation)
- Origine : cahier consolidé, DET-01 à DET-05, onglet 17, G-11, QA-P08 ; ancien cahier C13 et C14 surlignés ; reprise de `/dettes` (`P6-10`)

- **« J'ai prêté »** (une créance : sortie réelle du compte au moment du prêt) ; **« On m'a prêté »** (une dette simple : entrée réelle à la réception) ; **emprunt bancaire** ; **carte de crédit** (un passif : un achat l'augmente, le règlement le réduit, QA-P08) ; **découvert** (un attribut du compte courant, pas un compte).
- Créances et dettes toujours séparées ; encours = somme des capitaux restants, taux d'effort = mensualités obligatoires / revenus nets (C13, en rouge).
- Stratégies : dette la plus coûteuse d'abord, petite dette d'abord, paiement supplémentaire ; date sans dette et économie. Taux inconnu → seul le capital est simulé. Jamais « bonne » ou « mauvaise » dette.
- **Formules du client** : PB-F020 (ratio dette / revenu), PB-F027 (solde d'une carte de crédit), ALG-P01 (stratégie de remboursement) — calculateurs CAL-P11, CAL-P12 et CAL-P16 ; routes `/debts`, `/receivables`, `/debt-payments`. Chaque échéance se lie au calendrier **et au budget** (étape P7).
**Réalisé le 2026-10-27.**
- **« J'ai prêté » (D-01) et « On m'a prêté » (D-02)** (`POST /api/fin/debts/pret`) : l'argent bouge réellement le jour même, entre le compte de la personne et un compte propre au prêt — une créance (AC-09) ou un prêt (AC-08) — par un transfert : ni revenu ni dépense. Le remboursement est aussi un transfert (`/paiements` avec le compte choisi), et l'encours suit.
- **Créances et dettes toujours séparées** : sens « owed » / « lent » et type D-01 à D-05 sur chaque ligne (migration `20261027180000_fin_debts_receivables`) ; l'encours, le taux d'effort (désormais **PB-F020**) et les stratégies ne portent que sur les dettes ; les créances ont leur propre total et leur propre section.
- **Carte de crédit (D-04)** et **découvert (D-05)** : déjà portés par les comptes (`P8-03`, `P8-05`) — une carte est un compte passif (PB-F027), un découvert un attribut du compte courant (« découvert autorisé »).
- Stratégies (dette la plus coûteuse d'abord, petite dette d'abord, paiement supplémentaire) inchangées depuis `P6-10` (ALG-01) ; taux inconnu → la dette est exclue de la simulation, et l'écran le dit.
- **Reste** : le rattachement d'une échéance de dette au budget (étape P7 du premier démarrage) arrive avec `P8-23`.

### P8-14 — Patrimoine réel et portefeuille fictif
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P8-05`, `P8-13`
- Durée cible : 2 jours (estimation)
- Origine : cahier consolidé, PAT-01, PAT-02, PF-01, onglets 18 et 19, G-12, QA-V7-04 ; ancien cahier C16 et C17 surlignés ; reprise de `P6-11` et `P6-12`

- Les liquidités viennent **automatiquement** des comptes inclus au patrimoine ; les autres classes (immobilier, or et métaux, véhicule, entreprise, placements réels, créances) restent déclarées et datées ; les passifs viennent des dettes, des cartes et des découverts.
- Le portefeuille fictif est placé sous le patrimoine (ou garde une entrée dédiée, selon l'onglet 03), avec le badge « Simulation pédagogique » permanent, son journal daté et un export toujours marqué ; il ne modifie jamais le solde, le patrimoine ni la santé financière (QA-V7-04).
- **Formules du client** : PB-F003 (position nette des comptes) et PB-F024 (patrimoine net issu des comptes, complété par les autres actifs) — calculateur CAL-P17. Les cartes de paiement ne sont jamais des actifs séparés (PB-PR-09).
**Réalisé le 2026-10-27.** Le patrimoine réel lit les comptes (`wealthFromAccounts`, `server/src/controllers/finWealth.controller.js`) :
- les **liquidités viennent automatiquement** des comptes comptés dans le patrimoine (leur solde PB-F001) ; un actif déclaré « espèces / compte / CCP » n'est alors plus compté, le compte le porte déjà ;
- les autres classes (immobilier, or, véhicule, entreprise, placements) restent déclarées et datées ;
- les **passifs** sont les dettes et les comptes passifs (cartes, prêts) ; une dette portée par un compte n'est comptée qu'une fois, par lui ;
- une **créance** (« J'ai prêté ») est un actif, jamais une dette ;
- patrimoine net = **PB-F024** (au lieu de F035).
- Le portefeuille fictif garde son entrée dédiée (onglet 03 : « sous Patrimoine ou entrée dédiée »), son badge « Simulation » permanent et sa séparation (`P6-12`) : il ne touche ni le solde, ni le patrimoine, ni la santé financière.
- **Reste** : l'historique du patrimoine net (`/patrimoine/historique`) lit encore les seuls actifs déclarés → `P8-24`.

### P8-15 — Outils : un seul catalogue
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P8-02`
- Durée cible : 2 jours (estimation)
- Origine : cahier consolidé, OUT-01, OUT-02, onglets 20 et 23 ; ancien cahier C15, C19 et SA05 surlignés

- Un seul catalogue (recherche, familles, favoris), ouvert depuis le carré « Outils » de l'Accueil et depuis le menu : les calculateurs CAL-01 à CAL-30 et CAL-V7-01 à CAL-V7-05, hors calculateurs collectifs ; l'atelier de simulation.
- Revoir contre l'ancien cahier les trois écrans qu'il a surlignés : fiche de paie (C15 : importer, saisir, expliquer une ligne, **ajouter au revenu mensuel** après confirmation ; gardée telle quelle, `P8-01` point 10), moteur de comparaison (C19 : 2 à 3 options, critères, poids modifiables, export), préparation au financement (SA05).
- **Précisions du 2026-10-27** : les 17 calculateurs CAL-P01 à CAL-P17 du dernier fichier (onglet `12_Calculateurs`) rejoignent le catalogue, chacun branché sur sa formule PB-F ; le client a ajouté à la main « réserve de sécurité » sous cette liste : un calculateur de réserve y figure (CAL-P10 fonds d'urgence, ou l'actuel CAL-05 du consolidé).
- **Fiche de paie (réponse du client D5, 2026-10-28)** : constat du même jour, **aucun écran n’existe** — `P4-14` n’a livré que le calcul côté serveur (`POST /api/fin/paie/decoder`). À faire : l’outil « Décodeur de fiche de paie » dans le catalogue, complet : saisie ou import, brut, primes, cotisations, retenues, IRG, net théorique, rapprochement avec la fiche réelle, données extraites confirmées avant calcul, et **historique** des fiches (conservées avec le consentement de la personne, ce que `P4-14` ne faisait pas). +2 jours.
- **JA09 « Comparer un financement »** (en rouge dans l’ancien cahier) : l’outil existe (`/app/outils/credit`) ; il doit apparaître sous ce nom dans le catalogue.

### P8-16 — Santé financière : une page à part entière
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Dépendances : `P8-04`, `P8-09`
- Durée cible : 2 jours (estimation)
- Origine : cahier consolidé, HEA-01, onglet 21, F053 ; ancien cahier SA02 surligné

- L'indice, ses sous-scores (décision `P8-01` point 4 : équilibre du mois 25, réserve 20, dette 20, épargne 15, objectifs 10, budgets 5 — sous-score AN-F003 —, qualité des données 5 ; « stabilité des revenus » retirée ; poids par défaut, versionnés), l'historique, « Voir pourquoi » (la phrase courte, sans poids ni formule, `P8-01` point 7) et « Compléter ». Indice partiel quand des dimensions manquent ; jamais un score de crédit.
**Réalisé le 2026-10-27.**
- Les **sept dimensions du consolidé** (version de barème `B-8`) : équilibre 25, réserve 20, dette 20, épargne 15, objectifs 10, **budgets 5** (remplace « stabilité des revenus »), qualité 5 — poids par défaut versionnés, présentés au client à la recette.
- Sous-score **« Respect des budgets »** = dépenses réelles des enveloppes / montants alloués (report compris), ramené sur 100 : **100 tant qu'on reste dans les budgets, puis baisse proportionnelle jusqu'à 0 à 200 %** (question C5, valeur par défaut) ; sans budget, non mesuré.
- Page `/app/sante` : l'indice, « indice partiel » quand des dimensions manquent (elles sortent du calcul, jamais 0), chaque sous-score avec sa phrase courte « Pourquoi ? » **sans poids ni formule** (`P8-01` point 7), « Compléter » vers l'écran qui mesurerait une dimension absente, et la mention « ce n'est pas un score de crédit ». L'Accueil y renvoie par « Voir pourquoi ».
- **Restent** : l'historique de l'indice (aucun instantané n'est encore conservé), et les dimensions « objectifs » et « qualité des données » qui ne sont pas encore mesurées par leurs modules → `P8-24`.

### P8-17 — Formation, progression et certificats : la seule couche qui varie selon le profil
- Statut : `🚧 in-progress`
- Priorité : `🟡 medium`
- Dépendances : `P8-02`
- Durée cible : 3 jours (estimation)
- Origine : cahier consolidé, ONB-01, FOR-01 à FOR-03, onglets 02 et 22, QA-V7-01

- **Profil éducatif** au premier démarrage (ONB-01, étape P0) : lycéen, étudiant, jeune actif, salarié, épargnant **ou « autre / libre »** (sixième profil du dernier fichier, onglet `16_Education` : bibliothèque complète, recommandations selon les besoins saisis) ; tranche d'âge ; objectifs d'apprentissage ; modifiable plus tard ; ne limite rien.
- **Formation** : les contenus propres au profil (onglet 22), en reprenant le catalogue, « Apprendre », le glossaire et les guides. **Progression** : compétences, jalons, missions (reprise de `P2-10`, décision `P8-01` point 5) et l'indice de connaissances (`P2-09`). **Certificats** pédagogiques par parcours (Avenir, Campus, Premier Revenu, Pilotage financier personnel, Épargne), qui ne certifient aucune aptitude réglementée, avec la vérification publique déjà en place (`P2-05`).
- Migration des comptes dont le public est COL, COU ou FAM : choix d'un des cinq profils à la prochaine connexion ; leurs espaces partagés passent dans Gestion commune (Phase 9) sans perte.
- **Précision du 2026-10-27** : six profils, en comptant « autre / libre » (onglet `16_Education`). Pour tous : « toutes les fonctions budget restent visibles ; l'utilisateur choisit ce qu'il renseigne ».
- **Contenus (réponse du client E, 2026-10-28)** : le client fournit lui-même les contenus des missions et de la formation par profil. Cette tâche construit la structure et l’affichage ; les contenus sont chargés à réception.
- **Parcours « Premier Revenu »** (écrans JA01, JA03, JA04 de l’ancien cahier, en rouge) : transition vers le premier revenu, plan du premier salaire, organiser son premier revenu — la partie pédagogique ici, la partie saisie dans `P8-23`.
- **Liens des pages de formation** : elles pointent encore vers `/catalogue/…` (redirigé vers `/app/formation/…`) ; les écrire directement en `/app/formation/…` (relevé par `P8-26`).

**Avancement au 2026-10-28 (tâche toujours en cours).**
- Fait : les six profils éducatifs du client (`server/src/constants/finEducation.js`, mots des onglets 22 et 16), dont « autre / libre » (`AUT`, migration `20261028140000`) ; les profils COL, COU, FAM ne sont plus proposés et leurs titulaires sont invités à choisir ; une formation se rattache à des profils (`educationProfiles`, case à cocher dans l’éditeur d’administration) ; un parcours est la formation à l’adresse convenue (`parcours-avenir`, `parcours-campus`, `parcours-premier-revenu`, `parcours-mon-argent`, `parcours-epargne-investissement`), avec son certificat existant ; `GET /api/fin/formation/parcours` ; le bloc « Mon parcours » sur Formation, Progression et Certificats ; les liens des pages de formation restent dans l’application (`useCatalogueBase`).
- Vérifié : `tests/functional/finEducation.test.js` (5/5), `tests/e2e/fin-education-journey.test.js` (3/3), tests profil, formations, apprentissage et passeport verts.
- **À reprendre en premier** : `tests/e2e/formation-journey.test.js` a 3 échecs non encore analysés (probablement les liens `/catalogue` devenus `/app/formation`, ou le bloc « Mon parcours » au-dessus du catalogue) ; puis lancer `npm test` et `npm run test:e2e` en entier avant de clore.
- Restent dans le périmètre : les missions (contenus attendus du client, réponse E) et le parcours « Premier Revenu » côté saisie (`P8-23`).

### P8-18 — Alertes et états du moteur personnel
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P8-09`, `P8-11`
- Durée cible : 2 jours (estimation)
- Origine : cahier consolidé, onglet 25 (AL-P01 à AL-P12 et états) ; reprise de `P6-18`

- Les douze alertes du consolidé (revenu attendu, solde minimum, compte débiteur, budget à 80 % et dépassé, échéance J-7 / J-3 / J, paiement régulier, objectif, fonds d'urgence, dette, donnée manquante, formation), dans l'application toujours, et par notification du navigateur pour qui l'accepte (décision `P8-01` point 9 ; pas de SMS).
- Les états : vide, chargement, donnée ancienne, partielle, erreur technique, compte négatif, budget dépassé, doublon suspect.
- **Familles de notifications (réponse du client D7, 2026-10-28)** : chaque type de notification appartient à une famille — budgets, revenus, échéances, dettes, objectifs, formation, sécurité — et la personne règle chaque famille (aujourd’hui : 5 types rangés en action / information / sécurité). Centre de notifications seulement ; l’e-mail viendra avec un fournisseur d’envoi.
- **Rappel du client (2026-10-28 au soir) : « il ne faut pas oublier les alertes »** — priorité relevée. Constat du même jour : sur les douze, seules AL-P02 (solde minimum) et AL-P03 (compte débiteur) existent, sur l’écran des comptes ; le centre de notifications ne connaît que 5 types. Chaque alerte AL-P01 à AL-P12 a son déclencheur testé, sa notification, et son entrée dans « Aujourd’hui » quand elle demande une action.

**Réalisé le 2026-10-28.**
- **Un générateur pour toutes les alertes** (`server/src/services/finAlerts.service.js`), lu à l’ouverture des notifications et de l’écran du jour (au plus une fois toutes les 5 minutes par personne) : jusqu’ici une alerte ne partait qu’en ouvrant son propre écran, et le jalon d’objectif ne partait jamais.
- **Les douze alertes du client** : AL-P01 revenu attendu à confirmer ; AL-P02 / AL-P03 compte sous le seuil, à découvert, au-delà du découvert autorisé ; AL-P04 / AL-P05 budget à 80 % et dépassé, sans avoir à ouvrir le budget ; AL-P06 rappels (sur consentement, inchangé) ; AL-P07 paiement prévu passé et non confirmé ; AL-P08 objectif en retard, jalon (25, 50, 75, 100 %), contribution mensuelle oubliée (à partir du 25 du mois) ; AL-P09 fonds d’urgence sous un mois, sous la cible, cible atteinte ; AL-P10 échéance de dette à J-3 et dépassée, part du revenu prise par les mensualités à 30, 40 et 50 % ; AL-P11 et AL-P12 dans « Aujourd’hui », et AL-P12 aussi en notification après une semaine sans reprendre une formation. Seuils et messages du référentiel du client (`constants/finAlerts.js`, onglet `13_Alertes`). Rien sur les dettes ni le fonds d’urgence pour un mineur déclaré.
- **Familles (réponse D7)** : budgets et comptes, revenus, échéances, dettes, objectifs et fonds d’urgence, formation, sécurité et partage ; chaque type porte sa famille et le code d’alerte du client ; le centre de notifications règle une famille d’un coup, puis chaque alerte.
- Tests : `tests/functional/finAlerts.test.js` (une alerte par scénario, une famille coupée, un mineur), tests des notifications mis à jour.
- **Reste** : la notification du navigateur (Web Push, décision `P8-01` point 9) n’est pas branchée ; les alertes sont dans l’application → `P8-24`.

### P8-19 — Recherche et assistant adaptés au moteur unique
- Statut : `❌ todo`
- Priorité : `🟢 low`
- Dépendances : `P8-02`
- Durée cible : 1 jour (estimation)
- Origine : cahier consolidé, SEA-01, CHAT-01, onglet 26 ; reprise de `P6-20` et `P3-19`

- La recherche couvre comptes, transactions, budgets, objectifs, outils et contenus ; liens profonds vers les nouvelles adresses.
- Les intentions collectives quittent l'assistant personnel (décision `P8-01` point 10 : elles passent dans Gestion commune).

### P8-20 — Paramètres : données et confiance
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P8-02`
- Durée cible : 1 jour (estimation)
- Origine : cahier consolidé, DATA-01, F055 ; ancien cahier C25 surligné (titre en rouge) ; reprise de `/confiance` (`P6-19`)

- Revoir contre l'ancien C25 ce qui manque : inventaire des données (origine, date, statut, usage), consentements, exports, suppression, **appareils et sessions connectés** (« déconnecter un appareil »), fraîcheur, réauthentification avant une action sensible.

### P8-21 — Contrôles du client et règle « trouvable »
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P8-06`, `P8-07`, `P8-09`, `P8-10`, `P8-11`, `P8-12`
- Durée cible : 3 jours (estimation)
- Origine : cahier consolidé, onglet 28 (QA-P01 à QA-P10, QA-V7-01 à QA-V7-06) ; diagnostic n°1, défaut 5

- Les seize contrôles du client deviennent des tests automatisés : unitaires pour les calculs, navigateur **depuis le menu** pour les écrans.
- Un contrôle automatique vérifie que chaque compartiment est atteignable depuis la navigation, pour chacun des cinq profils.
- La matrice de provenance distingue un écran servi par sa propre page d'un écran regroupé dans une autre.

**Réalisé le 2026-10-28.**
- **Les seize contrôles du client** sont des tests, un par contrôle, avec ses chiffres et dans son ordre : `server/tests/functional/finClientQa.test.js` (16 sur 16). Les écrans de QA-V7-01 et QA-V7-05 sont aussi vérifiés en navigateur (`tests/e2e/app-shell.test.js`).
- **« Trouvable »** : `tests/e2e/fin-client-qa-journey.test.js` part du menu, pour chacun des cinq profils (LYC, ETU, JAC, SAL, EPG), et atteint en deux clics au plus chacun des 19 écrans qui ont leur propre page dans l’application. 5 sur 5.
- **La matrice de provenance** des 44 écrans du consolidé : `server/src/constants/finAppScreens.js`, publiée dans `LIVRABLES/MATRICE_ECRANS.md`. Le test de cohérence vérifie qu’il y en a bien 44, que chaque adresse existe dans le routeur du client, que le premier clic est une entrée du menu, et que chaque écran regroupé nomme une tâche encore ouverte. **21 écrans ont leur propre page, 21 sont regroupés dans une autre** (18 confiés à `P8-25`, 2 à `P8-23`, 1 à `P8-24`), 2 vivent dans la barre supérieure.
- **Défauts trouvés par ces contrôles, et corrigés** :
  - aucun rappel de récurrence (J-7, J-3, J, J+1) n’était jamais envoyé, car la lecture du calendrier ne chargeait pas `reminderDays` (`P8-11`, trouvé par QA-P05) ;
  - la page Certificats n’avait pas l’en-tête des autres écrans et renvoyait vers les anciennes adresses du catalogue ;
  - le test navigateur « un mineur ne voit pas les entrées réservées aux majeurs » lisait le menu avant le chargement du compte ;
  - les fichiers navigateur restaient parfois ouverts sous Windows après leurs résultats : `npm run test:e2e` passe `--test-force-exit`, ce qui ne masque aucun échec.
- **Écart signalé** : la règle « trouvable » de la section 6 veut une adresse propre pour chaque écran ; 18 écrans de formulaire ou de détail n’en ont pas. Le travail est décrit dans `P8-25` (environ 5 jours), dont le périmètre est à valider par l’utilisateur.

### P8-23 — Premiers pas : le parcours de premier démarrage (P0 à P7)
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P8-05`, `P8-09`, `P8-11`, `P8-17`
- Durée cible : 2 jours (estimation)
- Origine : dernier fichier du client (2026-10-27), onglet `02_Premier_Demarrage` ; principe PB-PR-03 ; ancien cahier SA01 surligné ; reprise de `/compte/premiers-pas` (`P6-03`)

Remplace l'actuel accueil par questions propres à chaque public (`P6-03`) par le parcours du client, en huit étapes, chacune facultative sauf la première :
- **P0** choisir le profil éducatif (`P8-17`) — l'application complète s'ouvre, quel que soit le choix ;
- **P1** créer le premier revenu (nom, catégorie, montant, devise, fréquence, jour habituel, date de début, compte à créditer, confirmation mensuelle ou non) ; sans compte, proposer « Espèces » ou « Créer un compte » ; **pour un lycéen ou un étudiant, proposer d'abord les revenus de sa catégorie** (bourse, aide familiale, job étudiant, stage) ;
- **P2** confirmer la date du salaire ou du revenu (jour, fréquence, règle si week-end, montant attendu, compte) ;
- **P3** créer ou compléter ses comptes ;
- **P4** créer ses premières dépenses — permises sans budget, rattachées plus tard à un budget compatible ;
- **P5** définir ses budgets — les dépenses déjà saisies de la même période et catégorie les consomment aussitôt ;
- **P6** ajouter objectifs et fonds d'urgence ;
- **P7** ajouter dettes et créances si besoin.

« Saisie libre et progressive » (PB-PR-03) : chaque étape se passe et se reprend plus tard ; ce qui n'est pas renseigné est « non calculé », jamais zéro.
- **Premier salaire (JA01, JA03, JA04 de l’ancien cahier, en rouge : non intégrés)** : P1 et P2 en sont la saisie — premier revenu, jour du salaire, règle du week-end (« jour ouvré précédent » présélectionné, réponse C4 du 2026-10-28), compte crédité ; à la fin, un plan du premier salaire (budgets proposés, fonds d’urgence, objectif) que la personne accepte ou modifie.
- **Régularité du revenu** (réponse C3) : demandée en P1, « Stable | Irrégulier | Saisonnier ».
- **Catégories à retirer avec l’ancien accueil (réponse D4, reportées par `P8-26`)** : la famille `goal` (14 catégories : les contributions sont des transferts depuis `P8-12`, mais l’accueil actuel et la détection de l’épargne lisent encore cette famille) et « Autre charge fixe », « Transport récurrent » (essentielles pour la réserve) ; les ajouter à `RETIRED_CATEGORIES` une fois le nouvel accueil en place.

### P8-24 — Reliquats des écrans livrés le 2026-10-27
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P8-06`, `P8-10`, `P8-11`, `P8-14`, `P8-16`
- Durée cible : 3 jours (estimation)
- Origine : restes des tâches closes le 2026-10-27 ; créée le 2026-10-28 pour qu'aucun ne se perde

Ce que ces tâches livrées n'ont pas fini, rassemblé ici :
- **Accueil** (`P8-06`) : l'ajout rapide en feuille glissante sur téléphone, au lieu d'ouvrir la page Mouvements ; l'anneau qui se change en mini-courbe au défilement ; le salaire comme premier revenu affiché (`P8-11`).
- **Synthèse et rapport** (`P8-10`) : la section R-06 (scénarios d'épargne), la cascade mensuelle et les autres graphiques de l'onglet 13 (seuls G-01, G-02, G-05 et G-07 existent) ; la comparaison de deux mois au choix ; des instantanés de rapport conservés.
- **Patrimoine** (`P8-14`) : l'historique du patrimoine net doit lire les comptes, pas seulement les actifs déclarés.
- **Santé financière** (`P8-16`) : l'historique de l'indice (instantanés conservés) ; les dimensions « objectifs » et « qualité des données » mesurées par leurs modules.
- **Alertes** (`P8-18`) : la notification du navigateur (Web Push) pour qui l’accepte, en plus de l’application.

### P8-25 — Une adresse propre pour chaque écran regroupé
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P8-21`
- Durée cible : 5 jours (estimation)
- Origine : matrice de provenance de `P8-21` (2026-10-28) ; règle « trouvable » de la section 6 (« un écran du client a sa propre adresse, jamais une section dépliable dans la page d’un autre »)

La matrice (`server/src/constants/finAppScreens.js`, `LIVRABLES/MATRICE_ECRANS.md`) montre que **18 des 44 écrans** du cahier consolidé sont aujourd’hui une section, un formulaire ou un panneau d’une autre page : COM-02, COM-03, COM-04, TRX-02, TRX-03, TRX-04, BUD-02, BUD-04, SYN-02, REP-01, CAL-02, OBJ-02, OBJ-03, DET-02, DET-03, DET-04, DET-05, PAT-02.
- Chacun reçoit son adresse (par exemple `/app/comptes/nouveau`, `/app/comptes/:id`, `/app/mouvements/:id`, `/app/objectifs/:id`, `/app/synthese/rapport`), ouverte depuis la page de son menu en un clic ; une adresse recopiée ou mise en favori rouvre le même écran.
- **Décision de l’utilisateur (2026-10-28)** : chaque écran a son adresse ; **seuls les petits éléments d’interface restent dans leur page** — confirmations, sélecteurs, filtres rapides, infobulles, petites fenêtres d’appoint. Un écran du cahier (formulaire complet, détail, rapport, stratégie) n’est jamais l’un d’eux.
- Sur téléphone, un formulaire peut rester une feuille glissante, mais une feuille qui a son adresse.
- La matrice passe chaque écran de « regroupé » à « page », et le parcours navigateur de `P8-21` l’atteint depuis le menu.

### P8-26 — Réponses du client du 2026-10-28 : corriger ce qui est déjà livré
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P8-08`, `P8-09`, `P8-12`, `P8-16`, `P8-02`
- Durée cible : 4 jours (estimation)
- Origine : réponses du client du 2026-10-28 (voir `P8-01`), comparées le même jour au code livré

Ce que les réponses changent dans des tâches déjà terminées :
- **Report (C1)** : garder `max(0 ; reste)` par défaut, et proposer à l’utilisateur, budget par budget, de reporter son dépassement en le soustrayant du mois suivant ; le dépassement reste visible dans l’historique et le rapport.
- **Reste à allouer (C2, PB-F009)** : retirer aussi les **provisions** prévues de la période (aujourd’hui : seules les contributions mensuelles aux objectifs, fonds d’urgence compris, sont retirées).
- **Régularité du revenu (C3)** : remplacer la case « revenu irrégulier » (`finIrregularIncome`) par « Stable | Irrégulier | Saisonnier » dans le profil ; la cible du fonds d’urgence la lit (6 mois pour irrégulier ; saisonnier à fixer de la même façon, 6 mois par défaut).
- **Score « Budgets » (C5)** : aujourd’hui un rapport global (dépenses de toutes les enveloppes / total alloué) ; le client veut un score **par budget**, puis leur **moyenne pondérée par le montant alloué**.
- **Modèles d’objectifs (D1)** : les six modèles gardés prennent les codes du client GO-12 à GO-17 (aujourd’hui G09, G10, G13, G16, G17, G19) ; « Autre objectif » reçoit **icône et couleur** personnalisées (aujourd’hui : ni l’une ni l’autre — C09 en rouge dans l’ancien cahier).
- **Navigation (D3, avec les améliorations retenues le 2026-10-28, voir `P8-01`)** : sections *Au quotidien* (Accueil, Aujourd’hui, Mes comptes, Mouvements, Budgets, Calendrier financier), *Analyser* (Synthèse, Santé financière), *Construire* (Objectifs & sécurité, Dettes, Patrimoine réel, Portefeuille fictif), *Outils*, *Apprendre* (Formation, Progression, Certificats) ; « Aujourd’hui » avec un compteur ; barre du bas : Accueil, Aujourd’hui, Mes comptes, Mouvements, Plus ; la page `/app/aujourdhui` devient la liste qu’il décrit (et non plus l’ancien tableau de bord par public, `P8-06`).
- **Catégories (D4)** : les 125 deviennent les seules catégories standard pour les mouvements. Des 64 anciennes catégories sans équivalent, celles de revenus et de dépenses sont remappées vers une des 125, leurs lignes suivent, l’historique garde la trace ; aucune nouvelle saisie ne peut plus les choisir (détail et reports dans « Réalisé » ci-dessous).
- **Préparation au financement (JA08, en rouge)** : la page `/app/financement` existe mais n’est atteinte depuis rien ; elle rejoint le catalogue des Outils et l’écran Dettes.
- Chaque correction a son test ; les contrôles de `P8-21` restent verts.

**Réalisé le 2026-10-28.**
- **Report (C1)** : `max(0 ; reste)` par défaut ; nouveau choix par budget « Reporter aussi le dépassement » (`carryOverspend`, migration `20261028100000`), qui retire le dépassement du budget suivant sans jamais rendre une enveloppe négative. Tests : les deux exemples du client (25 000 sur 30 000 → 5 000 reportés ; 35 000 → rien, sauf si la personne choisit de reporter le dépassement).
- **Reste à allouer (C2)** : les provisions mensuelles (F045) des provisions en cours sont retirées avec les contributions aux objectifs ; le détail `contributions_objectifs` et `provisions` figure dans les entrées de PB-F009.
- **Régularité du revenu (C3)** : `finIncomeRegularity` « stable | irregular | seasonal » remplace la case (migration `20261028110000`, qui garde « irrégulier » pour qui l’avait coché) ; irrégulier ou saisonnier → 6 mois de fonds d’urgence par défaut ; liste déroulante dans le profil.
- **Score « Budgets » (C5)** : un score par budget de la période (100 si r ≤ 1, 100 × (2 − r), 0 à 200 %), puis la moyenne pondérée par le montant alloué ; sans budget, la dimension sort du calcul. Tests : les exemples du client et le cas « 60 000 DA de loyer contre 2 000 DA ».
- **Objectifs (D1)** : les six modèles portent GO-12 à GO-17, avec icône et couleur (migration `20261028120000`, qui remappe les objectifs déjà créés) ; « Autre objectif » reçoit son icône et sa couleur, affichées sur la carte de l’objectif.
- **Navigation (D3)** : menu en cinq sections dans l’ordre retenu, « Aujourd’hui », « Mouvements » et « Budgets » au menu, barre du bas Accueil / Aujourd’hui / Mes comptes / Mouvements / Plus ; **« Aujourd’hui » est la liste à faire** (`aFaire` de `GET /api/fin/aujourdhui` : actions, revenus et paiements à confirmer avec leur bouton, mouvements à pointer, alertes, échéances, questions des premiers pas, dimensions de santé à compléter, formations en cours) et le menu affiche son compteur. Au passage : les échéances à venir de l’écran du jour ne relisaient pas les occurrences déjà confirmées.
- **Catégories (D4)** : **19** anciennes catégories de revenus et de dépenses sont retirées (`RETIRED_CATEGORIES`, migration générée `20261028130000` par `scripts/generate-retired-categories.js`) : leurs mouvements, ressources, enveloppes, récurrences, provisions, actifs, dépenses partagées et étiquettes passent sur une des 125, chaque déplacement de mouvement, de ressource ou d’enveloppe est journalisé, puis la catégorie est archivée — lisible sur l’historique, plus jamais proposée ni acceptée. Une enveloppe dont le budget a déjà la catégorie cible reste sur l’ancienne. La table de correspondance est à présenter au client à la recette (là où rien n’était proche : « Autre dépense »). **Reportés, et pourquoi** : la famille `goal` (l’épargne la lit encore) et « Autre charge fixe », « Transport récurrent » (l’accueil actuel écrit dessus, et elles comptent comme essentielles pour la réserve) partent avec `P8-23` ; la famille `shared` avec `P9-05` ; les familles `asset` et `debt` ne sont pas des catégories de mouvements (types d’actifs et de dettes).
- **Préparation au financement (JA08)** : dans le catalogue des Outils (application seulement) et depuis l’écran Dettes.
- Liens restés sur d’anciennes adresses corrigés pour les budgets et la recherche globale ; ceux des pages de formation (`/catalogue/…`, qui redirigent) reviennent à `P8-17`.
- **Validation** : suite complète du serveur, 1 892 tests réussis sur 1 894 (2026-10-28) ; les deux échecs sont l’échec connu de `P5-07` et un test de tri des notifications touché par `P8-18` en cours d’exécution, corrigé depuis.

### P8-27 — Retours du client du 2026-10-28 : couleurs des catégories et des flux, et les 3 suggestions
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P8-26`
- Durée cible : 3 jours (estimation)
- Origine : message du client du 2026-10-28 (« mettre des couleurs pour chaque catégorie, sous-catégorie, et les différencier entre les différents flux […] ne pas oublier les alertes et les 3 suggestions ») ; ancien cahier C04 (« 1–3 actions ») ; cahier consolidé onglet 09 (icône et couleur de chaque catégorie)

Constats du 2026-10-28, à l’écran :
- Les 125 catégories du client portent chacune une icône et une couleur, mais **aucun écran ne les montre** : ni la liste des mouvements, ni le choix d’une catégorie, ni les budgets ; seules les étiquettes sont colorées. Les anciennes catégories gardées et celles que crée l’utilisateur n’ont pas de couleur.
- **L’Accueil ne propose qu’une « prochaine action »**, alors que l’écran C04 du client en prévoit **une à trois** ; ce sont les « 3 suggestions » du message.

À faire :
- **Couleurs** : chaque catégorie (groupe) et chaque sous-catégorie a sa couleur et son icône, montrées partout où une catégorie apparaît (liste et saisie des mouvements, budgets, synthèse, rapport, calendrier, graphiques, anneau de l’Accueil). Une sous-catégorie sans couleur prend celle de son groupe ; une catégorie personnelle reçoit une couleur choisie à sa création.
- **Les flux se distinguent d’un coup d’œil** : une famille de couleurs pour les revenus, une pour les dépenses, une pour les transferts (et l’épargne), la même dans tout le moteur — montants, pastilles, graphiques, calendrier ; jamais la couleur seule (signe, libellé ou icône à côté, comme pour les alertes).
- **Les 3 suggestions** : l’Accueil montre une à trois actions, dans l’ordre du serveur (sécurité > échéance > budget > apprentissage), la première en carte « prochaine action », les deux autres à côté.
- Tests : chaque catégorie de la liste du serveur a une couleur ; les flux ont trois couleurs distinctes ; l’Accueil affiche jusqu’à trois actions.

**Réalisé le 2026-10-28.**
- **Une couleur pour chaque catégorie** : `categoryColor` (`server/src/constants/finCategories.js`) — la sienne (les 125), sinon celle de son groupe (la couleur de la première sous-catégorie du groupe, `GROUP_COLORS`), sinon celle de sa famille (`FAMILY_COLORS`) ; l’API renvoie `color` (jamais nul) et `groupColor`. Une catégorie personnelle peut recevoir sa couleur à la création.
- **Pastille de catégorie** (`client/src/components/fincludia/CategoryChip.jsx`) : icône sur sa couleur, libellé, et le groupe avec sa propre couleur ; dans la liste et la saisie des mouvements, le pointage, les enveloppes d’un budget (y compris une enveloppe sur un groupe entier) et les mouvements de l’Accueil.
- **Quatre flux, quatre couleurs** (`--flow-income`, `--flow-expense`, `--flow-transfer`, `--flow-savings` dans `index.css`, clair et sombre ; `client/src/lib/flows.js`) : liseré et montant de chaque mouvement, événements du calendrier ; le flux est aussi écrit (« Revenu », « Dépense »…), jamais la couleur seule ; une dépense est bleu océan, jamais le rouge des alertes.
- **Les 3 suggestions** : l’Accueil montre jusqu’à trois actions — la prochaine en carte, les deux autres à côté — et un lien vers « Aujourd’hui ».
- Tests : `tests/unit/finDataModel.test.js` (une couleur par catégorie, par groupe, par famille), `tests/functional/finCategories.test.js` (l’API, la couleur choisie), `tests/e2e/fin-colours-journey.test.js` (trois couleurs de flux distinctes à l’écran, la pastille, une à trois suggestions).

### P8-28 — Comparateurs et produits bancaires : affichage, rubriques vides, fiches du référentiel
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P8-02`
- Durée cible : 3 jours (estimation)
- Origine : message du client du 2026-10-28 (« les comparateurs bancaires s’affichent mal, ainsi que pour les autres produits bancaires ils ne se génèrent pas » ; « n’oublie pas d’intégrer le référentiel où il y a les produits bancaires ») ; vérifié le même jour sur la base de développement, en navigateur

Ce qui a été constaté :
- **Dans l’application** (`/app/outils/comparateur/…`), avec le menu à gauche, les tableaux sont plus larges que la page : la dernière colonne (par exemple « Remboursement anticipé » des crédits) est coupée, et rien ne signale qu’on peut faire défiler. Les cellules « Segment » vides quand la source ne le précise pas.
- **Trois rubriques n’ont aucune ligne** (coffres-forts, virements domestiques, chèques) et « opérations diverses » une seule : c’est le fichier du client qui l’indique (« Non documenté — à compléter uniquement à partir d’une source bancaire fournie »). L’écran les annonce « Bientôt disponible », ce qui laisse croire à un retard de notre part.
- L’en-tête annonce **13 banques**, aucune rubrique n’en compte plus de 12.
- **Les fiches produits ne sont pas publiées, par une prudence que le client lève aujourd’hui** : les 25 fiches de crédit du référentiel maître (onglet `03_Offres_Credit`, que le client avait marquées « publication désactivée avant contrôle des brochures ») et les 75 fiches d’Algérie Poste (CCP, EDAHABIA, BaridiMob : « 0 publiable », faute de pièce officielle datée).
- Sur la vitrine, le logo du pied de page s’affiche cassé (un « L » seul).

À faire :
- Tableaux qui tiennent dans la page de l’application : cartes empilées dès que la largeur manque (pas seulement sous 720 px), ou défilement signalé, première colonne fixe ; « Non précisé » au lieu d’une cellule vide.
- Rubriques vides : « Non documenté par la source du client — à compléter », jamais « Bientôt disponible » ; le compte des banques cohérent sur toutes les pages.
- **Publier les fiches à la demande du client (2026-10-28)** : les 25 offres de crédit dans la rubrique Crédits et dans « Comparer un financement », les 75 fiches d’Algérie Poste dans le comparateur, **chacune avec sa provenance et son statut déclaré** (« vérifié public selon la source du client », « à confirmer en agence ») — jamais présentées comme vérifiées par FINCLUDIA. Le périmètre des 14 familles de l’onglet `31_Comparateur_Themes` sert de liste des rubriques.
- Logo du pied de page de la vitrine.
- Tests : chaque rubrique s’affiche sans débordement à 1 024 et 1 280 px dans l’application ; une rubrique vide dit pourquoi ; les fiches publiées portent leur provenance.

**Réalisé le 2026-10-28.**
- **Affichage dans l’application** : le comparateur passe en cartes selon la largeur de **sa page** (requête de conteneur à 1 080 px), et plus seulement sous 720 px d’écran : à côté du menu, aucune colonne n’est coupée. « Non précisé » remplace la cellule vide d’un segment.
- **Défaut trouvé en vérifiant** : tous les liens du comparateur (rubriques, profils, fil d’Ariane) et ceux des simulateurs depuis « Apprendre » pointaient vers `/outils/…`, l’adresse de la vitrine, et **faisaient sortir de l’application**, sans son menu. `useToolsBase` (`client/src/lib/useToolsBase.js`) les garde sous `/app` quand on y est.
- **Rubriques vides** : « Non documenté par la source — à compléter », et sur la page de la rubrique la raison complète, au lieu de « Bientôt disponible ». Le « 13 banques » n’était pas une erreur (13 banques distinctes en tout, au plus 12 dans une rubrique) : l’en-tête dit désormais « 13 banques au total ».
- **Les 14 familles** de l’onglet `31_Comparateur_Themes` : les 11 rubriques, plus « CCP / Algérie Poste » (lien vers son outil) et « Assurances et garanties », « Gestion des comptes en ligne », annoncées non documentées.
- **Fiches publiées à la demande du client** (`server/src/constants/finPublication.js`, décision datée du 2026-10-28) : les 25 offres de crédit avec leurs critères tels que la source les écrit, leur statut déclaré et leur source, sur la page « Comparer un financement » et depuis la rubrique Crédits ; les 75 fiches d’Algérie Poste avec leur tarif. Chacune porte la mention « non vérifiée par FINCLUDIA » ; aucun calcul d’éligibilité n’en est tiré (`publiable` reste à 0).
- **Logo** : le pied de page de la vitrine affichait la lettre provisoire « L » de la première marque ; il affiche le logo FINCLUDIA.
- Tests : `tests/e2e/fin-comparator-journey.test.js` (pas de débordement à 1 280 et 1 024 px dans l’application, liens restés dans l’application, rubriques vides expliquées, 25 fiches avec critères et provenance, tarifs postaux avec leur source) ; tests postaux et `P4-05` réécrits pour la nouvelle règle ; `tests/e2e/comparator-journey.test.js` mis à jour (14 familles, « Non précisé »).

### P8-29 — Vitrine, compartiments et parcours de formation : refonte
- Statut : `⛔ blocked`
- Priorité : `🟡 medium`
- Dépendances : `P8-17`
- Durée cible : à estimer à réception des éléments du client
- Origine : message du client du 2026-10-28 (« il nous faut par la suite retaper la vitrine, les compartiments et les parcours formation, j’y suis toujours »)

**Bloquée : le client prépare lui-même ces éléments.** Ce qui est attendu de lui : la nouvelle vitrine (textes, structure des pages), la présentation des compartiments, et les parcours de formation par profil (avec les contenus de missions et de formation qu’il a dit fournir, réponse E). À réception : refonte de la vitrine (pages publiques, `client/src/pages/` hors `/app`), des pages de présentation des compartiments, et des parcours dans la couche éducative (`P8-17`).

### P8-22 — Moteur budgétaire unique : validation de fin de phase
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P8-01`, `P8-02`, `P8-03`, `P8-04`, `P8-05`, `P8-06`, `P8-07`, `P8-08`, `P8-09`, `P8-10`, `P8-11`, `P8-12`, `P8-13`, `P8-14`, `P8-15`, `P8-16`, `P8-17`, `P8-18`, `P8-19`, `P8-20`, `P8-21`, `P8-23`, `P8-24`, `P8-25`, `P8-26`, `P8-27`, `P8-28`
- Durée cible : 1 jour (estimation)

Critères : les 44 écrans du consolidé sont livrés, chacun à sa propre adresse et atteignable depuis la navigation ; les seize contrôles QA du client passent ; aucun calcul du diagnostic n°2 n'est encore faux ; démonstration au client sur deux comptes, un lycéen et un salarié, pour montrer qu'ils ont la même application et une formation différente.

---

# PHASE 9 — GESTION COMMUNE : DÉPENSES ET TÂCHES À PLUSIEURS
## Durée : hors des 8 semaines (estimation ci-dessous)
## Objectif

Faire de la gestion collective une **solution distincte**, comme le client le demande le 2026-10-26 (« je préfère qu'elles soient séparées pour répondre au besoin réel des personnes et on n'aura pas à se noyer dans les solutions »). Sources, par ordre de priorité : `FINCLUDIA_Partage_Gestion_Collective_Depenses_Taches.xlsx` (20 onglets), puis **l'ancien cahier complet** pour tout ce que ce fichier ne redit pas — écrans colocation, couple et famille (CO01 à CO06, CP01 à CP04, FA01 à FA06), écrans partagés (P01 à P05), formules F041 à F044. Précision du client (2026-10-27) : la gestion budgétaire est consolidée et affinée par les nouveaux cahiers ; la gestion commune reste régie par l'ancien cahier, complété par le fichier collectif. C'est exactement le partage des Phases 8 et 9 : chaque fonction relève de l'une ou de l'autre, jamais des deux. Le cahier consolidé du 2026-10-27 confirme la séparation : aucune entrée collective dans l'application personnelle (QA-V7-06).

**Ce qui existe et sera repris, pas reconstruit** (`P6-13` à `P6-15`) : rôles Owner / Admin / Member / Viewer, privé par défaut et matrice de permissions, invitations, dépense partagée avec un payeur qui peut ne pas en profiter, répartition égale / en % / en montants / proportionnelle aux revenus avec consentement, soldes nets et règlements minimisés (ALG-C01 = notre ALG-02), règlements déclaratifs, objectifs communs et contributions, provisions annuelles (COL-F09 = F045), factures récurrentes sans doublon, données enfant minimales. Avec leurs 47 tests de sécurité.

**Ce qui manque vraiment** : gestion des tâches (onglet 08, en entier), calendrier collectif unifié (09), budgets communs par catégorie (06), type « groupe / amis » et espace temporaire, répartition par poids et par usage, justificatif, statut « prévue / annulée », lien sans doublon vers le budget personnel, seuil de petit solde, activité récente, alertes collectives, contribution requise, rapports et export. Et surtout : **une vraie solution**, alors que tout tient aujourd'hui dans les accordéons d'une page `/espaces` de 1 254 lignes.

### P9-01 — Gestion commune : décisions de cadrage
- Statut : `✅ done`
- Priorité : `🔴 high`
- Dépendances : `P6-21`
- Durée cible : 0 jour de développement (décisions)
- Origine : fichier collectif du 2026-10-26 ; cahier consolidé du 2026-10-27 (ARC-03, QA-V7-06) ; réponses de l'utilisateur du 2026-10-27

**Décisions (2026-10-27)**, selon la même règle de priorité que `P8-01` (le nouveau cahier prime ; l'existant reste s'il ne le contredit pas ; ce qui n'est pas mentionné est gardé ; sinon, le plus logique pour l'ergonomie) :
1. **Accès** — QA-V7-06 interdit une entrée collective dans la **navigation** personnelle. Gestion commune vit donc sous son propre chemin (`/partage`), avec sa propre mise en page et son propre menu. On y arrive par un **sélecteur d'application** dans la barre supérieure (« Gestion budgétaire / Gestion commune », à côté du profil, hors du menu financier) et par un lien de la vitrine. Une seule connexion sert aux deux.
2. **Mineurs** — les règles existantes sont gardées : un espace se rejoint à partir de la majorité (`P6-22`) ; dans une famille, un enfant reste une donnée minimale (prénom et année de naissance, `P6-15`), jamais un membre. Le fichier collectif le permet (« selon politique produit », « données enfant minimales »).
3. **Catégories collectives** — **un seul référentiel** pour toute la plateforme, les 125 catégories du cahier consolidé : les 19 catégories de l'onglet 12 du fichier collectif y correspondent presque toutes ; elles servent de **sélection par défaut** dans un espace, avec les icônes et couleurs du référentiel. Deux catalogues parallèles finiraient par diverger.
4. **Espace temporaire** (groupe / amis) — le propriétaire le clôture quand il veut ; un espace clos passe en lecture seule (historique, soldes et règlements lisibles, plus aucune écriture), reste consultable par ses membres et disparaît seulement à sa suppression.
5. **Lien avec le budget personnel** — les deux cas que le fichier prévoit (« créer / référencer une transaction personnelle unique ») sont possibles : choisir un compte personnel crée la transaction dans ce compte, ou bien on désigne une transaction déjà saisie. Jamais les deux, et jamais deux transactions pour une même dépense (COL-F13).

**Questions envoyées au client le 2026-10-27 — en attente de réponse, sans bloquer le travail.** Les points 1 à 5 ci-dessus lui sont soumis pour confirmation (question B). Quatre informations manquent au fichier collectif ; une valeur par défaut est appliquée en attendant, versionnée et modifiable :
- **A1 — « Ressources communes »** (CD-01, COL-F08), non définies : par défaut, la somme des contributions **effectivement versées** par les membres.
- **A2 — Poids des tâches** (COL-F12) : par défaut, une échelle de 1 à 3, réglée à 1.
- **A3 — Répartition « par usage »** (R-05) : par défaut, chaque participant saisit librement ses unités, et la part est proportionnelle — calcul affiché, rien de caché.
- **A4 — Seuil de « petit solde »** : par défaut 200 DA, modifiable par espace.

**Réponses du client du 2026-10-28** — B1 à B5 ci-dessus validés, avec ces précisions, et les quatre manques A1 à A4 comblés :
- **A1 ressources communes** = solde initial collectif + contributions versées et confirmées + autres entrées collectives confirmées ; **solde du groupe** = ressources communes − dépenses collectives réalisées. Une contribution prévue ne compte pas avant confirmation. Si un vrai compte commun est relié plus tard : son registre **ou** les contributions déclarées, jamais les deux (`P9-09`, `P9-11`).
- **A2 poids d’une tâche** : champ `poids_tache` 1 légère, 2 normale, 3 lourde, défaut 1 (une tâche sans poids vaut 1). Charge d’un membre = Σ poids de ses tâches / Σ poids de toutes les tâches × 100 (`P9-06`).
- **A3 répartition par usage (R-05)** : un nombre libre d’unités par participant, un libellé commun choisi par l’espace (jours, nuits, parts, kilomètres, compteur, autre) ; part = montant × unités du membre / somme des unités ; exemple : 20 et 10 jours sur 9 000 DA → 6 000 et 3 000 DA. Une même dépense a une seule unité (`P9-04`).
- **A4 petit solde** : 200 DA par défaut, modifiable dans l’espace ; sert seulement à simplifier les règlements proposés ; une dette de 150 DA n’est jamais effacée, seulement masquée des règlements proposés jusqu’à compensation (`P9-04`).
- **B2 mineurs** : membre = 19 ans et plus ; un enfant d’un espace Famille est une fiche (prénom + année de naissance, éventuellement des dépenses ou objectifs associés), sans identifiant de membre, sans compte, sans droit d’édition.
- **B3 espace temporaire** : Actif → Clôturé ; une fois clôturé : ni dépense, ni tâche, ni règlement nouveaux, aucune modification des anciennes opérations ; historique, rapports et exports consultables ; un archivage, jamais une suppression (`P9-03`).
- **B4 catégories** : les 19 catégories collectives portent `collective_default = true`, affichées en premier, les 125 restent accessibles ; une catégorie créée dans un espace reste propre à cet espace sauf réutilisation explicite (`P9-05`).
- **B5 lien personnel** : contrainte technique **1 dépense collective ↔ 0 ou 1 transaction personnelle** (`personal_transaction_id`), jamais deux débits d’un compte personnel (`P9-08`).

### P9-02 — Gestion commune : une solution à part, une adresse par espace, un tableau de bord d'espace
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P8-02`, `P9-01`
- Durée cible : 4 jours (estimation)
- Origine : fichier collectif, onglets 01 à 03 (CD-01 à CD-09) et 11 ; ancien cahier CO01 à CO06 surlignés ; QA-V7-06 ; reprise de `P6-13` à `P6-15`

- Sa propre entrée (décision `P9-01` point 1 : chemin `/partage`, sélecteur « Gestion budgétaire / Gestion commune » dans la barre supérieure, lien depuis la vitrine), sa propre navigation, **aucun lien dans l'application personnelle**.
- Éclater `client/src/pages/espaces/SpacesPage.jsx` en pages : la liste des espaces (créer, rejoindre), le tableau de bord d'un espace, puis une page par compartiment — dépenses, soldes et règlements, budgets, tâches, calendrier, objectifs, membres et permissions, accord financier. Redirection de `/espaces`.
- Tableau de bord d'espace (onglet 03) : solde du groupe sans aucune donnée privée, dépenses du mois par catégorie, qui a payé, qui doit quoi, budgets communs, prochaines factures, tâches à faire, objectif commun, activité récente ; le vocabulaire suit le type d'espace.
- Déplacer côté collectif ce qui sort de l'application personnelle : les écrans CO, CP, FA et P, la revue « Moi / Nous » et celle du foyer, et F041 à F044 (le code est déplacé, pas réécrit).
- Les blocs dont les données n'existent pas encore montrent un état vide qui annonce la fonction, jusqu'aux tâches qui les livrent.
- Tests : QC-01, QC-02, QC-03, QC-05 depuis le menu ; les 47 tests de sécurité existants restent verts.

### P9-03 — Espace « groupe / amis » et espace temporaire
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P9-02`
- Durée cible : 1 jour (estimation)
- Origine : fichier collectif, onglet 02 (SP-04)

Quatrième type d'espace (`SPACE_KINDS` : aujourd'hui `flatshare`, `couple`, `household`) pour un voyage, une sortie, un cadeau, un événement ; clôture par le propriétaire, puis lecture seule : historique, soldes et règlements lisibles, plus aucune écriture (`P9-01` point 4).
- **Règles du client (2026-10-28, B3)** : voir `P9-01`. Actif → Clôturé ; après clôture, plus aucune écriture ni modification ; historique, rapports et exports lisibles.

### P9-04 — Dépenses partagées : champs et règles manquants
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P9-02`
- Durée cible : 3 jours (estimation)
- Origine : fichier collectif, onglets 04, 05, 07 et 12 ; QC-08

- Répartition **par poids** (R-04, COL-F03) et **par usage** (R-05, « explicable, pas de calcul caché »), en plus des quatre modes existants.
- Sous-catégorie, justificatif (stockage privé de `P5-03`), statut réalisée / prévue / annulée, rattachement à un budget commun, catégories du référentiel unique, avec les 19 de l'onglet 12 en sélection par défaut (`P9-01` point 3).
- Annuler une dépense déjà répartie recalcule les soldes et garde la trace (QC-08) ; seuil de « petit solde » sous lequel une dette n'est plus proposée en remboursement, sans être effacée.
- **Règles du client (2026-10-28, A3 et A4)** : la répartition par usage (unités libres, un libellé par espace, une seule unité par dépense) et le petit solde de 200 DA, modifiable, qui ne fait que masquer un règlement proposé, sans jamais effacer la dette. Voir `P9-01`.

### P9-05 — Budgets communs par catégorie
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P9-04`
- Durée cible : 3 jours (estimation)
- Origine : fichier collectif, onglet 06, COL-F06, COL-F07, ALG-C02, QC-06 ; réserve déclarée dans `P6-15`

Enveloppes par catégorie et par période, distinctes des objectifs communs : reste (peut être négatif), taux de consommation, rattachement d'une dépense au budget le plus spécifique (aucune écriture financière créée), alertes à 80 % et 100 %. **Aucun effet sur un budget personnel** (QC-06), vérifié par test.
- **Règle du client (2026-10-28, B4)** : `collective_default = true` sur les 19 catégories collectives, affichées en premier ; une catégorie créée dans un espace reste à cet espace.
- **Catégories `shared` (réponse D4, reportée par `P8-26`)** : les 12 anciennes catégories partagées sont remappées vers les 125 (même mécanisme que `RETIRED_CATEGORIES`), et les 19 catégories collectives du client portent `collective_default = true`.

### P9-06 — Gestion des tâches
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P9-02`
- Durée cible : 4 jours (estimation)
- Origine : fichier collectif, onglet 08, COL-F11, COL-F12, ALG-C04, QC-07 — le module que le client nomme dans le titre du fichier, et qui n'existe pas du tout

- Titre, description, catégorie (ménage, courses, factures, enfants, administratif, entretien, projet, animal, autre), responsable, participants, échéance, priorité, récurrence, checklist, statut, rappel.
- Lien **informatif** vers une dépense ou une facture : une tâche ne crée jamais de mouvement financier (QC-07).
- Taux de tâches terminées (COL-F11) et répartition de la charge (COL-F12), formulés comme un constat, jamais comme un jugement.
- **Règle du client (2026-10-28, A2)** : poids d’une tâche 1 / 2 / 3, défaut 1 ; charge d’un membre = Σ poids de ses tâches / Σ poids de toutes × 100.

### P9-07 — Calendrier collectif unifié
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P9-05`, `P9-06`
- Durée cible : 2 jours (estimation)
- Origine : fichier collectif, onglet 09

Une vue filtrable : factures, tâches, règlements, objectifs. Une facture prévue reste prévue jusqu'à confirmation, puis devient une dépense réelle sans doublon (mécanisme de `P6-15`).

### P9-08 — Lien sans doublon vers le budget personnel
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P9-04`, `P8-03`
- Durée cible : 2 jours (estimation)
- Origine : fichier collectif, COL-PR-03, COL-F13, QC-04, onglet 11

Une dépense collective payée avec l'argent personnel est reliée à **une seule** transaction personnelle (contrainte d'unicité), créée dans le compte choisi ou désignée parmi les transactions déjà saisies, jamais les deux (`P9-01` point 5) ; le compte source n'est visible que de son propriétaire.
- **Règle du client (2026-10-28, B5)** : contrainte d’unicité en base, 1 dépense collective ↔ 0 ou 1 transaction personnelle.

### P9-09 — Alertes, activité récente et contribution requise
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P9-05`, `P9-06`, `P9-07`
- Durée cible : 3 jours (estimation)
- Origine : fichier collectif, onglets 14 et 03 (CD-09), COL-F08

Alertes (invitation, nouvelle dépense, budget à 80 / 100 %, règlement, facture J-7 / J-3 / J, tâche, contribution, changement de permission) ; activité récente selon les droits de chacun ; contribution requise (COL-F08) présentée comme une proposition.
- **Règle du client (2026-10-28, A1)** : ressources communes = solde initial + contributions confirmées + autres entrées confirmées ; solde du groupe = ressources − dépenses réalisées ; une contribution prévue ne compte pas.

### P9-10 — Rapports et export d'un espace
- Statut : `❌ todo`
- Priorité : `🟢 low`
- Dépendances : `P9-05`
- Durée cible : 1 jour (estimation)
- Origine : fichier collectif, onglet 15

Synthèse d'un espace sur une période et export, avec un consentement explicite comme pour l'export de `P6-16`.

### P9-11 — Formules collectives : un moteur collectif, sans doublon
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Dépendances : `P4-09`
- Durée cible : 1 jour (estimation)
- Origine : fichier collectif, onglets 13 et 13B ; cahier consolidé, onglet 99

- F041 à F044 quittent le catalogue personnel pour le catalogue collectif.
- Correspondances publiées et vérifiées contre les exemples QC-01 à QC-03 : COL-F01 ↔ F041, COL-F04 ↔ F042, COL-F05 ↔ F043, COL-F09 ↔ F045, COL-F10 ↔ F025 / F026, ALG-C01 ↔ ALG-02, ALG-C03 ↔ l'arrondi au plus grand reste de `P6-14`.
- Seules les formules réellement nouvelles sont écrites (COL-F02 si elle diffère, COL-F03, COL-F06, COL-F07, COL-F08, COL-F11 à COL-F13, ALG-C02, ALG-C04), chacune avec sa phrase « Pourquoi ? ».
- **Formules précisées par le client le 2026-10-28** (A1 à A3) : ressources communes et solde du groupe, charge de tâches pondérée, part par usage. Voir `P9-01`.

### P9-12 — Contrôles du client et règle « trouvable »
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P9-02`, `P9-04`, `P9-06`
- Durée cible : 2 jours (estimation)
- Origine : fichier collectif, onglet 16 (QC-01 à QC-08)

Les huit scénarios du client deviennent un parcours navigateur qui part de l'entrée de Gestion commune et de son menu ; un contrôle vérifie que chaque compartiment d'un espace est atteignable depuis sa navigation.

### P9-13 — Gestion commune : validation de fin de phase
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Dépendances : `P9-01`, `P9-02`, `P9-03`, `P9-04`, `P9-05`, `P9-06`, `P9-07`, `P9-08`, `P9-09`, `P9-10`, `P9-11`, `P9-12`
- Durée cible : 1 jour (estimation)

Critères : une solution à part, sans aucun lien depuis l'application personnelle ; chaque écran du fichier collectif a sa propre adresse ; QC-01 à QC-08 passent ; démonstration au client sur une colocation, un couple et un groupe d'amis.

### Impact sur le délai (Phases 8 et 9, réécrit le 2026-10-27)

Estimation grossière, tests compris, hors temps de décision du client :
- **Phase 8** (moteur budgétaire unique) : environ **78 jours ouvrés**, `P8-02` à `P8-28` (6 jours de plus le 2026-10-28 au soir : couleurs et 3 suggestions, `P8-27` ; comparateurs et fiches bancaires, `P8-28` ; la refonte de la vitrine, `P8-29`, sera estimée à réception des éléments du client) (ajoutés le 2026-10-28 : 3 jours de reliquats, `P8-24` ; 5 jours pour donner une adresse aux 18 écrans regroupés, `P8-25` ; 4 jours pour les réponses du client, `P8-26` ; 2 jours pour l’écran de la fiche de paie, `P8-15`).
- **Phase 9** (Gestion commune) : environ **27 jours ouvrés**, `P9-02` à `P9-13`.

Soit **environ 105 jours ouvrés, de l'ordre de 4 mois** pour une personne. C'est beaucoup plus que l'estimation de la veille (39 jours), parce que le cahier consolidé ajoute un vrai modèle de comptes, les transferts, le pointage, le rapport mensuel, les méthodes budgétaires, 125 catégories et 16 formules d'analyse.

**Ordre recommandé**, qui suit le backlog du client (onglet 28) :
1. **`P8-04` tout de suite** (environ 2 jours) : des calculs faux sont à l'écran aujourd'hui, et c'est ce que le client a remarqué en premier.
2. **Lot 0** — `P8-03` ; **lot 1** — `P8-02`, `P8-05`, `P8-06`, `P8-07`, `P8-09`, `P8-11`, `P8-23` : l'application dans sa fenêtre, ses comptes, son Accueil, ses mouvements, ses budgets, son calendrier, ses premiers pas.
3. **Lot 2** — `P8-10` ; **lots 3 et 4** — `P8-12`, `P8-13`, `P8-14` ; **lot 5** — `P8-15`, `P8-16`, `P8-19` ; **lot 6** — `P8-17` ; **lot 7** — `P8-18`, `P8-20`, `P8-21`.
4. **Phase 9**, à partir de `P9-02`, dès que `P8-02` existe.

Les décisions de cadrage (`P8-01`, `P9-01`) sont prises depuis le 2026-10-27 : rien n'attend plus le client pour commencer. Les formules PB-F viennent du client (2026-10-27) ; seuls les 17 modèles d'objectifs et les poids de santé par défaut lui sont présentés à la recette.

### Chronologie de travail retenue (2026-10-27)

Ordre décidé avec l'utilisateur, tâche par tâche, en respectant les dépendances. Il précise l'« Ordre recommandé » ci-dessus sans le contredire.

**Phase 8**
1. Le moteur : `P8-04` → `P8-03` → `P8-08`. Les corrections de `P8-04` qui demandent des comptes (C2, C3, solde de C5, C7) se terminent avec `P8-03`.
2. La fenêtre : `P8-02`.
3. Le cœur du quotidien : `P8-05` → `P8-07` → `P8-09` → `P8-11` → `P8-06` (l'Accueil en dernier, puisqu'il affiche ce que construisent les quatre autres). **Première démonstration au client à la fin de cette étape.**
4. Les compartiments : `P8-12` → `P8-13` → `P8-14` → `P8-10` → `P8-16`.
5. Autour du moteur : `P8-15` → `P8-17` (missions de `P2-10` comprises) → `P8-23` → `P8-18` → `P8-19` → `P8-20`.
6. Contrôle : `P8-21` → `P8-22`, puis démonstration au client.

**Phase 9** : `P9-02` → `P9-11` → `P9-04` → `P9-08` → `P9-03` → `P9-05` → `P9-06` → `P9-07` → `P9-09` → `P9-10` → `P9-12` → `P9-13`.

Entre les deux : `P8-02` retire la gestion collective du menu personnel, mais `/espaces` reste servi (hors menu) jusqu'à `P9-02`, pour qu'aucun espace existant ne devienne inaccessible. Les questions A à E (`P8-01`, `P9-01`) sont envoyées au client dès maintenant : ses réponses ne sont utiles qu'à partir de l'étape 3.

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

Règle ajoutée le 2026-10-26 (Phase 8, retour du client) : un écran n'est terminé que s'il est **trouvable** — atteignable depuis la navigation de sa solution, en deux clics au plus, pour chaque persona concerné, et vérifié par un parcours qui part du menu, pas d'une adresse tapée. Un persona ne masque jamais un compartiment ; seules les restrictions légales (mineurs) en retirent, côté serveur. Un écran du client a sa propre adresse, jamais une section dépliable dans la page d'un autre.

Règle ajoutée le 2026-09-18 (voir P1-10) : toute nouvelle page ou tout nouveau composant texte, à partir de maintenant, doit utiliser `useTranslation()`/`t()` (i18next) dès sa création — jamais de texte en dur. Les traductions français/anglais/arabe correspondantes doivent être ajoutées dans le même changement (le tamazight reste volontairement en repli vers le français). Les couleurs doivent utiliser les tokens CSS existants (`index.css`), pas de couleurs codées en dur, pour rester compatibles avec le mode clair/sombre. Les icônes sont des composants `lucide-react` (jamais d'emoji ni de caractère décoratif) ; les flèches directionnelles utilisent la classe `icon-dir` pour s'inverser en RTL.

# 7. État actuel

**Réécrit en entier le 2026-10-19** — cette section décrivait encore la Phase 3 (blog), avec des tâches listées « bloquées » qui étaient en réalité terminées depuis des semaines (`P4-02`, `P4-14`, `P4-15`, `P6-16`...). C'est resté ainsi trop longtemps et c'est, concrètement, la source la plus probable de la question « est-ce qu'on a fait les bonnes choses » : le résumé en tête de fichier racontait une autre phase du projet. Ce qui suit reflète l'état réel, task par task, aujourd'hui.

**Mise à jour du 2026-10-26 — la phrase qui suivait était fausse du point de vue du client.** Elle disait le produit personnel « fonctionnellement complet et testé ». C'est vrai côté serveur et tests ; c'est faux côté expérience : le client, en le parcourant, « ne s'est pas retrouvé », a trouvé « beaucoup de compartiments absents » et « une seule page » pour toutes les solutions. Le diagnostic chiffré (personas utilisés comme barrières, 21 écrans sur une seule page, aucune porte par solution, tests qui ouvrent les pages par leur adresse) et la réponse sont en **Phase 8**.

**Mise à jour du 2026-10-27 — le client a envoyé son cahier consolidé et l'ancien cahier annoté.** Il juge le travail « bien », mais à revoir « sur le fond et sur la forme », et il signale des erreurs de calcul. Elles sont réelles : six ont été vérifiées dans le code (diagnostic n°2 de la Phase 8 — revenus comptés deux fois, épargne comptée comme une dépense, réserve surestimée, budget journalier faux, mauvais identifiants de formule).

**En une phrase, corrigée le 2026-10-27 : les fonctions FINCLUDIA des Phases 1 à 6 sont construites et testées, mais plusieurs calculs sont faux et l'organisation ne correspond pas à la vision du client** : un seul moteur budgétaire, le même pour tous, dans une fenêtre distincte de la vitrine (Phase 8), et une gestion collective séparée (Phase 9). C'est désormais le travail prioritaire — en commençant par corriger les calculs (`P8-04`) —, avant la préparation d'une vraie mise en production (`P5-04` à `P5-06`). La partie entreprise/ERP de l'annexe 1 du contrat (`P7-01`/`03`/`04`/`05`) reste volontairement non commencée : aucun cahier des charges ne la décrit.

## Où en est chaque phase

- **Phase 1 (socle, design)** — `✅ done`, validée (`P1-08`). Navigation, charte graphique officielle, sidebar classique repliable, barre supérieure (recherche, notifications, assistant) : tout est en place et câblé au serveur (`P1-12`, `P1-13`).
- **Phase 2 (e-learning)** — `✅ done`, validée (`P2-07`). Seul `P2-10` (défis et missions) reste `❌ todo` : abandonnée le 2026-10-11, elle est **reprise depuis le 2026-10-27**, parce que le nouveau cahier prévoit des missions dans la couche éducative (réalisation dans `P8-17`).
- **Phase 3 (blog/CMS/newsletter)** — `✅ done` pour tout ce qui ne dépend pas d'un choix externe. Le paiement réel attend un fournisseur (`P3-08` `⛔ blocked`, bloque `P3-10` `❌ todo`) ; la newsletter et « mot de passe oublié » attendent un fournisseur d'e-mail (non choisi).
- **Phase 4 (outils, calculateurs, comparateurs)** — `✅ done` en totalité, `P4-02` (simulateur de crédit) et `P4-04` (fiscalité) compris. `P4-04` reste `❌ todo` mais **volontairement hors MVP** (le client doit encore fournir les règles fiscales).
- **Phase 5 (sécurité, disponibilité, livraison)** — la sécurité est faite (`P5-01`, `P5-02`, `P5-03` `✅ done`, audités sur preuve le 2026-10-18 : 38 fichiers de tests de sécurité, 364 cas). `P5-04` (sauvegardes) `🚧 in-progress` : les scripts existent et ont été testés réellement (`npm run backup`, `npm run backup:verify`), mais où les conserver dépend encore de l'hébergement définitif. `P5-05`/`P5-06` restent `❌ todo`, en attente de `P5-04`. `P5-07` (livrables contractuels) `🚧 in-progress`.
- **Phase 6 (FINCLUDIA, gestion financière personnelle)** — **`✅ done` sur 23 des 24 tâches** (`P6-24` fermée le 2026-10-28). Les deux modules financiers de P6-02 à P6-20, P6-22 et P6-23 sont faits et testés (onboarding, « Mon argent », budgets, objectifs, réserve, dettes, patrimoine, portefeuille fictif, espaces partagés, notifications, centre de confiance, recherche globale, personnalisation des 8 parcours, graphiques de tableaux de bord). `P6-21` (validation de fin de phase) est close depuis le 2026-10-18 : les 10 parcours J01-J10 **et** les 8 scénarios par public passent en navigateur. Reste `⛔ blocked` : `P6-01` (cadrage, voir plus bas). `P6-24` (comptes financiers coordonnés) est **débloquée** depuis le 2026-10-27 : le client a choisi des comptes qui portent chaque opération ; réalisation par `P8-03` et `P8-05`. **Plusieurs tâches `✅ done` portent désormais un avertissement daté** (`P6-04`, `P6-05`, `P6-06`, `P6-08`, `P6-09`) : leurs erreurs ou écarts sont nommés sous la tâche, et corrigés en Phase 8.
- **Phase 7 (périmètre contractuel ERP)** — alerte de périmètre, pas un planning. `P7-02` (socle de trésorerie) est fait. `P7-01`, `P7-03`, `P7-04`, `P7-05` sont `⛔ blocked`, chacun en attente d'un cahier des charges ou d'un référentiel que le client n'a pas encore fourni pour cette partie.
- **Phase 8 (Gestion budgétaire, moteur budgétaire unique)** — **en cours depuis le 2026-10-27 : 16 tâches sur 25 terminées.** `P8-01` à `P8-14`, `P8-16` et `P8-21` (les seize contrôles du client et la règle « trouvable », 2026-10-28) sont faites : application sous `/app` avec la navigation finale, comptes et transferts, calculs faux corrigés, Mes comptes, Accueil, Mouvements, 125 catégories, budgets, Synthèse et rapport, Calendrier, Objectifs & sécurité, Dettes, Patrimoine, Santé financière. Restent `P8-15` (Outils), `P8-17` (Formation), `P8-18` à `P8-20`, `P8-23` (Premiers pas), `P8-24` (reliquats des écrans livrés), `P8-25` (une adresse pour les 18 écrans regroupés), `P8-26` (les réponses du client du 2026-10-28 appliquées aux écrans déjà livrés), `P8-27` (couleurs des catégories et des flux, 3 suggestions), `P8-28` (comparateurs et fiches bancaires), `P8-29` (refonte de la vitrine, bloquée en attente des éléments du client) et la validation `P8-22`. `P6-24` (comptes multiples) est fermée avec `P8-03` et `P8-05`.
- **Phase 9 (Gestion commune, gestion collective)** — ouverte le 2026-10-27 ; rien de commencé. Les décisions de cadrage sont prises (`P9-01` `✅ done`, 2026-10-27). Elle reprend `P6-13` à `P6-15` dans une solution séparée et y ajoute les tâches collectives, les budgets communs et le calendrier unifié.

## Ce qui bloque encore réellement, et qui doit trancher

- **Phases 8 et 9** — plus rien n'attend le client depuis le 2026-10-27 : l'utilisateur a tranché toutes les questions de cadrage (`P8-01`, `P9-01`) avec une règle de priorité — le nouveau cahier prime, l'existant reste s'il ne le contredit pas, ce qui n'est pas mentionné est gardé, et le reste suit la logique d'ergonomie. Deux éléments seront présentés au client à la recette : les 17 modèles d'objectifs et les poids par défaut de la santé financière. Les formules PB-F ont été reçues du client le 2026-10-27.
- **`P6-01` (cadrage FINCLUDIA)** — la quasi-totalité de ses points sont répondus (voir la liste complète dans la tâche). **Quatre restent ouverts, et ce sont les seuls qui comptent encore** :
  - point 2 : périmètre de la première livraison (les 8 publics d'un coup, ou quelques-uns d'abord ?) ;
  - point 12 : le périmètre ERP de l'annexe 1 (voir `P7-01`) ;
  - point 13 : date de livraison cible, absente du contrat ;
  - point 14 : annexe 1 du contrat, laissée vide par le client.
- **`P7-01`/`P7-03`/`P7-04`/`P7-05` (espace entreprise)** — cahier des charges par segment, référentiel comptable algérien (plan comptable, TVA, amortissements), et définition du volet diaspora/commerce international : aucun des trois n'est fourni. Une demande précise à envoyer au client a déjà été rédigée (voir l'échange du 2026-10-18) — à relancer si pas encore envoyée.
- **Paiement, email, newsletter** : fournisseurs non choisis (`P3-08`), ce qui bloque `P3-10` et laisse « mot de passe oublié » inactif.

## Ce qui a été vérifié récemment, pas seulement relu

**2026-10-28 — reprise après la session interrompue du 2026-10-27.** Le travail de la veille était commité, mais la machine ne l’était pas, et la suite complète n’avait pas été relancée. Trouvé et corrigé :
- **Les tests vidaient la base de développement.** Quinze fichiers de test importaient l’application avant de basculer sur la base de test : leur client Prisma restait sur `larbi_dev`, que `reset()` vidait. Désormais `boot()` demande à la base son vrai nom et refuse tout ce qui ne finit pas par `_test`, et ces fichiers chargent `tests/helpers/setup-env.js` en premier. `larbi_dev` a été restaurée depuis l’export du 2026-10-17 (`larbi-en-ligne/base-de-donnees.sql`), puis mise à jour par ses 11 migrations ; ce qui avait été saisi en local après le 17 est perdu.
- **« Supprimer mon compte » échouait** pour toute personne ayant un mouvement sur un compte : la clé du compte d’un mouvement était en `Restrict` (`P8-03`). Elle passe en `Cascade` (migration `20261028090000`) ; l’application archive un compte, elle ne le supprime jamais.
- **L’inventaire et l’export de ses données répondaient 500** : `fin_occurrences` (`P8-11`) n’a pas de `deletedAt` et la lecture le filtrait. Le registre le déclare (`softDelete: false`) et un test vérifie que registre et schéma concordent.
- **L’argent de poche fictif d’un lycéen entrait dans le revenu prévu réel** (et donc dans le taux d’endettement) depuis la correction C1 (`P8-04`). Il est maintenant montré à part, dans le bloc SIMULATION.
- Des tests restés sur l’ancien vocabulaire (91 catégories au lieu de 189, F025 au lieu de PB-F014, libellés et règles renommés) ont été mis à jour ; quatre tâches closes avec un reste orphelin le confient à `P8-24` ; `P6-24` est fermée ; `P8-05` porte sa note « Réalisé ». Le client Prisma est régénéré et `npm run reprise` existe (section 0, point 10).


Le 2026-10-18, plusieurs tâches marquées comme terminées ont été re-vérifiées directement dans le code plutôt qu'à l'œil, et deux fausses idées ont été corrigées dans ce fichier : la navigation par public et la barre supérieure étaient en réalité déjà entièrement câblées (`P1-12`, pas seulement l'ossature), et `P6-22` (référentiel maître) était déjà fait alors qu'une note le disait encore à faire. À l'inverse, une migration (`20261017090000_adult_age_19`) n'avait jamais été appliquée à la base de développement — trouvé en relançant la suite de tests, corrigé. Ce qui précède dans ce fichier a été réécrit pour refléter cette vérification, mais **toutes les tâches `✅ done` plus anciennes (Phases 1 à 4, dans leur quasi-totalité) n'ont pas fait l'objet de la même relecture ligne à ligne cette fois-ci** — leur statut repose sur la documentation inline de chaque tâche et la suite de tests existante (1792 tests, verte au dernier passage complet), pas sur une nouvelle inspection du code du 2026-10-18.

## Rappels opérationnels (inchangés)

- Chaque nouvelle tâche ajoute ses tests dans `server/tests/` ; `npm test` existe et doit rester vert avant une livraison — mais pas besoin de le relancer en entier à chaque petit changement en développement actif (il prend environ 65 minutes).
- Toute nouvelle route API est contrôlée par l'audit d'autorisation automatique (`tests/security/authorization.test.js`) : la déclarer publique ou la protéger explicitement.
- En début de session : `npm run reprise` (dans `server/`), qui régénère le client Prisma et applique les migrations en attente. Sur une machine neuve : `npm install` dans `client/` et `server/`, `prisma migrate deploy`, `JWT_SECRET` dans `server/.env`.
- `npm run deliverables` régénère `LIVRABLES/MATRICE_RECETTE.md` et `INVENTAIRE_COMPOSANTS.md` depuis ce fichier et la suite de tests — à relancer après tout changement de statut d'une tâche.
- Le paquet de déploiement `larbi-en-ligne/` a été régénéré et mis en ligne le 2026-10-17 (confirmé fonctionnel via `/api/health`) ; à régénérer de nouveau avant toute nouvelle mise en ligne si le code a changé depuis.

Objectif final :
Livrer FINCLUDIA, en respectant l'ordre des phases ci-dessus. Le MVP d'origine (e-learning/blog/outils) est entièrement livré. **Corrigé le 2026-10-27** : il ne reste pas seulement des décisions du client — les Phases 8 et 9 sont du vrai développement (environ 105 jours ouvrés estimés), qui commence par la correction des calculs faux (`P8-04`), puis suit l'ordre des lots du client.

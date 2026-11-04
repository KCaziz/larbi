# FINCLUDIA — Suivi des corrections de la recette utilisateur

Ce fichier suit la correction des défauts relevés pendant les tests utilisateurs (scénarios de [SCENARIOS_TESTS.md](SCENARIOS_TESTS.md)). Les remarques brutes restent dans [test.txt](test.txt) ; chaque remarque y est reprise ici dans une tâche, avec sa ligne d'origine. [TASKS.md](TASKS.md) reste la source de vérité du projet ; ce fichier n'en est que le complément pour la recette.

## 0. Règles

1. Les règles de [TASKS.md](TASKS.md) §0 s'appliquent, notamment : **Git : ne jamais commiter, pousser ni gérer le dépôt**.
2. Une nouvelle remarque est d'abord notée dans `test.txt`, puis reprise ici dans une tâche existante ou nouvelle.
3. Une tâche est `✅ done` seulement quand le défaut a été **reproduit, corrigé et revérifié dans l'application** (pas seulement par les tests automatiques), et quand le test automatique qui l'aurait vu existe.
4. Une correction qui touche une règle commune (champs, marges, graphiques) est faite **une fois, au niveau commun**, jamais page par page.
5. Aucune mention du client, d'une formule (Fxxx), d'un calcul interne ou d'une clé de traduction brute ne doit apparaître à l'écran. Ce qui n'est pas encore décidé s'affiche « À suivre » ou « En développement ».

Statuts : `❌ todo` · `🚧 in-progress` · `✅ done` · `⛔ blocked`
Priorités : `🔴 high` (bloque l'utilisation) · `🟡 medium` (gêne réelle) · `🟢 low` (confort)

## Avancement

| Section | Tâches | Faites |
|---|---|---|
| R1 — Défauts bloquants | 10 | 9 |
| R2 — Gestion commune | 7 | 4 |
| R3 — Système visuel et formulaires | 9 | 3 |
| R4 — Navigation et barre supérieure | 6 | 4 |
| R5 — Textes, traductions et mentions internes | 6 | 1 |
| R6 — Pages à rendre compréhensibles | 7 | 3 |
| R7 — Graphiques | 5 | 0 |
| **Total** | **50** | **24** |

Ordre de travail : les tâches 🚧 d'abord, puis R2-04, R3-05 à R3-09, R4-03, R4-05, R5-04 à R5-06, R6-02, R6-04, R6-06, R6-07, puis R7 (graphiques), et enfin R1-10 et R2-07.

---

# R1 — Défauts bloquants

### R1-01 — Création de compte : erreur puis « compte déjà existant »
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 4-8
- Réalisé (2026-11-04) : L'inscription marchait (5 sur 5 reproduites, 0,4 s) : la réponse s'était perdue pendant un redémarrage du serveur. Le formulaire, sur une coupure, une erreur serveur ou un « compte existant », tente la connexion avec le même e-mail et mot de passe ; le bouton reste bloqué pendant l'envoi.

Au premier envoi, le proxy de développement coupe la connexion (`ECONNRESET` sur `/api/auth/register`) et la personne voit une erreur ; au second clic, le serveur répond 409 (le compte avait bien été créé la première fois).
À faire : trouver ce qui fait durer ou couper la réponse d'inscription (envoi d'e-mail, création des données de départ, redémarrage `--watch`…), répondre toujours une fois le compte créé, empêcher le double envoi du formulaire, et, si le compte existe déjà, proposer « Se connecter » au lieu d'une impasse.
- Fin : 10 inscriptions de suite sans erreur ; un double clic ne crée qu'un compte et n'affiche pas d'erreur.

### R1-02 — `/app/calendrier/regulier` cassée
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 25
- Réalisé (2026-11-04) : Les champs dépassaient leur colonne : règle commune « un champ remplit sa case » pour toutes les grilles de formulaire (`index.css`), libellés harmonisés.

Reproduire, trouver la cause, corriger. Vérifier ensuite la création, la modification et l'arrêt d'un paiement régulier (scénario S09).

### R1-03 — `/app/progression` cassée
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 27
- Réalisé (2026-11-04) : Page remise dans le gabarit commun (en-tête pleine largeur, bouton « Imprimer » dans l'en-tête).

Reproduire avec `salarie` et `lyceen`, corriger, vérifier le passeport et les missions.

### R1-04 — `/app/parametres/premium` cassée, et erreur d'API affichée telle quelle
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 33-34
- Réalisé (2026-11-04) : Page remise dans le gabarit commun. Le texte « POST /api/tools/scenarios/comparaison 409 » est la **description de l'offre « promo »** saisie le 2026-10-17 dans l'administration des paiements : à corriger par toi dans `/admin/paiements` (données, pas code). La généralisation est `R5-06`.

La page est cassée, et la section « Devenir premium » affiche le texte brut d'une erreur (`POST /api/tools/scenarios/comparaison 409`). Corriger la page et l'appel ; plus généralement, **aucune erreur technique (adresse, code HTTP) ne doit jamais s'afficher** : un message en mots, avec quoi faire.
- Fin : parcours premium complet avec le paiement simulé (S21) ; recherche dans le client de tout affichage brut d'une erreur d'API.

### R1-05 — Formulaires cassés dans `/partage/:id/depenses`
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 35
- Réalisé (2026-11-04) : Même cause et même correction que `R1-02` (formulaires de dépense, de règlement, de budgets, de ressources).

Reproduire sur les trois espaces de démonstration ; corriger l'ajout, la modification et la répartition d'une dépense commune (S20a).

### R1-06 — La page Objectifs se casse avec de gros montants
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 19
- Réalisé (2026-11-04) : Cause de fond : toutes les sommes sont des entiers 32 bits en base ; au-delà de 21 474 836,47 DA, MariaDB **tronquait sans erreur** (999 999 999 999 DA devenait 21 474 836,47). Le serveur refuse désormais tout montant au-delà (`amountSchema`, entreprise, fiche de paie) et le champ montant l'indique avant l'envoi. Test : `finSpaceOwnership.test.js`.
- **Reste** (confié à `R1-10`) : passer les colonnes de montants en BIGINT pour accepter les grands patrimoines.

Les grands nombres débordent des cartes. Vérifier avec 1 000 000 000 DA sur la liste, le détail et l'accueil ; même contrôle sur les autres pages à montants (comptes, budgets, dettes, patrimoine).

### R1-07 — « Date cible (optionnel) » refusée si elle est vide
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 21
- Réalisé (2026-11-04) : Le champ portait `required` malgré son libellé ; le serveur acceptait déjà un objectif sans date. Ajout d'une date minimale (aujourd'hui). La sonde de recette signale désormais tout champ obligatoire dit « optionnel » : aucun autre trouvé.

Sur `/app/objectifs/nouveau`, une date laissée vide doit être acceptée (côté écran et côté serveur), ou le champ ne doit plus se dire optionnel. Vérifier le même cas sur tous les champs marqués « optionnel ».

### R1-08 — La page Aujourd'hui annonce des choses déjà faites
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 23
- Réalisé (2026-11-04) : « Il reste 7 questions » comptait l'ancien questionnaire d'estimations, plus proposé. Le rappel compte maintenant les étapes des Premiers pas ni faites ni passées ; le lien mène à `/app/parametres/premiers-pas`. Le rappel de pointage mène à la page de pointage.

« Il reste 7 question(s) pour un premier résultat complet » alors que les premiers pas sont terminés ; « mouvement à pointer » alors que tout est pointé. Chaque rappel doit relire l'état réel et disparaître dès que l'action est faite.
- Fin : avec un compte neuf, faire chaque action annoncée et vérifier que le rappel correspondant disparaît.

### R1-09 — « 6 transactions à catégoriser » sans moyen de corriger
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 29
- Réalisé (2026-11-04) : L'action mène à `/app/mouvements?sansCategorie=1` (au lieu de la Synthèse), où chaque mouvement sans catégorie propose le choix sur place. Le compteur de la Synthèse est un lien vers la même liste.

L'alerte doit mener directement à la liste des mouvements concernés, filtrée, avec le choix de catégorie sur place.

---

### R1-10 — Montants au-delà de 21 474 836,47 DA
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : `R1-06`

Passer les colonnes de montants de la base en BIGINT, et adapter le serveur (Prisma rend alors des `bigint`, qui ne se mélangent pas aux nombres). Gros chantier, à décider : la limite actuelle refuse proprement, mais elle est basse pour un patrimoine immobilier.

---

# R2 — Gestion commune

### R2-01 — L'espace est confondu avec la personne
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 38
- Réalisé (2026-11-04) : Cause : à la création, « Nom » (de l'espace) et « Nom affiché aux autres » (le tien) étaient côte à côte ; le nom de l'espace saisi dans le second devenait ton nom dans l'espace. Libellés clarifiés (« Nom de l'espace », « Votre nom dans cet espace », nom du compte par défaut), refus d'un nom identique à celui de l'espace, et le fil dit « X a créé l'espace « … » » pour le créateur. Test : `finSpaceOwnership.test.js`.
- **Reste** (confié à `R2-07`) : changer son nom dans un espace existant (les espaces déjà créés avec ce défaut le gardent).

Le fil affiche « Nous deux a rejoint l'espace » au lieu de « Aziz a créé l'espace Nous deux ». L'auteur de chaque événement (création, arrivée, dépense, contribution, règlement, tâche) doit être **la personne**, avec son nom de compte ; l'espace n'est que le lieu. Vérifier le fil, les notifications, les dépenses (« payé par »), les rapports.
- Fin : deux comptes dans un même espace, chaque action affiche le bon auteur, des deux côtés.

### R2-02 — Le créateur peut supprimer l'espace et transmettre ses droits
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 2
- Réalisé (2026-11-04) : La suppression existait (propriétaire seul). Ajout de la transmission : `POST /fin/espaces/:id/membres/:memberId/proprietaire`, bouton « Rendre propriétaire » dans Membres, note expliquant la règle. Les deux rôles s'échangent dans une transaction. Tests : 4 cas dans `finSpaceOwnership.test.js`.

Une seule personne, le propriétaire, peut supprimer l'espace (confirmation, conséquences expliquées). Il peut transmettre la propriété à un autre membre, et devient alors administrateur. Un propriétaire ne peut pas quitter l'espace sans l'avoir transmis ou supprimé.

### R2-03 — Barre supérieure de la gestion commune identique à celle de la gestion budgétaire
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 37
- Réalisé (2026-11-04) : Une seule barre (`components/layout/AppTopBar.jsx`) pour les deux applications.

Un seul composant de barre supérieure pour les deux solutions. Dépend de `R4-02`.

### R2-04 — « Contribution requise » incompréhensible dans Ressources
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 36

Dire en clair qui doit verser combien, pour quoi, avant quand, et ce qui se passe sinon.

### R2-05 — Champs « Mois » sans style dans toute la gestion commune
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 51
- Réalisé (2026-11-04) : Réglé par `R3-01`.

Réglé par `R3-01` ; à revérifier sur chaque onglet de l'espace.

### R2-06 — Règle des dépenses payées par un membre (rappel `P9-15`)
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : scénario S20a

Vérifier en recette la règle du client : seule la part du payeur pèse sur son budget, le reste est une avance, le remboursement n'est pas un revenu, aucun doublon. Les écarts constatés deviennent des tâches ici.

---

### R2-07 — Changer son nom dans un espace
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : `R2-01`

Dans « Membres », modifier son propre nom affiché ; utile aux espaces déjà créés avec le nom de l'espace à la place du sien.

---

# R3 — Système visuel et formulaires

### R3-01 — Un seul style pour tous les champs de formulaire
- Statut : `🚧 in-progress`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 42-51, 55
- Réalisé (2026-11-04) : Style commun de tous les champs dans `index.css` (`:where`, sans priorité : un composant qui stylise les siens garde la main) ; les champs des boîtes de recherche gardent leur boîte. La sonde de recette ne trouve plus aucun champ sans style sur 66 pages.
- **Reste** : le contrôle automatique dans la suite de tests.

La plupart des champs n'ont pas de style, et dans un même formulaire certains en ont et d'autres non. Donner un style commun à **tous** les `input`, `select`, `textarea`, champs date/mois, cases et boutons radio, boutons bascule, y compris erreur, désactivé et focus. Cas relevés à revérifier :
- note dans le formulaire d'ajout d'enveloppe d'un budget ;
- tous les champs des premiers pas (dont « votre profil principal ») ;
- choix du compte dans « Évolution des soldes » (Comptes) ;
- boutons « Reçu » des premiers pas (confirmer un mouvement) ;
- sélection « non pointée / pointée » dans Mouvements ;
- « depuis le compte » et date sur la page Objectifs ;
- toute la page `/app/dettes/pret` ;
- statut dans le détail d'un objectif ;
- champ « Mois » de la gestion commune (`R2-05`).
- Fin : un contrôle automatique qui échoue si un champ de formulaire de l'application n'a pas le style commun.

### R3-02 — Marges uniformes
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 10, 54
- Réalisé (2026-11-04) : Gabarit commun dans `AppLayout.css` : même largeur (1 120 px), mêmes marges et même distance en-tête / contenu sur toutes les pages des deux applications ; en-tête compact.

Même espace entre la barre latérale et le contenu, entre l'en-tête d'une page et son contenu, entre les sections, sur toutes les pages.

### R3-03 — Largeur et centrage identiques sur toutes les pages
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 14, 54
- Réalisé (2026-11-04) : Même gabarit ; les huit pages de paramètres héritées de l'ancien espace « compte » ont reçu l'en-tête commun.

Ex. : « Nouveau compte » n'est pas centrée. Un gabarit de page commun (largeur maximale, centrage), avec une largeur plus étroite pour les formulaires seuls.

### R3-04 — Bouton retour sur toutes les pages de second niveau
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 15, 54
- Réalisé (2026-11-04) : Le retour est dans l'en-tête commun, toujours au même endroit ; une page qui n'en déclare pas revient à la page au-dessus d'elle (`backFor`).

Ex. : Mouvements, Comptes. Toute page qui n'est pas une entrée du menu a un retour vers sa page parente, au même endroit, porté par le gabarit commun (`R3-03`).

### R3-05 — Aller directement au résultat après un clic
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 11

Quand un bouton fait apparaître un formulaire, un résultat ou un message (ex. « Ajouter une enveloppe »), la page défile jusqu'à lui et y place le focus. Mécanisme commun, appliqué partout.

### R3-06 — Vraies icônes pour les catégories
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 12

Remplacer les emojis des catégories par les icônes déjà utilisées sur le site (Lucide), une table de correspondance par catégorie et sous-catégorie.

### R3-07 — Choix de catégorie : recherche et navigation
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 32

Un seul sélecteur de catégorie pour toutes les pages (dépense, budget, gestion commune…) : recherche par nom (catégories et sous-catégories), passage clair catégorie → sous-catégorie et retour, utilisable au clavier et sur téléphone. Dépend de `R3-06`.

### R3-08 — Mouvements : le contenu déborde avec beaucoup d'informations
- Statut : `🚧 in-progress`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 26
- Réalisé (2026-11-04) : Ligne de mouvement en grille (date, montant, catégorie, informations, actions) ; note coupée avec « … » ; empilée sous 900 px.
- **Reste** : vérification à l'écran avec beaucoup d'étiquettes (interrompue).

Beaucoup d'étiquettes ou de longs libellés cassent la liste : couper proprement, regrouper les étiquettes en trop (« +3 »), garder les montants alignés.

### R3-09 — `/app/parametres/categories` à refaire
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 30

Marges, navigation, ergonomie. Reprendre avec le gabarit commun et le sélecteur de `R3-07`.

---

# R4 — Navigation et barre supérieure

### R4-01 — Barre latérale repliable
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 9
- Réalisé (2026-11-04) : Bouton « Réduire / Développer le menu » en tête de la barre latérale, sur toutes les largeurs ; le choix est retenu.

Un bouton pour replier ou déplier la barre latérale ; le choix est retenu.

### R4-02 — Langue et thème clair/sombre dans la barre supérieure de l'application
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 13
- Réalisé (2026-11-04) : Langue et thème dans la barre des deux applications (dans le menu du profil sous 1 000 px).

Comme sur le site public. Vaut aussi pour la gestion commune (`R2-03`).

### R4-03 — « Accéder à mon espace » réduit à une icône
- Statut : `❌ todo`
- Priorité : `🟢 low`
- Origine : `test.txt` l. 16

Sur le site public, une fois connecté : seulement l'icône, avec un nom accessible et une info-bulle.

### R4-04 — « Mes premiers pas » en haut de la barre latérale
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 18
- Réalisé (2026-11-04) : Section « Pour commencer » en tête du menu.

### R4-05 — Les astuces ouvrent la FAQ
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 3

Un clic sur une astuce de l'espace client doit ouvrir l'astuce elle-même.

### R4-06 — Lien de l'accueil vers chaque tâche « à faire »
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 23, 29
- Réalisé (2026-11-04) : Catégoriser, pointer et terminer les premiers pas mènent à l'écran exact (voir `R1-08`, `R1-09`).

Tout rappel ou alerte mène à l'endroit exact où on le règle (complète `R1-08` et `R1-09`).

---

# R5 — Textes, traductions et mentions internes

### R5-01 — Supprimer toute mention du client
- Statut : `🚧 in-progress`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 17, 68
- Réalisé (2026-11-04) : 27 textes réécrits en français, anglais et arabe (client, classeur, pondérations, « en attente du client »…), plus les textes envoyés par le serveur (santé, parcours, fiche de paie, provenance des tarifs).
- **Reste** : le contrôle automatique, et un dernier passage de la sonde.

Aucun « le client », « classeur », « onglet », « à valider par le client », « contrôles à obtenir », « non documenté », « calculs bloqués » à l'écran. Ce qui n'est pas décidé devient « À suivre » ou « En développement ».
- Fin : une recherche automatique sur les traductions et les contenus échoue si l'un de ces termes revient.

### R5-02 — Supprimer toute mention de formule ou de calcul interne
- Statut : `🚧 in-progress`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 28, 69
- Réalisé (2026-11-04) : Codes de formules retirés du catalogue des outils et des simulateurs ; les textes qui citaient une formule sont réécrits.
- **Reste** : vérifier les panneaux « Pourquoi ? » et les avertissements renvoyés par le serveur.

Ex. : « Score F054 : somme des critères normalisés ». Aucun code Fxxx, ALG-xx, poids ni formule, ni dans les outils, ni dans les « Pourquoi ? », ni ailleurs. On explique en mots ce qui fait monter ou baisser un résultat.
- Fin : même contrôle automatique que `R5-01`.

### R5-03 — Refonte de `/outils/postal`
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 17
- Réalisé (2026-11-04) : Page refaite : recherche, familles en mots (« Compte CCP », « Cartes et paiement »…), natures traduites, fiches lisibles ; compteurs internes et sections « non documenté », « calculs bloqués », « contrôles » retirés.

Le filtre « Famille » affiche des clés brutes ; les sections « Ce qui n'est pas documenté », « Les calculs bloqués », « Les 16 contrôles à obtenir » sont à retirer. Refaire la page autour de ce qu'une personne vient y chercher. Dépend de `R5-01`.

### R5-04 — Clés de traduction brutes dans `/app/parametres/confiance`
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 31

Ex. : `trust.tables.account`. Corriger, puis ajouter un contrôle automatique qui échoue si une clé utilisée n'existe pas dans les 4 langues.

### R5-05 — La FAQ ne marche qu'en français
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 1

Contenu en arabe, anglais et tamazight, ou repli explicite sur le français avec un message, jamais une page vide.

### R5-06 — Erreurs techniques affichées
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 34

Généralisation de `R1-04` : toute erreur d'API passe par un message en mots, dans la langue de la personne.

---

# R6 — Pages à rendre compréhensibles

### R6-01 — Fonds d'urgence : une page qu'on comprend
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 20, 24
- Réalisé (2026-11-04) : Deux causes : un objectif créé à la main et nommé « Fonds d'urgence » n'était pas reconnu (seul le modèle l'était) — il l'est maintenant par son nom, aussi dans la santé financière ; et rien ne disait comment donner les dépenses essentielles. Page refaite en trois étapes (dépenses essentielles, nombre de mois, fonds), chacune avec son action sur place.

Même après avoir créé un objectif « fonds d'urgence », la page dit « Les dépenses essentielles ne sont pas encore connues » sans dire comment les déclarer. Or la page sert à la santé financière. À faire : expliquer en haut à quoi sert le fonds, montrer les étapes manquantes avec un lien vers chacune (déclarer les dépenses essentielles, créer ou relier l'objectif, verser), et rendre l'état « pas encore de fonds d'urgence » très visible. Vérifier que la création de l'objectif est bien prise en compte.

### R6-02 — Détail d'un objectif : « affecter » et « contribuer »
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 22

Expliquer la différence, ou la supprimer si une seule action suffit. Dire d'où vient l'argent et ce que l'action change sur le compte.

### R6-03 — Champs incohérents dans le détail d'un objectif
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 50, 55
- Réalisé (2026-11-04) : Réglé par `R3-01`.

Réglé par `R3-01` ; vérifier ensuite la lisibilité de la page entière.

### R6-04 — Simulation des objectifs illisible
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 61

Voir `R7-03`.

### R6-05 — `/app/dettes/pret` à reprendre
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 49
- Réalisé (2026-11-04) : Titre en double et sous-titre de la liste des dettes retirés, champs espacés.

Après `R3-01`, revoir la page entière (« J'ai prêté »).

### R6-06 — Revue de compréhension des pages
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 54

Pour chaque page de l'application : une phrase en haut qui dit à quoi elle sert, un état vide qui dit quoi faire en premier, et un bouton principal évident.

### R6-07 — Pages vides en arabe sur téléphone (connu avant la recette)
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Origine : parcours automatique du 2026-11-02

`/aujourdhui`, `/mon-argent`, `/budget`, `/objectifs`, `/reserve`, `/dettes` presque vides en arabe à 375 px ; débordement horizontal sur `/admin/comparateur` ; 403 sur `/portefeuille` et 404 sur une formation pour un apprenant. Revérifier, corriger ce qui reste.

---

# R7 — Graphiques

### R7-01 — Une base commune pour tous les graphiques
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 59-65

Plus de couleurs, plus de lisibilité, plus d'indications : palette commune contrastée, axes avec unités, légende, valeurs au survol et au toucher, titre qui dit ce qu'on regarde, phrase de lecture sous le graphique. Les autres tâches de R7 en dépendent.

### R7-02 — Courbes à un seul point (« boules sur un même axe »)
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 60, 62

« Évolution des soldes » (Comptes) et la Synthèse affichent un point isolé par compte, tous sur le même X. Vérifier les données envoyées (une seule date ?) et le tracé ; avec moins de deux points, afficher un message plutôt qu'une courbe.

### R7-03 — Simulation des objectifs
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 61

Fonctionne mais laid et peu compréhensible : montrer la cible, le chemin prévu et le réel, et dire en une phrase si l'objectif est en avance ou en retard.

### R7-04 — Graphique triangulaire de la Vue d'ensemble
- Statut : `❌ todo`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 63

Identifier le graphique et ses données, corriger le tracé.

### R7-05 — Revue de tous les autres graphiques
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 65

Passer chaque graphique de l'application (budgets, dettes, patrimoine, santé, simulateurs, gestion commune) avec des comptes de démonstration et un compte vide.

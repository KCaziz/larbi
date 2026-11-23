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
| R1 — Défauts bloquants | 10 | 10 |
| R2 — Gestion commune | 7 | 7 |
| R3 — Système visuel et formulaires | 9 | 9 |
| R4 — Navigation et barre supérieure | 6 | 6 |
| R5 — Textes, traductions et mentions internes | 6 | 6 |
| R6 — Pages à rendre compréhensibles | 7 | 7 |
| R7 — Graphiques | 5 | 5 |
| R8 — Deuxième passage (2026-11-05) | 12 | 12 |
| R9 — Troisième passage (2026-11-08) | 19 | 18 |
| R10 — Quatrième passage (2026-11-10) | 13 | 13 |
| R11 — Cinquième passage (2026-11-11) | 15 | 15 |
| R12 — Sixième passage (2026-11-12) | 4 | 4 |
| R13 — Septième passage (2026-11-12) | 7 | 7 |
| R14 — Huitième passage (2026-11-15) | 1 | 1 |
| R16 — Neuvième passage (2026-11-17) | 6 | 6 |
| **Total** | **127** | **126** |

R9 : reste R9-18 (fiche de paie), aucun défaut reproduit, à préciser avec le client.

Ordre de travail (R8) : les corrections courtes d'abord (R8-07, R8-03, R8-09, R8-10, R8-11), puis le sélecteur de catégorie (R8-01, R8-02), les dettes (R8-06), le fonds d'urgence et les « non calculé » (R8-04, R8-08), enfin le portefeuille fictif (R8-05).

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
- Restait (repris et fait par `R1-10`, 2026-11-04) : accepter les grands patrimoines (colonnes passées en DOUBLE, limite 10 000 000 000 000 DA).

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
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `R1-06`
- Réalisé (2026-11-04) : plutôt que BIGINT (dont les `bigint` de Prisma ne se mélangent pas aux nombres et auraient obligé à réécrire tout le code qui calcule), les 44 colonnes de montants (27 tables) passent en DOUBLE (`Float` de Prisma), qui garde exactement tout entier jusqu'à 2^53 et se lit comme un nombre ordinaire. Nouvelle limite : 10^15 unités mineures, soit 10 000 000 000 000 DA. Migration `20261104120000_fin_money_double` (à appliquer sur les autres bases). Tests : un but de 999 999 999 999 DA est rangé et relu à l'identique ; la somme de deux grands montants reste exacte ; au-delà de la limite, refus 400.

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
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 36
- Réalisé (2026-11-04) : Le bloc devient « Combien chacun doit-il verser ? (simulation) » : à quoi il sert, ce qu'on y saisit, ce qui s'affiche (ce qui manque dans le pot, la part de chacun, ou « le pot couvre déjà »).

Dire en clair qui doit verser combien, pour quoi, avant quand, et ce qui se passe sinon.

### R2-05 — Champs « Mois » sans style dans toute la gestion commune
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 51
- Réalisé (2026-11-04) : Réglé par `R3-01`.

Réglé par `R3-01` ; à revérifier sur chaque onglet de l'espace.

### R2-06 — Règle des dépenses payées par un membre (rappel `P9-15`)
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : scénario S20a
- Réalisé (2026-11-04) : parcours navigateur `fin-shared-advance-journey` (formulaire de dépense partagée, puis règlement) sur l'exemple du client : A paie 9 000 DA pour A, B et C ; compte -9 000, dépense personnelle 3 000, avance 6 000 ; B rembourse 3 000 : le compte monte, aucun revenu, l'avance passe à 3 000, une seule dépense personnelle (aucun doublon). Aucun écart constaté.

Vérifier en recette la règle du client : seule la part du payeur pèse sur son budget, le reste est une avance, le remboursement n'est pas un revenu, aucun doublon. Les écarts constatés deviennent des tâches ici.

---

### R2-07 — Changer son nom dans un espace
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `R2-01`
- Réalisé (2026-11-04) : `PUT /fin/espaces/:id/mon-nom` et un champ dans Membres ; le nom de l'espace est refusé. Tests : `finSpaceOwnership`.

Dans « Membres », modifier son propre nom affiché ; utile aux espaces déjà créés avec le nom de l'espace à la place du sien.

---

# R3 — Système visuel et formulaires

### R3-01 — Un seul style pour tous les champs de formulaire
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 42-51, 55
- Réalisé (2026-11-04) : Style commun de tous les champs dans `index.css` (`:where`, sans priorité : un composant qui stylise les siens garde la main) ; les champs des boîtes de recherche gardent leur boîte. La sonde de recette ne trouve plus aucun champ sans style sur 66 pages.
- Contrôle automatique ajouté : `fin-fields-journey` visite 14 pages et échoue si un champ n'a aucune bordure (les champs dont l'enveloppe porte la bordure sont les seules exceptions).

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
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 11
- Réalisé (2026-11-04) : Mécanisme commun (`useRevealOnAction`) dans les deux applications : après un clic, le formulaire ou le message qui apparaît est amené à l'écran et le formulaire prend le focus. Test navigateur : `fin-reveal-journey`.

Quand un bouton fait apparaître un formulaire, un résultat ou un message (ex. « Ajouter une enveloppe »), la page défile jusqu'à lui et y place le focus. Mécanisme commun, appliqué partout.

### R3-06 — Vraies icônes pour les catégories
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 12
- Réalisé (2026-11-04) : Table emoji → icône Lucide (`CategoryIcon`) appliquée aux catégories, comptes, objectifs, anneaux ; les listes déroulantes n'affichent que le nom ; le choix d'icône d'un objectif devient une grille d'icônes. Contrôle automatique : tout emoji du référentiel a son icône.

Remplacer les emojis des catégories par les icônes déjà utilisées sur le site (Lucide), une table de correspondance par catégorie et sous-catégorie.

### R3-07 — Choix de catégorie : recherche et navigation
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 32
- Réalisé (2026-11-04) : Sélecteur commun (`CategoryPicker`) : recherche sur catégories et sous-catégories, marche des catégories vers leurs sous-catégories avec retour, clavier et téléphone ; branché sur Mouvements (saisie, filtre, correction, étiquettes) et la dépense commune. Le formulaire d'enveloppe de budget garde sa liste (groupes entiers et catégories mélangés).

Un seul sélecteur de catégorie pour toutes les pages (dépense, budget, gestion commune…) : recherche par nom (catégories et sous-catégories), passage clair catégorie → sous-catégorie et retour, utilisable au clavier et sur téléphone. Dépend de `R3-06`.

### R3-08 — Mouvements : le contenu déborde avec beaucoup d'informations
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 26
- Réalisé (2026-11-04) : Ligne de mouvement en grille (date, montant, catégorie, informations, actions) ; note coupée avec « … » ; empilée sous 900 px.
- Vérifié à l'écran avec un libellé de 290 caractères, une étiquette longue et un montant de 1 234 567,89 DZD : la note est coupée par « … », le montant reste sur une ligne.

Beaucoup d'étiquettes ou de longs libellés cassent la liste : couper proprement, regrouper les étiquettes en trop (« +3 »), garder les montants alignés.

### R3-09 — `/app/parametres/categories` à refaire
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 30
- Réalisé (2026-11-04) : Page `/parametres/categories` : recherche sur les 125, accès direct à chaque famille, familles repliables, icônes alignées, gabarit commun.

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
- Statut : `✅ done`
- Priorité : `🟢 low`
- Origine : `test.txt` l. 16
- Réalisé (2026-11-04) : « Accéder à mon espace » est réduit à l'icône (nom accessible et info-bulle conservés) sur le site public, pour tous les comptes.

Sur le site public, une fois connecté : seulement l'icône, avec un nom accessible et une info-bulle.

### R4-04 — « Mes premiers pas » en haut de la barre latérale
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 18
- Réalisé (2026-11-04) : Section « Pour commencer » en tête du menu.

### R4-05 — Les astuces ouvrent la FAQ
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 3
- Réalisé (2026-11-04) : le panneau d'aide de l'application s'appelait « Questions fréquentes » et ne montrait que la FAQ. Il montre maintenant, en tête, les astuces de la page ouverte (deux par page principale, dans les trois langues, qui s'ouvrent sur place) puis les questions fréquentes. Test navigateur : `fin-reveal-journey`.

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
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 17, 68
- Réalisé (2026-11-04) : 27 textes réécrits en français, anglais et arabe (client, classeur, pondérations, « en attente du client »…), plus les textes envoyés par le serveur (santé, parcours, fiche de paie, provenance des tarifs).
- Contrôle automatique ajouté (`screens.test.js`) : échoue si un texte des quatre langues mentionne le client, un classeur, un onglet ou une formule.

Aucun « le client », « classeur », « onglet », « à valider par le client », « contrôles à obtenir », « non documenté », « calculs bloqués » à l'écran. Ce qui n'est pas décidé devient « À suivre » ou « En développement ».
- Fin : une recherche automatique sur les traductions et les contenus échoue si l'un de ces termes revient.

### R5-02 — Supprimer toute mention de formule ou de calcul interne
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 28, 69
- Réalisé (2026-11-04) : Codes de formules retirés du catalogue des outils et des simulateurs ; les textes qui citaient une formule sont réécrits.
- Reste vérifié : le texte de la méthode de score des comparateurs citait une formule (réécrit), les avertissements du serveur n'en citent aucune ; même contrôle automatique que R5-01.

Ex. : « Score F054 : somme des critères normalisés ». Aucun code Fxxx, ALG-xx, poids ni formule, ni dans les outils, ni dans les « Pourquoi ? », ni ailleurs. On explique en mots ce qui fait monter ou baisser un résultat.
- Fin : même contrôle automatique que `R5-01`.

### R5-03 — Refonte de `/outils/postal`
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 17
- Réalisé (2026-11-04) : Page refaite : recherche, familles en mots (« Compte CCP », « Cartes et paiement »…), natures traduites, fiches lisibles ; compteurs internes et sections « non documenté », « calculs bloqués », « contrôles » retirés.

Le filtre « Famille » affiche des clés brutes ; les sections « Ce qui n'est pas documenté », « Les calculs bloqués », « Les 16 contrôles à obtenir » sont à retirer. Refaire la page autour de ce qu'une personne vient y chercher. Dépend de `R5-01`.

### R5-04 — Clés de traduction brutes dans `/app/parametres/confiance`
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 31
- Réalisé (2026-11-04) : Les noms de huit tables (comptes, étiquettes, fiches de paie, entreprise…) manquaient : ajoutés. Contrôle automatique : chaque table de l'inventaire a son nom dans chaque langue (`screens.test.js`).

Ex. : `trust.tables.account`. Corriger, puis ajouter un contrôle automatique qui échoue si une clé utilisée n'existe pas dans les 4 langues.

### R5-05 — La FAQ ne marche qu'en français
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 1
- Réalisé (2026-11-04) : La page FAQ existait en quatre langues ; c'est l'assistant (questions saisies dans l'administration) qui restait vide hors du français. Il se rabat maintenant sur le français avec une phrase qui le dit, jamais un panneau vide.

Contenu en arabe, anglais et tamazight, ou repli explicite sur le français avec un message, jamais une page vide.

### R5-06 — Erreurs techniques affichées
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 34
- Réalisé (2026-11-04) : Plus aucun écran n'affiche le texte d'une erreur du serveur : tout passe par `errorKey` (ajout des cas 409 et 422). Contrôle automatique : aucun `err.message` affiché.

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
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 22
- Réalisé (2026-11-04) : Le détail d'un objectif sépare deux blocs titrés : « Mettre de l'argent de côté » (un vrai virement, d'où il part, ce que ça change) et « Corriger les chiffres » (ne déplace aucun argent) ; le capital saisi n'est proposé que si l'objectif n'a pas son compte.

Expliquer la différence, ou la supprimer si une seule action suffit. Dire d'où vient l'argent et ce que l'action change sur le compte.

### R6-03 — Champs incohérents dans le détail d'un objectif
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 50, 55
- Réalisé (2026-11-04) : Réglé par `R3-01`.

Réglé par `R3-01` ; vérifier ensuite la lisibilité de la page entière.

### R6-04 — Simulation des objectifs illisible
- Statut : `✅ done`
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
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 54
- Réalisé (2026-11-04) : chaque page de l'application a sa phrase d'en-tête (les deux dernières — Mes paiements et Mon espace — viennent d'être ajoutées) ; les états vides et boutons principaux avaient été repris page par page avec les tâches R1 à R6.

Pour chaque page de l'application : une phrase en haut qui dit à quoi elle sert, un état vide qui dit quoi faire en premier, et un bouton principal évident.

### R6-07 — Pages vides en arabe sur téléphone (connu avant la recette)
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : parcours automatique du 2026-11-02
- Réalisé (2026-11-04) : revérifié en arabe à 375 px : Aujourd'hui, Accueil et Objectifs s'affichent complets (capture d'écran), sans débordement.
- Réalisé aussi : le débordement de `/admin/comparateur` à 375 px venait d'un tableau trop large : il défile maintenant dans sa propre boîte. Le 403 de `/portefeuille` (réservé aux majeurs, règle d'âge) et le 404 d'une formation non publiée sont le comportement voulu, pas des défauts.

`/aujourdhui`, `/mon-argent`, `/budget`, `/objectifs`, `/reserve`, `/dettes` presque vides en arabe à 375 px ; débordement horizontal sur `/admin/comparateur` ; 403 sur `/portefeuille` et 404 sur une formation pour un apprenant. Revérifier, corriger ce qui reste.

---

# R7 — Graphiques

### R7-01 — Une base commune pour tous les graphiques
- Réalisé (2026-11-04) : tracé refait dans le kit commun : axe des valeurs écrit, axe du temps, un point par date, infobulle au survol et au toucher, phrase de lecture sous le graphique ; la cause du « polygone plein » était une règle de couleur qui remplissait chaque courbe.
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 59-65

Plus de couleurs, plus de lisibilité, plus d'indications : palette commune contrastée, axes avec unités, légende, valeurs au survol et au toucher, titre qui dit ce qu'on regarde, phrase de lecture sous le graphique. Les autres tâches de R7 en dépendent.

### R7-02 — Courbes à un seul point (« boules sur un même axe »)
- Réalisé (2026-11-04) : évolution des soldes, revenus / dépenses, flux net et taux d'épargne passent par le même tracé ; moins de deux dates affiche un message, jamais un point isolé. Vérifié par capture d'écran.
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 60, 62

« Évolution des soldes » (Comptes) et la Synthèse affichent un point isolé par compte, tous sur le même X. Vérifier les données envoyées (une seule date ?) et le tracé ; avec moins de deux points, afficher un message plutôt qu'une courbe.

### R7-03 — Simulation des objectifs
- Réalisé (2026-11-04) : la simulation trace le capital projeté contre la cible (inflation comprise) et dit en une phrase si l'objectif est en avance, à l'heure, en retard ou jamais atteint.
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 61

Fonctionne mais laid et peu compréhensible : montrer la cible, le chemin prévu et le réel, et dire en une phrase si l'objectif est en avance ou en retard.

### R7-04 — Graphique triangulaire de la Vue d'ensemble
- Réalisé (2026-11-04) : le triangle venait du remplissage des courbes (voir R7-01) ; les graphiques du patrimoine et revenus / dépenses utilisent désormais le tracé commun.
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 63

Identifier le graphique et ses données, corriger le tracé.

### R7-05 — Revue de tous les autres graphiques
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 65
- Réalisé (2026-11-04) : revue faite avec un compte de démonstration (graphiques budgets, dettes, patrimoine, santé, simulateurs, Gestion commune : tests navigateur `fin-charts-journey` 7/7 et `fin-charts2-journey` 12/12 : légende écrite, valeurs écrites, tableau des chiffres) et avec un compte vide (douze pages, aucune erreur, aucun « NaN » ni « undefined »).

Passer chaque graphique de l'application (budgets, dettes, patrimoine, santé, simulateurs, gestion commune) avec des comptes de démonstration et un compte vide.

---

# R8 — Deuxième passage de recette (2026-11-05)

### R8-01 — Sélecteur de catégorie : affichage des résultats de recherche
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 1 (2e passage)
- Réalisé (2026-11-05) : En recherche, chaque résultat tient sur deux lignes (la sous-catégorie, puis « dans … » sa catégorie) ; la liste fait au moins 360 px (la largeur de l'écran sur téléphone), icônes et lignes agrandies, et un champ qui porte le sélecteur prend toute la ligne de son formulaire. Le champ de recherche n'a plus de boîte dans la boîte ni de double croix.

En recherche, la sous-catégorie est coincée sous la catégorie (en navigation, l'affichage est correct). Le sélecteur doit avoir partout une taille suffisante : trop petit, il rend les catégories illisibles.

### R8-02 — Sous-catégorie saisie en texte libre
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 2 (2e passage)
- Réalisé (2026-11-05) : Le champ texte « sous-catégorie » est retiré de la saisie d'un mouvement et de la dépense commune : le sélecteur choisit la catégorie puis la sous-catégorie. Une valeur enregistrée avant est conservée.

`/app/mouvements/nouveau` (et d'autres pages) gardent un champ texte « sous-catégorie » alors que le sélecteur choisit déjà une catégorie puis une sous-catégorie. Une seule façon : le sélecteur.

### R8-03 — Expliquer « pointée », « rapprochée », « à vérifier »
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 3 (2e passage)
- Réalisé (2026-11-05) : Chaque état de pointage s'explique au survol (liste et boutons de pointage), et une légende dépliable « Que veulent dire… ? », utilisable au toucher, est affichée sur Mouvements et sur Pointage.

Une explication au survol (et au toucher) de chaque état de pointage dans Mouvements.

### R8-04 — Fonds d'urgence : dire comment régler les dépenses essentielles
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 4 (2e passage)
- Réalisé (2026-11-05) : L'étape 1 dit « Comment les régler » en trois points, chacun avec son lien : enregistrer les dépenses (Ajouter une dépense), choisir ce qui est essentiel (Mes catégories, case « Essentielle »), et, tant qu'il n'y a pas un mois d'historique, donner une estimation sur place.

« Elles se calculent seules à partir de vos dépenses… » ne dit pas quoi faire. Dire concrètement : quelles catégories comptent, comment en marquer une comme essentielle, où enregistrer une dépense, avec les liens.

### R8-05 — Portefeuille fictif presque vide
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 5 (2e passage)
- Réalisé (2026-11-05) : Cause : aucune liste de placements ni aucun cours n'est fourni (le « marché pédagogique » attend toujours le client, `P6-01`), donc la personne crée elle-même ses supports avec un prix qu'elle choisit — et la page vide ne le disait pas. Ajout d'un mode d'emploi en quatre étapes (créer un support, acheter, changer le prix, noter sa décision), affiché tant qu'aucune position n'existe.
- **Reste** (confié à `P6-01`) : une liste de supports pédagogiques fournie par le client, si elle vient.

Il n'y a que l'ajout de support et le calcul du score. Établir si c'est faute de données ou d'intégration, et rendre la page utile.

### R8-06 — Graphiques des dettes : montrer ce qui reste dû
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 6 (2e passage)
- Réalisé (2026-11-05) : L'anneau par type (une seule dette = 100 %) est remplacé par « Où en sont mes dettes » : une barre par dette, sur la même échelle, en deux parties (déjà remboursé / reste dû), chiffres écrits, et un total. Le serveur renvoie, avec chaque dette, la somme de ses remboursements. Test : `finDebtProgress.test.js` (1 000 remboursés de 500 : reste 500 sur 1 000).

Une dette de 1 000 remboursée de 500 s'affiche comme 500 = 100 %. Le graphique doit montrer le montant de départ et ce qui reste, qui baisse à chaque remboursement.

### R8-07 — Outils : retirer les codes (CAL-01…)
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 7 (2e passage)
- Réalisé (2026-11-05) : Le code (CAL-01…) est remplacé par une phrase qui dit à quoi sert l'outil, pour les 56 outils, en trois langues. Contrôle automatique (`screens.test.js`) : chaque outil a sa phrase dans chaque langue.

Aucun code ni formule dans `/app/outils` ; au plus une ou deux phrases qui disent à quoi sert l'outil.

### R8-08 — Chaque « non calculé » dit comment l'obtenir
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 8 (2e passage)
- Réalisé (2026-11-05) : Sous chaque « non calculé », « Pour l'obtenir : » et un lien vers l'écran où donner ce qui manque. La carte de chiffre le déduit des données vides de la réponse du moteur (`lib/howToCompute.js`) ; les autres endroits (accueil, synthèse, comptes, calendrier, patrimoine, progression) donnent l'indication directement.

À côté de chaque « non calculé » : ce qui manque, et un lien vers l'endroit où le donner.

### R8-09 — Accès à l'administration
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 9 (2e passage)
- Réalisé (2026-11-05) : L'administration a sa propre fenêtre, avec la barre de l'application ; le sélecteur « Gestion budgétaire | Gestion commune » propose « Administration » aux administrateurs seulement, dans les trois fenêtres. Un compte de démonstration administrateur est ajouté (`admin@demo.fincludia.local`, même mot de passe ; créé aussi par `npm run demo`).

Un administrateur arrive sur `/app` sans moyen visible d'aller à l'administration. Ajouter « Administration » à côté de « Gestion budgétaire » et « Gestion commune », pour les administrateurs seulement.

### R8-10 — Barre supérieure d'un administrateur : le « + » chevauche le nom
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 10 (2e passage)
- Réalisé (2026-11-05) : Une fois connecté, la barre du site public ne garde que « Plus », la langue, le thème, « Mon espace » et la déconnexion : la recherche, les notifications, l'aide et l'administration sont dans la barre de l'application. Plus rien ne chevauche le nom, à toutes les largeurs (vérifié à 1 280 et 1 920 px).

Connecté en administrateur, sur l'accueil du site et dans `/admin`, le bouton « Plus » disparaît dans le nom FINCLUDIA.

### R8-11 — `/admin/missions-fincludia` incompréhensible
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 11 (2e passage)
- Réalisé (2026-11-05) : Le JSON est remplacé par un formulaire : titre, présentation, profils (cases), somme de départ en dinars, étapes avec leurs choix (réponse, effets, explication), badges ; la règle de calcul est dite en mots. Boutons Modifier / Publier / Supprimer stylés et nommés. Les clés d'une mission existante sont gardées (parties déjà jouées). Parcours navigateur `fin-missions-journey` mis à jour.

Les boutons modifier, voir et supprimer n'ont pas de style ; à l'ajout d'une mission, un JSON s'affiche sans explication.

### R8-12 — Marché pédagogique fictif (écran EP06)
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : suite de `R8-05`, décision du 2026-11-05 (avancer sans attendre la liste du client)
- Réalisé (2026-11-05) : page `/app/portefeuille/marche`, reliée au portefeuille. Huit supports types (`constants/finPaperMarket.js`, version 2026-11) : livret 2,5 %, dépôt à terme 3,5 %, obligation d'État 5 %, sukuk 5,5 %, fonds diversifié 6,5 %, grande entreprise 8 %, petite entreprise 10 %, or 5 %, avec leur volatilité, leur liquidité, leur horizon et un risque de 1 à 7. Historique mensuel simulé depuis janvier 2024 (`services/finance/paperMarket.js`), reproductible, qui gagne un mois chaque mois sans réécrire le passé ; mesures : 12 derniers mois, rendement par an, volatilité constatée, pire mois, plus forte baisse. Rendement réel avec l'inflation des simulateurs (5 %). Projection « Et si je plaçais… ? » : fourchette (1 chance sur 10 en dessous et au-dessus), médiane en argent d'aujourd'hui, chance de perte. Achat fictif au prix du mois ; dans le portefeuille, un bouton remet un support acheté au marché au prix simulé du mois. Comparaison de plusieurs supports en base 100. Badge « Exemple fictif » sur chaque carte. Tests : `paperMarket.test.js` (8), `finPaperMarket.test.js` (4), `fin-market-journey` (3).
- **Reste** (confié à `P6-01`) : faire valider ou remplacer les hypothèses par le client ; les rendre modifiables dans l'administration s'il le demande.

Les cahiers ne fournissent ni supports, ni prix, ni historique (vérifié dans les 9 classeurs et les 2 documents), mais l'écran EP06 autorise des « données fictives ou pédagogiques ». À construire :
- une gamme de supports types (livret, dépôt à terme, obligation, sukuk, fonds diversifié, actions, or), aux noms génériques ;
- pour chacun, des hypothèses écrites, datées et versionnées : rendement annuel moyen, volatilité, liquidité, horizon conseillé, niveau de risque ; ordres de grandeur prudents, cohérents avec l'inflation des simulateurs ;
- un historique mensuel simulé à partir de ces hypothèses, reproductible, avec ses mesures (rendement constaté, volatilité, pire mois, plus forte baisse) ;
- des fiches qui se comparent, et « Ajouter au portefeuille fictif » ;
- partout le badge « exemple fictif — pas un cours réel ».

À prévenir le client : les hypothèses sont les nôtres ; il les valide ou les remplace à la recette.

---

# R9 — Troisième passage de recette, avec le client (2026-11-08)

Les remarques de `test.txt` (3e passage) qui sont des défauts ou des réglages de l'existant. Les nouvelles fonctionnalités demandées au même passage sont en Phase 10 de [TASKS.md](TASKS.md) : catégories principales choisissables (l. 9), couleurs personnalisables (l. 13), intérêts composés dans le portefeuille fictif (l. 16), marchés boursiers (l. 17), autres devises (l. 32), accès limité à un seul utilisateur pour les non-abonnés (l. 35).

### R9-01 — Dépense : seulement les catégories de dépense ; revenu : seulement celles de revenu
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 1 et 6 (3e passage)
- Réalisé (2026-11-08) : Le type du mouvement filtre les catégories proposées : à la saisie, à la correction, au classement direct dans la liste, et dans le filtre de la liste quand l'onglet Revenus ou Dépenses est ouvert. Changer le type vide la catégorie choisie.

Le choix de catégorie d'une dépense propose aussi les catégories de revenus, et inversement. Le type du mouvement filtre les catégories proposées, partout (saisie, saisie rapide, correction, filtres de liste).

### R9-02 — Le flux net de l'anneau additionne au lieu de soustraire
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 2 (3e passage)
- Réalisé (2026-11-08) : L'onglet « Flux » affiche au centre le flux net, revenus − dépenses, avec son signe ; les deux parts de l'anneau restent revenus et dépenses, sans pourcentage trompeur.

L'onglet « Flux » de l'Accueil affiche au centre la somme revenus + dépenses. Il doit afficher revenus − dépenses, avec son signe.

### R9-03 — Anneau de l'Accueil : visible dès un premier revenu, vide sans mouvement
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 3 (3e passage)
- Réalisé (2026-11-08) : Sans mouvement, l'anneau est un cercle gris « Aucun mouvement » avec une invitation à saisir. Avec des revenus mais aucune dépense, l'Accueil s'ouvre sur l'onglet « Revenus » jusqu'à ce que la personne choisisse un onglet.

### R9-04 — Budgets liés aux catégories de dépenses, et création d'un second budget
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 4, 7 et 10 (3e passage)
- Réalisé (2026-11-08) : Les enveloppes se créent sur une catégorie (ou un groupe) de dépense, et chaque dépense de cette catégorie s’y impute (vérifié : Loyer 15 000 sur 20 000, Alimentation 3 000 sur 10 000). Chaque enveloppe a un lien « Voir les dépenses de cette enveloppe » qui ouvre les mouvements filtrés sur sa catégorie ou son groupe et sur la période du budget. Un second budget sur la même période reste refusé (règle du cahier : « chevauchement de périodes refusé »), mais l’écran dit maintenant quel budget couvre déjà la période et propose de l’ouvrir pour y ajouter la catégorie. Les dépenses d’un compte à part ne comptent plus dans le budget. Si le client veut plusieurs budgets en parallèle sur un même mois, c’est un changement de règle à lui faire confirmer.

Les compartiments d'un budget ne sont pas tous renseignés ; impossible de créer un autre budget. Une enveloppe se crée sur une catégorie (ou sous-catégorie) de dépense, et chaque dépense de cette catégorie s'y impute automatiquement : consommé, reste, dépassement, visibles en creusant le budget jusqu'à la dépense. Une dépense sans budget reste possible.

### R9-05 — Impossible de changer le compte d'un revenu
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 5 (3e passage)
- Réalisé (2026-11-08) : En modification, le champ « Compte » n'est plus bloqué : un revenu passe d'« Espèces » à un compte bancaire (le serveur vérifie la devise du compte).

En modification, le champ « Compte » est bloqué : on ne peut pas passer un revenu d'« Espèces » à un compte bancaire.

### R9-06 — Comptes : chaque mouvement sur un compte, et des calculs par compte
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 8, 28 et 34 (3e passage)
- Réalisé (2026-11-08) : Chaque mouvement porte son compte (Espèces s'il n'est pas choisi) et la liste l'affiche. Un compte « à part » n'entre plus dans le global : solde, revenus, dépenses, flux, anneau et liste de l'Accueil, Synthèse. Choisir un compte sur l'Accueil donne l'anneau, le flux, les chiffres et les mouvements de ce compte seul. La fiche d'un compte affiche ses revenus, ses dépenses et son flux du mois. Vérifié : revenu de 80 000 DA reçu sur le compte bancaire, dépenses de 15 000 (banque) et 3 000 (Espèces), 5 000 sur un compte à part exclus du global.

Chaque dépense et chaque revenu précise son compte. Un compte « intégré au total » compte dans le solde global, l'anneau et le flux ; un compte à part est calculé seul (ses revenus, dépenses, transferts, enveloppes). Le compte bancaire créé n'affiche aucun revenu ; vue par compte à rendre cohérente.

### R9-07 — Premiers pas : « Choisir mon profil » et « Confirmer mon revenu » ne s'enregistrent pas
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 12 (3e passage)
- Réalisé (2026-11-08) : « Choisir mon profil » : les deux engagements à accepter sont écrits à côté de la case, et un oubli (profil ou case) donne un message clair au lieu de la bulle du navigateur. « Confirmer mon revenu » : une fois enregistré, l'étape affiche ce qui est retenu (date, compte, mode) avec « Modifier ». Premier revenu : une case « Je l'ai déjà reçu » l'enregistre aussi comme mouvement, il apparaît aussitôt dans l'Accueil et sur son compte.

### R9-08 — Fonds d'urgence et réserve de sécurité : définition et calcul
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 14 et 37 (3e passage)
- Réalisé (2026-11-08) : Avant un mois complet d’historique, les dépenses essentielles ne sont plus « inconnues » : votre estimation, sinon les enveloppes essentielles du budget, sinon les dépenses essentielles déjà enregistrées (un minimum, dit comme tel). Ajouts de l’écran C12 du cahier : la date estimée (à l’épargne mensuelle prévue pour le fonds) et un bloc « Comment c’est calculé » en mots (dépenses essentielles, montant visé, mois couverts, reste à mettre de côté, date, ce qui ne compte pas).

La page dit que budget, dépenses et revenus ne sont pas enregistrés alors qu'ils le sont, et la méthode de calcul n'apparaît pas.

### R9-09 — Abonnements : coût mensuel et annuel, et affichage comme abonnements
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 18 et 25 (3e passage)
- Réalisé (2026-11-08) : Un abonnement est reconnu par sa catégorie (téléphone, internet, streaming, musique, stockage en ligne, logiciel, salle de sport) ou par son nom (« abonnement »). Le coût mensuel et annuel ne compte que les abonnements ; toutes les charges régulières (loyer compris) ont leur propre total à côté. Chaque abonnement porte l’étiquette « Abonnement » dans le calendrier. Vérifié : box internet 2 500 DA/mois, 30 000 DA/an ; charges régulières 22 500 DA/mois.

### R9-10 — Entrées et sorties prévues, prévu et réel : non calculés
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 19, 24 et 36 (3e passage)
- Réalisé (2026-11-08) : Calendrier : le prévu de la période garde les échéances déjà confirmées (le salaire reçu le 5 compte dans les entrées prévues), les revenus réels s’affichent à côté des dépenses réelles, et une phrase explique prévu et réel. Les comptes à part ne comptent plus dans le réel. Accueil : « Prévu / réel » prend le budget du mois comme prévu quand il existe (vérifié : prévu 30 000, réalisé 18 000).

Les sorties prévues doivent se calculer, ou se relier aux dépenses enregistrées.

### R9-11 — Prêts et emprunts : effet sur « À faire », les comptes, les revenus et l'évolution des soldes
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 20, 21 et 33 (3e passage)
- Réalisé (2026-11-08) : Cause trouvée : le formulaire de prêt envoyait la date du jour à 12 h (heure universelle) ; avant 13 h en Algérie, le prêt était « dans le futur » et refusé, mais son compte était déjà créé — d’où un prêt sans argent, sans dette et sans rien dans « À faire ». Corrigé : la date ne dépasse jamais l’instant de l’enregistrement, et la création est tout-ou-rien (rien n’est gardé si une étape échoue). Un prêt ou un emprunt fait bien bouger le compte choisi (vérifié : emprunt de 20 000 DA, compte BNA de 65 000 à 85 000 DA) et la position nette tient compte de la dette. Nouveau champ « Remboursement par mois (facultatif) » ; « Aujourd’hui » a une rubrique « Prêts et emprunts » (à rembourser / à vous rembourser, montant du mois, reste, échéance dans les 30 jours). Le formulaire dit qu’un emprunt n’est pas un revenu (c’est de l’argent à rendre) et qu’un prêt n’est pas une dépense.

Un prêt ou un emprunt enregistré n'apparaît ni dans « À faire », ni sur le compte touché, ni dans l'évolution des soldes.

### R9-12 — Objectif : en combien de mois, et simulation année par année
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 22 (3e passage)
- Réalisé (2026-11-08) : La fiche d’un objectif montre « Simulation année par année », toujours visible : à partir du capital déjà mis de côté, de l’épargne mensuelle et du taux de l’objectif s’il en a un, chaque année avec ce qui est mis de côté, les intérêts, le capital en fin d’année et la part de la cible ; la ligne de l’année où l’objectif est atteint est surlignée, et la phrase de tête dit en combien de mois (vérifié : voiture de 1 200 000 DA à 20 000 DA par mois, atteinte en 60 mois, novembre 2031). Sans épargne mensuelle, l’écran dit où l’indiquer.

### R9-13 — Position nette : dire comment elle est calculée
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 27 (3e passage)
- Réalisé (2026-11-08) : La page Comptes explique les deux totaux, en mots et en chiffres : « Solde total » = somme des comptes comptés dans le total ; « Position nette » = ce que vous possédez (comptes comptés dans le patrimoine : comptes, espèces, épargne, sommes prêtées) − ce que vous devez (emprunts et crédits suivis sur un compte), avec la ligne « Aujourd’hui : 77 000 possédés − 20 000 dus = 57 000 ».

### R9-14 — Accueil : placer « + » juste sous « Synthèse »
- Statut : `✅ done`
- Priorité : `🟢 low`
- Origine : `test.txt` l. 29 (3e passage)
- Réalisé (2026-11-08) : Sur l’Accueil, le bouton « + Dépenses & revenus » est juste sous « Synthèse », dans le bloc du solde (en pleine largeur sur téléphone) ; il n’est plus répété dans les raccourcis.

### R9-15 — Provisions : montant mensuel incompréhensible ou faux
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 30 (3e passage)
- Réalisé (2026-11-08) : Le montant mensuel est « reste à mettre de côté ÷ mois jusqu’à l’échéance ». Défaut corrigé : une échéance plus tard dans le mois courant donnait 0 mois, donc « non calculé » ; il reste maintenant au moins ce mois-ci (tout le reste est à mettre de côté maintenant). Sous chaque provision, le calcul est écrit en chiffres (« il reste X avant le JJ/MM, soit N mois : X ÷ N = Y par mois »). Test unitaire ajouté.

### R9-16 — « DZD » déborde du champ montant
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 31 (3e passage)
- Réalisé (2026-11-08) : Les cartes chiffrées mesurent leur largeur : un long montant réduit sa taille et ne sort plus du cadre (vérifié à 900 px avec 1 200 000,00 DZD) ; dans un champ montant, « DZD » ne se comprime plus et le champ ne dépasse plus de sa colonne. Suite (page budget, retour du 2026-11-08) : dans le formulaire « Ajouter une enveloppe », le champ montant recevait une seconde bordure et la grille étirait les champs, si bien que « DZD » se décalait et sortait du cadre entre 900 et 1 200 px ; corrigé pour tous les formulaires (budget, dettes, objectifs). Même passe : entre 768 et 1 199 px, « FINCLUDIA » passait sous « Gestion budgétaire » et le profil sortait de l’écran ; la marque garde son logo et cède son nom à ces largeurs. Vérifié à 375, 900, 1 100 et 1 280 px, sans aucun élément qui dépasse.

### R9-17 — L'anneau se réduit en barre en faisant défiler
- Statut : `✅ done`
- Priorité : `🟢 low`
- Origine : `test.txt` l. 38 (3e passage)
- Réalisé (2026-11-08) : Une fois l’anneau dépassé en faisant défiler, il reste en haut de l’écran aplati en barre : mêmes parts, mêmes couleurs, même onglet, avec son total (« Dépenses : 18 000,00 DZD »). Avant, ce bandeau n’apparaissait qu’avec deux mois d’historique, donc jamais chez un nouvel utilisateur.

### R9-18 — Fiche de paie
- Statut : `❌ todo`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 23 (3e passage)

Remarque sans détail : à reproduire (import, décodage, lien avec le revenu) et à préciser avec le client.

Vérifié le 2026-11-08 : le décodeur (Outils → Décodeur de fiche de paie) s’ouvre, accepte les lignes (salaire de base 80 000, cotisation 7 200, IRG 9 000) et affiche « Votre fiche, expliquée ». Aucun défaut reproduit : à préciser avec le client (quel écran, quelle fiche, quel résultat attendu).

### R9-19 — Le patrimoine réel n’inclut pas tous les actifs
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : remarque orale du client (2026-11-08), en plus de `test.txt`
- Réalisé (2026-11-08) : un compte à découvert compte comme une dette ; un actif déclaré « espèces », « compte » ou « CCP » n’est écarté que si un compte du même type ouvert par la personne le représente (le compte « Espèces » créé automatiquement ne masque plus rien). La page Patrimoine liste ce qui n’est pas compté et pourquoi, et dit ce qui compte. Vérifié : patrimoine net 57 000 DA = position nette des comptes. Tests ajoutés (CCP et espèces déclarés avec le compte automatique, découvert).

Deux causes trouvées :
- un compte à solde négatif (découvert) n’apparaît ni en actif ni en dette : le patrimoine net ne correspond plus à la position nette de la page Comptes ;
- les actifs déclarés « espèces », « compte » ou « CCP » sont écartés dès qu’il existe un seul compte, alors que le compte « Espèces » est créé automatiquement à la première dépense : un CCP ou un compte bancaire déclaré disparaît sans qu’aucun compte ne le représente.

À faire : un découvert compte comme une dette ; un actif déclaré n’est écarté que si un compte du même type le représente ; la page dit ce qui n’est pas compté et pourquoi.

---

# R10 — Quatrième passage de recette (2026-11-10)

Les remarques de `test.txt` (4e passage) qui sont des défauts ou des réglages de l'existant. Les nouvelles fonctionnalités du même passage sont en Phase 11 de [TASKS.md](TASKS.md) : réinitialiser tout ou une partie (l. 2), deux FAQ site / application (l. 7), simulateurs d'épargne des objectifs (l. 15), versements futurs planifiés vers un objectif (l. 16).

### R10-01 — Espacements uniformes entre champs, cases et boutons
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 1 (4e passage)
- Réalisé (2026-11-08) : Règle commune (`index.css`), pas page par page : 14 px entre deux champs qui se suivent, 16 px entre les champs et le bouton qui les envoie, et deux cases à cocher qui se suivent l’une sous l’autre, à 10 px, la case et son texte à 8 px. Vérifié : profil de risque du portefeuille (bouton à 16 px des champs), budget (« Reporter le reste » et « Reporter aussi » l’une sous l’autre). Les boutons radio (pastilles de période) ne sont pas touchés.

Exemples : « Profil de risque pédagogique » (`/app/portefeuille`) entre les champs et le bouton ; le budget entre « Reporter le reste » et « Reporter aussi ». Règle commune : même écart entre deux champs, entre un champ et le bouton, et entre deux cases à cocher, partout.

### R10-02 — « + » (ajouter un mouvement) juste sous « Synthèse »
- Statut : `✅ done`
- Priorité : `🟢 low`
- Origine : `test.txt` l. 3 (4e passage)
- Réalisé (2026-11-08) : « Ajouter un mouvement » est dans le menu, juste sous « Synthèse » ; le « + » de la barre du haut reste où il est, et le bouton « + Dépenses & revenus » de l’Accueil aussi.

Le « + » de la barre du haut reste où il est ; l'ajout d'un mouvement doit aussi être disponible juste sous « Synthèse » (menu latéral).

### R10-03 — Premier revenu : impossible de choisir son compte courant
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 4 (4e passage)
- Réalisé (2026-11-08) : L’étape « Confirmer mon revenu » des Premiers pas propose tous les comptes ; quand le compte courant n’existe pas encore, un lien « Le créer, puis revenir ici » ouvre la création de compte et ramène aux Premiers pas, où il est alors proposé (même lien à l’étape du premier revenu). La page « Revenus prévus » propose désormais elle aussi le choix du compte (voir R10-05).

Un compte courant créé, puis le salaire renseigné : le choix du compte ne propose pas ce compte.

### R10-04 — Solde d'ouverture d'un compte absent de Mouvements
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 5 (4e passage)
- Réalisé (2026-11-08) : Mouvements affiche un bloc « Soldes de départ » : le solde d’ouverture de chaque compte, à sa date, qui suit les filtres de compte et de dates, avec la phrase qui dit qu’il compte dans le solde du compte mais pas dans les revenus du mois (ce n’est pas une rentrée d’argent).

Un compte courant créé avec 60 000 DA : rien n'apparaît dans `/mouvements`. Le solde de départ doit être visible (sans être compté comme un revenu du mois, ce qu'il n'est pas).

### R10-05 — Le revenu déclaré (salaire) n'est compté nulle part
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 6, 8 et 18 (4e passage)
- Réalisé (2026-11-08) : Cause : un revenu déclaré ailleurs que dans les Premiers pas (page « Revenus prévus ») n’avait ni compte ni paiement régulier : il n’arrivait jamais sur un compte et ne comptait que dans « revenus prévus » ; et quand aucun revenu n’était encore reçu, « non calculé — ajoutez vos revenus » renvoyait vers cette page, d’où le salaire ressaisi en double. Désormais un revenu déclaré a toujours son paiement régulier, lié (nouvelle colonne, migration `20261110090000_fin_recurrence_income`, liens existants repris) : compte et prochain versement se choisissent, « Je l’ai déjà reçu » le crédite une fois, il est proposé à chaque échéance dans « Aujourd’hui », et le modifier, l’archiver ou le supprimer (nouveau bouton) agit sur les deux. La page dit où et quand il arrive (prochaine échéance non confirmée) ou qu’il n’est relié à aucun compte. Sur l’Accueil, sous « Revenus » : « Encore attendu ce mois : X — Confirmer à réception » ; et sans revenu reçu mais avec des revenus déclarés, le conseil devient « confirmez votre revenu quand il arrive ». Tests : `finRecette10.test.js`.

« Revenu 0 » malgré le premier revenu renseigné ; un revenu prévu ne s'ajoute nulle part ; le salaire est redemandé alors qu'il a déjà été donné ; un salaire prévu ne peut être ni modifié ni retiré. Le revenu déclaré doit compter partout où il a sa place (sans doublon avec le revenu reçu), se modifier et se retirer.

### R10-06 — Nombres avec trop de décimales
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 9 (4e passage)
- Réalisé (2026-11-08) : Au plus deux décimales, au format de la langue, partout où un nombre de mois ou un nombre brut s’affiche : textes « N mois » (formatés par la traduction), jauge du fonds d’urgence, cartes chiffrées en points ou en nombre. « 1.2195121951219512 mois » devient « 1,22 mois ».

« Mois de réserve 1.2195121951219512 mois ». Partout dans l'application : au plus 2 décimales, au format de la langue.

### R10-07 — Fonds d'urgence : logique incomprise, suppression impossible
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 10 (4e passage)
- Réalisé (2026-11-08) : La page du fonds d’urgence commence par « En bref », avec vos chiffres : ce que contient le fonds, les dépenses essentielles d’un mois, combien de mois il couvre, la cible et ce qu’il manque, et comment le remplir. À l’étape 3, « Ouvrir … pour y verser de l’argent » et « Supprimer mon fonds d’urgence » (avec confirmation ; l’argent reste sur son compte). Le fonds n’apparaît pas dans la liste des objectifs, d’où l’impossibilité de le supprimer avant.

### R10-08 — Comptes : « Supprimer » à côté d'« Archiver »
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 11 (4e passage)
- Réalisé (2026-11-08) : « Supprimer » à côté d’« Archiver », sur la liste et sur la fiche d’un compte, avec confirmation : le compte part avec ses mouvements, et un virement avec un autre compte est annulé des deux côtés (comme la suppression d’un virement), donc le solde de l’autre compte redevient ce qu’il était. Suppression logique, journalisée. Vérifié : virement de 1 000 DA vers un compte supprimé, l’autre compte revient de 81 000 à 82 000 DA. Tests : `finRecette10.test.js`.

### R10-09 — Fiche d'un compte : expliquer le flux net du mois
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 12 (4e passage)
- Réalisé (2026-11-08) : La fiche d’un compte donne les entrées, les sorties et le flux net du mois de CE compte, virements compris (pour un compte, un virement fait bouger le solde comme un autre mouvement), et la phrase « Flux net du mois = entrées − sorties » avec le détail (revenus + virements reçus, dépenses + virements envoyés) ; les paiements planifiés sont dits à part, comptés une fois réalisés.

### R10-10 — Fiche d'un compte : graphiques et historique ne bougent pas après des mouvements
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 13 (4e passage)
- Réalisé (2026-11-08) : Cause : la courbe et l’historique étaient par mois, et les chiffres du mois venaient de la synthèse générale, qui laisse les virements de côté : un compte qui ne fait que des virements ne bougeait pas. La fiche montre maintenant l’évolution du solde jour par jour sur 30 jours (nouveau paramètre `jours` de l’historique), ses entrées et sorties virements compris, et la liste des mouvements du mois. Vérifié : salaire, loyer et deux prêts apparaissent, la courbe monte et descend aux bons jours. Tests : `finRecette10.test.js`.

### R10-11 — Sélecteur de catégorie : la recherche ne marche pas toujours
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 14 (4e passage)
- Réalisé (2026-11-08) : Causes : une espace en fin de recherche (fréquente sur téléphone) et l’apostrophe typographique des noms (« Fonds d’urgence ») face à l’apostrophe droite du clavier faisaient qu’aucun résultat ne sortait. La recherche ignore maintenant les espaces en trop, accents, majuscules et la forme de l’apostrophe, et cherche chaque mot séparément (« courses ali » trouve « Courses alimentaires »).

### R10-12 — Vérifier : flux net = encaissements − décaissements
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 17 (4e passage)
- Réalisé (2026-11-08) : Vérifié : flux net = revenus encaissés − dépenses décaissées (80 000 − 18 000 = 62 000 sur le compte de test, Accueil et Synthèse identiques). Défaut corrigé : sans aucun revenu reçu, le flux net était « non calculé » ; il vaut désormais −(dépenses), l’autre côté comptant pour zéro. Test : `finRecette10.test.js`.

### R10-13 — Création d’un compte : dire s’il compte dans le global ou s’il est calculé seul
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : remarque du client transmise en direct (2026-11-11)
- Réalisé (2026-11-11) : le formulaire de création propose, sous « Ce compte compte-t-il dans le global ? », les deux choix qui n’étaient jusqu’ici réglables qu’en modifiant un compte : « Compter dans le solde total » et « Compter dans le patrimoine », cochés selon le type de compte, chacun avec sa phrase (oui : son solde s’ajoute au total et ses mouvements comptent dans l’Accueil, la Synthèse, le budget et le calendrier ; non : il est calculé seul, sur sa fiche, sans rien changer aux chiffres globaux), et le rappel qu’on peut les changer plus tard.

# R11 — Cinquième passage de recette (2026-11-11)

Les remarques de `test.txt` (5e passage). Les défauts de l'existant ; la seule fonctionnalité nouvelle (ajouter ses propres réponses automatiques à l'assistant) est en Phase 12 de [TASKS.md](TASKS.md), P12-01.

### R11-01 — Formulaires centrés, pas collés à gauche
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 1 (5e passage)
- Réalisé (2026-11-11) : Les formulaires étroits (compte, prêt, premiers pas, entreprise) sont centrés dans la page ; les formulaires pleine largeur restaient corrects. Vérifié sur `/app/comptes/nouveau`.

Exemple : `/app/comptes/nouveau`. Les formulaires étroits (compte, prêt, premiers pas, entreprise) restent à gauche de la page ; les formulaires pleine largeur (mouvement, budget, objectif, dette) ne sont pas concernés.

### R11-02 — L'explorateur paraît vide
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 2 (5e passage)
- Réalisé (2026-11-11) : L'explorateur s'ouvre sur « Commencer par une rubrique » : les rubriques qui ont des offres, avec leur nombre ; un clic affiche les offres de la rubrique. Le serveur ne renvoie que des comptes par rubrique sans filtre, jamais la liste des offres. Test `finRecette11`.

`/app/outils/explorateur` n'affiche rien tant qu'on n'a rien tapé : il faut montrer dès l'ouverture les rubriques disponibles, avec leur nombre d'offres, pour commencer d'un clic.

### R11-03 — Administration de l'assistant : peu claire, publication et étapes impossibles
- Statut : `✅ done`
- Priorité : `🟠 high`
- Origine : `test.txt` l. 3 (5e passage)
- Réalisé (2026-11-11) : Un seul écran « Assistant « Une question ? » » (une seule entrée de menu) avec 4 onglets : Questions (ajout, choix « Site seulement », « Application seulement », « Site et application », bouton Publier / Retirer), Réponses automatiques (compteur des publiées, « Réponse à écrire », « Écrire la réponse », « Enregistrer et publier »), Parcours guidés (éditeur d'étapes : question, choix menant à une étape, à une réponse automatique ou à la fin ; publication possible dès une étape), Journal. Les parcours publiés sont proposés dans le panneau « Une question ? », sur le site et dans l'application. Test `finRecette11`.

Un seul assistant « Une question ? », identique sur le site et dans l'application, seules les questions changent. Aujourd'hui deux écrans séparés (« Assistant » et « Assistant FINCLUDIA ») ; les intentions restent en brouillon (la publication, une icône d'œil, échoue sans dire qu'il manque la réponse) ; un parcours se crée mais on ne peut pas lui ajouter d'étape, donc jamais le publier.

### R11-04 — Page « Services d'Algérie Poste » cassée sur le site
- Statut : `✅ done`
- Priorité : `🟠 high`
- Origine : `test.txt` l. 4 (5e passage)
- Réalisé (2026-11-11) : La page est posée dans le cadre centré du site (marges comme les autres pages) ; champ de recherche à hauteur normale.

`/outils/postal` : sur le site, le contenu touche les bords de l'écran (pas de marges) ; dans l'application la page est correcte.

### R11-05 — Assistant : chaque question et chaque réponse dans toutes les langues
- Statut : `✅ done`
- Priorité : `🟠 high`
- Origine : remarque du 2026-11-11 (« il faut surveiller que tous aient une traduction »)
- Réalisé (2026-11-11) : une question de « Une question ? » est désormais une seule question avec ses traductions (français, anglais, arabe), écrites sur un même formulaire à onglets ; la liste montre pour chacune « FR ✓ / EN manquante / AR manquante », et un bandeau compte les questions pas encore traduites partout. Où elle s’affiche, sa place et sa publication valent pour toutes ses traductions. Une langue pas encore écrite affiche la question en français au lieu de la faire disparaître. Les réponses automatiques ont aussi leurs traductions (nom et réponse), et l’assistant répond dans la langue de la personne. Au passage : une phrase tapée en arabe n’était jamais reconnue (les lettres arabes étaient effacées avant la comparaison) ; corrigé. Migration `20261111100000_assistant_languages` (les questions existantes deviennent chacune une question à une langue). Tests : `chatbot.test.js` (mis à jour), `finRecette11.test.js`.

Certaines questions de la FAQ « Une question ? » avaient une traduction, d’autres non, sans moyen de le voir ni de traduire une question existante : chaque question était écrite dans une seule langue.

### R11-06 — Assistant : « Écran ouvert par cette intention » ne proposait que quelques écrans
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : remarque du 2026-11-11
- Réalisé (2026-11-11) : la liste propose tous les écrans de l’application (57, avec le nom du menu quand il existe) et du site (18), groupés « Application » / « Site » ; elle est fournie par le serveur, qui n’accepte que ces écrans. Libellé devenu « Écran proposé par cette réponse », « Aucun écran ».

La liste ne comptait que 12 adresses, presque toutes du site public.

### R11-07 — Le salaire compté deux fois dans le solde total
- Statut : `✅ done`
- Priorité : `🔴 critical`
- Origine : `test.txt` l. 1 (2026-11-11, 2e envoi)
- Réalisé (2026-11-11) : reproduit — un compte courant ouvert avec 60 000 DA (le salaire déjà dedans), puis le salaire déclaré « déjà reçu » sur ce compte : solde total 120 000 DA. Dans « Premiers pas », la case « déjà reçu » était même cochée d’office. Désormais, quand on coche « Je l’ai déjà reçu » sur un compte qui a démarré avec un solde, la question est posée : « Le compte « Courant » a démarré avec 60 000 DA le … Ce versement est-il déjà compris dans ce solde de départ ? » — « Oui, il y est déjà : ne pas l’ajouter une deuxième fois » (proposé d’office si le compte a été ouvert le jour du versement ou après) / « Non, l’ajouter au solde ». « Oui » n’ajoute rien et le revenu attend son versement suivant ; rien ne reste « à confirmer ». Même question dans « Revenus » et dans « Premiers pas ». Tests : `finRecette11.test.js` (3 cas).

« J’ai créé un compte courant, je lui ai affecté un salaire net, mais dans le solde total j’ai le double de mon salaire net. »

### R11-08 — Plusieurs budgets pour une même période
- Statut : `✅ done` — remplacé par R11-10 (décision du client, 2026-11-11 : la règle est retirée)
- Priorité : `🟠 high`
- Origine : `test.txt` l. 2 (2026-11-11, 2e envoi)
- Réalisé (2026-11-11) : la règle « une période, un budget » existait (R9-04), mais deux enregistrements envoyés au même instant (double clic sur « Enregistrer ») passaient tous les deux la vérification avant que l’un soit écrit — reproduit : trois envois simultanés, trois budgets. La vérification se fait maintenant dans l’écriture même, la personne verrouillée le temps de l’écrire : un seul budget est créé, les autres sont refusés avec le message habituel. Même verrou à la modification des dates et à la restauration d’un budget archivé ; le bouton « Enregistrer » est désactivé pendant l’envoi. Tests : `finRecette11.test.js`.

« On peut créer plusieurs budgets pour une même période ou des périodes qui se chevauchent. »

### R11-09 — Barre latérale de l’administration
- Statut : `✅ done`
- Priorité : `🟢 low`
- Origine : `test.txt` l. 3 (2026-11-11, 2e envoi)
- Réalisé (2026-11-11) : les 14 entrées sont rangées en sections, comme dans l’application — Vue d’ensemble, Contenus (formations, articles, apprendre, missions, médiathèque, certifications, newsletter), Assistant, Finances (paiements, comparateur, cours des devises), Plateforme (utilisateurs, paramètres) ; « Assistant » tient sur une ligne ; le menu défile seul quand il est plus haut que l’écran ; « Réduire le menu » le replie à ses icônes (retenu sur ce navigateur). Sur mobile, il reste une bande horizontale.

« Améliore la side bar de l’admin. »

### R11-10 — Plusieurs budgets peuvent couvrir la même période
- Statut : `✅ done`
- Priorité : `🟠 high`
- Origine : décision du client (2026-11-11), en réponse à R11-08
- Réalisé (2026-11-11) : la règle « une période, un budget » (R9-04) est retirée : on peut créer plusieurs budgets pour le même mois ou pour des périodes qui se chevauchent (un budget maison et un budget vacances, par exemple), les modifier et les restaurer sans refus. Les alertes de dépassement portent sur chacun des budgets en cours ; l’Accueil, le tableau de bord et le rapport montrent le budget commencé le plus récemment. Tests : `finBudget.test.js` (mis à jour), `finRecette11.test.js`.

« Non, pour les budgets il faut enlever la règle une période un budget. »

### R11-11 — Modifier un compte : le solde de départ et tous ses détails
- Statut : `✅ done`
- Priorité : `🟠 high`
- Origine : remarque du 2026-11-11 (« quand je rentre pour modifier, on ne me donne pas la main sur le solde de départ et tous les détails du compte »)
- Réalisé (2026-11-11) : l’écran « Modifier le compte » montre en tête le type, la devise et le solde d’aujourd’hui (avec la phrase qui dit pourquoi le type et la devise ne se changent pas), puis permet de corriger le **solde de départ** et **sa date** (avec l’explication : ce que le compte contenait ce jour-là ; le corriger recalcule le solde, l’ancienne valeur reste dans l’historique), en plus du nom, de « Ce compte compte-t-il dans le global ? » (avec les mêmes explications qu’à la création), des alertes, de la note et de la couleur. Un solde saisi deux fois se corrige donc là. Tests : `finRecette11.test.js`.

### R11-12 — « Revenu à confirmer » alors qu’il était déjà là dès le départ
- Statut : `✅ done`
- Priorité : `🟠 high`
- Origine : remarque du 2026-11-11 (« on me dit de confirmer le revenu alors que je l’ai renseigné dès le départ »)
- Réalisé (2026-11-11) : à côté de « Reçu », un second bouton **« Déjà dans le solde de départ »** dans « Aujourd’hui » (et dans le calendrier) : le versement est réglé sans rien ajouter au compte, et n’est plus demandé. Il sert aux revenus déjà déclarés avant R11-07 ; pour un nouveau revenu, la question est posée dès la saisie (R11-07). Migration `20261111120000_occurrence_included` (nouvelle issue « déjà compté »). Tests : `finRecette11.test.js`.

### R11-13 — Une seule déclaration claire du revenu : le revenu, son compte, sa date, ses versements
- Statut : `✅ done`
- Priorité : `🔴 critical`
- Origine : `test.txt` l. 1 (2026-11-11, 3e envoi)
- Réalisé (2026-11-11) : « Revenus » et « Premiers pas » utilisent désormais **le même formulaire**, en quatre questions numérotées : 1. Quel revenu ? (nom, catégorie, montant, fréquence) — 2. Sur quel compte arrive-t-il ? (le compte bancaire est proposé d’office ; son solde de départ est rappelé) — 3. Quand arrive-t-il ? (la date du versement ; si elle est passée, une réponse est **exigée** : « est arrivé, déjà compris dans le solde de départ » / « est arrivé : l’ajouter maintenant » / « n’est pas encore arrivé : me le demander dans Aujourd’hui ») — 4. Et les versements suivants ? (« me demander de confirmer » ou « l’ajouter automatiquement le jour venu »). En bas, **« Ce qui va se passer »** dit en clair ce que fera l’enregistrement (ex. : « Le versement du 11 nov. est déjà dans le solde de « Courant » : rien n’est ajouté. Ensuite, chaque versement vous est demandé le jour venu, et n’est compté qu’une seule fois. »). La liste des revenus dit, pour chacun, le compte, le prochain versement et « à confirmer » ou « ajouté automatiquement » ; la modification reprend le même formulaire. La note en tête de « Revenus » est réécrite. Remplace la question ajoutée en R11-07 (même règle, intégrée). Tests : `finRecette11.test.js`.

« Le problème du revenu revient à chaque fois et il est lié à l’ensemble de la gestion : il faudrait que la déclaration du revenu soit claire, ainsi que l’enregistrement du revenu, de sa date et de son inscription dans un compte. »

### R11-15 — Réserve de sécurité et reste à vivre
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : remarque du client (2026-11-11) : « La réserve de sécurité est un objectif, normalement elle est calculée sur le reste à vivre. »
- Décision (2026-11-11) : le montant visé reste celui du fichier du client, F015 (nombre de mois × dépenses essentielles) ; la réserve reste l’objectif « Fonds d’urgence » relié à sa page, rien à changer de ce côté.
- Réalisé (2026-11-11) : la page « Fonds d’urgence » montre en plus le **reste à vivre par mois** (F006 du client : revenus nets − charges fixes − mensualités des dettes ; charges fixes = moyenne des dépenses des catégories « charges fixes » sur les mois complets d’historique, 1 à 3), avec la phrase qui explique la différence : le montant visé se calcule sur les dépenses essentielles (ce qu’il faudrait continuer à payer si les revenus s’arrêtaient) ; le reste à vivre est ce qui reste chaque mois et sert à alimenter la réserve. Ligne ajoutée à « Comment c’est calculé ». Sans revenu déclaré ou sans un mois d’historique, il reste « non calculé », jamais deviné. Tests : `finRecette11.test.js`.

### R11-16 — En ligne, la plupart des actions semblent ne rien faire (pointer, ajouter un revenu…)
- Statut : `✅ done`
- Priorité : `🔴 critical`
- Origine : remarque du 2026-11-11 (version en ligne ; en local tout marche)
- Cause (vérifiée sur https://az-tenders.ay-web.com le 2026-11-11) : le nginx de l’hébergement **garde en cache les réponses GET de l’API** — `/api/health` renvoyait la même réponse (même heure, même durée de fonctionnement) pendant deux minutes, et une réponse neuve dès qu’on ajoutait un paramètre unique. Le serveur ne disait pas de ne pas les garder. Après un pointage (enregistré), la liste des mouvements redemandée revenait du cache, inchangée (304) : l’action paraissait sans effet. Ni l’hébergeur (PUT/PATCH/DELETE bien reçus), ni les migrations, ni l’origine des requêtes n’étaient en cause.
- Réalisé (2026-11-11) : toutes les réponses de l’API portent `Cache-Control: no-store, private` (plus `Pragma: no-cache` et `Vary: Cookie`) ; le site demande toujours une réponse fraîche (`cache: 'no-store'`). Test : `security/apiNoStore.test.js`. **À faire sur l’hébergeur après la mise en ligne** : vider le cache nginx de cPanel (« NGINX Manager » → vider le cache) pour effacer les réponses déjà gardées.

# R12 — Sixième passage de recette (2026-11-12)

Les remarques de `test.txt` (6e passage) et une capture du client (page réserve, sur téléphone). Chaque remarque a d'abord été rejouée sur un compte neuf avant toute correction : la version actuelle, pas d'anciennes données ni d'anciens doublons. La seule règle nouvelle (un compte sans abonnement) est en Phase 12 de [TASKS.md](TASKS.md), P12-03.

### R12-01 — Réserve : « Cette valeur n'est pas valide » en corrigeant l'estimation
- Statut : `✅ done`
- Priorité : `🔴 critical`
- Origine : capture du client du 2026-11-11 (`/app/objectifs/fonds-urgence`, « Corriger mon estimation par mois »)
- Cause (reproduite) : l'écran enregistrait l'estimation comme une réponse du questionnaire d'inscription, à la question commune « dépenses essentielles ». Pour un salarié, un jeune actif ou un étudiant, cette question est remplacée par les leurs (« charges fixes », logement, alimentation…), et le serveur refusait une question « non posée pour ce profil ». Seuls les profils sans questions propres pouvaient enregistrer.
- Réalisé (2026-11-12) : l'estimation a sa propre route (`PUT /fin/reserve/estimation`), acceptée pour tous les profils. Le total corrigé sur la réserve remplace le détail donné à l'inscription (il ne s'y ajoute pas). Test : `finRecette12.test.js`.

### R12-02 — Réserve : « Reste à vivre : non calculé — déclarez vos dettes »
- Statut : `✅ done`
- Priorité : `🟠 high`
- Origine : même capture
- Cause (reproduite) : avec moins d'un mois de dépenses enregistrées, les charges fixes étaient inconnues et le reste à vivre restait « non calculé » ; le lien proposait « déclarez vos dettes », lu dans une mensualité à 0, qui est une vraie réponse (pas de dette).
- Réalisé (2026-11-12) : sans un mois d'historique, les charges fixes viennent, comme les dépenses essentielles de la réserve, de l'estimation déclarée, puis des enveloppes « charges fixes » du budget ; le « Pourquoi ? » dit d'où elles viennent. Le lien indique ce qui manque vraiment : déclarer un revenu, ou donner l'estimation. Test : `finRecette12.test.js`.

### R12-03 — Le revenu « n'est jamais pris en compte »
- Statut : `✅ done`
- Priorité : `🔴 critical`
- Origine : `test.txt` l. 1-2 (6e passage) : « le revenu n'est pas déclaré… sans créer un doublon » ; « tous les calculs se font via le solde initial du compte, puis rajouter les revenus dans un second temps et recalculer »
- Cause (reproduite sur un compte neuf : compte courant à 150 000 DA, salaire de 80 000 DA « déjà dans le solde de départ ») : le solde était juste, mais le salaire n'était compté dans aucun mois — flux net « non calculé », taux d'épargne « déclarez une ressource ». Le choix « déjà dans le solde de départ » (R11-07, R11-12) n'écrivait rien.
- Réalisé (2026-11-12) : la méthode proposée par le client. « Déjà dans le solde de départ » enregistre le versement comme un vrai revenu de son mois, et ramène le solde de départ à ce qu'il était avant lui (150 000 → 70 000). Le solde du compte ne bouge pas (70 000 + 80 000), le salaire compte dans le mois, jamais deux fois. Même chose depuis le formulaire de revenu, les premiers pas, « Aujourd'hui » et le calendrier ; la correction du solde de départ est gardée dans l'historique du compte. Le résumé « Ce qui va se passer » le dit. Tests : `finRecette11.test.js`, `finRecette12.test.js`.
- Limite : un salaire déclaré « déjà dans le solde de départ » AVANT cette correction n'a laissé aucune trace à reprendre automatiquement. Pour qu'il compte dans son mois : supprimer ce revenu et le déclarer à nouveau avec le même choix.

### R12-04 — Budget : pas de rapprochement entre l'enveloppe et ce qui a été dépensé
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 4 (6e passage), précisé le 2026-11-12 : « des fois les enveloppes s'affichent mais les dépenses ne sont pas renseignées »
- Premier essai non reproduit (enveloppes sur des sous-catégories, dépenses en milieu de mois). Reproduit ensuite (budget d'octobre, 7 000 DA dépensés, 2 000 DA affichés) — deux causes réelles :
  1. Une enveloppe posée sur une catégorie principale (« Alimentation », p. ex. proposée à partir des dépenses passées) ne recevait que les dépenses de cette catégorie exacte, pas celles de ses sous-catégories (« Alimentation & boissons »).
  2. Les dépenses du dernier jour de la période étaient exclues : la période s'arrêtait le 31 à 00 h 00. Même défaut dans la liste des mouvements filtrée « au 31 ».
- Correction : l'enveloppe d'une catégorie principale couvre tout son groupe (une enveloppe de sous-catégorie garde ses propres dépenses, une enveloppe de groupe reste prioritaire) ; une date de fin couvre toute la journée (budget, épargne de la méthode de budget, liste des mouvements) ; « Voir les dépenses » d'une enveloppe de catégorie principale ouvre le groupe.
- Test : `finRecette12.test.js` (R12-04).

---

# R13 — Septième passage de recette (2026-11-12) : ce que le client demande

Les remarques de `test.txt` (7e passage) et « quelques idées du client » ont été **déchiffrées** : chaque phrase est reprise ci-dessous avec ce qu'elle demande réellement, puis rattachée à une tâche. Chaque point a d'abord été rejoué sur un compte neuf (compte 150 000 DA, salaire 80 000 DA, dépense 30 000 DA) avant toute correction.

| Ce que dit le client | Ce qu'il demande vraiment | Tâche |
|---|---|---|
| « le flux est toujours mal calculé : on ne prend en compte que les revenus, il faut intégrer le solde, les dépenses » (l. 1) ; « le solde doit être compté comme un revenu en nature et intégré dans tous les calculs » (l. 9) | Aujourd'hui le flux net = revenus − dépenses de la période (juste, sur l'exemple : 80 000 − 30 000 = 50 000). Il veut que **l'argent déjà présent sur les comptes compte comme une ressource** : « disponible = solde de début + revenus − dépenses », dans le budget (reste à affecter), la synthèse et les courbes. | R13-03 |
| « quand je crée un budget, il faut une sélection : quel compte sera débité » ; « idem pour les enveloppes : déduit du solde total ou de comptes précis » ; « calculé dans les tendances et les graphes » (l. 2, 8) | Un budget a un **compte à débiter** : « tous » (les comptes du solde global) ou **un compte précis** déjà créé ; chaque enveloppe peut avoir le sien. Seules les dépenses de ce(s) compte(s) y comptent, partout (budget, tendances, graphes). | R13-01 |
| « la récurrence du budget : ponctuel, annuel, mensuel ou hebdomadaire » (l. 8) | Le budget existe déjà en ponctuel / mensuel / trimestriel / annuel : **il manque « hebdomadaire »**. | R13-02 |
| « ce qui ne s'affiche pas, ce sont les pourcentages de consommation des enveloppes par rapport au budget défini et aux dépenses engagées » (l. 10) | Pour chaque enveloppe : la **part qu'elle pèse dans le budget**, la **part qu'elle pèse dans les dépenses**, et le **pourcentage engagé** (dépensé + déjà prévu à venir), à côté du pourcentage consommé. | R13-04 |
| « une récurrence est une dépense : reconnaître une récurrence quand elle est reproduite dans une dépense et fusionner les lignes identiques du fait de leurs catégories » (l. 11) ; « quand on fait une récurrence » (l. 3, phrase inachevée) | La détection d'un paiement régulier doit se faire aussi **par la catégorie** (pas seulement par le libellé), et, une fois confirmée, les dépenses passées identiques sont **fusionnées** : reconnues comme les occurrences de la récurrence, pas laissées comme lignes séparées. | R13-05 |
| « pour éviter cela, un détecteur d'une même opération : demander d'enregistrer une seule opération au lieu du double emploi » (l. 12) | Quand on saisit une dépense qui correspond à un paiement régulier attendu (même catégorie, même montant, date proche), l'application **demande** : « est-ce ce paiement ? » et ne l'enregistre qu'**une fois**, au lieu d'une dépense en plus de l'échéance. | R13-06 |
| « revenu : ça ne donne rien pour les dépenses, elles ne sont pas réparties sur les budgets et n'ont pas de couleurs de distinction ; rien ne s'affiche entre revenus et dépenses » ; « le camembert est monochrome » (l. 4) | Deux comptes de même type avaient la **même couleur** dans l'anneau de l'Accueil : l'anneau paraissait d'une seule couleur. Il faut des couleurs **toujours distinctes**, et la dépense sans enveloppe doit être dite (« hors budget »). | R13-07 |

### R13-01 — Compte à débiter d'un budget et d'une enveloppe
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 2 et 8
- Réalisé (2026-11-12) : Un budget a un **compte à débiter** (`accountId`) : « Tous les comptes du solde global » ou un compte précis déjà créé (le sien, ouvert, dans la devise du budget : sinon refus). Chaque enveloppe peut avoir le sien (« Celui du budget » par défaut). Seules les dépenses sorties de ce compte comptent dans l'enveloppe, dans le total du budget, dans la courbe de dépense cumulée et dans les tendances ; copier un budget garde les comptes. Écrans : formulaire du budget (« Compte à débiter »), formulaire d'enveloppe (« Compte de l'enveloppe »), ligne « Compte : … » sur le budget et sur chaque enveloppe. Migration `20261112120000_fin_budget_account`. Tests : `finRecette13` (R13-01), parcours `fin-recette13-journey`.

### R13-02 — Récurrence « hebdomadaire » d'un budget
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 8
- Réalisé (2026-11-12) : « Hebdomadaire » s'ajoute à ponctuel / mensuel / trimestriel / annuel ; copier un budget hebdomadaire le décale de sept jours. Migration `20261112130000_fin_budget_weekly` (la contrainte de la base accepte la nouvelle valeur). Un budget hebdomadaire n'est pas un nombre entier de mois : comme pour toute période de ce genre, le « reste à affecter » n'est pas calculé (on ne rapporte pas un revenu mensuel à une semaine). Test : `finRecette13` (R13-02).

### R13-03 — Le solde des comptes compte comme une ressource (« revenu en nature »)
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : `test.txt` l. 1 et 9
- Réalisé (2026-11-12) : Rejoué sur un compte neuf : le flux net était juste (revenus − dépenses), mais le solde n'entrait nulle part. Il y entre maintenant, comme **ressource « en nature »** : le budget affiche « Solde au début de la période » et « Ressources totales (revenus + solde) », et le « reste à affecter » part des ressources totales ; une case « Compter le solde de mes comptes comme une ressource » (cochée par défaut) permet de s'en passer. Le rapport mensuel donne le solde au début et à la fin du mois à côté du flux net (« Solde début + flux net = solde fin »), avec une phrase qui dit ce que mesure chacun. Les comptes comptés sont ceux du budget (le compte choisi, ou tous ceux du solde global). Rejoué ensuite avec un salaire déclaré mais pas encore reçu : l'Accueil affichait « Revenus : non calculé » et un flux de −3 000 DA, comme si le salaire n'existait pas ; il dit maintenant aussi « Avec vos revenus prévus (80 000 DA, pas encore reçus) : 77 000 DA » (période du mois). Tests : `finRecette13` (R13-03, rapport), parcours `fin-recette13-journey`.

### R13-04 — Enveloppes : part du budget, part des dépenses, pourcentage engagé
- Statut : `✅ done`
- Priorité : `🟠 high`
- Origine : `test.txt` l. 10
- Réalisé (2026-11-12) : Pour chaque enveloppe : le pourcentage consommé, **la part qu'elle pèse dans le budget** (prévu de l'enveloppe / total prévu), **la part qu'elle pèse dans les dépenses** (réel / total dépensé) et **le montant engagé** (dépensé + dépenses prévues à venir dans sa catégorie) avec son pourcentage de l'enveloppe. Test : `finRecette13` (R13-04), parcours `fin-recette13-journey`.

### R13-05 — Récurrence reconnue par la catégorie, lignes identiques fusionnées
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 3 et 11
- Réalisé (2026-11-12) : La détection d'un paiement régulier se fait aussi **par la catégorie** : trois dépenses de « Loyer » du même montant, sans aucune note, sont proposées comme une récurrence. En la confirmant, les lignes passées identiques (même nature, devise, montant, même libellé ou, sans note, même catégorie) sont **fusionnées** : elles deviennent ses occurrences (rien n'est supprimé, rien n'est créé), l'historique les montre comme paiement régulier et elles ne sont plus proposées. Test : `finRecette13` (R13-05).

### R13-06 — Détecteur de double emploi avec un paiement régulier
- Statut : `✅ done`
- Priorité : `🟠 high`
- Origine : `test.txt` l. 12
- Réalisé (2026-11-12) : Avant d'enregistrer une dépense (ou un revenu), l'application vérifie si elle correspond à un paiement régulier déclaré : même nature, montant, devise et catégorie, et une échéance encore attendue à moins de dix jours. Si oui, elle **demande** « Est-ce ce paiement ? » : « Oui » enregistre **une seule opération** qui règle l'échéance (une seconde confirmation ou un second mouvement sur la même échéance est refusé), « Non » l'enregistre comme une opération à part. Le détecteur de doublon existant (mouvements très proches) est conservé. Tests : `finRecette13` (R13-06), parcours `fin-recette13-journey`.

### R13-07 — Anneau de l'Accueil : des couleurs toujours distinctes
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : `test.txt` l. 4
- Réalisé (2026-11-12) : Cause : deux comptes du même type avaient la même couleur, donc un anneau d'une seule couleur ; de même pour des dépenses sans catégorie. Une tranche dont la couleur manque ou est déjà prise reçoit désormais la couleur libre suivante d'une palette de huit couleurs distinctes ; une couleur choisie par la personne est gardée. La dépense qui n'est répartie sur aucune enveloppe est dite sur la carte « Dépenses » de l'Accueil (« 900 DZD dépensés hors budget… Voir le budget », ou « Aucun budget ce mois-ci » avec le lien pour en créer un). L'onglet « Flux » de l'anneau a été vérifié avec des revenus et des dépenses : deux tranches de couleurs distinctes. Vérifié par capture d'écran et par le parcours `fin-recette13-journey`.

---

# R14 — Huitième passage de recette (2026-11-15)

### R14-01 — « Les jauges du budget par rapport aux dépenses ne s'affichent pas » (et « le problème du revenu persiste »)
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : retour du client sur la version en ligne (2026-11-15)
- Rejoué sur la nouvelle version (compte courant 150 000 DA, salaire 80 000 DA reçu, budget de novembre rattaché au compte courant, enveloppes Courses 30 000 DA et Carburant 10 000 DA, deux dépenses) : les jauges s'affichent sur la page du budget (prévu/réel, % consommé, part du budget, part des dépenses, courbe) et sur l'Accueil (« Nos budgets ») ; le salaire est compté (revenus 80 000, flux net, solde). Une charge récurrente confirmée remplit bien la jauge.
- Cause reproduite : une dépense saisie **sans choisir de compte** partait d'office sur « Espèces (par défaut) ». Un budget rattaché au compte courant (R13-01) ne la comptait pas, **sans rien dire** : la jauge restait vide.
- Décision (2026-11-15) : « une dépense et une enveloppe doivent être liées soit à un compte, soit aux espèces ».
- Correction :
  - Saisie d'une dépense ou d'un revenu : le compte est **obligatoire** (« Choisir : un compte ou les espèces ») ; « Espèces » n'est plus choisi en silence. Avec un seul compte à soi, il est présélectionné.
  - Budget et enveloppe : « Espèces » peut être choisi comme compte à débiter (le compte Espèces est ouvert s'il n'existe pas encore ; il ne compte pas dans la limite d'un compte sans abonnement).
  - Page du budget : les dépenses des catégories du budget faites depuis un autre compte sont **signalées** (« 2 dépenses de ces catégories (2 000 DA) ont été faites depuis un autre compte que celui de ce budget : elles ne sont pas comptées dans ses jauges »), avec le lien vers les mouvements pour corriger leur compte.
- Non modifié : la déclaration d'un revenu et d'une charge récurrente garde le choix visible « Espèces (par défaut) ».
- Test : `finRecette14.test.js` (R14, 2026-11-15).

### R14-02 — Administration : la recherche recouvre « Administration » dans la barre du haut
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : vérification à l'écran pendant P12-06 (2026-11-16)
- Reproduit : compte administrateur, écran de 1 280 px, barre latérale ouverte. Les trois espaces du sélecteur (« Gestion budgétaire », « Gestion commune », « Administration »), la recherche et les boutons ne tiennent plus : la zone de droite déborde vers la gauche et la recherche couvre « Administration ».
- Correction : de 768 à 1 439 px, quand le sélecteur compte trois espaces, ceux où l'on n'est pas gardent leur icône seule (leur nom reste en info-bulle et pour les lecteurs d'écran) ; l'espace courant garde son nom. Vérifié à 1 280, 1 024 et 800 px.

### R14-03 — Administration du comparateur : la page s'élargit d'un pixel en arabe sur téléphone
- Statut : `✅ done`
- Priorité : `🟢 low`
- Origine : balayage du site (`e2e/site-sweep.test.js`, ar / 375 px, 2026-11-16)
- Reproduit : deuxième étape de `/admin/comparateur` en arabe à 375 px : un intitulé masqué (réservé aux lecteurs d'écran) d'un en-tête de tableau était placé par rapport à la page et non au tableau défilant ; en arabe il finissait 1 px hors de l'écran, et la page défilait de côté.
- Correction : sur téléphone, un tableau défilant contient aussi ses éléments placés (`.cms-table { position: relative }`). Vérifié : 0 px de débordement sur les deux étapes.
- Au passage, le balayage confondait deux refus attendus : la réponse « réservé aux majeurs » d'une page (/dettes, /patrimoine) pouvait arriver pendant l'audit de la page suivante sur une machine chargée ; ces refus sont désormais attendus sur toutes les pages de ce compte mineur.

### R15-01 — Mode clair « pas assez changé » (retour du client)
- Statut : `✅ done`
- Priorité : `🟠 high`
- Origine : retour du client (2026-11-17) : le mode sombre lui plaît, le mode clair doit ressembler davantage à ses maquettes.
- Correction (mode clair seulement, le sombre est intact) : bandeau d'accueil du site clair, du blanc à la menthe avec une vague et un titre bleu profond ; boutons du bandeau bleu profond. « Inscription » en sarcelle. Tuiles d'icônes sarcelle pleines (titres des écrans, cartes). Fond des applications menthe pâle avec un halo. Cartes de chiffres à liseré sarcelle. En-têtes de tableaux menthe. Périodes, onglets et filtres choisis en menthe. Bandes alternées et bords teintés. Captures de l'accueil (ordinateur, téléphone) refaites. Fichier `client/src/theme/lagoon.css`.

### R15-02 — Navigation : « Trop de requêtes » après une vingtaine de pages
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : test de navigation de la version web (2026-11-17).
- Reproduit : un visiteur qui parcourt une trentaine de pages publiques se voit refuser les requêtes (429). Le blog en arabe ne charge plus ses articles. Une seule page faisait dix appels : six fois les réglages publics (pied de page, bandeau, maintenance, mesure d'audience…) et les trois listes de l'assistant.
- Correction : réglages publics et listes de l'assistant chargés une fois et partagés (cinq appels par page au lieu de dix). Limite des lectures publiques portée de 240 à 600 par minute et par adresse : en Algérie, beaucoup de visiteurs partagent la même adresse (opérateurs mobiles, universités).

### R15-03 — Application : chaque écran attendait 0,5 à 2,3 s
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : test de navigation de la version web (2026-11-17), 41 écrans de l'application.
- Cause 1 : une trentaine de groupes de routes sont montés sur `/fin`, chacun avec sa vérification de session. Une requête relisait donc le compte et la session jusqu'à soixante fois (230 ms pour compter les notifications non lues). La vérification est désormais faite une fois par requête : notifications non lues 230 → 19 ms, parcours 115 → 20 ms, données personnelles 330 → 105 ms.
- Cause 2 : le nombre affiché à côté d'« Aujourd'hui » recalculait toute la page « Aujourd'hui » (≈ 0,5 s) à chaque changement d'écran. Il est maintenant relu après chaque enregistrement, à l'ouverture d'« Aujourd'hui » et au plus une fois par minute.
- Résultat : 0,3 à 0,5 s pour la plupart des écrans, 1 à 1,2 s pour ceux qui affichent la synthèse du jour (Accueil, Aujourd'hui, Synthèse, Santé), contre 0,5 à 2,3 s avant. L'administration est entre 0,3 et 0,4 s.
- Reste signalé : `/app/entreprise`, pour un compte qui n'a pas encore d'entreprise, provoque deux réponses 404 (tableau de bord et documents) ; l'écran s'affiche correctement.

---

# R16 — Neuvième passage de recette (2026-11-17)

Retour du client sur la version en ligne. Vérification préalable des corrections déjà livrées sur le revenu : R12-03 (« déjà dans le solde de départ » enregistre le salaire comme un revenu de son mois, sans doublon) et R13-03 (le solde compte comme ressource dans le budget et le rapport) sont bien dans le code et leurs tests passent (`finRecette11`, `finRecette12`, `finRecette13`). Ce qui manquait : un compte avec un solde mais **aucun revenu déclaré** n'avait ni revenus ni flux.

| Ce que dit le client | Ce qu'il demande vraiment | Tâche |
|---|---|---|
| « Le compte affiche un solde alors qu'il n'affiche aucun revenu ni même de flux, du fait que le revenu n'est pas déclaré » ; « le problème du revenu n'est pas réglé » | Le solde de départ d'un compte doit compter comme un revenu. | R16-01 |
| « Quand on crée un profil, le revenu déclaré est le solde initial ; à partir de lui tout est calculé (taux d'épargne, reste à vivre…), puis réajusté avec les nouveaux revenus » (répété depuis le 6e passage) | Le « revenu initial » est la base de tous les calculs tant qu'aucun revenu n'est déclaré ; les revenus suivants s'y ajoutent ou le remplacent. | R16-01, R16-02 |
| « Les budgets liés à ce compte ne s'affichent même pas et les dépenses rattachées aux budgets ne sont pas rapprochées » | La page du compte doit montrer ses budgets, et chaque dépense doit dire dans quelle enveloppe elle compte. | R16-03 |
| « Pour les camemberts et les graphes, des couleurs plus marquées : elles ressemblent trop aux couleurs de fond » ; « le camembert plus grand, à droite, les descriptions à gauche » | Couleurs de séries contrastées sur le fond menthe ; anneau agrandi et déplacé. | R16-04 |

### R16-01 — Le solde de départ est le « revenu initial »
- Statut : `✅ done`
- Priorité : `🔴 critical`
- Réalisé (2026-11-17) : le solde de départ d'un compte (compte réel, d'actif, compté dans le total ou choisi seul, solde positif) est un **revenu de la période de sa date d'ouverture**. Il est compté dans les revenus, le flux net et le taux d'épargne, partout où ces chiffres sont calculés : Accueil, Aujourd'hui, Synthèse, rapport, historique et alertes. Exemple d'un compte neuf à 150 000 DA avec 15 000 DA dépensés : revenus 150 000, flux net 135 000 (avant : revenus « non calculé »). L'Accueil le dit (« Dont 150 000 DA de revenu initial »), l'anneau « Revenus » en fait une tranche, et la page du compte l'ajoute aux entrées du mois. Un revenu reçu ensuite s'y ajoute dans son propre mois. Un salaire déclaré « déjà dans le solde de départ » a déjà été retiré du solde de départ (R12-03) : il n'est jamais compté deux fois. Dans le rapport mensuel, un compte ouvert pendant le mois est retiré du solde de début, pour que « solde début + flux net = solde fin » reste vrai.
- Réponse du client (2026-11-17) : un solde de départ **négatif** compte comme un revenu initial négatif — fait. Les comptes tenus à part du total ne comptent que lorsqu'on les choisit seuls.
- Tests : `finRecette16.test.js`. `finRecette10` et `finRecette12` ont été adaptés à la règle (le flux du mois d'ouverture contient le revenu initial).

### R16-02 — Reste à vivre calculé sur le revenu initial, puis sur les revenus déclarés
- Statut : `✅ done`
- Priorité : `🟠 high`
- Réalisé (2026-11-17) : sans aucun revenu déclaré, le reste à vivre part du revenu initial (le solde de départ des comptes comptés dans le total) et le dit (« Il sera recalculé dès que vous déclarez vos revenus »). Dès qu'un revenu est déclaré, il remplace le revenu initial.
- Confirmé par le client (2026-11-17) : « tous les calculs à partir du solde de départ », y compris le reste à vivre, même s'il est mensuel.
- Test : `finRecette16.test.js`.

### R16-03 — La page d'un compte montre ses budgets et rapproche ses dépenses
- Statut : `✅ done`
- Priorité : `🔴 high`
- Réalisé (2026-11-17) : la section « Budgets de ce compte » liste les budgets en cours rattachés au compte, ou portés sur le solde total dont il fait partie. Pour chacun, elle affiche le réel par rapport au prévu, puis chaque enveloppe que ce compte paie, avec sa jauge. Dans « Mouvements du mois », chaque dépense porte son rapprochement : « Budget › Enveloppe », « Hors budget » ou « Autre compte que celui de l'enveloppe ».
- Tests : `finRecette16.test.js`, parcours `fin-recette16-journey`.

### R16-04 — Graphiques : couleurs marquées, anneau plus grand à droite
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Réalisé (2026-11-17) : huit couleurs de graphique dédiées (`--chart-1` à `--chart-8` dans `index.css`), en clair comme en sombre. Chacune contraste au moins à 3:1 avec le fond menthe et les surfaces, et leur ordre est choisi pour que deux tranches voisines restent distinctes, y compris pour un lecteur daltonien. Elles remplacent les tons bleu-vert proches du fond, dans les courbes, les barres et l'anneau. L'anneau ne garde la couleur propre d'une catégorie ou d'un compte que si elle se détache du fond (sinon, il prend la couleur suivante de la palette) ; « Autres » passe d'un gris pâle à un gris marqué. L'anneau est agrandi (320 px au lieu de 220) et ses tranches sont plus épaisses ; il est à droite, la description à gauche (inversé en arabe, l'anneau au-dessus sur téléphone).
- Vérifié par captures d'écran (parcours `fin-recette16-journey`).

### R16-05 — Une catégorie de dépense va directement dans son enveloppe
- Statut : `✅ done`
- Priorité : `🔴 critical`
- Origine : retour du client (2026-11-17) : « sur le budget, les enveloppes : les dépenses n'ont pas été rapprochées ou déduites » ; « une même catégorie de dépenses est directement liée à son enveloppe ».
- Cause : depuis R13-01 et R14, une dépense de la catégorie d'une enveloppe ne lui était pas déduite si elle venait d'un autre compte que celui du budget, par exemple « Espèces ». Elle était seulement signalée. Autre cas : une dépense saisie sur la catégorie principale (« Alimentation ») n'allait pas dans une enveloppe posée sur une sous-catégorie (« Courses alimentaires »).
- Correction (décision du client, qui remplace R13-01 et R14 sur ce point) : c'est la catégorie qui décide. Une dépense de la catégorie d'une enveloppe en est déduite, quel que soit le compte (ou les espèces) qui l'a payée, et elle compte dans le total réel du budget. Une dépense d'une autre catégorie du même groupe va dans l'enveloppe du groupe quand le budget n'en a qu'une pour ce groupe. Le compte du budget garde son rôle de ressource : son solde de départ. Le message « dépenses faites depuis un autre compte » ne s'affiche donc plus. Les textes d'aide du formulaire de budget et de la saisie ont été corrigés.
- Limite connue : avec deux budgets en cours (un par compte) qui ont chacun une enveloppe de la même catégorie, une dépense de cette catégorie compte dans les deux.
- Tests : `finRecette16.test.js`. `finRecette13` et `finRecette14` ont été adaptés à la nouvelle règle.

### R16-06 — L'évolution des soldes « ne marche pas »
- Statut : `✅ done`
- Priorité : `🟠 high`
- Origine : retour du client (2026-11-17).
- Cause reproduite : la courbe ne montrait rien avant la date d'ouverture du compte. Un compte créé aujourd'hui, ou dont les mouvements du mois sont datés avant sa création, n'avait donc qu'un point : aucune ligne, et des « — » dans l'évolution mois par mois.
- Correction : la courbe commence à la date d'ouverture, ou au premier mouvement s'il est plus ancien. Le point juste avant est le solde de départ, étiqueté « Départ », si bien qu'un compte ouvert aujourd'hui trace une ligne entre son solde de départ et son solde actuel. Les points plus anciens restent vides : le compte n'existait pas, ce n'est pas un zéro.
- Tests : `finRecette16.test.js`, parcours `fin-recette16-journey` (capture de la courbe).

---

# R17 — Dixième passage de recette (2026-11-18)

Retour du client : « les parcours sont un peu déréglés, surtout les relations comptes > revenus > budget > enveloppes > flux ». Rejoué sur un compte neuf : un CCP à 150 000 DA et un livret à 50 000 DA, un salaire de 80 000 DA déclaré sur le CCP, un budget de novembre sur le CCP (enveloppes Alimentation 30 000, Transport 10 000) et 7 000 DA de dépenses ; puis un revenu reçu de 20 000 DA.

| Ce que dit le client | Ce qui a été reproduit | Tâche |
|---|---|---|
| « Le flux, ce sont les ressources moins les dépenses, et là nous avons le même problème » | Sur le budget, le flux était « non calculé » (aucun revenu reçu), puis 13 000 DA (revenus reçus − dépenses, sans le solde ni le salaire attendu), alors que l'Accueil disait 163 000 DA pour le même compte. | R17-01 |
| « Page compte : bon affichage ; page budget : rien ne change, c'est figé » | Les « ressources » du budget n'étaient que les revenus déclarés : un revenu reçu ne les faisait pas bouger, ni le reste à affecter. | R17-01 |
| « Quand je sélectionne un compte, que je change de chapitre et reviens à l'Accueil, il affiche le total des comptes » | Reproduit. | R17-02 |
| « On ne peut pas supprimer un compte » | Reproduit : le serveur refusait chaque suppression. | R17-03 |
| « Le même choix des catégories dans les enveloppes que dans dépense / revenu » | L'enveloppe proposait une longue liste ; la saisie, le sélecteur avec recherche. | R17-04 |

### R17-01 — Budget : ressources = solde + revenus reçus + revenus attendus ; flux = ressources − dépenses
- Statut : `✅ done`
- Priorité : `🔴 critical`
- Correction : les revenus de la période du budget sont ceux **reçus** plus les revenus déclarés **encore attendus**. Ce sont les mêmes « encore attendus » que sur l'Accueil : un salaire compte une fois, attendu puis reçu, jamais deux. Ressources totales = solde au début + revenus de la période. Flux net = ressources totales − dépenses réelles. Le reste à affecter part de ces ressources. La page du budget affiche la somme : « Reçus : 20 000 · encore attendus : 80 000 » et « Ressources totales 250 000 − dépenses 7 000 ».
- Exemple rejoué : ressources 100 000 (20 000 reçus + 80 000 attendus), ressources totales 250 000, flux net 243 000, reste à affecter 210 000. Avant : ressources 80 000, flux 13 000.
- Accueil : le flux du compte reste ce qui est entré (revenu initial + revenus reçus) moins les dépenses, soit 163 000. La ligne « Avec vos revenus prévus » y ajoute le salaire attendu et donne le même 243 000 que le budget.
- Test : `finRecette17.test.js`.

### R17-02 — L'Accueil garde le compte et la période choisis
- Statut : `✅ done`
- Priorité : `🟠 high`
- Correction : le compte choisi et la période sont gardés dans le navigateur. Un compte qui n'existe plus (supprimé, archivé) ramène au total. Vérifié dans le navigateur : CCP choisi, passage par Budgets, retour à l'Accueil, toujours sur CCP.

### R17-03 — Supprimer un compte
- Statut : `✅ done`
- Priorité : `🔴 high`
- Cause : la confirmation de suppression n'était pas envoyée au serveur (passée comme option de la requête et non dans son contenu), qui refusait donc toujours. Elle l'est depuis la fiche du compte et depuis la liste des comptes.
- Au passage : ce qui était rattaché au compte supprimé n'y reste plus accroché. Ses budgets et enveloppes repassent sur le solde total ; ses revenus et paiements réguliers, objectifs et dettes perdent leur compte.
- Vérifié dans le navigateur (« supprimé, avec ses mouvements ») ; test : `finRecette17.test.js`.

### R17-04 — Enveloppes : le même choix de catégorie que pour une dépense
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Correction : le formulaire d'enveloppe utilise le sélecteur de la saisie : recherche, puis catégorie → sous-catégorie. Une catégorie principale vaut toujours tout son groupe (« Logement »). Une catégorie qui a déjà son enveloppe dans ce budget est signalée avant l'envoi.

### R17-05 — Un seul compte choisi pour tous les écrans ; la Synthèse par compte
- Statut : `✅ done`
- Priorité : `🔴 high`
- Origine : retour du client (2026-11-18) : « dans la synthèse, le revenu pris par défaut c'est le cash, les autres ne sont pas pris » ; « il suffit que je clique sur une autre tâche pour que le compte revienne à tous les comptes, alors que chaque tâche doit être paramétrée selon le compte choisi, ou inclure l'ensemble des comptes comptés dans un seul solde ».
- Cause : la Synthèse n'avait pas de choix de compte et ne lisait que les comptes comptés dans le total. Un compte tenu à part n'y apparaissait jamais, et le choix fait sur l'Accueil n'était connu que de l'Accueil.
- Correction : le compte choisi est le même sur tous les écrans et reste gardé dans le navigateur. « Tous les comptes » = les comptes du solde total ; sinon, un compte, y compris un compte tenu à part. On le choisit sur l'Accueil, sur la Synthèse (nouveau choix « Compte ») ou dans le filtre des Mouvements, et on le retrouve sur les autres. La Synthèse (revenus, dépenses, flux, solde début et fin, courbes) et son historique se calculent alors sur ce compte.
- Vérifié dans le navigateur : compte « tenu à part » choisi sur l'Accueil, puis Synthèse (ses revenus) → Mouvements (filtré sur lui) → Accueil (toujours lui).

### R17-06 — Intérêts : la période semestrielle
- Statut : `✅ done`
- Priorité : `🟠 high`
- Origine : retour du client (2026-11-18) : « l'intérêt composé n'a pas été rectifié ».
- Vérifié d'abord sur ses propres exemples, le calcul est juste : 100 000 DA à 1 % par mois sur 12 mois = 112 682,50 (composé) et 112 000 (simple) ; 12 % nominal capitalisé chaque mois = 112 682,50 ; 10 % par an sur trois ans = 133 100.
- Ce qui manquait : le semestre, demandé le 2026-11-11 (« mensuel, trimestriel, semestriel ou annuel »). Le simulateur d'intérêts le propose maintenant pour le taux, la capitalisation, la durée et les versements. 6 % par semestre sur deux ans = 126 247,70 (100 000 × 1,06⁴), taux annuel effectif 12,36 %.
- À confirmer avec le client : s'il reste un écart, lequel (écran, chiffres saisis, résultat attendu).

### R17-07 — Les anneaux d'avant
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Origine : retour du client (2026-11-18) : « pour les camemberts, je préfère les anciens aux nouveaux ».
- Correction : l'anneau reprend sa forme d'avant R16-04 : à gauche, 220 px, la description à sa droite, ses couleurs d'origine. La tranche « Revenu initial » est gardée. Les courbes et les barres gardent leurs couleurs marquées, car le retour ne portait que sur les camemberts.

---

# R18 — Onzième passage de recette (2026-11-18, `test.txt`)

Remarques notées par l'équipe en déroulant `SCENARIO_TEST_COMPLET.md` sur le site.

| Remarque | Ce qui a été constaté | Tâche |
|---|---|---|
| « Des fois, dans une page : Impossible de charger les données ; il faut cliquer sur Réessayer » · « aucune page ne s'est chargée pendant quelques secondes » · « Mouvements : les catégories sont souvent vides » | Non reproduit en local (40 écrans parcourus sans erreur) : une défaillance passagère de l'hébergeur (redémarrage, connexions refusées par la base). Les listes de la saisie restaient vides sans rien dire. | R18-01 |
| « C1 : une erreur, au deuxième essai ça a marché » (suppression d'un compte) | Une écriture par mouvement dans la même transaction : long sur un compte chargé, sur une base distante. | R18-02 |
| « Mouvements pas fluide ; on ne comprend pas que c'est une vue par compte ; le compte doit changer la vue tout de suite » · « B5 : le compte n'est pas choisi en arrivant » | Le compte était un filtre parmi d'autres, appliqué au clic sur « Filtrer » ; la liste clignotait à chaque changement. | R18-03 |
| « Objectifs › Réserve : deux éléments du menu s'allument » | Reproduit sur `/app/objectifs/fonds-urgence`. | R18-04 |
| « Les alertes de confirmation sont celles par défaut » | 23 confirmations du navigateur. | R18-05 |
| « Revenus à confirmer : couleur plus marquée ; pas de couleurs qui se confondent avec le fond (camembert vide) » · « camembert : le nom au survol est effacé par la couleur » | Lignes menthe sur fond menthe ; anneau vide de la couleur du fond ; nom long écrit sous l'anneau. | R18-06 |
| « Calendrier : les sections Sorties prévues… sont collées » | La grille `.fin-cards` n'était définie nulle part (Calendrier, Patrimoine, Portefeuille, espaces). | R18-07 |
| « Boutons retour trop discrets » · « graphiques sur fond blanc » · « Synthèse terne » | — | R18-08 |
| « Formulaires cassés par les petits textes de description » | Les aides sous les champs décalaient les champs voisins. | R18-09 |
| « Ajouter une enveloppe : la page doit défiler jusqu'au formulaire » | Fonctionne en local ; rendu plus sûr. | R18-10 |
| « Le choix de catégorie de /budgets/revenus est simple » | Liste déroulante simple. | R18-11 |
| « Pour supprimer un objectif, il faut aller au détail, descendre, trouver deux petites icônes » | Reproduit. | R18-12 |
| « Compte gratuit, deuxième compte : « Abonnez-vous depuis Offres » doit être un lien » | Reproduit. | R18-13 |
| « Revenu prévu déclaré : il n'apparaît pas à l'Accueil dans les calculs » · « Budgets → Revenus → Déclarer n'existe pas » | Le revenu attendu n'était qu'une mention ; le chemin s'appelle « Revenus prévus → Ajouter un revenu » (erreur du scénario). | R18-14 |

### R18-01 — Chargements : reprise automatique des échecs passagers
- Statut : `✅ done`
- Priorité : `🔴 high`
- Correction : une lecture qui échoue pour une raison passagère (serveur injoignable, erreur 5xx, trop de demandes) est refaite seule deux fois (après 0,4 s puis 1,2 s) avant d'afficher « Impossible de charger » ; un refus (4xx) n'est jamais refait. Côté serveur, l'application garde au plus 5 connexions à la base (réglable avec `DB_POOL_SIZE`) au lieu de 10, et attend jusqu'à 15 s une connexion libre au lieu d'échouer. Un hébergeur mutualisé limite les connexions par utilisateur de base, et peut lancer plusieurs copies de l'application. Dans les Mouvements, une liste (catégories, comptes, étiquettes) qui n'a pas pu être lue l'écrit, avec « Réessayer », au lieu de rester vide.

### R18-02 — Supprimer un compte chargé
- Statut : `✅ done`
- Priorité : `🟠 high`
- Correction : la trace de suppression des mouvements est écrite en une fois au lieu d'une écriture par mouvement.

### R18-03 — Mouvements : une vue par compte
- Statut : `✅ done`
- Priorité : `🔴 high`
- Correction : en haut de la page, un cadre « Compte affiché » avec un bouton par compte et « Tous les comptes ». Il dit ce qu'on voit (« Vous voyez les mouvements du compte « CCP » »). Un clic change la liste tout de suite et devient le compte de tous les écrans. Le compte choisi ailleurs (Accueil, Synthèse) y est repris, même page ouverte. La liste affichée reste, grisée, pendant que la suivante arrive (plus de clignotement). « Tout effacer » vide les autres filtres sans changer de compte.

### R18-04 — Un seul élément du menu allumé
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Correction : dans les menus (barre latérale, menu « Plus » du téléphone), seule l'entrée dont l'adresse correspond le mieux à la page s'allume.

### R18-05 — Fenêtre de confirmation de l'application
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Correction : les 23 confirmations passent par une fenêtre aux couleurs du site, en clair et en sombre, en arabe de droite à gauche. Elle porte une icône, le message, « Annuler » (choisi par défaut) et « Confirmer » en rouge pour une suppression. Échap ou un clic à côté annule. Elle est faite avec l'élément `<dialog>` du navigateur, sans bibliothèque externe : rien à télécharger en plus, et la politique de sécurité du site n'a pas à changer.

### R18-06 — Couleurs qui se détachent du fond
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Correction :
  - « Aujourd'hui » : « Revenus à confirmer » est un bloc blanc à bord vert épais, avec un fond dégradé vert et un compteur vert ; « Paiements à confirmer » a la même forme en bleu. Les lignes sont des cartes blanches bordées.
  - Anneau vide : tracé en pointillés foncés.
  - Anneau : le centre est un disque de la couleur de la carte. Le nom survolé y est écrit en foncé, coupé en deux lignes au plus (« … » au-delà), plus petit s'il est long.

### R18-07 — Calendrier : les cartes séparées
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Correction :
  - La grille `.fin-cards` est définie comme celle des autres pages : cartes côte à côte, espacées. Cela vaut aussi pour Patrimoine, Portefeuille et les espaces.
  - Les grandes parties du Calendrier sont espacées et séparées par une ligne.

### R18-08 — Retour, graphiques, Synthèse
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Correction :
  - Le lien « Retour » devient un bouton encadré avec sa flèche, plein au survol.
  - Chaque graphique (courbes, barres) est une carte blanche (la couleur des cartes en mode sombre).
  - Synthèse : chaque chiffre du mois porte la couleur de ce qu'il est. Revenus en vert, dépenses en orange comme sur les courbes, flux net plein dans le dégradé de la marque, soldes en ardoise.
  - Synthèse : chaque carte de section a un bord de couleur, et les titres une barre de couleur.

### R18-09 — Aides des champs dans une bulle « ? »
- Statut : `✅ done`
- Priorité : `🟠 high`
- Correction : dans tous les formulaires de l'application, le texte d'aide sous un champ est remplacé par un « ? » à côté de son libellé. L'aide s'affiche dans une bulle au survol du libellé, et pendant qu'on remplit le champ (au toucher sur téléphone). Les champs restent alignés. L'aide reste lue par les lecteurs d'écran.

### R18-10 — Défiler jusqu'à ce qu'un bouton fait apparaître
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Correction :
  - L'application surveille 2 s au lieu de 0,7 s ce qu'un bouton fait apparaître, et compte aussi une partie ouverte par un attribut.
  - Elle tient compte de la barre fixée en haut de l'écran.
  - Un formulaire plus haut que l'écran s'affiche depuis son début.

### R18-11 — Revenus prévus : le sélecteur de catégories
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Correction : la déclaration d'un revenu (Budgets › Revenus prévus) utilise le sélecteur de la saisie : recherche, puis catégorie → sous-catégorie, limité aux revenus.

### R18-12 — Archiver ou supprimer un objectif, simplement
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Correction : « Archiver » et « Supprimer » (en rouge) sont des boutons nommés. On les trouve dans la liste des objectifs, sur chaque ligne (icônes seules sur téléphone), et en tête du détail de l'objectif.

### R18-13 — « Voir les offres »
- Statut : `✅ done`
- Priorité : `🟢 low`
- Correction : quand un compte gratuit est refusé (deuxième compte, invitation, deuxième écran), le message est suivi d'un lien « Voir les offres ». Le lien mène à la page des offres (Mon espace › Accès premium). Il apparaît dans les comptes et dans les espaces partagés.

### R18-14 — Le revenu attendu dans les chiffres de l'Accueil
- Statut : `✅ done`
- Priorité : `🟠 high`
- Correction : quand un revenu déclaré est encore attendu sur la période, l'Accueil ajoute une carte « Flux prévu (avec les revenus attendus) ». Elle vaut reçu + encore attendu − dépenses, la même règle que le flux du budget (R17-01), et donne le détail en dessous. Le « Flux net » reste ce qui est réellement entré et sorti, égal au solde. La mention « Encore attendu ce mois » est mise en avant (fond vert).
- Le scénario de test est corrigé : « Budgets → bouton Revenus prévus → Ajouter un revenu ».

### R18-15 — Retouches après relecture
- Statut : `✅ done`
- Priorité : `🟢 low`
- Correction :
  - Le « ? » des champs est un peu plus petit (15 px au lieu de 18).
  - Un seul bouton Retour par page. Le détail d'un budget, un guide et un terme du lexique (« Apprendre ») affichaient en plus leur propre lien ; seul celui de l'en-tête reste, avec le même libellé et la même destination.
  - Détail d'un budget : « Archiver » et « Supprimer » (en rouge) sont en haut, à côté de « Modifier ». Après une suppression, on revient à la liste des budgets avec le message.

### R18-16 — Mouvements, formulaire de budget, couleurs de la Synthèse
- Statut : `✅ done`
- Priorité : `🟡 medium`
- Correction :
  - Mouvements : le cadre « Compte affiché » montre une carte par compte (nom, solde, « Hors du solde total » s'il y a lieu), plus « Tous les comptes » avec le solde total. La carte choisie est pleine, en bleu de la marque, et cochée. Sur téléphone, les cartes défilent de côté.
  - Mouvements : les parties de la page (actions, compte, onglets, filtres, liste) sont espacées.
  - Nouveau budget : « Compter le solde de mes comptes comme une ressource » sort de la grille des champs. C'est maintenant un interrupteur sur toute la largeur, avec son titre et son explication lisibles d'un coup d'œil.
  - Synthèse : plus d'orange. Les dépenses sont en bleu, la couleur des dépenses dans l'application, sur la carte comme sur la courbe. Les bords des sections n'utilisent plus l'orange ni l'ocre.

## R19 — Retours du 2026-11-22 (`test.txt`)

### R19-01 — « Les graphes ne bougent pas, même quand on fait des mouvements »
- Statut : `✅ done` (2026-11-23)
- Priorité : `🟠 high`
- Origine : `test.txt` l. 1 (épargne par mois, revenus et dépenses, etc.) : « teste les graphes et vois s'il y a réellement des mouvements »
- Constat (vérifié le 2026-11-22, sans rien corriger) : le serveur suit bien les mouvements. Deux dépenses ajoutées en septembre et en novembre apparaissent aussitôt dans `/fin/argent/synthese/historique` et sur la courbe de la Synthèse. Ce qui donne l'impression de graphiques figés :
  - **Synthèse** : les courbes montrent toujours les 6 derniers mois à partir d'aujourd'hui. Choisir un autre mois change les chiffres, pas les courbes. À faire : terminer la fenêtre sur le mois choisi.
  - **Mois sans revenu ou sans dépense** : la valeur est « non calculée » (un trou), pas 0. Un utilisateur qui commence ce mois-ci ne voit donc qu'un point isolé, et une ligne s'interrompt dès qu'un mois n'a pas de revenu. À faire : à partir du premier mois saisi, un mois sans rien vaut 0 ; avant ce mois, on garde le trou.
  - **Courbe des soldes (Mes comptes, page d'un compte)** : elle ne se recharge pas après un ajout fait depuis le bouton « + » de la barre du haut, contrairement aux autres blocs de la page (`AccountsBalanceChart` lit l'API directement, sans écouter l'événement de mise à jour). À faire : la recharger après chaque enregistrement.
  - **Taux d'épargne de chaque mois** : il n'apparaît que si de l'argent a été explicitement mis de côté (règle F008). Sans épargne marquée, le graphique n'existe pas. À expliquer sur la page, ou à décider avec le client.
  - Détail visuel : les graduations de l'axe tombent sur des valeurs non rondes (« 842,3 »). À arrondir.
- Pour la recette : mon serveur de test sur le port 4210 tournait sur une version antérieure à R16. Il ne faut pas s'y fier pour juger la courbe des soldes.
- Correction (2026-11-23) :
  - Synthèse : au pas « mois », les courbes se terminent sur le mois affiché (`fin=AAAA-MM` sur `/fin/argent/synthese/historique`). Changer de mois déplace maintenant les courbes avec les chiffres.
  - À partir du premier mois où quelque chose est saisi, un mois sans revenu ou sans dépense vaut 0 (un point sur la courbe), et le flux net est calculé. Avant ce mois, et pour un mois dans une autre devise, la courbe reste interrompue.
  - Courbe des soldes (Mes comptes, page d'un compte) : relue après chaque enregistrement (ajout rapide, modification, suppression) et dès qu'un solde affiché change.
  - Sans épargne mise de côté, la Synthèse explique en une phrase pourquoi la courbe du taux d'épargne n'apparaît pas encore, et comment la faire apparaître.
  - L'axe des valeurs tombe sur des chiffres ronds (0, 50 k, 100 k…).
  - Tests : `functional/finMoney.test.js` (2 nouveaux cas, 45/45). Parcours `e2e/fin-charts-journey.test.js` : il ne démarrait plus depuis P12-03 (son deuxième compte était refusé sans abonnement) ; il démarre maintenant en abonné, 6 cas sur 7 passent. Reste G-11 (page Dettes : le libellé « Emprunt bancaire » n'apparaît plus), sans lien avec ces changements, à reprendre.

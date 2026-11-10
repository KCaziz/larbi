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
| R10 — Quatrième passage (2026-11-10) | 12 | 12 |
| **Total** | **93** | **92** |

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

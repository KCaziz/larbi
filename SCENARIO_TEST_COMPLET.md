# Scénario de test complet — FINCLUDIA (2026-11-18)

À dérouler dans l'ordre, sur le site en ligne, avec un **compte neuf et abonné** (sans abonnement, un seul compte bancaire et un seul écran connecté à la fois). Chaque étape dit quoi faire et ce qu'on doit voir.

⭐ = point sur lequel le client insiste depuis plusieurs passages : à vérifier en priorité.

---

## A. Comptes, revenus, budget, enveloppes, flux ⭐

### A1. Le solde de départ compte comme revenu initial ⭐
1. **Mes comptes → Ajouter** : « Courant », compte courant, solde de départ **150 000 DA**, date du jour. Ne déclare aucun revenu.
2. **Accueil** (« Tous les comptes ») :
   - Revenus = **150 000**, avec la mention « Dont 150 000 DA de revenu initial ».
   - Flux net = **150 000**.
   - Solde = **150 000**.
   - Dans l'anneau, onglet **Revenus** : une tranche « Revenu initial ».
3. **Page du compte Courant** : entrées du mois = 150 000 ; la courbe du solde part de « Départ ».

### A2. Un salaire déclaré, pas encore reçu ⭐
1. **Budgets → bouton « Revenus prévus » → Ajouter un revenu** : « Salaire », **80 000 DA par mois**, à partir du 1er du mois, sur **Courant**. Ne coche pas « déjà reçu ». La catégorie se choisit avec le même sélecteur que pour une dépense (recherche, puis catégorie → sous-catégorie).
2. **Accueil** (période **Mois**) :
   - Revenus = **150 000** (le salaire n'est pas encore arrivé).
   - La mention, sur fond vert, « **Encore attendu ce mois : 80 000** » avec le lien « Confirmer à réception ».
   - ⭐ Une carte **« Flux prévu (avec les revenus attendus) » = 230 000**, avec « Reçu 150 000 + encore attendu 80 000 − dépenses 0 ».

### A3. Un budget et ses enveloppes
1. **Budgets → Nouveau** : « Novembre », du 1er au dernier jour du mois, rattaché à **Courant**.
2. Dans le budget, **Ajouter une enveloppe** :
   - ⭐ Le choix de la catégorie est **le même que pour une dépense** : une recherche, puis catégorie → sous-catégorie.
   - Tape « courses » et choisis **Courses alimentaires**, montant **40 000**, puis enregistre.
   - Ajoute une deuxième enveloppe : **Transport public**, **10 000**.
   - Choisis à nouveau « Courses alimentaires » : le message « Ce budget a déjà une enveloppe pour cette catégorie » s'affiche.
3. **Page du budget** ⭐ :

   | Chiffre | Attendu |
   |---|---|
   | Revenus de la période (reçus + attendus) | **80 000** (« Reçus : 0 · encore attendus : 80 000 ») |
   | Solde au début de la période | **150 000** |
   | Ressources totales | **230 000** |
   | Total prévu | 50 000 |
   | Reste à affecter | **180 000** |

### A4. Les dépenses vont dans leur enveloppe ⭐
Saisis ces quatre dépenses (**Ajouter un mouvement**). Le compte est obligatoire.

| Montant | Catégorie | Compte |
|---|---|---|
| 12 000 | Courses alimentaires | Courant |
| 5 000 | Courses alimentaires | Espèces |
| 3 000 | Alimentation (la catégorie principale) | Courant |
| 2 000 | Transport public | Courant |

**Page du budget** :
- Enveloppe Courses = **20 000 / 40 000**. La dépense en espèces et celle sur la catégorie principale y sont bien comptées.
- Enveloppe Transport = **2 000 / 10 000**.
- Total réel = **22 000**.
- ⭐ **Flux net = 208 000**, avec la phrase « Ressources totales 230 000 − dépenses 22 000 ». C'est la règle du client : **le flux, ce sont les ressources moins les dépenses**.

**Accueil** (« Tous les comptes ») :
- Dépenses = **22 000**, Revenus = **150 000**.
- Flux net = **128 000**, et Solde = **128 000** (Courant 133 000 + Espèces −5 000). Le flux et le solde sont égaux.
- ⭐ Flux prévu = **208 000** (150 000 + 80 000 − 22 000) : le même chiffre que le flux du budget.

**Page du compte Courant** :
- Section « Budgets de ce compte » : Novembre et sa jauge.
- Chaque dépense porte « Novembre › Courses alimentaires » (ou « › Transport public »).

### A5. Le salaire reçu ne compte qu'une fois ⭐
1. **Accueil → Confirmer à réception** (ou **Aujourd'hui**) : confirme le salaire de 80 000 sur Courant.
2. **Accueil** : Revenus = **230 000**, Flux net = **208 000**. La mention « encore attendu » et la carte « Flux prévu » disparaissent (plus rien n'est attendu).
3. **Page du budget** :
   - « Reçus : 80 000 · encore attendus : 0 ».
   - Ressources totales **toujours 230 000** : le salaire n'est pas compté deux fois.
   - Flux net = **208 000**.

### A6. Un revenu non déclaré fait bouger le budget ⭐ (« le budget est figé »)
1. Saisis un **revenu** de **20 000** (prime) sur Courant, sans le déclarer.
2. **Page du budget** : revenus de la période **100 000**, ressources totales **250 000**, flux **228 000**, reste à affecter **200 000**.
3. **Accueil** : Revenus = **250 000**, Flux net = **228 000**.

### A7. Reste à vivre et fonds d'urgence
**Objectifs → Fonds d'urgence** : le reste à vivre part maintenant des **80 000 déclarés**, et non plus du revenu initial.

---

## B. Le compte choisi suit sur tous les écrans ⭐

1. **Mes comptes → Ajouter** : « Épargne », solde de départ **30 000**, et **décoche** « Compter dans le solde total ».
2. **Accueil**, « Tous les comptes » : le solde ne change pas (l'Épargne est tenue à part).
3. Sur l'Accueil, choisis **Épargne** dans la liste du solde : 30 000, revenus 30 000 (revenu initial).
4. Clique sur **Synthèse** dans le menu ⭐ :
   - Le choix « Compte » affiche déjà **Épargne**.
   - Revenus = **30 000** : le compte tenu à part est bien pris en compte.
5. Clique sur **Mouvements** : en haut, le cadre **« Compte affiché »** montre **Épargne** en bleu, avec « Vous voyez les mouvements du compte « Épargne » ».
6. Dans ce cadre, clique sur **Courant** : la liste change **tout de suite**, sans bouton « Filtrer ».
7. Reviens sur l'**Accueil** : **Courant** est choisi, pas « Tous les comptes ».
8. Retourne dans les Mouvements et clique sur **Tous les comptes** : on revient à « Tous les comptes » partout. (« Tout effacer » vide seulement les autres filtres.)
9. Choisis **Courant** sur l'Accueil : la carte des budgets montre Novembre. Choisis Épargne : « Aucun budget n'est rattaché à ce compte ».

---

## C. Supprimer un compte ⭐
1. **Mes comptes → Épargne → Supprimer** : une fenêtre de confirmation aux couleurs du site s'ouvre (plus celle du navigateur). Confirme.
2. Message « supprimé, avec ses mouvements » ; le compte disparaît de la liste.
3. **Accueil** : la liste revient sur « Tous les comptes » (le compte choisi n'existe plus).
4. Recommence depuis la **liste des comptes** (icône de suppression) sur un autre compte de test : même résultat.

---

## D. Synthèse et rapport
1. **Synthèse**, « Tous les comptes » : revenus, dépenses et flux du mois = ceux de l'Accueil (période Mois).
2. **Ouvrir le rapport du mois** : « Solde début + flux net = solde fin » est juste.
3. Choisis **Courant** dans « Compte » : les chiffres et les courbes ne concernent plus que Courant.

---

## E. Intérêts simples et composés ⭐
**Outils → Simulateurs → Intérêts composés.** Sans versement :

| Saisie | Résultat attendu |
|---|---|
| 100 000, 1 %, **par mois**, composé, 12 mois | **112 682,50** (taux annuel effectif ≈ 12,68 %) |
| idem, **simple** | **112 000** |
| 100 000, 3 %, **par trimestre**, composé, 12 mois | **112 550,88** |
| 100 000, 12 % **par an** nominal, capitalisation mensuelle, 1 an | **112 682,50** |
| 100 000, 10 % par an, capitalisation annuelle, 3 ans | **133 100** |
| ⭐ 100 000, 6 %, **par semestre**, composé, 2 ans | **126 247,70** (taux annuel effectif 12,36 %) |

Règle du client vérifiée : **un taux mensuel de 1 % n'est jamais divisé par 12**.

👉 Si le client trouve encore une erreur, noter **exactement** : l'écran, les chiffres saisis, le résultat affiché et celui qu'il attend.

---

## F. Graphiques
1. **Accueil**, anneau ⭐ : l'**ancien** anneau est revenu (à gauche, la légende à sa droite). Onglets Dépenses / Revenus / Comptes / Flux. Cliquer une tranche filtre les mouvements en dessous.
2. Courbes de la Synthèse et de la page d'un compte : couleurs nettes, lisibles sur le fond menthe.

---

## G. Apparence (maquettes du client)
1. **Mode clair** ⭐ (changé à sa demande) :
   - Accueil du site : bandeau clair blanc → menthe, avec une vague, un titre bleu profond et un ordinateur + un téléphone qui montrent l'application.
   - Dans l'application : fond menthe pâle, tuiles d'icônes sarcelle, cartes de chiffres avec un liseré sarcelle.
2. **Mode sombre** : inchangé (le client en est satisfait).
3. **Barre latérale** foncée identique dans les trois espaces : Gestion budgétaire, **Gestion commune** et **Administration**.
4. **Sur téléphone** :
   - pas de défilement horizontal ;
   - barre du bas lisible ;
   - un grand solde ne déborde pas de sa carte.
5. **En arabe** : tout s'inverse (droite à gauche), rien ne déborde.

---

## H. Site public, langues et référencement
1. Ouvre `fincludia.com/ar` : le site est en arabe, de droite à gauche, et les liens du menu commencent par `/ar`.
2. Sur `/ar/blog`, choisis **Français** dans le sélecteur : l'adresse devient `/blog`. Choisis **English** : `/en/blog`.
3. Ouvre `fincludia.com/page-qui-nexiste-pas` : la page « Page introuvable » s'affiche.
4. Ouvre `fincludia.com/sitemap.xml` : la liste des pages s'affiche. Puis `fincludia.com/robots.txt`.
5. `www.fincludia.com` redirige vers `fincludia.com`.
6. Colle un lien du site dans **WhatsApp** : l'image FINCLUDIA et le titre de la page apparaissent.

## I. Google Analytics (si l'identifiant est créé)
1. **Administration → Paramètres** : colle `G-XXXXXXXXXX`, puis enregistre.
2. En navigation privée sur le site : un bandeau « Mesure d'audience » apparaît.
3. **Refuser** : le bandeau disparaît et ne revient pas.
4. Lien « **Cookies et mesure d'audience** » en bas de page : le bandeau revient, et on peut accepter.

## J. E-mails
1. **Contact** : envoie un message. Il arrive dans **contact@fincludia.com**, et « Répondre » répond au visiteur.
2. **Newsletter** : abonne une adresse. L'e-mail de confirmation arrive, envoyé depuis contact@fincludia.com.

## K. Vitesse et stabilité
1. Parcours rapidement une trentaine de pages du site public : **jamais** de message d'erreur ni de page vide (plus de « trop de requêtes »).
2. Dans l'application, chaque écran s'ouvre en environ une seconde au plus.
3. **Mon entreprise**, sans entreprise créée : le formulaire de création s'affiche, sans erreur.

## L. Règles d'accès
1. Compte **sans abonnement** : il ne peut pas ouvrir un deuxième compte bancaire. Une connexion depuis un 2ᵉ navigateur est refusée tant que le 1er n'est pas déconnecté.
2. Compte **mineur** (tranche d'âge < 18) : Dettes, Patrimoine, Financement et Mon entreprise affichent l'invitation à compléter son profil.
3. Un compte normal n'accède **pas** à l'Administration.

---

### À noter pendant le test
Pour chaque écart, noter dans `test.txt` :
- l'étape (ex. « A4 ») ;
- l'écran ;
- ce qui a été saisi ;
- ce qui s'affiche ;
- ce qui était attendu.

Une capture d'écran aide beaucoup.

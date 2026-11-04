# Scénarios de tests utilisateurs — FINCLUDIA

Comptes de démonstration (`npm run demo` dans `server/`) : mot de passe `Demo-Fincludia-2026`, adresses en `@demo.fincludia.local`.
Comptes administrateur : crée un compte normal, puis `npm run make-admin -- ton@adresse` dans `server/`.
Paiements : `PAYMENT_PROVIDER=fake` dans `.env` (page de paiement simulée, aucun argent ne bouge). E-mails : `MAIL_DRIVER=console` (ils s'affichent dans la console du serveur).

Pour chaque défaut, noter dans `test.txt` : **scénario + étape, compte, ce que j'ai fait, ce que j'attendais, ce que j'ai obtenu** (+ capture si possible).

Règle d'or des chiffres : un même montant doit se retrouver partout. Après chaque saisie, vérifier le compte, le budget, la synthèse et l'accueil.

---

## A. Site public et entrée

### S01 — Visiteur anonyme, 4 langues
1. Ouvrir `/` sans être connecté. Parcourir : Formations, Outils, Blog (une liste, un article), À propos, Services, FAQ, Fonctionnalités, Contact, Mentions légales, Confidentialité.
2. Refaire le tour en **arabe**, **anglais** et **tamazight** (sélecteur de langue).
- [ ] Aucune page vide, aucun texte en clé brute (`home.title`…), aucun mélange de langues.
- [ ] En arabe, la page est de droite à gauche (menus, flèches, tableaux).
- [ ] La FAQ fonctionne dans chaque langue (déjà noté : seulement en FR).
3. Formulaire de contact : envoyer vide (erreurs claires), puis rempli (confirmation).
4. Newsletter : s'inscrire, ouvrir le lien de confirmation affiché dans la console du serveur, puis le lien de désinscription.
5. Outils publics : `/outils/comparateur` (toutes les sections, « Comparez selon votre profil »), un simulateur, le référentiel postal, les offres d'emploi.
6. `/verification` : saisir un faux numéro (message « introuvable »), puis un vrai numéro de certificat (voir S19).

### S02 — Inscription, connexion, mot de passe
1. `/inscription` : essayer un e-mail invalide, un mot de passe trop court, un e-mail déjà utilisé → messages compréhensibles.
2. Créer un compte valide → arrivée sur les premiers pas.
3. Se déconnecter, se reconnecter avec un mauvais mot de passe (refus), puis le bon.
4. `/mot-de-passe-oublie` : demander le lien (console serveur), changer le mot de passe, se connecter avec le nouveau.
5. Ouvrir `/app` dans un onglet privé sans être connecté → renvoi vers `/connexion`, puis retour à la page demandée après connexion.

### S03 — Premier démarrage d'un nouveau compte
1. Avec le compte créé en S02 : `/app/parametres/premiers-pas`, faire **Profil éducatif** puis **Premier revenu**.
2. Choisir un âge adulte, une situation (salarié), un revenu de 80 000 DA mensuel.
- [ ] L'accueil reflète ce revenu ; le compte « par défaut » est créé si besoin.
- [ ] Revenir aux premiers pas : les réponses sont conservées et modifiables.
3. Abandonner à mi-chemin, se déconnecter, revenir → reprise au bon endroit.

---

## B. Gestion budgétaire personnelle (compte `salarie`)

### S04 — Accueil et ajout rapide
1. Lire l'accueil : solde, revenus/dépenses du mois, alertes, santé financière.
2. « Ajouter rapidement » une dépense de 1 500 DA (Alimentation) — sur ordinateur puis sur téléphone (feuille glissante).
- [ ] Solde du compte −1 500, dépenses du mois +1 500, budget Alimentation +1 500, synthèse à jour.
3. Ouvrir chaque bouton « Pourquoi ? » : explication en mots, **jamais de formule ni de pondération**.

### S05 — Comptes et transferts
1. `/app/comptes` : créer un compte CCP avec solde initial 20 000 DA, puis un compte Espèces.
2. Modifier le nom d'un compte, ouvrir son détail (historique des mouvements).
3. Transfert de 5 000 DA du CCP vers Espèces.
- [ ] Les deux soldes bougent, le total ne change pas, le transfert n'est **ni** un revenu **ni** une dépense dans la synthèse.
4. Essayer un transfert vers le même compte, d'un montant négatif ou nul → refus clair.

### S06 — Mouvements
1. Ajouter un revenu, une dépense avec sous-catégorie, mode de paiement, étiquette, note, justificatif (photo et PDF).
2. Saisir deux fois la même dépense → avertissement « doublon suspect », possibilité de confirmer quand même.
3. Ouvrir le détail, modifier le montant, consulter l'historique des modifications, supprimer avec un motif.
4. Filtres et tri de la liste ; export CSV → ouvrir dans Excel (accents corrects, montants cohérents).
5. Remplacer puis supprimer le justificatif.
6. `/app/mouvements/pointage` : pointer quelques opérations, vérifier le reste à pointer.

### S07 — Budgets
1. `/app/budgets/revenus` : vérifier/ajouter une source de revenu (hebdomadaire, annuelle → équivalent mensuel).
2. Créer un budget du mois, plusieurs catégories ; ouvrir le détail ; « Analyse selon méthode » (50/30/20…).
3. Dépasser volontairement une catégorie (125 %, puis 150 %).
- [ ] Alerte de dépassement, couleur et texte (pas seulement la couleur), impact visible dans la santé financière.
4. Modifier puis supprimer un budget.

### S08 — Synthèse et rapports
1. `/app/synthese` : changer de période, lire les graphiques (pas jour / semaine / mois), le tableau des chiffres sous chaque graphique.
2. Ouvrir le rapport mensuel du mois précédent ; « Comparer deux mois ».
3. `/app/synthese/rapports` : télécharger chaque rapport et l'ouvrir.
- [ ] Les totaux du rapport = ceux de l'écran = somme des mouvements.

### S09 — Calendrier et paiements réguliers
1. Créer un loyer mensuel (le 5) et un salaire (le 25) dans `/app/calendrier/regulier`.
2. Vérifier le calendrier, la page « Aujourd'hui » et les notifications à l'approche des échéances.
3. Marquer une échéance comme payée → un mouvement est créé une seule fois.
4. Arrêter un paiement régulier → il disparaît des mois suivants, pas des mois passés.

### S10 — Objectifs et fonds d'urgence
1. Créer un objectif « Voiture » 600 000 DA dans 18 mois ; consulter le scénario et la trajectoire.
2. Y verser 20 000 DA ; mettre en pause ; reprendre ; atteindre l'objectif (montant restant faible).
3. `/app/objectifs/fonds-urgence` : nombre de mois couverts, verser, retirer.
- [ ] Un versement baisse le compte source et monte l'objectif ; il n'est pas compté comme dépense de consommation.

### S11 — Dettes (adulte uniquement)
1. « J'ai prêté » 10 000 DA à un ami ; enregistrer un remboursement partiel de 4 000 DA.
2. « On m'a prêté » 15 000 DA ; rembourser.
3. Dette bancaire / carte avec taux et mensualité ; `/app/dettes/strategies` : comparer avalanche / boule de neige.
- [ ] Le remboursement reçu n'est pas un revenu ; le capital restant diminue chaque mois sur le graphique.

### S12 — Patrimoine, financement, portefeuille fictif
1. `/app/patrimoine` : ajouter la voiture, un bien, une valorisation ; patrimoine net = actifs − dettes.
2. `/app/financement` : lire la préparation au financement.
3. `/app/portefeuille` : construire un portefeuille fictif, acheter/vendre, lire le risque.

### S13 — Outils
Tester chacun avec des valeurs normales, puis des valeurs absurdes (0, négatif, énorme, texte) :
- [ ] Comparateur (thèmes, segments, adéquation à l'usage)
- [ ] Simulateurs (objectif avec rendement, inflation, retraite) : le dernier point du graphique = le résultat affiché
- [ ] Simulateur de crédit · Fiche de paie · Comparer · Facture · Explorateur · Postal · Offres d'emploi · Atelier de simulation

### S14 — Santé financière
1. `/app/sante` : lire chaque dimension ; une dimension sans données dit « Non calculée », jamais 0.
2. Faire varier une donnée (rembourser une dette, verser au fonds d'urgence) → l'indice bouge dans le bon sens.

### S15 — Paramètres et confiance
1. Profil (nom, e-mail), profil FINCLUDIA, catégories personnelles (créer, renommer, archiver).
2. Changer le type de compte, la langue, la devise si proposée.
3. `/app/parametres/confiance` : exporter mes données (fichier complet et lisible), puis **supprimer le compte** d'un compte de test jetable → plus de connexion possible.

### S16 — Barre supérieure
1. Recherche globale : un mouvement, une catégorie, un terme du glossaire, une page.
2. Notifications : lire, marquer comme lu, suivre le lien.
3. Aide FINCLUDIA : poser une question ; les **astuces** (tips) de l'espace client s'ouvrent bien elles-mêmes (déjà noté : c'est la FAQ qui s'ouvre).

---

## C. Profils éducatifs

### S17 — Lycéen mineur (compte `lyceen`)
1. Parcourir tout le menu.
- [ ] Dettes et Patrimoine ne sont **pas** proposés ; les adresses directes `/app/dettes` et `/app/patrimoine` sont refusées proprement (pas de page cassée).
- [ ] Les textes s'adressent à un lycéen (argent de poche, pas de crédit réel).
2. Saisir son argent de poche, une envie, transformer l'envie en objectif.
3. Missions lycéen (`/app/apprendre/missions`), progression, passeport.

### S18 — Comparer salarié et lycéen côte à côte
Deux navigateurs : `salarie` et `lyceen`. Même application, couche pédagogique différente : noter toute différence qui paraît anormale.

### S19 — Formation et certificat
1. `/app/formation` : s'inscrire à une formation (gratuite, puis payante → S21), suivre un cours, faire le quiz (rater puis réussir).
2. Obtenir le certificat, le télécharger, vérifier son numéro sur `/verification/<numéro>` en navigation privée.
3. `/app/progression` et `/app/certificats` à jour.
4. `/app/apprendre` : un terme, un guide, une mission complète.

---

## D. Gestion commune (`/partage`)

### S20a — Colocation (`coloc.karim` + `coloc.lina`, deux fenêtres)
1. Karim ajoute une dépense commune de 9 000 DA « Courses » payée de son argent, à parts égales entre 3 personnes (ou 2 selon l'espace).
- [ ] Compte de Karim −9 000 ; **son budget Alimentation ne supporte que sa part** ; le reste apparaît comme avance à récupérer.
- [ ] Aucun doublon : la dépense commune ne crée pas en plus une deuxième dépense personnelle.
2. Lina rembourse sa part → le compte de Karim monte, ce n'est **pas** un revenu, l'avance diminue.
3. Parcourir chaque onglet : tableau de bord, dépenses, calendrier, rapport, ressources (cagnotte), tâches, budgets, objectifs, foyer, membres.
4. Parts inégales (60/40), corriger une part après coup, annuler une dépense → les soldes entre membres se recalculent.

### S20b — Couple (`couple.sami`)
1. Objectif commun « Mariage » : contribuer, lire la progression, les jalons 25/50/75/100 %.
2. Calendrier de contributions : laisser une contribution en retard → alerte au bon membre, sans montant nominatif pour les autres si les droits ne le permettent pas.

### S20c — Amis (`amis.nour` + `amis.walid`)
1. Nour invite un nouveau membre (compte créé en S02), qui accepte.
2. Rôles : passer quelqu'un en lecteur → il ne peut plus rien modifier (boutons absents **et** action refusée).
3. Un membre quitte l'espace ; le créateur transfère ses droits puis supprime l'espace (déjà noté : à prévoir, un seul supprimeur).

### S20d — Étanchéité
1. Copier l'adresse d'un mouvement, d'un objectif, d'un espace d'un compte A ; l'ouvrir connecté en B.
- [ ] « Introuvable » à chaque fois ; aucune donnée de A visible.

---

## E. Paiements et accès premium

### S21 — Paiement simulé
1. Acheter une formation payante / l'accès premium ; sur la page simulée, **réussir** puis, avec un autre achat, **échouer** et **abandonner**.
- [ ] Succès : accès ouvert, paiement listé dans `/app/parametres/paiements`. Échec/abandon : aucun accès, message clair.
2. Recharger la page de retour plusieurs fois → aucun double débit, aucun double accès.

---

## F. Administration (compte admin)

### S22 — Back-office
1. `/admin` : formations (créer, publier, cours, quiz), articles (brouillon → publié, visible sur le blog public), newsletter, médias (envoi, suppression), certificats, apprendre, missions, assistant, paiements, comparateur, réglages.
2. Utilisateurs : rechercher, suspendre un compte (il ne peut plus se connecter), réactiver.
3. Types de compte : en ajouter un, vérifier qu'il apparaît à l'inscription ; en désactiver un.
4. Avec un compte **non admin**, ouvrir `/admin` → refusé.

---

## G. Transversal (à faire sur quelques écrans de chaque partie)

### S23 — Téléphone (375 px) et tablette
Outils de développement du navigateur, mode appareil : accueil, mouvements, budget, objectifs, réserve, dettes, un espace commun, l'admin comparateur.
- [ ] Pas de défilement horizontal, rien de coupé, boutons assez grands. **Refaire en arabe** (problème déjà vu : pages presque vides).

### S24 — Clavier et lisibilité
1. Remplir une dépense et un budget **uniquement au clavier** (Tab, Entrée, Échap) : le focus est toujours visible.
2. Zoom 200 % : tout reste utilisable.
3. Graphiques : légende écrite, valeurs écrites, tableau des chiffres disponible.

### S25 — Robustesse
1. Double-clic rapide sur « Enregistrer » → un seul enregistrement.
2. Couper le serveur pendant une saisie → message clair, la saisie n'est pas perdue en silence ; relancer.
3. Bouton retour du navigateur après un enregistrement, rechargement (F5) sur chaque page profonde (`/app/mouvements/<id>`, `/partage/<id>/depenses`).
4. Laisser la session ouverte longtemps puis agir → renvoi propre vers la connexion.
5. Montants : 0, 0,5, 1 000 000 000, « abc », virgule et point décimal.

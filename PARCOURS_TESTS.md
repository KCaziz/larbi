# Parcours de test à faire à la main

Ces parcours couvrent ce qui a été construit les 23, 24 et 25 novembre 2026 : l'espace entreprise (lots A à I), FINCLUDIA Academy, InvestLab et le marché du portefeuille fictif.

Pour chaque étape, faites l'action, puis comparez avec le résultat attendu (→). Cochez la case si c'est bon. Sinon, notez ce que vous voyez à côté : le défaut ira dans `SUIVI_RECETTE.md`.

---

## 0. Préparation (une seule fois)

- [ ] Dans `server/`, lancez `npm run reprise` → le message se termine par « Machine prête ». Les dernières migrations sont alors appliquées (jusqu'à `20261209120000_fin_institution_training`).
- [ ] Lancez le serveur et le site comme d'habitude, puis ouvrez le site.
- [ ] Préparez six comptes, avec six adresses e-mail différentes :

| Nom dans ce document | Rôle | Réglage |
|---|---|---|
| **ADMIN** | administrateur | rôle « admin » |
| **PATRON** | crée et dirige une organisation | adulte (tranche d'âge 25-34 ou plus) |
| **COLLÈGUE** | deuxième membre de l'organisation | adulte |
| **BANQUE** | membre d'un espace « financeur » | adulte |
| **ÉCOLE** | membre d'un espace « institution » | adulte |
| **ÉLÈVE** | apprenant | adulte |

- [ ] Si un écran demande un abonnement : Administration → Utilisateurs → passez le compte en « premium ».
- [ ] Si une fenêtre demande de confirmer les valeurs réglementaires : avec ADMIN, ouvrez Administration → Valeurs réglementaires, et confirmez-les ou laissez-les par défaut. Avec les valeurs par défaut, la paie et la comptabilité sont marquées « provisoire ». C'est normal.

---

## 1. Organisation, rôles et journal (lot A)

Compte **PATRON**.

- [ ] Menu → Mon entreprise → créer une organisation (nom, devise DZD, public « PME ») → la page de l'organisation s'ouvre, avec ses onglets.
- [ ] Onglet « Équipe et journal » → inviter **COLLÈGUE** comme « collaborateur » → l'invitation apparaît.
- [ ] Avec **COLLÈGUE**, acceptez l'invitation → il voit l'organisation, mais pas les onglets « Paie » ni « Équipe ».
- [ ] Avec **PATRON**, onglet « Équipe et journal » → chaque action apparaît dans le journal, avec sa date et son auteur.

## 2. Ventes et achats (lot B)

Compte **PATRON**, onglet « Ventes et achats ».

- [ ] Ajouter un client avec un NIF (par exemple « Société Atlas », NIF 000216001234567). Ajouter aussi un client sans NIF.
- [ ] Créer un **devis** pour « Société Atlas » avec 2 lignes → il reçoit un numéro, et aucune créance n'est créée.
- [ ] L'envoyer, l'accepter, puis le facturer → une facture en brouillon apparaît. Émettez-la → elle reçoit son numéro, et le reste dû est égal au total.
- [ ] Enregistrer un règlement partiel → l'état passe à « partiel » et le reste dû baisse.
- [ ] Faire un **avoir** du montant restant → la facture est soldée, et elle n'a pas été modifiée.
- [ ] Bouton « Imprimer / PDF » → une page propre, avec les coordonnées de l'organisation.
- [ ] Enregistrer une relance → elle s'ajoute à l'historique de la facture.

## 3. Factures en devise (lot D bis, FAC-013 à 016)

Compte **PATRON**, onglet « Ventes et achats ».

- [ ] Créer une facture de vente à « Société Atlas », **devise EUR**, une ligne de 2 × 1 500 € → les champs « cours », « date du cours » et « source » apparaissent. Le cours officiel peut être prérempli.
- [ ] Videz le cours, puis émettez → refus : « un montant dans une autre devise a besoin de son cours et de sa date ».
- [ ] Mettez le cours à 150, puis émettez → la fiche montre :
  - 3 000,00 € ;
  - « Cours : 1 EUR = 150 DZD… » ;
  - un reste dû de 450 000 DA.
- [ ] Encaisser **1 000 €** avec un cours de **152** → la fiche montre :
  - « Encaissé : 1 000 € » et « Reste dû : 2 000 € » ;
  - « Gain de change : 2 000 DA ».
- [ ] Essayer d'encaisser 3 000 € → refus pour trop-perçu.
- [ ] Avoir de **500 €** → le reste dû passe à 1 500 €.
- [ ] Encaisser **1 500 €** à **148** → la facture est « payée », avec une perte de change de 3 000 DA sur ce règlement.
- [ ] Imprimer → les montants sont en euros, avec la contre-valeur en DZD, le cours, sa date et sa source.

## 4. Stock, budget et trésorerie (lot C)

Compte **PATRON**.

- [ ] Onglet « Stock » → créer un article, puis faire une entrée de 10 unités → le stock vaut 10.
- [ ] Faire une sortie de 15 → refus : stock insuffisant.
- [ ] Onglet « Budget et trésorerie » → saisir le solde de départ → le plan sur 13 semaines s'affiche. Un chiffre manquant s'affiche « non calculé », jamais 0.

## 5. Import-export et registre des risques (lots D et D bis)

Compte **PATRON**, onglet « Import-export ».

- [ ] Créer une opération d'import (Incoterm FOB, lieu nommé) → ajouter des coûts en EUR, avec leur cours → le coût rendu se calcule.
- [ ] **Registre des risques** (en bas de l'onglet) → créer un risque :
  - type « Contrepartie », contrepartie « Lyon Import SA », pays « France » ;
  - probabilité 3, impact 4 ;
  - exposition 450 000 DA, montant garanti 300 000 DA ;
  - sans preuve.

  → La fiche montre :
  - « niveau 12 — élevé » ;
  - « indice provisoire : cotation sans preuve » ;
  - une couverture de 66,7 %.
- [ ] Mettre une date de revue passée → « revue en retard ».
- [ ] Détails → associer une action (responsable, échéance) → « 1 action en cours ». La marquer faite → 0.
- [ ] Réévaluer : probabilité 2, preuve « Rapport 2026-11 » → « niveau 8 — modéré », plus de mention provisoire. L'historique montre 2 cotations.
- [ ] Clore le risque → il passe « clos ».

## 6. Projets diaspora et effet de change (lots E et D bis)

Compte **PATRON**, onglet « Projets et patrimoine ».

- [ ] Créer un projet de 12 000 000 DA → ajouter un jalon et une dépense.
- [ ] Valider la dépense avec le compte qui l'a saisie → refus : il faut une autre personne.
- [ ] Avec **COLLÈGUE**, essayez d'ouvrir le projet → il ne le voit pas. Partagez-le avec lui → il le voit.
- [ ] Détails du projet → « Effet de change sur le projet » :
  - votre devise EUR, montant 10 000 € ;
  - cours de référence 150, date du jour ;
  - cours de scénario « 160 » ;

  puis « Convertir » → contre-valeur de 1 500 000 DA ; à 160, un écart de +100 000 DA. Le texte « Reste à financer : …, soit … € » s'affiche.
- [ ] « Tester des variations » → 4 lignes de plus (−10 %, −5 %, +5 %, +10 %).
- [ ] Nommer le scénario, puis « Conserver » → il apparaît dans « Scénarios conservés ».
- [ ] Mettre la devise DZD → message : choisissez une devise différente de celle du projet.

## 7. Personnel, paie et comptabilité (lots G et H)

Compte **PATRON**.

- [ ] Onglet « Personnel » → ajouter un salarié, puis saisir une absence → la valider avec le même compte est refusé ; avec **COLLÈGUE**, c'est accepté.
- [ ] Onglet « Paie » → créer le lot du mois → un bulletin par salarié, avec la mention « provisoire ».
  - Valider le lot avec la personne qui l'a préparé → refus.
- [ ] Onglet « Comptabilité » → « Proposer les écritures » :
  - les factures, les règlements et la paie deviennent des écritures en brouillon ;
  - les règlements en euros du parcours 3 portent une ligne en **766** (gain) ou en **666** (perte).
- [ ] Valider les écritures → la balance et les états (actif, passif, résultat) se remplissent.

## 8. Passeport financier (lot F bis, FAC-010)

Compte **PATRON**, onglet « Financement et partenaires ».

- [ ] Section « Passeport financier » → période des 12 derniers mois, tout coché → « Préparer » → « Passeport n° 1 — brouillon ».
- [ ] « Voir le contenu » → vérifiez :
  - activité, créances, concentration (en parts, **jamais de noms de clients**), comptes, qualité ;
  - l'indice de complétude, avec ses 7 contrôles cochés ou non ;
  - la mention « provisoire » si les comptes ne sont pas validés.
- [ ] Remplir NIF et registre du commerce de l'organisation, puis préparer un passeport n° 2 → le contrôle « identité » est coché.
- [ ] « Publier » le passeport n° 2 → « publié ».
- [ ] « Supprimer le brouillon » du n° 1 → il disparaît.

## 9. Factures à financer (lot F bis, FAC-011)

Compte **PATRON**, même onglet, section « Factures à financer ». Préparez d'abord des factures de vente émises et non payées :
- (a) au client avec NIF, échéance dans 2 mois ;
- (b) au client sans NIF ;
- (c) échéance passée ;
- (d) sans échéance ;
- (e) une facture que vous marquez « Signaler un litige » depuis sa fiche.

- [ ] Section « Factures à financer » → seule (a) est éligible. Les autres sont exclues avec leur raison : « client sans NIF », « échue », « sans échéance », « en litige ».
- [ ] Taux d'avance 80 %, frais 1 % → pour 4 000 000 DA éligibles, « Trésorerie théorique nette de frais » = 3 160 000 DA.
- [ ] Cocher (a), nommer le lot, puis « Créer le lot » → le lot apparaît, et (a) passe dans les exclues avec « déjà dans un lot en cours ».
- [ ] « Exporter (CSV) » → un fichier avec numéro, client, NIF, dates et montant.
- [ ] « Annuler le lot » → (a) redevient éligible.

## 10. Espace financeur et partage (lots I et F bis)

- [ ] **ADMIN** → Administration → Partenaires → Espaces : créer un espace « Banque Test » de type **financeur**, puis y ajouter **BANQUE** par son e-mail.
- [ ] **PATRON** → passeport n° 2 → « Partager avec un financeur » → choisir « Banque Test », une date dans 30 jours. Ne cochez pas le consentement → le bouton reste inactif. Cochez → « partagé jusqu'au … · ouvert 0 fois ».
- [ ] Partager aussi un lot de factures (refaites-en un s'il a été annulé).
- [ ] **BANQUE** → menu du compte → « Espace partenaire » → section « Passeports et lots de factures partagés » : les deux éléments sont là.
- [ ] Ouvrir le passeport → même contenu que chez PATRON. Ouvrir le lot → les factures, avec nom et NIF du client.
- [ ] **PATRON** → le compteur « ouvert N fois » a augmenté.
- [ ] **PATRON** → « Révoquer » le passeport → **BANQUE** ne peut plus l'ouvrir (« Ce partage n'est plus disponible »).
- [ ] Avec **ÉLÈVE**, essayez l'adresse de l'espace partenaire → rien n'est visible.

## 11. Outils et simulateurs (lot F, complété le 25/11)

Compte **PATRON**, onglet « Outils ».

- [ ] Copilote : « combien me doit Atlas ? » → une réponse chiffrée, ou une question pour préciser.
- [ ] Simulateur **Test A/B** : A = 1 000 visiteurs et 50 conversions ; B = 1 000 et 75 → taux 5 % et 7,5 %, écart +50 %, p-valeur ≈ 0,021.
- [ ] **Monte-Carlo** : trésorerie 1 000 000, encaissements 500 000 (variabilité 20 %), décaissements 480 000 (10 %), 12 mois → une probabilité de passer sous zéro et trois soldes finaux. Le même calcul relancé donne les mêmes chiffres.
- [ ] **Paie : du brut au net** : 80 000 DA, 10 heures supplémentaires → brut 86 923 DA, avec la mention « barèmes par défaut : à confirmer ».
- [ ] **TVA nette** : collectée 190 000, déductible 250 000 → TVA à payer 0, crédit de 60 000.
- [ ] Le catalogue des simulateurs indique, avec une raison, ce qui n'est pas simulé (IBS, CASNOS, IRG des professions libérales…).

## 12. Institution : programmes, cohortes, formations propres, sessions (lots I et I bis)

- [ ] **ADMIN** → Partenaires → Espaces : créer « Université Test », type **institution**, seuil d'anonymat **1** pour le test. Y ajouter **ÉCOLE**.
- [ ] **ÉCOLE** → Espace partenaire → créer un programme, puis une cohorte « Groupe A » → inviter l'e-mail de **ÉLÈVE**.
- [ ] **ÉLÈVE** → menu → « Formations proposées » → accepter.
- [ ] **ÉCOLE** → section « Vos formations » :
  - créer « Gérer un budget étudiant » ;
  - ajouter une leçon dont le texte contient `<b>test</b>` ;
  - enregistrer une évaluation de 2 questions, seuil 60 % ;
  - « Publier ».
- [ ] **ÉCOLE** → dans la cohorte, affecter cette formation.
- [ ] **ÉLÈVE** → « Formations proposées » → la formation apparaît. Ouvrez la leçon → le texte `<b>test</b>` s'affiche tel quel, sans être interprété.
- [ ] **ÉLÈVE** → passer l'évaluation et la réussir → une **attestation pédagogique**, qui dit n'être ni une habilitation professionnelle ni une habilitation réglementaire.
- [ ] Avec **COLLÈGUE** :
  - le catalogue des formations ne montre pas cette formation ;
  - son adresse directe (`/app/formation/<adresse>`) → page introuvable.
- [ ] **ÉCOLE** → « Sessions de formation » → créer une session pour « Groupe A », avec cette formation, un formateur et des heures.
- [ ] « Feuille de présence » → cocher ÉLÈVE présent → présence 100 % ; complétion et score s'affichent.
- [ ] Mettre le seuil d'anonymat à 5 (Administration) → la complétion et le score sont masqués, la présence reste visible.

## 13. FINCLUDIA Academy (P13-02)

Compte **ÉLÈVE**. Menu → Formation → catégorie « FINCLUDIA Academy » → s'inscrire à « Fondamentaux, budget & résilience ».

### 13.1 Mon parcours et prétest

- [ ] La page de la formation montre « Mon parcours » : prétest, niveau atteint, cas intégrateur, et le statut de chaque module (« À découvrir »).
- [ ] « Passer le prétest » → une question par module. Répondre juste partout → « 100 % » et plusieurs modules « Dispensé ». Le module de sécurité numérique (BUD-08) n'est **pas** dispensé.
- [ ] Relancer le prétest → refus : déjà passé.

### 13.2 Un module : QCM, exercice, mission

Ouvrez la leçon « BUD-05 — Construire un fonds de sécurité » (ou un module non dispensé).

- [ ] En bas de la leçon : « Valider le module BUD-05 », avec la règle 50 / 30 / 20.
- [ ] Passer le QCM → **5 questions** (le module en a 8). Les réponses ne sont pas dans le même ordre d'une tentative à l'autre.
- [ ] Repasser le QCM → la plupart des questions ont changé.
- [ ] Rater exprès une question marquée « question critique » → le QCM échoue, même à 80 %, avec « 1 erreur sur une question critique ».
- [ ] Faire un QCM sous 60 % → retour à la leçon : statut « À reprendre », avec la liste des questions ratées et leurs explications. Relancer le QCM → refus : « réécrivez l'exercice du module ». Après l'exercice → accepté.
- [ ] **Exercice** : écrire une réponse, puis « Enregistrer et voir le corrigé » → le corrigé apparaît, avec les 5 étapes à cocher. En cocher 4 → exercice 80 %.
- [ ] **Exercice chiffré** : « Obtenir un énoncé » → des montants différents de ceux du cours.
  - Redemander un énoncé avant de répondre → c'est le même.
  - Répondre juste (même arrondi) → « Juste », avec le calcul.
  - « Nouvel énoncé » → d'autres montants.
- [ ] **Mission** : « J'ai réalisé la mission » → score du module calculé. Statut « Acquis » si le score atteint 80 %.

### 13.3 Cas intégrateur et certificat

- [ ] Ouvrir la leçon « Cas intégrateur corrigé — Fondamentaux… » → noter la grille avant d'avoir répondu → refus.
- [ ] Rédiger une réponse → le corrigé apparaît. Noter 5 critères → un score sur 100 ; cas réussi à 75 % ou plus.
- [ ] Cocher « erreur critique » → le cas n'est plus réussi.
- [ ] Demander le certificat avant d'avoir tous les modules → message : modules, compétences réglementaires et cas intégrateur requis.
- [ ] Menu → « Progression » (passeport de connaissances) → section « Compétences validées », avec un tableau par module et l'avancement par parcours.

### 13.4 Administration des quiz

Compte **ADMIN** → Formations → un quiz.

- [ ] Le champ « Questions tirées par tentative » et la case « Question critique » existent, et sont enregistrés.

## 14. Portefeuille fictif, marché et InvestLab (P13-01)

Compte **ÉLÈVE** (ou n'importe quel adulte).

- [ ] Menu → Portefeuille → « Marché » → 21 supports. Les actions cotées (par exemple « Alliance Assurances (ALL) »), DZAIRINDEX, l'argent et le platine portent le badge **« données réelles du document »**.
- [ ] L'or, le livret et l'obligation d'État portent aussi ce badge, avec la phrase « … remplacent nos hypothèses fictives… ».
- [ ] Le sukuk, le dépôt à terme, le fonds diversifié et les deux actions types gardent le badge « exemple fictif ».
- [ ] Acheter fictivement 1 action ALL → elle entre dans le portefeuille fictif.
- [ ] Portefeuille → bouton « InvestLab » → les neuf vues.
- [ ] Vue « Backtest » : 10 000 DA fin 2020 → fin 2026 :
  - ALL → valeur finale 29 750 DA, dividendes compris ;
  - Or → environ 23 994 DA ;
  - une action non cotée en 2020 affiche « non coté », jamais 0.

## 15. Import-export et diaspora : cours officiel par défaut

- [ ] **ADMIN** → Administration → Cours des devises : vérifier qu'un cours EUR existe.
- [ ] **PATRON** → nouveau coût en EUR sur une opération, ou nouvelle facture en EUR → le cours se remplit tout seul, avec « Cours officiel proposé, à vérifier ou modifier ».
- [ ] Taper un autre cours, puis changer un autre champ → votre cours n'est jamais remplacé.

## 16. Données personnelles

Compte **ÉLÈVE**, puis **PATRON**.

- [ ] Centre de confiance → « Exporter mes données » → le fichier contient :
  - les messages du forum de la personne ;
  - ses bulletins de paie validés (s'il est salarié d'une organisation) ;
  - ses résultats Academy (modules, cas intégrateurs, prétests).
- [ ] Il ne contient rien d'un autre compte.

## 17. Écrans et langues (à faire sur 2 ou 3 écrans de chaque parcours)

- [ ] Passer le site en **anglais** puis en **arabe** → aucun texte technique ni clé du type `business.risk.title`. En arabe, la page est de droite à gauche.
- [ ] Téléphone (ou fenêtre étroite, environ 380 px) → pas de défilement horizontal de la page. Les grands tableaux défilent dans leur cadre.
- [ ] Aucun écran n'affiche un code de formule (E058, E064…), ni « le client » ou « the client ».

---

### Après les tests

Pour chaque case non cochée, notez :
- le numéro du parcours et de l'étape ;
- le compte utilisé ;
- ce que vous attendiez et ce que vous avez vu ;
- une capture si possible.

Je reproduirai chaque défaut avant de le corriger.

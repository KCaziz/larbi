# Matrice des livrables et recette

> Généré le 2026-10-28 par `node server/scripts/generate-deliverables.js` depuis `TASKS.md` et `server/tests/`. Ne pas modifier à la main.

Livrable de l'**annexe 2** du contrat, dont le tableau est fourni vide (livrable / prévu / livré / test / réserve).

La colonne « Test / résultat » renvoie à la suite automatisée : `npm test` dans `server/`. La colonne « Réserve » reprend ce que le plan déclare bloqué, sans l'adoucir — l'article 7 distingue les anomalies bloquantes, majeures et mineures, et une donnée que le client doit fournir n'est aucune des trois : c'est une réserve.

**103 livrables sur 137** sont terminés et vérifiés. **7** sont bloqués par une décision ou une donnée du client.

Suite de tests : 145 fichiers (consistency : 2, e2e : 29, functional : 45, security : 38, unit : 31).

| Livrable | Prévu | Livré | Test / résultat | Réserve / correction |
| --- | --- | --- | --- | --- |
| `P1-01` — Initialisation du projet | Oui | Oui | Suite automatisée verte |  |
| `P1-02` — Architecture frontend | Oui | Oui | Suite automatisée verte |  |
| `P1-03` — Pages publiques principales | Oui | Oui | Suite automatisée verte |  |
| `P1-04` — Pages utilisateurs | Oui | Oui | Suite automatisée verte |  |
| `P1-05` — Backend minimal et navigation dynamique | Oui | Oui | Suite automatisée verte |  |
| `P1-06` — Authentification + rôles | Oui | Oui | Suite automatisée verte |  |
| `P1-07` — Intégration frontend/backend | Oui | Oui | Suite automatisée verte |  |
| `P1-09` — Mode clair / sombre | Oui | Oui | Suite automatisée verte |  |
| `P1-10` — Internationalisation (i18n) | Oui | Oui | Suite automatisée verte |  |
| `P1-11` — Refonte visuelle du frontend | Oui | Oui | Suite automatisée verte |  |
| `P1-12` — FINCLUDIA : système de design et navigation de l'espace connecté (lot 0) | Oui | Oui | Suite automatisée verte |  |
| `P1-13` — Charte graphique officielle (logo, palette, typographies) | Oui | Oui | Suite automatisée verte |  |
| `P1-08` — Validation de fin de phase | Oui | Oui | Suite automatisée verte |  |
| `P2-01` — Modèle de données E-Learning | Oui | Oui | Suite automatisée verte |  |
| `P2-02` — Gestion des formations côté client/admin (CMS) | Oui | Oui | Suite automatisée verte |  |
| `P2-03` — Interface utilisateur E-Learning | Oui | Oui | Suite automatisée verte |  |
| `P2-04` — Suivi de progression | Oui | Oui | Suite automatisée verte |  |
| `P2-05` — Certification | Oui | Oui | Suite automatisée verte |  |
| `P2-06` — Protection des contenus E-Learning | Oui | Oui | Suite automatisée verte |  |
| `P2-07` — Validation de fin de phase | Oui | Oui | Suite automatisée verte |  |
| `P2-08` — FINCLUDIA : « Apprendre » — glossaire, mini-guides et recherche pédagogique | Oui | Oui | Suite automatisée verte |  |
| `P2-09` — FINCLUDIA : indice de connaissances financières et passeports (Avenir, étudiant) | Oui | Oui | Suite automatisée verte |  |
| `P2-10` — FINCLUDIA : défis et missions pédagogiques (lycéen) | Oui | Non | — | Non commencé |
| `P3-01` — Modèle de données blog | Oui | Oui | Suite automatisée verte |  |
| `P3-02` — CMS simplifié | Oui | Oui | Suite automatisée verte |  |
| `P3-03` — Frontend blog | Oui | Oui | Suite automatisée verte |  |
| `P3-04` — Recommandation / visibilité selon profil | Oui | Oui | Suite automatisée verte |  |
| `P3-05` — Newsletter | Oui | Oui | Suite automatisée verte |  |
| `P3-06` — Suite de tests automatisés (unitaires, fonctionnels, sécurité, cohérence globale) | Oui | Oui | Suite automatisée verte |  |
| `P3-07` — Assistant guidé (chatbot à questions / réponses prédéfinies) | Oui | Oui | Suite automatisée verte |  |
| `P3-08` — Paiement : décisions à préciser (recherches à mener par le client) | Oui | Bloqué | — | Bloqué : décision ou donnée attendue du client |
| `P3-09` — Paiement : socle indépendant du fournisseur | Oui | Oui | Suite automatisée verte |  |
| `P3-10` — Paiement : branchement du fournisseur choisi | Oui | Non | — | Non commencé |
| `P3-11` — CMS pédagogique, lot A : structure d'une formation | Oui | Oui | Suite automatisée verte |  |
| `P3-12` — CMS pédagogique, lot B : blocs de contenu et éditeur avancé | Oui | Oui | Suite automatisée verte |  |
| `P3-13` — CMS pédagogique, lot C : quiz | Oui | Oui | Suite automatisée verte |  |
| `P3-14` — CMS pédagogique, lot D : finitions | Oui | Oui | Suite automatisée verte |  |
| `P3-15` — Types de compte dynamiques | Oui | Oui | Suite automatisée verte |  |
| `P3-16` — Panel d'administration étendu (utilisateurs, droits, paramètres, médiathèque, certifications) et tableau de bord personnalisé | Oui | Oui | Suite automatisée verte |  |
| `P3-17` — Articles multilingues (traductions) | Oui | Oui | Suite automatisée verte |  |
| `P3-18` — FINCLUDIA : publics (personas), âge, intention et changement de parcours | Oui | Oui | Suite automatisée verte |  |
| `P3-19` — FINCLUDIA : assistant déterministe (intentions, parcours à étapes, liens profonds) | Oui | Oui | Suite automatisée verte |  |
| `P4-01` — Architecture commune des outils | Oui | Oui | Suite automatisée verte |  |
| `P4-02` — Simulateur de crédit | Oui | Oui | Suite automatisée verte |  |
| `P4-03` — Générateur de facture | Oui | Oui | Suite automatisée verte |  |
| `P4-04` — Simulateur fiscalité | Oui | Non | — | Non commencé |
| `P4-06` — Comparateur bancaire, lot A : données et API publique | Oui | Oui | Suite automatisée verte |  |
| `P4-07` — Comparateur bancaire, lot B : pages publiques | Oui | Oui | Suite automatisée verte |  |
| `P4-08` — Comparateur bancaire, lot C : administration des données | Oui | Oui | Suite automatisée verte |  |
| `P4-09` — FINCLUDIA : moteur de calcul versionné | Oui | Oui | Suite automatisée verte |  |
| `P4-16` — FINCLUDIA : atelier de simulation (C18) | Oui | Oui | Suite automatisée verte |  |
| `P4-10` — FINCLUDIA : calculateurs, lot 1 (budget, épargne, objectifs, inflation, simulations de vie) | Oui | Oui | Suite automatisée verte |  |
| `P4-11` — FINCLUDIA : calculateurs, lot 2 (dettes et crédit) | Oui | Oui | Suite automatisée verte |  |
| `P4-12` — FINCLUDIA : moteur de comparaison multicritère et comparateur d'offres d'emploi | Oui | Oui | Suite automatisée verte |  |
| `P4-13` — Comparateur bancaire, lot D : adéquation à l'usage et « Explorer » (FINCLUDIA) | Oui | Oui | Suite automatisée verte |  |
| `P4-14` — FINCLUDIA : décodeur de fiche de paie | Oui | Oui | Suite automatisée verte |  |
| `P4-15` — FINCLUDIA : comparer un financement (conventionnel / islamique) | Oui | Oui | Suite automatisée verte |  |
| `P4-17` — Référentiel Algérie Poste / CCP (comparateur et pédagogie) | Oui | Oui | Suite automatisée verte |  |
| `P4-05` — Validation de fin de phase | Oui | Oui | Suite automatisée verte |  |
| `P5-01` — Audit d'authentification et autorisation | Oui | Oui | Suite automatisée verte |  |
| `P5-02` — Sécurité API et backend | Oui | Oui | Suite automatisée verte |  |
| `P5-03` — Sécurité des fichiers et contenus | Oui | Oui | Suite automatisée verte |  |
| `P5-04` — Disponibilité et sauvegardes | Oui | En cours | — |  |
| `P5-05` — Tests fonctionnels et sécurité | Oui | Non | — | Non commencé |
| `P5-06` — Préparation production et livraison | Oui | Non | — | Non commencé |
| `P5-07` — Livrables contractuels, réversibilité et matrice de recette | Oui | En cours | — |  |
| `P6-01` — FINCLUDIA : décisions de cadrage à obtenir du client | Oui | Bloqué | — | Bloqué : décision ou donnée attendue du client |
| `P6-22` — FINCLUDIA : intégration du référentiel maître (seuils, paie, mineurs, assistant, objectifs) | Oui | Oui | Suite automatisée verte |  |
| `P6-02` — FINCLUDIA : modèle de données financier commun | Oui | Oui | Suite automatisée verte |  |
| `P6-03` — FINCLUDIA : onboarding financier progressif | Oui | Oui | Suite automatisée verte |  |
| `P6-04` — FINCLUDIA : « Mon argent » — revenus et transactions | Oui | Oui | Suite automatisée verte |  |
| `P6-05` — FINCLUDIA : budgets et enveloppes | Oui | Oui | Suite automatisée verte |  |
| `P6-06` — FINCLUDIA : accueil « Aujourd'hui » et tableaux de bord par public | Oui | Oui | Suite automatisée verte |  |
| `P6-07` — FINCLUDIA : calendrier financier et dépenses récurrentes | Oui | Oui | Suite automatisée verte |  |
| `P6-08` — FINCLUDIA : objectifs financiers | Oui | Oui | Suite automatisée verte |  |
| `P6-09` — FINCLUDIA : réserve de sécurité | Oui | Oui | Suite automatisée verte |  |
| `P6-10` — FINCLUDIA : dettes et analyse de l'endettement | Oui | Oui | Suite automatisée verte |  |
| `P6-11` — FINCLUDIA : patrimoine réel | Oui | Oui | Suite automatisée verte |  |
| `P6-12` — FINCLUDIA : portefeuille fictif et laboratoire d'investissement | Oui | Oui | Suite automatisée verte |  |
| `P6-13` — FINCLUDIA : espaces partagés — création, membres et permissions | Oui | Oui | Suite automatisée verte |  |
| `P6-14` — FINCLUDIA : dépenses partagées et règlements | Oui | Oui | Suite automatisée verte |  |
| `P6-15` — FINCLUDIA : colocation, couple et famille | Oui | Oui | Suite automatisée verte |  |
| `P6-16` — FINCLUDIA : préparation au financement | Oui | Oui | Suite automatisée verte |  |
| `P6-17` — FINCLUDIA : personnalisation des 8 parcours | Oui | Oui | Suite automatisée verte |  |
| `P6-18` — FINCLUDIA : centre de notifications et alertes | Oui | Oui | Suite automatisée verte |  |
| `P6-19` — FINCLUDIA : centre de confiance et de données | Oui | Oui | Suite automatisée verte |  |
| `P6-20` — FINCLUDIA : recherche globale | Oui | Oui | Suite automatisée verte |  |
| `P6-23` — FINCLUDIA : visualisations graphiques des tableaux de bord | Oui | Oui | Suite automatisée verte |  |
| `P6-24` — FINCLUDIA : comptes financiers multiples et coordination des opérations | Oui | Oui | Suite automatisée verte |  |
| `P6-21` — FINCLUDIA : validation de fin de phase | Oui | Oui | Suite automatisée verte |  |
| `P7-01` — ERP entreprises, diaspora et commerce international | Oui | Bloqué | — | Bloqué : décision ou donnée attendue du client |
| `P7-02` — Espace entreprise : socle de trésorerie (tiers, ventes, achats, règlements) | Oui | Oui | Suite automatisée verte |  |
| `P7-03` — Espace entreprise : déclinaison par segment (PME/PMI, start-up, micro-entreprise, auto-entrepreneur, micro-importateur, profession libérale) | Oui | Bloqué | — | Bloqué : décision ou donnée attendue du client |
| `P7-04` — Espace entreprise : états financiers réglementaires (bilan, compte de résultat, TVA, amortissements, stocks) | Oui | Bloqué | — | Bloqué : décision ou donnée attendue du client |
| `P7-05` — Diaspora et commerce international | Oui | Bloqué | — | Bloqué : décision ou donnée attendue du client |
| `P8-01` — Moteur budgétaire unique : décisions de cadrage | Oui | Oui | Suite automatisée verte |  |
| `P8-02` — Une application dans sa propre fenêtre, distincte de la vitrine, avec la navigation finale | Oui | Oui | Suite automatisée verte |  |
| `P8-03` — Lot 0 : comptes, transactions, transferts et anti-doublon | Oui | Oui | Suite automatisée verte |  |
| `P8-04` — Corriger dès maintenant les calculs faux (diagnostic n°2) | Oui | Oui | Suite automatisée verte |  |
| `P8-05` — Mes comptes | Oui | Oui | Suite automatisée verte |  |
| `P8-06` — Accueil centralisé, le même pour tous | Oui | Oui | Suite automatisée verte |  |
| `P8-07` — Mouvements : revenus, dépenses, transferts et pointage | Oui | Oui | Suite automatisée verte |  |
| `P8-08` — Catégories universelles | Oui | Oui | Suite automatisée verte |  |
| `P8-09` — Budgets : une allocation, rattachée automatiquement, et des méthodes facultatives | Oui | Oui | Suite automatisée verte |  |
| `P8-10` — Synthèse, rapport mensuel et téléchargement | Oui | Oui | Suite automatisée verte |  |
| `P8-11` — Calendrier financier : trois onglets et revenus à confirmer | Oui | Oui | Suite automatisée verte |  |
| `P8-12` — Objectifs & sécurité : un seul compartiment, et des objectifs qui simulent | Oui | Oui | Suite automatisée verte |  |
| `P8-13` — Dettes et créances | Oui | Oui | Suite automatisée verte |  |
| `P8-14` — Patrimoine réel et portefeuille fictif | Oui | Oui | Suite automatisée verte |  |
| `P8-15` — Outils : un seul catalogue | Oui | Non | — | Non commencé |
| `P8-16` — Santé financière : une page à part entière | Oui | Oui | Suite automatisée verte |  |
| `P8-17` — Formation, progression et certificats : la seule couche qui varie selon le profil | Oui | En cours | — |  |
| `P8-18` — Alertes et états du moteur personnel | Oui | Oui | Suite automatisée verte |  |
| `P8-19` — Recherche et assistant adaptés au moteur unique | Oui | Non | — | Non commencé |
| `P8-20` — Paramètres : données et confiance | Oui | Non | — | Non commencé |
| `P8-21` — Contrôles du client et règle « trouvable » | Oui | Oui | Suite automatisée verte |  |
| `P8-23` — Premiers pas : le parcours de premier démarrage (P0 à P7) | Oui | Non | — | Non commencé |
| `P8-24` — Reliquats des écrans livrés le 2026-10-27 | Oui | Non | — | Non commencé |
| `P8-25` — Une adresse propre pour chaque écran regroupé | Oui | Non | — | Non commencé |
| `P8-26` — Réponses du client du 2026-10-28 : corriger ce qui est déjà livré | Oui | Oui | Suite automatisée verte |  |
| `P8-27` — Retours du client du 2026-10-28 : couleurs des catégories et des flux, et les 3 suggestions | Oui | Oui | Suite automatisée verte |  |
| `P8-28` — Comparateurs et produits bancaires : affichage, rubriques vides, fiches du référentiel | Oui | Oui | Suite automatisée verte |  |
| `P8-29` — Vitrine, compartiments et parcours de formation : refonte | Oui | Bloqué | — | Bloqué : décision ou donnée attendue du client |
| `P8-22` — Moteur budgétaire unique : validation de fin de phase | Oui | Non | — | Non commencé |
| `P9-01` — Gestion commune : décisions de cadrage | Oui | Oui | Suite automatisée verte |  |
| `P9-02` — Gestion commune : une solution à part, une adresse par espace, un tableau de bord d'espace | Oui | Non | — | Non commencé |
| `P9-03` — Espace « groupe / amis » et espace temporaire | Oui | Non | — | Non commencé |
| `P9-04` — Dépenses partagées : champs et règles manquants | Oui | Non | — | Non commencé |
| `P9-05` — Budgets communs par catégorie | Oui | Non | — | Non commencé |
| `P9-06` — Gestion des tâches | Oui | Non | — | Non commencé |
| `P9-07` — Calendrier collectif unifié | Oui | Non | — | Non commencé |
| `P9-08` — Lien sans doublon vers le budget personnel | Oui | Non | — | Non commencé |
| `P9-09` — Alertes, activité récente et contribution requise | Oui | Non | — | Non commencé |
| `P9-10` — Rapports et export d'un espace | Oui | Non | — | Non commencé |
| `P9-11` — Formules collectives : un moteur collectif, sans doublon | Oui | Non | — | Non commencé |
| `P9-12` — Contrôles du client et règle « trouvable » | Oui | Non | — | Non commencé |
| `P9-13` — Gestion commune : validation de fin de phase | Oui | Non | — | Non commencé |

## Réserves, en clair

Ces livrables ne sont pas en retard : ils attendent une information que seul le client détient. Les lister ici évite qu'ils soient lus comme des anomalies à la recette.

- `P3-08` — Paiement : décisions à préciser (recherches à mener par le client)
- `P6-01` — FINCLUDIA : décisions de cadrage à obtenir du client
- `P7-01` — ERP entreprises, diaspora et commerce international
- `P7-03` — Espace entreprise : déclinaison par segment (PME/PMI, start-up, micro-entreprise, auto-entrepreneur, micro-importateur, profession libérale)
- `P7-04` — Espace entreprise : états financiers réglementaires (bilan, compte de résultat, TVA, amortissements, stocks)
- `P7-05` — Diaspora et commerce international
- `P8-29` — Vitrine, compartiments et parcours de formation : refonte


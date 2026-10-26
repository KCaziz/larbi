# Matrice des livrables et recette

> Généré le 2026-10-26 par `node server/scripts/generate-deliverables.js` depuis `TASKS.md` et `server/tests/`. Ne pas modifier à la main.

Livrable de l'**annexe 2** du contrat, dont le tableau est fourni vide (livrable / prévu / livré / test / réserve).

La colonne « Test / résultat » renvoie à la suite automatisée : `npm test` dans `server/`. La colonne « Réserve » reprend ce que le plan déclare bloqué, sans l'adoucir — l'article 7 distingue les anomalies bloquantes, majeures et mineures, et une donnée que le client doit fournir n'est aucune des trois : c'est une réserve.

**81 livrables sur 114** sont terminés et vérifiés. **9** sont bloqués par une décision ou une donnée du client.

Suite de tests : 128 fichiers (consistency : 2, e2e : 24, functional : 34, security : 38, unit : 30).

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
| `P6-24` — FINCLUDIA : comptes financiers multiples et coordination des opérations | Oui | Bloqué | — | Bloqué : décision ou donnée attendue du client |
| `P6-21` — FINCLUDIA : validation de fin de phase | Oui | Oui | Suite automatisée verte |  |
| `P7-01` — ERP entreprises, diaspora et commerce international | Oui | Bloqué | — | Bloqué : décision ou donnée attendue du client |
| `P7-02` — Espace entreprise : socle de trésorerie (tiers, ventes, achats, règlements) | Oui | Oui | Suite automatisée verte |  |
| `P7-03` — Espace entreprise : déclinaison par segment (PME/PMI, start-up, micro-entreprise, auto-entrepreneur, micro-importateur, profession libérale) | Oui | Bloqué | — | Bloqué : décision ou donnée attendue du client |
| `P7-04` — Espace entreprise : états financiers réglementaires (bilan, compte de résultat, TVA, amortissements, stocks) | Oui | Bloqué | — | Bloqué : décision ou donnée attendue du client |
| `P7-05` — Diaspora et commerce international | Oui | Bloqué | — | Bloqué : décision ou donnée attendue du client |
| `P8-01` — Restructuration : décisions à obtenir du client | Oui | Bloqué | — | Bloqué : décision ou donnée attendue du client |
| `P8-02` — Hub « Mes solutions » et page d'arrivée après connexion | Oui | Non | — | Non commencé |
| `P8-03` — Navigation propre à chaque solution | Oui | Non | — | Non commencé |
| `P8-04` — Solution Formation : page d'entrée et tableau de bord dédiés | Oui | Non | — | Non commencé |
| `P8-05` — Solution Gestion budgétaire : entrée, tableau de bord unique et compartiments visibles pour tous | Oui | Non | — | Non commencé |
| `P8-06` — Gestion budgétaire : intégration du cahier des charges révisé (à recevoir) | Oui | Bloqué | — | Bloqué : décision ou donnée attendue du client |
| `P8-07` — Personas repensés : une lentille d'adaptation, plus une barrière | Oui | Non | — | Non commencé |
| `P8-08` — Solution Gestion collective : page d'entrée, une adresse par espace, tableau de bord d'espace | Oui | Non | — | Non commencé |
| `P8-09` — Collectif : espace « groupe / amis » et espace temporaire | Oui | Non | — | Non commencé |
| `P8-10` — Collectif : dépenses partagées — champs et règles manquants | Oui | Non | — | Non commencé |
| `P8-11` — Collectif : budgets communs par catégorie | Oui | Non | — | Non commencé |
| `P8-12` — Collectif : gestion des tâches | Oui | Non | — | Non commencé |
| `P8-13` — Collectif : calendrier unifié | Oui | Non | — | Non commencé |
| `P8-14` — Collectif : lien sans doublon vers le budget personnel | Oui | Non | — | Non commencé |
| `P8-15` — Collectif : alertes, activité récente et contribution requise | Oui | Non | — | Non commencé |
| `P8-16` — Collectif : rapports et export | Oui | Non | — | Non commencé |
| `P8-17` — Formules collectives : correspondance avec le moteur existant | Oui | Non | — | Non commencé |
| `P8-18` — « Terminé » veut dire « trouvable » : contrôles et parcours depuis le menu | Oui | Non | — | Non commencé |
| `P8-19` — Restructuration : validation de fin de phase | Oui | Non | — | Non commencé |

## Réserves, en clair

Ces livrables ne sont pas en retard : ils attendent une information que seul le client détient. Les lister ici évite qu'ils soient lus comme des anomalies à la recette.

- `P3-08` — Paiement : décisions à préciser (recherches à mener par le client)
- `P6-01` — FINCLUDIA : décisions de cadrage à obtenir du client
- `P6-24` — FINCLUDIA : comptes financiers multiples et coordination des opérations
- `P7-01` — ERP entreprises, diaspora et commerce international
- `P7-03` — Espace entreprise : déclinaison par segment (PME/PMI, start-up, micro-entreprise, auto-entrepreneur, micro-importateur, profession libérale)
- `P7-04` — Espace entreprise : états financiers réglementaires (bilan, compte de résultat, TVA, amortissements, stocks)
- `P7-05` — Diaspora et commerce international
- `P8-01` — Restructuration : décisions à obtenir du client
- `P8-06` — Gestion budgétaire : intégration du cahier des charges révisé (à recevoir)


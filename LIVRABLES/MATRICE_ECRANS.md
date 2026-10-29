# Matrice des écrans de la gestion budgétaire

> Généré le 2026-10-29 par `node server/scripts/generate-deliverables.js` depuis `server/src/constants/finAppScreens.js`. Ne pas modifier à la main.

Les 44 écrans du cahier consolidé (onglet `05_Ecrans_Detailles`) et la façon dont chacun est servi. La règle « trouvable » (TASKS.md, section 6) veut que chaque écran ait **sa propre adresse**, atteinte depuis le menu en deux clics au plus : un écran regroupé dans une autre page n'est donc pas terminé, et la tâche qui le doit est nommée.

**39 écrans sur 44** ont leur propre page ; 3 sont regroupés dans une autre ; 2 vivent dans la barre supérieure ; 0 ne sont pas encore servis.

| Code | Écran | Menu du client | Servi | Adresse | Premier clic | Tâche |
|---|---|---|---|---|---|---|
| AUTH-01 | Connexion / création de compte | Entrée | Sa propre page | `/connexion` | — | — |
| ONB-01 | Profil éducatif | Premier démarrage | Regroupé dans une autre page | `/app/parametres/premiers-pas` | `/app/parametres/premiers-pas` | `P8-23` |
| ONB-02 | Premier revenu | Premier démarrage | Regroupé dans une autre page | `/app/parametres/premiers-pas` | `/app/parametres/premiers-pas` | `P8-23` |
| ACC-01 | Accueil | Accueil | Sa propre page | `/app` | `/app` | — |
| ACC-02 | Ajouter rapidement | Accueil | Regroupé dans une autre page | `/app/mouvements` | `/app` | `P8-24` |
| COM-01 | Mes comptes | Mes comptes | Sa propre page | `/app/comptes` | `/app/comptes` | — |
| COM-02 | Créer / modifier un compte | Mes comptes | Sa propre page | `/app/comptes/nouveau` | `/app/comptes` | — |
| COM-03 | Détail compte | Mes comptes | Sa propre page | `/app/comptes/:id` | `/app/comptes` | — |
| COM-04 | Nouveau transfert | Mes comptes | Sa propre page | `/app/comptes/transfert` | `/app/comptes` | — |
| TRX-01 | Revenus / Dépenses / Transferts | Accueil > mouvements | Sa propre page | `/app/mouvements` | `/app/mouvements` | — |
| TRX-02 | Ajouter un revenu ou une dépense | Mouvements | Sa propre page | `/app/mouvements/nouveau` | `/app/mouvements` | — |
| TRX-03 | Détail / modifier transaction | Mouvements | Sa propre page | `/app/mouvements/:id` | `/app/mouvements` | — |
| TRX-04 | Pointage des achats et transactions | Mouvements | Sa propre page | `/app/mouvements/pointage` | `/app/mouvements` | — |
| BUD-01 | Mes budgets | Accueil > budgets | Sa propre page | `/app/budgets` | `/app/budgets` | — |
| BUD-02 | Créer / modifier budget | Budgets | Sa propre page | `/app/budgets/nouveau` | `/app/budgets` | — |
| BUD-03 | Détail budget | Budgets | Sa propre page | `/app/budgets/:id` | `/app/budgets` | — |
| BUD-04 | Analyse selon méthode | Budgets | Sa propre page | `/app/budgets/:id/methode` | `/app/budgets` | — |
| SYN-01 | Synthèse | Synthèse | Sa propre page | `/app/synthese` | `/app/synthese` | — |
| SYN-02 | Rapport mensuel | Synthèse | Sa propre page | `/app/synthese/rapport/:mois` | `/app/synthese` | — |
| CAL-01 | Calendrier financier | Calendrier | Sa propre page | `/app/calendrier` | `/app/calendrier` | — |
| CAL-02 | Paiement / revenu régulier | Calendrier | Sa propre page | `/app/calendrier/regulier` | `/app/calendrier` | — |
| OBJ-01 | Objectifs & sécurité | Objectifs | Sa propre page | `/app/objectifs` | `/app/objectifs` | — |
| OBJ-02 | Créer objectif | Objectifs | Sa propre page | `/app/objectifs/nouveau` | `/app/objectifs` | — |
| OBJ-03 | Détail objectif | Objectifs | Sa propre page | `/app/objectifs/:id` | `/app/objectifs` | — |
| OBJ-04 | Fonds d’urgence | Objectifs & sécurité | Sa propre page | `/app/objectifs/fonds-urgence` | `/app/objectifs` | — |
| DET-01 | Mes dettes | Dettes | Sa propre page | `/app/dettes` | `/app/dettes` | — |
| DET-02 | J’ai prêté | Dettes | Sa propre page | `/app/dettes/pret` | `/app/dettes` | — |
| DET-03 | On m’a prêté — dette simple | Dettes | Sa propre page | `/app/dettes/emprunt` | `/app/dettes` | — |
| DET-04 | Dette bancaire / carte | Dettes | Sa propre page | `/app/dettes/nouvelle` | `/app/dettes` | — |
| DET-05 | Stratégies de remboursement | Dettes | Sa propre page | `/app/dettes/strategies` | `/app/dettes` | — |
| PAT-01 | Patrimoine réel | Patrimoine | Sa propre page | `/app/patrimoine` | `/app/patrimoine` | — |
| PAT-02 | Détail actif réel | Patrimoine | Sa propre page | `/app/patrimoine/:id` | `/app/patrimoine` | — |
| PF-01 | Portefeuille fictif | Portefeuille fictif | Sa propre page | `/app/portefeuille` | `/app/portefeuille` | — |
| OUT-01 | Outils | Outils | Sa propre page | `/app/outils` | `/app/outils` | — |
| OUT-02 | Atelier de simulation | Outils | Sa propre page | `/app/outils/atelier` | `/app/outils` | — |
| HEA-01 | Indice de santé financière | Santé financière | Sa propre page | `/app/sante` | `/app/sante` | — |
| FOR-01 | Formation | Formation | Sa propre page | `/app/formation` | `/app/formation` | — |
| FOR-02 | Progression | Progression | Sa propre page | `/app/progression` | `/app/progression` | — |
| FOR-03 | Certificats | Certificats | Sa propre page | `/app/certificats` | `/app/certificats` | — |
| REP-01 | Rapports & téléchargement | Synthèse | Sa propre page | `/app/synthese/rapports` | `/app/synthese` | — |
| SEA-01 | Recherche globale | Barre supérieure | Barre supérieure | — | — | — |
| NOT-01 | Notifications | Barre supérieure | Sa propre page | `/app/notifications` | — | — |
| DATA-01 | Données & confiance | Paramètres | Sa propre page | `/app/parametres/confiance` | `/app/parametres/confiance` | — |
| CHAT-01 | Aide FINCLUDIA | Aide | Barre supérieure | — | — | — |

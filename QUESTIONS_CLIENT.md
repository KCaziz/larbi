# FINCLUDIA, espace entreprise : questions à valider

Version du 24/11/2026.

La paie et la comptabilité sont maintenant construites, avec des **valeurs par défaut**. Tant qu'une valeur n'est pas confirmée, l'application l'affiche comme « provisoire » :
- chaque bulletin de paie s'imprime comme brouillon ;
- chaque état comptable porte la mention « non certifié ».

Pour chaque question, il suffit de répondre « d'accord » ou de donner la bonne valeur, avec sa date d'application et, si possible, le texte officiel. Les valeurs chiffrées se confirment aussi directement dans l'administration, fenêtre « Valeurs réglementaires à confirmer ».

---

## 1. Paie

### 1.1 Barèmes (à confirmer dans la fenêtre de l'administration)

| # | Valeur | Ce que l'application applique aujourd'hui | Source utilisée |
|---|---|---|---|
| P1 | Salaire national minimum garanti | 24 000 DA par mois | Décret présidentiel 26-01 du 07/01/2026 |
| P2 | Cotisations sociales du salarié | 9 % | Décret exécutif 15-236 du 16/09/2015 |
| P3 | Cotisations sociales de l'employeur | 25 % | Décret exécutif 15-236 |
| P4 | Œuvres sociales | 0,5 % | Décret exécutif 15-236 |
| P5 | Barème mensuel de l'IRG sur salaires | voir 1.2 | Page IRG traitements et salaires de la DGI (consultée le 12/10/2026) |
| P6 | Échéances des déclarations | voir 1.4 | DGI et CNAS |

Un texte plus récent que le décret 15-236 modifie-t-il ces taux ?

### 1.2 Calcul de l'IRG appliqué par défaut

- Revenu imposable = brut − cotisations salariales, **arrondi à la dizaine de dinars inférieure**.
- Barème mensuel : 0 % jusqu'à 20 000 DA, 23 % jusqu'à 40 000, 27 % jusqu'à 80 000, 30 % jusqu'à 160 000, 33 % jusqu'à 320 000, 35 % au-delà.
- Abattement de 40 % sur l'impôt, au minimum 1 000 DA et au maximum 1 500 DA par mois.
- Exonération totale jusqu'à 30 000 DA imposables.
- Entre 30 000 et 35 000 DA : impôt après abattement × 137/51 − 27 925/8.

Exemple de contrôle : 40 000 DA imposables donnent 3 100 DA d'IRG.

**Questions :**
- **Q1.** Ce calcul est-il juste, et à partir de quelle date ?
- **Q2.** Faut-il gérer les régimes particuliers, par exemple :
  - les travailleurs handicapés ;
  - les retraités qui reprennent une activité ;
  - les exonérations liées au Sud ou aux dispositifs d'aide à l'emploi (contrats aidés, apprentis) ?
  Si oui, lesquels, avec quels plafonds ?
- **Q3.** Les primes versées pour plusieurs mois (rendement trimestriel, 13e mois, rappels) doivent-elles être imposées à part, au taux de 10 % ? Aujourd'hui, elles sont ajoutées au mois de versement.

### 1.3 Éléments du bulletin

- **Q4. Heures supplémentaires.** Aujourd'hui, la personne saisit le montant. Faut-il plutôt saisir les heures et laisser l'application calculer la majoration ? Si oui, avec quels taux (50 % minimum légal, plus pour les nuits et jours fériés) ?
- **Q5. Absence non payée.** Elle est retenue à raison de 1/30 du salaire de base par jour. Faut-il plutôt 1/22, 1/26 ou un taux horaire sur 173,33 heures ?
- **Q6. Entrée ou sortie en cours de mois.** Le salaire est proratisé sur les jours calendaires de présence. Est-ce la bonne règle ?
- **Q7. Indemnités non soumises à cotisations** (panier, transport…). Elles restent imposables à l'IRG. Est-ce juste ?
  - Quelle liste d'indemnités faut-il proposer ?
  - Certaines sont-elles exonérées des deux, cotisations et IRG ?
- **Q8. Primes calculées.** Prime d'ancienneté (IEP), de rendement, de nuisance, d'astreinte : faut-il les calculer (sur quelle base) ou les saisir comme montants ?
- **Q9. Mentions du bulletin.** Quelles mentions obligatoires faut-il ajouter ? Par exemple :
  - numéro de sécurité sociale du salarié ;
  - numéro d'employeur CNAS ;
  - catégorie et échelon ;
  - congés acquis et pris.

### 1.4 Déclarations et remise des bulletins

- **Q10. Échéances appliquées.** L'application calcule ces dates par défaut :
  - l'IRG retenu est versé avant le 20 du mois suivant ;
  - les cotisations sociales sont versées dans les 30 jours après le mois, ou après le trimestre pour les employeurs de moins de 10 salariés.
  Ces dates sont-elles justes ?
- **Q11. Déclaration annuelle des salaires.** Faut-il préparer un fichier pour la déclaration annuelle des salaires (CNAS) ou pour l'état annuel de l'IRG ? Si oui, dans quel format ?
- **Q12. Remise des bulletins.** Aujourd'hui, le bulletin s'imprime ou s'enregistre en PDF. Le classeur parle de « mise à disposition sécurisée ».
  - Les salariés doivent-ils avoir leur propre accès à FINCLUDIA pour consulter leurs bulletins ?
  - Une signature est-elle requise ?
- **Q13. Gérant non salarié.** Les cotisations CASNOS du gérant non salarié doivent-elles apparaître dans la paie ou ailleurs ?
- **Q14. Validation du lot de paie.** Elle est faite par une autre personne que celle qui l'a préparé. Peuvent valider le titulaire, le responsable RH et le responsable financier. Est-ce la bonne répartition ?

---

## 2. Comptabilité

### 2.1 Plan de comptes et écritures automatiques

- **Q15. Plan de comptes.** Le plan par défaut reprend environ 100 comptes principaux du SCF, classes 1 à 7. Chaque organisation peut ajouter des sous-comptes, par exemple 4111 sous 411.
  - Ce plan convient-il ?
  - Faut-il un plan allégé pour les micro-entreprises (comptabilité de trésorerie, système simplifié des petites entités) ?
- **Q16. Comptes des écritures proposées automatiquement.** Validez-les ou corrigez-les. Elles sont proposées à partir des factures, avoirs, règlements et paies :
  - ventes → **700**. Faut-il 706 pour les prestations de services, 701 pour les produits finis ?
  - clients **411**, fournisseurs **401** ;
  - TVA collectée **4457**, TVA déductible **4456** ;
  - banque **512**, caisse **530** (un règlement en espèces va en caisse) ;
  - paie :
    - débit : 631 (brut) et 635 (charges patronales) ;
    - crédit : 431 (cotisations), 442 (IRG retenu), 425 (avances) et 421 (net à payer) ;
  - achats, selon la famille de dépense :
    - marchandises 600, matières 601, sous-traitance 611 ;
    - loyer 613, entretien 615, assurance 616 ;
    - honoraires 622, publicité 623, transport 624, télécommunications 626, banque 627 ;
    - énergie et équipement 607 ;
    - impôts et taxes 645 ;
    - autres 628.
- **Q17. Achat d'équipement.** Il est compté en charge (607) par défaut. Faut-il plutôt l'immobiliser (classe 2) au-delà d'un seuil ? Si oui, lequel ?
- **Q18. Journaux et numérotation.**
  - Journaux proposés : Ventes, Achats, Banque, Caisse, Paie, Opérations diverses, À-nouveaux.
  - Une pièce non numérotée reçoit un numéro de la forme journal-année-numéro, par exemple VT-2026-0001.
  Faut-il d'autres journaux, ou une autre numérotation ?

### 2.2 Validation, clôture et états

- **Q19. Validation des écritures.** Une écriture validée ne se modifie plus ; elle se corrige par une écriture inverse. La validation est faite par une seule personne. Faut-il un double contrôle, comme pour la paie ?
- **Q20. Clôture.** Elle se fait aujourd'hui mois par mois ; un mois se rouvre seulement avec un motif. Faut-il aussi la clôture annuelle automatique (report des soldes en à-nouveaux, affectation du résultat) ? Quel exercice : l'année civile ?
- **Q21. Présentation des états.**
  - Aujourd'hui, l'application montre un bilan et un compte de résultat simplifiés par classe de comptes, sans certification.
  - Pour produire les états officiels du SCF, il faut la table qui rattache chaque compte à chaque poste :
    - bilan actif et passif ;
    - compte de résultat par nature ;
    - tableau des flux de trésorerie.
  - Pouvez-vous la fournir, ou valider qu'une présentation simplifiée suffit ?
- **Q22. Amortissements et stocks.** Ils ne sont pas encore calculés. Il faut :
  - les durées et méthodes d'amortissement admises ;
  - la méthode de valorisation des stocks (coût moyen pondéré ou premier entré, premier sorti).

### 2.3 Import et rapprochement

- **Q23. Format d'import.** Les écritures s'importent en CSV (journal ; pièce ; date ; compte ; libellé ; débit ; crédit). Le plan de comptes d'un autre logiciel s'importe aussi en CSV (code ; libellé), puis chaque compte est rattaché à un compte du plan.
  - Quels logiciels vos clients utilisent-ils (PC Compta, Sage…) ?
  - Faut-il lire directement leurs exports, ou des fichiers Excel ?
- **Q24. Relevés bancaires.** Aujourd'hui, le rapprochement compare le solde du relevé saisi au solde comptable, et garde l'écart avec son explication. Faut-il importer les relevés ligne par ligne et pointer chaque opération (lettrage) ? Si oui, dans quel format les banques les fournissent-elles ?
- **Q25. Accès du comptable externe.** Le comptable externe accède à la comptabilité seulement avec un mandat « finance » en cours. Est-ce suffisant ?

---

## 3. Valeurs réglementaires déjà en attente

Ces valeurs de votre référentiel sont toujours à confirmer dans la même fenêtre de l'administration. Sans confirmation, l'application affiche « règle non publiée » au lieu d'un montant :
- IFU de l'auto-entrepreneur : taux (0,5 % proposé) et plafond de chiffre d'affaires (5 000 000 DA proposés) ;
- taux de TVA applicables ;
- cotisations CASNOS et CNAS ;
- calendrier des obligations fiscales et sociales ;
- micro-importation :
  - activités admises ;
  - conditions du statut ;
  - limites en nombre d'opérations et en valeur ;
- nomenclature douanière, tarifs et assiette des droits.

**Q26.** Qui, chez vous, signe ces valeurs, et à quelle fréquence faut-il les revoir ?

---

## 4. Modules encore à cadrer

- **Q27. Personnel.** Le registre du personnel, les absences et les indicateurs sont faits. Faut-il aussi construire, dans la première livraison :
  - les feuilles de temps ;
  - les compétences ;
  - le plan de formation ;
  - le recrutement ?
- **Q28. Espace des partenaires et institutions.** Votre référentiel prévoit un espace propre (portefeuille de dossiers, cohortes, licences). Il faut préciser :
  - qui sont ces partenaires ;
  - s'ils ont un compte dans FINCLUDIA ;
  - ce qu'ils voient ;
  - comment ils sont facturés.
- **Q29. Financement participatif.** Quels rapports réglementaires faut-il produire pour les plateformes (COSOB) ? Merci de fournir le modèle et les règles. Aujourd'hui, seule la préparation de campagne existe : FINCLUDIA ne collecte rien.
- **Q30. Offres des partenaires.**
  - Qui saisit et revalide ces offres ?
  - À quelle fréquence ?
  - Au bout de combien de temps une offre non revérifiée doit-elle disparaître ?

---

## 5. Autres choix faits par défaut, à valider

- **Q31. Numérotation des factures.** Aujourd'hui : FAC-2026-0001, DEV-… pour les devis, AV-… pour les avoirs, une suite par année. Cette numérotation respecte-t-elle vos obligations ? Faut-il une série par établissement ?
- **Q32. Familles de dépenses des achats.** Une liste de 17 familles a été établie, de « marchandises » à « autre ». Correspond-elle à ce que vos utilisateurs attendent ?
- **Q33. Cours des devises.** L'administration tient déjà les cours officiels de la Banque d'Algérie. Faut-il les proposer par défaut dans l'import-export et la diaspora ? Aujourd'hui, la personne saisit le cours à chaque coût en devise.

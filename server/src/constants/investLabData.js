// P13-01 (2026-11-25) — InvestLab: the client's market data 2020–2026, GENERATED
// from « FINCLUDIA_Portefeuille.docx » (2026-11-21) by a script; do not edit by hand,
// regenerate. Values are the document's, as published: N/C and « — » stay null
// (never 0), 2026 is year-to-date (17/11/2026). Sources: `sources` (S01 to S25).
export const INVESTLAB = {
 "sections": [
  {
   "id": "intro",
   "title": "",
   "level": 0,
   "blocks": [
    {
     "type": "para",
     "text": "FINCLUDIA"
    },
    {
     "type": "para",
     "text": "2020–2026"
    },
    {
     "type": "para",
     "text": "Actions & dividendes • DZAIRINDEX • OAT/BTA/BTC • obligations privées • sukuk • épargne/DAT • comptes devises • finance islamique • inflation • or/argent/platine • immobilier • backtest 10 000 DZD"
    },
    {
     "type": "table",
     "rows": [
      [
       "Bloc",
       "Contenu désormais renseigné",
       "Décision canonique"
      ],
      [
       "Actions",
       "Cours annuels 2020–2026, dividendes par exercice, rendement dividende, corporate actions, courbes",
       "Total return = prix ajusté + dividendes + corporate actions"
      ],
      [
       "Indice",
       "DZAIRINDEX 2020–2026",
       "Indice prix; ne pas le présenter comme total return"
      ],
      [
       "Dette souveraine",
       "BTC/BTA/OAT expliqués, courbe de taux 2024, 45 OAT, snapshot 17/11/2026",
       "Chaque ISIN est un actif distinct"
      ],
      [
       "Comptes devises",
       "10 devises, tenors publiés, grilles de référence 2020–2026",
       "Règles BA + taux trimestriels; change séparé"
      ],
      [
       "Épargne / DAT",
       "BNA/BEA/BDL/CPA/AGB documentés",
       "Historique de produit versionné; aucun taux actuel rétroprojeté"
      ],
      [
       "Finance islamique",
       "CPA, CNEP, BEA, BDL, Al Baraka, AGB + mécanismes BNA/BADR",
       "Profit-share ≠ rendement garanti"
      ],
      [
       "Métaux",
       "Or, argent, platine + FX DZD",
       "Performance métal × effet FX"
      ],
      [
       "Backtest",
       "10 000 DZD fin 2020 → 17/11/2026",
       "Brut, sans fiscalité/frais; hypothèses explicites"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Point clé : la faible liquidité de la Bourse d’Alger impose de conserver la date du dernier échange. NC ne signifie jamais 0 DZD. Pour Alliance Assurances, les attributions gratuites 3/5 en 2020 et 1/2 en 2025 doivent ajuster les quantités dans tout backtest."
    },
    {
     "type": "para",
     "text": "Sources : S01 SGBV, S02 COSOB 2020–2024, S03 Banque d’Algérie, S04 ONS, S05 Banque mondiale"
    }
   ]
  },
  {
   "id": "1-m-thodologie-hi-rarchie-des-sources-et",
   "title": "1. Méthodologie, hiérarchie des sources et règles de vérité",
   "level": 1,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Grade",
       "Source",
       "Usage"
      ],
      [
       "A",
       "SGBV / COSOB / Banque d’Algérie / ONS / Trésor",
       "Source primaire ou régulateur"
      ],
      [
       "B",
       "Banque émettrice / rapports audités / conditions tarifaires",
       "Produit bancaire ou islamique"
      ],
      [
       "C",
       "Calcul FINCLUDIA à partir de A/B",
       "Doit stocker formule et inputs"
      ],
      [
       "D",
       "Donnée utilisateur / expertise",
       "Immobilier/privé; jamais présentée comme marché officiel"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Une valeur non publiée n’est jamais inventée. “Non publié publiquement” est une valeur d’état valide."
    },
    {
     "type": "para",
     "text": "2026 est YTD. Un taux glissant d’inflation 2026 n’est pas une inflation annuelle civile définitive."
    },
    {
     "type": "para",
     "text": "Pour les actions, une clôture, une moyenne pondérée, un dernier échange et un cours de référence sont des types d’observation différents."
    },
    {
     "type": "para",
     "text": "Pour les instruments de dette, coupon et rendement à maturité ne sont pas la même chose."
    },
    {
     "type": "para",
     "text": "Pour la finance islamique, clé de partage, profit cible et profit effectivement distribué sont trois champs séparés."
    }
   ]
  },
  {
   "id": "2-univers-d-investissement-fincludia",
   "title": "2. Univers d’investissement FINCLUDIA",
   "level": 1,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Famille",
       "Instruments / benchmarks",
       "Valorisation"
      ],
      [
       "Liquidités",
       "Cash DZD / devises",
       "Nominal + inflation en comparaison"
      ],
      [
       "Actions Algérie",
       "Principal + croissance + actifs radiés historiques",
       "SGBV, dernier prix valide + corporate actions"
      ],
      [
       "Indice",
       "DZAIRINDEX",
       "Points / base 100"
      ],
      [
       "Dette privée",
       "AL30, ML30, TS30, RX33",
       "Prix % + coupon / flux contractuels"
      ],
      [
       "Dette souveraine",
       "BTC, BTA, OAT",
       "Rendement primaire/secondaire; prix par ISIN"
      ],
      [
       "Sukuk",
       "SK32 Ijara",
       "Prix + loyer/distribution"
      ],
      [
       "Épargne DZD",
       "Livrets",
       "Taux produit versionné"
      ],
      [
       "DAT/BDC",
       "Placements à terme",
       "Taux, durée, montant, fiscalité"
      ],
      [
       "Comptes devises",
       "USD, EUR, GBP, CHF, JPY, CAD, DKK, NOK, SEK, SAR",
       "Taux BA + FX"
      ],
      [
       "Finance islamique",
       "Moudaraba / dépôts participatifs",
       "Profit réalisé × clé de partage"
      ],
      [
       "Métaux",
       "Or, argent, platine",
       "USD/toz × USD/DZD"
      ],
      [
       "Immobilier",
       "Logement, terrain, local",
       "Valeur déclarée/expertise + loyers nets"
      ]
     ]
    }
   ]
  },
  {
   "id": "2-1-d-cisions-structurantes-de-l-univers",
   "title": "2.1 Décisions structurantes de l’univers",
   "level": 2,
   "blocks": [
    {
     "type": "para",
     "text": "Chaque classe d’actif dispose de son propre moteur de revenus : dividende, coupon, loyer sukuk, intérêt conventionnel, profit islamique ou loyer immobilier."
    },
    {
     "type": "para",
     "text": "Un benchmark peut être affiché même s’il n’est pas directement investissable; il reçoit alors le statut benchmark_only."
    },
    {
     "type": "para",
     "text": "Les actifs cotés utilisent un dernier prix valide daté; les actifs non cotés utilisent une valorisation déclarée ou expertisée distincte."
    },
    {
     "type": "para",
     "text": "Les performances comparatives sont affichées en DZD, en devise d’origine, en base 100 et en rendement réel après inflation."
    },
    {
     "type": "para",
     "text": "Le portefeuille fictif reste séparé du patrimoine réel, du score de santé financière et de toute décision de crédit."
    }
   ]
  },
  {
   "id": "3-bourse-d-alger-univers-cot-au-17-novem",
   "title": "3. Bourse d’Alger — univers coté au 17 novembre 2026",
   "level": 1,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Comp.",
       "Ticker",
       "Société",
       "Secteur",
       "ISIN / notice",
       "Cours DZD",
       "Rendement div. courant"
      ],
      [
       "Principal",
       "ALL",
       "Alliance Assurances",
       "Assurance",
       "DZ0000010037",
       "360",
       "7,22 %"
      ],
      [
       "Principal",
       "AYRD",
       "Ayrade",
       "Technologies",
       "Voir notice SGBV 2026",
       "830",
       "—"
      ],
      [
       "Principal",
       "BDL",
       "Banque de Développement Local",
       "Banque",
       "DZ0000010086",
       "1 400",
       "7,64 %"
      ],
      [
       "Principal",
       "BIO",
       "Biopharm",
       "Pharmaceutique",
       "DZ0000010052",
       "2 402",
       "7,08 %"
      ],
      [
       "Principal",
       "CPA",
       "Crédit Populaire d’Algérie",
       "Banque",
       "DZ0000010078",
       "1 994",
       "8,78 %"
      ],
      [
       "Principal",
       "AUR",
       "EGH El Aurassi",
       "Hôtellerie",
       "DZ0000010045",
       "344",
       "—"
      ],
      [
       "Principal",
       "SAI",
       "Saidal",
       "Pharmaceutique",
       "DZ0000010011",
       "450",
       "7,78 %"
      ],
      [
       "Croissance",
       "AOM",
       "AOM Invest",
       "Tourisme",
       "DZ0000010060",
       "290",
       "—"
      ],
      [
       "Croissance",
       "CREX",
       "CRAPC Expertise",
       "Expertise / R&D",
       "Voir notice SGBV 2026",
       "1 600",
       "—"
      ],
      [
       "Croissance",
       "MST",
       "Moustachir",
       "Conseil",
       "DZ0000010094",
       "725",
       "—"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Les rendements courants SGBV disponibles le 17/11/2026 sont notamment : ALL 7,22 %, BDL 7,64 %, BIO 7,08 %, CPA 8,78 % et SAI 7,78 %. AUR et AYRD n’affichent pas de rendement courant. Le rendement courant est un indicateur spot, pas le rendement total historique."
    },
    {
     "type": "para",
     "text": "Sources : S01"
    }
   ]
  },
  {
   "id": "3-1-cours-annuels-ytd-et-courbes-de-chaq",
   "title": "3.1 Cours annuels / YTD et courbes de chaque action",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Ticker",
       "2020",
       "2021",
       "2022",
       "2023",
       "2024",
       "2025",
       "2026"
      ],
      [
       "ALL",
       "240",
       "300",
       "403",
       "440",
       "420",
       "330",
       "360"
      ],
      [
       "AUR",
       "550",
       "560",
       "495",
       "450",
       "400",
       "360",
       "344"
      ],
      [
       "BIO",
       "1 225",
       "1 302",
       "2 123",
       "2 300",
       "2 350",
       "2 501",
       "2 402"
      ],
      [
       "SAI",
       "552",
       "543",
       "530",
       "500",
       "405",
       "420",
       "450"
      ],
      [
       "AOM",
       "490",
       "490",
       "267",
       "290",
       "292",
       "290",
       "290"
      ],
      [
       "CPA",
       "N/C",
       "N/C",
       "N/C",
       "N/C",
       "2 250",
       "2 300",
       "1 994"
      ],
      [
       "BDL",
       "N/C",
       "N/C",
       "N/C",
       "N/C",
       "N/C",
       "1 410",
       "1 400"
      ],
      [
       "MST",
       "N/C",
       "N/C",
       "N/C",
       "N/C",
       "760",
       "800",
       "725"
      ],
      [
       "AYRD",
       "N/C",
       "N/C",
       "N/C",
       "N/C",
       "N/C",
       "N/C",
       "830"
      ],
      [
       "CREX",
       "N/C",
       "N/C",
       "N/C",
       "N/C",
       "N/C",
       "N/C",
       "1 600"
      ]
     ]
    },
    {
     "type": "para",
     "text": "N/C = non coté à cette date. Les valeurs 2025 et 2026 doivent rester typées par leur nature exacte (clôture / référence / YTD) dans la base. Le tableau est destiné à la lecture annuelle; le moteur de production doit conserver les observations de séance SGBV."
    },
    {
     "type": "para",
     "text": "Courbe annuelle de référence — Alliance Assurances (ALL). N/C avant admission en bourse."
    },
    {
     "type": "para",
     "text": "Courbe annuelle de référence — Biopharm (BIO). N/C avant admission en bourse."
    },
    {
     "type": "para",
     "text": "Courbe annuelle de référence — Saidal (SAI). N/C avant admission en bourse."
    },
    {
     "type": "para",
     "text": "Courbe annuelle de référence — EGH El Aurassi (AUR). N/C avant admission en bourse."
    },
    {
     "type": "para",
     "text": "Courbe annuelle de référence — AOM Invest (AOM). N/C avant admission en bourse."
    },
    {
     "type": "para",
     "text": "Courbe annuelle de référence — Crédit Populaire d’Algérie (CPA). N/C avant admission en bourse."
    },
    {
     "type": "para",
     "text": "Courbe annuelle de référence — Banque de Développement Local (BDL). N/C avant admission en bourse."
    },
    {
     "type": "para",
     "text": "Courbe annuelle de référence — Moustachir (MST). N/C avant admission en bourse."
    },
    {
     "type": "para",
     "text": "Courbe annuelle de référence — Ayrade (AYRD). N/C avant admission en bourse."
    },
    {
     "type": "para",
     "text": "Courbe annuelle de référence — CRAPC Expertise (CREX). N/C avant admission en bourse."
    }
   ]
  },
  {
   "id": "3-2-dividendes-par-exercice-et-rendement",
   "title": "3.2 Dividendes par exercice et rendement dividende",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Exercice",
       "Ticker",
       "Cours fin exercice DZD",
       "Dividende DA/action",
       "Yield FINCLUDIA",
       "Rendement COSOB"
      ],
      [
       "2020",
       "ALL",
       "240",
       "32,00",
       "13,33 %",
       "—"
      ],
      [
       "2020",
       "BIO",
       "1 225",
       "115,00",
       "9,39 %",
       "—"
      ],
      [
       "2020",
       "SAI",
       "552",
       "0,00",
       "0,00 %",
       "—"
      ],
      [
       "2020",
       "AUR",
       "550",
       "0,00",
       "0,00 %",
       "—"
      ],
      [
       "2020",
       "AOM",
       "490",
       "0,00",
       "0,00 %",
       "—"
      ],
      [
       "2021",
       "ALL",
       "300",
       "35,00",
       "11,67 %",
       "11,66 %"
      ],
      [
       "2021",
       "BIO",
       "1 302",
       "175,00",
       "13,44 %",
       "13,44 %"
      ],
      [
       "2021",
       "SAI",
       "543",
       "0,00",
       "0,00 %",
       "—"
      ],
      [
       "2021",
       "AUR",
       "560",
       "0,00",
       "0,00 %",
       "—"
      ],
      [
       "2021",
       "AOM",
       "490",
       "2,30",
       "0,47 %",
       "0,46 %"
      ],
      [
       "2022",
       "ALL",
       "403",
       "35,00",
       "8,68 %",
       "8,68 %"
      ],
      [
       "2022",
       "BIO",
       "2 123",
       "134,00",
       "6,31 %",
       "6,31 %"
      ],
      [
       "2022",
       "SAI",
       "530",
       "0,00",
       "0,00 %",
       "—"
      ],
      [
       "2022",
       "AUR",
       "495",
       "0,00",
       "0,00 %",
       "—"
      ],
      [
       "2022",
       "AOM",
       "267",
       "2,60",
       "0,97 %",
       "0,97 %"
      ],
      [
       "2023",
       "ALL",
       "440",
       "30,00",
       "6,82 %",
       "6,81 %"
      ],
      [
       "2023",
       "BIO",
       "2 300",
       "180,00",
       "7,83 %",
       "7,82 %"
      ],
      [
       "2023",
       "SAI",
       "500",
       "0,00",
       "0,00 %",
       "—"
      ],
      [
       "2023",
       "AUR",
       "450",
       "0,00",
       "0,00 %",
       "—"
      ],
      [
       "2023",
       "AOM",
       "290",
       "0,00",
       "0,00 %",
       "—"
      ],
      [
       "2023",
       "CPA",
       "—",
       "125,00",
       "—",
       "5,43 %"
      ],
      [
       "2024",
       "ALL",
       "420",
       "35,00",
       "8,33 %",
       "8,33 %"
      ],
      [
       "2024",
       "BIO",
       "2 350",
       "160,00",
       "6,81 %",
       "6,81 %"
      ],
      [
       "2024",
       "SAI",
       "405",
       "21,00",
       "5,19 %",
       "6,10 %"
      ],
      [
       "2024",
       "AUR",
       "400",
       "0,00",
       "0,00 %",
       "—"
      ],
      [
       "2024",
       "AOM",
       "292",
       "2,18",
       "0,75 %",
       "0,75 %"
      ],
      [
       "2024",
       "CPA",
       "2 250",
       "125,00",
       "5,56 %",
       "5,56 %"
      ],
      [
       "2024",
       "BDL",
       "—",
       "77,77",
       "—",
       "5,55 %"
      ],
      [
       "2024",
       "MST",
       "760",
       "8,00",
       "1,05 %",
       "1,05 %"
      ],
      [
       "2025",
       "ALL",
       "330",
       "26,00",
       "7,88 %",
       "—"
      ],
      [
       "2025",
       "BIO",
       "2 501",
       "170,00",
       "6,80 %",
       "—"
      ],
      [
       "2025",
       "SAI",
       "420",
       "35,00",
       "8,33 %",
       "—"
      ],
      [
       "2025",
       "AUR",
       "360",
       "0,00",
       "0,00 %",
       "—"
      ],
      [
       "2025",
       "AOM",
       "290",
       "0,00",
       "0,00 %",
       "—"
      ],
      [
       "2025",
       "CPA",
       "2 300",
       "175,00",
       "7,61 %",
       "—"
      ],
      [
       "2025",
       "BDL",
       "1 410",
       "107,00",
       "7,59 %",
       "—"
      ],
      [
       "2025",
       "MST",
       "800",
       "0,00",
       "0,00 %",
       "—"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Comparatif du dividende par rapport au cours de fin d’exercice. Les rendements COSOB sont conservés séparément lorsqu’ils utilisent une base de calcul différente."
    },
    {
     "type": "para",
     "text": "Pourquoi deux rendements ? Le rendement FINCLUDIA ci-dessus est une convention homogène dividende/cours de fin d’exercice. La COSOB peut retenir une base différente (par exemple cours d’introduction pour BDL, ou convention propre au tableau). Les deux doivent être conservés, pas écrasés."
    },
    {
     "type": "para",
     "text": "Sources : S02 COSOB rapport 2022 : exercices 2021–2022, S02 COSOB rapport 2024 : exercices 2023–2024, S01 SGBV avis 2026 pour dividendes exercice 2025"
    }
   ]
  },
  {
   "id": "3-3-corporate-actions-indispensable-pour",
   "title": "3.3 Corporate actions — indispensable pour un vrai backtest",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Titre",
       "Date",
       "Opération",
       "Ratio / effet",
       "Traitement FINCLUDIA"
      ],
      [
       "Alliance ALL",
       "22/12/2020",
       "Attribution gratuite",
       "3 nouvelles pour 5 anciennes",
       "Quantité × 1,6; cours ajusté ex-droit"
      ],
      [
       "Alliance ALL",
       "26/11/2025",
       "Attribution gratuite",
       "1 nouvelle pour 2 anciennes",
       "Quantité × 1,5; droit DAL2 coté puis radié 02/02/2026"
      ],
      [
       "NCA Rouiba",
       "26/07/2020",
       "Radiation après OPR",
       "Titre retiré de la cote",
       "Conserver l’historique; exclure univers courant"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Un graphique de prix brut d’Alliance sans ajustement de quantité ferait croire à une chute de valeur lors des attributions gratuites. Le moteur doit donc appliquer les corporate actions avant de calculer le rendement total."
    },
    {
     "type": "para",
     "text": "Sources : S06 SGBV Avis 73/20, S07 SGBV Avis 2025/2026 Alliance, S08 SGBV NCA Rouiba"
    }
   ]
  },
  {
   "id": "4-dzairindex-benchmark-actions-alg-rie",
   "title": "4. DZAIRINDEX — benchmark actions Algérie",
   "level": 1,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Année",
       "DZAIRINDEX",
       "Base 100 (2020=100)",
       "Variation vs 2020"
      ],
      [
       "2020",
       "1 670,850",
       "100,00",
       "0,00 %"
      ],
      [
       "2021",
       "1 923,610",
       "115,13",
       "15,13 %"
      ],
      [
       "2022",
       "3 082,110",
       "184,46",
       "84,46 %"
      ],
      [
       "2023",
       "3 453,240",
       "206,68",
       "106,68 %"
      ],
      [
       "2024",
       "3 553,370",
       "212,67",
       "112,67 %"
      ],
      [
       "2025",
       "3 845,120",
       "230,13",
       "130,13 %"
      ],
      [
       "2026",
       "3 813,258",
       "228,22",
       "128,22 %"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Le DZAIRINDEX est un indice de prix. Il ne doit pas être assimilé à un indice de rendement total avec dividendes réinvestis. Pour comparer un portefeuille d’actions à l’indice, FINCLUDIA affichera donc “prix vs indice prix”, puis séparément “total return du portefeuille”."
    }
   ]
  },
  {
   "id": "5-dette-souveraine-alg-rienne-btc-bta-et",
   "title": "5. Dette souveraine algérienne — BTC, BTA et OAT expliqués",
   "level": 1,
   "blocks": [
    {
     "type": "para",
     "text": "Le Trésor se finance avec plusieurs maturités. BTC = Bons du Trésor à court terme (13/26 semaines). BTA = Bons du Trésor assimilables, typiquement 1 à 5 ans. OAT = Obligations Assimilables du Trésor, typiquement 7 à 15 ans. Le coupon est le flux contractuel; le rendement à maturité (YTM) dépend aussi du prix auquel le titre est acheté. Un prix inférieur à 100 % peut donc produire un YTM supérieur au coupon."
    },
    {
     "type": "table",
     "rows": [
      [
       "Instrument",
       "Horizon",
       "2024 — repère rendement",
       "Lecture"
      ],
      [
       "BTC 13 semaines",
       "Très court",
       "2,18 % jusqu’en fév. puis suspension",
       "Placement court terme; émission suspendue ensuite"
      ],
      [
       "BTC 26 semaines",
       "Court",
       "2,95 % fin 2024",
       "Taux court du Trésor"
      ],
      [
       "BTA 1–5 ans",
       "Moyen",
       "4,60 % à 5,21 %",
       "Courbe moyen terme"
      ],
      [
       "OAT 7–15 ans",
       "Long",
       "6,31 % à 6,67 %",
       "Courbe longue; sensibilité au taux plus élevée"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Sources : S09 Banque d’Algérie Rapport 2024"
    }
   ]
  },
  {
   "id": "5-1-tat-du-march-oat-au-17-11-2026-exemp",
   "title": "5.1 État du marché OAT au 17/11/2026 — exemples de lignes cotées",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Code",
       "Échéance",
       "Cours %",
       "Coupon",
       "YTM %",
       "Volume séance",
       "Lecture"
      ],
      [
       "O070727",
       "05/07/2027",
       "91,544",
       "5,00 %",
       "6,75 %",
       "0",
       "Prix sous pair; référence sans transaction du jour"
      ],
      [
       "O100128",
       "21/01/2028",
       "94,597",
       "5,75 %",
       "6,55 %",
       "0",
       "YTM > coupon"
      ],
      [
       "O100229",
       "03/02/2029",
       "92,040",
       "5,75 %",
       "7,00 %",
       "0",
       "Décote importante"
      ],
      [
       "O100230",
       "23/02/2030",
       "94,683",
       "5,75 %",
       "7,37 %",
       "0",
       "Ligne de backtest"
      ],
      [
       "O100331",
       "14/03/2031",
       "98,243",
       "5,75 %",
       "6,50 %",
       "0",
       "Proche du pair"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Le volume de séance étant nul sur plusieurs lignes, le prix publié peut être une référence maintenue. Le champ stale_price et la date du dernier trade sont donc obligatoires dans InvestLab."
    },
    {
     "type": "para",
     "text": "Sources : S10 SGBV OAT séance 17/11/2026"
    }
   ]
  },
  {
   "id": "5-2-inventaire-des-oat-du-r-f-rentiel",
   "title": "5.2 Inventaire des OAT du référentiel",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Code",
       "ISIN",
       "Émission",
       "Échéance",
       "Encours M DZD",
       "Coupon"
      ],
      [
       "O150527",
       "DZ0000700272",
       "02/05/2012",
       "03/05/2027",
       "15 000",
       "3,75 %"
      ],
      [
       "O150728",
       "DZ0000700306",
       "03/07/2013",
       "07/07/2028",
       "5 000",
       "3,75 %"
      ],
      [
       "O150329",
       "DZ0000700330",
       "23/03/2014",
       "23/03/2029",
       "48 177",
       "3,75 %"
      ],
      [
       "O150730",
       "DZ0000700363",
       "15/07/2015",
       "19/07/2030",
       "31 590",
       "4,00 %"
      ],
      [
       "O101027",
       "DZ0000700397",
       "29/10/2017",
       "29/10/2027",
       "7 520",
       "4,00 %"
      ],
      [
       "O150233",
       "DZ0000700421",
       "25/02/2018",
       "04/02/2033",
       "22 100",
       "6,50 %"
      ],
      [
       "O100128",
       "DZ0000700413",
       "21/01/2018",
       "21/01/2028",
       "21 300",
       "5,75 %"
      ],
      [
       "O100229",
       "DZ0000700439",
       "03/02/2019",
       "03/02/2029",
       "11 853",
       "5,75 %"
      ],
      [
       "O150434",
       "DZ0000700454",
       "17/04/2019",
       "21/04/2034",
       "117 343",
       "6,50 %"
      ],
      [
       "O071026",
       "DZ0000700462",
       "02/10/2019",
       "06/10/2026",
       "22 880",
       "5,00 %"
      ],
      [
       "O100230",
       "DZ0000700470",
       "19/02/2020",
       "23/02/2030",
       "41 573",
       "5,75 %"
      ],
      [
       "O150435",
       "DZ0000700488",
       "22/04/2020",
       "26/04/2035",
       "35 505",
       "6,50 %"
      ],
      [
       "O070727",
       "DZ0000700496",
       "01/07/2020",
       "05/07/2027",
       "54 014",
       "5,00 %"
      ],
      [
       "O100331",
       "DZ0000700504",
       "10/03/2021",
       "14/03/2031",
       "46 830",
       "5,75 %"
      ],
      [
       "O150436",
       "DZ0000700512",
       "31/03/2021",
       "04/04/2036",
       "10 790",
       "6,50 %"
      ],
      [
       "O070628",
       "DZ0000700520",
       "20/06/2021",
       "20/06/2028",
       "7 334",
       "5,00 %"
      ],
      [
       "O070929",
       "DZ0000700538",
       "31/08/2022",
       "04/09/2029",
       "69 255",
       "5,00 %"
      ],
      [
       "O151237",
       "DZ0000700546",
       "30/11/2022",
       "04/12/2037",
       "60 300",
       "6,50 %"
      ],
      [
       "O070130",
       "DZ0000700553",
       "29/01/2023",
       "29/01/2030",
       "129 050",
       "5,00 %"
      ],
      [
       "O070530",
       "DZ0000700561",
       "03/05/2023",
       "07/05/2030",
       "48 000",
       "5,00 %"
      ],
      [
       "O070630",
       "DZ0000700579",
       "14/06/2023",
       "18/06/2030",
       "62 645",
       "5,00 %"
      ],
      [
       "O100933",
       "DZ0000700587",
       "30/08/2023",
       "03/09/2033",
       "93 491",
       "5,75 %"
      ],
      [
       "O150938",
       "DZ0000700595",
       "24/09/2023",
       "24/09/2038",
       "55 350",
       "6,50 %"
      ],
      [
       "O071030",
       "DZ0000700603",
       "25/10/2023",
       "29/10/2030",
       "100 274",
       "5,00 %"
      ],
      [
       "O101233",
       "DZ0000700611",
       "03/12/2023",
       "03/12/2033",
       "112 592",
       "5,75 %"
      ],
      [
       "O151238",
       "DZ0000700629",
       "06/12/2023",
       "10/12/2038",
       "19 700",
       "6,50 %"
      ],
      [
       "O150239",
       "DZ0000700637",
       "31/01/2024",
       "04/02/2039",
       "57 327",
       "6,50 %"
      ],
      [
       "O070231",
       "DZ0000700645",
       "21/02/2024",
       "25/02/2031",
       "117 550",
       "5,00 %"
      ],
      [
       "O150339",
       "DZ0000700652",
       "13/03/2024",
       "17/03/2039",
       "87 900",
       "6,50 %"
      ],
      [
       "O150439",
       "DZ0000700660",
       "24/04/2024",
       "28/04/2039",
       "15 030",
       "6,50 %"
      ],
      [
       "O150639",
       "DZ0000700678",
       "26/06/2024",
       "30/06/2039",
       "7 500",
       "6,50 %"
      ],
      [
       "O150739",
       "DZ0000700686",
       "24/07/2024",
       "28/07/2039",
       "4 200",
       "6,50 %"
      ],
      [
       "O070931",
       "DZ0000700694",
       "01/09/2024",
       "01/09/2031",
       "104 476",
       "5,00 %"
      ],
      [
       "O150939",
       "DZ0000700702",
       "25/09/2024",
       "29/09/2039",
       "15 000",
       "6,50 %"
      ],
      [
       "O151139",
       "DZ0000700710",
       "30/10/2024",
       "03/11/2036",
       "7 000",
       "6,50 %"
      ],
      [
       "O101234",
       "DZ0000700736",
       "18/12/2024",
       "22/12/2034",
       "50 550",
       "5,75 %"
      ],
      [
       "O151239",
       "DZ0000700728",
       "04/12/2024",
       "08/12/2039",
       "23 300",
       "6,50 %"
      ],
      [
       "O070132",
       "DZ0000700744",
       "08/01/2025",
       "12/01/2032",
       "102 350",
       "5,00 %"
      ],
      [
       "O150740",
       "DZ0000700751",
       "09/07/2025",
       "13/07/2040",
       "43 350",
       "6,50 %"
      ],
      [
       "O100735",
       "DZ0000700769",
       "23/07/2025",
       "27/07/2035",
       "42 280",
       "5,75 %"
      ],
      [
       "O070832",
       "DZ0000700777",
       "30/07/2025",
       "03/08/2032",
       "88 650",
       "5,00 %"
      ],
      [
       "O151140",
       "DZ0000700785",
       "29/10/2025",
       "02/11/2040",
       "36 948",
       "6,50 %"
      ],
      [
       "O070133",
       "DZ0000700793",
       "31/12/2025",
       "04/01/2033",
       "41 450",
       "5,00 %"
      ],
      [
       "O150341",
       "DZ0000700801",
       "18/03/2026",
       "19/03/2041",
       "14 475",
       "6,50 %"
      ],
      [
       "O150541",
       "DZ0000700819",
       "13/05/2026",
       "17/05/2041",
       "8 300",
       "6,50 %"
      ]
     ]
    }
   ]
  },
  {
   "id": "5-3-obligations-d-entreprise-cot-es",
   "title": "5.3 Obligations d’entreprise cotées",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Code",
       "Émetteur",
       "Émission",
       "Échéance",
       "Coupon / structure",
       "Cours réf. 2026",
       "Traitement"
      ],
      [
       "AL30",
       "Arab Leasing Corporation",
       "04/06/2025",
       "04/06/2030",
       "5,65 %",
       "100 %",
       "Prix + coupons"
      ],
      [
       "TS30",
       "Tosyali Algérie",
       "10/07/2025",
       "10/07/2030",
       "5,65 %",
       "99 %",
       "Prix + coupons"
      ],
      [
       "ML30",
       "Maghreb Leasing Algérie",
       "23/11/2025",
       "23/11/2030",
       "5,65 %",
       "100 %",
       "Prix + coupons"
      ],
      [
       "RX33",
       "RELAXI",
       "08/10/2026",
       "31/08/2033",
       "0 % / structure particulière",
       "100 %",
       "Ne pas assimiler à une obligation coupon classique"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Sources : S01 SGBV — marché titres de créance"
    }
   ]
  },
  {
   "id": "6-sukuk-souverain-ijara-sk32",
   "title": "6. Sukuk souverain IJARA SK32",
   "level": 1,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Champ",
       "Valeur"
      ],
      [
       "ISIN",
       "DZ0000030035"
      ],
      [
       "Type",
       "Sukuk souverain IJARA"
      ],
      [
       "Maturité",
       "7 ans — échéance 31/12/2032"
      ],
      [
       "Nominal",
       "100 000 DZD"
      ],
      [
       "Rendement/loyer annoncé",
       "6 % annuel"
      ],
      [
       "Début historique SGBV",
       "22/10/2026"
      ],
      [
       "Cours de reference",
       "100 %"
      ],
      [
       "10/11/2026",
       "LC 5,24 %; transaction 20 000 unités = 2 Md DZD"
      ],
      [
       "12/11/2026",
       "LC 5,28 %"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Avant l’émission : N/A, pas 0 %. Performance = variation de prix + loyers/distributions. Le vocabulaire “coupon d’intérêt” est interdit pour ce contrat."
    }
   ]
  },
  {
   "id": "7-pargne-conventionnelle-dzd-et-d-p-ts-t",
   "title": "7. Épargne conventionnelle DZD et dépôts à terme — données chiffrées",
   "level": 1,
   "blocks": []
  },
  {
   "id": "7-1-bna-rep-res-publi-s",
   "title": "7.1 BNA — repères publiés",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Produit / tranche",
       "Taux publié"
      ],
      [
       "Épargne classique",
       "2,50 %"
      ],
      [
       "Moustakbaly",
       "3,00 %"
      ],
      [
       "Épargne Plus < 500 000 DZD",
       "2,50 %"
      ],
      [
       "500 001 – 2,5 M DZD",
       "3,00 %"
      ],
      [
       "2,5 – 7,5 M DZD",
       "3,25 %"
      ],
      [
       "7,5 – 15 M DZD",
       "3,50 %"
      ],
      [
       "15 – 50 M DZD",
       "3,75 %"
      ],
      [
       "50 – 100 M DZD",
       "4,00 %"
      ],
      [
       "100 – 200 M DZD",
       "4,25 %"
      ],
      [
       "> 200 M DZD",
       "4,50 %"
      ],
      [
       "Dépôts 30–89 jours",
       "1,00–1,15 %"
      ],
      [
       "DAT / bons de caisse",
       "1,25–3,50 % selon durée"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Sources : S11 BNA Conditions générales de banque — particuliers"
    }
   ]
  },
  {
   "id": "7-2-bea-pargne-et-placements-terme",
   "title": "7.2 BEA — épargne et placements à terme",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Produit / durée",
       "Taux"
      ],
      [
       "Livret épargne",
       "2,50 %"
      ],
      [
       "Épargne logement",
       "2,00 %"
      ],
      [
       "6–12 mois",
       "2,00 %"
      ],
      [
       "12–18",
       "2,25 %"
      ],
      [
       "18–24",
       "2,50 %"
      ],
      [
       "24–30",
       "2,75 %"
      ],
      [
       "30–36",
       "3,00 %"
      ],
      [
       "36–42",
       "3,25 %"
      ],
      [
       "42–48",
       "3,50 %"
      ],
      [
       "48–54",
       "3,75 %"
      ],
      [
       "54–60",
       "4,00 %"
      ],
      [
       "60–72",
       "4,25 %"
      ],
      [
       "72–84",
       "4,50 %"
      ],
      [
       "84–96",
       "4,75 %"
      ],
      [
       "96–108",
       "5,00 %"
      ],
      [
       "108–120",
       "5,25 %"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Sources : S12 BEA Épargne"
    }
   ]
  },
  {
   "id": "7-3-cpa-dat-bdc-2025",
   "title": "7.3 CPA — DAT/BDC 2025",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Durée",
       "Taux variable"
      ],
      [
       "3–6 mois",
       "1,25 %"
      ],
      [
       "+6–12",
       "1,50 %"
      ],
      [
       "+12–18",
       "1,75 %"
      ],
      [
       "+18–24",
       "2,00 %"
      ],
      [
       "+24–36",
       "2,25 %"
      ],
      [
       "+36–48",
       "2,50 %"
      ],
      [
       "+48–60",
       "3,00 %"
      ],
      [
       "+60–120",
       "4,00 %"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Sources : S13 CPA Conditions tarifaires 2025, S14 CPA Épargne"
    }
   ]
  },
  {
   "id": "7-4-bdl-grille-publi-e-et-logique-de-pla",
   "title": "7.4 BDL — grille publiée et logique de placement",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Produit / tranche",
       "Taux publié"
      ],
      [
       "Épargne 1–500 k DZD",
       "2,50 %"
      ],
      [
       "Épargne 500 k–10 M",
       "3,00 %"
      ],
      [
       "Épargne 10–50 M",
       "3,50 %"
      ],
      [
       "Épargne ≥50 M",
       "3,80 %"
      ],
      [
       "BDC 3–6 mois",
       "2,00 %"
      ],
      [
       "BDC 6–12",
       "2,25 %"
      ],
      [
       "BDC 12–18",
       "2,50 %"
      ],
      [
       "BDC 18–24",
       "2,75 %"
      ],
      [
       "BDC 24–36",
       "3,25 %"
      ],
      [
       "BDC 36–42",
       "3,50 %"
      ],
      [
       "BDC 42–48",
       "3,75 %"
      ],
      [
       "BDC 48–54",
       "4,00 %"
      ],
      [
       "BDC 54–60",
       "4,25 %"
      ],
      [
       "Placement ≥50 M / 3 ans",
       "4,70 %"
      ],
      [
       "Placement >100 M / 5 ans",
       "5,00 %"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Sources : S15 BDL conditions publiées"
    }
   ]
  },
  {
   "id": "7-5-agb-r-gle-de-taux-de-r-f-rence",
   "title": "7.5 AGB — règle de taux de référence",
   "level": 2,
   "blocks": [
    {
     "type": "para",
     "text": "AGB publie ses placements classiques comme un écart par rapport à un taux de référence TR : épargne <1 M = TR−1,25 pt; 1–10 M = TR−0,50 pt; ≥10 M = TR. DAT/BDC : 3–<6m = TR−1,75; 6–<12m = TR−1,25; 12–<24m = TR−0,50; ≥24m = TR. Cette forme doit être stockée comme formule de taux, pas comme taux fixe."
    },
    {
     "type": "para",
     "text": "Sources : S16 AGB Conditions de banque"
    }
   ]
  },
  {
   "id": "8-comptes-devises-banque-d-alg-rie-r-gle",
   "title": "8. Comptes devises Banque d’Algérie — règles et grilles chiffrées",
   "level": 1,
   "blocks": [
    {
     "type": "para",
     "text": "Instruction 01-2022 : les dépôts à terme des personnes physiques sont rémunérés au taux fixé par la Banque d’Algérie; les comptes devises commerçants/exportateurs ne peuvent pas faire l’objet d’un DAT et ne donnent lieu à aucune rémunération; les taux sont fixés au début de chaque trimestre civil; durée maximale 12 mois; rupture anticipée = perte de toute rémunération. La commission de gestion versée aux banques est 0,50 % l’an, en DZD."
    },
    {
     "type": "para",
     "text": "Sources : S17 Banque d’Algérie Instruction 01-2022, S18 BA archive rémunération comptes devises"
    }
   ]
  },
  {
   "id": "8-1-comparatif-annuel-taux-1-an-repr-sen",
   "title": "8.1 Comparatif annuel — taux 1 an représentatif",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Année",
       "USD",
       "EUR",
       "GBP",
       "CHF",
       "JPY",
       "CAD",
       "DKK",
       "NOK",
       "SEK",
       "SAR"
      ],
      [
       "2020",
       "0,95 %",
       "0,05 %",
       "1,05 %",
       "0,00 %",
       "0,20 %",
       "1,50 %",
       "0,00 %",
       "1,55 %",
       "0,50 %",
       "2,10 %"
      ],
      [
       "2021",
       "0,20 %",
       "0,00 %",
       "0,60 %",
       "0,00 %",
       "0,20 %",
       "0,75 %",
       "0,00 %",
       "1,05 %",
       "0,35 %",
       "1,45 %"
      ],
      [
       "2022",
       "3,10 %",
       "1,25 %",
       "2,50 %",
       "1,25 %",
       "0,30 %",
       "3,25 %",
       "1,85 %",
       "3,70 %",
       "2,95 %",
       "3,40 %"
      ],
      [
       "2023",
       "5,30 %",
       "3,60 %",
       "5,05 %",
       "2,15 %",
       "0,35 %",
       "5,05 %",
       "3,20 %",
       "4,25 %",
       "3,65 %",
       "5,15 %"
      ],
      [
       "2024",
       "5,05 %",
       "3,00 %",
       "4,75 %",
       "1,40 %",
       "0,75 %",
       "4,25 %",
       "3,15 %",
       "4,90 %",
       "3,85 %",
       "4,50 %"
      ],
      [
       "2025",
       "4,55 %",
       "2,25 %",
       "4,25 %",
       "1,05 %",
       "1,00 %",
       "3,00 %",
       "2,50 %",
       "4,60 %",
       "2,50 %",
       "3,75 %"
      ],
      [
       "2026",
       "4,00 %",
       "2,25 %",
       "4,25 %",
       "0,75 %",
       "1,30 %",
       "2,75 %",
       "2,25 %",
       "4,50 %",
       "2,50 %",
       "4,10 %"
      ]
     ]
    },
    {
     "type": "para",
     "text": "2020–2021 : table ancienne avec maturités au-delà d’un an; depuis l’instruction 01-2022, la durée maximale du DAT personne physique est de 12 mois. Pour 2026, la table utilisée ici est T2 2026, dernière grille chiffrée consolidée dans ce référentiel."
    }
   ]
  },
  {
   "id": "8-2-grilles-compl-tes-de-r-f-rence-par-d",
   "title": "8.2 Grilles complètes de référence par devise et maturité",
   "level": 2,
   "blocks": []
  },
  {
   "id": "2020-t4-r-f-rence",
   "title": "2020 — T4 référence",
   "level": 3,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Devise",
       "Vue",
       "1m",
       "3m",
       "6m",
       "1a",
       "1-2a",
       ">2a"
      ],
      [
       "USD",
       "0,00 %",
       "0,25 %",
       "0,45 %",
       "0,50 %",
       "0,95 %",
       "1,05 %",
       "1,25 %"
      ],
      [
       "EUR",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,05 %",
       "0,40 %",
       "0,90 %"
      ],
      [
       "GBP",
       "0,00 %",
       "0,05 %",
       "0,30 %",
       "0,60 %",
       "1,05 %",
       "1,55 %",
       "2,05 %"
      ],
      [
       "CHF",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,30 %",
       "0,80 %"
      ],
      [
       "JPY",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,20 %",
       "0,70 %",
       "1,20 %"
      ],
      [
       "CAD",
       "0,00 %",
       "0,60 %",
       "0,85 %",
       "1,30 %",
       "1,50 %",
       "1,95 %",
       "2,10 %"
      ],
      [
       "DKK",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,35 %",
       "0,85 %"
      ],
      [
       "NOK",
       "0,00 %",
       "0,50 %",
       "0,80 %",
       "1,20 %",
       "1,55 %",
       "2,05 %",
       "2,55 %"
      ],
      [
       "SEK",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,15 %",
       "0,50 %",
       "1,00 %",
       "1,50 %"
      ],
      [
       "SAR",
       "0,00 %",
       "1,05 %",
       "1,50 %",
       "1,85 %",
       "2,10 %",
       "2,60 %",
       "3,10 %"
      ]
     ]
    }
   ]
  },
  {
   "id": "2021-t4-r-f-rence",
   "title": "2021 — T4 référence",
   "level": 3,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Devise",
       "Vue",
       "1m",
       "3m",
       "6m",
       "1a",
       "1-2a",
       ">2a"
      ],
      [
       "USD",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,10 %",
       "0,20 %",
       "0,65 %",
       "1,00 %"
      ],
      [
       "EUR",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,40 %",
       "0,75 %"
      ],
      [
       "GBP",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,25 %",
       "0,60 %",
       "1,10 %",
       "1,60 %"
      ],
      [
       "CHF",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,20 %",
       "0,70 %"
      ],
      [
       "JPY",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,20 %",
       "0,70 %",
       "1,20 %"
      ],
      [
       "CAD",
       "0,00 %",
       "0,00 %",
       "0,05 %",
       "0,55 %",
       "0,75 %",
       "1,25 %",
       "1,75 %"
      ],
      [
       "DKK",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,40 %",
       "0,90 %"
      ],
      [
       "NOK",
       "0,00 %",
       "0,00 %",
       "0,15 %",
       "0,60 %",
       "1,05 %",
       "1,60 %",
       "2,05 %"
      ],
      [
       "SEK",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,05 %",
       "0,35 %",
       "0,85 %",
       "1,35 %"
      ],
      [
       "SAR",
       "0,00 %",
       "0,75 %",
       "1,00 %",
       "1,10 %",
       "1,45 %",
       "2,00 %",
       "2,35 %"
      ]
     ]
    }
   ]
  },
  {
   "id": "2022-t4-r-f-rence",
   "title": "2022 — T4 référence",
   "level": 3,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Devise",
       "Vue",
       "1m",
       "3m",
       "6m",
       "1a"
      ],
      [
       "USD",
       "0,25 %",
       "2,00 %",
       "2,25 %",
       "2,90 %",
       "3,10 %"
      ],
      [
       "EUR",
       "0,00 %",
       "0,00 %",
       "0,35 %",
       "0,95 %",
       "1,25 %"
      ],
      [
       "GBP",
       "0,00 %",
       "1,10 %",
       "1,80 %",
       "2,00 %",
       "2,50 %"
      ],
      [
       "CHF",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,50 %",
       "1,25 %"
      ],
      [
       "JPY",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,30 %"
      ],
      [
       "CAD",
       "0,50 %",
       "1,75 %",
       "2,50 %",
       "2,95 %",
       "3,25 %"
      ],
      [
       "DKK",
       "0,00 %",
       "0,05 %",
       "0,35 %",
       "1,00 %",
       "1,85 %"
      ],
      [
       "NOK",
       "0,00 %",
       "1,50 %",
       "2,15 %",
       "3,10 %",
       "3,70 %"
      ],
      [
       "SEK",
       "0,00 %",
       "0,40 %",
       "1,30 %",
       "2,05 %",
       "2,95 %"
      ],
      [
       "SAR",
       "0,00 %",
       "2,00 %",
       "2,55 %",
       "2,95 %",
       "3,40 %"
      ]
     ]
    }
   ]
  },
  {
   "id": "2023-t4-r-f-rence",
   "title": "2023 — T4 référence",
   "level": 3,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Devise",
       "Vue",
       "1m",
       "3m",
       "6m",
       "1a"
      ],
      [
       "USD",
       "2,90 %",
       "4,05 %",
       "4,30 %",
       "4,90 %",
       "5,30 %"
      ],
      [
       "EUR",
       "1,10 %",
       "1,95 %",
       "2,70 %",
       "3,20 %",
       "3,60 %"
      ],
      [
       "GBP",
       "2,00 %",
       "3,50 %",
       "4,05 %",
       "4,50 %",
       "5,05 %"
      ],
      [
       "CHF",
       "0,35 %",
       "1,00 %",
       "1,15 %",
       "1,50 %",
       "2,15 %"
      ],
      [
       "JPY",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,00 %",
       "0,35 %"
      ],
      [
       "CAD",
       "2,40 %",
       "3,40 %",
       "4,00 %",
       "4,40 %",
       "5,05 %"
      ],
      [
       "DKK",
       "1,00 %",
       "1,70 %",
       "2,25 %",
       "3,05 %",
       "3,20 %"
      ],
      [
       "NOK",
       "1,35 %",
       "2,50 %",
       "2,95 %",
       "4,00 %",
       "4,25 %"
      ],
      [
       "SEK",
       "1,15 %",
       "2,00 %",
       "2,90 %",
       "3,15 %",
       "3,65 %"
      ],
      [
       "SAR",
       "2,00 %",
       "4,10 %",
       "4,40 %",
       "4,80 %",
       "5,15 %"
      ]
     ]
    }
   ]
  },
  {
   "id": "2024-t4-r-f-rence",
   "title": "2024 — T4 référence",
   "level": 3,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Devise",
       "Vue",
       "1m",
       "3m",
       "6m",
       "1a"
      ],
      [
       "USD",
       "2,85 %",
       "4,00 %",
       "4,50 %",
       "5,00 %",
       "5,05 %"
      ],
      [
       "EUR",
       "1,00 %",
       "2,00 %",
       "2,45 %",
       "2,65 %",
       "3,00 %"
      ],
      [
       "GBP",
       "2,20 %",
       "3,10 %",
       "3,95 %",
       "4,15 %",
       "4,75 %"
      ],
      [
       "CHF",
       "0,35 %",
       "0,90 %",
       "1,00 %",
       "1,25 %",
       "1,40 %"
      ],
      [
       "JPY",
       "0,00 %",
       "0,15 %",
       "0,25 %",
       "0,35 %",
       "0,75 %"
      ],
      [
       "CAD",
       "2,30 %",
       "3,00 %",
       "4,00 %",
       "4,15 %",
       "4,25 %"
      ],
      [
       "DKK",
       "1,50 %",
       "2,30 %",
       "2,50 %",
       "2,90 %",
       "3,15 %"
      ],
      [
       "NOK",
       "1,80 %",
       "2,90 %",
       "3,70 %",
       "4,05 %",
       "4,90 %"
      ],
      [
       "SEK",
       "1,55 %",
       "2,70 %",
       "3,00 %",
       "3,45 %",
       "3,85 %"
      ],
      [
       "SAR",
       "2,50 %",
       "3,15 %",
       "3,75 %",
       "4,00 %",
       "4,50 %"
      ]
     ]
    }
   ]
  },
  {
   "id": "2025-t4-r-f-rence",
   "title": "2025 — T4 référence",
   "level": 3,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Devise",
       "Vue",
       "1m",
       "3m",
       "6m",
       "1a"
      ],
      [
       "USD",
       "2,40 %",
       "3,90 %",
       "4,15 %",
       "4,35 %",
       "4,55 %"
      ],
      [
       "EUR",
       "0,65 %",
       "1,50 %",
       "1,80 %",
       "2,05 %",
       "2,25 %"
      ],
      [
       "GBP",
       "2,20 %",
       "3,40 %",
       "3,70 %",
       "3,80 %",
       "4,25 %"
      ],
      [
       "CHF",
       "0,25 %",
       "0,50 %",
       "0,75 %",
       "1,00 %",
       "1,05 %"
      ],
      [
       "JPY",
       "0,00 %",
       "0,15 %",
       "0,35 %",
       "0,50 %",
       "1,00 %"
      ],
      [
       "CAD",
       "0,95 %",
       "2,00 %",
       "2,30 %",
       "2,75 %",
       "3,00 %"
      ],
      [
       "DKK",
       "0,50 %",
       "2,00 %",
       "2,25 %",
       "2,40 %",
       "2,50 %"
      ],
      [
       "NOK",
       "2,40 %",
       "3,80 %",
       "4,10 %",
       "4,30 %",
       "4,60 %"
      ],
      [
       "SEK",
       "0,40 %",
       "1,80 %",
       "2,00 %",
       "2,30 %",
       "2,50 %"
      ],
      [
       "SAR",
       "2,75 %",
       "3,00 %",
       "3,25 %",
       "3,50 %",
       "3,75 %"
      ]
     ]
    }
   ]
  },
  {
   "id": "2026-t2-r-f-rence",
   "title": "2026 — T2 référence",
   "level": 3,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Devise",
       "Vue",
       "1m",
       "3m",
       "6m",
       "1a"
      ],
      [
       "USD",
       "2,00 %",
       "2,95 %",
       "3,25 %",
       "3,90 %",
       "4,00 %"
      ],
      [
       "EUR",
       "0,50 %",
       "1,50 %",
       "1,75 %",
       "2,00 %",
       "2,25 %"
      ],
      [
       "GBP",
       "2,00 %",
       "3,00 %",
       "3,60 %",
       "3,95 %",
       "4,25 %"
      ],
      [
       "CHF",
       "0,25 %",
       "0,35 %",
       "0,40 %",
       "0,50 %",
       "0,75 %"
      ],
      [
       "JPY",
       "0,00 %",
       "0,25 %",
       "0,50 %",
       "0,90 %",
       "1,30 %"
      ],
      [
       "CAD",
       "0,75 %",
       "1,75 %",
       "2,00 %",
       "2,25 %",
       "2,75 %"
      ],
      [
       "DKK",
       "0,50 %",
       "0,90 %",
       "2,00 %",
       "2,10 %",
       "2,25 %"
      ],
      [
       "NOK",
       "2,00 %",
       "3,00 %",
       "3,50 %",
       "3,90 %",
       "4,50 %"
      ],
      [
       "SEK",
       "0,50 %",
       "1,75 %",
       "2,00 %",
       "2,25 %",
       "2,50 %"
      ],
      [
       "SAR",
       "3,00 %",
       "3,30 %",
       "3,80 %",
       "3,95 %",
       "4,10 %"
      ]
     ]
    }
   ]
  },
  {
   "id": "9-finance-islamique-mod-le-banque-par-ba",
   "title": "9. Finance islamique — modèle banque par banque",
   "level": 1,
   "blocks": [
    {
     "type": "para",
     "text": "Architecture FINCLUDIA : chaque ligne stocke bank_id, product_id, contract_type, min_amount, tenor, profit_share_client, profit_share_bank, target_profit_rate, realized_profit_rate, guaranteed=false/true, effective_from/to et source. Une clé de 85 % signifie 85 % du profit réalisé revenant au client, pas 85 % de rendement."
    }
   ]
  },
  {
   "id": "9-1-cpa",
   "title": "9.1 CPA",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Produit",
       "Minimum / durée",
       "Clé client",
       "Clé banque",
       "Nature"
      ],
      [
       "Épargne islamique",
       "10 000 DZD solde moyen; ≥3 mois",
       "50 %",
       "50 %",
       "Moudaraba; décompte annuel"
      ],
      [
       "TANMYA 3–6m",
       "100 000 DZD",
       "51 %",
       "49 %",
       "Compte investissement non restreint"
      ],
      [
       "6–12m",
       "",
       "55 %",
       "45 %",
       "idem"
      ],
      [
       "12–18m",
       "",
       "65 %",
       "35 %",
       "idem"
      ],
      [
       "18–24m",
       "",
       "70 %",
       "30 %",
       "idem"
      ],
      [
       "24–36m",
       "",
       "75 %",
       "25 %",
       "idem"
      ],
      [
       "36–48m",
       "",
       "80 %",
       "20 %",
       "idem"
      ],
      [
       "48–60m",
       "",
       "85 %",
       "15 %",
       "idem"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Sources : S19 CPA Finance islamique — conditions 2025"
    }
   ]
  },
  {
   "id": "9-2-cnep-banque",
   "title": "9.2 CNEP-Banque",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Produit",
       "Durée / minimum",
       "Part client",
       "Part banque"
      ],
      [
       "Tawfir Cat. 1",
       "≥3m, solde ≥5 000",
       "50 %",
       "50 %"
      ],
      [
       "Tawfir Cat. 2",
       "≥6m, solde ≥25 000",
       "55 %",
       "45 %"
      ],
      [
       "ISTITHMAR 3m",
       "Part. 10k / Comm.100k",
       "50 %",
       "50 %"
      ],
      [
       "6m",
       "Idem",
       "55 %",
       "45 %"
      ],
      [
       "12m",
       "Idem",
       "65 %",
       "35 %"
      ],
      [
       "18m",
       "Idem",
       "70 %",
       "30 %"
      ],
      [
       "24m",
       "Idem",
       "75 %",
       "25 %"
      ],
      [
       "36m",
       "Idem",
       "80 %",
       "20 %"
      ],
      [
       "48m",
       "Idem",
       "85 %",
       "15 %"
      ],
      [
       "60m",
       "Idem",
       "90 %",
       "10 %"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Sources : S20 CNEP Conditions de banque islamiques"
    }
   ]
  },
  {
   "id": "9-3-bea",
   "title": "9.3 BEA",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Produit",
       "Durée / minimum",
       "Part client",
       "Part banque"
      ],
      [
       "Épargne islamique",
       "solde moyen ≥10 000; présence ≥3m",
       "60 %",
       "40 %"
      ],
      [
       "CIINR 3m",
       "≥50 000",
       "50 %",
       "50 %"
      ],
      [
       "6m",
       "≥50 000",
       "55 %",
       "45 %"
      ],
      [
       "12m",
       "≥50 000",
       "65 %",
       "35 %"
      ],
      [
       "18m",
       "≥50 000",
       "70 %",
       "30 %"
      ],
      [
       "24m",
       "≥50 000",
       "75 %",
       "25 %"
      ],
      [
       "36m",
       "≥50 000",
       "80 %",
       "20 %"
      ],
      [
       "48m",
       "≥50 000",
       "85 %",
       "15 %"
      ],
      [
       "60m",
       "≥50 000",
       "90 %",
       "10 %"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Sources : S21 BEA Tarification finance islamique"
    }
   ]
  },
  {
   "id": "9-4-bdl",
   "title": "9.4 BDL",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Durée",
       "Taux de profit ciblé"
      ],
      [
       "12 mois",
       "1,75 %"
      ],
      [
       "24 mois",
       "2,25 %"
      ],
      [
       "24–36",
       "2,50 %"
      ],
      [
       "36–42",
       "2,75 %"
      ],
      [
       "42–48",
       "3,00 %"
      ],
      [
       "48–54",
       "3,25 %"
      ],
      [
       "54–60",
       "3,50 %"
      ]
     ]
    },
    {
     "type": "para",
     "text": "BDL précise expressément que ce taux est indicatif et ne peut en aucun cas être garanti. FINCLUDIA doit l’afficher comme target_profit_rate, jamais comme rendement contractuel garanti."
    },
    {
     "type": "para",
     "text": "Sources : S22 BDL Moudaraba"
    }
   ]
  },
  {
   "id": "9-5-al-baraka-bank-alg-rie",
   "title": "9.5 Al Baraka Bank Algérie",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Durée / tranche",
       "Part client",
       "Part banque"
      ],
      [
       "3m",
       "52,50 %",
       "47,50 %"
      ],
      [
       "6m",
       "53,80 %",
       "46,20 %"
      ],
      [
       "9m",
       "54,50 %",
       "45,50 %"
      ],
      [
       "12m ≤50M",
       "55,50 %",
       "44,50 %"
      ],
      [
       "12m >50M",
       "57,00 %",
       "43,00 %"
      ],
      [
       "24m ≤50M",
       "59,00 %",
       "41,00 %"
      ],
      [
       "24m >50M",
       "60,00 %",
       "40,00 %"
      ],
      [
       "36m ≤50M",
       "63,00 %",
       "37,00 %"
      ],
      [
       "36m >50M",
       "64,00 %",
       "36,00 %"
      ],
      [
       "48m ≤50M",
       "65,00 %",
       "35,00 %"
      ],
      [
       "48m >50M",
       "66,00 %",
       "34,00 %"
      ],
      [
       "60m ≤50M",
       "67,50 %",
       "32,50 %"
      ],
      [
       "60m >50M",
       "70,00 %",
       "30,00 %"
      ],
      [
       ">60m ≤50M",
       "72,00 %",
       "28,00 %"
      ],
      [
       ">60m >50M",
       "73,00 %",
       "27,00 %"
      ],
      [
       "Livret épargne",
       "53,27 %",
       "46,73 %"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Les bénéfices du compte participatif sont reversés trimestriellement selon la page produit; la grille ci-dessus est une clé de partage, pas un rendement nominal."
    },
    {
     "type": "para",
     "text": "Sources : S23 Al Baraka Conditions de banque, S24 Al Baraka Compte de dépôts participatifs"
    }
   ]
  },
  {
   "id": "9-6-agb",
   "title": "9.6 AGB",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Produit / durée",
       "Part client du profit"
      ],
      [
       "Épargne islamique",
       "34 %"
      ],
      [
       "DAT/BDC 3–<6m",
       "28 %"
      ],
      [
       "6–<12m",
       "34 %"
      ],
      [
       "12–<24m",
       "43 %"
      ],
      [
       "≥24m",
       "50 %"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Sources : S16 AGB Conditions de banque"
    }
   ]
  },
  {
   "id": "10-inflation-benchmark-de-rendement-r-el",
   "title": "10. Inflation — benchmark de rendement réel",
   "level": 1,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Année",
       "Inflation %",
       "Statut"
      ],
      [
       "2020",
       "2,42 %",
       "Année civile"
      ],
      [
       "2021",
       "7,23 %",
       "Année civile"
      ],
      [
       "2022",
       "9,27 %",
       "Année civile"
      ],
      [
       "2023",
       "9,32 %",
       "Année civile"
      ],
      [
       "2024",
       "4,05 %",
       "Année civile"
      ],
      [
       "2025",
       "1,80 %",
       "Année civile"
      ],
      [
       "2026",
       "4,90 %",
       "Rythme glissant 2026 — pas année civile"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Formule : rendement réel = (1 + rendement nominal) / (1 + inflation comparable) − 1. Le cumul 2021–2026 utilisé dans le backtest vaut environ 42,33 %, soit un facteur de prix de 1,4233."
    },
    {
     "type": "para",
     "text": "Sources : S04 ONS IPC 2024, S25 ONS 2025/2026"
    }
   ]
  },
  {
   "id": "11-or-argent-et-platine-calcul-d-termin",
   "title": "11. Or, argent et platine — calcul déterminé en DZD",
   "level": 1,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Année",
       "Or USD/toz",
       "Argent USD/toz",
       "Platine USD/toz",
       "USD/DZD fin période"
      ],
      [
       "2020",
       "1 770",
       "20,50",
       "883",
       "132,13"
      ],
      [
       "2021",
       "1 800",
       "25,20",
       "1 091",
       "138,84"
      ],
      [
       "2022",
       "1 801",
       "21,80",
       "962",
       "137,22"
      ],
      [
       "2023",
       "1 943",
       "23,40",
       "966",
       "134,27"
      ],
      [
       "2024",
       "2 388",
       "28,30",
       "955",
       "135,66"
      ],
      [
       "2025",
       "3 442",
       "39,80",
       "1 278",
       "135,10"
      ],
      [
       "2026",
       "4 105",
       "57,00",
       "1 621",
       "136,70"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Méthode : valeur DZD = quantité en once troy × prix USD/toz × USD/DZD officiel. Rendement DZD = (1+r_métal_USD) × (1+r_USD/DZD) − 1. Cette décomposition permet d’expliquer si la performance vient du métal ou du change."
    },
    {
     "type": "para",
     "text": "Sources : S05 Banque mondiale Pink Sheet, S03 Banque d’Algérie change"
    }
   ]
  },
  {
   "id": "12-backtest-fincludia-10-000-dzd-investi",
   "title": "12. Backtest FINCLUDIA — 10 000 DZD investis au 31/12/2020",
   "level": 1,
   "blocks": [
    {
     "type": "para",
     "text": "Convention choisie pour rendre la comparaison homogène : 10 000 DZD investis au 31/12/2020, valeur finale au 17/11/2026 (ou dernier repère 2026 disponible). Fractionnement des unités autorisé à des fins pédagogiques. Brut de fiscalité et frais. Dividendes non réinvestis. Pour Alliance, l’attribution gratuite 1/2 de 2025 est appliquée à la quantité. Pour OAT, le calcul est une approximation “clean price + six coupons”, sans coupon couru exact. Les DAT devises utilisent un taux 1 an représentatif par année (T4; T2 2026), pas un roulement trimestriel intégral."
    },
    {
     "type": "table",
     "rows": [
      [
       "Actif / scénario",
       "Initial DZD",
       "Final nominal DZD",
       "Revenus/écart inclus",
       "Rendement nominal",
       "Valeur réelle DZD 2020",
       "Rendement réel"
      ],
      [
       "ALL",
       "10 000",
       "29 750",
       "7 250",
       "197,50 %",
       "20 903",
       "109,03 %"
      ],
      [
       "Argent",
       "10 000",
       "28 767",
       "0",
       "187,67 %",
       "20 212",
       "102,12 %"
      ],
      [
       "BIO",
       "10 000",
       "26 294",
       "6 686",
       "162,94 %",
       "18 474",
       "84,74 %"
      ],
      [
       "Or",
       "10 000",
       "23 994",
       "0",
       "139,94 %",
       "16 859",
       "68,59 %"
      ],
      [
       "DZAIRINDEX",
       "10 000",
       "22 822",
       "0",
       "128,22 %",
       "16 035",
       "60,35 %"
      ],
      [
       "Platine",
       "10 000",
       "18 993",
       "0",
       "89,93 %",
       "13 345",
       "33,45 %"
      ],
      [
       "OAT O100230",
       "10 000",
       "14 372",
       "3 838",
       "43,72 %",
       "10 098",
       "0,98 %"
      ],
      [
       "DAT devise USD",
       "10 000",
       "12 958",
       "2 958",
       "29,58 %",
       "9 104",
       "-8,96 %"
      ],
      [
       "DAT devise GBP",
       "10 000",
       "12 499",
       "2 499",
       "24,99 %",
       "8 782",
       "-12,18 %"
      ],
      [
       "Épargne DZD 2,5% (scénario)",
       "10 000",
       "11 597",
       "1 597",
       "15,97 %",
       "8 148",
       "-18,52 %"
      ],
      [
       "DAT devise EUR",
       "10 000",
       "10 597",
       "597",
       "5,97 %",
       "7 446",
       "-25,54 %"
      ],
      [
       "SAI",
       "10 000",
       "9 167",
       "1 014",
       "-8,33 %",
       "6 441",
       "-35,59 %"
      ],
      [
       "AUR",
       "10 000",
       "6 255",
       "0",
       "-37,45 %",
       "4 395",
       "-56,05 %"
      ],
      [
       "AOM",
       "10 000",
       "6 063",
       "144",
       "-39,37 %",
       "4 260",
       "-57,40 %"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Comparatif nominal. La ligne verticale marque le capital initial de 10 000 DZD."
    },
    {
     "type": "para",
     "text": "Lecture : ce backtest n’est pas une recommandation. Il montre l’effet combiné du prix, des dividendes/coupons/profits, du change et de l’inflation. Les métaux utilisent des moyennes annuelles/mensuelles de benchmark et ne représentent pas nécessairement le prix d’achat physique local avec prime/spread."
    }
   ]
  },
  {
   "id": "12-1-backtest-actions-d-tail-des-revenus",
   "title": "12.1 Backtest actions — détail des revenus",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Ticker",
       "Société",
       "Unités initiales",
       "Dividendes cumulés DZD",
       "Valeur finale DZD",
       "Rendement nominal",
       "Valeur réelle"
      ],
      [
       "ALL",
       "Alliance Assurances",
       "41,6667",
       "7 250",
       "29 750",
       "197,50 %",
       "20 903"
      ],
      [
       "BIO",
       "Biopharm",
       "8,1633",
       "6 686",
       "26 294",
       "162,94 %",
       "18 474"
      ],
      [
       "SAI",
       "Saidal",
       "18,1159",
       "1 014",
       "9 167",
       "-8,33 %",
       "6 441"
      ],
      [
       "AUR",
       "EGH El Aurassi",
       "18,1818",
       "0",
       "6 255",
       "-37,45 %",
       "4 395"
      ],
      [
       "AOM",
       "AOM Invest",
       "20,4082",
       "144",
       "6 063",
       "-39,37 %",
       "4 260"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Alliance : les unités finales deviennent 62,5 après attribution gratuite 1/2 de 2025; le backtest n’interprète donc pas la baisse mécanique du cours comme une perte économique. L’attribution 3/5 de 2020 est déjà incorporée dans le cours de départ du 31/12/2020."
    }
   ]
  },
  {
   "id": "13-d-cisions-d-architecture-sp-cificatio",
   "title": "13. Décisions d’architecture — spécification de production",
   "level": 1,
   "blocks": []
  },
  {
   "id": "13-1-mod-le-d-observation-universel",
   "title": "13.1 Modèle d’observation universel",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Champ",
       "Type / règle"
      ],
      [
       "asset_id",
       "Identifiant stable, jamais dérivé du nom"
      ],
      [
       "asset_type",
       "equity/index/bond/sukuk/deposit/fx/metal/real_estate"
      ],
      [
       "observation_date",
       "Date économique réelle"
      ],
      [
       "observation_type",
       "trade_close/reference/VWAP/annual_average/rate/coupon/dividend/profit_share/profit_realized"
      ],
      [
       "value + unit",
       "Valeur et unité explicites"
      ],
      [
       "Traded",
       "booléen; false si aucune transaction"
      ],
      [
       "last_trade_date",
       "obligatoire si traded=false pour titre coté"
      ],
      [
       "volume / transactions_count",
       "0 si séance sans transaction; pas null si source donne 0"
      ],
      [
       "source_id / source_url",
       "preuve primaire"
      ],
      [
       "effective_from/to",
       "obligatoire pour taux bancaires"
      ],
      [
       "quality_grade",
       "A/B/C/D"
      ],
      [
       "stale_price",
       "true si référence ancienne"
      ],
      [
       "methodology_version",
       "version du calcul FINCLUDIA"
      ]
     ]
    }
   ]
  },
  {
   "id": "13-2-tables-sp-cialis-es",
   "title": "13.2 Tables spécialisées",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Table",
       "Clés / champs"
      ],
      [
       "market_prices",
       "asset_id,date,open,high,low,close,reference,vwap,volume,transactions,no_trade"
      ],
      [
       "corporate_actions",
       "ticker,type,ex_date,record_date,payment_date,ratio,cash_amount,source"
      ],
      [
       "fixed_income",
       "isin,nominal,coupon,maturity,clean_price,accrued_interest,dirty_price,ytm,duration"
      ],
      [
       "bank_offer_versions",
       "bank,product,currency,tenor,amount_band,rate,effective_from,to,tax,source"
      ],
      [
       "currency_deposit_rates",
       "quarter,currency,tenor,rate,source"
      ],
      [
       "islamic_profit_terms",
       "bank,product,contract,client_share,bank_share,target_profit,guaranteed=false"
      ],
      [
       "islamic_profit_distributions",
       "bank,product,period,realized_profit_rate,client_amount,source"
      ],
      [
       "inflation_series",
       "period,measure_type,index_level,rate"
      ],
      [
       "fx_series",
       "date,currency,official_rate_DZD"
      ],
      [
       "portfolio_positions",
       "asset_id,quantity,cost_basis,fees,flows,valuation,real_return"
      ]
     ]
    }
   ]
  },
  {
   "id": "13-3-r-gles-de-calcul",
   "title": "13.3 Règles de calcul",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Indicateur",
       "Formule canonique"
      ],
      [
       "Action total return",
       "(V_fin − V_début + dividendes + valeur droits/corporate actions) / V_début"
      ],
      [
       "Obligation",
       "(prix_fin − prix_début + coupons + remboursement) / prix_début"
      ],
      [
       "Sukuk",
       "(prix_fin − prix_début + loyers/distributions) / prix_début"
      ],
      [
       "DAT",
       "selon contrat : intérêt simple / capitalisation; jamais supposer"
      ],
      [
       "Actif devise en DZD",
       "(1+r_actif_devise)×(1+r_change)−1"
      ],
      [
       "Rendement reel",
       "(1+r_nominal)/(1+inflation)−1"
      ],
      [
       "TWR",
       "chaînage des sous-périodes entre flux externes"
      ],
      [
       "XIRR",
       "taux qui annule la VAN des flux datés"
      ]
     ]
    }
   ]
  },
  {
   "id": "13-4-gestion-des-donn-es-manquantes",
   "title": "13.4 Gestion des données manquantes",
   "level": 2,
   "blocks": [
    {
     "type": "para",
     "text": "NOT_LISTED : actif non coté avant sa date d’admission — pas zéro."
    },
    {
     "type": "para",
     "text": "NO_TRADE : séance existe mais aucune transaction — garder dernier prix valide + âge du prix."
    },
    {
     "type": "para",
     "text": "NOT_PUBLISHED : produit existe mais le taux/profit n’est pas publié publiquement — exclure des comparaisons chiffrées jusqu’à une source datée."
    },
    {
     "type": "para",
     "text": "NOT_ISSUED : instrument inexistant à la date (ex. SK32 avant 2026)."
    },
    {
     "type": "para",
     "text": "USER_VALUED : immobilier/participation privée; valeur déclarée séparée d’un benchmark."
    },
    {
     "type": "para",
     "text": "ESTIMATED : calcul FINCLUDIA à partir de données officielles; formule et inputs doivent être affichables."
    }
   ]
  },
  {
   "id": "13-5-crans-investlab-recommand-s",
   "title": "13.5 Écrans InvestLab recommandés",
   "level": 2,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Écran",
       "Fonction"
      ],
      [
       "Marché Algérie",
       "DZAIRINDEX + actions + liquidité + dividendes"
      ],
      [
       "Fiche action",
       "Cours, corporate actions, rendement prix/dividende/total, courbe"
      ],
      [
       "Dette souveraine",
       "BTC/BTA/OAT, courbe de taux, lignes par ISIN"
      ],
      [
       "Épargne & DAT",
       "Comparateur banque/produit/durée/montant"
      ],
      [
       "Devises",
       "FX + DAT devise + effet change"
      ],
      [
       "Finance islamique",
       "Contrat, clé de partage, profit réalisé, non-garantie"
      ],
      [
       "Métaux",
       "USD et DZD, effet change"
      ],
      [
       "Backtest",
       "Montant/date → valeur nominale/réelle, flux, base 100"
      ],
      [
       "Qualité data",
       "Source, date, grade, stale/no-trade"
      ]
     ]
    }
   ]
  },
  {
   "id": "14-registre-des-sources-r-f-rences-visib",
   "title": "14. Registre des sources — références visibles",
   "level": 1,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "ID",
       "Institution / document",
       "URL"
      ],
      [
       "S01",
       "SGBV — cote officielle / titres / rendement courant",
       "https://www.sgbv.dz/"
      ],
      [
       "S02",
       "COSOB — rapports annuels 2020 à 2024",
       "https://cosob.dz/"
      ],
      [
       "S03",
       "Banque d’Algérie — données historiques / change",
       "https://www.bank-of-algeria.dz/donnees-historiques/"
      ],
      [
       "S04",
       "ONS — IPC annuel 2024",
       "https://www.ons.dz/IMG/pdf/Note_annuelle_IPC2024.pdf"
      ],
      [
       "S05",
       "Banque mondiale — Commodity Markets / Pink Sheet",
       "https://thedocs.worldbank.org/en/doc/74e8be41ceb20fa0da750cda2f6b9e4e-0050012026/world-bank-commodities-price-data-the-pink-sheet"
      ],
      [
       "S06",
       "SGBV — Alliance attribution gratuite 3/5, Avis 73/20",
       "https://www.sgbv.dz/commons/fr/avis/Avis702592312.pdf"
      ],
      [
       "S07",
       "SGBV — Alliance droit d’attribution 1/2 2025",
       "https://www.sgbv.dz/?lang=fr&page=rubrique&smod=166"
      ],
      [
       "S08",
       "SGBV — NCA Rouiba OPR/radiation",
       "https://www.sgbv.dz/commons/fr/boc/boc450158294.pdf"
      ],
      [
       "S09",
       "Banque d’Algérie — Rapport 2024, marché des titres du Trésor",
       "https://www.bank-of-algeria.dz/wp-content/uploads/2025/09/Rapport-2024-fr.pdf"
      ],
      [
       "S10",
       "SGBV — statistiques OAT séance 17/11/2026",
       "https://www.sgbv.dz/?id_sea=2060&lang=fr&page=details_boc_oat"
      ],
      [
       "S11",
       "BNA — Conditions générales de banque particuliers",
       "https://www.bna.dz/"
      ],
      [
       "S12",
       "BEA — Épargne / placements à terme",
       "https://bea.dz/epargne"
      ],
      [
       "S13",
       "CPA — Conditions tarifaires 2025 / DAT",
       "https://www.cpa-bank.dz/images/docs/conditions-tarifaires/conditions-tarifaires-pour-entreprises.pdf"
      ],
      [
       "S14",
       "CPA — Épargne et placement",
       "https://www.cpa-bank.dz/index.php/fr/nos-produits/epargne-et-placement/epargne-et-placement"
      ],
      [
       "S15",
       "BDL — épargne / BDC / DAT",
       "https://www.bdl.dz/"
      ],
      [
       "S16",
       "AGB — Conditions de banque",
       "https://www.agb.dz/rapports/conditions/Conditionsdebanque.pdf"
      ],
      [
       "S17",
       "Banque d’Algérie — Instruction 01-2022 comptes devises",
       "https://www.bank-of-algeria.dz/stoodroa/2022/04/instruction012022.pdf"
      ],
      [
       "S18",
       "Banque d’Algérie — archive rémunération comptes devises",
       "https://www.bank-of-algeria.dz/remuneration-des-comptes-devises/"
      ],
      [
       "S19",
       "CPA — Finance islamique, conditions 2025",
       "https://www.cpa-bank.dz/images/docs/Conditions_tarifaires_des_produits_de_Finance_Islamique.pdf"
      ],
      [
       "S20",
       "CNEP-Banque — Conditions de banque islamiques",
       "https://www.cnepbanque.dz/web/wp-content/uploads/2023/11/CNEP-BANQUE-FINANCE-ISLAMIQUE-PRINT.pdf"
      ],
      [
       "S21",
       "BEA — Tarification finance islamique",
       "https://www.bea.dz/islamique-conditions"
      ],
      [
       "S22",
       "BDL — Moudaraba",
       "https://www.bdl.dz/finance-islamique/?page_id=7055"
      ],
      [
       "S23",
       "Al Baraka — Conditions de banque",
       "https://www.albaraka-bank.dz/wp-content/uploads/2023/07/Conditions-de-banque.pdf"
      ],
      [
       "S24",
       "Al Baraka — Compte de dépôts participatifs",
       "https://www.albaraka-bank.dz/particuliers/investissements/compte-de-depots-participatifs/"
      ],
      [
       "S25",
       "ONS — IPC 2026 / publication mensuelle",
       "https://www.ons.dz/"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Toutes les données de ce document sont destinées au laboratoire pédagogique FINCLUDIA. Elles ne constituent ni une recommandation d’investissement, ni une promesse de rendement, ni une offre bancaire. Les performances passées ne préjugent pas des performances futures."
    }
   ]
  },
  {
   "id": "annexe-a-lecture-des-rendements-action-2",
   "title": "Annexe A — lecture des rendements action 2025/2026",
   "level": 1,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Ticker",
       "Dividende exercice 2025 (DA)",
       "Cours fin 2025 (DA)",
       "Yield exercice 2025 FINCLUDIA",
       "Cours 17/11/26",
       "Yield courant SGBV"
      ],
      [
       "ALL",
       "26,00",
       "330",
       "7,88 %",
       "360",
       "7,22 %"
      ],
      [
       "BIO",
       "170,00",
       "2 501",
       "6,80 %",
       "2 402",
       "7,08 %"
      ],
      [
       "SAI",
       "35,00",
       "420",
       "8,33 %",
       "450",
       "7,78 %"
      ],
      [
       "CPA",
       "175,00",
       "2 300",
       "7,61 %",
       "1 994",
       "8,78 %"
      ],
      [
       "BDL",
       "107,00",
       "1 410",
       "7,59 %",
       "1 400",
       "7,64 %"
      ],
      [
       "AOM",
       "0,00",
       "290",
       "0,00 %",
       "290",
       "—"
      ],
      [
       "MST",
       "0,00",
       "800",
       "0,00 %",
       "725",
       "—"
      ],
      [
       "AUR",
       "0,00",
       "360",
       "0,00 %",
       "344",
       "—"
      ]
     ]
    },
    {
     "type": "para",
     "text": "Le yield exercice et le yield courant répondent à deux questions différentes : le premier rapporte le dividende d’un exercice au cours de fin de cet exercice; le second rapporte le dernier dividende connu au cours courant. Les deux sont utiles et ne doivent pas être mélangés."
    }
   ]
  },
  {
   "id": "annexe-b-hypoth-ses-du-backtest-10-000-d",
   "title": "Annexe B — hypothèses du backtest 10 000 DZD",
   "level": 1,
   "blocks": [
    {
     "type": "table",
     "rows": [
      [
       "Hypothèse",
       "Valeur"
      ],
      [
       "Date de depart",
       "31/12/2020"
      ],
      [
       "Date finale",
       "17/11/2026 ou dernier repère 2026 disponible"
      ],
      [
       "Fractionnement",
       "Autorisé pédagogiquement"
      ],
      [
       "Dividendes",
       "Cash, non réinvestis"
      ],
      [
       "Frais/fiscalité",
       "Exclus du benchmark brut; ajouter en mode net"
      ],
      [
       "Alliance 2025",
       "Attribution 1 action nouvelle pour 2 anciennes appliquée"
      ],
      [
       "Inflation",
       "Cumul 2021–2026, 2026 glissant utilisé comme proxy"
      ],
      [
       "OAT",
       "Approximation prix propre + 6 coupons, sans coupon couru exact"
      ],
      [
       "DAT devises",
       "Taux 1 an représentatifs annuels, pas les 28 trimestres en chaînage"
      ],
      [
       "Métaux",
       "Benchmarks internationaux; pas de prime locale/spread physique"
      ]
     ]
    }
   ]
  }
 ],
 "stocks": {
  "ALL": {
   "compartment": "Principal",
   "name": "Alliance Assurances",
   "sector": "Assurance",
   "isin": "DZ0000010037",
   "price": 360.0,
   "currentYield": 0.0722,
   "prices": {
    "2020": 240.0,
    "2021": 300.0,
    "2022": 403.0,
    "2023": 440.0,
    "2024": 420.0,
    "2025": 330.0,
    "2026": 360.0
   }
  },
  "AYRD": {
   "compartment": "Principal",
   "name": "Ayrade",
   "sector": "Technologies",
   "isin": null,
   "price": 830.0,
   "currentYield": null,
   "prices": {
    "2020": null,
    "2021": null,
    "2022": null,
    "2023": null,
    "2024": null,
    "2025": null,
    "2026": 830.0
   }
  },
  "BDL": {
   "compartment": "Principal",
   "name": "Banque de Développement Local",
   "sector": "Banque",
   "isin": "DZ0000010086",
   "price": 1400.0,
   "currentYield": 0.0764,
   "prices": {
    "2020": null,
    "2021": null,
    "2022": null,
    "2023": null,
    "2024": null,
    "2025": 1410.0,
    "2026": 1400.0
   }
  },
  "BIO": {
   "compartment": "Principal",
   "name": "Biopharm",
   "sector": "Pharmaceutique",
   "isin": "DZ0000010052",
   "price": 2402.0,
   "currentYield": 0.0708,
   "prices": {
    "2020": 1225.0,
    "2021": 1302.0,
    "2022": 2123.0,
    "2023": 2300.0,
    "2024": 2350.0,
    "2025": 2501.0,
    "2026": 2402.0
   }
  },
  "CPA": {
   "compartment": "Principal",
   "name": "Crédit Populaire d’Algérie",
   "sector": "Banque",
   "isin": "DZ0000010078",
   "price": 1994.0,
   "currentYield": 0.0878,
   "prices": {
    "2020": null,
    "2021": null,
    "2022": null,
    "2023": null,
    "2024": 2250.0,
    "2025": 2300.0,
    "2026": 1994.0
   }
  },
  "AUR": {
   "compartment": "Principal",
   "name": "EGH El Aurassi",
   "sector": "Hôtellerie",
   "isin": "DZ0000010045",
   "price": 344.0,
   "currentYield": null,
   "prices": {
    "2020": 550.0,
    "2021": 560.0,
    "2022": 495.0,
    "2023": 450.0,
    "2024": 400.0,
    "2025": 360.0,
    "2026": 344.0
   }
  },
  "SAI": {
   "compartment": "Principal",
   "name": "Saidal",
   "sector": "Pharmaceutique",
   "isin": "DZ0000010011",
   "price": 450.0,
   "currentYield": 0.0778,
   "prices": {
    "2020": 552.0,
    "2021": 543.0,
    "2022": 530.0,
    "2023": 500.0,
    "2024": 405.0,
    "2025": 420.0,
    "2026": 450.0
   }
  },
  "AOM": {
   "compartment": "Croissance",
   "name": "AOM Invest",
   "sector": "Tourisme",
   "isin": "DZ0000010060",
   "price": 290.0,
   "currentYield": null,
   "prices": {
    "2020": 490.0,
    "2021": 490.0,
    "2022": 267.0,
    "2023": 290.0,
    "2024": 292.0,
    "2025": 290.0,
    "2026": 290.0
   }
  },
  "CREX": {
   "compartment": "Croissance",
   "name": "CRAPC Expertise",
   "sector": "Expertise / R&D",
   "isin": null,
   "price": 1600.0,
   "currentYield": null,
   "prices": {
    "2020": null,
    "2021": null,
    "2022": null,
    "2023": null,
    "2024": null,
    "2025": null,
    "2026": 1600.0
   }
  },
  "MST": {
   "compartment": "Croissance",
   "name": "Moustachir",
   "sector": "Conseil",
   "isin": "DZ0000010094",
   "price": 725.0,
   "currentYield": null,
   "prices": {
    "2020": null,
    "2021": null,
    "2022": null,
    "2023": null,
    "2024": 760.0,
    "2025": 800.0,
    "2026": 725.0
   }
  }
 },
 "dividends": [
  {
   "year": 2020,
   "ticker": "ALL",
   "dps": 32.0,
   "yieldCosob": null
  },
  {
   "year": 2020,
   "ticker": "BIO",
   "dps": 115.0,
   "yieldCosob": null
  },
  {
   "year": 2020,
   "ticker": "SAI",
   "dps": 0.0,
   "yieldCosob": null
  },
  {
   "year": 2020,
   "ticker": "AUR",
   "dps": 0.0,
   "yieldCosob": null
  },
  {
   "year": 2020,
   "ticker": "AOM",
   "dps": 0.0,
   "yieldCosob": null
  },
  {
   "year": 2021,
   "ticker": "ALL",
   "dps": 35.0,
   "yieldCosob": 0.1166
  },
  {
   "year": 2021,
   "ticker": "BIO",
   "dps": 175.0,
   "yieldCosob": 0.1344
  },
  {
   "year": 2021,
   "ticker": "SAI",
   "dps": 0.0,
   "yieldCosob": null
  },
  {
   "year": 2021,
   "ticker": "AUR",
   "dps": 0.0,
   "yieldCosob": null
  },
  {
   "year": 2021,
   "ticker": "AOM",
   "dps": 2.3,
   "yieldCosob": 0.0046
  },
  {
   "year": 2022,
   "ticker": "ALL",
   "dps": 35.0,
   "yieldCosob": 0.0868
  },
  {
   "year": 2022,
   "ticker": "BIO",
   "dps": 134.0,
   "yieldCosob": 0.0631
  },
  {
   "year": 2022,
   "ticker": "SAI",
   "dps": 0.0,
   "yieldCosob": null
  },
  {
   "year": 2022,
   "ticker": "AUR",
   "dps": 0.0,
   "yieldCosob": null
  },
  {
   "year": 2022,
   "ticker": "AOM",
   "dps": 2.6,
   "yieldCosob": 0.0097
  },
  {
   "year": 2023,
   "ticker": "ALL",
   "dps": 30.0,
   "yieldCosob": 0.0681
  },
  {
   "year": 2023,
   "ticker": "BIO",
   "dps": 180.0,
   "yieldCosob": 0.0782
  },
  {
   "year": 2023,
   "ticker": "SAI",
   "dps": 0.0,
   "yieldCosob": null
  },
  {
   "year": 2023,
   "ticker": "AUR",
   "dps": 0.0,
   "yieldCosob": null
  },
  {
   "year": 2023,
   "ticker": "AOM",
   "dps": 0.0,
   "yieldCosob": null
  },
  {
   "year": 2023,
   "ticker": "CPA",
   "dps": 125.0,
   "yieldCosob": 0.0543
  },
  {
   "year": 2024,
   "ticker": "ALL",
   "dps": 35.0,
   "yieldCosob": 0.0833
  },
  {
   "year": 2024,
   "ticker": "BIO",
   "dps": 160.0,
   "yieldCosob": 0.0681
  },
  {
   "year": 2024,
   "ticker": "SAI",
   "dps": 21.0,
   "yieldCosob": 0.061
  },
  {
   "year": 2024,
   "ticker": "AUR",
   "dps": 0.0,
   "yieldCosob": null
  },
  {
   "year": 2024,
   "ticker": "AOM",
   "dps": 2.18,
   "yieldCosob": 0.0075
  },
  {
   "year": 2024,
   "ticker": "CPA",
   "dps": 125.0,
   "yieldCosob": 0.0556
  },
  {
   "year": 2024,
   "ticker": "BDL",
   "dps": 77.77,
   "yieldCosob": 0.0555
  },
  {
   "year": 2024,
   "ticker": "MST",
   "dps": 8.0,
   "yieldCosob": 0.0105
  },
  {
   "year": 2025,
   "ticker": "ALL",
   "dps": 26.0,
   "yieldCosob": null
  },
  {
   "year": 2025,
   "ticker": "BIO",
   "dps": 170.0,
   "yieldCosob": null
  },
  {
   "year": 2025,
   "ticker": "SAI",
   "dps": 35.0,
   "yieldCosob": null
  },
  {
   "year": 2025,
   "ticker": "AUR",
   "dps": 0.0,
   "yieldCosob": null
  },
  {
   "year": 2025,
   "ticker": "AOM",
   "dps": 0.0,
   "yieldCosob": null
  },
  {
   "year": 2025,
   "ticker": "CPA",
   "dps": 175.0,
   "yieldCosob": null
  },
  {
   "year": 2025,
   "ticker": "BDL",
   "dps": 107.0,
   "yieldCosob": null
  },
  {
   "year": 2025,
   "ticker": "MST",
   "dps": 0.0,
   "yieldCosob": null
  }
 ],
 "actions": [
  {
   "name": "Alliance ALL",
   "ticker": "ALL",
   "date": "2020-12-22",
   "operation": "Attribution gratuite",
   "effect": "3 nouvelles pour 5 anciennes",
   "treatment": "Quantité × 1,6; cours ajusté ex-droit",
   "factor": 1.6
  },
  {
   "name": "Alliance ALL",
   "ticker": "ALL",
   "date": "2025-11-26",
   "operation": "Attribution gratuite",
   "effect": "1 nouvelle pour 2 anciennes",
   "treatment": "Quantité × 1,5; droit DAL2 coté puis radié 02/02/2026",
   "factor": 1.5
  },
  {
   "name": "NCA Rouiba",
   "ticker": "Rouiba",
   "date": "2020-07-26",
   "operation": "Radiation après OPR",
   "effect": "Titre retiré de la cote",
   "treatment": "Conserver l’historique; exclure univers courant",
   "factor": null
  }
 ],
 "index": {
  "2020": 1670.85,
  "2021": 1923.61,
  "2022": 3082.11,
  "2023": 3453.24,
  "2024": 3553.37,
  "2025": 3845.12,
  "2026": 3813.258
 },
 "inflation": {
  "2020": {
   "rate": 0.0242,
   "status": "Année civile"
  },
  "2021": {
   "rate": 0.0723,
   "status": "Année civile"
  },
  "2022": {
   "rate": 0.0927,
   "status": "Année civile"
  },
  "2023": {
   "rate": 0.0932,
   "status": "Année civile"
  },
  "2024": {
   "rate": 0.0405,
   "status": "Année civile"
  },
  "2025": {
   "rate": 0.018,
   "status": "Année civile"
  },
  "2026": {
   "rate": 0.049,
   "status": "Rythme glissant 2026 — pas année civile"
  }
 },
 "metals": {
  "2020": {
   "gold": 1770.0,
   "silver": 20.5,
   "platinum": 883.0,
   "usdDzd": 132.13
  },
  "2021": {
   "gold": 1800.0,
   "silver": 25.2,
   "platinum": 1091.0,
   "usdDzd": 138.84
  },
  "2022": {
   "gold": 1801.0,
   "silver": 21.8,
   "platinum": 962.0,
   "usdDzd": 137.22
  },
  "2023": {
   "gold": 1943.0,
   "silver": 23.4,
   "platinum": 966.0,
   "usdDzd": 134.27
  },
  "2024": {
   "gold": 2388.0,
   "silver": 28.3,
   "platinum": 955.0,
   "usdDzd": 135.66
  },
  "2025": {
   "gold": 3442.0,
   "silver": 39.8,
   "platinum": 1278.0,
   "usdDzd": 135.1
  },
  "2026": {
   "gold": 4105.0,
   "silver": 57.0,
   "platinum": 1621.0,
   "usdDzd": 136.7
  }
 },
 "reference": [
  {
   "asset": "ALL",
   "initial": 10000.0,
   "final": 29750.0,
   "income": 7250.0,
   "nominal": 1.975,
   "real": 20903.0,
   "realReturn": 1.0903
  },
  {
   "asset": "Argent",
   "initial": 10000.0,
   "final": 28767.0,
   "income": 0.0,
   "nominal": 1.8767,
   "real": 20212.0,
   "realReturn": 1.0212
  },
  {
   "asset": "BIO",
   "initial": 10000.0,
   "final": 26294.0,
   "income": 6686.0,
   "nominal": 1.6294,
   "real": 18474.0,
   "realReturn": 0.8474
  },
  {
   "asset": "Or",
   "initial": 10000.0,
   "final": 23994.0,
   "income": 0.0,
   "nominal": 1.3994,
   "real": 16859.0,
   "realReturn": 0.6859
  },
  {
   "asset": "DZAIRINDEX",
   "initial": 10000.0,
   "final": 22822.0,
   "income": 0.0,
   "nominal": 1.2822,
   "real": 16035.0,
   "realReturn": 0.6035
  },
  {
   "asset": "Platine",
   "initial": 10000.0,
   "final": 18993.0,
   "income": 0.0,
   "nominal": 0.8993,
   "real": 13345.0,
   "realReturn": 0.3345
  },
  {
   "asset": "OAT O100230",
   "initial": 10000.0,
   "final": 14372.0,
   "income": 3838.0,
   "nominal": 0.4372,
   "real": 10098.0,
   "realReturn": 0.0098
  },
  {
   "asset": "DAT devise USD",
   "initial": 10000.0,
   "final": 12958.0,
   "income": 2958.0,
   "nominal": 0.2958,
   "real": 9104.0,
   "realReturn": -0.0896
  },
  {
   "asset": "DAT devise GBP",
   "initial": 10000.0,
   "final": 12499.0,
   "income": 2499.0,
   "nominal": 0.2499,
   "real": 8782.0,
   "realReturn": -0.1218
  },
  {
   "asset": "Épargne DZD 2,5% (scénario)",
   "initial": 10000.0,
   "final": 11597.0,
   "income": 1597.0,
   "nominal": 0.1597,
   "real": 8148.0,
   "realReturn": -0.1852
  },
  {
   "asset": "DAT devise EUR",
   "initial": 10000.0,
   "final": 10597.0,
   "income": 597.0,
   "nominal": 0.0597,
   "real": 7446.0,
   "realReturn": -0.2554
  },
  {
   "asset": "SAI",
   "initial": 10000.0,
   "final": 9167.0,
   "income": 1014.0,
   "nominal": -0.0833,
   "real": 6441.0,
   "realReturn": -0.3559
  },
  {
   "asset": "AUR",
   "initial": 10000.0,
   "final": 6255.0,
   "income": 0.0,
   "nominal": -0.3745,
   "real": 4395.0,
   "realReturn": -0.5605
  },
  {
   "asset": "AOM",
   "initial": 10000.0,
   "final": 6063.0,
   "income": 144.0,
   "nominal": -0.3937,
   "real": 4260.0,
   "realReturn": -0.574
  }
 ],
 "sources": [
  {
   "id": "S01",
   "label": "SGBV — cote officielle / titres / rendement courant",
   "url": "https://www.sgbv.dz/"
  },
  {
   "id": "S02",
   "label": "COSOB — rapports annuels 2020 à 2024",
   "url": "https://cosob.dz/"
  },
  {
   "id": "S03",
   "label": "Banque d’Algérie — données historiques / change",
   "url": "https://www.bank-of-algeria.dz/donnees-historiques/"
  },
  {
   "id": "S04",
   "label": "ONS — IPC annuel 2024",
   "url": "https://www.ons.dz/IMG/pdf/Note_annuelle_IPC2024.pdf"
  },
  {
   "id": "S05",
   "label": "Banque mondiale — Commodity Markets / Pink Sheet",
   "url": "https://thedocs.worldbank.org/en/doc/74e8be41ceb20fa0da750cda2f6b9e4e-0050012026/world-bank-commodities-price-data-the-pink-sheet"
  },
  {
   "id": "S06",
   "label": "SGBV — Alliance attribution gratuite 3/5, Avis 73/20",
   "url": "https://www.sgbv.dz/commons/fr/avis/Avis702592312.pdf"
  },
  {
   "id": "S07",
   "label": "SGBV — Alliance droit d’attribution 1/2 2025",
   "url": "https://www.sgbv.dz/?lang=fr&page=rubrique&smod=166"
  },
  {
   "id": "S08",
   "label": "SGBV — NCA Rouiba OPR/radiation",
   "url": "https://www.sgbv.dz/commons/fr/boc/boc450158294.pdf"
  },
  {
   "id": "S09",
   "label": "Banque d’Algérie — Rapport 2024, marché des titres du Trésor",
   "url": "https://www.bank-of-algeria.dz/wp-content/uploads/2025/09/Rapport-2024-fr.pdf"
  },
  {
   "id": "S10",
   "label": "SGBV — statistiques OAT séance 17/11/2026",
   "url": "https://www.sgbv.dz/?id_sea=2060&lang=fr&page=details_boc_oat"
  },
  {
   "id": "S11",
   "label": "BNA — Conditions générales de banque particuliers",
   "url": "https://www.bna.dz/"
  },
  {
   "id": "S12",
   "label": "BEA — Épargne / placements à terme",
   "url": "https://bea.dz/epargne"
  },
  {
   "id": "S13",
   "label": "CPA — Conditions tarifaires 2025 / DAT",
   "url": "https://www.cpa-bank.dz/images/docs/conditions-tarifaires/conditions-tarifaires-pour-entreprises.pdf"
  },
  {
   "id": "S14",
   "label": "CPA — Épargne et placement",
   "url": "https://www.cpa-bank.dz/index.php/fr/nos-produits/epargne-et-placement/epargne-et-placement"
  },
  {
   "id": "S15",
   "label": "BDL — épargne / BDC / DAT",
   "url": "https://www.bdl.dz/"
  },
  {
   "id": "S16",
   "label": "AGB — Conditions de banque",
   "url": "https://www.agb.dz/rapports/conditions/Conditionsdebanque.pdf"
  },
  {
   "id": "S17",
   "label": "Banque d’Algérie — Instruction 01-2022 comptes devises",
   "url": "https://www.bank-of-algeria.dz/stoodroa/2022/04/instruction012022.pdf"
  },
  {
   "id": "S18",
   "label": "Banque d’Algérie — archive rémunération comptes devises",
   "url": "https://www.bank-of-algeria.dz/remuneration-des-comptes-devises/"
  },
  {
   "id": "S19",
   "label": "CPA — Finance islamique, conditions 2025",
   "url": "https://www.cpa-bank.dz/images/docs/Conditions_tarifaires_des_produits_de_Finance_Islamique.pdf"
  },
  {
   "id": "S20",
   "label": "CNEP-Banque — Conditions de banque islamiques",
   "url": "https://www.cnepbanque.dz/web/wp-content/uploads/2023/11/CNEP-BANQUE-FINANCE-ISLAMIQUE-PRINT.pdf"
  },
  {
   "id": "S21",
   "label": "BEA — Tarification finance islamique",
   "url": "https://www.bea.dz/islamique-conditions"
  },
  {
   "id": "S22",
   "label": "BDL — Moudaraba",
   "url": "https://www.bdl.dz/finance-islamique/?page_id=7055"
  },
  {
   "id": "S23",
   "label": "Al Baraka — Conditions de banque",
   "url": "https://www.albaraka-bank.dz/wp-content/uploads/2023/07/Conditions-de-banque.pdf"
  },
  {
   "id": "S24",
   "label": "Al Baraka — Compte de dépôts participatifs",
   "url": "https://www.albaraka-bank.dz/particuliers/investissements/compte-de-depots-participatifs/"
  },
  {
   "id": "S25",
   "label": "ONS — IPC 2026 / publication mensuelle",
   "url": "https://www.ons.dz/"
  }
 ]
};

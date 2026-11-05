// Les 25 intentions de l'assistant déterministe (P3-19, contenu de P6-22) —
// GÉNÉRÉ par scripts/generate-assistant-goals.py depuis l'onglet
// `20_Assistant_25`. Ne pas modifier à la main : relancer le script.
//
// Elles remplacent les 8 intentions brouillon que l'équipe avait écrites faute
// de contenu. Le catalogue du client est plus riche sur trois points, et le
// troisième est le plus important :
//
//   `triggers`   les mots qui déclenchent l'intention, tels que le client les
//                a listés — c'est ce qui rend la reconnaissance DÉTERMINISTE.
//   `steps`      les questions à poser, dans l'ordre : une machine à états,
//                pas une conversation libre.
//   `guardrail`  ce que l'assistant N'A PAS LE DROIT de faire. « Ne jamais
//                demander un code PIN/OTP/mot de passe » (CB22), « ne jamais
//                deviner un taux » (CB24), « aucune réponse libre » (CB99).
//                Ces phrases sont la moitié de la valeur du catalogue.
//
// Aucune réponse n'est générée : l'assistant choisit parmi ces 25 entrées ou
// retombe sur CB99, qui propose des thèmes au lieu d'improviser.
export const FIN_INTENT_CATALOGUE = [
  {
    "code": "CB01",
    "label": "Budget négatif",
    "triggers": [
      "budget négatif",
      "je dépense trop",
      "plus d’argent"
    ],
    "steps": [
      "Quel est votre revenu net mensuel ?",
      "Quelles dépenses sont obligatoires ?",
      "Quelles dépenses sont flexibles ?"
    ],
    "answer": "Calcule solde, identifie 3 catégories principales, propose ouvrir Enveloppes / Réduire une dépense / Réviser contribution objectif.",
    "guardrail": "Aucun crédit proposé automatiquement.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB02",
    "label": "Créer un budget",
    "triggers": [
      "faire un budget",
      "commencer budget"
    ],
    "steps": [
      "Vos ressources sont-elles mensuelles ou irrégulières ?",
      "Ajoutez obligations",
      "essentielles",
      "flexibles",
      "épargne"
    ],
    "answer": "Crée enveloppes proposées et laisse tout modifier.",
    "guardrail": "Répartition automatique = suggestion uniquement.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB03",
    "label": "Enveloppe dépassée",
    "triggers": [
      "enveloppe dépassée",
      "transport trop élevé"
    ],
    "steps": [
      "Voulez-vous voir les dépenses de cette enveloppe ou déplacer du budget ?"
    ],
    "answer": "Affiche réalisé, restant, projection, options: réduire / transférer / accepter dépassement.",
    "guardrail": "Ne change jamais une enveloppe sans confirmation.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB04",
    "label": "Combien puis-je épargner ?",
    "triggers": [
      "épargner combien",
      "capacité épargne"
    ],
    "steps": [
      "Revenus",
      "dépenses essentielles/obligatoires",
      "dettes",
      "réserve actuelle"
    ],
    "answer": "Affiche surplus moyen, contribution prudente choisie par utilisateur, scénario 5/10/15%.",
    "guardrail": "Pas de prescription unique.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB05",
    "label": "Réserve de sécurité",
    "triggers": [
      "fonds urgence",
      "réserve",
      "épargne sécurité"
    ],
    "steps": [
      "Quel est votre profil ?",
      "dépenses essentielles",
      "liquidités disponibles"
    ],
    "answer": "Mois couverts + cible profil + écart + contribution.",
    "guardrail": "Cible FINCLUDIA personnalisable.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB06",
    "label": "Créer un objectif",
    "triggers": [
      "objectif",
      "économiser pour"
    ],
    "steps": [
      "Montant cible ?",
      "date ?",
      "capital déjà disponible ?"
    ],
    "answer": "Contribution requise, progression, scénarios durée/contribution.",
    "guardrail": "Avertit si contribution dépasse surplus disponible.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB07",
    "label": "Dette trop élevée",
    "triggers": [
      "trop de dettes",
      "mensualités élevées"
    ],
    "steps": [
      "Revenu net",
      "mensualités",
      "dépenses essentielles",
      "dettes avec soldes/taux"
    ],
    "answer": "DSR, marge après dette, avalanche/neige, alerte interne.",
    "guardrail": "Ne qualifie pas automatiquement “bonne/mauvaise dette”.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB08",
    "label": "Rembourser plus vite",
    "triggers": [
      "rembourser dette",
      "paiement supplémentaire"
    ],
    "steps": [
      "Quelle dette ?",
      "paiement supplémentaire mensuel/ponctuel ?"
    ],
    "answer": "Nouvelle durée, coût évité indicatif, effet sur budget.",
    "guardrail": "Utilise taux uniquement s’il est connu.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB09",
    "label": "Simuler un crédit",
    "triggers": [
      "crédit",
      "mensualité",
      "prêt"
    ],
    "steps": [
      "Montant",
      "durée",
      "taux/offre",
      "frais",
      "autres mensualités"
    ],
    "answer": "Mensualité, coût total, DSR futur, capacité indicative.",
    "guardrail": "Pas accord de crédit; si taux banque inconnu, demander valeur ou choisir offre sourcée.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB10",
    "label": "Acheter une voiture",
    "triggers": [
      "voiture",
      "auto"
    ],
    "steps": [
      "Prix",
      "apport",
      "revenu",
      "mensualités existantes",
      "préférence conventionnel/islamique"
    ],
    "answer": "Scénarios comptant/épargne/crédit/financement islamique + offres compatibles publiques.",
    "guardrail": "Besoin avant banque; critères non publics marqués.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB11",
    "label": "Acheter un logement",
    "triggers": [
      "logement",
      "immobilier",
      "apport"
    ],
    "steps": [
      "Prix",
      "apport",
      "revenu",
      "âge",
      "durée",
      "dettes"
    ],
    "answer": "Mensualité, apport, DSR, offres publiques compatibles, pièces.",
    "guardrail": "Sépare taux bonifiés/conditions spécifiques.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB12",
    "label": "Comprendre fiche de paie",
    "triggers": [
      "brut net",
      "fiche de paie"
    ],
    "steps": [
      "Voulez-vous saisir ou importer ?",
      "brut/primes/cotisations/IRG/autres retenues/net"
    ],
    "answer": "Réconciliation et explication ligne par ligne.",
    "guardrail": "Données extraites doivent être confirmées.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB13",
    "label": "Comprendre IRG",
    "triggers": [
      "IRG",
      "impôt salaire"
    ],
    "steps": [
      "Revenu imposable mensuel ?",
      "type salarié/retraité/handicapé ?",
      "prime non mensuelle ?"
    ],
    "answer": "IRG indicatif + barème/version/source.",
    "guardrail": "Toujours date de règle et source DGI.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB14",
    "label": "Ouvrir un CCP",
    "triggers": [
      "CCP",
      "Algérie Poste"
    ],
    "steps": [
      "Avez-vous déjà un CCP ?",
      "identité/résidence disponibles ?",
      "voulez-vous Edahabia ?"
    ],
    "answer": "Checklist officielle + lien ccpnet + services Edahabia.",
    "guardrail": "Pas ouverture exécutée dans FINCLUDIA.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB15",
    "label": "Choisir un compte bancaire",
    "triggers": [
      "compte bancaire",
      "carte"
    ],
    "steps": [
      "Âge",
      "usage",
      "carte",
      "digital",
      "frais prioritaires"
    ],
    "answer": "3–5 produits comparables avec critères/date/source.",
    "guardrail": "Pas “meilleure banque” globale.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB16",
    "label": "Utilisateur mineur",
    "triggers": [
      "mineur",
      "parent",
      "lycéen"
    ],
    "steps": [
      "Âge ?",
      "consentement représentant légal déjà vérifié ?"
    ],
    "answer": "Fonctions accessibles + étape de consentement.",
    "guardrail": "<19 fonctions adultes bloquées; politique produit par tranche.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB17",
    "label": "Commencer à investir",
    "triggers": [
      "investir",
      "bourse",
      "placement"
    ],
    "steps": [
      "Budget positif ?",
      "réserve ?",
      "dette ?",
      "objectif/horizon ?"
    ],
    "answer": "Si bases fragiles: priorité sécurité; sinon module risque + portefeuille fictif.",
    "guardrail": "Aucune recommandation d’achat de titre.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB18",
    "label": "Comprendre inflation",
    "triggers": [
      "inflation",
      "pouvoir achat"
    ],
    "steps": [
      "Montant aujourd’hui",
      "horizon",
      "hypothèse inflation"
    ],
    "answer": "Valeur future nécessaire et valeur réelle.",
    "guardrail": "Hypothèse visible et modifiable.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB19",
    "label": "Comparer financement islamique",
    "triggers": [
      "mourabaha",
      "ijara",
      "islamique"
    ],
    "steps": [
      "Besoin",
      "actif",
      "montant",
      "apport",
      "durée"
    ],
    "answer": "Compare structure, coût contractuel disponible, propriété, garanties, sources.",
    "guardrail": "Ne convertit pas toute structure en “taux” si banque ne publie pas la méthode.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB20",
    "label": "Objectif hors trajectoire",
    "triggers": [
      "objectif retard",
      "je n’atteins pas"
    ],
    "steps": [
      "Afficher écart",
      "proposer augmenter contribution / décaler date / réduire cible"
    ],
    "answer": "3 scénarios avec impact mensuel.",
    "guardrail": "Aucun changement automatique.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB21",
    "label": "Exporter mes données",
    "triggers": [
      "export",
      "Excel",
      "PDF"
    ],
    "steps": [
      "Période ?",
      "format ?",
      "inclure simulations ?"
    ],
    "answer": "Crée export JSON/CSV/XLSX/PDF.",
    "guardrail": "Données partagées soumises aux droits.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB22",
    "label": "Fraude / sécurité",
    "triggers": [
      "fraude",
      "phishing",
      "PIN"
    ],
    "steps": [
      "Avez-vous partagé un code ?",
      "carte/compte concerné ?"
    ],
    "answer": "Consignes générales de sécurité + lien institution concernée.",
    "guardrail": "Ne jamais demander code PIN/OTP/mot de passe.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB23",
    "label": "Pourquoi mon score baisse ?",
    "triggers": [
      "santé financière",
      "score"
    ],
    "steps": [
      "Affiche dimension ayant changé et données source"
    ],
    "answer": "Explique pondération + valeur + action.",
    "guardrail": "Score FINCLUDIA explicable; jamais crédit score.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB24",
    "label": "Offre bancaire absente",
    "triggers": [
      "banque absente",
      "taux inconnu"
    ],
    "steps": [
      "Produit/bank recherchés ?"
    ],
    "answer": "“Condition non publiée / non vérifiée”; lien banque; possibilité de signaler mise à jour.",
    "guardrail": "Ne jamais deviner un taux.",
    "source": "ODT / Tableau 118",
    "fallback": false
  },
  {
    "code": "CB99",
    "label": "Intention inconnue",
    "triggers": [
      "Fallback"
    ],
    "steps": [
      "Proposer 6 thèmes + reformulation"
    ],
    "answer": "Aucune réponse libre.",
    "guardrail": "Ne jamais générer de contenu hors base validée.",
    "source": "ODT / Tableau 118",
    "fallback": true
  }
];

export const FIN_INTENT_CODES = FIN_INTENT_CATALOGUE.map((row) => row.code);
export const finIntent = (code) => FIN_INTENT_CATALOGUE.find((row) => row.code === code) ?? null;

// Le repli, isolé : c'est la seule entrée que le résolveur a le droit de
// choisir sans avoir reconnu quoi que ce soit.
export const FIN_INTENT_FALLBACK = FIN_INTENT_CATALOGUE.find((row) => row.fallback) ?? null;

// Tous les garde-fous, à plat. Publiés ensemble pour qu'un écran puisse les
// montrer : ce que l'assistant refuse de faire mérite d'être lisible sans
// ouvrir 25 fiches.
export const FIN_INTENT_GUARDRAILS = FIN_INTENT_CATALOGUE
  .filter((row) => row.guardrail)
  .map((row) => ({ code: row.code, label: row.label, guardrail: row.guardrail }));

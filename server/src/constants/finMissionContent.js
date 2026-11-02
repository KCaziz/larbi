// Draft content of the mandatory missions V1 (P8-34) and of the three final cases.
//
// WRITTEN BY US, as a first version the client can rewrite: his answer gave the
// titles and the rules, not the texts. It stays general on purpose — no rate, no
// legal or fiscal rule, no product of a bank — so nothing here can be wrong
// about Algeria; the client replaces it in the administration as he wishes.
//
// Each step offers three choices, always in this order of quality: the one that
// serves the person best, an acceptable one, a costly one. The effects are the
// same for every mission (EFFECTS below), so the score reads the same everywhere:
// 10 / 4 / -6 resilience points per step, hence 100 % needs the best choice at
// every step, and 70 % needs the best one and an acceptable one.

export const MISSION_START = 500000; // 5 000 DA of fictive money
export const EFFECTS = {
  best: { cash: -30000, savings: 30000, resilience: 10 },
  ok: { cash: 0, savings: 0, resilience: 4 },
  poor: { cash: -60000, savings: 0, resilience: -6 },
};

// [prompt, [best label, why], [acceptable label, why], [costly label, why]]
const S = (prompt, best, ok, poor) => ({ prompt, best, ok, poor });

const CONTENT = {
  // ---- Avenir (lycéen) -----------------------------------------------------
  'avenir-01': {
    summary: 'Faire la différence entre ce dont on a besoin et ce dont on a envie, avant de dépenser.',
    steps: [
      S('Ta chaussure de sport est usée et tu as un entraînement demain. Que fais-tu ?', ['Je remplace la paire usée par un modèle simple', 'C’est un vrai besoin : on choisit l’utile, sans payer le prestige.'], ['Je répare ou j’emprunte pour le moment, puis j’achète plus tard', 'Prudent, mais un besoin réel finit par devoir être couvert.'], ['J’achète la paire la plus chère de la vitrine', 'Le besoin existait, mais le prix a servi l’envie.']),
      S('Un ami te propose un jeu en promotion « aujourd’hui seulement ». Que fais-tu ?', ['J’attends 48 heures pour voir si l’envie reste', 'Attendre transforme un achat d’impulsion en choix réfléchi.'], ['J’achète seulement si j’ai déjà mis cet argent de côté', 'Acceptable : l’envie est financée, pas empruntée.'], ['J’achète tout de suite pour ne pas rater l’offre', 'La pression du « seulement aujourd’hui » vise ta décision rapide.']),
    ],
  },
  'avenir-02': {
    summary: 'Construire un premier budget simple : ce qui entre, ce qui sort, ce qui reste.',
    steps: [
      S('Tu reçois de l’argent de poche chaque mois. Par quoi commences-tu ?', ['Je note ce qui entre et je réserve d’abord une part à mettre de côté', 'Se payer en premier rend l’épargne régulière.'], ['Je note mes dépenses à la fin du mois', 'Utile, mais on découvre le résultat trop tard pour le changer.'], ['Je dépense et je regarde ce qu’il reste', 'Sans repère, il ne reste souvent rien.']),
      S('À mi-mois, il te reste peu pour les sorties prévues. Que fais-tu ?', ['Je regarde mon budget et je réduis une dépense non essentielle', 'Un budget sert à corriger en cours de route.'], ['Je demande une avance sur le mois suivant', 'Cela règle ce mois-ci en fragilisant le suivant.'], ['Je fais comme si de rien n’était', 'Ignorer l’écart ne le fait pas disparaître.']),
    ],
  },
  'avenir-03': {
    summary: 'Transformer une envie en objectif chiffré, daté et finançable.',
    steps: [
      S('Tu veux un casque audio. Comment en fais-tu un objectif ?', ['Je fixe son prix, une date et une somme à mettre de côté chaque mois', 'Un objectif a un montant, une date et un rythme.'], ['Je mets de côté quand j’y pense', 'Mieux que rien, mais sans rythme on n’arrive pas à une date.'], ['J’attends d’avoir assez d’argent d’un coup', 'Sans plan, l’envie passe ou l’argent est dépensé ailleurs.']),
      S('Au bout de deux mois, tu as moins mis de côté que prévu. Que fais-tu ?', ['J’ajuste la date ou le montant mensuel et je continue', 'Réviser le plan garde l’objectif atteignable.'], ['Je laisse tomber ce mois-ci et je verrai', 'Une pause peut se comprendre, mais il faut reprendre le plan.'], ['J’abandonne l’objectif', 'Un retard se corrige ; l’abandon fait perdre l’effort déjà fait.']),
    ],
  },
  'avenir-04': {
    summary: 'Comprendre à quoi servent un compte, un CCP, une carte et un paiement.',
    steps: [
      S('Tu reçois pour la première fois de l’argent sur un compte. Que retiens-tu ?', ['Le compte garde mon argent et je dois suivre son solde', 'Connaître son solde évite les mauvaises surprises.'], ['L’argent est là, je regarderai quand j’en aurai besoin', 'On risque de dépenser plus que ce qu’il y a.'], ['Une carte me donne de l’argent en plus', 'Une carte permet de payer avec TON argent ; elle n’en crée pas.']),
      S('Tu paies un achat avec ta carte. Que fais-tu ensuite ?', ['Je vérifie que le montant débité est le bon', 'Contrôler ses opérations permet de repérer une erreur.'], ['Je garde le ticket, sans vérifier', 'Le ticket aide, mais le contrôle du compte reste à faire.'], ['Je ne regarde jamais mes opérations', 'Une erreur ou une fraude passerait inaperçue.']),
    ],
  },
  'avenir-05': {
    summary: 'Reconnaître les pièges numériques et protéger ses codes.',
    steps: [
      S('Un message te demande ton code de carte « pour débloquer un gain ». Que fais-tu ?', ['Je ne réponds pas, je ne donne jamais mes codes et j’en parle à un adulte', 'Aucun organisme sérieux ne demande un code secret par message.'], ['Je réponds pour demander qui écrit', 'Répondre confirme que ton numéro est actif et attire d’autres messages.'], ['Je donne le code pour recevoir le gain', 'Donner son code, c’est donner accès à son argent.']),
      S('Un site te demande de créer un compte avec le même mot de passe que ton e-mail. Que fais-tu ?', ['J’utilise un mot de passe différent et long pour chaque service', 'Un mot de passe réutilisé ouvre tous les comptes si un seul est volé.'], ['Je change juste un chiffre du mot de passe', 'Trop facile à deviner une fois un mot de passe connu.'], ['Je mets le même partout pour ne pas oublier', 'Un seul vol de mot de passe compromet tous tes comptes.']),
    ],
  },
  'avenir-06': {
    summary: 'Comprendre ce qu’est un crédit et ce qu’il coûte, sans emprunter.',
    steps: [
      S('Un crédit te permet d’acheter maintenant et de payer plus tard. Qu’est-ce qui est vrai ?', ['On rembourse plus que ce qu’on a reçu : la différence est le coût du crédit', 'Emprunter a un prix ; il faut le connaître avant de s’engager.'], ['On rembourse exactement la somme reçue', 'En général non : le prêteur est payé pour avancer l’argent.'], ['Un crédit est un cadeau de la banque', 'Un crédit est une dette qu’il faut rembourser.']),
      S('On te propose une mensualité « légère » pour un achat. Que fais-tu ?', ['Je demande le coût total et je compare avec mon budget', 'La mensualité seule cache la durée et le coût total.'], ['Je regarde seulement si la mensualité est basse', 'Une mensualité basse peut s’étaler très longtemps.'], ['Je signe, la mensualité est petite', 'On s’engage sans connaître ce que ça coûtera vraiment.']),
    ],
  },
  'avenir-07': {
    summary: 'Passer du salaire annoncé à ce qu’on reçoit vraiment, et le répartir.',
    steps: [
      S('On t’annonce un salaire brut pour un premier emploi. Que fais-tu ?', ['Je demande le salaire net, celui qui arrive sur le compte', 'Seul le net sert à construire un budget.'], ['Je calcule mon budget sur le brut', 'Le net est plus bas : le budget serait trop optimiste.'], ['Je dépense avant de voir la première paie', 'Une dépense engagée sur un chiffre incertain est un risque.']),
      S('Première paie reçue. Comment la répartis-tu ?', ['Besoins d’abord, une part pour l’épargne, le reste pour les envies', 'Une répartition dès le départ évite que tout parte en envies.'], ['Je paie mes besoins et je garde le reste sans plan', 'Sans plan, le reste disparaît souvent.'], ['Je m’offre une grosse envie avec la moitié', 'Une grosse envie le premier mois laisse peu pour la suite.']),
    ],
  },
  'avenir-08': {
    summary: 'Découvrir le lien entre épargne, risque et rendement, avec un portefeuille fictif.',
    steps: [
      S('Dans le portefeuille fictif, tu as une somme à placer. Que fais-tu ?', ['Je répartis entre plusieurs choix, dont une part facile à récupérer', 'Répartir limite l’effet d’une mauvaise surprise.'], ['Je mets tout dans un seul choix qui semble bon', 'Si ce choix baisse, tout baisse avec lui.'], ['Je mets tout dans le choix qui promet le plus', 'Une promesse très haute cache souvent un risque très haut.']),
      S('Ton portefeuille fictif baisse après deux semaines. Que fais-tu ?', ['Je regarde pourquoi, sans décider dans la panique', 'Comprendre avant d’agir évite les décisions regrettées.'], ['Je vends une partie pour me rassurer', 'Possible, mais vendre sous le coup de la peur fige la perte.'], ['Je vends tout tout de suite', 'Réagir à chaud transforme une baisse passagère en perte.']),
    ],
  },

  // ---- Mon Argent (salarié) ------------------------------------------------
  'mon-argent-01': {
    summary: 'Lire son mois : ce qui est entré, ce qui est sorti, ce qui reste.',
    steps: [
      S('Le mois se termine. Par où commences-tu ?', ['Je compare mes revenus et mes dépenses, et je regarde le reste', 'Le reste du mois est le chiffre qui guide les décisions.'], ['Je regarde seulement mon solde', 'Le solde ne dit pas d’où vient l’écart.'], ['Je ne regarde pas, tout va bien', 'Sans lecture, un écart répété passe inaperçu.']),
      S('Une catégorie a dépassé son budget de moitié. Que fais-tu ?', ['Je cherche la cause et j’ajuste le budget ou la dépense', 'Comprendre la cause permet de corriger durablement.'], ['Je note l’écart pour plus tard', 'Noter sans agir laisse le problème revenir.'], ['Je supprime le budget de cette catégorie', 'Sans repère, le dépassement ne se voit plus.']),
    ],
  },
  'mon-argent-02': {
    summary: 'Comprendre les lignes d’une fiche de paie : brut, retenues, net.',
    steps: [
      S('Ta fiche de paie montre un brut et un net différents. Que fais-tu ?', ['Je lis les retenues ligne par ligne pour comprendre l’écart', 'Savoir d’où vient l’écart évite de se tromper dans son budget.'], ['Je retiens seulement le net', 'Le net suffit au budget, mais on ne repère pas une erreur.'], ['Je ne l’ouvre jamais', 'Une erreur éventuelle ne serait jamais vue.']),
      S('Une ligne te paraît inhabituelle ce mois-ci. Que fais-tu ?', ['Je compare avec le mois précédent et je pose la question au service compétent', 'Vérifier tôt permet de faire corriger rapidement.'], ['J’attends le mois prochain pour voir', 'Le temps qui passe complique parfois la correction.'], ['Je suppose que c’est normal', 'Une erreur non signalée peut durer.']),
    ],
  },
  'mon-argent-03': {
    summary: 'Repérer les abonnements et dépenses récurrentes qui s’accumulent.',
    steps: [
      S('Tu fais la liste de tes abonnements. Que fais-tu ?', ['Je garde ceux que j’utilise et je résilie les autres', 'Un abonnement inutilisé est une dépense pour rien.'], ['Je garde tout, c’est peu cher chacun', 'Plusieurs petits montants font un gros total.'], ['Je ne regarde pas, ça se prélève tout seul', 'Ce qui est automatique est ce qu’on oublie le plus.']),
      S('Un essai gratuit demande ta carte. Que fais-tu ?', ['Je note la date de fin pour décider avant le premier paiement', 'Un essai gratuit devient payant si on oublie la date.'], ['Je m’inscris en pensant résilier à temps', 'Sans rappel, on oublie souvent.'], ['Je m’inscris sans lire les conditions', 'Les conditions disent quand et combien tu paieras.']),
    ],
  },
  'mon-argent-04': {
    summary: 'Constituer un fonds d’urgence et mesurer l’effet d’un choc.',
    steps: [
      S('Une dépense imprévue de réparation arrive. Qu’est-ce qui t’aide le plus ?', ['Un fonds d’urgence déjà constitué', 'Il absorbe le choc sans dettes ni retard de paiement.'], ['Reprendre sur l’épargne d’un autre projet', 'Cela dépanne, mais retarde un autre objectif.'], ['Rien de prévu : je m’endette', 'Sans réserve, un imprévu devient une dette.']),
      S('Tu veux calibrer ton fonds d’urgence. Comment fais-tu ?', ['Je le calcule en mois de dépenses essentielles', 'Les mois couverts disent combien de temps tu tiens.'], ['Je choisis un montant rond au hasard', 'Un montant arbitraire peut être trop faible.'], ['Je pense que ce n’est pas utile', 'Les imprévus arrivent à tout le monde.']),
    ],
  },
  'mon-argent-05': {
    summary: 'Comprendre ses dettes et choisir une stratégie de remboursement.',
    steps: [
      S('Tu as plusieurs dettes. Par quoi commences-tu ?', ['Je les liste avec montant, taux et mensualité', 'On ne choisit une stratégie qu’avec une vue complète.'], ['Je paie celle qui me stresse le plus', 'Compréhensible, mais pas toujours la moins chère.'], ['Je paie au hasard', 'Sans ordre, on paie plus d’intérêts que nécessaire.']),
      S('Tu as un peu d’argent en plus. Que fais-tu ?', ['Je le mets sur la dette choisie par ma stratégie', 'Un versement supplémentaire raccourcit la durée.'], ['Je le répartis également sur toutes les dettes', 'Cela avance, moins vite qu’une stratégie ciblée.'], ['Je le dépense, mes dettes ne bougent pas', 'La dette continue de coûter chaque mois.']),
    ],
  },
  'mon-argent-06': {
    summary: 'Planifier des objectifs de long terme avec un rythme réaliste.',
    steps: [
      S('Tu as un projet dans plusieurs années. Comment le prépares-tu ?', ['Je chiffre le projet, fixe une date et calcule le versement mensuel', 'Un versement calculé rend le projet atteignable.'], ['Je mets de côté ce que je peux, sans chiffre', 'On avance, sans savoir si c’est suffisant.'], ['J’attends d’avoir de l’argent en trop', 'Cet argent en trop n’arrive presque jamais.']),
      S('Plusieurs objectifs se concurrencent. Que fais-tu ?', ['Je les classe par priorité et je finance d’abord le plus important', 'Prioriser évite de tous les retarder.'], ['Je donne un peu à chacun', 'Aucun n’avance assez vite.'], ['Je les finance au gré de mes envies', 'Les objectifs importants restent en retard.']),
    ],
  },
  'mon-argent-07': {
    summary: 'Construire son patrimoine net : ce qu’on possède moins ce qu’on doit.',
    steps: [
      S('Tu veux connaître ton patrimoine net. Que fais-tu ?', ['Je liste ce que je possède et ce que je dois, puis je soustrais', 'Le patrimoine net est la différence entre les deux.'], ['Je compte seulement mon épargne', 'Les dettes et autres biens changent le résultat.'], ['Je ne compte que mes biens, pas mes dettes', 'On se croit plus riche qu’on ne l’est.']),
      S('Un bien a perdu de la valeur depuis l’achat. Que fais-tu ?', ['Je mets sa valeur à jour dans mon calcul', 'Un patrimoine à jour reflète la réalité.'], ['Je garde le prix d’achat', 'Le chiffre devient trop optimiste.'], ['Je l’ignore', 'Une valeur ignorée fausse le total.']),
    ],
  },
  'mon-argent-08': {
    summary: 'Simuler logement, retraite, inflation et décisions de long terme.',
    steps: [
      S('Tu simules un projet de long terme. Quelle précaution prends-tu ?', ['Je teste plusieurs hypothèses, dont une défavorable', 'Une simulation prudente évite les mauvaises surprises.'], ['Je teste une seule hypothèse raisonnable', 'Utile, mais ne montre pas la marge de risque.'], ['Je prends l’hypothèse la plus favorable', 'On construit un plan sur un cas qui peut ne pas arriver.']),
      S('L’inflation fait monter les prix. Comment la prends-tu en compte ?', ['Je compare le rendement à l’inflation pour juger le gain réel', 'Un gain inférieur à l’inflation fait perdre du pouvoir d’achat.'], ['Je regarde le rendement affiché seulement', 'Le rendement affiché ne dit pas le gain réel.'], ['Je pense que les prix ne bougent pas', 'Sur la durée, les prix montent.']),
    ],
  },

  // ---- Épargne & Investissement ---------------------------------------------
  'epargne-01': {
    summary: 'Vérifier qu’on est prêt à épargner ou investir : réserve, dettes, horizon.',
    steps: [
      S('Tu veux commencer à investir. Que vérifies-tu d’abord ?', ['J’ai une réserve pour les imprévus et pas de dette coûteuse', 'On investit l’argent dont on n’a pas besoin tout de suite.'], ['J’ai de l’argent disponible ce mois-ci', 'Disponible aujourd’hui ne veut pas dire disponible demain.'], ['Je vois que d’autres le font', 'L’avis des autres ne remplace pas ta situation.']),
      S('Tu as une dette à taux élevé et un peu d’épargne. Que fais-tu ?', ['Je compare le coût de la dette au gain possible avant de choisir', 'Rembourser une dette coûteuse est souvent un gain sûr.'], ['Je garde la dette et j’investis la totalité', 'Le gain incertain peut ne pas couvrir le coût certain.'], ['J’ignore la dette', 'Une dette qui court coûte chaque mois.']),
    ],
  },
  'epargne-02': {
    summary: 'Définir un objectif d’épargne et son horizon de temps.',
    steps: [
      S('Ton objectif est dans deux ans. Quel type de placement convient ?', ['Un choix stable et facile à récupérer', 'Sur court terme, on évite les variations fortes.'], ['Un choix risqué pour aller plus vite', 'Une baisse peut survenir juste avant la date.'], ['Je ne définis pas d’horizon', 'Sans horizon, on ne sait pas quel risque accepter.']),
      S('Un objectif est dans quinze ans. Que peux-tu envisager ?', ['Accepter plus de variations, car le temps lisse les hauts et les bas', 'Un horizon long permet de supporter les baisses passagères.'], ['Tout garder en liquide', 'Sûr, mais l’inflation grignote la valeur.'], ['Tout miser sur un seul choix', 'La concentration reste risquée, même à long terme.']),
    ],
  },
  'epargne-03': {
    summary: 'Comprendre la différence entre intérêt simple et intérêt composé.',
    steps: [
      S('En intérêt simple, que se passe-t-il chaque période ?', ['L’intérêt est calculé sur le capital de départ seulement', 'L’intérêt simple ne s’ajoute pas au capital.'], ['L’intérêt est calculé sur le capital et les intérêts déjà gagnés', 'C’est la définition de l’intérêt composé.'], ['L’intérêt est le même quelle que soit la durée', 'Le total des intérêts grandit avec la durée.']),
      S('En intérêt composé, pourquoi la durée compte-t-elle autant ?', ['Les intérêts gagnent eux-mêmes des intérêts, l’effet s’accélère', 'C’est l’effet « boule de neige » de l’intérêt composé.'], ['Parce que le taux augmente tout seul', 'Le taux ne change pas, c’est la base de calcul qui grandit.'], ['La durée ne change rien', 'Plus la durée est longue, plus l’écart avec l’intérêt simple grandit.']),
    ],
  },
  'epargne-04': {
    summary: 'Comprendre l’inflation et distinguer rendement nominal et rendement réel.',
    steps: [
      S('Ton épargne rapporte 4 % et les prix montent de 6 %. Que se passe-t-il ?', ['Tu perds du pouvoir d’achat malgré les intérêts', 'Le rendement réel est négatif quand l’inflation dépasse le rendement.'], ['Tu gagnes 4 %, donc tu es gagnant', '4 % est le gain affiché ; ce que tu peux acheter a baissé.'], ['L’inflation ne concerne que les prix', 'L’inflation réduit ce que ton argent permet d’acheter.']),
      S('Comment juger un gain d’épargne ?', ['Je compare le rendement à l’inflation', 'C’est la comparaison qui donne le gain réel.'], ['Je regarde le montant final seulement', 'Un montant plus grand peut acheter moins.'], ['Je regarde la publicité', 'Une publicité met en avant le meilleur chiffre.']),
    ],
  },
  'epargne-05': {
    summary: 'Distinguer risque, volatilité, perte possible et liquidité.',
    steps: [
      S('Un placement varie beaucoup d’une semaine à l’autre. Que signifie cela ?', ['Il est volatil : sa valeur peut monter ou baisser fortement', 'Volatilité veut dire amplitude des variations.'], ['Il est sûr, car il bouge beaucoup', 'Bouger beaucoup n’est pas être sûr.'], ['Il va forcément monter', 'Rien ne garantit la hausse.']),
      S('Tu pourrais avoir besoin de cet argent bientôt. Que privilégies-tu ?', ['Un placement liquide, que je peux reprendre sans perte importante', 'La liquidité, c’est pouvoir récupérer son argent quand il le faut.'], ['Un placement dont je ne peux pas sortir facilement', 'Risque de rester bloqué au mauvais moment.'], ['Peu importe, je verrai', 'Le besoin d’argent arrive rarement quand on l’a prévu.']),
    ],
  },
  'epargne-06': {
    summary: 'Découvrir les grandes classes d’actifs et leurs rôles.',
    steps: [
      S('Quelle idée décrit le mieux les grandes classes d’actifs ?', ['Chaque classe a son niveau de risque, de rendement possible et de liquidité', 'Connaître ces trois aspects aide à choisir.'], ['Elles se valent toutes', 'Elles ne se comportent pas de la même manière.'], ['La plus risquée est toujours la meilleure', 'Plus de risque ne garantit pas plus de gain.']),
      S('Pourquoi mélanger plusieurs classes d’actifs ?', ['Elles ne réagissent pas toutes pareil aux mêmes événements', 'Le mélange réduit l’effet d’un mauvais épisode.'], ['Pour compliquer les choses', 'Le but est de réduire le risque, pas de compliquer.'], ['Ce n’est pas utile', 'Le mélange est un des moyens de limiter le risque.']),
    ],
  },
  'epargne-07': {
    summary: 'Comprendre la diversification et le danger de la concentration.',
    steps: [
      S('Presque toute ton épargne est dans un seul actif. Que fais-tu ?', ['Je répartis progressivement sur plusieurs actifs', 'Répartir diminue le poids d’un seul incident.'], ['Je garde tout, je lui fais confiance', 'La confiance ne protège pas d’une baisse.'], ['J’ajoute encore dans ce même actif', 'Cela augmente la concentration.']),
      S('Qu’est-ce qu’une bonne diversification ?', ['Des actifs différents, pas seulement plusieurs noms du même type', 'Deux actifs qui réagissent pareil ne diversifient pas.'], ['Beaucoup de petits placements du même type', 'La quantité ne fait pas la diversification.'], ['Un seul placement, mais très surveillé', 'Surveiller ne remplace pas répartir.']),
    ],
  },
  'epargne-08': {
    summary: 'Construire un portefeuille fictif et en lire le résultat.',
    steps: [
      S('Tu construis ton premier portefeuille fictif. Comment répartis-tu ?', ['Selon mon objectif, mon horizon et le risque que je supporte', 'Le portefeuille découle de l’objectif.'], ['Selon ce qui a le mieux marché récemment', 'Le passé récent ne garantit pas la suite.'], ['Au hasard', 'Sans logique, on ne peut pas expliquer le résultat.']),
      S('Comment lis-tu le résultat de ton portefeuille fictif ?', ['Je regarde le gain et aussi la baisse maximale supportée', 'Un résultat se juge avec le risque pris.'], ['Je regarde seulement le gain', 'On oublie le risque pris pour l’obtenir.'], ['Je ne le regarde pas', 'Un portefeuille non suivi ne sert pas à apprendre.']),
    ],
  },
  'epargne-09': {
    summary: 'Comparer deux placements sur les mêmes critères.',
    steps: [
      S('Deux placements te sont proposés. Comment les compares-tu ?', ['Sur rendement possible, risque, liquidité, durée et frais', 'Comparer sur les mêmes critères évite d’être trompé par un seul chiffre.'], ['Sur le rendement affiché seulement', 'Un rendement élevé peut cacher du risque ou des frais.'], ['Sur l’avis d’un ami', 'Son cas n’est pas le tien.']),
      S('Un placement promet un gain très élevé et sans risque. Que fais-tu ?', ['Je me méfie et je demande comment ce gain est possible', 'Un gain très élevé sans risque ne se rencontre pas.'], ['J’essaie avec une petite somme', 'Prudent, mais une arnaque peut aussi prendre peu.'], ['J’investis tout, l’occasion est rare', 'C’est le schéma typique d’une arnaque.']),
    ],
  },
  'epargne-10': {
    summary: 'Tenir un journal de décisions et faire une revue régulière.',
    steps: [
      S('Après une décision d’épargne, que notes-tu ?', ['La raison, l’alternative écartée et ce que j’attends', 'Noter pourquoi permet d’apprendre de ses décisions.'], ['Seulement le montant', 'On ne saura plus pourquoi on a choisi.'], ['Rien, je m’en souviendrai', 'La mémoire reconstruit le passé à son avantage.']),
      S('À la revue, une décision a mal tourné. Que fais-tu ?', ['Je regarde si la décision était raisonnable avec ce que je savais', 'On juge la décision, pas seulement le résultat.'], ['Je blâme la malchance', 'Parfois vrai, mais on n’apprend rien.'], ['Je renonce à investir', 'Une erreur est une information, pas une fin.']),
    ],
  },
};

// The final case of each parcours: a longer situation that mixes its missions.
const FINAL_CASES = {
  'avenir-cas-final': {
    title: 'Cas final — Passeport Avenir',
    summary: 'Une situation complète : budget, objectif, sécurité et crédit à la fois.',
    steps: [
      S('Tu reçois ton premier revenu et un message te propose un « placement garanti » par un inconnu. Que fais-tu ?', ['Je refuse, je ne donne aucun code et j’en parle à un adulte', 'Une promesse de gain garanti venue d’un inconnu est un signal d’alerte.'], ['Je demande des détails avant de décider', 'Tu donnes du temps à l’arnaqueur.'], ['Je tente avec une petite somme', 'Une petite somme perdue reste perdue, et on te recontactera.']),
      S('Tu veux un objet à 20 000 DA. Quelle est la meilleure démarche ?', ['Je fixe une date, je mets de côté chaque mois, sans crédit', 'Un objectif financé par l’épargne ne coûte pas d’intérêts.'], ['Je prends un crédit avec une petite mensualité', 'Tu paieras plus que le prix de l’objet.'], ['J’achète tout de suite avec l’argent du loyer', 'Un besoin essentiel devient impayé.']),
      S('Ce mois-ci, ton budget est serré. Que fais-tu ?', ['Je réduis une dépense d’envie et je garde l’épargne prévue', 'Tu protèges l’objectif en ajustant le confort.'], ['Je saute l’épargne ce mois-ci', 'Un mois sauté se rattrape rarement.'], ['Je dépense comme d’habitude', 'L’écart s’agrandit.']),
    ],
  },
  'mon-argent-cas-final': {
    title: 'Cas final — Pilotage financier personnel',
    summary: 'Un mois complet : clôture, imprévu, dette et objectif de long terme.',
    steps: [
      S('Le mois est clos et tu as un peu d’argent en plus. Que fais-tu ?', ['Je complète d’abord mon fonds d’urgence, puis je finance mes objectifs', 'La sécurité d’abord, ensuite les projets.'], ['Je mets tout sur un objectif de long terme', 'Sans réserve, un imprévu peut le défaire.'], ['Je dépense, c’est un bonus', 'Tu perds une occasion de renforcer ta situation.']),
      S('Un imprévu coûte plus que ton fonds d’urgence. Que fais-tu ?', ['J’utilise le fonds, je comble le reste avec le moins cher, et je reconstitue le fonds', 'Tu limites le coût et tu corriges vite.'], ['Je prends un crédit pour tout couvrir', 'Tu gardes ton fonds, mais tu paies des intérêts.'], ['Je retarde le paiement', 'Les retards ajoutent des frais.']),
      S('Tu as deux dettes. Comment utilises-tu un versement en plus ?', ['Je suis la stratégie choisie et je mesure l’économie d’intérêts', 'Une stratégie mesurée donne un résultat chiffré.'], ['Je le répartis également', 'Cela avance sans optimiser.'], ['Je le garde sur le compte', 'Les dettes continuent de coûter.']),
    ],
  },
  'epargne-cas-final': {
    title: 'Cas final — Épargne & Investissement',
    summary: 'Un projet à plusieurs années : objectif, risque, inflation et revue.',
    steps: [
      S('Tu as un projet dans huit ans. Quelle démarche suis-tu ?', ['Je fixe objectif et horizon, puis je choisis un risque adapté', 'L’objectif et l’horizon guident le risque acceptable.'], ['Je choisis ce qui a le plus rapporté cette année', 'Le passé récent ne garantit pas la suite.'], ['Je laisse l’argent sur le compte sans plan', 'L’inflation réduira sa valeur.']),
      S('Ton portefeuille fictif baisse de 15 % en un mois. Que fais-tu ?', ['Je relis mon objectif et mon horizon avant de décider', 'Une baisse passagère ne change pas forcément le plan.'], ['Je vends la moitié par prudence', 'Possible, mais cela fige une partie de la perte.'], ['Je vends tout', 'Tu transformes une baisse en perte.']),
      S('À la revue de l’année, que fais-tu ?', ['Je compare le rendement à l’inflation, je relis mon journal et j’ajuste le plan', 'La revue relie les décisions aux résultats.'], ['Je regarde seulement le solde', 'Tu ignores l’inflation et les raisons de tes choix.'], ['Je ne fais pas de revue', 'Sans revue, on répète les mêmes erreurs.']),
    ],
  },
};

const PARCOURS_PROFILE = { avenir: 'LYC', 'mon-argent': 'SAL', epargne: 'EPG' };

/** All the drafted missions, ready for the FinMission table. */
export function missionDrafts(catalogue) {
  const out = [];
  let position = 0;
  for (const [parcoursKey, parcours] of Object.entries(catalogue)) {
    const profiles = [PARCOURS_PROFILE[parcoursKey]];
    const build = (slug, title, summary, steps) => ({
      slug,
      title,
      summary,
      profiles,
      startingAmount: MISSION_START,
      currency: 'DZD',
      steps: steps.map((step, index) => ({
        key: `etape-${index + 1}`,
        prompt: step.prompt,
        choices: ['best', 'ok', 'poor'].map((quality) => ({ key: quality === 'best' ? 'a' : quality === 'ok' ? 'b' : 'c', label: step[quality][0], explanation: step[quality][1], ...EFFECTS[quality] })),
      })),
      badges: [
        { key: 'a-consolider', label: 'À consolider', minResilience: 0 },
        { key: 'acquis', label: 'Acquis', minResilience: Math.round(steps.length * 10 * 0.7) },
        { key: 'maitrise', label: 'Maîtrisé', minResilience: steps.length * 10 },
      ],
      position: position++,
      status: 'published',
    });
    for (const mission of parcours.missions) {
      const content = CONTENT[mission.key];
      out.push(build(mission.key, mission.title, content.summary, content.steps));
    }
    const finalSlug = `${parcoursKey}-cas-final`;
    const final = FINAL_CASES[finalSlug];
    out.push(build(finalSlug, final.title, final.summary, final.steps));
  }
  return out;
}

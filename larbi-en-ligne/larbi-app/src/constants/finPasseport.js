// Passeport de connaissances financières (P2-09, écrans LY11/LY12/ET09, formule F052).

// Le mécanisme (F052, moyenne pondérée des dimensions) existe déjà dans le
// moteur et prend ses poids en argument — mais les poids eux-mêmes restent
// une pondération à valider par le client (`P6-01` point 5), exactement la
// même réserve que F051 (`P6-16`) et F053 (`P6-06`). L'indice global reste
// donc bloqué ; chaque dimension est montrée seule.
export const KNOWLEDGE_INDEX_BLOCKED = { formula: 'F052', waitingOn: 'P6-01', reason: 'weights' };

// "Sécurité numérique" (hameçonnage, mot de passe, carte, OTP...) est une
// formation comme une autre (P3-11/P3-13) : ce slug fixe est la SEULE chose
// réservée pour elle, pour que l'administrateur puisse la publier plus tard
// sans migration. Tant qu'aucune formation de ce slug n'est publiée, la
// dimension est déclarée indisponible plutôt que mesurée sur du contenu qui
// n'existe pas.
export const SECURITY_MODULE_SLUG = 'securite-numerique';
export const SECURITY_MODULE_BLOCKED = { reason: 'noContentPublished' };

export const KNOWLEDGE_DIMENSIONS = ['formationsCompletion', 'quizzesAverage', 'securityModule'];

// Le passeport change de nom selon le public (LY11 "Avenir", ET09 "étudiant"),
// jamais de mécanique : les mêmes données, un intitulé différent.
export const PASSEPORT_TITLE_BY_PUBLIC = { LYC: 'avenir', ETU: 'etudiant' };
export const passeportTitleKey = (finPublic) => PASSEPORT_TITLE_BY_PUBLIC[finPublic] ?? 'generic';

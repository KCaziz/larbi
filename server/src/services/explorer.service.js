import { prisma } from '../config/prisma.js';

// "Explorer" (P4-13, écran C20) : une recherche LITTÉRALE sur les mêmes
// lignes publiques que le comparateur bancaire (P4-06) — jamais une
// interprétation générative, jamais un classement, jamais une affirmation
// d'éligibilité. Le besoin (voiture, logement, épargne…) n'a pas de colonne
// dédiée dans les classeurs du client : il se tape dans la recherche, comme
// un mot parmi d'autres, plutôt que d'être deviné par une liste inventée ici.
const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

export async function exploreOffers({ query = '', themes = [], bankId = null, segment = null, take = 50 } = {}) {
  const q = query.trim();
  // Comme la recherche globale (P6-20) : pas de filtre réel, pas de résultat —
  // jamais un listage complet déguisé en recherche.
  if (q.length < 2 && themes.length === 0 && !bankId && !segment) return [];

  const where = {};
  if (Array.isArray(themes) && themes.length > 0) where.theme = { in: themes };
  if (bankId) where.bankId = bankId;
  if (segment) where.segment = segment;
  if (q) {
    const term = escapeLike(q);
    where.OR = [{ label: { contains: term } }, { category: { contains: term } }, { bank: { name: { contains: term } } }];
  }
  return prisma.comparatorCondition.findMany({ where, include: { bank: { select: { id: true, name: true } } }, take });
}

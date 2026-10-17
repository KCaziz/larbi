import { COMPARATOR_THEMES } from '../constants/comparator.js';
import { sortConditions, toPublicCondition } from '../serializers/comparator.js';
import { exploreOffers } from '../services/explorer.service.js';
import { dataUpdatedAt } from './comparator.controller.js';

// "Explorer" (P4-13, écran C20). Réservé aux 18 ans et plus : la route
// applique `requireAuth` puis `requireAdult` AVANT ce contrôleur (middleware),
// jamais un filtre fait ici. Aucune date par offre n'existe dans ce modèle de
// données (seule une date globale) : la fraîcheur renvoyée est honnêtement
// celle-là, pas une invention par ligne.
export async function getExplorer(req, res) {
  res.set('Cache-Control', 'no-store');
  const { q, themes, bankId, segment } = req.query;
  const themeList = themes ? themes.split(',').filter(Boolean) : [];
  const [rows, updatedAt] = await Promise.all([
    exploreOffers({ query: q ?? '', themes: themeList, bankId: bankId ?? null, segment: segment ?? null }),
    dataUpdatedAt(),
  ]);
  res.json({
    // The rubric (theme) is not sensitive — the comparator's own theme pages
    // already expose it in their URL — and the interface needs it to label
    // each result's fields and to say what kind of offer it is.
    results: sortConditions(rows).map((row) => ({ theme: row.theme, ...toPublicCondition(row) })),
    updatedAt,
    themes: COMPARATOR_THEMES.map(({ key }) => key),
  });
}

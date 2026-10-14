import { prisma } from '../config/prisma.js';
import { EXPLORER_BLOCKED } from '../constants/finSearch.js';
import { searchGoals, searchMyData } from '../services/finSearch.service.js';

// Global search (P6-20), screen C22. Session required: every result here is
// this account's own private financial data, strictly cloistered by owner —
// never another account's, and never a space's shared rows (P6-14 has its
// own screen and its own membership check for those).

export async function getSearch(req, res) {
  const query = req.query.q ?? '';
  const [mesDonnees, objectifs] = await Promise.all([searchMyData(prisma, req.user.id, query), searchGoals(prisma, req.user.id, query)]);
  res.json({
    mesDonnees,
    objectifs,
    // Said out loud: the comparateur bancaire and the job offers exist, but
    // are not merged into this search yet (constants/finSearch.js).
    explorer: EXPLORER_BLOCKED,
  });
}

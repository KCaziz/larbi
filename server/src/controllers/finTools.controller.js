import { prisma } from '../config/prisma.js';
import { TOOLS_CATALOGUE, toolsCatalogue } from '../constants/finToolsCatalogue.js';
import { HttpError } from '../utils/httpError.js';

// The single catalogue of the Tools (P8-15): every calculator of the client,
// with where it opens. The catalogue is the same for everyone; the favourites
// (OUT-01) are the person's own and have their own routes.
const CODES = new Set(TOOLS_CATALOGUE.map((tool) => tool.code));

export function getToolsCatalogue(req, res) {
  res.json(toolsCatalogue());
}

const favoritesOf = async (userId) =>
  (await prisma.toolFavorite.findMany({ where: { userId }, select: { code: true }, orderBy: { createdAt: 'asc' } }))
    .map((row) => row.code)
    // A code that left the catalogue simply stops being shown.
    .filter((code) => CODES.has(code));

export async function getToolFavorites(req, res) {
  res.json({ favoris: await favoritesOf(req.user.id) });
}

// Idempotent both ways: adding a favourite twice, or removing one that is not
// there, leaves the same list and answers it.
export async function putToolFavorite(req, res) {
  const { code } = req.params;
  if (!CODES.has(code)) throw new HttpError(404, 'Not found');
  await prisma.toolFavorite.upsert({ where: { userId_code: { userId: req.user.id, code } }, create: { userId: req.user.id, code }, update: {} });
  res.json({ favoris: await favoritesOf(req.user.id) });
}

export async function removeToolFavorite(req, res) {
  const { code } = req.params;
  if (!CODES.has(code)) throw new HttpError(404, 'Not found');
  await prisma.toolFavorite.deleteMany({ where: { userId: req.user.id, code } });
  res.json({ favoris: await favoritesOf(req.user.id) });
}

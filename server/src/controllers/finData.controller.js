import { prisma } from '../config/prisma.js';
import { CATEGORY_FAMILIES } from '../constants/finCategories.js';
import { CONFIDENCE_LEVELS, CONSENT_USES, DATA_SCOPES, DATA_SOURCES, DATA_STATUSES, DEFAULT_DATA_SCOPE, FICTIONAL_STATUS } from '../constants/finData.js';
import { FREQUENCIES } from '../constants/finance.js';
import {
  MAX_OWN_PER_FAMILY,
  createCategory,
  customiseStandard,
  deleteCategory,
  listCategories,
  listCategoryChanges,
  resetStandard,
  setArchived,
  updateCategory,
} from '../services/finCategory.service.js';

// FINCLUDIA common financial data model (P6-02). Everything here needs a session
// and only ever touches the caller's own rows: financial data is private by
// default, and there is no administration side — a category belongs to the
// person who made it, and the client's reference is read-only for everyone.

// The vocabularies the interface needs, served instead of being retyped in the
// client: the same list cannot then be allowed on one side and refused on the
// other. Same approach as the simulator registry (P4-10).
export function getReferences(req, res) {
  res.json({
    families: CATEGORY_FAMILIES,
    scopes: DATA_SCOPES,
    defaultScope: DEFAULT_DATA_SCOPE,
    sources: DATA_SOURCES,
    statuses: DATA_STATUSES,
    fictionalStatus: FICTIONAL_STATUS,
    confidenceLevels: CONFIDENCE_LEVELS,
    consentUses: CONSENT_USES,
    frequencies: FREQUENCIES,
    limits: { ownCategoriesPerFamily: MAX_OWN_PER_FAMILY },
  });
}

export async function getCategories(req, res) {
  const groups = await listCategories(prisma, req.user.id, { includeArchived: req.query.includeArchived === true });
  res.json({ groups });
}

export async function postCategory(req, res) {
  const category = await createCategory(prisma, req.user.id, req.body);
  res.status(201).json({ category });
}

export async function patchCategory(req, res) {
  const category = await updateCategory(prisma, req.user.id, req.params.id, req.body);
  res.json({ category });
}

export async function putCategoryArchived(req, res) {
  const { archived, reason } = req.body;
  const category = await setArchived(prisma, req.user.id, req.params.id, archived, { reason });
  res.json({ category });
}

export async function removeCategory(req, res) {
  const result = await deleteCategory(prisma, req.user.id, req.params.id, { reason: req.body?.reason });
  res.json(result);
}

export async function patchStandardCategory(req, res) {
  const category = await customiseStandard(prisma, req.user.id, req.params.key, req.body);
  res.json({ category });
}

export async function removeStandardCustomisation(req, res) {
  const result = await resetStandard(prisma, req.user.id, req.params.key);
  res.json(result);
}

// The correction trail of one of the caller's categories (« correction
// traçable »): what changed, when, and the reason if one was given.
export async function getCategoryHistory(req, res) {
  const changes = await listCategoryChanges(prisma, req.user.id, req.params.id);
  res.json({ changes });
}

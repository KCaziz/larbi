import { Router } from 'express';
import {
  deleteInvite,
  getMembers,
  getSharedView,
  getSpace,
  getSpaceReferences,
  getSpaceTrail,
  getSpaces,
  patchSpace,
  postAcceptInvite,
  postInvite,
  postLeave,
  postSpace,
  putMemberRole,
  putMySharing,
  removeMember,
  removeSpace,
} from '../controllers/finSpace.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { acceptInviteSchema, createSpaceSchema, inviteSchema, leaveSchema, roleSchema, sharingSchema, updateSpaceSchema } from '../validation/finSpace.schemas.js';

// Shared spaces (P6-13), screens P01 / P04 / CO01 / CP01 / FA01. Every route
// needs a session, and a space the caller is not a member of answers 404 —
// never 403, which would confirm it exists.
const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);
router.param('memberId', uuidParam);
router.param('inviteId', uuidParam);

router.get('/espaces/references', getSpaceReferences);
// Declared BEFORE `/:id` so neither word is read as an identifier.
router.post('/espaces/rejoindre', validateBody(acceptInviteSchema), asyncRoute(postAcceptInvite));

router.get('/espaces', asyncRoute(getSpaces));
router.post('/espaces', validateBody(createSpaceSchema), asyncRoute(postSpace));
router.get('/espaces/:id', asyncRoute(getSpace));
router.patch('/espaces/:id', validateBody(updateSpaceSchema), asyncRoute(patchSpace));
router.delete('/espaces/:id', validateBody(leaveSchema), asyncRoute(removeSpace));
router.get('/espaces/:id/journal', asyncRoute(getSpaceTrail));

// The shared view: the only endpoint that returns another person's money, and
// the only one that needs to decide what each member granted.
router.get('/espaces/:id/partage', asyncRoute(getSharedView));

router.get('/espaces/:id/membres', asyncRoute(getMembers));
// MY sharing matrix. There is deliberately no route by which an owner or an
// admin could set somebody else's.
router.put('/espaces/:id/mon-partage', validateBody(sharingSchema), asyncRoute(putMySharing));
router.post('/espaces/:id/quitter', validateBody(leaveSchema), asyncRoute(postLeave));
router.put('/espaces/:id/membres/:memberId/role', validateBody(roleSchema), asyncRoute(putMemberRole));
router.delete('/espaces/:id/membres/:memberId', validateBody(leaveSchema), asyncRoute(removeMember));

router.post('/espaces/:id/invitations', validateBody(inviteSchema), asyncRoute(postInvite));
router.delete('/espaces/:id/invitations/:inviteId', asyncRoute(deleteInvite));

export default router;

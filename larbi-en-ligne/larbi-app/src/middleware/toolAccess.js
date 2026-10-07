import { ACCESS_LEVELS } from '../constants/roles.js';
import { toolByKey } from '../constants/tools.js';
import { requireAccessLevel, requireAuth } from './auth.js';

const open = (req, res, next) => next();

// The common access gate of every tool (P4-01): what the tool registry
// (constants/tools.js) says, enforced on the server. Changing a tool from free
// access to "account required" is one word in the registry, nothing else.
export function toolAccess(key) {
  const tool = toolByKey(key);
  if (!tool) throw new Error(`Unknown tool: ${key}`);
  if (tool.access === 'public') return [open];
  if (tool.access === 'authenticated') return [requireAuth];
  if (tool.access === 'premium') return [requireAuth, requireAccessLevel(ACCESS_LEVELS.PREMIUM)];
  throw new Error(`Unknown access rule for ${key}: ${tool.access}`);
}

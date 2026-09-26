import { prisma } from '../config/prisma.js';
import { SESSION_COOKIE, verifySession } from '../services/token.service.js';
import { isMaintenanceMode } from '../services/settings.service.js';

// Health, the public settings themselves and the whole admin API stay
// reachable: an administrator must be able to find out why the site is down
// and turn maintenance back off. Of the auth routes, only what identifies a
// session (login / logout / "who am I") stays open — registering an account,
// changing a password or editing a profile is exactly the kind of write the
// site is supposed to be closed for while maintenance is on, so those go
// through the same admin-only gate as everything else below.
const ALWAYS_ALLOWED = [
  { method: 'GET', path: /^\/api\/health/ },
  { method: 'ANY', path: /^\/api\/admin\// },
  { method: 'GET', path: /^\/api\/settings\/public/ },
  { method: 'POST', path: /^\/api\/auth\/login$/ },
  { method: 'POST', path: /^\/api\/auth\/logout$/ },
  { method: 'GET', path: /^\/api\/auth\/me$/ },
];

const isAlwaysAllowed = (req) => ALWAYS_ALLOWED.some((rule) => (rule.method === 'ANY' || rule.method === req.method) && rule.path.test(req.path));

// A logged-in administrator may still browse the rest of the API while
// maintenance is on (to check the site before reopening it); anyone else gets
// the same answer as a real outage would give.
export async function maintenanceGate(req, res, next) {
  try {
    if (isAlwaysAllowed(req)) return next();
    if (!(await isMaintenanceMode())) return next();

    const token = req.cookies?.[SESSION_COOKIE];
    if (token) {
      try {
        const payload = verifySession(token);
        const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { role: true, status: true } });
        if (user && user.status !== 'suspended' && user.role === 'admin') return next();
      } catch {
        // Not a valid session: fall through to the maintenance response.
      }
    }
    res.set('Cache-Control', 'no-store');
    res.status(503).json({ error: 'Service temporarily unavailable (maintenance)' });
  } catch (err) {
    next(err);
  }
}

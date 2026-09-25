import { prisma } from '../config/prisma.js';
import { SESSION_COOKIE, verifySession } from '../services/token.service.js';
import { isMaintenanceMode } from '../services/settings.service.js';

// Health, login/me, the public settings themselves and the whole admin API
// stay reachable: an administrator must be able to find out why the site is
// down, log in, and turn maintenance back off.
const ALWAYS_ALLOWED = [/^\/api\/health/, /^\/api\/auth\//, /^\/api\/settings\/public/, /^\/api\/admin\//];

// A logged-in administrator may still browse the rest of the API while
// maintenance is on (to check the site before reopening it); anyone else gets
// the same answer as a real outage would give.
export async function maintenanceGate(req, res, next) {
  try {
    if (ALWAYS_ALLOWED.some((re) => re.test(req.path))) return next();
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

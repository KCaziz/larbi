import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';

// Idempotency-Key (DEC-005 of the client's référentiel, P13-05): a creation
// sent twice with the same key — a double click, a network that retried — is
// made once; the second request gets the first answer again, marked
// `Idempotent-Replayed: true`. Without the header, nothing changes. A key is
// kept one day, for one person, and for one address only.
const KEEP_MS = 24 * 60 * 60 * 1000;

export function idempotent() {
  return async (req, res, next) => {
    const key = req.get('idempotency-key');
    if (!key) return next();
    if (key.length > 120) return next(new HttpError(400, 'Idempotency-Key too long', { reason: 'idempotencyKey' }));
    const userId = req.user.id;
    const route = `${req.method} ${req.baseUrl}${req.path}`.slice(0, 200);
    try {
      const found = await prisma.finIdempotencyKey.findUnique({ where: { userId_key: { userId, key } } });
      if (found && Date.now() - found.createdAt.getTime() < KEEP_MS) {
        if (found.route !== route) return next(new HttpError(422, 'This Idempotency-Key was used for another request', { reason: 'idempotencyKeyReused' }));
        return res.status(found.statusCode).set('Idempotent-Replayed', 'true').json(JSON.parse(found.body));
      }
      if (found) await prisma.finIdempotencyKey.delete({ where: { id: found.id } });
    } catch (error) {
      return next(error);
    }
    const send = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 300) return send(body);
      // The key is kept BEFORE the answer leaves: a second request sent the
      // moment the first one is answered must find it.
      prisma.finIdempotencyKey
        .create({ data: { userId, key, route, statusCode: res.statusCode, body: JSON.stringify(body) } })
        .then(() => prisma.finIdempotencyKey.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - KEEP_MS) } } }))
        .catch(() => {})
        .finally(() => send(body));
      return res;
    };
    return next();
  };
}

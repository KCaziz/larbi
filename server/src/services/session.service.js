// Signed-in devices (P8-20). A session is a row; its id travels in the cookie
// (`jti`) and is checked on every request, so revoking the row ends that
// session at once, which a stateless token alone cannot do. A token with no
// `jti` (issued before this existed) stays valid until it expires: nothing is
// force-signed-out by shipping this.
const TOUCH_EVERY_MS = 5 * 60 * 1000;

// A label a person recognises (« Chrome · Windows »), from the User-Agent
// header and nothing else. No address, no fingerprint, no history.
export function deviceLabel(userAgent) {
  const ua = String(userAgent ?? '');
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : null;
  const system = /Android/.test(ua) ? 'Android' : /iPhone|iPad|iOS/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : null;
  if (browser && system) return `${browser} · ${system}`;
  return browser ?? system ?? 'Appareil inconnu';
}

export async function createSession(prisma, userId, req) {
  const session = await prisma.userSession.create({ data: { userId, device: deviceLabel(req?.get?.('user-agent')) }, select: { id: true } });
  return session.id;
}

// Called on every authenticated request carrying a `jti`: the session must
// exist, be this person's and not be revoked. `lastSeenAt` is refreshed at most
// every few minutes, so this is not a write per request.
export async function checkSession(prisma, sessionId, userId) {
  const session = await prisma.userSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId || session.revokedAt) return false;
  if (Date.now() - session.lastSeenAt.getTime() > TOUCH_EVERY_MS) {
    await prisma.userSession.update({ where: { id: sessionId }, data: { lastSeenAt: new Date() } });
  }
  return true;
}

export function listSessions(prisma, userId) {
  return prisma.userSession.findMany({
    where: { userId, revokedAt: null },
    select: { id: true, device: true, createdAt: true, lastSeenAt: true },
    orderBy: { lastSeenAt: 'desc' },
  });
}

// Scoped to the owner: another person's session id changes nothing and says
// nothing (the count is 0 either way).
export async function revokeSession(prisma, userId, id) {
  const { count } = await prisma.userSession.updateMany({ where: { id, userId, revokedAt: null }, data: { revokedAt: new Date() } });
  return count;
}

export async function revokeOtherSessions(prisma, userId, exceptId) {
  const { count } = await prisma.userSession.updateMany({
    where: { userId, revokedAt: null, ...(exceptId ? { id: { not: exceptId } } : {}) },
    data: { revokedAt: new Date() },
  });
  return count;
}

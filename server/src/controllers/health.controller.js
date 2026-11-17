import { checkDatabaseConnection } from '../config/prisma.js';

// Why the database cannot be reached, as a category — never the driver's
// message itself (it names the user and the host). Enough to tell a wrong
// password from a refused connection on a host without a terminal to read the
// logs (mise en ligne fincludia.com, 2026-11-16). The driver hides the real
// cause under a "pool timeout" (45028): it is read from the error chain.
const CAUSES = [
  [/\b1045\b|Access denied for user/i, 'access_denied: wrong database user or password'],
  [/\b1044\b|Access denied .* to database/i, 'database_access_denied: user not added to the database (cPanel, all privileges)'],
  [/\b1049\b|Unknown database/i, 'unknown_database: wrong database name'],
  [/ECONNREFUSED/i, 'connection_refused: wrong host or port (try 127.0.0.1:3306)'],
  [/ENOTFOUND|EAI_AGAIN/i, 'host_not_found: wrong host name'],
  [/ETIMEDOUT/i, 'connection_timeout: database server not reachable'],
  [/ER_NOT_SUPPORTED_AUTH|auth.*plugin/i, 'auth_plugin: authentication method not supported'],
];

function failureReason(error) {
  let text = '';
  try {
    text = `${error?.message ?? ''} ${JSON.stringify(error?.meta ?? {})} ${String(error?.cause ?? '')}`;
  } catch {
    text = String(error?.message ?? '');
  }
  const found = CAUSES.find(([pattern]) => pattern.test(text));
  if (found) return found[1];
  return /45028|pool timeout/i.test(text) ? 'pool_timeout: no connection could be opened' : 'unknown';
}

export async function getHealth(req, res) {
  const health = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'unknown',
  };

  try {
    await checkDatabaseConnection();
    health.database = 'connected';
  } catch (error) {
    health.status = 'degraded';
    health.database = 'unavailable';
    health.reason = failureReason(error);
    console.error('Database unavailable:', error);
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
}

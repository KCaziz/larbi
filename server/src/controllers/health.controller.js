import { checkDatabaseConnection } from '../config/db.js';

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
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
}

import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// Minimal connection pool for the technical foundation (P1-01).
// A proper ORM/query layer with real domain models is introduced
// when those models exist (P1-05 / P1-06 / P2-01), per TASKS.md.
export const pool = new Pool({
  connectionString: env.databaseUrl,
});

export async function checkDatabaseConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
}

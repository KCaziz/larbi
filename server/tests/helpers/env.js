import { randomBytes } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Test environment. Tests NEVER touch the development database or storage:
// they use a dedicated database (larbi_test, created by tests/setup.js) and a
// throw-away storage folder. This module must be imported (and applyTestEnv
// called) BEFORE any application module, because src/config/env.js reads the
// environment when it is first loaded.

export const SERVER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const TEST_DB_NAME = 'larbi_test';

function developmentDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envFile = path.join(SERVER_DIR, '.env');
  if (existsSync(envFile)) {
    const match = readFileSync(envFile, 'utf8').match(/^DATABASE_URL=(.*)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error('Set TEST_DATABASE_URL, or DATABASE_URL in server/.env (the test database is derived from it).');
}

// Same server and credentials as development, but the database "larbi_test".
export function testDatabaseUrl() {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  const url = new URL(developmentDatabaseUrl());
  url.pathname = `/${TEST_DB_NAME}`;
  return url.toString();
}

export function databaseName(url) {
  return decodeURIComponent(new URL(url).pathname.replace(/^\//, ''));
}

// Tests delete data: refuse to run against anything that is not a test database.
export function assertTestDatabase(url) {
  const name = databaseName(url);
  if (!/_test$/.test(name)) throw new Error(`Refusing to run tests against database "${name}" (its name must end with _test).`);
}

// `production: true` boots the app the way it runs in production (no error
// details, Secure cookies...). `extra` overrides any variable (small rate limits...).
export function applyTestEnv({ production = false, extra = {} } = {}) {
  const url = testDatabaseUrl();
  assertTestDatabase(url);
  Object.assign(process.env, {
    NODE_ENV: production ? 'production' : 'test',
    DATABASE_URL: url,
    JWT_SECRET: process.env.JWT_SECRET_TEST || randomBytes(32).toString('hex'),
    JWT_EXPIRES_IN_SECONDS: '3600',
    LOG_REQUESTS: 'false',
    CORS_ORIGIN: 'http://localhost:5173',
    STORAGE_DIR: mkdtempSync(path.join(tmpdir(), 'larbi-test-storage-')),
    // Generous limits so functional tests never trip them; security tests lower them on purpose.
    AUTH_RATE_LIMIT: '100000',
    CONTACT_RATE_LIMIT: '100000',
    CERTIFICATE_RATE_LIMIT: '100000',
    MEDIA_RATE_LIMIT: '100000',
    MEDIA_DENIED_LIMIT: '100000',
    PUBLIC_READ_LIMIT: '100000',
    ...extra,
  });
  return process.env;
}

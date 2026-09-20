import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const required = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS) || 60 * 60 * 24 * 7,
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim()),
  isProduction: process.env.NODE_ENV === 'production',
  // One access-log line per request. Off for the automated tests (LOG_REQUESTS=false).
  logRequests: process.env.LOG_REQUESTS !== 'false' && process.env.NODE_ENV !== 'test',
  // Private storage for uploaded media. Lives OUTSIDE anything served
  // statically: files are only reachable through authorised API routes.
  storageDir: path.resolve(
    process.env.STORAGE_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), '../../storage'),
  ),
  // E-mail (newsletter confirmation, later password reset). No provider is chosen
  // yet: "console" keeps mails in memory / prints them (development and tests only),
  // "none" refuses to send (the default in production, so nothing is ever faked).
  mailDriver: process.env.MAIL_DRIVER || (process.env.NODE_ENV === 'production' ? 'none' : 'console'),
  // Public address of the website, used to build the links written in e-mails.
  publicUrl: (process.env.PUBLIC_URL || (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')[0]).trim().replace(/\/+$/, ''),
  maxImageBytes: Number(process.env.MAX_IMAGE_BYTES) || 5 * 1024 * 1024,
  maxDocumentBytes: Number(process.env.MAX_DOCUMENT_BYTES) || 25 * 1024 * 1024,
  maxVideoBytes: Number(process.env.MAX_VIDEO_BYTES) || 300 * 1024 * 1024,
};

if (!['console', 'none'].includes(env.mailDriver)) {
  throw new Error('MAIL_DRIVER must be "console" or "none" (no real provider is wired yet)');
}

if (env.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

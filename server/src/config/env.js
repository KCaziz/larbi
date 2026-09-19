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
  // Private storage for uploaded media. Lives OUTSIDE anything served
  // statically: files are only reachable through authorised API routes.
  storageDir: path.resolve(
    process.env.STORAGE_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), '../../storage'),
  ),
  maxImageBytes: Number(process.env.MAX_IMAGE_BYTES) || 5 * 1024 * 1024,
  maxDocumentBytes: Number(process.env.MAX_DOCUMENT_BYTES) || 25 * 1024 * 1024,
  maxVideoBytes: Number(process.env.MAX_VIDEO_BYTES) || 300 * 1024 * 1024,
};

if (env.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

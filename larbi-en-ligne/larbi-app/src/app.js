import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { maintenanceGate } from './middleware/maintenance.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', env.trustProxy);

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  // Articles and lessons can be long (validation allows 200 000 characters, up to
  // 3 bytes each): the administration accepts 1 MB, everything else keeps the
  // 100 kB default so a public route cannot be fed huge bodies.
  app.use('/api/admin', express.json({ limit: '1mb' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  if (env.logRequests) app.use(morgan(env.isProduction ? 'combined' : 'dev'));

  app.use(maintenanceGate);
  app.use('/api', routes);

  // Single-host deployment: the built website is served next to the API. Hashed
  // bundles are cached for a year; index.html never is, so a new build shows at once.
  // Every other non-API address returns index.html and React Router takes over.
  if (env.clientDir) {
    app.use('/assets', express.static(path.join(env.clientDir, 'assets'), { immutable: true, maxAge: '1y' }));
    app.use(express.static(env.clientDir, { index: false }));
    app.get(/^\/(?!api(\/|$)).*/, (req, res) => {
      res.set('Cache-Control', 'no-cache');
      res.sendFile(path.join(env.clientDir, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

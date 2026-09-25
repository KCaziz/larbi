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

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

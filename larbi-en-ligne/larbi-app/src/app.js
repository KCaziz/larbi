import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { maintenanceGate } from './middleware/maintenance.js';
import { MAX_NOTIFICATION_BYTES } from './constants/payments.js';
import { asyncRoute } from './utils/asyncRoute.js';
import { resolvePage } from './seo/pages.js';
import { renderPage } from './seo/html.js';
import { buildRobots, buildSitemap } from './seo/sitemap.js';

// Google Analytics 4 (P12-06), loaded by the website only when an
// administrator has set its identifier AND the visitor has accepted it.
const ANALYTICS_SOURCES = ['https://www.googletagmanager.com'];
const ANALYTICS_ENDPOINTS = ['https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://www.googletagmanager.com'];

export function createApp() {
  const app = express();
  app.set('trust proxy', env.trustProxy);

  // The default policy, with the two things the in-browser payslip reader needs
  // (P8-30): WebAssembly for the OCR engine (`'wasm-unsafe-eval'` allows ONLY
  // WebAssembly, not eval of strings) and workers from this same site. Nothing
  // third-party is allowed: the OCR engine, its worker and its language data are
  // served from `/ocr`.
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'script-src': ["'self'", "'wasm-unsafe-eval'", ...ANALYTICS_SOURCES],
          'worker-src': ["'self'", 'blob:'],
          'connect-src': ["'self'", ...ANALYTICS_ENDPOINTS],
          'img-src': ["'self'", 'data:', 'blob:', ...ANALYTICS_ENDPOINTS],
        },
      },
    }),
  );
  // Pages, scripts and API answers are text: compressed, they reach a phone on
  // a mobile network several times faster.
  app.use(compression());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  // Payment notifications (P3-09) are read RAW: the provider signs the exact
  // bytes it sends, so the body must not be parsed and re-serialised first.
  app.use('/api/payments/webhook', express.raw({ type: () => true, limit: MAX_NOTIFICATION_BYTES }));
  // Articles and lessons can be long (validation allows 200 000 characters, up to
  // 3 bytes each): the administration accepts 1 MB, everything else keeps the
  // 100 kB default so a public route cannot be fed huge bodies.
  app.use('/api/admin', express.json({ limit: '1mb' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  if (env.logRequests) app.use(morgan(env.isProduction ? 'combined' : 'dev'));

  app.use(maintenanceGate);
  // Never kept by a cache (recette R11-16): the host's nginx stored GET answers
  // of the API and served them again after a change — a movement pointed, an
  // income added, then the list came back as it was before (304). Every API
  // answer belongs to one person at one moment: none may be stored or shared.
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, private');
    res.set('Pragma', 'no-cache');
    res.vary('Cookie');
    // The API feeds the pages (search engines may read it to show them) but is
    // never a result of its own.
    res.set('X-Robots-Tag', 'noindex');
    next();
  });
  app.use('/api', routes);

  // Search engines (P12-06): the list of pages and the rules for crawlers.
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain').set('Cache-Control', 'public, max-age=3600').send(buildRobots());
  });
  app.get(
    '/sitemap.xml',
    asyncRoute(async (req, res) => {
      res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(await buildSitemap());
    }),
  );

  // Single-host deployment: the built website is served next to the API. Hashed
  // bundles are cached for a year; index.html never is, so a new build shows at once.
  // Every other non-API address returns index.html and React Router takes over.
  if (env.clientDir) {
    const indexFile = path.join(env.clientDir, 'index.html');
    // One spelling per page: fincludia.com, not www.fincludia.com (the
    // certificate and the DNS answer both, search engines must see one).
    const canonicalHost = new URL(env.publicUrl).host;
    if (env.isProduction) {
      app.use((req, res, next) => {
        if ((req.method === 'GET' || req.method === 'HEAD') && req.headers.host === `www.${canonicalHost}`) {
          return res.redirect(301, `${env.publicUrl}${req.originalUrl}`);
        }
        return next();
      });
    }
    app.use('/assets', express.static(path.join(env.clientDir, 'assets'), { immutable: true, maxAge: '1y' }));
    // Icons, share image, fonts copied as is: a day in cache.
    app.use(express.static(env.clientDir, { index: false, maxAge: '1d' }));
    // Each page is sent with its own title, description, language versions and
    // readable content (src/seo), and with its real status: 404 for an
    // address that does not exist, instead of an empty "200 OK" page.
    app.get(/^\/(?!api(\/|$)).*/, async (req, res) => {
      res.set('Cache-Control', 'no-cache');
      let page;
      try {
        page = await resolvePage(req.path);
      } catch (err) {
        // The database is unreachable: the website itself still loads.
        console.error('SEO page resolution failed', err);
        return res.sendFile(indexFile);
      }
      if (page.redirect) {
        const query = req.originalUrl.slice(req.path.length);
        return res.redirect(301, `${encodeURI(page.redirect)}${query}`);
      }
      if (page.noindex) res.set('X-Robots-Tag', 'noindex');
      if (page.status === 503) res.set('Retry-After', '3600');
      return res.status(page.status).type('html').send(renderPage(indexFile, page));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

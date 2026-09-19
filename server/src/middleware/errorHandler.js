import { env } from '../config/env.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message: statusCode >= 500 && env.isProduction ? 'Internal server error' : err.message,
      ...(err.details && statusCode < 500 ? { details: err.details } : {}),
      ...(env.isProduction ? {} : { stack: err.stack }),
    },
  });
}

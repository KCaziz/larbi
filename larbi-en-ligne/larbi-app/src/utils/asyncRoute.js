import { HttpError } from './httpError.js';

// Wraps an async handler: forwards errors to Express and turns the common
// Prisma "row not found / constraint" errors into clean HTTP errors.
export const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (err?.code === 'P2025') return next(new HttpError(404, 'Not found'));
    if (err?.code === 'P2002') return next(new HttpError(409, 'Already exists'));
    return next(err);
  });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// router.param handler: malformed ids are a 404, never reach the database.
export function uuidParam(req, res, next, value) {
  return UUID.test(value) ? next() : next(new HttpError(404, 'Not found'));
}

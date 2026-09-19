import { HttpError } from '../utils/httpError.js';

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const fields = result.error.issues.map((i) => i.path.join('.') || 'body');
    return next(new HttpError(400, `Invalid input: ${[...new Set(fields)].join(', ')}`));
  }
  req.body = result.data;
  next();
};

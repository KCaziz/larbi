// A constant message: what the visitor typed (method, path) is never echoed back.
export function notFound(req, res, next) {
  res.status(404).json({ error: { message: 'Route not found' } });
}

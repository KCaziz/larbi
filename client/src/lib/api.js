// Thin fetch wrapper around the Express API.
// - `credentials: 'include'` sends the httpOnly session cookie the server sets.
// - Non-2xx responses and network failures both throw ApiError, so callers
//   handle one error shape. `status === 0` means "server unreachable".
// - `details` carries structured info the server chose to expose (e.g. the
//   list of missing items when publication is refused).
// The base URL is same-origin `/api` (Vite proxy in dev, reverse proxy in
// production) unless VITE_API_URL says otherwise.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: 'include',
      // FormData sets its own multipart boundary header.
      headers: body === undefined || isForm ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, 'Network error');
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON body (e.g. a proxy error page): fall through with data = null.
  }

  if (!response.ok) {
    throw new ApiError(response.status, data?.error?.message ?? response.statusText, data?.error?.details);
  }
  return data;
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  // Sends one file in the multipart field "file".
  upload: (path, file, options) => {
    const form = new FormData();
    form.append('file', file);
    return request(path, { ...options, method: 'POST', body: form });
  },
};

// Maps an ApiError to an i18n key, so no server (English) message is ever
// shown to the user. Callers can pass status-specific overrides.
export function errorKey(err, overrides = {}) {
  const status = err instanceof ApiError ? err.status : -1;
  if (overrides[status]) return overrides[status];
  if (status === 0) return 'errors.network';
  if (status === 400) return 'errors.invalid';
  if (status === 403) return 'errors.forbidden';
  if (status === 404) return 'errors.notFound';
  if (status === 413) return 'errors.fileTooLarge';
  if (status === 415) return 'errors.fileUnsupported';
  if (status === 429) return 'errors.tooMany';
  return 'errors.generic';
}

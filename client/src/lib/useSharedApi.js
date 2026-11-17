import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

// GET data that is the same for the whole visit (public settings, the
// assistant's published questions): fetched ONCE and shared by every component
// and every page that asks for it, kept for `ttl` milliseconds.
// Found in the navigation test of 2026-11-17: one public page called
// /settings/public six times (footer, banner, maintenance gate, Analytics…)
// and the assistant's three lists on every page — about ten calls per page,
// enough for a visitor reading quickly to hit the server's request limit.
const cache = new Map(); // path -> { at, promise, value, error }

function load(path, ttl) {
  const entry = cache.get(path);
  if (entry && Date.now() - entry.at < ttl) return entry.promise;
  const fresh = { at: Date.now(), value: undefined, error: undefined };
  fresh.promise = api.get(path).then(
    (data) => {
      fresh.value = data;
      return data;
    },
    (error) => {
      // A failure is not kept: the next component asks again.
      cache.delete(path);
      throw error;
    },
  );
  cache.set(path, fresh);
  return fresh.promise;
}

// Forget a path (after an administrator changed the settings, for example).
export function invalidateShared(path) {
  cache.delete(path);
}

export function useSharedApi(path, { ttl = 60_000 } = {}) {
  const cached = path ? cache.get(path) : null;
  const initial = cached && cached.value !== undefined && Date.now() - cached.at < ttl ? { path, status: 'ready', data: cached.value, error: null } : { path: null, status: 'loading', data: null, error: null };
  const [result, setResult] = useState(initial);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!path) return undefined;
    let alive = true;
    load(path, ttl)
      .then((data) => alive && setResult({ path, status: 'ready', data, error: null }))
      .catch((error) => alive && setResult({ path, status: 'error', data: null, error }));
    return () => {
      alive = false;
    };
  }, [path, ttl, attempt]);

  const reload = useCallback(() => {
    if (path) cache.delete(path);
    setAttempt((n) => n + 1);
  }, [path]);

  const current = result.path === path;
  return { status: current ? result.status : 'loading', data: current ? result.data : null, error: current ? result.error : null, reload };
}

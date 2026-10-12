import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

// Loads GET `path` and exposes { status, data, error, reload, setData }.
// status: 'loading' | 'ready' | 'error'. A change of `path` counts as loading
// again WITHOUT calling setState inside the effect: the stored result simply
// no longer matches the current path/attempt.
export function useApi(path) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ path: null, attempt: -1, status: 'loading', data: null, error: null });

  useEffect(() => {
    if (!path) return undefined;
    const controller = new AbortController();
    api
      .get(path, { signal: controller.signal })
      .then((data) => setResult({ path, attempt, status: 'ready', data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setResult({ path, attempt, status: 'error', data: null, error });
      });
    return () => controller.abort();
  }, [path, attempt]);

  const samePath = result.path === path;
  const current = samePath && result.attempt === attempt;
  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  // Replace the loaded data after a local action (e.g. enrolling returns the fresh detail).
  const setData = useCallback((data) => setResult((r) => ({ ...r, data })), []);

  return {
    status: current ? result.status : 'loading',
    // A RELOAD of the same path keeps what is already on screen. Clearing it
    // made the page render its loading state instead of its content, which
    // unmounts every child: a half-typed form, a warning that had just been
    // shown, the confirmation of the write that triggered the reload. A change
    // of `path` still clears, because that is a different resource.
    data: samePath ? result.data : null,
    error: current ? result.error : null,
    reload,
    setData,
  };
}

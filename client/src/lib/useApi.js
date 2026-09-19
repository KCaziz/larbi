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

  const current = result.path === path && result.attempt === attempt;
  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  // Replace the loaded data after a local action (e.g. enrolling returns the fresh detail).
  const setData = useCallback((data) => setResult((r) => ({ ...r, data })), []);

  return {
    status: current ? result.status : 'loading',
    data: current ? result.data : null,
    error: current ? result.error : null,
    reload,
    setData,
  };
}

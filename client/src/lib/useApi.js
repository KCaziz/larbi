import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

// A write elsewhere on the page (the quick-add sheet) says so with this event,
// and every screen that is showing figures reads them again.
const DATA_CHANGED_EVENT = 'fin:data-changed';

// Recette R18 (2026-11-18): « des fois, dans une page, Impossible de charger
// les données ; il faut cliquer sur Réessayer pour que ça marche », and lists
// (the categories of the Mouvements) that stayed empty until a reload. The
// host answers now and then with a passing failure — the application being
// restarted, the database refusing one more connection for a moment. What a
// click on « Réessayer » did by hand is now done by itself, twice, before the
// error is shown. A refusal (4xx) is an answer, never tried again.
const RETRY_DELAYS = [400, 1200];
const passing = (error) => error?.status === 0 || error?.status === 429 || error?.status >= 500;
const pause = (ms, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

export async function getWithRetry(path, signal) {
  for (let round = 0; ; round += 1) {
    try {
      return await api.get(path, { signal });
    } catch (error) {
      if (error.name === 'AbortError' || !passing(error) || round >= RETRY_DELAYS.length) throw error;
      await pause(RETRY_DELAYS[round], signal);
    }
  }
}

// Loads GET `path` and exposes { status, data, error, reload, setData }.
// status: 'loading' | 'ready' | 'error'. A change of `path` counts as loading
// again WITHOUT calling setState inside the effect: the stored result simply
// no longer matches the current path/attempt.
//
// `keep: true` keeps what is on screen while ANOTHER path loads (a filter that
// changes): the list stays, dimmed, instead of blinking to a spinner.
export function useApi(path, { keep = false } = {}) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ path: null, attempt: -1, status: 'loading', data: null, error: null });

  useEffect(() => {
    if (!path) return undefined;
    const controller = new AbortController();
    getWithRetry(path, controller.signal)
      .then((data) => setResult({ path, attempt, status: 'ready', data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setResult({ path, attempt, status: 'error', data: null, error });
      });
    return () => controller.abort();
  }, [path, attempt]);

  const samePath = result.path === path;
  const current = samePath && result.attempt === attempt;
  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  useEffect(() => {
    window.addEventListener(DATA_CHANGED_EVENT, reload);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, reload);
  }, [reload]);
  // Replace the loaded data after a local action (e.g. enrolling returns the fresh detail).
  const setData = useCallback((data) => setResult((r) => ({ ...r, data })), []);

  return {
    status: current ? result.status : 'loading',
    // A RELOAD of the same path keeps what is already on screen. Clearing it
    // made the page render its loading state instead of its content, which
    // unmounts every child: a half-typed form, a warning that had just been
    // shown, the confirmation of the write that triggered the reload. A change
    // of `path` still clears, because that is a different resource.
    data: samePath || keep ? result.data : null,
    error: current ? result.error : null,
    reload,
    setData,
  };
}

import { useEffect, useState } from 'react';
import { api } from './api.js';

// API value -> key under `accountTypes.*` in the locale files.
const LABEL_KEYS = { 'auto-entrepreneur': 'autoEntrepreneur', pme: 'pme', pmi: 'pmi' };

// Translated label; unknown (future) categories fall back to the API label.
export function accountTypeLabel(t, type) {
  const key = LABEL_KEYS[type.value ?? type];
  return key ? t(`accountTypes.${key}`) : (type.label ?? type);
}

// Loads the allowed account types from GET /api/account-types.
// status: 'loading' | 'ready' | 'error'
export function useAccountTypes() {
  const [state, setState] = useState({ status: 'loading', types: [] });

  useEffect(() => {
    const controller = new AbortController();
    api
      .get('/account-types', { signal: controller.signal })
      .then((data) => setState({ status: 'ready', types: data }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ status: 'error', types: [] });
      });
    return () => controller.abort();
  }, []);

  return state;
}

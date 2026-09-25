import { useEffect, useState } from 'react';
import { api } from './api.js';

// Account categories are admin-managed content (P3-15), like a formation category
// or a blog tag: the label IS the text to show, in whichever single language the
// admin wrote it in — there is no translation key to look up.
export function accountTypeLabel(type) {
  return typeof type === 'string' ? type : (type.label ?? type.value);
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

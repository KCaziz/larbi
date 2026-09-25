import { useApi } from './useApi.js';

// Platform settings safe to read before login (P3-16): maintenance banner,
// contact details shown in the footer / contact page. `{ status, data }` —
// callers treat a non-'ready' status as "nothing to show yet", never as an error.
export function usePublicSettings() {
  return useApi('/settings/public');
}

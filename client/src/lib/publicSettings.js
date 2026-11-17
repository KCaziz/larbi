import { invalidateShared, useSharedApi } from './useSharedApi.js';

// Platform settings safe to read before login (P3-16): maintenance banner,
// contact details shown in the footer / contact page, Analytics identifier.
// `{ status, data }` — callers treat a non-'ready' status as "nothing to show
// yet", never as an error. Fetched once and shared by every component that
// asks (see useSharedApi): a page used to ask six times.
const PATH = '/settings/public';

export function usePublicSettings() {
  return useSharedApi(PATH, { ttl: 60_000 });
}

// After an administrator saved the settings: the next reader fetches them again.
export function invalidatePublicSettings() {
  invalidateShared(PATH);
}

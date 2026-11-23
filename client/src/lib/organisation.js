import { useEffect, useState } from 'react';

// P13-05, lot A (2026-11-23): the organisation the person is working in, when
// they belong to several (the client's référentiel). Kept in this browser and
// sent with every request of the business space (header `X-Organisation`, see
// lib/api.js); the server checks membership, role and mandate each time, so
// this choice is a preference, never a right.
const KEY = 'fincludia.organisation';
const EVENT = 'fincludia:organisation';

export function currentOrganisation() {
  try {
    return window.localStorage.getItem(KEY) || null;
  } catch {
    return null;
  }
}

export function setOrganisation(id) {
  try {
    if (id) window.localStorage.setItem(KEY, id);
    else window.localStorage.removeItem(KEY);
  } catch {
    // Private browsing: the choice lasts as long as the page.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: id || null }));
}

export function useOrganisation() {
  const [id, setId] = useState(currentOrganisation);
  useEffect(() => {
    const update = (event) => setId(event.detail ?? currentOrganisation());
    window.addEventListener(EVENT, update);
    return () => window.removeEventListener(EVENT, update);
  }, []);
  return [id, setOrganisation];
}

// A key for one creation (Idempotency-Key): the same form sent twice — a
// double click, a network that retried — is created once.
export const newIdempotencyKey = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

import { useEffect, useState } from 'react';

// R17-05 — the account the person is working on, the SAME on every screen
// (client, 2026-11-18): « il suffit que je clique sur une autre tâche pour que
// le compte revienne à tous les comptes, alors que chaque tâche doit être
// paramétrée selon le compte choisi ». 'total' = the accounts counted in the
// single balance; otherwise one account id (an account kept apart from the
// total included). Kept in this browser, shared by the Accueil, the Synthèse,
// the Mouvements… and changed from any of them.
const KEY = 'fincludia.account.scope';
const EVENT = 'fincludia:account-scope';

function read() {
  try {
    const value = window.localStorage.getItem(KEY);
    return value && value !== 'null' ? value : 'total';
  } catch {
    return 'total';
  }
}

export function setAccountScope(value) {
  try {
    window.localStorage.setItem(KEY, value || 'total');
  } catch {
    // Private browsing: the choice lasts as long as the page.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value || 'total' }));
}

export function useAccountScope() {
  const [scope, setScope] = useState(read);
  useEffect(() => {
    const update = (event) => setScope(event.detail ?? read());
    window.addEventListener(EVENT, update);
    return () => window.removeEventListener(EVENT, update);
  }, []);
  return [scope, setAccountScope];
}

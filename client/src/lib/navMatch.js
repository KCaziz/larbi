// Only ONE entry of a menu lights up (recette R18, 2026-11-18): on
// /app/objectifs/fonds-urgence, « Objectifs » (/app/objectifs) and « Réserve »
// (/app/objectifs/fonds-urgence) both matched. The entry whose address is the
// longest one containing the current page wins.
export function bestNavMatch(pathname, entries) {
  let best = null;
  for (const entry of entries) {
    const to = entry.to;
    const matches = entry.end ? pathname === to : pathname === to || pathname.startsWith(to.endsWith('/') ? to : `${to}/`);
    if (matches && (!best || to.length > best.length)) best = to;
  }
  return best;
}

// NavLink props that light the entry only when it is the best match.
export function navLinkProps(entry, best, className) {
  const on = entry.to === best;
  return {
    className: () => (on ? `${className} active` : className),
    'aria-current': on ? 'page' : 'false',
  };
}

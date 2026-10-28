import { useLocation } from 'react-router-dom';

// The tools are served twice: on the showcase (`/outils/...`) and inside the
// application (`/app/outils/...`, P8-02). A link written `/outils/...` inside
// the application took the person out of it, without its menu (found on the
// bank comparator, P8-28). Prefix every tool link with this base.
export function useToolsBase() {
  const { pathname } = useLocation();
  return pathname === '/app' || pathname.startsWith('/app/') ? '/app' : '';
}

// The catalogue of formations, the same way: `/catalogue` on the showcase,
// `/app/formation` inside the application (P8-17).
export function useCatalogueBase() {
  return useToolsBase() ? '/app/formation' : '/catalogue';
}

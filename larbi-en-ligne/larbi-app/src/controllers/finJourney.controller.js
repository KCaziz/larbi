import { prisma } from '../config/prisma.js';
import {
  ADULT_ONLY_ROUTES,
  ADULT_ONLY_SCREENS,
  JOURNEYS,
  SCREEN_ROUTES,
  journeyFor,
  screenEnabledFor,
} from '../constants/finJourneys.js';
import { FIN_PUBLICS, isAdultAgeRange } from '../constants/finPublics.js';
import { dashboardFor } from '../constants/finDashboard.js';
import { menuFor, OUT_OF_MENU_ROUTES } from '../constants/finNavigation.js';

// The journey map of the caller (P6-17), from the client's own tab
// `19_Cartes_Parcours`.
//
// The SERVER decides what a public may open. The navigation reads this answer
// instead of holding its own list, which is the difference between a menu that
// happens to match the rule and a menu that cannot disagree with it: the routes
// behind the adults-only screens are guarded by `requireAdult`, so hiding them
// here is a convenience, never the protection itself.

export function getJourney(req, res) {
  const publicCode = req.user.finPublic ?? null;
  const journey = journeyFor(publicCode);
  const adult = isAdultAgeRange(req.user.finAgeRange) === true;

  // The screens this account may actually open: enabled for its public, served
  // by a route, and allowed by its age.
  const screens = Object.entries(SCREEN_ROUTES)
    .filter(([code]) => screenEnabledFor(publicCode, code))
    .map(([code, screen]) => ({
      code,
      label: screen.label,
      to: screen.to,
      // Why a screen is not openable, when it is not — so the interface can say
      // so rather than silently omit it.
      indisponible: screen.to === null ? (screen.waitingOn ?? screen.task ?? true) : null,
      adultsOnly: screen.adultsOnly === true,
      autorise: screen.to !== null && (screen.adultsOnly !== true || adult),
      note: screen.note ?? null,
    }));

  res.json({
    publicCode,
    // The client's own experience name and mission for this public.
    experience: FIN_PUBLICS.find((row) => row.code === publicCode) ?? null,
    // The client's own words for this journey: the main dashboard and the
    // visible navigation, in the client's own order.
    tableauPrincipal: journey?.dashboard ?? null,
    navigation: journey?.nav ?? [],
    // The menu of the connected space (P1-12): the client's nine entries, in
    // its order, each reduced to the routes this account may open. The
    // navigation renders this answer instead of holding its own list, so a menu
    // cannot disagree with the rule it is supposed to show.
    menu: menuFor({ publicCode, adult }),
    // Served routes the client places in the top bar or the account rather than
    // in a menu group — named so the interface does not have to guess that
    // their absence from `menu` is deliberate.
    horsMenu: OUT_OF_MENU_ROUTES,
    // Which of our dashboards (P6-06) backs that name.
    tableauDeBord: dashboardFor(publicCode).title,
    ecrans: screens,
    // Stated rather than implied: these are refused server-side, and an account
    // that has not said its age bracket is treated as a minor.
    reserveAuxAdultes: { ecrans: ADULT_ONLY_SCREENS, routes: ADULT_ONLY_ROUTES, autorise: adult },
    // Somebody who has not chosen a public yet sees every screen: refusing them
    // would lock a new account out of its own money. The list is offered so the
    // interface can invite them to choose.
    publicsDisponibles: publicCode ? null : Object.keys(JOURNEYS),
  });
}

// The whole map, for reference: every public, every screen, and what we serve
// for it. This IS the provenance matrix the end-of-phase validation asks for
// (tab `18_Provenance`), which is why it is published rather than kept in a
// file nobody can query.
export async function getJourneyMap(req, res) {
  const publics = await prisma.user.count({ where: { finPublic: { not: null } } });
  res.json({
    publics: FIN_PUBLICS,
    parcours: JOURNEYS,
    ecrans: SCREEN_ROUTES,
    // The honest summary: how many of the client's screens we serve, and what
    // the rest is waiting for.
    couverture: {
      total: Object.keys(SCREEN_ROUTES).length,
      servis: Object.values(SCREEN_ROUTES).filter((screen) => screen.to !== null).length,
      enAttente: Object.entries(SCREEN_ROUTES)
        .filter(([, screen]) => screen.to === null)
        .map(([code, screen]) => ({ code, label: screen.label, waitingOn: screen.waitingOn ?? screen.task ?? null, note: screen.note ?? null })),
    },
    comptesAvecParcours: publics,
  });
}

import {
  ArrowLeftRight,
  Award,
  ListChecks,
  PiggyBank,
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  CreditCard,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  PieChart,
  Receipt,
  Settings,
  ShieldCheck,
  Tag,
  Target,
  TrendingUp,
  UserRound,
  Wallet,
  Wrench,
  Rocket,
  Star,
} from 'lucide-react';

// The navigation of the application (P8-02): the client's final order
// (consolidated specification, tab 03), the SAME for every profile (ARC-02).
// Profiles change the educational layer, never the menu. The only entries a
// person may not see are the adults-only ones, and only once they have said
// they are a minor — the server refuses those routes anyway (`requireAdult`).
//
// The application lives under `/app`, apart from the showcase site (P8-01
// point 8): same domain, same session, its own layout.
export const APP_BASE = '/app';

// The client's definitive order (answer D3, 2026-10-28), with the improvements
// retained the same day (TASKS.md, P8-01): « Mouvements » and « Budgets » in
// the menu, « Santé financière » beside « Synthèse », and five sections.
export const NAV_SECTIONS = [
  // « Mes premiers pas » at the head of the menu (recette R4-04): the first
  // thing a new account has to do, never hidden behind the profile button.
  { key: 'start', labelKey: 'appNav.sections.start' },
  { key: 'daily', labelKey: 'appNav.sections.daily' },
  { key: 'analyse', labelKey: 'appNav.sections.analyse' },
  { key: 'build', labelKey: 'appNav.sections.build' },
  { key: 'tools', labelKey: 'appNav.sections.tools' },
  // « Bas de barre » in the client's words: the educational layer.
  { key: 'learn', labelKey: 'appNav.sections.learn' },
];

export const APP_NAV = [
  { key: 'firstSteps', to: '/app/parametres/premiers-pas', labelKey: 'appNav.settingsOnboarding', icon: Rocket, section: 'start' },
  { key: 'home', to: '/app', end: true, labelKey: 'appNav.home', icon: Home, mobile: true, section: 'daily' },
  // The list of what is left to do; the Accueil shows the figures.
  { key: 'today', to: '/app/aujourdhui', labelKey: 'appNav.today', icon: ListChecks, mobile: true, section: 'daily' },
  { key: 'accounts', to: '/app/comptes', labelKey: 'appNav.accounts', icon: Wallet, mobile: true, section: 'daily' },
  { key: 'movements', to: '/app/mouvements', labelKey: 'appNav.movements', icon: ArrowLeftRight, mobile: true, section: 'daily' },
  { key: 'budgets', to: '/app/budgets', labelKey: 'appNav.budgets', icon: PiggyBank, section: 'daily' },
  { key: 'calendar', to: '/app/calendrier', labelKey: 'appNav.calendar', icon: CalendarDays, section: 'daily' },
  { key: 'synthesis', to: '/app/synthese', labelKey: 'appNav.synthesis', icon: PieChart, section: 'analyse' },
  { key: 'health', to: '/app/sante', labelKey: 'appNav.health', icon: HeartPulse, section: 'analyse' },
  { key: 'goals', to: '/app/objectifs', labelKey: 'appNav.goals', icon: Target, section: 'build' },
  { key: 'debts', to: '/app/dettes', labelKey: 'appNav.debts', icon: CreditCard, adultsOnly: true, section: 'build' },
  { key: 'wealth', to: '/app/patrimoine', labelKey: 'appNav.wealth', icon: Landmark, adultsOnly: true, section: 'build' },
  { key: 'paper', to: '/app/portefeuille', labelKey: 'appNav.paper', icon: TrendingUp, section: 'build' },
  { key: 'tools', to: '/app/outils', labelKey: 'appNav.tools', icon: Wrench, section: 'tools' },
  { key: 'learning', to: '/app/formation', labelKey: 'appNav.learning', icon: GraduationCap, section: 'learn' },
  { key: 'progress', to: '/app/progression', labelKey: 'appNav.progress', icon: Award, section: 'learn' },
  { key: 'certificates', to: '/app/certificats', labelKey: 'appNav.certificates', icon: BadgeCheck, section: 'learn' },
];

// « Mon espace » (tab 03B): profile, preferences, currency, privacy,
// notifications — out of the financial menu, behind the profile button.
export const SETTINGS_LINKS = [
  { to: '/app/parametres/profil', labelKey: 'account.nav.profile', icon: UserRound },
  { to: '/app/parametres/fincludia', labelKey: 'appNav.settingsFinance', icon: Settings },
  { to: '/app/parametres/categories', labelKey: 'appNav.settingsCategories', icon: Tag },
  { to: '/app/parametres/premiers-pas', labelKey: 'appNav.settingsOnboarding', icon: Rocket },
  { to: '/app/notifications', labelKey: 'appNav.settingsNotifications', icon: Bell },
  { to: '/app/parametres/confiance', labelKey: 'appNav.settingsTrust', icon: ShieldCheck },
  { to: '/app/parametres/formations', labelKey: 'account.nav.formations', icon: GraduationCap },
  { to: '/app/parametres/paiements', labelKey: 'appNav.settingsPayments', icon: Receipt },
  { to: '/app/parametres/premium', labelKey: 'appNav.settingsPremium', icon: Star },
  // The business space comes from the contract (annex 1, P7-02), not from the
  // client's navigation: it sits with the account, adults only.
  { to: '/app/entreprise', labelKey: 'nav.businessSpace', icon: Building2, adultsOnly: true },
];

// Where each address of the former connected space now lives. A bookmark, a
// link in an old notification or in a page not yet updated still arrives.
// `prefix: true` carries the rest of the path along (`/budget/42` →
// `/app/budgets/42`).
export const LEGACY_REDIRECTS = [
  { from: 'aujourdhui', to: '/app' },
  { from: 'mon-argent', to: '/app/synthese' },
  { from: 'budget', to: '/app/budgets', prefix: true },
  { from: 'calendrier', to: '/app/calendrier' },
  { from: 'objectifs', to: '/app/objectifs' },
  { from: 'reserve', to: '/app/objectifs/fonds-urgence' },
  { from: 'dettes', to: '/app/dettes' },
  { from: 'patrimoine', to: '/app/patrimoine' },
  { from: 'financement', to: '/app/financement' },
  { from: 'portefeuille', to: '/app/portefeuille' },
  { from: 'espaces', to: '/partage' },
  { from: 'entreprise', to: '/app/entreprise' },
  { from: 'notifications', to: '/app/notifications' },
  { from: 'confiance', to: '/app/parametres/confiance' },
  { from: 'passeport', to: '/app/progression' },
  { from: 'catalogue', to: '/app/formation', prefix: true },
  { from: 'outils/credit', to: '/app/outils/credit' },
  { from: 'outils/facture', to: '/app/outils/facture' },
  { from: 'outils/explorateur', to: '/app/outils/explorateur' },
  { from: 'compte', to: '/app/parametres/profil' },
  { from: 'compte/profil', to: '/app/parametres/profil' },
  { from: 'compte/tableau-de-bord', to: '/app/progression' },
  { from: 'compte/formations', to: '/app/parametres/formations' },
  { from: 'compte/certificats', to: '/app/certificats' },
  { from: 'compte/type', to: '/app/parametres/type' },
  { from: 'compte/premium', to: '/app/parametres/premium' },
  { from: 'compte/paiements', to: '/app/parametres/paiements' },
  { from: 'compte/fincludia', to: '/app/parametres/fincludia' },
  { from: 'compte/categories', to: '/app/parametres/categories' },
  { from: 'compte/premiers-pas', to: '/app/parametres/premiers-pas' },
];

// The pages a screen can go back to (recette R3-04), besides the menu.
const BACK_PARENTS = [
  ...APP_NAV.filter((entry) => entry.to !== APP_BASE),
  { to: '/app/parametres', labelKey: 'appNav.mySpace' },
  { to: '/app/parametres/premiers-pas', labelKey: 'appNav.settingsOnboarding' },
  { to: '/app/apprendre', labelKey: 'appNav.learnHub' },
  { to: '/partage', labelKey: 'appNav.sharedApp' },
];

// Where a page goes back to when it does not say so itself: the closest page
// above it in the address, else the Accueil. The Accueil and the list of
// spaces, the two doors of the applications, have none.
export function backFor(pathname) {
  const path = pathname.replace(/\/+$/, '');
  if (path === APP_BASE || path === '/partage') return null;
  if (!path.startsWith(`${APP_BASE}/`) && !path.startsWith('/partage/')) return null;
  const parent = BACK_PARENTS.filter((entry) => path.startsWith(`${entry.to}/`)).sort((a, b) => b.to.length - a.to.length)[0];
  if (parent) return { to: parent.to, labelKey: parent.labelKey };
  return { to: APP_BASE, labelKey: 'appNav.home' };
}

// The entries a person may see: all of them, minus the adults-only ones for a
// DECLARED minor.
export const visibleEntries = (entries, { declaredMinor }) => entries.filter((entry) => !(entry.adultsOnly && declaredMinor));

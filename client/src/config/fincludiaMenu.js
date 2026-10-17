import {
  Award,
  Banknote,
  Building,
  Building2,
  BookOpen,
  Briefcase,
  CalendarClock,
  Compass,
  CreditCard,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Landmark,
  LifeBuoy,
  PiggyBank,
  Receipt,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';

// How the menu of the connected space is WRITTEN (P1-12). What it CONTAINS is
// decided by the server (`GET /fin/parcours`, `menu`): the nine entries of the
// client's specification § 2-3, each reduced to the routes this account may
// open, for its public and its age.
//
// This file therefore holds no rule and no list of its own — only the label and
// the icon of a route the server named. That split is the point: a menu that
// held its own list could disagree with the rule it is supposed to show, and
// the previous navigation did exactly that (a flat hand-written array of
// fourteen entries).
//
// A route the server sends and this file does not know is still rendered, under
// its path, rather than silently dropped: a missing label is a translation to
// write, not a reason to hide a page the account is entitled to.
export const GROUP_ICONS = {
  today: Sparkles,
  money: Wallet,
  goals: Target,
  safety: ShieldCheck,
  wealth: Landmark,
  invest: TrendingUp,
  together: Users,
  explore: Compass,
  learn: BookOpen,
  // La dixième entrée, et elle n'est pas du client : l'espace entreprise vient
  // de l'annexe 1 du contrat, pas de la spécification § 2-3 (voir P7-02).
  business: Building2,
};

export const ROUTE_LABELS = {
  '/aujourdhui': { labelKey: 'nav.today', icon: Sparkles },
  '/mon-argent': { labelKey: 'nav.money', icon: Wallet },
  '/budget': { labelKey: 'nav.budget', icon: Receipt },
  '/calendrier': { labelKey: 'nav.calendar', icon: CalendarClock },
  '/objectifs': { labelKey: 'nav.goals', icon: Target },
  '/reserve': { labelKey: 'nav.reserve', icon: LifeBuoy },
  '/dettes': { labelKey: 'nav.debts', icon: CreditCard },
  '/patrimoine': { labelKey: 'nav.wealth', icon: Landmark },
  '/financement': { labelKey: 'nav.funding', icon: Banknote },
  '/portefeuille': { labelKey: 'nav.paper', icon: TrendingUp },
  '/outils/atelier': { labelKey: 'nav.workshop', icon: FlaskConical },
  '/outils/simulateurs/premier-salaire': { labelKey: 'nav.firstSalary', icon: Banknote },
  '/outils/simulateurs/budget-etudiant': { labelKey: 'nav.studentBudget', icon: GraduationCap },
  '/espaces': { labelKey: 'nav.spaces', icon: Users },
  '/outils/comparateur': { labelKey: 'nav.comparator', icon: Landmark },
  '/outils/comparateur/comptes': { labelKey: 'nav.comparatorAccounts', icon: PiggyBank },
  '/outils/explorateur': { labelKey: 'nav.explorer', icon: Compass },
  '/outils/offres-emploi': { labelKey: 'nav.jobOffers', icon: Briefcase },
  '/apprendre': { labelKey: 'nav.apprendre', icon: BookOpen },
  '/passeport': { labelKey: 'nav.passport', icon: GraduationCap },
  '/entreprise': { labelKey: 'nav.businessSpace', icon: Building2 },
};

// The account's own pages. They are not part of any journey — an account is not
// a public — so they are listed here and never filtered. Every entry carries
// its own icon: the collapsed, icon-only rail has nothing else to show.
export const ACCOUNT_LINKS = [
  { labelKey: 'account.nav.profile', to: '/compte/profil', icon: UserRound },
  { labelKey: 'account.nav.dashboard', to: '/compte/tableau-de-bord', icon: LayoutDashboard },
  { labelKey: 'account.nav.formations', to: '/compte/formations', icon: GraduationCap },
  { labelKey: 'account.nav.certificates', to: '/compte/certificats', icon: Award },
  { labelKey: 'account.nav.type', to: '/compte/type', icon: Building },
  { labelKey: 'account.nav.premium', to: '/compte/premium', icon: Star },
  { labelKey: 'account.nav.payments', to: '/compte/paiements', icon: CreditCard },
  { labelKey: 'account.nav.fincludia', to: '/compte/fincludia', icon: Wallet },
  { labelKey: 'account.nav.onboarding', to: '/compte/premiers-pas', icon: Compass },
  { labelKey: 'account.nav.categories', to: '/compte/categories', icon: Tag },
  { labelKey: 'nav.trust', to: '/confiance', icon: ShieldCheck },
];

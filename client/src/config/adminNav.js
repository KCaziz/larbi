import { Award, BookOpen, Coins, FileImage, GraduationCap, Handshake, Landmark, LayoutDashboard, Mail, MessageCircleQuestion, MessagesSquare, Newspaper, Receipt, Settings, Users, Target } from 'lucide-react';

// Entries of the CMS side menu. The CMS base is shared: each module (articles,
// newsletter, users, media, certificates, settings...) simply adds its own entry
// here — this is the whole "extensible admin panel" registry (P3-16).
// Recette R11-09: grouped in sections, like the application's own menu.
export const ADMIN_NAV_SECTIONS = ['overview', 'content', 'assistant', 'finance', 'platform'];

export const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, labelKey: 'admin.nav.dashboard', end: true, section: 'overview' },
  { to: '/admin/formations', icon: GraduationCap, labelKey: 'admin.nav.formations', section: 'content' },
  { to: '/admin/articles', icon: Newspaper, labelKey: 'admin.nav.articles', section: 'content' },
  { to: '/admin/apprendre', icon: BookOpen, labelKey: 'admin.nav.glossary', section: 'content' },
  { to: '/admin/missions-fincludia', icon: Target, labelKey: 'admin.nav.missions', section: 'content' },
  { to: '/admin/media', icon: FileImage, labelKey: 'admin.nav.media', section: 'content' },
  { to: '/admin/certificates', icon: Award, labelKey: 'admin.nav.certificates', section: 'content' },
  { to: '/admin/newsletter', icon: Mail, labelKey: 'admin.nav.newsletter', section: 'content' },
  { to: '/admin/assistant', icon: MessageCircleQuestion, labelKey: 'admin.nav.assistantShort', section: 'assistant' },
  { to: '/admin/paiements', icon: Receipt, labelKey: 'admin.nav.payments', section: 'finance' },
  { to: '/admin/comparateur', icon: Landmark, labelKey: 'admin.nav.comparator', section: 'finance' },
  // P10-05: the official exchange rates.
  { to: '/admin/cours-devises', icon: Coins, labelKey: 'admin.nav.rates', section: 'finance' },
  // P13-05, lot G: the partners' offers and requests; the forum's moderation.
  { to: '/admin/partenaires', icon: Handshake, labelKey: 'admin.nav.partners', section: 'finance' },
  { to: '/admin/forum', icon: MessagesSquare, labelKey: 'admin.nav.forum', section: 'content' },
  { to: '/admin/users', icon: Users, labelKey: 'admin.nav.users', section: 'platform' },
  { to: '/admin/settings', icon: Settings, labelKey: 'admin.nav.settings', section: 'platform' },
];

import { Award, FileImage, GraduationCap, LayoutDashboard, Mail, Newspaper, Settings, Users } from 'lucide-react';

// Entries of the CMS side menu. The CMS base is shared: each module (articles,
// newsletter, users, media, certificates, settings...) simply adds its own entry
// here — this is the whole "extensible admin panel" registry (P3-16).
export const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, labelKey: 'admin.nav.dashboard', end: true },
  { to: '/admin/formations', icon: GraduationCap, labelKey: 'admin.nav.formations' },
  { to: '/admin/articles', icon: Newspaper, labelKey: 'admin.nav.articles' },
  { to: '/admin/newsletter', icon: Mail, labelKey: 'admin.nav.newsletter' },
  { to: '/admin/media', icon: FileImage, labelKey: 'admin.nav.media' },
  { to: '/admin/certificates', icon: Award, labelKey: 'admin.nav.certificates' },
  { to: '/admin/users', icon: Users, labelKey: 'admin.nav.users' },
  { to: '/admin/settings', icon: Settings, labelKey: 'admin.nav.settings' },
];

import { GraduationCap, Mail, Newspaper } from 'lucide-react';

// Entries of the CMS side menu. The CMS base is shared: the articles module
// (P3-02) simply adds its own entry here.
export const adminNavItems = [
  { to: '/admin/formations', icon: GraduationCap, labelKey: 'admin.nav.formations' },
  { to: '/admin/articles', icon: Newspaper, labelKey: 'admin.nav.articles' },
  { to: '/admin/newsletter', icon: Mail, labelKey: 'admin.nav.newsletter' },
];

// Primary site navigation. Route targets are wired up in router/index.jsx.
// Labels are i18next keys, not literal text — Header/Navigation/Footer
// resolve them with t(labelKey) so the whole nav is translated.
export const mainNavLinks = [
  { labelKey: 'nav.home', to: '/' },
  { labelKey: 'nav.formations', to: '/formations' },
  { labelKey: 'nav.tools', to: '/outils' },
  { labelKey: 'nav.blog', to: '/blog' },
  { labelKey: 'nav.services', to: '/services' },
  { labelKey: 'nav.about', to: '/a-propos' },
  { labelKey: 'nav.contact', to: '/contact' },
];

export const footerColumns = [
  {
    titleKey: 'footer.columns.platform',
    links: [
      { labelKey: 'nav.formations', to: '/formations' },
      { labelKey: 'nav.tools', to: '/outils' },
      { labelKey: 'nav.blog', to: '/blog' },
    ],
  },
  {
    titleKey: 'footer.columns.company',
    links: [
      { labelKey: 'nav.about', to: '/a-propos' },
      { labelKey: 'nav.services', to: '/services' },
      { labelKey: 'nav.contact', to: '/contact' },
    ],
  },
  {
    titleKey: 'footer.columns.info',
    links: [
      { labelKey: 'nav.faq', to: '/faq' },
      { labelKey: 'nav.legalNotice', to: '/mentions-legales' },
      { labelKey: 'nav.privacy', to: '/confidentialite' },
    ],
  },
];

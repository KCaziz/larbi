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

export const authNavLinks = [
  { labelKey: 'nav.login', to: '/connexion' },
  { labelKey: 'nav.register', to: '/inscription' },
];

export const footerLinks = [
  { labelKey: 'nav.faq', to: '/faq' },
  { labelKey: 'nav.legalNotice', to: '/mentions-legales' },
  { labelKey: 'nav.privacy', to: '/confidentialite' },
];

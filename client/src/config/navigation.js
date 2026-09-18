// Primary site navigation. Route targets are wired up in router/index.jsx.
// P1-03 (pages publiques) content is live; P1-04 (pages utilisateurs) pages
// still resolve to a placeholder until that task is done.
export const mainNavLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Formations', to: '/formations' },
  { label: 'Outils', to: '/outils' },
  { label: 'Blog', to: '/blog' },
  { label: 'Services', to: '/services' },
  { label: 'À propos', to: '/a-propos' },
  { label: 'Contact', to: '/contact' },
];

export const authNavLinks = [
  { label: 'Connexion', to: '/connexion' },
  { label: 'Inscription', to: '/inscription' },
];

export const footerLinks = [
  { label: 'FAQ', to: '/faq' },
  { label: 'Mentions légales', to: '/mentions-legales' },
  { label: 'Politique de confidentialité', to: '/confidentialite' },
];

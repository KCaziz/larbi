// Primary site navigation. Route targets are wired up in router/index.jsx;
// most pages are placeholders until P1-03 (pages publiques) / P1-04 (pages
// utilisateurs) implement their real content.
export const mainNavLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Formations', to: '/formations' },
  { label: 'Outils', to: '/outils' },
  { label: 'Blog', to: '/blog' },
  { label: 'À propos', to: '/a-propos' },
  { label: 'Contact', to: '/contact' },
];

export const authNavLinks = [
  { label: 'Connexion', to: '/connexion' },
  { label: 'Inscription', to: '/inscription' },
];

export const footerLinks = [
  { label: 'Mentions légales', to: '/mentions-legales' },
  { label: 'Politique de confidentialité', to: '/confidentialite' },
];

// Search engines (P12-06): which addresses of the public site exist, in which
// languages, and which ones must never be indexed.
//
// Languages in the address: French is the default and keeps the historical
// addresses (/formations); English and Arabic live under /en/… and /ar/…, so a
// search engine sees each language as its own page. Tamazight has no real
// translation yet (every text falls back to French): it is not offered to
// search engines until its texts exist and have been reviewed.
export const SEO_LANGUAGES = ['fr', 'en', 'ar'];
export const DEFAULT_LANGUAGE = 'fr';
export const PREFIXED_LANGUAGES = ['en', 'ar'];
export const RTL_LANGUAGES = ['ar'];

// Open Graph wants a territory with the language.
export const OG_LOCALES = { fr: 'fr_DZ', en: 'en_US', ar: 'ar_DZ' };

// Every static public page, with the key of its texts (`seo.pages.<id>` in the
// locale files). Order is the order of the sitemap.
export const STATIC_PAGES = [
  { path: '/', id: 'home', priority: '1.0', changefreq: 'weekly' },
  { path: '/fonctionnalites', id: 'features', priority: '0.9', changefreq: 'monthly' },
  { path: '/formations', id: 'formations', priority: '0.9', changefreq: 'weekly' },
  { path: '/outils', id: 'tools', priority: '0.9', changefreq: 'monthly' },
  { path: '/outils/comparateur', id: 'comparator', priority: '0.9', changefreq: 'weekly' },
  { path: '/outils/comparateur/adequation', id: 'usageFit', priority: '0.6', changefreq: 'monthly' },
  { path: '/outils/simulateurs', id: 'simulators', priority: '0.9', changefreq: 'monthly' },
  { path: '/outils/offres-emploi', id: 'jobOffers', priority: '0.6', changefreq: 'monthly' },
  { path: '/outils/atelier', id: 'workshop', priority: '0.6', changefreq: 'monthly' },
  { path: '/outils/postal', id: 'postal', priority: '0.6', changefreq: 'monthly' },
  { path: '/apprendre', id: 'apprendre', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog', id: 'blog', priority: '0.8', changefreq: 'daily' },
  { path: '/services', id: 'services', priority: '0.7', changefreq: 'monthly' },
  { path: '/a-propos', id: 'about', priority: '0.7', changefreq: 'monthly' },
  { path: '/faq', id: 'faq', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', id: 'contact', priority: '0.6', changefreq: 'yearly' },
  { path: '/inscription', id: 'register', priority: '0.6', changefreq: 'yearly' },
  { path: '/verification', id: 'verify', priority: '0.4', changefreq: 'yearly' },
  { path: '/mentions-legales', id: 'legal', priority: '0.2', changefreq: 'yearly' },
  { path: '/confidentialite', id: 'privacy', priority: '0.2', changefreq: 'yearly' },
];

// Real pages a search engine has nothing to do with: served normally, but
// marked "noindex" (a sign-in form, a one-time link, a payment return).
export const NOINDEX_PAGES = [
  { path: '/connexion', id: 'login' },
  { path: '/mot-de-passe-oublie', id: 'forgot' },
  { path: '/newsletter/confirmer', id: 'newsletter' },
  { path: '/newsletter/desinscription', id: 'newsletter' },
  { path: '/paiement/retour', id: 'payment' },
];

// Private windows (application, shared spaces, administration): served, never
// indexed, and closed to crawlers in robots.txt.
export const PRIVATE_PREFIXES = ['/app', '/partage', '/espaces', '/admin'];

// Former addresses of the connected space, redirected by the website to /app
// (client/src/config/appNavigation.js, LEGACY_REDIRECTS — a consistency test
// keeps both lists equal). They are private pages: noindex, never a 404.
export const LEGACY_PATHS = [
  'aujourdhui', 'mon-argent', 'budget*', 'calendrier', 'objectifs', 'reserve', 'dettes',
  'patrimoine', 'financement', 'portefeuille', 'espaces', 'entreprise', 'notifications',
  'confiance', 'passeport', 'catalogue*', 'outils/credit', 'outils/facture', 'outils/explorateur',
  'compte', 'compte/profil', 'compte/tableau-de-bord', 'compte/formations', 'compte/certificats',
  'compte/type', 'compte/premium', 'compte/paiements', 'compte/fincludia', 'compte/categories',
  'compte/premiers-pas',
];

export const ROBOTS_DISALLOW = ['/app', '/partage', '/espaces', '/admin', '/connexion', '/mot-de-passe-oublie', '/newsletter/', '/paiement/'];

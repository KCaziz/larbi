import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { ARTICLE_STATUS } from '../constants/blog.js';
import { COMPARATOR_THEMES, EXPLICIT_SEGMENTS } from '../constants/comparator.js';
import { SIMULATORS } from '../constants/simulators.js';
import { localizeArticle } from '../services/article.service.js';
import { DEFAULT_LANGUAGE, ROBOTS_DISALLOW, SEO_LANGUAGES, STATIC_PAGES } from './config.js';
import { absoluteUrl, localizedPath } from './pages.js';
import { escapeHtml } from './html.js';

// sitemap.xml (P12-06): every indexable address, each with its language
// versions, built from the database at the moment it is asked for — a new
// article is in it as soon as it is published.

const day = (date) => (date ? new Date(date).toISOString().slice(0, 10) : null);

// One entry per language version, each listing all the versions (that is how
// search engines want hreflang in a sitemap).
function entries(base, languages, { lastmod = null, changefreq = 'monthly', priority = '0.5' } = {}) {
  const alternates =
    languages.length > 1
      ? [
          ...languages.map((lang) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${escapeHtml(absoluteUrl(localizedPath(lang, base)))}"/>`),
          `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(absoluteUrl(localizedPath(languages.includes(DEFAULT_LANGUAGE) ? DEFAULT_LANGUAGE : languages[0], base)))}"/>`,
        ].join('')
      : '';
  return languages.map(
    (lang) =>
      `<url><loc>${escapeHtml(absoluteUrl(localizedPath(lang, base)))}</loc>${alternates}${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
  );
}

export async function buildSitemap() {
  const [articles, terms, guides] = await Promise.all([
    prisma.article.findMany({ where: { status: ARTICLE_STATUS.PUBLISHED }, include: { translations: true }, orderBy: { publishedAt: 'desc' } }),
    prisma.glossaryTerm.findMany({ where: { status: 'published' }, select: { slug: true, language: true, updatedAt: true } }),
    prisma.miniGuide.findMany({ where: { status: 'published' }, select: { slug: true, language: true, updatedAt: true } }),
  ]);
  const own = (lang) => (SEO_LANGUAGES.includes(lang) ? [lang] : []);
  const urls = [
    ...STATIC_PAGES.flatMap((p) => entries(p.path, SEO_LANGUAGES, p)),
    ...COMPARATOR_THEMES.flatMap((t) => entries(`/outils/comparateur/${t.key}`, SEO_LANGUAGES, { priority: '0.8', changefreq: 'weekly' })),
    ...EXPLICIT_SEGMENTS.flatMap((s) => entries(`/outils/comparateur/segments/${s}`, SEO_LANGUAGES, { priority: '0.6' })),
    ...SIMULATORS.flatMap((s) => entries(`/outils/simulateurs/${s.key}`, SEO_LANGUAGES, { priority: '0.8' })),
    ...articles.flatMap((a) =>
      entries(
        `/blog/${a.slug}`,
        localizeArticle(a, a.language).availableLanguages.filter((l) => SEO_LANGUAGES.includes(l)),
        { lastmod: day(a.updatedAt), changefreq: 'monthly', priority: '0.7' },
      ),
    ),
    ...terms.flatMap((t) => entries(`/apprendre/termes/${t.slug}`, own(t.language), { lastmod: day(t.updatedAt), priority: '0.6' })),
    ...guides.flatMap((g) => entries(`/apprendre/guides/${g.slug}`, own(g.language), { lastmod: day(g.updatedAt), priority: '0.7' })),
  ];
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
  ].join('\n');
}

// The API is NOT closed to crawlers: the website asks it for the content of a
// page, and a search engine that runs the website must be allowed to do the
// same, or it would only see empty pages. Its answers are marked noindex instead.
export function buildRobots() {
  return [
    'User-agent: *',
    ...ROBOTS_DISALLOW.map((path) => `Disallow: ${path}`),
    'Allow: /',
    '',
    `Sitemap: ${env.publicUrl}/sitemap.xml`,
    '',
  ].join('\n');
}

import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { ARTICLE_STATUS } from '../constants/blog.js';
import { FORMATION_STATUS } from '../constants/elearning.js';
import { COMPARATOR_THEMES, EXPLICIT_SEGMENTS, themeByKey } from '../constants/comparator.js';
import { SIMULATORS, simulatorByKey } from '../constants/simulators.js';
import { localizeArticle } from '../services/article.service.js';
import { isMaintenanceMode } from '../services/settings.service.js';
import {
  DEFAULT_LANGUAGE,
  LEGACY_PATHS,
  NOINDEX_PAGES,
  PREFIXED_LANGUAGES,
  PRIVATE_PREFIXES,
  SEO_LANGUAGES,
  STATIC_PAGES,
} from './config.js';
import { text } from './texts.js';

// What the server knows about one address of the public site before the
// website's JavaScript runs (P12-06): does it exist, in which language, its
// title, description, language versions and structured data, and a readable
// version of its content. The website then takes over in the browser; this is
// what search engines and link previews (WhatsApp, Facebook, LinkedIn) read.

const SUFFIX = ' · FINCLUDIA';
const MAX_BODY_CHARS = 6000;

export const localePrefix = (lang) => (PREFIXED_LANGUAGES.includes(lang) ? `/${lang}` : '');
export const localizedPath = (lang, base) => `${localePrefix(lang)}${base === '/' && localePrefix(lang) ? '' : base}`;
export const absoluteUrl = (pathname) => `${env.publicUrl}${pathname}`;

// /ar/blog/x → { lang: 'ar', base: '/blog/x' }. /fr/… is not an address of the
// site: French has no prefix (it is redirected, see resolvePage).
export function splitLanguage(pathname) {
  const [, first, ...rest] = pathname.split('/');
  if (PREFIXED_LANGUAGES.includes(first)) return { lang: first, base: `/${rest.join('/')}`.replace(/\/$/, '') || '/' };
  return { lang: DEFAULT_LANGUAGE, base: pathname };
}

const startsWithSegment = (pathname, prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`);

function isLegacy(base) {
  const trimmed = base.replace(/^\//, '');
  return LEGACY_PATHS.some((entry) => (entry.endsWith('*') ? startsWithSegment(trimmed, entry.slice(0, -1)) : trimmed === entry));
}

const plain = (html = '') =>
  String(html)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|h[1-6]|li|div|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();

// A description is read in a result page: one or two sentences, never cut in
// the middle of a word.
export function summary(value, max = 160) {
  const flat = plain(value).replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max * 0.6))}…`;
}

const paragraphs = (value) =>
  plain(value)
    .slice(0, MAX_BODY_CHARS)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const organization = (lang) => ({
  '@type': 'Organization',
  '@id': `${env.publicUrl}/#organization`,
  name: 'FINCLUDIA',
  url: absoluteUrl(localizedPath(lang, '/')),
  logo: absoluteUrl('/apple-touch-icon.png'),
  slogan: text(lang, 'home.hero.signature'),
});

function breadcrumb(lang, trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      item: absoluteUrl(localizedPath(lang, step.path)),
    })),
  };
}

const home = (lang) => ({ name: text(lang, 'nav.home'), path: '/' });

// Every language version of an address that exists in all languages.
const allLanguages = (base) => SEO_LANGUAGES.map((lang) => ({ lang, path: localizedPath(lang, base) }));

function page(lang, base, fields) {
  const versions = fields.versions ?? allLanguages(base);
  const own = versions.find((version) => version.lang === lang);
  return {
    status: 200,
    lang,
    base,
    noindex: false,
    ogType: 'website',
    image: absoluteUrl('/og-image.png'),
    // An address whose language version does not exist (an article without its
    // Arabic translation shows the original) points to the version that does.
    canonical: absoluteUrl(own ? own.path : versions[0].path),
    versions,
    jsonLd: [],
    blocks: [],
    links: [],
    ...fields,
    title: fields.fullTitle ?? `${fields.title}${SUFFIX}`,
  };
}

// --- Static pages ----------------------------------------------------------

async function staticPage(lang, base, entry) {
  const title = text(lang, `seo.pages.${entry.id}.title`);
  const description = text(lang, `seo.pages.${entry.id}.description`);
  const result = page(lang, base, {
    title,
    fullTitle: entry.id === 'home' ? title : undefined,
    description,
    heading: text(lang, `seo.pages.${entry.id}.heading`) || title,
  });

  if (entry.id === 'home') {
    result.jsonLd.push(organization(lang), {
      '@type': 'WebSite',
      '@id': `${env.publicUrl}/#website`,
      name: 'FINCLUDIA',
      url: absoluteUrl(localizedPath(lang, '/')),
      inLanguage: lang,
      publisher: { '@id': `${env.publicUrl}/#organization` },
    });
    result.blocks.push(text(lang, 'home.hero.body'));
    result.links = STATIC_PAGES.filter((p) => p.path !== '/').map((p) => ({ path: p.path, label: text(lang, `seo.pages.${p.id}.title`) }));
  }

  if (entry.id === 'features') {
    result.jsonLd.push({
      '@type': 'SoftwareApplication',
      name: 'FINCLUDIA',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web, Android, iOS',
      inLanguage: SEO_LANGUAGES,
      description,
      url: absoluteUrl(localizedPath(lang, base)),
      publisher: organization(lang),
    });
  }

  if (entry.id === 'faq') {
    const items = text(lang, 'faq.items');
    if (Array.isArray(items) && items.length) {
      result.jsonLd.push({
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
      });
      result.sections = items.map((item) => ({ heading: item.question, blocks: [item.answer] }));
    }
  }

  if (entry.id === 'comparator') {
    result.links = [
      ...COMPARATOR_THEMES.map((theme) => ({ path: `/outils/comparateur/${theme.key}`, label: text(lang, `comparator.themes.${theme.key}`) })),
      ...EXPLICIT_SEGMENTS.map((segment) => ({ path: `/outils/comparateur/segments/${segment}`, label: text(lang, 'seo.templates.comparatorSegment', { segment: text(lang, `comparator.segments.${segment}`) }) })),
    ];
  }

  if (entry.id === 'simulators') {
    result.links = SIMULATORS.map((simulator) => ({ path: `/outils/simulateurs/${simulator.key}`, label: text(lang, `simulators.list.${simulator.key}.title`) }));
  }

  if (entry.id === 'blog') {
    const articles = await prisma.article.findMany({
      where: { status: ARTICLE_STATUS.PUBLISHED },
      orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
      take: 30,
      include: { translations: true },
    });
    result.links = articles.map((article) => ({ path: `/blog/${article.slug}`, label: localizeArticle(article, lang).title }));
  }

  if (entry.id === 'apprendre') {
    const [terms, guides] = await Promise.all([
      prisma.glossaryTerm.findMany({ where: { status: 'published', language: lang }, orderBy: { term: 'asc' }, select: { slug: true, term: true } }),
      prisma.miniGuide.findMany({ where: { status: 'published', language: lang }, orderBy: { position: 'asc' }, select: { slug: true, title: true } }),
    ]);
    result.links = [
      ...guides.map((guide) => ({ path: `/apprendre/guides/${guide.slug}`, label: guide.title })),
      ...terms.map((term) => ({ path: `/apprendre/termes/${term.slug}`, label: term.term })),
    ];
  }

  if (entry.id === 'formations') {
    const formations = await prisma.formation.findMany({
      where: { status: FORMATION_STATUS.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      select: { title: true, description: true },
    });
    if (formations.length) {
      result.jsonLd.push({
        '@type': 'ItemList',
        itemListElement: formations.map((formation, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: { '@type': 'Course', name: formation.title, description: summary(formation.description, 300), provider: organization(lang) },
        })),
      });
      result.sections = formations.map((formation) => ({ heading: formation.title, blocks: [summary(formation.description, 300)] }));
    }
  }

  if (base !== '/') result.jsonLd.push(breadcrumb(lang, [home(lang), { name: title, path: base }]));
  return result;
}

// --- Content pages ---------------------------------------------------------

async function articlePage(lang, base, slug) {
  const article = await prisma.article.findFirst({
    where: { slug, status: ARTICLE_STATUS.PUBLISHED },
    include: { translations: true, author: { select: { name: true } } },
  });
  if (!article) return null;
  const localized = localizeArticle(article, lang);
  const versions = localized.availableLanguages.filter((l) => SEO_LANGUAGES.includes(l)).map((l) => ({ lang: l, path: localizedPath(l, base) }));
  if (!versions.length) versions.push({ lang: article.language, path: localizedPath(article.language, base) });
  const title = localized.metaTitle || localized.title;
  const description = localized.metaDescription || summary(localized.excerpt || localized.bodyText);
  const url = absoluteUrl(localizedPath(lang, base));
  const image = article.coverImageId ? absoluteUrl(`/api/blog/articles/${article.slug}/cover`) : absoluteUrl('/og-image.png');
  const result = page(lang, base, {
    title,
    description,
    heading: localized.title,
    ogType: 'article',
    image,
    versions,
    published: article.publishedAt?.toISOString(),
    modified: article.updatedAt.toISOString(),
    blocks: [localized.excerpt, ...paragraphs(localized.body || localized.bodyText)].filter(Boolean),
  });
  result.jsonLd.push(
    {
      '@type': 'BlogPosting',
      headline: localized.title.slice(0, 110),
      description,
      inLanguage: localized.language,
      datePublished: result.published,
      dateModified: result.modified,
      image,
      mainEntityOfPage: url,
      author: article.author?.name ? { '@type': 'Person', name: article.author.name } : { '@id': `${env.publicUrl}/#organization` },
      publisher: organization(lang),
    },
    breadcrumb(lang, [home(lang), { name: text(lang, 'seo.pages.blog.title'), path: '/blog' }, { name: localized.title, path: base }]),
  );
  return result;
}

// A glossary term or a guide is written in ONE language: it has one address,
// the one of its language.
async function termPage(lang, base, slug) {
  const term = await prisma.glossaryTerm.findFirst({ where: { slug, status: 'published' } });
  if (!term) return null;
  const termLang = SEO_LANGUAGES.includes(term.language) ? term.language : DEFAULT_LANGUAGE;
  const title = text(termLang, 'seo.templates.term', { term: term.term });
  const result = page(lang, base, {
    title,
    description: summary(term.definition),
    heading: term.term,
    versions: [{ lang: termLang, path: localizedPath(termLang, base) }],
    modified: term.updatedAt.toISOString(),
    blocks: [...paragraphs(term.definition), ...(term.example ? paragraphs(term.example) : [])],
  });
  result.jsonLd.push(
    {
      '@type': 'DefinedTerm',
      name: term.term,
      description: summary(term.definition, 500),
      inLanguage: termLang,
      url: result.canonical,
      inDefinedTermSet: { '@type': 'DefinedTermSet', name: text(termLang, 'seo.pages.apprendre.title'), url: absoluteUrl(localizedPath(termLang, '/apprendre')) },
    },
    breadcrumb(termLang, [home(termLang), { name: text(termLang, 'seo.pages.apprendre.title'), path: '/apprendre' }, { name: term.term, path: base }]),
  );
  return result;
}

async function guidePage(lang, base, slug) {
  const guide = await prisma.miniGuide.findFirst({ where: { slug, status: 'published' } });
  if (!guide) return null;
  const guideLang = SEO_LANGUAGES.includes(guide.language) ? guide.language : DEFAULT_LANGUAGE;
  const result = page(lang, base, {
    title: guide.title,
    description: summary(guide.body),
    heading: guide.title,
    ogType: 'article',
    versions: [{ lang: guideLang, path: localizedPath(guideLang, base) }],
    modified: guide.updatedAt.toISOString(),
    blocks: paragraphs(guide.body),
  });
  result.jsonLd.push(
    {
      '@type': 'Article',
      headline: guide.title.slice(0, 110),
      description: result.description,
      inLanguage: guideLang,
      dateModified: result.modified,
      mainEntityOfPage: result.canonical,
      author: { '@id': `${env.publicUrl}/#organization` },
      publisher: organization(guideLang),
    },
    breadcrumb(guideLang, [home(guideLang), { name: text(guideLang, 'seo.pages.apprendre.title'), path: '/apprendre' }, { name: guide.title, path: base }]),
  );
  return result;
}

function themePage(lang, base, themeKey) {
  if (!themeByKey(themeKey)) return null;
  const theme = text(lang, `comparator.themes.${themeKey}`);
  const result = page(lang, base, {
    title: text(lang, 'seo.templates.comparatorTheme', { theme }),
    description: text(lang, 'seo.templates.comparatorThemeDescription', { theme }),
    heading: theme,
    links: COMPARATOR_THEMES.filter((t) => t.key !== themeKey).map((t) => ({ path: `/outils/comparateur/${t.key}`, label: text(lang, `comparator.themes.${t.key}`) })),
  });
  result.jsonLd.push(breadcrumb(lang, [home(lang), { name: text(lang, 'seo.pages.comparator.title'), path: '/outils/comparateur' }, { name: theme, path: base }]));
  return result;
}

function segmentPage(lang, base, segment) {
  if (!EXPLICIT_SEGMENTS.includes(segment)) return null;
  const label = text(lang, `comparator.segments.${segment}`);
  const result = page(lang, base, {
    title: text(lang, 'seo.templates.comparatorSegment', { segment: label }),
    description: text(lang, 'seo.templates.comparatorSegmentDescription', { segment: label }),
    heading: label,
  });
  result.jsonLd.push(breadcrumb(lang, [home(lang), { name: text(lang, 'seo.pages.comparator.title'), path: '/outils/comparateur' }, { name: label, path: base }]));
  return result;
}

function simulatorPage(lang, base, key) {
  if (!simulatorByKey(key)) return null;
  const name = text(lang, `simulators.list.${key}.title`);
  const body = text(lang, `simulators.list.${key}.body`);
  const result = page(lang, base, {
    title: text(lang, 'seo.templates.simulator', { name }),
    description: summary(`${body} ${text(lang, 'seo.templates.simulatorDescription')}`),
    heading: name,
    blocks: [body],
    links: SIMULATORS.filter((s) => s.key !== key).map((s) => ({ path: `/outils/simulateurs/${s.key}`, label: text(lang, `simulators.list.${s.key}.title`) })),
  });
  result.jsonLd.push(breadcrumb(lang, [home(lang), { name: text(lang, 'seo.pages.simulators.title'), path: '/outils/simulateurs' }, { name, path: base }]));
  return result;
}

const DYNAMIC = [
  { pattern: /^\/blog\/([^/]+)$/, build: articlePage },
  { pattern: /^\/apprendre\/termes\/([^/]+)$/, build: termPage },
  { pattern: /^\/apprendre\/guides\/([^/]+)$/, build: guidePage },
  { pattern: /^\/outils\/comparateur\/segments\/([^/]+)$/, build: segmentPage },
  { pattern: /^\/outils\/comparateur\/([^/]+)$/, build: themePage },
  { pattern: /^\/outils\/simulateurs\/([^/]+)$/, build: simulatorPage },
];

function plainPage(lang, base, id, extra = {}) {
  const title = text(lang, `seo.pages.${id}.title`);
  return page(lang, base, { title, description: text(lang, `seo.pages.${id}.description`), heading: title, noindex: true, ...extra });
}

const notFound = (lang, base) => ({ ...plainPage(lang, base, 'notFound'), status: 404 });

// Address of a page → what to answer. `{ redirect }` for an address that has a
// better spelling, otherwise a page description with its HTTP status.
export async function resolvePage(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return notFound(DEFAULT_LANGUAGE, pathname);
  }
  if (decoded.length > 1 && decoded.endsWith('/')) return { redirect: decoded.replace(/\/+$/, '') || '/' };
  if (decoded === '/fr' || decoded.startsWith('/fr/')) return { redirect: decoded.slice(3) || '/' };

  const { lang, base } = splitLanguage(decoded);
  const prefixed = lang !== DEFAULT_LANGUAGE;

  // The private windows exist in one place only, without a language.
  if (PRIVATE_PREFIXES.some((prefix) => startsWithSegment(base, prefix)) || isLegacy(base)) {
    if (prefixed) return notFound(lang, base);
    return { ...plainPage(lang, base, 'private'), private: true };
  }

  const noindex = NOINDEX_PAGES.find((entry) => entry.path === base);
  if (noindex) return plainPage(lang, base, noindex.id);
  if (/^\/verification\/[^/]+$/.test(base)) return plainPage(lang, base, 'verify');

  const entry = STATIC_PAGES.find((p) => p.path === base);
  let result = entry ? await staticPage(lang, base, entry) : null;
  if (!result) {
    for (const route of DYNAMIC) {
      const match = base.match(route.pattern);
      if (match) {
        result = await route.build(lang, base, match[1]);
        break;
      }
    }
  }
  if (!result) return notFound(lang, base);

  // Closed for maintenance: search engines are told it is temporary, so they
  // keep the pages they know instead of indexing the maintenance notice.
  if (await isMaintenanceMode()) return { ...result, status: 503 };
  return result;
}

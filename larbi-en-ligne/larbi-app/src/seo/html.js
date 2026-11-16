import { readFileSync, statSync } from 'node:fs';
import { RTL_LANGUAGES, OG_LOCALES, DEFAULT_LANGUAGE } from './config.js';
import { absoluteUrl, localizedPath } from './pages.js';
import { text } from './texts.js';

// Writes what resolvePage() found into the website's index.html: language and
// direction of the document, title, description, language versions, link
// preview, structured data, and a readable version of the content inside
// #root — replaced by the website as soon as its JavaScript starts.

export const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// JSON inside <script>: "</script>" or "<!--" in a text must not end the block.
const BACKSLASH = String.fromCharCode(92);
const unicodeEscape = (c) => `${BACKSLASH}u${c.charCodeAt(0).toString(16).padStart(4, '0')}`;
const UNSAFE_IN_SCRIPT = ['<', String.fromCharCode(0x2028), String.fromCharCode(0x2029)];
const safeJson = (value) => UNSAFE_IN_SCRIPT.reduce((json, c) => json.split(c).join(unicodeEscape(c)), JSON.stringify(value));

let template = null;
let templatePath = null;
let templateMtime = 0;

function readTemplate(file) {
  const mtime = statSync(file).mtimeMs;
  if (template === null || templatePath !== file || mtime !== templateMtime) {
    template = readFileSync(file, 'utf8');
    templatePath = file;
    templateMtime = mtime;
  }
  return template;
}

function headTags(page) {
  const tags = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
  ];
  if (page.noindex) {
    tags.push('<meta name="robots" content="noindex, nofollow" />');
  } else {
    tags.push('<meta name="robots" content="index, follow, max-image-preview:large" />');
    tags.push(`<link rel="canonical" href="${escapeHtml(page.canonical)}" />`);
    if (page.versions.length > 1) {
      for (const version of page.versions) tags.push(`<link rel="alternate" hreflang="${version.lang}" href="${escapeHtml(absoluteUrl(version.path))}" />`);
      const fallback = page.versions.find((v) => v.lang === DEFAULT_LANGUAGE) ?? page.versions[0];
      tags.push(`<link rel="alternate" hreflang="x-default" href="${escapeHtml(absoluteUrl(fallback.path))}" />`);
    }
  }
  tags.push(
    '<meta property="og:site_name" content="FINCLUDIA" />',
    `<meta property="og:type" content="${page.ogType}" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(page.canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(page.image)}" />`,
    `<meta property="og:locale" content="${OG_LOCALES[page.lang] ?? OG_LOCALES.fr}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(page.image)}" />`,
  );
  for (const version of page.versions) {
    if (version.lang !== page.lang) tags.push(`<meta property="og:locale:alternate" content="${OG_LOCALES[version.lang]}" />`);
  }
  if (page.published) tags.push(`<meta property="article:published_time" content="${page.published}" />`);
  if (page.modified) tags.push(`<meta property="article:modified_time" content="${page.modified}" />`);
  if (page.jsonLd.length) {
    tags.push(`<script type="application/ld+json">${safeJson({ '@context': 'https://schema.org', '@graph': page.jsonLd })}</script>`);
  }
  return tags.join('\n    ');
}

function link(lang, path, label) {
  return `<a href="${escapeHtml(localizedPath(lang, path))}">${escapeHtml(label)}</a>`;
}

// The website's own menu (client/src/config/navigation.js), with its short labels.
const NAV = [
  { path: '/formations', label: 'nav.formations' },
  { path: '/outils', label: 'nav.tools' },
  { path: '/blog', label: 'nav.blog' },
  { path: '/apprendre', label: 'nav.apprendre' },
  { path: '/services', label: 'nav.services' },
  { path: '/a-propos', label: 'nav.about' },
  { path: '/contact', label: 'nav.contact' },
];

function body(page) {
  const { lang } = page;
  const nav = NAV.map((entry) => `<li>${link(lang, entry.path, text(lang, entry.label))}</li>`).join('');
  const parts = [
    '<div class="seo-shell">',
    `<header class="seo-shell-header"><a class="seo-shell-brand" href="${escapeHtml(localizedPath(lang, '/'))}">FINCLUDIA</a><nav><ul>${nav}</ul></nav></header>`,
    '<main class="seo-shell-main">',
    `<h1>${escapeHtml(page.heading ?? page.title)}</h1>`,
  ];
  if (page.description && !page.blocks.length) parts.push(`<p>${escapeHtml(page.description)}</p>`);
  for (const block of page.blocks) parts.push(`<p>${escapeHtml(block)}</p>`);
  for (const section of page.sections ?? []) {
    parts.push(`<h2>${escapeHtml(section.heading)}</h2>`);
    for (const block of section.blocks) parts.push(`<p>${escapeHtml(block)}</p>`);
  }
  if (page.links.length) parts.push(`<ul>${page.links.map((l) => `<li>${link(lang, l.path, l.label)}</li>`).join('')}</ul>`);
  parts.push('</main>');
  const other = page.versions.filter((v) => v.lang !== lang);
  if (other.length) {
    parts.push(`<footer class="seo-shell-footer"><ul>${other.map((v) => `<li><a href="${escapeHtml(v.path)}" hreflang="${v.lang}" lang="${v.lang}">${escapeHtml(text(v.lang, 'seo.languageName'))}</a></li>`).join('')}</ul></footer>`);
  }
  parts.push('</div>');
  return parts.join('');
}

export function renderPage(templateFile, page) {
  const html = readTemplate(templateFile);
  const dir = RTL_LANGUAGES.includes(page.lang) ? 'rtl' : 'ltr';
  return html
    .replace(/<html[^>]*>/, `<html lang="${page.lang}" dir="${dir}">`)
    .replace(/<title>[\s\S]*?<\/title>/, () => headTags(page))
    .replace('<div id="root"></div>', () => (page.private ? '<div id="root"></div>' : `<div id="root">${body(page)}</div>`));
}

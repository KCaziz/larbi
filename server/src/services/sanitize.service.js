import sanitizeHtml from 'sanitize-html';

// Rich text written in the CMS is stored as HTML and later shown to learners /
// readers, so it is sanitised on the server at save time with a strict
// allow-list (no script, style, iframe, images, event handlers, javascript: links).
// Same rules for formations now and for articles later.
const RICH_TEXT = {
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a', 'hr'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow', target: '_blank' }),
  },
};

export function richTextToPlain(html) {
  return sanitizeHtml(html ?? '', { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;|&#160;/g, ' ')
    .trim();
}

// Returns sanitised HTML, or null when there is no visible text (an empty editor
// produces "<p></p>", which must count as "no content").
export function sanitizeRichText(html) {
  if (typeof html !== 'string') return null;
  const clean = sanitizeHtml(html, RICH_TEXT).trim();
  return richTextToPlain(clean) ? clean : null;
}

import { useEffect } from 'react';

const SUFFIX = ' · FINCLUDIA';

// Sets the tab title and the description meta tag of the current page (SEO,
// sharing) and restores the previous values when the page is left.
// The server sends the same title and description in the page itself
// (server/src/seo, P12-06), for search engines and link previews that do not
// run JavaScript; this hook keeps them right while the visitor moves from page
// to page. `suffix: false` for a title that already names FINCLUDIA (home).
export function useDocumentMeta(title, description, { suffix = true } = {}) {
  useEffect(() => {
    if (!title) return undefined;
    const previousTitle = document.title;
    document.title = suffix ? `${title}${SUFFIX}` : title;

    let tag = document.head.querySelector('meta[name="description"]');
    const created = !tag;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    const previousDescription = tag.getAttribute('content');
    if (description) tag.setAttribute('content', description);

    return () => {
      document.title = previousTitle;
      if (created) tag.remove();
      else if (previousDescription === null) tag.removeAttribute('content');
      else tag.setAttribute('content', previousDescription);
    };
  }, [title, description, suffix]);
}

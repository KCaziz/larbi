import { useEffect } from 'react';

const SUFFIX = ' · Larbi';

// Sets the tab title and the description meta tag of the current page (SEO,
// sharing) and restores the previous values when the page is left.
// Single-page app: search engines that do not run JavaScript see the default
// values of index.html, not these (server-side rendering is out of scope).
export function useDocumentMeta(title, description) {
  useEffect(() => {
    if (!title) return undefined;
    const previousTitle = document.title;
    document.title = `${title}${SUFFIX}`;

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
  }, [title, description]);
}

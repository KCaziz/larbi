import { useEffect } from 'react';

// « Quand je clique sur un bouton, la page défile jusqu'au résultat » (SUIVI_RECETTE R3-05),
// once for the whole application instead of page by page.
//
// After a click on a button of the page, for a short moment we watch for what it
// makes appear: a form it opens, or a message (`role="status"` / `role="alert"`)
// it produces. If that is out of sight, the page scrolls to it and, for a form,
// puts the focus on its first field. A submit button only reveals a message, never
// a form (the form it sends is already on screen). Nothing moves when the new
// content is already visible, and the smooth scroll gives way to
// `prefers-reduced-motion`.
const WATCH_MS = 700;
const NEW_FORM = 'form, [data-reveal]';
const NEW_MESSAGE = '[role="status"], [role="alert"], .form-status, .form-error';
const FIELD = 'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])';

const fullyVisible = (element) => {
  const box = element.getBoundingClientRect();
  return box.top >= 0 && box.bottom <= (window.innerHeight || document.documentElement.clientHeight);
};

function reveal(element, { focusField }) {
  if (!fullyVisible(element)) {
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    element.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
  }
  if (focusField) element.querySelector?.(FIELD)?.focus({ preventScroll: true });
}

export function useRevealOnAction() {
  useEffect(() => {
    let observer = null;
    let timer = null;
    const stop = () => {
      observer?.disconnect();
      observer = null;
      clearTimeout(timer);
    };

    const onClick = (event) => {
      const button = event.target instanceof Element ? event.target.closest('button, [role="button"]') : null;
      const main = document.querySelector('main');
      if (!button || !main || !main.contains(button) || button.disabled) return;
      const submit = button.type === 'submit';
      stop();
      observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (!(node instanceof Element)) continue;
            const wanted = submit ? NEW_MESSAGE : `${NEW_FORM}, ${NEW_MESSAGE}`;
            const found = node.matches(wanted) ? node : node.querySelector(wanted);
            if (found) {
              // Let the new content take its place before measuring it.
              requestAnimationFrame(() => reveal(found, { focusField: found.matches(NEW_FORM) }));
              stop();
              return;
            }
          }
        }
      });
      observer.observe(main, { childList: true, subtree: true });
      timer = setTimeout(stop, WATCH_MS);
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      stop();
    };
  }, []);
}

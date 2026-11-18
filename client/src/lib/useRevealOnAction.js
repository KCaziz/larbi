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
// Recette R18 (2026-11-18): « quand je clique sur Ajouter une enveloppe, je
// veux que la page défile jusqu'au formulaire, et ce dans tous les boutons qui
// génèrent un élément ». Watched longer (a form that waits for its lists came
// after the 0.7 s of before), a part opened by its `hidden`/`open` attribute
// counts too, and the bar fixed at the top of the screen is never left over
// what is shown.
const WATCH_MS = 2000;
const NEW_FORM = 'form, [data-reveal]';
const NEW_MESSAGE = '[role="status"], [role="alert"], .form-status, .form-error';
const FIELD = 'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])';

const topBar = () => document.querySelector('.app-topbar, .shared-topbar')?.getBoundingClientRect().height ?? 0;

const fullyVisible = (element) => {
  const box = element.getBoundingClientRect();
  return box.top >= topBar() && box.bottom <= (window.innerHeight || document.documentElement.clientHeight);
};

function reveal(element, { focusField }) {
  if (!fullyVisible(element)) {
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const bar = topBar();
    const box = element.getBoundingClientRect();
    const room = (window.innerHeight || document.documentElement.clientHeight) - bar;
    // A form taller than the screen shows from its top; a smaller one, centred.
    const offset = box.height > room * 0.8 ? 16 : Math.max(16, (room - box.height) / 2);
    window.scrollTo({ top: Math.max(0, window.scrollY + box.top - bar - offset), behavior: calm ? 'auto' : 'smooth' });
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
          // A part shown by an attribute (`hidden` removed, <details open>).
          if (!submit && mutation.type === 'attributes' && mutation.target instanceof Element && !mutation.target.hidden && mutation.target.matches(`${NEW_FORM}, details[open]`)) {
            const shown = mutation.target;
            requestAnimationFrame(() => reveal(shown, { focusField: false }));
            stop();
            return;
          }
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
      observer.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'open'] });
      timer = setTimeout(stop, WATCH_MS);
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      stop();
    };
  }, []);
}

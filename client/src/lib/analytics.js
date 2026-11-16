// Google Analytics 4 (P12-06). Nothing is loaded and nothing leaves the
// browser unless BOTH are true:
//   - an administrator set a measurement identifier (Admin → Paramètres);
//   - the visitor accepted the measurement in the consent banner.
// The visitor's answer is kept in this browser and can be changed at any time
// from the footer ("Cookies").
const CONSENT_KEY = 'fincludia.analytics';
export const CONSENT_EVENT = 'fincludia:analytics-consent';
export const CONSENT_OPEN_EVENT = 'fincludia:analytics-open';

let activeId = null;

export function readConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function saveConsent(value) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Private browsing: the answer lasts until the tab is closed.
  }
  if (value !== 'granted') stopAnalytics();
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function startAnalytics(id) {
  if (!id || activeId === id) return;
  activeId = id;
  window[`ga-disable-${id}`] = false;
  window.dataLayer = window.dataLayer || [];
  // gtag must push the `arguments` object itself, as Google's snippet does.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // Page views are sent by trackPage(): the website changes page without
  // reloading, Analytics would only see the first one.
  window.gtag('config', id, { send_page_view: false });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

// Withdrawn consent: Analytics stops at once and its cookies are removed.
function stopAnalytics() {
  if (activeId) window[`ga-disable-${activeId}`] = true;
  activeId = null;
  const domain = window.location.hostname.replace(/^www\./, '');
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (name === '_ga' || name.startsWith('_ga_')) {
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
    }
  }
}

export function trackPage(path) {
  if (!activeId || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path, page_location: window.location.href, page_title: document.title });
}

// What the platform wants to count (sign-ups, contact requests…). Never any
// personal data in `params`: names of things, not of people.
export function track(name, params = {}) {
  if (!activeId || !window.gtag) return;
  window.gtag('event', name, params);
}

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import { usePublicSettings } from '../../lib/publicSettings.js';
import { useLocalePath } from '../../i18n/useLocalePath.js';
import { CONSENT_EVENT, CONSENT_OPEN_EVENT, readConsent, saveConsent, startAnalytics, trackPage } from '../../lib/analytics.js';
import Button from '../ui/Button.jsx';
import './Analytics.css';

function useConsent() {
  const [consent, setConsent] = useState(readConsent);
  useEffect(() => {
    const update = () => setConsent(readConsent());
    window.addEventListener(CONSENT_EVENT, update);
    return () => window.removeEventListener(CONSENT_EVENT, update);
  }, []);
  return consent;
}

// Starts Analytics when it is configured and accepted, and counts each page
// the person opens (P12-06). No interface: used by every window of the site.
export function AnalyticsTracker() {
  const settings = usePublicSettings();
  const id = settings.status === 'ready' ? settings.data.gaMeasurementId : '';
  const consent = useConsent();
  const location = useLocation();
  const active = Boolean(id) && consent === 'granted';

  useEffect(() => {
    if (active) startAnalytics(id);
  }, [active, id]);

  useEffect(() => {
    if (!active) return undefined;
    // After the page has set its own title.
    const timer = window.setTimeout(() => trackPage(`${location.pathname}${location.search}`), 300);
    return () => window.clearTimeout(timer);
  }, [active, location.pathname, location.search]);

  return null;
}

// The consent banner of the public site: shown once, only when Analytics is
// configured. Refusing is as easy as accepting, and nothing is loaded before
// an answer.
export default function AnalyticsConsent() {
  const { t } = useTranslation();
  const localePath = useLocalePath();
  const settings = usePublicSettings();
  const id = settings.status === 'ready' ? settings.data.gaMeasurementId : '';
  const consent = useConsent();
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  const answer = (value) => {
    saveConsent(value);
    setReopened(false);
  };

  return (
    <>
      <AnalyticsTracker />
      {id && (consent === null || reopened) && (
        <section className="analytics-consent" role="region" aria-labelledby="analytics-consent-title">
          <BarChart3 className="analytics-consent-icon" size={22} strokeWidth={1.75} aria-hidden="true" />
          <div className="analytics-consent-text">
            <h2 id="analytics-consent-title">{t('analytics.title')}</h2>
            <p>
              {t('analytics.body')}{' '}
              <Link to={localePath('/confidentialite')}>{t('analytics.more')}</Link>
            </p>
          </div>
          <div className="analytics-consent-actions">
            <Button type="button" variant="secondary" onClick={() => answer('denied')}>
              {t('analytics.refuse')}
            </Button>
            <Button type="button" onClick={() => answer('granted')}>{t('analytics.accept')}</Button>
          </div>
        </section>
      )}
    </>
  );
}

// "Cookies" in the footer: brings the banner back to change one's answer.
export function AnalyticsSettingsLink({ className }) {
  const { t } = useTranslation();
  const settings = usePublicSettings();
  if (settings.status !== 'ready' || !settings.data.gaMeasurementId) return null;
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}>
      {t('analytics.manage')}
    </button>
  );
}
